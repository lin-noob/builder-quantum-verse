import React, { useState, useMemo } from "react";
import { 
  ShieldAlert, 
  Users, 
  Clock, 
  ArrowUpCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Filter, 
  Briefcase,
  UserCheck,
  Siren,
  Building2,
  AlertOctagon,
  Pencil,
  Trash2,
  Plus,
  Layout,
  List,
  Activity,
  Box,
  GitMerge
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// --- Types ---

type RiskLevel = "High" | "Medium" | "Low";
type ContextType = "Capability" | "Process" | "Entity";

interface ResponsibilityConfig {
  primaryOwner: string; // Role or User
  slaThreshold: number; // Hours
  escalationOwner?: string; // Role or Department
}

interface ResponsibilityItem {
  id: string;
  name: string;
  type: ContextType;
  riskLevel: RiskLevel;
  description: string; // "When X happens..."
  
  // Configuration
  config?: ResponsibilityConfig;
}

// --- Mock Data ---

const MOCK_ITEMS: ResponsibilityItem[] = [
  {
    id: "cap_001",
    name: "大额退款审批",
    type: "Capability",
    riskLevel: "High",
    description: "当发起超过 50,000 元的退款申请时",
    config: {
      primaryOwner: "Finance Manager",
      slaThreshold: 24,
      escalationOwner: "CFO"
    }
  },
  {
    id: "cap_002",
    name: "客户黑名单移除",
    type: "Capability",
    riskLevel: "High",
    description: "当尝试将客户从黑名单中移除时",
    config: undefined // Unassigned
  },
  {
    id: "proc_001",
    name: "季度财务结算流程",
    type: "Process",
    riskLevel: "Medium",
    description: "当季度最后一天触发结算流程时",
    config: {
      primaryOwner: "Accounting Lead",
      slaThreshold: 48,
      // No escalation
    }
  },
  {
    id: "ent_001",
    name: "VIP 客户档案变更",
    type: "Entity",
    riskLevel: "Medium",
    description: "当 VIP 客户的关键信息发生变更时",
    config: {
      primaryOwner: "Account Manager",
      slaThreshold: 12,
      escalationOwner: "Sales Director"
    }
  },
  {
    id: "cap_003",
    name: "系统配置重置",
    type: "Capability",
    riskLevel: "High",
    description: "当请求重置核心系统参数时",
    config: undefined // Unassigned
  }
];

const MOCK_ROLES = [
  "Finance Manager", "CFO", "Sales Director", "Account Manager", "System Admin", "Compliance Officer", "CEO", "Accounting Lead"
];

// --- Components ---

const ResponsibilityWorkbench = () => {
  const [items, setItems] = useState<ResponsibilityItem[]>(MOCK_ITEMS);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(MOCK_ITEMS[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editForm, setEditForm] = useState({ 
    name: "", 
    description: "", 
    riskLevel: "Low" as RiskLevel,
    type: "Capability" as ContextType
  });

  const selectedItem = useMemo(() => 
    items.find(i => i.id === selectedItemId), 
    [items, selectedItemId]
  );

  // Statistics
  const stats = useMemo(() => {
    const highRiskItems = items.filter(i => i.riskLevel === "High");
    const unassignedHighRisk = highRiskItems.filter(i => !i.config);
    const totalAssigned = items.filter(i => !!i.config).length;
    const noEscalation = items.filter(i => i.config && !i.config.escalationOwner);

    return {
      highRiskCount: highRiskItems.length,
      unassignedHighRiskCount: unassignedHighRisk.length,
      coverage: Math.round((totalAssigned / items.length) * 100),
      noEscalationCount: noEscalation.length
    };
  }, [items]);

  // Grouping & Filtering
  const groupedItems = useMemo(() => {
    const filtered = items.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return {
      Capability: filtered.filter(i => i.type === "Capability"),
      Process: filtered.filter(i => i.type === "Process"),
      Entity: filtered.filter(i => i.type === "Entity"),
    };
  }, [items, searchQuery]);

  // Handlers
  const handleConfigUpdate = (key: keyof ResponsibilityConfig, value: any) => {
    if (!selectedItemId) return;
    
    setItems(items.map(item => {
      if (item.id === selectedItemId) {
        const newConfig = item.config ? { ...item.config } : { primaryOwner: "", slaThreshold: 24 };
        return {
          ...item,
          config: { ...newConfig, [key]: value } as ResponsibilityConfig
        };
      }
      return item;
    }));
  };

  const handleDelete = () => {
    if (selectedItemId) {
      const newItems = items.filter(i => i.id !== selectedItemId);
      setItems(newItems);
      setSelectedItemId(null);
    }
  };

  const handleEditStart = () => {
    if (selectedItem) {
      setEditForm({
        name: selectedItem.name,
        description: selectedItem.description,
        riskLevel: selectedItem.riskLevel,
        type: selectedItem.type
      });
      setIsCreating(false);
      setIsEditOpen(true);
    }
  };

  const handleCreateStart = () => {
    setEditForm({
      name: "",
      description: "",
      riskLevel: "Low",
      type: "Capability"
    });
    setIsCreating(true);
    setIsEditOpen(true);
  };

  const handleEditSave = () => {
    if (isCreating) {
      const newItem: ResponsibilityItem = {
        id: `resp_${Date.now()}`,
        name: editForm.name || "新责任项",
        description: editForm.description || "暂无描述",
        riskLevel: editForm.riskLevel,
        type: editForm.type,
        config: undefined
      };
      setItems([...items, newItem]);
      setSelectedItemId(newItem.id);
    } else if (selectedItemId) {
      setItems(items.map(i => {
        if (i.id === selectedItemId) {
          return {
            ...i,
            name: editForm.name,
            description: editForm.description,
            riskLevel: editForm.riskLevel,
            type: editForm.type
          };
        }
        return i;
      }));
    }
    setIsEditOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      {/* Global Header */}
      <header className="h-14 shrink-0 bg-white border-b flex items-center px-4 justify-between z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-slate-500">
            <span className="font-semibold text-lg text-slate-800 flex items-center gap-2">
               <ShieldAlert className="h-5 w-5 text-indigo-600" />
               岗位责任工作台
            </span>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-medium">责任定义与SLA配置</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="搜索责任项..." 
              className="pl-8 h-8 bg-slate-50 border-slate-200" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="default" 
                size="sm" 
                className="bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                onClick={handleCreateStart}
              >
                <Plus className="h-4 w-4 mr-2" />
                定义新责任
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{isCreating ? "定义新责任" : "编辑责任信息"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>关联类型</Label>
                  <Select value={editForm.type} onValueChange={(v: ContextType) => setEditForm({...editForm, type: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Capability">业务能力 (Capability)</SelectItem>
                      <SelectItem value="Process">业务流程 (Process)</SelectItem>
                      <SelectItem value="Entity">业务对象 (Entity)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>业务名称</Label>
                  <Input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} placeholder="例如：大额退款审批" />
                </div>
                <div className="space-y-2">
                  <Label>风险等级</Label>
                  <Select value={editForm.riskLevel} onValueChange={(v: RiskLevel) => setEditForm({...editForm, riskLevel: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">High (高风险)</SelectItem>
                      <SelectItem value="Medium">Medium (中风险)</SelectItem>
                      <SelectItem value="Low">Low (低风险)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>触发场景描述</Label>
                  <Input value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} placeholder="例如：当发起超过 50,000 元的退款申请时" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditOpen(false)}>取消</Button>
                <Button onClick={handleEditSave}>保存</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar: Responsibility Matrix */}
        <aside className="w-64 border-r bg-gray-50/50 flex flex-col shrink-0">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-6">
              {[
                { type: "Capability", label: "业务能力", list: groupedItems.Capability, icon: Activity, color: "text-blue-500" },
                { type: "Process", label: "业务流程", list: groupedItems.Process, icon: GitMerge, color: "text-orange-500" },
                { type: "Entity", label: "业务对象", list: groupedItems.Entity, icon: Box, color: "text-purple-500" },
              ].map(group => (
                <div key={group.type}>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3 px-2 flex items-center justify-between">
                    {group.label}
                    <Badge variant="secondary" className="text-[10px] h-4 px-1 min-w-[1.5rem] justify-center">{group.list.length}</Badge>
                  </h3>
                  <div className="space-y-1">
                    {group.list.map(item => (
                      <button
                        key={item.id}
                        onClick={() => setSelectedItemId(item.id)}
                        className={`w-full text-left px-3 py-2.5 rounded-md text-sm flex items-center gap-3 transition-colors ${
                          selectedItemId === item.id
                            ? "bg-white shadow-sm ring-1 ring-gray-200 text-primary font-medium" 
                            : "hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        <group.icon className={`h-4 w-4 ${group.color}`} />
                        <div className="flex-1 truncate">
                          <div className="flex items-center justify-between">
                            <span className="truncate">{item.name}</span>
                            {item.riskLevel === "High" && (
                              <Siren className="h-3 w-3 text-red-500 shrink-0 ml-1" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {item.config ? (
                              <span className="text-xs text-green-600 bg-green-50 px-1 rounded flex items-center gap-1">
                                <UserCheck className="h-3 w-3" />
                                已分配
                              </span>
                            ) : (
                              <span className="text-xs text-red-500 bg-red-50 px-1 rounded flex items-center gap-1">
                                <AlertOctagon className="h-3 w-3" />
                                待定责
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                    {group.list.length === 0 && (
                      <div className="px-3 py-2 text-xs text-gray-400 italic">暂无{group.label}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </aside>

        {/* Main Configuration Area */}
        <div className="flex-1 flex flex-col">
          {selectedItem ? (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Detail Header */}
              <div className="h-16 border-b bg-white flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <ShieldAlert className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900">{selectedItem.name}</h2>
                      <Badge variant="secondary" className="font-normal text-xs uppercase tracking-wider">
                        {selectedItem.type}
                      </Badge>
                      {selectedItem.riskLevel === "High" && (
                        <span className="flex items-center text-red-600 text-xs font-bold gap-1 bg-red-50 px-2 py-0.5 rounded-full">
                          <Siren className="h-3 w-3" />
                          高风险
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate max-w-[500px]">{selectedItem.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleEditStart} className="text-gray-700">
                      <Pencil className="h-4 w-4 mr-2" />
                      编辑
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50 border-red-200">
                          <Trash2 className="h-4 w-4 mr-2" />
                          删除
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>确认删除？</AlertDialogTitle>
                          <AlertDialogDescription>
                            即将删除该责任配置项。此操作不可恢复。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            确认删除
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
            </div>

            <ScrollArea className="flex-1 bg-slate-50">
                <div className="p-8 max-w-4xl mx-auto space-y-6">
                  
                  <Card className={cn(
                    "transition-all",
                    !selectedItem.config?.primaryOwner && "border-red-300 shadow-md shadow-red-100"
                  )}>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">第一责任人 (Primary Owner)</CardTitle>
                          <CardDescription>谁对该业务结果直接负责？</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 bg-white p-4 rounded-lg border">
                          <span className="text-gray-500 text-sm whitespace-nowrap">由</span>
                          <Select 
                            value={selectedItem.config?.primaryOwner || ""} 
                            onValueChange={(v) => handleConfigUpdate("primaryOwner", v)}
                          >
                            <SelectTrigger className="w-[300px]">
                              <SelectValue placeholder="选择责任角色..." />
                            </SelectTrigger>
                            <SelectContent>
                              {MOCK_ROLES.map(role => (
                                <SelectItem key={role} value={role}>{role}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <span className="text-gray-500 text-sm">负责处理与兜底。</span>
                        </div>
                        {!selectedItem.config?.primaryOwner && (
                          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-md">
                            <AlertTriangle className="h-4 w-4" />
                            错误：高风险业务必须分配第一责任人，否则 Agent 无权执行。
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Arrow Connector */}
                  <div className="flex justify-center -my-2 relative z-10">
                    <div className="bg-gray-100 rounded-full p-1 border-4 border-gray-50">
                      <Clock className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  {/* 2. SLA & Timeout */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="flex-1 text-right text-sm text-gray-500">
                          若超过时间阈值
                        </div>
                        <div className="w-[200px] flex items-center gap-2">
                          <Input 
                            type="number" 
                            value={selectedItem.config?.slaThreshold || 24} 
                            onChange={(e) => handleConfigUpdate("slaThreshold", parseInt(e.target.value))}
                            className="text-center font-bold"
                          />
                          <span className="text-sm font-medium">小时</span>
                        </div>
                        <div className="flex-1 text-sm text-gray-500">
                          未得到有效处理
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Arrow Connector */}
                  <div className="flex justify-center -my-2 relative z-10">
                    <div className="bg-gray-100 rounded-full p-1 border-4 border-gray-50">
                      <ArrowUpCircle className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  {/* 3. Escalation */}
                  <Card className={cn(
                    "transition-all",
                    selectedItem.config?.primaryOwner && !selectedItem.config?.escalationOwner && "border-orange-300 shadow-sm"
                  )}>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <div className="bg-purple-100 p-2 rounded-lg">
                          <Building2 className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">升级路径 (Escalation)</CardTitle>
                          <CardDescription>超时或异常情况下的最终兜底方。</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 bg-white p-4 rounded-lg border">
                          <span className="text-gray-500 text-sm whitespace-nowrap">自动升级至</span>
                          <Select 
                            value={selectedItem.config?.escalationOwner || ""} 
                            onValueChange={(v) => handleConfigUpdate("escalationOwner", v)}
                          >
                            <SelectTrigger className="w-[300px]">
                              <SelectValue placeholder="选择上级角色/部门..." />
                            </SelectTrigger>
                            <SelectContent>
                              {MOCK_ROLES.map(role => (
                                <SelectItem key={role} value={role}>{role}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {selectedItem.config?.primaryOwner && !selectedItem.config?.escalationOwner && (
                          <div className="flex items-center gap-2 text-orange-600 text-sm bg-orange-50 p-3 rounded-md">
                            <AlertTriangle className="h-4 w-4" />
                            警告：建议配置升级路径，以防止业务死锁。
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Summary Statement */}
                  {selectedItem.config?.primaryOwner && (
                    <div className="mt-8 p-6 bg-slate-900 text-slate-200 rounded-xl text-center space-y-2 shadow-xl animate-in fade-in slide-in-from-bottom-4">
                      <h4 className="text-xs uppercase tracking-widest text-slate-500 font-bold">责任协议摘要</h4>
                      <p className="text-lg font-medium leading-relaxed">
                        “对于 <span className="text-white font-bold underline decoration-blue-500">{selectedItem.name}</span>，
                        首要责任人为 <span className="text-white font-bold">{selectedItem.config.primaryOwner}</span>。
                        <br/>
                        若 <span className="text-white font-bold text-orange-400">{selectedItem.config.slaThreshold}小时</span> 内未决，
                        将强制升级至 <span className="text-white font-bold text-purple-400">{selectedItem.config.escalationOwner || "未配置 (风险)"}</span>。”
                      </p>
                    </div>
                  )}

                </div>
              </ScrollArea>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 p-8">
              <div className="max-w-4xl w-full grid grid-cols-3 gap-6 mb-12">
                <Card className="bg-red-50 border-red-100 shadow-sm">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl font-bold text-red-600 mb-2">{stats.unassignedHighRiskCount}</div>
                    <div className="text-sm text-red-700 font-medium">高风险未定责</div>
                  </CardContent>
                </Card>
                <Card className="bg-orange-50 border-orange-100 shadow-sm">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl font-bold text-orange-600 mb-2">{stats.noEscalationCount}</div>
                    <div className="text-sm text-orange-700 font-medium">无升级路径</div>
                  </CardContent>
                </Card>
                <Card className="bg-blue-50 border-blue-100 shadow-sm">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">{stats.coverage}%</div>
                    <div className="text-sm text-blue-700 font-medium">责任覆盖率</div>
                  </CardContent>
                </Card>
              </div>
              <Briefcase className="h-16 w-16 text-gray-200 mb-4" />
              <p className="text-lg font-medium text-gray-500">选择一项业务资产进行定责</p>
              <p className="text-sm mt-2 max-w-md text-center text-gray-400">
                所有高风险的能力、流程和对象都必须明确“出事谁兜底”，否则 Agent 无法获得执行授权。
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResponsibilityWorkbench;
