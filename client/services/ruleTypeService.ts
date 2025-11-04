import { request } from "@/lib/request";

/**
 * 规则类型（自定义事件）接口
 */
export interface RuleType {
  id: string;
  eventName: string;
  createTime?: string;
  updateTime?: string;
}

/**
 * 规则类型服务
 */
class RuleTypeService {
  /**
   * 获取所有自定义事件列表
   */
  async list(): Promise<RuleType[]> {
    try {
      const response = await request.get<{ data: RuleType[] }>(
        "/quote/api/v1/ruletype/list"
      );
      return response.data.data || [];
    } catch (error) {
      console.error("Failed to fetch rule types:", error);
      return [];
    }
  }

  /**
   * 创建新的自定义事件
   */
  async create(eventName: string): Promise<RuleType> {
    const response = await request.post<{ data: RuleType }>(
      "/quote/api/v1/ruletype",
      { eventName }
    );
    return response.data.data;
  }

  /**
   * 删除自定义事件
   */
  async delete(id: string): Promise<void> {
    await request.delete(`/quote/api/v1/ruletype`, {
      data: { id },
    });
  }
}

export const ruleTypeService = new RuleTypeService();
