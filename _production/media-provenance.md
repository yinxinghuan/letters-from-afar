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
