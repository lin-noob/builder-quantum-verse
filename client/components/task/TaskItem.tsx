import { Task } from '@shared/types';
import { allMockTasks, mockIncidents } from '@/data/mockData';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Clock, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow, isAfter, format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Link } from 'react-router-dom';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (taskId: string) => void;
  onSchedule?: (taskId: string) => void;
}

export default function TaskItem({ task, onToggleComplete, onSchedule }: TaskItemProps) {
  const parentIncident = [
    ...mockIncidents
  ].find(inc => inc.id === task.parentIncidentId);

  const isOverdue = task.dueDate && isAfter(new Date(), task.dueDate) && task.status !== 'completed';
  const isCompleted = task.status === 'completed';

  return (
    <div className={`
      border rounded-lg p-4 transition-all duration-200 hover:shadow-md
      ${isCompleted ? 'bg-slate-50 dark:bg-slate-800/50' : 'bg-white dark:bg-slate-800'}
      ${isOverdue ? 'border-eip-alert/50 bg-eip-alert/5' : 'border-slate-200 dark:border-slate-700'}
    `}>
      <div className="flex items-start space-x-3">
        {/* Checkbox */}
        <Checkbox
          checked={isCompleted}
          onCheckedChange={() => onToggleComplete(task.id)}
          className="mt-1"
        />

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          {/* Title and Status */}
          <div className="flex items-start justify-between mb-2">
            <h3 className={`
              font-medium text-slate-900 dark:text-slate-100 flex-1 mr-2
              ${isCompleted ? 'line-through text-slate-500' : ''}
            `}>
              {task.title}
            </h3>
            <Badge variant={isCompleted ? 'secondary' : 'default'} className="whitespace-nowrap">
              {isCompleted ? '已完成' : '待处理'}
            </Badge>
          </div>

          {/* Parent Incident Link */}
          {parentIncident && (
            <Link
              to={`/?incident=${parentIncident.id}`}
              className="inline-flex items-center text-xs text-eip-accent hover:text-eip-accent/80 mb-2"
            >
              <span className="bg-eip-accent/10 px-2 py-1 rounded-md hover:bg-eip-accent/20 transition-colors">
                📋 {parentIncident.title}
              </span>
            </Link>
          )}

          {/* Due Date and Schedule Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm">
              {/* Due Date */}
              {task.dueDate && (
                <div className={`flex items-center ${isOverdue ? 'text-eip-alert' : 'text-slate-600 dark:text-slate-400'}`}>
                  {isOverdue && <AlertTriangle className="w-4 h-4 mr-1" />}
                  <Clock className="w-4 h-4 mr-1" />
                  <span>
                    截止: {format(task.dueDate, 'MM/dd HH:mm')}
                    {isOverdue && (
                      <span className="ml-1 font-medium">
                        (已超期 {formatDistanceToNow(task.dueDate, { locale: zhCN })})
                      </span>
                    )}
                  </span>
                </div>
              )}

              {/* Scheduled Time */}
              {task.scheduledTime && (
                <div className="flex items-center text-eip-accent">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>
                    已排期: {format(task.scheduledTime.start, 'MM/dd HH:mm')} - {format(task.scheduledTime.end, 'HH:mm')}
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              {/* Schedule Button */}
              {!task.scheduledTime && !isCompleted && onSchedule && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onSchedule(task.id)}
                  className="text-eip-accent hover:text-eip-accent/80"
                >
                  <Calendar className="w-4 h-4 mr-1" />
                  排期
                </Button>
              )}

              {/* Assignee Avatar */}
              <div className="flex items-center">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={task.assignee.avatarUrl} alt={task.assignee.name} />
                  <AvatarFallback className="text-xs bg-eip-accent text-white">
                    {task.assignee.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
