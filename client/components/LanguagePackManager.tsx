import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Download, Trash2 } from 'lucide-react';
import { useLanguagePack } from '@/hooks/useLanguagePack';
import { useToast } from '@/hooks/use-toast';

/**
 * 语言包管理组件
 * 用于测试和管理语言包的加载、刷新等功能
 */
export const LanguagePackManager: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const {
    isLoading,
    error,
    lastLoadedLang,
    currentLanguage,
    loadLanguagePack,
    refreshLanguagePack,
    preloadLanguagePacksAsync,
    getCachedLanguagePack,
    clearCache,
  } = useLanguagePack();

  const handleLoadLanguagePack = async (langCode: string) => {
    const success = await loadLanguagePack(langCode);
    if (success) {
      toast({
        title: "成功",
        description: `已加载 ${langCode} 语言包`,
      });
    } else {
      toast({
        title: "失败",
        description: `加载 ${langCode} 语言包失败`,
        variant: "destructive",
      });
    }
  };

  const handleRefreshLanguagePack = async () => {
    const success = await refreshLanguagePack();
    if (success) {
      toast({
        title: "成功",
        description: "已刷新当前语言包",
      });
    } else {
      toast({
        title: "失败",
        description: "刷新语言包失败",
        variant: "destructive",
      });
    }
  };

  const handlePreloadLanguagePacks = async () => {
    const success = await preloadLanguagePacksAsync(['zh', 'en']);
    if (success) {
      toast({
        title: "成功",
        description: "已预加载多个语言包",
      });
    } else {
      toast({
        title: "失败",
        description: "预加载语言包失败",
        variant: "destructive",
      });
    }
  };

  const handleClearCache = () => {
    clearCache();
    toast({
      title: "成功",
      description: "已清除所有语言包缓存",
    });
  };

  const handleClearCurrentCache = () => {
    clearCache(currentLanguage);
    toast({
      title: "成功",
      description: `已清除 ${currentLanguage} 语言包缓存`,
    });
  };

  const currentCachedEntries = getCachedLanguagePack(currentLanguage);
  const zhCachedEntries = getCachedLanguagePack('zh');
  const enCachedEntries = getCachedLanguagePack('en');

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          语言包管理器
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        </CardTitle>
        <CardDescription>
          管理和测试应用的语言包加载功能
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 状态显示 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">当前语言</label>
            <Badge variant="outline" className="ml-2">
              {currentLanguage}
            </Badge>
          </div>
          <div>
            <label className="text-sm font-medium">最后加载</label>
            <Badge variant="outline" className="ml-2">
              {lastLoadedLang || '无'}
            </Badge>
          </div>
        </div>

        {/* 错误显示 */}
        {error && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
            错误: {error}
          </div>
        )}

        {/* 缓存状态 */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">缓存状态</h4>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              中文: <Badge variant={zhCachedEntries.length > 0 ? "default" : "secondary"}>
                {zhCachedEntries.length} 条
              </Badge>
            </div>
            <div>
              英文: <Badge variant={enCachedEntries.length > 0 ? "default" : "secondary"}>
                {enCachedEntries.length} 条
              </Badge>
            </div>
            <div>
              当前: <Badge variant={currentCachedEntries.length > 0 ? "default" : "secondary"}>
                {currentCachedEntries.length} 条
              </Badge>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">加载语言包</h4>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleLoadLanguagePack('zh')}
                disabled={isLoading}
              >
                <Download className="h-4 w-4 mr-1" />
                中文
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleLoadLanguagePack('en')}
                disabled={isLoading}
              >
                <Download className="h-4 w-4 mr-1" />
                英文
              </Button>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">操作</h4>
            <div className="flex gap-2 flex-wrap">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefreshLanguagePack}
                disabled={isLoading}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                刷新当前
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handlePreloadLanguagePacks}
                disabled={isLoading}
              >
                <Download className="h-4 w-4 mr-1" />
                预加载全部
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleClearCurrentCache}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                清除当前缓存
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleClearCache}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                清除全部缓存
              </Button>
            </div>
          </div>
        </div>

        {/* 示例翻译测试 */}
        <div>
          <h4 className="text-sm font-medium mb-2">翻译测试</h4>
          <div className="p-3 bg-muted rounded-md text-sm">
            <div>静态翻译 (t('common.save')): {t('common.save', '保存')}</div>
            <div>静态翻译 (t('common.cancel')): {t('common.cancel', '取消')}</div>
            <div>API翻译示例 (如果已加载): {t('api.example.key', '这是API翻译')}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LanguagePackManager;
