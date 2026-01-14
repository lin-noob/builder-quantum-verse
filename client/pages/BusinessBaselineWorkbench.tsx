import React, { useState, useMemo, useEffect } from "react";
import { 
  Scale, 
  ShieldAlert, 
  AlertTriangle, 
  FileText, 
  CheckCircle2, 
  Ban, 
  Activity, 
  Box, 
  GitMerge, 
  Search,
  Plus,
  ArrowRight,
  Info,
  Zap,
  Pencil,
  Trash2,
  Edit,
  Play,
  RotateCcw,
  Network,
  Users,
  Workflow
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// --- Types ---

type RuleType = "Blocking" | "Warning" | "Audit";
type ContextType = "Entity" | "Capability" | "LifecycleState";

interface RuleCondition {
  id: string;
  field: string;
  operator: ">" | "<" | "==" | "!=" | ">=" | "<=" | "contains";
  value: string;
  logicalOp?: "AND" | "OR";
}

interface BusinessRule {
  id: string;
  code: string;
  name: string; // "R-001: XXX"
  description: string; // Natural language semantic
  type: RuleType;
  
  // Context Attachment
  contextType: ContextType;
  contextId: string;
  contextName: string;

  // System Inference (Read-only)
  scope: string;
  violationConsequence: string;
  impactsAgent: boolean;
  
  // Structured Logic
  conditions: RuleCondition[];

  // Stats
  stats: {
    triggerCount: number;
    falsePositiveRate: number; // %
    conflictCount: number;
  };
  
  isActive: boolean;
}

// --- Mock Data ---

const MOCK_RULES: BusinessRule[] = [
  {
    id: "r1",
    code: "R-001",
    name: "高风险账户冻结",
    description: "当账户被标记为高风险时，不允许进行任何出金操作",
    type: "Blocking",
    contextType: "Capability",
    contextId: "c_withdraw",
    contextName: "资金转出 (Withdraw)",
    scope: "交易执行前置检查",
    violationConsequence: "交易被直接拒绝",
    impactsAgent: true,
    conditions: [
        { id: "c1", field: "Account.RiskLevel", operator: "==", value: "High", logicalOp: "AND" },
        { id: "c2", field: "Transaction.Type", operator: "==", value: "Withdraw" }
    ],
    stats: { triggerCount: 1245, falsePositiveRate: 0.5, conflictCount: 0 },
    isActive: true,
  },
  {
    id: "r2",
    code: "R-002",
    name: "大额交易预警",
    description: "当单笔交易金额超过 50,000 元时，需要触发风控预警并通知相关人员",
    type: "Warning",
    contextType: "Capability",
    contextId: "c_transfer",
    contextName: "转账 (Transfer)",
    scope: "交易执行中",
    violationConsequence: "生成预警工单，不阻断交易",
    impactsAgent: false,
    conditions: [
        { id: "c1", field: "Transaction.Amount", operator: ">", value: "50000" }
    ],
    stats: { triggerCount: 89, falsePositiveRate: 1.2, conflictCount: 2 },
    isActive: true,
  },
  {
    id: "r3",
    code: "R-003",
    name: "敏感数据访问审计",
    description: "当访问客户身份证号等敏感信息时，需要记录完整的访问日志",
    type: "Audit",
    contextType: "Entity",
    contextId: "e_customer",
    contextName: "客户 (Customer)",
    scope: "数据读取操作",
    violationConsequence: "缺失审计日志将导致合规违规",
    impactsAgent: false,
    conditions: [
        { id: "c1", field: "Field.IsSensitive", operator: "==", value: "true" }
    ],
    stats: { triggerCount: 4502, falsePositiveRate: 0, conflictCount: 0 },
    isActive: true,
  },
];

const MOCK_CONTEXTS = [
  { type: "Entity", id: "e_customer", name: "客户 (Customer)", hasRules: true, risk: "High" },
  { type: "Entity", id: "e_order", name: "订单 (Order)", hasRules: false, risk: "Medium" },
  { type: "Capability", id: "c_withdraw", name: "资金转出 (Withdraw)", hasRules: true, risk: "High" },
  { type: "Capability", id: "c_transfer", name: "转账 (Transfer)", hasRules: true, risk: "Medium" },
  { type: "LifecycleState", id: "s_frozen", name: "冻结 (Frozen)", hasRules: false, risk: "High" },
];

// --- Wizard Components ---

const WizardStep1 = ({ data, updateData }: { data: Partial<BusinessRule>, updateData: (d: Partial<BusinessRule>) => void }) => (
  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Step 1: 选择规则附着上下文</h3>
      <p className="text-sm text-gray-500">规则必须附着在特定的业务对象、能力或状态上。</p>
    </div>

    <Card>
      <CardContent className="pt-6">
        <Select 
          value={data.contextId} 
          onValueChange={(val) => {
            const context = MOCK_CONTEXTS.find(c => c.id === val);
            if (context) {
              updateData({ 
                contextId: val, 
                contextName: context.name,
                contextType: context.type as ContextType 
              });
            }
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="选择对象、能力或状态..." />
          </SelectTrigger>
          <SelectContent>
            {MOCK_CONTEXTS.map(ctx => (
              <SelectItem key={ctx.id} value={ctx.id}>
                <div className="flex items-center gap-2">
                  {ctx.type === "Entity" && <Box className="w-4 h-4 text-slate-400" />}
                  {ctx.type === "Capability" && <Activity className="w-4 h-4 text-slate-400" />}
                  {ctx.type === "LifecycleState" && <GitMerge className="w-4 h-4 text-slate-400" />}
                  <span>{ctx.name}</span>
                  {ctx.risk === "High" && <Badge variant="destructive" className="ml-auto text-[10px]">High Risk</Badge>}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  </div>
);

const WizardStep2 = ({ data, updateData }: { data: Partial<BusinessRule>, updateData: (d: Partial<BusinessRule>) => void }) => {
    
    // Auto-extract logic simulation
    useEffect(() => {
        if (data.description && (!data.conditions || data.conditions.length === 0)) {
            // Simple heuristic to mock extraction
            if (data.description.includes("50,000") || data.description.includes("50000")) {
                updateData({
                    conditions: [
                        { id: "c1", field: "Transaction.Amount", operator: ">", value: "50000" }
                    ]
                });
            } else if (data.description.includes("高风险")) {
                updateData({
                    conditions: [
                        { id: "c1", field: "Account.RiskLevel", operator: "==", value: "High" }
                    ]
                });
            }
        }
    }, [data.description]);

    const updateCondition = (index: number, field: keyof RuleCondition, value: string) => {
        const newConditions = [...(data.conditions || [])];
        if (newConditions[index]) {
            (newConditions[index] as any)[field] = value;
            updateData({ conditions: newConditions });
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
            <h3 className="text-lg font-medium">Step 2: 定义规则语义与逻辑</h3>
            <p className="text-sm text-gray-500">定义规则类型，并配置结构化的判断逻辑。</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div 
                    onClick={() => updateData({ type: "Blocking" })}
                    className={`cursor-pointer border rounded-lg p-4 flex flex-col items-center gap-2 transition-all ${
                    data.type === "Blocking" ? "bg-red-50 border-red-200 ring-1 ring-red-200" : "hover:bg-slate-50"
                    }`}
                >
                    <Ban className={`w-6 h-6 ${data.type === "Blocking" ? "text-red-600" : "text-slate-400"}`} />
                    <span className={`font-medium text-sm ${data.type === "Blocking" ? "text-red-900" : "text-slate-600"}`}>⛔ 禁止 (Blocking)</span>
                </div>
                <div 
                    onClick={() => updateData({ type: "Warning" })}
                    className={`cursor-pointer border rounded-lg p-4 flex flex-col items-center gap-2 transition-all ${
                    data.type === "Warning" ? "bg-amber-50 border-amber-200 ring-1 ring-amber-200" : "hover:bg-slate-50"
                    }`}
                >
                    <AlertTriangle className={`w-6 h-6 ${data.type === "Warning" ? "text-amber-600" : "text-slate-400"}`} />
                    <span className={`font-medium text-sm ${data.type === "Warning" ? "text-amber-900" : "text-slate-600"}`}>⚠️ 预警 (Warning)</span>
                </div>
                <div 
                    onClick={() => updateData({ type: "Audit" })}
                    className={`cursor-pointer border rounded-lg p-4 flex flex-col items-center gap-2 transition-all ${
                    data.type === "Audit" ? "bg-blue-50 border-blue-200 ring-1 ring-blue-200" : "hover:bg-slate-50"
                    }`}
                >
                    <FileText className={`w-6 h-6 ${data.type === "Audit" ? "text-blue-600" : "text-slate-400"}`} />
                    <span className={`font-medium text-sm ${data.type === "Audit" ? "text-blue-900" : "text-slate-600"}`}>📋 审计 (Audit)</span>
                </div>
            </div>

            <div className="space-y-2">
                <Label>自然语言描述</Label>
                <Textarea 
                    value={data.description || ""}
                    onChange={(e) => updateData({ description: e.target.value })}
                    placeholder="例如：当单笔交易超过 50,000 元时，不允许..." 
                    className="min-h-[80px] text-base"
                />
            </div>

            {/* Logic Extraction Preview */}
            <div className="border rounded-lg bg-slate-50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2 text-indigo-600">
                        <Zap className="h-4 w-4 fill-indigo-100" /> 
                        逻辑提取预览 (Logic Extraction)
                    </Label>
                    <Badge variant="outline" className="text-[10px] bg-white">Auto-Generated</Badge>
                </div>
                
                <div className="bg-white border rounded-md p-3 space-y-2">
                    {data.conditions && data.conditions.length > 0 ? (
                        data.conditions.map((cond, index) => (
                            <div key={cond.id} className="flex items-center gap-2">
                                {index > 0 && <span className="text-xs font-bold text-slate-400 uppercase w-8 text-center">{cond.logicalOp}</span>}
                                <div className="flex-1 flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-100">
                                    <span className="text-xs font-mono text-blue-600 bg-blue-50 px-1 rounded border border-blue-100">[{cond.field}]</span>
                                    <Select 
                                        value={cond.operator} 
                                        onValueChange={(val) => updateCondition(index, "operator", val)}
                                    >
                                        <SelectTrigger className="h-6 w-20 text-xs border-none bg-transparent shadow-none p-0 gap-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value=">">&gt;</SelectItem>
                                            <SelectItem value="<">&lt;</SelectItem>
                                            <SelectItem value="==">==</SelectItem>
                                            <SelectItem value="!=">!=</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Input 
                                        className="h-6 w-32 text-xs font-mono bg-white border-slate-200"
                                        value={cond.value}
                                        onChange={(e) => updateCondition(index, "value", e.target.value)}
                                    />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-xs text-slate-400 py-2">
                            正在分析语义... (请输入包含数字或关键字的描述)
                        </div>
                    )}
                    <Button variant="ghost" size="sm" className="w-full text-xs text-slate-400 h-6 hover:text-indigo-600" onClick={() => {
                        updateData({ conditions: [...(data.conditions || []), { id: `c_${Date.now()}`, field: "New.Field", operator: "==", value: "Value", logicalOp: "AND" }] })
                    }}>
                        <Plus className="h-3 w-3 mr-1" /> 添加条件
                    </Button>
                </div>
            </div>
        </div>
    );
};

const WizardStep3 = ({ data }: { data: Partial<BusinessRule> }) => {
    const [simResult, setSimResult] = useState<"Pending" | "Pass" | "Block">("Pending");
    const [simInputs, setSimInputs] = useState<Record<string, string>>({});

    // Initialize mock inputs based on conditions
    useEffect(() => {
        const initialInputs: Record<string, string> = {};
        data.conditions?.forEach(c => {
            initialInputs[c.field] = "";
        });
        setSimInputs(initialInputs);
    }, [data.conditions]);

    const runSimulation = () => {
        setSimResult("Pending");
        setTimeout(() => {
            // Simple logic check
            let isTriggered = true;
            data.conditions?.forEach(c => {
                const inputVal = simInputs[c.field];
                const ruleVal = c.value;
                if (!inputVal) return; // Skip if empty

                if (c.operator === ">") {
                    if (Number(inputVal) <= Number(ruleVal)) isTriggered = false;
                } else if (c.operator === "==") {
                    if (inputVal !== ruleVal) isTriggered = false;
                }
                // ... other operators omitted for brevity
            });

            if (isTriggered) {
                setSimResult(data.type === "Blocking" ? "Block" : "Pass"); // Actually "Block" means rule triggered and action taken
            } else {
                setSimResult("Pass"); // Rule not triggered
            }
        }, 600);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
                <h3 className="text-lg font-medium">Step 3: 仿真测试与确认</h3>
                <p className="text-sm text-gray-500">在生效前，使用模拟数据测试规则触发逻辑。</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* Simulation Sandbox */}
                <Card className="border-indigo-100 shadow-sm">
                    <CardHeader className="pb-2 bg-indigo-50/30 border-b border-indigo-100">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-indigo-700">
                            <Play className="h-4 w-4" /> 规则沙箱测试 (Sandbox)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                        <div className="space-y-3">
                            {data.conditions?.map(c => (
                                <div key={c.id} className="grid gap-1">
                                    <Label className="text-xs font-mono text-slate-500">{c.field}</Label>
                                    <Input 
                                        className="h-8 text-sm" 
                                        placeholder="输入测试值..."
                                        value={simInputs[c.field] || ""}
                                        onChange={(e) => setSimInputs({...simInputs, [c.field]: e.target.value})}
                                    />
                                </div>
                            ))}
                            {(!data.conditions || data.conditions.length === 0) && (
                                <div className="text-xs text-slate-400 italic">无条件参数可测试</div>
                            )}
                        </div>
                        
                        <div className="pt-2 flex items-center justify-between">
                             <Button size="sm" onClick={runSimulation} className="bg-indigo-600 hover:bg-indigo-700 h-8">
                                运行测试
                             </Button>
                             <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500">结果:</span>
                                {simResult === "Pending" && <Badge variant="outline" className="text-slate-400">待运行</Badge>}
                                {simResult === "Pass" && <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Pass (未触发)</Badge>}
                                {simResult === "Block" && <Badge variant="destructive">Triggered ({data.type})</Badge>}
                             </div>
                        </div>
                    </CardContent>
                </Card>

                {/* System Deduction */}
                <Card className="bg-slate-50 border-dashed h-full">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2 text-slate-600">
                            <Zap className="w-4 h-4" /> 系统推导详情
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between border-b border-slate-200 pb-2">
                                <span className="text-slate-500">作用范围</span>
                                <span className="font-medium text-slate-900">
                                    {data.type === "Blocking" ? "交易提交前拦截" : "交易提交后异步处理"}
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-slate-200 pb-2">
                                <span className="text-slate-500">违规后果</span>
                                <span className="font-medium text-slate-900">
                                    {data.type === "Blocking" ? "抛出 BlockingException" : "记录 WarningLog 并继续"}
                                </span>
                            </div>
                             <div className="mt-4 bg-slate-900 text-green-400 p-3 rounded font-mono text-xs overflow-x-auto">
                                <div>// Pseudo Code Preview</div>
                                <div>IF ({data.conditions?.map(c => `${c.field} ${c.operator} ${c.value}`).join(' AND ')}) {'{'}</div>
                                <div className="pl-4">raise {data.type}Event(Context);</div>
                                <div>{'}'}</div>
                             </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

// --- Main Page Component ---

export default function BusinessBaselineWorkbench() {
  const [rules, setRules] = useState<BusinessRule[]>(MOCK_RULES);
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(MOCK_RULES[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Wizard State
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [formData, setFormData] = useState<Partial<BusinessRule>>({});

  const selectedRule = useMemo(() => 
    rules.find(r => r.id === selectedRuleId), 
    [rules, selectedRuleId]
  );

  const groupedRules = useMemo(() => {
    const filtered = rules.filter(r => 
      r.description.includes(searchQuery) || 
      r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.contextName.includes(searchQuery)
    );
    return {
      Blocking: filtered.filter(r => r.type === "Blocking"),
      Warning: filtered.filter(r => r.type === "Warning"),
      Audit: filtered.filter(r => r.type === "Audit"),
    };
  }, [rules, searchQuery]);

  const handleCreateStart = () => {
    setFormData({
      type: "Blocking",
      description: "",
      contextId: "",
      isActive: true,
      conditions: [],
      stats: { triggerCount: 0, falsePositiveRate: 0, conflictCount: 0 }
    });
    setWizardStep(1);
    setIsEditing(false);
    setIsWizardOpen(true);
    setSelectedRuleId(null);
  };

  const handleEditStart = () => {
    if (!selectedRule) return;
    setFormData({ ...selectedRule });
    setWizardStep(1);
    setIsEditing(true);
    setIsWizardOpen(true);
  };

  const handleDeleteRule = () => {
    if (!selectedRuleId) return;
    setRules(rules.filter(r => r.id !== selectedRuleId));
    setSelectedRuleId(null);
  };

  const handleCreateFinish = () => {
    const newRule: BusinessRule = {
      id: isEditing && selectedRuleId ? selectedRuleId : `r${Date.now()}`,
      code: isEditing && selectedRule ? selectedRule.code : `R-${String(rules.length + 1).padStart(3, '0')}`,
      name: isEditing && selectedRule ? selectedRule.name : `新建规则 ${rules.length + 1}`,
      description: formData.description || "",
      type: formData.type || "Blocking",
      contextType: formData.contextType || "Entity",
      contextId: formData.contextId || "",
      contextName: formData.contextName || "",
      scope: "系统自动推导范围...",
      violationConsequence: formData.type === "Blocking" ? "操作被拒绝" : (formData.type === "Warning" ? "生成预警" : "记录日志"),
      impactsAgent: formData.type === "Blocking",
      conditions: formData.conditions || [],
      stats: formData.stats || { triggerCount: 0, falsePositiveRate: 0, conflictCount: 0 },
      isActive: true,
    };

    if (isEditing) {
      setRules(rules.map(r => r.id === newRule.id ? newRule : r));
    } else {
      setRules([newRule, ...rules]);
      setSelectedRuleId(newRule.id);
    }

    setIsWizardOpen(false);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Global Header */}
      <header className="h-14 shrink-0 bg-white border-b flex items-center px-4 justify-between z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-slate-500">
            <span className="font-semibold text-lg text-slate-800 flex items-center gap-2">
               <Scale className="h-5 w-5 text-indigo-600" />
               业务规则工作台
            </span>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-medium">合规与风控基线</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="搜索规则..." 
              className="pl-8 h-8 bg-slate-50 border-slate-200" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            variant="default" 
            size="sm" 
            className="bg-indigo-600 hover:bg-indigo-700 shadow-sm"
            onClick={handleCreateStart}
            disabled={isWizardOpen}
          >
            <Plus className="h-4 w-4 mr-2" />
            新建规则
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar: Rule List */}
        <aside className="w-64 border-r bg-slate-50 flex flex-col shrink-0">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-6">
              {[
                { type: "Blocking", label: "禁止规则 (Blocking)", list: groupedRules.Blocking, color: "text-red-700", bg: "bg-red-50" },
                { type: "Warning", label: "预警规则 (Warning)", list: groupedRules.Warning, color: "text-amber-700", bg: "bg-amber-50" },
                { type: "Audit", label: "审计规则 (Audit)", list: groupedRules.Audit, color: "text-blue-700", bg: "bg-blue-50" },
              ].map(group => (
                <div key={group.type}>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3 px-2 flex items-center justify-between">
                    {group.label}
                    <Badge variant="secondary" className="text-[10px] h-4 px-1 min-w-[1.5rem] justify-center">{group.list.length}</Badge>
                  </h3>
                  <div className="space-y-1">
                    {group.list.map(rule => (
                      <button
                        key={rule.id}
                        onClick={() => {
                          setSelectedRuleId(rule.id);
                          setIsWizardOpen(false);
                        }}
                        className={`w-full text-left px-3 py-3 rounded-md text-sm flex items-start gap-3 transition-colors ${
                          selectedRuleId === rule.id && !isWizardOpen
                            ? "bg-white shadow-sm ring-1 ring-gray-200 text-primary font-medium" 
                            : "hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        <div className={`p-1 rounded shrink-0 mt-0.5 ${group.bg}`}>
                          {group.type === "Blocking" && <Ban className={`h-3 w-3 ${group.color}`} />}
                          {group.type === "Warning" && <AlertTriangle className={`h-3 w-3 ${group.color}`} />}
                          {group.type === "Audit" && <FileText className={`h-3 w-3 ${group.color}`} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="whitespace-normal break-words leading-relaxed">{rule.description}</div>
                          <div className="flex items-center gap-2 text-xs text-gray-400 font-mono mt-1">
                            <span>{rule.code}</span>
                            <span>·</span>
                            <span className="truncate max-w-[80px]">{rule.contextName}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                    {group.list.length === 0 && (
                      <div className="px-3 py-2 text-xs text-gray-400 italic">暂无规则</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </aside>

        {/* Right Content */}
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-white">
          {isWizardOpen ? (
            <div className="flex-1 p-8 overflow-y-auto">
              <div className="max-w-3xl mx-auto space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900 mb-2">{isEditing ? "编辑规则" : "新建规则"}</h2>
                  <p className="text-slate-500">通过简单的三步向导，定义业务底线与约束条件。</p>
                </div>

                <div className="flex items-center gap-4 mb-8">
                  {[1, 2, 3].map((step) => (
                    <div key={step} className="flex items-center gap-2">
                      <div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                          wizardStep === step 
                            ? "bg-primary text-primary-foreground" 
                            : wizardStep > step 
                              ? "bg-primary/20 text-primary" 
                              : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {step}
                      </div>
                      <span className={`text-sm ${wizardStep === step ? "font-medium text-gray-900" : "text-gray-500"}`}>
                        {step === 1 ? "附着对象" : step === 2 ? "定义语义" : "仿真确认"}
                      </span>
                      {step < 3 && <div className="w-12 h-[1px] bg-gray-200 mx-2" />}
                    </div>
                  ))}
                </div>

                <div className="min-h-[300px]">
                  {wizardStep === 1 && <WizardStep1 data={formData} updateData={(d) => setFormData(prev => ({ ...prev, ...d }))} />}
                  {wizardStep === 2 && <WizardStep2 data={formData} updateData={(d) => setFormData(prev => ({ ...prev, ...d }))} />}
                  {wizardStep === 3 && <WizardStep3 data={formData} />}
                </div>

                <div className="flex justify-between pt-8 border-t">
                  <Button variant="outline" onClick={() => {
                    if (wizardStep > 1) setWizardStep(prev => prev - 1);
                    else setIsWizardOpen(false);
                  }}>
                    {wizardStep === 1 ? "取消" : "上一步"}
                  </Button>
                  <Button onClick={() => {
                    if (wizardStep < 3) setWizardStep(prev => prev + 1);
                    else handleCreateFinish();
                  }}>
                    {wizardStep === 3 ? "完成" : "下一步"}
                    {wizardStep < 3 && <ArrowRight className="h-4 w-4 ml-2" />}
                  </Button>
                </div>
              </div>
            </div>
          ) : selectedRule ? (
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
               {/* Detail Header */}
               <div className="h-16 border-b bg-white flex items-center justify-between px-6 shrink-0">
                 <div className="flex items-center gap-4">
                   <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                     <Scale className="h-6 w-6 text-indigo-600" />
                   </div>
                   <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-slate-900">{selectedRule.code}</h2>
                        <Badge className={`${
                          selectedRule.type === "Blocking" ? "bg-red-100 text-red-700 hover:bg-red-100" :
                          selectedRule.type === "Warning" ? "bg-amber-100 text-amber-700 hover:bg-amber-100" :
                          "bg-blue-100 text-blue-700 hover:bg-blue-100"
                        }`}>
                          {selectedRule.type}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-slate-500 ml-2">
                           <div className={`w-2 h-2 rounded-full ${selectedRule.isActive ? "bg-green-500" : "bg-slate-300"}`} />
                           <span>{selectedRule.isActive ? "Active" : "Inactive"}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 truncate max-w-[500px]">{selectedRule.description}</p>
                   </div>
                 </div>
                 <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleEditStart}>
                      <Pencil className="w-4 h-4 mr-2" />
                      编辑
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="w-4 h-4 mr-2" />
                          删除
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>确认删除规则？</AlertDialogTitle>
                          <AlertDialogDescription>
                            即将删除规则“{selectedRule.code}”。此操作不可恢复，可能导致业务约束失效。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteRule} className="bg-red-600 hover:bg-red-700">确认删除</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                 </div>
               </div>

               <ScrollArea className="flex-1">
                 <div className="p-8 max-w-6xl mx-auto space-y-6">
                    {/* Execution Path Preview */}
                    <div className="flex items-center justify-center py-6 bg-white border border-slate-200 rounded-lg shadow-sm">
                         <div className="flex items-center gap-4">
                             <div className="flex flex-col items-center gap-2">
                                 <div className="h-8 px-3 rounded bg-slate-100 text-slate-500 text-xs flex items-center font-mono">
                                     State: Pending
                                 </div>
                             </div>
                             <ArrowRight className="h-4 w-4 text-slate-300" />
                             <div className="flex flex-col items-center gap-2">
                                 <div className="h-10 px-4 rounded border border-indigo-200 bg-indigo-50 text-indigo-700 text-sm font-medium flex items-center shadow-sm">
                                     <Activity className="h-4 w-4 mr-2" />
                                     {selectedRule.contextName}
                                 </div>
                             </div>
                             <ArrowRight className="h-4 w-4 text-slate-300" />
                             <div className="flex flex-col items-center gap-2 relative">
                                 <div className={`h-12 w-12 rounded-full border-4 flex items-center justify-center z-10 bg-white ${
                                     selectedRule.type === 'Blocking' ? 'border-red-500 text-red-600' : 'border-amber-500 text-amber-600'
                                 }`}>
                                     <Scale className="h-5 w-5" />
                                 </div>
                                 <div className="absolute -bottom-6 text-[10px] font-bold text-slate-600">{selectedRule.code}</div>
                             </div>
                             <ArrowRight className="h-4 w-4 text-slate-300" />
                             <div className="flex flex-col items-center gap-2">
                                 <div className="h-8 px-3 rounded bg-green-50 border border-green-200 text-green-700 text-xs flex items-center font-bold">
                                     Pass / Execute
                                 </div>
                             </div>
                         </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Left Column: Logic & System Inference */}
                        <div className="col-span-2 space-y-6">
                            <Card className="bg-white border-slate-200 shadow-sm">
                                <CardHeader className="pb-3 border-b border-slate-100">
                                    <CardTitle className="text-base text-slate-800 flex items-center gap-2">
                                        <Zap className="h-4 w-4 text-indigo-600" /> 
                                        逻辑定义 (Logic Definition)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-4">
                                    <div className="bg-slate-50 p-4 rounded-md border border-slate-200">
                                        <div className="text-sm font-medium text-slate-700 mb-2">自然语言描述:</div>
                                        <p className="text-slate-600 italic">"{selectedRule.description}"</p>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-slate-700 mb-2">结构化条件:</div>
                                        <div className="space-y-2">
                                            {selectedRule.conditions && selectedRule.conditions.length > 0 ? (
                                                selectedRule.conditions.map(c => (
                                                    <div key={c.id} className="flex items-center gap-3 text-sm font-mono bg-white border border-slate-200 p-2 rounded">
                                                        {c.logicalOp && <Badge variant="secondary" className="text-[10px] h-5">{c.logicalOp}</Badge>}
                                                        <span className="text-blue-600">[{c.field}]</span>
                                                        <span className="text-slate-400 font-bold">{c.operator}</span>
                                                        <span className="text-green-600">'{c.value}'</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-slate-400 text-sm italic">无结构化条件</div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-slate-50 border-slate-200 shadow-none">
                                <CardHeader>
                                <CardTitle className="text-base text-slate-700">系统推导 (System Inference)</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-xs text-slate-500">作用范围 (Scope)</Label>
                                            <div className="font-medium text-slate-900 mt-1">{selectedRule.scope}</div>
                                        </div>
                                        <div>
                                            <Label className="text-xs text-slate-500">违规后果 (Consequence)</Label>
                                            <div className="font-medium text-slate-900 mt-1">{selectedRule.violationConsequence}</div>
                                        </div>
                                    </div>
                                    <div>
                                    <Label className="text-xs text-slate-500">Agent 自动化影响</Label>
                                    <div className={`font-medium mt-1 flex items-center gap-2 ${selectedRule.impactsAgent ? "text-red-600" : "text-green-600"}`}>
                                        {selectedRule.impactsAgent ? <Ban className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                        {selectedRule.impactsAgent ? "阻断自动化执行" : "允许继续执行"}
                                    </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column: Stats & Governance */}
                        <div className="space-y-6">
                            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                                <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                                    <ShieldAlert className="w-4 h-4" /> 风控合规签名
                                </h4>
                                <p className="text-sm text-amber-700 mb-4">
                                    该规则已生效，任何修改都需要经过合规部门审批。
                                </p>
                                <div className="flex items-center justify-between text-xs text-amber-600 border-t border-amber-200 pt-3">
                                    <span>Signed by: Risk_Control_System</span>
                                    <span>2024-12-31 10:00:00</span>
                                </div>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                                <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-slate-500" />
                                    执行统计 (7 Days)
                                </h4>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-slate-500">Total Triggers</span>
                                            <span className="font-medium">{selectedRule.stats?.triggerCount}</span>
                                        </div>
                                        <Progress value={60} className="h-1.5 bg-slate-100" />
                                    </div>
                                    
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-slate-500">False Positive Rate</span>
                                            <span className={`font-medium ${selectedRule.stats?.falsePositiveRate > 1 ? "text-red-600" : "text-green-600"}`}>
                                                {selectedRule.stats?.falsePositiveRate}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-red-500 h-full" style={{ width: `${selectedRule.stats?.falsePositiveRate}%` }}></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-slate-500">Conflict Detections</span>
                                            <span className="font-medium text-orange-600">{selectedRule.stats?.conflictCount}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                                <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                                    <Network className="h-4 w-4 text-slate-500" />
                                    影响范围分析
                                </h4>
                                <ul className="space-y-2 text-sm text-slate-600">
                                    <li className="flex items-center justify-between">
                                        <span>受影响实体:</span>
                                        <Badge variant="secondary">2,305 Customers</Badge>
                                    </li>
                                    <li className="flex items-center justify-between">
                                        <span>活跃流程:</span>
                                        <Badge variant="secondary">15 Workflows</Badge>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                 </div>
               </ScrollArea>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 text-slate-400">
              <Scale className="w-16 h-16 mb-4 opacity-10" />
              <p className="text-lg font-medium">选择左侧规则查看详情，或点击右上角新增</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
