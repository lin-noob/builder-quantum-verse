import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  HelpCircle,
  FileText,
  Eye,
  ThumbsUp
} from "lucide-react";
import MarketingNav from "@/components/MarketingNav";
import MarketingFooter from "@/components/MarketingFooter";
import DocumentCatalog, { CategoryNode, DocItem } from "@/components/Help/DocumentCatalog";
import { request } from "@/lib/request";
import { useTranslation } from "react-i18next";

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

// 模拟数据
const mockDocuments: HelpDocument[] = [
  {
    id: "1",
    title: "快速入门指南",
    category: "���户指南",
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
      <p>登录后，在控制台点击"新��项目"，填写项目名称和描述，选择适合的模板。</p>
      <h3>第三步：数据接入</h3>
      <p>在项目设置中配置数据源，支持多种数据接入方式，包���API、SDK和文件上传。</p>
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
    title: "用户画像功��详解",
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
      <p>支持多种数据源接入，包括用户行为数据、交易数据、��交媒体数据等。</p>
      <h3>标签管���</h3>
      <p>系统提供丰富的预设标签，同时也支持自定义标签创建。</p>
      <h3>人群分群</h3>
      <p>基于标���和行为数据，您可以创建不同的人群分群，用于精准营销。</p>
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
      <p>AI营销���略是平台的核心功能，通过机器学习算法自动优化营销效果。</p>
      <h3>策略创建</h3>
      <p>在AI营销模块中点击"新建策略"，选���目标人群和营销目标。</p>
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
      <h2>API��口文档</h2>
      <p>为开发者提供的完整API接口文档。</p>
      <h3>认证方式</h3>
      <p>使用API Key进行认���，在请求头中添加Authorization字段。</p>
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
      <p>A: 根据数据量大小，通常需要1-24小��完成数据同步。</p>
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
    description: "���细介绍平台的数据安全措施和用户隐私保护政策。",
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

export default function MarketingHelpCenter() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [documents, setDocuments] = useState<DocItem[]>([]);
  const [hotDocs, setHotDocs] = useState<DocItem[]>([]);
  const [hotLoading, setHotLoading] = useState(false);
  const [hotError, setHotError] = useState<string | null>(null);
  const popularDocs = useMemo(() => documents.filter((d) => d.isPopular).slice(0, 8), [documents]);

  useEffect(() => {
    (async () => {
      try {
        setHotLoading(true);
        setHotError(null);
        const res = await request.get("/admin/api/v1/article/hot");
        const data = res?.data?.data;
        let list: any[] = [];
        if (Array.isArray(data)) list = data;
        else if (data?.list && Array.isArray(data.list)) list = data.list;
        const mapped: DocItem[] = list.map((d: any) => ({
          id: String(d.id),
          title: d.title || d.name || d.mainTitle || "",
          description: d.description || d.viceTitle || "",
          categoryId: d.categoryId || d.classifyId ? String(d.categoryId || d.classifyId) : undefined,
          views: d.browseCount ?? 0,
          likes: d.upvoteCount ?? 0,
          status: d.status,
          isPopular: true,
          gmtModified: d.gmtModified || d.updatedAt || d.lastUpdated,
        }));
        setHotDocs(mapped);
      } catch (e) {
        console.error(e);
        setHotError(t('marketingHelp.hotError'));
      } finally {
        setHotLoading(false);
      }
    })();
  }, [t]);

  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* 顶部：帮助中心首页（保留） */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-6 w-6 text-blue-600" />
                {t('marketingHelp.title')}
              </CardTitle>
              <CardDescription>
                {t('marketingHelp.welcome')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                {t('marketingHelp.intro')}
              </p>
            </CardContent>
          </Card>

          {/* 热门文档 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ThumbsUp className="h-5 w-5 text-orange-500" />
                {t('marketingHelp.hot.title')}
              </CardTitle>
              <CardDescription>{t('marketingHelp.hot.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hotLoading ? (
                  <div className="text-sm text-gray-500">{t('marketingHelp.loading')}</div>
                ) : hotError ? (
                  <div className="text-sm text-red-500">{hotError}</div>
                ) : hotDocs.length === 0 ? (
                  <div className="text-sm text-gray-500">{t('marketingHelp.noHotDocs')}</div>
                ) : (
                  hotDocs.map(doc => (
                    <div
                      key={doc.id}
                      className="flex items-start gap-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/marketing/help/documents/${doc.id}`)}
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
                            {doc.views ?? 0}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {doc.gmtModified ? t('marketingHelp.updatedAt', { date: doc.gmtModified }) : null}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 下方：文档树与文档列表 */}
        <DocumentCatalog
          onDataChange={({ documents }) => setDocuments(documents)}
          onDocumentClick={(d) => navigate(`/marketing/help/documents/${d.id}`)}
          leftTitle={t('marketingHelp.leftTitle')}
          rightTitle={t('marketingHelp.rightTitle')}
          defaultStatus={1}
        />
      </div>
      <MarketingFooter />
    </div>
  );
}
