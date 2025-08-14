import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, User, Shield } from "lucide-react";
import { authService } from "@/services/authService";

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  confirmationCode: string;
}

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  confirmationCode?: string;
}

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("login");
  const [isGoogleAuth, setIsGoogleAuth] = useState(false);
  const [isCodeSending, setIsCodeSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    confirmationCode: ""
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // 验证邮箱格式
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 验证密码强度
  const validatePassword = (password: string): string | null => {
    if (!password) return "密码为必填项";
    if (password.length < 6 || password.length > 32) return "密码长度应为6-32个字符";
    if (!/[a-zA-Z]/.test(password)) return "密码应至少包含1个字母";
    if (!/\d/.test(password)) return "密码应至少包含1个数字";
    return null;
  };

  // 字段验证函数
  const validateField = (name: string, value: string): string | null => {
    switch (name) {
      case "username":
        if (!value) return "用户名为必填项";
        if (value.length < 6 || value.length > 20) return "用户名长度应为6-20个字符";
        return null;
      case "email":
        if (!value) return "邮箱为必填项";
        if (value.length > 40) return "邮箱格式无效";
        if (!validateEmail(value)) return "邮箱格式无效";
        return null;
      case "password":
        if (activeTab === "login") {
          return !value ? "密码格式无效" : null;
        }
        return validatePassword(value);
      case "confirmPassword":
        if (!value) return "请输入您的确认密码";
        if (value !== formData.password) return "确认密码与新密码不匹配";
        return null;
      case "confirmationCode":
        if (!value) return "请输入您的确认验证码";
        return null;
      default:
        return null;
    }
  };

  // 处理输入框失去焦点
  const handleBlur = (name: string) => {
    const error = validateField(name, formData[name as keyof FormData]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  // 处理输入框值变化
  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    // 清除该字段的错误
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // 模拟检查邮箱是否存在
  const checkEmailExists = (email: string): boolean => {
    // 模拟数据库中已存在的邮箱
    const existingEmails = ["test@example.com", "user@test.com"];
    return existingEmails.includes(email);
  };

  // 发送验证码
  const sendVerificationCode = async () => {
    const emailError = validateField("email", formData.email);
    if (emailError) {
      setErrors(prev => ({ ...prev, email: emailError }));
      return;
    }

    if (checkEmailExists(formData.email)) {
      toast({
        title: "该用户已存在",
        variant: "destructive"
      });
      return;
    }

    setIsCodeSending(true);
    
    // 模拟发送邮件
    setTimeout(() => {
      setIsCodeSending(false);
      setCountdown(120);
      
      toast({
        title: "验证码已发送至您的邮箱",
        description: "请查收并在10分钟内使用"
      });

      // 开始倒计时
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, 1000);
  };

  // 谷歌登录
  const handleGoogleAuth = () => {
    // 模拟谷歌登录成功
    setIsGoogleAuth(true);
    setFormData(prev => ({
      ...prev,
      username: "google_user_" + Date.now(),
      email: "googleuser@gmail.com"
    }));
    
    toast({
      title: "谷歌登录成功",
      description: "已自动填充信息，正在发送验证码..."
    });

    // 自动发送验证码
    setTimeout(() => {
      sendVerificationCode();
    }, 500);
  };

  // 注册处理
  const handleRegister = () => {
    // 验证所有字段
    const newErrors: FormErrors = {};
    Object.keys(formData).forEach(key => {
      if (key === "confirmPassword" || (activeTab === "register" && key !== "password")) {
        const error = validateField(key, formData[key as keyof FormData]);
        if (error) newErrors[key as keyof FormErrors] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // 模拟验证码检查
    if (formData.confirmationCode !== "123456") {
      toast({
        title: "验证码无效，请重试",
        variant: "destructive"
      });
      return;
    }

    // 再次检查邮箱（防止并发）
    if (checkEmailExists(formData.email)) {
      toast({
        title: "该用户已存在",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "注册成功！",
      description: "正在跳转到主页..."
    });

    setTimeout(() => {
      navigate("/");
    }, 1000);
  };

  // 登录处理
  const handleLogin = () => {
    // 验证字段
    const newErrors: FormErrors = {};
    const emailError = validateField("email", formData.email);
    const passwordError = validateField("password", formData.password);
    
    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // 默认管理员账号
    if (formData.email === "admin" && formData.password === "123456") {
      toast({
        title: "登录成功！",
        description: "欢迎回来，管理员"
      });
      setTimeout(() => {
        navigate("/");
      }, 1000);
      return;
    }

    // 检查邮箱是否存在
    if (!checkEmailExists(formData.email)) {
      toast({
        title: "该邮箱未注册账户",
        variant: "destructive"
      });
      return;
    }

    // 模拟密码验证
    toast({
      title: "邮箱或密码错误，请重新输入",
      variant: "destructive"
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">AI营销平台</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">登录</TabsTrigger>
              <TabsTrigger value="register">注册</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">邮箱</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="请输入邮箱"
                      className="pl-10"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      onBlur={() => handleBlur("email")}
                    />
                  </div>
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password">密码</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="请输入密码"
                      className="pl-10"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      onBlur={() => handleBlur("password")}
                    />
                  </div>
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                  <div className="text-right">
                    <Button 
                      variant="link" 
                      className="px-0 text-sm"
                      onClick={() => navigate("/forgot-password")}
                    >
                      忘记密码？
                    </Button>
                  </div>
                </div>

                <Button onClick={handleLogin} className="w-full">
                  登录
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      或通过以下方式继续
                    </span>
                  </div>
                </div>

                <Button variant="outline" onClick={handleGoogleAuth} className="w-full">
                  使用谷歌登录
                </Button>

                <div className="text-center text-sm">
                  还没有账户？{" "}
                  <Button 
                    variant="link" 
                    className="px-0"
                    onClick={() => setActiveTab("register")}
                  >
                    立即注册
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-username">用户名</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-username"
                      placeholder="请输入用户名"
                      className="pl-10"
                      value={formData.username}
                      onChange={(e) => handleInputChange("username", e.target.value)}
                      onBlur={() => handleBlur("username")}
                      disabled={isGoogleAuth}
                    />
                  </div>
                  {errors.username && <p className="text-sm text-destructive">{errors.username}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email">邮箱</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="请输入邮箱"
                        className="pl-10"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        onBlur={() => handleBlur("email")}
                        disabled={isGoogleAuth}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={countdown > 0 || isCodeSending}
                      onClick={sendVerificationCode}
                    >
                      {isCodeSending ? "发送中..." : countdown > 0 ? `重新发送 (${countdown}s)` : "发送验证码"}
                    </Button>
                  </div>
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password">密码</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="请输入密码"
                      className="pl-10"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      onBlur={() => handleBlur("password")}
                    />
                  </div>
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-code">确认验证码</Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-code"
                      placeholder="请输入验证码"
                      className="pl-10"
                      value={formData.confirmationCode}
                      onChange={(e) => handleInputChange("confirmationCode", e.target.value)}
                      onBlur={() => handleBlur("confirmationCode")}
                    />
                  </div>
                  {errors.confirmationCode && <p className="text-sm text-destructive">{errors.confirmationCode}</p>}
                  <p className="text-xs text-muted-foreground">测试验证码：123456</p>
                </div>

                <Button onClick={handleRegister} className="w-full">
                  注册
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      或通过以下方式继续
                    </span>
                  </div>
                </div>

                <Button variant="outline" onClick={handleGoogleAuth} className="w-full">
                  使用谷歌登录
                </Button>

                <div className="text-center text-sm">
                  已经有账户了？{" "}
                  <Button 
                    variant="link" 
                    className="px-0"
                    onClick={() => setActiveTab("login")}
                  >
                    立即登录
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
