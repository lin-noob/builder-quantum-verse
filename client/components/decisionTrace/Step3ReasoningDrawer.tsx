import React from "react";
import {
  Brain,
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Target,
  Database,
  GitBranch,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { Tabs } from "antd";
import { cn } from "@/lib/utils";

// ─── Data Types ────────────────────────────────────────────────────────────────

interface DataIsolationCheck {
  allowed_data_sources: string[];
  external_data_accessed: boolean;
}

interface FactGenerationTrace {
  fact_id: string;
  extraction_source: string;
  transformation_logic: string;
}

interface InferenceGenerationTrace {
  inference_id: string;
  logical_chain: string[];
  derivation_logic: string;
}

interface RiskEvaluationTrace {
  risk_id: string;
  trigger_facts: string[];
  evaluation_logic: string;
}

interface AssumptionTrace {
  assumption_id: string;
  data_gap: string;
  necessity_reason: string;
}

interface SummaryDerivationTrace {
  based_on: string[];
  compression_logic: string;
}

interface PerGoalAudit {
  goal_id: string;
  data_isolation_check: DataIsolationCheck;
  fact_generation_trace: FactGenerationTrace[];
  inference_generation_trace: InferenceGenerationTrace[];
  risk_evaluation_trace: RiskEvaluationTrace[];
  assumption_trace: AssumptionTrace[];
  summary_derivation_trace: SummaryDerivationTrace;
}

interface ReasoningAudit {
  per_goal_audit: PerGoalAudit[];
}

interface Step3ReasoningDrawerProps {
  title?: string;
  reasoningAudit: ReasoningAudit | null | undefined;
}

// ─── Sub-components ────────────────────────────────────────────────────────────

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{children}</p>
);

const StatusBadge: React.FC<{ status: boolean; trueLabel?: string; falseLabel?: string }> = ({
  status,
  trueLabel = "通过",
  falseLabel = "失败",
}) => {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium border whitespace-nowrap",
        status ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-600 border-red-200",
      )}
    >
      {status ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
      {status ? trueLabel : falseLabel}
    </span>
  );
};

const TraceCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isEmpty?: boolean;
}> = ({ title, icon, children, isEmpty = false }) => {
  if (isEmpty) {
    return (
      <div className="border border-slate-100 rounded-md p-3 bg-slate-50/30">
        <div className="flex items-center gap-2 mb-2">
          {icon}
          <span className="text-xs font-medium text-slate-500">{title}</span>
        </div>
        <p className="text-xs text-slate-400 italic">暂无数据</p>
      </div>
    );
  }

  return (
    <div className="border border-slate-100 rounded-md p-3 bg-white">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-medium text-slate-600">{title}</span>
      </div>
      {children}
    </div>
  );
};

// ─── Main Tab: Reasoning Audit ─────────────────────────────────────────────────

const ReasoningAuditTab: React.FC<{ reasoningAudit: ReasoningAudit | null | undefined }> = ({ reasoningAudit }) => {
  const goals = reasoningAudit?.per_goal_audit || [];

  if (goals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <Brain className="w-10 h-10 opacity-20 mb-3" />
        <p className="text-sm">暂无推理审计数据</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {goals.map((goal, idx) => (
        <div key={goal.goal_id || idx} className="border border-slate-200 rounded-lg overflow-hidden">
          {/* Goal Header */}
          <div className="bg-slate-50 px-4 py-3 flex items-center gap-2 border-b border-slate-100">
            <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
              {goal.goal_id || `G${idx + 1}`}
            </span>
            <span className="text-sm font-semibold text-slate-700 flex-1">推理审计 - {goal.goal_id}</span>
          </div>

          <div className="p-4 space-y-4 bg-white">
            {/* Data Isolation Check */}
            <TraceCard title="数据隔离性检查" icon={<Shield className="w-4 h-4 text-blue-500" />}>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">外部数据访问状态</span>
                  <StatusBadge
                    status={!goal.data_isolation_check.external_data_accessed}
                    trueLabel="安全"
                    falseLabel="违规"
                  />
                </div>
                <div>
                  <SectionLabel>允许的数据源</SectionLabel>
                  <div className="flex flex-wrap gap-1">
                    {goal.data_isolation_check.allowed_data_sources.map((source, sIdx) => (
                      <Badge key={sIdx} variant="outline" className="text-xs">
                        {source}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </TraceCard>

            {/* Fact Generation Trace */}
            <TraceCard
              title="事实生成追踪"
              icon={<Database className="w-4 h-4 text-green-500" />}
              isEmpty={goal.fact_generation_trace.length === 0}
            >
              {goal.fact_generation_trace.length > 0 && (
                <div className="space-y-3">
                  {goal.fact_generation_trace.map((fact, fIdx) => (
                    <div key={fIdx} className="border border-slate-100 rounded p-2 bg-slate-50/50">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">
                          {fact.fact_id}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-600 space-y-1">
                        <div>
                          <span className="font-medium">提取来源:</span> {fact.extraction_source}
                        </div>
                        <div>
                          <span className="font-medium">转换逻辑:</span> {fact.transformation_logic}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TraceCard>

            {/* Inference Generation Trace */}
            <TraceCard
              title="推断生成追踪"
              icon={<GitBranch className="w-4 h-4 text-orange-500" />}
              isEmpty={goal.inference_generation_trace.length === 0}
            >
              {goal.inference_generation_trace.length > 0 && (
                <div className="space-y-3">
                  {goal.inference_generation_trace.map((inf, iIdx) => (
                    <div key={iIdx} className="border border-slate-100 rounded p-2 bg-slate-50/50">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">
                          {inf.inference_id}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-600 space-y-1">
                        <div>
                          <span className="font-medium">依赖事实链:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {inf.logical_chain.map((chain, cIdx) => (
                              <Badge key={cIdx} variant="outline" className="text-xs">
                                {chain}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">演绎推理逻辑:</span> {inf.derivation_logic}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TraceCard>

            {/* Risk Evaluation Trace */}
            <TraceCard
              title="风险评估追踪"
              icon={<AlertTriangle className="w-4 h-4 text-red-500" />}
              isEmpty={goal.risk_evaluation_trace.length === 0}
            >
              {goal.risk_evaluation_trace.length > 0 && (
                <div className="space-y-3">
                  {goal.risk_evaluation_trace.map((risk, rIdx) => (
                    <div key={rIdx} className="border border-slate-100 rounded p-2 bg-slate-50/50">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">
                          {risk.risk_id}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-600 space-y-1">
                        <div>
                          <span className="font-medium">触发事实:</span>
                          {risk.trigger_facts.length > 0 ? (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {risk.trigger_facts.map((fact, fIdx) => (
                                <Badge key={fIdx} variant="outline" className="text-xs">
                                  {fact}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic"> 无</span>
                          )}
                        </div>
                        <div>
                          <span className="font-medium">评估逻辑:</span> {risk.evaluation_logic}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TraceCard>

            {/* Assumption Trace */}
            <TraceCard
              title="假设追踪"
              icon={<Target className="w-4 h-4 text-indigo-500" />}
              isEmpty={goal.assumption_trace.length === 0}
            >
              {goal.assumption_trace.length > 0 && (
                <div className="space-y-3">
                  {goal.assumption_trace.map((asm, aIdx) => (
                    <div key={aIdx} className="border border-slate-100 rounded p-2 bg-slate-50/50">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">
                          {asm.assumption_id}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-600 space-y-1">
                        <div>
                          <span className="font-medium">数据缺口:</span> {asm.data_gap}
                        </div>
                        <div>
                          <span className="font-medium">必要性说明:</span> {asm.necessity_reason}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TraceCard>

            {/* Summary Derivation Trace */}
            <TraceCard title="摘要生成追踪" icon={<ChevronRight className="w-4 h-4 text-teal-500" />}>
              <div className="text-xs text-slate-600 space-y-1">
                <div>
                  <span className="font-medium">基于要素:</span>
                  {goal.summary_derivation_trace.based_on.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {goal.summary_derivation_trace.based_on.map((element, eIdx) => (
                        <Badge key={eIdx} variant="outline" className="text-xs">
                          {element}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400 italic"> 无</span>
                  )}
                </div>
                <div>
                  <span className="font-medium">压缩概括逻辑:</span> {goal.summary_derivation_trace.compression_logic}
                </div>
              </div>
            </TraceCard>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────────

export const Step3ReasoningDrawer: React.FC<Step3ReasoningDrawerProps> = ({ title = "推理追踪", reasoningAudit }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
          <GitBranch className="w-4 h-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="sm:max-w-4xl flex flex-col gap-0 p-0">
        <SheetHeader className="p-6 border-b">
          <div className="flex items-center gap-2 text-slate-800">
            <Brain className="w-5 h-5" />
            <SheetTitle className="text-xl">{title}</SheetTitle>
          </div>
          <SheetDescription className="text-slate-500 mt-1">
            查看推理过程的详细审计追踪，包括数据隔离检查、事实生成、推断逻辑等。
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto bg-slate-50/30">
          <div className="p-6">
            <ReasoningAuditTab reasoningAudit={reasoningAudit} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
