/**
 * 设计系统配置 - 现代SaaS应用设计语言
 * Design System Configuration for Modern SaaS Applications
 */

/* === 设计原则 Design Principles === */
export const DESIGN_PRINCIPLES = {
  // 现代感：使用渐变、阴影和微交互
  MODERN: "Modern feel with gradients, shadows, and micro-interactions",
  // 专业性：保持清晰的层次结构和专业外观
  PROFESSIONAL: "Maintain clear hierarchy and professional appearance",
  // 数据驱动：突出数据和分析功能
  DATA_DRIVEN: "Emphasize data and analytics capabilities",
  // 高效性：提高信息密度和操作效率
  EFFICIENT: "Optimize information density and operational efficiency",
} as const;

/* === 间距系统 Spacing System === */
export const SPACING = {
  // 基础间距单位 (4px = 0.25rem)
  unit: 4,

  // 语义化间距
  xs: "0.25rem", // 4px
  sm: "0.5rem", // 8px
  md: "1rem", // 16px
  lg: "1.5rem", // 24px
  xl: "2rem", // 32px
  "2xl": "3rem", // 48px
  "3xl": "4rem", // 64px

  // 组件间距
  component: {
    tight: "0.5rem", // 组件内部紧密间距
    normal: "1rem", // 组件内部标准间距
    loose: "1.5rem", // 组件内部宽松间距
    section: "2rem", // 区块间距
    page: "3rem", // 页面级间距
  },
} as const;

/* === 字体系统 Typography System === */
export const TYPOGRAPHY = {
  // 字体族
  fontFamily: {
    sans: ["Inter", "system-ui", "sans-serif"],
    mono: ["JetBrains Mono", "Menlo", "Monaco", "Consolas", "monospace"],
  },

  // 字体大小
  fontSize: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    base: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem", // 36px
  },

  // 字重
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // 行高
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

/* === 组件变体系统 Component Variants === */
export const COMPONENT_VARIANTS = {
  // 按钮变体
  button: {
    intent: {
      primary: "bg-primary hover:bg-primary-hover text-primary-foreground",
      secondary:
        "bg-secondary hover:bg-secondary-hover text-secondary-foreground border border-border",
      destructive:
        "bg-destructive hover:bg-destructive/90 text-destructive-foreground",
      success: "bg-success hover:bg-success/90 text-success-foreground",
      outline:
        "border border-border bg-background hover:bg-accent hover:text-accent-foreground",
      ghost: "hover:bg-accent hover:text-accent-foreground",
    },
    size: {
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-4 text-base",
      lg: "h-12 px-6 text-lg",
      icon: "h-10 w-10",
    },
  },

  // 卡片变体
  card: {
    elevation: {
      flat: "border border-border",
      low: "border border-border shadow-sm",
      medium: "border border-border shadow-md",
      high: "border border-border shadow-lg",
    },
    padding: {
      tight: "p-4",
      normal: "p-6",
      loose: "p-8",
    },
  },

  // 状态变体
  status: {
    success: "bg-success-light text-success border-success/20",
    warning: "bg-warning-light text-warning border-warning/20",
    error: "bg-destructive-light text-destructive border-destructive/20",
    info: "bg-info-light text-info border-info/20",
  },
} as const;

/* === 动画配置 Animation Configuration === */
export const ANIMATIONS = {
  // 过渡时长
  duration: {
    fast: "150ms",
    normal: "200ms",
    slow: "300ms",
  },

  // 缓动函数
  easing: {
    easeOut: "cubic-bezier(0, 0, 0.2, 1)",
    easeIn: "cubic-bezier(0.4, 0, 1, 1)",
    easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  },

  // 微交互
  microInteractions: {
    hover: "transition-colors duration-200 ease-out",
    focus: "transition-all duration-200 ease-out",
    press: "transition-transform duration-150 ease-out active:scale-95",
  },
} as const;

/* === 断点系统 Breakpoint System === */
export const BREAKPOINTS = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

/* === 阴影系统 Shadow System === */
export const SHADOWS = {
  // 卡片阴影
  card: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  },

  // 特殊阴影
  glow: "0 0 20px rgb(168 85 247 / 0.4)", // 紫色光晕
  "glow-success": "0 0 20px rgb(34 197 94 / 0.4)", // 绿色光晕
} as const;

/* === 实用工具函数 Utility Functions === */

/**
 * 生成组件的className
 * @param base 基础样式
 * @param variants 变体对象
 * @param props 组件属性
 */
export function createVariants<
  T extends Record<string, Record<string, string>>,
>(base: string, variants: T) {
  return function (
    props: { [K in keyof T]?: keyof T[K] } & { className?: string },
  ) {
    const variantClasses = Object.entries(variants)
      .map(([key, options]) => {
        const value = props[key as keyof typeof props] as string;
        return value ? options[value] : "";
      })
      .filter(Boolean)
      .join(" ");

    return [base, variantClasses, props.className].filter(Boolean).join(" ");
  };
}

/**
 * 条件样式应用
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

/* === 导出设计系统配置 === */
export const designSystem = {
  DESIGN_PRINCIPLES,
  SPACING,
  TYPOGRAPHY,
  COMPONENT_VARIANTS,
  ANIMATIONS,
  BREAKPOINTS,
  SHADOWS,
  createVariants,
  cn,
} as const;

export default designSystem;
