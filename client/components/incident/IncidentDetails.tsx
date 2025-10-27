import { Incident, Task, ResponseAction, Event } from '@shared/types';
import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TaskCard from './TaskCard';
import { mockUsers, mockEvents } from '@/data/mockData';
import { Brain, Zap, Edit3, Calendar, User, TrendingUp, Clock, Check, Plus, MoreVertical, ExternalLink, Paperclip, Archive, ArchiveRestore, ChevronDown, ChevronUp, Loader2, Hash, CreditCard, ShoppingCart, Mail, AlertTriangle, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow, addHours } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

interface IncidentDetailsProps {
  incident: Incident | null;
}

// Auto-assign tasks to team members based on action type
const getAssigneeForAction = (action: ResponseAction): any => {
  if (action.type === 'communication') {
    return mockUsers.find(u => u.role.includes('Customer Success')) || mockUsers[1]; // 李小红
  } else if (action.type === 'process') {
    return mockUsers.find(u => u.role.includes('Technical')) || mockUsers[2]; // 王大伟
  } else {
    return mockUsers[0]; // 张明 for data analysis
  }
};

const priorityColors = {
  high: 'bg-eip-alert text-eip-alert-foreground',
  medium: 'bg-eip-warning text-eip-warning-foreground',
  low: 'bg-slate-500 text-slate-50'
};

const priorityLabels = {
  high: '高优先级',
  medium: '中等优先级', 
  low: '低优先级'
};

const statusLabels = {
  pending_human: '待处理',
  in_progress: '处理中',
  resolved: '已完成',
  automated: 'AI全自动处理中'
};

const actionTypeLabels: Record<ResponseAction['type'], string> = {
  communication: '沟通',
  process: '流程',
  data_enrichment: '数据补充',
};

// UI局部增强类型：为每个响应动作附加AI建议文案与详细字段
type UIResponseAction = ResponseAction & {
  aiSuggestion?: string;
  startAt?: string; // ISO字符串，表单使用 datetime-local
  dueAt?: string;   // ISO字符串，表单使用 datetime-local
  attachments?: string[]; // 简化为字符串数组（名称或链接）
  assigneeId?: string;    // 负责人ID
  status?: 'active' | 'archived'; // 归档状态
  approvalStatus?: 'required' | 'approved' | 'rejected'; // 审批状态（卡片级）
  auto?: boolean; // 是否为AI自动处理动作
  paused?: boolean; // 是否已暂停自动处理
};

// 根据动作类型扩展AI建议的辅助步骤（用于强调AI建议为主信息）
const aiSuggestionSteps = (type: ResponseAction['type']): string[] => {
  switch (type) {
    case 'communication':
      return [
        '联系客户与相关方，说明影响范围与当前进展',
        '提供预计解决时间与负责人联系方式，约定下一次同步',
        '记录要点与后续跟进计划，更新沟通日志'
      ];
    case 'process':
      return [
        '隔离影响范围并触发回滚/修复流程',
        '记录审计日志并通知值班/相关团队',
        '创建工单并跟踪节点进度，按SLA提醒'
      ];
    case 'data_enrichment':
      return [
        '补充关键字段，关联客户/订单/产品，完善上下文',
        '校验数据一致性并生成异常报告',
        '同步到分析系统支持后续决策'
      ];
    default:
      return ['按既定策略执行自动化建议，保留审计记录'];
  }
};
// 根据动作类型生成默认AI建议文案
const defaultAISuggestion = (type: ResponseAction['type'], title?: string) => {
  switch (type) {
    case 'communication':
      return `向相关方发送状态更新，包含关键实体与预计处理时间${title ? `（${title}）` : ''}。`;
    case 'process':
      return `触发标准化处理流程：隔离影响范围、记录审计日志并通知值班人员${title ? `（${title}）` : ''}。`;
    case 'data_enrichment':
      return `补充数据：关联客户、订单与产品信息，完善上下文用于后续分析${title ? `（${title}）` : ''}。`;
    default:
      return `按既定策略自动执行建议动作${title ? `（${title}）` : ''}。`;
  }
};

// 事件类型中文标签
const formatEventTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    order_cancelled: '订单取消',
    payment_failed: '支付失败',
    user_registered: '用户注册',
    email_complaint_received: '邮件投诉',
    email_delivery_failed: '邮件发送失败',
    email_unsubscribe_spike: '退订率异常',
    email_bounce_rate_high: '退信率过高',
  };
  return map[type] ?? type;
};

// 人民币格式化
const formatCNY = (amount?: number) => {
  if (amount == null || Number.isNaN(amount)) return '-';
  try {
    return `¥${amount.toLocaleString('zh-CN')}`;
  } catch {
    return `¥${amount}`;
  }
};

// 基于时间或实体信息匹配原始事件
const findRelatedEvent = (incident: Incident | null): Event | null => {
  if (!incident) return null;
  // 优先用时间精确匹配
  const byTime = mockEvents.find(e => e?.timestamp?.getTime() === incident?.timestamp?.getTime());
  if (byTime) return byTime;
  // 次选用订单号匹配
  return null;
};

export default function IncidentDetails({ incident }: IncidentDetailsProps) {
  const [isExecuted, setIsExecuted] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState<Task[]>([]);
  const [showAutomationHint, setShowAutomationHint] = useState<boolean>(() => {
    return typeof window !== 'undefined' && localStorage.getItem('ai_learning_complete') === 'true';
  });
  const navigate = useNavigate();

  const formatDuration = (start?: string, end?: string) => {
    if (!start || !end) return '-';
    const ms = new Date(end).getTime() - new Date(start).getTime();
    if (Number.isNaN(ms) || ms <= 0) return '-';
    const hours = ms / (1000 * 60 * 60);
    if (hours < 1) {
      const minutes = Math.round(ms / (1000 * 60));
      return `${minutes} 分钟`;
    }
    const rounded = Math.round(hours * 10) / 10;
    return `${rounded} 小时`;
  };

  // 本地可编辑的“建议响应动作”列表与完成标记（为 inc1 的 ra2 默认需要审批）
  const [actions, setActions] = useState<UIResponseAction[]>(() => (incident?.suggestedResponsePlan ?? []).map(a => ({
    ...a,
    aiSuggestion: defaultAISuggestion(a.type, a.title),
    status: 'active',
    approvalStatus: incident?.id === 'inc1'
      ? (a.id === 'ra1' ? 'approved' : a.id === 'ra2' ? 'rejected' : a.id === 'ra3' ? 'required' : undefined)
      : undefined,
    auto: (incident?.id === 'inc_auto1' && a.id === 'ra_auto1') || (incident?.id === 'inc2' && a.id === 'ra4') ? true : undefined,
    paused: false
  })));
  const [completedActionIds, setCompletedActionIds] = useState<Set<string>>(new Set());
  const [expandedActionIds, setExpandedActionIds] = useState<Set<string>>(new Set());
  const [processingActionIds, setProcessingActionIds] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    setExpandedActionIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // 创建/编辑动作弹窗
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [editActionId, setEditActionId] = useState<string | null>(null);
  const [isEditReadOnly, setIsEditReadOnly] = useState<boolean>(false);
  const form = useForm<{ 
    title: string; 
    type: ResponseAction['type']; 
    description: string; 
    startAt?: string;
    dueAt?: string;
    assigneeId?: string;
    attachmentsText?: string; // 多个附件用换行分隔
  }>({
    defaultValues: { 
      title: '', 
      type: 'communication', 
      description: '', 
      startAt: new Date().toISOString().slice(0,16),
      dueAt: addHours(new Date(), 24).toISOString().slice(0,16),
      assigneeId: mockUsers[0]?.id,
      attachmentsText: ''
    },
  });

  // 切换案例时重置本地状态
  useEffect(() => {
    setActions((incident?.suggestedResponsePlan ?? []).map(a => ({
      ...a,
      aiSuggestion: defaultAISuggestion(a.type, a.title),
      status: 'active',
      approvalStatus: incident?.id === 'inc1'
        ? (a.id === 'ra1' ? 'approved' : a.id === 'ra2' ? 'rejected' : a.id === 'ra3' ? 'required' : undefined)
        : undefined,
      auto: (incident?.id === 'inc_auto1' && a.id === 'ra_auto1') || (incident?.id === 'inc2' && a.id === 'ra4') ? true : undefined,
      paused: false
    })));
    setCompletedActionIds(new Set());
    setIsExecuted(false);
    setGeneratedTasks([]);
  }, [incident?.id]);

  // 审批操作：将指定动作标记为通过或拒绝
  const approveAction = (id: string) => {
    setActions(prev => prev.map(a => a.id === id ? { ...a, approvalStatus: 'approved' } : a));
  };
  const rejectAction = (id: string) => {
    setActions(prev => prev.map(a => a.id === id ? { ...a, approvalStatus: 'rejected' } : a));
  };
  const isActionLocked = (action: UIResponseAction) => !!action.paused;

  // 预览多形态任务卡片（未执行前用于展示不同type的形态）
  const previewTasks = useMemo(() => {
    if (!incident) return [] as Task[];
    return actions.filter(a => a.status !== 'archived').map((action, index) => ({
      id: `preview_${incident.id}_${action.id}`,
      title: action.title,
      status: 'pending' as const,
      assignee: action.assigneeId ? (mockUsers.find(u => u.id === action.assigneeId) || getAssigneeForAction(action)) : getAssigneeForAction(action),
      parentIncidentId: incident.id,
      dueDate: action.dueAt ? new Date(action.dueAt) : addHours(new Date(), 24),
      scheduledTime: action.startAt && action.dueAt ? { start: new Date(action.startAt), end: new Date(action.dueAt) } : undefined,
      handlingType: index === 0 ? 'internal' : index === 1 ? 'external_link' : 'external_approval',
      externalSystem: index === 1 ? 'OA' : index === 2 ? 'ERP' : undefined,
      externalUrl: '/legacy-app-placeholder',
      externalStatus: index === 2 ? 'pending_sync' : undefined,
    }));
  }, [incident, actions]);

  // 匹配并提取原始事件详情
  const relatedEvent = useMemo(() => findRelatedEvent(incident), [incident]);
  const eventFacts = useMemo(() => {
    if (!relatedEvent) return [] as any[];
    const data = relatedEvent.data as any;
    const facts: any[] = [
      {
        icon: <AlertTriangle className="w-3 h-3" />,
        content: `事件类型: ${formatEventTypeLabel(relatedEvent.type)}`
      },
      {
        icon: <Hash className="w-3 h-3" />,
        content: `原始事件ID: ${relatedEvent.id}`
      }
    ];
    switch (relatedEvent.type) {
      case 'order_cancelled':
        facts.push(
          { icon: <ShoppingCart className="w-3 h-3" />, content: `订单号: ${data.orderId ?? '-'}` },
          { icon: <User className="w-3 h-3" />, content: `客户ID: ${data.customerId ?? '-'}` },
          { icon: <CreditCard className="w-3 h-3" />, content: `订单金额: ${formatCNY(data.amount)}` },
          { icon: <Check className="w-3 h-3" />, content: `取消原因: ${data.reason ?? '-'}` },
        );
        break;
      case 'payment_failed':
        facts.push(
          { icon: <Hash className="w-3 h-3" />, content: `交易ID: ${data.transactionId ?? '-'}` },
          { icon: <CreditCard className="w-3 h-3" />, content: `交易金额: ${formatCNY(data.amount)}` },
          { icon: <AlertTriangle className="w-3 h-3" />, content: `错误码: ${data.errorCode ?? '-'}` },
        );
        break;
      case 'user_registered':
        facts.push(
          { icon: <User className="w-3 h-3" />, content: `用户ID: ${data.userId ?? '-'}` },
          { icon: <ExternalLink className="w-3 h-3" />, content: `注册来源: ${data.source ?? '-'}` },
          { icon: <User className="w-3 h-3" />, content: `设备类型: ${data.deviceType ?? '-'}` }
        );
        break;
      case 'email_complaint_received':
        facts.push(
          { icon: <Mail className="w-3 h-3" />, content: `客户邮箱: ${data.customerEmail ?? '-'}` },
          { icon: <ShoppingCart className="w-3 h-3" />, content: `订单号: ${data.orderId ?? '-'}` },
          { icon: <AlertTriangle className="w-3 h-3" />, content: `投诉类型: ${data.complaintType ?? '-'}` },
          { icon: <Check className="w-3 h-3" />, content: `情绪: ${data.sentiment ?? '-'}` },
        );
        break;
      case 'email_delivery_failed':
        facts.push(
          { icon: <Hash className="w-3 h-3" />, content: `活动ID: ${data.campaignId ?? '-'}` },
          { icon: <AlertTriangle className="w-3 h-3" />, content: `失败数: ${data.failedCount ?? '-'}` },
          { icon: <AlertTriangle className="w-3 h-3" />, content: `错误类型: ${data.errorType ?? '-'}` },
          { icon: <Mail className="w-3 h-3" />, content: `受影响域: ${Array.isArray(data.affectedDomains) ? data.affectedDomains.join(', ') : '-'}` },
        );
        break;
      case 'email_unsubscribe_spike':
        facts.push(
          { icon: <Hash className="w-3 h-3" />, content: `活动ID: ${data.campaignId ?? '-'}` },
          { icon: <AlertTriangle className="w-3 h-3" />, content: `退订数: ${data.unsubscribeCount ?? '-'}` },
          { icon: <TrendingUp className="w-3 h-3" />, content: `当前退订率: ${data.currentRate ?? '-'}` },
          { icon: <TrendingUp className="w-3 h-3" />, content: `正常退订率: ${data.normalRate ?? '-'}` },
        );
        break;
      case 'email_bounce_rate_high':
        facts.push(
          { icon: <Hash className="w-3 h-3" />, content: `活动ID: ${data.campaignId ?? '-'}` },
          { icon: <TrendingUp className="w-3 h-3" />, content: `退信率: ${data.bounceRate ?? '-'}` },
          { icon: <TrendingUp className="w-3 h-3" />, content: `正常退信率: ${data.normalRate ?? '-'}` },
          { icon: <Mail className="w-3 h-3" />, content: `无效邮箱数: ${data.invalidEmails ?? '-'}` },
        );
        break;
      default:
        break;
    }
    return facts;
  }, [relatedEvent]);

  const handleExecuteAISuggestions = () => {
    // AI全自动处理中不支持手动“一键执行AI建议”
    if (!incident || isExecuted || incident.status === 'automated') return;

    // Convert response actions to tasks
    const activeActions = actions.filter(a => a.status !== 'archived' && !isActionLocked(a));
    const newTasks: Task[] = activeActions.map((action, index) => ({
      id: `task_${incident.id}_${action.id}`,
      title: action.title,
      status: 'pending' as const,
      assignee: action.assigneeId ? (mockUsers.find(u => u.id === action.assigneeId) || getAssigneeForAction(action)) : getAssigneeForAction(action),
      parentIncidentId: incident.id,
      dueDate: action.dueAt ? new Date(action.dueAt) : addHours(new Date(), 24),
      scheduledTime: action.startAt && action.dueAt ? { start: new Date(action.startAt), end: new Date(action.dueAt) } : undefined,
      // 为原型演示指定不同的处理形态
      handlingType: index === 0 ? 'internal' : index === 1 ? 'external_link' : 'external_approval',
      externalSystem: index === 1 ? 'OA' : index === 2 ? 'ERP' : undefined,
      externalUrl: '/legacy-app-placeholder',
      externalStatus: index === 2 ? 'pending_sync' : undefined,
    }));

    setGeneratedTasks(newTasks);
    setIsExecuted(true);
    // 执行后将所有有效动作标记为处理中，并清理“已完成”状态
    setProcessingActionIds(new Set(activeActions.map(a => a.id)));
    setCompletedActionIds(prev => {
      const n = new Set(prev);
      activeActions.forEach(a => n.delete(a.id));
      return n;
    });

    // Show success notification
    alert(`已成功创建 ${newTasks.length} 个任务并分配给团队成员！已在“建议响应动作”区域展示。`);
  };

  // 动作CRUD与完成标记逻辑
  const openCreateAction = () => {
    // AI全自动处理中不支持新增动作
    if (incident?.status === 'automated') return;
    setEditActionId(null);
    setIsEditReadOnly(false);
    form.reset({ 
      title: '', 
      type: 'communication', 
      description: '', 
      startAt: new Date().toISOString().slice(0,16),
      dueAt: addHours(new Date(), 24).toISOString().slice(0,16),
      assigneeId: mockUsers[0]?.id,
      attachmentsText: ''
    });
    setIsActionDialogOpen(true);
  };

  const openEditAction = (id: string) => {
    // AI全自动处理中不支持编辑
    if (incident?.status === 'automated') return;
    const a = actions.find(x => x.id === id);
    if (a) {
      setIsEditReadOnly(a.status === 'archived' || processingActionIds.has(id));
      setEditActionId(id);
      form.reset({ 
        title: a.title, 
        type: a.type, 
        description: a.description, 
        startAt: a.startAt ?? new Date().toISOString().slice(0,16),
        dueAt: a.dueAt ?? addHours(new Date(), 24).toISOString().slice(0,16),
        assigneeId: a.assigneeId ?? (getAssigneeForAction(a)?.id ?? mockUsers[0]?.id),
        attachmentsText: (a.attachments && a.attachments.length > 0) ? a.attachments.join('\n') : ''
      });
      setIsActionDialogOpen(true);
    }
  };

  const onSubmit = (values: { 
    title: string; 
    type: ResponseAction['type']; 
    description: string; 
    startAt?: string;
    dueAt?: string;
    assigneeId?: string;
    attachmentsText?: string;
  }) => {
    const attachmentsArray = (values.attachmentsText || '')
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const payload: Partial<UIResponseAction> = {
      title: values.title,
      type: values.type,
      description: values.description,
      aiSuggestion: defaultAISuggestion(values.type, values.title),
      startAt: values.startAt,
      dueAt: values.dueAt,
      assigneeId: values.assigneeId,
      attachments: attachmentsArray
    };

    if (editActionId) {
      setActions(prev => prev.map(a => a.id === editActionId ? { ...a, ...payload } as UIResponseAction : a));
    } else {
      const newId = `action_${Date.now()}`;
      const newAction: UIResponseAction = { id: newId, status: 'active', ...(payload as UIResponseAction) } as UIResponseAction;
      setActions(prev => [newAction, ...prev]);
    }
    setIsActionDialogOpen(false);
  };

  const deleteAction = (id: string) => {
    setActions(prev => prev.filter(a => a.id !== id));
    setCompletedActionIds(prev => {
      const n = new Set(prev);
      n.delete(id);
      return n;
    });
  };

  const toggleArchive = (id: string) => {
    // AI全自动处理中不支持归档/取消归档
    if (incident?.status === 'automated') return;
    // 处理中状态下禁止归档（active -> archived），但允许取消归档
    const target = actions.find(a => a.id === id);
    if (target && target.status !== 'archived' && processingActionIds.has(id)) return;
    setActions(prev => prev.map(a => a.id === id ? { ...a, status: a.status === 'archived' ? 'active' : 'archived' } : a));
    // 归档/取消归档均清理与其互斥的处理中与已完成标记
    setProcessingActionIds(prev => {
      const n = new Set(prev);
      n.delete(id);
      return n;
    });
    setCompletedActionIds(prev => {
      const n = new Set(prev);
      n.delete(id);
      return n;
    });
  };

  const toggleCompleted = (id: string) => {
    // AI全自动处理中不支持标记完成/取消完成
    if (incident?.status === 'automated') return;
    // 禁止在归档或处理中状态下切换完成
    const target = actions.find(a => a.id === id);
    if (!target) return;
    if (target.status === 'archived' || processingActionIds.has(id)) return;
    setCompletedActionIds(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
    // 完成与处理中、归档互斥：标记完成时取消处理中并取消归档
    setProcessingActionIds(prev => {
      const n = new Set(prev);
      n.delete(id);
      return n;
    });
    setActions(prev => prev.map(a => a.id === id ? { ...a, status: 'active' } : a));
  };

  // 单项执行AI建议：完成标记并提示
  const handleExecuteAISuggestion = (id: string) => {
    // AI全自动处理中不支持单项“执行AI建议”
    if (incident?.status === 'automated') return;
    const a = actions.find(x => x.id === id);
    if (!a) return;
    if (a.approvalStatus && a.approvalStatus !== 'approved') {
      alert('该动作处于待审批或已拒绝状态，除“打开传统页面”外的操作已禁用。');
      return;
    }
    if (a.paused) {
      alert('该动作已暂停，除“打开传统页面”外的操作已禁用。');
      return;
    }
    alert(`已开始执行AI建议：${a.aiSuggestion ?? a.title}`);
    // 执行时清理“已完成”并确保未归档
    setCompletedActionIds(prev => {
      const n = new Set(prev);
      n.delete(id);
      return n;
    });
    setActions(prev => prev.map(x => x.id === id ? { ...x, status: 'active' } : x));
    setProcessingActionIds(prev => {
      const n = new Set(prev);
      n.add(id);
      return n;
    });
  };

  // 判断是否为邮件相关上下文（事件匹配失败时的容错判断）
  const isEmailIncident = (inc: Incident | null): boolean => {
    if (!inc) return false;
    const text = `${inc.title} ${inc.description ?? ''}`;
    const keywords = ['邮件', 'SMTP', '退订', '退信', '投诉', '邮箱'];
    const hasKeyword = keywords.some(k => text.includes(k));
    const byEntity = (inc.involvedEntities || []).some(e => (e.value || '').includes('邮件'));
    const byActions = (inc.suggestedResponsePlan || []).some(a => (a.id || '').startsWith('ra_email'));
    return hasKeyword || byEntity || byActions;
  };

  // 跳转到传统界面手动处理
  const handleGoToLegacy = () => {
    // AI全自动处理中不支持跳转到传统界面
    if (incident?.status === 'automated') return;
    const relEvent = findRelatedEvent(incident);
    const gotoEmail = (relEvent && relEvent.type.startsWith('email_')) || isEmailIncident(incident);
    if (gotoEmail) {
      navigate('/email-manual-processing', { state: { incident } });
    } else {
      navigate('/response-actions', { state: { incident } });
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
              <Badge className={priorityColors[incident.priority]}>
                {priorityLabels[incident.priority]}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {statusLabels[incident.status]}
              </Badge>
            </div>
          </div>
          {incident.description && (
            <div className="rounded-md border border-eip-accent/30 bg-eip-accent/5 p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs font-medium text-eip-accent">事件描述</div>
              </div>
              {/* 移除涉及对象标签展示 */}
              <p className="text-base font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                {incident.description}
              </p>
              {/* 关键事实 */}
              <div className="mt-3 bg-white/60 dark:bg-slate-700/50 rounded-md p-2">
                <div className="text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1">关键事实</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-700 dark:text-slate-300">
                  <div className="inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {incident.createdAt}
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
                      事件类型: {formatEventTypeLabel(relatedEvent.type)}
                    </div>
                  )}
                  {relatedEvent && (
                    <div className="inline-flex items-center gap-1">
                      <Hash className="w-3 h-3" />
                      原始事件ID: {relatedEvent.id}
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
        {/* <Card className="border-eip-accent/20 bg-gradient-to-br from-eip-accent/5 to-eip-accent/10">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm font-semibold">
              <Brain className="w-4 h-4 mr-2 text-eip-accent" />
              AI分析
              <Badge variant="outline" className="ml-auto text-xs">
                置信度 {incident.aiAnalysis.confidence}%
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {incident.aiAnalysis.summary}
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              {incident.aiAnalysis.keyMetrics.map((metric, index) => (
                <div key={index} className="bg-white/50 dark:bg-slate-700/50 rounded-lg p-3">
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
        </Card> */}

        {/* Suggested Response Plan / Generated Tasks */}

        {/* 创建/编辑动作弹窗 */}
        <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editActionId ? (isEditReadOnly ? '查看响应动作' : '编辑响应动作') : '新增响应动作'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                  name="title"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>动作标题</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入动作标题" {...field} disabled={isEditReadOnly} />
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
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger disabled={isEditReadOnly}>
                            <SelectValue placeholder="选择类型" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="communication">沟通</SelectItem>
                            <SelectItem value="process">流程</SelectItem>
                            <SelectItem value="data_enrichment">数据补充</SelectItem>
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
                        <Textarea rows={4} placeholder="请输入动作描述" {...field} disabled={isEditReadOnly} />
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
                          <Input type="datetime-local" {...field} disabled={isEditReadOnly} />
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
                          <Input type="datetime-local" {...field} disabled={isEditReadOnly} />
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
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger disabled={isEditReadOnly}>
                            <SelectValue placeholder="选择负责人" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockUsers.map(u => (
                              <SelectItem key={u.id} value={u.id}>{u.name}（{u.role}）</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="attachmentsText"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>附件（每行一个）</FormLabel>
                      <FormControl>
                        <Textarea rows={3} placeholder="可输入附件名称或链接，每行一个" {...field} disabled={isEditReadOnly} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsActionDialogOpen(false)}>取消</Button>
                  {!isEditReadOnly && (
                    <Button type="submit" className="bg-eip-accent hover:bg-eip-accent/90">{editActionId ? '保存修改' : '创建动作'}</Button>
                  )}
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* 操作记录 */}
        {/* Action Buttons 已移除，根据需求删除底部操作区 */}
      </div>
    </div>
  );
}

