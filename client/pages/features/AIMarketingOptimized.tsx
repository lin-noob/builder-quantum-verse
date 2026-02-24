import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Bot,
  ArrowRight,
  Sparkles,
  Brain,
  Target,
  Zap,
  MessageSquare,
  CheckCircle,
  BarChart3,
  PlayCircle,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MarketingNav from "@/components/MarketingNav";
import MarketingFooter from "@/components/MarketingFooter";
import FeatureCard from "@/components/FeatureCard";
import { useContactModal } from "@/contexts/ContactModalContext";

// 英雄区域组件 - AI科技风格
const HeroSection = React.memo(() => {
  const { openModal } = useContactModal();
  const { t } = useTranslation();

  return (
    <section className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 py-20 overflow-hidden">
      {/* 背景网格效果 */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.1) 0%, transparent 50%),\n                          linear-gradient(90deg, rgba(16, 185, 129, 0.03) 1px, transparent 1px),\n                          linear-gradient(rgba(16, 185, 129, 0.03) 1px, transparent 1px)`,
            backgroundSize: "200px 200px, 50px 50px, 50px 50px",
          }}
        />
      </div>

      {/* 动效 */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="p-6 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full shadow-lg shadow-cyan-500/50">
              <Bot className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-cyan-400 to-blue-400 bg-clip-text text-transparent">
            {t("aimarketingOptimized.hero.title")}
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            {t("aimarketingOptimized.hero.description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button
                size="lg"
                className="text-lg px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 border-0 shadow-lg shadow-cyan-500/25 text-white font-semibold"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                {t("aimarketingOptimized.hero.ctaPrimary")}
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              onClick={() =>
                openModal({
                  title: t("aimarketingOptimized.hero.modalDemoTitle"),
                  description: t("aimarketingOptimized.hero.modalDemoDesc"),
                })
              }
              className="text-lg px-8 py-4 border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white bg-purple-500/10 backdrop-blur-sm shadow-lg shadow-purple-500/20 transition-all duration-300"
            >
              <PlayCircle className="mr-2 h-5 w-5" />
              {t("aimarketingOptimized.hero.ctaSecondary")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
});

// 核心能力组件 - AI科技风格
const CoreFeaturesSection = React.memo(({ features }: { features: any[] }) => {
  const { t } = useTranslation();
  return (
    <section className="py-20 bg-gradient-to-b from-gray-800 to-gray-900 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
            {t("aimarketingOptimized.coreFeatures.title")}
          </h2>
          <p className="text-xl text-gray-400">
            {t("aimarketingOptimized.coreFeatures.subtitle")}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
});

// 应用场景组件
const UseCasesSection = React.memo(() => {
  const { t } = useTranslation();

  const useCases = [
    {
      scenario: t("aimarketingOptimized.useCases.cases.cartRecovery.scenario"),
      aiAction: t("aimarketingOptimized.useCases.cases.cartRecovery.aiAction"),
      result: t("aimarketingOptimized.useCases.cases.cartRecovery.result"),
    },
    {
      scenario: t("aimarketingOptimized.useCases.cases.newUserWelcome.scenario"),
      aiAction: t("aimarketingOptimized.useCases.cases.newUserWelcome.aiAction"),
      result: t("aimarketingOptimized.useCases.cases.newUserWelcome.result"),
    },
    {
      scenario: t("aimarketingOptimized.useCases.cases.memberUpgrade.scenario"),
      aiAction: t("aimarketingOptimized.useCases.cases.memberUpgrade.aiAction"),
      result: t("aimarketingOptimized.useCases.cases.memberUpgrade.result"),
    },
  ];

  return (
    <div className="space-y-8">
      {useCases.map((useCase, index) => (
        <Card
          key={index}
          className="overflow-hidden bg-gray-800/50 border-gray-700 hover:border-cyan-500/40 transition-all duration-300 backdrop-blur-sm"
        >
          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {useCase.scenario}
                </h3>
              </div>
              <div>
                <h4 className="text-lg font-medium text-cyan-400 mb-3">
                  {t("aimarketingOptimized.useCases.aiAutoProcessing")}
                </h4>
                <p className="text-gray-300">{useCase.aiAction}</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-full mb-4">
                  <BarChart3 className="h-8 w-8 text-green-400" />
                </div>
                <p className="text-2xl font-bold text-green-400">{useCase.result}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});

// CTA区域组件 - AI科技风格
const CTASection = React.memo(() => {
  const { openModal } = useContactModal();
  const { t } = useTranslation();

  const advantages = [
    t("aimarketingOptimized.advantages.list.fullTime"),
    t("aimarketingOptimized.advantages.list.msResponse"),
    t("aimarketingOptimized.advantages.list.personalized"),
    t("aimarketingOptimized.advantages.list.autoABTest"),
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* 背景动效 */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            {t("aimarketingOptimized.cta.title")}
          </span>
        </h2>
        <p className="text-xl text-gray-300 mb-8 leading-relaxed">
          {t("aimarketingOptimized.cta.subtitle")}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {advantages.map((advantage, index) => (
            <div key={index} className="flex items-center text-gray-300 justify-center md:justify-start">
              <CheckCircle className="h-5 w-5 mr-2 text-cyan-400" />
              <span>{advantage}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/auth">
            <Button
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-lg px-8 py-4 shadow-lg shadow-cyan-500/25 border-0"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              {t("aimarketingOptimized.cta.startNow")}
            </Button>
          </Link>
          <Button
            size="lg"
            variant="outline"
            onClick={() =>
              openModal({
                title: t("aimarketingOptimized.cta.modalContactTitle"),
                description: t("aimarketingOptimized.cta.modalContactDesc"),
              })
            }
            className="border-green-500 text-green-400 hover:bg-green-500 hover:text-white bg-green-500/10 text-lg px-8 py-4 backdrop-blur-sm shadow-lg shadow-green-500/20 transition-all duration-300"
          >
            <Users className="mr-2 h-5 w-5" />
            {t("aimarketingOptimized.cta.contactExpert")}
          </Button>
        </div>
      </div>
    </section>
  );
});

export default function AIMarketingOptimized() {
  const { t } = useTranslation();

  // 核���功能数据 - AI科技风格
  const features = [
    {
      icon: <Brain className="h-8 w-8 text-cyan-400" />,
      title: t("aimarketingOptimized.coreFeatures.smartContentGeneration.title"),
      description: t("aimarketingOptimized.coreFeatures.smartContentGeneration.description"),
      benefits: [
        t("aimarketingOptimized.coreFeatures.smartContentGeneration.benefits.nlp"),
        t("aimarketingOptimized.coreFeatures.smartContentGeneration.benefits.personalizedCopy"),
        t("aimarketingOptimized.coreFeatures.smartContentGeneration.benefits.multiLanguage"),
        t("aimarketingOptimized.coreFeatures.smartContentGeneration.benefits.brandTone"),
      ],
    },
    {
      icon: <Target className="h-8 w-8 text-green-400" />,
      title: t("aimarketingOptimized.coreFeatures.preciseScenarioTrigger.title"),
      description: t("aimarketingOptimized.coreFeatures.preciseScenarioTrigger.description"),
      benefits: [
        t("aimarketingOptimized.coreFeatures.preciseScenarioTrigger.benefits.behaviorPrediction"),
        t("aimarketingOptimized.coreFeatures.preciseScenarioTrigger.benefits.timingOptimization"),
        t("aimarketingOptimized.coreFeatures.preciseScenarioTrigger.benefits.scenarioAdaptation"),
        t("aimarketingOptimized.coreFeatures.preciseScenarioTrigger.benefits.autoTrigger"),
      ],
    },
    {
      icon: <Zap className="h-8 w-8 text-purple-400" />,
      title: t("aimarketingOptimized.coreFeatures.strategyOptimization.title"),
      description: t("aimarketingOptimized.coreFeatures.strategyOptimization.description"),
      benefits: [
        t("aimarketingOptimized.coreFeatures.strategyOptimization.benefits.effectMonitoring"),
        t("aimarketingOptimized.coreFeatures.strategyOptimization.benefits.parameterTuning"),
        t("aimarketingOptimized.coreFeatures.strategyOptimization.benefits.abTesting"),
        t("aimarketingOptimized.coreFeatures.strategyOptimization.benefits.strategyEvolution"),
      ],
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-orange-400" />,
      title: t("aimarketingOptimized.coreFeatures.multiChannel.title"),
      description: t("aimarketingOptimized.coreFeatures.multiChannel.description"),
      benefits: [
        t("aimarketingOptimized.coreFeatures.multiChannel.benefits.channelIntegration"),
        t("aimarketingOptimized.coreFeatures.multiChannel.benefits.messageUnification"),
        t("aimarketingOptimized.coreFeatures.multiChannel.benefits.userJourney"),
        t("aimarketingOptimized.coreFeatures.multiChannel.benefits.effectAggregation"),
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* 导航栏 */}
      <MarketingNav />

      {/* 英雄区域 - 立即加载 */}
      <HeroSection />

      {/* 核心能力 - 立即加载 */}
      <CoreFeaturesSection features={features} />

      {/* 应用场景 */}
      <section className="py-20 bg-gray-900 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-blue-900/20 to-gray-900"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
              {t("aimarketingOptimized.useCases.sectionTitle")}
            </h2>
            <p className="text-xl text-gray-400">
              {t("aimarketingOptimized.useCases.sectionSubtitle")}
            </p>
          </div>
          <UseCasesSection />
        </div>
      </section>

      {/* 技术优势 */}
      <section className="py-20 bg-gradient-to-b from-gray-800 to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-6">
                {t("aimarketingOptimized.advantages.sectionTitle")}
              </h2>
              <p className="text-lg text-gray-300 mb-8">
                {t("aimarketingOptimized.advantages.sectionDesc")}
              </p>
            </div>
            <div className="bg-gray-800/50 border border-cyan-500/20 p-8 rounded-2xl backdrop-blur-sm hover:border-cyan-500/40 transition-colors duration-300">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-400 mb-2">99.9%</div>
                  <div className="text-gray-400">
                    {t("aimarketingOptimized.advantages.metrics.availability")}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">&lt;100ms</div>
                  <div className="text-gray-400">
                    {t("aimarketingOptimized.advantages.metrics.responseTime")}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">10亿+</div>
                  <div className="text-gray-400">
                    {t("aimarketingOptimized.advantages.metrics.dailyProcessing")}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">300%</div>
                  <div className="text-gray-400">
                    {t("aimarketingOptimized.advantages.metrics.avgImprovement")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA区域 */}
      <CTASection />

      {/* Footer */}
      <MarketingFooter />
    </div>
  );
}
