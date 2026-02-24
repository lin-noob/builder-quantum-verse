import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DateTimePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  showTime?: boolean;
  placeholder?: string;
  className?: string;
}

export function DateTimePicker({
  value,
  onChange,
  showTime = true,
  placeholder = "选择日期时间",
  className,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(value);
  const [timeValue, setTimeValue] = React.useState<string>(() => {
    if (value) {
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${pad(value.getHours())}:${pad(value.getMinutes())}`;
    }
    return '09:00';
  });

  React.useEffect(() => {
    setSelectedDate(value);
    if (value && showTime) {
      const pad = (n: number) => String(n).padStart(2, '0');
      setTimeValue(`${pad(value.getHours())}:${pad(value.getMinutes())}`);
    }
  }, [value, showTime]);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      setSelectedDate(undefined);
      onChange(undefined);
      return;
    }

    setSelectedDate(date);

    if (showTime) {
      const [hours, minutes] = timeValue.split(':').map(Number);
      date.setHours(hours, minutes, 0, 0);
    } else {
      date.setHours(0, 0, 0, 0);
    }

    onChange(date);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTimeValue(newTime);

    if (selectedDate) {
      const [hours, minutes] = newTime.split(':').map(Number);
      const newDate = new Date(selectedDate);
      newDate.setHours(hours, minutes, 0, 0);
      onChange(newDate);
    }
  };

  const formatDisplayValue = () => {
    if (!selectedDate) return '';
    
    const pad = (n: number) => String(n).padStart(2, '0');
    const dateStr = `${selectedDate.getFullYear()}-${pad(selectedDate.getMonth() + 1)}-${pad(selectedDate.getDate())}`;
    
    if (showTime) {
      return `${dateStr} ${timeValue}`;
    }
    
    return dateStr;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !selectedDate && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? formatDisplayValue() : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          initialFocus
        />
        {showTime && (
          <div className="p-3 border-t">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">时间:</label>
              <Input
                type="time"
                value={timeValue}
                onChange={handleTimeChange}
                className="w-32"
              />
            </div>
          </div>
        )}
        <div className="p-3 border-t flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedDate(undefined);
              onChange(undefined);
              setOpen(false);
            }}
          >
            清除
          </Button>
          <Button
            size="sm"
            onClick={() => setOpen(false)}
          >
            确定
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
