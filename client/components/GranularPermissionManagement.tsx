import React, { useState, useEffect } from "react";
import {
  useRoles,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  Role,
} from "@/admin/hooks/useRoleManagement";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Edit,
  Copy,
  Trash2,
  Shield,
  Users,
  Eye,
  Edit3,
  Save,
  X,
  MoreHorizontal,
  ChevronDown,
} from "lucide-react";
import { Tree } from "antd";
import type { TreeDataNode } from "antd";
import "antd/dist/reset.css";
import { request } from "@/lib/request";
import { useToast } from "@/hooks/use-toast";

// 模拟数据类型定义
interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  resource: string;
  action: string;
}


// 权限接口返回项
interface ApiPermissionItem {
  id: string;
  name: string;
  type: number | string; // 1: 功能, 2: 字段
  menuId: number | string;
}

// 角色类型定义（与 API 返回的数据结构兼容）


interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

// 定义功能模块树状结构
interface Module {
  id: string;
  name: string;
  resource?: string;
  children?: Module[];
}

interface GranularPermissionManagementProps {
  title?: string;
  description?: string;
}

export default function GranularPermissionManagement({
  title = "精细化权限管理",
  description = "配置角色的功能权限和字段级��限",
}: GranularPermissionManagementProps) {
  const { toast } = useToast();
  // API hooks
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const {
    data: rolesData,
    isLoading,
    isError,
    error,
  } = useRoles({ page, limit, name: searchTerm });
  const createRoleMutation = useCreateRole();
  const updateRoleMutation = useUpdateRole();
  const deleteRoleMutation = useDeleteRole();

  // 状态管理
  const [users, setUsers] = useState<User[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState("");
  const [roleMenuPermissions, setRoleMenuPermissions] = useState<string[]>([]);
  const [loadingMenuPermissions, setLoadingMenuPermissions] = useState(false);

  // 当前激活的菜单与权限项
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [permissionItems, setPermissionItems] = useState<ApiPermissionItem[]>([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [newRole, setNewRole] = useState({
    id: "",
    name: "",
    description: "",
  });
  const [isEditingRole, setIsEditingRole] = useState(false);
  
  // 菜单数据状态
  const [menuTreeData, setMenuTreeData] = useState<TreeDataNode[]>([]);
  const [loadingMenuTree, setLoadingMenuTree] = useState(true);

  // 删除确认对话框状态
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // 获取角色列表
  const roles = rolesData?.data;
  const total = rolesData?.total;

  // 获取菜单树数据
  const fetchMenuTreeData = async () => {
    try {
      setLoadingMenuTree(true);
      const response = await request.get("/admin/api/v1/menus/companytree");
      const menuData = response.data.data || [];
      setMenuTreeData(convertToTreeData(menuData));
    } catch (error) {
      console.error("Failed to fetch menu tree data:", error);
      setMenuTreeData([]);
    } finally {
      setLoadingMenuTree(false);
    }
  };

  // 将菜单数据转换为 Ant Design Tree 需要的格式
  const convertToTreeData = (menuData: any[]): TreeDataNode[] => {
    return menuData.map((item) => ({
      key: item.id,
      title: item.name,
      children: item.children ? convertToTreeData(item.children) : undefined,
    }));
  };

  // 当��色数据加载完成时，设置默认选中的角色
  useEffect(() => {
    if (roles && roles.length > 0 && !selectedRole) {
      setSelectedRole(roles[0]);
    }
  }, [roles, selectedRole]);

  // 获取菜单树数据
  useEffect(() => {
    fetchMenuTreeData();
  }, []);

  // 当选中角色变化时，获取对应的菜单权限
  useEffect(() => {
    if (selectedRole) {
      fetchRoleMenuPermissions(selectedRole.id);
    } else {
      setRoleMenuPermissions([]);
    }
  }, [selectedRole?.id]);

  // 获取角色菜单权限
  const fetchRoleMenuPermissions = async (roleId: string) => {
    try {
      setLoadingMenuPermissions(true);
      const response = await request.get(`/admin/api/v1/roles/${roleId}/menus`);
      setRoleMenuPermissions(response.data.data || []);
      setSelectedRole((prv)=>{
        return {
          ...prv,
          menuIds: response.data.data
        }
      })

    } catch (error) {
      console.error('Failed to fetch role menu permissions:', error);
      setRoleMenuPermissions([]);
    } finally {
      setLoadingMenuPermissions(false);
    }
  };

  // 处理角色选择
  const handleSelectRole = (role: Role) => {
    setSelectedRole(role);
  };

  // 处理创建新角色（不依赖 selectedRole）
  const handleCreateRole = () => {
    setIsEditingRole(false);
    setNewRole({ id: "", name: "", description: "" });
    setIsRoleDialogOpen(true);
  };

  // 处理编辑角色（显式编辑模式）
  const handleEditRole = (role: Role) => {
    setIsEditingRole(true);
    setNewRole({ id: role.id, name: role.name, description: role.description });
    setIsRoleDialogOpen(true);
  };

  // 处理复制角色
  const handleCopyRole = (role: Role) => {
    // 在实际应用中，这里应该调用 API 创建新角色
    console.log("复制角色:", role);
    // 暂时使用模拟数据
    const copiedRole = {
      ...role,
      id: `copy_of_${role.id}`,
      name: `复制-${role.name}`,
    };
    // setRoles([...roles, copiedRole]);
  };

  // 触发删除确认
  const handleDeleteRole = (role: Role) => {
    setDeleteTarget({ id: role.id, name: role.name });
    setIsDeleteDialogOpen(true);
  };

  // 保存角色（由对话框模式决定新增或编辑）
  const handleSaveRole = () => {
    const trimmedName = newRole.name.trim();
    if (!trimmedName) {
      toast({ title: "请填写角色名称", variant: "destructive" });
      return;
    }

    if (isEditingRole && newRole.id) {
      const base = roles?.find((r) => r.id === newRole.id) || selectedRole;
      const payload = {
        id: newRole.id,
        issystem: base?.isSystem ?? true,
        menuIds: null,
        name: trimmedName,
        permissionIds: null,
        shopid: base?.shopId ?? "",
        type: base?.type ?? "manager",
      };
      updateRoleMutation.mutate({
        id: newRole.id,
        data: payload as any,
      });
    } else {
      createRoleMutation.mutate({ name: trimmedName });
    }

    setIsRoleDialogOpen(false);
  };

  // 切换功能权限并保存到后端
  const togglePermission = async (permissionId: string) => {
    if (!selectedRole || !activeMenuId) return;

    const prev = selectedRole.permissionIds || [];
    const updatedPermissions = prev.includes(permissionId)
      ? prev.filter((id) => id !== permissionId)
      : [...prev, permissionId];

    // 本地先更新
    setSelectedRole({
      ...selectedRole,
      permissionIds: updatedPermissions,
    });

    // 计算勾选名称数组
    const selectedSet = new Set(updatedPermissions);
    const permissionNames = permissionItems
      .filter((p) => selectedSet.has(p.id))
      .map((p) => p.name);

    try {
      await request.put(`/admin/api/v1/roles/${selectedRole.id}/permissions`, {
        menuId: activeMenuId,
        roleId: selectedRole.id,
        permissionIds: updatedPermissions,
        permissionNames,
      });
      toast({ title: "保存成功" });
    } catch (e: any) {
      // 回滚
      setSelectedRole((curr) => (curr ? { ...curr, permissionIds: prev } : curr));
      toast({ title: "保存失败", description: e?.message || "请稍后重试", variant: "destructive" });
    }
  };

  // 打开字段权限配置
  const openFieldPermissionConfig = (resource: string) => {
    setSelectedResource(resource);
  };

  // 切换字段查看权限
  const toggleFieldViewPermission = (fieldId: string) => {
    if (!selectedRole) return;

    const updatedFieldPermissions = { ...selectedRole.fieldPermissions };
    const resourceFields = updatedFieldPermissions[selectedResource] || [];
    const fieldIndex = resourceFields.findIndex((f) => f.id === fieldId);

    if (fieldIndex !== -1) {
      const updatedField = {
        ...resourceFields[fieldIndex],
        view: !resourceFields[fieldIndex].view,
      };
      // 如果取消查看权限，也要取消编辑权限
      if (!updatedField.view) {
        updatedField.edit = false;
      }
      resourceFields[fieldIndex] = updatedField;
      updatedFieldPermissions[selectedResource] = resourceFields;

      setSelectedRole({
        ...selectedRole,
        fieldPermissions: updatedFieldPermissions,
      });
    }
  };

  // 切换字段编辑权限
  const toggleFieldEditPermission = (fieldId: string) => {
    if (!selectedRole) return;

    const updatedFieldPermissions = { ...selectedRole.fieldPermissions };
    const resourceFields = updatedFieldPermissions[selectedResource] || [];
    const fieldIndex = resourceFields.findIndex((f) => f.id === fieldId);

    if (fieldIndex !== -1) {
      const updatedField = { ...resourceFields[fieldIndex] };
      // 如果开启编辑权限，必须开启查看权限
      if (!updatedField.view) {
        updatedField.view = true;
      }
      updatedField.edit = !updatedField.edit;
      resourceFields[fieldIndex] = updatedField;
      updatedFieldPermissions[selectedResource] = resourceFields;

      setSelectedRole({
        ...selectedRole,
        fieldPermissions: updatedFieldPermissions,
      });
    }
  };

  // 保存权限配置
  const handleSavePermissions = () => {
    if (selectedRole) {
      // 在实际应用中，这里应该调用 API 保存权限配置
      console.log("保存权限配置:", selectedRole);
      // updateRoleMutation.mutate({
      //   id: selectedRole.id,
      //   data: selectedRole
      // });
    }
  };

  // 为用户分配角色
  const handleAssignRole = (userId: string, roleId: string) => {
    setUsers(
      users.map((user) => {
        if (user.id === userId) {
          const updatedRoles = user.roles.includes(roleId)
            ? user.roles.filter((id) => id !== roleId)
            : [...user.roles, roleId];
          return { ...user, roles: updatedRoles };
        }
        return user;
      }),
    );
  };

  // 添加分页状态
  const [fieldPermissionPage, setFieldPermissionPage] = useState(1);
  const fieldPermissionsPerPage = 5; // 每页��示5个字段权限

  // 获取指定资源的字段权限
  const getResourceFieldPermissions = (resource: string) => {
    if (selectedRole) {
      return selectedRole.fieldPermissions[resource] || [];
    }
    return [];
  };

  // 获取当前页的字段权限
  const getCurrentPageFieldPermissions = () => {
    const allFieldPermissions = getResourceFieldPermissions(selectedResource);
    const startIndex = (fieldPermissionPage - 1) * fieldPermissionsPerPage;
    const endIndex = startIndex + fieldPermissionsPerPage;
    return allFieldPermissions.slice(startIndex, endIndex);
  };

  // 计算总页数
  const getFieldPermissionTotalPages = () => {
    const allFieldPermissions = getResourceFieldPermissions(selectedResource);
    return Math.ceil(allFieldPermissions.length / fieldPermissionsPerPage);
  };

  // 处理页码变化
  const handleFieldPermissionPageChange = (page: number) => {
    setFieldPermissionPage(page);
  };

  // 处理菜单选择变化并立即保存到后端
  const handleMenuSelectionChange = async (selectedMenuIds: string[]) => {
    if (!selectedRole) return;

    const prevMenuIds = selectedRole.menuIds || [];

    // 本地先行更新，提升交互响应
    setSelectedRole({
      ...selectedRole,
      menuIds: selectedMenuIds,
    });

    try {
      const payload = {
        id: selectedRole.id,
        issystem: selectedRole.isSystem,
        menuIds: selectedMenuIds.map((id) => String(id)),
        name: selectedRole.name,
        permissionIds: selectedRole.permissionIds?.length
          ? selectedRole.permissionIds
          : null,
        shopid: selectedRole.shopId ?? "",
        type: selectedRole.type,
      };

      await request.put(`/admin/api/v1/roles/${selectedRole.id}/menus`, payload);
      toast({ title: "保存��功" });
      if (!activeMenuId && selectedMenuIds.length > 0) {
        setActiveMenuId(selectedMenuIds[selectedMenuIds.length - 1]);
      }
    } catch (err: any) {
      console.error("Failed to save role menu permissions:", err);
      // 还原选择
      setSelectedRole((curr) => (curr ? { ...curr, menuIds: prevMenuIds } : curr));
      const message = err?.message || "请稍后重试";
      toast({ title: "保存失败", description: message, variant: "destructive" });
    }
  };

  // 获取指定菜单的权限���
  const fetchPermissionsByMenu = async (menuId: string) => {
    try {
      setLoadingPermissions(true);
      const res = await request.get<ApiPermissionItem[]>(
        "/admin/api/v1/permissions",
        { menuId },
      );
      const list = (res as any)?.data?.data ?? (res as any)?.data ?? [];
      setPermissionItems(list);
    } catch (e: any) {
      console.error("Failed to fetch permissions by menuId:", e);
      toast({ title: "加载权限失败", description: e?.message || "请稍后重试", variant: "destructive" });
      setPermissionItems([]);
    } finally {
      setLoadingPermissions(false);
    }
  };

  useEffect(() => {
    if (activeMenuId) {
      fetchPermissionsByMenu(activeMenuId);
      // 加载该角色在当前菜单下已勾选的权限
      const fetchRolePermissionIdsByMenu = async () => {
        if (!selectedRole) return;
        try {
          const res = await request.get<string[]>(
            `/admin/api/v1/roles/${selectedRole.id}/permissions`,
            { menuId: activeMenuId },
          );
          const ids: string[] = (res as any)?.data?.data ?? (res as any)?.data ?? [];
          setSelectedRole((curr) => (curr ? { ...curr, permissionIds: ids } : curr));
        } catch (e: any) {
          console.error("Failed to fetch role existing permissions:", e);
          toast({ title: "加载已选权限失败", description: e?.message || "请稍后重试", variant: "destructive" });
          setSelectedRole((curr) => (curr ? { ...curr, permissionIds: [] } : curr));
        }
      };
      fetchRolePermissionIdsByMenu();
    }
  }, [activeMenuId]);

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 左侧角色列表 */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>角色列表</CardTitle>
                <CardDescription>组织中的所有角色</CardDescription>
              </div>
              <Button onClick={handleCreateRole} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                新建
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                placeholder="搜索角色..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {isLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : isError ? (
                  <div className="text-center text-red-500 py-4">
                    加载角色列表失败: {error?.message || "未知错误"}
                  </div>
                ) : (
                  roles
                    .filter((role) =>
                      role.name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()),
                    )
                    .map((role) => (
                      <div
                        key={role.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          selectedRole?.id === role.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                        onClick={() => handleSelectRole(role)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{role.name}</h3>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditRole(role);
                                }}
                              >
                                编辑
                              </DropdownMenuItem>
                              {/* <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyRole(role);
                                }}
                              >
                                复制
                              </DropdownMenuItem> */}
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteRole(role);
                                }}
                              >
                                删除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 右侧权限配置面板 */}
        <Card className="lg:col-span-9">
          <CardHeader>
            <CardTitle>
              {selectedRole ? `${selectedRole.name} 权限配置` : "权限配置"}
            </CardTitle>
            <CardDescription>
              {selectedRole
                ? `为 ${selectedRole.name} 角色配置功能权限和字段权限`
                : "请从左侧选择一个角色进行配置"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedRole ? (
              <div className="space-y-6">
                {/* 主从布局：左侧功能列表，右侧权限配置 */}
                <div className="flex flex-col md:flex-row gap-6">
                  {/* 左侧菜单权限配置 */}
                  <div className="md:w-4/12">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">菜单权限</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {loadingMenuTree ? (
                          <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-gray-500">加载菜单数据中...</span>
                          </div>
                        ) : (
                          <Tree
                            checkable
                            checkedKeys={selectedRole?.menuIds || []}
                            onCheck={(checkedKeys) => {
                              const keys = Array.isArray(checkedKeys) ? checkedKeys : checkedKeys.checked;
                              handleMenuSelectionChange(keys as string[]);
                            }}
                            onSelect={(selectedKeys) => {
                              if (selectedKeys.length > 0) {
                                setActiveMenuId(selectedKeys[0] as string);
                              }
                            }}
                            treeData={menuTreeData}
                            height={400}
                            defaultExpandAll
                          />
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* 右侧功能权限配置 */}
                  <div className="md:w-8/12">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">权限配置</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {activeMenuId ? (
                          <Tabs
                            defaultValue="permissions"
                            className="space-y-6"
                          >
                            <TabsList className="grid w-full grid-cols-2">
                              <TabsTrigger value="permissions">
                                功能权限
                              </TabsTrigger>
                              <TabsTrigger value="fieldPermissions">
                                字段权限
                              </TabsTrigger>
                            </TabsList>

                            {/* 功能权限Tab */}
                            <TabsContent
                              value="permissions"
                              className="space-y-6"
                            >
                              <div className="space-y-4">
                                {loadingPermissions ? (
                                  <div className="flex justify-center items-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-1 gap-2">
                                    {permissionItems.filter(p => String(p.type) === "1").length > 0 ? (
                                      permissionItems
                                        .filter((p) => String(p.type) === "1")
                                        .map((p) => (
                                          <div key={p.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                                            <Checkbox
                                              id={`perm-${p.id}`}
                                              checked={!!selectedRole?.permissionIds?.includes(p.id)}
                                              onCheckedChange={() => togglePermission(p.id)}
                                            />
                                            <Label htmlFor={`perm-${p.id}`} className="text-sm">
                                              {p.name}
                                            </Label>
                                          </div>
                                        ))
                                    ) : (
                                      <div className="text-center text-gray-500 py-4">
                                        暂无功能权限
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </TabsContent>

                            {/* 字段权限Tab */}
                            <TabsContent
                              value="fieldPermissions"
                              className="space-y-6"
                            >
                              <div className="space-y-4">
                                {loadingPermissions ? (
                                  <div className="flex justify-center items-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-1 gap-2">
                                    {permissionItems.filter(p => String(p.type) === "2").length > 0 ? (
                                      permissionItems
                                        .filter((p) => String(p.type) === "2")
                                        .map((p) => (
                                          <div key={p.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                                            <Checkbox
                                              id={`perm-${p.id}`}
                                              checked={!!selectedRole?.permissionIds?.includes(p.id)}
                                              onCheckedChange={() => togglePermission(p.id)}
                                            />
                                            <Label htmlFor={`perm-${p.id}`} className="text-sm">
                                              {p.name}
                                            </Label>
                                          </div>
                                        ))
                                    ) : (
                                      <div className="text-center text-gray-500 py-4">
                                        暂无字段权限
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </TabsContent>
                          </Tabs>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                            <Shield className="h-12 w-12 mb-4" />
                            <p>请从左侧点击一个菜单项以加载权限</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Shield className="h-12 w-12 mb-4" />
                <p>请选择一个角色进行权限配置</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 角色编辑对话框 */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditingRole ? "��辑角色" : "新建角色"}</DialogTitle>
            <DialogDescription>
              {isEditingRole ? "修改角色信息" : "创建一个新的角色"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="role-name">角色名称</Label>
              <Input
                id="role-name"
                value={newRole.name}
                onChange={(e) =>
                  setNewRole({ ...newRole, name: e.target.value })
                }
                placeholder="输入角色名称"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRoleDialogOpen(false)}
            >
              <X className="h-4 w-4 mr-2" />
              取消
            </Button>
            <Button onClick={handleSaveRole}>
              <Save className="h-4 w-4 mr-2" />
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除角色</AlertDialogTitle>
            <AlertDialogDescription>
              确认删除角色 “{deleteTarget?.name}”？该操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTarget(null)}>取消</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) {
                  deleteRoleMutation.mutate(deleteTarget.id);
                }
                setIsDeleteDialogOpen(false);
                setDeleteTarget(null);
              }}
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
