import { streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { keywords, genre, mood, references, synopsis, characters, worldSettings } = body

    const openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const genreLabel: Record<string, string> = {
      fantasy: '奇幻',
      romance: '言情',
      scifi: '科幻',
      mystery: '悬疑',
      urban: '都市',
      historical: '历史',
      other: '其他',
    }

    const systemPrompt = `你是一位资深的小说创意顾问，擅长帮助作者激发灵感、构思故事概念。
你的任务是根据用户提供的条件，生成3-5个独特且引人入胜的故事概念。

每个故事概念必须包含以下信息，以 JSON 数组格式返回：
[
  {
    "title": "故事标题建议",
    "coreConflict": "核心冲突描述（2-3句话）",
    "themeDirection": "主题方向（1-2句话）",
    "synopsis": "简短故事梗概（3-5句话）",
    "targetAudience": "目标读者",
    "uniqueSellingPoint": "独特卖点"
  }
]

要求：
1. 每个概念必须有明显的差异化，不要重复
2. 核心冲突要有张力和戏剧性
3. 主题方向要有深度和思考价值
4. 标题要吸引人且符合类型特征
5. 所有内容使用中文
6. 直接返回 JSON 数组，不要包含 markdown 代码块标记`

    let userPrompt = `请根据以下条件生成故事概念：

**关键词**: ${keywords || '无特定关键词'}
**类型**: ${genreLabel[genre] || genre || '不限'}
**情绪基调**: ${mood || '不限'}
**参考作品**: ${references || '无'}

`

    if (synopsis) {
      userPrompt += `**已有简介**: ${synopsis}\n\n`
    }

    if (characters && characters.length > 0) {
      userPrompt += `**已有角色**:\n`
      for (const char of characters) {
        userPrompt += `- ${char.name}（${char.role}）: ${char.want || '无特定目标'}\n`
      }
      userPrompt += '\n'
    }

    if (worldSettings && worldSettings.length > 0) {
      userPrompt += `**世界观设定**:\n`
      for (const setting of worldSettings) {
        userPrompt += `- ${setting.name}: ${typeof setting.content === 'string' ? setting.content : JSON.stringify(setting.content)}\n`
      }
      userPrompt += '\n'
    }

    userPrompt += `请生成3-5个风格各异的故事概念，直接返回 JSON 数组。`

    const result = streamText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      prompt: userPrompt,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('Brainstorm API error:', error)
    return new Response(
      JSON.stringify({ error: '生成灵感时发生错误，请稍后重试。' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
