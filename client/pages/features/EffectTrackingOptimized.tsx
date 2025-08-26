import React from "react";
import { Link } from "react-router-dom";
import {
  Target,
  ArrowRight,
  Sparkles,
  TrendingUp,
  BarChart3,
  PieChart,
  Calculator,
  Eye,
  Filter,
  Calendar,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MarketingNav from "@/components/MarketingNav";
import FeatureCard from "@/components/FeatureCard";
import LazySection from "@/components/LazySection";

// 抽取英雄区域组件
const HeroSection = React.memo(() => (
  <section className="bg-gradient-to-br from-red-50 to-orange-100 py-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-red-600 rounded-full">
            <Target className="h-12 w-12 text-white" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          效果追踪
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          全链路效果追踪，量化营销ROI和转化效果，
          提供精准的数据分析���优化建议，让每一分投入都可衡量
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/auth">
            <Button size="lg" className="bg-red-600 hover:bg-red-700 text-lg px-8 py-4">
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
));

// 核心功能数据
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

// 核心功能区域组件
const CoreFeaturesSection = React.memo(() => (
  <section className="py-20 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">核心功能</h2>
        <p className="text-xl text-gray-600">全方位效果追踪解决方案</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {features.map((feature, index) => (
          <FeatureCard key={index} {...feature} />
        ))}
      </div>
    </div>
  </section>
));

// 简化的优势列表组件
const AdvantagesSection = React.memo(() => {
  const advantages = [
    "跨平台数据整合",
    "实时效果监控", 
    "智能归因分析",
    "多维度报表分析",
    "预测性洞察",
    "自动化报告生成"
  ];

  return (
    <section className="py-20 bg-red-600">
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-white mb-4">
          量化每一分营销投入
        </h2>
        <p className="text-xl text-red-100 mb-8">
          让数据驱动您的营销决策
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {advantages.map((advantage, index) => (
            <div key={index} className="flex items-center text-white">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>{advantage}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/auth">
            <Button size="lg" className="bg-white text-red-600 hover:bg-gray-100 text-lg px-8 py-4">
              <Target className="mr-2 h-5 w-5" />
              立即开始追踪
            </Button>
          </Link>
          <Button size="lg" className="bg-white text-red-600 border-2 border-white hover:bg-red-50 hover:text-red-700 text-lg px-8 py-4 font-bold shadow-lg">
            预约产品演示
          </Button>
        </div>
      </div>
    </section>
  );
});

export default function EffectTrackingOptimized() {
  return (
    <div className="min-h-screen bg-white">
      {/* 导航栏 */}
      <MarketingNav />

      {/* 英雄区域 - 立即加载 */}
      <HeroSection />

      {/* 核心功能 - 立即加载 */}
      <CoreFeaturesSection />

      {/* 其他内容 - 延迟加载 */}
      <LazySection className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">技术架构</h2>
            <p className="text-xl text-gray-600">基于大数据和AI的效果追踪平台</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">平台能力</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600 mb-2">100万+</div>
                  <div className="text-gray-600">日处理事件</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600 mb-2">99.9%</div>
                  <div className="text-gray-600">数据准确率</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600 mb-2">&lt;1s</div>
                  <div className="text-gray-600">实时响应</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600 mb-2">300%</div>
                  <div className="text-gray-600">ROI提升</div>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h4 className="text-xl font-semibold text-gray-900 mb-4">追踪指标</h4>
              <div className="space-y-3">
                {["转化率", "ROI/ROAS", "客户获取成本", "生命周期价值"].map((metric, index) => (
                  <div key={index} className="flex items-center">
                    <BarChart3 className="h-5 w-5 text-red-600 mr-3" />
                    <span className="text-gray-600">{metric}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </LazySection>

      {/* CTA区域 */}
      <AdvantagesSection />
    </div>
  );
}
