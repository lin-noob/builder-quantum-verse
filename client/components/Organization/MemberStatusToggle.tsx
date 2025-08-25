import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Member, AccountStatus } from "../../../shared/organizationData";

interface MemberStatusToggleProps {
  member: Member;
  onToggle: (member: Member) => Promise<{
    success: boolean;
    message: string;
    data?: Member;
  }>;
  disabled?: boolean;
  showConfirmDialog?: boolean;
}

const MemberStatusToggle = ({
  member,
  onToggle,
  disabled = false,
  showConfirmDialog = true,
}: MemberStatusToggleProps) => {
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const isActive = member.accountStatus === AccountStatus.ACTIVE;

  const handleToggleClick = () => {
    if (showConfirmDialog) {
      setConfirmDialogOpen(true);
    } else {
      handleConfirmedToggle();
    }
  };

  const handleConfirmedToggle = async () => {
    try {
      setLoading(true);
      const result = await onToggle(member);

      if (result.success) {
        toast({
          title: "状态更新成功",
          description: result.message,
        });
      } else {
        toast({
          title: "状态更新失败",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to toggle member status:", error);
      toast({
        title: "状态更新失败",
        description: "网络错误，请重试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setConfirmDialogOpen(false);
    }
  };

  return (
    <>
      <Switch
        checked={isActive}
        onCheckedChange={handleToggleClick}
        disabled={disabled || loading}
        aria-label={`${isActive ? "禁用" : "启用"}成员 ${member.name}`}
      />

      {showConfirmDialog && (
        <AlertDialog
          open={confirmDialogOpen}
          onOpenChange={setConfirmDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {isActive ? "禁用" : "启用"}成员账户
              </AlertDialogTitle>
              <AlertDialogDescription>
                {isActive ? (
                  <>
                    您确定要禁用「{member.name}」的账户吗？
                    <br />
                    禁用后该成员将无法登录系统，但账户数据会被保留。
                  </>
                ) : (
                  <>
                    您确定要启用「{member.name}」的账户吗？
                    <br />
                    启用后该成员将可以正常登录系统。
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmedToggle}>
                {isActive ? "确认禁用" : "确认启用"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
};

export default MemberStatusToggle;
