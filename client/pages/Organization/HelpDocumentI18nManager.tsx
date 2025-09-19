import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Globe,
  FileText,
  Sparkles,
  Save,
  X,
  ChevronDown,
  ChevronRight,
  Eye,
} from "lucide-react";
import * as i18nService from "@/services/i18nService";

// 类型定义
interface Language {
  id: string;
  name: string;
  code: string;
}

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

interface DocumentCategory {
  id: string;
  name: string;
  count: number;
  parentId: string | null;
}

interface EditingDocument {
  id: string;
  title: string;
  description: string;
  content: string;
}

const HelpDocumentI18nManager: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  
  // 语言列表数据
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  
  // 文档分类数据（树状结构）
  const [documentCategories, setDocumentCategories] = useState<DocumentCategory[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | null>(null);
  
  // 帮助文档数据
  const [documents, setDocuments] = useState<HelpDocument[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<HelpDocument[]>([]);
  
  // 搜索和过滤
  const [searchTerm, setSearchTerm] = useState("");
  
  // 编辑状态
  const [editingDocument, setEditingDocument] = useState<EditingDocument | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // 初始化数据
  useEffect(() => {
    loadI18nData();
  }, []);

  // 加载多语言数据
  const loadI18nData = async () => {
    try {
      setLoading(true);
      
      // 获取语言列表（使用与I18nConfig页面相同的方式）
      let languagesData: Language[] = [];
      try {
        const languageResponse = await i18nService.getLanguages();
        if (languageResponse && languageResponse.data && Array.isArray(languageResponse.data)) {
          languagesData = languageResponse.data;
        } else {
          throw new Error("Invalid language data format");
        }
      } catch (error) {
        console.warn("Failed to load languages from API, using mock data:", error);
        // 使用模拟数据作为后备
        languagesData = [
          { id: "1", name: "中文", code: "zh" },
          { id: "2", name: "English", code: "en" },
        ];
      }
      
      setLanguages(languagesData);
      if (languagesData.length > 0) {
        setSelectedLanguage(languagesData[0]); // 默认选择第一个语言
      }
      
      // 获取文档分类（树状结构）
      let categoriesData: DocumentCategory[] = [];
      try {
        const categoryResponse = await i18nService.getI18nCategories();
        if (categoryResponse && categoryResponse.data && Array.isArray(categoryResponse.data)) {
          // 转换为支持树状结构的类型
          categoriesData = categoryResponse.data.map(cat => ({
            ...cat,
            parentId: null // 实际数据中可能需要根据key的结构来确定parentId
          }));
        } else {
          throw new Error("Invalid category data format");
        }
      } catch (error) {
        console.warn("Failed to load categories from API, using mock data:", error);
        // 使用模拟数据作为后备
        categoriesData = [
          { id: "1", name: "用户指南", count: 5, parentId: null },
          { id: "2", name: "功能说明", count: 8, parentId: null },
          { id: "3", name: "开发者指南", count: 3, parentId: null },
          { id: "4", name: "快速入门", count: 2, parentId: "1" },
          { id: "5", name: "高级功能", count: 3, parentId: "1" },
        ];
      }
      
      setDocumentCategories(categoriesData);
      if (categoriesData.length > 0) {
        setSelectedCategory(categoriesData[0]); // 默认选择第一个分类
      }
      
      // 获取帮助文档
      let documentsData: HelpDocument[] = [];
      try {
        const documentsResponse = await i18nService.getHelpDocuments();
        if (documentsResponse && documentsResponse.data && Array.isArray(documentsResponse.data)) {
          documentsData = documentsResponse.data;
        } else {
          throw new Error("Invalid documents data format");
        }
      } catch (error) {
        console.warn("Failed to load documents from API, using mock data:", error);
        // 使用模拟数据作为后备
        documentsData = [
          { 
            id: "1", 
            title: "快速入门指南", 
            category: "用户指南",
            description: "了解如何快速开始使用AI营销平台",
            content: "<p>欢迎使用AI营销平台...</p>",
            lastUpdated: "2024-01-15",
            views: 1250,
            likes: 98,
            isPopular: true,
            translations: { 
              en: { 
                title: "Quick Start Guide", 
                description: "Learn how to quickly get started with the AI marketing platform",
                content: "<p>Welcome to the AI marketing platform...</p>"
              } 
            }
          },
          { 
            id: "2", 
            title: "用户画像功能详解", 
            category: "功能说明",
            description: "深入介绍用户画像功能的使用方法",
            content: "<p>用户画像功能是AI营销平台的核心功能之一...</p>",
            lastUpdated: "2024-01-12",
            views: 890,
            likes: 76,
            isPopular: true,
            translations: { 
              en: { 
                title: "User Profile Feature Details", 
                description: "In-depth introduction to the user profile feature",
                content: "<p>The user profile feature is one of the core features of the AI marketing platform...</p>"
              } 
            }
          },
        ];
      }
      
      setDocuments(documentsData);
      setFilteredDocuments(documentsData);
    } catch (error) {
      console.error("Failed to load i18n data:", error);
      toast({
        title: "加载失败",
        description: "无法加载多语言配置数据，请重试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // 过滤文档
  useEffect(() => {
    let result = documents;
    
    // 根据选中的分类过滤
    if (selectedCategory) {
      result = result.filter(doc => doc.category === selectedCategory.name);
    }
    
    // 根据搜索词过滤
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        doc =>
          doc.title.toLowerCase().includes(term) ||
          doc.description.toLowerCase().includes(term)
      );
    }
    
    setFilteredDocuments(result);
  }, [selectedCategory, searchTerm, documents]);

  // 处理文档编辑
  const handleEditDocument = (doc: HelpDocument) => {
    if (!selectedLanguage) return;
    
    // 获取当前语言的翻译内容
    const translation = doc.translations[selectedLanguage.code] || {
      title: "",
      description: "",
      content: ""
    };
    
    setEditingDocument({
      id: doc.id,
      title: translation.title,
      description: translation.description,
      content: translation.content
    });
    setIsEditDialogOpen(true);
  };

  // 处理保存文档编辑
  const handleSaveDocument = async () => {
    if (!editingDocument || !selectedLanguage) return;
    
    try {
      // 准备翻译数据
      const translationData = {
        title: editingDocument.title,
        description: editingDocument.description,
        content: editingDocument.content
      };
      
      // 调用API更新帮助文档的多语言内容
      const response = await i18nService.updateHelpDocumentTranslation(
        editingDocument.id, 
        selectedLanguage.code, 
        translationData
      );
      
      // 更新本地状态
      setDocuments(prev => 
        prev.map(doc => 
          doc.id === editingDocument.id ? { 
            ...doc, 
            translations: {
              ...doc.translations,
              [selectedLanguage.code]: translationData
            }
          } : doc
        )
      );
      
      setIsEditDialogOpen(false);
      setEditingDocument(null);
      
      toast({
        title: "保存成功",
        description: "文档翻译已更新",
      });
    } catch (error) {
      console.error("Failed to update document translation:", error);
      toast({
        title: "保存失败",
        description: "无法更新文档翻译，请重试",
        variant: "destructive",
      });
    }
  };

  // 处理分类展开/折叠
  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // 获取子分类
  const getChildCategories = (parentId: string | null) => {
    return documentCategories.filter(category => category.parentId === parentId);
  };

  // 渲染分类树
  const renderCategoryTree = (parentId: string | null = null, level = 0) => {
    const categories = getChildCategories(parentId);
    
    return categories.map(category => {
      const hasChildren = getChildCategories(category.id).length > 0;
      const isExpanded = expandedCategories.has(category.id);
      const isSelected = selectedCategory?.id === category.id;
      
      return (
        <div key={category.id}>
          <button
            className={`flex items-center gap-2 w-full text-left p-2 rounded-lg transition-colors ${
              isSelected 
                ? "bg-blue-100 text-blue-900 border border-blue-200" 
                : "hover:bg-gray-100"
            }`}
            style={{ paddingLeft: `${level * 16 + 8}px` }}
            onClick={() => setSelectedCategory(category)}
          >
            {hasChildren && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCategory(category.id);
                }}
                className="p-1 hover:bg-gray-200 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            )}
            <FileText className="h-4 w-4" />
            <div className="flex-1">
              <div className="font-medium">{category.name}</div>
              <div className="text-sm text-muted-foreground">
                {category.count} 个文档
              </div>
            </div>
          </button>
          
          {hasChildren && isExpanded && (
            <div>
              {renderCategoryTree(category.id, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 h-96 bg-gray-100 rounded"></div>
            <div className="lg:col-span-3 h-96 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">帮助文档多语言管理</h1>
          <p className="text-muted-foreground">管理帮助文档的多语言内容</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 左侧语言列表 */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                语言列表
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-220px)]">
                <div className="space-y-2">
                  {languages.map((language) => (
                    <button
                      key={language.id}
                      className={`flex items-center gap-2 w-full text-left p-3 rounded-lg transition-colors ${
                        selectedLanguage?.id === language.id
                          ? "bg-blue-100 text-blue-900 border border-blue-200"
                          : "hover:bg-gray-100"
                      }`}
                      onClick={() => setSelectedLanguage(language)}
                    >
                      <Globe className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{language.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {language.code}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* 中间文档分类导航 */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                文档分类
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-220px)]">
                <div className="space-y-1">
                  {renderCategoryTree(null)}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* 右侧文档列表和编辑区 */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <CardTitle>
                  {selectedCategory ? selectedCategory.name : "所有文档"}
                  {selectedLanguage && (
                    <span className="text-muted-foreground font-normal ml-2">
                      ({selectedLanguage.name})
                    </span>
                  )}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="搜索文档..."
                      className="pl-8 w-full md:w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>文档标题</TableHead>
                    <TableHead>描述</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((doc) => {
                    // 检查当前语言是否有翻译
                    const hasTranslation = selectedLanguage && 
                      doc.translations[selectedLanguage.code] && 
                      doc.translations[selectedLanguage.code].title;
                    
                    return (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">
                          {selectedLanguage && doc.translations[selectedLanguage.code]?.title 
                            ? doc.translations[selectedLanguage.code].title 
                            : doc.title}
                        </TableCell>
                        <TableCell>
                          {selectedLanguage && doc.translations[selectedLanguage.code]?.description 
                            ? doc.translations[selectedLanguage.code].description 
                            : doc.description}
                        </TableCell>
                        <TableCell>
                          <Badge variant={hasTranslation ? "default" : "secondary"}>
                            {hasTranslation ? "已翻译" : "未翻译"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditDocument(doc)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              
              {filteredDocuments.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>暂无匹配的文档</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 编辑对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>编辑文档翻译</DialogTitle>
            <DialogDescription>
              {selectedLanguage && `编辑${selectedLanguage.name}的文档内容`}
            </DialogDescription>
          </DialogHeader>
          {editingDocument && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">标题</Label>
                <Input
                  id="edit-title"
                  value={editingDocument.title}
                  onChange={(e) =>
                    setEditingDocument({ ...editingDocument, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">描述</Label>
                <Input
                  id="edit-description"
                  value={editingDocument.description}
                  onChange={(e) =>
                    setEditingDocument({ ...editingDocument, description: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-content">内容</Label>
                <Textarea
                  id="edit-content"
                  value={editingDocument.content}
                  onChange={(e) =>
                    setEditingDocument({ ...editingDocument, content: e.target.value })
                  }
                  rows={10}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              取消
            </Button>
            <Button onClick={handleSaveDocument}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HelpDocumentI18nManager;