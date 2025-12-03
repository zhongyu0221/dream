import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const dreams = await prisma.dream.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(dreams)
  } catch (error) {
    console.error('Error fetching dreams:', error)
    return NextResponse.json({ error: 'Failed to fetch dreams' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, rawContent, imageUrl } = body

    const dream = await prisma.dream.create({
      data: {
        title,
        content,
        rawContent,
        imageUrl,
      },
    })

    return NextResponse.json(dream)
  } catch (error) {
    console.error('Error creating dream:', error)
    return NextResponse.json({ error: 'Failed to create dream' }, { status: 500 })
  }
}

