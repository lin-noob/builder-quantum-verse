import { useState, useCallback } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';

interface MiniMonthNavigatorProps {
  currentDate: Date;
  onDateSelect: (date: Date) => void;
  onMonthChange: (date: Date) => void;
}

export default function MiniMonthNavigator({
  currentDate,
  onDateSelect,
  onMonthChange
}: MiniMonthNavigatorProps) {
  const { i18n } = useTranslation();
  const [displayDate, setDisplayDate] = useState(currentDate);

  // 获取当前语言的 locale
  const locale = i18n.language.startsWith('en') ? enUS : zhCN;

  // 获取星期标题
  const weekDays = i18n.language.startsWith('en')
    ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    : ['日', '一', '二', '三', '四', '五', '六'];
  
  // 获取月份的所有日期
  const getDaysInMonth = useCallback((date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // 当月第一天
    const firstDay = new Date(year, month, 1);
    // 当月最后一天
    const lastDay = new Date(year, month + 1, 0);
    
    // 网格开始日期（包含上月末尾几天）
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // 网格结束日期（包含下月开头几天）
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 41); // 6周 * 7天 - 1
    
    const days = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      days.push({
        date: new Date(current),
        isCurrentMonth: current.getMonth() === month,
        isToday: 
          current.getFullYear() === new Date().getFullYear() &&
          current.getMonth() === new Date().getMonth() &&
          current.getDate() === new Date().getDate(),
        isSelected:
          current.getFullYear() === currentDate.getFullYear() &&
          current.getMonth() === currentDate.getMonth() &&
          current.getDate() === currentDate.getDate()
      });
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }, [currentDate]);
  
  const days = getDaysInMonth(displayDate);
  const monthYear = format(displayDate, i18n.language.startsWith('en') ? 'MMMM yyyy' : 'yyyy年M月', { locale });
  
  const handlePrevMonth = () => {
    const newDate = new Date(displayDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setDisplayDate(newDate);
    onMonthChange(newDate);
  };
  
  const handleNextMonth = () => {
    const newDate = new Date(displayDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setDisplayDate(newDate);
    onMonthChange(newDate);
  };
  
  const handleDateClick = (date: Date) => {
    onDateSelect(date);
  };
  
  return (
    <div className="bg-white rounded-lg p-4 border border-slate-200 dark:border-slate-700">
      {/* 月份标题和导航 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">
            {monthYear}
          </h3>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </div>
        
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevMonth}
            className="h-6 w-6 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextMonth}
            className="h-6 w-6 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* 星期标题 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day, index) => (
          <div 
            key={day} 
            className={`
              h-6 flex items-center justify-center text-xs font-medium
              ${index === 0 || index === 6 
                ? 'text-red-500 dark:text-red-400' 
                : 'text-slate-600 dark:text-slate-400'
              }
            `}
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* 日期网格 */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => (
          <button
            key={index}
            onClick={() => handleDateClick(day.date)}
            className={`
              h-6 w-6 flex items-center justify-center text-xs rounded-full
              transition-colors duration-150 hover:bg-slate-100 dark:hover:bg-slate-700
              ${!day.isCurrentMonth 
                ? 'text-slate-300 dark:text-slate-600' 
                : day.isToday
                  ? 'bg-indigo-600 text-white font-medium'
                  : day.isSelected
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                    : (index % 7 === 0 || index % 7 === 6)
                      ? 'text-red-500 dark:text-red-400'
                      : 'text-slate-700 dark:text-slate-300'
              }
            `}
          >
            {day.date.getDate()}
          </button>
        ))}
      </div>
    </div>
  );
}
