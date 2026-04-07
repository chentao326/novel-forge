-- ============================================================
-- Novel Forge - 初始数据库架构
-- Migration: 001_initial_schema.sql
-- ============================================================

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 用户表
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 项目/小说表
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  genre TEXT NOT NULL DEFAULT 'other',
  description TEXT,
  structure_framework TEXT,
  synopsis TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 卷表
-- ============================================================
CREATE TABLE IF NOT EXISTS volumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 章节表
-- ============================================================
CREATE TABLE IF NOT EXISTS chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  volume_id UUID REFERENCES volumes(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT '',
  content TEXT,
  status TEXT NOT NULL DEFAULT 'outline' CHECK (status IN ('outline', 'draft', 'revised', 'final')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  word_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 角色表
-- ============================================================
CREATE TABLE IF NOT EXISTS characters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'supporting' CHECK (role IN ('protagonist', 'antagonist', 'supporting', 'minor')),
  profile JSONB DEFAULT '{"appearance": null, "personality": null, "background": null}'::jsonb,
  core_wound TEXT,
  lie TEXT,
  want TEXT,
  need TEXT,
  fear TEXT,
  armor TEXT,
  arc_type TEXT NOT NULL DEFAULT 'positive' CHECK (arc_type IN ('positive', 'flat', 'negative')),
  voice_style TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 世界观设定表
-- ============================================================
CREATE TABLE IF NOT EXISTS world_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES world_settings(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'other' CHECK (category IN ('geography', 'history', 'politics', 'culture', 'power_system', 'technology', 'economy', 'species', 'other')),
  name TEXT NOT NULL DEFAULT '',
  content JSONB DEFAULT '{}'::jsonb,
  rules TEXT[] DEFAULT '{}'::text[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 故事结构表
-- ============================================================
CREATE TABLE IF NOT EXISTS story_structures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  framework TEXT NOT NULL DEFAULT 'three_act' CHECK (framework IN ('three_act', 'heros_journey', 'save_the_cat', 'story_circle', 'kishotenketsu', 'seven_point')),
  beats JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 雪花法数据表
-- ============================================================
CREATE TABLE IF NOT EXISTS snowflake_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
  step_data JSONB DEFAULT '{
    "step": 1,
    "one_liner": null,
    "paragraph": null,
    "character_summaries": null,
    "act_outlines": null,
    "character_details": null,
    "chapter_outlines": null,
    "scene_list": null
  }'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 伏笔表
-- ============================================================
CREATE TABLE IF NOT EXISTS foreshadowings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL,
  description TEXT NOT NULL DEFAULT '',
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 时间线事件表
-- ============================================================
CREATE TABLE IF NOT EXISTS timeline_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  description TEXT,
  date_label TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 索引
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_volumes_project_id ON volumes(project_id);
CREATE INDEX IF NOT EXISTS idx_chapters_project_id ON chapters(project_id);
CREATE INDEX IF NOT EXISTS idx_chapters_volume_id ON chapters(volume_id);
CREATE INDEX IF NOT EXISTS idx_characters_project_id ON characters(project_id);
CREATE INDEX IF NOT EXISTS idx_world_settings_project_id ON world_settings(project_id);
CREATE INDEX IF NOT EXISTS idx_world_settings_parent_id ON world_settings(parent_id);
CREATE INDEX IF NOT EXISTS idx_story_structures_project_id ON story_structures(project_id);
CREATE INDEX IF NOT EXISTS idx_snowflake_data_project_id ON snowflake_data(project_id);
CREATE INDEX IF NOT EXISTS idx_foreshadowings_project_id ON foreshadowings(project_id);
CREATE INDEX IF NOT EXISTS idx_foreshadowings_chapter_id ON foreshadowings(chapter_id);
CREATE INDEX IF NOT EXISTS idx_timeline_events_project_id ON timeline_events(project_id);

-- ============================================================
-- 启用 RLS (Row Level Security)
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE volumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE world_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE snowflake_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE foreshadowings ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS 策略 - 用户表
-- ============================================================
CREATE POLICY "用户可以查看自己的信息" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "用户可以更新自己的信息" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "用户可以插入自己的信息" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================
-- RLS 策略 - 项目表
-- ============================================================
CREATE POLICY "用户可以查看自己的项目" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户可以创建项目" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的项目" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "用户可以删除自己的项目" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- RLS 策略 - 卷表（通过项目关联）
-- ============================================================
CREATE POLICY "用户可以查看自己项目的卷" ON volumes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = volumes.project_id AND projects.user_id = auth.uid())
  );

CREATE POLICY "用户可以创建自己项目的卷" ON volumes
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = volumes.project_id AND projects.user_id = auth.uid())
  );

CREATE POLICY "用户可以更新自己项目的卷" ON volumes
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = volumes.project_id AND projects.user_id = auth.uid())
  );

CREATE POLICY "用户可以删除自己项目的卷" ON volumes
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = volumes.project_id AND projects.user_id = auth.uid())
  );

-- ============================================================
-- RLS 策略 - 章节表（通过项目关联）
-- ============================================================
CREATE POLICY "用户可以查看自己项目的章节" ON chapters
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = chapters.project_id AND projects.user_id = auth.uid())
  );

CREATE POLICY "用户可以创建自己项目的章节" ON chapters
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = chapters.project_id AND projects.user_id = auth.uid())
  );

CREATE POLICY "用户可以更新自己项目的章节" ON chapters
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = chapters.project_id AND projects.user_id = auth.uid())
  );

CREATE POLICY "用户可以删除自己项目的章节" ON chapters
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = chapters.project_id AND projects.user_id = auth.uid())
  );

-- ============================================================
-- RLS 策略 - 角色表（通过项目关联）
-- ============================================================
CREATE POLICY "用户可以查看自己项目的角色" ON characters
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = characters.project_id AND projects.user_id = auth.uid())
  );

CREATE POLICY "用户可以创建自己项目的角色" ON characters
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = characters.project_id AND projects.user_id = auth.uid())
  );

CREATE POLICY "用户可以更新自己项目的角色" ON characters
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = characters.project_id AND projects.user_id = auth.uid())
  );

CREATE POLICY "用户可以删除自己项目的角色" ON characters
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = characters.project_id AND projects.user_id = auth.uid())
  );

-- ============================================================
-- RLS 策略 - 世界观设定表（通过项目关联）
-- ============================================================
CREATE POLICY "用户可以查看自己项目的世界观设定" ON world_settings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = world_settings.project_id AND projects.user_id = auth.uid())
  );

CREATE POLICY "用户可以创建自己项目的世界观设定" ON world_settings
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = world_settings.project_id AND projects.user_id = auth.uid())
  );

CREATE POLICY "用户可以更新自己项目的世界观设定" ON world_settings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = world_settings.project_id AND projects.user_id = auth.uid())
  );

CREATE POLICY "用户可以删除自己项目的世界观设定" ON world_settings
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = world_settings.project_id AND projects.user_id = auth.uid())
  );

-- ============================================================
-- RLS 策略 - 故事结构表（通过项目关联）
-- ============================================================
CREATE POLICY "用户可以查看自己项目的故事结构" ON story_structures
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = story_structures.project_id AND projects.user_id = auth.uid())
  );

CREATE POLICY "用户可以创建自己项目的故事结构" ON story_structures
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = story_structures.project_id AND projects.user_id = auth.uid())
  );

CREATE POLICY "用户可以更新自己项目的故事结构" ON story_structures
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = story_structures.project_id AND projects.user_id = auth.uid())
  );

CREATE POLICY "用户可以删除自己项目的故事结构" ON story_structures
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = story_structures.project_id AND projects.user_id = auth.uid())
  );

-- ============================================================
-- RLS 策略 - 雪花法数据表（通过项目关联）
-- ============================================================
CREATE POLICY "用户可以查看自己项目的雪花法数据" ON snowflake_data
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = snowflake_data.project_id AND projects.user_id = auth.uid())
  );

CREATE POLICY "用户可以创建自己项目的雪花法数据" ON snowflake_data
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = snowflake_data.project_id AND projects.user_id = auth.uid())
  );

CREATE POLICY "用户可以更新自己项目的雪花法数据" ON snowflake_data
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = snowflake_data.project_id AND projects.user_id = auth.uid())
  );

CREATE POLICY "用户可以删除自己项目的雪花法数据" ON snowflake_data
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = snowflake_data.project_id AND projects.user_id = auth.uid())
  );

-- ============================================================
-- RLS 策略 - 伏笔表（通过项目关联）
-- ============================================================
CREATE POLICY "用户可以查看自己项目的伏笔" ON foreshadowings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = foreshadowings.project_id AND projects.user_id = auth.uid())
  );

CREATE POLICY "用户可以创建自己项目的伏笔" ON foreshadowings
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = foreshadowings.project_id AND projects.user_id = auth.uid())
  );

CREATE POLICY "用户可以更新自己项目的伏笔" ON foreshadowings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = foreshadowings.project_id AND projects.user_id = auth.uid())
  );

CREATE POLICY "用户可以删除自己项目的伏笔" ON foreshadowings
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = foreshadowings.project_id AND projects.user_id = auth.uid())
  );

-- ============================================================
-- RLS 策略 - 时间线事件表（通过项目关联）
-- ============================================================
CREATE POLICY "用户可以查看自己项目的时间线事件" ON timeline_events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = timeline_events.project_id AND projects.user_id = auth.uid())
  );

CREATE POLICY "用户可以创建自己项目的时间线事件" ON timeline_events
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = timeline_events.project_id AND projects.user_id = auth.uid())
  );

CREATE POLICY "用户可以更新自己项目的时间线事件" ON timeline_events
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = timeline_events.project_id AND projects.user_id = auth.uid())
  );

CREATE POLICY "用户可以删除自己项目的时间线事件" ON timeline_events
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = timeline_events.project_id AND projects.user_id = auth.uid())
  );

-- ============================================================
-- updated_at 自动更新触发器
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chapters_updated_at
  BEFORE UPDATE ON chapters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_characters_updated_at
  BEFORE UPDATE ON characters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_world_settings_updated_at
  BEFORE UPDATE ON world_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_snowflake_data_updated_at
  BEFORE UPDATE ON snowflake_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
