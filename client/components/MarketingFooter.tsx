import { Link } from "react-router-dom";
import { Bot } from "lucide-react";
// import { useTranslation } from "react-i18next";

export default function MarketingFooter() {

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white py-12 relative">
      {/* 微妙的光效覆盖 */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Bot className="h-8 w-8 text-cyan-400" />
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">AI营销平台</span>
            </div>
            <p className="text-gray-400">
              专业的AI驱动营销解决方案，助力企业实现营销效果的指数级提升。
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">产品功能</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link to="/features/ai-marketing" className="hover:text-white transition-colors">
                  AI智能营销
                </Link>
              </li>
              <li>
                <Link to="/features/user-profiling" className="hover:text-white transition-colors">
                  用户画像分析
                </Link>
              </li>
              <li>
                <Link to="/features/real-time-monitoring" className="hover:text-white transition-colors">
                  实时监控中心
                </Link>
              </li>
              <li>
                <Link to="/features/effect-tracking" className="hover:text-white transition-colors">
                  效果追踪
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">解决方案</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link to="/solutions/ecommerce" className="hover:text-white transition-colors">
                  电商营销
                </Link>
              </li>
              <li>
                <Link to="/solutions/content-marketing" className="hover:text-white transition-colors">
                  内容营销
                </Link>
              </li>
              <li>
                <Link to="/solutions/financial-marketing" className="hover:text-white transition-colors">
                  金融营销
                </Link>
              </li>
              <li>
                <Link to="/solutions/enterprise-services" className="hover:text-white transition-colors">
                  企业服务
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>© 2024 AI营销平台. 保留所有权利.</p>
        </div>
      </div>
    </footer>
  );
}
