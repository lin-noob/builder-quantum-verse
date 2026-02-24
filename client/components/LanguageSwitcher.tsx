import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Languages, Loader2, AlertCircle, Check } from "lucide-react";
import { useI18nConfig } from "@/hooks/useI18nConfig";
import { useNavigate } from 'react-router-dom';

export function LanguageSwitcher() {
  const {
    langCode,
    currentLanguage,
    availableLanguages,
    languagesLoading,
    languagesError,
    changeLanguage,
    getSupportedLanguages,
  } = useI18nConfig();
  const navigate = useNavigate();
  // 获取要显示的语言列表（优先使用API数据）
  const languagesToDisplay = availableLanguages.length > 0
    ? availableLanguages
    : getSupportedLanguages();

  // 获取当前显示的语言信息（优先使用API数据）
  const getDisplayLanguage = () => {
    // 首先尝试从API数据中找到当前语言
    const apiLanguage = availableLanguages.find(lang => lang.code === langCode);
    if (apiLanguage) {
      return apiLanguage;
    }

    // 如果API数据没有，尝试从默认支持的语言中找
    const supportedLanguage = getSupportedLanguages().find(lang => lang.code === langCode);
    if (supportedLanguage) {
      return supportedLanguage;
    }

    // 最后回退到当前语言配置
    return currentLanguage;
  };

  const displayLanguage = getDisplayLanguage();

  const handleLanguageChange = (newLangCode: string) => {
    changeLanguage(newLangCode);
    window.location.reload();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2 relative">
          {languagesLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : languagesError ? (
            <AlertCircle className="h-4 w-4 text-orange-500" />
          ) : (
            <Languages className="h-4 w-4" />
          )}
          
          <span className="hidden md:inline flex items-center gap-1">
            <span className="text-lg">{displayLanguage.flag}</span>
            <span>{displayLanguage.name}</span>
          </span>

          {/* 仅在移动端显示旗帜 */}
          <span className="md:hidden text-lg">{displayLanguage.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-48">
        {/* 语言列表 */}
        {languagesToDisplay.length > 0 ? (
          languagesToDisplay.map((language) => (
            <DropdownMenuItem 
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`flex items-center gap-3 cursor-pointer ${
                langCode === language.code 
                  ? 'bg-primary/10 text-primary' 
                  : 'hover:bg-muted'
              }`}
            >
              <span className="text-lg">{language.flag}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{language.name}</span>
                  {langCode === language.code && (
                    <Check className="h-3 w-3 text-primary" />
                  )}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {language.nativeName}
                </div>
              </div>
              <code className="text-xs text-muted-foreground">
                {language.code}
              </code>
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled className="text-center">
            {languagesLoading ? 'Loading languages...' : 'No languages available'}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default LanguageSwitcher;
