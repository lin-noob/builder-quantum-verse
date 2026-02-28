import { DecisionTraceState } from "./types";

// Default / Template State (evt_001)
const DEFAULT_STATE: DecisionTraceState = {
  currentStep: "intent",
  overallStatus: "IN_PROGRESS",
  triggerEvent: {
    id: "evt_001",
    type: "CUSTOMER_EMAIL_RECEIVED",
    content:
      "团队好，\n\n我们需要为即将到来的项目采购 50 台 Quantum X1 处理器。我们需要在下周五（2月14日）前送达。另外，请确认是否包含延长保修？\n\n祝好，\nJohn Doe, Acme Corp",
    timestamp: "2026-02-06 10:30:00",
  },
  intentAnalysis: {
    coreIntent: "紧急采购询价 (高优先级)",
    urgency: "High",
    confidence: 0.9,
    stepStatus: "AI_ANALYZED",
    isModified: false,
    goals: [
      {
        id: "g1",
        description: "确认库存可用性",
        initialSuggestion: "查询 Quantum X1 库存情况",
        suggestedNextStep: "先校验当前库存与锁定数量",
        isConfirmed: true,
        isEnabled: true,
        source: "ai",
        isSuggestionStale: false,
      },
      {
        id: "g2",
        description: "评估交期可行性",
        initialSuggestion: "计算物流时效是否满足 Feb 14",
        suggestedNextStep: "根据收货地预估最晚发货时间",
        isConfirmed: true,
        isEnabled: true,
        source: "ai",
        isSuggestionStale: false,
      },
      {
        id: "g3",
        description: "确认保修条款",
        initialSuggestion: "检索销售合同模板中的保修条款",
        suggestedNextStep: "比对客户诉求与合同标准条款",
        isConfirmed: true,
        isEnabled: true,
        source: "ai",
        isSuggestionStale: false,
      },
    ],
    status: "pending",
  },
  dataPreparation: {
    requirements: [
      { id: "r1", goalId: "g1", objectType: "Product", fields: ["inventory_level", "location"], relations: [] },
      {
        id: "r2",
        goalId: "g2",
        objectType: "LogisticsProvider",
        fields: ["delivery_sla"],
        relations: ["shipping_routes"],
      },
      { id: "r3", goalId: "g3", objectType: "ContractTemplate", fields: ["warranty_clause"], relations: [] },
    ],
    candidates: [
      {
        id: "prod_001",
        goalId: "g1",
        name: "Quantum X1 处理器",
        type: "Product",
        isSelected: true,
        data: {},
        missingFields: [],
      },
      {
        id: "log_ups",
        goalId: "g2",
        name: "UPS 速递",
        type: "LogisticsProvider",
        isSelected: true,
        data: {},
        missingFields: [],
      },
      {
        id: "log_fedex",
        goalId: "g2",
        name: "FedEx 优先达",
        type: "LogisticsProvider",
        isSelected: false,
        data: {},
        missingFields: [],
      },
      {
        id: "tpl_standard",
        goalId: "g3",
        name: "2025 标准销售合同",
        type: "ContractTemplate",
        isSelected: true,
        data: {},
        missingFields: [],
      },
    ],
    integrityIssues: [
      {
        id: "iss_1",
        goalId: "g2",
        type: "missing_field",
        description: "客户 Acme Corp 缺少具体的收货地址信息，无法精确计算物流时效",
        severity: "medium",
        affectedField: "shipping_address",
        affectedInstanceId: "cus_123",
      },
    ],
    status: "pending",
    confirmedGoalIds: [],
    riskAccepted: false,
    riskNote: "",
  },
  reasoning: {
    status: "NOT_STARTED",
    snapshotId: "snap_20260209_001",
    executedAt: undefined,
    executor: "AI 智能体 (Quantum-v3)",
    results: [
      {
        goalId: "g1",
        status: "PENDING",
        facts: [
          { id: "f1", text: "库存数量为 120 台", confidence: 1.0, source: "Product(prod_001).inventory_level" },
          { id: "f2", text: '产品状态为 "Available"', confidence: 1.0, source: "Product(prod_001).status" },
        ],
        inferences: [
          { id: "i1", text: "库存充足，可满足 50 台需求", logic: "120 > 50", confidence: 1.0, dependentFacts: ["f1"] },
        ],
        risks: [],
        assumptions: [],
      },
      {
        goalId: "g2",
        status: "PENDING",
        facts: [
          { id: "f3", text: "UPS 速递标准时效为 3 天", confidence: 1.0, source: "LogisticsProvider(log_ups).sla_days" },
          { id: "f4", text: "发货地: Shenzhen, 收货地: Unknown", confidence: 1.0, source: "Order.shipping_address" },
        ],
        inferences: [
          {
            id: "i2",
            text: "预计 2月13日 前送达",
            logic: "Today + 3 days < Feb 14",
            confidence: 0.85,
            dependentFacts: ["f3"],
          },
        ],
        risks: [{ id: "r1", triggerCondition: "海关查验", impact: "延迟 2-3 天", probability: "Low (15%)" }],
        assumptions: ["客户具体收货地址未确认 (影响精确时效)"],
      },
      {
        goalId: "g3",
        status: "PENDING",
        facts: [
          {
            id: "f5",
            text: "标准合同包含 1 年基础保修",
            confidence: 1.0,
            source: "ContractTemplate(tpl_standard).warranty_clause",
          },
        ],
        inferences: [
          {
            id: "i3",
            text: '客户要求的"延长保修"需额外购买',
            logic: "Standard != Extended",
            confidence: 0.95,
            dependentFacts: ["f5"],
          },
        ],
        risks: [],
        assumptions: [],
      },
    ],
  },
  execution: {
    actions: [
      {
        id: "a1",
        type: "ai_executable",
        description: "起草回复邮件：确认库存与保修政策",
        status: "pending",
        executor: "AI 智能体",
        actionType: "write",
        targetObject: "Email",
        triggerBasis: "i3",
      },
      {
        id: "a2",
        type: "human_confirm",
        description: "人工确认：是否批准加急物流费用",
        status: "pending",
        role: "销售经理",
        relatedGoalId: "g2",
        impact: "增加 $50 物流成本",
      },
      {
        id: "a3",
        type: "ai_executable",
        description: "创建草稿订单",
        status: "pending",
        executor: "AI 智能体",
        actionType: "generate",
        targetObject: "Order",
        triggerBasis: "i2",
        dependencies: ["a2"],
      },
    ],
    status: "generated_waiting_confirm",
    generationInfo: {
      source: "步骤 3 推理结果",
      generatedAt: "2026-02-09 10:35:00",
      generator: "AI 智能体 (Quantum-v3)",
    },
  },
  result: {
    solved: true,
    hasLoss: false,
    needsReview: false,
    adoptedSolution: "全流程自动执行完成",
    recordedAt: "2026-02-09 10:45:00",
    totalAiActions: 2,
    totalHumanActions: 1,
    startTime: "2026-02-09 10:30:00",
    endTime: "2026-02-09 10:45:00",
    operator: "AI 系统",
    changeLogs: [
      {
        id: "cl_1",
        objectType: "Order",
        objectId: "ord_draft_001",
        before: { status: "non_existent" },
        after: { status: "draft", total_amount: 15000, items: ["Quantum X1 x 50"] },
        triggerActionId: "a3",
        timestamp: "2026-02-09 10:40:00",
      },
      {
        id: "cl_2",
        objectType: "Email",
        objectId: "email_reply_001",
        before: { status: "non_existent" },
        after: { status: "sent", subject: "Re: Inquiry", recipient: "Acme Corp" },
        triggerActionId: "a1",
        timestamp: "2026-02-09 10:36:00",
      },
    ],
  },
};

const MOCK_STATES: Record<string, DecisionTraceState> = {
  // Event 1: Default
  evt_001: DEFAULT_STATE,

  // Event 4: VIP Customer - Urgent Order
  evt_004: {
    ...DEFAULT_STATE,
    triggerEvent: {
      id: "evt_004",
      type: "CUSTOMER_EMAIL_RECEIVED",
      content: "紧急：Project Alpha 项目急需 200 台 Quantum S2。价格不是问题，但速度必须快。今天能发货吗？",
      timestamp: "2026-01-27 11:15:00",
    },
    intentAnalysis: {
      coreIntent: "VIP 紧急订单 (极高优先级)",
      urgency: "High",
      stepStatus: "AI_ANALYZED",
      isModified: false,
      goals: [
        {
          id: "g1",
          description: "确认 VIP 库存预留",
          initialSuggestion: "检查 VIP 专属库存池",
          isConfirmed: true,
          isEnabled: true,
        },
        {
          id: "g2",
          description: "安排极速物流",
          initialSuggestion: "调用专车配送服务",
          isConfirmed: true,
          isEnabled: true,
        },
        {
          id: "g3",
          description: "生成加急订单",
          initialSuggestion: "创建优先等级 1 订单",
          isConfirmed: true,
          isEnabled: true,
        },
      ],
      status: "pending",
    },
    dataPreparation: {
      ...DEFAULT_STATE.dataPreparation,
      requirements: [
        { id: "r1", goalId: "g1", objectType: "Product", fields: ["vip_reserved_stock"], relations: [] },
        { id: "r2", goalId: "g2", objectType: "LogisticsProvider", fields: ["same_day_delivery"], relations: [] },
      ],
      candidates: [
        {
          id: "prod_s2",
          goalId: "g1",
          name: "Quantum S2",
          type: "Product",
          isSelected: true,
          data: { vip_stock: 500 },
          missingFields: [],
        },
        {
          id: "log_special",
          goalId: "g2",
          name: "专车配送",
          type: "LogisticsProvider",
          isSelected: true,
          data: { speed: "4小时" },
          missingFields: [],
        },
      ],
      integrityIssues: [],
    },
  },

  // Event 5: Prospect - Competitor Research
  evt_005: {
    ...DEFAULT_STATE,
    currentStep: "data",
    triggerEvent: {
      id: "evt_005",
      type: "CUSTOMER_WEB_ACTIVITY",
      content: "用户浏览了 'Quantum X1 vs 竞品 Y' 对比页面 15 分钟。下载了 '性能基准报告'。",
      timestamp: "2026-01-27 13:20:00",
    },
    intentAnalysis: {
      coreIntent: "竞品调研 / 犹豫期介入",
      urgency: "Medium",
      stepStatus: "AI_ANALYZED",
      isModified: false,
      goals: [
        {
          id: "g1",
          description: "识别关注痛点",
          initialSuggestion: "分析浏览热力图",
          isConfirmed: true,
          isEnabled: true,
        },
        {
          id: "g2",
          description: "推送差异化优势材料",
          initialSuggestion: "发送《为什么选择 Quantum》邮件",
          isConfirmed: true,
          isEnabled: true,
        },
      ],
      status: "pending",
    },
  },

  // Event 6: Customer - Credit Limit Risk
  evt_006: {
    ...DEFAULT_STATE,
    currentStep: "reasoning",
    triggerEvent: {
      id: "evt_006",
      type: "SYSTEM_FLAG_RAISED",
      content: "系统警报：客户 'F 制造' 信用额度使用率达到 95% ($95,000 / $100,000)。待处理订单价值：$8,000。",
      timestamp: "2026-01-26 15:40:00",
    },
    intentAnalysis: {
      coreIntent: "信用风险控制",
      urgency: "High",
      stepStatus: "AI_ANALYZED",
      isModified: false,
      goals: [
        {
          id: "g1",
          description: "评估信用风险",
          initialSuggestion: "查询历史回款记录",
          isConfirmed: true,
          isEnabled: true,
        },
        {
          id: "g2",
          description: "决定订单处理方式",
          initialSuggestion: "暂时挂起订单或申请特批",
          isConfirmed: true,
          isEnabled: true,
        },
      ],
      status: "pending",
    },
    reasoning: {
      ...DEFAULT_STATE.reasoning,
      results: [
        {
          goalId: "g1",
          status: "PENDING",
          facts: [
            { id: "f1", text: "当前欠款 $95,000", confidence: 1.0, source: "ERP.AR" },
            { id: "f2", text: "过去 12 个月无逾期记录", confidence: 1.0, source: "ERP.History" },
          ],
          inferences: [
            {
              id: "i1",
              text: "信用记录良好，属业务扩张导致的临时额度紧张",
              logic: "History == Good",
              confidence: 0.9,
              dependentFacts: ["f2"],
            },
          ],
          risks: [{ id: "r1", triggerCondition: "超额度发货", impact: "坏账风险增加", probability: "Medium" }],
          assumptions: [],
        },
      ],
    },
  },

  // Event 7: Partner - Contract Renewal
  evt_007: {
    ...DEFAULT_STATE,
    currentStep: "result",
    overallStatus: "COMPLETED",
    triggerEvent: {
      id: "evt_007",
      type: "STATUS_CHANGED",
      content: "合同 #CT-2023-889 将在 30 天后到期。自动续约已关闭。",
      timestamp: "2026-01-25 09:30:00",
    },
    intentAnalysis: {
      coreIntent: "合同续约跟进",
      urgency: "Medium",
      stepStatus: "AI_ANALYZED",
      isModified: false,
      goals: [
        {
          id: "g1",
          description: "发起续约流程",
          initialSuggestion: "生成续约合同草稿",
          isConfirmed: true,
          isEnabled: true,
        },
        {
          id: "g2",
          description: "预约续约谈判会议",
          initialSuggestion: "发送会议邀请",
          isConfirmed: true,
          isEnabled: true,
        },
      ],
      status: "completed",
    },
    result: {
      ...DEFAULT_STATE.result,
      solved: true,
      adoptedSolution: "已发送续约合同并预约下周一会议",
      recordedAt: "2026-01-25 10:00:00",
    },
  },

  // Event 8: Customer - Product Complaint
  evt_008: {
    ...DEFAULT_STATE,
    currentStep: "intent",
    triggerEvent: {
      id: "evt_008",
      type: "CUSTOMER_EMAIL_RECEIVED",
      content: "非常失望！上一批传感器有 20% 的故障率。这无法接受。我们需要立即得到解决方案，否则将更换供应商。",
      timestamp: "2026-01-27 14:50:00",
    },
    intentAnalysis: {
      coreIntent: "客诉危机处理 (高严重性)",
      urgency: "High",
      stepStatus: "AI_ANALYZED",
      isModified: false,
      goals: [
        {
          id: "g1",
          description: "安抚客户情绪",
          initialSuggestion: "发送道歉信并承诺 24h 内给出方案",
          isConfirmed: true,
          isEnabled: true,
        },
        {
          id: "g2",
          description: "启动质量调查",
          initialSuggestion: "创建 QA Ticket 并通知质量部",
          isConfirmed: true,
          isEnabled: true,
        },
        { id: "g3", description: "安排退换货", initialSuggestion: "生成 RMA 单据", isConfirmed: true, isEnabled: true },
      ],
      status: "pending",
    },
  },

  // Event 9: Lead - Whitepaper Download
  evt_009: {
    ...DEFAULT_STATE,
    currentStep: "intent", // Waiting trigger
    overallStatus: "WAITING_CONFIRMATION",
    triggerEvent: {
      id: "evt_009",
      type: "CUSTOMER_WEB_ACTIVITY",
      content: "线索 'I 网络' 下载了 '下一代网络架构' 白皮书。",
      timestamp: "2026-01-27 16:10:00",
    },
    intentAnalysis: {
      coreIntent: "销售线索培育",
      urgency: "Low",
      stepStatus: "AI_ANALYZED",
      isModified: false,
      goals: [
        {
          id: "g1",
          description: "评估线索质量",
          initialSuggestion: "根据公司规模和行业打分",
          isConfirmed: true,
          isEnabled: true,
        },
        {
          id: "g2",
          description: "发送后续资料",
          initialSuggestion: "发送相关案例研究",
          isConfirmed: true,
          isEnabled: true,
        },
      ],
      status: "pending",
    },
  },

  // Event 10: VIP Customer - Security Alert
  evt_010: {
    ...DEFAULT_STATE,
    currentStep: "result",
    overallStatus: "TERMINATED",
    triggerEvent: {
      id: "evt_010",
      type: "SYSTEM_FLAG_RAISED",
      content: "安全警报：VIP 账户 'J 控股' 出现多次来自 IP 192.168.1.X (未知位置) 的失败登录尝试。",
      timestamp: "2026-01-24 23:45:00",
    },
    intentAnalysis: {
      coreIntent: "账户安全响应",
      urgency: "High",
      stepStatus: "AI_ANALYZED",
      isModified: false,
      goals: [
        {
          id: "g1",
          description: "临时冻结账户",
          initialSuggestion: "执行账户锁定操作",
          isConfirmed: true,
          isEnabled: true,
        },
        {
          id: "g2",
          description: "通知客户管理员",
          initialSuggestion: "发送安全警告邮件/短信",
          isConfirmed: true,
          isEnabled: true,
        },
      ],
      status: "completed",
    },
    result: {
      ...DEFAULT_STATE.result,
      solved: false,
      hasLoss: false,
      needsReview: true,
      adoptedSolution: "系统自动冻结账户，人工介入调查中",
      recordedAt: "2026-01-24 23:50:00",
    },
  },
};

export const getMockState = (eventId?: string): DecisionTraceState => {
  if (!eventId) return DEFAULT_STATE;
  const state = MOCK_STATES[eventId];
  if (state) return state;

  // Fallback for unknown IDs: use default but update ID
  return {
    ...DEFAULT_STATE,
    triggerEvent: {
      ...DEFAULT_STATE.triggerEvent,
      id: eventId,
    },
  };
};
