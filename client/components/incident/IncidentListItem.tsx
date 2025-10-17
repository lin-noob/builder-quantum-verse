import { Incident } from '@shared/types';
import { Clock, Zap, AlertTriangle } from 'lucide-react';
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

// 优先级徽章颜色（沿用现有颜色映射）
const priorityBadgeColors = {
  high: 'bg-eip-alert text-eip-alert-foreground',
  medium: 'bg-eip-warning text-eip-warning-foreground',
  low: 'bg-slate-500 text-slate-50'
};

const priorityLabels = {
  high: '高',
  medium: '中',
  low: '低'
};

// 处理进度徽章文案（与详情页一致）
const progressLabels = {
  pending_human: '待处理',
  in_progress: '处理中',
  resolved: '已完成',
  automated: 'AI全自动处理中'
};

const progressColors = {
  pending_human: 'bg-eip-alert text-eip-alert-foreground',
  in_progress: 'bg-eip-warning text-eip-warning-foreground',
  resolved: 'bg-eip-success text-eip-success-foreground',
  automated: 'bg-eip-warning text-eip-warning-foreground'
};

export default function IncidentListItem({ incident, isSelected, onClick }: IncidentListItemProps) {
  const hasPendingApproval = Array.isArray(incident.processingHistory)
    && incident.processingHistory.some(a => a.id === 'act_approval_pending');
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
        <div className="flex items-center gap-1 whitespace-nowrap">
          {/* 优先级徽章 */}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityBadgeColors[incident.priority]}`}>
            {priorityLabels[incident.priority]}
          </span>
          {/* 处理进度徽章（自动化时显示闪电） */}
          <span className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center ${progressColors[incident.status]}`}>
            {progressLabels[incident.status]}
            {incident.status === 'automated' && (
              <Zap className="w-3 h-3 ml-1" />
            )}
          </span>
          {/* 待审批标识（基于处理记录中的 act_approval_pending） */}
          {hasPendingApproval && (
            <span className="px-2 py-1 rounded-full text-xs font-medium inline-flex items-center bg-eip-warning text-eip-warning-foreground">
              待审批
              <AlertTriangle className="w-3 h-3 ml-1" />
            </span>
          )}
      </div>
      </div>
  
      {/* 事件描述（替换原标签展示，过长省略）*/}
      <p className="text-xs text-slate-700 mb-3 truncate">
        {incident.description ? incident.description : '暂无描述'}
      </p>

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
