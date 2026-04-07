import { streamText } from "ai";
import { getModelForTask } from "@/lib/ai/providers";

export async function POST(request: Request) {
  try {
    const { characterId, question, projectId, systemPrompt } = await request.json();

    if (!characterId || !question || !projectId) {
      return new Response(
        JSON.stringify({ error: "缺少必要参数" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const model = getModelForTask("character_interview");

    const result = streamText({
      model,
      system: systemPrompt || "你是一个小说角色，请以角色的身份回答问题。",
      prompt: question,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Character interview API error:", error);
    return new Response(
      JSON.stringify({ error: "处理请求时出错" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
