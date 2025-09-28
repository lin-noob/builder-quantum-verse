import { Task, TeamMember, WorkloadAnalysis, ColorBy } from '@shared/types';

// 扩展的团队成员数据
export const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: '张明',
    avatarUrl: '',
    role: 'Senior Analyst', 
    capacity: 100,
    currentLoad: 110,
    workloadPercentage: 110,
    status: 'overloaded'
  },
  {
    id: '2',
    name: '李小红',
    avatarUrl: '',
    role: 'Customer Success Manager',
    capacity: 100,
    currentLoad: 85,
    workloadPercentage: 85,
    status: 'healthy'
  },
  {
    id: '3',
    name: '王大伟',
    avatarUrl: '',
    role: 'Technical Support Lead',
    capacity: 100,
    currentLoad: 90,
    workloadPercentage: 90,
    status: 'healthy'
  },
  {
    id: '4',
    name: '赵志华',
    avatarUrl: '',
    role: 'Product Manager',
    capacity: 100,
    currentLoad: 40,
    workloadPercentage: 40,
    status: 'underutilized'
  },
  {
    id: '5',
    name: '刘晓燕',
    avatarUrl: '',
    role: 'Data Analyst',
    capacity: 100,
    currentLoad: 75,
    workloadPercentage: 75,
    status: 'healthy'
  }
];

// 生成今天的日期基准
const today = new Date();
const currentMonth = today.getMonth();
const currentYear = today.getFullYear();

// 辅助函数：创建日期
const createDate = (day: number, hour: number, minute: number = 0, monthOffset: number = 0) => {
  return new Date(currentYear, currentMonth + monthOffset, day, hour, minute);
};

// 丰富的团队日程任务数据 - 覆盖整个月份
export const teamCalendarTasks: Task[] = [
  // === 本周任务 (当前周) ===
  
  // 张明的任务 - 工作过载
  {
    id: 't-cal-1',
    title: '电话回访阳光集团',
    status: 'pending',
    assignee: teamMembers[0],
    parentIncidentId: 'inc-ai-1',
    scheduledTime: {
      start: createDate(today.getDate(), 9, 0),
      end: createDate(today.getDate(), 9, 30)
    },
    source: 'EIP',
    parentIncidentPriority: 'high',
    taskType: 'call',
    workloadPoints: 15,
    context: {
      incidentTitle: '客户流失预警',
      customerName: '阳光集团'
    }
  },
  {
    id: 't-cal-2',
    title: '产品团队例会',
    status: 'pending',
    assignee: teamMembers[0],
    parentIncidentId: 'external-1',
    scheduledTime: {
      start: createDate(today.getDate(), 15, 0),
      end: createDate(today.getDate(), 16, 0)
    },
    source: 'external',
    parentIncidentPriority: 'low',
    taskType: 'generic',
    workloadPoints: 10
  },
  {
    id: 't-cal-3',
    title: '客户数据分析报告',
    status: 'pending',
    assignee: teamMembers[0],
    parentIncidentId: 'inc-ai-6',
    scheduledTime: {
      start: createDate(today.getDate() + 1, 9, 0),
      end: createDate(today.getDate() + 1, 11, 0)
    },
    source: 'EIP',
    parentIncidentPriority: 'medium',
    taskType: 'report',
    workloadPoints: 25,
    context: {
      incidentTitle: '月度数据分析',
      customerName: '多个客户'
    }
  },
  {
    id: 't-cal-4',
    title: '与华为云对接技术评审',
    status: 'pending',
    assignee: teamMembers[0],
    parentIncidentId: 'inc-ai-12',
    scheduledTime: {
      start: createDate(today.getDate() + 1, 14, 0),
      end: createDate(today.getDate() + 1, 15, 30)
    },
    source: 'EIP',
    parentIncidentPriority: 'high',
    taskType: 'call',
    workloadPoints: 20,
    context: {
      incidentTitle: '技术集成问题',
      customerName: '华为云'
    }
  },

  // 李小红的任务 - 健康状态
  {
    id: 't-cal-5',
    title: '向远见科技发送续约合同',
    status: 'pending',
    assignee: teamMembers[1],
    parentIncidentId: 'inc-ai-2',
    scheduledTime: {
      start: createDate(today.getDate(), 11, 0),
      end: createDate(today.getDate(), 12, 0)
    },
    source: 'EIP',
    parentIncidentPriority: 'medium',
    taskType: 'email',
    workloadPoints: 20,
    context: {
      incidentTitle: '续约机会提醒',
      customerName: '远见科技'
    }
  },
  {
    id: 't-cal-6',
    title: '客户成功团队例会',
    status: 'pending',
    assignee: teamMembers[1],
    parentIncidentId: 'external-2',
    scheduledTime: {
      start: createDate(today.getDate() + 1, 14, 0),
      end: createDate(today.getDate() + 1, 15, 0)
    },
    source: 'external',
    parentIncidentPriority: 'low',
    taskType: 'generic',
    workloadPoints: 8
  },
  {
    id: 't-cal-7',
    title: '客户满意度调查',
    status: 'pending',
    assignee: teamMembers[1],
    parentIncidentId: 'inc-ai-7',
    scheduledTime: {
      start: createDate(today.getDate() + 2, 10, 0),
      end: createDate(today.getDate() + 2, 11, 30)
    },
    source: 'EIP',
    parentIncidentPriority: 'medium',
    taskType: 'call',
    workloadPoints: 18
  },

  // 王大伟的任务 - 技术支持
  {
    id: 't-cal-8',
    title: '处理风驰物流紧急工单',
    status: 'pending',
    assignee: teamMembers[2],
    parentIncidentId: 'inc-ai-3',
    scheduledTime: {
      start: createDate(today.getDate(), 13, 0),
      end: createDate(today.getDate(), 14, 30)
    },
    source: 'EIP',
    parentIncidentPriority: 'high',
    taskType: 'generic',
    workloadPoints: 30,
    context: {
      incidentTitle: 'SLA预警',
      customerName: '风驰物流'
    }
  },
  {
    id: 't-cal-9',
    title: '技术架构评审',
    status: 'pending',
    assignee: teamMembers[2],
    parentIncidentId: 'external-3',
    scheduledTime: {
      start: createDate(today.getDate() + 1, 16, 0),
      end: createDate(today.getDate() + 1, 17, 30)
    },
    source: 'external',
    parentIncidentPriority: 'low',
    taskType: 'generic',
    workloadPoints: 15
  },

  // === 上周任务 (过去的任务) ===
  {
    id: 't-cal-10',
    title: '京东商城API对接',
    status: 'completed',
    assignee: teamMembers[2],
    parentIncidentId: 'inc-ai-13',
    scheduledTime: {
      start: createDate(today.getDate() - 7, 9, 0),
      end: createDate(today.getDate() - 7, 12, 0)
    },
    source: 'EIP',
    parentIncidentPriority: 'high',
    taskType: 'generic',
    workloadPoints: 35,
    context: {
      incidentTitle: '第三方集成',
      customerName: '京东商城'
    }
  },
  {
    id: 't-cal-11',
    title: '周度团队回顾会议',
    status: 'completed',
    assignee: teamMembers[1],
    parentIncidentId: 'external-4',
    scheduledTime: {
      start: createDate(today.getDate() - 6, 15, 0),
      end: createDate(today.getDate() - 6, 16, 30)
    },
    source: 'external',
    parentIncidentPriority: 'low',
    taskType: 'generic',
    workloadPoints: 12
  },
  {
    id: 't-cal-12',
    title: '腾讯云服务器迁移',
    status: 'completed',
    assignee: teamMembers[2],
    parentIncidentId: 'inc-ai-14',
    scheduledTime: {
      start: createDate(today.getDate() - 5, 20, 0),
      end: createDate(today.getDate() - 4, 2, 0)
    },
    source: 'EIP',
    parentIncidentPriority: 'high',
    taskType: 'generic',
    workloadPoints: 40,
    context: {
      incidentTitle: '基础设施升级',
      customerName: '腾讯云'
    }
  },

  // === 下周任务 (未来一周) ===
  {
    id: 't-cal-13',
    title: '阿里巴巴合作伙伴会议',
    status: 'pending',
    assignee: teamMembers[1],
    parentIncidentId: 'external-5',
    scheduledTime: {
      start: createDate(today.getDate() + 7, 10, 0),
      end: createDate(today.getDate() + 7, 11, 30)
    },
    source: 'external',
    parentIncidentPriority: 'medium',
    taskType: 'generic',
    workloadPoints: 18
  },
  {
    id: 't-cal-14',
    title: '月度安全审计报告',
    status: 'pending',
    assignee: teamMembers[4],
    parentIncidentId: 'inc-ai-15',
    scheduledTime: {
      start: createDate(today.getDate() + 8, 9, 0),
      end: createDate(today.getDate() + 8, 17, 0)
    },
    source: 'EIP',
    parentIncidentPriority: 'high',
    taskType: 'report',
    workloadPoints: 45,
    context: {
      incidentTitle: '安全合规检查',
      customerName: '监管部门'
    }
  },

  // === 本月其他任务 ===
  {
    id: 't-cal-15',
    title: '字节跳动技术分享',
    status: 'pending',
    assignee: teamMembers[2],
    parentIncidentId: 'external-6',
    scheduledTime: {
      start: createDate(15, 14, 0),
      end: createDate(15, 16, 0)
    },
    source: 'external',
    parentIncidentPriority: 'low',
    taskType: 'generic',
    workloadPoints: 15
  },
  {
    id: 't-cal-16',
    title: '百度AI接口调试',
    status: 'pending',
    assignee: teamMembers[0],
    parentIncidentId: 'inc-ai-16',
    scheduledTime: {
      start: createDate(16, 10, 0),
      end: createDate(16, 12, 0)
    },
    source: 'EIP',
    parentIncidentPriority: 'medium',
    taskType: 'generic',
    workloadPoints: 22,
    context: {
      incidentTitle: 'AI服务集成',
      customerName: '百度AI'
    }
  },
  {
    id: 't-cal-17',
    title: '小米生态链商务洽谈',
    status: 'pending',
    assignee: teamMembers[1],
    parentIncidentId: 'inc-ai-17',
    scheduledTime: {
      start: createDate(17, 9, 30),
      end: createDate(17, 11, 0)
    },
    source: 'EIP',
    parentIncidentPriority: 'high',
    taskType: 'call',
    workloadPoints: 25,
    context: {
      incidentTitle: '商务拓展机会',
      customerName: '小米生态链'
    }
  },

  // === 日常重复性任务 ===
  {
    id: 't-cal-18',
    title: '每日站会',
    status: 'pending',
    assignee: teamMembers[3],
    parentIncidentId: 'external-daily-1',
    scheduledTime: {
      start: createDate(today.getDate(), 9, 0),
      end: createDate(today.getDate(), 9, 30)
    },
    source: 'external',
    parentIncidentPriority: 'low',
    taskType: 'generic',
    workloadPoints: 5
  },
  {
    id: 't-cal-19',
    title: '每日站会',
    status: 'pending',
    assignee: teamMembers[3],
    parentIncidentId: 'external-daily-2',
    scheduledTime: {
      start: createDate(today.getDate() + 1, 9, 0),
      end: createDate(today.getDate() + 1, 9, 30)
    },
    source: 'external',
    parentIncidentPriority: 'low',
    taskType: 'generic',
    workloadPoints: 5
  },
  {
    id: 't-cal-20',
    title: '每日站会',
    status: 'pending',
    assignee: teamMembers[3],
    parentIncidentId: 'external-daily-3',
    scheduledTime: {
      start: createDate(today.getDate() + 2, 9, 0),
      end: createDate(today.getDate() + 2, 9, 30)
    },
    source: 'external',
    parentIncidentPriority: 'low',
    taskType: 'generic',
    workloadPoints: 5
  },

  // === 更多客户任务 ===
  {
    id: 't-cal-21',
    title: '美团外卖数据同步',
    status: 'pending',
    assignee: teamMembers[4],
    parentIncidentId: 'inc-ai-18',
    scheduledTime: {
      start: createDate(today.getDate() + 3, 14, 0),
      end: createDate(today.getDate() + 3, 16, 30)
    },
    source: 'EIP',
    parentIncidentPriority: 'medium',
    taskType: 'generic',
    workloadPoints: 28,
    context: {
      incidentTitle: '数据集成项目',
      customerName: '美团外卖'
    }
  },
  {
    id: 't-cal-22',
    title: '滴滴出行API优化',
    status: 'pending',
    assignee: teamMembers[2],
    parentIncidentId: 'inc-ai-19',
    scheduledTime: {
      start: createDate(today.getDate() + 4, 10, 0),
      end: createDate(today.getDate() + 4, 12, 0)
    },
    source: 'EIP',
    parentIncidentPriority: 'high',
    taskType: 'generic',
    workloadPoints: 30,
    context: {
      incidentTitle: '性能优化',
      customerName: '滴滴出行'
    }
  },
  {
    id: 't-cal-23',
    title: '网易云音乐推荐算法调研',
    status: 'pending',
    assignee: teamMembers[4],
    parentIncidentId: 'inc-ai-20',
    scheduledTime: {
      start: createDate(today.getDate() + 5, 9, 0),
      end: createDate(today.getDate() + 5, 11, 30)
    },
    source: 'EIP',
    parentIncidentPriority: 'low',
    taskType: 'report',
    workloadPoints: 20,
    context: {
      incidentTitle: '算法研究',
      customerName: '网易云音乐'
    }
  },

  // === 更多邮件和电话任务 ===
  {
    id: 't-cal-24',
    title: '新浪微博合作邮件跟进',
    status: 'pending',
    assignee: teamMembers[1],
    parentIncidentId: 'inc-ai-21',
    scheduledTime: {
      start: createDate(today.getDate() + 6, 15, 0),
      end: createDate(today.getDate() + 6, 15, 30)
    },
    source: 'EIP',
    parentIncidentPriority: 'medium',
    taskType: 'email',
    workloadPoints: 8,
    context: {
      incidentTitle: '合作洽谈',
      customerName: '新浪微博'
    }
  },
  {
    id: 't-cal-25',
    title: '快手短视频API问题电话会议',
    status: 'pending',
    assignee: teamMembers[2],
    parentIncidentId: 'inc-ai-22',
    scheduledTime: {
      start: createDate(today.getDate() + 7, 16, 0),
      end: createDate(today.getDate() + 7, 17, 0)
    },
    source: 'EIP',
    parentIncidentPriority: 'high',
    taskType: 'call',
    workloadPoints: 15,
    context: {
      incidentTitle: '技术故障排查',
      customerName: '快手短视频'
    }
  },

  // === 长期项目和报告 ===
  {
    id: 't-cal-26',
    title: '京东物流智能仓储解决方案',
    status: 'pending',
    assignee: teamMembers[3],
    parentIncidentId: 'inc-ai-23',
    scheduledTime: {
      start: createDate(20, 9, 0),
      end: createDate(22, 18, 0)
    },
    source: 'EIP',
    parentIncidentPriority: 'high',
    taskType: 'report',
    workloadPoints: 80,
    context: {
      incidentTitle: '大型项目方案',
      customerName: '京东物流'
    }
  },
  {
    id: 't-cal-27',
    title: '蚂蚁金服区块链技术评估',
    status: 'pending',
    assignee: teamMembers[0],
    parentIncidentId: 'inc-ai-24',
    scheduledTime: {
      start: createDate(25, 13, 0),
      end: createDate(25, 17, 0)
    },
    source: 'EIP',
    parentIncidentPriority: 'medium',
    taskType: 'report',
    workloadPoints: 35,
    context: {
      incidentTitle: '技术可行性研究',
      customerName: '蚂蚁金服'
    }
  },

  // === 培训和学习任务 ===
  {
    id: 't-cal-28',
    title: 'AWS云服务培训',
    status: 'pending',
    assignee: teamMembers[2],
    parentIncidentId: 'external-training-1',
    scheduledTime: {
      start: createDate(18, 9, 0),
      end: createDate(18, 17, 0)
    },
    source: 'external',
    parentIncidentPriority: 'low',
    taskType: 'generic',
    workloadPoints: 40
  },
  {
    id: 't-cal-29',
    title: 'Kubernetes容器编排学习',
    status: 'pending',
    assignee: teamMembers[2],
    parentIncidentId: 'external-training-2',
    scheduledTime: {
      start: createDate(19, 14, 0),
      end: createDate(19, 16, 0)
    },
    source: 'external',
    parentIncidentPriority: 'low',
    taskType: 'generic',
    workloadPoints: 15
  },

  // === 更多企业客户任务 ===
  {
    id: 't-cal-30',
    title: '中国移动5G项目对接',
    status: 'pending',
    assignee: teamMembers[1],
    parentIncidentId: 'inc-ai-25',
    scheduledTime: {
      start: createDate(21, 10, 0),
      end: createDate(21, 12, 0)
    },
    source: 'EIP',
    parentIncidentPriority: 'high',
    taskType: 'call',
    workloadPoints: 30,
    context: {
      incidentTitle: '5G技术合作',
      customerName: '中国移动'
    }
  },
  {
    id: 't-cal-31',
    title: '中国银行数字化转型咨询',
    status: 'pending',
    assignee: teamMembers[3],
    parentIncidentId: 'inc-ai-26',
    scheduledTime: {
      start: createDate(23, 14, 0),
      end: createDate(23, 16, 30)
    },
    source: 'EIP',
    parentIncidentPriority: 'high',
    taskType: 'generic',
    workloadPoints: 40,
    context: {
      incidentTitle: '数字化咨询项目',
      customerName: '中国银行'
    }
  },

  // === 月末总结和规划 ===
  {
    id: 't-cal-32',
    title: '月度工作总结会议',
    status: 'pending',
    assignee: teamMembers[3],
    parentIncidentId: 'external-monthly-1',
    scheduledTime: {
      start: createDate(28, 15, 0),
      end: createDate(28, 17, 0)
    },
    source: 'external',
    parentIncidentPriority: 'medium',
    taskType: 'generic',
    workloadPoints: 20
  },
  {
    id: 't-cal-33',
    title: '下月工作计划制定',
    status: 'pending',
    assignee: teamMembers[3],
    parentIncidentId: 'external-monthly-2',
    scheduledTime: {
      start: createDate(29, 10, 0),
      end: createDate(29, 12, 0)
    },
    source: 'external',
    parentIncidentPriority: 'medium',
    taskType: 'generic',
    workloadPoints: 25
  },

  // === 下个月初的任务 ===
  {
    id: 't-cal-34',
    title: '华为鸿蒙系统适配',
    status: 'pending',
    assignee: teamMembers[2],
    parentIncidentId: 'inc-ai-27',
    scheduledTime: {
      start: createDate(3, 9, 0, 1),
      end: createDate(5, 18, 0, 1)
    },
    source: 'EIP',
    parentIncidentPriority: 'high',
    taskType: 'generic',
    workloadPoints: 60,
    context: {
      incidentTitle: '系统适配项目',
      customerName: '华为鸿蒙'
    }
  },
  {
    id: 't-cal-35',
    title: 'OPPO Find X系列测试',
    status: 'pending',
    assignee: teamMembers[2],
    parentIncidentId: 'inc-ai-28',
    scheduledTime: {
      start: createDate(8, 14, 0, 1),
      end: createDate(8, 17, 0, 1)
    },
    source: 'EIP',
    parentIncidentPriority: 'medium',
    taskType: 'generic',
    workloadPoints: 25,
    context: {
      incidentTitle: '设备兼容性测试',
      customerName: 'OPPO'
    }
  }
];

// 工作负载分析数据
export const workloadAnalysis: WorkloadAnalysis = {
  totalLoad: teamMembers.reduce((sum, member) => sum + member.currentLoad, 0),
  totalCapacity: teamMembers.reduce((sum, member) => sum + member.capacity, 0),
  percentage: 85, // 85% 团队负载
  status: 'healthy',
  overloadedMembers: teamMembers.filter(member => member.status === 'overloaded'),
  underutilizedMembers: teamMembers.filter(member => member.status === 'underutilized')
};

// AI建议的新排期任务 (虚拟任务，用于演示AI建议功能)
export const aiSuggestedTasks: Task[] = [
  {
    id: 't-ai-suggest-1',
    title: '重新分配: 客户数据分析报告',
    status: 'pending',
    assignee: teamMembers[4], // 分配给刘晓燕(资源利用不足)
    parentIncidentId: 'inc-ai-6',
    scheduledTime: {
      start: createDate(today.getDate() + 1, 10, 0),
      end: createDate(today.getDate() + 1, 12, 0)
    },
    source: 'EIP',
    parentIncidentPriority: 'medium',
    taskType: 'report',
    workloadPoints: 25,
    context: {
      incidentTitle: 'AI建议重新分配',
      customerName: '多个客户'
    }
  },
  {
    id: 't-ai-suggest-2',
    title: '协助处理: 紧急工单',
    status: 'pending',
    assignee: teamMembers[3], // 分配给赵志华
    parentIncidentId: 'inc-ai-3',
    scheduledTime: {
      start: createDate(today.getDate(), 14, 30),
      end: createDate(today.getDate(), 15, 30)
    },
    source: 'EIP',
    parentIncidentPriority: 'high',
    taskType: 'generic',
    workloadPoints: 20
  },
  {
    id: 't-ai-suggest-3',
    title: '优化分配: 百度AI接口调试',
    status: 'pending',
    assignee: teamMembers[4], // 分配给刘晓燕
    parentIncidentId: 'inc-ai-16',
    scheduledTime: {
      start: createDate(16, 14, 0),
      end: createDate(16, 16, 0)
    },
    source: 'EIP',
    parentIncidentPriority: 'medium',
    taskType: 'generic',
    workloadPoints: 22,
    context: {
      incidentTitle: 'AI建议优化分配',
      customerName: '百度AI'
    }
  }
];

// 颜色配置 - 使用柔和、低饱和度的颜色
export const colorConfigs = {
  assignee: {
    [teamMembers[0].id]: '#A5B4FC', // 张明 - 柔和靛蓝
    [teamMembers[1].id]: '#FCA5A5', // 李小红 - 柔和玫瑰
    [teamMembers[2].id]: '#93C5FD', // 王大伟 - 柔和蓝色
    [teamMembers[3].id]: '#86EFAC', // 赵志华 - 柔和绿色
    [teamMembers[4].id]: '#FCD34D'  // 刘晓燕 - 柔和琥珀
  },
  incident_priority: {
    high: '#FCA5A5',   // 柔和红色
    medium: '#FCD34D', // 柔和琥珀
    low: '#9CA3AF'     // 柔和灰色
  },
  task_type: {
    call: '#93C5FD',     // 柔和蓝色
    email: '#86EFAC',    // 柔和绿色
    report: '#A5B4FC',   // 柔和靛蓝
    generic: '#9CA3AF'   // 柔和灰色
  }
};

// 深色边框颜色配置（用于事件左边框）
export const borderColorConfigs = {
  assignee: {
    [teamMembers[0].id]: '#6366F1', // 张明 - 靛蓝
    [teamMembers[1].id]: '#F43F5E', // 李小红 - 玫瑰
    [teamMembers[2].id]: '#3B82F6', // 王大伟 - 蓝色
    [teamMembers[3].id]: '#10B981', // 赵志华 - 绿色
    [teamMembers[4].id]: '#F59E0B'  // 刘晓燕 - 琥珀
  },
  incident_priority: {
    high: '#EF4444',   // 红色
    medium: '#F59E0B', // 琥珀
    low: '#6B7280'     // 灰色
  },
  task_type: {
    call: '#3B82F6',     // 蓝色
    email: '#10B981',    // 绿色
    report: '#6366F1',   // 靛蓝
    generic: '#6B7280'   // 灰色
  }
};

// 获取团队日程数据的函数
export const getTeamCalendarTasks = () => teamCalendarTasks;
export const getTeamMembers = () => teamMembers;
export const getWorkloadAnalysis = () => workloadAnalysis;
export const getAISuggestedTasks = () => aiSuggestedTasks;

// 根据颜色依据获取任务颜色
export const getTaskColor = (task: Task, colorBy: ColorBy): string => {
  switch (colorBy) {
    case 'assignee':
      return colorConfigs.assignee[task.assignee.id] || '#9CA3AF';
    case 'incident_priority':
      return colorConfigs.incident_priority[task.parentIncidentPriority || 'low'];
    case 'task_type':
      return colorConfigs.task_type[task.taskType || 'generic'];
    default:
      return '#9CA3AF';
  }
};

// 根据颜色依据获取任务边框颜色
export const getTaskBorderColor = (task: Task, colorBy: ColorBy): string => {
  switch (colorBy) {
    case 'assignee':
      return borderColorConfigs.assignee[task.assignee.id] || '#6B7280';
    case 'incident_priority':
      return borderColorConfigs.incident_priority[task.parentIncidentPriority || 'low'];
    case 'task_type':
      return borderColorConfigs.task_type[task.taskType || 'generic'];
    default:
      return '#6B7280';
  }
};
