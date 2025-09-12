import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { roleService } from '@/services/roleService';
import type { Role } from '@/types/role';
import type { ClientMenuApiItem } from '@/services/clientMenuService';

interface RoleState {
  roles: Role[];
  isLoading: boolean;
  error: string | null;
  lastFetch: number | null;
  permissions: string[];
  filteredMenus: ClientMenuApiItem[];
  
  // Actions
  setRoles: (roles: Role[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPermissions: (permissions: string[]) => void;
  setFilteredMenus: (menus: ClientMenuApiItem[]) => void;
  fetchRoles: () => Promise<void>;
  clearRoles: () => void;
  hasPermission: (permission: string) => boolean;
}

export const useRoleStore = create<RoleState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        roles: [],
        isLoading: false,
        error: null,
        lastFetch: null,
        permissions: [],
        filteredMenus: [],

        // Actions
        setRoles: (roles) => set({ roles }),
        setLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error }),
        setPermissions: (permissions) => set({ permissions }),
        setFilteredMenus: (filteredMenus) => set({ filteredMenus }),
        
        fetchRoles: async () => {
          const { isLoading, lastFetch } = get();
          
          // Don't fetch if already loading
          // if (isLoading) return;
          
          // Cache for 5 minutes (300000 ms)
          // const cacheTime = 300000;
          // if (lastFetch && Date.now() - lastFetch < cacheTime) {
          //   return;
          // }

          set({ isLoading: true, error: null });

          try {
            const roles = await roleService.getRoles();
            set({ 
              roles: roles || [],
              lastFetch: Date.now(),
              isLoading: false 
            });
          } catch (error: any) {
            set({ 
              error: error.message || 'Failed to fetch roles',
              isLoading: false 
            });
          }
        },

        clearRoles: () => set({ 
          roles: [], 
          lastFetch: null, 
          error: null,
          permissions: [],
          filteredMenus: [],
        }),

        hasPermission: (permission: string) => {
          const { permissions } = get();
          return permissions.includes(permission);
        },
      }),
      {
        name: 'role-storage',
        partialize: (state) => ({
          roles: state.roles,
          lastFetch: state.lastFetch,
          permissions: state.permissions,
          filteredMenus: state.filteredMenus,
        }),
      }
    ),
    { name: 'roleStore' }
  )
);