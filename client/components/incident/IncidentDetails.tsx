import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TaskCard from "./TaskCard";
import { mockUsers } from "@/data/mockData";
import {
  Brain,
  Zap,
  Edit3,
  Calendar,
  TrendingUp,
  Clock,
  Check,
  Plus,
  MoreVertical,
  ExternalLink,
  Paperclip,
  Archive,
  ArchiveRestore,
  ChevronDown,
  ChevronUp,
  Loader2,
  Hash,
  CreditCard,
  ShoppingCart,
  Mail,
  AlertTriangle,
  Pause,
  Notebook,
  User as UserIcon,
  ActivityIcon,
} from "lucide-react";
import { request } from "@/lib/request";
import { getEventDetails } from "@/services/incidentService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatDistanceToNow, addHours } from "date-fns";
import { zhCN } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import ApproverSelector, {
  ApproverOption,
} from "@/pages/ApprovalConfig/components/ApproverSelector";
import { teamCalendarService } from "@/services/teamCalendarService";
import type {
  Incident,
  ResponseAction,
  Task,
  User,
  IncidentAction,
  Event,
} from "@shared/types";

interface IncidentDetailsProps {
  incident: Incident | null;
  onActionUpdated?: () => void; // Callback to refresh data in parent component
}

// Auto-assign tasks to team members based on action type
const getAssigneeForAction = (action: ResponseAction): User => {
  if (action.type === "communication") {
    return (
      mockUsers.find((u) => u.role.includes("Customer Success")) || mockUsers[1]
    ); // 李小红
  } else if (action.type === "process") {
    return mockUsers.find((u) => u.role.includes("Technical")) || mockUsers[2]; // 王大伟
  }
  return mockUsers[0]; // 张明 for data analysis
};

const priorityColors = {
  high: "bg-eip-alert text-eip-alert-foreground",
  medium: "bg-eip-warning text-eip-warning-foreground",
  low: "bg-slate-500 text-slate-50",
};

const priorityLabels = {
  high: "高优先级",
  medium: "中等优先级",
  low: "低优先级",
};

const statusLabels = {
  pending_human: "待处理",
  in_progress: "处理中",
  resolved: "已完成",
  automated: "AI全自动处理中",
};

const actionTypeLabels: Record<ResponseAction["type"], string> = {
  communication: "沟通",
  process: "流程",
  data_enrichment: "数据补充",
};

const mapPriorityLabel = (priority?: Incident["priority"]) => {
  if (!priority) return priorityLabels.medium;
  return priorityLabels[priority] ?? priorityLabels.medium;
};

const mapStatusLabel = (status?: Incident["status"]) => {
  if (!status) return statusLabels.pending_human;
  return statusLabels[status] ?? statusLabels.pending_human;
};

const normalizedActionType = (type?: string | null): ResponseAction["type"] => {
  if (type === "process" || type === "data_enrichment") return type;
  return "communication";
};

const parseIncidentDate = (value?: string | null): Date | undefined => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const normalized = trimmed.includes("T")
    ? trimmed
    : trimmed.replace(" ", "T");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return undefined;
  return date;
};

const toISODateTime = (value?: string | null): string | undefined => {
  const date = parseIncidentDate(value);
  return date ? date.toISOString() : undefined;
};

const formatDateForInput = (value: Date): string => {
  const pad = (num: number) => String(num).padStart(2, "0");
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`;
};

const formatInputValue = (value?: string | null): string | undefined => {
  const date = parseIncidentDate(value ?? undefined);
  return date ? formatDateForInput(date) : undefined;
};

const normalizeAttachments = (
  raw?: IncidentAction["attachments"],
): string[] | undefined => {
  if (!raw) return undefined;
  if (Array.isArray(raw)) {
    return raw.filter(
      (item): item is string =>
        typeof item === "string" && item.trim().length > 0,
    );
  }
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return undefined;
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (item): item is string =>
            typeof item === "string" && item.trim().length > 0,
        );
      }
    } catch {
      // fall back to delimiter split below
    }
    return trimmed
      .split(/[,;\n]/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }
  return undefined;
};

const statusLab = [
  "",
  "active",
  "archived",
  "processing",
  "completed",
  "paused",
];

const getStatusStr = (status?: number | null): string => {
  if (!status) return "active";
  return statusLab[status];
};

const mapApprovalStatus = (
  status?: string | null,
): UIResponseAction["approvalStatus"] => {
  if (!status) return undefined;
  if (status === "approved" || status === "rejected" || status === "required") {
    return status;
  }
  return undefined;
};

const safePriorityKey = (
  priority?: Incident["priority"],
): keyof typeof priorityColors => {
  if (priority && priorityColors[priority]) {
    return priority;
  }
  return "medium";
};

const buildUIActions = (incident: Incident | null): UIResponseAction[] => {
  if (!incident) return [];
  if (Array.isArray(incident.actionList) && incident.actionList.length > 0) {
    return incident.actionList.map((item, index) => {
      const type = normalizedActionType(item.actionType);
      const fallbackTitle =
        item.actionTitle?.trim() ||
        item.description?.trim() ||
        `响应动作 ${index + 1}`;
      const startAt = toISODateTime(item.startTime);
      const dueAt = toISODateTime(item.endTime);
      return {
        id: item.id ?? `action_${incident.id}_${index}`,
        title: item.actionTitle?.trim() || fallbackTitle,
        description: item.description ?? "",
        type,
        aiSuggestion: item.aiSuggestion?.trim(),
        startAt,
        dueAt,
        attachments: normalizeAttachments(item.attachments),
        assigneeId: item.responsibleId ?? undefined,
        assigneeName: item.responsiblePerson ?? undefined,
        status: getStatusStr(item.status),
        approvalStatus: mapApprovalStatus(item.approvalStatus),
        auto: item.auto ?? undefined,
        paused: item.paused ?? undefined,
      } satisfies UIResponseAction;
    });
  }

  return (incident.suggestedResponsePlan ?? []).map((a) => ({
    ...a,
    aiSuggestion: defaultAISuggestion(a.type, a.title),
    status: "active" as const,
    approvalStatus:
      incident.id === "inc1"
        ? a.id === "ra1"
          ? "approved"
          : a.id === "ra2"
            ? "rejected"
            : a.id === "ra3"
              ? "required"
              : undefined
        : undefined,
    auto:
      (incident.id === "inc_auto1" && a.id === "ra_auto1") ||
      (incident.id === "inc2" && a.id === "ra4")
        ? true
        : undefined,
    paused: false,
  }));
};

// UI局部增强类型：为每个响应动作附加AI建议文案与详细字段
type UIResponseAction = ResponseAction & {
  aiSuggestion?: string;
  startAt?: string; // ISO字符串，表单使用 datetime-local
  dueAt?: string; // ISO字符串，表单使用 datetime-local
  attachments?: string[]; // 简化为字符串数组（名称或链接）
  assigneeId?: string; // 负责人ID
  assigneeName?: string; // 负责人姓名
  status?: string; // 归档状态
  approvalStatus?: "required" | "approved" | "rejected"; // 审批状态（卡片级）
  auto?: boolean; // 是否为AI自动处理动作
  paused?: boolean; // 是否已暂停自动处理
};

// 根据动作类型扩展AI��议的辅助步骤（用于强调AI建议为主信息）
const aiSuggestionSteps = (type: ResponseAction["type"]): string[] => {
  switch (type) {
    case "communication":
      return [
        "联系客户与相关方，说明影响范围与当前进展",
        "提供预计解决时间与负责人联系方式，约定下一次同步",
        "记录要点与后续跟进计划，更新沟通日志",
      ];
    case "process":
      return [
        "隔离影响范围并触发回滚/修复流程",
        "记录审计日志并通知值班/相关团队",
        "创建工单并跟踪节点进度，按SLA提醒",
      ];
    case "data_enrichment":
      return [
        "补充关键字段，关联客户/订单/产品，完善上下文",
        "校验数据一致性并生成异常报告",
        "同步到分析系统支持后续决策",
      ];
    default:
      return ["按既定策略执行自动化建议，保留审计记录"];
  }
};
// 根据动作类型生成默认AI建议文案
const defaultAISuggestion = (type: ResponseAction["type"], title?: string) => {
  switch (type) {
    case "communication":
      return `向相关方发送状态更新，包含��键实体与预计处理时间${title ? `（${title}）` : ""}。`;
    case "process":
      return `触发��准化处理流程：隔离影响范围、记录审计日志并通知值班人员${title ? `（${title}）` : ""}。`;
    case "data_enrichment":
      return `补充数据：关联客户、订单与产品信息，完善上下文用于后续分析${title ? `（${title}）` : ""}。`;
    default:
      return `按既定策略自动执行建议动作${title ? `（${title}）` : ""}。`;
  }
};

// 事件类型中文标签
const formatEventTypeLabel = (type: number) => {
  const map = ["", "客户相关", "订单相关", "商品相关"];
  return map[type] ?? type;
};

// 人民币格式化
const formatCNY = (amount?: number) => {
  if (amount == null || Number.isNaN(amount)) return "-";
  try {
    return `¥${amount.toLocaleString("zh-CN")}`;
  } catch {
    return `¥${amount}`;
  }
};

// 基于时间或实体信息匹配原始事件
const findRelatedEvent = (incident: Incident | null): Incident | null => {
  return incident;
};

export default function IncidentDetails({
  incident,
  onActionUpdated,
}: IncidentDetailsProps) {
  const [selectedUsers, setSelectedUsers] = useState<ApproverOption[]>([]);
  const [isExecuted, setIsExecuted] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState<Task[]>([]);
  const [showAutomationHint, setShowAutomationHint] = useState<boolean>(() => {
    return (
      typeof window !== "undefined" &&
      localStorage.getItem("ai_learning_complete") === "true"
    );
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const formatDuration = (start?: string, end?: string) => {
    const startDate = parseIncidentDate(start);
    const endDate = parseIncidentDate(end);
    if (!startDate || !endDate) return "-";
    const ms = endDate.getTime() - startDate.getTime();
    if (Number.isNaN(ms) || ms <= 0) return "-";
    const hours = ms / (1000 * 60 * 60);
    if (hours < 1) {
      const minutes = Math.round(ms / (1000 * 60));
      return `${minutes} 分钟`;
    }
    const rounded = Math.round(hours * 10) / 10;
    return `${rounded} 小时`;
  };

  const reloadActions = async () => {
    if (!incident?.id) return;
    try {
      const refreshedIncident = await getEventDetails(incident.id);
      setActions(buildUIActions(refreshedIncident));
      setCompletedActionIds(new Set());
      setProcessingActionIds(new Set());
      setExpandedActionIds(new Set());
      if (onActionUpdated) {
        onActionUpdated();
      }
    } catch (error) {
      console.error("Failed to reload incident actions", error);
    }
  };

  const resolveAssignee = (action: UIResponseAction): User => {
    if (action.assigneeId) {
      const existing = mockUsers.find((u) => u.id === action.assigneeId);
      if (existing) {
        return existing;
      }
    }
    if (action.assigneeName) {
      return {
        id: action.assigneeId ?? action.id,
        name: action.assigneeName,
        avatarUrl: "",
        role: "",
      };
    }
    return getAssigneeForAction(action);
  };

  // 本地可编辑的“建议响应动作”列表与完成标记（为 inc1 的 ra2 默认需要审批）
  const [actions, setActions] = useState<UIResponseAction[]>(() =>
    buildUIActions(incident),
  );
  const [completedActionIds, setCompletedActionIds] = useState<Set<string>>(
    new Set(),
  );
  const [expandedActionIds, setExpandedActionIds] = useState<Set<string>>(
    new Set(),
  );
  const [processingActionIds, setProcessingActionIds] = useState<Set<string>>(
    new Set(),
  );

  const toggleExpanded = (id: string) => {
    setExpandedActionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // 创建/编��动作弹窗
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [editActionId, setEditActionId] = useState<string | null>(null);
  const [isEditReadOnly, setIsEditReadOnly] = useState<boolean>(false);
  const form = useForm<{
    title: string;
    type: ResponseAction["type"];
    description: string;
    startAt?: string;
    dueAt?: string;
    assigneeId?: string;
    attachmentsText?: string; // 多个附件用换行分隔
  }>({
    defaultValues: {
      title: "",
      type: "communication",
      description: "",
      startAt: formatDateForInput(new Date()),
      dueAt: formatDateForInput(addHours(new Date(), 24)),
      assigneeId: mockUsers[0]?.id,
      attachmentsText: "",
    },
  });

  // 切换案例时重置本地状态
  useEffect(() => {
    setActions(buildUIActions(incident));
    setCompletedActionIds(new Set());
    setProcessingActionIds(new Set());
    setExpandedActionIds(new Set());
    setIsExecuted(false);
    setGeneratedTasks([]);
    setSelectedUsers([]);
    setEditActionId(null);
    setIsActionDialogOpen(false);
  }, [incident?.id]);

  // 审批操作：将指定动作标记为通过或拒绝
  const approveAction = (id: string) => {
    setActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, approvalStatus: "approved" } : a)),
    );
  };
  const rejectAction = (id: string) => {
    setActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, approvalStatus: "rejected" } : a)),
    );
  };
  const isActionLocked = (action: UIResponseAction) => !!action.paused;

  // 预览多形态任务卡片（未执行前用于展示不同type的形态）
  const previewTasks = useMemo(() => {
    if (!incident) return [] as Task[];
    return actions
      .filter((a) => a.status !== "archived")
      .map((action, index) => {
        const startDate = parseIncidentDate(action.startAt);
        const endDate = parseIncidentDate(action.dueAt);
        return {
          id: `preview_${incident.id}_${action.id}`,
          title: action.title,
          status: "pending" as const,
          assignee: resolveAssignee(action),
          parentIncidentId: incident.id,
          dueDate: endDate ?? addHours(new Date(), 24),
          scheduledTime:
            startDate && endDate
              ? { start: startDate, end: endDate }
              : undefined,
          handlingType:
            index === 0
              ? "internal"
              : index === 1
                ? "external_link"
                : "external_approval",
          externalSystem: index === 1 ? "OA" : index === 2 ? "ERP" : undefined,
          externalUrl: "/legacy-app-placeholder",
          externalStatus: index === 2 ? "pending_sync" : undefined,
        };
      });
  }, [incident, actions]);

  // 匹配并提取原始事件详情
  const relatedEvent = useMemo(() => findRelatedEvent(incident), [incident]);
  const eventFacts = useMemo(() => {
    if (!relatedEvent) return [] as any[];
    const facts: any[] = [
      // {
      //   icon: <AlertTriangle className="w-3 h-3" />,
      //   content: `事件类型: ${formatEventTypeLabel(relatedEvent.type)}`,
      // },
      // {
      //   icon: <Hash className="w-3 h-3" />,
      //   content: `原始事件ID: ${relatedEvent.id}`,
      // },
    ];
    facts.push(
      {
        icon: <ShoppingCart className="w-3 h-3" />,
        content: `订单号: ${relatedEvent.orderId ?? "-"}`,
      },
      {
        icon: <Mail className="w-3 h-3" />,
        content: `客户邮箱: ${relatedEvent.customerEmail ?? "-"}`,
      },
      {
        icon: <Check className="w-3 h-3" />,
        content: `情绪: ${relatedEvent.emotion ?? "-"}`,
      },
      {
        icon: <Notebook className="w-3 h-3" />,
        content: `备注: ${relatedEvent.remark ?? "-"}`,
      },
    );
    return facts;
  }, [relatedEvent]);

  const handleExecuteAISuggestions = () => {
    // AI全自动处理中不支持手动“一键执行AI建议”
    if (!incident || isExecuted || incident.status === "automated") return;

    // Convert response actions to tasks
    const activeActions = actions.filter(
      (a) => a.status !== "archived" && !isActionLocked(a),
    );
    const newTasks: Task[] = activeActions.map((action, index) => {
      const startDate = parseIncidentDate(action.startAt);
      const endDate = parseIncidentDate(action.dueAt);
      return {
        id: `task_${incident.id}_${action.id}`,
        title: action.title,
        status: "pending" as const,
        assignee: resolveAssignee(action),
        parentIncidentId: incident.id,
        dueDate: endDate ?? addHours(new Date(), 24),
        scheduledTime:
          startDate && endDate ? { start: startDate, end: endDate } : undefined,
        handlingType:
          index === 0
            ? "internal"
            : index === 1
              ? "external_link"
              : "external_approval",
        externalSystem: index === 1 ? "OA" : index === 2 ? "ERP" : undefined,
        externalUrl: "/legacy-app-placeholder",
        externalStatus: index === 2 ? "pending_sync" : undefined,
      };
    });

    setGeneratedTasks(newTasks);
    setIsExecuted(true);
    // 执行后将所有有效动作标记为处理中，并清理“已完成”状态
    setProcessingActionIds(new Set(activeActions.map((a) => a.id)));
    setCompletedActionIds((prev) => {
      const n = new Set(prev);
      activeActions.forEach((a) => n.delete(a.id));
      return n;
    });

    // Show success notification
    alert(
      `已成功创建 ${newTasks.length} 个任务并分配给团队成员！已在“建议响应动作”区域展示。`,
    );
  };

  // 动作CRUD与完成标记逻辑
  const buildApproverSelection = (
    assigneeId?: string,
    assigneeName?: string,
  ): ApproverOption[] => {
    if (!assigneeId || !assigneeName) return [];
    const numericId = Number(assigneeId);
    if (Number.isNaN(numericId)) return [];
    return [
      {
        userId: numericId,
        userName: assigneeName,
      },
    ];
  };

  const openCreateAction = () => {
    if (incident?.status === "automated") return;
    const now = new Date();
    // const defaultAssignee = mockUsers[0];
    setEditActionId(null);
    setIsEditReadOnly(false);
    // setSelectedUsers(
    //   defaultAssignee
    //     ? buildApproverSelection(defaultAssignee.id, defaultAssignee.name)
    //     : [],
    // );
    setSelectedUsers([]);
    form.reset({
      title: "",
      type: "communication",
      description: "",
      startAt: formatDateForInput(now),
      dueAt: formatDateForInput(addHours(now, 24)),
      attachmentsText: "",
    });
    setIsActionDialogOpen(true);
  };

  const openEditAction = (id: string) => {
    if (incident?.status === "automated") return;
    const a = actions.find((x) => x.id === id);
    if (a) {
      setIsEditReadOnly(a.status === "archived" || processingActionIds.has(id));
      setEditActionId(id);
      setSelectedUsers(buildApproverSelection(a.assigneeId, a.assigneeName));
      const fallbackStart = new Date();
      const fallbackEnd = addHours(new Date(), 24);
      form.reset({
        title: a.title,
        type: a.type,
        description: a.description,
        startAt:
          formatInputValue(a.startAt) ?? formatDateForInput(fallbackStart),
        dueAt: formatInputValue(a.dueAt) ?? formatDateForInput(fallbackEnd),
        assigneeId:
          a.assigneeId ?? getAssigneeForAction(a)?.id ?? mockUsers[0]?.id,
        attachmentsText:
          a.attachments && a.attachments.length > 0
            ? a.attachments.join("\n")
            : "",
      });
      setSelectedUsers([
        {
          userId: a.assigneeId,
          userName: a.assigneeName,
        },
      ]);
      setIsActionDialogOpen(true);
    }
  };

  const formatDateTime = (d: Date): string => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  const onSubmit = async (values: {
    title: string;
    type: ResponseAction["type"];
    description: string;
    startAt?: string;
    dueAt?: string;
    assigneeId?: string;
    attachmentsText?: string;
  }) => {
    if (!values.title?.trim()) {
      toast("请输入动作标题");
      return;
    }

    const selectedApprover = selectedUsers[0];
    const fallbackAssigneeId = values.assigneeId?.trim();
    const responsiblePersonId = selectedApprover
      ? String(selectedApprover.userId)
      : fallbackAssigneeId;

    if (!responsiblePersonId) {
      toast("请选择负责人");
      return;
    }

    const startDate = values.startAt ? new Date(values.startAt) : undefined;
    const dueDate = values.dueAt ? new Date(values.dueAt) : undefined;
    if (!startDate || Number.isNaN(startDate.getTime())) {
      toast("请输入有效的开始时间");
      return;
    }
    if (!dueDate || Number.isNaN(dueDate.getTime())) {
      toast("请输入有效的截止时间");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload: Record<string, unknown> = {
        actionTitle: values.title,
        actionType: values.type,
        description: values.description,
        startTime: formatDateTime(startDate),
        endTime: formatDateTime(dueDate),
        eventCenterId: incident?.id,
        responsibleId: responsiblePersonId,
      };

      if (selectedApprover?.userName) {
        payload.responsiblePersonName = selectedApprover.userName;
      }

      if (editActionId) {
        payload.id = editActionId;
        await request.put(`/admin/api/v1/event/action`, payload);
      } else {
        await request.post("/admin/api/v1/event/action", payload);
      }

      await reloadActions();

      const actionTypeText = editActionId ? "更新" : "创建";
      toast(`成功${actionTypeText}响应动作！`);
      setIsActionDialogOpen(false);
      setEditActionId(null);
      setSelectedUsers([]);
    } catch (error: any) {
      console.error("Error saving response action:", error);
      alert(`保存响应动作失败: ${error?.message || "未知错误"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteAction = (id: string) => {
    setActions((prev) => prev.filter((a) => a.id !== id));
    setCompletedActionIds((prev) => {
      const n = new Set(prev);
      n.delete(id);
      return n;
    });
  };

  const toggleArchive = (id: string, bool?: boolean) => {
    // AI全自动处理中不支持归档/取消归档
    if (incident?.status === "automated") return;
    const formData = new FormData();
    formData.append("id", id);
    const url = bool
      ? "/admin/api/v1/event/action/cancel"
      : "/admin/api/v1/event/action/archive";
    request.post(url, formData).then((res) => {
      reloadActions();
    });

    return;

    // 处理中状态下禁止归档（active -> archived），但允许取消归档
    const target = actions.find((a) => a.id === id);
    if (target && target.status !== "archived" && processingActionIds.has(id))
      return;
    setActions((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: a.status === "archived" ? "active" : "archived" }
          : a,
      ),
    );
    // 归档/取消归档均清理与其互斥的处理中与已完成标记
    setProcessingActionIds((prev) => {
      const n = new Set(prev);
      n.delete(id);
      return n;
    });
    setCompletedActionIds((prev) => {
      const n = new Set(prev);
      n.delete(id);
      return n;
    });
  };

  const toggleCompleted = (id: string) => {
    if (incident?.status === "automated") return;

    const formData = new FormData();
    formData.append("id", id);
    request
      .post("/admin/api/v1/event/action/complete", formData)
      .then((res) => {
        reloadActions();
      });

    return;

    const target = actions.find((a) => a.id === id);
    if (!target) return;
    if (target.status === "archived" || processingActionIds.has(id)) return;
    setCompletedActionIds((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
    setProcessingActionIds((prev) => {
      const n = new Set(prev);
      n.delete(id);
      return n;
    });
    setActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "active" } : a)),
    );
  };

  const pauseAction = (id: string) => {
    const formData = new FormData();
    formData.append("id", id);
    request.post("/admin/api/v1/event/action/pause", formData).then((res) => {
      reloadActions();
    });
  };

  const resumeAction = (id: string) => {
    setActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, paused: false } : a)),
    );
  };

  // 单项执行AI建议：完成标记并提示
  const handleExecuteAISuggestion = (id: string) => {
    // AI全自动处理中不支持单项“执行AI建议”
    if (incident?.status === "automated") return;
    const a = actions.find((x) => x.id === id);
    if (!a) return;
    if (a.approvalStatus && a.approvalStatus !== "approved") {
      alert("该动作处于待审批或已拒绝状态，除“打开传统页面”外的操作已禁用。");
      return;
    }
    if (a.paused) {
      alert("该动作已暂停，除“打开传统页面”外的操作已禁用。");
      return;
    }
    alert(`已开始执行AI建议：${a.aiSuggestion ?? a.title}`);
    // 执行时清理“已完成”并确保��归档
    setCompletedActionIds((prev) => {
      const n = new Set(prev);
      n.delete(id);
      return n;
    });
    setActions((prev) =>
      prev.map((x) => (x.id === id ? { ...x, status: "active" } : x)),
    );
    setProcessingActionIds((prev) => {
      const n = new Set(prev);
      n.add(id);
      return n;
    });
  };

  // 判断是否为邮件相关上下文（事件匹配失败时的容错判断）
  const isEmailIncident = (inc: Incident | null): boolean => {
    if (!inc) return false;
    const text = `${inc.title} ${inc.description ?? ""}`;
    const keywords = ["邮件", "SMTP", "退订", "退信", "投诉", "邮箱"];
    const hasKeyword = keywords.some((k) => text.includes(k));
    const byEntity = (inc.involvedEntities || []).some((e) =>
      (e.value || "").includes("邮件"),
    );
    const byActions = (inc.suggestedResponsePlan || []).some((a) =>
      (a.id || "").startsWith("ra_email"),
    );
    return hasKeyword || byEntity || byActions;
  };

  // 跳转到传统界面手动处理
  const handleGoToLegacy = () => {
    // AI全自动处理中不支持跳转到传统界面
    if (incident?.status === "automated") return;
    const relEvent = findRelatedEvent(incident);
    const gotoEmail =
      (relEvent && relEvent.type.startsWith("email_")) ||
      isEmailIncident(incident);
    if (gotoEmail) {
      navigate("/email-manual-processing", { state: { incident } });
    } else {
      navigate("/response-actions", { state: { incident } });
    }
  };

  if (!incident) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-50 dark:bg-slate-900">
        <div className="text-center p-8">
          <Brain className="w-16 h-16 mx-auto text-eip-accent mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
            选择一个事件以查看详情
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            从左侧事件列表中选择需要处理的案例
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-white dark:bg-slate-800">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex-1 mr-4">
              {incident.title}
            </h1>
            <div className="flex items-center gap-2">
              <Badge
                className={priorityColors[safePriorityKey(incident.priority)]}
              >
                {mapPriorityLabel(incident.priority)}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {mapStatusLabel(incident.status)}
              </Badge>
            </div>
          </div>
          {incident.description && (
            <div className="rounded-md border border-eip-accent/30 bg-eip-accent/5 p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs font-medium text-eip-accent">
                  事件描述
                </div>
              </div>
              {/* 移除涉及对象标签展示 */}
              <p className="text-base font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                {incident.description}
              </p>
              {/* 关键事实 */}
              <div className="mt-3 bg-white/60 dark:bg-slate-700/50 rounded-md p-2">
                <div className="text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1">
                  关键事实
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-700 dark:text-slate-300">
                  <div className="inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {incident.gmtCreate}
                  </div>
                  <div className="inline-flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    ID: {incident.id}
                  </div>
                  <div className="inline-flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" />
                    来源: EIP
                  </div>
                  {relatedEvent && (
                    <div className="inline-flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      事件类型: {formatEventTypeLabel(relatedEvent.eventType)}
                    </div>
                  )}
                  {relatedEvent && (
                    <div className="inline-flex items-center gap-1">
                      <Hash className="w-3 h-3" />
                      原始事件ID: {relatedEvent.originalEventId}
                    </div>
                  )}
                  {eventFacts.map((f, idx) => (
                    <div key={idx} className="inline-flex items-center gap-1">
                      {f.icon}
                      {f.content}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {!incident.description && (
            <div className="text-sm text-slate-700 dark:text-slate-300">
              {/* 描述缺失时不再展示涉及对象标签，仅保留空状态 */}
              无详细描述
            </div>
          )}
        </div>

        {/* AI Analysis */}
        <Card className="border-eip-accent/20 bg-gradient-to-br from-eip-accent/5 to-eip-accent/10">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm font-semibold">
              <Brain className="w-4 h-4 mr-2 text-eip-accent" />
              AI分析
              <Badge variant="outline" className="ml-auto text-xs">
                置信度 {incident.aiAnalysis?.confidence}%
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {incident.aiAnalysis?.summary}
            </p>

            <div className="grid grid-cols-2 gap-3">
              {incident.aiAnalysis?.keyMetrics.map((metric, index) => (
                <div
                  key={index}
                  className="bg-white/50 dark:bg-slate-700/50 rounded-lg p-3"
                >
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {metric.label}
                  </div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    {metric.value}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Suggested Response Plan / Generated Tasks */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm font-semibold">
              <TrendingUp className="w-4 h-4 mr-2 text-eip-accent" />
              建议响应动作
              {isExecuted && (
                <Badge
                  variant="outline"
                  className="ml-2 bg-eip-success/10 text-eip-success border-eip-success"
                >
                  已执行AI建议
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* CRUD工具栏（左侧对齐，位于标题文案下方；AI全自动处理中隐藏）*/}
            {incident.status !== "automated" && (
              <div className="flex items-center justify-start gap-2">
                <Button
                  size="sm"
                  className="bg-eip-accent hover:bg-eip-accent/90"
                  onClick={handleExecuteAISuggestions}
                  disabled={
                    isExecuted || actions.every((a) => a.status === "archived")
                  }
                >
                  <Zap className="w-3 h-3 mr-1" /> 一键执行AI建议
                </Button>
                <Button size="sm" variant="outline" onClick={openCreateAction}>
                  <Plus className="w-3 h-3 mr-1" /> 新增动作
                </Button>
              </div>
            )}

            {/* 动作列表（查/改/删/完成标记，AI建议执行与传统界面入口���*/}
            <div className="space-y-3">
              {actions.map((action) => (
                <div
                  key={action.id}
                  className={`rounded-md border p-0 overflow-hidden 
                          ${
                            action.status === "archived"
                              ? "opacity-70 bg-slate-100 border-slate-300"
                              : processingActionIds.has(action.id)
                                ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-400"
                                : completedActionIds.has(action.id)
                                  ? "bg-eip-success/5 border-eip-success/50"
                                  : "bg-white/50 dark:bg-slate-700/50"
                          }`}
                >
                  <div className="min-w-0">
                    {/* 卡片头部：标题/类型/状态 + 操作图标 */}
                    <div className="px-3 py-2 flex items-center justify-between gap-3 border-b bg-slate-50 dark:bg-slate-800/40">
                      <div className="min-w-0 flex items-center gap-2">
                        <span
                          className={`truncate text-sm font-semibold ${completedActionIds.has(action.id) ? "line-through text-slate-500" : action.status === "archived" ? "text-slate-500" : "text-slate-900 dark:text-slate-100"}`}
                        >
                          {action.title}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1 py-0.5"
                        >
                          {actionTypeLabels[action.type]}
                        </Badge>
                        {action.status === "archived" ? (
                          <span className="text-[10px] text-slate-600 flex items-center">
                            <Archive className="w-3 h-3 mr-1" /> 已归档
                          </span>
                        ) : action.status === "processing" ? (
                          <span className="text-[10px] text-indigo-600 flex items-center">
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />{" "}
                            处理中
                          </span>
                        ) : action.status === "completed" ? (
                          <span className="text-[10px] text-eip-success flex items-center">
                            <Check className="w-3 h-3 mr-1" /> 已完成
                          </span>
                        ) : null}

                        {/* 审批状态徽章已移除 */}
                        {action.status === "active" && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1 py-0.5 flex items-center"
                          >
                            <ActivityIcon className="w-3 h-3 mr-1" /> 活动
                          </Badge>
                        )}
                        {action.status === "paused" && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1 py-0.5 flex items-center"
                          >
                            <Pause className="w-3 h-3 mr-1" /> 已暂停
                          </Badge>
                        )}
                      </div>
                      {incident.status !== "automated" && (
                        <div className="flex items-center gap-1 shrink-0">
                          {incident.id === "inc2" && action.id === "ra4" ? (
                            <>
                              {action.paused ? (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7"
                                  onClick={() => resumeAction(action.id)}
                                >
                                  恢复
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7"
                                  onClick={() => pauseAction(action.id)}
                                  disabled={
                                    action.status === "archived" ||
                                    processingActionIds.has(action.id)
                                  }
                                >
                                  <Pause className="w-3 h-3 mr-1" /> 暂停
                                </Button>
                              )}
                            </>
                          ) : (
                            <>
                              {/* 审批操作按钮已移除 */}
                              {action.auto && !action.paused && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7"
                                  onClick={() => pauseAction(action.id)}
                                  disabled={
                                    action.status === "archived" ||
                                    processingActionIds.has(action.id)
                                  }
                                >
                                  <Pause className="w-3 h-3 mr-1" /> 暂停
                                </Button>
                              )}
                              {action.auto && action.paused && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7"
                                  onClick={() => resumeAction(action.id)}
                                  disabled={
                                    action.status === "archived" ||
                                    processingActionIds.has(action.id)
                                  }
                                >
                                  恢复
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7"
                                onClick={() =>
                                  handleExecuteAISuggestion(action.id)
                                }
                                disabled={
                                  action.status === "archived" ||
                                  processingActionIds.has(action.id) ||
                                  isActionLocked(action)
                                }
                              >
                                <Zap className="w-3 h-3 mr-1" /> 执行AI建议
                              </Button>
                              {/* <Button
                                size="sm"
                                variant="ghost"
                                className="h-7"
                                onClick={handleGoToLegacy}
                                disabled={action.status === "archived"}
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />{" "}
                                打开传统页面
                              </Button> */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                  >
                                    <MoreVertical className="w-3 h-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="w-40"
                                >
                                  <DropdownMenuItem
                                    onClick={() => openEditAction(action.id)}
                                    disabled={
                                      action.status === "archived" ||
                                      processingActionIds.has(action.id) ||
                                      isActionLocked(action)
                                    }
                                  >
                                    <Edit3 className="w-3 h-3 mr-2" /> 编辑
                                  </DropdownMenuItem>
                                  {action.status === "archived" ? (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        toggleArchive(action.id, true)
                                      }
                                      disabled={isActionLocked(action)}
                                    >
                                      <ArchiveRestore className="w-3 h-3 mr-2" />{" "}
                                      取消归档
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem
                                      onClick={() => toggleArchive(action.id)}
                                      disabled={
                                        processingActionIds.has(action.id) ||
                                        isActionLocked(action)
                                      }
                                    >
                                      <Archive className="w-3 h-3 mr-2" /> 归档
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem
                                    onClick={() => toggleCompleted(action.id)}
                                    disabled={
                                      action.status === "archived" ||
                                      processingActionIds.has(action.id) ||
                                      isActionLocked(action)
                                    }
                                  >
                                    <Check className="w-3 h-3 mr-2" />{" "}
                                    {completedActionIds.has(action.id)
                                      ? "取消完成"
                                      : "标记完成"}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </>
                          )}
                        </div>
                      )}
                      {incident.status === "automated" && action.auto && (
                        <div className="flex items-center gap-1 shrink-0">
                          {action.paused ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7"
                              onClick={() => resumeAction(action.id)}
                            >
                              恢复
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7"
                              onClick={() => pauseAction(action.id)}
                            >
                              <Pause className="w-3 h-3 mr-1" /> 暂停
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                    {/* 已移除旧的描述文本展示，统一采用新的AI建议样式块 */}
                    {action.aiSuggestion && (
                      <div
                        className={`px-3 py-3 border-b ${
                          completedActionIds.has(action.id) ||
                          action.status === "archived"
                            ? "bg-slate-50 text-slate-600"
                            : "bg-eip-accent/5 text-slate-900 dark:text-slate-100"
                        }`}
                        aria-label="AI建议文案"
                      >
                        <div className="flex items-center text-xs font-medium uppercase tracking-wide mb-1">
                          <Brain className="w-3 h-3 mr-1" /> AI建议
                        </div>
                        <div
                          className={`text-sm leading-relaxed ${action.status !== "archived" && !processingActionIds.has(action.id) && completedActionIds.has(action.id) ? "line-through" : ""}`}
                        >
                          {action.aiSuggestion}
                        </div>
                      </div>
                    )}
                    {/* 次要信息：摘要行（时长、负责人）与“更多信息”切换（展开时隐藏摘要） */}
                    <div className="px-3 py-2 flex items-center justify-between text-[11px]">
                      {expandedActionIds.has(action.id) ? (
                        <div />
                      ) : (
                        <div className="flex items-center gap-3 text-slate-600">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {(() => {
                              const fallbackStart = addHours(
                                new Date(),
                                -2,
                              ).toISOString();
                              const fallbackEnd = addHours(
                                new Date(),
                                4,
                              ).toISOString();
                              return formatDuration(
                                action.startAt ?? fallbackStart,
                                action.dueAt ?? fallbackEnd,
                              );
                            })()}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <UserIcon className="w-3 h-3" />
                            {action.assigneeName ??
                              (action.assigneeId
                                ? mockUsers.find(
                                    (u) => u.id === action.assigneeId,
                                  )?.name || "-"
                                : getAssigneeForAction(action)?.name ||
                                  mockUsers[0]?.name ||
                                  "-")}
                          </span>
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => toggleExpanded(action.id)}
                      >
                        {expandedActionIds.has(action.id) ? (
                          <span className="inline-flex items-center">
                            收起详情 <ChevronUp className="w-3 h-3 ml-1" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center">
                            更多信息 <ChevronDown className="w-3 h-3 ml-1" />
                          </span>
                        )}
                      </Button>
                    </div>
                    {/* 详细字段：时间（合并��始/截止，缺失时生成虚拟数据）、时长、附件、负责人（默认折叠） */}
                    {expandedActionIds.has(action.id) && (
                      <div className="px-3 py-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        {/* 时间（缺失时以当前时间生成区间） */}
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <div className="flex-1">
                            <div className="text-slate-500">时间</div>
                            <div className="text-slate-900 dark:text-slate-100">
                              {(() => {
                                const startDate =
                                  parseIncidentDate(action.startAt) ||
                                  addHours(new Date(), -2);
                                const endDate =
                                  parseIncidentDate(action.dueAt) ||
                                  addHours(startDate, 6);
                                return `${startDate.toLocaleString()} - ${endDate.toLocaleString()}`;
                              })()}
                            </div>
                          </div>
                        </div>
                        {/* 时长（根据真实或虚拟时间计算） */}
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <div className="flex-1">
                            <div className="text-slate-500">时长</div>
                            <div className="text-slate-900 dark:text-slate-100">
                              {(() => {
                                const fallbackStart = addHours(
                                  new Date(),
                                  -2,
                                ).toISOString();
                                const fallbackEnd = addHours(
                                  new Date(),
                                  4,
                                ).toISOString();
                                return formatDuration(
                                  action.startAt ?? fallbackStart,
                                  action.dueAt ?? fallbackEnd,
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                        {/* 负责人（缺失时自动根据动作类型选择合适成员） */}
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-3 h-3 text-slate-500" />
                          <div className="flex-1">
                            <div className="text-slate-500">负责人</div>
                            <div className="text-slate-900 dark:text-slate-100">
                              {action.assigneeName}
                            </div>
                          </div>
                        </div>
                        <div className="sm:col-span-3 flex items-start gap-2">
                          <Notebook className="w-3 h-3 text-slate-500 mt-0.5" />
                          <div className="flex-1">
                            <div className="text-slate-500">备注</div>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {action.description}
                            </div>
                          </div>
                        </div>
                        {/* 附件（缺失时生成示例附件） */}
                        {/* <div className="sm:col-span-3 flex items-start gap-2">
                          <Paperclip className="w-3 h-3 text-slate-500 mt-0.5" />
                          <div className="flex-1">
                            <div className="text-slate-500">附件</div>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {action.attachments &&
                              action.attachments.length > 0
                                ? action.attachments.map((att, idx) => (
                                    <Badge
                                      key={idx}
                                      variant="outline"
                                      className="text-[10px]"
                                    >
                                      {att}
                                    </Badge>
                                  ))
                                : [
                                    action.type === "communication"
                                      ? "沟通记录.pdf"
                                      : "处理方案.docx",
                                    "截图.png",
                                  ].map((att, idx) => (
                                    <Badge
                                      key={idx}
                                      variant="outline"
                                      className="text-[10px]"
                                    >
                                      {att}
                                    </Badge>
                                  ))}
                            </div>
                          </div>
                        </div> */}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {actions.length === 0 && (
                <div className="text-xs text-slate-500">
                  暂无响应动作，建议点击“新增动作”创建。
                </div>
              )}
            </div>

            {/* 学习成果提示条 */}
            {!isExecuted && showAutomationHint && (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 flex items-start">
                <span className="mr-2">💡</span>
                <div className="flex-1">
                  AI自动化建议：我注意到，对于此类事件，您的团队已连续3次采取了相同的、成功的手动处理流程。我已将该流程学习并固化为新的标准建议。该流程有95%的概率可以被完全自动化，是否授权？
                </div>
                <div className="ml-3 flex-shrink-0 space-x-2">
                  <Button
                    size="sm"
                    className="bg-eip-accent hover:bg-eip-accent/90"
                  >
                    授权自动处理
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAutomationHint(false)}
                  >
                    暂不授权
                  </Button>
                </div>
              </div>
            )}

            {isExecuted &&
              // Show generated tasks (多形态卡片)
              generatedTasks
                .filter((task) => task.handlingType !== "external_approval")
                .map((task) => <TaskCard key={task.id} task={task} />)}
          </CardContent>
        </Card>

        {/* 创建/编辑动作弹窗 */}
        <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editActionId
                  ? isEditReadOnly
                    ? "查看响应动作"
                    : "编辑响应动作"
                  : "新增响应动作"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                className="space-y-3"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <FormField
                  name="title"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>动作标题</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="请输入动作标题"
                          {...field}
                          disabled={isEditReadOnly}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="type"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>动作类型</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger disabled={isEditReadOnly}>
                            <SelectValue placeholder="选择类型" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="communication">沟通</SelectItem>
                            <SelectItem value="process">流程</SelectItem>
                            <SelectItem value="data_enrichment">
                              数据补充
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="description"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>描述</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder="请输入动作描述"
                          {...field}
                          disabled={isEditReadOnly}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField
                    name="startAt"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>开始时间</FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            {...field}
                            disabled={isEditReadOnly}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="dueAt"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>截止时间</FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            {...field}
                            disabled={isEditReadOnly}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  name="assigneeId"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>负责人</FormLabel>
                      <ApproverSelector
                        value={selectedUsers}
                        onChange={setSelectedUsers}
                        fetchOptions={teamCalendarService.fetchTeamMembers}
                        placeholder="选择负责人"
                        selectionMode="single"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* <FormField
                  name="attachmentsText"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>附件（每行一个）</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={3}
                          placeholder="可输入附件名称或链接，每行一个"
                          {...field}
                          disabled={isEditReadOnly}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsActionDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    取消
                  </Button>
                  {!isEditReadOnly && (
                    <Button
                      type="submit"
                      className="bg-eip-accent hover:bg-eip-accent/90"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {editActionId ? "保存中..." : "创建中..."}
                        </>
                      ) : editActionId ? (
                        "保存修改"
                      ) : (
                        "创建动作"
                      )}
                    </Button>
                  )}
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* 操作记录 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm font-semibold">
              <Clock className="w-4 h-4 mr-2 text-eip-accent" />
              操作记录
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* {(incident.processingHistory || []).map(
                (activity: any, index: number) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-eip-accent/10 rounded-full flex items-center justify-center">
                      {activity.actor === "AI" ? (
                        <Brain className="w-4 h-4 text-eip-accent" />
                      ) : (
                        <UserIcon className="w-4 h-4 text-eip-accent" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900 dark:text-slate-100">
                        {activity.description}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {formatDistanceToNow(activity.timestamp, {
                          addSuffix: true,
                          locale: zhCN,
                        })}
                        {activity.actor !== "AI" &&
                          ` • ${typeof activity.actor === "string" ? activity.actor : activity.actor.name}`}
                      </p>
                    </div>
                  </div>
                ),
              )} */}
              {(incident.recordList || []).map(
                (activity: any, index: number) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-eip-accent/10 rounded-full flex items-center justify-center">
                      {activity.actor === "AI" ? (
                        <Brain className="w-4 h-4 text-eip-accent" />
                      ) : (
                        <UserIcon className="w-4 h-4 text-eip-accent" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900 dark:text-slate-100">
                        {activity.operationContent}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {activity.gmtCreate}
                      </p>
                    </div>
                  </div>
                ),
              )}
            </div>
          </CardContent>
        </Card>
        {/* Action Buttons 已移除，根据需求删除底部操作区 */}
      </div>
    </div>
  );
}
