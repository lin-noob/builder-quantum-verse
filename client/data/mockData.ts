import { Incident, User, ResponseAction, Activity, Task, Event } from '@shared/types';

// Mock users
export const mockUsers: User[] = [
  {
    id: '1',
    name: '张明',
    avatarUrl: '',
    role: 'Senior Analyst'
  },
  {
    id: '2', 
    name: '李小红',
    avatarUrl: '',
    role: 'Customer Success Manager'
  },
  {
    id: '3',
    name: '王大伟',
    avatarUrl: '',
    role: 'Technical Support Lead'
  },
  {
    id: '4',
    name: 'AI助理',
    avatarUrl: '',
    role: 'AI Assistant'
  }
];

// 添加邮件专员用户
export const emailSpecialist: User = {
  id: '5',
  name: '陈小雅',
  avatarUrl: '',
  role: 'Email Marketing Specialist'
};

// 将邮件专员添加到用户列表
mockUsers.push(emailSpecialist);

// Mock response actions
const mockResponseActions: ResponseAction[] = [
  {
    id: 'ra1',
    title: '联系客户确认订单状态',
    description: '主动联系客户李先生，了解订单取消的具体原因，并提供解决方案',
    type: 'communication'
  },
  {
    id: 'ra2', 
    title: '检查订单处理系统',
    description: '技术团队检查订单管理系统是否存在处理延迟或错误',
    type: 'process'
  },
  {
    id: 'ra3',
    title: '分析客户购买历史',
    description: '获取客户完整购买记录，分析购买模式和偏好',
    type: 'data_enrichment'
  }
];

const mockResponseActions2: ResponseAction[] = [
  {
    id: 'ra4',
    title: '紧急处理支付问题',
    description: '立即检查支付网关状态，确保系统正常运行',
    type: 'process'
  },
  {
    id: 'ra5',
    title: '通知受影响客户',
    description: '主动联系所有受影响的客户，说明情况并提供补偿方案',
    type: 'communication'
  },
  {
    id: 'ra6',
    title: '数据恢复验证',
    description: '验证备份数据完整性，确保可以快速恢复服务',
    type: 'data_enrichment'
  }
];

// 邮件相关的响应动作
const mockEmailResponseActions: ResponseAction[] = [
  {
    id: 'ra_email1',
    title: '发送自动回复邮件',
    description: '向投诉客户发送自动确认邮件，告知已收到投诉并将在24小时内处理',
    type: 'communication'
  },
  {
    id: 'ra_email2',
    title: '人工审核邮件内容',
    description: '邮件专员审核投诉内容，分析问题严重程度并制定处理方案',
    type: 'process'
  },
  {
    id: 'ra_email3',
    title: '更新客户邮件偏好',
    description: '根据客户退订请求，更新邮件列表和发送偏好设置',
    type: 'data_enrichment'
  }
];

const mockEmailResponseActions2: ResponseAction[] = [
  {
    id: 'ra_email4',
    title: '检查邮件服务器状态',
    description: '技术团队检查SMTP服务器配置和网络连接状态',
    type: 'process'
  },
  {
    id: 'ra_email5',
    title: '重新发送失败邮件',
    description: '使用备用邮件服务器重新发送失败的邮件',
    type: 'process'
  },
  {
    id: 'ra_email6',
    title: '通知受影响客户',
    description: '通过短信或其他渠道告知客户邮件发送问题',
    type: 'communication'
  }
];

const mockEmailResponseActions3: ResponseAction[] = [
  {
    id: 'ra_email7',
    title: '清理无效邮箱地址',
    description: '从邮件列表中移除无效和退回的邮箱地址',
    type: 'data_enrichment'
  },
  {
    id: 'ra_email8',
    title: '优化邮件内容',
    description: '分析退订原因，优化邮件内容和发送频率',
    type: 'process'
  },
  {
    id: 'ra_email9',
    title: '个性化邮件策略',
    description: '基于客户行为数据制定个性化邮件发送策略',
    type: 'data_enrichment'
  }
];

// Mock activities  
const mockActivities: Activity[] = [
  {
    id: 'act1',
    timestamp: new Date('2024-01-20T14:30:00'),
    description: 'AI检测到异常的订单取消模式',
    actor: 'AI'
  },
  {
    id: 'act2',
    timestamp: new Date('2024-01-20T14:32:00'), 
    description: '自动收集相关客户数据和订单信息',
    actor: 'AI'
  },
  {
    id: 'act3',
    timestamp: new Date('2024-01-20T14:35:00'),
    description: '生成初步分析报告和建议响应计划',
    actor: 'AI'
  }
];

const mockActivities2: Activity[] = [
  {
    id: 'act4', 
    timestamp: new Date('2024-01-20T13:15:00'),
    description: '监控系统检测到支付成功率异常下降',
    actor: 'AI'
  },
  {
    id: 'act5',
    timestamp: new Date('2024-01-20T13:18:00'),
    description: '确认为第三方支付网关故障',
    actor: 'AI'
  },
  {
    id: 'act6',
    timestamp: new Date('2024-01-20T13:20:00'),
    description: '启动应急响应流程',
    actor: 'AI'
  }
];

// 邮件相关的活动记录
const mockEmailActivities: Activity[] = [
  {
    id: 'act_email1',
    timestamp: new Date('2024-01-20T15:45:00'),
    description: 'AI检测到客户投诉邮件，自动分类为高优先级',
    actor: 'AI'
  },
  {
    id: 'act_email2',
    timestamp: new Date('2024-01-20T15:47:00'),
    description: '自动提取投诉关键信息：产品质量问题',
    actor: 'AI'
  },
  {
    id: 'act_email3',
    timestamp: new Date('2024-01-20T15:50:00'),
    description: '生成客户投诉处理建议和响应模板',
    actor: 'AI'
  }
];

const mockEmailActivities2: Activity[] = [
  {
    id: 'act_email4',
    timestamp: new Date('2024-01-20T16:20:00'),
    description: '监控系统检测到邮件发送失败率异常升高',
    actor: 'AI'
  },
  {
    id: 'act_email5',
    timestamp: new Date('2024-01-20T16:22:00'),
    description: '确认为SMTP服务器连接超时问题',
    actor: 'AI'
  },
  {
    id: 'act_email6',
    timestamp: new Date('2024-01-20T16:25:00'),
    description: '启动邮件服务应急处理流程',
    actor: 'AI'
  }
];

const mockEmailActivities3: Activity[] = [
  {
    id: 'act_email7',
    timestamp: new Date('2024-01-20T17:10:00'),
    description: 'AI分析检测到邮件退订率异常增长',
    actor: 'AI'
  },
  {
    id: 'act_email8',
    timestamp: new Date('2024-01-20T17:12:00'),
    description: '自动分析退订原因：邮件频率过高',
    actor: 'AI'
  },
  {
    id: 'act_email9',
    timestamp: new Date('2024-01-20T17:15:00'),
    description: '生成邮件策略优化建议',
    actor: 'AI'
  }
];

// Mock tasks - Comprehensive collection for My Tasks and Calendar
export const allMockTasks: Task[] = [
  // Tasks from incident 1 (客户李先生订单异常取消事件)
  {
    id: 'task1',
    title: '联系客户李先生',
    status: 'pending',
    assignee: mockUsers[1], // 李小红
    parentIncidentId: 'inc1',
    dueDate: new Date('2024-01-20T18:00:00')
  },
  {
    id: 'task2',
    title: '系统检查报告',
    status: 'pending',
    assignee: mockUsers[2], // 王大伟
    parentIncidentId: 'inc1',
    dueDate: new Date('2024-01-21T10:00:00')
  },

  // Tasks from incident 2 (支付网关故障)
  {
    id: 'task3',
    title: '支付网关故障处理',
    status: 'completed',
    assignee: mockUsers[2], // 王大伟
    parentIncidentId: 'inc2',
    dueDate: new Date('2024-01-20T16:00:00'),
    scheduledTime: {
      start: new Date('2024-01-20T15:00:00'),
      end: new Date('2024-01-20T16:00:00')
    }
  },
  {
    id: 'task4',
    title: '客户通知计划',
    status: 'pending',
    assignee: mockUsers[1], // 李小红
    parentIncidentId: 'inc2',
    dueDate: new Date('2024-01-20T17:00:00')
  },

  // Additional tasks for comprehensive testing
  {
    id: 'task5',
    title: '数据库备份验证',
    status: 'pending',
    assignee: mockUsers[2], // 王大伟
    parentIncidentId: 'inc2',
    dueDate: new Date('2024-01-21T09:00:00'),
    scheduledTime: {
      start: new Date('2024-01-21T08:00:00'),
      end: new Date('2024-01-21T09:30:00')
    }
  },
  {
    id: 'task6',
    title: '服务器扩容准备',
    status: 'pending',
    assignee: mockUsers[0], // 张明
    parentIncidentId: 'inc3',
    dueDate: new Date('2024-01-22T14:00:00'),
    scheduledTime: {
      start: new Date('2024-01-22T13:00:00'),
      end: new Date('2024-01-22T15:00:00')
    }
  },
  {
    id: 'task7',
    title: '库存同步优化',
    status: 'pending',
    assignee: mockUsers[2], // 王大伟
    parentIncidentId: 'inc4',
    dueDate: new Date('2024-01-19T16:00:00') // 过期任务
  },
  {
    id: 'task8',
    title: '客户满意度调查',
    status: 'completed',
    assignee: mockUsers[1], // 李小红
    parentIncidentId: 'inc1',
    dueDate: new Date('2024-01-19T17:00:00')
  },
  {
    id: 'task9',
    title: '用户注册流程优化',
    status: 'pending',
    assignee: mockUsers[0], // 张明
    parentIncidentId: 'inc3',
    dueDate: new Date('2024-01-23T11:00:00'),
    scheduledTime: {
      start: new Date('2024-01-23T10:00:00'),
      end: new Date('2024-01-23T12:00:00')
    }
  },
  {
    id: 'task10',
    title: '安全漏洞修复',
    status: 'pending',
    assignee: mockUsers[2], // 王大伟
    parentIncidentId: 'inc1',
    dueDate: new Date('2024-01-24T16:00:00'),
    scheduledTime: {
      start: new Date('2024-01-24T14:00:00'),
      end: new Date('2024-01-24T17:00:00')
    }
  },

  // 审批流相关任务
  {
    id: 'task_approval1',
    title: '客户退款申请审批',
    status: 'pending',
    assignee: mockUsers[1], // 李小红
    parentIncidentId: 'inc1',
    dueDate: new Date('2024-01-21T15:00:00'),
    handlingType: 'external_approval',
    externalSystem: 'OA',
    externalUrl: 'https://oa.company.com/approval/refund/12345',
    externalStatus: 'pending_sync'
  },
  {
    id: 'task_approval2',
    title: '系统升级预算审批',
    status: 'pending',
    assignee: mockUsers[2], // 王大伟
    parentIncidentId: 'inc2',
    dueDate: new Date('2024-01-22T10:00:00'),
    handlingType: 'external_approval',
    externalSystem: 'ERP',
    externalUrl: 'https://erp.company.com/budget/approval/67890',
    externalStatus: 'pending_sync'
  },
  {
    id: 'task_approval3',
    title: '客户数据处理授权',
    status: 'pending',
    assignee: mockUsers[0], // 张明
    parentIncidentId: 'inc3',
    dueDate: new Date('2024-01-21T14:00:00'),
    handlingType: 'external_approval',
    externalSystem: 'CRM',
    externalUrl: 'https://crm.company.com/data-auth/54321',
    externalStatus: 'pending_sync'
  },
  {
    id: 'task_approval4',
    title: '营销活动费用审批',
    status: 'completed',
    assignee: emailSpecialist, // 陈小雅
    parentIncidentId: 'inc_email3',
    dueDate: new Date('2024-01-20T16:00:00'),
    handlingType: 'external_approval',
    externalSystem: 'OA',
    externalUrl: 'https://oa.company.com/approval/marketing/98765',
    externalStatus: 'completed'
  },
  {
    id: 'task_approval5',
    title: '服务器采购申请',
    status: 'pending',
    assignee: mockUsers[2], // 王大伟
    parentIncidentId: 'inc2',
    dueDate: new Date('2024-01-23T12:00:00'),
    handlingType: 'external_approval',
    externalSystem: 'ERP',
    externalUrl: 'https://erp.company.com/procurement/server/11111',
    externalStatus: 'pending_sync'
  },
  {
    id: 'task_approval6',
    title: '客户信息变更审批',
    status: 'pending',
    assignee: mockUsers[1], // 李小红
    parentIncidentId: 'inc1',
    dueDate: new Date('2024-01-21T11:00:00'),
    handlingType: 'external_approval',
    externalSystem: 'CRM',
    externalUrl: 'https://crm.company.com/customer-update/22222',
    externalStatus: 'pending_sync'
  },

  // 邮件相关任务
  {
    id: 'task_email1',
    title: '处理客户投诉邮件',
    status: 'pending',
    assignee: emailSpecialist, // 陈小雅
    parentIncidentId: 'inc_email1',
    dueDate: new Date('2024-01-20T18:00:00'),
    type: 'email',
    context: {
      incidentTitle: '客户产品质量投诉邮件',
      customerName: '王女士'
    }
  },
  {
    id: 'task_email2',
    title: '邮件服务器故障修复',
    status: 'pending',
    assignee: mockUsers[2], // 王大伟
    parentIncidentId: 'inc_email2',
    dueDate: new Date('2024-01-20T17:30:00'),
    scheduledTime: {
      start: new Date('2024-01-20T16:30:00'),
      end: new Date('2024-01-20T18:00:00')
    }
  },
  {
    id: 'task_email3',
    title: '邮件列表清理优化',
    status: 'pending',
    assignee: emailSpecialist, // 陈小雅
    parentIncidentId: 'inc_email3',
    dueDate: new Date('2024-01-21T12:00:00'),
    type: 'email',
    context: {
      incidentTitle: '邮件退订率异常增长',
      customerName: '多名客户'
    }
  },
  {
    id: 'task_email4',
    title: '发送客户道歉邮件',
    status: 'completed',
    assignee: emailSpecialist, // 陈小雅
    parentIncidentId: 'inc_email1',
    dueDate: new Date('2024-01-20T16:00:00'),
    type: 'email'
  }
];

// Tasks for specific incidents (kept for backward compatibility)
const mockTasks: Task[] = allMockTasks.filter(task => task.parentIncidentId === 'inc1');
const mockTasks2: Task[] = allMockTasks.filter(task => task.parentIncidentId === 'inc2');

// Mock incidents
export const mockIncidents: Incident[] = [
  {
    id: 'inc1',
    title: '客户李先生订单异常取消事件',
    status: 'pending_human',
    priority: 'high',
    timestamp: new Date('2024-01-20T14:25:00'),
    involvedEntities: [
      { type: 'customer', value: '李先生' },
      { type: 'order', value: 'ORD-2024-001237' },
      { type: 'product', value: '高端笔记本电脑' }
    ],
    aiAnalysis: {
      confidence: 85,
      summary: '检测到客户李先生在付款成功后立即取消了高价值订单。结合历史数据分析，可能存在用户体验问题或技术故障。建议立即联系客户了解情况。',
      keyMetrics: [
        { label: '订单金额', value: '¥12,999' },
        { label: '客户等级', value: 'VIP会���' },
        { label: '历史订单', value: '23单' },
        { label: '异常指数', value: '高风险' }
      ]
    },
    suggestedResponsePlan: mockResponseActions,
    processingHistory: mockActivities,
    assignedTasks: mockTasks
  },
  {
    id: 'inc2',
    title: '支付网关故障导致交易失败',
    status: 'in_progress', 
    priority: 'high',
    timestamp: new Date('2024-01-20T13:10:00'),
    involvedEntities: [
      { type: 'product', value: '支付系统' },
      { type: 'customer', value: '多名客户' }
    ],
    aiAnalysis: {
      confidence: 95,
      summary: '第三方支付网关出现故障，导致过去30分钟内支付成功率从98%下降至15%。已确认为外部服务问题，建议立即启动应急预案。',
      keyMetrics: [
        { label: '影响客户数', value: '156人' },
        { label: '失败交易', value: '¥89,450' },
        { label: '系统可用性', value: '15%' },
        { label: '预计修复时间', value: '2小时' }
      ]
    },
    suggestedResponsePlan: mockResponseActions2, 
    processingHistory: mockActivities2,
    assignedTasks: mockTasks2
  },
  {
    id: 'inc3',
    title: '新用户注册量异常增长',
    status: 'automated',
    priority: 'medium', 
    timestamp: new Date('2024-01-20T12:45:00'),
    involvedEntities: [
      { type: 'customer', value: '新注册用户' },
      { type: 'product', value: '用户注册系统' }
    ],
    aiAnalysis: {
      confidence: 70,
      summary: '过去2小时内新用户注册量比平时增长了340%。初步分析可能与营销活动或媒体曝光有关。系统运行正常，建议监控服务器负载。',
      keyMetrics: [
        { label: '新注册用户', value: '1,247人' },
        { label: '增长率', value: '+340%' },
        { label: '服务器负载', value: '78%' },
        { label: '响应时间', value: '1.2秒' }
      ]
    },
    suggestedResponsePlan: [
      {
        id: 'ra7',
        title: '服务器扩容准备',
        description: '准备额外服务器资源以应对可能的持续增长',
        type: 'process'
      }
    ],
    processingHistory: [
      {
        id: 'act7',
        timestamp: new Date('2024-01-20T12:45:00'),
        description: '检测到注册量异常增长',
        actor: 'AI'
      },
      {
        id: 'act8', 
        timestamp: new Date('2024-01-20T12:50:00'),
        description: 'AI自动启动负载均衡策略',
        actor: 'AI'
      }
    ],
    assignedTasks: []
  },
  {
    id: 'inc4',
    title: '库存数据同步延迟',
    status: 'pending_human',
    priority: 'low',
    timestamp: new Date('2024-01-20T11:20:00'),
    involvedEntities: [
      { type: 'product', value: '库存管理系统' }
    ],
    aiAnalysis: {
      confidence: 60,
      summary: '检测到部分商品库存数据同步存在5-10分钟延迟。影响范围有限，但可能影响客户购买决策。建议在非峰值时段进行系统优化。',
      keyMetrics: [
        { label: '受影响商品', value: '23种' },
        { label: '同步延迟', value: '8分钟' },
        { label: '影响订单', value: '12单' },
        { label: '系统负载', value: '正常' }
      ]
    },
    suggestedResponsePlan: [
      {
        id: 'ra8',
        title: '库存同步优化',
        description: '优化数据同步机制，减少延迟时间',
        type: 'process'
      }
    ],
    processingHistory: [
      {
        id: 'act9',
        timestamp: new Date('2024-01-20T11:20:00'),
        description: '检测到库存同步异常',
        actor: 'AI'
      }
    ],
    assignedTasks: []
  },

  // 邮件相关事件
  {
    id: 'inc_email1',
    title: '客户产品质量投诉邮件',
    status: 'pending_human',
    priority: 'high',
    timestamp: new Date('2024-01-20T15:40:00'),
    involvedEntities: [
      { type: 'customer', value: '王女士' },
      { type: 'product', value: '智能手机' },
      { type: 'order', value: 'ORD-2024-001456' }
    ],
    aiAnalysis: {
      confidence: 90,
      summary: '客户王女士通过邮件投诉购买的智能手机存在屏幕显示问题。邮件情绪分析显示客户非常不满，需要立即人工处理以避免负面影响扩大。',
      keyMetrics: [
        { label: '投诉类型', value: '产品质量' },
        { label: '客户等级', value: '普通会员' },
        { label: '情绪指数', value: '非常不满' },
        { label: '紧急程度', value: '高' }
      ]
    },
    suggestedResponsePlan: mockEmailResponseActions,
    processingHistory: mockEmailActivities,
    assignedTasks: allMockTasks.filter(task => task.parentIncidentId === 'inc_email1')
  },
  {
    id: 'inc_email2',
    title: '邮件发送服务异常',
    status: 'in_progress',
    priority: 'high',
    timestamp: new Date('2024-01-20T16:15:00'),
    involvedEntities: [
      { type: 'product', value: '邮件服务系统' },
      { type: 'customer', value: '多名客户' }
    ],
    aiAnalysis: {
      confidence: 95,
      summary: 'SMTP服务器出现连接超时问题，导致过去1小时内邮件发送成功率从99%下降至45%。影响营销邮件和系统通知邮件的正常发送。',
      keyMetrics: [
        { label: '影响邮件数', value: '2,340封' },
        { label: '发送成功率', value: '45%' },
        { label: '服务可用性', value: '不稳定' },
        { label: '预计修复时间', value: '1.5小时' }
      ]
    },
    suggestedResponsePlan: mockEmailResponseActions2,
    processingHistory: mockEmailActivities2,
    assignedTasks: allMockTasks.filter(task => task.parentIncidentId === 'inc_email2')
  },
  {
    id: 'inc_email3',
    title: '邮件退订率异常增长',
    status: 'pending_human',
    priority: 'medium',
    timestamp: new Date('2024-01-20T17:05:00'),
    involvedEntities: [
      { type: 'customer', value: '订阅用户' },
      { type: 'product', value: '营销邮件系统' }
    ],
    aiAnalysis: {
      confidence: 80,
      summary: '过去24小时内邮件退订率比平时增长了180%。AI分析显示主要原因是邮件发送频率过高和内容相关性不足。建议优化邮件策略。',
      keyMetrics: [
        { label: '退订用户数', value: '456人' },
        { label: '退订率增长', value: '+180%' },
        { label: '主要原因', value: '频率过高' },
        { label: '内容相关性', value: '较低' }
      ]
    },
    suggestedResponsePlan: mockEmailResponseActions3,
    processingHistory: mockEmailActivities3,
    assignedTasks: allMockTasks.filter(task => task.parentIncidentId === 'inc_email3')
  }
];

// Mock events (raw events that get processed into incidents)
export const mockEvents: Event[] = [
  {
    id: 'evt1',
    type: 'order_cancelled',
    timestamp: new Date('2024-01-20T14:25:00'),
    data: {
      orderId: 'ORD-2024-001237',
      customerId: 'CUST-456',
      amount: 12999,
      reason: 'user_requested'
    }
  },
  {
    id: 'evt2', 
    type: 'payment_failed',
    timestamp: new Date('2024-01-20T13:10:00'),
    data: {
      transactionId: 'TXN-789',
      amount: 299,
      errorCode: 'GATEWAY_TIMEOUT'
    }
  },
  {
    id: 'evt3',
    type: 'user_registered',
    timestamp: new Date('2024-01-20T12:45:00'),
    data: {
      userId: 'USER-1001',
      source: 'organic',
      deviceType: 'mobile'
    }
  },

  // 邮件相关原始事件
  {
    id: 'evt_email1',
    type: 'email_complaint_received',
    timestamp: new Date('2024-01-20T15:40:00'),
    data: {
      customerId: 'CUST-789',
      customerEmail: 'wangms@example.com',
      orderId: 'ORD-2024-001456',
      complaintType: 'product_quality',
      sentiment: 'very_negative',
      subject: '智能手机屏幕显示异常投诉'
    }
  },
  {
    id: 'evt_email2',
    type: 'email_delivery_failed',
    timestamp: new Date('2024-01-20T16:15:00'),
    data: {
      campaignId: 'CAMP-2024-001',
      failedCount: 1240,
      totalCount: 2340,
      errorType: 'smtp_timeout',
      affectedDomains: ['gmail.com', 'qq.com', '163.com']
    }
  },
  {
    id: 'evt_email3',
    type: 'email_unsubscribe_spike',
    timestamp: new Date('2024-01-20T17:05:00'),
    data: {
      campaignId: 'CAMP-2024-002',
      unsubscribeCount: 456,
      normalRate: 0.5,
      currentRate: 1.4,
      primaryReason: 'frequency_too_high'
    }
  },
  {
    id: 'evt_email4',
    type: 'email_bounce_rate_high',
    timestamp: new Date('2024-01-20T14:30:00'),
    data: {
      campaignId: 'CAMP-2024-003',
      bounceRate: 8.5,
      normalRate: 2.1,
      invalidEmails: 234,
      bounceType: 'hard_bounce'
    }
  }
];
