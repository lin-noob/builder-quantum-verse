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
import { Plus, Edit, Play, Square, Trash2 } from 'lucide-react';
import {
  MarketingScript,
  mockMarketingScripts,
  getScriptStatusDisplay
} from '@shared/aiMarketingMonitoringData';
import ConfirmationModal from '@/components/ConfirmationModal';
import { useToast } from '@/hooks/use-toast';

interface FiltersState {
  search: string;
  status: string;
}

interface ConfirmationState {
  isOpen: boolean;
  type: 'enable' | 'pause' | 'delete';
  scriptId: string;
  scriptName: string;
}

export default function SemiAuto() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [scripts] = useState<MarketingScript[]>(mockMarketingScripts);
  const [loading] = useState(false);

  const [filters, setFilters] = useState<FiltersState>({
    search: '',
    status: 'all'
  });

  const [confirmationModal, setConfirmationModal] = useState<ConfirmationState>({
    isOpen: false,
    type: 'enable',
    scriptId: '',
    scriptName: ''
  });
  const [operationLoading, setOperationLoading] = useState(false);

  // Filter scripts based on current filter state
  const filteredScripts = useMemo(() => {
    return scripts.filter(script => {
      const matchesSearch = filters.search === '' ||
        script.scriptName.toLowerCase().includes(filters.search.toLowerCase());

      const matchesStatus = filters.status === 'all' ||
        script.status === filters.status;

      return matchesSearch && matchesStatus;
    });
  }, [scripts, filters]);

  // Handle script operations
  const handleEdit = (script: MarketingScript) => {
    navigate(`/ai-marketing/semi-auto/edit/${script.id}`);
  };

  const handleEnable = (script: MarketingScript) => {
    setConfirmationModal({
      isOpen: true,
      type: 'enable',
      scriptId: script.id,
      scriptName: script.scriptName
    });
  };

  const handlePause = (script: MarketingScript) => {
    setConfirmationModal({
      isOpen: true,
      type: 'pause',
      scriptId: script.id,
      scriptName: script.scriptName
    });
  };

  const handleDelete = (script: MarketingScript) => {
    setConfirmationModal({
      isOpen: true,
      type: 'delete',
      scriptId: script.id,
      scriptName: script.scriptName
    });
  };

  // Handle confirmation actions
  const handleConfirmation = async () => {
    const { type, scriptName } = confirmationModal;

    try {
      setOperationLoading(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      switch (type) {
        case 'enable':
          toast({
            title: '启用成功',
            description: `剧本"${scriptName}"已成功启用`
          });
          break;
        case 'pause':
          toast({
            title: '暂停成功',
            description: `剧本"${scriptName}"已成功暂停`
          });
          break;
        case 'delete':
          toast({
            title: '删除成功',
            description: `剧本"${scriptName}"已成功删除`
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
  const renderActionLinks = (script: MarketingScript) => {
    const isDisabled = operationLoading;
    const linkClass = "text-blue-600 hover:text-blue-800 cursor-pointer text-sm";
    const disabledClass = "text-gray-400 cursor-not-allowed text-sm";

    switch (script.status) {
      case 'draft':
        return (
          <div className="flex gap-3 text-sm">
            <span
              className={isDisabled ? disabledClass : linkClass}
              onClick={() => !isDisabled && handleEdit(script)}
            >
              编辑
            </span>
            <span
              className={isDisabled ? disabledClass : "text-green-600 hover:text-green-800 cursor-pointer text-sm"}
              onClick={() => !isDisabled && handleEnable(script)}
            >
              启用
            </span>
            <span
              className={isDisabled ? disabledClass : "text-red-600 hover:text-red-800 cursor-pointer text-sm"}
              onClick={() => !isDisabled && handleDelete(script)}
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
              onClick={() => !isDisabled && handleEdit(script)}
            >
              编辑
            </span>
            <span
              className={isDisabled ? disabledClass : "text-orange-600 hover:text-orange-800 cursor-pointer text-sm"}
              onClick={() => !isDisabled && handlePause(script)}
            >
              暂停
            </span>
          </div>
        );

      case 'paused':
        return (
          <div className="flex gap-3 text-sm">
            <span
              className={isDisabled ? disabledClass : linkClass}
              onClick={() => !isDisabled && handleEdit(script)}
            >
              编辑
            </span>
            <span
              className={isDisabled ? disabledClass : "text-green-600 hover:text-green-800 cursor-pointer text-sm"}
              onClick={() => !isDisabled && handleEnable(script)}
            >
              启用
            </span>
            <span
              className={isDisabled ? disabledClass : "text-red-600 hover:text-red-800 cursor-pointer text-sm"}
              onClick={() => !isDisabled && handleDelete(script)}
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
        <h1 className="text-2xl font-bold text-gray-900">智能营销剧本列表</h1>
        <Button
          onClick={() => navigate('/ai-marketing/semi-auto/create')}
          className="flex items-center gap-2"
          disabled={operationLoading}
        >
          <Plus className="h-4 w-4" />
          创建新剧本
        </Button>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <Input
              placeholder="搜索剧本名称"
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
                <SelectItem value="active">生效中</SelectItem>
                <SelectItem value="paused">已暂停</SelectItem>
                <SelectItem value="draft">草稿</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Scripts Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">正在加载剧本...</p>
          </div>
        ) : filteredScripts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-gray-400 mb-2">
              <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无剧本</h3>
            <p className="text-gray-500 mb-4">
              {filters.search || filters.status !== 'all'
                ? '没有找到符合条件的剧本，请尝试调整筛选条件'
                : '请点击右上角"创建新剧本"开始使用'
              }
            </p>
            {(!filters.search && filters.status === 'all') && (
              <Button
                onClick={() => navigate('/ai-marketing/semi-auto/create')}
                className="flex items-center gap-2"
                disabled={operationLoading}
              >
                <Plus className="h-4 w-4" />
                创建新剧本
              </Button>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>剧本名称</TableHead>
                <TableHead>触发器摘要</TableHead>
                <TableHead>AI动作</TableHead>
                <TableHead>状态</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredScripts.map((script) => {
                const statusDisplay = getScriptStatusDisplay(script.status);
                return (
                  <TableRow key={script.id}>
                    <TableCell className="font-medium">
                      {script.scriptName}
                    </TableCell>
                    <TableCell className="max-w-md">
                      <div className="truncate">
                        {script.triggerSummary}
                      </div>
                    </TableCell>
                    <TableCell>
                      {script.aiAction}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusDisplay.color}>
                        {statusDisplay.text}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {renderActionLinks(script)}
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
        actionName={confirmationModal.scriptName}
      />
    </div>
  );
}
