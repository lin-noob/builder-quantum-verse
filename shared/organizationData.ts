// 组织和成员管理数据模型
// 基于PRD文档的多租户账户体系设计

/**
 * 账户状态枚举
 */
export enum AccountStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  DISABLED = "DISABLED",
}

/**
 * 成员角色枚举
 */
export enum MemberRole {
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
}

/**
 * 订阅计划枚举
 */
export enum SubscriptionPlan {
  INTERNAL_TRIAL = "INTERNAL_TRIAL",
  BASIC = "BASIC",
  PROFESSIONAL = "PROFESSIONAL",
  ENTERPRISE = "ENTERPRISE",
}

/**
 * 组织 (Organization) 数据模型
 * 代表一个独立的客户实体，是所有数据隔离和管理的基本��位
 */
export interface Organization {
  id: string;
  /** 组织ID - 系统的唯一标识符，主键 */
  organizationId: string;
  /** 组织名称 - 客户公司的名称 */
  name: string;
  /** 账户状态 - 该组织的账户是否有效 */
  accountStatus: boolean;
  /** 创建时间 - 该组织被创建的时间戳 */
  createdAt: string;
  /** 订阅计划 - 标识该组织的服务套餐 */
  subscriptionPlan: SubscriptionPlan;
  /** 账单信息 - 存储与支付相关的客户信息 */
  billingInfo?: any | null;
  /** 最后更新时间 */
  updatedAt?: string;
  /** 成员数量统计 */
  memberCount?: number;
  /** 活跃成员数量 */
  activeMemberCount?: number;
}

/**
 * 成员 (Member) 数据模型
 * 代表隶属于某个"组织"的、可以登录和操作系统后台的个人用户
 */
export interface Member {
  /** 成员ID - 成员的唯一标识符，主键 */
  id: string;
  /** 邮箱 - 成员用于登录的唯一邮箱地址 */
  account: string;
  /** 姓名 - 成员的真实姓名或昵称 */
  name: string;
  /** 角色 - 定义成员的权限级别 */
  roleId: string;
  /** 账户状�� - 该成员的账户是否可以登录 */
  status: number;
  /** 创建时间 - 该成员账户被创建的时间戳 */
  createDate: string;
  /** 最后登录时间 - 记录成员最近一次成功登录的时间 */
  losingEffect?: string | null;
  lastlogintime?: string | null;
  /** 头像URL */
  avatar?: string;
  /** 电话号码 */
  phone?: string;
}

/**
 * 创建组织请求接口
 */
export interface CreateOrganizationRequest {
  /** 组织��称 */
  name: string;
  /** 初始管理员姓名 */
  adminName: string;
  /** 初始管理员邮箱 */
  adminEmail: string;
  /** 初始管理员密码 */
  adminPassword: string;
  /** 订阅计划 */
  subscriptionPlan?: SubscriptionPlan;
}

/**
 * 更新组织请求接口
 */
export interface UpdateOrganizationRequest {
  /** 组织ID */
  organizationId: string;
  /** 组织名称 */
  name?: string;
  /** 账户状态 */
  accountStatus?: boolean;
  /** 订阅计划 */
  subscriptionPlan?: SubscriptionPlan;
}

/**
 * 创建成员请求接口
 */
export interface CreateMemberRequest {
  /** 所属组织ID */
  organizationId: string;
  /** 邮箱 */
  email: string;
  /** 姓名 */
  name: string;
  /** 角色 */
  role: MemberRole;
  /** 初始密码 */
  password: string;
}

/**
 * 更新成员请求接口
 */
export interface UpdateMemberRequest {
  /** 成员ID */
  memberId: string;
  /** 姓名 */
  name?: string;
  /** 角色 */
  role?: MemberRole;
  /** 账户状态 */
  accountStatus?: AccountStatus;
  /** 电话号码 */
  phone?: string;
}

/**
 * 成员邀请请求接口
 */
export interface InviteMemberRequest {
  /** 邮箱 */
  email: string;
  /** 角色 */
  role: MemberRole;
  /** 初始密码 */
  password: string;
}

/**
 * 修改密码请求接口
 */
export interface ChangePasswordRequest {
  /** 当前密码 */
  currentPassword: string;
  /** 新密码 */
  newPassword: string;
}

/**
 * 组织列表查询参数
 */
export interface OrganizationListQuery {
  /** 页码 */
  page?: number;
  /** 每页大小 */
  limit?: number;
  /** 搜索关键字 */
  search?: string;
  /** 账户状态过滤 */
  status?: AccountStatus;
  /** 排序字段 */
  sortBy?: "createdAt" | "name";
  /** 排序顺序 */
  sortOrder?: "asc" | "desc";
}

/**
 * 成员列表查询参数
 */
export interface MemberListQuery {
  /** 页码 */
  page?: number;
  /** 每页大小 */
  limit?: number;
  /** 搜索关键字 */
  search?: string;
  /** 角色过滤 */
  role?: MemberRole;
  /** 账户状态过滤 */
  status?: AccountStatus;
}

/**
 * 分页响应接口
 */
export interface PaginatedResponse<T> {
  /** 数据列��� */
  data: T[];
  /** 总数量 */
  total: number;
}

/**
 * API响应接口
 */
export interface ApiResponse<T = any> {
  /** 响应码 */
  code: string;
  /** 响应数据 */
  data: T;
  /** 响应消息 */
  message: string;
  msg?: string;
  /** 是否成功 */
  success: boolean;
  total?: number;
}

// Mock数据生成函数

/**
 * 生成组织ID
 */
export const generateOrganizationId = (): string => {
  return `org_${Math.random().toString(36).substr(2, 10)}`;
};

/**
 * 生成成员ID
 */
export const generateMemberId = (): string => {
  return `mem_${Math.random().toString(36).substr(2, 10)}`;
};

/**
 * 生成初始密码
 */
export const generateInitialPassword = (): string => {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

export interface CompanyInfo {
  id: string;
  name: string | null;
  remark: string | null;
  invitecode: string | null;
  fromcode: string | null;
  bossEmail: string | null;
  organizationId: string | null;
  gmtCreate: string;
  gmtModified: string;
}

export interface UserInfo {
  userinfo: {
    name: string;
    id: string;
    email: string;
  };
  id: string;
  account: string;
  createDate: number;
  losingeffect: number;
  disable: boolean;
  lastlogintime: number;
  shopid: string;
}

export interface OrganizationInfo {
  activeMember: string;
  total: number;
  name: string;
  usertype: string;
  company: CompanyInfo;
  id: string;
  user: UserInfo;
  email: string;
}

export default {
  AccountStatus,
  MemberRole,
  SubscriptionPlan,
  generateOrganizationId,
  generateMemberId,
  generateInitialPassword,
};
