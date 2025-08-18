import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Mail, Shield, ArrowLeft } from "lucide-react";
import { authService } from "@/services/authService";

interface FormData {
  email: string;
  confirmationCode: string;
}

interface FormErrors {
  email?: string;
  confirmationCode?: string;
}

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCodeSending, setIsCodeSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const [formData, setFormData] = useState<FormData>({
    email: "",
    confirmationCode: ""
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // 验证邮箱格式
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 字段验证函数
  const validateField = (name: string, value: string): string | null => {
    switch (name) {
      case "email":
        if (!value) return "邮箱为必填项";
        if (value.length > 40) return "邮箱格式无效";
        if (!validateEmail(value)) return "邮箱格式无效";
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


  // 发送验证码
  const sendVerificationCode = async () => {
    const emailError = validateField("email", formData.email);
    if (emailError) {
      setErrors(prev => ({ ...prev, email: emailError }));
      return;
    }

    setIsCodeSending(true);

    const result = await authService.sendVerificationCode(formData.email, 'reset');

    setIsCodeSending(false);

    if (!result.success) {
      toast({
        title: result.error,
        variant: "destructive"
      });
      return;
    }

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
  };

  // 确认验证码
  const handleConfirm = async () => {
    // 验证所有字段
    const newErrors: FormErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof FormData]);
      if (error) newErrors[key as keyof FormErrors] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const result = await authService.verifyCode(formData.email, formData.confirmationCode);

    if (!result.success) {
      toast({
        title: result.error,
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "验证成功",
      description: "正在跳转到重置密码页面..."
    });

    setTimeout(() => {
      navigate("/reset-password", {
        state: { email: formData.email, verified: true }
      });
    }, 1000);
  };

  // 检查发送验证码按钮是否应该禁用
  const isSendButtonDisabled = () => {
    return countdown > 0 || isCodeSending || validateField("email", formData.email) !== null;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/auth")}
              className="p-1 h-auto"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-2xl">忘记密码</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            请输入您的注册邮箱，我们将向您发送验证码以重置密码。
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="请输入注册邮箱"
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    onBlur={() => handleBlur("email")}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSendButtonDisabled()}
                  onClick={sendVerificationCode}
                >
                  {isCodeSending ? "发送中..." : countdown > 0 ? `重新发送 (${countdown}s)` : "发送验证码"}
                </Button>
              </div>
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmationCode">确认验证码</Label>
              <div className="relative">
                <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmationCode"
                  placeholder="请输入验证码"
                  className="pl-10"
                  value={formData.confirmationCode}
                  onChange={(e) => handleInputChange("confirmationCode", e.target.value)}
                  onBlur={() => handleBlur("confirmationCode")}
                />
              </div>
              {errors.confirmationCode && <p className="text-sm text-destructive">{errors.confirmationCode}</p>}
              <p className="text-xs text-muted-foreground">测试验证码：8764</p>
            </div>

            <Button onClick={handleConfirm} className="w-full">
              确认
            </Button>

            <div className="text-center">
              <Button 
                variant="link" 
                className="px-0"
                onClick={() => navigate("/auth")}
              >
                返回登录
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
