import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { adminAuthService } from '@/services/adminAuthService';

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

export default function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // 检查管理员身份验证状态
    const checkAdminAuth = () => {
      const adminUser = adminAuthService.getCurrentAdminUser();
      const isLoggedIn = adminAuthService.isAdminLoggedIn();
      
      setIsAuthenticated(isLoggedIn && adminUser !== null);
      setIsLoading(false);
    };

    checkAdminAuth();
  }, []);

  // 显示加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">验证管理员身份...</p>
        </div>
      </div>
    );
  }

  // 如果未通过身份验证，重定向到管理员登录页
  if (!isAuthenticated) {
    return <Navigate to="/admin/auth" replace />;
  }

  // 通过身份验证，渲染子组件
  return <>{children}</>;
}
