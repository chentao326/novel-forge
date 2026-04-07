// ============================================================
// POST /api/writing/rewrite - AI Text Rewriting
// ============================================================

import { streamText } from "ai";
import { getModelForTask } from "@/lib/ai/providers";
import { buildRewritePrompt } from "@/lib/ai/prompts";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, mode, context } = body as {
      text: string;
      mode: "expand" | "condense" | "describe" | "tone";
      context?: {
        genre?: string;
        chapterTitle?: string;
      };
    };

    if (!text || !mode) {
      return new Response(JSON.stringify({ error: "缺少必要参数" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const prompt = buildRewritePrompt({
      text,
      mode,
      genre: (context?.genre as "fantasy") || "fantasy",
    });

    const model = getModelForTask("writing_rewrite");

    const result = streamText({
      model,
      prompt,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("[Writing Rewrite API Error]", error);
    return new Response(
      JSON.stringify({ error: "AI改写失败，请稍后重试" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
