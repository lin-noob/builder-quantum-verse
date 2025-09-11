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
interface OperationLog {
  id: string;
  operator: string;
  operationType: string;
  operationTime: string;
  ipAddress: string;
  description: string;
  status: "成功" | "失败";
  module: string;
}

// 模拟数据
const mockOperationLogs: OperationLog[] = [
  {
    id: "1",
    operator: "张三",
    operationType: "创建",
    operationTime: "2024-01-15 10:30:25",
    ipAddress: "192.168.1.100",
    description: "创建新的AI营销策略",
    status: "成功",
    module: "AI营销"
  },
  {
    id: "2",
    operator: "李四",
    operationType: "更新",
    operationTime: "2024-01-15 09:15:42",
    ipAddress: "192.168.1.101",
    description: "更新用户画像配置",
    status: "成功",
    module: "用户画像"
  },
  {
    id: "3",
    operator: "王五",
    operationType: "删除",
    operationTime: "2024-01-14 14:20:18",
    ipAddress: "192.168.1.102",
    description: "删除过期的营销活动",
    status: "成功",
    module: "营销活动"
  },
  {
    id: "4",
    operator: "赵六",
    operationType: "查询",
    operationTime: "2024-01-14 11:45:33",
    ipAddress: "192.168.1.103",
    description: "查询用户行为数据",
    status: "成功",
    module: "数据分析"
  },
  {
    id: "5",
    operator: "孙七",
    operationType: "登录",
    operationTime: "2024-01-13 08:30:12",
    ipAddress: "192.168.1.104",
    description: "管理员登录系统",
    status: "成功",
    module: "系统管理"
  },
  {
    id: "6",
    operator: "周八",
    operationType: "导出",
    operationTime: "2024-01-12 16:20:55",
    ipAddress: "192.168.1.105",
    description: "导出用户数据报表",
    status: "失败",
    module: "数据导出"
  },
  {
    id: "7",
    operator: "吴九",
    operationType: "配置",
    operationTime: "2024-01-12 13:45:27",
    ipAddress: "192.168.1.106",
    description: "修改系统配置参数",
    status: "成功",
    module: "系统配置"
  },
  {
    id: "8",
    operator: "郑十",
    operationType: "授权",
    operationTime: "2024-01-11 09:30:44",
    ipAddress: "192.168.1.107",
    description: "为用户分配权限",
    status: "成功",
    module: "权限管理"
  }
];

export default function OperationLogs() {
  const [operationLogs, setOperationLogs] = useState<OperationLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<OperationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: keyof OperationLog; direction: 'asc' | 'desc' } | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [moduleFilter, setModuleFilter] = useState<string>("all");
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // 每页显示10条记录

  // 计算当前页的记录
  const currentRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredLogs.slice(startIndex, endIndex);
  }, [filteredLogs, currentPage, itemsPerPage]);

  // 计算总页数
  const totalPages = useMemo(() => {
    return Math.ceil(filteredLogs.length / itemsPerPage);
  }, [filteredLogs, itemsPerPage]);

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
    setModuleFilter("all");
    setCurrentPage(1); // 重置到第一页
  };

  useEffect(() => {
    // 模拟数据加载
    setTimeout(() => {
      setOperationLogs(mockOperationLogs);
      setFilteredLogs(mockOperationLogs);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    // 过滤和排序逻辑
    let result = [...operationLogs];
    
    // 搜索过滤
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(log => 
        log.operator.toLowerCase().includes(term) ||
        log.description.toLowerCase().includes(term) ||
        log.ipAddress.toLowerCase().includes(term)
      );
    }
    
    // 状态过滤
    if (statusFilter !== "all") {
      result = result.filter(log => log.status === statusFilter);
    }
    
    // 模块过滤
    if (moduleFilter !== "all") {
      result = result.filter(log => log.module === moduleFilter);
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
    
    setFilteredLogs(result);
    // 重置到第一页
    setCurrentPage(1);
  }, [searchTerm, operationLogs, sortConfig, statusFilter, moduleFilter]);

  const handleSort = (key: keyof OperationLog) => {
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
      case "失败":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">失败</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getModuleBadge = (module: string) => {
    const moduleColors: Record<string, string> = {
      "AI营销": "bg-blue-100 text-blue-800",
      "用户画像": "bg-purple-100 text-purple-800",
      "营销活动": "bg-green-100 text-green-800",
      "数据分析": "bg-yellow-100 text-yellow-800",
      "系统管理": "bg-red-100 text-red-800",
      "数据导出": "bg-indigo-100 text-indigo-800",
      "系统配置": "bg-pink-100 text-pink-800",
      "权限管理": "bg-teal-100 text-teal-800"
    };
    
    return (
      <Badge className={`${moduleColors[module] || "bg-gray-100 text-gray-800"} hover:bg-opacity-80`}>
        {module}
      </Badge>
    );
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
      <Card>
        <CardHeader>
          <CardTitle>操作日志</CardTitle>
          <CardDescription>系统操作记录详情</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="搜索操作人、描述或IP地址..."
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
                <SelectItem value="失败">失败</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="模块筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部模块</SelectItem>
                <SelectItem value="AI营销">AI营销</SelectItem>
                <SelectItem value="用户画像">用户画像</SelectItem>
                <SelectItem value="营销活动">营销活动</SelectItem>
                <SelectItem value="数据分析">数据分析</SelectItem>
                <SelectItem value="系统管理">系统管理</SelectItem>
                <SelectItem value="数据导出">数据导出</SelectItem>
                <SelectItem value="系统配置">系统配置</SelectItem>
                <SelectItem value="权限管理">权限管理</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={handleResetFilters} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              重置筛选
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('operator')}
                  >
                    <div className="flex items-center">
                      操作人
                      {sortConfig?.key === 'operator' && (
                        sortConfig.direction === 'asc' 
                          ? <ChevronUp className="ml-1 h-4 w-4" /> 
                          : <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('operationType')}
                  >
                    <div className="flex items-center">
                      操作类型
                      {sortConfig?.key === 'operationType' && (
                        sortConfig.direction === 'asc' 
                          ? <ChevronUp className="ml-1 h-4 w-4" /> 
                          : <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('module')}
                  >
                    <div className="flex items-center">
                      操作模块
                      {sortConfig?.key === 'module' && (
                        sortConfig.direction === 'asc' 
                          ? <ChevronUp className="ml-1 h-4 w-4" /> 
                          : <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('operationTime')}
                  >
                    <div className="flex items-center">
                      操作时间
                      {sortConfig?.key === 'operationTime' && (
                        sortConfig.direction === 'asc' 
                          ? <ChevronUp className="ml-1 h-4 w-4" /> 
                          : <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('ipAddress')}
                  >
                    <div className="flex items-center">
                      IP地址
                      {sortConfig?.key === 'ipAddress' && (
                        sortConfig.direction === 'asc' 
                          ? <ChevronUp className="ml-1 h-4 w-4" /> 
                          : <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>描述</TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      状态
                      {sortConfig?.key === 'status' && (
                        sortConfig.direction === 'asc' 
                          ? <ChevronUp className="ml-1 h-4 w-4" /> 
                          : <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentRecords.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.operator}</TableCell>
                    <TableCell>{log.operationType}</TableCell>
                    <TableCell>{getModuleBadge(log.module)}</TableCell>
                    <TableCell>{log.operationTime}</TableCell>
                    <TableCell>{log.ipAddress}</TableCell>
                    <TableCell className="max-w-xs truncate" title={log.description}>{log.description}</TableCell>
                    <TableCell>{getStatusBadge(log.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredLogs.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              暂无操作日志记录
            </div>
          )}

          {/* 分页控件 */}
          {filteredLogs.length > 0 && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-500">
                共 {filteredLogs.length} 条记录，第 {currentPage} 页 / 共 {totalPages} 页
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