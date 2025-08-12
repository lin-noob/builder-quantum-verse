import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, MoreVertical, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import {
  actionsData,
  ActionData,
  ActionStatus,
  MonitoringScope,
  STATUS_DISPLAY,
  formatNumber
} from "@shared/actionLibraryData";
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

type SortableFields = "totalExecutions" | "conversions" | "lastUpdated";

export default function ResponseActions() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // 筛选状态
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    monitoringScope: 'all',
    status: 'all'
  });
  
  // 下拉菜单状态
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  // 过滤后的数据
  const filteredActions = useMemo(() => {
    return actionsData.filter(action => {
      const matchesSearch = filters.search === '' || 
        action.name.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesScope = filters.monitoringScope === 'all' || 
        action.monitoringScope === filters.monitoringScope;
      
      const matchesStatus = filters.status === 'all' || 
        action.status === filters.status;
      
      return matchesSearch && matchesScope && matchesStatus;
    });
  }, [filters]);

  // 重置筛选
  const resetFilters = () => {
    setFilters({
      search: '',
      monitoringScope: 'all',
      status: 'all'
    });
  };

  // 查询函数（刷新数据）
  const renderActionList = () => {
    // 筛选逻辑已在 useMemo 中处理，这里可以添加刷新逻辑
    toast({
      title: "数据已刷新",
      description: `找到 ${filteredActions.length} 条动作记录`
    });
  };

  // 处理操作按钮点击
  const handleActionOperation = (actionId: string, operation: string) => {
    const action = actionsData.find(a => a.id === actionId);
    if (!action) return;

    switch (operation) {
      case 'enable':
        toast({
          title: "启用成功",
          description: `动作"${action.name}"已启用`
        });
        break;
      case 'disable':
        toast({
          title: "停用成功", 
          description: `动作"${action.name}"已停用`
        });
        break;
      case 'delete':
        toast({
          title: "删除成功",
          description: `动作"${action.name}"已删除`
        });
        break;
    }
    setDropdownOpen(null);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      {/* 筛选区 */}
      <Card className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          {/* 搜索框 */}
          <div className="flex-1">
            <Input
              placeholder="搜索动作名称..."
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
                <SelectItem value="draft">草稿</SelectItem>
                <SelectItem value="active">生效中</SelectItem>
                <SelectItem value="archived">已归档</SelectItem>
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
              onClick={renderActionList}
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
          onClick={() => navigate('/response-actions/create')}
        >
          <Plus className="h-4 w-4" />
          创建新动作
        </Button>
      </div>

      {/* 数据表格 */}
      <Card className="bg-white rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">动作名称</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">状态</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">响应动作用途</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">总执行次数</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">转化数</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">最后更新</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredActions.map((action) => (
              <tr key={action.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{action.name}</td>
                <td className="px-6 py-4">
                  <Badge 
                    variant={STATUS_DISPLAY[action.status].color === 'green' ? 'default' : 'secondary'}
                    className={STATUS_DISPLAY[action.status].color === 'green' ? 'bg-green-100 text-green-800' : ''}
                  >
                    {STATUS_DISPLAY[action.status].text}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{action.purpose}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{formatNumber(action.totalExecutions)}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{formatNumber(action.conversions)}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{action.lastUpdated}</td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-2">
                    <button 
                      className="text-sky-600 hover:underline"
                      onClick={() => navigate(`/response-actions/${action.id}`)}
                    >
                      详情
                    </button>
                    <button 
                      className="text-sky-600 hover:underline"
                      onClick={() => navigate(`/response-actions/edit/${action.id}`)}
                    >
                      编辑
                    </button>
                    <div className="relative">
                      <button 
                        className="text-gray-600 hover:text-gray-800"
                        onClick={() => setDropdownOpen(dropdownOpen === action.id ? null : action.id)}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      {dropdownOpen === action.id && (
                        <div className="absolute right-0 top-6 bg-white border rounded-lg shadow-lg py-1 z-50 min-w-[100px]">
                          {action.status === 'active' && (
                            <button 
                              className="block w-full text-left px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => handleActionOperation(action.id, 'disable')}
                            >
                              停用
                            </button>
                          )}
                          {action.status === 'draft' && (
                            <>
                              <button 
                                className="block w-full text-left px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => handleActionOperation(action.id, 'enable')}
                              >
                                启用
                              </button>
                              <button 
                                className="block w-full text-left px-3 py-1 text-sm text-red-600 hover:bg-gray-100"
                                onClick={() => handleActionOperation(action.id, 'delete')}
                              >
                                删除
                              </button>
                            </>
                          )}
                          {action.status === 'archived' && (
                            <button 
                              className="block w-full text-left px-3 py-1 text-sm text-red-600 hover:bg-gray-100"
                              onClick={() => handleActionOperation(action.id, 'delete')}
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
        {filteredActions.length > 0 && (
          <div className="px-6 py-3 border-t bg-gray-50 text-sm text-gray-600">
            共 {filteredActions.length} 条记录
            {filters.search || filters.monitoringScope !== 'all' || filters.status !== 'all' 
              ? ` (已筛选，共 ${actionsData.length} 条)` 
              : ''
            }
          </div>
        )}
      </Card>
      
      {/* 点击外部关��下拉菜单 */}
      {dropdownOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setDropdownOpen(null)}
        />
      )}
    </div>
  );
}
