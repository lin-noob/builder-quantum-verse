import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Building2,
  Search,
  Users,
  Calendar,
  Crown,
  Shield,
  Settings,
  Copy,
  RotateCcw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  Organization,
  AccountStatus,
  SubscriptionPlan,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  OrganizationListQuery,
} from "../../../shared/organizationData";
import { organizationApi } from "../../../shared/organizationApi";

const OrganizationManagement = () => {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<AccountStatus | "ALL">("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  // 排序状态
  const [sortField, setSortField] = useState<'createdAt' | null>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // 弹窗状��
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  // 表单状态
  const [createForm, setCreateForm] = useState<CreateOrganizationRequest>({
    name: "",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
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
        status: selectedStatus === "ALL" ? undefined : selectedStatus,
      };

      const response = await organizationApi.getOrganizations(query);
      setOrganizations(response.data);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (error) {
      console.error("Failed to load organizations:", error);
      toast({
        title: "加载失败",
        description: "无法加载组织列表，请重试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrganization = async () => {
    if (
      !createForm.name.trim() ||
      !createForm.adminName.trim() ||
      !createForm.adminEmail.trim()
    ) {
      toast({
        title: "表单验证失败",
        description: "请填写完整的组织信息",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await organizationApi.createOrganization(createForm);

      if (response.success) {
        toast({
          title: "创建成功",
          description: "新组织和管理员账户已创建",
        });

        setGeneratedCredentials({
          email: createForm.adminEmail,
          password: createForm.adminPassword,
        });
        setPasswordDialogOpen(true);
        setCreateDialogOpen(false);
        setCreateForm({
          name: "",
          adminName: "",
          adminEmail: "",
          adminPassword: "",
          subscriptionPlan: SubscriptionPlan.INTERNAL_TRIAL,
        });
        loadOrganizations();
      } else {
        toast({
          title: "创建失败",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to create organization:", error);
      toast({
        title: "创建失败",
        description: "网络错误，请重试",
        variant: "destructive",
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
          title: "更新成功",
          description: "组织信息已更新",
        });

        setEditDialogOpen(false);
        setEditingOrganization(null);
        loadOrganizations();
      } else {
        toast({
          title: "更新失败",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to update organization:", error);
      toast({
        title: "更新失败",
        description: "网络错误，请重试",
        variant: "destructive",
      });
    }
  };

  // 排序函数
  const sortOrganizations = (organizations: Organization[]) => {
    if (!sortField) return organizations;
    
    return [...organizations].sort((a, b) => {
      let aValue: string = a.createdAt;
      let bValue: string = b.createdAt;
      
      const dateA = new Date(aValue).getTime();
      const dateB = new Date(bValue).getTime();
      
      if (sortOrder === 'desc') {
        return dateB - dateA;
      } else {
        return dateA - dateB;
      }
    });
  };
  
  // 获取排序后的组织列表
  const sortedOrganizations = sortOrganizations(organizations);
  
  const handleSort = (field: 'createdAt') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const openEditDialog = (organization: Organization) => {
    setEditingOrganization({ ...organization });
    setEditDialogOpen(true);
  };

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    let password = "";
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCreateForm((prev) => ({ ...prev, adminPassword: password }));
  };

  const copyCredentials = () => {
    if (generatedCredentials) {
      const text = `邮箱: ${generatedCredentials.email}\n密码: ${generatedCredentials.password}`;
      navigator.clipboard.writeText(text);
      toast({
        title: "已复制",
        description: "管理员登录凭证已复制到剪贴板",
      });
    }
  };

  const getStatusBadge = (status: AccountStatus) => {
    if (status === AccountStatus.ACTIVE) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          活跃
        </Badge>
      );
    } else if (status === AccountStatus.SUSPENDED) {
      return <Badge variant="destructive">已暂停</Badge>;
    } else {
      return <Badge variant="secondary">未知状态</Badge>;
    }
  };

  const getSubscriptionBadge = (plan: SubscriptionPlan) => {
    const badges = {
      [SubscriptionPlan.INTERNAL_TRIAL]: (
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          内部试用
        </Badge>
      ),
      [SubscriptionPlan.BASIC]: <Badge variant="outline">基础版</Badge>,
      [SubscriptionPlan.PROFESSIONAL]: (
        <Badge variant="default" className="bg-purple-100 text-purple-800">
          专业版
        </Badge>
      ),
      [SubscriptionPlan.ENTERPRISE]: (
        <Badge variant="default" className="bg-yellow-100 text-yellow-800">
          企业版
        </Badge>
      ),
    };
    return badges[plan] || <Badge variant="secondary">未知套餐</Badge>;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      <div className="max-w-none">
        {/* 搜索和筛选卡片 */}
        <Card className="p-6 mb-6 bg-white shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            {/* 搜索框 */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="搜索组织名称、ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* 状态筛选 */}
            <div className="md:w-1/4">
              <Select
                value={selectedStatus}
                onValueChange={(value) =>
                  setSelectedStatus(value as AccountStatus | "ALL")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="状态筛选" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">所有状态</SelectItem>
                  <SelectItem value={AccountStatus.ACTIVE}>活跃</SelectItem>
                  <SelectItem value={AccountStatus.SUSPENDED}>已暂停</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 重置按钮 */}
            <div className="flex items-end">
              <Button
                variant="outline"
                size="default"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedStatus("ALL");
                  setCurrentPage(1);
                }}
                className="flex items-center gap-2 h-10"
              >
                <RotateCcw className="h-4 w-4" />
                重置
              </Button>
            </div>
          </div>
        </Card>

        {/* 操作按钮区域 */}
        <div className="flex items-center gap-4 mb-6">
          <Button onClick={() => setCreateDialogOpen(true)}>
            创建新组织
          </Button>
        </div>

        {/* 组织列表卡片 */}
        <Card className="bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    组织信息
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    状态
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    订阅套餐
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    成员统计
                  </th>
                  <th
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer select-none hover:bg-gray-100"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center gap-2">
                      创建时间
                      {getSortIcon('createdAt')}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedOrganizations.map((organization) => (
                  <tr key={organization.organizationId} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900">
                          {organization.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {organization.organizationId}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(organization.accountStatus)}
                    </td>
                    <td className="px-6 py-4">
                      {getSubscriptionBadge(organization.subscriptionPlan)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-600">
                        <div>总计: {organization.memberCount || 0}</div>
                        <div>活跃: {organization.activeMemberCount || 0}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600">
                      {formatDateTime(organization.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => navigate(`/admin/organizations/${organization.organizationId}`)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          查看详情
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-700 order-2 sm:order-1">
                正在显示 {(currentPage - 1) * 10 + 1} - {Math.min(currentPage * 10, total)} 条，共 {total} 条
              </div>
              <div className="flex items-center gap-2 order-1 sm:order-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  上一页
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  下一页
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* 创建组织弹窗 */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>创建新组织</DialogTitle>
            <DialogDescription>
              为新客户创建独立的组织工作空间，���同时创建首位管理员账户
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="org-name">组织名称</Label>
              <Input
                id="org-name"
                placeholder="请输入组织名称"
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            <div className="border-t pt-4">
              <Label className="text-sm font-medium text-gray-700">
                管理员账户信息
              </Label>
              <div className="space-y-3 mt-2">
                <div>
                  <Label htmlFor="admin-name">管理员姓名</Label>
                  <Input
                    id="admin-name"
                    placeholder="请输入管理员姓名"
                    value={createForm.adminName}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        adminName: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="admin-email">管理员邮箱</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="请输入管理员邮箱"
                    value={createForm.adminEmail}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        adminEmail: e.target.value,
                      }))
                    }
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
                      onChange={(e) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          adminPassword: e.target.value,
                        }))
                      }
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateRandomPassword}
                    >
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
                onValueChange={(value) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    subscriptionPlan: value as SubscriptionPlan,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SubscriptionPlan.INTERNAL_TRIAL}>
                    内部试用
                  </SelectItem>
                  <SelectItem value={SubscriptionPlan.BASIC} disabled>
                    基础版
                  </SelectItem>
                  <SelectItem value={SubscriptionPlan.PROFESSIONAL} disabled>
                    专业版
                  </SelectItem>
                  <SelectItem value={SubscriptionPlan.ENTERPRISE} disabled>
                    企业版
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
            >
              取消
            </Button>
            <Button onClick={handleCreateOrganization}>创建组织</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑组织弹窗 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑组织信息</DialogTitle>
            <DialogDescription>修改组织的基本信息和状态</DialogDescription>
          </DialogHeader>
          {editingOrganization && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">组织名称</Label>
                <Input
                  id="edit-name"
                  value={editingOrganization.name}
                  onChange={(e) =>
                    setEditingOrganization((prev) =>
                      prev ? { ...prev, name: e.target.value } : null,
                    )
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-status">账户状态</Label>
                <Select
                  value={editingOrganization.accountStatus}
                  onValueChange={(value) =>
                    setEditingOrganization((prev) =>
                      prev
                        ? { ...prev, accountStatus: value as AccountStatus }
                        : null,
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={AccountStatus.ACTIVE}>活跃</SelectItem>
                    <SelectItem value={AccountStatus.SUSPENDED}>
                      已暂停
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-plan">订阅套餐</Label>
                <Select
                  value={editingOrganization.subscriptionPlan}
                  onValueChange={(value) =>
                    setEditingOrganization((prev) =>
                      prev
                        ? {
                            ...prev,
                            subscriptionPlan: value as SubscriptionPlan,
                          }
                        : null,
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SubscriptionPlan.INTERNAL_TRIAL}>
                      内部试用
                    </SelectItem>
                    <SelectItem value={SubscriptionPlan.BASIC} disabled>
                      基础版
                    </SelectItem>
                    <SelectItem value={SubscriptionPlan.PROFESSIONAL} disabled>
                      专业版
                    </SelectItem>
                    <SelectItem value={SubscriptionPlan.ENTERPRISE} disabled>
                      企业版
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-org-id">组织ID</Label>
                <Input
                  id="edit-org-id"
                  value={editingOrganization.organizationId}
                  readOnly
                  className="bg-gray-50 text-gray-600"
                />
              </div>
              <div>
                <Label htmlFor="edit-created">创建时间</Label>
                <Input
                  id="edit-created"
                  value={formatDateTime(editingOrganization.createdAt)}
                  readOnly
                  className="bg-gray-50 text-gray-600"
                />
              </div>
              <div>
                <Label htmlFor="edit-members">成员统计</Label>
                <Input
                  id="edit-members"
                  value={`总计: ${editingOrganization.memberCount || 0} (活跃: ${editingOrganization.activeMemberCount || 0})`}
                  readOnly
                  className="bg-gray-50 text-gray-600"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleUpdateOrganization}>保存更改</Button>
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
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyCredentials}
                  className="mt-3 w-full"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  复制登录凭证
                </Button>
              </div>
              <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded">
                <strong>重要提醒：</strong>
                请务必将登录凭证安全地告知新组织的管理员，并建议其首次登录后立即修改密码。
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
