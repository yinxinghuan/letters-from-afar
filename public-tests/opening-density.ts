import assert from 'node:assert/strict'
import { lettersFromAfar, lettersFromAfarEn } from '../src/story/cartridges/lettersFromAfar'

for (const cartridge of [lettersFromAfar, lettersFromAfarEn]) {
  const isZh = cartridge.locale === 'zh'
  const openingText = [cartridge.opening.objective, ...cartridge.opening.blocks.map((block) => block.text)].join('\n')
  assert.equal(cartridge.opening.blocks.length, 3, `${cartridge.locale}: first screen must use three digestible beats`)
  assert.equal(cartridge.opening.choices.length, 2, `${cartridge.locale}: first screen must offer two grounded actions, not a quota`)
  assert.equal(cartridge.initialFacts?.player_role, isZh ? '漂港临时邮路员' : 'Drift Harbor temporary route courier')
  assert.ok(cartridge.director.fixedWorldRules.some((rule) => isZh ? rule.includes('不能与玩家身份互换') : rule.includes('roles must not be swapped')))
  assert.ok(openingText.length <= (isZh ? 245 : 680), `${cartridge.locale}: first screen is too dense (${openingText.length})`)
  assert.match(
    openingText,
    isZh ? /临时邮路员[\s\S]*明早[\s\S]*积压信件/ : /temporary route courier[\s\S]*tomorrow[\s\S]*backlogged mail/i,
    `${cartridge.locale}: the first screen must establish the player's role, reason for staying, and next-day duty`,
  )
  assert.match(
    openingText,
    isZh ? /写着你的名字[\s\S]*由你决定怎么查/ : /bears your name[\s\S]*you decide how we examine it/i,
    `${cartridge.locale}: the first screen must explain why this letter belongs to the player's decision`,
  )
  assert.doesNotMatch(
    openingText,
    isZh ? /三年|盐沼|北渡口|潮汐邮路|共享世界/ : /three years|Saltmarsh|North Ferry|Tide Route|shared world/i,
    `${cartridge.locale}: future date, route lore and systems must wait for player action`,
  )

  for (const choice of cartridge.opening.choices) {
    const turn = cartridge.opening.deterministicTurns[choice.id]
    assert.ok(turn, `${cartridge.locale}: opening choice ${choice.id} must resolve locally`)
    const prose = turn.content.split(/\n\s*\n/).filter((paragraph) => !paragraph.trim().startsWith('['))
    assert.ok(prose.length <= 2, `${cartridge.locale}: first action may reveal only one short fact chain`)
    assert.doesNotMatch(turn.content, isZh ? /北渡口/ : /North Ferry/i, `${cartridge.locale}: the second route must not be front-loaded`)
    const choices = turn.content.match(/\[choices:([^\]]+)\]/)?.[1]?.split('|') ?? []
    assert.equal(choices.length, 2, `${cartridge.locale}: first response must end in two close follow-ups`)
  }

  const followupLabels = cartridge.deterministicChoiceTurns.map((entry) => entry.action)
  assert.ok(followupLabels.some((label) => isZh ? label.includes('档案柜里的旧邮戳') : label.includes('old stamp in the archive cabinet')))
  assert.ok(followupLabels.some((label) => isZh ? label.includes('只读第一行') : label.includes('read only the first line')))
  assert.ok(followupLabels.some((label) => isZh ? label.includes('涨潮前带信前往盐沼旧堤') : label.includes('Saltmarsh Causeway before high tide')))
}

console.log('opening density contract passed')
