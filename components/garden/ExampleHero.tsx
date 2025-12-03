'use client'

/**
 * 示例：完整的电影级Hero区域
 * 展示所有视觉效果的正确组合方式
 */

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function ExampleHero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1])

  return (
    <div ref={containerRef} className="relative h-screen w-full overflow-hidden">
      {/* ============================================
          背景层 - 应用电影级调色
          ============================================ */}
      <motion.div
        className="absolute inset-0 cinematic-grade-strong"
        style={{ y, scale }}
      >
        {/* 1. 基础背景图片 */}
        <div className="absolute inset-0 bg-[url('/your-hero-image.jpg')] bg-cover bg-center" />
        
        {/* 2. 暗色渐变遮罩 - 增强对比度 */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a18]/70 via-[#1a1a18]/50 to-[#1a1a18] z-10" />
        
        {/* 3. 柔光叠加层 - 创建光子感 */}
        <div className="absolute inset-0 soft-light-overlay z-11" />
        
        {/* 4. 暗角效果 - 边缘变暗 */}
        <div className="absolute inset-0 vignette z-12" />
        
        {/* 5. 光子感光层 - 金色光点效果 */}
        <div className="absolute inset-0 photon-layer z-13" />
      </motion.div>

      {/* ============================================
          内容层 - 带光晕效果的文字
          ============================================ */}
      <motion.div
        className="relative z-20 flex flex-col items-center justify-center h-full px-6"
        style={{ opacity }}
      >
        <motion.div
          className="text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* 标题 - 带光晕效果 */}
          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-serif text-[#e8e6e1] mb-8 leading-tight tracking-tight bloom-gold"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            Your Title Here
          </motion.h1>

          {/* 描述文字 */}
          <motion.p
            className="text-lg md:text-xl text-[#b8b6b1] mb-12 max-w-2xl mx-auto leading-relaxed font-light"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 1.2 }}
          >
            Your description text here. This creates the cinematic atmosphere.
          </motion.p>

          {/* 按钮 - 带光晕效果 */}
          <motion.button
            className="px-12 py-4 bg-[#d4af37] text-[#1a1a18] font-light tracking-wide text-sm uppercase hover:bg-[#e5d4a0] transition-colors duration-300 bloom-effect relative overflow-hidden"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 1.2 }}
          >
            <span className="relative z-10">Enter</span>
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  )
}

