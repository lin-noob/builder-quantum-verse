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