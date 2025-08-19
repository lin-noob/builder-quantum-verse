// AI营销场景数据模型
// 基于需求文档中的完整数据结构定义

export type ActionType = 'POPUP' | 'EMAIL' | 'SMS';
export type TimingStrategy = 'IMMEDIATE' | 'SMART_DELAY';
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
  coreStrategies: string[];
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
      description: 'AI��根据用户画像、购物车商品等信息，自主生成最合适的挽留或激励文案',
      strategySummary: '在用户犹豫或准备离开时进行精准挽留，提升订单转化率。',
      coreStrategies: ['网页弹窗', '智能延迟', '个性化生成'],
      dimensions: [
        {
          dimension: '营销方式',
          strategy: '优先使用"网页弹窗"',
          reasoning: 'AI会优先选择干预性最强、最能实时触达的网页弹窗，以抓住稍瞬即逝的挽留机会。',
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
            '高意���用户: 若用户加购后仍在活跃浏览，AI会保持静默。',
            '犹豫用户: 若用户加购后在页面停留超过90秒且无任何点击，AI会判断其为犹豫，并主动介入。'
          ]
        },
        {
          dimension: '营销内容',
          strategy: '进行"个性化生成"',
          reasoning: 'AI会基于触发用户的画像和购物车内容，动态生成最合适的挽留文案。',
          examples: [
            '针对VIP客户: AI可能会生成稀缺性文案，如："尊敬的VIP，您购物车中的限量商品库存仅剩3件。"',
            '针对新用户: AI可能会生成利益引诱文案，如："新朋友您好！您购物车中的商品可享首单95折优惠。"'
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
      strategySummary: '识别用户兴趣，通过激励或提供信息，推动用户进入购买决策。',
      coreStrategies: ['网页弹窗', '智能延迟', '价值匹配生成'],
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
      description: 'AI会根据用户注册前的浏览行为和来源渠道，生成个性化的欢迎和引导内容',
      strategySummary: '给予新用户个性化的即时欢迎和引导，提升激活率。',
      coreStrategies: ['多渠道组合策略', '立即触发', '兴趣引导'],
      dimensions: [
        {
          dimension: '营销方式',
          strategy: '采用"组合拳"',
          reasoning: 'AI会结合使用多种方式。首先通过网页弹窗给予即时反馈，然后在短时间内通过发送邮件提供更详细的引导，以覆盖不同场景。',
          examples: [
            '即时反馈: 用户注册成功后，立即在当前页弹出欢迎弹窗。',
            '后续跟进: 5分钟后，自动发送一封欢迎邮件到用户的注册邮箱。'
          ]
        },
        {
          dimension: '营销时机',
          strategy: '"立即触发"为主',
          reasoning: '用户的注册行为是一个明确的"里程碑"事件，需要立即给予积极的反馈和引导，以巩固用户关系。',
          examples: [
            '欢迎弹窗: 注册成功后 0-2 秒内立即显示。',
            '欢迎邮件: 注册成功后 1-5 分钟内发送。'
          ]
        },
        {
          dimension: '营销内容',
          strategy: '进行"兴趣引导"',
          reasoning: 'AI会分析该用户在注册前的匿名浏览行为，将这些兴趣点融入到欢迎内容中。',
          examples: [
            '如果用户注册前浏览了户外商品: AI生成的欢迎邮件标题可能是："欢迎加入！开启您的户外探索之旅吧。"',
            '如果用户无明确行为: AI则会生成通用的欢迎内容，并引导用户探索核心产品品类。'
          ]
        }
      ]
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
      description: 'AI会根据用户的分层、距上次购买时间等，生成不同类型的个性化问候',
      strategySummary: '为回访用户提供个性化体验，提升用户粘性与复购。',
      coreStrategies: ['网页弹窗', '立即触发', '身份感知生成'],
      dimensions: [
        {
          dimension: '营销方式',
          strategy: '优先使用"网页弹窗"',
          reasoning: '登录是一个关键的身份确认节点，AI会优先使用网页弹窗来传递最直接、最个性化的"欢迎回来"信息。',
          examples: [
            '顶部横幅: 可能会在页面顶部显示一个非打扰式的欢迎横幅。',
            '个性化推荐模块: 可能会在页面侧边栏动态生成一个"猜你喜欢"的商品推荐模块。'
          ]
        },
        {
          dimension: '营销时机',
          strategy: '"立即触发"',
          reasoning: '与注册类似，登录成功是一个需要即时响应的明确信号。',
          examples: [
            '欢迎信息: 登录成功后的第一个页面加载时立即显示。',
            '购物车提醒: 如果用户购物车有商品，欢迎信息可能会与购物车提醒结合。'
          ]
        },
        {
          dimension: '营销内容',
          strategy: '进行"身份感知生成"',
          reasoning: 'AI会深度分析用户的历史数据，生成最符合其当前状态的沟通内容。',
          examples: [
            '针对"潜在流失"VIP: AI可能会生成唤醒文案，如："欢迎回来，[用户姓名]！我们为您准备了一张专属的VIP回访礼券。"',
            '针对"购物车有商品"的用户: AI可能会生成提醒文案，如："欢迎回来！您上次购物车中的商品还在等您哦。"'
          ]
        }
      ]
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
  },
  {
    scenarioId: 'start_checkout',
    scenarioName: '开始结账',
    isAIEnabled: true,
    businessValue: '用户进入购买漏斗最后阶段，意图极强。',
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z',
    defaultAIConfig: {
      allowedActionTypes: ['POPUP'],
      timingStrategy: 'SMART_DELAY',
      contentStrategy: 'FULLY_GENERATIVE',
      description: 'AI会分析用户画像，决策是提供"免运费"等小激励，还是用"社会认同"（如"已有XXX人购买"）来增强其购买信心。',
      strategySummary: '在用户于结账页停留过久或准备离开时触发，提升最终转化率。',
      coreStrategies: ['网页弹窗', '智能延迟', '购买激励生成'],
      dimensions: [
        {
          dimension: '营销方式',
          strategy: '优先使用"网页弹窗"',
          reasoning: '用户已进入购买流程最后阶段，需要最直接的干预来促成转化。',
          examples: [
            '激励弹窗: 购物车金额较高时，可能展示"免运费"或"限时优惠"。',
            '信任提升: 可能展示"已有XXX人购买"等社会认同信息。'
          ]
        },
        {
          dimension: '营销时机',
          strategy: '采用"智能延迟"',
          reasoning: 'AI不会在用户刚进入结账页时立即打扰，而是持续监测用户行为。',
          examples: [
            '停留过久: 用户在结账页停留超过2分钟且无操作时触发。',
            '离开意图: 检测到用户鼠标移向关闭按钮或返回时触发。'
          ]
        },
        {
          dimension: '营销内容',
          strategy: '进行"购买激励生成"',
          reasoning: 'AI基于购物车内容和用户画像，生成最有效的购买激励。',
          examples: [
            '价格敏感用户: 生成优惠券或免运费等价格激励。',
            '品质导向用户: 生成产品保障或用户评价等信任激励。'
          ]
        }
      ]
    },
    overrideRules: [],
    availableFields: {
      event: [
        { field: 'cart_total_amount', label: '购物车总金额', type: 'number' }
      ],
      session: [
        { field: 'device_type', label: '设备类型', type: 'string' }
      ],
      user: [
        { field: 'tag', label: '用户标签', type: 'string' },
        { field: 'total_orders', label: '累计订单数', type: 'number' }
      ]
    }
  },
  {
    scenarioId: 'purchase',
    scenarioName: '完成购买',
    isAIEnabled: true,
    businessValue: '提升客单价和复购率的最佳时机。',
    createdAt: '2024-01-16T10:05:00Z',
    updatedAt: '2024-01-16T10:05:00Z',
    defaultAIConfig: {
      allowedActionTypes: ['EMAIL'],
      timingStrategy: 'IMMEDIATE',
      contentStrategy: 'FULLY_GENERATIVE',
      description: 'AI会根据本次购买的商品，智能推荐关联配件或消耗品，并生成个性化的感谢与交叉销售邮件。',
      strategySummary: '立即感谢并确认订单，通过智能延迟推荐关联商品，提升复购率。',
      coreStrategies: ['发送邮件', '立即触发', '交叉销售生成'],
      dimensions: [
        {
          dimension: '营销方式',
          strategy: '优先使用"发送邮件"',
          reasoning: '购买完成后，邮件是最合适的跟进方式，既能确认订单又能进行后续营销。',
          examples: [
            '订单确认: 立即发送包含订单详情的确认邮件。',
            '关联推荐: 在确认邮件中包含相关商品推荐。'
          ]
        },
        {
          dimension: '营销时机',
          strategy: '"立即触发"与"智能延迟"结合',
          reasoning: '立即发送订单确认，根据商品特性智能安排后续推荐时机。',
          examples: [
            '立即确认: 购买完成后立即发送订单确认邮件。',
            '7天评价: 收货后7天邀请用户评价商品。',
            '30天复购: 30天后推荐相关或补充商品。'
          ]
        },
        {
          dimension: '营销内容',
          strategy: '进行"交叉销售生成"',
          reasoning: 'AI分析购买商品，推荐最相关的配件、消耗品或升级产品。',
          examples: [
            '配件推荐: 购买相机后推荐镜头、存储卡等配件。',
            '消耗品推荐: 购买打印机后定期推荐墨盒、纸张等。'
          ]
        }
      ]
    },
    overrideRules: [],
    availableFields: {
      event: [
        { field: 'product_name', label: '商品名称', type: 'string' },
        { field: 'category', label: '商品类别', type: 'string' },
        { field: 'total_amount', label: '订单总金额', type: 'number' }
      ],
      session: [],
      user: [
        { field: 'tag', label: '用户标签', type: 'string' },
        { field: 'total_orders', label: '累计订单数', type: 'number' }
      ]
    }
  },
  {
    scenarioId: 'search',
    scenarioName: '执行搜索',
    isAIEnabled: true,
    businessValue: '捕获用户最直接的需求，主动引导。',
    createdAt: '2024-01-16T10:10:00Z',
    updatedAt: '2024-01-16T10:10:00Z',
    defaultAIConfig: {
      allowedActionTypes: ['POPUP'],
      timingStrategy: 'IMMEDIATE',
      contentStrategy: 'FULLY_GENERATIVE',
      description: 'AI会分析搜索关键词。如果匹配到热门商品或活动，会立即生成一个包含相关商品链接的推荐弹窗；如果搜索结果为空，则会生成引导用户联系客服或浏览相关品类的弹窗。',
      strategySummary: '根据搜索内容立即提供精准推荐或引导，提升搜索转化率。',
      coreStrategies: ['网页弹窗', '立即触发', '搜索引导生成'],
      dimensions: [
        {
          dimension: '营销方式',
          strategy: '优先使用"网页弹窗"',
          reasoning: '搜索是用户主动表达需求的行为，需要立即在搜索结果页提供相关引导。',
          examples: [
            '商品推荐: 搜索"笔记本"时弹出热门笔记本推荐。',
            '空结果引导: 搜索无结果时引导用户联系客服或浏览相关分类。'
          ]
        },
        {
          dimension: '营销时机',
          strategy: '"立即触发"',
          reasoning: '搜索行为表明用户有明确需求，应立即响应以提供帮助���',
          examples: [
            '搜索结果页: 在搜索结果加载完成后立即显示推荐。',
            '无结果页面: 在显示"无搜索结果"的同时提供替代方案。'
          ]
        },
        {
          dimension: '营销内容',
          strategy: '进行"搜索引导生成"',
          reasoning: 'AI分析搜索词意图，提供最相关的商品推荐或引导信息。',
          examples: [
            '精确匹配: 搜索"iPhone 15"时推荐相关型号和配件。',
            '意图理解: 搜索"生日礼物"时推荐热门礼品分类。'
          ]
        }
      ]
    },
    overrideRules: [],
    availableFields: {
      event: [
        { field: 'search_term', label: '搜索关键词', type: 'string' }
      ],
      session: [],
      user: [
        { field: 'tag', label: '用户标签', type: 'string' },
        { field: 'user_segment', label: '用户分层', type: 'string' }
      ]
    }
  },
  {
    scenarioId: 'exit_intent',
    scenarioName: '离开意图',
    isAIEnabled: true,
    businessValue: '在用户准备关闭网站的瞬间进行最终挽留。',
    createdAt: '2024-01-16T10:15:00Z',
    updatedAt: '2024-01-16T10:15:00Z',
    defaultAIConfig: {
      allowedActionTypes: ['POPUP'],
      timingStrategy: 'IMMEDIATE',
      contentStrategy: 'FULLY_GENERATIVE',
      description: 'AI会根据用户准备离开的页面和用户身份，进行场景化挽留。例如，在博客页离开时推荐订阅，在定价页离开时提供限时优惠，对新用户则弹出"首次下单立减"的通用挽留。',
      strategySummary: '在最后时刻进行场景化挽留，降低流失率。',
      coreStrategies: ['网页弹窗', '立即触发', '场景化挽留'],
      dimensions: [
        {
          dimension: '营销方式',
          strategy: '使用"网页弹窗"',
          reasoning: '离开意图检测到后，需要立即用最显眼的方式挽留用户。',
          examples: [
            '挽留弹窗: 检测到离开意图时立即弹出挽留信息。',
            '优惠券: 对价格敏感用户展示限时优惠券。'
          ]
        },
        {
          dimension: '营销时机',
          strategy: '"立即触发"',
          reasoning: '离开意图检测是最后的挽留机会，必须立即行动。',
          examples: [
            '鼠标移出: 检测到鼠标移向浏览器关闭按钮时触发。',
            '页面切换: 用户准备切换到其他标签页时触发。'
          ]
        },
        {
          dimension: '营销内容',
          strategy: '进行"场景化挽留"',
          reasoning: 'AI根据用户当前页面和身份生成最相关的挽留内容。',
          examples: [
            '购物车有商品: 提醒"您的购物车中还有商品，确定要离开吗？"',
            '新用户: 提供"首次购买专享优惠"等新用户激励。'
          ]
        }
      ]
    },
    overrideRules: [],
    availableFields: {
      event: [
        { field: 'page_url', label: '页面地址', type: 'string' }
      ],
      session: [
        { field: 'session_duration_seconds', label: '会话时长(秒)', type: 'number' }
      ],
      user: [
        { field: 'tag', label: '用户标签', type: 'string' },
        { field: 'user_segment', label: '用户分层', type: 'string' }
      ]
    }
  },
  {
    scenarioId: 'submit_form',
    scenarioName: '提交表单',
    isAIEnabled: true,
    businessValue: '用户主动提交信息，是建立深度关系的机会。',
    createdAt: '2024-01-16T10:20:00Z',
    updatedAt: '2024-01-16T10:20:00Z',
    defaultAIConfig: {
      allowedActionTypes: ['EMAIL'],
      timingStrategy: 'IMMEDIATE',
      contentStrategy: 'FULLY_GENERATIVE',
      description: 'AI会根据表单名称（如"产品演示申请"），自动生成一封专业的确认邮件，告���用户后续流程，并根据其公司、职位等信息，附上最相关的案例或白皮书。',
      strategySummary: '立即确认表单提交，提供相关资源，建立专业关系。',
      coreStrategies: ['发送邮件', '立即触发', '专业跟进'],
      dimensions: [
        {
          dimension: '营销方式',
          strategy: '优先使用"发送邮件"',
          reasoning: '表单提交是正式的联系方式，邮件是最专业的跟进方式。',
          examples: [
            '确认邮件: 立即发送表单提交确认和后续流程说明。',
            '资源推送: 根据表单内容推送相关白皮书或案例。'
          ]
        },
        {
          dimension: '营销时机',
          strategy: '"立即触发"',
          reasoning: '表单提交需要立即确认，让用户知道信息已收到。',
          examples: [
            '即时确认: 表单提交成功后立即发送确认邮件。',
            '后续跟进: 根据表单类型安排后续跟进时间。'
          ]
        },
        {
          dimension: '营销内容',
          strategy: '进行"专业跟进"',
          reasoning: 'AI根据表单内容和用户信息生成专业的跟进内容。',
          examples: [
            '产品咨询: 提供相关产品资料和演示安排。',
            '商务合作: 发送公司介绍和成功案例。'
          ]
        }
      ]
    },
    overrideRules: [],
    availableFields: {
      event: [
        { field: 'form_name', label: '表单名称', type: 'string' }
      ],
      session: [],
      user: [
        { field: 'company', label: '公司名称', type: 'string' },
        { field: 'title', label: '职位', type: 'string' }
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
