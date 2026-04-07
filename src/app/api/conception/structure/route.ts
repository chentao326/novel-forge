import { streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { FRAMEWORKS } from '@/lib/conception/frameworks'
import type { StructureFramework } from '@/lib/types'

export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { framework, synopsis, characters } = body

    if (!framework || !synopsis) {
      return new Response(
        JSON.stringify({ error: '缺少必要参数：framework 和 synopsis' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const frameworkData = FRAMEWORKS[framework as StructureFramework]
    if (!frameworkData) {
      return new Response(
        JSON.stringify({ error: '无效的故事结构框架' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const beatsInfo = frameworkData.beats
      .map((b, i) => `${i + 1}. ${b.name}（位置: ${b.position}%）- ${b.description}`)
      .join('\n')

    const systemPrompt = `你是一位精通故事结构的小说创作顾问。
你的任务是根据用户选择的故事框架和已有的故事简介，为每个节拍生成具体的内容。

请以 JSON 数组格式返回，每个元素对应一个节拍：
[
  {
    "beatIndex": 0,
    "name": "节拍名称",
    "content": "该节拍的具体内容描述（3-5句话，结合故事的具体情节）",
    "characters": ["涉及的角色名称"],
    "emotionTone": "该节拍的情绪基调",
    "keyEvents": ["关键事件1", "关键事件2"]
  }
]

要求：
1. 每个节拍的内容必须与故事简介紧密关联
2. 节拍之间要有逻辑递进关系
3. 角色安排要合理，注意角色弧线的发展
4. 情绪基调要与框架定义的 emotion_tone 一致
5. 所有内容使用中文
6. 直接返回 JSON 数组，不要包含 markdown 代码块标记`

    let userPrompt = `**故事简介**: ${synopsis}\n\n`
    userPrompt += `**选择框架**: ${frameworkData.name}\n`
    userPrompt += `**框架说明**: ${frameworkData.description}\n\n`
    userPrompt += `**框架节拍**:\n${beatsInfo}\n\n`

    if (characters && characters.length > 0) {
      userPrompt += `**已有角色**:\n`
      for (const char of characters) {
        userPrompt += `- ${char.name}（${char.role}）: 目标-${char.want || '无'}，需求-${char.need || '无'}，恐惧-${char.fear || '无'}\n`
      }
      userPrompt += '\n'
    }

    userPrompt += `请为每个节拍生成具体的故事内容。`

    const result = streamText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      prompt: userPrompt,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('Structure API error:', error)
    return new Response(
      JSON.stringify({ error: '生成结构内容时发生错误，请稍后重试。' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
