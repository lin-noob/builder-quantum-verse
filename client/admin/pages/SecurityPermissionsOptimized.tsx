import React, { useState, useMemo, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Shield,
  Users,
  Plus,
  Edit,
  Trash2,
  Key,
  Eye,
  Settings,
  Lock,
  Unlock,
  UserCheck,
  Crown,
  User,
  Database,
  BarChart3,
  Brain,
  Target,
} from "lucide-react";

// 🎯 权限类型定义
export type Permission = {
  id: string;
  name: string;
  description: string;
  category: "user" | "ai" | "scenario" | "system" | "data";
  resource: string;
  action: "read" | "write" | "delete" | "execute";
};

// 🎯 角色类型定义
export type Role = {
  id: string;
  name: string;
  description: string;
  color: string;
  isSystem: boolean;
  permissions: string[];
  userCount: number;
  createdAt: string;
  updatedAt: string;
};

// 🎯 用户角色绑定类型
export type UserRole = {
  userId: string;
  userName: string;
  email: string;
  roles: string[];
  lastLogin: string;
  status: "active" | "inactive";
};

// 🚀 移到组件外部，避免重复创建 - 权限数据
const MOCK_PERMISSIONS: Permission[] = [
  // 用户管理权限
  {
    id: "user_read",
    name: "查看用户",
    description: "查看用户列表和详细信息",
    category: "user",
    resource: "users",
    action: "read",
  },
  {
    id: "user_write",
    name: "编辑用户",
    description: "创建和编辑用户信息",
    category: "user",
    resource: "users",
    action: "write",
  },
  {
    id: "user_delete",
    name: "删除用户",
    description: "删除用户账户",
    category: "user",
    resource: "users",
    action: "delete",
  },
  // AI模型管理权限
  {
    id: "ai_model_read",
    name: "查看AI模型",
    description: "查看AI模型配置和状态",
    category: "ai",
    resource: "ai_models",
    action: "read",
  },
  {
    id: "ai_model_write",
    name: "管理AI模型",
    description: "配置AI模型参数和设置",
    category: "ai",
    resource: "ai_models",
    action: "write",
  },
  {
    id: "ai_model_execute",
    name: "测试AI模型",
    description: "执行AI模型测试和调试",
    category: "ai",
    resource: "ai_models",
    action: "execute",
  },
  // 场景配置权限
  {
    id: "scenario_read",
    name: "查看营销场景",
    description: "查看营销场景配置",
    category: "scenario",
    resource: "scenarios",
    action: "read",
  },
  {
    id: "scenario_write",
    name: "配置营销场景",
    description: "编辑营销场景和规则",
    category: "scenario",
    resource: "scenarios",
    action: "write",
  },
  {
    id: "scenario_execute",
    name: "执行营销场景",
    description: "启用/禁用营销场景",
    category: "scenario",
    resource: "scenarios",
    action: "execute",
  },
  // 系统管理权限
  {
    id: "system_read",
    name: "查看系统配置",
    description: "查看系统设置和状态",
    category: "system",
    resource: "system",
    action: "read",
  },
  {
    id: "system_write",
    name: "管理系统配置",
    description: "修改系统设置和参数",
    category: "system",
    resource: "system",
    action: "write",
  },
  {
    id: "system_delete",
    name: "重置系统",
    description: "执行系统重置和维护操作",
    category: "system",
    resource: "system",
    action: "delete",
  },
  // 数据管理权限
  {
    id: "data_read",
    name: "查看数据",
    description: "查看业务数据和报表",
    category: "data",
    resource: "data",
    action: "read",
  },
  {
    id: "data_write",
    name: "管理数据",
    description: "导入导出数据",
    category: "data",
    resource: "data",
    action: "write",
  },
  {
    id: "data_delete",
    name: "删除数据",
    description: "删除业务数据",
    category: "data",
    resource: "data",
    action: "delete",
  },
];

// 🚀 移到组件外部，避免重复创建 - 角色数据
const MOCK_ROLES: Role[] = [
  {
    id: "super_admin",
    name: "超级管理员",
    description: "拥有系统所有权限，可以管理系统的所有功能和设置",
    color: "bg-red-100 text-red-800",
    isSystem: true,
    permissions: MOCK_PERMISSIONS.map((p) => p.id),
    userCount: 2,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "admin",
    name: "系统管理员",
    description: "拥有大部分系统权限，负责日常运营管理",
    color: "bg-blue-100 text-blue-800",
    isSystem: true,
    permissions: [
      "user_read", "user_write", "ai_model_read", "ai_model_write", "ai_model_execute",
      "scenario_read", "scenario_write", "scenario_execute", "system_read", "system_write",
      "data_read", "data_write",
    ],
    userCount: 5,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "operator",
    name: "运营人员",
    description: "负责AI营销场景的配置和日常运营",
    color: "bg-green-100 text-green-800",
    isSystem: false,
    permissions: ["user_read", "ai_model_read", "scenario_read", "scenario_write", "scenario_execute", "data_read"],
    userCount: 8,
    createdAt: "2024-01-05T09:00:00Z",
    updatedAt: "2024-01-20T14:15:00Z",
  },
  {
    id: "viewer",
    name: "只读用户",
    description: "只能查看系统信息，无法进行修改操作",
    color: "bg-gray-100 text-gray-800",
    isSystem: false,
    permissions: ["user_read", "ai_model_read", "scenario_read", "system_read", "data_read"],
    userCount: 12,
    createdAt: "2024-01-10T11:30:00Z",
    updatedAt: "2024-01-18T16:20:00Z",
  },
];

// 🚀 移到组件外部，避免重复创建 - 用户角色数据
const MOCK_USER_ROLES: UserRole[] = [
  {
    userId: "user_1", userName: "张三", email: "zhang.san@company.com",
    roles: ["super_admin"], lastLogin: "2024-01-20T08:30:00Z", status: "active",
  },
  {
    userId: "user_2", userName: "李四", email: "li.si@company.com",
    roles: ["admin"], lastLogin: "2024-01-20T09:15:00Z", status: "active",
  },
  {
    userId: "user_3", userName: "王五", email: "wang.wu@company.com",
    roles: ["operator"], lastLogin: "2024-01-19T17:45:00Z", status: "active",
  },
  {
    userId: "user_4", userName: "赵六", email: "zhao.liu@company.com",
    roles: ["viewer"], lastLogin: "2024-01-18T14:20:00Z", status: "inactive",
  },
];

// 🎯 图标组件缓存
const CategoryIcon = React.memo<{ category: Permission["category"] }>(({ category }) => {
  switch (category) {
    case "user": return <Users className="h-4 w-4" />;
    case "ai": return <Brain className="h-4 w-4" />;
    case "scenario": return <Target className="h-4 w-4" />;
    case "system": return <Settings className="h-4 w-4" />;
    case "data": return <Database className="h-4 w-4" />;
  }
});

const ActionIcon = React.memo<{ action: Permission["action"] }>(({ action }) => {
  switch (action) {
    case "read": return <Eye className="h-3 w-3" />;
    case "write": return <Edit className="h-3 w-3" />;
    case "delete": return <Trash2 className="h-3 w-3" />;
    case "execute": return <Settings className="h-3 w-3" />;
  }
});

const RoleIcon = React.memo<{ roleName: string }>(({ roleName }) => {
  if (roleName.includes("超级")) return <Crown className="h-4 w-4" />;
  if (roleName.includes("管理")) return <Shield className="h-4 w-4" />;
  return <User className="h-4 w-4" />;
});

// 🎯 优化的统计卡片组件
const StatsCard = React.memo<{
  title: string;
  value: number | string;
  description: string;
  icon: React.ReactNode;
}>(({ title, value, description, icon }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
));

// 🎯 优化的角色卡片组件
const RoleCard = React.memo<{
  role: Role;
  onEdit: (role: Role) => void;
  onDelete: (roleId: string) => void;
}>(({ role, onEdit, onDelete }) => (
  <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <RoleIcon roleName={role.name} />
        <span className="font-medium">{role.name}</span>
      </div>
      <Badge className={role.color}>
        {role.isSystem ? "系统" : "自定义"}
      </Badge>
    </div>

    <p className="text-sm text-gray-600 mb-3">{role.description}</p>

    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
      <span>权限数: {role.permissions.length}</span>
      <span>用户数: {role.userCount}</span>
    </div>

    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onEdit(role)}
        className="flex-1"
      >
        <Edit className="h-3 w-3 mr-1" />
        编辑
      </Button>
      {!role.isSystem && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(role.id)}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      )}
    </div>
  </div>
));

// 🚀 主组件 - 性能优化版本
const SecurityPermissionsOptimized: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>(MOCK_ROLES);
  const [userRoles, setUserRoles] = useState<UserRole[]>(MOCK_USER_ROLES);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isUserRoleDialogOpen, setIsUserRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRole | null>(null);
  const [currentRolePage, setCurrentRolePage] = useState(1);
  const [currentUserPage, setCurrentUserPage] = useState(1);

  const rolesPerPage = 6;
  const usersPerPage = 8;

  // 🎯 使���useMemo优化统计计算
  const stats = useMemo(() => {
    const totalRoles = roles.length;
    const customRoles = roles.filter((r) => !r.isSystem).length;
    const totalUsers = userRoles.length;
    const activeUsers = userRoles.filter((u) => u.status === "active").length;

    return {
      totalRoles,
      customRoles,
      totalUsers,
      activeUsers,
      activeRate: Math.round((activeUsers / totalUsers) * 100),
    };
  }, [roles, userRoles]);

  // 🎯 使用useMemo优化分页计算
  const paginatedRoles = useMemo(() => {
    const totalPages = Math.ceil(roles.length / rolesPerPage);
    const startIndex = (currentRolePage - 1) * rolesPerPage;
    const endIndex = startIndex + rolesPerPage;
    return {
      roles: roles.slice(startIndex, endIndex),
      totalPages,
      startIndex,
      endIndex: Math.min(endIndex, roles.length),
    };
  }, [roles, currentRolePage, rolesPerPage]);

  const paginatedUsers = useMemo(() => {
    const totalPages = Math.ceil(userRoles.length / usersPerPage);
    const startIndex = (currentUserPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    return {
      users: userRoles.slice(startIndex, endIndex),
      totalPages,
      startIndex,
      endIndex: Math.min(endIndex, userRoles.length),
    };
  }, [userRoles, currentUserPage, usersPerPage]);

  // 🎯 使用useMemo优化权限分组
  const groupedPermissions = useMemo(() => {
    return MOCK_PERMISSIONS.reduce((acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);
  }, []);

  // 🎯 使用useCallback优化事件处理
  const handleCreateRole = useCallback(() => {
    setSelectedRole(null);
    setIsRoleDialogOpen(true);
  }, []);

  const handleEditRole = useCallback((role: Role) => {
    setSelectedRole(role);
    setIsRoleDialogOpen(true);
  }, []);

  const handleDeleteRole = useCallback((roleId: string) => {
    const role = roles.find((r) => r.id === roleId);
    if (role?.isSystem) {
      alert("系统角色不能删除");
      return;
    }
    if (confirm("确定要删除这个角色吗？")) {
      setRoles((prev) => prev.filter((r) => r.id !== roleId));
    }
  }, [roles]);

  const handleEditUserRoles = useCallback((user: UserRole) => {
    setSelectedUser(user);
    setIsUserRoleDialogOpen(true);
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* 创建角色按钮 */}
      <div className="flex justify-end">
        <Button onClick={handleCreateRole} variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          创建角色
        </Button>
      </div>

      {/* 🚀 优化的统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="总角色数"
          value={stats.totalRoles}
          description={`其中 ${stats.customRoles} 个自定义角色`}
          icon={<Shield className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="权限项目"
          value={MOCK_PERMISSIONS.length}
          description="覆盖 5 个功能模块"
          icon={<Key className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="用户总数"
          value={stats.totalUsers}
          description={`${stats.activeUsers} 个活跃用户`}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="活跃率"
          value={`${stats.activeRate}%`}
          description="用户活跃度"
          icon={<UserCheck className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <Tabs defaultValue="roles" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="roles">角色管理</TabsTrigger>
          <TabsTrigger value="permissions">权限矩阵</TabsTrigger>
          <TabsTrigger value="users">用户权限</TabsTrigger>
        </TabsList>

        {/* 🎯 角色管理Tab - 优化版本 */}
        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>系统角色</CardTitle>
              <CardDescription>管理系统角色定义和权限配置</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedRoles.roles.map((role) => (
                  <RoleCard
                    key={role.id}
                    role={role}
                    onEdit={handleEditRole}
                    onDelete={handleDeleteRole}
                  />
                ))}
              </div>

              {/* 分页控制 */}
              {paginatedRoles.totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t">
                  <div className="text-sm text-gray-700 order-2 sm:order-1">
                    正在显示 {paginatedRoles.startIndex + 1} - {paginatedRoles.endIndex} 条，共 {roles.length} 条
                  </div>
                  <div className="flex items-center gap-2 order-1 sm:order-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentRolePage((prev) => Math.max(1, prev - 1))}
                      disabled={currentRolePage === 1}
                    >
                      上一页
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentRolePage((prev) => Math.min(paginatedRoles.totalPages, prev + 1))}
                      disabled={currentRolePage === paginatedRoles.totalPages}
                    >
                      下一页
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 权限矩阵Tab */}
        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>权限矩阵</CardTitle>
              <CardDescription>查看角色和权限的对应关系</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="text-left p-3 border-b font-medium">权限</th>
                      {roles.map((role) => (
                        <th key={role.id} className="text-center p-3 border-b font-medium min-w-[120px]">
                          <div className="flex flex-col items-center gap-1">
                            <RoleIcon roleName={role.name} />
                            <span className="text-xs">{role.name}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                      <React.Fragment key={category}>
                        <tr>
                          <td colSpan={roles.length + 1} className="p-3 bg-gray-50 font-medium text-sm">
                            <div className="flex items-center gap-2">
                              <CategoryIcon category={category as Permission["category"]} />
                              {category === "user" && "用户管理"}
                              {category === "ai" && "AI模型"}
                              {category === "scenario" && "营销场景"}
                              {category === "system" && "系统管���"}
                              {category === "data" && "数据管理"}
                            </div>
                          </td>
                        </tr>
                        {categoryPermissions.map((permission) => (
                          <tr key={permission.id} className="hover:bg-gray-50">
                            <td className="p-3 border-b">
                              <div className="flex items-center gap-2">
                                <ActionIcon action={permission.action} />
                                <div>
                                  <div className="font-medium text-sm">{permission.name}</div>
                                  <div className="text-xs text-gray-500">{permission.description}</div>
                                </div>
                              </div>
                            </td>
                            {roles.map((role) => (
                              <td key={`${role.id}-${permission.id}`} className="p-3 border-b text-center">
                                {role.permissions.includes(permission.id) ? (
                                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                                    <Eye className="h-3 w-3 text-white" />
                                  </div>
                                ) : (
                                  <div className="w-6 h-6 bg-gray-200 rounded-full mx-auto"></div>
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 用户权限Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>用户权限分配</CardTitle>
              <CardDescription>管理用户的角色分配和权限</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>用户</TableHead>
                    <TableHead>角色</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>最后登录</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.users.map((user) => (
                    <TableRow key={user.userId}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.userName}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((roleId) => {
                            const role = roles.find((r) => r.id === roleId);
                            return role ? (
                              <Badge key={roleId} className={role.color}>
                                {role.name}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.status === "active" ? (
                          <Badge className="bg-green-100 text-green-800">
                            <Unlock className="h-3 w-3 mr-1" />
                            正常
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-800">
                            <Lock className="h-3 w-3 mr-1" />
                            禁用
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(user.lastLogin).toLocaleDateString("zh-CN")}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditUserRoles(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* 用户分页控制 */}
              {paginatedUsers.totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t">
                  <div className="text-sm text-gray-700 order-2 sm:order-1">
                    正在显示 {paginatedUsers.startIndex + 1} - {paginatedUsers.endIndex} 条，共 {userRoles.length} 条
                  </div>
                  <div className="flex items-center gap-2 order-1 sm:order-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentUserPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentUserPage === 1}
                    >
                      上一页
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentUserPage((prev) => Math.min(paginatedUsers.totalPages, prev + 1))}
                      disabled={currentUserPage === paginatedUsers.totalPages}
                    >
                      下一页
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// 🚀 使用React.memo优化组件重渲染
export default React.memo(SecurityPermissionsOptimized);
