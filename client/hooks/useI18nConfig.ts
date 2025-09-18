import { useTranslation } from 'react-i18next';
import { useConfigStore } from '@/stores/configStore';

/**
 * 统一的 i18n 和 ConfigStore 集成钩子
 * 
 * 提供简化的 API 来同时使用翻译功能和配置管理
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { 
 *     t, 
 *     langCode, 
 *     changeLanguage, 
 *     formatCurrency,
 *     isSync 
 *   } = useI18nConfig();
 * 
 *   return (
 *     <div>
 *       <h1>{t('nav.platformName')}</h1>
 *       <p>当前语言: {langCode}</p>
 *       <p>价格: {formatCurrency(199.99)}</p>
 *       <button onClick={() => changeLanguage('en')}>
 *         Switch to English
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export const useI18nConfig = () => {
  const { t, i18n } = useTranslation();
  const {
    langCode,
    currentLanguage,
    availableLanguages,
    languagesLoading,
    languagesError,
    currencyCode,
    currentCurrency,
    setLanguage,
    setCurrency,
    formatCurrency,
    formatNumber,
    formatDate,
    theme,
    setTheme,
    fetchAvailableLanguages,
    getLanguageConfig,
  } = useConfigStore();

  // 检查两个系统是否同步
  const isSync = i18n.language === langCode;

  /**
   * 统一的语言切换方法
   * 同时更新 ConfigStore 和 i18n
   */
  const changeLanguage = (newLang: string) => {
    setLanguage(newLang);
  };

  /**
   * 获取当前语言的显示信息
   */
  const getCurrentLanguageInfo = () => {
    return {
      code: langCode,
      name: currentLanguage.name,
      nativeName: currentLanguage.nativeName,
      flag: currentLanguage.flag,
      isRTL: langCode === 'ar',
    };
  };

  /**
   * 获取支持的语言列表（优先使用API数据）
   */
  const getSupportedLanguages = () => {
    // 如果有API数据，使用API数据
    if (availableLanguages.length > 0) {
      return availableLanguages;
    }

    // 否则使用默认语言列表
    return [
      { code: 'zh', name: '中文', nativeName: '中文', flag: '🇨🇳' },
      { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
      { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
      { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
    ];
  };

  /**
   * 检查是否有可用的翻译
   */
  const hasTranslation = (key: string) => {
    return i18n.exists(key);
  };

  /**
   * 安全的翻译方法，如果翻译不存在则返回 key
   */
  const safeTranslate = (key: string, defaultValue?: string) => {
    if (hasTranslation(key)) {
      return t(key);
    }
    return defaultValue || key;
  };

  /**
   * 根据当前语言格式化文本方向
   */
  const getTextDirection = () => {
    return langCode === 'ar' ? 'rtl' : 'ltr';
  };

  /**
   * 获取本地化的数字格式化器
   */
  const getNumberFormatter = (options?: Intl.NumberFormatOptions) => {
    const locale = langCode === 'zh' ? 'zh-CN' : 
                   langCode === 'en' ? 'en-US' : 
                   langCode === 'ja' ? 'ja-JP' : 
                   langCode === 'ko' ? 'ko-KR' : 'en-US';
    
    return new Intl.NumberFormat(locale, {
      style: 'decimal',
      ...options,
    });
  };

  /**
   * 获取本地化的货币格式化器
   */
  const getCurrencyFormatter = (options?: Intl.NumberFormatOptions) => {
    const locale = langCode === 'zh' ? 'zh-CN' : 
                   langCode === 'en' ? 'en-US' : 
                   langCode === 'ja' ? 'ja-JP' : 
                   langCode === 'ko' ? 'ko-KR' : 'en-US';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      ...options,
    });
  };

  /**
   * 获取本地化的日期格式化器
   */
  const getDateFormatter = (options?: Intl.DateTimeFormatOptions) => {
    const locale = langCode === 'zh' ? 'zh-CN' : 
                   langCode === 'en' ? 'en-US' : 
                   langCode === 'ja' ? 'ja-JP' : 
                   langCode === 'ko' ? 'ko-KR' : 'en-US';
    
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options,
    });
  };

  /**
   * 获取本地化的相对时间格式化器
   */
  const getRelativeTimeFormatter = () => {
    const locale = langCode === 'zh' ? 'zh-CN' : 
                   langCode === 'en' ? 'en-US' : 
                   langCode === 'ja' ? 'ja-JP' : 
                   langCode === 'ko' ? 'ko-KR' : 'en-US';
    
    return new Intl.RelativeTimeFormat(locale, {
      numeric: 'auto',
      style: 'long',
    });
  };

  /**
   * 格式化相对时间
   */
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const diffInDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor(diff / (1000 * 60 * 60));
    const diffInMinutes = Math.floor(diff / (1000 * 60));
    
    const rtf = getRelativeTimeFormatter();
    
    if (Math.abs(diffInDays) >= 1) {
      return rtf.format(diffInDays, 'day');
    } else if (Math.abs(diffInHours) >= 1) {
      return rtf.format(diffInHours, 'hour');
    } else {
      return rtf.format(diffInMinutes, 'minute');
    }
  };

  return {
    // 翻译相关
    t,
    i18n,
    hasTranslation,
    safeTranslate,
    
    // 语言相关
    langCode,
    currentLanguage,
    changeLanguage,
    getCurrentLanguageInfo,
    getSupportedLanguages,
    getTextDirection,

    // 动态语言API相关
    availableLanguages,
    languagesLoading,
    languagesError,
    fetchAvailableLanguages,
    getLanguageConfig,
    
    // 货币相关
    currencyCode,
    currentCurrency,
    setCurrency,
    formatCurrency,
    
    // 格式化相关
    formatNumber,
    formatDate,
    formatRelativeTime,
    getNumberFormatter,
    getCurrencyFormatter,
    getDateFormatter,
    getRelativeTimeFormatter,
    
    // 主题相关
    theme,
    setTheme,
    
    // 系统状态
    isSync,
    
    // 工具方法
    isRTL: langCode === 'ar',
    locale: langCode === 'zh' ? 'zh-CN' : 
            langCode === 'en' ? 'en-US' : 
            langCode === 'ja' ? 'ja-JP' : 
            langCode === 'ko' ? 'ko-KR' : 'en-US',
  };
};

export default useI18nConfig;
