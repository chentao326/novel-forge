import { streamText } from "ai";
import { getModelForTask } from "@/lib/ai/providers";

export async function POST(request: Request) {
  try {
    const { text, projectId } = await request.json();

    if (!text) {
      return new Response(
        JSON.stringify({ error: "缺少文本内容" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const model = getModelForTask("analyze");

    const systemPrompt = `你是一位专业的中文文学编辑和写作分析师。请对以下文本进行详细的写作风格分析。

请从以下几个方面进行分析：
1. **整体风格**：描述文本的整体写作风格和特点
2. **节奏感**：分析文本的叙事节奏（快节奏/慢节奏/变化丰富）
3. **描写手法**：分析使用的描写手法（环境、心理、动作、对话等）
4. **语言特色**：分析用词特点、句式结构、修辞手法
5. **优点**：指出文本的写作优点
6. **改进建议**：给出具体的改进建议

请用中文回答，语言专业但易于理解。`;

    const result = streamText({
      model,
      system: systemPrompt,
      prompt: `请分析以下文本的写作风格：\n\n---\n${text}\n---`,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Style analysis API error:", error);
    return new Response(
      JSON.stringify({ error: "处理请求时出错" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
