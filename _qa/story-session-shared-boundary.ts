import assert from 'node:assert/strict'
import { lettersFromAfar } from '../src/story/cartridges/lettersFromAfar'
import { createInitialSave } from '../src/story/engine/reducer'
import { applyRelayReceiptToSave } from '../src/shared-world/receipt'
import { createStorySessionLab, LETTERS_FROM_AFAR_SAVE_REPAIR_MIGRATION_ID } from '../server/storySessionLab'
import { StorySessionClient, createStorySessionHttpTransport } from '../src/story/session/storySessionClient'

const receipt = { id: 'receipt-qa-add', actionId: 'world-claim-qa', userId: 'owner-a', relayId: 'relay-qa-1', operation: 'add' as const, createdAt: 1_800_000_000_000 }
const initial = applyRelayReceiptToSave(createInitialSave(lettersFromAfar), receipt, 'zh')
const relayProjection = (save: typeof initial) => ({
  items: save.inventory.filter(item => item.id.startsWith('shared-relay:')).map(item => ({ id: item.id, count: item.count })),
  receipts: save.blocks.filter(block => block.id.startsWith('relay-receipt-')).map(block => ({ id: block.id, data: block.data })),
})
const clientFor = (baseUrl: string) => new StorySessionClient(createStorySessionHttpTransport({ apiBase: baseUrl, headers: () => ({ Authorization: 'Bearer token-a' }) }))

const unverified = createStorySessionLab({ cartridge: lettersFromAfar, actorTokens: { 'token-a': 'owner-a' }, generator: { async send(): Promise<never> { throw new Error('unused') } } })
try {
  const { baseUrl } = await unverified.listen()
  await assert.rejects(clientFor(baseUrl).enroll(initial, 'unverified-shared-save'), { code: 'SHARED_AUTHORITY_REQUIRED' })
  assert.equal(unverified.committedCount(), 0)
} finally { await unverified.close() }

let generatorCalls = 0
const service = createStorySessionLab({
  cartridge: lettersFromAfar,
  actorTokens: { 'token-a': 'owner-a' },
  validateSharedEnrollment: (save, owner) => owner === 'owner-a' && save.inventory.some(item => item.id === 'shared-relay:relay-qa-1' && item.count === 1),
  generator: { async send() { generatorCalls += 1; return { content: [
    '你把远行接力信交给旧邮局门口的陌生人，信从行囊里移除。',
    '[inventory: action="remove" item="shared-relay:relay-qa-1" count="1"]',
    '[state: value="追回没有公共回执的接力信"]',
    '[scene_location: location="漂港·旧邮局"]',
    '[choices: "追上旧邮局门口的陌生人"|"检查空出的信袋"]',
  ].join('\n') } } },
})
try {
  const { baseUrl } = await service.listen(); const client = clientFor(baseUrl)
  const enrolled = await client.enroll(initial, 'verified-shared-save')
  assert.deepEqual(relayProjection(enrolled.snapshot), relayProjection(initial))

  const forged = client.prepare(enrolled, '把接力信交给没有公共回执的人', 'private-turn-cannot-remove-receipt')
  await assert.rejects(client.submit(forged), { code: 'SHARED_AUTHORITY_REQUIRED' })
  assert.equal(generatorCalls, 1)
  assert.deepEqual(await client.read(enrolled.session_id), enrolled)
  assert.equal(service.committedCount(), 0)

  const rested = await client.submit(client.prepare(enrolled, '短休', 'private-domain-rest'))
  assert.equal(rested.version, 1)
  assert.deepEqual(relayProjection(rested.snapshot), relayProjection(initial))
  assert.equal(service.committedCount(), 1)

  const migrated = await client.migrate(rested.session_id, LETTERS_FROM_AFAR_SAVE_REPAIR_MIGRATION_ID, rested.version)
  assert.equal(migrated.version, 2)
  assert.equal(migrated.cursor, rested.cursor)
  assert.deepEqual(relayProjection(migrated.snapshot), relayProjection(initial))

  const worldRoute = await fetch(`${baseUrl}/api/world/action`, { method: 'POST', headers: { Authorization: 'Bearer token-a', 'Content-Type': 'application/json' }, body: '{}' })
  assert.equal(worldRoute.status, 404)
  assert.equal((await worldRoute.json()).code, 'NOT_FOUND')

  console.log(JSON.stringify({ ok: true, liveModelCalled: false, productionWrites: false, checks: [
    'shared-marker-enrollment-requires-authority-validation',
    'private-turn-cannot-remove-or-mint-receipt-backed-state',
    'rejected-private-turn-writes-nothing',
    'normal-private-domain-turn-preserves-shared-markers',
    'explicit-private-save-repair-preserves-shared-markers',
    'story-session-lab-does-not-own-world-authority-routes',
  ] }, null, 2))
} finally { await service.close() }
