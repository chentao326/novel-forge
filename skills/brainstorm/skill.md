# 灵感激发 (Brainstorm)

> AI 驱动的故事概念生成技能

## 功能描述

灵感激发技能是 Novel Forge 创作流程的起点。用户输入关键词、题材、情绪基调和参考作品等信息后，AI 将生成 3-5 个风格各异的故事概念，每个概念包含标题、核心冲突、主题方向和故事梗概，帮助作者快速找到创作方向。

## 输入参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `keywords` | `string[]` | 否 | 创作关键词，如 `["重生", "复仇", "宫廷"]` |
| `genre` | `Genre` | 否 | 小说类型，可选值见下方枚举 |
| `mood` | `string` | 否 | 情绪基调，如 `"黑暗压抑"`、`"轻松幽默"` |
| `references` | `string` | 否 | 参考作品，如 `"《庆余年》《琅琊榜》"` |
| `projectId` | `string` | 否 | 关联的项目 ID，用于获取已有角色和世界观 |

### Genre 类型枚举

```typescript
type Genre =
  | "fantasy"   // 奇幻
  | "scifi"     // 科幻
  | "romance"   // 言情
  | "mystery"   // 悬疑
  | "thriller"  // 惊悚
  | "horror"    // 恐怖
  | "literary"  // 文学
  | "historical" // 历史
  | "adventure" // 冒险
  | "comedy"    // 喜剧
  | "drama"     // 剧情
  | "urban"     // 都市
  | "other";    // 其他
```

> 类型定义来源：`src/lib/types.ts` — `Genre` 类型

## 输出格式

AI 返回一个故事概念数组，每个概念包含以下字段：

```json
[
  {
    "title": "故事标题建议",
    "coreConflict": "核心冲突描述（2-3句话）",
    "themeDirection": "主题方向（1-2句话）",
    "synopsis": "简短故事梗概（3-5句话）",
    "targetAudience": "目标读者",
    "uniqueSellingPoint": "独特卖点"
  }
]
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `title` | `string` | 故事标题建议 |
| `coreConflict` | `string` | 核心冲突描述，2-3 句话 |
| `themeDirection` | `string` | 主题方向，1-2 句话 |
| `synopsis` | `string` | 简短故事梗概，3-5 句话 |
| `targetAudience` | `string` | 目标读者群体 |
| `uniqueSellingPoint` | `string` | 独特卖点 |

## AI 任务类型

`brainstorm`

## API 端点

```
POST /api/conception/brainstorm
```

### 请求示例

```json
{
  "keywords": ["重生", "商战", "逆袭"],
  "genre": "urban",
  "mood": "热血励志",
  "references": "《重生之都市修仙》",
  "projectId": "proj_xxxxx"
}
```

### 请求体扩展字段

当提供 `projectId` 时，API 还会接收以下可选字段以增强生成质量：

| 字段 | 类型 | 说明 |
|------|------|------|
| `synopsis` | `string` | 已有的项目简介 |
| `characters` | `Character[]` | 已有的角色列表 |
| `worldSettings` | `WorldSetting[]` | 已有的世界观设定 |

### 响应

返回 `text/stream` 流式响应，逐步输出 JSON 数组内容。

> API 实现文件：`src/app/api/conception/brainstorm/route.ts`

## 前端组件

```
src/components/conception/brainstorm-panel.tsx
```

该组件提供以下交互界面：
- 关键词输入框（支持多个关键词）
- 类型选择下拉菜单
- 情绪基调输入
- 参考作品输入
- "生成灵感"按钮
- 概念卡片展示区域（流式渲染）

## 使用流程

```
1. 用户输入关键词和选择类型
       |
       v
2. 点击"生成灵感"按钮
       |
       v
3. AI 流式返回 3-5 个概念卡片
       |
       v
4. 用户浏览并选择采用的概念
       |
       v
5. 选中的概念写入项目简介，进入下一步规划
```

### 使用示例

**场景**：作者想写一部都市重生类小说

1. 在灵感面板中输入关键词：`["重生", "商战", "逆袭"]`
2. 选择类型：`urban`（都市）
3. 设置情绪基调：`热血励志`
4. 填写参考作品：`《重生之都市修仙》`
5. 点击"生成灵感"
6. AI 返回 3-5 个差异化概念，例如：
   - 概念 A：重生后利用未来记忆在商界翻云覆雨
   - 概念 B：重生回到大学时代，从零开始创业
   - 概念 C：重生后发现前世的敌人也在暗中布局
7. 作者选择概念 B，确认后进入结构规划阶段

## 依赖

| 依赖技能 | 说明 |
|----------|------|
| `ai-models` | 提供 AI 模型调用能力（OpenAI GPT-4o-mini） |
| `genre-knowledge` | 提供类型知识库，辅助生成符合类型特征的概念 |

## AI 提示词策略

系统提示词要求 AI 扮演"资深小说创意顾问"，并遵循以下规则：
- 每个概念必须有明显的差异化
- 核心冲突要有张力和戏剧性
- 主题方向要有深度和思考价值
- 标题要吸引人且符合类型特征
- 所有内容使用中文
- 直接返回 JSON 数组格式
