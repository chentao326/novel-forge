import { streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { GENRE_LABELS } from '@/lib/types'
import type { Genre } from '@/lib/types'

export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { text, title, genre, projectId } = body

    if (!text && !title) {
      return new Response(
        JSON.stringify({ error: '请提供小说文本或小说标题' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const genreLabel = genre ? GENRE_LABELS[genre as Genre] || genre : '未指定'

    const systemPrompt = `你是一位资深的小说分析师，擅长拆解畅销小说的成功要素。
你的任务是对用户提供的小说内容进行分析，从多个维度拆解其成功之处。

请严格按照以下 JSON 格式返回分析结果，不要包含 markdown 代码块标记：
{
  "核心结构": "分析该小说使用的故事结构（如三幕式、英雄之旅、起承转合等），说明其结构特点和优势",
  "节奏分析": "分析小说的节奏模式，描述故事的高潮和低谷分布，节奏变化的特点",
  "爽点分布": "列出小说中关键的'爽点'（让读者感到满足、兴奋、震撼的时刻），分析这些爽点为何有效",
  "角色设计": "分析主要角色的原型和成长弧线，角色之间的关系设计",
  "世界观特色": "分析小说世界观设定的独特之处和吸引力",
  "写作技巧": "分析作者使用的显著写作技巧（如伏笔、悬念、视角切换、象征手法等）",
  "可借鉴元素": "总结其他创作者可以从这部作品中学习和借鉴的具体元素和技巧"
}

分析要求：
1. 每个维度的分析要具体、深入，避免空泛
2. 结合具体情节和细节进行说明
3. 突出这部作品区别于同类作品的独特之处
4. 所有内容使用中文
5. 如果只提供了标题，基于你对该作品的了解进行分析
6. 直接返回 JSON 对象，不要包含任何其他文字`

    let userPrompt = ''

    if (text) {
      userPrompt = `请分析以下小说内容：\n\n类型：${genreLabel}\n\n小说内容：\n---\n${text.slice(0, 5000)}\n---`
    } else {
      userPrompt = `请分析小说《${title}》\n\n类型：${genreLabel}\n\n请基于你对这部作品的了解，从多个维度进行深入分析。`
    }

    const result = streamText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      prompt: userPrompt,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('Bestseller analyze API error:', error)
    return new Response(
      JSON.stringify({ error: '分析过程中发生错误，请稍后重试。' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
