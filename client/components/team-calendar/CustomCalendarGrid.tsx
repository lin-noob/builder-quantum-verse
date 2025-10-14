import React from 'react';
import moment from 'moment';
import type { CalendarEvent } from './EventFormDialog';

interface CustomCalendarGridProps {
  currentDate: Date;
  onDateClick?: (date: Date) => void;
  events?: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
}

export default function CustomCalendarGrid({ currentDate, onDateClick, events = [], onEventClick }: CustomCalendarGridProps) {
  // 获取当前月份的第一天和最后一天
  const startOfMonth = moment(currentDate).startOf('month');
  const endOfMonth = moment(currentDate).endOf('month');
  
  // 获取日历网格的开始和结束日期（包含前后月份���日期）
  const startOfCalendar = moment(startOfMonth).startOf('week');
  const endOfCalendar = moment(endOfMonth).endOf('week');
  
  // 生成日历网格的所有日期
  const calendarDates = [];
  let currentDay = moment(startOfCalendar);
  
  while (currentDay.isSameOrBefore(endOfCalendar)) {
    calendarDates.push(moment(currentDay));
    currentDay.add(1, 'day');
  }
  
  // 将日期分组为周
  const weeks = [];
  for (let i = 0; i < calendarDates.length; i += 7) {
    weeks.push(calendarDates.slice(i, i + 7));
  }
  
  // 中文星期标题
  const dayHeaders = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  
  // 判断是否为今天
  const isToday = (date: moment.Moment) => {
    return date.isSame(moment(), 'day');
  };
  
  // 判断是否为当前月
  const isCurrentMonth = (date: moment.Moment) => {
    return date.isSame(moment(currentDate), 'month');
  };
  
  // 判断是否为周末
  const isWeekend = (dayIndex: number) => {
    return dayIndex === 0 || dayIndex === 6; // 周日和周六
  };
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
      {/* 星期标题行 */}
      <div className="grid grid-cols-7 border-b border-gray-200 dark:border-slate-700">
        {dayHeaders.map((day, index) => (
          <div
            key={day}
            className={`py-3 px-2 text-center text-sm font-medium border-r border-gray-200 dark:border-slate-700 last:border-r-0 ${
              isWeekend(index)
                ? 'text-red-500 dark:text-red-400'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* 日期网格 */}
      <div className="grid grid-cols-1">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 border-b border-gray-200 dark:border-slate-700 last:border-b-0">
            {week.map((date, dayIndex) => (
              <div
                key={date.format('YYYY-MM-DD')}
                className="relative h-24 border-r border-gray-200 dark:border-slate-700 last:border-r-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                onClick={() => onDateClick?.(date.toDate())}
              >
                {/* 日期数字 - 位于右上角 */}
                <div className="absolute top-2 right-2">
                  {isToday(date) ? (
                    /* 今天的高亮样式 - 靛蓝色圆形背景，白色文字 */
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-indigo-500 text-white text-sm font-semibold rounded-full">
                      {date.format('D')}
                    </span>
                  ) : (
                    /* 普通日期样式 */
                    <span className={`text-sm ${
                      isCurrentMonth(date)
                        ? 'text-gray-600 dark:text-gray-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}>
                      {date.format('D')}
                    </span>
                  )}
                </div>
                
                {/* 事件内容区域 */}
                <div className="pt-8 px-1 pb-1 h-full overflow-y-auto space-y-1">
                  {events
                    .filter(evt => moment(evt.start).isSame(date, 'day'))
                    .map((evt) => (
                      <div
                        key={evt.id}
                        className="text-[11px] leading-tight rounded px-1 py-0.5 truncate cursor-pointer border"
                        style={{
                          backgroundColor: (evt.color || '#93C5FD') + '20', // 低不透明背景
                          color: '#1f2937',
                          borderColor: evt.color || '#93C5FD'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick?.(evt);
                        }}
                        title={`${evt.title} (${moment(evt.start).format('HH:mm')}-${moment(evt.end).format('HH:mm')})`}
                      >
                        <span className="font-medium">{evt.title}</span>
                        <span className="ml-1 text-[10px] text-slate-600">{moment(evt.start).format('HH:mm')} - {moment(evt.end).format('HH:mm')}</span>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
