import { request } from "@/lib/request";

// 翻译项类型定义
export interface TranslationItem {
  id: string;
  key: string;
  zh: string;
  en: string;
}

// 菜单分类类型定义
export interface MenuCategory {
  id: string;
  name: string;
  count: number;
}

// 语言类型定义
export interface Language {
  id: string;
  name: string;
  code: string;
}

// 帮助文档类型定义
export interface HelpDocument {
  id: string;
  title: string;
  category: string;
  description: string;
  content: string;
  lastUpdated: string;
  views: number;
  likes: number;
  isPopular: boolean;
  // 多语言内容字段
  translations: {
    [languageCode: string]: {
      title: string;
      description: string;
      content: string;
    }
  };
  // SEO字段
  url?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

// API响应类型
export interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T;
}

// 获取菜单分类
export async function getI18nCategories(): Promise<ApiResponse<MenuCategory[]>> {
  const response = await request.get<ApiResponse<MenuCategory[]>>("/api/admin/api/v1/i18n/categories");
  return response.data;
}

// 获取所有翻译项
export async function getI18nTranslations(): Promise<ApiResponse<TranslationItem[]>> {
  const response = await request.get<ApiResponse<TranslationItem[]>>("/api/admin/api/v1/i18n/translations");
  return response.data;
}

// 获取指定分类的翻译项
export async function getI18nTranslationsByCategory(category: string): Promise<ApiResponse<TranslationItem[]>> {
  const response = await request.get<ApiResponse<TranslationItem[]>>(`/api/admin/api/v1/i18n/translations?category=${category}`);
  return response.data;
}

// 创建新的翻译项
export async function createI18nTranslation(translation: Omit<TranslationItem, "id">): Promise<ApiResponse<TranslationItem>> {
  const response = await request.post<ApiResponse<TranslationItem>>("/api/admin/api/v1/i18n/translations", translation);
  return response.data;
}

// 更新翻译项
export async function updateI18nTranslation(translation: TranslationItem): Promise<ApiResponse<TranslationItem>> {
  const response = await request.put<ApiResponse<TranslationItem>>("/api/admin/api/v1/i18n/translations", translation);
  return response.data;
}

// 删除翻译项
export async function deleteI18nTranslation(id: string): Promise<ApiResponse<void>> {
  const response = await request.delete<ApiResponse<void>>(`/api/admin/api/v1/i18n/translations/${id}`);
  return response.data;
}

// 导出翻译项
export async function exportI18nTranslations(): Promise<Blob> {
  const response = await request.get("/api/admin/api/v1/i18n/translations/export", {
    responseType: "blob"
  });
  return response.data;
}

// 导入翻译项
export async function importI18nTranslations(file: File): Promise<ApiResponse<void>> {
  const formData = new FormData();
  formData.append("file", file);
  
  const response = await request.post<ApiResponse<void>>("/api/admin/api/v1/i18n/translations/import", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
  return response.data;
}

// 获取语言列表
export async function getLanguages(): Promise<ApiResponse<Language[]>> {
  const response = await request.get<ApiResponse<Language[]>>("/api/admin/api/v1/i18n/languages");
  return response.data;
}

// 添加新语言
export async function addLanguage(language: Omit<Language, "id">): Promise<ApiResponse<Language>> {
  const response = await request.post<ApiResponse<Language>>("/api/admin/api/v1/i18n/languages", language);
  return response.data;
}

// 更新语言
export async function updateLanguage(language: Language): Promise<ApiResponse<Language>> {
  const response = await request.put<ApiResponse<Language>>("/api/admin/api/v1/i18n/languages", language);
  return response.data;
}

// 删除语言
export async function deleteLanguage(id: string): Promise<ApiResponse<void>> {
  const response = await request.delete<ApiResponse<void>>(`/api/admin/api/v1/i18n/languages/${id}`);
  return response.data;
}

// 获取帮助文档列表
export async function getHelpDocuments(): Promise<ApiResponse<HelpDocument[]>> {
  const response = await request.get<ApiResponse<HelpDocument[]>>("/api/admin/api/v1/help/documents");
  return response.data;
}

// 获取指定语言的帮助文档
export async function getHelpDocumentByLanguage(documentId: string, languageCode: string): Promise<ApiResponse<HelpDocument>> {
  const response = await request.get<ApiResponse<HelpDocument>>(`/api/admin/api/v1/help/documents/${documentId}/languages/${languageCode}`);
  return response.data;
}

// 更新帮助文档的多语言内容
export async function updateHelpDocumentTranslation(documentId: string, languageCode: string, translation: any): Promise<ApiResponse<HelpDocument>> {
  const response = await request.put<ApiResponse<HelpDocument>>(`/api/admin/api/v1/help/documents/${documentId}/languages/${languageCode}`, translation);
  return response.data;
}

// 删除帮助文档的多语言内容
export async function deleteHelpDocumentTranslation(documentId: string, languageCode: string): Promise<ApiResponse<void>> {
  const response = await request.delete<ApiResponse<void>>(`/api/admin/api/v1/help/documents/${documentId}/languages/${languageCode}`);
  return response.data;
}