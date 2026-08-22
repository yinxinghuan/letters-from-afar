import type {
  CharacterDefinition,
  DemoTurn,
  DeterministicChoiceTurn,
  DomainActionRule,
  Locale,
  MapNode,
  StoryCartridge,
} from '../types'

const coverImage = new URL('../img/worlds/letters-from-afar-entry-v2.png', import.meta.url).href
const entryImage = new URL('../img/worlds/letters-from-afar-entry-v2.png', import.meta.url).href

const s = (locale: Locale, zh: string, en: string) => locale === 'zh' ? zh : en

function cast(locale: Locale): CharacterDefinition[] {
  return [
    {
      id: 'ada-vale',
      name: s(locale, '艾达·维尔', 'Ada Vale'),
      role: s(locale, '34 岁 · 旧邮局临时代办员', 'Age 34 · acting keeper of the old post office'),
      vitality: 76,
      stress: 31,
      initialStatus: 'known',
      detail: s(locale, '风暴后留守漂港旧邮局，正在清点无人认领的信件。', 'Keeping Drift Harbor’s old post office open after the storm and cataloguing unclaimed mail.'),
      visualIdentity: {
        status: 'anchored', version: 1, source: 'authored',
        appearance: 'Adult woman, age 34, weathered olive skin, cropped dark auburn hair, pale scar crossing the right eyebrow, observant grey-green eyes.',
        immutableTraits: ['cropped dark auburn hair', 'pale scar through right eyebrow', 'grey-green eyes'],
        wardrobe: ['slate postal coat', 'brass key ring', 'cream rolled sleeves'],
        forbiddenDrift: ['no long hair', 'no hat', 'no uniform cap'],
      },
      skills: [{ id: 'archives', label: s(locale, '档案', 'Archives'), value: 3 }],
    },
    {
      id: 'mira-sol',
      name: s(locale, '米拉·索尔', 'Mira Sol'),
      role: s(locale, '29 岁 · 盐沼测路员', 'Age 29 · saltmarsh route surveyor'),
      vitality: 81,
      stress: 22,
      initialStatus: 'known',
      hiddenUntilIntroduced: true,
      detail: s(locale, '沿盐沼旧堤记录潮位与可通行时段。', 'Records tide windows and passable ground along the old saltmarsh causeway.'),
      visualIdentity: {
        status: 'anchored', version: 1, source: 'authored',
        appearance: 'Adult woman, age 29, warm brown skin, black hair in one low practical braid, angular face, amber safety lens hanging at her throat.',
        immutableTraits: ['one low black braid', 'angular face', 'amber safety lens'],
        wardrobe: ['waxed ochre field jacket', 'dark waders', 'tide ruler case'],
        forbiddenDrift: ['no loose hair', 'no formal dress', 'no eyewear on face'],
      },
      skills: [{ id: 'routes', label: s(locale, '测路', 'Route survey'), value: 4 }],
    },
    {
      id: 'eli-rook',
      name: s(locale, '伊莱·鲁克', 'Eli Rook'),
      role: s(locale, '38 岁 · 北渡口船修工', 'Age 38 · North Ferry mechanic'),
      vitality: 70,
      stress: 38,
      initialStatus: 'known',
      hiddenUntilIntroduced: true,
      detail: s(locale, '在停航的北渡口修复一艘风暴后的浅水船。', 'Repairing a storm-damaged shallow-draft boat at the closed North Ferry.'),
      visualIdentity: {
        status: 'anchored', version: 1, source: 'authored',
        appearance: 'Adult man, age 38, deep brown skin, close-shaved head, broad nose, one silver hoop in left ear, oil-darkened hands.',
        immutableTraits: ['close-shaved head', 'silver hoop in left ear', 'broad nose'],
        wardrobe: ['faded blue mechanic coat', 'rust-red scarf', 'canvas tool roll'],
        forbiddenDrift: ['no beard', 'no hair', 'no military uniform'],
      },
      skills: [{ id: 'repair', label: s(locale, '修船', 'Boat repair'), value: 4 }],
    },
  ]
}

function map(locale: Locale): MapNode[] {
  return [
    { id: 'old-post-office', label: s(locale, '漂港·旧邮局', 'Drift Harbor · Old Post Office'), current: true, visited: true, detail: s(locale, '风暴后仍亮着一盏灯的旧邮局。', 'The old post office still keeping one lamp lit after the storm.'), capabilities: ['rest', 'work', 'supplies'], routeHints: [s(locale, '临窗长椅', 'window bench'), s(locale, '分拣室', 'sorting room')] },
    { id: 'drift-harbor', label: s(locale, '漂港', 'Drift Harbor'), connectedTo: 'old-post-office', visited: true, detail: s(locale, '重新开门的海边小镇，路标仍被风吹歪。', 'A seaside town reopening while its road signs still lean from the storm.'), capabilities: ['rest', 'work', 'supplies'] },
    { id: 'saltmarsh-causeway', label: s(locale, '盐沼旧堤', 'Saltmarsh Causeway'), connectedTo: 'old-post-office', detail: s(locale, '退潮时露出的旧邮路，沿途有测路桩。', 'An old postal road exposed at low tide, marked by survey stakes.'), capabilities: ['rest'], routeHints: [s(locale, '废弃潮棚', 'abandoned tide shelter')] },
    { id: 'north-ferry', label: s(locale, '北渡口', 'North Ferry'), connectedTo: 'drift-harbor', detail: s(locale, '停航中的浅水渡口，修船棚仍有人工作。', 'A suspended shallow-water ferry where someone still works in the repair shed.'), capabilities: ['rest', 'work'], routeHints: [s(locale, '候船室', 'waiting room')] },
    { id: 'old-highway-lodge', label: s(locale, '旧公路旅舍', 'Old Highway Lodge'), connectedTo: 'drift-harbor', detail: s(locale, '通向内陆前最后一个有热水的屋顶。', 'The last roof with hot water before the inland roads.'), capabilities: ['rest', 'supplies'] },
    { id: 'longwind-gate', label: s(locale, '长风草原入口', 'Longwind Grassland Gate'), connectedTo: 'old-highway-lodge', detail: s(locale, '草浪后的大陆公路入口。', 'The inland road opening beyond long fields of wind-bent grass.') },
    { id: 'cedar-lake-gate', label: s(locale, '湖林地带入口', 'Cedar Lakewood Gate'), connectedTo: 'north-ferry', detail: s(locale, '越过北岸后进入湖林的旧木道。', 'The old timber road entering the lakewoods beyond the north shore.') },
  ]
}

function openingTurns(locale: Locale): Record<string, DemoTurn> {
  const zh = locale === 'zh'
  return {
    'inspect-postmark': {
      match: [s(locale, '在灯下检查三年后的邮戳', 'Inspect the postmark dated three years ahead')],
      content: zh
        ? `你把信移到分拣灯下。邮戳的圆边有两处缺口，和墙上那枚早已停用的“潮汐邮路”旧戳完全吻合；墨迹却是刚干的。信封背面还压着一行只有斜光下才能看见的小字：第一封回信，要从盐沼旧堤寄出。\n\n这不是仿造的纪念戳。有人在今天使用了一件三年前就被锁进档案柜的工具。\n\n艾达摊开路线图：盐沼旧堤步行约二十分钟，涨潮前可过，途中有一座旧邮棚；北渡口约三十五分钟，渡船停航，但修船棚今夜收过一袋旧信。\n\n[widget: clues, add: 1]\n[state: value="查明潮汐旧戳为何重新出现"]\n[choices: "前往盐沼旧堤，寻找旧邮路"|"去北渡口追查今夜靠岸的人"|"留在邮局帮艾达查旧戳领用记录"]`
        : `You move the letter beneath the sorting lamp. Two chips in the circular postmark match the retired “Tide Route” stamp mounted on the wall, yet the ink has only just dried. In raking light, a pressed line appears on the envelope: the first reply must leave from Saltmarsh Causeway.\n\nThis is not a souvenir copy. Someone used a tool locked in the archive three years ago.\n\nAda opens the route map: Saltmarsh Causeway is about twenty minutes on foot and passable before high tide, with an old postal shelter along the way. North Ferry is about thirty-five minutes away; sailings are suspended, but its repair shed received a sack of old mail tonight.\n\n[widget: clues, add: 1]\n[state: value="Learn how the retired Tide Route stamp returned"]\n[choices: "Travel along Saltmarsh Causeway with the letter"|"Go to North Ferry and ask who landed tonight"|"Stay and help Ada audit the stamp log"]`,
      imageSubject: 'player',
      imagePrompt: 'FIRST-PERSON view down at a dry cream envelope under a green-shaded sorting lamp, one chipped circular postmark and pressed paper fibers visible but absolutely no readable letters or numbers, adult player entirely off-camera, storm-dark old coastal post office, cinematic editorial gouache, no hands, no text, no UI, 4:3',
    },
    'ask-ada': {
      match: [s(locale, '让艾达说清她为何害怕这封信', 'Ask Ada why the letter frightens her')],
      content: zh
        ? `艾达没有碰信。她先摘下腰间的铜钥匙，打开墙边档案柜，里面本该放着潮汐旧戳的位置只剩一圈干净的灰。\n\n[艾达·维尔] [main] [压低声音]: “昨晚我亲手锁的。三年前，最后一批走这条邮路的人都没有等到回信。你若真要查，我会把每次来信的时间记下来；但你也答应我，发现第一处能寄信的地方就报平安。”\n\n你们约定：艾达替你保管所有来信记录，你在第一处旧邮站留下报平安的回执。她随后摊开路线图：盐沼旧堤步行约二十分钟，涨潮前可过并有旧邮棚；北渡口约三十五分钟，渡船停航，但修船棚今夜收过一袋旧信。\n\n[reputation: npc="艾达·维尔" action="made-a-visible-promise"]\n[state: value="在第一处旧邮站给艾达留下平安回执"]\n[choices: "前往盐沼旧堤，寻找旧邮站"|"去北渡口问今夜是否有人投递"|"先帮艾达清点档案柜，确认少了什么"]`
        : `Ada does not touch the letter. She removes a brass key from her belt and opens the archive cabinet. Where the retired Tide Route stamp should be, only a clean circle remains in the dust.\n\n[Ada Vale] [main] [quietly]: “I locked it myself last night. Three years ago, the last people on that route never received their replies. If you investigate, I will log every letter that arrives—but promise me you will leave word at the first old post station you find.”\n\nYou agree: Ada will preserve the arrival record, and you will leave a safe-arrival receipt at the first old post station. She then opens the route map: Saltmarsh Causeway is about twenty minutes on foot and passable before high tide, with an old postal shelter. North Ferry is about thirty-five minutes away; sailings are suspended, but its repair shed received a sack of old mail tonight.\n\n[reputation: npc="Ada Vale" action="made-a-visible-promise"]\n[state: value="Leave Ada a safe-arrival receipt at the first old post station"]\n[choices: "Travel to Saltmarsh Causeway and find the old post station"|"Ask at North Ferry whether anyone delivered mail tonight"|"Help Ada audit the cabinet before leaving"]`,
      imageSubject: 'others', imageCharacterId: 'ada-vale',
      imagePrompt: 'FIRST-PERSON conversation view toward Ada Vale opening an old archive cabinet, adult woman age 34, cropped dark auburn hair, pale scar through right eyebrow, grey-green eyes, slate postal coat, her expression controlled but visibly afraid, empty circular space in cabinet dust, player off-camera, cinematic editorial gouache, no readable text, no UI, 4:3',
    },
    'check-outside': {
      match: [s(locale, '查看门外是谁留下了干燥脚印', 'Check who left the dry footprints outside')],
      content: zh
        ? `门外的石阶全是雨水，只有一串鞋印是干的。它们从投信口下方开始，走到路口便消失。最后一个鞋印旁压着三颗白石——这是风暴后旅人用来表示“盐沼低路此刻可走”的记号。\n\n石头下面还有一截防水纸：四小时前，一名旅人确认旧堤前半段没有塌陷；他把一卷干燥绳留在第三根测路桩。记录带有公共路册的浮印，不是临时编造的传闻。盐沼旧堤步行约二十分钟，涨潮前可过；另一条去北渡口的路约三十五分钟，渡船停航，但修船棚今夜收过一袋旧信。\n\n[inventory: action="add" item="盐沼共享路迹" count="1" rarity="rare" detail="另一名旅人四小时前验证的路线记录；第三根测路桩留有一卷干燥绳。" effect="抵达盐沼旧堤时可使用共享绳索。"]\n[state: value="验证盐沼旧堤的共享路迹"]\n[choices: "趁潮位合适前往盐沼旧堤"|"前往北渡口，确认另一条离港路线"|"把共享路迹拿给艾达登记"]`
        : `Every stone step outside is wet except for one line of dry footprints. They begin beneath the mail slot and vanish at the road junction. Three white stones sit beside the final print—the post-storm travelers’ mark for “the low saltmarsh road is passable now.”\n\nBeneath them is a waterproof route slip: four hours ago, another traveler verified the first half of the causeway and left dry rope at the third survey stake. Its public route watermark makes it more than a rumor. Saltmarsh Causeway is about twenty minutes on foot and passable before high tide. The second route to North Ferry takes about thirty-five minutes; sailings are suspended, but its repair shed received a sack of old mail tonight.\n\n[inventory: action="add" item="Shared Saltmarsh Trace" count="1" rarity="rare" detail="A route record verified four hours ago; dry rope waits at the third survey stake." effect="Use the shared rope upon reaching Saltmarsh Causeway."]\n[state: value="Verify the shared trace on Saltmarsh Causeway"]\n[choices: "Travel to Saltmarsh Causeway while the tide allows"|"Travel to North Ferry and check the second route"|"Bring the shared trace to Ada for the public log"]`,
      imageSubject: 'environment',
      imagePrompt: 'FIRST-PERSON view from an old post office doorway onto rain-black stone steps, a single impossible trail of dry boot prints ending beside exactly three small white stones, storm clouds lifting above a coastal road junction, adult player entirely off-camera, cinematic editorial gouache, no hands, no text, no signs, no UI, 4:3',
    },
  }
}

function routeTurns(locale: Locale): DeterministicChoiceTurn[] {
  const zh = locale === 'zh'
  const salt = zh
    ? `你沿着退潮后的石堤离开漂港。海水在堤外的芦苇间倒流，第三根测路桩旁果然绑着一卷仍然干燥的绳。\n\n你刚把绳子解下，一名穿赭黄色防水外套的女人从前方雾里走来。她先用潮尺敲了敲一块松动的石面，才报上名字：“米拉·索尔，测路员。再过二十分钟这段低路会被水切断。”\n\n她指向两处立刻能做的事：跟她一起固定绳索，或者先检查旧邮棚里是否还有可用的投信箱。\n\n[character_update: character_id="mira-sol" character="米拉·索尔" role="29 岁 · 盐沼测路员" detail="在涨潮前检查盐沼旧堤的松动路面" vitality="81" stress="22"]\n[map_update: new_location="盐沼旧堤" location_id="saltmarsh-causeway" connected_to="漂港·旧邮局" detail="退潮后露出的旧邮路；二十分钟后低路将被水切断"]\n[clock: value="第 1 天 · 19:18"]\n[widget: energy, remove: 8]\n[choices: "和米拉固定第三根测路桩的绳索"|"先检查旧邮棚里的投信箱"|"在涨潮前返回漂港"]`
    : `You leave Drift Harbor along the stones exposed by the falling tide. Water runs backward through reeds beyond the causeway, and a coil of genuinely dry rope is tied to the third survey stake.\n\nAs you loosen it, a woman in an ochre waxed jacket emerges from the mist. She taps a loose stone with a tide ruler before giving her name: “Mira Sol, route surveyor. In twenty minutes the water will cut off this low section.”\n\nShe points to two things that matter now: secure the rope with her, or inspect the old tide shelter for a working letter box.\n\n[character_update: character_id="mira-sol" character="Mira Sol" role="Age 29 · saltmarsh route surveyor" detail="Checking loose stones before the tide cuts the old causeway" vitality="81" stress="22"]\n[map_update: new_location="Saltmarsh Causeway" location_id="saltmarsh-causeway" connected_to="Drift Harbor · Old Post Office" detail="The old postal road at low tide; water cuts the low section in twenty minutes"]\n[clock: value="Day 1 · 19:18"]\n[widget: energy, remove: 8]\n[choices: "Secure the rope at the third survey stake with Mira"|"Inspect the letter box inside the old tide shelter"|"Return to Drift Harbor before the tide rises"]`

  const ferry = zh
    ? `你穿过被风掀歪的码头围栏来到北渡口。停航牌倒扣在地上，一艘浅水船架在修理轨上。棚里，一个剃着短头、左耳戴银环的男人正把裂开的船板一段段编号。工具箱上的名字是“伊莱·鲁克”。\n\n伊莱告诉你，今夜确实有一艘没有登记的船靠岸；船上没有乘客，只带来一袋寄往内陆的旧信。他愿意让你查看袋口封印，但需要有人先帮他稳住正在回弹的船板。\n\n[character_update: character_id="eli-rook" character="伊莱·鲁克" role="38 岁 · 北渡口船修工" detail="修复今夜接过一袋旧信的浅水船" vitality="70" stress="38"]\n[map_update: new_location="北渡口" location_id="north-ferry" connected_to="漂港" detail="停航的渡口；修理棚里留着无登记船只的靠岸记录"]\n[clock: value="第 1 天 · 19:24"]\n[widget: energy, remove: 7]\n[choices: "帮伊莱稳住船板，再检查信袋封印"|"先查看无登记船留下的靠岸痕迹"|"向伊莱询问修好渡船去湖林还缺什么"]`
    : `You pass the storm-bent harbor fence and reach North Ferry. Its closure board lies face down while a shallow-draft boat rests on repair rails. In the shed, a close-shaved man with a silver hoop in his left ear numbers each split plank. The name on his tool roll is “Eli Rook.”\n\nEli says an unregistered boat did land tonight. It carried no passengers, only a sack of old letters bound inland. He will let you inspect the seal, but first needs someone to hold a springing hull plank steady.\n\n[character_update: character_id="eli-rook" character="Eli Rook" role="Age 38 · North Ferry mechanic" detail="Repairing the shallow boat that received a sack of old letters tonight" vitality="70" stress="38"]\n[map_update: new_location="North Ferry" location_id="north-ferry" connected_to="Drift Harbor" detail="A suspended ferry whose repair shed holds the record of an unregistered boat"]\n[clock: value="Day 1 · 19:24"]\n[widget: energy, remove: 7]\n[choices: "Hold the hull plank for Eli, then inspect the mail sack seal"|"Inspect the unregistered boat's landing traces first"|"Ask Eli what the ferry still needs before it can reach the lakewoods"]`

  const routeActions = [
    s(locale, '前往盐沼旧堤，寻找旧邮路', 'Travel along Saltmarsh Causeway with the letter'),
    s(locale, '前往盐沼旧堤，寻找旧邮站', 'Travel to Saltmarsh Causeway and find the old post station'),
    s(locale, '趁潮位合适前往盐沼旧堤', 'Travel to Saltmarsh Causeway while the tide allows'),
  ]
  const ferryActions = [
    s(locale, '去北渡口追查今夜靠岸的人', 'Go to North Ferry and ask who landed tonight'),
    s(locale, '去北渡口问今夜是否有人投递', 'Ask at North Ferry whether anyone delivered mail tonight'),
    s(locale, '前往北渡口，确认另一条离港路线', 'Travel to North Ferry and check the second route'),
  ]
  const followups: DeterministicChoiceTurn[] = [
    {
      action: s(locale, '和米拉固定第三根测路桩的绳索', 'Secure the rope at the third survey stake with Mira'),
      when: { locations: [s(locale, '盐沼旧堤', 'Saltmarsh Causeway')] },
      turn: {
        match: [s(locale, '和米拉固定第三根测路桩的绳索', 'Secure the rope at the third survey stake with Mira')],
        content: zh
          ? `你和米拉把干绳穿过石桩底部的铁环。潮头第一次拍上低路时，绳索稳稳绷住，后来的人至少能抓住它穿过这一段。\n\n米拉用潮尺在路册上压下一道新刻痕：“这处安全线已经能用。把它登记到公共路册后，下一位旅人也会看见。”她随后指向旧邮棚：投信箱的铜盖正在风里轻响，里面似乎有东西。\n\n[reputation: npc="米拉·索尔" action="共同固定盐沼安全绳"]\n[state: value="检查盐沼旧邮棚中刚刚响动的投信箱"]\n[clock: value="第 1 天 · 19:30"]\n[widget: energy, remove: 4]\n[choices: "打开旧邮棚里刚刚响动的投信箱"|"在涨潮前返回漂港"]`
          : `You and Mira thread the dry rope through the iron ring at the foot of the stake. When the first tide surge crosses the low road, the line holds. The next traveler will have something solid to follow.\n\nMira presses a fresh notch into the route ledger. “The safety line works. Once it is entered in the public route ledger, the next traveler will see it too.” Then she points toward the old tide shelter. Its copper letter-box lid is tapping in the wind, and something is inside.\n\n[reputation: npc="Mira Sol" action="secured-the-saltmarsh-safety-line-together"]\n[state: value="Inspect the letter box that just moved inside the old tide shelter"]\n[clock: value="Day 1 · 19:30"]\n[widget: energy, remove: 4]\n[choices: "Open the letter box that just moved inside the old tide shelter"|"Return to Drift Harbor before the tide rises"]`,
        imageSubject: 'others', imageCharacterId: 'mira-sol',
        imagePrompt: 'FIRST-PERSON view toward Mira Sol tightening a dry rope through an iron survey stake as the tide reaches a saltmarsh causeway, adult woman age 29 in ochre field jacket, low black braid, alert relieved expression, player off-camera, cinematic editorial gouache, no readable text, no UI, 4:3',
      },
    },
    {
      action: s(locale, '先检查旧邮棚里的投信箱', 'Inspect the letter box inside the old tide shelter'),
      when: { locations: [s(locale, '盐沼旧堤', 'Saltmarsh Causeway')] },
      turn: {
        match: [s(locale, '先检查旧邮棚里的投信箱', 'Inspect the letter box inside the old tide shelter')],
        content: zh
          ? `旧邮棚的门只剩一只铰链。你掀开投信箱的铜盖，里面没有信，只有一张卡在夹层里的潮位纸。纸上三道孔的位置，恰好对应未来邮戳的两处缺口和今天的退潮时刻。\n\n这给了你第一条能重复验证的规律：来信不是随时出现，它借用旧邮路短暂恢复通行的时刻。米拉确认孔位不是测路员留下的。\n\n[widget: clues, add: 1]\n[state: value="查明谁在盐沼通路恢复时使用旧邮戳"]\n[choices: "把潮位纸交给米拉核对最近三次退潮"|"用投信箱给艾达留下平安回执"|"趁低路未淹继续检查下一根测路桩"]`
          : `The tide shelter door hangs from one hinge. You lift the copper letter-box lid. There is no letter, only a tide slip caught behind the lining. Three punctures align with the two chips in the future postmark and tonight's low-tide time.\n\nYou now have a repeatable rule: the letters do not arrive at random; they use the brief moments when an old postal road becomes passable again. Mira confirms that no route surveyor made the holes.\n\n[widget: clues, add: 1]\n[state: value="Learn who uses the retired stamp when the saltmarsh route reopens"]\n[choices: "Give the tide slip to Mira and compare the last three low tides"|"Leave Ada a safe-arrival receipt in the letter box"|"Inspect the next survey stake before the low road floods"]`,
        imageSubject: 'player',
        imagePrompt: 'FIRST-PERSON close view into an old copper letter box inside a wind-damaged tide shelter, one punctured tide slip without readable writing caught behind the lining, wet saltmarsh visible through the doorway, player off-camera, cinematic editorial gouache, no hands, no text, no UI, 4:3',
      },
    },
    {
      action: s(locale, '在涨潮前返回漂港', 'Return to Drift Harbor before the tide rises'),
      when: { locations: [s(locale, '盐沼旧堤', 'Saltmarsh Causeway')] },
      turn: {
        match: [s(locale, '在涨潮前返回漂港', 'Return to Drift Harbor before the tide rises')],
        content: zh
          ? `你没有拿安全窗口冒险。你沿来路回到漂港时，第一股潮水刚好盖住盐沼低路。艾达在旧邮局门口接过你的路线说明，把“盐沼暂时封闭、下一次退潮再查”写进路册。\n\n这次撤回没有清空线索：米拉、旧投信箱和下一次退潮都已被保留。\n\n[map_update: new_location="漂港·旧邮局" location_id="old-post-office" connected_to="盐沼旧堤" detail="回到亮灯的旧邮局；盐沼线索保留到下一次退潮"]\n[clock: value="第 1 天 · 19:36"]\n[state: value="等待下一次退潮，或改查北渡口的旧信袋"]\n[choices: "向艾达复述米拉和旧投信箱的情况"|"前往北渡口追查无登记的旧信袋"|"在旧邮局安全休息四十五分钟"]`
          : `You do not gamble with the safe window. As you reach Drift Harbor, the first tide surge covers the low saltmarsh road. Ada takes your route report at the post-office door and records: “Saltmarsh closed for now; inspect again at the next low tide.”\n\nWithdrawing has not erased the lead. Mira, the old letter box and the next tide window remain on the record.\n\n[map_update: new_location="Drift Harbor · Old Post Office" location_id="old-post-office" connected_to="Saltmarsh Causeway" detail="Back at the lit old post office; the saltmarsh lead remains for the next low tide"]\n[clock: value="Day 1 · 19:36"]\n[state: value="Wait for the next low tide or investigate the old mail sack at North Ferry"]\n[choices: "Tell Ada exactly what Mira and the old letter box revealed"|"Travel to North Ferry and trace the unregistered mail sack"|"Rest safely at the old post office for forty-five minutes"]`,
        imageSubject: 'environment',
        imagePrompt: 'OBSERVER WIDE SHOT of a lone adult traveler returning along the last exposed stones toward a lamp-lit coastal post office as tidewater covers the saltmarsh road behind, cinematic editorial gouache, no readable text, no UI, 4:3',
      },
    },
    {
      action: s(locale, '帮伊莱稳住船板，再检查信袋封印', 'Hold the hull plank for Eli, then inspect the mail sack seal'),
      when: { locations: [s(locale, '北渡口', 'North Ferry')] },
      turn: {
        match: [s(locale, '帮伊莱稳住船板，再检查信袋封印', 'Hold the hull plank for Eli, then inspect the mail sack seal')],
        content: zh
          ? `你用肩膀抵住回弹的船板，伊莱把最后两枚铜钉敲进船肋。松手以后，他立刻履行约定，割开旧信袋外层已经发霉的封绳。\n\n内层铅封却是新的，上面也有潮汐旧戳的两处缺口；袋底还粘着来自湖林木道的蓝灰色树脂。伊莱把这截封绳交给你：“有人想让我们以为这袋信在海上漂了三年。”\n\n[widget: clues, add: 1]\n[reputation: npc="伊莱·鲁克" action="共同修船并查验信袋"]\n[inventory: action="add" item="北渡口铅封" count="1" rarity="rare" detail="外层旧、内层新的信袋封印，粘有湖林木道的蓝灰树脂。"]\n[state: value="沿湖林树脂追查伪装成旧物的信袋"]\n[widget: energy, remove: 5]\n[choices: "请伊莱辨认能沾上蓝灰树脂的湖林码头"|"查看无登记船在泥滩留下的吃水痕迹"|"把铅封带回漂港与未来邮戳比对"]`
          : `You brace the springing plank with your shoulder while Eli drives the final two copper nails into the rib. Once it holds, he keeps his promise and cuts the mildewed outer cord from the old mail sack.\n\nThe inner lead seal is new. It carries the same two chips as the retired Tide Route stamp, and blue-grey resin from the lakewood boardwalk clings to the sack's base. Eli hands you the cord. “Someone wants us to believe this sack drifted at sea for three years.”\n\n[widget: clues, add: 1]\n[reputation: npc="Eli Rook" action="repaired-the-boat-and-inspected-the-mail-sack-together"]\n[inventory: action="add" item="North Ferry lead seal" count="1" rarity="rare" detail="An old outer cord around a new inner seal, marked with blue-grey resin from the lakewood boardwalk."]\n[state: value="Trace the disguised mail sack through the lakewood resin"]\n[widget: energy, remove: 5]\n[choices: "Ask Eli which lakewood landing uses blue-grey resin"|"Inspect the unregistered boat's draft marks in the mud"|"Carry the seal back to Drift Harbor and compare the future postmark"]`,
        imageSubject: 'others', imageCharacterId: 'eli-rook',
        imagePrompt: 'FIRST-PERSON conversation view toward Eli Rook holding a cut lead seal beside a repaired shallow boat, adult man age 38, close-shaved head, silver hoop in left ear, oil-darkened hands, focused suspicious expression, player off-camera, cinematic editorial gouache, no readable text, no UI, 4:3',
      },
    },
    {
      action: s(locale, '先查看无登记船留下的靠岸痕迹', "Inspect the unregistered boat's landing traces first"),
      when: { locations: [s(locale, '北渡口', 'North Ferry')] },
      turn: {
        match: [s(locale, '先查看无登记船留下的靠岸痕迹', "Inspect the unregistered boat's landing traces first")],
        content: zh
          ? `你先走到修理轨尽头的泥滩。那艘船的吃水线很浅，却留下两道异常深的拖痕：靠岸时它装着重物，卸下信袋后才被推上轨道。拖痕里嵌着一小片蓝灰树脂，只在湖林木道的防滑层里使用。\n\n伊莱蹲下看了一眼：“船从湖林来。所谓‘海上漂来的旧信’，是有人故意做旧的。”\n\n[widget: clues, add: 1]\n[state: value="查明谁从湖林运来做旧的信袋"]\n[choices: "回修理棚和伊莱一起打开信袋封印"|"沿泥滩寻找搬运重物的第二个人"|"记录船的吃水线并带回漂港"]`
          : `You walk to the mud beyond the repair rails first. The boat rides shallow, yet it left two unusually deep drag marks: it carried heavy cargo when it landed and was hauled onto the rails only after the mail sack came off. A chip of blue-grey resin lies in one groove, a material used only on the lakewood boardwalk.\n\nEli crouches beside it. “The boat came from the lakewoods. Someone deliberately aged those so-called sea-drift letters.”\n\n[widget: clues, add: 1]\n[state: value="Learn who brought the artificially aged mail sack from the lakewoods"]\n[choices: "Return to the repair shed and open the mail sack with Eli"|"Follow the mud for signs of a second person carrying the cargo"|"Record the draft line and take the evidence back to Drift Harbor"]`,
        imageSubject: 'environment',
        imagePrompt: 'FIRST-PERSON view down a muddy ferry landing with two deep boat drag grooves and one tiny chip of blue-grey resin, shallow repair rails leading to a coastal shed, player off-camera, cinematic editorial gouache, no hands, no readable text, no UI, 4:3',
      },
    },
    {
      action: s(locale, '向伊莱询问修好渡船去湖林还缺什么', 'Ask Eli what the ferry still needs before it can reach the lakewoods'),
      when: { locations: [s(locale, '北渡口', 'North Ferry')] },
      turn: {
        match: [s(locale, '向伊莱询问修好渡船去湖林还缺什么', 'Ask Eli what the ferry still needs before it can reach the lakewoods')],
        content: zh
          ? `伊莱没有给你一个遥远的愿望清单。他敲了敲船尾唯一空着的位置：“缺一只湖林制的树脂滤筒。今晚那艘无登记船本来装着一只，卸信袋的人顺手带走了。”\n\n这把“恢复渡船”变成了眼前可追的线索：找到拿走滤筒的人，就能同时追到信袋来源，并打开去湖林的公共路线。\n\n[state: value="找回被卸信人带走的湖林树脂滤筒"]\n[choices: "查看信袋底部是否留下滤筒树脂"|"去泥滩追查卸货人的脚印"|"请伊莱先画出能安装滤筒的湖林渡船"]`
          : `Eli does not give you a distant wish list. He taps the only empty fitting at the stern. “One lakewood resin filter. The unregistered boat had one tonight, and whoever unloaded the mail sack took it.”\n\nReopening the ferry is now a concrete lead: find the person carrying the filter, and you can trace the mail sack while opening the public route to the lakewoods.\n\n[state: value="Recover the lakewood resin filter taken by the person who unloaded the mail sack"]\n[choices: "Inspect the mail sack for resin left by the missing filter"|"Follow the unloader's footprints across the mud"|"Ask Eli to sketch the lakewood boat that accepts this filter"]`,
        imageSubject: 'others', imageCharacterId: 'eli-rook',
        imagePrompt: 'FIRST-PERSON conversation view toward Eli Rook pointing at one clearly empty filter fitting in a shallow ferry stern, adult mechanic with close-shaved head and silver hoop in left ear, practical focused expression, player off-camera, cinematic editorial gouache, no readable text, no UI, 4:3',
      },
    },
  ]
  const inspectBox = followups.find((entry) => entry.action === s(locale, '先检查旧邮棚里的投信箱', 'Inspect the letter box inside the old tide shelter'))
  if (inspectBox) {
    const action = s(locale, '打开旧邮棚里刚刚响动的投信箱', 'Open the letter box that just moved inside the old tide shelter')
    followups.push({ action, when: inspectBox.when, turn: { ...inspectBox.turn, match: [action] } })
  }
  return [
    ...routeActions.map((action) => ({ action, when: { locations: [s(locale, '漂港·旧邮局', 'Drift Harbor · Old Post Office')] }, turn: { match: [action], content: salt, imageSubject: 'environment' as const, imagePrompt: 'OBSERVER WIDE SHOT of one adult traveler crossing an old saltmarsh causeway at low tide, ochre-coated adult route surveyor emerging from sea mist ahead, third survey stake and dry rope visible, windswept cinematic editorial gouache, no readable text, no UI, 4:3' } })),
    ...ferryActions.map((action) => ({ action, when: { locations: [s(locale, '漂港·旧邮局', 'Drift Harbor · Old Post Office')] }, turn: { match: [action], content: ferry, imageSubject: 'others' as const, imageCharacterId: 'eli-rook', imagePrompt: 'OBSERVER MEDIUM-WIDE SHOT inside a coastal ferry repair shed, adult mechanic Eli Rook beside a shallow-draft boat on rails, close-shaved head, silver hoop left ear, faded blue coat and rust-red scarf, adult traveler small and secondary, cinematic editorial gouache, no readable text, no UI, 4:3' } })),
    ...followups,
  ]
}

function domainRules(locale: Locale): DomainActionRule[] {
  return [
    {
      id: 'catch-breath', intent: s(locale, '短休并保留当前旅程', 'Take a short rest without abandoning the journey'),
      choiceLabel: s(locale, '在当前安全处休息四十五分钟', 'Rest here safely for forty-five minutes'), recommend: false,
      match: [s(locale, '休息四十五分钟', 'rest for forty-five minutes'), s(locale, '短休', 'short rest'), s(locale, '靠窗休息', 'rest by the window')], intentGuard: 'rest-commitment',
      requirements: [{ type: 'danger', phases: ['calm'], reason: s(locale, '眼前的危险还没有解除，必须先应对或明确撤离。', 'The immediate danger must be handled or explicitly left first.') }],
      effects: [{ type: 'stat', id: 'energy', delta: 20 }, { type: 'clock-add', minutes: 45 }],
      successText: s(locale, '你在眼前确实安全的地方停下四十五分钟。呼吸和双腿慢慢恢复，之前正在追查的来信、路线和约定都没有被清空。', 'You stop for forty-five minutes in a place that is actually safe. Your breathing and legs recover; the letter, route, and promises already in motion remain intact.'),
      successChoices: [], successContinuation: 'resume', rejectionContinuation: 'resume',
    },
    {
      id: 'post-office-shift', intent: s(locale, '完成一次邮局分拣短工', 'Complete one paid sorting shift'),
      choiceLabel: s(locale, '帮艾达分拣风暴后的旧信（报酬 6）', 'Sort storm mail for Ada (pay 6)'), recommend: true, rank: 20,
      match: [s(locale, '帮艾达清点档案柜', 'help Ada audit the cabinet'), s(locale, '留在邮局帮艾达', 'stay and help Ada'), s(locale, '分拣短工', 'sorting shift')],
      requirements: [{ type: 'map', nodeId: 'old-post-office', reason: s(locale, '这份工作只在漂港旧邮局进行。', 'This work is available only at the Old Post Office.') }, { type: 'stat', id: 'energy', min: 6, reason: s(locale, '至少需要 6 点精力才能完成分拣。', 'You need at least 6 energy to finish the sorting.') }],
      effects: [{ type: 'stat', id: 'energy', delta: -6 }, { type: 'stat', id: 'coin', delta: 6 }, { type: 'clock-add', minutes: 35 }],
      repeatPolicy: { scope: 'location-day', reason: s(locale, '今天这批旧信已经分拣完了，艾达没有虚构第二份相同工作。', 'Today’s storm mail is already sorted; Ada does not invent a duplicate shift.') },
      successText: s(locale, '你和艾达按受潮程度分开旧信，又核对档案柜里缺失的潮汐旧戳。三十五分钟后，她当面把 6 枚旅费交给你；这份短工已经结清。', 'You and Ada sort the old letters by water damage and audit the missing Tide Route stamp. Thirty-five minutes later she pays you 6 travel coin in person; the shift is settled.'),
      successChoices: [s(locale, '前往盐沼旧堤，寻找旧邮路', 'Travel along Saltmarsh Causeway with the letter'), s(locale, '去北渡口追查今夜靠岸的人', 'Go to North Ferry and ask who landed tonight')],
    },
    {
      id: 'buy-road-ration', intent: s(locale, '明确购买一份路粮', 'Explicitly buy one road ration'),
      choiceLabel: s(locale, '花 3 枚旅费买一份路粮', 'Buy one road ration for 3 coin'), recommend: false,
      match: [s(locale, '买一份路粮', 'buy one road ration')], matchMode: 'contains',
      requirements: [{ type: 'capability', id: 'supplies', reason: s(locale, '这里没有正在营业的补给点。', 'There is no open supply point here.') }, { type: 'stat', id: 'coin', min: 3, reason: s(locale, '需要 3 枚旅费；余额不足时不会自动购买。', 'It costs 3 coin; no purchase occurs when funds are insufficient.') }, { type: 'fact', id: 'road_ration_bought', notEquals: true, reason: s(locale, '行囊已经装下一份路粮，切片阶段不再重复推荐。', 'Your pack already holds one ration; the slice will not repeat this purchase.') }],
      effects: [{ type: 'stat', id: 'coin', delta: -3 }, { type: 'fact', id: 'road_ration_bought', value: true }, { type: 'inventory', action: 'add', itemId: 'road-ration', count: 1, item: { id: 'road-ration', label: s(locale, '一日路粮', 'One-day road ration'), count: 1, detail: s(locale, '盐饼、苹果干和一小瓶净水。', 'Salt biscuits, dried apple and a small bottle of clean water.') } }],
      successText: s(locale, '你明确付出 3 枚旅费，拿到一份路粮。钱与物品在同一回合完成交接。', 'You explicitly pay 3 coin and receive one road ration. Payment and item transfer settle in the same turn.'),
      successChoices: [s(locale, '查看当前两条离港路线', 'Review the two routes out of town')],
    },
  ]
}

function make(locale: Locale): StoryCartridge {
  const openings = openingTurns(locale)
  return {
    schemaVersion: 1,
    id: 'letters-from-afar',
    locale,
    coverImage,
    entryImage,
    copy: {
      title: s(locale, '远方来信', 'Letters from Afar'),
      subtitle: s(locale, '漂港 · 风暴后的第一夜', 'Drift Harbor · first night after the storm'),
      promise: s(locale, '一封来自三年后的信，邀请你走进一片刚刚重新连通的大陆。', 'A letter from three years ahead invites you into a continent reconnecting after the storm.'),
      enter: s(locale, '拆开未来的来信', 'Open the letter from the future'),
      continue: s(locale, '继续远行', 'Continue the journey'),
      customAction: s(locale, '也可以写下任何想做的事', 'Or write anything you want to do'),
      itemImagingTitle: s(locale, '正在记录旅途物件', 'Recording the travel object'),
      itemImagingBody: s(locale, '不用等待；完成后会出现在行囊中。', 'No need to wait; it will appear in your pack when ready.'),
    },
    theme: { outer: '#101719', surface: '#182629', paper: '#E8E1CF', ink: '#263335', muted: '#74817C', accent: '#397F78', danger: '#B85F53', gold: '#C49358', material: 'wayfarer' },
    audioTheme: { material: 'wayfarer', bpm: 64, rootHz: 146.83, scale: [0, 2, 5, 7, 9], levels: { music: 0.04, ambient: 0.12, sfx: 0.17, master: 0.72 }, tension: [{ statId: 'energy', direction: 'low', weight: 0.45 }, { statId: 'coin', direction: 'low', weight: 0.2 }, { statId: 'clues', direction: 'low', weight: 0.35 }] },
    itemImageDirection: 'EDITORIAL GOUACHE TRAVEL-ARCHIVE OBJECT, matte painted shapes, cold-press paper grain, weathered natural materials, storm-after palette of sea green, slate and amber. Object only, no people, no readable text, no letters, numbers, logos or UI.',
    sceneImageDirection: 'CINEMATIC EDITORIAL GOUACHE, matte opaque brush shapes, cold-press paper grain, storm-after road movie, sea green, slate, weathered cream and signal amber. Alternate genuine first-person perception with observer wide shots. No readable text, no signage, no UI.',
    sceneImageAvoid: 'centered avatar portrait, same camera angle repeatedly, generic fantasy city, readable letters, floating text, player face in first-person view',
    imageDirector: { maxQuietTurns: 2, softCooldownTurns: 1, guaranteedTriggers: ['new-location', 'character-expression', 'relationship-change'], softTriggers: ['objective-change', 'chapter-checkpoint', 'rare-item'] },
    director: {
      mode: 'open-world', maxActiveThreads: 3,
      fixedWorldRules: [
        s(locale, '未来来信只能提供线索，不能替玩家决定路线或行动。', 'Future letters offer clues but never choose routes or actions for the player.'),
        s(locale, '地点、人物、路线、图片和选项必须引用同一个当前现场。', 'Location, characters, route, image and choices must all refer to the same current scene.'),
        s(locale, '共享世界只能改变公共环境与可选机会，不能替玩家完成私人任务。', 'The shared world changes public conditions and opportunities, never completing private quests.'),
        s(locale, '花费必须由玩家明确选择；获得报酬必须在同一回合结算。', 'Spending requires explicit player choice; earned pay settles in the same turn.'),
      ],
      generationRules: [
        s(locale, '优先承接当前未解决的现场、旅程与人物承诺，再生成新事件。', 'Continue the active incident, journey and character promise before generating a new event.'),
        s(locale, '每回合最多引入一个陌生世界词，并通过可见用途解释。', 'Introduce at most one unfamiliar world term per turn and explain it through visible use.'),
        s(locale, '推荐 1–5 个确实成立的具体行动，不为凑数显示断头路。', 'Recommend 1–5 concrete executable actions and never show dead ends merely to fill a quota.'),
      ],
      choiceIntents: [s(locale, '处理眼前尚未解决的事', 'handle the unresolved event in front of you'), s(locale, '继续已选择的路线或承诺', 'continue the chosen route or promise'), s(locale, '查看当前地点的具体证据', 'inspect concrete evidence at the current place')],
    },
    dangerDirector: {
      minSafeTurns: 3, maxSafeTurns: 5, cooldownTurns: 3, escalationStats: ['energy', 'coin'],
      threatPalette: [s(locale, '潮水切断盐沼低路', 'the tide cuts off the low saltmarsh road'), s(locale, '风暴损坏的路面继续坍塌', 'storm-damaged road surface continues to collapse'), s(locale, '陌生人试图取走未登记的信袋', 'a stranger tries to take the unregistered mail sack')],
      threatLocations: { '潮水切断盐沼低路': ['saltmarsh-causeway'], 'the tide cuts off the low saltmarsh road': ['saltmarsh-causeway'] },
      methods: [s(locale, '先确认眼前证据和时间窗口', 'Confirm the evidence and time window'), s(locale, '承担代价继续当前承诺', 'Pay a cost to continue the current promise'), s(locale, '明确撤离并保留线索', 'Withdraw explicitly while preserving the clue')],
      physicalCombat: 'rare', resolution: { skill: s(locale, '判断', 'Judgment'), modifier: 2, dcBySeverity: [7, 9, 11, 13, 15], fallbackCosts: [{ statId: 'energy', operation: 'remove', amount: 10 }] },
    },
    initialFacts: { world_day: 1, letters_received: 1, road_ration_bought: false, shared_world_cursor: 0 },
    statDefinitions: [
      { id: 'energy', label: s(locale, '精力', 'Energy'), min: 0, max: 100, initial: 78, display: 'bar', inverse: true, warningAt: 28, dangerAt: 8, maxDelta: 24, domainMaxDelta: 36, description: s(locale, '还能承受多少赶路、工作和风险。安全短休恢复 20；精力归零后只能恢复、求助或撤回，旅程不会被清空。', 'How much travel, work and risk you can bear. A safe short rest restores 20; at zero, recover, seek help or withdraw without erasing the journey.'), floorRule: { threshold: 0, enteredText: s(locale, '你的精力耗尽，当前行动没有完成；原来的路线和后果仍然存在。', 'Your energy is exhausted and the action does not complete; the route and its consequences remain.'), blockedText: s(locale, '身体已经无法继续这项行动。先恢复、求助或撤回；当前旅程不会被清空。', 'You cannot physically continue this action. Recover, seek help or withdraw; the current journey remains.'), recoveryChoices: [s(locale, '原地安全短休四十五分钟', 'Take a safe forty-five-minute rest'), s(locale, '向当前认识的人求助', 'Ask a known person here for help'), s(locale, '撤回最近的安全地点', 'Withdraw to the nearest safe place')], allowedDomainRuleIds: ['catch-breath'] } },
      { id: 'coin', label: s(locale, '旅费', 'Travel coin'), min: 0, max: 99, initial: 8, display: 'number', unit: s(locale, '枚', ''), inverse: true, warningAt: 3, dangerAt: 0, maxDelta: 30, description: s(locale, '可以立即使用的旅费。只有玩家明确购买、乘车或住宿时才扣除；已完成工作当回合结算。', 'Spendable travel money. It is deducted only after an explicit purchase, fare or lodging choice; completed work pays in the same turn.') },
      { id: 'clues', label: s(locale, '信迹', 'Letter clues'), min: 0, max: 12, initial: 0, display: 'bar', inverse: true, warningAt: 0, dangerAt: 0, maxDelta: 2, description: s(locale, '已经验证的未来来信证据，不是普通传闻。达到 4、8、12 时分别打开新的信层、白塔区域与最终回应。', 'Verified evidence about the future letters, not ordinary rumor. At 4, 8 and 12 it opens new letter layers, the White Tower region and the final reply.') },
    ],
    domainRules: { authorityMode: 'shadow', rules: domainRules(locale) },
    drawerLabels: { party: s(locale, '人物关系', 'Relations'), map: s(locale, '远行地图', 'Journey map'), inventory: s(locale, '行囊', 'Pack'), log: s(locale, '来信与路册', 'Letters & journal') },
    opening: {
      location: s(locale, '漂港·旧邮局', 'Drift Harbor · Old Post Office'),
      time: s(locale, '第 1 天 · 18:40', 'Day 1 · 18:40'),
      objective: s(locale, '查明这封来自三年后的信如何进入旧邮局。', 'Learn how a letter from three years ahead entered the old post office.'),
      imagePrompt: 'OBSERVER WIDE ESTABLISHING SHOT inside a storm-dark coastal post office at night, adult traveler seen small from behind at a wooden sorting counter, completely dry cream envelope beneath a green lamp, Ada Vale at the archive cabinet, rain on every window, cinematic editorial gouache, no readable text, no signage, no UI, 4:3',
      blocks: [
        { id: 'opening-1', kind: 'narration', text: s(locale, '风暴刚停。你在漂港旧邮局帮忙把被雨打湿的信移到高处，窗外的街道还泡在浅水里。', 'The storm has just stopped. Inside Drift Harbor’s old post office, you help move rain-soaked letters to high shelves while shallow water still covers the street.') },
        { id: 'opening-2', kind: 'narration', text: s(locale, '投信口忽然响了一声。一只完全干燥的奶油色信封落在湿地板上，像是刚从另一个房间递进来。', 'The mail slot clicks. A completely dry cream envelope lands on the wet floor as if passed from another room.') },
        { id: 'opening-3', kind: 'narration', text: s(locale, '信封写着你的名字，笔迹也是你的。邮戳日期却在三年以后。', 'The envelope bears your name in your own handwriting. The postmark is dated three years ahead.') },
        { id: 'opening-4', kind: 'dialogue', speaker: s(locale, '艾达·维尔', 'Ada Vale'), tone: s(locale, '克制的惊惧', 'controlled fear'), text: s(locale, '档案柜旁的女人停下钥匙。你认识她：旧邮局的临时代办员艾达·维尔。她盯着邮戳说：“我没有盖过它。那枚戳三年前就锁起来了。”', 'The woman at the archive cabinet stops turning her key. You know her: Ada Vale, the old post office’s acting keeper. Watching the mark, she says, “I did not stamp that. The stamp was locked away three years ago.”') },
      ],
      choices: [
        { id: 'inspect-postmark', label: s(locale, '在灯下检查三年后的邮戳', 'Inspect the postmark dated three years ahead') },
        { id: 'ask-ada', label: s(locale, '让艾达说清她为何害怕这封信', 'Ask Ada why the letter frightens her') },
        { id: 'check-outside', label: s(locale, '查看门外是谁留下了干燥脚印', 'Check who left the dry footprints outside') },
      ],
      deterministicTurns: openings,
    },
    characters: cast(locale),
    initialMap: map(locale),
    initialInventory: [{ id: 'future-letter-01', label: s(locale, '三年后的来信', 'Letter from three years ahead'), count: 1, rarity: 'legendary', detail: s(locale, '写着你的名字和笔迹，邮戳日期却在三年以后。', 'It bears your name and handwriting, but its postmark is three years ahead.'), effect: s(locale, '提供远方路线与白塔线索；不会替你决定行动。', 'Offers route and White Tower clues without choosing actions for you.'), imagePrompt: 'single dry cream envelope with one chipped circular postmark but no readable letters or numbers, weathered wooden sorting desk, green lamp light, editorial gouache object plate, no hands, no people, no text, square' }],
    deterministicChoiceTurns: routeTurns(locale),
    demoTurns: [...Object.values(openings), ...routeTurns(locale).map((entry) => entry.turn)],
  }
}

export const lettersFromAfar = make('zh')
export const lettersFromAfarEn = make('en')
