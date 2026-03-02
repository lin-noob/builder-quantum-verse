import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  BrainCircuit,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  Database,
  Loader2,
  Play,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { DecisionTraceState, GoalReasoning } from "./types";
import { cn } from "@/lib/utils";
import { PromptDebuggerDrawer } from "./PromptDebuggerDrawer";
import { Step3ReasoningDrawer } from "./Step3ReasoningDrawer";
import { getDecisionTraceView, submitDataInference } from "@/services/decisionTraceService";

interface Step3Props {
  state: DecisionTraceState;
  onUpdate: (updates: Partial<DecisionTraceState["reasoning"]>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step3Reasoning: React.FC<Step3Props> = ({ state, onUpdate, onNext, onBack }) => {
  const { reasoning, intentAnalysis, dataPreparation } = state;
  const { status, results = [], inferenceWord, reasoningAudit } = reasoning;
  debugger;
  // Local state for handling "Questionable" input - Removed

  // Collapsible state
  const [expandedGoals, setExpandedGoals] = useState<string[]>([]);

  // Initialize expanded goals (Expand items with warnings or questions by default)
  useEffect(() => {
    const goalsToExpand = results
      .filter(
        (r) =>
          r.status === "QUESTIONABLE" ||
          r.status === "WARNING" ||
          r.status === "RE_REASON_NEEDED" ||
          r.risks.length > 0,
      )
      .map((r) => r.goalId);

    // If no specific attention needed, expand the first one
    if (goalsToExpand.length === 0 && results.length > 0) {
      setExpandedGoals([results[0].goal_id]);
    } else {
      setExpandedGoals((prev) => [...new Set([...prev, ...goalsToExpand])]);
    }
  }, [results.length]); // Run once on load or when result count changes

  const toggleGoalExpand = (goalId: string) => {
    setExpandedGoals((prev) => (prev.includes(goalId) ? prev.filter((id) => id !== goalId) : [...prev, goalId]));
  };

  // Status Config for Top Bar
  const statusConfig = {
    COMPLETED: { label: "推理完成", icon: CheckCircle2, color: "bg-green-50 text-green-700 border-green-200" },
    REASONING: { label: "推理中...", icon: BrainCircuit, color: "bg-blue-50 text-blue-700 border-blue-200" },
    WARNING: { label: "需要人工确认", icon: AlertTriangle, color: "bg-amber-50 text-amber-700 border-amber-200" },
    PENDING: { label: "未执行", icon: Clock, color: "bg-slate-50 text-slate-600 border-slate-200" },
  };
  const currentStatus = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;

  // Calculate Progress
  const enabledGoals = results;
  const acceptedCount = results ? results.filter((r) => r.status === "ACCEPTED").length : 0;
  const progressPercent = enabledGoals.length > 0 ? (acceptedCount / enabledGoals.length) * 100 : 0;

  const handleGoalStatusChange = (goalId: string, newStatus: GoalReasoning["status"], note?: string) => {
    const newResults = results.map((r) => {
      if (r.goalId === goalId) {
        return { ...r, status: newStatus, userNote: note };
      }
      return r;
    });

    // Check global status update
    const anyWarning = newResults.some((r) => r.status === "QUESTIONABLE");
    const allAccepted = newResults.every((r) => r.status === "ACCEPTED");

    onUpdate({
      results: newResults,
      status: anyWarning ? "WARNING" : allAccepted ? "COMPLETED" : "COMPLETED",
    });

    if (newStatus === "RE_REASON_NEEDED") {
      onBack();
    }

    // If accepted, collapse this card
    if (newStatus === "ACCEPTED") {
      setExpandedGoals((prev) => prev.filter((id) => id !== goalId));
    }
  };

  // Auto-execute reasoning only when Step2 data preparation is completed
  useEffect(() => {
    if (status === "NOT_STARTED" && dataPreparation.status === "completed") {
      handleExecute();
    }
  }, [status, dataPreparation.status]); // Watch for both status changes

  const flexibleParse = (str: any): any => {
    if (!str) return null;
    if (typeof str !== "string") return str;

    let current = str.trim();

    // 1. Try iterative parsing (handles multiple layers of stringification)
    for (let i = 0; i < 3; i++) {
      try {
        const parsed = JSON.parse(current);
        if (typeof parsed !== "string") return parsed;
        current = parsed.trim();
      } catch (e) {
        break;
      }
    }

    // 2. If iterative fails, try aggressive cleaning for common AI formatting issues
    try {
      const cleaned = current
        .replace(/\\n/g, "\n")
        .replace(/\/n/g, "\n")
        .replace(/\\"/g, '"')
        .replace(/^"+|"+$/g, "")
        .trim();

      if (!cleaned) return null;
      const finalData = JSON.parse(cleaned);
      return typeof finalData === "string" ? JSON.parse(finalData) : finalData;
    } catch (e) {
      console.error("[Step 3] JSON Cleaning failure:", e);
      return null;
    }
  };

  const handleExecute = async () => {
    onUpdate({ status: "REASONING" });

    try {
      const res = await submitDataInference(
        state.triggerEvent.id,
        JSON.stringify({ results: dataPreparation.sortingResults?.results as any }) || "",
      );
      const viewRes = await getDecisionTraceView(state.triggerEvent.id);
      let dataInferenceWord = "";

      if (viewRes.status === 200 && viewRes.data?.data?.engine) {
        dataInferenceWord = viewRes.data.data.engine.dataInferenceWord || "";
      }
      if (res.status === 200 && res.data?.data) {
        const rawInference = res.data.data.dataInference;
        const parsedInference = flexibleParse(rawInference);
        const perGoalReasoning = parsedInference?.per_goal_reasoning || [];
        const reasoningAudit = parsedInference?.reasoning_audit || null;
        const mappedResults: GoalReasoning[] = perGoalReasoning.map((item: any) => ({
          ...item,
          goalId: item.goal_id,
          summary: item.summary,
          goalDescription: item.goal_description,
          // facts: (item.facts || []).map((f: any) => ({
          //   id: f.fact_id,
          //   text: f.description,
          //   source: f.source_instance_id,
          //   confidence: 1.0,
          // })),
          // inferences: (item.inferences || []).map((inf: any) => ({
          //   id: inf.inference_id,
          //   text: inf.description,
          //   logic: (inf.based_on_facts || []).map((bf: any) => bf.description).join(", "),
          //   confidence: 1.0,
          //   dependentFacts: (inf.based_on_facts || []).map((bf: any) => bf.fact_id),
          // })),
          // risks: (item.risks || []).map((r: any) => ({
          //   id: r.risk_id,
          //   triggerCondition: r.trigger_condition,
          //   impact: `${r.description} ${r.impact}`,
          //   probability: r.probability,
          // })),
          // assumptions: (item.assumptions || []).map((a: any) => `${a.description} (原因: ${a.reason})`),
          status: "PENDING",
        }));

        onUpdate({
          status: "COMPLETED",
          results: mappedResults,
          inferenceWord: dataInferenceWord,
          reasoningAudit: reasoningAudit,
          executedAt: new Date().toISOString(),
        });
        // Auto expand first goal with issues or just first goal
        const firstGoalId = intentAnalysis.goals.find((g) => g.isEnabled)?.id;
        if (firstGoalId) setExpandedGoals([firstGoalId]);
      } else {
        // Fallback for unexpected response format
        onUpdate({
          status: "COMPLETED",
          inferenceWord: dataInferenceWord,
          executedAt: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.error("Failed to fetch inference in Step 3:", e);
      // Even if it fails, maybe we show completed state with what we have or show error
      onUpdate({ status: "COMPLETED" });
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* 1. Sticky Top Navigation & Status Bar */}
      <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg sticky top-0 z-10 shadow-sm backdrop-blur-sm bg-opacity-90">
        {/* Left Side: Status Info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-2 rounded-full border bg-white",
                currentStatus.color.replace("bg-", "border-").replace("text-", "bg-"),
              )}
            >
              <currentStatus.icon className={cn("w-5 h-5", status === "REASONING" && "animate-spin")} />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-medium text-slate-900">{currentStatus.label}</span>
              {/* {status === "COMPLETED" && (
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <span className="text-sm text-slate-500">
                    {acceptedCount} / {enabledGoals.length} 已接受
                  </span>
                </div>
              )} */}
            </div>
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-2">
          <div className="h-4 w-[1px] bg-slate-300 mx-1"></div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-slate-600 hover:text-slate-700 hover:bg-slate-100 gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> 返回数据准备
          </Button>
          {/* Prompt Debugger Drawer - Placed consistently as Step 2 (right of button) */}
          <PromptDebuggerDrawer
            currentStep={state.currentStep}
            id={state.triggerEvent.id}
            title="Reasoning Analysis"
            prompt={inferenceWord || ""}
          />
          {/* Reasoning Trace Drawer - Show reasoning audit data */}
          <Step3ReasoningDrawer title="推理追踪" reasoningAudit={reasoningAudit} />
          <div className="h-4 w-[1px] bg-slate-300 mx-1"></div>
          {status === "NOT_STARTED" || status === "REASONING" ? (
            <Button
              size="sm"
              disabled
              className={cn("gap-1.5 shadow-sm min-w-[140px]", "bg-blue-600/80 text-white cursor-not-allowed")}
            >
              <Loader2 className="w-4 h-4 animate-spin" /> AI 思考中...
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={onNext}
              className={cn(
                "gap-1.5 shadow-sm min-w-[140px]",
                status !== "COMPLETED" && status !== "WARNING"
                  ? "bg-slate-100 text-slate-400 border-slate-200"
                  : "bg-purple-600 hover:bg-purple-700 text-white",
              )}
              disabled={status !== "COMPLETED" && status !== "WARNING"}
            >
              <Play className="w-4 h-4" />
              下一步: 专家建议
            </Button>
          )}
        </div>
      </div>

      {/* 2. Main Content Area */}
      {status === "NOT_STARTED" || status === "REASONING" ? (
        <div className="flex flex-col items-center justify-center h-[400px] text-slate-400 gap-6 border border-dashed border-slate-200 rounded-lg bg-slate-50/50 mx-1">
          <div className="relative">
            <div
              className={cn(
                "p-6 bg-white rounded-full shadow-sm border border-slate-100",
                status === "REASONING" && "animate-pulse",
              )}
            >
              <BrainCircuit className={cn("w-16 h-16", status === "REASONING" ? "text-blue-500" : "text-slate-300")} />
            </div>
            {status === "REASONING" && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full animate-ping" />
            )}
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-medium text-slate-700">
              {status === "REASONING" ? "AI 正在分析业务规则与数据..." : "数据准备就绪，等待分析"}
            </h3>
            <p className="text-base text-slate-500 max-w-md">正在验证业务规则、生成建议方案并评估潜在风险。</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3 pb-8">
          {enabledGoals.map((goal, index) => {
            const result = goal;
            const candidates = dataPreparation.candidates.filter((c) => c.goalId === goal.goal_id && c.isSelected);
            const isExpanded = expandedGoals.includes(goal.goal_id);

            // If no result yet, we'll show a "Pending Analysis" state
            // if (!result) return null;

            // Summary stats
            const factCount = result?.facts?.length || 0;
            const infCount = result?.inferences?.length || 0;
            const riskCount = result?.risks?.length || 0;
            return (
              <div
                key={index}
                className={cn(
                  "border rounded-lg transition-all duration-200 bg-white",
                  isExpanded
                    ? "shadow-md ring-1 ring-slate-200 border-slate-300"
                    : "shadow-sm border-slate-200 hover:border-slate-300",
                )}
              >
                {/* Collapsible Header */}
                <div
                  className={cn(
                    "flex items-center gap-3 p-3 cursor-pointer select-none",
                    isExpanded
                      ? "bg-slate-50/80 border-b border-slate-100 rounded-t-lg"
                      : "hover:bg-slate-50 rounded-lg",
                  )}
                  onClick={() => toggleGoalExpand(goal.goal_id)}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center w-6 h-6 rounded-full text-sm font-bold transition-colors",
                    )}
                  >
                    {index + 1}
                  </div>

                  <div className="flex-1 min-w-0 grid grid-cols-[1fr_auto] gap-4 items-center">
                    <div className="flex items-center gap-2 min-w-0">
                      <h3
                        className="text-base font-semibold text-slate-800 truncate"
                        title={result?.goal_description || ""}
                      >
                        目标: {result?.goal_description || ""}
                      </h3>
                      {!isExpanded && (
                        <div className="flex items-center gap-2 text-sm text-slate-400 ml-2">
                          {riskCount > 0 && (
                            <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                              <AlertTriangle className="w-3 h-3" /> {riskCount} 风险
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> {factCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <BrainCircuit className="w-3 h-3" /> {infCount}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {result.status === "ACCEPTED" && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1 h-6">
                          <CheckCircle2 className="w-3 h-3" /> 已接受
                        </Badge>
                      )}
                      {result.status === "QUESTIONABLE" && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1 h-6">
                          <HelpCircle className="w-3 h-3" /> 待确认
                        </Badge>
                      )}

                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Collapsible Content */}
                {isExpanded && !result && (
                  <div className="p-12 text-center text-slate-400 bg-slate-50/50 rounded-b-lg border-t border-slate-100 italic">
                    <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin opacity-20" />
                    正在加载推理结果...
                  </div>
                )}

                {isExpanded && result && (
                  <div className="animate-in slide-in-from-top-2 duration-200">
                    {/* 1. Summary Header (Conclusion) */}
                    <div className="px-4 py-3 border-b border-slate-100 bg-emerald-50/20">
                      <div className="flex items-center gap-3 px-3 py-2 bg-emerald-50/50 border border-emerald-100 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        <span className="text-sm font-medium text-emerald-900 leading-tight">{result.summary}</span>
                      </div>
                    </div>

                    {/* 2x2 Reasoning Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 border-b border-slate-100">
                      {/* Quadrant 1: FACTS */}
                      <div className="p-4 space-y-3">
                        <h4 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                          <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-600">
                            1
                          </span>
                          <Database className="w-3.5 h-3.5" /> 事实认定 (FACTS)
                        </h4>
                        <div className="space-y-3 bg-slate-50/50 p-3 rounded-lg border border-slate-100/50">
                          {result.facts.length > 0 ? (
                            result.facts.map((fact) => (
                              <div key={fact.fact_id} className="pl-3 border-l-2 border-emerald-400 py-0.5">
                                <div className="text-sm tracking-tight text-slate-800 leading-snug">
                                  {fact.description}
                                </div>
                                {fact.source_instance_id && (
                                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
                                    <Database className="w-3 h-3" /> Source ID: {fact.source_instance_id}
                                  </div>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="text-sm text-slate-400 italic py-2">无确凿事实</div>
                          )}
                        </div>
                      </div>

                      {/* Quadrant 2: INFERENCES */}
                      <div className="p-4 space-y-3 bg-blue-50/10">
                        <h4 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                          <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[10px] text-blue-600">
                            2
                          </span>
                          <BrainCircuit className="w-3.5 h-3.5" /> 逻辑推断 (INFERENCES)
                        </h4>
                        <div className="space-y-3 bg-white p-3 rounded-lg border border-blue-100/50 shadow-sm">
                          {result.inferences.length > 0 ? (
                            result.inferences.map((inf) => (
                              <div key={inf.inference_id} className="flex gap-2">
                                <span className="text-blue-400 mt-0.5 tracking-tighter">→</span>
                                <div className="space-y-1">
                                  <div className="text-sm text-blue-900 leading-normal">{inf.description}</div>
                                  <div className="flex flex-wrap items-center gap-1">
                                    <span className="text-[10px] text-slate-400 font-medium px-1 underline decoration-blue-200 decoration-2">
                                      基于事实:
                                    </span>
                                    {(inf.based_on_facts || []).map((fid) => (
                                      <span
                                        key={fid.fact_id}
                                        className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0 rounded-full border border-blue-100"
                                      >
                                        {fid.fact_id}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-sm text-slate-400 italic py-2">无逻辑衍生</div>
                          )}
                        </div>
                      </div>

                      {/* Quadrant 3: RISKS */}
                      <div className="p-4 space-y-3 bg-amber-50/10">
                        <h4 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                          <span className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-[10px] text-amber-600">
                            3
                          </span>
                          <AlertTriangle className="w-3.5 h-3.5" /> 潜在风险 (RISKS)
                        </h4>
                        <div className="space-y-2">
                          {result.risks.length > 0 ? (
                            result.risks.map((risk) => (
                              <div
                                key={risk.risk_id}
                                className="flex gap-2 bg-white p-2 rounded border border-amber-100/50"
                              >
                                <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                <div className="text-sm text-amber-900 leading-tight">
                                  {risk.triggerCondition}: {risk.impact}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-sm text-slate-400 py-1 pl-1">无识别风险</div>
                          )}
                        </div>
                      </div>

                      {/* Quadrant 4: ASSUMPTIONS */}
                      <div className="p-4 space-y-3 bg-purple-50/10">
                        <h4 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                          <span className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center text-[10px] text-purple-600">
                            4
                          </span>
                          <HelpCircle className="w-3.5 h-3.5" /> 基本假设 (ASSUMPTIONS)
                        </h4>
                        <div className="space-y-2">
                          {result?.assumptions?.length > 0 ? (
                            result.assumptions.map((u, i) => (
                              <div key={i} className="flex gap-2 text-sm text-slate-500 items-start">
                                <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                <span>{u}</span>
                              </div>
                            ))
                          ) : (
                            <div className="text-sm text-slate-400 py-1 pl-1">无前提假设</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Footer */}
                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        {result.status === "QUESTIONABLE" && (
                          <span className="text-amber-700 flex items-center gap-1">
                            <HelpCircle className="w-3 h-3" /> 已标记疑问: {result.userNote}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
