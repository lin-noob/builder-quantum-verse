import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
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
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Checkbox 
} from "@/components/ui/checkbox";
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
  ChevronDown
} from "lucide-react";

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

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  fieldPermissions: Record<string, FieldPermission[]>;
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

// 模拟功能模块树状结构数据
const mockModules: Module[] = [
  {
    id: "ai_marketing",
    name: "AI营销",
    children: [
      { id: "ai_strategy", name: "AI策略", resource: "ai_strategies" },
      { id: "marketing_campaign", name: "营销活动", resource: "campaigns" }
    ]
  },
  {
    id: "data_analysis",
    name: "数据分析",
    children: [
      { id: "dashboard", name: "仪表盘", resource: "analytics" },
      { id: "reports", name: "报告", resource: "reports" }
    ]
  },
  {
    id: "system_management",
    name: "系统管理",
    children: [
      { id: "member_management", name: "成员管理", resource: "members" },
      { id: "organization_settings", name: "组织设置", resource: "organizations" },
      { id: "permission_management", name: "权限管理", resource: "permissions" }
    ]
  }
];

// 模拟权限数据
const mockPermissions: Permission[] = [
  // AI营销模块
  {
    id: "ai_strategy_view_list",
    name: "查看AI策略列表",
    description: "查看AI营销策略列表",
    category: "AI营销",
    resource: "ai_strategies",
    action: "read"
  },
  {
    id: "ai_strategy_view_detail",
    name: "查看AI策略详情",
    description: "查看AI营销策略详细信息",
    category: "AI营销",
    resource: "ai_strategies",
    action: "read"
  },
  {
    id: "ai_strategy_create",
    name: "创建AI策略",
    description: "创建新的AI营销策略",
    category: "AI营销",
    resource: "ai_strategies",
    action: "write"
  },
  {
    id: "ai_strategy_edit",
    name: "编辑AI策略",
    description: "编辑AI营销策略",
    category: "AI营销",
    resource: "ai_strategies",
    action: "write"
  },
  {
    id: "ai_strategy_delete",
    name: "删除AI策略",
    description: "删除AI营销策略",
    category: "AI营销",
    resource: "ai_strategies",
    action: "delete"
  },
  // 数据分析模块
  {
    id: "analytics_view_dashboard",
    name: "查看仪表盘",
    description: "查看数据分析仪表盘",
    category: "数据分析",
    resource: "analytics",
    action: "read"
  },
  {
    id: "analytics_export_report",
    name: "导出报告",
    description: "导出数据分析报告",
    category: "数据分析",
    resource: "analytics",
    action: "read"
  },
  // 系统管理模块
  {
    id: "member_view_list",
    name: "查看成员列表",
    description: "查看组织成员列表",
    category: "系统管理",
    resource: "members",
    action: "read"
  },
  {
    id: "member_edit",
    name: "编辑成员",
    description: "编辑组织成员信息",
    category: "系统管理",
    resource: "members",
    action: "write"
  },
  {
    id: "org_view_settings",
    name: "查看组织设置",
    description: "查看组织配置信息",
    category: "系统管理",
    resource: "organizations",
    action: "read"
  },
  {
    id: "org_edit_settings",
    name: "编辑组织设置",
    description: "编辑组织配置信息",
    category: "系统管理",
    resource: "organizations",
    action: "write"
  },
  {
    id: "permission_view_list",
    name: "查看权限列表",
    description: "查看权限配置列表",
    category: "系统管理",
    resource: "permissions",
    action: "read"
  },
  {
    id: "permission_edit",
    name: "编辑权限",
    description: "编辑权限配置",
    category: "系统管理",
    resource: "permissions",
    action: "write"
  }
];

const mockFieldPermissions: Record<string, FieldPermission[]> = {
  users: [
    { id: "fullName", name: "姓名", description: "用户姓名字段", view: true, edit: true },
    { id: "contactInfo", name: "联系方式", description: "用户联系方式字段", view: true, edit: true },
    { id: "companyName", name: "公司名称", description: "用户公司名称字段", view: true, edit: true },
    { id: "signTime", name: "注册时间", description: "用户注册时间字段", view: true, edit: false },
    { id: "totalOrders", name: "总消费金额", description: "用户总消费金额字段", view: true, edit: false },
    { id: "orderCount", name: "订单数量", description: "用户订单数量字段", view: true, edit: false },
    { id: "creditRating", name: "信用评级", description: "用户信用评级字段", view: false, edit: false }
  ],
  ai_strategies: [
    { id: "strategyName", name: "策略名称", description: "AI策略名称字段", view: true, edit: true },
    { id: "targetUsers", name: "目标用户", description: "AI策略目标用户字段", view: true, edit: true },
    { id: "executionTime", name: "执行时间", description: "AI策略执行时间字段", view: true, edit: false },
    { id: "budget", name: "预算", description: "AI策略预算字段", view: true, edit: true },
    { id: "expectedResults", name: "预期结果", description: "AI策略预期结果字段", view: true, edit: true },
    { id: "actualResults", name: "实际结果", description: "AI策略实际结果字段", view: true, edit: false }
  ],
  analytics: [
    { id: "reportName", name: "报告名称", description: "数据分析报告名称字段", view: true, edit: true },
    { id: "generatedTime", name: "生成时间", description: "报告生成时间字段", view: true, edit: false },
    { id: "dataRange", name: "数据范围", description: "报告数据范围字段", view: true, edit: true },
    { id: "metrics", name: "指标数据", description: "报告指标数据字段", view: true, edit: true }
  ]
};

const mockRoles: Role[] = [
  {
    id: "marketing_specialist",
    name: "营销专员",
    description: "负责执行AI营销策略的一线营销人员",
    permissions: ["user_view_list", "user_view_detail", "ai_strategy_view_list", "ai_strategy_view_detail"],
    fieldPermissions: {
      users: [
        { id: "fullName", name: "姓名", description: "用户姓名字段", view: true, edit: false },
        { id: "contactInfo", name: "联系方式", description: "用户联系方式字段", view: true, edit: false },
        { id: "companyName", name: "公司名称", description: "用户公司名称字段", view: true, edit: false },
        { id: "signTime", name: "注册时间", description: "用户注册时间字段", view: true, edit: false },
        { id: "totalOrders", name: "总消费金额", description: "用户总消费金额字段", view: false, edit: false },
        { id: "orderCount", name: "订单数量", description: "用户订单数量字段", view: false, edit: false },
        { id: "creditRating", name: "信用评级", description: "用户信用评级字段", view: false, edit: false }
      ],
      ai_strategies: mockFieldPermissions.ai_strategies,
      analytics: mockFieldPermissions.analytics
    }
  },
  {
    id: "marketing_manager",
    name: "营销经理",
    description: "负责制定和管理AI营销策略的管理人员",
    permissions: ["user_view_list", "user_view_detail", "user_edit", "ai_strategy_view_list", "ai_strategy_view_detail", "ai_strategy_create", "ai_strategy_edit"],
    fieldPermissions: {
      users: [
        { id: "fullName", name: "姓名", description: "用户姓名字段", view: true, edit: true },
        { id: "contactInfo", name: "联系方式", description: "用户联系方式字段", view: true, edit: true },
        { id: "companyName", name: "公司名称", description: "用户公司名称字段", view: true, edit: true },
        { id: "signTime", name: "注册时间", description: "用户注册时间字段", view: true, edit: true },
        { id: "totalOrders", name: "总消费金额", description: "用户总消费金额字段", view: true, edit: false },
        { id: "orderCount", name: "订单数量", description: "用户订单数量字段", view: true, edit: false },
        { id: "creditRating", name: "信用评级", description: "用户信用评级字段", view: true, edit: false }
      ],
      ai_strategies: mockFieldPermissions.ai_strategies,
      analytics: mockFieldPermissions.analytics
    }
  },
  {
    id: "data_analyst",
    name: "数据分析师",
    description: "专门负责数据分析和报告生成的人员",
    permissions: ["analytics_view_dashboard", "analytics_export_report", "user_view_list"],
    fieldPermissions: mockFieldPermissions
  }
];

const mockUsers: User[] = [
  { id: "1", name: "张三", email: "zhangsan@company.com", roles: ["marketing_specialist"] },
  { id: "2", name: "李四", email: "lisi@company.com", roles: ["marketing_manager"] },
  { id: "3", name: "王五", email: "wangwu@company.com", roles: ["data_analyst"] },
  { id: "4", name: "赵六", email: "zhaoliu@company.com", roles: ["marketing_specialist", "data_analyst"] }
];

export default function OrganizationGranularPermissionManagement() {
  // 状态管理
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [selectedRole, setSelectedRole] = useState<Role | null>(mockRoles[0]);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResource, setSelectedResource] = useState("ai_strategies");
  const [newRole, setNewRole] = useState({
    id: "",
    name: "",
    description: ""
  });
  
  // 添加折叠状态管理
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    "ai_marketing": true,
    "data_analysis": true,
    "system_management": true
  });

  // 获取功能分类
  const categories = Array.from(new Set(mockPermissions.map(p => p.category)));

  // 处理角色选择
  const handleSelectRole = (role: Role) => {
    setSelectedRole(role);
  };

  // 处理创建新角色
  const handleCreateRole = () => {
    setNewRole({
      id: "",
      name: "",
      description: ""
    });
    setSelectedRole(null);
    setIsRoleDialogOpen(true);
  };

  // 处理编辑角色
  const handleEditRole = (role: Role) => {
    setNewRole({
      id: role.id,
      name: role.name,
      description: role.description
    });
    setSelectedRole(role);
    setIsRoleDialogOpen(true);
  };

  // 处理复制角色
  const handleCopyRole = (role: Role) => {
    const copiedRole = {
      ...role,
      id: `copy_of_${role.id}`,
      name: `复制-${role.name}`
    };
    setRoles([...roles, copiedRole]);
  };

  // 处理删除角色
  const handleDeleteRole = (roleId: string) => {
    if (confirm("确定要删除这个角色吗？")) {
      setRoles(roles.filter(role => role.id !== roleId));
      if (selectedRole && selectedRole.id === roleId) {
        setSelectedRole(roles.length > 1 ? roles[0] : null);
      }
    }
  };

  // 保存角色
  const handleSaveRole = () => {
    if (selectedRole) {
      // 编辑现有角色
      setRoles(roles.map(role => 
        role.id === selectedRole.id ? {...selectedRole, ...newRole} : role
      ));
    } else {
      // 创建新角色
      const newRoleObj: Role = {
        id: newRole.name.toLowerCase().replace(/\s+/g, "_"),
        name: newRole.name,
        description: newRole.description,
        permissions: [],
        fieldPermissions: mockFieldPermissions
      };
      setRoles([...roles, newRoleObj]);
    }
    setIsRoleDialogOpen(false);
  };

  // 切换功能权限
  const togglePermission = (permissionId: string) => {
    if (!selectedRole) return;
    
    const updatedPermissions = selectedRole.permissions.includes(permissionId)
      ? selectedRole.permissions.filter(id => id !== permissionId)
      : [...selectedRole.permissions, permissionId];
      
    setSelectedRole({
      ...selectedRole,
      permissions: updatedPermissions
    });
  };

  // 打开字段权限配置
  const openFieldPermissionConfig = (resource: string) => {
    setSelectedResource(resource);
  };

  // 切换字段查看权限
  const toggleFieldViewPermission = (fieldId: string) => {
    if (!selectedRole) return;
    
    const updatedFieldPermissions = {...selectedRole.fieldPermissions};
    const resourceFields = updatedFieldPermissions[selectedResource] || [];
    const fieldIndex = resourceFields.findIndex(f => f.id === fieldId);
    
    if (fieldIndex !== -1) {
      const updatedField = {...resourceFields[fieldIndex], view: !resourceFields[fieldIndex].view};
      // 如果取消查看权限，也要取消编辑权限
      if (!updatedField.view) {
        updatedField.edit = false;
      }
      resourceFields[fieldIndex] = updatedField;
      updatedFieldPermissions[selectedResource] = resourceFields;
      
      setSelectedRole({
        ...selectedRole,
        fieldPermissions: updatedFieldPermissions
      });
    }
  };

  // 切换字段编辑权限
  const toggleFieldEditPermission = (fieldId: string) => {
    if (!selectedRole) return;
    
    const updatedFieldPermissions = {...selectedRole.fieldPermissions};
    const resourceFields = updatedFieldPermissions[selectedResource] || [];
    const fieldIndex = resourceFields.findIndex(f => f.id === fieldId);
    
    if (fieldIndex !== -1) {
      const updatedField = {...resourceFields[fieldIndex]};
      // 如果开启编辑权限，必须开启查看权限
      if (!updatedField.view) {
        updatedField.view = true;
      }
      updatedField.edit = !updatedField.edit;
      resourceFields[fieldIndex] = updatedField;
      updatedFieldPermissions[selectedResource] = resourceFields;
      
      setSelectedRole({
        ...selectedRole,
        fieldPermissions: updatedFieldPermissions
      });
    }
  };

  // 保存权限配置
  const handleSavePermissions = () => {
    if (selectedRole) {
      setRoles(roles.map(role => 
        role.id === selectedRole.id ? selectedRole : role
      ));
    }
  };

  // 为用户分配角色
  const handleAssignRole = (userId: string, roleId: string) => {
    setUsers(users.map(user => {
      if (user.id === userId) {
        const updatedRoles = user.roles.includes(roleId)
          ? user.roles.filter(id => id !== roleId)
          : [...user.roles, roleId];
        return {...user, roles: updatedRoles};
      }
      return user;
    }));
  };

  // 按类别分组权限
  const groupPermissionsByCategory = () => {
    if (!selectedRole) return {};
    
    const grouped: Record<string, Permission[]> = {};
    
    mockPermissions.forEach(permission => {
      if (!grouped[permission.category]) {
        grouped[permission.category] = [];
      }
      grouped[permission.category].push(permission);
    });
    
    return grouped;
  };

  const groupedPermissions = groupPermissionsByCategory();

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

  // 切换模块权限（一级菜单）
  const toggleModule = (moduleId: string) => {
    if (!selectedRole) return;
    
    // 获取该模块下的所有功能
    const module = mockModules.find(m => m.id === moduleId);
    if (!module || !module.children) return;
    
    const modulePermissions = module.children
      .filter(child => child.resource)
      .flatMap(child => 
        mockPermissions
          .filter(p => p.resource === child.resource)
          .map(p => p.id)
      );
    
    // 检查是否所有功能都已选中
    const allPermissionsSelected = modulePermissions.every(id => selectedRole.permissions.includes(id));
    
    let updatedPermissions;
    if (allPermissionsSelected) {
      // 如果所有功能都已选中，则取消选中所有功能
      updatedPermissions = selectedRole.permissions.filter(id => !modulePermissions.includes(id));
    } else {
      // 如果不是所有功能都已选中，则选中所有功能
      updatedPermissions = [...selectedRole.permissions];
      modulePermissions.forEach(id => {
        if (!updatedPermissions.includes(id)) {
          updatedPermissions.push(id);
        }
      });
    }
    
    setSelectedRole({
      ...selectedRole,
      permissions: updatedPermissions
    });
  };

  // 切换子模块权限
  const toggleSubModule = (resource: string) => {
    if (!selectedRole) return;
    
    // 获取该资源下的所有功能
    const resourcePermissions = mockPermissions
      .filter(p => p.resource === resource)
      .map(p => p.id);
    
    // 检查是否所有功能都已选中
    const allPermissionsSelected = resourcePermissions.every(id => selectedRole.permissions.includes(id));
    
    let updatedPermissions;
    if (allPermissionsSelected) {
      // 如果所有功能都已选中，则取消选中所有功能
      updatedPermissions = selectedRole.permissions.filter(id => !resourcePermissions.includes(id));
    } else {
      // 如果不是所有功能都已选中，则选中所有功能
      updatedPermissions = [...selectedRole.permissions];
      resourcePermissions.forEach(id => {
        if (!updatedPermissions.includes(id)) {
          updatedPermissions.push(id);
        }
      });
    }
    
    setSelectedRole({
      ...selectedRole,
      permissions: updatedPermissions
    });
  };

  // 检查模块是否全部选中
  const isModuleFullySelected = (moduleId: string) => {
    if (!selectedRole) return false;
    
    const module = mockModules.find(m => m.id === moduleId);
    if (!module || !module.children) return false;
    
    const modulePermissions = module.children
      .filter(child => child.resource)
      .flatMap(child => 
        mockPermissions
          .filter(p => p.resource === child.resource)
          .map(p => p.id)
      );
    
    return modulePermissions.every(id => selectedRole.permissions.includes(id));
  };

  // 检查模块是否部分选中
  const isModulePartiallySelected = (moduleId: string) => {
    if (!selectedRole) return false;
    
    const module = mockModules.find(m => m.id === moduleId);
    if (!module || !module.children) return false;
    
    const modulePermissions = module.children
      .filter(child => child.resource)
      .flatMap(child => 
        mockPermissions
          .filter(p => p.resource === child.resource)
          .map(p => p.id)
      );
    
    const selectedCount = modulePermissions.filter(id => selectedRole.permissions.includes(id)).length;
    return selectedCount > 0 && selectedCount < modulePermissions.length;
  };

  // 检查子模块是否全部选中
  const isSubModuleFullySelected = (resource: string) => {
    if (!selectedRole) return false;
    
    const resourcePermissions = mockPermissions
      .filter(p => p.resource === resource)
      .map(p => p.id);
    
    return resourcePermissions.every(id => selectedRole.permissions.includes(id));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
        </div>
      </div>

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
                {roles
                  .filter(role => 
                    role.name.toLowerCase().includes(searchTerm.toLowerCase())
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
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleEditRole(role);
                            }}>
                              编辑
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleCopyRole(role);
                            }}>
                              复制
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRole(role.id);
                            }}>
                              删除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                    </div>
                  ))}
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
                  {/* 左侧功能列表 */}
                  <div className="md:w-3/12">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">功能模块</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {mockModules.map((module) => (
                            <div key={module.id} className="border rounded-lg">
                              {/* 一级菜单 */}
                              <div 
                                className="flex items-center p-3 hover:bg-gray-50 rounded-t-lg cursor-pointer"
                                onClick={() => {
                                  // 切换折叠状态
                                  setExpandedModules(prev => ({
                                    ...prev,
                                    [module.id]: !prev[module.id]
                                  }));
                                }}
                              >
                                <Checkbox
                                  checked={isModuleFullySelected(module.id)}
                                  onCheckedChange={() => toggleModule(module.id)}
                                  className="mr-3"
                                />
                                <div className="flex-1 font-medium">{module.name}</div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // 切换折叠状态
                                    setExpandedModules(prev => ({
                                      ...prev,
                                      [module.id]: !prev[module.id]
                                    }));
                                  }}
                                >
                                  <ChevronDown
                                    className={cn(
                                      "h-4 w-4 transition-transform",
                                      expandedModules[module.id] ? "rotate-180" : ""
                                    )}
                                  />
                                </Button>
                              </div>
                              
                              {/* 二级菜单 */}
                              {module.children && module.children.length > 0 && expandedModules[module.id] && (
                                <div className="border-t">
                                  {module.children.map((child) => (
                                    <div 
                                      key={child.id} 
                                      className="flex items-center p-3 pl-8 hover:bg-gray-50 border-b last:border-b-0 cursor-pointer"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (child.resource) {
                                          setSelectedResource(child.resource);
                                          toggleSubModule(child.resource);
                                        }
                                      }}
                                    >
                                      <Checkbox
                                        checked={child.resource ? isSubModuleFullySelected(child.resource) : false}
                                        onCheckedChange={() => {
                                          if (child.resource) {
                                            toggleSubModule(child.resource);
                                          }
                                        }}
                                        className="mr-3"
                                      />
                                      <div className="flex-1">
                                        <div className="font-medium">{child.name}</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}

                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* 右侧权限配置 */}
                  <div className="md:w-9/12">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {categories.find(cat => mockPermissions.find(p => p.category === cat)?.resource === selectedResource) || "功能模块"}权限配置
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedResource ? (
                          <Tabs defaultValue="permissions" className="space-y-6">
                            <TabsList className="grid w-full grid-cols-2">
                              <TabsTrigger value="permissions">功能权限</TabsTrigger>
                              <TabsTrigger value="fieldPermissions">字段权限</TabsTrigger>
                            </TabsList>
                            
                            {/* 功能权限Tab */}
                            <TabsContent value="permissions" className="space-y-6">
                              <div className="space-y-4">
                                <div>
                                  <div className="grid grid-cols-1 gap-2">
                                    {mockPermissions
                                      .filter(p => p.resource === selectedResource)
                                      .map((permission) => (
                                        <div key={permission.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                                          <Checkbox
                                            id={permission.id}
                                            checked={selectedRole.permissions.includes(permission.id)}
                                            onCheckedChange={() => togglePermission(permission.id)}
                                          />
                                          <Label htmlFor={permission.id} className="text-sm">
                                            {permission.name}
                                          </Label>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              </div>
                            </TabsContent>
                            
                            {/* 字段权限Tab */}
                            <TabsContent value="fieldPermissions" className="space-y-6">
                              <div className="space-y-4">
                                <div>
                                  <div className="pt-4 border-t">
                                    {/* 直接显示当前字段权限配置情况 */}
                                    <div className="space-y-3">
                                      {getResourceFieldPermissions(selectedResource).length > 0 ? (
                                        <>
                                          {getCurrentPageFieldPermissions().map((field) => (
                                            <div key={field.id} className="flex items-center justify-between p-3 border rounded-lg">
                                              <div className="font-medium">{field.name}</div>
                                              <div className="flex items-center space-x-4">
                                                <div className="flex items-center">
                                                  <Checkbox
                                                    checked={field.view}
                                                    onCheckedChange={() => toggleFieldViewPermission(field.id)}
                                                  />
                                                  <span className="ml-2 text-sm">查看</span>
                                                </div>
                                                <div className="flex items-center">
                                                  <Checkbox
                                                    checked={field.edit}
                                                    onCheckedChange={() => toggleFieldEditPermission(field.id)}
                                                    disabled={!field.view}
                                                  />
                                                  <span className="ml-2 text-sm">编辑</span>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                          {/* 分页控件 */}
                                          {getFieldPermissionTotalPages() > 1 && (
                                            <div className="flex justify-between items-center mt-4">
                                              <div className="text-sm text-gray-500">
                                                第 {fieldPermissionPage} 页，共 {getFieldPermissionTotalPages()} 页
                                              </div>
                                              <div className="flex space-x-2">
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() => handleFieldPermissionPageChange(Math.max(1, fieldPermissionPage - 1))}
                                                  disabled={fieldPermissionPage === 1}
                                                >
                                                  上一页
                                                </Button>
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() => handleFieldPermissionPageChange(Math.min(getFieldPermissionTotalPages(), fieldPermissionPage + 1))}
                                                  disabled={fieldPermissionPage === getFieldPermissionTotalPages()}
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
                  <Button variant="outline" onClick={() => setSelectedRole(null)}>
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
                onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                placeholder="输入角色名称"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
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