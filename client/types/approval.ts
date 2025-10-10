// 审批流配置相关类型定义

// 单据类型枚举
export enum DocumentType {
  // 财务类
  EXPENSE_REIMBURSEMENT = 'expense_reimbursement', // 费用报销
  BUDGET_APPLICATION = 'budget_application',       // 预算申请
  PAYMENT_REQUEST = 'payment_request',             // 付款申请
  INVOICE_APPROVAL = 'invoice_approval',           // 发票审批
  
  // 人事类
  LEAVE_REQUEST = 'leave_request',                 // 请假申请
  RECRUITMENT = 'recruitment',                     // 招聘申请
  PROMOTION = 'promotion',                         // 晋升申请
  SALARY_ADJUSTMENT = 'salary_adjustment',         // 薪资调整
  
  // 采购类
  PURCHASE_REQUEST = 'purchase_request',           // 采购申请
  CONTRACT_APPROVAL = 'contract_approval',         // 合同审批
  VENDOR_APPROVAL = 'vendor_approval',             // 供应商审批
  
  // 营销类
  MARKETING_CAMPAIGN = 'marketing_campaign',       // 营销活动
  PROMOTION_ACTIVITY = 'promotion_activity',       // 促销活动
  CONTENT_APPROVAL = 'content_approval',           // 内容审批
  
  // 系统类
  SYSTEM_CONFIG = 'system_config',                 // 系统配置
  USER_PERMISSION = 'user_permission',             // 用户权限
  DATA_EXPORT = 'data_export',                     // 数据导出
}

// 审批节点类型
export enum ApprovalNodeType {
  SINGLE = 'single',     // 单人审批
  MULTIPLE = 'multiple', // 多人审批（需要所有人同意）
  ANY_ONE = 'any_one',   // 多人审批（任意一人同意即可）
  SEQUENTIAL = 'sequential', // 顺序审批
}

// 审批条件类型
export enum ApprovalConditionType {
  AMOUNT = 'amount',           // 金额条件
  DEPARTMENT = 'department',   // 部门条件
  ROLE = 'role',              // 角色条件
  CUSTOM = 'custom',          // 自定义条件
}

// 单据状态枚举
export enum DocumentStatus {
  DRAFT = 'draft',             // 草稿
  SUBMITTED = 'submitted',     // 已提交
  REVIEWING = 'reviewing',     // 审核中
  APPROVED = 'approved',       // 已通过
  REJECTED = 'rejected',       // 已拒绝
  CANCELLED = 'cancelled',     // 已取消
  COMPLETED = 'completed',     // 已完成
  ARCHIVED = 'archived',       // 已归档
}

// 状态流转配置
export interface StatusTransition {
  id: string;
  fromStatus: DocumentStatus;  // 源状态
  toStatus: DocumentStatus;    // 目标状态
  condition?: string;          // 流转条件（可选）
  description: string;         // 流转描述
}

// 审批条件
export interface ApprovalCondition {
  id: string;
  type: ApprovalConditionType;
  field: string;           // 条件字段
  operator: 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'not_in'; // 操作符
  value: any;              // 条件值
  description: string;     // 条件描述
}

// 审批人配置
export interface ApprovalUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  isRequired: boolean;     // 是否必须审批
}

// 审批节点
export interface ApprovalNode {
  id: string;
  name: string;
  description: string;
  type: ApprovalNodeType;
  order: number;           // 节点顺序
  conditions: ApprovalCondition[]; // 触发条件
  approvers: ApprovalUser[];       // 审批人列表
  timeoutHours: number;    // 超时时间（小时）
  autoApprove: boolean;    // 超时是否自动通过
  isActive: boolean;       // 是否启用
  statusTransitions: StatusTransition[]; // 状态流转配置
  triggerStatus: DocumentStatus;   // 触发此节点的单据状态
  approveTransition: StatusTransition; // 审批通过时的状态流转
  rejectTransition: StatusTransition;  // 审批拒绝时的状态流转
  createdAt: string;
  updatedAt: string;
}

// 审批流程配置
export interface ApprovalWorkflow {
  id: string;
  name: string;
  description: string;
  documentType: DocumentType;
  isActive: boolean;
  nodes: ApprovalNode[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  version: number;         // 版本号
}

// 审批流程模板
export interface ApprovalTemplate {
  id: string;
  name: string;
  description: string;
  documentTypes: DocumentType[];
  nodes: Omit<ApprovalNode, 'id' | 'createdAt' | 'updatedAt'>[];
  isSystem: boolean;       // 是否系统模板
  createdAt: string;
}

// 审批实例状态
export enum ApprovalStatus {
  PENDING = 'pending',     // 待审批
  APPROVED = 'approved',   // 已通过
  REJECTED = 'rejected',   // 已拒绝
  CANCELLED = 'cancelled', // 已取消
  TIMEOUT = 'timeout',     // 已超时
}

// 审批实例
export interface ApprovalInstance {
  id: string;
  workflowId: string;
  documentType: DocumentType;
  documentId: string;      // 关联的单据ID
  title: string;
  description: string;
  submitterId: string;     // 提交人ID
  submitterName: string;
  currentNodeId: string;   // 当前审批节点
  status: ApprovalStatus;
  data: Record<string, any>; // 审批数据
  history: ApprovalHistory[]; // 审批历史
  createdAt: string;
  updatedAt: string;
}

// 审批历史记录
export interface ApprovalHistory {
  id: string;
  nodeId: string;
  nodeName: string;
  approverId: string;
  approverName: string;
  action: 'approve' | 'reject' | 'transfer' | 'timeout';
  comment: string;
  createdAt: string;
}

// 审批统计
export interface ApprovalStatistics {
  totalWorkflows: number;
  activeWorkflows: number;
  totalInstances: number;
  pendingInstances: number;
  approvedInstances: number;
  rejectedInstances: number;
  avgApprovalTime: number; // 平均审批时间（小时）
  timeoutRate: number;     // 超时率
}

// 审批配置表单数据
export interface ApprovalWorkflowForm {
  name: string;
  description: string;
  documentType: DocumentType;
  isActive: boolean;
  nodes: ApprovalNodeForm[];
}

export interface ApprovalNodeForm {
  name: string;
  description: string;
  type: ApprovalNodeType;
  order: number;
  conditions: ApprovalCondition[];
  approverIds: string[];
  timeoutHours: number;
  autoApprove: boolean;
  isActive: boolean;
  triggerStatus: DocumentStatus;
  approveToStatus: DocumentStatus;
  rejectToStatus: DocumentStatus;
}