import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import AdvancedDateRangePicker from "@/components/AdvancedDateRangePicker";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Search as SearchIcon, RotateCcw, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface DateRange { start: Date | null; end: Date | null }

interface AttributionRow {
  id: string;
  source: string;
  medium: string;
  campaign: string;
  visitors: number;
  registrations: number;
  inquiries: number;
  orders: number;
  orderAmount: number;
}

const mockRows: AttributionRow[] = [
  { id: "1", source: "Google", medium: "CPC", campaign: "Summer_Sale", visitors: 1200, registrations: 240, inquiries: 120, orders: 90, orderAmount: 36000 },
  { id: "2", source: "Google", medium: "CPC", campaign: "Brand_Search", visitors: 800, registrations: 160, inquiries: 80, orders: 60, orderAmount: 19000 },
  { id: "3", source: "Facebook", medium: "Ads", campaign: "Lookalike_2%", visitors: 1500, registrations: 200, inquiries: 110, orders: 75, orderAmount: 28000 },
  { id: "4", source: "Email", medium: "EDM", campaign: "VIP_Drop", visitors: 900, registrations: 180, inquiries: 95, orders: 65, orderAmount: 19000 },
  { id: "5", source: "Direct", medium: "None", campaign: "Homepage", visitors: 1600, registrations: 120, inquiries: 60, orders: 40, orderAmount: 15000 },
];

// 排序与列配置类型
type SortKey = "source" | "medium" | "campaign" | "orderAmount" | "orderRate" | "registrationRate" | "inquiryRate" | "visitors" | "orders" | "registrations" | "inquiries";
type ColKey = "source"|"medium"|"campaign"|"visitors"|"registrations"|"inquiries"|"orders"|"orderAmount"|"registrationRate"|"inquiryRate"|"orderRate";

const columnsConfig: { key: ColKey; label: string }[] = [
  { key: "source", label: "Source" },
  { key: "medium", label: "Medium" },
  { key: "campaign", label: "Campaign" },
  { key: "visitors", label: "总访客数" },
  { key: "registrations", label: "注册数" },
  { key: "registrationRate", label: "注册率" },
  { key: "inquiries", label: "询价数" },
  { key: "inquiryRate", label: "询价率" },
  { key: "orders", label: "订单数" },
  { key: "orderRate", label: "下单率" },
  { key: "orderAmount", label: "订单金额" },
];

export default function AttributionReport() {
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
  const [search, setSearch] = useState("");
  // 多选筛选条件
  const [filters, setFilters] = useState<{ sources: string[]; mediums: string[]; campaigns: string[] }>({ sources: [], mediums: [], campaigns: [] });
  // 排序（主/次）
  const [sortPrimary, setSortPrimary] = useState<SortKey>("orderAmount");
  const [sortPrimaryDir, setSortPrimaryDir] = useState<"asc"|"desc">("desc");
  const [sortSecondary, setSortSecondary] = useState<SortKey>("orderRate");
  const [sortSecondaryDir, setSortSecondaryDir] = useState<"asc"|"desc">("desc");
  // 分页
  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  // 导出配置
  const [exportColumns, setExportColumns] = useState<ColKey[]>(columnsConfig.map(c=>c.key));
  const [exportOpen, setExportOpen] = useState(false);
  const [exportScope, setExportScope] = useState<"current"|"all">("current");

  const sources = useMemo(() => Array.from(new Set(mockRows.map(r => r.source))), []);
  const mediums = useMemo(() => Array.from(new Set(mockRows.map(r => r.medium))), []);
  const campaigns = useMemo(() => Array.from(new Set(mockRows.map(r => r.campaign))), []);

  // 过滤
  const filteredRows = useMemo(() => {
    return mockRows.filter(r => {
      if (filters.sources.length && !filters.sources.includes(r.source)) return false;
      if (filters.mediums.length && !filters.mediums.includes(r.medium)) return false;
      if (filters.campaigns.length && !filters.campaigns.includes(r.campaign)) return false;
      if (search) {
        const s = search.toLowerCase();
        const hay = `${r.source} ${r.medium} ${r.campaign}`.toLowerCase();
        if (!hay.includes(s)) return false;
      }
      return true;
    });
  }, [filters, search]);

  // 计算率（不分组，直接按行计算）
  const withRates = useMemo(() => filteredRows.map(r => ({
    ...r,
    registrationRate: r.visitors ? r.registrations / r.visitors : 0,
    inquiryRate: r.visitors ? r.inquiries / r.visitors : 0,
    orderRate: r.visitors ? r.orders / r.visitors : 0,
  })), [filteredRows]);

  // 表头点击排序（支持 Shift 追加二级排序）
  const handleHeaderSort = (field: SortKey, isShift: boolean) => {
    // 如果是追加二级排序
    if (isShift) {
      if (sortSecondary === field) {
        setSortSecondaryDir(prev => prev === "asc" ? "desc" : "asc");
      } else {
        setSortSecondary(field);
        setSortSecondaryDir("desc");
      }
      return;
    }
    // 主排序
    if (sortPrimary === field) {
      setSortPrimaryDir(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortPrimary(field);
      setSortPrimaryDir("desc");
    }
    setPage(1);
  };

  const getSortIcon = (field: SortKey) => {
    const isPrimary = sortPrimary === field;
    const isSecondary = sortSecondary === field;
    if (isPrimary) return sortPrimaryDir === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
    if (isSecondary) return sortSecondaryDir === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
    return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
  };

  // 排序
  const sortedRows = useMemo(() => {
    const arr = [...withRates];
    const val = (row: any, key: SortKey) => row[key];
    arr.sort((a, b) => {
      const pa = val(a, sortPrimary), pb = val(b, sortPrimary);
      const primaryCmp = (pa < pb ? -1 : pa > pb ? 1 : 0) * (sortPrimaryDir === "asc" ? 1 : -1);
      if (primaryCmp !== 0) return primaryCmp;
      const sa = val(a, sortSecondary), sb = val(b, sortSecondary);
      return (sa < sb ? -1 : sa > sb ? 1 : 0) * (sortSecondaryDir === "asc" ? 1 : -1);
    });
    return arr;
  }, [withRates, sortPrimary, sortPrimaryDir, sortSecondary, sortSecondaryDir]);

  // 分页
  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [totalPages]);
  const pagedRows = useMemo(() => sortedRows.slice((page - 1) * pageSize, page * pageSize), [sortedRows, page, pageSize]);

  // 总计（当前筛选后的全量）
  const totals = useMemo(() => {
    return sortedRows.reduce((acc, r) => ({
      visitors: acc.visitors + r.visitors,
      registrations: acc.registrations + r.registrations,
      inquiries: acc.inquiries + r.inquiries,
      orders: acc.orders + r.orders,
      orderAmount: acc.orderAmount + r.orderAmount,
    }), { visitors: 0, registrations: 0, inquiries: 0, orders: 0, orderAmount: 0 });
  }, [sortedRows]);

  // 导出（弹窗配置：列与范围）
  const exportCSV = () => {
    const rowsForExport = exportScope === "current" ? pagedRows : sortedRows;
    const header = exportColumns.map(k => columnsConfig.find(c => c.key === k)!.label);
    const lines = rowsForExport.map(r => {
      const toCell = (key: ColKey) => {
        if (key === "registrationRate") return `${((r as any).registrationRate * 100).toFixed(2)}%`;
        if (key === "inquiryRate") return `${((r as any).inquiryRate * 100).toFixed(2)}%`;
        if (key === "orderRate") return `${((r as any).orderRate * 100).toFixed(2)}%`;
        // @ts-ignore
        return r[key];
      };
      return exportColumns.map(toCell).join(",");
    });
    const blob = new Blob([header.join(",") + "\n" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "attribution_report.csv"; a.click();
    URL.revokeObjectURL(url);
    setExportOpen(false);
  };

  // 搜索与重置
  const handleSearch = () => {
    setPage(1);
  };
  const handleReset = () => {
    setSearch("");
    setFilters({ sources: [], mediums: [], campaigns: [] });
    setPage(1);
    setSortPrimary("orderAmount");
    setSortPrimaryDir("desc");
    setSortSecondary("orderRate");
    setSortSecondaryDir("desc");
    setExportColumns(columnsConfig.map(c=>c.key));
    setExportScope("current");
  };

  // UI 渲染
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      {/* 筛选区 - 样式参考用户画像 */}
      <Card className="p-6 mb-8 bg-white shadow-sm">

        <div className="flex flex-wrap items-center gap-3 md:gap-4">
      {/* 搜索框 */}
      <div className="relative flex-1">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="搜索来源/媒介/活动..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          className="pl-10"
        />
      </div>
      
      {/* 时间范围 */}

          <div className="w-[280px] shrink-0">
        <AdvancedDateRangePicker value={dateRange} onChange={setDateRange} onPresetChange={() => {}} />
      </div>
      
      {/* 来源多选 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>

        <Button variant="outline" className="shrink-0">来源（{filters.sources.length || '全部'}）</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuCheckboxItem checked={filters.sources.length === 0} onCheckedChange={()=>setFilters(p=>({ ...p, sources: [] }))}>全部</DropdownMenuCheckboxItem>
          {sources.map(s => (
            <DropdownMenuCheckboxItem
              key={s}
              checked={filters.sources.includes(s)}
              onCheckedChange={(checked)=>setFilters(p=>({ ...p, sources: checked ? [...p.sources, s] : p.sources.filter(x=>x!==s) }))}
            >{s}</DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* 媒介多选 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>

        <Button variant="outline" className="shrink-0">媒介（{filters.mediums.length || '全部'}）</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuCheckboxItem checked={filters.mediums.length === 0} onCheckedChange={()=>setFilters(p=>({ ...p, mediums: [] }))}>全部</DropdownMenuCheckboxItem>
          {mediums.map(m => (
            <DropdownMenuCheckboxItem
              key={m}
              checked={filters.mediums.includes(m)}
              onCheckedChange={(checked)=>setFilters(p=>({ ...p, mediums: checked ? [...p.mediums, m] : p.mediums.filter(x=>x!==m) }))}
            >{m}</DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* 活动多选 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>

        <Button variant="outline" className="shrink-0">活动（{filters.campaigns.length || '全部'}）</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64">
          <DropdownMenuCheckboxItem checked={filters.campaigns.length === 0} onCheckedChange={()=>setFilters(p=>({ ...p, campaigns: [] }))}>全部</DropdownMenuCheckboxItem>
          {campaigns.map(c => (
            <DropdownMenuCheckboxItem
              key={c}
              checked={filters.campaigns.includes(c)}
              onCheckedChange={(checked)=>setFilters(p=>({ ...p, campaigns: checked ? [...p.campaigns, c] : p.campaigns.filter(x=>x!==c) }))}
            >{c}</DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* 操作按钮 */}

      <div className="flex items-center gap-2 shrink-0">
        <Button onClick={handleSearch} className="flex items-center gap-2 h-10">
          <SearchIcon className="h-4 w-4" />
          搜索
        </Button>
        <Button variant="outline" size="default" onClick={handleReset} className="flex items-center gap-2 h-10">
          <RotateCcw className="h-4 w-4" />
          重置
        </Button>
      
        {/* 导出配置弹窗 */}
        <Dialog open={exportOpen} onOpenChange={setExportOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 h-10">
              <Download className="h-4 w-4" /> 导出
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>导出配置</DialogTitle>
              <DialogDescription>选择要导出的列与数据范围</DialogDescription>
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
                        setExportColumns((prev) => checked ? [...prev, c.key] : prev.filter((k) => k !== c.key))
                      }
                    />
                    <Label htmlFor={`col-${c.key}`}>{c.label}</Label>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={()=>setExportColumns(columnsConfig.map(c=>c.key))}>全选</Button>
                <Button variant="ghost" size="sm" onClick={()=>setExportColumns([])}>清空</Button>
              </div>
            </div>
      
            {/* 范围选择 */}
            <div className="space-y-3">
              <Label className="text-sm">数据范围</Label>
              <RadioGroup value={exportScope} onValueChange={(v: "current" | "all") => setExportScope(v)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem id="scope-current" value="current" />
                  <Label htmlFor="scope-current">导出当前页</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem id="scope-all" value="all" />
                  <Label htmlFor="scope-all">导出全部数据（按当前筛选与排序）</Label>
                </div>
              </RadioGroup>
            </div>
      
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={()=>setExportOpen(false)}>取消</Button>
              <Button onClick={exportCSV}>确认导出</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
        </div>
      </Card>

      {/* 列表区 - 表头排序、分页在下方 */}
      <Card className="bg-white shadow-sm">
        <div className="overflow-x-auto">
          <div className="min-w-[1200px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="sticky left-0 z-10 bg-background w-[160px] cursor-pointer select-none hover:bg-gray-100"
                    onClick={(e)=>handleHeaderSort("source", (e as any).shiftKey)}
                  >
                    <div className="flex items-center gap-2">
                      Source
                      {getSortIcon("source")}
                      {sortPrimary === "source" && <span className="text-xs text-gray-500">1</span>}
                      {sortSecondary === "source" && <span className="text-xs text-gray-500">2</span>}
                    </div>
                  </TableHead>
                  <TableHead
                    className="sticky left-[160px] z-10 bg-background w-[160px] cursor-pointer select-none hover:bg-gray-100"
                    onClick={(e)=>handleHeaderSort("medium", (e as any).shiftKey)}
                  >
                    <div className="flex items-center gap-2">
                      Medium
                      {getSortIcon("medium")}
                      {sortPrimary === "medium" && <span className="text-xs text-gray-500">1</span>}
                      {sortSecondary === "medium" && <span className="text-xs text-gray-500">2</span>}
                    </div>
                  </TableHead>
                  <TableHead
                    className="w-[200px] cursor-pointer select-none hover:bg-gray-100"
                    onClick={(e)=>handleHeaderSort("campaign", (e as any).shiftKey)}
                  >
                    <div className="flex items-center gap-2">
                      Campaign
                      {getSortIcon("campaign")}
                      {sortPrimary === "campaign" && <span className="text-xs text-gray-500">1</span>}
                      {sortSecondary === "campaign" && <span className="text-xs text-gray-500">2</span>}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer select-none hover:bg-gray-100" onClick={(e)=>handleHeaderSort("visitors", (e as any).shiftKey)}>
                    <div className="flex items-center gap-2">
                      总访客数
                      {getSortIcon("visitors")}
                      {sortPrimary === "visitors" && <span className="text-xs text-gray-500">1</span>}
                      {sortSecondary === "visitors" && <span className="text-xs text-gray-500">2</span>}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer select-none hover:bg-gray-100" onClick={(e)=>handleHeaderSort("registrations", (e as any).shiftKey)}>
                    <div className="flex items-center gap-2">
                      注册数
                      {getSortIcon("registrations")}
                      {sortPrimary === "registrations" && <span className="text-xs text-gray-500">1</span>}
                      {sortSecondary === "registrations" && <span className="text-xs text-gray-500">2</span>}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer select-none hover:bg-gray-100" onClick={(e)=>handleHeaderSort("registrationRate", (e as any).shiftKey)}>
                    <div className="flex items-center gap-2">
                      注册率
                      {getSortIcon("registrationRate")}
                      {sortPrimary === "registrationRate" && <span className="text-xs text-gray-500">1</span>}
                      {sortSecondary === "registrationRate" && <span className="text-xs text-gray-500">2</span>}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer select-none hover:bg-gray-100" onClick={(e)=>handleHeaderSort("inquiries", (e as any).shiftKey)}>
                    <div className="flex items-center gap-2">
                      询价数
                      {getSortIcon("inquiries")}
                      {sortPrimary === "inquiries" && <span className="text-xs text-gray-500">1</span>}
                      {sortSecondary === "inquiries" && <span className="text-xs text-gray-500">2</span>}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer select-none hover:bg-gray-100" onClick={(e)=>handleHeaderSort("inquiryRate", (e as any).shiftKey)}>
                    <div className="flex items-center gap-2">
                      询价率
                      {getSortIcon("inquiryRate")}
                      {sortPrimary === "inquiryRate" && <span className="text-xs text-gray-500">1</span>}
                      {sortSecondary === "inquiryRate" && <span className="text-xs text-gray-500">2</span>}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer select-none hover:bg-gray-100" onClick={(e)=>handleHeaderSort("orders", (e as any).shiftKey)}>
                    <div className="flex items-center gap-2">
                      订单数
                      {getSortIcon("orders")}
                      {sortPrimary === "orders" && <span className="text-xs text-gray-500">1</span>}
                      {sortSecondary === "orders" && <span className="text-xs text-gray-500">2</span>}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer select-none hover:bg-gray-100" onClick={(e)=>handleHeaderSort("orderRate", (e as any).shiftKey)}>
                    <div className="flex items-center gap-2">
                      下单率
                      {getSortIcon("orderRate")}
                      {sortPrimary === "orderRate" && <span className="text-xs text-gray-500">1</span>}
                      {sortSecondary === "orderRate" && <span className="text-xs text-gray-500">2</span>}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer select-none hover:bg-gray-100" onClick={(e)=>handleHeaderSort("orderAmount", (e as any).shiftKey)}>
                    <div className="flex items-center gap-2">
                      订单金额
                      {getSortIcon("orderAmount")}
                      {sortPrimary === "orderAmount" && <span className="text-xs text-gray-500">1</span>}
                      {sortSecondary === "orderAmount" && <span className="text-xs text-gray-500">2</span>}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedRows.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="sticky left-0 z-10 bg-background w-[160px]">{r.source}</TableCell>
                    <TableCell className="sticky left-[160px] z-10 bg-background w-[160px]">{r.medium}</TableCell>
                    <TableCell className="w-[200px]">{r.campaign}</TableCell>
                    <TableCell>{r.visitors}</TableCell>
                    <TableCell>{r.registrations}</TableCell>
                    <TableCell>{(((r as any).registrationRate) * 100).toFixed(2)}%</TableCell>
                    <TableCell>{r.inquiries}</TableCell>
                    <TableCell>{(((r as any).inquiryRate) * 100).toFixed(2)}%</TableCell>
                    <TableCell>{r.orders}</TableCell>
                    <TableCell>{(((r as any).orderRate) * 100).toFixed(2)}%</TableCell>
                    <TableCell>{r.orderAmount}</TableCell>
                  </TableRow>
                ))}
                {/* 总计行（不参与分页，展示当前筛选与排序后全量的总计） */}
                <TableRow>
                  <TableCell className="sticky left-0 z-10 bg-background w-[160px] font-medium">总计</TableCell>
                  <TableCell className="sticky left-[160px] z-10 bg-background w-[160px]">—</TableCell>
                  <TableCell className="w-[200px]">—</TableCell>
                  <TableCell className="font-medium">{totals.visitors}</TableCell>
                  <TableCell className="font-medium">{totals.registrations}</TableCell>
                  <TableCell className="font-medium">{((totals.registrations / (totals.visitors || 1)) * 100).toFixed(2)}%</TableCell>
                  <TableCell className="font-medium">{totals.inquiries}</TableCell>
                  <TableCell className="font-medium">{((totals.inquiries / (totals.visitors || 1)) * 100).toFixed(2)}%</TableCell>
                  <TableCell className="font-medium">{totals.orders}</TableCell>
                  <TableCell className="font-medium">{((totals.orders / (totals.visitors || 1)) * 100).toFixed(2)}%</TableCell>
                  <TableCell className="font-medium">{totals.orderAmount}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        {/* 分页 - 表格下方 */}
        <div className="px-6 py-4 border-t bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-700 order-2 sm:order-1">
            正在显示 {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, sortedRows.length)} 条，共 {sortedRows.length} 条
          </div>
          <div className="flex items-center gap-2 order-1 sm:order-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p=>Math.max(1, p-1))}
              disabled={page === 1}
            >
              上一页
            </Button>
            <Select value={String(pageSize)} onValueChange={(v)=>{ setPageSize(Number(v)); setPage(1); }}>
              <SelectTrigger className="w-[110px]"><SelectValue placeholder="每页" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p=>Math.min(totalPages, p+1))}
              disabled={page === totalPages}
            >
              下一页
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}