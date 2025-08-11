/**
 * 用户画像API服务
 */
import { createRequest } from "@/lib/request";
import { generateMockUserProfileList, mockApiDelay } from "@/mock/userProfileData";
import type {
  UserProfile,
  UserProfileListParams,
  UserProfileListData,
  OrderSummaryDto,
} from "@/types/userProfile";

/**
 * 用户画像API客户端
 */
class UserProfileService {
  private apiClient = createRequest("/quote/api/v1");

  /**
   * 获取用户画像列表
   */
  async getUserProfileList(params: UserProfileListParams = {}) {
    const { limit, name, page, body = {} } = params;

    // 构建查询参数
    const queryParams: Record<string, string | number> = {};
    if (limit !== undefined) queryParams.limit = limit;
    if (name) queryParams.name = name;
    if (page !== undefined) queryParams.page = page;

    // 构建请求体
    const requestBody: OrderSummaryDto = {
      currentpage: page || 1,
      pagesize: limit || 10,
      ...body,
    };

    try {
      const response = await this.apiClient.businessPost<any>(
        "/profile/list",
        requestBody,
        {
          params: queryParams,
        },
      );

      // 转换为标准格式
      const transformedData: UserProfileListData = {
        list: response.list || response || [],
        pagination: {
          current: requestBody.currentpage || 1,
          pageSize: requestBody.pagesize || 10,
          total: response.total || 0,
          totalPages: Math.ceil((response.total || 0) / (requestBody.pagesize || 10)),
        },
      };

      return transformedData;
    } catch (error) {
      console.error("获取用户画像列表失败:", error);
      throw error;
    }
  }

  /**
   * 根据ID获取用户画像详情
   */
  async getUserProfileById(id: string) {
    return this.apiClient.businessGet<UserProfile>(`/profile/${id}`);
  }

  /**
   * 导出用户画像数据
   */
  async exportUserProfiles(params: UserProfileListParams = {}) {
    const { limit, name, page, body = {} } = params;

    const queryParams: Record<string, string | number> = {};
    if (limit !== undefined) queryParams.limit = limit;
    if (name) queryParams.name = name;
    if (page !== undefined) queryParams.page = page;

    const requestBody: OrderSummaryDto = {
      currentpage: page || 1,
      pagesize: limit || 10000, // 导出时获取更多数据
      ...body,
    };

    try {
      const response = await this.apiClient.download(
        "/profile/export",
        queryParams,
        {
          method: "POST",
          data: requestBody,
        },
      );

      // 创建下载链接
      const url = URL.createObjectURL(response.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `用户画像_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("导出用户画像失败:", error);
      throw error;
    }
  }
}

// 创建服务实例
export const userProfileService = new UserProfileService();

// 导出服务类
export default UserProfileService;
