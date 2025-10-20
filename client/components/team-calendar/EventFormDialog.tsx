import { useEffect, useMemo, useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getTeamMembers } from '@/data/teamCalendarData';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color?: string; // 可选颜色，用于网格事件chip背景
  description?: string;
  allDay?: boolean;
  assigneeId?: string;
  type?: 'meeting' | 'task' | 'other';
  priority?: 'high' | 'medium' | 'low';
  reminderMinutes?: number;
}

interface EventFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialEvent?: CalendarEvent | null;
  initialDate?: Date; // 新建时用于默认日期
  onSave: (event: CalendarEvent) => void;
}

export default function EventFormDialog({ open, onOpenChange, initialEvent, initialDate, onSave }: EventFormDialogProps) {
  const [title, setTitle] = useState('');
  const [startStr, setStartStr] = useState('');
  const [endStr, setEndStr] = useState('');
  const [description, setDescription] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [assigneeId, setAssigneeId] = useState<string | undefined>(undefined);
  const [typeVal, setTypeVal] = useState<'meeting' | 'task' | 'other'>('meeting');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [reminderStr, setReminderStr] = useState('');
  const [color, setColor] = useState('#93C5FD');
  const [saving, setSaving] = useState(false);

  // 生成默认日期时间字符串（datetime-local）
  const defaultStartEnd = useMemo(() => {
    const base = initialEvent?.start || initialDate || new Date();
    const start = new Date(base);
    start.setHours(9, 0, 0, 0);
    const end = new Date(base);
    end.setHours(10, 0, 0, 0);
    return { start, end };
  }, [initialEvent, initialDate]);

  const toInputValue = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const toDateOnlyValue = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  useEffect(() => {
    setTitle(initialEvent?.title || '');
    const s = initialEvent?.start ? initialEvent.start : defaultStartEnd.start;
    const e = initialEvent?.end ? initialEvent.end : defaultStartEnd.end;
    setStartStr(toInputValue(s));
    setEndStr(toInputValue(e));
    setDescription(initialEvent?.description || '');
    setAllDay(!!initialEvent?.allDay);
    setAssigneeId(initialEvent?.assigneeId);
    setTypeVal(initialEvent?.type || 'meeting');
    setPriority(initialEvent?.priority || 'medium');
    setReminderStr(
      initialEvent?.reminderMinutes !== undefined
        ? String(initialEvent.reminderMinutes)
        : ''
    );
    setColor(initialEvent?.color || '#93C5FD');
  }, [initialEvent, defaultStartEnd]);

  const handleSave = async () => {
    if (!title.trim()) return;
    let start: Date;
    let end: Date;
    if (allDay) {
      // 日期格式：YYYY-MM-DD，将开始设为00:00，结束设为23:59
      const s = new Date(`${startStr}T00:00:00`);
      const e = new Date(`${endStr}T23:59:00`);
      start = s;
      end = e;
    } else {
      start = new Date(startStr);
      end = new Date(endStr);
    }
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return;
    if (end <= start) return;
    setSaving(true);
    // 轻量生成ID：编辑保留原ID，新建用时间戳
    const id = initialEvent?.id || `evt-${Date.now()}`;
    const reminderMinutes = reminderStr ? Number(reminderStr) : undefined;
    onSave({
      id,
      title: title.trim(),
      start,
      end,
      color,
      description: description.trim() || undefined,
      allDay,
      assigneeId,
      type: typeVal,
      priority,
      reminderMinutes,
    });
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent side="right" className="w-[720px]">
        <DrawerHeader>
          <DrawerTitle>{initialEvent ? '编辑日程' : '新建日程'}</DrawerTitle>
        </DrawerHeader>
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">标题</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例如：客户会议" />
          </div>

          {/* 描述优先显示并更明显 */}
          <div className="space-y-2">
            <Label htmlFor="description">描述</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="补充说明、议程要点等"
              className="min-h-[120px] text-sm border-2 border-indigo-300 focus-visible:ring-indigo-500"
            />
            <div className="text-xs text-indigo-600">建议先完善描述，便于团队协作与沟通</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start">开始时间</Label>
              {allDay ? (
                <Input id="start" type="date" value={toDateOnlyValue(new Date(startStr))} onChange={(e) => setStartStr(e.target.value)} />
              ) : (
                <Input id="start" type="datetime-local" value={startStr} onChange={(e) => setStartStr(e.target.value)} />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">结束时间</Label>
              {allDay ? (
                <Input id="end" type="date" value={toDateOnlyValue(new Date(endStr))} onChange={(e) => setEndStr(e.target.value)} />
              ) : (
                <Input id="end" type="datetime-local" value={endStr} onChange={(e) => setEndStr(e.target.value)} />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between py-1">
              <div className="space-y-1">
                <Label>全天</Label>
                <div className="text-xs text-muted-foreground">勾选后以日期为单位</div>
              </div>
              <Switch checked={allDay} onCheckedChange={setAllDay} />
            </div>
            <div className="space-y-2">
              <Label>颜色</Label>
              <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>负责人</Label>
              <Select value={assigneeId} onValueChange={(v) => setAssigneeId(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="选择负责人" />
                </SelectTrigger>
                <SelectContent>
                  {getTeamMembers().map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>类型</Label>
              <Select value={typeVal} onValueChange={(v) => setTypeVal(v as 'meeting' | 'task' | 'other')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meeting">会议</SelectItem>
                  <SelectItem value="task">任务</SelectItem>
                  <SelectItem value="other">其他</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>优先级</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as 'high' | 'medium' | 'low')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">高</SelectItem>
                  <SelectItem value="medium">中</SelectItem>
                  <SelectItem value="low">低</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reminder">提醒（分钟）</Label>
              <Input id="reminder" type="number" min={0} placeholder="例如：15" value={reminderStr} onChange={(e) => setReminderStr(e.target.value)} />
            </div>
          </div>

          
        </div>
        <DrawerFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={handleSave} disabled={saving || !title.trim()}>保存</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}