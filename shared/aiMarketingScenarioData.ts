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
    scenarioName: '加入购物车',
    isAIEnabled: true,
    businessValue: '捕获强购买意向，进行交叉销售或挽留',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z',
    defaultAIConfig: {
      allowedActionTypes: ['POPUP'],
      timingStrategy: 'SMART_DELAY',
      contentStrategy: 'FULLY_GENERATIVE',
      description: 'AI将根据用户画像、购物车商品等信息，自主生成最合适的挽留或激励文案',
      strategySummary: '在此场景下，AI的目标是在用户犹豫或准备离开时进行精准挽留，以提升订单转化率。',
      dimensions: [
        {
          dimension: '营销方式',
          strategy: '优先使用"网页弹窗"',
          reasoning: 'AI会优先选择干预性���强、最能实时触达的网页弹窗，以抓住转瞬即逝的挽留机会。',
          examples: [
            '桌面端: 可能会选择模态框弹窗，信息更完整。',
            '移动端: 可能会选择更轻量的底部横幅或顶部通知，避免影响体验。'
          ]
        },
        {
          dimension: '营销时机',
          strategy: '采用"智能延迟"',
          reasoning: 'AI不会在用户加购的瞬间立即打扰，而是会持续分析后续行为。只有当用户表现出离开意图（如鼠标快速移向关闭按钮）或长时间无操作时，才会触发。',
          examples: [
            '高意图用户: 若用户加购后仍在活跃浏览，AI会保持静默。',
            '犹豫用户: 若用户加购后在页面停留超过90秒且无任何点击，AI会判断其为犹豫，并主动介入。'
          ]
        },
        {
          dimension: '营销内容',
          strategy: '进行"个性化生成"',
          reasoning: 'AI会基于触发用户的画像和购物车内容，动态生成最合适的挽留文案。',
          examples: [
            '针对VIP客户: AI可能会生成稀缺性文案，如："尊敬的VIP，您购物车中的限量商品库存仅剩3件。"',
            '针对新用户: AI可能会���成利益引诱文案，如："新朋友您好！您购物车中的商品可享首单95折优惠。"'
          ]
        }
      ]
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
      description: 'AI会根据用户浏览行为和商品特征，生成个性化的推荐或优惠内容',
      strategySummary: '在此场景下，AI的目标是识别用户的兴趣点，通过提供增值信息或适时激励，推动用户从"考虑"进入"决策"阶段（例如加入购物车）。',
      dimensions: [
        {
          dimension: '营销方式',
          strategy: '优先使用"网页弹窗"',
          reasoning: '与"加入购物车"场景类似，实时性是关键。AI会选择最适合在当前页面进行即时互动的网页弹窗。',
          examples: [
            '信息提供: 可能会使用右下角滑入式通知，提供信息而不打断浏览。',
            '激励动作: 可能会使用更醒目的居中模态框，确保优惠信息被看到。'
          ]
        },
        {
          dimension: '营销时机',
          strategy: '采用"智能延迟"',
          reasoning: 'AI会基于用户的投入度来决策。核心信号是页面停留时长和滚动深度。',
          examples: [
            '深度浏览者: 当用户在商品页停留超过120秒，并滚动到页面底部时，AI判断其兴趣浓厚，可能会触发互动。',
            '准备离开者: 当用户在商品页停留较长时间后，表现出离开意图，AI会尝试进行挽留。'
          ]
        },
        {
          dimension: '营销内容',
          strategy: '进行"价值匹配生成"',
          reasoning: 'AI会根据商品属性和用户画像，生成最能匹配其潜在需求的内容。',
          examples: [
            '针对高价复杂商品: AI可能会提供社会认同信息，如："已有超过5000名用户购买并给出了98%的好评。"',
            '针对有配件的商品: AI可能会进行交叉销售推荐，如："别忘了搭配专用清洁套装，组合购买可享优惠。"'
          ]
        }
      ]
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
        { field: 'total_spend', label: '累计消费', type: 'number' }
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

// 添加自定义��则
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
