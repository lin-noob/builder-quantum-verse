# 帮助文档多语言管理功能设计文档

## 功能概述
为帮助文档系统添加多语言支持，使得每种语言都有单独的内容配置，提升产品的国际化能力。

## 需求分析
1. 每个帮助文档需要支持多种语言的内容配置
2. 在多语言管理系统中添加帮助文档管理模块
3. 支持帮助文档的多语言内容编辑、预览和发布
4. 前端根据用户选择的语言显示对应的文档内容

## 技术方案

### 1. 数据模型扩展
扩展HelpDocument接口，添加多语言支持：

```typescript
interface HelpDocument {
  id: string;
  title: string;
  category: string;
  description: string;
  content: string;
  lastUpdated: string;
  views: number;
  likes: number;
  isPopular: boolean;
  // 新增多语言内容字段
  translations: {
    [languageCode: string]: {
      title: string;
      description: string;
      content: string;
    }
  };
  // SEO字段保持不变
  url?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}
```

### 2. API接口设计
在i18nService.ts中添加帮助文档相关的API：

```typescript
// 获取帮助文档列表（支持多语言）
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
```

### 3. 前端实现方案

#### 3.1 在I18nTranslationManager.tsx中添加帮助文档管理模块
在现有的多语言管理系统中添加一个新的Tab或模块，用于管理帮助文档的多语言内容。

#### 3.2 创建帮助文档多语言编辑组件
创建一个专门的组件用于编辑帮助文档的多语言内容，支持：
- 语言选择下拉框
- 多语言内容编辑器
- 实时预览功能
- 发布状态管理

### 4. 后端实现要点
1. 数据库表结构需要调整，支持文档的多语言内容存储
2. API接口需要支持多语言内容的增删改查
3. 文档查询时根据用户语言返回对应的内容

## 界面设计

### 1. 帮助文档多语言管理页面
采用与现有I18nTranslationManager.tsx类似的三列布局：
- 左侧：语言列表
- 中间：帮助文档分类导航
- 右侧：文档列表和内容编辑区

### 2. 文档编辑界面
- 顶部：文档基本信息和语言选择
- 中部：富文本编辑器（支持多语言内容编辑）
- 底部：操作按钮（保存、预览、发布）

## 实施步骤

### 第一阶段：数据模型和API扩展
1. 扩展HelpDocument数据模型
2. 实现后端API接口
3. 更新数据库表结构

### 第二阶段：前端界面开发
1. 在多语言管理系统中添加帮助文档管理模块
2. 实现帮助文档多语言编辑界面
3. 添加预览和发布功能

### 第三阶段：集成和测试
1. 集成前后端功能
2. 进行功能测试和用户体验优化
3. 编写使用文档

## 注意事项
1. 需要考虑文档版本管理和历史记录
2. 多语言内容的权限控制
3. 文档SEO信息的多语言支持
4. 性能优化，避免加载过多语言内容