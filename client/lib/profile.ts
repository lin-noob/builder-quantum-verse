import { request } from "@/lib/request";
import { EventType } from "@shared/eventRuleTypes";

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
  targetEvent: string;
  userId: string;
  timestamp: string;
  properties: string; // JSON string containing order details
  userName: string;
  price: number;
  currency: string;
  eventType: number;
}

// Element interface for PostHog $elements array
export interface PostHogElement {
  tag_name?: string;
  attr__id?: string;
  attr__class?: string;
  classes?: string[];
  nth_child?: number;
  nth_of_type?: number;
  $el_text?: string;
  attr__data_gtm_form_interact_id?: string;
}

// Parsed event data structure
export interface ParsedEventData {
  id: string;
  eventTime: string;
  eventType: EventType;
  targetEvent: string;
  source: string;
  deviceType: string;
  pageTitle: string;
  pageURL: string;
  browser?: string;
  os?: string;
  dwellTimeMs?: number;
  maxScrollDepth?: number;
  maxDepthPercent?: number;
  elementTag?: string;
  elementText?: string;
  referrer?: string;
  // Product related fields for ViewProduct event
  productId?: string;
  productName?: string;
  productCategory?: string;
  productPrice?: number | string;
  productCurrency?: string;
  productBrand?: string;
  // PostHog specific fields
  $event_type?: string;
  $browser_version?: number;
  $timezone?: string;
  $current_url?: string;
  $referrer?: string;
  $pathname?: string;
  $elements?: PostHogElement[];
  $elements_chain?: string;
  cusEventType?: string;
  $screen_width?: number;
  $screen_height?: number;
  $viewport_width?: number;
  $viewport_height?: number;
  gmtCreate?: string;
  // Matched attribute key and properties
  matched_attribute_key?: Array<{ key: string; value: string }>;
  properties?: any;
}

export interface SessionEvent {
  endTime: number;
  eventCount: number;
  startTime: number;
  sessionId: string;
  eventList: ParsedEventData[];
}

export interface ApiSessionEvent {
  endTime: number;
  eventCount: number;
  startTime: number;
  sessionId: string;
  eventList: ApiEvent[];
}

// Event list response structure
export interface ApiEventListResponse {
  records: ApiSessionEvent[];
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

export interface ApiUser extends UserProfile {
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
  userEngagement?: {
    bounceRate30d: number;
    eventCount7d: number;
    eventCount30d: number;
    pageView30d: number;
    pageView30dTotal: number;
    sessionCount30d: number;
  };
}

interface UserProfile {
  dclid?: string;
  epik?: string;
  fbclid?: string;
  gad_source?: string;
  gbraid?: string;
  gclid?: string;
  gclsrc?: string;
  igshid?: string;
  irclid?: string;
  li_fat_id?: string;
  mc_cid?: string;
  msclkid?: string;
  qclid?: string;
  rdt_cid?: string;
  sccid?: string;
  ttclid?: string;
  twclid?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_medium?: string;
  utm_source?: string;
  utm_term?: string;
  wbraid?: string;
  _kx?: string;

  firstVisitSource?: string;
  firstReferrer?: string;
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
      { timeout: 5000 },
    );

    // response is ApiResponse<ApiEnvelope<ApiUser>> per our request helper
    const envelope = response as unknown as ApiEnvelope<ApiUser> | any;
    if (envelope && envelope.data) {
      const data = envelope.data.data;
      const userProfile = data?.userProfile;
      const properties = userProfile?.properties
        ? JSON.parse(userProfile.properties)
        : null;

      data.dclid = properties?.dclid;
      data.epik = properties?.epik;
      data.fbclid = properties?.fbclid;
      data.gad_source = properties?.gad_source;
      data.gbraid = properties?.gbraid;
      data.gclid = properties?.gclid;
      data.gclsrc = properties?.gclsrc;
      data.igshid = properties?.igshid;
      data.irclid = properties?.irclid;
      data.li_fat_id = properties?.li_fat_id;
      data.mc_cid = properties?.mc_cid;
      data.msclkid = properties?.msclkid;
      data.qclid = properties?.qclid;
      data.rdt_cid = properties?.rdt_cid;
      data.sccid = properties?.sccid;
      data.ttclid = properties?.ttclid;
      data.twclid = properties?.twclid;
      data.utm_campaign = properties?.utm_campaign;
      data.utm_content = properties?.utm_content;
      data.utm_medium = properties?.utm_medium;
      data.utm_source = properties?.utm_source;
      data.utm_term = properties?.utm_term;
      data.wbraid = properties?.wbraid;
      data._kx = properties?._kx;
      data.firstReferrer = properties?.$referring_domain;
      return data as ApiUser;
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
  filters?: {
    pageUrl?: string;
    eventName?: string;
    source?: string;
    device?: string;
    startDate?: Date;
    endDate?: Date;
  },
): Promise<ApiEventListResponse | null> {
  try {
    const requestBody: any = {
      currentpage: page,
      eventType: eventType,
      pagesize: size,
      userId: userId,
      sessionId,
    };

    // Add optional filters if provided
    if (filters) {
      if (filters.pageUrl) requestBody.pageUrl = filters.pageUrl;
      if (filters.eventName) requestBody.eventName = filters.eventName;
      if (filters.source) requestBody.source = filters.source;
      if (filters.device) requestBody.device = filters.device;
      if (filters.startDate) requestBody.startDate = filters.startDate.toISOString();
      if (filters.endDate) requestBody.endDate = filters.endDate.toISOString();
    }

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
        timeout: 5000,
      },
    );
    console.log(res);
    const data = res.data;
    if (data && (data.code === "201" || data.code === "200")) return true;
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
        timeout: 5000,
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
