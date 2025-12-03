# Garden Landing Page - 快速开始

## ✅ 已完成的功能

### 1. 页面结构
- ✅ 全屏Hero区域，带视差滚动效果
- ✅ 粘性导航栏，滚动时改变透明度
- ✅ 多个内容区块（Section），支持左右交替布局
- ✅ 响应式页脚

### 2. 动画效果
- ✅ Framer Motion驱动的平滑动画
- ✅ 滚动视差背景效果
- ✅ 淡入/滑入动画（进入视口时触发）
- ✅ 悬停交互效果
- ✅ 平滑滚动导航

### 3. 设计风格
- ✅ 深色背景 (#1a1a18)
- ✅ 金色强调色 (#d4af37)
- ✅ 优雅的衬线字体
- ✅ 大量留白，高端奢华风格
- ✅ 完全响应式设计

## 🚀 立即查看

访问: **http://localhost:3000/garden**

## 📝 快速修改内容

### 修改Hero区域文字

编辑 `components/garden/Hero.tsx`:

```typescript
// 第45行 - 小标题
"Jeżeli to możliwe, załóż słuchawki"

// 第54行 - 主标题
"Ogród Pendereckiego"

// 第63-65行 - 描述文字
"Krzysztof Penderecki uwielbiał..."

// 第78行 - 按钮文字
"Wejdź"
```

### 修改背景图片

在 `components/garden/Hero.tsx` 第25行:

```typescript
// 替换为你的图片路径
bg-[url('/your-hero-image.jpg')]
```

### 添加/删除内容区块

在 `app/garden/page.tsx` 中添加或删除 `<Section />` 组件。

### 修改导航菜单

编辑 `components/garden/Navigation.tsx` 第10-17行的 `menuItems` 数组。

## 🎨 自定义颜色

所有颜色都在组件中直接定义，使用 Tailwind 类:

- `bg-[#1a1a18]` - 背景色
- `text-[#d4af37]` - 金色文字
- `text-[#e8e6e1]` - 主文字色
- `border-[#3a3a37]` - 边框色

搜索并替换这些颜色值即可。

## 📦 技术栈

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion** (动画库)

## 📚 详细文档

查看 `GARDEN_PAGE_README.md` 获取完整的使用说明。

## 🖼️ 图片建议

### Hero背景图
- 尺寸: 1920x1080px 或更大
- 格式: JPG, PNG
- 风格: 优雅、高端、与主题相关

### Section图片
- 尺寸: 800x600px 或更大
- 格式: JPG, PNG
- 风格: 与内容相关的高质量图片

## ✨ 特色功能

1. **视差滚动**: Hero背景图片会随滚动移动
2. **智能导航**: 滚动时导航栏自动改变样式
3. **平滑动画**: 所有元素都有优雅的进入动画
4. **响应式**: 完美适配手机、平板、桌面

## 🔧 下一步

1. 替换占位图片为真实图片
2. 修改文字内容
3. 根据需要调整颜色
4. 添加更多Section区块
5. 自定义动画速度（如需要）

