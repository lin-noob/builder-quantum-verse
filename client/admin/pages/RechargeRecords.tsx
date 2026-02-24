import React, { useState, useEffect, useMemo } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Search,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  Filter
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { request } from "@/lib/request";

const paymentMethodMap = {
  1: "微信支付",
  2: "支付宝", 
  3: "银行转账",
  4: "企业转账",
};

const statusMap = {
  1: "处理中",
  2: "成功", 
  3: "失败",
};

// 数据模型 - 匹配新的API结构
interface RechargeRecord {
  id: string;
  ftype: string;
  opttime: string;
  orderId: string;
  orderTime: string;
  totalPrice: number;
  paymentMethod: number;
  status: number;
  currency: string;
  description?: string;
  // Admin页面额外的字段
  userId?: string;
  userName?: string;
  companyName?: string;
}

export default function RechargeRecords() {
  const [rechargeHistory, setRechargeHistory] = useState<RechargeRecord[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<RechargeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: keyof RechargeRecord; direction: 'asc' | 'desc' } | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("all");
  const [amountRange, setAmountRange] = useState<{ min: string; max: string }>({ min: "", max: "" });
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // 计算当前页的记录 - 使用API返回的数据
  const currentRecords = useMemo(() => {
    return filteredHistory; // API已经返回了当前页的数据
  }, [filteredHistory]);

  // 计算总页数
  const totalPages = useMemo(() => {
    return Math.ceil(totalCount / itemsPerPage);
  }, [totalCount, itemsPerPage]);

  // 处理页面切换
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 处理上一页
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // 处理下一页
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // 获取充值记录数据
  const fetchRechargeRecords = async (
    page: number = 1,
    pagesize: number = 10,
  ) => {
    try {
      setLoading(true);
      const requestBody: any = {
        currentpage: page,
        pagesize: pagesize,
      };

      // 添加聚合模糊查询
      if (searchTerm.trim()) {
        requestBody.keyword = searchTerm.trim();
      }

      // 添加状态筛选
      if (statusFilter !== "all") {
        const statusKey = Object.keys(statusMap).find(key => statusMap[key as keyof typeof statusMap] === statusFilter);
        if (statusKey) {
          requestBody.orderStatus = parseInt(statusKey);
        }
      }

      // 添加支付方式筛选
      if (paymentMethodFilter !== "all") {
        const paymentKey = Object.keys(paymentMethodMap).find(key => paymentMethodMap[key as keyof typeof paymentMethodMap] === paymentMethodFilter);
        if (paymentKey) {
          requestBody.paymentMethod = parseInt(paymentKey);
        }
      }

      // 添加金额范围筛选
      if (amountRange.min !== "") {
        const minAmount = parseFloat(amountRange.min);
        if (!isNaN(minAmount)) {
          requestBody.minPrice = minAmount;
        }
      }
      if (amountRange.max !== "") {
        const maxAmount = parseFloat(amountRange.max);
        if (!isNaN(maxAmount)) {
          requestBody.maxPrice = maxAmount;
        }
      }

      const response = await request.post(
        "/admin/api/v1/managerLimit/record",
        requestBody,
      );
      const res = response.data.data;

      if (res && res.records) {
        setRechargeHistory(res.records);
        setFilteredHistory(res.records);
        setTotalCount(res.total || 0);
      } else {
        setRechargeHistory([]);
        setFilteredHistory([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error("Failed to fetch recharge records:", error);
      setRechargeHistory([]);
      setFilteredHistory([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  // 重置筛选时也重置到第一页
  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPaymentMethodFilter("all");
    setAmountRange({ min: "", max: "" });
    setCurrentPage(1);
    // 重置后立即查询
    setTimeout(() => {
      fetchRechargeRecords(1, itemsPerPage);
    }, 0);
  };

  const handleSearch = () => {
    setCurrentPage(1); // 搜索时重置到第一页
    fetchRechargeRecords(1, itemsPerPage);
  };

  useEffect(() => {
    fetchRechargeRecords(currentPage, itemsPerPage);
  }, []);

  // 当分页变化时重新获取数据（移除搜索词等筛选条件的自动查询）
  useEffect(() => {
    if (loading) return;
    fetchRechargeRecords(currentPage, itemsPerPage);
  }, [currentPage]);

  useEffect(() => {
    // 本地排序逻辑（搜索和分页已由API处理）
    let result = [...rechargeHistory];
    
    // 排序
    if (sortConfig !== null) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredHistory(result);
  }, [rechargeHistory, sortConfig]);

  const handleSort = (key: keyof RechargeRecord) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getStatusBadge = (status: string | number) => {
    const statusText = typeof status === 'number' ? statusMap[status] : status;
    switch (statusText) {
      case "成功":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">成功</Badge>;
      case "处理中":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">处理中</Badge>;
      case "失败":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">失败</Badge>;
      default:
        return <Badge>{statusText}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div>加载中...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* 删除页面主标题和副标题 */}

      <Card>
        <CardHeader>
          <CardTitle>充值记录</CardTitle>
          <CardDescription>所有用户的充值记录详情</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="搜索订单号、用户名、组织或描述..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="状态筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="成功">成功</SelectItem>
                <SelectItem value="处理中">处理中</SelectItem>
                <SelectItem value="失败">失败</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
              <SelectTrigger>
                <SelectValue placeholder="支付方式" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部支付方式</SelectItem>
                <SelectItem value="微信支付">微信支付</SelectItem>
                <SelectItem value="支付宝">支付宝</SelectItem>
                <SelectItem value="银行转账">银行转账</SelectItem>
                <SelectItem value="企业转账">企业转账</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="default" onClick={handleSearch} className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              查询
            </Button>
            
            <Button variant="outline" onClick={handleResetFilters} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              重置筛选
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium">最小金额</label>
              <Input
                type="number"
                placeholder="最小金额"
                value={amountRange.min}
                onChange={(e) => setAmountRange({...amountRange, min: e.target.value})}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">最大金额</label>
              <Input
                type="number"
                placeholder="最大金额"
                value={amountRange.max}
                onChange={(e) => setAmountRange({...amountRange, max: e.target.value})}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('orderId')}
                  >
                    <div className="flex items-center">
                      订单号
                      {sortConfig?.key === 'orderId' && (
                        sortConfig.direction === 'asc' 
                          ? <ChevronUp className="ml-1 h-4 w-4" /> 
                          : <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('userName')}
                  >
                    <div className="flex items-center">
                      用户名
                      {sortConfig?.key === 'userName' && (
                        sortConfig.direction === 'asc' 
                          ? <ChevronUp className="ml-1 h-4 w-4" /> 
                          : <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('companyName')}
                  >
                    <div className="flex items-center">
                      组织
                      {sortConfig?.key === 'companyName' && (
                        sortConfig.direction === 'asc' 
                          ? <ChevronUp className="ml-1 h-4 w-4" /> 
                          : <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('orderTime')}
                  >
                    <div className="flex items-center">
                      充值时间
                      {sortConfig?.key === 'orderTime' && (
                        sortConfig.direction === 'asc' 
                          ? <ChevronUp className="ml-1 h-4 w-4" /> 
                          : <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('totalPrice')}
                  >
                    <div className="flex items-center">
                      金额
                      {sortConfig?.key === 'totalPrice' && (
                        sortConfig.direction === 'asc' 
                          ? <ChevronUp className="ml-1 h-4 w-4" /> 
                          : <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>支付方式</TableHead>
                  <TableHead>状态</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.id ?? "-"}</TableCell>
                    <TableCell>{record.userName ?? "-"}</TableCell>
                    <TableCell>{record.companyName ?? "-"}</TableCell>
                    <TableCell>{record.opttime}</TableCell>
                    <TableCell>{record.totalPrice ? "$" + record.totalPrice.toFixed(2) : "-"}</TableCell>
                    <TableCell>{paymentMethodMap[record.paymentMethod] ?? "-"}</TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredHistory.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              暂无充值记录
            </div>
          )}

          {/* 分页控件 */}
          {totalCount > 0 && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-500">
                共 {totalCount} 条记录，第 {currentPage} 页 / 共 {totalPages} 页
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                >
                  上一页
                </Button>
                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  // 只显示当前页和前后各2页，以及第一页和最后一页
                  if (
                    page === 1 || 
                    page === totalPages || 
                    (page >= currentPage - 2 && page <= currentPage + 2)
                  ) {
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    );
                  }
                  // 显示省略号
                  if (page === currentPage - 3 || page === currentPage + 3) {
                    return (
                      <span key={page} className="px-2 py-1 text-gray-500">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  下一页
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}