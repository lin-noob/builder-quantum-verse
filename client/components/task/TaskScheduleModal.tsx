import { useState, useEffect } from 'react';
import { Task } from '@shared/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, Save, X } from 'lucide-react';
import { format, addHours, startOfDay } from 'date-fns';

interface TaskScheduleModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskId: string, scheduledTime: { start: Date; end: Date }) => void;
}

export default function TaskScheduleModal({ task, isOpen, onClose, onSave }: TaskScheduleModalProps) {
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // Initialize form when task changes
  useEffect(() => {
    if (task && isOpen) {
      // Set default to today if no existing schedule
      const defaultDate = task.scheduledTime?.start || task.dueDate || new Date();
      const defaultStartTime = task.scheduledTime?.start || new Date();
      const defaultEndTime = task.scheduledTime?.end || addHours(defaultStartTime, 1);

      setStartDate(format(defaultDate, 'yyyy-MM-dd'));
      setStartTime(format(defaultStartTime, 'HH:mm'));
      setEndTime(format(defaultEndTime, 'HH:mm'));
    }
  }, [task, isOpen]);

  const handleSave = () => {
    if (!task || !startDate || !startTime || !endTime) return;

    try {
      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = new Date(`${startDate}T${endTime}`);

      if (endDateTime <= startDateTime) {
        alert('结束时间必须晚于开始时间');
        return;
      }

      onSave(task.id, {
        start: startDateTime,
        end: endDateTime
      });

      onClose();
    } catch (error) {
      alert('时间格式错误，请检查输入');
    }
  };

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-eip-accent" />
            安排任务时间
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Task Info */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
            <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
              {task.title}
            </h4>
            <div className="flex items-center space-x-2">
              <Avatar className="w-5 h-5">
                <AvatarImage src={task.assignee.avatarUrl} />
                <AvatarFallback className="text-xs bg-eip-accent text-white">
                  {task.assignee.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                负责人: {task.assignee.name}
              </span>
            </div>
            {task.dueDate && (
              <div className="flex items-center mt-2 text-sm text-slate-600 dark:text-slate-400">
                <Clock className="w-4 h-4 mr-1" />
                截止时间: {format(task.dueDate, 'yyyy-MM-dd HH:mm')}
              </div>
            )}
          </div>

          {/* Scheduling Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="date">日期</Label>
              <Input
                id="date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-time">开始时间</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="end-time">结束时间</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Time Summary */}
            {startDate && startTime && endTime && (
              <div className="bg-eip-accent/5 border border-eip-accent/20 rounded-lg p-3">
                <div className="text-sm text-eip-accent">
                  <strong>安排时间:</strong> {startDate} {startTime} - {endTime}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            取消
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!startDate || !startTime || !endTime}
            className="bg-eip-accent hover:bg-eip-accent/90"
          >
            <Save className="w-4 h-4 mr-2" />
            保存安排
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
