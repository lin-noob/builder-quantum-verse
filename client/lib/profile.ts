import { request } from "@/lib/request";
import { MockDataService } from "@/services/mockDataService";
import useProjectStore from "@/stores/projectStore";

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
  distinctId: string;
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
  // 新增用于总览展示的字段（可选，后端缺失时由演示模式提供）
  firstReferrer?: string;
  firstVisitSource?: string;
  firstVisitMedium?: string;
  firstVisitCampaign?: string;
  firstVisitContent?: string;
  firstVisitTerm?: string;
  gclid?: string;
  gad_source?: string;
  gclsrc?: string;
  gbraid?: string;
  wbraid?: string;
  token?: string;
  title?: string;
  fbclid?: string;
  msclkid?: string;
  ttclid?: string;
  twclid?: string;
  qclid?: string;
  dclid?: string;
  rdt_cid?: string;
  irclid?: string;
  li_fat_id?: string;
  mc_cid?: string;
  sccid?: string;
  igshid?: string;
  _kx?: string;
  epik?: string;
  ltv90Days?: number;
  // 5+2扩展指标（演示或未来后端扩展）
  sessions30d?: number;
  pageviews30d?: number;
  aov30d?: number;
  bounceRate?: number; // 0..1
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

    const envelope = response as unknown as ApiEnvelope<ApiUser> | any;
    if (envelope && envelope.data) {
      const data = envelope.data.data as ApiUser;
      if (data) return data;
    }

    const raw = (response as any)?.data ?? null;
    if (raw) return raw as ApiUser;

    // 如果无数据，尝试演示模式回退
    if (MockDataService.shouldUseMockData()) {
      const demo = await MockDataService.getApiUserById(id);
      if (demo) return demo;
    }

    return null;
  } catch (error) {
    console.error("Failed to fetch profile view:", error);
    if (MockDataService.shouldUseMockData()) {
      const demo = await MockDataService.getApiUserById(id);
      if (demo) return demo;
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
  eventType: number = 0, // 0 for order data, 1/2 for behavior data
): Promise<ApiEventListResponse | null> {
  const { currentProject } = useProjectStore.getState();
  const noProjectSelected = !currentProject || !currentProject.id;

  // 未选择项目时，直接使用模拟数据，保证演示可用
    return await MockDataService.getMockEventList(userId, sessionId, page, size, eventType);

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

    // 优先解析标准包裹结构
    if (envelope && envelope.data) {
      const data = envelope.data.data as ApiEventListResponse;
      if (data && Array.isArray(data.records) && data.records.length > 0) {
        return data;
      }
      // 后端返回空记录时，在演示模式下回退到模拟数据
      if (MockDataService.shouldUseMockData()) {
        return await MockDataService.getMockEventList(userId, sessionId, page, size, eventType);
      }
      // 非演示模式返回原始空数据
      if (data) return data;
    }

    // 解析非标准结构
    const raw = (response as any)?.data ?? null;
    if (raw) {
      const rawData = raw as ApiEventListResponse;
      if (rawData && Array.isArray(rawData.records) && rawData.records.length > 0) {
        return rawData;
      }
      if (MockDataService.shouldUseMockData()) {
        return await MockDataService.getMockEventList(userId, sessionId, page, size, eventType);
      }
      return rawData;
    }

    // 无数据时，演示模式回退到模拟事件
    if (MockDataService.shouldUseMockData()) {
      return await MockDataService.getMockEventList(userId, sessionId, page, size, eventType);
    }

    return null;
  } catch (error) {
    console.error("Failed to fetch user event list:", error);
    // 发生错误时，若未选择项目或处于演示模式，则使用模拟数据
    if (noProjectSelected || MockDataService.shouldUseMockData()) {
      return await MockDataService.getMockEventList(userId, sessionId, page, size, eventType);
    }
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
    if (data && (data.code === "201" || data.code === "200")) return true;
    if ((res as any)?.success) return true;
    throw new Error((data && data.msg) || "删除标签失败");
  } catch (error) {
    throw error;
  }
}
