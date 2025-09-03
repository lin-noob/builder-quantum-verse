import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Users,
  UserPlus,
  Settings,
  BarChart3,
  Check,
  X,
  Edit,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { organizationApi, type Organization, type OrganizationMember } from "@/shared/organizationApi";
import { toast } from "@/hooks/use-toast";

// 🚀 自定义防抖Hook
function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// 🎯 优化的成员行组件
const MemberRow = React.memo<{
  member: OrganizationMember;
  onStatusToggle: (memberId: string, status: "active" | "inactive") => void;
  onEdit: (member: OrganizationMember) => void;
}>(({ member, onStatusToggle, onEdit }) => (
  <TableRow>
    <TableCell>
      <div>
        <div className="font-medium">{member.name}</div>
        <div className="text-sm text-gray-500">{member.email}</div>
      </div>
    </TableCell>
    <TableCell>
      <Badge variant={member.role === "admin" ? "default" : "secondary"}>
        {member.role === "admin" ? "管理员" : "成员"}
      </Badge>
    </TableCell>
    <TableCell>
      <Badge
        variant={member.status === "active" ? "default" : "secondary"}
        className={member.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
      >
        {member.status === "active" ? "活跃" : "禁用"}
      </Badge>
    </TableCell>
    <TableCell className="text-sm text-gray-500">
      {new Date(member.joinedAt).toLocaleDateString("zh-CN")}
    </TableCell>
    <TableCell>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onStatusToggle(
            member.id,
            member.status === "active" ? "inactive" : "active"
          )}
        >
          {member.status === "active" ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(member)}
        >
          <Edit className="h-4 w-4" />
        </Button>
      </div>
    </TableCell>
  </TableRow>
));

// 🎯 优化的统计卡片组件
const StatsCard = React.memo<{
  title: string;
  value: number | string;
  description?: string;
  icon: React.ReactNode;
}>(({ title, value, description, icon }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </CardContent>
  </Card>
));

// 🚀 主组件 - 性能优化版本
const OrganizationDetailOptimized: React.FC = () => {
  const { organizationId } = useParams<{ organizationId: string }>();
  
  // 基础状态
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 成员列表状态
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [selectedMemberRole, setSelectedMemberRole] = useState<string>("all");
  const [selectedMemberStatus, setSelectedMemberStatus] = useState<string>("all");
  const [memberSortField, setMemberSortField] = useState<string>("name");
  const [memberSortOrder, setMemberSortOrder] = useState<"asc" | "desc">("asc");
  
  // 分页状态
  const [currentMemberPage, setCurrentMemberPage] = useState(1);
  const [totalMembers, setTotalMembers] = useState(0);
  const membersPerPage = 10; // 🎯 后端分页，每页10个
  
  // 对话框状态
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isEditMemberDialogOpen, setIsEditMemberDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<OrganizationMember | null>(null);

  // 防抖搜索查询
  const debouncedSearchQuery = useDebouncedValue(memberSearchQuery, 300);
  
  // 避免重复初始加载
  const initialLoadRef = useRef(true);

  // 🎯 优化的数据加载函数
  const loadOrganization = useCallback(async () => {
    if (!organizationId) return;
    
    try {
      const response = await organizationApi.getOrganization(organizationId);
      setOrganization(response.data);
    } catch (error) {
      console.error("Failed to load organization:", error);
      setError("加载组织信息失败");
    }
  }, [organizationId]);

  const loadMembers = useCallback(async (page = 1, resetLoading = false) => {
    if (!organizationId) return;
    
    if (resetLoading) setLoading(true);
    
    try {
      // 🚀 后端分页查询，减少数据传输和前端渲染负担
      const response = await organizationApi.getMembers(organizationId, {
        page,
        limit: membersPerPage,
        search: debouncedSearchQuery || undefined,
        role: selectedMemberRole !== "all" ? selectedMemberRole : undefined,
        status: selectedMemberStatus !== "all" ? selectedMemberStatus : undefined,
        sortBy: memberSortField,
        sortOrder: memberSortOrder,
      });
      
      setMembers(response.data);
      setTotalMembers(response.total);
      setCurrentMemberPage(page);
    } catch (error) {
      console.error("Failed to load members:", error);
      setError("加载成员列表失败");
      // 如果是API错误，使用模拟数据
      setMembers([]);
      setTotalMembers(0);
    } finally {
      setLoading(false);
    }
  }, [
    organizationId, 
    debouncedSearchQuery, 
    selectedMemberRole, 
    selectedMemberStatus, 
    memberSortField, 
    memberSortOrder,
    membersPerPage
  ]);

  // 🎯 避免重复的初始加载
  useEffect(() => {
    if (!organizationId) return;
    
    const initializeData = async () => {
      if (initialLoadRef.current) {
        initialLoadRef.current = false;
        await Promise.all([
          loadOrganization(),
          loadMembers(1, true)
        ]);
      }
    };
    
    initializeData();
  }, [organizationId, loadOrganization, loadMembers]);

  // 🎯 搜索和筛选变化时重新加载（仅重新加载成员）
  useEffect(() => {
    if (!initialLoadRef.current) {
      loadMembers(1, false);
      setCurrentMemberPage(1);
    }
  }, [debouncedSearchQuery, selectedMemberRole, selectedMemberStatus, memberSortField, memberSortOrder]);

  // 🎯 使用useMemo优化统计计算
  const memberStats = useMemo(() => {
    if (!organization) return { total: 0, active: 0, admins: 0 };
    
    return {
      total: totalMembers,
      active: members.filter(m => m.status === "active").length,
      admins: members.filter(m => m.role === "admin").length,
    };
  }, [organization, totalMembers, members]);

  // 🎯 使用useMemo优化分页计算
  const paginationInfo = useMemo(() => {
    const totalPages = Math.ceil(totalMembers / membersPerPage);
    const startItem = (currentMemberPage - 1) * membersPerPage + 1;
    const endItem = Math.min(currentMemberPage * membersPerPage, totalMembers);
    
    return {
      totalPages,
      startItem,
      endItem,
      showPagination: totalPages > 1,
    };
  }, [totalMembers, currentMemberPage, membersPerPage]);

  // 🎯 优化事件处理函数
  const handleStatusToggle = useCallback(async (memberId: string, newStatus: "active" | "inactive") => {
    try {
      await organizationApi.updateMember(organizationId!, memberId, { status: newStatus });
      
      // 🚀 局部更新，无需重新请求整个列表
      setMembers(prev => prev.map(member => 
        member.id === memberId ? { ...member, status: newStatus } : member
      ));
      
      toast({
        title: "操作成功",
        description: `成员状态已更新为${newStatus === "active" ? "活跃" : "禁用"}`,
      });
    } catch (error) {
      console.error("Failed to toggle member status:", error);
      toast({
        title: "操作失败",
        description: "更新成员状态失败，请重试",
        variant: "destructive",
      });
    }
  }, [organizationId]);

  const handleEditMember = useCallback((member: OrganizationMember) => {
    setSelectedMember(member);
    setIsEditMemberDialogOpen(true);
  }, []);

  const handleInviteMember = useCallback(async (email: string, role: "admin" | "member") => {
    if (!organizationId) return;
    
    try {
      await organizationApi.inviteMember(organizationId, { email, role });
      
      toast({
        title: "邀请成功",
        description: `已向 ${email} 发送邀请`,
      });
      
      setIsInviteDialogOpen(false);
      
      // 🚀 仅刷新当前页面，无需重新加载组织信息
      loadMembers(currentMemberPage);
    } catch (error) {
      console.error("Failed to invite member:", error);
      toast({
        title: "邀请失败",
        description: "发送邀请失败，请重试",
        variant: "destructive",
      });
    }
  }, [organizationId, currentMemberPage, loadMembers]);

  const handlePageChange = useCallback((page: number) => {
    loadMembers(page, false);
  }, [loadMembers]);

  if (loading && initialLoadRef.current) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-lg">加载中...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-lg text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-lg">组织不存在</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* 组织基本信息 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{organization.name}</h1>
          <p className="text-gray-600">{organization.description}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={organization.status === "active" ? "default" : "secondary"}>
            {organization.status === "active" ? "活跃" : "禁用"}
          </Badge>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            设置
          </Button>
        </div>
      </div>

      {/* 🚀 优化的统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="总成员数"
          value={memberStats.total}
          description="包括所有角色"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <StatsCard
          title="活跃成员"
          value={memberStats.active}
          description={`占总数 ${memberStats.total > 0 ? Math.round((memberStats.active / memberStats.total) * 100) : 0}%`}
          icon={<Users className="h-4 w-4 text-green-600" />}
        />
        <StatsCard
          title="管理员"
          value={memberStats.admins}
          description="拥有管理权限"
          icon={<Users className="h-4 w-4 text-blue-600" />}
        />
        <StatsCard
          title="创建时间"
          value={new Date(organization.createdAt).toLocaleDateString("zh-CN")}
          icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <Tabs defaultValue="members" className="space-y-6">
        <TabsList>
          <TabsTrigger value="members">成员管理</TabsTrigger>
          <TabsTrigger value="settings">组织设置</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>成员列表</CardTitle>
                  <CardDescription>管理组织成员和权限</CardDescription>
                </div>
                <Button onClick={() => setIsInviteDialogOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  邀请成员
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* 🎯 优化的筛选和搜索 */}
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="搜索成员姓名或邮箱..."
                      value={memberSearchQuery}
                      onChange={(e) => setMemberSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedMemberRole} onValueChange={setSelectedMemberRole}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="角色" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有角色</SelectItem>
                    <SelectItem value="admin">管理员</SelectItem>
                    <SelectItem value="member">成员</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedMemberStatus} onValueChange={setSelectedMemberStatus}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有状态</SelectItem>
                    <SelectItem value="active">活跃</SelectItem>
                    <SelectItem value="inactive">禁用</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 成员表格 */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>用户</TableHead>
                    <TableHead>角色</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>加入时间</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <MemberRow
                      key={member.id}
                      member={member}
                      onStatusToggle={handleStatusToggle}
                      onEdit={handleEditMember}
                    />
                  ))}
                </TableBody>
              </Table>

              {/* 🚀 优化的分页控制 */}
              {paginationInfo.showPagination && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t">
                  <div className="text-sm text-gray-700 order-2 sm:order-1">
                    ���在显示 {paginationInfo.startItem} - {paginationInfo.endItem} 条，共 {totalMembers} 条
                  </div>
                  <div className="flex items-center gap-2 order-1 sm:order-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentMemberPage - 1)}
                      disabled={currentMemberPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      上一页
                    </Button>
                    <span className="text-sm text-gray-600">
                      第 {currentMemberPage} 页，共 {paginationInfo.totalPages} 页
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentMemberPage + 1)}
                      disabled={currentMemberPage === paginationInfo.totalPages}
                    >
                      下一页
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>组织设置</CardTitle>
              <CardDescription>管理组织的基本信息和配置</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="orgName">组织名称</Label>
                  <Input id="orgName" defaultValue={organization.name} />
                </div>
                <div>
                  <Label htmlFor="orgDesc">组织描述</Label>
                  <Input id="orgDesc" defaultValue={organization.description} />
                </div>
                <Button>保存设置</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 邀请成员对话框 */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>邀请新成员</DialogTitle>
            <DialogDescription>向组织邀请新成员</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="inviteEmail">邮箱地址</Label>
              <Input
                id="inviteEmail"
                type="email"
                placeholder="输入邮箱地址"
              />
            </div>
            <div>
              <Label htmlFor="inviteRole">角色</Label>
              <Select defaultValue="member">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">成员</SelectItem>
                  <SelectItem value="admin">管理员</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsInviteDialogOpen(false)}
            >
              取消
            </Button>
            <Button
              onClick={() => {
                const email = (document.getElementById("inviteEmail") as HTMLInputElement)?.value;
                const role = "member"; // 这里应该从Select获取实际值
                if (email) {
                  handleInviteMember(email, role as "admin" | "member");
                }
              }}
            >
              发送邀请
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// 🚀 使用React.memo优化组件重渲染
export default React.memo(OrganizationDetailOptimized);
