// Local scenario data for admin interface
export type ActionType = "POPUP" | "EMAIL" | "SMS";
export type TimingStrategy = "IMMEDIATE" | "SMART_DELAY";
export type ContentStrategy = "FULLY_GENERATIVE" | "STATIC" | "AI_ASSISTED";

export interface MarketingScenario {
  scenarioId: string;
  scenarioName: string;
  isAIEnabled: boolean;
  businessValue: string;
  createdAt: string;
  updatedAt: string;
  defaultAIConfig: {
    allowedActionTypes: ActionType[];
    timingStrategy: TimingStrategy;
    contentStrategy: ContentStrategy;
    description: string;
    strategySummary: string;
    dimensions: {
      dimension: string;
      strategy: string;
      reasoning: string;
      examples: string[];
    }[];
    coreStrategies: string[];
  };
  overrideRules: {
    ruleId: string;
    ruleName: string;
    priority: number;
    isEnabled: boolean;
    responseAction: {
      actionType: ActionType;
      timing: TimingStrategy;
      contentMode: ContentStrategy;
    };
    createdAt: string;
    updatedAt: string;
  }[];
  availableFields: {
    event: { field: string; label: string; type: string; }[];
    session: { field: string; label: string; type: string; }[];
    user: { field: string; label: string; type: string; }[];
  };
}

// Mock scenario data
export const mockScenarios: MarketingScenario[] = [
  {
    scenarioId: "add_to_cart",
    scenarioName: "加入购物车",
    isAIEnabled: true,
    businessValue: "捕获强购买意向，进行交叉销售或挽留",
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2024-01-15T14:30:00Z",
    defaultAIConfig: {
      allowedActionTypes: ["POPUP"],
      timingStrategy: "SMART_DELAY",
      contentStrategy: "FULLY_GENERATIVE",
      description: "AI会根据用户画像、购物车商品等信息，自主生成最合适的挽留或激励文案",
      strategySummary: "在用户犹豫或准备离开时进行精准挽留，提升订单转化��。",
      coreStrategies: ["网页弹窗", "智能延迟", "个性化生成"],
      dimensions: [
        {
          dimension: "营销方式",
          strategy: '优先使用"网页弹窗"',
          reasoning: "AI会优先选择干预性最强、最能实时触达的网页弹窗，以抓住稍瞬即逝的挽留机会。",
          examples: [
            "桌面端: 可能会选择模态框弹窗，信息更完整。",
            "移动端: 可能会选择更轻量的底部横幅或顶部通知，避免影响体验。",
          ],
        },
        {
          dimension: "营销时机",
          strategy: '采用"智能延迟"',
          reasoning: "AI不会在用户加购的瞬间立即打扰，而是会持续分析后续行为。",
          examples: [
            "高意向用户: 若用户加购后仍在活跃浏览，AI会保持静默。",
            "犹豫用户: 若用户加购后在页面停留超过90秒且无任何点击，AI会判断其为犹豫，并主动介入。",
          ],
        },
      ],
    },
    overrideRules: [
      {
        ruleId: "vip_high_value_cart",
        ruleName: "VIP客户高价值购物车挽留",
        priority: 1,
        isEnabled: true,
        responseAction: {
          actionType: "POPUP",
          timing: "IMMEDIATE",
          contentMode: "STATIC",
        },
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-15T10:00:00Z",
      },
    ],
    availableFields: {
      event: [
        { field: "product_name", label: "商品名称", type: "string" },
        { field: "category", label: "商品类别", type: "string" },
        { field: "price", label: "商品价格", type: "number" },
        { field: "cart_total_amount", label: "购物车总金额", type: "number" },
      ],
      session: [
        { field: "source_info", label: "来源信息", type: "string" },
        { field: "device_type", label: "设备类型", type: "string" },
      ],
      user: [
        { field: "tag", label: "用户标签", type: "string" },
        { field: "user_segment", label: "用户分层", type: "string" },
        { field: "total_spend", label: "累计消费", type: "number" },
      ],
    },
  },
  {
    scenarioId: "view_product",
    scenarioName: "查看商品",
    isAIEnabled: true,
    businessValue: "用户对特定商品产生兴趣，适合提供信息或激励",
    createdAt: "2024-01-08T09:00:00Z",
    updatedAt: "2024-01-12T16:45:00Z",
    defaultAIConfig: {
      allowedActionTypes: ["POPUP"],
      timingStrategy: "SMART_DELAY",
      contentStrategy: "FULLY_GENERATIVE",
      description: "AI会根据用户浏览行为和商品特征，生成个性化的推荐或优惠内容",
      strategySummary: "识别用户兴趣，通过激励或提供信息，推动用户进入购买决策。",
      coreStrategies: ["网页弹窗", "智能延迟", "价值匹配生成"],
      dimensions: [
        {
          dimension: "营销方式",
          strategy: '优先使用"网页弹窗"',
          reasoning: '与"加入购物车"场景类似，实时性是关键。',
          examples: [
            "信息提供: 可能会使用右下角滑入式通知。",
            "激励动作: 可能会使用更醒目的居中模态框。",
          ],
        },
      ],
    },
    overrideRules: [],
    availableFields: {
      event: [
        { field: "product_name", label: "商品名称", type: "string" },
        { field: "category", label: "商品类别", type: "string" },
        { field: "price", label: "商品价格", type: "number" },
        { field: "page_dwell_time_seconds", label: "页面停留时间(秒)", type: "number" },
      ],
      session: [{ field: "source_info", label: "来源信息", type: "string" }],
      user: [
        { field: "tag", label: "用户标签", type: "string" },
        { field: "last_purchase_days", label: "距上次购买天数", type: "number" },
      ],
    },
  },
  {
    scenarioId: "user_signup",
    scenarioName: "用户注册",
    isAIEnabled: true,
    businessValue: "捕获新用户加入的关键时刻",
    createdAt: "2024-01-05T11:30:00Z",
    updatedAt: "2024-01-10T13:20:00Z",
    defaultAIConfig: {
      allowedActionTypes: ["POPUP", "EMAIL"],
      timingStrategy: "IMMEDIATE",
      contentStrategy: "FULLY_GENERATIVE",
      description: "AI会根据用户注册前的浏览行为和来源渠道，生成个性化的欢迎和引导内容",
      strategySummary: "给予新用户个性化的即时欢迎和引导，提升激活率。",
      coreStrategies: ["多渠道组合策略", "立即触发", "兴趣引导"],
      dimensions: [
        {
          dimension: "营销方式",
          strategy: '采用"组合拳"',
          reasoning: "AI会结合使用多种方式。首先通过网页弹窗给予即时反馈，然后通过邮件提供更详细的引导。",
          examples: [
            "即时反馈: 用户注册成功后，立即在当前页弹出欢迎弹窗。",
            "后续跟进: 5分钟后，��动发送一封欢迎邮件到用户的注册邮箱。",
          ],
        },
      ],
    },
    overrideRules: [],
    availableFields: {
      event: [],
      session: [
        { field: "source_info", label: "来源信息", type: "string" },
        { field: "location", label: "地理位置", type: "string" },
      ],
      user: [],
    },
  },
  {
    scenarioId: "user_login",
    scenarioName: "用户登录",
    isAIEnabled: false,
    businessValue: "识别用户回访，进行个性化互动",
    createdAt: "2024-01-03T08:15:00Z",
    updatedAt: "2024-01-14T10:10:00Z",
    defaultAIConfig: {
      allowedActionTypes: ["POPUP"],
      timingStrategy: "IMMEDIATE",
      contentStrategy: "FULLY_GENERATIVE",
      description: "AI会根据用户的分层、距上次购买时间等，生成不同类型的个性化问候",
      strategySummary: "为回访用户提供个性化体验，提升用户粘性与复购。",
      coreStrategies: ["网页弹窗", "立即触发", "身份感知生成"],
      dimensions: [
        {
          dimension: "营销方式",
          strategy: '优先使用"网页弹窗"',
          reasoning: '登录是一个关键的身份确认节点，AI会优先使用网页弹窗来传递最直接、最个性化的"欢迎回来"信息。',
          examples: [
            "顶部横幅: 可能会在页面顶部显示一个非打扰式的欢迎横幅。",
            '个性化推荐模块: 可能会在页面侧边栏动态生成一个"猜你喜欢"的商品推荐模块。',
          ],
        },
      ],
    },
    overrideRules: [],
    availableFields: {
      event: [],
      session: [{ field: "device_type", label: "设备类型", type: "string" }],
      user: [
        { field: "tag", label: "用户标签", type: "string" },
        { field: "user_segment", label: "用户分层", type: "string" },
        { field: "last_purchase_days", label: "距上次购买天数", type: "number" },
        { field: "total_spend", label: "累计消费", type: "number" },
      ],
    },
  },
  {
    scenarioId: "start_checkout",
    scenarioName: "开始结账",
    isAIEnabled: true,
    businessValue: "用户进入购买漏斗最后阶段，意图极强",
    createdAt: "2024-01-16T10:00:00Z",
    updatedAt: "2024-01-16T10:00:00Z",
    defaultAIConfig: {
      allowedActionTypes: ["POPUP"],
      timingStrategy: "SMART_DELAY",
      contentStrategy: "FULLY_GENERATIVE",
      description: 'AI会分析用户画像，决策是提供"免运费"等小激励，���是用"社会认同"来增强其购买信心。',
      strategySummary: "在用户于结账页停留过久或准备离开时触发，提升最终转化率。",
      coreStrategies: ["网页弹窗", "智能延迟", "购买激励生成"],
      dimensions: [
        {
          dimension: "营销方式",
          strategy: '优先使用"网页弹窗"',
          reasoning: "用户已进入购买流程最后阶段，需要最直接的干预来促成转化。",
          examples: [
            '激励弹窗: 购物车金额较高时，可能展示"免运费"或"限时优惠"。',
            '信任提升: 可能展示"已有XXX人购买"等社会认同信息。',
          ],
        },
      ],
    },
    overrideRules: [],
    availableFields: {
      event: [
        { field: "cart_total_amount", label: "购物车总金额", type: "number" },
      ],
      session: [{ field: "device_type", label: "设备类型", type: "string" }],
      user: [
        { field: "tag", label: "用户标签", type: "string" },
        { field: "total_orders", label: "累计订单数", type: "number" },
      ],
    },
  },
  {
    scenarioId: "purchase",
    scenarioName: "完成购买",
    isAIEnabled: true,
    businessValue: "提升客单价和复购��的最佳时机",
    createdAt: "2024-01-16T10:05:00Z",
    updatedAt: "2024-01-16T10:05:00Z",
    defaultAIConfig: {
      allowedActionTypes: ["EMAIL"],
      timingStrategy: "IMMEDIATE",
      contentStrategy: "FULLY_GENERATIVE",
      description: "AI会根据本次购买的商品，智能推荐关联配件或消耗品，并生成个性化的感谢与交叉销售邮件。",
      strategySummary: "立即感谢并确认订单，通过智能延迟推荐关联商品，提升复购率。",
      coreStrategies: ["发送邮件", "立即触发", "交叉销售生成"],
      dimensions: [
        {
          dimension: "营销方式",
          strategy: '优先使用"发送邮件"',
          reasoning: "购买完成后，邮件是最合适的跟进方式，既能确认订单又能进行后续营销。",
          examples: [
            "订单确认: 立即发送包含订单详情的确认邮件。",
            "关联推荐: 在确认邮件中包含相关商品推荐。",
          ],
        },
      ],
    },
    overrideRules: [],
    availableFields: {
      event: [
        { field: "product_name", label: "商品名称", type: "string" },
        { field: "category", label: "商品类别", type: "string" },
        { field: "total_amount", label: "订单总金额", type: "number" },
      ],
      session: [],
      user: [
        { field: "tag", label: "用户标签", type: "string" },
        { field: "total_orders", label: "累计订单数", type: "number" },
      ],
    },
  },
];

// API functions
export const getMarketingScenarios = (): Promise<MarketingScenario[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockScenarios]);
    }, 300);
  });
};

export const updateMarketingScenario = (
  scenarioId: string,
  updates: Partial<MarketingScenario>,
): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // In a real implementation, this would update the backend
      resolve(true);
    }, 300);
  });
};
