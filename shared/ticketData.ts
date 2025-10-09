// Ticket Management Data Types and Mock Data

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'PENDING_CUSTOMER' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TicketType = 'TECHNICAL_SUPPORT' | 'BILLING' | 'FEATURE_REQUEST' | 'BUG_REPORT' | 'GENERAL_INQUIRY';

// AI评估记录接口
export interface EvaluationCriteria {
  responseTime: number;      // 响应时间评分 (0-100)
  communicationQuality: number; // 沟通质量评分 (0-100)
  problemResolution: number;    // 问题解决评分 (0-100)
  customerSatisfaction: number; // 客户满意度评分 (0-100)
}

export interface TicketEvaluation {
  id: string;
  ticketId: string;
  score: number; // 评估分数 0-100
  evaluatedAt: string;
  summary: string; // 会话摘要
  details: Array<{
    type: 'positive' | 'negative' | 'neutral';
    content: string;
  }>; // 评估内容详情
  evaluationType: 'AUTO' | 'MANUAL'; // 自动评估或手动评估
  criteria?: EvaluationCriteria; // 详细评估标准
}

// Ticket消息接口
export interface TicketMessage {
  id: string;
  ticketId?: string;
  sender: 'customer' | 'agent';
  senderName: string;
  content: string;
  timestamp: string;
  type?: 'text' | 'image' | 'file';
  isAiGenerated?: boolean; // 是否为AI生成的内容
}

// Ticket接口
export interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  type: TicketType;
  customerEmail: string;
  customerName: string;
  assignedAgent?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
  messages: TicketMessage[];
  evaluations: TicketEvaluation[];
  tags: string[];
  // 最新评估信息（用于列表显示）
  latestEvaluationScore?: number;
  latestEvaluationTime?: string;
}

// 状态显示配置
export const TICKET_STATUS_CONFIG = {
  OPEN: { label: '待处理', color: 'bg-red-100 text-red-800', icon: '🔴' },
  IN_PROGRESS: { label: '处理中', color: 'bg-blue-100 text-blue-800', icon: '🔵' },
  PENDING_CUSTOMER: { label: '等待客户', color: 'bg-yellow-100 text-yellow-800', icon: '🟡' },
  RESOLVED: { label: '已解决', color: 'bg-green-100 text-green-800', icon: '🟢' },
  CLOSED: { label: '已关闭', color: 'bg-gray-100 text-gray-800', icon: '⚫' }
};

// 优先级显示配置
export const TICKET_PRIORITY_CONFIG = {
  LOW: { label: '低', color: 'bg-gray-100 text-gray-800' },
  MEDIUM: { label: '中', color: 'bg-blue-100 text-blue-800' },
  HIGH: { label: '高', color: 'bg-orange-100 text-orange-800' },
  URGENT: { label: '紧急', color: 'bg-red-100 text-red-800' }
};

// 类型显示配置
export const TICKET_TYPE_CONFIG = {
  TECHNICAL_SUPPORT: { label: '技术支持', icon: '🔧' },
  BILLING: { label: '账单问题', icon: '💰' },
  FEATURE_REQUEST: { label: '功能请求', icon: '💡' },
  BUG_REPORT: { label: '错误报告', icon: '🐛' },
  GENERAL_INQUIRY: { label: '一般咨询', icon: '❓' }
};

// 模拟Ticket数据
export const mockTickets: Ticket[] = [
  {
    id: 'ticket-001',
    subject: '登录页面无法正常加载',
    description: '用户反馈在Chrome浏览器中无法正常加载登录页面，显示白屏',
    status: 'OPEN',
    priority: 'HIGH',
    type: 'TECHNICAL_SUPPORT',
    customerEmail: 'zhang.wei@example.com',
    customerName: '张伟',
    assignedAgent: '李小明',
    createdAt: '2024-01-25T09:30:00Z',
    updatedAt: '2024-01-25T09:30:00Z',
    tags: ['登录问题', '浏览器兼容性'],
    messages: [
      {
        id: 'msg-001-1',
        ticketId: 'ticket-001',
        sender: 'customer',
        senderName: '张伟',
        content: '您好，我在使用Chrome浏览器访问登录页面时遇到问题，页面显示白屏，无法正常登录。请帮助解决。',
        timestamp: '2024-01-25T09:30:00Z',
        type: 'text'
      }
    ],
    evaluations: [],
    latestEvaluationScore: undefined,
    latestEvaluationTime: undefined
  },
  {
    id: 'ticket-002',
    subject: '账单金额计算错误',
    description: '客户反馈本月账单金额与实际使用量不符',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    type: 'BILLING',
    customerEmail: 'wang.li@example.com',
    customerName: '王丽',
    assignedAgent: '陈小红',
    createdAt: '2024-01-24T14:20:00Z',
    updatedAt: '2024-01-25T10:15:00Z',
    tags: ['账单', '计算错误'],
    messages: [
      {
        id: 'msg-002-1',
        ticketId: 'ticket-002',
        sender: 'customer',
        senderName: '王丽',
        content: '您好，我查看了本月的账单，发现金额比预期高出很多。我的使用量应该不会产生这么高的费用，请帮忙核查。',
        timestamp: '2024-01-24T14:20:00Z',
        type: 'text'
      },
      {
        id: 'msg-002-2',
        ticketId: 'ticket-002',
        sender: 'agent',
        senderName: '陈小红',
        content: '您好王丽，感谢您的反馈。我已经开始核查您的账单详情，预计在24小时内给您回复。如有紧急情况，请随时联系我们。',
        timestamp: '2024-01-25T10:15:00Z',
        type: 'text'
      }
    ],
    evaluations: [],
    latestEvaluationScore: undefined,
    latestEvaluationTime: undefined
  },
  {
    id: 'ticket-003',
    subject: '希望增加数据导出功能',
    description: '用户希望能够导出历史数据到Excel格式',
    status: 'RESOLVED',
    priority: 'LOW',
    type: 'FEATURE_REQUEST',
    customerEmail: 'liu.ming@example.com',
    customerName: '刘明',
    assignedAgent: '赵小强',
    createdAt: '2024-01-20T11:00:00Z',
    updatedAt: '2024-01-24T16:30:00Z',
    resolvedAt: '2024-01-24T16:30:00Z',
    tags: ['功能请求', '数据导出'],
    messages: [
      {
        id: 'msg-003-1',
        ticketId: 'ticket-003',
        sender: 'customer',
        senderName: '刘明',
        content: '您好，我希望系统能够提供数据导出功能，特别是能够导出到Excel格式，这样便于我们进行数据分析。',
        timestamp: '2024-01-20T11:00:00Z',
        type: 'text'
      },
      {
        id: 'msg-003-2',
        ticketId: 'ticket-003',
        sender: 'agent',
        senderName: '赵小强',
        content: '您好刘明，感谢您的建议。我已经将您的需求转发给产品团队，他们会评估这个功能的可行性。',
        timestamp: '2024-01-21T09:20:00Z',
        type: 'text'
      },
      {
        id: 'msg-003-3',
        ticketId: 'ticket-003',
        sender: 'agent',
        senderName: '赵小强',
        content: '好消息！我们的开发团队已经完成了数据导出功能的开发，现在您可以在数据页面找到"导出到Excel"按钮。感谢您的建议！',
        timestamp: '2024-01-24T16:30:00Z',
        type: 'text'
      }
    ],
    evaluations: [
      {
        id: 'eval-003-1',
        ticketId: 'ticket-003',
        score: 92,
        evaluatedAt: '2024-01-24T17:00:00Z',
        summary: '功能请求处理及时，客户满意度高，响应专业且解决方案有效。',
        details: [
          { type: 'positive', content: '及时确认收到请求并转发给相关团队' },
          { type: 'positive', content: '主动跟进开发进度，保持与客户沟通' },
          { type: 'positive', content: '功能完成后及时通知客户并提供使用指导' },
          { type: 'positive', content: '整个过程沟通清晰、专业，客户满意度高' }
        ],
        evaluationType: 'AUTO',
        criteria: {
          responseTime: 85,
          communicationQuality: 95,
          problemResolution: 95,
          customerSatisfaction: 92
        }
      }
    ],
    latestEvaluationScore: 92,
    latestEvaluationTime: '2024-01-24T17:00:00Z'
  },
  {
    id: 'ticket-004',
    subject: '移动端页面显示异常',
    description: '在手机浏览器中页面布局错乱',
    status: 'CLOSED',
    priority: 'MEDIUM',
    type: 'BUG_REPORT',
    customerEmail: 'chen.xiao@example.com',
    customerName: '陈晓',
    assignedAgent: '孙小美',
    createdAt: '2024-01-18T13:45:00Z',
    updatedAt: '2024-01-23T14:20:00Z',
    resolvedAt: '2024-01-22T16:00:00Z',
    closedAt: '2024-01-23T14:20:00Z',
    tags: ['移动端', '页面布局', '已修复'],
    messages: [
      {
        id: 'msg-004-1',
        ticketId: 'ticket-004',
        sender: 'customer',
        senderName: '陈晓',
        content: '您好，我在手机上访问网站时发现页面布局完全错乱，按钮和文字重叠在一起，无法正常使用。',
        timestamp: '2024-01-18T13:45:00Z',
        type: 'text'
      },
      {
        id: 'msg-004-2',
        ticketId: 'ticket-004',
        sender: 'agent',
        senderName: '孙小美',
        content: '您好陈晓，感谢您的反馈。请问您使用的是什么手机和浏览器？这将帮助我们更好地定位问题。',
        timestamp: '2024-01-18T15:30:00Z',
        type: 'text'
      },
      {
        id: 'msg-004-3',
        ticketId: 'ticket-004',
        sender: 'customer',
        senderName: '陈晓',
        content: '我使用的是iPhone 12，Safari浏览器。',
        timestamp: '2024-01-18T16:00:00Z',
        type: 'text'
      },
      {
        id: 'msg-004-4',
        ticketId: 'ticket-004',
        sender: 'agent',
        senderName: '孙小美',
        content: '问题已经修复！我们的技术团队发现了移动端CSS的兼容性问题并已解决。请您清除浏览器缓存后重新访问，应该可以正常显示了。',
        timestamp: '2024-01-22T16:00:00Z',
        type: 'text'
      }
    ],
    evaluations: [
      {
        id: 'eval-004-1',
        ticketId: 'ticket-004',
        score: 88,
        evaluatedAt: '2024-01-23T14:30:00Z',
        summary: '技术问题处理得当，沟通及时，问题解决彻底。',
        details: [
          { type: 'positive', content: '快速响应客户反馈，响应时间优秀' },
          { type: 'positive', content: '主动收集必要的技术信息，便于问题定位' },
          { type: 'positive', content: '与技术团队有效协作，问题解决彻底' },
          { type: 'positive', content: '问题解决后及时通知客户并提供操作指导' }
        ],
        evaluationType: 'AUTO',
        criteria: {
          responseTime: 90,
          communicationQuality: 85,
          problemResolution: 90,
          customerSatisfaction: 88
        }
      }
    ],
    latestEvaluationScore: 88,
    latestEvaluationTime: '2024-01-23T14:30:00Z'
  }
];

// 获取状态标签
export const getStatusLabel = (status: TicketStatus): string => {
  return TICKET_STATUS_CONFIG[status].label;
};

// 获取优先级标签
export const getPriorityLabel = (priority: TicketPriority): string => {
  return TICKET_PRIORITY_CONFIG[priority].label;
};

// 获取类型标签
export const getTypeLabel = (type: TicketType): string => {
  return TICKET_TYPE_CONFIG[type].label;
};

// 计算Ticket的平均评估分数
export const getAverageEvaluationScore = (evaluations: TicketEvaluation[]): number | undefined => {
  if (evaluations.length === 0) return undefined;
  const sum = evaluations.reduce((acc, eval) => acc + eval.score, 0);
  return Math.round(sum / evaluations.length);
};