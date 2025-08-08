import { useState, useMemo } from 'react';
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
import { Plus, Edit, Power, PowerOff, Trash2 } from 'lucide-react';
import { 
  mockResponseActions, 
  ResponseAction,
  getActionTypeDisplay,
  getStatusDisplay,
  getPurposeLabel
} from '@/shared/responseActionsData';

interface FiltersState {
  search: string;
  actionType: string;
  status: string;
}

export default function ResponseActions() {
  const [filters, setFilters] = useState<FiltersState>({
    search: '',
    actionType: 'all',
    status: 'all'
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<ResponseAction | null>(null);

  // Filter actions based on current filter state
  const filteredActions = useMemo(() => {
    return mockResponseActions.filter(action => {
      const matchesSearch = filters.search === '' || 
        action.actionName.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesType = filters.actionType === 'all' || 
        (filters.actionType === 'popup' && action.actionType === 'POPUP') ||
        (filters.actionType === 'email' && action.actionType === 'EMAIL');
      
      const matchesStatus = filters.status === 'all' || 
        action.status.toLowerCase() === filters.status.toLowerCase();

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [filters]);

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

  // Handle action operations
  const handleEdit = (action: ResponseAction) => {
    setEditingAction(action);
    setIsCreateModalOpen(true);
  };

  const handleEnable = (actionId: string) => {
    // TODO: Implement enable action
    console.log('Enable action:', actionId);
  };

  const handleDisable = (actionId: string) => {
    // TODO: Implement disable action
    console.log('Disable action:', actionId);
  };

  const handleDelete = (actionId: string) => {
    // TODO: Implement delete action
    console.log('Delete action:', actionId);
  };

  // Render action buttons based on status
  const renderActionButtons = (action: ResponseAction) => {
    const baseClasses = "h-8 px-3 text-xs";
    
    switch (action.status) {
      case 'DRAFT':
        return (
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              className={baseClasses}
              onClick={() => handleEdit(action)}
            >
              <Edit className="h-3 w-3 mr-1" />
              编辑
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={`${baseClasses} text-green-600 border-green-200 hover:bg-green-50`}
              onClick={() => handleEnable(action.id)}
            >
              <Power className="h-3 w-3 mr-1" />
              启用
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={`${baseClasses} text-red-600 border-red-200 hover:bg-red-50`}
              onClick={() => handleDelete(action.id)}
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
              onClick={() => handleEdit(action)}
            >
              <Edit className="h-3 w-3 mr-1" />
              编辑
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={`${baseClasses} text-orange-600 border-orange-200 hover:bg-orange-50`}
              onClick={() => handleDisable(action.id)}
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
              onClick={() => handleEdit(action)}
            >
              <Edit className="h-3 w-3 mr-1" />
              编辑
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={`${baseClasses} text-red-600 border-red-200 hover:bg-red-50`}
              onClick={() => handleDelete(action.id)}
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
        >
          <Plus className="h-4 w-4" />
          创建新动作
        </Button>
      </div>

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
        {filteredActions.length === 0 ? (
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
                <TableHead>更新时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActions.map((action) => {
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

      {/* TODO: Create/Edit Modal Component will be added next */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h2 className="text-xl font-bold mb-4">
              {editingAction ? `编辑动作: ${editingAction.actionName}` : '创建新动作'}
            </h2>
            <p className="text-gray-600">创建/编辑模态框组件将在下一步实现</p>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                取消
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
