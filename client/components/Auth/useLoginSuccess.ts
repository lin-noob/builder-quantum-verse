import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const { setUser, setIsAuthenticated } = useAuthStore();

  const handleLoginSuccess = (user: User, message?: string) => {
    // 更新 Zustand store
    setUser(user);
    setIsAuthenticated(true);

    toast({
      title: t('auth.toasts.loginSuccessTitle'),
      description: message || (user.isAdmin ? t('auth.toasts.welcomeBackAdmin') : t('auth.toasts.welcomeBack')),
    });

    setTimeout(() => {
      navigate("/dashboard2");
    }, 500);
  };

  return { handleLoginSuccess };
};
