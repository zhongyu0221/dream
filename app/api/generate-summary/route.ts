import { NextRequest, NextResponse } from 'next/server'
import { generateDreamSummary } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { conversationHistory, userInput } = body

    if (!conversationHistory || !Array.isArray(conversationHistory)) {
      return NextResponse.json({ error: 'Invalid conversation history' }, { status: 400 })
    }

    // 检查是否有用户输入
    const hasUserInput = userInput?.trim() || conversationHistory.some((msg: any) => msg.role === 'user' && msg.content?.trim())
    if (!hasUserInput) {
      return NextResponse.json({ error: 'No user input provided' }, { status: 400 })
    }

    console.log('Generating summary for user input length:', userInput?.length || conversationHistory.filter((msg: any) => msg.role === 'user').length)

    // Pass both conversationHistory and userInput to the function
    const summary = await generateDreamSummary(conversationHistory, userInput)
    
    if (!summary || !summary.trim()) {
      console.error('Empty summary generated')
      return NextResponse.json(
        { error: 'Empty summary generated', message: 'Gemini returned an empty response' },
        { status: 500 }
      )
    }

    console.log('Summary generated successfully, length:', summary.length)
    return NextResponse.json({ summary })
  } catch (error) {
    console.error('Error generating summary:', error)
    
    // 提供更详细的错误信息
    let errorMessage = 'Unknown error'
    if (error instanceof Error) {
      errorMessage = error.message
      // 检查是否是API密钥问题
      if (error.message.includes('API key') || error.message.includes('authentication')) {
        errorMessage = 'Gemini API key is missing or invalid. Please check your .env.local file.'
      } else if (error.message.includes('rate limit') || error.message.includes('quota')) {
        errorMessage = 'Gemini API rate limit exceeded. Please try again later.'
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection.'
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to generate summary', 
        message: errorMessage
      },
      { status: 500 }
    )
  }
}

