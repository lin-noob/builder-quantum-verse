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
import { Plus, Loader2, AlertCircle, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import {
  Rule,
  mockRules,
  getTriggerSummary,
  getActionTypeDisplay,
  getStatusDisplay
} from '@shared/ruleData';
import ConfirmationModal from '@/components/ConfirmationModal';
import { useToast } from '@/hooks/use-toast';

interface FiltersState {
  search: string;
  status: string;
}

interface ConfirmationState {
  isOpen: boolean;
  type: 'enable' | 'disable' | 'delete';
  ruleId: string;
  ruleName: string;
}

interface SortState {
  field: string | null;
  direction: 'asc' | 'desc';
}

type SortableFields = 'totalExecutions' | 'totalInteractions' | 'totalConversions';

export default function ResponseActions() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Use mock data for now
  const [rules] = useState<Rule[]>(mockRules);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  const [filters, setFilters] = useState<FiltersState>({
    search: '',
    status: 'all'
  });

  const [confirmationModal, setConfirmationModal] = useState<ConfirmationState>({
    isOpen: false,
    type: 'enable',
    ruleId: '',
    ruleName: ''
  });
  const [operationLoading, setOperationLoading] = useState(false);
  const [sortState, setSortState] = useState<SortState>({
    field: null,
    direction: 'desc'
  });

  // Filter and sort rules based on current filter and sort state
  const filteredAndSortedRules = useMemo(() => {
    let filtered = rules.filter(rule => {
      const matchesSearch = filters.search === '' ||
        rule.ruleName.toLowerCase().includes(filters.search.toLowerCase());

      const matchesStatus = filters.status === 'all' ||
        rule.status === filters.status;

      return matchesSearch && matchesStatus;
    });

    // Apply sorting
    if (sortState.field) {
      filtered.sort((a, b) => {
        const aValue = a[sortState.field as keyof Rule];
        const bValue = b[sortState.field as keyof Rule];

        if (sortState.direction === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    return filtered;
  }, [rules, filters, sortState]);

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

  // Handle rule operations
  const handleEdit = (rule: Rule) => {
    navigate(`/response-actions/edit/${rule.id}`);
  };

  const handleViewDetail = (ruleId: string) => {
    navigate(`/response-actions/${ruleId}`);
  };

  const handleEnable = (rule: Rule) => {
    setConfirmationModal({
      isOpen: true,
      type: 'enable',
      ruleId: rule.id,
      ruleName: rule.ruleName
    });
  };

  const handleDisable = (rule: Rule) => {
    setConfirmationModal({
      isOpen: true,
      type: 'disable',
      ruleId: rule.id,
      ruleName: rule.ruleName
    });
  };

  const handleDelete = (rule: Rule) => {
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
          break;
        case 'disable':
          toast({
            title: '停用成功',
            description: `规则"${ruleName}"已成功停用`
          });
          break;
        case 'delete':
          toast({
            title: '删除成功',
            description: `规则"${ruleName}"已成功删除`
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
      setConfirmationModal(prev => ({ ...prev, isOpen: false }));
    }
  };

  // Render action links based on status
  const renderActionLinks = (rule: Rule) => {
    const isDisabled = operationLoading;
    const linkClass = "text-blue-600 hover:text-blue-800 cursor-pointer text-sm";
    const disabledClass = "text-gray-400 cursor-not-allowed text-sm";

    switch (rule.status) {
      case 'draft':
        return (
          <div className="flex gap-3 text-sm">
            <span
              className={isDisabled ? disabledClass : linkClass}
              onClick={() => !isDisabled && handleViewDetail(rule.id)}
            >
              详情
            </span>
            <span
              className={isDisabled ? disabledClass : linkClass}
              onClick={() => !isDisabled && handleEdit(rule)}
            >
              编辑
            </span>
            <span
              className={isDisabled ? disabledClass : "text-green-600 hover:text-green-800 cursor-pointer text-sm"}
              onClick={() => !isDisabled && handleEnable(rule)}
            >
              启用
            </span>
            <span
              className={isDisabled ? disabledClass : "text-red-600 hover:text-red-800 cursor-pointer text-sm"}
              onClick={() => !isDisabled && handleDelete(rule)}
            >
              删除
            </span>
          </div>
        );

      case 'active':
        return (
          <div className="flex gap-3 text-sm">
            <span
              className={isDisabled ? disabledClass : linkClass}
              onClick={() => !isDisabled && handleViewDetail(rule.id)}
            >
              详情
            </span>
            <span
              className={isDisabled ? disabledClass : linkClass}
              onClick={() => !isDisabled && handleEdit(rule)}
            >
              编辑
            </span>
            <span
              className={isDisabled ? disabledClass : "text-orange-600 hover:text-orange-800 cursor-pointer text-sm"}
              onClick={() => !isDisabled && handleDisable(rule)}
            >
              停用
            </span>
          </div>
        );

      case 'archived':
        return (
          <div className="flex gap-3 text-sm">
            <span
              className={isDisabled ? disabledClass : linkClass}
              onClick={() => !isDisabled && handleViewDetail(rule.id)}
            >
              详情
            </span>
            <span
              className={isDisabled ? disabledClass : linkClass}
              onClick={() => !isDisabled && handleEdit(rule)}
            >
              编辑
            </span>
            <span
              className={isDisabled ? disabledClass : "text-red-600 hover:text-red-800 cursor-pointer text-sm"}
              onClick={() => !isDisabled && handleDelete(rule)}
            >
              删除
            </span>
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
          onClick={() => navigate('/response-actions/create')}
          className="flex items-center gap-2"
          disabled={operationLoading}
        >
          <Plus className="h-4 w-4" />
          创建新规则
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            {error}
            <Button variant="outline" size="sm">
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
              placeholder="搜索规则名称"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full"
            />
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

      {/* Rules Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-gray-400" />
            <p className="text-gray-500">正在加载规则...</p>
          </div>
        ) : filteredRules.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-gray-400 mb-2">
              <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无规则</h3>
            <p className="text-gray-500 mb-4">
              {filters.search || filters.status !== 'all'
                ? '没有找到符合条件的规则，请尝试调整筛选条件'
                : '请点击右上角"创建新规则"开始使用'
              }
            </p>
            {(!filters.search && filters.status === 'all') && (
              <Button
                onClick={() => navigate('/response-actions/create')}
                className="flex items-center gap-2"
                disabled={operationLoading}
              >
                <Plus className="h-4 w-4" />
                创建新规则
              </Button>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>规则名称</TableHead>
                <TableHead>响应动作</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>触发器摘要</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRules.map((rule) => {
                const statusDisplay = getStatusDisplay(rule.status);
                return (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">
                      {rule.ruleName}
                    </TableCell>
                    <TableCell>
                      {getActionTypeDisplay(rule.action)}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={statusDisplay.color === 'green' ? 'default' : 'secondary'}
                        className={statusDisplay.color === 'green' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {statusDisplay.text}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <div className="truncate">
                        {getTriggerSummary(rule.trigger)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {renderActionLinks(rule)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

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
