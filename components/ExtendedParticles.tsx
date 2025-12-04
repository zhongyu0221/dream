'use client'

import { useEffect, useRef } from 'react'

interface ExtendedParticlesProps {
  imageSrc: string
  containerRect: { x: number; y: number; width: number; height: number }
}

export default function ExtendedParticles({ imageSrc, containerRect }: ExtendedParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // 从图片中提取颜色
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.src = imageSrc

    const colors: Array<{ r: number; g: number; b: number }> = []
    
    const extractColors = () => {
      // 创建一个临时canvas来读取图片颜色
      const tempCanvas = document.createElement('canvas')
      const tempCtx = tempCanvas.getContext('2d')
      if (!tempCtx) return

      tempCanvas.width = image.width
      tempCanvas.height = image.height
      tempCtx.drawImage(image, 0, 0)

      // 从图片边缘采样颜色
      const samplePoints = 50
      for (let i = 0; i < samplePoints; i++) {
        let x: number, y: number
        
        // 从图片边缘采样
        const side = Math.floor(i / (samplePoints / 4))
        if (side === 0) {
          // 上边缘
          x = (i % (samplePoints / 4)) * (image.width / (samplePoints / 4))
          y = 0
        } else if (side === 1) {
          // 右边缘
          x = image.width - 1
          y = (i % (samplePoints / 4)) * (image.height / (samplePoints / 4))
        } else if (side === 2) {
          // 下边缘
          x = (i % (samplePoints / 4)) * (image.width / (samplePoints / 4))
          y = image.height - 1
        } else {
          // 左边缘
          x = 0
          y = (i % (samplePoints / 4)) * (image.height / (samplePoints / 4))
        }

        const imageData = tempCtx.getImageData(Math.floor(x), Math.floor(y), 1, 1)
        const [r, g, b] = imageData.data

        // 过滤掉太暗或太灰的颜色
        const brightness = (r + g + b) / 3
        const saturation = Math.max(r, g, b) - Math.min(r, g, b)
        
        if (brightness > 40 && saturation > 15) {
          colors.push({ r, g, b })
        }
      }

      // 如果没有提取到足够的颜色，使用默认彩色
      if (colors.length < 10) {
        colors.push(
          { r: 212, g: 175, b: 55 },   // 金色
          { r: 122, g: 155, b: 122 },  // 绿色
          { r: 107, g: 141, b: 184 },  // 蓝色
          { r: 155, g: 122, b: 184 },  // 紫色
          { r: 184, g: 122, b: 155 },  // 玫瑰色
          { r: 122, g: 184, b: 184 },  // 青色
        )
      }
    }

    image.onload = extractColors

    interface Particle {
      x: number
      y: number
      startX: number
      startY: number
      targetX: number
      targetY: number
      radius: number
      speed: number
      color: { r: number; g: number; b: number }
      opacity: number
      life: number
      maxLife: number
    }

    const particles: Particle[] = []
    const particleCount = 200

    // 从主图边缘创建粒子
    const createParticles = () => {
      particles.length = 0
      
      for (let i = 0; i < particleCount; i++) {
        // 从主图边缘随机选择一个起点
        const edge = Math.floor(Math.random() * 4) // 0: top, 1: right, 2: bottom, 3: left
        let startX: number, startY: number

        if (edge === 0) {
          // 上边缘
          startX = containerRect.x + Math.random() * containerRect.width
          startY = containerRect.y
        } else if (edge === 1) {
          // 右边缘
          startX = containerRect.x + containerRect.width
          startY = containerRect.y + Math.random() * containerRect.height
        } else if (edge === 2) {
          // 下边缘
          startX = containerRect.x + Math.random() * containerRect.width
          startY = containerRect.y + containerRect.height
        } else {
          // 左边缘
          startX = containerRect.x
          startY = containerRect.y + Math.random() * containerRect.height
        }

        // 计算向外扩散的目标位置
        const centerX = containerRect.x + containerRect.width / 2
        const centerY = containerRect.y + containerRect.height / 2
        const angle = Math.atan2(startY - centerY, startX - centerX)
        const distance = 200 + Math.random() * 400 // 向外扩散200-600px
        const targetX = startX + Math.cos(angle) * distance
        const targetY = startY + Math.sin(angle) * distance

        const color = colors.length > 0 
          ? colors[Math.floor(Math.random() * colors.length)]
          : { r: 212, g: 175, b: 55 }

        particles.push({
          x: startX,
          y: startY,
          startX,
          startY,
          targetX,
          targetY,
          radius: Math.random() * 2 + 1,
          speed: Math.random() * 0.5 + 0.3,
          color,
          opacity: Math.random() * 0.6 + 0.3,
          life: 0,
          maxLife: 1000 + Math.random() * 2000,
        })
      }
    }

    // 初始化粒子
    if (image.complete) {
      extractColors()
      createParticles()
    } else {
      const originalOnload = image.onload
      image.onload = () => {
        extractColors()
        createParticles()
        if (originalOnload) originalOnload()
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle) => {
        // 更新生命周期
        particle.life += 1

        // 计算当前位置到目标位置的进度
        const dx = particle.targetX - particle.startX
        const dy = particle.targetY - particle.startY
        const distance = Math.sqrt(dx * dx + dy * dy)
        const progress = Math.min(particle.life * particle.speed / distance, 1)

        // 更新位置
        particle.x = particle.startX + dx * progress
        particle.y = particle.startY + dy * progress

        // 添加随机漂移
        particle.x += (Math.random() - 0.5) * 2
        particle.y += (Math.random() - 0.5) * 2

        // 根据生命周期调整透明度
        const lifeProgress = particle.life / particle.maxLife
        const currentOpacity = particle.opacity * (1 - lifeProgress * 0.5)

        // 绘制粒子
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${currentOpacity})`
        ctx.fill()

        // 添加光晕效果
        const gradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.radius * 4
        )
        gradient.addColorStop(0, `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, ${currentOpacity * 0.5})`)
        gradient.addColorStop(1, `rgba(${particle.color.r}, ${particle.color.g}, ${particle.color.b}, 0)`)
        ctx.fillStyle = gradient
        ctx.fill()

        // 如果粒子到达目标或生命周期结束，重新生成
        if (progress >= 1 || particle.life >= particle.maxLife) {
          const edge = Math.floor(Math.random() * 4)
          let startX: number, startY: number

          if (edge === 0) {
            startX = containerRect.x + Math.random() * containerRect.width
            startY = containerRect.y
          } else if (edge === 1) {
            startX = containerRect.x + containerRect.width
            startY = containerRect.y + Math.random() * containerRect.height
          } else if (edge === 2) {
            startX = containerRect.x + Math.random() * containerRect.width
            startY = containerRect.y + containerRect.height
          } else {
            startX = containerRect.x
            startY = containerRect.y + Math.random() * containerRect.height
          }

          const centerX = containerRect.x + containerRect.width / 2
          const centerY = containerRect.y + containerRect.height / 2
          const angle = Math.atan2(startY - centerY, startX - centerX)
          const distance = 200 + Math.random() * 400
          const targetX = startX + Math.cos(angle) * distance
          const targetY = startY + Math.sin(angle) * distance

          particle.x = startX
          particle.y = startY
          particle.startX = startX
          particle.startY = startY
          particle.targetX = targetX
          particle.targetY = targetY
          particle.life = 0
          particle.maxLife = 1000 + Math.random() * 2000
        }
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [imageSrc, containerRect])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1]"
      style={{ mixBlendMode: 'screen' }}
    />
  )
}

