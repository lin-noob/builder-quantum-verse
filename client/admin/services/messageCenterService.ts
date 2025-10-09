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
    try {
      const response = await request.get<MessageResponse>("/api/admin/api/v1/messages", params);
      return response.data;
    } catch (error) {
      console.error("获取消息列表失败:", error);
      throw error;
    }
  }

  /**
   * 标记消息为已读
   * @param messageId 消息ID
   * @returns 更新后的消息
   */
  async markAsRead(messageId: string): Promise<Message> {
    try {
      const response = await request.put<Message>(`/api/admin/api/v1/messages/${messageId}/read`);
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
      await request.post("/api/admin/api/v1/messages/read", { messageIds });
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
      await request.delete(`/api/admin/api/v1/messages/${messageId}`);
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
      await request.post("/api/admin/api/v1/messages/delete", { messageIds });
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
    try {
      const response = await request.get<{ count: number }>("/api/admin/api/v1/messages/unread-count");
      return response.data.count;
    } catch (error) {
      console.error("获取未读消息数量失败:", error);
      throw error;
    }
  }
}

export const messageCenterService = new MessageCenterService();