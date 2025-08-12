import { request } from "@/lib/request";

// Keep this aligned with the API user shape used in list API
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