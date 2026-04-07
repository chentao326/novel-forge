# AI 模型管理 (AI Model Management)

> 多 AI 模型提供者管理与任务路由技能

## 功能描述

统一管理多个 AI 模型提供者，根据任务类型自动路由到合适的模型。支持 DeepSeek、Qwen (通义千问)、OpenAI、Anthropic 四大提供者，所有 AI 调用均使用 SSE 流式响应。通过设置页面进行 API Key 配置和任务模型分配。

## 支持的提供者

### 1. DeepSeek

| 属性 | 值 |
|------|-----|
| 接口类型 | OpenAI 兼容接口 |
| Base URL | `https://api.deepseek.com/v1` |
| 环境变量 | `DEEPSEEK_API_KEY` |
| 默认模型 | `deepseek-chat` |
| SDK | `@ai-sdk/openai` (createOpenAI) |

### 2. Qwen (通义千问)

| 属性 | 值 |
|------|-----|
| 接口类型 | OpenAI 兼容接口 (DashScope) |
| Base URL | `https://dashscope.aliyuncs.com/compatible-mode/v1` |
| 环境变量 | `OPENAI_API_KEY` |
| 默认模型 | 通过 OpenAI 兼容接口调用 |
| SDK | `@ai-sdk/openai` (createOpenAI) |

### 3. OpenAI

| 属性 | 值 |
|------|-----|
| 接口类型 | 原生 OpenAI 接口 |
| Base URL | 默认 (api.openai.com) |
| 环境变量 | `OPENAI_API_KEY` |
| 默认模型 | GPT 系列 |
| SDK | `@ai-sdk/openai` (createOpenAI) |

### 4. Anthropic

| 属性 | 值 |
|------|-----|
| 接口类型 | 原生 Anthropic 接口 |
| 环境变量 | `ANTHROPIC_API_KEY` |
| 默认模型 | Claude 系列 |
| SDK | `@ai-sdk/anthropic` |

## 任务路由

根据任务类型自动选择合适的模型（`src/lib/ai/providers.ts` -> `getModelForTask`）。

### 路由表

| 任务类型 | 说明 | 默认模型 |
|----------|------|----------|
| `brainstorm` | 构思/头脑风暴 | deepseek-chat |
| `outline` | 大纲生成 | deepseek-chat |
| `continue` / `writing_continue` | 续写 | deepseek-chat |
| `rewrite` / `writing_rewrite` | 改写 | deepseek-chat |
| `analyze` | 分析 | deepseek-chat |
| `character_generate` | 角色生成 | deepseek-chat |
| `writing_chat` | 创作对话 | deepseek-chat |
| `world_generate` | 世界观生成 | deepseek-chat |
| `world_consistency` | 一致性检查 | deepseek-chat |

> 默认所有任务路由到 DeepSeek。用户可在设置页面为不同任务类型分配不同的模型和提供者。

### 路由逻辑

```typescript
// src/lib/ai/providers.ts
function getModelForTask(task: string): LanguageModel {
  const deepseek = createDeepSeekProvider();
  switch (task) {
    case 'brainstorm':
    case 'outline':
    case 'continue':
    case 'writing_continue':
    case 'rewrite':
    case 'writing_rewrite':
    case 'analyze':
    case 'character_generate':
    case 'writing_chat':
    case 'world_generate':
    case 'world_consistency':
      return deepseek('deepseek-chat');
    default:
      return deepseek('deepseek-chat');
  }
}
```

## 配置方式

通过设置页面 (`/settings`) 进行配置。

**配置流程**：
1. 进入设置页面 `/settings`
2. 切换到"AI 模型"标签
3. 输入各提供者的 API Key
4. 点击"连接测试"验证 API Key 有效性
5. 为不同任务类型分配模型（提供者 + 模型名称）
6. 调整全局参数（temperature、maxTokens）

**配置项**（`src/stores/settings-store.ts` -> `AppSettings`）：

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `defaultProvider` | `"deepseek" \| "qwen" \| "openai" \| "anthropic"` | `"deepseek"` | 默认提供者 |
| `deepseekApiKey` | `string` | `""` | DeepSeek API Key |
| `qwenApiKey` | `string` | `""` | Qwen API Key |
| `openaiApiKey` | `string` | `""` | OpenAI API Key |
| `anthropicApiKey` | `string` | `""` | Anthropic API Key |
| `brainstormModel` | `string` | `"deepseek-chat"` | 构思任务模型 |
| `continueModel` | `string` | `"deepseek-chat"` | 续写任务模型 |
| `analyzeModel` | `string` | `"deepseek-chat"` | 分析任务模型 |
| `temperature` | `number` | `0.7` | 生成温度 |
| `maxTokens` | `number` | `4096` | 最大生成 Token 数 |

**连接测试**：调用 `POST /api/settings/test-connection` 验证 API Key 是否有效。

## 流式输出

所有 AI 调用使用 SSE (Server-Sent Events) 流式响应。

**前端 Hook**（`src/hooks/use-stream-completion.ts` -> `useStreamCompletion`）：
- 基于 Vercel AI SDK 的 `useCompletion` / `useChat`
- 实时逐字输出 AI 生成内容
- 支持中断生成
- 自动处理流式解析

**使用场景**：
- AI 续写：逐字显示续写内容
- AI 改写：逐字显示改写结果
- AI 对话：逐字显示回复
- 爆款拆解：逐段显示分析结果
- 情感曲线建议：逐字显示建议内容

## Prompt Caching

重复系统提示词缓存，降低约 90% 的 Token 成本。

**实现方式**：
- 系统提示词（System Prompt）在多次调用中保持不变
- 利用 AI 提供者的 Prompt Caching 机制
- 缓存命中时仅计费缓存读取成本（约为原始成本的 10%）

**适用场景**：
- 同一章节多次续写（系统提示词相同）
- 同一角色的多次生成（角色上下文相同）
- 一致性检查（设定上下文相同）

## Prompt 模板

所有 Prompt 模板定义于 `src/lib/ai/prompts.ts`：

| 函数 | 用途 | 关键上下文 |
|------|------|------------|
| `buildContinuePrompt` | 续写 | 标题、类型、简介、章节标题、已有内容 |
| `buildRewritePrompt` | 改写 | 文本、模式、类型 |
| `buildChatPrompt` | 创作对话 | 标题、类型、简介、章节、角色、世界观 |
| `buildCharacterGeneratePrompt` | 角色生成 | 字段、角色数据、类型、简介 |
| `buildWorldGeneratePrompt` | 世界观生成 | 类别、名称、类型、简介、已有设定 |
| `buildConsistencyPrompt` | 一致性检查 | 设定名称、设定内容、已有设定、简介 |

## 代码位置

| 文件 | 说明 |
|------|------|
| `src/lib/ai/providers.ts` | 提供者创建与任务路由 |
| `src/lib/ai/prompts.ts` | Prompt 模板构建 |
| `src/stores/settings-store.ts` | AI 配置状态管理 |
| `src/hooks/use-stream-completion.ts` | 流式输出 Hook |
| `src/app/api/settings/test-connection/route.ts` | 连接测试 API |

## 依赖

| 依赖包 | 版本 | 说明 |
|--------|------|------|
| `ai` | `^6.0.149` | Vercel AI SDK 核心 |
| `@ai-sdk/openai` | `^3.0.51` | OpenAI 兼容接口 SDK（DeepSeek/Qwen/OpenAI） |
| `@ai-sdk/anthropic` | `^3.0.67` | Anthropic 原生接口 SDK |

## 使用示例

### 调用 AI 续写

```typescript
import { getModelForTask } from "@/lib/ai/providers";
import { buildContinuePrompt } from "@/lib/ai/prompts";
import { streamText } from "ai";

const model = getModelForTask("writing_continue");
const prompt = buildContinuePrompt({
  title: "星辰大海",
  genre: "scifi",
  synopsis: "人类探索宇宙的故事...",
  chapterTitle: "第一章 启航",
  existingContent: "飞船缓缓离开地球轨道...",
});

const result = streamText({
  model,
  prompt,
  temperature: 0.7,
  maxTokens: 4096,
});

// 流式消费
for await (const chunk of result.textStream) {
  process.stdout.write(chunk);
}
```

### 配置 API Key

```
1. 访问 /settings 页面
2. 在"AI 模型"标签下输入 DeepSeek API Key
3. 点击"测试连接"按钮
4. 显示"连接成功"后，配置自动保存到 IndexedDB
5. 后续所有 AI 调用将使用该 Key
```

### 切换任务模型

```
1. 访问 /settings 页面
2. 在"AI 模型"标签下找到"任务模型分配"
3. 将"续写"任务从 deepseek-chat 切换为其他模型
4. 保存设置
5. 后续续写操作将使用新分配的模型
```
