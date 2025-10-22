import { useState, useMemo, useCallback, useEffect } from "react";
import { Calendar, View } from "react-big-calendar";
import { useTranslation } from "react-i18next";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "@/styles/calendar.css";
import { ColorBy, CalendarView } from "@shared/types";
import {
  getTeamMembers,
  getAISuggestedTasks,
  getTaskColor,
} from "@/data/teamCalendarData";
import { teamCalendarService } from "@/services/teamCalendarService";
import {
  localizer,
  calendarMessages,
  getCalendarLocale,
} from "@/utils/calendar-localization";
import MiniMonthNavigator from "@/components/team-calendar/MiniMonthNavigator";
import AIWorkloadAnalyzer from "@/components/team-calendar/AIWorkloadAnalyzer";
import ViewFilters from "@/components/team-calendar/ViewFilters";
import CalendarToolbar from "@/components/team-calendar/CalendarToolbar";
import { toast } from "sonner";
import { Brain } from "lucide-react";
import EventFormDialog, {
  type CalendarEvent,
} from "@/components/team-calendar/EventFormDialog";
import CustomCalendarGrid from "@/components/team-calendar/CustomCalendarGrid";
import { CustomCalendarEvent } from "@/components/team-calendar/CustomCalendarEvent";

export default function TeamCalendar() {
  const { i18n } = useTranslation();
  const [colorBy, setColorBy] = useState<ColorBy>("assignee");
  const [calendarView, setCalendarView] = useState<CalendarView>("month");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [showExternal, setShowExternal] = useState(true);
  const [highlightedMember, setHighlightedMember] = useState<string>();
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentMonthStr, setCurrentMonthStr] = useState<string>('');
  const [userEvents, setUserEvents] = useState<CalendarEvent[]>([]);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [dialogInitialDate, setDialogInitialDate] = useState<Date | undefined>(
    undefined,
  );
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // 第一步：初始化团队成员但默认不选中任何成员，同时设置当前月份
  useEffect(() => {
    const initializeMembers = async () => {
      const members = await getTeamMembers();
      // 默认不选中任何成员
      setSelectedMembers([]);
    };
    // initializeMembers();
    
    // 初始化月份字符串
    setCurrentMonthStr(getMonthStr(new Date()));
  }, []);

  // 生成月份字符串 (格式: YYYY-MM)
  const getMonthStr = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  // 当日期或成员变化时，如果月份变化了则重新加载事件
  useEffect(() => {
    const newMonthStr = getMonthStr(currentDate);
    
    // 只有月份改变时才重新加载数据
    if (newMonthStr !== currentMonthStr) {
      setCurrentMonthStr(newMonthStr);
    }
  }, [currentDate]);

  // 当月份或成员变化时，加载日程数据
  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      try {
        // 如果没有选择任何成员，则查询所有成员（不传递userId参数或传递空值）
        // 如果选择了成员，则只查询这些成员的事件
        const userId = selectedMembers.length > 0 ? selectedMembers.join(",") : undefined;
        // 传递月份字符串给后端
        const events = await teamCalendarService.getEventList(userId, currentMonthStr);

        const typeNumberToString: Record<number, "meeting" | "task" | "other"> =
          {
            0: "meeting",
            1: "task",
            2: "other",
          };

        const priorityNumberToString: Record<
          number,
          "high" | "medium" | "low"
        > = {
          0: "high",
          1: "medium",
          2: "low",
        };

        const calendarEvents: CalendarEvent[] = events.map((event) => ({
          id: event.id,
          title: event.title,
          start: new Date(event.startDate),
          end: new Date(event.endDate),
          color: event.color,
          description: event.description,
          allDay: event.allDay,
          userId: event.userId,
          userName: event.userName,
          type:
            event.type !== undefined
              ? typeNumberToString[event.type]
              : "meeting",
          priority:
            event.priority !== undefined
              ? priorityNumberToString[event.priority]
              : "medium",
          reminderMinutes: event.reminderMinutes,
        }));

        setUserEvents(calendarEvents);
      } catch (error) {
        console.error("Failed to load events:", error);
        toast.error("加载日程失败");
      } finally {
        setLoading(false);
      }
    };

    // 只在月份变化或成员变化时加载数据
    if (currentMonthStr) {
      loadEvents();
    }
  }, [currentMonthStr, selectedMembers]);

  // 转换任务为日历事件格式 (react-big-calendar 格式)
  const calendarEvents = useMemo(() => {
    return userEvents.map(event => ({
      ...event,
      title: event.title,
      start: new Date(event.start),
      end: new Date(event.end),
      allDay: event.allDay || false,
    }));
  }, [userEvents]);

  // 处理成员筛选
  const handleMemberToggle = useCallback((memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId],
    );
  }, []);

  // 处理外部会议切换
  const handleExternalToggle = useCallback((show: boolean) => {
    setShowExternal(show);
  }, []);

  // 处理AI建议显示
  const handleShowAISuggestions = useCallback(() => {
    setShowAISuggestions(true);
    toast.info(
      <div className="flex items-center space-x-3">
        <Brain className="w-5 h-5 text-indigo-500" />
        <div>
          <div className="font-medium">
            AI已为"客户数据分析报告"生成排班建议
          </div>
          <div className="text-sm text-slate-600 mt-1">
            建议将过载任务重新分配给资源利用率较低的团队成员
          </div>
        </div>
      </div>,
      {
        duration: 10000,
        action: {
          label: "采纳此排期",
          onClick: () => {
            toast.success("已采纳AI排期建议，任务已正式加入日程");
            // 这里可以添加采纳逻辑
          },
        },
      },
    );
  }, []);

  // 处理成员高亮
  const handleHighlightMember = useCallback((memberId: string) => {
    setHighlightedMember(memberId);
    // 3秒后清除高亮
    setTimeout(() => setHighlightedMember(undefined), 3000);
  }, []);

  // 处理迷你日历日期选择
  const handleMiniCalendarSelect = useCallback(
    (date: Date) => {
      setCurrentDate(date);
      // 切换到日视图以突出显示选中的日期
      if (calendarView === "month") {
        setCalendarView("day");
      }
    },
    [calendarView],
  );

  // 处理迷你日历月份变化
  const handleMiniCalendarMonthChange = useCallback((date: Date) => {
    setCurrentDate(date);
  }, []);

  // 处理今天按钮点击
  const handleTodayClick = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  // 处理新建事件
  const handleNewEvent = useCallback(() => {
    setEditingEvent(null);
    setDialogInitialDate(currentDate);
    setEventDialogOpen(true);
  }, []);

  // 重新加载事件数据
  const reloadEvents = useCallback(async () => {
    setLoading(true);
    try {
      // 如果没有选择任何成员，则查询所有成员（不传递userId参数或传递空值）
      // 如果选择了成员，则只查询这些成员的事件
      const userId = selectedMembers.length > 0 ? selectedMembers.join(",") : undefined;
      // 传递月份字符串给后端
      const events = await teamCalendarService.getEventList(userId, currentMonthStr);

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

      const calendarEvents: CalendarEvent[] = events.map((event) => ({
        id: event.id,
        title: event.title,
        start: new Date(event.startDate),
        end: new Date(event.endDate),
        color: event.color,
        description: event.description,
        allDay: event.allDay,
        userId: event.userId,
        userName: event.userName,
        type:
          event.type !== undefined ? typeNumberToString[event.type] : "meeting",
        priority:
          event.priority !== undefined
            ? priorityNumberToString[event.priority]
            : "medium",
        reminderMinutes: event.reminderMinutes,
      }));

      setUserEvents(calendarEvents);
    } catch (error) {
      console.error("Failed to load events:", error);
      toast.error("加载日程失败");
    } finally {
      setLoading(false);
    }
  }, [selectedMembers, currentMonthStr]);

  // 处理保存（新建或编辑）
  const handleSaveEvent = useCallback(async () => {
    // API 保存成功后，重新加载成员信息和日历数据
    try {
      // 触发刷新成员信息（工作负载可能发生变化）
      setRefreshTrigger(prev => prev + 1);

      // 重新加载日历数据
      await reloadEvents();
    } catch (error) {
      console.error("Failed to reload data:", error);
    } finally {
      setEditingEvent(null);
    }
  }, [reloadEvents]);

  // 暂时移除react-big-calendar相关的事件处理函数
  // 使用自定义日历网格组件替代

  return (
    <div className="h-full flex bg-slate-50 dark:bg-slate-900">
      {/* 左侧混合控制面板 */}
      <div className="w-80 bg-gradient-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-r border-slate-200/50 dark:border-slate-700/50 overflow-y-auto shadow-sm">
        <div className="p-5 space-y-6">
          {/* 迷你月份导航器 */}
          <div className="bg-slate-100/40 dark:bg-slate-700/40 rounded-xl p-4 backdrop-blur-sm">
            <MiniMonthNavigator
              currentDate={currentDate}
              onDateSelect={handleMiniCalendarSelect}
              onMonthChange={handleMiniCalendarMonthChange}
            />
          </div>

          {/* AI工作负载分析 */}
          {/* <AIWorkloadAnalyzer
            onShowAISuggestions={handleShowAISuggestions}
            onHighlightMember={handleHighlightMember}
          /> */}

          {/* 视图筛选 */}
          <div className="bg-slate-100/40 dark:bg-slate-700/40 rounded-xl p-4 backdrop-blur-sm">
            <ViewFilters
              selectedMembers={selectedMembers}
              onMemberToggle={handleMemberToggle}
              showExternal={showExternal}
              onExternalToggle={handleExternalToggle}
              colorBy={colorBy}
              onColorByChange={setColorBy}
              refreshTrigger={refreshTrigger}
            />
          </div>
        </div>
      </div>

      {/* 右侧主日历区域 */}
      <div className="flex-1 flex flex-col">
        {/* 日历工具栏 */}
        <CalendarToolbar
          currentDate={currentDate}
          calendarView={calendarView}
          onDateChange={setCurrentDate}
          onViewChange={setCalendarView}
          onTodayClick={handleTodayClick}
          onNewEvent={handleNewEvent}
        />

        {/* 主日历区域 */}
        <div className="flex-1 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 overflow-hidden h-full">
            <Calendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              allDayAccessor="allDay"
              view={calendarView as View}
              onView={(view: View) => setCalendarView(view as CalendarView)}
              date={currentDate}
              onNavigate={(newDate) => setCurrentDate(newDate)}
              onSelectEvent={(event: any) => {
                setEditingEvent(event);
                setDialogInitialDate(undefined);
                setEventDialogOpen(true);
              }}
              onSelectSlot={(slotInfo) => {
                setCurrentDate(slotInfo.start as Date);
                // 保持当前视图，不自动切换到日视图
                setEditingEvent(null);
                setDialogInitialDate(slotInfo.start as Date);
                setEventDialogOpen(true);
              }}
              selectable={true}
              components={{
                event: (props) => (
                  <CustomCalendarEvent
                    event={props.event}
                    title={props.title}
                    style={props.style}
                    reloadEvents={reloadEvents}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Open the edit dialog for this event
                      debugger
                      
                      setEditingEvent(props.event);
                      setDialogInitialDate(undefined);
                      setEventDialogOpen(true);
                    }}
                  />
                )
              }}
              messages={calendarMessages}
              culture={getCalendarLocale(i18n.language)}
              toolbar={false} // 禁用内置工具栏，使用自定义的
              className="h-full"
            />
          </div>
        </div>
      </div>

      {/* 事件新建/编辑对话框 */}
      <EventFormDialog
        open={eventDialogOpen}
        onOpenChange={(open) => {
          setEventDialogOpen(open);
          if (!open) setEditingEvent(null);
        }}
        initialEvent={editingEvent}
        initialDate={dialogInitialDate}
        onSave={handleSaveEvent}
      />
    </div>
  );
}
