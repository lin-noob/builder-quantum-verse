import { useEffect, useState } from 'react';
import { useRoleStore } from '@/stores';
import { authService } from '@/services/authService';

export const useFetchRolesOnMount = () => {
  const { roles, fetchRoles, isLoading, error } = useRoleStore();
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  useEffect(() => {
    if(currentUser){
      fetchRoles();
    }
  }, [fetchRoles, roles.length, currentUser]);

  return { roles, isLoading, error, refetch: fetchRoles };
};