import assert from 'node:assert/strict'
import { lettersFromAfar, lettersFromAfarEn } from '../src/story/cartridges/lettersFromAfar'
import { resolveDeterministicChoiceTurn, resolveDeterministicOpeningTurn } from '../src/story/engine/authoredTurns'
import { applyDomainResolution, resolveDomainAction } from '../src/story/engine/domainRules'
import { parseStoryProtocol } from '../src/story/engine/protocol'
import { applyParsedScene, createInitialSave } from '../src/story/engine/reducer'
import { canonicalizeTurnMetadata, validateTurnConsistency } from '../src/story/engine/turnConsistency'
import { prepareTurnCandidate } from '../src/story/engine/turnPipeline'

function applyAuthored(save: ReturnType<typeof createInitialSave>, action: string) {
  const opening = resolveDeterministicOpeningTurn(save, lettersFromAfar, action)
  const authored = opening ?? resolveDeterministicChoiceTurn(save, lettersFromAfar, action)
  assert.ok(authored, `authored turn exists for ${action}`)
  const prepared = prepareTurnCandidate({
    save,
    parsed: parseStoryProtocol(authored.content, 'zh'),
    cartridge: lettersFromAfar,
    action,
    imagePrompt: authored.imagePrompt,
    trustedAuthored: true,
    skipTurnValidation: true,
  })
  return applyParsedScene(save, prepared.parsed, lettersFromAfar, action, prepared.imagePrompt, authored.imageSubject, undefined, undefined, authored.imageCharacterId)
}

const initial = createInitialSave(lettersFromAfar)
assert.equal(initial.location, '漂港·旧邮局')
assert.equal(initial.choices.length, 2)
assert.equal(initial.characters.length, 1, 'future cast remains hidden until visible debut')
assert.equal(initial.characters[0].id, 'ada-vale')

const [inspectLabel, askLabel] = initial.choices.map((choice) => choice.label)
for (const label of [inspectLabel, askLabel]) {
  const authored = resolveDeterministicOpeningTurn(initial, lettersFromAfar, label)!
  const canonical = canonicalizeTurnMetadata(initial, parseStoryProtocol(authored.content, 'zh'), lettersFromAfar, authored.imagePrompt, label, true)
  const canonicalChoices = canonical.parsed.commands.find((command) => command.type === 'choices')
  assert.ok(canonicalChoices?.type === 'choices' && canonicalChoices.choices.length === 2, `canonical pipeline preserves both close authored replies: ${label}; got ${canonicalChoices?.type === 'choices' ? canonicalChoices.choices.join(' / ') : 'none'}`)
  assert.deepEqual(validateTurnConsistency(initial, canonical.parsed, lettersFromAfar, canonical.imagePrompt, label), [], `full turn pipeline accepts opening branch: ${label}`)
}
const inspected = applyAuthored(initial, inspectLabel)
const asked = applyAuthored(initial, askLabel)
assert.equal(inspected.stats.clues, 0, 'the first action reveals the impossible date without front-loading a scored clue')
assert.equal(asked.relationships.length, 0, 'checking the slot does not manufacture a relationship promise')
assert.deepEqual(inspected.choices.map((choice) => choice.label), asked.choices.map((choice) => choice.label), 'both first actions converge on two close, usable follow-ups')

const cabinetAction = inspected.choices.find((choice) => choice.label.includes('档案柜'))?.label
assert.ok(cabinetAction)
const cabinet = applyAuthored(inspected, cabinetAction)
assert.equal(cabinet.stats.clues, 1, 'the second action turns the missing old stamp into a verified clue')
assert.equal(cabinet.choices.find((choice) => choice.label.includes('盐沼'))?.targetLocationId, 'saltmarsh-causeway', 'the route appears only after it becomes usable')

const firstLineAction = asked.choices.find((choice) => choice.label.includes('第一行'))?.label
assert.ok(firstLineAction)
const firstLine = applyAuthored(asked, firstLineAction)
assert.ok(firstLine.choices.some((choice) => choice.targetLocationId === 'saltmarsh-causeway'), 'reading one line produces the same grounded departure without extra lore')

const saltAction = cabinet.choices.find((choice) => choice.label.includes('盐沼'))?.label
assert.ok(saltAction)
const saltmarsh = applyAuthored(cabinet, saltAction)
assert.equal(saltmarsh.location, '盐沼旧堤')
assert.equal(saltmarsh.stats.energy, cabinet.stats.energy - 8)
assert.ok(saltmarsh.characters.some((character) => character.id === 'mira-sol'), 'Mira appears only after her visible introduction')
assert.equal(saltmarsh.choices.length, 3, `saltmarsh arrival keeps three executable choices: ${saltmarsh.choices.map((choice) => choice.label).join(' / ')}`)
assert.ok(saltmarsh.choices.every((choice) => /米拉|邮棚|投信箱|漂港/.test(choice.label)), 'arrival choices address the live tide incident')
for (const choice of saltmarsh.choices) {
  assert.ok(resolveDeterministicChoiceTurn(saltmarsh, lettersFromAfar, choice.label), `saltmarsh recommendation has a deterministic continuation: ${choice.label}`)
}
const ropeAction = saltmarsh.choices.find((choice) => choice.label.includes('固定第三根'))?.label
assert.ok(ropeAction)
const ropePayoff = applyAuthored(saltmarsh, ropeAction)
assert.equal(ropePayoff.time, '第 1 天 · 19:30', 'authored time changes use a concrete clock value')
assert.ok(ropePayoff.relationships.some((event) => event.characterId === 'mira-sol'), 'first route payoff visibly changes the relationship')
assert.ok(ropePayoff.choices.length >= 1, 'first route payoff keeps an executable next action')
for (const choice of ropePayoff.choices) {
  assert.ok(resolveDeterministicChoiceTurn(ropePayoff, lettersFromAfar, choice.label), `post-payoff recommendation has a deterministic continuation: ${choice.label}`)
}

const rest = resolveDomainAction(saltmarsh, lettersFromAfar, '在废弃潮棚安全短休四十五分钟')
assert.equal(rest?.status, 'accepted')
const restLocation = saltmarsh.location
const restObjective = saltmarsh.objective
const energyBeforeRest = saltmarsh.stats.energy
applyDomainResolution(saltmarsh, lettersFromAfar, rest!)
assert.equal(saltmarsh.location, restLocation, 'rest never teleports the player')
assert.equal(saltmarsh.objective, restObjective, 'rest preserves the active journey objective')
assert.equal(saltmarsh.stats.energy, Math.min(100, energyBeforeRest + 20), 'rest is a positive recovery')

const workInitial = createInitialSave(lettersFromAfar)
const shift = resolveDomainAction(workInitial, lettersFromAfar, '先帮艾达清点档案柜，确认少了什么')
assert.equal(shift?.status, 'accepted')
const coinBeforeWork = workInitial.stats.coin
const energyBeforeWork = workInitial.stats.energy
applyDomainResolution(workInitial, lettersFromAfar, shift!)
assert.equal(workInitial.stats.coin, coinBeforeWork + 6, 'completed paid work settles money in the same authoritative turn')
assert.equal(workInitial.stats.energy, energyBeforeWork - 6)
const ferryAction = workInitial.choices.find((choice) => choice.label.includes('北渡口'))?.label
assert.ok(ferryAction, 'the paid opening shift may reveal North Ferry after the opening mystery is established')
const ferry = applyAuthored(workInitial, ferryAction)
assert.equal(ferry.location, '北渡口')
assert.ok(ferry.characters.some((character) => character.id === 'eli-rook'), 'Eli appears only after his visible introduction')
assert.equal(ferry.choices.length, 3, `ferry arrival keeps three choices: ${ferry.choices.map((choice) => choice.label).join(' / ')}`)
assert.ok(ferry.choices.every((choice) => /伊莱|船|渡/.test(choice.label)), 'ferry choices remain grounded in the repair-shed incident')
for (const choice of ferry.choices) {
  assert.ok(resolveDeterministicChoiceTurn(ferry, lettersFromAfar, choice.label), `ferry recommendation has a deterministic continuation: ${choice.label}`)
}
const duplicateShift = resolveDomainAction(workInitial, lettersFromAfar, '先帮艾达清点档案柜，确认少了什么')
assert.equal(duplicateShift?.status, 'rejected', 'the same shift cannot loop for repeated pay and energy loss')

const buy = resolveDomainAction(workInitial, lettersFromAfar, '花 3 枚旅费买一份路粮')
assert.equal(buy?.status, 'accepted')
const coinBeforeBuy = workInitial.stats.coin
applyDomainResolution(workInitial, lettersFromAfar, buy!)
assert.equal(workInitial.stats.coin, coinBeforeBuy - 3, 'explicit purchase deducts its displayed amount')
assert.ok(workInitial.inventory.some((item) => item.id === 'road-ration'))
const inquirySave = createInitialSave(lettersFromAfar)
assert.equal(resolveDomainAction(inquirySave, lettersFromAfar, '看看有没有路粮'), undefined, 'asking about supplies cannot spend money')

const en = createInitialSave(lettersFromAfarEn)
assert.equal(en.choices.length, 2)
for (const choice of en.choices) assert.ok(resolveDeterministicOpeningTurn(en, lettersFromAfarEn, choice.label), `English opening turn exists for ${choice.label}`)

console.log('Letters from Afar vertical slice: 2 progressive opening paths, 2 route arrivals, rest, pay and purchase contracts passed.')
