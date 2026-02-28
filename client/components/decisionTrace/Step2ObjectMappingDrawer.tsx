import React from "react";
import { GitBranch, CheckCircle2, XCircle, Target, Filter, ArrowUpDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { Tabs } from "antd";
import { cn } from "@/lib/utils";
import { SortingEngine } from "./types";

// ─── Data Types ────────────────────────────────────────────────────────────────

interface ObjectEvaluationItem {
  object_name: string;
  evaluation_logic: string;
  decision: "matched" | "not_matched" | string;
}

interface GoalObjectMapping {
  goal_id: string;
  goal_description?: string;
  semantic_breakdown?: string;
  object_evaluation?: ObjectEvaluationItem[];
  final_decision_logic?: string;
}

interface ExpertBriefingTrace {
  per_goal_analysis?: GoalObjectMapping[];
}

interface FilterStep {
  rule: string;
  triggered: boolean;
  reason?: string;
}

interface FilterInstance {
  instance_id: string;
  instance_name?: string;
  is_filtered: boolean;
  filter_reason?: string;
  filter_steps?: FilterStep[];
  final_status?: "retained" | "removed" | string;
}

interface RankingInstance {
  instance_id: string;
  instance_name?: string;
  score?: number;
  rank_reason?: string;
  ranking_basis?: string[];
  ranking_position?: number;
}

interface SortingPerObjectAnalysis {
  object_type: string;
  object_name: string;
  filtering_trace?: FilterInstance[];
  ranking_trace?: RankingInstance[];
  goal_level_analysis?: string;
}

interface SortingGoalAnalysis {
  goal_id: string;
  goal_level_analysis?: string;
  per_object_analysis?: SortingPerObjectAnalysis[];
}

// ─── Sub-components ────────────────────────────────────────────────────────────

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{children}</p>
);

const DecisionBadge: React.FC<{ decision: string }> = ({ decision }) => {
  const isMatch = decision === "matched";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium border whitespace-nowrap",
        isMatch ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-600 border-red-200",
      )}
    >
      {isMatch ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
      {isMatch ? "匹配" : "不匹配"}
    </span>
  );
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const isRetained = status === "retained" || status === "kept";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium border whitespace-nowrap",
        isRetained
          ? "bg-blue-50 text-blue-700 border-blue-200"
          : "bg-slate-100 text-slate-500 border-slate-200 line-through opacity-70",
      )}
    >
      {isRetained ? "保留" : "过滤"}
    </span>
  );
};

// ─── Tab 1: Object Type Mapping ─────────────────────────────────────────────────

const ObjectMappingTab: React.FC<{ trace: ExpertBriefingTrace | null | undefined }> = ({ trace }) => {
  const goals = trace?.per_goal_analysis || [];

  if (goals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <Target className="w-10 h-10 opacity-20 mb-3" />
        <p className="text-sm">暂无对象类型匹配数据</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {goals.map((goal, idx) => (
        <div key={goal.goal_id || idx} className="border border-slate-200 rounded-lg overflow-hidden">
          {/* Goal Header */}
          <div className="bg-slate-50 px-4 py-3 flex items-center gap-2 border-b border-slate-100">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
              {goal.goal_id || `G${idx + 1}`}
            </span>
            <span className="text-sm font-semibold text-slate-700 flex-1">
              {goal.goal_description || `目标 ${idx + 1}`}
            </span>
          </div>

          <div className="p-4 space-y-4 bg-white">
            {/* Semantic Breakdown */}
            {goal.semantic_breakdown && (
              <div>
                <SectionLabel>语义拆解</SectionLabel>
                <p className="text-sm text-slate-600 bg-slate-50 border border-slate-100 rounded-md px-3 py-2 leading-relaxed">
                  {goal.semantic_breakdown}
                </p>
              </div>
            )}

            {/* Object Evaluation Table */}
            {goal.object_evaluation && goal.object_evaluation.length > 0 && (
              <div>
                <SectionLabel>对象评估</SectionLabel>
                <div className="border border-slate-100 rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">知识对象</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">评估逻辑</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-slate-500">决策</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {goal.object_evaluation.map((obj, oIdx) => (
                        <tr key={oIdx} className={cn(obj.decision !== "matched" && "opacity-60")}>
                          <td className="px-3 py-2.5 font-medium text-slate-700 whitespace-nowrap text-xs">
                            {obj.object_name}
                          </td>
                          <td className="px-3 py-2.5 text-slate-500 text-xs leading-relaxed">{obj.evaluation_logic}</td>
                          <td className="px-3 py-2.5 text-center">
                            <DecisionBadge decision={obj.decision} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Final Decision Logic */}
            {goal.final_decision_logic && (
              <div>
                <SectionLabel>最终决策逻辑</SectionLabel>
                <p className="text-sm text-slate-600 italic bg-blue-50/50 border border-blue-100 rounded-md px-3 py-2 leading-relaxed">
                  {goal.final_decision_logic}
                </p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Tab 2: Instance Filtering & Ranking ────────────────────────────────────────

const FilteringRankingTab: React.FC<{ sortingResults: SortingEngine | null | undefined }> = ({ sortingResults }) => {
  const goals = (sortingResults?.reasoning_trace?.per_goal_analysis || []) as SortingGoalAnalysis[];

  if (goals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <Filter className="w-10 h-10 opacity-20 mb-3" />
        <p className="text-sm">暂无实例过滤与排序数据</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {goals.map((goal, idx) => (
        <div key={goal.goal_id || idx} className="border border-slate-200 rounded-lg overflow-hidden">
          {/* Goal Header */}
          <div className="bg-slate-50 px-4 py-3 flex items-start gap-2 border-b border-slate-100">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
              {goal.goal_id || `G${idx + 1}`}
            </span>
            <div>
              {goal.goal_level_analysis && (
                <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{goal.goal_level_analysis}</p>
              )}
            </div>
          </div>

          {/* Per Object Analysis */}
          <div className="divide-y divide-slate-100 bg-white">
            {(goal.per_object_analysis || []).map((obj, oIdx) => (
              <div key={oIdx} className="p-4 space-y-3">
                {/* Object name header */}
                <div className="flex items-center gap-2">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-sm font-semibold text-slate-700">{obj.object_name}</span>
                  <span className="text-xs text-slate-400 font-mono">{obj.object_type}</span>
                </div>

                {obj.goal_level_analysis && (
                  <p className="text-xs text-slate-500 pl-5 leading-relaxed">{obj.goal_level_analysis}</p>
                )}

                {/* Filtering Trace */}
                {obj.filtering_trace && obj.filtering_trace.length > 0 && (
                  <div className="pl-5">
                    <SectionLabel>过滤规则追踪</SectionLabel>
                    <div className="border border-slate-100 rounded-md overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-slate-50 border-b border-slate-100">
                          <tr>
                            <th className="px-3 py-1.5 text-left font-medium text-slate-500">实例</th>
                            <th className="px-3 py-1.5 text-left font-medium text-slate-500">过滤原因</th>
                            <th className="px-3 py-1.5 text-center font-medium text-slate-500">状态</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {obj.filtering_trace.map((inst, iIdx) => (
                            <tr key={iIdx} className={cn(inst.is_filtered && "opacity-60")}>
                              <td className="px-3 py-2 font-mono text-slate-600 whitespace-nowrap">
                                {inst.instance_name || inst.instance_id}
                              </td>
                              <td className="px-3 py-2 text-slate-500 leading-relaxed">{inst.filter_reason || "—"}</td>
                              <td className="px-3 py-2 text-center">
                                <StatusBadge status={inst.is_filtered ? "removed" : "retained"} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Ranking Trace */}
                {obj.ranking_trace && obj.ranking_trace.length > 0 && (
                  <div className="pl-5">
                    <SectionLabel>
                      <span className="flex items-center gap-1">
                        <ArrowUpDown className="w-3 h-3" /> 排序逻辑
                      </span>
                    </SectionLabel>
                    <div className="space-y-2">
                      {obj.ranking_trace.map((inst, rIdx) => (
                        <div
                          key={rIdx}
                          className="bg-slate-50 border border-slate-100 rounded-md px-3 py-2 flex items-start gap-2"
                        >
                          <span className="w-5 h-5 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                            {inst.ranking_position ?? rIdx + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="text-xs font-medium text-slate-700 font-mono">
                                {inst.instance_name || inst.instance_id}
                              </span>
                              {inst.ranking_basis &&
                                inst.ranking_basis.map((tag) => (
                                  <span
                                    key={tag}
                                    className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100"
                                  >
                                    {tag}
                                  </span>
                                ))}
                            </div>
                            {inst.rank_reason && (
                              <p className="text-xs text-slate-500 leading-relaxed">{inst.rank_reason}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Main Drawer ────────────────────────────────────────────────────────────────

interface Step2ObjectMappingDrawerProps {
  expertBriefingData?: any; // parsed expertBriefing JSON (contains reasoning_trace)
  sortingResults?: SortingEngine | null;
}

export const Step2ObjectMappingDrawer: React.FC<Step2ObjectMappingDrawerProps> = ({
  expertBriefingData,
  sortingResults,
}) => {
  const mappingTrace: ExpertBriefingTrace | null = expertBriefingData?.reasoning_trace || null;
  const hasData = !!(
    mappingTrace?.per_goal_analysis?.length || sortingResults?.reasoning_trace?.per_goal_analysis?.length
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-400 hover:text-indigo-600 relative"
          title="查看推理回溯"
        >
          <GitBranch className="w-4 h-4" />
          {hasData && <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-indigo-500" />}
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="sm:max-w-2xl flex flex-col gap-0 p-0">
        <SheetHeader className="p-6 border-b bg-gradient-to-r from-emerald-50 to-white">
          <div className="flex items-center gap-2 text-slate-800">
            <GitBranch className="w-5 h-5 text-emerald-600" />
            <SheetTitle className="text-xl">推理回溯追踪</SheetTitle>
            <Badge variant="outline" className="ml-1 text-xs text-emerald-600 border-emerald-200 bg-emerald-50">
              Step 2 Trace
            </Badge>
          </div>
          <SheetDescription className="text-slate-500 mt-1">
            AI 数据准备阶段的推理链路：对象类型匹配逻辑与实例过滤排序过程。
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <Tabs
            defaultActiveKey="mapping"
            className="flex flex-col h-full pl-2"
            items={[
              {
                key: "mapping",
                label: (
                  <span className="flex items-center gap-1.5 px-1">
                    <Target className="w-3.5 h-3.5" />
                    对象类型匹配
                  </span>
                ),
                children: (
                  <div className="overflow-y-auto flex-1 p-4" style={{ maxHeight: "calc(100vh - 200px)" }}>
                    <ObjectMappingTab trace={mappingTrace} />
                  </div>
                ),
              },
              {
                key: "filtering",
                label: (
                  <span className="flex items-center gap-1.5 px-1">
                    <Filter className="w-3.5 h-3.5" />
                    实例过滤与排序
                  </span>
                ),
                children: (
                  <div className="overflow-y-auto flex-1 p-4" style={{ maxHeight: "calc(100vh - 200px)" }}>
                    <FilteringRankingTab sortingResults={sortingResults} />
                  </div>
                ),
              },
            ]}
            style={{ height: "100%", display: "flex", flexDirection: "column" }}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};
