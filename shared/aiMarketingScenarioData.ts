// AI营销场景数据模型
// 基于需求文档中的完整数据结构定义

export type ActionType = 'POPUP' | 'EMAIL' | 'SMS';
export type TimingStrategy = 'IMMEDIATE' | 'SMART_DELAY' | 'DELAYED';
export type ContentStrategy = 'FULLY_GENERATIVE' | 'STATIC' | 'AI_ASSISTED';
export type ConditionOperator = '=' | '!=' | '>' | '<' | '>=' | '<=' | 'CONTAINS' | '!CONTAINS' | 'IN' | '!IN';
export type ConditionCategory = 'event' | 'session' | 'user';

// 触发条件单个条件
export interface TriggerCondition {
  id: string;
  category: ConditionCategory;
  field: string;
  operator: ConditionOperator;
  value: string | number | string[];
}

// 触发条件组合
export interface TriggerConditions {
  eventConditions: TriggerCondition[];
  sessionConditions: TriggerCondition[];
  userConditions: TriggerCondition[];
}

// 动作配置
export interface ActionConfig {
  // 弹窗配置
  title?: string;
  body?: string;
  buttonText?: string;
  
  // 邮件配置
  subject?: string;
  emailBody?: string;
  
  // SMS配置
  smsContent?: string;
  
  // AI辅助配置
  aiPrompt?: string;
}

// 响应动作
export interface ResponseAction {
  actionType: ActionType;
  timing: TimingStrategy;
  contentMode: ContentStrategy;
  actionConfig: ActionConfig;
}

// 自定义覆盖规则
export interface OverrideRule {
  ruleId: string;
  ruleName: string;
  priority: number;
  isEnabled: boolean;
  triggerConditions: TriggerConditions;
  responseAction: ResponseAction;
  createdAt: string;
  updatedAt: string;
}

// 策略决策维度
export interface StrategyDimension {
  dimension: string;
  strategy: string;
  reasoning: string;
  examples: string[];
}

// 默认AI策略配置
export interface DefaultAIConfig {
  allowedActionTypes: ActionType[];
  timingStrategy: TimingStrategy;
  contentStrategy: ContentStrategy;
  description: string;
  strategySummary: string;
  dimensions: StrategyDimension[];
}

// 营销场景
export interface MarketingScenario {
  scenarioId: string;
  scenarioName: string;
  isAIEnabled: boolean;
  defaultAIConfig: DefaultAIConfig;
  overrideRules: OverrideRule[];
  businessValue: string;
  createdAt: string;
  updatedAt: string;
  availableFields: {
    event: { field: string; label: string; type: 'string' | 'number' | 'boolean' }[];
    session: { field: string; label: string; type: 'string' | 'number' | 'boolean' }[];
    user: { field: string; label: string; type: 'string' | 'number' | 'boolean' }[];
  };
}

// 预设营销场景数据
export const predefinedScenarios: MarketingScenario[] = [
  {
    scenarioId: 'add_to_cart',
    scenarioName: '加��购物车',
    isAIEnabled: true,
    businessValue: '捕获强购买意向，进行交叉销售或挽留',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z',
    defaultAIConfig: {
      allowedActionTypes: ['POPUP'],
      timingStrategy: 'SMART_DELAY',
      contentStrategy: 'FULLY_GENERATIVE',
      description: 'AI将根据用户画像、购物车商品等信息，自主生成最合适的挽留或激励文案'
    },
    overrideRules: [
      {
        ruleId: 'vip_high_value_cart',
        ruleName: 'VIP客户高价值购物车挽留',
        priority: 1,
        isEnabled: true,
        triggerConditions: {
          eventConditions: [
            {
              id: 'price_condition',
              category: 'event',
              field: 'cart_total_amount',
              operator: '>',
              value: 5000
            }
          ],
          sessionConditions: [],
          userConditions: [
            {
              id: 'vip_condition',
              category: 'user',
              field: 'tag',
              operator: '=',
              value: 'VIP客户'
            }
          ]
        },
        responseAction: {
          actionType: 'POPUP',
          timing: 'IMMEDIATE',
          contentMode: 'STATIC',
          actionConfig: {
            title: '尊敬的VIP客户，请留步',
            body: '您购物车中的商品库存紧张，立即下单享受VIP专属优惠！',
            buttonText: '立即下单'
          }
        },
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      }
    ],
    availableFields: {
      event: [
        { field: 'product_name', label: '商品名称', type: 'string' },
        { field: 'category', label: '商品类别', type: 'string' },
        { field: 'price', label: '商品价格', type: 'number' },
        { field: 'cart_total_amount', label: '购物车总金额', type: 'number' }
      ],
      session: [
        { field: 'source_info', label: '来源信息', type: 'string' },
        { field: 'device_type', label: '设备类型', type: 'string' }
      ],
      user: [
        { field: 'tag', label: '用户标签', type: 'string' },
        { field: 'user_segment', label: '用户分层', type: 'string' },
        { field: 'total_spend', label: '累计消费', type: 'number' }
      ]
    }
  },
  {
    scenarioId: 'view_product',
    scenarioName: '查看商品',
    isAIEnabled: true,
    businessValue: '用户对特定商品产生兴趣，适合提供信息或激励',
    createdAt: '2024-01-08T09:00:00Z',
    updatedAt: '2024-01-12T16:45:00Z',
    defaultAIConfig: {
      allowedActionTypes: ['POPUP'],
      timingStrategy: 'SMART_DELAY',
      contentStrategy: 'FULLY_GENERATIVE',
      description: 'AI会根据用户浏览行为和商品特征，生成个性化的推荐或优惠内容'
    },
    overrideRules: [],
    availableFields: {
      event: [
        { field: 'product_name', label: '商品名称', type: 'string' },
        { field: 'category', label: '商品类别', type: 'string' },
        { field: 'price', label: '商品价格', type: 'number' },
        { field: 'page_dwell_time_seconds', label: '页面停留时间(秒)', type: 'number' }
      ],
      session: [
        { field: 'source_info', label: '来源信息', type: 'string' }
      ],
      user: [
        { field: 'tag', label: '用户标签', type: 'string' },
        { field: 'last_purchase_days', label: '距上次购买天数', type: 'number' }
      ]
    }
  },
  {
    scenarioId: 'user_signup',
    scenarioName: '用户注册',
    isAIEnabled: true,
    businessValue: '捕获新用户加入的关键时刻',
    createdAt: '2024-01-05T11:30:00Z',
    updatedAt: '2024-01-10T13:20:00Z',
    defaultAIConfig: {
      allowedActionTypes: ['POPUP'],
      timingStrategy: 'IMMEDIATE',
      contentStrategy: 'FULLY_GENERATIVE',
      description: 'AI会根据用户注册前的浏览行为和来源渠道，生成个性化的欢迎和引导内容'
    },
    overrideRules: [],
    availableFields: {
      event: [],
      session: [
        { field: 'source_info', label: '来源信息', type: 'string' },
        { field: 'location', label: '地理位置', type: 'string' }
      ],
      user: []
    }
  },
  {
    scenarioId: 'user_login',
    scenarioName: '用户登录',
    isAIEnabled: true,
    businessValue: '识别用户回访，进行个性化互动',
    createdAt: '2024-01-03T08:15:00Z',
    updatedAt: '2024-01-14T10:10:00Z',
    defaultAIConfig: {
      allowedActionTypes: ['POPUP'],
      timingStrategy: 'IMMEDIATE',
      contentStrategy: 'FULLY_GENERATIVE',
      description: 'AI会根据用户的分层、距上次购买时间等，生成不同类型的个性化问候'
    },
    overrideRules: [],
    availableFields: {
      event: [],
      session: [
        { field: 'device_type', label: '设备类型', type: 'string' }
      ],
      user: [
        { field: 'tag', label: '用户标签', type: 'string' },
        { field: 'user_segment', label: '用户分层', type: 'string' },
        { field: 'last_purchase_days', label: '距上次购买天数', type: 'number' },
        { field: 'total_spend', label: '累���消费', type: 'number' }
      ]
    }
  }
];

// 获取所有营销场景
export const getMarketingScenarios = (): Promise<MarketingScenario[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...predefinedScenarios]);
    }, 300);
  });
};

// 获取单个营销场景
export const getMarketingScenario = (scenarioId: string): Promise<MarketingScenario | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const scenario = predefinedScenarios.find(s => s.scenarioId === scenarioId);
      resolve(scenario || null);
    }, 200);
  });
};

// 更新营销场景
export const updateMarketingScenario = (scenarioId: string, updates: Partial<MarketingScenario>): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = predefinedScenarios.findIndex(s => s.scenarioId === scenarioId);
      if (index !== -1) {
        predefinedScenarios[index] = { ...predefinedScenarios[index], ...updates };
        resolve(true);
      } else {
        resolve(false);
      }
    }, 300);
  });
};

// 添加自定义规则
export const addOverrideRule = (scenarioId: string, rule: Omit<OverrideRule, 'ruleId' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const scenario = predefinedScenarios.find(s => s.scenarioId === scenarioId);
      if (scenario) {
        const newRule: OverrideRule = {
          ...rule,
          ruleId: `rule_${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        scenario.overrideRules.push(newRule);
        // 重新排序优先级
        scenario.overrideRules.sort((a, b) => a.priority - b.priority);
        resolve(newRule.ruleId);
      } else {
        throw new Error('Scenario not found');
      }
    }, 300);
  });
};

// 更新自定义规则
export const updateOverrideRule = (scenarioId: string, ruleId: string, updates: Partial<OverrideRule>): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const scenario = predefinedScenarios.find(s => s.scenarioId === scenarioId);
      if (scenario) {
        const ruleIndex = scenario.overrideRules.findIndex(r => r.ruleId === ruleId);
        if (ruleIndex !== -1) {
          scenario.overrideRules[ruleIndex] = {
            ...scenario.overrideRules[ruleIndex],
            ...updates,
            updatedAt: new Date().toISOString()
          };
          resolve(true);
        } else {
          resolve(false);
        }
      } else {
        resolve(false);
      }
    }, 300);
  });
};

// 删除自定义规则
export const deleteOverrideRule = (scenarioId: string, ruleId: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const scenario = predefinedScenarios.find(s => s.scenarioId === scenarioId);
      if (scenario) {
        const initialLength = scenario.overrideRules.length;
        scenario.overrideRules = scenario.overrideRules.filter(r => r.ruleId !== ruleId);
        resolve(scenario.overrideRules.length < initialLength);
      } else {
        resolve(false);
      }
    }, 300);
  });
};

// 更新规则优先级
export const updateRulePriorities = (scenarioId: string, ruleIds: string[]): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const scenario = predefinedScenarios.find(s => s.scenarioId === scenarioId);
      if (scenario) {
        ruleIds.forEach((ruleId, index) => {
          const rule = scenario.overrideRules.find(r => r.ruleId === ruleId);
          if (rule) {
            rule.priority = index + 1;
            rule.updatedAt = new Date().toISOString();
          }
        });
        // 重新排序
        scenario.overrideRules.sort((a, b) => a.priority - b.priority);
        resolve(true);
      } else {
        resolve(false);
      }
    }, 300);
  });
};
