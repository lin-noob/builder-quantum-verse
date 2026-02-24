import React, { useMemo, useState } from "react";
import { ReactFlow, Background, Controls, MiniMap, addEdge } from "@xyflow/react";
import { LayoutGrid, Box, Cog, ScrollText, Bell, Eye, Database, Shield, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

type RegistryType = "Entities" | "Capabilities" | "Rules" | "Events";
type Module = "Entities" | "Capabilities" | "Rules" | "Lifecycle" | "Events" | "Responsibility" | "Processes";
type UIMode = "wizard";

type EntityType = "Master" | "Transaction" | "Event";
type RiskLevel = "Low" | "Medium" | "High";
type RuleType = "合规" | "财务" | "SLA" | "风控";
type Severity = "blocking" | "warning" | "audit";
type Scope = "Entity" | "Capability" | "Agent" | "State";
type DetectionType = "Realtime" | "Scheduled" | "实时" | "定时";
type ViolationAction = "阻断" | "升级" | "记录";

interface RegistryJson<T> {
  registry_id: string;
  assets: T[];
}

type ResponsibilityTarget = "entity" | "capability" | "process";

interface EntityAttribute {
  name: string;
  type: string;
  nullable?: boolean;
  description?: string;
  enum?: string[];
}

interface EntityRelationship {
  target_entity: string;
  relation_type: string;
  description?: string;
}

interface Entity {
  id: string;
  entity_id: string;
  name: string;
  display_name: string;
  type: EntityType;
  description: string;
  lifecycle?: string;
  attributes?: EntityAttribute[];
  primary_key?: string;
  sensitive_fields?: string[];
  relationships?: EntityRelationship[];
  ownership?: string;
  system_of_record?: string;
  observable?: boolean;
  writable_by?: string[];
  audit_required?: boolean;
  participates_settlement?: boolean;
  participates_risk?: boolean;
  participates_compliance?: boolean;
  ai_readwrite?: boolean;
  referencedBy: {
    models: string[];
    agents: string[];
  };
}

interface Capability {
  id: string;
  capability_id: string;
  name: string;
  description: string;
  category?: string;
  input_entities?: string[];
  output_entities?: string[];
  allowed_states?: string[];
  side_effects?: boolean;
  risk_level: RiskLevel;
  requires_approval?: boolean;
  allowed_agents?: string[];
  forbidden_contexts?: string[];
  rule_dependencies?: string[];
  audit_log?: boolean;
  averageLatencyMs?: number;
  sync?: boolean;
  auditRequired?: boolean;
  costUnit?: string;
  scenario_customer?: string;
  scenario_order_state?: string;
  scenario_rule_trigger?: string;
  business_impacts?: Array<"状态" | "金额" | "权益" | "记录/通知">;
  changes_lifecycle?: boolean;
  needs_responsibility?: boolean;
  impact_entities?: string[];
  primary_entity_id?: string;
  state_change_from?: string;
  state_change_to?: string;
}

interface Rule {
  id: string;
  rule_id: string;
  name: string;
  description: string;
  ruleType: RuleType;
  severity: Severity;
  scope: Scope;
  expression?: string;
  constrained_entities?: string[];
  constrained_capabilities?: string[];
  constrained_agents?: string[];
  violation_action?: ViolationAction;
  override_policy?: boolean;
  referencedCount: number;
  enforcementMode?: "Realtime" | "Offline";
  owner?: string;
}

interface EventAsset {
  id: string;
  event_id: string;
  name: string;
  description: string;
  source_entity: string;
  triggerEntityId: string;
  condition: string;
  detection_type?: DetectionType;
  debounce?: number;
  subscribable: boolean;
  default_priority?: number;
  allowed_agents?: string[];
  deliverySemantics?: "AtLeastOnce" | "ExactlyOnce" | "BestEffort";
  topicName?: string;
  retention?: string;
}

interface Responsibility {
  id: string;
  target: ResponsibilityTarget;
  ref_id: string;
  business_owner: string;
  risk_owner: string;
  escalation_policy: {
    condition: string;
    timeline: string;
    escalate_to: string;
  };
}

interface ProcessStep {
  type: "capability" | "rule_check";
  ref: string;
}

interface ProcessDef {
  id: string;
  name: string;
  start_event: string;
  steps: ProcessStep[];
  end_states: string[];
  goal?: string;
  applicable_entities?: string[];
  recommended?: boolean;
  allow_bypass?: boolean;
}

const ENTITY_REGISTRY_ID = "entity_registry";
const CAPABILITY_REGISTRY_ID = "capability_registry";
const RULE_REGISTRY_ID = "rule_registry";
const EVENT_REGISTRY_ID = "event_registry";

const MOCK_ENTITIES: Entity[] = [
  {
    id: "entity_customer",
    entity_id: "entity_customer",
    name: "Customer",
    display_name: "客户",
    type: "Master",
    description: "企业级主数据：客户。包含基本信息与偏好。",
    lifecycle: "Active",
    attributes: [
      { name: "customer_id", type: "string", nullable: false, description: "客户唯一标识" },
      { name: "lifecycle_stage", type: "enum", nullable: false, description: "生命周期阶段", enum: ["Prospect", "Active", "Churned"] },
      { name: "risk_level", type: "enum", nullable: false, description: "风险等级", enum: ["Low", "Medium", "High"] },
    ],
    primary_key: "customer_id",
    sensitive_fields: ["contact_info"],
    relationships: [{ target_entity: "entity_order", relation_type: "has_many", description: "客户下多个订单" }],
    ownership: "Data Governance",
    system_of_record: "CRM",
    observable: true,
    writable_by: ["cap_upsert_customer"],
    audit_required: true,
    referencedBy: {
      models: ["Customer360", "OrderFulfillment"],
      agents: ["EmailAssistant", "SupportBot"],
    },
  },
  {
    id: "entity_order",
    entity_id: "entity_order",
    name: "Order",
    display_name: "订单",
    type: "Transaction",
    description: "交易型实体：订单。记录下单、支付与履约状态。",
    lifecycle: "Active",
    attributes: [
      { name: "order_id", type: "string", nullable: false, description: "订单唯一标识" },
      { name: "status", type: "enum", nullable: false, description: "订单状态", enum: ["Pending", "Paid", "Shipped", "Completed"] },
    ],
    primary_key: "order_id",
    sensitive_fields: [],
    relationships: [{ target_entity: "entity_customer", relation_type: "belongs_to", description: "订单属于客户" }],
    ownership: "Finance Ops",
    system_of_record: "ERP",
    observable: true,
    writable_by: ["cap_create_order"],
    audit_required: true,
    referencedBy: {
      models: ["OrderFulfillment", "RevenueAccounting"],
      agents: ["SupportBot"],
    },
  },
  {
    id: "entity_ticket",
    entity_id: "entity_ticket",
    name: "Ticket",
    display_name: "工单",
    type: "Event",
    description: "事件型实体：工单。用于客户服务与问题追踪。",
    lifecycle: "Active",
    attributes: [
      { name: "ticket_id", type: "string", nullable: false, description: "工单唯一标识" },
      { name: "severity", type: "enum", nullable: false, description: "工单严重级别", enum: ["Low", "Medium", "High"] },
    ],
    primary_key: "ticket_id",
    sensitive_fields: [],
    relationships: [{ target_entity: "entity_customer", relation_type: "belongs_to", description: "工单属于客户" }],
    ownership: "Service Desk",
    system_of_record: "Support",
    observable: true,
    writable_by: ["cap_open_ticket"],
    audit_required: false,
    referencedBy: {
      models: ["ServiceDesk"],
      agents: ["SupportBot"],
    },
  },
];

const MOCK_CAPABILITIES: Capability[] = [
  {
    id: "cap_upsert_customer",
    capability_id: "cap_upsert_customer",
    name: "UpsertCustomerProfile",
    description: "根据输入数据创建或更新客户主数据。",
    category: "客服",
    input_entities: ["entity_customer"],
    output_entities: ["entity_customer"],
    side_effects: false,
    risk_level: "Medium",
    requires_approval: false,
    allowed_agents: ["EmailAssistant", "SupportBot"],
    forbidden_contexts: [],
    rule_dependencies: ["rule_kys"],
    audit_log: true,
    averageLatencyMs: 120,
    sync: true,
    auditRequired: true,
    costUnit: "op"
  },
  {
    id: "cap_create_order",
    capability_id: "cap_create_order",
    name: "CreateOrder",
    description: "创建订单并初始化履约状态。",
    category: "财务",
    input_entities: ["entity_customer"],
    output_entities: ["entity_order"],
    side_effects: true,
    risk_level: "High",
    requires_approval: true,
    allowed_agents: [],
    forbidden_contexts: ["GuestCheckout"],
    rule_dependencies: ["rule_revenue_recognition"],
    audit_log: true,
    averageLatencyMs: 350,
    sync: false,
    auditRequired: true,
    costUnit: "order"
  },
  {
    id: "cap_open_ticket",
    capability_id: "cap_open_ticket",
    name: "OpenSupportTicket",
    description: "基于客户反馈创建服务工单。",
    category: "客服",
    input_entities: ["entity_customer"],
    output_entities: ["entity_ticket"],
    side_effects: false,
    risk_level: "Low",
    requires_approval: false,
    allowed_agents: ["SupportBot"],
    forbidden_contexts: [],
    rule_dependencies: [],
    audit_log: false,
    averageLatencyMs: 80,
    sync: true,
    auditRequired: false,
    costUnit: "ticket"
  },
];

const MOCK_RULES: Rule[] = [
  {
    id: "rule_kys",
    rule_id: "rule_kys",
    name: "KnowYourSupplier",
    description: "供应商与客户档案需符合监管识别要求。",
    ruleType: "合规",
    severity: "blocking",
    scope: "Entity",
    expression: "customer.kyc_verified == true",
    constrained_entities: ["entity_customer"],
    constrained_capabilities: ["cap_upsert_customer"],
    constrained_agents: [],
    violation_action: "阻断",
    override_policy: false,
    referencedCount: 4,
    enforcementMode: "Realtime",
    owner: "Compliance"
  },
  {
    id: "rule_revenue_recognition",
    rule_id: "rule_revenue_recognition",
    name: "RevenueRecognitionPolicy",
    description: "订单确认与收入确认遵循财务政策与会计准则。",
    ruleType: "财务",
    severity: "warning",
    scope: "Capability",
    expression: "order.status in ['Paid','Completed']",
    constrained_entities: ["entity_order"],
    constrained_capabilities: ["cap_create_order"],
    constrained_agents: [],
    violation_action: "记录",
    override_policy: true,
    referencedCount: 2,
    enforcementMode: "Offline",
    owner: "Finance"
  },
  {
    id: "rule_agent_access",
    rule_id: "rule_agent_access",
    name: "AgentAccessControl",
    description: "Agent 可调用能力需通过权限白名单与审计。",
    ruleType: "风控",
    severity: "blocking",
    scope: "Agent",
    expression: "agent in allowed_agents",
    constrained_entities: [],
    constrained_capabilities: ["cap_upsert_customer", "cap_open_ticket"],
    constrained_agents: ["SupportBot"],
    violation_action: "阻断",
    override_policy: false,
    referencedCount: 3,
    enforcementMode: "Realtime",
    owner: "Risk"
  },
];

const MOCK_EVENTS: EventAsset[] = [
  {
    id: "event_order_paid",
    event_id: "event_order_paid",
    name: "OrderPaid",
    description: "订单支付完成后触发的企业事件。",
    source_entity: "entity_order",
    triggerEntityId: "entity_order",
    condition: "当订单支付状态变更为成功",
    detection_type: "Realtime",
    debounce: 0,
    subscribable: true,
    default_priority: 5,
    allowed_agents: ["SupportBot"],
    deliverySemantics: "AtLeastOnce",
    topicName: "order.paid",
    retention: "7d"
  },
  {
    id: "event_ticket_closed",
    event_id: "event_ticket_closed",
    name: "TicketClosed",
    description: "客户服务工单关闭事件。",
    source_entity: "entity_ticket",
    triggerEntityId: "entity_ticket",
    condition: "当工单状态变更为已关闭",
    detection_type: "Scheduled",
    debounce: 60,
    subscribable: false,
    default_priority: 3,
    allowed_agents: [],
    deliverySemantics: "BestEffort",
    topicName: "ticket.closed",
    retention: "7d"
  },
];

const MOCK_RESPONSIBILITY: Responsibility[] = [
  {
    id: "resp_order",
    target: "entity",
    ref_id: "entity_order",
    business_owner: "Finance Ops",
    risk_owner: "Risk",
    escalation_policy: { condition: "退款被拒绝", timeline: "2h", escalate_to: "客服主管" },
  },
  {
    id: "resp_cap_create",
    target: "capability",
    ref_id: "cap_create_order",
    business_owner: "Finance Ops",
    risk_owner: "Risk",
    escalation_policy: { condition: "订单超时未发货", timeline: "24h", escalate_to: "运营经理" },
  },
];

const MOCK_PROCESSES: ProcessDef[] = [
  {
    id: "proc_refund",
    name: "RefundProcess",
    start_event: "event_order_paid",
    steps: [
      { type: "rule_check", ref: "rule_revenue_recognition" },
      { type: "capability", ref: "cap_open_ticket" },
    ],
    end_states: ["Completed"],
  },
];

const REGISTRY_MAP: Record<
  RegistryType,
  {
    id: string;
    assets: Entity[] | Capability[] | Rule[] | EventAsset[];
  }
> = {
  Entities: { id: ENTITY_REGISTRY_ID, assets: MOCK_ENTITIES },
  Capabilities: { id: CAPABILITY_REGISTRY_ID, assets: MOCK_CAPABILITIES },
  Rules: { id: RULE_REGISTRY_ID, assets: MOCK_RULES },
  Events: { id: EVENT_REGISTRY_ID, assets: MOCK_EVENTS },
};

export default function EnterpriseRegistry() {
  const [active, setActive] = useState<RegistryType>("Entities");
  const [moduleTab, setModuleTab] = useState<Module>("Entities");
  const [uiMode] = useState<UIMode>("wizard");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showReferencesOverview, setShowReferencesOverview] = useState(false);
  const [search, setSearch] = useState("");
  const [capRisk, setCapRisk] = useState<RiskLevel | "all">("all");
  const [ruleSeverity, setRuleSeverity] = useState<Severity | "all">("all");
  const [eventSub, setEventSub] = useState<"all" | "subscribable" | "not">("all");
  const [eventDetect, setEventDetect] = useState<"all" | "Realtime" | "Scheduled">("all");
  const [detailOpen, setDetailOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [entitiesData, setEntitiesData] = useState<Entity[]>(MOCK_ENTITIES);
  const [capabilitiesData, setCapabilitiesData] = useState<Capability[]>(MOCK_CAPABILITIES);
  const [rulesData, setRulesData] = useState<Rule[]>(MOCK_RULES);
  const [eventsData, setEventsData] = useState<EventAsset[]>(MOCK_EVENTS);
  const [lifecycleEntityId, setLifecycleEntityId] = useState<string>(MOCK_ENTITIES[1]?.entity_id || "entity_order");
  const [lifecycleNodes, setLifecycleNodes] = useState<any[]>([
    { id: "Created", position: { x: 50, y: 80 }, data: { label: "Created" }, type: "default" },
    { id: "Paid", position: { x: 220, y: 80 }, data: { label: "Paid" }, type: "default" },
    { id: "Shipped", position: { x: 390, y: 80 }, data: { label: "Shipped" }, type: "default" },
    { id: "Completed", position: { x: 560, y: 80 }, data: { label: "Completed" }, type: "default" },
    { id: "Cancelled", position: { x: 220, y: 180 }, data: { label: "Cancelled" }, type: "default" },
  ]);
  const [lifecycleEdges, setLifecycleEdges] = useState<any[]>([
    { id: "e1", source: "Created", target: "Paid", label: "CreateOrder", animated: true },
    { id: "e2", source: "Paid", target: "Shipped", label: "ShipOrder", animated: false },
    { id: "e3", source: "Shipped", target: "Completed", label: "ConfirmDelivery", animated: false },
    { id: "e4", source: "Paid", target: "Cancelled", label: "CancelOrder", animated: false },
  ]);
  const onLifecycleConnect = (params: any) => {
    setLifecycleEdges((eds) => addEdge({ ...params, animated: false }, eds));
  };
  const [newStateName, setNewStateName] = useState("");
  const [newTransitionFrom, setNewTransitionFrom] = useState("");
  const [newTransitionTo, setNewTransitionTo] = useState("");
  const [newTransitionTrigger, setNewTransitionTrigger] = useState("");
  const [entityFormOpen, setEntityFormOpen] = useState(false);
  const [entityFormEditingId, setEntityFormEditingId] = useState<string | null>(null);
  const [entityForm, setEntityForm] = useState<Partial<Entity>>({
    name: "",
    display_name: "",
    type: "Master",
    description: "",
    lifecycle: "Active",
    attributes: [],
    relationships: [],
    primary_key: "",
    sensitive_fields: [],
    ownership: "",
    system_of_record: "",
    observable: true,
    writable_by: [],
    audit_required: false,
    participates_settlement: false,
    participates_risk: false,
    participates_compliance: false,
    ai_readwrite: false,
  });
  const [capFormOpen, setCapFormOpen] = useState(false);
  const [capFormEditingId, setCapFormEditingId] = useState<string | null>(null);
  const [capForm, setCapForm] = useState<Partial<Capability>>({
    name: "",
    description: "",
    category: "",
    allowed_states: [],
    side_effects: false,
    risk_level: "Low",
    requires_approval: false,
    allowed_agents: [],
    forbidden_contexts: [],
    rule_dependencies: [],
    audit_log: false,
    scenario_customer: "",
    scenario_order_state: "",
    scenario_rule_trigger: "",
    business_impacts: [],
    changes_lifecycle: false,
    needs_responsibility: true,
    impact_entities: [],
    primary_entity_id: "",
    state_change_from: "",
    state_change_to: "",
  });
  const [ruleFormOpen, setRuleFormOpen] = useState(false);
  const [ruleFormEditingId, setRuleFormEditingId] = useState<string | null>(null);
  const [ruleForm, setRuleForm] = useState<Partial<Rule>>({
    name: "",
    description: "",
    ruleType: "合规",
    severity: "audit",
    scope: "Entity",
    expression: "",
  });
  const [eventFormOpen, setEventFormOpen] = useState(false);
  const [eventFormEditingId, setEventFormEditingId] = useState<string | null>(null);
  const [eventForm, setEventForm] = useState<Partial<EventAsset>>({
    name: "",
    description: "",
    source_entity: "",
    triggerEntityId: "",
    condition: "",
    detection_type: "Realtime",
    debounce: 0,
    subscribable: true,
    default_priority: 5,
    allowed_agents: [],
    // computed fields for subscription creation
  });
  const [eventSourceKind, setEventSourceKind] = useState<"state_change" | "rule_violation" | "field_change">("state_change");
  const [eventFromState, setEventFromState] = useState<string>("");
  const [eventToState, setEventToState] = useState<string>("");
  const [eventRuleRef, setEventRuleRef] = useState<string>("");
  const [eventFieldName, setEventFieldName] = useState<string>("");
  const [responsibilityData, setResponsibilityData] = useState<Responsibility[]>(MOCK_RESPONSIBILITY);
  const [processesData, setProcessesData] = useState<ProcessDef[]>(MOCK_PROCESSES);
  const [respFormOpen, setRespFormOpen] = useState(false);
  const [respFormEditingId, setRespFormEditingId] = useState<string | null>(null);
  const [respForm, setRespForm] = useState<Partial<Responsibility>>({
    target: "entity",
    ref_id: "",
    business_owner: "",
    risk_owner: "",
    escalation_policy: { condition: "", timeline: "", escalate_to: "" },
  });
  const [processFormOpen, setProcessFormOpen] = useState(false);
  const [processFormEditingId, setProcessFormEditingId] = useState<string | null>(null);
  const [processForm, setProcessForm] = useState<Partial<ProcessDef>>({
    name: "",
    start_event: "",
    steps: [],
    end_states: [],
    goal: "",
    applicable_entities: [],
    recommended: true,
    allow_bypass: false,
  });
  const [entityFormStep, setEntityFormStep] = useState("基础");
  const [capFormStep, setCapFormStep] = useState("基础");
  const [ruleFormStep, setRuleFormStep] = useState("基础");
  const [eventFormStep, setEventFormStep] = useState("基础");
  const [respFormStep, setRespFormStep] = useState("基础");
  const [processFormStep, setProcessFormStep] = useState("基础");
  const [formPageMode, setFormPageMode] = useState(false);
  const [formPageModule, setFormPageModule] = useState<Module>("Entities");
  const [formPageIsEditing, setFormPageIsEditing] = useState(false);
  const [formPageStep, setFormPageStep] = useState(1);
  const formPageValidateStep = () => {
    const currentTitle = (() => {
      if (formPageModule === "Entities") return ["基础","属性","关系","治理"][formPageStep - 1];
      if (formPageModule === "Capabilities") return ["基础","涉及对象","状态","策略"][formPageStep - 1];
      if (formPageModule === "Rules") return ["基础","范围","表达式"][formPageStep - 1];
      if (formPageModule === "Events") return ["基础","来源","投递"][formPageStep - 1];
      if (formPageModule === "Responsibility") return ["基础","升级"][formPageStep - 1];
      return ["基础","步骤","结束"][formPageStep - 1];
    })();
    if (formPageModule === "Entities" && currentTitle === "基础") {
      if (!String(entityForm.name || "").trim()) return false;
      if ((entityForm.description || "").trim().length < 1) return false;
    }
    if (formPageModule === "Capabilities" && currentTitle === "基础") {
      if (!String(capForm.name || "").trim()) return false;
      if ((capForm.description || "").trim().length < 1) return false;
    }
    if (formPageModule === "Rules" && currentTitle === "基础") {
      if (!String(ruleForm.name || "").trim()) return false;
    }
    if (formPageModule === "Events" && currentTitle === "基础") {
      if (!String(eventForm.source_entity || "").trim()) return false;
    }
    if (formPageModule === "Processes" && currentTitle === "基础") {
      if (!String(processForm.name || "").trim()) return false;
    }
    return true;
  };
  const formPageSave = (activate?: boolean) => {
    if (formPageModule === "Entities") {
      const name = (entityForm.name || "").trim(); if (!name) return;
      if (entityFormEditingId) {
        setEntitiesData(prev => prev.map(x => x.id === entityFormEditingId ? {
          ...x,
          name: entityForm.name as any,
          display_name: entityForm.display_name as any,
          type: entityForm.type as any,
          description: entityForm.description as any,
          lifecycle: entityForm.lifecycle as any,
          attributes: entityForm.attributes as any,
          relationships: entityForm.relationships as any,
          primary_key: entityForm.primary_key as any,
          sensitive_fields: entityForm.sensitive_fields as any,
          ownership: entityForm.ownership as any,
          system_of_record: entityForm.system_of_record as any,
          observable: entityForm.observable as any,
          writable_by: entityForm.writable_by as any,
          audit_required: entityForm.audit_required as any,
          participates_settlement: entityForm.participates_settlement as any,
          participates_risk: entityForm.participates_risk as any,
          participates_compliance: entityForm.participates_compliance as any,
          ai_readwrite: entityForm.ai_readwrite as any,
        } : x));
      } else {
        const id = `entity_${Date.now()}`;
        setEntitiesData(prev => [...prev, {
          id, entity_id: id,
          name: entityForm.name as any,
          display_name: entityForm.display_name as any,
          type: entityForm.type as any,
          description: entityForm.description as any,
          lifecycle: entityForm.lifecycle as any,
          attributes: entityForm.attributes as any,
          relationships: entityForm.relationships as any,
          primary_key: entityForm.primary_key as any,
          sensitive_fields: entityForm.sensitive_fields as any,
          ownership: entityForm.ownership as any,
          system_of_record: entityForm.system_of_record as any,
          observable: entityForm.observable as any,
          writable_by: entityForm.writable_by as any,
          audit_required: entityForm.audit_required as any,
          referencedBy: { models: [], agents: [] },
          participates_settlement: entityForm.participates_settlement as any,
          participates_risk: entityForm.participates_risk as any,
          participates_compliance: entityForm.participates_compliance as any,
          ai_readwrite: entityForm.ai_readwrite as any,
        }]);
      }
    } else if (formPageModule === "Capabilities") {
      const name = (capForm.name || "").trim(); if (!name) return;
      if (capFormEditingId) {
        setCapabilitiesData(prev => prev.map(x => x.id === capFormEditingId ? {
          ...x,
          name: capForm.name as any,
          description: capForm.description as any,
          category: capForm.category as any,
          allowed_states: capForm.allowed_states as any,
          side_effects: capForm.side_effects as any,
          risk_level: capForm.risk_level as any,
          requires_approval: capForm.requires_approval as any,
          allowed_agents: capForm.allowed_agents as any,
          forbidden_contexts: capForm.forbidden_contexts as any,
          rule_dependencies: capForm.rule_dependencies as any,
          audit_log: capForm.audit_log as any,
          scenario_customer: capForm.scenario_customer as any,
          scenario_order_state: capForm.scenario_order_state as any,
          scenario_rule_trigger: capForm.scenario_rule_trigger as any,
          business_impacts: capForm.business_impacts as any,
          changes_lifecycle: capForm.changes_lifecycle as any,
          needs_responsibility: capForm.needs_responsibility as any,
          impact_entities: capForm.impact_entities as any,
          primary_entity_id: capForm.primary_entity_id as any,
          state_change_from: capForm.state_change_from as any,
          state_change_to: capForm.state_change_to as any,
        } : x));
      } else {
        const id = `cap_${Date.now()}`;
        setCapabilitiesData(prev => [...prev, {
          id, capability_id: id,
          name: capForm.name as any,
          description: capForm.description as any,
          category: capForm.category as any,
          allowed_states: capForm.allowed_states as any,
          side_effects: capForm.side_effects as any,
          risk_level: capForm.risk_level as any,
          requires_approval: capForm.requires_approval as any,
          allowed_agents: capForm.allowed_agents as any,
          forbidden_contexts: capForm.forbidden_contexts as any,
          rule_dependencies: capForm.rule_dependencies as any,
          audit_log: capForm.audit_log as any,
          scenario_customer: capForm.scenario_customer as any,
          scenario_order_state: capForm.scenario_order_state as any,
          scenario_rule_trigger: capForm.scenario_rule_trigger as any,
          business_impacts: capForm.business_impacts as any,
          changes_lifecycle: capForm.changes_lifecycle as any,
          needs_responsibility: capForm.needs_responsibility as any,
          impact_entities: capForm.impact_entities as any,
          primary_entity_id: capForm.primary_entity_id as any,
          state_change_from: capForm.state_change_from as any,
          state_change_to: capForm.state_change_to as any,
        }]);
      }
    } else if (formPageModule === "Rules") {
      const name = (ruleForm.name || "").trim(); if (!name) return;
      if (ruleFormEditingId) {
        setRulesData(prev => prev.map(x => x.id === ruleFormEditingId ? {
          ...x,
          name: ruleForm.name as any,
          description: ruleForm.description as any,
          ruleType: ruleForm.ruleType as any,
          severity: ruleForm.severity as any,
          scope: ruleForm.scope as any,
          expression: ruleForm.expression as any,
          violation_action: ruleForm.violation_action as any,
        } : x));
      } else {
        const id = `rule_${Date.now()}`;
        setRulesData(prev => [...prev, {
          id, rule_id: id,
          name: ruleForm.name as any,
          description: ruleForm.description as any,
          ruleType: ruleForm.ruleType as any,
          severity: ruleForm.severity as any,
          scope: ruleForm.scope as any,
          expression: ruleForm.expression as any,
          referencedCount: 0,
        }]);
      }
    } else if (formPageModule === "Events") {
      const src = (eventForm.source_entity || "").trim(); if (!src) return;
      let derivedName = ""; let derivedCond = "";
      if (eventSourceKind === "state_change") { derivedName = `${eventForm.source_entity || "Entity"}.${eventFromState || "From"}→${eventToState || "To"}`; derivedCond = `当状态 ${eventFromState} → ${eventToState}`; }
      else if (eventSourceKind === "rule_violation") { derivedName = `Rule.${eventRuleRef || "Unknown"}.Violation`; derivedCond = `当规则 ${eventRuleRef} 被触发`; }
      else { derivedName = `${eventForm.source_entity || "Entity"}.${eventFieldName || "Field"}.Changed`; derivedCond = `当关键字段 ${eventFieldName} 变化`; }
      if (eventFormEditingId) {
        setEventsData(prev => prev.map(x => x.id === eventFormEditingId ? {
          ...x,
          name: derivedName as any,
          description: eventForm.description as any,
          source_entity: eventForm.source_entity as any,
          triggerEntityId: eventForm.triggerEntityId as any,
          condition: derivedCond as any,
          detection_type: eventForm.detection_type as any,
          debounce: eventForm.debounce as any,
          subscribable: eventForm.subscribable as any,
          default_priority: eventForm.default_priority as any,
          allowed_agents: eventForm.allowed_agents as any,
        } : x));
      } else {
        const id = `event_${Date.now()}`;
        setEventsData(prev => [...prev, {
          id, event_id: id,
          name: derivedName as any,
          description: eventForm.description as any,
          source_entity: eventForm.source_entity as any,
          triggerEntityId: eventForm.triggerEntityId as any,
          condition: derivedCond as any,
          detection_type: eventForm.detection_type as any,
          debounce: eventForm.debounce as any,
          subscribable: eventForm.subscribable as any,
          default_priority: eventForm.default_priority as any,
          allowed_agents: eventForm.allowed_agents as any,
        }]);
      }
    } else if (formPageModule === "Responsibility") {
      const refId = (respForm.ref_id || "").trim(); if (!refId) return;
      if (respFormEditingId) {
        setResponsibilityData(prev => prev.map(x => x.id === respFormEditingId ? {
          ...x,
          target: respForm.target as any,
          ref_id: respForm.ref_id as any,
          business_owner: respForm.business_owner as any,
          risk_owner: respForm.risk_owner as any,
          escalation_policy: respForm.escalation_policy as any,
        } : x));
      } else {
        const id = `resp_${Date.now()}`;
        setResponsibilityData(prev => [...prev, {
          id,
          target: respForm.target as any,
          ref_id: respForm.ref_id as any,
          business_owner: respForm.business_owner as any,
          risk_owner: respForm.risk_owner as any,
          escalation_policy: respForm.escalation_policy as any,
        }]);
      }
    } else {
      const name = (processForm.name || "").trim(); if (!name) return;
      if (processFormEditingId) {
        setProcessesData(prev => prev.map(x => x.id === processFormEditingId ? {
          ...x,
          name: processForm.name as any,
          start_event: processForm.start_event as any,
          steps: processForm.steps as any,
          end_states: processForm.end_states as any,
          goal: processForm.goal as any,
          applicable_entities: processForm.applicable_entities as any,
          recommended: processForm.recommended as any,
          allow_bypass: processForm.allow_bypass as any,
        } : x));
      } else {
        const id = `proc_${Date.now()}`;
        setProcessesData(prev => [...prev, {
          id,
          name: processForm.name as any,
          start_event: processForm.start_event as any,
          steps: processForm.steps as any,
          end_states: processForm.end_states as any,
          goal: processForm.goal as any,
          applicable_entities: processForm.applicable_entities as any,
          recommended: processForm.recommended as any,
          allow_bypass: processForm.allow_bypass as any,
        }]);
      }
    }
    setFormPageMode(false);
  };
  const refGraphNodes = useMemo(() => {
    const nodes: any[] = [];
    let x = 50;
    let y = 50;
    entitiesData.forEach((e, i) => nodes.push({ id: `E_${e.entity_id}`, position: { x: x, y: y + i * 40 }, data: { label: `E:${e.name}` } }));
    capabilitiesData.forEach((c, i) => nodes.push({ id: `C_${c.capability_id}`, position: { x: x + 220, y: y + i * 40 }, data: { label: `C:${c.name}` } }));
    rulesData.forEach((r, i) => nodes.push({ id: `R_${r.rule_id}`, position: { x: x + 440, y: y + i * 40 }, data: { label: `R:${r.name}` } }));
    eventsData.forEach((ev, i) => nodes.push({ id: `EV_${ev.event_id}`, position: { x: x + 660, y: y + i * 40 }, data: { label: `EV:${ev.name}` } }));
    processesData.forEach((p, i) => nodes.push({ id: `P_${p.id}`, position: { x: x + 880, y: y + i * 40 }, data: { label: `P:${p.name}` } }));
    return nodes;
  }, [entitiesData, capabilitiesData, rulesData, eventsData, processesData]);
  const refGraphEdges = useMemo(() => {
    const edges: any[] = [];
    capabilitiesData.forEach((c) => {
      (c.input_entities || []).forEach((eid, idx) => edges.push({ id: `CIN_${c.capability_id}_${eid}_${idx}`, source: `C_${c.capability_id}`, target: `E_${eid}`, label: "in" }));
      (c.output_entities || []).forEach((eid, idx) => edges.push({ id: `COUT_${c.capability_id}_${eid}_${idx}`, source: `C_${c.capability_id}`, target: `E_${eid}`, label: "out" }));
    });
    rulesData.forEach((r) => {
      (r.constrained_entities || []).forEach((eid, idx) => edges.push({ id: `RE_${r.rule_id}_${eid}_${idx}`, source: `R_${r.rule_id}`, target: `E_${eid}`, label: "on" }));
      (r.constrained_capabilities || []).forEach((cid, idx) => edges.push({ id: `RC_${r.rule_id}_${cid}_${idx}`, source: `R_${r.rule_id}`, target: `C_${cid}`, label: "on" }));
    });
    eventsData.forEach((ev, idx) => {
      if (ev.source_entity) edges.push({ id: `EVE_${ev.event_id}_${idx}`, source: `EV_${ev.event_id}`, target: `E_${ev.source_entity}`, label: "source" });
    });
    processesData.forEach((p, idx) => {
      edges.push({ id: `PEV_${p.id}_${idx}`, source: `P_${p.id}`, target: `EV_${p.start_event}`, label: "start" });
      (p.steps || []).forEach((s, j) => {
        const sid = s.type === "capability" ? `C_${s.ref}` : `R_${s.ref}`;
        edges.push({ id: `PST_${p.id}_${j}`, source: `P_${p.id}`, target: sid, label: s.type });
      });
    });
    return edges;
  }, [capabilitiesData, rulesData, eventsData, processesData]);

  const modules: Array<{ key: Module; label: string }> = [
    { key: "Entities", label: "业务对象（What exists）" },
    { key: "Capabilities", label: "业务可以做什么（What can happen）" },
    { key: "Rules", label: "业务底线（What must not break）" },
    { key: "Lifecycle", label: "生命周期（When it can happen）" },
    { key: "Events", label: "业务事件（What is worth noticing）" },
    { key: "Responsibility", label: "责任与风险（Who is accountable）" },
    { key: "Processes", label: "流程编排（Allowed orchestration）" },
  ];

  const registryJson = useMemo(() => {
    let registry_id = "";
    let assets: any[] = [];
    if (moduleTab === "Entities") {
      registry_id = ENTITY_REGISTRY_ID;
      assets = entitiesData;
    } else if (moduleTab === "Capabilities") {
      registry_id = CAPABILITY_REGISTRY_ID;
      assets = capabilitiesData;
    } else if (moduleTab === "Rules") {
      registry_id = RULE_REGISTRY_ID;
      assets = rulesData;
    } else if (moduleTab === "Events") {
      registry_id = EVENT_REGISTRY_ID;
      assets = eventsData;
    } else if (moduleTab === "Responsibility") {
      registry_id = "responsibility_registry";
      assets = responsibilityData;
    } else if (moduleTab === "Processes") {
      registry_id = "process_registry";
      assets = processesData;
    } else {
      registry_id = "layer2_misc";
      assets = [];
    }
    const json: RegistryJson<any> = { registry_id, assets };
    return JSON.stringify(json, null, 2);
  }, [moduleTab, entitiesData, capabilitiesData, rulesData, eventsData, responsibilityData, processesData]);

  const activeAssets = useMemo(() => {
    if (moduleTab === "Entities") return entitiesData as any[];
    if (moduleTab === "Capabilities") return capabilitiesData as any[];
    if (moduleTab === "Rules") return rulesData as any[];
    if (moduleTab === "Events") return eventsData as any[];
    return [] as any[];
  }, [moduleTab, entitiesData, capabilitiesData, rulesData, eventsData]);
  const selectedItem = useMemo(() => {
    if (!selectedId) return null;
    const arr = activeAssets as any[];
    return arr.find((a) => a.id === selectedId) || null;
  }, [activeAssets, selectedId]);
  const filteredAssets = useMemo(() => {
    const kw = search.trim().toLowerCase();
    if (active === "Entities") {
      return (activeAssets as Entity[]).filter((e) => {
        const base =
          !kw ||
          e.name.toLowerCase().includes(kw) ||
          (e.display_name || "").toLowerCase().includes(kw) ||
          e.description.toLowerCase().includes(kw);
        return base;
      });
    }
    if (active === "Capabilities") {
      return (activeAssets as Capability[]).filter((c) => {
        const base = !kw || c.name.toLowerCase().includes(kw) || c.description.toLowerCase().includes(kw);
        const riskOk = capRisk === "all" || c.risk_level === capRisk;
        return base && riskOk;
      });
    }
    if (active === "Rules") {
      return (activeAssets as Rule[]).filter((r) => {
        const base = !kw || r.name.toLowerCase().includes(kw) || r.description.toLowerCase().includes(kw);
        const sevOk = ruleSeverity === "all" || r.severity === ruleSeverity;
        return base && sevOk;
      });
    }
    return (activeAssets as EventAsset[]).filter((ev) => {
      const base = !kw || ev.name.toLowerCase().includes(kw) || ev.description.toLowerCase().includes(kw);
      const subOk =
        eventSub === "all" ||
        (eventSub === "subscribable" && ev.subscribable) ||
        (eventSub === "not" && !ev.subscribable);
      const detectOk =
        eventDetect === "all" ||
        (eventDetect === "Realtime" && (ev.detection_type === "Realtime" || ev.detection_type === "实时")) ||
        (eventDetect === "Scheduled" && (ev.detection_type === "Scheduled" || ev.detection_type === "定时"));
      return base && subOk && detectOk;
    });
  }, [active, activeAssets, search, capRisk, ruleSeverity, eventSub, eventDetect]);
  const totalCount = (filteredAssets as any[]).length;
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalCount);
  const pagedAssets = (filteredAssets as any[]).slice(startIndex, endIndex);

  if (formPageMode) {
    const steps = (()=>{
      if (formPageModule === "Entities") return ["基础","属性","关系","治理"];
      if (formPageModule === "Capabilities") return ["基础","涉及对象","状态","策略"];
      if (formPageModule === "Rules") return ["基础","范围","表达式"];
      if (formPageModule === "Events") return ["基础","来源","投递"];
      if (formPageModule === "Responsibility") return ["基础","升级"];
      return ["基础","步骤","结束"];
    })();
    const currentStepTitle = steps[formPageStep-1];
    return (
      <div className="p-6 space-y-6 bg-background min-h-full">
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              {steps.map((t, idx)=> {
                const status = (idx+1)<formPageStep ? "completed" : ((idx+1)===formPageStep ? "current" : "upcoming");
                return (
                  <div key={t} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 ${status==="completed"?"bg-blue-600 border-blue-600 text-white":status==="current"?"bg-white border-blue-600 text-blue-600":"bg-white border-gray-300 text-gray-400"}`}>{status==="completed"?"✓":idx+1}</div>
                      <div className="mt-3 text-center max-w-24">
                        <div className={`text-sm font-medium ${status!=="upcoming"?"text-gray-900":"text-gray-500"}`}>{t}</div>
                      </div>
                    </div>
                    {idx<steps.length-1 && <div className={`flex-1 h-px mx-6 ${status==="completed"?"bg-blue-600":"bg-gray-200"}`} />}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
        <div className="mb-6">
          {formPageModule === "Entities" && (
            <Card><CardContent className="p-4">
              {currentStepTitle === "基础" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div><div className="text-xs text-gray-500 mb-1">名称</div><Input value={entityForm.name as any} onChange={(e)=>setEntityForm(f=>({ ...f, name: e.target.value }))} /></div>
                    <div><div className="text-xs text-gray-500 mb-1">展示名</div><Input value={entityForm.display_name as any} onChange={(e)=>setEntityForm(f=>({ ...f, display_name: e.target.value }))} /></div>
                    <div><div className="text-xs text-gray-500 mb-1">业务角色定位</div><Select value={entityForm.type as any} onValueChange={(v)=>setEntityForm(f=>({ ...f, type: v as EntityType }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Master">主数据对象</SelectItem><SelectItem value="Transaction">交易对象</SelectItem><SelectItem value="Event">结果对象</SelectItem></SelectContent></Select></div>
                    <div><div className="text-xs text-gray-500 mb-1">生命周期</div><Input value={entityForm.lifecycle as any} onChange={(e)=>setEntityForm(f=>({ ...f, lifecycle: e.target.value }))} /></div>
                  </div>
                  <div><div className="text-xs text-gray-500 mb-1">业务语义（不少于20字）</div><textarea className="w-full border rounded-md p-2 text-sm" rows={3} value={entityForm.description as any} onChange={(e)=>setEntityForm(f=>({ ...f, description: e.target.value }))}></textarea></div>
                  <div><div className="text-xs text-gray-500 mb-1">业务重要性</div><div className="flex flex-wrap gap-2"><button className={["text-xs px-2 py-1 rounded-md border", entityForm.participates_settlement ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"].join(" ")} onClick={()=>setEntityForm(f=>({ ...f, participates_settlement: !f.participates_settlement }))}>参与结算</button><button className={["text-xs px-2 py-1 rounded-md border", entityForm.participates_risk ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"].join(" ")} onClick={()=>setEntityForm(f=>({ ...f, participates_risk: !f.participates_risk }))}>影响风控</button><button className={["text-xs px-2 py-1 rounded-md border", entityForm.participates_compliance ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"].join(" ")} onClick={()=>setEntityForm(f=>({ ...f, participates_compliance: !f.participates_compliance }))}>涉及合规</button><button className={["text-xs px-2 py-1 rounded-md border", entityForm.ai_readwrite ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"].join(" ")} onClick={()=>setEntityForm(f=>({ ...f, ai_readwrite: !f.ai_readwrite }))}>可被智能体读写</button></div></div>
                </>
              )}
              {currentStepTitle === "属性" && (
                <div><div className="text-xs text-gray-500 mb-2">属性</div><div className="space-y-2">
                  {((entityForm.attributes as any[]) || []).map((a, idx) => (
                    <div key={idx} className="grid grid-cols-5 gap-2">
                      <Input placeholder="名称" value={a.name || ""} onChange={(e)=>setEntityForm(f=>{ const attrs = [...(f.attributes || [])]; attrs[idx] = { ...attrs[idx], name: e.target.value }; return { ...f, attributes: attrs }; })} />
                      <Input placeholder="类型" value={a.type || ""} onChange={(e)=>setEntityForm(f=>{ const attrs = [...(f.attributes || [])]; attrs[idx] = { ...attrs[idx], type: e.target.value }; return { ...f, attributes: attrs }; })} />
                      <button className={["text-xs px-2 py-1 rounded-md border", a.nullable ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"].join(" ")} onClick={()=>setEntityForm(f=>{ const attrs = [...(f.attributes || [])]; attrs[idx] = { ...attrs[idx], nullable: !attrs[idx]?.nullable }; return { ...f, attributes: attrs }; })}>{a.nullable ? "可空" : "不可空"}</button>
                      <Input placeholder="描述" value={a.description || ""} onChange={(e)=>setEntityForm(f=>{ const attrs = [...(f.attributes || [])]; attrs[idx] = { ...attrs[idx], description: e.target.value }; return { ...f, attributes: attrs }; })} />
                      <Button variant="outline" size="sm" onClick={()=>setEntityForm(f=>{ const attrs = [...(f.attributes || [])]; attrs.splice(idx,1); return { ...f, attributes: attrs }; })}>删除</Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={()=>setEntityForm(f=>({ ...f, attributes: [...(f.attributes || []), { name: "", type: "", nullable: false, description: "" }] }))}>添加属性</Button>
                </div></div>
              )}
              {currentStepTitle === "关系" && (
                <div><div className="text-xs text-gray-500 mb-2">选择关联对象</div><div className="flex flex-wrap gap-2">
                  {entitiesData.map(en => (<button key={en.entity_id} className="px-2 py-1 text-xs rounded-md border" onClick={()=>setEntityForm(f=>{
                    const has = (f.relationships || []).some(x=>x.target_entity===en.entity_id);
                    const rel = has ? (f.relationships || []).filter(x=>x.target_entity!==en.entity_id) : [ ...(f.relationships || []), { target_entity: en.entity_id, relation_type: "引用", description: "" } ];
                    return { ...f, relationships: rel };
                  })}>{en.display_name || en.name}</button>))}
                </div><div className="text-xs text-gray-500 mt-2">关系类型默认为“引用”，可在保存后在高级视图中调整</div></div>
              )}
              {currentStepTitle === "治理" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div><div className="text-xs text-gray-500 mb-1">业务主键</div><Input value={entityForm.primary_key as any} onChange={(e)=>setEntityForm(f=>({ ...f, primary_key: e.target.value }))} /></div>
                    <div><div className="text-xs text-gray-500 mb-1">敏感字段（逗号分隔）</div><Input value={(entityForm.sensitive_fields || []).join(", ")} onChange={(e)=>setEntityForm(f=>({ ...f, sensitive_fields: e.target.value.split(",").map(s=>s.trim()).filter(Boolean) }))} /></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div><div className="text-xs text-gray-500 mb-1">归属</div><Input value={entityForm.ownership as any} onChange={(e)=>setEntityForm(f=>({ ...f, ownership: e.target.value }))} /></div>
                    <div><div className="text-xs text-gray-500 mb-1">来源系统</div><Input value={entityForm.system_of_record as any} onChange={(e)=>setEntityForm(f=>({ ...f, system_of_record: e.target.value }))} /></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div><div className="text-xs text-gray-500 mb-1">可观察</div><button className={["text-xs px-2 py-1 rounded-md border", entityForm.observable ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"].join(" ")} onClick={()=>setEntityForm(f=>({ ...f, observable: !f.observable }))}>{entityForm.observable ? "是" : "否"}</button></div>
                    <div><div className="text-xs text-gray-500 mb-1">需审计</div><button className={["text-xs px-2 py-1 rounded-md border", entityForm.audit_required ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"].join(" ")} onClick={()=>setEntityForm(f=>({ ...f, audit_required: !f.audit_required }))}>{entityForm.audit_required ? "是" : "否"}</button></div>
                  </div>
                </div>
              )}
            </CardContent></Card>
          )}
          {formPageModule === "Capabilities" && (
            <Card><CardContent className="p-4">
              {currentStepTitle === "基础" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div><div className="text-xs text-gray-500 mb-1">名称</div><Input value={capForm.name as any} onChange={(e)=>setCapForm(f=>({ ...f, name: e.target.value }))} /></div>
                    <div><div className="text-xs text-gray-500 mb-1">类别</div><Input value={capForm.category as any} onChange={(e)=>setCapForm(f=>({ ...f, category: e.target.value }))} /></div>
                  </div>
                  <div><div className="text-xs text-gray-500 mb-1">业务场景描述（不少于20字）</div><textarea className="w-full border rounded-md p-2 text-sm" rows={3} value={capForm.description as any} onChange={(e)=>setCapForm(f=>({ ...f, description: e.target.value, name: f.name || e.target.value.trim().slice(0,12) }))}></textarea></div>
                </>
              )}
              {currentStepTitle === "涉及对象" && (
                <div className="space-y-3">
                  <div><div className="text-xs text-gray-500 mb-1">选择影响对象</div><div className="flex flex-wrap gap-2">{entitiesData.map(en => (
                    <button key={en.entity_id} className={["px-2 py-1 text-xs rounded-md border", (capForm.impact_entities||[]).includes(en.entity_id)?"bg-blue-50 border-blue-200":"bg-white border-gray-200"].join(" ")} onClick={()=>setCapForm(f=>{ const list = new Set([...(f.impact_entities||[])]); if (list.has(en.entity_id)) list.delete(en.entity_id); else list.add(en.entity_id); return { ...f, impact_entities: Array.from(list) }; })}>{en.display_name || en.name}</button>
                  ))}</div></div>
                  <div><div className="text-xs text-gray-500 mb-1">主要作用对象</div><Select value={capForm.primary_entity_id as any} onValueChange={(v)=>setCapForm(f=>({ ...f, primary_entity_id: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{(capForm.impact_entities||[]).map(eid=>{ const en = entitiesData.find(x=>x.entity_id===eid); return <SelectItem key={eid} value={eid}>{en?.display_name || en?.name || eid}</SelectItem> })}</SelectContent></Select></div>
                </div>
              )}
              {currentStepTitle === "状态" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div><div className="text-xs text-gray-500 mb-1">允许状态（逗号分隔）</div><Input value={(capForm.allowed_states || []).join(", ")} onChange={(e)=>setCapForm(f=>({ ...f, allowed_states: e.target.value.split(",").map(s=>s.trim()).filter(Boolean) }))} /></div>
                  <div><div className="text-xs text-gray-500 mb-1">生命周期建议</div><div className="flex flex-wrap gap-2">{lifecycleNodes.map(n => (<button key={n.id} className="px-2 py-1 text-xs rounded-md border" onClick={()=>setCapForm(f=>({ ...f, allowed_states: Array.from(new Set([...(f.allowed_states||[]), n.id])) }))}>{n.id}</button>))}</div></div>
                  <div><div className="text-xs text-gray-500 mb-1">状态变化（前/后）</div><div className="grid grid-cols-2 gap-2"><Input placeholder="From" value={capForm.state_change_from as any} onChange={(e)=>setCapForm(f=>({ ...f, state_change_from: e.target.value }))} /><Input placeholder="To" value={capForm.state_change_to as any} onChange={(e)=>setCapForm(f=>({ ...f, state_change_to: e.target.value }))} /></div></div>
                </div>
              )}
              {currentStepTitle === "策略" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div><div className="text-xs text-gray-500 mb-1">当客户 ______</div><Input value={capForm.scenario_customer as any} onChange={(e)=>setCapForm(f=>({ ...f, scenario_customer: e.target.value }))} /></div>
                    <div><div className="text-xs text-gray-500 mb-1">当订单处于 ______ 状态</div><Input value={capForm.scenario_order_state as any} onChange={(e)=>setCapForm(f=>({ ...f, scenario_order_state: e.target.value }))} /></div>
                    <div><div className="text-xs text-gray-500 mb-1">当规则 ______ 被触发</div><Input value={capForm.scenario_rule_trigger as any} onChange={(e)=>setCapForm(f=>({ ...f, scenario_rule_trigger: e.target.value }))} /></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div><div className="text-xs text-gray-500 mb-1">风险等级</div><Select value={capForm.risk_level as any} onValueChange={(v)=>setCapForm(f=>({ ...f, risk_level: v as RiskLevel }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Low">Low</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="High">High</SelectItem></SelectContent></Select></div>
                    <div><div className="text-xs text-gray-500 mb-1">需要审批</div><button className={["text-xs px-2 py-1 rounded-md border", capForm.requires_approval ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"].join(" ")} onClick={()=>setCapForm(f=>({ ...f, requires_approval: !f.requires_approval }))}>{capForm.requires_approval ? "是" : "否"}</button></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div><div className="text-xs text-gray-500 mb-1">业务影响（多选）</div><div className="flex flex-wrap gap-2">{["状态","金额","权益","记录/通知"].map(k => (<button key={k} className={["px-2 py-1 text-xs rounded-md border", (capForm.business_impacts||[]).includes(k as any) ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"].join(" ")} onClick={()=>setCapForm(f=>{ const set = new Set([...(f.business_impacts||[])]); if (set.has(k as any)) set.delete(k as any); else set.add(k as any); return { ...f, business_impacts: Array.from(set) as any }; })}>{k}</button>))}</div></div>
                    <div><div className="text-xs text-gray-500 mb-1">是否改变生命周期</div><button className={["text-xs px-2 py-1 rounded-md border", capForm.changes_lifecycle ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"].join(" ")} onClick={()=>setCapForm(f=>({ ...f, changes_lifecycle: !f.changes_lifecycle }))}>{capForm.changes_lifecycle ? "是" : "否"}</button></div>
                  </div>
                </div>
              )}
            </CardContent></Card>
          )}
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>{formPageStep>1 && (<Button variant="outline" onClick={()=>setFormPageStep(s=>Math.max(1,s-1))}>上一步</Button>)}</div>
              <div className="flex space-x-3">
                <Button variant="outline" onClick={()=>setFormPageMode(false)}>取消</Button>
                {formPageStep<steps.length ? (<Button onClick={()=>{ if (!formPageValidateStep()) return; setFormPageStep(s=>Math.min(steps.length, s+1)); }}>下一步</Button>) : (
                  <>
                    <Button variant="outline" onClick={()=>formPageSave(false)}>保存草稿</Button>
                    <Button onClick={()=>formPageSave(true)}>{formPageIsEditing ? "保存并启用" : "创建并启用"}</Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full text-[15px] md:text-[16px]">
      {false && (
      <div className="max-w-none">
        <Card className="p-6 mb-8 bg-white shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <Input
                placeholder="搜索名称或描述"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(1)}>
                搜索
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap items-end gap-4 mt-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">向导流程</span>
            </div>
            {moduleTab === "Capabilities" && uiMode !== "overview" && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">风险等级</span>
                <Select value={capRisk} onValueChange={(v) => setCapRisk(v as any)}>
                  <SelectTrigger className="w-[160px]"><SelectValue placeholder="风险等级" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部风险</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {moduleTab === "Rules" && uiMode !== "overview" && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">严重级别</span>
                <Select value={ruleSeverity} onValueChange={(v) => setRuleSeverity(v as any)}>
                  <SelectTrigger className="w-[160px]"><SelectValue placeholder="严重级别" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部级别</SelectItem>
                    <SelectItem value="blocking">⛔ Blocking</SelectItem>
                    <SelectItem value="warning">⚠ Warning</SelectItem>
                    <SelectItem value="audit">📋 Audit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {moduleTab === "Events" && uiMode !== "overview" && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Agent订阅</span>
                <Select value={eventSub} onValueChange={(v) => setEventSub(v as any)}>
                  <SelectTrigger className="w-[180px]"><SelectValue placeholder="Agent订阅" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    <SelectItem value="subscribable">可订阅</SelectItem>
                    <SelectItem value="not">不可订阅</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {moduleTab === "Events" && uiMode !== "overview" && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">检测类型</span>
                <Select value={eventDetect} onValueChange={(v) => setEventDetect(v as any)}>
                  <SelectTrigger className="w-[160px]"><SelectValue placeholder="检测类型" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    <SelectItem value="Realtime">实时</SelectItem>
                    <SelectItem value="Scheduled">定时</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </Card>
      </div>
      )}

      {uiMode === "wizard" && (
        <div className="max-w-none">
          <Card className="bg-white shadow-sm">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="text-base font-semibold text-gray-900">企业数字业务模型</div>
                <div className="text-sm text-gray-700">
                  风险提示：未归属高风险能力 {capabilitiesData.filter(c=>c.risk_level==="High").filter(c=>!responsibilityData.some(r=>r.target==="capability" && r.ref_id===c.capability_id)).length} 个
                </div>
              </div>
              <div className="mt-3">
                {(() => {
                  const total = 5;
                  const filledEntities = entitiesData.filter(e => (e.description || "").trim().length >= 20).length > 0;
                  const filledCaps = capabilitiesData.length > 0;
                  const filledRules = rulesData.length > 0;
                  const lifecycleOk = lifecycleNodes.length > 0 && lifecycleEdges.length > 0;
                  const respOk = responsibilityData.length > 0;
                  const score = [filledEntities, filledCaps, filledRules, lifecycleOk, respOk].reduce((a,b)=>a+(b?1:0),0);
                  const pct = Math.round((score/total)*100);
                  return (
                    <div className="w-full bg-gray-100 h-2 rounded">
                      <div className="bg-blue-600 h-2 rounded" style={{ width: `${pct}%` }}></div>
                    </div>
                  );
                })()}
                <div className="mt-2 text-xs text-gray-600">完成度：对象 / 能力 / 规则 / 生命周期 / 责任</div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5">
              <div className="md:col-span-1 border-r p-3 space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-gray-600">操作</div>
                  <Button variant="default" size="sm" onClick={()=>{
                    setFormPageMode(true);
                    setFormPageModule(moduleTab);
                    setFormPageIsEditing(false);
                    setFormPageStep(1);
                    if (moduleTab === "Entities") { setEntityFormEditingId(null); setEntityForm({ name:"", display_name:"", type:"Master", description:"", lifecycle:"Active", attributes:[], relationships:[], primary_key:"", sensitive_fields:[], ownership:"", system_of_record:"", observable:true, writable_by:[], audit_required:false, participates_settlement:false, participates_risk:false, participates_compliance:false, ai_readwrite:false }); }
                    if (moduleTab === "Capabilities") { setCapFormEditingId(null); setCapForm({ name:"", description:"", category:"", allowed_states:[], side_effects:false, risk_level:"Low", requires_approval:false, allowed_agents:[], forbidden_contexts:[], rule_dependencies:[], audit_log:false, scenario_customer:"", scenario_order_state:"", scenario_rule_trigger:"", business_impacts:[], changes_lifecycle:false, needs_responsibility:true, impact_entities:[], primary_entity_id:"", state_change_from:"", state_change_to:"" }); }
                    if (moduleTab === "Events") { setEventFormEditingId(null); setEventForm({ name:"", description:"", source_entity:"", triggerEntityId:"", condition:"", detection_type:"Realtime", debounce:0, subscribable:true, default_priority:5, allowed_agents:[] }); }
                    if (moduleTab === "Responsibility") { setRespFormEditingId(null); setRespForm({ target:"entity", ref_id:"", business_owner:"", risk_owner:"", escalation_policy:{ condition:"", timeline:"", escalate_to:"" } }); }
                    if (moduleTab === "Processes") { setProcessFormEditingId(null); setProcessForm({ name:"", start_event:"", steps:[], end_states:[], goal:"", applicable_entities:[], recommended:true, allow_bypass:false }); }
                  }}>新建</Button>
                </div>
                {modules.map((m, idx) => (
                  <button
                    key={m.key}
                    onClick={() => {
                      setModuleTab(m.key);
                      if (["Entities","Capabilities","Rules","Events"].includes(m.key)) setActive(m.key as RegistryType);
                      setSelectedId(null);
                    }}
                    className={[
                      "w-full text-left px-3 py-2 text-sm rounded-md border",
                      moduleTab === m.key ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"
                    ].join(" ")}
                  >
                    {(idx+1)+". "+m.label}
                  </button>
                ))}
              </div>
              <div className="md:col-span-4 p-3">
                {["Entities","Capabilities","Rules","Events"].includes(moduleTab) && (
                  <Card className="bg-white shadow-sm">
                    <div className="overflow-x-auto">
                      {active === "Entities" && (
                        <table className="min-w-full table-fixed">
                          <colgroup>
                            <col className="w-[20%]" />
                            <col className="w-[20%]" />
                            <col className="w-[20%]" />
                            <col className="w-[20%]" />
                            <col className="w-[20%]" />
                          </colgroup>
                          <thead className="bg-gray-50">
                            <tr className="divide-x divide-gray-200">
                              <th className="px-4 py-2 text-left text-sm text-gray-700">对象名称</th>
                              <th className="px-4 py-2 text-left text-sm text-gray-700">业务角色</th>
                              <th className="px-4 py-2 text-left text-sm text-gray-700">参与：结算/风控/合规</th>
                              <th className="px-4 py-2 text-left text-sm text-gray-700">生命周期完整</th>
                              <th className="px-4 py-2 text-left text-sm text-gray-700">责任已定义</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {(pagedAssets as Entity[]).map((e) => (
                              <tr key={e.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => { setSelectedId(e.id); setDetailOpen(true); }}>
                                <td className="px-4 py-2 text-sm text-gray-900">{e.display_name || e.name}</td>
                                <td className="px-4 py-2 text-sm">
                                  <Badge variant="secondary" className="text-[10px]">
                                    {e.type === "Master" ? "主数据" : e.type === "Transaction" ? "交易对象" : "结果对象"}
                                  </Badge>
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-700">
                                  {e.participates_settlement ? "✅" : "–"} / {e.participates_risk ? "✅" : "–"} / {e.participates_compliance ? "✅" : "–"}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-700">{(lifecycleNodes.length > 0 && lifecycleEdges.length > 0) ? "✔" : "⚠"}</td>
                                <td className="px-4 py-2 text-sm text-gray-700">{responsibilityData.some(r=>r.target==="entity" && r.ref_id===e.entity_id) ? "✔" : "❌"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                      {active === "Capabilities" && (
                        <table className="min-w-full table-fixed">
                          <colgroup>
                            <col className="w-[22%]" />
                            <col className="w-[18%]" />
                            <col className="w-[18%]" />
                            <col className="w-[18%]" />
                            <col className="w-[18%]" />
                          </colgroup>
                          <thead className="bg-gray-50">
                            <tr className="divide-x divide-gray-200">
                              <th className="px-4 py-2 text-left text-sm text-gray-700">能力名称</th>
                              <th className="px-4 py-2 text-left text-sm text-gray-700">业务影响</th>
                              <th className="px-4 py-2 text-left text-sm text-gray-700">风险级别（系统推导）</th>
                              <th className="px-4 py-2 text-left text-sm text-gray-700">是否改变生命周期</th>
                              <th className="px-4 py-2 text-left text-sm text-gray-700">是否需要责任确认</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {(pagedAssets as Capability[]).map((c) => (
                              <tr key={c.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => { setSelectedId(c.id); setDetailOpen(true); }}>
                                <td className="px-4 py-2 text-sm text-gray-900">{c.name}</td>
                                <td className="px-4 py-2 text-sm text-gray-700">{c.business_impact || "-"}</td>
                                <td className="px-4 py-2 text-sm text-gray-700">{c.risk_level}</td>
                                <td className="px-4 py-2 text-sm text-gray-700">{c.changes_lifecycle ? "是" : "否"}</td>
                                <td className="px-4 py-2 text-sm text-gray-700">{c.needs_responsibility ? "是" : "否"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                      {active === "Rules" && (
                        <table className="min-w-full table-fixed">
                          <colgroup>
                            <col className="w-[18%]" />
                            <col className="w-[12%]" />
                            <col className="w-[12%]" />
                            <col className="w-[12%]" />
                            <col className="w-[24%]" />
                            <col className="w-[8%]" />
                            <col className="w-[10%]" />
                            <col className="w-[10%]" />
                            <col className="w-[10%]" />
                          </colgroup>
                          <thead className="bg-gray-50">
                            <tr className="divide-x divide-gray-200">
                              <th className="px-4 py-2 text-left text-sm text-gray-700">名称</th>
                              <th className="px-4 py-2 text-left text-sm text-gray-700">类型</th>
                              <th className="px-4 py-2 text-left text-sm text-gray-700">严重级别</th>
                              <th className="px-4 py-2 text-left text-sm text-gray-700">作用范围</th>
                              <th className="px-4 py-2 text-left text-sm text-gray-700">描述</th>
                              <th className="px-4 py-2 text-left text-sm text-gray-700">引用</th>
                              <th className="px-4 py-2 text-left text-sm text-gray-700">执行模式</th>
                              <th className="px-4 py-2 text-left text-sm text-gray-700">允许Override</th>
                              <th className="px-4 py-2 text-left text-sm text-gray-700">操作</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {(pagedAssets as Rule[]).map((r) => (
                              <tr key={r.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => { setSelectedId(r.id); setDetailOpen(true); }}>
                                <td className="px-4 py-2 text-sm text-gray-900">{r.name}</td>
                                <td className="px-4 py-2 text-sm"><Badge variant="secondary" className="text-[10px]">{r.ruleType}</Badge></td>
                                <td className="px-4 py-2 text-sm"><Badge variant="secondary" className="text-[10px]">{r.severity}</Badge></td>
                                <td className="px-4 py-2 text-sm"><Badge variant="secondary" className="text-[10px]">{r.scope}</Badge></td>
                                <td className="px-4 py-2 text-sm text-gray-700">{r.description}</td>
                                <td className="px-4 py-2 text-sm text-gray-700">{r.referencedCount}</td>
                                <td className="px-4 py-2 text-sm text-gray-700">{r.enforcementMode || "-"}</td>
                                <td className="px-4 py-2 text-sm text-gray-700">{r.override_policy ? "允许" : "禁止"}</td>
                                <td className="px-4 py-2 text-sm text-gray-700" onClick={(ev)=>ev.stopPropagation()}>
                                  <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" onClick={() => {
                                      setRuleFormEditingId(r.id);
                                      setRuleForm({
                                        name: r.name,
                                        description: r.description,
                                        ruleType: r.ruleType,
                                        severity: r.severity,
                                        scope: r.scope,
                                        expression: r.expression,
                                      });
                                      setFormPageMode(true);
                                      setFormPageModule("Rules");
                                      setFormPageIsEditing(true);
                                      setFormPageStep(1);
                                    }}>编辑</Button>
                                    <Button variant="outline" size="sm" onClick={() => {
                                      if (window.confirm("确认删除该规则？")) {
                                        setRulesData(prev => prev.filter(x => x.id !== r.id));
                                      }
                                    }}>删除</Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                      {active === "Events" && (
                        <table className="min-w-full table-fixed">
                          <colgroup>
                            <col className="w-[18%]" />
                            <col className="w-[12%]" />
                            <col className="w-[24%]" />
                            <col className="w-[12%]" />
                            <col className="w-[10%]" />
                            <col className="w-[10%]" />
                            <col className="w-[10%]" />
                          </colgroup>
                          <thead className="bg-gray-50">
                            <tr className="divide-x divide-gray-200">
                              <th className="px-4 py-2 text-left text-sm text-gray-700">事件名称</th>
                              <th className="px-4 py-2 text-left text-sm text-gray-700">来源实体</th>
                              <th className="px-4 py-2 text-left text-sm text-gray-700">触发条件</th>
                              <th className="px-4 py-2 text-left text-sm text-gray-700">检测类型</th>
                              <th className="px-4 py-2 text-left text-sm text-gray-700">订阅</th>
                              <th className="px-4 py-2 text-left text-sm text-gray-700">优先级</th>
                              <th className="px-4 py-2 text-left text-sm text-gray-700">操作</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {(pagedAssets as EventAsset[]).map((ev) => (
                              <tr key={ev.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => { setSelectedId(ev.id); setDetailOpen(true); }}>
                                <td className="px-4 py-2 text-sm text-gray-900">{ev.name}</td>
                                <td className="px-4 py-2 text-sm text-gray-700">{ev.source_entity}</td>
                                <td className="px-4 py-2 text-sm text-gray-700">{ev.condition}</td>
                                <td className="px-4 py-2 text-sm text-gray-700">{ev.detection_type || "-"}</td>
                                <td className="px-4 py-2 text-sm text-gray-700">{ev.subscribable ? "是" : "否"}</td>
                                <td className="px-4 py-2 text-sm text-gray-700">{ev.default_priority ?? "-"}</td>
                                <td className="px-4 py-2 text-sm text-gray-700" onClick={(evn)=>evn.stopPropagation()}>
                                  <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" onClick={() => {
                                      setEventFormEditingId(ev.id);
                                      setEventForm({
                                        name: ev.name,
                                        description: ev.description,
                                        source_entity: ev.source_entity,
                                        triggerEntityId: ev.triggerEntityId,
                                        condition: ev.condition,
                                        detection_type: ev.detection_type,
                                        debounce: ev.debounce,
                                        subscribable: ev.subscribable,
                                        default_priority: ev.default_priority,
                                        allowed_agents: ev.allowed_agents,
                                      });
                                      setFormPageMode(true);
                                      setFormPageModule("Events");
                                      setFormPageIsEditing(true);
                                      setFormPageStep(1);
                                    }}>编辑</Button>
                                    <Button variant="outline" size="sm" onClick={() => {
                                      if (window.confirm("确认删除该事件？")) {
                                        setEventsData(prev => prev.filter(x => x.id !== ev.id));
                                      }
                                    }}>删除</Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                    <div className="px-6 py-4 border-t bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-sm text-gray-700 order-2 sm:order-1">
                        显示 {startIndex + 1} 到 {Math.min(endIndex, totalCount)} 共 {totalCount}
                      </div>
                      <div className="flex items-center gap-2 order-1 sm:order-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                        >
                          上一页
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage >= totalPages}
                        >
                          下一页
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}
                {moduleTab === "Lifecycle" && (
                  <Card className="p-6 bg-white shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-end gap-3 mb-4">
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 mb-1">选择对象</div>
                        <div className="flex flex-wrap gap-2">
                          {entitiesData.map(e => (
                            <button
                              key={e.entity_id}
                              onClick={() => setLifecycleEntityId(e.entity_id)}
                              className={[
                                "px-3 py-1.5 text-sm rounded-md border",
                                lifecycleEntityId === e.entity_id ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"
                              ].join(" ")}
                            >
                              {e.display_name || e.name}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="md:w-1/3">
                        <div className="text-xs text-gray-500 mb-1">新增状态</div>
                        <div className="flex gap-2">
                          <Input placeholder="状态名称" value={newStateName} onChange={(e)=>setNewStateName(e.target.value)} />
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => {
                              const name = newStateName.trim();
                              if (!name) return;
                              if (lifecycleNodes.some(n => n.id === name)) return;
                              setLifecycleNodes(prev => [...prev, { id: name, position: { x: 100 + prev.length * 80, y: 220 }, data: { label: name }, type: "default" }]);
                              setNewStateName("");
                            }}
                          >
                            添加
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="md:col-span-2 border rounded-md">
                        <div style={{ height: 360 }}>
                          <ReactFlow nodes={lifecycleNodes} edges={lifecycleEdges} onConnect={onLifecycleConnect} fitView>
                            <Controls />
                            <MiniMap />
                            <Background />
                          </ReactFlow>
                        </div>
                      </div>
                      <div className="border rounded-md p-3 space-y-2">
                        <div className="text-sm font-medium text-gray-900">新增流转</div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">From</div>
                          <Input placeholder="例如：Paid" value={newTransitionFrom} onChange={(e)=>setNewTransitionFrom(e.target.value)} />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">To</div>
                          <Input placeholder="例如：Shipped" value={newTransitionTo} onChange={(e)=>setNewTransitionTo(e.target.value)} />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">触发能力</div>
                          <Input placeholder="例如：ShipOrder" value={newTransitionTrigger} onChange={(e)=>setNewTransitionTrigger(e.target.value)} />
                        </div>
                        <div className="flex justify-end">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => {
                              const from = newTransitionFrom.trim();
                              const to = newTransitionTo.trim();
                              const trig = newTransitionTrigger.trim() || "-";
                              if (!from || !to) return;
                              if (!lifecycleNodes.some(n => n.id === from) || !lifecycleNodes.some(n => n.id === to)) return;
                              const id = `e_${from}_${to}_${Date.now()}`;
                              setLifecycleEdges(prev => [...prev, { id, source: from, target: to, label: trig, animated: false }]);
                              setNewTransitionFrom(""); setNewTransitionTo(""); setNewTransitionTrigger("");
                            }}
                          >
                            添加流转
                          </Button>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">提示：也可直接在图上连接节点创建流转</div>
                      </div>
                    </div>
                  </Card>
                )}
                {moduleTab === "Responsibility" && (
                  <Card className="bg-white shadow-sm">
                    <div className="px-4 py-3 border-b gap-2"></div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full table-fixed">
                        <colgroup>
                          <col className="w-[14%]" />
                          <col className="w-[22%]" />
                          <col className="w-[18%]" />
                          <col className="w-[18%]" />
                          <col className="w-[18%]" />
                          <col className="w-[10%]" />
                        </colgroup>
                        <thead className="bg-gray-50">
                          <tr className="divide-x divide-gray-200">
                            <th className="px-4 py-2 text-left text-xs text-gray-600">目标类型</th>
                            <th className="px-4 py-2 text-left text-xs text-gray-600">关联资源</th>
                            <th className="px-4 py-2 text-left text-xs text-gray-600">业务负责人</th>
                            <th className="px-4 py-2 text-left text-xs text-gray-600">风险负责人</th>
                            <th className="px-4 py-2 text-left text-xs text-gray-600">升级策略</th>
                            <th className="px-4 py-2 text-left text-xs text-gray-600">操作</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {responsibilityData.map((r) => (
                            <tr key={r.id} className="hover:bg-gray-50">
                              <td className="px-4 py-2 text-sm text-gray-900">{r.target}</td>
                              <td className="px-4 py-2 text-sm text-gray-700">{r.ref_id}</td>
                              <td className="px-4 py-2 text-sm text-gray-700">{r.business_owner}</td>
                              <td className="px-4 py-2 text-sm text-gray-700">{r.risk_owner}</td>
                              <td className="px-4 py-2 text-sm text-gray-700">{r.escalation_policy.timeline} → {r.escalation_policy.escalate_to}</td>
                              <td className="px-4 py-2 text-sm text-gray-700">
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setRespFormEditingId(r.id);
                                      setRespForm({
                                        target: r.target,
                                        ref_id: r.ref_id,
                                        business_owner: r.business_owner,
                                        risk_owner: r.risk_owner,
                                        escalation_policy: { ...r.escalation_policy },
                                      });
                                      setRespFormOpen(true);
                                    }}
                                  >
                                    编辑
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      if (window.confirm("确认删除该责任项？")) {
                                        setResponsibilityData((prev) => prev.filter((x) => x.id !== r.id));
                                      }
                                    }}
                                  >
                                    删除
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                )}
                {moduleTab === "Processes" && (
                  <Card className="bg-white shadow-sm">
                    <div className="px-4 py-3 border-b gap-2"></div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full table-fixed">
                        <colgroup>
                          <col className="w-[22%]" />
                          <col className="w-[22%]" />
                          <col className="w-[18%]" />
                          <col className="w-[18%]" />
                          <col className="w-[10%]" />
                        </colgroup>
                        <thead className="bg-gray-50">
                          <tr className="divide-x divide-gray-200">
                            <th className="px-4 py-2 text-left text-xs text-gray-600">流程名称</th>
                            <th className="px-4 py-2 text-left text-xs text-gray-600">Start Event</th>
                            <th className="px-4 py-2 text-left text-xs text-gray-600">Steps</th>
                            <th className="px-4 py-2 text-left text-xs text-gray-600">End States</th>
                            <th className="px-4 py-2 text-left text-xs text-gray-600">操作</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {processesData.map((p) => (
                            <tr key={p.id} className="hover:bg-gray-50">
                              <td className="px-4 py-2 text-sm text-gray-900">{p.name}</td>
                              <td className="px-4 py-2 text-sm text-gray-700">{p.start_event}</td>
                              <td className="px-4 py-2 text-sm text-gray-700">{p.steps.length}</td>
                              <td className="px-4 py-2 text-sm text-gray-700">{p.end_states.join(", ")}</td>
                              <td className="px-4 py-2 text-sm text-gray-700">
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setProcessFormEditingId(p.id);
                                      setProcessForm({
                                        name: p.name,
                                        start_event: p.start_event,
                                        steps: p.steps.map((s) => ({ ...s })),
                                        end_states: [...p.end_states],
                                      });
                                      setProcessFormOpen(true);
                                    }}
                                  >
                                    编辑
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      if (window.confirm("确认删除该流程？")) {
                                        setProcessesData((prev) => prev.filter((x) => x.id !== p.id));
                                      }
                                    }}
                                  >
                                    删除
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </Card>
      </div>
      )}

      {uiMode === "overview" && (
        <div className="max-w-none">
          <Card className="p-6 bg-white shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="border rounded-md p-4">
                <div className="text-sm font-medium text-gray-900 mb-1">业务对象</div>
                <div className="text-xs text-gray-600 mb-2">共 {entitiesData.length} 个</div>
                <div className="flex gap-2">
                  <Button variant="default" size="sm" onClick={()=>{ setUiMode("tabs"); setModuleTab("Entities"); setActive("Entities"); }}>管理</Button>
                  <Button variant="outline" size="sm" onClick={()=>{ setUiMode("tabs"); setModuleTab("Entities"); setActive("Entities"); setEntityFormEditingId(null); setEntityFormOpen(true); }}>新建</Button>
                </div>
              </div>
              <div className="border rounded-md p-4">
                <div className="text-sm font-medium text-gray-900 mb-1">行为能力</div>
                <div className="text-xs text-gray-600 mb-2">共 {capabilitiesData.length} 个</div>
                <div className="flex gap-2">
                  <Button variant="default" size="sm" onClick={()=>{ setUiMode("tabs"); setModuleTab("Capabilities"); setActive("Capabilities"); }}>管理</Button>
                  <Button variant="outline" size="sm" onClick={()=>{ setUiMode("tabs"); setModuleTab("Capabilities"); setActive("Capabilities"); setCapFormEditingId(null); setCapFormOpen(true); }}>新建</Button>
                </div>
              </div>
              <div className="border rounded-md p-4">
                <div className="text-sm font-medium text-gray-900 mb-1">业务底线</div>
                <div className="text-xs text-gray-600 mb-2">共 {rulesData.length} 条</div>
                <div className="flex gap-2">
                  <Button variant="default" size="sm" onClick={()=>{ setUiMode("tabs"); setModuleTab("Rules"); setActive("Rules"); }}>管理</Button>
                  <Button variant="outline" size="sm" onClick={()=>{ setUiMode("tabs"); setModuleTab("Rules"); setActive("Rules"); setRuleFormEditingId(null); setRuleFormOpen(true); }}>新建</Button>
                </div>
              </div>
              <div className="border rounded-md p-4">
                <div className="text-sm font-medium text-gray-900 mb-1">生命周期</div>
                <div className="text-xs text-gray-600 mb-2">已配置示例图</div>
                <div className="flex gap-2">
                  <Button variant="default" size="sm" onClick={()=>{ setUiMode("tabs"); setModuleTab("Lifecycle"); }}>管理</Button>
                </div>
              </div>
              <div className="border rounded-md p-4">
                <div className="text-sm font-medium text-gray-900 mb-1">业务事件</div>
                <div className="text-xs text-gray-600 mb-2">共 {eventsData.length} 个</div>
                <div className="flex gap-2">
                  <Button variant="default" size="sm" onClick={()=>{ setUiMode("tabs"); setModuleTab("Events"); setActive("Events"); }}>管理</Button>
                  <Button variant="outline" size="sm" onClick={()=>{ setUiMode("tabs"); setModuleTab("Events"); setActive("Events"); setEventFormEditingId(null); setEventFormOpen(true); }}>新建</Button>
                </div>
              </div>
              <div className="border rounded-md p-4">
                <div className="text-sm font-medium text-gray-900 mb-1">责任与风险</div>
                <div className="text-xs text-gray-600 mb-2">共 {responsibilityData.length} 条</div>
                <div className="flex gap-2">
                  <Button variant="default" size="sm" onClick={()=>{ setUiMode("tabs"); setModuleTab("Responsibility"); }}>管理</Button>
                  <Button variant="outline" size="sm" onClick={()=>{ setUiMode("tabs"); setModuleTab("Responsibility"); setRespFormEditingId(null); setRespFormOpen(true); }}>新建</Button>
                </div>
              </div>
              <div className="border rounded-md p-4">
                <div className="text-sm font-medium text-gray-900 mb-1">流程编排</div>
                <div className="text-xs text-gray-600 mb-2">共 {processesData.length} 个</div>
                <div className="flex gap-2">
                  <Button variant="default" size="sm" onClick={()=>{ setUiMode("tabs"); setModuleTab("Processes"); }}>管理</Button>
                  <Button variant="outline" size="sm" onClick={()=>{ setUiMode("tabs"); setModuleTab("Processes"); setProcessFormEditingId(null); setProcessFormOpen(true); }}>新建</Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
      {/* Drawer Detail + JSON Preview */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent side="right" className="w-[480px] sm:max-w-[560px] p-0">
          <div className="p-4 border-b">
            <SheetHeader>
              <SheetTitle className="text-base">
                {selectedItem ? (selectedItem as any).name : "详情"} · {active}
              </SheetTitle>
            </SheetHeader>
          </div>
          <div className="p-4 space-y-4">
            {!selectedItem ? (
              <div className="text-sm text-gray-600">请选择列表中的资产</div>
            ) : (
              <>
                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">基础信息</div>
                    {active === "Entities" && (
                      <div className="text-sm text-gray-800 space-y-1">
                        <div>实体ID：{(selectedItem as Entity).entity_id}</div>
                        <div>名称：{(selectedItem as Entity).name} · 展示名：{(selectedItem as Entity).display_name || "-"}</div>
                        <div>类型：{(selectedItem as Entity).type} · 生命周期：{(selectedItem as Entity).lifecycle || "-"}</div>
                        <div>描述：{(selectedItem as Entity).description}</div>
                      </div>
                    )}
                    {active === "Capabilities" && (
                      <div className="text-sm text-gray-800 space-y-1">
                        <div>能力ID：{(selectedItem as Capability).capability_id}</div>
                        <div>名称：{(selectedItem as Capability).name} · 类别：{(selectedItem as Capability).category || "-"}</div>
                        <div>描述：{(selectedItem as Capability).description}</div>
                      </div>
                    )}
                    {active === "Rules" && (
                      <div className="text-sm text-gray-800 space-y-1">
                        <div>规则ID：{(selectedItem as Rule).rule_id}</div>
                        <div>名称：{(selectedItem as Rule).name} · 类型：{(selectedItem as Rule).ruleType}</div>
                        <div>严重级别：{(selectedItem as Rule).severity} · 作用范围：{(selectedItem as Rule).scope}</div>
                        <div>描述：{(selectedItem as Rule).description}</div>
                      </div>
                    )}
                    {active === "Events" && (
                      <div className="text-sm text-gray-800 space-y-1">
                        <div>事件ID：{(selectedItem as EventAsset).event_id}</div>
                        <div>名称：{(selectedItem as EventAsset).name}</div>
                        <div>来源实体：{(selectedItem as EventAsset).source_entity}</div>
                        <div>描述：{(selectedItem as EventAsset).description}</div>
                      </div>
                    )}
                  </div>

                  {active === "Entities" && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">结构信息</div>
                      <div className="text-sm text-gray-700 space-y-2">
                        <div>业务主键：{(selectedItem as Entity).primary_key || "-"}</div>
                        <div>敏感字段：{((selectedItem as Entity).sensitive_fields || []).join(", ") || "-"}</div>
                        {(selectedItem as Entity).attributes && (selectedItem as Entity).attributes!.length > 0 && (
                          <div>
                            <div className="text-xs text-gray-500 mb-1">属性</div>
                            <ul className="text-xs text-gray-700 list-disc pl-4">
                              {(selectedItem as Entity).attributes!.map((a, idx) => (
                                <li key={idx}>{a.name} : {a.type}{a.enum ? ` (${a.enum.join("/")})` : ""} · {a.semantic || "-"}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {active === "Entities" && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">关系信息</div>
                      <div className="text-sm text-gray-700 space-y-1">
                        <div>归属：{(selectedItem as Entity).ownership || "-"} · 来源系统：{(selectedItem as Entity).system_of_record || "-"}</div>
                        <ul className="text-xs text-gray-700 list-disc pl-4">
                          {((selectedItem as Entity).relationships || []).map((r, idx) => (
                            <li key={idx}>{r.type} → {r.to_entity_id} · {r.desc || "-"}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {active === "Entities" && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">智能相关</div>
                      <div className="text-sm text-gray-700 space-y-1">
                        <div>可观察：{(selectedItem as Entity).observable ? "是" : "否"} · 需审计：{(selectedItem as Entity).audit_required ? "是" : "否"}</div>
                        <div>可被修改的能力：{((selectedItem as Entity).writable_by || []).join(", ") || "-"}</div>
                      </div>
                    </div>
                  )}

                  {active === "Capabilities" && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">输入输出与约束</div>
                      <div className="text-sm text-gray-700 space-y-1">
                        <div>输入实体：{((selectedItem as Capability).input_entities || []).join(", ") || "-"}</div>
                        <div>输出实体：{((selectedItem as Capability).output_entities || []).join(", ") || "-"}</div>
                        <div>副作用：{(selectedItem as Capability).side_effects ? "是" : "否"} · 风险：{(selectedItem as Capability).risk_level}</div>
                        <div>审批：{(selectedItem as Capability).requires_approval ? "需要" : "不需要"} · 记录执行日志：{(selectedItem as Capability).audit_log ? "是" : "否"}</div>
                        <div>可调用Agent：{((selectedItem as Capability).allowed_agents || []).join(", ") || "-"}</div>
                        <div>禁止上下文：{((selectedItem as Capability).forbidden_contexts || []).join(", ") || "-"}</div>
                        <div>依赖规则：{((selectedItem as Capability).rule_dependencies || []).join(", ") || "-"}</div>
                      </div>
                    </div>
                  )}

                  {active === "Rules" && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">约束定义与范围</div>
                      <div className="text-sm text-gray-700 space-y-1">
                        <div>表达式：{(selectedItem as Rule).expression || "-"}</div>
                        <div>约束实体：{((selectedItem as Rule).constrained_entities || []).join(", ") || "-"}</div>
                        <div>约束能力：{((selectedItem as Rule).constrained_capabilities || []).join(", ") || "-"}</div>
                        <div>约束Agent：{((selectedItem as Rule).constrained_agents || []).join(", ") || "-"}</div>
                        <div>违规动作：{(selectedItem as Rule).violation_action || "-"}</div>
                        <div>允许人工Override：{(selectedItem as Rule).override_policy ? "是" : "否"}</div>
                        <div>执行模式：{(selectedItem as Rule).enforcementMode || "-"} · 归属：{(selectedItem as Rule).owner || "-"}</div>
                        <div>被引用次数：{(selectedItem as Rule).referencedCount}</div>
                      </div>
                    </div>
                  )}

                  {active === "Events" && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">触发与订阅</div>
                      <div className="text-sm text-gray-700 space-y-1">
                        <div>触发实体：{(selectedItem as EventAsset).triggerEntityId} · 触发条件：{(selectedItem as EventAsset).condition}</div>
                        <div>检测类型：{(selectedItem as EventAsset).detection_type || "-"} · 防抖：{(selectedItem as EventAsset).debounce ?? "-"}</div>
                        <div>Agent可订阅：{(selectedItem as EventAsset).subscribable ? "是" : "否"} · 优先级：{(selectedItem as EventAsset).default_priority ?? "-"}</div>
                        <div>白名单Agent：{((selectedItem as EventAsset).allowed_agents || []).join(", ") || "-"}</div>
                        <div>投递语义：{(selectedItem as EventAsset).deliverySemantics || "-"} · 主题：{(selectedItem as EventAsset).topicName || "-"} · 保留期：{(selectedItem as EventAsset).retention || "-"}</div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <div className="px-3 py-2 border-b text-xs text-gray-700">
                    当前预览： <span className="font-medium">{REGISTRY_MAP[active].id}.json</span>（只读，企业级资产）
                  </div>
                  <ScrollArea className="h-[220px]">
                    <pre className="p-3 text-xs font-mono bg-slate-900 text-green-400 leading-relaxed">
{registryJson}
                    </pre>
                  </ScrollArea>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Summary removed */}

      {/* Main Table Card */}
      {uiMode === "tabs" && ["Entities","Capabilities","Rules","Events"].includes(moduleTab) && (
      <div className="max-w-none">
        <Card className="bg-white shadow-sm">
          <div className="flex justify-end px-4 py-3 border-b gap-2">
           
          </div>
          <div className="overflow-x-auto">
                  {active === "Entities" && (
                    <table className="min-w-full table-fixed">
                      <colgroup>
                        <col className="w-[16%]" />
                        <col className="w-[10%]" />
                        <col className="w-[16%]" />
                        <col className="w-[10%]" />
                        <col className="w-[10%]" />
                        <col className="w-[18%]" />
                        <col className="w-[10%]" />
                      </colgroup>
                      <thead className="bg-gray-50">
                        <tr className="divide-x divide-gray-200">
                          <th className="px-4 py-2 text-left text-xs text-gray-600">名称</th>
                          <th className="px-4 py-2 text-left text-xs text-gray-600">类型</th>
                          <th className="px-4 py-2 text-left text-xs text-gray-600">展示名</th>
                          <th className="px-4 py-2 text-left text-xs text-gray-600">生命周期</th>
                          <th className="px-4 py-2 text-left text-xs text-gray-600">可观察</th>
                          <th className="px-4 py-2 text-left text-xs text-gray-600">归属/来源</th>
                          <th className="px-4 py-2 text-left text-xs text-gray-600">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {(pagedAssets as Entity[]).map((e) => (
                          <tr key={e.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => { setSelectedId(e.id); setDetailOpen(true); }}>
                            <td className="px-4 py-2 text-sm text-gray-900">{e.name}</td>
                            <td className="px-4 py-2 text-sm"><Badge variant="secondary" className="text-[10px]">{e.type}</Badge></td>
                            <td className="px-4 py-2 text-sm text-gray-700">{e.display_name || "-"}</td>
                            <td className="px-4 py-2 text-sm"><Badge variant="secondary" className="text-[10px]">{e.lifecycle || "-"}</Badge></td>
                            <td className="px-4 py-2 text-sm text-gray-700">{e.observable ? "是" : "否"}</td>
                            <td className="px-4 py-2 text-sm text-gray-700">{(e.ownership || "-")} / {(e.system_of_record || "-")}</td>
                            <td className="px-4 py-2 text-sm text-gray-700" onClick={(ev)=>ev.stopPropagation()}>
                              <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" onClick={() => {
                                      setEntityFormEditingId(e.id);
                                      setEntityForm({
                                        name: e.name,
                                        display_name: e.display_name,
                                        type: e.type,
                                        description: e.description,
                                        lifecycle: e.lifecycle,
                                        attributes: (e.attributes || []).map(a=>({ ...a })),
                                        relationships: (e.relationships || []).map(r=>({ ...r })),
                                        primary_key: e.primary_key,
                                        sensitive_fields: e.sensitive_fields,
                                        ownership: e.ownership,
                                        system_of_record: e.system_of_record,
                                        observable: e.observable,
                                        writable_by: e.writable_by,
                                        audit_required: e.audit_required,
                                      });
                                      setFormPageMode(true);
                                      setFormPageModule("Entities");
                                      setFormPageIsEditing(true);
                                      setFormPageStep(1);
                                    }}>编辑</Button>
                                <Button variant="outline" size="sm" onClick={() => {
                                  if (window.confirm("确认删除该业务对象？")) {
                                    setEntitiesData(prev => prev.filter(x => x.id !== e.id));
                                  }
                                }}>删除</Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  {active === "Capabilities" && (
                    <table className="min-w-full table-fixed">
                      <colgroup>
                        <col className="w-[16%]" />
                        <col className="w-[12%]" />
                        <col className="w-[10%]" />
                        <col className="w-[18%]" />
                        <col className="w-[18%]" />
                        <col className="w-[8%]" />
                        <col className="w-[8%]" />
                        <col className="w-[10%]" />
                        <col className="w-[10%]" />
                      </colgroup>
                      <thead className="bg-gray-50">
                        <tr className="divide-x divide-gray-200">
                          <th className="px-4 py-2 text-left text-xs text-gray-600">名称</th>
                          <th className="px-4 py-2 text-left text-xs text-gray-600">类别</th>
                          <th className="px-4 py-2 text-left text-xs text-gray-600">风险</th>
                          <th className="px-4 py-2 text-left text-xs text-gray-600">输入实体</th>
                          <th className="px-4 py-2 text-left text-xs text-gray-600">输出实体</th>
                          <th className="px-4 py-2 text-left text-xs text-gray-600">副作用</th>
                          <th className="px-4 py-2 text-left text-xs text-gray-600">审批</th>
                          <th className="px-4 py-2 text-left text-xs text-gray-600">可调用Agent</th>
                          <th className="px-4 py-2 text-left text-xs text-gray-600">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {(pagedAssets as Capability[]).map((c) => (
                          <tr key={c.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => { setSelectedId(c.id); setDetailOpen(true); }}>
                            <td className="px-4 py-2 text-sm text-gray-900">{c.name}</td>
                            <td className="px-4 py-2 text-sm text-gray-700">{c.category || "-"}</td>
                            <td className="px-4 py-2 text-sm text-gray-700">{c.risk_level}</td>
                            <td className="px-4 py-2 text-sm text-gray-700">{(c.input_entities || []).join(", ") || "-"}</td>
                            <td className="px-4 py-2 text-sm text-gray-700">{(c.output_entities || []).join(", ") || "-"}</td>
                            <td className="px-4 py-2 text-sm text-gray-700">{c.side_effects ? "是" : "否"}</td>
                            <td className="px-4 py-2 text-sm text-gray-700">{c.requires_approval ? "是" : "否"}</td>
                            <td className="px-4 py-2 text-sm text-gray-700">{(c.allowed_agents || []).length}</td>
                            <td className="px-4 py-2 text-sm text-gray-700" onClick={(ev)=>ev.stopPropagation()}>
                              <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" onClick={() => {
                                      setCapFormEditingId(c.id);
                                      setCapForm({
                                        name: c.name,
                                        description: c.description,
                                        category: c.category,
                                        allowed_states: c.allowed_states,
                                        side_effects: c.side_effects,
                                        risk_level: c.risk_level,
                                        requires_approval: c.requires_approval,
                                        allowed_agents: c.allowed_agents,
                                        forbidden_contexts: c.forbidden_contexts,
                                        rule_dependencies: c.rule_dependencies,
                                        audit_log: c.audit_log,
                                        scenario_customer: c.scenario_customer,
                                        scenario_order_state: c.scenario_order_state,
                                        scenario_rule_trigger: c.scenario_rule_trigger,
                                        business_impacts: c.business_impacts,
                                        changes_lifecycle: c.changes_lifecycle,
                                        needs_responsibility: c.needs_responsibility,
                                        impact_entities: c.impact_entities,
                                        primary_entity_id: c.primary_entity_id,
                                        state_change_from: c.state_change_from,
                                        state_change_to: c.state_change_to,
                                      });
                                      setFormPageMode(true);
                                      setFormPageModule("Capabilities");
                                      setFormPageIsEditing(true);
                                      setFormPageStep(1);
                                    }}>编辑</Button>
                                <Button variant="outline" size="sm" onClick={() => {
                                  if (window.confirm("确认删除该能力？")) {
                                    setCapabilitiesData(prev => prev.filter(x => x.id !== c.id));
                                  }
                                }}>删除</Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  {active === "Rules" && (
                    <table className="min-w-full table-fixed">
                      <colgroup>
                        <col className="w-[18%]" />
                        <col className="w-[12%]" />
                        <col className="w-[12%]" />
                        <col className="w-[12%]" />
                        <col className="w-[24%]" />
                        <col className="w-[8%]" />
                        <col className="w-[10%]" />
                        <col className="w-[10%]" />
                        <col className="w-[10%]" />
                      </colgroup>
                      <thead className="bg-gray-50">
                        <tr className="divide-x divide-gray-200">
                          <th className="px-4 py-2 text-left text-xs text-gray-600">名称</th>
                          <th className="px-4 py-2 text-left text-xs text-gray-600">类型</th>
                          <th className="px-4 py-2 text-left text-xs text-gray-600">严重级别</th>
                          <th className="px-4 py-2 text-left text-xs text-gray-600">作用范围</th>
                          <th className="px-4 py-2 text-left text-xs text-gray-600">描述</th>
                          <th className="px-4 py-2 text-left text-xs text-gray-600">引用</th>
                          <th className="px-4 py-2 text-left text-xs text-gray-600">执行模式</th>
                          <th className="px-4 py-2 text-left text-xs text-gray-600">允许Override</th>
                          <th className="px-4 py-2 text-left text-xs text-gray-600">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {(pagedAssets as Rule[]).map((r) => (
                          <tr key={r.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => { setSelectedId(r.id); setDetailOpen(true); }}>
                            <td className="px-4 py-2 text-sm text-gray-900">{r.name}</td>
                            <td className="px-4 py-2 text-sm"><Badge variant="secondary" className="text-[10px]">{r.ruleType}</Badge></td>
                            <td className="px-4 py-2 text-sm"><Badge variant="secondary" className="text-[10px]">{r.severity}</Badge></td>
                            <td className="px-4 py-2 text-sm"><Badge variant="secondary" className="text-[10px]">{r.scope}</Badge></td>
                            <td className="px-4 py-2 text-sm text-gray-700">{r.description}</td>
                            <td className="px-4 py-2 text-sm text-gray-700">{r.referencedCount}</td>
                            <td className="px-4 py-2 text-sm text-gray-700">{r.enforcementMode || "-"}</td>
                            <td className="px-4 py-2 text-sm text-gray-700">{r.override_policy ? "允许" : "禁止"}</td>
                            <td className="px-4 py-2 text-sm text-gray-700" onClick={(ev)=>ev.stopPropagation()}>
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => {
                                  setRuleFormEditingId(r.id);
                                  setRuleForm({
                                    name: r.name,
                                    description: r.description,
                                    ruleType: r.ruleType,
                                    severity: r.severity,
                                    scope: r.scope,
                                    expression: r.expression,
                                  });
                                  setRuleFormOpen(true);
                                }}>编辑</Button>
                                <Button variant="outline" size="sm" onClick={() => {
                                  if (window.confirm("确认删除该规则？")) {
                                    setRulesData(prev => prev.filter(x => x.id !== r.id));
                                  }
                                }}>删除</Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  {active === "Events" && (
                    <table className="min-w-full table-fixed">
                      <colgroup>
                        <col className="w-[18%]" />
                        <col className="w-[12%]" />
                        <col className="w-[24%]" />
                        <col className="w-[12%]" />
                        <col className="w-[10%]" />
                        <col className="w-[10%]" />
                        <col className="w-[10%]" />
                      </colgroup>
                      <thead className="bg-gray-50">
                        <tr className="divide-x divide-gray-200">
                          <th className="px-4 py-2 text-left text-xs text-gray-600">事件名称</th>
                          <th className="px-4 py-2 text-left text-xs text-gray-600">来源实体</th>
                          <th className="px-4 py-2 text-left text-xs text-gray-600">触发条件</th>
                          <th className="px-4 py-2 text-left text-xs text-gray-600">检测类型</th>
                          <th className="px-4 py-2 text-left text-xs text-gray-600">订阅</th>
                          <th className="px-4 py-2 text-left text-xs text-gray-600">优先级</th>
                          <th className="px-4 py-2 text-left text-xs text-gray-600">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {(pagedAssets as EventAsset[]).map((ev) => (
                          <tr key={ev.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => { setSelectedId(ev.id); setDetailOpen(true); }}>
                            <td className="px-4 py-2 text-sm text-gray-900">{ev.name}</td>
                            <td className="px-4 py-2 text-sm text-gray-700">{ev.source_entity}</td>
                            <td className="px-4 py-2 text-sm text-gray-700">{ev.condition}</td>
                            <td className="px-4 py-2 text-sm text-gray-700">{ev.detection_type || "-"}</td>
                            <td className="px-4 py-2 text-sm text-gray-700">{ev.subscribable ? "是" : "否"}</td>
                            <td className="px-4 py-2 text-sm text-gray-700">{ev.default_priority ?? "-"}</td>
                            <td className="px-4 py-2 text-sm text-gray-700" onClick={(evn)=>evn.stopPropagation()}>
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => {
                                  setEventFormEditingId(ev.id);
                                  setEventForm({
                                    name: ev.name,
                                    description: ev.description,
                                    source_entity: ev.source_entity,
                                    triggerEntityId: ev.triggerEntityId,
                                    condition: ev.condition,
                                    detection_type: ev.detection_type,
                                    debounce: ev.debounce,
                                    subscribable: ev.subscribable,
                                    default_priority: ev.default_priority,
                                    allowed_agents: ev.allowed_agents,
                                  });
                                  setEventFormOpen(true);
                                }}>编辑</Button>
                                <Button variant="outline" size="sm" onClick={() => {
                                  if (window.confirm("确认删除该事件？")) {
                                    setEventsData(prev => prev.filter(x => x.id !== ev.id));
                                  }
                                }}>删除</Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
          </div>
          <div className="px-6 py-4 border-t bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-700 order-2 sm:order-1">
              显示 {startIndex + 1} 到 {Math.min(endIndex, totalCount)} 共 {totalCount}
            </div>
            <div className="flex items-center gap-2 order-1 sm:order-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                上一页
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
              >
                下一页
              </Button>
            </div>
          </div>
        </Card>
      </div>
      )}
      {uiMode === "tabs" && moduleTab === "Lifecycle" && (
        <div className="max-w-none">
          <Card className="p-6 bg-white shadow-sm">
            <div className="flex flex-col md:flex-row md:items-end gap-3 mb-4">
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1">选择对象</div>
                <div className="flex flex-wrap gap-2">
                  {entitiesData.map(e => (
                    <button
                      key={e.entity_id}
                      onClick={() => setLifecycleEntityId(e.entity_id)}
                      className={[
                        "px-3 py-1.5 text-sm rounded-md border",
                        lifecycleEntityId === e.entity_id ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"
                      ].join(" ")}
                    >
                      {e.display_name || e.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="md:w-1/3">
                <div className="text-xs text-gray-500 mb-1">新增状态</div>
                <div className="flex gap-2">
                  <Input placeholder="状态名称" value={newStateName} onChange={(e)=>setNewStateName(e.target.value)} />
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      const name = newStateName.trim();
                      if (!name) return;
                      if (lifecycleNodes.some(n => n.id === name)) return;
                      setLifecycleNodes(prev => [...prev, { id: name, position: { x: 100 + prev.length * 80, y: 220 }, data: { label: name }, type: "default" }]);
                      setNewStateName("");
                    }}
                  >
                    添加
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={()=>{
                      setEventFormEditingId(null);
                      setEventForm({
                        name: "",
                        description: "",
                        source_entity: lifecycleEntityId,
                        triggerEntityId: lifecycleEntityId,
                        condition: "状态变化",
                        detection_type: "Realtime",
                        debounce: 0,
                        subscribable: true,
                        default_priority: 5,
                        allowed_agents: [],
                      });
                      setEventFormOpen(true);
                    }}
                  >
                    生成事件
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="md:col-span-2 border rounded-md">
                <div style={{ height: 360 }}>
                  <ReactFlow nodes={lifecycleNodes} edges={lifecycleEdges} onConnect={onLifecycleConnect} fitView>
                    <Controls />
                    <MiniMap />
                    <Background />
                  </ReactFlow>
                </div>
              </div>
              <div className="border rounded-md p-3 space-y-2">
                <div className="text-sm font-medium text-gray-900">新增流转</div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">From</div>
                  <Input placeholder="例如：Paid" value={newTransitionFrom} onChange={(e)=>setNewTransitionFrom(e.target.value)} />
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">To</div>
                  <Input placeholder="例如：Shipped" value={newTransitionTo} onChange={(e)=>setNewTransitionTo(e.target.value)} />
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">触发能力</div>
                  <Input placeholder="例如：ShipOrder" value={newTransitionTrigger} onChange={(e)=>setNewTransitionTrigger(e.target.value)} />
                </div>
                <div className="flex justify-end">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      const from = newTransitionFrom.trim();
                      const to = newTransitionTo.trim();
                      const trig = newTransitionTrigger.trim() || "-";
                      if (!from || !to) return;
                      if (!lifecycleNodes.some(n => n.id === from) || !lifecycleNodes.some(n => n.id === to)) return;
                      const id = `e_${from}_${to}_${Date.now()}`;
                      setLifecycleEdges(prev => [...prev, { id, source: from, target: to, label: trig, animated: false }]);
                      setNewTransitionFrom(""); setNewTransitionTo(""); setNewTransitionTrigger("");
                    }}
                  >
                    添加流转
                  </Button>
                </div>
                <div className="text-xs text-gray-500 mt-2">提示：也可直接在图上连接节点创建流转</div>
              </div>
            </div>
          </Card>
        </div>
      )}
      {uiMode === "tabs" && moduleTab === "Responsibility" && (
        <div className="max-w-none">
          <Card className="bg-white shadow-sm">
            <div className="flex justify-end px-4 py-3 border-b gap-2">
              <Button variant="default" size="sm" onClick={()=>{
                setFormPageMode(true);
                setFormPageModule("Responsibility");
                setFormPageIsEditing(false);
                setFormPageStep(1);
                setRespFormEditingId(null);
                setRespForm({ target:"entity", ref_id:"", business_owner:"", risk_owner:"", escalation_policy:{ condition:"", timeline:"", escalate_to:"" } });
              }}>新建</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full table-fixed">
                <colgroup>
                  <col className="w-[14%]" />
                  <col className="w-[22%]" />
                  <col className="w-[18%]" />
                  <col className="w-[18%]" />
                  <col className="w-[18%]" />
                  <col className="w-[10%]" />
                </colgroup>
                <thead className="bg-gray-50">
                  <tr className="divide-x divide-gray-200">
                    <th className="px-4 py-2 text-left text-xs text-gray-600">目标类型</th>
                    <th className="px-4 py-2 text-left text-xs text-gray-600">关联资源</th>
                    <th className="px-4 py-2 text-left text-xs text-gray-600">业务负责人</th>
                    <th className="px-4 py-2 text-left text-xs text-gray-600">风险负责人</th>
                    <th className="px-4 py-2 text-left text-xs text-gray-600">升级策略</th>
                    <th className="px-4 py-2 text-left text-xs text-gray-600">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {responsibilityData.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm text-gray-900">{r.target}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{r.ref_id}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{r.business_owner}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{r.risk_owner}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{r.escalation_policy.timeline} → {r.escalation_policy.escalate_to}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setRespFormEditingId(r.id);
                              setRespForm({
                                target: r.target,
                                ref_id: r.ref_id,
                                business_owner: r.business_owner,
                                risk_owner: r.risk_owner,
                                escalation_policy: { ...r.escalation_policy },
                              });
                              setRespFormOpen(true);
                            }}
                          >
                            编辑
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (window.confirm("确认删除该责任项？")) {
                                setResponsibilityData((prev) => prev.filter((x) => x.id !== r.id));
                              }
                            }}
                          >
                            删除
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
      {uiMode === "tabs" && moduleTab === "Processes" && (
        <div className="max-w-none">
          <Card className="bg-white shadow-sm">
            <div className="flex justify-end px-4 py-3 border-b gap-2">
              <Button variant="default" size="sm" onClick={()=>{
                setFormPageMode(true);
                setFormPageModule("Processes");
                setFormPageIsEditing(false);
                setFormPageStep(1);
                setProcessFormEditingId(null);
                setProcessForm({ name:"", start_event:"", steps:[], end_states:[], goal:"", applicable_entities:[], recommended:true, allow_bypass:false });
              }}>新建</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full table-fixed">
                <colgroup>
                  <col className="w-[22%]" />
                  <col className="w-[22%]" />
                  <col className="w-[18%]" />
                  <col className="w-[18%]" />
                  <col className="w-[10%]" />
                </colgroup>
                <thead className="bg-gray-50">
                  <tr className="divide-x divide-gray-200">
                    <th className="px-4 py-2 text-left text-xs text-gray-600">流程名称</th>
                    <th className="px-4 py-2 text-left text-xs text-gray-600">Start Event</th>
                    <th className="px-4 py-2 text-left text-xs text-gray-600">Steps</th>
                    <th className="px-4 py-2 text-left text-xs text-gray-600">End States</th>
                    <th className="px-4 py-2 text-left text-xs text-gray-600">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {processesData.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm text-gray-900">{p.name}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{p.start_event}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{p.steps.length}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{p.end_states.join(", ")}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setProcessFormEditingId(p.id);
                              setProcessForm({
                                name: p.name,
                                start_event: p.start_event,
                                steps: p.steps.map((s) => ({ ...s })),
                                end_states: [...p.end_states],
                              });
                              setProcessFormOpen(true);
                            }}
                          >
                            编辑
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (window.confirm("确认删除该流程？")) {
                                setProcessesData((prev) => prev.filter((x) => x.id !== p.id));
                              }
                            }}
                          >
                            删除
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

  {/* References Overview Modal */}
      {showReferencesOverview && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl border border-gray-200 w-full max-w-[90vw]">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <div className="text-base font-semibold text-gray-900">
                引用关系总览（只读）
              </div>
              <button
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={() => setShowReferencesOverview(false)}
              >
                关闭
              </button>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="text-sm font-medium text-gray-900 mb-2">
                  Entities
                </div>
                <ul className="space-y-1 text-sm text-gray-700">
                  {MOCK_ENTITIES.map((e) => (
                    <li key={e.id} className="flex items-center justify-between">
                      <span>{e.name}</span>
                      <span className="text-xs text-gray-500">
                        模型 {e.referencedBy.models.length} · Agent{" "}
                        {e.referencedBy.agents.length}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="text-sm font-medium text-gray-900 mb-2">
                  Capabilities
                </div>
                <ul className="space-y-1 text-sm text-gray-700">
                  {MOCK_CAPABILITIES.map((c) => (
                    <li key={c.id} className="flex items-center justify-between">
                      <span>{c.name}</span>
                      <span className="text-xs text-gray-500">
                        {(c.input_entities || []).join(", ")} → {(c.output_entities || []).join(", ")} · 风险 {c.risk_level}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="text-sm font-medium text-gray-900 mb-2">
                  Rules
                </div>
                <ul className="space-y-1 text-sm text-gray-700">
                  {MOCK_RULES.map((r) => (
                    <li key={r.id} className="flex items-center justify-between">
                      <span>{r.name}</span>
                      <span className="text-xs text-gray-500">
                        {r.ruleType} · {r.severity} · {r.scope} · 引用{" "}
                        {r.referencedCount}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="text-sm font-medium text-gray-900 mb-2">
                  Events
                </div>
                <ul className="space-y-1 text-sm text-gray-700">
                  {MOCK_EVENTS.map((ev) => (
                    <li key={ev.id} className="flex items-center justify-between">
                      <span>{ev.name}</span>
                      <span className="text-xs text-gray-500">
                        来源 {(ev.source_entity)} · 订阅 {ev.subscribable ? "可订阅" : "不可订阅"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <Sheet open={respFormOpen} onOpenChange={setRespFormOpen}>
        <SheetContent side="right" className="w-[560px] p-0">
          <div className="p-4 border-b">
            <SheetHeader>
              <SheetTitle className="text-base">{respFormEditingId ? "编辑责任项" : "新建责任项"}</SheetTitle>
            </SheetHeader>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                {["基础","升级"].map(s => (
                  <button
                    key={s}
                    onClick={()=>setRespFormStep(s)}
                    className={[
                      "w-full text-left px-3 py-2 text-xs rounded-md border",
                      respFormStep === s ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"
                    ].join(" ")}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="md:col-span-3 space-y-4">
                {respFormStep === "基础" && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">目标类型</div>
                        <Select value={respForm.target as any} onValueChange={(v)=>setRespForm(f=>({ ...f, target: v as ResponsibilityTarget }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="entity">Entity</SelectItem>
                            <SelectItem value="capability">Capability</SelectItem>
                            <SelectItem value="process">Process</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">关联资源ID</div>
                        <Input value={respForm.ref_id as any} onChange={(e)=>setRespForm(f=>({ ...f, ref_id: e.target.value }))} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">业务负责人</div>
                        <Input value={respForm.business_owner as any} onChange={(e)=>setRespForm(f=>({ ...f, business_owner: e.target.value }))} />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">风险负责人</div>
                        <Input value={respForm.risk_owner as any} onChange={(e)=>setRespForm(f=>({ ...f, risk_owner: e.target.value }))} />
                      </div>
                    </div>
                  </div>
                )}
                {respFormStep === "升级" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">升级条件</div>
                      <Input value={(respForm.escalation_policy as any)?.condition || ""} onChange={(e)=>setRespForm(f=>({ ...f, escalation_policy: { ...(f.escalation_policy as any), condition: e.target.value } }))} />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">时限</div>
                      <Input value={(respForm.escalation_policy as any)?.timeline || ""} onChange={(e)=>setRespForm(f=>({ ...f, escalation_policy: { ...(f.escalation_policy as any), timeline: e.target.value } }))} />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">升级至</div>
                      <Input value={(respForm.escalation_policy as any)?.escalate_to || ""} onChange={(e)=>setRespForm(f=>({ ...f, escalation_policy: { ...(f.escalation_policy as any), escalate_to: e.target.value } }))} />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={()=>setRespFormOpen(false)}>取消</Button>
              <Button
                variant="default"
                size="sm"
                onClick={()=>{
                  const refId = (respForm.ref_id || "").trim();
                  if (!refId) return;
                  if (respFormEditingId) {
                    setResponsibilityData(prev => prev.map(x => x.id === respFormEditingId ? {
                      ...x,
                      target: respForm.target as any,
                      ref_id: respForm.ref_id as any,
                      business_owner: respForm.business_owner as any,
                      risk_owner: respForm.risk_owner as any,
                      escalation_policy: respForm.escalation_policy as any,
                    } : x));
                  } else {
                    const id = `resp_${Date.now()}`;
                    setResponsibilityData(prev => [...prev, {
                      id,
                      target: respForm.target as any,
                      ref_id: respForm.ref_id as any,
                      business_owner: respForm.business_owner as any,
                      risk_owner: respForm.risk_owner as any,
                      escalation_policy: respForm.escalation_policy as any,
                    }]);
                  }
                  setRespFormOpen(false);
                }}
              >保存</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={processFormOpen} onOpenChange={setProcessFormOpen}>
        <SheetContent side="right" className="w-[560px] p-0">
          <div className="p-4 border-b">
            <SheetHeader>
              <SheetTitle className="text-base">{processFormEditingId ? "编辑流程" : "新建流程"}</SheetTitle>
            </SheetHeader>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                {["基础","步骤","结束"].map(s => (
                  <button
                    key={s}
                    onClick={()=>setProcessFormStep(s)}
                    className={[
                      "w-full text左 px-3 py-2 text-xs rounded-md border",
                      processFormStep === s ? "bg-blue-50 text-blue-700 border-blue-200" : "bg白色 text灰色-700 hover:bg灰色-50 border灰色-200"
                    ].join(" ")}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="md:col-span-3 space-y-4">
                {processFormStep === "基础" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">流程名称</div>
                      <Input value={processForm.name as any} onChange={(e)=>setProcessForm(f=>({ ...f, name: e.target.value }))} />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Start Event</div>
                      <Input value={processForm.start_event as any} onChange={(e)=>setProcessForm(f=>({ ...f, start_event: e.target.value }))} />
                    </div>
                  </div>
                )}
                {processFormStep === "步骤" && (
                  <div>
                    <div className="text-xs text-gray-500 mb-2">步骤</div>
                    <div className="space-y-2">
                      {((processForm.steps as any[]) || []).map((s, idx) => (
                        <div key={idx} className="grid grid-cols-4 gap-2">
                          <Select value={s.type} onValueChange={(v)=>setProcessForm(f=>{
                            const steps = [...(f.steps || [])]; steps[idx] = { ...steps[idx], type: v as any }; return { ...f, steps };
                          })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="capability">Capability</SelectItem>
                        <SelectItem value="rule_check">Rule Check</SelectItem>
                        <SelectItem value="state_check">State Check</SelectItem>
                      </SelectContent>
                          </Select>
                          <Input placeholder="引用ID" value={s.ref || ""} onChange={(e)=>setProcessForm(f=>{
                            const steps = [...(f.steps || [])]; steps[idx] = { ...steps[idx], ref: e.target.value }; return { ...f, steps };
                          })} />
                          <div />
                          <Button variant="outline" size="sm" onClick={()=>setProcessForm(f=>{
                            const steps = [...(f.steps || [])]; steps.splice(idx,1); return { ...f, steps };
                          })}>删除</Button>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={()=>setProcessForm(f=>({ ...f, steps: [...(f.steps || []), { type: "capability", ref: "" }] }))}>添加步骤</Button>
                    </div>
                  </div>
                )}
                {processFormStep === "结束" && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">结束状态（逗号分隔）</div>
                    <Input value={(processForm.end_states || []).join(", ")} onChange={(e)=>setProcessForm(f=>({ ...f, end_states: e.target.value.split(",").map(s=>s.trim()).filter(Boolean) }))} />
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={()=>setProcessFormOpen(false)}>取消</Button>
              <Button
                variant="default"
                size="sm"
                onClick={()=>{
                  const name = (processForm.name || "").trim();
                  if (!name) return;
                  if (processFormEditingId) {
                    setProcessesData(prev => prev.map(x => x.id === processFormEditingId ? {
                      ...x,
                      name: processForm.name as any,
                      start_event: processForm.start_event as any,
                      steps: processForm.steps as any,
                      end_states: processForm.end_states as any,
                    } : x));
                  } else {
                    const id = `proc_${Date.now()}`;
                    setProcessesData(prev => [...prev, {
                      id,
                      name: processForm.name as any,
                      start_event: processForm.start_event as any,
                      steps: processForm.steps as any,
                      end_states: processForm.end_states as any,
                    }]);
                  }
                  setProcessFormOpen(false);
                }}
              >保存</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Entity Form Sheet */}
      <Sheet open={entityFormOpen} onOpenChange={setEntityFormOpen}>
        <SheetContent side="right" className="w-[560px] p-0">
          <div className="p-4 border-b">
            <SheetHeader>
              <SheetTitle className="text-base">{entityFormEditingId ? "编辑业务对象" : "新建业务对象"}</SheetTitle>
            </SheetHeader>
          </div>
          <div className="p-4 space-y-4">
            <div className="text-xs text-gray-600">在受控上下文中补全一个企业级业务事实：该对象在业务中是什么、为何重要、与谁有关</div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                {["基础","属性","关系","治理"].map(s => (
                  <button
                    key={s}
                    onClick={()=>setEntityFormStep(s)}
                    className={[
                      "w-full text-left px-3 py-2 text-xs rounded-md border",
                      entityFormStep === s ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"
                    ].join(" ")}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="md:col-span-3 space-y-4">
                {entityFormStep === "基础" && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">名称</div>
                        <Input value={entityForm.name as any} onChange={(e)=>setEntityForm(f=>({ ...f, name: e.target.value }))} />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">展示名</div>
                        <Input value={entityForm.display_name as any} onChange={(e)=>setEntityForm(f=>({ ...f, display_name: e.target.value }))} />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">业务角色定位</div>
                        <Select value={entityForm.type as any} onValueChange={(v)=>setEntityForm(f=>({ ...f, type: v as EntityType }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Master">主数据对象</SelectItem>
                            <SelectItem value="Transaction">交易对象</SelectItem>
                            <SelectItem value="Event">结果对象</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">生命周期</div>
                        <Input value={entityForm.lifecycle as any} onChange={(e)=>setEntityForm(f=>({ ...f, lifecycle: e.target.value }))} />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">业务语义（不少于20字）</div>
                      <textarea className="w-full border rounded-md p-2 text-sm" rows={3} value={entityForm.description as any} onChange={(e)=>setEntityForm(f=>({ ...f, description: e.target.value }))}></textarea>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">业务重要性</div>
                        <div className="flex flex-wrap gap-2">
                          <button className={["text-xs px-2 py-1 rounded-md border", entityForm.participates_settlement ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"].join(" ")} onClick={()=>setEntityForm(f=>({ ...f, participates_settlement: !f.participates_settlement }))}>参与结算</button>
                          <button className={["text-xs px-2 py-1 rounded-md border", entityForm.participates_risk ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"].join(" ")} onClick={()=>setEntityForm(f=>({ ...f, participates_risk: !f.participates_risk }))}>影响风控</button>
                          <button className={["text-xs px-2 py-1 rounded-md border", entityForm.participates_compliance ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"].join(" ")} onClick={()=>setEntityForm(f=>({ ...f, participates_compliance: !f.participates_compliance }))}>涉及合规</button>
                          <button className={["text-xs px-2 py-1 rounded-md border", entityForm.ai_readwrite ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"].join(" ")} onClick={()=>setEntityForm(f=>({ ...f, ai_readwrite: !f.ai_readwrite }))}>可被智能体读写</button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                {entityFormStep === "属性" && (
                  <div>
                    <div className="text-xs text-gray-500 mb-2">属性</div>
                    <div className="space-y-2">
                      {((entityForm.attributes as any[]) || []).map((a, idx) => (
                        <div key={idx} className="grid grid-cols-5 gap-2">
                          <Input placeholder="名称" value={a.name || ""} onChange={(e)=>setEntityForm(f=>{
                            const attrs = [...(f.attributes || [])]; attrs[idx] = { ...attrs[idx], name: e.target.value }; return { ...f, attributes: attrs };
                          })} />
                          <Input placeholder="类型" value={a.type || ""} onChange={(e)=>setEntityForm(f=>{
                            const attrs = [...(f.attributes || [])]; attrs[idx] = { ...attrs[idx], type: e.target.value }; return { ...f, attributes: attrs };
                          })} />
                          <button className={["text-xs px-2 py-1 rounded-md border", a.nullable ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"].join(" ")} onClick={()=>setEntityForm(f=>{
                            const attrs = [...(f.attributes || [])]; attrs[idx] = { ...attrs[idx], nullable: !attrs[idx]?.nullable }; return { ...f, attributes: attrs };
                          })}>{a.nullable ? "可空" : "不可空"}</button>
                          <Input placeholder="描述" value={a.description || ""} onChange={(e)=>setEntityForm(f=>{
                            const attrs = [...(f.attributes || [])]; attrs[idx] = { ...attrs[idx], description: e.target.value }; return { ...f, attributes: attrs };
                          })} />
                          <Button variant="outline" size="sm" onClick={()=>setEntityForm(f=>{
                            const attrs = [...(f.attributes || [])]; attrs.splice(idx,1); return { ...f, attributes: attrs };
                          })}>删除</Button>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={()=>setEntityForm(f=>({ ...f, attributes: [...(f.attributes || []), { name: "", type: "", nullable: false, description: "" }] }))}>添加属性</Button>
                    </div>
                  </div>
                )}
                {entityFormStep === "关系" && (
                  <div>
                    <div className="text-xs text-gray-500 mb-2">关系</div>
                    <div className="space-y-2">
                      <div className="text-xs text-gray-500 mb-1">选择关联对象</div>
                      <div className="flex flex-wrap gap-2">
                        {entitiesData.map(en => (
                          <button key={en.entity_id} className="px-2 py-1 text-xs rounded-md border" onClick={()=>setEntityForm(f=>{
                            const has = (f.relationships || []).some(x=>x.target_entity===en.entity_id);
                            const rel = has ? (f.relationships || []).filter(x=>x.target_entity!==en.entity_id) : [ ...(f.relationships || []), { target_entity: en.entity_id, relation_type: "引用", description: "" } ];
                            return { ...f, relationships: rel };
                          })}>{en.display_name || en.name}</button>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">关系类型默认为“引用”，可在保存后在高级视图中调整</div>
                    </div>
                  </div>
                )}
                {entityFormStep === "治理" && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">业务主键</div>
                        <Input value={entityForm.primary_key as any} onChange={(e)=>setEntityForm(f=>({ ...f, primary_key: e.target.value }))} />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">敏感字段（逗号分隔）</div>
                        <Input value={(entityForm.sensitive_fields || []).join(", ")} onChange={(e)=>setEntityForm(f=>({ ...f, sensitive_fields: e.target.value.split(",").map(s=>s.trim()).filter(Boolean) }))} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">归属</div>
                        <Input value={entityForm.ownership as any} onChange={(e)=>setEntityForm(f=>({ ...f, ownership: e.target.value }))} />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">来源系统</div>
                        <Input value={entityForm.system_of_record as any} onChange={(e)=>setEntityForm(f=>({ ...f, system_of_record: e.target.value }))} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">可观察</div>
                        <button className={["text-xs px-2 py-1 rounded-md border", entityForm.observable ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"].join(" ")} onClick={()=>setEntityForm(f=>({ ...f, observable: !f.observable }))}>{entityForm.observable ? "是" : "否"}</button>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">需审计</div>
                        <button className={["text-xs px-2 py-1 rounded-md border", entityForm.audit_required ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"].join(" ")} onClick={()=>setEntityForm(f=>({ ...f, audit_required: !f.audit_required }))}>{entityForm.audit_required ? "是" : "否"}</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">参与结算</div>
                        <button className={["text-xs px-2 py-1 rounded-md border", entityForm.participates_settlement ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"].join(" ")} onClick={()=>setEntityForm(f=>({ ...f, participates_settlement: !f.participates_settlement }))}>{entityForm.participates_settlement ? "是" : "否"}</button>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">参与风控</div>
                        <button className={["text-xs px-2 py-1 rounded-md border", entityForm.participates_risk ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"].join(" ")} onClick={()=>setEntityForm(f=>({ ...f, participates_risk: !f.participates_risk }))}>{entityForm.participates_risk ? "是" : "否"}</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">参与合规</div>
                        <button className={["text-xs px-2 py-1 rounded-md border", entityForm.participates_compliance ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"].join(" ")} onClick={()=>setEntityForm(f=>({ ...f, participates_compliance: !f.participates_compliance }))}>{entityForm.participates_compliance ? "是" : "否"}</button>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">AI 可读写</div>
                        <button className={["text-xs px-2 py-1 rounded-md border", entityForm.ai_readwrite ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"].join(" ")} onClick={()=>setEntityForm(f=>({ ...f, ai_readwrite: !f.ai_readwrite }))}>{entityForm.ai_readwrite ? "是" : "否"}</button>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">可被修改的能力（逗号分隔）</div>
                      <Input value={(entityForm.writable_by || []).join(", ")} onChange={(e)=>setEntityForm(f=>({ ...f, writable_by: e.target.value.split(",").map(s=>s.trim()).filter(Boolean) }))} />
                    </div>
                    <div className="border rounded-md p-3 text-xs text-gray-700">
                      <div className="text-xs text-gray-500 mb-1">系统推导（只读）</div>
                      <div>必须配置生命周期：{(lifecycleNodes.length>0 && lifecycleEdges.length>0) ? "是" : "建议配置"}</div>
                      <div>默认风险等级：{entityForm.participates_risk ? "Medium/High" : "Low"}</div>
                      <div>Agent 默认访问权限：{entityForm.ai_readwrite ? "读写" : "只读/受限"}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={()=>setEntityFormOpen(false)}>取消</Button>
              <Button
                variant="default"
                size="sm"
                onClick={()=>{
                  const name = (entityForm.name || "").trim();
                  if (!name) return;
                  if (entityFormEditingId) {
                    setEntitiesData(prev => prev.map(x => x.id === entityFormEditingId ? {
                      ...x,
                      name: entityForm.name as any,
                      display_name: entityForm.display_name as any,
                      type: entityForm.type as any,
                      description: entityForm.description as any,
                      lifecycle: entityForm.lifecycle as any,
                      attributes: entityForm.attributes as any,
                      relationships: entityForm.relationships as any,
                      primary_key: entityForm.primary_key as any,
                      sensitive_fields: entityForm.sensitive_fields as any,
                      ownership: entityForm.ownership as any,
                      system_of_record: entityForm.system_of_record as any,
                      observable: entityForm.observable as any,
                      writable_by: entityForm.writable_by as any,
                      audit_required: entityForm.audit_required as any,
                    } : x));
                  } else {
                    const id = `entity_${Date.now()}`;
                    setEntitiesData(prev => [...prev, {
                      id, entity_id: id,
                      name: entityForm.name as any,
                      display_name: entityForm.display_name as any,
                      type: entityForm.type as any,
                      description: entityForm.description as any,
                      lifecycle: entityForm.lifecycle as any,
                      attributes: entityForm.attributes as any,
                      relationships: entityForm.relationships as any,
                      primary_key: entityForm.primary_key as any,
                      sensitive_fields: entityForm.sensitive_fields as any,
                      ownership: entityForm.ownership as any,
                      system_of_record: entityForm.system_of_record as any,
                      observable: entityForm.observable as any,
                      writable_by: entityForm.writable_by as any,
                      audit_required: entityForm.audit_required as any,
                      referencedBy: { models: [], agents: [] }
                    }]);
                  }
                  setEntityFormOpen(false);
                }}
              >保存</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Capability Form Sheet */}
      <Sheet open={capFormOpen} onOpenChange={setCapFormOpen}>
        <SheetContent side="right" className="w-[560px] p-0">
          <div className="p-4 border-b">
            <SheetHeader>
              <SheetTitle className="text-base">{capFormEditingId ? "编辑能力" : "新建能力"}</SheetTitle>
            </SheetHeader>
          </div>
          <div className="p-4 space-y-4">
            <div className="text-xs text-gray-600">在受控上下文中补全一个企业级业务事实：该能力在什么情况下发生、影响是什么、是否需要责任与审批</div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                {["基础","涉及对象","影响","策略"].map(s => (
                  <button
                    key={s}
                    onClick={()=>setCapFormStep(s)}
                    className={[
                      "w-full text-left px-3 py-2 text-xs rounded-md border",
                      capFormStep === s ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"
                    ].join(" ")}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="md:col-span-3 space-y-4">
                {capFormStep === "基础" && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">名称</div>
                        <Input value={capForm.name as any} onChange={(e)=>setCapForm(f=>({ ...f, name: e.target.value }))} />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">类别</div>
                        <Input value={capForm.category as any} onChange={(e)=>setCapForm(f=>({ ...f, category: e.target.value }))} />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">业务场景描述（不少于20字）</div>
                      <textarea className="w-full border rounded-md p-2 text-sm" rows={3} value={capForm.description as any} onChange={(e)=>setCapForm(f=>{
                        const desc = e.target.value;
                        const nameSuggestion = desc.trim().slice(0, 12);
                        return { ...f, description: desc, name: f.name || nameSuggestion };
                      })}></textarea>
                    </div>
                  </>
                )}
                {capFormStep === "涉及对象" && (
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">选择影响对象</div>
                      <div className="flex flex-wrap gap-2">
                        {entitiesData.map(en => (
                          <button key={en.entity_id} className={["px-2 py-1 text-xs rounded-md border", (capForm.impact_entities||[]).includes(en.entity_id)?"bg-blue-50 border-blue-200":"bg-white border-gray-200"].join(" ")} onClick={()=>setCapForm(f=>{
                            const list = new Set([...(f.impact_entities||[])]);
                            if (list.has(en.entity_id)) list.delete(en.entity_id); else list.add(en.entity_id);
                            return { ...f, impact_entities: Array.from(list) };
                          })}>{en.display_name || en.name}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">主要作用对象</div>
                      <Select value={capForm.primary_entity_id as any} onValueChange={(v)=>setCapForm(f=>({ ...f, primary_entity_id: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {(capForm.impact_entities||[]).map(eid => {
                            const en = entitiesData.find(x=>x.entity_id===eid);
                            return <SelectItem key={eid} value={eid}>{en?.display_name || en?.name || eid}</SelectItem>
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                {capFormStep === "状态" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">允许状态（逗号分隔）</div>
                      <Input value={(capForm.allowed_states || []).join(", ")} onChange={(e)=>setCapForm(f=>({ ...f, allowed_states: e.target.value.split(",").map(s=>s.trim()).filter(Boolean) }))} />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">生命周期建议</div>
                      <div className="flex flex-wrap gap-2">
                        {lifecycleNodes.map(n => (
                          <button key={n.id} className="px-2 py-1 text-xs rounded-md border" onClick={()=>setCapForm(f=>({ ...f, allowed_states: Array.from(new Set([...(f.allowed_states||[]), n.id])) }))}>{n.id}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">状态变化（前/后）</div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input placeholder="From" value={capForm.state_change_from as any} onChange={(e)=>setCapForm(f=>({ ...f, state_change_from: e.target.value }))} />
                        <Input placeholder="To" value={capForm.state_change_to as any} onChange={(e)=>setCapForm(f=>({ ...f, state_change_to: e.target.value }))} />
                      </div>
                    </div>
                  </div>
                )}
                {capFormStep === "策略" && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">当客户 ______</div>
                        <Input value={capForm.scenario_customer as any} onChange={(e)=>setCapForm(f=>({ ...f, scenario_customer: e.target.value }))} />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">当订单处于 ______ 状态</div>
                        <Input value={capForm.scenario_order_state as any} onChange={(e)=>setCapForm(f=>({ ...f, scenario_order_state: e.target.value }))} />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">当规则 ______ 被触发</div>
                        <Input value={capForm.scenario_rule_trigger as any} onChange={(e)=>setCapForm(f=>({ ...f, scenario_rule_trigger: e.target.value }))} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">风险等级</div>
                        <Select value={capForm.risk_level as any} onValueChange={(v)=>setCapForm(f=>({ ...f, risk_level: v as RiskLevel }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">需要审批</div>
                        <button className={["text-xs px-2 py-1 rounded-md border", capForm.requires_approval ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"].join(" ")} onClick={()=>setCapForm(f=>({ ...f, requires_approval: !f.requires_approval }))}>{capForm.requires_approval ? "是" : "否"}</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">业务影响（多选）</div>
                        <div className="flex flex-wrap gap-2">
                          {["状态","金额","权益","记录/通知"].map(k => (
                            <button key={k} className={["px-2 py-1 text-xs rounded-md border", (capForm.business_impacts||[]).includes(k as any) ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"].join(" ")} onClick={()=>setCapForm(f=>{
                              const set = new Set([...(f.business_impacts||[])]);
                              if (set.has(k as any)) set.delete(k as any); else set.add(k as any);
                              return { ...f, business_impacts: Array.from(set) as any };
                            })}>{k}</button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">是否改变生命周期</div>
                        <button className={["text-xs px-2 py-1 rounded-md border", capForm.changes_lifecycle ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"].join(" ")} onClick={()=>setCapForm(f=>({ ...f, changes_lifecycle: !f.changes_lifecycle }))}>{capForm.changes_lifecycle ? "是" : "否"}</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">是否需要责任确认</div>
                        <button className={["text-xs px-2 py-1 rounded-md border", capForm.needs_responsibility ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"].join(" ")} onClick={()=>setCapForm(f=>({ ...f, needs_responsibility: !f.needs_responsibility }))}>{capForm.needs_responsibility ? "是" : "否"}</button>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">记录执行日志</div>
                        <button className={["text-xs px-2 py-1 rounded-md border", capForm.audit_log ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"].join(" ")} onClick={()=>setCapForm(f=>({ ...f, audit_log: !f.audit_log }))}>{capForm.audit_log ? "是" : "否"}</button>
                      </div>
                    </div>
                    <div className="border rounded-md p-3 text-xs text-gray-700">
                      <div className="text-xs text-gray-500 mb-1">系统推导（只读）</div>
                      <div>风险等级：{capForm.risk_level}</div>
                      <div>建议审批：{(capForm.business_impacts||[]).includes("金额") || capForm.risk_level==="High" ? "是" : "否"}</div>
                      <div>是否需要责任人：{capForm.needs_responsibility ? "是" : "否"}</div>
                      <div>可被调用的 Agent 类型：基于能力类别与风险，自动分配</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={()=>setCapFormOpen(false)}>取消</Button>
              <Button
                variant="default"
                size="sm"
                onClick={()=>{
                  const name = (capForm.name || "").trim();
                  if (!name) return;
                  if (capFormEditingId) {
                    setCapabilitiesData(prev => prev.map(x => x.id === capFormEditingId ? {
                      ...x,
                      name: capForm.name as any,
                      description: capForm.description as any,
                      category: capForm.category as any,
                      input_entities: capForm.input_entities as any,
                      output_entities: capForm.output_entities as any,
                      allowed_states: capForm.allowed_states as any,
                      side_effects: capForm.side_effects as any,
                      risk_level: capForm.risk_level as any,
                      requires_approval: capForm.requires_approval as any,
                      allowed_agents: capForm.allowed_agents as any,
                      forbidden_contexts: capForm.forbidden_contexts as any,
                      rule_dependencies: capForm.rule_dependencies as any,
                      audit_log: capForm.audit_log as any,
                    } : x));
                  } else {
                    const id = `cap_${Date.now()}`;
                    setCapabilitiesData(prev => [...prev, {
                      id, capability_id: id,
                      name: capForm.name as any,
                      description: capForm.description as any,
                      category: capForm.category as any,
                      input_entities: capForm.input_entities as any,
                      output_entities: capForm.output_entities as any,
                      allowed_states: capForm.allowed_states as any,
                      side_effects: capForm.side_effects as any,
                      risk_level: capForm.risk_level as any,
                      requires_approval: capForm.requires_approval as any,
                      allowed_agents: capForm.allowed_agents as any,
                      forbidden_contexts: capForm.forbidden_contexts as any,
                      rule_dependencies: capForm.rule_dependencies as any,
                      audit_log: capForm.audit_log as any,
                    }]);
                  }
                  setCapFormOpen(false);
                }}
              >保存</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Rule Form Sheet */}
      <Sheet open={ruleFormOpen} onOpenChange={setRuleFormOpen}>
        <SheetContent side="right" className="w-[560px] p-0">
          <div className="p-4 border-b">
            <SheetHeader>
              <SheetTitle className="text-base">{ruleFormEditingId ? "编辑规则" : "新建规则"}</SheetTitle>
            </SheetHeader>
          </div>
          <div className="p-4 space-y-4">
            <div className="text-xs text-gray-600">规则需附着在对象/能力/状态迁移上创建，禁止独立创建</div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                {["基础","范围","表达式"].map(s => (
                  <button
                    key={s}
                    onClick={()=>setRuleFormStep(s)}
                    className={[
                      "w-full text-left px-3 py-2 text-xs rounded-md border",
                      ruleFormStep === s ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"
                    ].join(" ")}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="md:col-span-3 space-y-4">
                {ruleFormStep === "基础" && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">名称</div>
                        <Input value={ruleForm.name as any} onChange={(e)=>setRuleForm(f=>({ ...f, name: e.target.value }))} />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">类型</div>
                        <Select value={ruleForm.ruleType as any} onValueChange={(v)=>setRuleForm(f=>({ ...f, ruleType: v as RuleType }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="合规">合规</SelectItem>
                            <SelectItem value="财务">财务</SelectItem>
                            <SelectItem value="SLA">SLA</SelectItem>
                            <SelectItem value="风控">风控</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">描述</div>
                      <textarea className="w-full border rounded-md p-2 text-sm" rows={3} value={ruleForm.description as any} onChange={(e)=>setRuleForm(f=>({ ...f, description: e.target.value }))}></textarea>
                    </div>
                  </>
                )}
                {ruleFormStep === "范围" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">严重级别</div>
                      <Select value={ruleForm.severity as any} onValueChange={(v)=>setRuleForm(f=>({ ...f, severity: v as Severity }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="blocking">Blocking</SelectItem>
                          <SelectItem value="warning">Warning</SelectItem>
                          <SelectItem value="audit">Audit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">作用范围</div>
                      <Select value={ruleForm.scope as any} onValueChange={(v)=>setRuleForm(f=>({ ...f, scope: v as Scope }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Entity">Entity</SelectItem>
                          <SelectItem value="Capability">Capability</SelectItem>
                          <SelectItem value="Agent">Agent</SelectItem>
                          <SelectItem value="State">State</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">违规后果</div>
                      <Select value={ruleForm.violation_action as any} onValueChange={(v)=>setRuleForm(f=>({ ...f, violation_action: v as any }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="阻断">阻断</SelectItem>
                          <SelectItem value="记录">记录</SelectItem>
                          <SelectItem value="上报">上报</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="border rounded-md p-3 text-xs text-gray-700">
                      <div className="text-xs text-gray-500 mb-1">系统推导（只读）</div>
                      <div>影响的能力/流程：创建后自动汇总</div>
                      <div>Agent 调用行为变化：按规则类型与严重级别呈现</div>
                    </div>
                  </div>
                )}
                {ruleFormStep === "表达式" && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">表达式</div>
                    <Input value={ruleForm.expression as any} onChange={(e)=>setRuleForm(f=>({ ...f, expression: e.target.value }))} />
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={()=>setRuleFormOpen(false)}>取消</Button>
              <Button
                variant="default"
                size="sm"
                onClick={()=>{
                  const name = (ruleForm.name || "").trim();
                  if (!name) return;
                  if (ruleFormEditingId) {
                    setRulesData(prev => prev.map(x => x.id === ruleFormEditingId ? {
                      ...x,
                      name: ruleForm.name as any,
                      description: ruleForm.description as any,
                      ruleType: ruleForm.ruleType as any,
                      severity: ruleForm.severity as any,
                      scope: ruleForm.scope as any,
                      expression: ruleForm.expression as any,
                    } : x));
                  } else {
                    const id = `rule_${Date.now()}`;
                    setRulesData(prev => [...prev, {
                      id, rule_id: id,
                      name: ruleForm.name as any,
                      description: ruleForm.description as any,
                      ruleType: ruleForm.ruleType as any,
                      severity: ruleForm.severity as any,
                      scope: ruleForm.scope as any,
                      expression: ruleForm.expression as any,
                      referencedCount: 0
                    }]);
                  }
                  setRuleFormOpen(false);
                }}
              >保存</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Event Form Sheet */}
      <Sheet open={eventFormOpen} onOpenChange={setEventFormOpen}>
        <SheetContent side="right" className="w-[560px] p-0">
          <div className="p-4 border-b">
            <SheetHeader>
              <SheetTitle className="text-base">{eventFormEditingId ? "编辑事件" : "新建事件"}</SheetTitle>
            </SheetHeader>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                {["基础","来源","投递"].map(s => (
                  <button
                    key={s}
                    onClick={()=>setEventFormStep(s)}
                    className={[
                      "w-full text-left px-3 py-2 text-xs rounded-md border",
                      eventFormStep === s ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"
                    ].join(" ")}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="md:col-span-3 space-y-4">
                {eventFormStep === "基础" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">事件名称</div>
                      <Input value={eventForm.name as any} onChange={(e)=>setEventForm(f=>({ ...f, name: e.target.value }))} />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">描述</div>
                      <Input value={eventForm.description as any} onChange={(e)=>setEventForm(f=>({ ...f, description: e.target.value }))} />
                    </div>
                  </div>
                )}
                {eventFormStep === "来源" && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">来源实体</div>
                        <Input value={eventForm.source_entity as any} onChange={(e)=>setEventForm(f=>({ ...f, source_entity: e.target.value }))} />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">触发实体</div>
                        <Input value={eventForm.triggerEntityId as any} onChange={(e)=>setEventForm(f=>({ ...f, triggerEntityId: e.target.value }))} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">来源类型</div>
                        <div className="flex gap-2 text-xs">
                          <button className={["px-2 py-1 rounded-md border", eventSourceKind==="state_change"?"bg-blue-50 border-blue-200":"bg-white border-gray-200"].join(" ")} onClick={()=>setEventSourceKind("state_change")}>状态变化</button>
                          <button className={["px-2 py-1 rounded-md border", eventSourceKind==="rule_violation"?"bg-blue-50 border-blue-200":"bg-white border-gray-200"].join(" ")} onClick={()=>setEventSourceKind("rule_violation")}>规则触发</button>
                          <button className={["px-2 py-1 rounded-md border", eventSourceKind==="field_change"?"bg-blue-50 border-blue-200":"bg-white border-gray-200"].join(" ")} onClick={()=>setEventSourceKind("field_change")}>关键字段变化</button>
                        </div>
                      </div>
                      {eventSourceKind === "state_change" && (
                        <>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">From 状态</div>
                            <Input value={eventFromState} onChange={(e)=>setEventFromState(e.target.value)} />
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 mb-1">To 状态</div>
                            <Input value={eventToState} onChange={(e)=>setEventToState(e.target.value)} />
                          </div>
                        </>
                      )}
                      {eventSourceKind === "rule_violation" && (
                        <div>
                          <div className="text-xs text-gray-500 mb-1">规则ID</div>
                          <Input value={eventRuleRef} onChange={(e)=>setEventRuleRef(e.target.value)} />
                        </div>
                      )}
                      {eventSourceKind === "field_change" && (
                        <div>
                          <div className="text-xs text-gray-500 mb-1">关键字段</div>
                          <Input value={eventFieldName} onChange={(e)=>setEventFieldName(e.target.value)} />
                        </div>
                      )}
                    </div>
                  </>
                )}
                {eventFormStep === "投递" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">检测类型</div>
                      <Select value={eventForm.detection_type as any} onValueChange={(v)=>setEventForm(f=>({ ...f, detection_type: v as DetectionType }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Realtime">实时</SelectItem>
                          <SelectItem value="Scheduled">定时</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">防抖（秒）</div>
                      <Input value={String(eventForm.debounce ?? 0)} onChange={(e)=>setEventForm(f=>({ ...f, debounce: Number(e.target.value || 0) }))} />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={()=>setEventFormOpen(false)}>取消</Button>
              <Button
                variant="default"
                size="sm"
                onClick={()=>{
                  const name = (eventForm.name || "").trim();
                  // derive event name and condition from subscription
                  let derivedName = "";
                  let derivedCond = "";
                  if (eventSourceKind === "state_change") {
                    derivedName = `${eventForm.source_entity || "Entity"}.${eventFromState || "From"}→${eventToState || "To"}`;
                    derivedCond = `当状态 ${eventFromState} → ${eventToState}`;
                  } else if (eventSourceKind === "rule_violation") {
                    derivedName = `Rule.${eventRuleRef || "Unknown"}.Violation`;
                    derivedCond = `当规则 ${eventRuleRef} 被触发`;
                  } else {
                    derivedName = `${eventForm.source_entity || "Entity"}.${eventFieldName || "Field"}.Changed`;
                    derivedCond = `当关键字段 ${eventFieldName} 变化`;
                  }
                  if (eventFormEditingId) {
                    setEventsData(prev => prev.map(x => x.id === eventFormEditingId ? {
                      ...x,
                      name: derivedName as any,
                      description: eventForm.description as any,
                      source_entity: eventForm.source_entity as any,
                      triggerEntityId: eventForm.triggerEntityId as any,
                      condition: derivedCond as any,
                      detection_type: eventForm.detection_type as any,
                      debounce: eventForm.debounce as any,
                      subscribable: eventForm.subscribable as any,
                      default_priority: eventForm.default_priority as any,
                      allowed_agents: eventForm.allowed_agents as any,
                    } : x));
                  } else {
                    const id = `event_${Date.now()}`;
                    setEventsData(prev => [...prev, {
                      id, event_id: id,
                      name: derivedName as any,
                      description: eventForm.description as any,
                      source_entity: eventForm.source_entity as any,
                      triggerEntityId: eventForm.triggerEntityId as any,
                      condition: derivedCond as any,
                      detection_type: eventForm.detection_type as any,
                      debounce: eventForm.debounce as any,
                      subscribable: eventForm.subscribable as any,
                      default_priority: eventForm.default_priority as any,
                      allowed_agents: eventForm.allowed_agents as any,
                    }]);
                  }
                  setEventFormOpen(false);
                }}
              >保存</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      {false && (
      <div className="max-w-none">
        <Card className="p-6 bg-white shadow-sm">
          <div className="mb-4">
            <div className="text-base font-semibold text-gray-900">企业数字业务建模台</div>
            <div className="text-sm text-gray-600">业务对象 → 行为能力 → 业务底线 → 生命周期 → 业务事件 → 责任与风险 → 流程编排</div>
          </div>

          {/* 业务对象 */}
          <div className="mt-2">
            <div className="text-sm font-medium text-gray-900 mb-2">业务对象</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-md p-3">
                <div className="text-xs text-gray-500 mb-2">对象列表</div>
                <ul className="space-y-2">
                  {MOCK_ENTITIES.map(e => (
                    <li key={e.id} className="flex items-center justify-between">
                      <span className="text-sm text-gray-800">{e.display_name || e.name}</span>
                      <Button variant="outline" size="sm" onClick={() => { setSelectedId(e.id); setDetailOpen(true); }}>查看</Button>
                    </li>
                  ))}
                </ul>
                <div className="mt-3">
                  <Button variant="default" size="sm">添加业务对象</Button>
                </div>
              </div>
              <div className="md:col-span-2 border rounded-md p-3">
                <div className="text-xs text-gray-500 mb-2">对象详情（分区）</div>
                <div className="text-xs text-gray-500">请选择左侧对象进行查看，分区包含：基本语义、关键属性（业务标签化）、关系信息</div>
              </div>
            </div>
          </div>

          {/* 行为能力 */}
          <div className="mt-6">
            <div className="text-sm font-medium text-gray-900 mb-2">业务可以做什么</div>
            <div className="border rounded-md p-3">
              <div className="text-xs text-gray-500 mb-2">从业务场景中提取（模板）</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <div className="text-xs text-gray-500 mb-1">能力名称</div>
                  <Input placeholder="例如：审批退款" />
                </div>
                <div className="md:col-span-2">
                  <div className="text-xs text-gray-500 mb-1">发生条件（自然语言）</div>
                  <Input placeholder="当 _________" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                <div>
                  <div className="text-xs text-gray-500 mb-1">涉及对象</div>
                  <div className="text-xs text-gray-700">{MOCK_ENTITIES.map(e => e.display_name).join(" / ")}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">结果影响</div>
                  <div className="text-xs text-gray-700">状态变化 / 金额变化</div>
                </div>
                <div className="flex items-end justify-end">
                  <Button variant="default" size="sm">生成能力草案</Button>
                </div>
              </div>
            </div>
          </div>

          {/* 业务底线与政策 */}
          <div className="mt-6">
            <div className="text-sm font-medium text-gray-900 mb-2">业务底线与政策</div>
            <div className="border rounded-md p-3">
              <div className="text-xs text-gray-500 mb-2">在对象/能力页面中附着规则</div>
              <ul className="space-y-2">
                {MOCK_RULES.map(r => (
                  <li key={r.id} className="flex items-center justify-between">
                    <div className="text-sm text-gray-800">{r.name} · {r.ruleType} · {r.scope}</div>
                    <div className="text-xs text-gray-600">{r.severity} · {r.description}</div>
                  </li>
                ))}
              </ul>
              <div className="mt-3">
                <Button variant="outline" size="sm">添加规则</Button>
              </div>
            </div>
          </div>

          {/* 生命周期（状态与流转） */}
          <div className="mt-6">
            <div className="text-sm font-medium text-gray-900 mb-2">对象状态变化（Lifecycle）</div>
            <div className="border rounded-md p-3">
              <div className="text-xs text-gray-500 mb-2">状态流转图（只读示例）</div>
              <div className="text-xs text-gray-700">请在业务模型编辑器中维护完整流转，Agent 将据此安全调用。</div>
            </div>
          </div>

          {/* 业务事件（订阅式） */}
          <div className="mt-6">
            <div className="text-sm font-medium text-gray-900 mb-2">业务信号（Events）</div>
            <div className="border rounded-md p-3">
              <div className="text-xs text-gray-500 mb-2">仅允许从状态变化/规则触发/关键字段变化创建</div>
              <ul className="space-y-2">
                {MOCK_EVENTS.map(ev => (
                  <li key={ev.id} className="flex items-center justify-between">
                    <div className="text-sm text-gray-800">{ev.name} · 来源 {ev.source_entity}</div>
                    <div className="text-xs text-gray-600">{ev.subscribable ? "可订阅" : "不可订阅"} · 优先级 {ev.default_priority ?? "-"}</div>
                  </li>
                ))}
              </ul>
              <div className="mt-3">
                <Button variant="outline" size="sm">从来源创建事件</Button>
              </div>
            </div>
          </div>

          {/* 责任与风险 */}
          <div className="mt-6">
            <div className="text-sm font-medium text-gray-900 mb-2">责任与升级机制</div>
            <div className="border rounded-md p-3">
              <div className="text-xs text-gray-500 mb-2">为对象/能力/流程配置业务负责人与风险负责人及升级策略</div>
              <div className="text-xs text-gray-700">示例：当退款被拒绝，业务负责人：客户服务负责人；超过2小时升级至客服主管。</div>
            </div>
          </div>

          {/* 流程编排 */}
          <div className="mt-6">
            <div className="text-sm font-medium text-gray-900 mb-2">业务流程编排</div>
            <div className="border rounded-md p-3">
              <div className="text-xs text-gray-500 mb-2">以事件为起点，合法编排能力与规则检查，结束于目标状态</div>
              <div className="text-xs text-gray-700">示例：RefundProcess：Start=Order.Paid → Step=IssueRefund(rule_check) → End=Order.Refunded</div>
            </div>
          </div>
        </Card>
      </div>
      )}
    </div>
  );
}
