import { request } from "@/lib/request";

/**
 * 语言接口数据类型
 */
export interface LanguageApiResponse {
  code: string;
  name: string;
}

/**
 * 语言配置接口（扩展API响应数据）
 */
export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

/**
 * 语言服务类
 */
export class LanguageService {
  /**
   * 从API获取可用语言列表
   */
  async getAvailableLanguages(): Promise<LanguageApiResponse[]> {
    try {
      const response = await request.get<{ data: LanguageApiResponse[] }>(
        "/api/admin/api/v1/auth/language",
      );
      const list = response?.data?.data;
      // 若返回数据无效或不是数组，使用默认语言列表作为后备
      if (!Array.isArray(list) || list.length === 0) {
        return this.getDefaultLanguages();
      }
      return list;
    } catch (error) {
      console.error("Failed to fetch languages from API:", error);
      // 如果API调用失败，返回默认语言列表
      return this.getDefaultLanguages();
    }
  }

  /**
   * 获取默认语言列表（作为API失败时的后备）
   */
  private getDefaultLanguages(): LanguageApiResponse[] {
    return [
      // 与 i18n 保持一致的语言代码格式
      { code: "zh-CN", name: "中文" },
      { code: "en-US", name: "English" },
      { code: "ja", name: "日本語" },
      { code: "ko", name: "한국어" },
    ];
  }

  /**
   * 将API响应转换为完整的语言配置
   */
  convertToLanguageConfig(apiLanguage: LanguageApiResponse): LanguageConfig {
    // 预定义的额外信息映射
    const languageExtras: Record<string, { nativeName: string; flag: string }> =
      {
        // 常用标准代码
        "zh-CN": { nativeName: "中文", flag: "🇨🇳" },
        "en-US": { nativeName: "English", flag: "🇺🇸" },
        zh: { nativeName: "中文", flag: "🇨🇳" },
        en: { nativeName: "English", flag: "🇺🇸" },
        ja: { nativeName: "日本語", flag: "🇯🇵" },
        ko: { nativeName: "한국어", flag: "🇰🇷" },
        es: { nativeName: "Español", flag: "🇪🇸" },
        fr: { nativeName: "Français", flag: "🇫🇷" },
        de: { nativeName: "Deutsch", flag: "🇩🇪" },
        pt: { nativeName: "Português", flag: "🇵🇹" },
        ru: { nativeName: "Русский", flag: "🇷🇺" },
        ar: { nativeName: "العربية", flag: "🇸🇦" },
        it: { nativeName: "Italiano", flag: "🇮🇹" },
        nl: { nativeName: "Nederlands", flag: "🇳🇱" },
        pl: { nativeName: "Polski", flag: "🇵🇱" },
        tr: { nativeName: "Türkçe", flag: "🇹🇷" },
        vi: { nativeName: "Tiếng Việt", flag: "🇻🇳" },
        th: { nativeName: "ไทย", flag: "🇹🇭" },
        hi: { nativeName: "हिन्दी", flag: "🇮🇳" },
      };

    const extras = languageExtras[apiLanguage.code] || {
      nativeName: apiLanguage.name,
      flag: "🌐",
    };

    return {
      code: apiLanguage.code,
      name: apiLanguage.name,
      nativeName: extras.nativeName,
      flag: extras.flag,
    };
  }

  /**
   * 获取完整的语言配置列表
   */
  async getLanguageConfigs(): Promise<LanguageConfig[]> {
    const apiLanguages = await this.getAvailableLanguages();
    return apiLanguages.map((lang) => this.convertToLanguageConfig(lang));
  }

  /**
   * 检查语言代码是否被支持
   */
  async isLanguageSupported(languageCode: string): Promise<boolean> {
    const languages = await this.getAvailableLanguages();
    return languages.some((lang) => lang.code === languageCode);
  }

  /**
   * 获取语言的显示名称
   */
  async getLanguageDisplayName(languageCode: string): Promise<string> {
    const languages = await this.getAvailableLanguages();
    const language = languages.find((lang) => lang.code === languageCode);
    return language?.name || languageCode;
  }
}

// 创建服务实例
export const languageService = new LanguageService();

// 导出默认实例
export default languageService;
