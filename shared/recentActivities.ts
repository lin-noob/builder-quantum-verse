export interface RecentActivity {
  id: string;
  type: 'order' | 'user' | 'payment' | 'support';
  icon: string;
  userName: string;
  description: string;
  timestamp: string;
  relativeTime: string;
}

export const mockRecentActivities: RecentActivity[] = [
  {
    id: '1',
    type: 'order',
    icon: '📦',
    userName: '李四',
    description: '完成了订单 #C-1090, 金额 ¥413.10',
    timestamp: '2024-01-22 14:25:00',
    relativeTime: '5分钟前'
  },
  {
    id: '2',
    type: 'user',
    icon: '👤',
    userName: '张三',
    description: '通过Google搜索注册',
    timestamp: '2024-01-22 14:18:00',
    relativeTime: '12分钟前'
  },
  {
    id: '3',
    type: 'payment',
    icon: '💳',
    userName: '王五',
    description: '支付失败，订单 #C-1089',
    timestamp: '2024-01-22 14:10:00',
    relativeTime: '20分钟前'
  },
  {
    id: '4',
    type: 'order',
    icon: '📦',
    userName: '赵六',
    description: '完成了订单 #C-1088, 金额 ¥1,256.50',
    timestamp: '2024-01-22 14:05:00',
    relativeTime: '25分钟前'
  },
  {
    id: '5',
    type: 'support',
    icon: '💬',
    userName: '陈七',
    description: '提交了技术支持请求',
    timestamp: '2024-01-22 13:58:00',
    relativeTime: '32分钟前'
  },
  {
    id: '6',
    type: 'user',
    icon: '👤',
    userName: '刘八',
    description: '通过社交媒体注册',
    timestamp: '2024-01-22 13:50:00',
    relativeTime: '40分钟前'
  },
  {
    id: '7',
    type: 'order',
    icon: '📦',
    userName: '黄九',
    description: '完成了订单 #C-1087, 金额 ¥89.99',
    timestamp: '2024-01-22 13:42:00',
    relativeTime: '48分钟前'
  },
  {
    id: '8',
    type: 'payment',
    icon: '💳',
    userName: '周十',
    description: '成功支付订单 #C-1086',
    timestamp: '2024-01-22 13:35:00',
    relativeTime: '55分钟前'
  }
];

export const getRecentActivities = () => mockRecentActivities;
