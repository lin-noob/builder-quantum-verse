import { Link } from "react-router-dom";
import { Bot } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function MarketingFooter() {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-50 text-gray-900 py-12 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Bot className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">AI营销平台</span>
            </div>
            <p className="text-gray-600">
              专业的AI驱动营销解决方案，助力企业实现营销效果的指数级提升。
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">产品功能</h3>
            <ul className="space-y-2 text-gray-600">
              <li>
                <Link to="/features/ai-marketing" className="hover:text-blue-600 transition-colors">
                  {t('nav.aiMarketing')}
                </Link>
              </li>
              <li>
                <Link to="/features/user-profiling" className="hover:text-blue-600 transition-colors">
                  {t('nav.userProfiling')}
                </Link>
              </li>
              <li>
                <Link to="/features/real-time-monitoring" className="hover:text-blue-600 transition-colors">
                  {t('nav.realTimeMonitoring')}
                </Link>
              </li>
              <li>
                <Link to="/features/effect-tracking" className="hover:text-blue-600 transition-colors">
                  {t('nav.effectTracking')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('nav.solutions')}</h3>
            <ul className="space-y-2 text-gray-600">
              <li>
                <Link to="/solutions/ecommerce" className="hover:text-blue-600 transition-colors">
                  {t('nav.ecommerce')}
                </Link>
              </li>
              <li>
                <Link to="/solutions/content-marketing" className="hover:text-blue-600 transition-colors">
                  {t('nav.contentMarketing')}
                </Link>
              </li>
              <li>
                <Link to="/solutions/financial-marketing" className="hover:text-blue-600 transition-colors">
                  {t('nav.financialMarketing')}
                </Link>
              </li>
              <li>
                <Link to="/solutions/enterprise-services" className="hover:text-blue-600 transition-colors">
                  {t('nav.enterpriseServices')}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-600">
          <p>{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
}
