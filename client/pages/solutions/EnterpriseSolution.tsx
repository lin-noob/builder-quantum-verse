import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Building,
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
  Briefcase,
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
    <section className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-cyan-900 py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="p-6 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full shadow-lg shadow-blue-500/50">
              <Building className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-400 to-cyan-400 bg-clip-text text-transparent">
            {t('enterpriseSolution.hero.title')}
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            {t('enterpriseSolution.hero.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => openModal({
                title: t('enterpriseSolution.hero.modalTitle'),
                description: t('enterpriseSolution.hero.modalDesc'),
              })}
              className="text-lg px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 border-0 shadow-lg shadow-blue-500/25 text-white font-semibold"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              {t('hero.ctaPrimary')}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => openModal({
                title: t('enterpriseSolution.hero.modalTitle'),
                description: t('enterpriseSolution.hero.modalDesc'),
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
      icon: <Target className="h-8 w-8 text-blue-400" />,
      title: t('enterpriseSolution.features.items.preciseLeads.title'),
      description: t('enterpriseSolution.features.items.preciseLeads.description'),
    },
    {
      icon: <Brain className="h-8 w-8 text-cyan-400" />,
      title: t('enterpriseSolution.features.items.salesOptimization.title'),
      description: t('enterpriseSolution.features.items.salesOptimization.description'),
    },
    {
      icon: <Users className="h-8 w-8 text-purple-400" />,
      title: t('enterpriseSolution.features.items.customerSuccess.title'),
      description: t('enterpriseSolution.features.items.customerSuccess.description'),
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-orange-400" />,
      title: t('enterpriseSolution.features.items.marketingAnalytics.title'),
      description: t('enterpriseSolution.features.items.marketingAnalytics.description'),
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-800 to-gray-900 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-cyan-500/5"></div>
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
            {t('enterpriseSolution.features.title')}
          </h2>
          <p className="text-xl text-gray-400">
            {t('enterpriseSolution.features.subtitle')}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="h-full bg-gray-800/50 border-gray-700 hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 backdrop-blur-sm">
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
      title: t('enterpriseSolution.useCases.cases.saasMarketing.title'),
      description: t('enterpriseSolution.useCases.cases.saasMarketing.description'),
      features: [
        t('enterpriseSolution.useCases.cases.saasMarketing.features.freeTrialOptimization'),
        t('enterpriseSolution.useCases.cases.saasMarketing.features.paidConversionStrategy'),
        t('enterpriseSolution.useCases.cases.saasMarketing.features.productUsageAnalysis'),
        t('enterpriseSolution.useCases.cases.saasMarketing.features.customerLifecycleManagement'),
      ],
    },
    {
      title: t('enterpriseSolution.useCases.cases.enterpriseSolutionSales.title'),
      description: t('enterpriseSolution.useCases.cases.enterpriseSolutionSales.description'),
      features: [
        t('enterpriseSolution.useCases.cases.enterpriseSolutionSales.features.decisionChainAnalysis'),
        t('enterpriseSolution.useCases.cases.enterpriseSolutionSales.features.solutionCustomization'),
        t('enterpriseSolution.useCases.cases.enterpriseSolutionSales.features.salesProcessManagement'),
        t('enterpriseSolution.useCases.cases.enterpriseSolutionSales.features.customerRelationshipMaintenance'),
      ],
    },
    {
      title: t('enterpriseSolution.useCases.cases.professionalServicesMarketing.title'),
      description: t('enterpriseSolution.useCases.cases.professionalServicesMarketing.description'),
      features: [
        t('enterpriseSolution.useCases.cases.professionalServicesMarketing.features.professionalContentMarketing'),
        t('enterpriseSolution.useCases.cases.professionalServicesMarketing.features.industryInfluenceBuilding'),
        t('enterpriseSolution.useCases.cases.professionalServicesMarketing.features.customerCasePromotion'),
        t('enterpriseSolution.useCases.cases.professionalServicesMarketing.features.wordOfMouthManagement'),
      ],
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-900 to-black relative">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-blue-500/5"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-4">{t('enterpriseSolution.useCases.title')}</h2>
          <p className="text-xl text-gray-400">
            {t('enterpriseSolution.useCases.subtitle')}
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {cases.map((useCase, index) => (
            <Card key={index} className="h-full bg-gray-800/50 border-gray-700 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-white mb-3">
                  {useCase.title}
                </h3>
                <p className="text-gray-300 mb-4">{useCase.description}</p>
                <div className="space-y-2">
                  {useCase.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center text-sm text-gray-300">
                      <CheckCircle className="h-4 w-4 text-cyan-400 mr-2" />
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
    { number: "72%", label: t('stats.leadQualityIncrease'), color: "text-blue-400" },
    { number: "58%", label: t('stats.salesCycleShortened'), color: "text-cyan-400" },
    { number: "64%", label: t('stats.customerRenewalRateIncrease'), color: "text-purple-400" },
    { number: "89%", label: t('stats.customerSatisfaction'), color: "text-orange-400" },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-800 to-gray-900 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-cyan-500/10"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            {t('enterpriseSolution.results.title')}
          </h2>
          <p className="text-xl text-gray-300">
            {t('enterpriseSolution.results.subtitle')}
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

export default function EnterpriseSolution() {
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
      <section className="py-20 bg-gradient-to-br from-blue-900 via-cyan-900 to-teal-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-transparent to-cyan-500/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
            {t('enterpriseSolution.cta.title')}
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            {t('enterpriseSolution.cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => openModal({
                title: t('hero.ctaFreeTrial'),
                description: t('enterpriseSolution.hero.modalDesc'),
              })}
              className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 border-0 shadow-lg shadow-blue-500/25 text-white font-semibold text-lg px-8 py-4"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              {t('hero.ctaFreeTrial')}
            </Button>
            <Button
              size="lg"
              onClick={() => openModal({
                title: t('enterpriseSolution.modal.expertTitle'),
                description: t('enterpriseSolution.modal.expertDesc'),
              })}
              className="bg-transparent border-2 border-cyan-500/80 text-cyan-400 hover:bg-cyan-500 hover:text-white backdrop-blur-sm text-lg px-8 py-4 font-bold shadow-lg shadow-cyan-500/20 transition-all duration-300"
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
