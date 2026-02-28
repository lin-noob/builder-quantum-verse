import { useState, useMemo, useEffect } from "react";
import { request } from "@/lib/request";
import { getDecisionTraceView } from "@/services/decisionTraceService";
import { DecisionEvent, DecisionTraceItem } from "@/components/incidentCopy/DecisionEventListItem";
import { DecisionTraceLayout } from "@/components/decisionTrace/DecisionTraceLayout";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import EventsSidebar, { EventsSidebarFilters } from "@/components/incidentCopy/EventsSidebar";
import { Search } from "lucide-react";

export default function NewEventsCopy() {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [events, setEvents] = useState<DecisionEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<DecisionEvent>();
  const [loading, setLoading] = useState(false);

  // Filters State
  const [filters, setFilters] = useState<EventsSidebarFilters>({
    eventType: "all",
    eventStatus: "all",
    timeRange: "custom",
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

  // API Call logic identical to EventsCopy.tsx
  useEffect(() => {
    const fetchDecisionEvents = async () => {
      setLoading(true);
      try {
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
          pagesize: pagination.pageSize,
          currentpage: pagination.currentPage,
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
            let parsedSorting = null;
            let parsedInference = null;

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

            try {
              if (item.sortingEngine) {
                parsedSorting = JSON.parse(item.sortingEngine.replace(/\\(?=[^\\"/bfnrtu])/g, "\\n"));
              }
            } catch (e) {
              console.error("Failed to parse sortingEngine for event:", item.id, e);
            }

            try {
              if (item.dataInference) {
                parsedInference = JSON.parse(item.dataInference.replace(/\\(?=[^\\"/bfnrtu])/g, "\\n"));
              }
            } catch (e) {
              console.error("Failed to parse dataInference for event:", item.id, e);
            }

            return {
              id: item.id,
              type: "CUSTOMER_EMAIL_RECEIVED",
              type_label: item.instanceName || "未知事件",
              icon: "mail",
              customer: {
                id: item.customerId,
                name: item.customerName,
                type: "Customer",
              },
              ai_initial_judgement: item.aiAnalysisResult,
              status: (item.status as any) || 1,
              current_step: item.status ? Number(item.status) : undefined,
              occurred_at: item.gmtCreate,
              ai_analyzed_at: item.gmtModified,
              has_human_override: !!item.analyzedBy,
              instanceId: item.instanceId,
              instanceName: item.instanceName,
              semanticSummary: parsedSemantic,
              expertBriefing: parsedBriefing,
              sortingEngine: parsedSorting,
              dataInference: parsedInference,
              semanticSummaryWord: item.engine?.semanticSummaryWord,
              expertBriefingWord: item.engine?.expertBriefingWord,
              sortingEngineWord: item.engine?.sortingEngineWord,
              inferenceWord: item.engine?.inferenceWord,
            };
          });
          setEvents(mappedEvents);

          // Re-select if previously selected or select first item
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

  // Reset pagination when filters change
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

  // Fetch event details on selection (GET /quote/api/v1/decision/trace/view/{id})
  useEffect(() => {
    const fetchDetails = async () => {
      if (selectedEventId) {
        try {
          const res = await getDecisionTraceView(selectedEventId);
          if (res.status === 200 && res.data?.data?.engine) {
            const item = res.data.data;
            let parsedSemantic = null;
            let parsedBriefing = null;
            let parsedSorting = null;
            let parsedInference = null;

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

            try {
              if (item.sortingEngine) {
                parsedSorting = JSON.parse(item.sortingEngine.replace(/\\(?=[^\\"/bfnrtu])/g, "\\n"));
              }
            } catch (e) {
              console.error("Failed to parse sortingEngine for event:", item.id, e);
            }

            try {
              if (item.dataInference) {
                parsedInference = JSON.parse(item.dataInference.replace(/\\(?=[^\\"/bfnrtu])/g, "\\n"));
              }
            } catch (e) {
              console.error("Failed to parse dataInference for event:", item.id, e);
            }

            setSelectedEvent({
              ...item,
              semanticSummary: parsedSemantic,
              expertBriefing: parsedBriefing,
              sortingEngine: parsedSorting,
              dataInference: parsedInference,
              semanticSummaryWord: item.engine?.semanticSummaryWord,
              expertBriefingWord: item.engine?.expertBriefingWord,
              sortingEngineWord: item.engine?.sortingEngineWord,
              inferenceWord: item.engine?.inferenceWord,
              current_step: item.status ? Number(item.status) : undefined,
            });
          } else {
            setSelectedEvent(null);
          }
        } catch (error) {
          console.error("Failed to fetch trace details:", error);
        }
      }
    };
    fetchDetails();
  }, [selectedEventId]);

  const handleFilterChange = (updates: Partial<EventsSidebarFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className="flex h-[calc(100vh-48px)] bg-[#F8FAFC] overflow-hidden">
      {/* 左侧：事件列表 */}
      <EventsSidebar
        events={events}
        totalCount={pagination.total}
        loading={loading}
        selectedEventId={selectedEventId}
        onEventSelect={setSelectedEventId}
        filters={filters}
        onFilterChange={(updates) => setFilters((prev) => ({ ...prev, ...updates }))}
        pagination={{
          current: pagination.currentPage,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page: number, pageSize: number) => {
            setPagination((prev) => ({ ...prev, currentPage: page, pageSize }));
          },
        }}
      />

      {/* 右侧：决策追踪主界面 - 传递 selectedEvent */}
      <div className="flex-1 overflow-hidden">
        {selectedEventId ? (
          <DecisionTraceLayout key={selectedEventId} eventId={selectedEventId} event={selectedEvent} />
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400 bg-slate-50">
            <div className="text-center">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>请从左侧选择一个事件查看详情</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
