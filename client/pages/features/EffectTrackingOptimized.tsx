import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Target,
  ArrowRight,
  Sparkles,
  TrendingUp,
  BarChart3,
  PieChart,
  Calculator,
  Eye,
  Filter,
  Calendar,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MarketingNav from "@/components/MarketingNav";
import MarketingFooter from "@/components/MarketingFooter";
import { useContactModal } from "@/contexts/ContactModalContext";

// 抽取英雄区域组件
const HeroSection = React.memo(() => {
  const { openModal } = useContactModal();
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section className="relative bg-gradient-to-br from-gray-900 via-red-900 to-orange-900 py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="p-6 bg-gradient-to-r from-red-500 to-orange-600 rounded-full shadow-lg shadow-red-500/50">
              <Target className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-red-400 to-orange-400 bg-clip-text text-transparent">
            {t('hero.effectTrackingTitle')}
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            {t('hero.effectTrackingDescription')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/auth')}
              className="text-lg px-8 py-4 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 border-0 shadow-lg shadow-red-500/25 text-white font-semibold"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              {t('hero.ctaPrimary')}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => openModal({
                title: t('modal.effectTrackingDemo'),
                description: t('modal.effectTrackingDemoDesc'),
              })}
              className="text-lg px-8 py-4 border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white bg-orange-500/10 backdrop-blur-sm shadow-lg shadow-orange-500/20 transition-all duration-300"
            >
              {t('hero.ctaSecondary')}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
});

// 核心功能数据
const features = [
  {
    icon: <BarChart3 className="h-8 w-8 text-blue-400" />,
    title: "effectTracking.features.fullTrackingTitle",
    description: "effectTracking.features.fullTrackingDescription",
    benefits: [
      'effectTracking.features.fullTrackingBenefits.analysis',
      'effectTracking.features.fullTrackingBenefits.tracking',
      'effectTracking.features.fullTrackingBenefits.comparison',
      'effectTracking.features.fullTrackingBenefits.visualization',
    ],
  },
  {
    icon: <Calculator className="h-8 w-8 text-green-400" />,
    title: "effectTracking.features.roiCalculationTitle",
    description: "effectTracking.features.roiCalculationDescription",
    benefits: [
      'effectTracking.features.roiCalculationBenefits.accounting',
      'effectTracking.features.roiCalculationBenefits.benefits',
      'effectTracking.features.roiCalculationBenefits.ROI',
      'effectTracking.features.roiCalculationBenefits.recommendations',
    ],
  },
  {
    icon: <TrendingUp className="h-8 w-8 text-purple-400" />,
    title: "effectTracking.features.predictionModelTitle",
    description: "effectTracking.features.predictionModelDescription",
    benefits: [
      'effectTracking.features.predictionModelBenefits.prediction',
      'effectTracking.features.predictionModelBenefits.seasonality',
      'effectTracking.features.predictionModelBenefits.model',
      'effectTracking.features.predictionModelBenefits.optimization',
    ],
  },
  {
    icon: <PieChart className="h-8 w-8 text-orange-400" />,
    title: "effectTracking.features.multiDimensionTitle",
    description: "effectTracking.features.multiDimensionDescription",
    benefits: [
      'effectTracking.features.multiDimensionBenefits.report',
      'effectTracking.features.multiDimensionBenefits.dimensions',
      'effectTracking.features.multiDimensionBenefits.drillDown',
      'effectTracking.features.multiDimensionBenefits.scheduled',
    ],
  },
];

// 核心功能区域组件
const CoreFeaturesSection = React.memo(() => {
  const { t } = useTranslation();

  return (
  <section className="py-20 bg-gradient-to-b from-gray-800 to-gray-900 relative">
    <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-orange-500/5"></div>
    <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">{t('features.title')}</h2>
        <p className="text-xl text-gray-400">{t('features.subtitle')}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {features.map((feature, index) => (
          <Card
            key={index}
            className="h-full bg-gray-800/50 border-gray-700 hover:border-red-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/10 backdrop-blur-sm"
          >
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg border border-gray-600 mr-4">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-semibold text-white">
                  {t(feature.title)}
                </h3>
              </div>
              <p className="text-gray-300 mb-6 text-lg">
                {t(feature.description)}
              </p>
              <ul className="space-y-3">
                {feature.benefits.map((benefit: string, idx: number) => (
                  <li key={idx} className="flex items-center text-gray-300">
                    <CheckCircle className="h-5 w-5 text-red-400 mr-3" />
                    {t(benefit)}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
  );
});

// 简化的优势列���组件
const AdvantagesSection = React.memo(() => {
  const { openModal } = useContactModal();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const advantages = [
    "跨平台数据整合",
    "实时效果监控",
    "智能归因分析",
    "多维度报表分析",
    "预测洞察",
    "自动化报告生成",
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-red-900 via-orange-900 to-yellow-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-transparent to-orange-500/20"></div>
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
          {t('effectTracking.advantages.title')}
        </h2>
        <p className="text-xl text-gray-300 mb-8">{t('effectTracking.advantages.subtitle')}</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {advantages.map((advantage, index) => (
            <div key={index} className="flex items-center text-white">
              <CheckCircle className="h-5 w-5 mr-2 text-red-400" />
              <span>{advantage}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={() => navigate('/auth')}
            className="bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 border-0 shadow-lg shadow-red-500/25 text-white font-semibold text-lg px-8 py-4"
          >
            <Target className="mr-2 h-5 w-5" />
            {t('effectTracking.advantages.ctaStart')}
          </Button>
          <Button
            size="lg"
            onClick={() => openModal({
              title: t('modal.effectTrackingProductDemo'),
              description: t('modal.effectTrackingProductDemoDesc'),
            })}
            className="bg-transparent border-2 border-orange-500/80 text-orange-400 hover:bg-orange-500 hover:text-white backdrop-blur-sm text-lg px-8 py-4 font-bold shadow-lg shadow-orange-500/20 transition-all duration-300"
          >
            {t('effectTracking.advantages.ctaDemo')}
          </Button>
        </div>
      </div>
    </section>
  );
});

export default function EffectTrackingOptimized() {
  const { t } = useTranslation();
  const { openModal } = useContactModal();

  return (
    <div className="min-h-screen bg-gray-900">
      {/* 导航栏 */}
      <MarketingNav />

      {/* 英雄区域 - 立即加载 */}
      <HeroSection />

      {/* 核心功能 - 立即加载 */}
      <CoreFeaturesSection />

      {/* 技术架构 */}
      <section className="py-20 bg-gradient-to-br from-black to-gray-900 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-transparent to-orange-500/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent mb-4">{t('effectTracking.architecture.title')}</h2>
            <p className="text-xl text-gray-400">
              {t('effectTracking.architecture.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">
                {t('effectTracking.architecture.platformCapacity')}
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-400 mb-2">
                    100万+
                  </div>
                  <div className="text-gray-300">{t('effectTracking.architecture.dailyEvents')}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-400 mb-2">
                    99.9%
                  </div>
                  <div className="text-gray-300">{t('effectTracking.architecture.dataAccuracy')}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">
                    &lt;1s
                  </div>
                  <div className="text-gray-300">{t('effectTracking.architecture.realTimeResponse')}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-400 mb-2">
                    300%
                  </div>
                  <div className="text-gray-300">{t('effectTracking.architecture.roiImprovement')}</div>
                </div>
              </div>
            </div>
            <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700 backdrop-blur-sm">
              <h4 className="text-xl font-semibold text-white mb-4">
                {t('effectTracking.architecture.trackingMetrics')}
              </h4>
              <div className="space-y-3">
                {[t('effectTracking.architecture.conversionRate'), t('stats.adROIIncrease'), t('effectTracking.architecture.customerAcquisitionCost'), t('effectTracking.architecture.lifetimeValue')].map(
                  (metric, index) => (
                    <div key={index} className="flex items-center">
                      <BarChart3 className="h-5 w-5 text-red-400 mr-3" />
                      <span className="text-gray-300">{metric}</span>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA区域 */}
      <AdvantagesSection />

      {/* Footer */}
      <MarketingFooter />
    </div>
  );
}
