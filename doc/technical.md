# 《远方来信》技术文档

## 1. 技术栈

- React 18、TypeScript、Less、Vite 5；构建基址为 `./`，产物输出到 `dist/`。
- 正文采用累积时间线，数值、地点、人物、关系、行囊和选择由结构化协议进入权威 reducer。
- 场景图、物品图和可持久化音频资产通过 AlterU Media Service 生成；生成失败不阻塞行动。正式音频为 44.1kHz 双声道 MP3，运行时不直连模型供应商。
- 异步共享世界使用同一游戏 UUID 下的 `/api/world/*`，服务端为 Cloudflare Durable Object SQLite。GitHub Pages 仅作静态镜像，不连接正式共享世界。

## 2. 目录结构

- `src/story/cartridges/lettersFromAfar.ts`：中英文世界卡、开场、两条首发路线、基础人物、基础地图、数值与确定性回合。
- `src/story/cartridges/lettersFromAfarExpansion.ts`：第一批草原与湖林扩展；集中维护新增地点、未来角色及两条区域门的确定性回合。
- `src/story/cartridges/lettersFromAfarInlandExpansion.ts`：第二批断轨盆地与赤土高原扩展；维护 4 名未来角色、9 个新增节点、两条区域链和终点后续调查。
- `src/story/engine/`：协议解析、状态 reducer、选项一致性、地点绑定、危险、休息、工资和消费规则；`executeTurn.ts` 是与 React/DOM/媒体/存储解耦的服务端回合权威边界。
- `src/story/audio/StorySynth.ts`：混合声音导演；管理录制音乐/地域环境层/路线提示、精确合成反馈、解锁、静音、后台暂停、并发上限与播放失败降级。
- `src/story/audio/assets/`：1 段低密度阅读底乐 A、1 段关键段落配乐 B、4 段地域环境层和 1 段路线抵达音效；全部作为 Vite 相对构建资产打包。
- `src/story/audio/useStoryAudio.ts`：把权威地点和数值张力传给声音导演，并避免存档完成加载前预取错误地点的环境声。
- `src/story/useStoryEngine.ts`：个人存档、场景生成、行动管线与共享回执写入入口。
- `src/shared/runtime/media.ts`：AlterU Media Service 图片/音频任务客户端；音频输入限制为 `music | sfx`、`0.5–120` 秒，轮询统一任务端点。
- `src/shared-world/engine.ts`：可在 Node 中测试的共享世界纯规则。
- `src/shared-world/gateway.ts`：本机演练和同源远端 API 网关；未知响应以同一 action ID 对账。
- `src/shared-world/useLettersWorld.ts`：共享快照、定时刷新、写入和未确认回执协调。
- `src/shared-world/receipt.ts`：把接力信 add/remove 回执幂等写入私人 StorySave。
- `worker/index.js`：生产共享世界 Durable Object、动作幂等缓存、版本冲突和回执表。
- `_design/`：首五分钟、路线与长期 200×80 回合推演。
- `_qa/`：真实故事管线、世界扩展、共享规则和 Worker 规则测试；`world-expansion.ts` 重放草原门与湖林门，`world-expansion-inland.ts` 以中英文重放断轨盆地与赤土高原并继续执行终点调查；两者校验人物登场、稳定 ID、地点和选项依据。`run-regression.mjs` 让 `npm test` 顺序执行 26 组母引擎与本游戏验收，任一组失败即停止。

## 3. 核心模块

### 个人叙事状态

`useStoryEngine` 只通过 `commit()` 更新当前世界，并把完整 `StoryArchive` 写入 `useGameSave('letters-from-afar')`。确定性开场与首发路线先经过和 UI 相同的 `prepareTurnCandidate → applyParsedScene` 管线，避免测试绕过选项过滤、地点绑定或数值结算。

`executeStoryTurn()` 抽出可由私人 Story Session Worker 调用的纯回合管线，并保留活跃危险 deflection、领域事务、作者回合、proposal 校验与 reducer 的原顺序；`_qa/server-turn-pipeline.ts` 验证模型旁路、原子提交、输入不变性和危险线程保护。它不接管 `/api/world/*`：共享 World Authority 必须先独立提交公共动作，再以已提交回执更新私人会话。当前仅为源码 canary，正式写入仍等待后端可验证的 AlterU 玩家身份。

开场采用两级确定性披露：`opening` 首屏以三个可感知节拍交代玩家的临时邮路员身份、明早递送积压邮件的职责、今晚因封路留守的原因，以及写着玩家名字但没有投递记录的干信封；仍只提供两个贴近信封/投信口的动作。`openingTurns()` 第一次行动揭示未来日期，`routeTurns()` 中的档案柜/首行回合第二次才揭示盐沼路线与潮汐时限。`public-tests/opening-density.ts` 同时检查角色身份/行动动机、限制中英文首屏长度、提前出现的专有名词、首个行动段落数和后续选择数。

### 异步共享世界

客户端默认 API Base 为 `/<当前游戏 UUID>`；仅 `?local=1` 使用浏览器隔离存储演练。所有写入包含稳定 `action_id`、`expected_version`、`ruleset_id` 和玩家身份。服务端按动作 ID 缓存首次响应，按世界版本串行提交；两人竞争同一接力信时最多一人成功。

接力信不直接由公共快照塞进私人行囊。Worker 先保存未确认 `grant_receipt`；客户端回读回执、幂等写入个人 StorySave 后才调用 `/api/world/grant/ack`。掉线时未确认回执会在下次刷新继续处理。玩家抵达接力信的权威 `destinationId` 后，旅人路册才显示交付按钮；交付成功的 remove 回执同样先写入私人存档，再向 Worker 确认。

当前 `PUBLIC_BETA=true` 只验证平台提供的 `telegram_id` 非空，并不构成密码学身份认证；正式扩大公开写入前应接入平台签名校验。外部访客可读取共享状态，但写按钮禁用，服务端也拒绝 `__alteru_guest__`。

### 图片与多语言

图片导演在第一人称对话/证据镜头与观察者广角之间轮换，并禁止可读文字、标牌和 UI。所有运行时图片请求走媒体服务，代码中无媒体长期凭据。界面文案由 `src/story/i18n.ts` 提供中英文版本。

### 混合声音系统

cartridge 的 `audioTheme.recorded` 是录制资产清单：`music` 配置低密度阅读底乐 A，`ambienceByLocationId` 用稳定地点 ID 选择四种地域环境层；`cues.travel` 是短事件音效，`relationship / summary` 可触发关键段落 B，其余低频短反馈仍由 Web Audio 合成。本作在引擎阅读模式衰减之外，再把合成反馈降到 `sfx: 0.045`、路线抵达录音降到 `gain: 0.12`；音乐和环境层保持不变。

录制音乐和环境声都不设置 `loop=true`。A 自然结束后至少等待 30 秒再进入；地域环境轨标记 `replay: 'once-per-visit'`，每次进入权威地点只完整播放一次，结束后保持安静，同一访问中的静音/页面恢复不会使它从头重播，只有离开并再次进入地点才重置。B 播放时暂停 A、结束后恢复 A，同源 B 至少冷却 180 秒；切换静音、页面隐藏和组件卸载都会清理 B，恢复时不补播。播放被浏览器拒绝时，音乐/环境/提示分别退回原合成实现。

阅读音效有独立前景预算：普通选择只保留一次轻确认；普通正文、图片完成、精力与信迹变化静音，只有检定、旅费、稀有物、关系、危险、抵达与章节节点才产生结果提示。合成 SFX 乘 `0.52`，`180 ms` 内合并突发触发，合成瞬态声部上限为 6、录制短音效上限为 2。`public-tests/audio-synth.ts` 检查这些限制和语义选择，`_qa/world-expansion-inland.ts` 检查全部稳定地图节点都有环境声绑定。

## 4. 扩展点

- 加基础开场或首发事件：修改 `lettersFromAfar.ts`。草原/湖林内容修改 `lettersFromAfarExpansion.ts`；断轨盆地/赤土高原内容修改 `lettersFromAfarInlandExpansion.ts`。继续增加地区时按区域新建独立 cartridge，并同步 `doc/world-bible.md`、对应世界扩展测试与容量测试。
- 调整精力、旅费、信迹或休息/工作/购买：修改 cartridge 的 `statDefinitions` 与 `domainRules`，并补 `_qa/vertical-slice.ts`。
- 加共享动作或公共实体：同时修改 `src/shared-world/types.ts`、纯规则 `engine.ts`、`worker/index.js`、网关与 Worker 测试；禁止只改前端。
- 改私人接力物品：修改 `src/shared-world/receipt.ts`，保持“私人存档成功后再 ack”顺序。
- 改视觉方向：修改 `doc/visual.md`、cartridge 图片导演字段和 Media Service prompt；不可改用 Imagine。
- 改声音方向或换音频：先在独立媒体服务中生成候选并完成听审、响度/真峰值/时长/格式检查，再替换 `src/story/audio/assets/` 与 `audioTheme.recorded`；短促且需同帧精度的 UI 反馈继续修改 `StorySynth.ts`，不要改成远端运行时生成。
- 接入平台强身份认证：在 Worker `/api/world/action`、`/grants`、`/grant/ack` 边界验证平台签名，并将 `PUBLIC_BETA` 关闭。
