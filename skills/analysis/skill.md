# 写作分析 (Writing Analysis)

> 多维度写作质量分析技能

## 功能描述

从风格、节奏、伏笔、一致性等多个维度分析写作质量，帮助作者发现作品中的问题和改进空间。部分分析（风格分析）在客户端完成，无需 AI 调用；深度分析（节奏建议、伏笔建议、一致性检查）通过 AI 完成。

## 子功能

### 1. 章节概览

作品整体统计与进度追踪。

**功能**：
- 总字数 / 总章数统计
- 各章节字数、状态一览
- 可排序表格（按字数、状态、创建时间排序）
- 完成进度条（基于章节状态计算完成百分比）

**组件**：`src/components/analysis/chapter-overview.tsx`

### 2. 风格分析

纯客户端计算，无需 AI 调用，即时出结果。

**分析指标**：

| 指标 | 说明 | 计算方式 |
|------|------|----------|
| 总字数 | 中文总字符数 | 统计 `\u4e00-\u9fff` 范围字符 |
| 总字符数 | 包含标点和空白 | HTML 去标签后统计 |
| 平均句长 | 每句平均字数 | 按句号/问号/感叹号分句 |
| 对话占比 | 对话文本占总文本比例 | 匹配引号内文本 |
| 词汇多样性 (TTR) | Type-Token Ratio | 不同词数 / 总词数 |
| 高频词 Top 20 | 出现频率最高的词 | 排除停用词后统计 |
| 段落长度分布 | 各段落的字数分布 | 统计每段字数 |

**停用词过滤**：内置中文停用词表（约 150 个常见虚词），确保高频词分析有意义。

**组件**：`src/components/analysis/style-analyzer.tsx`

**数据流**：
```
章节内容 (HTML) -> stripHtml() -> 纯文本 -> 各指标计算 -> 展示
```

### 3. 节奏热力图

可视化展示各章节的叙事强度，辅助节奏把控。

**强度评分算法**（纯客户端，`src/components/analysis/pacing-heatmap.tsx` -> `calculateIntensity`）：

```
综合评分 = 对话比 + 句长方差 + 感叹号密度 + 动作动词密度
```

| 维度 | 说明 |
|------|------|
| 对话比 | 对话字符数 / 总中文字符数 |
| 句长方差 | 句子长度的标准差，反映节奏变化 |
| 感叹号计数 | 感叹号出现次数，反映情感强度 |
| 动作动词计数 | 常见动作动词出现次数，反映动作场面密度 |

**颜色渐变**：

| 颜色 | 含义 | 强度范围 |
|------|------|----------|
| 蓝色 | 低强度（平静/铺垫） | 0 - 25% |
| 绿色 | 中等强度（正常叙事） | 25% - 50% |
| 黄色 | 较高强度（紧张/冲突） | 50% - 75% |
| 红色 | 高强度（高潮/激烈） | 75% - 100% |

**AI 节奏分析建议**：可调用 AI 对整体节奏进行分析并给出调整建议。

**组件**：`src/components/analysis/pacing-heatmap.tsx`

### 4. 伏笔追踪

管理作品中的伏笔埋设与回收。

**数据模型**（`src/stores/foreshadowing-store.ts` -> `ForeshadowingItem`）：

```typescript
interface ForeshadowingItem {
  id: string;
  project_id: string;
  chapter_id: string | null;       // 埋设章节
  description: string;             // 伏笔描述
  is_resolved: boolean;            // 是否已回收
  resolved_chapter_id: string | null; // 回收章节
  created_at: string;
}
```

**状态管理**：
- 埋设：在特定章节创建伏笔记录
- 回收：标记伏笔为已解决，关联回收章节
- 未解决：筛选所有 `is_resolved === false` 的伏笔

**Store 方法**：
- `addItem(item)` - 添加伏笔
- `resolveItem(id, resolvedChapterId)` - 回收伏笔
- `getUnresolvedItems(projectId)` - 获取未解决伏笔
- `getResolvedItems(projectId)` - 获取已解决伏笔
- `getItemsByChapter(chapterId)` - 按章节筛选

**AI 伏笔建议**：可调用 AI 分析当前章节内容，建议可埋设的伏笔或提醒未回收的伏笔。

**组件**：`src/components/analysis/foreshadowing-tracker.tsx`

### 5. 一致性检查

四维度 AI 检查，确保作品逻辑自洽。

| 检查维度 | 说明 |
|----------|------|
| 角色一致性 | 角色性格、行为、说话风格是否前后一致 |
| 时间线逻辑 | 事件发生顺序是否合理，时间线是否有矛盾 |
| 世界观规则 | 是否违反已设定的世界观规则 |
| 设定引用 | 对已有设定的引用是否准确 |

**AI Prompt**（`src/lib/ai/prompts.ts` -> `buildConsistencyPrompt`）：
```
输入：设定名称、设定内容、已有其他设定、作品简介
输出格式：
  1. 一致性评估（一致/存在矛盾）
  2. 具体分析
  3. 修改建议（如有矛盾）
```

**组件**：`src/components/analysis/consistency-check.tsx`

## AI 任务类型

| 任务类型 | 说明 |
|----------|------|
| `analyze` | 写作分析（风格/节奏/伏笔/一致性） |

## API 端点

| 方法 | 端点 | 说明 |
|------|------|------|
| POST | `/api/analysis/style` | 风格分析（AI 增强） |
| POST | `/api/analysis/pacing` | 节奏分析与建议 |
| POST | `/api/analysis/foreshadow-suggest` | AI 伏笔建议 |
| POST | `/api/analysis/consistency` | 一致性检查 |

> 注意：风格分析的基础指标（字数、句长、TTR 等）为纯客户端计算，不需要调用 API。

## 前端组件

所有组件位于 `src/components/analysis/` 目录：

| 组件文件 | 功能 |
|----------|------|
| `chapter-overview.tsx` | 章节概览统计 |
| `style-analyzer.tsx` | 风格分析（客户端计算） |
| `pacing-heatmap.tsx` | 节奏热力图 |
| `foreshadowing-tracker.tsx` | 伏笔追踪管理 |
| `consistency-check.tsx` | 一致性检查 |

## 数据模型

**伏笔数据模型**（`src/stores/foreshadowing-store.ts`）：

```typescript
interface ForeshadowingItem {
  id: string;
  project_id: string;
  chapter_id: string | null;
  description: string;
  is_resolved: boolean;
  resolved_chapter_id: string | null;
  created_at: string;
}
```

使用 Zustand + persist 中间件，存储键名为 `novel-forge-foreshadowing`。

## 依赖技能

| 技能 | 依赖原因 |
|------|----------|
| `ai-models` | 节奏分析建议、伏笔建议、一致性检查需要 AI 调用 |
| `character` | 一致性检查需要角色数据 |
| `worldbuilding` | 一致性检查需要世界观设定数据 |

## 使用示例

### 风格分析操作

```
1. 进入分析页面 (/analysis)
2. 选择"风格分析"标签
3. 选择要分析的章节（或分析全部章节）
4. 系统即时计算并展示：
   - 总字数、平均句长、对话占比、TTR
   - 高频词 Top 20 词云
   - 段落长度分布图
5. （可选）点击"AI 分析"获取更深入的写作建议
```

### 伏笔追踪操作

```
1. 在写作过程中，选中一段文本作为伏笔
2. 在伏笔追踪器中添加记录，关联当前章节
3. 后续章节中回收伏笔时，标记为已解决并关联回收章节
4. 随时查看"未解决伏笔"列表，避免遗漏
5. （可选）请求 AI 建议当前章节可埋设的伏笔
```
