import { Messages } from 'react-big-calendar';
import { dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';

const locales = {
  'zh-CN': zhCN,
  'en-US': enUS,
};

export const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export const calendarMessages: Record<string, Messages> = {
  'zh-CN': {
    allDay: '全天',
    previous: '上一页',
    next: '下一页',
    today: '今天',
    month: '月',
    week: '周',
    day: '日',
    agenda: '日程',
    date: '日期',
    time: '时间',
    event: '事件',
    noEventsInRange: '此时间范围内没有事件',
    showMore: (total) => `+ 更多 (${total})`,
  },
  'en-US': {
    allDay: 'All Day',
    previous: 'Previous',
    next: 'Next',
    today: 'Today',
    month: 'Month',
    week: 'Week',
    day: 'Day',
    agenda: 'Agenda',
    date: 'Date',
    time: 'Time',
    event: 'Event',
    noEventsInRange: 'No events in this range',
    showMore: (total) => `+ View more (${total})`,
  },
};

export function getCalendarLocale(language: string = 'zh-CN') {
  return language in locales ? language : 'zh-CN';
}