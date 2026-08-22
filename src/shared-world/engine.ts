import type {
  PublicTraveler,
  RelayReceipt,
  SharedCommitResult,
  SharedRoute,
  SharedWorldAction,
  SharedWorldArchive,
  SharedWorldEvent,
  SharedWorldView,
  TravelerTrace,
} from './types'
import { SharedWorldRuleError } from './types'

const RULESET_ID = 'letters-from-afar-slice-v1' as const
const ROUTES = new Set(['drift-saltmarsh', 'drift-north-ferry', 'saltmarsh-highway'])
const LOCATIONS = new Set(['old-post-office', 'drift-harbor', 'saltmarsh-causeway', 'north-ferry', 'old-highway-lodge'])

function actorOf(action: SharedWorldAction): PublicTraveler {
  return {
    id: action.actor.id.trim().slice(0, 100),
    name: action.actor.name.trim().slice(0, 40) || 'Traveler',
    ...(action.actor.avatarUrl ? { avatarUrl: action.actor.avatarUrl.trim().slice(0, 500) } : {}),
  }
}

export function createSharedWorld(now = Date.now()): SharedWorldArchive {
  return {
    schemaVersion: 1,
    worldId: 'letters-from-afar-main',
    rulesetId: RULESET_ID,
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

export function rebuildSharedWorld(input: unknown): SharedWorldArchive {
  if (!input || typeof input !== 'object') return createSharedWorld()
  const candidate = input as Partial<SharedWorldArchive>
  if (candidate.schemaVersion !== 1 || candidate.rulesetId !== RULESET_ID) return createSharedWorld()
  const seed = createSharedWorld()
  return {
    ...seed,
    version: Math.max(1, Number(candidate.version) || 1),
    cursor: Math.max(0, Number(candidate.cursor) || 0),
    traces: Array.isArray(candidate.traces) ? candidate.traces.filter((trace) => trace.expiresAt > Date.now()).slice(-120) : [],
    relayLetters: Array.isArray(candidate.relayLetters) ? candidate.relayLetters : seed.relayLetters,
    routes: Array.isArray(candidate.routes) ? candidate.routes : seed.routes,
    events: Array.isArray(candidate.events) ? candidate.events.slice(-300) : [],
    processedActions: Array.isArray(candidate.processedActions) ? candidate.processedActions.slice(-800) : [],
  }
}

export function readSharedWorld(archive: SharedWorldArchive, now = Date.now()): SharedWorldView {
  return {
    version: archive.version,
    cursor: archive.cursor,
    traces: archive.traces.filter((trace) => trace.expiresAt > now).map((trace) => ({ ...trace, author: { ...trace.author } })),
    relayLetters: archive.relayLetters.map((relay) => ({ ...relay })),
    routes: archive.routes.map((route) => ({ ...route, contributorIds: [...route.contributorIds] })),
    recentEvents: archive.events.slice(-24).map((event) => ({ ...event, actor: { ...event.actor }, payload: { ...event.payload } })),
  }
}

function event(archive: SharedWorldArchive, action: SharedWorldAction, type: SharedWorldEvent['type'], entityId: string, payload: Record<string, unknown> = {}): SharedWorldEvent {
  return { id: `${action.actionId}:event:${type}`, seq: archive.cursor + 1, worldVersion: archive.version + 1, actionId: action.actionId, actor: actorOf(action), type, entityId, payload, createdAt: action.createdAt }
}

function receipt(action: SharedWorldAction, relayId: string, operation: RelayReceipt['operation']): RelayReceipt {
  return { id: `${action.actionId}:receipt:${operation}`, actionId: action.actionId, userId: action.actor.id, relayId, operation, createdAt: action.createdAt }
}

function validate(archive: SharedWorldArchive, action: SharedWorldAction) {
  const previous = archive.processedActions.find((entry) => entry.id === action.actionId)
  if (previous) return previous
  if (!action.actionId.trim() || !action.actor.id.trim()) throw new SharedWorldRuleError('INVALID_ACTION', 'Missing action or actor identity')
  if (action.rulesetId !== archive.rulesetId) throw new SharedWorldRuleError('RULESET_MISMATCH', 'Ruleset mismatch')
  if (action.expectedVersion !== archive.version) throw new SharedWorldRuleError('VERSION_CONFLICT', `Expected v${action.expectedVersion}; current v${archive.version}`)
  return undefined
}

function routeLevel(contribution: number): 0 | 1 | 2 | 3 {
  if (contribution >= 12) return 3
  if (contribution >= 6) return 2
  if (contribution >= 3) return 1
  return 0
}

function commit(archive: SharedWorldArchive, action: SharedWorldAction, traces: TravelerTrace[], routes: SharedRoute[], events: SharedWorldEvent[], receipts: RelayReceipt[], relayLetters = archive.relayLetters): SharedCommitResult {
  const next: SharedWorldArchive = {
    ...archive,
    version: archive.version + 1,
    cursor: archive.cursor + events.length,
    traces,
    routes,
    relayLetters,
    events: [...archive.events, ...events].slice(-300),
    processedActions: [...archive.processedActions, { id: action.actionId, eventIds: events.map((entry) => entry.id), receiptIds: receipts.map((entry) => entry.id) }].slice(-800),
  }
  return { accepted: true, duplicate: false, code: 'COMMITTED', archive: next, committedEvents: events, receipts }
}

export function commitSharedWorldAction(archive: SharedWorldArchive, action: SharedWorldAction): SharedCommitResult {
  const previous = validate(archive, action)
  if (previous) {
    return {
      accepted: true,
      duplicate: true,
      code: 'DUPLICATE_ACTION',
      archive,
      committedEvents: archive.events.filter((entry) => previous.eventIds.includes(entry.id)),
      receipts: [],
    }
  }

  const traces = archive.traces.filter((trace) => trace.expiresAt > action.createdAt).map((trace) => ({ ...trace, author: { ...trace.author } }))
  const routes = archive.routes.map((route) => ({ ...route, contributorIds: [...route.contributorIds] }))
  const relays = archive.relayLetters.map((relay) => ({ ...relay }))

  if (action.type === 'leave_trace') {
    if (!ROUTES.has(action.payload.routeId) || !LOCATIONS.has(action.payload.locationId)) throw new SharedWorldRuleError('INVALID_ACTION', 'Unknown route or location')
    const recentDuplicate = traces.some((trace) => trace.author.id === action.actor.id && trace.routeId === action.payload.routeId && trace.kind === action.payload.kind && action.createdAt - trace.createdAt < 6 * 60 * 60 * 1000)
    if (recentDuplicate) throw new SharedWorldRuleError('INVALID_ACTION', 'The same traveler cannot repeat this trace within six hours')
    const trace: TravelerTrace = { id: `${action.actionId}:trace`, routeId: action.payload.routeId, locationId: action.payload.locationId, kind: action.payload.kind, author: actorOf(action), createdAt: action.createdAt, expiresAt: action.createdAt + 72 * 60 * 60 * 1000 }
    traces.push(trace)
    const committed = event(archive, action, 'trace_left', trace.id, { routeId: trace.routeId, locationId: trace.locationId, kind: trace.kind, expiresAt: trace.expiresAt })
    return commit(archive, action, traces, routes, [committed], [], relays)
  }

  if (action.type === 'claim_relay') {
    const relay = relays.find((entry) => entry.id === action.payload.relayId)
    if (!relay) throw new SharedWorldRuleError('ENTITY_NOT_FOUND', 'Relay letter not found')
    if (relay.status !== 'waiting') throw new SharedWorldRuleError('RELAY_UNAVAILABLE', 'Relay letter is no longer waiting')
    relay.status = 'carried'
    relay.holderUserId = action.actor.id
    relay.version += 1
    const receipts = [receipt(action, relay.id, 'add')]
    const committed = event(archive, action, 'relay_claimed', relay.id, { destinationId: relay.destinationId })
    return commit(archive, action, traces, routes, [committed], receipts, relays)
  }

  if (action.type === 'deliver_relay') {
    const relay = relays.find((entry) => entry.id === action.payload.relayId)
    if (!relay) throw new SharedWorldRuleError('ENTITY_NOT_FOUND', 'Relay letter not found')
    if (relay.status !== 'carried' || relay.holderUserId !== action.actor.id) throw new SharedWorldRuleError('NOT_RELAY_HOLDER', 'Only the current carrier may deliver this letter')
    if (relay.destinationId !== action.payload.locationId) throw new SharedWorldRuleError('WRONG_DESTINATION', 'Relay letter has not reached its displayed destination')
    relay.status = 'delivered'
    relay.holderUserId = undefined
    relay.deliveredByUserId = action.actor.id
    relay.version += 1
    const receipts = [receipt(action, relay.id, 'remove')]
    const committed = event(archive, action, 'relay_delivered', relay.id, { destinationId: relay.destinationId })
    return commit(archive, action, traces, routes, [committed], receipts, relays)
  }

  if (action.type === 'contribute_route') {
    const route = routes.find((entry) => entry.id === action.payload.routeId)
    if (!route) throw new SharedWorldRuleError('ENTITY_NOT_FOUND', 'Route not found')
    if (route.contributorIds.includes(action.actor.id)) throw new SharedWorldRuleError('INVALID_ACTION', 'One traveler contributes once per route cycle')
    route.contribution += 1
    route.contributorIds.push(action.actor.id)
    route.level = routeLevel(route.contribution)
    route.version += 1
    const committed = event(archive, action, 'route_contributed', route.id, { contribution: route.contribution, level: route.level })
    return commit(archive, action, traces, routes, [committed], [], relays)
  }

  throw new SharedWorldRuleError('INVALID_ACTION', 'Unsupported shared-world action')
}
