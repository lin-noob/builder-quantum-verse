import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Building2,
  Shield,
  Lock,
  Save,
  Eye,
  EyeOff,
  AlertTriangle,
} from "lucide-react";
import {
  Member,
  MemberRole,
  AccountStatus,
  UpdateMemberRequest,
  ChangePasswordRequest,
} from "../../../shared/organizationData";
import { memberApi } from "../../../shared/organizationApi";

// 模拟当前用户数据（实际应用中从认证上下文获取）
const mockCurrentMember: Member = {
  memberId: "mem_admin_001",
  organizationId: "org_demo_001",
  email: "admin@demo.com",
  name: "李国帅",
  role: MemberRole.ADMIN,
  accountStatus: AccountStatus.ACTIVE,
  createdAt: "2024-01-15T10:05:00Z",
  lastLoginAt: "2024-02-01T09:30:00Z",
  updatedAt: "2024-01-20T15:30:00Z",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
  phone: "+86 138-0000-0001"
};

const PersonalSettings = () => {
  const [member, setMember] = useState<Member>(mockCurrentMember);
  const [loading, setLoading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [profileForm, setProfileForm] = useState({
    name: member.name,
    phone: member.phone || "",
  });

  const { toast } = useToast();

  useEffect(() => {
    setProfileForm({
      name: member.name,
      phone: member.phone || "",
    });
  }, [member]);

  const handleUpdateProfile = async () => {
    if (!profileForm.name.trim()) {
      toast({
        title: "验证失败",
        description: "姓名不能为空",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      const updateRequest: UpdateMemberRequest = {
        memberId: member.memberId,
        name: profileForm.name.trim(),
        phone: profileForm.phone.trim() || undefined,
      };
      
      const response = await memberApi.updateMember(updateRequest);
      
      if (response.success) {
        toast({
          title: "更新成功",
          description: "个人信息已更新",
        });
        
        setMember(response.data);
      } else {
        toast({
          title: "更新失败",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({
        title: "更新失败",
        description: "网络错误，请重试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    // 表单验证
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast({
        title: "验证失败",
        description: "请填写完整的密码信息",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "验证失败",
        description: "新密码与确认密码不一致",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "验证失败",
        description: "新密码长度至少为6位",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      toast({
        title: "验证失败",
        description: "新密码不能与当前密码相同",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      const changeRequest: ChangePasswordRequest = {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      };
      
      const response = await memberApi.changePassword(member.memberId, changeRequest);
      
      if (response.success) {
        toast({
          title: "修改成功",
          description: "密��已更新，请妥善保管新密码",
        });
        
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast({
          title: "修改失败",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to change password:", error);
      toast({
        title: "修改失败",
        description: "网络错误，请重试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role: MemberRole) => {
    if (role === MemberRole.ADMIN) {
      return (
        <Badge variant="default" className="bg-blue-100 text-blue-800">
          <Shield className="h-3 w-3 mr-1" />
          管理员
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline">
          <User className="h-3 w-3 mr-1" />
          成员
        </Badge>
      );
    }
  };

  const getStatusBadge = (status: AccountStatus) => {
    if (status === AccountStatus.ACTIVE) {
      return <Badge variant="default" className="bg-green-100 text-green-800">活跃</Badge>;
    } else {
      return <Badge variant="secondary" className="bg-red-100 text-red-800">已禁用</Badge>;
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "未知";
    return new Date(dateString).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">个人设置</h1>
        <p className="text-gray-600 mt-1">管理您的个人信息和账户安全设置</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">个人信息</TabsTrigger>
          <TabsTrigger value="security">安全设置</TabsTrigger>
          <TabsTrigger value="account">账户信息</TabsTrigger>
        </TabsList>

        {/* 个人信息标签页 */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                基本��息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 头像区域 */}
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                  {member.avatar ? (
                    <img 
                      src={member.avatar} 
                      alt={member.name} 
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-10 w-10 text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{member.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {getRoleBadge(member.role)}
                    {getStatusBadge(member.accountStatus)}
                  </div>
                </div>
              </div>

              <Separator />

              {/* 编辑表单 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">姓名 *</Label>
                  <Input
                    id="name"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="请输入您的姓名"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">电话号码</Label>
                  <Input
                    id="phone"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="请输入电话号码"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">邮箱地址</Label>
                  <Input
                    id="email"
                    value={member.email}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    邮箱地址不可修改，作为登录账号使用
                  </p>
                </div>
                
                <div>
                  <Label>角色权限</Label>
                  <div className="mt-2">
                    {getRoleBadge(member.role)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    角色权限由组织管理员分配
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handleUpdateProfile} 
                  disabled={loading || (profileForm.name === member.name && profileForm.phone === (member.phone || ""))}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {loading ? "保存中..." : "保存更改"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 安全设置标签页 */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                修改密码
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <strong>安全提醒：</strong>
                    <ul className="mt-1 space-y-1 list-disc list-inside">
                      <li>请使用包含字母、数字的强密码</li>
                      <li>密码长度至少6位字符</li>
                      <li>定期更换密码以保障账户安全</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="current-password">当前密码 *</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder="请输入当前密码"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                    >
                      {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="new-password">新密码 *</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="请输入新密码"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                    >
                      {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirm-password">确认新密码 *</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="请再次输入新密码"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                    >
                      {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handleChangePassword} 
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <Lock className="h-4 w-4" />
                  {loading ? "修改中..." : "修改密码"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 账户信息标签页 */}
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                账户信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-gray-700">成员ID</Label>
                  <div className="mt-1 p-2 bg-gray-50 border rounded text-sm font-mono">
                    {member.memberId}
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">组织ID</Label>
                  <div className="mt-1 p-2 bg-gray-50 border rounded text-sm font-mono">
                    {member.organizationId}
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">登录邮箱</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{member.email}</span>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">联系电话</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{member.phone || "未设置"}</span>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">账户状态</Label>
                  <div className="mt-1">
                    {getStatusBadge(member.accountStatus)}
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">角色权限</Label>
                  <div className="mt-1">
                    {getRoleBadge(member.role)}
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">创建时间</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{formatDate(member.createdAt)}</span>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">最后登录</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{formatDate(member.lastLoginAt)}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="text-sm text-gray-600">
                <p className="mb-2"><strong>账户说明：</strong></p>
                <ul className="space-y-1 list-disc list-inside text-xs">
                  <li>成员ID和组织ID是系统分配的唯一标识符，不可修改</li>
                  <li>登录邮箱作为账户的唯一标识，不可修改</li>
                  <li>角色权限由组织管理员分配和管理</li>
                  <li>如需修改角色权限或账户状态，请联系组织管理员</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PersonalSettings;
