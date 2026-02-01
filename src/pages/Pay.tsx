import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Terminal, ExternalLink, Loader2 } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { GlassCard } from '@/components/ui/glass-card';
import { NeonButton } from '@/components/ui/neon-button';
import { useWallet } from '@/lib/web3/hooks';
import { useLanguage } from '@/lib/i18n';
import { getExplorerUrl } from '@/lib/web3/config';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

type PayResult = { ok: true; txHash: string; userOpHash?: string } | { ok: false; code: string; message: string };

export default function PayPage() {
  const { isConnected } = useWallet();
  const { t } = useLanguage();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('0.001');
  const [paymentMode, setPaymentMode] = useState<'eoa' | 'aa'>('eoa');
  const [executeOnchain, setExecuteOnchain] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PayResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: recipient.trim() || undefined,
          amount: amount.trim() || undefined,
          paymentMode,
          executeOnchain,
        }),
      });
      const data = (await res.json()) as PayResult & { error?: string };
      if (data.error) setResult({ ok: false, code: 'error', message: data.error });
      else setResult(data);
    } catch (err) {
      setResult({
        ok: false,
        code: 'network',
        message: err instanceof Error ? err.message : t('pay.networkError'),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout
      title={t('pay.title')}
      icon={<Send className="w-4 h-4 text-background" />}
      backTo="/"
    >
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-2xl">
        {!isConnected && (
          <GlassCard className="p-6 text-center">
            <p className="text-muted-foreground mb-4">{t('pay.walletNotice')}</p>
          </GlassCard>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="control-panel"
        >
          <div className="panel-title flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            {t('pay.subtitle')}
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            {t('pay.description')}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-mono text-muted-foreground mb-1">{t('pay.recipient')} (recipient)</label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x..."
                className="w-full terminal-input font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-mono text-muted-foreground mb-1">{t('pay.amount')} (amount)</label>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.001"
                className="w-full terminal-input font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-mono text-muted-foreground mb-2">{t('pay.mode')} (paymentMode)</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    checked={paymentMode === 'eoa'}
                    onChange={() => setPaymentMode('eoa')}
                    className="accent-primary"
                  />
                  <span className="font-mono text-sm">EOA</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    checked={paymentMode === 'aa'}
                    onChange={() => setPaymentMode('aa')}
                    className="accent-primary"
                  />
                  <span className="font-mono text-sm">AA</span>
                </label>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="execute"
                checked={executeOnchain}
                onChange={(e) => setExecuteOnchain(e.target.checked)}
                className="accent-primary"
              />
              <label htmlFor="execute" className="text-sm font-mono text-muted-foreground">
                {t('pay.executeOnchain')} (executeOnchain)
              </label>
            </div>
            <NeonButton type="submit" disabled={loading} className="w-full">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {loading ? ` ${t('pay.submitting')}` : ` ${t('pay.submit')}`}
            </NeonButton>
          </form>
        </motion.div>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 control-panel ${result.ok ? 'border-primary/50' : 'border-destructive/50'}`}
          >
            <div className="panel-title font-mono text-sm">
              {result.ok ? `✓ ${t('pay.success')}` : `✗ ${result.code}`}
            </div>
            {result.ok ? (
              <div className="space-y-2 font-mono text-sm">
                <p>
                  <span className="text-muted-foreground">{t('pay.txHash')}</span>{' '}
                  <a
                    href={getExplorerUrl('tx', result.txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    {result.txHash.slice(0, 10)}...{result.txHash.slice(-8)}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
                {result.userOpHash && (
                  <p>
                    <span className="text-muted-foreground">{t('pay.userOpHash')}</span> {result.userOpHash.slice(0, 18)}...
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-destructive font-mono">{result.message}</p>
            )}
          </motion.div>
        )}
      </main>
    </Layout>
  );
}
