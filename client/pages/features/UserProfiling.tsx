import { Link } from "react-router-dom";
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
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MarketingNav from "@/components/MarketingNav";

export default function UserProfiling() {
  const features = [
    {
      icon: <Eye className="h-8 w-8 text-blue-600" />,
      title: "360°用户洞察",
      description: "整合多维度用户数据，构建完整用户画像，深度洞察用户需求和行为偏好",
      benefits: ["多维度数据整合", "行为轨迹分析", "兴趣偏好挖掘", "消费能力评估"]
    },
    {
      icon: <Layers className="h-8 w-8 text-green-600" />,
      title: "智能用户分群",
      description: "基于机器学习算法，自动识别用户群体特征，实现精准的用户分层管理",
      benefits: ["RFM价值分析", "生命周期分群", "兴趣标签分组", "行为模式聚类"]
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-purple-600" />,
      title: "预测分析引擎",
      description: "运用先进的预测模型，预测用户行为趋势和价值变化，提前制定营销策略",
      benefits: ["流失风险预警", "购买意向预测", "价值趋势分析", "复购概率计算"]
    },
    {
      icon: <Search className="h-8 w-8 text-orange-600" />,
      title: "实时画像更新",
      description: "实时捕获用户行为变化，动态更新用户画像，确保洞察的时效性和准确性",
      benefits: ["实时数据采集", "增量计算更新", "异常行为监测", "���像准确性验证"]
    }
  ];

  const dataTypes = [
    {
      category: "基础属性",
      items: ["年龄、性别、地域", "职业、收入水平", "教育背景", "家庭结构"]
    },
    {
      category: "行为数据", 
      items: ["浏览轨迹", "购买历史", "互动行为", "使用习惯"]
    },
    {
      category: "偏好特征",
      items: ["商品偏好", "价格敏感度", "品牌倾向", "渠道偏好"]
    },
    {
      category: "价值指标",
      items: ["消费能力", "活跃度", "忠诚度", "影响力"]
    }
  ];

  const applications = [
    {
      title: "精准推荐",
      description: "基于用户画像推荐个性化商品和内容",
      metrics: "点击率提升40%"
    },
    {
      title: "定向营销", 
      description: "向特定用户群体投放定制化营销内容",
      metrics: "转化率提升55%"
    },
    {
      title: "用户运营",
      description: "制定差异化的用户运营和服务策略", 
      metrics: "用户满意度提升30%"
    },
    {
      title: "产品优化",
      description: "基于用户需求洞察优化产品功能设计",
      metrics: "产品采用率提升45%"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* 导航栏 */}
      <MarketingNav showBackButton={true} />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-emerald-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-green-600 rounded-full">
                <Users className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              用户画像分析
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              深度用户行为分析，精准洞察用户需求和偏好，
              构建完整的用户画像体系，为精准营销提供数据支撑
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-lg px-8 py-4">
                  <Sparkles className="mr-2 h-5 w-5" />
                  立即体验
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8 py-4">
                查看演示
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
            <p className="text-xl text-gray-600">全方位用户画像分析解决方案</p>
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

      {/* 数据维度 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">多维度数据分析</h2>
            <p className="text-xl text-gray-600">全面覆盖用户行为的各个维度</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {dataTypes.map((dataType, index) => (
              <Card key={index} className="h-full">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                    {dataType.category}
                  </h3>
                  <ul className="space-y-3">
                    {dataType.items.map((item, idx) => (
                      <li key={idx} className="flex items-center text-gray-600">
                        <Target className="h-4 w-4 text-blue-500 mr-3" />
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
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">应用场景</h2>
            <p className="text-xl text-gray-600">用户画像在营销各环节的实际应用</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {applications.map((app, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">{app.title}</h3>
                      <p className="text-gray-600 mb-4">{app.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">{app.metrics}</div>
                    </div>
                  </div>
                  <div className="flex items-center text-blue-600">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    <span className="text-sm font-medium">查看详细案例</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 技术架构 */}
      <section className="py-20 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">技术架构</h2>
              <p className="text-lg text-gray-600 mb-8">
                基于大数据和机器学习技术，构建企业级用户画像分析平台
              </p>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <Brain className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">机器学习引擎</h4>
                    <p className="text-gray-600">运用先进的ML算法，自动发现用户行为模式和特征</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <BarChart3 className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">实时计算平台</h4>
                    <p className="text-gray-600">支持大规模实时数据处理和画像更新</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <Target className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">标签管理系统</h4>
                    <p className="text-gray-600">灵活的标签体系，支持自定义标签和标签组合</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">平台能力</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">1000万+</div>
                  <div className="text-gray-600">用户画像处理</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">500+</div>
                  <div className="text-gray-600">标签维度</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">秒级</div>
                  <div className="text-gray-600">画像更新</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">95%+</div>
                  <div className="text-gray-600">预测准确率</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            构建您的用户画像体系
          </h2>
          <p className="text-xl text-green-100 mb-8">
            深度洞察用户，精准营销决策
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 text-lg px-8 py-4">
                <Users className="mr-2 h-5 w-5" />
                立即开始分析
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600 text-lg px-8 py-4">
              预约产品演示
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
