import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

export async function processDream(rawText: string): Promise<{ title: string; content: string }> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: '你是一个专业的梦境分析师和记录者。请将用户描述的梦境整理成优美的文字，提取一个简洁的标题（不超过10个字），并整理成结构化的梦境记录。保持原意，但让文字更加流畅和富有诗意。',
        },
        {
          role: 'user',
          content: rawText,
        },
      ],
      temperature: 0.7,
    })

    const result = response.choices[0]?.message?.content || ''
    
    // 尝试提取标题和内容
    const lines = result.split('\n').filter(line => line.trim())
    let title = lines[0]?.replace(/^#+\s*/, '').trim() || '我的梦境'
    let content = result

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
    console.error('OpenAI API error:', error)
    // 如果API失败，返回原始内容
    return {
      title: '我的梦境',
      content: rawText,
    }
  }
}

