import { EventRule } from "@shared/eventRuleTypes";

const STORAGE_KEY = "event_rules";

export const eventRuleService = {
  list(): EventRule[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as EventRule[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },
  saveAll(rules: EventRule[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
  },
  create(rule: Omit<EventRule, "id" | "createdAt" | "updatedAt">): EventRule {
    const now = new Date().toISOString();
    const newRule: EventRule = {
      ...rule,
      id: `rule_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    const rules = this.list();
    rules.push(newRule);
    this.saveAll(rules);
    return newRule;
  },
  update(id: string, patch: Partial<EventRule>): EventRule | null {
    const rules = this.list();
    const idx = rules.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    const updated: EventRule = {
      ...rules[idx],
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    rules[idx] = updated;
    this.saveAll(rules);
    return updated;
  },
  remove(id: string): boolean {
    const rules = this.list();
    const next = rules.filter((r) => r.id !== id);
    this.saveAll(next);
    return next.length !== rules.length;
  },
  reorder(ids: string[]): void {
    const rules = this.list();
    const map = new Map(rules.map((r) => [r.id, r] as const));
    const reordered = ids
      .map((id, i) => {
        const r = map.get(id);
        if (!r) return null as unknown as EventRule;
        return { ...r, priority: ids.length - i } as EventRule; // higher priority for earlier ids
      })
      .filter(Boolean) as EventRule[];
    this.saveAll(reordered);
  },
};

// Optional starter templates (not persisted by default)
export const starterTemplates: EventRule[] = [
  {
    id: "tpl_login",
    name: "登录按钮点击",
    targetEvent: "Login",
    scope: { type: "prefix", value: "/" },
    conditions: {
      eventType: "click",
      text: { aliases: ["登录", "Sign in", "Log in"], matchMode: "contains" },
      selector: { attributes: { "data-role": "login" } },
    },
    enabled: true,
    priority: 100,
    dedup: { windowSeconds: 5, oncePerSession: false },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Site-specific templates for eecarttest.pcbx.cn
  {
    id: "tpl_login_eecart_submit",
    name: "登录（EECART 域名，表单提交）",
    targetEvent: "Login",
    scope: { type: "prefix", value: "https://eecarttest.pcbx.cn/" },
    conditions: {
      eventType: "form_submit",
      text: { aliases: ["登录", "Sign in", "Log in", "Login"], matchMode: "contains" },
      pageTitleIncludes: ["登录", "Sign in", "Log in"],
    },
    enabled: true,
    priority: 110,
    dedup: { windowSeconds: 10, oncePerSession: true },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tpl_login_eecart_click",
    name: "登录按钮点击（EECART 域名）",
    targetEvent: "Login",
    scope: { type: "prefix", value: "https://eecarttest.pcbx.cn/" },
    conditions: {
      eventType: "click",
      text: { aliases: ["登录", "Sign in", "Log in", "Login"], matchMode: "contains" },
    },
    enabled: true,
    priority: 105,
    dedup: { windowSeconds: 8, oncePerSession: true },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tpl_login_eecart_change_custom",
    name: "登录输入变更（EECART，自定义事件）",
    targetEvent: "Login",
    scope: { type: "prefix", value: "https://eecarttest.pcbx.cn/" },
    conditions: {
      eventType: "custom",
      // If your pipeline includes element attributes for change events
      selector: { attributes: { id: "loginform_username" } },
      preconditions: { requireElementPresentText: "登录" },
    },
    enabled: false,
    priority: 95,
    dedup: { windowSeconds: 15, oncePerSession: true },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tpl_signup",
    name: "注册按钮点击",
    targetEvent: "Signup",
    scope: { type: "prefix", value: "/" },
    conditions: {
      eventType: "click",
      text: { aliases: ["注册", "Sign up", "Register"], matchMode: "contains" },
      selector: { attributes: { "data-role": "signup" } },
    },
    enabled: true,
    priority: 90,
    dedup: { windowSeconds: 5, oncePerSession: false },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tpl_order_success",
    name: "订单成功页面",
    targetEvent: "OrderSuccess",
    scope: { type: "prefix", value: "/" },
    conditions: {
      eventType: "pageview",
      text: { aliases: ["支付成功", "感谢", "订单号"], matchMode: "contains" },
      pageTitleIncludes: ["成功", "订单", "Thank", "Success"],
    },
    enabled: true,
    priority: 80,
    dedup: { windowSeconds: 30, oncePerSession: true },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];