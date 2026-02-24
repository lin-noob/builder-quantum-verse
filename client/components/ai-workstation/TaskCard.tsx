import { useState } from 'react';
import { Task } from '@shared/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  ExternalLink, 
  AlertTriangle, 
  Sparkles, 
  Phone, 
  Clock,
  Building2,
  User
} from 'lucide-react';
import { Link } from 'react-router-dom';
import EmailDraftModal from './EmailDraftModal';
import TalkingPointsModal from './TalkingPointsModal';

interface TaskCardProps {
  task: Task;
  onToggleComplete?: (taskId: string) => void;
}

export default function TaskCard({ task, onToggleComplete }: TaskCardProps) {
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [talkingPointsModalOpen, setTalkingPointsModalOpen] = useState(false);

  const isOverdue = task.dueDate && new Date() > task.dueDate && task.status !== 'completed';
  const isCompleted = task.status === 'completed';

  const handleToggle = () => {
    if (onToggleComplete) {
      onToggleComplete(task.id);
    }
  };

  const handleAIAssistant = () => {
    if (task.type === 'email') {
      setEmailModalOpen(true);
    } else if (task.type === 'call') {
      setTalkingPointsModalOpen(true);
    }
  };

  const getAIButtonConfig = () => {
    switch (task.type) {
      case 'email':
        return {
          icon: Sparkles,
          text: 'AI草拟邮件',
          color: 'bg-blue-600 hover:bg-blue-700 text-white'
        };
      case 'call':
        return {
          icon: Phone,
          text: '准备通话要点',
          color: 'bg-green-600 hover:bg-green-700 text-white'
        };
      default:
        return null;
    }
  };

  const aiButtonConfig = getAIButtonConfig();

  // 分组标签配置
  const getGroupConfig = () => {
    switch (task.group) {
      case 'focus':
        return {
          label: '今日焦点',
          color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
          borderColor: 'border-l-purple-500'
        };
      case 'urgent':
        return {
          label: '高优紧急',
          color: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
          borderColor: 'border-l-red-500'
        };
      case 'batchable':
        return {
          label: '可批量处理',
          color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
          borderColor: 'border-l-blue-500'
        };
      default:
        return {
          label: '常规任务',
          color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
          borderColor: 'border-l-slate-300'
        };
    }
  };

  const groupConfig = getGroupConfig();

  return (
    <>
      <Card className={`
        transition-all duration-200 hover:shadow-lg border-l-4 h-full min-h-[280px]
        ${isCompleted ? 'bg-slate-50 dark:bg-slate-800/50 border-l-green-400' : 'bg-white dark:bg-slate-800'}
        ${isOverdue ? 'border-l-red-500 bg-red-50 dark:bg-red-900/10' : groupConfig.borderColor}
      `}>
        <CardContent className="p-4 h-full flex flex-col">
          {/* 分组标签 */}
          <div className="flex items-center justify-between mb-3">
            <Badge className={`text-xs font-medium ${groupConfig.color}`}>
              {groupConfig.label}
            </Badge>
            {isOverdue && (
              <Badge variant="destructive" className="text-xs">
                已超期
              </Badge>
            )}
          </div>

          <div className="flex items-start space-x-4 flex-1">
            {/* 复选框 */}
            <Checkbox
              checked={isCompleted}
              onCheckedChange={handleToggle}
              className="mt-1 flex-shrink-0"
            />

            {/* 主要内容区域 */}
            <div className="flex-1 min-w-0 flex flex-col">
              {/* 任务标题 */}
              <h3 className={`
                text-base font-semibold mb-3 leading-tight
                ${isCompleted ? 'line-through text-slate-500' : 'text-slate-900 dark:text-slate-100'}
              `}>
                {task.title}
              </h3>

              {/* 关键上下文信息 */}
              {task.context && (
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center text-slate-600 dark:text-slate-400">
                    <Building2 className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="font-medium mr-1">案例：</span>
                    <span className="truncate">{task.context.incidentTitle}</span>
                  </div>
                  <div className="flex items-center text-slate-600 dark:text-slate-400">
                    <User className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="font-medium mr-1">客户：</span>
                    <span className="truncate">{task.context.customerName}</span>
                  </div>
                </div>
              )}

              {/* 截止日期 */}
              {task.dueDateDisplay && (
                <div className={`
                  flex items-center mb-4 text-sm
                  ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'}
                `}>
                  {isOverdue && <AlertTriangle className="w-4 h-4 mr-1" />}
                  <Clock className="w-4 h-4 mr-2" />
                  <span className="truncate">截止: {task.dueDateDisplay}</span>
                </div>
              )}

              {/* 底部操作区域 - 使用flex-1确保在底部 */}
              <div className="mt-auto space-y-3">
                {/* 查看完整案例链接 */}
                <Link
                  to={`/?incident=${task.parentIncidentId}`}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md p-2 -m-2 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  查看完整案例
                </Link>

                {/* AI执行助手按钮 */}
                {aiButtonConfig && !isCompleted && (
                  <Button
                    onClick={handleAIAssistant}
                    size="sm"
                    className={`w-full ${aiButtonConfig.color}`}
                  >
                    <aiButtonConfig.icon className="w-4 h-4 mr-2" />
                    {aiButtonConfig.text}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI助手模态框 */}
      <EmailDraftModal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        task={task}
      />
      
      <TalkingPointsModal
        isOpen={talkingPointsModalOpen}
        onClose={() => setTalkingPointsModalOpen(false)}
        task={task}
      />
    </>
  );
}
