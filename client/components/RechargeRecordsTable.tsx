import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, RefreshCw, ChevronUp, ChevronDown } from "lucide-react";
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

interface RechargeRecord {
  id: string;
  ftype: string;
  opttime: string;
  orderId: string;
  orderTime: string;
  paymentMethod: number;
  status: number;
  currency: string;
  totalPrice: number;
  description?: string;
}

interface RechargeRecordsTableProps {
  className?: string;
}

export default function RechargeRecordsTable({
  className,
}: RechargeRecordsTableProps) {
  const [rechargeHistory, setRechargeHistory] = useState<RechargeRecord[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<RechargeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof RechargeRecord;
    direction: "asc" | "desc";
  } | null>(null);

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
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
    pagesize: number = 5,
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

      const response = await request.post(
        "/admin/api/v1/managerLimit/list",
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

  useEffect(() => {
    fetchRechargeRecords(currentPage, itemsPerPage);
  }, []);

  // 当分页变化时重新获取数据（移除搜索词的自动查询）
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
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredHistory(result);
  }, [rechargeHistory, sortConfig]);

  const handleSort = (key: keyof RechargeRecord) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleRefresh = () => {
    fetchRechargeRecords(currentPage, itemsPerPage);
  };

  const handleSearch = () => {
    setCurrentPage(1); // 搜索时重置到第一页
    fetchRechargeRecords(1, itemsPerPage);
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            处理中
          </Badge>
        );
      case 2:
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            成功
          </Badge>
        );
      case 3:
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            失败
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div>加载中...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>充值记录</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="搜索订单号..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <Button variant="default" onClick={handleSearch}>
            查询
          </Button>
          {/* <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button> */}
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("orderId")}
                >
                  <div className="flex items-center">
                    订单号
                    {sortConfig?.key === "orderId" &&
                      (sortConfig.direction === "asc" ? (
                        <ChevronUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-1 h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("orderTime")}
                >
                  <div className="flex items-center">
                    充值时间
                    {sortConfig?.key === "orderTime" &&
                      (sortConfig.direction === "asc" ? (
                        <ChevronUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-1 h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("totalPrice")}
                >
                  <div className="flex items-center">
                    金额
                    {sortConfig?.key === "totalPrice" &&
                      (sortConfig.direction === "asc" ? (
                        <ChevronUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-1 h-4 w-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead>支付方式</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>状态</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentRecords.map((record) => (
                <TableRow key={record.orderId}>
                  <TableCell className="font-medium">
                    {record.id ?? "-"}
                  </TableCell>
                  <TableCell>{record.opttime}</TableCell>
                  <TableCell>
                    {record.totalPrice
                      ? "$" + record.totalPrice.toFixed(2)
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {paymentMethodMap[record.paymentMethod] ?? "-"}
                  </TableCell>
                  <TableCell>{record.ftype ?? "-"}</TableCell>
                  <TableCell>{getStatusBadge(record.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredHistory.length === 0 && (
          <div className="text-center py-8 text-gray-500">暂无充值记录</div>
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
  );
}
