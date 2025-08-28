import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// 管理员用户接口
export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: "super_admin";
  permissions: string[];
}

// 管理员认证状态接口
interface AdminAuthState {
  // 管理员用户信息
  adminUser: AdminUser | null;
  isAdminAuthenticated: boolean;
  isLoading: boolean;
  
  // 操作方法
  setAdminUser: (user: AdminUser | null) => void;
  setIsAdminAuthenticated: (authenticated: boolean) => void;
  setLoading: (loading: boolean) => void;
  
  // 清除所有状态
  clearAdminAuth: () => void;
}

// 创建管理员认证 store
export const useAdminStore = create<AdminAuthState>()(
  devtools(
    persist(
      (set) => ({
        // 初始状态
        adminUser: null,
        isAdminAuthenticated: false,
        isLoading: false,
        
        // 设置管理员用户
        setAdminUser: (adminUser) => {
          set({ adminUser });
          // 同步到 localStorage
          if (adminUser) {
            localStorage.setItem('admin_auth_user', JSON.stringify(adminUser));
            localStorage.setItem('admin_auth_token', 'admin_token_' + Date.now());
          } else {
            localStorage.removeItem('admin_auth_user');
            localStorage.removeItem('admin_auth_token');
          }
        },
        
        // 设置管理员认证状态
        setIsAdminAuthenticated: (isAdminAuthenticated) => {
          set({ isAdminAuthenticated });
        },
        
        // 设置加载状态
        setLoading: (isLoading) => {
          set({ isLoading });
        },
        
        // 清除所有认证状态
        clearAdminAuth: () => {
          set({
            adminUser: null,
            isAdminAuthenticated: false,
            isLoading: false,
          });
          // 清除所有相关的 localStorage
          localStorage.removeItem('admin_auth_user');
          localStorage.removeItem('admin_auth_token');
        },
      }),
      {
        name: 'admin-auth-storage',
        partialize: (state) => ({
          adminUser: state.adminUser,
          isAdminAuthenticated: state.isAdminAuthenticated,
        }),
      }
    ),
    {
      name: 'admin-auth-store',
    }
  )
);