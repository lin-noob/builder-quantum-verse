import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, RotateCcw } from "lucide-react";
import { Member, AccountStatus } from "../../../shared/organizationData";
import {
  useMemberManagement,
  UseMemberManagementProps,
} from "../hooks/useMemberManagement";
import { RoleBadge, StatusBadge } from "@/hooks/use-role";
import { useRoleStore } from "@/stores";

interface MemberTableProps extends UseMemberManagementProps {
  title?: string;
  showFilters?: boolean;
  showSearch?: boolean;
  showPagination?: boolean;
  pageSize?: number;
}

export const MemberTable: React.FC<MemberTableProps> = ({
  title = "成员管理",
  showFilters = true,
  showSearch = true,
  showPagination = true,
  pageSize = 10,
  organizationId,
  apiEndpoint,
  enableEndpoint,
  disableEndpoint,
  onUpdateEndpoint,
  onCreateEndpoint,
  canInvite = true,
  canEdit = true,
  canToggleStatus = true,
  hideActions = false,
  customActions,
}) => {
  const {
    members,
    loading,
    total,
    currentPage,
    totalPages,
    searchQuery,
    selectedRole,
    selectedStatus,
    editingMember,
    statusChangeMember,
    passwordResetMember,
    inviteForm,
    editForm,
    setSearchQuery,
    setSelectedRole,
    setSelectedStatus,
    setCurrentPage,
    setEditingMember,
    setStatusChangeMember,
    setPasswordResetMember,
    setInviteForm,
    setEditForm,
    loadMembers,
    handleInvite,
    handleUpdateMember,
    handleToggleStatus,
    handleResetPassword,
    formatDateTime,
    getStatusBadge,
  } = useMemberManagement({
    organizationId,
    apiEndpoint,
    enableEndpoint,
    disableEndpoint,
    onUpdateEndpoint,
    onCreateEndpoint,
    defaultPageSize: pageSize,
  });

  // 状态管理
  const { roles } = useRoleStore();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  const openEditMemberDialog = (member: Member) => {
    setEditingMember(member);
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

  const openPasswordResetDialog = (member: Member) => {
    setPasswordResetMember(member);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          {canInvite && (
            <Button onClick={() => setInviteDialogOpen(true)}>
              邀请新成员
            </Button>
          )}
        </div>

        {(showSearch || showFilters) && (
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            {showSearch && (
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="搜索成员姓名或邮箱..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            )}

            {showFilters && (
              <div className="flex gap-2">
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">所有角色</SelectItem>
                    <SelectItem value="26138972975989607">管理员</SelectItem>
                    <SelectItem value="MEMBER">成员</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">所有状态</SelectItem>
                    <SelectItem value="ACTIVE">已启用</SelectItem>
                    <SelectItem value="SUSPENDED">已禁用</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>成员信息</TableHead>
                <TableHead>角色</TableHead>
                <TableHead>状态</TableHead>
                {/* {canResetPassword && <TableHead>操作</TableHead>} */}
                <TableHead>最后登录时间</TableHead>
                <TableHead>创建时间</TableHead>
                {!hideActions && <TableHead>操作</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="animate-pulse">加载中...</div>
                  </TableCell>
                </TableRow>
              ) : members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="text-gray-500">暂无成员数据</div>
                  </TableCell>
                </TableRow>
              ) : (
                members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-gray-500">
                          {member.account}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {/* <RoleBadge  roleId={member.roleId}></RoleBadge> */}
                      <Badge
                        variant="default"
                        className="bg-blue-100 text-blue-800"
                      >
                        {member.roleName}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={member.status}></StatusBadge>
                    </TableCell>
                    {/* {canResetPassword && (
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openPasswordResetDialog(member)}
                          className="text-xs"
                        >
                          重置密码
                        </Button>
                      </TableCell>
                    )} */}
                    <TableCell className="text-xs text-gray-600">
                      {formatDateTime(member.lastlogintime)}
                    </TableCell>
                    <TableCell className="text-xs text-gray-600">
                      {formatDateTime(member.createDate)}
                    </TableCell>
                    {!hideActions && (
                      <TableCell>
                        <div className="flex items-center gap-4">
                          {canEdit && (
                            <button
                              onClick={() => openEditMemberDialog(member)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              编辑
                            </button>
                          )}
                          {canToggleStatus && (
                            <button
                              onClick={() => openStatusConfirm(member)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              {member.status === 0 ? "禁用" : "启用"}
                            </button>
                          )}
                          {customActions && customActions(member)}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {total > 10 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t">
            <div className="text-sm text-gray-700 order-2 sm:order-1">
              正在显示 {(currentPage - 1) * pageSize + 1} -{" "}
              {Math.min(currentPage * pageSize, total)} 条，共 {total} 条成员
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

        {/* 邀请成员弹窗 */}
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
                <Label htmlFor="name">姓名</Label>
                <Input
                  id="name"
                  placeholder="请输入成员姓名"
                  value={inviteForm.name}
                  onChange={(e) =>
                    setInviteForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="account">账号</Label>
                <Input
                  id="account"
                  placeholder="请输入成员账号"
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
                <Label htmlFor="password">初始密码</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="请输入初始密码（至少6位）"
                  value={inviteForm.password}
                  onChange={(e) =>
                    setInviteForm((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
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
              <Button
                onClick={() => {
                  setInviteDialogOpen(false);
                  handleInvite(organizationId);
                }}
              >
                邀请
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 编辑成员弹窗 */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>编辑成员</DialogTitle>
              <DialogDescription>
                修改成员的基本信息和角色权限
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">姓名</Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-account">账号</Label>
                <Input
                  id="edit-account"
                  value={editForm.account}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      account: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-password">新密码（留空则不修改）</Label>
                <Input
                  id="edit-password"
                  type="password"
                  placeholder="留空则不修改密码"
                  value={editForm.password}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-role">角色</Label>
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
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
              >
                取消
              </Button>
              <Button
                onClick={() => {
                  handleUpdateMember(organizationId);
                  setEditDialogOpen(false);
                }}
              >
                保存
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 状态确认弹窗 */}
        <AlertDialog
          open={statusConfirmOpen}
          onOpenChange={setStatusConfirmOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {statusChangeMember?.status === 0 ? "禁用" : "启用"}
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
                {statusChangeMember?.status === 0 ? "禁用" : "启用"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* 密码重置弹窗 */}
        <AlertDialog
          open={passwordDialogOpen}
          onOpenChange={setPasswordDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>重置密码</AlertDialogTitle>
              <AlertDialogDescription>
                确定要重置成员 "{passwordResetMember?.name}" 的密码吗？
                系统将自动生成一个新的随机密码。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction onClick={handleResetPassword}>
                确定
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};
