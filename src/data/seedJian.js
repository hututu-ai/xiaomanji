// 示例诗笺 + 用户真实照片（共 21 张）
// 种子版本号：增量注入——版本升级时新种子自动加入，已有的不重复注入。
const day = 86400000
// 使用固定基准日期（而非 Date.now()），避免种子条目的 createdAt
// 随页面加载时间漂移，导致 countJianOnDate 误判"今日已盖章"。
const BASE = new Date('2026-06-01T12:00:00+08:00').getTime()

// 第一批：经典示例（5张，李白/杜甫/苏轼/李清照/陆游）
const SEED_V1 = [
  {
    image: '/samples/1.jpg', themeText: '屋檐边探出来的春色', themeType: 'object',
    accent: { accent: '#e2929e' }, layout: 'postcard', solarTerm: '谷雨',
    poem: { id: 'seed_linan', mingju: '小楼一夜听春雨，深巷明朝卖杏花', full: '世味年来薄似纱，谁令骑马客京华。小楼一夜听春雨，深巷明朝卖杏花。矮纸斜行闲作草，晴窗细乳戏分茶。素衣莫起风尘叹，犹及清明可到家。', title: '临安春雨初霁', author: '陆游', dynasty: '宋', form: '诗' },
    resonance: '它从老屋檐边悄悄探出头——陆游也曾在小楼里听了一夜春雨，等的就是这一枝杏花。',
    postscript: '', createdAt: BASE - 21 * day,
  },
  {
    image: '/samples/2.jpg', themeText: '一点被你发现的小幸运', themeType: 'object',
    accent: { accent: '#6fb07e' }, layout: 'postcard', solarTerm: '立夏',
    poem: { id: 'seed_diealian', mingju: '枝上柳绵吹又少，天涯何处无芳草', full: '花褪残红青杏小。燕子飞时，绿水人家绕。枝上柳绵吹又少，天涯何处无芳草。', title: '蝶恋花·春景', author: '苏轼', dynasty: '宋', form: '词' },
    resonance: '这么小一株，竟被你蹲下来看见了。苏轼说天涯到处都有芳草——好运也是，就看你肯不肯低头找。',
    postscript: '', createdAt: BASE - 19 * day,
  },
  {
    image: '/samples/3.jpg', themeText: '一片水里的倒影', themeType: 'moment',
    accent: { accent: '#6f9aa8' }, layout: 'shujian', solarTerm: '小满',
    poem: { id: 'seed_rumengling', mingju: '常记溪亭日暮，沉醉不知归路', full: '常记溪亭日暮，沉醉不知归路。兴尽晚回舟，误入藕花深处。争渡，争渡，惊起一滩鸥鹭。', title: '如梦令', author: '李清照', dynasty: '宋', form: '词' },
    resonance: '水把天和树都收下来了。像易安那回，溪亭日暮、误入藕花——最美的，常在你低头看水的那一刻。',
    postscript: '', createdAt: BASE - 18 * day,
  },
  {
    image: '/samples/4.jpg', themeText: '一树开到极盛的花', themeType: 'object',
    accent: { accent: '#e2929e' }, layout: 'postcard', solarTerm: '清明',
    poem: { id: 'seed_xunhua', mingju: '黄四娘家花满蹊，千朵万朵压枝低', full: '黄四娘家花满蹊，千朵万朵压枝低。留连戏蝶时时舞，自在娇莺恰恰啼。', title: '江畔独步寻花', author: '杜甫', dynasty: '唐', form: '诗' },
    resonance: '千朵万朵，把枝都压低了。杜甫在黄四娘家也见过这样的花——开得这么用力，是想让路过的人都停一下。',
    postscript: '', createdAt: BASE - 17 * day,
  },
  {
    image: '/samples/5.jpg', themeText: '并肩走着的两个人', themeType: 'moment',
    accent: { accent: '#cba35f' }, layout: 'ticket', solarTerm: '芒种',
    poem: { id: 'seed_xinglunan', mingju: '长风破浪会有时，直挂云帆济沧海', full: '行路难，行路难，多歧路，今安在？长风破浪会有时，直挂云帆济沧海。', title: '行路难', author: '李白', dynasty: '唐', form: '诗' },
    resonance: '一条路，两个人，走向远处的金色。李白说长风破浪会有时——有人同行的路，再远也不慌。',
    postscript: '和ta一起走了好久。', createdAt: BASE - 16 * day,
  },
]

// 第二批：用户真实照片（16张，全部来自耳熟能详的大诗人：李白/杜甫/白居易/李清照/苏轼/陆游）
const SEED_V2 = [
  {
    image: '/samples/r1.jpg', themeText: '它比你先到', themeType: 'moment',
    accent: { accent: '#cba35f' }, layout: 'postcard', solarTerm: '芒种',
    poem: { id: 'tang_003214', mingju: '花径不曾缘客扫，蓬门今始为君开', full: '舍南舍北皆春水，但见群鸥日日来。花径不曾缘客扫，蓬门今始为君开。盘餐市远无兼味，樽酒家贫只旧醅。肯与邻翁相对饮，隔篱呼取尽余杯。', title: '客至', author: '杜甫', dynasty: '唐', form: '诗(近体)' },
    resonance: '它坐在那儿，像在等你。杜甫说"蓬门今始为君开"——连这扇小门都知道，今天要来的人，值得为它扫干净花径。',
    postscript: '', createdAt: BASE - 15 * day,
  },
  {
    image: '/samples/r3.jpg', themeText: '不寻常的那一片', themeType: 'object',
    accent: { accent: '#e2929e' }, layout: 'ticket', solarTerm: '惊蛰',
    poem: { id: 'tang_015581', mingju: '野火烧不尽，春风吹又生', full: '离离原上草，一岁一枯荣。野火烧不尽，春风吹又生。远芳侵古道，晴翠接荒城。又送王孙去，萋萋满别情。', title: '赋得古原草送别', author: '白居易', dynasty: '唐', form: '诗(近体)' },
    resonance: '四叶草被捏在指尖，那么小，又那么笃定。白居易说"春风吹又生"——所有看起来脆弱的好运气，底下都藏着烧不尽的根。',
    postscript: '', createdAt: BASE - 13 * day,
  },
  {
    image: '/samples/r4.jpg', themeText: '低头看看吧', themeType: 'moment',
    accent: { accent: '#6f9aa8' }, layout: 'postcard', solarTerm: '霜降',
    poem: { id: 'tang_003389', mingju: '无边落木萧萧下，不尽长江滚滚来', full: '风急天高猿啸哀，渚清沙白鸟飞回。无边落木萧萧下，不尽长江滚滚来。万里悲秋常作客，百年多病独登台。艰难苦恨繁霜鬓，潦倒新停浊酒杯。', title: '登高', author: '杜甫', dynasty: '唐', form: '诗(近体)' },
    resonance: '老杜站在高处看秋，看到的是"无边落木萧萧下"。而你低头看水，树影在里面，把天地倒了过来——那份清冷与辽阔，和千年前是一样的。',
    postscript: '', createdAt: BASE - 12 * day,
  },
  {
    image: '/samples/r5.jpg', themeText: '被绿色吃掉的墙', themeType: 'moment',
    accent: { accent: '#6fb07e' }, layout: 'shujian', solarTerm: '夏至',
    poem: { id: 'ci_020914', mingju: '园馆青林翠樾，衣巾细葛轻纨', full: '园馆青林翠樾，衣巾细葛轻纨。好风吹散霏微雨，沙路喜新干。小燕双飞水际，流莺百啭林端。投壶声断弹棋罢，闲展道书看。', title: '乌夜啼', author: '陆游', dynasty: '宋', form: '词' },
    resonance: '古墙披着绿藤，巷子深处没人说话。陆游说"园馆青林翠樾"——就是这种安静，静到能听见好风吹过沙路的声音。',
    postscript: '', createdAt: BASE - 11 * day,
  },
  {
    image: '/samples/r6.jpg', themeText: '它不用上班', themeType: 'object',
    accent: { accent: '#cba35f' }, layout: 'ticket', solarTerm: '小暑',
    poem: { id: 'ci_020916', mingju: '纨扇婵娟素月，纱巾缥渺轻烟', full: '纨扇婵娟素月，纱巾缥渺轻烟。高槐叶长阴初合，清润雨余天。弄笔斜行小草，钩帘浅醉闲眠。更无一点尘埃到，枕上听新蝉。', title: '乌夜啼', author: '陆游', dynasty: '宋', form: '词' },
    resonance: '它蜷在那儿，睡得连梦都不做。陆游说"浅醉闲眠""枕上听新蝉"——这种什么都不用管、连一点尘埃都没有的安稳，就是此刻这辆车里最贵的东西。',
    postscript: '', createdAt: BASE - 10 * day,
  },
  {
    image: '/samples/r7.jpg', themeText: '白色有多安静', themeType: 'object',
    accent: { accent: '#5fa99b' }, layout: 'postcard', solarTerm: '大寒',
    poem: { id: 'ci_001467', mingju: '大江东去，浪淘尽，千古风流人物', full: '大江东去，浪淘尽、千古风流人物。故垒西边人道是，三国周郎赤壁。乱石穿空，惊涛拍岸，卷起千堆雪。江山如画，一时多少豪杰。遥想公瑾当年，小乔初嫁了，雄姿英发。羽扇纶巾谈笑间，强虏灰飞烟灭。故国神游，多情应笑，我早生华发。人间如梦，一尊还酹江月。', title: '念奴娇·赤壁怀古', author: '苏轼', dynasty: '宋', form: '词' },
    resonance: '雪山倒映在湖里，浪花是白的，山也是白的。苏轼说"乱石穿空，惊涛拍岸，卷起千堆雪"——原来雪未必从天上来，它也可以从山和水的缝隙里涌出来。',
    postscript: '', createdAt: BASE - 9 * day,
  },
  {
    image: '/samples/r9.jpg', themeText: '两杯之间', themeType: 'object',
    accent: { accent: '#6f9aa8' }, layout: 'ticket', solarTerm: '白露',
    poem: { id: 'tang_056325', mingju: '举杯邀明月，对影成三人', full: '花间一壶酒，独酌无相亲。举杯邀明月，对影成三人。月既不解饮，影徒随我身。暂伴月将影，行乐须及春。我歌月裴回，我舞影零乱。醒时同交欢，醉后各分散。永结无情游，相期邈云汉。', title: '月下独酌', author: '李白', dynasty: '唐', form: '诗(近体)' },
    resonance: '两杯酒摆在那里，光从杯壁上滑下来。李白一个人喝酒时，把月亮和自己的影子邀来凑成三人——你现在有两杯，还有一个愿意坐下的人。比李白还多一位。',
    postscript: '', createdAt: BASE - 7 * day,
  },
  {
    image: '/samples/r10.jpg', themeText: '水的心跳', themeType: 'object',
    accent: { accent: '#6fb07e' }, layout: 'postcard', solarTerm: '处暑',
    poem: { id: 'tang_056128', mingju: '抽刀断水水更流，举杯消愁愁更愁', full: '弃我去者昨日之日不可留，乱我心者今日之日多烦忧。长风万里送秋雁，对此可以酣高楼。蓬莱文章建安骨，中间小谢又清发。俱怀逸兴壮思飞，欲上青天览日月。抽刀断水水更流，举杯消愁愁更愁。人生在世不称意，明朝散发弄扁舟。', title: '宣州谢朓楼饯别校书叔云', author: '李白', dynasty: '唐', form: '诗(近体)' },
    resonance: '一滴水落下，涟漪一圈一圈散开，怎么都收不回来。李白说"抽刀断水水更流"——这世上有些东西，就是越想按住，越荡漾开去。不如让它荡。',
    postscript: '', createdAt: BASE - 6 * day,
  },
  {
    image: '/samples/r11.jpg', themeText: '没有闹钟的生活', themeType: 'moment',
    accent: { accent: '#cba35f' }, layout: 'shujian', solarTerm: '立夏',
    poem: { id: 'ci_020913', mingju: '素意幽栖物外，尘缘浪走天涯', full: '素意幽栖物外，尘缘浪走天涯。归来犹幸身强健，随分作山家。已趁余寒泥酒，还乘小雨移花。柴门尽日无人到，一径傍溪斜。', title: '乌夜啼', author: '陆游', dynasty: '宋', form: '词' },
    resonance: '鸡在踱步，鸭在发呆，日子慢得像停了下来。陆游说"柴门尽日无人到，一径傍溪斜"——真正的自在，就是没人来打扰，只有一条小溪陪你耗上一整天。',
    postscript: '', createdAt: BASE - 5 * day,
  },
  {
    image: '/samples/r12.jpg', themeText: '山在水里游泳', themeType: 'moment',
    accent: { accent: '#5fa99b' }, layout: 'ticket', solarTerm: '小雪',
    poem: { id: 'ci_001459', mingju: '但愿人长久，千里共婵娟', full: '明月几时有，把酒问青天。不知天上宫阙，今夕是何年。我欲乘风归去，又恐琼楼玉宇，高处不胜寒。起舞弄清影，何似在人间。转朱阁，低绮户，照无眠。不应有恨，何事长向别时圆。人有悲欢离合，月有阴晴圆缺，此事古难全。但愿人长久，千里共婵娟。', title: '水调歌头', author: '苏轼', dynasty: '宋', form: '词' },
    resonance: '雪山站在湖的对岸，水把它完整地收进镜子里，一丝都不歪。苏轼说"但愿人长久，千里共婵娟"——也许千里之外的另一个人，此刻也正看着同一片水、同一座山。',
    postscript: '', createdAt: BASE - 4 * day,
  },
  {
    image: '/samples/r13.jpg', themeText: '冬天在这里落款', themeType: 'moment',
    accent: { accent: '#e2929e' }, layout: 'postcard', solarTerm: '冬至',
    poem: { id: 'tang_003103', mingju: '会当凌绝顶，一览众山小', full: '西岳崚嶒竦处尊，诸峰罗立如儿孙。安得仙人九节杖，拄到玉女洗头盆。车箱入谷无归路，箭栝通天有一门。稍待西风凉冷后，高寻白帝问真源。', title: '望岳', author: '杜甫', dynasty: '唐', form: '诗(近体)' },
    resonance: '雪抹平了所有棱角，把山和水调成了一种色调。杜甫说"会当凌绝顶，一览众山小"——当你看过这样开阔的冬，再小的烦心事，也小不过远处那一粒雪。',
    postscript: '', createdAt: BASE - 3 * day,
  },
  {
    image: '/samples/r15.jpg', themeText: '路因为有伴才变短', themeType: 'moment',
    accent: { accent: '#6fb07e' }, layout: 'ticket', solarTerm: '秋分',
    poem: { id: 'tang_055951', mingju: '桃花潭水深千尺，不及汪伦送我情', full: '李白乘舟将欲行，忽闻岸上踏歌声。桃花潭水深千尺，不及汪伦送我情。', title: '赠汪伦', author: '李白', dynasty: '唐', form: '诗(近体)' },
    resonance: '两个人走在开阔的田野间，不必说话，路自己就往前铺。李白说"桃花潭水深千尺，不及汪伦送我情"——有人愿意陪你走一段，这件事，比千尺深的潭水还要深。',
    postscript: '', createdAt: BASE - 1 * day,
  },
  {
    image: '/samples/r16.jpg', themeText: '谁动了这片叶子', themeType: 'object',
    accent: { accent: '#5fa99b' }, layout: 'shujian', solarTerm: '立秋',
    poem: { id: 'ci_017738', mingju: '知否，知否？应是绿肥红瘦', full: '昨夜雨疏风骤。浓睡不消残酒。试问卷帘人，却道海棠依旧。知否。知否。应是绿肥红瘦。', title: '如梦令', author: '李清照', dynasty: '宋', form: '词' },
    resonance: '虫咬过的缺口让光透进来，叶子的纹路反而更清楚了。李清照说"知否，知否？应是绿肥红瘦"——残缺不是遗憾，是时间在上面签了个名，说：这一片，我认真活过。',
    postscript: '', createdAt: BASE - 3600 * 1000,
  },
]

const SEED_V3 = [
  {
    image: '/samples/r2.jpg', themeText: '花映旧墙', themeType: 'object',
    accent: { accent: '#e2929e' }, layout: 'postcard', solarTerm: '清明',
    poem: { id: 'seed_tidu', mingju: '人面不知何处去，桃花依旧笑春风', full: '去年今日此门中，人面桃花相映红。人面不知何处去，桃花依旧笑春风。', title: '题都城南庄', author: '崔护', dynasty: '唐', form: '诗(近体)' },
    resonance: '旧墙不说话，桃花却年年开。像崔护写的那样，有些春天会留在原地，替人记住来过的人。',
    postscript: '', createdAt: BASE - 14 * day,
  },
  {
    image: '/samples/r8.jpg', themeText: '枝头的粉色浪潮', themeType: 'object',
    accent: { accent: '#e2929e' }, layout: 'shujian', solarTerm: '春分',
    poem: { id: 'seed_dufu_taohua', mingju: '桃花一簇开无主，可爱深红爱浅红', full: '黄师塔前江水东，春光懒困倚微风。桃花一簇开无主，可爱深红爱浅红。', title: '江畔独步寻花', author: '杜甫', dynasty: '唐', form: '诗(近体)' },
    resonance: '这一树粉色开得很松弛，不像给谁看，却偏偏让人停住。杜甫也懂这种犹豫：深红浅红，到底哪一种更可爱。',
    postscript: '', createdAt: BASE - 8 * day,
  },
  {
    image: '/samples/r14.jpg', themeText: '天空里的一笔', themeType: 'moment',
    accent: { accent: '#6f9aa8' }, layout: 'ticket', solarTerm: '霜降',
    poem: { id: 'seed_dufu_jueju', mingju: '两个黄鹂鸣翠柳，一行白鹭上青天', full: '两个黄鹂鸣翠柳，一行白鹭上青天。窗含西岭千秋雪，门泊东吴万里船。', title: '绝句', author: '杜甫', dynasty: '唐', form: '诗(近体)' },
    resonance: '鸟从蓝天上掠过去，像有人替天空落了一笔。杜甫写白鹭上青天，也是在这样的开阔里，忽然看见心变轻了。',
    postscript: '', createdAt: BASE - 2 * day,
  },
]

// 合并种子池
const ALL_SEEDS = [...SEED_V1, ...SEED_V2, ...SEED_V3]

export const SEED_JIAN = ALL_SEEDS

// 当前种子版本：递增此数字即可触发增量注入（新种子会加入，已有数据不会丢）
export const SEED_VERSION = 7
