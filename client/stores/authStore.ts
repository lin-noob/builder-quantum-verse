import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// 用户接口
export interface User {
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

// 认证状态接口
interface AuthState {
  // 用户信息
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // 忘记密码相关状态
  resetPasswordKey: string | null;
  resetPasswordVerified: boolean;
  resetPasswordEmail: string | null;
  resetPasswordCode: string | null;
  resetPasswordCompleted: boolean;
  
  // 验证码相关
  verificationCodes: Map<string, {
    code: string;
    expiresAt: number;
    type: 'register' | 'reset';
  }>;
  
  // 操作方法
  setUser: (user: User | null) => void;
  setIsAuthenticated: (authenticated: boolean) => void;
  setLoading: (loading: boolean) => void;
  
  // 忘记密码相关
  setResetPasswordKey: (key: string | null) => void;
  setResetPasswordVerified: (verified: boolean) => void;
  setResetPasswordEmail: (email: string | null) => void;
  setResetPasswordCode: (code: string | null) => void;
  setResetPasswordCompleted: (completed: boolean) => void;
  clearResetPasswordData: () => void;
  
  // 验证码相关
  setVerificationCode: (email: string, code: string, expiresAt: number, type: 'register' | 'reset') => void;
  getVerificationCode: (email: string) => { code: string; expiresAt: number; type: 'register' | 'reset' } | null;
  removeVerificationCode: (email: string) => void;
  
  // 清除所有状态
  clearAuth: () => void;
}

// 创建认证 store
export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // 初始状态
        user: null,
        isAuthenticated: false,
        isLoading: false,
        resetPasswordKey: null,
        resetPasswordVerified: false,
        resetPasswordEmail: null,
        resetPasswordCode: null,
        resetPasswordCompleted: false,
        verificationCodes: new Map(),
        
        // 设置用户
        setUser: (user) => {
          set({ user });
          // 同步到 localStorage
          if (user) {
            localStorage.setItem('auth_user', JSON.stringify(user));
            localStorage.setItem('auth_token', user.session || '');
            if (user.session) {
              localStorage.setItem('auth_session', user.session);
            }
            if (user.account) {
              localStorage.setItem('auth_account', user.account);
            }
            if (user.usertype) {
              localStorage.setItem('auth_usertype', user.usertype);
            }
            if (user.companyid) {
              localStorage.setItem('auth_companyid', user.companyid);
            }
            if (user.lastlogintime) {
              localStorage.setItem('last_login_time', user.lastlogintime.toString());
            }
          } else {
            localStorage.removeItem('auth_user');
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_session');
            localStorage.removeItem('auth_account');
            localStorage.removeItem('auth_usertype');
            localStorage.removeItem('auth_companyid');
            localStorage.removeItem('last_login_time');
          }
        },
        
        // 设置认证状态
        setIsAuthenticated: (authenticated) => {
          set({ isAuthenticated: authenticated });
        },
        
        // 设置加载状态
        setLoading: (loading) => {
          set({ isLoading: loading });
        },
        
        // 设置重置密码 key
        setResetPasswordKey: (key) => {
          set({ resetPasswordKey: key });
          if (key) {
            localStorage.setItem('reset_password_key', key);
          } else {
            localStorage.removeItem('reset_password_key');
          }
        },
        
        // 设置重置密码验证状态
        setResetPasswordVerified: (verified) => {
          set({ resetPasswordVerified: verified });
          if (verified) {
            localStorage.setItem('reset_password_verified', 'true');
          } else {
            localStorage.removeItem('reset_password_verified');
          }
        },
        
        // 设置重置密码邮箱
        setResetPasswordEmail: (email) => {
          set({ resetPasswordEmail: email });
        },
        
        // 设置重置密码验证码
        setResetPasswordCode: (code) => {
          set({ resetPasswordCode: code });
        },
        
        // 设置重置密码完成状态
        setResetPasswordCompleted: (completed) => {
          set({ resetPasswordCompleted: completed });
        },
        
        // 清除重置密码数据
        clearResetPasswordData: () => {
          set({
            resetPasswordKey: null,
            resetPasswordVerified: false,
            resetPasswordEmail: null,
            resetPasswordCode: null,
            resetPasswordCompleted: false,
          });
          localStorage.removeItem('reset_password_key');
          localStorage.removeItem('reset_password_verified');
        },
        
        // 设置验证码
        setVerificationCode: (email, code, expiresAt, type) => {
          const verificationCodes = new Map(get().verificationCodes);
          verificationCodes.set(email, { code, expiresAt, type });
          set({ verificationCodes });
        },
        
        // 获取验证码
        getVerificationCode: (email) => {
          return get().verificationCodes.get(email) || null;
        },
        
        // 移除验证码
        removeVerificationCode: (email) => {
          const verificationCodes = new Map(get().verificationCodes);
          verificationCodes.delete(email);
          set({ verificationCodes });
        },
        
        // 清除所有认证状态
        clearAuth: () => {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            resetPasswordKey: null,
            resetPasswordVerified: false,
            resetPasswordEmail: null,
            resetPasswordCode: null,
            resetPasswordCompleted: false,
            verificationCodes: new Map(),
          });
          // 清除所有相关的 localStorage
          localStorage.removeItem('auth_user');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_session');
          localStorage.removeItem('auth_account');
          localStorage.removeItem('auth_usertype');
          localStorage.removeItem('auth_companyid');
          localStorage.removeItem('last_login_time');
          localStorage.removeItem('reset_password_key');
          localStorage.removeItem('reset_password_verified');
        },
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          resetPasswordKey: state.resetPasswordKey,
          resetPasswordVerified: state.resetPasswordVerified,
          resetPasswordEmail: state.resetPasswordEmail,
          resetPasswordCode: state.resetPasswordCode,
          resetPasswordCompleted: state.resetPasswordCompleted,
        }),
      }
    ),
    {
      name: 'auth-store',
    }
  )
);