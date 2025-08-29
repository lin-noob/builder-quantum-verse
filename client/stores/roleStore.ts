import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { roleService } from '@/services/roleService';
import type { Role } from '@/types/role';

interface RoleState {
  roles: Role[];
  isLoading: boolean;
  error: string | null;
  lastFetch: number | null;
  
  // Actions
  setRoles: (roles: Role[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchRoles: () => Promise<void>;
  clearRoles: () => void;
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

        // Actions
        setRoles: (roles) => set({ roles }),
        setLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error }),
        
        fetchRoles: async () => {
          const { isLoading, lastFetch } = get();
          
          // Don't fetch if already loading
          if (isLoading) return;
          
          // Cache for 5 minutes (300000 ms)
          const cacheTime = 300000;
          if (lastFetch && Date.now() - lastFetch < cacheTime) {
            return;
          }

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
          error: null 
        }),
      }),
      {
        name: 'role-storage',
        partialize: (state) => ({
          roles: state.roles,
          lastFetch: state.lastFetch,
        }),
      }
    ),
    { name: 'roleStore' }
  )
);