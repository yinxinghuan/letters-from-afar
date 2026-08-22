import assert from 'node:assert/strict'
import { lettersFromAfar, lettersFromAfarEn } from '../src/story/cartridges/lettersFromAfar'
import { resolveDeterministicChoiceTurn, resolveDeterministicOpeningTurn } from '../src/story/engine/authoredTurns'
import { parseStoryProtocol } from '../src/story/engine/protocol'
import { applyParsedScene, createInitialSave } from '../src/story/engine/reducer'
import { prepareTurnCandidate } from '../src/story/engine/turnPipeline'

type Save = ReturnType<typeof createInitialSave>

function act(save: Save, action: string): Save {
  const authored = resolveDeterministicOpeningTurn(save, lettersFromAfar, action)
    ?? resolveDeterministicChoiceTurn(save, lettersFromAfar, action)
  assert.ok(authored, `authored expansion turn exists for: ${action}`)
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

function choice(save: Save, fragment: string): string {
  const found = save.choices.find((entry) => entry.label.includes(fragment))?.label
  assert.ok(found, `choice containing “${fragment}” exists at ${save.location}; got: ${save.choices.map((entry) => entry.label).join(' / ')}`)
  return found
}

const initial = createInitialSave(lettersFromAfar)
assert.equal(initial.map.length, 24, 'the current world exposes twenty-four stable authored map nodes')
assert.equal(initial.characters.length, 1, 'all future expansion characters remain hidden before visible debut')
assert.deepEqual(lettersFromAfar.initialMap.map((node) => node.id), lettersFromAfarEn.initialMap.map((node) => node.id), 'Chinese and English map IDs remain identical')
assert.deepEqual(lettersFromAfar.characters.map((entry) => entry.id), lettersFromAfarEn.characters.map((entry) => entry.id), 'Chinese and English character IDs remain identical')

let grass = act(initial, choice(initial, '邮戳'))
grass = act(grass, choice(grass, '盐沼旧堤'))
grass = act(grass, choice(grass, '投信箱'))
grass = act(grass, choice(grass, '核对最近三次退潮'))
assert.equal(grass.stats.clues, 3, 'saltmarsh investigation gives three separately visible verified clues')
grass = act(grass, choice(grass, '旧公路旅舍'))
assert.equal(grass.location, '旧公路旅舍')
assert.ok(grass.characters.some((entry) => entry.id === 'lena-voss'), 'Lena enters the roster only after her visible lodge introduction')
assert.ok(grass.choices.every((entry) => /旅客簿|莉娜|盐沼/.test(entry.label)), 'lodge choices stay grounded in the lodge scene')
grass = act(grass, choice(grass, '莉娜'))
assert.equal(grass.location, '横风农场')
assert.ok(grass.choices.length === 3 && grass.choices.every((entry) => /风泵|传动轴|农工/.test(entry.label)), `farm arrival presents three concrete responses to the live water incident; got: ${grass.choices.map((entry) => entry.label).join(' / ')}`)

let lake = act(createInitialSave(lettersFromAfar), choice(createInitialSave(lettersFromAfar), '艾达'))
lake = act(lake, choice(lake, '北渡口'))
lake = act(lake, choice(lake, '稳住船板'))
lake = act(lake, choice(lake, '辨认能沾上蓝灰树脂'))
lake = act(lake, choice(lake, '杉湖镇'))
assert.equal(lake.location, '杉湖镇')
assert.ok(lake.characters.some((entry) => entry.id === 'anja-moss'), 'Anja enters the roster only after her visible Cedar Lake introduction')
assert.ok(lake.choices.every((entry) => /木箱|旧信|安雅/.test(entry.label)), 'Cedar Lake choices remain attached to the unlabeled-crate incident')
lake = act(lake, choice(lake, '未署名的旧信'))
assert.equal(lake.location, '湖上驿站')
assert.ok(lake.choices.length === 3 && lake.choices.every((entry) => /安雅|回信|随身铅封/.test(entry.label)), `Floating Post choices continue the visible reply investigation; got: ${lake.choices.map((entry) => entry.label).join(' / ')}`)

console.log('Letters from Afar first expansion gates: current 24-node world, grassland and lakewood chains passed.')
