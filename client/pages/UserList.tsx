import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ArrowUpDown,
  RotateCcw,
  RefreshCw,
  Download,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import AdvancedDateRangePicker from "@/components/AdvancedDateRangePicker";
import {
  getMockUserProfileList,
  mockApiDelay,
  type User,
  type UserProfileListParams,
} from "@shared/userData";

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface SearchForm {
  keywords: string;
  dateRange: DateRange;
  searchtype: 'signTime' | 'minBuyTime' | 'maxBuyTime' | 'createGmt';
  sortField: string;
  sortOrder: 'desc' | 'asc';
}

interface UserListData {
  list: User[];
  total: number;
  currentpage: number;
  pagesize: number;
}

export default function UserList() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<UserListData>({
    list: [],
    total: 0,
    currentpage: 1,
    pagesize: 10,
  });
  const [searchForm, setSearchForm] = useState<SearchForm>({
    keywords: "",
    dateRange: { start: null, end: null },
    searchtype: "signTime",
    sortField: "createGmt",
    sortOrder: "desc",
  });

  // 加载数据
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      await mockApiDelay(300);

      const params: UserProfileListParams = {
        page: data.currentpage,
        limit: data.pagesize,
        name: searchForm.keywords || undefined,
        body: {
          keywords: searchForm.keywords || undefined,
          startDate: searchForm.dateRange.start?.toISOString(),
          endDate: searchForm.dateRange.end?.toISOString(),
          searchtype: searchForm.searchtype,
          sort: searchForm.sortField,
          order: searchForm.sortOrder,
        },
      };

      const result = getMockUserProfileList(params);
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
  }, [data.currentpage, data.pagesize, searchForm]);

  // 搜索处理
  const handleSearch = () => {
    setData(prev => ({ ...prev, currentpage: 1 }));
    loadData();
  };

  // 重置搜索
  const handleReset = () => {
    setSearchForm({
      keywords: "",
      dateRange: { start: null, end: null },
      searchtype: "signTime",
      sortField: "createGmt",
      sortOrder: "desc",
    });
    setData(prev => ({ ...prev, currentpage: 1 }));
  };

  // 排序处理
  const handleSort = (field: string) => {
    const newOrder = searchForm.sortField === field && searchForm.sortOrder === "asc" ? "desc" : "asc";
    setSearchForm(prev => ({
      ...prev,
      sortField: field,
      sortOrder: newOrder,
    }));
  };

  // 分页处理
  const handlePageChange = (page: number) => {
    setData(prev => ({ ...prev, currentpage: page }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setData(prev => ({ ...prev, pagesize: pageSize, currentpage: 1 }));
  };

  // 导出数据
  const handleExport = async () => {
    try {
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
  const handleViewDetail = (user: User) => {
    window.open(`/users/${user.cdpId || user.id}`, '_blank');
  };

  // 格式化货币
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
  }, [data.currentpage, data.pagesize]);

  const totalPages = Math.ceil(data.total / data.pagesize);

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
            导出
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
                  setSearchForm(prev => ({ ...prev, keywords: e.target.value }))
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
                  setSearchForm(prev => ({ ...prev, searchtype: value }))
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
                  setSearchForm(prev => ({ ...prev, sortField: value }))
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
                  setSearchForm(prev => ({ ...prev, sortOrder: value }))
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

          {/* 日期范围选择器 */}
          <div className="mt-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              日期范围
            </label>
            <AdvancedDateRangePicker
              value={searchForm.dateRange}
              onChange={(range) =>
                setSearchForm(prev => ({
                  ...prev,
                  dateRange: range,
                }))
              }
            />
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={handleSearch} className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              搜索
            </Button>
            <Button onClick={handleReset} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              重置
            </Button>
          </div>
        </CardContent>
      </Card>

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
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("cdpUserId")}
                  >
                    <div className="flex items-center gap-2">
                      <span>CDP用户ID</span>
                      <ArrowUpDown className="h-3 w-3 text-gray-400" />
                    </div>
                  </TableHead>
                  <TableHead>用户姓名</TableHead>
                  <TableHead>联系方式</TableHead>
                  <TableHead>公司名称</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("totalOrders")}
                  >
                    <div className="flex items-center gap-2">
                      <span>总消费金额</span>
                      <ArrowUpDown className="h-3 w-3 text-gray-400" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("orderCount")}
                  >
                    <div className="flex items-center gap-2">
                      <span>订单数量</span>
                      <ArrowUpDown className="h-3 w-3 text-gray-400" />
                    </div>
                  </TableHead>
                  <TableHead>地区</TableHead>
                  <TableHead>注册时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>加载中...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : data.list.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center py-8 text-gray-500"
                    >
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  data.list.map((user) => (
                    <TableRow key={user.id} className="hover:bg-gray-50">
                      <TableCell className="font-mono text-sm">
                        {user.cdpUserId}
                      </TableCell>
                      <TableCell className="font-medium">
                        {user.fullName || "-"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {user.contactInfo || "-"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {user.companyName || "-"}
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(user.totalOrders || 0)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {user.orderCount || 0}单
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {user.location || "-"}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {user.signTime 
                          ? new Date(user.signTime).toLocaleDateString("zh-CN")
                          : "-"
                        }
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewDetail(user)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
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
                显示 {(data.currentpage - 1) * data.pagesize + 1} 到{" "}
                {Math.min(data.currentpage * data.pagesize, data.total)}{" "}
                项，共 {data.total} 项
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={data.pagesize.toString()}
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
                  onClick={() => handlePageChange(data.currentpage - 1)}
                  disabled={data.currentpage <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  {data.currentpage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(data.currentpage + 1)}
                  disabled={data.currentpage >= totalPages}
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
