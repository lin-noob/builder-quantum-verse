import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Check, AlertCircle, Key } from "lucide-react";
import { adminAuthService } from "@/services/adminAuthService";
import { toast } from "@/hooks/use-toast";

export default function AdminPasswordChange() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentUser = adminAuthService.getCurrentAdminUser();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "请输入当���密码";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "请输入新密码";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "新密码长度至少6位";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "请确认新密码";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "两次密码输入不一致";
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = "新密码不能与当前密码相同";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // 这里实际应该调用后端API，现在模拟成功
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟验证当前密码
      if (formData.currentPassword !== "admin123") {
        setErrors({ currentPassword: "当前密码不正确" });
        return;
      }

      toast({
        title: "密码修改成功",
        description: "您的密码已成功修改",
      });

      // 清空���单
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });

      // 延迟1秒后返回
      setTimeout(() => {
        navigate("/admin");
      }, 1000);

    } catch (error) {
      toast({
        variant: "destructive",
        title: "修改失败",
        description: "密码修改失败，请稍后重试",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除该字段的错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              密码设置
            </CardTitle>
            <CardDescription>
              当前用户：<span className="font-medium text-gray-900">{currentUser?.username}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 当前密码 */}
              <div className="space-y-2">
                <Label htmlFor="currentPassword">当前密码</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                  placeholder="请输入当前密码"
                  className={errors.currentPassword ? "border-red-500" : ""}
                />
                {errors.currentPassword && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.currentPassword}</AlertDescription>
                  </Alert>
                )}
              </div>

              {/* 新密码 */}
              <div className="space-y-2">
                <Label htmlFor="newPassword">新密码</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange("newPassword", e.target.value)}
                  placeholder="请输入新密码（至少6位）"
                  className={errors.newPassword ? "border-red-500" : ""}
                />
                {errors.newPassword && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.newPassword}</AlertDescription>
                  </Alert>
                )}
              </div>

              {/* 确认新密码 */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">确认新密码</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  placeholder="请再次输入新密码"
                  className={errors.confirmPassword ? "border-red-500" : ""}
                />
                {errors.confirmPassword && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.confirmPassword}</AlertDescription>
                  </Alert>
                )}
              </div>

              {/* 密码强度提示 */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  密码建议：
                  <ul className="mt-2 list-disc list-inside text-sm space-y-1">
                    <li>至少6位字符</li>
                    <li>包含字母和数字</li>
                    <li>不要使用过于简单的密码</li>
                    <li>定期更换密码</li>
                  </ul>
                </AlertDescription>
              </Alert>

              {/* 提交按钮 */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  {loading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  {loading ? "修改中..." : "确认修改"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/admin")}
                  disabled={loading}
                >
                  取消
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
