import React from 'react';
import { Check, Circle, Clock } from 'lucide-react';
import { DecisionTraceState, DecisionStep } from './types';
import { cn } from '@/lib/utils';

interface TimelineProps {
  currentState: DecisionTraceState;
  onStepClick: (step: DecisionStep) => void;
}

const steps: { id: DecisionStep; label: string; shortLabel: string }[] = [
  { id: 'intent', label: 'Step 1: 意图分析', shortLabel: '意图' },
  { id: 'data', label: 'Step 2: 数据准备', shortLabel: '数据' },
  { id: 'reasoning', label: 'Step 3: 数据推理', shortLabel: '推理' },
  { id: 'action', label: 'Step 4: 动作执行', shortLabel: '执行' },
  { id: 'result', label: 'Step 5: 结果记录', shortLabel: '结果' },
];

export const TraceTimeline: React.FC<TimelineProps> = ({ currentState, onStepClick }) => {
  const currentStepIndex = steps.findIndex(s => s.id === currentState.currentStep);

  const getStepStatus = (stepId: DecisionStep, index: number) => {
    // Result is special, it's the end state
    if (currentState.result && stepId === 'result') return 'completed';
    
    // Logic based on current active step
    if (index < currentStepIndex) return 'completed';
    if (index === currentStepIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm z-10">
      <div className="max-w-5xl mx-auto">
        <div className="relative flex items-center justify-between">
           {/* Connecting Line Background */}
           <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-100 -z-10" />
           
           {/* Connecting Line Progress (Approximated) */}
           <div 
             className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-blue-100 -z-10 transition-all duration-500" 
             style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
           />

           {steps.map((step, index) => {
             const status = getStepStatus(step.id, index);
             const isActive = status === 'active';
             const isCompleted = status === 'completed';

             return (
               <div 
                 key={step.id} 
                 className="flex flex-col items-center group cursor-pointer"
                 onClick={() => onStepClick(step.id)}
               >
                 {/* Icon Node */}
                 <div 
                   className={cn(
                     "w-8 h-8 rounded-full border-2 flex items-center justify-center bg-white transition-all duration-200 mb-2 relative z-10",
                     isActive ? "border-blue-600 bg-blue-50 text-blue-600 scale-110 shadow-md ring-2 ring-blue-100 ring-offset-2" : 
                     isCompleted ? "border-green-500 bg-green-50 text-green-600" : 
                     "border-slate-200 text-slate-300 group-hover:border-slate-300"
                   )}
                 >
                   {isCompleted ? <Check className="w-4 h-4" /> : 
                    isActive ? <Clock className="w-4 h-4 animate-pulse" /> : 
                    <div className="w-2 h-2 rounded-full bg-slate-200" />}
                 </div>

                 {/* Label */}
                 <div className={cn(
                   "text-xs font-medium transition-colors whitespace-nowrap",
                   isActive ? "text-blue-700 font-bold" : 
                   isCompleted ? "text-green-700" : 
                   "text-slate-400 group-hover:text-slate-600"
                 )}>
                   {step.shortLabel}
                 </div>
                 
                 {/* Full Label on Hover (Optional tooltip logic could be added here) */}
               </div>
             );
           })}
        </div>
      </div>
    </div>
  );
};
