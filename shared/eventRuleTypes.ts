// Event Rule Types for mapping raw frontend events to named business events

// Allow built-in named events plus user-defined custom events via UI
export type NamedEvent = ("Login" | "Signup" | "OrderSuccess") | (string & {});

export type RawEventType = "click" | "form_submit" | "pageview" | "custom";

export type EventType =
  | "$pageview"
  | "$pageleave"
  | "$autocapture"
  | "ScrollDepth"
  | "Click"
  | "ViewProduct"
  | "AddToCart"
  | "RemoveFromCart"
  | "StartCheckout"
  | "CompletePurchase"
  | "UserRegister"
  | "UserLogin"
  | "SubmitForm"
  | "Search"
  | "PageDwellTime"
  | "Change"
  | "Submit";

export interface UrlScope {
  type: "prefix" | "regex";
  value: string; // e.g. "/auth" or "/checkout/success" or regex pattern
}

export interface TextAliasCondition {
  aliases: string[]; // e.g. ["登录","Sign in","Log in"]
  matchMode: "equals" | "contains" | "starts_with" | "ends_with";
}

export interface SelectorCondition {
  selector?: string; // CSS selector if stable
  attributes?: Record<string, string>; // e.g. { "data-role": "login-button" }
  attributesRaw?: string; // Raw input string for attributes
}

export interface Preconditions {
  requireVisible?: boolean; // element must be visible
  requireElementPresentText?: string; // e.g. "订单号" appears on page
}

export interface EventRuleConditions {
  eventType: EventType; // click / form_submit / pageview
  text?: TextAliasCondition;
  selector?: SelectorCondition;
  pageTitleIncludes?: string[]; // optional page title hints
  preconditions?: Preconditions;
}

export interface DedupStrategy {
  windowSeconds: number; // e.g. 5-10 seconds
  oncePerSession?: boolean;
}

export interface EventRule {
  id: string;
  name: string; // rule display name
  targetEvent: NamedEvent;
  scope: UrlScope; // where this rule applies
  conditions: EventRuleConditions; // how it matches a raw event
  enabled: boolean;
  priority: number; // higher number = higher priority
  dedup?: DedupStrategy;
  createdAt: string;
  updatedAt: string;
  backendId?: number; // Backend database ID for API calls
}

export interface RawEventSample {
  eventType: RawEventType;
  url: string;
  pageTitle?: string;
  elementText?: string;
  selectorPath?: string; // actual element selector when available
  attributes?: Record<string, string>;
}

// Helper: summarize rule matching logic for display
export const summarizeRule = (rule: EventRule): string => {
  const parts: string[] = [];
  parts.push(`事件:${rule.targetEvent}`);
  parts.push(
    rule.scope.type === "prefix"
      ? `范围:URL前缀(${rule.scope.value})`
      : `范围:URL正则(${rule.scope.value})`,
  );
  parts.push(`类型:${rule.conditions.eventType}`);
  if (rule.conditions.text?.aliases?.length) {
    parts.push(
      `文本:${rule.conditions.text.matchMode}(${rule.conditions.text.aliases.join(", ")})`,
    );
  }
  if (rule.conditions.selector?.selector) {
    parts.push(`选择器:${rule.conditions.selector.selector}`);
  }
  if (rule.conditions.pageTitleIncludes?.length) {
    parts.push(`标题包含:${rule.conditions.pageTitleIncludes.join(", ")}`);
  }
  if (rule.dedup?.windowSeconds) {
    parts.push(`去重:${rule.dedup.windowSeconds}s${rule.dedup.oncePerSession ? ", 会话唯一" : ""}`);
  }
  return parts.join(" | ");
};

// Simple evaluator to test whether a raw event matches a rule
export const matchRule = (rule: EventRule, ev: RawEventSample): boolean => {
  // Scope
  const inScope =
    rule.scope.type === "prefix"
      ? ev.url.startsWith(rule.scope.value)
      : new RegExp(rule.scope.value).test(ev.url);
  if (!inScope) return false;

  // Event type
  if (rule.conditions.eventType !== ev.eventType) return false;

  // Page title
  if (rule.conditions.pageTitleIncludes?.length) {
    const title = (ev.pageTitle || "").toLowerCase();
    const ok = rule.conditions.pageTitleIncludes.some((t) =>
      title.includes(t.toLowerCase()),
    );
    if (!ok) return false;
  }

  // Text alias check
  if (rule.conditions.text?.aliases?.length) {
    const text = (ev.elementText || "").toLowerCase();
    const aliases = rule.conditions.text.aliases.map((a) => a.toLowerCase());
    const mode = rule.conditions.text.matchMode;
    const matchOne = (alias: string) => {
      switch (mode) {
        case "equals":
          return text === alias;
        case "contains":
          return text.includes(alias);
        case "starts_with":
          return text.startsWith(alias);
        case "ends_with":
          return text.endsWith(alias);
        default:
          return false;
      }
    };
    if (!aliases.some(matchOne)) return false;
  }

  // Selector check
  if (rule.conditions.selector?.selector) {
    const actual = (ev.selectorPath || "").toLowerCase();
    const expected = rule.conditions.selector.selector.toLowerCase();
    if (!actual.includes(expected)) return false;
  }

  // Attribute check
  if (rule.conditions.selector?.attributes) {
    const attrs = rule.conditions.selector.attributes;
    const evAttrs = ev.attributes || {};
    for (const [k, v] of Object.entries(attrs)) {
      if (evAttrs[k] !== v) return false;
    }
  }

  // Preconditions (basic): if requireElementPresentText provided, ensure elementText or attrs hint includes it
  if (rule.conditions.preconditions?.requireElementPresentText) {
    const hint = rule.conditions.preconditions.requireElementPresentText.toLowerCase();
    const text = (ev.elementText || "").toLowerCase();
    const title = (ev.pageTitle || "").toLowerCase();
    const has = text.includes(hint) || title.includes(hint);
    if (!has) return false;
  }

  return true;
};
