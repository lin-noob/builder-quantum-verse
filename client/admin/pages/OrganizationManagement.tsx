import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Building2,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Users,
  Calendar,
  Crown,
  Shield,
  Settings,
  Eye,
  Copy,
} from 'lucide-react';
import {
  Organization,
  AccountStatus,
  SubscriptionPlan,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  OrganizationListQuery,
} from '../../../shared/organizationData';
import { organizationApi } from '../../../shared/organizationApi';

const OrganizationManagement = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<AccountStatus | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // 弹窗状态
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  // 表单状态
  const [createForm, setCreateForm] = useState<CreateOrganizationRequest>({
    name: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    subscriptionPlan: SubscriptionPlan.INTERNAL_TRIAL,
  });
  const [editingOrganization, setEditingOrganization] = useState<Organization | null>(null);
  const [generatedCredentials, setGeneratedCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    loadOrganizations();
  }, [currentPage, searchQuery, selectedStatus]);

  const loadOrganizations = async () => {
    try {
      setLoading(true);

      const query: OrganizationListQuery = {
        page: currentPage,
        limit: 10,
        search: searchQuery,
        status: selectedStatus === 'ALL' ? undefined : selectedStatus,
      };

      const response = await organizationApi.getOrganizations(query);
      setOrganizations(response.data);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to load organizations:', error);
      toast({
        title: '加载失败',
        description: '无法加载组织列表，请重试',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrganization = async () => {
    if (!createForm.name.trim() || !createForm.adminName.trim() || !createForm.adminEmail.trim()) {
      toast({
        title: '表单验证失败',
        description: '请填写完整的组织信息',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await organizationApi.createOrganization(createForm);

      if (response.success) {
        toast({
          title: '创建成功',
          description: '新组织和管理员账户已创建',
        });

        setGeneratedCredentials({
          email: createForm.adminEmail,
          password: createForm.adminPassword,
        });
        setPasswordDialogOpen(true);
        setCreateDialogOpen(false);
        setCreateForm({
          name: '',
          adminName: '',
          adminEmail: '',
          adminPassword: '',
          subscriptionPlan: SubscriptionPlan.INTERNAL_TRIAL,
        });
        loadOrganizations();
      } else {
        toast({
          title: '创��失败',
          description: response.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to create organization:', error);
      toast({
        title: '创建失败',
        description: '网络错误，请重试',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateOrganization = async () => {
    if (!editingOrganization) return;

    try {
      const updateRequest: UpdateOrganizationRequest = {
        organizationId: editingOrganization.organizationId,
        name: editingOrganization.name,
        accountStatus: editingOrganization.accountStatus,
        subscriptionPlan: editingOrganization.subscriptionPlan,
      };

      const response = await organizationApi.updateOrganization(updateRequest);

      if (response.success) {
        toast({
          title: '更新成功',
          description: '组织信息已更新',
        });

        setEditDialogOpen(false);
        setEditingOrganization(null);
        loadOrganizations();
      } else {
        toast({
          title: '更新失败',
          description: response.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to update organization:', error);
      toast({
        title: '更新失败',
        description: '网络错误，请重试',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (organization: Organization) => {
    setEditingOrganization({ ...organization });
    setEditDialogOpen(true);
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCreateForm(prev => ({ ...prev, adminPassword: password }));
  };

  const copyCredentials = () => {
    if (generatedCredentials) {
      const text = `邮箱: ${generatedCredentials.email}\n密码: ${generatedCredentials.password}`;
      navigator.clipboard.writeText(text);
      toast({
        title: '已复制',
        description: '管理员登录凭证已复制到剪贴板',
      });
    }
  };

  const getStatusBadge = (status: AccountStatus) => {
    if (status === AccountStatus.ACTIVE) {
      return <Badge variant="default" className="bg-green-100 text-green-800">活跃</Badge>;
    } else if (status === AccountStatus.SUSPENDED) {
      return <Badge variant="destructive">已暂停</Badge>;
    } else {
      return <Badge variant="secondary">未知状态</Badge>;
    }
  };

  const getSubscriptionBadge = (plan: SubscriptionPlan) => {
    const badges = {
      [SubscriptionPlan.INTERNAL_TRIAL]: <Badge variant="outline" className="bg-blue-50 text-blue-700">内部试用</Badge>,
      [SubscriptionPlan.BASIC]: <Badge variant="outline">基础版</Badge>,
      [SubscriptionPlan.PROFESSIONAL]: <Badge variant="default" className="bg-purple-100 text-purple-800">专业版</Badge>,
      [SubscriptionPlan.ENTERPRISE]: <Badge variant="default" className="bg-yellow-100 text-yellow-800">企业版</Badge>,
    };
    return badges[plan] || <Badge variant="secondary">未知套餐</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">组织管理</h1>
          <p className="text-gray-600 mt-1">管理平台上的所有客户组织和租户</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          创建新组织
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总组织数</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃组织</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {organizations.filter(org => org.accountStatus === AccountStatus.ACTIVE).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总成员数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {organizations.reduce((sum, org) => sum + (org.memberCount || 0), 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">付费组织</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {organizations.filter(org => 
                org.subscriptionPlan !== SubscriptionPlan.INTERNAL_TRIAL
              ).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和过滤 */}
      <Card>
        <CardHeader>
          <CardTitle>组织列表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="按组织名称或ID搜索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as AccountStatus | 'ALL')}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="状态筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">所有状态</SelectItem>
                <SelectItem value={AccountStatus.ACTIVE}>活跃</SelectItem>
                <SelectItem value={AccountStatus.SUSPENDED}>已暂停</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 组织表格 */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>组织信息</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>订阅套餐</TableHead>
                  <TableHead>成员统计</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organizations.map((organization) => (
                  <TableRow key={organization.organizationId}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{organization.name}</div>
                        <div className="text-sm text-gray-500">{organization.organizationId}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(organization.accountStatus)}</TableCell>
                    <TableCell>{getSubscriptionBadge(organization.subscriptionPlan)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>总计: {organization.memberCount || 0}</div>
                        <div className="text-gray-500">活跃: {organization.activeMemberCount || 0}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDate(organization.createdAt)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(organization)}>
                            <Edit className="mr-2 h-4 w-4" />
                            编辑组织
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            查看详情
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                上一页
              </Button>
              <span className="flex items-center px-3 text-sm">
                第 {currentPage} 页，共 {totalPages} 页
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                下一页
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 创建组织弹窗 */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>创建新组织</DialogTitle>
            <DialogDescription>
              为新客户创建独立的组织工作空间，并同时创建首位管理员账户
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="org-name">组织名称</Label>
              <Input
                id="org-name"
                placeholder="请输入组织名称"
                value={createForm.name}
                onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div className="border-t pt-4">
              <Label className="text-sm font-medium text-gray-700">管理员账户信息</Label>
              <div className="space-y-3 mt-2">
                <div>
                  <Label htmlFor="admin-name">管理员姓名</Label>
                  <Input
                    id="admin-name"
                    placeholder="请输入管理员姓名"
                    value={createForm.adminName}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, adminName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="admin-email">管理员邮箱</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="请输入管理员邮箱"
                    value={createForm.adminEmail}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, adminEmail: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="admin-password">初始密码</Label>
                  <div className="flex gap-2">
                    <Input
                      id="admin-password"
                      type="text"
                      placeholder="初始密码"
                      value={createForm.adminPassword}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, adminPassword: e.target.value }))}
                    />
                    <Button type="button" variant="outline" onClick={generateRandomPassword}>
                      生成
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="subscription">订阅套餐</Label>
              <Select
                value={createForm.subscriptionPlan}
                onValueChange={(value) => setCreateForm(prev => ({ ...prev, subscriptionPlan: value as SubscriptionPlan }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SubscriptionPlan.INTERNAL_TRIAL}>内部试用</SelectItem>
                  <SelectItem value={SubscriptionPlan.BASIC}>基础版</SelectItem>
                  <SelectItem value={SubscriptionPlan.PROFESSIONAL}>专业版</SelectItem>
                  <SelectItem value={SubscriptionPlan.ENTERPRISE}>企业版</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreateOrganization}>
              创建组织
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑组织弹窗 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑组织信息</DialogTitle>
            <DialogDescription>
              修改组织的基本信息和状态
            </DialogDescription>
          </DialogHeader>
          {editingOrganization && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">组织名称</Label>
                <Input
                  id="edit-name"
                  value={editingOrganization.name}
                  onChange={(e) => setEditingOrganization(prev => prev ? { ...prev, name: e.target.value } : null)}
                />
              </div>
              <div>
                <Label htmlFor="edit-status">账户状态</Label>
                <Select
                  value={editingOrganization.accountStatus}
                  onValueChange={(value) => setEditingOrganization(prev => prev ? { ...prev, accountStatus: value as AccountStatus } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={AccountStatus.ACTIVE}>活跃</SelectItem>
                    <SelectItem value={AccountStatus.SUSPENDED}>已暂停</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-plan">订阅套餐</Label>
                <Select
                  value={editingOrganization.subscriptionPlan}
                  onValueChange={(value) => setEditingOrganization(prev => prev ? { ...prev, subscriptionPlan: value as SubscriptionPlan } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SubscriptionPlan.INTERNAL_TRIAL}>内部试用</SelectItem>
                    <SelectItem value={SubscriptionPlan.BASIC}>基础版</SelectItem>
                    <SelectItem value={SubscriptionPlan.PROFESSIONAL}>专业版</SelectItem>
                    <SelectItem value={SubscriptionPlan.ENTERPRISE}>企业版</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-gray-500 space-y-1">
                <div>组织ID：{editingOrganization.organizationId}</div>
                <div>创建时间：{formatDate(editingOrganization.createdAt)}</div>
                <div>成员数量：{editingOrganization.memberCount || 0} ({editingOrganization.activeMemberCount || 0} 活跃)</div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleUpdateOrganization}>
              保存更改
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 管理员凭证显示弹窗 */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>组织创建成功</DialogTitle>
            <DialogDescription>
              新组织和管理员账户已创建，请复制管理员登录凭证并安全地分享
            </DialogDescription>
          </DialogHeader>
          {generatedCredentials && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="space-y-2">
                  <div>
                    <div className="text-sm text-gray-600">管理员邮箱</div>
                    <code className="block p-2 bg-white border rounded text-sm">
                      {generatedCredentials.email}
                    </code>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">初始密码</div>
                    <code className="block p-2 bg-white border rounded text-sm">
                      {generatedCredentials.password}
                    </code>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={copyCredentials} className="mt-3 w-full">
                  <Copy className="h-4 w-4 mr-2" />
                  复制登录凭证
                </Button>
              </div>
              <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded">
                <strong>重要提醒：</strong>请务必将登录凭证安全地告知新组织的管理员，并建议其首次登录后立即修改密码。
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setPasswordDialogOpen(false)}>
              我已保存凭证
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrganizationManagement;
