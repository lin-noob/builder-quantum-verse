import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Lock, Calendar, Shield, LogOut, Edit2, Save, X } from "lucide-react";
import { authService, type User as UserType } from "@/services/authService";

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordFormErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export default function UserProfile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<UserType | null>(null);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [passwordErrors, setPasswordErrors] = useState<PasswordFormErrors>({});

  // 获取��前用户信息
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      toast({
        title: "请先登录",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }
    setUser(currentUser);
  }, [navigate, toast]);

  // 验证密码强度
  const validatePassword = (password: string): string | null => {
    if (!password) return "密码为必填项";
    if (password.length < 6 || password.length > 32) return "密码长度应为6-32个字符";
    if (!/[a-zA-Z]/.test(password)) return "密码应至少包含1个字母";
    if (!/\d/.test(password)) return "密码应至少包含1个数字";
    return null;
  };

  // 字段验证函数
  const validatePasswordField = (name: string, value: string): string | null => {
    switch (name) {
      case "currentPassword":
        if (!value) return "请输入当前密码";
        return null;
      case "newPassword":
        return validatePassword(value);
      case "confirmPassword":
        if (!value) return "请输入确认密码";
        if (value !== passwordForm.newPassword) return "确认密码与新密码不匹配";
        return null;
      default:
        return null;
    }
  };

  // 处理密码表单输入
  const handlePasswordInputChange = (name: string, value: string) => {
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    // 清除该字段的错误
    if (passwordErrors[name as keyof PasswordFormErrors]) {
      setPasswordErrors(prev => ({ ...prev, [name]: null }));
    }
    
    // 如果是新密码字段变化，同时验证确认密码字段
    if (name === "newPassword" && passwordForm.confirmPassword) {
      const confirmError = passwordForm.confirmPassword !== value ? "确认密码与新密码不匹配" : null;
      setPasswordErrors(prev => ({ ...prev, confirmPassword: confirmError }));
    }
  };

  // 处理输入框失去焦点
  const handlePasswordBlur = (name: string) => {
    const error = validatePasswordField(name, passwordForm[name as keyof PasswordForm]);
    setPasswordErrors(prev => ({ ...prev, [name]: error }));
  };

  // 重置密码
  const handlePasswordReset = async () => {
    // 验证所有字段
    const newErrors: PasswordFormErrors = {};
    Object.keys(passwordForm).forEach(key => {
      const error = validatePasswordField(key, passwordForm[key as keyof PasswordForm]);
      if (error) newErrors[key as keyof PasswordFormErrors] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setPasswordErrors(newErrors);
      return;
    }

    // 模拟验证当前密码
    if (!user) return;
    
    setIsLoading(true);

    try {
      // 使用新的changePassword方法
      const result = await authService.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );
      
      if (!result.success) {
        if (result.error === "当前密码错误") {
          setPasswordErrors({ currentPassword: result.error });
        } else {
          toast({
            title: result.error,
            variant: "destructive"
          });
        }
        setIsLoading(false);
        return;
      }

      toast({
        title: "密码修改成功！",
        description: "请使用新密码重新登录"
      });

      // 清空表单并关闭编辑模式
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setPasswordErrors({});
      setIsEditingPassword(false);
      setIsLoading(false);
      
      // 延迟后登出并跳转到登录页
      setTimeout(() => {
        handleLogout();
      }, 2000);

    } catch (error) {
      toast({
        title: "修改密码失败",
        description: "请重试",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  // 取消密码编辑
  const handleCancelPasswordEdit = () => {
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
    setPasswordErrors({});
    setIsEditingPassword(false);
  };

  // 登出
  const handleLogout = () => {
    authService.logout();
    toast({
      title: "已安全登出"
    });
    navigate("/auth");
  };

  // 格式化注册时间
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="p-6 space-y-6 bg-background min-h-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">个人信息</h1>
          <p className="text-sm text-muted-foreground">管理您的账户信息和安全设置</p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleLogout}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          退出登录
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 基本信息卡片 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              基本信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{user.username}</h3>
                <p className="text-sm text-muted-foreground">
                  {user.isAdmin ? "系统管理员" : "普通用户"}
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">邮箱地址</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">账户类型</p>
                  <p className="text-sm text-muted-foreground">
                    {user.isAdmin ? "管理员账户" : "标准用户账户"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">账户ID</p>
                  <p className="text-sm text-muted-foreground">{user.id}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 安全设置卡片 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              安全设置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">密码</p>
                <p className="text-sm text-muted-foreground">上次修改密码的时间</p>
              </div>
              {!isEditingPassword && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEditingPassword(true)}
                  className="flex items-center gap-2"
                >
                  <Edit2 className="h-4 w-4" />
                  修改密码
                </Button>
              )}
            </div>

            {isEditingPassword && (
              <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">当前密码</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="请输入当前密码"
                    value={passwordForm.currentPassword}
                    onChange={(e) => handlePasswordInputChange("currentPassword", e.target.value)}
                    onBlur={() => handlePasswordBlur("currentPassword")}
                  />
                  {passwordErrors.currentPassword && (
                    <p className="text-sm text-destructive">{passwordErrors.currentPassword}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">新密码</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="请输入新密码"
                    value={passwordForm.newPassword}
                    onChange={(e) => handlePasswordInputChange("newPassword", e.target.value)}
                    onBlur={() => handlePasswordBlur("newPassword")}
                  />
                  {passwordErrors.newPassword && (
                    <p className="text-sm text-destructive">{passwordErrors.newPassword}</p>
                  )}
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• 密码长度应为6-32个字符</p>
                    <p>• 至少包含1个字母和1个数字</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">确认新密码</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="请再次输入新密码"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => handlePasswordInputChange("confirmPassword", e.target.value)}
                    onBlur={() => handlePasswordBlur("confirmPassword")}
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="text-sm text-destructive">{passwordErrors.confirmPassword}</p>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    onClick={handlePasswordReset} 
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isLoading ? "保存中..." : "保存更改"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleCancelPasswordEdit}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    取消
                  </Button>
                </div>
              </div>
            )}

            <Separator />

            <div className="space-y-2">
              <p className="font-medium text-foreground">安全提示</p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• 定期更换密码以保护账户安全</p>
                <p>• 不要与他人分享您的登录凭据</p>
                <p>• 使用强密码包含字母、数字和特殊字符</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
