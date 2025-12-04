'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import ParticleBackground from '@/components/ParticleBackground'
import ParticleImage, { ParticleImageHandle } from '@/components/ParticleImage'
import ExtendedParticles from '@/components/ExtendedParticles'
import DreamSavedModal from '@/components/DreamSavedModal'

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
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([])
  const [isWaitingForAI, setIsWaitingForAI] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0) // Recording duration in seconds
  const [recordingTimer, setRecordingTimer] = useState<NodeJS.Timeout | null>(null)
  const [showSavedModal, setShowSavedModal] = useState(false)
  const [savedDreamTitle, setSavedDreamTitle] = useState<string>('')
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<any>(null)
  const particleImageRef = useRef<ParticleImageHandle>(null)
  const conversationEndRef = useRef<HTMLDivElement>(null)
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const [imageContainerRect, setImageContainerRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null)

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
        // 更新容器位置信息
        setTimeout(() => {
          updateImageContainerRect()
        }, 100)
      }
      reader.readAsDataURL(file)
    }
  }

  // 更新图片容器位置信息
  const updateImageContainerRect = () => {
    if (imageContainerRef.current) {
      const rect = imageContainerRef.current.getBoundingClientRect()
      setImageContainerRect({
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      })
    }
  }

  // 监听窗口大小变化
  useEffect(() => {
    if (imagePreview) {
      updateImageContainerRect()
      window.addEventListener('resize', updateImageContainerRect)
      return () => {
        window.removeEventListener('resize', updateImageContainerRect)
      }
    }
  }, [imagePreview])

  // 开始录音
  const startRecording = () => {
    // 如果已经在录音，先停止
    if (isRecording && recognitionRef.current) {
      stopRecording()
      return
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Your browser does not support speech recognition. Please use Chrome or Edge.')
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
      
      recognition.lang = 'en-US'
      recognition.continuous = true
      recognition.interimResults = true

      recognition.onstart = () => {
        setIsRecording(true)
        setRecordingTime(0)
        if (!transcript) {
          setTranscript('')
        }
        // Start timer
        const timer = setInterval(() => {
          setRecordingTime((prev) => prev + 1)
        }, 1000)
        setRecordingTimer(timer)
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

        // 更新临时转录文本（用于显示）
        setTranscript((prev) => {
          const existingFinal = prev.split('\n').filter(line => line.trim()).join('\n')
          return existingFinal ? `${existingFinal}\n${finalTranscript}${interimTranscript}` : `${finalTranscript}${interimTranscript}`
        })

        // 如果有最终结果，添加到对话历史（不自动获取AI回复）
        if (finalTranscript.trim()) {
          const userMessage = finalTranscript.trim()
          setConversationHistory((prev) => {
            // 检查是否已经添加过这条消息（避免重复）
            const lastUserMessage = prev.filter(msg => msg.role === 'user').pop()
            if (lastUserMessage?.content === userMessage) {
              return prev
            }
            return [...prev, { role: 'user' as const, content: userMessage }]
          })
        }
      }

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        
        // 处理特定错误
        if (event.error === 'no-speech') {
          // 没有检测到语音，继续录音
          return
        } else if (event.error === 'audio-capture') {
          alert('Unable to access microphone. Please check your permissions.')
        } else if (event.error === 'not-allowed') {
          alert('Microphone permission denied. Please allow access in browser settings.')
        }
        
        setIsRecording(false)
        if (recordingTimer) {
          clearInterval(recordingTimer)
          setRecordingTimer(null)
        }
        setRecordingTime(0)
        recognitionRef.current = null
      }

      recognition.onend = () => {
        // 只有在用户没有手动停止时才自动重启（可选）
        // 这里我们设置为停止状态
        setIsRecording(false)
        if (recordingTimer) {
          clearInterval(recordingTimer)
          setRecordingTimer(null)
        }
        recognitionRef.current = null
      }

      recognition.start()
      recognitionRef.current = recognition
    } catch (error) {
      console.error('Error starting recognition:', error)
      alert('Failed to start speech recognition. Please try again.')
      setIsRecording(false)
    }
  }

  // Continue conversation - Get AI response
  const continueConversation = async () => {
    if (conversationHistory.length === 0) {
      alert('Please start sharing your dream first')
      return
    }

    setIsWaitingForAI(true)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationHistory }),
      })
      const { message } = await response.json()
      
      setConversationHistory((prev) => [...prev, { role: 'assistant' as const, content: message }])
    } catch (error) {
      console.error('Error getting AI response:', error)
      setConversationHistory((prev) => [...prev, { role: 'assistant' as const, content: 'I\'m here listening, please continue sharing your dream...' }])
    } finally {
      setIsWaitingForAI(false)
      // 滚动到底部
      setTimeout(() => {
        conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
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
    if (recordingTimer) {
      clearInterval(recordingTimer)
      setRecordingTimer(null)
    }
  }

  // Cancel recording and clear transcript
  const cancelRecording = () => {
    stopRecording()
    setTranscript('')
    setConversationHistory([])
    setRecordingTime(0)
  }

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Save dream
  const saveDream = async () => {
    if (!image) {
      alert('Please upload an image first')
      return
    }

    if (conversationHistory.length === 0) {
      alert('Please share your dream first')
      return
    }

    setIsProcessing(true)

    try {
      // 1. 上传原始图片作为封面
      const formData = new FormData()
      formData.append('file', image)
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const result = await uploadResponse.json()
      const imageUrl = result.imageUrl

      // 2. 提取所有用户输入
      const allUserInput = conversationHistory
        .filter(msg => msg.role === 'user')
        .map(msg => msg.content)
        .join('\n\n')

      if (!allUserInput.trim()) {
        alert('No user input found to save')
        setIsProcessing(false)
        return
      }

      // 3. 发送所有用户输入给AI，要求生成梦境摘要
      let summary: string
      try {
        const summaryResponse = await fetch('/api/generate-summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            conversationHistory,
            userInput: allUserInput 
          }),
        })
        
        if (!summaryResponse.ok) {
          const errorData = await summaryResponse.json().catch(() => ({}))
          const errorMessage = errorData.message || errorData.error || 'Unknown error'
          console.error('Summary generation failed:', errorMessage)
          alert(`Failed to generate dream summary: ${errorMessage}\n\nPlease check:\n1. Your Gemini API key is set in .env.local\n2. You have sufficient API credits\n3. Your internet connection is working`)
          setIsProcessing(false)
          return
        }

        const summaryData = await summaryResponse.json()
        summary = summaryData.summary

        if (!summary || !summary.trim()) {
          console.error('Empty summary received')
          alert('Failed to generate dream summary: Empty response. Please try again.')
          setIsProcessing(false)
          return
        }

        // 验证摘要不是原始输入的简单重复
        // 但允许摘要包含原始输入的一部分（因为可能是合理的总结）
        const summaryWords = summary.trim().split(/\s+/).length
        const inputWords = allUserInput.trim().split(/\s+/).length
        
        // 如果摘要和输入几乎完全相同（超过90%相似度），可能是生成失败
        if (summary.trim() === allUserInput.trim() || 
            (summaryWords > inputWords * 0.9 && summaryWords < inputWords * 1.1 && summary.includes(allUserInput))) {
          console.warn('Summary is too similar to raw input')
          // 不阻止保存，但记录警告
          console.warn('Proceeding with summary that may be too similar to input')
        }

        console.log('AI Summary generated:', summary.substring(0, 100) + '...')
      } catch (error) {
        console.error('Error calling summary API:', error)
        alert(`Failed to generate dream summary: ${error instanceof Error ? error.message : 'Network error'}\n\nPlease check your Gemini API key and try again.`)
        setIsProcessing(false)
        return
      }

      // 4. 基于摘要生成标题
      const processResponse = await fetch('/api/process-dream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: summary }),
      })
      
      if (!processResponse.ok) {
        alert('Failed to generate dream title')
        setIsProcessing(false)
        return
      }

      const { title } = await processResponse.json()
      
      // 使用AI生成的摘要作为内容（确保不是原始输入）
      const content = summary.trim()

      // 4. 保存到数据库
      // rawContent保存原始对话（可选，用于备份）
      const rawContent = conversationHistory
        .map(msg => `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`)
        .join('\n\n')
      
      const saveResponse = await fetch('/api/dreams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content, // AI生成的温暖总结（这是主要显示的内容）
          rawContent, // 原始对话内容（备份，不显示）
          imageUrl, // 上传的原图作为封面
        }),
      })

      if (saveResponse.ok) {
        // 显示梦幻确认窗口
        setSavedDreamTitle(title)
        setShowSavedModal(true)
        
        // 重置表单
        setImage(null)
        setImagePreview('')
        setTranscript('')
        setConversationHistory([])
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        loadDreams()
      }
    } catch (error) {
      console.error('Error saving dream:', error)
      alert('Failed to save. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  // 初始化时加载梦境列表
  useEffect(() => {
    loadDreams()
  }, [])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (recordingTimer) {
        clearInterval(recordingTimer)
      }
    }
  }, [recordingTimer])

  return (
    <>
      {/* 梦幻保存确认模态窗口 */}
      <DreamSavedModal 
        isOpen={showSavedModal}
        onClose={() => setShowSavedModal(false)}
        dreamTitle={savedDreamTitle}
      />
      
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
          <h1 className="text-2xl font-serif bg-gradient-to-r from-[#7a9b7a] via-[#d4af37] to-[#6b8db8] bg-clip-text text-transparent tracking-wider font-normal bloom-colorful">Dream Garden</h1>
          <button
            onClick={() => {
              setShowList(!showList)
              if (!showList) {
                loadDreams()
              }
            }}
            className="px-8 py-3 bg-gradient-to-r from-[#7a9b7a]/20 via-[#d4af37]/20 to-[#6b8db8]/20 backdrop-blur-md border border-[#7a9b7a]/40 rounded-full hover:from-[#7a9b7a]/30 hover:via-[#d4af37]/30 hover:to-[#6b8db8]/30 hover:border-[#d4af37]/60 transition-all duration-500 font-serif text-sm tracking-wider relative overflow-hidden group shadow-[0_0_15px_rgba(122,155,122,0.2)] hover:shadow-[0_0_25px_rgba(212,175,55,0.4)]"
          >
            <span className="relative z-10 bg-gradient-to-r from-[#7a9b7a] via-[#d4af37] to-[#6b8db8] bg-clip-text text-transparent group-hover:from-[#8aab8a] group-hover:via-[#e5d4a0] group-hover:to-[#7b9dc8] transition-all duration-500">
              {showList ? '← Back' : 'my dreams...'}
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-[#7a9b7a]/10 via-[#d4af37]/10 to-[#6b8db8]/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500 rounded-full"></span>
            {/* 梦幻光晕效果 */}
            <span className="absolute inset-0 bg-gradient-to-r from-[#7a9b7a]/0 via-[#d4af37]/20 to-[#6b8db8]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full blur-sm"></span>
          </button>
        </div>
      </nav>

      <div className="relative z-10">
        {!showList ? (
          <>
            {/* 主页面 - 创建新梦境 */}
            <div className="relative w-full h-screen">
            {/* 标题区域 - 绝对定位在顶部 */}
            {!imagePreview && (
              <div className="absolute top-24 left-0 right-0 z-20 text-center fade-in-slow">
                <div className="inline-block mb-6">
                  <h2 className="text-6xl font-serif bg-gradient-to-r from-[#7a9b7a] via-[#d4af37] to-[#6b8db8] bg-clip-text text-transparent mb-4 tracking-wider font-normal leading-tight bloom-colorful">
                    Record Your Dream
                  </h2>
                  <div className="h-0.5 w-24 mx-auto bg-gradient-to-r from-transparent via-[#7a9b7a]/60 via-[#d4af37]/60 via-[#6b8db8]/60 to-transparent"></div>
                </div>
                <p className="text-lg text-[#b8b6b1] max-w-2xl mx-auto leading-relaxed font-light tracking-wide">
                  Capture fleeting moments, pour in your heart's desire.
                </p>
              </div>
            )}

            {/* 图片上传区域 - 主图占60%，周围是延伸的粒子 */}
            <div className="fixed inset-0 w-full h-full flex items-center justify-center overflow-hidden"
                 onClick={() => !imagePreview && fileInputRef.current?.click()}>
              {imagePreview ? (
                <>
                  {/* 延伸的彩色粒子效果 */}
                  {imageContainerRect && (
                    <ExtendedParticles 
                      imageSrc={imagePreview} 
                      containerRect={imageContainerRect}
                    />
                  )}
                  
                  {/* 主图容器 - 占60% */}
                  <div 
                    ref={imageContainerRef}
                    className="relative w-[60vw] h-[60vh] max-w-[60vw] max-h-[60vh] overflow-visible dream-image-container"
                    style={{ aspectRatio: '1 / 1' }}
                  >
                    <ParticleImage
                      ref={particleImageRef}
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full"
                    />
                    {/* 光影叠加层 - 更轻微 */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a18]/8 via-transparent to-transparent pointer-events-none z-[3]"></div>
                    {/* 彩色光晕 - 更轻微 */}
                    <div className="absolute inset-0 bg-gradient-radial from-[#7a9b7a]/4 via-[#d4af37]/3 via-[#6b8db8]/4 to-transparent pointer-events-none z-[3]"></div>
                  </div>
                </>
              ) : (
                <div className="py-40 text-center cursor-pointer group relative z-10">
                  <svg className="mx-auto h-24 w-24 text-[#7a6b5a]/20 group-hover:text-[#7a6b5a]/40 transition-all duration-500 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-8 bg-gradient-to-r from-[#7a9b7a] via-[#d4af37] to-[#6b8db8] bg-clip-text text-transparent text-xl font-normal tracking-wide">Click to Upload Image</p>
                  <p className="mt-3 text-[#9a9893] text-sm font-light">Supports JPG, PNG formats</p>
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
                {/* 主录音按钮 - 小圆形麦克风图标 */}
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isProcessing}
                  className={`w-20 h-20 rounded-full border-2 transition-all duration-300 relative ${
                    isRecording
                      ? 'border-[#ff6b9d] bg-gradient-to-br from-[#ff6b9d]/20 via-[#c44569]/20 to-[#ff6b9d]/20'
                      : 'border-[#7a9b7a] bg-gradient-to-br from-[#7a9b7a]/20 via-[#d4af37]/20 to-[#6b8db8]/20 hover:from-[#8aab8a]/30 hover:via-[#e5d4a0]/30 hover:to-[#7b9dc8]/30'
                  }`}
                >
                  {/* 录音时的脉冲动画 */}
                  {isRecording && (
                    <>
                      <div className="absolute inset-0 rounded-full border-2 border-[#ff6b9d] animate-ping opacity-75"></div>
                      <div className="absolute inset-0 rounded-full border-2 border-[#ff6b9d] animate-pulse"></div>
                    </>
                  )}
                  
                  {/* 麦克风图标 */}
                  <div className="relative z-10 flex items-center justify-center h-full">
                    {isRecording ? (
                      <svg className="w-8 h-8 text-[#ff6b9d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    ) : (
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24">
                        <defs>
                          <linearGradient id="micGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#7a9b7a" />
                            <stop offset="50%" stopColor="#d4af37" />
                            <stop offset="100%" stopColor="#6b8db8" />
                          </linearGradient>
                        </defs>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} stroke="url(#micGradient)" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    )}
                  </div>
                </button>

                {/* 控制按钮组 - 只在录音时或对话历史存在时显示 */}
                {(isRecording || conversationHistory.length > 0) && (
                  <div className="flex items-center space-x-3">
                    {/* 计时器显示 - 只在录音时显示 */}
                    {isRecording && (
                      <div className="px-4 py-2 rounded-full border border-[#ff6b9d]/60 bg-gradient-to-r from-[#ff6b9d]/10 via-[#c44569]/10 to-[#ff6b9d]/10 backdrop-blur-md">
                        <span className="text-[#ff6b9d] font-mono text-sm tracking-wider">
                          {formatTime(recordingTime)}
                        </span>
                      </div>
                    )}

                    {/* Save Memory 按钮 - 只在有对话历史且不在录音时显示 */}
                    {conversationHistory.length > 0 && !isRecording && (
                      <button
                        onClick={saveDream}
                        disabled={isProcessing}
                        className="px-4 py-2 rounded-full border-2 bg-gradient-to-r from-[#7a9b7a] via-[#d4af37] to-[#6b8db8] border-transparent hover:from-[#8aab8a] hover:via-[#e5d4a0] hover:to-[#7b9dc8] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-[0_0_15px_rgba(122,155,122,0.3)]"
                      >
                        <span className="text-white font-normal text-sm tracking-wide">
                          Save Memory
                        </span>
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    )}

                    {/* Cancel 按钮 - 只在录音时显示 */}
                    {isRecording && (
                      <button
                        onClick={cancelRecording}
                        disabled={isProcessing}
                        className="w-10 h-10 rounded-full border-2 border-[#ff6b9d] bg-gradient-to-br from-[#ff6b9d]/10 via-[#c44569]/10 to-[#ff6b9d]/10 hover:from-[#ff6b9d]/20 hover:via-[#c44569]/20 hover:to-[#ff6b9d]/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        <svg className="w-5 h-5 text-[#ff6b9d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}

                    {/* Continue 按钮 - 只在有对话历史且不在录音时显示 */}
                    {conversationHistory.length > 0 && !isRecording && (
                      <button
                        onClick={continueConversation}
                        disabled={isProcessing || isWaitingForAI}
                        className="px-4 py-2 rounded-full border-2 bg-gradient-to-r from-[#9b7ab8] via-[#d4af37] to-[#7ab8b8] border-transparent hover:from-[#ab8ac8] hover:via-[#e5d4a0] hover:to-[#8ac8c8] text-white font-normal text-sm tracking-wide transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(155,122,184,0.3)]"
                      >
                        Continue
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 对话显示 */}
            <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20 w-full max-w-4xl px-8 mt-96">
              <div className="w-full bg-black/30 backdrop-blur-md rounded-sm min-h-[200px] max-h-[400px] overflow-y-auto shadow-lg relative">
                  {conversationHistory.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-[#9a9893] text-sm font-light">Start sharing your dream, I'm here to listen...</p>
                    </div>
                  ) : (
                    <div className="p-6 space-y-4">
                      {conversationHistory.map((message, index) => (
                        <div
                          key={index}
                          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[75%] rounded-lg px-4 py-3 ${
                              message.role === 'user'
                                ? 'bg-gradient-to-r from-[#7a9b7a]/60 via-[#d4af37]/60 to-[#6b8db8]/60 text-white'
                                : 'bg-black/40 text-[#e8e6e1] border border-[#3a3a37]/50'
                            }`}
                          >
                            <p className="text-sm leading-relaxed font-light tracking-wide whitespace-pre-wrap">
                              {message.content}
                            </p>
                          </div>
                        </div>
                      ))}
                      {isWaitingForAI && (
                        <div className="flex justify-start">
                          <div className="bg-black/40 text-[#e8e6e1] border border-[#3a3a37]/50 rounded-lg px-4 py-3">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-[#d4af37] rounded-full animate-pulse"></div>
                              <div className="w-2 h-2 bg-[#d4af37] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                              <div className="w-2 h-2 bg-[#d4af37] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                          </div>
                        </div>
                      )}
                      {transcript && !conversationHistory.some(msg => msg.content === transcript.trim()) && (
                        <div className="flex justify-end">
                          <div className="max-w-[75%] rounded-lg px-4 py-3 bg-gradient-to-r from-[#7a9b7a]/40 via-[#d4af37]/40 to-[#6b8db8]/40 text-white/70">
                            <p className="text-sm leading-relaxed font-light tracking-wide italic">
                              {transcript.split('\n').pop()}
                            </p>
                          </div>
                        </div>
                      )}
                      <div ref={conversationEndRef} />
                    </div>
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
              <h2 className="text-5xl font-serif bg-gradient-to-r from-[#7a9b7a] via-[#d4af37] to-[#6b8db8] bg-clip-text text-transparent mb-4 tracking-wider font-normal bloom-colorful">My Dreams</h2>
              <div className="h-0.5 w-32 mx-auto bg-gradient-to-r from-transparent via-[#7a9b7a]/60 via-[#d4af37]/60 via-[#6b8db8]/60 to-transparent"></div>
            </div>
            {dreams.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-[#9a9893] text-lg font-light tracking-wide">No dreams recorded yet</p>
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
                        {new Date(dream.createdAt).toLocaleDateString('en-US', {
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
    </>
  )
}

