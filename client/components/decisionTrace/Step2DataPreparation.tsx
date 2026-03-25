import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, Input, Tag } from "antd";
import {
  Database,
  AlertTriangle,
  CheckCircle2,
  Search,
  AlertCircle,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Loader2,
  RotateCcw,
  XCircle,
  Play,
} from "lucide-react";
import { DecisionTraceState } from "./types";
import { cn } from "@/lib/utils";

import { PromptDebuggerDrawer } from "./PromptDebuggerDrawer";
import { Step2ObjectMappingDrawer } from "./Step2ObjectMappingDrawer";
import { InstanceDetailDrawer } from "./InstanceDetailDrawer";
import { useRefresh } from "./RefreshContext";
import { request } from "@/lib/request";

const { TextArea } = Input;

const EMPTY_OBJECT: Record<string, any> = {};

interface Step2Props {
  state: DecisionTraceState;
  onUpdate: (updates: Partial<DecisionTraceState["dataPreparation"]>) => void;
  onUpdateIntent: (updates: Partial<DecisionTraceState["intentAnalysis"]>) => void;
  onNext: () => void;
  onBack: () => void;
  onTerminate: () => void;
}

export const Step2DataPreparation: React.FC<Step2Props> = ({
  state,
  onUpdate,
  onUpdateIntent,
  onNext,
  onBack,
  onTerminate,
}) => {
  const { refreshEventDetails } = useRefresh(); // 使用刷新hook
  const { dataPreparation, intentAnalysis } = state;
  const { integrityIssues, expertBriefing, supplementaryNotes = EMPTY_OBJECT, sortingResults } = dataPreparation;

  // 1. Goal Data Source (Same as Step 1)
  const goals = intentAnalysis.semanticSummary?.goals || [];

  // 2. Mock Preparation State
  const overallStep = React.useMemo(() => {
    if (dataPreparation.status === "COMPLETED") return "confirming";
    if (dataPreparation.status === "CONFIRMING") return "confirming";
    if (dataPreparation.status === "PREPARING") return "preparing";
    return "not_started";
  }, [dataPreparation.status]);

  const [goalPrepStatus, setGoalPrepStatus] = useState<Record<string, "preparing" | "success" | "failed">>(() => {
    const initial: Record<string, "preparing" | "success" | "failed"> = {};
    const defaultStatus =
      dataPreparation.status === "COMPLETED" || dataPreparation.status === "CONFIRMING" ? "success" : "preparing";
    goals.forEach((g) => (initial[g.goal_id] = defaultStatus));
    return initial;
  });

  const [completedPrepCount, setCompletedPrepCount] = useState(0);

  // Sync internal counts if coming from a completed state
  useEffect(() => {
    if (dataPreparation.status === "COMPLETED" || dataPreparation.status === "CONFIRMING") {
      setCompletedPrepCount(goals.length);
    }
  }, [dataPreparation.status, goals.length]);

  const handleStartPrep = () => {
    const initial: Record<string, "preparing" | "success" | "failed"> = {};
    goals.forEach((g) => (initial[g.goal_id] = "preparing"));
    setGoalPrepStatus(initial);
    setCompletedPrepCount(0);
    onUpdate({ status: "PREPARING", executionTriggered: false });
  };

  // Trigger from Step 1
  useEffect(() => {
    if (state.dataPreparation.executionTriggered && overallStep === "not_started") {
      handleStartPrep();
    }
  }, [state.dataPreparation.executionTriggered, overallStep]);

  // Simulation: Move through goals
  useEffect(() => {
    if (dataPreparation.status !== "PREPARING" || goals.length === 0) return;

    let mounted = true;
    const runSimulation = async () => {
      // Small delay before starting
      await new Promise((resolve) => setTimeout(resolve, 500));

      for (let i = 0; i < goals.length; i++) {
        if (!mounted) return;
        const goal = goals[i];

        // Wait a bit to simulate "calling"
        await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 800));

        if (!mounted) return;
        setGoalPrepStatus((prev) => ({
          ...prev,
          [goal.goal_id]: Math.random() > 0.05 ? "success" : "failed", // 95% success rate for mock
        }));
        setCompletedPrepCount(i + 1);
      }

      if (mounted) {
        onUpdate({ status: "CONFIRMING" });
      }
    };

    runSimulation();
    return () => {
      mounted = false;
    };
  }, [dataPreparation.status, goals.length]);

  const handleRestartPrep = () => {
    handleStartPrep();
  };

  const expertBriefingData = React.useMemo(() => {
    if (!expertBriefing) return null;
    if (typeof expertBriefing !== "string") return expertBriefing;

    const flexibleParse = (str: string): any => {
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
        console.error("[Step2] Failed to parse expertBriefing even after cleaning:", e);
        return null;
      }
    };

    return flexibleParse(expertBriefing);
  }, [expertBriefing]);

  const isNotStarted = overallStep === "not_started";
  const isPreparing = overallStep === "preparing";
  const isTerminated = state.intentAnalysis.stepStatus === "TERMINATED";

  // Final Confirmation Logic
  const handleConfirmReady = () => {
    onUpdate({ status: "COMPLETED" });
    onNext();
  };

  const handleAuditGoal = (goalId: string, status: "ACCEPTED" | "REJECTED") => {
    const currentConfirmed = dataPreparation.confirmedGoalIds || [];
    const currentRejected = dataPreparation.rejectedGoalIds || [];

    if (status === "ACCEPTED") {
      onUpdate({
        confirmedGoalIds: currentConfirmed.includes(goalId)
          ? currentConfirmed.filter((id) => id !== goalId)
          : [...currentConfirmed, goalId],
        rejectedGoalIds: currentRejected.filter((id) => id !== goalId),
      });
    } else {
      onUpdate({
        rejectedGoalIds: currentRejected.includes(goalId)
          ? currentRejected.filter((id) => id !== goalId)
          : [...currentRejected, goalId],
        confirmedGoalIds: currentConfirmed.filter((id) => id !== goalId),
      });
    }
  };

  const isAllHandled = goals.every(
    (g) =>
      dataPreparation.confirmedGoalIds?.includes(g.goal_id) || dataPreparation.rejectedGoalIds?.includes(g.goal_id),
  );

  return (
    <div className="flex flex-col h-full gap-4 relative">
      {/* 1. Sticky Action Bar */}
      <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg sticky top-0 z-10 shadow-sm backdrop-blur-sm bg-opacity-90">
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className={cn(
              "text-sm px-2.5 h-6 font-normal border shadow-sm",
              isPreparing ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-amber-50 text-amber-700 border-amber-200",
            )}
          >
            {isPreparing ? (
              <div className="flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                AI 数据准备中
              </div>
            ) : (
              "数据准备待确认"
            )}
          </Badge>
          {!isPreparing && !isAllHandled && (
            <span className="text-sm text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 flex items-center gap-1 animate-pulse">
              <AlertCircle className="w-3.5 h-3.5" />
              请先完成数据确认
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isPreparing && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRestartPrep}
              className="h-8 text-slate-600 border-slate-200 hover:bg-slate-50 gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              重新执行
            </Button>
          )}

          <Button variant="ghost" size="sm" className="h-8 text-red-500 hover:bg-red-50 gap-1.5" onClick={onTerminate}>
            <XCircle className="w-3.5 h-3.5" />
            终止
          </Button>

          <Step2ObjectMappingDrawer
            expertBriefingData={expertBriefingData}
            sortingResults={dataPreparation.sortingResults}
          />

          <PromptDebuggerDrawer
            title="Data Preparation"
            currentStep={state.currentStep}
            id={state.triggerEvent.id}
            prompts={[
              {
                label: "Data Prep",
                word: dataPreparation.expertBriefingWord || "",
              },
            ]}
          />

          <div className="h-4 w-[1px] bg-slate-200 mx-1"></div>

          <Button
            size="sm"
            onClick={handleConfirmReady}
            disabled={isPreparing || isTerminated || !isAllHandled}
            className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            <Play className="w-3.5 h-3.5" />
            确认并继续
          </Button>
        </div>
      </div>

      {/* 2. Main Content */}
      <div className="flex-1 overflow-auto px-1 pb-6">
        {isNotStarted ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 animate-in fade-in duration-500">
            <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 shadow-sm">
              <Database className="w-10 h-10 text-blue-500" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-slate-800">数据准备就绪</h2>
              <p className="text-sm text-slate-500 max-w-sm">
                意图分析已完成。点击下方按钮开始为 {goals.length} 个目标准备深度分析所需的业务数据。
              </p>
            </div>
            <Button
              size="lg"
              onClick={handleStartPrep}
              className="px-8 gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md rounded-xl h-12 transition-all hover:scale-105"
            >
              <Play className="w-5 h-5" />
              开始数据准备
            </Button>
          </div>
        ) : (
          <>
            {/* 3. Progress Banner (Preparing Step Only) */}
            {isPreparing && (
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6 flex flex-col gap-3 mb-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-start gap-4">
                  <div className="bg-white rounded-full p-2.5 shadow-sm border border-blue-100">
                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-800">正在为 {goals.length} 个目标准备数据...</h3>
                    <p className="text-sm text-blue-600 font-medium">
                      已完成: {completedPrepCount} / {goals.length}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Goal List */}
            <div className="border border-slate-100 rounded-2xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
              {/* Table Header */}
              <div className="flex items-center bg-slate-50/50 border-b border-slate-100 p-3 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <div className="w-10 text-center">#</div>
                <div className="flex-1 px-4">目标描述</div>
                <div className="w-48 text-right px-4">状态操作</div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-slate-100">
                {goals.map((goal, idx) => {
                  const status = goalPrepStatus[goal.goal_id] || "preparing";

                  return (
                    <div
                      key={goal.goal_id}
                      className="flex items-start p-4 hover:bg-slate-50/30 transition-colors group"
                    >
                      {/* Index */}
                      <div className="w-10 flex-shrink-0 flex justify-center pt-2">
                        <div className="w-6 h-6 bg-slate-100 text-slate-500 rounded flex items-center justify-center text-xs font-bold group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                          {idx + 1}
                        </div>
                      </div>

                      {/* Content Area */}
                      <div className="flex-1 px-4 flex items-center gap-3 py-1">
                        <span
                          className={cn(
                            "text-base font-semibold transition-colors w-80",
                            dataPreparation.rejectedGoalIds?.includes(goal.goal_id)
                              ? "text-slate-400"
                              : "text-slate-800",
                          )}
                        >
                          {goal.goal_description}
                        </span>

                        {dataPreparation.confirmedGoalIds?.includes(goal.goal_id) && (
                          <Badge className="bg-green-50 text-green-700 border border-green-200 shadow-sm font-normal py-0.5 px-2 gap-1 h-5">
                            <CheckCircle2 className="w-3 h-3" />
                            已审计
                          </Badge>
                        )}

                        {dataPreparation.rejectedGoalIds?.includes(goal.goal_id) && (
                          <Badge className="bg-slate-100 text-slate-500 border-slate-200 shadow-sm font-normal py-0.5 px-2 gap-1 h-5">
                            <XCircle className="w-3 h-3" />
                            已拒绝
                          </Badge>
                        )}

                        {!dataPreparation.confirmedGoalIds?.includes(goal.goal_id) &&
                          !dataPreparation.rejectedGoalIds?.includes(goal.goal_id) && (
                            <>
                              {status === "success" && (
                                <Badge className="bg-green-50 text-green-700 border border-green-200 shadow-sm font-normal py-0.5 px-2 gap-1 h-5">
                                  <CheckCircle2 className="w-3 h-3" />
                                  准备成功
                                </Badge>
                              )}
                              {status === "failed" && (
                                <Badge className="bg-red-50 text-red-700 border border-red-200 shadow-sm font-normal py-0.5 px-2 gap-1 h-5">
                                  <AlertCircle className="w-3 h-3" />
                                  准备失败
                                </Badge>
                              )}
                              {status === "preparing" && isPreparing && (
                                <Badge className="bg-blue-50 text-blue-600 border border-blue-200 shadow-sm font-normal py-0.5 px-2 gap-1 h-5">
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  准备中
                                </Badge>
                              )}
                            </>
                          )}
                      </div>

                      {/* Actions */}
                      <div className="w-48 flex-shrink-0 flex items-center justify-end gap-2 pt-1 px-2">
                        {!isPreparing && (
                          <>
                            {!dataPreparation.confirmedGoalIds?.includes(goal.goal_id) &&
                              !dataPreparation.rejectedGoalIds?.includes(goal.goal_id) && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleAuditGoal(goal.goal_id, "ACCEPTED")}
                                    className="h-8 border-green-200 text-green-600 hover:bg-green-50 px-2.5 gap-1 shadow-sm font-normal"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    确认
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleAuditGoal(goal.goal_id, "REJECTED")}
                                    className="h-8 text-slate-400 hover:text-red-500 px-2 gap-1 font-normal"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                    拒绝
                                  </Button>
                                </>
                              )}

                            {(dataPreparation.confirmedGoalIds?.includes(goal.goal_id) ||
                              dataPreparation.rejectedGoalIds?.includes(goal.goal_id)) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleAuditGoal(
                                    goal.goal_id,
                                    dataPreparation.confirmedGoalIds?.includes(goal.goal_id) ? "ACCEPTED" : "REJECTED",
                                  )
                                }
                                className="h-8 text-slate-400 hover:text-blue-600 px-2 gap-1 font-normal"
                              >
                                撤销审计
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}

                {goals.length === 0 && (
                  <div className="p-16 text-center text-slate-400 italic text-sm">暂无目标数据</div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
