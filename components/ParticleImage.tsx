'use client'

import { useEffect, useRef, useState } from 'react'

interface ParticleImageProps {
  src: string
  alt: string
  className?: string
}

interface Particle {
  x: number
  y: number
  originalX: number
  originalY: number
  color: string
  size: number
  vx: number
  vy: number
  targetX: number
  targetY: number
}

export default function ParticleImage({ src, alt, className = '' }: ParticleImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const particlesRef = useRef<Particle[]>([])
  const animationFrameRef = useRef<number>()
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new window.Image()
    // 尝试设置跨域，如果失败则继续
    try {
      img.crossOrigin = 'anonymous'
    } catch (e) {
      // 忽略跨域错误
    }
    img.src = src

    img.onload = () => {
      imageRef.current = img
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height

      // 创建离屏canvas来处理图片
      const offscreenCanvas = document.createElement('canvas')
      const offscreenCtx = offscreenCanvas.getContext('2d')
      if (!offscreenCtx) return

      // 计算缩放比例，保持图片比例
      const scale = Math.min(
        canvas.width / img.width,
        canvas.height / img.height
      )
      const scaledWidth = img.width * scale
      const scaledHeight = img.height * scale
      const offsetX = (canvas.width - scaledWidth) / 2
      const offsetY = (canvas.height - scaledHeight) / 2

      offscreenCanvas.width = scaledWidth
      offscreenCanvas.height = scaledHeight

      offscreenCtx.drawImage(img, 0, 0, scaledWidth, scaledHeight)
      const imageData = offscreenCtx.getImageData(0, 0, scaledWidth, scaledHeight)
      const data = imageData.data

      // 粒子密度控制（每N个像素取一个）- 更密集以匹配参考网站
      const density = 3
      const particles: Particle[] = []

      for (let y = 0; y < scaledHeight; y += density) {
        for (let x = 0; x < scaledWidth; x += density) {
          const index = (y * scaledWidth + x) * 4
          const r = data[index]
          const g = data[index + 1]
          const b = data[index + 2]
          const a = data[index + 3]

          // 只处理不透明的像素
          if (a > 100) {
            const brightness = (r + g + b) / 3
            // 根据亮度决定是否显示粒子 - 降低阈值以显示更多细节
            if (brightness > 15) {
              // 添加随机偏移，创建点云效果
              const randomOffset = (Math.random() - 0.5) * 8 // 增加初始随机偏移，让粒子更分散
              const particle: Particle = {
                x: x + offsetX + randomOffset,
                y: y + offsetY + randomOffset,
                originalX: x + offsetX,
                originalY: y + offsetY,
                color: `rgba(${r}, ${g}, ${b}, ${a / 255})`,
                size: Math.random() * 1.5 + 0.6, // 稍微小一点的粒子，但变化范围更大
                vx: (Math.random() - 0.5) * 1.2, // 增加初始随机速度，让粒子更活跃
                vy: (Math.random() - 0.5) * 1.2,
                targetX: x + offsetX,
                targetY: y + offsetY,
              }
              particles.push(particle)
            }
          }
        }
      }

      particlesRef.current = particles
      setIsLoaded(true)
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [src])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !isLoaded) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1, y: -1 }
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleMouseLeave)

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const particles = particlesRef.current
      const mouse = mouseRef.current

      particles.forEach((particle) => {
        // 计算鼠标影响 - 更平滑的交互
        let targetX = particle.originalX
        let targetY = particle.originalY

        if (mouse.x >= 0 && mouse.y >= 0) {
          const dx = mouse.x - particle.originalX
          const dy = mouse.y - particle.originalY
          const distance = Math.sqrt(dx * dx + dy * dy)
          const maxDistance = 350 // 大幅增加影响范围，让粒子发散更开

          if (distance < maxDistance) {
            const force = Math.pow((maxDistance - distance) / maxDistance, 1.5) // 使用1.5次方衰减，让影响更平滑
            const angle = Math.atan2(dy, dx)
            // 粒子被推开，增加推开距离，让发散更明显
            targetX = particle.originalX - Math.cos(angle) * force * 80
            targetY = particle.originalY - Math.sin(angle) * force * 80
          }
        }

        // 添加轻微的回归力，让粒子有回到原位的趋势（降低回归力，让粒子更自由）
        const returnForce = 0.01
        targetX += (particle.originalX - particle.x) * returnForce
        targetY += (particle.originalY - particle.y) * returnForce

        // 平滑移动到目标位置（增加响应速度）
        particle.vx += (targetX - particle.x) * 0.08
        particle.vy += (targetY - particle.y) * 0.08
        particle.vx *= 0.85 // 降低阻尼，让粒子移动更流畅
        particle.vy *= 0.85

        particle.x += particle.vx
        particle.y += particle.vy

        // 增加随机移动幅度，让粒子更发散
        const time = Date.now() * 0.001
        particle.x += Math.sin(time + particle.originalX * 0.01) * 0.8
        particle.y += Math.cos(time + particle.originalY * 0.01) * 0.8

        // 绘制粒子，使用彩色调覆盖 - 参考网站风格
        const [r, g, b] = particle.color.match(/\d+/g) || ['255', '255', '255']
        const brightness = (parseInt(r) + parseInt(g) + parseInt(b)) / 3
        
        // 彩色增强 - 根据原色增强特定颜色通道
        const intensity = Math.max(0.5, Math.min(1, brightness / 180))
        const colorMix = 0.4 // 混合原色和增强色的比例
        
        // 根据原色选择增强色
        const enhanceColors = [
          { r: 212, g: 175, b: 55 },   // 金色
          { r: 122, g: 155, b: 122 },  // 绿色
          { r: 107, g: 141, b: 184 },  // 蓝色
          { r: 155, g: 122, b: 184 },  // 紫色
        ]
        const enhanceColor = enhanceColors[Math.floor((particle.originalX + particle.originalY) / 100) % enhanceColors.length]
        
        // 计算最终颜色 - 保留原色但增强彩色
        const finalR = Math.min(255, parseInt(r) * (1 - colorMix) + enhanceColor.r * intensity * colorMix)
        const finalG = Math.min(255, parseInt(g) * (1 - colorMix) + enhanceColor.g * intensity * colorMix)
        const finalB = Math.min(255, parseInt(b) * (1 - colorMix) + enhanceColor.b * intensity * colorMix)

        // 计算粒子到中心的距离，用于边缘模糊效果
        const canvasCenterX = canvas.width / 2
        const canvasCenterY = canvas.height / 2
        const distToCenter = Math.sqrt(
          Math.pow(particle.x - canvasCenterX, 2) + 
          Math.pow(particle.y - canvasCenterY, 2)
        )
        const maxDist = Math.sqrt(
          Math.pow(canvas.width / 2, 2) + 
          Math.pow(canvas.height / 2, 2)
        )
        // 边缘模糊：距离中心越远，透明度越低
        const edgeFade = Math.max(0.3, 1 - (distToCenter / maxDist) * 0.7)
        
        // 根据亮度和边缘距离调整透明度
        const baseAlpha = Math.max(0.5, Math.min(0.95, brightness / 150))
        const alpha = baseAlpha * edgeFade

        // 绘制粒子主体 - 边缘粒子更小更透明
        ctx.beginPath()
        const particleSize = particle.size * 0.7 * (0.7 + edgeFade * 0.3) // 边缘粒子更小
        ctx.arc(particle.x, particle.y, particleSize, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${Math.floor(finalR)}, ${Math.floor(finalG)}, ${Math.floor(finalB)}, ${alpha})`
        ctx.fill()

        // 添加彩色光晕效果 - 边缘光晕更大更模糊
        const glowSize = particle.size * (3 + (1 - edgeFade) * 2) // 边缘光晕更大
        const gradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          glowSize
        )
        gradient.addColorStop(0, `rgba(${Math.floor(finalR)}, ${Math.floor(finalG)}, ${Math.floor(finalB)}, ${alpha * 0.5})`)
        gradient.addColorStop(0.5, `rgba(${Math.floor(finalR)}, ${Math.floor(finalG)}, ${Math.floor(finalB)}, ${alpha * 0.2})`)
        gradient.addColorStop(1, `rgba(${Math.floor(finalR)}, ${Math.floor(finalG)}, ${Math.floor(finalB)}, 0)`)
        ctx.fillStyle = gradient
        ctx.fill()
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isLoaded])

  const handleResize = () => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const rect = container.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    // 重新计算粒子位置
    if (imageRef.current && particlesRef.current.length > 0) {
      const img = imageRef.current
      const scale = Math.min(
        canvas.width / img.width,
        canvas.height / img.height
      )
      const scaledWidth = img.width * scale
      const scaledHeight = img.height * scale
      const offsetX = (canvas.width - scaledWidth) / 2
      const offsetY = (canvas.height - scaledHeight) / 2

      // 重新计算粒子位置（简化处理，保持相对位置）
      const scaleX = canvas.width / (canvas.width || 1)
      const scaleY = canvas.height / (canvas.height || 1)
      particlesRef.current.forEach((particle) => {
        particle.originalX = particle.originalX * scaleX
        particle.originalY = particle.originalY * scaleY
        particle.targetX = particle.originalX
        particle.targetY = particle.originalY
      })
    }
  }

  useEffect(() => {
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div ref={containerRef} className={`relative w-full h-full ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-[#d4af37] text-sm">加载中...</div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ mixBlendMode: 'screen' }}
      />
    </div>
  )
}

