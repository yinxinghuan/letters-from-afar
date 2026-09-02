import assert from 'node:assert/strict'
import { lettersFromAfar } from '../src/story/cartridges/lettersFromAfar'
import { executeStoryTurn } from '../src/story/engine/executeTurn'
import { createInitialSave } from '../src/story/engine/reducer'

const initial = createInitialSave(lettersFromAfar)
const initialJson = JSON.stringify(initial)
let domainModelCalls = 0
const rested = await executeStoryTurn({
  save: initial,
  cartridge: lettersFromAfar,
  action: '短休',
  generator: { async send(): Promise<never> { domainModelCalls += 1; throw new Error('MODEL_MUST_NOT_RUN') } },
})
assert.equal(rested.source, 'domain')
assert.equal(domainModelCalls, 0)
assert.equal(rested.save.scene, initial.scene + 1)
assert.equal(rested.save.stats.energy, 98)
assert.equal(JSON.stringify(initial), initialJson, 'server pipeline must not mutate its input snapshot')

let modelCalls = 0
const model = await executeStoryTurn({
  save: initial,
  cartridge: lettersFromAfar,
  action: '检查信封封口的盐粒',
  generator: {
    async send() {
      modelCalls += 1
      return {
        content: [
          '你把干燥信封移到分拣灯下，封口夹着一粒灰白海盐。艾达确认旧邮局室内使用的是细盐，这粒粗盐更像来自盐沼旧堤。',
          '[state: value="确认信封封口的粗盐是否来自盐沼旧堤"]',
          '[scene_location: location="漂港·旧邮局"]',
          '[choices: "请艾达比较粗盐与邮局细盐"|"把粗盐收进证物纸袋"]',
        ].join('\n'),
      }
    },
  },
})
assert.equal(model.source, 'model')
assert.equal(modelCalls, 1)
assert.equal(model.save.scene, initial.scene + 1)
assert.equal(model.save.objective, '确认信封封口的粗盐是否来自盐沼旧堤')
assert.ok(model.save.choices.length >= 1)

let deflectionModelCalls = 0
const threatened = {
  ...initial,
  danger: { ...initial.danger, phase: 'warning' as const, currentThreat: '潮水切断盐沼低路', severity: 3 },
}
const deflected = await executeStoryTurn({
  save: threatened,
  cartridge: lettersFromAfar,
  action: '回邮局整理别的信件',
  generator: { async send(): Promise<never> { deflectionModelCalls += 1; throw new Error('MODEL_MUST_NOT_RUN') } },
})
assert.equal(deflected.source, 'authored')
assert.equal(deflectionModelCalls, 0)
assert.equal(deflected.save.danger.currentThreat, threatened.danger.currentThreat)
assert.deepEqual(deflected.save.stats, threatened.stats)

console.log(JSON.stringify({
  ok: true,
  checks: [
    'server-compatible-pure-turn-pipeline',
    'domain-action-bypasses-model',
    'authoritative-effects-commit-together',
    'input-snapshot-remains-immutable',
    'model-proposal-validates-before-commit',
    'active-danger-deflection-bypasses-model-and-preserves-state',
  ],
}, null, 2))
