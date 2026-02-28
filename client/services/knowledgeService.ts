import { Request } from "@/lib/request";

/**
 * Knowledge related services for managing digital objects and instances.
 */
export const knowledgeService = {
  /**
   * Upload an Excel/CSV/JSON file to populate instances for a specific model.
   *
   * @param modelId The numeric ID of the knowledge node/model
   * @param file The file object to upload
   */
  uploadExcel: async (modelId: number | string, file: File, create: boolean) => {
    const request = new Request();
    const formData = new FormData();
    formData.append("modelId", String(modelId));
    formData.append("file", file);
    formData.append("create", String(create));

    return request.request("/quote/api/v1/digital/uploadExcel", {
      method: "POST",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  /**
   * Fetch all knowledge nodes (schema data)
   */
  fetchNodes: async (search?: string) => {
    const request = new Request();
    return request.request("/quote/api/v1/digital/list", {
      method: "GET",
      params: { objectName: search },
    });
  },
};
