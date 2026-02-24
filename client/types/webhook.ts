// Webhook类型定义

export interface WebhookConfig {
  id: string;
  name: string;
  endpointUrl: string;
  description?: string;
  events: string[];
  headers: Record<string, string>;
  secret?: string;
  enabled: boolean;
  retryConfig: {
    maxRetries: number;
    retryDelay: number;
  };
  createdAt: string;
  updatedAt: string;
  lastTriggered?: string;
  triggerCount: number;
  successRate: number;
}

export interface WebhookLog {
  id: string;
  webhookId: string;
  event: string;
  status: 'success' | 'failed' | 'pending';
  request: {
    url: string;
    headers: Record<string, string>;
    body: any;
    timestamp: string;
  };
  response?: {
    status: number;
    headers: Record<string, string>;
    body: any;
    timestamp: string;
  };
  error?: string;
  retryCount: number;
  duration: number;
}

export interface WebhookPayload {
  event: string;
  data: any;
  timestamp: string;
  webhookId?: string;
}

export interface WebhookResponse {
  success: boolean;
  status?: number;
  data?: any;
  error?: string;
  duration: number;
}

export interface WebhookEvent {
  name: string;
  description: string;
  category: string;
  payloadSchema: Record<string, any>;
}

export interface WebhookStats {
  totalWebhooks: number;
  activeWebhooks: number;
  totalTriggers: number;
  successRate: number;
  last24hTriggers: number;
  last7dTriggers: number;
}

export const WEBHOOK_EVENTS = [
  {
    name: 'customer.created',
    description: '客户创建时触发',
    category: '客户',
    payloadSchema: {
      id: 'string',
      name: 'string',
      email: 'string',
      createdAt: 'string'
    }
  },
  {
    name: 'customer.updated',
    description: '客户信息更新时触发',
    category: '客户',
    payloadSchema: {
      id: 'string',
      changes: 'object',
      updatedAt: 'string'
    }
  },
  {
    name: 'customer.deleted',
    description: '客户删除时触发',
    category: '客户',
    payloadSchema: {
      id: 'string',
      deletedAt: 'string'
    }
  },
  {
    name: 'order.created',
    description: '订单创建时触发',
    category: '订单',
    payloadSchema: {
      id: 'string',
      customerId: 'string',
      total: 'number',
      items: 'array',
      createdAt: 'string'
    }
  },
  {
    name: 'order.updated',
    description: '订单更新时触发',
    category: '订单',
    payloadSchema: {
      id: 'string',
      status: 'string',
      changes: 'object',
      updatedAt: 'string'
    }
  },
  {
    name: 'order.completed',
    description: '订单完成时触发',
    category: '订单',
    payloadSchema: {
      id: 'string',
      completedAt: 'string',
      total: 'number'
    }
  },
  {
    name: 'order.cancelled',
    description: '订单取消时触发',
    category: '订单',
    payloadSchema: {
      id: 'string',
      reason: 'string',
      cancelledAt: 'string'
    }
  },
  {
    name: 'payment.succeeded',
    description: '支付成功时触发',
    category: '支付',
    payloadSchema: {
      id: 'string',
      orderId: 'string',
      amount: 'number',
      currency: 'string',
      succeededAt: 'string'
    }
  },
  {
    name: 'payment.failed',
    description: '支付失败时触发',
    category: '支付',
    payloadSchema: {
      id: 'string',
      orderId: 'string',
      amount: 'number',
      reason: 'string',
      failedAt: 'string'
    }
  },
  {
    name: 'subscription.created',
    description: '订阅创建时触发',
    category: '订阅',
    payloadSchema: {
      id: 'string',
      customerId: 'string',
      plan: 'string',
      startDate: 'string'
    }
  },
  {
    name: 'subscription.cancelled',
    description: '订阅取消时触发',
    category: '订阅',
    payloadSchema: {
      id: 'string',
      customerId: 'string',
      cancelledAt: 'string'
    }
  },
  {
    name: 'user.login',
    description: '用户登录时触发',
    category: '用户',
    payloadSchema: {
      userId: 'string',
      loginAt: 'string',
      ip: 'string',
      userAgent: 'string'
    }
  },
  {
    name: 'user.logout',
    description: '用户登出时触发',
    category: '用户',
    payloadSchema: {
      userId: 'string',
      logoutAt: 'string'
    }
  },
  {
    name: 'entity.created',
    description: '实体创建时触发',
    category: '实体',
    payloadSchema: {
      entityType: 'string',
      entityId: 'string',
      data: 'object',
      createdAt: 'string'
    }
  },
  {
    name: 'entity.updated',
    description: '实体更新时触发',
    category: '实体',
    payloadSchema: {
      entityType: 'string',
      entityId: 'string',
      changes: 'object',
      updatedAt: 'string'
    }
  },
  {
    name: 'entity.deleted',
    description: '实体删除时触发',
    category: '实体',
    payloadSchema: {
      entityType: 'string',
      entityId: 'string',
      deletedAt: 'string'
    }
  },
  {
    name: 'capability.executed',
    description: '能力执行时触发',
    category: '能力',
    payloadSchema: {
      capabilityId: 'string',
      input: 'object',
      output: 'object',
      executedAt: 'string'
    }
  },
  {
    name: 'rule.triggered',
    description: '规则触发时触发',
    category: '规则',
    payloadSchema: {
      ruleId: 'string',
      condition: 'object',
      result: 'object',
      triggeredAt: 'string'
    }
  },
  {
    name: 'event.emitted',
    description: '事件发出时触发',
    category: '事件',
    payloadSchema: {
      eventId: 'string',
      eventType: 'string',
      payload: 'object',
      emittedAt: 'string'
    }
  }
] as WebhookEvent[];