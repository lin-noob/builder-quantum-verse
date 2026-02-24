import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table } from "@/components/ui/table";
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
import { Search, RotateCcw, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Member } from "../../../shared/organizationData";
import { useRoleStore } from "@/stores";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";

const MemberManagement = () => {
  const { t } = useTranslation();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string | "ALL">("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [sortField, setSortField] = useState<"lastLoginAt" | "createdAt" | null>("lastLoginAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const { roles } = useRoleStore();

  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [statusConfirmOpen, setStatusConfirmOpen] = useState(false);

  const [inviteForm, setInviteForm] = useState<{ name: string; account: string; role: string; password: string; }>({
    name: "",
    account: "",
    role: "",
    password: "",
  });
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editForm, setEditForm] = useState({ name: "", account: "", password: "", role: "", id: "" });
  const [statusChangeMember, setStatusChangeMember] = useState<Member | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    loadMembers();
  }, [currentPage, searchQuery, selectedRole, selectedStatus, sortField, sortOrder]);

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
      if (res && res.records) {
        setMembers(res.records);
        setTotal(res.total);
      } else {
        setMembers([]);
        setTotal(0);
      }
    } catch (error) {
      toast({ title: t("organization.members.toasts.loadFailed"), description: t("organization.members.toasts.loadFailedDesc"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

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
    if (!inviteForm.name || !inviteForm.account || !inviteForm.password || !inviteForm.role) {
      toast({ title: t("organization.members.toasts.formInvalid"), description: t("organization.members.toasts.formInviteIncomplete"), variant: "destructive" });
      return;
    }

    if (inviteForm.password.length < 6) {
      toast({ title: t("organization.members.toasts.formInvalid"), description: t("organization.members.toasts.passwordTooShort"), variant: "destructive" });
      return;
    }

    try {
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
        toast({ title: t("organization.members.toasts.inviteSuccess"), description: t("organization.members.toasts.inviteSuccessDesc") });
        setInviteDialogOpen(false);
        setInviteForm({ name: "", account: "", role: "", password: "" });
        loadMembers();
      } else {
        toast({ title: t("organization.members.toasts.inviteFailed"), description: res?.msg || t("organization.members.toasts.operationFailed"), variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: t("organization.members.toasts.inviteFailed"), description: error.message || t("organization.members.toasts.networkError"), variant: "destructive" });
    }
  };

  const handleUpdateMember = async () => {
    if (!editingMember) return;
    if (!editForm.name || !editForm.account) {
      toast({ title: t("organization.members.toasts.formInvalid"), description: t("organization.members.toasts.formInviteIncomplete"), variant: "destructive" });
      return;
    }
    if (editForm.password && editForm.password.length < 6) {
      toast({ title: t("organization.members.toasts.formInvalid"), description: t("organization.members.toasts.passwordTooShort"), variant: "destructive" });
      return;
    }
    try {
      const response = await request.put(`/admin/api/v1/users/${editingMember.id}`, {
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
        id: editingMember.id,
      });
      const res = response.data;
      if (res && res.code === "201") {
        toast({ title: t("organization.members.toasts.updateSuccess"), description: t("organization.members.toasts.updateSuccessDesc") });
        setEditDialogOpen(false);
        setEditingMember(null);
        loadMembers();
      } else {
        toast({ title: t("organization.members.toasts.updateFailed"), description: response.data?.msg || t("organization.members.toasts.updateFailedDesc"), variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: t("organization.members.toasts.updateFailed"), description: error.message || t("organization.members.toasts.networkError"), variant: "destructive" });
    }
  };

  const handleToggleStatus = async () => {
    if (!statusChangeMember) return;
    try {
      const isDisabling = statusChangeMember.status === 0;
      const endpoint = isDisabling ? `/admin/api/v1/users/disable/${statusChangeMember.id}` : `/admin/api/v1/users/enable/${statusChangeMember.id}`;
      const response = await request.post(endpoint);
      const res = response.data;
      if (res && res.code === "201") {
        toast({
          title: t("organization.members.toasts.statusUpdated"),
          description: isDisabling ? t("organization.members.toasts.statusUpdatedDescDisable") : t("organization.members.toasts.statusUpdatedDescEnable"),
        });
        setStatusConfirmOpen(false);
        setStatusChangeMember(null);
        loadMembers();
      } else {
        toast({ title: t("organization.members.toasts.statusUpdateFailed"), description: response.data?.msg || t("organization.members.toasts.operationFailed"), variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: t("organization.members.toasts.statusUpdateFailed"), description: error.message || t("organization.members.toasts.networkError"), variant: "destructive" });
    }
  };

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
    setEditForm({ name: member.name, account: member.account, password: "", role: member.roleId || "", id: member.id });
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
          {t("organization.members.active")}
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-red-100 text-red-800">
        {t("organization.members.disabled")}
      </Badge>
    );
  };

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return t("organization.members.neverLoggedIn");
    return new Date(dateString).toLocaleString(i18n.language || "zh-CN", {
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
    return sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
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
        <Card className="p-6 mb-6 bg-white shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t("organization.members.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="md:w-1/4">
              <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t("organization.members.roleFilter")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{t("organization.members.allRoles")}</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:w-1/4">
              <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as string | "ALL")}>
                <SelectTrigger>
                  <SelectValue placeholder={t("organization.members.statusFilter")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{t("organization.members.allStatus")}</SelectItem>
                  <SelectItem value={"0"}>{t("organization.members.active")}</SelectItem>
                  <SelectItem value={"1"}>{t("organization.members.disabled")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
                {t("organization.members.reset")}
              </Button>
            </div>
          </div>
        </Card>

        <div className="flex items-center gap-4 mb-6">
          <Button onClick={() => setInviteDialogOpen(true)}>{t("organization.members.inviteNew")}</Button>
        </div>

        <Card className="bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">{t("organization.members.table.member")}</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">{t("organization.members.table.role")}</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">{t("organization.members.table.status")}</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer select-none hover:bg-gray-100" onClick={() => handleSort("lastLoginAt")}>
                    <div className="flex items-center gap-2">
                      {t("organization.members.table.lastLoginAt")} {getSortIcon("lastLoginAt")}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer select-none hover:bg-gray-100" onClick={() => handleSort("createdAt")}>
                    <div className="flex items-center gap-2">
                      {t("organization.members.table.createdAt")} {getSortIcon("createdAt")}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">{t("organization.members.table.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900">{member.name}</div>
                        <div className="text-sm text-gray-500">{member.account}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="default" className="bg-blue-100 text-blue-800">{member.roleName}</Badge>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(member.status)}</td>
                    <td className="px-6 py-4 text-xs text-gray-600">{formatDateTime(member.lastlogintime)}</td>
                    <td className="px-6 py-4 text-xs text-gray-600">{formatDateTime(member.createDate)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <button onClick={() => openEditDialog(member)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          {t("organization.members.table.edit")}
                        </button>
                        <button onClick={() => openStatusConfirm(member)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          {member.status === 0 ? t("organization.members.table.disable") : t("organization.members.table.enable")}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {total > 10 && (
            <div className="px-6 py-4 border-t bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-700 order-2 sm:order-1">
                {t("organization.members.pagination.showing", { from: (currentPage - 1) * 10 + 1, to: Math.min(currentPage * 10, total), total })}
              </div>
              <div className="flex items-center gap-2 order-1 sm:order-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))} disabled={currentPage === 1}>
                  {t("organization.members.pagination.prev")}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage((prev) => Math.min(Math.ceil(total / 10), prev + 1))} disabled={currentPage >= Math.ceil(total / 10)}>
                  {t("organization.members.pagination.next")}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("organization.members.inviteDialog.title")}</DialogTitle>
            <DialogDescription>{t("organization.members.inviteDialog.desc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">{t("organization.members.inviteDialog.labels.name")}</Label>
              <Input id="name" placeholder={t("organization.members.inviteDialog.placeholders.name")!} value={inviteForm.name} onChange={(e) => setInviteForm((prev) => ({ ...prev, name: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="account">{t("organization.members.inviteDialog.labels.account")}</Label>
              <Input id="account" placeholder={t("organization.members.inviteDialog.placeholders.account")!} value={inviteForm.account} onChange={(e) => setInviteForm((prev) => ({ ...prev, account: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="password">{t("organization.members.inviteDialog.labels.password")}</Label>
              <Input id="password" type="password" placeholder={t("organization.members.inviteDialog.placeholders.password")!} value={inviteForm.password} onChange={(e) => setInviteForm((prev) => ({ ...prev, password: e.target.value }))} />
              <p className="text-xs text-gray-500 mt-1">{t("organization.members.inviteDialog.passwordHint")}</p>
            </div>
            <div>
              <Label htmlFor="role">{t("organization.members.inviteDialog.labels.role")}</Label>
              <Select value={inviteForm.role} onValueChange={(value) => setInviteForm((prev) => ({ ...prev, role: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder={t("organization.members.inviteDialog.placeholders.role")} />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>{t("organization.members.inviteDialog.cancel")}</Button>
            <Button onClick={handleInviteMember}>{t("organization.members.inviteDialog.send")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("organization.members.editDialog.title")}</DialogTitle>
            <DialogDescription>{t("organization.members.editDialog.desc")}</DialogDescription>
          </DialogHeader>
          {editingMember && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">{t("organization.members.editDialog.labels.name")}</Label>
                <Input id="edit-name" value={editForm.name} onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))} placeholder={t("organization.members.editDialog.placeholders.name")!} />
              </div>
              <div>
                <Label htmlFor="edit-account">{t("organization.members.editDialog.labels.account")}</Label>
                <Input id="edit-account" value={editForm.account} onChange={(e) => setEditForm((prev) => ({ ...prev, account: e.target.value }))} placeholder={t("organization.members.editDialog.placeholders.account")!} />
              </div>
              <div>
                <Label htmlFor="edit-password">{t("organization.members.editDialog.labels.password")}</Label>
                <Input id="edit-password" type="password" value={editForm.password} onChange={(e) => setEditForm((prev) => ({ ...prev, password: e.target.value }))} placeholder={t("organization.members.editDialog.placeholders.password")!} />
                <p className="text-xs text-gray-500 mt-1">{t("organization.members.editDialog.passwordHint")}</p>
              </div>
              <div>
                <Label htmlFor="edit-role">{t("organization.members.editDialog.labels.role")}</Label>
                <Select value={editForm.role} onValueChange={(value) => setEditForm((prev) => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div style={{ display: "none" }}>
                <Label htmlFor="edit-id">{t("organization.members.editDialog.labels.id")}</Label>
                <Input id="edit-id" value={editingMember.id} readOnly className="bg-gray-50 text-gray-600" />
              </div>
              <div>
                <Label htmlFor="edit-created">{t("organization.members.editDialog.labels.createdAt")}</Label>
                <Input id="edit-created" value={formatDateTime(editingMember.createDate)} readOnly className="bg-gray-50 text-gray-600" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditDialogOpen(false); setEditingMember(null); setEditForm({ name: "", account: "", password: "", role: "", id: "" }); }}>
              {t("organization.members.editDialog.cancel")}
            </Button>
            <Button onClick={handleUpdateMember}>{t("organization.members.editDialog.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={statusConfirmOpen} onOpenChange={setStatusConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {statusChangeMember?.status === 0 ? t("organization.members.statusDialog.titleDisable") : t("organization.members.statusDialog.titleEnable")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {statusChangeMember?.status === 0
                ? t("organization.members.statusDialog.descDisable", { name: statusChangeMember?.name })
                : t("organization.members.statusDialog.descEnable", { name: statusChangeMember?.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("organization.members.statusDialog.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleStatus}>
              {statusChangeMember?.status === 0 ? t("organization.members.statusDialog.confirmDisable") : t("organization.members.statusDialog.confirmEnable")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MemberManagement;
