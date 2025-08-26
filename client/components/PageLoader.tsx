import { Bot, Users, Activity, Target } from "lucide-react";

interface PageLoaderProps {
  type?: "ai-marketing" | "user-profiling" | "real-time-monitoring" | "effect-tracking";
}

export default function PageLoader({ type = "ai-marketing" }: PageLoaderProps) {
  const configs = {
    "ai-marketing": {
      icon: Bot,
      color: "border-blue-600",
      bgColor: "bg-blue-50",
      title: "AI智能营销"
    },
    "user-profiling": {
      icon: Users,
      color: "border-green-600", 
      bgColor: "bg-green-50",
      title: "用户画像分析"
    },
    "real-time-monitoring": {
      icon: Activity,
      color: "border-purple-600",
      bgColor: "bg-purple-50", 
      title: "实时监控中心"
    },
    "effect-tracking": {
      icon: Target,
      color: "border-red-600",
      bgColor: "bg-red-50",
      title: "效果追踪"
    }
  };

  const config = configs[type];
  const IconComponent = config.icon;

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen ${config.bgColor}`}>
      <div className="text-center">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full border-4 ${config.color} mb-6 animate-pulse`}>
          <IconComponent className="h-8 w-8 text-gray-600" />
        </div>
        <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${config.color} mx-auto mb-4`}></div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{config.title}</h3>
        <p className="text-gray-600">正在加载页面内容...</p>
      </div>
    </div>
  );
}
