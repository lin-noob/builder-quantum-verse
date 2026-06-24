import { useCallback, useEffect, useMemo, useState } from "react";
import { DatePicker, Select } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { type ApiEvent } from "@/lib/profile";
import { request } from "@/lib/request";
import { ruleService } from "@/services/ruleService";
import type { RuleType } from "@/services/ruleTypeService";

type OrderHistoryProps = {
  cdpUserId?: string;
  sessionId?: string;
};

type MatchedAttribute = {
  key: string;
  value?: string;
};

type ParsedBusinessEvent = ApiEvent & {
  parsedProperties: Record<string, any>;
  matchedAttributes: MatchedAttribute[];
};

type ApiEnvelope<T> = {
  code?: string;
  data?: T;
  msg?: string;
  total?: number;
};

const PAGE_SIZE = 10;
const EVENT_COLORS = ["#2563eb", "#059669", "#d97706", "#db2777", "#0891b2", "#ea580c", "#7c3aed", "#64748b"];
const TABLE_COLUMNS_STYLE = {
  gridTemplateColumns: "38% 29% 20% 13%",
};
const DETAIL_EXCLUDED_KEYS = new Set([
  "matched_attribute_key",
  "$elements",
  "$elements_chain",
  "$lib",
  "$lib_version",
  "$browser_version",
  "$screen_width",
  "$screen_height",
  "$viewport_width",
  "$viewport_height",
]);

function parseJsonObject(value: unknown): Record<string, any> {
  if (!value) return {};
  if (typeof value === "object") return value as Record<string, any>;

  try {
    const parsed = JSON.parse(String(value));
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    console.error("Failed to parse event properties:", error);
    return {};
  }
}

function parseMatchedAttributes(value: unknown): MatchedAttribute[] {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.filter((item): item is MatchedAttribute => Boolean(item?.key));
  }

  try {
    const parsed = JSON.parse(String(value));
    return Array.isArray(parsed) ? parsed.filter((item): item is MatchedAttribute => Boolean(item?.key)) : [];
  } catch (error) {
    console.error("Failed to parse matched_attribute_key:", error);
    return [];
  }
}

function flattenEvents(records: any[] | undefined): ApiEvent[] {
  if (!Array.isArray(records)) return [];

  return records.flatMap((record) => {
    if (Array.isArray(record?.eventList)) return record.eventList;
    return record?.eventName ? [record] : [];
  });
}

function normalizeEventListResponse(responseBody: any) {
  const payload = responseBody?.data ?? responseBody;
  const records = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.records)
      ? payload.records
      : Array.isArray(payload?.eventList)
        ? payload.eventList
        : [];
  const events = flattenEvents(records);

  return {
    events,
    total: payload?.total ?? responseBody?.total ?? events.length,
  };
}

function getEventName(event: ParsedBusinessEvent) {
  return event.eventName || event.targetEvent || "未知事件";
}

function getEventAmount(event: ParsedBusinessEvent) {
  const amount = Number(event.price ?? event.parsedProperties.total_amount ?? event.parsedProperties.amount ?? 0);
  return Number.isFinite(amount) ? amount : 0;
}

function formatAmount(event: ParsedBusinessEvent) {
  const amount = getEventAmount(event);
  if (amount <= 0) return "-";

  const currency = event.currency || event.parsedProperties.currency || "$";
  const symbol = currency === "USD" ? "$" : currency;

  return `${symbol}${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDetailValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  if (Array.isArray(value)) return value.map(formatDetailValue).join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function getDetailFields(event: ParsedBusinessEvent) {
  return event.matchedAttributes
    .filter((attr) => attr.key && !DETAIL_EXCLUDED_KEYS.has(attr.key))
    .map((attr) => ({
      label: attr.key,
      value: event.parsedProperties[attr.key] ?? attr.value,
    }));
}

export default function OrderHistory({ cdpUserId = "", sessionId = "" }: OrderHistoryProps) {
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<ParsedBusinessEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [eventFilter, setEventFilter] = useState("all");
  const [ruleTypes, setRuleTypes] = useState<RuleType[]>([]);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(() => [dayjs().startOf("month"), dayjs()]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const parseEvent = useCallback((event: ApiEvent): ParsedBusinessEvent => {
    const parsedProperties = parseJsonObject(event.properties);

    return {
      ...event,
      parsedProperties,
      matchedAttributes: parseMatchedAttributes(parsedProperties.matched_attribute_key),
    };
  }, []);

  const fetchEventData = useCallback(
    async (page: number) => {
      if (!cdpUserId) {
        setEvents([]);
        setTotal(0);
        return;
      }

      setLoading(true);
      try {
        const params: Record<string, string | number | boolean> = {
          userSummaryId: cdpUserId,
          eventId: eventFilter === "all" ? "" : eventFilter,
          currentpage: page,
          pagesize: PAGE_SIZE,
        };

        if (dateRange?.[0]) {
          params.startDate = dateRange[0].startOf("day").toDate().toISOString();
        }
        if (dateRange?.[1]) {
          params.endDate = dateRange[1].endOf("day").toDate().toISOString();
        }
        const response = await request.post<ApiEnvelope<any>>(
          `/quote/api/v1/profile/view/rule/${encodeURIComponent(cdpUserId)}`,
          params,
        );
        const normalizedData = normalizeEventListResponse(response.data);
        const parsedEvents = normalizedData.events.map(parseEvent);

        setEvents(parsedEvents);
        setTotal(normalizedData.total ?? parsedEvents.length);
        setExpandedIds((prev) => {
          const visibleIds = new Set(parsedEvents.map((event) => event.id));
          return new Set([...prev].filter((id) => visibleIds.has(id)));
        });
      } catch (error) {
        console.error("Failed to fetch event data:", error);
        setEvents([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    [cdpUserId, dateRange, eventFilter, parseEvent],
  );

  useEffect(() => {
    fetchEventData(currentPage);
  }, [currentPage, fetchEventData]);

  useEffect(() => {
    const fetchRuleTypes = async () => {
      try {
        const data = await ruleService.getRules("");

        if (data) {
          const cusTypes: RuleType[] = data.map((item) => ({
            id: String(item.id ?? item.ruleName),
            eventName: item.ruleName,
          }));
          setRuleTypes(cusTypes);
        }
      } catch (error) {
        console.error("Failed to fetch rule types:", error);
        setRuleTypes([]);
      }
    };

    fetchRuleTypes();
  }, []);

  const eventOptions = useMemo(() => {
    const uniqueOptions = new Map<string, RuleType>();
    ruleTypes.forEach((ruleType) => {
      if (ruleType.id && ruleType.eventName) {
        uniqueOptions.set(ruleType.id, ruleType);
      }
    });
    return Array.from(uniqueOptions.values());
  }, [ruleTypes]);

  const filteredEvents = useMemo(() => {
    return events;
  }, [events]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleDateRangeChange = (dates: null | [Dayjs | null, Dayjs | null]) => {
    setDateRange(dates?.[0] && dates?.[1] ? [dates[0], dates[1]] : null);
    setCurrentPage(1);
  };

  const toggleExpanded = (eventId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(eventId)) {
        next.delete(eventId);
      } else {
        next.add(eventId);
      }
      return next;
    });
  };

  return (
    <section className="bg-white p-6 rounded-lg shadow-sm font-[Inter]">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-slate-950">业务统计</h3>
        <span className="text-sm text-slate-500">共 {total} 条</span>
      </div>

      <div className="mb-10 flex flex-wrap items-center gap-x-6 gap-y-4">
        <Select
          value={eventFilter}
          onChange={(value) => {
            setEventFilter(value);
            setCurrentPage(1);
          }}
          className="h-9 w-full min-w-[180px] sm:w-64"
          options={[
            { value: "all", label: "全部事件" },
            ...eventOptions.map((ruleType) => ({
              value: ruleType.id,
              label: ruleType.eventName,
            })),
          ]}
        />

        <div className="flex items-center gap-3 text-sm text-slate-600">
          <span>时间范围</span>
          <DatePicker.RangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            format="MM/DD/YYYY"
            allowClear
            className="h-9 w-[302px] rounded-md"
          />
        </div>
      </div>

      <div className="max-h-[520px] overflow-auto overscroll-contain rounded-lg border border-slate-200">
        <div className="min-w-[760px]">
          <div
            className="sticky top-0 z-10 grid bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-600"
            style={TABLE_COLUMNS_STYLE}
          >
            <div>事件名称</div>
            <div>事件时间</div>
            <div>涉及金额</div>
            <div>操作</div>
          </div>

          <div className="space-y-2">
            {loading ? (
              <div className="flex min-h-[180px] items-center justify-center rounded-b-lg border border-t-0 border-slate-200 text-sm text-slate-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                加载中...
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="flex min-h-[180px] items-center justify-center rounded-b-lg border border-t-0 border-slate-200 text-sm text-slate-500">
                暂无数据
              </div>
            ) : (
              filteredEvents.map((event, index) => {
                const isExpanded = expandedIds.has(event.id);
                const eventName = getEventName(event);
                const detailFields = getDetailFields(event);
                const color = EVENT_COLORS[index % EVENT_COLORS.length];

                return (
                  <article
                    key={event.id}
                    className="overflow-hidden rounded-lg border border-slate-200 bg-white transition hover:border-slate-300"
                  >
                    <div className="grid items-center px-4 py-3 text-sm" style={TABLE_COLUMNS_STYLE}>
                      <button
                        type="button"
                        onClick={() => toggleExpanded(event.id)}
                        className="flex min-w-0 items-center gap-3 text-left font-semibold text-slate-950"
                        aria-expanded={isExpanded}
                      >
                        <ChevronRight
                          className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                        />
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                        <span className="truncate">{eventName}</span>
                      </button>

                      <div className="text-slate-600">{event.gmtCreate || event.timestamp || "-"}</div>
                      <div className="font-semibold text-emerald-600">{formatAmount(event)}</div>
                      <button
                        type="button"
                        onClick={() => toggleExpanded(event.id)}
                        className="w-fit text-sm font-medium text-violet-600 transition hover:text-violet-700"
                      >
                        查看详情
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-dashed border-slate-200 bg-slate-50 px-6 py-4">
                        <div className="border-l-2 border-violet-300 pl-6">
                          {detailFields.length > 0 ? (
                            <div className="grid gap-x-12 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
                              {detailFields.map((field) => (
                                <div key={field.label} className="min-w-0">
                                  <div className="text-xs font-medium text-slate-500">{field.label}</div>
                                  <div className="mt-1 break-words text-sm font-semibold text-slate-950">
                                    {formatDetailValue(field.value)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-slate-500">暂无可展示的事件属性</div>
                          )}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
        <span>
          第 {currentPage} / {totalPages} 页
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage <= 1 || loading}
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 px-3 text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
            上一页
          </button>
          <button
            type="button"
            disabled={currentPage >= totalPages || loading}
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 px-3 text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            下一页
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
