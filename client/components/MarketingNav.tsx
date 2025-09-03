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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useContactModal } from "@/contexts/ContactModalContext";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function MarketingNav() {
  const { openModal } = useContactModal();
  const { t } = useTranslation();

  return (
    <nav className="bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/marketing" className="flex items-center group">
              <Bot className="h-8 w-8 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {t('nav.platformName')}
              </span>
            </Link>

            {/* 产品特色下拉菜单 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-1 text-gray-300 hover:text-white hover:bg-gray-800">
                  {t('nav.productFeatures')}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 bg-gray-800 border-gray-700">
                <DropdownMenuItem asChild>
                  <Link
                    to="/features/ai-marketing"
                    className="flex items-center gap-2 w-full text-gray-300 hover:text-white hover:bg-gray-700"
                  >
                    <Bot className="h-4 w-4 text-cyan-400" />
                    {t('nav.aiMarketing')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/features/user-profiling"
                    className="flex items-center gap-2 w-full text-gray-300 hover:text-white hover:bg-gray-700"
                  >
                    <Users className="h-4 w-4 text-green-400" />
                    {t('nav.userProfiling')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/features/real-time-monitoring"
                    className="flex items-center gap-2 w-full text-gray-300 hover:text-white hover:bg-gray-700"
                  >
                    <Activity className="h-4 w-4 text-purple-400" />
                    {t('nav.realTimeMonitoring')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/features/effect-tracking"
                    className="flex items-center gap-2 w-full text-gray-300 hover:text-white hover:bg-gray-700"
                  >
                    <Target className="h-4 w-4 text-red-400" />
                    {t('nav.effectTracking')}
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 解决方案下拉菜单 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-1 text-gray-300 hover:text-white hover:bg-gray-800">
                  {t('nav.solutions')}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 bg-gray-800 border-gray-700">
                <DropdownMenuItem asChild>
                  <Link
                    to="/solutions/ecommerce"
                    className="flex items-center gap-2 w-full text-gray-300 hover:text-white hover:bg-gray-700"
                  >
                    <ShoppingCart className="h-4 w-4 text-orange-400" />
                    {t('nav.ecommerce')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/solutions/content-marketing"
                    className="flex items-center gap-2 w-full text-gray-300 hover:text-white hover:bg-gray-700"
                  >
                    <FileText className="h-4 w-4 text-purple-400" />
                    {t('nav.contentMarketing')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/solutions/financial-marketing"
                    className="flex items-center gap-2 w-full text-gray-300 hover:text-white hover:bg-gray-700"
                  >
                    <DollarSign className="h-4 w-4 text-green-400" />
                    {t('nav.financialMarketing')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/solutions/enterprise-services"
                    className="flex items-center gap-2 w-full text-gray-300 hover:text-white hover:bg-gray-700"
                  >
                    <Building className="h-4 w-4 text-blue-400" />
                    {t('nav.enterpriseServices')}
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center space-x-4">
            {/* Language switcher hidden */}
            <Button
              variant="outline"
              onClick={() => openModal({
                title: t('nav.contactUs'),
                description: '请填写您的信息和需求，我们将尽快与您联系，为您提供专业的AI营销解决方案咨询。',
              })}
              className="border-green-500 text-green-400 hover:bg-green-500 hover:text-white bg-green-500/10 backdrop-blur-sm shadow-lg shadow-green-500/20 transition-all duration-300"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              {t('nav.contactUs')}
            </Button>
            <Link to="/auth">
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 border-0 shadow-lg shadow-cyan-500/25">
                {t('nav.startAI')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
