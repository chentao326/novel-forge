import { streamText } from "ai";
import { getModelForTask } from "@/lib/ai/providers";

export async function POST(request: Request) {
  try {
    const { projectId, chapters } = await request.json();

    if (!projectId || !chapters || chapters.length === 0) {
      return new Response(
        JSON.stringify({ error: "缺少必要参数" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const model = getModelForTask("analyze");

    // Build chapter summaries for context
    const chapterSummaries = chapters
      .slice(0, 20) // Limit to first 20 chapters for context
      .map(
        (ch: { title: string; content: string }, i: number) =>
          `第${i + 1}章「${ch.title}」：${ch.content.slice(0, 300)}...`
      )
      .join("\n\n");

    const systemPrompt = `你是一位专业的小说编辑，擅长发现和分析故事中的伏笔。请根据提供的章节内容，分析潜在的伏笔和铺垫。

请从以下角度分析：
1. **已埋下的伏笔**：找出文本中可能作为伏笔的细节、暗示或铺垫
2. **建议添加的伏笔**：根据故事走向，建议可以在哪些地方添加伏笔
3. **伏笔回收建议**：对于已有的伏笔，建议在后续章节中如何回收

每个伏笔建议请包含：
- 伏笔内容描述
- 所在章节
- 建议回收的章节或位置
- 伏笔的重要性（高/中/低）`;

    const result = streamText({
      model,
      system: systemPrompt,
      prompt: `请分析以下小说内容中的伏笔机会：\n\n---\n${chapterSummaries}\n---`,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Foreshadowing suggest API error:", error);
    return new Response(
      JSON.stringify({ error: "处理请求时出错" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
