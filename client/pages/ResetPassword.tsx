import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Lock, ArrowLeft } from "lucide-react";

interface FormData {
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  newPassword?: string;
  confirmPassword?: string;
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<FormData>({
    newPassword: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // 检查是否从忘记密码页面正确跳转而来
  useEffect(() => {
    if (!location.state?.verified) {
      toast({
        title: "访问被拒绝",
        description: "请先完成邮箱验证",
        variant: "destructive"
      });
      navigate("/forgot-password");
    }
  }, [location.state, navigate, toast]);

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
      case "newPassword":
        return validatePassword(value);
      case "confirmPassword":
        if (!value) return "请输入您的确认密码";
        if (value !== formData.newPassword) return "确认密码与新密码不匹配";
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
    
    // 如果是新密码字段变化，同时验证确认密码字段
    if (name === "newPassword" && formData.confirmPassword) {
      const confirmError = formData.confirmPassword !== value ? "确认密码与新密码不匹配" : null;
      setErrors(prev => ({ ...prev, confirmPassword: confirmError }));
    }
  };

  // 确认重置密码
  const handleConfirm = () => {
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

    toast({
      title: "密码修改成功！",
      description: "正在跳转到登录页面..."
    });

    setTimeout(() => {
      navigate("/auth");
    }, 1500);
  };

  // 如果不是从正确的流程跳转来的，不渲染页面
  if (!location.state?.verified) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/forgot-password")}
              className="p-1 h-auto"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-2xl">重置密码</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            请设置您的新密码
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">新密码</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="请输入新密码"
                  className="pl-10"
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange("newPassword", e.target.value)}
                  onBlur={() => handleBlur("newPassword")}
                />
              </div>
              {errors.newPassword && <p className="text-sm text-destructive">{errors.newPassword}</p>}
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• 密码长度应为6-32个字符</p>
                <p>• 至少包含1个字母和1个数字</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">确认新密码</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="请再次输入新密码"
                  className="pl-10"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  onBlur={() => handleBlur("confirmPassword")}
                />
              </div>
              {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
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
