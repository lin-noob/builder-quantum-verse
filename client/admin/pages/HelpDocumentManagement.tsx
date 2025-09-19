import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  ChevronRight,
  ChevronDown,
  GripVertical,
  BookOpen,
  Folder,
  FileText,
  Save,
  X,
  Globe,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { request } from "@/lib/request";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

// 数据模型
interface HelpCategory {
  id: string;
  name: string;
  parentId: string | null;
  children: HelpCategory[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface Language {
  id: string;
  name: string;
  code: string;
}

interface HelpDocument {
  id: string;
  title: string;
  categoryId: string;
  description: string;
  content: string;
  order: number;
  views: number;
  likes: number;
  isPopular: boolean;
  status: "published" | "draft" | "archived";
  createdAt: string;
  updatedAt: string;
  // 新增多语言内容字段
  translations: {
    [languageCode: string]: {
      title: string;
      description: string;
      content: string;
    };
  };
  // 新增SEO字段
  url?: string; // 自定义URL
  seoTitle?: string; // SEO标题
  seoDescription?: string; // SEO描述
  seoKeywords?: string; // SEO关键字
}

export default function HelpDocumentManagement() {
  const [categories, setCategories] = useState<HelpCategory[]>([]);
  const [documents, setDocuments] = useState<HelpDocument[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<HelpCategory | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paginatedDocuments, setPaginatedDocuments] = useState([]);
  // 语言相关状态
  const [lang, setLanguages] = useState<Language[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [languageLoading, setLanguageLoading] = useState(true);

  // 扁平化分类树的函数
  const flattenCategories = (categories: HelpCategory[]): HelpCategory[] => {
    const result: HelpCategory[] = [];
    
    const flatten = (cats: HelpCategory[]) => {
      cats.forEach(cat => {
        result.push(cat);
        if (cat.children && cat.children.length > 0) {
          flatten(cat.children);
        }
      });
    };
    
    flatten(categories);
    return result;
  };

  // 获取扁平化的分类列表
  const flatCategories = flattenCategories(categories);

  // 获取文档列表 - 添加locale参数
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 构建请求参数
      const params: any = {};
      if (selectedLanguage?.code) {
        params.locale = selectedLanguage.code;
      }
      
      const response = await request.get('/admin/api/v1/article', { params });
      setDocuments(response.data.data || []);
    } catch (err) {
      console.error('获取文档列表失败:', err);
      setError('获取文档列表失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 获取分类列表（如果后端也有分类接口的话）
  const fetchCategories = async () => {
    try {
      // 如果后端有分类接口，可以调用
      // const response = await request.get('/admin/api/v1/categories');
      // setCategories(response.data.data || []);

      // 暂时使用空数组，后续可以实现分类接口
      setCategories([]);
    } catch (err) {
      console.error('获取分类列表失败:', err);
    }
  };

  // 获取语言列表
  const fetchLanguages = async () => {
    try {
      setLanguageLoading(true);
      const response = await request.get('/admin/api/v1/auth/language');
      const languageData: Language[] = response.data.data || [];
      setLanguages(languageData);
      if (languageData.length > 0) {
        setSelectedLanguage(languageData[0]); // 默认选择第一个语言
      }
    } catch (err) {
      console.error('获取语言列表失败:', err);
    } finally {
      setLanguageLoading(false);
    }
  };

  // 处理语言选择
  const handleSelectLanguage = (language: Language) => {
    setSelectedLanguage(language);
    // 重新获取文档列表
    setTimeout(() => {
      fetchDocuments();
    }, 100);
  };

  // 初始化数据
  useEffect(() => {
    fetchCategories();
    fetchLanguages();
  }, []);

  // 当语言选择改变时，重新获取文档
  useEffect(() => {
    if (selectedLanguage) {
      fetchDocuments();
    }
  }, [selectedLanguage]);

  // 拖拽相关状态
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // 搜索和筛选状态
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // ���话框状态
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false);
  const [isEditingDocument, setIsEditingDocument] = useState(false);

  // 编辑状态
  const [editingCategory, setEditingCategory] = useState<HelpCategory | null>(
    null,
  );
  const [editingDocument, setEditingDocument] = useState<HelpDocument | null>(
    null,
  );

  // 表单状态
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    parentId: "",
  });
  const [documentForm, setDocumentForm] = useState({
    title: "",
    categoryId: "",
    description: "",
    content: "",
    status: "draft" as const,
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    url: "",
  });

  // 多语言状态
  const [currentLanguage, setCurrentLanguage] = useState("zh");
  const [translationContent, setTranslationContent] = useState<{
    [key: string]: { title: string; description: string; content: string };
  }>({});

  // 获取分类名称
  const getCategoryName = (categoryId: string) => {
    const category = flatCategories.find((cat) => cat.id === categoryId);
    return category ? category.name : "未知分类";
  };

  // 处理分类展开/折叠
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  // 处理选择分类
  const handleSelectCategory = (category: HelpCategory) => {
    setSelectedCategory(category);
  };

  // 拖拽处理函数
  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  const handleDragEnter = (index: number) => {
    if (draggedItem === null) return;
    // 这里可以实现拖拽排序逻辑
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  // 处理分类表单提交
  const handleCategorySubmit = async () => {
    if (!categoryForm.name.trim()) return;

    if (editingCategory) {
      // 更新分类 - 递归更新树状结构
      const updateCategoryInTree = (categories: HelpCategory[]): HelpCategory[] => {
        return categories.map(cat => {
          if (cat.id === editingCategory.id) {
            return {
              ...cat,
              name: categoryForm.name,
              parentId: categoryForm.parentId || null,
            };
          }
          return {
            ...cat,
            children: updateCategoryInTree(cat.children)
          };
        });
      };
      
      setCategories(updateCategoryInTree(categories));
    } else {
      // 创建新分类
      const newCategory: HelpCategory = {
        id: `cat_${Date.now()}`,
        name: categoryForm.name,
        parentId: categoryForm.parentId || null,
        order:
          flatCategories.filter(
            (c) => c.parentId === (categoryForm.parentId || null),
          ).length + 1,
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
        children: [],
      };
      
      if (categoryForm.parentId) {
        // 添加到父分类的children中
        const addToParent = (categories: HelpCategory[]): HelpCategory[] => {
          return categories.map(cat => {
            if (cat.id === categoryForm.parentId) {
              return {
                ...cat,
                children: [...cat.children, newCategory]
              };
            }
            return {
              ...cat,
              children: addToParent(cat.children)
            };
          });
        };
        setCategories(addToParent(categories));
      } else {
        // 添加为顶级分类
        setCategories([...categories, newCategory]);
      }
    }

    setIsCategoryDialogOpen(false);
  };

  // 处理删除分类
  const handleDeleteCategory = (categoryId: string) => {
    if (
      window.confirm("确定要删除这个分类吗？这将同时删除该分类下的所有文档。")
    ) {
      // 收集要删除的分类ID（包括子分类）
      const categoriesToDelete = new Set<string>();
      
      const collectCategoriesToDelete = (category: HelpCategory) => {
        categoriesToDelete.add(category.id);
        // 递归收集子分类
        category.children.forEach(child => collectCategoriesToDelete(child));
      };
      
      // 找到要删除的分类并收集���有相关ID
      const findAndCollectCategory = (categories: HelpCategory[]) => {
        for (const cat of categories) {
          if (cat.id === categoryId) {
            collectCategoriesToDelete(cat);
            return;
          }
          findAndCollectCategory(cat.children);
        }
      };
      
      findAndCollectCategory(categories);

      // 删除所有相关文档
      setDocuments((docs) => docs.filter((doc) => !categoriesToDelete.has(doc.categoryId)));
      
      // 删除分类 - 递归从树状结构中移除
      const removeCategoryFromTree = (categories: HelpCategory[]): HelpCategory[] => {
        return categories
          .filter(cat => cat.id !== categoryId)
          .map(cat => ({
            ...cat,
            children: removeCategoryFromTree(cat.children)
          }));
      };
      
      setCategories(removeCategoryFromTree(categories));

      // 如果删除的是当前选中的分类，清空选中
      if (selectedCategory && categoriesToDelete.has(selectedCategory.id)) {
        setSelectedCategory(null);
      }
    }
  };

  // 处理创建文档
  const handleCreateDocument = () => {
    setEditingDocument(null);
    setIsEditingDocument(false);
    setDocumentForm({
      title: "",
      categoryId: selectedCategory?.id || "",
      description: "",
      content: "",
      status: "draft",
      seoTitle: "",
      seoDescription: "",
      seoKeywords: "",
      url: "",
    });
    setTranslationContent({});
    setCurrentLanguage("zh");
    setIsDocumentDialogOpen(true);
  };

  // 处理编辑文档
  const handleEditDocument = (document: HelpDocument) => {
    setEditingDocument(document);
    setIsEditingDocument(true);
    setDocumentForm({
      title: document.title,
      categoryId: document.categoryId,
      description: document.description,
      content: document.content,
      status: document.status,
      seoTitle: document.seoTitle || "",
      seoDescription: document.seoDescription || "",
      seoKeywords: document.seoKeywords || "",
      url: document.url || "",
    });
    setTranslationContent(document.translations || {});
    setCurrentLanguage("zh");
    setIsDocumentDialogOpen(true);
  };

  // 处理文档表单提交
  const handleDocumentSubmit = async () => {
    if (!documentForm.title.trim() || !documentForm.categoryId) return;

    const documentData = {
      ...documentForm,
      id: editingDocument?.id || `doc_${Date.now()}`,
      order: editingDocument?.order || documents.length + 1,
      views: editingDocument?.views || 0,
      likes: editingDocument?.likes || 0,
      isPopular: editingDocument?.isPopular || false,
      createdAt:
        editingDocument?.createdAt ||
        new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      translations: translationContent,
    };

    if (editingDocument) {
      // 更新现有文档
      setDocuments(
        documents.map((doc) =>
          doc.id === editingDocument.id ? documentData : doc,
        ),
      );
    } else {
      // 创建新文档
      setDocuments([...documents, documentData]);
    }

    setIsDocumentDialogOpen(false);
  };

  // 处理删除文档
  const handleDeleteDocument = (documentId: string) => {
    if (window.confirm("确定要删除这个文档吗？")) {
      setDocuments(documents.filter((doc) => doc.id !== documentId));
    }
  };

  // 处理编辑分类
  const handleEditCategory = (category: HelpCategory) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      parentId: category.parentId || "",
    });
    setIsCategoryDialogOpen(true);
  };

  // 处理多语言内容变更
  const handleTranslationChange = (
    field: string,
    value: string,
    language: string,
  ) => {
    setTranslationContent((prev) => ({
      ...prev,
      [language]: {
        ...prev[language],
        [field]: value,
      },
    }));
  };

  // 渲染分类树
  const renderCategoryTree = (categories: HelpCategory[] = [], level = 0) => {
    return (
      <div className={level > 0 ? "ml-4" : ""}>
        {categories.map((category, index) => (
          <div
            key={category.id}
            className="mb-1"
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragEnter={() => handleDragEnter(index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()}
          >
            <div
              className={cn(
                "flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors group",
                selectedCategory?.id === category.id
                  ? "bg-blue-50 border border-blue-200"
                  : "",
              )}
              onClick={() => handleSelectCategory(category)}
            >
              <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />

              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCategory(category.id);
                }}
              >
                {category.children.length > 0 ? (
                  expandedCategories[category.id] ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )
                ) : (
                  <div className="w-4 h-4" />
                )}
              </Button>

              <Folder className="h-4 w-4 text-blue-500 flex-shrink-0" />

              <span className="flex-1 truncate text-sm">{category.name}</span>

              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditCategory(category);
                  }}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCategory(category.id);
                  }}
                >
                  <Trash2 className="h-3 w-3 text-red-500" />
                </Button>
              </div>
            </div>

            {expandedCategories[category.id] && category.children.length > 0 && (
              <div className="mt-1">
                {renderCategoryTree(category.children, level + 1)}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">帮助文档管理</h1>
          <p className="text-gray-600 mt-2">
            管理帮助文档的分类、内容和多语言版本
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreateDocument}>
            <Plus className="h-4 w-4 mr-2" />
            新建文档
          </Button>
        </div>
      </div>

      {/* 左中右三栏布局 */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        {/* 最左侧 - 语言列表 */}
        <div className="lg:col-span-2 flex flex-col h-full">
          <Card className="flex-1 flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="h-5 w-5" />
                语言列表
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              {languageLoading ? (
                <div className="flex items-center justify-center h-full text-gray-500">正在加载语言...</div>
              ) : (
                <ScrollArea className="h-full">
                  <div className="space-y-2">
                    {lang.map((language) => (
                      <div
                        key={language.id}
                        className={`flex cursor-pointer items-center justify-between p-3 rounded-lg transition-colors ${
                          selectedLanguage?.id === language.id
                            ? "bg-blue-100 text-blue-900 border border-blue-200"
                            : "hover:bg-gray-100"
                        }`}
                        onClick={() => handleSelectLanguage(language)}
                      >
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 min-w-4" />
                          <div>
                            <div className="font-medium">{language.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {language.code}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {lang.length === 0 && (
                      <div className="text-center py-4 text-gray-500">暂无语言</div>
                    )}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 中间 - 文档分类 */}
        <div className="lg:col-span-3 flex flex-col h-full">
          <Card className="flex-1 flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  文档分类
                </CardTitle>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingCategory(null);
                    setCategoryForm({ name: "", parentId: "" });
                    setIsCategoryDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  添加分类
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="space-y-2">
                  {renderCategoryTree(categories)}

                  {categories.length === 0 && (
                    <div className="text-center py-4 text-gray-500">暂无分类</div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* 最右侧 - 文档列表 */}
        <div className="lg:col-span-7 flex flex-col h-full">
          <Card className="flex-1 flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {selectedCategory
                      ? `${selectedCategory.name} - 文档列表`
                      : "所有文档"}
                  </CardTitle>
                  {selectedLanguage && (
                    <p className="text-sm text-gray-600 mt-1">
                      当前语言: {selectedLanguage.name} ({selectedLanguage.code})
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="搜索文档..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">全部状态</option>
                    <option value="published">已发布</option>
                    <option value="draft">草稿</option>
                    <option value="archived">已归档</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              <div className="h-full overflow-auto space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-gray-500">正在加载文档...</div>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center h-32">
                    <div className="text-red-500">{error}</div>
                    <Button className="mt-4" onClick={fetchDocuments}>
                      重试
                    </Button>
                  </div>
                ) : paginatedDocuments.length === 0 ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-gray-500">
                      {searchTerm || statusFilter !== "all"
                        ? "没有找到匹配的文档"
                        : selectedCategory
                        ? "该分类下暂无文档"
                        : "暂无文档"}
                    </div>
                  </div>
                ) : (
                  paginatedDocuments.map((document) => (
                    <div
                      key={document.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900">
                              {document.title}
                            </h3>
                            <Badge
                              variant={
                                document.status === "published"
                                  ? "default"
                                  : document.status === "draft"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {document.status === "published"
                                ? "已发布"
                                : document.status === "draft"
                                ? "草稿"
                                : "已归档"}
                            </Badge>
                            {document.isPopular && (
                              <Badge variant="destructive">热门</Badge>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mb-2">
                            {document.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>分类: {getCategoryName(document.categoryId)}</span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {document.views}
                            </span>
                            <span>更新: {document.updatedAt}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditDocument(document)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteDocument(document.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 分类编辑对话框 */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "编辑分类" : "新建分类"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="category-name">分类名称</Label>
              <Input
                id="category-name"
                value={categoryForm.name}
                onChange={(e) =>
                  setCategoryForm({ ...categoryForm, name: e.target.value })
                }
                placeholder="请输入分类名称"
              />
            </div>
            <div>
              <Label htmlFor="parent-category">上级分类</Label>
              <select
                id="parent-category"
                value={categoryForm.parentId}
                onChange={(e) =>
                  setCategoryForm({ ...categoryForm, parentId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">无上级分类</option>
                {flatCategories
                  .filter(
                    (cat) => !editingCategory || cat.id !== editingCategory.id,
                  )
                  .map((category) => {
                    // 计算分类层级缩进
                    const getIndent = (catId: string, level: number = 0): number => {
                      const cat = flatCategories.find(c => c.id === catId);
                      if (!cat || !cat.parentId) return level;
                      return getIndent(cat.parentId, level + 1);
                    };
                    const indent = getIndent(category.id);
                    const prefix = '　'.repeat(indent);
                    
                    return (
                      <option key={category.id} value={category.id}>
                        {prefix}{category.name}
                      </option>
                    );
                  })}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCategoryDialogOpen(false)}
            >
              取消
            </Button>
            <Button onClick={handleCategorySubmit}>
              {editingCategory ? "更新" : "创建"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 文档编辑对话框 */}
      <Dialog open={isDocumentDialogOpen} onOpenChange={setIsDocumentDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {isEditingDocument ? "���辑文档" : "新建文档"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* 基本信息 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="doc-title">文档标题</Label>
                <Input
                  id="doc-title"
                  value={documentForm.title}
                  onChange={(e) =>
                    setDocumentForm({ ...documentForm, title: e.target.value })
                  }
                  placeholder="请输入文档标题"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doc-category">所属分类</Label>
                <select
                  id="doc-category"
                  value={documentForm.categoryId}
                  onChange={(e) =>
                    setDocumentForm({
                      ...documentForm,
                      categoryId: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">请选择分类</option>
                  {flatCategories.map((category) => {
                    // 计算分类层级缩进
                    const getIndent = (catId: string, level: number = 0): number => {
                      const cat = flatCategories.find(c => c.id === catId);
                      if (!cat || !cat.parentId) return level;
                      return getIndent(cat.parentId, level + 1);
                    };
                    const indent = getIndent(category.id);
                    const prefix = '　'.repeat(indent);
                    
                    return (
                      <option key={category.id} value={category.id}>
                        {prefix}{category.name}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="doc-description">文档描述</Label>
              <Textarea
                id="doc-description"
                value={documentForm.description}
                onChange={(e) =>
                  setDocumentForm({
                    ...documentForm,
                    description: e.target.value,
                  })
                }
                placeholder="请输入文档描述"
                rows={3}
              />
            </div>

            {/* 多语言标签页 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <Label>多语言内容</Label>
              </div>

              <div className="flex gap-2 border-b">
                {lang.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => setCurrentLanguage(lang.id)}
                    className={cn(
                      "px-3 py-2 text-sm font-medium border-b-2 transition-colors",
                      currentLanguage === lang.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700",
                    )}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {currentLanguage === "zh" ? (
                  <>
                    <div className="space-y-2">
                      <Label>内容</Label>
                      <ReactQuill
                        value={documentForm.content}
                        onChange={(value) =>
                          setDocumentForm({ ...documentForm, content: value })
                        }
                        modules={{
                          toolbar: [
                            [{ header: [1, 2, 3, false] }],
                            ["bold", "italic", "underline", "strike"],
                            [{ list: "ordered" }, { list: "bullet" }],
                            ["link", "image"],
                            ["clean"],
                          ],
                        }}
                        style={{ height: "200px", marginBottom: "50px" }}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>标题 ({lang.find(l => l.id === currentLanguage)?.name})</Label>
                      <Input
                        value={translationContent[currentLanguage]?.title || ""}
                        onChange={(e) =>
                          handleTranslationChange(
                            "title",
                            e.target.value,
                            currentLanguage,
                          )
                        }
                        placeholder={`请输入${lang.find(l => l.id === currentLanguage)?.name}标题`}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>描述 ({lang.find(l => l.id === currentLanguage)?.name})</Label>
                      <Textarea
                        value={translationContent[currentLanguage]?.description || ""}
                        onChange={(e) =>
                          handleTranslationChange(
                            "description",
                            e.target.value,
                            currentLanguage,
                          )
                        }
                        placeholder={`请输入${lang.find(l => l.id === currentLanguage)?.name}描述`}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>内容 ({lang.find(l => l.id === currentLanguage)?.name})</Label>
                      <ReactQuill
                        value={translationContent[currentLanguage]?.content || ""}
                        onChange={(value) =>
                          handleTranslationChange("content", value, currentLanguage)
                        }
                        modules={{
                          toolbar: [
                            [{ header: [1, 2, 3, false] }],
                            ["bold", "italic", "underline", "strike"],
                            [{ list: "ordered" }, { list: "bullet" }],
                            ["link", "image"],
                            ["clean"],
                          ],
                        }}
                        style={{ height: "200px", marginBottom: "50px" }}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* SEO设置 */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">SEO设置</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="seo-title">SEO标题</Label>
                  <Input
                    id="seo-title"
                    value={documentForm.seoTitle}
                    onChange={(e) =>
                      setDocumentForm({
                        ...documentForm,
                        seoTitle: e.target.value,
                      })
                    }
                    placeholder="请输入SEO标题"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seo-url">自定义URL</Label>
                  <Input
                    id="seo-url"
                    value={documentForm.url}
                    onChange={(e) =>
                      setDocumentForm({ ...documentForm, url: e.target.value })
                    }
                    placeholder="请输入自定义URL"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="seo-description">SEO描述</Label>
                <Textarea
                  id="seo-description"
                  value={documentForm.seoDescription}
                  onChange={(e) =>
                    setDocumentForm({
                      ...documentForm,
                      seoDescription: e.target.value,
                    })
                  }
                  placeholder="���输入SEO描述"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seo-keywords">SEO关键字</Label>
                <Input
                  id="seo-keywords"
                  value={documentForm.seoKeywords}
                  onChange={(e) =>
                    setDocumentForm({
                      ...documentForm,
                      seoKeywords: e.target.value,
                    })
                  }
                  placeholder="请输入SEO关键字，用逗号分隔"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="space-y-2">
                <Label htmlFor="doc-status">发布状态</Label>
                <select
                  id="doc-status"
                  value={documentForm.status}
                  onChange={(e) =>
                    setDocumentForm({
                      ...documentForm,
                      status: e.target.value as "published" | "draft" | "archived",
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="draft">草稿</option>
                  <option value="published">已发布</option>
                  <option value="archived">已归档</option>
                </select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDocumentDialogOpen(false)}
            >
              取消
            </Button>
            <Button onClick={handleDocumentSubmit}>
              <Save className="h-4 w-4 mr-2" />
              {isEditingDocument ? "更新文档" : "创建文档"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
