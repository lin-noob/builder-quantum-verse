import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  User,
  Bot,
  Settings,
  Tags,
  Clock,
  Activity,
  Zap,
  Shield,
  CheckCircle,
  XCircle
} from "lucide-react";

type AgentStatus = "Draft" | "Active" | "Deprecated";

type ActionLevel = "full" | "suggest-only";

type DecisionMode = "rule-first" | "llm-first" | "hybrid";

type RiskPreference = "Low" | "Medium" | "High";

type AgentTag = string;

type ManagedRole = {
  id: string;
  name: string;
  status: AgentStatus;
};

type EventSubscription = {
  event: string;
  condition: string;
};

type CapabilityOption = {
  actionId: string;
  name: string;
  description: string;
};

type ConstraintOption = {
  id: string;
  name: string;
  type: "hard" | "soft";
  description: string;
};

type RuntimeConfig = {
  provider: string;
  model: string;
  temperature: number;
  maxTokens: number;
};

type Agent = {
  agentId: string;
  name: string;
  description: string;
  status: AgentStatus;
  tags: AgentTag[];
  owner: string;
  updatedAt: string;
  persona: {
    role: string;
    style: string;
    risk: RiskPreference;
    guidelines: string;
  };
  capabilities: Array<{ actionId: string; level: ActionLevel }>;
  constraints: Array<{ id: string; type: "hard" | "soft" }>;
  subscriptions: EventSubscription[];
  strategy: {
    decisionMode: DecisionMode;
    confidenceThreshold: number;
    fallbackPolicy: string;
  };
  executionPolicy: {
    autoExecute: boolean;
    needHumanApproval: string[];
    maxExecutionsPerCase: number;
  };
  managedRoles: ManagedRole[];
  runtime: RuntimeConfig;
  contextBindings?: string[];
};

const mockCapabilityOptions: CapabilityOption[] = [
  { actionId: "CheckOrderStatus", name: "CheckOrderStatus", description: "查询订单状态" },
  { actionId: "IssueRefund", name: "IssueRefund", description: "执行退款" },
  { actionId: "SendApologyEmail", name: "SendApologyEmail", description: "发送道歉邮件" },
  { actionId: "SendSMS", name: "SendSMS", description: "发送短信" },
  { actionId: "MakeDunningCall", name: "MakeDunningCall", description: "催款电话" },
  { actionId: "EscalateToHuman", name: "EscalateToHuman", description: "转人工" },
];

const mockConstraints: ConstraintOption[] = [
  { id: "c1", name: "HighPriorityTickets", type: "hard", description: "高优先级投诉必须转人工" },
  { id: "c2", name: "RefundLimit", type: "soft", description: "单笔退款不得超过 500 元" },
  { id: "c3", name: "NoThreatLanguage", type: "hard", description: "不得使用威胁语言" },
  { id: "c4", name: "WorkHoursOnly", type: "soft", description: "仅在工作时间拨打电话" },
];

const mockEvents: string[] = [
  "Ticket.Created",
  "Order.RefundRequested",
  "Order.DelayedDelivery",
  "Payment.OverdueDetected",
  "Ticket.Escalated",
];

const mockManagedRoles: ManagedRole[] = [
  { id: "m1", name: "Junior CS Assistant", status: "Active" },
  { id: "m2", name: "Compliance Monitor", status: "Draft" },
  { id: "m3", name: "Outbound Caller", status: "Deprecated" },
];

const mockAgents: Agent[] = [
  {
    agentId: "CustomerServiceAI",
    name: "客户服务智能体",
    description: "负责客户投诉的自动化响应与建议生成",
    status: "Active",
    tags: ["customer", "email", "refund"],
    owner: "Alex Chen",
    updatedAt: "2024-12-01T10:00:00Z",
    persona: {
      role: "Customer Service Assistant",
      style: "Friendly",
      risk: "Low",
      guidelines: "保持礼貌和同理心，避免承诺无法履行的补偿。",
    },
    capabilities: [
      { actionId: "CheckOrderStatus", level: "full" },
      { actionId: "SendApologyEmail", level: "full" },
      { actionId: "IssueRefund", level: "suggest-only" },
      { actionId: "EscalateToHuman", level: "full" },
    ],
    constraints: [
      { id: "c1", type: "hard" },
      { id: "c2", type: "soft" },
    ],
    subscriptions: [
      { event: "Ticket.Created", condition: "severity in ['high','medium']" },
    ],
    strategy: {
      decisionMode: "hybrid",
      confidenceThreshold: 0.72,
      fallbackPolicy: "escalate",
    },
    executionPolicy: {
      autoExecute: true,
      needHumanApproval: ["IssueRefund"],
      maxExecutionsPerCase: 3,
    },
    managedRoles: mockManagedRoles,
    runtime: {
      provider: "openai",
      model: "gpt-4-turbo",
      temperature: 0.2,
      maxTokens: 4096,
    },
    contextBindings: ["Customer_Complaint"]
  },
  {
    agentId: "CollectionAI",
    name: "智能催收专家",
    description: "负责对早期逾期账单进行提醒与谈判",
    status: "Draft",
    tags: ["dunning", "voice", "sms"],
    owner: "Sarah Li",
    updatedAt: "2024-11-20T12:30:00Z",
    persona: {
      role: "Debt Collection Agent",
      style: "Professional",
      risk: "Medium",
      guidelines: "遵守合规要求，语言坚定但不冒犯。",
    },
    capabilities: [
      { actionId: "MakeDunningCall", level: "full" },
      { actionId: "SendSMS", level: "full" },
      { actionId: "CheckOrderStatus", level: "suggest-only" },
    ],
    constraints: [
      { id: "c3", type: "hard" },
      { id: "c4", type: "soft" },
    ],
    subscriptions: [
      { event: "Payment.OverdueDetected", condition: "daysOverdue >= 7" },
    ],
    strategy: {
      decisionMode: "rule-first",
      confidenceThreshold: 0.6,
      fallbackPolicy: "notify",
    },
    executionPolicy: {
      autoExecute: false,
      needHumanApproval: ["MakeDunningCall"],
      maxExecutionsPerCase: 2,
    },
    managedRoles: [],
    runtime: {
      provider: "openai",
      model: "gpt-3.5-turbo",
      temperature: 0.0,
      maxTokens: 2048,
    },
    contextBindings: ["Order_Fulfillment"]
  },
];

const statusColor = (s: AgentStatus) =>
  s === "Active" ? "bg-green-50 text-green-700 border-green-200" :
  s === "Draft" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
  "bg-gray-100 text-gray-700 border-gray-200";

const AgentManagement: React.FC = () => {
  const [view, setView] = useState<"list" | "detail">("list");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AgentStatus>("all");
  const [ownerFilter, setOwnerFilter] = useState<"all" | string>("all");
  const [selected, setSelected] = useState<Agent | null>(null);

  const owners = useMemo(() => Array.from(new Set(mockAgents.map(a => a.owner))), []);
  const filteredAgents = useMemo(() => {
    return mockAgents.filter(a => {
      const mSearch = search.trim() === "" || a.name.includes(search) || a.agentId.includes(search);
      const mStatus = statusFilter === "all" || a.status === statusFilter;
      const mOwner = ownerFilter === "all" || a.owner === ownerFilter;
      return mSearch && mStatus && mOwner;
    });
  }, [search, statusFilter, ownerFilter]);

  const openDetail = (agent: Agent) => {
    setSelected(agent);
    setView("detail");
  };

  const backToList = () => {
    setView("list");
    setSelected(null);
  };

  const [formAgent, setFormAgent] = useState<Agent | null>(null);
  React.useEffect(() => {
    setFormAgent(selected ? JSON.parse(JSON.stringify(selected)) as Agent : null);
  }, [selected]);

  const updateForm = (patch: Partial<Agent>) => {
    setFormAgent(prev => prev ? { ...prev, ...patch } : prev);
  };

  const updatePersona = (patch: Partial<Agent["persona"]>) => {
    setFormAgent(prev => prev ? { ...prev, persona: { ...prev.persona, ...patch } } : prev);
  };

  const updateStrategy = (patch: Partial<Agent["strategy"]>) => {
    setFormAgent(prev => prev ? { ...prev, strategy: { ...prev.strategy, ...patch } } : prev);
  };

  const updateRuntime = (patch: Partial<RuntimeConfig>) => {
    setFormAgent(prev => prev ? { ...prev, runtime: { ...prev.runtime, ...patch } } : prev);
  };
  const toggleContextBinding = (ctx: string) => {
    setFormAgent(prev => {
      if (!prev) return prev;
      const list = prev.contextBindings || [];
      const exists = list.includes(ctx);
      const next = exists ? list.filter(x => x !== ctx) : [...list, ctx];
      return { ...prev, contextBindings: next };
    });
  };

  const toggleCapability = (actionId: string) => {
    setFormAgent(prev => {
      if (!prev) return prev;
      const exists = prev.capabilities.find(c => c.actionId === actionId);
      const nextCaps = exists
        ? prev.capabilities.filter(c => c.actionId !== actionId)
        : [...prev.capabilities, { actionId, level: "full" as ActionLevel }];
      return { ...prev, capabilities: nextCaps };
    });
  };

  const setCapabilityLevel = (actionId: string, level: ActionLevel) => {
    setFormAgent(prev => {
      if (!prev) return prev;
      const nextCaps = prev.capabilities.map(c => c.actionId === actionId ? { ...c, level } : c);
      return { ...prev, capabilities: nextCaps };
    });
  };

  const toggleConstraint = (id: string, type: "hard" | "soft") => {
    setFormAgent(prev => {
      if (!prev) return prev;
      const exists = prev.constraints.find(c => c.id === id);
      const next = exists
        ? prev.constraints.filter(c => c.id !== id)
        : [...prev.constraints, { id, type }];
      return { ...prev, constraints: next };
    });
  };

  const addSubscription = () => {
    setFormAgent(prev => {
      if (!prev) return prev;
      const next = [...prev.subscriptions, { event: mockEvents[0], condition: "" }];
      return { ...prev, subscriptions: next };
    });
  };

  const updateSubscription = (idx: number, patch: Partial<EventSubscription>) => {
    setFormAgent(prev => {
      if (!prev) return prev;
      const next = prev.subscriptions.map((s, i) => i === idx ? { ...s, ...patch } : s);
      return { ...prev, subscriptions: next };
    });
  };

  const removeSubscription = (idx: number) => {
    setFormAgent(prev => {
      if (!prev) return prev;
      const next = prev.subscriptions.filter((_, i) => i !== idx);
      return { ...prev, subscriptions: next };
    });
  };

  const toggleNeedApproval = (actionId: string) => {
    setFormAgent(prev => {
      if (!prev) return prev;
      const exists = prev.executionPolicy.needHumanApproval.includes(actionId);
      const next = exists
        ? prev.executionPolicy.needHumanApproval.filter(a => a !== actionId)
        : [...prev.executionPolicy.needHumanApproval, actionId];
      return { ...prev, executionPolicy: { ...prev.executionPolicy, needHumanApproval: next } };
    });
  };

  const listView = (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-6 py-4 bg-white border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-6 h-6 text-blue-600" />
          <h1 className="text-lg font-semibold">Agent 管理</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><Plus className="w-4 h-4 mr-2" />新建 Agent（mock）</Button>
        </div>
      </div>
      <div className="p-6 flex gap-4 items-center">
        <div className="flex items-center gap-2 w-full md:w-[360px]">
          <Search className="w-4 h-4 text-slate-500" />
          <Input placeholder="搜索 Agent 名称或 ID" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
          <SelectTrigger className="w-[160px]">
            <div className="flex items-center gap-2 text-slate-600">
              <Filter className="w-3.5 h-3.5" />
              <SelectValue placeholder="状态" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">所有状态</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Deprecated">Deprecated</SelectItem>
          </SelectContent>
        </Select>
        <Select value={ownerFilter} onValueChange={(v) => setOwnerFilter(v)}>
          <SelectTrigger className="w-[180px]">
            <div className="flex items-center gap-2 text-slate-600">
              <User className="w-3.5 h-3.5" />
              <SelectValue placeholder="负责人" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">所有负责人</SelectItem>
            {owners.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => { setSearch(""); setStatusFilter("all"); setOwnerFilter("all"); }}>
          重置
        </Button>
      </div>
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredAgents.map(a => (
            <Card key={a.agentId} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-base">{a.name}</CardTitle>
                  <CardDescription className="text-xs">{a.description}</CardDescription>
                </div>
                <Badge className={`text-xs ${statusColor(a.status)} border`}>{a.status}</Badge>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                  <Tags className="w-4 h-4" />
                  <div className="flex gap-1 flex-wrap">
                    {a.tags.map(t => <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>)}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <User className="w-4 h-4" />
                  <span>{a.owner}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                  <Clock className="w-4 h-4" />
                  <span>更新于 {new Date(a.updatedAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button size="sm" variant="outline" onClick={() => openDetail(a)}>
                    <Edit className="w-4 h-4 mr-2" />详情
                  </Button>
                  <Button size="sm" variant="outline">
                    <Trash2 className="w-4 h-4 mr-2" />删除（mock）
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const detailView = formAgent ? (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-6 py-3 bg-white border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-6 h-6 text-blue-600" />
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">{formAgent.name}</h1>
            <Badge className={`text-xs ${statusColor(formAgent.status)} border`}>{formAgent.status}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={backToList}>返回列表</Button>
          <Button className="bg-blue-600 hover:bg-blue-700">保存（mock）</Button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 p-6 h-full overflow-auto">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>基础信息</CardTitle>
              <CardDescription>Agent 基本元数据</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Agent ID</Label>
                <Input value={formAgent.agentId} readOnly />
              </div>
              <div className="space-y-2">
                <Label>名称</Label>
                <Input value={formAgent.name} onChange={(e) => updateForm({ name: e.target.value })} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>描述</Label>
                <Textarea value={formAgent.description} onChange={(e) => updateForm({ description: e.target.value })} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>状态</Label>
                <Select value={formAgent.status} onValueChange={(v) => updateForm({ status: v as AgentStatus })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Deprecated">Deprecated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>标签（逗号分隔）</Label>
                <Input value={formAgent.tags.join(", ")} onChange={(e) => updateForm({ tags: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Persona</CardTitle>
              <CardDescription>角色与行为定义</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>角色描述</Label>
                <Input value={formAgent.persona.role} onChange={(e) => updatePersona({ role: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>行为风格</Label>
                <Select value={formAgent.persona.style} onValueChange={(v) => updatePersona({ style: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Friendly">Friendly</SelectItem>
                    <SelectItem value="Professional">Professional</SelectItem>
                    <SelectItem value="Strict">Strict</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>风险偏好</Label>
                <Select value={formAgent.persona.risk} onValueChange={(v) => updatePersona({ risk: v as RiskPreference })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>行为准则</Label>
                <Textarea rows={4} value={formAgent.persona.guidelines} onChange={(e) => updatePersona({ guidelines: e.target.value })} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Capabilities</CardTitle>
              <CardDescription>原子动作授权与级别</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-2">
                {mockCapabilityOptions.map(opt => {
                  const checked = !!formAgent.capabilities.find(c => c.actionId === opt.actionId);
                  const level = formAgent.capabilities.find(c => c.actionId === opt.actionId)?.level || "full";
                  return (
                    <div key={opt.actionId} className="flex items-center justify-between border rounded p-2">
                      <div className="flex items-center gap-3">
                        <Switch checked={checked} onCheckedChange={() => toggleCapability(opt.actionId)} />
                        <div>
                          <div className="text-sm font-medium">{opt.name}</div>
                          <div className="text-xs text-slate-500">{opt.description}</div>
                        </div>
                      </div>
                      <Select value={level} onValueChange={(v) => setCapabilityLevel(opt.actionId, v as ActionLevel)}>
                        <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full">full</SelectItem>
                          <SelectItem value="suggest-only">suggest-only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Context Bindings</CardTitle>
              <CardDescription>绑定业务模型语境（Domain Slice）</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {["Customer_Complaint","Order_Fulfillment","ServiceDesk"].map(ctx => {
                  const enabled = (formAgent.contextBindings || []).includes(ctx);
                  return (
                    <button
                      key={ctx}
                      className={`text-xs px-2 py-1 rounded border ${enabled ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-gray-50 border-gray-200 text-gray-700"}`}
                      onClick={() => toggleContextBinding(ctx)}
                    >
                      {ctx}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Constraints</CardTitle>
              <CardDescription>规则约束与类型</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {mockConstraints.map(c => {
                  const enabled = !!formAgent.constraints.find(x => x.id === c.id);
                  return (
                    <button
                      key={c.id}
                      className={`text-xs px-2 py-1 rounded border ${enabled ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-gray-50 border-gray-200 text-gray-700"}`}
                      onClick={() => toggleConstraint(c.id, c.type)}
                    >
                      {c.type === "hard" ? <Shield className="inline w-3 h-3 mr-1" /> : <Settings className="inline w-3 h-3 mr-1" />}
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Event Subscriptions</CardTitle>
              <CardDescription>事件监听与触发条件</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={addSubscription}><Plus className="w-4 h-4 mr-2" />添加</Button>
              </div>
              <div className="space-y-2">
                {formAgent.subscriptions.map((s, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                    <Select value={s.event} onValueChange={(v) => updateSubscription(idx, { event: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {mockEvents.map(ev => <SelectItem key={ev} value={ev}>{ev}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Input placeholder="触发条件" value={s.condition} onChange={(e) => updateSubscription(idx, { condition: e.target.value })} />
                    <Button variant="outline" onClick={() => removeSubscription(idx)}><XCircle className="w-4 h-4 mr-2" />移除</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Decision Strategy</CardTitle>
              <CardDescription>决策模式与阈值</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>决策模式</Label>
                <Select value={formAgent.strategy.decisionMode} onValueChange={(v) => updateStrategy({ decisionMode: v as DecisionMode })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rule-first">rule-first</SelectItem>
                    <SelectItem value="llm-first">llm-first</SelectItem>
                    <SelectItem value="hybrid">hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>置信度阈值</Label>
                <Slider value={[Math.round(formAgent.strategy.confidenceThreshold * 100)]} onValueChange={(v) => updateStrategy({ confidenceThreshold: (v[0] || 0) / 100 })} />
                <div className="text-xs text-slate-500">{Math.round(formAgent.strategy.confidenceThreshold * 100)}%</div>
              </div>
              <div className="space-y-2">
                <Label>失败兜底策略</Label>
                <Select value={formAgent.strategy.fallbackPolicy} onValueChange={(v) => updateStrategy({ fallbackPolicy: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="escalate">escalate</SelectItem>
                    <SelectItem value="retry">retry</SelectItem>
                    <SelectItem value="notify">notify</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Execution Policy</CardTitle>
              <CardDescription>执行策略与人工审批</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Switch checked={formAgent.executionPolicy.autoExecute} onCheckedChange={(checked) => updateForm({ executionPolicy: { ...formAgent.executionPolicy, autoExecute: checked } })} />
                <span className="text-sm">自动执行</span>
              </div>
              <div className="space-y-2">
                <Label>需要人工审批的 Action</Label>
                <div className="flex flex-wrap gap-2">
                  {mockCapabilityOptions.map(opt => {
                    const enabled = formAgent.executionPolicy.needHumanApproval.includes(opt.actionId);
                    return (
                      <button
                        key={opt.actionId}
                        className={`text-xs px-2 py-1 rounded border ${enabled ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-gray-50 border-gray-200 text-gray-700"}`}
                        onClick={() => toggleNeedApproval(opt.actionId)}
                      >
                        {opt.name}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-2">
                <Label>单 case 最大执行次数</Label>
                <Input
                  type="number"
                  value={formAgent.executionPolicy.maxExecutionsPerCase}
                  onChange={(e) => updateForm({ executionPolicy: { ...formAgent.executionPolicy, maxExecutionsPerCase: Number(e.target.value || 0) } })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Managed Roles</CardTitle>
              <CardDescription>下属 Agent 展示</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {(formAgent.managedRoles || []).map(m => (
                  <Card key={m.id} className="border-dashed">
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm">{m.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-2">
                      <Badge className={`text-xs ${statusColor(m.status)} border`}>{m.status}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Runtime Configuration</CardTitle>
              <CardDescription>模型与运行参数</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>LLM Provider</Label>
                <Select value={formAgent.runtime.provider} onValueChange={(v) => updateRuntime({ provider: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">openai</SelectItem>
                    <SelectItem value="azure-openai">azure-openai</SelectItem>
                    <SelectItem value="ollama">ollama</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Model 名称</Label>
                <Input value={formAgent.runtime.model} onChange={(e) => updateRuntime({ model: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Temperature</Label>
                <Slider value={[Math.round(formAgent.runtime.temperature * 100)]} onValueChange={(v) => updateRuntime({ temperature: (v[0] || 0) / 100 })} />
                <div className="text-xs text-slate-500">{formAgent.runtime.temperature.toFixed(2)}</div>
              </div>
              <div className="space-y-2">
                <Label>Max Tokens</Label>
                <Input type="number" value={formAgent.runtime.maxTokens} onChange={(e) => updateRuntime({ maxTokens: Number(e.target.value || 0) })} />
              </div>
            </CardContent>
          </Card>

          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>JSON Preview</CardTitle>
              <CardDescription>只读配置预览</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] w-full">
                <pre className="text-xs font-mono p-3 bg-slate-900 text-green-400 rounded">
{JSON.stringify(formAgent, null, 2)}
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="flex-1 overflow-hidden">
      {view === "list" ? listView : detailView}
    </div>
  );
};

export default AgentManagement;
