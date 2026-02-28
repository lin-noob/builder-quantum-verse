import { Search, ChevronDown, ChevronUp, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { DatePicker, Pagination } from "antd";
import dayjs from "dayjs";
import DecisionEventListItem, { DecisionEvent } from "./DecisionEventListItem";

export interface EventsSidebarFilters {
  eventType: string;
  eventStatus: string;
  timeRange: string;
  dateRange: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null;
  customerSearch: string;
  showAdvanced: boolean;
  aiTagFilter: string;
  humanOverrideFilter: string;
}

interface EventsSidebarProps {
  events: DecisionEvent[];
  totalCount: number;
  loading?: boolean;
  selectedEventId: string | null;
  onEventSelect: (id: string) => void;
  filters: EventsSidebarFilters;
  onFilterChange: (updates: Partial<EventsSidebarFilters>) => void;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
}

export default function EventsSidebar({
  events,
  totalCount,
  loading = false,
  selectedEventId,
  onEventSelect,
  filters,
  onFilterChange,
  pagination,
}: EventsSidebarProps) {
  return (
    <div className="w-[400px] flex flex-col border-r border-slate-200 bg-white shadow-sm z-10 h-full overflow-hidden">
      {/* Top Filter Area */}
      <div className="p-4 border-b border-slate-200 bg-white z-20 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800 tracking-tight">事件概览</h2>
          <div className="text-xs text-slate-400 font-mono">{totalCount} 项</div>
        </div>

        <div className="space-y-3">
          {/* Primary Filters Grid */}
          <div className="grid grid-cols-2 gap-2">
            <Select value={filters.eventType} onValueChange={(v) => onFilterChange({ eventType: v })}>
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

            <Select value={filters.eventStatus} onValueChange={(v) => onFilterChange({ eventStatus: v })}>
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
            <Select value={filters.timeRange} onValueChange={(v) => onFilterChange({ timeRange: v })}>
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
                value={filters.customerSearch}
                onChange={(e) => onFilterChange({ customerSearch: e.target.value })}
              />
            </div>
          </div>

          {filters.timeRange === "custom" && (
            <div className="animate-in fade-in slide-in-from-top-1 duration-200">
              <DatePicker.RangePicker
                className="w-full h-8 text-xs"
                value={filters.dateRange}
                onChange={(dates) => onFilterChange({ dateRange: dates as any })}
                placeholder={["开始日期", "结束日期"]}
              />
            </div>
          )}
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
                onClick={() => onEventSelect(event.id)}
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
      {pagination && (
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex justify-center">
          <Pagination
            size="small"
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onChange={pagination.onChange}
            showSizeChanger={true}
            pageSizeOptions={["10", "20", "50", "100"]}
          />
        </div>
      )}
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
