// ============================================================
// Novel Forge - Type Definitions
// ============================================================

// ---- Enums / Union Types ----

export type Genre =
  | "fantasy"
  | "scifi"
  | "romance"
  | "mystery"
  | "thriller"
  | "horror"
  | "literary"
  | "historical"
  | "adventure"
  | "comedy"
  | "drama"
  | "urban"
  | "other";

export const GENRE_LABELS: Record<Genre, string> = {
  fantasy: "奇幻",
  scifi: "科幻",
  romance: "言情",
  mystery: "悬疑",
  thriller: "惊悚",
  horror: "恐怖",
  literary: "文学",
  historical: "历史",
  adventure: "冒险",
  comedy: "喜剧",
  drama: "剧情",
  urban: "都市",
  other: "其他",
};

export type ChapterStatus =
  | "outline"
  | "draft"
  | "first_draft"
  | "polished"
  | "final";

export const CHAPTER_STATUS_LABELS: Record<ChapterStatus, string> = {
  outline: "大纲",
  draft: "草稿",
  first_draft: "初稿",
  polished: "润色",
  final: "定稿",
};

export type CharacterRole =
  | "protagonist"
  | "antagonist"
  | "supporting"
  | "minor";

export const CHARACTER_ROLE_LABELS: Record<CharacterRole, string> = {
  protagonist: "主角",
  antagonist: "反派",
  supporting: "配角",
  minor: "龙套",
};

export type ArcType = "positive" | "flat" | "negative";

export const ARC_TYPE_LABELS: Record<ArcType, string> = {
  positive: "正向成长",
  flat: "平稳",
  negative: "堕落",
};

export type WorldCategory =
  | "geography"
  | "history"
  | "politics"
  | "culture"
  | "power_system"
  | "technology"
  | "economy"
  | "race"
  | "other";

export const WORLD_CATEGORY_LABELS: Record<WorldCategory, string> = {
  geography: "地理",
  history: "历史",
  politics: "政治",
  culture: "文化",
  power_system: "力量体系",
  technology: "科技",
  economy: "经济",
  race: "种族",
  other: "其他",
};

export type StructureFramework =
  | "three_act"
  | "hero_journey"
  | "save_the_cat"
  | "seven_point"
  | "five_act"
  | "kishotenketsu"
  | "custom";

export type RewriteMode = "expand" | "condense" | "describe" | "tone";

export const REWRITE_MODE_LABELS: Record<RewriteMode, string> = {
  expand: "扩写",
  condense: "精简",
  describe: "加强描写",
  tone: "调整语气",
};

// ---- Core Models (snake_case to match Supabase columns) ----

export interface Project {
  id: string;
  user_id: string;
  title: string;
  genre: Genre;
  description: string | null;
  synopsis: string | null;
  structure_framework: StructureFramework | null;
  settings: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  word_count: number;
}

export interface Character {
  id: string;
  project_id: string;
  name: string;
  role: CharacterRole;
  appearance: string | null;
  background: string | null;
  // Core wound blueprint
  core_wound: string | null;
  lie: string | null;
  want: string | null;
  need: string | null;
  fear: string | null;
  armor: string | null;
  // Personality & voice
  personality_traits: string[];
  speech_style: string | null;
  body_language: string | null;
  decision_style: string | null;
  // Arc
  arc_type: ArcType;
  arc_description: string | null;
  turning_points: string[];
  created_at: string;
  updated_at: string;
}

export interface WorldSetting {
  id: string;
  project_id: string;
  name: string;
  category: WorldCategory;
  parent_id: string | null;
  content: string | null;
  rules: string[];
  created_at: string;
  updated_at: string;
}

export interface Volume {
  id: string;
  project_id: string;
  title: string;
  sort_order: number;
  created_at: string;
}

export interface Chapter {
  id: string;
  project_id: string;
  volume_id: string;
  title: string;
  content: string;
  status: ChapterStatus;
  sort_order: number;
  word_count: number;
  created_at: string;
  updated_at: string;
}

export interface Beat {
  id: string;
  project_id: string;
  structure_id: string;
  name: string;
  position_pct: number;
  description: string | null;
  characters: string[];
  emotion_tone: string | null;
  sort_order: number;
}

export interface StoryStructure {
  id: string;
  project_id: string;
  name: string;
  framework: StructureFramework;
  beats: Beat[];
  created_at: string;
  updated_at: string;
}

export interface SnowflakeStep {
  step: number;
  one_liner: string | null;
  paragraph: string | null;
  character_summaries: string | null;
  act_outlines: string | null;
  character_details: string | null;
  chapter_outlines: string | null;
  scene_list: string | null;
}

// ---- AI Types ----

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}
