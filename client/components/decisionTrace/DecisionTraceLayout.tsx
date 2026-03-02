import React, { useState, useEffect, useMemo } from "react";
import { Step1IntentAnalysis } from "./Step1IntentAnalysis";
import { Step2DataPreparation } from "./Step2DataPreparation";
import { Step3Reasoning } from "./Step3Reasoning";
import { Step4ActionExecution } from "./Step4ActionExecution";
import { Step5ResultRecording } from "./Step5ResultRecording";
import { DecisionTraceState, DecisionStep, DecisionResult } from "./types";
import DecisionHeaderCard from "./DecisionHeaderCard";
import { DecisionEvent } from "@/components/incidentCopy/DecisionEventListItem";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Play,
  Settings,
  Database,
  HelpCircle as HelpIcon,
  Loader2,
  CheckCircle2,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { getMockState } from "./mockData";

const getEmptyState = (eventId?: string, event?: DecisionEvent | null): DecisionTraceState => ({
  currentStep: "intent",
  overallStatus: "IN_PROGRESS",
  triggerEvent: {
    id: eventId || event?.id || "",
    type: event?.type || "CUSTOMER_EMAIL_RECEIVED",
    content: event?.instanceName || "",
    timestamp: event?.occurred_at || new Date().toISOString(),
  },
  intentAnalysis: {
    coreIntent: event?.ai_initial_judgement || "",
    urgency: "Low",
    goals: [],
    status: "pending",
    stepStatus: "AI_ANALYZED",
    isModified: false,
    confidence: 0,
  },
  dataPreparation: {
    requirements: [],
    candidates: [],
    integrityIssues: [],
    status: "pending",
    semanticSummaryWord: event?.semanticSummaryWord,
    expertBriefingWord: event?.expertBriefingWord,
    sortingEngineWord: event?.sortingEngineWord,
  },
  reasoning: {
    status: "NOT_STARTED",
    snapshotId: "",
    results: [],
    inferenceWord: event?.inferenceWord,
  },
  execution: {
    actions: [],
    status: "pending",
  },
  result: null,
});

export interface DecisionTraceLayoutProps {
  eventId?: string;
  event?: DecisionEvent | null;
  className?: string;
}

export const DecisionTraceLayout: React.FC<DecisionTraceLayoutProps> = ({ eventId, event }) => {
  const [state, setState] = useState<DecisionTraceState>(() =>
    event ? getEmptyState(event.id, event) : getMockState(eventId),
  );

  // Sync state if event prop changes or on initial load
  useEffect(() => {
    if (event) {
      const mockState = getEmptyState(event.id, event);

      // If we have semanticSummary, map it to intentAnalysis
      if (event.semanticSummary) {
        const summary = event.semanticSummary;
        const goals = Array.isArray(summary.goals)
          ? summary.goals.map((g: any, idx: number) => ({
              id: g.goal_id || `g_${idx}`,
              description: g.goal_description || "",
              initialSuggestion: g.recommendation?.strategy || "",
              suggestedNextStep: g.recommendation?.suggested_next_step || "",

              isConfirmed: false,
              isEnabled: true,
              source: "ai",
              isSuggestionStale: false,
            }))
          : [];

        const nextStepMap: Record<number, DecisionStep> = {
          1: "intent",
          2: "data",
          3: "reasoning",
          4: "action",
          5: "result",
        };
        const currentStepStr = nextStepMap[event.current_step || 1] || "intent";
        setState({
          ...mockState,
          currentStep: currentStepStr,
          intentAnalysis: {
            ...mockState.intentAnalysis,
            coreIntent: summary.core_intent?.summary || event.ai_initial_judgement || "",
            confidence: summary.core_intent?.confidence || 0.8,
            goals: goals,
            stepStatus:
              (event.status as any) === "AI_ANALYZED"
                ? "AI_ANALYZED"
                : (event.status as any) === "HUMAN_REVIEWED"
                  ? "CONFIRMED"
                  : "AI_ANALYZED",
            semanticSummary: summary,
          },
          dataPreparation: {
            ...mockState.dataPreparation,
            expertBriefing: event.expertBriefing,
            sortingResults: event.sortingEngine,
            semanticSummaryWord: event.semanticSummaryWord,
            expertBriefingWord: event.expertBriefingWord,
            sortingEngineWord: event.sortingEngineWord,
          },
          reasoning: {
            ...mockState.reasoning,
            status: "COMPLETED",
            results: event?.dataInference?.per_goal_reasoning || mockState.reasoning.results,
            inferenceWord: event.inferenceWord,
            reasoningAudit: event?.dataInference?.reasoning_audit || "",
          },
        });
      } else {
        setState(mockState);
      }
      // Reset step navigation when event changes
      setActiveStep(event.current_step || 1);
      setMaxReachedStep(event.current_step || 1);
    } else {
      setState(getEmptyState());
    }
  }, [event]);

  // Step Navigation State
  const [activeStep, setActiveStep] = useState<number>(() => {
    if (event) return event.current_step || 1;
    // Initialize active step based on currentStep in mock state
    const stepMap: Record<DecisionStep, number> = {
      intent: 1,
      data: 2,
      reasoning: 3,
      action: 4,
      result: 5,
    };
    return stepMap[getMockState(eventId).currentStep] || 1;
  });

  const [maxReachedStep, setMaxReachedStep] = useState<number>(() => {
    if (event) return event.current_step || 1;
    const stepMap: Record<DecisionStep, number> = {
      intent: 1,
      data: 2,
      reasoning: 3,
      action: 4,
      result: 5,
    };
    return stepMap[getMockState(eventId).currentStep] || 1;
  });

  // Scroll listener for sticky header shadow
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const container = document.getElementById("trace-scroll-container");
    if (!container) return;
    const handleScroll = () => {
      setIsScrolled(container.scrollTop > 20);
    };
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Navigate to a specific step
  const handleStepClick = (stepNum: number) => {
    if (stepNum <= maxReachedStep) {
      setActiveStep(stepNum);
      const stepMap: Record<number, DecisionStep> = {
        1: "intent",
        2: "data",
        3: "reasoning",
        4: "action",
        5: "result",
      };
      setState((prev) => ({ ...prev, currentStep: stepMap[stepNum] }));
    }
  };

  const goToNextStep = () => {
    const next = activeStep + 1;
    if (next <= 5) {
      setActiveStep(next);
      if (next > maxReachedStep) {
        setMaxReachedStep(next);
      }
      const stepMap: Record<number, DecisionStep> = {
        1: "intent",
        2: "data",
        3: "reasoning",
        4: "action",
        5: "result",
      };
      setState((prev) => {
        const newState = { ...prev, currentStep: stepMap[next] };
        // Reset reasoning status if we are entering Step 3 (Data Reasoning)
        if (next === 3) {
          newState.reasoning = {
            ...newState.reasoning,
            status: "NOT_STARTED",
          };
        }
        return newState;
      });
    }
  };

  const goToPrevStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
      const stepMap: Record<number, DecisionStep> = {
        1: "intent",
        2: "data",
        3: "reasoning",
        4: "action",
        5: "result",
      };
      setState((prev) => ({ ...prev, currentStep: stepMap[activeStep - 1] }));
    }
  };

  const handleReset = () => {
    setState(event ? getEmptyState(event.id, event) : { ...getMockState(eventId), currentStep: "intent" });
    setActiveStep(1);
    setMaxReachedStep(1);
  };

  // Derive DecisionEvent for Header Card
  const headerEvent: DecisionEvent = useMemo(() => {
    return {
      id: state.triggerEvent.id,
      type: "CUSTOMER_EMAIL_RECEIVED",
      type_label: "客户发送了新邮件",
      icon: "mail",
      customer: {
        id: "cus_123",
        name: "Acme Corp",
        type: "Customer",
      },
      ai_initial_judgement: state.intentAnalysis.coreIntent || "待分析",
      status: "AI_ANALYZED",
      occurred_at: state.triggerEvent.timestamp,
      ai_analyzed_at: new Date(new Date(state.triggerEvent.timestamp).getTime() + 60000)
        .toISOString()
        .replace("T", " ")
        .substring(0, 16),
      has_human_override: false,
      source_url: `https://mail.company.com/inbox/${state.triggerEvent.id}`,
      sales_rep: "张三",
      team: "销售一部",
      instanceId: state.triggerEvent.id,
    };
  }, [state.triggerEvent, state.intentAnalysis.coreIntent]);

  // State Updates
  const updateIntent = (updates: Partial<DecisionTraceState["intentAnalysis"]>) => {
    setState((prev) => ({ ...prev, intentAnalysis: { ...prev.intentAnalysis, ...updates } }));
  };

  const updateData = (updates: Partial<DecisionTraceState["dataPreparation"]>) => {
    setState((prev) => ({ ...prev, dataPreparation: { ...prev.dataPreparation, ...updates } }));
  };

  const updateReasoning = (updates: Partial<DecisionTraceState["reasoning"]>) => {
    setState((prev) => ({ ...prev, reasoning: { ...prev.reasoning, ...updates } }));
  };

  const updateExecution = (updates: Partial<DecisionTraceState["execution"]>) => {
    setState((prev) => ({ ...prev, execution: { ...prev.execution, ...updates } }));
  };

  const updateResult = (updates: Partial<DecisionResult>) => {
    setState((prev) => ({
      ...prev,
      result: {
        ...(prev.result || {
          solved: true,
          hasLoss: false,
          needsReview: false,
          adoptedSolution: "采纳 AI 建议并执行",
          recordedAt: "",
          totalAiActions: 0,
          totalHumanActions: 0,
          startTime: "",
          endTime: "",
          changeLogs: [],
        }),
        ...updates,
      },
    }));
  };

  const handleIntentTerminate = () => {
    setState((prev) => ({
      ...prev,
      overallStatus: "TERMINATED",
      intentAnalysis: {
        ...prev.intentAnalysis,
        stepStatus: "TERMINATED",
        status: "completed",
        isModified: false,
      },
    }));
  };

  const handleIntentRestart = () => {
    setState((prev) => ({
      ...prev,
      overallStatus: "IN_PROGRESS",
      intentAnalysis: {
        ...prev.intentAnalysis,
        stepStatus: "AI_ANALYZED",
        status: "pending",
        isModified: false,
      },
    }));
  };

  const resetDecision = () => {
    setState({ ...getMockState(eventId), currentStep: "intent" });
    setActiveStep(1);
  };

  // Transitions
  const goToStep = (step: DecisionStep) => {
    setState((prev) => ({ ...prev, currentStep: step }));
    const stepMap: Record<DecisionStep, number> = {
      intent: 1,
      data: 2,
      reasoning: 3,
      action: 4,
      result: 5,
    };
    const stepNum = stepMap[step];
    setActiveStep(stepNum);
    if (stepNum > maxReachedStep) {
      setMaxReachedStep(stepNum);
    }
  };

  // Execution Simulation for Step 3
  const handleReasoningExecute = () => {
    updateReasoning({ status: "REASONING" });
    setTimeout(() => {
      updateReasoning({
        status: "COMPLETED",
        executedAt: new Date().toISOString(),
      });
    }, 1500);
  };

  // Handle Result Submit
  const handleResultSubmit = () => {
    updateResult({
      recordedAt: new Date().toISOString().replace("T", " ").substring(0, 19),
      operator: "当前用户",
    });
  };

  // Render Step Content
  const renderStepContent = () => {
    switch (activeStep) {
      case 1:
        return (
          <Step1IntentAnalysis
            state={state}
            onUpdate={updateIntent}
            onUpdateData={updateData}
            onNext={() => goToNextStep()}
            onTerminate={handleIntentTerminate}
            onRestart={handleIntentRestart}
          />
        );
      case 2:
        return (
          <Step2DataPreparation
            state={state}
            onUpdate={updateData}
            onNext={() => goToNextStep()}
            onBack={() => goToPrevStep()}
          />
        );
      case 3:
        return (
          <Step3Reasoning
            state={state}
            onUpdate={updateReasoning}
            onNext={() => goToNextStep()}
            onBack={() => goToPrevStep()}
          />
        );
      case 4:
        return (
          <Step4ActionExecution
            state={state}
            onUpdate={updateExecution}
            onNext={() => goToNextStep()}
            onBack={() => goToPrevStep()}
          />
        );
      case 5:
        return (
          <Step5ResultRecording
            state={state}
            onUpdate={updateResult}
            onReset={handleReset}
            onBack={() => goToPrevStep()}
            onComplete={() => console.log("Decision Complete")}
          />
        );
      default:
        return null;
    }
  };

  const steps = [
    { id: 1, label: "意图分析" },
    { id: 2, label: "数据准备" },
    { id: 3, label: "数据推理" },
    { id: 4, label: "执行动作" },
    { id: 5, label: "结果回溯" },
  ];

  return (
    <div className="h-full flex flex-col bg-slate-50/50">
      {/* 1. Header Card (Sticky) */}
      <div
        className={cn(
          "bg-white border-b border-slate-200 z-10 transition-all duration-200 sticky top-0",
          isScrolled ? "shadow-md" : "",
        )}
      >
        <DecisionHeaderCard event={headerEvent} />

        {/* Stepper Navigation */}
        <div className="flex items-center justify-center py-2 bg-slate-50/80 backdrop-blur border-t border-slate-100">
          <div className="flex items-center gap-1">
            {steps.map((step, index) => {
              const isActive = activeStep === step.id;
              const isCompleted = step.id < activeStep;
              const isAccessible = step.id <= maxReachedStep;

              return (
                <React.Fragment key={step.id}>
                  {/* Step Item */}
                  <button
                    onClick={() => handleStepClick(step.id)}
                    disabled={!isAccessible}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-full text-base font-medium transition-all",
                      isActive
                        ? "bg-blue-600 text-white shadow-sm"
                        : isAccessible
                          ? "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                          : "bg-transparent text-slate-400 cursor-not-allowed",
                    )}
                  >
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-sm tracking-wider font-bold",
                        isActive
                          ? "bg-white text-blue-600"
                          : isCompleted
                            ? "bg-green-500 text-white"
                            : "bg-slate-200 text-slate-500",
                      )}
                    >
                      {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : step.id}
                    </div>
                    <span>{step.label}</span>
                  </button>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div
                      className={cn("w-8 h-[2px] mx-1", step.id < maxReachedStep ? "bg-blue-200" : "bg-slate-200")}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Scrollable Content Area */}
      <div id="trace-scroll-container" className="flex-1 overflow-y-auto p-3 space-y-3">
        <div className="w-full pb-20">{renderStepContent()}</div>
      </div>
    </div>
  );
};
