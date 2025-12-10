import { request } from "@/lib/request";

/**
 * 规则类型（自定义事件）接口
 */
export interface RuleType {
  id: string;
  eventName: string;
  createTime?: string;
  updateTime?: string;
  fineIdentifiers?: Array<{ key: string; value: string; isStacked: boolean }>;
  stackedType?: boolean;
}

/**
 * 规则类型服务
 */
class RuleTypeService {
  private STACKED_TYPE_KEY = "rule_type_stacked_type";

  private getStackedTypeMap(): Record<string, boolean> {
    try {
      const raw = localStorage.getItem(this.STACKED_TYPE_KEY);
      return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
    } catch {
      return {};
    }
  }

  private setStackedTypeMap(map: Record<string, boolean>) {
    try {
      localStorage.setItem(this.STACKED_TYPE_KEY, JSON.stringify(map));
    } catch {}
  }

  getStackedType(id: string): boolean {
    const map = this.getStackedTypeMap();
    return !!map[id];
  }

  setStackedType(id: string, stacked: boolean): void {
    const map = this.getStackedTypeMap();
    map[id] = stacked;
    this.setStackedTypeMap(map);
  }

  /**
   * 获取所有自定义事件列表
   */
  async list(): Promise<RuleType[]> {
    try {
      const response = await request.get<{ data: RuleType[] }>(
        "/quote/api/v1/ruletype/list"
      );
      const list = response.data.data || [];
      const map = this.getStackedTypeMap();
      return list.map((rt) => ({ ...rt, stackedType: map[rt.id] || false }));
    } catch (error) {
      console.error("Failed to fetch rule types:", error);
      return [];
    }
  }

  /**
   * 获取包含细化标识详情的事件列表（若后端暂不支持，回退到 list() 并补齐空数组）
   */
  async listWithDetails(): Promise<RuleType[]> {
    try {
      const response = await request.get<{ data: RuleType[] }>(
        "/quote/api/v1/ruletype/details"
      );
      const list = response.data.data || [];
      const map = this.getStackedTypeMap();
      return list.map((rt) => ({
        ...rt,
        fineIdentifiers: rt.fineIdentifiers || [],
        stackedType: map[rt.id] || false,
      }));
    } catch (error) {
      // 回退到基础列表
      const basic = await this.list();
      return basic.map((rt) => ({ ...rt, fineIdentifiers: rt.fineIdentifiers || [] }));
    }
  }

  /**
   * 创建新的自定义事件
   */
  async create(eventName: string): Promise<RuleType> {
    const response = await request.post<{ data: RuleType }>(
      "/quote/api/v1/ruletype",
      { eventName }
    );
    return response.data.data;
  }

  /**
   * 删除自定义事件
   */
  async delete(id: string): Promise<void> {
    await request.delete(`/quote/api/v1/ruletype`, {
      data: { id },
    });
  }
}

export const ruleTypeService = new RuleTypeService();
