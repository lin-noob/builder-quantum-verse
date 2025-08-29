import { useEffect } from 'react';
import { useRoleStore } from '@/stores';

export const useFetchRolesOnMount = () => {
  const { roles, fetchRoles, isLoading, error } = useRoleStore();

  useEffect(() => {
    if (roles.length === 0) {
      fetchRoles();
    }
  }, [fetchRoles, roles.length]);

  return { roles, isLoading, error, refetch: fetchRoles };
};