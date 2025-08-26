import { Link } from "react-router-dom";
import {
  Bot,
  Target,
  Users,
  Activity,
  ArrowRight,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function MarketingNav() {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center">
              <Bot className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">AI营销平台</span>
            </Link>

            {/* 产品特色下拉菜单 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-1">
                  产品特色
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/features/ai-marketing" className="flex items-center gap-2 w-full">
                    <Bot className="h-4 w-4 text-blue-600" />
                    AI智能营销
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/features/user-profiling" className="flex items-center gap-2 w-full">
                    <Users className="h-4 w-4 text-green-600" />
                    用户画像分析
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/features/real-time-monitoring" className="flex items-center gap-2 w-full">
                    <Activity className="h-4 w-4 text-purple-600" />
                    实时监控中心
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/features/effect-tracking" className="flex items-center gap-2 w-full">
                    <Target className="h-4 w-4 text-red-600" />
                    效果追踪
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center">
            <Link to="/auth">
              <Button className="bg-blue-600 hover:bg-blue-700">
                登录注册
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
