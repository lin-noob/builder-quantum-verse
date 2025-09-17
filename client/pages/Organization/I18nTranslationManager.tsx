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
  Menu,
  FileText,
  Sparkles,
  Save,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

// 类型定义
interface Language {
  id: string;
  name: string;
  code: string;
}

interface MenuItem {
  id: string;
  name: string;
  key: string;
  parentId: string | null;
  children?: MenuItem[];
}

interface TranslationItem {
  id: string;
  key: string;
  zh: string;
  translations: Record<string, string>; // 语言代码到翻译的映射
}

interface EditingMenuItem {
  id: string;
  name: string;
}

const I18nTranslationManager: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  
  // 语言列表数据
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  
  // 菜单导航数据（树状结构）
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [expandedMenuItems, setExpandedMenuItems] = useState<Set<string>>(new Set());
  
  // 菜单编辑状态
  const [editingMenuItems, setEditingMenuItems] = useState<Record<string, string>>({});
  
  // 翻译文案数据
  const [translations, setTranslations] = useState<TranslationItem[]>([]);
  const [filteredTranslations, setFilteredTranslations] = useState<TranslationItem[]>([]);
  
  // 搜索和过滤
  const [searchTerm, setSearchTerm] = useState("");
  
  // 编辑状态
  const [editingItem, setEditingItem] = useState<TranslationItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // 新增语言状态
  const [isAddLanguageDialogOpen, setIsAddLanguageDialogOpen] = useState(false);
  const [newLanguage, setNewLanguage] = useState<Omit<Language, "id">>({
    name: "",
    code: ""
  });

  // 初始化数据
  useEffect(() => {
    loadI18nData();
  }, []);

  // 加载多语言数据
  const loadI18nData = async () => {
    try {
      setLoading(true);
      
      // 模拟获取语言列表
      const mockLanguages: Language[] = [
        { id: "1", name: "中文", code: "zh" },
        { id: "2", name: "English", code: "en" },
      ];
      setLanguages(mockLanguages);
      if (mockLanguages.length > 0) {
        setSelectedLanguage(mockLanguages[1]); // 默认选择英文
      }
      
      // 模拟获取菜单项（树状结构）
      const mockMenuItems: MenuItem[] = [
        { id: "1", name: "导航菜单", key: "nav", parentId: null },
        { id: "2", name: "首页横幅", key: "hero", parentId: null },
        { id: "3", name: "功能特性", key: "features", parentId: null },
        { id: "4", name: "平台名称", key: "nav.platformName", parentId: "1" },
        { id: "5", name: "产品特色", key: "nav.productFeatures", parentId: "1" },
        { id: "6", name: "解决方案", key: "nav.solutions", parentId: "1" },
        { id: "7", name: "AI营销标题", key: "hero.aiMarketingTitle", parentId: "2" },
        { id: "8", name: "AI营销描述", key: "hero.aiMarketingDescription", parentId: "2" },
      ];
      setMenuItems(mockMenuItems);
      if (mockMenuItems.length > 0) {
        setSelectedMenuItem(mockMenuItems[0]); // 默认选择第一个菜单项
      }
      
      // 模拟获取翻译文案
      const mockTranslations: TranslationItem[] = [
        { 
          id: "1", 
          key: "nav.platformName", 
          zh: "AI营销平台", 
          translations: { en: "AI Marketing Platform" } 
        },
        { 
          id: "2", 
          key: "nav.productFeatures", 
          zh: "产品特色", 
          translations: { en: "Product Features" } 
        },
        { 
          id: "3", 
          key: "nav.solutions", 
          zh: "解决方案", 
          translations: { en: "Solutions" } 
        },
        { 
          id: "4", 
          key: "hero.aiMarketingTitle", 
          zh: "AI驱动的未来营销", 
          translations: { en: "AI-Driven Future Marketing" } 
        },
        { 
          id: "5", 
          key: "hero.aiMarketingDescription", 
          zh: "通过前沿人工智能技术，实现精准用户洞察、自动化营销执行和数据驱动决策，帮助企业实现营销效果的指数级提升", 
          translations: { en: "Through cutting-edge artificial intelligence technology, achieve precise user insights, automated marketing execution and data-driven decisions to help enterprises realize exponential marketing performance improvement" } 
        },
      ];
      setTranslations(mockTranslations);
      setFilteredTranslations(mockTranslations);
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

  // 过滤翻译项
  useEffect(() => {
    let result = translations;
    
    // 根据选中的菜单项过滤
    if (selectedMenuItem) {
      result = result.filter(item => item.key.startsWith(selectedMenuItem.key));
    }
    
    // 根据搜索词过滤
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        item =>
          item.key.toLowerCase().includes(term) ||
          item.zh.toLowerCase().includes(term) ||
          (selectedLanguage && item.translations[selectedLanguage.code]?.toLowerCase().includes(term))
      );
    }
    
    setFilteredTranslations(result);
  }, [selectedMenuItem, searchTerm, translations, selectedLanguage]);

  // 处理菜单项展开/折叠
  const toggleMenuItem = (id: string) => {
    setExpandedMenuItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // 处理菜单项选择
  const handleSelectMenuItem = (item: MenuItem) => {
    setSelectedMenuItem(item);
  };

  // 处理语言选择
  const handleSelectLanguage = (language: Language) => {
    setSelectedLanguage(language);
  };

  // 处理编辑
  const handleEdit = (item: TranslationItem) => {
    setEditingItem(item);
    setIsEditDialogOpen(true);
  };

  // 处理保存编辑
  const handleSaveEdit = async () => {
    if (!editingItem || !selectedLanguage) return;
    
    try {
      // 更新本地状态
      setTranslations(prev =>
        prev.map(item => (item.id === editingItem.id ? editingItem : item))
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
    }
  };

  // 处理删除语言
  const handleDeleteLanguage = async (id: string) => {
    try {
      // 更新本地状态
      setLanguages(prev => prev.filter(lang => lang.id !== id));
      
      toast({
        title: "删除成功",
        description: "语言已删除",
      });
    } catch (error) {
      console.error("Failed to delete language:", error);
      toast({
        title: "删除失败",
        description: "无法删除语言，请重试",
        variant: "destructive",
      });
    }
  };

  // 处理新增语言
  const handleAddLanguage = async () => {
    if (!newLanguage.name || !newLanguage.code) {
      toast({
        title: "验证失败",
        description: "请填写所有必填字段",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // 创建新语言对象
      const language: Language = {
        id: Date.now().toString(),
        ...newLanguage
      };
      
      // 更新本地状态
      setLanguages(prev => [...prev, language]);
      setIsAddLanguageDialogOpen(false);
      setNewLanguage({ name: "", code: "" });
      
      toast({
        title: "添加成功",
        description: "新的语言已添加",
      });
    } catch (error) {
      console.error("Failed to add language:", error);
      toast({
        title: "添加失败",
        description: "无法添加语言，请重试",
        variant: "destructive",
      });
    }
  };

  // 处理一键翻译
  const handleAutoTranslate = async (item: TranslationItem) => {
    if (!selectedLanguage) return;
    
    try {
      // 模拟自动翻译过程
      toast({
        title: "翻译中",
        description: "正在自动翻译...",
      });
      
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 更新翻译内容（模拟翻译结果）
      const updatedItem = {
        ...item,
        translations: {
          ...item.translations,
          [selectedLanguage.code]: `[自动翻译] ${item.zh}`
        }
      };
      
      // 更新本地状态
      setTranslations(prev =>
        prev.map(i => (i.id === item.id ? updatedItem : i))
      );
      
      toast({
        title: "翻译成功",
        description: "文案已自动翻译",
      });
    } catch (error) {
      console.error("Failed to auto translate:", error);
      toast({
        title: "翻译失败",
        description: "自动翻译失败，请手动翻译",
        variant: "destructive",
      });
    }
  };

  // 处理批量一键翻译
  const handleBatchAutoTranslate = async () => {
    if (!selectedLanguage) return;
    
    try {
      // 模拟自动翻译过程
      toast({
        title: "批量翻译中",
        description: `正在自动翻译${filteredTranslations.length}个文案...`,
      });
      
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 更新所有翻译内容（模拟翻译结果）
      const updatedTranslations = translations.map(item => {
        // 只更新当前过滤后的项
        if (filteredTranslations.some(filtered => filtered.id === item.id)) {
          return {
            ...item,
            translations: {
              ...item.translations,
              [selectedLanguage.code]: `[自动翻译] ${item.zh}`
            }
          };
        }
        return item;
      });
      
      // 更新本地状态
      setTranslations(updatedTranslations);
      
      toast({
        title: "批量翻译成功",
        description: `已自动翻译${filteredTranslations.length}个文案`,
      });
    } catch (error) {
      console.error("Failed to batch auto translate:", error);
      toast({
        title: "批量翻译失败",
        description: "批量自动翻译失败，请手动翻译",
        variant: "destructive",
      });
    }
  };

  // 处理菜单项名称变更
  const handleMenuItemNameChange = (id: string, newName: string) => {
    setEditingMenuItems(prev => ({
      ...prev,
      [id]: newName
    }));
  };

  // 保存菜单项名称变更
  const saveMenuItemName = (id: string) => {
    const newName = editingMenuItems[id];
    if (newName && newName !== menuItems.find(item => item.id === id)?.name) {
      // 更新菜单项名称
      setMenuItems(prev => 
        prev.map(item => 
          item.id === id ? { ...item, name: newName } : item
        )
      );
      
      // 显示成功提示
      toast({
        title: "保存成功",
        description: "菜单项名称已更新",
      });
    }
    
    // 清除编辑状态
    setEditingMenuItems(prev => {
      const newEditing = { ...prev };
      delete newEditing[id];
      return newEditing;
    });
  };

  // 取消菜单项编辑
  const cancelMenuItemEdit = (id: string) => {
    setEditingMenuItems(prev => {
      const newEditing = { ...prev };
      delete newEditing[id];
      return newEditing;
    });
  };

  // 获取子菜单项
  const getChildMenuItems = (parentId: string | null) => {
    return menuItems.filter(item => item.parentId === parentId);
  };

  // 渲染菜单树
  const renderMenuTree = (parentId: string | null = null, level = 0) => {
    const items = getChildMenuItems(parentId);
    
    return items.map(item => {
      const hasChildren = getChildMenuItems(item.id).length > 0;
      const isExpanded = expandedMenuItems.has(item.id);
      const isSelected = selectedMenuItem?.id === item.id;
      const isEditing = editingMenuItems.hasOwnProperty(item.id);
      const editingName = editingMenuItems[item.id] || item.name;
      
      return (
        <div key={item.id}>
          <div
            className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
              isSelected 
                ? "bg-blue-100 text-blue-900 border border-blue-200" 
                : "hover:bg-gray-100"
            }`}
            style={{ paddingLeft: `${level * 16 + 8}px` }}
            onClick={() => handleSelectMenuItem(item)}
            onDoubleClick={() => handleMenuItemNameChange(item.id, item.name)}
          >
            {hasChildren && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMenuItem(item.id);
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
            {isEditing ? (
              <div className="flex items-center gap-1 flex-1">
                <Input
                  value={editingName}
                  onChange={(e) => handleMenuItemNameChange(item.id, e.target.value)}
                  onBlur={() => saveMenuItemName(item.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      saveMenuItemName(item.id);
                    } else if (e.key === 'Escape') {
                      cancelMenuItemEdit(item.id);
                    }
                  }}
                  autoFocus
                  className="h-6 text-sm"
                />
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={(e) => {
                    e.stopPropagation();
                    saveMenuItemName(item.id);
                  }}
                  className="h-6 w-6 p-0"
                >
                  <Save className="h-3 w-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={(e) => {
                    e.stopPropagation();
                    cancelMenuItemEdit(item.id);
                  }}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <span className="text-sm">{item.name}</span>
            )}
          </div>
          
          {hasChildren && isExpanded && (
            <div>
              {renderMenuTree(item.id, level + 1)}
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-3 h-96 bg-gray-100 rounded"></div>
            <div className="lg:col-span-3 h-96 bg-gray-100 rounded"></div>
            <div className="lg:col-span-6 h-96 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 第一列：语言列表 */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>语言列表</CardTitle>
                <Dialog open={isAddLanguageDialogOpen} onOpenChange={setIsAddLanguageDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>新增语言</DialogTitle>
                      <DialogDescription>
                        添加新的语言支持
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="language-name">语言名称</Label>
                        <Input
                          id="language-name"
                          value={newLanguage.name}
                          onChange={(e) =>
                            setNewLanguage({ ...newLanguage, name: e.target.value })
                          }
                          placeholder="例如: English"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="language-code">语言代码</Label>
                        <Input
                          id="language-code"
                          value={newLanguage.code}
                          onChange={(e) =>
                            setNewLanguage({ ...newLanguage, code: e.target.value })
                          }
                          placeholder="例如: en"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsAddLanguageDialogOpen(false)}
                      >
                        取消
                      </Button>
                      <Button onClick={handleAddLanguage}>添加</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-220px)]">
                <div className="space-y-2">
                  {languages.map((language) => (
                    <div
                      key={language.id}
                      className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                        selectedLanguage?.id === language.id
                          ? "bg-blue-100 text-blue-900 border border-blue-200"
                          : "hover:bg-gray-100"
                      }`}
                      onClick={() => handleSelectLanguage(language)}
                    >
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{language.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {language.code}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteLanguage(language.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* 第二列：菜单导航栏 */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>菜单导航</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-220px)]">
                <div className="space-y-1">
                  {renderMenuTree(null)}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* 第三列：文案列表 */}
        <div className="lg:col-span-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <CardTitle>
                  {selectedMenuItem ? selectedMenuItem.name : "翻译文案"}
                  {selectedLanguage && (
                    <span className="text-muted-foreground text-sm font-normal ml-2">
                      ({selectedLanguage.name})
                    </span>
                  )}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleBatchAutoTranslate}
                    disabled={filteredTranslations.length === 0 || !selectedLanguage}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    批量翻译
                  </Button>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="搜索文案..."
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
                    <TableHead className="w-1/3">Key</TableHead>
                    <TableHead className="w-1/3">中文文案</TableHead>
                    <TableHead className="w-1/3">翻译文案</TableHead>
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
                      <TableCell>
                        {selectedLanguage ? item.translations[selectedLanguage.code] || "-" : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAutoTranslate(item)}
                          >
                            <Sparkles className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit className="h-4 w-4" />
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
          {editingItem && selectedLanguage && (
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
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-translation">
                  {selectedLanguage.name} ({selectedLanguage.code})
                </Label>
                <Textarea
                  id="edit-translation"
                  value={editingItem.translations[selectedLanguage.code] || ""}
                  onChange={(e) => {
                    setEditingItem({
                      ...editingItem,
                      translations: {
                        ...editingItem.translations,
                        [selectedLanguage.code]: e.target.value
                      }
                    });
                  }}
                  rows={3}
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
            <Button 
              onClick={handleSaveEdit}
            >
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default I18nTranslationManager;