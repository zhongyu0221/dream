'use client'

import { ReactNode } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

interface CinematicWrapperProps {
  children: ReactNode
  className?: string
  delay?: number
}

export default function CinematicWrapper({ 
  children, 
  className = '',
  delay = 0 
}: CinematicWrapperProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0])
  const y = useTransform(scrollYProgress, [0, 0.5], [50, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.95, 1])

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ opacity, y, scale }}
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{
        duration: 1.2,
        delay,
        ease: [0.25, 0.1, 0.25, 1], // Custom easing for cinematic feel
      }}
    >
      {children}
    </motion.div>
  )
}

