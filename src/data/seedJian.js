// 示例诗笺 + 用户真实照片（共 21 张）
// 种子版本号：增量注入——版本升级时新种子自动加入，已有的不重复注入。
const day = 86400000
const now = Date.now()

// 第一批：经典示例（5张，李白/杜甫/苏轼/李清照/陆游）
const SEED_V1 = [
  {
    image: '/samples/1.jpg', themeText: '屋檐边探出来的春色', themeType: 'object',
    accent: { accent: '#e2929e' }, layout: 'postcard', solarTerm: '谷雨',
    poem: { id: 'seed_linan', mingju: '小楼一夜听春雨，深巷明朝卖杏花', full: '世味年来薄似纱，谁令骑马客京华。小楼一夜听春雨，深巷明朝卖杏花。矮纸斜行闲作草，晴窗细乳戏分茶。素衣莫起风尘叹，犹及清明可到家。', title: '临安春雨初霁', author: '陆游', dynasty: '宋', form: '诗' },
    resonance: '它从老屋檐边悄悄探出头——陆游也曾在小楼里听了一夜春雨，等的就是这一枝杏花。',
    postscript: '', createdAt: now - 21 * day,
  },
  {
    image: '/samples/2.jpg', themeText: '一点被你发现的小幸运', themeType: 'object',
    accent: { accent: '#6fb07e' }, layout: 'postcard', solarTerm: '立夏',
    poem: { id: 'seed_diealian', mingju: '枝上柳绵吹又少，天涯何处无芳草', full: '花褪残红青杏小。燕子飞时，绿水人家绕。枝上柳绵吹又少，天涯何处无芳草。', title: '蝶恋花·春景', author: '苏轼', dynasty: '宋', form: '词' },
    resonance: '这么小一株，竟被你蹲下来看见了。苏轼说天涯到处都有芳草——好运也是，就看你肯不肯低头找。',
    postscript: '', createdAt: now - 19 * day,
  },
  {
    image: '/samples/3.jpg', themeText: '一片水里的倒影', themeType: 'moment',
    accent: { accent: '#6f9aa8' }, layout: 'shujian', solarTerm: '小满',
    poem: { id: 'seed_rumengling', mingju: '常记溪亭日暮，沉醉不知归路', full: '常记溪亭日暮，沉醉不知归路。兴尽晚回舟，误入藕花深处。争渡，争渡，惊起一滩鸥鹭。', title: '如梦令', author: '李清照', dynasty: '宋', form: '词' },
    resonance: '水把天和树都收下来了。像易安那回，溪亭日暮、误入藕花——最美的，常在你低头看水的那一刻。',
    postscript: '', createdAt: now - 18 * day,
  },
  {
    image: '/samples/4.jpg', themeText: '一树开到极盛的花', themeType: 'object',
    accent: { accent: '#e2929e' }, layout: 'postcard', solarTerm: '清明',
    poem: { id: 'seed_xunhua', mingju: '黄四娘家花满蹊，千朵万朵压枝低', full: '黄四娘家花满蹊，千朵万朵压枝低。留连戏蝶时时舞，自在娇莺恰恰啼。', title: '江畔独步寻花', author: '杜甫', dynasty: '唐', form: '诗' },
    resonance: '千朵万朵，把枝都压低了。杜甫在黄四娘家也见过这样的花——开得这么用力，是想让路过的人都停一下。',
    postscript: '', createdAt: now - 17 * day,
  },
  {
    image: '/samples/5.jpg', themeText: '并肩走着的两个人', themeType: 'moment',
    accent: { accent: '#cba35f' }, layout: 'ticket', solarTerm: '芒种',
    poem: { id: 'seed_xinglunan', mingju: '长风破浪会有时，直挂云帆济沧海', full: '行路难，行路难，多歧路，今安在？长风破浪会有时，直挂云帆济沧海。', title: '行路难', author: '李白', dynasty: '唐', form: '诗' },
    resonance: '一条路，两个人，走向远处的金色。李白说长风破浪会有时——有人同行的路，再远也不慌。',
    postscript: '和ta一起走了好久。', createdAt: now - 16 * day,
  },
]

// 第二批：用户真实照片（16张，AI 读图 + 诗库匹配 + 共鸣话）
const SEED_V2 = [
  {
    image: '/samples/r1.jpg', themeText: '一只橘猫静坐路边', themeType: 'moment',
    accent: { accent: '#cba35f' }, layout: 'postcard', solarTerm: '芒种',
    poem: { id: 'ci_001040', mingju: '百亩中庭半是苔', full: '百亩中庭半是苔。门前白道水萦回。爱闲能有几人来。小院回廊春寂寂，山桃溪杏两三栽。为谁零落为谁开。', title: '浣溪沙', author: '王安石', dynasty: '宋', form: '词' },
    resonance: '橘猫守着满墙绿意，像极了那句"半是苔"的静气。它不问归期，只把路旁坐成一方自在的小庭院。',
    postscript: '', createdAt: now - 15 * day,
  },
  {
    image: '/samples/r2.jpg', themeText: '春日花开映古院', themeType: 'object',
    accent: { accent: '#5fa99b' }, layout: 'shujian', solarTerm: '春分',
    poem: { id: 'ci_001899', mingju: '暖律才中，正莺喉竞巧，燕语新成', full: '暖律才中，正莺喉竞巧，燕语新成。万绿阴浓，全无一点芳尘。门巷朝来报喜，庆佳期、此日光荣。开华宴、交酌琼酥，共祝鹤算椿龄。须知最难得处，双双凤翼，一对和鸣。造化无私，谁教特地多情。惟愿疏封大国，彩笺上、频易佳名。从此去、贤子才孙，岁岁长捧瑶觥。', title: '万年欢', author: '李之仪', dynasty: '宋', form: '词' },
    resonance: '檐角静默，花枝却闹，这动静间的张力，恰似新莺初试啼声。不必言说，那份春日初醒的生机已顺着屋檐淌进心里。',
    postscript: '', createdAt: now - 14 * day,
  },
  {
    image: '/samples/r3.jpg', themeText: '掌心捧着幸运的绿意', themeType: 'object',
    accent: { accent: '#e2929e' }, layout: 'ticket', solarTerm: '惊蛰',
    poem: { id: 'ci_009861', mingju: '夜来早得东风信，潇湘一川新绿，柳色含晴，梅心沁暖，春浅千花如束', full: '夜来早得东风信，潇湘一川新绿，柳色含晴，梅心沁暖，春浅千花如束。银蝉乍浴。正沙雁将还，海鳌初矗。云拥旌旗，笑声人在画阑曲。星虹瑶树缥缈，佩环鸣碧落，瑞笼华屋。露耿铜虬，冰翻铁马，帘幕光摇金粟。迟迟倚竹。更为把瑶尊，满斟醽醁。回首宫莲，夜深归院烛。', title: '齐天乐', author: '文天祥', dynasty: '宋', form: '词' },
    resonance: '掌心这一抹新绿，恰似东风捎来的第一封信。不必等繁花似锦，此刻指尖的生机，便是春天最确凿的回音。',
    postscript: '', createdAt: now - 13 * day,
  },
  {
    image: '/samples/r4.jpg', themeText: '秋水倒影，孤树静立', themeType: 'moment',
    accent: { accent: '#6f9aa8' }, layout: 'postcard', solarTerm: '霜降',
    poem: { id: 'ci_000041', mingju: '碧云天，黄叶地，秋色连波，波上寒烟翠', full: '碧云天，黄叶地。秋色连波，波上寒烟翠。山映斜阳天接水。芳草无情，更在斜阳外。黯乡魂，追旅思。夜夜除非，好梦留人睡。明月楼高休独倚。酒入愁肠，化作相思泪。', title: '苏幕遮', author: '范仲淹', dynasty: '宋', form: '词' },
    resonance: '你看那水底的树影，不正是"秋色连波"么？叶落水中，天地在这一瞬颠倒，那份清冷又辽阔的静，便有了着落。',
    postscript: '', createdAt: now - 12 * day,
  },
  {
    image: '/samples/r5.jpg', themeText: '夏日古巷，静谧悠然', themeType: 'moment',
    accent: { accent: '#6fb07e' }, layout: 'shujian', solarTerm: '夏至',
    poem: { id: 'yuan_000063', mingju: '小院深闲清昼', full: '小院深闲清昼。清幽，听声声蝉噪柳梢头。', title: '六幺遍・乍凉时候，西风透。碧梧脱叶，余暑才收。香生凤口，帘垂玉钩，', author: '关汉卿', dynasty: '元', form: '散曲(小令)' },
    resonance: '古墙下的绿意正浓，电动车静默一隅，这白昼里的停驻与安宁，恰似那句"清昼"里的悠长余味。',
    postscript: '', createdAt: now - 11 * day,
  },
  {
    image: '/samples/r6.jpg', themeText: '小猫在车里安详地躺着', themeType: 'object',
    accent: { accent: '#cba35f' }, layout: 'ticket', solarTerm: '小暑',
    poem: { id: 'ci_014591', mingju: '清润奇峰名韫玉，温其质并琼瑶', full: '清润奇峰名韫玉，温其质并琼瑶。中分瀑布写云涛。双峦呈翠色，气象两相高。珍重幽人诚好事，绿窗聊助风骚。寄言俗客莫相嘲。物轻人意重，千里赠鹅毛。', title: '临江仙', author: '李之仪', dynasty: '宋', form: '词' },
    resonance: '它蜷成一团暖玉，睡得那样沉实。不必寻章摘句去描摹它的梦，这份安安稳稳的"温其质"，便是此刻最好的注脚。',
    postscript: '', createdAt: now - 10 * day,
  },
  {
    image: '/samples/r7.jpg', themeText: '雪山寒水，孤村静卧湖畔', themeType: 'object',
    accent: { accent: '#5fa99b' }, layout: 'postcard', solarTerm: '大寒',
    poem: { id: 'ci_009675', mingju: '冰溪空岁晚，苍茫雁影，浅水落寒沙', full: '冰溪空岁晚，苍茫雁影，浅水落寒沙。那回乘夜兴，云雪孤舟，曾访故人家。千林未绿，芳信暖、玉照霜华。共凭高，联诗唤酒，暝色夺昏鸦。堪嗟。澌鸣玉佩，山护云衣，又扁舟东下。想故园、天寒倚竹，袖薄笼纱。诗筒已是经年别，早暖律、春动香葭。愁寄远，溪边自折梅花。', title: '三犯渡江云・渡江云', author: '周密', dynasty: '宋', form: '词' },
    resonance: '雪覆山峦是静默的白，枯草残雪是萧瑟的灰，这画面里没有喧闹，只有天地间的苍茫与清冷。周密的词里，冰溪、岁晚、寒沙，恰好接住了这份冬日湖畔独有的寂寥。',
    postscript: '', createdAt: now - 9 * day,
  },
  {
    image: '/samples/r8.jpg', themeText: '春日花开，满园温柔', themeType: 'moment',
    accent: { accent: '#e2929e' }, layout: 'shujian', solarTerm: '雨水',
    poem: { id: 'ci_009861', mingju: '夜来早得东风信，潇湘一川新绿，柳色含晴，梅心沁暖，春浅千花如束', full: '夜来早得东风信，潇湘一川新绿，柳色含晴，梅心沁暖，春浅千花如束。银蝉乍浴。正沙雁将还，海鳌初矗。云拥旌旗，笑声人在画阑曲。星虹瑶树缥缈，佩环鸣碧落，瑞笼华屋。露耿铜虬，冰翻铁马，帘幕光摇金粟。迟迟倚竹。更为把瑶尊，满斟醽醁。回首宫莲，夜深归院烛。', title: '齐天乐', author: '文天祥', dynasty: '宋', form: '词' },
    resonance: '枝头的粉白正开得不管不顾，像极了那句"春浅千花如束"。不必管它写的是柳是梅，那股子被东风唤醒、簇拥在一起的热闹劲儿，和你镜头里满溢的生机是一样的。',
    postscript: '', createdAt: now - 8 * day,
  },
  {
    image: '/samples/r9.jpg', themeText: '夜色中，两杯美酒静待知音', themeType: 'object',
    accent: { accent: '#6f9aa8' }, layout: 'ticket', solarTerm: '白露',
    poem: { id: 'ci_009716', mingju: '云叶千重，麝尘轻染金缕', full: '云叶千重，麝尘轻染金缕。弄娇风软、霞绡舞。花国选倾城，暖玉倚银屏，绰约娉婷，浅素宫黄争妩。生怕春知，金屋藏娇深处。蜂蝶寻芳无据。醉眼迷花映红雾。修花谱。翠毫夜湿天香露。', title: '倚风娇近', author: '周密', dynasty: '宋', form: '词' },
    resonance: '夜色沉下来，酒液里的光晕像极了那句"麝尘轻染"，不必言语，这份静谧的温情便已足够动人。',
    postscript: '', createdAt: now - 7 * day,
  },
  {
    image: '/samples/r10.jpg', themeText: '一滴落水，扰了静湖', themeType: 'object',
    accent: { accent: '#6fb07e' }, layout: 'postcard', solarTerm: '处暑',
    poem: { id: 'ci_015457', mingju: '川原澄映，烟月冥濛，去舟如叶', full: '川原澄映，烟月冥濛，去舟如叶。岸足沙平，蒲根水冷留雁唼。别有孤角吟秋，对晓风呜轧。红日三竿，醉头扶起还怯。离思相萦，渐看看、鬓丝堪镊。舞衫歌扇，何人轻怜细阅。点检从前恩爱，但凤笺盈箧，愁剪灯花，夜来和泪双叠。', title: '华胥引', author: '周邦彦', dynasty: '宋', form: '词' },
    resonance: '那滴水落下的瞬间，就像心绪被轻轻搅动，原本清晰的倒影散了，只剩下一片朦胧的烟月。不必看清去向，那份模糊里的怅惘，恰如孤舟远去后的空阔。',
    postscript: '', createdAt: now - 6 * day,
  },
  {
    image: '/samples/r11.jpg', themeText: '院中家禽悠然自得', themeType: 'moment',
    accent: { accent: '#cba35f' }, layout: 'shujian', solarTerm: '立夏',
    poem: { id: 'yuan_000063', mingju: '小院深闲清昼', full: '小院深闲清昼。清幽，听声声蝉噪柳梢头。', title: '六幺遍・乍凉时候，西风透。碧梧脱叶，余暑才收。香生凤口，帘垂玉钩，', author: '关汉卿', dynasty: '元', form: '散曲(小令)' },
    resonance: '日光把树影拉得漫长，鸡鸭在脚下踱步，时间仿佛在这一刻停驻。这无需言语的安稳，正合了那句"小院深闲"。',
    postscript: '', createdAt: now - 5 * day,
  },
  {
    image: '/samples/r12.jpg', themeText: '雪山如镜，静水无言', themeType: 'moment',
    accent: { accent: '#5fa99b' }, layout: 'ticket', solarTerm: '小雪',
    poem: { id: 'ci_002264', mingju: '雪月两相映，水石互悲鸣', full: '雪月两相映，水石互悲鸣。不知岩上枯木，今夜若为情。应见尘中胶扰。便道山间空旷，与麽了平生。与麽平生了，□水不流行。起披衣，瞻碧汉，露华清。寥寥千载，此事本分明。若向乾坤识易，便信行藏无间，处处总圆成。记取渊冰语，莫错定盘星。', title: '水调歌头', author: '朱熹', dynasty: '宋', form: '词' },
    resonance: '雪山与湖面互为镜像，天地在此刻静默对视。这清绝的冷意里，没有喧嚣，只有水石相激的微响，像极了那句「雪月两相映」里的孤清与自持。',
    postscript: '', createdAt: now - 4 * day,
  },
  {
    image: '/samples/r13.jpg', themeText: '雪映寒山静水间', themeType: 'moment',
    accent: { accent: '#e2929e' }, layout: 'postcard', solarTerm: '冬至',
    poem: { id: 'ci_009675', mingju: '冰溪空岁晚，苍茫雁影，浅水落寒沙', full: '冰溪空岁晚，苍茫雁影，浅水落寒沙。那回乘夜兴，云雪孤舟，曾访故人家。千林未绿，芳信暖、玉照霜华。共凭高，联诗唤酒，暝色夺昏鸦。堪嗟。澌鸣玉佩，山护云衣，又扁舟东下。想故园、天寒倚竹，袖薄笼纱。诗筒已是经年别，早暖律、春动香葭。愁寄远，溪边自折梅花。', title: '三犯渡江云・渡江云', author: '周密', dynasty: '宋', form: '词' },
    resonance: '枯草没入浅水，正如寒沙承托残冬。这画面里没有浓烈的悲喜，只有天地岁晚时，那份清冷而真实的空旷。',
    postscript: '', createdAt: now - 3 * day,
  },
  {
    image: '/samples/r14.jpg', themeText: '喜鹊掠过秋林，静谧而悠然', themeType: 'object',
    accent: { accent: '#6f9aa8' }, layout: 'shujian', solarTerm: '寒露',
    poem: { id: 'ci_010472', mingju: '游丝纤弱', full: '游丝纤弱。谩著意绊春，春难凭托。水暖成纹，云晴生影，双燕又窥帘幕。露添牡丹新艳，风摆秋千闲索。对此景，动高歌一曲，何妨行乐。行乐。春正好，无奈绿窗，孤负敲棋约。锦屋调笙，银瓶索酒，争奈也曾迷著。自从发凋心倦，常倚钩阑斜角。翠深处，看悠悠几点，杨花飞落。', title: '喜迁莺', author: '蒋捷', dynasty: '宋', form: '词' },
    resonance: '晴空红叶是秋的盛装，喜鹊掠过却带出一丝转瞬即逝的轻愁。这份在明丽中悄然滋长的闲适与孤单，恰如游丝般纤细难捉，不必言说，只消静静看着便懂了。',
    postscript: '', createdAt: now - 2 * day,
  },
  {
    image: '/samples/r15.jpg', themeText: '两人漫步乡间，岁月静好', themeType: 'moment',
    accent: { accent: '#6fb07e' }, layout: 'ticket', solarTerm: '秋分',
    poem: { id: 'yuan_009446', mingju: '天淡云闲，列长空数行征雁', full: '天淡云闲，列长空数行征雁。御园中夏景初残：柳添黄，荷减翠，秋莲脱瓣。坐近幽兰，喷清香玉簪花绽。', title: '唐明皇秋夜梧桐雨・中吕/粉蝶儿', author: '白朴', dynasty: '元', form: '散曲(小令)' },
    resonance: '天淡云闲，路也宽了。两人并肩走在开阔的田野间，不必言语，那份自在便如长空征雁般舒展。',
    postscript: '', createdAt: now - 1 * day,
  },
  {
    image: '/samples/r16.jpg', themeText: '绿叶斑驳，静谧自然', themeType: 'object',
    accent: { accent: '#5fa99b' }, layout: 'shujian', solarTerm: '立秋',
    poem: { id: 'ci_001823', mingju: '深帘静昼', full: '深帘静昼。绰约闺房秀。叩衣楚制飞文绣。凝脂肤理腻，削玉腰围瘦。闲舞袖。回身昵语凭肩久。眉压横波皱。歌断青青柳。钗遽擘，壶频叩。鬓凄清镜雪，泪涨芳樽酒。难再偶。沈沈梦峡雪归后。', title: '千秋岁', author: '李之仪', dynasty: '宋', form: '词' },
    resonance: '虫咬的缺口让光透进来，日子便有了具体的形状。这份白昼里的静默与残缺，恰如深帘后那声无人听见的轻叹。',
    postscript: '', createdAt: now - 3600 * 1000,
  },
]

// 合并种子池
const ALL_SEEDS = [...SEED_V1, ...SEED_V2]

export const SEED_JIAN = ALL_SEEDS

// 当前种子版本：递增此数字即可触发增量注入（新种子会加入，已有数据不会丢）
export const SEED_VERSION = 2
