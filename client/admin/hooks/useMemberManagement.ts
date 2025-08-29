import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Member, AccountStatus } from "../../../shared/organizationData";
import { request } from "@/lib/request";
import { useRoleStore } from "@/stores";

export interface MemberManagementProps {
  organizationId?: string;
  apiEndpoint: string;
  enableEndpoint?: string;
  disableEndpoint?: string;
  onUpdateEndpoint?: string;
  onCreateEndpoint?: string;
  onInvite?: (data: any) => Promise<void>;
  onUpdate?: (data: any) => Promise<void>;
  onToggleStatus?: (member: Member, isDisabling: boolean) => Promise<void>;
  onResetPassword?: (member: Member) => Promise<void>;
  canInvite?: boolean;
  canEdit?: boolean;
  canToggleStatus?: boolean;
  canResetPassword?: boolean;
  hideActions?: boolean;
  customActions?: (member: Member) => React.ReactNode;
}

export interface UseMemberManagementOptions {
  organizationId?: string;
  apiEndpoint: string;
  enableEndpoint?: string;
  disableEndpoint?: string;
  onUpdateEndpoint?: string;
  onCreateEndpoint?: string;
  defaultPageSize?: number;
}

export interface UseMemberManagementReturn {
  members: Member[];
  loading: boolean;
  total: number;
  currentPage: number;
  totalPages: number;
  searchQuery: string;
  selectedRole: string;
  selectedStatus: string | "ALL";
  sortField: "lastLoginAt" | "createdAt" | null;
  sortOrder: "asc" | "desc";
  editingMember: Member | null;
  statusChangeMember: Member | null;
  passwordResetMember: Member | null;
  inviteForm: any;
  editForm: any;
  setSearchQuery: (query: string) => void;
  setSelectedRole: (role: string) => void;
  setSelectedStatus: (status: string | "ALL") => void;
  setCurrentPage: (page: number) => void;
  setSortField: (field: "lastLoginAt" | "createdAt" | null) => void;
  setSortOrder: (order: "asc" | "desc") => void;
  setEditingMember: (member: Member | null) => void;
  setStatusChangeMember: (member: Member | null) => void;
  setPasswordResetMember: (member: Member | null) => void;
  setInviteForm: (form: any) => void;
  setEditForm: (form: any) => void;
  loadMembers: () => Promise<void>;
  handleInvite: (id: string) => Promise<void>;
  handleUpdateMember: (id: string) => Promise<void>;
  handleToggleStatus: () => Promise<void>;
  handleResetPassword: () => Promise<void>;
  formatDateTime: (dateString: string | null | undefined) => string;
  getRoleBadge: (role: string) => React.ReactNode;
  getStatusBadge: (status: number) => React.ReactNode;
}

export const useMemberManagement = (
  options: UseMemberManagementOptions,
): UseMemberManagementReturn => {
  const {
    organizationId,
    apiEndpoint,
    enableEndpoint,
    disableEndpoint,
    onUpdateEndpoint,
    onCreateEndpoint,
    defaultPageSize = 10,
  } = options;

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string | "ALL">("ALL");
  const [sortField, setSortField] = useState<
    "lastLoginAt" | "createdAt" | null
  >("lastLoginAt");
  const { roles, isLoading: rolesLoading } = useRoleStore();
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [statusChangeMember, setStatusChangeMember] = useState<Member | null>(
    null,
  );
  const [passwordResetMember, setPasswordResetMember] = useState<Member | null>(
    null,
  );
  const [inviteForm, setInviteForm] = useState({
    name: "",
    account: "",
    role: "",
    password: "",
  });
  const [editForm, setEditForm] = useState({
    name: "",
    account: "",
    role: "",
    password: "",
  });
  const { toast } = useToast();

  const loadMembers = useCallback(async () => {
    setLoading(true);
    try {
      const payload: any = {
        current: currentPage,
        size: defaultPageSize,
      };

      // 如果有组织ID，添加到payload
      if (organizationId) {
        payload.shopid = organizationId;
      }

      // 添加搜索条件
      if (searchQuery) {
        payload.name = searchQuery;
      }

      // 添加状态过滤
      if (selectedStatus !== "ALL") {
        payload.status = selectedStatus === "ACTIVE" ? 0 : 1;
      }

      // 添加角色过滤
      if (selectedRole !== "ALL") {
        payload.roleId = selectedRole;
      }

      const response = await request.post(apiEndpoint, payload);

      const result = response.data;

      if (result.code === "201") {
        setMembers(result.data.records || []);
        setTotal(result.data.total || 0);
        setTotalPages(result.data.pages || 0);
      } else {
        toast({
          title: "加载失败",
          description: result.msg || "加载成员列表失败",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to load members:", error);
      toast({
        title: "加载失败",
        description: "网络错误，请重试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [
    apiEndpoint,
    currentPage,
    defaultPageSize,
    organizationId,
    searchQuery,
    selectedStatus,
    selectedRole,
    toast,
  ]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const handleInvite = async (id: string) => {
    if (!inviteForm.name || !inviteForm.account || !inviteForm.password) {
      toast({
        title: "表单验证失败",
        description: "请填写完整的邀请信息",
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
      const response = await request.post("/admin/api/v1/company/user", {
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
        shopid: id,
      });

      const result = response.data;

      if (result.code === "201") {
        toast({
          title: "邀请成功",
          description: `新成员已创建`,
        });
        setInviteForm({
          name: "",
          account: "",
          role: "",
          password: "",
        });
        loadMembers();
        return true;
      } else {
        toast({
          title: "邀请失败",
          description: result.msg || "邀请成员失败",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Failed to invite member:", error);
      toast({
        title: "邀请失败",
        description: "网络错误，请重试",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleUpdateMember = async (id:string) => {
    if (!editingMember) return;

    if (!editForm.name || !editForm.account) {
      toast({
        title: "表单验证失败",
        description: "用户名和账号不能为空",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await request.put(
        `/admin/api/v1/company/user/${editingMember.id}`,
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
          id: editingMember.id,
          shopid: id,
        },
      );

      const result = response.data;

      if (result.code === "201") {
        toast({
          title: "更新成功",
          description: "成员信息已更新",
        });
        setEditingMember(null);
        loadMembers();
        return true;
      } else {
        toast({
          title: "更新失败",
          description: result.msg || "更新成员信息失败",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Failed to update member:", error);
      toast({
        title: "更新失败",
        description: "网络错误，请重试",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleToggleStatus = async () => {
    if (!statusChangeMember) return;

    try {
      const isDisabling = statusChangeMember.status === 0;
      const endpoint = isDisabling
        ? `/admin/api/v1/users/disable/${statusChangeMember.id}`
        : `/admin/api/v1/users/enable/${statusChangeMember.id}`;

      const response = await request.post(endpoint);

      const result = response.data;

      if (result.code === "201") {
        toast({
          title: "状态更新成功",
          description: isDisabling ? "用户已被禁用" : "用户已被启用",
        });
        setStatusChangeMember(null);
        loadMembers();
        return true;
      } else {
        toast({
          title: "状态更新失败",
          description: result.msg || "更新用户状态失败",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Failed to toggle member status:", error);
      toast({
        title: "状态更新失败",
        description: "网络错误，请重试",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleResetPassword = async () => {
    if (!passwordResetMember) return;

    try {
      const newPassword = Math.random().toString(36).slice(-8);

      const response = await fetch(
        `/admin/api/v1/users/reset-password/${passwordResetMember.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            newPassword: newPassword,
          }),
        },
      );

      const result = await response.json();

      if (result.code === "201") {
        toast({
          title: "密码重置成功",
          description: `新密码已生成`,
        });
        setPasswordResetMember(null);
        return true;
      } else {
        toast({
          title: "密码重置失败",
          description: result.msg || "重置密码失败",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Failed to reset password:", error);
      toast({
        title: "密码重置失败",
        description: "网络错误，请重试",
        variant: "destructive",
      });
      return false;
    }
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

  const getStatusBadge = (status: number) => {};

  return {
    members,
    loading,
    total,
    currentPage,
    totalPages,
    searchQuery,
    selectedRole,
    selectedStatus,
    sortField,
    sortOrder,
    editingMember,
    statusChangeMember,
    passwordResetMember,
    inviteForm,
    editForm,
    setSearchQuery,
    setSelectedRole,
    setSelectedStatus,
    setCurrentPage,
    setSortField,
    setSortOrder,
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
  };
};
