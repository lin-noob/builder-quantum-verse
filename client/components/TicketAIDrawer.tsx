import React from "react";
import { Sparkles, RefreshCcw, X, Info } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { request } from "@/lib/request";

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
      // Use businessGet to automatically handle code 200 check and data unwrapping
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full p-0 sm:max-w-2xl border-l-0">
        <div className="flex flex-col h-full bg-white">
          {/* Header */}
          <div className="flex items-start justify-between p-6 pb-4 border-b border-gray-100">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 rounded-md">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">工单级 AI 评分与建议</h2>
              </div>
              <p className="text-sm text-gray-500 max-w-md">
                基于整个工单多轮对话生成。点击“重新生成”可模拟不同模型输出。
              </p>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2 text-gray-600"
                onClick={fetchAuditData}
                disabled={isLoading}
              >
                <RefreshCcw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                重新生成
              </Button>
              <SheetClose asChild>
                <Button variant="outline" size="sm" className="h-9 text-gray-600">
                  关闭
                </Button>
              </SheetClose>
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden relative">
            {isLoading ? (
              <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
                <div className="relative">
                  <div className="absolute inset-0 animate-ping rounded-full bg-blue-100 opacity-75"></div>
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                    <Sparkles className="h-8 w-8 animate-pulse text-blue-600" />
                  </div>
                </div>
                <div className="mt-6 flex flex-col items-center gap-2">
                  <p className="text-base font-semibold text-gray-900">正在分析工单内容...</p>
                  <p className="text-sm text-gray-500">基于多轮对话深度挖掘用户意图与员工表现</p>
                </div>
              </div>
            ) : null}

            {data ? (
              <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
                <div className="px-6 py-2 bg-gray-50/50 border-b border-gray-100">
                  <TabsList className="bg-transparent border-none flex w-full justify-start gap-4 h-auto p-0">
                    {["overview", "scores", "suggestions", "trace", "json"].map((tab) => (
                      <TabsTrigger
                        key={tab}
                        value={tab}
                        className={cn(
                          "rounded-none border-b-2 border-transparent px-2 py-3 text-sm font-medium text-gray-500 transition-none",
                          "data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none",
                        )}
                      >
                        {tab === "overview" && "概览"}
                        {tab === "scores" && "维度得分"}
                        {tab === "suggestions" && "改进建议"}
                        {tab === "trace" && "推理链路"}
                        {tab === "json" && "JSON"}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  <TabsContent value="overview" className="mt-0 space-y-6">
                    <Card className="border-gray-200 shadow-none overflow-hidden">
                      <div className="bg-gray-50/30 px-5 py-4 border-b border-gray-100">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Audit Summary</h3>
                      </div>
                      <CardContent className="p-5 space-y-5">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "flex items-center justify-center w-12 h-8 rounded-md text-sm font-bold",
                              data.audit_summary.overall_score >= 80
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                : data.audit_summary.overall_score >= 70
                                  ? "bg-amber-50 text-amber-600 border border-amber-100"
                                  : "bg-rose-50 text-rose-600 border border-rose-100",
                            )}
                          >
                            {data.audit_summary.overall_score}
                          </div>
                          <Badge
                            variant="outline"
                            className="h-8 w-fit px-3 text-sm border-gray-200 text-gray-600 font-medium bg-white"
                          >
                            {data.audit_summary.grade}
                          </Badge>
                          <div className="flex flex-wrap gap-2">
                            {data.audit_summary.tags.map((tag, idx) => (
                              <Badge
                                key={idx}
                                variant="secondary"
                                className="h-8 px-3 bg-gray-50 text-gray-500 font-normal border-none"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-4 bg-gray-50/80 rounded-lg">
                          <Info className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                          <div className="text-sm text-gray-700 leading-relaxed">
                            <span className="font-bold text-gray-900 mr-1">存在风险:</span>
                            {data.audit_summary.verdict}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="scores" className="mt-0 space-y-4">
                    {data.dimension_scores.map((dim, idx) => (
                      <Card key={idx} className="border-gray-200 shadow-none">
                        <CardContent className="p-5">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-bold text-gray-900">{dim.dimension}</h4>
                            <span
                              className={cn(
                                "text-lg font-bold",
                                dim.score >= 90
                                  ? "text-emerald-600"
                                  : dim.score >= 80
                                    ? "text-blue-600"
                                    : dim.score >= 60
                                      ? "text-amber-600"
                                      : "text-rose-600",
                              )}
                            >
                              {dim.score}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">{dim.comment}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="suggestions" className="mt-0">
                    <Card className="border-gray-200 shadow-none">
                      <CardContent className="p-5 space-y-4">
                        {data.improvement_suggestions.map((suggestion, idx) => (
                          <div key={idx} className="flex gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                              {idx + 1}
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed pt-0.5">{suggestion}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="trace" className="mt-0 space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                        会话过程分析 Thread Analysis
                      </h3>
                      <div className="grid gap-4 bg-gray-50/50 p-5 rounded-xl border border-gray-100">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            客户痛点 Customer Pain Points
                          </p>
                          <p className="text-sm text-gray-700">
                            {data.reasoning_trace.thread_analysis.customer_pain_points}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            员工表现 Staff Performance
                          </p>
                          <p className="text-sm text-gray-700">
                            {data.reasoning_trace.thread_analysis.staff_performance}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            关键时刻 Critical Moments
                          </p>
                          <p className="text-sm text-gray-700">
                            {data.reasoning_trace.thread_analysis.critical_moments}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                        评分逻辑 Scoring Logic
                      </h3>
                      <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-100/50">
                            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">
                              Strengths
                            </p>
                            <ul className="text-sm text-emerald-800 space-y-1 list-disc list-inside">
                              {data.reasoning_trace.scoring_logic.strengths.map((s, i) => (
                                <li key={i}>{s}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="bg-rose-50/50 p-4 rounded-lg border border-rose-100/50">
                            <p className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-2">Weaknesses</p>
                            <ul className="text-sm text-rose-800 space-y-1 list-disc list-inside">
                              {data.reasoning_trace.scoring_logic.weaknesses.map((w, i) => (
                                <li key={i}>{w}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="bg-gray-50/50 p-4 rounded-lg border border-gray-100">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                            Deduction Path
                          </p>
                          <p className="text-sm text-gray-700">{data.reasoning_trace.scoring_logic.deduction_path}</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="json" className="mt-0 h-full">
                    <div className="bg-[#1e1e1e] p-6 rounded-xl overflow-x-auto">
                      <pre className="text-emerald-400 text-xs leading-relaxed font-mono">
                        {JSON.stringify(data, null, 2)}
                      </pre>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            ) : !isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                <p>暂无评分数据</p>
                <Button variant="link" onClick={fetchAuditData} className="mt-2 text-blue-600">
                  重试
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
