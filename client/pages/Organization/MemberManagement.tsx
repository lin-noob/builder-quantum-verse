import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { request } from "@/lib/request";
import {
  Users,
  Search,
  Edit,
  UserCheck,
  UserX,
  Shield,
  User,
  Mail,
  Calendar,
  Eye,
  Copy,
  RotateCcw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  Member,
  MemberRole,
  AccountStatus,
  InviteMemberRequest,
  UpdateMemberRequest,
  MemberListQuery,
  generateInitialPassword,
} from "../../../shared/organizationData";
import { useRoleStore } from "@/stores";

const MemberManagement = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string | "ALL">("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);

  // 排序状态
  const [sortField, setSortField] = useState<
    "lastLoginAt" | "createdAt" | null
  >("lastLoginAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const { roles, isLoading: rolesLoading } = useRoleStore();
  // 弹窗状态
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  // 表单状态
  const [inviteForm, setInviteForm] = useState<{
    name: string;
    account: string;
    role: string;
    password: string;
  }>({
    name: "",
    account: "",
    role: "",
    password: "",
  });
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    account: "",
    password: "",
    role: "",
    id: "",
  });
  const [statusChangeMember, setStatusChangeMember] = useState<Member | null>(
    null,
  );
  const [generatedPassword, setGeneratedPassword] = useState<string>("");

  const { toast } = useToast();

  // 当前组织ID（实际��用中应该从认证上下文获取）
  const currentOrganizationId = "org_demo_001";

  useEffect(() => {
    loadMembers();
  }, [
    currentPage,
    searchQuery,
    selectedRole,
    selectedStatus,
    sortField,
    sortOrder,
  ]);

  // Set default role when roles are loaded
  useEffect(() => {
    if (roles.length > 0 && !inviteForm.role) {
      const defaultRole = roles.find((role) => !role.isSystem) || roles[0];
      if (defaultRole) {
        setInviteForm((prev) => ({ ...prev, role: defaultRole.id }));
      }
    }
  }, [roles, inviteForm.role]);

  const loadMembers = async () => {
    try {
      setLoading(true);

      // 使用新的API接口获取成员列表
      const response = await request.post("/admin/api/v1/users/list", {
        page: currentPage,
        limit: 10,
        searchKeywords: searchQuery || undefined,
        roleid: selectedRole === "ALL" ? undefined : selectedRole,
        status: selectedStatus === "ALL" ? undefined : selectedStatus,
        sort: sortField ? getSortFieldMapping(sortField) : undefined,
        order: sortOrder,
      });

      const res = response.data.data;
      // 处理API响应数据
      if (res && res.records) {
        setMembers(res.records);
        setTotal(res.total);
      } else {
        setMembers([]);
        setTotal(0);
      }
    } catch (error) {
      console.error("Failed to load members:", error);
      toast({
        title: "加载失败",
        description: "无法加载成员列表，请重试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // 将前端排序字段映射为API字段
  const getSortFieldMapping = (field: string) => {
    switch (field) {
      case "lastLoginAt":
        return "lastlogintime";
      case "createdAt":
        return "createDate";
      default:
        return "create_date";
    }
  };

  const handleInviteMember = async () => {
    if (
      !inviteForm.name ||
      !inviteForm.account ||
      !inviteForm.password ||
      !inviteForm.role
    ) {
      toast({
        title: "表单验证失败",
        description: "请填写完整的邀请信息（用户名、账号、密码）",
        variant: "destructive",
      });
      return;
    }

    if (inviteForm.password.length < 6) {
      toast({
        title: "表单验证失败",
        description: "密码长度至少为6位",
        variant: "destructive",
      });
      return;
    }

    try {
      // 使用新的API接口邀请成员
      const response = await request.post("/admin/api/v1/users", {
        account: inviteForm.account,
        name: inviteForm.name,
        password: inviteForm.password,
        roles: inviteForm.role ? [inviteForm.role] : [],
        datalimits: [],
        groups: [],
        deptid: "",
        disable: false,
        losingEffect: "2033-11-13",
        state: true,
      });
      const res = response.data;
      if (res.code === "201") {
        toast({
          title: "邀请成功",
          description: `新成员已创建`,
        });

        setInviteDialogOpen(false);
        setInviteForm({
          name: "",
          account: "",
          role: "",
          password: "",
        });
        loadMembers();
      } else {
        toast({
          title: "邀请失败",
          description: res?.msg || "邀请成员失败",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Failed to invite member:", error);
      toast({
        title: "邀请失败",
        description: error.message || "网络错误，请重试",
        variant: "destructive",
      });
    }
  };

  const handleUpdateMember = async () => {
    if (!editingMember) return;

    if (!editForm.name || !editForm.account) {
      toast({
        title: "表单验证失败",
        description: "用户名和账号不能为空",
        variant: "destructive",
      });
      return;
    }

    if (editForm.password && editForm.password.length < 6) {
      toast({
        title: "表单验证失败",
        description: "密码长度至少为6位",
        variant: "destructive",
      });
      return;
    }

    try {
      // 使用新的API接口更新成员信息
      const response = await request.put(
        `/admin/api/v1/users/${editingMember.id}`,
        {
          account: editForm.account,
          name: editForm.name,
          password: editForm.password || "",
          roles: editForm.role ? [editForm.role] : [],
          datalimits: [],
          groups: [],
          deptid: null,
          disable: false,
          losingEffect: "2035-08-26T16:00:00.000Z",
          state: true,
          id: editingMember.id
        },
      );

      const res = response.data;

      if (res && res.code === "201") {
        toast({
          title: "更新成功",
          description: "成员信息已更新",
        });

        setEditDialogOpen(false);
        setEditingMember(null);
        loadMembers();
      } else {
        toast({
          title: "更新失败",
          description: response.data?.msg || "更新成员信息失败",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Failed to update member:", error);
      toast({
        title: "更新失败",
        description: error.message || "网络错误，请重试",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async () => {
    if (!statusChangeMember) return;

    try {
      // 根据当前状态决定是禁用还是启用
      const isDisabling = statusChangeMember.status === 0;
      const endpoint = isDisabling
        ? `/admin/api/v1/users/disable/${statusChangeMember.id}`
        : `/admin/api/v1/users/enable/${statusChangeMember.id}`;

      const response = await request.post(endpoint);
      const res = response.data
      if (res && res.code === "201") {
        toast({
          title: "状态更新成功",
          description: isDisabling ? "用户已被禁用" : "用户已被启用",
        });

        setStatusConfirmOpen(false);
        setStatusChangeMember(null);
        loadMembers();
      } else {
        toast({
          title: "状态更新失败",
          description: response.data?.msg || "操作失败，请重试",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Failed to toggle member status:", error);
      toast({
        title: "状态更新失败",
        description: error.message || "网络错误，请重试",
        variant: "destructive",
      });
    }
  };

  // 成员列表（排序由API处理）
  const sortedMembers = members;

  const handleSort = (field: "lastLoginAt" | "createdAt") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const openEditDialog = (member: Member) => {
    setEditingMember({ ...member });
    setEditForm({
      name: member.name,
      account: member.account,
      password: "",
      role: member.roleId || "",
      id: member.id,
    });
    setEditDialogOpen(true);
  };

  const openStatusConfirm = (member: Member) => {
    setStatusChangeMember(member);
    setStatusConfirmOpen(true);
  };

  const getStatusBadge = (status: number) => {
    if (status === 0) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          活跃
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary" className="bg-red-100 text-red-800">
          已禁用
        </Badge>
      );
    }
  };

  const getRoleBadge = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId);
    if (!role) return <Badge variant="outline">未知角色</Badge>;

    return (
      <Badge variant="default" className="bg-blue-100 text-blue-800">
        {role.name}
      </Badge>
    );
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
                placeholder="搜索姓名、邮箱..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* 角色筛选 */}
            <div className="md:w-1/4">
              <Select
                value={selectedRole}
                onValueChange={(value) => setSelectedRole(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="角色筛选" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">所有角色</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 状态筛选 */}
            <div className="md:w-1/4">
              <Select
                value={selectedStatus}
                onValueChange={(value) =>
                  setSelectedStatus(value as string | "ALL")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="状态筛选" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">所有状态</SelectItem>
                  <SelectItem value={"0"}>活跃</SelectItem>
                  <SelectItem value={"1"}>已禁用</SelectItem>
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
                  setSelectedRole("ALL");
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
          <Button onClick={() => setInviteDialogOpen(true)}>邀请新成员</Button>
        </div>

        {/* 成员列表卡片 */}
        <Card className="bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    成员
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    角色
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    状态
                  </th>
                  <th
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer select-none hover:bg-gray-100"
                    onClick={() => handleSort("lastLoginAt")}
                  >
                    <div className="flex items-center gap-2">
                      最后登录时间
                      {getSortIcon("lastLoginAt")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer select-none hover:bg-gray-100"
                    onClick={() => handleSort("createdAt")}
                  >
                    <div className="flex items-center gap-2">
                      创建时间
                      {getSortIcon("createdAt")}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900">
                          {member.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {member.account}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getRoleBadge(member.roleId)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(member.status)}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600">
                      {formatDateTime(member.lastlogintime)}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600">
                      {formatDateTime(member.createDate)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => openEditDialog(member)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => openStatusConfirm(member)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          {member.status === 0 ? "禁用" : "启用"}
                        </button>
                        {/* <button
                          onClick={() => handleResetPassword(member)}
                          className="text-orange-600 hover:text-orange-800 text-sm font-medium"
                        >
                          重置密码
                        </button> */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          {total > 10 && (
            <div className="px-6 py-4 border-t bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-700 order-2 sm:order-1">
                正在显示 {(currentPage - 1) * 10 + 1} -{" "}
                {Math.min(currentPage * 10, total)} 条，共 {total} 条
              </div>
              <div className="flex items-center gap-2 order-1 sm:order-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                >
                  上一页
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(Math.ceil(total / 10), prev + 1),
                    )
                  }
                  disabled={currentPage >= Math.ceil(total / 10)}
                >
                  下一页
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* 邀请新成员弹窗 */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>邀请新成员</DialogTitle>
            <DialogDescription>
              为组织添加新的团队成员，系统将自动生成���始密码
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">用户名 *</Label>
              <Input
                id="name"
                placeholder="请输入用户名"
                value={inviteForm.name}
                onChange={(e) =>
                  setInviteForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="account">账号 *</Label>
              <Input
                id="account"
                placeholder="请输入账号（邮箱或用户名）"
                value={inviteForm.account}
                onChange={(e) =>
                  setInviteForm((prev) => ({
                    ...prev,
                    account: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="password">登录密码 *</Label>
              <Input
                id="password"
                type="password"
                placeholder="请输入登录密码（至少6位）"
                value={inviteForm.password}
                onChange={(e) =>
                  setInviteForm((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                密码长度至少为6位字符
              </p>
            </div>
            <div>
              <Label htmlFor="role">角色 *</Label>
              <Select
                value={inviteForm.role}
                onValueChange={(value) =>
                  setInviteForm((prev) => ({
                    ...prev,
                    role: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择角色" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setInviteDialogOpen(false)}
            >
              取消
            </Button>
            <Button onClick={handleInviteMember}>发送邀请</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑成员弹窗 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑成员信息</DialogTitle>
            <DialogDescription>修改成员的基本信息和角色权限</DialogDescription>
          </DialogHeader>
          {editingMember && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">用户名 *</Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="请输入用户名"
                />
              </div>
              <div>
                <Label htmlFor="edit-account">账号 *</Label>
                <Input
                  id="edit-account"
                  value={editForm.account}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      account: e.target.value,
                    }))
                  }
                  placeholder="请输入账号（邮箱或用户名）"
                />
              </div>
              <div>
                <Label htmlFor="edit-password">登录密码</Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={editForm.password}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  placeholder="留空表示不修改密码"
                />
                <p className="text-xs text-gray-500 mt-1">
                  留空则不修改原密码，如需修改请输入新密码（至少6位）
                </p>
              </div>
              <div>
                <Label htmlFor="edit-role">角色 *</Label>
                <Select
                  value={editForm.role}
                  onValueChange={(value) =>
                    setEditForm((prev) => ({
                      ...prev,
                      role: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div style={{ display: "none" }}>
                <Label htmlFor="edit-id">用户ID</Label>
                <Input
                  id="edit-id"
                  value={editingMember.id}
                  readOnly
                  className="bg-gray-50 text-gray-600"
                />
              </div>
              <div>
                <Label htmlFor="edit-created">创建时间</Label>
                <Input
                  id="edit-created"
                  value={formatDateTime(editingMember.createDate)}
                  readOnly
                  className="bg-gray-50 text-gray-600"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false);
                setEditingMember(null);
                setEditForm({
                  name: "",
                  account: "",
                  password: "",
                  role: "",
                  id: "",
                });
              }}
            >
              取消
            </Button>
            <Button onClick={handleUpdateMember}>保存更改</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 状态确认弹窗 */}
      <AlertDialog open={statusConfirmOpen} onOpenChange={setStatusConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {statusChangeMember?.status === 0
                ? "禁用"
                : "启用"}
              成员账户
            </AlertDialogTitle>
            <AlertDialogDescription>
              {statusChangeMember?.status === 0 ? (
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
            <AlertDialogAction onClick={handleToggleStatus}>
              {statusChangeMember?.status === 0
                ? "禁用"
                : "启用"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MemberManagement;
