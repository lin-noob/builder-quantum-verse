import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Activity,
  ArrowRight,
  CheckCircle,
  Sparkles,
  AlertTriangle,
  BarChart3,
  Eye,
  Zap,
  Bell,
  Monitor,
  Clock,
  PlayCircle,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MarketingNav from "@/components/MarketingNav";
import MarketingFooter from "@/components/MarketingFooter";
import { useContactModal } from "@/contexts/ContactModalContext";

export default function RealTimeMonitoring() {
  const { openModal } = useContactModal();
  const { t } = useTranslation();

  const features = [
    {
      icon: <Monitor className="h-8 w-8 text-blue-600" />,
      title: t('features.realTimeMonitoringBenefits.realTimeData'),
      description: t('realTimeMonitoringExtended.realTimeDataMonitoringDesc'),
      benefits: [
        t('realTimeMonitoringExtended.realTimeDataBenefits.realTimeDataSync'),
        t('realTimeMonitoringExtended.realTimeDataBenefits.multiDimensionMonitoring'),
        t('realTimeMonitoringExtended.realTimeDataBenefits.visualDataDisplay'),
        t('realTimeMonitoringExtended.realTimeDataBenefits.historicalTrendComparison'),
      ],
    },
    {
      icon: <AlertTriangle className="h-8 w-8 text-red-600" />,
      title: t('features.realTimeMonitoringBenefits.alerting'),
      description: t('realTimeMonitoringExtended.intelligentAlertingDesc'),
      benefits: [
        t('realTimeMonitoringExtended.intelligentAlertingBenefits.abnormalBehaviorRecognition'),
        t('realTimeMonitoringExtended.intelligentAlertingBenefits.intelligentThresholdSetting'),
        t('realTimeMonitoringExtended.intelligentAlertingBenefits.multiChannelAlertNotification'),
        t('realTimeMonitoringExtended.intelligentAlertingBenefits.alertStrategyConfiguration'),
      ],
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-green-600" />,
      title: t('features.realTimeMonitoringBenefits.optimization'),
      description: t('realTimeMonitoringExtended.performanceOptimizationDesc'),
      benefits: [
        t('realTimeMonitoringExtended.performanceOptimizationBenefits.performanceBottleneckAnalysis'),
        t('realTimeMonitoringExtended.performanceOptimizationBenefits.optimizationSuggestionGeneration'),
        t('realTimeMonitoringExtended.performanceOptimizationBenefits.abTestMonitoring'),
        t('realTimeMonitoringExtended.performanceOptimizationBenefits.effectPredictionModel')
      ],
    },
    {
      icon: <Zap className="h-8 w-8 text-purple-600" />,
      title: t('realTimeMonitoringExtended.automatedResponse'),
      description: t('realTimeMonitoringExtended.automatedResponseDesc'),
      benefits: [
        t('realTimeMonitoringExtended.automatedResponseBenefits.strategyAutoAdjustment'),
        t('realTimeMonitoringExtended.automatedResponseBenefits.emergencyResponseMechanism'),
        t('realTimeMonitoringExtended.automatedResponseBenefits.intelligentScaling'),
        t('realTimeMonitoringExtended.automatedResponseBenefits.loadBalanceOptimization')
      ],
    },
  ];

  const monitoringMetrics = [
    {
      category: t('realTimeMonitoringExtended.monitoringMetricsSystem.marketingEffectMetrics'),
      metrics: [
        t('realTimeMonitoringExtended.monitoringMetricsSystem.conversionRate'),
        t('realTimeMonitoringExtended.monitoringMetricsSystem.clickRate'),
        t('realTimeMonitoringExtended.monitoringMetricsSystem.costEffectiveness'),
        t('realTimeMonitoringExtended.monitoringMetricsSystem.roiRoas')
      ],
    },
    {
      category: t('realTimeMonitoringExtended.monitoringMetricsSystem.systemPerformanceMetrics'),
      metrics: [
        t('realTimeMonitoringExtended.monitoringMetricsSystem.responseTime'),
        t('realTimeMonitoringExtended.monitoringMetricsSystem.throughput'),
        t('realTimeMonitoringExtended.monitoringMetricsSystem.errorRate'),
        t('realTimeMonitoringExtended.monitoringMetricsSystem.availability')
      ],
    },
    {
      category: t('realTimeMonitoringExtended.monitoringMetricsSystem.userBehaviorMetrics'),
      metrics: [
        t('realTimeMonitoringExtended.monitoringMetricsSystem.activeUsers'),
        t('realTimeMonitoringExtended.monitoringMetricsSystem.userRetention'),
        t('realTimeMonitoringExtended.monitoringMetricsSystem.behaviorPath'),
        t('realTimeMonitoringExtended.monitoringMetricsSystem.usageDuration')
      ],
    },
    {
      category: t('realTimeMonitoringExtended.monitoringMetricsSystem.businessOperationMetrics'),
      metrics: [
        t('realTimeMonitoringExtended.monitoringMetricsSystem.orderVolume'),
        t('realTimeMonitoringExtended.monitoringMetricsSystem.revenue'),
        t('realTimeMonitoringExtended.monitoringMetricsSystem.customerUnitPrice'),
        t('realTimeMonitoringExtended.monitoringMetricsSystem.repurchaseRate')
      ],
    },
  ];

  const alertTypes = [
    {
      type: t('realTimeMonitoringExtended.intelligentAlertMechanism.performanceAbnormal'),
      description: t('realTimeMonitoringExtended.intelligentAlertMechanism.performanceAbnormalDesc'),
      response: t('realTimeMonitoringExtended.intelligentAlertMechanism.performanceAbnormalResponse'),
      icon: <Monitor className="h-6 w-6 text-red-500" />,
    },
    {
      type: t('realTimeMonitoringExtended.intelligentAlertMechanism.marketingEffectAbnormal'),
      description: t('realTimeMonitoringExtended.intelligentAlertMechanism.marketingEffectAbnormalDesc'),
      response: t('realTimeMonitoringExtended.intelligentAlertMechanism.marketingEffectAbnormalResponse'),
      icon: <BarChart3 className="h-6 w-6 text-orange-500" />,
    },
    {
      type: t('realTimeMonitoringExtended.intelligentAlertMechanism.userBehaviorAbnormal'),
      description: t('realTimeMonitoringExtended.intelligentAlertMechanism.userBehaviorAbnormalDesc'),
      response: t('realTimeMonitoringExtended.intelligentAlertMechanism.userBehaviorAbnormalResponse'),
      icon: <Eye className="h-6 w-6 text-blue-500" />,
    },
    {
      type: t('realTimeMonitoringExtended.intelligentAlertMechanism.businessMetricsAbnormal'),
      description: t('realTimeMonitoringExtended.intelligentAlertMechanism.businessMetricsAbnormalDesc'),
      response: t('realTimeMonitoringExtended.intelligentAlertMechanism.businessMetricsAbnormalResponse'),
      icon: <AlertTriangle className="h-6 w-6 text-purple-500" />,
    },
  ];

  const realTimeFeatures = [
    t('realTimeMonitoringExtended.technicalFeatures.millisecondDataUpdate'),
    t('realTimeMonitoringExtended.technicalFeatures.multiDimensionMetricMonitoring'),
    t('realTimeMonitoringExtended.technicalFeatures.intelligentAnomalyDetection'),
    t('realTimeMonitoringExtended.technicalFeatures.autoAlertNotification'),
    t('realTimeMonitoringExtended.technicalFeatures.visualDataDashboard'),
    t('realTimeMonitoringExtended.technicalFeatures.mobileRealTimeView'),
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* 导航栏 */}
      <MarketingNav />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-6 bg-gradient-to-r from-purple-500 to-violet-600 rounded-full shadow-lg shadow-purple-500/50">
                <Activity className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-purple-400 to-violet-400 bg-clip-text text-transparent">
              {t('hero.realTimeMonitoringTitle')}
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              {t('hero.realTimeMonitoringDescription')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button
                  size="lg"
                  className="text-lg px-8 py-4 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 border-0 shadow-lg shadow-purple-500/25 text-white font-semibold"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  {t('hero.ctaPrimary')}
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                onClick={() => openModal({
                  title: t('modal.realTimeMonitoringDemo'),
                  description: t('modal.realTimeMonitoringDemoDesc'),
                })}
                className="text-lg px-8 py-4 border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-white bg-cyan-500/10 backdrop-blur-sm shadow-lg shadow-cyan-500/20 transition-all duration-300"
              >
                <Monitor className="mr-2 h-5 w-5" />
                {t('hero.ctaViewDemo')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 核心功能 */}
      <section className="py-20 bg-gradient-to-b from-gray-800 to-gray-900 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-violet-500/5"></div>
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
                className="h-full bg-gray-800/50 border-gray-700 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 backdrop-blur-sm"
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
                        <CheckCircle className="h-5 w-5 text-purple-400 mr-3" />
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

      {/* 监控指标 */}
      <section className="py-20 bg-gradient-to-b from-gray-900 to-black relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
              {t('realTimeMonitoringExtended.monitoringMetricsSystem.title')}
            </h2>
            <p className="text-xl text-gray-400">{t('realTimeMonitoringExtended.monitoringMetricsSystem.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {monitoringMetrics.map((category, index) => (
              <Card key={index} className="h-full bg-gray-800/30 border-gray-700 hover:border-blue-500/50 transition-all duration-300 backdrop-blur-sm hover:shadow-xl hover:shadow-blue-500/10">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 text-center">
                    {category.category}
                  </h3>
                  <ul className="space-y-3">
                    {category.metrics.map((metric, idx) => (
                      <li key={idx} className="flex items-center text-gray-300">
                        <BarChart3 className="h-4 w-4 text-blue-400 mr-3" />
                        {metric}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 预警机制 */}
      <section className="py-20 bg-gradient-to-b from-gray-800 to-gray-900 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-orange-500/5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent mb-4">
              {t('realTimeMonitoringExtended.intelligentAlertMechanism.title')}
            </h2>
            <p className="text-xl text-gray-400">{t('realTimeMonitoringExtended.intelligentAlertMechanism.subtitle')}</p>
          </div>
          <div className="space-y-8">
            {alertTypes.map((alert, index) => (
              <Card
                key={index}
                className="bg-gray-800/50 border-gray-700 hover:border-orange-500/50 transition-all duration-300 overflow-hidden hover:shadow-2xl hover:shadow-orange-500/10 backdrop-blur-sm"
              >
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                    <div className="flex items-center">
                      <div className="p-3 bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg border border-gray-600 mr-4">
                        {alert.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                          {alert.type}
                        </h3>
                        <p className="text-gray-300">{alert.description}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-orange-400 mb-3">
                        {t('realTimeMonitoringExtended.intelligentAlertMechanism.autoResponseStrategy')}
                      </h4>
                      <p className="text-gray-300">{alert.response}</p>
                    </div>
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-full mb-4 border border-red-500/30">
                        <Bell className="h-8 w-8 text-red-400" />
                      </div>
                      <p className="text-sm text-red-400 font-medium">
                        {t('realTimeMonitoringExtended.intelligentAlertMechanism.instantNotification')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 技术特性 */}
      <section className="py-20 bg-gradient-to-br from-black to-gray-900 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-violet-500/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent mb-6">
                {t('realTimeMonitoringExtended.technicalFeatures.title')}
              </h2>
              <p className="text-lg text-gray-300 mb-8">
                {t('realTimeMonitoringExtended.technicalFeatures.subtitle')}
              </p>
              <ul className="space-y-4">
                {realTimeFeatures.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-center text-lg text-gray-300"
                  >
                    <CheckCircle className="h-6 w-6 text-purple-400 mr-4" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700 backdrop-blur-sm">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">
                {t('realTimeMonitoringExtended.technicalFeatures.monitoringCapabilities')}
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">
                    {t('realTimeMonitoringExtended.technicalFeatures.lessThan100ms')}
                  </div>
                  <div className="text-gray-300">{t('realTimeMonitoringExtended.technicalFeatures.dataLatency')}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-violet-400 mb-2">
                    {t('realTimeMonitoringExtended.technicalFeatures.ninetyNinePointNinePercent')}
                  </div>
                  <div className="text-gray-300">{t('realTimeMonitoringExtended.technicalFeatures.monitoringAccuracy')}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-400 mb-2">
                    {t('realTimeMonitoringExtended.technicalFeatures.tenMillionPlus')}
                  </div>
                  <div className="text-gray-300">{t('realTimeMonitoringExtended.technicalFeatures.dailyEventProcessing')}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-400 mb-2">
                    {t('realTimeMonitoringExtended.technicalFeatures.sevenTwentyFour')}
                  </div>
                  <div className="text-gray-300">{t('realTimeMonitoringExtended.technicalFeatures.continuousMonitoring')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 监控大屏预览 */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">{t('realTimeMonitoringExtended.monitoringDashboard.title')}</h2>
            <p className="text-xl text-gray-300">{t('realTimeMonitoringExtended.monitoringDashboard.subtitle')}</p>
          </div>
          <div className="bg-gray-800 rounded-2xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-700 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  98.5%
                </div>
                <div className="text-gray-300">{t('realTimeMonitoringExtended.monitoringDashboard.systemAvailability')}</div>
                <div className="text-sm text-green-400 mt-1">↑ 0.1%</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  1,245
                </div>
                <div className="text-gray-300">{t('realTimeMonitoringExtended.monitoringDashboard.activeMarketingActivities')}</div>
                <div className="text-sm text-blue-400 mt-1">↑ 12</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">
                  3.2%
                </div>
                <div className="text-gray-300">{t('realTimeMonitoringExtended.monitoringDashboard.averageConversionRate')}</div>
                <div className="text-sm text-purple-400 mt-1">↑ 0.3%</div>
              </div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center text-gray-300 text-sm">
                <Clock className="h-4 w-4 mr-2" />
                {t('realTimeMonitoringExtended.monitoringDashboard.lastUpdated')}: {t('realTimeMonitoringExtended.monitoringDashboard.justNow')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-purple-900 via-violet-900 to-indigo-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-transparent to-violet-500/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl animate-pulse"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
            {t('cta.realTimeMonitoringTitle')}
          </h2>
          <p className="text-xl text-gray-300 mb-8">{t('cta.realTimeMonitoringSubtitle')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 border-0 shadow-lg shadow-purple-500/25 text-white font-semibold text-lg px-8 py-4"
              >
                <Activity className="mr-2 h-5 w-5" />
                {t('common.getStarted')}
              </Button>
            </Link>
            <Button
              size="lg"
              onClick={() => openModal({
                title: t('modal.realTimeMonitoringDemo'),
                description: t('modal.realTimeMonitoringDemoDesc'),
              })}
              className="bg-transparent border-2 border-orange-500/80 text-orange-400 hover:bg-orange-500 hover:text-white backdrop-blur-sm text-lg px-8 py-4 font-bold shadow-lg shadow-orange-500/20 transition-all duration-300"
            >
              <PlayCircle className="mr-2 h-5 w-5" />
              {t('common.demoTitle')}
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <MarketingFooter />
    </div>
  );
}
