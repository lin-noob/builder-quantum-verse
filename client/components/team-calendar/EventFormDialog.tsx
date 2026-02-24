import { useEffect, useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import ApproverSelector, {
  ApproverOption,
} from "@/pages/ApprovalConfig/components/ApproverSelector";
import { teamCalendarService } from "@/services/teamCalendarService";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { request } from "@/lib/request";

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color?: string;
  description?: string;
  allDay?: boolean;
  assigneeId?: string;
  userId?: number | string;
  userName?: string;
  type?: "meeting" | "task" | "other";
  priority?: "high" | "medium" | "low";
  reminderMinutes?: number;
}

interface EventFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialEvent?: CalendarEvent | null;
  initialDate?: Date;
  onSave: () => void;
}

export default function EventFormDialog({
  open,
  onOpenChange,
  initialEvent,
  initialDate,
  onSave,
}: EventFormDialogProps) {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [description, setDescription] = useState("");
  const [allDay, setAllDay] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<ApproverOption[]>([]);
  const [typeVal, setTypeVal] = useState<"meeting" | "task" | "other">(
    "meeting",
  );
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [reminderStr, setReminderStr] = useState("");
  const [color, setColor] = useState("#93C5FD");
  const [saving, setSaving] = useState(false);

  const formatDateTime = (d: Date): string => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  useEffect(() => {
    setTitle(initialEvent?.title || "");

    const base = initialEvent?.start || initialDate || new Date();
    const defaultStart = new Date(base);
    defaultStart.setHours(9, 0, 0, 0);
    const defaultEnd = new Date(base);
    defaultEnd.setHours(10, 0, 0, 0);

    setStartDate(initialEvent?.start || defaultStart);
    setEndDate(initialEvent?.end || defaultEnd);
    setDescription(initialEvent?.description || "");
    setAllDay(!!initialEvent?.allDay);

    if (initialEvent?.userId) {
      setSelectedUsers([
        {
          userId: initialEvent.userId,
          userName: initialEvent.userName,
        },
      ]);
    } else {
      setSelectedUsers([]);
    }

    setTypeVal(initialEvent?.type || "meeting");
    setPriority(initialEvent?.priority || "medium");
    setReminderStr(
      initialEvent?.reminderMinutes !== undefined
        ? String(initialEvent.reminderMinutes)
        : "",
    );
    setColor(initialEvent?.color || "#93C5FD");
  }, [initialEvent, initialDate]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("请输入标题");
      return;
    }

    if (!startDate || !endDate) {
      toast.error("请选择开始和结束时间");
      return;
    }

    let start = new Date(startDate);
    let end = new Date(endDate);

    if (allDay) {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    }

    if (end <= start) {
      toast.error("结束时间必须晚于开始时间");
      return;
    }

    try {
      // 确保 userId 正确处理为字符串或数字类型
      let userId;
      if (selectedUsers.length > 0) {
        const selectedUserId = selectedUsers[0].userId;
        userId = selectedUserId;
      } else {
        userId = undefined;
      }

      if (!userId) {
        toast.error("请选择负责人");
        return;
      }

      setSaving(true);
      const reminderMinutes = reminderStr ? Number(reminderStr) : undefined;

      const typeMap: Record<"meeting" | "task" | "other", number> = {
        meeting: 0,
        task: 1,
        other: 2,
      };

      const priorityMap: Record<"high" | "medium" | "low", number> = {
        high: 0,
        medium: 1,
        low: 2,
      };

      const requestData = {
        title: title.trim(),
        description: description.trim() || undefined,
        allDay,
        color,
        type: typeMap[typeVal],
        priority: priorityMap[priority],
        reminderMinutes,
        userId: String(userId),
        startDate: formatDateTime(start),
        endDate: formatDateTime(end),
      };

      let savedEvent;
      if (initialEvent?.id) {
        savedEvent = await teamCalendarService.updateEvent(
          initialEvent.id,
          requestData,
        );
        toast.success("日程已更新");
      } else {
        savedEvent = await teamCalendarService.createEvent(requestData);
        toast.success("日程已创建");
      }

      const typeNumberToString: Record<number, "meeting" | "task" | "other"> = {
        0: "meeting",
        1: "task",
        2: "other",
      };

      const priorityNumberToString: Record<number, "high" | "medium" | "low"> =
        {
          0: "high",
          1: "medium",
          2: "low",
        };

      onOpenChange(false);
      onSave();
    } catch (error) {
      console.error("Failed to save event:", error);
      toast.error(error instanceof Error ? error.message : "保存失败，请重试");
    } finally {
      setSaving(false);
    }
  };

  // Delete functionality
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    if (!initialEvent?.id) return;

    setIsDeleting(true);
    try {
      const formData = new FormData();
      formData.append("ids", initialEvent.id);
      const response = await request.post(
        "/admin/api/v1/team/delete",
        formData,
      );

      if (response.status === 200) {
        toast.success("日程删除成功");
        onOpenChange(false); // Close the dialog
        onSave(); // Trigger refresh
      } else {
        throw new Error("删除失败");
      }
    } catch (error) {
      console.error("Failed to delete event:", error);
      toast.error(error instanceof Error ? error.message : "删除失败，请重试");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      direction="right"
      modal={false}
    >
      <DrawerContent
        side="right"
        className="w-[720px] overflow-y-auto rounded-tl-xl rounded-bl-xl shadow-2xl border-0 overflow-hidden"
      >
        <DrawerHeader>
          <DrawerTitle>{initialEvent ? "编辑日程" : "新建日程"}</DrawerTitle>
        </DrawerHeader>
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">标题</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：客户会议"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">描述</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="补充说明、议程要点等"
              className="min-h-[120px] text-sm border-2 border-indigo-300 focus-visible:ring-indigo-500"
            />
            <div className="text-xs text-indigo-600">
              建议先完善描述，便于团队协作与沟通
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>开始时间</Label>
              <DateTimePicker
                value={startDate}
                onChange={setStartDate}
                showTime={!allDay}
                placeholder="选择开始时间"
              />
            </div>
            <div className="space-y-2">
              <Label>结束时间</Label>
              <DateTimePicker
                value={endDate}
                onChange={setEndDate}
                showTime={!allDay}
                placeholder="选择结束时间"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between py-1">
              <div className="space-y-1">
                <Label>全天</Label>
                <div className="text-xs text-muted-foreground">
                  勾选后以日期为单位
                </div>
              </div>
              <Switch checked={allDay} onCheckedChange={setAllDay} />
            </div>
            <div className="space-y-2">
              <Label>颜色</Label>
              <Input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>负责人（用户ID）</Label>
            <ApproverSelector
              value={selectedUsers}
              onChange={setSelectedUsers}
              fetchOptions={teamCalendarService.fetchTeamMembers}
              placeholder="选择负责人"
              selectionMode="single"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>类型</Label>
              <Select
                value={typeVal}
                onValueChange={(v) =>
                  setTypeVal(v as "meeting" | "task" | "other")
                }
              >
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
            <div className="space-y-2">
              <Label>优先级</Label>
              <Select
                value={priority}
                onValueChange={(v) =>
                  setPriority(v as "high" | "medium" | "low")
                }
              >
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminder">提醒时长（分钟）</Label>
            <Input
              id="reminder"
              type="number"
              min={0}
              placeholder="例如：15"
              value={reminderStr}
              onChange={(e) => setReminderStr(e.target.value)}
            />
          </div>
        </div>

        <DrawerFooter>
          {initialEvent?.id && (
            <Button
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={saving || isDeleting}
              className="mt-2"
            >
              {isDeleting ? "删除中..." : "删除日程"}
            </Button>
          )}
          <div className="flex w-full gap-2">
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              {saving ? "保存中..." : initialEvent ? "保存修改" : "创建日程"}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              取消
            </Button>
          </div>
        </DrawerFooter>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={showDeleteConfirm}
          onOpenChange={setShowDeleteConfirm}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>删除日程</AlertDialogTitle>
              <AlertDialogDescription>
                您确定要删除「{initialEvent?.title}
                」这个日程吗？此操作不可撤销。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? "删除中..." : "删除"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DrawerContent>
    </Drawer>
  );
}
