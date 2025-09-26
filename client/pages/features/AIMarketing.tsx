import { Link } from "react-router-dom";
import {
  Bot,
  CheckCircle,
  Brain,
  Target,
  Zap,
  BarChart3,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MarketingNav from "@/components/MarketingNav";
import { useTranslation } from "react-i18next";

export default function AIMarketing() {
  const { t } = useTranslation();

  const features = [
    {
      icon: <Brain className="h-8 w-8 text-blue-600" />,
      title: t("aimarketing.features.smartContentGeneration.title"),
      description: t("aimarketing.features.smartContentGeneration.description"),
      benefits: [
        t("aimarketing.features.smartContentGeneration.benefits.nlp"),
        t("aimarketing.features.smartContentGeneration.benefits.personalizedCopy"),
        t("aimarketing.features.smartContentGeneration.benefits.multiLanguage"),
        t("aimarketing.features.smartContentGeneration.benefits.brandTone"),
      ],
    },
    {
      icon: <Target className="h-8 w-8 text-green-600" />,
      title: t("aimarketing.features.preciseScenarioTrigger.title"),
      description: t("aimarketing.features.preciseScenarioTrigger.description"),
      benefits: [
        t("aimarketing.features.preciseScenarioTrigger.benefits.behaviorPrediction"),
        t("aimarketing.features.preciseScenarioTrigger.benefits.timingOptimization"),
        t("aimarketing.features.preciseScenarioTrigger.benefits.scenarioAdaptation"),
        t("aimarketing.features.preciseScenarioTrigger.benefits.autoTrigger"),
      ],
    },
    {
      icon: <Zap className="h-8 w-8 text-purple-600" />,
      title: t("aimarketing.features.strategyOptimization.title"),
      description: t("aimarketing.features.strategyOptimization.description"),
      benefits: [
        t("aimarketing.features.strategyOptimization.benefits.effectMonitoring"),
        t("aimarketing.features.strategyOptimization.benefits.parameterTuning"),
        t("aimarketing.features.strategyOptimization.benefits.abTesting"),
        t("aimarketing.features.strategyOptimization.benefits.strategyEvolution"),
      ],
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-orange-600" />,
      title: t("aimarketing.features.multiChannel.title"),
      description: t("aimarketing.features.multiChannel.description"),
      benefits: [
        t("aimarketing.features.multiChannel.benefits.channelIntegration"),
        t("aimarketing.features.multiChannel.benefits.messageUnification"),
        t("aimarketing.features.multiChannel.benefits.userJourney"),
        t("aimarketing.features.multiChannel.benefits.effectAggregation"),
      ],
    },
  ];

  const useCases = [
    {
      scenario: t("aimarketing.scenariosSection.cases.cartRecovery.scenario"),
      description: t("aimarketing.scenariosSection.cases.cartRecovery.description"),
      aiAction: t("aimarketing.scenariosSection.cases.cartRecovery.aiAction"),
      result: t("aimarketing.scenariosSection.cases.cartRecovery.result"),
    },
    {
      scenario: t("aimarketing.scenariosSection.cases.newUserWelcome.scenario"),
      description: t("aimarketing.scenariosSection.cases.newUserWelcome.description"),
      aiAction: t("aimarketing.scenariosSection.cases.newUserWelcome.aiAction"),
      result: t("aimarketing.scenariosSection.cases.newUserWelcome.result"),
    },
    {
      scenario: t("aimarketing.scenariosSection.cases.memberUpgrade.scenario"),
      description: t("aimarketing.scenariosSection.cases.memberUpgrade.description"),
      aiAction: t("aimarketing.scenariosSection.cases.memberUpgrade.aiAction"),
      result: t("aimarketing.scenariosSection.cases.memberUpgrade.result"),
    },
  ];

  const advantages = [
    t("aimarketing.advantagesSection.list.fullTime"),
    t("aimarketing.advantagesSection.list.msResponse"),
    t("aimarketing.advantagesSection.list.personalized"),
    t("aimarketing.advantagesSection.list.autoABTest"),
    t("aimarketing.advantagesSection.list.unifiedChannels"),
    t("aimarketing.advantagesSection.list.realTimeMonitoring"),
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* 导航栏 */}
      <MarketingNav />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-blue-600 rounded-full">
                <Bot className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {t("aimarketing.hero.title")}
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {t("aimarketing.hero.description")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4"
                >
                  <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  {t("aimarketing.hero.ctaPrimary")}
                </>
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8 py-4">
                {t("aimarketing.hero.ctaSecondary")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 核心能力 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t("aimarketing.featuresSection.title")}
            </h2>
            <p className="text-xl text-gray-600">
              {t("aimarketing.featuresSection.subtitle")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    {feature.icon}
                    <h3 className="text-2xl font-semibold text-gray-900 ml-4">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-6 text-lg">{feature.description}</p>
                  <ul className="space-y-3">
                    {feature.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center text-gray-600">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 应用场景 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t("aimarketing.scenariosSection.title")}
            </h2>
            <p className="text-xl text-gray-600">
              {t("aimarketing.scenariosSection.subtitle")}
            </p>
          </div>
          <div className="space-y-8">
            {useCases.map((useCase, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {useCase.scenario}
                      </h3>
                      <p className="text-gray-600">{useCase.description}</p>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-blue-600 mb-3">
                        {t("aimarketing.scenariosSection.aiAutoProcessing")}
                      </h4>
                      <p className="text-gray-600">{useCase.aiAction}</p>
                    </div>
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                        <BarChart3 className="h-8 w-8 text-green-600" />
                      </div>
                      <p className="text-2xl font-bold text-green-600">{useCase.result}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 技术优势 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                {t("aimarketing.advantagesSection.title")}
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                {t("aimarketing.advantagesSection.description")}
              </p>
              <ul className="space-y-4">
                {advantages.map((advantage, index) => (
                  <li key={index} className="flex items-center text-lg text-gray-600">
                    <CheckCircle className="h-6 w-6 text-blue-600 mr-4" />
                    {advantage}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-2xl">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">99.9%</div>
                  <div className="text-gray-600">
                    {t("aimarketing.advantagesSection.metrics.availability")}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">&lt;100ms</div>
                  <div className="text-gray-600">
                    {t("aimarketing.advantagesSection.metrics.responseTime")}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">10亿+</div>
                  <div className="text-gray-600">
                    {t("aimarketing.advantagesSection.metrics.dailyProcessing")}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">300%</div>
                  <div className="text-gray-600">
                    {t("aimarketing.advantagesSection.metrics.avgImprovement")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            {t("aimarketing.cta.title")}
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            {t("aimarketing.cta.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4"
              >
                <>
                <Sparkles className="mr-2 h-5 w-5" />
                {t("aimarketing.cta.startNow")}
              </>
              </Button>
            </Link>
            <Button
              size="lg"
              className="bg-white text-blue-600 border-2 border-white hover:bg-blue-50 hover:text-blue-700 text-lg px-8 py-4 font-bold shadow-lg"
            >
              {t("aimarketing.cta.contactExpert")}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
