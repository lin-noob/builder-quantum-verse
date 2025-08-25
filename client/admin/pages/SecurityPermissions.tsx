import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
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
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';

// 权限类型定义
export type Permission = {
  id: string;
  name: string;
  description: string;
  category: 'user' | 'ai' | 'scenario' | 'system' | 'data';
  resource: string;
  action: 'read' | 'write' | 'delete' | 'execute';
};

// 角���类型定义
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

// 用户角色绑定类型
export type UserRole = {
  userId: string;
  userName: string;
  email: string;
  roles: string[];
  lastLogin: string;
  status: 'active' | 'inactive';
};

// 模拟权限数据
const mockPermissions: Permission[] = [
  // 用户管理权限
  { id: 'user_read', name: '查看用户', description: '查看用户列表和详细信息', category: 'user', resource: 'users', action: 'read' },
  { id: 'user_write', name: '编辑用户', description: '创建和编辑用户信息', category: 'user', resource: 'users', action: 'write' },
  { id: 'user_delete', name: '删除用户', description: '删除用户账户', category: 'user', resource: 'users', action: 'delete' },
  
  // AI模型管理权限
  { id: 'ai_model_read', name: '查看AI模型', description: '查看AI模型配置和状态', category: 'ai', resource: 'ai_models', action: 'read' },
  { id: 'ai_model_write', name: '管理AI模型', description: '配置AI模型参数和设置', category: 'ai', resource: 'ai_models', action: 'write' },
  { id: 'ai_model_execute', name: '测试AI模型', description: '执行AI模型测试和调试', category: 'ai', resource: 'ai_models', action: 'execute' },
  
  // 场景配置权限
  { id: 'scenario_read', name: '查看营销场景', description: '查看营销场景配置', category: 'scenario', resource: 'scenarios', action: 'read' },
  { id: 'scenario_write', name: '配置营销场景', description: '编辑营销场景和规则', category: 'scenario', resource: 'scenarios', action: 'write' },
  { id: 'scenario_execute', name: '执行营销场景', description: '启用/禁用营销场景', category: 'scenario', resource: 'scenarios', action: 'execute' },
  
  // 系统管理权限
  { id: 'system_read', name: '查看系统配置', description: '查看系统设置和状态', category: 'system', resource: 'system', action: 'read' },
  { id: 'system_write', name: '管理系统配置', description: '修改系统设置和参数', category: 'system', resource: 'system', action: 'write' },
  { id: 'system_delete', name: '重置系统', description: '执行系统重置和维护操作', category: 'system', resource: 'system', action: 'delete' },
  
  // 数据管理权限
  { id: 'data_read', name: '查看数据', description: '查看业务数据和报表', category: 'data', resource: 'data', action: 'read' },
  { id: 'data_write', name: '管理数据', description: '导��导出数据', category: 'data', resource: 'data', action: 'write' },
  { id: 'data_delete', name: '删除数据', description: '删除业务数据', category: 'data', resource: 'data', action: 'delete' },
];

// 模拟角色数据
const mockRoles: Role[] = [
  {
    id: 'super_admin',
    name: '超级管理员',
    description: '拥有系统所有权限，可以管理系统的所有功能和设置',
    color: 'bg-red-100 text-red-800',
    isSystem: true,
    permissions: mockPermissions.map(p => p.id),
    userCount: 2,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'admin',
    name: '系统管理员',
    description: '拥有大部分系统权限���负责日常运营管理',
    color: 'bg-blue-100 text-blue-800',
    isSystem: true,
    permissions: [
      'user_read', 'user_write',
      'ai_model_read', 'ai_model_write', 'ai_model_execute',
      'scenario_read', 'scenario_write', 'scenario_execute',
      'system_read', 'system_write',
      'data_read', 'data_write'
    ],
    userCount: 5,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'operator',
    name: '运营人员',
    description: '负责AI营销场景的配置和日常运营',
    color: 'bg-green-100 text-green-800',
    isSystem: false,
    permissions: [
      'user_read',
      'ai_model_read',
      'scenario_read', 'scenario_write', 'scenario_execute',
      'data_read'
    ],
    userCount: 8,
    createdAt: '2024-01-05T09:00:00Z',
    updatedAt: '2024-01-20T14:15:00Z'
  },
  {
    id: 'viewer',
    name: '只读用户',
    description: '只能查看系统信息，无法进行修改操作',
    color: 'bg-gray-100 text-gray-800',
    isSystem: false,
    permissions: [
      'user_read',
      'ai_model_read',
      'scenario_read',
      'system_read',
      'data_read'
    ],
    userCount: 12,
    createdAt: '2024-01-10T11:30:00Z',
    updatedAt: '2024-01-18T16:20:00Z'
  }
];

// 模拟用户角色数据
const mockUserRoles: UserRole[] = [
  {
    userId: 'user_1',
    userName: '张三',
    email: 'zhang.san@company.com',
    roles: ['super_admin'],
    lastLogin: '2024-01-20T08:30:00Z',
    status: 'active'
  },
  {
    userId: 'user_2',
    userName: '李四',
    email: 'li.si@company.com',
    roles: ['admin'],
    lastLogin: '2024-01-20T09:15:00Z',
    status: 'active'
  },
  {
    userId: 'user_3',
    userName: '王五',
    email: 'wang.wu@company.com',
    roles: ['operator'],
    lastLogin: '2024-01-19T17:45:00Z',
    status: 'active'
  },
  {
    userId: 'user_4',
    userName: '赵六',
    email: 'zhao.liu@company.com',
    roles: ['viewer'],
    lastLogin: '2024-01-18T14:20:00Z',
    status: 'inactive'
  }
];

export default function SecurityPermissions() {
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [permissions] = useState<Permission[]>(mockPermissions);
  const [userRoles, setUserRoles] = useState<UserRole[]>(mockUserRoles);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isUserRoleDialogOpen, setIsUserRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRole | null>(null);

  const getCategoryIcon = (category: Permission['category']) => {
    switch (category) {
      case 'user':
        return <Users className="h-4 w-4" />;
      case 'ai':
        return <Brain className="h-4 w-4" />;
      case 'scenario':
        return <Target className="h-4 w-4" />;
      case 'system':
        return <Settings className="h-4 w-4" />;
      case 'data':
        return <Database className="h-4 w-4" />;
    }
  };

  const getActionIcon = (action: Permission['action']) => {
    switch (action) {
      case 'read':
        return <Eye className="h-3 w-3" />;
      case 'write':
        return <Edit className="h-3 w-3" />;
      case 'delete':
        return <Trash2 className="h-3 w-3" />;
      case 'execute':
        return <Settings className="h-3 w-3" />;
    }
  };

  const getRoleIcon = (roleName: string) => {
    if (roleName.includes('超级')) return <Crown className="h-4 w-4" />;
    if (roleName.includes('管理')) return <Shield className="h-4 w-4" />;
    return <User className="h-4 w-4" />;
  };

  const handleCreateRole = () => {
    setSelectedRole(null);
    setIsRoleDialogOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setIsRoleDialogOpen(true);
  };

  const handleDeleteRole = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (role?.isSystem) {
      alert('系统角色不能删除');
      return;
    }
    if (confirm('确定要删除这个角色吗？')) {
      setRoles(prev => prev.filter(r => r.id !== roleId));
    }
  };

  const handleEditUserRoles = (user: UserRole) => {
    setSelectedUser(user);
    setIsUserRoleDialogOpen(true);
  };

  const getStats = () => {
    const totalRoles = roles.length;
    const customRoles = roles.filter(r => !r.isSystem).length;
    const totalUsers = userRoles.length;
    const activeUsers = userRoles.filter(u => u.status === 'active').length;

    return {
      totalRoles,
      customRoles,
      totalUsers,
      activeUsers
    };
  };

  const stats = getStats();

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">安全与权限</h1>
          <p className="text-sm text-gray-600 mt-1">
            管理系统角色、权限和用户访问控制
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={handleCreateRole}
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            创建角色
          </Button>
        </div>
      </div>

      {/* 统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总角色数</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRoles}</div>
            <p className="text-xs text-muted-foreground">
              其中 {stats.customRoles} 个自定义角色
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">权限项目</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{permissions.length}</div>
            <p className="text-xs text-muted-foreground">
              覆盖 5 个功能模块
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">用户总数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeUsers} 个活跃用户
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃率</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((stats.activeUsers / stats.totalUsers) * 100).toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              用户活跃度
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="roles" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="roles">角色管理</TabsTrigger>
          <TabsTrigger value="permissions">权限矩阵</TabsTrigger>
          <TabsTrigger value="users">用户权限</TabsTrigger>
        </TabsList>

        {/* 角色管理Tab */}
        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>系统角色</CardTitle>
              <CardDescription>
                管理系统角色定义和权限配置
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roles.map((role) => (
                  <div
                    key={role.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(role.name)}
                        <span className="font-medium">{role.name}</span>
                      </div>
                      <Badge className={role.color}>
                        {role.isSystem ? '系统' : '自定义'}
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
                        onClick={() => handleEditRole(role)}
                        className="flex-1"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        编辑
                      </Button>
                      {!role.isSystem && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRole(role.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 权限矩阵Tab */}
        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>权限矩阵</CardTitle>
              <CardDescription>
                查看角色和权限的对应关系
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="text-left p-3 border-b font-medium">权限</th>
                      {roles.map(role => (
                        <th key={role.id} className="text-center p-3 border-b font-medium min-w-[120px]">
                          <div className="flex flex-col items-center gap-1">
                            {getRoleIcon(role.name)}
                            <span className="text-xs">{role.name}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(
                      permissions.reduce((acc, permission) => {
                        if (!acc[permission.category]) {
                          acc[permission.category] = [];
                        }
                        acc[permission.category].push(permission);
                        return acc;
                      }, {} as Record<string, Permission[]>)
                    ).map(([category, categoryPermissions]) => (
                      <React.Fragment key={category}>
                        <tr>
                          <td colSpan={roles.length + 1} className="p-3 bg-gray-50 font-medium text-sm">
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(category as Permission['category'])}
                              {category === 'user' && '用户管理'}
                              {category === 'ai' && 'AI模型'}
                              {category === 'scenario' && '营销场景'}
                              {category === 'system' && '系统管理'}
                              {category === 'data' && '数据管理'}
                            </div>
                          </td>
                        </tr>
                        {categoryPermissions.map(permission => (
                          <tr key={permission.id} className="hover:bg-gray-50">
                            <td className="p-3 border-b">
                              <div className="flex items-center gap-2">
                                {getActionIcon(permission.action)}
                                <div>
                                  <div className="font-medium text-sm">{permission.name}</div>
                                  <div className="text-xs text-gray-500">{permission.description}</div>
                                </div>
                              </div>
                            </td>
                            {roles.map(role => (
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
              <CardDescription>
                管理用户的角色分配和权限
              </CardDescription>
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
                  {userRoles.map((user) => (
                    <TableRow key={user.userId}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.userName}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map(roleId => {
                            const role = roles.find(r => r.id === roleId);
                            return role ? (
                              <Badge key={roleId} className={role.color}>
                                {role.name}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.status === 'active' ? (
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
                        {new Date(user.lastLogin).toLocaleDateString('zh-CN')}
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 角色配置对话框 */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedRole ? '编辑角色' : '创建新角色'}
            </DialogTitle>
            <DialogDescription>
              配置角色的基本信息和权限
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* 基本信息 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>角色名称</Label>
                <Input 
                  placeholder="例如: 运营专员"
                  defaultValue={selectedRole?.name}
                />
              </div>
              <div className="space-y-2">
                <Label>角色颜色</Label>
                <Select defaultValue="bg-blue-100 text-blue-800">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bg-blue-100 text-blue-800">蓝色</SelectItem>
                    <SelectItem value="bg-green-100 text-green-800">绿色</SelectItem>
                    <SelectItem value="bg-purple-100 text-purple-800">紫色</SelectItem>
                    <SelectItem value="bg-orange-100 text-orange-800">橙色</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>角色描述</Label>
              <Textarea 
                placeholder="描述这个角色的职责和权限范围..."
                defaultValue={selectedRole?.description}
              />
            </div>

            {/* 权限配置 */}
            <div className="space-y-4">
              <Label className="text-base font-medium">权限配置</Label>
              {Object.entries(
                permissions.reduce((acc, permission) => {
                  if (!acc[permission.category]) {
                    acc[permission.category] = [];
                  }
                  acc[permission.category].push(permission);
                  return acc;
                }, {} as Record<string, Permission[]>)
              ).map(([category, categoryPermissions]) => (
                <div key={category} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    {getCategoryIcon(category as Permission['category'])}
                    <span className="font-medium">
                      {category === 'user' && '用户管理'}
                      {category === 'ai' && 'AI模型管理'}
                      {category === 'scenario' && '营销场景'}
                      {category === 'system' && '系统管理'}
                      {category === 'data' && '数据管理'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {categoryPermissions.map(permission => (
                      <div key={permission.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={permission.id}
                          defaultChecked={selectedRole?.permissions.includes(permission.id)}
                        />
                        <Label htmlFor={permission.id} className="text-sm flex items-center gap-1">
                          {getActionIcon(permission.action)}
                          {permission.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsRoleDialogOpen(false);
                setSelectedRole(null);
              }}
            >
              取消
            </Button>
            <Button onClick={() => {
              // 这里应该处理保存逻辑
              setIsRoleDialogOpen(false);
              setSelectedRole(null);
            }}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 用户角色分配对话框 */}
      <Dialog open={isUserRoleDialogOpen} onOpenChange={setIsUserRoleDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>编辑用户权限</DialogTitle>
            <DialogDescription>
              为用户 {selectedUser?.userName} 分配角色
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <Label>选择角色</Label>
              {roles.map(role => (
                <div key={role.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`user-role-${role.id}`}
                    defaultChecked={selectedUser?.roles.includes(role.id)}
                  />
                  <Label htmlFor={`user-role-${role.id}`} className="flex items-center gap-2">
                    {getRoleIcon(role.name)}
                    <span>{role.name}</span>
                    <Badge className={role.color} variant="outline">
                      {role.isSystem ? '系统' : '自定义'}
                    </Badge>
                  </Label>
                </div>
              ))}
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="user-status"
                defaultChecked={selectedUser?.status === 'active'}
              />
              <Label htmlFor="user-status">启用用户账户</Label>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsUserRoleDialogOpen(false);
                setSelectedUser(null);
              }}
            >
              取消
            </Button>
            <Button onClick={() => {
              // 这里应该处理保存逻辑
              setIsUserRoleDialogOpen(false);
              setSelectedUser(null);
            }}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
