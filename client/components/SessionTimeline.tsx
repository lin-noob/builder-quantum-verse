import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Eye, LogOut, MousePointer, ArrowDownToLine, ShoppingCart, MinusCircle, CreditCard, CheckCircle, UserPlus, LogIn, Send, Search as SearchIcon, Pencil } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  getUserEventList,
  type ApiEvent,
  type ApiEventListResponse,
} from "@/lib/profile";

// Event types mapping
type EventType =
  | "$pageview"
  | "$pageleave"
  | "$autocapture"
  | "ScrollDepth"
  | "Click"
  | "ViewProduct"
  | "AddToCart"
  | "RemoveFromCart"
  | "StartCheckout"
  | "CompletePurchase"
  | "UserRegister"
  | "UserLogin"
  | "SubmitForm"
  | "Search"
  | "PageDwellTime"
  | "Change";

// Element interface for PostHog $elements array
interface PostHogElement {
  tag_name?: string;
  attr__id?: string;
  attr__class?: string;
  classes?: string[];
  nth_child?: number;
  nth_of_type?: number;
  $el_text?: string;
  attr__data_gtm_form_interact_id?: string;
}

// Parsed event data structure
interface ParsedEventData {
  id: string;
  eventTime: string;
  eventType: EventType;
  source: string;
  deviceType: string;
  pageTitle: string;
  pageURL: string;
  browser?: string;
  os?: string;
  dwellTimeMs?: number;
  maxScrollDepth?: number;
  maxDepthPercent?: number;
  elementTag?: string;
  elementText?: string;
  referrer?: string;
  // Product related fields for ViewProduct event
  productId?: string;
  productName?: string;
  productCategory?: string;
  productPrice?: number | string;
  productCurrency?: string;
  productBrand?: string;
  // PostHog specific fields
  $event_type?: string;
  $browser_version?: number;
  $timezone?: string;
  $current_url?: string;
  $referrer?: string;
  $pathname?: string;
  $elements?: PostHogElement[];
  $elements_chain?: string;
  cusEventType?: string;
  $screen_width?: number;
  $screen_height?: number;
  $viewport_width?: number;
  $viewport_height?: number;
}

// Session interface
interface Session {
  id: string;
  startTime: string;
  endTime: string;
  events: { ev: ApiEvent; parsed: ParsedEventData }[];
  duration: number; // in minutes
}

export default function SessionTimeline({
  cdpUserId,
  sessionId,
}: {
  cdpUserId: string;
  sessionId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [allEvents, setAllEvents] = useState<ApiEvent[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState<ParsedEventData | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showKeyOnly, setShowKeyOnly] = useState(true);
  const [timeRange, setTimeRange] = useState<{ start?: string; end?: string }>({});
  const [filterEventType, setFilterEventType] = useState<EventType | 'all'>('all');
  const [filterSource, setFilterSource] = useState<string | 'all'>('all');
  const [filterDevice, setFilterDevice] = useState<string | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const loadingRef = useRef<HTMLDivElement>(null);
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

    // 定义有效的事件类型
    const validEventTypes: EventType[] = [
      "$pageview", "$pageleave", "$autocapture", "ScrollDepth", "Click",
      "ViewProduct", "AddToCart", "RemoveFromCart", "StartCheckout",
      "CompletePurchase", "UserRegister", "UserLogin", "SubmitForm",
      "Search", "PageDwellTime", "Change"
    ];

    // 安全的类型转换
    let eventType: EventType = validEventTypes.includes(event.eventName as EventType) 
      ? (event.eventName as EventType) 
      : "$autocapture"; // 默认值

    // 如果 eventName 是 $autocapture，则使用 properties 中的 $event_type
    if (event.eventName === "$autocapture" && properties.$event_type) {
      // 将 $event_type 映射到对应的事件类型
      const eventTypeMapping: { [key: string]: EventType } = {
        click: "Click",
        submit: "SubmitForm",
        change: "Change",
      };
      eventType = eventTypeMapping[properties.$event_type] || "$autocapture";
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
    };
  };

  // Fetch event data with auto-loading logic
  const fetchEventData = useCallback(
    async (page: number, append: boolean = false) => {
      if (!cdpUserId || loading) return;

      setLoading(true);
      try {
        const data = await getUserEventList(
          cdpUserId,
          sessionId,
          page,
          pageSize,
          2,
        ); // 2 for behavior data
        
        // Check if data is null or undefined
        if (!data) {
          console.warn("No data returned from getUserEventList");
          setHasMore(false);
          return;
        }
        
        // Ensure data.records exists and is an array
        const events = data.records || [];
        
        if (append) {
          setAllEvents(prev => [...prev, ...events]);
        } else {
          setAllEvents(events);
        }
        
        // Check if there are more pages
        const totalPages = Math.ceil((data.total || 0) / pageSize);
        setHasMore(page < totalPages);
      } catch (error) {
        console.error("Failed to fetch event data:", error);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [cdpUserId, pageSize, sessionId, loading],
  );

  // Load more data when scrolling to bottom
  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchEventData(nextPage, true);
    }
  }, [hasMore, loading, currentPage, fetchEventData]);

  // Intersection Observer for auto-loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => observer.disconnect();
  }, [loadMore]);

  // Load initial data
  useEffect(() => {
    setAllEvents([]);
    setCurrentPage(1);
    setHasMore(true);
    fetchEventData(1, false);
  }, [cdpUserId, sessionId]);



  // Handle row click to show event details
  const handleRowClick = (event: ApiEvent) => {
    const eventData = convertEventToData(event);
    setSelectedEvent(eventData);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  // Helper: identify key events for highlighting & filtering
  const isKeyEvent = (type: EventType): boolean => {
    return (
      type === "AddToCart" ||
      type === "StartCheckout" ||
      type === "CompletePurchase" ||
      type === "UserLogin" ||
      type === "SubmitForm"
    );
  };

  // Group events into sessions based on time gaps
  const groupIntoSessions = (records: { ev: ApiEvent; parsed: ParsedEventData }[]): Session[] => {
    if (records.length === 0) return [];
    
    // Sort records by time
    const sortedRecords = [...records].sort((a, b) => 
      new Date(a.parsed.eventTime).getTime() - new Date(b.parsed.eventTime).getTime()
    );
    
    const sessions: Session[] = [];
    let currentSession: { ev: ApiEvent; parsed: ParsedEventData }[] = [];
    let sessionStartTime = sortedRecords[0].parsed.eventTime;
    
    // Session timeout: 30 minutes of inactivity
    const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
    
    for (let i = 0; i < sortedRecords.length; i++) {
      const current = sortedRecords[i];
      const currentTime = new Date(current.parsed.eventTime).getTime();
      
      if (currentSession.length === 0) {
        // Start new session
        currentSession = [current];
        sessionStartTime = current.parsed.eventTime;
      } else {
        const lastEventTime = new Date(currentSession[currentSession.length - 1].parsed.eventTime).getTime();
        const timeDiff = currentTime - lastEventTime;
        
        if (timeDiff > SESSION_TIMEOUT_MS) {
          // End current session and start new one
          const sessionEndTime = currentSession[currentSession.length - 1].parsed.eventTime;
          const duration = Math.round((new Date(sessionEndTime).getTime() - new Date(sessionStartTime).getTime()) / (1000 * 60));
          
          sessions.push({
            id: `session-${sessions.length + 1}`,
            startTime: sessionStartTime,
            endTime: sessionEndTime,
            events: currentSession,
            duration: Math.max(duration, 1)
          });
          
          // Start new session
          currentSession = [current];
          sessionStartTime = current.parsed.eventTime;
        } else {
          // Add to current session
          currentSession.push(current);
        }
      }
    }
    
    // Add the last session
    if (currentSession.length > 0) {
      const sessionEndTime = currentSession[currentSession.length - 1].parsed.eventTime;
      const duration = Math.round((new Date(sessionEndTime).getTime() - new Date(sessionStartTime).getTime()) / (1000 * 60));
      
      sessions.push({
        id: `session-${sessions.length + 1}`,
        startTime: sessionStartTime,
        endTime: sessionEndTime,
        events: currentSession,
        duration: Math.max(duration, 1)
      });
    }
    
    return sessions;
  };

  // Format session duration
  const formatSessionDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}分钟`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}小时${remainingMinutes}分钟` : `${hours}小时`;
  };

  // Helper: icon mapping for event types
  const getEventTypeIcon = (eventType: EventType) => {
    switch (eventType) {
      case "$pageview":
        return <Eye className="h-3.5 w-3.5 mr-1" />;
      case "$pageleave":
        return <LogOut className="h-3.5 w-3.5 mr-1" />;
      case "ScrollDepth":
        return <ArrowDownToLine className="h-3.5 w-3.5 mr-1" />;
      case "Click":
        return <MousePointer className="h-3.5 w-3.5 mr-1" />;
      case "ViewProduct":
        return <Eye className="h-3.5 w-3.5 mr-1" />;
      case "AddToCart":
        return <ShoppingCart className="h-3.5 w-3.5 mr-1" />;
      case "RemoveFromCart":
        return <MinusCircle className="h-3.5 w-3.5 mr-1" />;
      case "StartCheckout":
        return <CreditCard className="h-3.5 w-3.5 mr-1" />;
      case "CompletePurchase":
        return <CheckCircle className="h-3.5 w-3.5 mr-1" />;
      case "UserRegister":
        return <UserPlus className="h-3.5 w-3.5 mr-1" />;
      case "UserLogin":
        return <LogIn className="h-3.5 w-3.5 mr-1" />;
      case "SubmitForm":
        return <Send className="h-3.5 w-3.5 mr-1" />;
      case "Search":
        return <SearchIcon className="h-3.5 w-3.5 mr-1" />;
      case "PageDwellTime":
        return <Eye className="h-3.5 w-3.5 mr-1" />;
      case "Change":
        return <Pencil className="h-3.5 w-3.5 mr-1" />;
      default:
        return null;
    }
  };

  // Get event type badge component (with icon)
  const getEventTypeBadge = (eventType: EventType) => {
    let bgColor = "bg-slate-100";
    let textColor = "text-slate-800";
    let displayName: string = eventType;

    switch (eventType) {
      case "$pageview":
        bgColor = "bg-blue-100";
        textColor = "text-blue-800";
        displayName = "页面浏览";
        break;
      case "$pageleave":
        bgColor = "bg-orange-100";
        textColor = "text-orange-800";
        displayName = "页面离开";
        break;
      case "$autocapture":
        bgColor = "bg-gray-100";
        textColor = "text-gray-800";
        displayName = "Autocapture";
        break;
      case "ScrollDepth":
        bgColor = "bg-success-light";
        textColor = "text-success";
        displayName = "滚动深度";
        break;
      case "Click":
        bgColor = "bg-purple-100";
        textColor = "text-purple-800";
        displayName = "点击";
        break;
      case "ViewProduct":
        bgColor = "bg-green-100";
        textColor = "text-green-800";
        displayName = "查看商品";
        break;
      case "AddToCart":
        bgColor = "bg-yellow-100";
        textColor = "text-yellow-800";
        displayName = "加入购物车";
        break;
      case "RemoveFromCart":
        bgColor = "bg-red-100";
        textColor = "text-red-800";
        displayName = "移出购物车";
        break;
      case "StartCheckout":
        bgColor = "bg-indigo-100";
        textColor = "text-indigo-800";
        displayName = "开始结算";
        break;
      case "CompletePurchase":
        bgColor = "bg-gray-100";
        textColor = "text-gray-800";
        displayName = "完成购买";
        break;
      case "UserRegister":
        bgColor = "bg-pink-100";
        textColor = "text-pink-800";
        displayName = "用户注册";
        break;
      case "UserLogin":
        bgColor = "bg-cyan-100";
        textColor = "text-cyan-800";
        displayName = "用户登录";
        break;
      case "SubmitForm":
        bgColor = "bg-amber-100";
        textColor = "text-amber-800";
        displayName = "提交表单";
        break;
      case "Search":
        bgColor = "bg-violet-100";
        textColor = "text-violet-800";
        displayName = "搜索";
        break;
      case "PageDwellTime":
        bgColor = "bg-teal-100";
        textColor = "text-teal-800";
        displayName = "页面停留";
        break;
      case "Change":
        bgColor = "bg-blue-100";
        textColor = "text-blue-800";
        displayName = "修改";
        break;
    }

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${bgColor} ${textColor}`}
      >
        {getEventTypeIcon(eventType)}
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
      return `${minutes}分${remainingSeconds}秒`;
    }
    return `${remainingSeconds}秒`;
  };

  const formatScrollDepth = (percent?: number, px?: number): string => {
    if (!percent && !px) return "-";
    const p = percent ? `${percent}%` : "";
    const d = px ? `${px}px` : "";
    return [p, d].filter(Boolean).join(" / ");
  };

  // Derive simple stage flags
  const deriveStages = (records: ApiEvent[]) => {
    const types = records.map((r) => {
      const properties = parseEventProperties(r.properties);
      return (properties.$event_type || r.eventName) as string;
    });
    const hasDiscover = types.some((t) => t === "$pageview" || t === "Search");
    const hasConsider = types.some((t) => t === "ViewProduct" || t === "Click" || t === "SubmitForm");
    const hasBuy = types.some((t) => t === "AddToCart" || t === "StartCheckout" || t === "CompletePurchase");
    const hasAfter = types.some((t) => t === "$pageleave");
    return { hasDiscover, hasConsider, hasBuy, hasAfter };
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-center py-8">
          <div className="text-slate-500">加载中...</div>
        </div>
      </div>
    );
  }

  if (allEvents.length === 0 && !loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-center py-8">
          <div className="text-slate-500">暂无数据</div>
        </div>
      </div>
    );
  }

  // Apply filters based on toggle and time range
  const parsedRecords = allEvents.map((ev) => ({ ev, parsed: convertEventToData(ev) }));
  const timeFiltered = parsedRecords.filter(({ parsed }) => {
    if (!timeRange.start && !timeRange.end) return true;
    const ts = new Date(parsed.eventTime).getTime();
    const afterStart = timeRange.start ? ts >= new Date(timeRange.start).getTime() : true;
    const beforeEnd = timeRange.end ? ts <= new Date(timeRange.end).getTime() : true;
    return afterStart && beforeEnd;
  });
  // 多维筛选 + 搜索（当前页数据范围内）
  const normalize = (s?: string) => (s || "").toLowerCase();
  const attributeFiltered = timeFiltered.filter(({ parsed }) =>
    (filterEventType === 'all' || parsed.eventType === filterEventType) &&
    (filterSource === 'all' || normalize(parsed.source) === normalize(filterSource)) &&
    (filterDevice === 'all' || normalize(parsed.deviceType) === normalize(filterDevice))
  );
  const searchFiltered = attributeFiltered.filter(({ parsed }) => {
    if (!searchQuery) return true;
    const hay = `${normalize(parsed.pageURL)} ${normalize(parsed.pageTitle)} ${normalize(parsed.elementText)}`;
    const q = normalize(searchQuery);
    return hay.includes(q);
  });
  const finalRecords = searchFiltered.filter(({ parsed }) => (showKeyOnly ? isKeyEvent(parsed.eventType) || parsed.eventType === "$pageview" : true));

  // Group filtered records into sessions
  const sessions = groupIntoSessions(finalRecords);

  // 已移除阶段徽章显示，不再计算 stages

  return (
    <>
      {/* 行为事件列表 */}
      <div className="bg-white p-6 rounded-lg shadow-sm font-[Inter]">

        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-6">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="搜索行为、页面或元素"
              className="border rounded px-2 py-1 text-sm w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div>
            <select
              className="border rounded px-2 py-1 text-sm w-full"
              value={filterEventType}
              onChange={(e) => setFilterEventType(e.target.value as any)}
            >
              <option value="all">全部事件</option>
              {Array.from(new Set(parsedRecords.map(({ parsed }) => parsed.eventType))).map((et) => (
                <option key={et as string} value={et as string}>{et as string}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              className="border rounded px-2 py-1 text-sm w-full"
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
            >
              <option value="all">全部来源</option>
              {Array.from(new Set(parsedRecords.map(({ parsed }) => parsed.source).filter(Boolean))).map((s) => (
                <option key={s as string} value={s as string}>{s as string}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              className="border rounded px-2 py-1 text-sm w-full"
              value={filterDevice}
              onChange={(e) => setFilterDevice(e.target.value)}
            >
              <option value="all">全部设备</option>
              {Array.from(new Set(parsedRecords.map(({ parsed }) => parsed.deviceType).filter(Boolean))).map((d) => (
                <option key={d as string} value={d as string}>{d as string}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
          <div>
            
            <input
              type="datetime-local"
              placeholder="选择起始时间"
              className="border rounded px-2 py-1 text-sm w-full"
              value={timeRange.start || ""}
              onChange={(e) => setTimeRange((r) => ({ ...r, start: e.target.value }))}
            />
          </div>
          <div>
            
            <input
              type="datetime-local"
              placeholder="选择结束时间"
              className="border rounded px-2 py-1 text-sm w-full"
              value={timeRange.end || ""}
              onChange={(e) => setTimeRange((r) => ({ ...r, end: e.target.value }))}
            />
          </div>
          <div className="flex items-end gap-2">
            
            <Button size="sm" onClick={() => setCurrentPage(1)}>
              <SearchIcon className="h-4 w-4 mr-1" />
              搜索
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setFilterEventType("all");
                setFilterSource("all");
                setFilterDevice("all");
                setTimeRange({});
                setCurrentPage(1);
              }}
            >
              重置
            </Button>
          </div>
        </div>

        {/* 时间轴视图 */}
        <div>
          <div className="relative">
            {sessions.map((session, sessionIndex) => (
              <div key={session.id} className="mb-8">
                {/* Session Header */}
                <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="font-medium text-slate-900">会话 {sessionIndex + 1}</span>
                  </div>
                  <div className="text-sm text-slate-600">
                    {new Date(session.startTime).toLocaleString('zh-CN')} - {new Date(session.endTime).toLocaleString('zh-CN')}
                  </div>
                  <div className="text-sm text-slate-500">
                    时长: {formatSessionDuration(session.duration)}
                  </div>
                  <div className="text-sm text-slate-500">
                    {session.events.length} 个事件
                  </div>
                </div>
                
                {/* Session Events */}
                <div className="border-l-2 border-slate-200 pl-6 ml-6">
                  {session.events.map(({ ev, parsed }) => {
                    const repeatCount = parsed.pageURL
                      ? session.events.filter((x) => x.parsed.pageURL === parsed.pageURL && new Date(x.parsed.eventTime) <= new Date(parsed.eventTime)).length
                      : 1;
                    return (
                      <div
                        key={ev.id}
                        className="group mb-3 rounded-lg border border-slate-200 bg-white p-3 hover:bg-slate-50 hover:border-blue-300 hover:shadow-sm cursor-pointer relative transition"
                        onClick={() => handleRowClick(ev)}
                      >
                        {/* 时间线圆点 */}
                        <span className="absolute -left-3 top-4 w-3 h-3 rounded-full bg-slate-300 border-2 border-white"></span>

                        {/* 顶部：时间 • 来源(web) • 设备(Desktop) */}
                        <div className="text-xs text-slate-500">
                          {new Date(parsed.eventTime).toLocaleString('zh-CN')}
                          <span className="mx-1">•</span>
                          来源(web)
                          <span className="mx-1">•</span>
                          设备(Desktop)
                        </div>

                        {/* 标题：页面标题 */}
                        <div className="mt-1">
                          <span className="text-slate-900 font-medium">
                            {parsed.pageTitle || ""}
                          </span>
                        </div>

                        {/* 链接：页面URL */}
                        {parsed.pageURL && (
                          <div className="mt-1 text-xs text-slate-600 break-all">
                            {parsed.pageURL}
                          </div>
                        )}

                        {/* 移除其他附加信息，仅保留指定字段 */}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          
          {/* Loading indicator and auto-load trigger */}
          {hasMore && (
            <div ref={loadingRef} className="flex justify-center py-4">
              {loading ? (
                <div className="text-sm text-slate-500">加载中...</div>
              ) : (
                <div className="text-sm text-slate-400">滚动加载更多</div>
              )}
            </div>
          )}
          
          {!hasMore && allEvents.length > 0 && (
            <div className="text-center py-4 text-sm text-slate-400">
              已加载全部 {allEvents.length} 条记录，共 {sessions.length} 个会话
            </div>
          )}
        </div>

      </div>

      {/* 事件详情右侧抽屉 */}
      {isModalOpen && selectedEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">事件详情</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              {/* 顶部信息区：严格对齐截图字段 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm text-slate-800">
                <div>
                  <div className="text-slate-500">设备类型</div>
                  <div className="font-medium">{selectedEvent.deviceType || "-"}</div>
                </div>
                <div>
                  <div className="text-slate-500">浏览器</div>
                  <div className="font-medium">{selectedEvent.browser || "-"}</div>
                </div>
                <div>
                  <div className="text-slate-500">来源</div>
                  <div className="font-medium">{selectedEvent.source || "-"}</div>
                </div>
                <div>
                  <div className="text-slate-500">操作系统</div>
                  <div className="font-medium">{selectedEvent.os || "-"}</div>
                </div>
                <div>
                  <div className="text-slate-500">Screen/Viewport</div>
                  <div className="font-medium">{selectedEvent.$screen_width && selectedEvent.$screen_height ? `${selectedEvent.$screen_width} × ${selectedEvent.$screen_height}` : "-"}</div>
                </div>
                <div>
                  <div className="text-slate-500">Viewport Size</div>
                  <div className="font-medium">{selectedEvent.$viewport_width && selectedEvent.$viewport_height ? `${selectedEvent.$viewport_width} × ${selectedEvent.$viewport_height}` : "-"}</div>
                </div>
                <div>
                  <div className="text-slate-500">Browser Version</div>
                  <div className="font-medium">{selectedEvent.$browser_version ?? "-"}</div>
                </div>
                <div>
                  <div className="text-slate-500">Timezone</div>
                  <div className="font-medium">{selectedEvent.$timezone ?? "-"}</div>
                </div>
                <div>
                  <div className="text-slate-500">Start Time</div>
                  <div className="font-medium">{new Date(selectedEvent.eventTime).toLocaleString('zh-CN')}</div>
                </div>
                <div>
                  <div className="text-slate-500">End Time</div>
                  <div className="font-medium">{new Date(selectedEvent.eventTime).toLocaleString('zh-CN')}</div>
                </div>
              </div>

              {/* 主体两列：左侧事件线 + 右侧详情 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* 左侧：事件线 */}
                <div className="md:col-span-1">
                  <div className="text-sm font-medium mb-2 text-slate-900">事件线</div>
                  {(() => {
                    const selectedSession = sessions.find((s) => s.events.some((e) => e.ev.id === selectedEvent?.id));
                    const items = selectedSession ? selectedSession.events : [];
                    return (
                      <div className="space-y-2">
                        {items.map((e) => {
                          const label = e.parsed.$event_type ? e.parsed.$event_type : e.parsed.eventType;
                          const isActive = e.ev.id === selectedEvent.id;
                          const timeStr = new Date(e.parsed.eventTime).toLocaleString('zh-CN');
                          return (
                            <div
                              key={e.ev.id}
                              className={`px-3 py-2 rounded border ${isActive ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-700'} cursor-pointer`}
                              onClick={() => setSelectedEvent(e.parsed)}
                            >
                              <div className="text-xs font-medium">{label}</div>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                {timeStr}
                                {e.parsed.pageTitle ? <span> • {e.parsed.pageTitle}</span> : null}
                                {e.parsed.pageURL ? (
                                  <div className="break-all mt-0.5">{e.parsed.pageURL}</div>
                                ) : null}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>

                {/* 右侧：页面信息 + 事件详细信息 */}
                <div className="md:col-span-3">
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-slate-900 mb-3">页面信息</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm text-slate-700">
                      <div>页面标题：{selectedEvent.pageTitle || "-"}</div>
                      <div className="col-span-2 break-all">页面URL：{selectedEvent.pageURL || "-"}</div>
                      <div className="col-span-2 break-all">来源页面：{selectedEvent.referrer || selectedEvent.$referrer || "-"}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-slate-900 mb-3">详情</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm text-slate-700">
                      <div>Event Type：{selectedEvent.$event_type || selectedEvent.eventType}</div>
                      {(() => {
                        const el = Array.isArray(selectedEvent.$elements) && selectedEvent.$elements.length > 0 ? selectedEvent.$elements[0] : null;
                        const tag = el?.tag_name || selectedEvent.elementTag;
                        const nth = el?.nth_child ?? undefined;
                        const classes = el?.classes && el.classes.length ? el.classes.join(', ') : undefined;
                        return (
                          <>
                            <div className="col-span-2">
                              Click/Submit Element：<span className="inline-block bg-slate-100 rounded px-2 py-0.5 ml-1 text-xs">{tag ? `<${tag}>` : "-"}</span>
                            </div>
                            {classes && (
                              <div className="col-span-2 break-all">Classes：{classes}</div>
                            )}
                            <div>Position：{typeof nth === 'number' ? `nth-child(${nth})` : '-'}</div>
                            {selectedEvent.elementText && (
                              <div className="col-span-2 break-all">元素文本：{selectedEvent.elementText}</div>
                            )}
                          </>
                        );
                      })()}
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
