// ============================================================
// POST /api/characters/generate - AI Character Field Generation
// ============================================================

import { streamText } from "ai";
import { getModelForTask } from "@/lib/ai/providers";
import { buildCharacterGeneratePrompt } from "@/lib/ai/prompts";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { field, characterData, projectId } = body as {
      field: string;
      characterData: Record<string, unknown>;
      projectId?: string;
    };

    if (!field) {
      return new Response(JSON.stringify({ error: "缺少字段名" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const prompt = buildCharacterGeneratePrompt({
      field,
      characterData: characterData as Parameters<typeof buildCharacterGeneratePrompt>[0]["characterData"],
      genre: "fantasy",
      synopsis: "",
    });

    const model = getModelForTask("character_generate");

    const result = streamText({
      model,
      prompt,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("[Character Generate API Error]", error);
    return new Response(
      JSON.stringify({ error: "AI生成失败，请稍后重试" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
