// ============================================================
// POST /api/writing/continue - AI Writing Continuation
// ============================================================

import { streamText } from "ai";
import { getModelForTask } from "@/lib/ai/providers";
import { buildContinuePrompt } from "@/lib/ai/prompts";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { chapterId, content, cursor } = body as {
      chapterId: string;
      content: string;
      cursor?: number;
    };

    if (!content) {
      return new Response(JSON.stringify({ error: "缺少内容" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const prompt = buildContinuePrompt({
      title: "未命名作品",
      genre: "fantasy",
      synopsis: "",
      chapterTitle: `章节 ${chapterId}`,
      existingContent: content,
    });

    const model = getModelForTask("writing_continue");

    const result = streamText({
      model,
      prompt,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("[Writing Continue API Error]", error);
    return new Response(
      JSON.stringify({ error: "AI续写失败，请稍后重试" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
