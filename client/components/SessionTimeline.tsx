import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  getUserEventList,
  type ApiEvent,
  type ApiEventListResponse,
} from "@/lib/profile";

// Event types mapping
type EventType = "PageView" | "PageLeave" | "ScrollDepth" | "Click";

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
}
export default function SessionTimeline({ cdpUserId }: { cdpUserId: string }) {
  const [loading, setLoading] = useState(false);
  const [eventData, setEventData] = useState<ApiEventListResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState<ParsedEventData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pageSize = 10;

  // Parse properties JSON string to extract event details
  const parseEventProperties = (propertiesStr: string): any => {
    try {
      return JSON.parse(propertiesStr);
    } catch (error) {
      console.error('Failed to parse event properties:', error);
      return {};
    }
  };

  // Convert API event to parsed event data
  const convertEventToData = (event: ApiEvent): ParsedEventData => {
    const properties = parseEventProperties(event.properties);

    return {
      id: event.id,
      eventTime: event.gmtCreate,
      eventType: event.eventName as EventType,
      source: properties.source || '',
      deviceType: properties.deviceType || '',
      pageTitle: properties.pageTitle || '',
      pageURL: properties.pageURL || '',
      browser: properties.browser || '',
      os: properties.os || '',
      dwellTimeMs: properties.dwellTimeMs,
      maxScrollDepth: properties.maxScrollDepth,
      maxDepthPercent: properties.maxDepthPercent,
      elementTag: properties.elementTag,
      elementText: properties.elementText,
      referrer: properties.referrer,
    };
  };

  // Fetch event data
  const fetchEventData = useCallback(
    async (page: number) => {
      if (!cdpUserId) return;

      setLoading(true);
      try {
        const data = await getUserEventList(cdpUserId, page, pageSize, 2); // 2 for behavior data
        setEventData(data);
      } catch (error) {
        console.error("Failed to fetch event data:", error);
      } finally {
        setLoading(false);
      }
    },
    [cdpUserId, pageSize],
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

  // Get event type badge component
  const getEventTypeBadge = (eventType: EventType) => {
    let bgColor = "bg-slate-100";
    let textColor = "text-slate-800";
    let displayName: string = eventType;

    switch (eventType) {
      case "PageView":
        bgColor = "bg-blue-100";
        textColor = "text-blue-800";
        displayName = "页面浏览";
        break;
      case "PageLeave":
        bgColor = "bg-orange-100";
        textColor = "text-orange-800";
        displayName = "页面离开";
        break;
      case "ScrollDepth":
        bgColor = "bg-green-100";
        textColor = "text-green-800";
        displayName = "滚动深度";
        break;
      case "Click":
        bgColor = "bg-purple-100";
        textColor = "text-purple-800";
        displayName = "点击事件";
        break;
    }

    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${bgColor} ${textColor}`}>
        {displayName}
      </span>
    );
  };

  // Format dwell time from milliseconds
  const formatDwellTime = (dwellTimeMs?: number): string => {
    if (!dwellTimeMs) return 'N/A';
    const seconds = Math.floor(dwellTimeMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}分${remainingSeconds}秒`;
    }
    return `${remainingSeconds}秒`;
  };

  // Calculate pagination info
  const totalPages = eventData ? Math.ceil(eventData.total / pageSize) : 0;
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, eventData?.total || 0);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">访问与行为时间线</h3>
        <div className="flex items-center justify-center py-8">
          <div className="text-slate-500">加载中...</div>
        </div>
      </div>
    );
  }

  if (!eventData || eventData.records.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">访问与行为时间线</h3>
        <div className="flex items-center justify-center py-8">
          <div className="text-slate-500">暂无行为数据</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 行为事件列表 */}
      <div className="bg-white p-6 rounded-lg shadow-sm font-[Inter]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-900">访问与行为时间线</h3>
          <div className="text-sm text-slate-500">
            共 {eventData.total} 条记录，显示第 {startItem}-{endItem} 条
          </div>
        </div>

        {/* 数据表格 */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="p-3 font-medium">事件时间</th>
                <th className="p-3 font-medium">来源</th>
                <th className="p-3 font-medium">设备类型</th>
                <th className="p-3 font-medium">事件类型</th>
                <th className="p-3 font-medium">页面URL</th>
                <th className="p-3 font-medium">页面标题</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {eventData.records.map((event) => {
                const eventData = convertEventToData(event);
                return (
                  <tr
                    key={event.id}
                    className="hover:bg-slate-50 cursor-pointer"
                    onClick={() => handleRowClick(event)}
                  >
                    <td className="p-3 text-slate-900 font-medium">
                      {eventData.eventTime}
                    </td>
                    <td className="p-3 text-slate-600">
                      {eventData.source}
                    </td>
                    <td className="p-3 text-slate-600">
                      {eventData.deviceType}
                    </td>
                    <td className="p-3">
                      {getEventTypeBadge(eventData.eventType)}
                    </td>
                    <td className="p-3 text-slate-600">
                      {eventData.pageURL}
                    </td>
                    <td className="p-3 text-slate-600">
                      {eventData.pageTitle}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-slate-500">
              第 {currentPage} 页，共 {totalPages} 页
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                上一页
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                下一页
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
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* 弹窗头部 */}
            <div className="flex justify-between items-center p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">事件详情</h3>
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

            {/* 弹窗主体 */}
            <div className="p-6 overflow-y-auto">
              {/* 事件基本信息 */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-slate-900 mb-3">
                  事件基本信息
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm p-4 bg-slate-50 rounded-lg">
                  <div>
                    <div className="text-xs text-slate-500">事件时间</div>
                    <div className="font-medium text-slate-900">{selectedEvent.eventTime}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">事件类型</div>
                    <div className="font-medium text-slate-900">
                      {getEventTypeBadge(selectedEvent.eventType)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">来源</div>
                    <div className="font-medium text-slate-900">{selectedEvent.source}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">设备类型</div>
                    <div className="font-medium text-slate-900">{selectedEvent.deviceType}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">浏览器</div>
                    <div className="font-medium text-slate-900">{selectedEvent.browser || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">操作系统</div>
                    <div className="font-medium text-slate-900">{selectedEvent.os || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* 页面信息 */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-slate-900 mb-3">
                  页面信息
                </h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="text-xs text-slate-500">页面标题</div>
                    <div className="font-medium text-slate-900">{selectedEvent.pageTitle}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">页面URL</div>
                    <div className="font-medium text-slate-900 break-all">{selectedEvent.pageURL}</div>
                  </div>
                  {selectedEvent.referrer && (
                    <div>
                      <div className="text-xs text-slate-500">来源页面</div>
                      <div className="font-medium text-slate-900 break-all">{selectedEvent.referrer}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* 事件特定信息 */}
              <div>
                <h4 className="text-sm font-medium text-slate-900 mb-3">
                  事件详细信息
                </h4>
                <div className="space-y-3 text-sm">
                  {selectedEvent.eventType === "PageLeave" && selectedEvent.dwellTimeMs && (
                    <div>
                      <div className="text-xs text-slate-500">页面停留时长</div>
                      <div className="font-medium text-slate-900">{formatDwellTime(selectedEvent.dwellTimeMs)}</div>
                    </div>
                  )}
                  {selectedEvent.eventType === "PageLeave" && selectedEvent.maxScrollDepth && (
                    <div>
                      <div className="text-xs text-slate-500">最大滚动深度</div>
                      <div className="font-medium text-slate-900">{selectedEvent.maxScrollDepth}%</div>
                    </div>
                  )}
                  {selectedEvent.eventType === "ScrollDepth" && selectedEvent.maxDepthPercent && (
                    <div>
                      <div className="text-xs text-slate-500">滚动深度</div>
                      <div className="font-medium text-slate-900">{selectedEvent.maxDepthPercent}%</div>
                    </div>
                  )}
                  {selectedEvent.eventType === "Click" && (
                    <>
                      {selectedEvent.elementTag && (
                        <div>
                          <div className="text-xs text-slate-500">点击元素标签</div>
                          <div className="font-medium text-slate-900">{selectedEvent.elementTag}</div>
                        </div>
                      )}
                      {selectedEvent.elementText && (
                        <div>
                          <div className="text-xs text-slate-500">元素文本内容</div>
                          <div className="font-medium text-slate-900 max-h-32 overflow-y-auto">
                            {selectedEvent.elementText}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
