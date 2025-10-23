import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  getUserEventList,
  type ApiEvent,
  type ApiEventListResponse,
} from "@/lib/profile";
import { request } from "@/lib/request";

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
  gmtCreate?: string;
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
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState<ParsedEventData | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("basic-info");
  const [eventList, setEventList] = useState<ParsedEventData[]>([]);
  const [selectedEventIndex, setSelectedEventIndex] = useState(0);
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

  // Fetch event data
  const fetchEventData = useCallback(
    async (page: number) => {
      if (!cdpUserId) return;

      setLoading(true);
      try {
        const data = await getUserEventList(
          cdpUserId,
          sessionId,
          page,
          pageSize,
          2,
        ); // 2 for behavior data
        setEventData(data);
      } catch (error) {
        console.error("Failed to fetch event data:", error);
      } finally {
        setLoading(false);
      }
    },
    [cdpUserId, pageSize, sessionId],
  );

  // Load data on component mount and page change
  useEffect(() => {
    fetchEventData(currentPage);
  }, [fetchEventData, currentPage]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Handle row click to show event details
  const handleRowClick = async (event: ApiEvent) => {
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
      // Set the selected event as the current one and all related events
      const currentEvent = convertEventToData(event);
      
      setEventList(parsedEvents);
      setSelectedEventIndex(0); // Start with the first event
      setSelectedEventIndex(0);
      setSelectedEvent(parsedEvents[0]);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Failed to call profile page view API:", error);

      // Fallback: just show the clicked event if API call fails
      const eventData = convertEventToData(event);
      setSelectedEvent(eventData);
      // setEventList([eventData]);
      setSelectedEventIndex(0);
      setIsModalOpen(true);
    }
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  // Get event type badge component
  const getEventTypeBadge = (eventType: EventType) => {
    let bgColor = "bg-slate-100";
    let textColor = "text-slate-800";
    let displayName: string = eventType;

    switch (eventType) {
      case "$pageview":
        bgColor = "bg-blue-100";
        textColor = "text-blue-800";
        displayName = t("sessionTimeline.eventTypes.PageView");
        break;
      case "$pageleave":
        bgColor = "bg-orange-100";
        textColor = "text-orange-800";
        displayName = t("sessionTimeline.eventTypes.PageLeave");
        break;
      case "$autocapture":
        bgColor = "bg-gray-100";
        textColor = "text-gray-800";
        displayName = "Autocapture";
        break;
      case "ScrollDepth":
        bgColor = "bg-success-light";
        textColor = "text-success";
        displayName = t("sessionTimeline.eventTypes.ScrollDepth");
        break;
      case "Click":
        bgColor = "bg-purple-100";
        textColor = "text-purple-800";
        displayName = t("sessionTimeline.eventTypes.Click");
        break;
      case "ViewProduct":
        bgColor = "bg-green-100";
        textColor = "text-green-800";
        displayName = t("sessionTimeline.eventTypes.ViewProduct");
        break;
      case "AddToCart":
        bgColor = "bg-yellow-100";
        textColor = "text-yellow-800";
        displayName = t("sessionTimeline.eventTypes.AddToCart");
        break;
      case "RemoveFromCart":
        bgColor = "bg-red-100";
        textColor = "text-red-800";
        displayName = t("sessionTimeline.eventTypes.RemoveFromCart");
        break;
      case "StartCheckout":
        bgColor = "bg-indigo-100";
        textColor = "text-indigo-800";
        displayName = t("sessionTimeline.eventTypes.StartCheckout");
        break;
      case "CompletePurchase":
        bgColor = "bg-emerald-100";
        textColor = "text-emerald-800";
        displayName = t("sessionTimeline.eventTypes.CompletePurchase");
        break;
      case "UserRegister":
        bgColor = "bg-pink-100";
        textColor = "text-pink-800";
        displayName = t("sessionTimeline.eventTypes.UserRegister");
        break;
      case "UserLogin":
        bgColor = "bg-cyan-100";
        textColor = "text-cyan-800";
        displayName = t("sessionTimeline.eventTypes.UserLogin");
        break;
      case "SubmitForm":
        bgColor = "bg-amber-100";
        textColor = "text-amber-800";
        displayName = t("sessionTimeline.eventTypes.SubmitForm");
        break;
      case "Search":
        bgColor = "bg-violet-100";
        textColor = "text-violet-800";
        displayName = t("sessionTimeline.eventTypes.Search");
        break;
      case "PageDwellTime":
        bgColor = "bg-teal-100";
        textColor = "text-teal-800";
        displayName = t("sessionTimeline.eventTypes.PageDwellTime");
      case "Change":
        bgColor = "bg-blue-100";
        textColor = "text-blue-800";
        displayName = t("sessionTimeline.eventTypes.Change");
        break;
    }

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

  if (!eventData || eventData.records.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          {t("sessionTimeline.title")}
        </h3>
        <div className="flex items-center justify-center py-8">
          <div className="text-slate-500">{t("sessionTimeline.noData")}</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 行为事件列表 */}
      <div className="bg-white p-6 rounded-lg shadow-sm font-[Inter]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-900">
            {t("sessionTimeline.title")}
          </h3>
          <div className="text-sm text-slate-500">
            {t("sessionTimeline.recordsInfo", {
              total: eventData.total,
              start: startItem,
              end: endItem,
            })}
          </div>
        </div>

        {/* 时间线样式 */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 h-full w-0.5 bg-slate-200 -translate-x-1/2"></div>

          <div className="space-y-6 pl-8 relative">
            {eventData.records.map((event, index) => {
              const eventData = convertEventToData(event);
              return (
                <div
                  key={event.id}
                  className="relative bg-slate-50 rounded-lg border border-slate-200 p-4 hover:bg-slate-100 cursor-pointer transition-colors"
                  onClick={() => handleRowClick(event)}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-4 w-3 h-3 rounded-full border-4 border-white bg-blue-500 -ml-1.5"></div>

                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-sm font-medium text-slate-900">
                          {eventData.eventTime}
                        </div>
                        <div className="text-xs text-slate-500">
                          {eventData.source}
                        </div>
                        <div className="text-xs text-slate-500">
                          {eventData.deviceType}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        {/* {getEventTypeBadge(eventData.eventType)} */}
                        <div className="text-sm text-slate-700 truncate max-w-md">
                          {eventData.pageURL}
                        </div>
                      </div>

                      <div className="mt-1">
                        <div className="text-sm text-slate-900 font-medium">
                          {eventData.pageTitle || "No Title"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5l7 7-7 7"
                        ></path>
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
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
          className="fixed inset-0 z-50 flex items-center justify-center"
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
                          <div className="flex items-center gap-2">
                            {getEventTypeBadge(event.eventType)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 右侧 - 事件详情 */}
                <div className="flex-1 overflow-y-auto p-6">
                  {/* 事件基本信息 */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-slate-900 mb-3">
                      {t("sessionTimeline.modal.basicInfo")}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm  bg-slate-50 rounded-lg">
                      {/* <div>
                        <div className="text-xs text-slate-500">
                          {t("sessionTimeline.modal.fields.eventTime")}
                        </div>
                        <div className="font-medium text-slate-900">
                          {selectedEvent.eventTime}
                        </div>
                      </div> */}
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
                  </div>

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
