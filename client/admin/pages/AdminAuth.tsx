import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, User, Shield, Key, AlertTriangle } from "lucide-react";
import { adminAuthService } from "@/services/adminAuthService";

interface AdminFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  inviteCode: string;
}

interface AdminFormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  inviteCode?: string;
}

export default function AdminAuth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("login");
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<AdminFormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    inviteCode: ""
  });

  const [errors, setErrors] = useState<AdminFormErrors>({});

  // 检查是否已经登录，如果已登录则重定向到管理后台
  useEffect(() => {
    if (adminAuthService.isAdminLoggedIn()) {
      navigate("/admin");
    }
  }, [navigate]);

  // 验证邮箱格式
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 表单验证
  const validateForm = (isLogin: boolean = true): boolean => {
    const newErrors: AdminFormErrors = {};

    if (!isLogin) {
      // 注册表单验证
      if (!formData.username.trim()) {
        newErrors.username = "请���入用户名";
      } else if (formData.username.length < 3) {
        newErrors.username = "用户名至少需要3个字符";
      }

      if (!formData.inviteCode.trim()) {
        newErrors.inviteCode = "请输入邀请码";
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "两次输入的密码不一致";
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = "请输入邮箱地址";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "请输入有效的邮箱地址";
    }

    if (!formData.password.trim()) {
      newErrors.password = "请输入密码";
    } else if (formData.password.length < 6) {
      newErrors.password = "密码至少需要6个字符";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理输入变化
  const handleInputChange = (field: keyof AdminFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // 处理登录
  const handleLogin = async () => {
    if (!validateForm(true)) return;

    setIsLoading(true);
    try {
      const result = await adminAuthService.adminLogin({
        email: formData.email,
        password: formData.password
      });

      if (result.success) {
        toast({
          title: "登录成功",
          description: `欢迎回来，${result.user?.username}！`,
        });
        navigate("/admin");
      } else {
        toast({
          title: "登录失败",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "登录失败",
        description: "网络错误，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 处理注册
  const handleRegister = async () => {
    if (!validateForm(false)) return;

    setIsLoading(true);
    try {
      const result = await adminAuthService.adminRegister({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        inviteCode: formData.inviteCode
      });

      if (result.success) {
        toast({
          title: "注册成功",
          description: `欢迎，${result.user?.username}！`,
        });
        navigate("/admin");
      } else {
        toast({
          title: "注册失败",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "注册失败",
        description: "网络错误，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      inviteCode: ""
    });
    setErrors({});
  };

  // 切换标签页时重置表单
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 系统标识 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-xl mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">AI营销系统</h1>
          <p className="text-gray-600 mt-2">超级管理员后台</p>
        </div>

        {/* 安全提醒 */}
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>安全提醒：</strong>此为超级管理员系统，仅限授权人员访问。所有操作将被记录和监控。
          </AlertDescription>
        </Alert>

        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl text-center">
              <Shield className="h-5 w-5 inline mr-2" />
              管理员身份验证
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" className="text-sm">登录</TabsTrigger>
                <TabsTrigger value="register" className="text-sm">注册</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4 mt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">管理员邮箱</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="请输入管理员邮箱"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                        onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">密码</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="请输入密码"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        className={`pl-10 ${errors.password ? "border-red-500" : ""}`}
                        onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                      />
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-500">{errors.password}</p>
                    )}
                  </div>

                  <Button 
                    onClick={handleLogin} 
                    className="w-full bg-red-600 hover:bg-red-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "登录中..." : "登录管理后台"}
                  </Button>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    默认管理员账号：admin@system.com / admin123456
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="register" className="space-y-4 mt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-username">用户名</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-username"
                        type="text"
                        placeholder="请输入用户名"
                        value={formData.username}
                        onChange={(e) => handleInputChange("username", e.target.value)}
                        className={`pl-10 ${errors.username ? "border-red-500" : ""}`}
                      />
                    </div>
                    {errors.username && (
                      <p className="text-sm text-red-500">{errors.username}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">邮箱地址</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="请输入邮箱地址"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">密码</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="请输入密码（至少6位）"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        className={`pl-10 ${errors.password ? "border-red-500" : ""}`}
                      />
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-500">{errors.password}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password">确认密码</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-confirm-password"
                        type="password"
                        placeholder="请再次输入密码"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        className={`pl-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-invite-code">邀请码</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-invite-code"
                        type="text"
                        placeholder="请输入超级管理员邀请码"
                        value={formData.inviteCode}
                        onChange={(e) => handleInputChange("inviteCode", e.target.value)}
                        className={`pl-10 ${errors.inviteCode ? "border-red-500" : ""}`}
                      />
                    </div>
                    {errors.inviteCode && (
                      <p className="text-sm text-red-500">{errors.inviteCode}</p>
                    )}
                  </div>

                  <Button 
                    onClick={handleRegister} 
                    className="w-full bg-red-600 hover:bg-red-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "注册中..." : "注册超级管理员"}
                  </Button>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    测试邀请码：SUPER_ADMIN_INVITE_2024
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <Separator className="my-6" />

            <div className="text-center">
              <Button 
                variant="outline" 
                className="text-blue-600 hover:text-blue-700"
                onClick={() => navigate("/")}
              >
                返回主平台
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-gray-500">
          <p>AI营销系统管理后台 © 2024</p>
          <p>仅限授权人员访问</p>
        </div>
      </div>
    </div>
  );
}
