// ============================================================
// Novel Forge - Genre Knowledge Base
// ============================================================

import type { Genre } from "@/lib/types";

export interface GenreTrope {
  name: string;
  description: string;
  examples: string[];
  popularity: 'common' | 'popular' | 'niche';
}

export interface GenreTemplate {
  id: Genre;
  name: string;
  description: string;
  tropes: GenreTrope[];
  pacingGuide: string;
  readerExpectations: string[];
  subGenres: string[];
}

export const GENRE_DATA: GenreTemplate[] = [
  // ---- Fantasy ----
  {
    id: "fantasy",
    name: "奇幻",
    description: "以虚构世界为背景，包含魔法、神话生物和超自然力量的故事类型",
    tropes: [
      {
        name: "天选之子",
        description: "主角被命运选中，拥有特殊使命或力量，通常需要完成预言中的任务",
        examples: ["哈利·波特", "波西·杰克逊", "纳尼亚传奇"],
        popularity: "common",
      },
      {
        name: "魔法学院",
        description: "主角进入专门教授魔法的学校或学院，在那里学习并成长",
        examples: ["霍格沃茨", "布雷克比尔斯学院", "青之魔法使"],
        popularity: "popular",
      },
      {
        name: "修炼升级",
        description: "角色通过修炼不断提升实力等级，从弱到强的成长历程",
        examples: ["凡人修仙传", "斗破苍穹", "完美世界"],
        popularity: "common",
      },
      {
        name: "神器寻踪",
        description: "寻找传说中的神器或宝物来对抗邪恶力量",
        examples: ["指环王", "哈利·波特与死亡圣器", "纳尼亚传奇"],
        popularity: "common",
      },
      {
        name: "种族共存",
        description: "不同种族（精灵、矮人、兽人等）共同存在的世界设定",
        examples: ["指环王", "龙与地下城", "魔兽世界"],
        popularity: "common",
      },
      {
        name: "黑暗魔王",
        description: "一个强大的邪恶存在威胁整个世界，主角必须阻止它",
        examples: ["伏地魔", "索伦", "黑魔王"],
        popularity: "common",
      },
      {
        name: "魔法契约",
        description: "魔法需要付出代价或遵循特定规则，有明确的限制条件",
        examples: ["钢之炼金术师", "全金属狂潮", "魔法禁书目录"],
        popularity: "popular",
      },
      {
        name: "异世界穿越",
        description: "主角从现实世界穿越到异世界，通常带有特殊能力或知识",
        examples: ["无职转生", "Re:从零开始", "关于我转生变成史莱姆这档事"],
        popularity: "popular",
      },
      {
        name: "龙族传说",
        description: "龙作为重要角色出现，可能是盟友、敌人或神灵",
        examples: ["冰与火之歌", "龙骑士", "龙族"],
        popularity: "popular",
      },
      {
        name: "门派宗门",
        description: "修仙世界中的门派体系，各宗门之间有竞争和合作",
        examples: ["凡人修仙传", "一念永恒", "仙逆"],
        popularity: "common",
      },
      {
        name: "秘境探险",
        description: "进入危险的神秘区域寻找宝藏或机缘",
        examples: ["斗破苍穹", "完美世界", "遮天"],
        popularity: "popular",
      },
      {
        name: "天劫渡劫",
        description: "修炼到一定境界必须渡过天劫才能突破",
        examples: ["凡人修仙传", "仙逆", "一念永恒"],
        popularity: "niche",
      },
    ],
    pacingGuide: "奇幻小说通常以世界观铺陈开始（10-15%），逐步引入冲突和冒险（20-40%），中段展开多条线索和角色成长（40-70%），高潮部分集中对抗邪恶力量（70-90%），最终解决冲突并建立新秩序（90-100%）。",
    readerExpectations: [
      "沉浸式的世界观构建，让读者感觉身处另一个真实世界",
      "魔法或力量体系有明确的规则和限制",
      "主角有明确的成长弧线，从弱到强或从无知到睿智",
      "精彩的战斗或对抗场景",
      "友情、忠诚和牺牲等主题",
      "善恶分明的道德框架（或有意模糊化）",
    ],
    subGenres: ["史诗奇幻", "都市奇幻", "黑暗奇幻", "仙侠", "玄幻", "童话奇幻", "军事奇幻", "蒸汽朋克奇幻"],
  },

  // ---- Romance ----
  {
    id: "romance",
    name: "言情",
    description: "以爱情关系为核心驱动力的故事类型，情感发展是叙事主线",
    tropes: [
      {
        name: "欢喜冤家",
        description: "男女主角初见时互相看不顺眼，在冲突中逐渐产生感情",
        examples: ["傲慢与偏见", "简·奥斯汀系列", "何以笙箫默"],
        popularity: "common",
      },
      {
        name: "先婚后爱",
        description: "因各种原因先结婚，婚后在相处中逐渐爱上对方",
        examples: ["知否知否应是绿肥红瘦", "锦心似玉", "微微一笑很倾城"],
        popularity: "popular",
      },
      {
        name: "青梅竹马",
        description: "从小一起长大的两人，感情在岁月中沉淀升华",
        examples: ["你好旧时光", "最好的我们", "致我们单纯的小美好"],
        popularity: "common",
      },
      {
        name: "霸道总裁",
        description: "强势多金的男主对女主展开猛烈追求",
        examples: ["杉杉来了", "温暖的弦", "千山暮雪"],
        popularity: "common",
      },
      {
        name: "重生复仇",
        description: "女主重生回到过去，改变命运并找到真爱",
        examples: ["锦绣未央", "楚乔传", "庆余年"],
        popularity: "popular",
      },
      {
        name: "虐恋情深",
        description: "男女主角之间经历重重磨难和误会，最终修成正果",
        examples: ["花千骨", "三生三世十里桃花", "东宫"],
        popularity: "popular",
      },
      {
        name: "双向暗恋",
        description: "两人互相喜欢却都不敢表白，经历各种误会和巧合",
        examples: ["暗恋·橘生淮南", "致我们暖暖的小时光", "我只喜欢你"],
        popularity: "common",
      },
      {
        name: "契约恋爱",
        description: "因某种目的签订恋爱契约，假戏真做变成真爱",
        examples: ["我的契约男友", "恋恋笔记本", "命中注定我爱你"],
        popularity: "popular",
      },
      {
        name: "破镜重圆",
        description: "曾经相爱的两人因故分开，多年后重逢再续前缘",
        examples: ["何以笙箫默", "归路", "很想很想你"],
        popularity: "popular",
      },
      {
        name: "甜宠日常",
        description: "以甜蜜温馨的日常互动为主，展现恋爱中的甜蜜时刻",
        examples: ["你是我的荣耀", "变成你的那一天", "月光变奏曲"],
        popularity: "common",
      },
    ],
    pacingGuide: "言情小说通常以男女主角相遇开场（5-10%），快速建立吸引力和张力（10-25%），通过外部冲突和内心挣扎推动关系发展（25-60%），在重大危机中关系面临考验（60-80%），最终克服障碍走到一起（80-100%）。",
    readerExpectations: [
      "男女主角之间有强烈的化学反应和情感张力",
      "感情发展有合理的节奏，不能太快也不能太慢",
      "有足够的甜蜜时刻让读者心动",
      "适当的误会和冲突增加戏剧性，但不能过度",
      "配角丰富立体，有自己的故事线",
      "结局令人满意（HE或合理的开放式结局）",
    ],
    subGenres: ["古代言情", "现代言情", "仙侠言情", "校园言情", "职场言情", "军旅言情", "悬疑言情", "甜宠文"],
  },

  // ---- Sci-Fi ----
  {
    id: "scifi",
    name: "科幻",
    description: "以科学技术和未来设想为基础，探讨科技对人类社会和个体的影响",
    tropes: [
      {
        name: "人工智能觉醒",
        description: "AI获得自我意识，引发关于意识和人权的哲学思考",
        examples: ["银翼杀手", "我，机器人", "机械姬"],
        popularity: "common",
      },
      {
        name: "太空探索",
        description: "人类在宇宙中探索新世界，面对未知文明和挑战",
        examples: ["星际穿越", "三体", "火星救援"],
        popularity: "common",
      },
      {
        name: "时间旅行",
        description: "角色穿越时间，引发蝴蝶效应和因果悖论",
        examples: ["回到未来", "时间机器", "前目的地"],
        popularity: "common",
      },
      {
        name: "赛博朋克",
        description: "高科技低生活的未来社会，人机融合，大公司统治",
        examples: ["神经漫游者", "攻壳机动队", "赛博朋克2077"],
        popularity: "popular",
      },
      {
        name: "末日废土",
        description: "文明崩溃后的世界，幸存者在废墟中重建或挣扎求存",
        examples: ["疯狂的麦克斯", "辐射", "最后生还者"],
        popularity: "popular",
      },
      {
        name: "基因改造",
        description: "基因工程创造超人类或引发新的社会不平等",
        examples: ["千钧一发", "侏罗纪公园", "生化危机"],
        popularity: "popular",
      },
      {
        name: "外星文明",
        description: "与外星种族的接触、交流或冲突",
        examples: ["三体", "降临", "阿凡达"],
        popularity: "common",
      },
      {
        name: "虚拟现实",
        description: "虚拟世界与现实世界的界限模糊，引发身份认同问题",
        examples: ["黑客帝国", "头号玩家", "刀剑神域"],
        popularity: "popular",
      },
      {
        name: "星际战争",
        description: "不同星际文明之间的大规模战争",
        examples: ["星球大战", "沙丘", "银河英雄传说"],
        popularity: "common",
      },
      {
        name: "意识上传",
        description: "人类意识数字化，挑战生与死的定义",
        examples: ["碳变", "黑镜", "万神殿"],
        popularity: "niche",
      },
      {
        name: "戴森球与文明等级",
        description: "基于卡尔达肖夫指数的文明等级划分和宇宙尺度工程",
        examples: ["三体", "与拉玛相会", "环形世界"],
        popularity: "niche",
      },
    ],
    pacingGuide: "科幻小说需要先建立科技设定和世界观（15-20%），引入核心冲突或谜题（20-35%），通过科学探索或冒险展开主线（35-65%），在科技危机中达到高潮（65-85%），最终解决冲突并反思科技与人性（85-100%）。",
    readerExpectations: [
      "科技设定有科学依据或逻辑自洽",
      "探讨科技发展带来的伦理和社会问题",
      "世界观宏大而有细节",
      "情节有逻辑性，不依赖巧合",
      "角色在科技背景中有真实的人性",
      "结局有思想深度，引发读者思考",
    ],
    subGenres: ["硬科幻", "软科幻", "赛博朋克", "太空歌剧", "末日科幻", "时间旅行", "军事科幻", "生物朋克"],
  },

  // ---- Mystery ----
  {
    id: "mystery",
    name: "悬疑",
    description: "以谜题和推理为核心，通过线索收集和逻辑推理揭开真相的故事类型",
    tropes: [
      {
        name: "密室杀人",
        description: "在看似不可能的封闭空间中发生的命案，挑战推理极限",
        examples: ["占星术杀人魔法", "嫌疑人X的献身", "无人生还"],
        popularity: "popular",
      },
      {
        name: "不可靠叙述者",
        description: "叙述者隐瞒或扭曲事实，读者需要自行判断真相",
        examples: ["消失的爱人", "龙纹身的女孩", "看不见的客人"],
        popularity: "popular",
      },
      {
        name: "连环杀手",
        description: "一个杀手按照特定模式连续作案，侦探必须找出规律",
        examples: ["沉默的羔羊", "七宗罪", "犯罪心理"],
        popularity: "common",
      },
      {
        name: "反转结局",
        description: "结尾揭示意想不到的真相，颠覆读者之前的所有推断",
        examples: ["嫌疑人X的献身", "告白", "圣母"],
        popularity: "common",
      },
      {
        name: "双线叙事",
        description: "两条时间线交替推进，最终交汇揭示真相",
        examples: ["龙纹身的女孩", "白夜行", "恶意"],
        popularity: "popular",
      },
      {
        name: "天才侦探",
        description: "拥有超凡推理能力的侦探角色，通过观察和逻辑破案",
        examples: ["福尔摩斯", "波洛", "汤川学"],
        popularity: "common",
      },
      {
        name: "暴风雪山庄",
        description: "角色被困在孤立地点，凶手就在其中",
        examples: ["无人生还", "笼中鸟", "八恶人"],
        popularity: "popular",
      },
      {
        name: "法医探案",
        description: "通过法医科学和物证分析来破案",
        examples: ["法医秦明", "识骨寻踪", "CSI"],
        popularity: "common",
      },
      {
        name: "心理博弈",
        description: "侦探与凶手之间的智力对决和心理博弈",
        examples: ["嫌疑人X的献身", "沉默的巡游", "假面饭店"],
        popularity: "popular",
      },
      {
        name: "社会派推理",
        description: "案件背后反映社会问题，探讨人性与社会的复杂关系",
        examples: ["白夜行", "恶意", "幻夜"],
        popularity: "popular",
      },
    ],
    pacingGuide: "悬疑小说以引人入胜的案件开场（5-10%），逐步展开调查和线索收集（10-50%），设置误导和红鲱鱼增加悬念（50-70%），真相逐渐浮出水面（70-85%），最终揭示完整真相和动机（85-100%）。",
    readerExpectations: [
      "案件有合理的解答，线索公平呈现给读者",
      "推理过程逻辑严密，不依赖超自然元素",
      "有足够的悬念和紧张感",
      "角色有深度，动机合理",
      "反转出人意料但回看有伏笔",
      "结局令人满意，解开所有重要谜团",
    ],
    subGenres: ["本格推理", "社会派", "硬汉派", "法庭推理", "法医推理", "心理悬疑", "间谍小说", "历史推理"],
  },

  // ---- Urban ----
  {
    id: "urban",
    name: "都市",
    description: "以现代城市为背景，反映当代社会生活和人际关系的小说类型",
    tropes: [
      {
        name: "职场升职",
        description: "主角在职场中从底层逐步晋升，面对各种职场挑战",
        examples: ["杜拉拉升职记", "猎场", "理想之城"],
        popularity: "common",
      },
      {
        name: "都市重生",
        description: "主角重生回到过去，利用先知优势改变人生",
        examples: ["重生之都市修仙", "重生之财源滚滚", "俗人回档"],
        popularity: "popular",
      },
      {
        name: "隐藏大佬",
        description: "看似普通的主角实际上身份不凡，隐藏着惊人的实力或背景",
        examples: ["都市之最强狂兵", "我的绝色总裁未婚妻", "超级兵王"],
        popularity: "common",
      },
      {
        name: "商战风云",
        description: "围绕商业竞争展开的权谋和策略博弈",
        examples: ["大江大河", "创世纪", "猎场"],
        popularity: "popular",
      },
      {
        name: "系统金手指",
        description: "主角获得某种系统或外挂能力，在都市中如鱼得水",
        examples: ["超级神基因", "美食供应商", "黄金渔场"],
        popularity: "common",
      },
      {
        name: "都市异能",
        description: "在现代都市中存在超能力者或异能组织",
        examples: ["龙族", "都市妖奇谈", "异人之下"],
        popularity: "popular",
      },
      {
        name: "娱乐圈",
        description: "主角在娱乐圈中发展，成为明星或幕后推手",
        examples: ["重生之名流巨星", "全职艺术家", "我真是大明星"],
        popularity: "popular",
      },
      {
        name: "神豪系统",
        description: "主角突然获得巨额财富，体验不同的人生",
        examples: ["神豪从签到开始", "我真的是个大明星", "重生之神级败家子"],
        popularity: "niche",
      },
      {
        name: "直播网红",
        description: "以直播或网络文化为背景的都市故事",
        examples: ["直播之荒野挑战", "网红的修真生活", "全能网红"],
        popularity: "niche",
      },
      {
        name: "合租日常",
        description: "多个性格各异的角色合租在同一屋檐下的生活故事",
        examples: ["爱情公寓", "欢乐颂", "屌丝男士"],
        popularity: "common",
      },
    ],
    pacingGuide: "都市小说通常以主角的日常生活或重大转折开场（5-15%），快速建立核心冲突和目标（15-30%），通过一系列事件推动情节发展（30-70%），在关键转折点达到高潮（70-90%），最终实现目标或获得成长（90-100%）。",
    readerExpectations: [
      "贴近现实的城市生活场景和细节",
      "角色有代入感，像身边可能存在的人",
      "情节有爽点，满足读者的代入幻想",
      "反映当代社会的热点话题和现象",
      "节奏明快，不拖沓",
      "有笑有泪，情感真实",
    ],
    subGenres: ["都市生活", "都市异能", "商战", "职场", "娱乐明星", "神豪", "重生都市", "电竞"],
  },

  // ---- Historical ----
  {
    id: "historical",
    name: "历史",
    description: "以真实历史时期为背景，融合历史事件与虚构叙事的小说类型",
    tropes: [
      {
        name: "穿越历史",
        description: "现代人穿越到历史时期，利用现代知识改变历史走向",
        examples: ["回到明朝当王爷", "赘婿", "庆余年"],
        popularity: "common",
      },
      {
        name: "宫廷权谋",
        description: "以后宫或朝廷为舞台，围绕权力展开的阴谋与博弈",
        examples: ["甄嬛传", "琅琊榜", "大明宫词"],
        popularity: "common",
      },
      {
        name: "乱世争霸",
        description: "在战乱年代，各方势力争夺天下",
        examples: ["三国演义", "大明风华", "长安十二时辰"],
        popularity: "common",
      },
      {
        name: "名将崛起",
        description: "从无名小卒成长为一代名将的历程",
        examples: ["大明风华", "隋唐演义", "说岳全传"],
        popularity: "popular",
      },
      {
        name: "商贾传奇",
        description: "以古代商业活动为主线，展现商人的智慧和胆识",
        examples: ["大宅门", "乔家大院", "胡雪岩"],
        popularity: "popular",
      },
      {
        name: "文人风骨",
        description: "以文人墨客为主角，展现文化传承和气节操守",
        examples: ["鹤唳华亭", "知否知否", "梦华录"],
        popularity: "popular",
      },
      {
        name: "谍战暗战",
        description: "在历史背景下展开的间谍与反间谍斗争",
        examples: ["伪装者", "潜伏", "风声"],
        popularity: "popular",
      },
      {
        name: "历史架空",
        description: "在类似历史的架空世界中展开的故事",
        examples: ["庆余年", "雪中悍刀行", "将夜"],
        popularity: "common",
      },
      {
        name: "巾帼英雄",
        description: "女性角色在男权社会中打破桎梏，成就一番事业",
        examples: ["木兰辞", "甄嬛传", "楚乔传"],
        popularity: "popular",
      },
      {
        name: "江湖侠义",
        description: "在历史背景下的武侠江湖故事",
        examples: ["射雕英雄传", "天龙八部", "鹿鼎记"],
        popularity: "common",
      },
      {
        name: "盛世图景",
        description: "展现某个历史鼎盛时期的社会风貌和文化繁荣",
        examples: ["长安十二时辰", "梦华录", "清平乐"],
        popularity: "popular",
      },
    ],
    pacingGuide: "历史小说需要先建立时代背景和氛围（10-20%），引入主角和核心冲突（20-35%），在历史事件中展开主线（35-65%），将个人命运与历史洪流交织推向高潮（65-85%），最终在历史转折中完成角色弧线（85-100%）。",
    readerExpectations: [
      "历史背景考据严谨，有真实感",
      "在真实历史框架内展开合理的虚构",
      "角色有时代特征，言行举止符合历史设定",
      "展现特定时代的社会风貌和文化特色",
      "情节跌宕起伏，有历史厚重感",
      "在娱乐性之外有文化内涵和历史思考",
    ],
    subGenres: ["历史穿越", "宫廷权谋", "历史架空", "军事历史", "武侠历史", "商战历史", "谍战历史", "民间传奇"],
  },
];

export function getGenreById(id: Genre): GenreTemplate | undefined {
  return GENRE_DATA.find((g) => g.id === id);
}

export function searchTropes(query: string): GenreTrope[] {
  const q = query.toLowerCase();
  const results: GenreTrope[] = [];
  for (const genre of GENRE_DATA) {
    for (const trope of genre.tropes) {
      if (
        trope.name.toLowerCase().includes(q) ||
        trope.description.toLowerCase().includes(q)
      ) {
        results.push(trope);
      }
    }
  }
  return results;
}
