import React, { useState, useEffect } from "react";
import { ruleService, BackendRule } from "@/services/ruleService";
import { useTranslation } from "react-i18next";
import { Search, RotateCcw, Settings, Download, Box, FileText, Home, MoreHorizontal, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { GripVertical, Plus, Trash2, Info } from "lucide-react";
import { DatePicker, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { cn } from "@/lib/utils";
import { TableActionButtons } from "@/components/TableActionButtons";

const { RangePicker } = DatePicker;

// Mock Data
interface AttributionData {
  id: string;
  pageType: string;
  pageTypeKey: string;
  matchRule: string;
  uv: number;
  registrations: number;
  leads: number;
  orders: number;
}

const MOCK_DATA: AttributionData[] = [
  {
    id: "1",
    pageType: "产品页",
    pageTypeKey: "product",
    matchRule: "/products/*",
    uv: 1000,
    registrations: 120,
    leads: 80,
    orders: 30,
  },
  {
    id: "2",
    pageType: "报价页",
    pageTypeKey: "pricing",
    matchRule: "/pricing",
    uv: 500,
    registrations: 200,
    leads: 150,
    orders: 5,
  },
  {
    id: "3",
    pageType: "文章页",
    pageTypeKey: "blog",
    matchRule: "/blog/*",
    uv: 3000,
    registrations: 60,
    leads: 30,
    orders: 0,
  },
  {
    id: "4",
    pageType: "首页",
    pageTypeKey: "home",
    matchRule: "/ 或 /home",
    uv: 5000,
    registrations: 150,
    leads: 100,
    orders: 10,
  },
  {
    id: "5",
    pageType: "其他页面",
    pageTypeKey: "other",
    matchRule: "兜底分类：未匹配上述规则",
    uv: 400,
    registrations: 5,
    leads: 2,
    orders: 1,
  },
];

const AttributionAnalysis = () => {
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([
    dayjs().subtract(7, "day"),
    dayjs(),
  ]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => {
    const saved = localStorage.getItem("attribution_analysis_columns");
    return saved ? JSON.parse(saved) : ["pageType", "matchRule", "uv", "registrations", "leads", "orders"];
  });

  // Save columns to localStorage when they change
  const handleVisibleColumnsChange = (newColumns: string[]) => {
    setVisibleColumns(newColumns);
    localStorage.setItem("attribution_analysis_columns", JSON.stringify(newColumns));
  };

  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [dynamicColumns, setDynamicColumns] = useState<BackendRule[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch dynamic columns
  useEffect(() => {
    const fetchColumns = async () => {
      setLoading(true);
      try {
        const rules = await ruleService.getColRules();
        setDynamicColumns(rules);

        // If no columns are saved, make all dynamic columns visible by default
        const saved = localStorage.getItem("attribution_analysis_columns");
        if (!saved) {
          const defaultVisible = ["pageType", "matchRule", ...rules.map((r) => String(r.id))];
          setVisibleColumns(defaultVisible);
        }
      } catch (error) {
        console.error("Failed to fetch dynamic columns:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchColumns();
  }, []);
  const [rules, setRules] = useState([
    { id: "1", name: "产品页", rule: "/products/", type: "product" },
    { id: "2", name: "报价页", rule: "/pricing", type: "pricing" },
    { id: "3", name: "文章页", rule: "/blog/*", type: "blog" },
    { id: "4", name: "首页", rule: "/", type: "home" },
  ]);

  const handleAddRule = () => {
    const newId = (rules.length + 1).toString();
    setRules([...rules, { id: newId, name: "", rule: "", type: "other" }]);
  };

  const handleDeleteRule = (id: string) => {
    setRules(rules.filter((rule) => rule.id !== id));
  };

  const handleUpdateRule = (id: string, field: "name" | "rule", value: string) => {
    setRules(rules.map((rule) => (rule.id === id ? { ...rule, [field]: value } : rule)));
  };

  // Helper to get icon and color based on page type
  const getPageTypeStyle = (type: string) => {
    switch (type) {
      case "product":
        return { icon: Box, color: "text-blue-600", bg: "bg-blue-100", border: "border-blue-200" };
      case "pricing":
        return {
          icon: DollarSign,
          color: "text-green-600",
          bg: "bg-green-100",
          border: "border-green-200",
        };
      case "blog":
        return {
          icon: FileText,
          color: "text-purple-600",
          bg: "bg-purple-100",
          border: "border-purple-200",
        };
      case "home":
        return {
          icon: Home,
          color: "text-orange-600",
          bg: "bg-orange-100",
          border: "border-orange-200",
        };
      default:
        return {
          icon: MoreHorizontal,
          color: "text-gray-600",
          bg: "bg-gray-100",
          border: "border-gray-200",
        };
    }
  };

  const columns: ColumnsType<any> = [
    {
      title: "首访页面类型",
      dataIndex: "pageType",
      key: "pageType",
      render: (_, record) => {
        const style = getPageTypeStyle(record.pageTypeKey);
        const Icon = style.icon;
        return (
          <div className="flex flex-col gap-1.5 py-1">
            <div className="flex items-center gap-3">
              <div className={`p-1.5 rounded-md ${style.bg} ${style.color} border ${style.border} shadow-sm`}>
                <Icon className="h-4 w-4" />
              </div>
              <span className="font-medium text-slate-900">{record.pageType}</span>
            </div>
            <div className="text-xs text-slate-400 pl-10">匹配规则: {record.matchRule}</div>
          </div>
        );
      },
    },
    ...dynamicColumns.map((rule) => ({
      title: rule.ruleName,
      dataIndex: String(rule.id),
      key: String(rule.id),
      align: "right" as const,
      minWidth: 220,
      ellipsis: true,
      sorter: (a: any, b: any) => {
        const valA = a[rule.id!] || a[rule.ruleName] || 0;
        const valB = b[rule.id!] || b[rule.ruleName] || 0;
        return valA - valB;
      },
      render: (val: any, record: any) => {
        // If val is missing (mock data), try to find by name for demo purposes
        const displayVal = val !== undefined ? val : record[rule.ruleName.toLowerCase()] || 0;
        return <span className="text-slate-600">{(displayVal || 0).toLocaleString()}</span>;
      },
    })),
  ].filter((col) => visibleColumns.includes((col as any).dataIndex || col.key));

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">时间范围</label>
              <RangePicker
                size="middle"
                value={dateRange}
                onChange={(dates) => setDateRange(dates as any)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">渠道来源</label>
              <Select defaultValue="all">
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="全部渠道" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部渠道</SelectItem>
                  <SelectItem value="google">Google Ads</SelectItem>
                  <SelectItem value="facebook">Facebook Ads</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">来源国家/地区</label>
              <Select defaultValue="all">
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="全部地区" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部地区</SelectItem>
                  <SelectItem value="us">United States</SelectItem>
                  <SelectItem value="cn">China</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">页面类型</label>
              <Select defaultValue="all">
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="全部类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value="product">产品页</SelectItem>
                  <SelectItem value="price">报价页</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white h-8">
                <Search className="h-3.5 w-3.5 mr-2" />
                搜索
              </Button>
              <Button variant="outline" size="sm" className="h-8">
                <RotateCcw className="h-3.5 w-3.5 mr-2" />
                重置
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Page Classification Hint / Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center my-6 gap-4">
        <div className="flex items-center gap-2 text-sm bg-yellow-50 px-3 py-2 rounded-md border border-yellow-100">
          <Badge
            variant="outline"
            className="bg-white text-yellow-700 border-yellow-200 gap-1 shadow-sm cursor-pointer hover:bg-yellow-50"
            onClick={() => setIsConfigOpen(true)}
          >
            <Settings className="h-3 w-3" /> 页面分类配置
          </Badge>
          <span className="text-slate-600">
            已配置 <span className="font-semibold text-slate-900 mx-1">5</span> 条规则，自动将 URL
            归类为产品页、报价页等类型
          </span>
        </div>
        <TableActionButtons
          columns={[
            { key: "pageType", label: "页面类型", mandatory: true },
            ...dynamicColumns.map((rule) => ({
              key: String(rule.id),
              label: rule.ruleName,
            })),
          ]}
          visibleColumns={visibleColumns}
          onVisibleColumnsChange={handleVisibleColumnsChange}
          onExport={async ({ columns, scope }) => {
            // Labels for CSV header
            const columnLabels: Record<string, string> = {
              pageType: "页面类型",
              matchRule: "匹配规则",
            };
            dynamicColumns.forEach((rule) => {
              columnLabels[String(rule.id)] = rule.ruleName;
            });

            // Filter labels based on selected columns
            const header = columns.map((key) => columnLabels[key] || key).join(",");

            // Generate rows from MOCK_DATA
            const rows = MOCK_DATA.map((item) => {
              return columns
                .map((key) => {
                  const val = (item as any)[key];
                  return typeof val === "string" ? `"${val}"` : val || 0;
                })
                .join(",");
            });

            const csvContent = [header, ...rows].join("\n");
            const blob = new Blob([`\ufeff${csvContent}`], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `attribution_analysis_${dayjs().format("YYYYMMDD")}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
        />
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <Table
          columns={columns}
          dataSource={MOCK_DATA}
          rowKey="id"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: MOCK_DATA.length,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total}`,
          }}
          summary={(pageData) => {
            const totals: Record<string, number> = {};

            // Initialize totals for visible columns
            columns.forEach((col) => {
              if ((col as any).key !== "pageType" && (col as any).key !== "matchRule") {
                totals[(col as any).key] = 0;
              }
            });

            // Calculate totals
            pageData.forEach((record) => {
              Object.keys(totals).forEach((key) => {
                const rule = dynamicColumns.find((r) => String(r.id) === key);
                // Use fallback logic similar to column render
                const val = record[key] !== undefined ? record[key] : record[rule?.ruleName?.toLowerCase() || ""] || 0;
                totals[key] += Number(val) || 0;
              });
            });

            return (
              <Table.Summary.Row className="bg-slate-50 font-medium">
                <Table.Summary.Cell index={0} className="pl-6 font-semibold text-slate-900">
                  总计
                </Table.Summary.Cell>
                {columns.map((col, idx) => {
                  if (idx === 0) return null; // Already handled by the "总计" cell
                  const key = (col as any).key;
                  if (key === "matchRule") {
                    return <Table.Summary.Cell key={key} index={idx}></Table.Summary.Cell>;
                  }
                  return (
                    <Table.Summary.Cell key={key} index={idx} align="right" className="font-bold text-slate-900">
                      {(totals[key] || 0).toLocaleString()}
                    </Table.Summary.Cell>
                  );
                })}
              </Table.Summary.Row>
            );
          }}
        />
      </div>

      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>页面分类配置</DialogTitle>
            <DialogDescription>设置 URL 匹配规则，系统自动将访客首访页面归类</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Alert className="bg-orange-50 border-orange-200 text-orange-800">
              <Info className="h-4 w-4 text-orange-600" />
              <AlertTitle className="text-orange-900 font-medium ml-2">匹配逻辑说明</AlertTitle>
              <AlertDescription className="ml-2 text-orange-800/90 text-xs">
                系统按规则顺序从上到下匹配，首个符合条件的规则生效。未匹配任何规则的 URL 将自动归入"其他"。支持通配符 *
                匹配任意字符。
              </AlertDescription>
            </Alert>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {rules.map((rule, index) => {
                let styleClass = "";
                switch (rule.type) {
                  case "product":
                    styleClass = "bg-blue-50/50 border-blue-100";
                    break;
                  case "pricing":
                    styleClass = "bg-green-50/50 border-green-100";
                    break;
                  case "blog":
                    styleClass = "bg-purple-50/50 border-purple-100";
                    break;
                  case "home":
                    styleClass = "bg-orange-50/50 border-orange-100";
                    break;
                  default:
                    styleClass = "bg-slate-50 border-slate-200";
                }

                return (
                  <div key={rule.id} className={cn("flex items-center gap-2 p-3 rounded-lg border group", styleClass)}>
                    <GripVertical className="h-4 w-4 text-slate-400 cursor-grab" />

                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-medium ml-1">页面类型名称</label>
                        <Input
                          value={rule.name}
                          onChange={(e) => handleUpdateRule(rule.id, "name", e.target.value)}
                          className="h-8 bg-white"
                          placeholder="例如：产品页"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-medium ml-1">URL 包含规则</label>
                        <div className="flex gap-2">
                          <Input
                            value={rule.rule}
                            onChange={(e) => handleUpdateRule(rule.id, "rule", e.target.value)}
                            className="h-8 bg-white flex-1"
                            placeholder="/example"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDeleteRule(rule.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Default Rule (ReadOnly) */}
              <div className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 bg-slate-50 opacity-60">
                <div className="w-4" /> {/* Spacer for Grip handle */}
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <Input value="其他页面" disabled className="h-8 bg-slate-100" />
                  <Input value="(未匹配以上规则)" disabled className="h-8 bg-slate-100" />
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full border-dashed text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50"
              onClick={handleAddRule}
            >
              <Plus className="h-4 w-4 mr-2" /> 添加新规则
            </Button>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfigOpen(false)}>
              取消
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsConfigOpen(false)}>
              保存配置
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AttributionAnalysis;
