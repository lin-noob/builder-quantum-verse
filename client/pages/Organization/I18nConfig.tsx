import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Upload,
  Download,
  Search,
  Save,
  X,
  ChevronDown,
  ChevronRight,
  FileText,
} from "lucide-react";
import * as i18nService from "@/services/i18nService";

// 扩展菜单分类类型定义以支持树状结构
interface MenuCategory extends i18nService.MenuCategory {
  parentId: string | null;
}

// 使用原始类型定义
type TranslationItem = i18nService.TranslationItem;

const I18nConfig: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // 菜单分类数据
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set()); // 添加展开状态
  
  // 翻译文案数据
  const [translations, setTranslations] = useState<TranslationItem[]>([]);
  const [filteredTranslations, setFilteredTranslations] = useState<TranslationItem[]>([]);
  
  // 搜索和过滤
  const [searchTerm, setSearchTerm] = useState("");
  
  // 编辑状态
  const [editingItem, setEditingItem] = useState<TranslationItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // 新增状态
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState<Omit<TranslationItem, "id">>({
    key: "",
    zh: "",
    en: ""
  });

  // 初始化数据
  useEffect(() => {
    loadI18nData();
  }, []);

  // 加载多语言数据
  const loadI18nData = async () => {
    try {
      setLoading(true);
      
      // 获取菜单分类
      const categoryResponse = await i18nService.getI18nCategories();
      // 转换为支持树状结构的类型
      const categories: MenuCategory[] = categoryResponse.data.map(cat => ({
        ...cat,
        parentId: null // 默认没有父级，实际数据中可能需要根据key的结构来确定parentId
      })) || [];
      setMenuCategories(categories);
      
      // 获取翻译文案
      const translationResponse = await i18nService.getI18nTranslations();
      const translationsData = translationResponse.data || [];
      setTranslations(translationsData);
      setFilteredTranslations(translationsData);
      
      // 默认选中第一个分类
      if (categories.length > 0) {
        setSelectedCategory(categories[0].id);
      }
    } catch (error) {
      console.error("Failed to load i18n data:", error);
      toast({
        title: "加载失败",
        description: "无法加载多语言配置数据，请重试",
        variant: "destructive",
      });
      
      // 使用模拟数据作为后备
      const mockCategories: MenuCategory[] = [
        { id: "nav", name: "导航菜单", count: 15, parentId: null },
        { id: "hero", name: "首页横幅", count: 20, parentId: null },
        { id: "features", name: "功能特性", count: 35, parentId: null },
        { id: "stats", name: "统计数据", count: 12, parentId: null },
        { id: "footer", name: "页脚信息", count: 8, parentId: null },
        { id: "nav.platformName", name: "平台名称", count: 1, parentId: "nav" },
        { id: "nav.productFeatures", name: "产品特色", count: 1, parentId: "nav" },
        { id: "nav.solutions", name: "解决方案", count: 1, parentId: "nav" },
      ];
      
      const mockTranslations: TranslationItem[] = [
        { id: "1", key: "nav.platformName", zh: "AI营销平台", en: "AI Marketing Platform" },
        { id: "2", key: "nav.productFeatures", zh: "产品特色", en: "Product Features" },
        { id: "3", key: "nav.solutions", zh: "解决方案", en: "Solutions" },
        { id: "4", key: "hero.aiMarketingTitle", zh: "AI驱动的未来营销", en: "AI-Driven Future Marketing" },
        { id: "5", key: "hero.aiMarketingDescription", zh: "通过前沿人工智能技术，实现精准用户洞察、自动化营销执行和数据驱动决策，帮助企业实现营销效果的指数级提升", en: "Through cutting-edge artificial intelligence technology, achieve precise user insights, automated marketing execution and data-driven decisions to help enterprises realize exponential marketing performance improvement" },
      ];
      
      setMenuCategories(mockCategories);
      setTranslations(mockTranslations);
      setFilteredTranslations(mockTranslations);
      setSelectedCategory("nav");
    } finally {
      setLoading(false);
    }
  };

  // 过滤翻译项
  useEffect(() => {
    let result = translations;
    
    // 根据选中的分类过滤
    if (selectedCategory) {
      result = result.filter(item => item.key.startsWith(selectedCategory + "."));
    }
    
    // 根据搜索词过滤
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        item =>
          item.key.toLowerCase().includes(term) ||
          item.zh.toLowerCase().includes(term) ||
          item.en.toLowerCase().includes(term)
      );
    }
    
    setFilteredTranslations(result);
  }, [selectedCategory, searchTerm, translations]);

  // 处理编辑
  const handleEdit = (item: TranslationItem) => {
    setEditingItem(item);
    setIsEditDialogOpen(true);
  };

  // 处理保存编辑
  const handleSaveEdit = async () => {
    if (!editingItem) return;
    
    try {
      setSaving(true);
      
      // 调用API更新翻译
      const response = await i18nService.updateI18nTranslation(editingItem);
      
      // 更新本地状态
      setTranslations(prev =>
        prev.map(item => (item.id === editingItem.id ? response.data : item))
      );
      
      setIsEditDialogOpen(false);
      setEditingItem(null);
      
      toast({
        title: "保存成功",
        description: "翻译文案已更新",
      });
    } catch (error) {
      console.error("Failed to update translation:", error);
      toast({
        title: "保存失败",
        description: "无法更新翻译文案，请重试",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // 处理删除
  const handleDelete = async (id: string) => {
    try {
      // 调用API删除翻译
      await i18nService.deleteI18nTranslation(id);
      
      // 更新本地状态
      setTranslations(prev => prev.filter(item => item.id !== id));
      
      toast({
        title: "删除成功",
        description: "翻译文案已删除",
      });
    } catch (error) {
      console.error("Failed to delete translation:", error);
      toast({
        title: "删除失败",
        description: "无法删除翻译文案，请重试",
        variant: "destructive",
      });
    }
  };

  // 处理新增
  const handleAdd = async () => {
    if (!newItem.key || !newItem.zh || !newItem.en) {
      toast({
        title: "验证失败",
        description: "请填写所有必填字段",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // 调用API新增翻译
      const response = await i18nService.createI18nTranslation(newItem);
      
      // 更新本地状态
      setTranslations(prev => [...prev, response.data]);
      setIsAddDialogOpen(false);
      setNewItem({ key: "", zh: "", en: "" });
      
      toast({
        title: "添加成功",
        description: "新的翻译文案已添加",
      });
    } catch (error) {
      console.error("Failed to add translation:", error);
      toast({
        title: "添加失败",
        description: "无法添加翻译文案，请重试",
        variant: "destructive",
      });
    }
  };

  // 处理导入
  const handleImport = async () => {
    try {
      // 创建文件输入元素
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json";
      
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        
        try {
          // 调用API导入翻译
          await i18nService.importI18nTranslations(file);
          
          toast({
            title: "导入成功",
            description: "翻译文件已成功导入",
          });
          
          // 重新加载数据
          loadI18nData();
        } catch (error) {
          console.error("Failed to import translations:", error);
          toast({
            title: "导入失败",
            description: "无法导入翻译文件，请重试",
            variant: "destructive",
          });
        }
      };
      
      input.click();
    } catch (error) {
      console.error("Failed to import translations:", error);
      toast({
        title: "导入失败",
        description: "无法导入翻译文件，请重试",
        variant: "destructive",
      });
    }
  };

  // 处理导出
  const handleExport = async () => {
    try {
      // 调用API导出翻译
      const blob = await i18nService.exportI18nTranslations();
      
      // 创建下载链接
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "translations.json");
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast({
        title: "导出成功",
        description: "翻译文件已开始下载",
      });
    } catch (error) {
      console.error("Failed to export translations:", error);
      toast({
        title: "导出失败",
        description: "无法导出翻译文件，请重试",
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
    return menuCategories.filter(category => category.parentId === parentId);
  };

  // 渲染分类树
  const renderCategoryTree = (parentId: string | null = null, level = 0) => {
    const categories = getChildCategories(parentId);
    
    return categories.map(category => {
      const hasChildren = getChildCategories(category.id).length > 0;
      const isExpanded = expandedCategories.has(category.id);
      const isSelected = selectedCategory === category.id;
      
      return (
        <div key={category.id}>
          <button
            className={`flex items-center gap-2 w-full text-left p-2 rounded-lg transition-colors ${
              isSelected 
                ? "bg-blue-100 text-blue-900 border border-blue-200" 
                : "hover:bg-gray-100"
            }`}
            style={{ paddingLeft: `${level * 16 + 8}px` }}
            onClick={() => setSelectedCategory(category.id)}
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
                {category.count} 项文案
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
      <div className="flex justify-end gap-2">
        <Button onClick={handleImport} variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          导入
        </Button>
        <Button onClick={handleExport} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          导出
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 左侧菜单分类列表 */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>菜单分类</CardTitle>
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

        {/* 右侧翻译文案列表 */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <CardTitle>
                  {menuCategories.find(c => c.id === selectedCategory)?.name || "翻译文案"}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="搜索文案..."
                      className="pl-8 w-full md:w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        新增文案
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>新增翻译文案</DialogTitle>
                        <DialogDescription>
                          添加新的多语言翻译文案
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="key">Key</Label>
                          <Input
                            id="key"
                            value={newItem.key}
                            onChange={(e) =>
                              setNewItem({ ...newItem, key: e.target.value })
                            }
                            placeholder="例如: nav.home"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="zh">中文</Label>
                          <Input
                            id="zh"
                            value={newItem.zh}
                            onChange={(e) =>
                              setNewItem({ ...newItem, zh: e.target.value })
                            }
                            placeholder="中文翻译"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="en">英文</Label>
                          <Input
                            id="en"
                            value={newItem.en}
                            onChange={(e) =>
                              setNewItem({ ...newItem, en: e.target.value })
                            }
                            placeholder="English translation"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsAddDialogOpen(false)}
                        >
                          取消
                        </Button>
                        <Button onClick={handleAdd}>添加</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/2">Key</TableHead>
                    <TableHead className="w-1/2">中文文案</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTranslations.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm">
                        {item.key}
                      </TableCell>
                      <TableCell>{item.zh}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredTranslations.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>暂无匹配的翻译文案</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 编辑对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑翻译文案</DialogTitle>
            <DialogDescription>
              修改多语言翻译文案
            </DialogDescription>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-key">Key</Label>
                <Input
                  id="edit-key"
                  value={editingItem.key}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, key: e.target.value })
                  }
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-zh">中文</Label>
                <Textarea
                  id="edit-zh"
                  value={editingItem.zh}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, zh: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-en">英文</Label>
                <Textarea
                  id="edit-en"
                  value={editingItem.en}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, en: e.target.value })
                  }
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={saving}
            >
              取消
            </Button>
            <Button 
              onClick={handleSaveEdit} 
              disabled={saving}
            >
              {saving ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default I18nConfig;