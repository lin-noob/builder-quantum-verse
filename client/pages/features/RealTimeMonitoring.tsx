import { Link } from "react-router-dom";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MarketingNav from "@/components/MarketingNav";

export default function RealTimeMonitoring() {
  const features = [
    {
      icon: <Monitor className="h-8 w-8 text-blue-600" />,
      title: "实时数据监控",
      description:
        "24/7实时监控营销活动数据，毫秒级响应数据变化，确保营销效果可视化",
      benefits: [
        "实时数据同步",
        "多维度指标监控",
        "可视化数据展示",
        "历史趋势对比",
      ],
    },
    {
      icon: <AlertTriangle className="h-8 w-8 text-red-600" />,
      title: "智能异常预警",
      description: "基于机器学习的异常检测算法，主动识别营销异常并及时预警通知",
      benefits: [
        "异常行为识别",
        "阈值智能设定",
        "多渠道预警通知",
        "预警策略配置",
      ],
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-green-600" />,
      title: "性能分析引擎",
      description: "深度分析营销活动性能，提供优化建议和策略调整方案",
      benefits: ["性能瓶颈分析", "优化建议生成", "A/B测试监控", "效果预测模型"],
    },
    {
      icon: <Zap className="h-8 w-8 text-purple-600" />,
      title: "自动化响应",
      description: "根据监控结果自动触发相应的营销策略调整，实现闭环优化",
      benefits: ["策略自动调整", "紧急响应机制", "智能扩缩容", "负载均衡优化"],
    },
  ];

  const monitoringMetrics = [
    {
      category: "营销效果指标",
      metrics: ["转化率", "点击率", "成本效益", "ROI/ROAS"],
    },
    {
      category: "系统性能指标",
      metrics: ["响应时间", "吞吐量", "错误率", "可用性"],
    },
    {
      category: "用户行为指标",
      metrics: ["活跃用户数", "用户留存", "行为路径", "使用时长"],
    },
    {
      category: "业务运营指标",
      metrics: ["订单量", "收入", "客���价", "复购率"],
    },
  ];

  const alertTypes = [
    {
      type: "性能异常",
      description: "系统响应时间超过��值或错误率异常上升",
      response: "自动扩容、流量限制、紧急切换备用系统",
      icon: <Monitor className="h-6 w-6 text-red-500" />,
    },
    {
      type: "营销效果异常",
      description: "转化率大幅下降或成本异常增加",
      response: "暂停低效活动、调整投放策略、优化目标人群",
      icon: <BarChart3 className="h-6 w-6 text-orange-500" />,
    },
    {
      type: "用户行为异常",
      description: "用户流失率异常或行为模式突变",
      response: "启动挽回策略、调整用户体验、个性化推荐优化",
      icon: <Eye className="h-6 w-6 text-blue-500" />,
    },
    {
      type: "业务指标异常",
      description: "订单量下降或收入异常波动",
      response: "紧急营销活动、价格策略调整、库存优化",
      icon: <AlertTriangle className="h-6 w-6 text-purple-500" />,
    },
  ];

  const realTimeFeatures = [
    "毫秒级数据更新",
    "多维度指标监控",
    "智能异常检测",
    "自动预警通知",
    "可视化数据大屏",
    "移动端实时查看",
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* 导航栏 */}
      <MarketingNav />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-50 to-violet-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-purple-600 rounded-full">
                <Activity className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              实时监控中心
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              实时监控营销活动效果，智能异常检测和预警，
              快速调整优化策略，确保营销目标的达成
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button
                  size="lg"
                  className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-4"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  立即体验
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8 py-4">
                查看监控大屏
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 核心功能 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">核心功能</h2>
            <p className="text-xl text-gray-600">全方位实时监控解决方案</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="h-full hover:shadow-lg transition-shadow duration-300"
              >
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    {feature.icon}
                    <h3 className="text-2xl font-semibold text-gray-900 ml-4">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-6 text-lg">
                    {feature.description}
                  </p>
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

      {/* 监控指标 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              监控指标体系
            </h2>
            <p className="text-xl text-gray-600">全面覆盖营销活动的各个维度</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {monitoringMetrics.map((category, index) => (
              <Card key={index} className="h-full">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                    {category.category}
                  </h3>
                  <ul className="space-y-3">
                    {category.metrics.map((metric, idx) => (
                      <li key={idx} className="flex items-center text-gray-600">
                        <BarChart3 className="h-4 w-4 text-purple-500 mr-3" />
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
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              智能预警机制
            </h2>
            <p className="text-xl text-gray-600">主动发现问题，快速响应处理</p>
          </div>
          <div className="space-y-8">
            {alertTypes.map((alert, index) => (
              <Card
                key={index}
                className="overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                    <div className="flex items-center">
                      {alert.icon}
                      <div className="ml-4">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {alert.type}
                        </h3>
                        <p className="text-gray-600">{alert.description}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-purple-600 mb-3">
                        自动响应策略
                      </h4>
                      <p className="text-gray-600">{alert.response}</p>
                    </div>
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                        <Bell className="h-8 w-8 text-purple-600" />
                      </div>
                      <p className="text-sm text-purple-600 font-medium">
                        即时通知
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
      <section className="py-20 bg-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                技术特性
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                基于先进的流式处理技术和机器学习算法，提供毫秒级的实时监控能力
              </p>
              <ul className="space-y-4">
                {realTimeFeatures.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-center text-lg text-gray-600"
                  >
                    <CheckCircle className="h-6 w-6 text-purple-600 mr-4" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                监控能力
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    &lt;100ms
                  </div>
                  <div className="text-gray-600">数据延迟</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    99.9%
                  </div>
                  <div className="text-gray-600">监控准确率</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    1000万+
                  </div>
                  <div className="text-gray-600">日处理事件</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    7x24
                  </div>
                  <div className="text-gray-600">不间断监控</div>
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
            <h2 className="text-3xl font-bold text-white mb-4">实时监控大屏</h2>
            <p className="text-xl text-gray-300">一屏掌握全局营销态势</p>
          </div>
          <div className="bg-gray-800 rounded-2xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-700 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  98.5%
                </div>
                <div className="text-gray-300">系统可用性</div>
                <div className="text-sm text-green-400 mt-1">↑ 0.1%</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  1,245
                </div>
                <div className="text-gray-300">活跃营销活动</div>
                <div className="text-sm text-blue-400 mt-1">↑ 12</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">
                  3.2%
                </div>
                <div className="text-gray-300">平均转化率</div>
                <div className="text-sm text-purple-400 mt-1">↑ 0.3%</div>
              </div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center text-gray-300 text-sm">
                <Clock className="h-4 w-4 mr-2" />
                最后更新: 刚刚
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            开启实时监控新体验
          </h2>
          <p className="text-xl text-purple-100 mb-8">让数据监控变得简单智能</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-4"
              >
                <Activity className="mr-2 h-5 w-5" />
                立即开始监控
              </Button>
            </Link>
            <Button
              size="lg"
              className="bg-white text-purple-600 border-2 border-white hover:bg-purple-50 hover:text-purple-700 text-lg px-8 py-4 font-bold shadow-lg"
            >
              查看监控演示
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
