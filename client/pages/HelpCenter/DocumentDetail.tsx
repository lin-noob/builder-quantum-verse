import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Eye,
  Clock,
  ArrowLeft,
  Share2,
  Bookmark,
  AlertCircle,
  Globe,
} from "lucide-react";
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
  content: string;
  lastUpdated: string;
  views: number;
  likes: number;
  isPopular: boolean;
  // 多语言内容字段
  translations: {
    [languageCode: string]: {
      title: string;
      description: string;
      content: string;
    }
  };
  // SEO字段
  url?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

interface Feedback {
  id: string;
  userName: string;
  comment: string;
  rating: number;
  date: string;
}

// 模拟数据
const mockDocuments: HelpDocument[] = [
  {
    id: "1",
    title: "快速入门指南",
    category: "用户指南",
    description:
      "了解如何快速开始使用AI营销平台，包括账户注册、项目创建和基础功能使用。",
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
    `,
    lastUpdated: "2024-01-15",
    views: 1250,
    likes: 98,
    isPopular: true,
    translations: {
      en: {
        title: "Quick Start Guide",
        description: "Learn how to quickly get started with the AI marketing platform, including account registration, project creation, and basic function usage.",
        content: `
          <h2>Welcome to the AI Marketing Platform</h2>
          <p>The AI marketing platform is a marketing automation tool based on artificial intelligence technology that helps you more efficiently analyze user profiles, develop marketing strategies, and track results.</p>
          
          <h3>Step 1: Account Registration</h3>
          <p>Visit our official website, click the "Register" button in the upper right corner, and fill in the necessary information to complete account registration.</p>
          
          <h3>Step 2: Create a Project</h3>
          <p>After logging in, click "New Project" in the console, fill in the project name and description, and select an appropriate template.</p>
          
          <h3>Step 3: Data Access</h3>
          <p>Configure data sources in project settings. Multiple data access methods are supported, including API, SDK, and file upload.</p>
          
          <h3>Step 4: Start Using Core Functions</h3>
          <p>After completing data access, you can start using core functions such as user profiling, AI marketing strategies, and effect tracking.</p>
          
          <h3>Frequently Asked Questions</h3>
          <p><strong>Q: How long does data access take?</strong></p>
          <p>A: Depending on the amount of data, data access and processing usually takes 1-24 hours.</p>
          
          <p><strong>Q: How to contact technical support?</strong></p>
          <p>A: You can use the feedback function in the help center or directly contact our customer service team.</p>
        `
      }
    }
  },
  {
    id: "2",
    title: "用户画像功能详解",
    category: "功能说明",
    description:
      "深入介绍用户画像功能的使用方法，包括数据导入、标签管理和人群分群。",
    content: `
      <h2>用户画像功能详解</h2>
      <p>用户画像功能是AI营销平台的核心功能之一，帮助您深入了解目标用户群体。</p>
      
      <h3>数据导入</h3>
      <p>支持多种数据源接入，包括用户行为数据、交易数据、社交媒体数据等。</p>
      
      <h3>标签管理</h3>
      <p>系统提供丰富的预设标签，同时也支持自定义标签创建。</p>
      
      <h3>人群分群</h3>
      <p>基于标签和行为数据，您可以创建不同的人群分群，用于精准营销。</p>
    `,
    lastUpdated: "2024-01-12",
    views: 890,
    likes: 76,
    isPopular: true,
    translations: {
      en: {
        title: "User Profile Feature Details",
        description: "In-depth introduction to the user profile feature, including data import, tag management, and audience segmentation.",
        content: `
          <h2>User Profile Feature Details</h2>
          <p>The user profile feature is one of the core functions of the AI marketing platform, helping you gain in-depth understanding of your target user groups.</p>
          
          <h3>Data Import</h3>
          <p>Supports multiple data source access, including user behavior data, transaction data, social media data, etc.</p>
          
          <h3>Tag Management</h3>
          <p>The system provides rich preset tags and also supports custom tag creation.</p>
          
          <h3>Audience Segmentation</h3>
          <p>Based on tags and behavioral data, you can create different audience segments for precise marketing.</p>
        `
      }
    }
  },
  {
    id: "3",
    title: "AI营销策略配置",
    category: "功能说明",
    description: "详细说明如何配置和优化AI营销策略，提高营销效果和转化率。",
    content: `
      <h2>AI营销策略配置</h2>
      <p>AI营销策略是平台的核心功能，通过机器学习算法自动优化营销效果。</p>
      
      <h3>策略创建</h3>
      <p>在AI营销模块中点击"新建策略"，选择目标人群和营销目标。</p>
      
      <h3>参数配置</h3>
      <p>设置预算、时间窗口、渠道偏好等参数。</p>
      
      <h3>效果监控</h3>
      <p>通过实时监控面板查看策略执行效果，及时调整优化。</p>
    `,
    lastUpdated: "2024-01-10",
    views: 756,
    likes: 65,
    isPopular: false,
    translations: {
      en: {
        title: "AI Marketing Strategy Configuration",
        description: "Detailed instructions on how to configure and optimize AI marketing strategies to improve marketing effectiveness and conversion rates.",
        content: `
          <h2>AI Marketing Strategy Configuration</h2>
          <p>AI marketing strategy is a core function of the platform that automatically optimizes marketing effectiveness through machine learning algorithms.</p>
          
          <h3>Strategy Creation</h3>
          <p>Click "New Strategy" in the AI marketing module, and select the target audience and marketing objectives.</p>
          
          <h3>Parameter Configuration</h3>
          <p>Set parameters such as budget, time window, and channel preferences.</p>
          
          <h3>Effect Monitoring</h3>
          <p>View strategy execution results through the real-time monitoring panel and adjust optimization in a timely manner.</p>
        `
      }
    }
  },
  {
    id: "4",
    title: "API接口文档",
    category: "开发者指南",
    description:
      "完整的API接口文档，包括认证方式、请求格式、响应格式和错误码说明。",
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
    `,
    lastUpdated: "2024-01-08",
    views: 1120,
    likes: 89,
    isPopular: true,
    translations: {
      en: {
        title: "API Documentation",
        description: "Complete API documentation, including authentication methods, request formats, response formats, and error code explanations.",
        content: `
          <h2>API Documentation</h2>
          <p>Complete API documentation for developers.</p>
          
          <h3>Authentication Method</h3>
          <p>Use API Key for authentication, add Authorization field in the request header.</p>
          
          <h3>Request Format</h3>
          <p>All requests use JSON format with UTF-8 encoding.</p>
          
          <h3>Response Format</h3>
          <p>The response contains three parts: status code, message, and data.</p>
          
          <h3>Error Code Explanation</h3>
          <p>200: Request successful</p>
          <p>400: Request parameter error</p>
          <p>401: Authentication failed</p>
          <p>500: Internal server error</p>
        `
      }
    }
  },
  {
    id: "5",
    title: "常见问题解答",
    category: "FAQ",
    description: "汇总用户在使用过程中遇到的常见问题及其解决方案。",
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
    `,
    lastUpdated: "2024-01-05",
    views: 2100,
    likes: 156,
    isPopular: true,
    translations: {
      en: {
        title: "Frequently Asked Questions",
        description: "A collection of common questions and solutions encountered by users during use.",
        content: `
          <h2>Frequently Asked Questions</h2>
          
          <h3>Account and Permissions</h3>
          <p><strong>Q: What if I forget my password?</strong></p>
          <p>A: Click "Forgot Password" on the login page and follow the prompts to reset your password.</p>
          
          <p><strong>Q: How to add team members?</strong></p>
          <p>A: Click "Invite Members" in Organization Management, enter the member's email and send an invitation.</p>
          
          <h3>Data Related</h3>
          <p><strong>Q: How long does data synchronization take?</strong></p>
          <p>A: Depending on the amount of data, data synchronization usually takes 1-24 hours.</p>
          
          <p><strong>Q: What data formats are supported?</strong></p>
          <p>A: Common data formats such as CSV, JSON, and Excel are supported.</p>
          
          <h3>Billing and Packages</h3>
          <p><strong>Q: How to upgrade packages?</strong></p>
          <p>A: You can view and upgrade packages on the subscription recharge page in System Management.</p>
          
          <p><strong>Q: What payment methods are supported?</strong></p>
          <p>A: Alipay, WeChat Pay, and bank transfer are supported.</p>
        `
      }
    }
  },
];

const mockFeedbacks: Feedback[] = [
  {
    id: "1",
    userName: "张三",
    comment: "文档很详细，帮助我快速上手了平台。",
    rating: 5,
    date: "2024-01-10",
  },
  {
    id: "2",
    userName: "李四",
    comment: "有些地方描述不够清楚，希望能补充更多示例。",
    rating: 3,
    date: "2024-01-08",
  },
];

export default function DocumentDetail() {
  const { documentId } = useParams<{ documentId: string }>();
  const [document, setDocument] = useState<HelpDocument | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [newFeedback, setNewFeedback] = useState("");
  const [userRating, setUserRating] = useState(0);
  const { i18n } = useTranslation();

  useEffect(() => {
    // 模拟数据加载
    setTimeout(() => {
      const doc = mockDocuments.find((d) => d.id === documentId);
      setDocument(doc || null);
      setFeedbacks(mockFeedbacks);
      setLoading(false);
    }, 500);
  }, [documentId]);

  const handleLike = () => {
    if (document) {
      setDocument({
        ...document,
        likes: document.likes + 1,
      });
    }
  };

  const handleDislike = () => {
    // 处理点踩逻辑
  };

  const handleSubmitFeedback = () => {
    if (newFeedback.trim() && userRating > 0) {
      const newFeedbackItem: Feedback = {
        id: (feedbacks.length + 1).toString(),
        userName: "当前用户",
        comment: newFeedback,
        rating: userRating,
        date: new Date().toISOString().split("T")[0],
      };

      setFeedbacks([newFeedbackItem, ...feedbacks]);
      setNewFeedback("");
      setUserRating(0);
    }
  };

  const getCategoryBadge = (category: string) => {
    const categoryColors: Record<string, string> = {
      用户指南: "bg-blue-100 text-blue-800",
      功能说明: "bg-purple-100 text-purple-800",
      开发者指南: "bg-green-100 text-green-800",
      常见问题: "bg-yellow-100 text-yellow-800",
      政策说明: "bg-red-100 text-red-800",
      "User Guide": "bg-blue-100 text-blue-800",
      "Feature Description": "bg-purple-100 text-purple-800",
      "Developer Guide": "bg-green-100 text-green-800",
      FAQ: "bg-yellow-100 text-yellow-800",
      "Policy Description": "bg-red-100 text-red-800",
    };

    return (
      <Badge
        className={`${categoryColors[category] || "bg-gray-100 text-gray-800"} hover:bg-opacity-80`}
      >
        {category}
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

  if (!document) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              文档未找到
            </h3>
            <p className="text-gray-600 mb-4">您要查看的文档不存在或已被删除</p>
            <Button asChild>
              <Link to="/marketing/help">返回帮助中心</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 获取当前语言的文档内容
  const currentLanguage = i18n.language;
  const translatedDocument = currentLanguage !== 'zh' && document.translations[currentLanguage] 
    ? {
        ...document,
        title: document.translations[currentLanguage].title,
        description: document.translations[currentLanguage].description,
        content: document.translations[currentLanguage].content
      }
    : document;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 页头 */}
      <MarketingNav />
      
      {/* 页面内容 */}
      <main className="flex-grow p-6">
        <div className="max-w-4xl mx-auto">
          <Helmet>
            <title>{translatedDocument.seoTitle || translatedDocument.title}</title>
            <meta
              name="description"
              content={translatedDocument.seoDescription || translatedDocument.description}
            />
            {translatedDocument.seoKeywords && (
              <meta name="keywords" content={translatedDocument.seoKeywords} />
            )}
          </Helmet>

          {/* 返回按钮和操作按钮 */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <Button variant="outline" asChild>
              <Link to="/marketing/help">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回帮助中心
              </Link>
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Globe className="h-4 w-4 mr-2" />
                {currentLanguage === 'zh' ? '中文' : currentLanguage === 'en' ? 'English' : currentLanguage}
              </Button>
              <Button variant="outline" size="sm">
                <Bookmark className="h-4 w-4 mr-2" />
                收藏
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                分享
              </Button>
            </div>
          </div>

          {/* 文档内容 */}
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {getCategoryBadge(translatedDocument.category)}
                {translatedDocument.isPopular && (
                  <Badge className="bg-orange-100 text-orange-800">热门</Badge>
                )}
              </div>
              <CardTitle className="text-2xl">{translatedDocument.title}</CardTitle>
              <CardDescription>{translatedDocument.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-500 mb-6">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    更新于 {translatedDocument.lastUpdated}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {translatedDocument.views} 次浏览
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleLike}>
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    {translatedDocument.likes}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDislike}>
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: translatedDocument.content }}
              />
            </CardContent>
          </Card>

          {/* 用户反馈 */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                用户反馈
              </CardTitle>
              <CardDescription>对本文档的评价和建议</CardDescription>
            </CardHeader>
            <CardContent>
              {/* 添加反馈表单 */}
              <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-3">添加您的反馈</h4>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">评分</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Button
                        key={star}
                        variant="outline"
                        size="sm"
                        className={`p-2 ${userRating >= star ? "bg-yellow-100 border-yellow-300" : ""}`}
                        onClick={() => setUserRating(star)}
                      >
                        {star <= userRating ? "★" : "☆"}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">您的建议</label>
                  <Textarea
                    placeholder="请分享您对本文档的看法或建议..."
                    value={newFeedback}
                    onChange={(e) => setNewFeedback(e.target.value)}
                    rows={3}
                  />
                </div>
                <Button
                  onClick={handleSubmitFeedback}
                  disabled={!newFeedback.trim() || userRating === 0}
                >
                  提交反馈
                </Button>
              </div>

              {/* 反馈列表 */}
              <div className="space-y-4">
                {feedbacks.map((feedback) => (
                  <div key={feedback.id} className="border-b pb-4 last:border-b-0">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{feedback.userName}</span>
                      <span className="text-sm text-gray-500">{feedback.date}</span>
                    </div>
                    <div className="flex items-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={
                            i < feedback.rating
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <p className="text-gray-700">{feedback.comment}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* 页脚 */}
      <MarketingFooter />
    </div>
  );
}
