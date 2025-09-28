import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Palette, Calendar as CalendarIcon, User, AlertCircle, FileText } from 'lucide-react';
import { ColorBy, CalendarView } from '@shared/types';

interface ViewControlsProps {
  colorBy: ColorBy;
  onColorByChange: (colorBy: ColorBy) => void;
  calendarView: CalendarView;
  onCalendarViewChange: (view: CalendarView) => void;
}

export default function ViewControls({ 
  colorBy, 
  onColorByChange, 
  calendarView, 
  onCalendarViewChange 
}: ViewControlsProps) {
  
  const colorByOptions = [
    {
      value: 'assignee' as ColorBy,
      label: '按负责人',
      icon: User,
      description: '根据任务负责人着色'
    },
    {
      value: 'incident_priority' as ColorBy,
      label: '按案例优先级',
      icon: AlertCircle,
      description: '根据关联案例的优先级着色'
    },
    {
      value: 'task_type' as ColorBy,
      label: '按任务类型',
      icon: FileText,
      description: '根据任务类型（电话/邮件/报告）着色'
    }
  ];

  const viewOptions = [
    { value: 'month' as CalendarView, label: '月' },
    { value: 'week' as CalendarView, label: '周' },
    { value: 'day' as CalendarView, label: '日' }
  ];

  const getCurrentColorByOption = () => {
    return colorByOptions.find(option => option.value === colorBy);
  };

  return (
    <Card className="mb-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center text-base font-semibold text-slate-900 dark:text-slate-100">
          <Settings className="w-5 h-5 mr-3 text-slate-600 dark:text-slate-400" />
          视图控制
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-8">
        {/* 视图着色依据 */}
        <div className="space-y-4">
          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center">
            <Palette className="w-4 h-4 mr-3" />
            视图着色依据
          </Label>
          
          <Select value={colorBy} onValueChange={onColorByChange}>
            <SelectTrigger className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              {colorByOptions.map(option => {
                const IconComponent = option.icon;
                return (
                  <SelectItem key={option.value} value={option.value} className="focus:bg-slate-50 dark:focus:bg-slate-700">
                    <div className="flex items-center">
                      <IconComponent className="w-4 h-4 mr-3 text-slate-600 dark:text-slate-400" />
                      <div>
                        <div className="font-medium text-slate-900 dark:text-slate-100">{option.label}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-500">{option.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          {/* 当前着色方式说明 */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-100 dark:border-slate-700">
            <div className="text-xs text-slate-600 dark:text-slate-400 mb-3">
              <strong>当前着色方式</strong>: {getCurrentColorByOption()?.description}
            </div>

            {/* 颜色图例 */}
            <div className="flex flex-wrap gap-3">
              {colorBy === 'assignee' && (
                <>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-indigo-400 rounded-full"></div>
                    <span className="text-xs text-slate-700 dark:text-slate-300">张明</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-rose-400 rounded-full"></div>
                    <span className="text-xs text-slate-700 dark:text-slate-300">李小红</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                    <span className="text-xs text-slate-700 dark:text-slate-300">王大伟</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                    <span className="text-xs text-slate-700 dark:text-slate-300">赵志华</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                    <span className="text-xs text-slate-700 dark:text-slate-300">刘晓燕</span>
                  </div>
                </>
              )}
              
              {colorBy === 'incident_priority' && (
                <>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <span className="text-xs text-slate-700 dark:text-slate-300">高优先级</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                    <span className="text-xs text-slate-700 dark:text-slate-300">中等优先级</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
                    <span className="text-xs text-slate-700 dark:text-slate-300">低优先级</span>
                  </div>
                </>
              )}
              
              {colorBy === 'task_type' && (
                <>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                    <span className="text-xs text-slate-700 dark:text-slate-300">电话</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                    <span className="text-xs text-slate-700 dark:text-slate-300">邮件</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-indigo-400 rounded-full"></div>
                    <span className="text-xs text-slate-700 dark:text-slate-300">报告</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
                    <span className="text-xs text-slate-700 dark:text-slate-300">常规</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 视图切换 */}
        <div className="space-y-4">
          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center">
            <CalendarIcon className="w-4 h-4 mr-3" />
            时间视图
          </Label>

          <div className="flex space-x-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            {viewOptions.map(option => (
              <Button
                key={option.value}
                variant="ghost"
                size="sm"
                onClick={() => onCalendarViewChange(option.value)}
                className={`flex-1 transition-all duration-200 ${
                  calendarView === option.value
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm font-medium'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50'
                }`}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* 视图提示 */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-900/30">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                <span className="text-sm">💡</span>
              </div>
            </div>
            <div>
              <h5 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">提示</h5>
              <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                切换着色方式可以从不同维度分析团队负载分布，帮助识别资源配置问题。
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
