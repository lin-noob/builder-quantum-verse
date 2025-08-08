import { ResponseAction } from './responseActionsData';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory storage for demo purposes
let actionsStore = [...require('./responseActionsData').mockResponseActions];

export interface CreateResponseActionRequest {
  actionName: string;
  actionType: 'POPUP' | 'EMAIL';
  purpose: string;
  status: 'DRAFT' | 'ACTIVE';
  parameters: any;
}

export interface UpdateResponseActionRequest {
  id: string;
  actionName?: string;
  actionType?: 'POPUP' | 'EMAIL';
  purpose?: string;
  status?: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  parameters?: any;
}

// API Functions
export const responseActionsApi = {
  // Get all response actions
  async getAll(): Promise<ResponseAction[]> {
    await delay(300);
    return [...actionsStore];
  },

  // Get response action by ID
  async getById(id: string): Promise<ResponseAction | null> {
    await delay(100);
    const action = actionsStore.find(action => action.id === id);
    return action || null;
  },

  // Create new response action
  async create(data: CreateResponseActionRequest): Promise<ResponseAction> {
    await delay(500);
    
    const newAction: ResponseAction = {
      id: `action-${Date.now()}`,
      actionName: data.actionName,
      actionType: data.actionType,
      purpose: data.purpose,
      status: data.status,
      parameters: data.parameters,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    actionsStore.push(newAction);
    return newAction;
  },

  // Update response action
  async update(data: UpdateResponseActionRequest): Promise<ResponseAction> {
    await delay(400);
    
    const index = actionsStore.findIndex(action => action.id === data.id);
    if (index === -1) {
      throw new Error('Action not found');
    }

    const updatedAction: ResponseAction = {
      ...actionsStore[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    actionsStore[index] = updatedAction;
    return updatedAction;
  },

  // Delete response action
  async delete(id: string): Promise<void> {
    await delay(300);
    
    const index = actionsStore.findIndex(action => action.id === id);
    if (index === -1) {
      throw new Error('Action not found');
    }

    actionsStore.splice(index, 1);
  },

  // Enable response action
  async enable(id: string): Promise<ResponseAction> {
    return this.update({ id, status: 'ACTIVE' });
  },

  // Disable response action
  async disable(id: string): Promise<ResponseAction> {
    return this.update({ id, status: 'ARCHIVED' });
  },

  // Batch operations
  async bulkDelete(ids: string[]): Promise<void> {
    await delay(500);
    actionsStore = actionsStore.filter(action => !ids.includes(action.id));
  },

  async bulkUpdateStatus(ids: string[], status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED'): Promise<ResponseAction[]> {
    await delay(600);
    
    const updatedActions: ResponseAction[] = [];
    const now = new Date().toISOString();
    
    actionsStore = actionsStore.map(action => {
      if (ids.includes(action.id)) {
        const updated = { ...action, status, updatedAt: now };
        updatedActions.push(updated);
        return updated;
      }
      return action;
    });

    return updatedActions;
  }
};

// Error types for better error handling
export class ResponseActionNotFoundError extends Error {
  constructor(id: string) {
    super(`Response action with ID ${id} not found`);
    this.name = 'ResponseActionNotFoundError';
  }
}

export class ResponseActionValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ResponseActionValidationError';
  }
}

// Validation helpers
export const validateResponseAction = (data: Partial<CreateResponseActionRequest>): string[] => {
  const errors: string[] = [];

  if (!data.actionName?.trim()) {
    errors.push('动作名称不能为空');
  }

  if (!data.actionType) {
    errors.push('请选择动作类型');
  }

  if (!data.purpose) {
    errors.push('请选择用途');
  }

  if (data.actionType === 'POPUP' && data.parameters) {
    const params = data.parameters as any;
    if (!params.title?.trim()) errors.push('弹窗标题不能为空');
    if (!params.content?.trim()) errors.push('弹窗正文不能为空');
    if (!params.buttonText?.trim()) errors.push('按钮文字不能为空');
    if (!params.buttonLink?.trim()) errors.push('按钮链接不能为空');
    
    if (params.buttonLink && !isValidUrl(params.buttonLink)) {
      errors.push('请输入有效的URL地址');
    }
  }

  if (data.actionType === 'EMAIL' && data.parameters) {
    const params = data.parameters as any;
    if (!params.subject?.trim()) errors.push('邮件标题不能为空');
    if (!params.content?.trim()) errors.push('邮件正文不能为空');
    if (!params.senderName?.trim()) errors.push('发件人名称不能为空');
  }

  return errors;
};

// URL validation helper
const isValidUrl = (string: string): boolean => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};
