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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { request } from "@/lib/request";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { toast } from "sonner";
import DocumentCatalog, { CategoryNode, DocItem } from "@/components/Help/DocumentCatalog";

// 数据模型
interface HelpCategory {
  id: string;
  name: string;
  parentId: string | null;
  order: number;
  createdAt: string;
  gmtModified: string;
  hasParent: boolean;
  hasChildren: boolean;
  // children 属性在 API 响应中��能不存在
  // 通过 normalizeCategories 函数确保始终为数组，简化后续处理逻辑
  children?: HelpCategory[];
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
  status: number; // 0=草稿, 1=已发布
  createdAt: string;
  gmtModified: string;
  // 新增多语言内容字段
  translations: {
    [languageCode: string]: {
      title: string;
      description: string;
      content: string;
    };
  };
  url?: string; // 自定义URL
  seoTitle?: string; // SEO标题
  seoDescription?: string; // SEO描述
  seoKeywords?: string; // SEO关键字
}

export default function HelpDocumentManagement() {
  const [categories, setCategories] = useState<HelpCategory[]>([]);
  const [documents, setDocuments] = useState<HelpDocument[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<HelpCategory | null>(
    null,
  );
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paginatedDocuments, setPaginatedDocuments] = useState<HelpDocument[]>([]);
  // 语言相关状态
  const [lang, setLanguages] = useState<Language[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(
    null,
  );
  const [languageLoading, setLanguageLoading] = useState(true);
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
    // 过滤和分页文档
    const [filteredDocuments, setFilteredDocuments] = useState<HelpDocument[]>([]);
  // 触发子组件刷新文档列表
  const [docRefreshKey, setDocRefreshKey] = useState(0);
  const triggerDocRefresh = () => setDocRefreshKey((k) => k + 1);

  // 拖拽相关状态
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  // 搜索和筛选状态
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false);
  const [isEditingDocument, setIsEditingDocument] = useState(false);

  // AlertDialog状态
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<'category' | 'document'>('document');
  const [deleteTarget, setDeleteTarget] = useState<{id: string, name?: string} | null>(null);

  const [editingCategory, setEditingCategory] = useState<HelpCategory | null>(
    null,
  );
  const [editingDocument, setEditingDocument] = useState<HelpDocument | null>(
    null,
  );

  const flattenCategories = (categories: HelpCategory[]): HelpCategory[] => {
    const result: HelpCategory[] = [];

    const flatten = (cats: HelpCategory[]) => {
      if (!Array.isArray(cats)) return;

      cats.forEach((cat) => {
        result.push(cat);
        // 由于数据已标准化，children 始终存在且为数组，只需检查长度
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


  // 标准化分类数据，确保 children 始终是数组
  const normalizeCategories = (categories: HelpCategory[]): HelpCategory[] => {
    if (!Array.isArray(categories)) {
      return [];
    }

    return categories.map(category => ({
      ...category,
      children: category.children && Array.isArray(category.children)
        ? normalizeCategories(category.children)
        : [],
    }));
  };

  // 获取分类列表树状结构
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      // 构建请求参数
      const params: any = {};
      if (selectedLanguage?.code) {
        params.locale = selectedLanguage.code;
      }

      const response = await request.get(
        "/admin/api/v1/article/classify/tree",
        params,
      );

      // 标准化数据，确保每个分类都有 children 数组
      const rawCategories = response.data.data || [];
      const normalizedCategories = normalizeCategories(rawCategories);
      setCategories(normalizedCategories);
    } catch (err) {
      console.error("获取分类列表失败:", err);
    } finally {
      setLoading(false);
    }
  };

  // 获取语言列表
  const fetchLanguages = async () => {
    try {
      setLanguageLoading(true);
      const response = await request.get("/admin/api/v1/auth/language");
      const languageData: Language[] = response.data.data || [];
      setLanguages(languageData);
      if (languageData.length > 0) {
        setSelectedLanguage(languageData[0]); // 默认选择第一个语言
      }
    } catch (err) {
      console.error("获取语言列表失败:", err);
    } finally {
      setLanguageLoading(false);
    }
  };

  // 处理语言选择
  const handleSelectLanguage = (language: Language) => {
    setSelectedLanguage(language);
    // 重新获取文档列表
    // setTimeout(() => {
    //   fetchDocuments();
    // }, 100);
    setSelectedCategory(null);
    setDocuments([]);
  };

  useEffect(() => {
    fetchLanguages();
  }, []);

  useEffect(() => {
    if (selectedLanguage) {
      fetchCategories();
      // fetchDocuments();
    }
  }, [selectedLanguage]);

  // 当选择的分类改变时，交由 DocumentCatalog 内部获取
  useEffect(() => {
    if (!selectedCategory) {
      setDocuments([]);
    }
  }, [selectedCategory]);



  useEffect(() => {
    let filtered = documents;

    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(
        (doc) =>
          doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 状态过滤
    if (statusFilter !== "all") {
      const filterStatus = parseInt(statusFilter);
      filtered = filtered.filter((doc) => doc.status === filterStatus);
    }

    setFilteredDocuments(filtered);

    // 分页
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginated = filtered.slice(startIndex, endIndex);

    setPaginatedDocuments(paginated);
  }, [documents, searchTerm, statusFilter, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, selectedCategory]);

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    parentId: "0",
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

  // 获取分类名称
  const getCategoryName = (categoryId: string) => {
    const category = flatCategories.find((cat) => cat.id === categoryId);
    return category ? category.name : "";
  };

  // 处理分类展开/折叠
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const handleSelectCategory = (category: HelpCategory) => {
    if (selectedCategory?.id === category.id) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
    }
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
    if (!selectedLanguage) {
      toast.warning("请先选择语言");
      return;
    }

    try {
      if (editingCategory) {
        // 更新分类 - 调用PUT接口
        const updateData = {
          id: editingCategory.id,
          language: selectedLanguage.code,
          name: categoryForm.name,
          parentId: categoryForm.parentId || 0,
        };

        await request.put("/admin/api/v1/article/classify", updateData);

        // 重新获取分类列表
        await fetchCategories();
      } else {
        // 创建新分类
        const categoryData = {
          language: selectedLanguage.code,
          name: categoryForm.name,
          parentId: categoryForm.parentId || 0,
        };

        await request.post("/admin/api/v1/article/classify", categoryData);

        await fetchCategories();
      }

      setIsCategoryDialogOpen(false);
      setCategoryForm({ name: "", parentId: "0" });
      setEditingCategory(null);

      if (editingCategory) {
        toast.success("分类更新成功");
      } else {
        toast.success("分类创建成功");
      }
    } catch (err) {
      console.error("分类操作失败:", err);
      toast.error("分类操作失败，请稍后重试");
    }
  };

  // 打开删除分类确认框
  const openDeleteCategoryDialog = (categoryId: string) => {
    // 找到要删除的分类
    const findCategory = (
      categories: HelpCategory[],
      id: string,
    ): HelpCategory | null => {
      for (const cat of categories) {
        if (cat.id === id) return cat;
        const found = findCategory(cat.children, id);
        if (found) return found;
      }
      return null;
    };

    const categoryToDelete = findCategory(categories, categoryId);
    if (categoryToDelete) {
      setDeleteType('category');
      setDeleteTarget({id: categoryId, name: categoryToDelete.name});
      setDeleteAlertOpen(true);
    }
  };

  // 执行删除分类
  const executeDeleteCategory = async (categoryId: string) => {
    if (!selectedLanguage) {
      toast.warning("请先选择语言");
      return;
    }

    try {
      // 找到要删除的分类
      const findCategory = (
        categories: HelpCategory[],
        id: string,
      ): HelpCategory | null => {
        for (const cat of categories) {
          if (cat.id === id) return cat;
          const found = findCategory(cat.children, id);
          if (found) return found;
        }
        return null;
      };

      const categoryToDelete = findCategory(categories, categoryId);
      if (!categoryToDelete) {
        toast.error("找不到要删除的分类");
        return;
      }

      // 调用删除API
      const deleteData = {
        id: categoryId,
        language: selectedLanguage.code,
        name: categoryToDelete.name,
        parentId: categoryToDelete.parentId,
      };

      await request.delete("/admin/api/v1/article/classify", {
        data: deleteData,
      });

      // 重新获取分类列表
      await fetchCategories();

      // 如果删除的是当前选中的分类，清空选中
      if (selectedCategory && selectedCategory.id === categoryId) {
        setSelectedCategory(null);
      }

      // 重新获取文档列表
      triggerDocRefresh();

      // 显示成功提示
      toast.success("分类删除成功");
    } catch (err) {
      console.error("删除分类失败:", err);
      toast.error("删除分类失败，请稍后重试");
    }
  };

  // 处理删除分类
  const handleDeleteCategory = (categoryId: string) => {
    openDeleteCategoryDialog(categoryId);
  };

  // 备份旧函数
  const oldHandleDeleteCategory = async (categoryId: string) => {
    if (
      window.confirm("确定要删除这个分类吗？这将同时删除该分类下的所有文档。")
    ) {
      if (!selectedLanguage) {
        toast.warning("请先选择语言");
        return;
      }

      try {
        // 找到要删除的分类
        const findCategory = (
          categories: HelpCategory[],
          id: string,
        ): HelpCategory | null => {
          for (const cat of categories) {
            if (cat.id === id) return cat;
            // ��于数据已标准��，children 始终存���
            const found = findCategory(cat.children, id);
            if (found) return found;
          }
          return null;
        };

        const categoryToDelete = findCategory(categories, categoryId);
        if (!categoryToDelete) {
          toast.error("找不到要删除的分类");
          return;
        }

        // 调用删除API
        const deleteData = {
          id: categoryId,
          language: selectedLanguage.code,
          name: categoryToDelete.name,
          parentId: categoryToDelete.parentId,
        };

        await request.delete("/admin/api/v1/article/classify", {
          data: deleteData,
        });

        // 重新获取分类列表
        await fetchCategories();

        // 如果删除的是当前选中的分类，清空选中
        if (selectedCategory && selectedCategory.id === categoryId) {
          setSelectedCategory(null);
        }

        // 重新获取文档列表
        triggerDocRefresh();

        // 显示���功提示
        toast.success("分类删除成功");
      } catch (err) {
        console.error("删除分������败:", err);
        toast.error("删除分类失败，请稍后重试");
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
    setIsDocumentDialogOpen(true);
  };

  // 获取文档详情
  const fetchDocumentDetail = async (documentId: string) => {
    try {
      const response = await request.get(`/admin/api/v1/article/view/${documentId}`);
      return response.data.data;
    } catch (err) {
      console.error("获取文档详情失败:", err);
      toast.error("获取文档详情失败，请稍后重试");
      throw err;
    }
  };

  // 文���参数构建公共逻辑
  const buildDocumentData = (formData: typeof documentForm, isEdit: boolean = false, documentId?: string) => {
    if (!selectedLanguage) {
      throw new Error("请先选择语言");
    }

    // 将字符串状态转换为数字状态
    const getStatusNumber = (status: string) => {
      switch (status) {
        case "published":
          return 1;
        case "draft":
          return 0;
// 如果有归档状�����
        default:
          return 0; // 默认为草稿
      }
    };

    const baseData = {
      // 必填字段
      mainTitle: formData.title,
      name: formData.title,
      classifyId: formData.categoryId,
      content: formData.content,
      language: selectedLanguage.code,
      status: getStatusNumber(formData.status), // 转换为��字

      // SEO相关字段
      seoTitle: formData.seoTitle || formData.title,
      seoDescription: formData.seoDescription || formData.description,
      seoKeyword: formData.seoKeywords,
      url: formData.url,

      // 可选字段
      viceTitle: formData.description,
      type: 1,
      showContent: true,
      bannerUrl: "",
      directory: "",
      // fileType: "html",
      parentId: 0,
      path: formData.url,
    };

    // 编辑时添加id字段
    if (isEdit && documentId) {
      return {
        ...baseData,
        id: documentId,
      };
    }

    // 新建时添加排���字段
    return {
      ...baseData,
      orders: documents.length + 1,
    };
  };

  // 处理编辑文档 - 先获取详情再编辑
  const handleEditDocument = async (document: HelpDocument) => {
    // 将数字状态转换为字符串状态
    const getStatusString = (status: number | string) => {
      if (typeof status === 'string') return status;
      return status === 1 ? "published" : "draft";
    };

    try {
      // 先获取文档详情
      const documentDetail = await fetchDocumentDetail(document.id);

      setEditingDocument(document);
      setIsEditingDocument(true);

      // 使用详情数据填充表单
      setDocumentForm({
        title: documentDetail.mainTitle || documentDetail.title || "",
        categoryId: documentDetail.classifyId || document.categoryId,
        description: documentDetail.viceTitle || documentDetail.description || "",
        content: documentDetail.content || "",
        status: getStatusString(documentDetail.status), // 转换数字状态为字符串
        seoTitle: documentDetail.seoTitle || "",
        seoDescription: documentDetail.seoDescription || "",
        seoKeywords: documentDetail.seoKeyword || "",
        url: documentDetail.url || documentDetail.path || "",
      });

      setIsDocumentDialogOpen(true);
    } catch (err) {
      // 获取详情失败时，使用列表中的基本信息
      setEditingDocument(document);
      setIsEditingDocument(true);
      setDocumentForm({
        title: document.title,
        categoryId: document.categoryId,
        description: document.description,
        content: document.content,
        status: getStatusString(document.status), // 转换状态
        seoTitle: document.seoTitle || "",
        seoDescription: document.seoDescription || "",
        seoKeywords: document.seoKeywords || "",
        url: document.url || "",
      });
      setIsDocumentDialogOpen(true);
    }
  };

  // 处理文档表单提交
  const handleDocumentSubmit = async () => {
    if (!documentForm.title.trim() || !documentForm.categoryId) {
      toast.warning("请填写文档标题和选择分类");
      return;
    }

    try {
      if (editingDocument) {
        // 编辑文档 - 调用PUT接口
        const articleData = buildDocumentData(documentForm, true, editingDocument.id);

        await request.put("/admin/api/v1/article", articleData);

        // 更新成功后重新获取文档列表
        triggerDocRefresh();

        toast.success("文档更新成功");
      } else {
        // 创建新文档 - 调用POST接口
        const articleData = buildDocumentData(documentForm, false);

        await request.post("/admin/api/v1/article", articleData);

        // 创建成��后���新获取文档列表
        triggerDocRefresh();

        toast.success("文档创建成功");
      }

      setIsDocumentDialogOpen(false);
      setEditingDocument(null);
      setIsEditingDocument(false);

    } catch (err) {
      console.error("文档操���失败:", err);
      toast.error(editingDocument ? "文档更新失败，请稍后重试" : "文档创建失败，请稍后重试");
    }
  };

  // 打开删除文档确认框
  const openDeleteDocumentDialog = (documentId: string, documentTitle: string) => {
    setDeleteType('document');
    setDeleteTarget({id: documentId, name: documentTitle});
    setDeleteAlertOpen(true);
  };

  // 执行删除文档
  const executeDeleteDocument = async (documentId: string) => {
    try {
      // 这里应该调用删除API，现在先用本地删除模拟
      await request.delete(`/admin/api/v1/article/${documentId}`);

      // 重新获取文档列表
      triggerDocRefresh();

      toast.success("文档删除成功");
    } catch (err) {
      console.error("删除文档失败:", err);
      toast.error("删除文档失败，请稍后重试");
    }
  };

  // 处理删除文档
  const handleDeleteDocument = (documentId: string, documentTitle: string) => {
    openDeleteDocumentDialog(documentId, documentTitle);
  };

  // 统一的删除确认处理
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleteAlertOpen(false);

    if (deleteType === 'category') {
      await executeDeleteCategory(deleteTarget.id);
    } else if (deleteType === 'document') {
      await executeDeleteDocument(deleteTarget.id);
    }

    setDeleteTarget(null);
  };

  const handleEditCategory = (category: HelpCategory) => {
    if (!selectedLanguage) {
      toast.warning("请先选择语言");
      return;
    }
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      parentId: category.parentId || "0",
    });
    setIsCategoryDialogOpen(true);
  };

  // 渲染分类树
  const renderCategoryTree = (categories: HelpCategory[] = [], level = 0) => {
    if (!Array.isArray(categories)) {
      return null;
    }

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
                {category.children && category.children.length > 0 ? (
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

            {expandedCategories[category.id] &&
              category.children &&
              category.children.length > 0 && (
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
            整理帮助文档的分类、内容和多语言版本
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreateDocument}>
            <Plus className="h-4 w-4 mr-2" />
            新建文档
          </Button>
        </div>
      </div>

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
                <div className="flex items-center justify-center h-full text-gray-500">
                  正在加载语言...
                </div>
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
                      <div className="text-center py-4 text-gray-500">
                        暂无语言
                      </div>
                    )}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 右侧 - 文档分类 + 列表（复用组件） */}
        <div className="lg:col-span-10 flex flex-col h-full">
          <div className="mb-2">
            {selectedLanguage && (
              <p className="text-sm text-gray-600">
                当前语言: {selectedLanguage.name} ({selectedLanguage.code})
              </p>
            )}
          </div>

          <DocumentCatalog
            categories={(function mapCats(cs: HelpCategory[]): CategoryNode[] {
              return cs.map((c) => ({
                id: c.id,
                name: c.name,
                children: c.children && c.children.length ? mapCats(c.children) : [],
              }));
            })(categories)}
            languageCode={selectedLanguage?.code}
            fetchFromApi
            refreshKey={docRefreshKey}
            selectedCategoryId={selectedCategory?.id || null}
            onCategorySelect={(id) => {
              if (!id) {
                setSelectedCategory(null);
                return;
              }
              // find category by id in tree
              const find = (cs: HelpCategory[], target: string): HelpCategory | null => {
                for (const c of cs) {
                  if (c.id === target) return c;
                  const child = c.children && c.children.length ? find(c.children, target) : null;
                  if (child) return child;
                }
                return null;
              };
              const found = find(categories, id);
              if (found) setSelectedCategory(found);
            }}
            showStatusFilter={true}
            leftTitle="文档分类"
            rightTitle={selectedCategory ? `${selectedCategory.name} - 文档列表` : "所有文档"}
            renderDocumentActions={(document) => (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditDocument(document as any)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteDocument(document.id, (document as any).title)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </>
            )}
            enableCategoryActions
            onAddCategory={() => {
              setEditingCategory(null);
              setCategoryForm({ name: "", parentId: "0" });
              setIsCategoryDialogOpen(true);
            }}
            onEditCategory={(categoryId) => {
              const find = (cs: HelpCategory[], target: string): HelpCategory | null => {
                for (const c of cs) {
                  if (c.id === target) return c;
                  const child = c.children && c.children.length ? find(c.children, target) : null;
                  if (child) return child;
                }
                return null;
              };
              const found = find(categories, categoryId);
              if (found) handleEditCategory(found);
            }}
            onDeleteCategory={(categoryId) => handleDeleteCategory(categoryId)}
            onReorderCategories={async (sourceId, targetId) => {
              try {
                const formData = new FormData();
                formData.append("sourceId", sourceId);
                formData.append("targetId", targetId);
                await request.post("/admin/api/v1/article/move", formData);
                toast.success("已更新排序");
                await fetchCategories();
                triggerDocRefresh();
              } catch (err) {
                console.error("移动失败:", err);
                toast.error("移动失败，请稍后重试");
              }
            }}
          />
        </div>
      </div>

      <Dialog
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "编辑分类" : "新建分类"}
            </DialogTitle>
            {selectedLanguage && (
              <DialogDescription>
                当前语言: {selectedLanguage.name} ({selectedLanguage.code})
              </DialogDescription>
            )}
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
                <option value="0">无上级分类</option>
                {flatCategories
                  .filter(
                    (cat) => !editingCategory || cat.id !== editingCategory.id,
                  )
                  .map((category) => {
                    // 计算分类层级缩进
                    const getIndent = (
                      catId: string,
                      level: number = 0,
                    ): number => {
                      const cat = flatCategories.find((c) => c.id === catId);
                      if (!cat || !cat.parentId) return level;
                      return getIndent(cat.parentId, level + 1);
                    };
                    const indent = getIndent(category.id);
                    const prefix = "　".repeat(indent);

                    return (
                      <option key={category.id} value={category.id}>
                        {prefix}
                        {category.name}
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
      <Dialog
        open={isDocumentDialogOpen}
        onOpenChange={setIsDocumentDialogOpen}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {isEditingDocument ? "编辑文档" : "新建文档"}
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
                    const getIndent = (
                      catId: string,
                      level: number = 0,
                    ): number => {
                      const cat = flatCategories.find((c) => c.id === catId);
                      if (!cat || !cat.parentId) return level;
                      return getIndent(cat.parentId, level + 1);
                    };
                    const indent = getIndent(category.id);
                    const prefix = "　".repeat(indent);

                    return (
                      <option key={category.id} value={category.id}>
                        {prefix}
                        {category.name}
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

            {/* 文档内容 */}
            <div className="space-y-2">
              <Label>文档内容</Label>
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
                  placeholder="请输入SEO描述"
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
                      status: e.target.value as
                        | "published"
                        | "draft",
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="draft">草稿</option>
                  <option value="published">已发布</option>
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

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteType === 'category'
                ? `确定要删除分类"${deleteTarget?.name}"吗？这将同时删除该分类下的所有文档。此操作无法撤销。`
                : `确定要删除文档"${deleteTarget?.name}"吗？此操作无法撤销。`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
