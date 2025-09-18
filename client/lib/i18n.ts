import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import zhTranslations from './locales/zh.json';
import enTranslations from './locales/en.json';

// 获取语言代码 - 与 ConfigStore 同步的检测逻辑
const getDetectedLanguage = (): string => {
  // 1. localStorage 检测（使用 i18n 的键名）
  const savedLanguage = localStorage.getItem('i18nextLng');
  if (savedLanguage && savedLanguage !== 'undefined') {
    return savedLanguage;
  }

  // 2. URL 参数检测
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lng') || urlParams.get('lang') || urlParams.get('language');
    if (urlLang) {
      return urlLang;
    }
  } catch (error) {
    console.debug('Failed to parse URL parameters for language detection in i18n');
  }

  // 3. navigator 检测
  try {
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('zh')) return 'zh';
    if (browserLang.startsWith('en')) return 'en';
    // 对于其他语言，如果有对应的翻译文件就返回，否则返回英文
    if (browserLang.startsWith('ja')) return 'en'; // 暂时返回英文，可以添加更多语言支持
    if (browserLang.startsWith('ko')) return 'en';
    if (browserLang.startsWith('es')) return 'en';
    if (browserLang.startsWith('fr')) return 'en';
    if (browserLang.startsWith('de')) return 'en';
    if (browserLang.startsWith('pt')) return 'en';
    if (browserLang.startsWith('ru')) return 'en';
    if (browserLang.startsWith('ar')) return 'en';
  } catch (error) {
    console.debug('Failed to detect navigator language in i18n');
  }

  // 默认返回中文
  return 'zh';
};

// Configure i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      zh: { translation: zhTranslations },
      en: { translation: enTranslations },
    },
    lng: getDetectedLanguage(), // 使用自定义检测逻辑
    fallbackLng: 'zh',
    debug: false,
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'querystring', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
      lookupQuerystring: 'lng'
    }
  });

// 监听语言变化事件，同步到 ConfigStore
i18n.on('languageChanged', (lng) => {
  console.debug('i18n language changed to:', lng);

  // 延迟获取 ConfigStore 以避免循环依赖
  setTimeout(() => {
    try {
      // 动态导入 ConfigStore 以避免循环依赖
      import('../stores/configStore').then(({ useConfigStore, SUPPORTED_LANGUAGES }) => {
        const { langCode } = useConfigStore.getState();
        if (langCode !== lng) {
          // 只更新 ConfigStore 状态，不再次触发 i18n 变化
          const currentLanguage = SUPPORTED_LANGUAGES[lng] || {
            code: lng,
            name: lng.toUpperCase(),
            nativeName: lng.toUpperCase(),
            flag: '🌐'
          };

          useConfigStore.setState({
            langCode: lng,
            currentLanguage
          });

          // 更新 HTML lang 属性
          document.documentElement.lang = lng;
        }
      });
    } catch (error) {
      console.debug('Failed to sync language change to ConfigStore:', error);
    }
  }, 0);
});

export default i18n;
