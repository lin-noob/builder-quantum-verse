import { useState, useMemo, useCallback } from 'react';
// import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
// import '../styles/calendar.css';
import { ColorBy, CalendarView } from '@shared/types';
import { 
  getTeamCalendarTasks, 
  getTeamMembers, 
  getAISuggestedTasks,
  getTaskColor 
} from '@/data/teamCalendarData';
import MiniMonthNavigator from '@/components/team-calendar/MiniMonthNavigator';
import AIWorkloadAnalyzer from '@/components/team-calendar/AIWorkloadAnalyzer';
import ViewFilters from '@/components/team-calendar/ViewFilters';
import CalendarToolbar from '@/components/team-calendar/CalendarToolbar';
import CustomCalendarGrid from '@/components/team-calendar/CustomCalendarGrid';
// import CustomCalendarEvent from '@/components/team-calendar/CustomCalendarEvent';
import { toast } from 'sonner';
import { Brain } from 'lucide-react';

// 配置moment本地化
moment.locale('zh-cn');

export default function TeamCalendar() {
  const [colorBy, setColorBy] = useState<ColorBy>('assignee');
  const [calendarView, setCalendarView] = useState<CalendarView>('month');
  const [selectedMembers, setSelectedMembers] = useState<string[]>(
    getTeamMembers().map(m => m.id)
  );
  const [showExternal, setShowExternal] = useState(true);
  const [highlightedMember, setHighlightedMember] = useState<string>();
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  // 获取过滤后的任务
  const filteredTasks = useMemo(() => {
    const allTasks = getTeamCalendarTasks();
    let tasks = allTasks.filter(task => selectedMembers.includes(task.assignee.id));
    
    // 如果不显示外部会议，过滤掉外部任务
    if (!showExternal) {
      tasks = tasks.filter(task => task.source !== 'external');
    }
    
    return tasks;
  }, [selectedMembers, showExternal]);

  // 获取AI建议的任务
  const aiSuggestedTasks = useMemo(() => {
    if (!showAISuggestions) return [];
    return getAISuggestedTasks();
  }, [showAISuggestions]);

  // 转换任务为日历事件格式 - 暂时禁用事件渲染，专注于日历结构
  const calendarEvents = useMemo(() => {
    // 暂时返回空数组，优先确保日历骨架和皮肤100%正确
    return [];

    // const regularEvents = filteredTasks
    //   .filter(task => task.scheduledTime)
    //   .map(task => ({
    //     id: task.id,
    //     title: task.title,
    //     start: task.scheduledTime!.start,
    //     end: task.scheduledTime!.end,
    //     resource: task
    //   }));

    // const aiSuggestionEvents = aiSuggestedTasks
    //   .filter(task => task.scheduledTime)
    //   .map(task => ({
    //     id: `ai-${task.id}`,
    //     title: `[AI] ${task.title}`,
    //     start: task.scheduledTime!.start,
    //     end: task.scheduledTime!.end,
    //     resource: task,
    //     isAISuggested: true
    //   }));

    // return [...regularEvents, ...aiSuggestionEvents];
  }, [filteredTasks, aiSuggestedTasks]);

  // 处理成员筛选
  const handleMemberToggle = useCallback((memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  }, []);

  // 处理外部会议切换
  const handleExternalToggle = useCallback((show: boolean) => {
    setShowExternal(show);
  }, []);

  // 处理AI建议显示
  const handleShowAISuggestions = useCallback(() => {
    setShowAISuggestions(true);
    toast.info(
      <div className="flex items-center space-x-3">
        <Brain className="w-5 h-5 text-indigo-500" />
        <div>
          <div className="font-medium">AI已为"客户数据分析报告"生成排班建议</div>
          <div className="text-sm text-slate-600 mt-1">
            建议将过载任务重新分配给资源利用率较低的团队成员
          </div>
        </div>
      </div>,
      {
        duration: 10000,
        action: {
          label: '采纳此排期',
          onClick: () => {
            toast.success('已采纳AI排期建议，任务已正式加入日程');
            // 这里可以添加采纳逻辑
          }
        }
      }
    );
  }, []);

  // 处理成员高亮
  const handleHighlightMember = useCallback((memberId: string) => {
    setHighlightedMember(memberId);
    // 3秒后清除高亮
    setTimeout(() => setHighlightedMember(undefined), 3000);
  }, []);

  // 处理迷你日历日期选择
  const handleMiniCalendarSelect = useCallback((date: Date) => {
    setCurrentDate(date);
    // 切换到日视图以突出显示选中的日期
    if (calendarView === 'month') {
      setCalendarView('day');
    }
  }, [calendarView]);

  // 处理迷你日历月份变化
  const handleMiniCalendarMonthChange = useCallback((date: Date) => {
    setCurrentDate(date);
  }, []);

  // 处理今天按钮点击
  const handleTodayClick = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  // 处理新建事件
  const handleNewEvent = useCallback(() => {
    toast.info('新建日程功能开发中...');
  }, []);

  // 暂时移除react-big-calendar相关的事件处理函数
  // 使用自定义日历网格组件替代

  return (
      <div className="h-full flex bg-slate-50 dark:bg-slate-900">
        {/* 左侧混合控制面板 */}
        <div className="w-80 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 overflow-y-auto">
          <div className="p-6 space-y-8">
            {/* 迷你月份导航器 */}
            <MiniMonthNavigator
              currentDate={currentDate}
              onDateSelect={handleMiniCalendarSelect}
              onMonthChange={handleMiniCalendarMonthChange}
            />

            {/* AI工作负载分析 */}
            <AIWorkloadAnalyzer
              onShowAISuggestions={handleShowAISuggestions}
              onHighlightMember={handleHighlightMember}
            />

            {/* 视图筛选 */}
            <ViewFilters
              selectedMembers={selectedMembers}
              onMemberToggle={handleMemberToggle}
              showExternal={showExternal}
              onExternalToggle={handleExternalToggle}
              colorBy={colorBy}
              onColorByChange={setColorBy}
            />
          </div>
        </div>

        {/* 右侧主日历区域 */}
        <div className="flex-1 flex flex-col">
          {/* 日历工具栏 */}
          <CalendarToolbar
            currentDate={currentDate}
            calendarView={calendarView}
            onDateChange={setCurrentDate}
            onViewChange={setCalendarView}
            onTodayClick={handleTodayClick}
            onNewEvent={handleNewEvent}
          />

          {/* 主日历网格 */}
          <div className="flex-1 p-6">
            <CustomCalendarGrid
              currentDate={currentDate}
              onDateClick={(date) => {
                setCurrentDate(date);
                // 如果点击日期，可以切换到日视图
                if (calendarView === 'month') {
                  setCalendarView('day');
                }
              }}
            />
          </div>
        </div>
      </div>
  );
}
