import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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
  Lightbulb
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { authService } from "@/services/authService";

export default function MarketingHome() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());

  useEffect(() => {
    // 如果已登录，自动跳转到仪表盘
    if (currentUser) {
      navigate("/dashboard");
    }
  }, [currentUser, navigate]);

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

  const features = [
    {
      icon: <Bot className="h-8 w-8 text-blue-600" />,
      title: "AI智能营销",
      description: "基于AI的智能营销场景配置，自动生成个性化营销内��",
      benefits: ["智能内容生成", "个性化推荐", "自动化执行"]
    },
    {
      icon: <Users className="h-8 w-8 text-green-600" />,
      title: "用户画像分析",
      description: "深度用户行为分析，精准洞察用户需求和偏好",
      benefits: ["360°用户画像", "行为轨迹分析", "价值分群"]
    },
    {
      icon: <Activity className="h-8 w-8 text-purple-600" />,
      title: "实时监控中心",
      description: "实时监控营销活动效果，快速调整优化策略",
      benefits: ["实时数据监控", "异常预警", "性能优化建议"]
    },
    {
      icon: <Target className="h-8 w-8 text-red-600" />,
      title: "效果追踪",
      description: "全链路效果追踪，量化营销ROI和转化效果",
      benefits: ["转化漏斗分析", "ROI计算", "多维度报表"]
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-orange-600" />,
      title: "数据驱动决策",
      description: "基于大数据分析的营销决策支持系统",
      benefits: ["趋势预测", "策略推荐", "A/B测试"]
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-600" />,
      title: "营销自动化",
      description: "全流程营销自动化，降低人工成本提升效率",
      benefits: ["触发式营销", "自动化工作流", "批量处理"]
    }
  ];

  const stats = [
    { value: "300%", label: "平均转化提升", icon: <TrendingUp className="h-5 w-5" /> },
    { value: "80%", label: "运营效率提升", icon: <Zap className="h-5 w-5" /> },
    { value: "60%", label: "成本降低", icon: <Target className="h-5 w-5" /> },
    { value: "99.9%", label: "系统稳定性", icon: <Shield className="h-5 w-5" /> }
  ];

  const useCases = [
    {
      title: "电商营销",
      description: "购物车挽回、个性化推荐、会员营销",
      scenarios: ["加入购物车挽回", "商品个性化推荐", "会员等级营销"]
    },
    {
      title: "内容营销",
      description: "用户兴趣分析、内容推荐、阅读行为优化",
      scenarios: ["内容个性化推送", "阅读习惯分析", "用户兴趣建模"]
    },
    {
      title: "金融营销",
      description: "风险评估、产品推荐、客户生命周期管理",
      scenarios: ["智能产品推荐", "风险用户识别", "客户价值分析"]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Bot className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">AI营销平台</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/auth">
                <Button variant="ghost">登录</Button>
              </Link>
              <Link to="/auth">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  免费试用
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              <span className="text-blue-600">AI驱动</span>的智能营销��台
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              通过人工智能技术，实现精准用户洞察、自动化营销执行和数据驱动决策，
              帮助企业实现营销效果的指数级提升
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {currentUser && isPreviewMode ? (
                // 已登录用户在预览模式下的CTA
                <>
                  <Button
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4"
                    onClick={() => navigate("/dashboard")}
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    进入我的仪表盘
                  </Button>
                  <Button size="lg" variant="outline" className="text-lg px-8 py-4">
                    <PlayCircle className="mr-2 h-5 w-5" />
                    查看功能演示
                  </Button>
                </>
              ) : (
                // 未登录用户的CTA
                <>
                  <Link to="/auth">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4">
                      <Sparkles className="mr-2 h-5 w-5" />
                      立即开始免费试用
                    </Button>
                  </Link>
                  <Button size="lg" variant="outline" className="text-lg px-8 py-4">
                    <PlayCircle className="mr-2 h-5 w-5" />
                    观看产品演示
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 成果展示 */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">数据说话</h2>
            <p className="text-gray-600">真实客户数据验证的营销效果提升</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 核心功能 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">核心功能</h2>
            <p className="text-xl text-gray-600">全方位AI营销解决方案</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {feature.icon}
                    <h3 className="text-xl font-semibold text-gray-900 ml-3">{feature.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
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
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">应用场景</h2>
            <p className="text-xl text-gray-600">适用于各行业的营销场景</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <Card key={index} className="h-full">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{useCase.title}</h3>
                  <p className="text-gray-600 mb-4">{useCase.description}</p>
                  <div className="space-y-2">
                    {useCase.scenarios.map((scenario, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-600">
                        <Brain className="h-4 w-4 text-blue-500 mr-2" />
                        {scenario}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 工作流程 */}
      <section className="py-20 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">简单三步，开启AI营销</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "数据接入",
                description: "连接您的用户数据源，AI自动分析用户行为和偏好",
                icon: <Users className="h-8 w-8" />
              },
              {
                step: "02", 
                title: "智能配置",
                description: "配置营销场景，AI自动生成个性化营销策略",
                icon: <Brain className="h-8 w-8" />
              },
              {
                step: "03",
                title: "效果优化",
                description: "实时监控效果，AI持续优化营销策略",
                icon: <TrendingUp className="h-8 w-8" />
              }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="relative">
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                    {item.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white text-blue-600 rounded-full flex items-center justify-center text-sm font-bold border-2 border-blue-600">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            准备好开启AI营销的新时代了吗？
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            加入数千家企业，体验AI驱动的营销效果提升
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {currentUser && isPreviewMode ? (
              // 已登录用户在预览模式下的CTA
              <>
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4"
                  onClick={() => navigate("/dashboard")}
                >
                  <Star className="mr-2 h-5 w-5" />
                  进入我的工作台
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4">
                  联系销售顾问
                </Button>
              </>
            ) : (
              // 未登录用户的CTA
              <>
                <Link to="/auth">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4">
                    <Star className="mr-2 h-5 w-5" />
                    立即免费试用
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4">
                  联系销售顾问
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Bot className="h-8 w-8 text-blue-400" />
                <span className="ml-2 text-xl font-bold">AI营销平台</span>
              </div>
              <p className="text-gray-400">
                专业的AI驱动营销解决方案，助力企业实现营销效果的指数级提升。
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">产品功能</h3>
              <ul className="space-y-2 text-gray-400">
                <li>AI智能营销</li>
                <li>用户画像分析</li>
                <li>实时监控</li>
                <li>效果追踪</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">解决方案</h3>
              <ul className="space-y-2 text-gray-400">
                <li>电商营销</li>
                <li>内容营销</li>
                <li>金融营销</li>
                <li>企业服务</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">联系我们</h3>
              <ul className="space-y-2 text-gray-400">
                <li>技术支持</li>
                <li>销售咨询</li>
                <li>合作伙伴</li>
                <li>API文档</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2024 AI营销平台. 保留所有权利.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
