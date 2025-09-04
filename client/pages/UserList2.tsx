import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RotateCcw,
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
import { getUsers, type User } from "@shared/userData";

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface SortConfig {
  field: string | null;
  direction: "asc" | "desc";
}

export default function UserList2() {
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
  const itemsPerPage = 10;

  const users = getUsers();

  // Sort function
  const handleSort = (field: string) => {
    setSortConfig((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
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

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter((user) => {
      const matchesSearch =
        searchQuery === "" ||
        user.cdpId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.contact.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesDateFilter = true;
      if (dateRange.start && dateRange.end) {
        const timeValue = new Date(
          selectedTimeField === "firstVisitTime"
            ? user.firstVisitTime
            : selectedTimeField === "registrationTime"
              ? user.registrationTime
              : selectedTimeField === "firstPurchaseTime"
                ? user.firstPurchaseTime
                : user.lastActiveTime,
        );

        matchesDateFilter =
          timeValue >= dateRange.start && timeValue <= dateRange.end;
      }

      return matchesSearch && matchesDateFilter;
    });

    // Sort the filtered results
    if (sortConfig.field) {
      filtered.sort((a, b) => {
        let aValue: any, bValue: any;

        switch (sortConfig.field) {
          case "firstVisitTime":
            aValue = new Date(a.firstVisitTime);
            bValue = new Date(b.firstVisitTime);
            break;
          case "registrationTime":
            aValue = new Date(a.registrationTime);
            bValue = new Date(b.registrationTime);
            break;
          case "firstPurchaseTime":
            aValue = new Date(a.firstPurchaseTime);
            bValue = new Date(b.firstPurchaseTime);
            break;
          case "lastActiveTime":
            aValue = new Date(a.lastActiveTime);
            bValue = new Date(b.lastActiveTime);
            break;
          case "totalSpent":
            aValue = a.totalSpent;
            bValue = b.totalSpent;
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [users, searchQuery, selectedTimeField, dateRange, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredAndSortedUsers.slice(startIndex, endIndex);

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
                  <tr key={user.cdpId} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="font-mono text-sm text-gray-900">
                          {user.cdpId}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.name || "N/A"} / {user.company || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {user.contact}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600">
                      {formatDateTime(user.firstVisitTime)}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600">
                      {formatDateTime(user.registrationTime)}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600">
                      {formatDateTime(user.firstPurchaseTime)}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600">
                      {formatDateTime(user.lastActiveTime)}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {formatCurrency(user.totalSpent)}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/users2/${user.cdpId}`}
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
