import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Mail, Users, Shield, Copy } from "lucide-react";
import {
  MemberRole,
  InviteMemberRequest,
  generateInitialPassword,
} from "../../../shared/organizationData";

interface MemberInviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvite: (request: InviteMemberRequest) => Promise<{
    success: boolean;
    message: string;
    data?: { member: any; initialPassword: string };
  }>;
  organizationId: string;
}

const MemberInviteDialog = ({
  open,
  onOpenChange,
  onInvite,
  organizationId,
}: MemberInviteDialogProps) => {
  const [inviteForm, setInviteForm] = useState<InviteMemberRequest>({
    email: "",
    role: MemberRole.MEMBER,
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPasswordResult, setShowPasswordResult] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [invitedEmail, setInvitedEmail] = useState("");

  const { toast } = useToast();

  const handleGeneratePassword = () => {
    const password = generateInitialPassword();
    setInviteForm((prev) => ({ ...prev, password }));
  };

  const handleInvite = async () => {
    if (!inviteForm.email || !inviteForm.role) {
      toast({
        title: "表单验证失败",
        description: "请填写完整的邀请信息",
        variant: "destructive",
      });
      return;
    }

    // 如果没有设置密码，自动生成一个
    let finalForm = { ...inviteForm };
    if (!finalForm.password) {
      finalForm.password = generateInitialPassword();
    }

    try {
      setLoading(true);
      const result = await onInvite(finalForm);

      if (result.success) {
        toast({
          title: "邀请成功",
          description: "新成员已创建，初始密码已生成",
        });

        setGeneratedPassword(
          result.data?.initialPassword || finalForm.password,
        );
        setInvitedEmail(finalForm.email);
        setShowPasswordResult(true);
        setInviteForm({
          email: "",
          role: MemberRole.MEMBER,
          password: "",
        });
      } else {
        toast({
          title: "邀请失败",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to invite member:", error);
      toast({
        title: "邀请失败",
        description: "网络错误，请重试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (showPasswordResult) {
      setShowPasswordResult(false);
      setGeneratedPassword("");
      setInvitedEmail("");
    }
    onOpenChange(false);
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(generatedPassword);
    toast({
      title: "已复制",
      description: "初始密码已复制到剪贴板",
    });
  };

  const copyCredentials = () => {
    const text = `邮箱: ${invitedEmail}\n密码: ${generatedPassword}`;
    navigator.clipboard.writeText(text);
    toast({
      title: "已复制",
      description: "登录凭证已复制到剪贴板",
    });
  };

  // 密码结果显示状态
  if (showPasswordResult) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              成员创建成功
            </DialogTitle>
            <DialogDescription>
              新成员账户已创建，请复制初始密码并安全地分享给该成员
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-600 mb-1">成员邮箱</div>
                  <div className="p-2 bg-white border rounded text-sm font-mono">
                    {invitedEmail}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">初始密码</div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 bg-white border rounded text-lg font-mono">
                      {generatedPassword}
                    </code>
                    <Button size="sm" variant="outline" onClick={copyPassword}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={copyCredentials}
                className="mt-3 w-full"
              >
                <Copy className="h-4 w-4 mr-2" />
                复制完整登录凭证
              </Button>
            </div>
            <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded">
              <strong>重要提醒：</strong>
              请务必将此密码安全地告知新成员，并建议其首次登录后立即修改密码。
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleClose}>我已复制密码</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // 邀请表单状态
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            邀请新成员
          </DialogTitle>
          <DialogDescription>
            为组织添加新的团队成员，系统将自动生成初始密码
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">邮箱地址 *</Label>
            <Input
              id="email"
              type="email"
              placeholder="请输入成员邮箱"
              value={inviteForm.email}
              onChange={(e) =>
                setInviteForm((prev) => ({ ...prev, email: e.target.value }))
              }
            />
            <p className="text-xs text-gray-500 mt-1">将作为该成员的登录账号</p>
          </div>
          <div>
            <Label htmlFor="role">角色权限 *</Label>
            <Select
              value={inviteForm.role}
              onValueChange={(value) =>
                setInviteForm((prev) => ({
                  ...prev,
                  role: value as MemberRole,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="选择角色" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={MemberRole.MEMBER}>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <div>
                      <div>成员</div>
                      <div className="text-xs text-gray-500">基础功能权限</div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value={MemberRole.ADMIN}>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <div>
                      <div>管理员</div>
                      <div className="text-xs text-gray-500">完整管理权限</div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="password">初始密码（可选）</Label>
            <div className="flex gap-2">
              <Input
                id="password"
                type="text"
                placeholder="留空将自动生成"
                value={inviteForm.password}
                onChange={(e) =>
                  setInviteForm((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleGeneratePassword}
              >
                生成
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              如果不设置，系统将自动生成安全密码
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleInvite} disabled={loading}>
            {loading ? "邀请中..." : "发送邀请"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MemberInviteDialog;
