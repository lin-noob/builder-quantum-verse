import { Sunrise, ChevronRight, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { aiWorkstationTasks } from '@/data/aiWorkstationData';

interface DailyAgendaProps {
  userName?: string;
}

export default function DailyAgenda({ userName = "张明" }: DailyAgendaProps) {
  // 计算任务统计
  const totalTasks = aiWorkstationTasks.filter(task => task.status === 'pending').length;
  const todayDueTasks = aiWorkstationTasks.filter(task => 
    task.dueDateDisplay?.includes('今天') && task.status === 'pending'
  ).length;
  
  // 获取高优先级任务
  const highPriorityTask = aiWorkstationTasks.find(task => 
    task.group === 'focus' && task.context?.customerName === '阳光集团'
  );

  const handleViewDetails = () => {
    // 这里可以链接到具体的案例详情页面
    alert('正在跳转到阳光集团客户详情页面...');
  };

  return (
    <Card className="mb-8 border-none bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          {/* AI图标 */}
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Sunrise className="w-6 h-6 text-white" />
          </div>

          {/* 主要内容 */}
          <div className="flex-1">
            <div className="flex items-center mb-3">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                AI 每日智能议程
              </h2>
              <div className="ml-3 px-2 py-1 bg-blue-100 dark:bg-blue-900/50 rounded-full text-xs text-blue-700 dark:text-blue-300 font-medium">
                智能推荐
              </div>
            </div>

            {/* AI生成的建议内容 */}
            <div className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              <p>
                <span className="font-medium text-slate-900 dark:text-slate-100">早安，{userName}。</span>
                今天您有<span className="font-semibold text-purple-600 dark:text-purple-400">{totalTasks}项任务</span>待处理，
                其中<span className="font-semibold text-orange-600 dark:text-orange-400">{todayDueTasks}项</span>将于今天下午5点到期。
                根据优先级和预计耗时，我建议您先从
                <span className="font-semibold text-blue-600 dark:text-blue-400">'阳光集团电话回访'</span>开始，
                这关联到一个高风险流失案例。
              </p>
            </div>

            {/* 关键信息和操作 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm">
                {/* 时间信息 */}
                <div className="flex items-center text-slate-600 dark:text-slate-400">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>预计总耗时: 4.5小时</span>
                </div>
                
                {/* 紧急程度 */}
                <div className="flex items-center text-orange-600 dark:text-orange-400">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  <span>3项高优先级</span>
                </div>
              </div>

              {/* 查看详情按钮 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleViewDetails}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                查看客户详情
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>

        {/* 底部进度条 */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
            <span>今日进度</span>
            <span>0/{totalTasks} 已完成</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `0%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
