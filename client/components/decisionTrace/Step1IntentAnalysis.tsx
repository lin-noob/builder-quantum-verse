import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, AlertCircle, CheckCircle2, Circle, AlertTriangle, Play, XCircle, HelpCircle, RotateCcw } from 'lucide-react';
import { DecisionTraceState, DecisionGoal } from './types';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Step1Props {
  state: DecisionTraceState;
  onUpdate: (updates: Partial<DecisionTraceState['intentAnalysis']>) => void;
  onNext: () => void;
  onTerminate: () => void;
  onRestart: () => void;
}

export const Step1IntentAnalysis: React.FC<Step1Props> = ({ state, onUpdate, onNext, onTerminate, onRestart }) => {
  const { intentAnalysis } = state;
  const isTerminated = intentAnalysis.stepStatus === 'TERMINATED';

  const confidence = intentAnalysis.confidence ?? 0.8;
  let confidenceLabel = '中';
  let confidenceClassName = 'text-amber-600';
  if (confidence >= 0.8) {
    confidenceLabel = '高';
    confidenceClassName = 'text-green-600';
  } else if (confidence < 0.5) {
    confidenceLabel = '低';
    confidenceClassName = 'text-red-600';
  }

  // Helper to mark state as modified
  const markAsModified = (updates: Partial<DecisionTraceState['intentAnalysis']>) => {
    if (isTerminated) return;
    onUpdate({
      ...updates,
      isModified: true,
      stepStatus: 'HUMAN_MODIFIED'
    });
  };

  const handleGoalChange = (id: string, field: keyof DecisionGoal, value: string | boolean) => {
    const newGoals = intentAnalysis.goals.map(g => {
      if (g.id !== id) return g;
      const updated: DecisionGoal = { ...g, [field]: value as any };
      if (field === 'description' && (g.initialSuggestion || g.suggestedNextStep)) {
        updated.isSuggestionStale = true;
      }
      return updated;
    });
    markAsModified({ goals: newGoals });
  };

  const handleAddGoal = () => {
    const newGoal: DecisionGoal = {
      id: `goal_${Date.now()}`,
      description: '新目标',
      initialSuggestion: '',
      isConfirmed: false,
      isEnabled: true,
      source: 'human',
      isSuggestionStale: false
    };
    markAsModified({ goals: [...intentAnalysis.goals, newGoal] });
  };

  const handleDeleteGoal = (id: string) => {
    markAsModified({ goals: intentAnalysis.goals.filter(g => g.id !== id) });
  };

  const handleTerminate = () => {
    onUpdate({
      stepStatus: 'TERMINATED',
      status: 'completed',
      isModified: false
    });
    onTerminate();
  };

  const handleRestart = () => {
    onUpdate({
      stepStatus: 'AI_ANALYZED',
      status: 'pending',
      isModified: false
    });
    onRestart();
  };

  const handleConfirm = () => {
    onUpdate({ 
      stepStatus: 'CONFIRMED',
      status: 'completed'
    });
    onNext();
  };

  // Status Configuration
  const statusConfig = {
    AI_ANALYZED: {
      label: 'AI 已分析',
      icon: AlertCircle,
      className: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    HUMAN_MODIFIED: {
      label: '人工已修改',
      icon: AlertTriangle,
      className: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    TERMINATED: {
      label: '已终止',
      icon: XCircle,
      className: 'bg-slate-100 text-slate-500 border-slate-300'
    },
    CONFIRMED: {
      label: '已确认',
      icon: CheckCircle2,
      className: 'bg-green-50 text-green-700 border-green-200'
    }
  };

  const currentStatus = statusConfig[intentAnalysis.stepStatus || 'AI_ANALYZED'];
  
  // Validation for "Next"
  const enabledGoalsCount = intentAnalysis.goals.filter(g => g.isEnabled).length;
  const canProceed = enabledGoalsCount > 0;

  const [deleteTargetId, setDeleteTargetId] = React.useState<string | null>(null);

  const confirmDeleteGoal = () => {
    if (!deleteTargetId) return;
    markAsModified({ goals: intentAnalysis.goals.filter(g => g.id !== deleteTargetId) });
    setDeleteTargetId(null);
  };

  return (
    <div className="flex flex-col h-full gap-4 relative">
      
      {/* 1. Sticky Top Action Bar (Compact) */}
      <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg sticky top-0 z-10 shadow-sm backdrop-blur-sm bg-opacity-90">
         {/* Left: Core Intent Input (Integrated) */}
            <div className="flex items-center gap-3 flex-1 mr-4">
            <div className="flex flex-col gap-0.5">
               <span className="text-sm uppercase tracking-wider font-bold text-slate-400">核心意图</span>
               <div className="flex items-center gap-2">
                 <Badge variant="outline" className={cn("text-sm px-1.5 h-5 font-normal border", currentStatus.className)}>
                   {currentStatus.label}
                 </Badge>
                 {intentAnalysis.isModified && intentAnalysis.stepStatus !== 'CONFIRMED' && intentAnalysis.stepStatus !== 'TERMINATED' && (
                    <span className="text-sm text-amber-600 bg-amber-50 px-1 rounded">需确认</span>
                 )}
               </div>
               <span className="text-xs text-slate-500">
                 AI 信心：
                 <span className={cn("ml-1 font-medium", confidenceClassName)}>
                   {confidenceLabel}
                 </span>
               </span>
            </div>
            
            <div className="flex-1 relative max-w-xl">
              <Input 
                value={intentAnalysis.coreIntent} 
                onChange={(e) => markAsModified({ coreIntent: e.target.value })}
                disabled={isTerminated}
                className={cn(
                  "h-9 text-base font-medium pr-20",
                  isTerminated
                    ? "border-slate-200 bg-slate-50 text-slate-500"
                    : "border-slate-300 focus-visible:ring-blue-500"
                )}
                placeholder="请输入核心意图..."
              />
              <Badge className={cn(
                "absolute right-2 top-2 text-sm px-1.5 py-0 h-5 font-normal border pointer-events-none",
                intentAnalysis.urgency === 'High' ? "bg-red-50 text-red-700 border-red-200" :
                intentAnalysis.urgency === 'Medium' ? "bg-amber-50 text-amber-700 border-amber-200" :
                "bg-blue-50 text-blue-700 border-blue-200"
              )}>
                {intentAnalysis.urgency === 'High' ? '高' : intentAnalysis.urgency === 'Medium' ? '中' : '低'}
              </Badge>
            </div>
         </div>

         {/* Right: Actions */}
         <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600">
                    <HelpCircle className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-sm p-3 space-y-1">
                  <p className="font-bold">推进规则说明：</p>
                  <ul className="list-disc pl-3 space-y-0.5 opacity-90">
                    <li>若无任何目标被启用，<span className="text-red-300">禁止进入步骤 2</span>。</li>
                    <li>若您修改过目标或意图，系统将记录为「人工干预」状态。</li>
                  </ul>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button 
              variant="ghost" 
              size="sm" 
              className={cn(
                "gap-1 px-2",
                isTerminated
                  ? "text-slate-400 cursor-not-allowed"
                  : "text-red-600 hover:text-red-700 hover:bg-red-50"
              )}
              onClick={handleTerminate}
              disabled={isTerminated}
            >
              <XCircle className="w-4 h-4" />
              <span className="hidden sm:inline">终止</span>
            </Button>
            {isTerminated && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-slate-700 border-slate-300 hover:bg-slate-50"
                onClick={handleRestart}
              >
                <RotateCcw className="w-4 h-4" />
                重启
              </Button>
            )}
            <Button 
              size="sm" 
              className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              onClick={handleConfirm}
              disabled={!canProceed || isTerminated}
            >
              <Play className="w-4 h-4" />
              确认并继续
            </Button>
         </div>
      </div>

      {/* 2. Goal List (Compact Table Layout) */}
      <div className="space-y-3 pb-20">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
            目标拆解清单
            <Badge variant="secondary" className="text-sm font-normal text-slate-500 bg-slate-100">
              {enabledGoalsCount} 启用
            </Badge>
          </h3>
          <Button size="sm" variant="outline" onClick={handleAddGoal} className="h-7 text-sm bg-white text-blue-600 border-blue-200 hover:bg-blue-50">
            <Plus className="w-3 h-3 mr-1" /> 新增目标
          </Button>
        </div>

        <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
          <table className="w-full text-sm text-left">
             <thead className="bg-slate-50 border-b border-slate-100 text-sm text-slate-500 uppercase tracking-wider">
               <tr>
                 <th className="w-12 p-3 text-center">启用</th>
                 <th className="w-10 p-3 text-center">#</th>
                 <th className="p-3">目标描述</th>
                 <th className="w-12 p-3 text-center">操作</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
               {intentAnalysis.goals.map((goal, idx) => (
                 <tr 
                   key={goal.id} 
                   className={cn(
                     "group transition-colors",
                     goal.isEnabled ? "hover:bg-blue-50/30" : "bg-slate-50/50 opacity-60 hover:opacity-100"
                   )}
                 >
                   {/* Col 1: Enable Switch */}
                   <td className="p-3 text-center align-top pt-4">
                     <Switch 
                       checked={goal.isEnabled}
                       onCheckedChange={(checked) => handleGoalChange(goal.id, 'isEnabled', checked)}
                       disabled={isTerminated}
                       className="scale-75 data-[state=checked]:bg-blue-600"
                     />
                   </td>
                   
                   {/* Col 2: Index */}
                   <td className="p-3 text-center align-top pt-4">
                     <div className={cn(
                       "w-5 h-5 rounded-full flex items-center justify-center text-sm tracking-wider font-bold mx-auto",
                       goal.isEnabled ? "bg-blue-100 text-blue-600" : "bg-slate-200 text-slate-400"
                     )}>
                       {idx + 1}
                     </div>
                   </td>

                   {/* Col 3: Description & AI Suggestion */}
                   <td className="p-3">
                     <div className="space-y-1.5">
                      <Input 
                         value={goal.description} 
                         onChange={(e) => handleGoalChange(goal.id, 'description', e.target.value)}
                         disabled={!goal.isEnabled || isTerminated}
                         className={cn(
                           "h-9 text-base font-medium transition-all",
                           goal.isEnabled && !isTerminated
                            ? "border-slate-200 focus-visible:ring-blue-500 bg-white" 
                            : "border-transparent bg-transparent px-0 shadow-none text-slate-500"
                         )}
                         placeholder="请输入目标描述..."
                       />
                      {goal.source === 'human' ? (
                        <div className="px-1">
                          <span className="inline-flex items-center rounded-full border border-dashed border-slate-300 px-2 py-0.5 text-[11px] text-slate-500">
                            人工添加目标
                          </span>
                        </div>
                      ) : goal.isSuggestionStale ? (
                        <div className="px-1">
                          <span className="inline-flex items-center rounded-full border border-dashed border-slate-300 px-2 py-0.5 text-[11px] text-slate-500">
                            人工修改目标
                          </span>
                        </div>
                      ) : (goal.initialSuggestion || goal.suggestedNextStep) ? (
                        <div className="flex flex-col gap-0.5 px-1">
                          <div className="flex items-start gap-1.5">
                            <span className="text-sm font-bold text-indigo-400 uppercase tracking-wider mt-0.5 flex-shrink-0">
                              AI 建议:
                            </span>
                            <div className="flex-1 space-y-0.5">
                              {goal.initialSuggestion && (
                                <p className="text-sm text-slate-500 leading-tight">
                                  {goal.initialSuggestion}
                                </p>
                              )}
                            </div>
                          </div>
                          {goal.suggestedNextStep && (
                            <div className="flex items-start gap-1.5">
                              <span className="text-xs text-slate-400 flex-shrink-0 mt-0.5">下一步方向:</span>
                              <p className="text-xs text-slate-500 leading-tight">
                                {goal.suggestedNextStep}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : null}
                     </div>
                   </td>

                   {/* Col 4: Delete Action */}
                   <td className="p-3 text-center align-top pt-3">
                    <Button 
                       size="icon" 
                       variant="ghost" 
                       className={cn(
                         "h-8 w-8 text-slate-300 opacity-0 group-hover:opacity-100 transition-all",
                         !isTerminated && "hover:text-red-500 hover:bg-red-50"
                       )}
                      onClick={() => setDeleteTargetId(goal.id)}
                       disabled={isTerminated}
                       title="删除目标"
                     >
                       <Trash2 className="w-4 h-4" />
                     </Button>
                   </td>
                 </tr>
               ))}
             </tbody>
          </table>
          
          {intentAnalysis.goals.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-sm">
               暂无目标，请点击右上角新增
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={!!deleteTargetId} onOpenChange={(open) => !open && setDeleteTargetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除该目标？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作无法撤销，将从当前意图分析中移除该目标及其关联建议。
              {deleteTargetId && (
                <span className="block mt-2 text-sm text-slate-700">
                  目标：{intentAnalysis.goals.find(g => g.id === deleteTargetId)?.description}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteGoal} className="bg-red-600 hover:bg-red-700">
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};
