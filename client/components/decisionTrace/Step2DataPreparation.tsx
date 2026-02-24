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

  const toggleCandidate = (id: string) => {
    const newCandidates = candidates.map(c => 
      c.id === id ? { ...c, isSelected: !c.isSelected } : c
    );
    onUpdate({ candidates: newCandidates });
  };

  // Helper to get status of a specific goal
  const getGoalStatus = (goalId: string) => {
    // Check if any candidates are selected
    const goalCandidates = candidates.filter(c => c.goalId === goalId && c.isSelected);
    if (goalCandidates.length === 0) return 'INCOMPLETE';

    // Check for blocking issues
    const goalIssues = integrityIssues.filter(i => i.goalId === goalId);
    const hasBlockingIssues = goalIssues.some(i => i.severity === 'high' || i.type === 'missing_field' || i.type === 'conflict');
    
    if (hasBlockingIssues) {
      // Check if manually confirmed
      const isConfirmed = dataPreparation.confirmedGoalIds?.includes(goalId);
      return isConfirmed ? 'CONFIRMED_WITH_RISK' : 'INCOMPLETE';
    }

    return 'COMPLETE';
  };

  const handleConfirmGoalRisk = (goalId: string) => {
    const currentConfirmed = dataPreparation.confirmedGoalIds || [];
    if (!currentConfirmed.includes(goalId)) {
      onUpdate({ confirmedGoalIds: [...currentConfirmed, goalId] });
    }
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
    onUpdate({ candidates: candidates.filter(c => c.id !== candidateId) });
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
           <div className="h-4 w-[1px] bg-slate-300 mx-1"></div>
           <Button 
             size="sm"
             onClick={handleGlobalContinueClick}
             disabled={anyIncomplete}
             className={cn(
               "gap-1.5 shadow-sm min-w-[140px]",
               anyIncomplete 
                ? "bg-slate-100 text-slate-400 border-slate-200" 
                : hasRisk 
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

          return (
            <Card key={goal.id} className={cn(
              "border shadow-sm transition-all duration-200",
              goalStatus === 'COMPLETE' ? "border-slate-200 bg-white" : 
              goalStatus === 'CONFIRMED_WITH_RISK' ? "border-amber-200 bg-amber-50/10" : "border-slate-300 bg-white"
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
                     goalStatus === 'CONFIRMED_WITH_RISK' ? "bg-amber-500" : "bg-slate-300"
                   )}></div>
                   
                   <div className="space-y-0.5">
                     <div className="flex items-center gap-2">
                       <span className="text-base font-semibold text-slate-800">{goal.description}</span>
                       <Badge className={cn("text-sm tracking-wider h-5 px-1.5 font-normal border", 
                        goalStatus === 'COMPLETE' ? "bg-green-50 text-green-700 border-green-200" :
                        goalStatus === 'CONFIRMED_WITH_RISK' ? "bg-amber-50 text-amber-700 border-amber-200" :
                        "bg-slate-100 text-slate-500 border-slate-200"
                      )}>
                         {goalStatus === 'COMPLETE' ? '已就绪' : 
                          goalStatus === 'CONFIRMED_WITH_RISK' ? '已确认例外' : '需处理'}
                       </Badge>
                     </div>
                     <div className="flex items-center gap-1.5 text-sm text-slate-400">
                       <Database className="w-3 h-3" />
                       <span>需 {req?.fields?.length || 0} 项信息</span>
                       <span>·</span>
                       <span>匹配到 {goalCandidates.length} 个对象</span>
                     </div>
                   </div>
                 </div>

                 <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400">
                   {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                 </Button>
              </div>

              {/* Collapsible Content */}
              {isExpanded && (
                <div className="p-4 space-y-4 bg-slate-50/30">
                  
                  {/* [A] Data Requirements (Collapsed Info) */}
                  <div className="flex items-start gap-2 p-3 rounded bg-slate-50 border border-slate-100 text-sm text-slate-600">
                    <Info className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div className="space-y-1 flex-1">
                      <span className="font-medium text-slate-700">AI 数据需求分析:</span>
                      <p className="leading-relaxed opacity-90">{req?.description}</p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {req?.fields?.map(field => (
                          <span key={field} className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-sm tracking-wider text-slate-500 font-mono">
                            {field}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* [B] Candidates List (Compact Table) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                       <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                         <Search className="w-3 h-3" /> 匹配数据对象
                       </h4>
                       <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleAddCandidate(goal.id); }} className="h-6 text-sm tracking-wider px-2 text-blue-600 hover:bg-blue-50">
                         <Plus className="w-3 h-3 mr-1" /> 添加对象
                       </Button>
                    </div>

                    {goalCandidates.length > 0 ? (
                      <div className="border rounded-md bg-white overflow-hidden">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
                            <tr>
                              <th className="w-8 p-2 text-center">#</th>
                              <th className="p-2 font-medium">相关业务对象</th>
                              <th className="p-2 font-medium">数据来源</th>
                              <th className="p-2 font-medium">就绪状态</th>
                              <th className="w-10 p-2 text-center">操作</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {goalCandidates.map(candidate => (
                              <tr key={candidate.id} className={cn("group hover:bg-slate-50 transition-colors", candidate.isSelected && "bg-blue-50/30")}>
                                <td className="p-2 text-center">
                                  <Checkbox 
                                    checked={candidate.isSelected}
                                    onCheckedChange={() => toggleCandidate(candidate.id)}
                                    className="scale-75 translate-y-0.5"
                                  />
                                </td>
                                <td className="p-2">
                                  <div className="font-medium text-slate-700">{candidate.name}</div>
                                  <div className="text-sm tracking-wider text-slate-400 font-mono">{candidate.id}</div>
                                </td>
                                <td className="p-2">
                                  <Badge variant="outline" className="text-sm tracking-wider h-5 px-1.5 font-normal text-slate-500 bg-slate-50">
                                    {candidate.type}
                                  </Badge>
                                </td>
                                <td className="p-2">
                                   {(candidate.missingFields && candidate.missingFields.length > 0) ? (
                                     <div className="flex items-center gap-1.5 text-red-600">
                                       <XCircle className="w-3 h-3" />
                                       <span className="text-sm tracking-wider">缺 {candidate.missingFields.length} 字段</span>
                                     </div>
                                   ) : (
                                     <div className="flex items-center gap-1.5 text-green-600">
                                       <CheckCircle2 className="w-3 h-3" />
                                       <span className="text-sm tracking-wider">完整</span>
                                     </div>
                                   )}
                                </td>
                                <td className="p-2 text-center">
                                  <button 
                                    onClick={() => handleRemoveCandidate(candidate.id)}
                                    className="text-slate-300 hover:text-red-500 transition-colors p-1"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-6 border border-dashed rounded-md bg-slate-50 text-slate-400 text-sm">
                        暂无候选实例，请点击右上角添加
                      </div>
                    )}
                  </div>

                  {/* [C] Integrity Issues (Exception Driven) */}
                  {goalIssues.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                       <h4 className="text-sm font-bold text-red-500 uppercase tracking-wider flex items-center gap-1.5">
                         <AlertTriangle className="w-3 h-3" /> 发现问题
                       </h4>
                       <div className="space-y-2">
                         {goalIssues.map(issue => (
                           <Alert key={issue.id} variant="destructive" className="py-2 bg-red-50 border-red-100 text-red-800">
                             <AlertTriangle className="h-3.5 w-3.5" />
                             <AlertTitle className="text-sm font-bold ml-2">
                               {issue.type === 'missing_field' ? '字段缺失' : issue.type === 'conflict' ? '数据冲突' : '警告'}
                             </AlertTitle>
                             <AlertDescription className="text-sm ml-2 mt-1 opacity-90">
                               {issue.description}
                               {issue.affectedInstanceId && (
                                 <span className="block mt-0.5 text-sm tracking-wider opacity-75 font-mono">Instance: {issue.affectedInstanceId}</span>
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
                             onClick={() => handleConfirmGoalRisk(goal.id)}
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
        })}
      </div>
    </div>
  );
};
