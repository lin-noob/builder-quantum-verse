import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Plus,
  MoreHorizontal,
  Trash2,
  Shield,
  Mail,
  Phone,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Clock,
  Crown,
  Users,
  Settings,
  Eye
} from 'lucide-react';

// 用户类型定义
export interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  roles: string[];
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
  createdAt: string;
  avatar?: string;
  department?: string;
}

// 角色类型定义（从SecurityPermissions中���用）
export interface Role {
  id: string;
  name: string;
  description: string;
  color: string;
  isSystem: boolean;
  permissions: string[];
  userCount: number;
}

// 权限类型定义
export interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'user' | 'ai' | 'scenario' | 'system' | 'data';
  resource: string;
  action: 'read' | 'write' | 'delete' | 'execute';
}

// 模拟角色数据
const mockRoles: Role[] = [
  {
    id: 'super_admin',
    name: '超级管理员',
    description: '拥有系统所有权限',
    color: 'bg-red-100 text-red-800',
    isSystem: true,
    permissions: [],
    userCount: 2
  },
  {
    id: 'admin',
    name: '系统管理员',
    description: '拥有大部分系统权限',
    color: 'bg-blue-100 text-blue-800',
    isSystem: true,
    permissions: [],
    userCount: 5
  },
  {
    id: 'operator',
    name: '运营人员',
    description: '负责AI营销���景配置',
    color: 'bg-green-100 text-green-800',
    isSystem: false,
    permissions: [],
    userCount: 8
  },
  {
    id: 'viewer',
    name: '只读用户',
    description: '只能查看系统信息',
    color: 'bg-gray-100 text-gray-800',
    isSystem: false,
    permissions: [],
    userCount: 12
  }
];

// 模拟用户���据
const mockUsers: UserData[] = [
  {
    id: '1',
    name: '张营销',
    email: 'zhang.marketing@client.com',
    phone: '+86 138-1001-0001',
    roles: ['viewer'], // 主平台普通用户
    status: 'active',
    lastLogin: '2025/01/20 09:30',
    createdAt: '2024/03/15',
    department: '市场部'
  },
  {
    id: '2',
    name: '李运营',
    email: 'li.yunying@enterprise.com',
    phone: '+86 138-2002-0002',
    roles: ['operator'], // 主平台高级用户
    status: 'active',
    lastLogin: '2025/01/20 14:22',
    createdAt: '2024/02/28',
    department: '运营部'
  },
  {
    id: '3',
    name: '王总监',
    email: 'wang.director@company.com',
    phone: '+86 138-3003-0003',
    roles: ['admin'], // 主平台企业管理员
    status: 'active',
    lastLogin: '2025/01/20 11:45',
    createdAt: '2024/01/10',
    department: '营销总监'
  },
  {
    id: '4',
    name: '陈分析师',
    email: 'chen.analyst@startup.com',
    phone: '+86 138-4004-0004',
    roles: ['viewer'],
    status: 'active',
    lastLogin: '2025/01/19 16:30',
    createdAt: '2024/04/20',
    department: '数据部'
  },
  {
    id: '5',
    name: '刘专员',
    email: 'liu.specialist@corp.com',
    phone: '+86 138-5005-0005',
    roles: ['operator'],
    status: 'active',
    lastLogin: '2025/01/19 09:15',
    createdAt: '2024/05/08',
    department: '品牌部'
  },
  {
    id: '6',
    name: '周策划',
    email: 'zhou.planner@media.com',
    phone: '+86 138-6006-0006',
    roles: ['operator'],
    status: 'inactive',
    lastLogin: '2025/01/15 17:20',
    createdAt: '2024/06/12',
    department: '创意部'
  },
  {
    id: '7',
    name: '吴经理',
    email: 'wu.manager@business.com',
    phone: '+86 138-7007-0007',
    roles: ['admin'],
    status: 'active',
    lastLogin: '2025/01/20 08:45',
    createdAt: '2024/01/25',
    department: '业务部'
  },
  {
    id: '8',
    name: '赵顾问',
    email: 'zhao.consultant@advisory.com',
    phone: '+86 138-8008-0008',
    roles: ['viewer'],
    status: 'active',
    lastLogin: '2025/01/18 15:30',
    createdAt: '2024/07/03',
    department: '咨询部'
  }
];

export default function UserManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserData[]>(mockUsers);
  const [roles] = useState<Role[]>(mockRoles);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  // 筛选用户
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.phone.includes(searchTerm);

      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

      const matchesRole = roleFilter === 'all' || user.roles.includes(roleFilter);

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [users, searchTerm, statusFilter, roleFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, roleFilter]);

  const getRoleBadge = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return null;
    
    return (
      <Badge key={roleId} className={role.color}>
        {role.name}
      </Badge>
    );
  };

  const getStatusBadge = (status: UserData['status']) => {
    const config = {
      active: { label: '正常', icon: CheckCircle, className: 'bg-green-100 text-green-800' },
      inactive: { label: '禁用', icon: XCircle, className: 'bg-red-100 text-red-800' },
      pending: { label: '待激活', icon: Clock, className: 'bg-yellow-100 text-yellow-800' }
    };
    
    const { label, icon: Icon, className } = config[status];
    
    return (
      <Badge className={className}>
        <Icon className="h-3 w-3 mr-1" />
        {label}
      </Badge>
    );
  };

  const getRoleIcon = (roleName: string) => {
    if (roleName.includes('超级')) return <Crown className="h-4 w-4" />;
    if (roleName.includes('管理')) return <Shield className="h-4 w-4" />;
    return <User className="h-4 w-4" />;
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('确定要删除这个��户吗？')) {
      setUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  const handleAddUser = () => {
    setSelectedUser({
      id: Date.now().toString(),
      name: '',
      email: '',
      phone: '',
      roles: [],
      status: 'pending',
      lastLogin: '从未登录',
      createdAt: new Date().toLocaleDateString(),
      department: ''
    });
    setIsAddDialogOpen(true);
  };

  const handleSaveNewUser = () => {
    if (selectedUser && selectedUser.name && selectedUser.email) {
      setUsers(prev => [...prev, selectedUser]);
      setIsAddDialogOpen(false);
      setSelectedUser(null);
    }
  };

  // 统计数据
  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    inactive: users.filter(u => u.status === 'inactive').length,
    pending: users.filter(u => u.status === 'pending').length
  };

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>
          <p className="text-sm text-gray-600 mt-1">
            管���系统用户账户、角色权限和状态
          </p>
        </div>
        <Button onClick={handleAddUser}>
          <Plus className="h-4 w-4 mr-2" />
          添加用户
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总用户数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              系统注册用户
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃用户</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              正常状����户
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">禁用用户</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
            <p className="text-xs text-muted-foreground">
              已禁用账户
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">待激活</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              等待激活用户
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 筛选栏 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索用户名、邮箱或手机号..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="全部状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="active">正常</SelectItem>
                <SelectItem value="inactive">禁用</SelectItem>
                <SelectItem value="pending">待激活</SelectItem>
              </SelectContent>
            </Select>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="全部角色" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部角色</SelectItem>
                {roles.map(role => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 用户��表 */}
      <Card>
        <CardHeader>
          <CardTitle>用户列表 ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>用户信息</TableHead>
                <TableHead>角色</TableHead>
                <TableHead>状��</TableHead>
                <TableHead>最近登录</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {user.phone}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map(roleId => getRoleBadge(roleId))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(user.status)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {user.lastLogin}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {user.createdAt}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>操作</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate(`/admin/users/${user.id}/details`)}>
                          <Eye className="h-4 w-4 mr-2" />
                          查看详情
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteUser(user.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          删除用户
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>


      {/* 添加用户对话框 */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>添加新用户</DialogTitle>
            <DialogDescription>
              创建新的用户账户并分配角色
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>用户名 *</Label>
                  <Input
                    value={selectedUser.name}
                    onChange={(e) => setSelectedUser(prev => ({
                      ...prev,
                      name: e.target.value
                    }))}
                    placeholder="输入用户名"
                  />
                </div>
                <div className="space-y-2">
                  <Label>邮箱 *</Label>
                  <Input
                    type="email"
                    value={selectedUser.email}
                    onChange={(e) => setSelectedUser(prev => ({
                      ...prev,
                      email: e.target.value
                    }))}
                    placeholder="user@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>手机号</Label>
                  <Input
                    value={selectedUser.phone}
                    onChange={(e) => setSelectedUser(prev => ({
                      ...prev,
                      phone: e.target.value
                    }))}
                    placeholder="+86 138-0000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>部门</Label>
                  <Input
                    value={selectedUser.department || ''}
                    onChange={(e) => setSelectedUser(prev => ({
                      ...prev,
                      department: e.target.value
                    }))}
                    placeholder="所属部门"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>选择角色</Label>
                {roles.map(role => (
                  <div key={role.id} className="flex items-center space-x-2">
                    <Checkbox
                      checked={selectedUser.roles.includes(role.id)}
                      onCheckedChange={(checked) => {
                        setSelectedUser(prev => {
                          const newRoles = checked
                            ? [...prev.roles, role.id]
                            : prev.roles.filter(r => r !== role.id);
                          return {
                            ...prev,
                            roles: newRoles
                          };
                        });
                      }}
                    />
                    <div className="flex items-center gap-2">
                      {getRoleIcon(role.name)}
                      <Label className="cursor-pointer">{role.name}</Label>
                      <Badge className={role.color} variant="outline">
                        {role.isSystem ? '系统' : '自定义'}
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
              onClick={() => {
                setIsAddDialogOpen(false);
                setSelectedUser(null);
              }}
            >
              取消
            </Button>
            <Button onClick={handleSaveNewUser}>
              创建用户
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
