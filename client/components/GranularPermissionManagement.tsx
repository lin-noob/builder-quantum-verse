import React, { useState, useEffect } from "react";
import {
  useRoles,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
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
import CheckableTreeMenu from "./CheckableTreeMenu";
import { request } from "@/lib/request";

// 模拟数据类型定义
interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  resource: string;
  action: string;
}

interface FieldPermission {
  id: string;
  name: string;
  description: string;
  view: boolean;
  edit: boolean;
}

// 角色类型定义（与 API 返回的数据结构兼容）
interface Role {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  menuIds: number[]; // 改为 number[] 类型以匹配菜单 ID
  permissionIds: string[];
  type: string;
  shopId?: string;
  // 以下字段用于前端显示，可能需要从 API 数据转换
  permissions?: string[];
  fieldPermissions?: Record<string, FieldPermission[]>;
}

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
  description = "配置角色的功能权限和字段级权限",
}: GranularPermissionManagementProps) {
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
  const [newRole, setNewRole] = useState({
    id: "",
    name: "",
    description: "",
  });

  // 获取角色列表
  const roles = rolesData?.data;
  const total = rolesData?.total;

  // 当角色数据加载完成时，设置默认选中的角色
  useEffect(() => {
    if (roles && roles.length > 0 && !selectedRole) {
      setSelectedRole(roles[0]);
    }
  }, [roles, selectedRole]);

  // 当选中角色变化时，获取对应的菜单权限
  useEffect(() => {
    if (selectedRole) {
      fetchRoleMenuPermissions(selectedRole.id);
    } else {
      setRoleMenuPermissions([]);
    }
  }, [selectedRole]);

  // 获取角色菜单权限
  const fetchRoleMenuPermissions = async (roleId: string) => {
    try {
      setLoadingMenuPermissions(true);
      const response = await request.get(`/admin/api/v1/roles/${roleId}/menus`);
      setRoleMenuPermissions(response.data || []);
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

  // 处理创建新角色
  const handleCreateRole = () => {
    setNewRole({
      id: "",
      name: "",
      description: "",
    });
    setSelectedRole(null);
    setIsRoleDialogOpen(true);
  };

  // 处理编辑角色
  const handleEditRole = (role: Role) => {
    setNewRole({
      id: role.id,
      name: role.name,
      description: role.description,
    });
    setSelectedRole(role);
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

  // 处理删除角色
  const handleDeleteRole = (roleId: string) => {
    if (confirm("确定要删除这个角色吗？")) {
      deleteRoleMutation.mutate(roleId);
    }
  };

  // 保存角色
  const handleSaveRole = () => {
    if (selectedRole && selectedRole.id) {
      // 编辑现有角色
      updateRoleMutation.mutate({
        id: selectedRole.id,
        data: {
          ...selectedRole,
          ...newRole,
        },
      });
    } else {
      // 创建新角色
      createRoleMutation.mutate({
        name: newRole.name,
        description: newRole.description,
        isSystem: false,
        menuIds: [],
        permissionIds: [],
        type: "custom",
      });
    }
    setIsRoleDialogOpen(false);
  };

  // 切换功能权限
  const togglePermission = (permissionId: string) => {
    if (!selectedRole) return;

    // 确保 permissionIds 存在
    const currentPermissions = selectedRole.permissionIds || [];

    const updatedPermissions = currentPermissions.includes(permissionId)
      ? currentPermissions.filter((id) => id !== permissionId)
      : [...currentPermissions, permissionId];

    setSelectedRole({
      ...selectedRole,
      permissionIds: updatedPermissions,
    });
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
  const fieldPermissionsPerPage = 5; // 每页显示5个字段权限

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

  // 处理菜单选择变化
  const handleMenuSelectionChange = (selectedMenuIds: number[]) => {
    if (!selectedRole) return;

    setSelectedRole({
      ...selectedRole,
      menuIds: selectedMenuIds,
    });
  };

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
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyRole(role);
                                }}
                              >
                                复制
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteRole(role.id);
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
                        <CheckableTreeMenu
                          selectedItems={selectedRole?.menuIds || []}
                          onSelectionChange={handleMenuSelectionChange}
                        />
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
                        {selectedResource ? (
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
                                {loadingMenuPermissions ? (
                                  <div className="flex justify-center items-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                  </div>
                                ) : (
                                  <div>
                                    <div className="grid grid-cols-1 gap-2">
                                      {roleMenuPermissions.length > 0 ? (
                                        roleMenuPermissions.map((permission) => (
                                          <div key={permission} className="flex items-center space-x-2 p-3 border rounded-lg">
                                            <Checkbox
                                              id={permission}
                                              checked={true}
                                              disabled
                                            />
                                            <Label htmlFor={permission} className="text-sm">
                                              {permission}
                                            </Label>
                                          </div>
                                        ))
                                      ) : (
                                        <div className="text-center text-gray-500 py-4">
                                          该角色暂无菜单权限
                                        </div>
                                      )}
                                    </div>
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
                                <div>
                                  <div className="pt-4 border-t">
                                    {/* 直接显示当前字段权限配置情况 */}
                                    <div className="space-y-3">
                                      {getResourceFieldPermissions(
                                        selectedResource,
                                      ).length > 0 ? (
                                        <>
                                          {getCurrentPageFieldPermissions().map(
                                            (field) => (
                                              <div
                                                key={field.id}
                                                className="flex items-center justify-between p-3 border rounded-lg"
                                              >
                                                <div className="font-medium">
                                                  {field.name}
                                                </div>
                                                <div className="flex items-center space-x-4">
                                                  <div className="flex items-center">
                                                    <Checkbox
                                                      checked={field.view}
                                                      onCheckedChange={() =>
                                                        toggleFieldViewPermission(
                                                          field.id,
                                                        )
                                                      }
                                                    />
                                                    <span className="ml-2 text-sm">
                                                      查看
                                                    </span>
                                                  </div>
                                                  <div className="flex items-center">
                                                    <Checkbox
                                                      checked={field.edit}
                                                      onCheckedChange={() =>
                                                        toggleFieldEditPermission(
                                                          field.id,
                                                        )
                                                      }
                                                      disabled={!field.view}
                                                    />
                                                    <span className="ml-2 text-sm">
                                                      编辑
                                                    </span>
                                                  </div>
                                                </div>
                                              </div>
                                            ),
                                          )}
                                          {/* 分页控件 */}
                                          {getFieldPermissionTotalPages() >
                                            1 && (
                                            <div className="flex justify-between items-center mt-4">
                                              <div className="text-sm text-gray-500">
                                                第 {fieldPermissionPage} 页，共{" "}
                                                {getFieldPermissionTotalPages()}{" "}
                                                页
                                              </div>
                                              <div className="flex space-x-2">
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() =>
                                                    handleFieldPermissionPageChange(
                                                      Math.max(
                                                        1,
                                                        fieldPermissionPage - 1,
                                                      ),
                                                    )
                                                  }
                                                  disabled={
                                                    fieldPermissionPage === 1
                                                  }
                                                >
                                                  上一页
                                                </Button>
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() =>
                                                    handleFieldPermissionPageChange(
                                                      Math.min(
                                                        getFieldPermissionTotalPages(),
                                                        fieldPermissionPage + 1,
                                                      ),
                                                    )
                                                  }
                                                  disabled={
                                                    fieldPermissionPage ===
                                                    getFieldPermissionTotalPages()
                                                  }
                                                >
                                                  下一页
                                                </Button>
                                              </div>
                                            </div>
                                          )}
                                        </>
                                      ) : (
                                        <div className="text-center p-4 text-gray-500">
                                          该资源暂无字段权限配置
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </TabsContent>
                          </Tabs>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                            <Shield className="h-12 w-12 mb-4" />
                            <p>请选择一个功能模块查看权限配置</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedRole(null)}
                  >
                    取消
                  </Button>
                  <Button onClick={handleSavePermissions}>
                    <Save className="h-4 w-4 mr-2" />
                    保存修改
                  </Button>
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
            <DialogTitle>{selectedRole ? "编辑角色" : "新建角色"}</DialogTitle>
            <DialogDescription>
              {selectedRole ? "修改角色信息" : "创建一个新的角色"}
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
    </div>
  );
}
