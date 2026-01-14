import React, { useState, useMemo } from "react";
import { 
  Layers, 
  Plus, 
  Search, 
  Filter, 
  ArrowRight, 
  Zap, 
  GitMerge, 
  Scale, 
  Database, 
  Radio, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Eye,
  Activity,
  Code,
  Trash2,
  Pencil,
  FileText
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { cn } from "@/lib/utils";

// --- Types ---

type EventSourceType = "StateChange" | "RuleTrigger" | "FieldChange";

interface BusinessEvent {
  id: string;
  code: string; // System generated: EVT_ORDER_PAID
  name: string; // System generated: 订单已支付
  description: string; // Natural language
  sourceType: EventSourceType;
  
  // Source Details (Structured)
  sourceContext: {
    entityId: string;
    entityName: string;
    detailId: string; // State ID, Rule ID, or Field Name
    detailName: string; 
  };

  // Permissions
  allowAgentSubscription: boolean;
  allowExternalSubscription: boolean;
  
  // Metadata
  isActive: boolean;
  createdAt: string;
}

// --- Mock Data ---

const MOCK_ENTITIES = [
  { id: "ent_001", name: "Sales Order" },
  { id: "ent_002", name: "Customer" },
  { id: "ent_003", name: "Product" },
];

const MOCK_SOURCES = {
  StateChange: [
    { id: "st_001", name: "Created -> Paid", entityId: "ent_001", entityName: "Sales Order" },
    { id: "st_002", name: "Paid -> Shipped", entityId: "ent_001", entityName: "Sales Order" },
    { id: "st_003", name: "New -> Verified", entityId: "ent_002", entityName: "Customer" },
  ],
  RuleTrigger: [
    { id: "rule_001", name: "High Value Order (> 10k)", entityId: "ent_001", entityName: "Sales Order" },
    { id: "rule_002", name: "Credit Score Low", entityId: "ent_002", entityName: "Customer" },
  ],
  FieldChange: [
    { id: "field_001", name: "Shipping Address", entityId: "ent_001", entityName: "Sales Order" },
    { id: "field_002", name: "VIP Level", entityId: "ent_002", entityName: "Customer" },
  ]
};

const INITIAL_EVENTS: BusinessEvent[] = [
  {
    id: "evt_001",
    code: "EVT_ORDER_PAID",
    name: "订单已支付",
    description: "当 [Sales Order] 的状态变为 [Paid] 时触发",
    sourceType: "StateChange",
    sourceContext: {
      entityId: "ent_001",
      entityName: "Sales Order",
      detailId: "st_001",
      detailName: "Created -> Paid"
    },
    allowAgentSubscription: true,
    allowExternalSubscription: false,
    isActive: true,
    createdAt: "2024-12-01"
  },
  {
    id: "evt_002",
    code: "EVT_HIGH_RISK_CUST",
    name: "高风险客户预警",
    description: "当规则 [Credit Score Low] 被触发时",
    sourceType: "RuleTrigger",
    sourceContext: {
      entityId: "ent_002",
      entityName: "Customer",
      detailId: "rule_002",
      detailName: "Credit Score Low"
    },
    allowAgentSubscription: true,
    allowExternalSubscription: true,
    isActive: true,
    createdAt: "2024-12-05"
  }
];

// --- Components ---

const BusinessEventsWorkbench = () => {
  const [events, setEvents] = useState<BusinessEvent[]>(INITIAL_EVENTS);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(INITIAL_EVENTS[0].id);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  // Creation Wizard State
  const [newEventType, setNewEventType] = useState<EventSourceType>("StateChange");
  const [newEventEntityId, setNewEventEntityId] = useState<string>("");
  const [newEventSourceId, setNewEventSourceId] = useState<string>("");

  const selectedEvent = useMemo(() => 
    events.find(e => e.id === selectedEventId), 
    [events, selectedEventId]
  );

  const groupedEvents = useMemo(() => {
    const filtered = events.filter(e => 
      e.name.includes(searchQuery) || 
      e.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.sourceContext.entityName.includes(searchQuery)
    );
    return {
      StateChange: filtered.filter(e => e.sourceType === "StateChange"),
      RuleTrigger: filtered.filter(e => e.sourceType === "RuleTrigger"),
      FieldChange: filtered.filter(e => e.sourceType === "FieldChange"),
    };
  }, [events, searchQuery]);

  // Filter sources based on selection
  const availableSources = MOCK_SOURCES[newEventType].filter(
    s => !newEventEntityId || s.entityId === newEventEntityId
  );

  const handleCreateEvent = () => {
    if (!newEventSourceId) return;

    const source = availableSources.find(s => s.id === newEventSourceId);
    if (!source) return;

    const code = `EVT_${source.entityName.toUpperCase().replace(/\s+/g, "_")}_${Math.floor(Math.random() * 1000)}`;
    const name = `${source.entityName} - ${source.name}`; // Simple generation logic

    const newEvent: BusinessEvent = {
      id: `evt_${Date.now()}`,
      code,
      name,
      description: `系统自动生成：基于 ${newEventType} 的事件订阅`,
      sourceType: newEventType,
      sourceContext: {
        entityId: source.entityId,
        entityName: source.entityName,
        detailId: source.id,
        detailName: source.name
      },
      allowAgentSubscription: false,
      allowExternalSubscription: false,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setEvents([newEvent, ...events]);
    setSelectedEventId(newEvent.id);
    setIsCreateOpen(false);
    
    // Reset form
    setNewEventType("StateChange");
    setNewEventEntityId("");
    setNewEventSourceId("");
  };

  const updateEvent = (key: keyof BusinessEvent, value: any) => {
    if (!selectedEventId) return;
    setEvents(events.map(e => e.id === selectedEventId ? { ...e, [key]: value } : e));
  };

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", description: "" });

  const handleEditStart = () => {
    if (!selectedEvent) return;
    setEditForm({
      name: selectedEvent.name,
      description: selectedEvent.description
    });
    setIsEditOpen(true);
  };

  const handleEditSave = () => {
    if (!selectedEventId) return;
    setEvents(events.map(e => e.id === selectedEventId ? {
      ...e,
      name: editForm.name,
      description: editForm.description
    } : e));
    setIsEditOpen(false);
  };

  const handleDeleteEvent = () => {
    if (!selectedEventId) return;
    setEvents(events.filter(e => e.id !== selectedEventId));
    setSelectedEventId(null);
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b flex items-center px-6 justify-between shrink-0 bg-white">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          <h1 className="font-semibold text-lg">业务事件工作台</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="搜索事件名称、代码..." 
              className="pl-8 h-9" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                订阅新事件
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>订阅业务信号</DialogTitle>
                <DialogDescription>
                  事件必须由系统内明确的业务变化触发。请选择信号来源。
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>1. 信号类型</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <div 
                      className={cn(
                        "border rounded-md p-3 cursor-pointer hover:bg-gray-50 flex flex-col items-center gap-2 text-center transition-colors",
                        newEventType === "StateChange" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-gray-200"
                      )}
                      onClick={() => setNewEventType("StateChange")}
                    >
                      <GitMerge className="h-5 w-5 text-blue-500" />
                      <span className="text-xs font-medium">状态变更</span>
                    </div>
                    <div 
                      className={cn(
                        "border rounded-md p-3 cursor-pointer hover:bg-gray-50 flex flex-col items-center gap-2 text-center transition-colors",
                        newEventType === "RuleTrigger" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-gray-200"
                      )}
                      onClick={() => setNewEventType("RuleTrigger")}
                    >
                      <Scale className="h-5 w-5 text-orange-500" />
                      <span className="text-xs font-medium">规则触发</span>
                    </div>
                    <div 
                      className={cn(
                        "border rounded-md p-3 cursor-pointer hover:bg-gray-50 flex flex-col items-center gap-2 text-center transition-colors",
                        newEventType === "FieldChange" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-gray-200"
                      )}
                      onClick={() => setNewEventType("FieldChange")}
                    >
                      <Database className="h-5 w-5 text-purple-500" />
                      <span className="text-xs font-medium">字段变化</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>2. 业务对象 (Context)</Label>
                  <Select value={newEventEntityId} onValueChange={setNewEventEntityId}>
                    <SelectTrigger>
                      <SelectValue placeholder="筛选特定对象..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部对象</SelectItem>
                      {MOCK_ENTITIES.map(e => (
                        <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>3. 选择具体信号源</Label>
                  <Select value={newEventSourceId} onValueChange={setNewEventSourceId}>
                    <SelectTrigger className={!newEventSourceId ? "border-dashed" : ""}>
                      <SelectValue placeholder="选择触发条件..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSources.map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          <span className="font-mono text-xs text-gray-400 mr-2">[{s.entityName}]</span>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {newEventSourceId && (
                  <div className="bg-gray-50 p-3 rounded-md border text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-500">预览事件代码:</span>
                      <Badge variant="outline" className="font-mono text-xs">EVT_AUTO_GEN_...</Badge>
                    </div>
                    <div className="text-gray-600">
                      系统将自动注册此事件，并允许下游系统订阅。
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>取消</Button>
                <Button onClick={handleCreateEvent} disabled={!newEventSourceId}>确认订阅</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar: Event List */}
        <aside className="w-64 border-r bg-gray-50/50 flex flex-col shrink-0">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-6">
              {[
                { type: "StateChange", label: "状态变更", list: groupedEvents.StateChange, icon: GitMerge, color: "text-blue-500" },
                { type: "RuleTrigger", label: "规则触发", list: groupedEvents.RuleTrigger, icon: Scale, color: "text-orange-500" },
                { type: "FieldChange", label: "字段变化", list: groupedEvents.FieldChange, icon: Database, color: "text-purple-500" },
              ].map(group => (
                <div key={group.type}>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3 px-2 flex items-center justify-between">
                    {group.label}
                    <Badge variant="secondary" className="text-[10px] h-4 px-1 min-w-[1.5rem] justify-center">{group.list.length}</Badge>
                  </h3>
                  <div className="space-y-1">
                    {group.list.map(event => (
                      <button
                        key={event.id}
                        onClick={() => setSelectedEventId(event.id)}
                        className={`w-full text-left px-3 py-2.5 rounded-md text-sm flex items-center gap-3 transition-colors ${
                          selectedEventId === event.id
                            ? "bg-white shadow-sm ring-1 ring-gray-200 text-primary font-medium" 
                            : "hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        <group.icon className={`h-4 w-4 ${group.color}`} />
                        <div className="flex-1 truncate">
                          <div className="truncate">{event.name}</div>
                          <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
                            <span>{event.code}</span>
                            {!event.isActive && <span className="text-red-400">(Inactive)</span>}
                          </div>
                        </div>
                      </button>
                    ))}
                    {group.list.length === 0 && (
                      <div className="px-3 py-2 text-xs text-gray-400 italic">暂无事件</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </aside>

        {/* Right Content */}
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
          {selectedEvent ? (
            <ScrollArea className="flex-1">
              <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant="outline" className="font-mono text-slate-500">
                        {selectedEvent.code}
                      </Badge>
                      <Badge className={selectedEvent.isActive ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-gray-100 text-gray-700 hover:bg-gray-100"}>
                        {selectedEvent.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4 leading-snug">
                      {selectedEvent.name}
                    </h2>
                    <p className="text-sm text-slate-500 max-w-2xl">
                      {selectedEvent.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 mr-4">
                       <span className="text-sm text-gray-500">状态</span>
                       <Switch 
                         checked={selectedEvent.isActive}
                         onCheckedChange={(c) => updateEvent("isActive", c)}
                       />
                    </div>
                    <Separator orientation="vertical" className="h-6" />
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
                          <AlertDialogTitle>确认删除事件？</AlertDialogTitle>
                          <AlertDialogDescription>
                            即将删除事件“{selectedEvent.name}”。如果有外部系统订阅此事件，删除可能导致集成中断。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteEvent} className="bg-red-600 hover:bg-red-700">确认删除</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>编辑事件信息</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>事件名称</Label>
                        <Input 
                          value={editForm.name} 
                          onChange={e => setEditForm({...editForm, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>描述</Label>
                        <Input 
                          value={editForm.description} 
                          onChange={e => setEditForm({...editForm, description: e.target.value})}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsEditOpen(false)}>取消</Button>
                      <Button onClick={handleEditSave}>保存</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <div className="space-y-6">
                  {/* Source Information (Read Only) */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Radio className="h-5 w-5 text-primary" />
                        <CardTitle className="text-base">事件来源 (只读)</CardTitle>
                      </div>
                      <CardDescription>此事件由以下业务信号触发，不可手动修改。</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-500 uppercase">触发类型</Label>
                        <div className="flex items-center gap-2 font-medium text-gray-900">
                          {selectedEvent.sourceType === "StateChange" && <GitMerge className="h-4 w-4 text-blue-500" />}
                          {selectedEvent.sourceType === "RuleTrigger" && <Scale className="h-4 w-4 text-orange-500" />}
                          {selectedEvent.sourceType === "FieldChange" && <Database className="h-4 w-4 text-purple-500" />}
                          {selectedEvent.sourceType}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-500 uppercase">所属对象</Label>
                        <div className="font-medium text-gray-900">{selectedEvent.sourceContext.entityName}</div>
                      </div>
                      <div className="col-span-2 space-y-1 bg-gray-50 p-3 rounded border">
                        <Label className="text-xs text-gray-500 uppercase">触发条件详情</Label>
                        <div className="font-mono text-sm text-gray-700 mt-1">
                          {`WHEN ${selectedEvent.sourceContext.entityName}.${selectedEvent.sourceType} == "${selectedEvent.sourceContext.detailName}"`}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Subscription Control */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-primary" />
                        <CardTitle className="text-base">订阅权限控制</CardTitle>
                      </div>
                      <CardDescription>控制哪些系统或角色可以监听此信号。</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">允许 Agent 订阅</Label>
                          <p className="text-sm text-gray-500">智能体是否可以基于此事件触发自动化任务</p>
                        </div>
                        <Switch 
                          checked={selectedEvent.allowAgentSubscription}
                          onCheckedChange={(c) => updateEvent("allowAgentSubscription", c)}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">允许外部系统订阅 (Webhook)</Label>
                          <p className="text-sm text-gray-500">是否通过消息队列推送给第三方系统</p>
                        </div>
                        <Switch 
                          checked={selectedEvent.allowExternalSubscription}
                          onCheckedChange={(c) => updateEvent("allowExternalSubscription", c)}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Payload Preview */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Code className="h-5 w-5 text-primary" />
                        <CardTitle className="text-base">数据结构预览</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-slate-950 text-slate-50 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                        <pre>{JSON.stringify({
                          eventId: "evt_123456789",
                          eventType: selectedEvent.code,
                          timestamp: "2024-12-31T12:00:00Z",
                          source: {
                            type: selectedEvent.sourceType,
                            entity: selectedEvent.sourceContext.entityName,
                            id: "obj_xxx"
                          },
                          payload: {
                            // Dynamic fields based on entity
                            status: "Paid",
                            amount: 120.00,
                            currency: "CNY"
                          }
                        }, null, 2)}</pre>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </ScrollArea>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <Layers className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg">选择左侧事件查看详情，或点击右上角订阅新事件</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default BusinessEventsWorkbench;
