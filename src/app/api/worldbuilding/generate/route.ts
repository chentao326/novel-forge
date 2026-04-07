// ============================================================
// POST /api/worldbuilding/generate - AI World Setting Generation
// ============================================================

import { streamText } from "ai";
import { getModelForTask } from "@/lib/ai/providers";
import { buildWorldGeneratePrompt } from "@/lib/ai/prompts";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { category, name, projectId } = body as {
      category: string;
      name: string;
      projectId?: string;
    };

    if (!category || !name) {
      return new Response(JSON.stringify({ error: "缺少必要参数" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const prompt = buildWorldGeneratePrompt({
      category,
      name,
      genre: "fantasy",
      synopsis: "",
      existingSettings: [],
    });

    const model = getModelForTask("world_generate");

    const result = streamText({
      model,
      prompt,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("[World Generate API Error]", error);
    return new Response(
      JSON.stringify({ error: "AI生成失败，请稍后重试" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
