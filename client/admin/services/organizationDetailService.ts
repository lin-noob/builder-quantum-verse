import { request } from "@/lib/request";
import { Organization } from "../../../shared/organizationData";

/**
 * 获取组织详情
 */
export const getOrganizationDetail = async (
  companyId: string
): Promise<Organization> => {
  try {
    const response = await request.get(`/admin/api/v1/company/info/${companyId}`);
    
    if (response.data.code !== "201") {
      throw new Error(response.data.msg || "获取组织详情失败");
    }

    const data = response.data.data;
    
    // 转换数据格式
    const organization: Organization = {
      id: data.id,
      organizationId: data.organizationId,
      name: data.name,
      accountStatus: data.disable,
      createdAt: data.gmtCreate,
      subscriptionPlan: data.subscriptionPlan,
      memberCount: data.total,
      activeMemberCount: data.activeMember,
    };

    return organization;
  } catch (error) {
    console.error("获取组织详情失败:", error);
    throw error;
  }
};