import React from "react";
import {
  Sparkles,
  RefreshCcw,
  X,
  Gauge as GaugeIcon,
  Zap,
  MessageSquare,
  CheckCircle,
  BrainCircuit,
  Terminal,
  Activity,
  ChevronRight,
  Code,
} from "lucide-react";
import { Drawer, Tabs, Button, Badge, Card, Progress, Space, Typography, ConfigProvider } from "antd";
import { cn } from "@/lib/utils";
import { request } from "@/lib/request";

const { Text, Title } = Typography;

interface AuditData {
  audit_summary: {
    overall_score: number;
    grade: string;
    tags: string[];
    verdict: string;
  };
  dimension_scores: {
    dimension: string;
    score: number;
    comment: string;
  }[];
  improvement_suggestions: string[];
  reasoning_trace: {
    thread_analysis: {
      customer_pain_points: string;
      staff_performance: string;
      critical_moments: string;
    };
    scoring_logic: {
      strengths: string[];
      weaknesses: string[];
      deduction_path: string;
    };
  };
}

interface TicketAIDrawerProps {
  ticketId: string;
  initialData?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TicketAIDrawer({ ticketId, initialData, open, onOpenChange }: TicketAIDrawerProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [data, setData] = React.useState<AuditData | null>(null);

  const fetchAuditData = React.useCallback(async () => {
    if (!ticketId) return;

    setIsLoading(true);
    try {
      const res = await request.post<{ data: { evaluation: string } }>(`/quote/api/v1/ticket/evaluation`, {
        id: ticketId,
      });
      setData(JSON.parse(res.data.data.evaluation));
    } catch (error) {
      console.error("Failed to fetch audit data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [ticketId]);

  React.useEffect(() => {
    if (open) {
      if (initialData && !data) {
        try {
          setData(JSON.parse(initialData));
        } catch (e) {
          console.error("Failed to parse initial evaluation data:", e);
          fetchAuditData();
        }
      } else if (!data) {
        fetchAuditData();
      }
    }
  }, [open, initialData, data, fetchAuditData]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "#10b981"; // emerald-500
    if (score >= 80) return "#3b82f6"; // blue-500
    if (score >= 70) return "#f59e0b"; // amber-500
    return "#ef4444"; // red-500
  };

  const getStatusColor = (score: number) => {
    if (score >= 80) return "success";
    if (score >= 70) return "warning";
    return "exception";
  };

  const tabItems = data
    ? [
        {
          key: "overview",
          label: (
            <span className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              核心概览
            </span>
          ),
          children: (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 overflow-visible p-8">
              {/* Hero Section: Gauge & Verdict */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="relative flex flex-col items-center justify-center p-8 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden group min-h-[280px]">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50/50 pointer-events-none"></div>

                  <Progress
                    type="dashboard"
                    percent={data.audit_summary.overall_score}
                    gapDegree={120}
                    strokeColor={getScoreColor(data.audit_summary.overall_score)}
                    strokeWidth={8}
                    size={200}
                    format={(percent) => (
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-5xl font-black text-slate-900 leading-none">{percent}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                          Global Score
                        </span>
                      </div>
                    )}
                  />

                  <div className="absolute top-4 left-4">
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">
                        Grade
                      </span>
                      <div
                        className={cn(
                          "h-12 w-12 rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg shadow-indigo-100 border-2 border-white",
                          data.audit_summary.grade === "A"
                            ? "bg-emerald-500 text-white"
                            : data.audit_summary.grade === "B"
                              ? "bg-indigo-500 text-white"
                              : "bg-amber-500 text-white",
                        )}
                      >
                        {data.audit_summary.grade}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="p-6 bg-slate-900 rounded-3xl text-white shadow-xl shadow-slate-200 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                      <Terminal className="w-12 h-12" />
                    </div>
                    <h3 className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                      <div className="h-1 w-1 rounded-full bg-indigo-400 animate-pulse"></div>
                      AI Verdict
                    </h3>
                    <p className="text-sm leading-relaxed font-medium text-slate-200">{data.audit_summary.verdict}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {data.audit_summary.tags.map((tag, idx) => (
                      <Badge
                        key={idx}
                        count={tag}
                        style={{
                          backgroundColor: "#fff",
                          color: "#475569",
                          borderColor: "#e2e8f0",
                          borderRadius: "12px",
                          padding: "0 12px",
                          height: "28px",
                          lineHeight: "28px",
                          fontSize: "11px",
                          fontWeight: "700",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ),
        },
        {
          key: "scores",
          label: (
            <span className="flex items-center gap-2">
              <GaugeIcon className="w-4 h-4" />
              多维评分
            </span>
          ),
          children: (
            <div className="grid gap-4 py-2 p-8">
              {data.dimension_scores.map((dim, idx) => (
                <Card
                  key={idx}
                  bordered={false}
                  className="rounded-3xl shadow-sm group hover:shadow-md transition-all overflow-hidden"
                  bodyStyle={{ padding: "28px" }}
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div
                      className={cn(
                        "h-14 w-14 rounded-2xl shrink-0 flex items-center justify-center transition-colors shadow-sm",
                        dim.score >= 90
                          ? "bg-emerald-50"
                          : dim.score >= 80
                            ? "bg-blue-50"
                            : dim.score >= 70
                              ? "bg-amber-50"
                              : "bg-rose-50",
                      )}
                    >
                      {dim.dimension === "响应时效" && (
                        <Terminal
                          className={cn(
                            "w-6 h-6",
                            dim.score >= 70
                              ? dim.score >= 90
                                ? "text-emerald-600"
                                : "text-blue-600"
                              : "text-rose-600",
                          )}
                        />
                      )}
                      {dim.dimension === "问题解决" && (
                        <CheckCircle
                          className={cn(
                            "w-6 h-6",
                            dim.score >= 70
                              ? dim.score >= 90
                                ? "text-emerald-600"
                                : "text-blue-600"
                              : "text-rose-600",
                          )}
                        />
                      )}
                      {dim.dimension === "客户体验" && (
                        <MessageSquare
                          className={cn(
                            "w-6 h-6",
                            dim.score >= 70
                              ? dim.score >= 90
                                ? "text-emerald-600"
                                : "text-blue-600"
                              : "text-rose-600",
                          )}
                        />
                      )}
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-slate-900 text-base">{dim.dimension}</h4>
                          <p className="text-xs text-slate-500 font-medium">Dimension Analysis</p>
                        </div>
                        <div className="text-right">
                          <span
                            className={cn(
                              "text-2xl font-black",
                              dim.score >= 90
                                ? "text-emerald-600"
                                : dim.score >= 80
                                  ? "text-blue-600"
                                  : dim.score >= 70
                                    ? "text-amber-600"
                                    : "text-rose-600",
                            )}
                          >
                            {dim.score}
                          </span>
                          <span className="text-xs text-slate-400 font-bold ml-1">/ 100</span>
                        </div>
                      </div>
                      <Progress
                        percent={dim.score}
                        showInfo={false}
                        strokeColor={getScoreColor(dim.score)}
                        trailColor="#f8fafc"
                        strokeWidth={8}
                        className="m-0"
                      />
                      <p className="text-sm text-slate-600 leading-relaxed font-medium pt-1 italic">"{dim.comment}"</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ),
        },
        {
          key: "suggestions",
          label: (
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              改进路径
            </span>
          ),
          children: (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2 p-8">
              {data.improvement_suggestions.map((suggestion, idx) => {
                const [title, ...descriptionParts] = suggestion.includes("：")
                  ? suggestion.split("：")
                  : [suggestion, ""];
                const description = descriptionParts.join("：");

                return (
                  <div
                    key={idx}
                    className="group p-6 bg-white rounded-3xl border border-transparent hover:border-indigo-100 hover:shadow-lg transition-all relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-2 opacity-5 scale-150 transform group-hover:rotate-12 transition-transform">
                      <Zap className="w-16 h-16 text-indigo-900" />
                    </div>
                    <div className="flex h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl items-center justify-center font-black text-sm mb-4">
                      {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                    </div>
                    <p className="text-sm text-slate-700 font-bold leading-relaxed mb-1">{title}</p>
                    {description && (
                      <p className="text-[13px] text-slate-500 leading-relaxed font-medium">{description}</p>
                    )}
                  </div>
                );
              })}
            </div>
          ),
        },
        {
          key: "trace",
          label: (
            <span className="flex items-center gap-2">
              <BrainCircuit className="w-4 h-4" />
              推理逻辑
            </span>
          ),
          children: (
            <div className="space-y-8 p-8">
              <div className="flex items-center gap-3 bg-slate-100/50 pr-4 rounded-2xl w-fit">
                <div className="h-8 w-8 bg-slate-900 rounded-xl flex items-center justify-center">
                  <Terminal className="h-4 w-4 text-emerald-400" />
                </div>
                <span className="text-xs font-black text-slate-700 uppercase tracking-widest">
                  Reasoning Logic Chain
                </span>
              </div>

              <div className="grid gap-6">
                <div className="relative pl-8 border-l-2 border-slate-200 space-y-8">
                  <div className="relative">
                    <div className="absolute left-[-41px] top-0 h-8 w-8 rounded-full bg-white border-4 border-indigo-500 shadow-sm flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                        01. Thread Analysis
                      </h4>
                      <div className="grid gap-4 text-sm font-medium text-slate-700 leading-relaxed">
                        <p className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <span className="text-indigo-600 mr-2">●</span>
                          {data.reasoning_trace.thread_analysis.customer_pain_points}
                        </p>
                        <p className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <span className="text-indigo-600 mr-2">●</span>
                          {data.reasoning_trace.thread_analysis.staff_performance}
                        </p>
                        <p className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <span className="text-indigo-600 mr-2">●</span>
                          {data.reasoning_trace.thread_analysis.critical_moments}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute left-[-41px] top-0 h-8 w-8 rounded-full bg-white border-4 border-blue-500 shadow-sm flex items-center justify-center">
                      <ChevronRight className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                        02. Scoring Logic
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
                          <p className="text-[10px] font-bold text-emerald-700 uppercase mb-2">Strengths</p>
                          <ul className="text-xs space-y-2 text-emerald-800">
                            {data.reasoning_trace.scoring_logic.strengths.map((s, i) => (
                              <li key={i} className="flex gap-2">
                                <CheckCircle className="w-3 h-3 shrink-0 mt-0.5" /> {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100/50">
                          <p className="text-[10px] font-bold text-rose-700 uppercase mb-2">Weaknesses</p>
                          <ul className="text-xs space-y-2 text-rose-800">
                            {data.reasoning_trace.scoring_logic.weaknesses.map((w, i) => (
                              <li key={i} className="flex gap-2">
                                <X className="w-3 h-3 shrink-0 mt-0.5" /> {w}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="p-4 bg-slate-900 rounded-2xl text-slate-300 font-mono text-[11px] leading-relaxed">
                        <span className="text-indigo-400"># Deduction Path</span>
                        <br />
                        {data.reasoning_trace.scoring_logic.deduction_path}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ),
        },
        {
          key: "json",
          label: (
            <span className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              数据 JSON
            </span>
          ),
          children: (
            <div className="bg-slate-900 rounded-3xl p-6 overflow-hidden min-h-[400px] m-4">
              <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Raw Response Data</span>
                </div>
                <Badge
                  status="processing"
                  text={<span className="text-[10px] text-slate-500">application/json</span>}
                />
              </div>
              <div className="overflow-auto max-h-[500px] custom-scrollbar">
                <pre className="text-[11px] font-mono text-emerald-400 leading-relaxed">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            </div>
          ),
        },
      ]
    : [];

  return (
    <Drawer
      title={null}
      placement="right"
      width={640}
      onClose={() => onOpenChange(false)}
      open={open}
      bodyStyle={{ padding: 0, backgroundColor: "#f8fafc" }}
      headerStyle={{ display: "none" }}
    >
      <div className="flex flex-col h-full bg-[#f8fafc] relative">
        {/* Premium Header */}
        <div className="relative overflow-hidden bg-white px-8 py-7 border-b border-slate-200 shrink-0">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
            <BrainCircuit className="w-32 h-32 text-indigo-900" />
          </div>

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg shadow-indigo-200">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900 bg-clip-text">工单 AI 智能巡检</h2>
                </div>
                <p className="text-sm text-slate-500 mt-0.5">深度分析服务质量与用户痛点</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="default"
                icon={
                  <RefreshCcw
                    className={cn("w-4 h-4 mr-1 transition-transform duration-700", isLoading && "animate-spin")}
                  />
                }
                onClick={fetchAuditData}
                loading={isLoading}
                className="h-9 px-4 rounded-xl flex items-center font-medium border-slate-200 hover:text-indigo-600 hover:border-indigo-400 transition-all"
              >
                重新生成
              </Button>
              <Button
                type="text"
                icon={<X className="h-5 w-5" />}
                onClick={() => onOpenChange(false)}
                className="h-9 w-9 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden relative flex flex-col">
          {isLoading && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/60 backdrop-blur-md transition-all duration-300">
              <div className="relative mb-8">
                <div className="absolute inset-[-12px] animate-pulse rounded-full bg-indigo-100/50 scale-125"></div>
                <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-xl">
                  <Sparkles className="h-10 w-10 text-indigo-600 animate-bounce" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-bold text-slate-900">正在进行智能分析</h3>
                <div className="flex items-center justify-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce"></span>
                </div>
                <p className="text-sm text-slate-500 pt-2 font-medium">深度洞察多轮对话逻辑...</p>
              </div>
            </div>
          )}

          {data ? (
            <ConfigProvider
              theme={{
                components: {
                  Tabs: {
                    itemSelectedColor: "#4f46e5",
                    itemHoverColor: "#6366f1",
                    itemColor: "#94a3b8",
                    titleFontSize: 14,
                    horizontalItemPadding: "16px 0",
                    horizontalMargin: "0 32px 0 0",
                    inkBarColor: "#4f46e5",
                  },
                },
              }}
            >
              <div className="flex-1 flex flex-col overflow-hidden bg-white">
                <Tabs
                  defaultActiveKey="overview"
                  items={tabItems}
                  className="antd-custom-tabs h-full"
                  tabBarStyle={{ padding: "0 32px", marginBottom: 0, borderBottom: "1px solid #f1f5f9" }}
                  contentHolderStyle={{ flex: 1, overflowY: "auto", padding: "32px", backgroundColor: "#f8fafc" }}
                />
              </div>
            </ConfigProvider>
          ) : !isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center animate-in fade-in duration-700 bg-white">
              <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <Activity className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">暂无评分分析</h3>
              <p className="text-sm max-w-xs mb-6">该工单尚未进行 AI 智能巡检，您可以点击上方按钮开始分析。</p>
              <Button
                type="primary"
                onClick={fetchAuditData}
                size="large"
                className="bg-indigo-600 hover:bg-indigo-700 h-12 px-10 rounded-2xl shadow-lg shadow-indigo-100 font-bold border-none"
              >
                开始巡检
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </Drawer>
  );
}
