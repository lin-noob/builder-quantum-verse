// AI Marketing Monitoring Data Types and Mock Data

export interface DecisionRecord {
  id: string;
  timestamp: string;
  mode: 'fully-auto' | 'semi-auto';
  content: string;
  status: 'generating' | 'executed' | 'revoked';
  userId?: string;
  scriptName?: string;
  actionType?: string;
  canRevoke: boolean;
  revokeReason?: string;
}

export interface AutoModeConfig {
  targetGroups: {
    newUsers: boolean;
    lowFrequencyUsers: boolean;
    vipUsers: boolean;
  };
  customRules: Array<{
    id: string;
    field: string;
    operator: string;
    value: string;
  }>;
  coreObjective: string;
  boundaries: {
    maxDiscountPercent: number;
    maxWeeklyTouchPoints: number;
  };
  isEnabled: boolean;
}

export interface MarketingScript {
  id: string;
  scriptName: string;
  triggerSummary: string;
  aiAction: string;
  status: 'active' | 'paused' | 'draft';
  triggerType: 'real_time_event' | 'user_segment';
  actionType: 'content_generation' | 'smart_recommendation' | 'smart_discount';
  prompt?: string;
  createdAt: string;
  updatedAt: string;
}

// Mock data for decision records
export const mockDecisionRecords: DecisionRecord[] = [
  {
    id: 'decision-001',
    timestamp: '12:25:10',
    mode: 'semi-auto',
    content: '剧本 [高价商品加购挽留] 已触发 - 针对用户ID: U-3512，AI正在根据指令生成挽留邮件。',
    status: 'generating',
    userId: 'U-3512',
    scriptName: '高价商品加购挽留',
    actionType: 'content_generation',
    canRevoke: false
  },
  {
    id: 'decision-002',
    timestamp: '12:22:45',
    mode: 'fully-auto',
    content: '用户ID: U-8857 - [交叉销售机会] 依据用户将"Lusso-V2咖啡机"加入购物车的行为，AI发现其购物车缺少核心配件，决策执行实时弹窗推荐。',
    status: 'executed',
    userId: 'U-8857',
    actionType: 'smart_recommendation',
    canRevoke: true
  },
  {
    id: 'decision-003',
    timestamp: '12:18:11',
    mode: 'fully-auto',
    content: '用户ID: U-9901 - [新用户促活] 依据用户注册后连续3天未下单的行为，AI决策发送一张新人专享的"首单9折优惠券"。',
    status: 'executed',
    userId: 'U-9901',
    actionType: 'smart_discount',
    canRevoke: true
  },
  {
    id: 'decision-004',
    timestamp: '12:15:30',
    mode: 'semi-auto',
    content: '剧本 [VIP客户生日关怀] 已触发 - 针对用户ID: U-7777，已成功发送生日祝福邮件。',
    status: 'executed',
    userId: 'U-7777',
    scriptName: 'VIP客户生日关怀',
    actionType: 'content_generation',
    canRevoke: false,
    revokeReason: '邮件类操作无法撤销'
  },
  {
    id: 'decision-005',
    timestamp: '12:10:55',
    mode: 'fully-auto',
    content: '用户ID: U-1024 - [用户标签变更] 依据用户近期高频购买行为AI决策为其自动添加"高潜力"标签。',
    status: 'revoked',
    userId: 'U-1024',
    actionType: 'tag_management',
    canRevoke: false
  }
];

// Mock data for auto mode config
export const mockAutoModeConfig: AutoModeConfig = {
  targetGroups: {
    newUsers: true,
    lowFrequencyUsers: true,
    vipUsers: false
  },
  customRules: [],
  coreObjective: '提高用户复购率',
  boundaries: {
    maxDiscountPercent: 15,
    maxWeeklyTouchPoints: 4
  },
  isEnabled: true
};

// Mock data for marketing scripts
export const mockMarketingScripts: MarketingScript[] = [
  {
    id: 'script-001',
    scriptName: '高价商品加购挽留',
    triggerSummary: '实时事件: 当加入购物车且价格>1000',
    aiAction: 'AI内容生成 (邮件)',
    status: 'active',
    triggerType: 'real_time_event',
    actionType: 'content_generation',
    prompt: '根据用户加购的高价商品，生成个性化的挽留邮件，强调商品价值和限时优惠。',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z'
  },
  {
    id: 'script-002',
    scriptName: '新用户首次购买引导',
    triggerSummary: '用户模式: 每日检查总订单数=0的用户',
    aiAction: 'AI智能推荐 (弹窗)',
    status: 'active',
    triggerType: 'user_segment',
    actionType: 'smart_recommendation',
    createdAt: '2024-01-12T09:15:00Z',
    updatedAt: '2024-01-18T16:20:00Z'
  },
  {
    id: 'script-003',
    scriptName: 'VIP客户生日关怀',
    triggerSummary: '用户模式: 每日检查生日为今天的VIP用户',
    aiAction: 'AI内容生成 (邮件)',
    status: 'paused',
    triggerType: 'user_segment',
    actionType: 'content_generation',
    prompt: '为VIP客户生成温馨的生日祝福邮件，包含专属优惠和个性化推荐。',
    createdAt: '2024-01-05T08:30:00Z',
    updatedAt: '2024-01-15T12:00:00Z'
  },
  {
    id: 'script-004',
    scriptName: '填写表单后答谢',
    triggerSummary: '实时事件: 当提交表单且表单名包含"试用申请"',
    aiAction: 'AI内容生成 (邮件)',
    status: 'active',
    triggerType: 'real_time_event',
    actionType: 'content_generation',
    prompt: '为提交试用申请的用户生成感谢邮件，包含后续服务介绍和联系方式。',
    createdAt: '2024-01-10T14:20:00Z',
    updatedAt: '2024-01-22T11:45:00Z'
  },
  {
    id: 'script-005',
    scriptName: '普通用户促活',
    triggerSummary: '用户模式: 每周检查最后访问>30天的普通用户',
    aiAction: 'AI智能优惠 (邮件)',
    status: 'draft',
    triggerType: 'user_segment',
    actionType: 'smart_discount',
    createdAt: '2024-01-08T16:30:00Z',
    updatedAt: '2024-01-08T16:30:00Z'
  }
];

// Helper functions
export const getModeDisplay = (mode: 'fully-auto' | 'semi-auto') => {
  return mode === 'fully-auto' ? '全自动' : '半自动';
};

export const getModeColor = (mode: 'fully-auto' | 'semi-auto') => {
  return mode === 'fully-auto' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
};

export const getStatusDisplay = (status: 'generating' | 'executed' | 'revoked') => {
  switch (status) {
    case 'generating':
      return { text: '内容生成中...', color: 'text-orange-600' };
    case 'executed':
      return { text: '已执行', color: 'text-green-600' };
    case 'revoked':
      return { text: '已撤销', color: 'text-gray-500' };
    default:
      return { text: status, color: 'text-gray-600' };
  }
};

export const getScriptStatusDisplay = (status: 'active' | 'paused' | 'draft') => {
  switch (status) {
    case 'active':
      return { text: '生效中', variant: 'default' as const, color: 'bg-green-100 text-green-800' };
    case 'paused':
      return { text: '已暂停', variant: 'secondary' as const, color: 'bg-orange-100 text-orange-800' };
    case 'draft':
      return { text: '草稿', variant: 'outline' as const, color: 'bg-gray-100 text-gray-600' };
    default:
      return { text: status, variant: 'secondary' as const, color: 'bg-gray-100 text-gray-600' };
  }
};
