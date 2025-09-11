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

// 数据模型
interface RechargeRecord {
  id: string;
  orderId: string;
  userId: string;
  userName: string;
  organization: string;
  orderTime: string;
  amount: number;
  paymentMethod: "微信支付" | "支付宝" | "银行转账" | "企业转账";
  status: "成功" | "失败" | "处理中";
  currency: string;
  description?: string;
}

// 模拟数据
const mockRechargeHistory: RechargeRecord[] = [
  {
    id: "1",
    orderId: "ORD001",
    userId: "USER001",
    userName: "张三",
    organization: "ABC科技有限公司",
    orderTime: "2024-01-15 10:30",
    amount: 999.00,
    paymentMethod: "微信支付",
    status: "成功",
    currency: "CNY",
    description: "企业版月付套餐"
  },
  {
    id: "2",
    orderId: "ORD002",
    userId: "USER002",
    userName: "李四",
    organization: "XYZ有限公司",
    orderTime: "2024-01-14 09:15",
    amount: 299.00,
    paymentMethod: "支付宝",
    status: "成功",
    currency: "CNY",
    description: "专业版月付套餐"
  },
  {
    id: "3",
    orderId: "ORD003",
    userId: "USER003",
    userName: "王五",
    organization: "DEF集团",
    orderTime: "2024-01-13 14:20",
    amount: 99.00,
    paymentMethod: "银行转账",
    status: "成功",
    currency: "CNY",
    description: "基础版月付套餐"
  },
  {
    id: "4",
    orderId: "ORD004",
    userId: "USER001",
    userName: "张三",
    organization: "ABC科技有限公司",
    orderTime: "2024-01-12 11:45",
    amount: 999.00,
    paymentMethod: "企业转账",
    status: "成功",
    currency: "CNY",
    description: "企业版月付套餐"
  },
  {
    id: "5",
    orderId: "ORD005",
    userId: "USER004",
    userName: "赵六",
    organization: "GHI有限公司",
    orderTime: "2024-01-11 08:30",
    amount: 1999.00,
    paymentMethod: "微信支付",
    status: "成功",
    currency: "CNY",
    description: "旗舰版月付套餐"
  },
  {
    id: "6",
    orderId: "ORD006",
    userId: "USER005",
    userName: "孙七",
    organization: "JKL科技有限公司",
    orderTime: "2024-01-10 16:20",
    amount: 299.00,
    paymentMethod: "支付宝",
    status: "处理中",
    currency: "CNY",
    description: "专业版月付套餐"
  },
  {
    id: "7",
    orderId: "ORD007",
    userId: "USER006",
    userName: "周八",
    organization: "MNO有限公司",
    orderTime: "2024-01-09 13:45",
    amount: 999.00,
    paymentMethod: "银行转账",
    status: "失败",
    currency: "CNY",
    description: "企业版月付套餐"
  },
  {
    id: "8",
    orderId: "ORD008",
    userId: "USER002",
    userName: "李四",
    organization: "XYZ有限公司",
    orderTime: "2024-01-08 09:30",
    amount: 299.00,
    paymentMethod: "微信支付",
    status: "成功",
    currency: "CNY",
    description: "专业版月付套餐"
  }
];

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
  const [itemsPerPage] = useState(10); // 每页显示10条记录

  // 计算当前页的记录
  const currentRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredHistory.slice(startIndex, endIndex);
  }, [filteredHistory, currentPage, itemsPerPage]);

  // 计算总页数
  const totalPages = useMemo(() => {
    return Math.ceil(filteredHistory.length / itemsPerPage);
  }, [filteredHistory, itemsPerPage]);

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

  // 重置筛选时也重置到第一页
  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPaymentMethodFilter("all");
    setAmountRange({ min: "", max: "" });
    setCurrentPage(1); // 重置到第一页
  };

  useEffect(() => {
    // 模拟数据加载
    setTimeout(() => {
      setRechargeHistory(mockRechargeHistory);
      setFilteredHistory(mockRechargeHistory);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    // 过滤和排序逻辑
    let result = [...rechargeHistory];
    
    // 搜索过滤
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(record => 
        record.orderId.toLowerCase().includes(term) || 
        record.userName.toLowerCase().includes(term) ||
        record.organization.toLowerCase().includes(term) ||
        (record.description && record.description.toLowerCase().includes(term))
      );
    }
    
    // 状态过滤
    if (statusFilter !== "all") {
      result = result.filter(record => record.status === statusFilter);
    }
    
    // 支付方式过滤
    if (paymentMethodFilter !== "all") {
      result = result.filter(record => record.paymentMethod === paymentMethodFilter);
    }
    
    // 金额范围过滤
    if (amountRange.min !== "") {
      const minAmount = parseFloat(amountRange.min);
      if (!isNaN(minAmount)) {
        result = result.filter(record => record.amount >= minAmount);
      }
    }
    
    if (amountRange.max !== "") {
      const maxAmount = parseFloat(amountRange.max);
      if (!isNaN(maxAmount)) {
        result = result.filter(record => record.amount <= maxAmount);
      }
    }
    
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
    // 重置到第一页
    setCurrentPage(1);
  }, [searchTerm, rechargeHistory, sortConfig, statusFilter, paymentMethodFilter, amountRange]);

  const handleSort = (key: keyof RechargeRecord) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "成功":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">成功</Badge>;
      case "处理中":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">处理中</Badge>;
      case "失败":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">失败</Badge>;
      default:
        return <Badge>{status}</Badge>;
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="搜索订单号、用户名、组织或描述..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
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
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">最大金额</label>
              <Input
                type="number"
                placeholder="最大金额"
                value={amountRange.max}
                onChange={(e) => setAmountRange({...amountRange, max: e.target.value})}
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
                    onClick={() => handleSort('organization')}
                  >
                    <div className="flex items-center">
                      组织
                      {sortConfig?.key === 'organization' && (
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
                    onClick={() => handleSort('amount')}
                  >
                    <div className="flex items-center">
                      金额
                      {sortConfig?.key === 'amount' && (
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
                    <TableCell className="font-medium">{record.orderId}</TableCell>
                    <TableCell>{record.userName}</TableCell>
                    <TableCell>{record.organization}</TableCell>
                    <TableCell>{record.orderTime}</TableCell>
                    <TableCell>¥{record.amount.toFixed(2)}</TableCell>
                    <TableCell>{record.paymentMethod}</TableCell>
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
          {filteredHistory.length > 0 && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-500">
                共 {filteredHistory.length} 条记录，第 {currentPage} 页 / 共 {totalPages} 页
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