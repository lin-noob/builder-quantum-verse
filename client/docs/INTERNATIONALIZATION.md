# 多语言国际化功能实现文档

## 概述

本项目已成功集成多语言国际化功能，支持中文、英文、日文、法文四种语言。用户可以通过语言切换器实时切换界面语言，语言偏好会自动保存到本地存储。

## 技术实现

### 依赖包
- `react-i18next`: React的国际化库
- `i18next`: 核心国际化框架
- `i18next-browser-languagedetector`: 浏览器语言检测

### 核心文件

#### 1. 配置文件
- **`client/lib/i18n.ts`**: 主要的i18n配置文件
  - 包含四种语言的完整翻译内容
  - 配置语言检测和持久化
  - 设置回退语言为中文

#### 2. 组件文件
- **`client/components/LanguageSwitcher.tsx`**: 语言切换��件
  - 支持header和footer两种展示模式
  - 提供下拉菜单和网格布局两种UI
  - 显示国旗、原文和英文名称

#### 3. 页面组件
- **`client/components/MarketingNav.tsx`**: 已国际化的导航栏
- **`client/pages/MarketingHome.tsx`**: 已国际化的营销主页
- **`client/pages/I18nTest.tsx`**: 多语言功能测试页面

## 支持的语言

| 语言代码 | 语言名称 | 原文名称 | 国旗 |
|---------|----------|----------|------|
| zh | Chinese | 中文 | 🇨🇳 |
| en | English | English | 🇺🇸 |
| ja | Japanese | 日本語 | 🇯🇵 |
| fr | French | Français | 🇫🇷 |

## 翻译内容覆盖

### 导航栏 (nav)
- 平台名称、产品特色、解决方案、联系我们、启动AI
- 各功能模块名称（AI智能营销、用户画像分析、实时监控中心、效果追踪）
- 各解决方案名称（电商营销、内容营销、金融营销、企业服务）

### 英雄区域 (hero)
- 页面标题和描述文本
- 按钮文本（立即体验、观看演示、免费试用等）
- 各页面特定的标题和描述

### 功能介绍 (features)
- 核心功能标题和描述
- 功能优势列表
- 技术特点介绍

### 统计数据 (stats)
- 各类数据指标名称
- 性能提升描述

### 行动召唤 (cta)
- CTA区域标���和描述
- 不同页面的个性化CTA内容

### 弹窗内容 (modal)
- 联系表单相关文本
- 演示预约相关文本
- 专家咨询相关文本

## 使用方法

### 在组件中使用翻译

```tsx
import { useTranslation } from 'react-i18next';

export default function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('nav.platformName')}</h1>
      <p>{t('hero.description')}</p>
    </div>
  );
}
```

### 带插值的翻译

```tsx
// 对于包含动态内容的翻译
const description = t('hero.aiMarketingDescription', {
  preciseTech: <span className="text-cyan-400">{t('hero.preciseTech')}</span>,
  automation: <span className="text-purple-400">{t('hero.automation')}</span>,
  dataDecision: <span className="text-green-400">{t('hero.dataDecision')}</span>
});
```

### 手动切换语言

```tsx
import { useTranslation } from 'react-i18next';

export default function LanguageControls() {
  const { i18n } = useTranslation();
  
  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
  };
  
  return (
    <button onClick={() => changeLanguage('en')}>
      Switch to English
    </button>
  );
}
```

## 语言切换器使用

### Header版本（导航栏）
```tsx
import LanguageSwitcher from '@/components/LanguageSwitcher';

<LanguageSwitcher variant="header" size="sm" />
```

### Footer版本（页脚）
```tsx
<LanguageSwitcher variant="footer" />
```

## 测试页面

访问 `/i18n-test` 可以查看多语言功能的完整测试页面，包括：
- 语言切换器的不同变体
- 各类翻译内容的展示
- 快速语言切换按钮
- 当前语言状态信息

## 特性

### 🚀 核心特性
- ✅ 支持4种语言（中文、英文、日文、法文）
- ✅ 自动语言检测（基于浏览器设置）
- ✅ 语言偏好本地存储持久化
- ✅ 实时语言切换（无需刷新页面）
- ✅ 回退语言机制（默认中文）

### 🎨 UI特性
- ✅ 美观的语言切换器组件
- ✅ 支持多种展示模式（下拉菜单/网格布局）
- ✅ 国旗图标和多语言名称显示
- ✅ 响应式设计，移动端友好

### 🔧 开发特性
- ✅ TypeScript支持
- ✅ 完整的类型定义
- ✅ 结构化的翻译文件组织
- ✅ 开发时调试支持

## 扩展指南

### 添加新语言

1. 在 `client/lib/i18n.ts` 中添加新的翻译对象
2. 在 `languages` 数组中添加语言配置
3. 在 `i18n.init()` 的 `resources` 中注册新语言

### 添加新的翻译键

1. 在各语言的翻译对象中添加相同的键��对
2. 在组件中使用 `t('your.new.key')` 调用

### 自定义语言切换器

可以基于 `LanguageSwitcher` 组件创建自定义的语言切换界面，或者直接使用 `useTranslation` hook 中的 `i18n.changeLanguage()` 方法。

## 最佳实践

1. **保持翻译键的一致性**: 确保所有语言都有相同的键值结构
2. **使用命名空间**: 通过 `.` 分隔符组织翻译键的层级结构
3. **提供有意义的回退**: 设置合适的回退语言和默认文本
4. **考虑文本长度**: 不同语言的文本长度差异较大，UI设计需要考虑适应性
5. **测试所有语言**: 确保每种语言下的UI显示都正常

## 注意事项

- 当前实现主要覆盖了营销网站的核心页面
- 后续需要根据需求逐步扩展到其他页面和组件
- 某些动态内容可能需要额外的翻译处理
- 建议在添加新内容时同步添加多语言支持

## 贡献指南

在添加新功能时，请确保：
1. 所有用户可见的文本都添加了翻译支持
2. 新的翻译键遵循现有的命名规范
3. 提供所有支持语言的翻译内容
4. 更新相关的文档说明
