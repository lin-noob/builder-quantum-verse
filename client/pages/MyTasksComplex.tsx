import { useState } from 'react';
import { Task } from '@shared/types';
import { getMyAITasks, getTasksByGroup, taskGroups } from '@/data/aiWorkstationData';
import { enhancedMockTasks, getPendingEnhancedTasks, sortTasksByPriority, EnhancedTask } from '@/data/enhancedTaskData';
import DailyAgenda from '@/components/ai-workstation/DailyAgenda';
import TaskCard from '@/components/ai-workstation/TaskCard';
import EnhancedTaskCard from '@/components/task/EnhancedTaskCard';
import { Badge } from '@/components/ui/badge';
import { Brain, Target, Zap, Package, Sparkles, DollarSign, AlertTriangle } from 'lucide-react';

export default function MyTasksComplex() {
  const [tasks, setTasks] = useState<EnhancedTask[]>(enhancedMockTasks);

  const handleToggleComplete = (taskId: string) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId
        ? { ...task, status: task.status === 'completed' ? 'pending' : 'completed' }
        : task
    ));
  };

  const handleApprove = (taskId: string) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId
        ? { ...task, status: 'completed', statusBadge: { text: '已批准', variant: 'success' } }
        : task
    ));
  };

  const handleReject = (taskId: string) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId
        ? { ...task, status: 'completed', statusBadge: { text: '已驳回', variant: 'danger' } }
        : task
    ));
  };

  const handleAdjustPreferences = (taskId: string) => {
    console.log('调整偏好设置:', taskId);
  };

  const handleDismiss = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  // 获取各类型任务统计
  const pendingTasks = tasks.filter(task => task.status === 'pending');
  const aiSuggestionTasks = pendingTasks.filter(task => task.cardType === 'ai_suggestion');
  const procurementTasks = pendingTasks.filter(task => task.cardType === 'procurement');
  const reviewTasks = pendingTasks.filter(task => task.cardType === 'review');
  const analysisTasks = pendingTasks.filter(task => task.cardType === 'analysis');

  // 按优先级排序
  const sortedPendingTasks = sortTasksByPriority(pendingTasks);

  return (
      <div className="h-full overflow-auto bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto p-6 space-y-8">
          {/* 页面标题 */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                我的任务 (复杂版本)
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                AI个人执行工作台 · 智能化任务管理
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-purple-500" />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                AI助理已就绪
              </span>
            </div>
          </div>

          {/* AI每日智能议程 */}
          <DailyAgenda userName="张明" />

          {/* 任务统计和图例 - 增强版本 */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Brain className="w-6 h-6 text-purple-600" />
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    智能任务工作台
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    AI增强的详细任务管理
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {pendingTasks.length}
                </span>
                <p className="text-sm text-slate-600 dark:text-slate-400">待处理任务</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">AI建议</span>
                  <Badge className="ml-2 bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">
                    {aiSuggestionTasks.length}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <DollarSign className="w-5 h-5 text-red-600" />
                <div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">采购审批</span>
                  <Badge className="ml-2 bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">
                    {procurementTasks.length}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Target className="w-5 h-5 text-blue-600" />
                <div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">审核任务</span>
                  <Badge className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                    {reviewTasks.length}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Package className="w-5 h-5 text-green-600" />
                <div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">分析报告</span>
                  <Badge className="ml-2 bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                    {analysisTasks.length}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* 增强任务卡片网格 */}
          {sortedPendingTasks.length > 0 ? (
            <div className="space-y-6">
              {/* 紧急和重要任务 */}
              {sortedPendingTasks.filter(task => task.priority === 'high').length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      紧急重要任务
                    </h3>
                    <Badge className="bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">
                      {sortedPendingTasks.filter(task => task.priority === 'high').length}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {sortedPendingTasks
                      .filter(task => task.priority === 'high')
                      .map(task => (
                        <EnhancedTaskCard
                          key={task.id}
                          task={task}
                          onToggleComplete={handleToggleComplete}
                          onApprove={handleApprove}
                          onReject={handleReject}
                          onAdjustPreferences={handleAdjustPreferences}
                          onDismiss={handleDismiss}
                        />
                      ))}
                  </div>
                </div>
              )}

              {/* 常规任务 */}
              {sortedPendingTasks.filter(task => task.priority !== 'high').length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Package className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      常规任务
                    </h3>
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                      {sortedPendingTasks.filter(task => task.priority !== 'high').length}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {sortedPendingTasks
                      .filter(task => task.priority !== 'high')
                      .map(task => (
                        <EnhancedTaskCard
                          key={task.id}
                          task={task}
                          onToggleComplete={handleToggleComplete}
                          onApprove={handleApprove}
                          onReject={handleReject}
                          onAdjustPreferences={handleAdjustPreferences}
                          onDismiss={handleDismiss}
                        />
                      ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                🎉 太棒了！今日任务全部完成
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                您已完成所有任务，AI助理将继续为您监控新的工作机会
              </p>
            </div>
          )}

          {/* 底部间距 */}
          <div className="pb-8"></div>
        </div>
      </div>
  );
}