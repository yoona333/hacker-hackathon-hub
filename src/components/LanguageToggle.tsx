import { Globe } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <button
      onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
      className="flex items-center gap-1.5 px-2 py-1 text-xs font-mono border border-primary/30 hover:border-primary/60 hover:bg-primary/10 transition-colors"
      style={{ borderRadius: '2px' }}
      title="Switch Language"
    >
      <Globe className="w-3.5 h-3.5" />
      <span>{lang === 'en' ? 'EN' : '中文'}</span>
    </button>
  );
}
