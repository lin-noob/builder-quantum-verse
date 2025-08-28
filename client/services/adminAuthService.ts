// Admin authentication service for super admin access only
import { useAdminStore } from "@/stores";
import { request } from "@/lib/request";

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: "super_admin";
  permissions: string[];
}

interface AdminLoginCredentials {
  email: string;
  password: string;
}

interface AdminRegisterData {
  username: string;
  email: string;
  password: string;
  inviteCode: string; // 邀请码，只有拥有邀请码才能注册超级管理��
}

class AdminAuthService {
  private currentAdminUser: AdminUser | null = null;
  private isAdminAuthenticated = false;

  constructor() {
    // 在初始化时检查store中的管理员登录状态
    this.initializeAdminUser();
  }

  private initializeAdminUser() {
    // 检查 Zustand store 中是否已有管理员用户
    const { adminUser, isAdminAuthenticated } = useAdminStore.getState();
    
    if (adminUser && isAdminAuthenticated) {
      // 如果 store 中已有管理员用户，恢复用户状态
      this.currentAdminUser = adminUser;
      this.isAdminAuthenticated = true;
    }
  }

  // 超级管理员登录
  async adminLogin(
    credentials: AdminLoginCredentials,
  ): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
    try {
      // 创建JSON数据对象
      const loginData = {
        account: credentials.email, // 账号（邮箱或用户名）
        password: credentials.password // 密码
      };

      // 使用统一的请求工具类调用真实API
      const response = await request.post(
        "/admin/api/v1/auth/login", 
        loginData
      );
      const responseData = response.data;
      
      const userInfo = responseData.data;
      
      // 创建管理员用户对象
      const adminUser: AdminUser = {
        id: userInfo.id,
        username: userInfo.account,
        email: userInfo.account,
        role: "super_admin",
        permissions: ["*"], // 超级管理员拥有所有权限
      };

      // 登录成功
      this.currentAdminUser = adminUser;
      this.isAdminAuthenticated = true;

      // 更新 store 状态
      const { setAdminUser, setIsAdminAuthenticated } = useAdminStore.getState();
      setAdminUser(this.currentAdminUser);
      setIsAdminAuthenticated(true);

      return { success: true, user: this.currentAdminUser };
    } catch (error: any) {
      return { success: false, error: error.message || "登录失败" };
    }
  }

  // 超级管理员注册（需要邀请码）
  async adminRegister(
    data: AdminRegisterData,
  ): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
    try {
      // 创建JSON数据对象
      const jsonData = {
        account: data.email, // 账号使用邮箱
        code: data.inviteCode, // 邀请码
        email: data.email, // 邮箱
        name: data.username, // 用户名
        oldpassword: "", // 旧密码，注册时为空
        password: data.password, // 新密码
      };

      // 使用统一的请求工具类调用真实API
      await request.post(
        "/admin/api/v1/admin/register",
        jsonData
      );
      
      // 注册成功后需要用户手动登录
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || "注册失败" };
    }
  }

  // 发送邀请码验证
  async sendInviteCodeVerification(
    email: string,
    inviteCode: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // 创建JSON数据对象
      const jsonData = {
        email: email,
        code: inviteCode
      };

      // 使用统一的请求工具类调用真实API
      await request.post(
        "/admin/api/v1/admin/verifyInviteCode",
        jsonData
      );

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || "邀请码验证失败" };
    }
  }

  // 修改超级管理员密码
  async changeAdminPassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.currentAdminUser) {
        return { success: false, error: "请先登录" };
      }

      // 创建JSON数据对象
      const passwordData = {
        oldpassword: currentPassword, // 旧密码
        password: newPassword // 新密码
      };

      // 使用统一的请求工具类调用真实API
      await request.post(
        "/admin/api/v1/auth/admin/changePassword",
        passwordData
      );

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || "修改密码失败，请重试" };
    }
  }

  // 超级管理员登出
  adminLogout(): void {
    this.currentAdminUser = null;
    this.isAdminAuthenticated = false;
    
    // 更新 store 状态
    const { clearAdminAuth } = useAdminStore.getState();
    clearAdminAuth();
  }

  // 获取当前超级管理员用户
  getCurrentAdminUser(): AdminUser | null {
    return this.currentAdminUser;
  }

  // 检查是否已登录管理后台
  isAdminLoggedIn(): boolean {
    // 检查内存状态或 store 状态
    const { isAdminAuthenticated } = useAdminStore.getState();
    return this.isAdminAuthenticated || isAdminAuthenticated;
  }

  // 检查是否有指定权限
  hasPermission(permission: string): boolean {
    if (!this.currentAdminUser) return false;

    // 超级管理员拥有所有权限
    return (
      this.currentAdminUser.permissions.includes("*") ||
      this.currentAdminUser.permissions.includes(permission)
    );
  }
}

// 导出单例实例
export const adminAuthService = new AdminAuthService();
export type { AdminUser, AdminLoginCredentials, AdminRegisterData };
