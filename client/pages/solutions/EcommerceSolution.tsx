import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ShoppingCart,
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
  Heart,
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
  <section className="relative bg-gradient-to-br from-gray-900 via-orange-900 to-red-900 py-20 overflow-hidden">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="p-6 bg-gradient-to-r from-orange-500 to-red-600 rounded-full shadow-lg shadow-orange-500/50">
            <ShoppingCart className="h-12 w-12 text-white" />
          </div>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-orange-400 to-red-400 bg-clip-text text-transparent">
          {t('hero.ecommerceTitle')}
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
          {t('hero.ecommerceDescription')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={() => navigate('/auth')}
            className="text-lg px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 border-0 shadow-lg shadow-orange-500/25 text-white font-semibold"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            {t('hero.ctaPrimary')}
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => openModal({
              title: t('modal.ecommerceDemo'),
              description: t('modal.ecommerceDemoDesc'),
            })}
            className="text-lg px-8 py-4 border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white bg-purple-500/10 backdrop-blur-sm shadow-lg shadow-purple-500/20 transition-all duration-300"
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
      icon: <Brain className="h-8 w-8 text-orange-400" />,
      title: t('features.intelligentRecommendation'),
      description: t('features.intelligentRecommendationDesc'),
    },
    {
      icon: <Target className="h-8 w-8 text-red-400" />,
      title: t('features.preciseMarketing'),
      description: t('features.preciseMarketingDesc'),
    },
    {
      icon: <Users className="h-8 w-8 text-cyan-400" />,
      title: t('features.userBehaviorAnalysis'),
      description: t('features.userBehaviorAnalysisDesc'),
    },
    {
      icon: <Heart className="h-8 w-8 text-purple-400" />,
      title: t('features.customerLoyalty'),
      description: t('features.customerLoyaltyDesc'),
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-800 to-gray-900 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-red-500/5"></div>
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
            {t('features.title')}
          </h2>
          <p className="text-xl text-gray-400">
            {t('features.subtitle')}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="h-full bg-gray-800/50 border-gray-700 hover:border-orange-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/10 backdrop-blur-sm">
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
  const { t } = useTranslation();
  const cases = [
    {
      title: "个性化推荐",
      description: "基于用户浏览历史和购买偏好，实时推荐相关商品，提升交叉销售",
      features: ["协同过滤算法", "内容推荐引擎", "实时个性化", "A/B测试优化"],
    },
    {
      title: "购物车挽回",
      description: "智能识别购物车放弃行为，通过邮件、短信等方式精准挽回客户",
      features: ["��为预测模型", "多渠道触达", "个性化优惠", "最佳时机推送"],
    },
    {
      title: t('useCases.pricingOptimization'),
      description: t('useCases.pricingOptimizationDesc'),
      features: [t('useCases.competitorPriceMonitoring'), t('useCases.dynamicPricing'), t('useCases.promotionOptimization'), t('useCases.inventoryManagement')],
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-900 to-black relative">
      <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-orange-500/5"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent mb-4">{t('common.applicationScenarios')}</h2>
          <p className="text-xl text-gray-400">
            {t('useCases.ecommerceSubtitle')}
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {cases.map((useCase, index) => (
            <Card key={index} className="h-full bg-gray-800/50 border-gray-700 hover:border-red-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/10 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-white mb-3">
                  {useCase.title}
                </h3>
                <p className="text-gray-300 mb-4">{useCase.description}</p>
                <div className="space-y-2">
                  {useCase.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center text-sm text-gray-300">
                      <CheckCircle className="h-4 w-4 text-orange-400 mr-2" />
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
    { number: "68%", label: t('stats.averageConversionIncrease'), color: "text-orange-400" },
    { number: "42%", label: t('stats.cartRecoveryRate'), color: "text-red-400" },
    { number: "56%", label: t('stats.customerRetentionImprovement'), color: "text-purple-400" },
    { number: "73%", label: t('stats.adROIIncrease'), color: "text-cyan-400" },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-800 to-gray-900 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-red-500/10"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-4">
            {t('common.dataResults')}
          </h2>
          <p className="text-xl text-gray-300">
            {t('results.ecommerceSubtitle')}
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

export default function EcommerceSolution() {
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
      <section className="py-20 bg-gradient-to-br from-orange-900 via-red-900 to-pink-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-transparent to-red-500/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
            {t('cta.ecommerceTitle')}
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            {t('cta.ecommerceSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 border-0 shadow-lg shadow-orange-500/25 text-white font-semibold text-lg px-8 py-4"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                {t('hero.ctaFreeTrial')}
              </Button>
            </Link>
            <Button
              size="lg"
              onClick={() => openModal({
                title: t('modal.ecommerceExpert'),
                description: t('modal.ecommerceExpertDesc'),
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
