import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import { request } from "@/lib/request";
import AdvancedDateRangePicker from "@/components/AdvancedDateRangePicker";
import { formatStartDate, formatEndDate } from "@/lib/utils";

interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface OperationLogsViewProps {
  organizationId?: string;
}

interface OperationLog {
  id: string;
  time: number;
  ip: string;
  logModel: string;
  logtype: string;
  username: string;
  description: string;
}

interface SortConfig {
  field: keyof OperationLog | null;
  direction: "asc" | "desc";
}

interface LogListRequestDto {
  currentpage?: number;
  pagesize?: number;
  keyword?: string;
  startDate?: string;
  endDate?: string;
  searchtype?: string;
  sort?: string;
  order?: "asc" | "desc";
  paramother?: Record<string, string | number>;
  companyid?: string;
}

export default function OperationLogsView({
  organizationId,
}: OperationLogsViewProps) {
  const [logs, setLogs] = useState<OperationLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>({
    start: null,
    end: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [totalCount, setTotalCount] = useState(0);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "time",
    direction: "desc",
  });

  const formatTime = (timestamp: number) => {
    if (!timestamp) return "-";
    const date = new Date(timestamp);
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getSortIcon = (field: keyof OperationLog) => {
    if (sortConfig.field !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
  };

  const handleSort = (field: keyof OperationLog) => {
    setSortConfig((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  };

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSearchQuery("");
    setDateRange({ start: null, end: null });
    setSortConfig({ field: "time", direction: "desc" });
    setCurrentPage(1);
  };

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const body: LogListRequestDto = {
        currentpage: currentPage,
        pagesize: itemsPerPage,
      };

      if (searchQuery.trim()) body.keyword = searchQuery.trim();
      if (dateRange.start) body.startDate = formatStartDate(dateRange.start);
      if (dateRange.end) body.endDate = formatEndDate(dateRange.end);
      if (organizationId) body.companyid = organizationId;

      if (sortConfig.field) {
        body.sort = String(sortConfig.field);
        body.order = sortConfig.direction;
      }

      const response = await request.post("/admin/api/v1/log/list", body);

      const dataRoot: any =
        (response as any).data?.data ?? (response as any).data ?? {};
      const records: any[] = dataRoot.records ?? dataRoot.list ?? [];
      const total: number = dataRoot.total ?? 0;

      const mapped: OperationLog[] = Array.isArray(records)
        ? records.map((r: any) => ({
            id: String(r.id ?? r.logId ?? ""),
            time: typeof r.time === "number" ? r.time : Number(r.time ?? 0),
            ip: String(r.ip ?? "-"),
            logModel: String(r.logModel ?? r.module ?? "-"),
            logtype: String(r.logtype ?? r.type ?? "-"),
            username: String(r.username ?? r.operator ?? "-"),
            description: r.description,
          }))
        : [];

      setLogs(mapped);
      setTotalCount(
        typeof total === "number" && total > 0 ? total : mapped.length,
      );
    } catch (e) {
      console.error("获取操作日志失败", e);
      setLogs([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    itemsPerPage,
    searchQuery,
    dateRange,
    sortConfig,
    organizationId,
  ]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      <Card className="p-6 bg-white shadow-sm">
        <CardHeader className="p-0 mb-4">
          <CardTitle>操作日志</CardTitle>
          <CardDescription>系统操作记录详情</CardDescription>
        </CardHeader>
        <CardContent className="p-0 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="搜索用户名、类型、模块或IP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && setCurrentPage(1)}
                className="pl-10"
              />
            </div>

            <div className="md:w-1/3">
              <AdvancedDateRangePicker
                value={dateRange}
                onChange={handleDateRangeChange}
                onPresetChange={() => {}}
              />
            </div>

            <div className="flex items-end gap-2">
              <Button
                onClick={() => setCurrentPage(1)}
                className="flex items-center gap-2 h-10"
                disabled={loading}
              >
                <Search className="h-4 w-4" />
                搜索
              </Button>
              <Button
                variant="outline"
                size="default"
                onClick={handleReset}
                className="flex items-center gap-2 h-10"
              >
                <RotateCcw className="h-4 w-4" />
                重置
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4 py-3">用户名</TableHead>
                  <TableHead
                    className="px-4 py-3 cursor-pointer select-none"
                    onClick={() => handleSort("logModel")}
                  >
                    <div className="flex items-center gap-2">
                      模块{getSortIcon("logModel")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="px-4 py-3 cursor-pointer select-none"
                    onClick={() => handleSort("logtype")}
                  >
                    <div className="flex items-center gap-2">
                      日志类型{getSortIcon("logtype")}
                    </div>
                  </TableHead>

                  <TableHead
                    className="px-4 py-3 cursor-pointer select-none"
                    onClick={() => handleSort("time")}
                  >
                    <div className="flex items-center gap-2">
                      时间{getSortIcon("time")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="px-4 py-3 cursor-pointer select-none"
                    onClick={() => handleSort("ip")}
                  >
                    <div className="flex items-center gap-2">
                      IP 地址{getSortIcon("ip")}
                    </div>
                  </TableHead>
                  <TableHead className="px-4 py-3 cursor-pointer select-none">
                    <div className="flex items-center gap-2">描述</div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="inline-flex items-center gap-2 text-gray-600">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        加载中...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-gray-500"
                    >
                      暂无操作日志记录
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="px-4 py-3 font-medium">
                        {log.username || "-"}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        {log.logModel || "-"}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        {log.logtype || "-"}
                      </TableCell>

                      <TableCell className="px-4 py-3">
                        {formatTime(log.time)}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        {log.ip || "-"}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        {log.description || "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4 border-t pt-4">
            <div className="text-sm text-gray-600">
              共 {totalCount} 条记录，第 {currentPage} 页 / 共 {totalPages} 页
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || loading}
              >
                上一页
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage >= totalPages || loading}
              >
                下一页
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
