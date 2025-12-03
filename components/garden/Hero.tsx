'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function Hero() {
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
      {/* Background Image with Parallax */}
      <motion.div
        className="absolute inset-0 cinematic-grade-strong"
        style={{ y, scale }}
      >
        {/* Base Image */}
        <div className="absolute inset-0 bg-[url('/api/placeholder/1920/1080')] bg-cover bg-center" />
        
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a18]/70 via-[#1a1a18]/50 to-[#1a1a18] z-[10]" />
        
        {/* Soft Light Overlay - Photon Feeling */}
        <div className="absolute inset-0 soft-light-overlay z-[11]" />
        
        {/* Vignette Effect */}
        <div className="absolute inset-0 vignette z-[12]" />
        
        {/* Bloom Effect on Bright Areas */}
        <div className="absolute inset-0 photon-layer z-[13]" />
      </motion.div>

      {/* Content */}
      <motion.div
        className="relative z-20 flex flex-col items-center justify-center h-full px-6"
        style={{ opacity }}
      >
        <motion.div
          className="text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <motion.p
            className="text-sm text-[#d4af37] mb-6 tracking-[0.3em] uppercase font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Jeżeli to możliwe, załóż słuchawki
          </motion.p>

          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-serif text-[#e8e6e1] mb-8 leading-tight tracking-tight bloom-gold"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            Ogród Pendereckiego
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-[#b8b6b1] mb-12 max-w-2xl mx-auto leading-relaxed font-light"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 1 }}
          >
            Krzysztof Penderecki uwielbiał przebywać w zaprojektowanym przez siebie ogrodzie w Lusławicach, 
            któremu poświęcał każdą wolną chwilę. Nasza wirtualna przestrzeń, będąca odwzorowaniem ogrodu Mistrza, 
            łączy w sobie dwie jego największe pasje – muzykę oraz świat flory.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 1 }}
          >
            <motion.button
              className="px-12 py-4 bg-[#d4af37] text-[#1a1a18] font-light tracking-wide text-sm uppercase hover:bg-[#e5d4a0] transition-colors duration-300 bloom-effect relative overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10">Wejdź</span>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col items-center text-[#d4af37]"
          >
            <span className="text-xs mb-2 tracking-wider">Scroll</span>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}

