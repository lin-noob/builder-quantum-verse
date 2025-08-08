import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Calendar, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getUsers, type User } from "@shared/userData";

export default function UserList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [timeRangeFilter, setTimeRangeFilter] = useState("all");
  const [timeFieldFilter, setTimeFieldFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const users = getUsers();

  // Filter users based on search and time criteria
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = searchQuery === "" ||
        user.cdpId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.contact.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesTimeFilter = true;

      if (timeRangeFilter !== "all" && timeFieldFilter !== "all") {
        const now = new Date();
        const timeValue = new Date(
          timeFieldFilter === "firstVisit" ? user.firstVisitTime :
          timeFieldFilter === "registration" ? user.registrationTime :
          timeFieldFilter === "firstPurchase" ? user.firstPurchaseTime :
          user.lastActiveTime
        );

        const diffDays = Math.floor((now.getTime() - timeValue.getTime()) / (1000 * 60 * 60 * 24));

        matchesTimeFilter =
          (timeRangeFilter === "7days" && diffDays <= 7) ||
          (timeRangeFilter === "30days" && diffDays <= 30) ||
          (timeRangeFilter === "90days" && diffDays <= 90) ||
          (timeRangeFilter === "180days" && diffDays <= 180);
      }

      return matchesSearch && matchesTimeFilter;
    });
  }, [users, searchQuery, timeRangeFilter, timeFieldFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      <div className="max-w-none">


        {/* Search and Filter Card */}
        <Card className="p-6 mb-8 bg-white shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
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

            {/* Time Field Filter */}
            <div className="md:w-1/4">
              <Select
                value={timeFieldFilter}
                onValueChange={(value) => {
                  setTimeFieldFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <Clock className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="时间字段" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有时间字段</SelectItem>
                  <SelectItem value="firstVisit">首次访问时间</SelectItem>
                  <SelectItem value="registration">注册时间</SelectItem>
                  <SelectItem value="firstPurchase">首次购买时间</SelectItem>
                  <SelectItem value="lastActive">最后活跃时间</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Time Range Filter */}
            <div className="md:w-1/4">
              <Select
                value={timeRangeFilter}
                onValueChange={(value) => {
                  setTimeRangeFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger>
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="时间范围" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有时间</SelectItem>
                  <SelectItem value="7days">最近7天</SelectItem>
                  <SelectItem value="30days">最近30天</SelectItem>
                  <SelectItem value="90days">最近90天</SelectItem>
                  <SelectItem value="180days">最近180天</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* User Table */}
        <Card className="bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">用户</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">联系方式</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">首次访问</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">注册时间</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">首次购买</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">最后活跃</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">总消费</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentUsers.map((user) => (
                  <tr key={user.cdpId} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="font-mono text-sm text-gray-900">{user.cdpId}</div>
                        <div className="text-sm text-gray-500">
                          {user.name || 'N/A'} / {user.company || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {user.contact}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600">
                      {user.firstVisitTime}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600">
                      {user.registrationTime}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600">
                      {user.firstPurchaseTime}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600">
                      {user.lastActiveTime}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {formatCurrency(user.totalSpent)}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/users/${user.cdpId}`}
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
              正在显示 {startIndex + 1} - {Math.min(endIndex, filteredUsers.length)} 条，共 {filteredUsers.length} 条
            </div>
            <div className="flex items-center gap-2 order-1 sm:order-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                上一页
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
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
