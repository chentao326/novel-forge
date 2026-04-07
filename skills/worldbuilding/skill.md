# 世界观构建 (World Building)

> 分层式世界观设定与管理技能

## 功能描述

世界观构建技能基于布兰登-桑德森（Brandon Sanderson）提出的三层世界观模型，提供系统化的世界观创建、管理和一致性检测功能。包含分层构建、力量体系设计器、时间线编辑器和 AI 一致性检测四大子功能，帮助作者构建逻辑自洽、层次丰富的虚构世界。

## 子功能

### 1. 分层构建

基于 Sanderson 三层模型，将世界观分为物理层、文化层和哲学层，每层提供预设字段模板。

#### 物理层（5 个字段）

| 字段键 | 字段名 | 说明 |
|--------|--------|------|
| `geography` | 地理概况 | 主要大陆、山脉、河流等 |
| `climate` | 气候特征 | 不同地区的气候特点 |
| `flora_fauna` | 动植物 | 独特的物种和生态系统 |
| `resources` | 自然资源 | 重要的矿产、能源、材料 |
| `transportation` | 交通方式 | 人们如何出行 |

#### 文化/社会层（7 个字段）

| 字段键 | 字段名 | 说明 |
|--------|--------|------|
| `religion` | 宗教信仰 | 主要宗教和信仰体系 |
| `technology` | 科技水平 | 关键技术发明和科技水平 |
| `language` | 语言文字 | 主要语言和方言 |
| `social_norms` | 社会规范 | 重要的社会规则和禁忌 |
| `class_system` | 阶级分工 | 社会阶层和分工方式 |
| `festivals` | 节日习俗 | 重要的节日和传统 |
| `arts` | 艺术文化 | 音乐、绘画、文学等艺术形式 |

#### 哲学/理念层（4 个字段）

| 字段键 | 字段名 | 说明 |
|--------|--------|------|
| `core_laws` | 核心法则 | 世界运作的基本规则 |
| `values` | 价值体系 | 社会推崇和贬抑的价值观 |
| `justice` | 权力与正义 | 权力如何分配，正义如何定义 |
| `meaning` | 生命意义 | 人们认为生命的意义是什么 |

> 模板数据来源：`src/lib/worldbuilding/layer-templates.ts`

### 2. 力量体系设计器

为奇幻、玄幻等类型小说设计力量体系（魔法系统、修炼体系等）。

**核心功能**：
- **软硬魔法光谱**：1-10 分评估，1 为最软（神秘不可解），10 为最硬（规则明确可预测）
- **等级体系**：定义力量等级划分（如练气、筑基、金丹等）
- **限制与代价**：使用力量的限制条件和代价
- **仙侠预设**：内置常见仙侠力量体系模板，可快速定制

### 3. 时间线编辑器

可视化的世界历史时间线管理工具。

**核心功能**：
- **垂直时间线**：从上到下展示历史事件
- **彩色事件分类**：通过颜色区分事件类型

| 事件类型 | 颜色 | 说明 |
|----------|------|------|
| `war` | 红色 | 战争与冲突 |
| `discovery` | 蓝色 | 发现与发明 |
| `founding` | 金色 | 建国与建立 |
| `disaster` | 深红 | 灾难与毁灭 |
| `culture` | 紫色 | 文化与宗教 |
| `politics` | 绿色 | 政治与外交 |

### 4. 一致性检测

AI 自动检测世界观设定之间的逻辑矛盾。

**检测内容**：
- 设定之间的直接矛盾（如地理描述冲突）
- 因果关系不一致（如科技水平与时代背景不匹配）
- 文化逻辑矛盾（如宗教信仰与社会规范冲突）

**输出格式**：
1. 一致性评估（一致/存在矛盾）
2. 具体分析
3. 修改建议（如有矛盾）

## 设定分类

```typescript
type WorldCategory =
  | "geography"     // 地理
  | "history"       // 历史
  | "politics"      // 政治
  | "culture"       // 文化
  | "power_system"  // 力量体系
  | "technology"    // 科技
  | "economy"       // 经济
  | "race"          // 种族
  | "other";        // 其他
```

> 类型定义来源：`src/lib/types.ts` — `WorldCategory` 类型

## 数据模型

```typescript
interface WorldSetting {
  id: string;
  project_id: string;
  name: string;
  category: WorldCategory;
  parent_id: string | null;
  content: string | null;
  rules: string[];
  created_at: string;
  updated_at: string;
}
```

> 类型定义来源：`src/lib/types.ts` — `WorldSetting` 接口

## AI 任务类型

| 任务类型 | 说明 |
|----------|------|
| `world_generate` | 生成世界观设定内容 |
| `world_consistency` | 检测设定间逻辑矛盾 |

## API 端点

### 生成世界观设定

```
POST /api/worldbuilding/generate
```

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `category` | `string` | 是 | 设定类别 |
| `name` | `string` | 是 | 设定名称 |
| `projectId` | `string` | 否 | 项目 ID |

> 实现文件：`src/app/api/worldbuilding/generate/route.ts`

### 一致性检测

```
POST /api/worldbuilding/check-consistency
```

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `settingName` | `string` | 是 | 待检测的设定名称 |
| `settingContent` | `string` | 是 | 待检测的设定内容 |
| `existingSettings` | `WorldSetting[]` | 否 | 已有的其他设定 |

> 实现文件：`src/app/api/worldbuilding/check-consistency/route.ts`

### 时间线事件生成

```
POST /api/worldbuilding/timeline-generate
```

> 实现文件：`src/app/api/worldbuilding/timeline-generate/route.ts`

## 前端组件

```
src/components/worldbuilding/layer-builder.tsx          — 分层构建器
src/components/worldbuilding/power-system-designer.tsx   — 力量体系设计器
src/components/worldbuilding/timeline-editor.tsx         — 时间线编辑器
src/components/worldbuilding/consistency-panel.tsx       — 一致性检测面板
src/components/worldbuilding/setting-editor.tsx          — 设定编辑器
src/components/worldbuilding/setting-card.tsx            — 设定卡片
```

### 组件功能说明

| 组件 | 功能 |
|------|------|
| `layer-builder` | 三层模型的分层构建界面，每层展示对应字段 |
| `power-system-designer` | 力量体系设计，含软硬光谱滑块、等级编辑、限制设定 |
| `timeline-editor` | 垂直时间线，支持添加/编辑/删除事件，彩色分类 |
| `consistency-panel` | 一致性检测结果展示，含问题高亮和修改建议 |
| `setting-editor` | 单个设定的详细编辑器 |
| `setting-card` | 设定的卡片式展示，用于列表浏览 |

## 数据源

```
src/lib/worldbuilding/layer-templates.ts
```

该文件导出：
- `PHYSICAL_LAYER`：物理层模板（5 个字段）
- `CULTURAL_LAYER`：文化层模板（7 个字段）
- `PHILOSOPHICAL_LAYER`：哲学层模板（4 个字段）
- `ALL_LAYERS`：所有层的数组

## 使用示例

**场景**：为奇幻小说构建世界观

1. **分层构建**：
   - 在物理层填写地理概况：大陆分布、气候特征
   - 在文化层设定宗教信仰、社会规范、阶级分工
   - 在哲学层定义核心法则和价值体系

2. **力量体系设计**：
   - 设置软硬魔法光谱为 7（偏硬魔法）
   - 定义等级体系：学徒 → 法师 → 大法师 → 传奇法师
   - 设定限制：每次施法消耗生命力，需要休息恢复

3. **时间线编辑**：
   - 添加建国事件（金色）
   - 添加第一次魔法战争（红色）
   - 添加魔法学院的建立（蓝色）

4. **一致性检测**：
   - 点击"检测一致性"
   - AI 检查所有设定之间的逻辑关系
   - 根据建议修正矛盾之处

## 依赖

| 依赖技能 | 说明 |
|----------|------|
| `ai-models` | 提供 AI 模型调用能力（`world_generate`、`world_consistency` 任务类型） |
