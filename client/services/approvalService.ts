import {
  ApprovalWorkflow,
  ApprovalTemplate,
  ApprovalInstance,
  ApprovalHistory,
  ApprovalStatistics,
  DocumentType,
  ApprovalNode,
  ApprovalCondition,
  ApprovalUser,
} from "@/types/approval";
import { request } from "@/lib/request";

// API响应类型
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  code?: number;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 查询参数类型
interface WorkflowQueryParams {
  currentPage?: number;
  pageSize?: number;
  search?: string;
  billType?: number;
  status?: number;
}

interface TemplateQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  documentType?: DocumentType;
  category?: string;
  isActive?: boolean;
}

interface InstanceQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: "pending" | "approved" | "rejected" | "cancelled";
  submitterId?: string;
  approverId?: string;
  documentType?: DocumentType;
  startDate?: string;
  endDate?: string;
}

// 审批流程管理服务
class ApprovalService {
  private baseUrl = "/admin/api/v1/process";

  // ==================== 审批流程管理 ====================

  /**
   * 获取审批流程列表（分页）
   */
  async getWorkflows(
    params?: WorkflowQueryParams,
  ): Promise<ApiResponse<PaginatedResponse<ApprovalWorkflow>>> {
    try {
      const res = await request.get<any>(`${this.baseUrl}/page`, {
        currentpage: params?.currentPage || 1,
        pageSize: params?.pageSize || 10,
        name: params?.search || "",
        ...(params?.billType !== undefined && { billType: params.billType }),
        ...(params?.status !== undefined && { status: params.status }),
      });
      const response = res.data.data;
      console.log(response);

      return {
        success: true,
        data: {
          items: response.records || [],
          total: response.total || 0,
          page: params?.currentPage || 1,
          pageSize: params?.pageSize || 10,
          totalPages: Math.ceil(
            (response.total || 0) / (params?.pageSize || 10),
          ),
        },
      };
    } catch (error) {
      console.error("获取审批流程列表失败:", error);
      return {
        success: false,
        data: { items: [], total: 0, page: 1, pageSize: 10, totalPages: 0 },
        message:
          error instanceof Error ? error.message : "获取审批流程列表失败",
      };
    }
  }

  /**
   * 获取单个审批流程详情
   */
  async getWorkflow(id: string): Promise<ApiResponse<ApprovalWorkflow>> {
    try {
      const response = await fetch(`${this.baseUrl}/workflows/${id}`);
      return await response.json();
    } catch (error) {
      console.error("获取审批流程详情失败:", error);
      return {
        success: false,
        data: {} as ApprovalWorkflow,
        message: "获取审批流程详情失败",
      };
    }
  }

  /**
   * 创建审批流程
   */
  async createWorkflow(
    workflow: Omit<ApprovalWorkflow, "id">,
  ): Promise<ApiResponse<ApprovalWorkflow>> {
    try {
      const res = await request.post<ApprovalWorkflow>(
        `${this.baseUrl}/save`,
        workflow,
      );
      const response = res.data;
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      console.error("创建审批流程失败:", error);
      return {
        success: false,
        data: {} as ApprovalWorkflow,
        message: error instanceof Error ? error.message : "创建审批流程失败",
      };
    }
  }

  /**
   * 更新审批流程
   */
  async updateWorkflow(
    id: string,
    workflow: Partial<ApprovalWorkflow>,
  ): Promise<ApiResponse<ApprovalWorkflow>> {
    try {
      const res = await request.post<ApprovalWorkflow>(`${this.baseUrl}/save`, {
        ...workflow,
        id,
      });
      const response = res.data;
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      console.error("更新审批流程失败:", error);
      return {
        success: false,
        data: {} as ApprovalWorkflow,
        message: error instanceof Error ? error.message : "更新审批流程失败",
      };
    }
  }

  /**
   * 删除审批流程
   */
  async deleteWorkflow(id: string): Promise<ApiResponse<boolean>> {
    try {
      const formData = new FormData();
      formData.append("id", id);
      await request.delete(`${this.baseUrl}/${id}`, {
        data: formData,
      });
      return {
        success: true,
        data: false,
        message: "删除审批流程失败",
      };
    } catch (error) {
      console.error("删除审批流程失败:", error);
      return {
        success: false,
        data: false,
        message: "删除审批流程失败",
      };
    }
  }

  /**
   * 启用/禁用审批流程
   */
  async toggleWorkflowStatus(
    id: string | number,
    status: number | boolean,
  ): Promise<ApiResponse<ApprovalWorkflow>> {
    try {
      const formData = new FormData();
      formData.append("id", String(id));
      formData.append(
        "status",
        typeof status === "boolean" ? (status ? "1" : "0") : String(status),
      );

      const response = await request.post<any>(
        `${this.baseUrl}/${id}/status`,
        formData,
      );
      const payload = response.data ?? {};
      const successFlag =
        typeof payload?.success === "boolean" ? payload.success : true;
      const message =
        payload?.message || payload?.msg || response.statusText || "";
      const data = (payload?.data ?? payload) as ApprovalWorkflow;

      return {
        success: successFlag,
        data,
        message,
      };
    } catch (error) {
      console.error("切换审批流程状态失败:", error);
      return {
        success: false,
        data: {} as ApprovalWorkflow,
        message:
          error instanceof Error ? error.message : "切换审批流程状态失败",
      };
    }
  }

  /**
   * 复制审批流程
   */
  async cloneWorkflow(
    id: string,
    name?: string,
  ): Promise<ApiResponse<ApprovalWorkflow>> {
    try {
      const response = await fetch(`${this.baseUrl}/workflows/${id}/clone`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });
      return await response.json();
    } catch (error) {
      console.error("复制审批流程失败:", error);
      return {
        success: false,
        data: {} as ApprovalWorkflow,
        message: "复制审批流程失败",
      };
    }
  }

  // ==================== 审批模板管理 ====================

  /**
   * 获取审批模板列表
   */
  async getTemplates(
    params?: TemplateQueryParams,
  ): Promise<ApiResponse<PaginatedResponse<ApprovalTemplate>>> {
    try {
      const queryString = new URLSearchParams(params as any).toString();
      const response = await fetch(`${this.baseUrl}/templates?${queryString}`);
      return await response.json();
    } catch (error) {
      console.error("获取审批模板列表失败:", error);
      return {
        success: false,
        data: { items: [], total: 0, page: 1, pageSize: 10, totalPages: 0 },
        message: "获取审批模板列表失败",
      };
    }
  }

  /**
   * 获取单个审批模板详情
   */
  async getTemplate(id: string): Promise<ApiResponse<ApprovalTemplate>> {
    try {
      const response = await fetch(`${this.baseUrl}/templates/${id}`);
      return await response.json();
    } catch (error) {
      console.error("获取审批模板详情失败:", error);
      return {
        success: false,
        data: {} as ApprovalTemplate,
        message: "获取审批模板详情失败",
      };
    }
  }

  /**
   * 创建审批模板
   */
  async createTemplate(
    template: Omit<
      ApprovalTemplate,
      "id" | "createdAt" | "updatedAt" | "createdBy" | "usageCount"
    >,
  ): Promise<ApiResponse<ApprovalTemplate>> {
    try {
      const response = await fetch(`${this.baseUrl}/templates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(template),
      });
      return await response.json();
    } catch (error) {
      console.error("创建审批模板失败:", error);
      return {
        success: false,
        data: {} as ApprovalTemplate,
        message: "创建审批模板失败",
      };
    }
  }

  /**
   * 更新审批模板
   */
  async updateTemplate(
    id: string,
    template: Partial<ApprovalTemplate>,
  ): Promise<ApiResponse<ApprovalTemplate>> {
    try {
      const response = await fetch(`${this.baseUrl}/templates/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(template),
      });
      return await response.json();
    } catch (error) {
      console.error("更新审批模板失败:", error);
      return {
        success: false,
        data: {} as ApprovalTemplate,
        message: "更新审批模板失败",
      };
    }
  }

  /**
   * 删除审批模板
   */
  async deleteTemplate(id: string): Promise<ApiResponse<boolean>> {
    try {
      const response = await fetch(`${this.baseUrl}/templates/${id}`, {
        method: "DELETE",
      });
      return await response.json();
    } catch (error) {
      console.error("删除审批模板失败:", error);
      return {
        success: false,
        data: false,
        message: "删除审批模板失败",
      };
    }
  }

  /**
   * 设置默认模板
   */
  async setDefaultTemplate(
    id: string,
    documentType: DocumentType,
  ): Promise<ApiResponse<boolean>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/templates/${id}/set-default`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ documentType }),
        },
      );
      return await response.json();
    } catch (error) {
      console.error("设置默认模板失败:", error);
      return {
        success: false,
        data: false,
        message: "设置默认模板失败",
      };
    }
  }

  /**
   * 导入审批模板
   */
  async importTemplate(
    templateData: string,
  ): Promise<ApiResponse<ApprovalTemplate>> {
    try {
      const response = await fetch(`${this.baseUrl}/templates/import`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ templateData }),
      });
      return await response.json();
    } catch (error) {
      console.error("导入审批模板失败:", error);
      return {
        success: false,
        data: {} as ApprovalTemplate,
        message: "导入审批模板失败",
      };
    }
  }

  /**
   * 导出审批模板
   */
  async exportTemplate(id: string): Promise<ApiResponse<string>> {
    try {
      const response = await fetch(`${this.baseUrl}/templates/${id}/export`);
      return await response.json();
    } catch (error) {
      console.error("导出审批模板失败:", error);
      return {
        success: false,
        data: "",
        message: "导出审批模板失败",
      };
    }
  }

  // ==================== 审批实例管理 ====================

  /**
   * 获取审批实例列表
   */
  async getInstances(
    params?: InstanceQueryParams,
  ): Promise<ApiResponse<PaginatedResponse<ApprovalInstance>>> {
    try {
      const queryString = new URLSearchParams(params as any).toString();
      const response = await fetch(`${this.baseUrl}/instances?${queryString}`);
      return await response.json();
    } catch (error) {
      console.error("获取审批实例列表失败:", error);
      return {
        success: false,
        data: { items: [], total: 0, page: 1, pageSize: 10, totalPages: 0 },
        message: "获取审批实例列表失败",
      };
    }
  }

  /**
   * 获取单个审批实例详情
   */
  async getInstance(id: string): Promise<ApiResponse<ApprovalInstance>> {
    try {
      const response = await fetch(`${this.baseUrl}/instances/${id}`);
      return await response.json();
    } catch (error) {
      console.error("获取审批实例详情失败:", error);
      return {
        success: false,
        data: {} as ApprovalInstance,
        message: "获取审批实例详情失败",
      };
    }
  }

  /**
   * 提交审批申请
   */
  async submitApproval(data: {
    workflowId: string;
    title: string;
    formData: Record<string, any>;
    attachments?: string[];
  }): Promise<ApiResponse<ApprovalInstance>> {
    try {
      const response = await fetch(`${this.baseUrl}/instances`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error("提交审批申请失败:", error);
      return {
        success: false,
        data: {} as ApprovalInstance,
        message: "提交审批申请失败",
      };
    }
  }

  /**
   * 审批通过
   */
  async approveInstance(
    instanceId: string,
    nodeId: string,
    comment?: string,
  ): Promise<ApiResponse<ApprovalInstance>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/instances/${instanceId}/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ nodeId, comment }),
        },
      );
      return await response.json();
    } catch (error) {
      console.error("审批通过失败:", error);
      return {
        success: false,
        data: {} as ApprovalInstance,
        message: "审批通过失败",
      };
    }
  }

  /**
   * 审批拒绝
   */
  async rejectInstance(
    instanceId: string,
    nodeId: string,
    comment: string,
  ): Promise<ApiResponse<ApprovalInstance>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/instances/${instanceId}/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ nodeId, comment }),
        },
      );
      return await response.json();
    } catch (error) {
      console.error("审批拒绝失败:", error);
      return {
        success: false,
        data: {} as ApprovalInstance,
        message: "审批拒绝失败",
      };
    }
  }

  /**
   * 撤回审批
   */
  async withdrawInstance(
    instanceId: string,
    reason?: string,
  ): Promise<ApiResponse<ApprovalInstance>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/instances/${instanceId}/withdraw`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason }),
        },
      );
      return await response.json();
    } catch (error) {
      console.error("撤回审批失败:", error);
      return {
        success: false,
        data: {} as ApprovalInstance,
        message: "撤回审批失败",
      };
    }
  }

  /**
   * 转交审批
   */
  async delegateInstance(
    instanceId: string,
    nodeId: string,
    targetUserId: string,
    comment?: string,
  ): Promise<ApiResponse<ApprovalInstance>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/instances/${instanceId}/delegate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ nodeId, targetUserId, comment }),
        },
      );
      return await response.json();
    } catch (error) {
      console.error("转交审批失败:", error);
      return {
        success: false,
        data: {} as ApprovalInstance,
        message: "转交审批失败",
      };
    }
  }

  // ==================== 审批历史和统计 ====================

  /**
   * 获取审批历史
   */
  async getApprovalHistory(
    instanceId: string,
  ): Promise<ApiResponse<ApprovalHistory[]>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/instances/${instanceId}/history`,
      );
      return await response.json();
    } catch (error) {
      console.error("获取审批历史失败:", error);
      return {
        success: false,
        data: [],
        message: "获取审批历史失败",
      };
    }
  }

  /**
   * 获取审批统计数据
   */
  async getApprovalStatistics(params?: {
    startDate?: string;
    endDate?: string;
    documentType?: DocumentType;
    department?: string;
  }): Promise<ApiResponse<ApprovalStatistics>> {
    try {
      const queryString = new URLSearchParams(params as any).toString();
      const response = await fetch(`${this.baseUrl}/statistics?${queryString}`);
      return await response.json();
    } catch (error) {
      console.error("获取审批统计失败:", error);
      return {
        success: false,
        data: {} as ApprovalStatistics,
        message: "获取审批统计失败",
      };
    }
  }

  /**
   * 获取我的待办审批
   */
  async getMyPendingApprovals(params?: {
    page?: number;
    pageSize?: number;
    documentType?: DocumentType;
  }): Promise<ApiResponse<PaginatedResponse<ApprovalInstance>>> {
    try {
      const queryString = new URLSearchParams(params as any).toString();
      const response = await fetch(`${this.baseUrl}/my-pending?${queryString}`);
      return await response.json();
    } catch (error) {
      console.error("获取待办审批失败:", error);
      return {
        success: false,
        data: { items: [], total: 0, page: 1, pageSize: 10, totalPages: 0 },
        message: "获取待办审批失败",
      };
    }
  }

  /**
   * 获取我提交的审批
   */
  async getMySubmittedApprovals(params?: {
    page?: number;
    pageSize?: number;
    status?: "pending" | "approved" | "rejected" | "cancelled";
    documentType?: DocumentType;
  }): Promise<ApiResponse<PaginatedResponse<ApprovalInstance>>> {
    try {
      const queryString = new URLSearchParams(params as any).toString();
      const response = await fetch(
        `${this.baseUrl}/my-submitted?${queryString}`,
      );
      return await response.json();
    } catch (error) {
      console.error("获取我的申请失败:", error);
      return {
        success: false,
        data: { items: [], total: 0, page: 1, pageSize: 10, totalPages: 0 },
        message: "获取我的申请失败",
      };
    }
  }

  // ==================== 用户和组织相关 ====================

  /**
   * 获取可选审批人列表
   */
  async getAvailableApprovers(params?: {
    department?: string;
    role?: string;
    search?: string;
  }): Promise<ApiResponse<ApprovalUser[]>> {
    try {
      const queryString = new URLSearchParams(params as any).toString();
      const response = await fetch(`${this.baseUrl}/approvers?${queryString}`);
      return await response.json();
    } catch (error) {
      console.error("获取审批人列表失败:", error);
      return {
        success: false,
        data: [],
        message: "获取审批人列表失败",
      };
    }
  }

  /**
   * 获取部门列表
   */
  async getDepartments(): Promise<
    ApiResponse<{ id: string; name: string; parentId?: string }[]>
  > {
    try {
      const response = await fetch(`${this.baseUrl}/departments`);
      return await response.json();
    } catch (error) {
      console.error("获取部门列表失败:", error);
      return {
        success: false,
        data: [],
        message: "获取部门列表失败",
      };
    }
  }

  /**
   * 获取角色列表
   */
  async getRoles(): Promise<
    ApiResponse<{ id: string; name: string; description?: string }[]>
  > {
    try {
      const response = await fetch(`${this.baseUrl}/roles`);
      return await response.json();
    } catch (error) {
      console.error("获取角色列��失败:", error);
      return {
        success: false,
        data: [],
        message: "获取角色列表失败",
      };
    }
  }

  // ==================== 工具方法 ====================

  /**
   * 验证审批流程配置
   */
  async validateWorkflow(
    workflow: Partial<ApprovalWorkflow>,
  ): Promise<ApiResponse<{ isValid: boolean; errors: string[] }>> {
    try {
      const response = await fetch(`${this.baseUrl}/workflows/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(workflow),
      });
      return await response.json();
    } catch (error) {
      console.error("验证审批流程失败:", error);
      return {
        success: false,
        data: { isValid: false, errors: ["验证失败"] },
        message: "验证审批流程失败",
      };
    }
  }

  /**
   * 测试审批流程
   */
  async testWorkflow(
    workflowId: string,
    testData: Record<string, any>,
  ): Promise<
    ApiResponse<{
      path: string[];
      estimatedTime: number;
      approvers: ApprovalUser[];
    }>
  > {
    try {
      const response = await fetch(
        `${this.baseUrl}/workflows/${workflowId}/test`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(testData),
        },
      );
      return await response.json();
    } catch (error) {
      console.error("测试审批流程失败:", error);
      return {
        success: false,
        data: { path: [], estimatedTime: 0, approvers: [] },
        message: "测试审批流程失败",
      };
    }
  }
}

// 导出单例实例
export const approvalService = new ApprovalService();
export default approvalService;
