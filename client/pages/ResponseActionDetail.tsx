import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Calendar, 
  Target, 
  MessageSquare, 
  Mail, 
  MousePointer, 
  TrendingUp,
  AlertCircle,
  Edit,
  Play,
  Square,
  Trash2
} from 'lucide-react';
import {
  Rule,
  mockRules,
  getTriggerSummary,
  getActionTypeDisplay,
  getStatusDisplay,
  EVENT_NAME_DISPLAY,
  USER_SEGMENT_FIELDS,
  SCHEDULE_DISPLAY
} from '@shared/ruleData';
import ConfirmationModal from '@/components/ConfirmationModal';
import { useToast } from '@/hooks/use-toast';

interface ConfirmationState {
  isOpen: boolean;
  type: 'enable' | 'disable' | 'delete';
  ruleId: string;
  ruleName: string;
}

export default function ResponseActionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [rule, setRule] = useState<Rule | null>(null);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState<ConfirmationState>({
    isOpen: false,
    type: 'enable',
    ruleId: '',
    ruleName: ''
  });

  // Load rule data
  useEffect(() => {
    if (id) {
      const foundRule = mockRules.find(r => r.id === id);
      setRule(foundRule || null);
    }
    setLoading(false);
  }, [id]);

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle rule operations
  const handleEdit = () => {
    navigate(`/response-actions/edit/${rule?.id}`);
  };

  const handleEnable = () => {
    if (!rule) return;
    setConfirmationModal({
      isOpen: true,
      type: 'enable',
      ruleId: rule.id,
      ruleName: rule.ruleName
    });
  };

  const handleDisable = () => {
    if (!rule) return;
    setConfirmationModal({
      isOpen: true,
      type: 'disable',
      ruleId: rule.id,
      ruleName: rule.ruleName
    });
  };

  const handleDelete = () => {
    if (!rule) return;
    setConfirmationModal({
      isOpen: true,
      type: 'delete',
      ruleId: rule.id,
      ruleName: rule.ruleName
    });
  };

  // Handle confirmation actions
  const handleConfirmation = async () => {
    const { type, ruleName } = confirmationModal;

    try {
      setOperationLoading(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      switch (type) {
        case 'enable':
          toast({
            title: '启用成功',
            description: `规则"${ruleName}"已成功启用`
          });
          // Update local state
          if (rule) {
            setRule({...rule, status: 'active'});
          }
          break;
        case 'disable':
          toast({
            title: '停用成功',
            description: `规则"${ruleName}"已成功停用`
          });
          if (rule) {
            setRule({...rule, status: 'archived'});
          }
          break;
        case 'delete':
          toast({
            title: '删除成功',
            description: `规则"${ruleName}"已成功删除`
          });
          navigate('/response-actions');
          return;
      }
    } catch (err) {
      toast({
        title: '操作失败',
        description: err instanceof Error ? err.message : '未知错误',
        variant: 'destructive'
      });
    } finally {
      setOperationLoading(false);
      setConfirmationModal(prev => ({ ...prev, isOpen: false }));
    }
  };

  // Render trigger details
  const renderTriggerDetails = () => {
    if (!rule) return null;

    if (rule.trigger.type === 'real_time_event') {
      const trigger = rule.trigger;
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-600" />
            <span className="font-medium">实时事件触发</span>
          </div>
          <div className="ml-6 space-y-2">
            <div>
              <span className="text-sm font-medium text-gray-600">事件类型：</span>
              <span className="text-sm">{EVENT_NAME_DISPLAY[trigger.eventName]}</span>
            </div>
            {trigger.condition && (
              <div>
                <span className="text-sm font-medium text-gray-600">过滤条件：</span>
                <span className="text-sm">
                  {trigger.condition.field} {trigger.condition.operator} {trigger.condition.value}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    } else {
      const trigger = rule.trigger;
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-purple-600" />
            <span className="font-medium">用户模式触发</span>
          </div>
          <div className="ml-6 space-y-2">
            <div>
              <span className="text-sm font-medium text-gray-600">执行频率：</span>
              <span className="text-sm">{SCHEDULE_DISPLAY[trigger.schedule]}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">用户筛选：</span>
              <span className="text-sm">
                {USER_SEGMENT_FIELDS[trigger.segmentRule.field]} {trigger.segmentRule.operator} {trigger.segmentRule.value}
              </span>
            </div>
          </div>
        </div>
      );
    }
  };

  // Render action details
  const renderActionDetails = () => {
    if (!rule) return null;

    if (rule.action.type === 'popup') {
      const action = rule.action;
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-green-600" />
            <span className="font-medium">网页弹窗</span>
          </div>
          <div className="ml-6 space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-600">标题：</span>
              <div className="mt-1 p-2 bg-gray-50 rounded text-sm">{action.title}</div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">内容：</span>
              <div className="mt-1 p-2 bg-gray-50 rounded text-sm">{action.content}</div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">按钮文字：</span>
              <span className="text-sm ml-2">{action.buttonText}</span>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">按钮链接：</span>
              <a 
                href={action.buttonLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm ml-2 text-blue-600 hover:underline"
              >
                {action.buttonLink}
              </a>
            </div>
          </div>
        </div>
      );
    } else {
      const action = rule.action;
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-orange-600" />
            <span className="font-medium">发送邮件</span>
          </div>
          <div className="ml-6 space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-600">邮件标��：</span>
              <div className="mt-1 p-2 bg-gray-50 rounded text-sm">{action.subject}</div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">邮件内容：</span>
              <div 
                className="mt-1 p-2 bg-gray-50 rounded text-sm"
                dangerouslySetInnerHTML={{ __html: action.content }}
              />
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">发件人：</span>
              <span className="text-sm ml-2">{action.senderName}</span>
            </div>
          </div>
        </div>
      );
    }
  };

  // Render action buttons based on status
  const renderActionButtons = () => {
    if (!rule) return null;

    const isDisabled = operationLoading;

    switch (rule.status) {
      case 'draft':
        return (
          <div className="flex gap-3">
            <Button onClick={handleEdit} disabled={isDisabled} className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              编辑
            </Button>
            <Button 
              onClick={handleEnable} 
              disabled={isDisabled}
              variant="outline"
              className="flex items-center gap-2 text-green-600 border-green-600 hover:bg-green-50"
            >
              <Play className="h-4 w-4" />
              启用
            </Button>
            <Button 
              onClick={handleDelete} 
              disabled={isDisabled}
              variant="outline"
              className="flex items-center gap-2 text-red-600 border-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              删除
            </Button>
          </div>
        );

      case 'active':
        return (
          <div className="flex gap-3">
            <Button onClick={handleEdit} disabled={isDisabled} className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              编辑
            </Button>
            <Button 
              onClick={handleDisable} 
              disabled={isDisabled}
              variant="outline"
              className="flex items-center gap-2 text-orange-600 border-orange-600 hover:bg-orange-50"
            >
              <Square className="h-4 w-4" />
              停用
            </Button>
          </div>
        );

      case 'archived':
        return (
          <div className="flex gap-3">
            <Button onClick={handleEdit} disabled={isDisabled} className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              编辑
            </Button>
            <Button 
              onClick={handleDelete} 
              disabled={isDisabled}
              variant="outline"
              className="flex items-center gap-2 text-red-600 border-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              删除
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!rule) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Link 
            to="/response-actions" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回列表
          </Link>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            未找到指定的规���，可能已被删除或不存在。
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const statusDisplay = getStatusDisplay(rule.status);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/response-actions"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回列表
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-lg font-medium text-gray-900">{rule.ruleName}</span>
            <Badge
              variant={statusDisplay.color === 'green' ? 'default' : 'secondary'}
              className={statusDisplay.color === 'green' ? 'bg-green-100 text-green-800' : ''}
            >
              {statusDisplay.text}
            </Badge>
          </div>
        </div>
        {renderActionButtons()}
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>基本信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-600">规则ID：</span>
              <div className="text-sm font-mono mt-1">{rule.id}</div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">响应动作类型：</span>
              <div className="text-sm mt-1">{getActionTypeDisplay(rule.action)}</div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">创建时间：</span>
              <div className="text-sm mt-1">{formatDate(rule.createdAt)}</div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">更新时间：</span>
              <div className="text-sm mt-1">{formatDate(rule.updatedAt)}</div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">触发器摘要：</span>
              <div className="text-sm mt-1 p-2 bg-gray-50 rounded">
                {getTriggerSummary(rule.trigger)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            效果统计
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {rule.totalExecutions.toLocaleString()}
              </div>
              <div className="text-sm text-blue-600">累计执行次数</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {rule.totalInteractions.toLocaleString()}
              </div>
              <div className="text-sm text-green-600">累计互动次数</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {rule.totalConversions.toLocaleString()}
              </div>
              <div className="text-sm text-purple-600">累计转化数</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {rule.totalInteractions > 0
                  ? ((rule.totalConversions / rule.totalInteractions) * 100).toFixed(1) + '%'
                  : '0%'
                }
              </div>
              <div className="text-sm text-orange-600">转化率</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trigger Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>触发器配置</CardTitle>
        </CardHeader>
        <CardContent>
          {renderTriggerDetails()}
        </CardContent>
      </Card>

      {/* Action Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>响应动作配置</CardTitle>
        </CardHeader>
        <CardContent>
          {renderActionDetails()}
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => !operationLoading && setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmation}
        type={confirmationModal.type}
        actionName={confirmationModal.ruleName}
      />
    </div>
  );
}
