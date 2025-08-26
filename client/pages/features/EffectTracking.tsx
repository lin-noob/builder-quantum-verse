import { Link } from "react-router-dom";
import {
  Target,
  ArrowRight,
  CheckCircle,
  Sparkles,
  TrendingUp,
  BarChart3,
  PieChart,
  Calculator,
  Eye,
  Filter,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MarketingNav from "@/components/MarketingNav";

export default function EffectTracking() {
  const features = [
    {
      icon: <BarChart3 className="h-8 w-8 text-blue-600" />,
      title: "全链路追踪",
      description: "从用户触点到最终转化，全程跟踪用户行为路径，量化每个环节的效果贡献",
      benefits: ["多触点归因分析", "转化路径追踪", "渠道效果对比", "用户旅程可视化"]
    },
    {
      icon: <Calculator className="h-8 w-8 text-green-600" />,
      title: "ROI精准计算",
      description: "智能计算营销投入产出比，提供多维度的成本效益分析和优化建议",
      benefits: ["投入成本核算", "收益精确计算", "ROI/ROAS分析", "成本优化建议"]
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-purple-600" />,
      title: "效果预测模型",
      description: "基于历史数据和机器学习算法，预测营销活动的效果趋势和优化空间",
      benefits: ["效果趋势预测", "季节性分析", "增长预测模型", "优化策略推荐"]
    },
    {
      icon: <PieChart className="h-8 w-8 text-orange-600" />,
      title: "多维度报表",
      description: "提供丰富的可视化报表，支持自定义维度分析和数据深度钻取",
      benefits: ["可视化报表", "自定义维度", "数据钻取分析", "定时报告推送"]
    }
  ];

  const trackingMetrics = [
    {
      category: "转化指标",
      metrics: [
        { name: "转化率", desc: "完成目标动作的用户占比" },
        { name: "转化成本", desc: "获得单个转化的平均成本" },
        { name: "转化价值", desc: "单次转化带来的平均收益" },
        { name: "转化漏斗", desc: "各阶段转化率分析" }
      ]
    },
    {
      category: "渠道效果",
      metrics: [
        { name: "渠道ROI", desc: "各渠道投入产出比对比" },
        { name: "渠道质量", desc: "不同渠道用户质量评估" },
        { name: "渠道贡献", desc: "各渠道对总体效果的贡献" },
        { name: "渠道协同", desc: "多渠道协同效应分析" }
      ]
    },
    {
      category: "用户行为",
      metrics: [
        { name: "用户路径", desc: "用户完整转化路径分析" },
        { name: "停留时长", desc: "用户在各环节的停留时间" },
        { name: "跳出率", desc: "用户在各环节的流失情况" },
        { name: "重复访问", desc: "用户的重复访问行为" }
      ]
    }
  ];

  const reportTypes = [
    {
      title: "实时报表",
      description: "实时更新的营销效果数据",
      features: ["实时数据更新", "关键指标监控", "异常自动预警"],
      icon: <Eye className="h-6 w-6 text-blue-500" />
    },
    {
      title: "周期报表", 
      description: "按日/周/月的定期效果报告",
      features: ["周期性分析", "趋势对比", "同比环比分析"],
      icon: <Calendar className="h-6 w-6 text-green-500" />
    },
    {
      title: "专题报表",
      description: "针对特定活动或渠道的深度分析",
      features: ["活动效果专题", "渠道深度分析", "用户群体分析"],
      icon: <Filter className="h-6 w-6 text-purple-500" />
    },
    {
      title: "预测报表",
      description: "基于趋势预测的未来效果分析", 
      features: ["效果预测", "趋势分析", "优化建议"],
      icon: <TrendingUp className="h-6 w-6 text-orange-500" />
    }
  ];

  const caseStudies = [
    {
      industry: "电商零售",
      challenge: "多渠道营销效果难以统一衡量",
      solution: "建立全链路追踪体系，统一归因分析",
      result: "营销ROI提升65%，成本降低30%"
    },
    {
      industry: "金融服务", 
      challenge: "客户转化周期长，效果难以追踪",
      solution: "长周期转化追踪，分阶段效果评估",
      result: "转化率提升40%，客户获取成本降低25%"
    },
    {
      industry: "在线教育",
      challenge: "付费转化链路复杂，归因困难",
      solution: "多触点归因模型，精确效果归因",
      result: "付费转化率提升50%，营销效率提升35%"
    }
  ];

  const advantages = [
    "跨平台数据整合",
    "实时效果监控",
    "智能归因分析",
    "多维度报表分析",
    "预测性洞察",
    "自动化报告生成"
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* 导航栏 */}
      <MarketingNav showBackButton={true} />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 to-red-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-orange-600 rounded-full">
                <Target className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              效果追踪
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              全链路效果追踪，量化营销ROI和转化效果，
              提供精准的数据分析和优化建议，让每一分投入都可衡量
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-lg px-8 py-4">
                  <Sparkles className="mr-2 h-5 w-5" />
                  立即体验
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8 py-4">
                查看追踪报表
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
            <p className="text-xl text-gray-600">全方位效果追踪解决方案</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    {feature.icon}
                    <h3 className="text-2xl font-semibold text-gray-900 ml-4">{feature.title}</h3>
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

      {/* 追踪指标 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">追踪指标体系</h2>
            <p className="text-xl text-gray-600">全面覆盖营销效果的各个维度</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {trackingMetrics.map((category, index) => (
              <Card key={index} className="h-full">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                    {category.category}
                  </h3>
                  <div className="space-y-4">
                    {category.metrics.map((metric, idx) => (
                      <div key={idx} className="border-l-4 border-orange-500 pl-4">
                        <h4 className="font-medium text-gray-900 mb-1">{metric.name}</h4>
                        <p className="text-sm text-gray-600">{metric.desc}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 报表类型 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">报表类型</h2>
            <p className="text-xl text-gray-600">多样化的报表满足不同分析需求</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {reportTypes.map((report, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    {report.icon}
                    <h3 className="text-xl font-semibold text-gray-900 ml-4">{report.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-6">{report.description}</p>
                  <ul className="space-y-2">
                    {report.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-gray-600">
                        <CheckCircle className="h-4 w-4 text-orange-500 mr-3" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 成功案例 */}
      <section className="py-20 bg-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">成功案例</h2>
            <p className="text-xl text-gray-600">真实案例验证追踪效果</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {caseStudies.map((caseStudy, index) => (
              <Card key={index} className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                      <Target className="h-8 w-8 text-orange-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">{caseStudy.industry}</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">挑战</h4>
                      <p className="text-gray-600">{caseStudy.challenge}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">解决方案</h4>
                      <p className="text-gray-600">{caseStudy.solution}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">效果</h4>
                      <p className="text-orange-600 font-semibold">{caseStudy.result}</p>
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
              <h2 className="text-3xl font-bold text-gray-900 mb-6">技术优势</h2>
              <p className="text-lg text-gray-600 mb-8">
                基于先进的数据处理技术和机器学习算法，提供精准的效果追踪和分析能力
              </p>
              <ul className="space-y-4">
                {advantages.map((advantage, index) => (
                  <li key={index} className="flex items-center text-lg text-gray-600">
                    <CheckCircle className="h-6 w-6 text-orange-600 mr-4" />
                    {advantage}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-red-100 p-8 rounded-2xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">追踪能力</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">500+</div>
                  <div className="text-gray-600">追踪维度</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">99.5%</div>
                  <div className="text-gray-600">数据准确率</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">实时</div>
                  <div className="text-gray-600">效果更新</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">90天</div>
                  <div className="text-gray-600">数据保留</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 数据可视化预览 */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">效果追踪仪表盘</h2>
            <p className="text-xl text-gray-300">直观展示营销效果数据</p>
          </div>
          <div className="bg-gray-800 rounded-2xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-700 rounded-lg p-6 text-center">
                <div className="text-2xl font-bold text-green-400 mb-2">425%</div>
                <div className="text-gray-300">整体ROI</div>
                <div className="text-sm text-green-400 mt-1">↑ 25%</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-6 text-center">
                <div className="text-2xl font-bold text-blue-400 mb-2">¥156K</div>
                <div className="text-gray-300">总转化价值</div>
                <div className="text-sm text-blue-400 mt-1">↑ ¥23K</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-6 text-center">
                <div className="text-2xl font-bold text-purple-400 mb-2">3.8%</div>
                <div className="text-gray-300">平均转化率</div>
                <div className="text-sm text-purple-400 mt-1">↑ 0.5%</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-6 text-center">
                <div className="text-2xl font-bold text-orange-400 mb-2">¥42</div>
                <div className="text-gray-300">获客成本</div>
                <div className="text-sm text-orange-400 mt-1">↓ ¥8</div>
              </div>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center text-gray-300 text-sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                基于过去30天数据分析
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-orange-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            精准追踪每一份营销投入
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            让数据为您的营销决策提供强有力支撑
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 text-lg px-8 py-4">
                <Target className="mr-2 h-5 w-5" />
                开始效果追踪
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-orange-600 text-lg px-8 py-4">
              查看追踪演示
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
