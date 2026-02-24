import { Task, User } from '@shared/types';
import { mockUsers } from './mockData';

// AI工作台任务数据
export const aiWorkstationTasks: Task[] = [
  // 今日焦点 (Today's Focus)
  {
    id: 'ai-t1',
    title: '电话回访阳光集团',
    type: 'call',
    status: 'pending',
    group: 'focus',
    assignee: mockUsers[0], // 张明
    parentIncidentId: 'inc-ai-1',
    context: {
      incidentTitle: '客户流失预警',
      customerName: '阳光集团'
    },
    dueDateDisplay: '今天下午 5:00',
    dueDate: new Date(new Date().setHours(17, 0))
  },
  {
    id: 'ai-t2', 
    title: '为"远见科技"准备续约合同',
    type: 'generic',
    status: 'pending',
    group: 'focus',
    assignee: mockUsers[0], // 张明
    parentIncidentId: 'inc-ai-2',
    context: {
      incidentTitle: '续约机会提醒',
      customerName: '远见科技'
    },
    dueDateDisplay: '今天下午 5:00',
    dueDate: new Date(new Date().setHours(17, 0))
  },

  // 高优紧急 (Urgent & Important)
  {
    id: 'ai-t3',
    title: '处理"风驰物流"的紧急工单', 
    type: 'generic',
    status: 'pending',
    group: 'urgent',
    assignee: mockUsers[0], // 张明
    parentIncidentId: 'inc-ai-3',
    context: {
      incidentTitle: '服务等级协议（SLA）预警',
      customerName: '风驰物流'
    },
    dueDateDisplay: '2小时内',
    dueDate: new Date(new Date().getTime() + 2 * 60 * 60 * 1000)
  },

  // 可批量处理 (Batchable Tasks)
  {
    id: 'ai-t4',
    title: '向"李女士"发送新品介绍邮件',
    type: 'email',
    status: 'pending', 
    group: 'batchable',
    assignee: mockUsers[0], // 张明
    parentIncidentId: 'inc-ai-4',
    context: {
      incidentTitle: '交叉销售机会',
      customerName: '李女士'
    }
  },
  {
    id: 'ai-t5',
    title: '向"王先生"发送新品介绍邮件',
    type: 'email',
    status: 'pending',
    group: 'batchable', 
    assignee: mockUsers[0], // 张明
    parentIncidentId: 'inc-ai-5',
    context: {
      incidentTitle: '交叉销售机会',
      customerName: '王先生'
    }
  }
];

// AI助手模拟内容
export const emailDraftContent = `尊敬的阳光集团负责人，

您好！我是张明，注意到您近期在我们平台的活跃度有所下降，作为您的专属客户经理，我深感关切。

经过分析，我发现可能是由于上月的系统维护影响了您的使用体验。为此，我们特别为您准备了以下补偿方案：

1. 免费延长服务期限3个月
2. 专属技术支持团队一对一服务
3. 新功能优先体验权

我们非常重视与您的合作伙伴关系，希望能够继续为您提供优质服务。如果您有任何疑问或建议，请随时与我联系。

期待您的回复。

此致
敬礼！

张明
客户成功经理
智能企业平台`;

export const talkingPointsContent = [
  '1. **开场**: 表达关切，询问近期业务情况和使用体验。',
  '2. **倾听**: 了解近期活跃度下降的具体原因，记录客户反馈的问题点。',
  '3. **道歉**: 对未及时解决的工单和服务问题表示诚挚歉意。',
  '4. **方案**: 提出针对性的解决方案：免费延期、专属支持、新功能体验。',
  '5. **承诺**: 重申客户的重要性，承诺48小时内解决所有遗留问题。',
  '6. **收尾**: 确认下一步行动计划，约定后续跟进时间。',
  '7. **记录**: 通话后立即更新CRM，设置提醒事项。'
];

// 获取AI工作台任务的函数
export const getMyAITasks = () => aiWorkstationTasks;

// 按分组获取任务
export const getTasksByGroup = (group: 'focus' | 'urgent' | 'batchable' | 'routine') => {
  return aiWorkstationTasks.filter(task => task.group === group);
};

// 任务分组的显示信息
export const taskGroups = {
  focus: {
    title: '今日焦点',
    subtitle: 'Today\'s Focus',
    color: 'purple',
    icon: '🎯'
  },
  urgent: {
    title: '高优紧急', 
    subtitle: 'Urgent & Important',
    color: 'red',
    icon: '⚡'
  },
  batchable: {
    title: '可批量处理',
    subtitle: 'Batchable Tasks', 
    color: 'blue',
    icon: '📦'
  }
};
