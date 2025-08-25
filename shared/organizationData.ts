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
  /** 组织ID - 系统的唯一标识符，主键 */
  organizationId: string;
  /** 组织名称 - 客户公司的名称 */
  name: string;
  /** 账户状态 - 该组织的账户是否有效 */
  accountStatus: AccountStatus;
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
  memberId: string;
  /** 所属组织ID - 关联到具体的Organization */
  organizationId: string;
  /** 邮箱 - 成员用于登录的唯一邮箱地址 */
  email: string;
  /** 密码哈希 - 存储加密后的用户密码 */
  passwordHash?: string;
  /** 姓名 - 成员的真实姓名或昵称 */
  name: string;
  /** 角色 - 定义成员的权限级别 */
  role: MemberRole;
  /** 账户状�� - 该成员的账户是否可以登录 */
  accountStatus: AccountStatus;
  /** 创建时间 - 该成员账户被创建的时间戳 */
  createdAt: string;
  /** 最后登录时间 - 记录成员最近一次成功登录的时间 */
  lastLoginAt?: string | null;
  /** 最后更新时间 */
  updatedAt?: string;
  /** 头像URL */
  avatar?: string;
  /** 电话号码 */
  phone?: string;
}

/**
 * 创建组织请求接口
 */
export interface CreateOrganizationRequest {
  /** 组织名称 */
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
  accountStatus?: AccountStatus;
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
  /** 当前页 */
  page: number;
  /** 每页大小 */
  limit: number;
  /** 总页数 */
  totalPages: number;
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
  /** 是否成功 */
  success: boolean;
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
 * Mock组织数据
 */
export const mockOrganizations: Organization[] = [
  {
    organizationId: "org_demo_001",
    name: "演示科技有限公司",
    accountStatus: AccountStatus.ACTIVE,
    createdAt: "2024-01-15T10:00:00Z",
    subscriptionPlan: SubscriptionPlan.PROFESSIONAL,
    billingInfo: null,
    updatedAt: "2024-01-20T15:30:00Z",
    memberCount: 12,
    activeMemberCount: 10,
  },
  {
    organizationId: "org_test_002",
    name: "内部测试团队",
    accountStatus: AccountStatus.ACTIVE,
    createdAt: "2024-01-10T09:00:00Z",
    subscriptionPlan: SubscriptionPlan.INTERNAL_TRIAL,
    billingInfo: null,
    updatedAt: "2024-01-25T11:15:00Z",
    memberCount: 5,
    activeMemberCount: 5,
  },
  {
    organizationId: "org_startup_003",
    name: "创新创业公司",
    accountStatus: AccountStatus.SUSPENDED,
    createdAt: "2024-01-05T14:30:00Z",
    subscriptionPlan: SubscriptionPlan.BASIC,
    billingInfo: null,
    updatedAt: "2024-01-30T09:45:00Z",
    memberCount: 3,
    activeMemberCount: 0,
  },
];

/**
 * Mock成员数据
 */
export const mockMembers: Member[] = [
  {
    memberId: "mem_admin_001",
    organizationId: "org_demo_001",
    email: "admin@demo.com",
    name: "李国帅",
    role: MemberRole.ADMIN,
    accountStatus: AccountStatus.ACTIVE,
    createdAt: "2024-01-15T10:05:00Z",
    lastLoginAt: "2024-02-01T09:30:00Z",
    updatedAt: "2024-01-20T15:30:00Z",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
    phone: "+86 138-0000-0001",
  },
  {
    memberId: "mem_user_002",
    organizationId: "org_demo_001",
    email: "user1@demo.com",
    name: "张三",
    role: MemberRole.MEMBER,
    accountStatus: AccountStatus.ACTIVE,
    createdAt: "2024-01-16T11:00:00Z",
    lastLoginAt: "2024-01-31T14:20:00Z",
    updatedAt: "2024-01-25T16:45:00Z",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user1",
    phone: "+86 138-0000-0002",
  },
  {
    memberId: "mem_user_003",
    organizationId: "org_demo_001",
    email: "user2@demo.com",
    name: "李四",
    role: MemberRole.MEMBER,
    accountStatus: AccountStatus.DISABLED,
    createdAt: "2024-01-18T16:30:00Z",
    lastLoginAt: "2024-01-25T10:15:00Z",
    updatedAt: "2024-01-28T13:20:00Z",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user2",
  },
  {
    memberId: "mem_test_004",
    organizationId: "org_test_002",
    email: "test@internal.com",
    name: "测试管理员",
    role: MemberRole.ADMIN,
    accountStatus: AccountStatus.ACTIVE,
    createdAt: "2024-01-10T09:05:00Z",
    lastLoginAt: "2024-02-01T08:45:00Z",
    updatedAt: "2024-01-25T11:15:00Z",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=test",
  },
];

/**
 * 获取组织的成员列表
 */
export const getMembersByOrganization = (organizationId: string): Member[] => {
  return mockMembers.filter(
    (member) => member.organizationId === organizationId,
  );
};

/**
 * 根据邮箱查找成员
 */
export const getMemberByEmail = (email: string): Member | undefined => {
  return mockMembers.find((member) => member.email === email);
};

/**
 * 根据ID查找组织
 */
export const getOrganizationById = (
  organizationId: string,
): Organization | undefined => {
  return mockOrganizations.find((org) => org.organizationId === organizationId);
};

/**
 * 根据ID查找成员
 */
export const getMemberById = (memberId: string): Member | undefined => {
  return mockMembers.find((member) => member.memberId === memberId);
};

/**
 * 验证成员是否可以登录
 * 组织暂停时，该组织下所有成员都无法登录
 * 成员禁用时，仅该成员无法登录
 */
export const canMemberLogin = (member: Member): boolean => {
  const organization = getOrganizationById(member.organizationId);

  if (!organization) {
    return false;
  }

  // 组织被暂停，该组织下所有成员都无法登录
  if (organization.accountStatus === AccountStatus.SUSPENDED) {
    return false;
  }

  // 成员被禁用，无法登录
  if (member.accountStatus === AccountStatus.DISABLED) {
    return false;
  }

  // 只有组织活跃且成员活跃才能登录
  return (
    organization.accountStatus === AccountStatus.ACTIVE &&
    member.accountStatus === AccountStatus.ACTIVE
  );
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

export default {
  AccountStatus,
  MemberRole,
  SubscriptionPlan,
  mockOrganizations,
  mockMembers,
  getMembersByOrganization,
  getMemberByEmail,
  getOrganizationById,
  getMemberById,
  canMemberLogin,
  generateOrganizationId,
  generateMemberId,
  generateInitialPassword,
};
