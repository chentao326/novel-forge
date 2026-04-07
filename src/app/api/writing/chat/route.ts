// ============================================================
// POST /api/writing/chat - AI Writing Chat
// ============================================================

import { streamText } from "ai";
import { getModelForTask } from "@/lib/ai/providers";
import { buildChatPrompt } from "@/lib/ai/prompts";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages, chapterId, projectId } = body as {
      messages: Array<{ role: "user" | "assistant"; content: string }>;
      chapterId?: string;
      projectId?: string;
    };

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: "缺少消息内容" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const systemPrompt = buildChatPrompt({
      title: "未命名作品",
      genre: "fantasy",
      synopsis: "",
      chapterTitle: `章节 ${chapterId || "未知"}`,
      chapterContent: "",
      characters: [],
      worldSettings: [],
    });

    const model = getModelForTask("writing_chat");

    const result = streamText({
      model,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("[Writing Chat API Error]", error);
    return new Response(
      JSON.stringify({ error: "AI对话失败，请稍后重试" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
