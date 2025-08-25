import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { MemberRole, AccountStatus } from '../../../shared/organizationData';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Lock, 
  AlertTriangle, 
  UserX, 
  Building2,
  LogIn 
} from 'lucide-react';

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredRole?: MemberRole;
  requireAdmin?: boolean;
  requireActive?: boolean;
  requireActiveOrganization?: boolean;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  requiredRole,
  requireAdmin = false,
  requireActive = true,
  requireActiveOrganization = true,
  fallback,
  redirectTo,
}) => {
  const {
    isAuthenticated,
    isLoading,
    currentMember,
    currentOrganization,
    hasRole,
    isAdmin,
  } = useAuth();

  const location = useLocation();

  // 加载中状态
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  // 未登录检查
  if (!isAuthenticated || !currentMember) {
    if (redirectTo) {
      return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }
    if (fallback) {
      return <>{fallback}</>;
    }
    return <UnauthorizedFallback reason="login" />;
  }

  // 组织状态检查
  if (requireActiveOrganization && 
      currentOrganization?.accountStatus !== AccountStatus.ACTIVE) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <UnauthorizedFallback reason="organization" />;
  }

  // 成员状态检查
  if (requireActive && currentMember.accountStatus !== AccountStatus.ACTIVE) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <UnauthorizedFallback reason="member" />;
  }

  // 管理员权限检查
  if (requireAdmin && !isAdmin()) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <UnauthorizedFallback reason="admin" />;
  }

  // 特定角色检查
  if (requiredRole && !hasRole(requiredRole)) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <UnauthorizedFallback reason="role" requiredRole={requiredRole} />;
  }

  // 权限验证通过，渲染子组件
  return <>{children}</>;
};

interface RequireAuthProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({
  children,
  fallback,
  redirectTo = '/auth',
}) => {
  return (
    <PermissionGuard
      requireActive={false}
      requireActiveOrganization={false}
      fallback={fallback}
      redirectTo={redirectTo}
    >
      {children}
    </PermissionGuard>
  );
};

interface RequireAdminProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RequireAdmin: React.FC<RequireAdminProps> = ({
  children,
  fallback,
}) => {
  return (
    <PermissionGuard
      requireAdmin={true}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  );
};

interface RequireActiveProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RequireActive: React.FC<RequireActiveProps> = ({
  children,
  fallback,
}) => {
  return (
    <PermissionGuard
      requireActive={true}
      requireActiveOrganization={true}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  );
};

interface RequireRoleProps {
  children: React.ReactNode;
  role: MemberRole;
  fallback?: React.ReactNode;
}

export const RequireRole: React.FC<RequireRoleProps> = ({
  children,
  role,
  fallback,
}) => {
  return (
    <PermissionGuard
      requiredRole={role}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  );
};

// 无权限访问时的回退组件
interface UnauthorizedFallbackProps {
  reason: 'login' | 'admin' | 'role' | 'member' | 'organization';
  requiredRole?: MemberRole;
}

const UnauthorizedFallback: React.FC<UnauthorizedFallbackProps> = ({
  reason,
  requiredRole,
}) => {
  const { logout } = useAuth();

  const getContent = () => {
    switch (reason) {
      case 'login':
        return {
          icon: <LogIn className="h-12 w-12 text-blue-500" />,
          title: '需要登录',
          description: '请先登录以访问此功能',
          action: (
            <Button onClick={() => window.location.href = '/auth'}>
              前往登录
            </Button>
          ),
        };
      
      case 'admin':
        return {
          icon: <Shield className="h-12 w-12 text-red-500" />,
          title: '需要管理员权限',
          description: '此功能仅限管理员访问',
          action: (
            <Button variant="outline" onClick={logout}>
              切换账户
            </Button>
          ),
        };
      
      case 'role':
        return {
          icon: <Lock className="h-12 w-12 text-orange-500" />,
          title: '权限不足',
          description: `此功能需要 ${requiredRole === MemberRole.ADMIN ? '管理员' : '成员'} 权限`,
          action: (
            <Button variant="outline" onClick={logout}>
              切换账户
            </Button>
          ),
        };
      
      case 'member':
        return {
          icon: <UserX className="h-12 w-12 text-red-500" />,
          title: '账户已被禁用',
          description: '您的账户已被管理员禁用，无法访问系统功能',
          action: (
            <Button variant="outline" onClick={logout}>
              重新登录
            </Button>
          ),
        };
      
      case 'organization':
        return {
          icon: <Building2 className="h-12 w-12 text-red-500" />,
          title: '组织账户已暂停',
          description: '您所在的组织账户已被暂停，请联系平台管理员',
          action: (
            <Button variant="outline" onClick={logout}>
              重新登录
            </Button>
          ),
        };
      
      default:
        return {
          icon: <AlertTriangle className="h-12 w-12 text-yellow-500" />,
          title: '访问受限',
          description: '您没有权限访问此功能',
          action: null,
        };
    }
  };

  const content = getContent();

  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="mb-6 flex justify-center">
            {content.icon}
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {content.title}
          </h2>
          <p className="text-gray-600 mb-6">
            {content.description}
          </p>
          {content.action && (
            <div className="space-y-2">
              {content.action}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// 用于条件渲染的权限检查组件
interface PermissionCheckProps {
  children: React.ReactNode;
  requiredRole?: MemberRole;
  requireAdmin?: boolean;
  requireActive?: boolean;
  requireActiveOrganization?: boolean;
  fallback?: React.ReactNode;
}

export const PermissionCheck: React.FC<PermissionCheckProps> = ({
  children,
  requiredRole,
  requireAdmin = false,
  requireActive = true,
  requireActiveOrganization = true,
  fallback = null,
}) => {
  const {
    isAuthenticated,
    currentMember,
    currentOrganization,
    hasRole,
    isAdmin,
  } = useAuth();

  // 未登录
  if (!isAuthenticated || !currentMember) {
    return <>{fallback}</>;
  }

  // 组织状态检查
  if (requireActiveOrganization && 
      currentOrganization?.accountStatus !== AccountStatus.ACTIVE) {
    return <>{fallback}</>;
  }

  // 成员状态检查
  if (requireActive && currentMember.accountStatus !== AccountStatus.ACTIVE) {
    return <>{fallback}</>;
  }

  // 管理员权限检查
  if (requireAdmin && !isAdmin()) {
    return <>{fallback}</>;
  }

  // 特定角色检查
  if (requiredRole && !hasRole(requiredRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default PermissionGuard;
