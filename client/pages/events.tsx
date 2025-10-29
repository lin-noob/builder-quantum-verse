import { useState, useEffect } from "react";
import { Incident } from "@shared/types";
import { mockIncidents } from "@/data/mockData";
import IncidentListItem from "@/components/incident/IncidentListItem";
import IncidentDetails from "@/components/incident/IncidentDetails";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { request } from "@/lib/request";
import { getEventDetails } from "@/services/incidentService";

type PriorityFilter = "all" | "high" | "medium" | "low";
type ProgressFilter =
  | "all"
  | "pending_human"
  | "in_progress"
  | "automated"
  | "resolved";
type TypeFilter = "all" | "type_customer" | "type_order" | "type_product";

// 后端数据映射函数
const mapPriority = (priority: string): "low" | "medium" | "high" => {
  switch (priority) {
    case "1":
      return "low";
    case "2":
      return "medium";
    case "3":
      return "high";
    default:
      return "medium";
  }
};

const mapStatus = (
  status: string,
): "pending_human" | "in_progress" | "resolved" | "automated" => {
  switch (status) {
    case "1":
      return "pending_human";
    case "2":
      return "in_progress";
    case "3":
      return "resolved";
    case "4":
      return "automated";
    default:
      return "pending_human";
  }
};

// 添加事件类型映射函数
const getEventTypeValue = (typeFilter: TypeFilter): string | undefined => {
  switch (typeFilter) {
    case "type_customer":
      return "1"; // 客户相关
    case "type_order":
      return "2"; // 订单相关
    case "type_product":
      return "3"; // 商品相关
    default:
      return undefined; // 全部类型
  }
};

const priorityFilterLabels: Record<PriorityFilter, string> = {
  all: "全部",
  high: "高",
  medium: "中",
  low: "低",
};

const progressFilterLabels: Record<ProgressFilter, string> = {
  all: "全部",
  pending_human: "待处理",
  in_progress: "处理中",
  automated: "AI全自动处理中",
  resolved: "已完成",
};

const typeFilterLabels: Record<TypeFilter, string> = {
  all: "全部类型",
  type_customer: "客户相关",
  type_order: "订单相关",
  type_product: "商品相关",
};

// 类型筛选不再显示计数

export default function Index() {
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>([]);
  const [activePriorityFilter, setActivePriorityFilter] =
    useState<PriorityFilter>("all");
  const [activeProgressFilter, setActiveProgressFilter] =
    useState<ProgressFilter>("all");
  const [activeTypeFilter, setActiveTypeFilter] = useState<TypeFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [fetchingDetailId, setFetchingDetailId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [countData, setCountData] = useState({
    highCount: 0,
    pendingCount: 0,
  });

  const fetchEventPage = async (page: number = 1, size: number = 10) => {
    try {
      // 使用模拟数据进行筛选
      let filteredIncidents = [...mockIncidents];

      // 应用优先级筛选
      if (activePriorityFilter !== "all") {
        filteredIncidents = filteredIncidents.filter(
          incident => incident.priority === activePriorityFilter
        );
      }

      // 应用状态筛选
      if (activeProgressFilter !== "all") {
        filteredIncidents = filteredIncidents.filter(
          incident => incident.status === activeProgressFilter
        );
      }

      // 应用类型筛选
      if (activeTypeFilter !== "all") {
        const typeKeywords = {
          type_customer: ["客户", "用户", "会员"],
          type_order: ["订单", "交易", "支付"],
          type_product: ["商品", "库存", "产品"]
        };
        
        if (typeKeywords[activeTypeFilter]) {
          filteredIncidents = filteredIncidents.filter(incident =>
            typeKeywords[activeTypeFilter].some(keyword =>
              incident.title.includes(keyword) || incident.description.includes(keyword)
            )
          );
        }
      }

      // 应用搜索筛选
      if (searchQuery) {
        filteredIncidents = filteredIncidents.filter(incident =>
          incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          incident.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // 计算统计数据
      const highCount = mockIncidents.filter(incident => incident.priority === "high").length;
      const pendingCount = mockIncidents.filter(incident => incident.status === "pending_human").length;
      setCountData({ highCount, pendingCount });

      // 分页处理
      const startIndex = (page - 1) * size;
      const endIndex = startIndex + size;
      const paginatedIncidents = filteredIncidents.slice(startIndex, endIndex);

      setIncidents(paginatedIncidents);
      setTotal(filteredIncidents.length);

      // 选择第一个事件作为详情显示
      if (paginatedIncidents.length > 0 && !selectedIncident) {
        setSelectedIncident(paginatedIncidents[0]);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
    }
  };

  useEffect(() => {
    fetchEventPage(currentPage, pageSize);
  }, [
    currentPage,
    pageSize,
    activePriorityFilter,
    activeProgressFilter,
    activeTypeFilter,
    searchQuery,
  ]);

  return (
    <div className="flex h-full">
      {/* Event Stream (Left Column) */}
      <div className="w-96 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
            实时事件流
          </h2>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="搜索事件..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters: Dropdown Row */}
          <div className="mb-2 grid grid-cols-2 gap-2">
            <div>
              <div className="text-xs text-slate-500 mb-1">优先级筛选</div>
              <Select
                value={activePriorityFilter}
                onValueChange={(v: PriorityFilter) =>
                  setActivePriorityFilter(v)
                }
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="请选择" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {priorityFilterLabels.all}
                  </SelectItem>
                  <SelectItem value="high">
                    {priorityFilterLabels.high}
                  </SelectItem>
                  <SelectItem value="medium">
                    {priorityFilterLabels.medium}
                  </SelectItem>
                  <SelectItem value="low">
                    {priorityFilterLabels.low}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">处理进度筛选</div>
              <Select
                value={activeProgressFilter}
                onValueChange={(v: ProgressFilter) =>
                  setActiveProgressFilter(v)
                }
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="请选择" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {progressFilterLabels.all}
                  </SelectItem>
                  <SelectItem value="pending_human">
                    {progressFilterLabels.pending_human}
                  </SelectItem>
                  <SelectItem value="in_progress">
                    {progressFilterLabels.in_progress}
                  </SelectItem>
                  <SelectItem value="resolved">
                    {progressFilterLabels.resolved}
                  </SelectItem>
                  <SelectItem value="automated">
                    {progressFilterLabels.automated}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filters: Type Row - Horizontal scroll chips */}
          <div>
            <div className="text-xs text-slate-500 mb-1">类型筛选</div>
            <div className="overflow-x-auto whitespace-nowrap">
              <div className="flex gap-2">
                {(
                  [
                    "all",
                    "type_customer",
                    "type_order",
                    "type_product",
                  ] as TypeFilter[]
                ).map((filter) => (
                  <Button
                    key={filter}
                    variant={
                      activeTypeFilter === filter ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setActiveTypeFilter(filter)}
                    className={`text-xs ${
                      activeTypeFilter === filter
                        ? "bg-eip-accent hover:bg-eip-accent/90"
                        : "hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    {typeFilterLabels[filter]}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pagination Controls - after type filter */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>共 {total} 个事件</span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="h-7 px-3"
              >
                上一页
              </Button>
              <span className="text-slate-700 dark:text-slate-300">
                {currentPage} / {total > 0 ? Math.ceil(total / pageSize) : 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) =>
                    Math.min(p + 1, Math.ceil(total / pageSize)),
                  )
                }
                disabled={
                  currentPage >= Math.ceil(total / pageSize) || total === 0
                }
                className="h-7 px-3"
              >
                下一页
              </Button>
            </div>
          </div>
        </div>

        {/* Incident List */}
        <div className="flex-1 overflow-y-auto">
          {incidents.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-slate-500 dark:text-slate-400">
              <div className="text-center">
                <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">没有找到匹配的事件</p>
              </div>
            </div>
          ) : (
            incidents.map((incident) => (
              <IncidentListItem
                key={incident.id}
                incident={incident}
                isSelected={selectedIncident?.id === incident.id}
                onClick={async () => {
                  // Only fetch detailed data if not already fetching for this incident
                  if (fetchingDetailId !== incident.id) {
                    setFetchingDetailId(incident.id);
                    try {
                      const detailedIncident = await getEventDetails(
                        incident.id,
                      );
                      setSelectedIncident(detailedIncident);
                    } catch (error) {
                      console.error(
                        `Failed to fetch incident details for ID ${incident.id}:`,
                        error,
                      );
                      // Fallback to the basic incident data if detailed fetch fails
                      setSelectedIncident(incident);
                    } finally {
                      setFetchingDetailId(null);
                    }
                  }
                }}
              />
            ))
          )}
        </div>

        {/* Status Bar */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
          <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
            <span>显示 {incidents.length} 个事件</span>
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <div className="w-2 h-2 bg-eip-alert rounded-full mr-1"></div>
                高优先级: {countData.highCount}
              </span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-eip-warning rounded-full mr-1"></div>
                待处理: {countData.pendingCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Incident Details & Response Workstation (Right Column) */}
      <div className="flex-1">
        <IncidentDetails incident={selectedIncident} />
      </div>
    </div>
  );
}
