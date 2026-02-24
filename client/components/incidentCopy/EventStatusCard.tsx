import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { DecisionEvent } from "@/components/incidentCopy/DecisionEventListItem";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EventStatusCardProps {
  event: DecisionEvent;
}

const STATUS_FLOW = [
  { key: "NEW", label: "New", desc: "新事件接入" },
  { key: "AI_ANALYZED", label: "AI Analyzed", desc: "AI 已完成分析" },
  { key: "HUMAN_REVIEWED", label: "Human", desc: "人工已复核" },
  { key: "ACTION_TAKEN", label: "Action", desc: "已采取行动" },
  { key: "DISMISSED", label: "Dismissed", desc: "已忽略" }
] as const;

export default function EventStatusCard({ event }: EventStatusCardProps) {
  const getStatusState = (statusKey: string) => {
    if (event.status === statusKey) return "current";
    // Define simple flow order for demo
    const order = ["NEW", "AI_ANALYZED", "HUMAN_REVIEWED", "ACTION_TAKEN", "DISMISSED"];
    const currentIndex = order.indexOf(event.status);
    const thisIndex = order.indexOf(statusKey);
    
    // Special case for DISMISSED which might branch off
    if (event.status === "DISMISSED" && statusKey !== "DISMISSED") return "passed"; 
    if (statusKey === "DISMISSED" && event.status !== "DISMISSED") return "future";

    if (thisIndex < currentIndex) return "passed";
    return "future";
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Top Row: Status Badge + Action Buttons */}
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Current Status</span>
            <Badge 
              variant="secondary" 
              className={cn(
                "px-2.5 py-0.5 text-xs font-semibold border",
                event.status === "AI_ANALYZED" ? "bg-blue-50 text-blue-700 border-blue-200" :
                event.status === "NEW" ? "bg-slate-100 text-slate-700 border-slate-200" :
                "bg-green-50 text-green-700 border-green-200"
              )}
            >
              {event.status === "AI_ANALYZED" ? "AI Analyzed" : event.status}
            </Badge>
         </div>
         
         <div className="flex gap-2">
           {event.status === "AI_ANALYZED" && (
             <>
               <Button size="sm" className="h-6 text-[10px] bg-slate-900 text-white hover:bg-slate-800 shadow-sm px-2.5">
                 <Check className="w-3 h-3 mr-1" />
                 Review
               </Button>
               <Button size="sm" variant="outline" className="h-6 text-[10px] text-slate-600 border-slate-300 hover:bg-slate-50 px-2.5">
                 <X className="w-3 h-3 mr-1" />
                 Dismiss
               </Button>
             </>
           )}
            {event.status === "NEW" && (
             <Button size="sm" variant="secondary" disabled className="h-6 text-[10px] opacity-80 px-2.5">
               <Clock className="w-3 h-3 mr-1" />
               Waiting for AI...
             </Button>
           )}
         </div>
      </div>

      {/* Bottom Row: Simplified Visual Progress Stepper */}
      <div className="flex items-center gap-1 w-full pt-1">
         {STATUS_FLOW.map((step, index) => {
           const state = getStatusState(step.key);
           
           if (step.key === "DISMISSED" && event.status !== "DISMISSED") return null;
           if (step.key === "ACTION_TAKEN" && event.status === "DISMISSED") return null;

           const isLast = index === STATUS_FLOW.length - 1 || 
                          (step.key === "DISMISSED" && event.status === "DISMISSED") ||
                          (step.key === "ACTION_TAKEN" && event.status === "ACTION_TAKEN");

           return (
             <div key={step.key} className="flex items-center flex-1 last:flex-none">
               <div className="flex items-center gap-2">
                 <div className={cn(
                   "w-2 h-2 rounded-full transition-all",
                   state === "current" ? "bg-blue-600 ring-2 ring-blue-100" : 
                   state === "passed" ? "bg-blue-600" : "bg-slate-200"
                 )} />
                 <span className={cn(
                   "text-[10px] font-semibold uppercase tracking-wide transition-colors whitespace-nowrap",
                   state === "current" ? "text-blue-700" : 
                   state === "passed" ? "text-slate-700" : "text-slate-400"
                 )}>
                   {step.label}
                 </span>
               </div>
               
               {!isLast && (
                 <div className={cn(
                   "h-[1px] w-full mx-2",
                   state === "passed" ? "bg-blue-200" : "bg-slate-100"
                 )} />
               )}
             </div>
           );
         })}
      </div>
    </div>
  );
}
