import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function TranslationTest() {
  const { t, i18n } = useTranslation();

  const testKeys = [
    'nav.platformName',
    'nav.productFeatures', 
    'hero.userProfilingTitle',
    'hero.userProfilingDescription',
    'features.title',
    'features.subtitle'
  ];

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <h1 className="text-2xl font-bold text-white mb-4">Translation Test Page</h1>
          <div className="mb-4">
            <p className="text-gray-300">Current Language: <span className="text-cyan-400">{i18n.language}</span></p>
            <p className="text-gray-300">Resolved Language: <span className="text-cyan-400">{i18n.resolvedLanguage}</span></p>
          </div>
          <LanguageSwitcher />
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-white mb-4">Translation Test Results:</h2>
          <div className="space-y-4">
            {testKeys.map((key) => (
              <div key={key} className="border-b border-gray-700 pb-2">
                <div className="text-sm text-gray-400">{key}:</div>
                <div className="text-white">{t(key)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg mt-8">
          <h2 className="text-xl font-bold text-white mb-4">Manual Language Switch Test:</h2>
          <div className="flex gap-4">
            <Button onClick={() => i18n.changeLanguage('zh')} className="bg-blue-500">
              Switch to Chinese (zh)
            </Button>
            <Button onClick={() => i18n.changeLanguage('en')} className="bg-green-500">
              Switch to English (en)
            </Button>
            <Button onClick={() => i18n.changeLanguage('ja')} className="bg-purple-500">
              Switch to Japanese (ja)
            </Button>
            <Button onClick={() => i18n.changeLanguage('fr')} className="bg-orange-500">
              Switch to French (fr)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
