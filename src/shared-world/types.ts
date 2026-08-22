export interface PublicTraveler {
  id: string
  name: string
  avatarUrl?: string
}

export type RouteTraceKind = 'passable' | 'hazard' | 'shelter' | 'supplies'
export type RelayStatus = 'waiting' | 'carried' | 'delivered'

export interface TravelerTrace {
  id: string
  routeId: string
  locationId: string
  kind: RouteTraceKind
  author: PublicTraveler
  createdAt: number
  expiresAt: number
}

export interface RelayLetter {
  id: string
  originId: string
  destinationId: string
  status: RelayStatus
  holderUserId?: string
  deliveredByUserId?: string
  version: number
}

export interface SharedRoute {
  id: string
  contribution: number
  contributorIds: string[]
  level: 0 | 1 | 2 | 3
  version: number
}

export type SharedEventType = 'trace_left' | 'relay_claimed' | 'relay_delivered' | 'route_contributed'

export interface SharedWorldEvent {
  id: string
  seq: number
  worldVersion: number
  actionId: string
  actor: PublicTraveler
  type: SharedEventType
  entityId: string
  payload: Record<string, unknown>
  createdAt: number
}

export interface ProcessedAction {
  id: string
  eventIds: string[]
  receiptIds: string[]
}

export interface SharedWorldArchive {
  schemaVersion: 1
  worldId: 'letters-from-afar-main'
  rulesetId: 'letters-from-afar-slice-v1'
  version: number
  cursor: number
  traces: TravelerTrace[]
  relayLetters: RelayLetter[]
  routes: SharedRoute[]
  events: SharedWorldEvent[]
  processedActions: ProcessedAction[]
}

export interface RelayReceipt {
  id: string
  actionId: string
  userId: string
  relayId: string
  operation: 'add' | 'remove'
  createdAt: number
}

export interface SharedWorldView {
  version: number
  cursor: number
  traces: TravelerTrace[]
  relayLetters: RelayLetter[]
  routes: SharedRoute[]
  recentEvents: SharedWorldEvent[]
}

interface BaseAction {
  actionId: string
  actor: PublicTraveler
  expectedVersion: number
  rulesetId: SharedWorldArchive['rulesetId']
  createdAt: number
}

export type SharedWorldAction =
  | (BaseAction & { type: 'leave_trace'; payload: { routeId: string; locationId: string; kind: RouteTraceKind } })
  | (BaseAction & { type: 'claim_relay'; payload: { relayId: string } })
  | (BaseAction & { type: 'deliver_relay'; payload: { relayId: string; locationId: string } })
  | (BaseAction & { type: 'contribute_route'; payload: { routeId: string; amount: 1 } })

export type CommitCode = 'COMMITTED' | 'DUPLICATE_ACTION' | 'VERSION_CONFLICT' | 'INVALID_ACTION' | 'ENTITY_NOT_FOUND' | 'RELAY_UNAVAILABLE' | 'NOT_RELAY_HOLDER' | 'WRONG_DESTINATION' | 'RULESET_MISMATCH' | 'AUTH_REQUIRED'

export interface SharedCommitResult {
  accepted: boolean
  duplicate: boolean
  code: CommitCode
  archive: SharedWorldArchive
  committedEvents: SharedWorldEvent[]
  receipts: RelayReceipt[]
}

export class SharedWorldRuleError extends Error {
  constructor(public code: Exclude<CommitCode, 'COMMITTED' | 'DUPLICATE_ACTION'>, message: string) {
    super(message)
    this.name = 'SharedWorldRuleError'
  }
}
