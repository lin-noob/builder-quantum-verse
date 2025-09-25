import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bot,
  Target,
  BarChart3,
  Users,
  Activity,
  Zap,
  Shield,
  Sparkles,
  ArrowRight,
  CheckCircle,
  PlayCircle,
  Star,
  TrendingUp,
  Brain,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MarketingNav from "@/components/MarketingNav";
import MarketingFooter from "@/components/MarketingFooter";
import { authService } from "@/services/authService";
import { useContactModal } from "@/contexts/ContactModalContext";
import { useTranslation } from "react-i18next";

export default function MarketingHome() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const { openModal } = useContactModal();
  const { t } = useTranslation();

  const [features, setFeatures] = useState([]);

  useEffect(() => {
    // 如果已登录，自动跳转到仪表盘
    if (currentUser) {
      navigate("/dashboard2");
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    console.log(123);
  }, []);

  useEffect(() => {
    debugger;
    setFeatures([
      {
        icon: <Bot className="h-8 w-8 text-blue-600" />,
        title: t("features.aiMarketingTitle"),
        description: t("features.aiMarketingDescription"),
        benefits: [
          t("features.aiMarketingBenefits.contentGeneration"),
          t("features.aiMarketingBenefits.personalization"),
          t("features.aiMarketingBenefits.automation"),
        ],
      },
      {
        icon: <Users className="h-8 w-8 text-green-600" />,
        title: t("features.userProfilingTitle"),
        description: t("features.userProfilingDescription"),
        benefits: [
          t("features.userProfilingBenefits.fullProfile"),
          t("features.userProfilingBenefits.behaviorAnalysis"),
          t("features.userProfilingBenefits.valueSegmentation"),
        ],
      },
      {
        icon: <Activity className="h-8 w-8 text-purple-600" />,
        title: t("features.realTimeMonitoringTitle"),
        description: t("features.realTimeMonitoringDescription"),
        benefits: [
          t("features.realTimeMonitoringBenefits.realTimeData"),
          t("features.realTimeMonitoringBenefits.alerting"),
          t("features.realTimeMonitoringBenefits.optimization"),
        ],
      },
      {
        icon: <Target className="h-8 w-8 text-red-600" />,
        title: t("features.effectTrackingTitle"),
        description: t("features.effectTrackingDescription"),
        benefits: [
          t("features.effectTrackingBenefits.funnelAnalysis"),
          t("features.effectTrackingBenefits.roiCalculation"),
          t("features.effectTrackingBenefits.multiDimensionReport"),
        ],
      },
      {
        icon: <BarChart3 className="h-8 w-8 text-orange-600" />,
        title: t("features.dataDecisionTitle"),
        description: t("features.dataDecisionDescription"),
        benefits: [
          t("features.dataDecisionBenefits.trendPrediction"),
          t("features.dataDecisionBenefits.strategyRecommendation"),
          t("features.dataDecisionBenefits.abTesting"),
        ],
      },
      {
        icon: <Zap className="h-8 w-8 text-yellow-600" />,
        title: t("features.automationTitle"),
        description: t("features.automationDescription"),
        benefits: [
          t("features.automationBenefits.triggerMarketing"),
          t("features.automationBenefits.workflow"),
          t("features.automationBenefits.batchProcessing"),
        ],
      },
    ]);
  }, [t]);

  // 如果已登录，显示加载状态
  if (currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在跳转到仪表盘...</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      value: "300%",
      label: t("stats.averageConversionIncrease"),
      icon: <TrendingUp className="h-5 w-5" />,
    },
    {
      value: "80%",
      label: t("stats.efficiencyIncrease"),
      icon: <Zap className="h-5 w-5" />,
    },
    {
      value: "60%",
      label: t("stats.costReduction"),
      icon: <Target className="h-5 w-5" />,
    },
    {
      value: "99.9%",
      label: t("stats.systemStability"),
      icon: <Shield className="h-5 w-5" />,
    },
  ];

  const useCases = [
    {
      title: t("nav.ecommerce"),
      description: t("hero.ecommerceDescription"),
      scenarios: [
        t("common.explore"),
        t("common.learnMore"),
        t("common.getStarted"),
      ],
    },
    {
      title: t("nav.contentMarketing"),
      description: t("hero.contentDescription"),
      scenarios: [
        t("common.explore"),
        t("common.learnMore"),
        t("common.getStarted"),
      ],
    },
    {
      title: t("nav.financialMarketing"),
      description: t("hero.financialDescription"),
      scenarios: [
        t("common.explore"),
        t("common.learnMore"),
        t("common.getStarted"),
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* 导航栏 */}
      <MarketingNav />

      {/* Hero Section - AI科技风格 */}
      <section className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 py-20 overflow-hidden">
        {/* 背景网格效果 */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.1) 0%, transparent 50%),
                              linear-gradient(90deg, rgba(16, 185, 129, 0.03) 1px, transparent 1px),
                              linear-gradient(rgba(16, 185, 129, 0.03) 1px, transparent 1px)`,
              backgroundSize: "200px 200px, 50px 50px, 50px 50px",
            }}
          />
        </div>

        {/* 动态光效 */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-6 backdrop-blur-sm">
              <Bot className="h-4 w-4 text-cyan-400 mr-2" />
              <span className="text-cyan-400 text-sm font-medium">
                Next-Gen AI Marketing Platform
              </span>
            </div>
            <h1 className="text-4xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-cyan-400 to-purple-400 bg-clip-text text-transparent leading-tight">
              AI驱动的未来营销
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              通过前沿��工智能技术，实现
              <span className="text-cyan-400 font-semibold">精准用户洞察</span>
              、
              <span className="text-purple-400 font-semibold">
                自动化营销执行
              </span>
              和
              <span className="text-green-400 font-semibold">数据驱动决策</span>
              ， 帮助企业实现营销效果的指数级提升
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button
                  size="lg"
                  className="text-lg px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 border-0 shadow-lg shadow-cyan-500/25 text-white font-semibold"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  {t("hero.ctaStartAI")}
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                onClick={() =>
                  openModal({
                    title: t("modal.aiMarketingDemo"),
                    description: t("modal.aiMarketingDemoDesc"),
                  })
                }
                className="text-lg px-8 py-4 border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white bg-purple-500/10 backdrop-blur-sm shadow-lg shadow-purple-500/20 transition-all duration-300"
              >
                <PlayCircle className="mr-2 h-5 w-5" />
                {t("hero.ctaWatchDemo")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 成果展示 - AI科技风格 */}
      <section className="py-16 bg-gray-900 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              数据驱动的成果
            </h2>
            <p className="text-gray-400">真实客户数据验证的营销效果提升</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const colors = [
                {
                  bg: "bg-cyan-500/10",
                  border: "border-cyan-500/20",
                  text: "text-cyan-400",
                  glow: "shadow-cyan-500/25",
                },
                {
                  bg: "bg-green-500/10",
                  border: "border-green-500/20",
                  text: "text-green-400",
                  glow: "shadow-green-500/25",
                },
                {
                  bg: "bg-purple-500/10",
                  border: "border-purple-500/20",
                  text: "text-purple-400",
                  glow: "shadow-purple-500/25",
                },
                {
                  bg: "bg-blue-500/10",
                  border: "border-blue-500/20",
                  text: "text-blue-400",
                  glow: "shadow-blue-500/25",
                },
              ];
              const color = colors[index % colors.length];

              return (
                <div key={index} className="text-center group">
                  <div className="flex justify-center mb-4">
                    <div
                      className={`p-4 ${color.bg} ${color.border} border rounded-xl backdrop-blur-sm ${color.text} transition-all duration-300 group-hover:scale-110 shadow-lg ${color.glow}`}
                    >
                      {stat.icon}
                    </div>
                  </div>
                  <div
                    className={`text-3xl font-bold mb-2 ${color.text} transition-all duration-300`}
                  >
                    {stat.value}
                  </div>
                  <div className="text-gray-400">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 核心功能 - AI科技风格 */}
      <section className="py-20 bg-gradient-to-b from-gray-800 to-gray-900 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
              核心功能矩阵
            </h2>
            <p className="text-xl text-gray-400">全方位AI营销解决方案</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              // 为每个功能定义对应的路径
              const featurePaths = [
                "/features/ai-marketing",
                "/features/user-profiling",
                "/features/real-time-monitoring",
                "/features/effect-tracking",
                "/features/data-driven",
                "/features/automation",
              ];

              // AI科技风格的颜色配置
              const techColors = [
                {
                  border: "border-cyan-500/20",
                  bg: "bg-cyan-500/5",
                  icon: "text-cyan-400",
                  hover: "hover:border-cyan-500/40",
                  glow: "shadow-cyan-500/10",
                },
                {
                  border: "border-green-500/20",
                  bg: "bg-green-500/5",
                  icon: "text-green-400",
                  hover: "hover:border-green-500/40",
                  glow: "shadow-green-500/10",
                },
                {
                  border: "border-purple-500/20",
                  bg: "bg-purple-500/5",
                  icon: "text-purple-400",
                  hover: "hover:border-purple-500/40",
                  glow: "shadow-purple-500/10",
                },
                {
                  border: "border-red-400/20",
                  bg: "bg-red-500/5",
                  icon: "text-red-400",
                  hover: "hover:border-red-400/40",
                  glow: "shadow-red-500/10",
                },
                {
                  border: "border-orange-500/20",
                  bg: "bg-orange-500/5",
                  icon: "text-orange-400",
                  hover: "hover:border-orange-500/40",
                  glow: "shadow-orange-500/10",
                },
                {
                  border: "border-yellow-500/20",
                  bg: "bg-yellow-500/5",
                  icon: "text-yellow-400",
                  hover: "hover:border-yellow-500/40",
                  glow: "shadow-yellow-500/10",
                },
              ];
              const color = techColors[index % techColors.length];

              return (
                <Link
                  key={index}
                  to={featurePaths[index]}
                  className="block h-full group"
                >
                  <Card
                    className={`h-full transition-all duration-300 cursor-pointer bg-gray-800/50 ${color.border} border backdrop-blur-sm ${color.hover} hover:shadow-lg ${color.glow} group-hover:scale-105`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <div
                          className={`p-3 ${color.bg} rounded-lg mr-3 ${color.icon} transition-all duration-300 group-hover:scale-110`}
                        >
                          {feature.icon}
                        </div>
                        <h3 className="text-xl font-semibold text-white">
                          {feature.title}
                        </h3>
                      </div>
                      <p className="text-gray-300 mb-4 leading-relaxed">
                        {feature.description}
                      </p>
                      <ul className="space-y-2 mb-4">
                        {feature.benefits.map((benefit, idx) => (
                          <li
                            key={idx}
                            className="flex items-center text-sm text-gray-400"
                          >
                            <CheckCircle
                              className={`h-4 w-4 mr-2 ${color.icon}`}
                            />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                      <div
                        className={`mt-4 flex items-center text-sm font-medium ${color.icon} group-hover:translate-x-1 transition-transform duration-300`}
                      >
                        <span>探索功能</span>
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 应用��景 - AI科技风格 */}
      <section className="py-20 bg-gray-900 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-blue-900/20 to-gray-900"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
              智能应用场景
            </h2>
            <p className="text-xl text-gray-400">适用于各行业的AI营销场景</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => {
              const sceneColors = [
                {
                  border: "border-orange-500/20",
                  bg: "bg-orange-500/5",
                  icon: "text-orange-400",
                  hover: "hover:border-orange-500/40",
                },
                {
                  border: "border-purple-500/20",
                  bg: "bg-purple-500/5",
                  icon: "text-purple-400",
                  hover: "hover:border-purple-500/40",
                },
                {
                  border: "border-green-500/20",
                  bg: "bg-green-500/5",
                  icon: "text-green-400",
                  hover: "hover:border-green-500/40",
                },
              ];
              const color = sceneColors[index % sceneColors.length];

              return (
                <Card
                  key={index}
                  className={`h-full bg-gray-800/50 ${color.border} border backdrop-blur-sm ${color.hover} transition-all duration-300 hover:scale-105`}
                >
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
                      <div
                        className={`w-8 h-8 ${color.bg} rounded-lg flex items-center justify-center mr-3`}
                      >
                        <Brain className={`h-5 w-5 ${color.icon}`} />
                      </div>
                      {useCase.title}
                    </h3>
                    <p className="text-gray-300 mb-4">{useCase.description}</p>
                    <div className="space-y-2">
                      {useCase.scenarios.map((scenario, idx) => (
                        <div
                          key={idx}
                          className="flex items-center text-sm text-gray-400"
                        >
                          <div
                            className={`w-2 h-2 rounded-full mr-3 ${color.bg}`}
                          ></div>
                          {scenario}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* 工作流程 */}
      <section className="py-20 bg-gradient-to-b from-gray-800 to-gray-900 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
              三步启动AI营销引擎
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "数据接入",
                description: "连接您的用户数据源，AI自动分析用户行为和偏好",
                icon: <Users className="h-8 w-8" />,
              },
              {
                step: "02",
                title: "智能配置",
                description: "配置营销场景，AI自动生成个性化营销策略",
                icon: <Brain className="h-8 w-8" />,
              },
              {
                step: "03",
                title: "效果优化",
                description: "实时监控效果，AI持续优化营销策略",
                icon: <TrendingUp className="h-8 w-8" />,
              },
            ].map((item, index) => {
              const colors = [
                {
                  bg: "bg-cyan-500",
                  border: "border-cyan-400",
                  text: "text-cyan-400",
                  glow: "shadow-cyan-500/50",
                },
                {
                  bg: "bg-blue-500",
                  border: "border-blue-400",
                  text: "text-blue-400",
                  glow: "shadow-blue-500/50",
                },
                {
                  bg: "bg-purple-500",
                  border: "border-purple-400",
                  text: "text-purple-400",
                  glow: "shadow-purple-500/50",
                },
              ];
              const color = colors[index % colors.length];

              return (
                <div key={index} className="text-center group">
                  <div className="relative mb-6">
                    <div
                      className={`w-20 h-20 ${color.bg} text-white rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110 shadow-lg ${color.glow}`}
                    >
                      {item.icon}
                    </div>
                    <div
                      className={`absolute -top-2 -right-2 w-10 h-10 bg-gray-800 ${color.text} rounded-full flex items-center justify-center text-lg font-bold ${color.border} border-2 backdrop-blur-sm`}
                    >
                      {item.step}
                    </div>
                    {/* 连接线 */}
                    {index < 2 && (
                      <div className="hidden md:block absolute top-10 left-full w-16 h-0.5 bg-gradient-to-r from-gray-600 to-gray-700"></div>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section - AI科技风格 */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
        {/* 背景动效 */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              准备启动AI营销革命了吗？
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            加入<span className="text-cyan-400 font-semibold">数千家</span>
            领先企业， 体验
            <span className="text-purple-400 font-semibold">AI驱动</span>
            的营销效果提升
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-lg px-8 py-4 shadow-lg shadow-cyan-500/25 border-0"
              >
                <Star className="mr-2 h-5 w-5" />
                立即启动
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              onClick={() =>
                openModal({
                  title: "联系专家",
                  description:
                    "与我们的AI营销专家直接沟通，获取专业的营销策略建议和定制化解决方案。",
                })
              }
              className="border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white bg-orange-500/10 text-lg px-8 py-4 backdrop-blur-sm shadow-lg shadow-orange-500/20 transition-all duration-300"
            >
              <Users className="mr-2 h-5 w-5" />
              联系专家
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <MarketingFooter />
    </div>
  );
}
