import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search, ArrowUpDown, ArrowUp, ArrowDown, RotateCcw, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AdvancedDateRangePicker from "@/components/AdvancedDateRangePicker";
import { request } from "@/lib/request";
import { toast } from "@/hooks/use-toast";
import { MockDataService } from "@/services/mockDataService";
import { formatStartDate, formatEndDate } from "@/lib/utils";
import { useRoleStore } from "@/stores/roleStore";
import useProjectStore from "@/stores/projectStore";
import { ApiUser } from "@/lib/profile";

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface SortConfig {
  field: string | null;
  direction: "asc" | "desc";
}

// 转换为UI需要的用户格式
export interface User {
  id: string;
  userId: string;
  cdpId: string;
  name: string;
  company: string;
  contact: string;
  firstVisitTime: string;
  registrationTime: string;
  firstPurchaseTime: string;
  lastActiveTime: string;
  totalSpent: number;
  currency: string;
  // 5+2扩展指标
  ltv90Days?: number;
  sessions30d?: number;
  pageviews30d?: number;
  aov30d?: number;
  bounceRate?: number; // 0..1
}

interface OrderSummaryDto {
  currentpage?: number;
  endDate?: string;
  keyword?: string;
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
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTimeField, setSelectedTimeField] = useState("lastActiveTime");
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

  // 5+2 指标筛选条件（范围）
  const [metricFilters, setMetricFilters] = useState({
    ltv90Min: "",
    ltv90Max: "",
    sessionsMin: "",
    sessionsMax: "",
    pageviewsMin: "",
    pageviewsMax: "",
    aovMin: "",
    aovMax: "",
    bounceMin: "", // 百分比 0-100
    bounceMax: "", // 百分比 0-100
  });

  // 权限检查
  const { hasPermission, permissions } = useRoleStore();

  // 项目状态检查
  const { currentProject } = useProjectStore();

  // 调试日志

  // 转换API用户数据为UI格式
  const convertApiUserToUser = (apiUser: ApiUser): User => {
    return {
      id: apiUser.id || "",
      userId: apiUser.userId || "",
      cdpId: apiUser.cdpUserId ? apiUser.cdpUserId.toString() : "",
      name: apiUser.fullName || "",
      company: apiUser.companyName || "",
      contact: apiUser.contactInfo || "",
      firstVisitTime: apiUser.createGmt || "",
      registrationTime: apiUser.signTime || "",
      firstPurchaseTime: apiUser.minBuyTime || "",
      lastActiveTime: apiUser.loginDate || "",
      totalSpent: apiUser.totalOrders || 0,
      currency: apiUser.currencySymbol || "",
      // 5+2扩展指标
      ltv90Days: apiUser.ltv90Days,
      sessions30d: apiUser.sessionTotal,
      pageviews30d: apiUser.pageViewTotal,
      aov30d: apiUser.aov30d,
      bounceRate: apiUser.bounceRate,
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
        return "maxBuyTime";
      default:
        return "signTime";
    }
  };

  // 获取排序字段映射
  const getSortFieldMapping = (field: string): string => {
    switch (field) {
      case "firstVisitTime":
        return "create_gmt";
      case "registrationTime":
        return "sign_time";
      case "firstPurchaseTime":
        return "min_buy_time";
      case "lastActiveTime":
        return "login_date";
      case "totalSpent":
        return "total_orders";
      // 扩展指标的后端排序映射（若后端不支持，将回退默认）
      case "ltv90Days":
        return "ltv_90_days";
      case "sessions30d":
        return "sessions_30d";
      case "pageviews30d":
        return "pageviews_30d";
      case "aov30d":
        return "aov_30d";
      case "bounceRate":
        return "bounce_rate";
      default:
        return "create_gmt";
    }
  };

  // 调用API获取用户数据
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const parseNum = (v: string) => (v.trim() === "" ? undefined : Number(v));
      const parsePct = (v: string) => {
        if (v.trim() === "") return undefined;
        const n = Number(v);
        if (isNaN(n)) return undefined;
        return Math.max(0, Math.min(100, n)) / 100; // ���为 0..1
      };
      if (!currentProject || !currentProject.id) {
        console.log("No current project or empty project id, using mock data for users");
        const mockParams = {
          page: currentPage,
          pageSize: itemsPerPage,
          search: searchQuery.trim() || undefined,
          sortField: sortConfig.field || undefined,
          sortDirection: sortConfig.direction,
          filters: {
            ltv90Min: parseNum(metricFilters.ltv90Min),
            ltv90Max: parseNum(metricFilters.ltv90Max),
            sessionsMin: parseNum(metricFilters.sessionsMin),
            sessionsMax: parseNum(metricFilters.sessionsMax),
            pageviewsMin: parseNum(metricFilters.pageviewsMin),
            pageviewsMax: parseNum(metricFilters.pageviewsMax),
            aovMin: parseNum(metricFilters.aovMin),
            aovMax: parseNum(metricFilters.aovMax),
            bounceMin: parsePct(metricFilters.bounceMin),
            bounceMax: parsePct(metricFilters.bounceMax),
          },
        };

        // 检查 currentProject 是否存在或 id 是否为空
        // if (!currentProject || !currentProject.id) {
        const mockResult = await MockDataService.getUsers(mockParams);
        setUsers(mockResult.users);
        setTotalCount(mockResult.total);
        return;
      }

      // 有项目时调用真实API
      const requestBody: OrderSummaryDto = {
        currentpage: currentPage,
        pagesize: itemsPerPage,
      };

      // 只有在有值的时候才添加这些字段
      if (searchQuery.trim()) {
        requestBody.keyword = searchQuery.trim();
      }

      if (dateRange.start) {
        requestBody.startDate = formatStartDate(dateRange.start);
      }

      if (dateRange.end) {
        requestBody.endDate = formatEndDate(dateRange.end);
      }

      if (selectedTimeField) {
        requestBody.searchtype = getSearchTypeMapping(selectedTimeField);
      }

      if (sortConfig.field) {
        requestBody.sort = getSortFieldMapping(sortConfig.field);
        requestBody.order = sortConfig.direction;
      }

      // 扩展指标筛选通过 paramother 传递（后端可忽略，前端将使用）
      const paramother: Record<string, string> = {};
      const addIfPresent = (key: string, val?: number) => {
        if (val !== undefined && !isNaN(val)) paramother[key] = String(val);
      };
      addIfPresent("ltv90DaysMin", parseNum(metricFilters.ltv90Min));
      addIfPresent("ltv90DaysMax", parseNum(metricFilters.ltv90Max));
      addIfPresent("sessions30dMin", parseNum(metricFilters.sessionsMin));
      addIfPresent("sessions30dMax", parseNum(metricFilters.sessionsMax));
      addIfPresent("pageviews30dMin", parseNum(metricFilters.pageviewsMin));
      addIfPresent("pageviews30dMax", parseNum(metricFilters.pageviewsMax));
      addIfPresent("aov30dMin", parseNum(metricFilters.aovMin));
      addIfPresent("aov30dMax", parseNum(metricFilters.aovMax));
      // 百分比转 0..1
      const bMin = parsePct(metricFilters.bounceMin);
      const bMax = parsePct(metricFilters.bounceMax);
      if (bMin !== undefined) paramother["bounceRateMin"] = String(bMin);
      if (bMax !== undefined) paramother["bounceRateMax"] = String(bMax);
      if (Object.keys(paramother).length > 0) {
        requestBody.paramother = paramother;
      }

      // 使用通用request方法明确指定POST，添加快速超时
      const response = await request.request<{
        code: string;
        records: ApiUser[];
        msg: string;
        total: number;
      }>("/quote/api/v1/profile/list", {
        method: "POST",
        data: requestBody,
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 3000,
      });

      const records = response.data.data.records || [];
      if (records) {
        // 即使响应码不是200也尝试处理数据
        const apiUsers = records;
        if (Array.isArray(apiUsers)) {
          const convertedUsers = apiUsers.map(convertApiUserToUser);
          setUsers(convertedUsers);
          setTotalCount(response.data.data.total || 0);
        } else {
          console.log("数据格式异常，data不是数组:", apiUsers);
          setUsers([]);
          setTotalCount(0);
        }
      } else {
        console.log("响应中没有data字段");
        setUsers([]);
        setTotalCount(0);
      }
    } catch (error: any) {
      return [];
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchQuery, sortConfig, dateRange, selectedTimeField, metricFilters, currentProject]);

  // 初始化和依赖更新时获取数据
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Sort function
  const handleSort = (field: string) => {
    setSortConfig((prev) => ({
      field,
      direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1); // 重置到第一页
  };

  const getSortIcon = (field: string) => {
    if (sortConfig.field !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortConfig.direction === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
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

  const formatCurrency = (amount: number, currency: string) => {
    return currency + amount;
  };

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSearchQuery("");
    setSelectedTimeField("lastActiveTime");
    setDateRange({ start: null, end: null });
    setSortConfig({ field: null, direction: "asc" });
    setCurrentPage(1);
    setMetricFilters({
      ltv90Min: "",
      ltv90Max: "",
      sessionsMin: "",
      sessionsMax: "",
      pageviewsMin: "",
      pageviewsMax: "",
      aovMin: "",
      aovMax: "",
      bounceMin: "",
      bounceMax: "",
    });
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
        {/* Search and Filter Card */}
        <Card className="p-6 mb-8 bg-white shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            {/* Search Box */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t("userList.search.placeholder")}
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
                  <SelectItem value="firstVisitTime">{t("userList.timeFields.firstVisitTime")}</SelectItem>
                  <SelectItem value="registrationTime">{t("userList.timeFields.registrationTime")}</SelectItem>
                  <SelectItem value="firstPurchaseTime">{t("userList.timeFields.firstPurchaseTime")}</SelectItem>
                  <SelectItem value="lastActiveTime">{t("userList.timeFields.lastActiveTime")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Advanced Date Range Picker */}
            <div className="md:w-1/4">
              <AdvancedDateRangePicker value={dateRange} onPresetChange={() => {}} onChange={handleDateRangeChange} />
            </div>
          </div>

          {/* Metric Filters */}
          <div className="flex flex-wrap items-end gap-4 mt-4">
            {/* <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">90天LTV</span>
              <Input
                placeholder={"最小值"}
                value={metricFilters.ltv90Min}
                onChange={(e) => setMetricFilters((f) => ({ ...f, ltv90Min: e.target.value }))}
                className="w-20"
              />
              <Input
                placeholder={"最大值"}
                value={metricFilters.ltv90Max}
                onChange={(e) => setMetricFilters((f) => ({ ...f, ltv90Max: e.target.value }))}
                className="w-20"
              />
            </div> */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">近30天会话</span>
              <Input
                placeholder={"最小值"}
                value={metricFilters.sessionsMin}
                onChange={(e) =>
                  setMetricFilters((f) => ({
                    ...f,
                    sessionsMin: e.target.value,
                  }))
                }
                className="w-20"
              />
              <Input
                placeholder={"最大值"}
                value={metricFilters.sessionsMax}
                onChange={(e) =>
                  setMetricFilters((f) => ({
                    ...f,
                    sessionsMax: e.target.value,
                  }))
                }
                className="w-20"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">近30天页面浏览</span>
              <Input
                placeholder={"最小值"}
                value={metricFilters.pageviewsMin}
                onChange={(e) =>
                  setMetricFilters((f) => ({
                    ...f,
                    pageviewsMin: e.target.value,
                  }))
                }
                className="w-20"
              />
              <Input
                placeholder={"最大值"}
                value={metricFilters.pageviewsMax}
                onChange={(e) =>
                  setMetricFilters((f) => ({
                    ...f,
                    pageviewsMax: e.target.value,
                  }))
                }
                className="w-20"
              />
            </div>
            {/* <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">近30天AOV</span>
              <Input
                placeholder={"最小值"}
                value={metricFilters.aovMin}
                onChange={(e) => setMetricFilters((f) => ({ ...f, aovMin: e.target.value }))}
                className="w-20"
              />
              <Input
                placeholder={"最大值"}
                value={metricFilters.aovMax}
                onChange={(e) => setMetricFilters((f) => ({ ...f, aovMax: e.target.value }))}
                className="w-20"
              />
            </div> */}
            {/* <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">跳出率(%)</span>
              <Input
                placeholder={"最小值"}
                value={metricFilters.bounceMin}
                onChange={(e) => setMetricFilters((f) => ({ ...f, bounceMin: e.target.value }))}
                className="w-20"
              />
              <Input
                placeholder={"最大值"}
                value={metricFilters.bounceMax}
                onChange={(e) => setMetricFilters((f) => ({ ...f, bounceMax: e.target.value }))}
                className="w-20"
              />
            </div> */}
            <div className="mt-4 flex items-center gap-2">
              <Button variant="default" size="sm" onClick={handleSearch}>
                搜索
              </Button>
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-1" />
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
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 min-w-[150px] whitespace-nowrap">
                    {t("userList.table.headers.user")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 min-w-[120px] whitespace-nowrap">
                    {t("userList.table.headers.contact")}
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-900 cursor-pointer select-none hover:bg-gray-100 min-w-[110px]"
                    onClick={() => handleSort("firstVisitTime")}
                  >
                    <div className="flex items-center gap-1 whitespace-nowrap">
                      <span>{t("userList.table.headers.firstVisit")}</span>
                      {getSortIcon("firstVisitTime")}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-900 cursor-pointer select-none hover:bg-gray-100 min-w-[110px]"
                    onClick={() => handleSort("registrationTime")}
                  >
                    <div className="flex items-center gap-1 whitespace-nowrap">
                      <span>{t("userList.table.headers.registrationTime")}</span>
                      {getSortIcon("registrationTime")}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-900 cursor-pointer select-none hover:bg-gray-100 min-w-[110px]"
                    onClick={() => handleSort("firstPurchaseTime")}
                  >
                    <div className="flex items-center gap-1 whitespace-nowrap">
                      <span>{t("userList.table.headers.firstPurchase")}</span>
                      {getSortIcon("firstPurchaseTime")}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-900 cursor-pointer select-none hover:bg-gray-100 min-w-[110px]"
                    onClick={() => handleSort("lastActiveTime")}
                  >
                    <div className="flex items-center gap-1 whitespace-nowrap">
                      <span>{t("userList.table.headers.lastActive")}</span>
                      {getSortIcon("lastActiveTime")}
                    </div>
                  </th>

                  {hasPermission("user.amountspent") && (
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-900 cursor-pointer select-none hover:bg-gray-100 min-w-[100px]"
                      onClick={() => handleSort("totalSpent")}
                    >
                      <div className="flex items-center gap-1 whitespace-nowrap">
                        <span>{t("userList.table.headers.totalSpent")}</span>
                        {getSortIcon("totalSpent")}
                      </div>
                    </th>
                  )}
                  {/* 5+2扩展列 */}
                  {/* <th
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-900 cursor-pointer select-none hover:bg-gray-100 min-w-[90px]"
                    onClick={() => handleSort("ltv90Days")}
                  >
                    <div className="flex items-center gap-1 whitespace-nowrap">
                      <span>90天</span>
                      <span>LTV</span>
                      {getSortIcon("ltv90Days")}
                    </div>
                  </th> */}
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-900 cursor-pointer select-none hover:bg-gray-100 min-w-[90px]"
                    onClick={() => handleSort("sessions30d")}
                  >
                    <div className="flex items-center gap-1 whitespace-nowrap">
                      <span>近30天</span>
                      <span>会话</span>
                      {getSortIcon("sessions30d")}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-900 cursor-pointer select-none hover:bg-gray-100 min-w-[90px]"
                    onClick={() => handleSort("pageviews30d")}
                  >
                    <div className="flex items-center gap-1 whitespace-nowrap">
                      <span>近30天</span>
                      <span>浏览</span>
                      {getSortIcon("pageviews30d")}
                    </div>
                  </th>
                  {/* <th
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-900 cursor-pointer select-none hover:bg-gray-100 min-w-[90px]"
                    onClick={() => handleSort("aov30d")}
                  >
                    <div className="flex items-center gap-1 whitespace-nowrap">
                      <span>近30天</span>
                      <span>AOV</span>
                      {getSortIcon("aov30d")}
                    </div>
                  </th> */}
                  {/* <th
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-900 cursor-pointer select-none hover:bg-gray-100 min-w-[80px]"
                    onClick={() => handleSort("bounceRate")}
                  >
                    <div className="flex items-center gap-1 whitespace-nowrap">
                      <span>跳出率</span>
                      {getSortIcon("bounceRate")}
                    </div>
                  </th> */}
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 min-w-[80px] whitespace-nowrap">
                    {t("userList.table.headers.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={hasPermission("user.amountspent") ? 13 : 12} className="px-6 py-8 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>{t("userList.table.states.loading")}</span>
                      </div>
                    </td>
                  </tr>
                ) : currentUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={hasPermission("user.amountspent") ? 13 : 12}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      {t("userList.table.states.noData")}
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((user) => (
                    <tr key={user.cdpId} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="space-y-1 max-w-[150px]">
                          <div className="font-mono text-xs text-gray-900 truncate">{user.userId || user.id}</div>
                          <div className="text-xs text-gray-500 truncate">{user.name || user.fullName || "N/A"}</div>
                          <div className="text-xs text-gray-400 truncate">
                            {user.company || user.companyName || "N/A"}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-900 max-w-[120px] truncate">
                        {user.contact || user.contactInfo || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                        {formatDateTime(user.firstVisitTime || "")}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                        {formatDateTime(user.registrationTime || "")}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                        {formatDateTime(user.firstPurchaseTime || "")}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                        {formatDateTime(user.lastActiveTime || "")}
                      </td>

                      {hasPermission("user.amountspent") && (
                        <td className="px-4 py-3 text-xs text-gray-900 whitespace-nowrap">
                          {formatCurrency(user.totalSpent || 0, user.currency)}
                        </td>
                      )}
                      {/* 5+2扩展列渲染 */}
                      {/* <td className="px-4 py-3 text-xs text-gray-900 whitespace-nowrap">
                        {user.ltv90Days != null ? formatCurrency(user.ltv90Days, user.currency) : "-"}
                      </td> */}
                      <td className="px-4 py-3 text-xs text-gray-900 text-center">{user.sessions30d ?? "-"}</td>
                      <td className="px-4 py-3 text-xs text-gray-900 text-center">{user.pageviews30d ?? "-"}</td>
                      {/* <td className="px-4 py-3 text-xs text-gray-900 whitespace-nowrap">
                        {user.aov30d != null ? formatCurrency(user.aov30d, user.currency) : "-"}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-900 text-center">
                        {user.bounceRate != null ? `${Math.round((user.bounceRate || 0) * 100)}%` : "-"}
                      </td> */}
                      <td className="px-4 py-3">
                        {hasPermission("user.info") && (
                          <Link
                            to={`/users1/${user.userId}`}
                            className="text-blue-600 hover:text-blue-800 text-xs font-medium whitespace-nowrap"
                          >
                            {t("userList.table.actions.viewDetails")}
                          </Link>
                        )}
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
              {t("userList.pagination.showing")} {startIndex + 1} {t("userList.pagination.to")}{" "}
              {Math.min(endIndex, totalCount)} {t("userList.pagination.of")} {totalCount}{" "}
              {t("userList.pagination.total")}
            </div>
            <div className="flex items-center gap-2 order-1 sm:order-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1 || loading}
              >
                {t("userList.pagination.previous")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage >= totalPages || loading}
              >
                {t("userList.pagination.next")}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
