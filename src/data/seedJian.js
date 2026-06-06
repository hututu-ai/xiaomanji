// 示例诗笺：让初次打开的 App 不空着，直观看出"它在干嘛"。
// 配的诗都来自有"萌化故人印"的 5 位诗人（李白/杜甫/李清照/苏轼/陆游），
// 这样知音录里点亮的全是可爱的故人印。
// 照片在 public/samples/1.jpg … 5.jpg（用户真实照片）。
const day = 86400000
const now = Date.now()

export const SEED_JIAN = [
  {
    image: '/samples/1.jpg', themeText: '屋檐边探出来的春色', themeType: 'object',
    accent: { accent: '#e2929e' }, layout: 'postcard', solarTerm: '谷雨',
    poem: { id: 'seed_linan', mingju: '小楼一夜听春雨，深巷明朝卖杏花', full: '世味年来薄似纱，谁令骑马客京华。小楼一夜听春雨，深巷明朝卖杏花。矮纸斜行闲作草，晴窗细乳戏分茶。素衣莫起风尘叹，犹及清明可到家。', title: '临安春雨初霁', author: '陆游', dynasty: '宋', form: '诗' },
    resonance: '它从老屋檐边悄悄探出头——陆游也曾在小楼里听了一夜春雨，等的就是这一枝杏花。',
    postscript: '', createdAt: now - 5 * day,
  },
  {
    image: '/samples/2.jpg', themeText: '一点被你发现的小幸运', themeType: 'object',
    accent: { accent: '#6fb07e' }, layout: 'postcard', solarTerm: '立夏',
    poem: { id: 'seed_diealian', mingju: '枝上柳绵吹又少，天涯何处无芳草', full: '花褪残红青杏小。燕子飞时，绿水人家绕。枝上柳绵吹又少，天涯何处无芳草。', title: '蝶恋花·春景', author: '苏轼', dynasty: '宋', form: '词' },
    resonance: '这么小一株，竟被你蹲下来看见了。苏轼说天涯到处都有芳草——好运也是，就看你肯不肯低头找。',
    postscript: '', createdAt: now - 3 * day,
  },
  {
    image: '/samples/3.jpg', themeText: '一片水里的倒影', themeType: 'moment',
    accent: { accent: '#6f9aa8' }, layout: 'shujian', solarTerm: '小满',
    poem: { id: 'seed_rumengling', mingju: '常记溪亭日暮，沉醉不知归路', full: '常记溪亭日暮，沉醉不知归路。兴尽晚回舟，误入藕花深处。争渡，争渡，惊起一滩鸥鹭。', title: '如梦令', author: '李清照', dynasty: '宋', form: '词' },
    resonance: '水把天和树都收下来了。像易安那回，溪亭日暮、误入藕花——最美的，常在你低头看水的那一刻。',
    postscript: '', createdAt: now - 2 * day,
  },
  {
    image: '/samples/4.jpg', themeText: '一树开到极盛的花', themeType: 'object',
    accent: { accent: '#e2929e' }, layout: 'postcard', solarTerm: '清明',
    poem: { id: 'seed_xunhua', mingju: '黄四娘家花满蹊，千朵万朵压枝低', full: '黄四娘家花满蹊，千朵万朵压枝低。留连戏蝶时时舞，自在娇莺恰恰啼。', title: '江畔独步寻花', author: '杜甫', dynasty: '唐', form: '诗' },
    resonance: '千朵万朵，把枝都压低了。杜甫在黄四娘家也见过这样的花——开得这么用力，是想让路过的人都停一下。',
    postscript: '', createdAt: now - 1 * day,
  },
  {
    image: '/samples/5.jpg', themeText: '并肩走着的两个人', themeType: 'moment',
    accent: { accent: '#cba35f' }, layout: 'ticket', solarTerm: '芒种',
    poem: { id: 'seed_xinglunan', mingju: '长风破浪会有时，直挂云帆济沧海', full: '行路难，行路难，多歧路，今安在？长风破浪会有时，直挂云帆济沧海。', title: '行路难', author: '李白', dynasty: '唐', form: '诗' },
    resonance: '一条路，两个人，走向远处的金色。李白说长风破浪会有时——有人同行的路，再远也不慌。',
    postscript: '和ta一起走了好久。', createdAt: now - 3600 * 1000,
  },
]
