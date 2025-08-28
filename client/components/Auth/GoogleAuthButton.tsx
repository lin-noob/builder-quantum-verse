import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CLIENT_ID, getGoogleInfo } from "@/utils/googleRegister";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores";
import { useLoginSuccess } from "./useLoginSuccess";
import { authService } from "@/services/authService";

interface GoogleAuthButtonProps {
  type: "login" | "register";
  className?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function GoogleAuthButton({
  type,
  className,
  onSuccess,
  onError,
}: GoogleAuthButtonProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setLoading } = useAuthStore();
  const { handleLoginSuccess } = useLoginSuccess();

  const global: any = typeof window === "object" ? window : {};

  const initGoogleLogin = () => {
    if (global.google && global.google.accounts) {
      global.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: onSignGoogle,
      });
    }
  };

  // 谷歌链接引入
  const importScript = () => {
    try {
      const oScript = document.createElement("script");
      oScript.type = "text/javascript";
      oScript.src = "https://accounts.google.com/gsi/client";
      oScript.onload = initGoogleLogin;
      document.body.appendChild(oScript);
    } catch (error) {
      console.error("Failed to load Google script", error);
    }
  };

  const onSignGoogle = ({ credential = "" }: { credential: string }) => {
    return getGoogleInfo(credential)
      .then((data) => {
        handleGoogleAuthCallback(data);
      })
      .catch((error) => {
        console.error("Google sign in error", error);
        const errorMessage = error instanceof Error ? error.message : "未知错误";
        toast({
          title: "谷歌登录失败",
          description: errorMessage,
          variant: "destructive",
        });
        onError?.(errorMessage);
      });
  };

  const handleGoogleAuthCallback = async (response: any) => {
    try {
      setLoading(true);

      const responseData = response.data;

      // 检查响应是否成功
      if (responseData.code === "200" || responseData.code === "201") {
        const userInfo = responseData.data;

        // 创建用户对象
        const user = {
          id: userInfo.id,
          username: userInfo.account || userInfo.name || userInfo.email,
          email: userInfo.email,
          isAdmin: userInfo.usertype === "admin",
          session: userInfo.session,
          account: userInfo.account,
          usertype: userInfo.usertype,
          companyid: userInfo.companyid,
          lastlogintime: userInfo.lastlogintime,
        };

        // 同时更新 authService 中的用户状态
        authService.setCurrentUser(user);

        // 使用共享的登录完成处理函数
        handleLoginSuccess(user, `欢迎回来，${user.username}！`);

        // 执行成功回调
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error(responseData.msg || "谷歌登录失败");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "未知错误";
      toast({
        title: "谷歌登录失败",
        description: errorMessage,
        variant: "destructive",
      });
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    if (!global.google || !global.google.accounts) {
      toast({
        title: "谷歌登录初始化失败",
        description: "请刷新页面重试",
        variant: "destructive",
      });
      return;
    }

    const client = global.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: "openid email profile",
      callback: (response: any) => {
        if (response.access_token) {
          getGoogleInfo(response.access_token)
            .then((data) => {
              handleGoogleAuthCallback(data);
            })
            .catch((error) => {
              console.error("Google auth error", error);
              const errorMessage =
                error instanceof Error ? error.message : "未知错误";
              toast({
                title: "谷歌认证失败",
                description: errorMessage,
                variant: "destructive",
              });
              onError?.(errorMessage);
            });
        } else if (response.error) {
          const errorMessage = response.error_description || response.error;
          toast({
            title: "谷歌认证失败",
            description: errorMessage,
            variant: "destructive",
          });
          onError?.(errorMessage);
        }
      },
    });

    client.requestAccessToken();
  };

  useEffect(() => {
    if (global.google) {
      initGoogleLogin();
    } else {
      importScript();
    }
  }, []);

  return (
    <Button
      variant="outline"
      onClick={handleGoogleAuth}
      className={`w-full ${className || ""}`}
    >
      {type === "login" ? "使用谷歌登录" : "使用谷歌账号注册"}
    </Button>
  );
}