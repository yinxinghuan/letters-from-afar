import type { CharacterDefinition, DeterministicChoiceTurn, Locale, MapNode } from '../types'

const s = (locale: Locale, zh: string, en: string) => locale === 'zh' ? zh : en

export function lettersInlandCast(locale: Locale): CharacterDefinition[] {
  return [
    {
      id: 'jonah-reed',
      name: s(locale, '乔纳·里德', 'Jonah Reed'),
      role: s(locale, '35 岁 · 邮车与铁路机械师', 'Age 35 · postal rail mechanic'),
      vitality: 77,
      stress: 41,
      initialStatus: 'known',
      hiddenUntilIntroduced: true,
      detail: s(locale, '修理铁路和邮车，但只愿为能够兑现的公共路线工作。', 'Repairs rail lines and mail vehicles, but works only on public routes that can keep their promises.'),
      visualIdentity: {
        status: 'anchored', version: 1, source: 'authored',
        appearance: 'Adult man, age 35, tawny brown skin, lean build, tight black curls, narrow amber eyes, old burn mark along the left forearm.',
        immutableTraits: ['tight black curls', 'narrow amber eyes', 'old burn mark on left forearm'],
        wardrobe: ['graphite rail jacket', 'mustard work gloves tucked at belt', 'small enamel postal badge'],
        forbiddenDrift: ['no beard', 'no rail cap', 'no formal uniform'],
      },
      skills: [{ id: 'rail-repair', label: s(locale, '轨道维修', 'Rail repair'), value: 4 }],
    },
    {
      id: 'bess-rook',
      name: s(locale, '贝丝·鲁克', 'Bess Rook'),
      role: s(locale, '44 岁 · 圆顶机车库领班', 'Age 44 · Roundhouse forewoman'),
      vitality: 72,
      stress: 48,
      initialStatus: 'known',
      hiddenUntilIntroduced: true,
      detail: s(locale, '能让旧列车重新运转，但拒绝用工人的安全换取通车速度。', 'Can return old trains to service, but refuses to trade worker safety for a faster reopening.'),
      visualIdentity: {
        status: 'anchored', version: 1, source: 'authored',
        appearance: 'Adult woman, age 44, deep umber skin, powerful square build, shaved sides with a short salt-and-pepper crest, broad serious face.',
        immutableTraits: ['shaved sides', 'short salt-and-pepper crest', 'powerful square build'],
        wardrobe: ['dark green boiler suit', 'cream leather shoulder guard', 'red inspection chalk'],
        forbiddenDrift: ['no long hair', 'no dress', 'no locomotive-driver cap'],
      },
      skills: [{ id: 'safe-reopening', label: s(locale, '安全复工', 'Safe reopening'), value: 4 }],
    },
    {
      id: 'ivo-thorne',
      name: s(locale, '伊沃·索恩', 'Ivo Thorne'),
      role: s(locale, '67 岁 · 旧线乘务员', 'Age 67 · former branch-line conductor'),
      vitality: 59,
      stress: 29,
      initialStatus: 'known',
      hiddenUntilIntroduced: true,
      detail: s(locale, '保存着沙下支线的旧班次记忆，坚持地图之外仍有一座车站。', 'Keeps the buried branch timetable in memory and insists a station still exists beyond the printed maps.'),
      visualIdentity: {
        status: 'anchored', version: 1, source: 'authored',
        appearance: 'Adult man, age 67, pale weathered skin, slim stooped build, swept-back white hair, heavy white eyebrows, clean-shaven lined face.',
        immutableTraits: ['swept-back white hair', 'heavy white eyebrows', 'slim stooped build'],
        wardrobe: ['patched brown conductor coat', 'faded teal waistcoat', 'small brass signal bell'],
        forbiddenDrift: ['no beard', 'no pristine uniform', 'no black top hat'],
      },
      skills: [{ id: 'lost-timetable', label: s(locale, '旧线记忆', 'Lost-line memory'), value: 4 }],
    },
    {
      id: 'jules-ansel',
      name: s(locale, '朱尔斯·安塞尔', 'Jules Ansel'),
      role: s(locale, '39 岁 · 子午观测站研究员', 'Age 39 · Meridian Observatory researcher'),
      vitality: 66,
      stress: 52,
      initialStatus: 'known',
      hiddenUntilIntroduced: true,
      detail: s(locale, '比对高原天气与白塔信号，怀疑观测记录曾被人为删改。', 'Compares plateau weather with White Tower signals and suspects the observation record was deliberately altered.'),
      visualIdentity: {
        status: 'anchored', version: 1, source: 'authored',
        appearance: 'Adult woman, age 39, olive-brown skin, tall narrow build, straight dark hair cut at the chin, one clouded left eye and one sharp brown eye.',
        immutableTraits: ['chin-length straight dark hair', 'clouded left eye', 'tall narrow build'],
        wardrobe: ['dust-red field coat', 'brass lens harness at the collar', 'charcoal weather notebook'],
        forbiddenDrift: ['no eyepatch', 'no long hair', 'no white laboratory coat'],
      },
      skills: [{ id: 'weather-cycles', label: s(locale, '天气周期', 'Weather cycles'), value: 4 }],
    },
  ]
}

export function lettersInlandMap(locale: Locale): MapNode[] {
  return [
    { id: 'platform-city', label: s(locale, '月台城', 'Platform City'), connectedTo: 'migrant-market', detail: s(locale, '围绕巨大换乘站生长的铁路城市，所有货物都要留下车号。', 'A rail city grown around a vast interchange where every load must leave a wagon number.'), capabilities: ['rest', 'work', 'supplies'], routeHints: [s(locale, '九号换乘台', 'transfer platform nine'), s(locale, '邮车检修沟', 'mail-car inspection pit')] },
    { id: 'roundhouse', label: s(locale, '圆顶机车库', 'Roundhouse'), connectedTo: 'platform-city', detail: s(locale, '修复旧火车与邮车的核心工场，复工前必须通过公开制动测试。', 'The central works for old trains and mail cars, where a public brake test precedes reopening.'), capabilities: ['rest', 'work', 'supplies'], routeHints: [s(locale, '三号检修道', 'inspection road three'), s(locale, '返修架', 'return rack')] },
    { id: 'copper-ridge', label: s(locale, '铜岭矿镇', 'Copper Ridge'), connectedTo: 'buried-branch', detail: s(locale, '需要运输却拒绝恢复旧剥削合同的山脊矿镇。', 'A ridge mining town that needs transport but rejects the old exploitative contracts.'), capabilities: ['rest', 'work', 'supplies'], routeHints: [s(locale, '合作社磅房', 'cooperative weighhouse')] },
    { id: 'buried-branch', label: s(locale, '沙下支线', 'Buried Branch'), connectedTo: 'roundhouse', detail: s(locale, '被风沙埋住、仍偶尔传来信号铃声的旧线路。', 'An old branch buried by windblown sand where a signal bell still sounds at times.'), routeHints: [s(locale, '半埋信号棚', 'half-buried signal hut'), s(locale, '旧侧门', 'old side gate')] },
    { id: 'south-freight-yard', label: s(locale, '南部货场', 'South Freight Yard'), connectedTo: 'platform-city', detail: s(locale, '药品、农具与私人货物争夺有限车位的编组场。', 'A marshalling yard where medicine, farm equipment and private freight compete for limited wagons.'), capabilities: ['work', 'supplies'], routeHints: [s(locale, '公共物资线', 'public-supplies siding'), s(locale, '七号卸货棚', 'unloading shed seven')] },
    { id: 'echo-canyon-road', label: s(locale, '回声峡谷路', 'Echo Canyon Road'), connectedTo: 'south-freight-yard', detail: s(locale, '声音比车辆更早抵达、以信号索确认道路状态的高原长路。', 'A plateau road where sound arrives before vehicles and signal cords confirm route conditions.'), routeHints: [s(locale, '峡谷信号索', 'canyon signal cord'), s(locale, '回声弯', 'echo bend')] },
    { id: 'rockhouse', label: s(locale, '岩屋镇', 'Rockhouse'), connectedTo: 'echo-canyon-road', detail: s(locale, '沿崖壁凿建、依靠季节河和公共水槽生活的聚落。', 'A cliff-cut settlement sustained by a seasonal river and public cisterns.'), capabilities: ['rest', 'work', 'supplies'], routeHints: [s(locale, '上层水槽', 'upper cistern'), s(locale, '红土车道', 'red-earth cart road')] },
    { id: 'dryriver-station', label: s(locale, '干河驿站', 'Dryriver Station'), connectedTo: 'rockhouse', detail: s(locale, '外表废弃，却按固定日子留下清水和医护补给的驿站。', 'A seemingly abandoned station where water and medical supplies appear on a fixed schedule.'), capabilities: ['rest', 'supplies'], routeHints: [s(locale, '旧候车棚', 'old waiting shelter'), s(locale, '新补水槽', 'freshly filled trough')] },
    { id: 'meridian-observatory', label: s(locale, '子午观测站', 'Meridian Observatory'), connectedTo: 'rockhouse', detail: s(locale, '最早记录白塔异常天气、以镜盘和风鼓传递预警的观测站。', 'The first station to record White Tower weather anomalies, using mirror disks and wind drums for warnings.'), capabilities: ['rest', 'work'], routeHints: [s(locale, '镜盘台', 'mirror-disk terrace'), s(locale, '风鼓廊', 'wind-drum gallery')] },
  ]
}

export function lettersInlandTurns(locale: Locale): DeterministicChoiceTurn[] {
  const zh = locale === 'zh'

  const farmReceipt = zh
    ? `签收记录没有写“施工队”三个笼统字，而是留下了可以追查的车号：月台城九号换乘台，邮车 M-17。传动轴被装进一只退回圆顶机车库的木箱，今晚还要经过南部货场重新编组。

莉娜用铅笔圈住车号：“皮带裂口是真的，但没有传动轴，换上新皮带也抽不上水。去月台城可以追回原件；留在这里则能先量出替代轴尺寸。”

[state: value="在月台城找回横风农场的传动轴，或制作可靠替代件"]
[choices: "搭施工物资车前往月台城追查 M-17 邮车"|"和莉娜测量风泵接口，准备替代传动轴"|"检查皮带裂口是否由空转造成"]`
    : `The receipt does not hide behind the words “road crew.” It leaves a traceable wagon number: transfer platform nine in Platform City, mail car M-17. The drive shaft was packed in a crate returned to the Roundhouse and is due to be remarshalled through South Freight Yard tonight.

Lena circles the number in pencil. “The belt really did split, but a new belt cannot pump water without the shaft. We can recover it in Platform City, or stay here and measure a reliable replacement.”

[state: value="Recover Crosswind Farm's drive shaft in Platform City or make a reliable replacement"]
[choices: "Ride the works lorry to Platform City and trace mail car M-17"|"Measure the pump coupling with Lena for a replacement drive shaft"|"Check whether running without the shaft caused the belt split"]`

  const platformArrival = zh
    ? `施工物资车沿草原旧路抵达月台城时，九号换乘台仍在夜班。你先在旅程路册上补记横风农场的离开时间，再穿过只允许按车号取货的闸门。

邮车 M-17 停在检修沟上。一名黑色紧卷发、左前臂带旧灼痕的男人正躺在车底，逐个敲听轴承。搬运工把签收记录递下去时喊他“乔纳”；他滑出车底，才完整报上名字：“我是乔纳·里德，邮车机械师。农场的轴不在这辆车上，但退回箱的重量记录还在。”

乔纳现在要找的是同一只木箱为何先过圆顶机车库、又被送往南部货场。他愿意带你核对车号，但不接受一句“铁路恢复后都会变好”作为答案。

[character_update: character_id="jonah-reed" character="乔纳·里德" role="35 岁 · 邮车与铁路机械师" detail="在月台城九号换乘台核对 M-17 邮车和失踪的农场传动轴" vitality="77" stress="41"]
[map_update: new_location="月台城" location_id="platform-city" connected_to="横风农场" detail="九号换乘台仍在夜班；M-17 邮车、退回箱重量记录和南部货场调度单都可核对"]
[clock: value="第 1 天 · 22:06"]
[widget: energy, remove: 8]
[choices: "跟乔纳核对 M-17 的退回箱重量记录"|"去南部货场查看农场传动轴是否已经卸下"|"沿退回标签前往圆顶机车库"]`
    : `The works lorry reaches Platform City along the old grassland road while transfer platform nine is still on night shift. You first record your departure from Crosswind Farm in the route ledger, then pass a gate that releases freight only by wagon number.

Mail car M-17 stands above an inspection pit. A man with tight black curls and an old burn along his left forearm lies beneath it, sounding each bearing. When a porter passes down the receipt, he calls the mechanic Jonah. The man slides out before giving his full name. “I’m Jonah Reed, a postal rail mechanic. The farm shaft is not on this car, but the returned crate's weight record is.”

Jonah wants to learn why the same crate passed through the Roundhouse and then went to South Freight Yard. He will help trace the wagon number, but he will not accept “the railway will fix everything” as an answer.

[character_update: character_id="jonah-reed" character="Jonah Reed" role="Age 35 · postal rail mechanic" detail="Checking mail car M-17 and the missing farm drive shaft at Platform City's transfer platform nine" vitality="77" stress="41"]
[map_update: new_location="Platform City" location_id="platform-city" connected_to="Crosswind Farm" detail="Transfer platform nine is on night shift; mail car M-17, the returned-crate weight record and South Freight Yard dispatch sheet are available"]
[clock: value="Day 1 · 22:06"]
[widget: energy, remove: 8]
[choices: "Check M-17's returned-crate weight record with Jonah"|"Go to South Freight Yard and see whether the farm drive shaft was unloaded"|"Follow the return label to the Roundhouse"]`

  const roundhouseArrival = zh
    ? `重量记录显示木箱离开 M-17 时比传动轴应有重量多出十二公斤，圆顶机车库还在箱角画了一道红色复检线。你和乔纳乘站内牵引车穿过转盘；路册中的月台城页被翻到“圆顶机车库”，前一处线索没有被清空。

三号检修道上，一名两侧剃短、灰白短发立起的女人正用红粉笔在制动杆上划线。年轻工人完成一次空载测试后叫她“贝丝领班”；她先让所有人退到安全线外，才走来报上姓名：“我是贝丝·鲁克。那只箱子不是超重，是有人把农场轴和一根有裂纹的制动销放在了一起。”

贝丝拒绝让今晚的慢车带着裂纹复工。她把两件金属分开放在返修架上：农场传动轴可以归还，但必须先查清是谁把危险零件混进公共物资。

[character_update: character_id="bess-rook" character="贝丝·鲁克" role="44 岁 · 圆顶机车库领班" detail="在圆顶机车库扣下混装裂纹制动销的返修箱" vitality="72" stress="48"]
[map_update: new_location="圆顶机车库" location_id="roundhouse" connected_to="月台城" detail="三号检修道已隔离返修箱；农场传动轴与裂纹制动销分开放置"]
[clock: value="第 1 天 · 22:24"]
[state: value="在归还传动轴前查明危险制动销为何混入公共物资"]
[choices: "和贝丝检查裂纹制动销的铸造记号"|"请乔纳把农场传动轴固定到返程车架"|"跟随旧侧门外传来的信号铃声"]`
    : `The weight record shows the crate left M-17 twelve kilograms heavier than the drive shaft should be, and the Roundhouse marked one corner with a red inspection line. You and Jonah ride the yard tractor across the turntable; the route ledger turns from Platform City to the Roundhouse without erasing the earlier lead.

On inspection road three, a woman with shaved sides and a short salt-and-pepper crest marks a brake rod with red chalk. After a young worker completes an unloaded test, he calls her Forewoman Bess. She sends everyone behind the safety line before approaching. “I’m Bess Rook. That crate was not overweight by accident. Someone packed the farm shaft with a cracked brake pin.”

Bess refuses to let tonight's slow train reopen with a cracked part. She places the two pieces of metal separately on the return rack: the farm shaft can go home, but first they need to learn who mixed a dangerous part into public supplies.

[character_update: character_id="bess-rook" character="Bess Rook" role="Age 44 · Roundhouse forewoman" detail="Holding a return crate containing a cracked brake pin at the Roundhouse" vitality="72" stress="48"]
[map_update: new_location="Roundhouse" location_id="roundhouse" connected_to="Platform City" detail="Inspection road three has isolated the return crate; the farm drive shaft and cracked brake pin lie separately on the rack"]
[clock: value="Day 1 · 22:24"]
[state: value="Learn why a dangerous brake pin was packed with public supplies before returning the drive shaft"]
[choices: "Inspect the cracked brake pin's foundry mark with Bess"|"Ask Jonah to secure the farm drive shaft to the return rack"|"Follow the signal bell beyond the old side gate"]`

  const buriedBranchArrival = zh
    ? `旧侧门外没有运行中的列车。铃声来自风沙里一座半埋的信号棚：一名白发向后梳、穿补丁乘务外套的老人正把铜铃从沙里挖出来。他先敲出两短一长，机车库里的工人才回喊：“伊沃，别再一个人清线！”

老人停手后才转向你：“我是伊沃·索恩，旧支线乘务员。铃不是幽灵，是埋在沙下的信号索被夜风拉动。问题是这根索通向地图上已经删掉的下一站。”

伊沃的意图很具体：先挖出六码信号索，确认它究竟通向铜岭矿镇还是回到南部货场。贝丝同意提供两把铲，但没有承诺让任何列车立刻开上去。

[character_update: character_id="ivo-thorne" character="伊沃·索恩" role="67 岁 · 旧线乘务员" detail="在沙下支线的半埋信号棚清出仍会响动的信号索" vitality="59" stress="29"]
[map_update: new_location="沙下支线" location_id="buried-branch" connected_to="圆顶机车库" detail="半埋信号棚里仍有可追踪的旧信号索；铜铃发出两短一长"]
[clock: value="第 1 天 · 22:39"]
[choices: "和伊沃沿信号索挖出六码沙沟"|"回圆顶机车库比对两短一长的旧信号表"|"请伊沃说明两短一长过去代表哪一站"]`
    : `No working train waits beyond the old side gate. The ringing comes from a half-buried signal hut where an old man with swept-back white hair and a patched conductor coat is digging a brass bell from the sand. He strikes two short notes and one long; only then do the Roundhouse workers call back, “Ivo, stop clearing that line alone!”

The old man stops before turning to you. “I’m Ivo Thorne, former branch-line conductor. The bell is no ghost. Night wind pulls a signal cord buried under the sand. The problem is that the cord runs toward a next station erased from the map.”

Ivo's purpose is specific: uncover six yards of signal cord and determine whether it runs toward Copper Ridge or loops back to South Freight Yard. Bess agrees to lend two shovels but does not promise that any train will run tonight.

[character_update: character_id="ivo-thorne" character="Ivo Thorne" role="Age 67 · former branch-line conductor" detail="Clearing a live signal cord from the half-buried hut on the Buried Branch" vitality="59" stress="29"]
[map_update: new_location="Buried Branch" location_id="buried-branch" connected_to="Roundhouse" detail="The half-buried signal hut contains a traceable old cord; its brass bell sounds two short notes and one long"]
[clock: value="Day 1 · 22:39"]
[choices: "Dig six yards of signal trench with Ivo"|"Return to the Roundhouse and compare the two-short-one-long code"|"Ask Ivo which station the two-short-one-long signal once identified"]`

  const postRecords = zh
    ? `安雅把改名前后的投递记录并排放好。旧地名没有消失，而是从三年前开始被转投到干河驿站：每隔九天，一箱医护补给会在那里等待巡回医护签收。今晚这一箱的冷却带仍在滴水，说明它必须尽快离开湖上驿站。

最新一页还留下两条可核对的路：药箱沿岩屋镇的补水车道送往干河驿站；同一天，子午观测站会用镜盘确认高原天气。安雅可以把你和药箱送到南岸车站，不会替你决定抵达后先查哪一条。

[state: value="把未署名回信对应的医护补给送到干河驿站，并核对高原天气记录"]
[choices: "护送冷却药箱前往干河驿站核对签收人"|"检查连续三年每隔九天出现的补给记录"|"先抄下子午观测站的镜盘确认时刻"]`
    : `Anja lays the delivery records from before and after the place-name change side by side. The old name did not vanish. For three years its mail has been redirected to Dryriver Station, where a box of medical supplies waits every ninth day for a traveling medic. Tonight's cooling strap is still dripping, so this crate must leave the Floating Post soon.

The newest page leaves two verifiable routes: the medicine travels along Rockhouse's water-cart road to Dryriver Station, and Meridian Observatory confirms plateau weather by mirror disk on the same day. Anja can carry you and the crate to the south-shore coach without deciding which lead you inspect after arrival.

[state: value="Deliver the unsigned reply's medical supplies to Dryriver Station and verify the plateau weather record"]
[choices: "Escort the cooled medicine crate to Dryriver Station and confirm the recipient"|"Inspect the every-ninth-day supply entries across three years"|"Copy Meridian Observatory's mirror confirmation time first"]`

  const dryriverArrival = zh
    ? `邮船靠南岸后，你随补水车穿过回声峡谷。每到岔口，你都在路册上记下水车辙和驿站方向；抵达时，干河驿站的屋顶破旧，水槽却刚刚补满。

一名黑色短卷发、戴椭圆细框眼镜的人正用布带测量药箱温度。赶车人把箱子递过去时说：“努尔，冷却带一路没断。”对方核完封口，才向你点头：“我是努尔·黑尔，巡回医护。药不是给一座空驿站的，是给明早无法自己走到岩屋镇的三个人。”

努尔要先确认药箱温度、补水车来自哪里，以及明早的峡谷路是否安全；这些都是眼前能检查的事。

[character_update: character_id="noor-hale" character="努尔·黑尔" role="32 岁 · 巡回医护" detail="在干河驿站核验冷却药箱，并准备把药送给无法独自前往岩屋镇的人" vitality="79" stress="34"]
[map_update: new_location="干河驿站" location_id="dryriver-station" connected_to="湖上驿站" detail="破旧候车棚旁的水槽刚补满；冷却药箱、红土车辙和峡谷路线都可检查"]
[clock: value="第 2 天 · 00:16"]
[widget: energy, remove: 10]
[choices: "和努尔检查药箱冷却带是否仍在安全温度"|"沿新鲜红土车辙追查谁补满了水槽"|"核对子午观测站今晚的镜盘信号"]`
    : `After the mail boat reaches the south shore, you ride a water cart through Echo Canyon. At every fork, you record the wheel ruts and station direction in the route ledger. Dryriver Station looks abandoned when you arrive, but its trough has just been filled.

A person with short dense black curls and oval wire glasses is measuring the medicine crate with a cloth thermometer strap. When the driver passes over the box, he says, “Noor, the cooling band held all the way.” Only after checking the seal do they nod to you. “I’m Noor Hale, a traveling medic. The medicine is not for an empty station. It is for three people who cannot walk to Rockhouse tomorrow morning.”

Noor first needs to confirm the crate temperature, the water cart's origin and whether tomorrow's canyon road is safe. All three can be checked here.

[character_update: character_id="noor-hale" character="Noor Hale" role="Age 32 · traveling medic" detail="Checking a cooled medicine crate at Dryriver Station before delivering it to people who cannot reach Rockhouse alone" vitality="79" stress="34"]
[map_update: new_location="Dryriver Station" location_id="dryriver-station" connected_to="Floating Post" detail="The trough beside the broken shelter was just filled; the cooled medicine crate, red-earth wheel ruts and canyon route are available to inspect"]
[clock: value="Day 2 · 00:16"]
[widget: energy, remove: 10]
[choices: "Check whether the medicine crate remains at a safe temperature with Noor"|"Follow the fresh red-earth wheel ruts and identify who filled the trough"|"Verify Meridian Observatory's mirror signal tonight"]`

  const rockhouseArrival = zh
    ? `红土车辙离开驿站后没有通向荒野，而是沿崖脚接上岩屋镇的补水车道。你和努尔坐在空水桶旁回到聚落；路册把干河驿站保留为已确认的医护停靠点。

岩屋镇的上层水槽正在漏水，补水车因此比计划早走了一趟。石壁上三条湿痕分别通向裂开的接缝、关闭的季节河闸和一根延伸到回声峡谷路的信号索。镇里的人没有要求你抽象地“观察变化”，而是让你先确定哪一处正在浪费今晚仅剩的水。

[map_update: new_location="岩屋镇" location_id="rockhouse" connected_to="干河驿站" detail="上层水槽正在漏水；裂缝、季节河闸和峡谷信号索都留下了不同湿痕"]
[clock: value="第 2 天 · 00:44"]
[state: value="在护送医护补给前找出岩屋镇上层水槽的漏水点"]
[choices: "沿最深湿痕检查水槽裂开的接缝"|"打开检修孔确认季节河闸是否卡住"|"前往回声峡谷路检查滴水的信号索"]`
    : `The red-earth ruts do not vanish into open country. They join Rockhouse's water-cart road along the base of the cliffs. You and Noor ride back beside the empty barrels while the route ledger keeps Dryriver Station as a confirmed medical stop.

Rockhouse's upper cistern is leaking, which forced the water cart to make an extra run. Three wet traces on the rock lead toward a cracked joint, the closed seasonal-river gate and a signal cord that extends onto Echo Canyon Road. No one asks you to “observe new changes.” The immediate task is to learn which fault is wasting tonight's remaining water.

[map_update: new_location="Rockhouse" location_id="rockhouse" connected_to="Dryriver Station" detail="The upper cistern is leaking; the cracked joint, seasonal-river gate and canyon signal cord hold different wet traces"]
[clock: value="Day 2 · 00:44"]
[state: value="Find the leak in Rockhouse's upper cistern before escorting the medical supplies onward"]
[choices: "Follow the deepest wet trace to the cracked cistern joint"|"Open the service hatch and check whether the seasonal-river gate is jammed"|"Travel onto Echo Canyon Road and inspect the dripping signal cord"]`

  const echoRoadArrival = zh
    ? `滴水的信号索穿过崖缝，来到回声峡谷路上方。你没有看见车辆，却先听见远处三次风鼓；声音沿岩壁提前抵达，索上的水珠则被每次震动抖落。

从你眼前可以确认两件事：信号索没有漏水，它只是从水槽裂缝下方经过；真正的裂口在岩屋镇一侧。峡谷尽头的镜盘随第三声风鼓闪了一次，那是子午观测站仍在值守的可见证据。

[map_update: new_location="回声峡谷路" location_id="echo-canyon-road" connected_to="岩屋镇" detail="信号索本身完好；远处三次风鼓和一次镜盘闪光来自子午观测站方向"]
[clock: value="第 2 天 · 00:57"]
[choices: "返回岩屋镇标记水槽裂缝的准确位置"|"沿峡谷路前往子午观测站核对第三声风鼓"|"记录镜盘闪光与声音抵达的时间差"]`
    : `The dripping signal cord passes through a cleft and above Echo Canyon Road. No vehicle is visible, yet three distant wind-drum notes arrive first; the rock walls carry the sound ahead, while each vibration shakes droplets from the cord.

Two facts are visible from here. The signal cord does not leak; it merely passes beneath the cistern crack, so the real break lies on the Rockhouse side. At the third drumbeat, a mirror disk flashes once at the end of the canyon—visible proof that Meridian Observatory remains staffed.

[map_update: new_location="Echo Canyon Road" location_id="echo-canyon-road" connected_to="Rockhouse" detail="The signal cord is sound; three distant drumbeats and one mirror flash came from Meridian Observatory"]
[clock: value="Day 2 · 00:57"]
[choices: "Return to Rockhouse and mark the cistern crack precisely"|"Travel to Meridian Observatory and verify the third drumbeat"|"Record the delay between the mirror flash and the arriving sound"]`

  const observatoryArrival = zh
    ? `你沿峡谷路爬上高原，途中在路册里记下镜盘闪光先于风鼓声音抵达。子午观测站的圆顶没有灯，露台上的黄铜镜盘却仍按固定角度转动。

一名齐颌直发、左眼略显浑浊的高个女人正把第三只风鼓锁住。值夜学徒递给她记录筒时叫她“朱尔斯”；她确认鼓绳不会再误报，才说明身份：“我是朱尔斯·安塞尔。今晚本该是两声，第三声来自一段被删掉的白塔天气记录。”

朱尔斯没有要求你先相信遥远结论。她把未删改的镜盘刻度、被割开的记录页边缘和今晚第三声风鼓并列摆在台上，让你选择先核哪一份证据。

[character_update: character_id="jules-ansel" character="朱尔斯·安塞尔" role="39 岁 · 子午观测站研究员" detail="在镜盘台隔离异常的第三只风鼓，并比对白塔天气记录的缺页" vitality="66" stress="52"]
[map_update: new_location="子午观测站" location_id="meridian-observatory" connected_to="回声峡谷路" detail="镜盘台保存今晚刻度；第三只风鼓已锁住，记录册留有被割开的页边"]
[clock: value="第 2 天 · 01:34"]
[state: value="确认第三声风鼓与被删改的白塔天气记录是否对应"]
[choices: "和朱尔斯核对未删改的镜盘刻度"|"检查记录册被割开的页边"|"请朱尔斯把第三声风鼓与干河驿站补给日对照"]`
    : `You climb from the canyon onto the plateau, recording that the mirror flash arrived before the wind-drum sound. Meridian Observatory's dome is dark, but a brass mirror disk on the terrace still turns at a fixed angle.

A tall woman with chin-length straight hair and a clouded left eye is locking the third wind drum. A night apprentice calls her Jules while handing over the record cylinder. Only after confirming the drum line cannot send another false warning does she introduce herself. “I’m Jules Ansel. Tonight should have carried two beats. The third comes from a section cut out of the White Tower weather record.”

Jules does not ask you to accept a distant conclusion. She lays the intact mirror scale, the cut edge of the record page and tonight's third drum side by side, letting you decide which evidence to verify first.

[character_update: character_id="jules-ansel" character="Jules Ansel" role="Age 39 · Meridian Observatory researcher" detail="Isolating the anomalous third wind drum and comparing it with a missing White Tower weather record" vitality="66" stress="52"]
[map_update: new_location="Meridian Observatory" location_id="meridian-observatory" connected_to="Echo Canyon Road" detail="The terrace preserves tonight's mirror scale; the third wind drum is locked and the record book has a cut page edge"]
[clock: value="Day 2 · 01:34"]
[state: value="Determine whether the third wind-drum beat matches the altered White Tower weather record"]
[choices: "Verify the intact mirror scale with Jules"|"Inspect the record book's cut page edge"|"Ask Jules to compare the third drumbeat with Dryriver Station's supply days"]`

  const buriedDig = zh
    ? `你和伊沃沿信号索挖开六码沙沟。前三码只露出旧麻绳，到第六码时，一块黄铜线路牌从枕木下翻了出来。牌背面的凹槽与铜岭矿镇旧水站使用的挂架完全相同。

伊沃没有把发现夸成“地图外的终点”。他承认这先证明一件较小但可靠的事：被删掉的是一处公共水站，沙下支线确实曾经服务过铜岭，而不是只运走矿石。

[widget: clues, add: 1]
[state: value="把铜岭公共水站的线路证据带回机车库，并保住已清出的信号索"]
[choices: "请伊沃画出公共水站与铜岭矿镇的旧连接"|"给已清出的信号索立一根夜间标桩"|"把黄铜线路牌带回圆顶机车库交给贝丝"]`
    : `You and Ivo uncover six yards of signal cord. The first three reveal only old hemp line; at the sixth, a brass route plate turns up beneath a sleeper. Grooves on its back match the mounting used at Copper Ridge's former public water stop.

Ivo does not inflate this into proof of a station beyond the map. He accepts a smaller, reliable result: a public water stop was erased, and the Buried Branch once served Copper Ridge rather than only carrying ore away.

[widget: clues, add: 1]
[state: value="Carry proof of Copper Ridge's public water stop to the Roundhouse and protect the exposed signal cord"]
[choices: "Ask Ivo to sketch the old link between the public water stop and Copper Ridge"|"Set a night marker beside the exposed signal cord"|"Carry the brass route plate back to Bess at the Roundhouse"]`

  const buriedCode = zh
    ? `伊沃在沙地上画出两短一长的旧信号节拍。它不是某座神秘终点的站名，而是“公共水站四号”的进站提示；旧乘务表把它列在铜岭矿镇之前，后来整行被墨盖住。

他用铃锤指向半埋枕木：“若沿这根索挖六码，应该能找到 C-4 的黄铜线路牌。找到牌，再谈恢复线路；找不到，就把我的记忆当成待证的口述。”

[widget: clues, add: 1]
[state: value="在沙下支线寻找公共水站四号的黄铜线路牌"]
[choices: "和伊沃沿信号索挖出六码沙沟"|"请伊沃指出旧乘务表被墨盖住的位置"|"回圆顶机车库查公共水站四号的挂架记录"]`
    : `Ivo draws the two-short-one-long rhythm in the sand. It was not the name of a mysterious terminal. It announced “Public Water Stop Four.” The old conductor sheet placed it before Copper Ridge, and someone later inked out the entire row.

He points the bell hammer toward a half-buried sleeper. “Six yards along this cord should uncover C-4's brass route plate. Find the plate before we talk about reopening. If it is not there, treat my memory as testimony still awaiting proof.”

[widget: clues, add: 1]
[state: value="Find the brass route plate for Public Water Stop Four on the Buried Branch"]
[choices: "Dig six yards of signal trench with Ivo"|"Ask Ivo to point out the inked-over row on the conductor sheet"|"Return to the Roundhouse and check the mounting record for Public Water Stop Four"]`

  const observatoryEvidence = (kind: 'mirror' | 'edge' | 'schedule') => {
    if (zh) {
      if (kind === 'mirror') return `朱尔斯把今晚未删改的镜盘刻度转回第三声风鼓出现的角度。它没有指向风暴云层，而是正好指向干河驿站的补给线路；这个角度每隔九天重复一次。\n\n镜盘证明第三声不是天气警报，而是一条被藏进天气系统的投递确认。被割掉的记录页与干河补给日现在成了同一个可核对的问题。\n\n[widget: clues, add: 1]\n[state: value="查明谁把干河驿站的投递确认藏进子午观测站天气信号"]\n[choices: "请朱尔斯指出谁能改动风鼓索引"|"检查记录册被割开的页边"|"向岩屋镇发送正确的两声天气信号"]`
      if (kind === 'edge') return `你把记录册摊平。页边不是自然脱落：切口从装订线内侧开始，只有先拆开铜扣才能割下整页。朱尔斯检查铜扣后发现一处新刮痕，和今晚第三只风鼓锁上的工具痕迹相同。\n\n这不能直接证明是谁动手，却证明删页和修改风鼓索引发生在同一处工作台。\n\n[widget: clues, add: 1]\n[state: value="比对子午观测站铜扣与第三只风鼓锁上的工具痕迹"]\n[choices: "和朱尔斯逐一比对两处工具痕迹"|"核对铜扣最近一次领用记录"|"把干河驿站补给日写回未删改的镜盘表"]`
      return `朱尔斯把干河驿站最近三次补给日放到风鼓日志旁。三次都出现了多余的第三声，而且都发生在药箱离开湖上驿站之后、抵达干河驿站之前。\n\n这条规律没有替你完成结论：第三声可能在保护秘密投递，也可能在向某人泄露药箱行程。下一步必须查是谁能同时看到两份记录。\n\n[widget: clues, add: 1]\n[state: value="查明谁同时掌握干河补给表和子午风鼓日志"]\n[choices: "请朱尔斯列出能接触两份记录的人"|"检查记录册被割开的页边"|"向努尔确认药箱是否曾因第三声改道"]`
    }
    if (kind === 'mirror') return `Jules returns the intact mirror scale to the angle recorded for the third drumbeat. It points not toward the storm clouds but directly along Dryriver Station's supply route, and the angle repeats every ninth day.\n\nThe mirror proves the third beat was not a weather warning. It was a delivery confirmation hidden inside the weather system. The cut page and the Dryriver supply days now form one question that can be checked.\n\n[widget: clues, add: 1]\n[state: value="Learn who hid Dryriver Station's delivery confirmation inside Meridian Observatory's weather signals"]\n[choices: "Ask Jules who can alter the wind-drum index"|"Inspect the record book's cut page edge"|"Send the correct two-beat weather signal toward Rockhouse"]`
    if (kind === 'edge') return `You flatten the record book. The page did not tear naturally: the cut begins inside the binding, so someone had to open the brass clasp before removing it. Jules finds a fresh scrape on the clasp that matches the tool mark on tonight's third-drum lock.\n\nThis does not identify the person, but it proves the page removal and the drum-index change happened at the same worktable.\n\n[widget: clues, add: 1]\n[state: value="Compare the tool marks on Meridian Observatory's clasp and third-drum lock"]\n[choices: "Compare both tool marks with Jules"|"Check the clasp's most recent issue record"|"Restore Dryriver Station's supply days to the intact mirror table"]`
    return `Jules places Dryriver Station's last three supply days beside the wind-drum log. Every date contains an extra third beat, always after the medicine left the Floating Post and before it reached Dryriver Station.\n\nThe pattern does not finish the conclusion for you. The third beat may protect a discreet delivery or expose the medicine route to someone else. The next step is to identify who can see both records.\n\n[widget: clues, add: 1]\n[state: value="Identify who can access both the Dryriver supply table and Meridian wind-drum log"]\n[choices: "Ask Jules to list everyone with access to both records"|"Inspect the record book's cut page edge"|"Ask Noor whether the medicine ever changed route after a third drumbeat"]`
  }

  const firstPersonEvidence = 'FIRST-PERSON view from the traveler’s eyes, protagonist entirely out of frame, no face, head, body, silhouette, reflection or hands, cinematic editorial gouache, no readable text, no UI, 4:3'

  return [
    { action: s(locale, '查看施工队借走传动轴的签收记录', 'Check the receipt for the drive shaft borrowed by the road crew'), when: { locations: [s(locale, '横风农场', 'Crosswind Farm')] }, turn: { match: [s(locale, '查看施工队借走传动轴的签收记录', 'Check the receipt for the drive shaft borrowed by the road crew')], content: farmReceipt, imageSubject: 'environment', imagePrompt: `${firstPersonEvidence}, a grease-marked freight receipt beside a stopped wind-pump coupling and an empty drive-shaft bracket, all markings abstract and unreadable` } },
    { action: s(locale, '搭施工物资车前往月台城追查 M-17 邮车', 'Ride the works lorry to Platform City and trace mail car M-17'), when: { locations: [s(locale, '横风农场', 'Crosswind Farm')] }, turn: { match: [s(locale, '搭施工物资车前往月台城追查 M-17 邮车', 'Ride the works lorry to Platform City and trace mail car M-17')], content: platformArrival, imageSubject: 'others', imageCharacterId: 'jonah-reed', imagePrompt: 'OBSERVER WIDE SHOT of Platform City transfer platform nine at night, Jonah Reed sliding out from beneath a green mail railcar above an inspection pit, one arriving traveler small and secondary, vast iron interchange, cinematic editorial gouache, no readable text, no UI, 4:3' } },
    { action: s(locale, '跟乔纳核对 M-17 的退回箱重量记录', "Check M-17's returned-crate weight record with Jonah"), when: { locations: [s(locale, '月台城', 'Platform City')], characterIds: ['jonah-reed'] }, turn: { match: [s(locale, '跟乔纳核对 M-17 的退回箱重量记录', "Check M-17's returned-crate weight record with Jonah")], content: roundhouseArrival, imageSubject: 'others', imageCharacterId: 'bess-rook', imagePrompt: 'OBSERVER WIDE SHOT inside a domed locomotive roundhouse, Bess Rook marking a brake rod with red inspection chalk while Jonah Reed and one traveler remain behind a painted safety line, cinematic editorial gouache, no readable text, no UI, 4:3' } },
    { action: s(locale, '沿退回标签前往圆顶机车库', 'Follow the return label to the Roundhouse'), when: { locations: [s(locale, '月台城', 'Platform City')], characterIds: ['jonah-reed'] }, turn: { match: [s(locale, '沿退回标签前往圆顶机车库', 'Follow the return label to the Roundhouse')], content: roundhouseArrival, imageSubject: 'others', imageCharacterId: 'bess-rook', imagePrompt: 'OBSERVER WIDE SHOT inside a domed locomotive roundhouse, Bess Rook marking a brake rod with red inspection chalk while Jonah Reed and one traveler remain behind a painted safety line, cinematic editorial gouache, no readable text, no UI, 4:3' } },
    { action: s(locale, '跟随旧侧门外传来的信号铃声', 'Follow the signal bell beyond the old side gate'), when: { locations: [s(locale, '圆顶机车库', 'Roundhouse')], characterIds: ['bess-rook'] }, turn: { match: [s(locale, '跟随旧侧门外传来的信号铃声', 'Follow the signal bell beyond the old side gate')], content: buriedBranchArrival, imageSubject: 'others', imageCharacterId: 'ivo-thorne', imagePrompt: 'OBSERVER WIDE SHOT of a half-buried railway signal hut under moonlit windblown sand, Ivo Thorne lifting a small brass bell while the distant roundhouse glows behind, traveler secondary, cinematic editorial gouache, no readable text, no UI, 4:3' } },
    { action: s(locale, '和伊沃沿信号索挖出六码沙沟', 'Dig six yards of signal trench with Ivo'), when: { locations: [s(locale, '沙下支线', 'Buried Branch')], characterIds: ['ivo-thorne'] }, turn: { match: [s(locale, '和伊沃沿信号索挖出六码沙沟', 'Dig six yards of signal trench with Ivo')], content: buriedDig, imageSubject: 'others', imageCharacterId: 'ivo-thorne', imagePrompt: 'OBSERVER MEDIUM-WIDE SHOT at a moonlit buried rail line, Ivo Thorne and one adult traveler uncovering a brass route plate beneath a sleeper beside six yards of exposed signal cord, cinematic editorial gouache, no readable text, no UI, 4:3' } },
    { action: s(locale, '请伊沃说明两短一长过去代表哪一站', 'Ask Ivo which station the two-short-one-long signal once identified'), when: { locations: [s(locale, '沙下支线', 'Buried Branch')], characterIds: ['ivo-thorne'] }, turn: { match: [s(locale, '请伊沃说明两短一长过去代表哪一站', 'Ask Ivo which station the two-short-one-long signal once identified')], content: buriedCode, imageSubject: 'others', imageCharacterId: 'ivo-thorne', imagePrompt: 'FIRST-PERSON conversation view toward Ivo Thorne drawing a three-part signal rhythm in moonlit sand beside a brass bell and half-buried sleeper, player entirely off-camera, cinematic editorial gouache, no readable text, no UI, 4:3' } },
    { action: s(locale, '请安雅调出改名前后的投递记录', 'Ask Anja for delivery records from before and after the place-name changed'), when: { locations: [s(locale, '湖上驿站', 'Floating Post')], characterIds: ['anja-moss'] }, turn: { match: [s(locale, '请安雅调出改名前后的投递记录', 'Ask Anja for delivery records from before and after the place-name changed')], content: postRecords, imageSubject: 'others', imageCharacterId: 'anja-moss', imagePrompt: `${firstPersonEvidence}, Anja Moss across a lamp-lit floating-post worktable laying two delivery ledgers beside a cooled medicine crate, her focused expression visible, every page mark abstract and unreadable` } },
    { action: s(locale, '护送冷却药箱前往干河驿站核对签收人', 'Escort the cooled medicine crate to Dryriver Station and confirm the recipient'), when: { locations: [s(locale, '湖上驿站', 'Floating Post')], characterIds: ['anja-moss'] }, turn: { match: [s(locale, '护送冷却药箱前往干河驿站核对签收人', 'Escort the cooled medicine crate to Dryriver Station and confirm the recipient')], content: dryriverArrival, imageSubject: 'others', imageCharacterId: 'noor-hale', imagePrompt: 'OBSERVER WIDE SHOT at Dryriver Station after midnight, Noor Hale measuring a cooled medicine crate beside a freshly filled water trough and a broken waiting shelter, one traveler small and secondary, red plateau earth, cinematic editorial gouache, no readable text, no UI, 4:3' } },
    { action: s(locale, '沿新鲜红土车辙追查谁补满了水槽', 'Follow the fresh red-earth wheel ruts and identify who filled the trough'), when: { locations: [s(locale, '干河驿站', 'Dryriver Station')], characterIds: ['noor-hale'] }, turn: { match: [s(locale, '沿新鲜红土车辙追查谁补满了水槽', 'Follow the fresh red-earth wheel ruts and identify who filled the trough')], content: rockhouseArrival, imageSubject: 'environment', imagePrompt: 'OBSERVER WIDE SHOT of Rockhouse carved along a red cliff at night, an upper public cistern leaking down three distinct traces while an empty water cart arrives, two adult travelers small in frame, cinematic editorial gouache, no readable text, no UI, 4:3' } },
    { action: s(locale, '前往回声峡谷路检查滴水的信号索', 'Travel onto Echo Canyon Road and inspect the dripping signal cord'), when: { locations: [s(locale, '岩屋镇', 'Rockhouse')] }, turn: { match: [s(locale, '前往回声峡谷路检查滴水的信号索', 'Travel onto Echo Canyon Road and inspect the dripping signal cord')], content: echoRoadArrival, imageSubject: 'environment', imagePrompt: `${firstPersonEvidence}, moonlit red canyon road below a wet but intact signal cord, one distant mirror disk flashing above the canyon after three wind-drum vibrations` } },
    { action: s(locale, '沿峡谷路前往子午观测站核对第三声风鼓', 'Travel to Meridian Observatory and verify the third drumbeat'), when: { locations: [s(locale, '回声峡谷路', 'Echo Canyon Road')] }, turn: { match: [s(locale, '沿峡谷路前往子午观测站核对第三声风鼓', 'Travel to Meridian Observatory and verify the third drumbeat')], content: observatoryArrival, imageSubject: 'others', imageCharacterId: 'jules-ansel', imagePrompt: 'OBSERVER WIDE SHOT on the Meridian Observatory terrace at night, Jules Ansel locking the third brass wind drum beside a rotating mirror disk while one traveler arrives from the canyon, vast red plateau sky, cinematic editorial gouache, no readable text, no UI, 4:3' } },
    { action: s(locale, '核对子午观测站今晚的镜盘信号', "Verify Meridian Observatory's mirror signal tonight"), when: { locations: [s(locale, '干河驿站', 'Dryriver Station')], characterIds: ['noor-hale'] }, turn: { match: [s(locale, '核对子午观测站今晚的镜盘信号', "Verify Meridian Observatory's mirror signal tonight")], content: observatoryArrival, imageSubject: 'others', imageCharacterId: 'jules-ansel', imagePrompt: 'OBSERVER WIDE SHOT on the Meridian Observatory terrace at night, Jules Ansel locking the third brass wind drum beside a rotating mirror disk while one traveler arrives from the canyon, vast red plateau sky, cinematic editorial gouache, no readable text, no UI, 4:3' } },
    { action: s(locale, '和朱尔斯核对未删改的镜盘刻度', 'Verify the intact mirror scale with Jules'), when: { locations: [s(locale, '子午观测站', 'Meridian Observatory')], characterIds: ['jules-ansel'] }, turn: { match: [s(locale, '和朱尔斯核对未删改的镜盘刻度', 'Verify the intact mirror scale with Jules')], content: observatoryEvidence('mirror'), imageSubject: 'others', imageCharacterId: 'jules-ansel', imagePrompt: 'FIRST-PERSON view toward Jules Ansel aligning a brass mirror disk with a wind-drum index on the observatory terrace, player entirely off-camera, all scale marks abstract and unreadable, cinematic editorial gouache, no UI, 4:3' } },
    { action: s(locale, '检查记录册被割开的页边', "Inspect the record book's cut page edge"), when: { locations: [s(locale, '子午观测站', 'Meridian Observatory')], characterIds: ['jules-ansel'] }, turn: { match: [s(locale, '检查记录册被割开的页边', "Inspect the record book's cut page edge")], content: observatoryEvidence('edge'), imageSubject: 'environment', imagePrompt: `${firstPersonEvidence}, close view of an opened brass-clasp record book with one cleanly cut page edge beside a locked wind-drum mechanism, every mark abstract and unreadable` } },
    { action: s(locale, '请朱尔斯把第三声风鼓与干河驿站补给日对照', "Ask Jules to compare the third drumbeat with Dryriver Station's supply days"), when: { locations: [s(locale, '子午观测站', 'Meridian Observatory')], characterIds: ['jules-ansel'] }, turn: { match: [s(locale, '请朱尔斯把第三声风鼓与干河驿站补给日对照', "Ask Jules to compare the third drumbeat with Dryriver Station's supply days")], content: observatoryEvidence('schedule'), imageSubject: 'others', imageCharacterId: 'jules-ansel', imagePrompt: 'FIRST-PERSON conversation view toward Jules Ansel arranging three abstract supply markers beside three wind-drum tokens on the observatory worktable, player entirely off-camera, cinematic editorial gouache, no readable text, no UI, 4:3' } },
  ]
}
