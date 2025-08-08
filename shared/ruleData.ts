// Rule Library Data Types and Mock Data

// Trigger Types
export interface RealTimeEventTrigger {
  type: 'real_time_event';
  eventName: 'user_signup' | 'page_view' | 'add_to_cart' | 'start_checkout' | 'submit_form';
  condition?: {
    field: string;
    operator: '=' | '!=' | 'contains' | 'not_contains' | '>' | '<';
    value: string;
  };
}

export interface UserSegmentTrigger {
  type: 'user_segment';
  segmentRule: {
    field: 'tag' | 'total_spend' | 'total_orders' | 'last_seen_days';
    operator: '=' | '!=' | 'contains' | 'not_contains' | '>' | '<';
    value: string;
  };
  schedule: 'daily' | 'weekly' | 'monthly';
}

export type TriggerConfig = RealTimeEventTrigger | UserSegmentTrigger;

// Action Types
export interface PopupAction {
  type: 'popup';
  title: string;
  content: string;
  buttonText: string;
  buttonLink: string;
}

export interface EmailAction {
  type: 'email';
  subject: string;
  content: string;
  senderName: string;
}

export type ActionConfig = PopupAction | EmailAction;

// Rule Interface
export interface Rule {
  id: string;
  ruleName: string;
  trigger: TriggerConfig;
  action: ActionConfig;
  status: 'draft' | 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

// Event name display mapping
export const EVENT_NAME_DISPLAY = {
  user_signup: '用户注册',
  page_view: '浏览页面',
  add_to_cart: '加入购物车',
  start_checkout: '开始结账',
  submit_form: '提交表单'
};

// Field options for different events
export const EVENT_FIELD_OPTIONS = {
  user_signup: ['用户来源', '注册类型'],
  page_view: ['URL', '页面标题', '访问时长'],
  add_to_cart: ['商品ID', '商品名称', '品类', '价格'],
  start_checkout: ['购物车金额', '商品数量'],
  submit_form: ['表单类型', '表单字段']
};

// Field options for user segments
export const USER_SEGMENT_FIELDS = {
  tag: '用户标签',
  total_spend: '累计消费金额',
  total_orders: '总订单数',
  last_seen_days: '最后访问距今天数'
};

// Schedule display mapping
export const SCHEDULE_DISPLAY = {
  daily: '每天',
  weekly: '每周',
  monthly: '每月'
};

// Helper function to generate trigger summary
export const getTriggerSummary = (trigger: TriggerConfig): string => {
  if (trigger.type === 'real_time_event') {
    const eventDisplay = EVENT_NAME_DISPLAY[trigger.eventName];
    let summary = `实时事件: 当 事件 为 ${eventDisplay} 时`;
    
    if (trigger.condition) {
      summary += ` 且 ${trigger.condition.field} ${trigger.condition.operator} ${trigger.condition.value}`;
    }
    
    return summary;
  } else {
    const fieldDisplay = USER_SEGMENT_FIELDS[trigger.segmentRule.field];
    const scheduleDisplay = SCHEDULE_DISPLAY[trigger.schedule];
    return `用户模式: ${scheduleDisplay} 检查 ${fieldDisplay} ${trigger.segmentRule.operator} ${trigger.segmentRule.value} 的用户`;
  }
};

// Helper function to get action type display
export const getActionTypeDisplay = (action: ActionConfig): string => {
  return action.type === 'popup' ? '网页弹窗' : '发送邮件';
};

// Helper function to get status display
export const getStatusDisplay = (status: 'draft' | 'active' | 'archived') => {
  switch (status) {
    case 'draft':
      return { text: '草稿', color: 'gray' };
    case 'active':
      return { text: '生效中', color: 'green' };
    case 'archived':
      return { text: '已归档', color: 'gray' };
    default:
      return { text: status, color: 'gray' };
  }
};

// Mock data for rules as specified
export const mockRules: Rule[] = [
  {
    id: 'rule-001',
    ruleName: '新用户注册欢迎弹窗',
    trigger: {
      type: 'real_time_event',
      eventName: 'user_signup'
    },
    action: {
      type: 'popup',
      title: '欢迎加入我们！',
      content: '感谢您的注册，开启您的购物之旅吧！',
      buttonText: '开始购物',
      buttonLink: '/products'
    },
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z'
  },
  {
    id: 'rule-002',
    ruleName: '定价页访问挽留邮件',
    trigger: {
      type: 'real_time_event',
      eventName: 'page_view',
      condition: {
        field: 'URL',
        operator: 'contains',
        value: '/pricing'
      }
    },
    action: {
      type: 'email',
      subject: '还在考虑我们的定价方案吗？',
      content: '<p>我们为您准备了专属优惠，让您以更优惠的价格体验我们的服务。</p>',
      senderName: '销售团队'
    },
    status: 'active',
    createdAt: '2024-01-12T09:15:00Z',
    updatedAt: '2024-01-18T16:20:00Z'
  },
  {
    id: 'rule-003',
    ruleName: 'VIP客户月度关怀',
    trigger: {
      type: 'user_segment',
      segmentRule: {
        field: 'tag',
        operator: '=',
        value: 'VIP'
      },
      schedule: 'monthly'
    },
    action: {
      type: 'email',
      subject: 'VIP专属月度福利来啦！',
      content: '<h3>亲爱的VIP客户</h3><p>感谢您的长期支持，本月为您准备了专属礼品和优惠。</p>',
      senderName: 'VIP客户服务'
    },
    status: 'archived',
    createdAt: '2024-01-05T08:30:00Z',
    updatedAt: '2024-01-15T12:00:00Z'
  },
  {
    id: 'rule-004',
    ruleName: '高价商品加购提醒',
    trigger: {
      type: 'real_time_event',
      eventName: 'add_to_cart',
      condition: {
        field: '价格',
        operator: '>',
        value: '1000'
      }
    },
    action: {
      type: 'popup',
      title: '恭喜您选择了优质商品！',
      content: '您选择的商品质量上乘，现在购买还可享受免费安装服务。',
      buttonText: '了解详情',
      buttonLink: '/services'
    },
    status: 'draft',
    createdAt: '2024-01-22T11:45:00Z',
    updatedAt: '2024-01-22T11:45:00Z'
  }
];
