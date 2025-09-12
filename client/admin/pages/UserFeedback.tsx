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
import { request } from "@/lib/request";

// 数据模型
interface UserFeedback {
  id: string;
  username: string;
  email: string;
  company: string;
  phone: string;
  requirementType: string;
  requirements: string;
  position?: string;
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

export default function UserFeedback() {
  const [userFeedback, setUserFeedback] = useState<UserFeedback[]>([]);
  const [filteredFeedback, setFilteredFeedback] = useState<UserFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: keyof UserFeedback; direction: 'asc' | 'desc' } | null>(null);
  const [requirementTypeFilter, setRequirementTypeFilter] = useState<string>("all");
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  
  // 详情弹窗状态
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<UserFeedback | null>(null);

  // 计算当前页的记录 - 使用API返回的数据
  const currentRecords = useMemo(() => {
    return filteredFeedback; // API已经返回了当前页的数据
  }, [filteredFeedback]);

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

  // 获取用户反馈数据
  const fetchUserFeedback = async (
    page: number = 1,
    pagesize: number = 10,
  ) => {
    try {
      setLoading(true);
      const params: any = {
        currentpage: page,
        pagesize: pagesize,
      };

      // 添加用户名搜索
      if (searchTerm.trim()) {
        params.username = searchTerm.trim();
      }

      // 添加需求类型筛选
      if (requirementTypeFilter !== "all") {
        params.requirementType = requirementTypeFilter;
      }

      const response = await request.get("/admin/api/v1/rfq/page", { ...params });
      const res = response.data;

      if (res && res.data) {
        setUserFeedback(res.data);
        setFilteredFeedback(res.data);
        setTotalCount(res.total || 0);
      } else {
        setUserFeedback([]);
        setFilteredFeedback([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error("Failed to fetch user feedback:", error);
      setUserFeedback([]);
      setFilteredFeedback([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  // 重置筛选时也重置到第一页
  const handleResetFilters = () => {
    setSearchTerm("");
    setRequirementTypeFilter("all");
    setCurrentPage(1);
    // 重置后立即查询
    setTimeout(() => {
      fetchUserFeedback(1, itemsPerPage);
    }, 0);
  };

  const handleSearch = () => {
    setCurrentPage(1); // 搜索时重置到第一页
    fetchUserFeedback(1, itemsPerPage);
  };

  // 查看详情
  const handleViewDetails = (feedback: UserFeedback) => {
    setSelectedFeedback(feedback);
    setIsDetailDialogOpen(true);
  };

  useEffect(() => {
    fetchUserFeedback(currentPage, itemsPerPage);
  }, []);

  // 当分页变化时重新获取数据
  useEffect(() => {
    if (loading) return;
    fetchUserFeedback(currentPage, itemsPerPage);
  }, [currentPage]);

  const handleSort = (key: keyof UserFeedback) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="搜索用户名..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            
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
            
            <div className="flex gap-2">
              <Button variant="default" onClick={handleSearch} className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                查询
              </Button>
              <Button variant="outline" onClick={handleResetFilters} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                重置筛选
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('username')}
                  >
                    <div className="flex items-center">
                      用户名
                      {sortConfig?.key === 'username' && (
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
                  <TableHead>邮箱</TableHead>
                  <TableHead>手机</TableHead>
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
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentRecords.map((feedback) => (
                  <TableRow key={feedback.id}>
                    <TableCell className="font-medium">{feedback.username}</TableCell>
                    <TableCell>{feedback.company}</TableCell>
                    <TableCell>{feedback.email}</TableCell>
                    <TableCell>{feedback.phone}</TableCell>
                    <TableCell>{getRequirementTypeBadge(feedback.requirementType)}</TableCell>
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

      {/* 详情弹窗 */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>用户反馈详情</DialogTitle>
            <DialogDescription>
              {selectedFeedback?.username} 提交的反馈信息
            </DialogDescription>
          </DialogHeader>
          
          {selectedFeedback && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">用户名</label>
                  <p className="font-medium">{selectedFeedback.username}</p>
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