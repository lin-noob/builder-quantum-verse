import { useState } from 'react';
import { Task } from '@shared/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ExternalLink, CheckCircle2, Clock } from 'lucide-react';

interface TaskCardV2Props {
  task: Task;
  onComplete?: (id: string) => void;
}

export default function TaskCardV2({ task, onComplete }: TaskCardV2Props) {
  const [status, setStatus] = useState(task.externalStatus);

  const renderInternal = () => (
    <div className="border rounded-lg p-4 bg-white dark:bg-slate-800">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">{task.title}</h4>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <Avatar className="w-5 h-5 mr-2">
                <AvatarImage src={task.assignee.avatarUrl} />
                <AvatarFallback className="text-xs bg-eip-accent text-white">
                  {task.assignee.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-slate-600 dark:text-slate-400">负责人: {task.assignee.name}</span>
            </div>
            {task.dueDate && (
              <div className="flex items-center text-slate-600 dark:text-slate-400">
                <Clock className="w-4 h-4 mr-1" />
                <span>截止 {task.dueDate.toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
        <Checkbox className="mt-1" />
      </div>
      <div className="mt-3 flex justify-end">
        <Button size="sm" onClick={() => onComplete?.(task.id)} className="bg-eip-success hover:bg-eip-success/90">
          标记为完成
        </Button>
      </div>
    </div>
  );

  const renderExternalLink = () => (
    <div className="border rounded-lg p-4 bg-white dark:bg-slate-800">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">{task.title}</h4>
          <Badge variant="outline" className="text-xs">��捷方式 · {task.externalSystem} 系统</Badge>
        </div>
      </div>
      <div className="mt-3 flex justify-end">
        <a href={task.externalUrl || '/legacy-app-placeholder'} target="_blank" rel="noreferrer">
          <Button size="sm" variant="outline">
            <ExternalLink className="w-4 h-4 mr-2" /> 在 {task.externalSystem || '外部'} 中打开
          </Button>
        </a>
      </div>
    </div>
  );

  const renderExternalApproval = () => (
    <div className="border rounded-lg p-4 bg-white dark:bg-slate-800">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">{task.title}</h4>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            状态: {status === 'pending_sync' && `[⏳ 等待${task.externalSystem || '外部'}同步...]`}
            {status === 'completed' && ` [✅ ${(task.externalSystem || '外部')}中已批准]`}
            {status === 'rejected' && ` [❌ ${(task.externalSystem || '外部')}中已驳回]`}
          </div>
        </div>
        <Badge variant="outline" className="text-xs">审批 · {task.externalSystem || '外部'}</Badge>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <a href={task.externalUrl || '/legacy-app-placeholder'} target="_blank" rel="noreferrer">
          <Button size="sm" variant="outline">
            <ExternalLink className="w-4 h-4 mr-2" /> 前往 {task.externalSystem || '外部'} 审批
          </Button>
        </a>
        {/* 模拟状态同步按钮，便于原型演示 */}
        <Button size="sm" onClick={() => setStatus('completed')} className="bg-eip-accent hover:bg-eip-accent/90">
          模拟同步为已批准
        </Button>
      </div>
    </div>
  );

  if (task.handlingType === 'external_link') return renderExternalLink();
  if (task.handlingType === 'external_approval') return renderExternalApproval();
  return renderInternal();
}
