import { Mail, Globe, AlertCircle, RefreshCw, User, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export interface DecisionTraceItem {
  id: string;
  instanceId: string;
  businessId: string;
  businessType: string;
  sourceChannel: string;
  customerId: string;
  customerName: string;
  currentStatus: string;
  gmtCreate: string;
  gmtModified: string;
  tenantId: string;
  actionType?: string | null;
  aiAnalysisResult?: string | null;
  analyzedBy?: string | null;
  decisionRemark?: string | null;
  eventTime?: string | null;
  ownerName?: string | null;
  ownerTeam?: string | null;
  instanceName?: string;
  semanticSummary?: string;
  expertBriefing?: string;
  sortingEngine?: string;
  dataInference?: string;
  statusCode?: string | null;
  statusName?: string | null;
  engine?: any;
  status?: number | string;
}

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
  instanceId: string;
  source_url?: string;
  sales_rep?: string;
  team?: string;
  instanceName?: string;
  semanticSummary?: any;
  expertBriefing?: any;
  sortingEngine?: any;
  dataInference?: any;
  semanticSummaryWord?: string;
  expertBriefingWord?: string;
  sortingEngineWord?: string;
  inferenceWord?: string;
  trace_status?: string;
  current_step?: number;
}

interface DecisionEventListItemProps {
  event: DecisionEvent;
  isSelected: boolean;
  onClick: () => void;
}

const statusConfig = {
  NEW: { label: "NEW", color: "bg-blue-100 text-blue-700 border-blue-200" },
  AI_ANALYZED: { label: "AI_ANALYZED", color: "bg-purple-100 text-purple-700 border-purple-200" },
  HUMAN_REVIEWED: { label: "HUMAN_REVIEWED", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  ACTION_TAKEN: { label: "ACTION_TAKEN", color: "bg-green-100 text-green-700 border-green-200" },
  DISMISSED: { label: "DISMISSED", color: "bg-slate-100 text-slate-600 border-slate-200" },
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
        isSelected && "bg-blue-50/50 border-l-4 border-l-blue-600",
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
      <div className="text-xs text-slate-500 truncate pl-6">{event.ai_initial_judgement}</div>

      {/* Row 3: Status & Time */}
      <div className="flex items-center justify-between pl-6 mt-1">
        {event.current_step ? (
          <span className="text-[10px] px-2 py-0.5 rounded border font-medium bg-blue-100 text-blue-700 border-blue-200 whitespace-nowrap">
            {
              {
                1: "意图分析",
                2: "数据准备",
                3: "数据推理",
                4: "执行动作",
                5: "结果回溯",
              }[event.current_step]
            }
          </span>
        ) : (
          <span className={cn("text-[10px] px-2 py-0.5 rounded border font-medium", statusStyle.color)}>
            {event.status}
          </span>
        )}
        <span className="text-xs text-slate-400 flex items-center gap-1">
          {event.has_human_override && (
            <span className="flex items-center text-amber-600" title="有人工修正">
              <User className="w-3 h-3 mr-0.5" />
            </span>
          )}
          {format(new Date(event.occurred_at), "yyyy-MM-dd HH:mm")}
        </span>
      </div>
    </div>
  );
}
