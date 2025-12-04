import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

// 验证API密钥
if (!process.env.GEMINI_API_KEY) {
  console.warn('WARNING: GEMINI_API_KEY is not set in environment variables')
}

// 辅助函数：将消息历史转换为 Gemini 格式
function convertMessagesToGeminiFormat(
  systemPrompt: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): string {
  let prompt = systemPrompt + '\n\n'
  
  for (const msg of conversationHistory) {
    if (msg.role === 'user') {
      prompt += `User: ${msg.content}\n\n`
    } else {
      prompt += `Assistant: ${msg.content}\n\n`
    }
  }
  
  return prompt
}

export async function processDream(rawText: string): Promise<{ title: string; content: string }> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    
    const systemPrompt = 'You are a professional dream analyst and recorder. Please organize the user\'s dream description into beautiful prose, extract a concise title (no more than 10 words), and structure it as a dream record. Maintain the original meaning, but make the text more fluid and poetic.'
    
    const prompt = `${systemPrompt}\n\nUser's dream: ${rawText}`
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text() || ''
    
    // 尝试提取标题和内容
    const lines = text.split('\n').filter(line => line.trim())
    let title = lines[0]?.replace(/^#+\s*/, '').trim() || 'My Dream'
    let content = text

    // 如果第一行看起来像标题，分离它
    if (title.length < 30 && lines.length > 1) {
      content = lines.slice(1).join('\n')
    }

    // 如果标题太长，截取
    if (title.length > 20) {
      title = title.substring(0, 20) + '...'
    }

    return { title, content }
  } catch (error) {
    console.error('Gemini API error:', error)
    // 如果API失败，返回原始内容
    return {
      title: 'My Dream',
      content: rawText,
    }
  }
}

// AI对话回复
export async function getAIResponse(
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    
    const systemPrompt = 'You are a warm and empathetic dream listener. When users share their dreams, respond with a gentle and encouraging tone. You can:\n1. Express understanding and empathy\n2. Ask gentle questions to help users describe their dreams more deeply\n3. Provide positive feedback\n4. Reply with concise, warm language (no more than 50 words)\n\nRemember: Your goal is to help users better record and express their dreams, not to analyze or interpret them.'
    
    let prompt = convertMessagesToGeminiFormat(systemPrompt, conversationHistory)
    prompt += 'Assistant:'
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text() || ''
    
    // 清理响应，移除可能的 "Assistant:" 前缀
    const cleanedText = text.replace(/^Assistant:\s*/i, '').trim()
    
    return cleanedText || 'I understand how you feel, please continue sharing...'
  } catch (error) {
    console.error('Gemini API error:', error)
    return 'I\'m here listening, please continue sharing your dream...'
  }
}

// 生成温暖语调的梦境总结
export async function generateDreamSummary(
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  userInput?: string
): Promise<string> {
  try {
    // 优先使用直接传入的用户输入，否则从对话历史中提取
    const allUserInput = userInput || conversationHistory
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content)
      .join('\n\n')

    if (!allUserInput.trim()) {
      throw new Error('No user input provided')
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    
    const systemPrompt = 'You are a dream recorder. Read ALL of the user\'s input and create a clear, concise summary of their dream. Only summarize what the user said - do not add any extra information, interpretations, or embellishments. Keep it simple and direct.'
    
    const prompt = `${systemPrompt}\n\nUser's dream input:\n\n${allUserInput}\n\nSummary:`

    console.log('Calling Gemini API to generate summary...')
    const result = await model.generateContent(prompt)
    const response = await result.response
    const summary = response.text()?.trim() || ''
    
    console.log('Gemini API response received, summary length:', summary.length)
    
    if (!summary) {
      console.error('Empty summary from Gemini API')
      throw new Error('Empty summary generated from Gemini')
    }

    // 验证摘要不是原始输入的简单重复
    const rawInput = userInput || conversationHistory
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content)
      .join('\n\n')
    
    if (summary === rawInput.trim()) {
      throw new Error('Summary is identical to raw input - AI did not process it')
    }

    console.log('Successfully generated AI summary, length:', summary.length)
    return summary
  } catch (error) {
    console.error('Gemini API error in generateDreamSummary:', error)
    // 不要返回原始输入作为fallback，而是抛出错误让调用者处理
    throw new Error(`Failed to generate dream summary: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
