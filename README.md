# 小满集 · 物致于此，小得盈满

一只叫"小满"的东方萌宠，每天邀你去生活里找一样东西。你拍下来，小满替你牵出一首
**早已存在的唐诗宋词**，再把这张照片生成成明信片、票券或书笺，收进只属于你的相册。

> 核心不是"AI 写诗"，而是"AI 牵线"：诗逐字来自核验过的诗库，绝不让模型编造。
> 产品核心也不是"存诗"，而是保存用户完成任务后产生的照片，以及这张照片导出的生成成品。

手机端 H5，浏览器打开即用。

---

## 玩法闭环
领一道**寻物令**（可无限换签，挑到喜欢的收进**锦囊**）→ 去找、拍下 →
小满**端详**照片 → 从诗库**牵出一首古诗** + 说一句共鸣话 → 你决定收不收 →
留一句**跋** → 落成一张**明信片**（照片·竖排题诗·出处·共鸣话·时令·小满落款印）→
进**相册**；同一张照片也可切换导出为**书笺 / 明信片 / 票券**；**日历**按完成日盖"小满印"；**知音录**记录你遇见过的古人。

## 相册模型
当前 MVP 用 localStorage 保存一个"相册条目"：
- 用户原片：压缩后的照片 dataURL，是这次任务的母本。
- 任务上下文：寻物令主题、类型、时令、完成日期。
- 生成配方：匹配到的真实诗、共鸣话、用户跋、可导出的书笺 / 明信片 / 票券样式。

因此明信片和票券不和照片割裂成两套收藏，而是作为同一张照片的子成品存在。导出 PNG 时按当前样式即时生成；未来接后端时，可把原图作为主资产，把导出的 PNG 快照作为 `artifacts` 子资产持久化。

## 技术栈
- React + Vite（HashRouter，手机竖屏）、framer-motion、html-to-image、browser-image-compression
- **AI**：阿里通义千问 `qwen-vl-max`(读图) + `qwen-plus`(选诗/共鸣话)，经 `/api/ai`
  Serverless 代理调用（key 留服务端）
- **诗库**：`src/data/poems.json`（从 9 万首精选的 1101 首种子）
- 存储：localStorage

## 目录
```
小满集/
├── api/ai.js, _dashscope.js     # Serverless AI 代理
├── tools/build-corpus.py        # 从 xlsx 重建/扩充种子诗库
├── public/
│   ├── xiaoman/                 # 小满逐帧：daiji/xunwuling/duanxiang/shouxia-1..6.png
│   └── seal/xiaoman-mingzhang.png
└── src/
    ├── data/poems.js + poems.json   # 诗库 + 候选筛选
    ├── data/themes.js               # 寻物令两型 + 文案
    ├── data/artifacts.js            # 书笺 / 明信片 / 票券导出样式
    ├── services/ai.js               # describeImage / matchPoem(牵线)
    ├── services/storage.js          # 相册/锦囊/日历/知音录/时令
    ├── components/                  # XiaomanSprite / XunwuScroll / PoemCard(生成成品) ...
    └── pages/                       # Cover / Home(领取) / Nang(锦囊) / Capture(生成) / Shiji(相册) / Calendar(日历)
```

## 本地运行
```bash
npm install
cp .env.example .env      # 填 DASHSCOPE_API_KEY（阿里云百炼）
npm run dev               # http://localhost:5173
```
> 没填 key 时，界面都能跑，但"牵诗"那一步会提示出错——填上 key 即可真实匹配。

## 重建/扩充诗库
```bash
python3 tools/build-corpus.py ~/Desktop/诗词分类大全.xlsx
# 想要更大/更全：改脚本里的 生僻度 / 每作者上限 / 长度阈值
```

## 部署 Vercel
```bash
vercel
vercel env add DASHSCOPE_API_KEY   # 选 Production
vercel --prod
```

## 实现进度
- **P0/P1 已完成（可跑通）**：封面 · 寻物令(两型/换签) · 锦囊 · 拍摄→古诗匹配 ·
  书笺/明信片/票券(照片+题诗+落款印+时令) · 相册 · 知音录 · 打卡日历 · localStorage · 可部署
- **P2 待办**：节气印全集上明信片 · 闲章/故人印 · 头部诗人萌化头像 · 信箱寄明信片 ·
  onboarding 三拍 · 诗"换个味道"共创 · Live2D
