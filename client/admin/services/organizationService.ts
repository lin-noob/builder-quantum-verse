import { request } from "@/lib/request";
import {
  Organization,
  OrganizationListQuery,
  PaginatedResponse,
  ApiResponse,
  AccountStatus,
  SubscriptionPlan,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
} from "../../../shared/organizationData";

/**
 * 组织列表响应数据结构
 */
interface OrganizationListResponse {
  records: OrganizationRecord[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

/**
 * 组织记录数据结构（API返回格式）
 */
interface OrganizationRecord {
  id: string;
  name: string;
  status: boolean;
  gmtCreate: string;
  subscriptionPlan: string;
  organizationId: string;
  disable: boolean;
  total: number;
  activeMember: number;
  invitecode?: string;
  fromcode?: string;
}

/**
 * 创建组织响应数据结构
 */
interface CreateOrganizationResponse {
  organization: OrganizationRecord;
  admin: {
    id: string;
    email: string;
    name: string;
    // 其他管理员字段...
  };
}

/**
 * 更新组织响应数据结构
 */
interface UpdateOrganizationResponse {
  id: string;
  name: string;
  status: number;
  gmtCreate: string;
  subscriptionPlan: string;
  memberCount?: number;
  activeMemberCount?: number;
}

/**
 * 将API返回的组织记录转换为前端使用的组织对象
 */
const transformOrganizationRecord = (
  record: OrganizationRecord,
): Organization => {
  // 转换订阅计划
  let subscriptionPlan: SubscriptionPlan;
  switch (record.subscriptionPlan) {
    case "INTERNAL_TRIAL":
      subscriptionPlan = SubscriptionPlan.INTERNAL_TRIAL;
      break;
    case "BASIC":
      subscriptionPlan = SubscriptionPlan.BASIC;
      break;
    case "PROFESSIONAL":
      subscriptionPlan = SubscriptionPlan.PROFESSIONAL;
      break;
    case "ENTERPRISE":
      subscriptionPlan = SubscriptionPlan.ENTERPRISE;
      break;
    default:
      subscriptionPlan = SubscriptionPlan.INTERNAL_TRIAL;
  }

  return {
    id: record.id,
    organizationId: record.organizationId,
    name: record.name,
    accountStatus: record.disable,
    createdAt: record.gmtCreate,
    subscriptionPlan,
    memberCount: record.total,
    activeMemberCount: record.activeMember,
  };
};

/**
 * 获取组织列表
 */
export const getOrganizations = async (
  query: OrganizationListQuery = {},
): Promise<PaginatedResponse<Organization>> => {
  try {
    // 构建请求参数
    const params: Record<string, any> = {
      current: query.page || 1,
      size: query.limit || 10,
    };

    // 添加搜索条件
    if (query.search) {
      params.name = query.search;
    }

    // 添加状态过滤
    if (query.status) {
      // 转换状态值
      switch (query.status) {
        case AccountStatus.ACTIVE:
          params.status = 1;
          break;
        case AccountStatus.SUSPENDED:
          params.status = 0;
          break;
        default:
          params.status = query.status;
      }
    }

    // 添加排序参数
    if (query.sortBy) {
      params.column = query.sortBy;
      params.order = query.sortOrder === "asc" ? "asc" : "desc";
    }

    const response = await request.post<ApiResponse<OrganizationListResponse>>(
      "/admin/api/v1/company/list",
      params,
    );
    const res = response.data;
    // 检查响应是否成功
    if (res.code !== "201") {
      throw new Error(res.msg || "获取组织列表失败");
    }

    // 转换数据格式
    const organizationList = response.data.data.records.map(
      transformOrganizationRecord,
    );
    return {
      data: organizationList,
      total: res.data.total,
    };
  } catch (error) {
    console.error("获取组织列表失败:", error);
    throw error;
  }
};

/**
 * 创建新组织
 */
export const createOrganization = async (
  requestPayload: CreateOrganizationRequest,
): Promise<boolean> => {
  try {
    // 转换请求参数格式
    const payload = {
      company: requestPayload.name,
      name: requestPayload.adminName,
      account: requestPayload.adminEmail,
      email: requestPayload.adminEmail,
      password: requestPayload.adminPassword,
      // code: "string",
      // company: "string",
      // ftype: "string",
      // gadSource: "string",
      // invitecode: "string",
      // key: "string",
      // mtmCampaign: "string",
      // oldpassword: "string",
      // phone: "string",
      // salekey: "string"
    };

    const response = await request.post<
      ApiResponse<CreateOrganizationResponse>
    >("/admin/api/v1/company", payload);

    const res = response.data;

    // 检查响应是否成功
    if (res.code !== "201") {
      throw new Error(response.data.msg || "创建组织失败");
    }

    return true;
  } catch (error) {
    console.error("创建组织失败:", error);
    throw error;
  }
};

/**
 * 更新组织信息
 */
export const updateOrganization = async (
  requestPayload: Organization,
): Promise<boolean> => {
  try {
    // 转换请求参数格式
    const payload = {
      ...requestPayload,
    };

    const response = await request.post<
      ApiResponse<UpdateOrganizationResponse>
    >("/admin/api/v1/company/update", payload);

    const res = response.data;

    // 检查响应是否成功
    if (res.code !== "201") {
      throw new Error(response.data.msg || "更新组织失败");
    }

    return true;
  } catch (error) {
    console.error("更新组织失败:", error);
    throw error;
  }
};

/**
 * 启用组织
 */
export const enableOrganizations = async (
  ids: string[],
): Promise<ApiResponse<{ success: boolean }>> => {
  try {
    const response = await request.post<ApiResponse<{ success: boolean }>>(
      `/admin/api/v1/company/enable/${ids.join(",")}`,
      {},
    );

    const res = response.data;

    if (res.code !== "201") {
      throw new Error(response.data.msg || "启用组织失败");
    }

    return {
      code: response.data.code,
      success: true,
      message: response.data.msg || "组织已启用",
      data: response.data.data,
    };
  } catch (error) {
    console.error("启用组织失败:", error);
    throw error;
  }
};

/**
 * 禁用组织
 */
export const disableOrganizations = async (
  ids: string[],
): Promise<ApiResponse<{ success: boolean }>> => {
  try {
    const response = await request.post<ApiResponse<{ success: boolean }>>(
      `/admin/api/v1/company/disable/${ids.join(",")}`,
      {},
    );

    const res = response.data;

    if (res.code !== "201") {
      throw new Error(response.data.msg || "禁用组织失败");
    }

    return {
      code: res.code,
      success: true,
      message: res.msg || "组织已禁用",
      data: res.data,
    };
  } catch (error) {
    console.error("禁用组织失败:", error);
    throw error;
  }
};

/**
 * 组织管理服务
 */
export const organizationService = {
  getOrganizations,
  createOrganization,
  updateOrganization,
  enableOrganizations,
  disableOrganizations,
};
