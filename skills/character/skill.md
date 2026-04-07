# 角色塑造 (Character Development)

> 深度角色创建与管理技能

## 功能描述

角色塑造技能提供全方位的角色创建、管理和深度开发功能。包含角色档案管理（含核心创伤蓝图）、关系图谱可视化、弧线追踪和 AI 角色访谈四大子功能，帮助作者打造立体、有深度的角色。

## 子功能

### 1. 角色档案

完整的角色信息管理，包含基础信息和核心创伤蓝图。

#### 基础信息字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | `string` | 角色名称 |
| `role` | `CharacterRole` | 角色定位（主角/反派/配角/龙套） |
| `appearance` | `string` | 外貌描述 |
| `background` | `string` | 背景故事 |
| `personality_traits` | `string[]` | 性格特征标签列表 |
| `speech_style` | `string` | 说话风格 |
| `body_language` | `string` | 肢体语言习惯 |
| `decision_style` | `string` | 决策方式 |

#### 核心创伤蓝图

基于心理学创伤理论的角色内在驱动模型，揭示角色行为的深层原因：

```
创伤 (core_wound)
  |
  v
谎言 (lie) — 角色因创伤而相信的错误信念
  |
  v
渴望 (want) — 角色表面上追求的目标
  |
  v
需求 (need) — 角色真正需要的东西
  |
  v
恐惧 (fear) — 角色最害怕的事情
  |
  v
铠甲 (armor) — 角色用来保护自己的外在表现
```

| 字段 | 说明 | 示例 |
|------|------|------|
| `core_wound` | 核心创伤：角色内心最深的伤痛 | "童年被父母抛弃" |
| `lie` | 相信的谎言：因创伤而相信的错误信念 | "没有人会真心对我好" |
| `want` | 渴望：表面上追求的目标 | "获得权力和财富" |
| `need` | 需求：真正需要的东西 | "学会信任和接受爱" |
| `fear` | 恐惧：最害怕的事情 | "再次被抛弃" |
| `armor` | 铠甲：保护自己的外在表现 | "冷漠疏离，拒绝亲近" |

### 2. 关系图谱

基于 SVG 的可视化角色关系网络。

**关系类型**：

| 类型 | 说明 |
|------|------|
| `师徒` | 师父与徒弟的关系 |
| `恋人` | 恋爱关系 |
| `宿敌` | 命中注定的敌人 |
| `朋友` | 友情关系 |
| `亲人` | 血缘或法律上的亲属关系 |
| `同盟` | 基于利益结盟的关系 |
| `对手` | 竞争或对抗关系 |

**关系属性**：

```typescript
interface CharacterRelationship {
  id: string;
  project_id: string;
  character_a_id: string;   // 角色 A 的 ID
  character_b_id: string;   // 角色 B 的 ID
  type: string;             // 关系类型
  description: string;      // 关系描述
  dynamics: string;         // 关系动态，如 "权力失衡"、"互相依赖"
  evolution: string;        // 关系在故事中的演变
}
```

> 类型定义来源：`src/stores/relationship-store.ts` — `CharacterRelationship` 接口

### 3. 弧线可视化

角色成长弧线的可视化展示。

**弧线类型**：

| 类型 | 标签 | 说明 |
|------|------|------|
| `positive` | 正向成长 | 角色从缺陷走向完善 |
| `flat` | 平稳 | 角色保持不变，但改变了周围世界 |
| `negative` | 堕落 | 角色从善走向恶或从完整走向破碎 |

**弧线字段**：

| 字段 | 类型 | 说明 |
|------|------|------|
| `arc_type` | `ArcType` | 弧线类型（positive/flat/negative） |
| `arc_description` | `string` | 弧线描述 |
| `turning_points` | `string[]` | 关键转折点列表 |

**可视化特性**：
- S 曲线展示角色成长轨迹
- 转折点在曲线上标记
- 支持多条弧线对比查看

### 4. AI 角色访谈

以角色第一人称视角回答问题，帮助作者深入了解角色内心。

**功能特性**：
- AI 以角色身份回答用户提问
- 推荐问题列表（基于角色档案自动生成）
- 访谈记录可保存到角色档案

## 角色类型

```typescript
type CharacterRole =
  | "protagonist"  // 主角
  | "antagonist"   // 反派
  | "supporting"   // 配角
  | "minor";       // 龙套
```

> 类型定义来源：`src/lib/types.ts` — `CharacterRole` 类型

## 数据模型

```typescript
interface Character {
  id: string;
  project_id: string;
  name: string;
  role: CharacterRole;
  appearance: string | null;
  background: string | null;
  // 核心创伤蓝图
  core_wound: string | null;
  lie: string | null;
  want: string | null;
  need: string | null;
  fear: string | null;
  armor: string | null;
  // 个性与声音
  personality_traits: string[];
  speech_style: string | null;
  body_language: string | null;
  decision_style: string | null;
  // 弧线
  arc_type: ArcType;
  arc_description: string | null;
  turning_points: string[];
  created_at: string;
  updated_at: string;
}
```

> 类型定义来源：`src/lib/types.ts` — `Character` 接口

## AI 任务类型

`character_generate`

## API 端点

### 角色字段生成

```
POST /api/characters/generate
```

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `field` | `string` | 是 | 要生成的字段名 |
| `characterData` | `Record<string, unknown>` | 否 | 已有的角色数据 |
| `projectId` | `string` | 否 | 项目 ID |

**可生成的字段**：

| 字段 | 说明 |
|------|------|
| `core_wound` | 核心创伤 |
| `lie` | 相信的谎言 |
| `want` | 渴望 |
| `need` | 需求 |
| `fear` | 恐惧 |
| `armor` | 铠甲 |
| `personality_traits` | 性格特征 |
| `speech_style` | 说话风格 |
| `body_language` | 肢体语言习惯 |
| `decision_style` | 决策方式 |
| `arc_description` | 成长弧线描述 |
| `turning_points` | 关键转折点 |
| `appearance` | 外貌描述 |
| `background` | 背景故事 |

> 实现文件：`src/app/api/characters/generate/route.ts`

### 角色访谈

```
POST /api/characters/interview
```

**请求参数**：

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `characterId` | `string` | 是 | 角色 ID |
| `question` | `string` | 是 | 访谈问题 |

> 实现文件：`src/app/api/characters/interview/route.ts`

## 前端组件

```
src/components/characters/character-editor.tsx        — 角色编辑器
src/components/characters/character-card.tsx           — 角色卡片
src/components/characters/relationship-graph.tsx       — 关系图谱
src/components/characters/arc-visualization.tsx        — 弧线可视化
src/components/characters/character-interview.tsx      — 角色访谈
```

### 组件功能说明

| 组件 | 功能 |
|------|------|
| `character-editor` | 角色完整档案编辑，含基础信息、创伤蓝图、弧线设置 |
| `character-card` | 角色的卡片式概览展示 |
| `relationship-graph` | SVG 关系网络图，支持拖拽、缩放、连线编辑 |
| `arc-visualization` | S 曲线弧线图，支持转折点标记和多角色对比 |
| `character-interview` | AI 访谈界面，含推荐问题和对话历史 |

## 使用示例

**场景 1：创建主角档案**

1. 打开角色编辑器，填写名称"林墨"和角色定位"主角"
2. 点击核心创伤蓝图区域的"AI 生成"按钮
3. AI 根据已有信息生成完整的创伤蓝图：
   - 核心创伤："幼年目睹家族被灭门"
   - 谎觉："力量是唯一的依靠"
   - 渴望："成为最强者，不再被人欺负"
   - 需求："学会信任他人，接受帮助"
   - 恐惧："无力保护身边的人"
   - 铠甲："冷酷无情，独来独往"
4. 审核并微调后保存

**场景 2：AI 角色访谈**

1. 选择角色"林墨"，打开角色访谈面板
2. 从推荐问题中选择："你最害怕失去什么？"
3. AI 以林墨的口吻回答："我...没有什么好失去的。至少我曾经这么以为。但如果要说最害怕的...是再一次站在废墟前，什么都做不了。"
4. 继续追问或切换问题
5. 访谈记录自动保存到角色档案

**场景 3：关系图谱**

1. 在关系图谱中添加角色"林墨"和"苏婉"
2. 设置关系类型为"恋人"
3. 填写关系动态："互相吸引但互不信任"
4. 填写关系演变："从敌对到理解，从理解到信任"
5. 图谱中显示连线，颜色和粗细表示关系类型和强度

## 依赖

| 依赖技能 | 说明 |
|----------|------|
| `ai-models` | 提供 AI 模型调用能力（`character_generate` 任务类型） |
| `worldbuilding` | 角色背景与世界观设定保持一致，访谈时参考世界观信息 |
