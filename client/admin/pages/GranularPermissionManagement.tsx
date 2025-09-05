import React, { useState, useMemo } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  Copy,
  Search,
  Filter,
  Save,
  X,
  Check,
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

// 🎯 字段权限类型定义
export type FieldPermission = {
  id: string;
  fieldName: string;
  fieldDescription: string;
  canView: boolean;
  canEdit: boolean;
};

// 🎯 角色类型定义
export type Role = {
  id: string;
  name: string;
  description: string;
  color: string;
  isSystem: boolean;
  permissions: string[]; // 功能权限ID列表
  fieldPermissions: Record<string, FieldPermission[]>; // 按资源分组的字段权限
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

// 🚀 模拟权限数据
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

// 🚀 模拟字段权限数据
const MOCK_FIELD_PERMISSIONS: Record<string, FieldPermission[]> = {
  users: [
    {
      id: "user_field_1",
      fieldName: "fullName",
      fieldDescription: "用户姓名",
      canView: true,
      canEdit: true,
    },
    {
      id: "user_field_2",
      fieldName: "contactInfo",
      fieldDescription: "联系方式",
      canView: true,
      canEdit: true,
    },
    {
      id: "user_field_3",
      fieldName: "companyName",
      fieldDescription: "公司名称",
      canView: true,
      canEdit: true,
    },
    {
      id: "user_field_4",
      fieldName: "totalOrders",
      fieldDescription: "总消费金额",
      canView: true,
      canEdit: false,
    },
    {
      id: "user_field_5",
      fieldName: "orderCount",
      fieldDescription: "订单数量",
      canView: true,
      canEdit: false,
    },
    {
      id: "user_field_6",
      fieldName: "loginDate",
      fieldDescription: "最后登录时间",
      canView: true,
      canEdit: false,
    },
    {
      id: "user_field_7",
      fieldName: "location",
      fieldDescription: "地址",
      canView: true,
      canEdit: true,
    },
    {
      id: "user_field_8",
      fieldName: "tags",
      fieldDescription: "用户标签",
      canView: true,
      canEdit: true,
    },
  ],
  ai_models: [
    {
      id: "ai_field_1",
      fieldName: "modelName",
      fieldDescription: "模型名称",
      canView: true,
      canEdit: true,
    },
    {
      id: "ai_field_2",
      fieldName: "modelDescription",
      fieldDescription: "模型描述",
      canView: true,
      canEdit: true,
    },
    {
      id: "ai_field_3",
      fieldName: "modelStatus",
      fieldDescription: "模型状态",
      canView: true,
      canEdit: true,
    },
    {
      id: "ai_field_4",
      fieldName: "modelParameters",
      fieldDescription: "模型参数",
      canView: true,
      canEdit: true,
    },
  ],
};

// 🚀 模拟角色数据
const MOCK_ROLES: Role[] = [
  {
    id: "super_admin",
    name: "超级管理员",
    description: "拥有系统所有权限，可以管理系统的所有功能和设置",
    color: "bg-red-100 text-red-800",
    isSystem: true,
    permissions: MOCK_PERMISSIONS.map((p) => p.id),
    fieldPermissions: MOCK_FIELD_PERMISSIONS,
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
    fieldPermissions: {
      users: MOCK_FIELD_PERMISSIONS.users.map(field => ({
        ...field,
        canEdit: field.fieldName !== "totalOrders" && field.fieldName !== "orderCount"
      })),
      ai_models: MOCK_FIELD_PERMISSIONS.ai_models
    },
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
    fieldPermissions: {
      users: MOCK_FIELD_PERMISSIONS.users.map(field => ({
        ...field,
        canEdit: false
      })),
      ai_models: MOCK_FIELD_PERMISSIONS.ai_models.map(field => ({
        ...field,
        canEdit: field.fieldName !== "modelParameters"
      }))
    },
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
    fieldPermissions: {
      users: MOCK_FIELD_PERMISSIONS.users.map(field => ({
        ...field,
        canView: true,
        canEdit: false
      })),
      ai_models: MOCK_FIELD_PERMISSIONS.ai_models.map(field => ({
        ...field,
        canView: true,
        canEdit: false
      }))
    },
    userCount: 12,
    createdAt: "2024-01-10T11:30:00Z",
    updatedAt: "2024-01-18T16:20:00Z",
  },
];

// 🚀 模拟用户角色数据
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

// 🎯 图标组件
const CategoryIcon = ({ category }: { category: Permission["category"] }) => {
  switch (category) {
    case "user": return <Users className="h-4 w-4" />;
    case "ai": return <Brain className="h-4 w-4" />;
    case "scenario": return <Target className="h-4 w-4" />;
    case "system": return <Settings className="h-4 w-4" />;
    case "data": return <Database className="h-4 w-4" />;
    default: return <Key className="h-4 w-4" />;
  }
};

const ActionIcon = ({ action }: { action: Permission["action"] }) => {
  switch (action) {
    case "read": return <Eye className="h-3 w-3" />;
    case "write": return <Edit className="h-3 w-3" />;
    case "delete": return <Trash2 className="h-3 w-3" />;
    case "execute": return <Settings className="h-3 w-3" />;
    default: return <Key className="h-3 w-3" />;
  }
};

const RoleIcon = ({ roleName }: { roleName: string }) => {
  if (roleName.includes("超级")) return <Crown className="h-4 w-4" />;
  if (roleName.includes("管理")) return <Shield className="h-4 w-4" />;
  return <User className="h-4 w-4" />;
};

// 🎯 统计卡片组件
const StatsCard = ({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: number | string;
  description: string;
  icon: React.ReactNode;
}) => (
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
);

// 🎯 角色卡片组件
const RoleCard = ({
  role,
  onEdit,
  onDelete,
  onCopy,
}: {
  role: Role;
  onEdit: (role: Role) => void;
  onDelete: (roleId: string) => void;
  onCopy: (role: Role) => void;
}) => (
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
      <span>功能权限: {role.permissions.length}</span>
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
      <Button
        variant="outline"
        size="sm"
        onClick={() => onCopy(role)}
      >
        <Copy className="h-3 w-3" />
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
);

// 🎯 字段权限配置模态框
const FieldPermissionModal = ({
  isOpen,
  onClose,
  resource,
  fieldPermissions,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  resource: string;
  fieldPermissions: FieldPermission[];
  onSave: (permissions: FieldPermission[]) => void;
}) => {
  const [localPermissions, setLocalPermissions] = useState<FieldPermission[]>(fieldPermissions);

  const handleViewChange = (fieldId: string, checked: boolean) => {
    setLocalPermissions(prev => 
      prev.map(field => 
        field.id === fieldId 
          ? { 
              ...field, 
              canView: checked,
              // 如果取消查看权限，则也取消编辑权限
              canEdit: checked ? field.canEdit : false
            } 
          : field
      )
    );
  };

  const handleEditChange = (fieldId: string, checked: boolean) => {
    setLocalPermissions(prev => 
      prev.map(field => 
        field.id === fieldId 
          ? { 
              ...field, 
              canEdit: checked,
              // 如果授予编辑权限，则也授予查看权限
              canView: checked ? true : field.canView
            } 
          : field
      )
    );
  };

  const handleSave = () => {
    onSave(localPermissions);
    onClose();
  };

  const handleCancel = () => {
    setLocalPermissions(fieldPermissions);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>字段权限配置</DialogTitle>
          <DialogDescription>
            配置 {resource} 资源的字段级权限
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between bg-gray-100 p-2 rounded">
            <div className="w-1/2 font-medium">字段名称</div>
            <div className="w-1/4 text-center font-medium">查看权限</div>
            <div className="w-1/4 text-center font-medium">编辑权限</div>
          </div>

          {localPermissions.map((field) => (
            <div key={field.id} className="flex items-center justify-between p-2 border-b">
              <div className="w-1/2">
                <div className="font-medium">{field.fieldName}</div>
                <div className="text-sm text-gray-500">{field.fieldDescription}</div>
              </div>
              <div className="w-1/4 flex justify-center">
                <Checkbox
                  checked={field.canView}
                  onCheckedChange={(checked) => handleViewChange(field.id, checked as boolean)}
                />
              </div>
              <div className="w-1/4 flex justify-center">
                <Checkbox
                  checked={field.canEdit}
                  disabled={!field.canView}
                  onCheckedChange={(checked) => handleEditChange(field.id, checked as boolean)}
                />
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            <X className="h-4 w-4 mr-2" />
            取消
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// 🚀 主组件 - 精细化权限管理系统
const GranularPermissionManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>(MOCK_ROLES);
  const [userRoles, setUserRoles] = useState<UserRole[]>(MOCK_USER_ROLES);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isFieldPermissionModalOpen, setIsFieldPermissionModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<UserRole | null>(null);
  const [isUserRoleDialogOpen, setIsUserRoleDialogOpen] = useState(false);
  const [currentRolePage, setCurrentRolePage] = useState(1);
  const [currentUserPage, setCurrentUserPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const rolesPerPage = 6;
  const usersPerPage = 8;

  // 🎯 统计数据
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

  // 🎯 分页角色数据
  const paginatedRoles = useMemo(() => {
    // 先筛选
    let filteredRoles = roles;
    if (searchTerm) {
      filteredRoles = roles.filter(role => 
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    const totalPages = Math.ceil(filteredRoles.length / rolesPerPage);
    const startIndex = (currentRolePage - 1) * rolesPerPage;
    const endIndex = startIndex + rolesPerPage;
    return {
      roles: filteredRoles.slice(startIndex, endIndex),
      totalPages,
      startIndex,
      endIndex: Math.min(endIndex, filteredRoles.length),
      total: filteredRoles.length,
    };
  }, [roles, currentRolePage, rolesPerPage, searchTerm]);

  // 🎯 分页用户数据
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

  // 🎯 按类别分组的权限
  const groupedPermissions = useMemo(() => {
    let filteredPermissions = MOCK_PERMISSIONS;
    
    if (categoryFilter !== "all") {
      filteredPermissions = MOCK_PERMISSIONS.filter(
        (p) => p.category === categoryFilter
      );
    }
    
    if (searchTerm) {
      filteredPermissions = filteredPermissions.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filteredPermissions.reduce((acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);
  }, [categoryFilter, searchTerm]);

  // 🎯 处理创建角色
  const handleCreateRole = () => {
    setSelectedRole(null);
    setIsRoleDialogOpen(true);
  };

  // 🎯 处理编辑角色
  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setIsRoleDialogOpen(true);
  };

  // 🎯 处理删除角色
  const handleDeleteRole = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId);
    if (role?.isSystem) {
      alert("系统角色不能删除");
      return;
    }
    if (confirm("确定要删除这个角色吗？")) {
      setRoles((prev) => prev.filter((r) => r.id !== roleId));
    }
  };

  // 🎯 处理复制角色
  const handleCopyRole = (role: Role) => {
    const newRole: Role = {
      ...role,
      id: `role_${Date.now()}`,
      name: `${role.name} (副本)`,
      isSystem: false,
      userCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setRoles((prev) => [...prev, newRole]);
  };

  // 🎯 处理编辑用户角色
  const handleEditUserRoles = (user: UserRole) => {
    setSelectedUser(user);
    setIsUserRoleDialogOpen(true);
  };

  // 🎯 处理保存角色
  const handleSaveRole = (role: Role) => {
    if (selectedRole) {
      // 编辑现有角色
      setRoles((prev) =>
        prev.map((r) => (r.id === role.id ? role : r))
      );
    } else {
      // 创建新角色
      const newRole: Role = {
        ...role,
        id: `role_${Date.now()}`,
        isSystem: false,
        userCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setRoles((prev) => [...prev, newRole]);
    }
    setIsRoleDialogOpen(false);
  };

  // 🎯 处理打开字段权限配置
  const handleOpenFieldPermission = (resource: string) => {
    setSelectedResource(resource);
    setIsFieldPermissionModalOpen(true);
  };

  // 🎯 处理保存字段权限
  const handleSaveFieldPermissions = (permissions: FieldPermission[]) => {
    if (selectedRole && selectedResource) {
      const updatedRole = {
        ...selectedRole,
        fieldPermissions: {
          ...selectedRole.fieldPermissions,
          [selectedResource]: permissions,
        },
        updatedAt: new Date().toISOString(),
      };
      setSelectedRole(updatedRole);
    }
  };

  // 🎯 处理权限变更
  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    if (selectedRole) {
      const updatedPermissions = checked
        ? [...selectedRole.permissions, permissionId]
        : selectedRole.permissions.filter((id) => id !== permissionId);
      
      setSelectedRole({
        ...selectedRole,
        permissions: updatedPermissions,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  // 🎯 获取资源的字段权限
  const getResourceFieldPermissions = (resource: string) => {
    if (selectedRole) {
      return selectedRole.fieldPermissions[resource] || [];
    }
    return [];
  };

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold">精细化权限管理系统</h1>
        <p className="text-gray-500 mt-2">
          管理系统角色、功能权限和字段级权限配置
        </p>
      </div>

      {/* 创建角色按钮 */}
      <div className="flex justify-end">
        <Button onClick={handleCreateRole} variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          创建角色
        </Button>
      </div>

      {/* 统计概览 */}
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="roles">角色管理</TabsTrigger>
          <TabsTrigger value="permissions">功能权限</TabsTrigger>
          <TabsTrigger value="fieldPermissions">字段权限</TabsTrigger>
          <TabsTrigger value="users">用户权限</TabsTrigger>
        </TabsList>

        {/* 🎯 角色管理Tab */}
        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>系统角色</CardTitle>
              <CardDescription>管理系统角色定义和权限配置</CardDescription>
            </CardHeader>
            <CardContent>
              {/* 搜索和筛选 */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索角色名称或描述..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentRolePage(1);
                    }}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedRoles.roles.map((role) => (
                  <RoleCard
                    key={role.id}
                    role={role}
                    onEdit={handleEditRole}
                    onDelete={handleDeleteRole}
                    onCopy={handleCopyRole}
                  />
                ))}
              </div>

              {/* 分页控制 */}
              {paginatedRoles.totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t">
                  <div className="text-sm text-gray-700 order-2 sm:order-1">
                    正在显示 {paginatedRoles.startIndex + 1} - {paginatedRoles.endIndex} 条，
                    共 {paginatedRoles.total} 条
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

        {/* 功能权限Tab */}
        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>功能权限配置</CardTitle>
              <CardDescription>按业务模块配置功能权限</CardDescription>
            </CardHeader>
            <CardContent>
              {/* 搜索和筛选 */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索权限名称或描述..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="全部模块" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部模块</SelectItem>
                    <SelectItem value="user">用户管理</SelectItem>
                    <SelectItem value="ai">AI模型</SelectItem>
                    <SelectItem value="scenario">营销场景</SelectItem>
                    <SelectItem value="system">系统管理</SelectItem>
                    <SelectItem value="data">数据管理</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 权限配置面板 */}
              <Accordion type="multiple" className="w-full">
                {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                  <AccordionItem value={category} key={category}>
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <CategoryIcon category={category as Permission["category"]} />
                        {category === "user" && "用户管理"}
                        {category === "ai" && "AI模型"}
                        {category === "scenario" && "营销场景"}
                        {category === "system" && "系统管理"}
                        {category === "data" && "数据管理"}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 p-2">
                        {categoryPermissions.map((permission) => (
                          <div key={permission.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <ActionIcon action={permission.action} />
                              <div>
                                <div className="font-medium">{permission.name}</div>
                                <div className="text-sm text-gray-500">{permission.description}</div>
                              </div>
                            </div>
                            <Switch
                              checked={selectedRole?.permissions.includes(permission.id) || false}
                              onCheckedChange={(checked) => handlePermissionChange(permission.id, checked)}
                              disabled={!selectedRole}
                            />
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 字段权限Tab */}
        <TabsContent value="fieldPermissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>字段权限配置</CardTitle>
              <CardDescription>配置资源字段的查看和编辑权限</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>用户资源字段权限</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium">用户基本信息</div>
                            <div className="text-sm text-gray-500">姓名、联系方式等基本信息</div>
                          </div>
                          <Button 
                            onClick={() => handleOpenFieldPermission("users")}
                            disabled={!selectedRole}
                          >
                            配置字段权限
                          </Button>
                        </div>
                        
                        {selectedRole && (
                          <div className="text-sm text-gray-500">
                            <div>已配置字段权限：</div>
                            <div className="mt-2">
                              {getResourceFieldPermissions("users").filter(f => f.canView).length} 个字段可查看，
                              {getResourceFieldPermissions("users").filter(f => f.canEdit).length} 个字段可编辑
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>AI模型字段权限</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium">AI模型配置</div>
                            <div className="text-sm text-gray-500">模型名称、参数等配置信息</div>
                          </div>
                          <Button 
                            onClick={() => handleOpenFieldPermission("ai_models")}
                            disabled={!selectedRole}
                          >
                            配置字段权限
                          </Button>
                        </div>
                        
                        {selectedRole && (
                          <div className="text-sm text-gray-500">
                            <div>已配置字段权限：</div>
                            <div className="mt-2">
                              {getResourceFieldPermissions("ai_models").filter(f => f.canView).length} 个字段可查看，
                              {getResourceFieldPermissions("ai_models").filter(f => f.canEdit).length} 个字段可编辑
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {!selectedRole && (
                  <div className="text-center p-8 bg-yellow-50 rounded-lg">
                    <Shield className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">请选择角色以配置字段权限</h3>
                    <p className="text-gray-500">
                      在"角色管理"标签页中选择一个角色，然后返回此页面配置字段权限
                    </p>
                  </div>
                )}
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

      {/* 角色编辑对话框 */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedRole ? "编辑角色" : "创建角色"}
            </DialogTitle>
            <DialogDescription>
              {selectedRole ? "修改现有角色的配置" : "创建一个新的系统角色"}
            </DialogDescription>
          </DialogHeader>

          {selectedRole && (
            <div className="space-y-6 py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>角色名称 *</Label>
                  <Input
                    value={selectedRole.name}
                    onChange={(e) =>
                      setSelectedRole({
                        ...selectedRole,
                        name: e.target.value,
                        updatedAt: new Date().toISOString(),
                      })
                    }
                    placeholder="输入角色名称"
                  />
                </div>
                <div className="space-y-2">
                  <Label>角色描述</Label>
                  <Textarea
                    value={selectedRole.description}
                    onChange={(e) =>
                      setSelectedRole({
                        ...selectedRole,
                        description: e.target.value,
                        updatedAt: new Date().toISOString(),
                      })
                    }
                    placeholder="描述角色的职责和权限范围"
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-4">功能权限</h3>
                <p className="text-sm text-gray-500 mb-4">
                  选择该角色可以访问的功能权限
                </p>
                
                <Accordion type="multiple" className="w-full">
                  {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                    <AccordionItem value={category} key={category}>
                      <AccordionTrigger>
                        <div className="flex items-center gap-2">
                          <CategoryIcon category={category as Permission["category"]} />
                          {category === "user" && "用户管理"}
                          {category === "ai" && "AI模型"}
                          {category === "scenario" && "营销场景"}
                          {category === "system" && "系统管理"}
                          {category === "data" && "数据管理"}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 p-2">
                          {categoryPermissions.map((permission) => (
                            <div key={permission.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <ActionIcon action={permission.action} />
                                <div>
                                  <div className="font-medium">{permission.name}</div>
                                  <div className="text-sm text-gray-500">{permission.description}</div>
                                </div>
                              </div>
                              <Switch
                                checked={selectedRole.permissions.includes(permission.id)}
                                onCheckedChange={(checked) => handlePermissionChange(permission.id, checked)}
                              />
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRoleDialogOpen(false)}
            >
              <X className="h-4 w-4 mr-2" />
              取消
            </Button>
            <Button
              onClick={() => selectedRole && handleSaveRole(selectedRole)}
              disabled={!selectedRole || !selectedRole.name.trim()}
            >
              <Save className="h-4 w-4 mr-2" />
              保存角色
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 字段权限配置模态框 */}
      <FieldPermissionModal
        isOpen={isFieldPermissionModalOpen}
        onClose={() => setIsFieldPermissionModalOpen(false)}
        resource={selectedResource}
        fieldPermissions={getResourceFieldPermissions(selectedResource)}
        onSave={handleSaveFieldPermissions}
      />

      {/* 用户角色分配对话框 */}
      <Dialog open={isUserRoleDialogOpen} onOpenChange={setIsUserRoleDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>分配角色</DialogTitle>
            <DialogDescription>
              为 {selectedUser?.userName} 分配角色
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="space-y-3">
                <Label>选择角色</Label>
                {roles.map((role) => (
                  <div key={role.id} className="flex items-center space-x-2">
                    <Checkbox
                      checked={selectedUser.roles.includes(role.id)}
                      onCheckedChange={(checked) => {
                        setSelectedUser((prev) => {
                          if (!prev) return prev;
                          const newRoles = checked
                            ? [...prev.roles, role.id]
                            : prev.roles.filter((r) => r !== role.id);
                          return {
                            ...prev,
                            roles: newRoles,
                          };
                        });
                      }}
                    />
                    <div className="flex items-center gap-2">
                      <RoleIcon roleName={role.name} />
                      <Label className="cursor-pointer">{role.name}</Label>
                      <Badge className={role.color} variant="outline">
                        {role.isSystem ? "系统" : "自定义"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUserRoleDialogOpen(false)}
            >
              <X className="h-4 w-4 mr-2" />
              取消
            </Button>
            <Button
              onClick={() => {
                if (selectedUser) {
                  setUserRoles((prev) =>
                    prev.map((u) =>
                      u.userId === selectedUser.userId ? selectedUser : u
                    )
                  );
                  setIsUserRoleDialogOpen(false);
                }
              }}
            >
              <Check className="h-4 w-4 mr-2" />
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GranularPermissionManagement;