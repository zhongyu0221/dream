# 梦境花园 - Dream Journal

一个优雅的梦境记录应用，用户可以上传图片，通过语音讲述梦境，AI会自动整理和保存。

## 功能特性

- 📸 图片上传作为梦境封面
- 🎤 语音输入记录梦境（支持中文）
- 🤖 AI自动整理和美化梦境内容
- 💾 本地数据库存储
- 🎨 优雅的视觉设计和交互体验
- ✨ 流畅的动画和过渡效果
- 📱 响应式设计，支持各种设备

## 技术栈

- **前端**: Next.js 14, React, TypeScript, Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: SQLite + Prisma ORM
- **AI**: OpenAI GPT-4

## 安装和运行

### 1. 安装依赖

```bash
npm install
```

### 2. 设置环境变量

创建 `.env` 文件：

```env
OPENAI_API_KEY=your_openai_api_key_here
```

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

1. **上传图片**: 点击上传区域选择一张图片作为梦境封面
2. **开始讲述**: 点击"开始讲述"按钮，用语音描述你的梦境
3. **保存梦境**: 点击"保存梦境"按钮，AI会自动整理内容并保存
4. **查看梦境**: 点击"我的梦境"查看所有已保存的梦境

## 设计风格

本应用的设计灵感来源于 Penderecki's Garden，采用：
- 优雅的古典配色方案（米白色背景、棕色系主色调）
- 精致的排版和字体（Georgia 等衬线字体）
- 流畅的动画和过渡效果
- 纸张质感的视觉元素
- 柔和的阴影和悬停效果

## 注意事项

- 语音识别功能需要Chrome或Edge浏览器（使用Web Speech API）
- 需要配置OpenAI API密钥才能使用AI整理功能
- 如果没有API密钥，应用仍可保存梦境，但不会进行AI整理
- 图片会保存在 `public/uploads` 目录
- 数据库文件位于 `prisma/dream.db`

## 项目结构

```
dream/
├── app/              # Next.js App Router
│   ├── api/          # API路由
│   ├── dream/        # 梦境详情页
│   └── page.tsx      # 主页面
├── lib/              # 工具函数
├── prisma/           # 数据库schema
└── public/           # 静态文件
```

