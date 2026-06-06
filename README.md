# 小满集 · 物致于此，小得盈满

一只叫"小满"的东方萌宠，每天邀你去生活里找一样东西。你拍下来，小满替你牵出一首
**早已存在的唐诗宋词**——你和千年前的某个人就此**同频**，攒成一本只属于你的诗集。

> 核心不是"AI 写诗"，而是"AI 牵线"：诗逐字来自核验过的诗库，绝不让模型编造。

手机端 H5，浏览器打开即用。

---

## 玩法闭环
领一道**寻物令**（可无限换签，挑到喜欢的收进**锦囊**）→ 去找、拍下 →
小满**端详**照片 → 从诗库**牵出一首古诗** + 说一句共鸣话 → 你决定收不收 →
留一句**跋** → 落成一张**明信片**（照片·竖排题诗·出处·共鸣话·时令·小满落款印）→
进**诗集**；**日历**按完成日盖"小满印"；**知音录**记录你遇见过的古人。

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
    ├── services/ai.js               # describeImage / matchPoem(牵线)
    ├── services/storage.js          # 诗集/锦囊/日历/知音录/时令
    ├── components/                  # XiaomanSprite / XunwuScroll / PoemCard(诗笺) ...
    └── pages/                       # Cover / Home(领取) / Nang(锦囊) / Capture(成笺) / Shiji(诗集) / Calendar(日历)
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
  诗笺/明信片(竖排题诗+落款印+时令) · 诗集 · 知音录 · 打卡日历 · localStorage · 可部署
- **P2 待办**：节气印全集上明信片 · 闲章/故人印 · 头部诗人萌化头像 · 信箱寄明信片 ·
  onboarding 三拍 · 诗"换个味道"共创 · Live2D
