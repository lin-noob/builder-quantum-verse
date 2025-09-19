import { request } from "@/lib/request";

export const langCodeOptions = [
  {
    label: "中文",
    value: "zh-CN",
  },
  {
    label: "英语（美国）",
    value: "en-US",
  },
  {
    label: "印尼语（印尼）",
    value: "id",
  },
  {
    label: "马来语（马来西亚）",
    value: "ms",
  },
  {
    label: "泰语（泰国）",
    value: "th",
  },
  {
    label: "越南语（越南）",
    value: "vi",
  },
  {
    label: "菲律宾语（菲律宾）",
    value: "fil",
  },
  {
    label: "老挝语（老挝）",
    value: "lo",
  },
  {
    label: "柬埔寨语（柬埔寨）",
    value: "km",
  },
  {
    label: "德语（德国）",
    value: "de",
  },
  {
    label: "法语（法国）",
    value: "fr",
  },
  {
    label: "西班牙语（西班牙）",
    value: "es",
  },
  {
    label: "意大利语（意大利）",
    value: "it",
  },
];

// 翻译项类型定义
export interface TranslationItem {
  id: string;
  keyCode: string;
  name: string;
  transform?: string;
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
export async function getI18nCategories(): Promise<
  ApiResponse<MenuCategory[]>
> {
  const response = await request.get<ApiResponse<MenuCategory[]>>(
    "/api/admin/api/v1/i18n/categories",
  );
  return response.data;
}

// 获取所有翻译项
export async function getI18nTranslations(): Promise<
  ApiResponse<TranslationItem[]>
> {
  const response = await request.get<ApiResponse<TranslationItem[]>>(
    "/api/admin/api/v1/i18n/translations",
  );
  return response.data;
}

// 获取指定分类的翻译项
export async function getI18nTranslationsByCategory(
  category: string,
): Promise<ApiResponse<TranslationItem[]>> {
  const response = await request.get<ApiResponse<TranslationItem[]>>(
    `/api/admin/api/v1/i18n/translations?category=${category}`,
  );
  return response.data;
}

// 创建新的翻译项
export async function createI18nTranslation(
  translation: Omit<TranslationItem, "id">,
): Promise<ApiResponse<TranslationItem>> {
  const response = await request.post<ApiResponse<TranslationItem>>(
    "/api/admin/api/v1/i18n/translations",
    translation,
  );
  return response.data;
}

// 更新翻译项
export async function updateI18nTranslation(
  translation: TranslationItem,
): Promise<ApiResponse<TranslationItem>> {
  const response = await request.put<ApiResponse<TranslationItem>>(
    "/api/admin/api/v1/i18n/translations",
    translation,
  );
  return response.data;
}

// 删除翻译项
export async function deleteI18nTranslation(
  id: string,
): Promise<ApiResponse<void>> {
  const response = await request.delete<ApiResponse<void>>(
    `/api/admin/api/v1/i18n/translations/${id}`,
  );
  return response.data;
}

// 导出翻译项
export async function exportI18nTranslations(): Promise<Blob> {
  const response = await request.get(
    "/api/admin/api/v1/i18n/translations/export",
    {
      responseType: "blob",
    },
  );
  return response.data;
}

// 导入翻译项
export async function importI18nTranslations(
  file: File,
): Promise<ApiResponse<void>> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await request.post<ApiResponse<void>>(
    "/api/admin/api/v1/i18n/translations/import",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
}

// 翻译接口
export async function translateText(
  languageId: string,
  translateAll: boolean = true,
  translateType: number = 1
): Promise<ApiResponse<void>> {
  const response = await request.post<ApiResponse<void>>(
    "/admin/api/v1/language/translate",
    {
      languageId,
      translateAll,
      translateType
    }
  );
  return response.data;
}

// 更新菜单项名称
export async function updateMenuItemName(
  languageId: string,
  menuId: string,
  name: string
): Promise<ApiResponse<void>> {
  const response = await request.put<ApiResponse<void>>(
    "/admin/api/v1/language/menu",
    {
      languageId,
      menuId,
      name
    }
  );
  return response.data;
}

// 获取菜单的翻译文案
export async function getMenuTranslations(
  languageId: string,
  menuId: string,
  signal?: AbortSignal
): Promise<ApiResponse<TranslationItem[]>> {
  const response = await request.get<ApiResponse<TranslationItem[]>>(
    `/admin/api/v1/language/menu/view/${languageId}?menuId=${menuId}`
  );
  return response.data;
}

// 表格翻译接口
export async function translateTableItems(
  languageId: string,
  menuId: string,
  idList: string[],
  translateType: number = 2
): Promise<ApiResponse<void>> {
  const response = await request.post<ApiResponse<void>>(
    "/admin/api/v1/language/translate",
    {
      languageId,
      menuId,
      translateType,
      idList
    }
  );
  return response.data;
}

// 保存翻译文案详情
export async function saveTranslationDetail(
  id: string,
  keyCode: string,
  languageId: string,
  menuId: string,
  name: string,
  transform: string
): Promise<ApiResponse<void>> {
  const response = await request.put<ApiResponse<void>>(
    "/admin/api/v1/language/menu/detail",
    {
      id,
      keycode: keyCode,
      languageId,
      menuId,
      name,
      transform
    }
  );
  return response.data;
}
