import { Incident } from '@shared/types';
import { Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface IncidentListItemProps {
  incident: Incident;
  isSelected: boolean;
  onClick: () => void;
}

const priorityColors = {
  high: 'border-l-eip-alert bg-eip-alert/5',
  medium: 'border-l-eip-warning bg-eip-warning/5', 
  low: 'border-l-slate-300 bg-slate-50'
};

const statusLabels = {
  pending_human: '待人工处理',
  in_progress: '处理中',
  resolved: '已解决',
  automated: 'AI已处理'
};

const statusColors = {
  pending_human: 'bg-eip-alert text-eip-alert-foreground',
  in_progress: 'bg-eip-warning text-eip-warning-foreground',
  resolved: 'bg-eip-success text-eip-success-foreground',
  automated: 'bg-eip-accent text-eip-accent-foreground'
};

export default function IncidentListItem({ incident, isSelected, onClick }: IncidentListItemProps) {
  return (
    <div
      className={`
        border-l-4 p-4 cursor-pointer transition-all duration-200 border-b border-slate-200
        ${priorityColors[incident.priority]}
        ${isSelected ? 'bg-eip-accent/10 shadow-md' : 'hover:bg-slate-100/50'}
      `}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-slate-900 text-sm truncate flex-1 mr-2">
          {incident.title}
        </h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusColors[incident.status]}`}>
          {statusLabels[incident.status]}
        </span>
      </div>
      
      <div className="flex flex-wrap gap-1 mb-3">
        {incident.involvedEntities.slice(0, 2).map((entity, index) => (
          <span 
            key={index}
            className="text-xs px-2 py-1 bg-slate-200 text-slate-700 rounded-md"
          >
            {entity.value}
          </span>
        ))}
        {incident.involvedEntities.length > 2 && (
          <span className="text-xs px-2 py-1 bg-slate-200 text-slate-700 rounded-md">
            +{incident.involvedEntities.length - 2}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center">
          <Clock className="w-3 h-3 mr-1" />
          {formatDistanceToNow(incident.timestamp, { addSuffix: true, locale: zhCN })}
        </div>
        <div className="flex items-center">
          <span className="mr-2">置信度: {incident.aiAnalysis.confidence}%</span>
          <div className="w-8 h-1 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-eip-accent transition-all duration-300"
              style={{ width: `${incident.aiAnalysis.confidence}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
