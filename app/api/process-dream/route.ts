import { NextRequest, NextResponse } from 'next/server'
import { generateDreamTitle } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const summary = body.summary || ''

    if (!summary) {
      return NextResponse.json({ error: 'No summary provided' }, { status: 400 })
    }

    const title = await generateDreamTitle(summary)
    return NextResponse.json({ title })
  } catch (error) {
    console.error('Error generating dream title:', error)
    return NextResponse.json(
      { error: 'Failed to generate dream title', title: 'My Dream' },
      { status: 500 }
    )
  }
}

