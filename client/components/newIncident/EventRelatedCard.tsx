import { User, Building, Briefcase, Users, Mail, Globe, AlertCircle, HelpCircle } from "lucide-react";
import { DecisionEvent } from "@/components/newIncident/DecisionEventListItem";
import { Button } from "@/components/ui/button";

interface EventRelatedCardProps {
  event: DecisionEvent;
}

const sourceIconMap = {
  mail: Mail,
  web: Globe,
  system: AlertCircle,
  status: HelpCircle,
};

export default function EventRelatedCard({ event }: EventRelatedCardProps) {
  const SourceIcon = sourceIconMap[event.icon] || HelpCircle;

  // Determine source type label if not explicitly provided (fallback)
  const sourceType = event.icon === 'mail' ? 'Email' : 
                     event.icon === 'web' ? 'Web Activity' : 
                     event.icon === 'system' ? 'System' : 'Unknown';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* 1. Customer Mini-Card */}
      <div className="md:col-span-1">
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-start gap-3 hover:border-slate-200 transition-colors cursor-pointer group"
             onClick={() => console.log("Navigate to customer", event.customer.id)}>
          <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-105 transition-transform">
             <Building className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
             <div className="flex items-center gap-2 mb-0.5">
               <h4 className="text-sm font-bold text-slate-900 truncate">{event.customer.name}</h4>
             </div>
             <div className="flex items-center gap-1.5">
               {event.customer.type && (
                 <span className="inline-flex px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-medium rounded">
                   {event.customer.type}
                 </span>
               )}
               <span className="text-[10px] text-slate-400">ID: {event.customer.id}</span>
             </div>
          </div>
        </div>
      </div>

      {/* 2. Metadata Grid */}
      <div className="md:col-span-2 grid grid-cols-3 gap-4 items-center">
         {/* Source */}
         <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">来源渠道</span>
            <div className="flex items-center gap-2">
               <SourceIcon className="w-4 h-4 text-slate-500" />
               <span className="text-sm font-medium text-slate-700">{sourceType}</span>
            </div>
         </div>

         {/* Owner */}
         {event.sales_rep && (
           <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">负责人</span>
              <div className="flex items-center gap-2">
                 <User className="w-4 h-4 text-slate-500" />
                 <span className="text-sm font-medium text-slate-700">{event.sales_rep}</span>
              </div>
           </div>
         )}

         {/* Team */}
         {event.team && (
           <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">所属团队</span>
              <div className="flex items-center gap-2">
                 <Users className="w-4 h-4 text-slate-500" />
                 <span className="text-sm font-medium text-slate-700">{event.team}</span>
              </div>
           </div>
         )}
      </div>
    </div>
  );
}
