import type { CharacterDefinition, DeterministicChoiceTurn, Locale, MapNode } from '../types'

const s = (locale: Locale, zh: string, en: string) => locale === 'zh' ? zh : en

export function lettersExpansionCast(locale: Locale): CharacterDefinition[] {
  return [
    {
      id: 'lena-voss',
      name: s(locale, '莉娜·沃斯', 'Lena Voss'),
      role: s(locale, '41 岁 · 横风农场协调员', 'Age 41 · Crosswind Farm coordinator'),
      vitality: 74,
      stress: 46,
      initialStatus: 'known',
      hiddenUntilIntroduced: true,
      detail: s(locale, '为草原聚落协调收成、用水与运输，不愿让新道路只服务远方城市。', 'Coordinates harvests, water and transport for grassland settlements, and refuses to let the rebuilt road serve only distant cities.'),
      visualIdentity: {
        status: 'anchored', version: 1, source: 'authored',
        appearance: 'Adult woman, age 41, sun-browned freckled skin, compact strong build, dark copper curls cut at the jaw, steady hazel eyes.',
        immutableTraits: ['jaw-length dark copper curls', 'freckled sun-browned skin', 'steady hazel eyes'],
        wardrobe: ['indigo work shirt', 'sand canvas vest', 'green survey notebook'],
        forbiddenDrift: ['no long hair', 'no formal suit', 'no wide-brim hat'],
      },
      skills: [{ id: 'coordination', label: s(locale, '协调', 'Coordination'), value: 4 }],
    },
    {
      id: 'anja-moss',
      name: s(locale, '安雅·莫斯', 'Anja Moss'),
      role: s(locale, '46 岁 · 湖上驿站管理员', 'Age 46 · keeper of the Floating Post'),
      vitality: 68,
      stress: 27,
      initialStatus: 'known',
      hiddenUntilIntroduced: true,
      detail: s(locale, '管理杉湖上的邮船和未署名回信，记得哪些人主动不想被找到。', 'Keeps the Cedar Lake mail boat and its unsigned replies, remembering who chose not to be found.'),
      visualIdentity: {
        status: 'anchored', version: 1, source: 'authored',
        appearance: 'Adult woman, age 46, light brown skin, straight black hair streaked silver and tied at the nape, long calm face, dark attentive eyes.',
        immutableTraits: ['black hair with one silver streak', 'hair tied at the nape', 'long calm face'],
        wardrobe: ['moss-green lake coat', 'cream cable-knit collar', 'small brass whistle'],
        forbiddenDrift: ['no loose hair', 'no sailor cap', 'no bright red clothing'],
      },
      skills: [{ id: 'delivery-memory', label: s(locale, '投递记忆', 'Delivery memory'), value: 4 }],
    },
    {
      id: 'noor-hale',
      name: s(locale, '努尔·黑尔', 'Noor Hale'),
      role: s(locale, '32 岁 · 巡回医护', 'Age 32 · traveling medic'),
      vitality: 79,
      stress: 34,
      initialStatus: 'known',
      hiddenUntilIntroduced: true,
      detail: s(locale, '往返湖林和草原的小聚落，判断一条路是否真正对行动不便的人开放。', 'Moves between small lakewood and grassland settlements, judging whether a road is truly open to people who cannot travel alone.'),
      visualIdentity: {
        status: 'anchored', version: 1, source: 'authored',
        appearance: 'Adult nonbinary person, age 32, medium brown skin, short dense black curls, oval wire glasses, composed direct gaze.',
        immutableTraits: ['short dense black curls', 'oval wire glasses', 'composed direct gaze'],
        wardrobe: ['charcoal rain cape', 'teal medical satchel', 'soft grey scarf'],
        forbiddenDrift: ['no long hair', 'no white lab coat', 'no military insignia'],
      },
      skills: [{ id: 'field-care', label: s(locale, '野外医护', 'Field care'), value: 4 }],
    },
  ]
}

export function lettersExpansionMap(locale: Locale): MapNode[] {
  return [
    { id: 'beacon-yard', label: s(locale, '灯场维修院', 'Beacon Yard'), connectedTo: 'drift-harbor', detail: s(locale, '修理浮标、路灯和旧邮车的海岸公共工场。', 'A public coastal workshop repairing buoys, road lamps and old mail vans.'), capabilities: ['work', 'supplies'] },
    { id: 'crosswind-farm', label: s(locale, '横风农场', 'Crosswind Farm'), connectedTo: 'old-highway-lodge', detail: s(locale, '围绕风泵和蓄水塔生长的草原合作农场。', 'A grassland cooperative built around wind pumps and water towers.'), capabilities: ['rest', 'work', 'supplies'], routeHints: [s(locale, '北侧风泵', 'north wind pump'), s(locale, '公共粮仓', 'community granary')] },
    { id: 'migrant-market', label: s(locale, '候鸟集市', 'Migrant Market'), connectedTo: 'crosswind-farm', detail: s(locale, '每三天随车队迁移一次的草原市场。', 'A grassland market that moves with its caravan every three days.'), capabilities: ['rest', 'work', 'supplies'] },
    { id: 'whitebird-marsh', label: s(locale, '白鸟湿地', 'Whitebird Marsh'), connectedTo: 'migrant-market', detail: s(locale, '候鸟季会改变通行规则的草原湿地。', 'A grassland wetland whose travel rules change during migration season.') },
    { id: 'cedar-lake', label: s(locale, '杉湖镇', 'Cedar Lake'), connectedTo: 'north-ferry', detail: s(locale, '木材与渔业退潮后仍围绕水路生活的湖边聚落。', 'A lakeside settlement still organized around water routes after timber and fishing declined.'), capabilities: ['rest', 'work', 'supplies'], routeHints: [s(locale, '北木码头', 'north timber landing')] },
    { id: 'floating-post', label: s(locale, '湖上驿站', 'Floating Post'), connectedTo: 'cedar-lake', detail: s(locale, '停在杉湖上的邮船与消息交换处。', 'A mail boat and message exchange moored on Cedar Lake.'), capabilities: ['rest', 'work'], routeHints: [s(locale, '未署名信柜', 'unsigned-letter cabinet')] },
    { id: 'moss-bridge', label: s(locale, '苔桥', 'Moss Bridge'), connectedTo: 'cedar-lake', detail: s(locale, '通往山地的旧木桥，路标经常指向不同方向。', 'An old timber bridge toward the mountains whose signs often disagree.') },
    { id: 'glasshouse-clinic', label: s(locale, '玻璃房疗养院', 'Glasshouse Clinic'), connectedTo: 'floating-post', detail: s(locale, '以旧温室改成的湖林诊所，仍接待远路来客。', 'A lakewood clinic built from old greenhouses and still receiving distant travelers.'), capabilities: ['rest', 'supplies'] },
  ]
}

export function lettersExpansionTurns(locale: Locale): DeterministicChoiceTurn[] {
  const zh = locale === 'zh'
  const saltEvidenceActions = [
    s(locale, '把潮位纸交给米拉核对最近三次退潮', 'Give the tide slip to Mira and compare the last three low tides'),
    s(locale, '趁低路未淹继续检查下一根测路桩', 'Inspect the next survey stake before the low road floods'),
  ]
  const lakeEvidenceActions = [
    s(locale, '请伊莱辨认能沾上蓝灰树脂的湖林码头', 'Ask Eli which lakewood landing uses blue-grey resin'),
    s(locale, '回修理棚和伊莱一起打开信袋封印', 'Return to the repair shed and open the mail sack with Eli'),
    s(locale, '查看信袋底部是否留下滤筒树脂', 'Inspect the mail sack for resin left by the missing filter'),
  ]
  const toLodgeActions = [
    s(locale, '去旧公路旅舍核对三年前谁使用潮汐旧戳', 'Go to the Old Highway Lodge and identify who used the Tide Route stamp three years ago'),
    s(locale, '趁潮路未断去旧公路旅舍追查潮汐旧戳', 'Reach the Old Highway Lodge before high tide and trace the Tide Route stamp'),
  ]
  const toLakeActions = [
    s(locale, '乘修好的浅水船前往杉湖镇', 'Take the repaired shallow boat to Cedar Lake'),
    s(locale, '沿蓝灰树脂的来源去杉湖镇', 'Follow the blue-grey resin trail to Cedar Lake'),
  ]

  const saltEvidence = zh
    ? `米拉把潮位纸贴在路册的透明页上。三个孔位分别落在最近三次退潮后的同一分钟，而下一次对应时刻指向草原边缘的旧公路旅舍。那里的旅客簿，也许能确认三年前谁使用过潮汐旧戳。\n\n她没有催你追主线：“涨潮前，旅舍仍是可选的下一站；证据也可以带回漂港。两边都不会抹掉这里已经查明的事。”\n\n[widget: clues, add: 1]\n[state: value="查明三年前盐沼记录指向的旧戳使用者"]\n[choices: "去旧公路旅舍核对三年前谁使用潮汐旧戳"|"返回漂港，请艾达用潮位纸查旧戳领用记录"]`
    : `Mira lays the tide slip over a transparent ledger page. Its three holes fall on the same minute after each of the last three low tides, while the next matching time points toward the Old Highway Lodge at the grassland edge. Its guest book may identify who used the Tide Route stamp three years ago.\n\nShe does not push you toward the mystery. “Before high tide, the lodge remains one possible next stop. The evidence can also return to Drift Harbor. Neither choice erases what we learned here.”\n\n[widget: clues, add: 1]\n[state: value="Identify the retired stamp user indicated by the three-year-old saltmarsh record"]\n[choices: "Go to the Old Highway Lodge and identify who used the Tide Route stamp three years ago"|"Return to Drift Harbor and ask Ada to check the tide slip against the stamp log"]`

  const lakeEvidence = zh
    ? `伊莱用刀背刮下一点蓝灰树脂，放到灯下。里面混着细小杉针，配方只在杉湖镇北木码头使用。无登记船不是从海上漂来，而是今夜从湖林驶到这里。\n\n他把刚修好的浅水船推下轨道：“我可以送你到杉湖镇。也可以先留下，把这艘船的失窃滤筒查清。”\n\n[state: value="到杉湖镇追查今夜运来的旧信袋"]\n[choices: "乘修好的浅水船前往杉湖镇"|"留在北渡口追查被拿走的树脂滤筒"]`
    : `Eli scrapes a fleck of blue-grey resin with the back of his knife and holds it beneath the lamp. Tiny cedar needles are mixed into it; that formula is used only at Cedar Lake's north timber landing. The unregistered boat did not drift in from the sea. It came from the lakewoods tonight.\n\nHe pushes the repaired shallow boat down the rails. “I can take you to Cedar Lake. Or we stay and identify who took this boat's resin filter.”\n\n[state: value="Reach Cedar Lake and trace the old mail sack delivered tonight"]\n[choices: "Take the repaired shallow boat to Cedar Lake"|"Stay at North Ferry and trace the missing resin filter"]`

  const lodgeArrival = zh
    ? `最后一段盐沼路爬上干燥地面时，风里第一次出现草籽的味道。旧公路旅舍坐在两条废线交叉处，门廊下挂着一排晾干的路线牌。\n\n一名深铜色短卷发的女人正在把农场供水单钉到公告板上。她先把纸角压平才自我介绍：“莉娜·沃斯，横风农场。我们的北侧风泵停了，运水车却被新公路工程借走了。”\n\n旅舍柜台保存着三年前的旅客簿；莉娜则能带你进入草原。两件事都在眼前，但没有一件会替另一件自动完成。\n\n[character_update: character_id="lena-voss" character="莉娜·沃斯" role="41 岁 · 横风农场协调员" detail="在旧公路旅舍寻找水泵零件和临时运水办法" vitality="74" stress="46"]\n[map_update: new_location="旧公路旅舍" location_id="old-highway-lodge" connected_to="盐沼旧堤" detail="草原边缘的安全旅舍；保存三年前的旅客簿和横风农场的供水告示"]\n[clock: value="第 1 天 · 20:05"]\n[widget: energy, remove: 7]\n[choices: "翻查三年前同一退潮日的旅客簿"|"请莉娜说明供水单上眼下缺什么"|"先在柜台登记今晚的通行时间"]`
    : `The last stretch of saltmarsh road climbs onto dry ground, and for the first time the wind smells of grass seed. The Old Highway Lodge sits where two abandoned routes cross, with drying route boards beneath its porch.\n\nA woman with short dark-copper curls is pinning a farm water notice to the board. She flattens its corner before introducing herself. “I’m Lena Voss, from Crosswind Farm. Our north wind pump stopped, and the new road works borrowed the water truck.”\n\nThe lodge counter holds a guest book from three years ago; Lena can take you into the grasslands. Both matters are present, and neither resolves the other automatically.\n\n[character_update: character_id="lena-voss" character="Lena Voss" role="Age 41 · Crosswind Farm coordinator" detail="Seeking pump parts and a temporary water route at the Old Highway Lodge" vitality="74" stress="46"]\n[map_update: new_location="Old Highway Lodge" location_id="old-highway-lodge" connected_to="Saltmarsh Causeway" detail="A safe lodge at the grassland edge, holding a three-year-old guest book and Crosswind Farm's water notice"]\n[clock: value="Day 1 · 20:05"]\n[widget: energy, remove: 7]\n[choices: "Check the guest book for the same low-tide date three years ago"|"Ask Lena what the water notice needs right now"|"Record tonight's passage time at the lodge counter first"]`

  const lodgeToFarm = zh
    ? `莉娜把供水单翻到背面，画出北侧风泵、公共粮仓和还剩半塔水的蓄水池。她不要求你“拯救农场”，只需要你陪她确认风泵究竟是皮带断裂，还是新道路施工切走了传动轴。\n\n你们沿旅舍后的旧公路进入长风草原。一个小时后，横风农场的风泵叶片一动不动，蓄水塔的刻度正在缓慢下降。两名农工已经拆开护盖：皮带上有一道新裂口，工具箱旁压着施工队借用传动轴的签收记录。两人各自愿意转动一次机构，演示自己判断的故障位置。\n\n[map_update: new_location="横风农场" location_id="crosswind-farm" connected_to="旧公路旅舍" detail="北侧风泵停止；蓄水塔仍有半塔水，皮带裂口与传动轴签收记录都在现场"]\n[clock: value="第 1 天 · 21:10"]\n[widget: energy, remove: 9]\n[state: value="在蓄水下降前确认北侧风泵的真实故障"]\n[choices: "和莉娜检查风泵皮带上的新裂口"|"查看施工队借走传动轴的签收记录"|"先让两名农工分别演示他们的判断"]`
    : `Lena turns the water notice over and sketches the north wind pump, community granary and a tank still half full. She does not ask you to “save the farm.” She needs you to confirm whether the pump belt snapped or the new road crew removed its drive shaft.\n\nYou follow the old road behind the lodge into Longwind Steppe. An hour later, the wind-pump blades at Crosswind Farm stand still while the tank gauge sinks. Two farm workers have removed the guard: the belt has a fresh split, and the road crew's drive-shaft receipt lies beneath the toolbox. Each worker offers to turn the mechanism once and demonstrate the fault they believe is real.\n\n[map_update: new_location="Crosswind Farm" location_id="crosswind-farm" connected_to="Old Highway Lodge" detail="The north wind pump has stopped; half a tank remains, with both a split belt and the drive-shaft receipt at the scene"]\n[clock: value="Day 1 · 21:10"]\n[widget: energy, remove: 9]\n[state: value="Identify the north wind pump's real failure before the tank falls further"]\n[choices: "Inspect the fresh split in the pump belt with Lena"|"Check the receipt for the drive shaft borrowed by the road crew"|"Ask each farm worker to demonstrate their diagnosis"]`

  const lakeArrival = zh
    ? `浅水船离开海湾后，水色从铅灰变成深绿。杉湖镇的房屋沿旧木道分散开来，没有一条街能从岸上看全。北木码头的防滑层正是信袋上的蓝灰树脂。\n\n码头边，一名黑发夹着银白发束的女人正在核对两只湿木箱。她抬起头才报上名字：“安雅·莫斯，湖上驿站。一个箱子送疗养院，另一个送邮船；标签都被水泡掉了。”一只箱缝透出药草气味，另一只露出几封没有署名的旧信。\n\n她认出伊莱带来的封绳，却没有立刻解释。要得到答案，你得先根据箱内可见物确认哪只送往哪里。\n\n[character_update: character_id="anja-moss" character="安雅·莫斯" role="46 岁 · 湖上驿站管理员" detail="在杉湖镇北木码头辨认两只失去标签的湿木箱" vitality="68" stress="27"]\n[map_update: new_location="杉湖镇" location_id="cedar-lake" connected_to="北渡口" detail="北木码头使用蓝灰树脂；一只湿木箱有药草气味，另一只露出未署名旧信"]\n[clock: value="第 1 天 · 20:18"]\n[widget: energy, remove: 8]\n[choices: "打开有药草气味的木箱确认疗养院用品"|"检查另一只木箱里未署名的旧信"|"先让安雅解释她为何认得北渡口封绳"]`
    : `Once the shallow boat leaves the bay, the water changes from lead grey to deep green. Cedar Lake's houses spread along old boardwalks, with no single street visible from shore. The north landing's non-slip surface is the same blue-grey resin found on the mail sack.\n\nBeside the landing, a woman whose black hair carries one silver streak is checking two wet wooden crates. Only after looking up does she give her name. “I’m Anja Moss, keeper of the Floating Post. I will help identify these crates: one goes to the clinic and one to the mail boat. Both labels washed away.” Herbs scent the gap in one crate, while several unsigned old letters show through the other.\n\nShe recognizes the cord Eli brought but does not explain yet. To earn the answer, first use what is visibly inside each crate to decide where it belongs.\n\n[character_update: character_id="anja-moss" character="Anja Moss" role="Age 46 · keeper of the Floating Post" detail="Identifying two wet, unlabeled crates at Cedar Lake's north timber landing" vitality="68" stress="27"]\n[map_update: new_location="Cedar Lake" location_id="cedar-lake" connected_to="North Ferry" detail="The north landing uses blue-grey resin; one wet crate smells of herbs and the other reveals unsigned old letters"]\n[clock: value="Day 1 · 20:18"]\n[widget: energy, remove: 8]\n[choices: "Open the herb-scented crate and confirm the clinic supplies"|"Inspect the unsigned old letters in the other crate"|"Ask why Anja recognizes the North Ferry seal cord"]`

  const lakeToPost = zh
    ? `另一只木箱里没有私人物品，只有按纸张尺寸分开的未署名回信。安雅指出其中几封边角带着与未来邮戳相同的缺口，但日期都被水洗掉。\n\n她把木箱搬上小邮船：“这些信要在湖上驿站逐封晾开。你若同行，可以亲眼看见它们原本寄给谁；留在码头也可以继续查无登记船。”\n\n邮船穿过杉木倒影，停在湖心一座由两艘旧船拼成的驿站。晾信架上，一封刚展开的回信写着横风农场旧址，而那个地点三年前就已经改名。安雅身后的投递柜按年份保存旧记录，潮汐邮路使用过的纸张样本和晾信架封口也都留在工作台上。\n\n[map_update: new_location="湖上驿站" location_id="floating-post" connected_to="杉湖镇" detail="湖心邮船正在晾开未署名回信；投递记录、纸张样本和封口都可核对"]\n[clock: value="第 1 天 · 20:42"]\n[state: value="确认未署名回信为何使用已经废弃的地名"]\n[choices: "请安雅调出改名前后的投递记录"|"检查回信纸张是否也经过潮汐邮路"|"把随身铅封与晾信架的封口逐一比对"]`
    : `The other crate contains no private belongings, only unsigned replies sorted by paper size. Anja points out several corners with the same chips as the future postmark, though water has erased every date.\n\nShe carries the crate onto a small mail boat. “These must be dried one by one at the Floating Post. Come and you can see who they were meant for. Stay here if you would rather keep tracing the unregistered boat.”\n\nThe mail boat crosses cedar reflections and moors at a post built from two old boats. On the drying rack, one newly opened reply names Crosswind Farm by a place-name abandoned three years ago. Behind Anja, delivery records are filed by year; Tide Route paper samples and the drying-rack closures both remain on the worktable.\n\n[map_update: new_location="Floating Post" location_id="floating-post" connected_to="Cedar Lake" detail="Unsigned replies dry aboard the lake post; delivery records, paper samples and closures are available for comparison"]\n[clock: value="Day 1 · 20:42"]\n[state: value="Learn why an unsigned reply uses a place-name abandoned three years ago"]\n[choices: "Ask Anja for delivery records from before and after the place-name changed"|"Check whether the reply paper also traveled through the Tide Route"|"Compare the lead seal in your pack against the drying-rack closures"]`

  return [
    ...saltEvidenceActions.map((action) => ({ action, when: { locations: [s(locale, '盐沼旧堤', 'Saltmarsh Causeway')] }, turn: { match: [action], content: saltEvidence, imageSubject: 'others' as const, imageCharacterId: 'mira-sol', imagePrompt: 'FIRST-PERSON view toward Mira Sol overlaying a punctured tide slip on a transparent route ledger at the old saltmarsh shelter, adult route surveyor with low black braid and ochre field jacket, player off-camera, cinematic editorial gouache, no readable text, no UI, 4:3' } })),
    ...lakeEvidenceActions.map((action) => ({ action, when: { locations: [s(locale, '北渡口', 'North Ferry')] }, turn: { match: [action], content: lakeEvidence, imageSubject: 'others' as const, imageCharacterId: 'eli-rook', imagePrompt: 'FIRST-PERSON view toward Eli Rook holding one blue-grey resin chip beneath a repair lamp beside a shallow boat, close-shaved adult mechanic with silver hoop in left ear, player off-camera, cinematic editorial gouache, no readable text, no UI, 4:3' } })),
    ...toLodgeActions.map((action) => ({ action, when: { locations: [s(locale, '盐沼旧堤', 'Saltmarsh Causeway')] }, turn: { match: [action], content: lodgeArrival, imageSubject: 'others' as const, imageCharacterId: 'lena-voss', imagePrompt: 'OBSERVER WIDE SHOT of the Old Highway Lodge where wet coastal road becomes open grassland, adult Lena Voss pinning a water notice beneath the porch, one traveler arriving small in frame, cinematic editorial gouache, no readable text, no UI, 4:3' } })),
    ...toLakeActions.map((action) => ({ action, when: { locations: [s(locale, '北渡口', 'North Ferry')] }, turn: { match: [action], content: lakeArrival, imageSubject: 'others' as const, imageCharacterId: 'anja-moss', imagePrompt: 'OBSERVER WIDE SHOT at Cedar Lake north timber landing, adult Anja Moss beside two wet wooden crates as a repaired shallow boat arrives, deep green lake and scattered boardwalk houses, cinematic editorial gouache, no readable text, no UI, 4:3' } })),
    {
      action: s(locale, '请莉娜说明供水单上眼下缺什么', 'Ask Lena what the water notice needs right now'),
      when: { locations: [s(locale, '旧公路旅舍', 'Old Highway Lodge')] },
      turn: { match: [s(locale, '请莉娜说明供水单上眼下缺什么', 'Ask Lena what the water notice needs right now')], content: lodgeToFarm, imageSubject: 'environment', imagePrompt: 'OBSERVER WIDE SHOT of Crosswind Farm at blue hour, one stopped wind pump above a half-full water tower, Lena Voss and two adult farm workers at the open machinery guard, traveler secondary, vast grassland, cinematic editorial gouache, no readable text, no UI, 4:3' },
    },
    {
      action: s(locale, '检查另一只木箱里未署名的旧信', 'Inspect the unsigned old letters in the other crate'),
      when: { locations: [s(locale, '杉湖镇', 'Cedar Lake')] },
      turn: { match: [s(locale, '检查另一只木箱里未署名的旧信', 'Inspect the unsigned old letters in the other crate')], content: lakeToPost, imageSubject: 'environment', imagePrompt: 'OBSERVER WIDE SHOT of a floating post built from two old mail boats on a deep green lake, racks of drying envelopes with absolutely no readable writing, Anja Moss working beneath warm lamps, traveler small and secondary, cinematic editorial gouache, no text, no UI, 4:3' },
    },
  ]
}
