import { useEffect, useState, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import {
  ChevronLeft,
  ChevronRight,
  Search as SearchIcon,
  Eye,
  LogOut,
  MousePointer,
  ArrowDownToLine,
  ShoppingCart,
  MinusCircle,
  CreditCard,
  CheckCircle,
  UserPlus,
  LogIn,
  Send,
  Pencil,
} from "lucide-react";
import {
  ApiSessionEvent,
  getUserEventList,
  ParsedEventData,
  SessionEvent,
  type ApiEvent,
  type ApiEventListResponse,
} from "@/lib/profile";
import { request } from "@/lib/request";
import { EventType } from "@shared/eventRuleTypes";
import { ruleTypeService, RuleType } from "@/services/ruleTypeService";

// Session interface
interface Session {
  id: string;
  startTime: string; // timestamp
  endTime: string; // timestamp
  eventCount: number;
  events: { ev: ApiEvent; parsed: ParsedEventData; repeatCount: number }[];
  duration: number; // in minutes
}

export default function SessionTimeline({
  cdpUserId,
  sessionId,
}: {
  cdpUserId: string;
  sessionId: string;
}) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [eventData, setEventData] = useState<ApiEventListResponse | null>(null);
  const [sessions, setSessions] = useState<SessionEvent[] | null>([]);
  const [total, setTotal] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState<ParsedEventData | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("basic-info");
  const [eventList, setEventList] = useState<ParsedEventData[]>([]);
  const [selectedEventIndex, setSelectedEventIndex] = useState(0);
  const [timeRange, setTimeRange] = useState<{ start?: Date; end?: Date }>({});
  const [filterEventType, setFilterEventType] = useState<EventType | "all">(
    "all",
  );
  const [filterSource, setFilterSource] = useState<string | "all">("all");
  const [filterDevice, setFilterDevice] = useState<string | "all">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [ruleTypes, setRuleTypes] = useState<RuleType[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pageSize = 10;

  // Parse properties JSON string to extract event details
  const parseEventProperties = (propertiesStr: string): any => {
    try {
      return JSON.parse(propertiesStr);
    } catch (error) {
      console.error("Failed to parse event properties:", error);
      return {};
    }
  };

  // Convert API event to parsed event data
  const convertEventToData = (event: ApiEvent): ParsedEventData => {
    const properties = parseEventProperties(event.properties);

    // 如果 eventName 是 $autocapture，则使用 properties 中的 $event_type
    let eventType: EventType = event.eventName as EventType;
    if (event.eventName === "$autocapture" && properties.$event_type) {
      // 将 $event_type 映射到对应的事件类型
      const eventTypeMapping: { [key: string]: EventType } = {
        click: "Click",
        submit: "SubmitForm",
        change: "Change",
      };
      eventType =
        eventTypeMapping[properties.$event_type] ||
        (event.eventName as EventType);
    }

    return {
      id: event.id,
      eventTime: event.gmtCreate,
      eventType: eventType,
      source: properties.source || properties.$lib || "",
      deviceType: properties.deviceType || properties.$device_type || "",
      pageTitle: properties.title || "",
      pageURL: properties.pageURL || properties.$current_url || "",
      browser: properties.browser || properties.$browser || "",
      os: properties.os || properties.$os || "",
      dwellTimeMs: properties.dwellTimeMs,
      maxScrollDepth: properties.maxScrollDepth,
      maxDepthPercent: properties.maxDepthPercent,
      elementTag: properties.elementTag,
      elementText: properties.elementText,
      referrer: properties.referrer || properties.$referrer || "",
      // Product related fields for ViewProduct event
      productId: properties.productId,
      productName: properties.productName,
      productCategory: properties.productCategory,
      productPrice: properties.productPrice,
      productCurrency: properties.productCurrency,
      productBrand: properties.productBrand,
      // PostHog specific fields
      $event_type: properties.$event_type,
      $browser_version: properties.$browser_version,
      $timezone: properties.$timezone,
      $current_url: properties.$current_url,
      $referrer: properties.$referrer,
      $pathname: properties.$pathname,
      $elements: properties.$elements,
      $elements_chain: properties.$elements_chain,
      cusEventType: properties.cusEventType,
      $screen_width: properties.$screen_width,
      $screen_height: properties.$screen_height,
      $viewport_width: properties.$viewport_width,
      $viewport_height: properties.$viewport_height,
      gmtCreate: event.gmtCreate,
    };
  };

  // Fetch event data - removed filter dependencies to prevent auto-triggering on filter changes
  const fetchEventData = useCallback(
    async (
      page: number,
      overrideFilters?: {
        pageUrl?: string;
        eventName?: string;
        source?: string;
        device?: string;
        startDate?: Date;
        endDate?: Date;
      } | null,
      appendMode: boolean = false,
    ) => {
      if (!cdpUserId) return;

      if (appendMode) {
        setIsLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        // Build filter object
        const filters: {
          pageUrl?: string;
          eventName?: string;
          source?: string;
          device?: string;
          startDate?: Date;
          endDate?: Date;
        } = {};

        // Use override filters if provided (for reset), otherwise use current state
        if (overrideFilters === null) {
          // Reset mode - use empty filters
        } else if (overrideFilters) {
          // Use provided filters
          Object.assign(filters, overrideFilters);
        } else {
          // Use current state filters - reading from state at call time
          if (searchQuery) filters.pageUrl = searchQuery;
          if (filterEventType !== "all") filters.eventName = filterEventType;
          if (filterSource !== "all") filters.source = filterSource;
          if (filterDevice !== "all") filters.device = filterDevice;
          if (timeRange.start) filters.startDate = timeRange.start;
          if (timeRange.end) filters.endDate = timeRange.end;
        }

        const data = await getUserEventList(
          cdpUserId,
          sessionId,
          page,
          pageSize,
          2, // 2 for behavior data
          filters,
        );

        setEventData(data);
        setTotal(data.total);

        const newSessions = data.records.map((session) => ({
          ...session,
          eventList: (session?.eventList || []).map(convertEventToData),
        }));

        // Check if there are more pages
        const totalPages = Math.ceil(data.total / pageSize);
        setHasMore(page < totalPages);

        // Append or replace sessions
        if (appendMode) {
          setSessions((prev) => [...prev, ...newSessions]);
        } else {
          setSessions(newSessions);
        }
      } catch (error) {
        console.error("Failed to fetch event data:", error);
      } finally {
        setLoading(false);
        setIsLoadingMore(false);
      }
    },
    [cdpUserId, pageSize, sessionId], // Removed filter dependencies
  );

  // Load data on component mount only
  useEffect(() => {
    if (cdpUserId) {
      fetchEventData(1);
    }
  }, [cdpUserId, sessionId]); // Only trigger on mount or when user/session changes

  // Fetch rule types on mount
  useEffect(() => {
    const fetchRuleTypes = async () => {
      const types = await ruleTypeService.list();
      setRuleTypes(types);
    };
    fetchRuleTypes();
  }, []);

  // Handle scroll event for infinite loading
  const handleScroll = () => {
    if (!scrollContainerRef.current || isLoadingMore || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } =
      scrollContainerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    // Load more when user is within 200px of bottom
    if (distanceFromBottom < 200) {
      const nextPage = currentPage + 1;
      const totalPages = Math.ceil(total / pageSize);

      if (nextPage <= totalPages) {
        setCurrentPage(nextPage);
        // Pass undefined to use current state filters, append mode = true
        fetchEventData(nextPage, undefined, true);
      }
    }
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Handle row click to show event details
  const handleRowClick = async (event: ParsedEventData) => {
    // Call the API endpoint which returns an array of related events
    try {
      const response = await request.get(
        `/quote/api/v1/profile/page/view/${event.id}`,
      );

      // Convert the response to an array of parsed events
      let eventsArray: ApiEvent[] = response.data.data;

      // Convert API events to parsed event data
      const parsedEvents = eventsArray.map((apiEvent) =>
        convertEventToData(apiEvent),
      );

      setEventList(parsedEvents);
      setSelectedEventIndex(0); // Start with the first event
      setSelectedEventIndex(0);
      setSelectedEvent(parsedEvents[0]);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Failed to call profile page view API:", error);
      setSelectedEventIndex(0);
      setIsModalOpen(true);
    }
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  // Format session duration
  // 传���时间差（毫秒），返回格式化的时长字符串
  const formatSessionDuration = (ms: number): string => {
    // 把毫秒转成总分钟数（四舍五入更贴近现实）
    const totalMinutes = Math.floor(ms / 1000 / 60);

    if (totalMinutes < 60) {
      return `${totalMinutes}分钟`;
    }

    const hours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    return remainingMinutes > 0
      ? `${hours}小���${remainingMinutes}分钟`
      : `${hours}小时`;
  };

  const getEventTypeBadge = (eventType: any) => {
    let bgColor = "bg-slate-100";
    let textColor = "text-slate-800";
    let displayName: string = eventType;

    bgColor = "bg-blue-100";
    textColor = "text-blue-800";
    displayName = eventType;

    // switch (eventType) {
    //   case "$pageview":
    //     bgColor = "bg-blue-100";
    //     textColor = "text-blue-800";
    //     displayName = t("sessionTimeline.eventTypes.PageView");
    //     break;
    //   case "$pageleave":
    //     bgColor = "bg-orange-100";
    //     textColor = "text-orange-800";
    //     displayName = t("sessionTimeline.eventTypes.PageLeave");
    //     break;
    //   case "$autocapture":
    //     bgColor = "bg-gray-100";
    //     textColor = "text-gray-800";
    //     displayName = "Autocapture";
    //     break;
    //   case "ScrollDepth":
    //     bgColor = "bg-success-light";
    //     textColor = "text-success";
    //     displayName = t("sessionTimeline.eventTypes.ScrollDepth");
    //     break;
    //   case "Click":
    //     bgColor = "bg-purple-100";
    //     textColor = "text-purple-800";
    //     displayName = t("sessionTimeline.eventTypes.Click");
    //     break;
    //   case "ViewProduct":
    //     bgColor = "bg-green-100";
    //     textColor = "text-green-800";
    //     displayName = t("sessionTimeline.eventTypes.ViewProduct");
    //     break;
    //   case "AddToCart":
    //     bgColor = "bg-yellow-100";
    //     textColor = "text-yellow-800";
    //     displayName = t("sessionTimeline.eventTypes.AddToCart");
    //     break;
    //   case "RemoveFromCart":
    //     bgColor = "bg-red-100";
    //     textColor = "text-red-800";
    //     displayName = t("sessionTimeline.eventTypes.RemoveFromCart");
    //     break;
    //   case "StartCheckout":
    //     bgColor = "bg-indigo-100";
    //     textColor = "text-indigo-800";
    //     displayName = t("sessionTimeline.eventTypes.StartCheckout");
    //     break;
    //   case "CompletePurchase":
    //     bgColor = "bg-emerald-100";
    //     textColor = "text-emerald-800";
    //     displayName = t("sessionTimeline.eventTypes.CompletePurchase");
    //     break;
    //   case "UserRegister":
    //     bgColor = "bg-pink-100";
    //     textColor = "text-pink-800";
    //     displayName = t("sessionTimeline.eventTypes.UserRegister");
    //     break;
    //   case "UserLogin":
    //     bgColor = "bg-cyan-100";
    //     textColor = "text-cyan-800";
    //     displayName = t("sessionTimeline.eventTypes.UserLogin");
    //     break;
    //   case "SubmitForm":
    //     bgColor = "bg-amber-100";
    //     textColor = "text-amber-800";
    //     displayName = t("sessionTimeline.eventTypes.SubmitForm");
    //     break;
    //   case "Search":
    //     bgColor = "bg-violet-100";
    //     textColor = "text-violet-800";
    //     displayName = t("sessionTimeline.eventTypes.Search");
    //     break;
    //   case "PageDwellTime":
    //     bgColor = "bg-teal-100";
    //     textColor = "text-teal-800";
    //     displayName = t("sessionTimeline.eventTypes.PageDwellTime");
    //   case "Change":
    //     bgColor = "bg-blue-100";
    //     textColor = "text-blue-800";
    //     displayName = t("sessionTimeline.eventTypes.Change");
    //     break;
    // }

    return (
      <span
        className={`px-2 py-0.5 text-xs font-medium rounded-full ${bgColor} ${textColor}`}
      >
        {displayName}
      </span>
    );
  };

  // Format dwell time from milliseconds
  const formatDwellTime = (dwellTimeMs?: number): string => {
    if (!dwellTimeMs) return "N/A";
    const seconds = Math.floor(dwellTimeMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}${t("sessionTimeline.timeUnits.minutes")}${remainingSeconds}${t("sessionTimeline.timeUnits.seconds")}`;
    }
    return `${remainingSeconds}${t("sessionTimeline.timeUnits.seconds")}`;
  };

  // Calculate pagination info
  const totalPages = eventData ? Math.ceil(eventData.total / pageSize) : 0;
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, eventData?.total || 0);

  // Prepare data for rendering

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          {t("sessionTimeline.title")}
        </h3>
        <div className="flex items-center justify-center py-8">
          <div className="text-slate-500">{t("sessionTimeline.loading")}</div>
        </div>
      </div>
    );
  }

  // if (!eventData || eventData.records.length === 0) {
  //   return (
  //     <div className="bg-white p-6 rounded-lg shadow-sm">
  //       <h3 className="text-lg font-semibold text-slate-900 mb-4">
  //         {t("sessionTimeline.title")}
  //       </h3>
  //       <div className="flex items-center justify-center py-8">
  //         <div className="text-slate-500">{t("sessionTimeline.noData")}</div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <>
      {/* 行为事件列表 */}
      <div className="bg-white rounded-lg shadow-sm font-[Inter] flex flex-col h-[calc(100vh-202px)]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-900">
            {t("sessionTimeline.title")}
          </h3>
          <div className="text-sm text-slate-500">
            {t("sessionTimeline.recordsInfo", {
              total: eventData?.total ?? 0,
              start: startItem,
              end: endItem,
            })}
          </div>
        </div>

        {/* 查询区域 */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-6">
          <div className="md:col-span-2">
            <Input
              type="text"
              placeholder="搜索行为、页面或元素"
              className="h-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div>
            <Select
              value={filterEventType}
              onValueChange={(value) => setFilterEventType(value as any)}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="全部事件" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部事件</SelectItem>
                {ruleTypes.map((ruleType) => (
                  <SelectItem key={ruleType.id} value={ruleType.eventName}>
                    {ruleType.eventName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Select
              value={filterSource}
              onValueChange={(value) => setFilterSource(value)}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="全部来源" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部来源</SelectItem>
                <SelectItem value="web">web</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select
              value={filterDevice}
              onValueChange={(value) => setFilterDevice(value)}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="全部设备" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部设备</SelectItem>
                <SelectItem value="Mobile">Mobile</SelectItem>
                <SelectItem value="Desktop">Desktop</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
          <div>
            <DateTimePicker
              value={timeRange.start}
              onChange={(date) => setTimeRange((r) => ({ ...r, start: date }))}
              placeholder="选择起始时间"
              className="h-10"
            />
          </div>
          <div>
            <DateTimePicker
              value={timeRange.end}
              onChange={(date) => setTimeRange((r) => ({ ...r, end: date }))}
              placeholder="选择结束时间"
              className="h-10"
            />
          </div>
          <div className="flex items-end gap-2">
            <Button
              size="sm"
              onClick={() => {
                setCurrentPage(1);
                setHasMore(true);
                setSessions([]);
                // Build filters from current state
                const filters: any = {};
                if (searchQuery) filters.pageUrl = searchQuery;
                if (filterEventType !== "all")
                  filters.eventName = filterEventType;
                if (filterSource !== "all") filters.source = filterSource;
                if (filterDevice !== "all") filters.device = filterDevice;
                if (timeRange.start) filters.startDate = timeRange.start;
                if (timeRange.end) filters.endDate = timeRange.end;
                fetchEventData(1, filters, false);
              }}
            >
              <SearchIcon className="h-4 w-4 mr-1" />
              搜索
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                setSearchQuery("");
                setFilterEventType("all");
                setFilterSource("all");
                setFilterDevice("all");
                setTimeRange({});
                setCurrentPage(1);
                setHasMore(true);
                setSessions([]);

                // Fetch data with cleared filters (null = clear all)
                await fetchEventData(1, null, false);
              }}
            >
              重置
            </Button>
          </div>
        </div>

        {/* 时间线样式 - 按会话分组 */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="relative flex-1 overflow-y-auto"
        >
          {sessions.map((session, sessionIndex) => (
            <div key={sessionIndex} className="mb-4">
              {/* Session Header */}
              <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 rounded-lg border-l-4 border-blue-500">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="font-medium text-slate-900">
                    会话 {sessionIndex + 1}
                  </span>
                </div>
                <div className="text-sm text-slate-600">
                  {new Date(session.startTime).toLocaleString("zh-CN")} -{" "}
                  {new Date(session.endTime).toLocaleString("zh-CN")}
                </div>
                <div className="text-sm text-slate-500">
                  时长:{" "}
                  {formatSessionDuration(session.endTime - session.startTime)}
                </div>
                <div className="text-sm text-slate-500">
                  {session.eventCount} 个事件
                </div>
              </div>

              {/* Session Events */}
              <div className="border-l-2 border-slate-200 pl-6 ml-6">
                {session.eventList.map((item) => (
                  <div
                    key={item.id}
                    className="group rounded-md p-3 hover:bg-slate-50 cursor-pointer relative"
                    onClick={() => handleRowClick(item)}
                  >
                    <span className="absolute -left-3 top-4 w-3 h-3 rounded-full bg-slate-300 border-2 border-white"></span>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getEventTypeBadge(item.eventType)}
                        <span className="text-slate-900 font-medium">
                          {item!.pageURL ||
                            item.elementText ||
                            item.pageURL ||
                            ""}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(item.eventTime).toLocaleTimeString("zh-CN")}
                      </div>
                    </div>
                    <div className="mt-1 text-sm text-slate-600">
                      <div className="flex flex-wrap gap-3">
                        <span className="text-xs">来源：{item.source}</span>
                        <span className="text-xs">设备：{item.deviceType}</span>
                        {/* <span className="text-xs">
                          停留时长：{formatDwellTime(item.dwellTimeMs)}
                        </span> */}
                        {/* {repeatCount > 1 && (
                          <span className="text-xs text-slate-400">
                            重复访问：{repeatCount}次
                          </span>
                        )} */}
                      </div>
                      {/* {parsed.pageURL && (
                        <div className="mt-1 text-xs text-slate-500 break-all">
                          {parsed.pageURL}
                        </div>
                      )}
                      {parsed.elementText && (
                        <div className="mt-1 text-xs text-slate-500 break-all">
                          元素：{parsed.elementText}
                        </div>
                      )} */}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Loading more indicator */}
          {isLoadingMore && (
            <div className="flex items-center justify-center py-6">
              <div className="flex items-center gap-2 text-slate-500">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span>加载更多数据...</span>
              </div>
            </div>
          )}

          {/* No more data indicator */}
          {!hasMore && sessions.length > 0 && (
            <div className="flex items-center justify-center py-6">
              <div className="text-sm text-slate-400">已加载全部数据</div>
            </div>
          )}
        </div>

        {/* Pagination - Optional: can be hidden when using infinite scroll */}
        {totalPages > 1 && false && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-slate-500">
              {t("sessionTimeline.pagination.page", {
                current: currentPage,
                total: totalPages,
              })}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                {t("sessionTimeline.pagination.previous")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                {t("sessionTimeline.pagination.next")}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 事件详情弹窗 */}
      {isModalOpen && selectedEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center !mt-0"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
            {/* 弹窗头部 */}
            <div className="flex justify-between items-center p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">
                {t("sessionTimeline.modal.title")}
              </h3>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>

            {/* 弹窗主体 - 按照新要求重新布局 */}
            <div className="flex flex-col flex-1 overflow-hidden">
              {/* 上部分 - 公共事件信息 */}
              <div className="p-4 border-b border-slate-200 bg-slate-50">
                <h4 className="text-sm font-semibold text-slate-900 mb-3">
                  {t("sessionTimeline.modal.commonInfo")}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-xs text-slate-500">
                      {t("sessionTimeline.modal.fields.deviceType")}
                    </div>
                    <div className="font-medium text-slate-900">
                      {eventList[0]?.deviceType || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">
                      {t("sessionTimeline.modal.fields.browser")}
                    </div>
                    <div className="font-medium text-slate-900">
                      {eventList[0]?.browser || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">
                      {t("sessionTimeline.modal.fields.source")}
                    </div>
                    <div className="font-medium text-slate-900">
                      {eventList[0]?.source || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">
                      {t("sessionTimeline.modal.fields.os")}
                    </div>
                    <div className="font-medium text-slate-900">
                      {eventList[0]?.os || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">
                      Screen/Viewport
                    </div>
                    <div className="font-medium text-slate-900">
                      {eventList[0]?.$screen_width +
                        " × " +
                        eventList[0]?.$screen_height || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Viewport Size</div>
                    <div className="font-medium text-slate-900">
                      {eventList[0]?.$viewport_width +
                        " × " +
                        eventList[0]?.$viewport_height || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">
                      Browser Version
                    </div>
                    <div className="font-medium text-slate-900">
                      {selectedEvent.browser} {selectedEvent.$browser_version}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Timezone</div>
                    <div className="font-medium text-slate-900">
                      {selectedEvent.$timezone}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Start Time</div>
                    <div className="font-medium text-slate-900">
                      {eventList[0]?.gmtCreate}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">End Time</div>
                    <div className="font-medium text-slate-900">
                      {eventList[eventList.length - 1]?.gmtCreate}
                    </div>
                  </div>
                </div>
              </div>

              {/* 下部分 - 分为左右两部分 */}
              <div className="flex flex-1 overflow-hidden">
                {/* 左侧 - 事件列表 */}
                <div className="w-80 border-r border-slate-200 overflow-y-auto bg-white">
                  <div className="p-3 border-b border-slate-200">
                    <h4 className="text-sm font-semibold text-slate-900">
                      {t("sessionTimeline.modal.eventList")}
                    </h4>
                  </div>
                  <div className="p-2">
                    <div className="space-y-1">
                      {eventList.map((event, index) => (
                        <div
                          key={event.id}
                          className={`p-3 rounded cursor-pointer transition-colors ${
                            selectedEventIndex === index
                              ? "bg-blue-100 border border-blue-300"
                              : "hover:bg-slate-100"
                          }`}
                          onClick={() => {
                            setSelectedEventIndex(index);
                            setSelectedEvent(event);
                          }}
                        >
                          <div className="flex flex-row justify-between">
                            <div className="flex items-center gap-2">
                              {getEventTypeBadge(event.eventType)}
                            </div>
                            {event.eventType === "Click" && (
                              <div className="text-xs text-slate-600 mt-1">
                                {event.$elements &&
                                event.$elements.length > 0 &&
                                event.$elements[0].$el_text
                                  ? event.$elements[0].$el_text
                                  : ""}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 右侧 - 事件详情 */}
                <div className="flex-1 overflow-y-auto p-6">
                  {/* 事件基本信息 */}
                  {/* <div className="mb-6">
                    <h4 className="text-sm font-medium text-slate-900 mb-3">
                      {t("sessionTimeline.modal.basicInfo")}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm  bg-slate-50 rounded-lg">
                      <div>
                        <div className="text-xs text-slate-500">
                          {t("sessionTimeline.modal.fields.eventTime")}
                        </div>
                        <div className="font-medium text-slate-900">
                          {selectedEvent.eventTime}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">
                          {t("sessionTimeline.modal.fields.eventType")}
                        </div>
                        <div className="font-medium text-slate-900">
                          {getEventTypeBadge(selectedEvent.eventType)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">
                          {t("sessionTimeline.modal.fields.source")}
                        </div>
                        <div className="font-medium text-slate-900">
                          {selectedEvent.source}
                        </div>
                      </div>
                    </div>
                  </div> */}

                  {/* 页面信息 */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-slate-900 mb-3">
                      {t("sessionTimeline.modal.pageInfo")}
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div>
                        <div className="text-xs text-slate-500">
                          {t("sessionTimeline.modal.fields.pageTitle")}
                        </div>
                        <div className="font-medium text-slate-900">
                          {selectedEvent.pageTitle}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">
                          {t("sessionTimeline.modal.fields.pageUrl")}
                        </div>
                        <div className="font-medium text-slate-900 break-all">
                          {selectedEvent.pageURL}
                        </div>
                      </div>
                      {selectedEvent.referrer && (
                        <div>
                          <div className="text-xs text-slate-500">
                            {t("sessionTimeline.modal.fields.referrer")}
                          </div>
                          <div className="font-medium text-slate-900 break-all">
                            {selectedEvent.referrer}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 事件特定信息 */}
                  <div>
                    {/* <h4 className="text-sm font-medium text-slate-900 mb-3">
                      {t("sessionTimeline.modal.detailInfo")}
                    </h4> */}
                    <div className="space-y-3 text-sm">
                      {/* PostHog event type */}
                      {selectedEvent.$event_type && (
                        <div>
                          <div className="text-xs text-slate-500">
                            Event Type
                          </div>
                          <div className="font-medium text-slate-900">
                            <span
                              className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                selectedEvent.$event_type === "click"
                                  ? "bg-purple-100 text-purple-800"
                                  : selectedEvent.$event_type === "submit"
                                    ? "bg-amber-100 text-amber-800"
                                    : selectedEvent.$event_type === "change"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-slate-100 text-slate-800"
                              }`}
                            >
                              {selectedEvent.$event_type}
                            </span>
                          </div>
                        </div>
                      )}
                      {/* Elements chain for click/submit events - 只显示第一条 */}
                      {selectedEvent.$elements &&
                        selectedEvent.$elements.length > 0 && (
                          <div>
                            <div className="text-xs text-slate-500">
                              Click/Submit Element
                            </div>
                            <div className="mt-2">
                              {(() => {
                                const element = selectedEvent.$elements[0];
                                return (
                                  <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs">
                                    {element.tag_name && (
                                      <div className="mb-1">
                                        <span className="text-slate-500">
                                          Tag:
                                        </span>{" "}
                                        <span className="font-mono text-slate-900">
                                          &lt;{element.tag_name}&gt;
                                        </span>
                                      </div>
                                    )}
                                    {element.attr__id && (
                                      <div className="mb-1">
                                        <span className="text-slate-500">
                                          ID:
                                        </span>{" "}
                                        <span className="font-mono text-slate-900">
                                          {element.attr__id}
                                        </span>
                                      </div>
                                    )}
                                    {element.classes &&
                                      element.classes.length > 0 && (
                                        <div className="mb-1">
                                          <span className="text-slate-500">
                                            Classes:
                                          </span>{" "}
                                          <span className="font-mono text-slate-900">
                                            {element.classes.join(", ")}
                                          </span>
                                        </div>
                                      )}
                                    {element.$el_text && (
                                      <div className="mb-1">
                                        <span className="text-slate-500">
                                          Text:
                                        </span>{" "}
                                        <span className="text-slate-900">
                                          {element.$el_text}
                                        </span>
                                      </div>
                                    )}
                                    {element.nth_child && (
                                      <div>
                                        <span className="text-slate-500">
                                          Position:
                                        </span>{" "}
                                        <span className="text-slate-900">
                                          nth-child({element.nth_child})
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        )}
                      {/* Screen and Viewport info */}
                      {selectedEvent.eventType === "$pageleave" &&
                        selectedEvent.dwellTimeMs && (
                          <div>
                            <div className="text-xs text-slate-500">
                              {t("sessionTimeline.modal.fields.dwellTime")}
                            </div>
                            <div className="font-medium text-slate-900">
                              {formatDwellTime(selectedEvent.dwellTimeMs)}
                            </div>
                          </div>
                        )}
                      {selectedEvent.eventType === "$pageleave" &&
                        selectedEvent.maxScrollDepth && (
                          <div>
                            <div className="text-xs text-slate-500">
                              {t("sessionTimeline.modal.fields.maxScrollDepth")}
                            </div>
                            <div className="font-medium text-slate-900">
                              {selectedEvent.maxScrollDepth}%
                            </div>
                          </div>
                        )}
                      {selectedEvent.eventType === "ScrollDepth" &&
                        selectedEvent.maxDepthPercent && (
                          <div>
                            <div className="text-xs text-slate-500">
                              {t("sessionTimeline.modal.fields.scrollDepth")}
                            </div>
                            <div className="font-medium text-slate-900">
                              {selectedEvent.maxDepthPercent}%
                            </div>
                          </div>
                        )}
                      {selectedEvent.eventType === "Click" && (
                        <>
                          {selectedEvent.elementTag && (
                            <div>
                              <div className="text-xs text-slate-500">
                                {t("sessionTimeline.modal.fields.clickElement")}
                              </div>
                              <div className="font-medium text-slate-900">
                                {selectedEvent.elementTag}
                              </div>
                            </div>
                          )}
                          {selectedEvent.elementText && (
                            <div>
                              <div className="text-xs text-slate-500">
                                {t("sessionTimeline.modal.fields.elementText")}
                              </div>
                              <div className="font-medium text-slate-900 max-h-32 overflow-y-auto">
                                {selectedEvent.elementText}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                      {(selectedEvent.eventType === "ViewProduct" ||
                        selectedEvent.eventType === "AddToCart" ||
                        selectedEvent.eventType === "RemoveFromCart") && (
                        <>
                          {selectedEvent.elementText && (
                            <div>
                              <div className="text-xs text-slate-500">
                                {t("sessionTimeline.modal.fields.productInfo")}
                              </div>
                              <div className="font-medium text-slate-900">
                                {selectedEvent.elementText}
                              </div>
                            </div>
                          )}
                          {selectedEvent.productName && (
                            <div>
                              <div className="text-xs text-slate-500">
                                {t("sessionTimeline.modal.fields.productName")}
                              </div>
                              <div className="font-medium text-slate-900">
                                {selectedEvent.productName}
                              </div>
                            </div>
                          )}
                          {selectedEvent.productId && (
                            <div>
                              <div className="text-xs text-slate-500">
                                {t("sessionTimeline.modal.fields.productId")}
                              </div>
                              <div className="font-medium text-slate-900">
                                {selectedEvent.productId}
                              </div>
                            </div>
                          )}
                          {selectedEvent.productCategory && (
                            <div>
                              <div className="text-xs text-slate-500">
                                {t(
                                  "sessionTimeline.modal.fields.productCategory",
                                )}
                              </div>
                              <div className="font-medium text-slate-900">
                                {selectedEvent.productCategory}
                              </div>
                            </div>
                          )}
                          {(selectedEvent.productPrice ||
                            selectedEvent.productPrice === 0) && (
                            <div>
                              <div className="text-xs text-slate-500">
                                {t("sessionTimeline.modal.fields.productPrice")}
                              </div>
                              <div className="font-medium text-slate-900">
                                {selectedEvent.productCurrency || "¥"}
                                {selectedEvent.productPrice}
                              </div>
                            </div>
                          )}
                          {selectedEvent.productBrand && (
                            <div>
                              <div className="text-xs text-slate-500">
                                {t("sessionTimeline.modal.fields.productBrand")}
                              </div>
                              <div className="font-medium text-slate-900">
                                {selectedEvent.productBrand}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                      {selectedEvent.eventType === "CompletePurchase" && (
                        <>
                          {selectedEvent.elementText && (
                            <div>
                              <div className="text-xs text-slate-500">
                                {t("sessionTimeline.modal.fields.orderInfo")}
                              </div>
                              <div className="font-medium text-slate-900">
                                {selectedEvent.elementText}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                      {(selectedEvent.eventType === "UserRegister" ||
                        selectedEvent.eventType === "UserLogin") && (
                        <>
                          {selectedEvent.elementText && (
                            <div>
                              <div className="text-xs text-slate-500">
                                {t("sessionTimeline.modal.fields.userInfo")}
                              </div>
                              <div className="font-medium text-slate-900">
                                {selectedEvent.elementText}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                      {selectedEvent.eventType === "SubmitForm" && (
                        <>
                          {selectedEvent.elementText && (
                            <div>
                              <div className="text-xs text-slate-500">
                                {t("sessionTimeline.modal.fields.formData")}
                              </div>
                              <div className="font-medium text-slate-900 max-h-32 overflow-y-auto">
                                {selectedEvent.elementText}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                      {selectedEvent.eventType === "Search" && (
                        <>
                          {selectedEvent.elementText && (
                            <div>
                              <div className="text-xs text-slate-500">
                                {t(
                                  "sessionTimeline.modal.fields.searchKeywords",
                                )}
                              </div>
                              <div className="font-medium text-slate-900">
                                {selectedEvent.elementText}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                      {selectedEvent.eventType === "PageDwellTime" &&
                        selectedEvent.dwellTimeMs && (
                          <div>
                            <div className="text-xs text-slate-500">
                              {t("sessionTimeline.modal.fields.dwellTime")}
                            </div>
                            <div className="font-medium text-slate-900">
                              {formatDwellTime(selectedEvent.dwellTimeMs)}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
