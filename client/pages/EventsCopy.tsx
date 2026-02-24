import { useState, useMemo, useEffect } from "react";
import DecisionEventListItem, { DecisionEvent } from "@/components/incidentCopy/DecisionEventListItem";
import EventHeaderCard from "@/components/incidentCopy/EventHeaderCard";
import GraphSliceLayer from "@/components/incidentCopy/GraphSliceLayer";
import SemanticSummaryLayer from "@/components/incidentCopy/SemanticSummaryLayer";
import SummaryBuilderLayer from "@/components/incidentCopy/SummaryBuilderLayer";
import ExecutionLayer from "@/components/incidentCopy/ExecutionLayer";
import CollapsibleLayer from "@/components/incidentCopy/CollapsibleLayer";
import StickyActionBar, { EventActionStatus } from "@/components/incidentCopy/StickyActionBar";
import DecisionExecutionTab, { ActionItem } from "@/components/incidentCopy/tabs/DecisionExecutionTab";
import ExecutionResultTab from "@/components/incidentCopy/tabs/ExecutionResultTab";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, ChevronDown, ChevronUp, Filter, History, PlayCircle, GitCommit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { format, subDays, isSameDay, isAfter, subHours, subMinutes } from "date-fns";

// Mock Data based on user requirements
const mockDecisionEvents: DecisionEvent[] = [
  {
    id: "evt_001",
    type: "CUSTOMER_EMAIL_RECEIVED",
    type_label: "客户发送了新邮件",
    icon: "mail",
    customer: {
      id: "cus_123",
      name: "A 公司",
      type: "Customer"
    },
    ai_initial_judgement: "高购买意向 · 交期敏感",
    status: "AI_ANALYZED",
    occurred_at: format(subMinutes(new Date(), 30), "yyyy-MM-dd HH:mm"),
    ai_analyzed_at: format(subMinutes(new Date(), 29), "yyyy-MM-dd HH:mm"),
    has_human_override: false,
    source_url: "https://mail.company.com/inbox/evt_001",
    sales_rep: "张三",
    team: "销售一部"
  },
  {
    id: "evt_002",
    type: "CUSTOMER_EMAIL_RECEIVED",
    type_label: "客户发送了新邮件",
    icon: "mail",
    customer: {
      id: "cus_456",
      name: "B 科技",
      type: "Customer"
    },
    ai_initial_judgement: "询价行为 · 存在价格犹豫",
    status: "HUMAN_REVIEWED",
    occurred_at: format(subHours(new Date(), 2), "yyyy-MM-dd HH:mm"),
    ai_analyzed_at: format(subHours(new Date(), 1), "yyyy-MM-dd HH:mm"),
    has_human_override: true,
    source_url: "https://mail.company.com/inbox/evt_002",
    sales_rep: "李四",
    team: "销售二部"
  },
  {
    id: "evt_003",
    type: "CUSTOMER_WEB_ACTIVITY",
    type_label: "客户在网站上产生新行为",
    icon: "web",
    customer: {
      id: "cus_789",
      name: "C Industries",
      type: "Lead"
    },
    ai_initial_judgement: "频繁查看价格页 · 存在决策迟疑",
    status: "NEW",
    occurred_at: format(subHours(new Date(), 4), "yyyy-MM-dd HH:mm"),
    ai_analyzed_at: null,
    has_human_override: false,
    source_url: "https://analytics.company.com/sessions/evt_003",
    sales_rep: "王五",
    team: "市场部"
  }
];

// Helper removed


export default function Index() {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  
  // Tabs State
  const [activeTab, setActiveTab] = useState("trace");
  const [executedItems, setExecutedItems] = useState<ActionItem[]>([]);

  // Filters State
  const [eventType, setEventType] = useState<string>("all");
  const [eventStatusFilter, setEventStatusFilter] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("custom");
  const [customerSearch, setCustomerSearch] = useState<string>("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [aiTagFilter, setAiTagFilter] = useState<string>("all");
  const [humanOverrideFilter, setHumanOverrideFilter] = useState<string>("all");

  // Shared state for Layer 1 & 2 interaction
  const [highlightedFactId, setHighlightedFactId] = useState<string | null>(null);
  const [decisionStatus, setDecisionStatus] = useState<EventActionStatus>("AI_ANALYZED");
  
  // Collapsible Layers State
  const [expandedLayers, setExpandedLayers] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: false,
    4: false
  });

  // Auto-collapse logic based on stage
  useEffect(() => {
    if (decisionStatus === "ACTION_TAKEN") {
      setExpandedLayers({ 1: false, 2: false, 3: false, 4: true });
    } else if (decisionStatus === "HUMAN_REVIEWED") {
      setExpandedLayers({ 1: false, 2: false, 3: true, 4: false });
    } else {
      // NEW or AI_ANALYZED
      setExpandedLayers({ 1: true, 2: true, 3: false, 4: false });
    }
  }, [decisionStatus]);

  const toggleLayer = (layerNum: number) => {
    setExpandedLayers(prev => ({ ...prev, [layerNum]: !prev[layerNum] }));
  };

  const isExecuted = decisionStatus === "ACTION_TAKEN";

  const handleExecuteDecision = (items: ActionItem[]) => {
    setExecutedItems(items);
    setDecisionStatus("ACTION_TAKEN");
    setActiveTab("result"); // Auto switch to result tab? Or stay on execution? 
    // Requirement says: "Event status becomes: Executing ... Record a 'Decision Record'".
    // Let's switch to result or just show success. 
    // The requirement implies flow: Decision -> Execution -> Result.
    // Maybe stay on Execution tab but update UI, or switch to Result.
    // Let's switch to Result for now to show the loop closed.
  };

  // Filter Logic
  const filteredEvents = useMemo(() => {
    return mockDecisionEvents.filter(event => {
      // Event Type
      if (eventType !== "all" && event.type !== eventType) return false;
      
      // Event Status
      if (eventStatusFilter !== "all" && event.status !== eventStatusFilter) return false;
      
      // Time Range
      const eventDate = new Date(event.occurred_at);
      const today = new Date();
      if (timeRange === "today") {
        if (!isSameDay(eventDate, today)) return false;
      } else if (timeRange === "3days") {
        if (!isAfter(eventDate, subDays(today, 3))) return false;
      } else if (timeRange === "7days") {
        if (!isAfter(eventDate, subDays(today, 7))) return false;
      }
      
      // Customer Search
      if (customerSearch && !event.customer.name.toLowerCase().includes(customerSearch.toLowerCase())) return false;
      
      // Advanced: AI Tag (Simple string match for demo)
      if (aiTagFilter !== "all" && !event.ai_initial_judgement.includes(aiTagFilter)) return false;
      
      // Advanced: Human Override
      if (humanOverrideFilter === "yes" && !event.has_human_override) return false;
      if (humanOverrideFilter === "no" && event.has_human_override) return false;

      return true;
    });
  }, [eventType, eventStatusFilter, timeRange, customerSearch, aiTagFilter, humanOverrideFilter]);

  const selectedEvent = useMemo(() => {
    return mockDecisionEvents.find(e => e.id === selectedEventId);
  }, [selectedEventId]);

  return (
    <div className="flex h-full bg-slate-50">
      {/* Left Sidebar: Filter & List */}
      <div className="w-[400px] flex flex-col border-r border-slate-200 bg-white h-full shadow-sm z-10">
        
        {/* Top Filter Area */}
        <div className="p-4 border-b border-slate-200 bg-white z-20 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800 tracking-tight">事件概览</h2>
            <div className="text-xs text-slate-400 font-mono">{filteredEvents.length} items</div>
          </div>

          <div className="space-y-3">
            {/* Primary Filters Grid */}
            <div className="grid grid-cols-2 gap-2">
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger className="h-8 text-xs bg-slate-50 border-slate-200">
                  <SelectValue placeholder="事件类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有类型</SelectItem>
                  <SelectItem value="CUSTOMER_EMAIL_RECEIVED">新邮件</SelectItem>
                  <SelectItem value="CUSTOMER_WEB_ACTIVITY">网站行为</SelectItem>
                  <SelectItem value="SYSTEM_FLAG_RAISED">系统标记</SelectItem>
                  <SelectItem value="STATUS_CHANGED">状态变化</SelectItem>
                </SelectContent>
              </Select>

              <Select value={eventStatusFilter} onValueChange={setEventStatusFilter}>
                <SelectTrigger className="h-8 text-xs bg-slate-50 border-slate-200">
                  <SelectValue placeholder="事件状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有状态</SelectItem>
                  <SelectItem value="NEW">NEW</SelectItem>
                  <SelectItem value="AI_ANALYZED">AI_ANALYZED</SelectItem>
                  <SelectItem value="HUMAN_REVIEWED">HUMAN_REVIEWED</SelectItem>
                  <SelectItem value="ACTION_TAKEN">ACTION_TAKEN</SelectItem>
                  <SelectItem value="DISMISSED">DISMISSED</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
               <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="h-8 text-xs bg-slate-50 border-slate-200">
                  <SelectValue placeholder="时间范围" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">今天</SelectItem>
                  <SelectItem value="3days">最近 3 天</SelectItem>
                  <SelectItem value="7days">最近 7 天</SelectItem>
                  <SelectItem value="custom">自定义范围</SelectItem>
                </SelectContent>
              </Select>

               <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                <Input 
                  className="h-8 text-xs pl-7 bg-slate-50 border-slate-200" 
                  placeholder="搜索客户..." 
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Advanced Toggle */}
            <div>
              <button 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center text-xs text-slate-500 hover:text-slate-800 transition-colors w-full justify-center py-1 border-t border-slate-50 mt-1"
              >
                {showAdvanced ? <ChevronUp className="w-3 h-3 mr-1" /> : <ChevronDown className="w-3 h-3 mr-1" />}
                高级筛选
              </button>
              
              {showAdvanced && (
                <div className="pt-3 pb-1 space-y-3 animate-in fade-in slide-in-from-top-1">
                   <div className="space-y-1">
                     <label className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">AI 标签</label>
                     <div className="flex flex-wrap gap-1">
                       {["高购买意向", "风险信号", "交期敏感"].map(tag => (
                         <BadgeButton 
                           key={tag} 
                           active={aiTagFilter === tag} 
                           onClick={() => setAiTagFilter(aiTagFilter === tag ? "all" : tag)}
                         >
                           {tag}
                         </BadgeButton>
                       ))}
                     </div>
                   </div>
                   
                   <div className="space-y-1">
                     <label className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">人工修正</label>
                     <div className="flex gap-2">
                       <Select value={humanOverrideFilter} onValueChange={setHumanOverrideFilter}>
                        <SelectTrigger className="h-7 text-xs w-full bg-slate-50">
                          <SelectValue placeholder="全部" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全部</SelectItem>
                          <SelectItem value="yes">有人工修正</SelectItem>
                          <SelectItem value="no">仅 AI 原始判断</SelectItem>
                        </SelectContent>
                      </Select>
                     </div>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* List View */}
        <div className="flex-1 overflow-y-auto bg-white scrollbar-thin scrollbar-thumb-slate-200">
          {filteredEvents.length > 0 ? (
            filteredEvents.map(event => (
              <DecisionEventListItem
                key={event.id}
                event={event}
                isSelected={selectedEventId === event.id}
                onClick={() => setSelectedEventId(event.id)}
              />
            ))
          ) : (
             <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <Filter className="w-8 h-8 mb-2 opacity-20" />
                <span className="text-sm">无匹配事件</span>
             </div>
          )}
        </div>
      </div>

      {/* Right Content: Details */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
        {selectedEventId && selectedEvent ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
            <div className="flex-none px-6 pt-4 border-b border-slate-200 bg-white z-10">
               <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-slate-800">事件详情</span>
                    <span className="text-xs text-slate-400 font-mono">#{selectedEvent.id}</span>
                  </div>
                  <TabsList className="grid w-[400px] grid-cols-3">
                    <TabsTrigger value="trace" className="gap-2 text-xs">
                       <GitCommit className="w-3 h-3" /> 决策轨迹
                    </TabsTrigger>
                    <TabsTrigger value="execution" className="gap-2 text-xs">
                       <PlayCircle className="w-3 h-3" /> 决策执行
                    </TabsTrigger>
                    <TabsTrigger value="result" className="gap-2 text-xs">
                       <History className="w-3 h-3" /> 执行结果
                    </TabsTrigger>
                  </TabsList>
               </div>
            </div>

            <div className="flex-1 overflow-hidden relative bg-slate-50/30">
               <TabsContent value="trace" className="h-full m-0 data-[state=active]:flex flex-col">
                  <div className="flex-1 overflow-y-auto p-3 space-y-3 pb-20">
                    <EventHeaderCard event={selectedEvent} />
                    
                    {/* Layer 1: Graph Slice */}
                    <CollapsibleLayer
                      title="Layer 1: Graph Slice (事实切片)"
                      layerNumber={1}
                      isOpen={expandedLayers[1]}
                      onToggle={() => toggleLayer(1)}
                      status={expandedLayers[1] ? "active" : "completed"}
                      summary={
                        <span>涉及关键实体: <span className="font-semibold text-slate-700">3个</span> ({selectedEvent.customer.name}, {selectedEvent.sales_rep}) · 关联深度: 2层</span>
                      }
                      className="mb-2"
                    >
                       <GraphSliceLayer externalHighlightId={highlightedFactId} />
                    </CollapsibleLayer>

                    {/* Layer 2: Semantic Summary */}
                    <CollapsibleLayer
                      title="Layer 2: Semantic Summary (语义摘要)"
                      layerNumber={2}
                      isOpen={expandedLayers[2]}
                      onToggle={() => toggleLayer(2)}
                      status={expandedLayers[2] ? "active" : "completed"}
                      summary={
                        <div className="flex gap-2">
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-50 text-blue-600 border border-blue-100 font-medium">意图: 物流咨询 (High)</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 border border-slate-200">实体: 3类关键信息</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-orange-50 text-orange-600 border border-orange-100 font-medium">风险: 缺失单号</span>
                        </div>
                      }
                      className="mb-2"
                    >
                       <SemanticSummaryLayer onHighlight={setHighlightedFactId} />
                    </CollapsibleLayer>

                    {/* Layer 3: Summary Builder */}
                    <CollapsibleLayer
                      title="Layer 3: Summary Builder (专家简报)"
                      layerNumber={3}
                      isOpen={expandedLayers[3]}
                      onToggle={() => toggleLayer(3)}
                      status={isExecuted ? "locked" : expandedLayers[3] ? "active" : "completed"}
                      summary={
                        <span>状态: <span className="text-purple-600 font-medium">人工已修订</span> · 4条关键要点 · 4步回复大纲</span>
                      }
                      className="mb-2"
                    >
                       <SummaryBuilderLayer externalLock={isExecuted} />
                    </CollapsibleLayer>

                    {/* Layer 4: AI Execution */}
                    <CollapsibleLayer
                      title="Layer 4: AI Expert Execution (专家建议与执行)"
                      layerNumber={4}
                      isOpen={expandedLayers[4]}
                      onToggle={() => toggleLayer(4)}
                      status={isExecuted ? "completed" : expandedLayers[4] ? "active" : "default"}
                      summary={
                        isExecuted ? 
                        <span className="text-green-600 font-medium">已执行 · 邮件已发送</span> :
                        <span>AI 建议: 2条策略 · <span className="text-orange-500 font-medium">待确认</span></span>
                      }
                      className="mb-20"
                    >
                       <ExecutionLayer 
                         hideActionPanel={true} 
                       />
                    </CollapsibleLayer>
                  </div>

                  {/* Sticky Action Bar */}
                  <StickyActionBar 
                    status={decisionStatus}
                    onAction={(newStatus) => {
                       if (newStatus === 'ACTION_TAKEN') {
                          setActiveTab("execution");
                       } else {
                          setDecisionStatus(newStatus);
                       }
                    }}
                  />
               </TabsContent>

               <TabsContent value="execution" className="h-full m-0 p-0 w-full border-none data-[state=active]:flex flex-col">
                   <DecisionExecutionTab 
                      event={selectedEvent} 
                      onExecute={handleExecuteDecision}
                      isExecuted={isExecuted}
                   />
               </TabsContent>

               <TabsContent value="result" className="h-full m-0 p-0 w-full border-none data-[state=active]:flex flex-col">
                   <ExecutionResultTab 
                      items={executedItems}
                      isExecuted={isExecuted}
                   />
               </TabsContent>
            </div>
          </Tabs>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-300">
            <div className="text-center">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>请选择一个事件查看详情</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BadgeButton({ children, active, onClick }: { children: React.ReactNode, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-2 py-1 rounded text-[10px] border transition-all",
        active 
          ? "bg-slate-800 text-white border-slate-800" 
          : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
      )}
    >
      {children}
    </button>
  );
}
