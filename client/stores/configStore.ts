import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import i18n from '@/lib/i18n';
import { languageService, type LanguageConfig as ApiLanguageConfig } from '@/services/languageService';
import { languagePackService } from '@/services/languagePackService';
import { type LanguagePackEntry } from '@shared/api';

// 支持的语言代码 - 改为 string 类型
export type LanguageCode = string;

// 支持的货币符号
export type CurrencyCode = 'CNY' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'KRW' | 'AUD' | 'CAD' | 'CHF' | 'HKD';

// 语言配置接口
export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

// 货币配置接口
export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  position: 'before' | 'after'; // 符号位置：前缀或后缀
}

// 配置状态接口
interface ConfigState {
  // 当前语言配��
  langCode: string;
  currentLanguage: LanguageConfig;

  // 可用语言列表（从API获取）
  availableLanguages: ApiLanguageConfig[];
  languagesLoading: boolean;
  languagesError: string | null;

  // 语言包状态
  languagePacks: Record<string, LanguagePackEntry[]>;
  languagePackLoading: boolean;
  languagePackError: string | null;

  // 当前货币配置
  currencyCode: CurrencyCode;
  currentCurrency: CurrencyConfig;

  // 主题设置
  theme: 'light' | 'dark' | 'system';

  // 时区设置
  timezone: string;

  // 日期格式
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';

  // 数字格式
  numberFormat: 'comma' | 'space' | 'period'; // 千位分隔符格式

  // 操作方法
  setLanguage: (langCode: string) => void;
  setCurrency: (currencyCode: CurrencyCode) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setTimezone: (timezone: string) => void;
  setDateFormat: (format: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD') => void;
  setNumberFormat: (format: 'comma' | 'space' | 'period') => void;

  // 语言相关方法
  fetchAvailableLanguages: () => Promise<void>;
  getLanguageConfig: (langCode: string) => LanguageConfig;
  fetchLanguagePack: (langCode: string) => Promise<void>;
  getLanguagePack: (langCode: string) => LanguagePackEntry[];

  // 获取格式化方法
  formatCurrency: (amount: number) => string;
  formatNumber: (number: number) => string;
  formatDate: (date: Date) => string;

  // 重置配置
  resetConfig: () => void;
}

// 默认语言配置工厂函数
const createDefaultLanguageConfig = (langCode: string, availableLanguages: ApiLanguageConfig[] = []): LanguageConfig => {
  // 尝试从availableLanguages中获取name和nativeName
  const foundLanguage = availableLanguages.find(lang => lang.code === langCode);

  return {
    code: langCode,
    name: foundLanguage?.name || langCode.toUpperCase(),
    nativeName: foundLanguage?.nativeName || langCode.toUpperCase(),
    flag: foundLanguage?.flag || '🌐'
  };
};

// 预���义的货币配置
export const SUPPORTED_CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', position: 'before' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', position: 'before' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', position: 'before' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', position: 'before' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', position: 'before' },
  KRW: { code: 'KRW', symbol: '₩', name: 'Korean Won', position: 'before' },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', position: 'before' },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', position: 'before' },
  CHF: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', position: 'after' },
  HKD: { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', position: 'before' },
};

// 获取语言代码 - 按优先级：localStorage > URL参数 > navigator
// 与 i18n 系统同步，使用相同的存储键和参数名
const getBrowserLanguage = (): string => {
  // 1. 首先从 localStorage 中获取持久化的语言设置（使用 i18n 的键名）
  const savedLanguage = localStorage.getItem('i18nextLng') || localStorage.getItem('app_language');
  if (savedLanguage && savedLanguage !== 'undefined') {
    return savedLanguage;
  }

  // 2. 从浏览器 URL 参数中获取语言设置（与 i18n 保持一致）
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lng') || urlParams.get('lang') || urlParams.get('language');
    if (urlLang) {
      return urlLang;
    }
  } catch (error) {
    console.debug('Failed to parse URL parameters for language detection');
  }

  // 3. 最后从 navigator 中获取浏览器语言
  try {
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('zh')) return 'zh';
    if (browserLang.startsWith('ja')) return 'ja';
    if (browserLang.startsWith('ko')) return 'ko';
    if (browserLang.startsWith('es')) return 'es';
    if (browserLang.startsWith('fr')) return 'fr';
    if (browserLang.startsWith('de')) return 'de';
    if (browserLang.startsWith('pt')) return 'pt';
    if (browserLang.startsWith('ru')) return 'ru';
    if (browserLang.startsWith('ar')) return 'ar';
  } catch (error) {
    console.debug('Failed to detect navigator language');
  }

  // 默认返回中文（与 i18n 保持一致）
  return 'zh';
};

// 获取浏览器默认货币（基于地区）
const getBrowserCurrency = (): CurrencyCode => {
  try {
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.includes('cn') || browserLang.startsWith('zh')) return 'CNY';
    if (browserLang.includes('jp') || browserLang.startsWith('ja')) return 'JPY';
    if (browserLang.includes('kr') || browserLang.startsWith('ko')) return 'KRW';
    if (browserLang.includes('gb')) return 'GBP';
    if (browserLang.includes('au')) return 'AUD';
    if (browserLang.includes('ca')) return 'CAD';
    if (browserLang.includes('ch')) return 'CHF';
    if (browserLang.includes('hk')) return 'HKD';
    if (browserLang.startsWith('es') || browserLang.startsWith('fr') ||
        browserLang.startsWith('de') || browserLang.startsWith('pt')) return 'EUR';
  } catch (error) {
    console.debug('Failed to detect browser currency');
  }
  return 'USD'; // 默认美元
};

// 创建配置 store
export const useConfigStore = create<ConfigState>()(
  devtools(
    persist(
      (set, get) => {
        const defaultLangCode = getBrowserLanguage();
        const defaultCurrencyCode = getBrowserCurrency();

        // 创建默认语言配置（后续会通过API更新）
        const currentLanguage = createDefaultLanguageConfig(defaultLangCode, []);

        return {
          // 初始状态
          langCode: defaultLangCode,
          currentLanguage,

          // 动态语言列表状态
          availableLanguages: [],
          languagesLoading: false,
          languagesError: null,

          // 语言包状态
          languagePacks: {},
          languagePackLoading: false,
          languagePackError: null,

          currencyCode: defaultCurrencyCode,
          currentCurrency: SUPPORTED_CURRENCIES[defaultCurrencyCode],
          theme: 'system',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          dateFormat: 'YYYY-MM-DD',
          numberFormat: 'comma',
          
          // 设置语言
          setLanguage: async (langCode: string) => {
            // 使用 getLanguageConfig 获取语言配置（优先使用API数据）
            const currentLanguage = get().getLanguageConfig(langCode);

            set({ langCode, currentLanguage });

            // 更新 HTML lang 属性
            document.documentElement.lang = langCode;

            // 同步到 i18n 系统
            // if (i18n.language !== langCode) {
            //   i18n.changeLanguage(langCode);
            // }

            // 持久化到 localStorage（使用 i18n 的键名保持一致）
            localStorage.setItem('i18nextLng', langCode);
            // 为了向后兼容，也保存到旧的键名
            localStorage.setItem('app_language', langCode);

            // 获取对应的语言包
            // try {
            //   await get().fetchLanguagePack(langCode);
            // } catch (error) {
            //   console.warn(`Failed to fetch language pack for ${langCode}:`, error);
            // }
          },
          
          // 设置货币
          setCurrency: (currencyCode) => {
            const currentCurrency = SUPPORTED_CURRENCIES[currencyCode];
            set({ currencyCode, currentCurrency });
            
            // 同步到 localStorage
            localStorage.setItem('app_currency', currencyCode);
          },
          
          // 设置主题
          setTheme: (theme) => {
            set({ theme });
            
            // 更新 HTML class
            const root = document.documentElement;
            root.classList.remove('light', 'dark');
            
            if (theme === 'system') {
              const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
              root.classList.add(systemTheme);
            } else {
              root.classList.add(theme);
            }
            
            localStorage.setItem('app_theme', theme);
          },
          
          // 设置时区
          setTimezone: (timezone) => {
            set({ timezone });
            localStorage.setItem('app_timezone', timezone);
          },
          
          // 设置日期格式
          setDateFormat: (dateFormat) => {
            set({ dateFormat });
            localStorage.setItem('app_date_format', dateFormat);
          },
          
          // 设置数字格式
          setNumberFormat: (numberFormat) => {
            set({ numberFormat });
            localStorage.setItem('app_number_format', numberFormat);
          },

          // 从API获取可用语言列表
          fetchAvailableLanguages: async () => {
            set({ languagesLoading: true, languagesError: null });

            try {
              const languages = await languageService.getLanguageConfigs();
              set({
                availableLanguages: languages,
                languagesLoading: false,
                languagesError: null
              });
            } catch (error) {
              console.error('Failed to fetch available languages:', error);
              set({
                languagesLoading: false,
                languagesError: error instanceof Error ? error.message : 'Failed to fetch languages'
              });
            }
          },

          // 获取语言配置（只使用API数据）
          getLanguageConfig: (langCode: string) => {
            const { availableLanguages } = get();

            // 从API获取的语言中查找
            const apiLanguage = availableLanguages.find(lang => lang.code === langCode);
            if (apiLanguage) {
              return apiLanguage;
            }

            // 如果找不到，返回默认配置（尝试从availableLanguages中获取name信息）
            return createDefaultLanguageConfig(langCode, availableLanguages);
          },

          // 从API获取语言包
          fetchLanguagePack: async (langCode: string) => {
            set({ languagePackLoading: true, languagePackError: null });

            try {
              const languagePack = await languagePackService.fetchLanguagePack(langCode);

              // 更新语言包缓存
              const { languagePacks } = get();
              set({
                languagePacks: {
                  ...languagePacks,
                  [langCode]: languagePack
                },
                languagePackLoading: false,
                languagePackError: null
              });

            } catch (error) {
              console.error('Failed to fetch language pack:', error);
              set({
                languagePackLoading: false,
                languagePackError: error instanceof Error ? error.message : 'Failed to fetch language pack'
              });
              throw error;
            }
          },

          // 获取语言包（从缓存或API）
          getLanguagePack: (langCode: string) => {
            const { languagePacks } = get();
            // 先从store缓存获取，再从服务缓存获取
            return languagePacks[langCode] || languagePackService.getCachedLanguagePack(langCode);
          },
          
          // 格式化货币
          formatCurrency: (amount) => {
            const { currentCurrency, numberFormat } = get();
            const { symbol, position } = currentCurrency;
            
            // 根据数字格式设置千位分隔符
            const separators = {
              comma: { thousands: ',', decimal: '.' },
              space: { thousands: ' ', decimal: ',' },
              period: { thousands: '.', decimal: ',' },
            };
            
            const { thousands, decimal } = separators[numberFormat];
            
            // 格式化数字
            const parts = amount.toFixed(2).split('.');
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousands);
            const formattedAmount = parts.join(decimal);
            
            // 根据货币符号位置返回格式化字符串
            return position === 'before' 
              ? `${symbol}${formattedAmount}`
              : `${formattedAmount} ${symbol}`;
          },
          
          // 格式化数字
          formatNumber: (number) => {
            const { numberFormat } = get();
            
            const separators = {
              comma: { thousands: ',', decimal: '.' },
              space: { thousands: ' ', decimal: ',' },
              period: { thousands: '.', decimal: ',' },
            };
            
            const { thousands, decimal } = separators[numberFormat];
            
            const parts = number.toString().split('.');
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousands);
            return parts.join(decimal);
          },
          
          // 格式化日期
          formatDate: (date) => {
            const { dateFormat, timezone } = get();
            
            const options: Intl.DateTimeFormatOptions = {
              timeZone: timezone,
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            };
            
            const formatted = new Intl.DateTimeFormat('en-CA', options).format(date);
            const [year, month, day] = formatted.split('-');
            
            switch (dateFormat) {
              case 'DD/MM/YYYY':
                return `${day}/${month}/${year}`;
              case 'MM/DD/YYYY':
                return `${month}/${day}/${year}`;
              case 'YYYY-MM-DD':
              default:
                return `${year}-${month}-${day}`;
            }
          },
          
          // 重置���置
          resetConfig: () => {
            // 清除 localStorage 中的设置（包括 i18n 的键）
            localStorage.removeItem('i18nextLng');
            localStorage.removeItem('app_language');
            localStorage.removeItem('app_currency');
            localStorage.removeItem('app_theme');
            localStorage.removeItem('app_timezone');
            localStorage.removeItem('app_date_format');
            localStorage.removeItem('app_number_format');

            // 重新获取默认设置（��时 localStorage 已清除，会使用 URL 或 navigator）
            const defaultLangCode = getBrowserLanguage();
            const defaultCurrencyCode = getBrowserCurrency();

            // 获取当前可用语言列表
            const { availableLanguages } = get();
            const currentLanguage = createDefaultLanguageConfig(defaultLangCode, availableLanguages);

            // 同步到 i18n 系统
            if (i18n.language !== defaultLangCode) {
              i18n.changeLanguage(defaultLangCode);
            }

            set({
              langCode: defaultLangCode,
              currentLanguage,
              currencyCode: defaultCurrencyCode,
              currentCurrency: SUPPORTED_CURRENCIES[defaultCurrencyCode],
              theme: 'system',
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              dateFormat: 'YYYY-MM-DD',
              numberFormat: 'comma',
            });
          },
        };
      },
      {
        name: 'config-storage',
        partialize: (state) => ({
          langCode: state.langCode,
          currencyCode: state.currencyCode,
          theme: state.theme,
          timezone: state.timezone,
          dateFormat: state.dateFormat,
          numberFormat: state.numberFormat,
        }),
      }
    ),
    {
      name: 'config-store',
    }
  )
);

// 初始化配置（在应用启动时调用）
export const initializeConfig = async () => {
  const { setLanguage, setCurrency, setTheme, fetchAvailableLanguages, fetchLanguagePack, langCode, currencyCode, theme } = useConfigStore.getState();

  // 先获取可用语言列表
  try {
    await fetchAvailableLanguages();
  } catch (error) {
    console.warn('Failed to fetch available languages, using fallback configuration:', error);
  }

  // 获取 i18n 当前语言设置，确保两个系统同步
  const i18nLanguage = i18n.language || i18n.options.lng || getBrowserLanguage();

  // 从 localStorage 恢复其他设置
  const savedCurrency = localStorage.getItem('app_currency') as CurrencyCode;
  const savedTheme = localStorage.getItem('app_theme') as 'light' | 'dark' | 'system';

  // 应用语言设置（使用 i18n 当前语言确保同步）
  if (i18nLanguage !== langCode) {
    // 直接设置 ConfigStore 状态，避免循环调用（获取当前可用语言）
    const { availableLanguages } = useConfigStore.getState();
    const currentLanguage = createDefaultLanguageConfig(i18nLanguage, availableLanguages);

    useConfigStore.setState({
      langCode: i18nLanguage,
      currentLanguage
    });

    // 更新 HTML lang 属性
    document.documentElement.lang = i18nLanguage;
  }

  // 应用货币设置
  if (savedCurrency && SUPPORTED_CURRENCIES[savedCurrency]) {
    setCurrency(savedCurrency);
  } else {
    setCurrency(currencyCode);
  }

  // 应用主题设置
  if (savedTheme) {
    setTheme(savedTheme);
  } else {
    setTheme(theme);
  }

  // 获取当前语言的语言包并预加载其他语言包
  const { langCode: currentLangCode, availableLanguages } = useConfigStore.getState();

  // try {
  //   // 首先加载当前语言的语言包
  //   await fetchLanguagePack(currentLangCode);
  // } catch (error) {
  //   console.warn(`Failed to fetch language pack for ${currentLangCode}:`, error);
  // }
};
