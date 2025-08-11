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

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface SortConfig {
  field: string | null;
  direction: "asc" | "desc";
}

// API相关���型定义
interface ApiUser {
  id: string;
  cdpUserId: number;
  fullName: string;
  contactInfo: string;
  companyName: string;
  signTime: string;
  createGmt: string;
  minBuyTime: string;
  maxBuyTime: string;
  maxOrderAmount: number;
  totalOrders: number;
  orderCount: number;
  loginDate: string;
  location: string;
  shopid: string;
}

// 转换为UI需要的用户格式
interface User {
  cdpId: string;
  name: string;
  company: string;
  contact: string;
  firstVisitTime: string;
  registrationTime: string;
  firstPurchaseTime: string;
  lastActiveTime: string;
  totalSpent: number;
}

interface OrderSummaryDto {
  currentpage?: number;
  endDate?: string;
  keywords?: string;
  order?: string;
  pagesize?: number;
  paramother?: Record<string, string>;
  searchtype?: string;
  shopid?: string;
  sort?: string;
  startDate?: string;
}

interface ApiResponse {
  code: string;
  data: ApiUser[];
  msg: string;
  total: number;
}

export default function UserList() {
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

  // 转换API用户数据为UI格式
  const convertApiUserToUser = (apiUser: ApiUser): User => {
    return {
      cdpId: apiUser.cdpUserId.toString(),
      name: apiUser.fullName || "",
      company: apiUser.companyName || "",
      contact: apiUser.contactInfo || "",
      firstVisitTime: apiUser.createGmt || "",
      registrationTime: apiUser.signTime || "",
      firstPurchaseTime: apiUser.minBuyTime || "",
      lastActiveTime: apiUser.loginDate || "",
      totalSpent: apiUser.totalOrders || 0,
    };
  };

  // 获取搜索类型映射
  const getSearchTypeMapping = (timeField: string): string => {
    switch (timeField) {
      case "firstVisitTime":
        return "createGmt";
      case "registrationTime":
        return "signTime";
      case "firstPurchaseTime":
        return "minBuyTime";
      case "lastActiveTime":
        return "createGmt";
      default:
        return "signTime";
    }
  };

  // 获取排序字段映射
  const getSortFieldMapping = (field: string): string => {
    switch (field) {
      case "firstVisitTime":
        return "createGmt";
      case "registrationTime":
        return "signTime";
      case "firstPurchaseTime":
        return "minBuyTime";
      case "lastActiveTime":
        return "loginDate";
      case "totalSpent":
        return "totalOrders";
      default:
        return "createGmt";
    }
  };

  // 调用API获取用户数据
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams: Record<string, string | number> = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (searchQuery.trim()) {
        queryParams.name = searchQuery.trim();
      }

      const requestBody: OrderSummaryDto = {
        currentpage: currentPage,
        pagesize: itemsPerPage,
      };

      // 只有在有值的时候才添加这些字段
      if (searchQuery.trim()) {
        requestBody.keywords = searchQuery.trim();
      }

      if (dateRange.start) {
        requestBody.startDate = dateRange.start.toISOString();
      }

      if (dateRange.end) {
        requestBody.endDate = dateRange.end.toISOString();
      }

      if (selectedTimeField) {
        requestBody.searchtype = getSearchTypeMapping(selectedTimeField);
      }

      if (sortConfig.field) {
        requestBody.sort = getSortFieldMapping(sortConfig.field);
        requestBody.order = sortConfig.direction;
      }

      console.log("发起API请求:", {
        url: "/api/quote/api/v1/profile/list",
        queryParams,
        requestBody,
      });

      // 使用原始post方法获取完整响应，包含total字段
      const response = await request.post<{
        code: string;
        data: ApiUser[];
        msg: string;
        total: number;
      }>("/api/quote/api/v1/profile/list", requestBody, {
        params: queryParams,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // 检查业务响应码
      if (response.data.code !== "200" && response.data.code !== "0") {
        throw new Error(response.data.msg || "请求失败");
      }

      const apiUsers = response.data.data || [];
      const convertedUsers = apiUsers.map(convertApiUserToUser);
      setUsers(convertedUsers);
      setTotalCount(response.data.total || 0);
    } catch (error) {
      console.error("获取用户数据失败:", error);
      console.error("请求参数:", { queryParams, requestBody });

      let errorMessage = "获取用户数据失败，请重试";
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error("错误详情:", error.message);
      }

      toast({
        title: "加载失败",
        description: errorMessage,
        variant: "destructive",
      });
      setUsers([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    itemsPerPage,
    searchQuery,
    dateRange,
    selectedTimeField,
    sortConfig,
  ]);

  // 初始化和依赖更新时获取数据
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Sort function
  const handleSort = (field: string) => {
    setSortConfig((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1); // 重置到第一页
  };

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

  // 搜索处理
  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers();
  };

  // 页面变化处理
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Pagination - 由于数据来自API，直接使用users数组
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalCount);
  const currentUsers = users; // API已经返回了当前页的数据

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("zh-CN", {
      style: "currency",
      currency: "CNY",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSearchQuery("");
    setSelectedTimeField("firstVisitTime");
    setDateRange({ start: null, end: null });
    setSortConfig({ field: null, direction: "asc" });
    setCurrentPage(1);
  };

  // 手动刷新数据
  const handleRefresh = () => {
    fetchUsers();
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      <div className="max-w-none">
        {/* Page Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">用户画像</h1>
            <p className="text-gray-600 mt-1">管理和分析用户画像数据</p>
          </div>
          <Button onClick={handleRefresh} variant="outline" disabled={loading}>
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            刷新
          </Button>
        </div>

        {/* Search and Filter Card */}
        <Card className="p-6 mb-8 bg-white shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            {/* Search Box */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="搜索 CDP ID、姓名、公司名称或联系方式..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>

            {/* Time Field Selector */}
            <div className="md:w-1/4">
              <Select
                value={selectedTimeField}
                onValueChange={(value) => {
                  setSelectedTimeField(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="firstVisitTime">首次访问时间</SelectItem>
                  <SelectItem value="registrationTime">注册时间</SelectItem>
                  <SelectItem value="firstPurchaseTime">
                    首次购买时间
                  </SelectItem>
                  <SelectItem value="lastActiveTime">最后活跃时间</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Advanced Date Range Picker */}
            <div className="md:w-1/4">
              <AdvancedDateRangePicker
                value={dateRange}
                onChange={handleDateRangeChange}
                onPresetChange={() => {}}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-end gap-2">
              <Button
                onClick={handleSearch}
                className="flex items-center gap-2 h-10"
                disabled={loading}
              >
                <Search className="h-4 w-4" />
                搜索
              </Button>
              <Button
                variant="outline"
                size="default"
                onClick={handleReset}
                className="flex items-center gap-2 h-10"
              >
                <RotateCcw className="h-4 w-4" />
                重置
              </Button>
            </div>
          </div>
        </Card>

        {/* User Table */}
        <Card className="bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    用户
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    联系方式
                  </th>
                  <th
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer select-none hover:bg-gray-100"
                    onClick={() => handleSort("firstVisitTime")}
                  >
                    <div className="flex items-center gap-2">
                      首次访问
                      {getSortIcon("firstVisitTime")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer select-none hover:bg-gray-100"
                    onClick={() => handleSort("registrationTime")}
                  >
                    <div className="flex items-center gap-2">
                      注册时间
                      {getSortIcon("registrationTime")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer select-none hover:bg-gray-100"
                    onClick={() => handleSort("firstPurchaseTime")}
                  >
                    <div className="flex items-center gap-2">
                      首次购买
                      {getSortIcon("firstPurchaseTime")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer select-none hover:bg-gray-100"
                    onClick={() => handleSort("lastActiveTime")}
                  >
                    <div className="flex items-center gap-2">
                      最后活跃
                      {getSortIcon("lastActiveTime")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-900 cursor-pointer select-none hover:bg-gray-100"
                    onClick={() => handleSort("totalSpent")}
                  >
                    <div className="flex items-center gap-2">
                      总消费
                      {getSortIcon("totalSpent")}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>加载中...</span>
                      </div>
                    </td>
                  </tr>
                ) : currentUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      暂无数据
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((user) => (
                    <tr key={user.cdpId} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="font-mono text-sm text-gray-900">
                            {user.cdpId || user.id}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.name || user.fullName || "N/A"} /{" "}
                            {user.company || user.companyName || "N/A"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {user.contact || user.contactInfo || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600">
                        {formatDateTime(user.firstVisitTime || "")}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600">
                        {formatDateTime(user.registrationTime || "")}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600">
                        {formatDateTime(user.firstPurchaseTime || "")}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600">
                        {formatDateTime(user.lastActiveTime || "")}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {formatCurrency(user.totalSpent || 0)}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to={`/users/${user.cdpId || user.id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
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

          {/* Pagination */}
          <div className="px-6 py-4 border-t bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-700 order-2 sm:order-1">
              正在显示 {startIndex + 1} - {Math.min(endIndex, totalCount)}{" "}
              条，共 {totalCount} 条
            </div>
            <div className="flex items-center gap-2 order-1 sm:order-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1 || loading}
              >
                上一页
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handlePageChange(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage >= totalPages || loading}
              >
                下一页
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
