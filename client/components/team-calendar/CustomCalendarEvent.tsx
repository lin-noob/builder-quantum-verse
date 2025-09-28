import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { 
  Link as LinkIcon, 
  ExternalLink, 
  Clock, 
  Building2, 
  User, 
  Calendar,
  AlertTriangle,
  Lock
} from 'lucide-react';
import { Task, ColorBy } from '@shared/types';
import { getTaskColor, getTaskBorderColor } from '@/data/teamCalendarData';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface CustomCalendarEventProps {
  event: {
    resource: Task;
    title: string;
    start: Date;
    end: Date;
  };
  colorBy: ColorBy;
  isAISuggested?: boolean;
}

export default function CustomCalendarEvent({ event, colorBy, isAISuggested = false }: CustomCalendarEventProps) {
  const task = event.resource;
  const backgroundColor = getTaskColor(task, colorBy);
  const borderColor = getTaskBorderColor(task, colorBy);
  
  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return '高优先级';
      case 'medium': return '中等优先级';
      case 'low': return '低优先级';
      default: return '常规';
    }
  };

  const getTaskTypeLabel = (type: string) => {
    switch (type) {
      case 'call': return '电话';
      case 'email': return '邮件';
      case 'report': return '报告';
      default: return '常规';
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div
          className={`
            h-full text-slate-700 dark:text-slate-200 text-xs cursor-pointer rounded-md
            transition-all duration-200 hover:shadow-md hover:scale-[1.02] relative overflow-hidden
            border-l-4
            ${isAISuggested ? 'border-2 border-dashed border-amber-400/60 bg-opacity-80' : ''}
          `}
          style={{
            backgroundColor,
            borderLeftColor: borderColor
          }}
        >
          {/* AI建议标识 */}
          {isAISuggested && (
            <div className="absolute top-1 right-1 w-3 h-3 bg-amber-400 rounded-full flex items-center justify-center">
              <span className="text-xs text-amber-900">✨</span>
            </div>
          )}

          {/* 外部会议标识 */}
          {task.source === 'external' && (
            <Lock className="absolute top-1 right-1 w-3 h-3 text-slate-500 dark:text-slate-400" />
          )}

          {/* 事件内容 */}
          <div className="flex flex-col h-full p-2">
            {/* 标题 */}
            <div className="font-semibold leading-tight mb-1 truncate text-slate-900 dark:text-slate-100">
              {task.title}
            </div>

            {/* 负责人 */}
            <div className="text-xs text-slate-600 dark:text-slate-300 truncate mb-1">
              {task.assignee.name}
            </div>

            {/* 时间 */}
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-auto">
              {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
            </div>
          </div>
        </div>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg" align="start">
        <div className="space-y-5">
          {/* 任务标题和状态 */}
          <div>
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 flex-1 mr-3 text-base leading-tight">
                {task.title}
              </h4>
              <div className="flex space-x-2">
                {task.source === 'external' && (
                  <Badge variant="outline" className="text-xs border-slate-300 dark:border-slate-600">
                    <Lock className="w-3 h-3 mr-1" />
                    外部会议
                  </Badge>
                )}
                {isAISuggested && (
                  <Badge className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
                    AI建议
                  </Badge>
                )}
              </div>
            </div>

            {/* 负责人信息 */}
            <div className="flex items-center space-x-3 mb-4">
              <Avatar className="w-8 h-8">
                <AvatarImage src={task.assignee.avatarUrl} />
                <AvatarFallback className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  {task.assignee.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {task.assignee.name}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-500">
                  {task.assignee.role}
                </div>
              </div>
            </div>
          </div>

          {/* 时间信息 */}
          <div className="space-y-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
            <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
              <div className="w-8 h-8 bg-slate-100 dark:bg-slate-600 rounded-full flex items-center justify-center mr-3">
                <Calendar className="w-4 h-4" />
              </div>
              <span>
                {format(event.start, 'yyyy年MM月dd日 EEEE', { locale: zhCN })}
              </span>
            </div>
            <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
              <div className="w-8 h-8 bg-slate-100 dark:bg-slate-600 rounded-full flex items-center justify-center mr-3">
                <Clock className="w-4 h-4" />
              </div>
              <span>
                {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
                {' '}({Math.round((event.end.getTime() - event.start.getTime()) / (1000 * 60))} 分钟)
              </span>
            </div>
          </div>

          {/* 任务详情 */}
          <div className="space-y-3">
            {task.context && (
              <div className="space-y-2">
                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                  <Building2 className="w-4 h-4 mr-3" />
                  <span className="font-medium mr-2">关联案例:</span>
                  <span className="text-slate-900 dark:text-slate-100">{task.context.incidentTitle}</span>
                </div>

                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                  <User className="w-4 h-4 mr-3" />
                  <span className="font-medium mr-2">客户:</span>
                  <span className="text-slate-900 dark:text-slate-100">{task.context.customerName}</span>
                </div>
              </div>
            )}

            {/* 优先级和类型 */}
            <div className="flex items-center space-x-4 text-sm">
              {task.parentIncidentPriority && (
                <div className="flex items-center bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-md">
                  <AlertTriangle className="w-4 h-4 mr-2 text-orange-500" />
                  <span className="text-orange-700 dark:text-orange-300">
                    {getPriorityLabel(task.parentIncidentPriority)}
                  </span>
                </div>
              )}

              {task.taskType && (
                <Badge variant="outline" className="text-xs border-slate-300 dark:border-slate-600">
                  {getTaskTypeLabel(task.taskType)}
                </Badge>
              )}
            </div>

            {/* 工作负载点数 */}
            {task.workloadPoints && (
              <div className="text-xs text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                工作负载: {task.workloadPoints} 点
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          {task.parentIncidentId && !task.parentIncidentId.startsWith('external') && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <Link to={`/?incident=${task.parentIncidentId}`}>
                <Button size="sm" variant="outline" className="w-full border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  查看完整案例
                </Button>
              </Link>
            </div>
          )}

          {/* AI建议说明 */}
          {isAISuggested && (
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-700">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center">
                    <span className="text-sm">💡</span>
                  </div>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-amber-900 dark:text-amber-200 mb-1">AI建议</h5>
                  <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                    这是基于团队负载分析生成的智能排期建议。
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
