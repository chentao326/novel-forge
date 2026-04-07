// ============================================================
// Novel Forge - 故事结构框架数据
// ============================================================

import type { StructureFramework } from '@/lib/types'

/** 单个节拍定义 */
export interface FrameworkBeat {
  /** 节拍名称 */
  name: string
  /** 在故事中的位置百分比 (0-100) */
  position: number
  /** 节拍描述模板 */
  description: string
  /** 情绪基调 */
  emotion_tone: string
  /** 创作指导 */
  guidance: string
}

/** 框架定义 */
export interface StoryFramework {
  /** 框架 ID */
  id: StructureFramework
  /** 框架名称 */
  name: string
  /** 框架描述 */
  description: string
  /** 适用类型 */
  bestFor: string[]
  /** 节拍列表 */
  beats: FrameworkBeat[]
}

// ============================================================
// 三幕结构
// ============================================================
const threeAct: StoryFramework = {
  id: 'three_act',
  name: '三幕结构',
  description: '最经典的故事结构，将故事分为建置、对抗和解决三个部分，适用于几乎所有类型的叙事作品。',
  bestFor: ['通用型', '电影', '小说', '戏剧'],
  beats: [
    {
      name: '建置',
      position: 0,
      description: '介绍主角的日常生活、世界和核心问题。建立读者对主角的认同感。',
      emotion_tone: '平静、日常',
      guidance: '展示主角的平凡世界，让读者产生共鸣。暗示主角内心深处的缺失或渴望。',
    },
    {
      name: '触发事件',
      position: 10,
      description: '打破主角日常生活的突发事件，迫使主角面对改变。',
      emotion_tone: '惊讶、不安',
      guidance: '这个事件应该足够强烈，让主角无法忽视。它打开了故事的可能性空间。',
    },
    {
      name: '第一转折点',
      position: 25,
      description: '主角做出决定，正式踏上旅程。从此无法回头，进入第二幕。',
      emotion_tone: '紧张、期待',
      guidance: '这是"不归路"的时刻。主角必须主动选择进入未知，而非被动被推入。',
    },
    {
      name: '上升行动',
      position: 37,
      description: '主角在新的世界中遭遇一系列挑战和障碍，尝试解决问题但不断受挫。',
      emotion_tone: '波折、成长',
      guidance: '通过递进的困难展示主角的成长。每个障碍都比上一个更难，推动角色弧线发展。',
    },
    {
      name: '中点',
      position: 50,
      description: '故事的转折中心。主角获得关键信息或遭遇重大挫折，心态发生根本转变。',
      emotion_tone: '震撼、觉醒',
      guidance: '中点应该让故事方向发生质变。主角从被动反应转为主动出击，或发现之前的认知是错误的。',
    },
    {
      name: '第二转折点',
      position: 75,
      description: '最后的重大转折，将主角推向最终对决。所有线索汇聚，危机达到顶峰。',
      emotion_tone: '紧迫、绝望',
      guidance: '这是"灵魂暗夜"之后的觉醒时刻。主角获得最后的工具或领悟，准备迎接终极挑战。',
    },
    {
      name: '高潮',
      position: 90,
      description: '主角面对最大挑战，运用一路上学到的一切进行最终对决。',
      emotion_tone: '激烈、巅峰',
      guidance: '高潮必须让主角同时面对外部敌人和内心缺陷。外在冲突和内在成长在此刻合二为一。',
    },
    {
      name: '结局',
      position: 100,
      description: '展示冲突解决后的新世界。主角已经改变，世界也随之不同。',
      emotion_tone: '释然、满足',
      guidance: '与开头的"平凡世界"形成对比，展示主角的内在变化如何改变了外在世界。',
    },
  ],
}

// ============================================================
// 英雄之旅
// ============================================================
const herosJourney: StoryFramework = {
  id: 'hero_journey',
  name: '英雄之旅',
  description: '约瑟夫·坎贝尔提出的经典神话结构，描述英雄从平凡世界出发、经历试炼、获得蜕变并回归的完整旅程。',
  bestFor: ['奇幻', '玄幻', '冒险', '神话', '史诗'],
  beats: [
    {
      name: '平凡世界',
      position: 0,
      description: '英雄在日常生活出场，展示其性格特点和内心缺失。',
      emotion_tone: '平静、暗示',
      guidance: '通过细节暗示英雄的不满足感。平凡世界越真实，后续冒险越有冲击力。',
    },
    {
      name: '冒险召唤',
      position: 8,
      description: '英雄收到来自外部世界的召唤，要求其踏上一段非凡旅程。',
      emotion_tone: '诱惑、恐惧',
      guidance: '召唤可以是信息、事件或人物。它必须足够有吸引力，让英雄（和读者）心动。',
    },
    {
      name: '拒绝召唤',
      position: 15,
      description: '英雄因恐惧、责任或不自信而犹豫，拒绝踏上旅程。',
      emotion_tone: '犹豫、挣扎',
      guidance: '展示英雄的人性弱点。这个犹豫让角色更真实，也为后续的勇气做铺垫。',
    },
    {
      name: '遇见导师',
      position: 20,
      description: '英雄遇到智者或引路人，获得指导、工具或信心。',
      emotion_tone: '启发、温暖',
      guidance: '导师不必是老人——可以是任何人或事物。关键是提供英雄所需的心理或物质支持。',
    },
    {
      name: '跨越第一道门槛',
      position: 25,
      description: '英雄离开舒适区，正式进入特殊世界。从此无法回头。',
      emotion_tone: '紧张、决绝',
      guidance: '设置一个明确的"边界"——物理的或心理的。跨过门槛意味着旧身份的死亡。',
    },
    {
      name: '考验、盟友与敌人',
      position: 35,
      description: '英雄在特殊世界中探索，结识伙伴，辨识敌人，经历初步考验。',
      emotion_tone: '好奇、警惕',
      guidance: '通过小冲突建立世界观规则。盟友和敌人的出现帮助读者理解这个新世界的权力结构。',
    },
    {
      name: '接近深层洞穴',
      position: 45,
      description: '英雄为面对最大恐惧做准备，接近故事的核心危机。',
      emotion_tone: '紧张、预感',
      guidance: '节奏放缓，积蓄力量。英雄可能需要突破最后一道防线，面对内心的终极恐惧。',
    },
    {
      name: '严峻考验',
      position: 50,
      description: '英雄经历"死亡与重生"——面对最大恐惧，旧自我消亡，新自我诞生。',
      emotion_tone: '绝望、重生',
      guidance: '这是故事的灵魂。英雄必须真正"死去"（象征性或字面意义上），才能获得重生。',
    },
    {
      name: '获得奖赏',
      position: 58,
      description: '英雄战胜考验后获得宝物、知识或领悟。',
      emotion_tone: '喜悦、满足',
      guidance: '奖赏应该与英雄的内心需求对应，而不仅仅是外在物品。真正的奖赏是内在的成长。',
    },
    {
      name: '返回之路',
      position: 67,
      description: '英雄带着奖赏踏上归途，但归途并非一帆风顺。',
      emotion_tone: '紧迫、不安',
      guidance: '反派的反扑或新的危机出现，保持故事的紧张感。英雄必须用新获得的力量应对。',
    },
    {
      name: '复活',
      position: 80,
      description: '英雄在返回前经历最后一次生死考验，证明自己的蜕变是真实的。',
      emotion_tone: '极致紧张',
      guidance: '这次考验比"严峻考验"更危险，因为英雄已无退路。这是对整个旅程的终极验证。',
    },
    {
      name: '携万灵药归来',
      position: 100,
      description: '英雄带着从特殊世界获得的东西回到平凡世界，治愈了原来的缺失。',
      emotion_tone: '圆满、升华',
      guidance: '展示英雄的改变如何造福更大的世界。平凡世界因英雄的归来而变得不同。',
    },
  ],
}

// ============================================================
// Save the Cat
// ============================================================
const saveTheCat: StoryFramework = {
  id: 'save_the_cat',
  name: 'Save the Cat',
  description: '布莱克·斯奈德提出的15个节拍的结构模板，精确到页面百分比，是类型小说和商业写作的实用工具。',
  bestFor: ['类型小说', '商业小说', '剧本', '通俗文学'],
  beats: [
    {
      name: '开场画面',
      position: 0,
      description: '展示主角在故事开始时的状态——"之前"的世界。',
      emotion_tone: '定调',
      guidance: '用一两个场景快速建立主角的生活状态和故事基调。让读者立刻知道这是一部什么类型的作品。',
    },
    {
      name: '铺设主题',
      position: 5,
      description: '通过对话或事件暗示故事的核心主题。',
      emotion_tone: '暗示',
      guidance: '不要太直白。让主题自然地从角色互动中浮现，读者在回看时才能恍然大悟。',
    },
    {
      name: '铺设设定',
      position: 10,
      description: '展示主角的世界、能力和缺陷。让读者了解游戏规则。',
      emotion_tone: '展示',
      guidance: '通过行动而非说明来展示。让主角做一件"救猫咪"的事，让读者喜欢上他/她。',
    },
    {
      name: '触发事件',
      position: 10,
      description: '改变一切的事件——主角收到消息、遇到人物或面临抉择。',
      emotion_tone: '转折',
      guidance: '这个事件应该让主角的世界开始动摇。它不一定是主角的行动，但必须打破现状。',
    },
    {
      name: '辩论',
      position: 20,
      description: '主角犹豫是否接受冒险。展示内心的挣扎和外部压力。',
      emotion_tone: '犹豫',
      guidance: '通过对话展示"新道路"的利弊。读者应该理解为什么这个决定如此困难。',
    },
    {
      name: '进入第二幕',
      position: 25,
      description: '主角做出决定，离开旧世界，踏上新旅程。',
      emotion_tone: '决断',
      guidance: '这是明确的转折点。主角必须主动选择，而非被动接受。从此故事进入新阶段。',
    },
    {
      name: 'B故事',
      position: 22,
      description: '引入副线——通常是爱情线或友情线，承载故事的情感核心。',
      emotion_tone: '温暖',
      guidance: 'B故事不是干扰主线，而是主题的载体。它让故事有情感深度。',
    },
    {
      name: '趣味与游戏',
      position: 30,
      description: '兑现类型承诺——读者买这本书就是为了看这些内容。',
      emotion_tone: '娱乐',
      guidance: '这是"预告片"部分。奇幻小说展示魔法，推理小说展示推理过程。让读者享受类型的乐趣。',
    },
    {
      name: '中点',
      position: 50,
      description: '虚假的胜利或虚假的失败。主角以为赢了（或输了），但真相并非如此。',
      emotion_tone: '反转',
      guidance: '中点将故事一分为二。前半部分是被动反应，后半部分是主动出击。主角的心态必须在此转变。',
    },
    {
      name: '坏人逼近',
      position: 55,
      description: '外部压力增大，内部团队分裂。主角的处境越来越糟。',
      emotion_tone: '压迫',
      guidance: '反派开始主动出击。主角的盟友可能背叛或离开。一切都在走向失控。',
    },
    {
      name: '失去一切',
      position: 75,
      description: '主角跌入谷底。失去导师、朋友、工具或信心。',
      emotion_tone: '绝望',
      guidance: '这是"灵魂暗夜"。主角必须面对自己最大的恐惧和缺陷。只有承认失败，才能获得真正的力量。',
    },
    {
      name: '灵魂暗夜',
      position: 75,
      description: '主角在最低谷反思一切，找到新的领悟和方向。',
      emotion_tone: '沉思',
      guidance: '从绝望中诞生的领悟必须与主题直接相关。主角终于明白自己真正需要的是什么。',
    },
    {
      name: '进入第三幕',
      position: 80,
      description: '主角带着新的领悟和决心，发起最后的反击。',
      emotion_tone: '觉醒',
      guidance: 'A故事和B故事在此交汇。主角用从B故事中学到的教训解决A故事的终极问题。',
    },
    {
      name: '终局',
      position: 85,
      description: '主角运用一切所学，面对最终挑战。所有线索汇聚。',
      emotion_tone: '高潮',
      guidance: '高潮必须同时解决外部冲突和内部成长。主角必须主动、聪明、有代价地赢得胜利。',
    },
    {
      name: '终场画面',
      position: 100,
      description: '展示"之后"的世界。与开场画面形成对比，证明主角的改变。',
      emotion_tone: '收束',
      guidance: '终场应该呼应开场，但展示出变化。如果开场是孤独的，终场可能是被爱包围的。',
    },
  ],
}

// ============================================================
// 故事圆环 (Dan Harmon's Story Circle)
// ============================================================
const storyCircle: StoryFramework = {
  id: 'five_act',
  name: '故事圆环',
  description: '丹·哈蒙基于坎贝尔英雄之旅简化的8步结构，强调角色的欲望与变化，非常适合网络连载和短篇故事。',
  bestFor: ['网络连载', '短篇', '单元剧', '轻小说'],
  beats: [
    {
      name: '你（处于舒适区）',
      position: 0,
      description: '主角在舒适区中，生活虽然可能不完美，但至少是可预知的。',
      emotion_tone: '平静',
      guidance: '快速建立主角的日常状态。不需要太多铺垫，直接让读者了解主角是谁、想要什么。',
    },
    {
      name: '需要（但有所渴望）',
      position: 12,
      description: '主角感到某种渴望或缺失，但还不清楚自己真正需要什么。',
      emotion_tone: '渴望',
      guidance: '区分"想要"和"需要"——主角以为自己想要的，往往不是真正需要的。这种错位是故事的驱动力。',
    },
    {
      name: '出发（进入未知）',
      position: 25,
      description: '主角被迫或主动离开舒适区，进入陌生领域。',
      emotion_tone: '紧张',
      guidance: '跨越门槛的瞬间。舒适区的消失让主角（和读者）感到不安，但也充满好奇。',
    },
    {
      name: '寻找（适应新规则）',
      position: 37,
      description: '主角在陌生世界中摸索，经历试错，学习新规则。',
      emotion_tone: '困惑、学习',
      guidance: '展示主角的适应过程。每次失败都应该教会主角（和读者）一些关于这个世界或自己的东西。',
    },
    {
      name: '找到（获得想要的东西）',
      position: 50,
      description: '主角找到了自己想要的东西，但代价远超预期。',
      emotion_tone: '短暂喜悦',
      guidance: '这个"得到"应该带有讽刺意味——主角得到了想要的东西，却发现这不是真正需要的。',
    },
    {
      name: '代价（付出沉重代价）',
      position: 62,
      description: '主角为得到的东西付出代价，失去了一些重要的东西。',
      emotion_tone: '痛苦',
      guidance: '代价必须足够沉重，让主角质疑自己的选择。这是角色成长的催化剂。',
    },
    {
      name: '回归（回到起点）',
      position: 75,
      description: '主角带着伤痕和领悟回到起点，但已经不再是原来的自己。',
      emotion_tone: '沉淀',
      guidance: '回归不是简单的倒退。主角带着新的视角看待旧世界，发现以前看不到的东西。',
    },
    {
      name: '改变（完成蜕变）',
      position: 100,
      description: '主角最终完成了从"想要"到"需要"的转变，获得了真正的成长。',
      emotion_tone: '升华',
      guidance: '变化必须体现在行动上，而不仅仅是想法。主角做出了以前不会做的选择，证明蜕变是真实的。',
    },
  ],
}

// ============================================================
// 起承转合
// ============================================================
const kishotenketsu: StoryFramework = {
  id: 'kishotenketsu',
  name: '起承转合',
  description: '源自东亚传统的四段式叙事结构，强调"转"的意外性而非冲突驱动，适合注重氛围和意境的作品。',
  bestFor: ['东方叙事传统', '文学小说', '散文', '日常系', '治愈系'],
  beats: [
    {
      name: '起（引入）',
      position: 0,
      description: '介绍角色、背景和基本情境。建立故事的世界和基调。',
      emotion_tone: '宁静、铺陈',
      guidance: '起不需要冲突。用细腻的描写和氛围营造让读者沉浸。可以引入一个看似平淡但意味深长的细节。',
    },
    {
      name: '承（发展）',
      position: 33,
      description: '在引入的基础上深化。展示角色的日常生活、关系和内心世界。',
      emotion_tone: '温和、深入',
      guidance: '承是"起"的自然延伸。通过日常细节的积累，让读者对角色产生深厚的感情。看似无关的细节可能在"转"中变得重要。',
    },
    {
      name: '转（转折）',
      position: 66,
      description: '引入意外元素或视角转换，打破读者对故事的预期。',
      emotion_tone: '意外、震撼',
      guidance: '转不需要是对抗性的冲突。它可以是一个新视角、一个意外发现、或一个看似无关的事件突然变得有意义。关键是"意外感"。',
    },
    {
      name: '合（收束）',
      position: 100,
      description: '将起、承、转的元素融合在一起，给出一个和谐（但不一定是圆满）的结局。',
      emotion_tone: '余韵、回味',
      guidance: '合不是简单的总结，而是让前面的所有元素产生化学反应。好的"合"会让读者回想起"起"和"承"中的细节，发现新的意义。',
    },
  ],
}

// ============================================================
// 七点结构
// ============================================================
const sevenPoint: StoryFramework = {
  id: 'seven_point',
  name: '七点结构',
  description: '丹·威尔斯提出的简洁高效的结构方法，从结局开始反向规划，确保故事的每个转折都有因果逻辑。',
  bestFor: ['通用', '推理', '悬疑', '中短篇'],
  beats: [
    {
      name: '钩子（Hook）',
      position: 0,
      description: '展示主角的起始状态——与结局完全相反的状态。建立反差。',
      emotion_tone: '对比',
      guidance: '钩子要展示主角在最差（或最好）的状态。与结局形成镜像对比，让读者感受到变化的幅度。',
    },
    {
      name: '情节转折一（Plot Turn 1）',
      position: 25,
      description: '引入冲突，推动主角离开舒适区。这是"推动力"。',
      emotion_tone: '推动',
      guidance: '这个转折应该让主角无法继续待在舒适区。它引入了核心冲突，迫使主角行动。',
    },
    {
      name: '夹击一（Pinch 1）',
      position: 37,
      description: '施加压力，反派（或 opposing force）主动出击，展示威胁的严重性。',
      emotion_tone: '压迫',
      guidance: '这是"施加压力"的时刻。让主角感受到威胁的真实性和紧迫性，迫使主角做出反应。',
    },
    {
      name: '中点（Midpoint）',
      position: 50,
      description: '主角从被动转为主动。从"逃"变为"追"。',
      emotion_tone: '觉醒',
      guidance: '中点是角色弧的关键转折。主角不再对事件做出反应，而是开始主动追求目标。心态发生质变。',
    },
    {
      name: '夹击二（Pinch 2）',
      position: 62,
      description: '更大的压力。主角看似即将失败，一切似乎都完了。',
      emotion_tone: '绝望',
      guidance: '比夹击一更严重。主角失去重要的东西——盟友、资源或信心。这是"灵魂暗夜"的前奏。',
    },
    {
      name: '情节转折二（Plot Turn 2）',
      position: 75,
      description: '主角获得最后的钥匙（知识、工具或领悟），准备迎接最终对决。',
      emotion_tone: '顿悟',
      guidance: '这个转折应该让主角获得解决终极问题所需的一切。它将主角推向高潮。',
    },
    {
      name: '解决（Resolution）',
      position: 100,
      description: '主角运用所学，解决核心冲突。展示与钩子形成对比的新状态。',
      emotion_tone: '收束',
      guidance: '解决必须由主角主动完成，不能靠运气或外力。展示主角如何用一路上学到的东西赢得胜利。',
    },
  ],
}

// ============================================================
// 导出所有框架
// ============================================================
export const FRAMEWORKS: Record<StructureFramework, StoryFramework> = {
  three_act: threeAct,
  hero_journey: herosJourney,
  save_the_cat: saveTheCat,
  five_act: storyCircle,
  kishotenketsu,
  seven_point: sevenPoint,
  custom: {
    id: 'custom',
    name: '自定义',
    description: '自由定义你的故事结构，不受任何框架限制。',
    bestFor: ['实验性写作', '非线性叙事', '混合类型'],
    beats: [],
  },
}

/** 获取框架列表 */
export function getFrameworkList(): StoryFramework[] {
  return Object.values(FRAMEWORKS)
}

/** 根据 ID 获取框架 */
export function getFramework(id: StructureFramework): StoryFramework {
  return FRAMEWORKS[id]
}
