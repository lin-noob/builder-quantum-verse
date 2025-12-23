import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ExternalLink, Sparkles, AlertTriangle, CheckCircle2, Circle, TrendingUp, MousePointer2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import dayjs from "dayjs";
import { DatePicker, Slider, Table } from "antd";

import { request } from "@/lib/request";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PageMetric {
  pagePath: string;
  pv: string | number;
  uv: string | number;
  downstreamPvCount: string | number | null;
  exitCount: string | number;
  avgStaySecondsStr: string | number | null;
  exitRate: string | number | null;
  downstreamRate: string | number | null;
  aiScore: string | number | null;
  aiSuggestion: string | null;
  aiDiagnosis: string | null;
}

interface HeatmapPoint {
  x: number;
  y: number;
  value: number;
}

const chartData = [
  { name: "6天前", pv: 1800, uv: 1320, stay: 65 },
  { name: "5天前", pv: 1650, uv: 1240, stay: 62 },
  { name: "4天前", pv: 1720, uv: 1280, stay: 68 },
  { name: "3天前", pv: 1600, uv: 1210, stay: 60 },
  { name: "2天前", pv: 1580, uv: 1190, stay: 58 },
  { name: "昨天", pv: 1520, uv: 1160, stay: 55 },
];

const mockPageData: PageMetric[] = [
  {
    pagePath: "/home",
    pv: 12500,
    uv: 8900,
    downstreamPvCount: 4500,
    exitCount: 1200,
    avgStaySecondsStr: 165,
    exitRate: null,
    downstreamRate: null,
    aiScore: 85,
    aiSuggestion: null,
    aiDiagnosis: null,
  },
  {
    pagePath: "/products",
    pv: 8200,
    uv: 5600,
    downstreamPvCount: 3100,
    exitCount: 800,
    avgStaySecondsStr: 192,
    exitRate: null,
    downstreamRate: null,
    aiScore: 82,
    aiSuggestion: null,
    aiDiagnosis: null,
  },
  {
    pagePath: "/pricing",
    pv: 4500,
    uv: 3200,
    downstreamPvCount: 1200,
    exitCount: 450,
    avgStaySecondsStr: 118,
    exitRate: null,
    downstreamRate: null,
    aiScore: 78,
    aiSuggestion: null,
    aiDiagnosis: null,
  },
  {
    pagePath: "/about",
    pv: 2100,
    uv: 1800,
    downstreamPvCount: 400,
    exitCount: 300,
    avgStaySecondsStr: 80,
    exitRate: null,
    downstreamRate: null,
    aiScore: 75,
    aiSuggestion: null,
    aiDiagnosis: null,
  },
  {
    pagePath: "/contact",
    pv: 1500,
    uv: 1200,
    downstreamPvCount: 200,
    exitCount: 150,
    avgStaySecondsStr: 45,
    exitRate: null,
    downstreamRate: null,
    aiScore: 70,
    aiSuggestion: null,
    aiDiagnosis: null,
  },
];

export default function PageAnalysis() {
  const [timeRange, setTimeRange] = useState("today");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [selectedPage, setSelectedPage] = useState<PageMetric | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [scale, setScale] = useState(0.3);
  const [heatmapPoints, setHeatmapPoints] = useState<HeatmapPoint[]>([]);

  // Pagination and Data State
  const [data, setData] = useState<PageMetric[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const iframe = useRef<HTMLIFrameElement | null>(null);

  const loadingSteps = [
    "初始化页面爬虫...",
    "捕获页面截图...",
    "获取用户点击热力图数据...",
    "AI 正在分析界面与指标...",
  ];

  const fetchData = async () => {
    setIsLoading(true);
    try {
      let finalStartDate = startDate;
      let finalEndDate = endDate;

      if (timeRange !== "custom") {
        const now = dayjs();
        if (timeRange === "today") {
          finalStartDate = now.startOf("day").toDate();
          finalEndDate = now.endOf("day").toDate();
        } else if (timeRange === "yesterday") {
          finalStartDate = now.subtract(1, "day").startOf("day").toDate();
          finalEndDate = now.subtract(1, "day").endOf("day").toDate();
        } else if (timeRange === "7days") {
          finalStartDate = now.subtract(7, "day").startOf("day").toDate();
          finalEndDate = now.endOf("day").toDate();
        } else if (timeRange === "30days") {
          finalStartDate = now.subtract(30, "day").startOf("day").toDate();
          finalEndDate = now.endOf("day").toDate();
        }
      }

      const response = await request.post("/quote/api/v1/behavior/page", {
        pagesize: pageSize,
        currentpage: currentPage,
        timeRange,
        startDate: finalStartDate?.toISOString(),
        endDate: finalEndDate?.toISOString(),
      });
      const data = response.data.data;
      if (data && data.records) {
        setData(data.records || []);
        setTotal(data.total || 0);
      } else {
        // Fallback to mock data if response is empty
        setData(mockPageData);
        setTotal(mockPageData.length);
      }
    } catch (error) {
      console.error("Failed to fetch page analysis data, using mock data:", error);
      setData(mockPageData);
      setTotal(mockPageData.length);
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    {
      title: "页面路径",
      dataIndex: "pagePath",
      key: "pagePath",
      width: 300,
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) => (
        <a
          href={text}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-blue-500 block truncate"
          title={text}
        >
          {text}
        </a>
      ),
    },
    {
      title: "PV",
      dataIndex: "pv",
      key: "pv",
      align: "right" as const,
      className: "tabular-nums",
    },
    {
      title: "UV",
      dataIndex: "uv",
      key: "uv",
      align: "right" as const,
      className: "tabular-nums",
    },
    {
      title: "下游浏览量",
      dataIndex: "downstreamPvCount",
      key: "downstreamPvCount",
      align: "right" as const,
      className: "tabular-nums",
      render: (val: any) => val || 0,
    },
    {
      title: "退出页次数",
      dataIndex: "exitCount",
      key: "exitCount",
      align: "right" as const,
      className: "tabular-nums",
    },
    {
      title: "平均停留时长(秒)",
      dataIndex: "avgStaySecondsStr",
      key: "avgStaySecondsStr",
      align: "right" as const,
      className: "tabular-nums",
      render: (val: any) => val || 0,
    },
    {
      title: "操作",
      key: "action",
      align: "center" as const,
      render: (_: any, record: PageMetric) => (
        <Button
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1"
          onClick={() => handleDiagnose(record)}
        >
          <Sparkles className="h-3 w-3" /> AI 诊断
        </Button>
      ),
    },
  ];

  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize, timeRange, startDate, endDate]);

  useEffect(() => {
    if (isSheetOpen && loadingStep < loadingSteps.length) {
      const timer = setTimeout(() => {
        setLoadingStep((prev) => prev + 1);
      }, 800);
      return () => clearTimeout(timer);
    }

    if (isSheetOpen && loadingStep === loadingSteps.length) {
      // Only request once when loading finishes
      const timer = setTimeout(() => {
        iframe.current = document.getElementById("myIframe") as HTMLIFrameElement;
        if (iframe.current) {
          requestElementPosition([
            {
              tag_name: "span",
              nth_child: 1,
              nth_of_type: 1,
              $el_text: "Explore Now",
            },
            {
              tag_name: "button",
              $el_text: "Explore Now",
              classes: ["ant-btn", "css-dev-only-do-not-override-16d607q", "ant-btn-primary"],
              attr__type: "button",
              attr__class: "ant-btn css-dev-only-do-not-override-16d607q ant-btn-primary",
              nth_child: 1,
              nth_of_type: 1,
            },
            {
              tag_name: "div",
              classes: ["Header_btn__zJNkB"],
              attr__class: "Header_btn__zJNkB",
              nth_child: 3,
              nth_of_type: 1,
            },
            {
              tag_name: "div",
              classes: ["Header_content__ozzI5"],
              attr__class: "Header_content__ozzI5",
              nth_child: 1,
              nth_of_type: 1,
            },
            {
              tag_name: "div",
              classes: ["Header_header__VSk7f"],
              attr__class: "Header_header__VSk7f",
              nth_child: 1,
              nth_of_type: 1,
            },
            {
              tag_name: "section",
              classes: ["Main_main__tu3Ga"],
              attr__class: "Main_main__tu3Ga",
              nth_child: 1,
              nth_of_type: 1,
            },
            {
              tag_name: "section",
              classes: ["page_main__nw1Wk"],
              attr__class: "page_main__nw1Wk",
              nth_child: 2,
              nth_of_type: 1,
            },
            {
              tag_name: "body",
              "attr__data-hash": "922142f",
              nth_child: 10,
              nth_of_type: 1,
            },
          ]);
        }
      }, 5000);
    }
  }, [isSheetOpen, loadingStep]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "heatmap-element-position") {
        const { found, position } = event.data.data;
        if (found && position) {
          setHeatmapPoints((prev) => [...prev, { x: position.centerX, y: position.centerY, value: 10000000 }]);
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleDiagnose = (page: PageMetric) => {
    setSelectedPage(page);
    setLoadingStep(0);
    setHeatmapPoints([]); // Clear previous points
    setIsSheetOpen(true);
  };

  function requestElementPosition(elements: any[]) {
    if (!iframe.current) {
      return;
    }
    iframe.current.contentWindow?.postMessage(
      {
        type: "heatmap-locate-element",
        data: {
          elements: elements,
          requestId: Date.now().toString(),
        },
      },
      "*",
    );
  }

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="p-6 space-y-6 bg-white min-h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">访问页面分析</h1>
      </div>

      <Card className="border-none shadow-sm bg-slate-50/30">
        <CardContent className="space-y-6 p-0">
          <div className="flex items-center gap-4 flex-wrap">
            <Tabs value={timeRange} onValueChange={setTimeRange} className="w-auto">
              <TabsList className="bg-slate-100/50 p-1">
                <TabsTrigger value="today" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  今天
                </TabsTrigger>
                <TabsTrigger value="yesterday" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  昨天
                </TabsTrigger>
                <TabsTrigger value="7days" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  最近7天
                </TabsTrigger>
                <TabsTrigger value="30days" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  最近30天
                </TabsTrigger>
                <TabsTrigger value="custom" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  自定义
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {timeRange === "custom" && (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                <DatePicker.RangePicker
                  value={startDate && endDate ? [dayjs(startDate), dayjs(endDate)] : undefined}
                  onChange={(dates) => {
                    if (dates && dates[0] && dates[1]) {
                      setStartDate(dates[0].toDate());
                      setEndDate(dates[1].toDate());
                    } else {
                      setStartDate(undefined);
                      setEndDate(undefined);
                    }
                  }}
                  placeholder={["开始日期", "结束日期"]}
                  className="h-9"
                  popupStyle={{ zIndex: 1050 }}
                />
              </div>
            )}
          </div>

          <div className="border rounded-lg bg-white overflow-hidden">
            <Table
              columns={columns}
              dataSource={data}
              rowKey="pagePath"
              loading={isLoading}
              pagination={false}
              scroll={{ y: 550 }}
              className="ant-table-custom"
            />
          </div>

          {total > 0 && (
            <div className="flex items-center justify-between px-2">
              <div className="text-sm text-gray-500">
                共 {total} 条记录，当前第 {currentPage} / {totalPages} 页
              </div>
              <Pagination className="w-auto mx-0">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) setCurrentPage(currentPage - 1);
                      }}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>

                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            isActive={currentPage === page}
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(page);
                            }}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    } else if (
                      (page === currentPage - 2 && page > 1) ||
                      (page === currentPage + 2 && page < totalPages)
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    return null;
                  })}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                      }}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-[1000px] w-[90vw] flex flex-col p-0 overflow-hidden">
          <SheetHeader className="p-6 border-b shrink-0">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-lg font-bold">AI 页面诊断 — {selectedPage?.pagePath}</SheetTitle>
            </div>
          </SheetHeader>

          <div className="flex-1 flex overflow-hidden">
            {/* Sheet Sidebar */}
            <div className="w-64 border-r bg-slate-50/50 p-4 shrink-0 flex flex-col gap-4">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">诊断模块</div>
                <Button variant="ghost" className="w-full justify-start gap-2 bg-white shadow-sm text-indigo-600">
                  <MousePointer2 className="h-4 w-4" /> 交互热力图
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2 text-gray-600">
                  <TrendingUp className="h-4 w-4" /> 转化漏斗分析
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2 text-gray-600">
                  <Sparkles className="h-4 w-4" /> 智能优化建议
                </Button>
              </div>

              <div className="mt-auto pt-4 border-t">
                <Card className="bg-indigo-600 text-white border-none shadow-md">
                  <CardContent className="p-4 space-y-2">
                    <div className="text-xs opacity-80">AI 综合评分</div>
                    <div className="text-3xl font-bold">{selectedPage?.aiScore || 85}</div>
                    <div className="text-[10px] opacity-70 leading-tight">
                      {selectedPage?.aiSuggestion || "高于 78% 的同类页面，主要扣分项为移动端加载速度。"}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Sheet Main Content */}
            <div className="flex-1 overflow-auto p-6">
              {loadingStep < loadingSteps.length ? (
                <div className="space-y-4 py-8 max-w-md mx-auto">
                  {loadingSteps.map((step, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      {loadingStep > i ? (
                        <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                      ) : loadingStep === i ? (
                        <Circle className="h-5 w-5 text-indigo-600 animate-pulse" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-200" />
                      )}
                      <span className={loadingStep >= i ? "text-gray-900 font-medium" : "text-gray-400"}>{step}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col gap-6">
                  <Tabs defaultValue="screenshot" className="flex-1 flex flex-col min-h-0">
                    <div className="flex items-center justify-between mb-4 shrink-0">
                      <TabsList className="bg-transparent border-b rounded-none h-auto p-0 gap-6">
                        <TabsTrigger
                          value="screenshot"
                          className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent px-0 pb-2 text-sm"
                        >
                          页面截图
                        </TabsTrigger>
                        <TabsTrigger
                          value="history"
                          className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent px-0 pb-2 text-sm"
                        >
                          历史趋势
                        </TabsTrigger>
                      </TabsList>

                      <div className="flex gap-1">
                        {["今天", "昨天", "最近7天", "最近30天", "自定义"].map((label, i) => (
                          <Button
                            key={i}
                            variant="ghost"
                            size="sm"
                            className={
                              i === 2
                                ? "bg-indigo-50 text-indigo-600 border border-indigo-200 h-7 text-xs"
                                : "h-7 text-xs border"
                            }
                          >
                            {label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <TabsContent value="screenshot" className="flex-1 min-h-0 mt-0">
                      <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-slate-50">
                        {/* Browser Toolbar */}
                        <div className="flex items-center justify-between px-4 py-2 bg-white border-b shrink-0">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1.5">
                              <div className="w-3 h-3 rounded-full bg-slate-200" />
                              <div className="w-3 h-3 rounded-full bg-slate-200" />
                              <div className="w-3 h-3 rounded-full bg-slate-200" />
                            </div>
                            <div className="ml-4 px-3 py-1 bg-slate-100 rounded text-[11px] text-gray-400 flex items-center gap-2 min-w-[240px]">
                              <MousePointer2 className="h-3 w-3" /> http://localhost:3000/
                            </div>
                          </div>
                          <div className="flex items-center gap-3 min-w-[200px]">
                            <span className="text-[11px] text-gray-400 shrink-0">缩放:</span>
                            <Slider
                              min={0.2}
                              max={1.5}
                              step={0.05}
                              value={scale}
                              onChange={(val) => setScale(val)}
                              className="flex-1"
                              tooltip={{
                                formatter: (val) => `${Math.round((val || 0) * 100)}%`,
                              }}
                            />
                            <span className="text-[11px] text-gray-500 w-8 text-right">{Math.round(scale * 100)}%</span>
                          </div>
                        </div>

                        {/* Viewport Area */}
                        <div className="flex-1 overflow-auto p-8 flex justify-center bg-slate-100/50">
                          <div
                            className="bg-white shadow-xl origin-top transition-all duration-300 ease-in-out"
                            style={{
                              width: 1920 * scale,
                              height: 4000 * scale,
                              minWidth: 1920 * scale,
                              minHeight: 4000 * scale,
                            }}
                          >
                            <div
                              style={{
                                transform: `scale(${scale})`,
                                transformOrigin: "top left",
                                width: 1920,
                                height: 4000,
                                position: "relative",
                              }}
                            >
                              <iframe
                                id="myIframe"
                                src="http://localhost:3000/"
                                className="w-full h-full border-0 pointer-events-none"
                                title="Heatmap"
                              />
                              {/* Heatmap Overlay */}
                              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                {(() => {
                                  const maxValue = Math.max(...heatmapPoints.map((p) => p.value), 1);
                                  return heatmapPoints.map((point, i) => {
                                    const normalized = point.value / maxValue;
                                    const size = 40 + normalized * 80;
                                    const opacity = 0.4 + normalized * 0.4;

                                    // Color interpolation (Green -> Yellow -> Red)
                                    let r, g, b;
                                    if (normalized < 0.5) {
                                      // Green (34, 197, 94) to Yellow (234, 179, 8)
                                      const factor = normalized * 2;
                                      r = Math.floor(34 + (234 - 34) * factor);
                                      g = Math.floor(197 + (179 - 197) * factor);
                                      b = Math.floor(94 + (8 - 94) * factor);
                                    } else {
                                      // Yellow (234, 179, 8) to Red (239, 68, 68)
                                      const factor = (normalized - 0.5) * 2;
                                      r = Math.floor(234 + (239 - 234) * factor);
                                      g = Math.floor(179 + (68 - 179) * factor);
                                      b = Math.floor(8 + (68 - 8) * factor);
                                    }

                                    return (
                                      <div
                                        key={i}
                                        className="absolute rounded-full blur-xl animate-in fade-in zoom-in duration-500"
                                        style={{
                                          left: point.x,
                                          top: point.y,
                                          width: size,
                                          height: size,
                                          opacity: opacity,
                                          transform: "translate(-50%, -50%)",
                                          background: `radial-gradient(circle, rgba(${r},${g},${b},0.8) 0%, rgba(${r},${g},${b},0.4) 50%, transparent 100%)`,
                                        }}
                                      />
                                    );
                                  });
                                })()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-6">
                        <Card className="shadow-none border bg-slate-50/50">
                          <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-sm font-bold">页面指标汇总</CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <div className="text-xs text-gray-500 space-y-1">
                              <div>
                                PV {selectedPage?.pv} · UV {selectedPage?.uv}
                              </div>
                              <div>下游转化率: {selectedPage?.downstreamRate || "0%"}</div>
                            </div>
                          </CardContent>
                        </Card>
                        <div className="p-4 border border-orange-200 bg-orange-50/50 rounded-lg flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <div className="text-sm font-bold text-gray-900">
                              退出率 {selectedPage?.exitRate || "未知"} (次数: {selectedPage?.exitCount})
                            </div>
                            <div className="text-xs text-gray-600 leading-relaxed">
                              {selectedPage?.aiDiagnosis || "该页面退出率较高，建议检查首屏内容是否足够吸引用户。"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="history" className="flex-1 min-h-0 mt-0 overflow-auto">
                      <div className="space-y-6">
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50">
                            PV
                          </Badge>
                          <Badge variant="outline" className="text-gray-400">
                            UV
                          </Badge>
                          <Badge variant="outline" className="text-gray-400">
                            平均停留时长
                          </Badge>
                        </div>
                        <div className="h-[300px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                              <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: "#999" }}
                              />
                              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#999" }} />
                              <Tooltip />
                              <Line
                                type="monotone"
                                dataKey="pv"
                                stroke="#6366f1"
                                strokeWidth={2}
                                dot={{ r: 4, fill: "#fff", stroke: "#6366f1", strokeWidth: 2 }}
                                activeDot={{ r: 6 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-lg flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                          <div className="text-sm text-gray-700 leading-relaxed">
                            最近7天平均停留时长提升12%，但退出页次数仍偏高，建议继续优化首屏转化。
                          </div>
                        </div>
                        <div className="border rounded-lg overflow-hidden">
                          <Table
                            size="small"
                            pagination={false}
                            dataSource={chartData}
                            rowKey="name"
                            columns={[
                              { title: "日期", dataIndex: "name", key: "name" },
                              { title: "PV", dataIndex: "pv", key: "pv", align: "right" },
                              { title: "UV", dataIndex: "uv", key: "uv", align: "right" },
                              {
                                title: "退出页次数",
                                key: "exit",
                                align: "right",
                                render: (_, record) => Math.floor(record.pv * 0.3),
                              },
                              { title: "平均停留时长(秒)", dataIndex: "stay", key: "stay", align: "right" },
                            ]}
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
