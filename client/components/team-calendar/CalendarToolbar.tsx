import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CalendarView } from '@shared/types';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';

interface CalendarToolbarProps {
  currentDate: Date;
  calendarView: CalendarView;
  onDateChange: (date: Date) => void;
  onViewChange: (view: CalendarView) => void;
  onTodayClick: () => void;
  onNewEvent?: () => void;
}

export default function CalendarToolbar({
  currentDate,
  calendarView,
  onDateChange,
  onViewChange,
  onTodayClick,
  onNewEvent
}: CalendarToolbarProps) {
  const { t, i18n } = useTranslation();

  // 获取当前语言的 locale
  const locale = i18n.language.startsWith('en') ? enUS : zhCN;

  // 格式化显示当前年月/周/日
  const formatDisplayDate = (date: Date) => {
    if (calendarView === 'day') {
      return format(date, i18n.language.startsWith('en') ? 'MMMM d, yyyy' : 'yyyy年M月d日', { locale });
    } else if (calendarView === 'week') {
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      if (i18n.language.startsWith('en')) {
        return `${format(startOfWeek, 'MMM d', { locale })} - ${format(endOfWeek, 'd, yyyy', { locale })}`;
      } else {
        return `${format(startOfWeek, 'M月d日', { locale })} - ${format(endOfWeek, 'M月d日', { locale })}`;
      }
    } else { // month
      return format(date, i18n.language.startsWith('en') ? 'MMMM yyyy' : 'yyyy年M月', { locale });
    }
  };
  
  // 处理上一个时间段
  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (calendarView === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (calendarView === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else { // month
      newDate.setMonth(newDate.getMonth() - 1);
    }
    onDateChange(newDate);
  };
  
  // 处理下一个时间段
  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (calendarView === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (calendarView === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else { // month
      newDate.setMonth(newDate.getMonth() + 1);
    }
    onDateChange(newDate);
  };
  
  // 视图选项
  const viewOptions = [
    { value: 'day' as CalendarView, label: i18n.language.startsWith('en') ? 'Day' : '日' },
    { value: 'week' as CalendarView, label: i18n.language.startsWith('en') ? 'Week' : '周' },
    { value: 'month' as CalendarView, label: i18n.language.startsWith('en') ? 'Month' : '月' }
  ];
  
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border-b border-slate-200/50 dark:border-slate-700/50 shadow-sm">
      {/* 左侧部分：导航控件 */}
      <div className="flex items-center space-x-2">
        {/* 上一个月按钮 - 幽灵按钮样式 */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrevious}
          className="h-9 w-9 p-0 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-all duration-200 group"
        >
          <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
        </Button>
        
        {/* 当前年月 - 大号加粗字体 */}
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 px-2 min-w-[200px] text-center">
          {formatDisplayDate(currentDate)}
        </h2>
        
        {/* 下一个月按钮 - 幽灵按钮样式 */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNext}
          className="h-9 w-9 p-0 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-all duration-200 group"
        >
          <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
        </Button>
      </div>
      
      {/* 右侧部分：新建按钮 + 今天按钮 + 视图切换器 */}
      <div className="flex items-center space-x-3">
        {/* 新建日程 */}
        {onNewEvent && (
          <Button
            variant="default"
            size="sm"
            onClick={() => onNewEvent?.()}
            className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
          >
            <span className="flex items-center">
              <span>+</span>
              <span className="ml-1.5">{i18n.language.startsWith('en') ? 'New' : '新建'}</span>
            </span>
          </Button>
        )}
        {/* 今天按钮 - 简洁的柔和边框 */}
        <Button
          variant="outline"
          size="sm"
          onClick={onTodayClick}
          className="border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg"
        >
          {i18n.language.startsWith('en') ? 'Today' : '今天'}
        </Button>
        
        {/* 视图切换器 - 现代分段控件样式 */}
        <div className="flex items-center bg-slate-100/60 dark:bg-slate-700/60 backdrop-blur rounded-xl p-1 relative border border-slate-200/70 dark:border-slate-600/70">
          {viewOptions.map((option) => (
            <Button
              key={option.value}
              variant="ghost"
              size="sm"
              onClick={() => onViewChange(option.value)}
              className={`
                relative h-8 px-4 text-sm font-medium transition-all duration-200 rounded-lg
                ${calendarView === option.value
                  ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 shadow-sm z-10'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/40 dark:hover:bg-slate-600/40 z-0'
                }
              `}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
