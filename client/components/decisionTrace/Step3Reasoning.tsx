import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { 
  BrainCircuit, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ShieldCheck, 
  AlertTriangle,
  HelpCircle,
  RotateCcw,
  Database,
  Loader2,
  Play,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { DecisionTraceState, GoalReasoning } from './types';
import { cn } from '@/lib/utils';

interface Step3Props {
  state: DecisionTraceState;
  onUpdate: (updates: Partial<DecisionTraceState['reasoning']>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const Step3Reasoning: React.FC<Step3Props> = ({ state, onUpdate, onNext, onBack }) => {
  const { reasoning, intentAnalysis, dataPreparation } = state;
  const { status, results } = reasoning;

  // Local state for handling "Questionable" input - Removed

  
  // Collapsible state
  const [expandedGoals, setExpandedGoals] = useState<string[]>([]);

  // Initialize expanded goals (Expand items with warnings or questions by default)
  useEffect(() => {
    const goalsToExpand = results
      .filter(r => r.status === 'QUESTIONABLE' || r.status === 'WARNING' || r.status === 'RE_REASON_NEEDED' || r.risks.length > 0)
      .map(r => r.goalId);
    
    // If no specific attention needed, expand the first one
    if (goalsToExpand.length === 0 && results.length > 0) {
      setExpandedGoals([results[0].goalId]);
    } else {
      setExpandedGoals(prev => [...new Set([...prev, ...goalsToExpand])]);
    }
  }, [results.length]); // Run once on load or when result count changes

  const toggleGoalExpand = (goalId: string) => {
    setExpandedGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(id => id !== goalId) 
        : [...prev, goalId]
    );
  };

  // Status Config for Top Bar
  const statusConfig = {
    COMPLETED: { label: '推理完成', icon: CheckCircle2, color: 'bg-green-50 text-green-700 border-green-200' },
    REASONING: { label: '推理中...', icon: BrainCircuit, color: 'bg-blue-50 text-blue-700 border-blue-200' },
    WARNING: { label: '需要人工确认', icon: AlertTriangle, color: 'bg-amber-50 text-amber-700 border-amber-200' },
    PENDING: { label: '未执行', icon: Clock, color: 'bg-slate-50 text-slate-600 border-slate-200' }
  };
  const currentStatus = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;

  // Calculate Progress
  const enabledGoals = intentAnalysis.goals.filter(g => g.isEnabled);
  const acceptedCount = results.filter(r => r.status === 'ACCEPTED').length;
  const progressPercent = enabledGoals.length > 0 ? (acceptedCount / enabledGoals.length) * 100 : 0;

  const handleGoalStatusChange = (goalId: string, newStatus: GoalReasoning['status'], note?: string) => {
    const newResults = results.map(r => {
      if (r.goalId === goalId) {
        return { ...r, status: newStatus, userNote: note };
      }
      return r;
    });
    
    // Check global status update
    const anyWarning = newResults.some(r => r.status === 'QUESTIONABLE');
    const allAccepted = newResults.every(r => r.status === 'ACCEPTED');
    
    onUpdate({
      results: newResults,
      status: anyWarning ? 'WARNING' : (allAccepted ? 'COMPLETED' : 'COMPLETED') 
    });

    if (newStatus === 'RE_REASON_NEEDED') {
        onBack();
    }
    
    // If accepted, collapse this card
    if (newStatus === 'ACCEPTED') {
      setExpandedGoals(prev => prev.filter(id => id !== goalId));
    }
  };

  // Auto-execute reasoning on mount if not started
  useEffect(() => {
    if (status === 'NOT_STARTED') {
      handleExecute();
    }
  }, []);

  const handleExecute = () => {
    onUpdate({ status: 'REASONING' });
    setTimeout(() => {
      onUpdate({ 
        status: 'COMPLETED',
        executedAt: new Date().toISOString(),
      });
      // Auto expand first goal with issues or just first goal
      const firstGoalId = intentAnalysis.goals.find(g => g.isEnabled)?.id;
      if (firstGoalId) setExpandedGoals([firstGoalId]);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full gap-4">

      {/* 1. Sticky Top Navigation & Status Bar */}
      <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg sticky top-0 z-10 shadow-sm backdrop-blur-sm bg-opacity-90">
           {/* Left Side: Status Info */}
           <div className="flex items-center gap-4">
             <div className="flex items-center gap-3">
               <div className={cn("p-2 rounded-full border bg-white", currentStatus.color.replace('bg-', 'border-').replace('text-', 'bg-'))}>
                 <currentStatus.icon className={cn("w-5 h-5", status === 'REASONING' && "animate-spin")} />
               </div>
               <div className="flex flex-col">
                 <span className="text-base font-medium text-slate-900">{currentStatus.label}</span>
                 {status === 'COMPLETED' && (
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                      </div>
                      <span className="text-sm text-slate-500">{acceptedCount} / {enabledGoals.length} 已接受</span>
                    </div>
                 )}
               </div>
             </div>
           </div>

           {/* Right Side: Actions */}
           <div className="flex items-center gap-2">
             <Button variant="ghost" size="sm" onClick={onBack} className="text-slate-600 hover:text-slate-700 hover:bg-slate-100 gap-1.5">
                <ArrowLeft className="w-4 h-4" /> 返回数据准备
             </Button>
             <div className="h-4 w-[1px] bg-slate-300 mx-1"></div>
             
             {status === 'NOT_STARTED' || status === 'REASONING' ? (
                <Button 
                  size="sm"
                  disabled
                  className={cn(
                    "gap-1.5 shadow-sm min-w-[140px]",
                    "bg-blue-600/80 text-white cursor-not-allowed"
                  )}
                >
                   <Loader2 className="w-4 h-4 animate-spin" /> AI 思考中...
                </Button>
             ) : (
               <Button 
                 size="sm"
                 onClick={onNext} 
                 className={cn(
                   "gap-1.5 shadow-sm min-w-[140px]",
                   (status !== 'COMPLETED' && status !== 'WARNING') 
                    ? "bg-slate-100 text-slate-400 border-slate-200" 
                    : "bg-purple-600 hover:bg-purple-700 text-white"
                 )}
                 disabled={status !== 'COMPLETED' && status !== 'WARNING'}
               >
                 <Play className="w-4 h-4" />
                 下一步: 专家建议
               </Button>
             )}
           </div>
        </div>

      {/* 2. Main Content Area */}
      {(status === 'NOT_STARTED' || status === 'REASONING') ? (
        <div className="flex flex-col items-center justify-center h-[400px] text-slate-400 gap-6 border border-dashed border-slate-200 rounded-lg bg-slate-50/50 mx-1">
            <div className="relative">
              <div className={cn("p-6 bg-white rounded-full shadow-sm border border-slate-100", status === 'REASONING' && "animate-pulse")}>
                <BrainCircuit className={cn("w-16 h-16", status === 'REASONING' ? "text-blue-500" : "text-slate-300")} />
              </div>
              {status === 'REASONING' && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full animate-ping" />
              )}
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-medium text-slate-700">
                {status === 'REASONING' ? 'AI 正在分析业务规则与数据...' : '数据准备就绪，等待分析'}
              </h3>
              <p className="text-base text-slate-500 max-w-md">
                正在验证业务规则、生成建议方案并评估潜在风险。
              </p>
            </div>
        </div>
      ) : (
        <div className="space-y-3 pb-8">
        {enabledGoals.map((goal, index) => {
           const result = results.find(r => r.goalId === goal.id);
           const candidates = dataPreparation.candidates.filter(c => c.goalId === goal.id && c.isSelected);
           const isExpanded = expandedGoals.includes(goal.id);
           
           if (!result) return null;

           // Summary stats
           const factCount = result.facts.length;
           const infCount = result.inferences.length;
           const riskCount = result.risks.length;
           
           return (
             <div key={goal.id} className={cn(
               "border rounded-lg transition-all duration-200 bg-white",
               isExpanded ? "shadow-md ring-1 ring-slate-200 border-slate-300" : "shadow-sm border-slate-200 hover:border-slate-300"
             )}>
                {/* Collapsible Header */}
                <div 
                  className={cn(
                    "flex items-center gap-3 p-3 cursor-pointer select-none",
                    isExpanded ? "bg-slate-50/80 border-b border-slate-100 rounded-t-lg" : "hover:bg-slate-50 rounded-lg"
                  )}
                  onClick={() => toggleGoalExpand(goal.id)}
                >
                   <div className={cn(
                     "flex items-center justify-center w-6 h-6 rounded-full text-sm font-bold transition-colors",
                     result.status === 'ACCEPTED' ? "bg-green-100 text-green-700" :
                     result.status === 'QUESTIONABLE' ? "bg-amber-100 text-amber-700" :
                     "bg-slate-800 text-white"
                   )}>
                     {index + 1}
                   </div>
                   
                   <div className="flex-1 min-w-0 grid grid-cols-[1fr_auto] gap-4 items-center">
                     <div className="flex items-center gap-2 min-w-0">
                       <h3 className="text-base font-semibold text-slate-800 truncate" title={goal.description}>
                         目标: {goal.description}
                       </h3>
                       {!isExpanded && (
                         <div className="flex items-center gap-2 text-sm text-slate-400 ml-2">
                           {riskCount > 0 && <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded"><AlertTriangle className="w-3 h-3"/> {riskCount} 风险</span>}
                           <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> {factCount}</span>
                           <span className="flex items-center gap-1"><BrainCircuit className="w-3 h-3"/> {infCount}</span>
                         </div>
                       )}
                     </div>

                     <div className="flex items-center gap-3">
                       {result.status === 'ACCEPTED' && <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1 h-6"><CheckCircle2 className="w-3 h-3" /> 已接受</Badge>}
                       {result.status === 'QUESTIONABLE' && <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1 h-6"><HelpCircle className="w-3 h-3" /> 待确认</Badge>}
                       
                       {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                     </div>
                   </div>
                </div>

                {/* Collapsible Content */}
                {isExpanded && (
                  <div className="animate-in slide-in-from-top-2 duration-200">
                    
                    {/* Risk Section (Top Priority) */}
                    {(result.risks.length > 0 || result.uncertainties.length > 0) && (
                      <div className="p-4 bg-amber-50/40 border-b border-amber-100/50">
                        <h4 className="text-sm font-bold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" /> 潜在风险与待确认项
                        </h4>
                        <div className="space-y-2">
                           {result.risks.map(risk => (
                             <div key={risk.id} className="flex gap-2 text-base bg-white/60 p-2 rounded border border-amber-100">
                               <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                               <div className="flex-1">
                                 <div className="text-amber-900 font-medium text-sm mb-0.5">
                                   触发: {risk.triggerCondition}
                                 </div>
                                 <div className="text-slate-600 text-sm">
                                   影响: {risk.impact} <span className="text-amber-500/50 mx-1">|</span> 概率: {risk.probability}
                                 </div>
                               </div>
                             </div>
                           ))}
                           {result.uncertainties.map((u, i) => (
                             <div key={i} className="flex gap-2 text-sm text-slate-500 pl-2">
                               <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                               <span>分析假设: {u}</span>
                             </div>
                           ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                      
                      {/* Left Column: Facts & Source */}
                      <div className="p-4 space-y-4">
                        {/* Snapshot */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Database className="w-3.5 h-3.5" /> 数据来源
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                             {candidates.length > 0 ? candidates.map(c => (
                               <span key={c.id} className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-sm tracking-wider text-slate-600">
                                 <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                 {c.name}
                               </span>
                             )) : (
                               <span className="text-sm tracking-wider text-slate-400 italic">无关联实例</span>
                             )}
                          </div>
                        </div>

                        {/* Facts List */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5" /> 事实认定
                          </h4>
                          <ul className="space-y-1.5">
                            {result.facts.map(fact => (
                              <li key={fact.id} className="text-sm text-slate-700 pl-2 border-l-2 border-emerald-300 py-0.5 leading-relaxed">
                                {fact.text}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Right Column: Inferences */}
                      <div className="p-4 bg-slate-50/30">
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                           <BrainCircuit className="w-3.5 h-3.5" /> 逻辑推断
                        </h4>
                        <div className="space-y-2">
                          {result.inferences.map(inf => (
                            <div key={inf.id} className="group relative pl-2 border-l-2 border-blue-300 py-0.5 hover:bg-white transition-colors rounded-r">
                               <div className="flex justify-between items-start gap-2">
                                 <span className="text-base text-slate-800 leading-snug">{inf.text}</span>
                                 <span className={cn(
                                   "text-sm tracking-wider px-1 rounded border font-mono shrink-0",
                                   inf.confidence > 0.8 ? "text-green-600 border-green-200 bg-green-50" : "text-amber-600 border-amber-200 bg-amber-50"
                                 )}>
                                   {(inf.confidence * 100).toFixed(0)}%
                                 </span>
                               </div>
                               <div className="text-sm tracking-wider text-slate-400 mt-1 flex items-center gap-1">
                                 <span className="text-blue-400/80">逻辑:</span> {inf.logic}
                               </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* Action Footer */}
                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
                       <div className="flex items-center gap-2 text-sm text-slate-500">
                         {result.status === 'QUESTIONABLE' && <span className="text-amber-700 flex items-center gap-1"><HelpCircle className="w-3 h-3"/> 已标记疑问: {result.userNote}</span>}
                       </div>
                       <div className="flex items-center gap-2">
                          {result.status !== 'ACCEPTED' && (
                            <Button variant="ghost" size="sm" className="h-8 text-sm text-slate-500 hover:text-red-600" onClick={() => handleGoalStatusChange(goal.id, 'RE_REASON_NEEDED')}>
                              <RotateCcw className="w-3.5 h-3.5 mr-1" /> 重试
                            </Button>
                          )}
                          {result.status !== 'ACCEPTED' && (
                            <Button size="sm" className="h-8 text-sm bg-white border border-slate-200 text-green-600 hover:bg-green-50 hover:border-green-300 hover:text-green-700 shadow-sm" onClick={() => handleGoalStatusChange(goal.id, 'ACCEPTED')}>
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> 确认接受
                            </Button>
                          )}
                          {result.status === 'ACCEPTED' && (
                            <Button variant="ghost" size="sm" className="h-8 text-sm text-slate-400" onClick={() => handleGoalStatusChange(goal.id, 'WARNING')}>
                              撤销接受
                            </Button>
                          )}
                       </div>
                    </div>

                  </div>
                )}
             </div>
           );
        })}
        </div>
      )}

    </div>
  );
};
