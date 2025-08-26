import { Link } from "react-router-dom";
import {
  Bot,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Brain,
  Target,
  Zap,
  Users,
  BarChart3,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MarketingNav from "@/components/MarketingNav";

export default function AIMarketing() {
  const features = [
    {
      icon: <Brain className="h-8 w-8 text-blue-600" />,
      title: "智能内容生成",
      description: "基于用户画像和行为数据，AI自动生成个性化营销文案、邮件内容和推荐策略",
      benefits: ["自然语言处理", "个性化文案", "多语言支持", "品牌语调适配"]
    },
    {
      icon: <Target className="h-8 w-8 text-green-600" />,
      title: "精准场景触发",
      description: "智能识别用户行为模式，在最佳时机触发营销动作，提升转化效果",
      benefits: ["行为预测", "时机优化", "场景适配", "自动化触发"]
    },
    {
      icon: <Zap className="h-8 w-8 text-purple-600" />,
      title: "策略自动优化",
      description: "实时分析营销效果，AI自动调整策略参数，持续优化营销效果",
      benefits: ["效果监控", "参数调优", "A/B测试", "策略进化"]
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-orange-600" />,
      title: "多渠道协同",
      description: "统一管理多个营销渠道，确保用户体验一致性和营销效果最大化",
      benefits: ["渠道整合", "消息统一", "用户旅程", "效果聚合"]
    }
  ];

  const useCases = [
    {
      scenario: "电商购物车挽回",
      description: "用户加入购物车后30分钟内未完成购买",
      aiAction: "AI分析用户偏好和价格敏感度，生成个性化优惠券和催促文案",
      result: "转化率提升45%"
    },
    {
      scenario: "新用户欢迎序列",
      description: "新用户注册后的前7天引导流程",
      aiAction: "根据注册渠道和用户特征，定制化欢迎内容和产品推荐",
      result: "首购转化率提升60%"
    },
    {
      scenario: "会员升级营销",
      description: "识别有升级潜力的普通会员",
      aiAction: "分析消费行为和价值趋势，推送定制化升级方案",
      result: "会员升级率提升35%"
    }
  ];

  const advantages = [
    "24/7全天候智能运营",
    "毫秒级响应用户行为", 
    "个性化内容生成",
    "自动A/B测试优化",
    "多渠道统一管理",
    "实时效果监控"
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* 导航栏 */}
      <MarketingNav showBackButton={true} />

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
              AI智能营销
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              基于人工智能的智能营销场景配置，自动生成个性化营销内容，
              实现精准触达和高效转化，让营销更智能、更高效
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4">
                  <Sparkles className="mr-2 h-5 w-5" />
                  立即体验
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8 py-4">
                观看演示
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 核心能力 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">核心能力</h2>
            <p className="text-xl text-gray-600">AI驱动的全方位智能营销解决方案</p>
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

      {/* 应用场景 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">实际应用场景</h2>
            <p className="text-xl text-gray-600">真实案例展示AI智能营销的强大能力</p>
          </div>
          <div className="space-y-8">
            {useCases.map((useCase, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">{useCase.scenario}</h3>
                      <p className="text-gray-600">{useCase.description}</p>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-blue-600 mb-3">AI自动处理</h4>
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
              <h2 className="text-3xl font-bold text-gray-900 mb-6">技术优势</h2>
              <p className="text-lg text-gray-600 mb-8">
                基于先进的机器学习算法和大数据分析技术，为您提供业界领先的AI营销解决方案
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
                  <div className="text-gray-600">系统可用性</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">&lt;100ms</div>
                  <div className="text-gray-600">响应时间</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">10亿+</div>
                  <div className="text-gray-600">日处理消息</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">300%</div>
                  <div className="text-gray-600">平均效果提升</div>
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
            开启AI智能营销新时代
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            让人工智能为您的营销策略注入强大动力
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4">
                <Sparkles className="mr-2 h-5 w-5" />
                立即开始体验
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4">
              联系专家咨询
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
