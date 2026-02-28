import { useState, useMemo, useEffect } from "react";
import { request } from "@/lib/request";
import { DecisionEvent, DecisionTraceItem } from "@/components/incidentCopy/DecisionEventListItem";
import EventHeaderCard from "@/components/incidentCopy/EventHeaderCard";
import GraphSliceLayer from "@/components/incidentCopy/GraphSliceLayer";
import SemanticSummaryLayer from "@/components/incidentCopy/SemanticSummaryLayer";
import SummaryBuilderLayer, { DEFAULT_BRIEFING } from "@/components/incidentCopy/SummaryBuilderLayer";
import ExecutionLayer from "@/components/incidentCopy/ExecutionLayer";
import CollapsibleLayer from "@/components/incidentCopy/CollapsibleLayer";
import StickyActionBar, { EventActionStatus } from "@/components/incidentCopy/StickyActionBar";
import EventsSidebar, { EventsSidebarFilters } from "@/components/incidentCopy/EventsSidebar";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import { DecisionTraceLayout } from "@/components/decisionTrace/DecisionTraceLayout";

// Helper removed

export default function Index() {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [events, setEvents] = useState<DecisionEvent[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters State
  const [filters, setFilters] = useState<EventsSidebarFilters>({
    eventType: "all",
    eventStatus: "all",
    timeRange: "today",
    dateRange: null,
    customerSearch: "",
    showAdvanced: false,
    aiTagFilter: "all",
    humanOverrideFilter: "all",
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 20,
    total: 0,
  });

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
        if (filters.timeRange === "3days") {
          startDate = dayjs().subtract(2, "day").startOf("day");
        } else if (filters.timeRange === "7days") {
          startDate = dayjs().subtract(6, "day").startOf("day");
        } else if (filters.timeRange === "custom") {
          if (filters.dateRange?.[0]) startDate = filters.dateRange[0];
          if (filters.dateRange?.[1]) endDate = filters.dateRange[1];
        }

        const res = await request.post("/quote/api/v1/decision/trace/page", {
          pageSize: pagination.pageSize,
          currentPage: pagination.currentPage,
          startDate,
          endDate,
          type: filters.eventType === "all" ? "" : filters.eventType,
          status: filters.eventStatus === "all" ? "" : filters.eventStatus,
        });

        if (res.status === 200 && res.data.data?.records) {
          setPagination((prev) => ({ ...prev, total: res.data.data.total || 0 }));
          const apiList: DecisionTraceItem[] = res.data.data.records;
          const mappedEvents: DecisionEvent[] = apiList.map((item) => {
            let parsedSemantic = null;
            let parsedBriefing = null;

            try {
              if (item.semanticSummary) {
                parsedSemantic = JSON.parse(item.semanticSummary.replace(/\\(?=[^\\"/bfnrtu])/g, "\\n"));
              }
            } catch (e) {
              console.error("Failed to parse semanticSummary for event:", item.id, e);
            }

            try {
              if (item.expertBriefing) {
                parsedBriefing = JSON.parse(item.expertBriefing.replace(/\\(?=[^\\"/bfnrtu])/g, "\\n"));
              }
            } catch (e) {
              console.error("Failed to parse expertBriefing for event:", item.id, e);
            }

            return {
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
              status: (item.statusCode as any) || "NEW",
              occurred_at: item.gmtCreate,
              ai_analyzed_at: item.gmtModified,
              has_human_override: !!item.analyzedBy,
              source_url: "",
              sales_rep: item.ownerName || "",
              team: item.ownerTeam || "",
              instanceName: item.instanceName,
              semanticSummary: parsedSemantic,
              expertBriefing: parsedBriefing,
              instanceId: item.instanceId,
            };
          });
          setEvents(mappedEvents);

          // Auto-select first item if none selected
          if (!selectedEventId && mappedEvents.length > 0) {
            setSelectedEventId(mappedEvents[0].id);
          }
        }
      } catch (error) {
        console.error("Fetch decision events failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDecisionEvents();
  }, [
    filters.eventType,
    filters.eventStatus,
    filters.timeRange,
    filters.dateRange,
    pagination.currentPage,
    pagination.pageSize,
  ]);

  const handlePageChange = (page: number, pageSize: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page, pageSize: pageSize }));
  };

  // Reset pagination when filters change (so we don't end up on a non-existent page)
  useEffect(() => {
    if (pagination.currentPage !== 1) {
      setPagination((prev) => ({ ...prev, currentPage: 1 }));
    }
  }, [
    filters.eventType,
    filters.eventStatus,
    filters.timeRange,
    filters.dateRange,
    filters.customerSearch,
    filters.aiTagFilter,
    filters.humanOverrideFilter,
  ]);

  const selectedEvent = useMemo(() => {
    const sourceData = events.length > 0 ? events : [];
    return sourceData.find((e) => e.id === selectedEventId);
  }, [selectedEventId, events]);

  const handleFilterChange = (updates: Partial<EventsSidebarFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className="flex h-full bg-slate-50">
      <EventsSidebar
        events={events}
        totalCount={pagination.total}
        loading={loading}
        selectedEventId={selectedEventId}
        onEventSelect={setSelectedEventId}
        filters={filters}
        onFilterChange={handleFilterChange}
        pagination={{
          current: pagination.currentPage,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: handlePageChange,
        }}
      />

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
                <SummaryBuilderLayer
                  data={selectedEvent.expertBriefing || DEFAULT_BRIEFING}
                  externalLock={isExecuted}
                />
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
