import { request } from "@/lib/request";

/**
 * Backend Rule API Type Definition
 * 后端规则API类型定义
 */
export interface BackendRule {
  id?: number;
  ruleName: string;
  eventType: string;
  targetEvent: string;
  selector?: string;
  attributes?: string;
  titleAlias?: string;
  titleContains?: string;
  titleMatchMode?: string;
  urlMatchType: string;
  urlMatchValue: string;
  dedupStrategy?: string;
  dedupWindow: number;
  enableFlag: boolean;
  sortOrder?: number;
  tenantId?: string;
  gmtCreate?: string;
  gmtModified?: string;
  remark?: string; // For result events
  superPosition?: boolean;
}

/**
 * Create Rule Request
 * 创建规则请求类型
 */
export interface CreateRuleRequest {
  ruleName: string;
  eventType: string;
  targetEvent: string;
  selector?: string;
  attributes?: string;
  titleAlias?: string;
  titleContains?: string;
  titleMatchMode?: string;
  urlMatchType: string;
  urlMatchValue: string;
  dedupStrategy?: string;
  dedupWindow: number;
  enableFlag: boolean;
  sortOrder?: number;
  remark?: string; // For result events
  superPosition?: boolean;
}

export const ruleService = {
  /**
   * Create a new rule
   * 创建新规则
   * @param rule - Rule data to create
   * @param ruleType - Rule type (1: event rule, 2: result event)
   * @returns Created rule data
   */
  async createRule(rule: CreateRuleRequest, ruleType: number = 1): Promise<BackendRule> {
    const response = await request.post<{ data: BackendRule }>("/quote/api/v1/rule", { ...rule, ruleType });
    return response.data.data;
  },

  /**
   * Get all rules
   * 获取所有规则
   * @param ruleType - Rule type (1: event rule, 2: result event)
   * @returns List of rules
   */
  async getRules(ruleType: number | string = 1): Promise<BackendRule[]> {
    const response = await request.get<{ data: BackendRule[] }>("/quote/api/v1/rule/list", {
      ruleType,
    });
    return response.data.data || [];
  },

  async getColRules(): Promise<BackendRule[]> {
    const response = await request.get<{ data: BackendRule[] }>("/quote/api/v1/rule/role");
    return response.data.data || [];
  },

  /**
   * Update a rule
   * 更新规则
   * @param id - Rule ID
   * @param rule - Rule data to update
   * @param ruleType - Rule type (1: event rule, 2: result event)
   * @returns Updated rule data
   */
  async updateRule(id: number, rule: Partial<CreateRuleRequest>, ruleType: number = 1): Promise<BackendRule> {
    const response = await request.put<{ data: BackendRule }>("/quote/api/v1/rule", {
      id,
      ...rule,
      ruleType,
    });
    return response.data.data;
  },

  /**
   * Delete a rule
   * 删除规则
   * @param id - Rule ID
   */
  async deleteRule(id: number): Promise<void> {
    await request.delete("/quote/api/v1/rule", {
      data: { id },
    });
  },

  /**
   * Move a rule (reorder)
   * 移动规则位置（重新排序）
   * @param sourceId - Source rule ID
   * @param targetId - Target rule ID
   */
  async moveRule(sourceId: number, targetId: number): Promise<void> {
    const formData = new FormData();
    formData.append("sourceId", sourceId.toString());
    formData.append("targetId", targetId.toString());

    await request.post("/quote/api/v1/rule/move", formData);
  },
};
