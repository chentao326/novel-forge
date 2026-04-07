// ============================================================
// POST /api/worldbuilding/check-consistency - AI Consistency Check
// ============================================================

import { streamText } from "ai";
import { getModelForTask } from "@/lib/ai/providers";
import { buildConsistencyPrompt } from "@/lib/ai/prompts";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { settingId, content, projectId } = body as {
      settingId: string;
      content: string;
      projectId?: string;
    };

    if (!settingId || !content) {
      return new Response(JSON.stringify({ error: "缺少必要参数" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const prompt = buildConsistencyPrompt({
      settingName: settingId,
      settingContent: content,
      existingSettings: [],
      synopsis: "",
    });

    const model = getModelForTask("world_consistency");

    const result = streamText({
      model,
      prompt,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("[World Consistency API Error]", error);
    return new Response(
      JSON.stringify({ error: "一致性检查失败，请稍后重试" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
