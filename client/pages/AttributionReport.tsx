import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import AdvancedDateRangePicker from "@/components/AdvancedDateRangePicker";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Search as SearchIcon, RotateCcw, ArrowUp, ArrowDown, ArrowUpDown, Settings, GripVertical } from "lucide-react";
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
}

const mockRows: AttributionRow[] = [
  { id: "1", source: "Google", medium: "CPC", campaign: "Summer_Sale", sessions: 1800, visitors: 1200, registrations: 240, logins: 180, addToCart: 150, checkouts: 120, orders: 90, purchases: 85, inquiries: 120, orderAmount: 36000, purchaseAmount: 34000 },
  { id: "2", source: "Google", medium: "CPC", campaign: "Brand_Search", sessions: 1200, visitors: 800, registrations: 160, logins: 120, addToCart: 100, checkouts: 80, orders: 60, purchases: 55, inquiries: 80, orderAmount: 19000, purchaseAmount: 17500 },
  { id: "3", source: "Facebook", medium: "Ads", campaign: "Lookalike_2%", sessions: 2200, visitors: 1500, registrations: 200, logins: 150, addToCart: 180, checkouts: 140, orders: 75, purchases: 70, inquiries: 110, orderAmount: 28000, purchaseAmount: 26000 },
  { id: "4", source: "Email", medium: "EDM", campaign: "VIP_Drop", sessions: 1300, visitors: 900, registrations: 180, logins: 160, addToCart: 130, checkouts: 110, orders: 65, purchases: 60, inquiries: 95, orderAmount: 19000, purchaseAmount: 18000 },
  { id: "5", source: "Direct", medium: "None", campaign: "Homepage", sessions: 2400, visitors: 1600, registrations: 120, logins: 100, addToCart: 80, checkouts: 60, orders: 40, purchases: 35, inquiries: 60, orderAmount: 15000, purchaseAmount: 14000 },
];

// 排序与列配置类型
type SortKey = "source" | "medium" | "campaign" | "sessions" | "visitors" | "registrations" | "logins" | "addToCart" | "checkouts" | "orders" | "purchases" | "inquiries" | "registrationRate" | "loginRate" | "addToCartRate" | "checkoutRate" | "orderRate" | "purchaseRate" | "inquiryRate" | "conversionRate" | "orderAmount" | "purchaseAmount";
type ColKey = "source"|"medium"|"campaign"|"sessions"|"visitors"|"registrations"|"logins"|"addToCart"|"checkouts"|"orders"|"purchases"|"inquiries"|"registrationRate"|"loginRate"|"addToCartRate"|"checkoutRate"|"orderRate"|"purchaseRate"|"inquiryRate"|"conversionRate"|"orderAmount"|"purchaseAmount";

const columnsConfig: { key: ColKey; label: string }[] = [
  { key: "source", label: "Source" },
  { key: "medium", label: "Medium" },
  { key: "campaign", label: "Campaign" },
  { key: "sessions", label: "会话数" },
  { key: "visitors", label: "总访客数" },
  { key: "registrations", label: "注册数" },
  { key: "logins", label: "登录数" },
  { key: "addToCart", label: "加购数" },
  { key: "checkouts", label: "结账数" },
  { key: "orders", label: "订单数" },
  { key: "purchases", label: "购买数" },
  { key: "inquiries", label: "询价数" },
];

export default function AttributionReport() {
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
  const [search, setSearch] = useState("");
  // 多选筛选条件
  const [filters, setFilters] = useState<{ sources: string[]; mediums: string[]; campaigns: string[] }>({ sources: [], mediums: [], campaigns: [] });
  // 排序（主/次）
  const [sortPrimary, setSortPrimary] = useState<SortKey>("orders");
  const [sortPrimaryDir, setSortPrimaryDir] = useState<"asc"|"desc">("desc");
  const [sortSecondary, setSortSecondary] = useState<SortKey>("registrations");
  const [sortSecondaryDir, setSortSecondaryDir] = useState<"asc"|"desc">("desc");
  // 分页
  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  // 导出配置
  const [exportColumns, setExportColumns] = useState<ColKey[]>(columnsConfig.map(c=>c.key));
  const [exportOpen, setExportOpen] = useState(false);
  const [exportScope, setExportScope] = useState<"current"|"all">("current");
  
  // 列配置弹窗状态
  const [columnConfigOpen, setColumnConfigOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<ColKey[]>(() => {
    // 从本地存储加载列配置
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('attribution-report-visible-columns');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // 如果解析失败，使用默认配置
        }
      }
    }
    return columnsConfig.map(c=>c.key);
  });

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
    loginRate: r.visitors ? r.logins / r.visitors : 0,
    addToCartRate: r.visitors ? r.addToCart / r.visitors : 0,
    checkoutRate: r.visitors ? r.checkouts / r.visitors : 0,
    orderRate: r.visitors ? r.orders / r.visitors : 0,
    purchaseRate: r.visitors ? r.purchases / r.visitors : 0,
    inquiryRate: r.visitors ? r.inquiries / r.visitors : 0,
    conversionRate: r.visitors ? (r.purchases || r.orders || r.registrations) / r.visitors : 0,
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
      sessions: acc.sessions + r.sessions,
      visitors: acc.visitors + r.visitors,
      registrations: acc.registrations + r.registrations,
      logins: acc.logins + r.logins,
      addToCart: acc.addToCart + r.addToCart,
      checkouts: acc.checkouts + r.checkouts,
      orders: acc.orders + r.orders,
      purchases: acc.purchases + r.purchases,
      inquiries: acc.inquiries + r.inquiries,
    }), { sessions: 0, visitors: 0, registrations: 0, logins: 0, addToCart: 0, checkouts: 0, orders: 0, purchases: 0, inquiries: 0 });
  }, [sortedRows]);

  // 导出（弹窗配置：列与范围）
  const exportCSV = () => {
    const rowsForExport = exportScope === "current" ? pagedRows : sortedRows;
    const header = exportColumns.map(k => columnsConfig.find(c => c.key === k)!.label);
    const lines = rowsForExport.map(r => {
      const toCell = (key: ColKey) => {
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

  // 重置函数更新 - 重置列配置
  const handleReset = () => {
    setSearch("");
    setFilters({ sources: [], mediums: [], campaigns: [] });
    setPage(1);
    setSortPrimary("orders");
    setSortPrimaryDir("desc");
    setSortSecondary("registrations");
    setSortSecondaryDir("desc");
    setExportColumns(columnsConfig.map(c=>c.key));
    setExportScope("current");
    setVisibleColumns(columnsConfig.map(c=>c.key)); // 重置列配置
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
          onKeyPress={(e) => e.key === "Enter" && setSearch(e.currentTarget.value)}
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
        <Button variant="outline" className="flex items-center gap-2 h-10 pointer-events-none opacity-60">
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
        
        {/* 列配置弹窗 */}
        <Dialog open={columnConfigOpen} onOpenChange={setColumnConfigOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 h-10">
              <Settings className="h-4 w-4" /> 列配置
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>列配置</DialogTitle>
              <DialogDescription>选择要显示的列，拖动可调整顺序</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* 列选择区域 */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">显示列</Label>
                <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                  {columnsConfig.map((c) => (
                    <div key={c.key} className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50">
                      <Checkbox
                        id={`visible-${c.key}`}
                        checked={visibleColumns.includes(c.key)}
                        onCheckedChange={(checked) =>
                          setVisibleColumns((prev) => checked ? [...prev, c.key] : prev.filter((k) => k !== c.key))
                        }
                      />
                      <Label htmlFor={`visible-${c.key}`} className="cursor-pointer flex-1">
                        {c.label}
                      </Label>
                      <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setVisibleColumns(columnsConfig.map(c => c.key))}
                  >
                    全选
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setVisibleColumns([])}
                  >
                    清空
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setVisibleColumns(['source', 'medium', 'campaign', 'visitors', 'orders', 'orderAmount'])}
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
                      {visibleColumns.map(key => {
                        const config = columnsConfig.find(c => c.key === key);
                        return (
                          <span key={key} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
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
              <Button variant="outline" onClick={() => setColumnConfigOpen(false)}>
                取消
              </Button>
              <Button onClick={() => {
                localStorage.setItem('attribution-report-visible-columns', JSON.stringify(visibleColumns));
                setColumnConfigOpen(false);
              }}>
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
        <div className="overflow-x-auto">
          <div className="min-w-[1200px]">
            <Table>
              <TableHeader>
                <TableRow>
                  {visibleColumns.includes('source') && (
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
                  )}
                  {visibleColumns.includes('medium') && (
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
                  )}
                  {visibleColumns.includes('campaign') && (
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
                  )}
                  {visibleColumns.includes('sessions') && (
                    <TableHead className="cursor-pointer select-none hover:bg-gray-100" onClick={(e)=>handleHeaderSort("sessions", (e as any).shiftKey)}>
                      <div className="flex items-center gap-2">
                        会话数
                        {getSortIcon("sessions")}
                        {sortPrimary === "sessions" && <span className="text-xs text-gray-500">1</span>}
                        {sortSecondary === "sessions" && <span className="text-xs text-gray-500">2</span>}
                      </div>
                    </TableHead>
                  )}
                  {visibleColumns.includes('visitors') && (
                    <TableHead className="cursor-pointer select-none hover:bg-gray-100" onClick={(e)=>handleHeaderSort("visitors", (e as any).shiftKey)}>
                      <div className="flex items-center gap-2">
                        总访客数
                        {getSortIcon("visitors")}
                        {sortPrimary === "visitors" && <span className="text-xs text-gray-500">1</span>}
                        {sortSecondary === "visitors" && <span className="text-xs text-gray-500">2</span>}
                      </div>
                    </TableHead>
                  )}
                  {visibleColumns.includes('registrations') && (
                    <TableHead className="cursor-pointer select-none hover:bg-gray-100" onClick={(e)=>handleHeaderSort("registrations", (e as any).shiftKey)}>
                      <div className="flex items-center gap-2">
                        注册数
                        {getSortIcon("registrations")}
                        {sortPrimary === "registrations" && <span className="text-xs text-gray-500">1</span>}
                        {sortSecondary === "registrations" && <span className="text-xs text-gray-500">2</span>}
                      </div>
                    </TableHead>
                  )}
                  {visibleColumns.includes('logins') && (
                    <TableHead className="cursor-pointer select-none hover:bg-gray-100" onClick={(e)=>handleHeaderSort("logins", (e as any).shiftKey)}>
                      <div className="flex items-center gap-2">
                        登录数
                        {getSortIcon("logins")}
                        {sortPrimary === "logins" && <span className="text-xs text-gray-500">1</span>}
                        {sortSecondary === "logins" && <span className="text-xs text-gray-500">2</span>}
                      </div>
                    </TableHead>
                  )}
                  {visibleColumns.includes('addToCart') && (
                    <TableHead className="cursor-pointer select-none hover:bg-gray-100" onClick={(e)=>handleHeaderSort("addToCart", (e as any).shiftKey)}>
                      <div className="flex items-center gap-2">
                        加购数
                        {getSortIcon("addToCart")}
                        {sortPrimary === "addToCart" && <span className="text-xs text-gray-500">1</span>}
                        {sortSecondary === "addToCart" && <span className="text-xs text-gray-500">2</span>}
                      </div>
                    </TableHead>
                  )}
                  {visibleColumns.includes('checkouts') && (
                    <TableHead className="cursor-pointer select-none hover:bg-gray-100" onClick={(e)=>handleHeaderSort("checkouts", (e as any).shiftKey)}>
                      <div className="flex items-center gap-2">
                        结账数
                        {getSortIcon("checkouts")}
                        {sortPrimary === "checkouts" && <span className="text-xs text-gray-500">1</span>}
                        {sortSecondary === "checkouts" && <span className="text-xs text-gray-500">2</span>}
                      </div>
                    </TableHead>
                  )}
                  {visibleColumns.includes('orders') && (
                    <TableHead className="cursor-pointer select-none hover:bg-gray-100" onClick={(e)=>handleHeaderSort("orders", (e as any).shiftKey)}>
                      <div className="flex items-center gap-2">
                        订单数
                        {getSortIcon("orders")}
                        {sortPrimary === "orders" && <span className="text-xs text-gray-500">1</span>}
                        {sortSecondary === "orders" && <span className="text-xs text-gray-500">2</span>}
                      </div>
                    </TableHead>
                  )}
                  {visibleColumns.includes('purchases') && (
                    <TableHead className="cursor-pointer select-none hover:bg-gray-100" onClick={(e)=>handleHeaderSort("purchases", (e as any).shiftKey)}>
                      <div className="flex items-center gap-2">
                        购买数
                        {getSortIcon("purchases")}
                        {sortPrimary === "purchases" && <span className="text-xs text-gray-500">1</span>}
                        {sortSecondary === "purchases" && <span className="text-xs text-gray-500">2</span>}
                      </div>
                    </TableHead>
                  )}
                  {visibleColumns.includes('inquiries') && (
                    <TableHead className="cursor-pointer select-none hover:bg-gray-100" onClick={(e)=>handleHeaderSort("inquiries", (e as any).shiftKey)}>
                      <div className="flex items-center gap-2">
                        询价数
                        {getSortIcon("inquiries")}
                        {sortPrimary === "inquiries" && <span className="text-xs text-gray-500">1</span>}
                        {sortSecondary === "inquiries" && <span className="text-xs text-gray-500">2</span>}
                      </div>
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedRows.map(r => (
                  <TableRow key={r.id}>
                    {visibleColumns.includes('source') && <TableCell className="sticky left-0 z-10 bg-background w-[160px]">{r.source}</TableCell>}
                    {visibleColumns.includes('medium') && <TableCell className="sticky left-[160px] z-10 bg-background w-[160px]">{r.medium}</TableCell>}
                    {visibleColumns.includes('campaign') && <TableCell className="w-[200px]">{r.campaign}</TableCell>}
                    {visibleColumns.includes('sessions') && <TableCell>{r.sessions}</TableCell>}
                    {visibleColumns.includes('visitors') && <TableCell>{r.visitors}</TableCell>}
                    {visibleColumns.includes('registrations') && <TableCell>{r.registrations}</TableCell>}
                    {visibleColumns.includes('logins') && <TableCell>{r.logins}</TableCell>}
                    {visibleColumns.includes('addToCart') && <TableCell>{r.addToCart}</TableCell>}
                    {visibleColumns.includes('checkouts') && <TableCell>{r.checkouts}</TableCell>}
                    {visibleColumns.includes('orders') && <TableCell>{r.orders}</TableCell>}
                    {visibleColumns.includes('purchases') && <TableCell>{r.purchases}</TableCell>}
                    {visibleColumns.includes('inquiries') && <TableCell>{r.inquiries}</TableCell>}
                  </TableRow>
                ))}
                {/* 总计行（不参与分页，展示当前筛选与排序后全量的总计） */}
                <TableRow>
                  {visibleColumns.includes('source') && <TableCell className="sticky left-0 z-10 bg-background w-[160px] font-medium">总计</TableCell>}
                  {visibleColumns.includes('medium') && <TableCell className="sticky left-[160px] z-10 bg-background w-[160px]">—</TableCell>}
                  {visibleColumns.includes('campaign') && <TableCell className="w-[200px]">—</TableCell>}
                  {visibleColumns.includes('sessions') && <TableCell className="font-medium">{totals.sessions}</TableCell>}
                  {visibleColumns.includes('visitors') && <TableCell className="font-medium">{totals.visitors}</TableCell>}
                  {visibleColumns.includes('registrations') && <TableCell className="font-medium">{totals.registrations}</TableCell>}
                  {visibleColumns.includes('logins') && <TableCell className="font-medium">{totals.logins}</TableCell>}
                  {visibleColumns.includes('addToCart') && <TableCell className="font-medium">{totals.addToCart}</TableCell>}
                  {visibleColumns.includes('checkouts') && <TableCell className="font-medium">{totals.checkouts}</TableCell>}
                  {visibleColumns.includes('orders') && <TableCell className="font-medium">{totals.orders}</TableCell>}
                  {visibleColumns.includes('purchases') && <TableCell className="font-medium">{totals.purchases}</TableCell>}
                  {visibleColumns.includes('inquiries') && <TableCell className="font-medium">{totals.inquiries}</TableCell>}
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