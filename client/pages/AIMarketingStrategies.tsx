import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Search, ArrowUpDown, ArrowUp, ArrowDown, Plus, RotateCcw } from "lucide-react";
import {
  sampleStrategies,
  AIMarketingStrategy,
  StrategyStatus,
  STATUS_DISPLAY_NAMES,
  EXECUTION_MODE_DISPLAY_NAMES,
  generateTriggerRuleSummary,
  calculateConversionRate,
  calculateInteractionRate
} from "@shared/aiMarketingStrategyData";
import { useToast } from "@/hooks/use-toast";

// 筛选状态接口
interface FilterState {
  search: string;
  status: string;
}

// 排序状态接口
interface SortState {
  field: string | null;
  direction: "asc" | "desc";
}

type SortableFields = "totalExecutions" | "totalConversions" | "updatedAt";

export default function AIMarketingStrategies() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // 筛选状态
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all'
  });

  // 排序状态 - 默认按最后更新时间排序
  const [sortState, setSortState] = useState<SortState>({
    field: 'updatedAt',
    direction: 'desc'
  });

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 下拉菜单状态
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  // 过滤、排序和分页后的数据
  const processedData = useMemo(() => {
    // 1. 过滤数据
    let filtered = sampleStrategies.filter(strategy => {
      const matchesSearch = filters.search === '' ||
        strategy.strategyName.toLowerCase().includes(filters.search.toLowerCase()) ||
        (strategy.actionPurpose && strategy.actionPurpose.toLowerCase().includes(filters.search.toLowerCase()));

      const matchesStatus = filters.status === 'all' ||
        strategy.status === filters.status;

      return matchesSearch && matchesStatus;
    });

    // 2. 排序数据
    if (sortState.field) {
      filtered.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortState.field) {
          case 'totalExecutions':
            aValue = a.totalExecutions;
            bValue = b.totalExecutions;
            break;
          case 'totalConversions':
            aValue = a.totalConversions;
            bValue = b.totalConversions;
            break;
          case 'updatedAt':
            aValue = new Date(a.updatedAt);
            bValue = new Date(b.updatedAt);
            break;
          default:
            return 0;
        }

        if (sortState.direction === 'asc') {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        } else {
          return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        }
      });
    }

    // 3. 分页数据
    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filtered.slice(startIndex, startIndex + itemsPerPage);

    return {
      data: paginatedData,
      totalCount,
      totalPages
    };
  }, [filters, sortState, currentPage, itemsPerPage]);

  // 重置筛选
  const resetFilters = () => {
    setFilters({
      search: '',
      status: 'all'
    });
    setCurrentPage(1);
  };

  // 处理排序
  const handleSort = (field: SortableFields) => {
    setSortState(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
    setCurrentPage(1);
  };

  // 获取排序图标
  const getSortIcon = (field: SortableFields) => {
    if (sortState.field !== field) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
    }
    return sortState.direction === 'desc' ? (
      <ArrowDown className="h-4 w-4 text-foreground" />
    ) : (
      <ArrowUp className="h-4 w-4 text-foreground" />
    );
  };

  // 查询函数（刷新数据）
  const renderStrategyList = () => {
    // 筛选逻辑已在 useMemo 中处理，这里可以添加刷新逻辑
    setCurrentPage(1); // 重置到第一页
    toast({
      title: "数据已刷新",
      description: `找到 ${processedData.totalCount} 条策略记录`
    });
  };

  // 处理策略状态切换
  const handleStatusToggle = (strategyId: string, currentStatus: StrategyStatus) => {
    const strategy = sampleStrategies.find(s => s.strategyId === strategyId);
    if (!strategy) return;

    let newStatus: StrategyStatus;
    let actionText: string;

    if (currentStatus === 'DRAFT') {
      newStatus = 'ACTIVE';
      actionText = '启用';
    } else if (currentStatus === 'ACTIVE') {
      newStatus = 'ARCHIVED';
      actionText = '停用';
    } else {
      // ARCHIVED 状态可以重新启用
      newStatus = 'ACTIVE';
      actionText = '重新启用';
    }

    // 实际更新状态
    strategy.status = newStatus;
    strategy.updatedAt = new Date().toISOString();

    toast({
      title: `${actionText}成功`,
      description: `策略"${strategy.strategyName}"已${actionText}`
    });
    setDropdownOpen(null);

    // 强制重新渲染页面
    setCurrentPage(currentPage);
  };

  // 处理其他操作
  const handleStrategyOperation = (strategyId: string, operation: string) => {
    const strategy = sampleStrategies.find(s => s.strategyId === strategyId);
    if (!strategy) return;

    switch (operation) {
      case 'delete':
        toast({
          title: "删除成功",
          description: `策略"${strategy.strategyName}"已删除`
        });
        break;
    }
    setDropdownOpen(null);
  };


  // 格式化数字
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    } else {
      return num.toString();
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-full">

      {/* 搜索和筛选卡片 */}
      <Card className="p-6 bg-background border">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          {/* 搜索框 */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="搜索策略名称或业务用途..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-10"
            />
          </div>

          {/* 状态筛选 */}
          <div className="w-full md:w-48">
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有状态</SelectItem>
                <SelectItem value="DRAFT">草稿</SelectItem>
                <SelectItem value="ACTIVE">生效中</SelectItem>
                <SelectItem value="ARCHIVED">已归档</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={resetFilters}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              重置
            </Button>
            <Button
              onClick={renderStrategyList}
            >
              查询
            </Button>
          </div>
        </div>
      </Card>

      {/* 主操作区 */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          共 {processedData.totalCount} 条记录
        </div>
        <Button 
          onClick={() => navigate('/ai-marketing-strategies/create')}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          创建新策略
        </Button>
      </div>

      {/* 数据表格 */}
      <Card className="bg-background border">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">策略名称</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">模式</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">状态</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">触发规则</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">业务用途</th>
                <th
                  className="px-6 py-4 text-left text-sm font-semibold text-foreground cursor-pointer select-none hover:bg-muted/80"
                  onClick={() => handleSort('totalExecutions')}
                >
                  <div className="flex items-center gap-2">
                    执行次数
                    {getSortIcon('totalExecutions')}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-semibold text-foreground cursor-pointer select-none hover:bg-muted/80"
                  onClick={() => handleSort('totalConversions')}
                >
                  <div className="flex items-center gap-2">
                    转��数
                    {getSortIcon('totalConversions')}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-semibold text-foreground cursor-pointer select-none hover:bg-muted/80"
                  onClick={() => handleSort('updatedAt')}
                >
                  <div className="flex items-center gap-2">
                    最后更新
                    {getSortIcon('updatedAt')}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {processedData.data.map((strategy) => (
                <tr key={strategy.strategyId} className="hover:bg-muted/50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{strategy.strategyName}</div>
                    <div className="text-xs text-muted-foreground">ID: {strategy.strategyId}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-foreground">
                      {EXECUTION_MODE_DISPLAY_NAMES[strategy.executionMode]}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-foreground">
                      {STATUS_DISPLAY_NAMES[strategy.status]}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-foreground">
                      {generateTriggerRuleSummary(strategy.triggerRule)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-muted-foreground max-w-32 truncate" title={strategy.actionPurpose || '-'}>
                      {strategy.executionMode === 'SEMI_AUTO' ? strategy.actionPurpose : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-foreground">{formatNumber(strategy.totalExecutions)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-foreground">{formatNumber(strategy.totalConversions)}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(strategy.updatedAt)}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        className="text-primary hover:underline"
                        onClick={() => navigate(`/ai-marketing-strategies/${strategy.strategyId}`)}
                      >
                        详情
                      </button>
                      <div className="relative">
                        <button
                          className="text-muted-foreground hover:text-foreground px-2 py-1 text-sm"
                          onClick={() => setDropdownOpen(dropdownOpen === strategy.strategyId ? null : strategy.strategyId)}
                        >
                          ⋮
                        </button>
                        {dropdownOpen === strategy.strategyId && (
                          <div className="absolute right-0 top-6 bg-background border rounded-lg shadow-lg py-1 z-50 min-w-[120px]">
                            {/* 只有非生效中的策略才能编辑 */}
                            {strategy.status !== 'ACTIVE' && (
                              <button
                                className="block w-full text-left px-3 py-1 text-sm text-primary hover:bg-muted"
                                onClick={() => navigate(`/ai-marketing-strategies/edit/${strategy.strategyId}`)}
                              >
                                编辑
                              </button>
                            )}
                            
                            {/* 状态控制按钮 */}
                            {strategy.status === 'DRAFT' && (
                              <button
                                className="block w-full text-left px-3 py-1 text-sm text-green-600 hover:bg-muted"
                                onClick={() => handleStatusToggle(strategy.strategyId, strategy.status)}
                              >
                                启用策略
                              </button>
                            )}
                            
                            {strategy.status === 'ACTIVE' && (
                              <button
                                className="block w-full text-left px-3 py-1 text-sm text-orange-600 hover:bg-muted"
                                onClick={() => handleStatusToggle(strategy.strategyId, strategy.status)}
                              >
                                停用策略
                              </button>
                            )}
                            
                            {strategy.status === 'ARCHIVED' && (
                              <button
                                className="block w-full text-left px-3 py-1 text-sm text-green-600 hover:bg-muted"
                                onClick={() => handleStatusToggle(strategy.strategyId, strategy.status)}
                              >
                                重新启用
                              </button>
                            )}
                            
                            {/* 删除按钮 - 只有非生效中���策略才能删除 */}
                            {strategy.status !== 'ACTIVE' && (
                              <button
                                className="block w-full text-left px-3 py-1 text-sm text-destructive hover:bg-muted"
                                onClick={() => handleStrategyOperation(strategy.strategyId, 'delete')}
                              >
                                删除
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* 分页区域 */}
        <div className="px-6 py-4 border-t bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground order-2 sm:order-1">
            正在显示 {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, processedData.totalCount)} 条，共 {processedData.totalCount} 条
            {(filters.search || filters.status !== 'all') && ` (已筛选，共 ${sampleStrategies.length} 条)`}
          </div>
          <div className="flex items-center gap-2 order-1 sm:order-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              上一页
            </Button>
            <span className="text-sm text-muted-foreground">
              第 {currentPage} 页，共 {processedData.totalPages} 页
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(processedData.totalPages, currentPage + 1))}
              disabled={currentPage >= processedData.totalPages}
            >
              下一页
            </Button>
          </div>
        </div>
      </Card>
      
      {/* 点击外部关闭下拉菜单 */}
      {dropdownOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setDropdownOpen(null)}
        />
      )}
    </div>
  );
}
