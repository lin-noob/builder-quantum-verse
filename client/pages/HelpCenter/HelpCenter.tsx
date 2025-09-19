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
  Badge as BadgeIcon,
  Globe
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

// 导入营销网站的页头和页脚组件
import MarketingNav from "@/components/MarketingNav";
import MarketingFooter from "@/components/MarketingFooter";

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
  // 多语言内容字段
  translations: {
    [languageCode: string]: {
      title: string;
      description: string;
    }
  };
  // SEO字段
  url?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
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
    isPopular: true,
    translations: {
      en: {
        title: "Quick Start Guide",
        description: "Learn how to quickly get started with the AI marketing platform, including account registration, project creation, and basic function usage."
      }
    }
  },
  {
    id: "2",
    title: "用户画像功能详解",
    category: "功能说明",
    description: "深入介绍用户画像功能的使用方法，包括数据导入、标签管理和人群分群。",
    lastUpdated: "2024-01-12",
    views: 890,
    likes: 76,
    isPopular: true,
    translations: {
      en: {
        title: "User Profile Feature Details",
        description: "In-depth introduction to the user profile feature, including data import, tag management, and audience segmentation."
      }
    }
  },
  {
    id: "3",
    title: "AI营销策略配置",
    category: "功能说明",
    description: "详细说明如何配置和优化AI营销策略，提高营销效果和转化率。",
    lastUpdated: "2024-01-10",
    views: 756,
    likes: 65,
    isPopular: false,
    translations: {
      en: {
        title: "AI Marketing Strategy Configuration",
        description: "Detailed instructions on how to configure and optimize AI marketing strategies to improve marketing effectiveness and conversion rates."
      }
    }
  },
  {
    id: "4",
    title: "API接口文档",
    category: "开发者指南",
    description: "完整的API接口文档，包括认证方式、请求格式、响应格式和错误码说明。",
    lastUpdated: "2024-01-08",
    views: 1120,
    likes: 89,
    isPopular: true,
    translations: {
      en: {
        title: "API Documentation",
        description: "Complete API documentation, including authentication methods, request formats, response formats, and error code explanations."
      }
    }
  },
  {
    id: "5",
    title: "常见问题解答",
    category: "FAQ",
    description: "汇总用户在使用过程中遇到的常见问题及其解决方案。",
    lastUpdated: "2024-01-05",
    views: 2100,
    likes: 156,
    isPopular: true,
    translations: {
      en: {
        title: "Frequently Asked Questions",
        description: "A collection of common questions and solutions encountered by users during use."
      }
    }
  },
  {
    id: "6",
    title: "数据安全与隐私保护",
    category: "政策说明",
    description: "详细介绍平台的数据安全措施和用户隐私保护政策。",
    lastUpdated: "2023-12-28",
    views: 650,
    likes: 42,
    isPopular: false,
    translations: {
      en: {
        title: "Data Security and Privacy Protection",
        description: "Detailed introduction to the platform's data security measures and user privacy protection policies."
      }
    }
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
  const { i18n } = useTranslation();

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
      result = result.filter(doc => {
        // 检查当前语言的标题和描述
        const currentLanguage = i18n.language;
        const title = currentLanguage !== 'zh' && doc.translations[currentLanguage] 
          ? doc.translations[currentLanguage].title 
          : doc.title;
        const description = currentLanguage !== 'zh' && doc.translations[currentLanguage] 
          ? doc.translations[currentLanguage].description 
          : doc.description;
          
        return (
          title.toLowerCase().includes(term) ||
          description.toLowerCase().includes(term) ||
          doc.category.toLowerCase().includes(term)
        );
      });
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
  }, [searchTerm, documents, sortConfig, categoryFilter, seoFilter, i18n.language]);

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
      "政策说明": "bg-red-100 text-red-800",
      "User Guide": "bg-blue-100 text-blue-800",
      "Feature Description": "bg-purple-100 text-purple-800",
      "Developer Guide": "bg-green-100 text-green-800",
      "FAQ": "bg-yellow-100 text-yellow-800",
      "Policy Description": "bg-red-100 text-red-800"
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

  // 获取当前语言的文档内容
  const getCurrentLanguageDocument = (doc: HelpDocument) => {
    const currentLanguage = i18n.language;
    if (currentLanguage !== 'zh' && doc.translations[currentLanguage]) {
      return {
        ...doc,
        title: doc.translations[currentLanguage].title,
        description: doc.translations[currentLanguage].description
      };
    }
    return doc;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 页头 */}
      <MarketingNav />
      
      {/* 页面内容 */}
      <main className="flex-grow p-6">
        <div className="max-w-7xl mx-auto">
          {/* 页面标题 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">帮助中心</h1>
            <p className="text-gray-600">在这里您可以找到使用AI营销平台的所有帮助文档</p>
          </div>

          {/* 搜索和筛选区域 */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="搜索帮助文档..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="选择分类" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    筛选
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 文档列表 */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {currentItems.map((doc) => {
              const currentDoc = getCurrentLanguageDocument(doc);
              return (
                <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-start gap-2">
                      <HelpCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-lg">{currentDoc.title}</span>
                    </CardTitle>
                    <CardDescription>{currentDoc.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>{currentDoc.category}</span>
                      <span>{currentDoc.lastUpdated}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {currentDoc.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4" />
                          {currentDoc.likes}
                        </span>
                      </div>
                      {currentDoc.isPopular && (
                        <Badge className="bg-orange-100 text-orange-800">热门</Badge>
                      )}
                    </div>
                    <Link to={`/marketing/help/documents/${doc.id}`}>
                      <Button variant="ghost" className="w-full mt-4">
                        查看详情
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  上一页
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  下一页
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 页脚 */}
      <MarketingFooter />
    </div>
  );
}
