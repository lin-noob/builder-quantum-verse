import { request } from "@/lib/request";

export interface UTMRecord {
  id: string;
  bizId: string;
  changeReason?: string;
  companyId: string;
  gmtCreate: string;
  gmtModified: string;
  status: number;
  targetUrl: string;
  title: string;
  utmCampaign: string;
  utmContent?: string;
  utmMedium: string;
  utmSource: string;
  utmTerm?: string;
  extraParams?: ExtraParam[] | string; // Can be array from UI or JSON string from backend
  version: number;
}

export interface ExtraParam {
  key: string;
  value: string;
}

export interface UTMListResponse {
  records: UTMRecord[];
  total: number;
  current: number;
  pageSize: number;
}

export interface UTMQueryParams {
  page?: number;
  size?: number;
  search?: string;
  status?: number; // 0 for active, 1 for archived
}

export const utmService = {
  /**
   * 获取UTM记录分页列表
   */
  getUTMList: async (params: UTMQueryParams = {}): Promise<UTMListResponse> => {
    const queryParams: Record<string, any> = {
      currentpage: params.page || 1,
      pageSize: params.size || 10,
    };

    if (params.search) {
      queryParams.name = params.search;
    }

    if (params.status !== undefined) {
      queryParams.status = params.status;
    }

    const response = await request.get("/admin/api/v1/utm/page", queryParams);
    return response.data.data; // Assuming the response follows { code: string, data: { records, total, current, pageSize }, msg: string }
  },

  /**
   * 删除UTM记录
   */
  deleteUTM: async (id: string) => {
    const data = {
      id,
    };
    const response = await request.delete(`/admin/api/v1/utm`, { data });
    return response.data;
  },

  /**
   * 归档/取消归档UTM记录
   */
  toggleArchive: async (id: string, archived: boolean) => {
    const formData = new FormData();
    formData.append('id', id);
    formData.append('archived', archived ? '1' : '0');
    
    const response = await request.post('/admin/api/v1/utm/archive', formData);
    return response.data;
  },

  /**
   * 创建UTM记录
   */
  createUTM: async (
    utmData: Omit<
      UTMRecord,
      "id" | "gmtCreate" | "gmtModified" | "bizId" | "version"
    >,
  ) => {
    // Map frontend format to backend format
    const backendData = {
      title: utmData.title,
      targetUrl: utmData.targetUrl,
      utmSource: utmData.utmSource,
      utmMedium: utmData.utmMedium,
      utmCampaign: utmData.utmCampaign,
      utmTerm: utmData.utmTerm,
      utmContent: utmData.utmContent,
      extraParams: utmData.extraParams
        ? JSON.stringify(utmData.extraParams)
        : undefined,
      status: utmData.status || 0, // default status
      companyId: utmData.companyId || "",
      changeReason: utmData.changeReason || "",
    };

    const response = await request.post("/admin/api/v1/utm", backendData);
    return response.data.data;
  },

  /**
   * 更新UTM记录
   */
  updateUTM: async (id: string, utmData: Partial<UTMRecord>) => {
    const response = await request.put(
      `/admin/api/v1/utm/update/${id}`,
      utmData,
    );
    return response.data.data;
  },
};
