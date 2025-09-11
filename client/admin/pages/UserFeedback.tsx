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
  Filter,
  Download,
  Eye
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// 数据模型
interface UserFeedback {
  id: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  position: string;
  requirementType: string;
  requirements: string;
  submitTime: string;
  status: "待处理" | "处理中" | "已处理" | "已联系";
}

// 需求类型映射
const requirementTypeMap: Record<string, string> = {
  "demo": "产品演示",
  "trial": "免费试用",
  "consultation": "专业咨询",
  "custom": "定制需求",
  "cooperation": "商务合作",
  "other": "其他需求"
};

// 模拟数据
const mockUserFeedback: UserFeedback[] = [
  {
    id: "1",
    name: "张三",
    phone: "13800138000",
    email: "zhangsan@example.com",
    company: "ABC科技有限公司",
    position: "市场总监",
    requirementType: "demo",
    requirements: "希望了解AI营销平台的产品演示，特别是用户画像和自动化营销功能。",
    submitTime: "2024-01-15 10:30:25",
    status: "待处理"
  },
  {
    id: "2",
    name: "李四",
    phone: "13900139000",
    email: "lisi@example.com",
    company: "XYZ有限公司",
    position: "产品经理",
    requirementType: "trial",
    requirements: "申请免费试用，希望体验完整的AI营销策略制定功能。",
    submitTime: "2024-01-14 09:15:42",
    status: "处理中"
  },
  {
    id: "3",
    name: "王五",
    phone: "13700137000",
    email: "wangwu@example.com",
    company: "DEF集团",
    position: "CTO",
    requirementType: "custom",
    requirements: "需要定制化的AI模型，以适配我们特定行业的用户行为分析需求。",
    submitTime: "2024-01-13 14:20:18",
    status: "已处理"
  },
  {
    id: "4",
    name: "赵六",
    phone: "13600136000",
    email: "zhaoliu@example.com",
    company: "GHI有限公司",
    position: "运营总监",
    requirementType: "consultation",
    requirements: "需要专业的AI营销咨询服务，帮助我们优化现有的营销策略。",
    submitTime: "2024-01-12 11:45:33",
    status: "已联系"
  },
  {
    id: "5",
    name: "孙七",
    phone: "13500135000",
    email: "sunqi@example.com",
    company: "JKL科技有限公司",
    position: "CEO",
    requirementType: "cooperation",
    requirements: "有意向进行商务合作，希望将AI营销平台集成到我们的SaaS产品中。",
    submitTime: "2024-01-11 08:30:12",
    status: "待处理"
  },
  {
    id: "6",
    name: "周八",
    phone: "13400134000",
    email: "zhouba@example.com",
    company: "MNO有限公司",
    position: "市场经理",
    requirementType: "other",
    requirements: "希望增加多语言支持功能，以便在海外市场推广使用。",
    submitTime: "2024-01-10 16:20:55",
    status: "处理中"
  },
  {
    id: "7",
    name: "吴九",
    phone: "13300133000",
    email: "wujiu@example.com",
    company: "PQR集团",
    position: "数据分析师",
    requirementType: "demo",
    requirements: "需要详细了解数据分析和可视化功能，特别是实时监控模块。",
    submitTime: "2024-01-09 13:45:27",
    status: "已处理"
  },
  {
    id: "8",
    name: "郑十",
    phone: "13200132000",
    email: "zhengshi@example.com",
    company: "STU有限公司",
    position: "技术总监",
    requirementType: "trial",
    requirements: "申请试用企业版功能，评估是否适合大规模部署。",
    submitTime: "2024-01-08 09:30:44",
    status: "已联系"
  }
];

export default function UserFeedback() {
  const [userFeedback, setUserFeedback] = useState<UserFeedback[]>([]);
  const [filteredFeedback, setFilteredFeedback] = useState<UserFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: keyof UserFeedback; direction: 'asc' | 'desc' } | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [requirementTypeFilter, setRequirementTypeFilter] = useState<string>("all");
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // 每页显示10条记录
  
  // 详情弹窗状态
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<UserFeedback | null>(null);

  // 计算当前页的记录
  const currentRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredFeedback.slice(startIndex, endIndex);
  }, [filteredFeedback, currentPage, itemsPerPage]);

  // 计算总页数
  const totalPages = useMemo(() => {
    return Math.ceil(filteredFeedback.length / itemsPerPage);
  }, [filteredFeedback, itemsPerPage]);

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
    setRequirementTypeFilter("all");
    setCurrentPage(1); // 重置到第一页
  };

  // 查看详情
  const handleViewDetails = (feedback: UserFeedback) => {
    setSelectedFeedback(feedback);
    setIsDetailDialogOpen(true);
  };

  // 导出数据
  const handleExport = () => {
    // 这里应该是实际的导出逻辑
    console.log("导出用户反馈数据");
    alert("用户反馈数据已导出");
  };

  useEffect(() => {
    // 模拟数据加载
    setTimeout(() => {
      setUserFeedback(mockUserFeedback);
      setFilteredFeedback(mockUserFeedback);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    // 过滤和排序逻辑
    let result = [...userFeedback];
    
    // 搜索过滤
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(feedback => 
        feedback.name.toLowerCase().includes(term) ||
        feedback.company.toLowerCase().includes(term) ||
        feedback.email.toLowerCase().includes(term) ||
        feedback.phone.includes(term)
      );
    }
    
    // 状态过滤
    if (statusFilter !== "all") {
      result = result.filter(feedback => feedback.status === statusFilter);
    }
    
    // 需求类型过滤
    if (requirementTypeFilter !== "all") {
      result = result.filter(feedback => feedback.requirementType === requirementTypeFilter);
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
    
    setFilteredFeedback(result);
    // 重置到第一页
    setCurrentPage(1);
  }, [searchTerm, userFeedback, sortConfig, statusFilter, requirementTypeFilter]);

  const handleSort = (key: keyof UserFeedback) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "待处理":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">待处理</Badge>;
      case "处理中":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">处理中</Badge>;
      case "已处理":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">已处理</Badge>;
      case "已联系":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">已联系</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getRequirementTypeBadge = (type: string) => {
    const typeColors: Record<string, string> = {
      "demo": "bg-cyan-100 text-cyan-800",
      "trial": "bg-indigo-100 text-indigo-800",
      "consultation": "bg-purple-100 text-purple-800",
      "custom": "bg-pink-100 text-pink-800",
      "cooperation": "bg-orange-100 text-orange-800",
      "other": "bg-gray-100 text-gray-800"
    };
    
    return (
      <Badge className={`${typeColors[type] || "bg-gray-100 text-gray-800"} hover:bg-opacity-80`}>
        {requirementTypeMap[type] || type}
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
          <CardTitle>用户反馈</CardTitle>
          <CardDescription>用户提交的反馈和需求详情</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="搜索姓名、公司、邮箱或手机号..."
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
                <SelectItem value="待处理">待处理</SelectItem>
                <SelectItem value="处理中">处理中</SelectItem>
                <SelectItem value="已处理">已处理</SelectItem>
                <SelectItem value="已联系">已联系</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={requirementTypeFilter} onValueChange={setRequirementTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="需求类型筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="demo">产品演示</SelectItem>
                <SelectItem value="trial">免费试用</SelectItem>
                <SelectItem value="consultation">专业咨询</SelectItem>
                <SelectItem value="custom">定制需求</SelectItem>
                <SelectItem value="cooperation">商务合作</SelectItem>
                <SelectItem value="other">其他需求</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={handleResetFilters} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              重置筛选
            </Button>
          </div>
          
          <div className="flex justify-end mb-4">
            <Button variant="outline" onClick={handleExport} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              导出数据
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      姓名
                      {sortConfig?.key === 'name' && (
                        sortConfig.direction === 'asc' 
                          ? <ChevronUp className="ml-1 h-4 w-4" /> 
                          : <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('company')}
                  >
                    <div className="flex items-center">
                      公司
                      {sortConfig?.key === 'company' && (
                        sortConfig.direction === 'asc' 
                          ? <ChevronUp className="ml-1 h-4 w-4" /> 
                          : <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('requirementType')}
                  >
                    <div className="flex items-center">
                      需求类型
                      {sortConfig?.key === 'requirementType' && (
                        sortConfig.direction === 'asc' 
                          ? <ChevronUp className="ml-1 h-4 w-4" /> 
                          : <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('submitTime')}
                  >
                    <div className="flex items-center">
                      提交时间
                      {sortConfig?.key === 'submitTime' && (
                        sortConfig.direction === 'asc' 
                          ? <ChevronUp className="ml-1 h-4 w-4" /> 
                          : <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
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
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentRecords.map((feedback) => (
                  <TableRow key={feedback.id}>
                    <TableCell className="font-medium">{feedback.name}</TableCell>
                    <TableCell>{feedback.company}</TableCell>
                    <TableCell>{getRequirementTypeBadge(feedback.requirementType)}</TableCell>
                    <TableCell>{feedback.submitTime}</TableCell>
                    <TableCell>{getStatusBadge(feedback.status)}</TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewDetails(feedback)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        查看详情
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredFeedback.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              暂无用户反馈记录
            </div>
          )}

          {/* 分页控件 */}
          {filteredFeedback.length > 0 && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-500">
                共 {filteredFeedback.length} 条记录，第 {currentPage} 页 / 共 {totalPages} 页
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

      {/* 详情弹窗 */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>用户反馈详情</DialogTitle>
            <DialogDescription>
              {selectedFeedback?.name} 提交的反馈信息
            </DialogDescription>
          </DialogHeader>
          
          {selectedFeedback && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">姓名</label>
                  <p className="font-medium">{selectedFeedback.name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">手机号</label>
                  <p className="font-medium">{selectedFeedback.phone}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">邮箱</label>
                  <p className="font-medium">{selectedFeedback.email}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">职位</label>
                  <p className="font-medium">{selectedFeedback.position || "未填写"}</p>
                </div>
                
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">公司名称</label>
                  <p className="font-medium">{selectedFeedback.company}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">需求类型</label>
                <p className="font-medium">{getRequirementTypeBadge(selectedFeedback.requirementType)}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">提交时间</label>
                <p className="font-medium">{selectedFeedback.submitTime}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">状态</label>
                <p className="font-medium">{getStatusBadge(selectedFeedback.status)}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">具体需求</label>
                <p className="font-medium mt-1 p-3 bg-gray-50 rounded-lg">
                  {selectedFeedback.requirements || "未填写具体需求"}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}