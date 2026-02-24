import React, { useState } from "react";
import { 
  Zap, 
  FileText, 
  ShieldAlert, 
  Check, 
  X, 
  Copy, 
  Edit, 
  Play, 
  AlertTriangle,
  ShieldCheck,
  MessageSquare,
  RefreshCw
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface RiskPoint {
  issue: string;
  reason: string;
  suggestion: string;
}

interface ExecutionData {
  strategies: string[];
  draft: string;
  risks: RiskPoint[];
}

const MOCK_DATA: ExecutionData = {
  strategies: [
    "优先回应客户对交期的关注",
    "提供两个交付方案，避免绝对承诺"
  ],
  draft: "Hi 张总，\n\n感谢您的邮件。关于您提到的交期问题，我们非常重视。\n\n目前A方案预计可以在3周内交付，B方案如果加急处理，可以尝试在2.5周内完成，但需要确认部分原材料库存。\n\n我们建议采用A方案以确保质量稳定性。您怎么看？\n\n祝好，\n李四",
  risks: [
    {
      issue: "使用了“确保”措辞",
      reason: "可能构成法律上的交期承诺",
      suggestion: "建议改为“致力于”或“预计”"
    }
  ]
};

interface ExecutionLayerProps {
  onExecute?: () => void;
  hideActionPanel?: boolean;
}

export default function ExecutionLayer({ onExecute, hideActionPanel = false }: ExecutionLayerProps) {
  const [status, setStatus] = useState<"PENDING" | "EXECUTED">("PENDING");
  const [draft, setDraft] = useState(MOCK_DATA.draft);
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  const [draftStatus, setDraftStatus] = useState<"AI_GENERATED" | "HUMAN_MODIFIED">("AI_GENERATED");
  const [rejectedStrategies, setRejectedStrategies] = useState<number[]>([]);

  const handleCopyDraft = () => {
    navigator.clipboard.writeText(draft);
  };

  const handleExecute = () => {
    setStatus("EXECUTED");
    if (onExecute) {
      onExecute();
    }
  };

  const toggleStrategyRejection = (index: number) => {
    if (status === "EXECUTED") return;
    if (rejectedStrategies.includes(index)) {
      setRejectedStrategies(rejectedStrategies.filter(i => i !== index));
    } else {
      setRejectedStrategies([...rejectedStrategies, index]);
    }
  };

  return (
    <Card className={cn("w-full border-slate-200 shadow-sm overflow-hidden transition-all duration-500", 
      status === "EXECUTED" ? "opacity-80 grayscale-[0.5]" : ""
    )}>
      <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn("p-1.5 rounded-md text-white", status === "EXECUTED" ? "bg-green-600" : "bg-purple-600")}>
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">
                Layer 4: AI Expert Execution (专家建议与执行)
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                {status === "EXECUTED" ? "已执行 · 行动指令已下发" : "AI 辅助决策 · 需人工确认执行"}
              </p>
            </div>
          </div>
          <div>
            {status === "EXECUTED" ? (
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
                <Check className="w-3 h-3 mr-1" /> 已执行
              </Badge>
            ) : (
              <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">
                等待决策
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          
          {/* Left Column: Strategy & Risks (4 cols) */}
          <div className="md:col-span-4 bg-slate-50/30 flex flex-col">
            {/* Strategy Section */}
            <div className="p-4 space-y-3 flex-1">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-3.5 h-3.5 text-purple-500" />
                <h3 className="text-xs font-bold uppercase text-purple-600 tracking-wider">策略建议 (Strategy)</h3>
              </div>
              <div className="space-y-2">
                {MOCK_DATA.strategies.map((strategy, index) => {
                  const isRejected = rejectedStrategies.includes(index);
                  return (
                    <div 
                      key={index} 
                      className={cn(
                        "text-sm p-2 rounded border transition-colors relative group",
                        isRejected 
                          ? "bg-slate-100 border-slate-200 text-slate-400 decoration-slate-400" 
                          : "bg-white border-purple-100 text-slate-700 shadow-sm"
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", isRejected ? "bg-slate-300" : "bg-purple-400")} />
                        <span className={isRejected ? "line-through" : ""}>{strategy}</span>
                      </div>
                      
                      {!isRejected && status !== "EXECUTED" && (
                        <button 
                          onClick={() => toggleStrategyRejection(index)}
                          className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-red-500 transition-all"
                          title="不采纳此建议"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                      {isRejected && status !== "EXECUTED" && (
                        <button 
                          onClick={() => toggleStrategyRejection(index)}
                          className="absolute right-1 top-1 p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-green-600 transition-all"
                          title="恢复采纳"
                        >
                          <RefreshCw className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Risks Section */}
            <div className="p-4 space-y-3 bg-red-50/20 flex-1">
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                <h3 className="text-xs font-bold uppercase text-red-600 tracking-wider">合规风险 (Risk)</h3>
              </div>
              <div className="space-y-2">
                {MOCK_DATA.risks.map((risk, index) => (
                  <div key={index} className="text-xs bg-white p-2 rounded border border-red-100 shadow-sm">
                    <div className="font-semibold text-red-700 mb-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {risk.issue}
                    </div>
                    <div className="text-slate-500 mb-1">原因: {risk.reason}</div>
                    <div className="text-green-600 bg-green-50 px-1.5 py-0.5 rounded inline-block">
                      建议: {risk.suggestion}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Draft & Actions (8 cols) */}
          <div className="md:col-span-8 flex flex-col">
            {/* Draft Header */}
            <div className="p-3 border-b border-slate-100 bg-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">AI 草稿输出 (Draft)</h3>
                {draftStatus === "HUMAN_MODIFIED" && (
                  <Badge variant="secondary" className="text-[10px] h-4 px-1 bg-blue-50 text-blue-600 border-blue-100">
                    已人工修改
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                {status !== "EXECUTED" && (
                  <>
                    {!isEditingDraft ? (
                      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setIsEditingDraft(true)}>
                        <Edit className="w-3 h-3 mr-1" /> 编辑
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => setIsEditingDraft(false)}>
                        <Check className="w-3 h-3 mr-1" /> 完成
                      </Button>
                    )}
                  </>
                )}
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleCopyDraft}>
                  <Copy className="w-3 h-3 mr-1" /> 复制
                </Button>
              </div>
            </div>

            {/* Draft Content */}
            <div className="p-4 flex-1 bg-white min-h-[200px]">
              {isEditingDraft ? (
                <Textarea 
                  value={draft}
                  onChange={(e) => {
                    setDraft(e.target.value);
                    setDraftStatus("HUMAN_MODIFIED");
                  }}
                  className="min-h-[180px] font-mono text-sm leading-relaxed resize-none border-slate-200 focus:border-purple-300 focus:ring-purple-100"
                />
              ) : (
                <div className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed font-mono p-2 border border-transparent rounded hover:bg-slate-50 transition-colors">
                  {draft}
                </div>
              )}
            </div>

            {/* Action Panel (Footer) - Conditionally Rendered */}
            {!hideActionPanel && (
              <div className="p-4 bg-slate-50 border-t border-slate-100">
                {status === "EXECUTED" ? (
                  <div className="flex items-center justify-center p-4 text-green-700 bg-green-50 rounded-lg border border-green-200">
                    <Check className="w-5 h-5 mr-2" />
                    <span className="font-semibold">已执行完毕 · {draftStatus === "HUMAN_MODIFIED" ? "人工修正版本" : "AI 原文"}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                        <span>合规检查通过</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                        <span>需人工确认</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-100">
                        稍后处理
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm hover:shadow">
                            <Play className="w-4 h-4 mr-2" />
                            采纳并执行
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>确认执行此行动？</AlertDialogTitle>
                            <AlertDialogDescription>
                              将发送邮件给客户，并更新事件状态为 ACTION_TAKEN。<br/>
                              {draftStatus === "HUMAN_MODIFIED" && <span className="text-blue-600 mt-2 block font-medium">注意：您已对 AI 草稿进行了修改。</span>}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>取消</AlertDialogCancel>
                            <AlertDialogAction onClick={handleExecute} className="bg-purple-600 hover:bg-purple-700">
                              确认执行
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
