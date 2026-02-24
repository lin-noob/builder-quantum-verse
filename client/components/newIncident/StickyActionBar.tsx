import React, { useState } from "react";
import { 
  Play, 
  Clock, 
  Ban, 
  Check, 
  AlertTriangle,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type EventActionStatus = "AI_ANALYZED" | "HUMAN_REVIEWED" | "ACTION_TAKEN" | "DISMISSED";

interface StickyActionBarProps {
  status: EventActionStatus;
  onAction: (action: EventActionStatus, payload?: any) => void;
}

export default function StickyActionBar({ status, onAction }: StickyActionBarProps) {
  const [dismissReason, setDismissReason] = useState("");
  const isActionTaken = status === "ACTION_TAKEN";
  const isDismissed = status === "DISMISSED";
  const isLocked = isActionTaken || isDismissed;

  const handleDismiss = () => {
    onAction("DISMISSED", { reason: dismissReason });
    setDismissReason("");
  };

  const handleExecute = () => {
    onAction("ACTION_TAKEN");
  };

  return (
    <div className="w-full bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] p-4 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Left Actions (Secondary) */}
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            className="border-slate-200 text-slate-600 hover:bg-slate-50"
            disabled={isLocked}
            onClick={() => onAction("HUMAN_REVIEWED")}
          >
            <Clock className="w-4 h-4 mr-2 text-slate-400" />
            稍后处理
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200"
                disabled={isLocked}
              >
                <Ban className="w-4 h-4 mr-2" />
                标记不适用
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                  确认标记为不适用？
                </AlertDialogTitle>
                <AlertDialogDescription>
                  此事件将被标记为 DISMISSED 并移出待办列表。此操作不可撤销。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-2">
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">忽略原因 (可选)</label>
                <Input 
                  placeholder="例如：误报、重复事件、已通过其他渠道解决..." 
                  value={dismissReason}
                  onChange={(e) => setDismissReason(e.target.value)}
                  className="text-sm"
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction onClick={handleDismiss} className="bg-red-600 hover:bg-red-700">
                  确认忽略
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Center/Status Info */}
        <div className="flex-1 px-8 text-center">
          {isActionTaken && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium border border-green-200 animate-in fade-in zoom-in">
              <Check className="w-3 h-3" />
              已采纳并执行 · Action Taken
            </div>
          )}
          {isDismissed && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200 animate-in fade-in zoom-in">
              <Ban className="w-3 h-3" />
              已忽略 · Dismissed
            </div>
          )}
        </div>

        {/* Right Actions (Primary) */}
        <div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                className={cn(
                  "shadow-sm transition-all duration-300",
                  isLocked ? "opacity-50 cursor-not-allowed" : "hover:shadow-md hover:scale-[1.02]"
                )}
                disabled={isLocked}
                size="default"
              >
                {isActionTaken ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    已执行
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2 fill-current" />
                    采纳并执行
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            
            {!isLocked && (
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>确认执行此决策？</AlertDialogTitle>
                  <AlertDialogDescription className="space-y-3 pt-2">
                    <div className="flex items-start gap-2 text-slate-600 text-sm bg-slate-50 p-3 rounded-md border border-slate-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                      <span>将锁定当前的 <strong>Layer 3: 专家简报</strong> 内容作为行动纲领</span>
                    </div>
                    <div className="flex items-start gap-2 text-slate-600 text-sm bg-slate-50 p-3 rounded-md border border-slate-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                      <span>将使用 <strong>Layer 4: AI 草稿</strong> (含人工修改) 发送邮件/执行动作</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      执行后事件状态将更新为 ACTION_TAKEN，相关内容将不可再编辑。
                    </p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>再想想</AlertDialogCancel>
                  <AlertDialogAction onClick={handleExecute} className="bg-purple-600 hover:bg-purple-700">
                    确认执行
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            )}
          </AlertDialog>
        </div>

      </div>
    </div>
  );
}
