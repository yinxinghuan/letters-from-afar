# 《远方来信》技术文档

## 1. 技术栈

- React 18、TypeScript、Less、Vite 5；构建基址为 `./`，产物输出到 `dist/`。
- 正文采用累积时间线，数值、地点、人物、关系、行囊和选择由结构化协议进入权威 reducer。
- 场景图与物品图通过 AlterU Media Service 异步生成；生成失败不阻塞行动。
- 异步共享世界使用同一游戏 UUID 下的 `/api/world/*`，服务端为 Cloudflare Durable Object SQLite。GitHub Pages 仅作静态镜像，不连接正式共享世界。

## 2. 目录结构

- `src/story/cartridges/lettersFromAfar.ts`：中英文世界卡、开场、两条首发路线、基础人物、基础地图、数值与确定性回合。
- `src/story/cartridges/lettersFromAfarExpansion.ts`：第一批草原与湖林扩展；集中维护新增地点、未来角色及两条区域门的确定性回合。
- `src/story/cartridges/lettersFromAfarInlandExpansion.ts`：第二批断轨盆地与赤土高原扩展；维护 4 名未来角色、9 个新增节点、两条区域链和终点后续调查。
- `src/story/engine/`：协议解析、状态 reducer、选项一致性、地点绑定、危险、休息、工资和消费规则。
- `src/story/useStoryEngine.ts`：个人存档、场景生成、行动管线与共享回执写入入口。
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

### 异步共享世界

客户端默认 API Base 为 `/<当前游戏 UUID>`；仅 `?local=1` 使用浏览器隔离存储演练。所有写入包含稳定 `action_id`、`expected_version`、`ruleset_id` 和玩家身份。服务端按动作 ID 缓存首次响应，按世界版本串行提交；两人竞争同一接力信时最多一人成功。

接力信不直接由公共快照塞进私人行囊。Worker 先保存未确认 `grant_receipt`；客户端回读回执、幂等写入个人 StorySave 后才调用 `/api/world/grant/ack`。掉线时未确认回执会在下次刷新继续处理。玩家抵达接力信的权威 `destinationId` 后，旅人路册才显示交付按钮；交付成功的 remove 回执同样先写入私人存档，再向 Worker 确认。

当前 `PUBLIC_BETA=true` 只验证平台提供的 `telegram_id` 非空，并不构成密码学身份认证；正式扩大公开写入前应接入平台签名校验。外部访客可读取共享状态，但写按钮禁用，服务端也拒绝 `__alteru_guest__`。

### 图片与多语言

图片导演在第一人称对话/证据镜头与观察者广角之间轮换，并禁止可读文字、标牌和 UI。所有运行时图片请求走媒体服务，代码中无媒体长期凭据。界面文案由 `src/story/i18n.ts` 提供中英文版本。

## 4. 扩展点

- 加基础开场或首发事件：修改 `lettersFromAfar.ts`。草原/湖林内容修改 `lettersFromAfarExpansion.ts`；断轨盆地/赤土高原内容修改 `lettersFromAfarInlandExpansion.ts`。继续增加地区时按区域新建独立 cartridge，并同步 `doc/world-bible.md`、对应世界扩展测试与容量测试。
- 调整精力、旅费、信迹或休息/工作/购买：修改 cartridge 的 `statDefinitions` 与 `domainRules`，并补 `_qa/vertical-slice.ts`。
- 加共享动作或公共实体：同时修改 `src/shared-world/types.ts`、纯规则 `engine.ts`、`worker/index.js`、网关与 Worker 测试；禁止只改前端。
- 改私人接力物品：修改 `src/shared-world/receipt.ts`，保持“私人存档成功后再 ack”顺序。
- 改视觉方向：修改 `doc/visual.md`、cartridge 图片导演字段和 Media Service prompt；不可改用 Imagine。
- 接入平台强身份认证：在 Worker `/api/world/action`、`/grants`、`/grant/ack` 边界验证平台签名，并将 `PUBLIC_BETA` 关闭。
