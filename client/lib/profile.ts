import { request } from "@/lib/request";

// Keep this aligned with the API user shape used in list API
export interface ApiLabel {
  id?: number; // may be absent per backend response
  labelName: string;
  cdpUserId?: string;
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
  labelList?: ApiLabel[]; // backend field name
}

interface ApiEnvelope<T> {
  code: string;
  data: T;
  msg: string;
  total?: number;
}

export async function getProfileView(id: string): Promise<ApiUser | null> {
  // GET /quote/api/v1/profile/view/{id}
  const response = await request.get<ApiEnvelope<ApiUser>>(
    `/quote/api/v1/profile/view/${encodeURIComponent(id)}`,
  );

  // response is ApiResponse<ApiEnvelope<ApiUser>> per our request helper
  const envelope = response as unknown as ApiEnvelope<ApiUser> | any;
  if (envelope && envelope.data) {
    return envelope.data as ApiUser;
  }

  // Fallback if backend returns raw object
  return (response as any)?.data ?? null;
}

export interface LabelUpdateItem {
  cdpUserId: string;
  labelName: string;
}

export async function addProfileLabel(
  cdpUserId: string,
  labelName: string,
): Promise<boolean> {
  const payload: LabelUpdateItem = { cdpUserId, labelName };
  const res = await request.post<ApiEnvelope<unknown>>(
    "/quote/api/v1/profile/label/add",
    payload,
    { headers: { "Content-Type": "application/json" } },
  );
  const envelope = res as unknown as ApiEnvelope<unknown> | any;
  if (envelope && (envelope.code === "201" || envelope.code === "200")) return true;
  if ((res as any)?.success) return true;
  throw new Error((envelope && envelope.msg) || "添加标签失败");
}

export async function deleteProfileLabel(id: string): Promise<boolean> {
  const res = await request.post<ApiEnvelope<unknown>>(
    "/quote/api/v1/profile/label/delete",
    { id },
    { headers: { "Content-Type": "application/json" } },
  );
  const envelope = res as unknown as ApiEnvelope<unknown> | any;
  if (envelope && (envelope.code === "201" || envelope.code === "200")) return true;
  if ((res as any)?.success) return true;
  throw new Error((envelope && envelope.msg) || "删除标签失败");
} 