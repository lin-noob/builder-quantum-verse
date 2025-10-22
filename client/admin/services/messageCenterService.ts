import { request } from "@/lib/request";

// 消息类型枚举
export enum MessageType {
  SYSTEM, // 系统消息
  NOTIFICATION, // 通知
  ALERT, // 警告
  UPDATE, // 更新
}

// 消息状态枚举
export enum MessageStatus {
  UNREAD, // 未读
  READ, // 已读
}

// 消息接口
export interface Message {
  id: string;
  title: string;
  content: string;
  type: MessageType;
  status: MessageStatus;
  createdAt: string;
  readAt?: string;
  priority: number; // 优先级，数值越大越重要
  sender?: string; // 发送者
  category?: string; // 分类
  link?: string; // 相关链接
}

// 分页响应接口
export interface MessageResponse {
  messages: Message[];
  total: number;
  page: number;
  pageSize: number;
}

// 获取消息列表参数
export interface GetMessageParams {
  page?: number;
  pageSize?: number;
  type?: MessageType;
  status?: MessageStatus;
  category?: string;
  search?: string;
}

// 消息服务类
class MessageCenterService {
  /**
   * 获取消息列表
   * @param params 查询参数
   * @returns 消息列表和分页信息
   */
  async getMessages(params: GetMessageParams = {}): Promise<MessageResponse> {
    const { page = 1, pageSize = 10, type, status, category, search } = params;

    const searchParams: any = {
      pageSize,
      currentpage: page,
    };

    if (search) {
      searchParams.name = search;
    }

    if (status || status === 0) {
      searchParams.status = status;
    }

    if (type || type === 0) {
      searchParams.type = type;
    }

    const res = await request.get("/admin/api/v1/message/page", searchParams);
    const data = res.data.data;
    const paginatedMessages = data.records.map(
      ({ id, title, type, status, gmtCreate }) => ({
        id,
        title,
        type,
        status,
        createdAt: gmtCreate,
      }),
    );
    const total = data.total;

    return {
      messages: paginatedMessages,
      total,
      page,
      pageSize,
    };
  }

  /**
   * 标记消息为已读
   * @param messageId 消息ID
   * @returns 更新后的消息
   */
  async markAsRead(messageId: string): Promise<Message> {
    try {
      const formData = new FormData();
      formData.append("ids", messageId);
      const response = await request.post<Message>(
        `/admin/api/v1/message/read`,
        formData,
      );
      return response.data;
    } catch (error) {
      console.error("标记消息为已读失败:", error);
      throw error;
    }
  }

  /**
   * 批量标记消息为已读
   * @param messageIds 消息ID数组
   * @returns 操作结果
   */
  async markMultipleAsRead(messageIds: string[]): Promise<void> {
    try {
      const formData = new FormData();
      formData.append("ids", messageIds.join(","));
      await request.post("/admin/api/v1/message/read", formData);
    } catch (error) {
      console.error("批量标记消息为已读失败:", error);
      throw error;
    }
  }

  /**
   * 删除消息
   * @param messageId 消息ID
   * @returns 操作结果
   */
  async deleteMessage(messageId: string): Promise<void> {
    try {
      const formData = new FormData();
      formData.append("ids", messageId);
      await request.delete(`/admin/api/v1/message/delete`);
    } catch (error) {
      console.error("删除消息失败:", error);
      throw error;
    }
  }

  /**
   * 批量删除消息
   * @param messageIds 消息ID数组
   * @returns 操作结果
   */
  async deleteMultipleMessages(messageIds: string[]): Promise<void> {
    try {
      const formData = new FormData();
      formData.append("ids", messageIds.join(","));
      await request.post("/admin/api/v1/message/delete", formData);
    } catch (error) {
      console.error("批量删除消息失败:", error);
      throw error;
    }
  }

  /**
   * 获取未读消息数量
   * @returns 未读消息数量
   */
  async getUnreadCount(): Promise<number> {
    // 模拟网络延迟
    const res = await request.get("/admin/api/v1/message/count");
    const data = res.data.data;

    return Number(data);
  }
}

export const messageCenterService = new MessageCenterService();
