import React, { useState, useEffect, useRef } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Globe,
  Menu,
  FileText,
  Sparkles,
  Languages,
  Save,
  X,
  ChevronDown,
  ChevronRight,
  Edit3,
  PlusCircle,
} from "lucide-react";
import { Tree } from "antd";
import type { TreeDataNode } from "antd";
import "./I18nTranslationManager.css"; // 添加CSS导入
import { request } from "@/lib/request";
import {
  langCodeOptions,
  TranslationItem,
  translateText,
  updateMenuItemName,
  getMenuTranslations,
  translateTableItems,
  saveTranslationDetail,
} from "@/services/i18nService";

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
  component?: string; // 添加component字段
  children?: MenuItem[];
}

interface SelectedMenuItem {
  id: string;
  name?: string;
}

interface EditingMenuItem {
  id: string;
  name: string;
}

// 新增类型定义
interface LanguageApiResponse {
  id: string;
  name: string;
  data: any;
  code: string;
}

interface MenuTreeDataNode extends TreeDataNode {
  id: string;
  name: string;
  children?: MenuTreeDataNode[];
}

const I18nTranslationManager: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  // 语言列表数据
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(
    null,
  );

  // 菜单导航数据（树状结构）
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedMenuItem, setSelectedMenuItem] =
    useState<SelectedMenuItem | null>(null);
  const [expandedMenuItems, setExpandedMenuItems] = useState<Set<string>>(
    new Set(),
  );
  const [menuTreeData, setMenuTreeData] = useState<MenuTreeDataNode[]>([]); // 添加菜单树数据状态

  // 菜单编辑状态
  const [isEditMenuDialogOpen, setIsEditMenuDialogOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // 请求取消控制器
  const abortControllerRef = useRef<AbortController | null>(null);

  // 翻译文案数据
  const [translations, setTranslations] = useState<TranslationItem[]>([]);
  const [filteredTranslations, setFilteredTranslations] = useState<
    TranslationItem[]
  >([]);

  // 表格选中状态
  const [selectedTranslationIds, setSelectedTranslationIds] = useState<
    Set<string>
  >(new Set());

  // 搜索和过滤
  const [searchTerm, setSearchTerm] = useState("");

  // 编辑状态
  const [editingItem, setEditingItem] = useState<TranslationItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isEditLanguageDialogOpen, setIsEditLanguageDialogOpen] =
    useState(false);
  const [editingLanguage, setEditingLanguage] = useState<Language | null>(null);

  // 新增语言状态
  const [isAddLanguageDialogOpen, setIsAddLanguageDialogOpen] = useState(false);
  const [newLanguage, setNewLanguage] = useState<Omit<Language, "id">>({
    name: "",
    code: "",
  });

  // 初始化数据
  useEffect(() => {
    loadI18nData();

    // 组件卸载时取消请求
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // 当选中的语言变化时，获取对应的菜单树数据
  useEffect(() => {
    if (selectedLanguage) {
      fetchMenuTreeByLanguage(selectedLanguage.id);
    }
  }, [selectedLanguage]);

  // 加载多语言数据
  const loadI18nData = async () => {
    try {
      setLoading(true);

      // 获取语言列表
      const languageResponse = await request.get(
        "/admin/api/v1/auth/language",
      );
      const languageData: Language[] = languageResponse.data.data || [];
      setLanguages(languageData);
      if (languageData.length > 0) {
        setSelectedLanguage(languageData[0]); // 默认选择第一个语言
      }

      // 初始化时不加载翻译文案，等用户选择菜单项后再加载
      setTranslations([]);
      setFilteredTranslations([]);
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

    // 根据搜索词过滤
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.keyCode.toLowerCase().includes(term) ||
          item.name.toLowerCase().includes(term) ||
          (item.transform && item.transform.toLowerCase().includes(term)),
      );
    }

    setFilteredTranslations(result);
  }, [searchTerm, translations]);

  // 处理菜单项展开/折叠
  const toggleMenuItem = (id: string) => {
    setExpandedMenuItems((prev) => {
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
  const handleSelectMenuItem = async (id: string, name?: string) => {
    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 创建新的 AbortController
    const newController = new AbortController();
    abortControllerRef.current = newController;

    setSelectedMenuItem({ id, name });

    // 获取选中菜单的翻译文案
    if (selectedLanguage && id) {
      try {
        const response = await getMenuTranslations(
          selectedLanguage.id,
          id,
          newController.signal,
        );

        // 检查请求是否被取消
        if (newController.signal.aborted) {
          return;
        }

        const menuTranslations = response.data || [];
        setTranslations(menuTranslations);
        setFilteredTranslations(menuTranslations);
        // 清空选中状态
        setSelectedTranslationIds(new Set());
      } catch (error: any) {
        // 如果是取消的请求，不显示错误
        if (error.name === "AbortError" || newController.signal.aborted) {
          return;
        }

        console.error("Failed to fetch menu translations:", error);
        toast({
          title: "加载失败",
          description: "无法加载菜单翻译数据，请重试",
          variant: "destructive",
        });
        // 如果失败，清空翻译列表
        setTranslations([]);
        setFilteredTranslations([]);
      } finally {
        // 清理 AbortController
        if (abortControllerRef.current === newController) {
          abortControllerRef.current = null;
        }
      }
    }
  };

  // 处理单个复选框选择
  const handleTranslationSelect = (id: string, checked: boolean) => {
    setSelectedTranslationIds((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  };

  // 处理全选复选框
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTranslationIds(
        new Set(filteredTranslations.map((item) => item.id)),
      );
    } else {
      setSelectedTranslationIds(new Set());
    }
  };

  // 检查是否全选
  const isAllSelected =
    filteredTranslations.length > 0 &&
    filteredTranslations.every((item) => selectedTranslationIds.has(item.id));

  // 检查是否部分选择
  const isIndeterminate = selectedTranslationIds.size > 0 && !isAllSelected;

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
    if (!editingItem || !selectedLanguage || !selectedMenuItem) return;

    try {
      // 调用新的保存接口
      await saveTranslationDetail(
        editingItem.id,
        editingItem.keyCode,
        selectedLanguage.id,
        selectedMenuItem.id,
        editingItem.name,
        editingItem.transform || "",
      );

      setIsEditDialogOpen(false);
      setEditingItem(null);

      toast({
        title: "保存成功",
        description: "翻译文案已更新",
      });

      // 重新获取翻译数据
      const response = await getMenuTranslations(
        selectedLanguage.id,
        selectedMenuItem.id,
      );
      const menuTranslations = response.data || [];
      setTranslations(menuTranslations);
      setFilteredTranslations(menuTranslations);
    } catch (error) {
      console.error("Failed to update translation:", error);
      toast({
        title: "保存失败",
        description: "无法更新翻译文案，请重试",
        variant: "destructive",
      });
    }
  };

  // 处理保存编辑语言
  const handleSaveEditLanguage = async () => {
    if (!editingLanguage || !editingLanguage.name || !editingLanguage.code) {
      toast({
        title: "验证失败",
        description: "请填写所有必填字段",
        variant: "destructive",
      });
      return;
    }

    try {
      // 调用API编辑语言
      await request.put("/admin/api/v1/language", editingLanguage);

      // 更新本地状态
      setLanguages((prev) =>
        prev.map((lang) =>
          lang.id === editingLanguage.id ? editingLanguage : lang,
        ),
      );

      // 如果编辑的是当前选中的语言，更新选中状态
      if (selectedLanguage && selectedLanguage.id === editingLanguage.id) {
        setSelectedLanguage(editingLanguage);
      }

      setIsEditLanguageDialogOpen(false);
      setEditingLanguage(null);

      toast({
        title: "保存成功",
        description: "语言信息已更新",
      });
    } catch (error) {
      console.error("Failed to update language:", error);
      toast({
        title: "保存失败",
        description: "无法更新语言信息，请重试",
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
      // 调用API新增语言
      const response = await request.post(
        "/admin/api/v1/language",
        newLanguage,
      );

      // 更新本地状态
      const language: Language = {
        id: response.data.data.id,
        ...newLanguage,
      };
      setLanguages((prev) => [...prev, language]);
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

  // 处理单个翻译文案的翻译
  const handleAutoTranslate = async (item: TranslationItem) => {
    if (!selectedLanguage || !selectedMenuItem) return;

    try {
      toast({
        title: "翻译中",
        description: "正在自动翻译...",
      });

      await translateTableItems(
        selectedLanguage.id,
        selectedMenuItem.id,
        [item.id],
        2,
      );

      toast({
        title: "翻译成功",
        description: "文案已自动翻译",
      });

      // 重新获取翻译数据
      const response = await getMenuTranslations(
        selectedLanguage.id,
        selectedMenuItem.id,
      );
      const menuTranslations = response.data || [];
      setTranslations(menuTranslations);
      setFilteredTranslations(menuTranslations);
    } catch (error) {
      console.error("Failed to auto translate:", error);
      toast({
        title: "翻译失败",
        description: "自动翻译失败，请手动翻译",
        variant: "destructive",
      });
    }
  };

  // 处理批量翻译文案的翻译
  const handleBatchAutoTranslate = async () => {
    if (!selectedLanguage || !selectedMenuItem) return;

    const selectedIds = Array.from(selectedTranslationIds);
    if (selectedIds.length === 0) {
      toast({
        title: "请选择要翻译的项目",
        description: "请先勾选需要翻译的文案项",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "批量翻译中",
        description: `正在自动翻译${selectedIds.length}个文案...`,
      });

      await translateTableItems(
        selectedLanguage.id,
        selectedMenuItem.id,
        selectedIds,
        2,
      );

      toast({
        title: "批量翻译成功",
        description: `已自动翻译${selectedIds.length}个文案`,
      });

      // 重新获取翻译数据
      const response = await getMenuTranslations(
        selectedLanguage.id,
        selectedMenuItem.id,
      );
      const menuTranslations = response.data || [];
      setTranslations(menuTranslations);
      setFilteredTranslations(menuTranslations);

      // 清空选中状态
      setSelectedTranslationIds(new Set());
    } catch (error) {
      console.error("Failed to batch auto translate:", error);
      toast({
        title: "批量翻译失败",
        description: "批量自动翻译失败，请手动翻译",
        variant: "destructive",
      });
    }
  };

  // 根据语言ID获取菜单树数据
  const fetchMenuTreeByLanguage = async (languageId: string) => {
    try {
      const response = await request.get(
        `/admin/api/v1/language/${languageId}`,
      );
      const menuData = response.data.data || [];
      setMenuItems(menuData);

      // 转换菜单数据为Tree组件所需格式
      const treeData = convertToTreeData(menuData);
      setMenuTreeData(treeData);

      // 找到第一个有component值的菜单项并选中
      const findFirstSelectableItem = (items: any[]): any => {
        for (const item of items) {
          if (item.component) {
            return item;
          }
          if (item.children) {
            const childItem = findFirstSelectableItem(item.children);
            if (childItem) return childItem;
          }
        }
        return null;
      };

      const firstSelectableItem = findFirstSelectableItem(menuData);
      if (firstSelectableItem) {
        await handleSelectMenuItem(
          firstSelectableItem.id,
          firstSelectableItem.name,
        );
      } else {
        // 如果没有可选择的菜单项，清空翻译数据
        setSelectedMenuItem(null);
        setTranslations([]);
        setFilteredTranslations([]);
      }
    } catch (error) {
      console.error("Failed to fetch menu tree data:", error);
      toast({
        title: "加载失败",
        description: "无法加载菜单数据，请重试",
        variant: "destructive",
      });
    }
  };

  // 将菜单数据转换为 Ant Design Tree 需要的格式
  const convertToTreeData = (menuData: any[]): MenuTreeDataNode[] => {
    return menuData.map((item) => {
      const children = item.children
        ? convertToTreeData(item.children)
        : undefined;
      const hasComponent = !!item.component;

      return {
        key: item.id,
        id: item.id,
        name: item.name,
        selectable: hasComponent, // 只有有component的节点可以选中
        title: (
          <div className="flex items-center justify-between w-full group">
            <span>{item.name}</span>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                handleMenuItemEditDialog(item.id, item.name);
              }}
            >
              <Edit3 className="h-3 w-3" />
            </Button>
          </div>
        ),
        children,
      };
    });
  };

  // 处理删除语言
  const handleDeleteLanguage = async (languageId: string) => {
    const language = languages.find((lang) => lang.id === languageId);
    if (!language) return;

    // 显示确认对话框
    const confirmed = window.confirm(
      `确定要删除语言 "${language.name}" 吗？删除后将无法恢复。`,
    );
    if (!confirmed) return;

    try {
      // 调用删除API
      await request.delete(`/admin/api/v1/language/${languageId}`);

      // 更新本地状态
      setLanguages((prev) => prev.filter((lang) => lang.id !== languageId));

      // 如果删除的是当前选中的语言，切换到第一个可用语言
      if (selectedLanguage && selectedLanguage.id === languageId) {
        const remainingLanguages = languages.filter(
          (lang) => lang.id !== languageId,
        );
        setSelectedLanguage(
          remainingLanguages.length > 0 ? remainingLanguages[0] : null,
        );
      }

      toast({
        title: "删除成功",
        description: `语言 "${language.name}" 已删除`,
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

  // 处理菜单翻译
  const handleMenuTranslate = async () => {
    if (!selectedLanguage) {
      toast({
        title: "翻译失败",
        description: "请先选择语言",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "翻译中",
        description: "正在翻译菜单项...",
      });

      await translateText(selectedLanguage.id, true, 1);

      toast({
        title: "翻译成功",
        description: "菜单项已翻译完成",
      });

      // 重新获取菜单数据
      if (selectedLanguage) {
        fetchMenuTreeByLanguage(selectedLanguage.id);
      }
    } catch (error) {
      console.error("Failed to translate menu:", error);
      toast({
        title: "翻译失败",
        description: "菜单翻译失败，请重试",
        variant: "destructive",
      });
    }
  };
  const handleMenuItemEditDialog = (id: string, name: string) => {
    setEditingMenuItem({ id, name });
    setIsEditMenuDialogOpen(true);
  };

  // 保存菜单项编辑对话框
  const handleSaveMenuItemEdit = async () => {
    if (!editingMenuItem || !selectedLanguage) return;

    try {
      await updateMenuItemName(
        selectedLanguage.id,
        editingMenuItem.id,
        editingMenuItem.name,
      );

      // 更新本地状态
      setMenuItems((prev) =>
        prev.map((item) =>
          item.id === editingMenuItem.id
            ? { ...item, name: editingMenuItem.name }
            : item,
        ),
      );

      // 重新生成树数据
      const updatedMenuData = menuItems.map((item) =>
        item.id === editingMenuItem.id
          ? { ...item, name: editingMenuItem.name }
          : item,
      );
      const treeData = convertToTreeData(updatedMenuData);
      setMenuTreeData(treeData);

      setIsEditMenuDialogOpen(false);
      setEditingMenuItem(null);

      toast({
        title: "保存成功",
        description: "菜单项名称已更新",
      });
    } catch (error) {
      console.error("Failed to save menu item:", error);
      toast({
        title: "保存失败",
        description: "无法保存菜单项名称，请重试",
        variant: "destructive",
      });
    }
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
                <div className="flex gap-2">
                  <Dialog
                    open={isAddLanguageDialogOpen}
                    onOpenChange={setIsAddLanguageDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>新增语言</DialogTitle>
                        <DialogDescription>添加新的语言支持</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="language-name">语言名称</Label>
                          <Input
                            id="language-name"
                            value={newLanguage.name}
                            onChange={(e) =>
                              setNewLanguage({
                                ...newLanguage,
                                name: e.target.value,
                              })
                            }
                            placeholder="例如: English"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="language-code">
                            语言代码 <span className="text-red-500">*</span>
                          </Label>
                          <select
                            id="language-code"
                            value={newLanguage.code}
                            onChange={(e) =>
                              setNewLanguage({
                                ...newLanguage,
                                code: e.target.value,
                              })
                            }
                            className="w-full p-2 border rounded-md"
                            required
                          >
                            <option value="">请选择语言代码</option>
                            {langCodeOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label} ({option.value})
                              </option>
                            ))}
                          </select>
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

                  <Dialog
                    open={isEditLanguageDialogOpen}
                    onOpenChange={setIsEditLanguageDialogOpen}
                  >
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>编辑语言</DialogTitle>
                        <DialogDescription>编辑语言信息</DialogDescription>
                      </DialogHeader>
                      {editingLanguage && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-language-name">语言名称</Label>
                            <Input
                              id="edit-language-name"
                              value={editingLanguage.name}
                              onChange={(e) =>
                                setEditingLanguage({
                                  ...editingLanguage,
                                  name: e.target.value,
                                })
                              }
                              placeholder="例如: English"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-language-code">
                              语言代码 <span className="text-red-500">*</span>
                            </Label>
                            <select
                              id="edit-language-code"
                              value={editingLanguage.code}
                              onChange={(e) =>
                                setEditingLanguage({
                                  ...editingLanguage,
                                  code: e.target.value,
                                })
                              }
                              className="w-full p-2 border rounded-md"
                              required
                            >
                              <option value="">请选择语言代码</option>
                              {langCodeOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label} ({option.value})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsEditLanguageDialogOpen(false)}
                        >
                          取消
                        </Button>
                        <Button onClick={handleSaveEditLanguage}>保存</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-220px)]">
                <div className="space-y-2">
                  {languages.map((language) => (
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
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingLanguage({ ...language });
                            setIsEditLanguageDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
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
              <div className="flex items-center justify-between">
                <CardTitle>菜单导航</CardTitle>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleMenuTranslate}
                    disabled={!selectedLanguage}
                  >
                    <Languages className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-220px)]">
                <Tree
                  treeData={menuTreeData}
                  selectedKeys={selectedMenuItem ? [selectedMenuItem.id] : []}
                  onSelect={async (selectedKeys) => {
                    if (selectedKeys.length > 0) {
                      debugger;
                      const selectedId = selectedKeys[0] as string;
                      // const selectedItem = menuItems.find(item => item.id === selectedId);
                      // if (selectedItem) {
                      //   await handleSelectMenuItem(selectedItem.id, selectedItem.name);
                      // }
                      await handleSelectMenuItem(selectedId);
                    }
                  }}
                  defaultExpandAll
                  height={600}
                  className="custom-tree"
                />
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* 第三列：文案列表 */}
        <div className="lg:col-span-7">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <CardTitle>
                  {"翻译文案"}
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
                    disabled={
                      selectedTranslationIds.size === 0 ||
                      !selectedLanguage ||
                      !selectedMenuItem
                    }
                  >
                    <Languages className="h-4 w-4 mr-2" />
                    批量翻译({selectedTranslationIds.size})
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
                    <TableHead className="w-1/12">
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="w-4/12">Key</TableHead>
                    <TableHead className="w-4/12">中文文案</TableHead>
                    <TableHead className="w-4/12">翻译文案</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTranslations.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedTranslationIds.has(item.id)}
                          onCheckedChange={(checked) =>
                            handleTranslationSelect(item.id, !!checked)
                          }
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {item.keyCode}
                      </TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.transform || "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAutoTranslate(item)}
                          >
                            <Languages className="h-4 w-4" />
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
            <DialogDescription>修改多语言翻译文案</DialogDescription>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-key">Key</Label>
                <Input
                  id="edit-key"
                  value={editingItem.keyCode}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, keyCode: e.target.value })
                  }
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-name">中文</Label>
                <Textarea
                  id="edit-name"
                  value={editingItem.name}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, name: e.target.value })
                  }
                  rows={3}
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-transform">翻译</Label>
                <Textarea
                  id="edit-transform"
                  value={editingItem.transform || ""}
                  onChange={(e) => {
                    setEditingItem({
                      ...editingItem,
                      transform: e.target.value,
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
            <Button onClick={handleSaveEdit}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 菜单编辑对话框 */}
      <Dialog
        open={isEditMenuDialogOpen}
        onOpenChange={setIsEditMenuDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑菜单项</DialogTitle>
            <DialogDescription>修改菜单项名称</DialogDescription>
          </DialogHeader>
          {editingMenuItem && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-menu-name">菜单名称</Label>
                <Input
                  id="edit-menu-name"
                  value={editingMenuItem.name}
                  onChange={(e) =>
                    setEditingMenuItem({
                      ...editingMenuItem,
                      name: e.target.value,
                    })
                  }
                  placeholder="请输入菜单名称"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditMenuDialogOpen(false)}
            >
              取消
            </Button>
            <Button onClick={handleSaveMenuItemEdit}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default I18nTranslationManager;
