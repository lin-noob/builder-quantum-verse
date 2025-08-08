import { useState, useEffect, useCallback } from 'react';
import { 
  ResponseAction, 
  PopupParameters, 
  EmailParameters 
} from '@/shared/responseActionsData';
import { 
  responseActionsApi, 
  CreateResponseActionRequest,
  UpdateResponseActionRequest,
  validateResponseAction 
} from '@/shared/responseActionsApi';

export interface UseResponseActionsReturn {
  // Data
  actions: ResponseAction[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchActions: () => Promise<void>;
  createAction: (data: CreateResponseActionRequest) => Promise<ResponseAction>;
  updateAction: (data: UpdateResponseActionRequest) => Promise<ResponseAction>;
  deleteAction: (id: string) => Promise<void>;
  enableAction: (id: string) => Promise<ResponseAction>;
  disableAction: (id: string) => Promise<ResponseAction>;
  
  // Utility
  clearError: () => void;
  refreshActions: () => Promise<void>;
}

export const useResponseActions = (): UseResponseActionsReturn => {
  const [actions, setActions] = useState<ResponseAction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all actions
  const fetchActions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await responseActionsApi.getAll();
      setActions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch actions');
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new action
  const createAction = useCallback(async (data: CreateResponseActionRequest): Promise<ResponseAction> => {
    try {
      setError(null);
      
      // Validate data
      const validationErrors = validateResponseAction(data);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      const newAction = await responseActionsApi.create(data);
      setActions(prev => [...prev, newAction]);
      return newAction;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create action';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Update action
  const updateAction = useCallback(async (data: UpdateResponseActionRequest): Promise<ResponseAction> => {
    try {
      setError(null);
      
      const updatedAction = await responseActionsApi.update(data);
      setActions(prev => prev.map(action => 
        action.id === data.id ? updatedAction : action
      ));
      return updatedAction;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update action';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Delete action
  const deleteAction = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      
      await responseActionsApi.delete(id);
      setActions(prev => prev.filter(action => action.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete action';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Enable action
  const enableAction = useCallback(async (id: string): Promise<ResponseAction> => {
    try {
      setError(null);
      
      const updatedAction = await responseActionsApi.enable(id);
      setActions(prev => prev.map(action => 
        action.id === id ? updatedAction : action
      ));
      return updatedAction;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to enable action';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Disable action
  const disableAction = useCallback(async (id: string): Promise<ResponseAction> => {
    try {
      setError(null);
      
      const updatedAction = await responseActionsApi.disable(id);
      setActions(prev => prev.map(action => 
        action.id === id ? updatedAction : action
      ));
      return updatedAction;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to disable action';
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Refresh actions (alias for fetchActions)
  const refreshActions = useCallback(async () => {
    await fetchActions();
  }, [fetchActions]);

  // Load actions on mount
  useEffect(() => {
    fetchActions();
  }, [fetchActions]);

  return {
    // Data
    actions,
    loading,
    error,
    
    // Actions
    fetchActions,
    createAction,
    updateAction,
    deleteAction,
    enableAction,
    disableAction,
    
    // Utility
    clearError,
    refreshActions,
  };
};

// Helper function to convert form data to API request format
export const convertFormDataToApiRequest = (
  formData: any,
  actionType: 'POPUP' | 'EMAIL',
  isDraft: boolean
): CreateResponseActionRequest => {
  let parameters;

  if (actionType === 'POPUP') {
    parameters = {
      type: 'popup',
      title: formData.popupTitle,
      content: formData.popupContent,
      buttonText: formData.popupButtonText,
      buttonLink: formData.popupButtonLink,
    } as PopupParameters;
  } else {
    parameters = {
      type: 'email',
      subject: formData.emailSubject,
      content: formData.emailContent,
      senderName: formData.emailSenderName,
    } as EmailParameters;
  }

  return {
    actionName: formData.actionName,
    actionType: actionType,
    purpose: formData.purpose,
    status: isDraft ? 'DRAFT' : 'ACTIVE',
    parameters,
  };
};
