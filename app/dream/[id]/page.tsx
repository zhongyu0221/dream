'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import ParticleBackground from '@/components/ParticleBackground'
import ParticleImage from '@/components/ParticleImage'

interface Dream {
  id: string
  title: string
  content: string
  rawContent: string | null
  imageUrl: string
  createdAt: string
}

export default function DreamDetail() {
  const params = useParams()
  const router = useRouter()
  const [dream, setDream] = useState<Dream | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDream = async () => {
      try {
        const response = await fetch('/api/dreams')
        const dreams = await response.json()
        const foundDream = dreams.find((d: Dream) => d.id === params.id)
        setDream(foundDream || null)
      } catch (error) {
        console.error('Error fetching dream:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDream()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative bg-[#1a1a18]">
        <ParticleBackground />
        <p className="text-[#d4af37] text-lg font-light tracking-wide relative z-10">Loading...</p>
      </div>
    )
  }

  if (!dream) {
    return (
      <div className="min-h-screen flex items-center justify-center relative bg-[#1a1a18]">
        <ParticleBackground />
        <div className="text-center relative z-10">
          <p className="text-[#d4af37] text-lg mb-6 font-light tracking-wide">Dream not found</p>
          <button
            onClick={() => router.push('/')}
            className="px-8 py-3 bg-[#d4af37] text-[#1a1a18] rounded-sm hover:bg-[#e5d4a0] transition-all duration-500 font-normal tracking-wide shadow-[0_4px_15px_rgba(212,175,55,0.4)] hover:shadow-[0_6px_25px_rgba(212,175,55,0.6)] btn-elegant relative overflow-hidden golden-glow"
          >
            <span className="relative z-10">Back to Home</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen text-[#e8e6e1] relative overflow-hidden bg-[#1a1a18]">
      <ParticleBackground />
      
      {/* 背景光影效果 */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="ambient-light" style={{ top: '10%', left: '10%' }}></div>
        <div className="ambient-light" style={{ top: '60%', right: '15%', animationDelay: '5s' }}></div>
      </div>

      <nav className="fixed top-0 w-full bg-[#1a1a18]/95 backdrop-blur-lg border-b border-[#3a3a37]/60 z-50 shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <button
            onClick={() => router.push('/')}
            className="text-[#d4af37] hover:text-[#e5d4a0] transition-all duration-300 font-normal flex items-center group tracking-wide"
          >
            <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>
      </nav>

      <div className="pt-24 pb-16 relative z-10">
        <div className="max-w-5xl mx-auto px-8">
          <div className="bg-[#2a2a27] rounded-sm overflow-visible border border-[#3a3a37] animate-fade-in particle-glow relative golden-glow">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent"></div>
            <div className="relative w-full h-[600px] overflow-visible dream-image-container">
              <ParticleImage
                src={dream.imageUrl}
                alt={dream.title}
                className="w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a18]/25 via-transparent to-transparent pointer-events-none z-[3]"></div>
              <div className="absolute inset-0 bg-gradient-radial from-[#7a9b7a]/8 via-[#d4af37]/6 via-[#6b8db8]/8 to-transparent pointer-events-none z-[3]"></div>
              {/* 边缘模糊遮罩 */}
              <div className="absolute inset-0 pointer-events-none z-[4]" style={{
                maskImage: 'radial-gradient(ellipse 85% 85% at center, black 45%, transparent 100%)',
                WebkitMaskImage: 'radial-gradient(ellipse 85% 85% at center, black 45%, transparent 100%)',
              }}></div>
            </div>
            <div className="p-12 relative">
              <h1 className="text-5xl font-serif bg-gradient-to-r from-[#7a9b7a] via-[#d4af37] to-[#6b8db8] bg-clip-text text-transparent mb-8 font-normal tracking-wider leading-tight bloom-colorful">{dream.title}</h1>
              <div className="border-t border-b border-[#3a3a37] py-5 mb-10 relative">
                <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-[#7a9b7a]/40 via-[#d4af37]/30 to-[#6b8db8]/20"></div>
                <p className="text-[#9a9893] text-sm font-light tracking-wide pl-6">
                  {new Date(dream.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long',
                  })}
                </p>
              </div>
              <div className="prose max-w-none relative">
                <div className="absolute left-0 top-0 w-0.5 h-full bg-gradient-to-b from-[#9b7ab8]/30 via-[#d4af37]/20 to-transparent"></div>
                <p className="text-[#e8e6e1] leading-relaxed whitespace-pre-wrap text-lg font-light tracking-wide pl-8">
                  {dream.content}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

