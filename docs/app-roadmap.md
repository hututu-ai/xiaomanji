# 小满集 App 化路线

这份文档记录“小满集”从当前 H5 走向 App 的工程路线。当前线上 H5 地址仍保持不变：

https://xiaomanji-dyv.pages.dev/

## 当前基础

- 前端：React + Vite H5，HashRouter，手机竖屏优先。
- 后端：Cloudflare Pages Functions。
- 数据库：Cloudflare D1 已创建并迁移，绑定名 `XMJ_DB`。
- AI：`/api/ai` 服务端代理已接入，`AI_API_KEY` 留在 Cloudflare 环境变量里。
- 云同步：诗笺、签账本、满签奖励、补签券账本已有接口。
- 媒体兜底：R2 未启用时，压缩后的照片和分享图会临时写入 D1 的 `media_blobs`。
- 本地兜底：localStorage 仍保留，云端异常时 H5 可以继续使用。

## 仍缺的关键能力

### 1. R2 媒体存储

当前线上健康检查结果里 `media:false`，原因是 Cloudflare 账号还没有启用 R2。为了继续推进 App，当前先使用 D1 临时媒体表承接压缩图；等 R2 开通后，再切到对象存储。

当前过渡方案：

- 小图写入 D1 `media_blobs`。
- `/api/media?key=...` 同时支持 R2 key 和 D1 key。
- `/api/share` 在 R2 缺席时仍可生成可访问分享页。
- 前端上传分享图前会压成轻量 JPEG，降低 D1 写入失败概率。

App 大规模上线前建议完成：

- 在 Cloudflare Dashboard 启用 R2。
- 创建 bucket：`xiaomanji-media`。
- 在 Pages 项目 `xiaomanji` 绑定 R2：
  - binding：`XMJ_MEDIA`
  - bucket：`xiaomanji-media`
- 重新部署后确认：

```bash
curl --noproxy "*" -s https://xiaomanji-dyv.pages.dev/api/health
```

期望结果：

```json
{
  "bindings": {
    "db": true,
    "media": true,
    "ai": true
  }
}
```

### 2. 正式账号

现在是匿名 ID，可以支撑 demo 和早期测试。App 给真实用户使用时，需要至少一种正式登录方式：

- 微信登录：最适合国内社交分享场景。
- Apple 登录：iOS App 上架常用。
- 手机号登录：通用，但需要短信服务和风控。

建议优先级：微信登录 + Apple 登录。

后端需要新增：

- `accounts`：正式账号表。
- `user_identities`：微信 openid、Apple subject、手机号等身份绑定。
- `sessions`：登录态或 token 记录。
- 匿名用户合并：首次登录后，把当前匿名 `userId` 下的诗笺、签账本、奖励合并到正式账号。

### 3. App 工程

建议使用 Expo 起步，原因：

- 相机、相册、分享、推送都有成熟模块。
- 现在的 React 业务逻辑可逐步迁移。
- 打包 iOS / Android 的路径清楚。
- 先做体验验证，后续再按需要 eject 或转 Bare React Native。

推荐目录：

```text
apps/mobile/          # Expo App
src/shared/           # H5 与 App 共用的数据、诗库、AI SDK、后端 SDK
src/                  # 当前 H5
functions/            # Cloudflare 后端
migrations/           # D1 迁移
```

### 4. 原生能力

App 主流程需要这些能力：

- 相机拍照：`expo-camera`
- 相册选择：`expo-image-picker`
- 保存到相册：`expo-media-library`
- 系统分享：`expo-sharing`
- 本地通知：`expo-notifications`
- 安全存储：`expo-secure-store`
- 图片压缩：`expo-image-manipulator`

微信分享和朋友圈需要额外接微信开放平台 SDK。Expo Managed Workflow 可以先用系统分享，等 App 体验稳定后再接微信 SDK。

## 代码复用清单

可以直接复用或轻改：

- `src/data/poems.js`
- `src/data/poems.json`
- `src/data/themes.js`
- `src/data/layouts.js`
- `src/data/poetRelation.js`
- `src/services/backend.js`
- `src/services/ai.js`
- `src/utils/poemText.js`

需要抽象后复用：

- `src/services/storage.js`：H5 用 localStorage，App 用 AsyncStorage / SecureStore / SQLite。
- `src/components/XiaomanSprite.jsx`：图片帧资源可复用，组件实现要换成 React Native Image。
- `src/components/PoemCard.jsx`：卡面逻辑可复用，导出图片要换成 RN 截图/Canvas 方案。

需要重写：

- 页面布局 CSS。
- 路由层。
- 拍照/相册/保存/分享。
- 底部导航。

## App 第一版范围

第一版 App 只做一条完整闭环：

1. 登录或匿名进入。
2. 领取今日签，可以换签。
3. 拍照或从相册选择。
4. 小满端详照片，牵出一句诗。
5. 收进诗笺夹，日历盖章。
6. 生成图片，保存到相册或系统分享。

第一版先不做：

- 复杂商城。
- 社区广场。
- 多人互动。
- Live2D。
- 大规模勋章系统。

## 补签与满签机制

已经具备的后端基础：

- `sign_ledger`：记录 pending / missed / done / makeup_done。
- `makeup_tokens`：记录补签券 available / used / expired。
- `rewards`：记录满签奖励。

还要补的产品规则：

- 补签券来源：满签奖励、活动赠送、节气奖励、连续签到奖励。
- 补签限制：只能补本月，或只能补最近 7 天。
- 满签奖励：普通满签章、无补签满签章、节气限定物件。
- 视觉入口：日历缺勤日点击后，可以使用补签券。

建议第一版规则：

- 当月缺勤日可以补。
- 每张补签券只能补一天。
- 用补签券完成后，日历显示“补”。
- 无补签完成当月，奖励更稀有的“净满签章”。

## 后端下一步

1. 为 `/api/sync` 增加账号合并能力。
2. 增加 `/api/auth/*`：
   - 微信登录
   - Apple 登录
   - 匿名用户绑定正式账号
3. 给图片上传增加更完整的大小限制和类型校验。
4. 给 AI 与分享接口增加基础限流。
5. 后续启用 R2 并把 D1 媒体迁移到 `XMJ_MEDIA`。

## 移动端下一步

1. 创建 `apps/mobile` Expo 工程。
2. 抽出 `src/shared`，让 H5 和 App 共用数据层。
3. 先实现 App 首页、今日签、拍照、成笺、诗笺夹、集章记。
4. 接系统分享和保存相册。
5. 接推送提醒。
6. 打包 TestFlight / Android 内测包。

## 上架前清单

- 隐私政策。
- 用户协议。
- 图片上传与 AI 说明。
- 数据删除入口。
- 未成年人保护说明。
- App 图标与启动页。
- 应用商店截图。
- ICP / 备案情况确认。
