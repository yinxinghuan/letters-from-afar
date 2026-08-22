import assert from 'node:assert/strict'
import { lettersFromAfar, lettersFromAfarEn } from '../src/story/cartridges/lettersFromAfar'
import { resolveDeterministicChoiceTurn, resolveDeterministicOpeningTurn } from '../src/story/engine/authoredTurns'
import { parseStoryProtocol } from '../src/story/engine/protocol'
import { applyParsedScene, createInitialSave } from '../src/story/engine/reducer'
import { prepareTurnCandidate } from '../src/story/engine/turnPipeline'
import type { StoryCartridge } from '../src/story/types'

type Save = ReturnType<typeof createInitialSave>

function act(save: Save, cartridge: StoryCartridge, action: string): Save {
  const authored = resolveDeterministicOpeningTurn(save, cartridge, action)
    ?? resolveDeterministicChoiceTurn(save, cartridge, action)
  assert.ok(authored, `authored inland turn exists for: ${action} at ${save.location}`)
  const prepared = prepareTurnCandidate({
    save,
    parsed: parseStoryProtocol(authored.content, cartridge.locale),
    cartridge,
    action,
    imagePrompt: authored.imagePrompt,
    trustedAuthored: true,
    skipTurnValidation: true,
  })
  return applyParsedScene(save, prepared.parsed, cartridge, action, prepared.imagePrompt, authored.imageSubject, undefined, undefined, authored.imageCharacterId)
}

function choice(save: Save, fragment: string): string {
  const found = save.choices.find((entry) => entry.label.includes(fragment))?.label
  assert.ok(found, `choice containing “${fragment}” exists at ${save.location}; got: ${save.choices.map((entry) => entry.label).join(' / ')}`)
  return found
}

function replay(cartridge: StoryCartridge, fragments: string[]): Save {
  let save = createInitialSave(cartridge)
  for (const fragment of fragments) save = act(save, cartridge, choice(save, fragment))
  return save
}

const initial = createInitialSave(lettersFromAfar)
assert.equal(initial.map.length, 24, 'second expansion exposes twenty-four stable authored map nodes')
assert.equal(initial.characters.length, 1, 'all inland characters remain hidden before visible debut')
assert.equal(lettersFromAfar.characters.length, 10, 'the authored cast now contains ten stable identities')
assert.deepEqual(lettersFromAfar.initialMap.map((node) => node.id), lettersFromAfarEn.initialMap.map((node) => node.id), 'map IDs remain identical across locales')
assert.deepEqual(lettersFromAfar.characters.map((entry) => entry.id), lettersFromAfarEn.characters.map((entry) => entry.id), 'character IDs remain identical across locales')
assert.equal(new Set(lettersFromAfar.initialMap.map((node) => node.id)).size, 24, 'map has no duplicate IDs')
assert.equal(new Set(lettersFromAfar.characters.map((entry) => entry.id)).size, 10, 'cast has no duplicate IDs')
assert.ok(lettersFromAfar.audioTheme.recorded?.music?.src, 'the world has a durable generated music bed')
assert.ok(lettersFromAfar.audioTheme.recorded?.cues?.travel?.src, 'arrivals use the reviewed generated route cue')
lettersFromAfar.initialMap.forEach((node) => {
  assert.ok(lettersFromAfar.audioTheme.recorded?.ambienceByLocationId?.[node.id]?.src, `map node ${node.id} has an authored regional ambience`)
})

let rail = replay(lettersFromAfar, ['邮戳', '盐沼旧堤', '投信箱', '核对最近三次退潮', '旧公路旅舍', '莉娜'])
rail = act(rail, lettersFromAfar, choice(rail, '签收记录'))
assert.equal(rail.location, '横风农场', 'reading the receipt keeps the player at the farm')
assert.ok(rail.choices.every((entry) => /月台城|替代传动轴|皮带裂口/.test(entry.label)), 'farm follow-ups stay tied to the stopped pump')
assert.ok(!rail.characters.some((entry) => entry.id === 'jonah-reed'), 'Jonah remains hidden before Platform City')
rail = act(rail, lettersFromAfar, choice(rail, '月台城'))
assert.equal(rail.location, '月台城')
assert.ok(rail.characters.some((entry) => entry.id === 'jonah-reed'), 'Jonah appears only after a visible debut')
assert.ok(!rail.characters.some((entry) => entry.id === 'bess-rook'), 'Bess remains hidden before the Roundhouse')
assert.ok(rail.choices.every((entry) => /乔纳|南部货场|圆顶机车库/.test(entry.label)), 'Platform City choices are grounded')
rail = act(rail, lettersFromAfar, choice(rail, '乔纳'))
assert.equal(rail.location, '圆顶机车库')
assert.ok(rail.characters.some((entry) => entry.id === 'bess-rook'), 'Bess appears only after a visible debut')
assert.ok(!rail.characters.some((entry) => entry.id === 'ivo-thorne'), 'Ivo remains hidden before the signal hut')
assert.ok(rail.choices.every((entry) => /贝丝|乔纳|信号铃/.test(entry.label)), 'Roundhouse choices continue the dangerous-part incident')
rail = act(rail, lettersFromAfar, choice(rail, '信号铃'))
assert.equal(rail.location, '沙下支线')
assert.ok(rail.characters.some((entry) => entry.id === 'ivo-thorne'), 'Ivo appears only after a visible debut')
assert.ok(rail.choices.every((entry) => /伊沃|圆顶机车库/.test(entry.label)), 'Buried Branch choices follow signal-cord evidence')
assert.ok(rail.choices.length >= 2, `Buried Branch retains more than one grounded local action; got: ${rail.choices.map((entry) => entry.label).join(' / ')}`)
const railClues = rail.stats.clues
rail = act(rail, lettersFromAfar, choice(rail, '两短一长'))
assert.equal(rail.stats.clues, railClues + 1, 'asking about the old signal produces one verified clue')
assert.ok(rail.choices.length >= 1, 'the signal explanation does not end in an empty tray')

let plateau = replay(lettersFromAfar, ['艾达', '北渡口', '稳住船板', '辨认能沾上蓝灰树脂', '杉湖镇', '未署名的旧信'])
plateau = act(plateau, lettersFromAfar, choice(plateau, '改名前后'))
assert.equal(plateau.location, '湖上驿站', 'reading the records keeps the player at the Floating Post')
assert.ok(plateau.choices.every((entry) => /干河驿站|补给记录|子午观测站/.test(entry.label)), 'Floating Post choices expose concrete plateau evidence')
assert.ok(!plateau.characters.some((entry) => entry.id === 'noor-hale'), 'Noor remains hidden before Dryriver Station')
plateau = act(plateau, lettersFromAfar, choice(plateau, '干河驿站'))
assert.equal(plateau.location, '干河驿站')
assert.ok(plateau.characters.some((entry) => entry.id === 'noor-hale'), 'Noor appears only after a visible medical handoff')
assert.ok(!plateau.characters.some((entry) => entry.id === 'jules-ansel'), 'Jules remains hidden before the observatory')
assert.ok(plateau.choices.every((entry) => /努尔|红土车辙|子午观测站/.test(entry.label)), 'Dryriver choices remain grounded')
plateau = act(plateau, lettersFromAfar, choice(plateau, '红土车辙'))
assert.equal(plateau.location, '岩屋镇')
assert.ok(plateau.choices.every((entry) => /水槽|季节河闸|回声峡谷路/.test(entry.label)), 'Rockhouse choices address three visible traces')
plateau = act(plateau, lettersFromAfar, choice(plateau, '回声峡谷路'))
assert.equal(plateau.location, '回声峡谷路')
assert.ok(plateau.choices.every((entry) => /岩屋镇|子午观测站|镜盘/.test(entry.label)), 'Echo Canyon choices follow visible evidence')
plateau = act(plateau, lettersFromAfar, choice(plateau, '子午观测站'))
assert.equal(plateau.location, '子午观测站')
assert.ok(plateau.characters.some((entry) => entry.id === 'jules-ansel'), 'Jules appears only after a visible debut')
assert.ok(plateau.choices.every((entry) => /朱尔斯|记录册/.test(entry.label)), 'Observatory choices remain grounded')
assert.ok(plateau.choices.length >= 2, `Observatory retains more than one grounded evidence action; got: ${plateau.choices.map((entry) => entry.label).join(' / ')}`)
const plateauClues = plateau.stats.clues
plateau = act(plateau, lettersFromAfar, choice(plateau, '镜盘刻度'))
assert.equal(plateau.stats.clues, plateauClues + 1, 'the observatory comparison produces one verified clue')
assert.ok(plateau.choices.length >= 1, 'the mirror comparison does not end in an empty tray')

let railEn = replay(lettersFromAfarEn, ['postmark', 'Saltmarsh', 'letter box', 'last three low tides', 'Old Highway Lodge', 'Lena'])
for (const fragment of ['drive shaft borrowed', 'Platform City', "M-17's", 'signal bell']) railEn = act(railEn, lettersFromAfarEn, choice(railEn, fragment))
assert.equal(railEn.location, 'Buried Branch', 'English rail chain reaches the same map node')
assert.ok(['jonah-reed', 'bess-rook', 'ivo-thorne'].every((id) => railEn.characters.some((entry) => entry.id === id)), 'English rail chain introduces the same stable characters')

let plateauEn = replay(lettersFromAfarEn, ['postmark', 'North Ferry', 'hull plank', 'blue-grey resin', 'Cedar Lake', 'unsigned old letters'])
for (const fragment of ['before and after', 'Dryriver Station', 'red-earth wheel ruts', 'Echo Canyon Road', 'Meridian Observatory']) plateauEn = act(plateauEn, lettersFromAfarEn, choice(plateauEn, fragment))
assert.equal(plateauEn.location, 'Meridian Observatory', 'English plateau chain reaches the same map node')
assert.ok(['noor-hale', 'jules-ansel'].every((id) => plateauEn.characters.some((entry) => entry.id === id)), 'English plateau chain introduces the same stable characters')

console.log('Letters from Afar inland expansion: 24 map nodes, 10 stable characters, rail and plateau chains passed in zh/en.')
