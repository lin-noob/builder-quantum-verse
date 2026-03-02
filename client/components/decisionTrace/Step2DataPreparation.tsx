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
  onNext: () => void;
  onBack: () => void;
}

export const Step2DataPreparation: React.FC<Step2Props> = ({ state, onUpdate, onNext, onBack }) => {
  const { refreshEventDetails } = useRefresh(); // 使用刷新hook
  const { dataPreparation } = state;
  const { integrityIssues, expertBriefing, supplementaryNotes = EMPTY_OBJECT, sortingResults } = dataPreparation;

  // sortingResults = {};

  // sortingResults.results = [
  //   {
  //     goal_id: "G1",
  //     goal_description: "紧急申请暂停订单602309的生产以避免误产",
  //     ranked_objects: [
  //       {
  //         object_type: "25",
  //         object_name: "Production_Order (生产订单)",
  //         ranked_instances: [
  //           {
  //             instance_id: "PO-602309",
  //             rank: 1,
  //             reason: "ID完全匹配且状态为生产中，符合暂停条件",
  //             instance_snapshot: {
  //               instance_id: "PO-602309",
  //               instance_name: "Order 602309",
  //               current_status: "In_Production",
  //               created_at: "2026-02-20T08:00:00Z",
  //               updated_at: "2026-02-28T10:00:00Z",
  //               runtime_properties: [{ property_name: "priority", property_value: "High" }],
  //             },
  //           },
  //         ],
  //       },
  //       {
  //         object_type: "26",
  //         object_name: "Email_Ticket (邮件工单)",
  //         ranked_instances: [],
  //       },
  //     ],
  //   },
  // ];

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
          .replace(/\\n/g, "\n") // Convert literal \n back to real newlines/whitespace
          .replace(/\/n/g, "\n") // Handle user-reported /n case
          .replace(/\\"/g, '"') // Unescape quotes
          .replace(/^"+|"+$/g, "") // Remove redundant wrapping quotes
          .trim();

        if (!cleaned) return null;

        // Try parsing the cleaned version
        const finalData = JSON.parse(cleaned);
        // If it's still a string, parse one last time
        return typeof finalData === "string" ? JSON.parse(finalData) : finalData;
      } catch (e) {
        console.error("[Step2] Failed to parse expertBriefing even after cleaning:", e);
        return null;
      }
    };

    return flexibleParse(expertBriefing);
  }, [expertBriefing]);

  const [expandedGoals, setExpandedGoals] = useState<string[]>([]);

  // Build goal render list directly from sortingResults
  const renderGoals = React.useMemo(() => {
    if (!sortingResults?.results) return [];

    return sortingResults.results.map((result: any) => ({
      id: result.goal_id,
      description: result.goal_description,
      ranked_objects: result.ranked_objects || [],
      human_context_note: result.human_context_note || "",
    }));
  }, [sortingResults]);

  // Initialize expanded goals on first load (expand incomplete ones)
  useEffect(() => {
    if (renderGoals.length === 0) return;

    const incompleteGoals = renderGoals.filter((g) => getGoalStatus(g.id) !== "COMPLETE").map((g) => g.id);

    if (incompleteGoals.length > 0) {
      setExpandedGoals((prev) => {
        const newGoals = incompleteGoals.filter((id) => !prev.includes(id));
        if (newGoals.length === 0) return prev;
        return [...prev, ...newGoals];
      });
    }
  }, [renderGoals]);

  const toggleGoalExpand = (id: string) => {
    setExpandedGoals((prev) => (prev.includes(id) ? prev.filter((gId) => gId !== id) : [...prev, id]));
  };

  const handleNoteChange = (goalId: string, note: string) => {
    onUpdate({
      supplementaryNotes: {
        ...supplementaryNotes,
        [goalId]: note,
      },
    });
  };

  // Helper to get status of a specific goal
  const getGoalStatus = (goalId: string) => {
    const goalSortingResults = getSortingResultsForGoal(goalId);

    // Check if we have sorting results data
    const hasData = goalSortingResults?.ranked_objects && goalSortingResults.ranked_objects.length > 0;
    const hasInstances = goalSortingResults?.ranked_objects?.some(
      (obj: any) => obj.ranked_instances && obj.ranked_instances.length > 0,
    );

    if (!hasData || !hasInstances) return "INCOMPLETE";

    // Check for blocking issues
    const goalIssues = integrityIssues.filter((i) => i.goalId === goalId);
    const hasBlockingIssues = goalIssues.some(
      (i) => i.severity === "high" || i.type === "missing_field" || i.type === "conflict",
    );

    if (hasBlockingIssues) {
      const isConfirmed = dataPreparation.confirmedGoalIds?.includes(goalId);
      return isConfirmed ? "CONFIRMED_WITH_RISK" : "INCOMPLETE";
    }

    return "COMPLETE";
  };

  const handleConfirmGoalRisk = (goalId: string) => {
    const currentConfirmed = dataPreparation.confirmedGoalIds || [];
    if (!currentConfirmed.includes(goalId)) {
      onUpdate({ confirmedGoalIds: [...currentConfirmed, goalId] });
    }
  };

  // Helper function to get sorting results for a specific goal
  const getSortingResultsForGoal = (goalId: string) => {
    if (!sortingResults?.results) return null;
    return sortingResults.results.find((result: any) => result.goal_id === goalId);
  };

  // Helper function to prepare table data for a goal
  const prepareTableDataForGoal = (goalId: string) => {
    const goalSortingResults = getSortingResultsForGoal(goalId);
    const hasData = goalSortingResults?.ranked_objects && goalSortingResults.ranked_objects.length > 0;

    if (!hasData) {
      return { hasData: false, tableData: [], goalSortingResults };
    }

    // Prepare table data - each instance becomes a separate row
    const tableData: any[] = [];
    goalSortingResults.ranked_objects.forEach((obj: any) => {
      if (obj.ranked_instances && obj.ranked_instances.length > 0) {
        obj.ranked_instances.forEach((instance: any) => {
          tableData.push({
            key: `${obj.object_name}-${instance.instance_id}`,
            object_name: obj.object_name,
            object_type: obj.object_type,
            instance_id: instance.instance_id,
            rank: instance.rank,
            reason: instance.reason,
            instance_snapshot: instance.instance_snapshot,
          });
        });
      }
    });

    return { hasData: tableData.length > 0, tableData, goalSortingResults };
  };

  // Table rendering component
  const SortingResultsTable: React.FC<{ tableData: any[] }> = ({ tableData }) => {
    return (
      <div className="border rounded-md bg-white overflow-hidden">
        <Table
          dataSource={tableData}
          columns={[
            {
              title: "相关业务实例",
              key: "instance",
              render: (_, record: any) => (
                <InstanceDetailDrawer
                  instance={record}
                  trigger={
                    <button className="text-left hover:text-blue-600 transition-colors">
                      <Tag color="blue" className="font-medium text-slate-700">
                        {record.instance_id}
                      </Tag>
                      <div className="text-xs text-slate-400 font-mono">{record.rank}</div>
                      <div className="text-xs text-slate-400 font-mono">{record.reason}</div>
                    </button>
                  }
                />
              ),
            },
            {
              title: "知识对象",
              key: "object",
              render: (_, record: any) => (
                <div>
                  <div className="font-medium text-slate-700">{record.object_name}</div>
                  <div className="text-xs text-slate-500">{record.object_type}</div>
                </div>
              ),
            },
          ]}
          rowKey="key"
          pagination={false}
          size="small"
          scroll={{ y: 400 }}
        />
      </div>
    );
  };

  // Global Status Logic
  const allGoalStatuses = renderGoals.map((g) => ({ id: g.id, status: getGoalStatus(g.id) }));
  const anyIncomplete = allGoalStatuses.some((s) => s.status === "INCOMPLETE");
  const completedCount = allGoalStatuses.filter(
    (s) => s.status === "COMPLETE" || s.status === "CONFIRMED_WITH_RISK",
  ).length;

  // Continue Logic
  const handleGlobalContinueClick = async () => {
    // We now prioritize sortingEngine as the primary data exchange format
    const baseSortingResults = dataPreparation.sortingResults;

    if (baseSortingResults) {
      // 1. Map human context notes and any user-adjusted data into sortingResults
      const updatedSortingResults = {
        ...baseSortingResults,
        results: (baseSortingResults.results || []).map((res) => {
          // Find if there are manual/filtered candidates involved (optional logic extension)
          // For now, primarily ensuring human_context_note is attached
          return {
            ...res,
            human_context_note: supplementaryNotes[res.goal_id] || "",
          };
        }),
      };

      // 2. Update status and save the final serialized sortingEngine results
      // The backend API strictly expects the `results` array from sortingEngine,
      // enriched with the `human_context_note`.
      onUpdate({
        status: "completed",
        riskNote: undefined,
        expertBriefing: JSON.stringify(updatedSortingResults.results),
      });
    } else {
      // Fallback if no sorting results exist
      onUpdate({ status: "completed", riskNote: undefined });
    }

    onNext();
  };

  const hasRisk = allGoalStatuses.some((s) => s.status === "CONFIRMED_WITH_RISK");

  return (
    <div className="flex flex-col h-full gap-6 relative">
      {/* 1. Top Navigation & Status Bar */}
      <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg sticky top-0 z-10 shadow-sm backdrop-blur-sm bg-opacity-90">
        {/* Left Side: Progress Info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="text-base font-medium text-slate-700">数据就绪进度</div>
            <Badge variant="secondary" className="bg-white border border-slate-200 text-slate-600 font-mono">
              {completedCount} / {renderGoals.length}
            </Badge>
          </div>

          {anyIncomplete && (
            <span className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              存在未完成项
            </span>
          )}
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-slate-600 hover:text-slate-700 hover:bg-slate-100 gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            上一步
          </Button>

          {/* Reasoning Trace Drawer */}
          <Step2ObjectMappingDrawer
            expertBriefingData={expertBriefingData}
            sortingResults={dataPreparation.sortingResults}
          />

          {/* Prompt Debugger Drawer */}
          <PromptDebuggerDrawer
            title="Data Preparation & Sorting"
            currentStep={state.currentStep}
            id={state.triggerEvent.id}
            prompts={[
              {
                label: "Data Prep",
                word: dataPreparation.expertBriefingWord || "",
              },
              {
                label: "Sorting Engine",
                word: dataPreparation.sortingEngineWord || "",
              },
            ]}
          />

          <div className="h-4 w-[1px] bg-slate-300 mx-1"></div>
          <Button
            size="sm"
            onClick={handleGlobalContinueClick}
            disabled={renderGoals.length === 0}
            className={cn(
              "gap-1.5 shadow-sm min-w-[140px]",
              hasRisk
                ? "bg-amber-600 hover:bg-amber-700 text-white border-amber-600"
                : "bg-blue-600 hover:bg-blue-700 text-white",
            )}
          >
            <CheckCircle2 className="w-4 h-4" />
            {hasRisk ? "确认并继续" : "确认数据就绪"}
          </Button>
        </div>
      </div>

      {/* 2. Goal List (Vertical Flow) — driven by expertBriefing */}
      <div className="space-y-4 pb-20">
        {renderGoals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
              <Database className="w-8 h-8 opacity-40" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-base font-medium text-slate-500">AI分析中如等待过长，可能分析失败</p>
              {/* <p className="text-sm text-slate-400">请先完成步骤 1 并确认意图分析，系统将自动进行数据检索与关联</p> */}
            </div>
          </div>
        ) : (
          renderGoals.map((goalItem) => {
            const goalIssues = integrityIssues.filter((i) => i.goalId === goalItem.id);
            const goalStatus = getGoalStatus(goalItem.id);
            const isConfirmed = dataPreparation.confirmedGoalIds?.includes(goalItem.id);
            const isExpanded = expandedGoals.includes(goalItem.id);

            // Check if we have data from sorting results
            const hasData = goalItem.ranked_objects && goalItem.ranked_objects.length > 0;
            const hasInstances = goalItem.ranked_objects?.some(
              (obj: any) => obj.ranked_instances && obj.ranked_instances.length > 0,
            );
            const hasMatches = hasData && hasInstances;

            return (
              <Card
                key={goalItem.id}
                className={cn(
                  "border shadow-sm transition-all duration-200",
                  !hasMatches ? "border-red-200 bg-red-50/5" : "border-slate-200 bg-white",
                  goalStatus === "CONFIRMED_WITH_RISK" && "border-amber-200 bg-amber-50/10",
                )}
              >
                {/* Card Header (Click to toggle) */}
                <div
                  className={cn(
                    "flex items-center justify-between p-4 cursor-pointer transition-colors",
                    isExpanded && "border-b border-slate-100",
                  )}
                  onClick={() => toggleGoalExpand(goalItem.id)}
                >
                  <div className="flex items-center gap-3">
                    {/* Status Indicator Bar */}
                    <div
                      className={cn(
                        "w-1 h-8 rounded-full",
                        goalStatus === "COMPLETE"
                          ? "bg-green-500"
                          : goalStatus === "CONFIRMED_WITH_RISK"
                            ? "bg-amber-500"
                            : !hasMatches
                              ? "bg-red-500"
                              : "bg-slate-300",
                      )}
                    ></div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-semibold text-slate-800">{goalItem.description}</span>
                        <Badge
                          className={cn(
                            "text-sm tracking-wider h-5 px-1.5 font-normal border",
                            goalStatus === "COMPLETE"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : goalStatus === "CONFIRMED_WITH_RISK"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : !hasMatches
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : "bg-slate-100 text-slate-500 border-slate-200",
                          )}
                        >
                          {goalStatus === "COMPLETE"
                            ? "已就绪"
                            : goalStatus === "CONFIRMED_WITH_RISK"
                              ? "已确认例外"
                              : !hasMatches
                                ? "未匹配"
                                : "需处理"}
                        </Badge>
                      </div>
                      {/* {!hasData && (
                        <div className="flex items-center gap-1.5 text-xs text-red-500">
                          <AlertCircle className="w-3 h-3" />
                          <span>暂无排序数据</span>
                        </div>
                      )} */}
                      <div className="flex items-center gap-1.5 text-sm text-slate-400">
                        <Database className="w-3 h-3" />
                        {(() => {
                          if (!goalItem.ranked_objects || goalItem.ranked_objects.length === 0) {
                            return <span>暂无数据</span>;
                          }
                          const objectCount = goalItem.ranked_objects.length;
                          const instanceCount = goalItem.ranked_objects.reduce(
                            (total: number, obj: any) => total + (obj.ranked_instances?.length || 0),
                            0,
                          );
                          return (
                            <span>
                              {objectCount} 个对象，{instanceCount} 个实例
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </div>

                {/* Collapsible Content */}
                {isExpanded && (
                  <div className="p-4 space-y-5 bg-slate-50/30">
                    {/* Matched Objects Table */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <Search className="w-3 h-3" /> 匹配数据对象
                        </h4>
                        {/* <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddCandidate(goalItem.id);
                          }}
                          className="h-6 text-sm tracking-wider px-2 text-blue-600 hover:bg-blue-50"
                        >
                          <Plus className="w-3 h-3 mr-1" /> 添加对象
                        </Button> */}
                      </div>

                      {/* Table Rendering using sortingResults */}
                      {(() => {
                        const { hasData, tableData } = prepareTableDataForGoal(goalItem.id);

                        if (!hasData) {
                          return (
                            <div className="text-center py-6 border border-dashed rounded-md bg-slate-50 text-slate-400 text-sm">
                              暂无数据
                            </div>
                          );
                        }

                        return <SortingResultsTable tableData={tableData} />;
                      })()}
                    </div>

                    {/* Supplementary Notes Section */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">人工补充说明 (可选)</h4>
                      <TextArea
                        placeholder="请输入补充说明..."
                        value={supplementaryNotes[goalItem.id] || ""}
                        onChange={(e) => handleNoteChange(goalItem.id, e.target.value)}
                        autoSize={{ minRows: 2, maxRows: 6 }}
                        className="text-sm"
                        maxLength={200}
                      />
                    </div>

                    {/* [C] Integrity Issues (Exception Driven) */}
                    {goalIssues.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <h4 className="text-sm font-bold text-red-500 uppercase tracking-wider flex items-center gap-1.5">
                          <AlertTriangle className="w-3 h-3" /> 发现问题
                        </h4>
                        <div className="space-y-2">
                          {goalIssues.map((issue) => (
                            <Alert
                              key={issue.id}
                              variant="destructive"
                              className="py-2 bg-red-50 border-red-100 text-red-800"
                            >
                              <AlertTriangle className="h-3.5 w-3.5" />
                              <AlertTitle className="text-sm font-bold ml-2">
                                {issue.type === "missing_field"
                                  ? "字段缺失"
                                  : issue.type === "conflict"
                                    ? "数据冲突"
                                    : "警告"}
                              </AlertTitle>
                              <AlertDescription className="text-sm ml-2 mt-1 opacity-90">
                                {issue.description}
                                {issue.affectedInstanceId && (
                                  <span className="block mt-0.5 text-sm tracking-wider opacity-75 font-mono">
                                    Instance: {issue.affectedInstanceId}
                                  </span>
                                )}
                              </AlertDescription>
                            </Alert>
                          ))}
                        </div>

                        {/* Risk Confirmation Action */}
                        {!isConfirmed && (
                          <div className="flex justify-end pt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-sm h-7 border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800"
                              onClick={() => handleConfirmGoalRisk(goalItem.id)}
                            >
                              <AlertTriangle className="w-3 h-3 mr-1.5" />
                              确认忽略风险并继续
                            </Button>
                          </div>
                        )}
                        {isConfirmed && (
                          <div className="flex justify-end pt-2">
                            <span className="text-sm font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3 h-3" />
                              已确认忽略风险
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
