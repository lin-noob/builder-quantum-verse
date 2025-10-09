import { request } from "@/lib/request";
import {
  MessageType,
  MessageStatus,
  Message,
  MessageResponse,
  GetMessageParams,
} from "./messageCenterService";

// 模拟消息数据
const mockMessages: Message[] = [
  {
    id: "1",
    title: "系统维护通知",
    content: "系统将于今晚23:00-01:00进行维护，期间可能影响部分功能使用。",
    type: MessageType.SYSTEM,
    status: MessageStatus.UNREAD,
    createdAt: "2024-01-15T10:30:00Z",
    priority: 3,
    sender: "系统管理员",
    category: "维护",
  },
  {
    id: "2",
    title: "新功能上线",
    content: "消息中心功能已正式上线，您可以在此查看所有系统通知和重要消息。",
    type: MessageType.NOTIFICATION,
    status: MessageStatus.UNREAD,
    createdAt: "2024-01-15T09:15:00Z",
    priority: 2,
    sender: "产品团队",
    category: "功能更新",
  },
  {
    id: "3",
    title: "安全警告",
    content: "检测到您的账户在异地登录，如非本人操作请及时修改密码。",
    type: MessageType.ALERT,
    status: MessageStatus.READ,
    createdAt: "2024-01-14T16:45:00Z",
    readAt: "2024-01-14T17:00:00Z",
    priority: 5,
    sender: "安全中心",
    category: "安全",
  },
  {
    id: "4",
    title: "版本更新",
    content: "系统已更新至v2.1.0版本，新增多项功能优化和性能提升。",
    type: MessageType.UPDATE,
    status: MessageStatus.READ,
    createdAt: "2024-01-14T14:20:00Z",
    readAt: "2024-01-14T15:30:00Z",
    priority: 1,
    sender: "技术团队",
    category: "更新",
  },
  {
    id: "5",
    title: "数据备份完成",
    content: "每日数据备份已成功完成，您的数据安全得到保障。",
    type: MessageType.SYSTEM,
    status: MessageStatus.READ,
    createdAt: "2024-01-14T02:00:00Z",
    readAt: "2024-01-14T08:30:00Z",
    priority: 1,
    sender: "系统管理员",
    category: "备份",
  },
  {
    id: "6",
    title: "活动通知",
    content: "新年促销活动即将开始，敬请期待更多优惠信息。",
    type: MessageType.NOTIFICATION,
    status: MessageStatus.UNREAD,
    createdAt: "2024-01-13T18:30:00Z",
    priority: 2,
    sender: "营销团队",
    category: "活动",
  },
];

// 模拟延迟函数
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 模拟消息服务类
class MockMessageCenterService {
  private messages: Message[] = [...mockMessages];

  /**
   * 获取消息列表
   * @param params 查询参数
   * @returns 消息列表和分页信息
   */
  async getMessages(params: GetMessageParams = {}): Promise<MessageResponse> {
    const { page = 1, pageSize = 10, type, status, category, search } = params;

    const searchParams: any = {
      pagesize: pageSize,
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
      ({ id, name, type, status }) => ({
        id,
        title: name,
        type,
        status,
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
    // 模拟网络延迟
    await delay(200);

    const messageIndex = this.messages.findIndex((msg) => msg.id === messageId);
    if (messageIndex === -1) {
      throw new Error(`消息 ${messageId} 不存在`);
    }

    const message = this.messages[messageIndex];
    if (message.status === MessageStatus.UNREAD) {
      this.messages[messageIndex] = {
        ...message,
        status: MessageStatus.READ,
        readAt: new Date().toISOString(),
      };
    }

    return this.messages[messageIndex];
  }

  /**
   * 批量标记消息为已读
   * @param messageIds 消息ID数组
   * @returns 操作结果
   */
  async markMultipleAsRead(messageIds: string[]): Promise<void> {
    // 模拟网络延迟
    await delay(300);

    const now = new Date().toISOString();
    messageIds.forEach((messageId) => {
      const messageIndex = this.messages.findIndex(
        (msg) => msg.id === messageId,
      );
      if (
        messageIndex !== -1 &&
        this.messages[messageIndex].status === MessageStatus.UNREAD
      ) {
        this.messages[messageIndex] = {
          ...this.messages[messageIndex],
          status: MessageStatus.READ,
          readAt: now,
        };
      }
    });
  }

  /**
   * 删除消息
   * @param messageId 消息ID
   * @returns 操作结果
   */
  async deleteMessage(messageId: string): Promise<void> {
    // 模拟网络延迟
    await delay(200);

    const messageIndex = this.messages.findIndex((msg) => msg.id === messageId);
    if (messageIndex === -1) {
      throw new Error(`消息 ${messageId} 不存在`);
    }

    this.messages.splice(messageIndex, 1);
  }

  /**
   * 批量删除消息
   * @param messageIds 消息ID数组
   * @returns 操作结果
   */
  async deleteMultipleMessages(messageIds: string[]): Promise<void> {
    // 模拟网络延迟
    await delay(300);

    this.messages = this.messages.filter((msg) => !messageIds.includes(msg.id));
  }

  /**
   * 获取未读消息数量
   * @returns 未读消息数量
   */
  async getUnreadCount(): Promise<number> {
    // 模拟网络延迟
    const res = await request.get("/admin/api/v1/message/count");
    const data = res.data;

    return Number(data);
  }
}

export const mockMessageCenterService = new MockMessageCenterService();
