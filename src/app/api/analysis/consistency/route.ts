import { streamText } from "ai";
import { getModelForTask } from "@/lib/ai/providers";

export async function POST(request: Request) {
  try {
    const { chapters, characters, worldSettings, projectId } = await request.json();

    if (!chapters || chapters.length === 0) {
      return new Response(
        JSON.stringify({ error: "缺少章节数据" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const model = getModelForTask("analyze");

    // Build character info
    const characterInfo = (characters || [])
      .map(
        (c: { name: string; role: string; appearance: string | null; background: string | null; personality_traits: string[]; speech_style: string | null }) =>
          `- ${c.name}（${c.role}）: 外貌=${c.appearance || "未设定"}, 背景=${c.background || "未设定"}, 性格=${c.personality_traits?.join(",") || "未设定"}, 说话风格=${c.speech_style || "未设定"}`
      )
      .join("\n");

    // Build world settings info
    const worldInfo = (worldSettings || [])
      .map(
        (w: { name: string; category: string; content: string | null; rules: string[] }) =>
          `- 【${w.name}】(${w.category}): ${w.content || "无详细内容"}, 规则=${w.rules?.join(";") || "无"}`
      )
      .join("\n");

    // Build chapter content (limited to avoid token overflow)
    const chapterContent = chapters
      .map(
        (ch: { title: string; content: string; sort_order: number }, index: number) => {
          const plain = (ch.content || "").replace(/<[^>]+>/g, "");
          const preview = plain.slice(0, 600);
          return `第${index + 1}章「${ch.title}」:\n${preview}`;
        }
      )
      .join("\n\n---\n\n");

    const systemPrompt = `你是一位专业的中文小说编辑，专门负责检查小说的一致性问题。请仔细检查以下小说内容，找出所有可能的不一致之处。

请按以下四个类别分别检查：

1. **角色一致性**：检查角色名字是否统一、外貌描写是否前后矛盾、性格特征是否一致、说话风格是否前后一致
2. **时间线逻辑**：检查事件发生的先后顺序是否合理、时间跨度是否矛盾、季节/日期是否前后一致
3. **世界观规则**：检查是否违反了已设定的世界观规则、力量体系/科技水平是否前后一致
4. **设定引用**：检查提到的地点、物品、组织等是否在世界设定中存在、引用是否准确

请严格以JSON格式返回，格式如下：
{
  "character": [
    { "description": "问题描述", "severity": "warning或error", "location": "出现位置（章节名或段落描述）" }
  ],
  "timeline": [
    { "description": "问题描述", "severity": "warning或error", "location": "出现位置" }
  ],
  "world": [
    { "description": "问题描述", "severity": "warning或error", "location": "出现位置" }
  ],
  "reference": [
    { "description": "问题描述", "severity": "warning或error", "location": "出现位置" }
  ]
}

注意：
- severity 为 "error" 表示严重矛盾，"warning" 表示可能的问题
- 如果某个类别没有发现问题，对应数组为空 []
- location 尽量具体到章节名
- 只输出JSON，不要添加任何其他文字或markdown标记`;

    const result = streamText({
      model,
      system: systemPrompt,
      prompt: `请检查以下小说的一致性问题：

## 角色设定
${characterInfo || "暂无角色设定"}

## 世界观设定
${worldInfo || "暂无世界观设定"}

## 章节内容
${chapterContent}`,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Consistency check API error:", error);
    return new Response(
      JSON.stringify({ error: "处理请求时出错" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
