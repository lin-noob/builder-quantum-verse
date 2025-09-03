// AI Marketing Data Types and Mock Data

export interface BusinessGoal {
  value: string;
  label: string;
}

export interface AIGuardrails {
  maxDiscountPercent: number;
  maxWeeklyTouchpoints: number;
  doNotDisturbStart: string;
  doNotDisturbEnd: string;
}

export interface SystemStatus {
  isEnabled: boolean;
  status: 'running' | 'stopped' | 'error';
}

export interface DecisionRecord {
  id: string;
  timestamp: string;
  icon: string;
  userId: string;
  userName: string;
  actionType: string;
  description: string;
  status: 'generating' | 'ready' | 'queued' | 'executed';
}

export interface ActivityRecord {
  id: string;
  summary: string;
  contentPreview: string;
  contentType: 'email' | 'popup';
  executionTime: string;
  result: {
    type: 'converted' | 'improved' | 'opened' | 'no_response';
    value?: string;
    amount?: number;
  };
  feedback: 'positive' | 'negative' | null;
}

// Business goals options
export const BUSINESS_GOALS: BusinessGoal[] = [
  { value: 'new_user_conversion', label: '提升新用户转化率' },
  { value: 'repeat_purchase', label: '提高用户复购率' },
  { value: 'reduce_churn', label: '降低高价值用户流失率' },
  { value: 'increase_aov', label: '提升平均客单价' }
];

// Mock data for strategy & goals
export const mockStrategyData = {
  currentGoal: 'repeat_purchase',
  guardrails: {
    maxDiscountPercent: 15,
    maxWeeklyTouchpoints: 4,
    doNotDisturbStart: '22:00',
    doNotDisturbEnd: '08:00'
  } as AIGuardrails,
  systemStatus: {
    isEnabled: true,
    status: 'running' as const
  }
};

// Mock data for live monitoring
export const mockDecisionRecords: DecisionRecord[] = [
  {
    id: 'decision-001',
    timestamp: '19:42:11',
    icon: 'crosshairs',
    userId: 'U-8857',
    userName: 'Bella Zhang',
    actionType: '交叉销售机会',
    description: '依据用户将"Lusso-V2咖啡机"加入购物车的行为，AI发现其购物车缺少核心配件（咖啡豆），决策执行实时弹窗推荐。',
    status: 'generating'
  },
  {
    id: 'decision-002',
    timestamp: '19:41:55',
    icon: 'user-plus',
    userId: 'U-9901',
    userName: 'Dana Wu',
    actionType: '新用户欢迎',
    description: '依据用户刚刚完成注册的行为，AI决策为其生成一封个性化的欢迎邮件，内容将结合其注册前浏览过的"户外运动"品类。',
    status: 'ready'
  },
  {
    id: 'decision-003',
    timestamp: '19:38:24',
    icon: 'brain',
    userId: 'U-3512',
    userName: 'Chris Li',
    actionType: '购买意图洞察',
    description: '依据用户在"ProBook X1"和"AirBook S2"两款笔记本电脑页面间反复跳转对比的行为，AI预测其购买意图强烈但处于犹豫期，决策在1小时后发送对比评测和推荐邮件。',
    status: 'queued'
  },
  {
    id: 'decision-004',
    timestamp: '19:35:20',
    icon: 'alert-triangle',
    userId: 'U-1024',
    userName: 'Alex Chen',
    actionType: '流失风险预警',
    description: '依据用户的高历史价值及连续45天未登录的行为，AI预测其流失风险为78%，决策执行个性化邮件挽回策略。',
    status: 'executed'
  }
];

// Mock data for performance analytics
export const mockAnalyticsData = {
  kpis: {
    totalExecutions: 1258,
    totalConversions: 97,
    totalRevenue: 75430,
    averageROI: 12.5
  },
  activities: [
    {
      id: 'activity-001',
      summary: '[用户挽回] 针对 U-1024',
      contentPreview: '[邮件] "Hi Alex，秋色正浓，您的相机..."',
      contentType: 'email' as const,
      executionTime: '20分钟前',
      result: {
        type: 'converted' as const,
        value: '转化',
        amount: 2899
      },
      feedback: 'positive' as const
    },
    {
      id: 'activity-002',
      summary: '[交叉销售] 针对 U-8857',
      contentPreview: '[弹窗] "配齐您的咖啡角..."',
      contentType: 'popup' as const,
      executionTime: '20分钟前',
      result: {
        type: 'improved' as const,
        value: '提升客单价',
        amount: 188
      },
      feedback: null
    },
    {
      id: 'activity-003',
      summary: '[促活] 针对 U-5271',
      contentPreview: '[邮件] "您收藏的徒步鞋已到货..."',
      contentType: 'email' as const,
      executionTime: '1天前',
      result: {
        type: 'opened' as const,
        value: '已打开，未转化'
      },
      feedback: null
    },
    {
      id: 'activity-004',
      summary: '[交叉销售] 针对 U-7345',
      contentPreview: '[弹窗] "您的新手机需要一个保护壳..."',
      contentType: 'popup' as const,
      executionTime: '2天前',
      result: {
        type: 'no_response' as const,
        value: '无响应'
      },
      feedback: 'negative' as const
    },
    {
      id: 'activity-005',
      summary: '[用户挽回] 针对 U-2289',
      contentPreview: '[邮件] "我们注意到您很久没来了..."',
      contentType: 'email' as const,
      executionTime: '3天前',
      result: {
        type: 'converted' as const,
        value: '转化',
        amount: 349
      },
      feedback: null
    },
    {
      id: 'activity-006',
      summary: '[新用户欢迎] 针对 U-9812',
      contentPreview: '[邮件] "欢迎加入！探索您感兴趣的..."',
      contentType: 'email' as const,
      executionTime: '4天前',
      result: {
        type: 'opened' as const,
        value: '已打开，未转化'
      },
      feedback: null
    }
  ] as ActivityRecord[]
};

// Helper functions
export const getBusinessGoalLabel = (value: string): string => {
  const goal = BUSINESS_GOALS.find(g => g.value === value);
  return goal ? goal.label : value;
};

export const getStatusIcon = (status: DecisionRecord['status']) => {
  switch (status) {
    case 'generating':
      return 'loader';
    case 'ready':
      return 'clock';
    case 'queued':
      return 'list';
    case 'executed':
      return 'check';
    default:
      return 'help-circle';
  }
};

export const getStatusText = (status: DecisionRecord['status']) => {
  switch (status) {
    case 'generating':
      return '内容生成中...';
    case 'ready':
      return '准备执行...';
    case 'queued':
      return '已加入任务队列';
    case 'executed':
      return '已执行';
    default:
      return status;
  }
};

export const getResultIcon = (type: ActivityRecord['result']['type']) => {
  switch (type) {
    case 'converted':
      return '✅';
    case 'improved':
      return '✅';
    case 'opened':
      return '👀';
    case 'no_response':
      return '❌';
    default:
      return '❓';
  }
};
