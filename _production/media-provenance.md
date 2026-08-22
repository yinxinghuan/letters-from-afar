# 媒体来源记录

## 正式入口图

- 文件：`src/story/img/worlds/letters-from-afar-entry-v2.png`
- 服务：AlterU Media Service Public API v1
- 游戏 session：`65b050fc-97b2-4513-b95a-a8dc25419896`
- request ID：`c1f1b944-b4b8-44a0-a90e-459cda933802`
- task ID：`mt_81cc83700dc903f494c5614f19447d68`
- 原始 CDN：`https://cdn.aiwaves.tech/prod/telegram/avatar/2612444002/1787405084225874.png`
- 尺寸：`768 × 576`
- 生成日期：2026-08-22
- 说明：第二版移除了第一版档案柜上的伪文字；正式构建只引用第二版。

运行时剧情图继续通过 `src/shared/runtime/media.ts` 调用同一公共媒体服务，使用游戏永久 UUID 作为 `session_id`。本项目未使用 Imagine。

## 正式列表海报

- 文件：`public/poster.png`
- 服务：AlterU Media Service Public API v1
- 游戏 session：`65b050fc-97b2-4513-b95a-a8dc25419896`
- 底图 request / task：`a5b6e673-40dc-4d6d-8d4d-fd8ee86f4248` / `mt_5281128b416fc0e3b1617d8962290730`
- 标题编辑 request / task：`c2d18742-e179-47ef-bd51-f7815a3c3a27` / `mt_5768b5c37df8eaf3ae1ef54f48d83ff5`
- 尺寸：`1024 × 1024`
- SHA-256：`e1919aeaa117e89179a9932ef3cf455d4b43fb4e5a57f99b96dfb05061a8c95f`
- 生成日期：2026-08-23
- 说明：英文标题位于顶部安全区；1024 原图和 160 缩略图均已检查。海报不是界面截图、SVG 转换或本地生成图。

## 正式声音资产

- 目录：`src/story/audio/assets/`
- 服务：AlterU Media Service Public API v1 音频生成
- 游戏 session：`65b050fc-97b2-4513-b95a-a8dc25419896`
- 主题音乐 task：`mt_15531c94384600b93655fe10194416fb`
- 海岸 / 铁路 / 高原 / 开阔道路环境声 task：`mt_ff9b2865681dfb217619ee81650975c6`、`mt_f14c68531cbf39fd29476a9d9e54a216`、`mt_629ccdd29a1539077400bb552d7c54d3`、`mt_a9c6c07f40566dded26b6a09a3c21016`
- 路线抵达 task：`mt_117c120f1b3884d882a2497c5433d7a6`
- 格式：44.1kHz、双声道 MP3；音乐 90 秒、环境声各 45 秒、抵达音效 2.5 秒。
- 后期：离线响度与真峰值整理后再进入仓库；削波的未来来信和邮铃候选已淘汰，未随构建发布。
