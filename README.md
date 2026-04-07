# Novel Forge — AI 辅助小说创作工具

> **构思大于正文** — 好的设定是开始小说的关键。

Novel Forge 是一款以「构思与设定」为核心的 AI 辅助小说创作 Web 应用，帮助作者从灵感萌芽到完整大纲的全流程规划，涵盖各种小说类型。

## ✨ 核心功能

### 🧠 构思工坊
- **灵感激发器** — 输入关键词/题材/情绪，AI 生成 3-5 个故事概念
- **结构引擎** — 内置 6 种经典故事框架（三幕结构、英雄之旅、Save the Cat、故事圆环、起承转合、七点结构）
- **雪花法规划器** — 7 步渐进引导，从一句话灵感到完整场景清单
- **节拍表编辑器** — 可视化编辑故事节拍，AI 自动生成章节分配
- **体裁知识库** — 6 大体裁（玄幻/言情/科幻/悬疑/都市/历史）的桥段库与节奏指南
- **爆款拆解** — AI 分析热门小说的结构、节奏、爽点分布与写作技巧
- **情感曲线编辑器** — 可视化规划读者的情感体验旅程

### 🌍 世界观工坊
- **分层构建** — 基于 Sanderson 三层模型（物理层/文化层/哲学层）逐层引导
- **力量体系设计器** — 软硬魔法光谱、等级体系、限制与代价，内置仙侠修炼境界预设
- **时间线编辑器** — 垂直时间线，彩色事件分类，AI 生成历史事件
- **一致性检测** — 自动检测设定间的逻辑矛盾

### 👥 角色工作室
- **角色档案** — 基础信息 + 核心创伤蓝图（创伤→谎言→渴望→需求→恐惧→铠甲）
- **关系图谱** — SVG 可视化角色关系网络
- **弧线可视化** — 正向/平稳/消极弧线的图形化展示
- **AI 角色访谈** — 以角色身份回答问题，深入探索角色声音

### ✍️ 写作台
- **TipTap 富文本编辑器** — 沉浸式写作界面，Zen 模式
- **AI 续写/改写** — 扩写、精简、加强描写、调整语气
- **章节管理** — 树形结构，拖拽排序，状态追踪
- **上下文侧栏** — 写作时实时查阅角色卡、世界观卡、大纲
- **快捷键** — Ctrl+Shift+C 续写、Ctrl+Shift+R 改写、Ctrl+S 保存、Ctrl+E 导出

### 📊 分析中心
- **章节概览** — 总字数/章数统计、可排序表格、完成进度
- **风格分析** — 字数/句长/对话比/词汇多样性/高频词分析
- **节奏热力图** — 章节强度可视化 + AI 节奏分析建议
- **伏笔追踪** — 埋设/回收状态管理，AI 伏笔建议
- **一致性检查** — 角色/时间线/世界观/设定引用四维度 AI 检查

### ⚙️ 设置
- **AI 模型配置** — 支持 DeepSeek/通义千问/OpenAI/Anthropic，API Key 管理，连接测试
- **写作偏好** — 字体/行高/自动保存间隔/字数统计
- **导出设置** — TXT / Markdown / HTML / EPUB
- **暗色模式** — 亮色/暗色/跟随系统

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
OPENAI_API_KEY=your_openai_key
DEEPSEEK_API_KEY=your_deepseek_key
```

### 数据库初始化

在 Supabase Dashboard 中执行 `supabase/migrations/001_initial_schema.sql` 创建数据表。

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
├── src/
│   ├── app/                    # Next.js App Router 页面与 API
│   │   ├── (app)/              # 认证后的页面布局组
│   │   │   ├── conception/     # 构思工坊
│   │   │   ├── worldbuilding/  # 世界观工坊
│   │   │   ├── characters/     # 角色工作室
│   │   │   ├── writing/        # 写作台
│   │   │   ├── analysis/       # 分析中心
│   │   │   ├── projects/       # 作品管理
│   │   │   └── settings/       # 设置
│   │   └── api/                # API 路由（AI 调用、导出等）
│   ├── components/
│   │   ├── conception/         # 构思工坊组件
│   │   ├── worldbuilding/      # 世界观组件
│   │   ├── characters/         # 角色组件
│   │   ├── writing/            # 写作台组件
│   │   ├── analysis/           # 分析组件
│   │   ├── layout/             # 布局组件（侧边栏、移动端）
│   │   └── ui/                 # shadcn/ui 基础组件
│   ├── stores/                 # Zustand 状态管理
│   ├── lib/
│   │   ├── ai/                 # AI 模型路由与提示词
│   │   ├── conception/         # 故事框架数据
│   │   ├── genres/             # 体裁知识库
│   │   ├── worldbuilding/      # 世界观模板
│   │   ├── export/             # 导出工具
│   │   ├── supabase/           # Supabase 客户端
│   │   └── types.ts            # TypeScript 类型定义
│   └── hooks/                  # 自定义 Hooks
├── supabase/migrations/        # 数据库迁移
└── public/                     # 静态资源
```

## 📜 License

MIT
