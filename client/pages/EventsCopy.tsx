import { useState, useMemo, useEffect } from "react";
import { request } from "@/lib/request";
import DecisionEventListItem, { DecisionEvent } from "@/components/incidentCopy/DecisionEventListItem";
import EventHeaderCard from "@/components/incidentCopy/EventHeaderCard";
import GraphSliceLayer from "@/components/incidentCopy/GraphSliceLayer";
import SemanticSummaryLayer from "@/components/incidentCopy/SemanticSummaryLayer";
import SummaryBuilderLayer from "@/components/incidentCopy/SummaryBuilderLayer";
import ExecutionLayer from "@/components/incidentCopy/ExecutionLayer";
import CollapsibleLayer from "@/components/incidentCopy/CollapsibleLayer";
import StickyActionBar, { EventActionStatus } from "@/components/incidentCopy/StickyActionBar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ChevronDown, ChevronUp, Filter, Calendar as CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { format, subDays, isSameDay, isAfter } from "date-fns";
import { DatePicker, Pagination } from "antd";
import dayjs, { Dayjs } from "dayjs";
import events from "./events";

export interface DecisionTraceItem {
  id: string;
  instanceId: string;
  businessId: string;
  businessType: string;
  sourceChannel: string;
  customerId: string;
  customerName: string;
  currentStatus: string;
  gmtCreate: string;
  gmtModified: string;
  tenantId: string;
  actionType?: string | null;
  aiAnalysisResult?: string | null;
  analyzedBy?: string | null;
  decisionRemark?: string | null;
  eventTime?: string | null;
  ownerName?: string | null;
  ownerTeam?: string | null;
  instanceName?: string;
  semanticSummary?: string;
  expertBriefing?: string;
}

// Helper removed

export default function Index() {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [events, setEvents] = useState<DecisionEvent[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters State
  const [eventType, setEventType] = useState<string>("all");
  const [eventStatusFilter, setEventStatusFilter] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("today");
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [customerSearch, setCustomerSearch] = useState<string>("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 20,
    total: 0,
  });
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
    4: false,
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
    setExpandedLayers((prev) => ({ ...prev, [layerNum]: !prev[layerNum] }));
  };

  const isExecuted = decisionStatus === "ACTION_TAKEN";

  // API Call for events
  useEffect(() => {
    const fetchDecisionEvents = async () => {
      setLoading(true);
      try {
        // Calculate dates based on timeRange
        let startDate = dayjs().startOf("day");
        let endDate = dayjs().endOf("day");
        if (timeRange === "3days") {
          startDate = dayjs().subtract(2, "day").startOf("day");
        } else if (timeRange === "7days") {
          startDate = dayjs().subtract(6, "day").startOf("day");
        } else if (timeRange === "custom") {
          if (dateRange?.[0]) startDate = dateRange[0];
          if (dateRange?.[1]) endDate = dateRange[1];
        }

        const res = await request.post("/quote/api/v1/decision/trace/page", {
          pageSize: pagination.pageSize,
          currentPage: pagination.currentPage,
          startDate,
          endDate,
          type: eventType === "all" ? "" : eventType,
          status: eventStatusFilter === "all" ? "" : eventStatusFilter,
        });

        if (res.status === 200 && res.data.data?.records) {
          setPagination((prev) => ({ ...prev, total: res.data.data.total || 0 }));
          const apiList: DecisionTraceItem[] = res.data.data.records;
          const mappedEvents: DecisionEvent[] = apiList.map((item) => ({
            id: item.id,
            type: "CUSTOMER_EMAIL_RECEIVED", // Defaulting for now as API actionType is null
            type_label: item.instanceName || "未知事件",
            icon: "mail", // Defaulting
            customer: {
              id: item.customerId,
              name: item.customerName,
              type: "Customer",
            },
            ai_initial_judgement: item.aiAnalysisResult,
            status: "NEW",
            occurred_at: item.gmtCreate,
            ai_analyzed_at: item.gmtModified,
            has_human_override: !!item.analyzedBy,
            source_url: "",
            sales_rep: item.ownerName || "",
            team: item.ownerTeam || "",
            instanceName: item.instanceName,
            semanticSummary: item.semanticSummary
              ? JSON.parse(item.semanticSummary.replace(/\\(?=[^\\"/bfnrtu])/g, "\\n"))
              : null,
            expertBriefing: item.expertBriefing
              ? JSON.parse(item.expertBriefing.replace(/\\(?=[^\\"/bfnrtu])/g, "\\n"))
              : null,
            instanceId: item.instanceId,
          }));
          setEvents(mappedEvents);
        }
      } catch (error) {
        console.error("Fetch decision events failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDecisionEvents();
  }, [eventType, eventStatusFilter, timeRange, dateRange, pagination.currentPage, pagination.pageSize]);

  const handlePageChange = (page: number, pageSize: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page, pageSize: pageSize }));
  };

  // Reset pagination when filters change (so we don't end up on a non-existent page)
  useEffect(() => {
    if (pagination.currentPage !== 1) {
      setPagination((prev) => ({ ...prev, currentPage: 1 }));
    }
  }, [eventType, eventStatusFilter, timeRange, dateRange, customerSearch, aiTagFilter, humanOverrideFilter]);

  const selectedEvent = useMemo(() => {
    const sourceData = events.length > 0 ? events : [];
    return sourceData.find((e) => e.id === selectedEventId);
  }, [selectedEventId, events]);

  return (
    <div className="flex h-full bg-slate-50">
      {/* Left Sidebar: Filter & List */}
      <div className="w-[400px] flex flex-col border-r border-slate-200 bg-white h-full shadow-sm z-10">
        {/* Top Filter Area */}
        <div className="p-4 border-b border-slate-200 bg-white z-20 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800 tracking-tight">事件概览</h2>
            <div className="text-xs text-slate-400 font-mono">{pagination.total} items</div>
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

            {timeRange === "custom" && (
              <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                <DatePicker.RangePicker
                  className="w-full h-8 text-xs"
                  value={dateRange}
                  onChange={(dates) => setDateRange(dates as any)}
                  placeholder={["开始日期", "结束日期"]}
                />
              </div>
            )}

            {/* Advanced Toggle */}
            {/* <div>
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
                      {["高购买意向", "风险信号", "交期敏感"].map((tag) => (
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
            </div> */}
          </div>
        </div>

        {/* List View */}
        <div className="flex-1 overflow-y-auto bg-white scrollbar-thin scrollbar-thumb-slate-200 relative">
          {loading && events.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
              <span className="text-xs text-slate-400">正在加载事件...</span>
            </div>
          ) : events.length > 0 ? (
            <div className={cn("transition-opacity duration-200", loading && "opacity-50 pointer-events-none")}>
              {events.map((event) => (
                <DecisionEventListItem
                  key={event.id}
                  event={event}
                  isSelected={selectedEventId === event.id}
                  onClick={() => setSelectedEventId(event.id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <Filter className="w-8 h-8 mb-2 opacity-20" />
              <span className="text-sm">无匹配事件</span>
            </div>
          )}
        </div>

        {/* Pagination bar */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex justify-center">
          <Pagination
            size="small"
            current={pagination.currentPage}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onChange={handlePageChange}
            showSizeChanger={true}
            pageSizeOptions={["10", "20", "50", "100"]}
          />
        </div>
      </div>

      {/* Right Content: Details */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
        <div className="flex-1 overflow-y-auto">
          {selectedEventId && selectedEvent ? (
            <div className="p-3 space-y-3 pb-20">
              <div className="space-y-3">
                <EventHeaderCard event={selectedEvent} />
              </div>

              {/* Layer 1: Graph Slice */}
              <CollapsibleLayer
                title="Layer 1: Graph Slice (事实切片)"
                layerNumber={1}
                isOpen={expandedLayers[1]}
                onToggle={() => toggleLayer(1)}
                status={expandedLayers[1] ? "active" : "completed"}
                summary={<span></span>}
                className="mb-2"
              >
                <GraphSliceLayer instanceId={selectedEvent.instanceId} externalHighlightId={highlightedFactId} />
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
                    {/* <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-50 text-blue-600 border border-blue-100 font-medium">
                      邮件: 询价 (98%)
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 border border-slate-200">
                      行为: 3次关键动作
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-orange-50 text-orange-600 border border-orange-100 font-medium">
                      风险: 高
                    </span> */}
                  </div>
                }
                className="mb-2"
              >
                <SemanticSummaryLayer semanticData={selectedEvent.semanticSummary} onHighlight={setHighlightedFactId} />
              </CollapsibleLayer>

              {/* Layer 3: Summary Builder */}
              <CollapsibleLayer
                title="Layer 3: Summary Builder (专家简报)"
                layerNumber={3}
                isOpen={expandedLayers[3]}
                onToggle={() => toggleLayer(3)}
                status={isExecuted ? "locked" : expandedLayers[3] ? "active" : "completed"}
                summary={
                  <span>
                    {/* 状态: <span className="text-purple-600 font-medium">人工已修订</span> · 3条局势判断 · 2条行动目标 */}
                  </span>
                }
                className="mb-2"
              >
                <SummaryBuilderLayer data={selectedEvent.expertBriefing} externalLock={isExecuted} />
              </CollapsibleLayer>

              {/* Layer 4: AI Execution */}
              <CollapsibleLayer
                title="Layer 4: AI Expert Execution (专家建议与执行)"
                layerNumber={4}
                isOpen={expandedLayers[4]}
                onToggle={() => toggleLayer(4)}
                status={isExecuted ? "completed" : expandedLayers[4] ? "active" : "default"}
                summary={
                  <></>
                  // isExecuted ? (
                  //   <span className="text-green-600 font-medium">已执行 · 邮件已发送</span>
                  // ) : (
                  //   <span>
                  //     AI 建议: 2条策略 · <span className="text-orange-500 font-medium">待确认</span>
                  //   </span>
                  // )
                }
                className="mb-20"
              >
                <ExecutionLayer hideActionPanel={true} />
              </CollapsibleLayer>

              {/* Future components will be added here */}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-300">
              <div className="text-center">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>请选择一个事件查看详情</p>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Action Bar */}
        {selectedEventId && selectedEvent && (
          <StickyActionBar status={decisionStatus} onAction={(newStatus) => setDecisionStatus(newStatus)} />
        )}
      </div>
    </div>
  );
}

function BadgeButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-2 py-1 rounded text-[10px] border transition-all",
        active
          ? "bg-slate-800 text-white border-slate-800"
          : "bg-white text-slate-600 border-slate-200 hover:border-slate-300",
      )}
    >
      {children}
    </button>
  );
}
