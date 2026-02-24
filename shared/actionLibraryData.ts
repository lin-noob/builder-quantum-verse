// 响应动作库数据类型和模拟数据
// 根据提示词要求重新设计

// AI监控范围类型
export type MonitoringScope = 'real_time_event' | 'user_mode';

// 状态类型
export type ActionStatus = 'draft' | 'active' | 'archived';

// 弹窗配置接口
export interface PopupConfig {
  title: string;     // 弹窗标题
  content: string;   // 弹窗正文
  buttonText: string; // 按钮文字
  buttonLink: string; // 按钮链接
}

// AI动作数据接口
export interface ActionData {
  id: string;
  name: string;                    // 动作名称
  status: ActionStatus;            // 状态
  purpose: string;                 // 响应动作用途
  totalExecutions: number;         // 总执行次数
  conversions: number;             // 转化数
  interactions: number;            // 互动次数
  lastUpdated: string;            // 最后更新时间
  createdAt: string;              // 创建时间
  monitoringScope: MonitoringScope; // AI监控范围
  popup: PopupConfig;             // 弹窗内容配置
}

// 状态显示映射
export const STATUS_DISPLAY = {
  draft: { text: '草稿', color: 'gray' },
  active: { text: '生效中', color: 'green' },
  archived: { text: '已归档', color: 'gray' }
};

// 监控范围显示映射
export const MONITORING_SCOPE_DISPLAY = {
  real_time_event: '实时事件',
  user_mode: '用户模式'
};

// 格式化数字为千分位格式
export const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

// 计算转化率
export const calculateConversionRate = (conversions: number, interactions: number): string => {
  if (interactions === 0) return '0%';
  return ((conversions / interactions) * 100).toFixed(1) + '%';
};

// 根据提示词要求的精确模拟数据
export const actionsData: ActionData[] = [
  {
    id: 'rule-001',
    name: '新用户首次访问欢迎',
    status: 'active',
    purpose: '当用户注册时',
    totalExecutions: 2845,
    conversions: 524,
    interactions: 1967,
    lastUpdated: '2024/01/20 22:30',
    createdAt: '2024/01/15 18:00',
    monitoringScope: 'real_time_event',
    popup: {
      title: '欢迎加入我们！',
      content: '感谢您的注册，开启您的购物之旅吧！',
      buttonText: '开始购物',
      buttonLink: '/products'
    }
  },
  {
    id: 'rule-002',
    name: '高价值用户放弃购物车挽留',
    status: 'active',
    purpose: '挽留放弃购物车的用户',
    totalExecutions: 1250,
    conversions: 112,
    interactions: 892,
    lastUpdated: '2025-08-10 14:30',
    createdAt: '2024/01/12 09:15',
    monitoringScope: 'real_time_event',
    popup: {
      title: '还在考虑吗？',
      content: '您购物车中的商品很受欢迎，为您保留10分钟',
      buttonText: '完成购买',
      buttonLink: '/checkout'
    }
  },
  {
    id: 'rule-003',
    name: '潜在流失用户唤醒',
    status: 'archived',
    purpose: '针对超过30天未访问的高价值用户进行唤醒',
    totalExecutions: 850,
    conversions: 34,
    interactions: 245,
    lastUpdated: '2025-08-05 18:00',
    createdAt: '2024/01/05 08:30',
    monitoringScope: 'user_mode',
    popup: {
      title: '我们想念您了！',
      content: '回来看看新产品，专属优惠等着您',
      buttonText: '查看优惠',
      buttonLink: '/offers'
    }
  },
  {
    id: 'rule-004',
    name: '浏览高价商品激励',
    status: 'draft',
    purpose: '当用户对高价商品表现出犹豫时进行激励',
    totalExecutions: 0,
    conversions: 0,
    interactions: 0,
    lastUpdated: '2025-08-11 09:15',
    createdAt: '2025-08-11 09:15',
    monitoringScope: 'real_time_event',
    popup: {
      title: '限时优惠！',
      content: '此商品今日限时8折，机会难得',
      buttonText: '立即购买',
      buttonLink: '/products/special'
    }
  }
];

// 常用用途建议
export const COMMON_PURPOSES = [
  '当用户注册时',
  '挽留放弃购物车的用户',
  '针对高价值用户进行激励'
];
