import { NextRequest, NextResponse } from 'next/server'

// 简单的占位图片生成（使用外部服务）
export async function GET(
  request: NextRequest,
  { params }: { params: { params: string[] } }
) {
  const [width, height] = params.params || ['800', '600']
  
  // 重定向到占位图片服务
  const placeholderUrl = `https://via.placeholder.com/${width}x${height}/1a1a18/d4af37?text=Image+Placeholder`
  
  return NextResponse.redirect(placeholderUrl)
}

