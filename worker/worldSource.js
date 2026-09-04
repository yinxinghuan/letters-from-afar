import { DurableObject } from 'cloudflare:workers'

const RULESET = 'letters-from-afar-slice-v1'
const ROUTES = new Set(['drift-saltmarsh', 'drift-north-ferry', 'saltmarsh-highway'])
const LOCATIONS = new Set(['old-post-office', 'drift-harbor', 'saltmarsh-causeway', 'north-ferry', 'old-highway-lodge'])

const json = (value, status = 200) => Response.json(value, { status })
const fail = (code, status = 400, extra = {}) => json({ accepted: false, code, ...extra }, status)
const clean = (value, max = 120) => String(value || '').trim().slice(0, max)
const worldKey = (env, value) => env.LAB_MODE === 'true' ? clean(value, 64) || 'main' : 'main'

function initialArchive() {
  return {
    schemaVersion: 1,
    worldId: 'letters-from-afar-main',
    rulesetId: RULESET,
    version: 1,
    cursor: 0,
    traces: [],
    relayLetters: [
      { id: 'relay-drift-to-ferry-01', originId: 'old-post-office', destinationId: 'north-ferry', status: 'waiting', version: 1 },
      { id: 'relay-salt-to-lodge-01', originId: 'saltmarsh-causeway', destinationId: 'old-highway-lodge', status: 'waiting', version: 1 },
    ],
    routes: [
      { id: 'drift-saltmarsh', contribution: 0, contributorIds: [], level: 0, version: 1 },
      { id: 'drift-north-ferry', contribution: 0, contributorIds: [], level: 0, version: 1 },
      { id: 'saltmarsh-highway', contribution: 0, contributorIds: [], level: 0, version: 1 },
    ],
    events: [],
    processedActions: [],
  }
}

function level(contribution) {
  if (contribution >= 12) return 3
  if (contribution >= 6) return 2
  if (contribution >= 3) return 1
  return 0
}

function actorOf(action) {
  return { id: clean(action.actor.id, 100), name: clean(action.actor.name, 40) || 'Traveler', ...(action.actor.avatarUrl ? { avatarUrl: clean(action.actor.avatarUrl, 500) } : {}) }
}

function makeEvent(archive, action, type, entityId, payload = {}) {
  return { id: `${action.actionId}:event:${type}`, seq: archive.cursor + 1, worldVersion: archive.version + 1, actionId: action.actionId, actor: actorOf(action), type, entityId, payload, createdAt: action.createdAt }
}

function makeReceipt(action, relayId, operation) {
  return { id: `${action.actionId}:receipt:${operation}`, actionId: action.actionId, userId: action.actor.id, relayId, operation, createdAt: action.createdAt }
}

function applyAction(archive, action) {
  const traces = archive.traces.filter((trace) => trace.expiresAt > action.createdAt).map((trace) => ({ ...trace, author: { ...trace.author } }))
  const relays = archive.relayLetters.map((relay) => ({ ...relay }))
  const routes = archive.routes.map((route) => ({ ...route, contributorIds: [...route.contributorIds] }))
  let events = []
  let receipts = []

  if (action.type === 'leave_trace') {
    if (!ROUTES.has(action.payload.routeId) || !LOCATIONS.has(action.payload.locationId)) throw { code: 'INVALID_ACTION' }
    if (traces.some((trace) => trace.author.id === action.actor.id && trace.routeId === action.payload.routeId && trace.kind === action.payload.kind && action.createdAt - trace.createdAt < 6 * 60 * 60 * 1000)) throw { code: 'INVALID_ACTION' }
    const trace = { id: `${action.actionId}:trace`, routeId: action.payload.routeId, locationId: action.payload.locationId, kind: action.payload.kind, author: actorOf(action), createdAt: action.createdAt, expiresAt: action.createdAt + 72 * 60 * 60 * 1000 }
    traces.push(trace)
    events = [makeEvent(archive, action, 'trace_left', trace.id, { routeId: trace.routeId, locationId: trace.locationId, kind: trace.kind, expiresAt: trace.expiresAt })]
  } else if (action.type === 'claim_relay') {
    const relay = relays.find((entry) => entry.id === action.payload.relayId)
    if (!relay) throw { code: 'ENTITY_NOT_FOUND' }
    if (relay.status !== 'waiting') throw { code: 'RELAY_UNAVAILABLE' }
    relay.status = 'carried'; relay.holderUserId = action.actor.id; relay.version += 1
    receipts = [makeReceipt(action, relay.id, 'add')]
    events = [makeEvent(archive, action, 'relay_claimed', relay.id, { destinationId: relay.destinationId })]
  } else if (action.type === 'deliver_relay') {
    const relay = relays.find((entry) => entry.id === action.payload.relayId)
    if (!relay) throw { code: 'ENTITY_NOT_FOUND' }
    if (relay.status !== 'carried' || relay.holderUserId !== action.actor.id) throw { code: 'NOT_RELAY_HOLDER' }
    if (relay.destinationId !== action.payload.locationId) throw { code: 'WRONG_DESTINATION' }
    relay.status = 'delivered'; delete relay.holderUserId; relay.deliveredByUserId = action.actor.id; relay.version += 1
    receipts = [makeReceipt(action, relay.id, 'remove')]
    events = [makeEvent(archive, action, 'relay_delivered', relay.id, { destinationId: relay.destinationId })]
  } else if (action.type === 'contribute_route') {
    const route = routes.find((entry) => entry.id === action.payload.routeId)
    if (!route) throw { code: 'ENTITY_NOT_FOUND' }
    if (route.contributorIds.includes(action.actor.id)) throw { code: 'INVALID_ACTION' }
    route.contribution += 1; route.contributorIds.push(action.actor.id); route.level = level(route.contribution); route.version += 1
    events = [makeEvent(archive, action, 'route_contributed', route.id, { contribution: route.contribution, level: route.level })]
  } else {
    throw { code: 'INVALID_ACTION' }
  }

  const next = {
    ...archive,
    version: archive.version + 1,
    cursor: archive.cursor + events.length,
    traces,
    relayLetters: relays,
    routes,
    events: [...archive.events, ...events].slice(-300),
    processedActions: [...archive.processedActions, { id: action.actionId, eventIds: events.map((entry) => entry.id), receiptIds: receipts.map((entry) => entry.id) }].slice(-800),
  }
  return { archive: next, events, receipts }
}

export class LettersWorld extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env)
    this.ctx = ctx
    this.env = env
    this.sql = ctx.storage.sql
    this.sql.exec('CREATE TABLE IF NOT EXISTS world (world_key TEXT PRIMARY KEY, snapshot_json TEXT NOT NULL, updated_at INTEGER NOT NULL)')
    this.sql.exec('CREATE TABLE IF NOT EXISTS action_result_cache (action_id TEXT PRIMARY KEY, response_json TEXT NOT NULL)')
    this.sql.exec('CREATE TABLE IF NOT EXISTS grant_receipt (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, receipt_json TEXT NOT NULL, created_at INTEGER NOT NULL, acknowledged_at INTEGER)')
  }

  getWorld(key, now) {
    const row = [...this.sql.exec('SELECT snapshot_json FROM world WHERE world_key = ?', key)][0]
    if (row) return JSON.parse(row.snapshot_json)
    const archive = initialArchive()
    this.sql.exec('INSERT INTO world (world_key, snapshot_json, updated_at) VALUES (?, ?, ?)', key, JSON.stringify(archive), now)
    return archive
  }

  save(key, action, result, response) {
    this.ctx.storage.transactionSync(() => {
      this.sql.exec('UPDATE world SET snapshot_json = ?, updated_at = ? WHERE world_key = ?', JSON.stringify(result.archive), action.createdAt, key)
      for (const receipt of result.receipts) this.sql.exec('INSERT INTO grant_receipt (id, user_id, receipt_json, created_at) VALUES (?, ?, ?, ?)', receipt.id, receipt.userId, JSON.stringify(receipt), receipt.createdAt)
      this.sql.exec('INSERT INTO action_result_cache (action_id, response_json) VALUES (?, ?)', action.actionId, JSON.stringify(response))
    })
  }

  async fetch(request) {
    const url = new URL(request.url)
    const now = Date.now()
    if (request.method === 'POST' && url.pathname === '/api/world/ensure') {
      const body = await request.json().catch(() => ({}))
      const archive = this.getWorld(worldKey(this.env, body.world_key), now)
      if (body.ruleset_id && body.ruleset_id !== archive.rulesetId) return fail('RULESET_MISMATCH', 409)
      return json({ world_id: archive.worldId, version: archive.version, cursor: archive.cursor, server_time: now })
    }
    if (request.method === 'GET' && url.pathname === '/api/world/state') {
      const archive = this.getWorld(worldKey(this.env, url.searchParams.get('world_key')), now)
      const after = Math.max(0, Number(url.searchParams.get('after_cursor')) || 0)
      const limit = Math.max(1, Math.min(200, Number(url.searchParams.get('event_limit')) || 50))
      const pending = archive.events.filter((entry) => entry.seq > after)
      return json({ snapshot: archive, events: pending.slice(0, limit), has_more_events: pending.length > limit, server_time: now })
    }
    if (request.method === 'POST' && url.pathname === '/api/world/action') {
      if (this.env.LAB_MODE !== 'true' && this.env.PUBLIC_BETA !== 'true') return fail('AUTH_REQUIRED', 401)
      const body = await request.json().catch(() => ({}))
      const actorId = clean(body.user_id || body.telegram_id, 100)
      const actionId = clean(body.action_id, 100)
      if (!actorId || actorId === '__alteru_guest__') return fail('AUTH_REQUIRED', 401)
      if (!actionId) return fail('INVALID_ACTION')
      const cached = [...this.sql.exec('SELECT response_json FROM action_result_cache WHERE action_id = ?', actionId)][0]
      if (cached) return json({ ...JSON.parse(cached.response_json), duplicate: true })
      const key = worldKey(this.env, body.world_key)
      const archive = this.getWorld(key, now)
      if (body.ruleset_id !== archive.rulesetId) return fail('RULESET_MISMATCH', 409)
      if (Number(body.expected_version) !== archive.version) return fail('VERSION_CONFLICT', 409, { current_version: archive.version, cursor: archive.cursor })
      const action = { actionId, actor: { id: actorId, name: clean(body.actor_profile?.name, 40) || 'Traveler', ...(body.actor_profile?.avatar_url ? { avatarUrl: clean(body.actor_profile.avatar_url, 500) } : {}) }, createdAt: now, type: clean(body.type, 40), payload: body.payload || {} }
      let result
      try { result = applyAction(archive, action) } catch (error) {
        const code = error?.code || 'INVALID_ACTION'
        return fail(code, ['VERSION_CONFLICT', 'RELAY_UNAVAILABLE'].includes(code) ? 409 : code === 'AUTH_REQUIRED' ? 401 : 400)
      }
      const response = { accepted: true, duplicate: false, code: 'COMMITTED', snapshot: result.archive, committed_events: result.events, grant_receipts: result.receipts, server_time: now }
      this.save(key, action, result, response)
      return json(response)
    }
    if (request.method === 'GET' && url.pathname === '/api/world/grants') {
      const userId = clean(url.searchParams.get('user_id'), 100)
      if (!userId || userId === '__alteru_guest__') return fail('AUTH_REQUIRED', 401)
      const rows = [...this.sql.exec('SELECT receipt_json FROM grant_receipt WHERE user_id = ? AND acknowledged_at IS NULL ORDER BY created_at ASC', userId)]
      return json({ receipts: rows.map((row) => JSON.parse(row.receipt_json)) })
    }
    if (request.method === 'POST' && url.pathname === '/api/world/grant/ack') {
      const body = await request.json().catch(() => ({}))
      const userId = clean(body.user_id || body.telegram_id, 100)
      const receiptId = clean(body.receipt_id, 140)
      if (!userId || !receiptId || userId === '__alteru_guest__') return fail('AUTH_REQUIRED', 401)
      this.sql.exec('UPDATE grant_receipt SET acknowledged_at = ? WHERE id = ? AND user_id = ?', now, receiptId, userId)
      return json({ ok: true, receipt_id: receiptId })
    }
    if (request.method === 'POST' && url.pathname === '/api/world/lab/reset' && this.env.LAB_MODE === 'true') {
      const body = await request.json().catch(() => ({}))
      const key = worldKey(this.env, body.world_key)
      const archive = initialArchive()
      this.ctx.storage.transactionSync(() => {
        this.sql.exec('DELETE FROM action_result_cache')
        this.sql.exec('DELETE FROM grant_receipt')
        this.sql.exec('UPDATE world SET snapshot_json = ?, updated_at = ? WHERE world_key = ?', JSON.stringify(archive), now, key)
      })
      return json({ ok: true, snapshot: archive })
    }
    return new Response('Not Found', { status: 404 })
  }
}

export async function handleWorldApi(request, env) {
  const url = new URL(request.url)
  if (request.method === 'GET' && url.pathname === '/api/health') return json({ ok: true, service: 'letters-from-afar', storage: 'durable-object-sqlite', identity_mode: env.LAB_MODE === 'true' ? 'unverified-staging' : env.PUBLIC_BETA === 'true' ? 'unverified-production-beta' : 'writes-disabled' })
  if (!url.pathname.startsWith('/api/world/')) return new Response('Not Found', { status: 404 })
  let key = worldKey(env, url.searchParams.get('world_key'))
  if (request.method === 'POST') {
    const body = await request.clone().json().catch(() => ({}))
    key = worldKey(env, body.world_key || key)
  }
  return env.WORLD.get(env.WORLD.idFromName(key)).fetch(request)
}
