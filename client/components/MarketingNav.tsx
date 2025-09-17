import { Link } from "react-router-dom";
import {
  Bot,
  Target,
  Users,
  Activity,
  ArrowRight,
  ChevronDown,
  ShoppingCart,
  FileText,
  DollarSign,
  Building,
  MessageCircle,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useContactModal } from "@/contexts/ContactModalContext";
import { LanguageSwitcher } from "./LanguageSwitcher";

export default function MarketingNav() {
  const { openModal } = useContactModal();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/marketing" className="flex items-center group">
              <Bot className="h-8 w-8 text-blue-600 group-hover:text-blue-700 transition-colors" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                AI营销平台
              </span>
            </Link>

            {/* 产品特色下拉菜单 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-1 text-gray-700 hover:text-gray-900 hover:bg-gray-100">
                  产品特色
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 bg-white border-gray-200">
                <DropdownMenuItem asChild>
                  <Link
                    to="/features/ai-marketing"
                    className="flex items-center gap-2 w-full text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  >
                    <Bot className="h-4 w-4 text-blue-600" />
                    AI营销
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/features/user-profiling"
                    className="flex items-center gap-2 w-full text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  >
                    <Users className="h-4 w-4 text-green-600" />
                    用户画像
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/features/real-time-monitoring"
                    className="flex items-center gap-2 w-full text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  >
                    <Activity className="h-4 w-4 text-purple-600" />
                    实时监控
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/features/effect-tracking"
                    className="flex items-center gap-2 w-full text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  >
                    <Target className="h-4 w-4 text-red-600" />
                    效果追踪
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 解决方案下拉菜单 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-1 text-gray-700 hover:text-gray-900 hover:bg-gray-100">
                  解决方案
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 bg-white border-gray-200">
                <DropdownMenuItem asChild>
                  <Link
                    to="/solutions/ecommerce"
                    className="flex items-center gap-2 w-full text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  >
                    <ShoppingCart className="h-4 w-4 text-orange-600" />
                    电商营销
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/solutions/content-marketing"
                    className="flex items-center gap-2 w-full text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  >
                    <FileText className="h-4 w-4 text-purple-600" />
                    内容营销
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/solutions/financial-marketing"
                    className="flex items-center gap-2 w-full text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  >
                    <DollarSign className="h-4 w-4 text-green-600" />
                    金融营销
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/solutions/enterprise-services"
                    className="flex items-center gap-2 w-full text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  >
                    <Building className="h-4 w-4 text-blue-600" />
                    企业服务
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 资源与支持下拉菜单 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-1 text-gray-700 hover:text-gray-900 hover:bg-gray-100">
                  资源与支持
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 bg-white border-gray-200">
                <DropdownMenuItem asChild>
                  <Link
                    to="/marketing/help"
                    className="flex items-center gap-2 w-full text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  >
                    <HelpCircle className="h-4 w-4 text-blue-600" />
                    帮助中心
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center space-x-4">
            {/* 多语言切换 */}
            <LanguageSwitcher />
            
            <Button
              variant="outline"
              onClick={() => openModal({
                title: "联系我们",
                description: '请填写您的信息和需求，我们将尽快与您联系，为您提供专业的AI营销解决方案咨询。',
              })}
              className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              联系我们
            </Button>
            <Link to="/auth">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                开始AI之旅
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}