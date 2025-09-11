import { useState } from "react";
import { 
  Search, 
  RefreshCw, 
  RotateCcw, 
  Eye, 
  RotateCcw as RotateCcwIcon, 
  Trash2,
  Plus
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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// 导入任务数据模型
interface ImportTask {
  id: string;
  name: string;
  fileName: string;
  fileSize: number;
  status: 'pending' | 'processing' | 'success' | 'failed';
  createdBy: string;
  createdAt: string;
  finishedAt?: string;
  progress: number;
  recordsProcessed: number;
  recordsFailed: number;
  errorMessage?: string;
}

// 模拟数据
const mockImportTasks: ImportTask[] = [
  {
    id: "IMP-001",
    name: "用户数据导入",
    fileName: "users_2023.xlsx",
    fileSize: 2048000,
    status: "success",
    createdBy: "张三",
    createdAt: "2023-05-15T10:30:00Z",
    finishedAt: "2023-05-15T10:35:00Z",
    progress: 100,
    recordsProcessed: 1250,
    recordsFailed: 0
  },
  {
    id: "IMP-002",
    name: "产品数据导入",
    fileName: "products.csv",
    fileSize: 1024000,
    status: "processing",
    createdBy: "李四",
    createdAt: "2023-05-15T09:15:00Z",
    progress: 75,
    recordsProcessed: 850,
    recordsFailed: 3
  },
  {
    id: "IMP-003",
    name: "订单数据导入",
    fileName: "orders.json",
    fileSize: 5120000,
    status: "failed",
    createdBy: "王五",
    createdAt: "2023-05-14T14:20:00Z",
    finishedAt: "2023-05-14T14:25:00Z",
    progress: 100,
    recordsProcessed: 0,
    recordsFailed: 2500,
    errorMessage: "文件格式不正确"
  },
  {
    id: "IMP-004",
    name: "营销活动数据导入",
    fileName: "campaigns.xlsx",
    fileSize: 3072000,
    status: "pending",
    createdBy: "赵六",
    createdAt: "2023-05-14T08:45:00Z",
    progress: 0,
    recordsProcessed: 0,
    recordsFailed: 0
  }
];

export default function ImportCenter() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 格式化日期时间
  const formatDateTime = (dateStr: string): string => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 获取状态标签样式
  const getStatusBadgeVariant = (status: ImportTask['status']) => {
    switch (status) {
      case 'success':
        return 'default';
      case 'processing':
        return 'secondary';
      case 'failed':
        return 'destructive';
      case 'pending':
      default:
        return 'outline';
    }
  };

  // 获取状态显示文本
  const getStatusText = (status: ImportTask['status']) => {
    switch (status) {
      case 'success':
        return '成功';
      case 'processing':
        return '进行中';
      case 'failed':
        return '失败';
      case 'pending':
        return '等待中';
      default:
        return status;
    }
  };

  // 筛选任务
  const filteredTasks = mockImportTasks.filter(task => {
    const matchesSearch = 
      task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // 分页处理
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTasks = filteredTasks.slice(startIndex, endIndex);

  // 处理搜索
  const handleSearch = () => {
    setCurrentPage(1);
  };

  // 重置筛选
  const handleReset = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  // 刷新数据
  const handleRefresh = () => {
    // 在实际应用中，这里会重新获取数据
    console.log("刷新数据");
  };

  // 创建导入任务
  const handleCreateImportTask = () => {
    console.log("创建导入任务");
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      <div className="max-w-none">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">导入中心</h1>
          <p className="text-gray-500 mt-1">管理所有数据导入任务</p>
        </div>

        {/* 搜索和筛选区域 */}
        <Card className="p-6 mb-8 bg-white shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            {/* 搜索框 */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="搜索任务名称、文件名..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>

            {/* 状态筛选器 */}
            <div className="md:w-1/4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="pending">等待中</SelectItem>
                  <SelectItem value="processing">进行中</SelectItem>
                  <SelectItem value="success">成功</SelectItem>
                  <SelectItem value="failed">失败</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 操作按钮 */}
            <div className="flex items-end gap-2">
              <Button
                onClick={handleSearch}
                className="flex items-center gap-2 h-10"
              >
                <Search className="h-4 w-4" />
                搜索
              </Button>
              <Button
                variant="outline"
                size="default"
                onClick={handleReset}
                className="flex items-center gap-2 h-10"
              >
                <RotateCcw className="h-4 w-4" />
                重置
              </Button>
              <Button
                variant="outline"
                size="default"
                onClick={handleRefresh}
                className="flex items-center gap-2 h-10"
              >
                <RefreshCw className="h-4 w-4" />
                刷新
              </Button>
              <Button
                onClick={handleCreateImportTask}
                className="flex items-center gap-2 h-10"
              >
                <Plus className="h-4 w-4" />
                创建导入任务
              </Button>
            </div>
          </div>
        </Card>

        {/* 导入任务列表 */}
        <Card className="bg-white shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-6 py-4">任务ID</TableHead>
                  <TableHead className="px-6 py-4">任务名称</TableHead>
                  <TableHead className="px-6 py-4">文件名</TableHead>
                  <TableHead className="px-6 py-4">文件大小</TableHead>
                  <TableHead className="px-6 py-4">状态</TableHead>
                  <TableHead className="px-6 py-4">创建时间</TableHead>
                  <TableHead className="px-6 py-4">完成时间</TableHead>
                  <TableHead className="px-6 py-4">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  currentTasks.map((task) => (
                    <TableRow key={task.id} className="hover:bg-gray-50">
                      <TableCell className="px-6 py-4">
                        <div className="font-mono text-sm text-gray-900">
                          {task.id}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {task.name}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {task.fileName}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {formatFileSize(task.fileSize)}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <Badge variant={getStatusBadgeVariant(task.status)}>
                          {getStatusText(task.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {formatDateTime(task.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {task.finishedAt ? formatDateTime(task.finishedAt) : "N/A"}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="h-8 px-2">
                            <Eye className="h-4 w-4" />
                            <span className="ml-1">查看详情</span>
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 px-2" disabled={task.status === 'processing'}>
                            <RotateCcwIcon className="h-4 w-4" />
                            <span className="ml-1">重新导入</span>
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 px-2 text-red-600 hover:text-red-800">
                            <Trash2 className="h-4 w-4" />
                            <span className="ml-1">删除</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* 分页控件 */}
          <div className="px-6 py-4 border-t bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-700 order-2 sm:order-1">
              正在显示 {startIndex + 1} - {Math.min(endIndex, filteredTasks.length)} 条，
              共 {filteredTasks.length} 条
            </div>
            <div className="flex items-center gap-2 order-1 sm:order-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                上一页
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage >= totalPages || totalPages === 0}
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