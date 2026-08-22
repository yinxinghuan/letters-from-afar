import { commitSharedWorldAction, createSharedWorld, readSharedWorld, rebuildSharedWorld } from './engine'
import type { RelayReceipt, SharedCommitResult, SharedWorldAction, SharedWorldArchive, SharedWorldEvent, SharedWorldView } from './types'

export interface SharedWorldGateway {
  readonly mode: 'local' | 'remote'
  load(afterCursor?: number): Promise<{ archive: SharedWorldArchive; view: SharedWorldView; events: SharedWorldEvent[] }>
  commit(action: SharedWorldAction): Promise<SharedCommitResult>
  pendingReceipts(userId: string): Promise<RelayReceipt[]>
  acknowledgeReceipt(userId: string, receiptId: string): Promise<void>
}

export class LocalSharedWorldGateway implements SharedWorldGateway {
  readonly mode = 'local' as const
  constructor(private key = 'letters-from-afar-shared-world-v1') {}

  private read(): SharedWorldArchive {
    try {
      const raw = alteruLocalStorage.getItem(this.key)
      if (raw) return rebuildSharedWorld(JSON.parse(raw))
    } catch { /* start clean */ }
    const world = createSharedWorld()
    this.write(world)
    return world
  }

  private write(world: SharedWorldArchive) { alteruLocalStorage.setItem(this.key, JSON.stringify(world)) }
  private receiptKey() { return `${this.key}:pending-receipts` }
  private readReceipts(): RelayReceipt[] {
    try { return JSON.parse(alteruLocalStorage.getItem(this.receiptKey()) || '[]') as RelayReceipt[] } catch { return [] }
  }
  private writeReceipts(receipts: RelayReceipt[]) { alteruLocalStorage.setItem(this.receiptKey(), JSON.stringify(receipts)) }

  async load(afterCursor = 0) {
    const archive = this.read()
    return { archive, view: readSharedWorld(archive), events: archive.events.filter((event) => event.seq > afterCursor) }
  }

  async commit(action: SharedWorldAction) {
    const result = commitSharedWorldAction(this.read(), action)
    if (!result.duplicate) {
      this.write(result.archive)
      const known = new Set(this.readReceipts().map((receipt) => receipt.id))
      this.writeReceipts([...this.readReceipts(), ...result.receipts.filter((receipt) => !known.has(receipt.id))])
    }
    return result
  }

  async pendingReceipts(userId: string) { return this.readReceipts().filter((receipt) => receipt.userId === userId) }
  async acknowledgeReceipt(userId: string, receiptId: string) {
    this.writeReceipts(this.readReceipts().filter((receipt) => receipt.id !== receiptId || receipt.userId !== userId))
  }
}

export class RemoteSharedWorldGateway implements SharedWorldGateway {
  readonly mode = 'remote' as const
  constructor(private apiBase: string, private worldKey = 'main') { this.apiBase = apiBase.replace(/\/+$/, '') }

  private async api<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${this.apiBase}${path}`, { ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) } })
    const payload = await response.json().catch(() => ({ code: 'INVALID_ACTION' })) as T & { code?: string }
    if (!response.ok) {
      const error = new Error(payload.code ?? `HTTP_${response.status}`) as Error & { code: string }
      error.code = payload.code ?? 'INVALID_ACTION'
      throw error
    }
    return payload
  }

  async load(afterCursor = 0) {
    await this.api('/api/world/ensure', { method: 'POST', body: JSON.stringify({ world_key: this.worldKey, ruleset_id: 'letters-from-afar-slice-v1' }) })
    const state = await this.api<{ snapshot: unknown; events?: SharedWorldEvent[] }>(`/api/world/state?world_key=${encodeURIComponent(this.worldKey)}&after_cursor=${Math.max(0, afterCursor)}&event_limit=100`)
    const archive = rebuildSharedWorld(state.snapshot)
    return { archive, view: readSharedWorld(archive), events: state.events ?? archive.events.filter((event) => event.seq > afterCursor) }
  }

  async commit(action: SharedWorldAction): Promise<SharedCommitResult> {
    type Response = { duplicate: boolean; snapshot: unknown; committed_events?: SharedWorldEvent[]; grant_receipts?: RelayReceipt[] }
    const request: RequestInit = { method: 'POST', body: JSON.stringify({ world_key: this.worldKey, action_id: action.actionId, user_id: action.actor.id, actor_profile: { name: action.actor.name, avatar_url: action.actor.avatarUrl }, expected_version: action.expectedVersion, ruleset_id: action.rulesetId, type: action.type, payload: action.payload }) }
    const submit = () => this.api<Response>('/api/world/action', request)
    let response: Response
    try { response = await submit() }
    catch (first) {
      if (typeof first === 'object' && first && 'code' in first) throw first
      try { response = await submit() }
      catch (second) {
        if (typeof second === 'object' && second && 'code' in second) throw second
        const latest = await this.load(0).catch(() => null)
        const committedEvents = latest?.events.filter((event) => event.actionId === action.actionId) ?? []
        if (!latest || !committedEvents.length) throw first
        return { accepted: true, duplicate: true, code: 'DUPLICATE_ACTION', archive: latest.archive, committedEvents, receipts: [] }
      }
    }
    const archive = rebuildSharedWorld(response.snapshot)
    return { accepted: true, duplicate: response.duplicate, code: response.duplicate ? 'DUPLICATE_ACTION' : 'COMMITTED', archive, committedEvents: response.committed_events ?? [], receipts: response.grant_receipts ?? [] }
  }

  async pendingReceipts(userId: string) {
    const response = await this.api<{ receipts: RelayReceipt[] }>(`/api/world/grants?user_id=${encodeURIComponent(userId)}`)
    return response.receipts ?? []
  }

  async acknowledgeReceipt(userId: string, receiptId: string) {
    await this.api('/api/world/grant/ack', { method: 'POST', body: JSON.stringify({ user_id: userId, receipt_id: receiptId }) })
  }
}
