# Novel Forge 技能体系

本目录包含 Novel Forge 所有功能技能的详细文档。每个技能是一个独立的功能模块，拥有自己的数据模型、AI 提示词、API 端点和前端组件。

## 设计理念

> **构思大于正文** — Novel Forge 的核心理念是帮助作者「想清楚」，而非简单地「帮写」。

技能体系围绕小说创作的完整流程组织，从灵感到大纲，从设定到正文，从写作到分析，形成闭环。

## 技能总览

### 构思层（Conception）— 帮你想

| 技能 | 目录 | 说明 | 依赖 |
|------|------|------|------|
| 🧠 [灵感激发](./brainstorm/skill.md) | `brainstorm/` | 输入关键词/题材/情绪，AI 生成 3-5 个故事概念 | ai-models, genre-knowledge |
| 📐 [结构引擎](./story-structure/skill.md) | `story-structure/` | 7 种经典叙事框架选择与节拍生成 | ai-models |
| ❄️ [雪花法规划](./snowflake/skill.md) | `snowflake/` | 7 步渐进式大纲（一句话 → 场景清单） | ai-models, story-structure, character |
| 📚 [体裁知识库](./genre-knowledge/skill.md) | `genre-knowledge/` | 6 大体裁 63 个桥段 + 爆款拆解 + 情感曲线 | ai-models |

### 设定层（Setting）— 帮你建

| 技能 | 目录 | 说明 | 依赖 |
|------|------|------|------|
| 🌍 [世界观构建](./worldbuilding/skill.md) | `worldbuilding/` | 三层模型 + 力量体系 + 时间线 + 一致性检测 | ai-models |
| 👥 [角色塑造](./character/skill.md) | `character/` | 档案 + 核心创伤蓝图 + 关系图谱 + 弧线 + AI 访谈 | ai-models, worldbuilding |

### 写作层（Writing）— 帮你写

| 技能 | 目录 | 说明 | 依赖 |
|------|------|------|------|
| ✍️ [智能写作](./writing/skill.md) | `writing/` | TipTap 编辑器 + AI 续写/改写 + 章节管理 + Zen 模式 | ai-models, character, worldbuilding, export |

### 分析层（Analysis）— 帮你看

| 技能 | 目录 | 说明 | 依赖 |
|------|------|------|------|
| 📊 [写作分析](./analysis/skill.md) | `analysis/` | 风格/节奏/伏笔/一致性 四维度分析 | ai-models, character, worldbuilding |

### 基础设施（Infrastructure）

| 技能 | 目录 | 说明 | 依赖 |
|------|------|------|------|
| 🤖 [AI 模型管理](./ai-models/skill.md) | `ai-models/` | 多模型路由（DeepSeek/Qwen/OpenAI/Anthropic）+ 配置 | — |
| 📦 [多格式导出](./export/skill.md) | `export/` | TXT / Markdown / HTML / EPUB 四种格式 | — |

## 创作工作流

技能体系按照小说创作的自然流程组织，作者可以按以下路径使用：

```
灵感激发 → 结构引擎 → 雪花法规划
     ↓           ↓           ↓
体裁知识库   世界观构建   角色塑造
     ↓           ↓           ↓
     └─────────→ 智能写作 ←─┘
                   ↓
              写作分析
                   ↓
              多格式导出
```

## 技能依赖关系

```
ai-models (基础层 — 所有 AI 技能的底层支撑)
  │
  ├── brainstorm ────────── genre-knowledge
  │
  ├── story-structure
  │     └── snowflake ────── character ────── worldbuilding
  │
  ├── writing ────────────── character, worldbuilding, export
  │
  ├── analysis ───────────── character, worldbuilding
  │
  └── genre-knowledge (爆款拆解、情感曲线)

export (独立 — 无 AI 依赖)
```

## 技能文档规范

每个 `skill.md` 应包含以下章节：

| 章节 | 说明 | 必需 |
|------|------|------|
| 功能描述 | 技能的核心能力概述 | ✅ |
| 输入/输出 | 参数定义与返回格式 | ✅ |
| AI 任务类型 | 使用的 AI 路由标识 | 如需 |
| API 端点 | 后端接口路径与请求格式 | 如需 |
| 前端组件 | 相关 React 组件路径 | ✅ |
| 数据模型 | TypeScript 接口定义 | ✅ |
| 使用流程 | 操作步骤说明 | ✅ |
| 依赖关系 | 依赖的其他技能 | ✅ |

## 新增技能指南

要为 Novel Forge 添加新技能，请遵循以下步骤：

1. **创建目录**：在 `skills/` 下新建技能目录，如 `skills/my-skill/`
2. **编写文档**：创建 `skill.md`，按上方规范编写
3. **定义类型**：在 `src/lib/types.ts` 中添加数据模型
4. **创建 Store**：在 `src/stores/` 中创建 Zustand 状态管理
5. **实现 API**：在 `src/app/api/` 中创建 API 路由
6. **编写组件**：在 `src/components/` 中创建前端组件
7. **注册路由**：在 `src/app/(app)/` 下添加页面路由
8. **更新导航**：在 `src/components/layout/app-sidebar.tsx` 中添加导航项
9. **更新本文档**：在上方表格中添加新技能条目
10. **提交验证**：`npm run build` 确保编译通过

## 项目统计

- **技能总数**：10 个
- **API 端点**：22 个
- **页面路由**：8 个
- **前端组件**：40+ 个
- **Zustand Store**：8 个
- **支持体裁**：6 大类 63 个桥段
- **故事框架**：7 种
- **导出格式**：4 种
- **AI 模型**：4 家提供者 10 种任务路由
