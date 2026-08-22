import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import vm from 'node:vm'

let source = await readFile(new URL('../worker/index.js', import.meta.url), 'utf8')
source = source
  .replace("import { DurableObject } from 'cloudflare:workers'", '')
  .replace('export class LettersWorld', 'class LettersWorld')
  .replace('export async function handleApi', 'async function handleApi')
source += '\nglobalThis.__rules = { initialArchive, applyAction, worldKey };'

const sandbox = { URL, Response, DurableObject: class {}, globalThis: {} }
vm.runInNewContext(source, sandbox)
const { initialArchive, applyAction, worldKey } = sandbox.globalThis.__rules

assert.equal(worldKey({ LAB_MODE: 'false' }, 'attacker-room'), 'main')
assert.equal(worldKey({ LAB_MODE: 'true' }, 'qa-room'), 'qa-room')

const base = initialArchive()
const claim = applyAction(base, {
  actionId: 'claim-a', actor: { id: 'traveler-a', name: 'Alex' }, createdAt: 1000,
  type: 'claim_relay', payload: { relayId: 'relay-drift-to-ferry-01' },
})
assert.equal(claim.archive.relayLetters[0].holderUserId, 'traveler-a')
assert.equal(claim.receipts[0].operation, 'add')
assert.throws(() => applyAction(claim.archive, {
  actionId: 'claim-b', actor: { id: 'traveler-b', name: 'Sam' }, createdAt: 1001,
  type: 'claim_relay', payload: { relayId: 'relay-drift-to-ferry-01' },
}), (error) => error.code === 'RELAY_UNAVAILABLE')

assert.throws(() => applyAction(claim.archive, {
  actionId: 'wrong-stop', actor: { id: 'traveler-a', name: 'Alex' }, createdAt: 1100,
  type: 'deliver_relay', payload: { relayId: 'relay-drift-to-ferry-01', locationId: 'saltmarsh-causeway' },
}), (error) => error.code === 'WRONG_DESTINATION')

const delivered = applyAction(claim.archive, {
  actionId: 'deliver-a', actor: { id: 'traveler-a', name: 'Alex' }, createdAt: 1200,
  type: 'deliver_relay', payload: { relayId: 'relay-drift-to-ferry-01', locationId: 'north-ferry' },
})
assert.equal(delivered.archive.relayLetters[0].status, 'delivered')
assert.equal(delivered.receipts[0].operation, 'remove')

const traced = applyAction(base, {
  actionId: 'trace-a', actor: { id: 'traveler-a', name: 'Alex' }, createdAt: 2000,
  type: 'leave_trace', payload: { routeId: 'drift-saltmarsh', locationId: 'saltmarsh-causeway', kind: 'passable' },
})
assert.equal(traced.archive.traces.length, 1)
assert.throws(() => applyAction(traced.archive, {
  actionId: 'trace-repeat', actor: { id: 'traveler-a', name: 'Alex' }, createdAt: 2100,
  type: 'leave_trace', payload: { routeId: 'drift-saltmarsh', locationId: 'saltmarsh-causeway', kind: 'passable' },
}), (error) => error.code === 'INVALID_ACTION')

assert.match(source, /action_result_cache/)
assert.match(source, /expected_version/)
assert.match(source, /RULESET_MISMATCH/)
assert.match(source, /grant_receipt/)
assert.match(source, /acknowledged_at/)
assert.match(source, /__alteru_guest__/)

console.log('Letters from Afar worker: relay race, destination, trace limit, idempotency cache and receipt store passed.')
