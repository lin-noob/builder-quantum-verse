import { useState } from 'react';
import { Task } from '@shared/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Building2, 
  DollarSign,
  TrendingUp,
  AlertCircle,
  Sparkles,
  Eye,
  Settings,
  X,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

interface EnhancedTaskCardProps {
  task: Task & {
    // 扩展任务类型以支持更详细的信息
    cardType?: 'ai_suggestion' | 'procurement' | 'review' | 'analysis' | 'standard';
    amount?: number;
    currency?: string;
    vendor?: string;
    progress?: {
      label: string;
      percentage: number;
      warning?: string;
      daysLeft?: number;
    };
    aiInsights?: {
      title: string;
      description: string;
      recommendation?: string;
    };
    warningMessage?: string;
    statusBadge?: {
      text: string;
      variant: 'success' | 'warning' | 'danger' | 'info';
    };
  };
  onToggleComplete?: (taskId: string) => void;
  onApprove?: (taskId: string) => void;
  onReject?: (taskId: string) => void;
  onAdjustPreferences?: (taskId: string) => void;
  onDismiss?: (taskId: string) => void;
}

export default function EnhancedTaskCard({ 
  task, 
  onToggleComplete,
  onApprove,
  onReject,
  onAdjustPreferences,
  onDismiss
}: EnhancedTaskCardProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const isCompleted = task.status === 'completed';
  const cardType = task.cardType || 'standard';

  const getBorderColor = () => {
    switch (cardType) {
      case 'ai_suggestion': return 'border-l-purple-500';
      case 'procurement': return 'border-l-red-500';
      case 'review': return 'border-l-blue-500';
      case 'analysis': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };

  const getHeaderIcon = () => {
    switch (cardType) {
      case 'ai_suggestion': return <Brain className="w-5 h-5 text-purple-600" />;
      case 'procurement': return <Building2 className="w-5 h-5 text-red-600" />;
      case 'review': return <Eye className="w-5 h-5 text-blue-600" />;
      case 'analysis': return <TrendingUp className="w-5 h-5 text-green-600" />;
      default: return <CheckCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatCurrency = (amount: number, currency: string = 'CNY') => {
    if (currency === 'CNY') {
      return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`;
    }
    return `${currency} ${amount.toLocaleString()}`;
  };

  const getStatusBadgeColor = (variant: string) => {
    switch (variant) {
      case 'success': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
      case 'danger': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      case 'info': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300';
    }
  };

  return (
    <Card className={`
      w-full transition-all duration-200 hover:shadow-lg border-l-4 
      ${getBorderColor()}
      ${isCompleted ? 'bg-slate-50 dark:bg-slate-800/50' : 'bg-white dark:bg-slate-800'}
    `}>
      {/* 卡片头部 */}
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {getHeaderIcon()}
            <div>
              <h3 className={`font-semibold text-lg ${
                isCompleted ? 'line-through text-slate-500' : 'text-slate-900 dark:text-slate-100'
              }`}>
                {task.title}
              </h3>
              {cardType === 'ai_suggestion' && (
                <Badge className="mt-1 bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI学习
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {task.statusBadge && (
              <Badge className={getStatusBadgeColor(task.statusBadge.variant)}>
                {task.statusBadge.text}
              </Badge>
            )}
            <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              2分钟前
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-6">
        {/* 任务描述 */}
        <div className="text-slate-700 dark:text-slate-300 leading-relaxed">
          {task.description || '暂无详细描述'}
        </div>

        {/* 金额显示（采购类任务） */}
        {task.amount && (
          <div className="text-center py-4">
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
              {formatCurrency(task.amount, task.currency)}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              订单金额
            </div>
          </div>
        )}

        {/* 供应商信息 */}
        {task.vendor && (
          <div className="text-sm text-slate-600 dark:text-slate-400">
            为满足 <span className="font-medium text-slate-900 dark:text-slate-100">远见科技</span> 的新合同，建议向 
            <span className="font-medium text-blue-600 dark:text-blue-400"> {task.vendor}</span> 采购。
          </div>
        )}

        {/* 警告消息 */}
        {task.warningMessage && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-yellow-800 dark:text-yellow-200">
                {task.warningMessage}
              </span>
            </div>
          </div>
        )}

        {/* 进度指标 */}
        {task.progress && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">
              关键指标
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">{task.progress.label}</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {task.progress.percentage}%
                </span>
              </div>
              <Progress value={task.progress.percentage} className="h-2" />
              {task.progress.warning && task.progress.daysLeft && (
                <div className="text-sm text-orange-600 dark:text-orange-400">
                  {task.progress.warning} - 仅剩{task.progress.daysLeft}天可用
                </div>
              )}
            </div>
          </div>
        )}

        {/* AI洞察 */}
        {task.aiInsights && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Brain className="w-4 h-4 text-purple-600" />
              <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {task.aiInsights.title}
              </h4>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {task.aiInsights.description}
            </div>
            {task.aiInsights.recommendation && (
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                <div className="text-sm text-purple-800 dark:text-purple-200">
                  {task.aiInsights.recommendation}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 系统检查状态 */}
        {cardType === 'procurement' && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                AI系统检查无异常
              </span>
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex flex-col space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          {cardType === 'ai_suggestion' && (
            <div className="flex flex-col space-y-2">
              <Button 
                onClick={() => onDismiss?.(task.id)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                减少此类推荐
              </Button>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => onAdjustPreferences?.(task.id)}
                  className="flex-1 text-purple-600 border-purple-600 hover:bg-purple-50"
                >
                  调整我的偏好
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setDismissed(true)}
                  className="flex-1 text-slate-600"
                >
                  暂时不用
                </Button>
              </div>
            </div>
          )}

          {cardType === 'procurement' && (
            <div className="flex space-x-3">
              <Button 
                onClick={() => onApprove?.(task.id)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white"
              >
                <ThumbsUp className="w-4 h-4 mr-2" />
                批准
              </Button>
              <Button 
                variant="destructive"
                onClick={() => onReject?.(task.id)}
                className="flex-1"
              >
                <ThumbsDown className="w-4 h-4 mr-2" />
                驳回
              </Button>
            </div>
          )}

          {cardType === 'standard' && onToggleComplete && (
            <Button 
              onClick={() => onToggleComplete(task.id)}
              variant={isCompleted ? "outline" : "default"}
              className="w-full"
            >
              {isCompleted ? '重新打开' : '标记完成'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
