import { streamText } from "ai";
import { getModelForTask } from "@/lib/ai/providers";

export async function POST(request: Request) {
  try {
    const { chapters, projectId } = await request.json();

    if (!chapters || chapters.length === 0) {
      return new Response(
        JSON.stringify({ error: "缺少章节数据" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const model = getModelForTask("analyze");

    // Build chapter summaries for context
    const chapterSummaries = chapters
      .map(
        (ch: { title: string; content: string; word_count: number }, index: number) => {
          const contentPreview = (ch.content || "").replace(/<[^>]+>/g, "").slice(0, 800);
          return `第${index + 1}章「${ch.title}」(${ch.word_count}字):\n${contentPreview}`;
        }
      )
      .join("\n\n---\n\n");

    const systemPrompt = `你是一位专业的中文小说编辑和叙事节奏分析师。请分析以下小说章节的叙事节奏。

请从以下角度分析每个章节的节奏：
1. **节奏强度**：评估每个章节的叙事节奏强度（0-100分），考虑对话密度、动作场景、情感张力、冲突程度等因素
2. **节奏变化**：分析章节之间的节奏变化是否合理
3. **高潮与低谷**：识别故事的高潮和低谷位置
4. **整体节奏曲线**：评估整体节奏曲线是否符合叙事规律
5. **改进建议**：针对节奏不合理的章节给出具体改进建议

请严格以JSON格式返回，格式如下：
{
  "summary": "整体节奏分析总结（2-3句话）",
  "scores": [
    { "chapter": "章节标题", "score": 85, "reason": "评分理由" }
  ],
  "suggestions": [
    { "chapter": "章节标题", "suggestion": "具体改进建议" }
  ]
}

注意：
- scores 数组中的 score 必须是 0-100 的整数
- suggestions 数组只包含需要改进的章节
- 如果所有章节节奏都合理，suggestions 可以为空数组
- 只输出JSON，不要添加任何其他文字或markdown标记`;

    const result = streamText({
      model,
      system: systemPrompt,
      prompt: `请分析以下小说章节的叙事节奏：\n\n---\n${chapterSummaries}\n---`,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Pacing analysis API error:", error);
    return new Response(
      JSON.stringify({ error: "处理请求时出错" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
