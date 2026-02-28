import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  PlayCircle, 
  CheckCircle2, 
  Clock, 
  User, 
  Bot, 
  Play, 
  ArrowLeft, 
  AlertTriangle,
  XCircle,
  FileText,
  Zap,
  Lock,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  ThumbsUp,
  ThumbsDown,
  MessageSquare
} from 'lucide-react';
import { DecisionTraceState, ActionItem } from './types';
import { cn } from '@/lib/utils';

interface Step4Props {
  state: DecisionTraceState;
  onUpdate: (updates: Partial<DecisionTraceState['execution']>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step4ActionExecution: React.FC<Step4Props> = ({ state, onUpdate, onNext, onBack }) => {
  const { execution } = state;
  const { actions, status, generationInfo } = execution;

  // --- Derived State ---
  const aiActions = useMemo(() => actions.filter(a => a.type === 'ai_executable'), [actions]);
  const humanActions = useMemo(() => actions.filter(a => a.type === 'human_confirm'), [actions]);
  
  const aiPending = aiActions.filter(a => a.status === 'pending' || a.status === 'executing');
  const aiCompleted = aiActions.filter(a => a.status === 'completed' || a.status === 'failed');
  
  const humanPending = humanActions.filter(a => a.status === 'pending');
  const humanCompleted = humanActions.filter(a => a.status === 'approved' || a.status === 'rejected');

  const totalActions = actions.length;
  const completedCount = aiCompleted.length + humanCompleted.length;
  const progressPercent = totalActions > 0 ? (completedCount / totalActions) * 100 : 0;

  // Helper to check if an action is blocked
  const isActionBlocked = (action: ActionItem) => {
    if (!action.dependencies || action.dependencies.length === 0) return false;
    return action.dependencies.some(depId => {
      const depAction = actions.find(a => a.id === depId);
      return !depAction || (depAction.type === 'human_confirm' && depAction.status !== 'approved') || (depAction.type === 'ai_executable' && depAction.status !== 'completed');
    });
  };

  // --- Handlers ---

  const handleAIExecute = (id: string) => {
    const action = actions.find(a => a.id === id);
    if (!action) return;

    // Optimistic update
    const executingActions = actions.map(a => 
      a.id === id ? { ...a, status: 'executing' as const } : a
    );
    onUpdate({ actions: executingActions, status: 'executing' });

    // Simulate execution
    setTimeout(() => {
      const completedActions = actions.map(a => 
        a.id === id ? { 
          ...a, 
          status: 'completed' as const, 
          result: '执行成功', 
          timestamp: new Date().toISOString() 
        } : a
      );
      checkAllCompleted(completedActions);
    }, 1000);
  };

  const handleHumanDecision = (id: string, decision: 'approved' | 'rejected', note: string) => {
    const newActions = actions.map(a => 
      a.id === id ? { 
        ...a, 
        status: decision, 
        approvalNote: note,
        approver: '当前用户',
        result: decision === 'approved' ? '已批准' : '已拒绝',
        timestamp: new Date().toISOString()
      } : a
    );
    checkAllCompleted(newActions);
  };

  const handleBatchApproveHuman = () => {
    const newActions = actions.map(a => 
      (a.type === 'human_confirm' && a.status === 'pending') ? {
        ...a,
        status: 'approved' as const,
        approvalNote: '批量批准',
        approver: '当前用户',
        result: '已批准',
        timestamp: new Date().toISOString()
      } : a
    );
    checkAllCompleted(newActions);
  };

  const handleBatchExecuteAI = () => {
    const executableActions = actions.filter(a => 
      a.type === 'ai_executable' && 
      a.status === 'pending' && 
      !isActionBlocked(a)
    );
    if (executableActions.length === 0) return;

    const executingIds = executableActions.map(a => a.id);
    const executingActions = actions.map(a => 
      executingIds.includes(a.id) ? { ...a, status: 'executing' as const } : a
    );
    onUpdate({ actions: executingActions, status: 'executing' });

    setTimeout(() => {
      const completedActions = actions.map(a => 
        executingIds.includes(a.id) ? { 
          ...a, 
          status: 'completed' as const, 
          result: '批量执行成功', 
          timestamp: new Date().toISOString() 
        } : a
      );
      checkAllCompleted(completedActions);
    }, 1500);
  };

  const checkAllCompleted = (currentActions: ActionItem[]) => {
    const allDone = currentActions.every(a => 
      ['completed', 'approved', 'rejected', 'failed'].includes(a.status)
    );
    onUpdate({ 
      actions: currentActions,
      status: allDone ? 'completed' : 'executing'
    });
  };

  // --- Render ---

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      
      {/* 1. Sticky Top Bar */}
      <div className="flex items-center justify-between gap-4 p-3 bg-slate-50 border border-slate-200 rounded-lg sticky top-0 z-10 shadow-sm backdrop-blur-sm bg-opacity-90 mb-4">
        {/* Left: Status & Meta */}
        <div className="flex items-center gap-3 min-w-[200px]">
           <div className={cn("p-2 rounded-full bg-white border", status === 'completed' ? "bg-green-100 text-green-700 border-green-200" : "bg-blue-100 text-blue-700 border-blue-200")}>
             {status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
           </div>
           <div className="flex flex-col leading-tight">
             <span className="text-base font-bold text-slate-900">
               {status === 'completed' ? '执行完毕' : '执行动作'}
             </span>
             <div className="flex items-center gap-2 text-sm tracking-wider text-slate-500">
               <span className="flex items-center gap-0.5"><Bot className="w-3 h-3" /> {generationInfo?.generator || 'AI'}</span>
              <span className="w-[1px] h-2 bg-slate-300"></span>
              <span>{generationInfo?.generatedAt?.split(' ')[1] || '刚刚'}</span>
            </div>
           </div>
        </div>

        {/* Center: Progress Bar */}
        <div className="flex-1 max-w-md flex flex-col gap-1">
          <div className="flex justify-between text-sm text-slate-500 px-0.5">
            <span>执行进度</span>
            <span className="font-medium text-slate-700">{completedCount} / {totalActions}</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={cn("h-full transition-all duration-500 ease-out", status === 'completed' ? "bg-green-500" : "bg-blue-500")} 
              style={{ width: `${progressPercent}%` }} 
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 min-w-[200px] justify-end">
           <Button variant="ghost" size="sm" onClick={onBack} className="text-slate-500 hover:text-slate-800">
             <ArrowLeft className="w-4 h-4 mr-1" /> 上一步
           </Button>
           
           {status !== 'completed' && (
             <Button 
               size="sm"
               onClick={handleBatchExecuteAI}
               disabled={aiPending.filter(a => !isActionBlocked(a)).length === 0}
               className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
             >
               <Play className="w-4 h-4 mr-1.5" /> 批量执行 AI
             </Button>
           )}

           {status === 'completed' && (
             <Button size="sm" onClick={onNext} className="bg-green-600 hover:bg-green-700 text-white shadow-sm animate-pulse">
               下一步 <CheckCircle2 className="w-4 h-4 ml-1.5" />
             </Button>
           )}
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className={cn(
          "grid gap-6 h-full",
          (aiActions.length === 0 || humanActions.length === 0) ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"
        )}>
          
          {/* Left Column: AI Actions */}
          {aiActions.length > 0 && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-500" /> 自动处理
                  <Badge variant="secondary" className="bg-slate-100 text-slate-600 ml-1">{aiPending.length}</Badge>
                </h3>
              </div>

              <div className="space-y-3">
                {aiPending.length === 0 && aiCompleted.length === 0 && (
                   <div className="text-center py-8 text-slate-400 text-sm bg-white rounded-lg border border-dashed border-slate-200">无 AI 任务</div>
                )}

                {/* Pending List */}
                {aiPending.map(action => (
                  <AIActionItem 
                    key={action.id} 
                    action={action} 
                    isBlocked={isActionBlocked(action)} 
                    onExecute={() => handleAIExecute(action.id)} 
                  />
                ))}

                {/* Completed List (Collapsible) */}
                {aiCompleted.length > 0 && (
                  <CompletedSection title="已执行完成" count={aiCompleted.length}>
                    {aiCompleted.map(action => (
                      <AIActionItem key={action.id} action={action} isBlocked={false} onExecute={() => {}} />
                    ))}
                  </CompletedSection>
                )}
              </div>
            </div>
          )}

          {/* Right Column: Human Actions */}
          {humanActions.length > 0 && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <User className="w-4 h-4 text-orange-500" /> 需您审批
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700 ml-1">{humanPending.length}</Badge>
                </h3>
                {humanPending.length > 1 && (
                  <Button variant="ghost" size="sm" onClick={handleBatchApproveHuman} className="h-7 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                    全部批准
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                {humanPending.length === 0 && humanCompleted.length === 0 && (
                   <div className="text-center py-8 text-slate-400 text-sm bg-white rounded-lg border border-dashed border-slate-200">无人工待办任务</div>
                )}

                {/* Pending List */}
                {humanPending.map(action => (
                  <HumanActionItem 
                    key={action.id} 
                    action={action} 
                    onDecide={(d, n) => handleHumanDecision(action.id, d, n)} 
                  />
                ))}

                 {/* Completed List (Collapsible) */}
                 {humanCompleted.length > 0 && (
                  <CompletedSection title="已处理完成" count={humanCompleted.length}>
                    {humanCompleted.map(action => (
                      <HumanActionItem 
                        key={action.id} 
                        action={action} 
                        onDecide={() => {}} 
                      />
                    ))}
                  </CompletedSection>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

// --- Sub Components ---

const AIActionItem = ({ action, isBlocked, onExecute }: { action: ActionItem; isBlocked: boolean; onExecute: () => void }) => {
  const isCompleted = action.status === 'completed';
  const isExecuting = action.status === 'executing';

  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-lg border bg-white shadow-sm transition-all",
      isCompleted ? "border-green-100 bg-green-50/30" : 
      isBlocked ? "border-slate-100 bg-slate-50 opacity-70" : "border-slate-200 hover:border-blue-300"
    )}>
      {/* Icon */}
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border",
        isCompleted ? "bg-green-100 text-green-600 border-green-200" :
        isExecuting ? "bg-blue-100 text-blue-600 border-blue-200 animate-pulse" :
        isBlocked ? "bg-slate-100 text-slate-400 border-slate-200" :
        "bg-blue-50 text-blue-600 border-blue-100"
      )}>
        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : 
         isExecuting ? <Clock className="w-4 h-4 animate-spin" /> : 
         isBlocked ? <Lock className="w-4 h-4" /> :
         <Zap className="w-4 h-4" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn("text-base font-medium truncate", isCompleted ? "text-slate-600" : "text-slate-900")}>
            {action.description}
          </span>
          {isBlocked && (
            <span className="text-sm tracking-wider bg-amber-50 text-amber-600 px-1.5 rounded border border-amber-100 whitespace-nowrap">
              等待前序步骤
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5 text-sm text-slate-500">
           <span className="flex items-center gap-1 bg-slate-100 px-1.5 rounded text-sm tracking-wider">{action.actionType?.toUpperCase()}</span>
           <span className="truncate">对象: {action.targetObject}</span>
        </div>
      </div>

      {/* Action */}
      <div className="flex-shrink-0">
        {!isCompleted && !isExecuting && !isBlocked && (
          <Button size="sm" onClick={onExecute} className="h-7 w-7 p-0 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-200 shadow-none">
            <Play className="w-3.5 h-3.5 ml-0.5" />
          </Button>
        )}
        {isCompleted && <span className="text-sm text-green-600 font-medium">已完成</span>}
      </div>
    </div>
  );
};

const HumanActionItem = ({ action, onDecide }: { action: ActionItem; onDecide: (d: 'approved' | 'rejected', n: string) => void }) => {
  const isPending = action.status === 'pending';
  const isApproved = action.status === 'approved';
  const isRejected = action.status === 'rejected';
  
  const [isRejecting, setIsRejecting] = useState(false);
  const [note, setNote] = useState('');

  return (
    <div className={cn(
      "group rounded-lg border shadow-sm transition-all bg-white",
      isApproved ? "border-green-200 bg-green-50/30" :
      isRejected ? "border-red-200 bg-red-50/30" :
      "border-orange-200 hover:shadow-md hover:border-orange-300"
    )}>
      {/* Main Content */}
      <div className="p-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
             <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-sm tracking-wider px-1.5 h-5 text-orange-600 bg-orange-50 border-orange-100">
                  {action.role}
                </Badge>
                <h4 className={cn("text-base font-bold", !isPending ? "text-slate-600" : "text-slate-900")}>
                  {action.description}
                </h4>
             </div>
             
             {/* Impact Highlight */}
             <div className="mt-2 text-sm bg-slate-50 p-2 rounded border border-slate-100 text-slate-600">
               <span className="font-semibold text-slate-800 mr-1">决策影响:</span>
               {action.impact}
             </div>

             {/* Result Display */}
             {!isPending && (
               <div className="mt-2 flex items-center gap-2 text-sm">
                 <span className={cn("font-bold flex items-center gap-1", isApproved ? "text-green-600" : "text-red-600")}>
                   {isApproved ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                   {isApproved ? '已批准' : '已拒绝'}
                 </span>
                 {action.approvalNote && <span className="text-slate-400">- {action.approvalNote}</span>}
                 <span className="text-slate-300">|</span>
                 <span className="text-slate-400">{action.timestamp?.split('T')[1]?.substring(0,5)}</span>
               </div>
             )}
          </div>

          {/* Actions */}
          {isPending && (
            <div className="flex flex-col gap-2 min-w-[80px]">
               {!isRejecting ? (
                 <>
                   <Button 
                     size="sm" 
                     className="h-8 bg-green-600 hover:bg-green-700 text-white w-full"
                     onClick={() => onDecide('approved', '')}
                   >
                     批准
                   </Button>
                   <Button 
                     size="sm" 
                     variant="ghost"
                     className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50 w-full"
                     onClick={() => setIsRejecting(true)}
                   >
                     拒绝
                   </Button>
                 </>
               ) : (
                 <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 text-slate-500 w-full"
                    onClick={() => setIsRejecting(false)}
                  >
                    取消
                  </Button>
               )}
            </div>
          )}
        </div>

        {/* Reject Input Area */}
        {isRejecting && isPending && (
          <div className="mt-3 pt-3 border-t border-slate-100 animate-in slide-in-from-top-2 duration-200">
            <Textarea 
              placeholder="请输入拒绝理由 (必填)..." 
              className="text-sm min-h-[60px] mb-2 resize-none"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              autoFocus
            />
            <Button 
              size="sm" 
              className="w-full h-7 bg-red-600 hover:bg-red-700 text-white text-sm"
              disabled={!note.trim()}
              onClick={() => onDecide('rejected', note)}
            >
              确认拒绝
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const CompletedSection = ({ title, count, children }: { title: string; count: number; children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="mt-4 border-t border-slate-200 pt-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-600 transition-colors w-full mb-3"
      >
        {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        {title} ({count})
      </button>
      {isOpen && <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">{children}</div>}
    </div>
  );
};
