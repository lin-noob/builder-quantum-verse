import React, { useState, useEffect } from "react";
import { ChevronRight, ChevronDown, Menu, Folder, Trash2, Plus, Edit, Shield } from "lucide-react";
import { IconRenderer } from "@/components/IconRenderer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AddMenuDialog from "./AddMenuDialog";
import EditMenuDialog from "./EditMenuDialog";
import { useToast } from "@/components/ui/use-toast";
import { request } from "@/lib/request";

interface MenuItem {
  id: number;
  name: string;
  icon?: string;
  parentId?: number | null;
  sort: number;
  visible: boolean;
  component?: string;
  children?: MenuItem[];
}

interface Permission {
  id: string;
  name: string;
  type: string;
  urlPerm: string;
  btnPerm: string;
  menuId: string;
  requestPath?: string;
}

interface DictItem {
  id: string;
  value: string;
  name: string;
}

interface PermissionPageResponse {
  data: Permission[];
  total: number;
  page: number;
  limit: number;
}

interface MenuRowProps {
  item: MenuItem;
  level: number;
  expandedItems: Set<number>;
  selectedMenuId?: number;
  onToggle: (id: number) => void;
  onSelect: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
  onMenuUpdated: () => void;
}

const MenuRow: React.FC<MenuRowProps> = ({
  item,
  level,
  expandedItems,
  selectedMenuId,
  onToggle,
  onSelect,
  onDelete,
  onMenuUpdated,
}) => {
  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = expandedItems.has(item.id);
  const isDirectory = !item.component;
  const isSelected = selectedMenuId === item.id;

  return (
    <>
      <tr
        className={`hover:bg-gray-50 cursor-pointer ${isSelected ? "bg-blue-50 border-l-4 border-blue-500" : ""}`}
        onClick={() => onSelect(item)}
      >
        <td className="px-6 py-3 whitespace-nowrap">
          <div className="flex items-center" style={{ paddingLeft: `${level * 24}px` }}>
            {hasChildren ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle(item.id);
                }}
                className="p-1 hover:bg-gray-200 rounded mr-2"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                )}
              </button>
            ) : (
              <div className="w-6 mr-2" />
            )}

            <div className="flex items-center gap-2">
              <IconRenderer iconName={item.icon} isDirectory={isDirectory} className="h-4 w-4" />

              <span className={`text-sm font-medium ${isSelected ? "text-blue-900" : "text-gray-900"}`}>
                {item.name}
              </span>
            </div>
          </div>
        </td>

        <td className="px-6 py-3 whitespace-nowrap">
          <Badge variant={isDirectory ? "secondary" : "default"}>{isDirectory ? "目录" : "菜单"}</Badge>
        </td>

        <td className="px-6 py-3 whitespace-nowrap">
          <Badge variant={item.visible ? "default" : "secondary"}>{item.visible ? "显示" : "隐藏"}</Badge>
        </td>

        <td className="px-6 py-3 whitespace-nowrap">{item.sort}</td>

        <td className="px-6 py-3 whitespace-nowrap text-sm font-medium">
          <div className="flex space-x-2">
            <EditMenuDialog menuId={item.id} onMenuUpdated={onMenuUpdated} />
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item);
              }}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              删除
            </Button>
          </div>
        </td>
      </tr>

      {hasChildren &&
        isExpanded &&
        item.children?.map((child) => (
          <MenuRow
            key={child.id}
            item={child}
            level={level + 1}
            expandedItems={expandedItems}
            selectedMenuId={selectedMenuId}
            onToggle={onToggle}
            onSelect={onSelect}
            onDelete={onDelete}
            onMenuUpdated={onMenuUpdated}
          />
        ))}
    </>
  );
};

const MenuManagementComponent: React.FC = () => {
  const [menuData, setMenuData] = useState<MenuItem[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [deletePermissionDialogOpen, setDeletePermissionDialogOpen] = useState(false);
  const [permissionToDelete, setPermissionToDelete] = useState<Permission | null>(null);
  const [permissionForm, setPermissionForm] = useState({
    name: "",
    type: "2", // 默认为页面功能权限
    urlPerm: "",
    btnPerm: "",
    // URL拼接的三个部分
    microService: "",
    requestMethod: "",
    urlPath: "",
  });
  const [microServices, setMicroServices] = useState<DictItem[]>([]);
  const [requestMethods, setRequestMethods] = useState<DictItem[]>([]);
  const [dictLoading, setDictLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMenuData();
  }, []);

  // 当选中菜单变化时，获取对应的权限列表
  useEffect(() => {
    if (selectedMenu) {
      fetchPermissions(selectedMenu.id);
    } else {
      setPermissions([]);
    }
  }, [selectedMenu]);

  // 初始化时加载字典数据
  useEffect(() => {
    fetchDictData();
  }, []);

  const fetchDictData = async () => {
    try {
      setDictLoading(true);
      const [microServiceRes, requestMethodRes] = await Promise.all([
        request.get("/admin/api/v1/dict-items/select_list/micro_service"),
        request.get("/admin/api/v1/dict-items/select_list/request_method"),
      ]);

      setMicroServices(microServiceRes.data.data || []);
      setRequestMethods(requestMethodRes.data.data || []);
    } catch (error) {
      console.error("Failed to fetch dict data:", error);
    } finally {
      setDictLoading(false);
    }
  };

  const fetchMenuData = async () => {
    try {
      const response = await request.get("/admin/api/v1/menus/table");
      setMenuData(response.data.data);
    } catch (error) {
      console.error("Failed to fetch menu data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async (menuId: number) => {
    try {
      setPermissionsLoading(true);
      const response = await request.get(`/admin/api/v1/permissions/page?page=0&limit=10&menuId=${menuId}&pageNum=1`);
      setPermissions(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch permissions:", error);
      setPermissions([]);
    } finally {
      setPermissionsLoading(false);
    }
  };

  // 获取权限详情
  const fetchPermissionDetail = async (permissionId: string) => {
    try {
      const response = await request.get(`/admin/api/v1/permissions/${permissionId}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error("Failed to fetch permission detail:", error);
      throw error;
    }
  };

  const handleMenuSelect = (menu: MenuItem) => {
    if (menu.component) {
      setSelectedMenu(menu);
    }
  };

  // 权限相关的处理函数
  const handleCreatePermission = () => {
    setEditingPermission(null);
    setPermissionForm({
      name: "",
      type: "2", // 默认为页面功能权限
      urlPerm: "",
      btnPerm: "",
      microService: "",
      requestMethod: "",
      urlPath: "",
    });
    setPermissionDialogOpen(true);
  };

  // 解析 urlPerm 的辅助函数
  const parseUrlPerm = (urlPerm: string) => {
    let microService = "",
      requestMethod = "",
      urlPath = "";

    if (urlPerm) {
      // 格式: method:/microService/path 或 method:/microService/path
      const colonIndex = urlPerm.indexOf(":");
      if (colonIndex !== -1) {
        requestMethod = urlPerm.substring(0, colonIndex);
        const pathPart = urlPerm.substring(colonIndex + 1);

        if (pathPart.startsWith("/")) {
          // 找到第二个 / 的位置来分离微服务名和路径
          const secondSlashIndex = pathPart.indexOf("/", 1);
          if (secondSlashIndex !== -1) {
            microService = pathPart.substring(1, secondSlashIndex);
            urlPath = pathPart.substring(secondSlashIndex);
          } else {
            // 如果没有第二个 /，那么整个就是微服务名
            microService = pathPart.substring(1);
            urlPath = "";
          }
        }
      }
    }

    return { microService, requestMethod, urlPath };
  };

  const handleEditPermission = async (permission: Permission) => {
    try {
      // 先获取权限详情
      const permissionDetail = await fetchPermissionDetail(permission.id);
      setEditingPermission(permissionDetail);

      // 解析 urlPerm 到三个字段
      const { microService, requestMethod, urlPath } = parseUrlPerm(permissionDetail.urlPerm || "");

      setPermissionForm({
        name: permissionDetail.name || "",
        type: String(permissionDetail.type) || "2",
        urlPerm: permissionDetail.urlPerm || "",
        btnPerm: permissionDetail.btnPerm || "",
        microService,
        requestMethod,
        urlPath,
      });
      setPermissionDialogOpen(true);
    } catch (error) {
      toast({
        title: "获取权限详情失败",
        description: "无法获取权限详情，请重试",
        variant: "destructive",
      });
    }
  };

  const handleDeletePermission = (permission: Permission) => {
    setPermissionToDelete(permission);
    setDeletePermissionDialogOpen(true);
  };

  const handleDeletePermissionConfirm = async () => {
    if (!permissionToDelete) return;

    try {
      await request.delete(`/admin/api/v1/permissions/${permissionToDelete.id}`);

      // 删除成功后刷新权限列表
      if (selectedMenu) {
        await fetchPermissions(selectedMenu.id);
      }

      setDeletePermissionDialogOpen(false);
      setPermissionToDelete(null);

      toast({
        title: "删除成功",
        description: `权限 "${permissionToDelete.name}" 已成功删除`,
      });
    } catch (error) {
      console.error("Failed to delete permission:", error);
      toast({
        title: "删除失败",
        description: "删除权限时发生错误，请重试",
        variant: "destructive",
      });
    }
  };

  // 动态拼接 urlPerm
  const generateUrlPerm = (microService: string, requestMethod: string, urlPath: string) => {
    if (!microService || !requestMethod || !urlPath) return "";
    return `${requestMethod}:/${microService}${urlPath}`;
  };

  // 更新表单并自动拼接 urlPerm
  const updatePermissionForm = (updates: Partial<typeof permissionForm>) => {
    const newForm = { ...permissionForm, ...updates };

    // 如果是字段权限类型，自动拼接 urlPerm
    if (newForm.type == "1") {
      newForm.urlPerm = generateUrlPerm(newForm.microService, newForm.requestMethod, newForm.urlPath);
    }

    setPermissionForm(newForm);
  };

  const handleSavePermission = async () => {
    if (!selectedMenu) return;

    try {
      // 准备提交的数据
      const permissionData = {
        id: editingPermission?.id,
        menuId: selectedMenu.id.toString(),
        name: permissionForm.name,
        type: permissionForm.type,
        urlPerm: permissionForm.type == "1" ? permissionForm.urlPerm : "",
        btnPerm: permissionForm.type == "2" ? permissionForm.btnPerm : "",
      };

      if (editingPermission) {
        // 更新权限
        await request.put(`/admin/api/v1/permissions/${editingPermission.id}`, permissionData);
        toast({
          title: "更新成功",
          description: "权限已成功更新",
        });
      } else {
        // 创建新权限
        await request.post("/admin/api/v1/permissions", permissionData);
        toast({
          title: "创建成功",
          description: "权限已成功创建",
        });
      }

      // 刷新权限列表
      await fetchPermissions(selectedMenu.id);
      setPermissionDialogOpen(false);
    } catch (error) {
      console.error("Failed to save permission:", error);
      toast({
        title: "保存失败",
        description: "保存权限时发生错误，请重试",
        variant: "destructive",
      });
    }
  };

  const toggleExpanded = (id: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const expandAll = () => {
    const allIds = new Set<number>();
    const collectIds = (items: MenuItem[]) => {
      items.forEach((item) => {
        if (item.children && item.children.length > 0) {
          allIds.add(item.id);
          collectIds(item.children);
        }
      });
    };
    collectIds(menuData);
    setExpandedItems(allIds);
  };

  const collapseAll = () => {
    setExpandedItems(new Set());
  };

  const handleDeleteClick = (item: MenuItem) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    const menuName = itemToDelete.name; // 保存菜单名称用于提示

    try {
      setDeleting(true);
      await request.delete(`/admin/api/v1/menus/${itemToDelete.id}`);

      // 删除成功后刷新数据
      await fetchMenuData();

      setDeleteDialogOpen(false);
      setItemToDelete(null);

      // 显示成功提示
      toast({
        title: "删除成功",
        description: `菜单 "${menuName}" 已成功删除`,
      });
    } catch (error) {
      console.error("Failed to delete menu:", error);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-2rem)] p-4 overflow-hidden">
      {/* 左侧菜单树 */}
      <div className="flex-1 min-w-0 h-full">
        <Card className="h-full flex flex-col">
          <CardHeader className="shrink-0">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>菜单管理</CardTitle>
                <CardDescription>选择菜单查看和配置权限</CardDescription>
              </div>
              <AddMenuDialog onMenuAdded={fetchMenuData} />
            </div>
            <div className="flex space-x-2 mt-2">
              <Button onClick={expandAll} variant="outline" size="sm">
                全部展开
              </Button>
              <Button onClick={collapseAll} variant="outline" size="sm">
                全部收起
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0 px-6 pb-6">
            <div className="h-full border rounded-lg overflow-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      菜单名称
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      类型
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      排序
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {menuData.map((item) => (
                    <MenuRow
                      key={item.id}
                      item={item}
                      level={0}
                      expandedItems={expandedItems}
                      selectedMenuId={selectedMenu?.id}
                      onToggle={toggleExpanded}
                      onSelect={handleMenuSelect}
                      onDelete={handleDeleteClick}
                      onMenuUpdated={fetchMenuData}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 右侧权限管理 */}
      <div className="w-[450px] shrink-0 h-full">
        <Card className="h-full flex flex-col">
          <CardHeader className="shrink-0">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  权限管理
                </CardTitle>
                <CardDescription>
                  {selectedMenu ? `为 "${selectedMenu.name}" 配置权限` : "请从左侧选择一个菜单"}
                </CardDescription>
              </div>
              {selectedMenu && (
                <Button size="sm" onClick={handleCreatePermission}>
                  <Plus className="h-4 w-4 mr-2" />
                  新增
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden flex flex-col">
            {selectedMenu ? (
              <div className="flex-1 flex flex-col min-h-0">
                {/* 权限列表 */}
                {permissionsLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : permissions.length > 0 ? (
                  <div className="flex-1 overflow-auto border rounded-lg">
                    <Table>
                      <TableHeader className="sticky top-0 bg-white z-10">
                        <TableRow>
                          <TableHead>名称</TableHead>
                          <TableHead>类型</TableHead>
                          <TableHead>操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {permissions.map((permission) => (
                          <TableRow key={permission.id}>
                            <TableCell className="font-medium max-w-[120px] truncate">{permission.name}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{permission.type == "1" ? "功能" : "字段"}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleEditPermission(permission)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                  onClick={() => handleDeletePermission(permission)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">该菜单暂无权限配置</div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <Shield className="h-12 w-12 mb-4 opacity-20" />
                <p>请从左侧选择一个菜单来配置权限</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 删除菜单确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除菜单 "{itemToDelete?.name}" 吗？
              {itemToDelete?.children && itemToDelete.children.length > 0 && (
                <span className="text-red-600 block mt-2">注意：该菜单包含子菜单，删除后所有子菜单也将被删除！</span>
              )}
              此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel} disabled={deleting}>
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "删除中..." : "确认删除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 删除权限确认对话框 */}
      <AlertDialog open={deletePermissionDialogOpen} onOpenChange={setDeletePermissionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除权限</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除权限 "{permissionToDelete?.name}" 吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePermissionConfirm} className="bg-red-600 hover:bg-red-700">
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 权限编辑对话框 */}
      <Dialog open={permissionDialogOpen} onOpenChange={setPermissionDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingPermission ? "编辑权限" : "新增权限"}</DialogTitle>
            <DialogDescription>
              {editingPermission ? `编辑权限信息` : `为菜单 "${selectedMenu?.name}" 添加新权限`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="permission-name" className="text-right">
                权限名称
              </Label>
              <Input
                id="permission-name"
                value={permissionForm.name}
                onChange={(e) => updatePermissionForm({ name: e.target.value })}
                className="col-span-3"
                placeholder="请输入权限名称"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="permission-type" className="text-right">
                权限类型
              </Label>
              <Select value={permissionForm.type} onValueChange={(value) => updatePermissionForm({ type: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="选择权限类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">页面功能权限</SelectItem>
                  <SelectItem value="2">字段权限</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 功能权限字段 */}
            {permissionForm.type == "2" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="btn-perm" className="text-right">
                  权限码
                </Label>
                <Input
                  id="btn-perm"
                  value={permissionForm.btnPerm}
                  onChange={(e) => updatePermissionForm({ btnPerm: e.target.value })}
                  className="col-span-3"
                  placeholder="请输入权限码"
                />
              </div>
            )}

            {/* 字段权限字段 */}
            {permissionForm.type == "1" && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="micro-service" className="text-right">
                    服务
                  </Label>
                  <Select
                    value={permissionForm.microService}
                    onValueChange={(value) => updatePermissionForm({ microService: value })}
                    disabled={dictLoading}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="选择微服务" />
                    </SelectTrigger>
                    <SelectContent>
                      {microServices.map((service) => (
                        <SelectItem key={service.id} value={service.value}>
                          {service.value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="request-method" className="text-right">
                    请求方法
                  </Label>
                  <Select
                    value={permissionForm.requestMethod}
                    onValueChange={(value) => updatePermissionForm({ requestMethod: value })}
                    disabled={dictLoading}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="选择请求方法" />
                    </SelectTrigger>
                    <SelectContent>
                      {requestMethods.map((method) => (
                        <SelectItem key={method.id} value={method.value}>
                          {method.value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="url-path" className="text-right">
                    URL路径
                  </Label>
                  <Input
                    id="url-path"
                    value={permissionForm.urlPath}
                    onChange={(e) => updatePermissionForm({ urlPath: e.target.value })}
                    className="col-span-3"
                    placeholder="/api/user/add"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right text-sm text-gray-500">URL权限预览</Label>
                  <div className="col-span-3 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    {permissionForm.urlPerm || "请填写上述字段生成URL权限"}
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPermissionDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSavePermission}>{editingPermission ? "更新" : "创建"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MenuManagementComponent;
