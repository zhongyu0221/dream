# Dream Garden

An elegant dream journal application where users can upload images, narrate their dreams through voice, and let AI automatically organize and save them.

---

## Features

- 📸 **Image Upload**: Upload images as dream covers
- 🎤 **Voice Input**: Supports Chinese and English speech recognition with real-time transcription
- 🤖 **AI-Powered Organization**: AI automatically generates English summaries and titles
- 💬 **Conversational Interface**: Chat with AI to help better record dreams
- 💾 **Local Storage**: Save all dreams using SQLite database
- 🎨 **Elegant Design**: Dreamy visual design with smooth animations
- 📱 **Responsive Design**: Supports various devices

## Tech Stack

### Frontend Framework
- **Next.js 14** - React framework using App Router
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework

### Backend Services
- **Next.js API Routes** - Server-side API routes
- **Prisma ORM** - Database ORM tool
- **SQLite** - Lightweight database

### AI Services
- **Google Gemini 2.5 Flash** - AI conversation, summary generation, and title generation
- **@google/generative-ai** - Gemini API client

### Speech Recognition
- **Web Speech API** (webkitSpeechRecognition) - Browser-native speech recognition
- Supports Chinese and English recognition (mixed language support)

### UI/UX
- **Cormorant Garamond** - Elegant serif font from Google Fonts
- **Framer Motion** - Animation library (used in some pages)
- **Canvas API** - Particle effects and image processing
- **CSS Animations** - Custom animation effects

### Image Processing
- **Next.js Image** - Optimized image component
- **FileReader API** - Image preview
- **Canvas API** - Particle image effects

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS compatibility

## Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

**Get Gemini API Key:**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add the key to your `.env.local` file

### 3. Initialize Database

```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Usage

1. **Upload Image**: Click the upload area to select an image as your dream cover
2. **Start Sharing**: Click the "Share..." button and describe your dream using voice (supports Chinese, English, or mixed)
3. **Continue Conversation**: Click "Continue" to chat with AI and help better record your dream
4. **Save Dream**: Click "Save Memory" button, AI will automatically generate English summary and title and save it
5. **View Dreams**: Click "my dreams..." to view all saved dreams

## Core Features

### Speech Recognition
- Uses browser-native Web Speech API
- Supports Chinese (zh-CN) recognition, can recognize mixed Chinese-English input
- Real-time display of interim and final transcription results
- Requires Chrome or Edge browser

### AI Features
- **Conversation Response**: AI responds with warm, encouraging tone
- **Summary Generation**: Summarizes user input into first-person English summary (using "I..." format)
- **Title Generation**: Generates concise English titles based on summaries

### Data Storage
- Images saved in `public/uploads/` directory
- Dream data stored in SQLite database `prisma/dream.db`
- Each dream contains: title, summary, raw conversation, cover image, creation time

## Design Style

The application adopts a dreamy, elegant design style:
- **Color Scheme**: Dark background (#1a1a18) with gold, green, and purple gradients
- **Typography**: Cormorant Garamond elegant serif font
- **Visual Effects**:
  - Particle background animations
  - Gradient glow effects
  - Smooth transition animations
  - Soft shadows and hover effects

## Project Structure

```
dream/
├── app/                    # Next.js App Router
│   ├── api/                # API routes
│   │   ├── chat/           # AI conversation endpoint
│   │   ├── dreams/         # Dream CRUD endpoints
│   │   ├── generate-summary/ # Summary generation endpoint
│   │   ├── process-dream/  # Title generation endpoint
│   │   └── upload/         # Image upload endpoint
│   ├── dream/[id]/         # Dream detail page
│   ├── layout.tsx           # Root layout
│   ├── page.tsx            # Main page
│   └── globals.css         # Global styles
├── components/             # React components
│   ├── DreamSavedModal.tsx # Save success modal
│   ├── ExtendedParticles.tsx # Extended particle effects
│   ├── ParticleBackground.tsx # Background particles
│   └── ParticleImage.tsx   # Particle image
├── lib/                    # Utility functions
│   ├── openai.ts          # Gemini AI integration (name kept for compatibility)
│   └── prisma.ts          # Prisma client
├── prisma/                 # Database
│   ├── schema.prisma      # Database schema
│   └── dream.db           # SQLite database file
├── public/                 # Static files
│   └── uploads/           # Uploaded images
├── .env.local             # Environment variables (not committed to Git)
├── next.config.js         # Next.js configuration
├── tailwind.config.ts     # Tailwind configuration
└── package.json           # Project dependencies
```

## Important Notes

- **Browser Requirements**: Speech recognition requires Chrome or Edge browser (uses Web Speech API)
- **API Key**: Gemini API key must be configured to use AI features
- **Network Connection**: Speech recognition and AI features require internet connection
- **Image Storage**: Images are saved locally in `public/uploads` directory
- **Database**: Uses SQLite local database, data file located at `prisma/dream.db`

## Development Commands

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Code linting
npm run lint

# Database operations
npx prisma db push      # Push database changes
npx prisma studio       # Open database management interface
```

## Technical Details

### AI Integration
- Uses Google Gemini 2.5 Flash model
- All AI-generated content is in English
- Supports translating and summarizing Chinese input into English

### Speech Recognition
- Uses `webkitSpeechRecognition` API
- Language setting: `zh-CN` (can recognize mixed Chinese-English)
- Real-time display of interim and final results

### Image Processing
- Supports common image formats (JPG, PNG, GIF, etc.)
- Uses Next.js Image component for optimized loading
- Particle effects implemented using Canvas API

## License

MIT License

---

# 梦境花园

一个优雅的梦境记录应用，用户可以上传图片，通过语音讲述梦境，AI会自动整理和保存。

---

## 功能特性

- 📸 **图片上传**：上传图片作为梦境封面
- 🎤 **语音输入**：支持中英文语音识别，实时显示转录文本
- 🤖 **AI智能整理**：AI自动生成英文摘要和标题
- 💬 **对话式交互**：与AI对话，帮助更好地记录梦境
- 💾 **本地存储**：使用SQLite数据库保存所有梦境
- 🎨 **优雅设计**：梦幻的视觉设计和流畅的动画效果
- 📱 **响应式设计**：支持各种设备访问

## 技术栈

### 前端框架
- **Next.js 14** - React框架，使用App Router
- **React 18** - UI库
- **TypeScript** - 类型安全
- **Tailwind CSS** - 实用优先的CSS框架

### 后端服务
- **Next.js API Routes** - 服务端API路由
- **Prisma ORM** - 数据库ORM工具
- **SQLite** - 轻量级数据库

### AI服务
- **Google Gemini 2.5 Flash** - AI对话、摘要生成和标题生成
- **@google/generative-ai** - Gemini API客户端

### 语音识别
- **Web Speech API** (webkitSpeechRecognition) - 浏览器原生语音识别
- 支持中文和英文识别（中英文混合）

### UI/UX
- **Cormorant Garamond** - Google Fonts优雅衬线字体
- **Framer Motion** - 动画库（部分页面使用）
- **Canvas API** - 粒子效果和图像处理
- **CSS Animations** - 自定义动画效果

### 图片处理
- **Next.js Image** - 优化的图片组件
- **FileReader API** - 图片预览
- **Canvas API** - 粒子化图像效果

### 开发工具
- **ESLint** - 代码检查
- **PostCSS** - CSS处理
- **Autoprefixer** - CSS兼容性

## 安装和运行

### 1. 安装依赖

```bash
npm install
```

### 2. 设置环境变量

创建 `.env.local` 文件：

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

**获取 Gemini API Key：**
1. 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 创建新的API密钥
3. 将密钥添加到 `.env.local` 文件中

### 3. 初始化数据库

```bash
npx prisma generate
npx prisma db push
```

### 4. 运行开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 使用说明

1. **上传图片**：点击上传区域选择一张图片作为梦境封面
2. **开始分享**：点击"Share..."按钮，用语音描述你的梦境（支持中文、英文或中英文混合）
3. **继续对话**：点击"Continue"按钮，与AI对话，帮助更好地记录梦境
4. **保存梦境**：点击"Save Memory"按钮，AI会自动生成英文摘要和标题并保存
5. **查看梦境**：点击"my dreams..."查看所有已保存的梦境

## 核心功能说明

### 语音识别
- 使用浏览器原生Web Speech API
- 支持中文（zh-CN）识别，可识别中英文混合输入
- 实时显示临时转录结果和最终确认结果
- 需要Chrome或Edge浏览器

### AI功能
- **对话回复**：AI以温暖、鼓励的语气回复用户
- **摘要生成**：将用户输入总结为第一人称英文摘要（"I..."格式）
- **标题生成**：基于摘要生成简洁的英文标题

### 数据存储
- 图片保存在 `public/uploads/` 目录
- 梦境数据存储在SQLite数据库 `prisma/dream.db`
- 每个梦境包含：标题、摘要、原始对话、封面图片、创建时间

## 设计风格

本应用采用梦幻、优雅的设计风格：
- **配色方案**：深色背景（#1a1a18）配合金色、绿色、紫色渐变
- **字体**：Cormorant Garamond优雅衬线字体
- **视觉效果**：
  - 粒子背景动画
  - 渐变光晕效果
  - 流畅的过渡动画
  - 柔和的阴影和悬停效果

## 项目结构

```
dream/
├── app/                    # Next.js App Router
│   ├── api/                # API路由
│   │   ├── chat/           # AI对话接口
│   │   ├── dreams/         # 梦境CRUD接口
│   │   ├── generate-summary/ # 摘要生成接口
│   │   ├── process-dream/  # 标题生成接口
│   │   └── upload/         # 图片上传接口
│   ├── dream/[id]/         # 梦境详情页
│   ├── layout.tsx           # 根布局
│   ├── page.tsx            # 主页面
│   └── globals.css         # 全局样式
├── components/             # React组件
│   ├── DreamSavedModal.tsx # 保存成功模态框
│   ├── ExtendedParticles.tsx # 扩展粒子效果
│   ├── ParticleBackground.tsx # 背景粒子
│   └── ParticleImage.tsx   # 粒子化图片
├── lib/                    # 工具函数
│   ├── openai.ts          # Gemini AI集成（命名保持兼容）
│   └── prisma.ts          # Prisma客户端
├── prisma/                 # 数据库
│   ├── schema.prisma      # 数据库模型
│   └── dream.db           # SQLite数据库文件
├── public/                 # 静态文件
│   └── uploads/           # 上传的图片
├── .env.local             # 环境变量（不提交到Git）
├── next.config.js         # Next.js配置
├── tailwind.config.ts     # Tailwind配置
└── package.json           # 项目依赖
```

## 注意事项

- **浏览器要求**：语音识别功能需要Chrome或Edge浏览器（使用Web Speech API）
- **API密钥**：需要配置Gemini API密钥才能使用AI功能
- **网络连接**：语音识别和AI功能需要网络连接
- **图片存储**：图片保存在本地 `public/uploads` 目录
- **数据库**：使用SQLite本地数据库，数据文件位于 `prisma/dream.db`

## 开发命令

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint

# 数据库操作
npx prisma db push      # 推送数据库变更
npx prisma studio       # 打开数据库管理界面
```

## 技术细节

### AI集成
- 使用Google Gemini 2.5 Flash模型
- 所有AI生成内容统一为英文
- 支持将中文输入翻译并总结为英文

### 语音识别
- 使用 `webkitSpeechRecognition` API
- 语言设置：`zh-CN`（可识别中英文混合）
- 实时显示临时结果和最终结果

### 图片处理
- 支持常见图片格式（JPG, PNG, GIF等）
- 使用Next.js Image组件优化加载
- 粒子效果使用Canvas API实现

## 许可证

MIT License
