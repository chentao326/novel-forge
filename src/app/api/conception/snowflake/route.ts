import { streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

export const maxDuration = 60

const STEP_PROMPTS: Record<number, string> = {
  1: `根据以下信息，将故事概念精炼为一句话概括（不超过25个字）。
要求：
- 包含主角、核心冲突和利害关系
- 要有悬念和吸引力
- 直接返回一句话，不要任何解释`,

  2: `根据一句话概括，将其扩展为一段话的故事梗概。
要求：
- 包含三幕结构：开头（建置）、中间（冲突升级）、结尾（解决）
- 5-8句话
- 突出因果逻辑
- 直接返回段落文本，不要任何解释`,

  3: `根据故事梗概，为主要角色创建概要。
请以 JSON 数组格式返回：
[
  {
    "name": "角色名",
    "storyline": "角色故事线（2-3句话）",
    "motivation": "核心动机",
    "goal": "外在目标",
    "conflict": "核心冲突",
    "epiphany": "顿悟/转变"
  }
]
要求：生成2-4个主要角色，直接返回 JSON 数组，不要包含 markdown 代码块标记`,

  4: `根据故事梗概，将其扩展为分幕概要。
请以 JSON 对象格式返回：
{
  "act1": "第一幕概要（建置+触发事件+第一转折点，3-5句话）",
  "act2a": "第二幕上半（上升行动，3-5句话）",
  "act2b": "第二幕下半（中点+下降行动+第二转折点，3-5句话）",
  "act3": "第三幕概要（高潮+结局，3-5句话）"
}
直接返回 JSON 对象，不要包含 markdown 代码块标记`,

  5: `根据角色概要和故事梗概，为每个角色创建详细档案。
请以 JSON 数组格式返回：
[
  {
    "name": "角色名",
    "detailedProfile": "详细角色描述（包括外貌、性格、背景故事，5-8句话）",
    "characterArc": "角色弧线详细描述（从开始到结束的变化过程，3-5句话）",
    "keyRelationships": "关键关系描述（2-3句话）"
  }
]
直接返回 JSON 数组，不要包含 markdown 代码块标记`,

  6: `根据分幕概要，将其扩展为分章大纲。
请以 JSON 数组格式返回：
[
  {
    "chapterNumber": 1,
    "title": "章节标题",
    "summary": "章节概要（3-5句话）",
    "keyEvents": ["关键事件1", "关键事件2"],
    "pov": "视角角色"
  }
]
要求：生成8-15章的大纲，直接返回 JSON 数组，不要包含 markdown 代码块标记`,

  7: `根据分章大纲，为每章生成场景清单。
请以 JSON 数组格式返回：
[
  {
    "chapterNumber": 1,
    "scenes": [
      {
        "sceneNumber": 1,
        "location": "场景地点",
        "characters": ["在场角色"],
        "purpose": "场景目的",
        "description": "场景描述（2-3句话）",
        "emotionTone": "情绪基调"
      }
    ]
  }
]
直接返回 JSON 数组，不要包含 markdown 代码块标记`,
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { step, currentData, synopsis, characters } = body

    if (!step || step < 1 || step > 7) {
      return new Response(
        JSON.stringify({ error: '无效的雪花法步骤（1-7）' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const stepPrompt = STEP_PROMPTS[step]

    let context = ''
    if (synopsis) {
      context += `**故事简介**: ${synopsis}\n\n`
    }

    if (currentData) {
      if (currentData.one_liner) {
        context += `**一句话概括**: ${currentData.one_liner}\n\n`
      }
      if (currentData.paragraph) {
        context += `**故事梗概**: ${currentData.paragraph}\n\n`
      }
      if (currentData.character_summaries) {
        context += `**角色概要**: ${currentData.character_summaries}\n\n`
      }
      if (currentData.act_outlines) {
        context += `**分幕概要**: ${currentData.act_outlines}\n\n`
      }
      if (currentData.character_details) {
        context += `**角色详档**: ${currentData.character_details}\n\n`
      }
      if (currentData.chapter_outlines) {
        context += `**分章大纲**: ${currentData.chapter_outlines}\n\n`
      }
    }

    if (characters && characters.length > 0) {
      context += `**已有角色**:\n`
      for (const char of characters) {
        context += `- ${char.name}（${char.role}）\n`
      }
      context += '\n'
    }

    const result = streamText({
      model: openai('gpt-4o-mini'),
      system: `你是一位专业的小说创作顾问，精通雪花法（Snowflake Method）。你的任务是根据已有信息，帮助作者完成当前步骤的内容创作。所有内容使用中文。`,
      prompt: `${context}${stepPrompt}`,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('Snowflake API error:', error)
    return new Response(
      JSON.stringify({ error: 'AI 辅助生成时发生错误，请稍后重试。' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
