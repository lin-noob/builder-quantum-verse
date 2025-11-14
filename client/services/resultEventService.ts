import { request } from "@/lib/request";

/**
 * 结果事件创建请求参数
 */
export interface CreateResultEventRequest {
  /** 规则名称 */
  ruleName: string;
  /** 事件标识（outcome_code） */
  eventIdentifier: string;
  /** 细化标识（键值对序列化成字符串） */
  detailIdentifier: string;
  /** 启用标志 */
  enableFlag: boolean;
  /** 备注 */
  remark: string;
}

/**
 * 结果事件更新请求参数（与创建相同，但增加 id 字段）
 */
export interface UpdateResultEventRequest extends CreateResultEventRequest {
  /** 结果事件 ID */
  id: string;
}

/**
 * 结果事件响应数据
 */
export interface ResultEvent {
  id: string;
  ruleName: string;
  eventIdentifier: string;
  detailIdentifier: string;
  enableFlag: boolean;
  remark: string;
  createTime?: string;
  updateTime?: string;
}

/**
 * 结果事件服务
 */
class ResultEventService {
  /**
   * 创建结果事件
   */
  async create(data: CreateResultEventRequest): Promise<ResultEvent> {
    const response = await request.post<{ data: ResultEvent }>(
      "/quote/api/v1/rule/result",
      data
    );
    return response.data.data;
  }

  /**
   * 更新结果事件
   */
  async update(id: string, data: CreateResultEventRequest): Promise<ResultEvent> {
    const response = await request.put<{ data: ResultEvent }>(
      `/quote/api/v1/rule/result`,
      { ...data, id }
    );
    return response.data.data;
  }

  /**
   * 删除结果事件
   */
  async delete(id: string): Promise<void> {
    await request.delete(`/quote/api/v1/rule/result`, {
      data: { id }
    });
  }

  /**
   * 获取结果事件列表
   */
  async list(): Promise<ResultEvent[]> {
    try {
      const response = await request.get<{ data: ResultEvent[] }>(
        "/quote/api/v1/rule/result/list"
      );
      return response.data.data || [];
    } catch (error) {
      console.error("Failed to fetch result events:", error);
      return [];
    }
  }

  /**
   * 获取结果事件详情
   */
  async get(id: string): Promise<ResultEvent> {
    const response = await request.get<{ data: ResultEvent }>(
      `/quote/api/v1/rule/result/${id}`
    );
    return response.data.data;
  }

  /**
   * 移动结果事件位置（重新排序）
   * @param sourceId - Source result event ID
   * @param targetId - Target result event ID
   */
  async move(sourceId: string, targetId: string): Promise<void> {
    const formData = new FormData();
    formData.append("sourceId", sourceId);
    formData.append("targetId", targetId);

    await request.post("/quote/api/v1/rule/result/move", formData);
  }
}

export const resultEventService = new ResultEventService();
