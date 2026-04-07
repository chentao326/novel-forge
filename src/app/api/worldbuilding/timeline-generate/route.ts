// ============================================================
// POST /api/worldbuilding/timeline-generate - AI Timeline Event Generation
// ============================================================

import { streamText } from "ai";
import { getModelForTask } from "@/lib/ai/providers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { projectId, existingSettings } = body as {
      projectId?: string;
      existingSettings?: Array<{ name: string; content: string }>;
    };

    const settingsInfo = existingSettings
      ?.map((s) => `- ${s.name}：${s.content}`)
      .join("\n") || "暂无";

    const prompt = `你是一位专业的世界观设计师。请根据以下世界观设定，生成10-15个重要的历史事件，构成这个世界的时间线。

已有世界观设定：
${settingsInfo}

请严格按照以下格式输出每一行（用 | 分隔）：
日期标签 | 事件标题 | 事件描述 | 类别

类别只能是以下之一：war（战争）、discovery（发现）、founding（建立）、disaster（灾难）、cultural（文化）、political（政治）、other（其他）

示例格式：
纪元前1000年 | 第一帝国的建立 | 人类首次统一大陆，建立中央集权帝国 | founding
纪元前500年 | 大裂变之战 | 魔法失控导致大陆分裂，形成现在的地理格局 | disaster
纪元元年 | 魔法学院创立 | 七位大法师联合创办第一所魔法教育机构 | discovery

请生成10-15个事件，按时间顺序排列，涵盖不同类别。只输出格式化的事件行，不要添加任何解释。`;

    const model = getModelForTask("world_generate");

    const result = streamText({
      model,
      prompt,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("[Timeline Generate API Error]", error);
    return new Response(
      JSON.stringify({ error: "时间线生成失败，请稍后重试" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
