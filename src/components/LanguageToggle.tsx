import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <motion.button
      onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
      whileHover={{ scale: 1.05, borderColor: 'hsl(var(--primary) / 0.6)', backgroundColor: 'hsl(var(--primary) / 0.1)' }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center gap-1.5 px-2 py-1 text-xs font-mono border border-primary/30 transition-all"
      style={{ borderRadius: '2px' }}
      title="Switch Language"
    >
      <Globe className="w-3.5 h-3.5" />
      <span>{lang === 'en' ? 'EN' : '中文'}</span>
    </motion.button>
  );
}
