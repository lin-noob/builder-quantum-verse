import { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface AdvancedDateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  onPresetChange?: (preset: string) => void;
}

const presetRanges = {
  today: () => {
    const today = new Date();
    return { start: today, end: today };
  },
  yesterday: () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return { start: yesterday, end: yesterday };
  },
  last7days: () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 6);
    return { start, end };
  },
  last30days: () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 29);
    return { start, end };
  },
  thisMonth: () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { start, end };
  },
  lastMonth: () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    return { start, end };
  }
};

export default function AdvancedDateRangePicker({ value, onChange, onPresetChange }: AdvancedDateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activePreset, setActivePreset] = useState('last30days');
  const [leftCalendarDate, setLeftCalendarDate] = useState(new Date(2025, 6)); // July 2025
  const [rightCalendarDate, setRightCalendarDate] = useState(new Date(2025, 7)); // August 2025
  const [tempRange, setTempRange] = useState<DateRange>(value);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mock dates for demo
  const mockStart = new Date(2025, 6, 12); // July 12, 2025
  const mockEnd = new Date(2025, 7, 10); // August 10, 2025
  const today = new Date(2025, 7, 11); // August 11, 2025

  useEffect(() => {
    if (!tempRange.start || !tempRange.end) {
      setTempRange({ start: mockStart, end: mockEnd });
    }
  }, []);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  const formatDisplayRange = (range: DateRange) => {
    if (!range.start || !range.end) return '过去30天';
    if (range.start.getTime() === range.end.getTime()) {
      return formatDate(range.start);
    }
    return `${formatDate(range.start)} - ${formatDate(range.end)}`;
  };

  const handlePresetClick = (preset: string) => {
    setActivePreset(preset);
    if (preset === 'custom') return;
    
    const range = presetRanges[preset as keyof typeof presetRanges]();
    setTempRange(range);
    onChange(range);
    onPresetChange?.(preset);
  };

  const isDateInRange = (date: Date, range: DateRange) => {
    if (!range.start || !range.end) return false;
    return date >= range.start && date <= range.end;
  };

  const isDateToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const isDateRangeStart = (date: Date, range: DateRange) => {
    return range.start && date.toDateString() === range.start.toDateString();
  };

  const isDateRangeEnd = (date: Date, range: DateRange) => {
    return range.end && date.toDateString() === range.end.toDateString();
  };

  const renderCalendar = (calendarDate: Date, isLeft: boolean) => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }

    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

    return (
      <div className="w-64">
        {/* Calendar Header */}
        <div className="flex items-center justify-between p-2 border-b">
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                if (isLeft) {
                  setLeftCalendarDate(new Date(year, month - 1));
                  setRightCalendarDate(new Date(year, month));
                } else {
                  setLeftCalendarDate(new Date(year, month - 2));
                  setRightCalendarDate(new Date(year, month - 1));
                }
              }}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                if (isLeft) {
                  setLeftCalendarDate(new Date(year, month - 12));
                  setRightCalendarDate(new Date(year, month - 11));
                } else {
                  setLeftCalendarDate(new Date(year, month - 13));
                  setRightCalendarDate(new Date(year, month - 12));
                }
              }}
              className="p-1 hover:bg-gray-100 rounded text-xs"
            >
              «
            </button>
          </div>
          
          <div className="font-medium text-sm">
            {year}年 {monthNames[month]}
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                if (isLeft) {
                  setLeftCalendarDate(new Date(year, month + 12));
                  setRightCalendarDate(new Date(year, month + 13));
                } else {
                  setLeftCalendarDate(new Date(year, month + 11));
                  setRightCalendarDate(new Date(year, month + 12));
                }
              }}
              className="p-1 hover:bg-gray-100 rounded text-xs"
            >
              »
            </button>
            <button
              onClick={() => {
                if (isLeft) {
                  setLeftCalendarDate(new Date(year, month + 1));
                  setRightCalendarDate(new Date(year, month + 2));
                } else {
                  setLeftCalendarDate(new Date(year, month));
                  setRightCalendarDate(new Date(year, month + 1));
                }
              }}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-0 text-xs text-gray-500 py-2">
          {['日', '一', '二', '三', '四', '五', '六'].map(day => (
            <div key={day} className="h-8 flex items-center justify-center font-medium">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-0">
          {days.map((date, index) => {
            const isCurrentMonth = date.getMonth() === month;
            const isInRange = isDateInRange(date, tempRange);
            const isRangeStart = isDateRangeStart(date, tempRange);
            const isRangeEnd = isDateRangeEnd(date, tempRange);
            const isTodayDate = isDateToday(date);

            return (
              <button
                key={index}
                onClick={() => {
                  // Handle date selection logic here
                  if (!tempRange.start || (tempRange.start && tempRange.end)) {
                    setTempRange({ start: date, end: null });
                  } else if (tempRange.start && !tempRange.end) {
                    if (date >= tempRange.start) {
                      const newRange = { start: tempRange.start, end: date };
                      setTempRange(newRange);
                      onChange(newRange);
                    } else {
                      setTempRange({ start: date, end: tempRange.start });
                      onChange({ start: date, end: tempRange.start });
                    }
                  }
                }}
                className={cn(
                  "h-8 w-8 text-xs flex items-center justify-center relative hover:bg-gray-100 transition-colors",
                  !isCurrentMonth && "text-gray-300",
                  isCurrentMonth && "text-gray-900",
                  isTodayDate && !isRangeStart && !isRangeEnd && "border border-blue-500 rounded-full",
                  (isRangeStart || isRangeEnd) && "bg-blue-600 text-white rounded-full font-medium",
                  isInRange && !isRangeStart && !isRangeEnd && "bg-blue-100"
                )}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Button */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 min-w-[200px] justify-between"
      >
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>{formatDisplayRange(tempRange)}</span>
        </div>
        <ChevronLeft className={cn("h-4 w-4 transition-transform", isOpen && "rotate-90")} />
      </Button>

      {/* Picker Panel */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 w-[90vw] max-w-[800px] min-w-[600px]">
          {/* Top Quick Action Bar */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b">
            <div className="flex items-center gap-2">
              {[
                { key: 'today', label: '今日' },
                { key: 'last7days', label: '近7天' },
                { key: 'last30days', label: '近30天' },
                { key: 'lastMonth', label: '上月' },
                { key: 'thisMonth', label: '今年' },
                { key: 'custom', label: '自定义' }
              ].map(preset => (
                <Button
                  key={preset.key}
                  variant={activePreset === preset.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePresetClick(preset.key)}
                  className="text-xs"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            
            <div className="flex items-center gap-2">
              <Input
                value={formatDate(tempRange.start)}
                readOnly
                className="w-32 text-xs"
              />
              <Calendar className="h-4 w-4 text-gray-400" />
              <Input
                value={formatDate(tempRange.end)}
                readOnly
                className="w-32 text-xs"
              />
            </div>
          </div>

          <div className="flex gap-4">
            {/* Left Preset List */}
            <div className="w-32 pr-4 border-r">
              <div className="space-y-1">
                {[
                  { key: 'today', label: '今天' },
                  { key: 'yesterday', label: '昨天' },
                  { key: 'last7days', label: '最近7天' },
                  { key: 'last30days', label: '最近30天' },
                  { key: 'thisMonth', label: '本月' },
                  { key: 'lastMonth', label: '上月' }
                ].map(preset => (
                  <button
                    key={preset.key}
                    onClick={() => handlePresetClick(preset.key)}
                    className={cn(
                      "w-full text-left px-2 py-1 text-xs rounded hover:bg-gray-100 transition-colors",
                      activePreset === preset.key && "bg-blue-50 text-blue-700"
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Center Calendar Area */}
            <div className="flex gap-4">
              {renderCalendar(leftCalendarDate, true)}
              {renderCalendar(rightCalendarDate, false)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
