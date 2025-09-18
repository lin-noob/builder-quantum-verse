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
import { request } from "@/lib/request";

// 后台业务项类型定义
interface BusinessItem {
  id: string;
  keyCode: string;
  name: string;
}

// 新增后台业务项的类型定义
interface NewBusinessItem {
  name: string;
  keyCode: string;
}

// 编辑后台业务项的类型定义
interface EditBusinessItem extends NewBusinessItem {
  id: string;
}

const BackendManagement: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 后台业务数据
  const [businessItems, setBusinessItems] = useState<BusinessItem[]>([]);

  // 分页状态
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);

  // 搜索和过滤
  const [searchTerm, setSearchTerm] = useState("");

  // 编辑状态
  const [editingItem, setEditingItem] = useState<BusinessItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // 新增状态
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState<Omit<BusinessItem, "id">>({
    keyCode: "",
    name: ""
  });

  // 初始化数据
  useEffect(() => {
    loadBusinessData();
  }, []);

  // 加载后台业务数据
  const loadBusinessData = async () => {
    try {
      setLoading(true);
      await fetchBusinessItems(pageNumber, pageSize);
    } catch (error) {
      console.error("Failed to load business data:", error);
      toast({
        title: "加载失败",
        description: error instanceof Error ? error.message : "无法加载后台业务数据，请重试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // 当分页变化时，获取对应的后台业务数据
  useEffect(() => {
    if (!loading) {
      fetchBusinessItems(pageNumber, pageSize);
    }
  }, [pageNumber]);

  // 获取后台业务数据
  const fetchBusinessItems = async (page: number, size: number) => {
    try {
      const response = await request.get("/admin/api/v1/business/page", {
        pageNumber: page,
        pageSize: size
      });

      const res = response.data || [];
      const businessData: BusinessItem[] = res.data || [];
      setBusinessItems(businessData);
      setTotal(res.total || 0);
    } catch (error) {
      console.error("Failed to fetch business items:", error);
      toast({
        title: "加载失败",
        description: "无法加载后台业务数据，请重试",
        variant: "destructive",
      });
    }
  };

  // 处理编辑
  const handleEdit = (item: BusinessItem) => {
    setEditingItem(item);
    setIsEditDialogOpen(true);
  };

  // 处理保存编辑
  const handleSaveEdit = async () => {
    if (!editingItem) return;

    try {
      setSaving(true);

      // 构造请求参数
      const editData: EditBusinessItem = {
        id: editingItem.id,
        name: editingItem.name,
        keyCode: editingItem.keyCode
      };

      // 调用API更新后台业务项
      await request.put("/admin/api/v1/business", editData);

      // 重新获取数据
      fetchBusinessItems(pageNumber, pageSize);
      setIsEditDialogOpen(false);
      setEditingItem(null);

      toast({
        title: "保存成功",
        description: "后台��务项已更新",
      });
    } catch (error) {
      console.error("Failed to update business item:", error);
      toast({
        title: "保存失败",
        description: "无法更新后台业务项，请重试",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // 处理删除
  const handleDelete = async (id: string) => {
    try {
      // 调用API删除后台业务项
      await request.delete("/admin/api/v1/business/" + id);

      // 重新获取数据
      fetchBusinessItems(pageNumber, pageSize);

      toast({
        title: "删除成功",
        description: "后台业务项已删除",
      });
    } catch (error) {
      console.error("Failed to delete business item:", error);
      toast({
        title: "删除失败",
        description: "无法删除后台业务项，请重试",
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

    try {
      // 构造请求参数
      const addData: NewBusinessItem = {
        name: newItem.name,
        keyCode: newItem.keyCode
      };

      // 调用API新增后台业务项
      await request.post("/admin/api/v1/business", addData);

      // 重新获取数据
      fetchBusinessItems(pageNumber, pageSize);
      setIsAddDialogOpen(false);
      setNewItem({ keyCode: "", name: "" });

      toast({
        title: "添加成功",
        description: "新的后台业务项已添加",
      });
    } catch (error) {
      console.error("Failed to add business item:", error);
      toast({
        title: "添加失败",
        description: "无法添加后台业务项，请重试",
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

          // 调用API导入后台业务项
          await request.post("/admin/api/v1/business/uploadExcel", formData, {
            headers: {
              "Content-Type": "multipart/form-data"
            }
          });

          toast({
            title: "导入成功",
            description: "后台业务文件已成功导入",
          });

          // 重新加载数据
          fetchBusinessItems(pageNumber, pageSize);
        } catch (error) {
          console.error("Failed to import business items:", error);
          toast({
            title: "导入失败",
            description: "无法导入后台业务文件，请重试",
            variant: "destructive",
          });
        }
      };

      input.click();
    } catch (error) {
      console.error("Failed to import business items:", error);
      toast({
        title: "导入失败",
        description: "无法导入后台业务文件，请重试",
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
      {/* ���台业务管理表格 */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="flex justify-between items-center">
              后台业务管理
              <Button onClick={handleImport} variant="outline" size="sm">
                <Upload className="mr-2 h-4 w-4" />
                导入
              </Button>
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索业务项..."
                  className="pl-8 w-full md:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    新增业务项
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>新增后台业务项</DialogTitle>
                    <DialogDescription>
                      添加新的后台业务项
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
                        placeholder="例如: backend.function"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">名称</Label>
                      <Input
                        id="name"
                        value={newItem.name}
                        onChange={(e) =>
                          setNewItem({ ...newItem, name: e.target.value })
                        }
                        placeholder="业务项名称"
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
                  <TableHead className="w-1/2">业务项名称</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {businessItems.map((item) => (
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

            {businessItems.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>暂无匹配的后台业务项</p>
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

      {/* 编辑对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑后台业务项</DialogTitle>
            <DialogDescription>
              修改后台业务项信息
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
                <Label htmlFor="edit-name">名称</Label>
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

export default BackendManagement;
