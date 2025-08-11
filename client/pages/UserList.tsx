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

// API相关类型定义
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
        keywords: searchQuery.trim() || undefined,
        startDate: dateRange.start?.toISOString(),
        endDate: dateRange.end?.toISOString(),
        searchtype: getSearchTypeMapping(selectedTimeField),
        sort: sortConfig.field ? getSortFieldMapping(sortConfig.field) : undefined,
        order: sortConfig.direction,
      };

      const response = await request.businessPost<ApiUser[]>(
        "/quote/api/v1/profile/list",
        requestBody,
        { params: queryParams }
      );

      // 注意：根据API文档，response应该已经被businessPost处理过，直接是data数组
      const convertedUsers = response.map(convertApiUserToUser);
      setUsers(convertedUsers);

      // 如果需要总数，可能需要从响应头或其他地方获取，这里暂时使用返回的数据长度
      setTotalCount(response.length);

    } catch (error) {
      console.error("获取用户数据失败:", error);
      toast({
        title: "加载失败",
        description: "获取用户数据失败，请重试",
        variant: "destructive",
      });
      setUsers([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchQuery, dateRange, selectedTimeField, sortConfig]);

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
        <div className="mb-6"></div>

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
                  setCurrentPage(1);
                }}
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

            {/* Reset Button */}
            <div className="flex items-end">
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
                {currentUsers.map((user) => (
                  <tr key={user.cdpId || user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="font-mono text-sm text-gray-900">
                          {user.cdpId || user.id}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.name || user.fullName || "N/A"} / {user.company || user.companyName || "N/A"}
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
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-700 order-2 sm:order-1">
              正在显示 {startIndex + 1} -{" "}
              {Math.min(endIndex, filteredAndSortedUsers.length)} 条，共{" "}
              {filteredAndSortedUsers.length} 条
            </div>
            <div className="flex items-center gap-2 order-1 sm:order-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                上一页
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
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
