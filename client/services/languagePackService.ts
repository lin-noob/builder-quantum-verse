/**
 * 语言包服务
 * 负责从API获取语言包数据并管理缓存
 */

import { type LanguagePackEntry, type LanguagePackResponse } from '@shared/api';
import { request } from '@/lib/request';

class LanguagePackService {
  private cache: Map<string, LanguagePackEntry[]> = new Map();

  /**
   * 从API获取语言包
   */
  async fetchLanguagePack(langCode: string): Promise<LanguagePackEntry[]> {
    try {
      const response = await request.get<LanguagePackResponse>(
        '/api/admin/api/v1/auth/details',
        { lang: langCode }
      );

      const data = response.data;

      if (data.code !== '201') {
        throw new Error(data.message || 'Failed to fetch language pack');
      }

      // 缓存结果
      this.cache.set(langCode, data.data);

      return data.data;
    } catch (error) {
      console.error(`Failed to fetch language pack for ${langCode}:`, error);
      throw error;
    }
  }

  /**
   * 获取���言包（优先从缓存获取）
   */
  async getLanguagePack(langCode: string): Promise<LanguagePackEntry[]> {
    // 先从缓存获取
    const cached = this.cache.get(langCode);
    if (cached) {
      return cached;
    }

    // 缓存中没有则从API获取
    return this.fetchLanguagePack(langCode);
  }

  /**
   * 获取缓存的语言包（不会触发API请求）
   */
  getCachedLanguagePack(langCode: string): LanguagePackEntry[] {
    return this.cache.get(langCode) || [];
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * 清除特定语言的缓存
   */
  clearLanguageCache(langCode: string): void {
    this.cache.delete(langCode);
  }

  /**
   * 预加载多个语言包
   */
  async preloadLanguagePacks(langCodes: string[]): Promise<void> {
    const promises = langCodes.map(langCode => 
      this.fetchLanguagePack(langCode).catch(error => {
        console.warn(`Failed to preload language pack for ${langCode}:`, error);
        return [];
      })
    );

    await Promise.all(promises);
  }

  /**
   * 转换语言包为i18n资源格式
   */
  convertToI18nResources(languagePack: LanguagePackEntry[]): Record<string, string> {
    const resources: Record<string, string> = {};
    languagePack.forEach(({ keyCode, transform }) => {
      resources[keyCode] = transform;
    });
    return resources;
  }
}

// 导出单例实例
export const languagePackService = new LanguagePackService();
export default languagePackService;
