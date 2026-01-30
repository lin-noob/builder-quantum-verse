import { Mail, Globe, AlertCircle, RefreshCw, HelpCircle, ExternalLink } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { DecisionEvent } from "@/components/incidentCopy/DecisionEventListItem";

interface EventFactCardProps {
  event: DecisionEvent;
}

const iconMap = {
  mail: Mail,
  web: Globe,
  system: AlertCircle,
  status: RefreshCw,
};

export default function EventFactCard({ event }: EventFactCardProps) {
  const StatusIcon = iconMap[event.icon] || HelpCircle;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Icon Container: 40x40px circle-like with light background */}
        <div className="flex items-center justify-center w-12 h-12 bg-white border border-slate-200 rounded-full shadow-sm text-blue-600">
          <StatusIcon className="w-6 h-6" />
        </div>
        
        <div>
          <h3 className="text-xl font-bold text-slate-900 leading-tight mb-1">
            {event.type_label}
          </h3>
          <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
             <span>{format(new Date(event.occurred_at), 'yyyy-MM-dd HH:mm')}</span>
          </p>
        </div>
      </div>
      
      {event.source_url && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-slate-500 hover:text-blue-600 hover:bg-blue-50 gap-1.5"
          onClick={() => window.open(event.source_url, '_blank')}
        >
          查看原始事件
          <ExternalLink className="w-3.5 h-3.5" />
        </Button>
      )}
    </div>
  );
}
