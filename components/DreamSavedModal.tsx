'use client'

import { useEffect } from 'react'

interface DreamSavedModalProps {
  isOpen: boolean
  onClose: () => void
  dreamTitle?: string
}

export default function DreamSavedModal({ isOpen, onClose, dreamTitle }: DreamSavedModalProps) {
  useEffect(() => {
    if (isOpen) {
      // 3秒后自动关闭
      const timer = setTimeout(() => {
        onClose()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
      onClick={onClose}
    >
      {/* 背景遮罩 - 梦幻模糊效果 */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fade-in" style={{ animation: 'fadeIn 0.3s ease-out' }}></div>
      
      {/* 主内容 */}
      <div 
        className="relative z-10 max-w-md w-full mx-4 pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 光晕效果 */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#7a9b7a]/20 via-[#d4af37]/20 to-[#6b8db8]/20 rounded-2xl blur-2xl animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#9b7ab8]/10 via-[#d4af37]/10 to-[#7ab8b8]/10 rounded-2xl blur-xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        
        {/* 内容卡片 */}
        <div className="relative bg-[#2a2a27]/95 backdrop-blur-xl border-2 border-[#7a9b7a]/40 rounded-2xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.5)]" style={{ animation: 'fadeIn 0.5s ease-out, slideUp 0.5s ease-out' }}>
          {/* 顶部装饰线 */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#7a9b7a]/60 via-[#d4af37]/60 via-[#6b8db8]/60 to-transparent rounded-t-2xl"></div>
          
          {/* 成功图标 - 梦幻星星 */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              {/* 旋转光晕 */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#7a9b7a] via-[#d4af37] to-[#6b8db8] rounded-full blur-xl animate-pulse opacity-60"></div>
              
              {/* 星星图标 */}
              <svg 
                className="w-20 h-20 text-[#d4af37] relative z-10 animate-dreamy-glow" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              
              {/* 周围小星星 */}
              <div className="absolute -top-2 -left-2 w-3 h-3 bg-[#7a9b7a] rounded-full animate-ping opacity-75"></div>
              <div className="absolute -top-1 -right-3 w-2 h-2 bg-[#6b8db8] rounded-full animate-ping opacity-75" style={{ animationDelay: '0.3s' }}></div>
              <div className="absolute -bottom-2 -left-1 w-2.5 h-2.5 bg-[#d4af37] rounded-full animate-ping opacity-75" style={{ animationDelay: '0.6s' }}></div>
            </div>
          </div>

          {/* 标题 */}
          <h2 className="text-3xl font-serif bg-gradient-to-r from-[#7a9b7a] via-[#d4af37] to-[#6b8db8] bg-clip-text text-transparent text-center mb-4 tracking-wider font-normal bloom-colorful">
            Dream Saved
          </h2>

          {/* 副标题 */}
          <p className="text-[#b8b6b1] text-center text-sm font-light tracking-wide mb-6">
            Your precious memory has been captured
            {dreamTitle && (
              <span className="block mt-2 text-[#d4af37] italic">
                "{dreamTitle}"
              </span>
            )}
          </p>

          {/* 装饰粒子效果 */}
          <div className="flex justify-center space-x-2 mb-6">
            <div className="w-2 h-2 bg-[#7a9b7a] rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-[#d4af37] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-[#6b8db8] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>

          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gradient-to-r from-[#7a9b7a]/80 via-[#d4af37]/80 to-[#6b8db8]/80 hover:from-[#8aab8a] hover:via-[#e5d4a0] hover:to-[#7b9dc8] text-white rounded-full font-normal text-sm tracking-wide transition-all duration-500 hover:scale-105 shadow-[0_4px_20px_rgba(122,155,122,0.4)] hover:shadow-[0_6px_30px_rgba(212,175,55,0.6)] relative overflow-hidden group"
          >
            <span className="relative z-10">Continue</span>
            <span className="absolute inset-0 bg-gradient-to-r from-[#7a9b7a]/0 via-[#d4af37]/20 to-[#6b8db8]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full blur-sm"></span>
          </button>
        </div>

        {/* 底部装饰线 */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#7a9b7a]/60 via-[#d4af37]/60 via-[#6b8db8]/60 to-transparent rounded-b-2xl"></div>
      </div>
    </div>
  )
}

