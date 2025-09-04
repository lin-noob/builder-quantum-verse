import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MarketingNav from '@/components/MarketingNav';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function I18nTest() {
  const { t, i18n } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-900">
      <MarketingNav />
      
      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            多语言功能测试页面
          </h1>
          <p className="text-gray-300">
            当前语言: {i18n.language} | Current Language: {i18n.language}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 语言切换器测试 */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">语言切换器</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h3 className="text-white font-semibold">Header 版本：</h3>
                <LanguageSwitcher variant="header" size="md" />
                
                <h3 className="text-white font-semibold">Footer 版本：</h3>
                <LanguageSwitcher variant="footer" />
              </div>
            </CardContent>
          </Card>

          {/* 翻译内容测试 */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">导航栏翻译测试</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-gray-300">
              <div><strong>平台名称:</strong> {t('nav.platformName')}</div>
              <div><strong>产品特色:</strong> {t('nav.productFeatures')}</div>
              <div><strong>解决方案:</strong> {t('nav.solutions')}</div>
              <div><strong>联系我们:</strong> {t('nav.contactUs')}</div>
              <div><strong>启动AI:</strong> {t('nav.startAI')}</div>
            </CardContent>
          </Card>

          {/* Hero 区域翻译测试 */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Hero 区域翻译测试</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-gray-300">
              <div><strong>标题:</strong> {t('hero.aiMarketingTitle')}</div>
              <div><strong>立即体验:</strong> {t('hero.ctaPrimary')}</div>
              <div><strong>观看演示:</strong> {t('hero.ctaSecondary')}</div>
              <div><strong>免费试用:</strong> {t('hero.ctaFreeTrial')}</div>
            </CardContent>
          </Card>

          {/* 功能区域翻译测试 */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">功能区域翻译测试</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-gray-300">
              <div><strong>核心功能:</strong> {t('features.title')}</div>
              <div><strong>AI智能营销:</strong> {t('features.aiMarketingTitle')}</div>
              <div><strong>用户画像:</strong> {t('features.userProfilingTitle')}</div>
              <div><strong>实时监控:</strong> {t('features.realTimeMonitoringTitle')}</div>
            </CardContent>
          </Card>

          {/* CTA 区域翻译测试 */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">CTA 区域翻译测试</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-gray-300">
              <div><strong>主页标题:</strong> {t('cta.homeTitle')}</div>
              <div><strong>主要操作:</strong> {t('cta.primaryAction')}</div>
              <div><strong>联系专家:</strong> {t('cta.secondaryAction')}</div>
            </CardContent>
          </Card>

          {/* 统计数据翻译测试 */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">统计数据翻译测试</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-gray-300">
              <div><strong>转化率提升:</strong> {t('stats.conversionIncrease')}</div>
              <div><strong>效率提升:</strong> {t('stats.efficiencyIncrease')}</div>
              <div><strong>成本降低:</strong> {t('stats.costReduction')}</div>
              <div><strong>系统稳定性:</strong> {t('stats.systemStability')}</div>
            </CardContent>
          </Card>
        </div>

        {/* 多语言切换测试按钮 */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-white mb-6">快速语言切换测试</h2>
          <div className="flex justify-center gap-4 flex-wrap">
            <Button 
              onClick={() => i18n.changeLanguage('zh')}
              variant={i18n.language === 'zh' ? 'default' : 'outline'}
              className="bg-red-600 hover:bg-red-700"
            >
              🇨🇳 中文
            </Button>
            <Button 
              onClick={() => i18n.changeLanguage('en')}
              variant={i18n.language === 'en' ? 'default' : 'outline'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              🇺🇸 English
            </Button>
            <Button 
              onClick={() => i18n.changeLanguage('ja')}
              variant={i18n.language === 'ja' ? 'default' : 'outline'}
              className="bg-red-500 hover:bg-red-600"
            >
              🇯🇵 日本語
            </Button>
            <Button 
              onClick={() => i18n.changeLanguage('fr')}
              variant={i18n.language === 'fr' ? 'default' : 'outline'}
              className="bg-blue-500 hover:bg-blue-600"
            >
              🇫🇷 Français
            </Button>
          </div>
        </div>

        {/* 当前语言信息 */}
        <div className="mt-8 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-white font-semibold mb-2">当前语言信息：</h3>
          <div className="text-gray-300 space-y-1">
            <div>语言代码: {i18n.language}</div>
            <div>可用语言: {i18n.languages.join(', ')}</div>
            <div>回退语言: {i18n.options.fallbackLng}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
