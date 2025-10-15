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
  userId: string;
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
      return envelope.data.data as ApiUser;
    }

    // Fallback if backend returns raw object
    return (response as any)?.data ?? null;
  } catch (error) {
    console.error("Failed to fetch profile view:", error);
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
  try {
    const requestBody = {
      currentpage: page,
      eventType: eventType,
      pagesize: size,
      userId: userId,
      sessionId,
    };

    const response = await request.post<ApiEnvelope<ApiEventListResponse>>(
      "/quote/api/v1/profile/order/list",
      requestBody,
    );
    
    const envelope = response as unknown as
      | ApiEnvelope<ApiEventListResponse>
      | any;
    if (envelope && envelope.data) {
      return envelope.data.data as ApiEventListResponse;
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
    console.log(res);
    const data = res.data;
    if (data && (data.code === "201" || data.code === "200"))
      return true;
    if ((res as any)?.success) return true;
    throw new Error((data && data.msg) || "添加标签失败");
  } catch (error) {
    throw error;
  }
}

export async function deleteProfileLabel(id: string): Promise<boolean> {
  try {
    const res = await request.post<ApiEnvelope<unknown>>(
      "/quote/api/v1/profile/label/delete",
      { id },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 5000
      },
    );
    const data = res.data;
    if (data && (data.code === "201" || data.code === "200"))
      return true;
    if ((res as any)?.success) return true;
    throw new Error((data && data.msg) || "删除标签失败");
  } catch (error) {
    throw error;
  }
}
