import { request } from "@/lib/request";

// Keep this aligned with the API user shape used in list API
export interface ApiLabel {
  id?: number; // may be absent per backend response
  labelName: string;
  cdpUserId?: string;
}

// Event data structure based on the provided eventList format
export interface ApiEvent {
  id: string;
  gmtCreate: string;
  gmtModified: string;
  tenantId: string;
  eventName: string;
  userId: string;
  timestamp: string;
  properties: string; // JSON string containing order details
  userName: string;
  price: number;
  currency: string;
  eventType: number;
  nullId: boolean;
}

// Event list response structure
export interface ApiEventListResponse {
  records: ApiEvent[];
  total: number;
  size: number;
  current: number;
  orders: any[];
  optimizeCountSql: boolean;
  searchCount: boolean;
  countId: string | null;
  maxLimit: string | null;
  pages: number;
}

export interface ApiUser {
  id?: string;
  cdpUserId: number;
  fullName: string;
  contactInfo: string;
  companyName: string;
  signTime: string;
  createGmt: string;
  minBuyTime: string;
  maxBuyTime: string;
  maxOrderAmount: number;
  totalOrders: number; // API total amount naming
  orderCount: number;
  loginDate: string;
  location: string;
  shopid: string;
  currencySymbol: string;
  sessionId: string;
  labelList?: ApiLabel[]; // backend field name
  eventList?: ApiEventListResponse; // Add eventList field
}

interface ApiEnvelope<T> {
  code: string;
  data: T;
  msg: string;
  total?: number;
}

export async function getProfileView(id: string): Promise<ApiUser | null> {
  // 在开发环境中，如果是localhost或者没有真实后���，返回模拟数据
  if (process.env.NODE_ENV === 'development' &&
      (window.location.hostname === 'localhost' || window.location.hostname.includes('fly.dev'))) {
    console.log('Using mock data for getProfileView in development environment');

    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 200));

    return {
      id,
      name: `User ${id}`,
      email: `user${id}@example.com`,
      phone: `+86 138-0000-${id.padStart(4, '0')}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
      status: 'active',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-20T00:00:00Z',
      labels: [`标签${id}`, '活跃用户'],
      metadata: {}
    };
  }

  try {
    // GET /quote/api/v1/profile/view/{id}
    const response = await request.get<ApiEnvelope<ApiUser>>(
      `/quote/api/v1/profile/view/${encodeURIComponent(id)}`,
      undefined,
      { timeout: 5000 }
    );

    // response is ApiResponse<ApiEnvelope<ApiUser>> per our request helper
    const envelope = response as unknown as ApiEnvelope<ApiUser> | any;
    if (envelope && envelope.data) {
      return envelope.data as ApiUser;
    }

    // Fallback if backend returns raw object
    return (response as any)?.data ?? null;
  } catch (error) {
    console.error("Failed to fetch profile view:", error);
    if (process.env.NODE_ENV === 'development') {
      console.log('API call failed, returning mock data in development');
      // 返回模拟数据作为降级
      return {
        id,
        name: `User ${id}`,
        email: `user${id}@example.com`,
        phone: `+86 138-0000-${id.padStart(4, '0')}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-20T00:00:00Z',
        labels: [`标签${id}`, '活跃用户'],
        metadata: {}
      };
    }
    return null;
  }
}

// Get user event/order list with pagination
export async function getUserEventList(
  userId: string,
  sessionId: string,
  page: number = 1,
  size: number = 10,
  eventType: number = 0, // 0 for order data, 1 for behavior data
): Promise<ApiEventListResponse | null> {
  // 在开发环境中，如果是localhost或者没有真实后端，返回模拟数据
  if (process.env.NODE_ENV === 'development' &&
      (window.location.hostname === 'localhost' || window.location.hostname.includes('fly.dev'))) {
    console.log('Using mock data for getUserEventList in development environment');

    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
      current_page: page,
      total_pages: 3,
      total_count: 25,
      page_size: size,
      events: Array.from({ length: Math.min(size, 25 - (page - 1) * size) }, (_, index) => ({
        id: `event_${page}_${index}`,
        timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        event_type: eventType === 0 ? 'order' : 'behavior',
        data: eventType === 0
          ? { order_id: `ORD_${Math.random().toString(36).substr(2, 9)}`, amount: Math.random() * 1000 }
          : { action: 'page_view', page: '/products' }
      }))
    };
  }

  try {
    const requestBody = {
      currentpage: page,
      eventType: eventType,
      pagesize: size,
      userId: userId,
      sessionId,
    };

    const response = await request.request<ApiEnvelope<ApiEventListResponse>>(
      "/quote/api/v1/profile/order/list",
      {
        method: "POST",
        data: requestBody,
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 5000, // 减少超时时间到5秒
      },
    );

    const envelope = response as unknown as
      | ApiEnvelope<ApiEventListResponse>
      | any;
    if (envelope && envelope.data) {
      return envelope.data as ApiEventListResponse;
    }

    return (response as any)?.data ?? null;
  } catch (error) {
    console.error("Failed to fetch user event list:", error);
    return null;
  }
}

export interface LabelUpdateItem {
  cdpUserId: string;
  labelName: string;
}

export async function addProfileLabel(
  cdpUserId: string,
  labelName: string,
): Promise<boolean> {
  // 在开发环境中，如果是localhost或者没有真实后端，返回模拟数据
  if (process.env.NODE_ENV === 'development' &&
      (window.location.hostname === 'localhost' || window.location.hostname.includes('fly.dev'))) {
    console.log('Using mock data for addProfileLabel in development environment');

    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 300));

    return true; // 模拟成功添加标签
  }

  try {
    const payload: LabelUpdateItem = { cdpUserId, labelName };
    const res = await request.post<ApiEnvelope<unknown>>(
      "/quote/api/v1/profile/label/add",
      payload,
      {
        headers: { "Content-Type": "application/json" },
        timeout: 5000
      },
    );
    const envelope = res as unknown as ApiEnvelope<unknown> | any;
    if (envelope && (envelope.code === "201" || envelope.code === "200"))
      return true;
    if ((res as any)?.success) return true;
    throw new Error((envelope && envelope.msg) || "添加标签失败");
  } catch (error) {
    console.error("Failed to add profile label:", error);
    if (process.env.NODE_ENV === 'development') {
      console.log('API call failed, returning mock success in development');
      return true; // 开发环境模拟成功
    }
    throw error;
  }
}

export async function deleteProfileLabel(id: string): Promise<boolean> {
  // 在开发环境中，如果是localhost或者没有真实后端，返回模拟数据
  if (process.env.NODE_ENV === 'development' &&
      (window.location.hostname === 'localhost' || window.location.hostname.includes('fly.dev'))) {
    console.log('Using mock data for deleteProfileLabel in development environment');

    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 300));

    return true; // 模拟成功删除标签
  }

  try {
    const res = await request.post<ApiEnvelope<unknown>>(
      "/quote/api/v1/profile/label/delete",
      { id },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 5000
      },
    );
    const envelope = res as unknown as ApiEnvelope<unknown> | any;
    if (envelope && (envelope.code === "201" || envelope.code === "200"))
      return true;
    if ((res as any)?.success) return true;
    throw new Error((envelope && envelope.msg) || "删除标签失败");
  } catch (error) {
    console.error("Failed to delete profile label:", error);
    if (process.env.NODE_ENV === 'development') {
      console.log('API call failed, returning mock success in development');
      return true; // 开发环境模拟成功
    }
    throw error;
  }
}
