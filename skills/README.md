# Novel Forge 技能体系

本目录包含 Novel Forge 所有功能技能的详细文档。每个技能是一个独立的功能模块，拥有自己的数据模型、AI 提示词、API 端点和前端组件。

## 技能总览

| 技能 | 目录 | 说明 | 依赖 |
|------|------|------|------|
| 🧠 [灵感激发](./brainstorm/skill.md) | `brainstorm/` | AI 生成故事概念 | ai-models, genre-knowledge |
| 📐 [结构引擎](./story-structure/skill.md) | `story-structure/` | 7 种经典叙事框架 | ai-models |
| ❄️ [雪花法规划](./snowflake/skill.md) | `snowflake/` | 7 步渐进式大纲 | ai-models, story-structure, character |
| 🌍 [世界观构建](./worldbuilding/skill.md) | `worldbuilding/` | 三层模型 + 力量体系 + 时间线 | ai-models |
| 👥 [角色塑造](./character/skill.md) | `character/` | 档案 + 关系图谱 + 弧线 + 访谈 | ai-models, worldbuilding |
| ✍️ [智能写作](./writing/skill.md) | `writing/` | TipTap 编辑器 + AI 续写/改写 | ai-models, character, worldbuilding, export |
| 📊 [写作分析](./analysis/skill.md) | `analysis/` | 风格/节奏/伏笔/一致性 | ai-models, character, worldbuilding |
| 📚 [体裁知识库](./genre-knowledge/skill.md) | `genre-knowledge/` | 6 大体裁 63 个桥段 | ai-models |
| 📦 [多格式导出](./export/skill.md) | `export/` | TXT/Markdown/HTML/EPUB | — |
| 🤖 [AI 模型管理](./ai-models/skill.md) | `ai-models/` | 多模型路由与配置 | — |

## 技能依赖关系

```
ai-models (基础层)
  ├── brainstorm ──── genre-knowledge
  ├── story-structure
  │     └── snowflake ──── character ──── worldbuilding
  ├── writing ──── character, worldbuilding, export
  ├── analysis ──── character, worldbuilding
  └── genre-knowledge

export (独立)
```

## 新增技能指南

要为 Novel Forge 添加新技能，请遵循以下步骤：

1. **创建目录**：在 `skills/` 下新建技能目录，如 `skills/my-skill/`
2. **编写文档**：创建 `skill.md`，包含以下章节：
   - 功能描述
   - 输入/输出参数
   - AI 任务类型（如需）
   - API 端点（如需）
   - 前端组件路径
   - 数据模型
   - 依赖关系
3. **实现代码**：在 `src/` 下对应位置创建组件、API 路由、Store 等
4. **注册路由**：在 `src/app/(app)/` 下添加页面路由
5. **更新导航**：在 `src/components/layout/app-sidebar.tsx` 中添加导航项
6. **更新本文档**：在上方表格中添加新技能条目
