// Response Action Library Data Types and Mock Data

export interface ResponseAction {
  id: string;
  actionName: string;
  actionType: 'POPUP' | 'EMAIL';
  purpose: string;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
  parameters: PopupParameters | EmailParameters;
  // Performance metrics
  totalExecutions: number;      // 累计执行次数
  totalInteractions: number;    // 累计互动次数
  totalConversions: number;     // 累计转化数
}

export interface PopupParameters {
  type: 'popup';
  title: string;
  content: string;
  buttonText: string;
  buttonLink: string;
}

export interface EmailParameters {
  type: 'email';
  subject: string;
  content: string;
  senderName: string;
}

// Purpose options for AI-triggered scenarios
export const PURPOSE_OPTIONS = [
  { value: 'NEW_USER_FIRST_VISIT', label: '识别到新用户首次访问时' },
  { value: 'CART_ABANDONMENT', label: '识别到用户即将放弃购物车时' },
  { value: 'LONG_STAY_NO_CONVERSION', label: '用户长时间停留但无转化动作时' },
  { value: 'PRODUCT_COMPARISON', label: '识别到用户正在进行商品对比时' },
  { value: 'HIGH_POTENTIAL_RETURN_USER', label: '识别高潜力回访用户时' }
];

// Mock data for response actions
export const mockResponseActions: ResponseAction[] = [
  {
    id: 'action-001',
    actionName: '新用户欢迎弹窗',
    actionType: 'POPUP',
    purpose: 'NEW_USER_FIRST_VISIT',
    status: 'ACTIVE',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
    totalExecutions: 2845,
    totalInteractions: 1967,
    totalConversions: 524,
    parameters: {
      type: 'popup',
      title: '欢迎来到我们的商店！',
      content: '首次访问用户可享受10%折扣，立即获取您的专属优惠码。',
      buttonText: '获取优惠码',
      buttonLink: 'https://example.com/welcome-offer'
    }
  },
  {
    id: 'action-002',
    actionName: '购物车挽留邮件',
    actionType: 'EMAIL',
    purpose: 'CART_ABANDONMENT',
    status: 'ACTIVE',
    createdAt: '2024-01-10T09:15:00Z',
    updatedAt: '2024-01-18T16:20:00Z',
    totalExecutions: 4320,
    totalInteractions: 2896,
    totalConversions: 1156,
    parameters: {
      type: 'email',
      subject: '您的购物车还有商品等待您',
      content: '<h3>不要错过这些精选商品</h3><p>您的购物车中还有商品正在等待您完成购买。现在完成订单还可享受免费配送！</p>',
      senderName: '商城客服团队'
    }
  },
  {
    id: 'action-003',
    actionName: '长时间浏览推荐弹窗',
    actionType: 'POPUP',
    purpose: 'LONG_STAY_NO_CONVERSION',
    status: 'DRAFT',
    createdAt: '2024-01-22T11:45:00Z',
    updatedAt: '2024-01-22T11:45:00Z',
    totalExecutions: 0,
    totalInteractions: 0,
    totalConversions: 0,
    parameters: {
      type: 'popup',
      title: '发现感兴趣的商品了吗？',
      content: '看起来您对我们的商品很感兴趣！这里有一些为您推荐的热门商品。',
      buttonText: '查看推荐',
      buttonLink: 'https://example.com/recommendations'
    }
  },
  {
    id: 'action-004',
    actionName: '商品对比助手邮件',
    actionType: 'EMAIL',
    purpose: 'PRODUCT_COMPARISON',
    status: 'ARCHIVED',
    createdAt: '2024-01-05T08:30:00Z',
    updatedAt: '2024-01-15T12:00:00Z',
    totalExecutions: 1892,
    totalInteractions: 967,
    totalConversions: 245,
    parameters: {
      type: 'email',
      subject: '商品对比指南已为您准备',
      content: '<h3>专业对比分析</h3><p>我们注意到您正在对比多款商品，为您准备了详细的对比分析报告。</p>',
      senderName: '产品专家'
    }
  },
  {
    id: 'action-005',
    actionName: '回访用户专享优惠',
    actionType: 'POPUP',
    purpose: 'HIGH_POTENTIAL_RETURN_USER',
    status: 'ACTIVE',
    createdAt: '2024-01-12T13:20:00Z',
    updatedAt: '2024-01-19T15:45:00Z',
    totalExecutions: 1567,
    totalInteractions: 1234,
    totalConversions: 398,
    parameters: {
      type: 'popup',
      title: '欢迎回来！专属优惠等您领取',
      content: '感谢您再次访问！作为我们的重要客户，为您准备了专属15%折扣优惠。',
      buttonText: '立即使用',
      buttonLink: 'https://example.com/vip-offer'
    }
  },
  {
    id: 'action-006',
    actionName: '季末清仓邮件通知',
    actionType: 'EMAIL',
    purpose: 'NEW_USER_FIRST_VISIT',
    status: 'DRAFT',
    createdAt: '2024-01-25T17:10:00Z',
    updatedAt: '2024-01-25T17:10:00Z',
    totalExecutions: 0,
    totalInteractions: 0,
    totalConversions: 0,
    parameters: {
      type: 'email',
      subject: '季末清仓大促销开始了！',
      content: '<h2>全场5折起</h2><p>季末清仓活动正式开始，数千款商品5折起，机会难得，快来选购吧！</p>',
      senderName: '促销活动团队'
    }
  }
];

// Helper function to get purpose label by value
export const getPurposeLabel = (value: string): string => {
  const option = PURPOSE_OPTIONS.find(opt => opt.value === value);
  return option ? option.label : value;
};

// Helper function to get action type display text
export const getActionTypeDisplay = (type: 'POPUP' | 'EMAIL'): string => {
  return type === 'POPUP' ? '网页弹窗' : '发送邮件';
};

// Helper function to get status display info
export const getStatusDisplay = (status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED') => {
  switch (status) {
    case 'DRAFT':
      return { text: '草稿', variant: 'secondary' as const };
    case 'ACTIVE':
      return { text: '生效中', variant: 'default' as const };
    case 'ARCHIVED':
      return { text: '已归档', variant: 'outline' as const };
    default:
      return { text: status, variant: 'secondary' as const };
  }
};
