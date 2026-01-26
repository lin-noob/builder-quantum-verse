import { request } from "@/lib/request";

export interface ColumnSetting {
  columnKey: string;
  columnLabel: string;
  columnType: string;
  description?: string;
  enabled: boolean;
  gmtCreate?: string;
  gmtModified?: string;
  id?: number;
  projectId?: number;
  sortOrder: number;
  sourceField?: string;
  tenantId?: string;
  width?: number;
}

export const userProfileService = {
  // Get column settings list
  getColumnSettings: async () => {
    return (await request.get<{ data: ColumnSetting[] }>("/quote/api/v1/profile/setting/list")).data;
  },

  // Save column settings (batch update)
  saveColumnSettings: async (settings: Partial<ColumnSetting>[]) => {
    return request.post("/quote/api/v1/profile/setting", settings);
  },

  // Move column setting (reorder)
  moveColumnSetting: async (data: { id: number; sortOrder: number }) => {
    return request.post("/quote/api/v1/profile/setting/move", {
      data,
    });
  },
};
