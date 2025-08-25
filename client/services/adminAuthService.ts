// Admin authentication service for super admin access only
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

  // 默认超级管理员账号
  private defaultSuperAdmin = {
    id: "super-admin-001",
    username: "superadmin",
    email: "admin@system.com",
    password: "admin123456",
    role: "super_admin" as const,
    permissions: ["*"], // 超级管理员拥有所有权限
  };

  constructor() {
    // 在初始化时自动设置默认超级管理员登录状态
    this.initializeDefaultAdminUser();
  }

  private initializeDefaultAdminUser() {
    try {
      // 检查是否已有超级管理员登录
      const storedAdminUser = localStorage.getItem("admin_auth_user");
      const storedAdminToken = localStorage.getItem("admin_auth_token");

      if (storedAdminUser && storedAdminToken) {
        // 如果已有超级管理员登录，恢复用户状态
        this.currentAdminUser = JSON.parse(storedAdminUser);
        this.isAdminAuthenticated = true;
      } else {
        // 如果没有超级管理员登录，自动登录默认超级管理员
        this.currentAdminUser = {
          id: this.defaultSuperAdmin.id,
          username: this.defaultSuperAdmin.username,
          email: this.defaultSuperAdmin.email,
          role: this.defaultSuperAdmin.role,
          permissions: this.defaultSuperAdmin.permissions,
        };
        this.isAdminAuthenticated = true;

        // 存储到 localStorage
        localStorage.setItem(
          "admin_auth_user",
          JSON.stringify(this.currentAdminUser),
        );
        localStorage.setItem(
          "admin_auth_token",
          "default_admin_token_" + Date.now(),
        );
      }
    } catch (error) {
      // 如果出错，设置默认超级管理员
      this.currentAdminUser = {
        id: this.defaultSuperAdmin.id,
        username: this.defaultSuperAdmin.username,
        email: this.defaultSuperAdmin.email,
        role: this.defaultSuperAdmin.role,
        permissions: this.defaultSuperAdmin.permissions,
      };
      this.isAdminAuthenticated = true;

      localStorage.setItem(
        "admin_auth_user",
        JSON.stringify(this.currentAdminUser),
      );
      localStorage.setItem(
        "admin_auth_token",
        "default_admin_token_" + Date.now(),
      );
    }
  }

  // 超级管理员数据库（只存储超级管理员账号）
  private adminUsers: Array<{
    id: string;
    username: string;
    email: string;
    password: string;
    role: "super_admin";
    permissions: string[];
  }> = [this.defaultSuperAdmin];

  // 邀请码管理（用于注册新的超级管理员）
  private inviteCodes: Set<string> = new Set(["SUPER_ADMIN_INVITE_2024"]);

  // 超级管理员登录
  async adminLogin(
    credentials: AdminLoginCredentials,
  ): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
    try {
      // 查找超级管理员用户
      const adminUser = this.adminUsers.find(
        (u) =>
          u.email === credentials.email || u.username === credentials.email,
      );

      if (!adminUser) {
        return { success: false, error: "超级管理员账户不存在" };
      }

      if (adminUser.password !== credentials.password) {
        return { success: false, error: "邮箱或密码错误，请重新输入" };
      }

      // 登录成功
      this.currentAdminUser = {
        id: adminUser.id,
        username: adminUser.username,
        email: adminUser.email,
        role: adminUser.role,
        permissions: adminUser.permissions,
      };
      this.isAdminAuthenticated = true;

      // 存储到 localStorage（使用不同的 key 以避免与主平台冲突）
      localStorage.setItem(
        "admin_auth_user",
        JSON.stringify(this.currentAdminUser),
      );
      localStorage.setItem("admin_auth_token", "admin_token_" + Date.now());

      return { success: true, user: this.currentAdminUser };
    } catch (error) {
      return { success: false, error: "登录失败，请重试" };
    }
  }

  // 超级管理员注册（需要邀请码）
  async adminRegister(
    data: AdminRegisterData,
  ): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
    try {
      // 验证邀请码
      if (!this.inviteCodes.has(data.inviteCode)) {
        return { success: false, error: "邀请码无效，请联系系统管理员" };
      }

      // 检查邮箱是否已存在
      if (this.adminUsers.some((u) => u.email === data.email)) {
        return { success: false, error: "该邮箱已被注册" };
      }

      // 创建新的超级管理员
      const newAdminUser = {
        id: "super_admin_" + Date.now(),
        username: data.username,
        email: data.email,
        password: data.password,
        role: "super_admin" as const,
        permissions: ["*"],
      };

      this.adminUsers.push(newAdminUser);

      // 自动登录
      this.currentAdminUser = {
        id: newAdminUser.id,
        username: newAdminUser.username,
        email: newAdminUser.email,
        role: newAdminUser.role,
        permissions: newAdminUser.permissions,
      };
      this.isAdminAuthenticated = true;

      // 使用邀请码后移除它（一次性使用）
      this.inviteCodes.delete(data.inviteCode);

      // 存储到 localStorage
      localStorage.setItem(
        "admin_auth_user",
        JSON.stringify(this.currentAdminUser),
      );
      localStorage.setItem("admin_auth_token", "admin_token_" + Date.now());

      return { success: true, user: this.currentAdminUser };
    } catch (error) {
      return { success: false, error: "注册失败，请重试" };
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

      // 验证当前密码
      const adminUser = this.adminUsers.find(
        (u) => u.id === this.currentAdminUser!.id,
      );
      if (!adminUser || adminUser.password !== currentPassword) {
        return { success: false, error: "当前密码错误" };
      }

      // 更新密码
      adminUser.password = newPassword;

      return { success: true };
    } catch (error) {
      return { success: false, error: "修改密码失败，请重试" };
    }
  }

  // 超级管理员登出
  adminLogout(): void {
    this.currentAdminUser = null;
    this.isAdminAuthenticated = false;
    localStorage.removeItem("admin_auth_user");
    localStorage.removeItem("admin_auth_token");
  }

  // 获取当前超级管理员用户
  getCurrentAdminUser(): AdminUser | null {
    return this.currentAdminUser;
  }

  // 检查是否已登录管理后台
  isAdminLoggedIn(): boolean {
    return (
      this.isAdminAuthenticated || !!localStorage.getItem("admin_auth_token")
    );
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

  // 验证邀请码是否有效
  validateInviteCode(code: string): boolean {
    return this.inviteCodes.has(code);
  }

  // 生成新的邀请码（只有超级管理员可以操作）
  generateInviteCode(): string {
    if (!this.currentAdminUser) {
      throw new Error("未授权操作");
    }

    const newCode = "ADMIN_INVITE_" + Date.now().toString(36).toUpperCase();
    this.inviteCodes.add(newCode);
    return newCode;
  }

  // 获取所有有效邀请码（只有超级管理员可以查看）
  getValidInviteCodes(): string[] {
    if (!this.currentAdminUser) {
      throw new Error("未授权操作");
    }

    return Array.from(this.inviteCodes);
  }

  // 撤销邀请码
  revokeInviteCode(code: string): boolean {
    if (!this.currentAdminUser) {
      throw new Error("未授权操作");
    }

    return this.inviteCodes.delete(code);
  }
}

// 导出单例实例
export const adminAuthService = new AdminAuthService();
export type { AdminUser, AdminLoginCredentials, AdminRegisterData };
