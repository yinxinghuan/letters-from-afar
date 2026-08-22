import assert from 'node:assert/strict'
import { commitSharedWorldAction, createSharedWorld, readSharedWorld } from '../src/shared-world/engine'
import { SharedWorldRuleError, type PublicTraveler, type SharedWorldAction } from '../src/shared-world/types'
import { lettersFromAfar } from '../src/story/cartridges/lettersFromAfar'
import { createInitialSave } from '../src/story/engine/reducer'
import { applyRelayReceiptToSave } from '../src/shared-world/receipt'

const ada: PublicTraveler = { id: 'user-a', name: 'Ada' }
const ben: PublicTraveler = { id: 'user-b', name: 'Ben' }
const action = (world: ReturnType<typeof createSharedWorld>, actor: PublicTraveler, id: string, type: SharedWorldAction['type'], payload: any): SharedWorldAction => ({ actionId: id, actor, expectedVersion: world.version, rulesetId: world.rulesetId, createdAt: 1_800_000_000_000, type, payload } as SharedWorldAction)

let world = createSharedWorld(1_800_000_000_000)
const claimA = action(world, ada, 'claim-01', 'claim_relay', { relayId: 'relay-drift-to-ferry-01' })
const first = commitSharedWorldAction(world, claimA)
assert.equal(first.receipts.length, 1)
assert.equal(first.receipts[0].operation, 'add')
let privateSave = applyRelayReceiptToSave(createInitialSave(lettersFromAfar), first.receipts[0], 'zh')
assert.ok(privateSave.inventory.some((item) => item.id === 'shared-relay:relay-drift-to-ferry-01'), 'add receipt enters the private authoritative pack before acknowledgement')
world = first.archive

const duplicate = commitSharedWorldAction(world, claimA)
assert.equal(duplicate.code, 'DUPLICATE_ACTION')
assert.equal(duplicate.archive.version, world.version, 'retrying the same action id never commits twice')
assert.equal(duplicate.receipts.length, 0, 'duplicate response cannot issue a second inventory receipt')

const staleClaimB = action(createSharedWorld(1_800_000_000_000), ben, 'claim-02', 'claim_relay', { relayId: 'relay-drift-to-ferry-01' })
assert.throws(() => commitSharedWorldAction(world, staleClaimB), (error) => error instanceof SharedWorldRuleError && error.code === 'VERSION_CONFLICT')
const refreshedClaimB = action(world, ben, 'claim-02', 'claim_relay', { relayId: 'relay-drift-to-ferry-01' })
assert.throws(() => commitSharedWorldAction(world, refreshedClaimB), (error) => error instanceof SharedWorldRuleError && error.code === 'RELAY_UNAVAILABLE')

const wrongDelivery = action(world, ada, 'deliver-wrong', 'deliver_relay', { relayId: 'relay-drift-to-ferry-01', locationId: 'saltmarsh-causeway' })
assert.throws(() => commitSharedWorldAction(world, wrongDelivery), (error) => error instanceof SharedWorldRuleError && error.code === 'WRONG_DESTINATION')
const delivered = commitSharedWorldAction(world, action(world, ada, 'deliver-right', 'deliver_relay', { relayId: 'relay-drift-to-ferry-01', locationId: 'north-ferry' }))
assert.equal(delivered.receipts[0].operation, 'remove')
privateSave = applyRelayReceiptToSave(privateSave, delivered.receipts[0], 'zh')
assert.ok(!privateSave.inventory.some((item) => item.id === 'shared-relay:relay-drift-to-ferry-01'), 'remove receipt leaves the private pack on delivery')
world = delivered.archive

const traced = commitSharedWorldAction(world, action(world, ben, 'trace-01', 'leave_trace', { routeId: 'drift-saltmarsh', locationId: 'saltmarsh-causeway', kind: 'passable' }))
world = traced.archive
assert.equal(readSharedWorld(world, 1_800_000_000_001).traces.length, 1)
assert.equal(readSharedWorld(world, 1_800_000_000_000 + 73 * 60 * 60 * 1000).traces.length, 0, 'temporary traces expire instead of becoming permanent fiction')

const contribution = commitSharedWorldAction(world, action(world, ada, 'route-01', 'contribute_route', { routeId: 'drift-saltmarsh', amount: 1 }))
world = contribution.archive
const duplicateContribution = action(world, ada, 'route-02', 'contribute_route', { routeId: 'drift-saltmarsh', amount: 1 })
assert.throws(() => commitSharedWorldAction(world, duplicateContribution), (error) => error instanceof SharedWorldRuleError && error.code === 'INVALID_ACTION')

assert.equal(world.relayLetters.find((relay) => relay.id === 'relay-drift-to-ferry-01')?.status, 'delivered')
assert.equal(world.routes.find((route) => route.id === 'drift-saltmarsh')?.contributorIds.length, 1)
console.log('Letters from Afar shared world: idempotency, two-account race, receipts, expiry and contribution caps passed.')
