import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Database, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  AlertCircle,
  Plus,
  Trash2,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Info,
  XCircle
} from 'lucide-react';
import { DecisionTraceState, DecisionGoal, CandidateInstance, DataIntegrityIssue } from './types';
import { cn } from '@/lib/utils';

interface Step2Props {
  state: DecisionTraceState;
  onUpdate: (updates: Partial<DecisionTraceState['dataPreparation']>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step2DataPreparation: React.FC<Step2Props> = ({ state, onUpdate, onNext, onBack }) => {
  const { dataPreparation, intentAnalysis } = state;
  const { requirements, candidates, integrityIssues } = dataPreparation;

  const [expandedGoals, setExpandedGoals] = useState<string[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // 1. Data Processing per Goal
  const enabledGoals = intentAnalysis.goals.filter(g => g.isEnabled);

  // Initialize expanded goals on first load (expand incomplete ones)
  useEffect(() => {
    const incompleteGoals = enabledGoals
      .filter(g => getGoalStatus(g.id) !== 'COMPLETE')
      .map(g => g.id);
    setExpandedGoals(prev => [...new Set([...prev, ...incompleteGoals])]);
  }, []);

  const toggleGoalExpand = (id: string) => {
    setExpandedGoals(prev => 
      prev.includes(id) ? prev.filter(gId => gId !== id) : [...prev, id]
    );
  };

  // Helper to get status of a specific goal
  const getGoalStatus = (goalId: string) => {
    // Check if any candidates exist
    const goalCandidates = candidates.filter(c => c.goalId === goalId);
    if (goalCandidates.length === 0) return 'INCOMPLETE';

    return 'COMPLETE';
  };

  const handleAddCandidate = (goalId: string) => {
    // Mock adding a candidate
    const newId = `inst_${Date.now()}`;
    const newCandidate: CandidateInstance = {
      id: newId,
      goalId,
      name: `手动实例 ${newId.slice(-4)}`,
      type: '手动',
      isSelected: true,
      data: { manual: true },
      missingFields: []
    };
    onUpdate({ candidates: [...candidates, newCandidate] });
    // Auto expand
    if (!expandedGoals.includes(goalId)) {
      setExpandedGoals(prev => [...prev, goalId]);
    }
  };

  const handleRemoveCandidate = (candidateId: string) => {
    if (confirmDeleteId === candidateId) {
      onUpdate({ candidates: candidates.filter(c => c.id !== candidateId) });
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(candidateId);
      // Auto clear confirmation after 3 seconds
      setTimeout(() => setConfirmDeleteId(null), 3000);
    }
  };

  // Global Status Logic
  const allGoalStatuses = enabledGoals.map(g => ({ id: g.id, status: getGoalStatus(g.id) }));
  const anyIncomplete = allGoalStatuses.some(s => s.status === 'INCOMPLETE');
  const allComplete = allGoalStatuses.every(s => s.status === 'COMPLETE' || s.status === 'CONFIRMED_WITH_RISK');
  const completedCount = allGoalStatuses.filter(s => s.status === 'COMPLETE' || s.status === 'CONFIRMED_WITH_RISK').length;
  
  // Continue Logic
  const handleGlobalContinueClick = () => {
    // Bypass risk dialog as requested
    onUpdate({ status: 'completed', riskNote: undefined }); 
    onNext();
  };

  const hasRisk = allGoalStatuses.some(s => s.status === 'CONFIRMED_WITH_RISK');

  return (
    <div className="flex flex-col h-full gap-6 relative">
      
      {/* 1. Top Navigation & Status Bar */}
      <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg sticky top-0 z-10 shadow-sm backdrop-blur-sm bg-opacity-90">
         {/* Left Side: Progress Info */}
         <div className="flex items-center gap-4">
           <div className="flex items-center gap-2">
             <div className="text-base font-medium text-slate-700">数据就绪进度</div>
             <Badge variant="secondary" className="bg-white border border-slate-200 text-slate-600 font-mono">
               {completedCount} / {enabledGoals.length}
             </Badge>
           </div>
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
           <div className="h-4 w-[1px] bg-slate-300 mx-1"></div>
           <Button 
             size="sm"
             onClick={handleGlobalContinueClick}
             className={cn(
               "gap-1.5 shadow-sm min-w-[140px]",
               hasRisk 
                 ? "bg-amber-600 hover:bg-amber-700 text-white border-amber-600"
                 : "bg-blue-600 hover:bg-blue-700 text-white"
             )}
           >
             <CheckCircle2 className="w-4 h-4" />
             {hasRisk ? "确认并继续" : "确认数据就绪"}
           </Button>
         </div>
      </div>

      {/* 2. Goal List (Vertical Flow) */}
      <div className="space-y-4 pb-20">
        {enabledGoals.map((goal: DecisionGoal) => {
          const req = requirements.find(r => r.goalId === goal.id);
          const goalCandidates = candidates.filter(c => c.goalId === goal.id);
          const goalIssues = integrityIssues.filter(i => i.goalId === goal.id);
          const goalStatus = getGoalStatus(goal.id);
          const isConfirmed = dataPreparation.confirmedGoalIds?.includes(goal.id);
          const isExpanded = expandedGoals.includes(goal.id);

          const hasUnmatchedError = !!goal.unmatchedReason;

          return (
            <Card key={goal.id} className={cn(
              "border shadow-sm transition-all duration-200",
              goalStatus === 'COMPLETE' ? "border-slate-200 bg-white" : 
              goal.unmatchedReason ? "border-red-200 bg-red-50/10" :
              goalStatus === 'CONFIRMED_WITH_RISK' ? "border-amber-200 bg-amber-50/10" : 
              "border-slate-300 bg-white"
            )}>
              {/* Card Header (Click to toggle) */}
              <div 
                className={cn(
                  "flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors",
                  isExpanded && "border-b border-slate-100"
                )}
                onClick={() => toggleGoalExpand(goal.id)}
              >
                 <div className="flex items-center gap-3">
                   {/* Status Indicator Bar */}
                   <div className={cn(
                     "w-1 h-8 rounded-full",
                     goalStatus === 'COMPLETE' ? "bg-green-500" :
                     goal.unmatchedReason ? "bg-red-500" :
                     goalStatus === 'CONFIRMED_WITH_RISK' ? "bg-amber-500" : 
                     "bg-slate-300"
                   )}></div>
                   
                   <div className="space-y-0.5">
                     <div className="flex items-center gap-2">
                       <span className="text-base font-semibold text-slate-800">{goal.description}</span>
                       <Badge className={cn("text-sm tracking-wider h-5 px-1.5 font-normal border", 
                        goalStatus === 'COMPLETE' ? "bg-green-50 text-green-700 border-green-200" :
                        goal.unmatchedReason ? "bg-red-50 text-red-700 border-red-200" :
                        goalStatus === 'CONFIRMED_WITH_RISK' ? "bg-amber-50 text-amber-700 border-amber-200" :
                        "bg-slate-100 text-slate-500 border-slate-200"
                      )}>
                         {goalStatus === 'COMPLETE' ? '已就绪' : 
                          goal.unmatchedReason ? '未匹配' :
                          goalStatus === 'CONFIRMED_WITH_RISK' ? '已确认例外' : '需处理'}
                       </Badge>
                     </div>
                     
                     {/* Match/Unmatch Reason in Header */}
                     {goal.unmatchedReason ? (
                       <div className="flex items-start gap-1.5 text-sm text-red-600">
                         <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                         <span className="opacity-90">{goal.unmatchedReason}</span>
                       </div>
                     ) : goal.matchReason ? (
                       <div className="flex items-start gap-1.5 text-sm text-slate-500">
                         <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
                         <span className="opacity-90">{goal.matchReason}</span>
                       </div>
                     ) : null}
                   </div>
                 </div>

                 <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400">
                   {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                 </Button>
              </div>

              {/* Collapsible Content */}
              {isExpanded && (
                <div className="p-4 space-y-4 bg-slate-50/30">
                  
                  {/* [B] Candidates List (Compact Table) */}
                  {!goal.unmatchedReason && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                       <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                         <Search className="w-3 h-3" /> 匹配知识对象
                       </h4>
                    </div>

                    {goalCandidates.length > 0 ? (
                      <div className="border rounded-md bg-white overflow-hidden">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
                            <tr>
                              <th className="p-2 font-medium pl-4">相关业务实例</th>
                              <th className="p-2 font-medium">知识对象</th>
                              <th className="w-10 p-2 text-center">操作</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {goalCandidates
                              .sort((a, b) => (a.rank || 99) - (b.rank || 99))
                              .map((candidate, index) => (
                              <tr key={candidate.id} className="group hover:bg-slate-50 transition-colors">
                                <td className="p-2 pl-4">
                                  <div className="flex items-start gap-2">
                                     {index === 0 && candidate.rank === 1 && (
                                        <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-100 text-[10px] px-1 h-4 mt-0.5 shrink-0">
                                            Best
                                        </Badge>
                                     )}
                                     <div>
                                        <div className="font-medium text-slate-700">{candidate.name}</div>
                                        <div className="text-sm tracking-wider text-slate-400 font-mono">{candidate.id}</div>
                                        {candidate.matchReason && (
                                            <div className="text-xs text-slate-500 mt-0.5 flex items-start gap-1">
                                                <Info className="w-3 h-3 mt-0.5 shrink-0 opacity-70" />
                                                {candidate.matchReason}
                                            </div>
                                        )}
                                     </div>
                                  </div>
                                </td>
                                <td className="p-2 align-top pt-3">
                                  <Badge variant="outline" className="text-sm tracking-wider h-5 px-1.5 font-normal text-slate-500 bg-slate-50">
                                    {candidate.type}
                                  </Badge>
                                </td>
                                <td className="p-2 text-center align-top pt-2">
                                  <button 
                                    onClick={() => handleRemoveCandidate(candidate.id)}
                                    className={cn(
                                      "transition-colors p-1 flex items-center gap-1 rounded",
                                      confirmDeleteId === candidate.id ? "text-red-600 bg-red-50 px-2" : "text-slate-300 hover:text-red-500"
                                    )}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    {confirmDeleteId === candidate.id && <span className="text-xs font-medium">确认删除?</span>}
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-slate-400 bg-white border border-slate-200 rounded-lg border-dashed">
                        <span className="text-sm">暂无候选实例</span>
                      </div>
                    )}
                  </div>
                  )}

                  {/* [A-2] Manual Description Input */}
                  <div className="space-y-1.5 pt-2">
                    <label className="text-sm font-medium text-slate-700">人工补充说明 (可选)</label>
                    <textarea
                      className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                      placeholder="请输入补充说明..."
                      maxLength={200}
                      value={dataPreparation.goalDescriptions?.[goal.id] || ''}
                      onChange={(e) => {
                        const newDescriptions = { 
                          ...(dataPreparation.goalDescriptions || {}), 
                          [goal.id]: e.target.value 
                        };
                        onUpdate({ goalDescriptions: newDescriptions });
                      }}
                    />
                    <div className="flex justify-end text-xs text-slate-400">
                      {(dataPreparation.goalDescriptions?.[goal.id] || '').length}/200
                    </div>
                  </div>

                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};
