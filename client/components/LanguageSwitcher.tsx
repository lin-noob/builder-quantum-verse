import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe, Check } from 'lucide-react';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const languages: Language[] = [
  {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳'
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸'
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵'
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷'
  }
];

interface LanguageSwitcherProps {
  variant?: 'header' | 'footer';
  size?: 'sm' | 'md' | 'lg';
}

export default function LanguageSwitcher({ 
  variant = 'header', 
  size = 'md' 
}: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
  };

  const buttonSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default';

  if (variant === 'footer') {
    return (
      <div className="flex flex-col space-y-2">
        <h3 className="text-sm font-semibold text-gray-400 mb-2">Language / 语言</h3>
        <div className="grid grid-cols-2 gap-2">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => changeLanguage(language.code)}
              className={`
                flex items-center space-x-2 p-2 rounded-lg text-sm transition-colors
                ${i18n.language === language.code 
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }
              `}
            >
              <span className="text-base">{language.flag}</span>
              <span className="truncate">{language.nativeName}</span>
              {i18n.language === language.code && (
                <Check className="h-3 w-3 ml-auto" />
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size={buttonSize}
          className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-gray-800"
        >
          <Globe className={`h-4 w-4 ${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'}`} />
          <span className="hidden sm:inline">{currentLanguage.flag}</span>
          <span className="hidden md:inline">{currentLanguage.nativeName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-48 bg-gray-800 border-gray-700"
      >
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={`
              flex items-center gap-3 w-full text-gray-300 hover:text-white hover:bg-gray-700 cursor-pointer
              ${i18n.language === language.code ? 'bg-gray-700 text-white' : ''}
            `}
          >
            <span className="text-base">{language.flag}</span>
            <div className="flex flex-col">
              <span className="font-medium">{language.nativeName}</span>
              <span className="text-xs text-gray-500">{language.name}</span>
            </div>
            {i18n.language === language.code && (
              <Check className="h-4 w-4 ml-auto text-blue-400" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
