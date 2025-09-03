import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FileText,
  ArrowRight,
  Sparkles,
  Brain,
  Target,
  Zap,
  MessageSquare,
  CheckCircle,
  BarChart3,
  Users,
  TrendingUp,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MarketingNav from "@/components/MarketingNav";
import MarketingFooter from "@/components/MarketingFooter";
import { useContactModal } from "@/contexts/ContactModalContext";

// 英雄区域组件
const HeroSection = React.memo(() => {
  const navigate = useNavigate();
  const { openModal } = useContactModal();
  const { t } = useTranslation();

  return (
  <section className="relative bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 py-20 overflow-hidden">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="p-6 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full shadow-lg shadow-purple-500/50">
            <FileText className="h-12 w-12 text-white" />
          </div>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-purple-400 to-indigo-400 bg-clip-text text-transparent">
          {t('hero.contentTitle')}
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
          {t('hero.contentDescription')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={() => navigate('/auth')}
            className="text-lg px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 border-0 shadow-lg shadow-purple-500/25 text-white font-semibold"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            {t('hero.ctaPrimary')}
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => openModal({
              title: t('modal.contentDemo'),
              description: t('modal.contentDemoDesc'),
            })}
            className="text-lg px-8 py-4 border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-white bg-cyan-500/10 backdrop-blur-sm shadow-lg shadow-cyan-500/20 transition-all duration-300"
          >
            {t('hero.ctaSecondary')}
          </Button>
        </div>
      </div>
    </div>
  </section>
  );
});

// 核心功能组件
const CoreFeatures = React.memo(() => {
  const { t } = useTranslation();
  const features = [
    {
      icon: <Edit className="h-8 w-8 text-purple-400" />,
      title: t('features.contentCore.smartGenerationTitle'),
      description: t('features.contentCore.smartGenerationDescription'),
    },
    {
      icon: <Target className="h-8 w-8 text-indigo-400" />,
      title: t('features.contentCore.preciseDistributionTitle'),
      description: t('features.contentCore.preciseDistributionDescription'),
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-cyan-400" />,
      title: t('features.contentCore.effectAnalysisTitle'),
      description: t('features.contentCore.effectAnalysisDescription'),
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-orange-400" />,
      title: t('features.contentCore.socialMediaTitle'),
      description: t('features.contentCore.socialMediaDescription'),
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-800 to-gray-900 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-indigo-500/5"></div>
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
            {t('features.title')}
          </h2>
          <p className="text-xl text-gray-400">
            AI赋能的全链路内容营销解决方案，提升品牌影响力和用户参与度
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="h-full bg-gray-800/50 border-gray-700 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="inline-flex p-4 rounded-full bg-gradient-to-r from-gray-700 to-gray-800 border border-gray-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-300">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
});

// 应用场景组件
const UseCases = React.memo(() => {
  const cases = [
    {
      title: "品牌内容营销",
      description: "构建完整的品牌内容体系，提升品牌知名度和用户认知度",
      features: ["品牌故事创作", "视觉内容设计", "多媒体内容制作", "品牌一致性管理"],
    },
    {
      title: "社交媒体运营",
      description: "智能化社交媒体内容策划和发布，增强用户互动和粉丝粘性",
      features: ["内容日历规划", "互动话题策划", "用户UGC激励", "社群运营管理"],
    },
    {
      title: "内容电商营销",
      description: "通过优质内容驱动商品销售，实现内容价值的商业化转换",
      features: ["产品内容包装", "种草内容创作", "直播内容策划", "转化漏斗优化"],
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-900 to-black relative">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-purple-500/5"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-4">应用场景</h2>
          <p className="text-xl text-gray-400">
            覆盖内容营销全生命周期，从策划到发布再到效果分析的完整流程
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {cases.map((useCase, index) => (
            <Card key={index} className="h-full bg-gray-800/50 border-gray-700 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-white mb-3">
                  {useCase.title}
                </h3>
                <p className="text-gray-300 mb-4">{useCase.description}</p>
                <div className="space-y-2">
                  {useCase.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center text-sm text-gray-300">
                      <CheckCircle className="h-4 w-4 text-purple-400 mr-2" />
                      {feature}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
});

// 效果数据组件
const Results = React.memo(() => {
  const { t } = useTranslation();
  const stats = [
    { number: "85%", label: t('stats.contentCreationEfficiencyIncrease'), color: "text-purple-400" },
    { number: "64%", label: t('stats.userEngagementGrowth'), color: "text-indigo-400" },
    { number: "71%", label: t('stats.brandAwarenessIncrease'), color: "text-cyan-400" },
    { number: "58%", label: t('stats.contentConversionRateGrowth'), color: "text-orange-400" },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-800 to-gray-900 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-indigo-500/10"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent mb-4">
            {t('common.dataResults')}
          </h2>
          <p className="text-xl text-gray-300">
            真实品牌数据验证，全面提升内容营销效果和品牌影响力
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className={`text-4xl font-bold ${stat.color} mb-2`}>
                {stat.number}
              </div>
              <div className="text-gray-300">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

export default function ContentSolution() {
  const { openModal } = useContactModal();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-900">
      <MarketingNav />
      <HeroSection />
      <CoreFeatures />
      <UseCases />
      <Results />
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-transparent to-indigo-500/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
            {t('cta.contentTitle')}
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            {t('cta.contentSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 border-0 shadow-lg shadow-purple-500/25 text-white font-semibold text-lg px-8 py-4"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                {t('hero.ctaFreeTrial')}
              </Button>
            </Link>
            <Button
              size="lg"
              onClick={() => openModal({
                title: t('modal.contentExpert'),
                description: t('modal.contentExpertDesc'),
              })}
              className="bg-transparent border-2 border-orange-500/80 text-orange-400 hover:bg-orange-500 hover:text-white backdrop-blur-sm text-lg px-8 py-4 font-bold shadow-lg shadow-orange-500/20 transition-all duration-300"
            >
              {t('hero.ctaContactExpert')}
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <MarketingFooter />
    </div>
  );
}
