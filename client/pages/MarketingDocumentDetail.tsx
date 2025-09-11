import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Badge
} from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Eye,
  Clock,
  ArrowLeft,
  Share2,
  Bookmark,
  AlertCircle
} from "lucide-react";
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
    description: "了解如何快速开始使用AI营销平台，包括账户注册、项目创建和基础功能使用。",
    content: `
      <h2 class="text-2xl font-bold text-gray-900 mb-4">欢迎使用AI营销平台</h2>
      <p class="text-gray-700 mb-4">AI营销平台是一款基于人工智能技术的营销自动化工具，帮助您更高效地进行用户画像分析、营销策略制定和效果追踪。</p>
      
      <h3 class="text-xl font-semibold text-gray-900 mb-3 mt-6">第一步：账户注册</h3>
      <p class="text-gray-700 mb-4">访问我们的官网，点击右上角的"注册"按钮，填写必要的信息完成账户注册。</p>
      
      <h3 class="text-xl font-semibold text-gray-900 mb-3 mt-6">第二步：创建项目</h3>
      <p class="text-gray-700 mb-4">登录后，在控制台点击"新建项目"，填写项目名称和描述，选择适合的模板。</p>
      
      <h3 class="text-xl font-semibold text-gray-900 mb-3 mt-6">第三步：数据接入</h3>
      <p class="text-gray-700 mb-4">在项目设置中配置数据源，支持多种数据接入方式，包括API、SDK和文件上传。</p>
      
      <h3 class="text-xl font-semibold text-gray-900 mb-3 mt-6">第四步：开始使用核心功能</h3>
      <p class="text-gray-700 mb-4">完成数据接入后，您就可以开始使用用户画像、AI营销策略和效果追踪等核心功能了。</p>
      
      <h3 class="text-xl font-semibold text-gray-900 mb-3 mt-6">常见问题</h3>
      <p class="text-gray-700 mb-2"><strong class="text-gray-900">Q: 数据接入需要多长时间？</strong></p>
      <p class="text-gray-700 mb-4">A: 根据数据量大小，通常需要1-24小时完成数据接入和处理。</p>
      
      <p class="text-gray-700 mb-2"><strong class="text-gray-900">Q: 如何联系技术支持？</strong></p>
      <p class="text-gray-700">A: 您可以通过帮助中心的反馈功能或直接联系我们的客服团队。</p>
    `,
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
    content: `
      <h2 class="text-2xl font-bold text-gray-900 mb-4">用户画像功能详解</h2>
      <p class="text-gray-700 mb-4">用户画像功能是AI营销平台的核心功能之一，帮助您深入了解目标用户群体。</p>
      
      <h3 class="text-xl font-semibold text-gray-900 mb-3 mt-6">数据导入</h3>
      <p class="text-gray-700 mb-4">支持多种数据源接入，包括用户行为数据、交易数据、社交媒体数据等。</p>
      
      <h3 class="text-xl font-semibold text-gray-900 mb-3 mt-6">标签管理</h3>
      <p class="text-gray-700 mb-4">系统提供丰富的预设标签，同时也支持自定义标签创建。</p>
      
      <h3 class="text-xl font-semibold text-gray-900 mb-3 mt-6">人群分群</h3>
      <p class="text-gray-700 mb-4">基于标签和行为数据，您可以创建不同的人群分群，用于精准营销。</p>
    `,
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
    content: `
      <h2 class="text-2xl font-bold text-gray-900 mb-4">AI营销策略配置</h2>
      <p class="text-gray-700 mb-4">AI营销策略是平台的核心功能，通过机器学习算法自动优化营销效果。</p>
      
      <h3 class="text-xl font-semibold text-gray-900 mb-3 mt-6">策略创建</h3>
      <p class="text-gray-700 mb-4">在AI营销模块中点击"新建策略"，选择目标人群和营销目标。</p>
      
      <h3 class="text-xl font-semibold text-gray-900 mb-3 mt-6">参数配置</h3>
      <p class="text-gray-700 mb-4">设置预算、时间窗口、渠道偏好等参数。</p>
      
      <h3 class="text-xl font-semibold text-gray-900 mb-3 mt-6">效果监控</h3>
      <p class="text-gray-700 mb-4">通过实时监控面板查看策略执行效果，及时调整优化。</p>
    `,
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
    content: `
      <h2 class="text-2xl font-bold text-gray-900 mb-4">API接口文档</h2>
      <p class="text-gray-700 mb-4">为开发者提供的完整API接口文档。</p>
      
      <h3 class="text-xl font-semibold text-gray-900 mb-3 mt-6">认证方式</h3>
      <p class="text-gray-700 mb-4">使用API Key进行认证，在请求头中添加Authorization字段。</p>
      
      <h3 class="text-xl font-semibold text-gray-900 mb-3 mt-6">请求格式</h3>
      <p class="text-gray-700 mb-4">所有请求使用JSON格式，UTF-8编码。</p>
      
      <h3 class="text-xl font-semibold text-gray-900 mb-3 mt-6">响应格式</h3>
      <p class="text-gray-700 mb-4">响应包含状态码、消息和数据三个部分。</p>
      
      <h3 class="text-xl font-semibold text-gray-900 mb-3 mt-6">错误码说明</h3>
      <p class="text-gray-700 mb-1">200: 请求成功</p>
      <p class="text-gray-700 mb-1">400: 请求参数错误</p>
      <p class="text-gray-700 mb-1">401: 认证失败</p>
      <p class="text-gray-700">500: 服务器内部错误</p>
    `,
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
    content: `
      <h2 class="text-2xl font-bold text-gray-900 mb-4">常见问题解答</h2>
      
      <h3 class="text-xl font-semibold text-gray-900 mb-3 mt-6">账户与权限</h3>
      <p class="text-gray-700 mb-2"><strong class="text-gray-900">Q: 忘记密码怎么办？</strong></p>
      <p class="text-gray-700 mb-4">A: 在登录页面点击"忘记密码"，按照提示操作重置密码。</p>
      
      <p class="text-gray-700 mb-2"><strong class="text-gray-900">Q: 如何添加团队成员？</strong></p>
      <p class="text-gray-700 mb-4">A: 在组织管理中点击"邀请成员"，输入成员邮箱发送邀请。</p>
      
      <h3 class="text-xl font-semibold text-gray-900 mb-3 mt-6">数据相关</h3>
      <p class="text-gray-700 mb-2"><strong class="text-gray-900">Q: 数据同步需要多长时间？</strong></p>
      <p class="text-gray-700 mb-4">A: 根据数据量大小，通常需要1-24小时完成数据同步。</p>
      
      <p class="text-gray-700 mb-2"><strong class="text-gray-900">Q: 支持哪些数据格式？</strong></p>
      <p class="text-gray-700 mb-4">A: 支持CSV、JSON、Excel等常见数据格式。</p>
      
      <h3 class="text-xl font-semibold text-gray-900 mb-3 mt-6">计费与套餐</h3>
      <p class="text-gray-700 mb-2"><strong class="text-gray-900">Q: 如何升级套餐？</strong></p>
      <p class="text-gray-700 mb-4">A: 在系统管理的订阅充值页面可以查看和升级套餐。</p>
      
      <p class="text-gray-700 mb-2"><strong class="text-gray-900">Q: 支持哪些支付方式？</strong></p>
      <p class="text-gray-700">A: 支持支付宝、微信支付和银行转账。</p>
    `,
    lastUpdated: "2024-01-05",
    views: 2100,
    likes: 156,
    isPopular: true
  }
];

const mockFeedbacks: Feedback[] = [
  {
    id: "1",
    userName: "张三",
    comment: "文档很详细，帮助我快速上手了平台。",
    rating: 5,
    date: "2024-01-10"
  },
  {
    id: "2",
    userName: "李四",
    comment: "有些地方描述不够清楚，希望能补充更多示例。",
    rating: 3,
    date: "2024-01-08"
  }
];

export default function MarketingDocumentDetail() {
  const { documentId } = useParams<{ documentId: string }>();
  const [document, setDocument] = useState<HelpDocument | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [newFeedback, setNewFeedback] = useState("");
  const [userRating, setUserRating] = useState(0);

  useEffect(() => {
    // 模拟数据加载
    setTimeout(() => {
      const doc = mockDocuments.find(d => d.id === documentId);
      setDocument(doc || null);
      setFeedbacks(mockFeedbacks);
      setLoading(false);
    }, 500);
  }, [documentId]);

  const handleLike = () => {
    if (document) {
      setDocument({
        ...document,
        likes: document.likes + 1
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
        date: new Date().toISOString().split('T')[0]
      };
      
      setFeedbacks([newFeedbackItem, ...feedbacks]);
      setNewFeedback("");
      setUserRating(0);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <MarketingNav />
        <div className="p-6">
          <Card>
            <CardContent className="flex items-center justify-center h-64">
              <div>加载中...</div>
            </CardContent>
          </Card>
        </div>
        <MarketingFooter />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-background">
        <MarketingNav />
        <div className="p-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-64">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">文档未找到</h3>
              <p className="text-gray-600 mb-4">您要查看的文档不存在或已被删除</p>
              <Button 
                onClick={() => navigate('/marketing/help')} 
                className="bg-primary hover:bg-primary/90"
              >
                返回帮助中心
              </Button>
            </CardContent>
          </Card>
        </div>
        <MarketingFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />
      <div className="p-6 max-w-4xl mx-auto">
        {/* 文档内容 */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {getCategoryBadge(document.category)}
              {document.isPopular && (
                <Badge className="bg-orange-100 text-orange-800">热门</Badge>
              )}
            </div>
            <CardTitle className="text-2xl text-gray-900">{document.title}</CardTitle>
            <CardDescription className="text-gray-600">{document.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-500 mb-6">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  更新于 {document.lastUpdated}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {document.views} 次浏览
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLike}
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  {document.likes}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDislike}
                >
                  <ThumbsDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: document.content }}
            />
          </CardContent>
        </Card>

        {/* 用户反馈 */}
        <Card>
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
              <h4 className="font-medium text-gray-900 mb-3">添加您的反馈</h4>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">评分</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Button
                      key={star}
                      variant="outline"
                      size="sm"
                      className={`p-2 ${
                        userRating >= star 
                          ? 'bg-yellow-100 border-yellow-300' 
                          : ''
                      }`}
                      onClick={() => setUserRating(star)}
                    >
                      {star <= userRating ? '★' : '☆'}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">您的建议</label>
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
                      <span key={i} className={i < feedback.rating ? "text-yellow-500" : "text-gray-300"}>
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
      <MarketingFooter />
    </div>
  );
}