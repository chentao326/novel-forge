# 体裁知识库 (Genre Knowledge Base)

> 六大小说类型的桥段、节奏与读者期待知识库

## 功能描述

提供类型写作知识，帮助作者了解和运用类型惯例。涵盖六大小说体裁共 63 个经典桥段，每种体裁包含节奏指南、读者期待和子类型分类。附加爆款拆解和情感曲线编辑器功能。

## 覆盖体裁

共 6 种体裁，63 个桥段。数据定义于 `src/lib/genres/genre-data.ts`。

### 1. 奇幻 (fantasy) - 12 个桥段

**子类型**：史诗奇幻、都市奇幻、仙侠、玄幻、蒸汽朋克

**桥段示例**：
- 天选之子 (common)
- 魔法学院 (popular)
- 修炼升级 (common)
- 神器寻踪 (common)
- 种族共存 (common)
- 黑暗魔王 (common)
- 魔法契约 (popular)
- 异世界穿越 (popular)
- 龙族传说
- 等 12 个桥段

### 2. 言情 (romance) - 10 个桥段

**子类型**：古代言情、现代言情、仙侠言情、校园言情、甜宠

### 3. 科幻 (scifi) - 11 个桥段

**子类型**：硬科幻、赛博朋克、太空歌剧、末日、生物朋克

### 4. 悬疑 (mystery) - 10 个桥段

**子类型**：本格推理、社会派、法医悬疑、心理悬疑、间谍

### 5. 都市 (urban) - 10 个桥段

**子类型**：都市异能、商战、职场、娱乐明星、电竞

### 6. 历史 (historical) - 11 个桥段

**子类型**：历史穿越、宫廷权谋、架空历史、武侠、谍战

## 数据结构

### 桥段 (GenreTrope)

```typescript
// src/lib/genres/genre-data.ts
interface GenreTrope {
  name: string;           // 桥段名称
  description: string;    // 桥段描述
  examples: string[];     // 代表作品示例
  popularity: 'common' | 'popular' | 'niche';  // 流行度
}
```

**流行度等级**：

| 等级 | 值 | 说明 |
|------|-----|------|
| 常见 | `common` | 类型内广泛使用的基础桥段 |
| 流行 | `popular` | 当前热门、读者喜爱的桥段 |
| 小众 | `niche` | 较为独特、小众但有趣的桥段 |

### 体裁模板 (GenreTemplate)

```typescript
// src/lib/genres/genre-data.ts
interface GenreTemplate {
  id: Genre;                    // 体裁 ID
  name: string;                 // 体裁中文名
  description: string;          // 体裁描述
  tropes: GenreTrope[];         // 桥段列表
  pacingGuide: string;          // 节奏指南
  readerExpectations: string[]; // 读者期待列表
  subGenres: string[];          // 子类型列表
}
```

### 体裁 ID 映射

```typescript
// src/lib/types.ts
type Genre =
  | "fantasy"     // 奇幻
  | "scifi"       // 科幻
  | "romance"     // 言情
  | "mystery"     // 悬疑
  | "urban"       // 都市
  | "historical"  // 历史
  | ...           // 其他类型
```

## 附加功能

### 1. 爆款拆解

AI 分析热门小说的 7 个维度，帮助作者学习成功作品的写作技巧。

**分析维度**（`src/components/conception/bestseller-analyzer.tsx`）：

| 维度 | 说明 |
|------|------|
| 核心结构 | 故事的核心框架和叙事结构 |
| 节奏分析 | 章节节奏和情节推进方式 |
| 爽点分布 | 读者满足感的分布和设计 |
| 角色设计 | 主要角色的设计思路和特点 |
| 世界观特色 | 世界观设定的独特之处 |
| 写作技巧 | 使用的具体写作手法 |
| 可借鉴元素 | 可以学习和借鉴的元素 |

**使用方式**：
1. 输入热门小说的书名和简介
2. AI 从 7 个维度进行拆解分析
3. 流式输出各维度的详细分析结果

### 2. 情感曲线编辑器

可视化编辑作品的情感强度曲线，预设模板 + 自定义编辑。

**预设模板**（`src/components/conception/emotion-curve-editor.tsx`）：

| 模板 | 描述 | 曲线特征 |
|------|------|----------|
| 经典弧线 | 低起点 -> 逐步上升 -> 高潮 -> 回落收束 | 平稳上升后回落 |
| 过山车 | 多次起伏，节奏紧凑 | 频繁高低交替 |
| 逐步升级 | 持续上升，越来越紧张 | 单调递增 |
| 倒U型 | 快速上升后缓慢下降 | 先急升后缓降 |
| V型反转 | 高起点 -> 跌入低谷 -> 强力反弹 | 先降后升 |

**编辑器特性**：
- SVG 可视化曲线（800x400 画布）
- 可拖拽控制点调整情感强度
- 每个控制点支持标签标注
- 支持添加/删除控制点
- AI 情感曲线建议（基于体裁和简介）

**数据模型**（`src/stores/emotion-curve-store.ts`）：

```typescript
interface EmotionPoint {
  id: string;
  position: number;    // 位置 (0-100)
  intensity: number;   // 强度 (0-100)
  label: string;       // 标签
}
```

## AI 任务类型

| 任务类型 | 说明 |
|----------|------|
| `brainstorm` | 构思/头脑风暴（桥段推荐等） |
| `analyze` | 分析（爆款拆解等） |

## API 端点

| 方法 | 端点 | 说明 |
|------|------|------|
| POST | `/api/conception/bestseller-analyze` | 爆款拆解分析 |
| POST | `/api/conception/emotion-curve-suggest` | AI 情感曲线建议 |

## 前端组件

所有组件位于 `src/components/conception/` 目录：

| 组件文件 | 功能 |
|----------|------|
| `genre-browser.tsx` | 体裁浏览器（桥段浏览、搜索、应用体裁） |
| `bestseller-analyzer.tsx` | 爆款拆解分析器 |
| `emotion-curve-editor.tsx` | 情感曲线编辑器 |

## 数据源

| 文件 | 说明 |
|------|------|
| `src/lib/genres/genre-data.ts` | 体裁数据定义（GENRE_DATA, GenreTemplate, GenreTrope） |
| `src/lib/types.ts` | Genre 类型定义和 GENRE_LABELS 映射 |
| `src/stores/emotion-curve-store.ts` | 情感曲线状态管理（Zustand + persist） |

## 依赖技能

| 技能 | 依赖原因 |
|------|----------|
| `ai-models` | 爆款拆解和情感曲线建议需要 AI 调用 |

## 使用示例

### 浏览体裁桥段

```
1. 进入构思页面 (/conception)
2. 打开体裁浏览器
3. 选择感兴趣的体裁（如"奇幻"）
4. 浏览该体裁下的所有桥段
5. 每个桥段显示：名称、描述、代表作品、流行度标签
6. 可使用搜索功能快速查找特定桥段
7. 点击"应用"将体裁设为当前项目类型
```

### 爆款拆解

```
1. 进入构思页面 (/conception)
2. 打开爆款拆解分析器
3. 输入目标小说的书名和简介
4. 选择小说类型
5. 点击"开始分析"
6. AI 流式输出 7 个维度的详细分析
7. 各维度可独立展开/折叠查看
```

### 情感曲线编辑

```
1. 进入构思页面 (/conception)
2. 打开情感曲线编辑器
3. 选择预设模板作为起点（如"经典弧线"）
4. 拖拽控制点调整曲线形状
5. 为关键节点添加标签（如"相遇"、"背叛"、"高潮"）
6. （可选）请求 AI 基于体裁和简介推荐情感曲线
7. 保存曲线供后续写作参考
```
