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
// Dropdown menu imports removed - using direct buttons instead
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
} from "lucide-react";
import {
  Member,
  MemberRole,
  AccountStatus,
  InviteMemberRequest,
  UpdateMemberRequest,
  MemberListQuery,
} from "../../../shared/organizationData";
import { memberApi } from "../../../shared/organizationApi";

const MemberManagement = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<MemberRole | "ALL">("ALL");
  const [selectedStatus, setSelectedStatus] = useState<AccountStatus | "ALL">(
    "ALL",
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // 排序状态
  const [sortField, setSortField] = useState<'lastLoginAt' | 'createdAt' | null>('lastLoginAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // 弹窗状态
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  // 表单状态
  const [inviteForm, setInviteForm] = useState<InviteMemberRequest>({
    email: "",
    role: MemberRole.MEMBER,
    password: "",
  });
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [statusChangeMember, setStatusChangeMember] = useState<Member | null>(
    null,
  );
  const [generatedPassword, setGeneratedPassword] = useState<string>("");

  const { toast } = useToast();

  // 当前组织ID（实际应用中应该从认证上下文获取）
  const currentOrganizationId = "org_demo_001";

  useEffect(() => {
    loadMembers();
  }, [currentPage, searchQuery, selectedRole, selectedStatus]);

  const loadMembers = async () => {
    try {
      setLoading(true);

      const query: MemberListQuery = {
        page: currentPage,
        limit: 10,
        search: searchQuery,
        role: selectedRole === "ALL" ? undefined : selectedRole,
        status: selectedStatus === "ALL" ? undefined : selectedStatus,
      };

      const response = await memberApi.getMembers(currentOrganizationId, query);
      setMembers(response.data);
      setTotalPages(response.totalPages);
      setTotal(response.total);
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

  const handleInviteMember = async () => {
    if (!inviteForm.email || !inviteForm.role) {
      toast({
        title: "表单��证失败",
        description: "请填写完整的邀请信息",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await memberApi.inviteMember(
        currentOrganizationId,
        inviteForm,
      );

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
        description: "网络��误，请重试",
        variant: "destructive",
      });
    }
  };

  const handleUpdateMember = async () => {
    if (!editingMember) return;

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

        setEditDialogOpen(false);
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
        title: "���新失败",
        description: "网络错误，请重试",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async () => {
    if (!statusChangeMember) return;

    try {
      const response = await memberApi.toggleMemberStatus(
        statusChangeMember.memberId,
      );

      if (response.success) {
        toast({
          title: "状态更新成功",
          description: response.message,
        });

        setStatusConfirmOpen(false);
        setStatusChangeMember(null);
        loadMembers();
      } else {
        toast({
          title: "状态更��失败",
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

  const openEditDialog = (member: Member) => {
    setEditingMember({ ...member });
    setEditDialogOpen(true);
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

  const getRoleBadge = (role: MemberRole) => {
    if (role === MemberRole.ADMIN) {
      return (
        <Badge variant="default" className="bg-blue-100 text-blue-800">
          管理员
        </Badge>
      );
    } else {
      return <Badge variant="outline">成员</Badge>;
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "从未登录";
    return new Date(dateString).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 排序函数
  const sortMembers = (members: Member[]) => {
    if (!sortField) return members;

    return [...members].sort((a, b) => {
      let aValue: string | null = null;
      let bValue: string | null = null;

      if (sortField === 'lastLoginAt') {
        aValue = a.lastLoginAt;
        bValue = b.lastLoginAt;
      } else if (sortField === 'createdAt') {
        aValue = a.createdAt;
        bValue = b.createdAt;
      }

      // 处理null值，null值排在最后
      if (!aValue && !bValue) return 0;
      if (!aValue) return 1;
      if (!bValue) return -1;

      const dateA = new Date(aValue).getTime();
      const dateB = new Date(bValue).getTime();

      if (sortOrder === 'desc') {
        return dateB - dateA;
      } else {
        return dateA - dateB;
      }
    });
  };

  // 获取排序后的成员列表
  const sortedMembers = sortMembers(members);

  const handleSort = (field: 'lastLoginAt' | 'createdAt') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
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
    <div className="p-6 space-y-6">
      {/* 搜索和过滤 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 mb-6">
            {/* 筛选一行 */}
            <div className="flex flex-col sm:flex-row gap-4 items-end justify-between">
              <div className="flex flex-col sm:flex-row gap-4 items-end flex-1">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="按姓名或邮箱搜索成员..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select
                  value={selectedRole}
                  onValueChange={(value) =>
                    setSelectedRole(value as MemberRole | "ALL")
                  }
                >
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="角色筛选" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">所有角色</SelectItem>
                    <SelectItem value={MemberRole.ADMIN}>管理员</SelectItem>
                    <SelectItem value={MemberRole.MEMBER}>成员</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={selectedStatus}
                  onValueChange={(value) =>
                    setSelectedStatus(value as AccountStatus | "ALL")
                  }
                >
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="���态筛选" />
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
                    setSearchQuery("");
                    setSelectedRole("ALL");
                    setSelectedStatus("ALL");
                    setCurrentPage(1);
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
                      onClick={() => handleSort('lastLoginAt')}
                      className="flex items-center gap-1 hover:text-gray-900"
                    >
                      最后登录时间
                      {sortField === 'lastLoginAt' && (
                        <span className="text-xs">
                          {sortOrder === 'desc' ? '↓' : '↑'}
                        </span>
                      )}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort('createdAt')}
                      className="flex items-center gap-1 hover:text-gray-900"
                    >
                      创建时间
                      {sortField === 'createdAt' && (
                        <span className="text-xs">
                          {sortOrder === 'desc' ? '↓' : '↑'}
                        </span>
                      )}
                    </button>
                  </TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedMembers.map((member) => (
                  <TableRow key={member.memberId}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-gray-500">
                          {member.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(member.role)}</TableCell>
                    <TableCell>
                      {getStatusBadge(member.accountStatus)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDate(member.lastLoginAt)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDate(member.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            openEditDialog(member);
                          }}
                        >
                          编辑
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            openStatusConfirm(member);
                          }}
                        >
                          {member.accountStatus === AccountStatus.ACTIVE ? '禁用' : '启用'}
                        </Button>
                      </div>
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
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
              >
                下一页
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 邀请新成员弹窗 */}
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
                onChange={(e) =>
                  setInviteForm((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="role">角色</Label>
              <Select
                value={inviteForm.role}
                onValueChange={(value) =>
                  setInviteForm((prev) => ({
                    ...prev,
                    role: value as MemberRole,
                  }))
                }
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
      <Dialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          console.log("Dialog onOpenChange:", open);
          setEditDialogOpen(open);
          if (!open) {
            setEditingMember(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>编辑成员信息</DialogTitle>
            <DialogDescription>修改成员的基本信息和角色权限</DialogDescription>
          </DialogHeader>
          {editingMember && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">姓名</Label>
                <Input
                  id="edit-name"
                  value={editingMember.name}
                  onChange={(e) =>
                    setEditingMember((prev) =>
                      prev ? { ...prev, name: e.target.value } : null,
                    )
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-phone">电话号码</Label>
                <Input
                  id="edit-phone"
                  value={editingMember.phone || ""}
                  onChange={(e) =>
                    setEditingMember((prev) =>
                      prev ? { ...prev, phone: e.target.value } : null,
                    )
                  }
                  placeholder="请输入电话号码"
                />
              </div>
              <div>
                <Label htmlFor="edit-role">角色</Label>
                <Select
                  value={editingMember.role}
                  onValueChange={(value) =>
                    setEditingMember((prev) =>
                      prev ? { ...prev, role: value as MemberRole } : null,
                    )
                  }
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
                  value={formatDate(editingMember.createdAt)}
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
                console.log("Cancel button clicked");
                setEditDialogOpen(false);
                setEditingMember(null);
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
              {statusChangeMember?.accountStatus === AccountStatus.ACTIVE
                ? "禁用"
                : "启用"}
              成员账户
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
            <AlertDialogAction onClick={handleToggleStatus}>
              {statusChangeMember?.accountStatus === AccountStatus.ACTIVE
                ? "禁用"
                : "启用"}
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
              <strong>重要提醒：</strong>
              请务必将此密码安全地告知新成员，并建议其首次登录后立即修改密码。
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

export default MemberManagement;
