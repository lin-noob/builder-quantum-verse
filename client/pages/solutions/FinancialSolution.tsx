import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  DollarSign,
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
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MarketingNav from "@/components/MarketingNav";
import MarketingFooter from "@/components/MarketingFooter";
import { useContactModal } from "@/contexts/ContactModalContext";

// 英雄区域组件
const HeroSection = React.memo(() => {
  const { openModal } = useContactModal();
  const { t } = useTranslation();

  return (
    <section className="relative bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="p-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-lg shadow-green-500/50">
              <DollarSign className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-green-400 to-emerald-400 bg-clip-text text-transparent">
            {t('hero.financialTitle')}
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            {t('hero.financialDescription')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => openModal({
                title: t('modal.financialDemo'),
                description: t('modal.financialDemoDesc'),
              })}
              className="text-lg px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 border-0 shadow-lg shadow-green-500/25 text-white font-semibold"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              {t('hero.ctaPrimary')}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => openModal({
                title: t('modal.financialDemo'),
                description: t('modal.financialDemoDesc'),
              })}
              className="text-lg px-8 py-4 border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-white bg-emerald-500/10 backdrop-blur-sm shadow-lg shadow-emerald-500/20 transition-all duration-300"
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
      icon: <Shield className="h-8 w-8 text-green-400" />,
      title: t('features.financialCore.complianceTitle'),
      description: t('features.financialCore.complianceDescription'),
    },
    {
      icon: <Users className="h-8 w-8 text-blue-400" />,
      title: t('features.financialCore.preciseAcquisitionTitle'),
      description: t('features.financialCore.preciseAcquisitionDescription'),
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-purple-400" />,
      title: t('features.financialCore.valueEnhancementTitle'),
      description: t('features.financialCore.valueEnhancementDescription'),
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-red-400" />,
      title: t('features.financialCore.riskControlTitle'),
      description: t('features.financialCore.riskControlDescription'),
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-800 to-gray-900 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-emerald-500/5"></div>
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
            {t('features.title')}
          </h2>
          <p className="text-xl text-gray-400">
            合规安全的金融营销解决方案，提升获客质量和转化效果
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="h-full bg-gray-800/50 border-gray-700 hover:border-green-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/10 backdrop-blur-sm">
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
      title: "信贷产品营销",
      description: "基于客户征信和消费行为，智能推荐适合的信贷产品和额度",
      features: ["信用评估模型", "产品匹配算法", "风险控制机制", "个性化利率定价"],
    },
    {
      title: "理财产品推荐",
      description: "根据客户风险偏好和投资目标，推荐最适合的理财产品组合",
      features: ["风险画像分析", "产品组合优化", "投资建议生成", "收益预测模型"],
    },
    {
      title: "保险产品营销",
      description: "分析客户生命周期和保障需求，推荐合适的保险产品和保额",
      features: ["需求分析模型", "保险产品匹配", "保费优化建议", "理赔预测分析"],
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-900 to-black relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-green-500/5"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent mb-4">应用场景</h2>
          <p className="text-xl text-gray-400">
            覆盖金融产品全链路，提升营销精准度和合规性
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {cases.map((useCase, index) => (
            <Card key={index} className="h-full bg-gray-800/50 border-gray-700 hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-white mb-3">
                  {useCase.title}
                </h3>
                <p className="text-gray-300 mb-4">{useCase.description}</p>
                <div className="space-y-2">
                  {useCase.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center text-sm text-gray-300">
                      <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
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
    { number: "45%", label: t('stats.customerAcquisitionCostReduction'), color: "text-green-400" },
    { number: "38%", label: t('stats.conversionIncrease'), color: "text-blue-400" },
    { number: "55%", label: t('stats.customerValueGrowth'), color: "text-purple-400" },
    { number: "99%", label: t('stats.complianceGuarantee'), color: "text-red-400" },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-800 to-gray-900 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-transparent to-emerald-500/10"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-4">
            {t('common.dataResults')}
          </h2>
          <p className="text-xl text-gray-300">
            真实金融机构数据验证，营销效果与合规并重
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

export default function FinancialSolution() {
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
      <section className="py-20 bg-gradient-to-br from-green-900 via-emerald-900 to-cyan-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 via-transparent to-emerald-500/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
            {t('cta.financialTitle')}
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            {t('cta.financialSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => openModal({
                title: t('hero.ctaFreeTrial'),
                description: t('modal.financialDemoDesc'),
              })}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 border-0 shadow-lg shadow-green-500/25 text-white font-semibold text-lg px-8 py-4"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              {t('hero.ctaFreeTrial')}
            </Button>
            <Button
              size="lg"
              onClick={() => openModal({
                title: t('modal.financialExpert'),
                description: t('modal.financialExpertDesc'),
              })}
              className="bg-transparent border-2 border-emerald-500/80 text-emerald-400 hover:bg-emerald-500 hover:text-white backdrop-blur-sm text-lg px-8 py-4 font-bold shadow-lg shadow-emerald-500/20 transition-all duration-300"
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
