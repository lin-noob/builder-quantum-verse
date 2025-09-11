import React, { useState, useRef } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
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
  X
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
import { cn } from "@/lib/utils";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

// 数据模型
interface HelpCategory {
  id: string;
  name: string;
  parentId: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
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
  // 新增SEO字段
  url?: string; // 自定义URL
  seoTitle?: string; // SEO标题
  seoDescription?: string; // SEO描述
  seoKeywords?: string; // SEO关键字
}

// 模拟数据
const mockCategories: HelpCategory[] = [
  {
    id: "1",
    name: "用户指南",
    parentId: null,
    order: 1,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01"
  },
  {
    id: "2",
    name: "功能说明",
    parentId: null,
    order: 2,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01"
  },
  {
    id: "3",
    name: "开发者指南",
    parentId: null,
    order: 3,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01"
  },
  {
    id: "4",
    name: "高级功能",
    parentId: "2",
    order: 1,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01"
  }
];

const mockDocuments: HelpDocument[] = [
  {
    id: "1",
    title: "快速入门指南",
    categoryId: "1",
    description: "了解如何快速开始使用AI营销平台，包括账户注册、项目创建和基础功能使用。",
    content: "<h2>欢迎使用AI营销平台</h2><p>AI营销平台是一款基于人工智能技术的营销自动化工具...</p>",
    order: 1,
    views: 1250,
    likes: 98,
    isPopular: true,
    status: "published",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-15"
  },
  {
    id: "2",
    title: "用户画像功能详解",
    categoryId: "2",
    description: "深入介绍用户画像功能的使用方法，包括数据导入、标签管理和人群分群。",
    content: "<h2>用户画像功能详解</h2><p>用户画像功能是AI营销平台的核心功能之一...</p>",
    order: 1,
    views: 890,
    likes: 76,
    isPopular: true,
    status: "published",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-12"
  },
  {
    id: "3",
    title: "AI营销策略配置",
    categoryId: "4",
    description: "详细说明如何配置和优化AI营销策略，提高营销效果和转化率。",
    content: "<h2>AI营销策略配置</h2><p>AI营销策略是平台的核心功能，通过机器学习算法自动优化营销效果...</p>",
    order: 1,
    views: 756,
    likes: 65,
    isPopular: false,
    status: "published",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-10"
  },
  {
    id: "4",
    title: "API接口文档",
    categoryId: "3",
    description: "完整的API接口文档，包括认证方式、请求格式、响应格式和错误码说明。",
    content: "<h2>API接口文档</h2><p>为开发者提供的完整API接口文档...</p>",
    order: 1,
    views: 1120,
    likes: 89,
    isPopular: true,
    status: "published",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-08"
  }
];

export default function HelpDocumentManagement() {
  const [categories, setCategories] = useState<HelpCategory[]>(mockCategories);
  const [documents, setDocuments] = useState<HelpDocument[]>(mockDocuments);
  const [selectedCategory, setSelectedCategory] = useState<HelpCategory | null>(mockCategories[0]);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    "1": true,
    "2": true
  });
  
  // 对话框状态
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isDocumentDrawerOpen, setIsDocumentDrawerOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<HelpCategory | null>(null);
  const [editingDocument, setEditingDocument] = useState<HelpDocument | null>(null);
  
  // 表单状态
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    parentId: ""
  });
  
  const [documentForm, setDocumentForm] = useState({
    title: "",
    categoryId: "",
    description: "",
    content: "",
    isPopular: false,
    status: "draft" as "published" | "draft" | "archived",
    // 新增SEO字段
    url: "",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: ""
  });
  
  // 搜索状态
  const [searchTerm, setSearchTerm] = useState("");
  
  // 获取子分类
  const getChildCategories = (parentId: string | null) => {
    return categories
      .filter(cat => cat.parentId === parentId)
      .sort((a, b) => a.order - b.order);
  };
  
  // 拖拽相关状态
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  
  // 获取分类下的文档
  const getCategoryDocuments = (categoryId: string) => {
    return documents
      .filter(doc => doc.categoryId === categoryId)
      .sort((a, b) => a.order - b.order);
  };
  
  // 切换分类展开/收起
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };
  
  // 处理选择分类
  const handleSelectCategory = (category: HelpCategory) => {
    setSelectedCategory(category);
  };
  
  // 处理创建分类
  const handleCreateCategory = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: "",
      parentId: selectedCategory?.id || ""
    });
    setIsCategoryDialogOpen(true);
  };
  
  // 处理编辑分类
  const handleEditCategory = (category: HelpCategory) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      parentId: category.parentId || ""
    });
    setIsCategoryDialogOpen(true);
  };
  
  // 处理保存分类
  const handleSaveCategory = () => {
    if (!categoryForm.name.trim()) {
      alert("请输入分类名称");
      return;
    }
    
    if (editingCategory) {
      // 更新分类
      setCategories(categories.map(cat => 
        cat.id === editingCategory.id 
          ? { ...cat, name: categoryForm.name, parentId: categoryForm.parentId || null } 
          : cat
      ));
    } else {
      // 创建新分类
      const newCategory: HelpCategory = {
        id: `cat_${Date.now()}`,
        name: categoryForm.name,
        parentId: categoryForm.parentId || null,
        order: categories.filter(c => c.parentId === (categoryForm.parentId || null)).length + 1,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      setCategories([...categories, newCategory]);
    }
    
    setIsCategoryDialogOpen(false);
  };
  
  // 处理删除分类
  const handleDeleteCategory = (categoryId: string) => {
    if (window.confirm("确定要删除这个分类吗？这将同时删除该分类下的所有文档。")) {
      // 删除分类及其子分类
      const deleteCategoryAndChildren = (id: string) => {
        // 删除子分类
        categories
          .filter(cat => cat.parentId === id)
          .forEach(child => deleteCategoryAndChildren(child.id));
        
        // 删除该分类下的文档
        setDocuments(docs => docs.filter(doc => doc.categoryId !== id));
        
        // 删除分类
        setCategories(cats => cats.filter(cat => cat.id !== id));
      };
      
      deleteCategoryAndChildren(categoryId);
      
      // 如果删除的是当前选中的分类，清空选中
      if (selectedCategory && selectedCategory.id === categoryId) {
        setSelectedCategory(null);
      }
    }
  };
  
  // 处理创建文档
  const handleCreateDocument = () => {
    if (!selectedCategory) {
      alert("请先选择一个分类");
      return;
    }
    
    setEditingDocument(null);
    setDocumentForm({
      title: "",
      categoryId: selectedCategory.id,
      description: "",
      content: "",
      isPopular: false,
      status: "draft"
    });
    setIsDocumentDrawerOpen(true);
  };
  
  // 处理编辑文档
  const handleEditDocument = (document: HelpDocument) => {
    setEditingDocument(document);
    setDocumentForm({
      title: document.title,
      categoryId: document.categoryId,
      description: document.description,
      content: document.content,
      isPopular: document.isPopular,
      status: document.status
    });
    setIsDocumentDrawerOpen(true);
  };
  
  // 处理保存文档
  const handleSaveDocument = () => {
    if (!documentForm.title.trim() || !documentForm.description.trim() || !documentForm.content.trim()) {
      alert("请填写所有必填字段");
      return;
    }
    
    // URL格式验证
    if (documentForm.url && !/^\/[a-zA-Z0-9\-_]{2,100}$/.test(documentForm.url)) {
      alert("URL格式不正确，请以/开头，只能包含字母、数字、连字符和下划线，长度为2-100个字符");
      return;
    }
    
    if (editingDocument) {
      // 更新文档
      setDocuments(documents.map(doc => 
        doc.id === editingDocument.id 
          ? { 
              ...doc, 
              title: documentForm.title,
              categoryId: documentForm.categoryId,
              description: documentForm.description,
              content: documentForm.content,
              isPopular: documentForm.isPopular,
              status: documentForm.status,
              // 更新SEO字段
              url: documentForm.url,
              seoTitle: documentForm.seoTitle,
              seoDescription: documentForm.seoDescription,
              seoKeywords: documentForm.seoKeywords,
              updatedAt: new Date().toISOString().split('T')[0]
            } 
          : doc
      ));
    } else {
      // 创建新文档
      const newDocument: HelpDocument = {
        id: `doc_${Date.now()}`,
        title: documentForm.title,
        categoryId: documentForm.categoryId,
        description: documentForm.description,
        content: documentForm.content,
        order: documents.filter(d => d.categoryId === documentForm.categoryId).length + 1,
        views: 0,
        likes: 0,
        isPopular: documentForm.isPopular,
        status: documentForm.status,
        // 新增SEO字段
        url: documentForm.url,
        seoTitle: documentForm.seoTitle,
        seoDescription: documentForm.seoDescription,
        seoKeywords: documentForm.seoKeywords,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      setDocuments([...documents, newDocument]);
    }
    
    setIsDocumentDrawerOpen(false);
  };
  
  // 处理删除文档
  const handleDeleteDocument = (documentId: string) => {
    if (window.confirm("确定要删除这篇文档吗？")) {
      setDocuments(documents.filter(doc => doc.id !== documentId));
    }
  };
  
  // 开始拖拽
  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };

  // 拖拽过程中
  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
  };

  // 拖拽结束
  const handleDragEnd = () => {
    if (dragItem.current !== null && dragOverItem.current !== null) {
      const newCategories = [...categories];
      const draggedItem = newCategories[dragItem.current];
      
      // 从原位置移除
      newCategories.splice(dragItem.current, 1);
      // 插入到新位置
      newCategories.splice(dragOverItem.current, 0, draggedItem);
      
      // 更新order字段
      const updatedCategories = newCategories.map((cat, index) => ({
        ...cat,
        order: index + 1
      }));
      
      setCategories(updatedCategories);
    }
    
    dragItem.current = null;
    dragOverItem.current = null;
  };
  
  // 渲染分类树
  const renderCategoryTree = (parentId: string | null = null, level = 0) => {
    const childCategories = getChildCategories(parentId);
    
    return (
      <div className={level > 0 ? "ml-4" : ""}>
        {childCategories.map((category, index) => (
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
                selectedCategory?.id === category.id ? "bg-blue-50 border border-blue-200" : ""
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
                {getChildCategories(category.id).length > 0 ? (
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
            
            {expandedCategories[category.id] && (
              <div className="mt-1">
                {renderCategoryTree(category.id, level + 1)}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  // 获取分类名称
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : "未知分类";
  };
  
  // 获取状态标签
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-100 text-green-800">已发布</Badge>;
      case "draft":
        return <Badge className="bg-yellow-100 text-yellow-800">草稿</Badge>;
      case "archived":
        return <Badge className="bg-gray-100 text-gray-800">已归档</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        {/* 移除了页面标题和副标题 */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 右侧：分类树状结构 (30%宽度) */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Folder className="h-5 w-5" />
                  文档分类
                </CardTitle>
                <Button size="sm" onClick={handleCreateCategory}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>
                管理文档分类结构
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {renderCategoryTree()}
                
                {categories.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    暂无分类
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 左侧：文档列表和编辑区域 (70%宽度) */}
        <div className="lg:col-span-2">
          {selectedCategory ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      {selectedCategory.name} - 文档列表
                    </CardTitle>
                    <CardDescription>
                      管理该分类下的文档
                    </CardDescription>
                  </div>
                  <Button onClick={handleCreateDocument}>
                    <Plus className="h-4 w-4 mr-2" />
                    新建文档
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* 文档搜索 */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="搜索文档..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                {/* 文档列表 */}
                <div className="space-y-2">
                  {getCategoryDocuments(selectedCategory.id)
                    .filter(doc => 
                      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      doc.description.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((doc) => (
                      <div 
                        key={doc.id} 
                        className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors group"
                      >
                        <GripVertical className="h-4 w-4 text-gray-400 cursor-move opacity-0 group-hover:opacity-100" />
                        
                        <FileText className="h-5 w-5 text-gray-500 flex-shrink-0" />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium truncate">{doc.title}</h3>
                            {doc.isPopular && (
                              <Badge className="bg-orange-100 text-orange-800 text-xs">热门</Badge>
                            )}
                            {getStatusBadge(doc.status)}
                          </div>
                          <p className="text-sm text-gray-500 truncate">{doc.description}</p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                            <span>浏览: {doc.views}</span>
                            <span>点赞: {doc.likes}</span>
                            <span>更新: {doc.updatedAt}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleEditDocument(doc)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleDeleteDocument(doc.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  }
                  
                  {getCategoryDocuments(selectedCategory.id).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      该分类下暂无文档
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    请选择一个分类
                  </h3>
                  <p className="text-gray-500">
                    从右侧分类列表中选择一个分类来管理文档
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* 分类编辑对话框 */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "编辑分类" : "新建分类"}
            </DialogTitle>
            <DialogDescription>
              {editingCategory ? "修改现有分类信息" : "创建新的文档分类"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="category-name">分类名称 *</Label>
              <Input
                id="category-name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                placeholder="请输入分类名称"
              />
            </div>
            
            <div>
              <Label htmlFor="parent-category">上级分类</Label>
              <select
                id="parent-category"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={categoryForm.parentId}
                onChange={(e) => setCategoryForm({...categoryForm, parentId: e.target.value})}
              >
                <option value="">无上级分类</option>
                {categories
                  .filter(cat => !editingCategory || cat.id !== editingCategory.id)
                  .map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveCategory}>
              {editingCategory ? "更新分类" : "创建分类"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 文档编辑抽屉 */}
      {isDocumentDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsDocumentDrawerOpen(false)}></div>
          <div className="absolute inset-y-0 right-0 w-full max-w-4xl bg-white shadow-xl overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingDocument ? "编辑文档" : "新建文档"}
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setIsDocumentDrawerOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <Label htmlFor="document-title">文档标题 *</Label>
                  <Input
                    id="document-title"
                    value={documentForm.title}
                    onChange={(e) => setDocumentForm({...documentForm, title: e.target.value})}
                    placeholder="请输入文档标题"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="document-category">所属分类</Label>
                    <select
                      id="document-category"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={documentForm.categoryId}
                      onChange={(e) => setDocumentForm({...documentForm, categoryId: e.target.value})}
                      disabled={!!editingDocument}
                    >
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="document-status">文档状态</Label>
                    <select
                      id="document-status"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={documentForm.status}
                      onChange={(e) => setDocumentForm({...documentForm, status: e.target.value as any})}
                    >
                      <option value="draft">草稿</option>
                      <option value="published">已发布</option>
                      <option value="archived">已归档</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="document-description">文档描述 *</Label>
                  <Textarea
                    id="document-description"
                    value={documentForm.description}
                    onChange={(e) => setDocumentForm({...documentForm, description: e.target.value})}
                    placeholder="请输入文档简短描述"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="document-content">文档内容 *</Label>
                  <ReactQuill
                    theme="snow"
                    value={documentForm.content}
                    onChange={(content) => setDocumentForm({...documentForm, content})}
                    modules={{
                      toolbar: [
                        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        ['link', 'image'],
                        ['clean']
                      ]
                    }}
                    className="min-h-[300px]"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPopular"
                    checked={documentForm.isPopular}
                    onChange={(e) => setDocumentForm({...documentForm, isPopular: e.target.checked})}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="isPopular">设为热门文档</Label>
                </div>
                
                {/* 新增SEO设置区域 */}
                <div className="space-y-4 border-t pt-6">
                  <h3 className="text-lg font-medium">SEO设置</h3>
                  
                  <div>
                    <Label htmlFor="document-url">自定义URL</Label>
                    <Input
                      id="document-url"
                      value={documentForm.url || ''}
                      onChange={(e) => setDocumentForm({...documentForm, url: e.target.value})}
                      placeholder="请输入自定义URL路径"
                    />
                    <p className="text-sm text-gray-500 mt-1">示例: /help/getting-started</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="seo-title">SEO标题</Label>
                    <Input
                      id="seo-title"
                      value={documentForm.seoTitle || ''}
                      onChange={(e) => setDocumentForm({...documentForm, seoTitle: e.target.value})}
                      placeholder="请输入SEO标题"
                      maxLength={60}
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>用于搜索引擎结果页面的标题</span>
                      <span>{(documentForm.seoTitle || '').length}/60</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="seo-description">SEO描述</Label>
                    <Textarea
                      id="seo-description"
                      value={documentForm.seoDescription || ''}
                      onChange={(e) => setDocumentForm({...documentForm, seoDescription: e.target.value})}
                      placeholder="请输入SEO描述"
                      rows={3}
                      maxLength={160}
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>用于搜索引擎结果页面的描述</span>
                      <span>{(documentForm.seoDescription || '').length}/160</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="seo-keywords">SEO关键字</Label>
                    <Input
                      id="seo-keywords"
                      value={documentForm.seoKeywords || ''}
                      onChange={(e) => setDocumentForm({...documentForm, seoKeywords: e.target.value})}
                      placeholder="请输入关键字，多个关键字用逗号分隔"
                    />
                    <p className="text-sm text-gray-500 mt-1">示例: AI营销,用户画像,数据分析</p>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button variant="outline" onClick={() => setIsDocumentDrawerOpen(false)}>
                    取消
                  </Button>
                  <Button onClick={handleSaveDocument}>
                    {editingDocument ? "更新文档" : "创建文档"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}