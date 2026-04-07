# Novel Forge — AI 辅助小说创作工具

<p align="center">
  <strong>构思大于正文</strong> — 好的设定是开始小说的关键
</p>

Novel Forge 是一款以「构思与设定」为核心的 AI 辅助小说创作 Web 应用，帮助作者从灵感萌芽到完整大纲的全流程规划，涵盖各种小说类型。

## 创作工作流

```
灵感激发 → 结构引擎 → 雪花法规划
    ↓           ↓           ↓
体裁知识   世界观构建   角色塑造
    ↓           ↓           ↓
    └────────→ 智能写作 ←─┘
                  ↓
            写作分析
                  ↓
            多格式导出
```

## ✨ 核心功能

### 🧠 构思工坊（帮你想）

| 功能 | 说明 |
|------|------|
| 灵感激发器 | 输入关键词/题材/情绪，AI 生成 3-5 个故事概念 |
| 结构引擎 | 7 种经典故事框架（三幕结构、英雄之旅、Save the Cat、故事圆环、起承转合、七点结构、自定义） |
| 雪花法规划器 | 7 步渐进引导，从一句话灵感到完整场景清单 |
| 节拍表编辑器 | 可视化编辑故事节拍，AI 自动生成章节分配 |
| 体裁知识库 | 6 大体裁（玄幻/言情/科幻/悬疑/都市/历史）63 个桥段 |
| 爆款拆解 | AI 分析热门小说的结构、节奏、爽点分布与写作技巧 |
| 情感曲线编辑器 | 可视化规划读者情感体验，5 种预设模板 + 自定义 |

### 🌍 世界观工坊（帮你建）

| 功能 | 说明 |
|------|------|
| 分层构建 | 基于 Sanderson 三层模型（物理层 5 字段 / 文化层 7 字段 / 哲学层 4 字段） |
| 力量体系设计器 | 软硬魔法光谱(1-10)、等级体系、限制与代价，内置仙侠修炼境界预设 |
| 时间线编辑器 | 垂直时间线，6 种彩色事件分类，AI 生成历史事件 |
| 一致性检测 | AI 自动检测设定间的逻辑矛盾 |

### 👥 角色工作室（帮你塑）

| 功能 | 说明 |
|------|------|
| 角色档案 | 基础信息 + 核心创伤蓝图（创伤→谎言→渴望→需求→恐惧→铠甲） |
| 关系图谱 | SVG 可视化角色关系网络，7 种关系类型 |
| 弧线可视化 | 正向/平稳/消极弧线的 S 曲线图形化展示 |
| AI 角色访谈 | 以角色身份回答问题，深入探索角色声音 |

### ✍️ 写作台（帮你写）

| 功能 | 说明 |
|------|------|
| TipTap 编辑器 | 沉浸式写作界面，Zen 模式，浮动字数统计 |
| AI 续写 | 基于大纲上下文自动续写，流式输出 |
| AI 改写 | 4 种模式 — 扩写 / 精简 / 加强描写 / 调整语气 |
| AI 创作对话 | 与 AI 讨论故事，上下文感知（章节+角色+世界观） |
| 章节管理 | 树形结构（作品→卷→章），拖拽排序，5 种状态追踪 |
| 上下文侧栏 | 写作时实时查阅角色卡、世界观卡、大纲 |
| 快捷键 | `Ctrl+Shift+C` 续写 / `Ctrl+Shift+R` 改写 / `Ctrl+S` 保存 / `Ctrl+E` 导出 / `Ctrl+Shift+F` Zen 模式 |
| 自动保存 | 内存 → IndexedDB(2s) → PostgreSQL(10s) 三级保存 |

### 📊 分析中心（帮你看）

| 功能 | 说明 |
|------|------|
| 章节概览 | 总字数/章数统计、可排序表格、完成进度条 |
| 风格分析 | 字数/句长/对话比/词汇多样性/高频词 Top20（纯客户端计算） |
| 节奏热力图 | 章节强度可视化（蓝/绿/黄/红四色渐变）+ AI 节奏分析建议 |
| 伏笔追踪 | 埋设/回收/未解决状态管理，AI 伏笔建议 |
| 一致性检查 | 角色/时间线/世界观/设定引用 四维度 AI 检查 |

### ⚙️ 设置

| 功能 | 说明 |
|------|------|
| AI 模型配置 | 支持 DeepSeek / 通义千问 / OpenAI / Anthropic，API Key 管理，连接测试 |
| 写作偏好 | 字体/行高/自动保存间隔/字数统计开关 |
| 导出设置 | 默认格式/作者署名/章节标题/自定义 CSS |
| 暗色模式 | 亮色 / 暗色 / 跟随系统 |

## 🛠️ 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | Next.js 15 (React 19 + App Router) |
| 富文本编辑器 | TipTap (ProseMirror) |
| UI 组件库 | shadcn/ui + Tailwind CSS v4 |
| 状态管理 | Zustand (persist) |
| 数据库 | PostgreSQL (Supabase) |
| AI 集成 | Vercel AI SDK (多模型路由) |
| 导出 | TXT / Markdown / HTML / EPUB |
| 部署 | Vercel / 自托管 |

## 📊 项目统计

| 指标 | 数量 |
|------|------|
| 功能技能 | 10 个（详见 [skills/](./skills/README.md)） |
| 页面路由 | 8 个 |
| API 端点 | 22 个 |
| 前端组件 | 40+ 个 |
| Zustand Store | 8 个 |
| 故事框架 | 7 种 |
| 体裁桥段 | 6 大类 63 个 |
| 导出格式 | 4 种 |
| AI 模型 | 4 家提供者 10 种任务路由 |

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 9+

### 安装

```bash
git clone https://github.com/chentao326/novel-forge.git
cd novel-forge
npm install
```

### 配置环境变量

复制 `.env.local` 并填入你的 API Key：

```env
# Supabase（必需 — 用户认证与数据存储）
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI 模型（至少配置一个）
DEEPSEEK_API_KEY=your_deepseek_key
OPENAI_API_KEY=your_openai_key
```

### 数据库初始化

在 Supabase Dashboard 中执行 `supabase/migrations/001_initial_schema.sql` 创建数据表（10 张表 + RLS 策略）。

### 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
npm start
```

## 📁 项目结构

```
novel-forge/
├── skills/                     # 📘 技能体系文档（10 个功能技能的详细说明）
│   ├── README.md               # 技能总览、依赖关系、新增指南
│   ├── brainstorm/             # 灵感激发
│   ├── story-structure/        # 结构引擎
│   ├── snowflake/              # 雪花法规划
│   ├── worldbuilding/          # 世界观构建
│   ├── character/              # 角色塑造
│   ├── writing/                # 智能写作
│   ├── analysis/               # 写作分析
│   ├── genre-knowledge/        # 体裁知识库
│   ├── export/                 # 多格式导出
│   └── ai-models/              # AI 模型管理
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (app)/              # 页面布局组（8 个页面）
│   │   │   ├── conception/     # 构思工坊（7 个标签页）
│   │   │   ├── worldbuilding/  # 世界观工坊（5 个标签页）
│   │   │   ├── characters/     # 角色工作室（3 个标签页）
│   │   │   ├── writing/        # 写作台
│   │   │   ├── analysis/       # 分析中心（5 个标签页）
│   │   │   ├── projects/       # 作品管理
│   │   │   └── settings/       # 设置（4 个标签页）
│   │   └── api/                # API 路由（22 个端点）
│   ├── components/             # React 组件（40+）
│   │   ├── conception/         # 构思工坊组件
│   │   ├── worldbuilding/      # 世界观组件
│   │   ├── characters/         # 角色组件
│   │   ├── writing/            # 写作台组件
│   │   ├── analysis/           # 分析组件
│   │   ├── layout/             # 布局组件（侧边栏、移动端）
│   │   └── ui/                 # shadcn/ui 基础组件
│   ├── stores/                 # Zustand 状态管理（8 个 Store）
│   ├── lib/
│   │   ├── ai/                 # AI 模型路由 + 提示词模板
│   │   ├── conception/         # 7 种故事框架数据
│   │   ├── genres/             # 6 大体裁 63 个桥段
│   │   ├── worldbuilding/      # Sanderson 三层模板
│   │   ├── export/             # 4 种格式导出工具
│   │   ├── supabase/           # Supabase 客户端
│   │   └── types.ts            # TypeScript 类型定义
│   └── hooks/                  # 自定义 Hooks
├── supabase/migrations/        # 数据库迁移（10 张表 + RLS）
└── public/                     # 静态资源
```

## 📘 技能体系

项目功能按「技能」组织，每个技能拥有独立的数据模型、AI 提示词、API 端点和前端组件。详见 [`skills/README.md`](./skills/README.md)。

```
构思层（帮你想）  → 灵感激发 / 结构引擎 / 雪花法 / 体裁知识
设定层（帮你建）  → 世界观构建 / 角色塑造
写作层（帮你写）  → 智能写作
分析层（帮你看）  → 写作分析
基础设施        → AI 模型管理 / 多格式导出
```

## 📜 License

MIT
