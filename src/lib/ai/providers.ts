import { createOpenAI } from '@ai-sdk/openai'
import type { LanguageModel } from 'ai'

// ============================================================
// DeepSeek Provider
// ============================================================
function createDeepSeekProvider() {
  return createOpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: 'https://api.deepseek.com/v1',
  })
}

// ============================================================
// Qwen Provider (通过 OpenAI 兼容接口)
// ============================================================
function createQwenProvider() {
  return createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  })
}

// ============================================================
// OpenAI Provider (直接使用)
// ============================================================
function createOpenAIProvider() {
  return createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

// ============================================================
// 根据任务类型选择合适的模型
// ============================================================
function getModelForTask(task: string): LanguageModel {
  const deepseek = createDeepSeekProvider()

  switch (task) {
    case 'brainstorm':
      return deepseek('deepseek-chat')
    case 'outline':
      return deepseek('deepseek-chat')
    case 'continue':
    case 'writing_continue':
      return deepseek('deepseek-chat')
    case 'rewrite':
    case 'writing_rewrite':
      return deepseek('deepseek-chat')
    case 'analyze':
      return deepseek('deepseek-chat')
    case 'character_generate':
      return deepseek('deepseek-chat')
    case 'writing_chat':
      return deepseek('deepseek-chat')
    case 'world_generate':
      return deepseek('deepseek-chat')
    case 'world_consistency':
      return deepseek('deepseek-chat')
    default:
      return deepseek('deepseek-chat')
  }
}

export { createDeepSeekProvider, createQwenProvider, getModelForTask }
