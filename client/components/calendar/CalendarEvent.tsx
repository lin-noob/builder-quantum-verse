import { Task } from '@shared/types';
import { mockIncidents } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar, ExternalLink, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Link } from 'react-router-dom';

interface CalendarEventProps {
  task: Task;
  onClick?: () => void;
}

const priorityColors = {
  high: 'bg-eip-alert border-eip-alert text-white',
  medium: 'bg-eip-warning border-eip-warning text-eip-warning-foreground',
  low: 'bg-slate-400 border-slate-400 text-white'
};

export default function CalendarEvent({ task, onClick }: CalendarEventProps) {
  const parentIncident = mockIncidents.find(inc => inc.id === task.parentIncidentId);
  const priority = parentIncident?.priority || 'low';
  
  const eventTime = task.scheduledTime || (task.dueDate ? {
    start: task.dueDate,
    end: task.dueDate
  } : null);

  if (!eventTime) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div
          className={`
            px-2 py-1 rounded-md text-xs cursor-pointer transition-all duration-200
            hover:scale-105 hover:shadow-md border-l-4 mb-1
            ${priorityColors[priority]}
            ${task.status === 'completed' ? 'opacity-60' : ''}
          `}
          onClick={onClick}
        >
          <div className="flex items-center justify-between">
            <span className="font-medium truncate flex-1">
              {task.title}
            </span>
            <Avatar className="w-4 h-4 ml-1 flex-shrink-0">
              <AvatarImage src={task.assignee.avatarUrl} />
              <AvatarFallback className="text-xs">
                {task.assignee.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
          
          {task.scheduledTime && (
            <div className="text-xs opacity-75 mt-1">
              {format(task.scheduledTime.start, 'HH:mm')} - {format(task.scheduledTime.end, 'HH:mm')}
            </div>
          )}
        </div>
      </PopoverTrigger>
      
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          {/* Task Header */}
          <div>
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 flex-1 mr-2">
                {task.title}
              </h4>
              <Badge 
                variant="outline" 
                className={`${task.status === 'completed' ? 'bg-eip-success text-white' : 'bg-eip-warning text-eip-warning-foreground'}`}
              >
                {task.status === 'completed' ? '已完成' : '待处理'}
              </Badge>
            </div>
            
            {/* Assignee */}
            <div className="flex items-center space-x-2">
              <Avatar className="w-6 h-6">
                <AvatarImage src={task.assignee.avatarUrl} />
                <AvatarFallback className="text-xs bg-eip-accent text-white">
                  {task.assignee.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                负责人: {task.assignee.name}
              </span>
            </div>
          </div>

          {/* Time Information */}
          <div className="space-y-2">
            {task.scheduledTime && (
              <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                <Calendar className="w-4 h-4 mr-2" />
                <span>
                  排期时间: {format(task.scheduledTime.start, 'yyyy年MM月dd日 HH:mm', { locale: zhCN })} - {format(task.scheduledTime.end, 'HH:mm')}
                </span>
              </div>
            )}
            
            {task.dueDate && (
              <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                <Clock className="w-4 h-4 mr-2" />
                <span>
                  截止时间: {format(task.dueDate, 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
                </span>
              </div>
            )}
          </div>

          {/* Parent Incident */}
          {parentIncident && (
            <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
              <div className="text-xs text-slate-500 dark:text-slate-500 mb-1">所属案例</div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex-1 mr-2">
                  {parentIncident.title}
                </span>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${priorityColors[parentIncident.priority].replace('border-', 'border-').replace('bg-', 'text-')}`}
                >
                  {parentIncident.priority === 'high' ? '高优先级' : parentIncident.priority === 'medium' ? '中等' : '低优先级'}
                </Badge>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-2 pt-2">
            <Link to={`/?incident=${parentIncident?.id}`}>
              <Button size="sm" variant="outline" className="flex-1">
                <ExternalLink className="w-4 h-4 mr-2" />
                查看完整案例
              </Button>
            </Link>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
