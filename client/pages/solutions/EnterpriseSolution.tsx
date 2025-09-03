import React from "react";
import { Link } from "react-router-dom";
// import { useTranslation } from "react-i18next";
import {
  Building,
  ArrowRight,
  Sparkles,
  Brain,
  Target,
  Zap,
  MessageSquare,
  CheckCircle,
  BarChart3,
  Users,
  TrendingUp,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MarketingNav from "@/components/MarketingNav";
import MarketingFooter from "@/components/MarketingFooter";
import { useContactModal } from "@/contexts/ContactModalContext";

// 英雄区域组件
const HeroSection = React.memo(() => {
  const { openModal } = useContactModal();

  return (
    <section className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-cyan-900 py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="p-6 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full shadow-lg shadow-blue-500/50">
              <Building className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-400 to-cyan-400 bg-clip-text text-transparent">
            企业级营销解决方案
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            专为B2B企业服务商打造的智能营销平台，助力企业实现高效获客、精准转化和持续增长
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => openModal({
                title: '企业级解决方案演示',
                description: '了解企业级营销解决方案如何帮助您的企业实现高效获客和转化。',
              })}
              className="text-lg px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 border-0 shadow-lg shadow-blue-500/25 text-white font-semibold"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              立即体验
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => openModal({
                title: '企业级解决方案演示',
                description: '了解企业级营销解决方案如何帮助您的企业实现高效获客和转化。',
              })}
              className="text-lg px-8 py-4 border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-white bg-cyan-500/10 backdrop-blur-sm shadow-lg shadow-cyan-500/20 transition-all duration-300"
            >
              观看演示
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
});

// 核心功能组件
const CoreFeatures = React.memo(() => {
  const features = [
    {
      icon: <Target className="h-8 w-8 text-blue-400" />,
      title: '精准获客',
      description: '基于AI的潜在客户识别和评分，提高销售线索质量',
    },
    {
      icon: <Brain className="h-8 w-8 text-cyan-400" />,
      title: '销售流程优化',
      description: '智能销售流程管理，提升成单效率和客户体验',
    },
    {
      icon: <Users className="h-8 w-8 text-purple-400" />,
      title: '客户成功管理',
      description: '全生命周期客户管理，提高续费率和客户满意度',
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-orange-400" />,
      title: '营销数据分析',
      description: '深度营销数据分析，优化营销策略和投入产出比',
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-800 to-gray-900 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-cyan-500/5"></div>
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
            核心功能
          </h2>
          <p className="text-xl text-gray-400">
            专业的B2B营销解决方案，助力企业服务商实现可持续增长
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="h-full bg-gray-800/50 border-gray-700 hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="inline-flex p-4 rounded-full bg-gradient-to-r from-gray-700 to-gray-800 border border-gray-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-300">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
});

// 应用场景组件
const UseCases = React.memo(() => {
  const cases = [
    {
      title: "SaaS产品营销",
      description: "针对SaaS产品特性，制定精准的获客和转化策略，提升试用到付费转化率",
      features: ["免费试用优化", "付费转化策略", "产品使用分析", "客户生命周期管理"],
    },
    {
      title: "企业解决方案销售",
      description: "复杂B2B解决方案的销售流程管理，提升大客户成单效率",
      features: ["决策链分析", "方案定制化", "销售流程管理", "客户关系维护"],
    },
    {
      title: "专业服务营销",
      description: "咨询、培训等专业服务的营销策略，建立专业品牌影响力",
      features: ["专业内容营销", "行业影响力建设", "客户案例推广", "口碑营销管理"],
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-900 to-black relative">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-blue-500/5"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-4">应用场景</h2>
          <p className="text-xl text-gray-400">
            覆盖B2B���业服务全链路，从获客到成交再到续费的完整闭环
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {cases.map((useCase, index) => (
            <Card key={index} className="h-full bg-gray-800/50 border-gray-700 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-white mb-3">
                  {useCase.title}
                </h3>
                <p className="text-gray-300 mb-4">{useCase.description}</p>
                <div className="space-y-2">
                  {useCase.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center text-sm text-gray-300">
                      <CheckCircle className="h-4 w-4 text-cyan-400 mr-2" />
                      {feature}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
});

// 效果数据组件
const Results = React.memo(() => {
  const stats = [
    { number: "72%", label: '销售线索质量提升', color: "text-blue-400" },
    { number: "58%", label: '销售周期缩短', color: "text-cyan-400" },
    { number: "64%", label: '客户续费率提升', color: "text-purple-400" },
    { number: "89%", label: '客户满意度', color: "text-orange-400" },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-800 to-gray-900 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-cyan-500/10"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            效果数据
          </h2>
          <p className="text-xl text-gray-300">
            真实企业服务商数据验证，全面提升B2B营销效率和成单率
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className={`text-4xl font-bold ${stat.color} mb-2`}>
                {stat.number}
              </div>
              <div className="text-gray-300">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

export default function EnterpriseSolution() {
  const { openModal } = useContactModal();

  return (
    <div className="min-h-screen bg-gray-900">
      <MarketingNav />
      <HeroSection />
      <CoreFeatures />
      <UseCases />
      <Results />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-900 via-cyan-900 to-teal-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-transparent to-cyan-500/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
            开启企业级智能营销之旅
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            专业的营销解决方案，助力企业实现可持续增长
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => openModal({
                title: '免费试用',
                description: '了解企业级营销解决方案如何帮助您的企业实现高效获客和转化。',
              })}
              className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 border-0 shadow-lg shadow-blue-500/25 text-white font-semibold text-lg px-8 py-4"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              免费试用
            </Button>
            <Button
              size="lg"
              onClick={() => openModal({
                title: '联系企业专家',
                description: '与我们的企业营销专家一对一沟通，获取定制化的解决方案。',
              })}
              className="bg-transparent border-2 border-cyan-500/80 text-cyan-400 hover:bg-cyan-500 hover:text-white backdrop-blur-sm text-lg px-8 py-4 font-bold shadow-lg shadow-cyan-500/20 transition-all duration-300"
            >
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
