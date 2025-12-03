import { NextRequest, NextResponse } from 'next/server'
import { processDream } from '@/lib/openai'

export async function POST(request: NextRequest) {
  let rawText = ''
  try {
    const body = await request.json()
    rawText = body.rawText || ''

    if (!rawText) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 })
    }

    const result = await processDream(rawText)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error processing dream:', error)
    return NextResponse.json(
      { error: 'Failed to process dream', title: '我的梦境', content: rawText || '梦境记录' },
      { status: 500 }
    )
  }
}

