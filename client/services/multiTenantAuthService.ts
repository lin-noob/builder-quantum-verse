// 多租户认证服务
// 基于PRD文档的多租户账户体系认证实现

import {
  Member,
  Organization,
  AccountStatus,
  canMemberLogin,
} from '../../shared/organizationData';
import { authApi } from '../../shared/organizationApi';

export interface AuthSession {
  member: Member;
  organization: Organization;
  loginTime: string;
  expiresAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResult {
  success: boolean;
  message: string;
  session?: AuthSession;
}

class MultiTenantAuthService {
  private currentSession: AuthSession | null = null;
  private readonly sessionKey = 'auth_session';
  private readonly memberKey = 'auth_member';
  private readonly organizationKey = 'auth_organization';

  constructor() {
    this.initializeFromStorage();
  }

  /**
   * 从本地存储初始化会话
   */
  private initializeFromStorage(): void {
    try {
      const storedMember = localStorage.getItem(this.memberKey);
      const storedOrganization = localStorage.getItem(this.organizationKey);
      
      if (storedMember && storedOrganization) {
        const member = JSON.parse(storedMember) as Member;
        const organization = JSON.parse(storedOrganization) as Organization;
        
        // 验证会话是否仍然有效
        if (this.isValidSession(member, organization)) {
          this.currentSession = {
            member,
            organization,
            loginTime: new Date().toISOString(),
          };
        } else {
          this.clearStoredSession();
        }
      }
    } catch (error) {
      console.error('Failed to initialize auth session:', error);
      this.clearStoredSession();
    }
  }

  /**
   * 验证会话是否有效
   */
  private isValidSession(member: Member, organization: Organization): boolean {
    // 检查成员和组织状态
    return canMemberLogin(member) && 
           organization.accountStatus === AccountStatus.ACTIVE;
  }

  /**
   * 保存会话到本地存储
   */
  private saveSessionToStorage(session: AuthSession): void {
    try {
      localStorage.setItem(this.memberKey, JSON.stringify(session.member));
      localStorage.setItem(this.organizationKey, JSON.stringify(session.organization));
      localStorage.setItem(this.sessionKey, JSON.stringify({
        loginTime: session.loginTime,
        expiresAt: session.expiresAt,
      }));
    } catch (error) {
      console.error('Failed to save auth session:', error);
    }
  }

  /**
   * 清除本地存储的会话
   */
  private clearStoredSession(): void {
    localStorage.removeItem(this.memberKey);
    localStorage.removeItem(this.organizationKey);
    localStorage.removeItem(this.sessionKey);
  }

  /**
   * 用户登录
   */
  async login(credentials: LoginCredentials): Promise<LoginResult> {
    try {
      const response = await authApi.login(credentials.email, credentials.password);
      
      if (response.success) {
        const { member, organization } = response.data;
        
        // 检查登录权限
        if (!canMemberLogin(member)) {
          const reason = organization.accountStatus === AccountStatus.SUSPENDED 
            ? '组织账户已被暂停，请联系平台管理员' 
            : '您的账户已被禁用，请联系组织管理员';
          
          return {
            success: false,
            message: reason,
          };
        }
        
        // 创建会话
        const session: AuthSession = {
          member,
          organization,
          loginTime: new Date().toISOString(),
        };
        
        this.currentSession = session;
        this.saveSessionToStorage(session);
        
        return {
          success: true,
          message: '登录成功',
          session,
        };
      } else {
        return {
          success: false,
          message: response.message || '登录失败',
        };
      }
    } catch (error) {
      console.error('Login failed:', error);
      return {
        success: false,
        message: '网络错误，请稍后重试',
      };
    }
  }

  /**
   * 用户登出
   */
  logout(): void {
    this.currentSession = null;
    this.clearStoredSession();
  }

  /**
   * 获取当前用户
   */
  getCurrentMember(): Member | null {
    return this.currentSession?.member || null;
  }

  /**
   * 获取当前组织
   */
  getCurrentOrganization(): Organization | null {
    return this.currentSession?.organization || null;
  }

  /**
   * 获取当前会话
   */
  getCurrentSession(): AuthSession | null {
    return this.currentSession;
  }

  /**
   * 检查是否已登录
   */
  isAuthenticated(): boolean {
    return this.currentSession !== null;
  }

  /**
   * 检查用户是否有指定角色
   */
  hasRole(role: string): boolean {
    return this.currentSession?.member.role === role;
  }

  /**
   * 检查用户是否是管理员
   */
  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  /**
   * 检查用户是否是成员
   */
  isMember(): boolean {
    return this.hasRole('MEMBER');
  }

  /**
   * 检查用户是否可以访问管理功能
   */
  canAccessAdminFeatures(): boolean {
    const member = this.getCurrentMember();
    const organization = this.getCurrentOrganization();
    
    return member?.role === 'ADMIN' && 
           member?.accountStatus === AccountStatus.ACTIVE &&
           organization?.accountStatus === AccountStatus.ACTIVE;
  }

  /**
   * 检查用户是否可以管理成员
   */
  canManageMembers(): boolean {
    return this.canAccessAdminFeatures();
  }

  /**
   * 检查用户是否可以管理组织设置
   */
  canManageOrganization(): boolean {
    return this.canAccessAdminFeatures();
  }

  /**
   * 获取当前用户的组织ID
   */
  getCurrentOrganizationId(): string | null {
    return this.currentSession?.organization.organizationId || null;
  }

  /**
   * 获取当前用户的成员ID
   */
  getCurrentMemberId(): string | null {
    return this.currentSession?.member.memberId || null;
  }

  /**
   * 刷新当前会话（从服务器重新获取用户信息）
   */
  async refreshSession(): Promise<boolean> {
    const currentMember = this.getCurrentMember();
    if (!currentMember) {
      return false;
    }

    try {
      // 这里可以调用API重新获取用户信息
      // 目前暂时保持现有会话
      return true;
    } catch (error) {
      console.error('Failed to refresh session:', error);
      this.logout();
      return false;
    }
  }

  /**
   * 验证当前会话是否仍然有效
   */
  async validateSession(): Promise<boolean> {
    const session = this.getCurrentSession();
    if (!session) {
      return false;
    }

    // 检查本地状态
    if (!this.isValidSession(session.member, session.organization)) {
      this.logout();
      return false;
    }

    // 这里可以添加服务器端验证
    return true;
  }

  /**
   * 获取用户显示名称
   */
  getUserDisplayName(): string {
    const member = this.getCurrentMember();
    return member?.name || member?.email || '未知用户';
  }

  /**
   * 获取组织显示名称
   */
  getOrganizationDisplayName(): string {
    const organization = this.getCurrentOrganization();
    return organization?.name || '未知组织';
  }

  /**
   * 检查是否有特定权限
   */
  hasPermission(permission: string): boolean {
    const member = this.getCurrentMember();
    const organization = this.getCurrentOrganization();
    
    if (!member || !organization) {
      return false;
    }

    // 基础权限检查
    if (member.accountStatus !== AccountStatus.ACTIVE ||
        organization.accountStatus !== AccountStatus.ACTIVE) {
      return false;
    }

    switch (permission) {
      case 'read:members':
        return member.role === 'ADMIN' || member.role === 'MEMBER';
      case 'write:members':
        return member.role === 'ADMIN';
      case 'admin:organization':
        return member.role === 'ADMIN';
      case 'read:analytics':
        return member.role === 'ADMIN' || member.role === 'MEMBER';
      case 'write:settings':
        return member.role === 'ADMIN';
      default:
        return false;
    }
  }
}

// 创建单例实例
export const multiTenantAuthService = new MultiTenantAuthService();

export default multiTenantAuthService;
