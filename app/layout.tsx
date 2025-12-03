import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '梦境花园 - Dream Journal',
  description: '记录你的梦境，让AI为你整理和保存',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}

