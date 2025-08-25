import { emailService } from './emailService';

// Simple authentication service for demo purposes
interface User {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
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

  // 默认管理员账号
  private defaultAdmin = {
    id: "admin-001",
    username: "admin",
    email: "admin",
    password: "123456",
    isAdmin: true
  };

  constructor() {
    // 在初始化时自动设置默认登录状态
    this.initializeDefaultUser();
  }

  private initializeDefaultUser() {
    try {
      // 检查是否已有用户登录
      const storedUser = localStorage.getItem('auth_user');
      const storedToken = localStorage.getItem('auth_token');

      if (storedUser && storedToken) {
        // 如果已有用户登录，恢复用户状态
        this.currentUser = JSON.parse(storedUser);
        this.isAuthenticated = true;
      } else {
        // 如果没有用户登录，自动登录默认管理员
        this.currentUser = {
          id: this.defaultAdmin.id,
          username: this.defaultAdmin.username,
          email: this.defaultAdmin.email,
          isAdmin: this.defaultAdmin.isAdmin
        };
        this.isAuthenticated = true;

        // 存储到 localStorage
        localStorage.setItem('auth_user', JSON.stringify(this.currentUser));
        localStorage.setItem('auth_token', 'default_token_' + Date.now());
      }
    } catch (error) {
      // 如果出错，设置默认用户
      this.currentUser = {
        id: this.defaultAdmin.id,
        username: this.defaultAdmin.username,
        email: this.defaultAdmin.email,
        isAdmin: this.defaultAdmin.isAdmin
      };
      this.isAuthenticated = true;

      localStorage.setItem('auth_user', JSON.stringify(this.currentUser));
      localStorage.setItem('auth_token', 'default_token_' + Date.now());
    }
  }

  // 模拟用户数据库
  private users: Array<{
    id: string;
    username: string;
    email: string;
    password: string;
    isAdmin: boolean;
  }> = [this.defaultAdmin];

  // 模拟验证码存储
  private verificationCodes: Map<string, {
    code: string;
    expiresAt: number;
    type: 'register' | 'reset';
  }> = new Map();

  // 登录
  async login(credentials: LoginCredentials): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // 查找用户
      const user = this.users.find(u => 
        u.email === credentials.email || u.username === credentials.email
      );

      if (!user) {
        return { success: false, error: "该邮箱未注册账户" };
      }

      if (user.password !== credentials.password) {
        return { success: false, error: "邮箱或密码错误，请重新输入" };
      }

      // 登录成功
      this.currentUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin
      };
      this.isAuthenticated = true;

      // 存储到 localStorage
      localStorage.setItem('auth_user', JSON.stringify(this.currentUser));
      localStorage.setItem('auth_token', 'mock_token_' + Date.now());

      return { success: true, user: this.currentUser };
    } catch (error) {
      return { success: false, error: "登录失败，请重试" };
    }
  }

  // 注册
  async register(data: RegisterData): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // 检查邮箱���否已存在
      if (this.users.some(u => u.email === data.email)) {
        return { success: false, error: "该用户已存在" };
      }

      // 验证验证码
      const storedCode = this.verificationCodes.get(data.email);
      if (!storedCode || storedCode.code !== data.confirmationCode || storedCode.expiresAt < Date.now()) {
        return { success: false, error: "验证码无效，请重试" };
      }

      // 创建新用户
      const newUser = {
        id: 'user_' + Date.now(),
        username: data.username,
        email: data.email,
        password: data.password,
        isAdmin: false
      };

      this.users.push(newUser);

      // 自动登录
      this.currentUser = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        isAdmin: newUser.isAdmin
      };
      this.isAuthenticated = true;

      // 清除验证码
      this.verificationCodes.delete(data.email);

      // 存储到 localStorage
      localStorage.setItem('auth_user', JSON.stringify(this.currentUser));
      localStorage.setItem('auth_token', 'mock_token_' + Date.now());

      return { success: true, user: this.currentUser };
    } catch (error) {
      return { success: false, error: "注册失败，请重试" };
    }
  }

  // 发送验证码
  async sendVerificationCode(email: string, type: 'register' | 'reset' = 'register'): Promise<{ success: boolean; error?: string }> {
    try {
      const userExists = this.users.some(u => u.email === email);

      if (type === 'register' && userExists) {
        return { success: false, error: "该用户已存在" };
      }

      if (type === 'reset' && !userExists) {
        return { success: false, error: "该邮箱地址未注册" };
      }

      // 生成验证码
      const code = type === 'register' ? '123456' : '8764'; // 固定验证码便于测试
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10分钟后过期

      this.verificationCodes.set(email, { code, expiresAt, type });

      // 发送邮件
      if (type === 'register') {
        await emailService.sendRegistrationEmail(email, code);
      } else {
        await emailService.sendPasswordResetEmail(email, code);
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: "发送验证码失败，请重试" };
    }
  }

  // 验证验证码
  async verifyCode(email: string, code: string): Promise<{ success: boolean; error?: string }> {
    const storedCode = this.verificationCodes.get(email);
    
    if (!storedCode || storedCode.code !== code || storedCode.expiresAt < Date.now()) {
      return { success: false, error: "验证码无效，请重试" };
    }

    return { success: true };
  }

  // 重置密码
  async resetPassword(email: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const userIndex = this.users.findIndex(u => u.email === email);

      if (userIndex === -1) {
        return { success: false, error: "用户不存在" };
      }

      this.users[userIndex].password = newPassword;

      // 清除验证码
      this.verificationCodes.delete(email);

      return { success: true };
    } catch (error) {
      return { success: false, error: "重置密码失败，请重试" };
    }
  }

  // 修改密码（需要当前密码验证）
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.currentUser) {
        return { success: false, error: "请先登录" };
      }

      // 验证当前密码
      const user = this.users.find(u => u.id === this.currentUser!.id);
      if (!user || user.password !== currentPassword) {
        return { success: false, error: "当前密码错误" };
      }

      // 更新密码
      user.password = newPassword;

      return { success: true };
    } catch (error) {
      return { success: false, error: "修改密码失败，请重试" };
    }
  }

  // 登出
  logout(): void {
    this.currentUser = null;
    this.isAuthenticated = false;
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
  }

  // 获取当前用户
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // 检查是否已登录
  isLoggedIn(): boolean {
    return this.isAuthenticated || !!localStorage.getItem('auth_token');
  }

  // 检查邮箱是否存在
  checkEmailExists(email: string): boolean {
    return this.users.some(u => u.email === email);
  }
}

// 导出单例实例
export const authService = new AuthService();
export type { User, LoginCredentials, RegisterData };
