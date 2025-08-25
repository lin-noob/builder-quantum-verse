// 组织和成员管理API接口
// 基于PRD文档的多租户账户体系API设计

import {
  Organization,
  Member,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  CreateMemberRequest,
  UpdateMemberRequest,
  InviteMemberRequest,
  ChangePasswordRequest,
  OrganizationListQuery,
  MemberListQuery,
  PaginatedResponse,
  ApiResponse,
  AccountStatus,
  MemberRole,
  mockOrganizations,
  mockMembers,
  getMembersByOrganization,
  getMemberByEmail,
  getOrganizationById,
  getMemberById,
  generateOrganizationId,
  generateMemberId,
  generateInitialPassword
} from './organizationData';

// 模拟API延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 内存存储（实际应用中应该是数据库）
let organizationsStore = [...mockOrganizations];
let membersStore = [...mockMembers];

/**
 * 组织管理API
 */
export const organizationApi = {
  /**
   * 获取组织列表（平台超级管理员权限）
   */
  async getOrganizations(query: OrganizationListQuery = {}): Promise<PaginatedResponse<Organization>> {
    await delay(300);
    
    const { page = 1, limit = 10, search = '', status } = query;
    
    let filteredOrgs = organizationsStore;
    
    // 搜索过滤
    if (search) {
      filteredOrgs = filteredOrgs.filter(org => 
        org.name.toLowerCase().includes(search.toLowerCase()) ||
        org.organizationId.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // 状态过滤
    if (status) {
      filteredOrgs = filteredOrgs.filter(org => org.accountStatus === status);
    }
    
    // 分页
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filteredOrgs.slice(startIndex, endIndex);
    
    return {
      data: paginatedData,
      total: filteredOrgs.length,
      page,
      limit,
      totalPages: Math.ceil(filteredOrgs.length / limit)
    };
  },

  /**
   * 根据ID获取组织详情
   */
  async getOrganizationById(organizationId: string): Promise<Organization | null> {
    await delay(200);
    
    const organization = organizationsStore.find(org => org.organizationId === organizationId);
    return organization || null;
  },

  /**
   * 创建新组织（平台超级管理员权限）
   */
  async createOrganization(request: CreateOrganizationRequest): Promise<ApiResponse<{ organization: Organization; admin: Member }>> {
    await delay(500);
    
    // 检查管理员邮箱是否已存在
    const existingMember = getMemberByEmail(request.adminEmail);
    if (existingMember) {
      return {
        code: '400',
        success: false,
        message: '该邮箱已被使用',
        data: null
      };
    }
    
    const now = new Date().toISOString();
    const orgId = generateOrganizationId();
    const adminId = generateMemberId();
    
    // 创建组织
    const newOrganization: Organization = {
      organizationId: orgId,
      name: request.name,
      accountStatus: AccountStatus.ACTIVE,
      createdAt: now,
      subscriptionPlan: request.subscriptionPlan || 'INTERNAL_TRIAL' as any,
      billingInfo: null,
      updatedAt: now,
      memberCount: 1,
      activeMemberCount: 1
    };
    
    // 创建管理员账户
    const newAdmin: Member = {
      memberId: adminId,
      organizationId: orgId,
      email: request.adminEmail,
      passwordHash: request.adminPassword, // 实际应用中应该加密
      name: request.adminName,
      role: MemberRole.ADMIN,
      accountStatus: AccountStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${adminId}`
    };
    
    organizationsStore.push(newOrganization);
    membersStore.push(newAdmin);
    
    return {
      code: '200',
      success: true,
      message: '组织创建成功',
      data: {
        organization: newOrganization,
        admin: newAdmin
      }
    };
  },

  /**
   * 更新组织信息（平台超级管理员权限）
   */
  async updateOrganization(request: UpdateOrganizationRequest): Promise<ApiResponse<Organization>> {
    await delay(300);
    
    const index = organizationsStore.findIndex(org => org.organizationId === request.organizationId);
    if (index === -1) {
      return {
        code: '404',
        success: false,
        message: '组织不存在',
        data: null
      };
    }
    
    const updatedOrg = {
      ...organizationsStore[index],
      ...request,
      updatedAt: new Date().toISOString()
    };
    
    organizationsStore[index] = updatedOrg;
    
    return {
      code: '200',
      success: true,
      message: '组织更新成功',
      data: updatedOrg
    };
  },

  /**
   * 获取当前登录用户的组织信息
   */
  async getCurrentOrganization(): Promise<Organization | null> {
    await delay(200);
    
    // 这里应该从当前用户会话中获取组织ID
    // 暂时返回第一个组织作为演示
    return organizationsStore[0] || null;
  }
};

/**
 * 成员管理API
 */
export const memberApi = {
  /**
   * 获取成员列表（组织内管理员权限）
   */
  async getMembers(organizationId: string, query: MemberListQuery = {}): Promise<PaginatedResponse<Member>> {
    await delay(300);
    
    const { page = 1, limit = 10, search = '', role, status } = query;
    
    let filteredMembers = membersStore.filter(member => member.organizationId === organizationId);
    
    // 搜索过滤
    if (search) {
      filteredMembers = filteredMembers.filter(member => 
        member.name.toLowerCase().includes(search.toLowerCase()) ||
        member.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // 角色过滤
    if (role) {
      filteredMembers = filteredMembers.filter(member => member.role === role);
    }
    
    // 状态过滤
    if (status) {
      filteredMembers = filteredMembers.filter(member => member.accountStatus === status);
    }
    
    // 按创建时间倒序排序
    filteredMembers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // 分页
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filteredMembers.slice(startIndex, endIndex);
    
    return {
      data: paginatedData,
      total: filteredMembers.length,
      page,
      limit,
      totalPages: Math.ceil(filteredMembers.length / limit)
    };
  },

  /**
   * 根据ID获取成员详情
   */
  async getMemberById(memberId: string): Promise<Member | null> {
    await delay(200);
    
    const member = membersStore.find(m => m.memberId === memberId);
    return member || null;
  },

  /**
   * 邀请新成员（组织内管理员权限）
   */
  async inviteMember(organizationId: string, request: InviteMemberRequest): Promise<ApiResponse<{ member: Member; initialPassword: string }>> {
    await delay(500);
    
    // 检查邮箱是否已存在
    const existingMember = getMemberByEmail(request.email);
    if (existingMember) {
      return {
        code: '400',
        success: false,
        message: '该邮箱已被使用',
        data: null
      };
    }
    
    const now = new Date().toISOString();
    const memberId = generateMemberId();
    const initialPassword = request.password || generateInitialPassword();
    
    const newMember: Member = {
      memberId,
      organizationId,
      email: request.email,
      passwordHash: initialPassword, // 实际应用中应该加密
      name: request.email.split('@')[0], // 临时使用邮箱前缀作为姓名
      role: request.role,
      accountStatus: AccountStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${memberId}`
    };
    
    membersStore.push(newMember);
    
    // 更新组织成员数量
    const orgIndex = organizationsStore.findIndex(org => org.organizationId === organizationId);
    if (orgIndex !== -1) {
      organizationsStore[orgIndex].memberCount = (organizationsStore[orgIndex].memberCount || 0) + 1;
      organizationsStore[orgIndex].activeMemberCount = (organizationsStore[orgIndex].activeMemberCount || 0) + 1;
    }
    
    return {
      code: '200',
      success: true,
      message: '成员邀请成功',
      data: {
        member: newMember,
        initialPassword
      }
    };
  },

  /**
   * 更新成员信息（组织内管理员权限 或 成员本人）
   */
  async updateMember(request: UpdateMemberRequest): Promise<ApiResponse<Member>> {
    await delay(300);
    
    const index = membersStore.findIndex(member => member.memberId === request.memberId);
    if (index === -1) {
      return {
        code: '404',
        success: false,
        message: '成员不存在',
        data: null
      };
    }
    
    const currentMember = membersStore[index];
    
    // 防止将唯一的管理员降级
    if (request.role && request.role !== MemberRole.ADMIN && currentMember.role === MemberRole.ADMIN) {
      const orgMembers = getMembersByOrganization(currentMember.organizationId);
      const adminCount = orgMembers.filter(m => m.role === MemberRole.ADMIN && m.accountStatus === AccountStatus.ACTIVE).length;
      
      if (adminCount <= 1) {
        return {
          code: '400',
          success: false,
          message: '不能将唯一的管理员降级',
          data: null
        };
      }
    }
    
    const updatedMember = {
      ...currentMember,
      ...request,
      updatedAt: new Date().toISOString()
    };
    
    membersStore[index] = updatedMember;
    
    // 如果状态发生变化，更新组织的活跃成员数量
    if (request.accountStatus !== undefined && request.accountStatus !== currentMember.accountStatus) {
      const orgIndex = organizationsStore.findIndex(org => org.organizationId === currentMember.organizationId);
      if (orgIndex !== -1) {
        const orgMembers = getMembersByOrganization(currentMember.organizationId);
        const activeMemberCount = orgMembers.filter(m => m.accountStatus === AccountStatus.ACTIVE).length;
        organizationsStore[orgIndex].activeMemberCount = activeMemberCount;
      }
    }
    
    return {
      code: '200',
      success: true,
      message: '成员更新成功',
      data: updatedMember
    };
  },

  /**
   * 切换成员状态（启用/禁用）
   */
  async toggleMemberStatus(memberId: string): Promise<ApiResponse<Member>> {
    await delay(300);
    
    const index = membersStore.findIndex(member => member.memberId === memberId);
    if (index === -1) {
      return {
        code: '404',
        success: false,
        message: '成员不存在',
        data: null
      };
    }
    
    const currentMember = membersStore[index];
    const newStatus = currentMember.accountStatus === AccountStatus.ACTIVE 
      ? AccountStatus.DISABLED 
      : AccountStatus.ACTIVE;
    
    // 防止禁用唯一的活跃管理员
    if (newStatus === AccountStatus.DISABLED && currentMember.role === MemberRole.ADMIN) {
      const orgMembers = getMembersByOrganization(currentMember.organizationId);
      const activeAdminCount = orgMembers.filter(m => 
        m.role === MemberRole.ADMIN && 
        m.accountStatus === AccountStatus.ACTIVE &&
        m.memberId !== memberId
      ).length;
      
      if (activeAdminCount === 0) {
        return {
          code: '400',
          success: false,
          message: '不能禁用唯一的活跃管理员',
          data: null
        };
      }
    }
    
    const updatedMember = {
      ...currentMember,
      accountStatus: newStatus,
      updatedAt: new Date().toISOString()
    };
    
    membersStore[index] = updatedMember;
    
    // 更新组织的活跃成员数量
    const orgIndex = organizationsStore.findIndex(org => org.organizationId === currentMember.organizationId);
    if (orgIndex !== -1) {
      const orgMembers = getMembersByOrganization(currentMember.organizationId);
      const activeMemberCount = orgMembers.filter(m => m.accountStatus === AccountStatus.ACTIVE).length;
      organizationsStore[orgIndex].activeMemberCount = activeMemberCount;
    }
    
    return {
      code: '200',
      success: true,
      message: `成员已${newStatus === AccountStatus.ACTIVE ? '启用' : '禁用'}`,
      data: updatedMember
    };
  },

  /**
   * 修改密码（成员本人）
   */
  async changePassword(memberId: string, request: ChangePasswordRequest): Promise<ApiResponse<void>> {
    await delay(300);
    
    const index = membersStore.findIndex(member => member.memberId === memberId);
    if (index === -1) {
      return {
        code: '404',
        success: false,
        message: '成员不存在',
        data: null
      };
    }
    
    const currentMember = membersStore[index];
    
    // 验证当前密码（实际应用中应该验证哈希值）
    if (currentMember.passwordHash !== request.currentPassword) {
      return {
        code: '400',
        success: false,
        message: '当前密码错误',
        data: null
      };
    }
    
    const updatedMember = {
      ...currentMember,
      passwordHash: request.newPassword, // 实际应用中应该加密
      updatedAt: new Date().toISOString()
    };
    
    membersStore[index] = updatedMember;
    
    return {
      code: '200',
      success: true,
      message: '密码修改成功',
      data: null
    };
  }
};

/**
 * 认证相关API
 */
export const authApi = {
  /**
   * 登录验证
   */
  async login(email: string, password: string): Promise<ApiResponse<{ member: Member; organization: Organization }>> {
    await delay(500);
    
    const member = getMemberByEmail(email);
    if (!member) {
      return {
        code: '401',
        success: false,
        message: '邮箱或密码错误',
        data: null
      };
    }
    
    // 验证密码（实际应用中应该验证哈希值）
    if (member.passwordHash !== password) {
      return {
        code: '401',
        success: false,
        message: '邮箱或密码错误',
        data: null
      };
    }
    
    const organization = getOrganizationById(member.organizationId);
    if (!organization) {
      return {
        code: '500',
        success: false,
        message: '组织不存在',
        data: null
      };
    }
    
    // 检查账户状态
    if (organization.accountStatus === AccountStatus.SUSPENDED) {
      return {
        code: '403',
        success: false,
        message: '组织账户已被暂停',
        data: null
      };
    }
    
    if (member.accountStatus === AccountStatus.DISABLED) {
      return {
        code: '403',
        success: false,
        message: '账户已被禁用',
        data: null
      };
    }
    
    // 更新最后登录时间
    const memberIndex = membersStore.findIndex(m => m.memberId === member.memberId);
    if (memberIndex !== -1) {
      membersStore[memberIndex].lastLoginAt = new Date().toISOString();
    }
    
    return {
      code: '200',
      success: true,
      message: '登录成功',
      data: {
        member: membersStore[memberIndex],
        organization
      }
    };
  }
};

export default {
  organizationApi,
  memberApi,
  authApi
};
