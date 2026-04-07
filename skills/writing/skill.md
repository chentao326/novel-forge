# 智能写作 (AI Writing)

> TipTap 富文本编辑器 + AI 续写/改写技能

## 功能描述

沉浸式写作界面，集成 AI 辅助续写与改写能力。基于 TipTap (ProseMirror) 富文本编辑器，提供完整的格式化工具栏、AI 创作助手、章节管理、上下文查阅侧栏和 Zen 沉浸模式，为小说作者打造高效的写作体验。

## 子功能

### 1. 富文本编辑

基于 TipTap (ProseMirror) 的富文本编辑器，支持丰富的格式化能力。

**已加载的 TipTap 扩展**（参见 `src/components/writing/editor.tsx`）：

| 扩展 | 功能 |
|------|------|
| `StarterKit` | 基础编辑（加粗、斜体、标题、列表、引用、代码块、分割线等） |
| `Underline` | 下划线 |
| `TextAlign` | 文本对齐（左/中/右/两端） |
| `Highlight` | 文本高亮 |
| `Typography` | 排版优化（智能引号等） |
| `Color` + `TextStyle` | 文字颜色 |
| `CharacterCount` | 字符计数 |
| `TaskList` + `TaskItem` | 任务列表 |
| `Superscript` / `Subscript` | 上标/下标 |
| `Image` | 图片插入 |
| `Link` | 超链接 |
| `Placeholder` | 占位提示文字 |
| `CodeBlockLowlight` | 代码块语法高亮 |

**格式化工具栏**（`src/components/writing/editor-toolbar.tsx`）：
- 加粗 / 斜体 / 下划线 / 删除线
- 标题级别 (H1-H3)
- 有序列表 / 无序列表 / 任务列表
- 文本对齐（左/中/右/两端）
- 引用块 / 代码块
- 高亮 / 文字颜色
- 上标 / 下标
- 撤销 / 重做

### 2. AI 续写

基于大纲上下文自动续写，使用 SSE 流式输出。

**工作流程**：
1. 用户在编辑器中定位光标位置
2. 触发续写（快捷键 `Ctrl+Shift+C` 或面板按钮）
3. 系统将作品标题、类型、简介、当前章节标题和已有内容发送至 AI
4. AI 流式返回约 200-500 字的续写内容
5. 用户可选择接受或拒绝

**Prompt 构建**（`src/lib/ai/prompts.ts` -> `buildContinuePrompt`）：
```
输入上下文：title, genre, synopsis, chapterTitle, existingContent
输出要求：自然续写，保持文风/语气/叙事视角一致，约200-500字
```

### 3. AI 改写

4 种改写模式，针对选中文本进行智能改写。

| 模式 | 值 | 说明 |
|------|-----|------|
| 扩写 | `expand` | 扩写至原文的 2-3 倍，增加细节、描写和情感层次 |
| 精简 | `condense` | 精简至原文的 1/2 - 2/3，去除冗余，保留核心情节 |
| 加强描写 | `describe` | 加强环境描写、心理描写、动作描写，使场景更生动 |
| 调整语气 | `tone` | 调整语气和风格，增强情感张力和文学性 |

**Prompt 构建**（`src/lib/ai/prompts.ts` -> `buildRewritePrompt`）：
```
输入：text, mode (expand/condense/describe/tone), genre
输出：直接输出改写后文本，不添加解释
```

### 4. AI 创作对话

与 AI 讨论故事创作，具备上下文感知能力。

**上下文感知范围**：
- 当前章节标题和内容摘要
- 作品标题、类型、简介
- 主要角色信息（姓名、定位、背景）
- 世界观设定（名称、类别、内容）

**Prompt 构建**（`src/lib/ai/prompts.ts` -> `buildChatPrompt`）：
```
系统角色：专业小说创作助手
上下文注入：作品信息 + 章节内容 + 角色列表 + 世界观设定
回答要求：具体、有建设性，与世界观和角色设定保持一致
```

### 5. 章节管理

树形结构管理作品章节，支持拖拽排序和状态追踪。

**层级结构**：作品 (Project) -> 卷 (Volume) -> 章 (Chapter)

**章节状态**（`src/lib/types.ts` -> `ChapterStatus`）：

| 状态 | 值 | 说明 |
|------|-----|------|
| 大纲 | `outline` | 章节大纲阶段 |
| 草稿 | `draft` | 初步草稿 |
| 初稿 | `first_draft` | 第一版完成 |
| 润色 | `polished` | 已润色修改 |
| 定稿 | `final` | 最终定稿 |

**功能特性**：
- 卷的增删改
- 章节的增删改
- 拖拽排序（上下移动）
- 章节状态切换
- 当前章节选中高亮

### 6. 上下文侧栏

写作时实时查阅参考资料，无需离开编辑器。

**侧栏内容**（`src/components/writing/context-sidebar.tsx`）：
- **角色卡**：按角色定位分类展示（主角/反派/配角/龙套），显示姓名和背景摘要
- **世界观卡**：按类别分类展示（地理/历史/政治/文化/力量体系/科技等），显示名称和内容摘要
- **大纲**：章节大纲快速查阅
- 支持搜索过滤
- 可折叠展开详情

### 7. Zen 模式

全屏沉浸写作模式，消除干扰。

**特性**：
- 隐藏侧栏、工具栏等非核心 UI
- 编辑器占满全屏
- 保留最小化工具栏（退出 Zen、AI 续写、AI 改写）
- 快捷键 `Ctrl+Shift+F` 切换

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+Shift+C` | AI 续写 |
| `Ctrl+Shift+R` | AI 改写 |
| `Ctrl+S` | 保存 |
| `Ctrl+E` | 导出 |
| `Ctrl+Shift+F` | 切换 Zen 模式 |

## 自动保存

采用三级保存策略，确保数据安全：

| 层级 | 存储 | 延迟 | 说明 |
|------|------|------|------|
| 1 | 内存 (React State) | 即时 | 编辑器实时状态 |
| 2 | IndexedDB (Zustand persist) | 2 秒 | 浏览器本地持久化 |
| 3 | PostgreSQL (Supabase) | 10 秒 | 服务端持久化 |

## AI 任务类型

| 任务类型 | 说明 |
|----------|------|
| `writing_continue` | AI 续写 |
| `writing_rewrite` | AI 改写 |
| `writing_chat` | AI 创作对话 |

## API 端点

| 方法 | 端点 | 说明 |
|------|------|------|
| POST | `/api/writing/continue` | AI 续写接口 |
| POST | `/api/writing/rewrite` | AI 改写接口 |
| POST | `/api/writing/chat` | AI 创作对话接口 |

## 前端组件

所有组件位于 `src/components/writing/` 目录：

| 组件文件 | 功能 |
|----------|------|
| `editor.tsx` | TipTap 富文本编辑器主体（TipTapEditor） |
| `editor-toolbar.tsx` | 格式化工具栏（EditorToolbar） |
| `ai-writing-panel.tsx` | AI 写作面板（续写/改写/对话三合一） |
| `chapter-tree.tsx` | 章节树形管理（ChapterTree） |
| `context-sidebar.tsx` | 上下文侧栏（ContextSidebar） |
| `export-dialog.tsx` | 导出对话框（ExportDialog） |

## 数据模型

章节状态定义于 `src/lib/types.ts`：

```typescript
type ChapterStatus = "outline" | "draft" | "first_draft" | "polished" | "final";

type RewriteMode = "expand" | "condense" | "describe" | "tone";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
```

章节状态管理于 `src/stores/chapter-store.ts`（Zustand + persist）。

## 依赖技能

| 技能 | 依赖原因 |
|------|----------|
| `ai-models` | AI 续写/改写/对话依赖模型路由 |
| `character` | 上下文侧栏展示角色信息 |
| `worldbuilding` | 上下文侧栏展示世界观设定 |
| `export` | 导出对话框调用导出工具函数 |

## 使用示例

### 续写操作流程

```
1. 用户在编辑器中写作到某处
2. 按下 Ctrl+Shift+C 或点击 AI 面板的"续写"按钮
3. 系统调用 POST /api/writing/continue
4. AI 基于已有内容流式生成续写文本
5. 用户在 AI 面板中预览，点击"接受"插入编辑器
```

### 改写操作流程

```
1. 用户在编辑器中选中一段文本
2. 按下 Ctrl+Shift+R 或在 AI 面板选择改写模式
3. 选择改写模式：expand / condense / describe / tone
4. 系统调用 POST /api/writing/rewrite
5. AI 返回改写结果，用户预览后接受或拒绝
```
