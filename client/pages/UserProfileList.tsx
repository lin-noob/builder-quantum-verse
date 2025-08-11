import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Download,
  Filter,
  RefreshCw,
  Calendar,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { userProfileService } from "@/services/userProfileService";
import type {
  UserProfile,
  UserProfileListData,
  UserProfileSearchForm,
  TableColumn,
} from "@/types/userProfile";

export default function UserProfileList() {
  // 状态管理
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<UserProfileListData>({
    list: [],
    pagination: { current: 1, pageSize: 10, total: 0, totalPages: 0 },
  });
  const [searchForm, setSearchForm] = useState<UserProfileSearchForm>({
    keywords: "",
    dateRange: undefined,
    searchtype: "signTime",
    sortField: "createGmt",
    sortOrder: "desc",
  });

  // 表格列配置
  const columns: TableColumn[] = [
    {
      key: "cdpUserId",
      title: "CDP用户ID",
      dataIndex: "cdpUserId",
      width: 120,
      sortable: true,
    },
    {
      key: "fullName",
      title: "用户姓名",
      dataIndex: "fullName",
      width: 120,
      render: (value, record) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{value || "-"}</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleViewDetail(record.id)}
            className="h-6 w-6 p-0"
          >
            <Eye className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
    {
      key: "contactInfo",
      title: "联系方式",
      dataIndex: "contactInfo",
      width: 180,
    },
    {
      key: "companyName",
      title: "公司名称",
      dataIndex: "companyName",
      width: 150,
    },
    {
      key: "totalOrders",
      title: "总消费金额",
      dataIndex: "totalOrders",
      width: 120,
      sortable: true,
      render: (value) => (
        <span className="font-semibold text-green-600">
          ¥{(value || 0).toLocaleString("zh-CN", { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: "orderCount",
      title: "订单数量",
      dataIndex: "orderCount",
      width: 100,
      sortable: true,
      render: (value) => (
        <Badge variant="secondary">{value || 0}单</Badge>
      ),
    },
    {
      key: "maxOrderAmount",
      title: "最大订单金额",
      dataIndex: "maxOrderAmount",
      width: 130,
      sortable: true,
      render: (value) => (
        <span>
          ¥{(value || 0).toLocaleString("zh-CN", { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: "signTime",
      title: "注册时间",
      dataIndex: "signTime",
      width: 140,
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-600">
          {value ? new Date(value).toLocaleDateString("zh-CN") : "-"}
        </span>
      ),
    },
    {
      key: "minBuyTime",
      title: "首次购买",
      dataIndex: "minBuyTime",
      width: 140,
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-600">
          {value ? new Date(value).toLocaleDateString("zh-CN") : "-"}
        </span>
      ),
    },
    {
      key: "maxBuyTime",
      title: "最后购买",
      dataIndex: "maxBuyTime",
      width: 140,
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-600">
          {value ? new Date(value).toLocaleDateString("zh-CN") : "-"}
        </span>
      ),
    },
    {
      key: "location",
      title: "地区",
      dataIndex: "location",
      width: 120,
    },
  ];

  // 加载数据
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: data.pagination.current,
        limit: data.pagination.pageSize,
        name: searchForm.keywords || undefined,
        body: {
          keywords: searchForm.keywords || undefined,
          startDate: searchForm.dateRange?.[0],
          endDate: searchForm.dateRange?.[1],
          searchtype: searchForm.searchtype,
          sort: searchForm.sortField,
          order: searchForm.sortOrder,
        },
      };

      const result = await userProfileService.getUserProfileList(params);
      setData(result);
    } catch (error) {
      toast({
        title: "加载失败",
        description: "获取用户画像列表失败，请重试",
        variant: "destructive",
      });
      console.error("加载用户画像列表失败:", error);
    } finally {
      setLoading(false);
    }
  }, [data.pagination.current, data.pagination.pageSize, searchForm]);

  // 搜索处理
  const handleSearch = () => {
    setData((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, current: 1 },
    }));
    loadData();
  };

  // 重置搜索
  const handleReset = () => {
    setSearchForm({
      keywords: "",
      dateRange: undefined,
      searchtype: "signTime",
      sortField: "createGmt",
      sortOrder: "desc",
    });
    setData((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, current: 1 },
    }));
  };

  // 排序处理
  const handleSort = (field: string) => {
    const newOrder =
      searchForm.sortField === field && searchForm.sortOrder === "asc"
        ? "desc"
        : "asc";
    setSearchForm((prev) => ({
      ...prev,
      sortField: field,
      sortOrder: newOrder,
    }));
  };

  // 分页处理
  const handlePageChange = (page: number) => {
    setData((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, current: page },
    }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setData((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, pageSize, current: 1 },
    }));
  };

  // 导出数据
  const handleExport = async () => {
    try {
      const params = {
        name: searchForm.keywords || undefined,
        body: {
          keywords: searchForm.keywords || undefined,
          startDate: searchForm.dateRange?.[0],
          endDate: searchForm.dateRange?.[1],
          searchtype: searchForm.searchtype,
          sort: searchForm.sortField,
          order: searchForm.sortOrder,
        },
      };

      await userProfileService.exportUserProfiles(params);
      toast({
        title: "导出成功",
        description: "用户画像数据已开始下载",
      });
    } catch (error) {
      toast({
        title: "导出失败",
        description: "导出用户画像数据失败，请重试",
        variant: "destructive",
      });
    }
  };

  // 查看详情
  const handleViewDetail = (id: string) => {
    // 这里可以跳转到详情页面或打开详情弹窗
    console.log("查看用户详情:", id);
    toast({
      title: "功能开发中",
      description: "用户详情功能正在开发中...",
    });
  };

  // 格式化数字
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("zh-CN", {
      style: "currency",
      currency: "CNY",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  // 初始化数据
  useEffect(() => {
    loadData();
  }, [data.pagination.current, data.pagination.pageSize]);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">用户画像</h1>
          <p className="text-gray-600 mt-1">
            管理和分析用户画像数据，洞察用户行为特征
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadData} variant="outline" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            刷新
          </Button>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            导��
          </Button>
        </div>
      </div>

      {/* 搜索筛选 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            搜索筛选
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 关键词搜索 */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                关键词搜索
              </label>
              <Input
                placeholder="用户名、联系方式、公司名称..."
                value={searchForm.keywords}
                onChange={(e) =>
                  setSearchForm((prev) => ({ ...prev, keywords: e.target.value }))
                }
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>

            {/* 日期搜索类型 */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                日期类型
              </label>
              <Select
                value={searchForm.searchtype}
                onValueChange={(value: any) =>
                  setSearchForm((prev) => ({ ...prev, searchtype: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="signTime">注册时间</SelectItem>
                  <SelectItem value="minBuyTime">首次购买时间</SelectItem>
                  <SelectItem value="maxBuyTime">最后购买时间</SelectItem>
                  <SelectItem value="createGmt">创建时间</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 排序字段 */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                排序字段
              </label>
              <Select
                value={searchForm.sortField}
                onValueChange={(value) =>
                  setSearchForm((prev) => ({ ...prev, sortField: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createGmt">创建时间</SelectItem>
                  <SelectItem value="totalOrders">总消费金额</SelectItem>
                  <SelectItem value="orderCount">订单数量</SelectItem>
                  <SelectItem value="signTime">注册时间</SelectItem>
                  <SelectItem value="cdpUserId">CDP用户ID</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 排序方向 */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                排序方向
              </label>
              <Select
                value={searchForm.sortOrder}
                onValueChange={(value: any) =>
                  setSearchForm((prev) => ({ ...prev, sortOrder: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">降序</SelectItem>
                  <SelectItem value="asc">升序</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={handleSearch} className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              搜索
            </Button>
            <Button onClick={handleReset} variant="outline">
              重置
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 数据统计 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {data.pagination.total.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 mt-1">总用户数</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(
                  data.list.reduce((sum, user) => sum + (user.totalOrders || 0), 0),
                )}
              </div>
              <div className="text-sm text-gray-600 mt-1">总消费金额</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {data.list.reduce((sum, user) => sum + (user.orderCount || 0), 0)}
              </div>
              <div className="text-sm text-gray-600 mt-1">总订单数</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(
                  Math.max(...data.list.map((user) => user.maxOrderAmount || 0)),
                )}
              </div>
              <div className="text-sm text-gray-600 mt-1">最大订单金额</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 数据表格 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">用户列表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead
                      key={column.key}
                      className={`${column.width ? `w-[${column.width}px]` : ""} ${
                        column.sortable ? "cursor-pointer hover:bg-gray-50" : ""
                      }`}
                      onClick={() =>
                        column.sortable && handleSort(column.key)
                      }
                    >
                      <div className="flex items-center gap-2">
                        <span>{column.title}</span>
                        {column.sortable && (
                          <ArrowUpDown className="h-3 w-3 text-gray-400" />
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="text-center py-8"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>加载中...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : data.list.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="text-center py-8 text-gray-500"
                    >
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  data.list.map((user) => (
                    <TableRow key={user.id} className="hover:bg-gray-50">
                      {columns.map((column) => (
                        <TableCell key={column.key} className="py-3">
                          {column.render
                            ? column.render(user[column.dataIndex], user)
                            : user[column.dataIndex] || "-"}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* 分页 */}
          {data.list.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                显示 {(data.pagination.current - 1) * data.pagination.pageSize + 1} 到{" "}
                {Math.min(
                  data.pagination.current * data.pagination.pageSize,
                  data.pagination.total,
                )}{" "}
                项，共 {data.pagination.total} 项
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={data.pagination.pageSize.toString()}
                  onValueChange={(value) => handlePageSizeChange(Number(value))}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-gray-600">条/页</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(data.pagination.current - 1)}
                  disabled={data.pagination.current <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  {data.pagination.current} / {data.pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(data.pagination.current + 1)}
                  disabled={data.pagination.current >= data.pagination.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
