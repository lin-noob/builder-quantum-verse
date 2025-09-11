import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  BookOpen,
  FileText,
  HelpCircle,
  Filter,
  ChevronRight,
  Clock,
  Eye,
  ThumbsUp,
  MessageCircle,
  Badge as BadgeIcon // 添加BadgeIcon导入
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "react-router-dom";

// 数据模型
interface HelpDocument {
  id: string;
  title: string;
  category: string;
  description: string;
  lastUpdated: string;
  views: number;
  likes: number;
  isPopular: boolean;
  // 新增SEO字段
  url?: string; // 自定义URL
  seoTitle?: string; // SEO标题
  seoDescription?: string; // SEO描述
  seoKeywords?: string; // SEO关键字
}

// 模拟数据
const mockDocuments: HelpDocument[] = [
  {
    id: "1",
    title: "快速入门指南",
    category: "用户指南",
    description: "了解如何快速开始使用AI营销平台，包括账户注册、项目创建和基础功能使用。",
    lastUpdated: "2024-01-15",
    views: 1250,
    likes: 98,
    isPopular: true
  },
  {
    id: "2",
    title: "用户画像功能详解",
    category: "功能说明",
    description: "深入介绍用户画像功能的使用方法，包括数据导入、标签管理和人群分群。",
    lastUpdated: "2024-01-12",
    views: 890,
    likes: 76,
    isPopular: true
  },
  {
    id: "3",
    title: "AI营销策略配置",
    category: "功能说明",
    description: "详细说明如何配置和优化AI营销策略，提高营销效果和转化率。",
    lastUpdated: "2024-01-10",
    views: 756,
    likes: 65,
    isPopular: false
  },
  {
    id: "4",
    title: "API接口文档",
    category: "开发者指南",
    description: "完整的API接口文档，包括认证方式、请求格式、响应格式和错误码说明。",
    lastUpdated: "2024-01-08",
    views: 1120,
    likes: 89,
    isPopular: true
  },
  {
    id: "5",
    title: "常见问题解答",
    category: "FAQ",
    description: "汇总用户在使用过程中遇到的常见问题及其解决方案。",
    lastUpdated: "2024-01-05",
    views: 2100,
    likes: 156,
    isPopular: true
  },
  {
    id: "6",
    title: "数据安全与隐私保护",
    category: "政策说明",
    description: "详细介绍平台的数据安全措施和用户隐私保护政策。",
    lastUpdated: "2023-12-28",
    views: 650,
    likes: 42,
    isPopular: false
  }
];

// 文档分类
const categories = [
  { id: "all", name: "全部文档" },
  { id: "user-guide", name: "用户指南" },
  { id: "feature", name: "功能说明" },
  { id: "developer", name: "开发者指南" },
  { id: "faq", name: "常见问题" },
  { id: "policy", name: "政策说明" }
];

export default function HelpCenter() {
  const [documents, setDocuments] = useState<HelpDocument[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<HelpDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState<{ key: keyof HelpDocument; direction: 'asc' | 'desc' } | null>(null);
  // 添加分页相关状态
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // 每页显示10条记录
  // 添加SEO状态筛选状态
  const [seoFilter, setSeoFilter] = useState("all"); // "all", "completed", "pending"

  useEffect(() => {
    // 模拟数据加载
    setTimeout(() => {
      setDocuments(mockDocuments);
      setFilteredDocuments(mockDocuments);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    // 过滤和排序逻辑
    let result = [...documents];
    
    // 搜索过滤
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(doc => 
        doc.title.toLowerCase().includes(term) ||
        doc.description.toLowerCase().includes(term) ||
        doc.category.toLowerCase().includes(term)
      );
    }
    
    // 分类过滤
    if (categoryFilter !== "all") {
      result = result.filter(doc => {
        const categoryMap: Record<string, string> = {
          "user-guide": "用户指南",
          "feature": "功能说明",
          "developer": "开发者指南",
          "faq": "常见问题",
          "policy": "政策说明"
        };
        return doc.category === categoryMap[categoryFilter];
      });
    }
    
    // SEO状态过滤
    if (seoFilter !== "all") {
      if (seoFilter === "completed") {
        result = result.filter(doc => doc.seoTitle && doc.seoDescription);
      } else if (seoFilter === "pending") {
        result = result.filter(doc => !doc.seoTitle || !doc.seoDescription);
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
    
    setFilteredDocuments(result);
    setCurrentPage(1); // 重置到第一页
  }, [searchTerm, documents, sortConfig, categoryFilter, seoFilter]);

  const handleSort = (key: keyof HelpDocument) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getCategoryBadge = (category: string) => {
    const categoryColors: Record<string, string> = {
      "用户指南": "bg-blue-100 text-blue-800",
      "功能说明": "bg-purple-100 text-purple-800",
      "开发者指南": "bg-green-100 text-green-800",
      "常见问题": "bg-yellow-100 text-yellow-800",
      "政策说明": "bg-red-100 text-red-800"
    };
    
    return (
      <Badge className={`${categoryColors[category] || "bg-gray-100 text-gray-800"} hover:bg-opacity-80`}>
        {category}
      </Badge>
    );
  };

  // 添加分页相关函数
  // 计算分页数据
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDocuments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);

  // 分页处理函数
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // 获取要显示的页码
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5; // 最多显示5个页码
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = startPage + maxVisiblePages - 1;
    
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return pageNumbers;
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
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">帮助中心</h1>
        <p className="text-gray-600 mt-2">在这里您可以找到使用AI营销平台的所有帮助文档</p>
      </div>

      {/* 搜索和筛选区域 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            文档搜索
          </CardTitle>
          <CardDescription>搜索您需要的帮助文档</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="搜索文档标题、描述或分类..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="文档分类" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* 添加SEO状态筛选 */}
            <Select value={seoFilter} onValueChange={setSeoFilter}>
              <SelectTrigger>
                <SelectValue placeholder="SEO状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="completed">已设置</SelectItem>
                <SelectItem value="pending">未设置</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 热门文档 */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">热门文档</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.filter(doc => doc.isPopular).map((doc) => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-start justify-between">
                  <span className="text-lg">{doc.title}</span>
                  <BookOpen className="h-5 w-5 text-blue-500" />
                </CardTitle>
                <CardDescription>{doc.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {getCategoryBadge(doc.category)}
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {doc.views}
                  </Badge>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm text-gray-500">更新于 {doc.lastUpdated}</span>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/marketing/help/documents/${doc.id}`}>
                      查看详情
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 所有文档列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            所有文档
          </CardTitle>
          <CardDescription>按分类浏览所有帮助文档</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>文档标题</TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('category')}
                  >
                    <div className="flex items-center">
                      分类
                      {sortConfig?.key === 'category' && (
                        sortConfig.direction === 'asc' 
                          ? <ChevronRight className="ml-1 h-4 w-4 rotate-90" /> 
                          : <ChevronRight className="ml-1 h-4 w-4 -rotate-90" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>描述</TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('lastUpdated')}
                  >
                    <div className="flex items-center">
                      更新时间
                      {sortConfig?.key === 'lastUpdated' && (
                        sortConfig.direction === 'asc' 
                          ? <ChevronRight className="ml-1 h-4 w-4 rotate-90" /> 
                          : <ChevronRight className="ml-1 h-4 w-4 -rotate-90" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('views')}
                  >
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      浏览量
                      {sortConfig?.key === 'views' && (
                        sortConfig.direction === 'asc' 
                          ? <ChevronRight className="ml-1 h-4 w-4 rotate-90" /> 
                          : <ChevronRight className="ml-1 h-4 w-4 -rotate-90" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>SEO状态</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.title}</TableCell>
                    <TableCell>{getCategoryBadge(doc.category)}</TableCell>
                    <TableCell className="max-w-xs truncate" title={doc.description}>{doc.description}</TableCell>
                    <TableCell>{doc.lastUpdated}</TableCell>
                    <TableCell>{doc.views}</TableCell>
                    <TableCell>
                      {/* SEO状态指示器 */}
                      {doc.seoTitle && doc.seoDescription ? (
                        <Badge className="bg-green-100 text-green-800 flex items-center">
                          <BadgeIcon className="h-3 w-3 mr-1" />
                          已设置
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="flex items-center">
                          <BadgeIcon className="h-3 w-3 mr-1" />
                          未设置
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/marketing/help/documents/${doc.id}`}>
                          查看
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredDocuments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              暂无匹配的文档
            </div>
          )}

          {/* 添加分页控件 */}
          {filteredDocuments.length > itemsPerPage && (
            <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <Button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  variant="outline"
                >
                  上一页
                </Button>
                <Button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  variant="outline"
                >
                  下一页
                </Button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    显示第 <span className="font-medium">{indexOfFirstItem + 1}</span> 到 <span className="font-medium">{Math.min(indexOfLastItem, filteredDocuments.length)}</span> 条结果，共 <span className="font-medium">{filteredDocuments.length}</span> 条
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <Button
                      onClick={() => paginate(1)}
                      disabled={currentPage === 1}
                      variant="outline"
                      className="rounded-l-md"
                    >
                      首页
                    </Button>
                    <Button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      variant="outline"
                    >
                      上一页
                    </Button>
                    
                    {/* 页码显示 */}
                    {getPageNumbers().map((page) => (
                      <Button
                        key={page}
                        onClick={() => paginate(page)}
                        variant={currentPage === page ? "default" : "outline"}
                        className={currentPage === page ? "" : "hidden md:inline-flex"}
                      >
                        {page}
                      </Button>
                    ))}
                    
                    <Button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      variant="outline"
                    >
                      下一页
                    </Button>
                    <Button
                      onClick={() => paginate(totalPages)}
                      disabled={currentPage === totalPages}
                      variant="outline"
                      className="rounded-r-md"
                    >
                      末页
                    </Button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}