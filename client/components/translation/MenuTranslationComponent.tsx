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
  Edit,
  Search,
  Languages,
  Edit3,
} from "lucide-react";
import { Tree } from "antd";
import type { TreeDataNode } from "antd";
import { request } from "@/lib/request";
import {
  TranslationItem,
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
  component?: string;
  children?: MenuItem[];
}

interface SelectedMenuItem {
  id: string;
  name?: string;
}

interface MenuTreeDataNode extends TreeDataNode {
  id: string;
  name: string;
  children?: MenuTreeDataNode[];
}

interface MenuTranslationComponentProps {
  selectedLanguage: Language | null;
}

const MenuTranslationComponent: React.FC<MenuTranslationComponentProps> = ({
  selectedLanguage,
}) => {
  const { toast } = useToast();

  // 菜单导航数据（树状结构）
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedMenuItem, setSelectedMenuItem] =
    useState<SelectedMenuItem | null>(null);
  const [menuTreeData, setMenuTreeData] = useState<MenuTreeDataNode[]>([]);

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

  // 当选中的语言变化时，获取对应的菜单树数据
  useEffect(() => {
    if (selectedLanguage) {
      fetchMenuTreeByLanguage(selectedLanguage.id);
    }
  }, [selectedLanguage]);

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
      {/* 菜单导航栏 */}
      <div className="lg:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle>菜单导航</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <Tree
                treeData={menuTreeData}
                selectedKeys={selectedMenuItem ? [selectedMenuItem.id] : []}
                onSelect={async (selectedKeys) => {
                  if (selectedKeys.length > 0) {
                    const selectedId = selectedKeys[0] as string;
                    await handleSelectMenuItem(selectedId);
                  }
                }}
                defaultExpandAll
                height={500}
                className="custom-tree"
              />
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* 翻译文案列表 */}
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
            <ScrollArea className="h-[500px]">
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
            </ScrollArea>
          </CardContent>
        </Card>
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

export default MenuTranslationComponent;
