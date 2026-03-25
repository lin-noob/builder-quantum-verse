import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { BrainCircuit, CheckCircle2, AlertCircle, Loader2, Play, RotateCcw, XCircle } from "lucide-react";
import { DecisionTraceState, GoalReasoning } from "./types";
import { cn } from "@/lib/utils";

interface Step3Props {
  state: DecisionTraceState;
  onUpdate: (updates: Partial<DecisionTraceState["reasoning"]>) => void;
  onNext: () => void;
  onBack: () => void;
  onTerminate: () => void;
}

export const Step3Reasoning: React.FC<Step3Props> = ({ state, onUpdate, onNext, onBack, onTerminate }) => {
  const { reasoning, intentAnalysis } = state;
  const { status, results = [] } = reasoning;

  // 1. Goal Data Source (Consistent with Step 2)
  const goals = intentAnalysis.semanticSummary?.goals || [];

  // 2. Simulation State
  const [simulationStep, setSimulationStep] = useState<"not_started" | "reasoning" | "confirming">(() => {
    if (status === "COMPLETED") return "confirming";
    if (status === "REASONING") return "reasoning";
    return "not_started";
  });
  const [completedReasoningCount, setCompletedReasoningCount] = useState(0);

  // Initialize simulation step based on global status
  useEffect(() => {
    if (status === "COMPLETED") {
      setSimulationStep("confirming");
      setCompletedReasoningCount(results.length);
    } else if (status === "REASONING") {
      setSimulationStep("reasoning");
    }
  }, [status, results.length]);

  const handleExecute = async () => {
    setCompletedReasoningCount(0);
    // Reset confirmed/rejected IDs when re-running
    onUpdate({
      status: "REASONING",
      executionTriggered: false,
      confirmedGoalIds: [],
      rejectedGoalIds: [],
    });
  };

  // Simulation: Move through goals
  useEffect(() => {
    if (status !== "REASONING" || goals.length === 0) return;

    let mounted = true;
    const runSimulation = async () => {
      // Mocked Results based on Screenshot 2
      const mockedResults: GoalReasoning[] = goals.map((g, idx) => ({
        ...g,
        goal_id: g.goal_id,
        goalId: g.goal_id,
        summary: `基于数据分析，目标 "${g.goal_description}" 的可行性评估为高。`,
        status: "PENDING",
        facts: [
          { fact_id: `f-${idx}-1`, description: "系统库存显示当前零件充足。" },
          { fact_id: `f-${idx}-2`, description: "过往订单履行记录良好。" },
        ],
        inferences: [{ inference_id: `i-${idx}-1`, description: "该目标具有极高的实现可能性。" }],
        risks: [],
        assumptions: ["假设当前 ERP 系统数据为实时更新。"],
      }));

      // Simulate "Thinking" Sequence for each goal
      for (let i = 0; i < mockedResults.length; i++) {
        if (!mounted) return;
        await new Promise((resolve) => setTimeout(resolve, 1000));
        if (!mounted) return;
        setCompletedReasoningCount(i + 1);
      }

      if (mounted) {
        onUpdate({
          status: "COMPLETED",
          results: mockedResults,
          inferenceWord: "MOCKED_PROMPT_WORD",
          reasoningAudit: null,
          executedAt: new Date().toISOString(),
        });
      }
    };

    runSimulation();
    return () => {
      mounted = false;
    };
  }, [status, goals.length]);

  // Auto-execute logic
  useEffect(() => {
    if (state.reasoning.executionTriggered && simulationStep === "not_started") {
      handleExecute();
    }
  }, [state.reasoning.executionTriggered, simulationStep]);

  const handleAuditGoal = (goalId: string, auditStatus: "ACCEPTED" | "REJECTED") => {
    const currentConfirmed = reasoning.confirmedGoalIds || [];
    const currentRejected = reasoning.rejectedGoalIds || [];

    if (auditStatus === "ACCEPTED") {
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

  const isNotStarted = simulationStep === "not_started";
  const isReasoning = simulationStep === "reasoning";
  const isTerminated = state.intentAnalysis.stepStatus === "TERMINATED";
  const isAllHandled =
    goals.length > 0 &&
    goals.every(
      (g) => reasoning.confirmedGoalIds?.includes(g.goal_id) || reasoning.rejectedGoalIds?.includes(g.goal_id),
    );

  return (
    <div className="flex flex-col h-full gap-4 relative">
      {/* 1. Header Bar (Sticky & Modern) */}
      <div className="flex items-center justify-between p-3 bg-white/90 border border-slate-100 rounded-2xl sticky top-0 z-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md">
        <div className="flex items-center gap-3">
          {isNotStarted ? (
            <Badge className="bg-slate-50 text-slate-500 border-slate-200 px-3 py-1 gap-1.5 h-7 font-medium shadow-none">
              <BrainCircuit className="w-3.5 h-3.5" />
              就绪
            </Badge>
          ) : !isReasoning ? (
            <Badge className="bg-purple-50 text-purple-600 border-purple-100 px-3 py-1 gap-1.5 h-7 font-medium shadow-none">
              <BrainCircuit className="w-3.5 h-3.5" />
              推理结果待确认
            </Badge>
          ) : (
            <Badge className="bg-blue-50 text-blue-600 border-blue-100 px-3 py-1 gap-1.5 h-7 font-medium shadow-none">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              AI 数据推理中
            </Badge>
          )}

          {!isReasoning && !isNotStarted && (
            <span className="text-sm text-slate-500">
              已生成 <span className="font-bold text-slate-900">{results.length}</span> 条推理结论
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isReasoning && !isNotStarted && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExecute}
              className="h-8 text-slate-600 border-slate-200 hover:bg-slate-50 gap-1.5 rounded-lg px-3 shadow-none font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              重新推理
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-red-500 hover:bg-red-50 gap-1.5 rounded-lg px-3 shadow-none font-medium"
            onClick={onTerminate}
          >
            <XCircle className="w-3.5 h-3.5" />
            终止
          </Button>

          <div className="h-4 w-[1px] bg-slate-200 mx-1"></div>

          <Button
            size="sm"
            onClick={onNext}
            disabled={isReasoning || isTerminated || !isAllHandled || isNotStarted}
            className={cn(
              "gap-1.5 h-8 px-4 rounded-lg shadow-sm transition-all duration-300 font-bold",
              isAllHandled && !isNotStarted
                ? "bg-purple-600 hover:bg-purple-700 text-white"
                : "bg-purple-50 text-purple-200 cursor-not-allowed border-purple-100",
            )}
          >
            <Play className="w-3.5 h-3.5" />
            下一步: 专家建议
          </Button>
        </div>
      </div>

      {/* 2. Main content area transition */}
      <div className="flex-1 overflow-auto px-1 pb-6">
        {isNotStarted ? (
          /* VIEW 0: Not Started */
          <div className="flex flex-col items-center justify-center min-h-[500px] animate-in fade-in duration-500 gap-8">
            <div className="relative">
              <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 shadow-sm relative z-10">
                <BrainCircuit className="w-16 h-16 text-slate-300" />
              </div>
              <div className="absolute inset-0 w-full h-full rounded-full border border-slate-100 opacity-20" />
            </div>

            <div className="text-center space-y-3">
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">数据推理就绪</h2>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                数据准备已完成。点击下方按钮，AI 将根据准备好的业务数据进行深度推理分析。
              </p>
            </div>

            <Button
              size="lg"
              onClick={handleExecute}
              className="px-10 gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-lg rounded-2xl h-14 transition-all hover:scale-105"
            >
              <BrainCircuit className="w-6 h-6" />
              开始 AI 深度推理
            </Button>
          </div>
        ) : isReasoning ? (
          /* VIEW 1: Simulation (Brain Pulse) */
          <div className="flex flex-col items-center justify-center min-h-[500px] animate-in fade-in duration-500">
            {/* Centered Brain Anim */}
            <div className="relative mb-8">
              <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100 shadow-[0_20px_50px_rgba(59,130,246,0.1)] relative z-10">
                <BrainCircuit className="w-16 h-16 text-blue-500 animate-pulse" />
              </div>
              <div className="absolute top-0 right-0 w-8 h-8 bg-purple-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg transform translate-x-1/4 -translate-y-1/4 z-20">
                <span className="text-[10px] font-bold text-white uppercase">AI</span>
              </div>
              {/* Outer circles */}
              <div className="absolute inset-0 w-full h-full rounded-full border border-blue-200 animate-ping opacity-20" />
            </div>

            <div className="text-center space-y-3 mb-12">
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">AI 正在进行深度推理...</h2>
            </div>

            {/* Task Queue Card */}
            <div className="w-[500px] bg-white border border-slate-100 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.02)] overflow-hidden">
              <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-600">推理任务队列 ({goals.length})</span>
              </div>
              <div className="divide-y divide-slate-50">
                {goals.map((goal, idx) => {
                  const isProcessing = completedReasoningCount === idx;
                  const isDone = completedReasoningCount > idx;

                  return (
                    <div
                      key={goal.goal_id}
                      className="p-4 flex items-center justify-between group bg-white hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full",
                            isProcessing
                              ? "bg-blue-500 animate-pulse ring-4 ring-blue-50"
                              : isDone
                                ? "bg-blue-400"
                                : "bg-slate-200",
                          )}
                        />
                        <span
                          className={cn(
                            "text-sm transition-colors",
                            isProcessing ? "text-slate-900 font-medium" : isDone ? "text-slate-400" : "text-slate-400",
                          )}
                        >
                          {goal.goal_description}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isProcessing && (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            推理中
                          </div>
                        )}
                        {isDone && <span className="text-[10px] text-slate-400">已整理</span>}
                        {!isProcessing && !isDone && <span className="text-[10px] text-slate-200">等待中...</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* VIEW 2: Results Table-like List */
          <div className="border border-slate-100 rounded-2xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500 mt-4">
            {/* Table Header */}
            <div className="flex items-center bg-slate-50/50 border-b border-slate-100 p-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <div className="w-12 text-center">#</div>
              <div className="flex-1 px-4">推理结果摘要</div>
              <div className="w-48 text-right px-4">状态操作</div>
            </div>

            {/* List Rows */}
            <div className="divide-y divide-slate-100">
              {goals.map((goal, index) => {
                const result = results.find((r) => r.goal_id === goal.goal_id || r.goalId === goal.goal_id);
                const isRejected = reasoning.rejectedGoalIds?.includes(goal.goal_id);
                const isConfirmed = reasoning.confirmedGoalIds?.includes(goal.goal_id);

                return (
                  <div
                    key={goal.goal_id}
                    className={cn(
                      "flex items-start p-6 hover:bg-slate-50/40 transition-all duration-300 group",
                      isRejected && "opacity-60 grayscale-[0.3]",
                    )}
                  >
                    {/* Index */}
                    <div className="w-12 flex-shrink-0 flex justify-center mt-1">
                      <span className="text-sm font-bold text-slate-300 group-hover:text-slate-400 transition-colors">
                        {index + 1}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 px-4 space-y-1.5">
                      <h4
                        className={cn(
                          "text-base font-bold transition-colors",
                          isRejected ? "text-slate-400" : "text-slate-900",
                        )}
                      >
                        {goal.goal_description}
                      </h4>
                      <p
                        className={cn(
                          "text-sm leading-relaxed",
                          isRejected ? "text-slate-300" : "text-slate-500 font-medium",
                        )}
                      >
                        {result?.summary ||
                          `基于深度推理分析，目标 “${goal.goal_description}” 具备极高的业务价值与可行性优先级。`}
                      </p>
                    </div>

                    {/* Actions Area */}
                    <div className="w-48 flex-shrink-0 flex items-center justify-end gap-2 px-2">
                      {!isConfirmed && !isRejected ? (
                        <div className="flex items-center gap-1.5">
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
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 animate-in fade-in zoom-in-95 duration-200">
                          {isConfirmed && (
                            <Badge className="bg-green-50 text-green-700 border border-green-200 shadow-sm font-normal py-0.5 px-2 gap-1 h-5">
                              <CheckCircle2 className="w-3 h-3" />
                              已审计
                            </Badge>
                          )}
                          {isRejected && (
                            <Badge className="bg-slate-100 text-slate-500 border border-slate-200 shadow-sm font-normal py-0.5 px-2 gap-1 h-5">
                              <XCircle className="w-3 h-3" />
                              已拒绝
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAuditGoal(goal.goal_id, isConfirmed ? "ACCEPTED" : "REJECTED")}
                            className="h-8 text-slate-400 hover:text-blue-600 px-2 gap-1 font-normal"
                          >
                            撤销审计
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {goals.length === 0 && (
                <div className="p-16 text-center text-slate-300 italic text-sm">暂无推理数据，请检查前置步骤</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
