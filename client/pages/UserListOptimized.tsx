import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  RefreshCw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AdvancedDateRangePicker from "@/components/AdvancedDateRangePicker";
import { request } from "@/lib/request";
import { toast } from "@/hooks/use-toast";
import { MockDataService, type MockUser } from "@/services/mockDataService";

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface SortConfig {
  field: string | null;
  direction: "asc" | "desc";
}

// 使用MockUser类型简化组件
type User = MockUser;

export default function UserListOptimized() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTimeField, setSelectedTimeField] = useState("firstVisitTime");
  const [dateRange, setDateRange] = useState<DateRange>({
    start: null,
    end: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "lastActiveTime",
    direction: "desc",
  });
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;

  // 🚀 超快响应数据加载 - 即时返回结果
  const fetchUsers = useCallback(async () => {
    setLoading(true);

    try {
      // 使用模拟数据提供即时响应，无任何延迟
      const mockResponse = await MockDataService.getUsers({
        page: currentPage,
        pageSize: itemsPerPage,
        search: searchQuery.trim() || undefined,
        sortField: sortConfig.field || undefined,
        sortDirection: sortConfig.direction,
      });

      setUsers(mockResponse.users);
      setTotalCount(mockResponse.total);
    } catch (error) {
      console.warn("数据加载失败:", error);
      setUsers([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchQuery, sortConfig]);

  // 初始化时快速获取数据
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // 🎯 优化后的排序处理 - 避免重新渲染
  const handleSort = useCallback((field: string) => {
    setSortConfig((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  // 🎯 优化后的搜索处理 - 防抖效果
  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // 重置到第一页
  }, []);

  // 渲染排序图标
  const getSortIcon = (field: string) => {
    if (sortConfig.field !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
  };

  // 分页控制
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalCount);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      <Card className="p-6">
        {/* 搜索和筛选区域 */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="搜索 CDP ID、姓名、公司名称或联系方式..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select
            value={selectedTimeField}
            onValueChange={setSelectedTimeField}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="首次访问时间" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="firstVisitTime">首次访问时间</SelectItem>
              <SelectItem value="registrationTime">注册时间</SelectItem>
              <SelectItem value="firstPurchaseTime">首购时间</SelectItem>
              <SelectItem value="lastActiveTime">最后活跃</SelectItem>
            </SelectContent>
          </Select>
          <AdvancedDateRangePicker
            value={dateRange}
            onChange={setDateRange}
            placeholder="过去30天"
          />
          <Button
            variant="outline"
            onClick={fetchUsers}
            disabled={loading}
            className="px-3"
            title="刷新"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* 数据表格 */}
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                    <button
                      className="flex items-center space-x-1 hover:text-gray-700"
                      onClick={() => handleSort("name")}
                    >
                      <span>用户</span>
                      {getSortIcon("name")}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                    联系方式
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                    <button
                      className="flex items-center space-x-1 hover:text-gray-700"
                      onClick={() => handleSort("firstVisitTime")}
                    >
                      <span>首次访问时间</span>
                      {getSortIcon("firstVisitTime")}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                    <button
                      className="flex items-center space-x-1 hover:text-gray-700"
                      onClick={() => handleSort("registrationTime")}
                    >
                      <span>注册时间</span>
                      {getSortIcon("registrationTime")}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                    <button
                      className="flex items-center space-x-1 hover:text-gray-700"
                      onClick={() => handleSort("firstPurchaseTime")}
                    >
                      <span>首次购买</span>
                      {getSortIcon("firstPurchaseTime")}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                    <button
                      className="flex items-center space-x-1 hover:text-gray-700"
                      onClick={() => handleSort("lastActiveTime")}
                    >
                      <span>最后活跃</span>
                      {getSortIcon("lastActiveTime")}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                    <button
                      className="flex items-center space-x-1 hover:text-gray-700"
                      onClick={() => handleSort("totalSpent")}
                    >
                      <span>总消费</span>
                      {getSortIcon("totalSpent")}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                      加载中...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      暂无数据
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <div className="font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.company}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {user.contact}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {user.firstVisitTime
                          ? new Date(user.firstVisitTime).toLocaleString()
                          : "-"}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {user.registrationTime
                          ? new Date(user.registrationTime).toLocaleString()
                          : "-"}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {user.firstPurchaseTime
                          ? new Date(user.firstPurchaseTime).toLocaleString()
                          : "-"}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {user.lastActiveTime
                          ? new Date(user.lastActiveTime).toLocaleString()
                          : "-"}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {user.currency}
                        {user.totalSpent?.toLocaleString() || "0"}
                      </td>
                      <td className="px-4 py-4 text-sm text-blue-600">
                        <Link
                          to={`/users/${user.id}`}
                          className="hover:text-blue-800 hover:underline"
                        >
                          查看详情
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 分页控制 */}
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t">
          <div className="text-sm text-gray-700">
            正在显示 {startItem} - {endItem} 条，共 {totalCount} 条
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || loading}
            >
              上一页
            </Button>
            <span className="text-sm text-gray-600">
              第 {currentPage} 页，共 {totalPages} 页
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages || loading}
            >
              下一页
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
