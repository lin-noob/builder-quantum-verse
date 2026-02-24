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
      strategySummary: "在用户犹豫或准备离开时进行精准挽留，提升订单转化率。",
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
            "后续跟进: 5分钟后，自动发送一封欢迎邮件到用户的注册邮箱。",
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
      description: 'AI会分析用户画像，决策是提供"免运费"等小激励，或是用"社会认同"来增强其购买信心。',
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
    businessValue: "提升客单价和复购率的最佳时机",
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
  {
    scenarioId: "first_visit",
    scenarioName: "首次访问",
    isAIEnabled: true,
    businessValue: "建立良好第一印象，引导用户深度探索",
    createdAt: "2024-01-17T10:00:00Z",
    updatedAt: "2024-01-17T10:00:00Z",
    defaultAIConfig: {
      allowedActionTypes: ["POPUP"],
      timingStrategy: "SMART_DELAY",
      contentStrategy: "FULLY_GENERATIVE",
      description: "AI会根据用户来源、设备类型等信息，生成个性化的欢迎内容和引导信息。",
      strategySummary: "智能识别首次访问用户，提供个性化欢迎和网站导览。",
      coreStrategies: ["网页弹窗", "智能延迟", "个性化欢迎"],
      dimensions: [
        {
          dimension: "营销方式",
          strategy: '优先使用"网页弹窗"',
          reasoning: "首次访问需要给用户留下深刻印象，弹窗能够有效传达欢迎信息。",
          examples: [
            "新用户引导: 展示网站主要功能和优势。",
            "优惠券发放: 为首次访问用户提供专属优惠。",
          ],
        },
      ],
    },
    overrideRules: [],
    availableFields: {
      event: [
        { field: "referrer", label: "来源页面", type: "string" },
        { field: "landing_page", label: "着陆页面", type: "string" },
      ],
      session: [
        { field: "device_type", label: "设备类型", type: "string" },
        { field: "browser", label: "浏览器", type: "string" },
      ],
      user: [
        { field: "is_new_user", label: "是否新用户", type: "boolean" },
      ],
    },
  },
  {
    scenarioId: "long_browsing",
    scenarioName: "长时间浏览",
    isAIEnabled: true,
    businessValue: "捕获高意向用户，提供个性化推荐",
    createdAt: "2024-01-17T10:05:00Z",
    updatedAt: "2024-01-17T10:05:00Z",
    defaultAIConfig: {
      allowedActionTypes: ["POPUP", "EMAIL"],
      timingStrategy: "SMART_DELAY",
      contentStrategy: "FULLY_GENERATIVE",
      description: "AI会分析用户浏览行为和偏好，生成个性化的产品推荐和优惠信息。",
      strategySummary: "识别深度浏览用户，提供精准推荐和购买激励。",
      coreStrategies: ["行为分析", "个性化推荐", "购买激励"],
      dimensions: [
        {
          dimension: "营销时机",
          strategy: '采用"智能延迟"',
          reasoning: "需要在用户浏览足够长时间后，在合适的时机进行干预。",
          examples: [
            "浏览时长超过5分钟: 提供相关产品推荐。",
            "查看多个商品: 发送个性化优惠券。",
          ],
        },
      ],
    },
    overrideRules: [],
    availableFields: {
      event: [
        { field: "browse_duration", label: "浏览时长", type: "number" },
        { field: "pages_viewed", label: "浏览页面数", type: "number" },
      ],
      session: [
        { field: "session_duration", label: "会话时长", type: "number" },
      ],
      user: [
        { field: "interest_tags", label: "兴趣标签", type: "string" },
      ],
    },
  },
  {
    scenarioId: "repeat_visit",
    scenarioName: "重复访问",
    isAIEnabled: true,
    businessValue: "维护用户粘性，促进转化",
    createdAt: "2024-01-17T10:10:00Z",
    updatedAt: "2024-01-17T10:10:00Z",
    defaultAIConfig: {
      allowedActionTypes: ["POPUP", "EMAIL"],
      timingStrategy: "IMMEDIATE",
      contentStrategy: "AI_ASSISTED",
      description: "AI会根据用户历史行为和偏好，生成个性化的回访欢迎和推荐内容。",
      strategySummary: "识别回访用户，提供个性化体验和专属优惠。",
      coreStrategies: ["用户识别", "个性化体验", "忠诚度奖励"],
      dimensions: [
        {
          dimension: "营销方式",
          strategy: '灵活使用"网页弹窗"和"发送邮件"',
          reasoning: "根据用户访问频率和价值，选择合适的触达方式。",
          examples: [
            "高价值用户: 立即弹窗欢迎并提供VIP服务。",
            "普通用户: 发送邮件推荐新品或优惠。",
          ],
        },
      ],
    },
    overrideRules: [],
    availableFields: {
      event: [
        { field: "visit_count", label: "访问次数", type: "number" },
        { field: "last_visit", label: "上次访问时间", type: "datetime" },
      ],
      session: [],
      user: [
        { field: "user_level", label: "用户等级", type: "string" },
        { field: "purchase_history", label: "购买历史", type: "string" },
      ],
    },
  },
  {
    scenarioId: "mobile_visit",
    scenarioName: "移动端访问",
    isAIEnabled: true,
    businessValue: "优化移动端体验，提升转化率",
    createdAt: "2024-01-17T10:15:00Z",
    updatedAt: "2024-01-17T10:15:00Z",
    defaultAIConfig: {
      allowedActionTypes: ["POPUP", "SMS"],
      timingStrategy: "SMART_DELAY",
      contentStrategy: "FULLY_GENERATIVE",
      description: "AI会针对移动端用户特点，生成适合小屏幕的营销内容和交互方式。",
      strategySummary: "针对移动端用户优化营销策略，提供便捷的购买体验。",
      coreStrategies: ["移动优化", "便捷交互", "快速转化"],
      dimensions: [
        {
          dimension: "营销方式",
          strategy: '优先使用"网页弹窗"，辅助"短信通知"',
          reasoning: "移动端用户更适合轻量级的弹窗和及时的短信提醒。",
          examples: [
            "底部横幅: 不遮挡主要内容的轻量提示。",
            "短信提醒: 重要优惠或限时活动通知。",
          ],
        },
      ],
    },
    overrideRules: [],
    availableFields: {
      event: [
        { field: "screen_size", label: "屏幕尺寸", type: "string" },
        { field: "touch_events", label: "触摸事件", type: "number" },
      ],
      session: [
        { field: "device_type", label: "设备类型", type: "string" },
        { field: "os_version", label: "操作系统版本", type: "string" },
      ],
      user: [
        { field: "mobile_preference", label: "移动端偏好", type: "string" },
      ],
    },
  },
  {
    scenarioId: "holiday_visit",
    scenarioName: "节假日访问",
    isAIEnabled: true,
    businessValue: "抓住节假日购物高峰，提升销售额",
    createdAt: "2024-01-17T10:20:00Z",
    updatedAt: "2024-01-17T10:20:00Z",
    defaultAIConfig: {
      allowedActionTypes: ["POPUP", "EMAIL"],
      timingStrategy: "IMMEDIATE",
      contentStrategy: "FULLY_GENERATIVE",
      description: "AI会根据节假日特点和用户偏好，生成应景的营销内容和限时优惠。",
      strategySummary: "结合节假日氛围，提供应景的产品推荐和优惠活动。",
      coreStrategies: ["节日营销", "限时优惠", "氛围营造"],
      dimensions: [
        {
          dimension: "营销时机",
          strategy: '采用"立即触发"',
          reasoning: "节假日期间用户购买意愿强烈，需要立即抓住机会。",
          examples: [
            "节日问候: 立即展示节日祝福和专属优惠。",
            "限时活动: 突出节日限时优惠的紧迫性。",
          ],
        },
      ],
    },
    overrideRules: [],
    availableFields: {
      event: [
        { field: "holiday_type", label: "节假日类型", type: "string" },
        { field: "promotion_code", label: "促销代码", type: "string" },
      ],
      session: [
        { field: "visit_time", label: "访问时间", type: "datetime" },
      ],
      user: [
        { field: "holiday_preference", label: "节日偏好", type: "string" },
      ],
    },
  },
  {
    scenarioId: "price_sensitive",
    scenarioName: "价格敏感行为",
    isAIEnabled: true,
    businessValue: "针对价格敏感用户提供精准优惠",
    createdAt: "2024-01-17T10:25:00Z",
    updatedAt: "2024-01-17T10:25:00Z",
    defaultAIConfig: {
      allowedActionTypes: ["POPUP", "EMAIL"],
      timingStrategy: "SMART_DELAY",
      contentStrategy: "FULLY_GENERATIVE",
      description: "AI会识别价格敏感行为，生成个性化的优惠券和促销信息。",
      strategySummary: "识别价格敏感用户，提供精准的价格优惠和促销活动。",
      coreStrategies: ["行为识别", "精准优惠", "价格策略"],
      dimensions: [
        {
          dimension: "营销内容",
          strategy: '重点突出"价格优势"和"优惠信息"',
          reasoning: "价格敏感用户最关注成本效益，需要突出价格优势。",
          examples: [
            "比价提醒: 展示与竞品的价格对比优势。",
            "优惠券发放: 提供满足用户心理价位的优惠。",
          ],
        },
      ],
    },
    overrideRules: [],
    availableFields: {
      event: [
        { field: "price_comparison", label: "价格比较次数", type: "number" },
        { field: "discount_interest", label: "优惠关注度", type: "number" },
      ],
      session: [
        { field: "price_range_viewed", label: "查看价格区间", type: "string" },
      ],
      user: [
        { field: "price_sensitivity", label: "价格敏感度", type: "number" },
        { field: "coupon_usage", label: "优惠券使用频率", type: "number" },
      ],
    },
  },
  {
    scenarioId: "search",
    scenarioName: "执行搜索",
    isAIEnabled: true,
    businessValue: "捕获用户最直接的需求，主动引导。",
    createdAt: "2024-01-16T10:10:00Z",
    updatedAt: "2024-01-16T10:10:00Z",
    defaultAIConfig: {
      allowedActionTypes: ["POPUP"],
      timingStrategy: "IMMEDIATE",
      contentStrategy: "FULLY_GENERATIVE",
      description: "AI会分析搜索关键词。如果匹配到热门商品或活动，会立即生成一个包含相关商品链接的推荐弹窗；如果搜索结果为空，则会生成引导用户联系客服或浏览相关品类的弹窗。",
      strategySummary: "根据搜索内容立即提供精准推荐或引导，提升搜索转化率。",
      coreStrategies: ["网页弹窗", "立即触发", "搜索引导生成"],
      dimensions: [
        {
          dimension: "营销方式",
          strategy: '优先使用"网页弹窗"',
          reasoning: "搜索是用户主动表达需求的行为，需要立即在搜索结果页提供相关引导。",
          examples: [
            '商品推荐: 搜索"笔记本"时弹出热门笔记本推荐。',
            "空结果引导: 搜索无结果时引导用户联系客服或浏览相关分类。",
          ],
        },
        {
          dimension: "营销时机",
          strategy: '"立即触发"',
          reasoning: "搜索行为表明用户有明确需求，应立即响应以提供帮助。",
          examples: [
            "搜索结果页: 在搜索结果加载完成后立即显示推荐。",
            '无结果页面: 在显示"无搜索结果"的同时提供替代方案。',
          ],
        },
        {
          dimension: "营销内容",
          strategy: '进行"搜索引导生成"',
          reasoning: "AI分析搜索词意图，提供最相关的商品推荐或引导信息。",
          examples: [
            '精确匹配: 搜索"iPhone 15"时推荐相关型号和配件。',
            '意图理解: 搜索"生日礼物"时推荐热门礼品分类。',
          ],
        },
      ],
    },
    overrideRules: [],
    availableFields: {
      event: [{ field: "search_term", label: "搜索关键词", type: "string" }],
      session: [],
      user: [
        { field: "tag", label: "用户标签", type: "string" },
        { field: "user_segment", label: "用户分层", type: "string" },
      ],
    },
  },
  {
    scenarioId: "exit_intent",
    scenarioName: "离开意图",
    isAIEnabled: true,
    businessValue: "在用户准备关闭网站的瞬间进行最终挽留。",
    createdAt: "2024-01-16T10:15:00Z",
    updatedAt: "2024-01-16T10:15:00Z",
    defaultAIConfig: {
      allowedActionTypes: ["POPUP"],
      timingStrategy: "IMMEDIATE",
      contentStrategy: "FULLY_GENERATIVE",
      description: 'AI会根据用户准备离开的页面和用户身份，进行场景化挽留。例如，在博客页离开时推荐订阅，在定价页离开时提供限时优惠，对新用户则弹出"首次下单立减"的通用挽留。',
      strategySummary: "在最后时刻进行场景化挽留，降低流失率。",
      coreStrategies: ["网页弹窗", "立即触发", "场景化挽留"],
      dimensions: [
        {
          dimension: "营销方式",
          strategy: '使用"网页弹窗"',
          reasoning: "离开意图检测到后，需要立即用最显眼的方式挽留用户。",
          examples: [
            "挽留弹窗: 检测到离开意图时立即弹出挽留信息。",
            "优惠券: 对价格敏感用户展示限时优惠券。",
          ],
        },
        {
          dimension: "营销时机",
          strategy: '"立即触发"',
          reasoning: "离开意图检测是最后的挽留机会，必须立即行动。",
          examples: [
            "鼠标移出: 检测到鼠标移向浏览器关闭按钮时触发。",
            "页面切换: 用户准备切换到其他标签页时触发。",
          ],
        },
        {
          dimension: "营销内容",
          strategy: '进行"场景化挽留"',
          reasoning: "AI根据用户当前页面和身份生成最相关的挽留内容。",
          examples: [
            '购物车有商品: 提醒"您的购物车中还有商品，确定要离开吗？"',
            '新用户: 提供"首次购买专享优惠"等新用户激励。',
          ],
        },
      ],
    },
    overrideRules: [],
    availableFields: {
      event: [{ field: "page_url", label: "页面地址", type: "string" }],
      session: [
        {
          field: "session_duration_seconds",
          label: "会话时长(秒)",
          type: "number",
        },
      ],
      user: [
        { field: "tag", label: "用户标签", type: "string" },
        { field: "user_segment", label: "用户分层", type: "string" },
      ],
    },
  },
  {
    scenarioId: "submit_form",
    scenarioName: "提交表单",
    isAIEnabled: true,
    businessValue: "用户主动提交信息，是建立深度关系的机会。",
    createdAt: "2024-01-16T10:20:00Z",
    updatedAt: "2024-01-16T10:20:00Z",
    defaultAIConfig: {
      allowedActionTypes: ["EMAIL"],
      timingStrategy: "IMMEDIATE",
      contentStrategy: "FULLY_GENERATIVE",
      description: 'AI会根据表单名称（如"产品演示申请"），自动生成一封专业的确认邮件，告知用户后续流程，并根据其公司、职位等信息，附上最相关的案例或白皮书。',
      strategySummary: "立即确认表单提交，提供相关资源，建立专业关系。",
      coreStrategies: ["发送邮件", "立即触发", "专业跟进"],
      dimensions: [
        {
          dimension: "营销方式",
          strategy: '优先使用"发送邮件"',
          reasoning: "表单提交是正式的联系方式，邮件是最专业的跟进方式。",
          examples: [
            "确认邮件: 立即发送表单提交确认和后续流程说明。",
            "资源推送: 根据表单内容推送相关白皮书或案例。",
          ],
        },
        {
          dimension: "营销时机",
          strategy: '"立即触发"',
          reasoning: "表单提交需要立即确认，让用户知道信息已收到。",
          examples: [
            "即时确认: 表单提交成功后立即发送确认邮件。",
            "后续跟进: 根据表单类型安排后续跟进时间。",
          ],
        },
        {
          dimension: "营销内容",
          strategy: '进行"专业跟进"',
          reasoning: "AI根据表单内容和用户信息生成专业的跟进内容。",
          examples: [
            "产品咨询: 提供相关产品资料和演示安排。",
            "商务合作: 发送公司介绍和成功案例。",
          ],
        },
      ],
    },
    overrideRules: [],
    availableFields: {
      event: [{ field: "form_name", label: "表单名称", type: "string" }],
      session: [],
      user: [
        { field: "company", label: "公司名称", type: "string" },
        { field: "title", label: "职位", type: "string" },
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
