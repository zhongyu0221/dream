'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import ParticleBackground from '@/components/ParticleBackground'
import ParticleImage from '@/components/ParticleImage'

interface Dream {
  id: string
  title: string
  content: string
  imageUrl: string
  createdAt: string
}

export default function Home() {
  const router = useRouter()
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [dreams, setDreams] = useState<Dream[]>([])
  const [showList, setShowList] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)

  // 加载梦境列表
  const loadDreams = async () => {
    try {
      const response = await fetch('/api/dreams')
      const data = await response.json()
      setDreams(data)
    } catch (error) {
      console.error('Error loading dreams:', error)
    }
  }

  // 处理图片上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // 开始录音
  const startRecording = () => {
    // 如果已经在录音，先停止
    if (isRecording && recognitionRef.current) {
      stopRecording()
      return
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('您的浏览器不支持语音识别功能，请使用Chrome或Edge浏览器')
      return
    }

    try {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      
      // 如果已有recognition实例，先停止
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {
          // 忽略停止错误
        }
      }

      const recognition = new SpeechRecognition()
      
      recognition.lang = 'zh-CN'
      recognition.continuous = true
      recognition.interimResults = true

      recognition.onstart = () => {
        setIsRecording(true)
        if (!transcript) {
          setTranscript('')
        }
      }

      recognition.onresult = (event: any) => {
        let interimTranscript = ''
        let finalTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' '
          } else {
            interimTranscript += transcript
          }
        }

        setTranscript((prev) => {
          // 保留之前的最终结果，只更新新的
          const existingFinal = prev.split('\n').filter(line => line.trim()).join('\n')
          return existingFinal ? `${existingFinal}\n${finalTranscript}${interimTranscript}` : `${finalTranscript}${interimTranscript}`
        })
      }

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        
        // 处理特定错误
        if (event.error === 'no-speech') {
          // 没有检测到语音，继续录音
          return
        } else if (event.error === 'audio-capture') {
          alert('无法访问麦克风，请检查权限设置')
        } else if (event.error === 'not-allowed') {
          alert('麦克风权限被拒绝，请在浏览器设置中允许访问')
        }
        
        setIsRecording(false)
        recognitionRef.current = null
      }

      recognition.onend = () => {
        // 只有在用户没有手动停止时才自动重启（可选）
        // 这里我们设置为停止状态
        setIsRecording(false)
        recognitionRef.current = null
      }

      recognition.start()
      recognitionRef.current = recognition
    } catch (error) {
      console.error('Error starting recognition:', error)
      alert('启动语音识别失败，请重试')
      setIsRecording(false)
    }
  }

  // 停止录音
  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
        recognitionRef.current.abort()
      } catch (error) {
        console.error('Error stopping recognition:', error)
      }
      recognitionRef.current = null
    }
    setIsRecording(false)
  }

  // 保存梦境
  const saveDream = async () => {
    if (!image || !transcript.trim()) {
      alert('请先上传图片并讲述您的梦境')
      return
    }

    setIsProcessing(true)

    try {
      // 1. 上传图片
      const formData = new FormData()
      formData.append('file', image)
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const { imageUrl } = await uploadResponse.json()

      // 2. 处理梦境文本
      const processResponse = await fetch('/api/process-dream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: transcript }),
      })
      const { title, content } = await processResponse.json()

      // 3. 保存到数据库
      const saveResponse = await fetch('/api/dreams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          rawContent: transcript,
          imageUrl,
        }),
      })

      if (saveResponse.ok) {
        // 重置表单
        setImage(null)
        setImagePreview('')
        setTranscript('')
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        alert('梦境已保存！')
        loadDreams()
      }
    } catch (error) {
      console.error('Error saving dream:', error)
      alert('保存失败，请重试')
    } finally {
      setIsProcessing(false)
    }
  }

  // 初始化时加载梦境列表
  useEffect(() => {
    loadDreams()
  }, [])

  return (
    <main className="min-h-screen text-[#e8e6e1] relative overflow-hidden bg-[#1a1a18]">
      {/* 粒子背景 */}
      <ParticleBackground />
      
      {/* 背景光影效果 - 彩色版本 */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="ambient-light" style={{ top: '10%', left: '10%', background: 'radial-gradient(circle, rgba(122, 155, 122, 0.08) 0%, transparent 70%)' }}></div>
        <div className="ambient-light" style={{ top: '60%', right: '15%', animationDelay: '5s', background: 'radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, transparent 70%)' }}></div>
        <div className="ambient-light" style={{ bottom: '20%', left: '50%', animationDelay: '10s', background: 'radial-gradient(circle, rgba(107, 141, 184, 0.08) 0%, transparent 70%)' }}></div>
        <div className="ambient-light" style={{ top: '30%', right: '30%', animationDelay: '7s', background: 'radial-gradient(circle, rgba(155, 122, 184, 0.06) 0%, transparent 70%)' }}></div>
      </div>

      {/* 导航栏 */}
      <nav className="fixed top-0 w-full bg-[#1a1a18]/95 backdrop-blur-lg border-b border-[#3a3a37]/60 z-50 shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
        <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-serif bg-gradient-to-r from-[#7a9b7a] via-[#d4af37] to-[#6b8db8] bg-clip-text text-transparent tracking-wider font-normal bloom-colorful">梦境花园</h1>
          <button
            onClick={() => {
              setShowList(!showList)
              if (!showList) {
                loadDreams()
              }
            }}
            className="px-6 py-2.5 bg-gradient-to-r from-[#7a9b7a] via-[#d4af37] to-[#6b8db8] bg-clip-text text-transparent hover:from-[#8aab8a] hover:via-[#e5d4a0] hover:to-[#7b9dc8] transition-all duration-300 border border-[#7a9b7a]/30 rounded-sm hover:bg-gradient-to-r hover:from-[#7a9b7a]/10 hover:via-[#d4af37]/10 hover:to-[#6b8db8]/10 hover:border-[#d4af37]/50 hover:golden-glow font-normal text-sm tracking-wide relative overflow-hidden group"
          >
            <span className="relative z-10">{showList ? '← 返回' : '我的梦境'}</span>
            <span className="absolute inset-0 bg-[#7a6b5a]/5 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
          </button>
        </div>
      </nav>

      <div className="relative z-10">
        {!showList ? (
          <>
            {/* 主页面 - 创建新梦境 */}
            <div className="relative">
            {/* 标题区域 - 绝对定位在顶部 */}
            {!imagePreview && (
              <div className="absolute top-24 left-0 right-0 z-20 text-center fade-in-slow">
                <div className="inline-block mb-6">
                  <h2 className="text-6xl font-serif bg-gradient-to-r from-[#7a9b7a] via-[#d4af37] to-[#6b8db8] bg-clip-text text-transparent mb-4 tracking-wider font-normal leading-tight bloom-colorful">
                    记录你的梦境
                  </h2>
                  <div className="h-0.5 w-24 mx-auto bg-gradient-to-r from-transparent via-[#7a9b7a]/60 via-[#d4af37]/60 via-[#6b8db8]/60 to-transparent"></div>
                </div>
                <p className="text-lg text-[#b8b6b1] max-w-2xl mx-auto leading-relaxed font-light tracking-wide">
                  上传一张图片，讲述你的梦，让AI为你整理和保存
                </p>
              </div>
            )}

            {/* 图片上传区域 - 铺满整个空间 */}
            <div className="relative w-full min-h-screen flex items-center justify-center overflow-visible"
                 onClick={() => !imagePreview && fileInputRef.current?.click()}>
              {imagePreview ? (
                <div className="absolute inset-0 w-full h-screen overflow-visible dream-image-container">
                  <ParticleImage
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full"
                  />
                  {/* 光影叠加层 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a18]/15 via-transparent to-transparent pointer-events-none z-[3]"></div>
                  {/* 彩色光晕 */}
                  <div className="absolute inset-0 bg-gradient-radial from-[#7a9b7a]/6 via-[#d4af37]/4 via-[#6b8db8]/6 to-transparent pointer-events-none z-[3]"></div>
                  {/* 边缘模糊遮罩 */}
                  <div className="absolute inset-0 pointer-events-none z-[4]" style={{
                    maskImage: 'radial-gradient(ellipse 85% 85% at center, black 50%, transparent 100%)',
                    WebkitMaskImage: 'radial-gradient(ellipse 85% 85% at center, black 50%, transparent 100%)',
                  }}></div>
                </div>
              ) : (
                <div className="py-40 text-center cursor-pointer group relative z-10">
                  <svg className="mx-auto h-24 w-24 text-[#7a6b5a]/20 group-hover:text-[#7a6b5a]/40 transition-all duration-500 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-8 bg-gradient-to-r from-[#7a9b7a] via-[#d4af37] to-[#6b8db8] bg-clip-text text-transparent text-xl font-normal tracking-wide">点击上传图片</p>
                  <p className="mt-3 text-[#9a9893] text-sm font-light">支持 JPG、PNG 格式</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* 语音输入和控制区域 - 浮动在图片上方，无边框 */}
            <div className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 z-30 w-full max-w-4xl px-8 transition-all duration-500`}>
              <div className="flex flex-col items-center space-y-6">
                {/* 语音输入按钮 */}
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isProcessing}
                  className={`px-12 py-5 rounded-sm text-white font-normal tracking-wide transition-all duration-500 btn-elegant relative overflow-hidden backdrop-blur-md bg-black/30 ${
                    isRecording
                      ? 'bg-gradient-to-r from-[#c96b6b]/90 to-[#b85a5a]/90 hover:from-[#b85a5a] hover:to-[#a85a5a] animate-gentle-pulse scale-[1.02] shadow-[0_4px_20px_rgba(201,107,107,0.5)] hover:shadow-[0_6px_30px_rgba(201,107,107,0.7)]'
                      : 'bg-gradient-to-r from-[#7a9b7a]/80 via-[#d4af37]/80 to-[#6b8db8]/80 hover:from-[#8aab8a] hover:via-[#e5d4a0] hover:to-[#7b9dc8] hover:scale-[1.02] shadow-[0_4px_20px_rgba(122,155,122,0.4)] hover:shadow-[0_6px_30px_rgba(212,175,55,0.6)] bloom-colorful'
                  }`}
                >
                  {isRecording ? (
                    <span className="flex items-center text-base relative z-10">
                      <span className="w-2.5 h-2.5 bg-white rounded-full mr-3 animate-pulse"></span>
                      正在录音...
                    </span>
                  ) : (
                    <span className="text-base relative z-10 flex items-center">
                      <span className="mr-2">🎤</span>
                      开始讲述
                    </span>
                  )}
                </button>
                
                {/* 转录文本显示 */}
                {transcript && (
                  <div className="w-full p-8 bg-black/30 backdrop-blur-md rounded-sm min-h-[200px] max-h-[300px] overflow-y-auto shadow-lg relative">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#7a9b7a]/50 via-[#d4af37]/40 to-[#6b8db8]/30"></div>
                    <p className="text-[#e8e6e1] whitespace-pre-wrap leading-relaxed text-base pl-6 font-light tracking-wide">{transcript}</p>
                  </div>
                )}

                {/* 保存按钮 */}
                {image && transcript && (
                  <button
                    onClick={saveDream}
                    disabled={isProcessing}
                    className="px-20 py-5 bg-gradient-to-r from-[#7a9b7a]/90 via-[#d4af37]/90 to-[#6b8db8]/90 text-white rounded-sm font-normal tracking-wider hover:from-[#8aab8a] hover:via-[#e5d4a0] hover:to-[#7b9dc8] transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(122,155,122,0.5)] hover:shadow-[0_6px_30px_rgba(212,175,55,0.7)] hover:scale-[1.02] text-base btn-elegant relative overflow-hidden bloom-colorful backdrop-blur-md"
                  >
                    {isProcessing ? (
                      <span className="flex items-center justify-center relative z-10">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        正在保存...
                      </span>
                    ) : (
                      <span className="relative z-10">✨ 保存梦境</span>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
          </>
        ) : (
          <>
            {/* 梦境列表页面 */}
            <div className="max-w-7xl mx-auto px-8">
            <div className="text-center mb-16 fade-in-slow">
              <h2 className="text-5xl font-serif bg-gradient-to-r from-[#7a9b7a] via-[#d4af37] to-[#6b8db8] bg-clip-text text-transparent mb-4 tracking-wider font-normal bloom-colorful">我的梦境</h2>
              <div className="h-0.5 w-32 mx-auto bg-gradient-to-r from-transparent via-[#7a9b7a]/60 via-[#d4af37]/60 via-[#6b8db8]/60 to-transparent"></div>
            </div>
            {dreams.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-[#9a9893] text-lg font-light tracking-wide">还没有记录任何梦境</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {dreams.map((dream, index) => (
                  <div
                    key={dream.id}
                    className="bg-[#2a2a27] rounded-sm overflow-visible border border-[#3a3a37] hover:border-[#d4af37]/30 transition-all duration-500 cursor-pointer animate-fade-in hover-lift particle-glow group golden-glow"
                    onClick={() => router.push(`/dream/${dream.id}`)}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="relative w-full h-56 overflow-visible dream-image-container">
                      <ParticleImage
                        src={dream.imageUrl}
                        alt={dream.title}
                        className="w-full h-full"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a18]/30 via-transparent to-transparent pointer-events-none z-[3]"></div>
                      <div className="absolute inset-0 bg-gradient-radial from-[#7a9b7a]/8 via-[#d4af37]/6 via-[#6b8db8]/8 to-transparent pointer-events-none z-[3]"></div>
                      {/* 边缘模糊遮罩 */}
                      <div className="absolute inset-0 pointer-events-none z-[4]" style={{
                        maskImage: 'radial-gradient(ellipse 75% 75% at center, black 35%, transparent 100%)',
                        WebkitMaskImage: 'radial-gradient(ellipse 75% 75% at center, black 35%, transparent 100%)',
                      }}></div>
                    </div>
                    <div className="p-6 relative">
                      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#9b7ab8]/40 via-[#d4af37]/40 via-[#7ab8b8]/40 to-transparent"></div>
                      <h3 className="text-lg font-serif bg-gradient-to-r from-[#9b7ab8] via-[#d4af37] to-[#7ab8b8] bg-clip-text text-transparent mb-3 font-normal tracking-wide">{dream.title}</h3>
                      <p className="text-sm text-[#b8b6b1] line-clamp-3 leading-relaxed mb-4 font-light">{dream.content}</p>
                      <p className="text-xs text-[#9a9893] mt-4 border-t border-[#3a3a37] pt-4 font-light tracking-wide">
                        {new Date(dream.createdAt).toLocaleDateString('zh-CN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          </>
        )}
      </div>
    </main>
  )
}

