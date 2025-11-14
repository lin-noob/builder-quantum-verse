import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Download,
  Search as SearchIcon,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Settings,
  GripVertical,
} from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { request } from "@/lib/request";
import { ruleTypeService } from "@/services/ruleTypeService";
import { ruleService } from "@/services/ruleService";

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface AttributionRow {
  id: string;
  source: string;
  medium: string;
  campaign: string;
  sessions: number;
  visitors: number;
  registrations: number;
  logins: number;
  addToCart: number;
  checkouts: number;
  orders: number;
  purchases: number;
  inquiries: number;
  orderAmount: number;
  purchaseAmount: number;
  metrics?: any;
}

// 排序与列配置类型
type SortKey =
  | "source"
  | "medium"
  | "campaign"
  | "sessions"
  | "visitors"
  | "registrations"
  | "logins"
  | "addToCart"
  | "checkouts"
  | "orders"
  | "purchases"
  | "inquiries"
  | "registrationRate"
  | "loginRate"
  | "addToCartRate"
  | "checkoutRate"
  | "orderRate"
  | "purchaseRate"
  | "inquiryRate"
  | "conversionRate"
  | "orderAmount"
  | "purchaseAmount"
  | string;
type ColKey =
  | "source"
  | "medium"
  | "campaign"
  | "sessions"
  | "visitors"
  | "registrations"
  | "logins"
  | "addToCart"
  | "checkouts"
  | "orders"
  | "purchases"
  | "inquiries"
  | "registrationRate"
  | "loginRate"
  | "addToCartRate"
  | "checkoutRate"
  | "orderRate"
  | "purchaseRate"
  | "inquiryRate"
  | "conversionRate"
  | "orderAmount"
  | "purchaseAmount"
  | string;

// 必须显示的固定列
const fixedColumns: { key: ColKey; label: string; mandatory: boolean; sortKey?: SortKey }[] = [
  { key: "source", label: "Source", mandatory: true, sortKey: "source" },
  { key: "medium", label: "Medium", mandatory: true, sortKey: "medium" },
  { key: "campaign", label: "Campaign", mandatory: true, sortKey: "campaign" },
  { key: "totalSession", label: "会话数", mandatory: true, sortKey: "total_session" },
  { key: "totalVisitors", label: "总访客数", mandatory: true, sortKey: "total_visitors" },
];

export default function AttributionReport() {
  const [dateRange, setDateRange] = useState<DateRange>({
    start: null,
    end: null,
  });
  const [columnsConfig, setColumnsConfig] = useState<
    { key: any; label: string; sortKey?: SortKey }[]
  >([...fixedColumns]);
  const [loading, setLoading] = useState(true);
  // API获取的筛选选项
  const [apiFilterOptions, setApiFilterOptions] = useState<{
    sources: string[];
    mediums: string[];
    campaigns: string[];
  }>({ sources: [], mediums: [], campaigns: [] });

  // API获取的数据列表和分页信息
  const [apiData, setApiData] = useState<{
    list: AttributionRow[];
    total: number;
  }>({ list: [], total: 0 });
  // 报告统计数据
  const [reportCount, setReportCount] = useState<{
    totalvisitors: string;
    totalsession: string;
  }>({ totalvisitors: "", totalsession: "" });
  const [search, setSearch] = useState("");
  // 多选筛选条件
  const [filters, setFilters] = useState<{
    sources: string[];
    mediums: string[];
    campaigns: string[];
  }>({ sources: [], mediums: [], campaigns: [] });
  // 排序（后端完成）
  const [sort, setSort] = useState<SortKey>("campaign");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  // 分页
  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  // 导出配置
  const [exportColumns, setExportColumns] = useState<ColKey[]>(
    columnsConfig.map((c) => c.key),
  );
  const [exportOpen, setExportOpen] = useState(false);
  const [exportScope, setExportScope] = useState<"current" | "all">("current");

  // 列配置弹窗状态
  const [columnConfigOpen, setColumnConfigOpen] = useState(false);
  const [draggedColumn, setDraggedColumn] = useState<ColKey | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<ColKey[]>(() => {
    // 默认列始终显示
    const defaultColumns: ColKey[] = ['source', 'medium', 'campaign', 'totalSession', 'totalVisitors'];
    return defaultColumns;
  });
  // 存储 titleId 到 id 的映射
  const [titleIdToIdMap, setTitleIdToIdMap] = useState<Map<string, string>>(new Map());

  // 使用 API 返��的筛选选项
  const sources = apiFilterOptions.sources;
  const mediums = apiFilterOptions.mediums;
  const campaigns = apiFilterOptions.campaigns;

  // 过滤在服务器端完成，直接使用API数据
  const filteredRows = apiData.list;

  // 后端排序，不需要客户端计算率和排序

  // 表头点击排序
  const handleHeaderSort = (field: SortKey) => {
    if (sort === field) {
      setOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSort(field);
      setOrder("desc");
    }
    setPage(1);
  };

  const getSortIcon = (field: SortKey) => {
    if (sort === field) {
      return order === "asc" ? (
        <ArrowUp className="h-4 w-4" />
      ) : (
        <ArrowDown className="h-4 w-4" />
      );
    }
    return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
  };

  // 使用后端排序的数据，不需要客户端排序
  const displayRows = filteredRows;

  // 分页 - 使用API数据
  const totalCount = apiData.total;
  const totalPages = Math.ceil(totalCount / pageSize);

  // 分页数据 - API数据已经分页
  const pagedRows = displayRows;

  // 统计（当前筛选后的全部）
  const totals = useMemo(() => {
    return displayRows.reduce(
      (acc, r) => ({
        sessions: acc.sessions + r.sessions,
        visitors: acc.visitors + r.visitors,
        registrations: acc.registrations + r.registrations,
        logins: acc.logins + r.logins,
        addToCart: acc.addToCart + r.addToCart,
        checkouts: acc.checkouts + r.checkouts,
        orders: acc.orders + r.orders,
        purchases: acc.purchases + r.purchases,
        inquiries: acc.inquiries + r.inquiries,
      }),
      {
        sessions: 0,
        visitors: 0,
        registrations: 0,
        logins: 0,
        addToCart: 0,
        checkouts: 0,
        orders: 0,
        purchases: 0,
        inquiries: 0,
      },
    );
  }, [displayRows]);

  // 导出（弹窗配置：列与范围）
  const exportCSV = async () => {
    try {
      // 构建titlemap：按照visibleColumns的顺序，只包含exportColumns中选中的列
      const titlemap: Record<string, string> = {};

      // 首先添���fixedColumns中的列
      fixedColumns.forEach((col) => {
        if (exportColumns.includes(col.key) && visibleColumns.includes(col.key)) {
          titlemap[col.key] = col.label;
        }
      });

      // 然后添加动态列，按照visibleColumns的顺序
      visibleColumns.forEach((key) => {
        if (exportColumns.includes(key) && !fixedColumns.some(f => f.key === key)) {
          const column = columnsConfig.find((c) => c.key === key);
          if (column) {
            titlemap[key] = column.label;
          }
        }
      });

      // 构建导出参数
      const exportParams = {
        keyword: search,
        startDate: dateRange.start
          ? dateRange.start.toISOString().split("T")[0]
          : "",
        endDate: dateRange.end ? dateRange.end.toISOString().split("T")[0] : "",
        source: filters.sources.join(","),
        medium: filters.mediums.join(","),
        campaign: filters.campaigns.join(","),
        pagesize: pageSize,
        currentpage: page,
        order: order,
        sortColumn: sort,
        checkAll: exportScope === "all",
        titlemap: titlemap,
      };

      const response = await request.post(
        "/quote/api/v1/report/export",
        exportParams,
        { responseType: "blob" },
      );
      
      if (response.data) {
        // 如果后端返回blob数据，直接下载
        const blob = new Blob([response.data], {
          type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "attribution_report.csv";
        a.click();
        URL.revokeObjectURL(url);
      }

      setExportOpen(false);
    } catch (error) {
      console.error("Error exporting report:", error);
    }
  };

  // 重新加载列配����
  const refetchColumns = async () => {
    try {
      // 获取规则类型列表
      const ruleTypes = await ruleService.getRules('');

      // 基于规则类型数据构建动态列配置
      const dynamicColumnsMap = new Map(
        ruleTypes.map((ruleType) => [
          ruleType.id,
          {
            key: ruleType.id,
            label: ruleType.ruleName,
            sortKey: String(ruleType.id),
            mandatory: false
          }
        ])
      );

      // 从服务器加载列配置并获取排序
      const savedListResponse = await request.post("/quote/api/v1/report/title/list");

      let orderedDynamicColumns = [];
      if (savedListResponse.data && savedListResponse.data.data && savedListResponse.data.data.length > 0) {
        // 存储 titleId 到 id 的映射
        const newTitleIdToIdMap = new Map<string, string>();
        savedListResponse.data.data.forEach((item: any) => {
          if (item.titleId && item.id) {
            newTitleIdToIdMap.set(String(item.titleId), String(item.id));
          }
        });
        setTitleIdToIdMap(newTitleIdToIdMap);

        // 按照保存的顺序排列动态列
        orderedDynamicColumns = savedListResponse.data.data
          .map((item: any) => dynamicColumnsMap.get(item.titleId))
          .filter((col: any) => col !== undefined);

        // 添加任何新的规则类型（不在保存列表中的）
        const savedIds = new Set(savedListResponse.data.data.map((item: any) => item.titleId));
        const newColumns = ruleTypes
          .filter(rule => !savedIds.has(rule.id))
          .map(ruleType => ({
            key: ruleType.id,
            label: ruleType.ruleName,
            sortKey: String(ruleType.id),
            mandatory: false
          }));
        orderedDynamicColumns = [...orderedDynamicColumns, ...newColumns];
      } else {
        // 如果没有保存的配置，使用规则类型的原始顺序
        orderedDynamicColumns = Array.from(dynamicColumnsMap.values());
      }

      // 合并固定列和动态列
      const allColumns = [...fixedColumns, ...orderedDynamicColumns];
      setColumnsConfig(allColumns);

      // 设置可见列（基于checked字段）
      const defaultColumns = ['source', 'medium', 'campaign', 'totalSession', 'totalVisitors'];
      if (savedListResponse.data && savedListResponse.data.data && savedListResponse.data.data.length > 0) {
        const checkedColumnIds = savedListResponse.data.data
          .filter((item: any) => item.checked === true)
          .map((item: any) => item.titleId);
        const allVisibleColumns = [...new Set([...defaultColumns, ...checkedColumnIds])];
        setVisibleColumns(allVisibleColumns);
      } else {
        setVisibleColumns(defaultColumns);
      }
    } catch (error) {
      console.error("Error refetching columns:", error);
    }
  };

  // ��用报告列表API和规则类型列表API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 调用报告列表API
        const response = await request.post("/quote/api/v1/report/list");
        const filterData = response.data;
        // 保存API返回的筛选选项
        if (
          filterData.data &&
          filterData.data.sources &&
          filterData.data.mediums &&
          filterData.data.campaigns
        ) {
          setApiFilterOptions({
            sources: filterData.data.sources || [],
            mediums: filterData.data.mediums || [],
            campaigns: filterData.data.campaigns || [],
          });
        }

        // 加载列配置
        await refetchColumns();
      } catch (error) {
        console.error("Error fetching data:", error);
        // 如果API调用失败，使用默认配置
        setColumnsConfig([...fixedColumns]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 保存列配置到服务器
  const saveColumns = async () => {
    try {
      // 默认列不需要保存
      const excludeColumns = ['source', 'medium', 'campaign', 'totalSession', 'totalVisitors'];
      // 构建所有动态列的��存数据（包括选中和未选中的）
      const columnsToSave = columnsConfig
        .filter(col => !excludeColumns.includes(col.key))
        .map(col => ({
          titleId: col.key,
          checked: visibleColumns.includes(col.key)
        }));

      await request.post("/quote/api/v1/report/title/save", columnsToSave);
      console.log("Columns saved successfully");
    } catch (error) {
      console.error("Error saving columns:", error);
    }
  };

  // 移动列位置
  const moveColumn = async (sourceId: string, targetId: string) => {
    try {
      const formData = new FormData();
      formData.append('sourceId', sourceId);
      formData.append('targetId', targetId);
      await request.post("/quote/api/v1/report/title/move", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log("Column moved successfully");
    } catch (error) {
      console.error("Error moving column:", error);
    }
  };

  // 处理列拖���
  const handleDragStart = (e: React.DragEvent, columnKey: ColKey) => {
    setDraggedColumn(columnKey);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetKey: ColKey) => {
    e.preventDefault();
    if (!draggedColumn || draggedColumn === targetKey) {
      setDraggedColumn(null);
      return;
    }

    // 重新排序列配置
    const newColumnsConfig = [...columnsConfig];
    const draggedIndex = newColumnsConfig.findIndex((c) => c.key === draggedColumn);
    const targetIndex = newColumnsConfig.findIndex((c) => c.key === targetKey);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      // 从映射中获取实际的 id
      const sourceId = titleIdToIdMap.get(String(draggedColumn));
      const targetId = titleIdToIdMap.get(String(targetKey));

      if (sourceId && targetId) {
        // ��用API保存列顺序（使用 id 而不是 titleId）
        await moveColumn(sourceId, targetId);

        // 重新查询接口并更新显示
        await refetchColumns();
      } else {
        console.warn("Cannot move column: id not found in mapping");
      }
    }

    setDraggedColumn(null);
  };

  // 新增：调用报���分页数据API
  const fetchReportPage = async () => {
    try {
      const queryParams = {
        keyword: search,
        startDate: dateRange.start
          ? dateRange.start.toISOString().split("T")[0]
          : "",
        endDate: dateRange.end ? dateRange.end.toISOString().split("T")[0] : "",
        source: filters.sources.join(","),
        medium: filters.mediums.join(","),
        campaign: filters.campaigns.join(","),
        pagesize: pageSize,
        currentpage: page,
        order: order,
        sortColumn: sort,
      };

      const response = await request.post(
        "/quote/api/v1/report/page",
        queryParams,
      );
      const res = response.data;

      // 处理返回的分页数据
      if (res.data && res.data.records) {
        setApiData({
          list: res.data.records || [],
          total: res.data.total || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching report page:", error);
    }
  };

  // 调用报告统计数据API
  const fetchReportCount = async () => {
    try {
      const queryParams = {
        keyword: search,
        startDate: dateRange.start
          ? dateRange.start.toISOString().split("T")[0]
          : "",
        endDate: dateRange.end ? dateRange.end.toISOString().split("T")[0] : "",
        source: filters.sources.join(","),
        medium: filters.mediums.join(","),
        campaign: filters.campaigns.join(","),
        pagesize: pageSize,
        currentpage: page,
        order: order,
        sortColumn: sort,
      };

      const response = await request.post(
        "/quote/api/v1/report/count",
        queryParams,
      );

      // 保存统计数据
      if (response.data && response.data.data) {
        setReportCount({
          totalvisitors: response.data.data.totalvisitors || "",
          totalsession: response.data.data.totalsession || "",
        });
      }
    } catch (error) {
      console.error("Error fetching report count:", error);
    }
  };

  // 搜索按钮������事件
  const handleSearch = () => {
    setPage(1); // 重���到第一页
    fetchReportPage();
  };

  // 自动搜索：当筛选条件或分页改变时自动调用API
  useEffect(() => {
    // if (loading) return; // 等待初始化完成
    fetchReportPage();
    fetchReportCount();
  }, [dateRange, filters, page, pageSize, sort, order]);

  // 重置函数更新 - 重置列配置
  const handleReset = () => {
    setSearch("");
    setDateRange({ start: null, end: null }); // 重置日期范围
    setFilters({ sources: [], mediums: [], campaigns: [] });
    setPage(1);
    setSort("campaign");
    setOrder("desc");
    setExportColumns(columnsConfig.map((c) => c.key));
    setExportScope("current");
    // 重置列配置，确保固定列始终包含
    setVisibleColumns([...fixedColumns.map((c) => c.key)]);
  };

  // UI 渲染
  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-gray-50 min-h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">正在加载列配置...</p>
        </div>
      </div>
    );
  }

  return (
    <div className=" overflow-hidden flex flex-col bg-gray-50">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* 筛选区 - 样式参考用户画像 */}
      <Card className="p-6 mb-8 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-3 md:gap-4">
          {/* 搜���框 */}
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="搜索来源/媒介/活动..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              className="pl-10"
            />
          </div>

          {/* 时间范围 */}

          <div className="w-[280px] shrink-0">
            <DatePicker.RangePicker
              size="large"
              value={
                dateRange.start && dateRange.end
                  ? [dayjs(dateRange.start), dayjs(dateRange.end)]
                  : undefined
              }
              onChange={(dates) => {
                if (dates && dates[0] && dates[1]) {
                  setDateRange({
                    start: dates[0].toDate(),
                    end: dates[1].toDate(),
                  });
                } else {
                  setDateRange({ start: null, end: null });
                }
              }}
              placeholder={["开��日期", "结束日期"]}
              popupStyle={{
                zIndex: 1050,
              }}
            />
          </div>

          {/* 来��多选 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="shrink-0">
                来源（{filters.sources.length || "全部"}）
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuCheckboxItem
                checked={filters.sources.length === 0}
                onCheckedChange={() =>
                  setFilters((p) => ({ ...p, sources: [] }))
                }
              >
                全部
              </DropdownMenuCheckboxItem>
              {sources.map((s) => (
                <DropdownMenuCheckboxItem
                  key={s}
                  checked={filters.sources.includes(s)}
                  onCheckedChange={(checked) =>
                    setFilters((p) => ({
                      ...p,
                      sources: checked
                        ? [...p.sources, s]
                        : p.sources.filter((x) => x !== s),
                    }))
                  }
                >
                  {s}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 媒介多选 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="shrink-0">
                媒介（{filters.mediums.length || "全部"}）
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuCheckboxItem
                checked={filters.mediums.length === 0}
                onCheckedChange={() =>
                  setFilters((p) => ({ ...p, mediums: [] }))
                }
              >
                全部
              </DropdownMenuCheckboxItem>
              {mediums.map((m) => (
                <DropdownMenuCheckboxItem
                  key={m}
                  checked={filters.mediums.includes(m)}
                  onCheckedChange={(checked) =>
                    setFilters((p) => ({
                      ...p,
                      mediums: checked
                        ? [...p.mediums, m]
                        : p.mediums.filter((x) => x !== m),
                    }))
                  }
                >
                  {m}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 活动多选 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="shrink-0">
                活动（{filters.campaigns.length || "全部"}）
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64">
              <DropdownMenuCheckboxItem
                checked={filters.campaigns.length === 0}
                onCheckedChange={() =>
                  setFilters((p) => ({ ...p, campaigns: [] }))
                }
              >
                全部
              </DropdownMenuCheckboxItem>
              {campaigns.map((c) => (
                <DropdownMenuCheckboxItem
                  key={c}
                  checked={filters.campaigns.includes(c)}
                  onCheckedChange={(checked) =>
                    setFilters((p) => ({
                      ...p,
                      campaigns: checked
                        ? [...p.campaigns, c]
                        : p.campaigns.filter((x) => x !== c),
                    }))
                  }
                >
                  {c}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 操作按钮 */}

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              className="flex items-center gap-2 h-10"
              onClick={handleSearch}
            >
              <SearchIcon className="h-4 w-4" />
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

            {/* 导���配置��窗 */}
            <Dialog open={exportOpen} onOpenChange={setExportOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 h-10"
                >
                  <Download className="h-4 w-4" /> 导出
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                  <DialogTitle>导出配置</DialogTitle>
                  <DialogDescription>
                    选择要导出的列与数据范围
                  </DialogDescription>
                </DialogHeader>

                {/* 列选择 */}
                <div className="space-y-3">
                  <Label className="text-sm">导出列</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {columnsConfig.map((c) => (
                      <div key={c.key} className="flex items-center space-x-2">
                        <Checkbox
                          id={`col-${c.key}`}
                          checked={exportColumns.includes(c.key)}
                          onCheckedChange={(checked) =>
                            setExportColumns((prev) =>
                              checked
                                ? [...prev, c.key]
                                : prev.filter((k) => k !== c.key),
                            )
                          }
                        />
                        <Label htmlFor={`col-${c.key}`}>{c.label}</Label>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setExportColumns(columnsConfig.map((c) => c.key))
                      }
                    >
                      全选
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExportColumns([])}
                    >
                      清空
                    </Button>
                  </div>
                </div>

                {/* 范���选择 */}
                <div className="space-y-3">
                  <Label className="text-sm">数据范围</Label>
                  <RadioGroup
                    value={exportScope}
                    onValueChange={(v: "current" | "all") => setExportScope(v)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem id="scope-current" value="current" />
                      <Label htmlFor="scope-current">导出当前数据</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem id="scope-all" value="all" />
                      <Label htmlFor="scope-all">
                        导出全部数据（按当前筛选与排序）
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setExportOpen(false)}
                  >
                    取消
                  </Button>
                  <Button onClick={exportCSV}>确认导出</Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* 列配置弹窗 */}
            <Dialog open={columnConfigOpen} onOpenChange={setColumnConfigOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 h-10"
                >
                  <Settings className="h-4 w-4" /> 列配置
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>列配置</DialogTitle>
                  <DialogDescription>
                    选择要显示的字段，拖动可调整排序
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {/* 列选择区间 */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">显示列</Label>
                    <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                      {columnsConfig.map((c) => {
                        const isMandatory = fixedColumns.some(
                          (fixed) => fixed.key === c.key,
                        );
                        return (
                          <div
                            key={c.key}
                            draggable
                            onDragStart={(e) => handleDragStart(e, c.key)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, c.key)}
                            className={`flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 transition-colors ${
                              draggedColumn === c.key ? "opacity-50 bg-blue-50" : ""
                            }`}
                          >
                            <Checkbox
                              id={`visible-${c.key}`}
                              checked={visibleColumns.includes(c.key)}
                              disabled={isMandatory}
                              onCheckedChange={(checked) => {
                                if (!isMandatory) {
                                  setVisibleColumns((prev) =>
                                    checked
                                      ? [...prev, c.key]
                                      : prev.filter((k) => k !== c.key),
                                  );
                                }
                              }}
                            />
                            <Label
                              htmlFor={`visible-${c.key}`}
                              className={`cursor-pointer flex-1 truncate ${isMandatory ? "text-gray-500" : ""}`}
                              title={c.label}
                            >
                              {c.label} {isMandatory && "(必须)"}
                            </Label>
                            <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setVisibleColumns(columnsConfig.map((c) => c.key))
                        }
                      >
                        全选
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setVisibleColumns([...fixedColumns.map((c) => c.key)])
                        }
                      >
                        清空
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setVisibleColumns([...fixedColumns.map((c) => c.key)])
                        }
                      >
                        重置默认
                      </Button>
                    </div>
                  </div>

                  {/* 预览区域 */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">预览</Label>
                    <div className="border rounded-md p-3 bg-gray-50">
                      <div className="text-sm text-gray-600">
                        当前选择 {visibleColumns.length} 列：
                        <div className="mt-2 flex flex-wrap gap-2">
                          {visibleColumns.map((key) => {
                            const config = columnsConfig.find(
                              (c) => c.key === key,
                            );
                            return (
                              <span
                                key={key}
                                className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                              >
                                {config?.label}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setColumnConfigOpen(false)}
                  >
                    取消
                  </Button>
                  <Button
                    onClick={async () => {
                      await saveColumns();
                      setColumnConfigOpen(false);
                    }}
                  >
                    确认
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </Card>

      {/* 列表区 - 表头排序、分页在下方 */}
      <Card className="bg-white shadow-sm">
        <div className="max-h-[620px] overflow-y-auto">
          <div className="overflow-x-auto">
            <div className="min-w-[1200px]">
              <Table>
                <TableHeader>
                <TableRow>
                  {fixedColumns.map((col, index) => {
                    if (!visibleColumns.includes(col.key)) return null;

                    const width = index < 2 ? "w-[160px]" : "w-[200px]";
                    const sortKey = col.sortKey || col.key as SortKey;

                    return (
                      <TableHead
                        key={col.key}
                        className={`${width} cursor-pointer select-none hover:bg-gray-100 whitespace-nowrap`}
                        onClick={() => handleHeaderSort(sortKey)}
                      >
                        <div className="flex items-center gap-2">
                          {col.label}
                          {col.key === "totalSession" && reportCount.totalsession && (
                            <span className="text-xs text-blue-600 font-normal">({reportCount.totalsession})</span>
                          )}
                          {col.key === "totalVisitors" && reportCount.totalvisitors && (
                            <span className="text-xs text-blue-600 font-normal">({reportCount.totalvisitors})</span>
                          )}
                          {getSortIcon(sortKey)}
                        </div>
                      </TableHead>
                    );
                  })}
                  {/* 动态列头（来自规则类型） */}
                  {columnsConfig
                    .filter(
                      (col) =>
                        !fixedColumns.some((fixed) => fixed.key === col.key),
                    )
                    .filter((col) => visibleColumns.includes(col.key))
                    .map((col) => {
                      const sortKey = col.sortKey || col.key as SortKey;
                      return (
                        <TableHead
                          key={col.key}
                          className="cursor-pointer select-none hover:bg-gray-100 whitespace-nowrap"
                          onClick={() => handleHeaderSort(sortKey)}
                        >
                          <div className="flex items-center gap-2">
                            {col.label}
                            {getSortIcon(sortKey)}
                          </div>
                        </TableHead>
                      );
                    })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedRows.map((r) => (
                  <TableRow key={r.id}>
                    {fixedColumns.map((col, index) => {
                      if (!visibleColumns.includes(col.key)) return null;
                      return (
                        <TableCell key={col.key} className={`whitespace-nowrap`}>
                          {r[col.key as keyof AttributionRow]}
                        </TableCell>
                      );
                    })}

                    {/* 动态列数据（来自规则类型） */}
                    {columnsConfig
                      .filter(
                        (col) =>
                          !fixedColumns.some((fixed) => fixed.key === col.key),
                      )
                      .filter((col) => visibleColumns.includes(col.key))
                      .map((col) => (
                        <TableCell key={col.key} className="whitespace-nowrap">
                          {/* 这里可以根据实际需要显示动态数据，目前显示占位符 */}
                          {/* {console.log(r.metrics, col.key)} */}
                          { r?.metrics[col.key] || '-' }
                        </TableCell>
                      ))}
                  </TableRow>
                ))}
                {/* 总计����（���参���分页，��示当前筛选与排序后全量的总计） */}
                {/* <TableRow>
                  {visibleColumns.includes("source") && (
                    <TableCell className="sticky left-0 z-10 bg-background w-[160px] font-medium">
                      总计
                    </TableCell>
                  )}
                  {visibleColumns.includes("medium") && (
                    <TableCell className="sticky left-[160px] z-10 bg-background w-[160px]">
                      ��
                    </TableCell>
                  )}
                  {visibleColumns.includes("campaign") && (
                    <TableCell className="w-[200px]">—</TableCell>
                  )}

                  {columnsConfig
                    .filter(
                      (col) =>
                        !fixedColumns.some((fixed) => fixed.key === col.key),
                    )
                    .filter((col) => visibleColumns.includes(col.key))
                    .map((col) => (
                      <TableCell key={col.key} className="font-medium">
                        —
                      </TableCell>
                    ))}
                </TableRow> */}
              </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {/* ��页 - ���格下��� */}
        <div className="px-6 py-4 border-t bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-700 order-2 sm:order-1">
            正在显示 {(page - 1) * pageSize + 1} -{" "}
            {Math.min(page * pageSize, totalCount)} 条，共 {apiData.total} 条
          </div>
          <div className="flex items-center gap-2 order-1 sm:order-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              上一页
            </Button>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                setPageSize(Number(v));
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[110px]">
                <SelectValue placeholder="����" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              下一页
            </Button>
          </div>
        </div>
      </Card>
      </div>
    </div>
  );
}