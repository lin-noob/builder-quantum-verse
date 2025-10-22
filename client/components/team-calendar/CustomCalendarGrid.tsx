import React from 'react';
import moment from 'moment';
import type { CalendarEvent } from './EventFormDialog';
import { CalendarView } from '@shared/types';

interface CustomCalendarGridProps {
  currentDate: Date;
  onDateClick?: (date: Date) => void;
  events?: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  calendarView?: CalendarView;
}

export default function CustomCalendarGrid({ 
  currentDate, 
  onDateClick, 
  events = [], 
  onEventClick,
  calendarView = 'month'
}: CustomCalendarGridProps) {
  // 根据视图类型生成日期范围
  let gridDates: moment.Moment[] = [];
  let dayHeaders: string[] = [];

  if (calendarView === 'week') {
    // 周视图：获取当前日期所在周的开始和结束日期
    const startOfWeek = moment(currentDate).startOf('week');
    const endOfWeek = moment(currentDate).endOf('week');
    
    // 生成周视图的日期
    let currentDay = moment(startOfWeek);
    while (currentDay.isSameOrBefore(endOfWeek)) {
      gridDates.push(moment(currentDay));
      currentDay.add(1, 'day');
    }
    
    dayHeaders = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  } else if (calendarView === 'day') {
    // 日视图：只显示当前日期
    gridDates = [moment(currentDate)];
    dayHeaders = [moment(currentDate).format('M月D日 dddd')];
  } else { // month
    // 月视图：获取当前月份的第一天和最后一天
    const startOfMonth = moment(currentDate).startOf('month');
    const endOfMonth = moment(currentDate).endOf('month');
    
    // 获取日历网格的开始和结束日期（包含前后月份的日期）
    const startOfCalendar = moment(startOfMonth).startOf('week');
    const endOfCalendar = moment(endOfMonth).endOf('week');
    
    // 生成日历网格的所有日期
    let currentDay = moment(startOfCalendar);
    while (currentDay.isSameOrBefore(endOfCalendar)) {
      gridDates.push(moment(currentDay));
      currentDay.add(1, 'day');
    }
    
    dayHeaders = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  }

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
  
  // 计算需要显示的周数，确保一致的网格布局
  let weeks = [];
  if (calendarView === 'month') {
    for (let i = 0; i < gridDates.length; i += 7) {
      weeks.push(gridDates.slice(i, i + 7));
    }
  } else if (calendarView === 'week') {
    weeks = [gridDates]; // 周视图只需要一行
  } else { // day
    weeks = [[gridDates[0]]]; // 日视图只显示一天
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
      {/* 星期标题行 */}
      <div className={`grid grid-cols-${calendarView === 'day' ? '1' : '7'} border-b border-gray-200 dark:border-slate-700`}>
        {dayHeaders.map((day, index) => (
          <div
            key={day}
            className={`py-3 px-2 text-center text-sm font-medium border-r border-gray-200 dark:border-slate-700 ${calendarView === 'day' ? 'last:border-r-0' : (index === 6 ? 'last:border-r-0' : '')} ${
              calendarView !== 'day' && isWeekend(index)
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
          <div 
            key={weekIndex} 
            className={`grid ${calendarView === 'day' ? 'grid-cols-1' : 'grid-cols-7'} border-b border-gray-200 dark:border-slate-700 last:border-b-0 ${
              calendarView === 'day' ? 'h-[calc(100vh-200px)]' : ''
            }`}
          >
            {week.map((date, dayIndex) => (
              <div
                key={date.format('YYYY-MM-DD')}
                className={`${calendarView === 'day' ? 'h-auto' : 'relative h-24'} border-r border-gray-200 dark:border-slate-700 ${
                  calendarView === 'day' ? '' : 'last:border-r-0'
                } cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors`}
                onClick={() => onDateClick?.(date.toDate())}
              >
                {/* 日期数字 - 位于右上角 */}
                {calendarView !== 'day' && (
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
                )}
                
                {/* 事件内容区域 */}
                <div className={`${
                  calendarView === 'day' ? 'p-4 h-full' : 'pt-8 px-1 pb-1 h-full'
                } overflow-y-auto space-y-1`}>
                  {events
                    .filter(evt => moment(evt.start).isSame(date, 'day'))
                    .map((evt) => (
                      <div
                        key={evt.id}
                        className={`text-[11px] leading-tight rounded px-1 py-0.5 truncate cursor-pointer border ${
                          calendarView === 'day' ? 'text-sm' : ''
                        }`}
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
                        <span className={`ml-1 ${
                          calendarView === 'day' ? 'text-sm' : 'text-[10px]'
                        } text-slate-600`}>
                          {moment(evt.start).format('HH:mm')} - {moment(evt.end).format('HH:mm')}
                        </span>
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