// ============================================================
// Novel Forge - AI Prompt Templates
// ============================================================

import type { Character, WorldSetting, Genre } from "@/lib/types";
import { GENRE_LABELS } from "@/lib/types";

/**
 * Build a system prompt for writing continuation.
 */
export function buildContinuePrompt(context: {
  title: string;
  genre: Genre;
  synopsis: string;
  chapterTitle: string;
  existingContent: string;
}) {
  return `你是一位经验丰富的中文小说作家。请根据以下信息续写小说内容。

作品标题：${context.title}
类型：${GENRE_LABELS[context.genre]}
简介：${context.synopsis}
当前章节：${context.chapterTitle}

已有内容：
---
${context.existingContent}
---

请自然地续写接下来的内容（约200-500字），保持与已有内容一致的文风、语气和叙事视角。不要重复已有内容，直接从断点处继续。只输出续写的文本，不要添加任何解释或标注。`;
}

/**
 * Build a system prompt for text rewriting.
 */
export function buildRewritePrompt(context: {
  text: string;
  mode: "expand" | "condense" | "describe" | "tone";
  genre: Genre;
}) {
  const modeInstructions: Record<string, string> = {
    expand: "请将以下文本扩写，增加更多细节、描写和情感层次，使内容更加丰富饱满（扩写至原文的2-3倍）。",
    condense: "请精简以下文本，去除冗余内容，保留核心情节和信息，使表达更加简洁有力（精简至原文的1/2-2/3）。",
    describe: "请加强以下文本中的描写，包括环境描写、心理描写、动作描写等，使场景更加生动形象。",
    tone: "请调整以下文本的语气和风格，使其更加符合小说的叙事风格，注意情感张力和文学性。",
  };

  return `你是一位经验丰富的中文小说编辑。${modeInstructions[context.mode]}

小说类型：${GENRE_LABELS[context.genre]}

原文：
---
${context.text}
---

请直接输出改写后的文本，不要添加任何解释或标注。`;
}

/**
 * Build a system prompt for writing chat.
 */
export function buildChatPrompt(context: {
  title: string;
  genre: Genre;
  synopsis: string;
  chapterTitle: string;
  chapterContent: string;
  characters: Pick<Character, "name" | "role" | "background">[];
  worldSettings: Pick<WorldSetting, "name" | "category" | "content">[];
}) {
  const charInfo = context.characters
    .map((c) => `- ${c.name}（${c.role}）：${(c.background || "").slice(0, 100)}`)
    .join("\n");

  const worldInfo = context.worldSettings
    .map((w) => `- ${w.name}（${w.category}）：${(w.content || "").slice(0, 100)}`)
    .join("\n");

  return `你是一位专业的小说创作助手，正在帮助作者创作一部中文小说。

作品信息：
- 标题：${context.title}
- 类型：${GENRE_LABELS[context.genre]}
- 简介：${context.synopsis}

当前章节：${context.chapterTitle}
章节内容摘要：${context.chapterContent.slice(0, 500)}

主要角色：
${charInfo || "暂无角色信息"}

世界观设定：
${worldInfo || "暂无世界观信息"}

请根据以上信息，回答作者的问题或提供创作建议。回答要具体、有建设性，并且与作品的世界观和角色设定保持一致。`;
}

/**
 * Build a prompt for generating a character field.
 */
export function buildCharacterGeneratePrompt(context: {
  field: string;
  characterData: Partial<Character>;
  genre: Genre;
  synopsis: string;
}) {
  const fieldMap: Record<string, string> = {
    core_wound: "核心创伤（角色内心最深的伤痛）",
    lie: "相信的谎言（角色因为创伤而相信的错误信念）",
    want: "渴望（角色表面上追求的目标）",
    need: "需求（角色真正需要的东西）",
    fear: "恐惧（角色最害怕的事情）",
    armor: "铠甲（角色用来保护自己的外在表现）",
    personality_traits: "性格特征（以标签列表形式）",
    speech_style: "说话风格",
    body_language: "肢体语言习惯",
    decision_style: "决策方式",
    arc_description: "成长弧线描述",
    turning_points: "关键转折点（以列表形式）",
    appearance: "外貌描述",
    background: "背景故事",
  };

  return `你是一位专业的小说角色设计师。请为以下角色生成"${fieldMap[context.field] || context.field}"。

小说类型：${GENRE_LABELS[context.genre]}
作品简介：${context.synopsis}

角色信息：
- 名字：${context.characterData.name || "未命名"}
- 角色定位：${context.characterData.role || "未指定"}
- 外貌：${context.characterData.appearance || "未设定"}
- 背景：${context.characterData.background || "未设定"}
- 核心创伤：${context.characterData.core_wound || "未设定"}
- 相信的谎言：${context.characterData.lie || "未设定"}
- 渴望：${context.characterData.want || "未设定"}
- 需求：${context.characterData.need || "未设定"}
- 恐惧：${context.characterData.fear || "未设定"}
- 铠甲：${context.characterData.armor || "未设定"}

请生成合理、有深度的内容，与已有信息保持一致。只输出生成的内容，不要添加解释。`;
}

/**
 * Build a prompt for generating a world setting.
 */
export function buildWorldGeneratePrompt(context: {
  category: string;
  name: string;
  genre: Genre;
  synopsis: string;
  existingSettings: Pick<WorldSetting, "name" | "content">[];
}) {
  const existingInfo = context.existingSettings
    .map((s) => `- ${s.name}：${(s.content || "").slice(0, 100)}`)
    .join("\n");

  return `你是一位专业的世界观设计师。请为小说生成"${context.name}"的世界设定。

小说类型：${GENRE_LABELS[context.genre]}
作品简介：${context.synopsis}
设定类别：${context.category}

已有世界观设定：
${existingInfo || "暂无"}

请生成详细、有深度的世界观设定内容，包括背景描述、运作规则等。确保与已有设定不冲突。只输出设定内容，不要添加解释。`;
}

/**
 * Build a prompt for consistency checking.
 */
export function buildConsistencyPrompt(context: {
  settingName: string;
  settingContent: string;
  existingSettings: WorldSetting[];
  synopsis: string;
}) {
  const existingInfo = context.existingSettings
    .filter((s) => s.name !== context.settingName)
    .map((s) => `- 【${s.name}】（${s.category}）：${(s.content || "").slice(0, 200)}`)
    .join("\n");

  return `你是一位专业的小说编辑，专门负责检查世界观设定的一致性。

作品简介：${context.synopsis}

当前设定：
【${context.settingName}】
${context.settingContent}

已有的其他设定：
${existingInfo || "暂无"}

请检查当前设定与已有设定之间是否存在矛盾或不一致之处。如果发现矛盾，请指出具体问题并给出修改建议。如果没有矛盾，请说明当前设定与已有设定是协调一致的。

请用以下格式回复：
1. 一致性评估（一致/存在矛盾）
2. 具体分析
3. 修改建议（如有矛盾）`;
}
