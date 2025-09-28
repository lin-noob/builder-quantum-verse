import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react';
import { getWorkloadAnalysis, getTeamMembers } from '@/data/teamCalendarData';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface AIWorkloadAnalyzerProps {
  onShowAISuggestions: () => void;
  onHighlightMember: (memberId: string) => void;
}

export default function AIWorkloadAnalyzer({ onShowAISuggestions, onHighlightMember }: AIWorkloadAnalyzerProps) {
  const workloadAnalysis = getWorkloadAnalysis();
  const teamMembers = getTeamMembers();

  // 环形图数据
  const chartData = [
    { name: '已使用', value: workloadAnalysis.percentage, color: '#6366F1' },
    { name: '可用', value: 100 - workloadAnalysis.percentage, color: '#E2E8F0' }
  ];

  // 状态颜色映射
  const getStatusColor = (percentage: number) => {
    if (percentage >= 100) return 'text-red-600 dark:text-red-400';
    if (percentage >= 90) return 'text-orange-600 dark:text-orange-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getStatusText = (percentage: number) => {
    if (percentage >= 100) return '过载';
    if (percentage >= 90) return '接近满载';
    return '健康';
  };

  return (
    <Card className="mb-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center text-base font-semibold text-slate-900 dark:text-slate-100">
          <Brain className="w-5 h-5 mr-3 text-indigo-600 dark:text-indigo-400" />
          本周团队工作负载分析
          <Badge variant="outline" className="ml-3 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 text-xs border-indigo-200 dark:border-indigo-700">
            AI驱动
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-8">
        {/* 环形图和总负荷 */}
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={42}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-indigo-700 dark:text-indigo-300">
                {workloadAnalysis.percentage}%
              </span>
            </div>
          </div>

          <div className="flex-1">
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">团队总负荷</div>
            <div className={`text-xl font-bold ${getStatusColor(workloadAnalysis.percentage)}`}>
              {workloadAnalysis.percentage}% ({getStatusText(workloadAnalysis.percentage)})
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-500 mt-2">
              {workloadAnalysis.totalLoad} / {workloadAnalysis.totalCapacity} 工作点
            </div>
          </div>
        </div>

        {/* 关键洞察 */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 flex items-center">
            <TrendingUp className="w-4 h-4 mr-3 text-indigo-500" />
            关键洞察
          </h4>

          <div className="space-y-3 text-sm">
            {/* 总负荷状态 */}
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-3 text-green-500" />
                <span className="text-slate-700 dark:text-slate-300">总负荷</span>
              </div>
              <span className={`font-medium ${getStatusColor(workloadAnalysis.percentage)}`}>
                {workloadAnalysis.percentage}% ({getStatusText(workloadAnalysis.percentage)})
              </span>
            </div>

            {/* 过载风险 */}
            {workloadAnalysis.overloadedMembers.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/30">
                <div className="flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-3 text-red-500" />
                  <span className="text-slate-700 dark:text-slate-300">过载风险</span>
                </div>
                <button
                  onClick={() => onHighlightMember(workloadAnalysis.overloadedMembers[0].id)}
                  className="text-red-600 dark:text-red-400 font-medium hover:underline transition-colors"
                >
                  {workloadAnalysis.overloadedMembers[0].name} ({workloadAnalysis.overloadedMembers[0].workloadPercentage}%)
                </button>
              </div>
            )}

            {/* 空闲容量 */}
            {workloadAnalysis.underutilizedMembers.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900/30">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-3 text-green-500" />
                  <span className="text-slate-700 dark:text-slate-300">空闲容量</span>
                </div>
                <button
                  onClick={() => onHighlightMember(workloadAnalysis.underutilizedMembers[0].id)}
                  className="text-green-600 dark:text-green-400 font-medium hover:underline transition-colors"
                >
                  {workloadAnalysis.underutilizedMembers[0].name} ({workloadAnalysis.underutilizedMembers[0].workloadPercentage}%)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* AI智能排班建议按钮 */}
        <Button
          onClick={onShowAISuggestions}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 transition-colors"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          查看AI智能排班建议
        </Button>

        {/* AI提示区域 */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-indigo-100 dark:border-indigo-900/30">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center">
                <span className="text-sm">💡</span>
              </div>
            </div>
            <div>
              <h5 className="text-sm font-medium text-indigo-900 dark:text-indigo-200 mb-1">AI提示</h5>
              <p className="text-xs text-indigo-800 dark:text-indigo-300 leading-relaxed">
                检测到张明工作负载过重，建议将部分任务重新分配给资源利用率较低的团队成员。
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
