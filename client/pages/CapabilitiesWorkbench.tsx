import React, { useState, useMemo } from "react";
import { 
  Activity, 
  Zap, 
  ShieldAlert, 
  Search, 
  Plus, 
  Box,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Scale,
  Users,
  Edit,
  Trash2,
  Info,
  Code2,
  Database,
  Globe,
  Server,
  Terminal,
  PlayCircle,
  Clock,
  Fingerprint,
  RefreshCw,
  Lock,
  Braces
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// --- Types ---

interface SimpleEntity {
  id: string;
  name: string;
  code: string;
  lifecycleStates: string[];
}

interface CapabilityParameter {
  name: string;
  type: string;
  required?: boolean;
  description?: string;
}

interface Capability {
  id: string;
  name: string;
  code: string;
  scenario: string; 
  trigger: string; 
  action: string; 
  targetEntityId: string;
  
  // Technical Definition
  protocol: "REST" | "RPC" | "SQL";
  inputs: CapabilityParameter[];
  outputs: CapabilityParameter[];
  
  // Impacts
  impacts: {
    statusChange: boolean;
    financialChange: boolean;
    rightsChange: boolean;
    recordOnly: boolean;
  };
  
  impactDetails: {
    linkedState?: string;
    accountingSubject?: string;
  };

  // Risk & Governance
  preConditions: string[];
  rateLimit: string;
  retryPolicy: string;
  
  // System Inference (Read-only)
  riskLevel: "High" | "Medium" | "Low";
  needsApproval: boolean;
  
  description?: string;

  // Stats (Mock)
  stats: {
    calls24h: number;
    avgLatency: number; // ms
    successRate: number; // %
  };
  
  // Interface Spec
  interfaceSpec?: {
    method: "GET" | "POST" | "PUT";
    url: string;
    requestBody: string;
    responseBody: string;
  };
}

// --- Mock Data ---

const MOCK_ENTITIES: SimpleEntity[] = [
  { id: "e1", name: "客户", code: "Customer", lifecycleStates: ["潜在", "活跃", "流失", "冻结"] },
  { id: "e2", name: "订单", code: "Order", lifecycleStates: ["草稿", "待支付", "已支付", "履约中", "完成", "取消"] },
  { id: "e3", name: "工单", code: "Ticket", lifecycleStates: ["新建", "处理中", "挂起", "已解决", "关闭"] },
  { id: "e4", name: "账户", code: "Account", lifecycleStates: ["正常", "欠费", "冻结", "注销"] },
];

const MOCK_CAPABILITIES: Capability[] = [
  {
    id: "c1",
    name: "冻结高风险账户",
    code: "CAP-ACC-001",
    scenario: "当连续3次登录失败发生时，公司会对账户做临时冻结",
    trigger: "连续3次登录失败",
    action: "临时冻结",
    targetEntityId: "e4",
    protocol: "RPC",
    inputs: [
      { name: "accountId", type: "Long", required: true, description: "账户唯一标识" },
      { name: "failCount", type: "Integer", required: true, description: "当前失败次数" },
      { name: "deviceIp", type: "String", required: false, description: "来源IP地址" }
    ],
    outputs: [
      { name: "success", type: "Boolean", description: "操作是否成功" },
      { name: "frozenUntil", type: "DateTime", description: "冻结截止时间" }
    ],
    impacts: {
      statusChange: true,
      financialChange: false,
      rightsChange: true,
      recordOnly: false,
    },
    impactDetails: {
      linkedState: "冻结"
    },
    preConditions: ["账户状态 != 已注销", "不在白名单中"],
    rateLimit: "1000/min",
    retryPolicy: "3次, 指数退避",
    riskLevel: "Medium",
    needsApproval: false,
    description: "防止账户被暴力破解的安全保护措施。",
    stats: {
      calls24h: 12450,
      avgLatency: 45,
      successRate: 99.98
    },
    interfaceSpec: {
      method: "POST",
      url: "/api/v1/account/freeze",
      requestBody: `{\n  "accountId": "12345678",\n  "failCount": 3,\n  "deviceIp": "192.168.1.1"\n}`,
      responseBody: `{\n  "success": true,\n  "frozenUntil": "2023-12-31T23:59:59Z",\n  "ticketId": "TKT-2023-001"\n}`
    }
  },
  {
    id: "c2",
    name: "发放退款",
    code: "CAP-ORD-001",
    scenario: "当售后审核通过发生时，公司会对订单做原路退款",
    trigger: "售后审核通过",
    action: "原路退款",
    targetEntityId: "e2",
    protocol: "REST",
    inputs: [
      { name: "orderId", type: "String", required: true, description: "订单编号" },
      { name: "amount", type: "Decimal", required: true, description: "退款金额" },
      { name: "reason", type: "String", required: true, description: "退款原因" }
    ],
    outputs: [
      { name: "refundId", type: "String", description: "退款流水号" },
      { name: "status", type: "String", description: "受理状态" }
    ],
    impacts: {
      statusChange: true,
      financialChange: true,
      rightsChange: false,
      recordOnly: false,
    },
    impactDetails: {
      linkedState: "已取消",
      accountingSubject: "2001.01 (应付账款-退款)"
    },
    preConditions: ["订单状态 == 已支付", "退款金额 <= 实付金额"],
    rateLimit: "100/min",
    retryPolicy: "不重试 (需人工介入)",
    riskLevel: "High",
    needsApproval: true,
    description: "涉及资金流出的敏感操作，需严格风控。",
    stats: {
      calls24h: 320,
      avgLatency: 850,
      successRate: 98.5
    },
    interfaceSpec: {
      method: "POST",
      url: "/api/finance/refund",
      requestBody: `{\n  "orderId": "ORD-2023-999",\n  "amount": 199.00,\n  "reason": "Quality Issue"\n}`,
      responseBody: `{\n  "refundId": "REF-888888",\n  "status": "PROCESSING",\n  "estimatedTime": "1-3 days"\n}`
    }
  },
];

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- Helper Components ---

const CodeBlock = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <code className={`font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 ${className}`}>
    {children}
  </code>
);

const ProtocolBadge = ({ protocol }: { protocol: string }) => {
  const styles: Record<string, string> = {
    REST: "bg-blue-100 text-blue-700 border-blue-200",
    RPC: "bg-purple-100 text-purple-700 border-purple-200",
    SQL: "bg-orange-100 text-orange-700 border-orange-200",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${styles[protocol] || "bg-gray-100 text-gray-700"}`}>
      {protocol}
    </span>
  );
};

const InterfaceSpecTab = ({ capability }: { capability: Capability }) => {
  const [testParams, setTestParams] = useState<Record<string, string>>({});
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRunTest = () => {
    setIsLoading(true);
    setTestResult(null);
    // Simulate network delay
    setTimeout(() => {
      setIsLoading(false);
      setTestResult(capability.interfaceSpec?.responseBody || "{}");
    }, 800);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* API Overview */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Request Specification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`${
                capability.interfaceSpec?.method === 'GET' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                capability.interfaceSpec?.method === 'POST' ? 'bg-green-50 text-green-700 border-green-200' :
                'bg-orange-50 text-orange-700 border-orange-200'
              }`}>
                {capability.interfaceSpec?.method || "POST"}
              </Badge>
              <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 font-mono flex-1 truncate">
                {capability.interfaceSpec?.url || `/api/capability/${capability.code.toLowerCase()}`}
              </code>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-slate-400">Body Schema (JSON)</Label>
              <div className="relative">
                 <pre className="text-[10px] leading-relaxed bg-slate-900 text-slate-50 p-3 rounded-lg font-mono overflow-x-auto">
                    {capability.interfaceSpec?.requestBody || "{}"}
                 </pre>
                 <div className="absolute top-2 right-2 text-[10px] text-slate-500">application/json</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Response Specification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 h-[26px]">
               <Badge variant="outline" className="bg-slate-50 text-slate-600">200 OK</Badge>
               <span className="text-xs text-slate-400">Standard Success Response</span>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-slate-400">Body Schema (JSON)</Label>
              <div className="relative">
                 <pre className="text-[10px] leading-relaxed bg-slate-900 text-slate-50 p-3 rounded-lg font-mono overflow-x-auto">
                    {capability.interfaceSpec?.responseBody || "{}"}
                 </pre>
                 <div className="absolute top-2 right-2 text-[10px] text-slate-500">application/json</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Console */}
      <Card className="border-indigo-100 shadow-md">
        <CardHeader className="bg-indigo-50/30 border-b border-indigo-50 pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-indigo-900">
            <Terminal className="h-4 w-4" />
            在线调试控制台 (Test Console)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 grid grid-cols-12 divide-x divide-indigo-50">
           {/* Input Panel */}
           <div className="col-span-5 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-slate-700">Input Parameters</h4>
                <Button size="sm" onClick={handleRunTest} disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 h-7 text-xs">
                  {isLoading ? <RefreshCw className="h-3 w-3 animate-spin mr-1"/> : <PlayCircle className="h-3 w-3 mr-1"/>}
                  Execute
                </Button>
              </div>
              <div className="space-y-3">
                {capability.inputs.map(input => (
                   <div key={input.name} className="space-y-1">
                      <Label className="text-xs text-slate-500 font-mono">{input.name} <span className="text-slate-300">({input.type})</span></Label>
                      <Input 
                        className="h-8 text-xs font-mono" 
                        placeholder={input.description}
                        value={testParams[input.name] || ""}
                        onChange={e => setTestParams({...testParams, [input.name]: e.target.value})}
                      />
                   </div>
                ))}
                {capability.inputs.length === 0 && <div className="text-xs text-slate-400 italic">无输入参数</div>}
              </div>
           </div>

           {/* Result Panel */}
           <div className="col-span-7 p-5 bg-slate-50/50">
              <h4 className="text-sm font-medium text-slate-700 mb-4">Execution Result</h4>
              {testResult ? (
                 <div className="space-y-2 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-green-600 hover:bg-green-700">200 OK</Badge>
                        <span className="text-xs text-slate-400 font-mono">124ms</span>
                    </div>
                    <pre className="text-xs text-slate-700 font-mono bg-white p-4 rounded border border-slate-200 shadow-sm overflow-auto max-h-[200px]">
                        {testResult}
                    </pre>
                 </div>
              ) : (
                 <div className="h-[200px] flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-200 rounded-lg">
                    <Zap className="h-8 w-8 mb-2 opacity-50" />
                    <span className="text-xs">点击 Execute 运行测试</span>
                 </div>
              )}
           </div>
        </CardContent>
      </Card>
    </div>
  );
};

// --- Wizard Components ---

const WizardStep1 = ({ data, updateData }: { data: Partial<Capability>, updateData: (d: Partial<Capability>) => void }) => {
  const targetEntity = MOCK_ENTITIES.find(e => e.id === data.targetEntityId);
  const scenarioPreview = `当 ${data.trigger || "..."} 发生时，公司会对 ${targetEntity?.name || "..."} 做 ${data.action || "..."}`;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
            <div className="space-y-2">
            <Label>能力名称</Label>
            <Input 
                placeholder="例如：冻结账户" 
                value={data.name || ""}
                onChange={(e) => updateData({ name: e.target.value })}
            />
            </div>
            <div className="space-y-2">
            <Label>系统编码 (Code)</Label>
            <Input 
                placeholder="CAP-XXX-001" 
                className="font-mono"
                value={data.code || ""}
                onChange={(e) => updateData({ code: e.target.value })}
            />
            </div>
             <div className="space-y-2">
                <Label>技术协议</Label>
                <Select 
                    value={data.protocol} 
                    onValueChange={(val) => updateData({ protocol: val as any })}
                >
                    <SelectTrigger>
                    <SelectValue placeholder="选择协议类型" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="REST">REST API</SelectItem>
                        <SelectItem value="RPC">RPC (gRPC/Dubbo)</SelectItem>
                        <SelectItem value="SQL">Direct SQL</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>

        <div className="space-y-4">
             <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 h-full flex flex-col">
                <Label className="text-slate-500 mb-2">场景预览</Label>
                <p className="text-lg font-medium text-slate-800 italic leading-relaxed flex-1">
                    "{scenarioPreview}"
                </p>
                <div className="mt-4 pt-4 border-t border-slate-200 text-xs text-slate-400">
                    该描述将用于业务文档生成，请尽量通俗易懂。
                </div>
            </div>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
            <Label>触发条件 (Trigger)</Label>
            <Input 
                placeholder="例如：连续3次登录失败" 
                value={data.trigger || ""}
                onChange={(e) => updateData({ trigger: e.target.value })}
            />
        </div>
        <div className="space-y-2">
            <Label>目标对象 (Target)</Label>
            <Select 
                value={data.targetEntityId} 
                onValueChange={(val) => updateData({ targetEntityId: val })}
            >
                <SelectTrigger>
                <SelectValue placeholder="选择业务对象" />
                </SelectTrigger>
                <SelectContent>
                {MOCK_ENTITIES.map(e => (
                    <SelectItem key={e.id} value={e.id}>{e.name} ({e.code})</SelectItem>
                ))}
                </SelectContent>
            </Select>
        </div>
         <div className="space-y-2 col-span-2">
            <Label>执行动作 (Action)</Label>
            <Input 
            placeholder="例如：临时冻结" 
            value={data.action || ""}
            onChange={(e) => {
                const val = e.target.value;
                updateData({ 
                action: val,
                name: data.name ? data.name : (val + (targetEntity?.name || ""))
                });
            }}
            />
        </div>
      </div>
    </div>
  );
};

const WizardStep2 = ({ data, updateData }: { data: Partial<Capability>, updateData: (d: Partial<Capability>) => void }) => {
  const impacts = data.impacts || { statusChange: false, financialChange: false, rightsChange: false, recordOnly: false };
  const targetEntity = MOCK_ENTITIES.find(e => e.id === data.targetEntityId);

  const handleImpactChange = (key: keyof typeof impacts, checked: boolean) => {
    updateData({ 
      impacts: { ...impacts, [key]: checked } 
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Step 2: 业务影响配置</h3>
        <p className="text-sm text-gray-500">定义该能力执行产生的具体业务后果，系统将自动关联相关模型。</p>
      </div>

      <div className="grid gap-4">
        {/* Status Change Config */}
        <div className={`rounded-lg border p-4 transition-all ${impacts.statusChange ? "bg-blue-50/50 border-blue-200" : "bg-white border-slate-200"}`}>
            <div className="flex items-start space-x-3">
                <Checkbox 
                    id="statusChange" 
                    checked={impacts.statusChange}
                    onCheckedChange={(c) => handleImpactChange("statusChange", !!c)}
                />
                <div className="flex-1 space-y-1">
                    <Label htmlFor="statusChange" className="flex items-center gap-2 cursor-pointer">
                        <Activity className="h-4 w-4 text-blue-600" />
                        状态变更 (Status Change)
                    </Label>
                    <p className="text-xs text-gray-500">驱动业务对象生命周期流转</p>
                    
                    {impacts.statusChange && (
                        <div className="mt-3 pl-1 animate-in slide-in-from-top-2">
                            <Label className="text-xs mb-1.5 block text-blue-700">目标状态</Label>
                            <Select 
                                value={data.impactDetails?.linkedState} 
                                onValueChange={(val) => updateData({ impactDetails: { ...data.impactDetails, linkedState: val } })}
                            >
                                <SelectTrigger className="h-8 bg-white border-blue-200">
                                    <SelectValue placeholder="选择变更后的状态" />
                                </SelectTrigger>
                                <SelectContent>
                                    {targetEntity?.lifecycleStates.map(s => (
                                        <SelectItem key={s} value={s}>{s}</SelectItem>
                                    )) || <SelectItem value="none" disabled>请先在 Step 1 选择对象</SelectItem>}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Financial Change Config */}
        <div className={`rounded-lg border p-4 transition-all ${impacts.financialChange ? "bg-amber-50/50 border-amber-200" : "bg-white border-slate-200"}`}>
            <div className="flex items-start space-x-3">
                <Checkbox 
                    id="financialChange" 
                    checked={impacts.financialChange}
                    onCheckedChange={(c) => handleImpactChange("financialChange", !!c)}
                />
                <div className="flex-1 space-y-1">
                    <Label htmlFor="financialChange" className="flex items-center gap-2 cursor-pointer">
                        <Zap className="h-4 w-4 text-amber-600" />
                        资金变动 (Financial Impact)
                    </Label>
                    <p className="text-xs text-gray-500">涉及金额计算、冻结或资产转移</p>

                    {impacts.financialChange && (
                        <div className="mt-3 pl-1 animate-in slide-in-from-top-2">
                            <Label className="text-xs mb-1.5 block text-amber-700">会计科目映射 (Accounting Subject)</Label>
                            <Input 
                                className="h-8 bg-white border-amber-200" 
                                placeholder="例如: 2001.01 (应付账款)"
                                value={data.impactDetails?.accountingSubject || ""}
                                onChange={(e) => updateData({ impactDetails: { ...data.impactDetails, accountingSubject: e.target.value } })}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Other Impacts */}
        <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border p-4 flex items-start space-x-3 bg-white">
                <Checkbox 
                    id="rightsChange" 
                    checked={impacts.rightsChange}
                    onCheckedChange={(c) => handleImpactChange("rightsChange", !!c)}
                />
                <div className="space-y-1">
                    <Label htmlFor="rightsChange" className="flex items-center gap-2 cursor-pointer">
                        <Users className="h-4 w-4 text-slate-600" />
                        权益变更
                    </Label>
                    <p className="text-xs text-gray-500">修改用户权限/等级/积分</p>
                </div>
            </div>
             <div className="rounded-lg border p-4 flex items-start space-x-3 bg-white">
                <Checkbox 
                    id="recordOnly" 
                    checked={impacts.recordOnly}
                    onCheckedChange={(c) => handleImpactChange("recordOnly", !!c)}
                />
                <div className="space-y-1">
                    <Label htmlFor="recordOnly" className="flex items-center gap-2 cursor-pointer">
                        <Box className="h-4 w-4 text-slate-600" />
                        仅记录/通知
                    </Label>
                    <p className="text-xs text-gray-500">不改变核心数据，仅审计留痕</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

const WizardStep3 = ({ data, updateData }: { data: Partial<Capability>, updateData: (d: Partial<Capability>) => void }) => {
  const [newPreCondition, setNewPreCondition] = useState("");
  
  // System Inference Logic
  let riskLevel: "High" | "Medium" | "Low" = "Low";
  if (data.impacts?.financialChange) riskLevel = "High";
  else if (data.impacts?.rightsChange || data.impacts?.statusChange) riskLevel = "Medium";

  const addPreCondition = () => {
    if(!newPreCondition.trim()) return;
    updateData({ preConditions: [...(data.preConditions || []), newPreCondition] });
    setNewPreCondition("");
  }

  const removePreCondition = (idx: number) => {
    const next = [...(data.preConditions || [])];
    next.splice(idx, 1);
    updateData({ preConditions: next });
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* Pre-conditions Config */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-indigo-600" />
            前置校验条件 (Pre-conditions)
        </h3>
        <div className="flex gap-2">
            <Input 
                value={newPreCondition}
                onChange={e => setNewPreCondition(e.target.value)}
                placeholder="例如: 账户状态 != 已注销"
                className="flex-1"
                onKeyDown={e => e.key === 'Enter' && addPreCondition()}
            />
            <Button onClick={addPreCondition} variant="secondary">添加</Button>
        </div>
        <div className="space-y-2">
            {data.preConditions?.map((cond, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded border text-sm">
                    <span className="font-mono text-slate-600">{cond}</span>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-slate-400 hover:text-red-500" onClick={() => removePreCondition(i)}>
                        <Trash2 className="h-3 w-3" />
                    </Button>
                </div>
            ))}
            {(!data.preConditions || data.preConditions.length === 0) && (
                <div className="text-xs text-slate-400 italic px-2">暂无前置条件</div>
            )}
        </div>
      </div>

      <Separator />

      {/* Risk Summary */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">系统风险评估</h3>
        <Card className={`${
            riskLevel === "High" ? "bg-red-50/50 border-red-200" : 
            riskLevel === "Medium" ? "bg-orange-50/50 border-orange-200" : "bg-green-50/50 border-green-200"
        }`}>
            <CardHeader className="pb-2">
            <CardTitle className={`text-base flex items-center gap-2 ${
                riskLevel === "High" ? "text-red-800" : 
                riskLevel === "Medium" ? "text-orange-800" : "text-green-800"
            }`}>
                <AlertTriangle className="h-5 w-5" />
                {riskLevel === "High" ? "高风险能力" : riskLevel === "Medium" ? "中风险能力" : "低风险能力"}
            </CardTitle>
            </CardHeader>
            <CardContent>
             <div className="text-sm space-y-1 text-gray-600">
                <p>建议治理策略：</p>
                <div className="flex gap-2 mt-2">
                    {riskLevel === "High" && <Badge variant="outline" className="bg-white border-red-200 text-red-700">需人工审批</Badge>}
                    <Badge variant="outline" className="bg-white">全量日志</Badge>
                    <Badge variant="outline" className="bg-white">TPS限制: {riskLevel === 'High' ? '100/min' : '1000/min'}</Badge>
                </div>
             </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
};

// --- Main Page Component ---

const CapabilitiesWorkbench = () => {
  const [capabilities, setCapabilities] = useState<Capability[]>(MOCK_CAPABILITIES);
  const [selectedCapId, setSelectedCapId] = useState<string | null>(MOCK_CAPABILITIES[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Wizard State
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Capability>>({});

  const selectedCap = useMemo(() => 
    capabilities.find(c => c.id === selectedCapId), 
    [capabilities, selectedCapId]
  );

  const groupedCapabilities = useMemo(() => {
    const filtered = capabilities.filter(c => 
      c.name.includes(searchQuery) || 
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.scenario.includes(searchQuery)
    );
    return {
      High: filtered.filter(c => c.riskLevel === "High"),
      Medium: filtered.filter(c => c.riskLevel === "Medium"),
      Low: filtered.filter(c => c.riskLevel === "Low"),
    };
  }, [capabilities, searchQuery]);

  const handleCreateStart = () => {
    setFormData({
      impacts: { statusChange: false, financialChange: false, rightsChange: false, recordOnly: false },
      inputs: [],
      outputs: [],
      preConditions: [],
      protocol: "REST"
    });
    setWizardStep(1);
    setIsEditing(false);
    setIsWizardOpen(true);
    setSelectedCapId(null);
  };

  const handleEditStart = () => {
    if (!selectedCap) return;
    setFormData({ ...selectedCap });
    setWizardStep(1);
    setIsEditing(true);
    setIsWizardOpen(true);
  };

  const handleDelete = () => {
    if (!selectedCap) return;
    const newCaps = capabilities.filter(c => c.id !== selectedCap.id);
    setCapabilities(newCaps);
    setSelectedCapId(null);
  };

  const handleCreateFinish = () => {
    // Infer risk logic again for final save
    let riskLevel: "High" | "Medium" | "Low" = "Low";
    if (formData.impacts?.financialChange) riskLevel = "High";
    else if (formData.impacts?.rightsChange || formData.impacts?.statusChange) riskLevel = "Medium";

    const newCap: Capability = {
      id: isEditing && selectedCapId ? selectedCapId : `c_${Date.now()}`,
      name: formData.name || "未命名能力",
      code: formData.code || "CAP-NEW",
      scenario: `当 ${formData.trigger} 发生时，公司会对 ${MOCK_ENTITIES.find(e => e.id === formData.targetEntityId)?.name} 做 ${formData.action}`,
      trigger: formData.trigger || "",
      action: formData.action || "",
      targetEntityId: formData.targetEntityId || "",
      impacts: formData.impacts!,
      impactDetails: formData.impactDetails || {},
      riskLevel: riskLevel,
      needsApproval: riskLevel === "High",
      description: formData.description,
      protocol: formData.protocol || "REST",
      inputs: formData.inputs || [],
      outputs: formData.outputs || [],
      preConditions: formData.preConditions || [],
      rateLimit: formData.rateLimit || "1000/min",
      retryPolicy: formData.retryPolicy || "Default",
      stats: formData.stats || { calls24h: 0, avgLatency: 0 }
    };
    
    if (isEditing) {
      setCapabilities(capabilities.map(c => c.id === newCap.id ? newCap : c));
    } else {
      setCapabilities([...capabilities, newCap]);
      setSelectedCapId(newCap.id);
    }
    
    setIsWizardOpen(false);
    setIsEditing(false);
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
      {/* Global Header */}
      <header className="h-14 border-b flex items-center px-6 justify-between shrink-0 bg-white">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-indigo-600" />
          <h1 className="font-semibold text-lg">行为能力工作台</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="搜索能力场景..." 
              className="pl-8 h-9" 
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
            新建能力
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar */}
        <aside className="w-64 border-r bg-gray-50/50 flex flex-col shrink-0">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-6">
              {(Object.entries(groupedCapabilities) as [string, Capability[]][]).map(([group, caps]) => (
                caps.length > 0 && (
                  <div key={group} className="space-y-2">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        group === 'High' ? 'bg-red-500' : 
                        group === 'Medium' ? 'bg-orange-500' : 'bg-green-500'
                      }`} />
                      {group === 'High' ? '高风险' : group === 'Medium' ? '中风险' : '低风险'}
                      <span className="ml-auto text-[10px] bg-slate-100 px-1.5 py-0.5 rounded-full">{caps.length}</span>
                    </h3>
                    <div className="space-y-0.5">
                      {caps.map(cap => (
                        <button
                          key={cap.id}
                          onClick={() => {
                            setSelectedCapId(cap.id);
                            setIsWizardOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2.5 rounded-md text-sm flex items-center gap-3 transition-all ${
                            selectedCapId === cap.id && !isWizardOpen
                              ? "bg-indigo-50 text-indigo-700 font-medium shadow-sm ring-1 ring-indigo-200" 
                              : "hover:bg-slate-50 text-slate-600"
                          }`}
                        >
                          <div className="flex-1 truncate">
                            <div className="truncate">{cap.name}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-slate-400 font-mono">{cap.code}</span>
                                <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 border-slate-200 text-slate-400 font-normal">
                                    {cap.protocol}
                                </Badge>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              ))}
              {Object.values(groupedCapabilities).flat().length === 0 && (
                <div className="p-8 text-center text-slate-400 text-sm">
                  <div className="mx-auto w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                    <Search className="h-5 w-5 opacity-50" />
                  </div>
                  未找到匹配的能力
                </div>
              )}
            </div>
          </ScrollArea>
        </aside>

        {/* Right Detail View or Wizard */}
        <main className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
          {isWizardOpen ? (
            <ScrollArea className="flex-1">
              <div className="max-w-3xl mx-auto py-12 px-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-2 text-slate-900">{isEditing ? "编辑行为能力" : "新建行为能力"}</h2>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span className={wizardStep >= 1 ? "text-indigo-600 font-medium" : ""}>1. 场景与协议</span>
                    <ChevronRight className="h-4 w-4" />
                    <span className={wizardStep >= 2 ? "text-indigo-600 font-medium" : ""}>2. 影响与关联</span>
                    <ChevronRight className="h-4 w-4" />
                    <span className={wizardStep >= 3 ? "text-indigo-600 font-medium" : ""}>3. 风险校验</span>
                  </div>
                  <Progress value={wizardStep * 33.3} className="h-1 mt-4" />
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-[400px]">
                  {wizardStep === 1 && <WizardStep1 data={formData} updateData={(d) => setFormData({...formData, ...d})} />}
                  {wizardStep === 2 && <WizardStep2 data={formData} updateData={(d) => setFormData({...formData, ...d})} />}
                  {wizardStep === 3 && <WizardStep3 data={formData} updateData={(d) => setFormData({...formData, ...d})} />}
                </div>

                <div className="flex justify-between mt-8">
                  <Button variant="ghost" onClick={() => {
                    if (wizardStep > 1) setWizardStep(wizardStep - 1);
                    else setIsWizardOpen(false);
                  }}>
                    {wizardStep === 1 ? "取消" : "上一步"}
                  </Button>
                  <Button onClick={() => {
                    if (wizardStep < 3) setWizardStep(wizardStep + 1);
                    else handleCreateFinish();
                  }} className="bg-indigo-600 hover:bg-indigo-700">
                    {wizardStep === 3 ? "完成创建" : "下一步"}
                    {wizardStep < 3 && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </ScrollArea>
          ) : selectedCap ? (
            <ScrollArea className="flex-1">
              <div className="max-w-[1200px] mx-auto p-8 space-y-8">
                
                {/* 1. New Header */}
                <div className="flex items-start justify-between bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-start gap-5">
                    <div className="h-14 w-14 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center justify-center shrink-0">
                      {selectedCap.protocol === 'REST' ? <Globe className="h-7 w-7 text-indigo-600" /> : 
                       selectedCap.protocol === 'SQL' ? <Database className="h-7 w-7 text-indigo-600" /> :
                       <Server className="h-7 w-7 text-indigo-600" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-slate-900">{selectedCap.name}</h1>
                        <ProtocolBadge protocol={selectedCap.protocol} />
                        <Badge variant="outline" className="font-mono text-xs">{selectedCap.code}</Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                         <div className="flex items-center gap-1.5">
                             <Clock className="h-3.5 w-3.5" />
                             24h Calls: <span className="font-medium text-slate-700">{selectedCap.stats.calls24h.toLocaleString()}</span>
                         </div>
                         <div className="h-3 w-px bg-slate-200" />
                         <div className="flex items-center gap-1.5">
                             <Activity className="h-3.5 w-3.5" />
                             Avg Latency: <span className="font-medium text-slate-700">{selectedCap.stats.avgLatency}ms</span>
                         </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button variant="outline" size="sm" onClick={handleEditStart}>
                      <Edit className="h-4 w-4 mr-2" />
                      定义
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200">
                          <Trash2 className="h-4 w-4 mr-2" />
                          删除
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>确认删除能力？</AlertDialogTitle>
                          <AlertDialogDescription>
                            即将删除能力“{selectedCap.name}”。此操作不可恢复。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">确认删除</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <Tabs defaultValue="definition" className="w-full">
                  <TabsList className="grid w-[400px] grid-cols-2 mb-6">
                    <TabsTrigger value="definition">业务定义 & 逻辑 (Definition)</TabsTrigger>
                    <TabsTrigger value="interface">接口规范 & 调试 (Interface)</TabsTrigger>
                  </TabsList>

                  <TabsContent value="definition" className="space-y-6 animate-in slide-in-from-left-2 duration-300">
                    <div className="grid grid-cols-3 gap-6">
                    {/* 2. Main Logic Matrix (Left 2 cols) */}
                    <div className="col-span-2 space-y-6">
                        <Card className="shadow-sm border-slate-200">
                            <CardHeader className="border-b border-slate-100 pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Terminal className="h-4 w-4 text-indigo-600" />
                                    触发与执行矩阵 (Trigger & Execution Matrix)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="grid grid-cols-2 divide-x divide-slate-100">
                                    {/* Input Column */}
                                    <div className="p-5 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Inputs (Trigger Context)</span>
                                            <Badge variant="secondary" className="text-[10px] h-5">Request</Badge>
                                        </div>
                                        <div className="space-y-3">
                                            {selectedCap.inputs.length > 0 ? selectedCap.inputs.map((input, i) => (
                                                <div key={i} className="flex flex-col gap-1 p-2 rounded hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-mono text-sm font-medium text-slate-700">{input.name}</span>
                                                        <span className="text-[10px] text-slate-400 font-mono">{input.type}</span>
                                                    </div>
                                                    <div className="text-xs text-slate-500">{input.description}</div>
                                                </div>
                                            )) : (
                                                <div className="text-sm text-slate-400 italic">No explicit inputs defined</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Output Column */}
                                    <div className="p-5 space-y-4 bg-slate-50/30">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Outputs (Results)</span>
                                            <Badge variant="outline" className="text-[10px] h-5 bg-white">Response</Badge>
                                        </div>
                                         <div className="space-y-3">
                                            {selectedCap.outputs.length > 0 ? selectedCap.outputs.map((output, i) => (
                                                <div key={i} className="flex flex-col gap-1 p-2 rounded bg-white border border-slate-200 shadow-sm">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-mono text-sm font-medium text-slate-700">{output.name}</span>
                                                        <span className="text-[10px] text-slate-400 font-mono">{output.type}</span>
                                                    </div>
                                                    <div className="text-xs text-slate-500">{output.description}</div>
                                                </div>
                                            )) : (
                                                <div className="text-sm text-slate-400 italic">No explicit outputs defined</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Impact & Logic Preview */}
                        <Card className="shadow-sm border-slate-200">
                             <CardHeader className="border-b border-slate-100 pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-purple-600" />
                                    业务影响链 (Business Impact Chain)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    {/* Trigger Node */}
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="h-10 px-4 rounded border border-slate-200 bg-white flex items-center text-sm font-medium shadow-sm">
                                            Trigger: {selectedCap.trigger}
                                        </div>
                                    </div>
                                    
                                    <ArrowRight className="h-4 w-4 text-slate-300" />

                                    {/* Capability Node */}
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="h-12 px-5 rounded-lg border-2 border-indigo-100 bg-indigo-50 text-indigo-700 flex items-center text-sm font-bold shadow-sm">
                                            {selectedCap.name}
                                        </div>
                                    </div>

                                    <ArrowRight className="h-4 w-4 text-slate-300" />

                                    {/* Impact Nodes */}
                                    <div className="flex flex-col gap-3">
                                        {selectedCap.impacts.statusChange && (
                                            <div className="flex items-center gap-2 h-9 px-3 rounded border border-blue-200 bg-blue-50 text-xs text-blue-700">
                                                <Activity className="h-3 w-3" />
                                                变更状态 → <span className="font-bold">{selectedCap.impactDetails.linkedState || "Unknown"}</span>
                                            </div>
                                        )}
                                        {selectedCap.impacts.financialChange && (
                                            <div className="flex items-center gap-2 h-9 px-3 rounded border border-amber-200 bg-amber-50 text-xs text-amber-700">
                                                <Zap className="h-3 w-3" />
                                                记账 → <span className="font-mono">{selectedCap.impactDetails.accountingSubject || "Pending"}</span>
                                            </div>
                                        )}
                                         {!selectedCap.impacts.statusChange && !selectedCap.impacts.financialChange && (
                                            <div className="flex items-center gap-2 h-9 px-3 rounded border border-slate-200 bg-slate-50 text-xs text-slate-500">
                                                <Box className="h-3 w-3" />
                                                无显著状态变更
                                            </div>
                                         )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* 3. Right Sidebar (Risk & Policies) */}
                    <div className="space-y-6">
                         {/* Security & Risk Policy */}
                        <Card className={
                            selectedCap.riskLevel === "High" ? "border-red-200 bg-red-50/30" : 
                            selectedCap.riskLevel === "Medium" ? "border-orange-200 bg-orange-50/30" : "border-green-200 bg-green-50/30"
                        }>
                            <CardHeader className="pb-2">
                                <CardTitle className={`text-base flex items-center gap-2 ${
                                selectedCap.riskLevel === "High" ? "text-red-700" : 
                                selectedCap.riskLevel === "Medium" ? "text-orange-700" : "text-green-700"
                                }`}>
                                <ShieldAlert className="h-4 w-4" />
                                安全与风控策略
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="text-xs font-medium uppercase tracking-wide opacity-70 mb-1">Risk Level</div>
                                    <div className={`text-xl font-bold ${
                                        selectedCap.riskLevel === "High" ? "text-red-700" : 
                                        selectedCap.riskLevel === "Medium" ? "text-orange-700" : "text-green-700"
                                    }`}>
                                        {selectedCap.riskLevel} Risk
                                    </div>
                                </div>
                                <Separator className="bg-black/5" />
                                <div className="space-y-3">
                                    <div>
                                        <div className="text-xs font-medium uppercase tracking-wide opacity-70 mb-1">Rate Limit</div>
                                        <div className="flex items-center gap-2 text-sm font-mono bg-white/50 p-1.5 rounded border border-black/5">
                                            <Clock className="h-3.5 w-3.5" />
                                            {selectedCap.rateLimit}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-medium uppercase tracking-wide opacity-70 mb-1">Retry Policy</div>
                                        <div className="flex items-center gap-2 text-sm font-mono bg-white/50 p-1.5 rounded border border-black/5">
                                            <RefreshCw className="h-3.5 w-3.5" />
                                            {selectedCap.retryPolicy}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pre-conditions */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-700">
                                    <Lock className="h-4 w-4" />
                                    执行前置条件
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {selectedCap.preConditions && selectedCap.preConditions.length > 0 ? selectedCap.preConditions.map((cond, i) => (
                                        <li key={i} className="text-xs bg-slate-50 px-2 py-1.5 rounded border border-slate-100 font-mono text-slate-600 flex items-center gap-2">
                                            <div className="w-1 h-1 bg-slate-400 rounded-full" />
                                            {cond}
                                        </li>
                                    )) : (
                                        <li className="text-xs text-slate-400 italic">无特殊前置条件</li>
                                    )}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
                  </TabsContent>
                  <TabsContent value="interface">
                     <InterfaceSpecTab capability={selectedCap} />
                  </TabsContent>
                </Tabs>
              </div>
            </ScrollArea>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <Activity className="h-16 w-16 mb-4 text-slate-200" />
              <p>选择一个能力查看详情</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CapabilitiesWorkbench;
