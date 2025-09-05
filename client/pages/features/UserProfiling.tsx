import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Users,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Brain,
  Target,
  BarChart3,
  Eye,
  TrendingUp,
  Layers,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MarketingNav from "@/components/MarketingNav";
import MarketingFooter from "@/components/MarketingFooter";
import { useContactModal } from "@/contexts/ContactModalContext";

export default function UserProfiling() {
  const navigate = useNavigate();
  const { openModal } = useContactModal();
  const { t } = useTranslation();
  
  const features = [
    {
      icon: <Eye className="h-8 w-8 text-cyan-400" />,
      title: t('features.userProfilingBenefits.fullProfile'),
      description: t('features.userProfilingDescription'),
      benefits: [
        t('features.userProfilingBenefits.behaviorAnalysis'),
        t('userProfilingExtended.multiDimension'),
        t('userProfilingExtended.interestMining'),
        t('userProfilingExtended.consumptionEvaluation'),
      ],
    },
    {
      icon: <Layers className="h-8 w-8 text-green-400" />,
      title: t('features.userProfilingBenefits.valueSegmentation'),
      description: t('userProfilingExtended.valueSegmentationDesc'),
      benefits: [t('userProfilingExtended.rfmAnalysis'), t('userProfilingExtended.lifecycleSegmentation'), t('userProfilingExtended.interestTagGrouping'), t('userProfilingExtended.behaviorClustering')],
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-purple-400" />,
      title: t('userProfilingExtended.predictiveAnalysisEngine'),
      description: t('userProfilingExtended.predictiveAnalysisEngineDesc'),
      benefits: [
        t('userProfilingExtended.churnRiskWarning'),
        t('userProfilingExtended.purchaseIntentPrediction'),
        t('userProfilingExtended.valueTrendAnalysis'),
        t('userProfilingExtended.repurchaseProbability'),
      ],
    },
    {
      icon: <Search className="h-8 w-8 text-orange-400" />,
      title: t('userProfilingExtended.realTimeProfileUpdate'),
      description: t('userProfilingExtended.realTimeProfileUpdateDesc'),
      benefits: [
        t('userProfilingExtended.realTimeDataCollection'),
        t('userProfilingExtended.incrementalUpdate'),
        t('userProfilingExtended.abnormalBehaviorMonitoring'),
        t('userProfilingExtended.profileAccuracyValidation'),
      ],
    },
  ];

  const dataTypes = [
    {
      category: t('dataAnalysis.basicAttributes'),
      items: [t('dataAnalysis.ageGenderLocation'), t('dataAnalysis.occupationIncome'), t('dataAnalysis.educationBackground'), t('dataAnalysis.familyStructure')],
    },
    {
      category: t('dataAnalysis.behaviorData'),
      items: [t('dataAnalysis.browsingTrajectory'), t('dataAnalysis.purchaseHistory'), t('dataAnalysis.interactionBehavior'), t('dataAnalysis.usageHabits')],
    },
    {
      category: t('dataAnalysis.preferenceFeatures'),
      items: [t('dataAnalysis.productPreference'), t('dataAnalysis.priceSensitivity'), t('dataAnalysis.brandTendency'), t('dataAnalysis.channelPreference')],
    },
    {
      category: t('dataAnalysis.valueIndicators'),
      items: [t('dataAnalysis.consumptionCapacity'), t('dataAnalysis.activityLevel'), t('dataAnalysis.loyalty'), t('dataAnalysis.influence')],
    },
  ];

  const applications = [
    {
      title: t('applicationScenarios.preciseRecommendation'),
      description: t('applicationScenarios.preciseRecommendationDesc'),
      metrics: t('applicationScenarios.preciseRecommendationMetrics'),
    },
    {
      title: t('applicationScenarios.targetedMarketing'),
      description: t('applicationScenarios.targetedMarketingDesc'),
      metrics: t('applicationScenarios.targetedMarketingMetrics'),
    },
    {
      title: t('applicationScenarios.userOperation'),
      description: t('applicationScenarios.userOperationDesc'),
      metrics: t('applicationScenarios.userOperationMetrics'),
    },
    {
      title: t('applicationScenarios.productOptimization'),
      description: t('applicationScenarios.productOptimizationDesc'),
      metrics: t('applicationScenarios.productOptimizationMetrics'),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* 导航栏 */}
      <MarketingNav />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-lg shadow-green-500/50">
                <Users className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-green-400 to-emerald-400 bg-clip-text text-transparent">
              {t('hero.userProfilingTitle')}
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              {t('hero.userProfilingDescription')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate('/auth')}
                className="text-lg px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 border-0 shadow-lg shadow-green-500/25 text-white font-semibold"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                {t('hero.ctaPrimary')}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => openModal({
                  title: t('modal.userProfilingDemo'),
                  description: t('modal.userProfilingDemoDesc'),
                })}
                className="text-lg px-8 py-4 border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-white bg-cyan-500/10 backdrop-blur-sm shadow-lg shadow-cyan-500/20 transition-all duration-300"
              >
                {t('hero.ctaSecondary')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 核心功能 */}
      <section className="py-20 bg-gradient-to-b from-gray-800 to-gray-900 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-emerald-500/5"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">{t('features.title')}</h2>
            <p className="text-xl text-gray-400">{t('features.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="h-full bg-gray-800/50 border-gray-700 hover:border-green-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/10 backdrop-blur-sm"
              >
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="p-3 bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg border border-gray-600 mr-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-2xl font-semibold text-white">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-gray-300 mb-6 text-lg">
                    {feature.description}
                  </p>
                  <ul className="space-y-3">
                    {feature.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center text-gray-300">
                        <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
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

      {/* 数据维度 */}
      <section className="py-20 bg-gradient-to-b from-gray-900 to-black relative">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-green-500/5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent mb-4">
              {t('dataAnalysis.title')}
            </h2>
            <p className="text-xl text-gray-400">{t('dataAnalysis.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {dataTypes.map((dataType, index) => (
              <Card key={index} className="h-full bg-gray-800/30 border-gray-700 hover:border-cyan-500/50 transition-all duration-300 backdrop-blur-sm hover:shadow-xl hover:shadow-cyan-500/10">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 text-center">
                    {dataType.category}
                  </h3>
                  <ul className="space-y-3">
                    {dataType.items.map((item, idx) => (
                      <li key={idx} className="flex items-center text-gray-300">
                        <Target className="h-4 w-4 text-cyan-400 mr-3" />
                        {item}
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
      <section className="py-20 bg-gradient-to-b from-gray-800 to-gray-900 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-emerald-500/5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-emerald-400 bg-clip-text text-transparent mb-4">{t('applicationScenarios.title')}</h2>
            <p className="text-xl text-gray-400">
              {t('applicationScenarios.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {applications.map((app, index) => (
              <Card
                key={index}
                className="bg-gray-800/50 border-gray-700 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 backdrop-blur-sm"
              >
                <CardContent className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-3">
                        {app.title}
                      </h3>
                      <p className="text-gray-300 mb-4">{app.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-400">
                        {app.metrics}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center text-purple-400">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    <span className="text-sm font-medium">{t('applicationScenarios.viewDetailedCase')}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 技术架构 */}
      <section className="py-20 bg-gradient-to-br from-black to-gray-900 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-transparent to-cyan-500/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent mb-6">
                {t('technicalArchitecture.title')}
              </h2>
              <p className="text-lg text-gray-300 mb-8">
                {t('technicalArchitecture.subtitle')}
              </p>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-green-500 to-cyan-500 rounded-lg flex items-center justify-center mr-4 shadow-lg shadow-green-500/25">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                      {t('technicalArchitecture.mlEngine')}
                    </h4>
                    <p className="text-gray-300">
                      {t('technicalArchitecture.mlEngineDesc')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center mr-4 shadow-lg shadow-cyan-500/25">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                      {t('technicalArchitecture.realTimeComputingPlatform')}
                    </h4>
                    <p className="text-gray-300">
                      {t('technicalArchitecture.realTimeComputingPlatformDesc')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-4 shadow-lg shadow-purple-500/25">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                      {t('technicalArchitecture.tagManagementSystem')}
                    </h4>
                    <p className="text-gray-300">
                      {t('technicalArchitecture.tagManagementSystemDesc')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700 backdrop-blur-sm">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">
                {t('technicalArchitecture.platformCapabilities')}
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {t('technicalArchitecture.tenMillionPlus')}
                  </div>
                  <div className="text-gray-300">{t('technicalArchitecture.userProfileProcessing')}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-400 mb-2">
                    {t('technicalArchitecture.fiveHundredPlus')}
                  </div>
                  <div className="text-gray-300">{t('technicalArchitecture.tagDimensions')}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">
                    {t('technicalArchitecture.secondLevel')}
                  </div>
                  <div className="text-gray-300">{t('technicalArchitecture.profileUpdateSpeed')}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-400 mb-2">
                    {t('technicalArchitecture.ninetyFivePercentPlus')}
                  </div>
                  <div className="text-gray-300">{t('technicalArchitecture.predictionAccuracy')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-green-900 via-emerald-900 to-cyan-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 via-transparent to-cyan-500/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
            {t('cta.userProfilingTitle')}
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            {t('cta.userProfilingSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button
                size="lg"
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 border-0 shadow-lg shadow-green-500/25 text-white font-semibold text-lg px-8 py-4"
              >
                <Users className="mr-2 h-5 w-5" />
                {t('common.getStarted')}
              </Button>
            </Link>
            <Button
              size="lg"
              onClick={() => openModal({
                title: t('common.scheduleDemo'),
                description: t('modal.userProfilingDemoDesc'),
              })}
              className="bg-transparent border-2 border-orange-500/80 text-orange-400 hover:bg-orange-500 hover:text-white backdrop-blur-sm text-lg px-8 py-4 font-bold shadow-lg shadow-orange-500/20 transition-all duration-300"
            >
              {t('common.scheduleDemo')}
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <MarketingFooter />
    </div>
  );
}