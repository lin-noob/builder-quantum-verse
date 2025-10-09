import { Incident, Task, ResponseAction } from '@shared/types';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TaskCard from './TaskCard';
import { mockUsers } from '@/data/mockData';
import { Brain, Zap, Edit3, ArrowUp, Calendar, User, TrendingUp, CheckCircle2, Clock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow, addHours } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface IncidentDetailsProps {
  incident: Incident | null;
}

// Auto-assign tasks to team members based on action type
const getAssigneeForAction = (action: ResponseAction): any => {
  if (action.type === 'communication') {
    return mockUsers.find(u => u.role.includes('Customer Success')) || mockUsers[1]; // 李小红
  } else if (action.type === 'process') {
    return mockUsers.find(u => u.role.includes('Technical')) || mockUsers[2]; // 王大伟
  } else {
    return mockUsers[0]; // 张明 for data analysis
  }
};

const priorityColors = {
  high: 'bg-eip-alert text-eip-alert-foreground',
  medium: 'bg-eip-warning text-eip-warning-foreground',
  low: 'bg-slate-500 text-slate-50'
};

const priorityLabels = {
  high: '高优先级',
  medium: '中等优先级', 
  low: '低优先级'
};

const statusLabels = {
  pending_human: '待人工处理',
  in_progress: '处理中',
  resolved: '已解决',
  automated: 'AI已处理'
};

export default function IncidentDetails({ incident }: IncidentDetailsProps) {
  const [isExecuted, setIsExecuted] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState<Task[]>([]);
  const [showAutomationHint, setShowAutomationHint] = useState<boolean>(() => {
    return typeof window !== 'undefined' && localStorage.getItem('ai_learning_complete') === 'true';
  });
  const navigate = useNavigate();

  // 预览多形态任务卡片（未执行前用于展示不同type的形态）
  const previewTasks = useMemo(() => {
    if (!incident) return [] as Task[];
    return incident.suggestedResponsePlan.map((action, index) => ({
      id: `preview_${incident.id}_${action.id}`,
      title: action.title,
      status: 'pending' as const,
      assignee: getAssigneeForAction(action),
      parentIncidentId: incident.id,
      dueDate: addHours(new Date(), 24),
      handlingType: index === 0 ? 'internal' : index === 1 ? 'external_link' : 'external_approval',
      externalSystem: index === 1 ? 'OA' : index === 2 ? 'ERP' : undefined,
      externalUrl: '/legacy-app-placeholder',
      externalStatus: index === 2 ? 'pending_sync' : undefined,
    }));
  }, [incident]);

  const handleExecuteAISuggestions = () => {
    if (!incident || isExecuted) return;

    // Convert response actions to tasks
    const newTasks: Task[] = incident.suggestedResponsePlan.map((action, index) => ({
      id: `task_${incident.id}_${action.id}`,
      title: action.title,
      status: 'pending' as const,
      assignee: getAssigneeForAction(action),
      parentIncidentId: incident.id,
      dueDate: addHours(new Date(), 24), // 24小时截止日期
      // 为原型演示指定不同的处理形态
      handlingType: index === 0 ? 'internal' : index === 1 ? 'external_link' : 'external_approval',
      externalSystem: index === 1 ? 'OA' : index === 2 ? 'ERP' : undefined,
      externalUrl: '/legacy-app-placeholder',
      externalStatus: index === 2 ? 'pending_sync' : undefined,
    }));

    setGeneratedTasks(newTasks);
    setIsExecuted(true);

    // Show success notification
    alert(`已成功创建 ${newTasks.length} 个任务并分配给团队成员！任务已添加到"我的任务"页面。`);
  };

  if (!incident) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-50 dark:bg-slate-900">
        <div className="text-center p-8">
          <Brain className="w-16 h-16 mx-auto text-eip-accent mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
            选择一个事件以查看详情
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            从左侧事件列表中选择需要处理的案例
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-white dark:bg-slate-800">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex-1 mr-4">
              {incident.title}
            </h1>
            <Badge className={priorityColors[incident.priority]}>
              {priorityLabels[incident.priority]}
            </Badge>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {incident.involvedEntities.map((entity, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {entity.type === 'customer' && '👤'} 
                {entity.type === 'order' && '📋'}
                {entity.type === 'product' && '📦'}
                {entity.value}
              </Badge>
            ))}
          </div>
        </div>

        {/* AI Analysis */}
        <Card className="border-eip-accent/20 bg-gradient-to-br from-eip-accent/5 to-eip-accent/10">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm font-semibold">
              <Brain className="w-4 h-4 mr-2 text-eip-accent" />
              AI分析与建议
              <Badge variant="outline" className="ml-auto text-xs">
                置信度 {incident.aiAnalysis.confidence}%
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {incident.aiAnalysis.summary}
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              {incident.aiAnalysis.keyMetrics.map((metric, index) => (
                <div key={index} className="bg-white/50 dark:bg-slate-700/50 rounded-lg p-3">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {metric.label}
                  </div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    {metric.value}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Suggested Response Plan / Generated Tasks */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm font-semibold">
              {isExecuted ? (
                <CheckCircle2 className="w-4 h-4 mr-2 text-eip-success" />
              ) : (
                <TrendingUp className="w-4 h-4 mr-2 text-eip-accent" />
              )}
              {isExecuted ? '已分配任务' : '建议响应动作'}
              {isExecuted && (
                <Badge variant="outline" className="ml-2 bg-eip-success/10 text-eip-success border-eip-success">
                  已执行
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* 学习成果提示条 */}
            {!isExecuted && showAutomationHint && (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 flex items-start">
                <span className="mr-2">💡</span>
                <div className="flex-1">
                  AI自动化建议：我注意到，对于此类事件，您的团队已连续3次采取了相同的、成功的手动处理流程。我已将该流程学习并固化为新的标准建议。该流程有95%的概率可以被完全自动化，是否授权？
                </div>
                <div className="ml-3 flex-shrink-0 space-x-2">
                  <Button size="sm" className="bg-eip-accent hover:bg-eip-accent/90">授权自动处理</Button>
                  <Button size="sm" variant="outline" onClick={() => setShowAutomationHint(false)}>暂不授权</Button>
                </div>
              </div>
            )}

            {/* 在建议阶段即以多形态卡片方式渲染 */}
            {!isExecuted && (
              <>
                {useMemo(() => {
                  if (!incident) return null;
                  const preview: Task[] = incident.suggestedResponsePlan.map((action, index) => ({
                    id: `preview_${incident.id}_${action.id}`,
                    title: action.title,
                    status: 'pending',
                    assignee: getAssigneeForAction(action),
                    parentIncidentId: incident.id,
                    dueDate: addHours(new Date(), 24),
                    handlingType: index === 0 ? 'internal' : index === 1 ? 'external_link' : 'external_approval',
                    externalSystem: index === 1 ? 'OA' : index === 2 ? 'ERP' : undefined,
                    externalUrl: '/legacy-app-placeholder',
                    externalStatus: index === 2 ? 'pending_sync' : undefined,
                  }));
                  return preview.map(t => <TaskCard key={t.id} task={t} />);
                }, [incident])}
              </>
            )}
            {isExecuted ? (
              // Show generated tasks (多形态卡片)
              generatedTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))
            ) : (
              // 未执行前，用多形态卡片直接展示建议
              previewTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))
            )}
          </CardContent>
        </Card>

        {/* Processing History */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm font-semibold">
              <Clock className="w-4 h-4 mr-2 text-eip-accent" />
              处���历史
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {incident.processingHistory.map((activity, index) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-eip-accent/10 rounded-full flex items-center justify-center">
                    {activity.actor === 'AI' ? (
                      <Brain className="w-4 h-4 text-eip-accent" />
                    ) : (
                      <User className="w-4 h-4 text-eip-accent" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900 dark:text-slate-100">
                      {activity.description}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {formatDistanceToNow(activity.timestamp, { addSuffix: true, locale: zhCN })}
                      {activity.actor !== 'AI' && ` • ${activity.actor}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4 -mx-6 -mb-6">
          <div className="flex space-x-3">
            {isExecuted ? (
              <>
                <Button className="flex-1 bg-eip-success hover:bg-eip-success/90" disabled>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  已执行AI建议
                </Button>
                <Button variant="outline" className="flex-1">
                  <User className="w-4 h-4 mr-2" />
                  查看我的任务
                </Button>
              </>
            ) : (
              <>
                <Button
                  className="flex-1 bg-eip-accent hover:bg-eip-accent/90"
                  onClick={handleExecuteAISuggestions}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  执行AI建议
                </Button>
                <Button variant="outline" className="flex-1">
                  <Edit3 className="w-4 h-4 mr-2" />
                  修改响应
                </Button>
              </>
            )}
            <Button variant="ghost" size="sm">
              <ArrowUp className="w-4 h-4 mr-2" />
              升级处理
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/email-manual-processing', { state: { incident } })}>
              ↗️ 前往传统界面手动处理
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
