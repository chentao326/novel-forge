import { streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { GENRE_LABELS } from '@/lib/types'
import type { Genre } from '@/lib/types'

export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { synopsis, genre, existingPoints, projectId } = body

    if (!synopsis) {
      return new Response(
        JSON.stringify({ error: '请提供故事简介' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const genreLabel = genre ? GENRE_LABELS[genre as Genre] || genre : '未指定'

    let existingInfo = ''
    if (existingPoints && Array.isArray(existingPoints) && existingPoints.length > 0) {
      existingInfo = `\n\n已有的情感节点：\n${existingPoints
        .map((p: { position: number; intensity: number; label: string }) =>
          `- 位置 ${p.position}%，强度 ${p.intensity}，标签："${p.label}"`
        )
        .join('\n')}\n\n请在已有节点的基础上进行优化和补充。`
    }

    const systemPrompt = `你是一位专业的小说情感设计顾问，擅长规划读者的情感体验曲线。
你的任务是根据故事简介和类型，建议一条最优的读者情感曲线。

请严格按照以下 JSON 数组格式返回，不要包含 markdown 代码块标记：
[
  {
    "position": 5,
    "intensity": -1,
    "label": "开篇引入"
  }
]

参数说明：
- position: 0-100 的整数，表示故事进度百分比
- intensity: -5 到 5 的整数，负数表示紧张/悲伤/恐惧，正数表示喜悦/满足/兴奋
- label: 该情感节点的简短描述（2-6个字）

设计原则：
1. 曲线应该有起伏变化，避免平淡
2. 根据小说类型调整情感曲线特征（如恐怖小说偏负面，喜剧偏正面）
3. 在关键情节转折处设置情感变化
4. 高潮部分应该有最强的情感冲击
5. 结局的情感基调要与故事主题一致
6. 建议包含 8-15 个情感节点
7. 所有标签使用中文
8. 直接返回 JSON 数组，不要包含任何其他文字`

    const userPrompt = `故事简介：${synopsis}\n\n小说类型：${genreLabel}${existingInfo}\n\n请为这个故事设计一条理想的读者情感曲线。`

    const result = streamText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      prompt: userPrompt,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('Emotion curve suggest API error:', error)
    return new Response(
      JSON.stringify({ error: '生成情感曲线建议时发生错误，请稍后重试。' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
