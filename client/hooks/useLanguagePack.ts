import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  loadLanguagePackFromAPI, 
  refreshCurrentLanguagePack, 
  preloadLanguagePacks 
} from '@/lib/i18n';
import { languagePackService } from '@/services/languagePackService';

/**
 * 语言包管理 Hook
 * 提供语言包加载、刷新和状态管理功能
 */
export const useLanguagePack = () => {
  const { i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [lastLoadedLang, setLastLoadedLang] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 加载指定语言的语言包
  const loadLanguagePack = useCallback(async (langCode: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await loadLanguagePackFromAPI(langCode);
      if (success) {
        setLastLoadedLang(langCode);
        return true;
      } else {
        setError(`Failed to load language pack for ${langCode}`);
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 刷新当前语言包
  const refreshLanguagePack = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await refreshCurrentLanguagePack();
      if (success) {
        setLastLoadedLang(i18n.language);
        return true;
      } else {
        setError('Failed to refresh current language pack');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [i18n.language]);

  // 预加载多个语言包
  const preloadLanguagePacksAsync = useCallback(async (langCodes: string[]) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await preloadLanguagePacks(langCodes);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 获取缓存的语言包
  const getCachedLanguagePack = useCallback((langCode: string) => {
    return languagePackService.getCachedLanguagePack(langCode);
  }, []);

  // 清除语言包缓存
  const clearCache = useCallback((langCode?: string) => {
    if (langCode) {
      languagePackService.clearLanguageCache(langCode);
    } else {
      languagePackService.clearCache();
    }
  }, []);

  // 当语言变化时，自动加载对应的语言包
  useEffect(() => {
    const currentLang = i18n.language;
    if (currentLang && currentLang !== lastLoadedLang) {
      loadLanguagePack(currentLang);
    }
  }, [i18n.language, lastLoadedLang, loadLanguagePack]);

  return {
    // 状态
    isLoading,
    error,
    lastLoadedLang,
    currentLanguage: i18n.language,
    
    // 方法
    loadLanguagePack,
    refreshLanguagePack,
    preloadLanguagePacksAsync,
    getCachedLanguagePack,
    clearCache,
  };
};

export default useLanguagePack;
