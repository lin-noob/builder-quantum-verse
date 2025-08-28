import { emailService } from "./emailService";
import { request } from "@/lib/request";
import { useAuthStore } from "@/stores";

// Simple authentication service for demo purposes
interface User {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  session?: string;
  account?: string;
  usertype?: string;
  companyid?: string;
  lastlogintime?: number;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmationCode: string;
}

class AuthService {
  private currentUser: User | null = null;
  private isAuthenticated = false;

  
  constructor() {
    // 在初始化时自动设置默认登录状态
    this.initializeDefaultUser();
  }

  private initializeDefaultUser() {
    // 检查 Zustand store 中是否已有用户
    const { user, isAuthenticated } = useAuthStore.getState();
    
    if (user && isAuthenticated) {
      // 如果 store 中已有用户，恢复用户状态
      this.currentUser = user;
      this.isAuthenticated = true;
    }
    // 不再自动登录默认用户，让用户手动登录
  }

  // 用户数据现在由后端管理，前端不再维护本地用户列表

  // 模拟验证码存储
  private verificationCodes: Map<
    string,
    {
      code: string;
      expiresAt: number;
      type: "register" | "reset";
    }
  > = new Map();

  // 设置当前用户（用于外部认证，如谷歌登录）
  setCurrentUser(user: User | null): void {
    this.currentUser = user;
    this.isAuthenticated = !!user;
  }

  // 登录
  async login(
    credentials: LoginCredentials,
  ): Promise<{ success: boolean; user?: User; error?: string }> {
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
      
      // 创建用户对象
      const user: User = {
        id: userInfo.id,
        username: userInfo.account,
        email: userInfo.account,
        isAdmin: userInfo.usertype === "manager",
        session: userInfo.session,
        account: userInfo.account,
        usertype: userInfo.usertype,
        companyid: userInfo.companyid,
        lastlogintime: userInfo.lastlogintime
      };
      
      this.currentUser = user;
      this.isAuthenticated = true;

      return { success: true, user: this.currentUser };
    } catch (error: any) {
      return { success: false, error: error.message || "登录失败" };
    }
  }

  // 注册
  async register(
    data: RegisterData,
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // 创建JSON数据对象
      const jsonData = {
        account: data.email, // 账号使用邮箱
        code: data.confirmationCode, // 邀请码，可选字段
        email: data.email, // 邮箱
        name: data.username, // 用户名
        oldpassword: data.password, // 旧密码，注册时为空
        password: data.password, // 新密码
      };

      // 使用统一的请求工具类调用真实API
      await request.post(
        "/admin/api/v1/users/register",
        jsonData
      );
      
      // 注册成功后需要用户手动登录
      // 清除验证码
      this.verificationCodes.delete(data.email);

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || "注册失败" };
    }
  }

  // 发送验证码
  async sendVerificationCode(
    email: string,
    type: "register" | "reset" = "register",
  ): Promise<{ success: boolean; error?: string; key?: string }> {
    try {
      // 根据类型设置ftype参数
      let ftype = type as string;
      if (type === "reset") {
        ftype = "losepassword"; // 忘记密码场景使用losepassword
      }

      // 使用统一的请求工具类调用真实API
      const response = await request.get(
        "/admin/api/v1/users/getEmailCode",
        {
          email: email,
          ftype: ftype
        }
      );
      const responseData = response.data;
      
      const key = responseData.data;
      // 生成验证码（测试环境使用固定验证码）
      const code = key;
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10分钟后过期

      this.verificationCodes.set(email, { code, expiresAt, type });
      
      // 如果是忘记密码场景，保存key用于后续验证
      if (type === "reset" && key) {
        return { success: true, key };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || "发送验证码失败" };
    }
  }

  // 验证验证码
  async verifyCode(
    email: string,
    code: string,
  ): Promise<{ success: boolean; error?: string }> {
    const storedCode = this.verificationCodes.get(email);
    
    if (
      !storedCode ||
      storedCode.code !== code ||
      storedCode.expiresAt < Date.now()
    ) {
      return { success: false, error: "验证码无效，请重试" };
    }

    return { success: true };
  }

  // 验证忘记密码验证码
  async verifyResetPasswordCode(
    code: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // 从localStorage获取key
      const key = localStorage.getItem("reset_password_key");
      
      if (!key) {
        return { success: false, error: "验证密钥无效，请重新获取验证码" };
      }

      // 使用统一的请求工具类调用验证API
      const response = await request.get(
        "/admin/api/v1/auth/verifySmsCode",
        {
          key,
          code
        }
      );
      
      // 验证成功
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || "验证码验证失败" };
    }
  }

  // 重置密码（真实API）
  async resetPassword(
    email: string,
    newPassword: string,
    code: string = '',
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // 从localStorage获取验证用的key和code
      const key = localStorage.getItem("reset_password_key");
      
      if (!key) {
        return { success: false, error: "验证信息无效，请重新获取验证码" };
      }

      // 创建请求数据
      const data = {
        account: email,
        password: newPassword,
        repassword: newPassword,
        key: key,
        code: code // 使用传递的验证码
      };

      // 使用统一的请求工具类调用真实API
      await request.post(
        "/admin/api/v1/users/updatePasswordForget",
        data
      );
      
      // 清除验证相关的数据（由 Zustand store 处理）
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || "重置密码失败" };
    }
  }

  // 修改密码（需要当前密码验证）
  async changePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.currentUser) {
        return { success: false, error: "请先登录" };
      }

      // 注意：在实际应用中，密码验证应该在服务端进行
      // 这里仅作演示用途
      return { success: true };
    } catch (error) {
      return { success: false, error: "修改密码失败，请重试" };
    }
  }

  // 登出
  async logout(): Promise<{ success: boolean; error?: string }> {
    try {
      // 调用后端登出接口
      await request.get("/admin/api/v1/auth/apilogout");
    } catch (error) {
      // 即使后端登出失败，我们仍然要清理本地状态
      console.error("后端登出失败:", error);
    }
    
    // 使用 Zustand store 清除认证状态
    const { clearAuth } = useAuthStore.getState();
    clearAuth();
    
    this.currentUser = null;
    this.isAuthenticated = false;
    
    return { success: true };
  }

  // 获取当前用户
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // 检查是否已登录
  isLoggedIn(): boolean {
    // 优先检查 Zustand store
    const { isAuthenticated } = useAuthStore.getState();
    return isAuthenticated || this.isAuthenticated || !!localStorage.getItem("auth_token");
  }

  // 邮箱检查现在由后端API处理
}

// 导出单例实例
export const authService = new AuthService();
export type { User, LoginCredentials, RegisterData };
