import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  ArrowLeft,
  Edit,
  Save,
  Users,
  Calendar,
  Building2,
  Shield,
  Crown,
  Search,
  UserCheck,
  UserX,
  Copy,
  RotateCcw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  Organization,
  Member,
  AccountStatus,
  SubscriptionPlan,
  MemberRole,
  UpdateOrganizationRequest,
  InviteMemberRequest,
  UpdateMemberRequest,
  MemberListQuery
} from "../../../shared/organizationData";
import { organizationApi, memberApi } from "../../../shared/organizationApi";

const OrganizationDetail = () => {
  const { organizationId } = useParams<{ organizationId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // 组织信息状态
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // 成员管理状态
  const [members, setMembers] = useState<Member[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [selectedMemberRole, setSelectedMemberRole] = useState<MemberRole | "ALL">("ALL");
  const [selectedMemberStatus, setSelectedMemberStatus] = useState<AccountStatus | "ALL">("ALL");
  const [memberSortField, setMemberSortField] = useState<'lastLoginAt' | 'createdAt' | null>('lastLoginAt');
  const [memberSortOrder, setMemberSortOrder] = useState<'asc' | 'desc'>('desc');

  // 弹窗状态
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [editMemberDialogOpen, setEditMemberDialogOpen] = useState(false);
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  // 表单状态
  const [orgFormData, setOrgFormData] = useState({
    name: "",
    accountStatus: AccountStatus.ACTIVE,
    subscriptionPlan: SubscriptionPlan.INTERNAL_TRIAL,
  });
  const [inviteForm, setInviteForm] = useState<InviteMemberRequest>({
    email: "",
    role: MemberRole.MEMBER,
    password: ""
  });
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [statusChangeMember, setStatusChangeMember] = useState<Member | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState<string>("");

  useEffect(() => {
    if (organizationId) {
      loadOrganization();
      loadMembers();
    }
  }, [organizationId]);

  useEffect(() => {
    if (organizationId) {
      loadMembers();
    }
  }, [memberSearchQuery, selectedMemberRole, selectedMemberStatus]);

  const loadOrganization = async () => {
    if (!organizationId) return;

    try {
      setLoading(true);
      const orgData = await organizationApi.getOrganizationById(organizationId);

      if (orgData) {
        setOrganization(orgData);
        setOrgFormData({
          name: orgData.name,
          accountStatus: orgData.accountStatus,
          subscriptionPlan: orgData.subscriptionPlan,
        });
      }
    } catch (error) {
      console.error("Failed to load organization:", error);
      toast({
        title: "加载失败",
        description: "无法加载组织信息，请重试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async () => {
    if (!organizationId) return;

    try {
      setMembersLoading(true);
      
      const query: MemberListQuery = {
        page: 1,
        limit: 100, // 加载所有成员
        search: memberSearchQuery,
        role: selectedMemberRole === "ALL" ? undefined : selectedMemberRole,
        status: selectedMemberStatus === "ALL" ? undefined : selectedMemberStatus
      };
      
      const response = await memberApi.getMembers(organizationId, query);
      setMembers(response.data);
    } catch (error) {
      console.error("Failed to load members:", error);
      toast({
        title: "加载失败",
        description: "无法加载成员列表，请重试",
        variant: "destructive",
      });
    } finally {
      setMembersLoading(false);
    }
  };

  const handleSaveOrganization = async () => {
    if (!organization || !organizationId) return;

    try {
      setSaving(true);
      
      const updateRequest: UpdateOrganizationRequest = {
        organizationId: organizationId,
        name: orgFormData.name,
        accountStatus: organization.accountStatus, // 使用原始状态，不从表单获取
        subscriptionPlan: orgFormData.subscriptionPlan,
      };

      const response = await organizationApi.updateOrganization(updateRequest);

      if (response.success) {
        toast({
          title: "保存成功",
          description: "组织信息已更新",
        });
        setIsEditing(false);
        loadOrganization(); // 重新加载数据
      } else {
        toast({
          title: "保存失败",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to save organization:", error);
      toast({
        title: "保存失败",
        description: "网络错误，请重试",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInviteMember = async () => {
    if (!inviteForm.email || !inviteForm.role || !organizationId) {
      toast({
        title: "表单验证失败",
        description: "请填写完整的邀请信息",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await memberApi.inviteMember(organizationId, inviteForm);
      
      if (response.success) {
        toast({
          title: "邀请成功",
          description: `新成员已创建，初始密码已生成`,
        });
        
        setGeneratedPassword(response.data.initialPassword);
        setPasswordDialogOpen(true);
        setInviteDialogOpen(false);
        setInviteForm({ email: "", role: MemberRole.MEMBER, password: "" });
        loadMembers();
        loadOrganization(); // 更新成员统计
      } else {
        toast({
          title: "邀请失败",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to invite member:", error);
      toast({
        title: "邀请失败",
        description: "网络错误，请重试",
        variant: "destructive",
      });
    }
  };

  const handleUpdateMember = async () => {
    if (!editingMember || !organizationId) return;

    try {
      const updateRequest: UpdateMemberRequest = {
        memberId: editingMember.memberId,
        name: editingMember.name,
        role: editingMember.role,
        phone: editingMember.phone,
      };
      
      const response = await memberApi.updateMember(updateRequest);
      
      if (response.success) {
        toast({
          title: "更新成功",
          description: "成员信息已更新",
        });
        
        setEditMemberDialogOpen(false);
        setEditingMember(null);
        loadMembers();
      } else {
        toast({
          title: "更新失败",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to update member:", error);
      toast({
        title: "更新失败",
        description: "网络错误，请重试",
        variant: "destructive",
      });
    }
  };

  const handleToggleMemberStatus = async () => {
    if (!statusChangeMember) return;

    try {
      const response = await memberApi.toggleMemberStatus(statusChangeMember.memberId);
      
      if (response.success) {
        toast({
          title: "状态更新成功",
          description: response.message,
        });
        
        setStatusConfirmOpen(false);
        setStatusChangeMember(null);
        loadMembers();
        loadOrganization(); // 更新成员统计
      } else {
        toast({
          title: "状态更新失败",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to toggle member status:", error);
      toast({
        title: "状态更新失败",
        description: "网络错误，请重试",
        variant: "destructive",
      });
    }
  };

  // 成员排序函数
  const sortMembers = (members: Member[]) => {
    if (!memberSortField) return members;
    
    return [...members].sort((a, b) => {
      let aValue: string | null = null;
      let bValue: string | null = null;
      
      if (memberSortField === 'lastLoginAt') {
        aValue = a.lastLoginAt;
        bValue = b.lastLoginAt;
      } else if (memberSortField === 'createdAt') {
        aValue = a.createdAt;
        bValue = b.createdAt;
      }
      
      // 处理null值，null值排在最后
      if (!aValue && !bValue) return 0;
      if (!aValue) return 1;
      if (!bValue) return -1;
      
      const dateA = new Date(aValue).getTime();
      const dateB = new Date(bValue).getTime();
      
      if (memberSortOrder === 'desc') {
        return dateB - dateA;
      } else {
        return dateA - dateB;
      }
    });
  };
  
  const sortedMembers = sortMembers(members);
  
  const handleMemberSort = (field: 'lastLoginAt' | 'createdAt') => {
    if (memberSortField === field) {
      setMemberSortOrder(memberSortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setMemberSortField(field);
      setMemberSortOrder('desc');
    }
  };

  const openEditMemberDialog = (member: Member) => {
    setEditingMember({ ...member });
    setEditMemberDialogOpen(true);
  };

  const openStatusConfirm = (member: Member) => {
    setStatusChangeMember(member);
    setStatusConfirmOpen(true);
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(generatedPassword);
    toast({
      title: "已复制",
      description: "初始密码已复制到剪贴板",
    });
  };

  const getStatusBadge = (status: AccountStatus) => {
    if (status === AccountStatus.ACTIVE) {
      return <Badge variant="default" className="bg-green-100 text-green-800">活跃</Badge>;
    } else if (status === AccountStatus.SUSPENDED) {
      return <Badge variant="destructive">已暂停</Badge>;
    } else {
      return <Badge variant="secondary" className="bg-red-100 text-red-800">已禁用</Badge>;
    }
  };

  const getRoleBadge = (role: MemberRole) => {
    if (role === MemberRole.ADMIN) {
      return <Badge variant="default" className="bg-blue-100 text-blue-800">管理员</Badge>;
    } else {
      return <Badge variant="outline">成员</Badge>;
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

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return "从未登录";
    return new Date(dateString).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSortIcon = (field: string) => {
    if (memberSortField !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return memberSortOrder === "asc" ? (
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-100 rounded"></div>
            <div className="h-64 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            组织不存在
          </h2>
          <p className="text-gray-600 mb-4">未找到指定的组织信息</p>
          <Button onClick={() => navigate("/admin/organizations")}>
            返回组织列表
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">

      {/* 组织概览 */}
      <div className="space-y-6">
        {/* 基本信息 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                基本信息
              </CardTitle>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditing(false);
                        setOrgFormData({
                          name: organization.name,
                          accountStatus: organization.accountStatus,
                          subscriptionPlan: organization.subscriptionPlan,
                        });
                      }}
                    >
                      取消
                    </Button>
                    <Button size="sm" onClick={handleSaveOrganization} disabled={saving}>
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? "保存中..." : "保存"}
                    </Button>
                  </>
                ) : (
                  <Button size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    编辑组织
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="orgId">组织ID</Label>
              <Input
                id="orgId"
                value={organization.organizationId}
                readOnly
                className="bg-gray-50 text-gray-600"
              />
            </div>

            <div>
              <Label htmlFor="orgName">组织名称</Label>
              <Input
                id="orgName"
                value={orgFormData.name}
                onChange={(e) =>
                  setOrgFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                readOnly={!isEditing}
                className={!isEditing ? "bg-gray-50 text-gray-600" : ""}
              />
            </div>

            <div>
              <Label htmlFor="accountStatus">账户状态</Label>
              <div className="mt-2">
                {getStatusBadge(organization.accountStatus)}
                {isEditing && (
                  <p className="text-xs text-gray-500 mt-1">
                    状态只能在列表页面操作栏中修改
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="subscriptionPlan">订阅套餐</Label>
              {isEditing ? (
                <Select
                  value={orgFormData.subscriptionPlan}
                  onValueChange={(value) =>
                    setOrgFormData((prev) => ({ ...prev, subscriptionPlan: value as SubscriptionPlan }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SubscriptionPlan.INTERNAL_TRIAL}>内部试用</SelectItem>
                    <SelectItem value={SubscriptionPlan.BASIC} disabled>基础版</SelectItem>
                    <SelectItem value={SubscriptionPlan.PROFESSIONAL} disabled>专业版</SelectItem>
                    <SelectItem value={SubscriptionPlan.ENTERPRISE} disabled>企业版</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="mt-2">
                  {getSubscriptionBadge(organization.subscriptionPlan)}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="createdAt">创建时间</Label>
              <Input
                id="createdAt"
                value={formatDateTime(organization.createdAt)}
                readOnly
                className="bg-gray-50 text-gray-600"
              />
            </div>
          </CardContent>
        </Card>

        {/* 成员管理 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              成员管理
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 mb-6">
              {/* 筛选一行 */}
              <div className="flex flex-col sm:flex-row gap-4 items-end justify-between">
                <div className="flex flex-col sm:flex-row gap-4 items-end flex-1">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="按姓名或邮箱搜索成员..."
                      value={memberSearchQuery}
                      onChange={(e) => setMemberSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedMemberRole} onValueChange={(value) => setSelectedMemberRole(value as MemberRole | "ALL")}>
                    <SelectTrigger className="w-full sm:w-[150px]">
                      <SelectValue placeholder="角色筛选" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">所有角色</SelectItem>
                      <SelectItem value={MemberRole.ADMIN}>管理员</SelectItem>
                      <SelectItem value={MemberRole.MEMBER}>成员</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedMemberStatus} onValueChange={(value) => setSelectedMemberStatus(value as AccountStatus | "ALL")}>
                    <SelectTrigger className="w-full sm:w-[150px]">
                      <SelectValue placeholder="状态筛选" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">所有状态</SelectItem>
                      <SelectItem value={AccountStatus.ACTIVE}>活跃</SelectItem>
                      <SelectItem value={AccountStatus.DISABLED}>已禁用</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* 搜索重置按钮在右侧 */}
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => loadMembers()}>
                    搜索
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMemberSearchQuery("");
                      setSelectedMemberRole("ALL");
                      setSelectedMemberStatus("ALL");
                    }}
                  >
                    重置
                  </Button>
                </div>
              </div>
              
              {/* 邀请按钮在左侧 */}
              <div className="flex justify-start">
                <Button onClick={() => setInviteDialogOpen(true)}>
                  邀请新成员
                </Button>
              </div>
            </div>

            {/* 成员表格 */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>成员</TableHead>
                    <TableHead>角色</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleMemberSort('lastLoginAt')}
                        className="flex items-center gap-2 hover:text-gray-900"
                      >
                        最后登录时间
                        {getSortIcon('lastLoginAt')}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        onClick={() => handleMemberSort('createdAt')}
                        className="flex items-center gap-2 hover:text-gray-900"
                      >
                        创建时间
                        {getSortIcon('createdAt')}
                      </button>
                    </TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {membersLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="animate-pulse">加载中...</div>
                      </TableCell>
                    </TableRow>
                  ) : sortedMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="text-gray-500">暂无成员数据</div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedMembers.map((member) => (
                      <TableRow key={member.memberId}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-sm text-gray-500">{member.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(member.role)}</TableCell>
                        <TableCell>{getStatusBadge(member.accountStatus)}</TableCell>
                        <TableCell className="text-xs text-gray-600">
                          {formatDateTime(member.lastLoginAt)}
                        </TableCell>
                        <TableCell className="text-xs text-gray-600">
                          {formatDateTime(member.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => openEditMemberDialog(member)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              编辑
                            </button>
                            <button
                              onClick={() => openStatusConfirm(member)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              {member.accountStatus === AccountStatus.ACTIVE ? '禁用' : '启用'}
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 邀请新成员弹��� */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>邀请新成员</DialogTitle>
            <DialogDescription>
              为组织添加新的团队成员，系统将自动生成初始密码
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">邮箱地址</Label>
              <Input
                id="email"
                type="email"
                placeholder="请输入成员邮箱"
                value={inviteForm.email}
                onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="role">角色</Label>
              <Select
                value={inviteForm.role}
                onValueChange={(value) => setInviteForm(prev => ({ ...prev, role: value as MemberRole }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择角色" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={MemberRole.MEMBER}>成员</SelectItem>
                  <SelectItem value={MemberRole.ADMIN}>管理员</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleInviteMember}>
              发送邀请
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑成员弹窗 */}
      <Dialog open={editMemberDialogOpen} onOpenChange={setEditMemberDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑成员信息</DialogTitle>
            <DialogDescription>
              修改成员的基本信息和角色权限
            </DialogDescription>
          </DialogHeader>
          {editingMember && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">姓名</Label>
                <Input
                  id="edit-name"
                  value={editingMember.name}
                  onChange={(e) => setEditingMember(prev => prev ? { ...prev, name: e.target.value } : null)}
                />
              </div>
              <div>
                <Label htmlFor="edit-phone">电话号码</Label>
                <Input
                  id="edit-phone"
                  value={editingMember.phone || ""}
                  onChange={(e) => setEditingMember(prev => prev ? { ...prev, phone: e.target.value } : null)}
                  placeholder="请输入电话号码"
                />
              </div>
              <div>
                <Label htmlFor="edit-role">角色</Label>
                <Select
                  value={editingMember.role}
                  onValueChange={(value) => setEditingMember(prev => prev ? { ...prev, role: value as MemberRole } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={MemberRole.MEMBER}>成员</SelectItem>
                    <SelectItem value={MemberRole.ADMIN}>管理员</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-email">邮箱</Label>
                <Input
                  id="edit-email"
                  value={editingMember.email}
                  readOnly
                  className="bg-gray-50 text-gray-600"
                />
              </div>
              <div>
                <Label htmlFor="edit-created">创建时间</Label>
                <Input
                  id="edit-created"
                  value={formatDateTime(editingMember.createdAt)}
                  readOnly
                  className="bg-gray-50 text-gray-600"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditMemberDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleUpdateMember}>
              保存更改
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 状态确认弹窗 */}
      <AlertDialog open={statusConfirmOpen} onOpenChange={setStatusConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {statusChangeMember?.accountStatus === AccountStatus.ACTIVE ? "禁用" : "启用"}成员账户
            </AlertDialogTitle>
            <AlertDialogDescription>
              {statusChangeMember?.accountStatus === AccountStatus.ACTIVE ? (
                <>
                  您确定要禁用「{statusChangeMember?.name}」的账户吗？
                  禁用后该成员将无法登录系统。
                </>
              ) : (
                <>
                  您确定要启用「{statusChangeMember?.name}」的账户吗？
                  启用后该成员将可以正常登录系统。
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleMemberStatus}>
              {statusChangeMember?.accountStatus === AccountStatus.ACTIVE ? "禁用" : "启用"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 初始密码显示弹窗 */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>成员创建成功</DialogTitle>
            <DialogDescription>
              新成员账户已创建，请复制初始密码并安全地分享给该成员
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">初始密码</div>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2 bg-white border rounded text-lg font-mono">
                  {generatedPassword}
                </code>
                <Button size="sm" variant="outline" onClick={copyPassword}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded">
              <strong>重要提醒：</strong>请务必将此密码安全地告知新成员，并建议其首次登录后立即修改密码。
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setPasswordDialogOpen(false)}>
              我已复制密码
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrganizationDetail;
