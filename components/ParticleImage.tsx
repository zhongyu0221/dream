'use client'

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'

interface ParticleImageProps {
  src: string
  alt: string
  className?: string
}

export interface ParticleImageHandle {
  getSnapshot: () => Promise<string | null>
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

const ParticleImage = forwardRef<ParticleImageHandle, ParticleImageProps>(
  ({ src, alt, className = '' }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const imageRef = useRef<HTMLImageElement | null>(null)
    const [isLoaded, setIsLoaded] = useState(false)
    const particlesRef = useRef<Particle[]>([])
    const animationFrameRef = useRef<number>()
    const mouseRef = useRef({ x: 0, y: 0 })

    // 暴露获取快照的方法
    useImperativeHandle(ref, () => ({
      getSnapshot: async () => {
        const canvas = canvasRef.current
        if (!canvas) return null
        
        try {
          // 获取canvas的当前状态作为快照
          return canvas.toDataURL('image/png')
        } catch (error) {
          console.error('Error getting snapshot:', error)
          return null
        }
      },
    }))

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

      // 计算缩放比例，铺满整个屏幕（使用 Math.max 确保完全填充）
      const scale = Math.max(
        canvas.width / img.width,
        canvas.height / img.height
      )
      const scaledWidth = img.width * scale
      const scaledHeight = img.height * scale
      // 居中裁剪，确保图片铺满整个屏幕
      const offsetX = (canvas.width - scaledWidth) / 2
      const offsetY = (canvas.height - scaledHeight) / 2

      offscreenCanvas.width = scaledWidth
      offscreenCanvas.height = scaledHeight

      // 将图片绘制到画布大小，确保铺满整个屏幕
      offscreenCanvas.width = canvas.width
      offscreenCanvas.height = canvas.height
      
      // 计算源图片的裁剪区域（居中裁剪）
      const sourceX = Math.max(0, -offsetX / scale)
      const sourceY = Math.max(0, -offsetY / scale)
      const sourceWidth = Math.min(img.width, canvas.width / scale)
      const sourceHeight = Math.min(img.height, canvas.height / scale)
      
      // 绘制图片，铺满整个画布
      offscreenCtx.drawImage(
        img,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        canvas.width,
        canvas.height
      )
      
      const imageData = offscreenCtx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      // 粒子密度控制 - 保留更多图片细节
      const baseDensity = 12 // 降低基础密度，增加粒子数量
      const particles: Particle[] = []

      // 使用随机采样，但保留更多细节
      const sampleRate = 0.9 // 采样90%的像素点，保留更多图片细节
      
      // 遍历整个画布，使用随机采样
      for (let y = 0; y < canvas.height; y += baseDensity) {
        for (let x = 0; x < canvas.width; x += baseDensity) {
          // 随机跳过一些区域，但保留大部分
          if (Math.random() > sampleRate) continue
          
          // 减少随机偏移，让采样点更接近原始位置
          const randomX = x + (Math.random() - 0.5) * baseDensity * 0.4
          const randomY = y + (Math.random() - 0.5) * baseDensity * 0.4
          
          // 确保坐标在画布范围内
          const sampleX = Math.max(0, Math.min(canvas.width - 1, Math.floor(randomX)))
          const sampleY = Math.max(0, Math.min(canvas.height - 1, Math.floor(randomY)))
          
          const index = (sampleY * canvas.width + sampleX) * 4
          const r = data[index]
          const g = data[index + 1]
          const b = data[index + 2]
          const a = data[index + 3]

          // 只处理不透明的像素
          if (a > 100) {
            const brightness = (r + g + b) / 3
            
            // 计算颜色的饱和度（色彩强度）
            const max = Math.max(r, g, b)
            const min = Math.min(r, g, b)
            const saturation = max === 0 ? 0 : (max - min) / max
            
            // 只保留有色彩的区域：
            // 1. 亮度必须足够（过滤黑色/暗色区域，直接留白）
            // 2. 饱和度必须足够（确保有颜色，不是灰色）
            const minBrightness = 40 // 最低亮度阈值，过滤黑色区域
            const minSaturation = 0.15 // 最低饱和度阈值，确保有颜色
            
            if (brightness > minBrightness && saturation > minSaturation) {
              // 根据亮度和饱和度调整粒子大小
              const brightnessFactor = Math.min(1, (brightness - minBrightness) / 100)
              const saturationFactor = Math.min(1, saturation / 0.5)
              
              // 减少随机偏移，让粒子更接近原始位置，保留图片形状
              const randomOffsetX = (Math.random() - 0.5) * baseDensity * 0.6
              const randomOffsetY = (Math.random() - 0.5) * baseDensity * 0.6
              
              const particle: Particle = {
                x: sampleX + randomOffsetX,
                y: sampleY + randomOffsetY,
                originalX: sampleX,
                originalY: sampleY,
                color: `rgba(${r}, ${g}, ${b}, ${a / 255})`,
                size: (Math.random() * 2.5 + 1.8) * brightnessFactor * saturationFactor, // 根据亮度和饱和度调整大小
                vx: (Math.random() - 0.5) * 1.2,
                vy: (Math.random() - 0.5) * 1.2,
                targetX: sampleX,
                targetY: sampleY,
              }
              particles.push(particle)
            }
            // 黑色/暗色区域不生成粒子，直接留白
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

        // 增加回归力，让粒子更接近原始位置，保留图片形状
        const returnForce = 0.02 // 增加回归力，让粒子更稳定
        targetX += (particle.originalX - particle.x) * returnForce
        targetY += (particle.originalY - particle.y) * returnForce

        // 平滑移动到目标位置（增加响应速度，让粒子更快回到原位）
        particle.vx += (targetX - particle.x) * 0.1
        particle.vy += (targetY - particle.y) * 0.1
        particle.vx *= 0.88 // 增加阻尼，让粒子移动更稳定
        particle.vy *= 0.88

        particle.x += particle.vx
        particle.y += particle.vy

        // 减少随机移动幅度，让粒子更接近原始位置
        const time = Date.now() * 0.001
        const randomMovement = 0.5 + Math.random() * 0.4 // 减少随机移动幅度
        particle.x += Math.sin(time + particle.originalX * 0.01) * randomMovement
        particle.y += Math.cos(time + particle.originalY * 0.01) * randomMovement

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

        // 绘制粒子主体 - 增加粒子尺寸，边缘粒子稍小但整体更大
        ctx.beginPath()
        const particleSize = particle.size * (0.8 + edgeFade * 0.2) // 保持更大的粒子尺寸
        ctx.arc(particle.x, particle.y, particleSize, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${Math.floor(finalR)}, ${Math.floor(finalG)}, ${Math.floor(finalB)}, ${alpha})`
        ctx.fill()

        // 添加彩色光晕效果 - 更大的光晕以匹配更大的粒子
        const glowSize = particle.size * (4 + (1 - edgeFade) * 2) // 增加光晕大小
        const gradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          glowSize
        )
        gradient.addColorStop(0, `rgba(${Math.floor(finalR)}, ${Math.floor(finalG)}, ${Math.floor(finalB)}, ${alpha * 0.6})`)
        gradient.addColorStop(0.5, `rgba(${Math.floor(finalR)}, ${Math.floor(finalG)}, ${Math.floor(finalB)}, ${alpha * 0.3})`)
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

    // 重新计算粒子位置 - 使用 Math.max 确保铺满整个屏幕
    if (imageRef.current && particlesRef.current.length > 0) {
      const img = imageRef.current
      const scale = Math.max(
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
            <div className="text-[#d4af37] text-sm">Loading...</div>
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
)

ParticleImage.displayName = 'ParticleImage'

export default ParticleImage

