import { useState, useMemo } from "react";
import DecisionEventListItem, { DecisionEvent } from "@/components/newIncident/DecisionEventListItem";
import { DecisionTraceLayout } from "@/components/decisionTrace/DecisionTraceLayout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ChevronDown, ChevronUp, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { format, subDays, isSameDay, isAfter } from "date-fns";

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
      type: "客户"
    },
    ai_initial_judgement: "高购买意向 · 交期敏感",
    status: "AI_ANALYZED",
    occurred_at: "2026-01-27 10:32",
    ai_analyzed_at: "2026-01-27 10:33",
    has_human_override: false,
    source_url: "https://mail.company.com/inbox/evt_001",
    sales_rep: "张三",
    team: "销售一部",
    trace_status: "IN_PROGRESS",
    current_step: "停留在步骤 3"
  },
  {
    id: "evt_002",
    type: "CUSTOMER_EMAIL_RECEIVED",
    type_label: "客户发送了新邮件",
    icon: "mail",
    customer: {
      id: "cus_456",
      name: "B 科技",
      type: "客户"
    },
    ai_initial_judgement: "询价行为 · 存在价格犹豫",
    status: "HUMAN_REVIEWED",
    occurred_at: "2026-01-27 09:10",
    ai_analyzed_at: "2026-01-27 09:11",
    has_human_override: true,
    source_url: "https://mail.company.com/inbox/evt_002",
    sales_rep: "李四",
    team: "销售二部",
    trace_status: "WAITING_CONFIRMATION",
    current_step: "停留在步骤 4"
  },
  {
    id: "evt_003",
    type: "CUSTOMER_WEB_ACTIVITY",
    type_label: "客户在网站上产生新行为",
    icon: "web",
    customer: {
      id: "cus_789",
      name: "C Industries",
      type: "销售线索"
    },
    ai_initial_judgement: "频繁查看价格页 · 存在决策迟疑",
    status: "NEW",
    occurred_at: "2026-01-27 08:45",
    ai_analyzed_at: null,
    has_human_override: false,
    source_url: "https://analytics.company.com/sessions/evt_003",
    sales_rep: "王五",
    team: "市场部",
    trace_status: "COMPLETED",
    current_step: "已完成"
  },
  {
    id: "evt_004",
    type: "CUSTOMER_EMAIL_RECEIVED",
    type_label: "客户发送了新邮件",
    icon: "mail",
    customer: {
      id: "cus_101",
      name: "D 集团",
      type: "VIP 客户"
    },
    ai_initial_judgement: "紧急订单需求 · 需要优先处理",
    status: "AI_ANALYZED",
    occurred_at: "2026-01-27 11:15",
    ai_analyzed_at: "2026-01-27 11:16",
    has_human_override: false,
    source_url: "https://mail.company.com/inbox/evt_004",
    sales_rep: "赵六",
    team: "大客户部",
    trace_status: "IN_PROGRESS",
    current_step: "停留在步骤 2"
  },
  {
    id: "evt_005",
    type: "CUSTOMER_WEB_ACTIVITY",
    type_label: "客户在网站上产生新行为",
    icon: "web",
    customer: {
      id: "cus_202",
      name: "E 科技",
      type: "潜在客户"
    },
    ai_initial_judgement: "浏览产品对比页 · 竞品调研",
    status: "NEW",
    occurred_at: "2026-01-27 13:20",
    ai_analyzed_at: null,
    has_human_override: false,
    source_url: "https://analytics.company.com/sessions/evt_005",
    sales_rep: "孙七",
    team: "市场部",
    trace_status: "PENDING",
    current_step: "等待触发"
  },
  {
    id: "evt_006",
    type: "SYSTEM_FLAG_RAISED",
    type_label: "系统风险预警",
    icon: "alert-triangle",
    customer: {
      id: "cus_303",
      name: "F 制造",
      type: "客户"
    },
    ai_initial_judgement: "信用额度不足 · 支付风险",
    status: "HUMAN_REVIEWED",
    occurred_at: "2026-01-26 15:40",
    ai_analyzed_at: "2026-01-26 15:41",
    has_human_override: true,
    source_url: "https://erp.company.com/alerts/evt_006",
    sales_rep: "周八",
    team: "财务部",
    trace_status: "BLOCKED",
    current_step: "暂停中"
  },
  {
    id: "evt_007",
    type: "STATUS_CHANGED",
    type_label: "客户状态变更",
    icon: "refresh-cw",
    customer: {
      id: "cus_404",
      name: "G 贸易",
      type: "合作伙伴"
    },
    ai_initial_judgement: "合同即将到期 · 续约提醒",
    status: "ACTION_TAKEN",
    occurred_at: "2026-01-25 09:30",
    ai_analyzed_at: "2026-01-25 09:32",
    has_human_override: false,
    source_url: "https://crm.company.com/changes/evt_007",
    sales_rep: "吴九",
    team: "渠道部",
    trace_status: "COMPLETED",
    current_step: "已完成"
  },
  {
    id: "evt_008",
    type: "CUSTOMER_EMAIL_RECEIVED",
    type_label: "客户发送了新邮件",
    icon: "mail",
    customer: {
      id: "cus_505",
      name: "H 实业",
      type: "客户"
    },
    ai_initial_judgement: "产品质量投诉 · 情绪激动",
    status: "AI_ANALYZED",
    occurred_at: "2026-01-27 14:50",
    ai_analyzed_at: "2026-01-27 14:51",
    has_human_override: false,
    source_url: "https://mail.company.com/inbox/evt_008",
    sales_rep: "郑十",
    team: "客服部",
    trace_status: "IN_PROGRESS",
    current_step: "停留在步骤 1"
  },
  {
    id: "evt_009",
    type: "CUSTOMER_WEB_ACTIVITY",
    type_label: "客户在网站上产生新行为",
    icon: "web",
    customer: {
      id: "cus_606",
      name: "I 网络",
      type: "销售线索"
    },
    ai_initial_judgement: "下载技术白皮书 · 技术评估阶段",
    status: "NEW",
    occurred_at: "2026-01-27 16:10",
    ai_analyzed_at: null,
    has_human_override: false,
    source_url: "https://analytics.company.com/sessions/evt_009",
    sales_rep: "陈十一",
    team: "售前部",
    trace_status: "PENDING",
    current_step: "等待触发"
  },
  {
    id: "evt_010",
    type: "SYSTEM_FLAG_RAISED",
    type_label: "系统异常标记",
    icon: "alert-circle",
    customer: {
      id: "cus_707",
      name: "J 控股",
      type: "VIP 客户"
    },
    ai_initial_judgement: "异常登录行为 · 安全风险",
    status: "DISMISSED",
    occurred_at: "2026-01-24 23:45",
    ai_analyzed_at: "2026-01-24 23:46",
    has_human_override: true,
    source_url: "https://security.company.com/alerts/evt_010",
    sales_rep: "刘十二",
    team: "安全部",
    trace_status: "CANCELLED",
    current_step: "已取消"
  }
];

export default function NewEventsCopy() {
  const [selectedEventId, setSelectedEventId] = useState<string | null>("evt_001");
  


  // Filters State
  const [eventType, setEventType] = useState<string>("all");
  const [eventStatusFilter, setEventStatusFilter] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("custom");
  const [customerSearch, setCustomerSearch] = useState<string>("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [aiTagFilter, setAiTagFilter] = useState<string>("all");
  const [humanOverrideFilter, setHumanOverrideFilter] = useState<string>("all");

  // State for decision trace handled in DecisionTraceLayout

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
            <div className="text-xs text-slate-400 font-mono">{filteredEvents.length} 项</div>
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
                  <SelectItem value="NEW">新建</SelectItem>
                  <SelectItem value="AI_ANALYZED">AI 已分析</SelectItem>
                  <SelectItem value="HUMAN_REVIEWED">人工已复核</SelectItem>
                  <SelectItem value="ACTION_TAKEN">已执行</SelectItem>
                  <SelectItem value="DISMISSED">已忽略</SelectItem>
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
          <DecisionTraceLayout eventId={selectedEventId} />
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
