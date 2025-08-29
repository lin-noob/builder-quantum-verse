import { request } from "@/lib/request";

export interface GenerateSDKRequest {
  skdKey: string;
}

export interface GenerateSDKResponse {
  code: string;
  msg: string;
  data: {
    skdKey: string;
    tenantId: string;
  };
}

export interface CheckSDKResponse {
  code: string;
  msg: string;
  data: {
    exists: boolean;
    skdKey?: string;
    tenantId?: string;
  };
}

export const sdkService = {
  generateSDK: async (
    data: GenerateSDKRequest,
  ): Promise<GenerateSDKResponse> => {
    try {
      // 实际API调用
      const response = await request.post<GenerateSDKResponse>(
        "/quote/api/v1/sdk",
        data,
      );
      return response.data;
    } catch (error) {
      console.error("生成SDK失败:", error);
      throw error;
    }
  },

  checkSDK: async (): Promise<CheckSDKResponse> => {
    try {
      // 检查SDK是否存在
      const response = await request.get<CheckSDKResponse>(
        "/quote/api/v1/sdk/view"
      );
      return response.data;
    } catch (error) {
      console.error("检查SDK失败:", error);
      throw error;
    }
  },
};