# 小满集 · 物致于此，小得盈满

一只叫"小满"的东方萌宠，每天邀你去生活里找一样东西。你拍下来，小满替你牵出一首
**早已存在的唐诗宋词**，再把这张照片装进明信片、票券或书笺，收进只属于你的诗笺夹。

> 核心不是"AI 写诗"，而是"AI 牵线"：诗逐字来自核验过的诗库，绝不让模型编造。
> 产品核心也不是"存诗"，而是保存用户完成任务后得到的一张诗意明信片；照片不单独成册，它活在卡面里。

手机端 H5，浏览器打开即用。

---

## 玩法闭环
领今天的**寻物令 / 今日签**（不喜欢可以换签，但今天接下就要今天交）→ 去找、拍下 →
小满**端详**照片 → 从诗库**牵出一首古诗** + 说一句共鸣话 → 你决定收不收 →
留一句**跋** → 落成一张**明信片**（照片·竖排题诗·出处·共鸣话·时令·小满落款印）→
进**诗笺夹**；同一张卡面也可切换导出为**书笺 / 明信片 / 票券**；**日历**按完成日盖"小满印"；**知音录**记录你遇见过的古人。

今日签没有单独的"任务卡仓库"：未完成的签只在当天保留，每次打开首页都会提醒继续完成；过了当天就作废，不能补签，也不会在日历上补盖章。

## 诗笺夹模型
当前 MVP 用 localStorage 保存一个"诗笺夹条目"：
- 卡面照片：压缩后的照片 dataURL，直接嵌在明信片/书笺/票券里。
- 任务上下文：寻物令主题、类型、时令、完成日期。
- 诗意上下文：匹配到的真实诗、共鸣话、用户跋、当前版式。

因此这里不再做"照片库 + 明信片集合"两套收纳。用户看到和保存的就是一张带照片的诗笺；导出 PNG 时按当前样式即时生成。未来接后端时，也应优先把它建模为一条 `card` 记录，照片是卡面的内容字段，而不是独立图片资产。

## 技术栈
- React + Vite（HashRouter，手机竖屏）、framer-motion、html-to-image、browser-image-compression
- **AI**：阿里通义千问 `qwen-vl-max`(读图) + `qwen-plus`(选诗/共鸣话)，经 `/api/ai`
  Serverless 代理调用（key 留服务端）
- **小满声音**：OpenAI `gpt-4o-mini-tts`，经 `/api/tts` 代理生成 mp3；前端仅播放音频，不暴露 key。
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
    ├── data/layouts.js              # 明信片 / 书笺 / 票券卡面样式
    ├── services/ai.js               # describeImage / matchPoem(牵线)
    ├── services/storage.js          # 诗笺夹/今日签/日历/知音录/时令
    ├── components/                  # XiaomanSprite / XunwuScroll / PoemCard(诗笺卡面) ...
    └── pages/                       # Cover / Home(今日签) / Capture(成笺) / Shiji(诗笺夹) / Calendar(日历)
```

## 本地运行
```bash
npm install
cp .env.example .env      # 填 DASHSCOPE_API_KEY（阿里云百炼）
npm run dev               # http://localhost:5173
```
> 没填 `AI_API_KEY` 时，界面都能跑，但"牵诗"那一步会提示出错；没填 `OPENAI_API_KEY` 时，小满声音按钮会显示"未接通"。

## 重建/扩充诗库
```bash
python3 tools/build-corpus.py ~/Desktop/诗词分类大全.xlsx
# 想要更大/更全：改脚本里的 生僻度 / 每作者上限 / 长度阈值
```

## 部署 Vercel
```bash
vercel
vercel env add DASHSCOPE_API_KEY   # 选 Production
vercel env add OPENAI_API_KEY      # 小满 TTS 声音
vercel --prod
```

## 部署 Cloudflare Pages
在 Cloudflare Pages → Settings → Environment variables 里配置：
- `AI_API_KEY`：读图、选诗、生成寻物令。
- `OPENAI_API_KEY`：小满 TTS 声音。
- 可选 `OPENAI_TTS_VOICE=shimmer`、`OPENAI_TTS_MODEL=gpt-4o-mini-tts`。

## 实现进度
- **P0/P1 已完成（可跑通）**：封面 · 今日签/寻物令(两型/换签/当天未交提醒) · 拍摄→古诗匹配 ·
  明信片/书笺/票券(照片+题诗+落款印+时令) · 诗笺夹 · 知音录 · 打卡日历 · localStorage · 可部署
- **P2 待办**：节气印全集上明信片 · 闲章/故人印 · 头部诗人萌化头像 · 信箱寄明信片 ·
  onboarding 三拍 · 诗"换个味道"共创 · Live2D
