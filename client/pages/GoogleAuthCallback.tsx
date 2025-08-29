import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { handleGoogleRegisterCallback } from "@/utils/googleRegister";

export default function GoogleAuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 从URL中提取访问令牌
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");
    
    if (accessToken) {
      // 检查是否是注册流程
      const searchParams = new URLSearchParams(location.search);
      const isRegister = searchParams.get("register") === "true";
      
      if (isRegister) {
        // 处理谷歌注册回调
        handleGoogleRegisterCallback(accessToken);
      } else {
        // 将令牌发送给父窗口（如果在iframe中）
        if (window.opener) {
          window.opener.postMessage({
            type: "GOOGLE_AUTH_SUCCESS",
            token: accessToken
          }, window.location.origin);
          window.close();
        } else {
          // 如果不在弹窗中，重定向到主应用
          window.location.href = `/auth?token=${accessToken}&method=google`;
        }
      }
    } else {
      // 如果没有访问令牌，重定向到登录页面
      navigate("/auth");
    }
  }, [navigate, location]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">正在处理谷歌认证...</p>
      </div>
    </div>
  );
}