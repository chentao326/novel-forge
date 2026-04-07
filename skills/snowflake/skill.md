# 雪花法规划 (Snowflake Method)

> 7 步渐进式大纲规划技能

## 功能描述

雪花法规划技能实现了兰迪-英格曼森（Randy Ingermanson）提出的雪花法写作方法。该方法从一句话灵感到完整场景清单，通过 7 个渐进步骤逐步扩展故事的细节和复杂度。每一步都提供 AI 辅助生成，用户审核确认后方可进入下一步，确保大纲的每层都经过深思熟虑。

## 7 个步骤

### 步骤 1：一句话概括 (one_liner)

将整个故事精炼为一句话（不超过 25 个字），包含主角、核心冲突和利害关系。

**AI 生成要求**：
- 包含主角、核心冲突和利害关系
- 要有悬念和吸引力
- 不超过 25 个字

**示例**：
> 一个失忆的刺客在追查自己身世的过程中，发现自己是被自己下令暗杀的目标。

### 步骤 2：一段话扩展 (paragraph)

将一句话概括扩展为一段话的故事梗概，包含三幕结构。

**AI 生成要求**：
- 包含三幕结构：开头（建置）、中间（冲突升级）、结尾（解决）
- 5-8 句话
- 突出因果逻辑

**示例结构**：
> 第一句：故事背景和起因 → 第二至三句：冲突发展 → 第四至五句：危机升级 → 第六至七句：高潮和结局

### 步骤 3：角色概要 (character_summaries)

为主要角色创建概要，包含姓名、故事线、动机、目标、冲突和顿悟。

**AI 输出格式**：

```json
[
  {
    "name": "角色名",
    "storyline": "角色故事线（2-3句话）",
    "motivation": "核心动机",
    "goal": "外在目标",
    "conflict": "核心冲突",
    "epiphany": "顿悟/转变"
  }
]
```

**AI 生成要求**：生成 2-4 个主要角色

### 步骤 4：分幕概要 (act_outlines)

将故事梗概扩展为分幕概要，每幕一页的篇幅。

**AI 输出格式**：

```json
{
  "act1": "第一幕概要（建置+触发事件+第一转折点，3-5句话）",
  "act2a": "第二幕上半（上升行动，3-5句话）",
  "act2b": "第二幕下半（中点+下降行动+第二转折点，3-5句话）",
  "act3": "第三幕概要（高潮+结局，3-5句话）"
}
```

### 步骤 5：角色详档 (character_details)

为每个角色创建详细档案，每角色一页的篇幅。

**AI 输出格式**：

```json
[
  {
    "name": "角色名",
    "detailedProfile": "详细角色描述（外貌、性格、背景故事，5-8句话）",
    "characterArc": "角色弧线详细描述（从开始到结束的变化过程，3-5句话）",
    "keyRelationships": "关键关系描述（2-3句话）"
  }
]
```

### 步骤 6：分章概要 (chapter_outlines)

将分幕概要扩展为分章大纲，生成 4 页大纲（约 8-15 章）。

**AI 输出格式**：

```json
[
  {
    "chapterNumber": 1,
    "title": "章节标题",
    "summary": "章节概要（3-5句话）",
    "keyEvents": ["关键事件1", "关键事件2"],
    "pov": "视角角色"
  }
]
```

### 步骤 7：场景清单 (scene_list)

从分章大纲展开，为每章生成详细的场景清单。

**AI 输出格式**：

```json
[
  {
    "chapterNumber": 1,
    "scenes": [
      {
        "sceneNumber": 1,
        "location": "场景地点",
        "characters": ["在场角色"],
        "purpose": "场景目的",
        "description": "场景描述（2-3句话）",
        "emotionTone": "情绪基调"
      }
    ]
  }
]
```

## 数据模型

```typescript
interface SnowflakeStep {
  step: number;               // 当前步骤 (1-7)
  one_liner: string | null;   // 步骤1：一句话概括
  paragraph: string | null;   // 步骤2：一段话扩展
  character_summaries: string | null;  // 步骤3：角色概要
  act_outlines: string | null;         // 步骤4：分幕概要
  character_details: string | null;    // 步骤5：角色详档
  chapter_outlines: string | null;     // 步骤6：分章概要
  scene_list: string | null;           // 步骤7：场景清单
}
```

> 类型定义来源：`src/lib/types.ts` — `SnowflakeStep` 接口

## AI 任务类型

`outline`

## API 端点

```
POST /api/conception/snowflake
```

### 请求示例

```json
{
  "step": 3,
  "currentData": {
    "one_liner": "一个失忆的刺客在追查自己身世的过程中，发现自己是被自己下令暗杀的目标。",
    "paragraph": "前皇家刺客'影'在一次任务中失去记忆..."
  },
  "synopsis": "一个失忆的刺客在追查自己身世...",
  "characters": []
}
```

### 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `step` | `number` | 是 | 当前步骤（1-7） |
| `currentData` | `SnowflakeStep` | 否 | 已完成的步骤数据 |
| `synopsis` | `string` | 否 | 故事简介 |
| `characters` | `Character[]` | 否 | 已有角色列表 |

### 响应

返回 `text/stream` 流式响应，根据当前步骤输出对应格式的内容。

> API 实现文件：`src/app/api/conception/snowflake/route.ts`

## 前端组件

```
src/components/conception/snowflake-planner.tsx
```

### 组件功能

- 步骤进度条：可视化展示当前进度（1/7 到 7/7）
- 每步内容编辑区：展示 AI 生成结果，支持手动编辑
- "AI 辅助"按钮：调用 AI 生成当前步骤内容
- "确认并下一步"按钮：审核通过后进入下一步
- "返回上一步"按钮：支持回退修改

## 使用流程

```
步骤1: 一句话概括
  |
  v  (用户确认)
步骤2: 一段话扩展
  |
  v  (用户确认)
步骤3: 角色概要
  |
  v  (用户确认)
步骤4: 分幕概要
  |
  v  (用户确认)
步骤5: 角色详档
  |
  v  (用户确认)
步骤6: 分章概要
  |
  v  (用户确认)
步骤7: 场景清单
  |
  v  (完成)
进入写作阶段
```

## 核心特点

- **渐进式扩展**：每一步都在前一步的基础上扩展，确保逻辑一致性
- **AI 辅助 + 人工审核**：AI 生成初稿，用户审核确认后进入下一步
- **上下文累积**：每步生成时，AI 会参考之前所有步骤的内容
- **灵活回退**：支持返回任意步骤进行修改

## 依赖

| 依赖技能 | 说明 |
|----------|------|
| `ai-models` | 提供 AI 模型调用能力（OpenAI GPT-4o-mini） |
| `story-structure` | 步骤 2 和步骤 4 使用三幕结构知识 |
| `character` | 步骤 3 和步骤 5 的角色数据与角色技能共享 |
