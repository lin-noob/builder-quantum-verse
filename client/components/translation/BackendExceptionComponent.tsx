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
} from "lucide-react";
import { request } from "@/lib/request";
import {
  TranslationItem,
  translateTableItems,
  saveTranslationDetail,
} from "@/services/i18nService";

// 类型定义
interface Language {
  id: string;
  name: string;
  code: string;
}

interface BackendExceptionComponentProps {
  selectedLanguage: Language | null;
}

const BackendExceptionComponent: React.FC<BackendExceptionComponentProps> = ({
  selectedLanguage,
}) => {
  const { toast } = useToast();
  
  // 异常翻译文案数据
  const [translations, setTranslations] = useState<TranslationItem[]>([]);
  const [filteredTranslations, setFilteredTranslations] = useState<
    TranslationItem[]
  >([]);

  // 表格选中状态
  const [selectedTranslationIds, setSelectedTranslationIds] = useState<
    Set<string>
  >(new Set());

  // 分页状态
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);

  // 搜索和过滤
  const [searchTerm, setSearchTerm] = useState("");

  // 编辑状态
  const [editingItem, setEditingItem] = useState<TranslationItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // 当选中的语言变化时，获取对应的异常数据
  useEffect(() => {
    if (selectedLanguage) {
      fetchExceptionsByLanguage(selectedLanguage.id, pageNumber, pageSize);
    }
  }, [selectedLanguage, pageNumber]);

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

  // 根据语言ID获取异常列表数据
  const fetchExceptionsByLanguage = async (languageId: string, page: number, size: number) => {
    try {
      const response = await request.get("/admin/api/v1/language/exception/list", {
        languageId: languageId,
        pageNumber: page,
        pageSize: size
      });
      
      const res = response.data || [];
      const exceptionData: TranslationItem[] = res.data || [];
      setTranslations(exceptionData);
      setFilteredTranslations(exceptionData);
      setTotal(res.total || 0);
      // 清空选中状态
      setSelectedTranslationIds(new Set());
    } catch (error) {
      console.error("Failed to fetch exception translations:", error);
      toast({
        title: "加载失败",
        description: "无法加载异常翻译数据，请重试",
        variant: "destructive",
      });
      // 如果失败，清空翻译列表
      setTranslations([]);
      setFilteredTranslations([]);
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
    if (!editingItem || !selectedLanguage) return;

    try {
      // 调用后台异常更新接口
      await request.put("/admin/api/v1/language/exception/update", {
        id: editingItem.id,
        keyCode: editingItem.keyCode,
        languageId: selectedLanguage.id,
        name: editingItem.name,
        transform: editingItem.transform || "",
      });

      setIsEditDialogOpen(false);
      setEditingItem(null);

      toast({
        title: "保存成功",
        description: "异常翻译文案已更新",
      });

      // 重新获取翻译数据
      await fetchExceptionsByLanguage(selectedLanguage.id, pageNumber, pageSize);
    } catch (error) {
      console.error("Failed to update exception translation:", error);
      toast({
        title: "保存失败",
        description: "无法更新异常翻译文案，请重试",
        variant: "destructive",
      });
    }
  };

  // 处理单个翻译文案的翻译 - 使用 translateType = 3
  const handleAutoTranslate = async (item: TranslationItem) => {
    if (!selectedLanguage) return;

    try {
      toast({
        title: "翻译中",
        description: "正在自动翻译...",
      });

      // 使用 translateType = 3 为异常翻译
      await translateTableItems(
        selectedLanguage.id,
        "", // 异常翻译没有menuId
        [item.id],
        3, // 写死 translateType = 3
      );

      toast({
        title: "翻译成功",
        description: "异常文案已自动翻译",
      });

      // 重新获取翻译数据
      await fetchExceptionsByLanguage(selectedLanguage.id, pageNumber, pageSize);
    } catch (error) {
      console.error("Failed to auto translate exception:", error);
      toast({
        title: "翻译失败",
        description: "自动翻译失败，请手动翻译",
        variant: "destructive",
      });
    }
  };

  // 处理批量翻译文案的翻译 - 使用 translateType = 3
  const handleBatchAutoTranslate = async () => {
    if (!selectedLanguage) return;

    const selectedIds = Array.from(selectedTranslationIds);
    if (selectedIds.length === 0) {
      toast({
        title: "请选择要翻译的项目",
        description: "请先勾选需要翻译的异常文案项",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "批量翻译中",
        description: `正在自动翻译${selectedIds.length}个异常文案...`,
      });

      // 使用 translateType = 3 为异常翻译
      await translateTableItems(
        selectedLanguage.id,
        "", // 异常翻译没有menuId
        selectedIds,
        3, // 写死 translateType = 3
      );

      toast({
        title: "批量翻译成功",
        description: `已自动翻译${selectedIds.length}个异常文案`,
      });

      // 重新获取翻译数据
      await fetchExceptionsByLanguage(selectedLanguage.id, pageNumber, pageSize);

      // 清空选中状态
      setSelectedTranslationIds(new Set());
    } catch (error) {
      console.error("Failed to batch auto translate exceptions:", error);
      toast({
        title: "批量翻译失败",
        description: "批量自动翻译失败，请手动翻译",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      {/* 异常翻译文案列表 */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>
              {"异常翻译文案"}
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
                  !selectedLanguage
                }
              >
                <Languages className="h-4 w-4 mr-2" />
                批量翻译({selectedTranslationIds.size})
              </Button>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索异常文案..."
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
                <p>暂无匹配的异常翻译文案</p>
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
            <DialogTitle>编辑异常翻译文案</DialogTitle>
            <DialogDescription>修改异常翻译文案</DialogDescription>
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
    </div>
  );
};

export default BackendExceptionComponent;
