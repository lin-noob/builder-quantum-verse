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
import {
  Plus,
  Edit,
  Trash2,
  Upload,
  Search,
} from "lucide-react";
import * as i18nService from "@/services/i18nService";
import { Tree } from "antd";
import type { TreeDataNode } from "antd";
import { request } from "@/lib/request";
import "./I18nConfig.css";

// 扩展菜单分类类型定义以支持树状结构
interface MenuCategory extends i18nService.MenuCategory {
  parentId: string | null;
}

// 翻译项类型定义 (符合新的API接口要求)
interface TranslationItem {
  id: string;
  keyCode: string;
  name: string;
}

// 新增翻译项的类型定义
interface NewTranslationItem {
  menuId: string;
  name: string;
  keyCode: string;
}

// 编辑翻译项的类型定义
interface EditTranslationItem extends NewTranslationItem {
  id: string;
}

const MenuI18nManagement: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // 菜单分类数据
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [menuTreeData, setMenuTreeData] = useState<TreeDataNode[]>([]); // 添加菜单树数据状态
  
  // 翻译文案数据
  const [translations, setTranslations] = useState<TranslationItem[]>([]);
  
  // 分页状态
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(20); // 固定每页20条数据
  const [total, setTotal] = useState(0);
  
  // 搜索和过滤
  const [searchTerm, setSearchTerm] = useState("");
  
  // 编辑状态
  const [editingItem, setEditingItem] = useState<TranslationItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // 新增状态
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState<Omit<TranslationItem, "id">>({
    keyCode: "",
    name: ""
  });

  // 转换菜单数据为树状结构
  const convertToTreeData = (menuData: any[]): TreeDataNode[] => {
    return menuData.map(item => {
      const children = item.children ? convertToTreeData(item.children) : undefined;
      return {
        key: item.id,
        title: item.name,
        children,
      };
    });
  };

  // 初始化数据
  useEffect(() => {
    loadI18nData();
  }, []);

  // 加载多语言数据
  const loadI18nData = async () => {
    try {
      setLoading(true);

      // 获取菜单分类
      const response = await request.get("/admin/api/v1/menus/companytree");
      const menuData = response.data.data || [];

      // 设置树状数据
      setMenuTreeData(convertToTreeData(menuData));

      // 转换为支持树状结构的类型
      const categories: MenuCategory[] = menuData.map((item: any) => ({
        id: item.id,
        name: item.name,
        count: item.children ? item.children.length : 0,
        parentId: null // 默认没有父级，实际数据中可能需要根据key的结构来确定parentId
      }));
      setMenuCategories(categories);

      // 默认选中第一个分类
      if (categories.length > 0) {
        setSelectedCategory(categories[0].id);
      }
    } catch (error) {
      console.error("Failed to load i18n data:", error);
      toast({
        title: "加载失败",
        description: error instanceof Error ? error.message : "无法加载菜单数据，请重试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // 当选中的菜单分类变化时，获取对应的翻译文案
  useEffect(() => {
    if (selectedCategory) {
      fetchTranslationsByMenuId(selectedCategory, pageNumber, pageSize);
    }
  }, [selectedCategory, pageNumber]);

  // 根据菜单ID获取翻译文案
  const fetchTranslationsByMenuId = async (menuId: string, page: number, size: number) => {
    try {
      const response = await request.get("/admin/api/v1/menus-details/page", {
        pageNumber: page,
        menuId: menuId,
        pageSize: size
      });
      
      const res = response.data || [];
      const translationsData: TranslationItem[] = res.data || [];
      setTranslations(translationsData);
      setTotal(res.total || 0);
    } catch (error) {
      console.error("Failed to fetch translations by menuId:", error);
      toast({
        title: "加载失败",
        description: "无法加载翻译文案数据，请重试",
        variant: "destructive",
      });
    }
  };

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
      
      // 构造请求参数
      const editData: EditTranslationItem = {
        id: editingItem.id,
        menuId: selectedCategory,
        name: editingItem.name,
        keyCode: editingItem.keyCode
      };
      
      // 调用API更新翻译
      await request.put("/admin/api/v1/menus-details", editData);
      
      // 重新获取数据
      fetchTranslationsByMenuId(selectedCategory, pageNumber, pageSize);
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
      await request.delete("/admin/api/v1/menus-details/" + id);
      
      // 重新获取数据
      fetchTranslationsByMenuId(selectedCategory, pageNumber, pageSize);
      
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
    if (!newItem.keyCode || !newItem.name) {
      toast({
        title: "验证失败",
        description: "请填写所有必填字段",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedCategory) {
      toast({
        title: "验证失败",
        description: "请选择菜单分类",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // 构造请求参数
      const addData: NewTranslationItem = {
        menuId: selectedCategory,
        name: newItem.name,
        keyCode: newItem.keyCode
      };
      
      // 调用API新增翻译
      await request.post("/admin/api/v1/menus-details", addData);
      
      // 重新获取数据
      fetchTranslationsByMenuId(selectedCategory, pageNumber, pageSize);
      setIsAddDialogOpen(false);
      setNewItem({ keyCode: "", name: "" });
      
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
      input.accept = ".xlsx, .xls";
      
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        
        try {
          // 创建FormData对象
          const formData = new FormData();
          formData.append("file", file);
          formData.append('menuId', selectedCategory);
          // 调用API导入翻译
          await request.post("/admin/api/v1/menus-details/uploadExcel", formData, {
            headers: {
              "Content-Type": "multipart/form-data"
            }
          });
          
          toast({
            title: "导入成功",
            description: "翻译文件已成功导入",
          });
          
          // 重新加载数据
          if (selectedCategory) {
            fetchTranslationsByMenuId(selectedCategory, pageNumber, pageSize);
          }
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
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 左侧菜单分类列表 */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>菜单分类</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-220px)]">
                <Tree
                  treeData={menuTreeData}
                  selectedKeys={[selectedCategory]}
                  onSelect={(selectedKeys) => {
                    if (selectedKeys.length > 0) {
                      setSelectedCategory(selectedKeys[0] as string);
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

        {/* 右侧翻译文案列表 */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <CardTitle className="flex justify-between items-center">
                  {menuCategories.find(c => c.id === selectedCategory)?.name || "翻译文案"}
                  <Button onClick={handleImport} variant="outline" size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    导入
                  </Button>
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
                          <Label htmlFor="keyCode">Key</Label>
                          <Input
                            id="keyCode"
                            value={newItem.keyCode}
                            onChange={(e) =>
                              setNewItem({ ...newItem, keyCode: e.target.value })
                            }
                            placeholder="例如: nav.home"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="name">中文</Label>
                          <Input
                            id="name"
                            value={newItem.name}
                            onChange={(e) =>
                              setNewItem({ ...newItem, name: e.target.value })
                            }
                            placeholder="中文翻译"
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
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/2">Key</TableHead>
                      <TableHead className="w-1/2">中文文案</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {translations.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono text-sm">
                          {item.keyCode}
                        </TableCell>
                        <TableCell>{item.name}</TableCell>
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

                {translations.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>暂无匹配的翻译文案</p>
                  </div>
                )}
              </ScrollArea>
              
              {/* 分页组件 */}
              {total > 0 && (
                <div className="flex items-center justify-between py-4">
                  <div className="text-sm text-muted-foreground">
                    共 {total} 条数据
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
                      disabled={pageNumber === 1}
                    >
                      上一页
                    </Button>
                    <div className="flex items-center text-sm">
                      第 {pageNumber} 页，共 {Math.ceil(total / pageSize)} 页
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPageNumber(prev => prev + 1)}
                      disabled={pageNumber >= Math.ceil(total / pageSize)}
                    >
                      下一页
                    </Button>
                  </div>
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
                <Label htmlFor="edit-keyCode">Key</Label>
                <Input
                  id="edit-keyCode"
                  value={editingItem.keyCode}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, keyCode: e.target.value })
                  }
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

export default MenuI18nManagement;
