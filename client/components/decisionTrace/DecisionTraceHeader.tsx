import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Pause, Square, RotateCcw, Clock, Mail, Hash, Activity } from 'lucide-react';
import { cn } from "@/lib/utils";
import { DecisionTraceState } from './types';

interface DecisionTraceHeaderProps {
  traceId: string;
  sourceType: string;
  triggerTime: string;
  currentState: DecisionTraceState;
  onAction: (action: string) => void;
}

const STEP_LABELS: Record<string, string> = {
  intent: '意图识别',
  data: '数据准备',
  reasoning: '数据推理',
  action: '执行动作',
  result: '结果记录'
};

const STATUS_LABELS: Record<string, { label: string, className: string }> = {
  IN_PROGRESS: { label: '进行中', className: 'bg-blue-100 text-blue-700' },
  WAITING_CONFIRMATION: { label: '需要人工确认', className: 'bg-amber-100 text-amber-700' },
  COMPLETED: { label: '已完成', className: 'bg-green-100 text-green-700' },
  TERMINATED: { label: '已终止', className: 'bg-slate-100 text-slate-700' },
  PAUSED: { label: '已暂停', className: 'bg-yellow-100 text-yellow-700' }
};

const SOURCE_LABELS: Record<string, string> = {
  CUSTOMER_EMAIL_RECEIVED: '新邮件',
  CUSTOMER_WEB_ACTIVITY: '网站行为',
  SYSTEM_FLAG_RAISED: '系统标记',
  STATUS_CHANGED: '状态变更'
};

export default function DecisionTraceHeader({ traceId, sourceType, triggerTime, currentState, onAction }: DecisionTraceHeaderProps) {
  const currentStatus = currentState.overallStatus || 'IN_PROGRESS';
  const statusConfig = STATUS_LABELS[currentStatus] || STATUS_LABELS.IN_PROGRESS;
  const currentStepIndex = ['intent', 'data', 'reasoning', 'action', 'result'].indexOf(currentState.currentStep) + 1;

  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Left: Identity & Status */}
        <div className="flex flex-col gap-2">
          {/* Identity Line */}
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5" />
              <span className="font-mono text-slate-600">{traceId}</span>
            </div>
            <div className="h-3 w-[1px] bg-slate-200" />
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              <span>{SOURCE_LABELS[sourceType] || sourceType}</span>
            </div>
            <div className="h-3 w-[1px] bg-slate-200" />
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{triggerTime}</span>
            </div>
          </div>

          {/* Status Line */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-700">
                Step {currentStepIndex}
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-sm font-medium text-slate-900">
                {STEP_LABELS[currentState.currentStep]}
              </span>
            </div>
            <Badge variant="secondary" className={cn("px-2 py-0.5 text-xs font-medium border-0", statusConfig.className)}>
              {statusConfig.label}
            </Badge>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2">
           <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={() => onAction('continue')}>
             <Play className="w-3.5 h-3.5" />
             继续推进
           </Button>
           <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={() => onAction('pause')}>
             <Pause className="w-3.5 h-3.5" />
             暂停决策
           </Button>
           <Button variant="outline" size="sm" className="h-8 gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => onAction('terminate')}>
             <Square className="w-3.5 h-3.5" />
             终止决策
           </Button>
           <div className="w-[1px] h-6 bg-slate-200 mx-1" />
           <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-slate-600" onClick={() => onAction('playback')}>
             <RotateCcw className="w-3.5 h-3.5" />
             进入回放模式
           </Button>
        </div>
      </div>
    </div>
  );
}
