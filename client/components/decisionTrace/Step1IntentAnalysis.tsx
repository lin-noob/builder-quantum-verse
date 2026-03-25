import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "antd";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, AlertTriangle, Play, XCircle, HelpCircle, RotateCcw, Loader2 } from "lucide-react";
import { DecisionTraceState, DecisionGoal } from "./types";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PromptDebuggerDrawer } from "./PromptDebuggerDrawer";
import { Step1IntentTraceDrawer } from "./Step1IntentTraceDrawer";
import { getDecisionTraceView, submitDataPreparation } from "@/services/decisionTraceService";

interface Step1Props {
  state: DecisionTraceState;
  onUpdate: (updates: Partial<DecisionTraceState["intentAnalysis"]>) => void;
  onUpdateData: (updates: Partial<DecisionTraceState["dataPreparation"]>) => void;
  onNext: () => void;
  onTerminate: () => void;
  onRestart: () => void;
}

export const Step1IntentAnalysis: React.FC<Step1Props> = ({ state, onUpdate, onNext, onTerminate, onRestart }) => {
  const { intentAnalysis, childStatus } = state;
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isTerminated = childStatus === 8 || intentAnalysis.stepStatus === "TERMINATED";

  const handleRestartFlow = () => {
    onUpdate({
      childStatus: 2,
      stepStatus: "AI_ANALYZED",
    } as any);

    // Simulate AI Analysis transition from 2 to 3
    setTimeout(() => {
      onUpdate({
        childStatus: 3,
      } as any);
    }, 3000);
  };

  const confidence = intentAnalysis.confidence ?? 0.8;
  let confidenceLabel = "中";
  let confidenceClassName = "text-amber-600";
  if (confidence >= 0.8) {
    confidenceLabel = "高";
    confidenceClassName = "text-green-600";
  } else if (confidence < 0.5) {
    confidenceLabel = "低";
    confidenceClassName = "text-red-600";
  }

  // Status Configuration for Header Badge
  const getHeaderStatus = () => {
    if (childStatus === 8)
      return { label: "已终止", className: "bg-red-50 text-red-600 border-red-200", icon: XCircle };
    if (childStatus === 2)
      return {
        label: "AI 意图分析中",
        className: "bg-blue-50 text-blue-600 border-blue-200 animate-pulse",
        icon: Loader2,
      };
    if (childStatus === 3)
      return { label: "意图分析待确认", className: "bg-amber-50 text-amber-600 border-amber-200", icon: AlertTriangle };

    // Fallback to legacy stepStatus mapping if needed
    const legacyMap = {
      AI_ANALYZED: { label: "AI 已分析", className: "bg-blue-50 text-blue-700 border-blue-200", icon: AlertCircle },
      HUMAN_MODIFIED: {
        label: "人工已修改",
        className: "bg-amber-50 text-amber-700 border-amber-200",
        icon: AlertTriangle,
      },
      TERMINATED: { label: "已终止", className: "bg-slate-100 text-slate-500 border-slate-300", icon: XCircle },
      CONFIRMED: { label: "已确认", className: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle2 },
    };
    return legacyMap[intentAnalysis.stepStatus || "AI_ANALYZED"];
  };

  const currentStatus = getHeaderStatus();

  // Validation for "Next"
  const allGoals = intentAnalysis.semanticSummary?.goals || [];
  const handledGoalsCount = allGoals.filter((g) => g.goal_status !== "PENDING").length;
  const acceptedGoalsCount = allGoals.filter((g) => g.goal_status === "ACCEPTED").length;
  const canProceed = allGoals.length > 0 && handledGoalsCount === allGoals.length && acceptedGoalsCount > 0;

  // Helper to mark state as modified
  const markAsModified = (updates: Partial<DecisionTraceState["intentAnalysis"]>) => {
    if (isTerminated) return;
    onUpdate({
      ...updates,
      isModified: true,
      stepStatus: "HUMAN_MODIFIED",
    });
  };

  const handleGoalChange = (id: string, field: string, value: any) => {
    if (isTerminated) return;

    // Update legacy goals
    const newLegacyGoals = intentAnalysis.goals.map((g) => {
      if (g.id !== id) return g;
      const updated: DecisionGoal = { ...g, [field]: value };
      if (field === "description" && (g.initialSuggestion || g.suggestedNextStep)) {
        updated.isSuggestionStale = true;
      }
      return updated;
    });

    // Update semanticSummary goals
    const newSemanticGoals = (intentAnalysis.semanticSummary?.goals || []).map((g) => {
      if (g.goal_id !== id) return g;
      if (field === "description") {
        return { ...g, goal_description: value };
      }
      if (field === "goal_status") {
        return { ...g, goal_status: value };
      }
      return g;
    });

    onUpdate({
      goals: newLegacyGoals,
      semanticSummary: {
        ...intentAnalysis.semanticSummary!,
        goals: newSemanticGoals,
      },
      isModified: true,
      stepStatus: "HUMAN_MODIFIED",
    });
  };

  const handleRestart = () => {
    onUpdate({
      stepStatus: "AI_ANALYZED",
      status: "pending",
      isModified: false,
    });
    onRestart();
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    onUpdate({
      stepStatus: "CONFIRMED",
      status: "completed",
    });

    try {
      // 1. Transform state to semanticSummary structure
      const semanticSummary = {
        core_intent: {
          summary: intentAnalysis.coreIntent,
          confidence: intentAnalysis.confidence || 0.8,
        },
        goals: intentAnalysis.goals.map((g) => ({
          goal_id: g.id,
          goal_description: g.description,
          goal_status: g.goal_status,
          recommendation: {
            strategy: g.initialSuggestion || "",
            suggested_next_step: g.suggestedNextStep || "",
          },
        })),
      };

      // 2. Submit analysis with POST request
      const data = await submitDataPreparation(state.triggerEvent.id, JSON.stringify(semanticSummary));

      let expertBriefingWord = "";
      let sortingEngineWord = "";
      try {
        const viewRes = await getDecisionTraceView(state.triggerEvent.id);
        if (viewRes.status === 200 && viewRes.data?.data?.engine) {
          expertBriefingWord = viewRes.data.data.engine.expertBriefingWord || "";
          sortingEngineWord = viewRes.data.data.engine.sortingEngineWord || "";
        }
      } catch (e) {
        console.error("Failed to fetch prompts after analysis:", e);
      }
      setTimeout(() => onNext(), 0);
    } catch (error) {
      onNext();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoalStatusChange = (goalId: string, newStatus: any) => {
    handleGoalChange(goalId, "goal_status", newStatus);
  };

  const goals = intentAnalysis.semanticSummary?.goals || [];

  // Render Logic
  if (childStatus === 8) {
    return (
      <div className="flex flex-col h-full gap-4">
        {/* Header - Still show for context */}
        <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-sm uppercase tracking-wider font-bold text-slate-400">核心意图</span>
            <Badge variant="outline" className={cn("text-sm px-1.5 h-5 font-normal border", currentStatus.className)}>
              <currentStatus.icon className={cn("w-3 h-3 mr-1", (childStatus as number) === 2 && "animate-spin")} />
              {currentStatus.label}
            </Badge>
          </div>
        </div>

        {/* Terminated Content (Mockup 1) */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          <div className="w-16 h-16 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center mb-6">
            <XCircle className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">流程已终止</h2>
          <p className="text-slate-500 mb-8 max-w-md text-center">流程已被手动终止。如需继续，请重新启动流程。</p>
          <Button
            className="h-11 px-8 gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-200"
            onClick={handleRestartFlow}
          >
            <RotateCcw className="w-4 h-4" />
            重启流程
          </Button>
        </div>
      </div>
    );
  }

  if (childStatus === 1) {
    return (
      <div className="flex flex-col h-full gap-4">
        {/* Header */}
        <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-sm uppercase tracking-wider font-bold text-slate-400">核心意图</span>
            <Badge variant="outline" className={cn("text-sm px-1.5 h-5 font-normal border", currentStatus.className)}>
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              {currentStatus.label}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Step1IntentTraceDrawer reasoningTrace={state.intentAnalysis.semanticSummary?.reasoning_trace ?? null} />
            <PromptDebuggerDrawer
              title="Intent Analysis"
              currentStep={state.currentStep}
              id={state.triggerEvent.id}
              prompt={
                state.dataPreparation.semanticSummaryWord ||
                `Based on the user trigger event: "${state.triggerEvent.content.slice(0, 100)}...", break down the core intent and specific actionable goals.`
              }
            />
            <div className="h-4 w-[1px] bg-slate-300 mx-1"></div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-red-500 hover:bg-red-50 gap-1.5"
              onClick={onTerminate}
            >
              <XCircle className="w-4 h-4" />
              终止
            </Button>
          </div>
        </div>

        {/* Analyzing Content (Mockup 2) */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-white shadow-sm overflow-hidden relative">
          <div className="w-16 h-16 rounded-full bg-blue-50/50 flex items-center justify-center mb-6 relative">
            <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">AI 正在分析意图...</h2>
          <p className="text-slate-500 max-w-md text-center">正在深入分析邮件内容，识别核心诉求并拆解执行目标。</p>

          {/* Bottom Decoration Lines */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-20"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-4 relative">
      {/* 1. Sticky Top Action Bar (Compact) */}
      <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg sticky top-0 z-10 shadow-sm backdrop-blur-sm bg-opacity-90">
        {/* Left: Core Intent Input (Integrated) */}
        <div className="flex items-center gap-3 flex-1 mr-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm uppercase tracking-wider font-bold text-slate-400">核心意图</span>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={cn("text-sm px-1.5 h-5 font-normal border", currentStatus.className)}>
                {currentStatus.label}
              </Badge>
              {intentAnalysis.isModified &&
                intentAnalysis.stepStatus !== "CONFIRMED" &&
                intentAnalysis.stepStatus !== "TERMINATED" && (
                  <span className="text-sm text-amber-600 bg-amber-50 px-1 rounded">需确认</span>
                )}
            </div>
            <span className="text-xs text-slate-500">
              AI 信心：
              <span className={cn("ml-1 font-medium", confidenceClassName)}>{confidenceLabel}</span>
            </span>
          </div>

          <div className="flex-1 relative max-w-xl">
            <Input
              value={intentAnalysis.coreIntent}
              onChange={(e) => markAsModified({ coreIntent: e.target.value })}
              disabled={isTerminated}
              className={cn(
                "h-9 text-base font-medium",
                isTerminated
                  ? "border-slate-200 bg-slate-50 text-slate-500"
                  : "border-slate-300 focus-visible:ring-blue-500",
              )}
              placeholder="请输入核心意图..."
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-400 hover:text-blue-600 focus-visible:ring-0 focus-visible:ring-offset-0"
                title="推进规则说明"
              >
                <HelpCircle className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              align="end"
              className="z-[100] max-w-xs text-sm p-3 space-y-1 bg-white border-slate-200 shadow-xl"
            >
              <p className="font-bold text-slate-900">推进规则说明：</p>
              <ul className="list-disc pl-3 space-y-0.5 text-slate-600">
                <li>
                  若无任何目标被启用，<span className="text-red-500 font-medium">禁止进入步骤 2</span>。
                </li>
                <li>若您修改过目标或意图，系统将记录为「人工干预」状态。</li>
              </ul>
            </TooltipContent>
          </Tooltip>

          {childStatus === 3 && (
            <div className="flex items-center gap-3 mr-2">
              <Badge
                variant="outline"
                className="text-sm px-2.5 h-6 font-normal border shadow-sm bg-amber-50 text-amber-700 border-amber-200"
              >
                <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                意图分析待确认
              </Badge>
              {!canProceed && (
                <span className="text-sm text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 flex items-center gap-1 animate-pulse">
                  <AlertCircle className="w-3.5 h-3.5" />
                  请先完成目标确认
                </span>
              )}
            </div>
          )}

          {isTerminated && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-slate-700 border-slate-300 hover:bg-slate-50"
              onClick={handleRestartFlow}
            >
              <RotateCcw className="w-4 h-4" />
              重启
            </Button>
          )}

          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRestartFlow}
              className="h-8 text-slate-600 border-slate-200 hover:bg-slate-50 gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              重新执行
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-red-500 hover:bg-red-50 gap-1.5"
              onClick={onTerminate}
            >
              <XCircle className="w-4 h-4" />
              终止
            </Button>
          </>

          {/* Intent Trace Drawer */}
          <Step1IntentTraceDrawer reasoningTrace={state.intentAnalysis.semanticSummary?.reasoning_trace ?? null} />

          {/* Prompt Debugger Drawer */}
          <PromptDebuggerDrawer
            title="Intent Analysis"
            currentStep={state.currentStep}
            id={state.triggerEvent.id}
            prompt={
              state.dataPreparation.semanticSummaryWord ||
              `Based on the user trigger event: "${state.triggerEvent.content.slice(0, 100)}...", break down the core intent and specific actionable goals.`
            }
          />

          <div className="h-4 w-[1px] bg-slate-300 mx-1"></div>
          <Button
            size="sm"
            className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            onClick={handleConfirm}
            disabled={!canProceed || isTerminated || isSubmitting}
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            确认并继续
          </Button>
        </div>
      </div>

      {/* 2. Goal List Refactored */}
      <div className="space-y-4 pb-20">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-base font-semibold text-slate-800">目标拆解清单</h3>
        </div>

        <div className="border rounded-xl bg-white overflow-hidden shadow-sm">
          {goals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 opacity-40" />
              </div>
              <p className="text-base font-medium text-slate-500">{isSubmitting ? "正在解析意图..." : "AI分析中..."}</p>
            </div>
          ) : (
            <div className="w-full">
              {/* Header */}
              <div className="flex items-center bg-slate-50/50 border-b border-slate-100 p-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <div className="w-10 text-center">#</div>
                <div className="flex-1 px-4">目标描述</div>
                <div className="w-32 text-right">状态操作</div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-slate-100">
                {goals.map((goal, idx) => {
                  const isRejected = goal.goal_status === "REJECTED";
                  const isAccepted = goal.goal_status === "ACCEPTED";
                  const isPending = !isRejected && !isAccepted;

                  return (
                    <div
                      key={goal.goal_id}
                      className={cn(
                        "flex items-start p-4 transition-colors",
                        isRejected ? "bg-slate-50/50 grayscale opacity-60" : "hover:bg-blue-50/10",
                      )}
                    >
                      {/* Index */}
                      <div className="w-10 flex-shrink-0 flex justify-center pt-2">
                        <div
                          className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                            isAccepted
                              ? "bg-green-100 text-green-600"
                              : isRejected
                                ? "bg-slate-200 text-slate-400"
                                : "bg-blue-100 text-blue-600",
                          )}
                        >
                          {idx + 1}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 px-4 space-y-3">
                        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
                          <Input
                            className="p-0 border-none shadow-none text-base font-medium text-slate-800 disabled:bg-transparent disabled:text-slate-500 focus:shadow-none focus:border-none"
                            value={goal.goal_description}
                            disabled={isRejected || isTerminated}
                            onChange={(e) => handleGoalChange(goal.goal_id, "description", e.target.value)}
                          />
                        </div>

                        {goal.recommendation && (
                          <div className="pl-1 space-y-1">
                            <div className="flex items-start gap-2">
                              <span className="text-sm font-bold text-indigo-500 whitespace-nowrap">AI 建议:</span>
                              <span className="text-sm text-slate-600">{goal.recommendation.strategy}</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-xs text-slate-400 whitespace-nowrap">下一步方向:</span>
                              <span className="text-xs text-slate-500">{goal.recommendation.suggested_next_step}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="w-48 flex-shrink-0 flex items-center justify-end gap-2 pt-1 text-sm">
                        {isPending && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700 px-3 gap-1"
                              onClick={() => handleGoalStatusChange(goal.goal_id, "ACCEPTED")}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              确认
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-slate-400 hover:text-red-500 px-2 gap-1"
                              onClick={() => handleGoalStatusChange(goal.goal_id, "REJECTED")}
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              拒绝
                            </Button>
                          </>
                        )}

                        {isAccepted && (
                          <>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              已确认
                            </div>
                            <button
                              className="text-slate-400 hover:text-blue-600 ml-1"
                              onClick={() => handleGoalStatusChange(goal.goal_id, "PENDING")}
                            >
                              撤销
                            </button>
                          </>
                        )}

                        {isRejected && (
                          <button
                            className="text-slate-400 hover:text-blue-600"
                            onClick={() => handleGoalStatusChange(goal.goal_id, "PENDING")}
                          >
                            撤销拒绝
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
