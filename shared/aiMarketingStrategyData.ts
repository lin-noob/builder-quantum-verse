/**
 * AI营销策略数据模型
 * 基于需求文档中的信息结构图和功能结构图
 */

// 策略状态枚举
export type StrategyStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

// 执行模式枚举
export type ExecutionMode = 'SEMI_AUTO' | 'FULL_MANUAL';

// 动作类型枚举
export type ActionType = 'POPUP';

// 触发器类型枚举
export type TriggerType = 'REAL_TIME';

// 比较操作符枚举
export type ComparisonOperator = '=' | '!=' | 'CONTAINS' | 'NOT_CONTAINS' | '>' | '<';

// 触发事件枚举
export type TriggerEventName = 
  // 生命周期
  | 'user_signup' 
  | 'user_login'
  // 浏览互动
  | 'session_start'
  | 'page_view'
  | 'exit_intent'
  // 电商行为
  | 'search'
  | 'view_product'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'start_checkout'
  | 'purchase'
  // 表单沟通
  | 'submit_form'
  | 'newsletter_subscribe';

// 过滤字段类型
export type FilterField = 
  // 页面相关
  | 'page_url'
  | 'page_dwell_time_seconds'
  // 搜索相关
  | 'search_term'
  // 商品相关
  | 'product_name'
  | 'category'
  | 'price'
  | 'cart_total_amount'
  // 表单相关
  | 'form_name';

// 事件过滤条件
export interface EventCondition {
  field: FilterField;
  operator: ComparisonOperator;
  value: string | number;
}

// 触发规则配置
export interface TriggerRuleConfig {
  eventName: TriggerEventName;
  conditions: EventCondition[];
}

// 触发规则
export interface TriggerRule {
  type: TriggerType;
  config: TriggerRuleConfig;
}

// 基础弹窗参数
export interface BaseActionParameters {
  title: string;
  bodyText: string;
  buttonText: string;
  buttonUrl: string;
}

// AI营销策略接口
export interface AIMarketingStrategy {
  // 核心字段
  strategyId: string;
  strategyName: string;
  executionMode: ExecutionMode;
  actionType: ActionType;
  status: StrategyStatus;
  createdAt: string;
  updatedAt: string;

  // AI策略配置
  triggerRule: TriggerRule;
  actionPurpose?: string; // 仅在半自动模式下必填

  // 基础动作参数
  actionParameters: BaseActionParameters; // 重命名为更准确的名称

  // 效果追踪字段
  totalExecutions: number;
  totalInteractions: number;
  totalConversions: number;
}

// 触发事件与过滤字段的映射关系
export const EVENT_FIELD_MAPPING: Record<TriggerEventName, FilterField[]> = {
  'page_view': ['page_url', 'page_dwell_time_seconds'],
  'exit_intent': ['page_url'],
  'search': ['search_term'],
  'view_product': ['product_name', 'category', 'price'],
  'add_to_cart': ['product_name', 'category', 'price', 'cart_total_amount'],
  'remove_from_cart': ['product_name', 'category'],
  'submit_form': ['form_name'],
  // 这些事件本身已足够明确，MVP版本不提供额外过滤字段
  'user_signup': [],
  'user_login': [],
  'session_start': [],
  'start_checkout': [],
  'purchase': [],
  'newsletter_subscribe': []
};

// 事件显示名称映射
export const EVENT_DISPLAY_NAMES: Record<TriggerEventName, string> = {
  'user_signup': '用户注册',
  'user_login': '用户登录',
  'session_start': '开始会话',
  'page_view': '浏览页面',
  'exit_intent': '离开意图',
  'search': '执行搜索',
  'view_product': '查看商品',
  'add_to_cart': '加入购物车',
  'remove_from_cart': '从购物车移除',
  'start_checkout': '开始结账',
  'purchase': '完成购买',
  'submit_form': '提交表单',
  'newsletter_subscribe': '订阅邮件'
};

// 字段显示名称映射
export const FIELD_DISPLAY_NAMES: Record<FilterField, string> = {
  'page_url': '页面地址',
  'page_dwell_time_seconds': '页面停留秒数',
  'search_term': '搜索关键词',
  'product_name': '商品名称',
  'category': '商品品类',
  'price': '商品价格',
  'cart_total_amount': '当前购物车总金额',
  'form_name': '表单名称/ID'
};

// 操作符显示名称映射
export const OPERATOR_DISPLAY_NAMES: Record<ComparisonOperator, string> = {
  '=': '等于',
  '!=': '不等于',
  'CONTAINS': '包含',
  'NOT_CONTAINS': '不包含',
  '>': '大于',
  '<': '小于'
};

// 执行模式显示名称映射
export const EXECUTION_MODE_DISPLAY_NAMES: Record<ExecutionMode, string> = {
  'SEMI_AUTO': '半自动',
  'FULL_MANUAL': '全人工'
};

// 执行模式颜色映射
export const EXECUTION_MODE_COLORS: Record<ExecutionMode, string> = {
  'SEMI_AUTO': 'blue',
  'FULL_MANUAL': 'green'
};

// 状态显示名称映射
export const STATUS_DISPLAY_NAMES: Record<StrategyStatus, string> = {
  'DRAFT': '草稿',
  'ACTIVE': '生效中',
  'ARCHIVED': '已归档'
};

// 状态颜色映射
export const STATUS_COLORS: Record<StrategyStatus, string> = {
  'DRAFT': 'gray',
  'ACTIVE': 'green',
  'ARCHIVED': 'orange'
};

// 生成触发规则摘要文本
export function generateTriggerRuleSummary(triggerRule: TriggerRule): string {
  const eventName = EVENT_DISPLAY_NAMES[triggerRule.config.eventName];
  const conditions = triggerRule.config.conditions;
  
  if (conditions.length === 0) {
    return `当用户${eventName}时`;
  }
  
  const conditionTexts = conditions.map(condition => {
    const fieldName = FIELD_DISPLAY_NAMES[condition.field];
    const operatorName = OPERATOR_DISPLAY_NAMES[condition.operator];
    return `${fieldName}${operatorName}${condition.value}`;
  });
  
  return `当用户${eventName}并且${conditionTexts.join('且')}时`;
}

// 计算转化率
export function calculateConversionRate(totalExecutions: number, totalConversions: number): number {
  if (totalExecutions === 0) return 0;
  return Math.round((totalConversions / totalExecutions) * 100 * 100) / 100;
}

// 计算互动率
export function calculateInteractionRate(totalExecutions: number, totalInteractions: number): number {
  if (totalExecutions === 0) return 0;
  return Math.round((totalInteractions / totalExecutions) * 100 * 100) / 100;
}

// 示例数据
export const sampleStrategies: AIMarketingStrategy[] = [
  {
    strategyId: 'strat_8j9k0l1m2n',
    strategyName: '高价值购物车挽留策略',
    executionMode: 'SEMI_AUTO',
    actionType: 'POPUP',
    status: 'ACTIVE',
    createdAt: '2025-08-08T17:00:00Z',
    updatedAt: '2025-08-08T17:05:10Z',
    triggerRule: {
      type: 'REAL_TIME',
      config: {
        eventName: 'add_to_cart',
        conditions: [
          {
            field: 'price',
            operator: '>',
            value: 5000
          }
        ]
      }
    },
    actionPurpose: '尽力挽留用户，促使其完成订单',
    actionParameters: {
      title: '请留步！',
      bodyText: '您的专属10%优惠券已生效，完成订单即可使用！',
      buttonText: '完成我的订单',
      buttonUrl: '/checkout'
    },
    totalExecutions: 850,
    totalInteractions: 95,
    totalConversions: 15
  },
  {
    strategyId: 'strat_xyz123abc',
    strategyName: '新用户���册欢迎策略',
    executionMode: 'FULL_MANUAL',
    actionType: 'POPUP',
    status: 'ACTIVE',
    createdAt: '2025-08-10T10:30:00Z',
    updatedAt: '2025-08-10T10:30:00Z',
    triggerRule: {
      type: 'REAL_TIME',
      config: {
        eventName: 'user_signup',
        conditions: []
      }
    },
    actionParameters: {
      title: '欢迎加入我们！',
      bodyText: '感谢您的注册，开启您的购物之旅吧！首次下单可享9折优惠。',
      buttonText: '开始购物',
      buttonUrl: '/products'
    },
    totalExecutions: 320,
    totalInteractions: 286,
    totalConversions: 48
  },
  {
    strategyId: 'strat_draft001',
    strategyName: '搜索无结果引导策略',
    executionMode: 'SEMI_AUTO',
    actionType: 'POPUP',
    status: 'DRAFT',
    createdAt: '2025-08-12T14:20:00Z',
    updatedAt: '2025-08-12T14:25:00Z',
    triggerRule: {
      type: 'REAL_TIME',
      config: {
        eventName: 'search',
        conditions: [
          {
            field: 'search_term',
            operator: 'CONTAINS',
            value: '无结果'
          }
        ]
      }
    },
    actionPurpose: '帮助用户找到相关产品，提升用户体验',
    actionParameters: {
      title: '没找到合适的商品？',
      bodyText: '让我们为您推荐一些热门商品，或联系客服获得帮助',
      buttonText: '查看推荐',
      buttonUrl: '/recommendations'
    },
    totalExecutions: 0,
    totalInteractions: 0,
    totalConversions: 0
  }
];
