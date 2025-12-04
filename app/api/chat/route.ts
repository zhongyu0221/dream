import { NextRequest, NextResponse } from 'next/server'
import { getAIResponse } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { conversationHistory } = body

    if (!conversationHistory || !Array.isArray(conversationHistory)) {
      return NextResponse.json({ error: 'Invalid conversation history' }, { status: 400 })
    }

    const response = await getAIResponse(conversationHistory)
    return NextResponse.json({ message: response })
  } catch (error) {
    console.error('Error getting AI response:', error)
    return NextResponse.json(
      { error: 'Failed to get AI response', message: '我在这里倾听，请继续分享你的梦境...' },
      { status: 500 }
    )
  }
}

