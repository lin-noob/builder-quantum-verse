import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, MoreVertical, ArrowUpDown, ArrowUp, ArrowDown, Power, PowerOff } from "lucide-react";
import {
  sampleStrategies,
  AIMarketingStrategy,
  StrategyStatus,
  STATUS_DISPLAY_NAMES,
  STATUS_COLORS,
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
        strategy.actionPurpose.toLowerCase().includes(filters.search.toLowerCase());

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
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    return sortState.direction === 'desc' ? (
      <ArrowDown className="h-4 w-4 text-blue-600" />
    ) : (
      <ArrowUp className="h-4 w-4 text-blue-600" />
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

    toast({
      title: `${actionText}成功`,
      description: `策略"${strategy.strategyName}"已${actionText}`
    });
    setDropdownOpen(null);
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

  // 获取状态颜色类
  const getStatusBadgeClass = (status: StrategyStatus) => {
    const colorMap = {
      'DRAFT': 'bg-gray-100 text-gray-800',
      'ACTIVE': 'bg-green-100 text-green-800', 
      'ARCHIVED': 'bg-orange-100 text-orange-800'
    };
    return colorMap[status];
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
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      {/* 筛选区 */}
      <Card className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          {/* 搜索框 */}
          <div className="flex-1">
            <Input
              placeholder="搜索策略名称或业务用途..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
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
              className="bg-slate-200 text-slate-700"
              onClick={resetFilters}
            >
              重置
            </Button>
            <Button
              className="bg-sky-600 text-white"
              onClick={renderStrategyList}
            >
              查询
            </Button>
          </div>
        </div>
      </Card>

      {/* 主操作区 */}
      <div className="mb-4">
        <Button 
          className="bg-sky-600 text-white flex items-center gap-2"
          onClick={() => navigate('/ai-marketing-strategies/create')}
        >
          <Plus className="h-4 w-4" />
          创建新策略
        </Button>
      </div>

      {/* 数据表格 */}
      <Card className="bg-white rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">策略名称</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">状态</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">触发规则</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">业务用途</th>
              <th
                className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer select-none hover:bg-gray-100"
                onClick={() => handleSort('totalExecutions')}
              >
                <div className="flex items-center gap-2">
                  执行次数
                  {getSortIcon('totalExecutions')}
                </div>
              </th>
              <th
                className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer select-none hover:bg-gray-100"
                onClick={() => handleSort('totalConversions')}
              >
                <div className="flex items-center gap-2">
                  转化数
                  {getSortIcon('totalConversions')}
                </div>
              </th>
              <th
                className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer select-none hover:bg-gray-100"
                onClick={() => handleSort('updatedAt')}
              >
                <div className="flex items-center gap-2">
                  最后更新
                  {getSortIcon('updatedAt')}
                </div>
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {processedData.data.map((strategy) => (
              <tr key={strategy.strategyId} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{strategy.strategyName}</div>
                  <div className="text-xs text-gray-500">ID: {strategy.strategyId}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusBadgeClass(strategy.status)}>
                      {STATUS_DISPLAY_NAMES[strategy.status]}
                    </Badge>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {generateTriggerRuleSummary(strategy.triggerRule)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600 max-w-xs truncate" title={strategy.actionPurpose}>
                    {strategy.actionPurpose}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{formatNumber(strategy.totalExecutions)}</div>
                  <div className="text-xs text-gray-500">
                    互动率 {calculateInteractionRate(strategy.totalExecutions, strategy.totalInteractions)}%
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{formatNumber(strategy.totalConversions)}</div>
                  <div className="text-xs text-gray-500">
                    转化率 {calculateConversionRate(strategy.totalExecutions, strategy.totalConversions)}%
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{formatDate(strategy.updatedAt)}</td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-2">
                    <button
                      className="text-sky-600 hover:underline"
                      onClick={() => navigate(`/ai-marketing-strategies/${strategy.strategyId}`)}
                    >
                      详情
                    </button>
                    <div className="relative">
                      <button
                        className="text-gray-600 hover:text-gray-800 p-1"
                        onClick={() => setDropdownOpen(dropdownOpen === strategy.strategyId ? null : strategy.strategyId)}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {dropdownOpen === strategy.strategyId && (
                        <div className="absolute right-0 top-6 bg-white border rounded-lg shadow-lg py-1 z-50 min-w-[120px]">
                          <button
                            className="block w-full text-left px-3 py-1 text-sm text-sky-600 hover:bg-gray-100"
                            onClick={() => navigate(`/ai-marketing-strategies/edit/${strategy.strategyId}`)}
                          >
                            编辑
                          </button>
                          
                          {/* 状态控制按钮 */}
                          {strategy.status === 'DRAFT' && (
                            <button
                              className="flex items-center gap-2 w-full text-left px-3 py-1 text-sm text-green-600 hover:bg-gray-100"
                              onClick={() => handleStatusToggle(strategy.strategyId, strategy.status)}
                            >
                              <Power className="h-3 w-3" />
                              启用策略
                            </button>
                          )}
                          
                          {strategy.status === 'ACTIVE' && (
                            <button
                              className="flex items-center gap-2 w-full text-left px-3 py-1 text-sm text-orange-600 hover:bg-gray-100"
                              onClick={() => handleStatusToggle(strategy.strategyId, strategy.status)}
                            >
                              <PowerOff className="h-3 w-3" />
                              停用策略
                            </button>
                          )}
                          
                          {strategy.status === 'ARCHIVED' && (
                            <button
                              className="flex items-center gap-2 w-full text-left px-3 py-1 text-sm text-green-600 hover:bg-gray-100"
                              onClick={() => handleStatusToggle(strategy.strategyId, strategy.status)}
                            >
                              <Power className="h-3 w-3" />
                              重新启用
                            </button>
                          )}
                          
                          {/* 删除按钮 - 只有草稿和已归档状态可以删除 */}
                          {(strategy.status === 'DRAFT' || strategy.status === 'ARCHIVED') && (
                            <button
                              className="block w-full text-left px-3 py-1 text-sm text-red-600 hover:bg-gray-100"
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
        
        {/* 分页区域 */}
        <div className="px-6 py-4 border-t bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-700 order-2 sm:order-1">
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
            <span className="text-sm text-gray-600">
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
