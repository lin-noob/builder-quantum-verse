import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Edit, 
  Power, 
  PowerOff, 
  Trash2, 
  Calendar, 
  Clock, 
  Target, 
  BarChart3,
  MousePointer,
  TrendingUp,
  Mail,
  MessageSquare,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { 
  ResponseAction,
  getActionTypeDisplay,
  getStatusDisplay,
  getPurposeLabel
} from '@shared/responseActionsData';
import { useResponseActions } from '@/hooks/useResponseActions';
import { useToast } from '@/hooks/use-toast';

export default function ResponseActionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { actions, loading, enableAction, disableAction, deleteAction } = useResponseActions();
  
  const [action, setAction] = useState<ResponseAction | null>(null);
  const [operationLoading, setOperationLoading] = useState(false);

  // Find the action by ID
  useEffect(() => {
    if (!loading && actions.length > 0 && id) {
      const foundAction = actions.find(a => a.id === id);
      setAction(foundAction || null);
    }
  }, [actions, loading, id]);

  // Handle operations
  const handleEdit = () => {
    if (action) {
      navigate(`/response-actions/edit/${action.id}`);
    }
  };

  const handleEnable = async () => {
    if (!action) return;
    
    try {
      setOperationLoading(true);
      await enableAction(action.id);
      toast({
        title: '启用成功',
        description: `动作"${action.actionName}"已成功启用`
      });
      // Update local action state
      setAction(prev => prev ? { ...prev, status: 'ACTIVE' } : null);
    } catch (err) {
      toast({
        title: '启用失败',
        description: err instanceof Error ? err.message : '未知错误',
        variant: 'destructive'
      });
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDisable = async () => {
    if (!action) return;
    
    try {
      setOperationLoading(true);
      await disableAction(action.id);
      toast({
        title: '停用成功',
        description: `动作"${action.actionName}"已成功停用`
      });
      // Update local action state
      setAction(prev => prev ? { ...prev, status: 'ARCHIVED' } : null);
    } catch (err) {
      toast({
        title: '停用失败',
        description: err instanceof Error ? err.message : '未知错误',
        variant: 'destructive'
      });
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!action) return;
    
    if (window.confirm(`您确定要永久删除动作"${action.actionName}"吗？此操作不可撤销。`)) {
      try {
        setOperationLoading(true);
        await deleteAction(action.id);
        toast({
          title: '删除成功',
          description: `动作"${action.actionName}"已成功删除`
        });
        navigate('/response-actions');
      } catch (err) {
        toast({
          title: '删除失败',
          description: err instanceof Error ? err.message : '未知错误',
          variant: 'destructive'
        });
      } finally {
        setOperationLoading(false);
      }
    }
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate('/response-actions')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回列表
          </Button>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">正在加载动作详情...</p>
        </div>
      </div>
    );
  }

  // Action not found
  if (!action) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate('/response-actions')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回列表
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            未找到指定的响应动作，可能已被删除或不存在。
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const statusDisplay = getStatusDisplay(action.status);
  const isPopup = action.parameters.type === 'popup';

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/response-actions')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回列表
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{action.actionName}</h1>
            <p className="text-gray-500 mt-1">响应动作详情</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleEdit}
            disabled={operationLoading}
          >
            <Edit className="h-4 w-4 mr-2" />
            编辑
          </Button>
          
          {action.status === 'DRAFT' && (
            <Button
              variant="outline"
              onClick={handleEnable}
              disabled={operationLoading}
              className="text-green-600 border-green-200 hover:bg-green-50"
            >
              <Power className="h-4 w-4 mr-2" />
              启用
            </Button>
          )}
          
          {action.status === 'ACTIVE' && (
            <Button
              variant="outline"
              onClick={handleDisable}
              disabled={operationLoading}
              className="text-orange-600 border-orange-200 hover:bg-orange-50"
            >
              <PowerOff className="h-4 w-4 mr-2" />
              停用
            </Button>
          )}
          
          {(action.status === 'DRAFT' || action.status === 'ARCHIVED') && (
            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={operationLoading}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              删除
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                基本信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">动作名称</label>
                  <p className="text-lg font-medium mt-1">{action.actionName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">动作类型</label>
                  <div className="flex items-center gap-2 mt-1">
                    {isPopup ? <MessageSquare className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                    <span className="text-lg">{getActionTypeDisplay(action.actionType)}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">触发用途</label>
                <p className="text-lg mt-1">{getPurposeLabel(action.purpose)}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">状态</label>
                <div className="mt-1">
                  <Badge variant={statusDisplay.variant} className="text-sm px-3 py-1">
                    {statusDisplay.text}
                  </Badge>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    创建时间
                  </label>
                  <p className="mt-1">{formatDate(action.createdAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    更新时间
                  </label>
                  <p className="mt-1">{formatDate(action.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Parameters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isPopup ? <MessageSquare className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
                {isPopup ? '弹窗参数' : '邮件参数'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isPopup ? (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-600">弹窗标题</label>
                    <p className="text-lg mt-1 font-medium">{action.parameters.title}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">弹窗正文</label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-md">
                      <p className="text-gray-900">{action.parameters.content}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">按钮文字</label>
                      <p className="mt-1 font-medium">{action.parameters.buttonText}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">按钮链接</label>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-blue-600 truncate">{action.parameters.buttonLink}</p>
                        <a 
                          href={action.parameters.buttonLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-600">邮件标题</label>
                    <p className="text-lg mt-1 font-medium">{action.parameters.subject}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">邮件正文</label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-md">
                      <div 
                        className="text-gray-900"
                        dangerouslySetInnerHTML={{ __html: action.parameters.content }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">发件人名称</label>
                    <p className="mt-1 font-medium">{action.parameters.senderName}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                效果追踪
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">累计执行次数</span>
                </div>
                <p className="text-3xl font-bold text-blue-600">
                  {action.totalExecutions.toLocaleString()}
                </p>
              </div>
              
              <Separator />
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <MousePointer className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-600">累计互动次数</span>
                </div>
                <p className="text-3xl font-bold text-green-600">
                  {action.totalInteractions.toLocaleString()}
                </p>
                {action.totalExecutions > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    互动率: {((action.totalInteractions / action.totalExecutions) * 100).toFixed(1)}%
                  </p>
                )}
              </div>
              
              <Separator />
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  <span className="text-sm font-medium text-gray-600">累计转化数</span>
                </div>
                <p className="text-3xl font-bold text-orange-600">
                  {action.totalConversions.toLocaleString()}
                </p>
                {action.totalInteractions > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    转化率: {((action.totalConversions / action.totalInteractions) * 100).toFixed(1)}%
                  </p>
                )}
              </div>
              
              {action.totalExecutions === 0 && (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm">
                    暂无执行数据
                    {action.status === 'DRAFT' && '（草稿状态）'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
