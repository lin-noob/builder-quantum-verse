import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, User, Shield, Home, ArrowLeft } from "lucide-react";
import { authService } from "@/services/authService";
import { useAuthStore, useRoleStore } from "@/stores";
import { GoogleAuthButton } from "@/components/Auth/GoogleAuthButton";
import { useLoginSuccess } from "@/components/Auth/useLoginSuccess";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";

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
  const { handleLoginSuccess } = useLoginSuccess();
  const {
    user,
    isAuthenticated,
    isLoading,
    setUser,
    setIsAuthenticated,
    setLoading,
    setVerificationCode,
    getVerificationCode,
  } = useAuthStore();
  const { fetchRoles } = useRoleStore();
  const [activeTab, setActiveTab] = useState("login");
  const [isCodeSending, setIsCodeSending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    confirmationCode: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // 如果已经登录，重定向到首页
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate("/");
      fetchRoles();
    }
  }, [isAuthenticated, user, navigate]);

  // 验证邮箱格式
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 验证密码强度
  const { t } = useTranslation();
  const validatePassword = (password: string): string | null => {
    if (!password) return t('auth.validations.passwordRequired');
    if (password.length < 6 || password.length > 32)
      return t('auth.validations.passwordLength');
    if (!/[a-zA-Z]/.test(password)) return t('auth.validations.passwordLetter');
    if (!/\d/.test(password)) return t('auth.validations.passwordNumber');
    return null;
  };

  // 字段验证函数
  const validateField = (name: string, value: string): string | null => {
    switch (name) {
      case "username":
        if (!value) return t('auth.validations.usernameRequired');
        if (value.length < 6 || value.length > 20)
          return t('auth.validations.usernameLength');
        return null;
      case "email":
        if (!value)
          return activeTab === "login"
            ? t('auth.validations.emailOrUsernameRequired')
            : t('auth.validations.emailRequired');
        if (value.length > 40) return t('auth.validations.inputTooLong');
        // 登录时允许用户名或邮箱，注册时只允许邮箱
        if (activeTab === "register" && !validateEmail(value))
          return t('auth.validations.emailInvalid');
        if (activeTab === "login" && value !== "admin" && !validateEmail(value))
          return t('auth.validations.emailOrUsernameInvalid');
        return null;
      case "password":
        if (activeTab === "login") {
          return !value ? t('auth.validations.passwordInvalid') : null;
        }
        return validatePassword(value);
      // case "confirmPassword":
      //   if (!value) return "请输入您的确认密码";
      //   if (value !== formData.password) return "确认密码与新密码不匹配";
      //   return null;
      case "confirmationCode":
        if (!value) return t('auth.validations.codeRequired');
        return null;
      default:
        return null;
    }
  };

  // 处理输入框失去焦点
  const handleBlur = (name: string) => {
    const error = validateField(name, formData[name as keyof FormData]);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  // 处理输入框值变化
  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // 清除该字段的错误
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // 发送验证码
  const sendVerificationCode = async () => {
    const emailError = validateField("email", formData.email);
    if (emailError) {
      setErrors((prev) => ({ ...prev, email: emailError }));
      return;
    }

    setIsCodeSending(true);

    const result = await authService.sendVerificationCode(
      formData.email,
      "register",
    );

    setIsCodeSending(false);

    if (!result.success) {
      toast({
        title: result.error,
        variant: "destructive",
      });
      return;
    }

    // 保存验证码到 store（测试环境）
    if (result.key) {
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10分钟后过期
      setVerificationCode(formData.email, result.key, expiresAt, "register");
    }

    setCountdown(120);

    toast({
      title: t('auth.toasts.codeSentTitle'),
      description: t('auth.toasts.codeSentDesc'),
    });

    // 开始倒计时
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 注册处理
  const handleRegister = async () => {
    // 验证所有字段
    const newErrors: FormErrors = {};
    Object.keys(formData).forEach((key) => {
      if (
        key === "confirmPassword" ||
        (activeTab === "register" && key !== "password")
      ) {
        const error = validateField(key, formData[key as keyof FormData]);
        if (error) newErrors[key as keyof FormErrors] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    const result = await authService.register({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      confirmationCode: formData.confirmationCode,
    });
    setLoading(false);

    if (!result.success) {
      toast({
        title: result.error,
        variant: "destructive",
      });
      return;
    }

    // 注册成功后自动登录并跳转到首页
    const loginResult = await authService.login({
      email: formData.email,
      password: formData.password,
    });

    if (loginResult.success && loginResult.user) {
      // 更新 Zustand store
      setUser(loginResult.user);
      setIsAuthenticated(true);
      toast({
        title: t('auth.toasts.registerLoginSuccessTitle'),
        description: t('auth.toasts.registerLoginSuccessDesc'),
      });

      // 直接跳转到首页
      // setTimeout(() => {
      //   navigate("/");
      // }, 1000);
    } else {
      toast({
        title: t('auth.toasts.registerSuccessLoginFailedTitle'),
        description: t('auth.toasts.registerSuccessLoginFailedDesc'),
        variant: "destructive",
      });

      // 切换到登录标签页
      setActiveTab("login");
      // 清空表单，但保留邮箱以便登录
      setFormData({
        username: "",
        email: formData.email,
        password: "",
        confirmPassword: "",
        confirmationCode: "",
      });
    }
  };

  // 登录处理
  const handleLogin = async () => {
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

    setLoading(true);
    const result = await authService.login({
      email: formData.email,
      password: formData.password,
    });
    setLoading(false);

    if (!result.success) {
      toast({
        title: result.error,
        variant: "destructive",
      });
      return;
    }

    // 使用共享的登录完成处理函数
    if (result.user) {
      handleLoginSuccess(result.user, result.user.isAdmin ? t('auth.toasts.welcomeBackAdmin') : t('auth.toasts.welcomeBack'));
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* 返回首页按钮 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          // 如果用户已登录，先退出登录再跳转到首页
          const currentUser = authService.getCurrentUser();
          if (currentUser) {
            authService.logout();
          }
          navigate("/");
        }}
        className="fixed top-4 left-4 z-10 flex items-center gap-2 text-muted-foreground hover:text-foreground"
      >
        <Home className="h-4 w-4" />
        <span className="hidden sm:inline">{t('auth.home.backHome')}</span>
      </Button>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">{t('nav.platformName')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">{t('auth.tabs.login')}</TabsTrigger>
              <TabsTrigger value="register">{t('auth.tabs.register')}</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">{t('auth.fields.emailOrUsername')}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="text"
                      placeholder={t('auth.placeholders.emailOrUsername')}
                      className="pl-10"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      onBlur={() => handleBlur("email")}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">{t('auth.fields.password')}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder={t('auth.placeholders.password')}
                      className="pl-10"
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      onBlur={() => handleBlur("password")}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">
                      {errors.password}
                    </p>
                  )}
                  <div className="text-right">
                    <Button
                      variant="link"
                      className="px-0 text-sm"
                      onClick={() => navigate("/forgot-password")}
                    >
                      {t('auth.links.forgotPassword')}
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={handleLogin}
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? t('auth.actions.loggingIn') : t('auth.actions.login')}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      {t('auth.actions.continueWith')}
                    </span>
                  </div>
                </div>

                <GoogleAuthButton type="login" />

                <div className="text-center text-sm">
                  {t('auth.noAccount')}{" "}
                  <Button
                    variant="link"
                    className="px-0"
                    onClick={() => setActiveTab("register")}
                  >
                    {t('auth.links.signupNow')}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-username">{t('auth.fields.username')}</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-username"
                      placeholder={t('auth.placeholders.username')}
                      className="pl-10"
                      value={formData.username}
                      onChange={(e) =>
                        handleInputChange("username", e.target.value)
                      }
                      onBlur={() => handleBlur("username")}
                    />
                  </div>
                  {errors.username && (
                    <p className="text-sm text-destructive">
                      {errors.username}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email">{t('auth.fields.email')}</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder={t('auth.placeholders.email')}
                        className="pl-10"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        onBlur={() => handleBlur("email")}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={countdown > 0 || isCodeSending}
                      onClick={sendVerificationCode}
                    >
                      {isCodeSending
                        ? t('auth.actions.sending')
                        : countdown > 0
                          ? t('auth.actions.resendIn', { s: countdown })
                          : t('auth.actions.sendCode')}
                    </Button>
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password">{t('auth.fields.password')}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-password"
                      type="password"
                      placeholder={t('auth.placeholders.password')}
                      className="pl-10"
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      onBlur={() => handleBlur("password")}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-code">{t('auth.fields.code')}</Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-code"
                      placeholder={t('auth.placeholders.code')}
                      className="pl-10"
                      value={formData.confirmationCode}
                      onChange={(e) =>
                        handleInputChange("confirmationCode", e.target.value)
                      }
                      onBlur={() => handleBlur("confirmationCode")}
                    />
                  </div>
                  {errors.confirmationCode && (
                    <p className="text-sm text-destructive">
                      {errors.confirmationCode}
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleRegister}
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? t('auth.actions.registering') : t('auth.actions.register')}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      {t('auth.actions.continueWith')}
                    </span>
                  </div>
                </div>

                <GoogleAuthButton type="login" />

                <div className="text-center text-sm">
                  {t('auth.haveAccount')}{" "}
                  <Button
                    variant="link"
                    className="px-0"
                    onClick={() => setActiveTab("login")}
                  >
                    {t('auth.links.loginNow')}
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
