import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Member,
  Organization,
  MemberRole,
  AccountStatus,
  canMemberLogin,
} from "../../shared/organizationData";
import { authApi } from "../../shared/organizationApi";

interface AuthContextType {
  // 认证状态
  isAuthenticated: boolean;
  isLoading: boolean;

  // 用户信息
  currentMember: Member | null;
  currentOrganization: Organization | null;

  // 权限检查
  hasRole: (role: MemberRole) => boolean;
  isAdmin: () => boolean;
  isMember: () => boolean;
  canAccessAdminFeatures: () => boolean;
  canManageMembers: () => boolean;

  // 认证操作
  login: (
    email: string,
    password: string,
  ) => Promise<{
    success: boolean;
    message: string;
  }>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [currentOrganization, setCurrentOrganization] =
    useState<Organization | null>(null);

  // 从本地存储恢复会话
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedMember = localStorage.getItem("auth_member");
        const storedOrganization = localStorage.getItem("auth_organization");

        if (storedMember && storedOrganization) {
          const member = JSON.parse(storedMember) as Member;
          const organization = JSON.parse(storedOrganization) as Organization;

          // 验证会话是否仍然有效
          if (canMemberLogin(member)) {
            setCurrentMember(member);
            setCurrentOrganization(organization);
            setIsAuthenticated(true);
          } else {
            // 清除无效会话
            localStorage.removeItem("auth_member");
            localStorage.removeItem("auth_organization");
          }
        }
      } catch (error) {
        console.error("Failed to restore session:", error);
        localStorage.removeItem("auth_member");
        localStorage.removeItem("auth_organization");
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);

      if (response.success) {
        const { member, organization } = response.data;

        // 检查登录权限
        if (!canMemberLogin(member)) {
          return {
            success: false,
            message:
              organization.accountStatus === AccountStatus.SUSPENDED
                ? "组织账户已被暂停"
                : "账户已被禁用",
          };
        }

        setCurrentMember(member);
        setCurrentOrganization(organization);
        setIsAuthenticated(true);

        // 保存到本地存储
        localStorage.setItem("auth_member", JSON.stringify(member));
        localStorage.setItem("auth_organization", JSON.stringify(organization));

        return {
          success: true,
          message: "登录成功",
        };
      } else {
        return {
          success: false,
          message: response.message,
        };
      }
    } catch (error) {
      console.error("Login failed:", error);
      return {
        success: false,
        message: "登录失败，请重试",
      };
    }
  };

  const logout = () => {
    setCurrentMember(null);
    setCurrentOrganization(null);
    setIsAuthenticated(false);

    // 清除本地存储
    localStorage.removeItem("auth_member");
    localStorage.removeItem("auth_organization");
  };

  const refreshAuth = async () => {
    if (!currentMember) return;

    try {
      // 这里可以调用API刷新用户信息
      // 暂时保持当前实现
    } catch (error) {
      console.error("Failed to refresh auth:", error);
      logout();
    }
  };

  // 权限检查函数
  const hasRole = (role: MemberRole): boolean => {
    return currentMember?.role === role;
  };

  const isAdmin = (): boolean => {
    return hasRole(MemberRole.ADMIN);
  };

  const isMember = (): boolean => {
    return hasRole(MemberRole.MEMBER);
  };

  const canAccessAdminFeatures = (): boolean => {
    return isAdmin() && currentMember?.accountStatus === AccountStatus.ACTIVE;
  };

  const canManageMembers = (): boolean => {
    return (
      isAdmin() &&
      currentMember?.accountStatus === AccountStatus.ACTIVE &&
      currentOrganization?.accountStatus === AccountStatus.ACTIVE
    );
  };

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    currentMember,
    currentOrganization,
    hasRole,
    isAdmin,
    isMember,
    canAccessAdminFeatures,
    canManageMembers,
    login,
    logout,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
