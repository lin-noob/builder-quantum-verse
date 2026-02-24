import { Mail, Globe, AlertCircle, RefreshCw, Clock, User, CheckCircle2, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

// Define the DecisionEvent type based on user requirements
export interface DecisionEvent {
  id: string;
  type: "CUSTOMER_EMAIL_RECEIVED" | "CUSTOMER_WEB_ACTIVITY" | "SYSTEM_FLAG_RAISED" | "STATUS_CHANGED";
  type_label: string;
  icon: "mail" | "web" | "system" | "status";
  customer: {
    id: string;
    name: string;
    type?: string;
  };
  ai_initial_judgement: string;
  status: "NEW" | "AI_ANALYZED" | "HUMAN_REVIEWED" | "ACTION_TAKEN" | "DISMISSED";
  occurred_at: string;
  ai_analyzed_at?: string | null;
  has_human_override: boolean;
  source_url?: string;
  sales_rep?: string;
  team?: string;
}

interface DecisionEventListItemProps {
  event: DecisionEvent;
  isSelected: boolean;
  onClick: () => void;
}

const statusConfig = {
  NEW: { label: '新事件', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  AI_ANALYZED: { label: 'AI 已分析', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  HUMAN_REVIEWED: { label: '人工已复核', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  ACTION_TAKEN: { label: '已执行', color: 'bg-green-100 text-green-700 border-green-200' },
  DISMISSED: { label: '已忽略', color: 'bg-slate-100 text-slate-600 border-slate-200' },
};

const iconMap = {
  mail: Mail,
  web: Globe,
  system: AlertCircle,
  status: RefreshCw,
};

export default function DecisionEventListItem({ event, isSelected, onClick }: DecisionEventListItemProps) {
  const StatusIcon = iconMap[event.icon] || HelpCircle;
  const statusStyle = statusConfig[event.status] || statusConfig.NEW;

  return (
    <div
      className={cn(
        "group relative flex flex-col gap-2 p-4 border-b border-slate-200 cursor-pointer transition-colors hover:bg-slate-50",
        isSelected && "bg-blue-50/50 border-l-4 border-l-blue-600"
      )}
      onClick={onClick}
    >
      {/* Row 1: Facts */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          <StatusIcon className="w-4 h-4 text-slate-500 shrink-0" />
          <span className="font-medium text-slate-900 text-sm truncate" title={event.type_label}>
            {event.type_label}
          </span>
        </div>
        <div className="shrink-0 max-w-[40%] text-right">
          <span className="text-sm text-blue-600 hover:underline truncate block" title={event.customer.name}>
            {event.customer.name}
          </span>
        </div>
      </div>

      {/* Row 2: AI Initial Judgment (Weakened) */}
      <div className="text-xs text-slate-500 truncate pl-6">
        {event.ai_initial_judgement}
      </div>

      {/* Row 3: Status & Time */}
      <div className="flex items-center justify-between pl-6 mt-1">
        <span className={cn("text-[10px] px-2 py-0.5 rounded border font-medium", statusStyle.color)}>
          {statusStyle.label}
        </span>
        <span className="text-xs text-slate-400 flex items-center gap-1">
           {event.has_human_override && (
            <span className="flex items-center text-amber-600" title="有人工修正">
              <User className="w-3 h-3 mr-0.5" />
            </span>
          )}
          {format(new Date(event.occurred_at), 'MM-dd HH:mm')}
        </span>
      </div>

      {/* Hover Info Overlay */}
      <div className="hidden group-hover:flex absolute top-2 right-2 bg-slate-900/90 text-white text-[10px] px-2 py-1.5 rounded shadow-lg items-center gap-3 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200 z-10 pointer-events-none">
        <div className="flex items-center gap-1">
          <span className="opacity-70">AI 分析:</span>
          <span className="font-mono">{event.ai_analyzed_at ? format(new Date(event.ai_analyzed_at), 'HH:mm:ss') : '-'}</span>
        </div>
        {event.has_human_override ? (
          <div className="flex items-center text-amber-400 font-medium">
            <User className="w-3 h-3 mr-1" />
            <span>有人工修正</span>
          </div>
        ) : (
          <div className="flex items-center text-slate-400">
             <span>无人工修正</span>
          </div>
        )}
      </div>
    </div>
  );
}
