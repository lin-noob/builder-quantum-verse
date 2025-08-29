import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores";

interface User {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  session: string;
  account: string;
  usertype: string;
  companyid: string;
  lastlogintime: string;
}

export const useLoginSuccess = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setUser, setIsAuthenticated } = useAuthStore();

  const handleLoginSuccess = (user: User, message?: string) => {
    // 更新 Zustand store
    setUser(user);
    setIsAuthenticated(true);

    toast({
      title: "登录成功！",
      description: message || (user.isAdmin ? "欢迎回来，管理员" : "欢迎回来"),
    });

    setTimeout(() => {
      navigate("/");
    }, 1000);
  };

  return { handleLoginSuccess };
};