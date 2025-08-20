// Effect tracking data structure according to new requirements

export interface TouchPoint {
  // 触点基本信息
  logId: string;                    // 日志ID (与监控中心关联)
  timestamp: Date;                  // 触点时间
  scenarioId: string;              // 归属场景
  decisionSource: 'DEFAULT_AI' | 'CUSTOM_RULE';  // 决策来源
  sourceName: string;              // 来源名称
  actionTaken: string;             // 执行动作摘要
  attributionWeight: number;       // 归因权重 (0-100%)
}

export interface ConversionEvent {
  // 核心字段
  conversionId: string;            // 转化ID
  userId: string;                  // 归属用户
  conversionTime: Date;            // 转化时间
  conversionValue: number;         // 转化价值
  conversionType: 'purchase' | 'subscription' | 'signup' | 'form_submit' | 'download';  // 转化类型

  // 归因路径
  touchpoints: TouchPoint[];       // 转化触点数组

  // 归因摘要
  primaryAttribution: string;      // 主要归因来源
}

// 营销场景配置 (与监控中心保持一致)
export const MARKETING_SCENARIOS = [
  { id: 'add_to_cart', name: '加购挽留' },
  { id: 'view_product', name: '商品浏览' },
  { id: 'abandon_cart', name: '购物车放弃' },
  { id: 'first_purchase', name: '首次购买' },
  { id: 'repeat_purchase', name: '复购促进' },
  { id: 'birthday_care', name: '生日关怀' },
  { id: 'inactive_user', name: '用户促活' },
  { id: 'cross_sell', name: '交叉销售' }
];

// 转化类型配置
export const CONVERSION_TYPES = [
  { id: 'purchase', name: '商品购买', icon: '🛒' },
  { id: 'subscription', name: '会员订阅', icon: '💎' },
  { id: 'signup', name: '用户注册', icon: '👤' },
  { id: 'form_submit', name: '表单提交', icon: '📝' },
  { id: 'download', name: '资源下载', icon: '📥' }
];

// Mock数据
export const mockConversionEvents: ConversionEvent[] = [
  {
    conversionId: 'conv_1a2b3c001',
    userId: 'u_8857',
    conversionTime: new Date('2025-01-19T15:30:45Z'),
    conversionValue: 2999,
    conversionType: 'purchase',
    primaryAttribution: '自定义规则: VIP客户高价值购物车挽留',
    touchpoints: [
      {
        logId: 'log_1a2b3c002',
        timestamp: new Date('2025-01-19T14:18:45Z'),
        scenarioId: 'add_to_cart',
        decisionSource: 'CUSTOM_RULE',
        sourceName: 'VIP客户高价值购物车挽留',
        actionTaken: '发送了个性化挽留邮件"尊敬的VIP客户，您的心仪商品即将售罄..."',
        attributionWeight: 60
      },
      {
        logId: 'log_1a2b3c001',
        timestamp: new Date('2025-01-19T14:25:10Z'),
        scenarioId: 'cross_sell',
        decisionSource: 'DEFAULT_AI',
        sourceName: '默认AI交叉销售策略',
        actionTaken: '展示了弹窗推荐"Lusso-V2咖啡机配件套装"',
        attributionWeight: 40
      }
    ]
  },
  {
    conversionId: 'conv_1a2b3c002',
    userId: 'u_9901',
    conversionTime: new Date('2025-01-19T16:15:20Z'),
    conversionValue: 899,
    conversionType: 'purchase',
    primaryAttribution: '默认AI策略: 新用户激活策略',
    touchpoints: [
      {
        logId: 'log_1a2b3c003',
        timestamp: new Date('2025-01-19T14:15:30Z'),
        scenarioId: 'first_purchase',
        decisionSource: 'DEFAULT_AI',
        sourceName: '默认AI新用户激活策略',
        actionTaken: '发送了"首单9折优惠券"到用户邮箱',
        attributionWeight: 80
      },
      {
        logId: 'log_1a2b3c007',
        timestamp: new Date('2025-01-19T15:45:00Z'),
        scenarioId: 'view_product',
        decisionSource: 'DEFAULT_AI',
        sourceName: '默认AI智能推荐系统',
        actionTaken: '展示了个性化商品推荐',
        attributionWeight: 20
      }
    ]
  },
  {
    conversionId: 'conv_1a2b3c003',
    userId: 'u_7777',
    conversionTime: new Date('2025-01-19T17:22:10Z'),
    conversionValue: 1580,
    conversionType: 'subscription',
    primaryAttribution: '自定义规则: VIP客户生日专属关怀',
    touchpoints: [
      {
        logId: 'log_1a2b3c004',
        timestamp: new Date('2025-01-19T14:10:15Z'),
        scenarioId: 'birthday_care',
        decisionSource: 'CUSTOM_RULE',
        sourceName: 'VIP客户生日专属关怀',
        actionTaken: '发送了生日祝福邮件包含专属生日礼品',
        attributionWeight: 70
      },
      {
        logId: 'log_1a2b3c008',
        timestamp: new Date('2025-01-19T16:30:00Z'),
        scenarioId: 'repeat_purchase',
        decisionSource: 'DEFAULT_AI',
        sourceName: '默认AI会员升级推荐',
        actionTaken: '推送了会员升级优惠信息',
        attributionWeight: 30
      }
    ]
  },
  {
    conversionId: 'conv_1a2b3c004',
    userId: 'u_5566',
    conversionTime: new Date('2025-01-19T18:05:35Z'),
    conversionValue: 450,
    conversionType: 'purchase',
    primaryAttribution: '自定义规则: 老客户专享复购优惠',
    touchpoints: [
      {
        logId: 'log_1a2b3c006',
        timestamp: new Date('2025-01-19T13:58:10Z'),
        scenarioId: 'repeat_purchase',
        decisionSource: 'CUSTOM_RULE',
        sourceName: '老客户专享复购优惠',
        actionTaken: '展示了"老客户专享8折优惠"弹窗',
        attributionWeight: 90
      },
      {
        logId: 'log_1a2b3c009',
        timestamp: new Date('2025-01-19T17:20:00Z'),
        scenarioId: 'view_product',
        decisionSource: 'DEFAULT_AI',
        sourceName: '默认AI浏览行为分析',
        actionTaken: '发送了相关商品推荐',
        attributionWeight: 10
      }
    ]
  },
  {
    conversionId: 'conv_1a2b3c005',
    userId: 'u_1024',
    conversionTime: new Date('2025-01-19T19:12:18Z'),
    conversionValue: 199,
    conversionType: 'signup',
    primaryAttribution: '默认AI策略: 用户注册引导',
    touchpoints: [
      {
        logId: 'log_1a2b3c010',
        timestamp: new Date('2025-01-19T18:30:00Z'),
        scenarioId: 'inactive_user',
        decisionSource: 'DEFAULT_AI',
        sourceName: '默认AI用户注册引导',
        actionTaken: '展示了注册优惠提示',
        attributionWeight: 100
      }
    ]
  },
  {
    conversionId: 'conv_1a2b3c006',
    userId: 'u_3344',
    conversionTime: new Date('2025-01-19T20:40:25Z'),
    conversionValue: 3200,
    conversionType: 'purchase',
    primaryAttribution: '自定义规则: 高价值商品智能推荐',
    touchpoints: [
      {
        logId: 'log_1a2b3c011',
        timestamp: new Date('2025-01-19T19:15:00Z'),
        scenarioId: 'view_product',
        decisionSource: 'CUSTOM_RULE',
        sourceName: '高价值商品智能推荐',
        actionTaken: '推荐了高端产品组合套装',
        attributionWeight: 75
      },
      {
        logId: 'log_1a2b3c012',
        timestamp: new Date('2025-01-19T20:00:00Z'),
        scenarioId: 'add_to_cart',
        decisionSource: 'DEFAULT_AI',
        sourceName: '默认AI购买意向分析',
        actionTaken: '展示了限时购买倒计时',
        attributionWeight: 25
      }
    ]
  }
];

// 工具函数
export const getScenarioName = (scenarioId: string): string => {
  const scenario = MARKETING_SCENARIOS.find(s => s.id === scenarioId);
  return scenario ? scenario.name : scenarioId;
};

export const getConversionTypeName = (type: string): string => {
  const conversionType = CONVERSION_TYPES.find(t => t.id === type);
  return conversionType ? conversionType.name : type;
};

export const getConversionTypeIcon = (type: string): string => {
  const conversionType = CONVERSION_TYPES.find(t => t.id === type);
  return conversionType ? conversionType.icon : '📊';
};

export const getDecisionSourceDisplay = (source: 'DEFAULT_AI' | 'CUSTOM_RULE'): { 
  text: string; 
  color: string; 
  bgColor: string;
  icon: string;
} => {
  switch (source) {
    case 'DEFAULT_AI':
      return { 
        text: '默认AI策略', 
        color: 'text-blue-700', 
        bgColor: 'bg-blue-50 border-blue-200',
        icon: '🤖'
      };
    case 'CUSTOM_RULE':
      return { 
        text: '自定义规则', 
        color: 'text-purple-700', 
        bgColor: 'bg-purple-50 border-purple-200',
        icon: '⚙️'
      };
  }
};

export const formatTimestamp = (timestamp: Date): string => {
  return timestamp.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatCurrency = (value: number): string => {
  return `¥${value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// 统计计算函数
export const calculateStats = (conversions: ConversionEvent[]) => {
  const totalValue = conversions.reduce((sum, conv) => sum + conv.conversionValue, 0);
  
  // 按决策来源分组计算
  const aiContribution = conversions.reduce((sum, conv) => {
    const aiWeight = conv.touchpoints
      .filter(tp => tp.decisionSource === 'DEFAULT_AI')
      .reduce((weightSum, tp) => weightSum + tp.attributionWeight, 0);
    return sum + (conv.conversionValue * aiWeight / 100);
  }, 0);

  const customRuleContribution = conversions.reduce((sum, conv) => {
    const ruleWeight = conv.touchpoints
      .filter(tp => tp.decisionSource === 'CUSTOM_RULE')
      .reduce((weightSum, tp) => weightSum + tp.attributionWeight, 0);
    return sum + (conv.conversionValue * ruleWeight / 100);
  }, 0);

  const avgValue = conversions.length > 0 ? totalValue / conversions.length : 0;

  return {
    totalValue,
    aiContribution,
    customRuleContribution,
    avgValue,
    totalConversions: conversions.length
  };
};
