'use client'

import { useRef } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'

interface SectionProps {
  id: string
  number: string
  title: string
  subtitle: string
  image: string
  content: string
  reverse?: boolean
}

export default function Section({
  id,
  number,
  title,
  subtitle,
  image,
  content,
  reverse = false,
}: SectionProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])
  const imageOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.3, 1, 1, 0.3])
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.1])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1.2,
        ease: [0.25, 0.1, 0.25, 1], // Cinematic easing
      },
    },
  }

  return (
    <section
      id={id}
      ref={ref}
      className="min-h-screen flex items-center py-24 px-6 lg:px-8 garden-section"
    >
      <div className="max-w-7xl mx-auto w-full">
        <motion.div
          className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${
            reverse ? 'lg:grid-flow-dense' : ''
          }`}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {/* Image with Parallax */}
          <motion.div
            className={`relative h-[400px] lg:h-[600px] ${reverse ? 'lg:col-start-2' : ''} cinematic-grade vignette overflow-hidden`}
            variants={itemVariants}
            style={{ y: imageY, opacity: imageOpacity }}
          >
            {/* Base Image */}
            <motion.div 
              className="absolute inset-0 bg-[url('/api/placeholder/800/600')] bg-cover bg-center"
              style={{ scale: imageScale }}
            />
            
            {/* Soft Light Overlay */}
            <div className="absolute inset-0 soft-light-overlay z-[1]" />
            
            {/* Bloom Effect */}
            <div className="absolute inset-0 photon-layer z-[2]" />
            
            {/* Border */}
            <div className="absolute inset-0 border border-[#3a3a37]/50 z-[10] pointer-events-none" />
          </motion.div>

          {/* Content */}
          <motion.div
            className={`space-y-6 ${reverse ? 'lg:col-start-1 lg:row-start-1' : ''}`}
            variants={itemVariants}
          >
            <div className="flex items-baseline space-x-4">
              <span className="text-6xl font-serif text-[#d4af37]/30 font-light">
                {number}
              </span>
              <div className="h-px flex-1 bg-[#3a3a37]" />
            </div>

            <h2 className="text-4xl md:text-5xl font-serif text-[#e8e6e1] font-light tracking-tight bloom-gold">
              {title}
            </h2>

            <p className="text-lg text-[#d4af37] font-light tracking-wide">
              {subtitle}
            </p>

            <p className="text-base md:text-lg text-[#b8b6b1] leading-relaxed font-light max-w-xl">
              {content}
            </p>

            <motion.button
              className="mt-8 text-sm text-[#d4af37] hover:text-[#e5d4a0] transition-colors duration-300 font-light tracking-wide uppercase border-b border-[#d4af37]/30 hover:border-[#d4af37] pb-1"
              whileHover={{ x: 5 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              Zobacz więcej
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

