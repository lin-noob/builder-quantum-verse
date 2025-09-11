import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Folder,
  File,
  ChevronDown,
  ChevronUp,
  Home,
  BookOpenCheck,
  Lightbulb,
  Settings,
  Shield,
  Code,
  CircleHelp
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "react-router-dom";
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
  content: string;
}

// 文档分类模型
interface DocumentCategory {
  id: string;
  name: string;
  documents: HelpDocument[];
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
    content: `
      <h2>欢迎使用AI营销平台</h2>
      <p>AI营销平台是一款基于人工智能技术的营销自动化工具，帮助您更高效地进行用户画像分析、营销策略制定和效果追踪。</p>
      
      <h3>第一步：账户注册</h3>
      <p>访问我们的官网，点击右上角的"注册"按钮，填写必要的信息完成账户注册。</p>
      
      <h3>第二步：创建项目</h3>
      <p>登录后，在控制台点击"新建项目"，填写项目名称和描述，选择适合的模板。</p>
      
      <h3>第三步：数据接入</h3>
      <p>在项目设置中配置数据源，支持多种数据接入方式，包括API、SDK和文件上传。</p>
      
      <h3>第四步：开始使用核心功能</h3>
      <p>完成数据接入后，您就可以开始使用用户画像、AI营销策略和效果追踪等核心功能了。</p>
      
      <h3>常见问题</h3>
      <p><strong>Q: 数据接入需要多长时间？</strong></p>
      <p>A: 根据数据量大小，通常需要1-24小时完成数据接入和处理。</p>
      
      <p><strong>Q: 如何联系技术支持？</strong></p>
      <p>A: 您可以通过帮助中心的反馈功能或直接联系我们的客服团队。</p>
    `
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
    content: `
      <h2>用户画像功能详解</h2>
      <p>用户画像功能是AI营销平台的核心功能之一，帮助您深入了解目标用户群体。</p>
      
      <h3>数据导入</h3>
      <p>支持多种数据源接入，包括用户行为数据、交易数据、社交媒体数据等。</p>
      
      <h3>标签管理</h3>
      <p>系统提供丰富的预设标签，同时也支持自定义标签创建。</p>
      
      <h3>人群分群</h3>
      <p>基于标签和行为数据，您可以创建不同的人群分群，用于精准营销。</p>
    `
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
    content: `
      <h2>AI营销策略配置</h2>
      <p>AI营销策略是平台的核心功能，通过机器学习算法自动优化营销效果。</p>
      
      <h3>策略创建</h3>
      <p>在AI营销模块中点击"新建策略"，选择目标人群和营销目标。</p>
      
      <h3>参数配置</h3>
      <p>设置预算、时间窗口、渠道偏好等参数。</p>
      
      <h3>效果监控</h3>
      <p>通过实时监控面板查看策略执行效果，及时调整优化。</p>
    `
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
    content: `
      <h2>API接口文档</h2>
      <p>为开发者提供的完整API接口文档。</p>
      
      <h3>认证方式</h3>
      <p>使用API Key进行认证，在请求头中添加Authorization字段。</p>
      
      <h3>请求格式</h3>
      <p>所有请求使用JSON格式，UTF-8编码。</p>
      
      <h3>响应格式</h3>
      <p>响应包含状态码、消息和数据三个部分。</p>
      
      <h3>错误码说明</h3>
      <p>200: 请求成功</p>
      <p>400: 请求参数错误</p>
      <p>401: 认证失败</p>
      <p>500: 服务器内部错误</p>
    `
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
    content: `
      <h2>常见问题解答</h2>
      
      <h3>账户与权限</h3>
      <p><strong>Q: 忘记密码怎么办？</strong></p>
      <p>A: 在登录页面点击"忘记密码"，按照提示操作重置密码。</p>
      
      <p><strong>Q: 如何添加团队成员？</strong></p>
      <p>A: 在组织管理中点击"邀请成员"，输入成员邮箱发送邀请。</p>
      
      <h3>数据相关</h3>
      <p><strong>Q: 数据同步需要多长时间？</strong></p>
      <p>A: 根据数据量大小，通常需要1-24小时完成数据同步。</p>
      
      <p><strong>Q: 支持哪些数据格式？</strong></p>
      <p>A: 支持CSV、JSON、Excel等常见数据格式。</p>
      
      <h3>计费与套餐</h3>
      <p><strong>Q: 如何升级套餐？</strong></p>
      <p>A: 在系统管理的订阅充值页面可以查看和升级套餐。</p>
      
      <p><strong>Q: 支持哪些支付方式？</strong></p>
      <p>A: 支持支付宝、微信支付和银行转账。</p>
    `
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
    content: `
      <h2>数据安全与隐私保护</h2>
      <p>我们高度重视用户数据的安全和隐私保护，采取了多项技术和管理措施。</p>
      
      <h3>数据加密</h3>
      <p>所有数据在传输和存储过程中均采用高强度加密算法保护。</p>
      
      <h3>访问控制</h3>
      <p>严格的权限管理和访问控制机制，确保只有授权人员才能访问相关数据。</p>
      
      <h3>隐私政策</h3>
      <p>我们严格遵守相关法律法规，保护用户隐私信息不被滥用。</p>
    `
  }
];

// 文档分类
const categories = [
  { id: "user-guide", name: "用户指南" },
  { id: "feature", name: "功能说明" },
  { id: "developer", name: "开发者指南" },
  { id: "faq", name: "常见问题" },
  { id: "policy", name: "政策说明" }
];

// 按分类组织文档
const organizeDocumentsByCategory = (): DocumentCategory[] => {
  const categoryMap: Record<string, string> = {
    "user-guide": "用户指南",
    "feature": "功能说明",
    "developer": "开发者指南",
    "faq": "常见问题",
    "policy": "政策说明"
  };

  return categories.map(category => ({
    id: category.id,
    name: category.name,
    documents: mockDocuments.filter(doc => doc.category === categoryMap[category.id])
  }));
};

export default function MarketingHelpCenter() {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const [documents] = useState<HelpDocument[]>(mockDocuments);
  const [categoriesWithDocuments] = useState<DocumentCategory[]>(organizeDocumentsByCategory());
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [selectedDocument, setSelectedDocument] = useState<HelpDocument | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCategories, setFilteredCategories] = useState<DocumentCategory[]>(categoriesWithDocuments);
  const [showHomePage, setShowHomePage] = useState(true);

  // 设置默认展开所有分类
  useEffect(() => {
    const initialExpanded: Record<string, boolean> = {};
    categoriesWithDocuments.forEach(category => {
      initialExpanded[category.id] = true;
    });
    setExpandedCategories(initialExpanded);
  }, [categoriesWithDocuments]);

  // 根据URL参数或默认选择文档
  useEffect(() => {
    if (documentId) {
      const doc = documents.find(d => d.id === documentId);
      setSelectedDocument(doc || null);
      setShowHomePage(false);
    } else if (!selectedDocument) {
      // 默认显示首页
      setShowHomePage(true);
    }
  }, [documentId, documents, selectedDocument]);

  // 搜索功能
  useEffect(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const filtered = categoriesWithDocuments.map(category => ({
        ...category,
        documents: category.documents.filter(doc => 
          doc.title.toLowerCase().includes(term) ||
          doc.description.toLowerCase().includes(term) ||
          doc.category.toLowerCase().includes(term) ||
          doc.content.toLowerCase().includes(term)
        )
      })).filter(category => category.documents.length > 0);
      
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categoriesWithDocuments);
    }
  }, [searchTerm, categoriesWithDocuments]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleDocumentSelect = (doc: HelpDocument) => {
    setSelectedDocument(doc);
    setShowHomePage(false);
    navigate(`/marketing/help/${doc.id}`);
  };

  const handleHomeClick = () => {
    setSelectedDocument(null);
    setShowHomePage(true);
    navigate('/marketing/help');
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

  // 获取分类图标
  const getCategoryIcon = (categoryId: string) => {
    const icons: Record<string, React.ReactNode> = {
      "user-guide": <BookOpenCheck className="h-5 w-5" />,
      "feature": <Lightbulb className="h-5 w-5" />,
      "developer": <Code className="h-5 w-5" />,
      "faq": <CircleHelp className="h-5 w-5" />,
      "policy": <Shield className="h-5 w-5" />
    };
    return icons[categoryId] || <FileText className="h-5 w-5" />;
  };

  // 获取分类描述
  const getCategoryDescription = (categoryId: string) => {
    const descriptions: Record<string, string> = {
      "user-guide": "了解如何快速上手使用AI营销平台",
      "feature": "深入了解平台各项功能的详细说明",
      "developer": "为开发者提供的API和集成指南",
      "faq": "常见问题解答和故障排除",
      "policy": "平台政策和安全规范说明"
    };
    return descriptions[categoryId] || "";
  };

  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 左侧目录结构 */}
          <div className="w-full lg:w-1/4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  帮助文档
                </CardTitle>
                <CardDescription>文档目录</CardDescription>
              </CardHeader>
              <CardContent>
                {/* 搜索框 */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="搜索文档..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* 目录树 */}
                <div className="mt-4">
                  <div 
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
                      showHomePage ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
                    }`}
                    onClick={handleHomeClick}
                  >
                    <Home className="h-4 w-4" />
                    <span>帮助中心首页</span>
                  </div>
                  
                  <div className="mt-2 space-y-1">
                    {filteredCategories.map(category => (
                      <div key={category.id}>
                        <div 
                          className="flex items-center justify-between p-2 rounded cursor-pointer hover:bg-gray-100"
                          onClick={() => toggleCategory(category.id)}
                        >
                          <div className="flex items-center gap-2">
                            <Folder className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">{category.name}</span>
                          </div>
                          {expandedCategories[category.id] ? 
                            <ChevronUp className="h-4 w-4" /> : 
                            <ChevronDown className="h-4 w-4" />
                          }
                        </div>
                        
                        {expandedCategories[category.id] && (
                          <div className="ml-6 mt-1 space-y-1">
                            {category.documents.map(doc => (
                              <div
                                key={doc.id}
                                className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
                                  selectedDocument?.id === doc.id 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'hover:bg-gray-100'
                                }`}
                                onClick={() => handleDocumentSelect(doc)}
                              >
                                <File className="h-4 w-4" />
                                <span className="text-sm truncate">{doc.title}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧内容区域 */}
          <div className="w-full lg:w-3/4">
            {showHomePage ? (
              // 简化后的首页，只显示热门文档
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HelpCircle className="h-6 w-6 text-blue-600" />
                      帮助中心
                    </CardTitle>
                    <CardDescription>
                      欢迎使用AI营销平台帮助中心，这里有您需要的所有文档和指南
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">
                      在这里您可以找到关于AI营销平台的详细使用说明、功能介绍、常见问题解答等文档。
                      以下是最受用户关注的热门文档，您也可以通过左侧目录查找更多帮助内容。
                    </p>
                  </CardContent>
                </Card>

                {/* 热门文档 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ThumbsUp className="h-5 w-5 text-orange-500" />
                      热门文档
                    </CardTitle>
                    <CardDescription>最受用户关注的帮助文档</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {documents.filter(doc => doc.isPopular).map(doc => (
                        <div 
                          key={doc.id} 
                          className="flex items-start gap-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleDocumentSelect(doc)}
                        >
                          <div className="mt-1 p-2 bg-orange-100 rounded-lg text-orange-600">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{doc.title}</h3>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{doc.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary" className="text-xs">
                                <Eye className="h-3 w-3 mr-1" />
                                {doc.views}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                更新于 {doc.lastUpdated}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : selectedDocument ? (
              // 文档详情页面
              <Card>
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {getCategoryBadge(selectedDocument.category)}
                    {selectedDocument.isPopular && (
                      <Badge className="bg-orange-100 text-orange-800">热门</Badge>
                    )}
                  </div>
                  <CardTitle className="text-2xl">{selectedDocument.title}</CardTitle>
                  <CardDescription>{selectedDocument.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-500 mb-6">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        更新于 {selectedDocument.lastUpdated}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {selectedDocument.views} 次浏览
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        {selectedDocument.likes}
                      </Button>
                    </div>
                  </div>
                  
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedDocument.content }}
                  />
                </CardContent>
              </Card>
            ) : (
              // 无文档选择时的默认状态
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-64">
                  <HelpCircle className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">欢迎来到帮助中心</h3>
                  <p className="text-gray-600 text-center">
                    请选择左侧目录中的文档查看详细内容
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      <MarketingFooter />
    </div>
  );
}