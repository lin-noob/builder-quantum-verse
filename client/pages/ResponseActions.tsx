import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Edit, Power, PowerOff, Trash2, Loader2, AlertCircle, ArrowUpDown, ArrowUp, ArrowDown, Eye } from 'lucide-react';
import {
  ResponseAction,
  getActionTypeDisplay,
  getStatusDisplay,
  getPurposeLabel
} from '@shared/responseActionsData';
import ResponseActionModal from '@/components/ResponseActionModal';
import ConfirmationModal from '@/components/ConfirmationModal';
import { useResponseActions, convertFormDataToApiRequest } from '@/hooks/useResponseActions';
import { useToast } from '@/hooks/use-toast';

interface FiltersState {
  search: string;
  actionType: string;
  status: string;
}

interface ConfirmationState {
  isOpen: boolean;
  type: 'enable' | 'disable' | 'delete';
  actionId: string;
  actionName: string;
}

interface SortState {
  field: string | null;
  direction: 'asc' | 'desc';
}

type SortableFields = 'totalExecutions' | 'totalInteractions' | 'totalConversions' | 'updatedAt';

export default function ResponseActions() {
  const { toast } = useToast();
  const {
    actions,
    loading,
    error,
    createAction,
    updateAction,
    deleteAction,
    enableAction,
    disableAction,
    clearError
  } = useResponseActions();

  const [filters, setFilters] = useState<FiltersState>({
    search: '',
    actionType: 'all',
    status: 'all'
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<ResponseAction | null>(null);
  const [confirmationModal, setConfirmationModal] = useState<ConfirmationState>({
    isOpen: false,
    type: 'enable',
    actionId: '',
    actionName: ''
  });
  const [operationLoading, setOperationLoading] = useState(false);
  const [sortState, setSortState] = useState<SortState>({
    field: null,
    direction: 'desc'
  });

  // Filter and sort actions based on current filter and sort state
  const filteredAndSortedActions = useMemo(() => {
    let filtered = actions.filter(action => {
      const matchesSearch = filters.search === '' ||
        action.actionName.toLowerCase().includes(filters.search.toLowerCase());

      const matchesType = filters.actionType === 'all' ||
        (filters.actionType === 'popup' && action.actionType === 'POPUP') ||
        (filters.actionType === 'email' && action.actionType === 'EMAIL');

      const matchesStatus = filters.status === 'all' ||
        action.status.toLowerCase() === filters.status.toLowerCase();

      return matchesSearch && matchesType && matchesStatus;
    });

    // Apply sorting
    if (sortState.field) {
      filtered.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        if (sortState.field === 'updatedAt') {
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
        } else {
          aValue = a[sortState.field as keyof ResponseAction];
          bValue = b[sortState.field as keyof ResponseAction];
        }

        if (sortState.direction === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    return filtered;
  }, [actions, filters, sortState]);

  // Format date for display
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

  // Handle sorting
  const handleSort = (field: SortableFields) => {
    setSortState(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  // Get sort icon for column headers
  const getSortIcon = (field: SortableFields) => {
    if (sortState.field !== field) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    return sortState.direction === 'desc'
      ? <ArrowDown className="h-4 w-4 text-blue-600" />
      : <ArrowUp className="h-4 w-4 text-blue-600" />;
  };

  // Handle action operations
  const handleEdit = (action: ResponseAction) => {
    setEditingAction(action);
    setIsCreateModalOpen(true);
  };

  const handleViewDetail = (actionId: string) => {
    // TODO: Navigate to detail page
    console.log('View detail for action:', actionId);
  };

  const handleEnable = (action: ResponseAction) => {
    setConfirmationModal({
      isOpen: true,
      type: 'enable',
      actionId: action.id,
      actionName: action.actionName
    });
  };

  const handleDisable = (action: ResponseAction) => {
    setConfirmationModal({
      isOpen: true,
      type: 'disable',
      actionId: action.id,
      actionName: action.actionName
    });
  };

  const handleDelete = (action: ResponseAction) => {
    setConfirmationModal({
      isOpen: true,
      type: 'delete',
      actionId: action.id,
      actionName: action.actionName
    });
  };

  // Handle confirmation actions
  const handleConfirmation = async () => {
    const { type, actionId, actionName } = confirmationModal;

    try {
      setOperationLoading(true);

      switch (type) {
        case 'enable':
          await enableAction(actionId);
          toast({
            title: '启用成功',
            description: `动作"${actionName}"已成功启用`
          });
          break;
        case 'disable':
          await disableAction(actionId);
          toast({
            title: '停用成功',
            description: `动作"${actionName}"已成功停用`
          });
          break;
        case 'delete':
          await deleteAction(actionId);
          toast({
            title: '删除成功',
            description: `动作"${actionName}"已成功删除`
          });
          break;
      }
    } catch (err) {
      toast({
        title: '操作失败',
        description: err instanceof Error ? err.message : '未知错误',
        variant: 'destructive'
      });
    } finally {
      setOperationLoading(false);
    }
  };

  // Handle save action from modal
  const handleSaveAction = async (formData: any, isDraft: boolean) => {
    try {
      setOperationLoading(true);

      if (editingAction) {
        // Update existing action
        const updateData = {
          id: editingAction.id,
          actionName: formData.actionName,
          actionType: formData.actionType,
          purpose: formData.purpose,
          parameters: formData.parameters
        };

        await updateAction(updateData);
        toast({
          title: '更新成功',
          description: `动作"${formData.actionName}"已成功更新`
        });
      } else {
        // Create new action
        const apiRequest = convertFormDataToApiRequest(formData, formData.actionType, isDraft);
        await createAction(apiRequest);
        toast({
          title: '创建成功',
          description: `动作"${formData.actionName}"已成功${isDraft ? '保存为草稿' : '创建并生效'}`
        });
      }

      setIsCreateModalOpen(false);
      setEditingAction(null);
    } catch (err) {
      toast({
        title: '保存失败',
        description: err instanceof Error ? err.message : '未知错误',
        variant: 'destructive'
      });
    } finally {
      setOperationLoading(false);
    }
  };

  // Render action buttons based on status
  const renderActionButtons = (action: ResponseAction) => {
    const baseClasses = "h-8 px-3 text-xs";
    const isDisabled = operationLoading;

    switch (action.status) {
      case 'DRAFT':
        return (
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              className={baseClasses}
              onClick={() => handleViewDetail(action.id)}
              disabled={isDisabled}
            >
              <Eye className="h-3 w-3 mr-1" />
              详情
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={baseClasses}
              onClick={() => handleEdit(action)}
              disabled={isDisabled}
            >
              <Edit className="h-3 w-3 mr-1" />
              编辑
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={`${baseClasses} text-green-600 border-green-200 hover:bg-green-50`}
              onClick={() => handleEnable(action)}
              disabled={isDisabled}
            >
              <Power className="h-3 w-3 mr-1" />
              启用
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={`${baseClasses} text-red-600 border-red-200 hover:bg-red-50`}
              onClick={() => handleDelete(action)}
              disabled={isDisabled}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              删除
            </Button>
          </div>
        );

      case 'ACTIVE':
        return (
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              className={baseClasses}
              onClick={() => handleViewDetail(action.id)}
              disabled={isDisabled}
            >
              <Eye className="h-3 w-3 mr-1" />
              详情
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={baseClasses}
              onClick={() => handleEdit(action)}
              disabled={isDisabled}
            >
              <Edit className="h-3 w-3 mr-1" />
              编辑
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={`${baseClasses} text-orange-600 border-orange-200 hover:bg-orange-50`}
              onClick={() => handleDisable(action)}
              disabled={isDisabled}
            >
              <PowerOff className="h-3 w-3 mr-1" />
              停用
            </Button>
          </div>
        );

      case 'ARCHIVED':
        return (
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              className={baseClasses}
              onClick={() => handleViewDetail(action.id)}
              disabled={isDisabled}
            >
              <Eye className="h-3 w-3 mr-1" />
              详情
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={baseClasses}
              onClick={() => handleEdit(action)}
              disabled={isDisabled}
            >
              <Edit className="h-3 w-3 mr-1" />
              编辑
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={`${baseClasses} text-red-600 border-red-200 hover:bg-red-50`}
              onClick={() => handleDelete(action)}
              disabled={isDisabled}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              删除
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">响应动作库</h1>
        <Button
          onClick={() => {
            setEditingAction(null);
            setIsCreateModalOpen(true);
          }}
          className="flex items-center gap-2"
          disabled={operationLoading}
        >
          <Plus className="h-4 w-4" />
          创建新动作
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            {error}
            <Button variant="outline" size="sm" onClick={clearError}>
              关闭
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Filters & Search Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <Input
              placeholder="搜索动作名称"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full"
            />
          </div>

          {/* Type Filter */}
          <div className="w-full md:w-48">
            <Select 
              value={filters.actionType} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, actionType: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="popup">网页弹窗</SelectItem>
                <SelectItem value="email">发送邮件</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-48">
            <Select 
              value={filters.status} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="draft">草稿</SelectItem>
                <SelectItem value="active">生效中</SelectItem>
                <SelectItem value="archived">已归档</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Actions Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-gray-400" />
            <p className="text-gray-500">正在加载响应动作...</p>
          </div>
        ) : filteredAndSortedActions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-gray-400 mb-2">
              <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无响应动作</h3>
            <p className="text-gray-500 mb-4">
              {filters.search || filters.actionType !== 'all' || filters.status !== 'all'
                ? '没有找到符合条件的动作，请尝试调整筛选条件'
                : '请点击右上角"创建新动作"开始使用'
              }
            </p>
            {(!filters.search && filters.actionType === 'all' && filters.status === 'all') && (
              <Button
                onClick={() => {
                  setEditingAction(null);
                  setIsCreateModalOpen(true);
                }}
                className="flex items-center gap-2"
                disabled={operationLoading}
              >
                <Plus className="h-4 w-4" />
                创建新动作
              </Button>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>动作名称</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>用途</TableHead>
                <TableHead>状态</TableHead>
                <TableHead
                  className="cursor-pointer select-none hover:bg-gray-50"
                  onClick={() => handleSort('totalExecutions')}
                >
                  <div className="flex items-center gap-2">
                    累计执行次数
                    {getSortIcon('totalExecutions')}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none hover:bg-gray-50"
                  onClick={() => handleSort('totalInteractions')}
                >
                  <div className="flex items-center gap-2">
                    累计互动次数
                    {getSortIcon('totalInteractions')}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none hover:bg-gray-50"
                  onClick={() => handleSort('totalConversions')}
                >
                  <div className="flex items-center gap-2">
                    累计转化数
                    {getSortIcon('totalConversions')}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none hover:bg-gray-50"
                  onClick={() => handleSort('updatedAt')}
                >
                  <div className="flex items-center gap-2">
                    更新时间
                    {getSortIcon('updatedAt')}
                  </div>
                </TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedActions.map((action) => {
                const statusDisplay = getStatusDisplay(action.status);
                return (
                  <TableRow key={action.id}>
                    <TableCell className="font-medium">
                      {action.actionName}
                    </TableCell>
                    <TableCell>
                      {getActionTypeDisplay(action.actionType)}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {getPurposeLabel(action.purpose)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusDisplay.variant}>
                        {statusDisplay.text}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {action.totalExecutions.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      {action.totalInteractions.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      {action.totalConversions.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {formatDate(action.updatedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      {renderActionButtons(action)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Create/Edit Modal */}
      <ResponseActionModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingAction(null);
        }}
        editingAction={editingAction}
        onSave={handleSaveAction}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => !operationLoading && setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmation}
        type={confirmationModal.type}
        actionName={confirmationModal.actionName}
      />
    </div>
  );
}
