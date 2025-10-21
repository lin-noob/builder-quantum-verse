export type User = {
  id: string;
  name: string;
  avatarUrl: string;
  role: string;
};

export type Tag = {
  name: string;
  color: string;
};

// 原始事件
export type Event = {
  id: string;
  type: string;
  timestamp: Date;
  data: object;
};

// AI分析后形成的"案例"
export type Incident = {
  id: string;
  title?: string; // 对应 eventName
  /** 事件简要描述 */
  description?: string;
  status: 'pending_human' | 'in_progress' | 'resolved' | 'automated' | 'open';
  priority: 'high' | 'medium' | 'low';
  timestamp: Date;
  involvedEntities?: {
    type: 'customer' | 'product' | 'order';
    value: string;
  }[];
  aiAnalysis?: {
    confidence: number; // 0-100
    summary: string;
    keyMetrics: {
      label: string;
      value: string;
    }[];
  };
  suggestedResponsePlan?: ResponseAction[];
  processingHistory?: Activity[];
  assignedTasks?: Task[];

  // 后端接口返回的字段
  gmtCreate?: string;
  gmtModified?: string;
  eventId?: string;
  originalEventId?: string;
  eventType?: string;
  complaintType?: string;
  source?: string;
  customerEmail?: string;
  orderId?: string;
  emotion?: string;
  emotionScore?: number | null;
  eventTime?: string;
  createdAt?: string;
  updatedAt?: string;
  handledBy?: string | null;
  remark?: string | null;
  tags?: string | null;
  extendData?: string | null;
  companyId?: string;
  eventName?: string;
};

// 建议的响应动作
export type ResponseAction = {
  id: string;
  title: string;
  description: string;
  type: 'communication' | 'process' | 'data_enrichment';
};

// 具体的、可追踪的任务
export type Task = {
  id: string;
  title: string;
  status: 'pending' | 'completed';
  assignee: User;
  parentIncidentId: string;
  dueDate?: Date;
  scheduledTime?: {
    start: Date;
    end: Date;
  };
  // AI工作台增强字段
  type?: 'email' | 'call' | 'generic'; // 任务类型，决定显示哪个AI助手按钮（保持向后兼容）
  group?: 'focus' | 'urgent' | 'batchable' | 'routine'; // AI智能分组
  context?: {
    incidentTitle: string;
    customerName: string;
  };
  dueDateDisplay?: string; // 显示友好的截止时间，如"今天下午 5:00"

  // AI指挥中心增强字段
  source?: 'EIP' | 'external'; // 任务来源，用于区分内部任务和外部会议
  parentIncidentPriority?: 'high' | 'medium' | 'low'; // 继承自父案例的优先级
  taskType?: 'call' | 'email' | 'report' | 'generic'; // 任务的具体类型
  workloadPoints?: number; // 工作负载点数，用于计算团队容量

  // 外部系统协同相关（新增）
  handlingType?: 'internal' | 'external_link' | 'external_approval'; // 任务处理形态
  externalSystem?: 'ERP' | 'OA' | 'CRM'; // 外部系统名称
  externalUrl?: string; // 外部系统深链接
  externalStatus?: 'pending_sync' | 'completed' | 'rejected'; // 外部同步状态
};

// 处理历史中的一个活动记录
export type Activity = {
  id: string;
  timestamp: Date;
  description: string;
  actor: 'AI' | User;
};

// Helper types for filtering and UI state
export type IncidentFilter =
  | 'all'
  | 'urgent'
  | 'pending_human'
  | 'ai_processed'
  | 'type_customer'
  | 'type_order'
  | 'type_product';
export type TaskView = 'list' | 'kanban';
export type TaskGrouping = 'due_date' | 'incident';
export type CalendarView = 'month' | 'week' | 'day';

// AI指挥中心相关类型
export type ColorBy = 'assignee' | 'incident_priority' | 'task_type';

export type WorkloadStatus = 'healthy' | 'overloaded' | 'underutilized';

export type TeamMember = User & {
  workloadPercentage: number;
  status: WorkloadStatus;
  capacity: number; // 最大工作负载点数
  currentLoad: number; // 当前工作负载点数
};

export type WorkloadAnalysis = {
  totalLoad: number;
  totalCapacity: number;
  percentage: number;
  status: WorkloadStatus;
  overloadedMembers: TeamMember[];
  underutilizedMembers: TeamMember[];
};
