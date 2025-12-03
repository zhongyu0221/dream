# CSS类快速参考

所有电影级视觉效果的CSS类和使用方法。

## 🎬 核心效果类

### 胶片颗粒
```tsx
<FilmGrain /> // 组件，添加到页面最外层
```

### 光晕/发光
```tsx
<h1 className="bloom-gold">标题</h1>
<button className="bloom-effect">按钮</button>
```

### 柔光叠加
```tsx
<div className="soft-light-overlay">
  {/* 内容 */}
</div>
```

### 暗角
```tsx
<div className="vignette">
  {/* 图片 */}
</div>
```

### 电影调色
```tsx
<div className="cinematic-grade">
  <img src="image.jpg" />
</div>

<div className="cinematic-grade-strong">
  {/* 更强的调色效果 */}
</div>
```

### 光子感光层
```tsx
<div className="photon-layer">
  {/* 内容 */}
</div>
```

## 🎨 完整组合示例

### Hero区域（所有效果）
```tsx
<div className="cinematic-grade-strong">
  <div className="bg-[url('/image.jpg')]" />
  <div className="bg-gradient-to-b from-[#1a1a18]/70..." />
  <div className="soft-light-overlay" />
  <div className="vignette" />
  <div className="photon-layer" />
</div>
```

### Section图片（部分效果）
```tsx
<div className="cinematic-grade vignette">
  <img src="image.jpg" />
  <div className="soft-light-overlay" />
  <div className="photon-layer" />
</div>
```

## 📋 所有可用类

| CSS类 | 效果 | 使用场景 |
|-------|------|----------|
| `.film-grain` | 胶片颗粒纹理 | 全局覆盖（通过组件） |
| `.bloom-gold` | 金色光晕 | 标题、重要文字 |
| `.bloom-effect` | 光晕效果 | 按钮、交互元素 |
| `.soft-light-overlay` | 柔光叠加 | 图片、背景区域 |
| `.vignette` | 边缘暗角 | 图片、卡片 |
| `.cinematic-grade` | 电影调色 | 图片、背景 |
| `.cinematic-grade-strong` | 强化调色 | Hero背景 |
| `.photon-layer` | 光子感光 | 图片、背景 |
| `.glow-effect` | 悬停光晕 | 可交互元素 |
| `.particle-glow` | 粒子光点 | 卡片、容器 |
| `.golden-glow` | 金色光效 | 卡片、容器 |
| `.hover-lift` | 悬停提升 | 卡片、按钮 |
| `.card-shadow` | 卡片阴影 | 卡片容器 |
| `.paper-texture` | 纸张质感 | 卡片、容器 |

## 🎯 推荐组合

### 图片容器（完整效果）
```tsx
<div className="cinematic-grade vignette soft-light-overlay photon-layer">
  <img src="image.jpg" />
</div>
```

### 文字标题（光晕效果）
```tsx
<h1 className="bloom-gold">标题</h1>
```

### 按钮（光晕+悬停）
```tsx
<button className="bloom-effect hover-lift">
  按钮文字
</button>
```

### 卡片（质感+阴影）
```tsx
<div className="card-shadow paper-texture hover-lift">
  {/* 内容 */}
</div>
```

## ⚙️ 自定义

所有效果都在 `app/globals.css` 中定义，可以直接修改参数调整强度。

