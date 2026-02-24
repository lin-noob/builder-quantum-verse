import React from 'react';
import { Mail, Globe, AlertCircle, RefreshCw, HelpCircle, User, Calendar, MapPin, ExternalLink } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DecisionEvent } from '@/components/incidentCopy/DecisionEventListItem';

interface DecisionHeaderCardProps {
  event: DecisionEvent;
  className?: string;
}

const iconMap = {
  mail: Mail,
  web: Globe,
  system: AlertCircle,
  status: RefreshCw,
};

export default function DecisionHeaderCard({ event, className }: DecisionHeaderCardProps) {
  const Icon = iconMap[event.icon] || HelpCircle;

  return (
    <div className={cn("px-6 py-4 flex items-start gap-4", className)}>
      {/* Icon */}
      <div className="flex-none p-3 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
        <Icon className="w-6 h-6" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-semibold text-slate-900 truncate">{event.type_label}</h2>
          <div className="flex items-center gap-4">
            {event.source_url && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-sm text-slate-500 hover:text-blue-600 hover:bg-blue-50 gap-1.5 px-2"
                onClick={() => window.open(event.source_url, '_blank')}
              >
                查看原始事件
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            )}
            <div className="text-sm text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {event.occurred_at}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
