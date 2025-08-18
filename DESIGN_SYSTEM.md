# 🎨 SaaS AI营销平台 - 设计系统

现代化的SaaS应用设计系统，基于紫色品牌色调，提供统一的视觉语言和组件规范。

## 📋 目录

- [设计原则](#设计原则)
- [颜色系统](#颜色系统)
- [组件规范](#组件规范)
- [使用指南](#使用指南)
- [主题切换](#主题切换)
- [最佳实践](#最佳实践)

## 🎯 设计原则

### 1. 现代感 (Modern)
- 使用渐变、阴影和微交互提升视觉体验
- 采用现代化的紫色系品牌色调
- 圆角和阴影营造层次感

### 2. 专业性 (Professional)
- 保持清晰的信息层次结构
- 统一的间距和排版系统
- 专业的色彩搭配

### 3. 数据驱动 (Data-Driven)
- 突出数据可视化和分析功能
- 优化图表和表格的展示效果
- 提供丰富的数据展示组件

### 4. 高效性 (Efficient)
- 提高信息密度，减���无效空间
- 优化操作流程和交互体验
- 快速响应的微交互

## 🎨 颜色系统

### 主色调 (Primary)
```css
--primary: 259 94% 51%        /* 现代紫色 #6366f1 */
--primary-hover: 259 94% 46%  /* 悬停状态 */
--primary-light: 259 94% 95%  /* 浅色背景 */
```

### 功能色彩 (Semantic Colors)
```css
--success: 142 76% 36%        /* 成功绿色 #059669 */
--warning: 38 92% 50%         /* 警告橙色 #f59e0b */
--destructive: 0 84% 60%      /* 危险红色 #ef4444 */
--info: 217 91% 60%           /* 信息蓝色 #3b82f6 */
```

### 中性色彩 (Neutral Colors)
```css
--background: 0 0% 100%           /* 主背景 */
--background-secondary: 247 47% 99%  /* 次级背景 */
--foreground: 230 13% 9%          /* 主文本 */
--muted-foreground: 230 9% 46%    /* 辅助文本 */
```

## 🧩 组件规范

### 按钮 (Button)

#### 变体类型
- **Primary**: 主要操作按钮
- **Secondary**: 次要操作按钮  
- **Outline**: 边框按钮
- **Ghost**: 透明背景按钮
- **Destructive**: 危险操作按钮

#### 尺寸规格
- **Small**: `h-8 px-3 text-sm`
- **Medium**: `h-10 px-4 text-base` (默认)
- **Large**: `h-12 px-6 text-lg`
- **Icon**: `h-10 w-10`

#### 使用示例
```tsx
import { Button } from "@/components/ui/button";

// 主要按钮
<Button variant="default" size="md">
  创建策略
</Button>

// 次要按钮
<Button variant="secondary" size="md">
  取消
</Button>

// 危险操作
<Button variant="destructive" size="sm">
  删除
</Button>
```

### 卡片 (Card)

#### 阴影层级
- **Flat**: 无阴影，仅边框
- **Low**: 浅阴影 `shadow-sm`
- **Medium**: 中等阴影 `shadow-md`
- **High**: 深阴影 `shadow-lg`

#### 内边距规格
- **Tight**: `p-4` (16px)
- **Normal**: `p-6` (24px) 
- **Loose**: `p-8` (32px)

### 状态指示器 (Status)

#### 状态类型
```tsx
// 成功状态
<div className="bg-success-light text-success border-success/20 px-3 py-1 rounded-md">
  已完成
</div>

// 警告状态  
<div className="bg-warning-light text-warning border-warning/20 px-3 py-1 rounded-md">
  待处理
</div>

// 错误状态
<div className="bg-destructive-light text-destructive border-destructive/20 px-3 py-1 rounded-md">
  失败
</div>
```

## 📱 使用指南

### 1. 导入设计系统配置

```tsx
import { designSystem } from "@/lib/design-system";
import { cn } from "@/lib/utils";
```

### 2. 使用颜色变量

```tsx
// 在CSS中
.custom-component {
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}

// 在Tailwind中
<div className="bg-primary text-primary-foreground">
  主要内容
</div>
```

### 3. 应用间距系统

```tsx
// 使用标准间距
<div className="space-y-4">        {/* 16px 垂直间距 */}
  <div className="p-6">            {/* 24px 内边距 */}
    <div className="mb-2">         {/* 8px 底部外边距 */}
      内容
    </div>
  </div>
</div>
```

### 4. 创建组件变体

```tsx
import { designSystem } from "@/lib/design-system";

const buttonVariants = designSystem.createVariants(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors",
  {
    variant: {
      default: "bg-primary text-primary-foreground hover:bg-primary-hover",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary-hover",
    },
    size: {
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-4",
    }
  }
);

// 使用
<button className={buttonVariants({ variant: "default", size: "md" })}>
  按钮
</button>
```

## 🌓 主题切换

### 集成主题切换组件

```tsx
import { ThemeToggle } from "@/components/ThemeToggle";

function Header() {
  return (
    <header className="flex items-center justify-between p-4">
      <h1>应用标题</h1>
      <ThemeToggle />
    </header>
  );
}
```

### 支持的主题模式
- **Light**: 浅色模式
- **Dark**: 深色模式  
- **System**: 跟随系统设置

## ✨ 最佳实践

### 1. 保持一致性
- 统一使用设计系统中定义的颜色变量
- 遵循标准的间距和圆角规格
- 保持组件行为的一致性

### 2. 语义化设计
- 使用语义化的颜色命名（success、warning、destructive）
- 根据内容重要性选择合适的视觉层级
- 确保颜色使用符合用户预期

### 3. 响应式适配
- 在不同屏幕尺寸下保持良好的视觉效果
- 优化移动端的触摸交互体验
- 合理调整信息密度

### 4. 性能优化
- 使用CSS变量实现主题切换，避免重复样式
- 合理使用动画和过渡效果
- 避免过度复杂的视觉效果

### 5. 可访问性
- 确保足够的颜色对比度
- 为交互元素提供清晰的视觉反馈
- 支持键盘导航和屏幕阅读器

## 🚀 扩展指南

### 添加新颜色

1. 在 `client/global.css` 中添加CSS变量：
```css
:root {
  --new-color: 200 80% 50%;
}
```

2. 在 `tailwind.config.ts` 中添加Tailwind类：
```ts
colors: {
  "new-color": "hsl(var(--new-color))",
}
```

### 创建新组件变体

1. 在 `client/lib/design-system.ts` 中定义新的变体：
```ts
export const COMPONENT_VARIANTS = {
  newComponent: {
    variant: {
      primary: "bg-primary text-primary-foreground",
      secondary: "bg-secondary text-secondary-foreground",
    }
  }
}
```

2. 在组件中应用变体：
```tsx
const variants = createVariants(baseStyles, COMPONENT_VARIANTS.newComponent);
```

---

## 📞 支持

如有设计系统相关问题，请参考：
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [Radix UI 组件文档](https://www.radix-ui.com/)
- 项目内的组件示例代码

**更新日期**: 2024年1月
**版本**: v1.0.0
