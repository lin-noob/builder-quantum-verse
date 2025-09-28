import { Task } from '@shared/types';

export interface EnhancedTask extends Task {
  cardType?: 'ai_suggestion' | 'procurement' | 'review' | 'analysis' | 'standard';
  amount?: number;
  currency?: string;
  vendor?: string;
  progress?: {
    label: string;
    percentage: number;
    warning?: string;
    daysLeft?: number;
  };
  aiInsights?: {
    title: string;
    description: string;
    recommendation?: string;
  };
  warningMessage?: string;
  statusBadge?: {
    text: string;
    variant: 'success' | 'warning' | 'danger' | 'info';
  };
}

export const enhancedMockTasks: EnhancedTask[] = [
  {
    id: 'enhanced-1',
    title: 'AI助手学习建议',
    description: '我注意到您最近多次将"市场营销"相关的机遇卡片标记为"暂不考虑"。',
    status: 'pending',
    priority: 'medium',
    assignee: {
      id: 'ai-assistant',
      name: 'AI助手',
      email: 'ai@example.com',
      role: 'system',
      avatarUrl: ''
    },
    createdAt: new Date('2025-01-10'),
    dueDate: new Date('2025-01-15'),
    cardType: 'ai_suggestion',
    aiInsights: {
      title: 'AI学习洞察',
      description: '通过分析您的历史决策模式，我发现了可以优化的推荐策略。',
      recommendation: '为了给您提供更精准的建议，我建议否定该整推荐策略?'
    },
    warningMessage: '为了给您提供更精准的建议，我建议您对该整推荐策略?',
    statusBadge: {
      text: '刚才',
      variant: 'info'
    }
  },
  {
    id: 'enhanced-2',
    title: '采购订单审批: PO-20250909-001',
    description: '远见科技新合同采购申请，需要您的审批确认。',
    status: 'pending',
    priority: 'high',
    assignee: {
      id: 'procurement-system',
      name: '采购系统',
      email: 'procurement@example.com',
      role: 'system',
      avatarUrl: ''
    },
    createdAt: new Date('2025-01-10'),
    dueDate: new Date('2025-01-12'),
    cardType: 'procurement',
    amount: 85000.00,
    currency: 'CNY',
    vendor: '环球电子',
    progress: {
      label: '库存预警',
      percentage: 20,
      warning: '库存预警',
      daysLeft: 3
    },
    statusBadge: {
      text: '待审批',
      variant: 'warning'
    }
  },
  {
    id: 'enhanced-3',
    title: '月度销售分析报告',
    description: '2025年1月销售数据分析及下月预测报告准备。',
    status: 'pending',
    priority: 'medium',
    assignee: {
      id: 'user-1',
      name: '张明',
      email: 'zhang.ming@example.com',
      role: 'manager',
      avatarUrl: '/avatars/zhang-ming.jpg'
    },
    createdAt: new Date('2025-01-09'),
    dueDate: new Date('2025-01-20'),
    cardType: 'analysis',
    progress: {
      label: '报告完成度',
      percentage: 65,
      warning: '需要补充Q4对比数据'
    },
    aiInsights: {
      title: '数据洞察',
      description: 'AI分析发现本月销售增长主要来自企业客户，建议重点关注B2B市场策略。',
      recommendation: '建议在报告中增��企业客户分析章节，突出B2B增长趋势。'
    },
    statusBadge: {
      text: '进行中',
      variant: 'info'
    }
  },
  {
    id: 'enhanced-4',
    title: '客户合同审核: 华润集团',
    description: '华润集团年度服务合同条款审核，涉及金额320万元。',
    status: 'pending',
    priority: 'high',
    assignee: {
      id: 'user-2',
      name: '李华',
      email: 'li.hua@example.com',
      role: 'legal',
      avatarUrl: '/avatars/li-hua.jpg'
    },
    createdAt: new Date('2025-01-08'),
    dueDate: new Date('2025-01-11'),
    cardType: 'review',
    amount: 3200000.00,
    currency: 'CNY',
    vendor: '华润集团',
    progress: {
      label: '审核进度',
      percentage: 30,
      warning: '风险条款待确认',
      daysLeft: 1
    },
    warningMessage: '合同中第15条款存在潜在风险，需要法务部门重点审核。',
    statusBadge: {
      text: '紧急',
      variant: 'danger'
    }
  },
  {
    id: 'enhanced-5',
    title: '服务器维护计划',
    description: '核心服务器例行维护及性能优化计划。',
    status: 'pending',
    priority: 'medium',
    assignee: {
      id: 'user-3',
      name: '王技术',
      email: 'wang.tech@example.com',
      role: 'tech',
      avatarUrl: '/avatars/wang-tech.jpg'
    },
    createdAt: new Date('2025-01-07'),
    dueDate: new Date('2025-01-14'),
    cardType: 'standard',
    progress: {
      label: '系统稳定性',
      percentage: 95,
      warning: '内存使用率偏高'
    },
    aiInsights: {
      title: 'AI运维建议',
      description: '系统监控显示内存使用率持续增长，建议优先升级内存配置。',
      recommendation: '建议在维护窗口期间进行内存扩容，预计可提升30%性能。'
    },
    statusBadge: {
      text: '计划中',
      variant: 'info'
    }
  },
  {
    id: 'enhanced-6',
    title: '团队培训计划制定',
    description: 'Q1团队技能提升培训计划制定及预算申请。',
    status: 'completed',
    priority: 'low',
    assignee: {
      id: 'user-4',
      name: '陈HR',
      email: 'chen.hr@example.com',
      role: 'hr',
      avatarUrl: '/avatars/chen-hr.jpg'
    },
    createdAt: new Date('2025-01-05'),
    dueDate: new Date('2025-01-10'),
    cardType: 'standard',
    amount: 120000.00,
    currency: 'CNY',
    progress: {
      label: '计划完成度',
      percentage: 100
    },
    statusBadge: {
      text: '已完成',
      variant: 'success'
    }
  }
];

// 按类型获取任务
export const getTasksByCardType = (cardType: string) => {
  return enhancedMockTasks.filter(task => task.cardType === cardType);
};

// 获取待处理任务
export const getPendingEnhancedTasks = () => {
  return enhancedMockTasks.filter(task => task.status === 'pending');
};

// 获取已完成任务
export const getCompletedEnhancedTasks = () => {
  return enhancedMockTasks.filter(task => task.status === 'completed');
};

// 按优先级排序
export const sortTasksByPriority = (tasks: EnhancedTask[]) => {
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return tasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
};
