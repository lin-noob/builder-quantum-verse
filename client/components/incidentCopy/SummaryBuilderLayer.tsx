import React, { useState } from "react";
import {
  FileText,
  Target,
  ShieldAlert,
  Edit,
  Plus,
  Lock,
  Unlock,
  Zap,
  List,
  Compass,
  AlertCircle,
  Sparkles,
  ChevronRight,
  MoreVertical,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Types
export interface ExpertBriefingData {
  customer_intent: string;
  business_stage: string;
  reply_recommended: boolean;
  reply_priority: "low" | "medium" | "high";
  suggested_tone: string;
  key_points_to_address: string[];
  suggested_reply_outline: string[];
  risks_or_notes: string[];
  confidence_level: "low" | "medium" | "high";
}

interface SummaryBuilderLayerProps {
  data?: ExpertBriefingData;
  externalLock?: boolean;
}

// Fallback data if none provided
const DEFAULT_BRIEFING: ExpertBriefingData = {
  customer_intent: "正在分析客户意图...",
  business_stage: "分析中",
  reply_recommended: true,
  reply_priority: "medium",
  suggested_tone: "专业且客观",
  key_points_to_address: ["等待 AI 生成关键点..."],
  suggested_reply_outline: ["等待 AI 生成回复大纲..."],
  risks_or_notes: ["正在评估潜在风险..."],
  confidence_level: "high",
};

export default function SummaryBuilderLayer({
  data = DEFAULT_BRIEFING,
  externalLock = false,
}: SummaryBuilderLayerProps) {
  const [locked, setLocked] = useState(externalLock);

  const isLocked = locked || externalLock;

  const priorityMap = {
    low: { label: "一般优先级", color: "bg-slate-100 text-slate-700 border-slate-200" },
    medium: { label: "中等优先级", color: "bg-blue-100 text-blue-700 border-blue-200" },
    high: { label: "高优先级", color: "bg-orange-100 text-orange-700 border-orange-200" },
  };

  const confidenceMap = {
    low: { label: "置信度低", color: "text-slate-400" },
    medium: { label: "置信度中", color: "text-blue-500" },
    high: { label: "置信度高", color: "text-green-600" },
  };

  return (
    <Card className="w-full border-slate-200 shadow-sm overflow-hidden">
      <CardHeader className="pb-3 border-b border-slate-100 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">
                Layer 3: Summary Builder (专家简报)
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">人类决策层 · 此时此地的行动纲领</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isLocked ? (
              <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200 gap-1">
                <Lock className="w-3 h-3" /> 已锁定执行
              </Badge>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-slate-500 hover:text-blue-600"
                onClick={() => setLocked(true)}
              >
                <Unlock className="w-3.5 h-3.5 mr-1" />
                锁定执行
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-8">
        {/* Section 1: Intent & Context */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-tight">
                意图与阶段 (INTENT & CONTEXT)
              </h3>
            </div>
            <div
              className={cn("text-xs font-medium flex items-center gap-1", confidenceMap[data.confidence_level].color)}
            >
              <Sparkles className="w-3 h-3" />
              {confidenceMap[data.confidence_level].label}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400">客户意图</label>
              <p className="text-sm text-slate-800 font-medium leading-relaxed">{data.customer_intent}</p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400">业务阶段</label>
              <div>
                <Badge className="bg-slate-100 text-slate-600 border-none px-3 py-1 font-medium hover:bg-slate-200">
                  {data.business_stage}
                </Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Strategy */}
        <section className="space-y-4 pt-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-tight">回复策略 (STRATEGY)</h3>
          </div>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 p-4 bg-indigo-50/20 rounded-lg border border-indigo-100/50">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">建议回复:</span>
              <Badge className="bg-indigo-600 text-white hover:bg-indigo-700 px-2 h-6 border-none">
                {data.reply_recommended ? "推荐回复" : "谨慎回复"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">优先级:</span>
              <Badge className={cn("px-2 h-6 border", priorityMap[data.reply_priority].color)}>
                {priorityMap[data.reply_priority].label}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">建议基调:</span>
              <div className="flex items-center text-xs text-slate-700 font-medium">
                <span className="mr-1 text-slate-400">🌡️</span> {data.suggested_tone}
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Key Points */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-sky-500" />
              <h3 className="text-sm font-bold text-sky-600 uppercase tracking-tight">关键要点 (KEY POINTS)</h3>
            </div>
            {!isLocked && (
              <Button variant="ghost" size="sm" className="h-6 text-[10px] text-slate-400 hover:text-sky-600">
                <Plus className="w-3 h-3 mr-1" /> 添加
              </Button>
            )}
          </div>

          <div className="space-y-2">
            {data.key_points_to_address.map((point, idx) => (
              <div
                key={idx}
                className="group flex items-center justify-between p-3 bg-white border border-slate-100 rounded-lg hover:border-sky-200 hover:shadow-sm transition-all"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                  <span className="text-sm text-slate-700 leading-snug">{point}</span>
                </div>
                {!isLocked && (
                  <div className="flex items-center opacity-0 group-hover:opacity-100">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-400">
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: Outline */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <List className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-tight">回复大纲 (OUTLINE)</h3>
            </div>
            {!isLocked && (
              <Button variant="ghost" size="sm" className="h-6 text-[10px] text-slate-400 hover:text-slate-600">
                <Plus className="w-3 h-3 mr-1" /> 添加
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {data.suggested_reply_outline.map((item, idx) => (
              <div
                key={idx}
                className="group flex items-start gap-4 p-3 bg-slate-50/50 border border-slate-100 rounded-lg hover:bg-white hover:border-slate-200 transition-colors"
              >
                <div className="mt-0.5 flex items-center justify-center w-5 h-5 rounded-full bg-slate-200 text-slate-500 text-[10px] font-bold">
                  {idx + 1}
                </div>
                <div className="flex-1 text-sm text-slate-600 leading-relaxed">{item}</div>
                {!isLocked && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-slate-400"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Section 5: Risks & Notes */}
        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              <h3 className="text-sm font-bold text-red-600 uppercase tracking-tight">风险提示 (RISKS & NOTES)</h3>
            </div>
            {!isLocked && (
              <Button variant="ghost" size="sm" className="h-6 text-[10px] text-slate-400 hover:text-red-600">
                <Plus className="w-3 h-3 mr-1" /> 添加
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {data.risks_or_notes.map((risk, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 bg-red-50/30 border border-red-100/50 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 leading-relaxed">{risk}</p>
              </div>
            ))}
          </div>
        </section>
      </CardContent>
    </Card>
  );
}
