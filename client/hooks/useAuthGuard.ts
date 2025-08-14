import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import { useToast } from '@/hooks/use-toast';

export function useAuthGuard() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    
    if (!currentUser || !authService.isLoggedIn()) {
      toast({
        title: "请先登录",
        description: "您需要登录后才能访问此页面",
        variant: "destructive"
      });
      navigate('/auth');
    }
  }, [navigate, toast]);

  return authService.getCurrentUser();
}
