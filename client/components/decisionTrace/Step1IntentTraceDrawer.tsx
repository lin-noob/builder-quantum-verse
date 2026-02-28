import React from "react";
import { GitBranch, Search, Target, ChevronRight, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface InputAnalysis {
  sender_signal?: string;
  time_signal?: string;
  subject_signal?: string;
  body_signal?: string;
}

interface IntentDerivation {
  key_clues?: string[];
  reasoning_logic?: string;
}

interface GoalDerivationItem {
  goal_id: string;
  derived_from?: string[];
  derivation_logic?: string;
}

interface ReasoningTrace {
  input_analysis?: InputAnalysis;
  intent_derivation?: IntentDerivation;
  goal_derivation?: GoalDerivationItem[];
}

interface Step1IntentTraceDrawerProps {
  reasoningTrace?: ReasoningTrace | null;
}

const SectionCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  accent?: string;
}> = ({ icon, title, subtitle, children, accent = "blue" }) => {
  const accentMap: Record<string, string> = {
    blue: "border-l-blue-500 bg-blue-50/40",
    purple: "border-l-purple-500 bg-purple-50/40",
    emerald: "border-l-emerald-500 bg-emerald-50/40",
  };
  return (
    <div className={cn("border-l-4 rounded-r-lg p-4", accentMap[accent] || accentMap.blue)}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-slate-600">{icon}</span>
        <div>
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
};

const FieldRow: React.FC<{ label: string; value?: string }> = ({ label, value }) => {
  if (!value) return null;
  return (
    <div className="grid grid-cols-[100px_1fr] gap-2 py-1.5 border-b border-slate-100 last:border-0">
      <span className="text-xs font-medium text-slate-500 pt-0.5">{label}</span>
      <span className="text-sm text-slate-700 leading-relaxed">{value}</span>
    </div>
  );
};

export const Step1IntentTraceDrawer: React.FC<Step1IntentTraceDrawerProps> = ({ reasoningTrace }) => {
  const hasData = !!(
    reasoningTrace?.input_analysis ||
    reasoningTrace?.intent_derivation ||
    (reasoningTrace?.goal_derivation && reasoningTrace.goal_derivation.length > 0)
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
        <SheetHeader className="p-6 border-b bg-gradient-to-r from-indigo-50 to-white">
          <div className="flex items-center gap-2 text-slate-800">
            <GitBranch className="w-5 h-5 text-indigo-600" />
            <SheetTitle className="text-xl">推理回溯追踪</SheetTitle>
            <Badge variant="outline" className="ml-1 text-xs text-indigo-600 border-indigo-200 bg-indigo-50">
              Reasoning Trace
            </Badge>
          </div>
          <SheetDescription className="text-slate-500 mt-1">
            AI 意图分析过程的结构化推理链路，包含输入信号解析、意图推导逻辑、目标拆分依据。
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-white">
          {!hasData ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
              <GitBranch className="w-10 h-10 mb-3 opacity-20" />
              <p className="text-sm">暂无推理回溯数据</p>
              <p className="text-xs mt-1 text-slate-300">请先选择一个已分析的事件</p>
            </div>
          ) : (
            <>
              {/* Section 1: Input Analysis */}
              {reasoningTrace?.input_analysis && (
                <SectionCard
                  icon={<Search className="w-4 h-4" />}
                  title="输入信号解析"
                  subtitle="Input Analysis — 对原始输入的信号提取与语义标注"
                  accent="blue"
                >
                  <div className="bg-white rounded-md border border-slate-100 px-3 py-1">
                    <FieldRow label="发件人信号" value={reasoningTrace.input_analysis.sender_signal} />
                    <FieldRow label="时间信号" value={reasoningTrace.input_analysis.time_signal} />
                    <FieldRow label="标题信号" value={reasoningTrace.input_analysis.subject_signal} />
                    <FieldRow label="正文信号" value={reasoningTrace.input_analysis.body_signal} />
                  </div>
                </SectionCard>
              )}

              {/* Section 2: Intent Derivation */}
              {reasoningTrace?.intent_derivation && (
                <SectionCard
                  icon={<ChevronRight className="w-4 h-4" />}
                  title="意图推导过程"
                  subtitle="Intent Derivation — 从信号到核心意图的推导链路"
                  accent="purple"
                >
                  <div className="space-y-3">
                    {reasoningTrace.intent_derivation.key_clues &&
                      reasoningTrace.intent_derivation.key_clues.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1">
                            <Tag className="w-3 h-3" /> 关键线索
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {reasoningTrace.intent_derivation.key_clues.map((clue, idx) => (
                              <span
                                key={idx}
                                className="inline-block bg-purple-50 border border-purple-100 text-purple-700 text-xs rounded px-2 py-1 leading-tight"
                              >
                                {clue}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                    {reasoningTrace.intent_derivation.reasoning_logic && (
                      <div>
                        <p className="text-xs font-medium text-slate-500 mb-1.5">推导逻辑</p>
                        <p className="text-sm text-slate-700 bg-white border border-slate-100 rounded-md p-3 leading-relaxed">
                          {reasoningTrace.intent_derivation.reasoning_logic}
                        </p>
                      </div>
                    )}
                  </div>
                </SectionCard>
              )}

              {/* Section 3: Goal Derivation */}
              {reasoningTrace?.goal_derivation && reasoningTrace.goal_derivation.length > 0 && (
                <SectionCard
                  icon={<Target className="w-4 h-4" />}
                  title="目标拆分依据"
                  subtitle="Goal Derivation — 各目标的形成逻辑与来源线索"
                  accent="emerald"
                >
                  <div className="space-y-3">
                    {reasoningTrace.goal_derivation.map((goal, idx) => (
                      <div
                        key={goal.goal_id || idx}
                        className="bg-white border border-slate-100 rounded-md p-3 space-y-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {goal.goal_id || `G${idx + 1}`}
                          </span>
                          <p className="text-sm text-slate-700 leading-relaxed">{goal.derivation_logic}</p>
                        </div>

                        {goal.derived_from && goal.derived_from.length > 0 && (
                          <div className="pl-8 space-y-1">
                            <p className="text-xs text-slate-400 mb-1">来源线索：</p>
                            {goal.derived_from.map((src, sIdx) => (
                              <div
                                key={sIdx}
                                className="text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded px-2 py-1 italic"
                              >
                                "{src}"
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
