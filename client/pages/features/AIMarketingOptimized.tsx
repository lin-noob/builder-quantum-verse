import React from "react";
import { Link } from "react-router-dom";
// import { useTranslation } from "react-i18next";
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

  return (
  <section className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 py-20 overflow-hidden">
    {/* 背景网格效果 */}
    <div className="absolute inset-0 opacity-20">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.1) 0%, transparent 50%),
                          linear-gradient(90deg, rgba(16, 185, 129, 0.03) 1px, transparent 1px),
                          linear-gradient(rgba(16, 185, 129, 0.03) 1px, transparent 1px)`,
          backgroundSize: '200px 200px, 50px 50px, 50px 50px'
        }}
      />
    </div>

    {/* 动态���效 */}
    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>

    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="p-6 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full shadow-lg shadow-cyan-500/50">
            <Bot className="h-12 w-12 text-white" />
          </div>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-cyan-400 to-blue-400 bg-clip-text text-transparent">
          AI智能营销
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
          基于人工智能的智能营销场景配置，自动生成个性化营销内容，实现精准触达和高效转化，让营销更智能、更高效
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/auth">
            <Button
              size="lg"
              className="text-lg px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 border-0 shadow-lg shadow-cyan-500/25 text-white font-semibold"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              立即体验
            </Button>
          </Link>
          <Button
            size="lg"
            variant="outline"
            onClick={() => openModal({
              title: '观看AI智能营销演示',
              description: '预约产品演示，了解AI智能营销如何帮助您实现精准获客和高效转化。',
            })}
            className="text-lg px-8 py-4 border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white bg-purple-500/10 backdrop-blur-sm shadow-lg shadow-purple-500/20 transition-all duration-300"
          >
            <PlayCircle className="mr-2 h-5 w-5" />
            观看演示
          </Button>
        </div>
      </div>
    </div>
  </section>
  );
});


// 核心能力组件 - AI科技风格
const CoreFeaturesSection = React.memo(({ features }) => (
  <section className="py-20 bg-gradient-to-b from-gray-800 to-gray-900 relative">
    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5"></div>
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">核心功能矩阵</h2>
        <p className="text-xl text-gray-400">全方位AI营销解决方案</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {features.map((feature, index) => (
          <FeatureCard key={index} {...feature} />
        ))}
      </div>
    </div>
  </section>
));

// 应用场景组件
const UseCasesSection = React.memo(() => {
  const useCases = [
    {
      scenario: '电商购物车挽回',
      aiAction: 'AI分析用户偏好和价格敏感度，生成个性化优惠券',
      result: '转化率提升45%',
    },
    {
      scenario: '新用户欢迎序列',
      aiAction: '根据注册渠道定制化欢迎内容和产品推荐',
      result: '首购转化率提升60%',
    },
    {
      scenario: '会员升级营销',
      aiAction: '分析消费行为推送定制化升级方案',
      result: '会员升级率提升35%',
    },
  ];

  return (
    <div className="space-y-8">
      {useCases.map((useCase, index) => (
        <Card key={index} className="overflow-hidden bg-gray-800/50 border-gray-700 hover:border-cyan-500/40 transition-all duration-300 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {useCase.scenario}
                </h3>
              </div>
              <div>
                <h4 className="text-lg font-medium text-cyan-400 mb-3">
                  AI自动处理
                </h4>
                <p className="text-gray-300">{useCase.aiAction}</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-full mb-4">
                  <BarChart3 className="h-8 w-8 text-green-400" />
                </div>
                <p className="text-2xl font-bold text-green-400">
                  {useCase.result}
                </p>
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

  const advantages = [
    '24/7全天候智能运营',
    '毫秒级响应用户行为',
    '个性化内容生成',
    '自动A/B测试优化',
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
            开启AI智能营销新时代
          </span>
        </h2>
        <p className="text-xl text-gray-300 mb-8 leading-relaxed">
          让人工智能为您的营销策略注入强大动力
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
              立即开始体验
            </Button>
          </Link>
          <Button
            size="lg"
            variant="outline"
            onClick={() => openModal({
              title: '联系AI营销专家',
              description: '与我们的AI营销专家一对一沟通，获取个性化的智能营销解决方案和专业建议。',
            })}
            className="border-green-500 text-green-400 hover:bg-green-500 hover:text-white bg-green-500/10 text-lg px-8 py-4 backdrop-blur-sm shadow-lg shadow-green-500/20 transition-all duration-300"
          >
            <Users className="mr-2 h-5 w-5" />
            联系专家咨询
          </Button>
        </div>
      </div>
    </section>
  );
});

export default function AIMarketingOptimized() {

  // 核心功能数据 - AI科技风格
  const features = [
    {
      icon: <Brain className="h-8 w-8 text-cyan-400" />,
      title: '智能内容生成',
      description: '基于用户画像和行为数据，AI自动生成个性化营销文案、邮件内容和推荐策略',
      benefits: [
        '自然语言处理',
        '个性化文案',
        '多语言支持',
        '品牌语调适配'
      ],
    },
    {
      icon: <Target className="h-8 w-8 text-green-400" />,
      title: '精准场景触发',
      description: '智能识别用户行为模式，在最佳时机触发营销动作，提升转化效果',
      benefits: [
        '行为预测',
        '时机优化',
        '场景适配',
        '自动化触发'
      ],
    },
    {
      icon: <Zap className="h-8 w-8 text-purple-400" />,
      title: '策略自动优化',
      description: '实时分析营销效果，AI自动调整策略参数，持续优化营销效果',
      benefits: [
        '效果监控',
        '参数调优',
        'A/B测试',
        '策略进化'
      ],
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-orange-400" />,
      title: '多渠道协同',
      description: '统一管理多个营销渠道，确保用户体验一致性和营销效果最大化',
      benefits: [
        '渠道整合',
        '消息统一',
        '用户旅程',
        '效果聚合'
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
              实际应用场景
            </h2>
            <p className="text-xl text-gray-400">
              真实案例展示AI智能营销的强大能力
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
                技术优势
              </h2>
              <p className="text-lg text-gray-300 mb-8">
                基于先进的机器学习算法��大数据分析技术
              </p>
            </div>
            <div className="bg-gray-800/50 border border-cyan-500/20 p-8 rounded-2xl backdrop-blur-sm hover:border-cyan-500/40 transition-colors duration-300">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-400 mb-2">
                    99.9%
                  </div>
                  <div className="text-gray-400">系统可用性</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">
                    &lt;100ms
                  </div>
                  <div className="text-gray-400">响应时间</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">
                    10亿+
                  </div>
                  <div className="text-gray-400">日处理消息</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    300%
                  </div>
                  <div className="text-gray-400">平均效果提升</div>
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
