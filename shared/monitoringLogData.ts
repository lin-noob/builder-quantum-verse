// New monitoring log data structure according to requirements

export interface LogEntry {
  // 核心字段
  logId: string;                    // 日志ID
  timestamp: Date;                  // 时间戳
  scenarioId: string;              // 归属场景
  userId: string;                  // 目标用户

  // 决策路径
  decisionSource: 'DEFAULT_AI' | 'CUSTOM_RULE';  // 决策来源
  sourceId: string;                // 来源ID
  sourceName: string;              // 来源名称

  // 执行结果
  actionTaken: string;             // 执行动作摘要
  status: 'EXECUTED' | 'UNDONE';   // 日志状态
  isReversible: boolean;           // 是否可撤销

  // 额外字段用于决策快照
  userSnapshot?: {
    tags: string[];
    tier: string;
    ltv: number;
    segment: string;
  };
  triggerEvent?: {
    eventType: string;
    pageUrl: string;
    eventData: any;
  };
  aiReasoning?: string;            // AI决策理由
}

export interface ScenarioConfig {
  id: string;
  name: string;
  description: string;
}

export interface CustomRule {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
}

// 营销场景枚举
export const MARKETING_SCENARIOS: ScenarioConfig[] = [
  { id: 'add_to_cart', name: '加购挽留', description: '用户加购商品后的营销活动' },
  { id: 'view_product', name: '商品浏览', description: '用户浏览商品时的营销活动' },
  { id: 'abandon_cart', name: '购物车放弃', description: '购物车放弃后的挽留活动' },
  { id: 'first_purchase', name: '首次购买', description: '新用户首次购买引导' },
  { id: 'repeat_purchase', name: '复购促进', description: '老用户复购促进活动' },
  { id: 'birthday_care', name: '生日关怀', description: 'VIP用户生日营销活动' },
  { id: 'inactive_user', name: '用户促活', description: '非活跃用户召回活动' },
  { id: 'cross_sell', name: '交叉销售', description: '相关商品推荐活动' }
];

// Mock数据
export const mockLogEntries: LogEntry[] = [
  {
    logId: 'log_1a2b3c001',
    timestamp: new Date('2025-01-19T14:25:10Z'),
    scenarioId: 'cross_sell',
    userId: 'u_8857',
    decisionSource: 'DEFAULT_AI',
    sourceId: 'ai_cross_sell_system',
    sourceName: '默认AI交叉销售策略',
    actionTaken: '展示了弹窗推荐"Lusso-V2咖啡机配件套装"',
    status: 'EXECUTED',
    isReversible: true,
    userSnapshot: {
      tags: ['高价值用户', '咖啡爱好者'],
      tier: 'VIP',
      ltv: 8500,
      segment: '高活跃用户'
    },
    triggerEvent: {
      eventType: 'add_to_cart',
      pageUrl: '/product/lusso-v2-coffee-machine',
      eventData: { productId: 'prod_12345', price: 2999 }
    },
    aiReasoning: '用户将高价咖啡机加入购物车，AI检测到购物车缺少必要配件，根据历史数据显示85%的用户会接受相关配件推荐。'
  },
  {
    logId: 'log_1a2b3c002',
    timestamp: new Date('2025-01-19T14:18:45Z'),
    scenarioId: 'add_to_cart',
    userId: 'u_3512',
    decisionSource: 'CUSTOM_RULE',
    sourceId: 'rule_vip_cart_abandon',
    sourceName: 'VIP客户高价值购物车挽留',
    actionTaken: '发送了个性化挽留邮件"尊敬的VIP客户，您的心仪商品即将售罄..."',
    status: 'EXECUTED',
    isReversible: false,
    userSnapshot: {
      tags: ['VIP客户', '高频购买'],
      tier: 'VIP',
      ltv: 15200,
      segment: '超级用户'
    },
    triggerEvent: {
      eventType: 'cart_abandon',
      pageUrl: '/cart',
      eventData: { cartValue: 3500, itemCount: 2 }
    }
  },
  {
    logId: 'log_1a2b3c003',
    timestamp: new Date('2025-01-19T14:15:30Z'),
    scenarioId: 'first_purchase',
    userId: 'u_9901',
    decisionSource: 'DEFAULT_AI',
    sourceId: 'ai_new_user_activation',
    sourceName: '默认AI新用户激活策略',
    actionTaken: '发送了"首单9折优惠券"到用户邮箱',
    status: 'EXECUTED',
    isReversible: true,
    userSnapshot: {
      tags: ['新用户', '未购买'],
      tier: '普通用户',
      ltv: 0,
      segment: '新用户'
    },
    triggerEvent: {
      eventType: 'user_inactive',
      pageUrl: '/homepage',
      eventData: { daysSinceRegistration: 3, loginCount: 5 }
    },
    aiReasoning: '新用户注册3天未购买，根据A/B测试数据，发送首单优惠券可提升转化率32%。'
  },
  {
    logId: 'log_1a2b3c004',
    timestamp: new Date('2025-01-19T14:10:15Z'),
    scenarioId: 'birthday_care',
    userId: 'u_7777',
    decisionSource: 'CUSTOM_RULE',
    sourceId: 'rule_vip_birthday',
    sourceName: 'VIP客户生日专属关怀',
    actionTaken: '发送了生日祝福邮件包含专属生日礼品',
    status: 'EXECUTED',
    isReversible: false,
    userSnapshot: {
      tags: ['VIP客户', '生日会员'],
      tier: 'VIP',
      ltv: 22800,
      segment: '忠诚用户'
    },
    triggerEvent: {
      eventType: 'birthday_trigger',
      pageUrl: '/profile',
      eventData: { birthDate: '1990-01-19', membershipLevel: 'VIP' }
    }
  },
  {
    logId: 'log_1a2b3c005',
    timestamp: new Date('2025-01-19T14:05:22Z'),
    scenarioId: 'view_product',
    userId: 'u_1024',
    decisionSource: 'DEFAULT_AI',
    sourceId: 'ai_tag_management',
    sourceName: '默认AI用户标签管理',
    actionTaken: '为用户自动添加了"高潜力客户"标签',
    status: 'UNDONE',
    isReversible: true,
    userSnapshot: {
      tags: ['活跃用户', '浏览高频'],
      tier: '普通用户',
      ltv: 1200,
      segment: '成长用户'
    },
    triggerEvent: {
      eventType: 'product_view',
      pageUrl: '/product/premium-series',
      eventData: { viewDuration: 180, productCategory: 'premium' }
    },
    aiReasoning: '用户近期浏览高端产品时长超过3分钟，结合购买历史和行为模式，AI判断其具有升级为高价值客户的潜力。'
  },
  {
    logId: 'log_1a2b3c006',
    timestamp: new Date('2025-01-19T13:58:10Z'),
    scenarioId: 'repeat_purchase',
    userId: 'u_5566',
    decisionSource: 'CUSTOM_RULE',
    sourceId: 'rule_repeat_customer_discount',
    sourceName: '老客户专享复购优惠',
    actionTaken: '展示了"老客户专享8折优惠"弹窗',
    status: 'EXECUTED',
    isReversible: true,
    userSnapshot: {
      tags: ['老客户', '中等消费'],
      tier: '银牌会员',
      ltv: 4500,
      segment: '稳定用户'
    },
    triggerEvent: {
      eventType: 'product_view',
      pageUrl: '/product/repeat-category',
      eventData: { lastPurchase: 45, sameCategory: true }
    }
  }
];

// 自定义规则Mock数据
export const mockCustomRules: CustomRule[] = [
  { id: 'rule_vip_cart_abandon', name: 'VIP客户高价值购物车挽留', description: '针对VIP客户购物车金额>2000元的挽留策略', isActive: true },
  { id: 'rule_vip_birthday', name: 'VIP客户生日专属关怀', description: 'VIP客户生日当天的专属营销活动', isActive: true },
  { id: 'rule_repeat_customer_discount', name: '老客户专享复购优惠', description: '超过30天未购买的老客户复购优惠', isActive: true },
  { id: 'rule_high_value_cross_sell', name: '高价值商品交叉销售', description: '高价值商品的智能配件推荐', isActive: false },
  { id: 'rule_new_user_guide', name: '新用户引导流程', description: '新注册用户的个性化引导', isActive: true }
];

// 工具函数
export const getScenarioName = (scenarioId: string): string => {
  const scenario = MARKETING_SCENARIOS.find(s => s.id === scenarioId);
  return scenario ? scenario.name : scenarioId;
};

export const getDecisionSourceDisplay = (source: 'DEFAULT_AI' | 'CUSTOM_RULE'): { text: string; color: string; bgColor: string } => {
  switch (source) {
    case 'DEFAULT_AI':
      return { 
        text: '默认AI策略', 
        color: 'text-blue-700', 
        bgColor: 'bg-blue-50 border-blue-200' 
      };
    case 'CUSTOM_RULE':
      return { 
        text: '自定义规则', 
        color: 'text-purple-700', 
        bgColor: 'bg-purple-50 border-purple-200' 
      };
  }
};

export const getStatusDisplay = (status: 'EXECUTED' | 'UNDONE'): { text: string; color: string; icon?: string } => {
  switch (status) {
    case 'EXECUTED':
      return { 
        text: '已执行', 
        color: 'text-green-600',
        icon: 'CheckCircle'
      };
    case 'UNDONE':
      return { 
        text: '已撤销', 
        color: 'text-gray-500',
        icon: 'XCircle'
      };
  }
};

export const formatTimestamp = (timestamp: Date): string => {
  return timestamp.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};
