import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import zhTranslations from './locales/zh.json';
import enTranslations from './locales/en.json';
import { languagePackService } from '@/services/languagePackService';
import { type LanguagePackEntry } from '@shared/api';

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
    // resources: {
    //   zh: { translation: zhTranslations },
    //   en: { translation: enTranslations },
    // },
    lng: getDetectedLanguage(),
    fallbackLng: 'en-US',
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
  }).then(() => {
    // 初始化完成后，尝试加载当前语言的API语言包
    const currentLang = i18n.language;
    loadLanguagePackFromAPI(currentLang).then(success => {
      if (success) {
        console.debug(`Initial language pack loaded for: ${currentLang}`);
      } else {
        console.debug(`Using static translations for: ${currentLang}`);
      }
    }).catch(error => {
      console.warn(`Failed to load initial language pack for ${currentLang}:`, error);
    });
  });

// 监听语言变化事件，同步到 ConfigStore
// i18n.on('languageChanged', (lng) => {
//   console.debug('i18n language changed to:', lng);

//   // 延迟获取 ConfigStore 以避免循环依赖
//   setTimeout(() => {
//     try {
//       // 动态导入 ConfigStore 以避免循环依赖
//       import('../stores/configStore').then(({ useConfigStore }) => {
//         const { langCode, availableLanguages } = useConfigStore.getState();
//         if (langCode !== lng) {
//           // 创建默认语言配置，优先使用API数据
//           const foundLanguage = availableLanguages.find(lang => lang.code === lng);
//           const currentLanguage = foundLanguage || {
//             code: lng,
//             name: lng.toUpperCase(),
//             nativeName: lng.toUpperCase(),
//             flag: '🌐'
//           };

//           useConfigStore.setState({
//             langCode: lng,
//             currentLanguage
//           });

//           // 更新 HTML lang 属性
//           document.documentElement.lang = lng;
//         }

//         // 加载对应的语言包
//         loadLanguagePackFromAPI(lng).then(success => {
//           if (success) {
//             console.debug(`Language pack loaded successfully for ${lng}`);
//           } else {
//             console.warn(`Failed to load language pack for ${lng}, using static translations`);
//           }
//         }).catch(error => {
//           console.warn(`Failed to load language pack for ${lng}:`, error);
//         });
//       });
//     } catch (error) {
//       console.debug('Failed to sync language change to ConfigStore:', error);
//     }
//   }, 0);
// });

// 动态加载语言包到 i18n
export const loadLanguagePack = async (langCode: string, languagePack: LanguagePackEntry[]) => {
  try {
    // 转换语言包格式
    const resources = languagePackService.convertToI18nResources(languagePack);

    // 添加或更新语言资源，合并而不是替换现有资源
    i18n.addResourceBundle(langCode, 'translation', resources, true, true);

    console.debug(`Language pack loaded for ${langCode}:`, {
      entriesCount: languagePack.length,
      sampleKeys: Object.keys(resources).slice(0, 5)
    });
  } catch (error) {
    console.error(`Failed to load language pack for ${langCode}:`, error);
  }
};

// 从 languagePackService 获取并加载语言包
export const loadLanguagePackFromAPI = async (langCode: string) => {
  try {
    // 首先尝试从缓存获���
    let languagePack = languagePackService.getCachedLanguagePack(langCode);

    // 如果缓存中没有，从API获取
    if (languagePack.length === 0) {
      try {
        console.debug(`Fetching language pack for ${langCode} from API...`);
        languagePack = await languagePackService.getLanguagePack(langCode);
      } catch (error) {
        console.warn(`Failed to fetch language pack for ${langCode}, using static resources:`, error);
        return false;
      }
    }

    // 加载语言包到 i18n
    if (languagePack.length > 0) {
      await loadLanguagePack(langCode, languagePack);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Failed to load language pack from API for ${langCode}:`, error);
    return false;
  }
};

// 保持向后兼容
export const loadLanguagePackFromStore = loadLanguagePackFromAPI;

// 预加载语言包（在应用启动时调用）
export const preloadLanguagePacks = async (langCodes: string[]) => {
  try {
    console.debug('Preloading language packs for:', langCodes);
    await languagePackService.preloadLanguagePacks(langCodes);

    // 为当前语言加载语言包
    const currentLang = i18n.language || 'zh';
    if (langCodes.includes(currentLang)) {
      const success = await loadLanguagePackFromAPI(currentLang);
      if (success) {
        console.debug(`Current language pack loaded for: ${currentLang}`);
      }
    }
  } catch (error) {
    console.warn('Failed to preload language packs:', error);
  }
};

// 手动刷新当前语言的语言包（强制从API重新获取）
export const refreshCurrentLanguagePack = async () => {
  const currentLang = i18n.language || 'zh';
  try {
    // 清除缓存
    languagePackService.clearLanguageCache(currentLang);
    // 重新加载
    const success = await loadLanguagePackFromAPI(currentLang);
    if (success) {
      console.debug(`Language pack refreshed for: ${currentLang}`);
    }
    return success;
  } catch (error) {
    console.error(`Failed to refresh language pack for ${currentLang}:`, error);
    return false;
  }
};

export default i18n;
