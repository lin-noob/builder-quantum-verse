import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Edit,
  Trash2,
  Shield,
  Mail,
  Phone,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

interface SystemUser {
  id: string;
  username: string;
  email: string;
  phone?: string;
  role: 'admin' | 'manager' | 'operator' | 'viewer';
  status: 'active' | 'inactive' | 'pending';
  lastLogin: Date;
  createdAt: Date;
  permissions: string[];
}

export default function UserManagement() {
  const [searchText, setSearchText] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  // 模拟用户数据
  const users: SystemUser[] = [
    {
      id: '1',
      username: '系统管理员',
      email: 'admin@company.com',
      phone: '+86 138-0000-0001',
      role: 'admin',
      status: 'active',
      lastLogin: new Date('2025-01-20T09:30:00'),
      createdAt: new Date('2024-01-01T00:00:00'),
      permissions: ['all']
    },
    {
      id: '2',
      username: '营销经理',
      email: 'marketing.manager@company.com',
      phone: '+86 138-0000-0002',
      role: 'manager',
      status: 'active',
      lastLogin: new Date('2025-01-20T08:45:00'),
      createdAt: new Date('2024-03-15T00:00:00'),
      permissions: ['scenarios:manage', 'users:view', 'analytics:view']
    },
    {
      id: '3',
      username: '营销专员',
      email: 'marketing.operator@company.com',
      phone: '+86 138-0000-0003',
      role: 'operator',
      status: 'active',
      lastLogin: new Date('2025-01-19T17:20:00'),
      createdAt: new Date('2024-06-10T00:00:00'),
      permissions: ['scenarios:edit', 'analytics:view']
    },
    {
      id: '4',
      username: '数据分析师',
      email: 'analyst@company.com',
      role: 'viewer',
      status: 'inactive',
      lastLogin: new Date('2025-01-15T14:30:00'),
      createdAt: new Date('2024-08-20T00:00:00'),
      permissions: ['analytics:view', 'reports:export']
    },
    {
      id: '5',
      username: '新员工',
      email: 'newbie@company.com',
      role: 'operator',
      status: 'pending',
      lastLogin: new Date('2025-01-10T10:00:00'),
      createdAt: new Date('2025-01-10T00:00:00'),
      permissions: ['scenarios:view']
    }
  ];

  // 角色配置
  const roleConfig = {
    admin: { label: '系统管理员', color: 'bg-red-100 text-red-700 border-red-300' },
    manager: { label: '营销经理', color: 'bg-blue-100 text-blue-700 border-blue-300' },
    operator: { label: '营销专员', color: 'bg-green-100 text-green-700 border-green-300' },
    viewer: { label: '查看者', color: 'bg-gray-100 text-gray-700 border-gray-300' }
  };

  // 状态配置
  const statusConfig = {
    active: { label: '正常', color: 'bg-green-100 text-green-700 border-green-300', icon: CheckCircle },
    inactive: { label: '停用', color: 'bg-red-100 text-red-700 border-red-300', icon: XCircle },
    pending: { label: '待激活', color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: Clock }
  };

  // 筛选逻辑
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // 搜索文本过滤
      if (searchText) {
        const searchLower = searchText.toLowerCase();
        const matchesSearch = 
          user.username.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          (user.phone && user.phone.includes(searchText));
        if (!matchesSearch) return false;
      }
      
      // 角色过滤
      if (selectedRole !== 'all' && user.role !== selectedRole) {
        return false;
      }
      
      // 状态过滤
      if (selectedStatus !== 'all' && user.status !== selectedStatus) {
        return false;
      }
      
      return true;
    });
  }, [users, searchText, selectedRole, selectedStatus]);

  // 统计数据
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter(u => u.status === 'active').length;
    const admins = users.filter(u => u.role === 'admin').length;
    const recentLogins = users.filter(u => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      return u.lastLogin > threeDaysAgo;
    }).length;
    
    return { total, active, admins, recentLogins };
  }, [users]);

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return '刚刚';
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题和统计 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>
        <p className="text-gray-600 mt-1">管理系统用户账户、角色和权限</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">总用户数</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">活跃用户</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">管理员</p>
                <p className="text-2xl font-bold text-gray-900">{stats.admins}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">近期活跃</p>
                <p className="text-2xl font-bold text-gray-900">{stats.recentLogins}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 筛选和搜索 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            {/* 搜索框 */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="搜索用户名、邮箱或手机号..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* 角色筛选 */}
            <div className="md:w-48">
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="筛选角色" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部角色</SelectItem>
                  <SelectItem value="admin">系统管理员</SelectItem>
                  <SelectItem value="manager">营销经理</SelectItem>
                  <SelectItem value="operator">营销专员</SelectItem>
                  <SelectItem value="viewer">查看者</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 状态筛选 */}
            <div className="md:w-48">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="筛选状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="active">正常</SelectItem>
                  <SelectItem value="inactive">停用</SelectItem>
                  <SelectItem value="pending">待激活</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 添加用户按钮 */}
            <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  添加用户
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>添加新用户</DialogTitle>
                  <DialogDescription>
                    创建新的系统用户账户并分配角色权限
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <p className="text-sm text-gray-500">添加用户功能正在开发中...</p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* 用户列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>用户列表 ({filteredUsers.length})</span>
            <Badge variant="secondary">
              {filteredUsers.length} / {users.length} 用户
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>用户信息</TableHead>
                  <TableHead>角色</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>最近登录</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const StatusIcon = statusConfig[user.status].icon;
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-indigo-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.username}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </div>
                            {user.phone && (
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Phone className="h-3 w-3" />
                                {user.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={roleConfig[user.role].color}>
                          {roleConfig[user.role].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusConfig[user.status].color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig[user.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="text-gray-900">{getRelativeTime(user.lastLogin)}</p>
                          <p className="text-gray-500">{formatDateTime(user.lastLogin)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {user.createdAt.toLocaleDateString('zh-CN')}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>操作</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              编辑用户
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Shield className="mr-2 h-4 w-4" />
                              权限管理
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              删除用户
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
