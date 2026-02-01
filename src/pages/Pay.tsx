import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Terminal, ExternalLink, Loader2, Wallet, Zap, CheckCircle2, XCircle } from 'lucide-react';
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
          className="control-panel group"
        >
          <div className="panel-title flex items-center gap-2">
            <motion.div
              className="w-8 h-8 rounded-lg gradient-amber flex items-center justify-center shadow-glow-primary"
              whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              <Send className="w-4 h-4 text-background" />
            </motion.div>
            {t('pay.subtitle')}
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            {t('pay.description')}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Recipient Input - Enhanced */}
            <div>
              <label className="block text-sm font-mono text-muted-foreground mb-2 flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                {t('pay.recipient')} (recipient)
              </label>
              <motion.input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x..."
                whileFocus={{ scale: 1.01, borderColor: 'hsl(var(--primary) / 0.6)' }}
                className="w-full terminal-input font-mono text-sm transition-all"
              />
            </div>

            {/* Amount Input - Enhanced */}
            <div>
              <label className="block text-sm font-mono text-muted-foreground mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                {t('pay.amount')} (amount)
              </label>
              <motion.input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.001"
                whileFocus={{ scale: 1.01, borderColor: 'hsl(var(--primary) / 0.6)' }}
                className="w-full terminal-input font-mono text-sm transition-all"
              />
            </div>

            {/* Payment Mode Selection - Card Style */}
            <div>
              <label className="block text-sm font-mono text-muted-foreground mb-3">{t('pay.mode')} (paymentMode)</label>
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  type="button"
                  onClick={() => setPaymentMode('eoa')}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    paymentMode === 'eoa'
                      ? 'border-primary bg-primary/10 shadow-glow-primary'
                      : 'border-border hover:border-primary/50 bg-muted/20'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      paymentMode === 'eoa' ? 'gradient-amber' : 'bg-muted'
                    }`}>
                      <Wallet className={`w-4 h-4 ${paymentMode === 'eoa' ? 'text-background' : 'text-muted-foreground'}`} />
                    </div>
                    <span className={`font-mono font-bold text-sm ${paymentMode === 'eoa' ? 'text-primary' : 'text-foreground'}`}>
                      EOA
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">Externally Owned Account</p>
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => setPaymentMode('aa')}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    paymentMode === 'aa'
                      ? 'border-primary bg-primary/10 shadow-glow-primary'
                      : 'border-border hover:border-primary/50 bg-muted/20'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      paymentMode === 'aa' ? 'gradient-emerald' : 'bg-muted'
                    }`}>
                      <Zap className={`w-4 h-4 ${paymentMode === 'aa' ? 'text-background' : 'text-muted-foreground'}`} />
                    </div>
                    <span className={`font-mono font-bold text-sm ${paymentMode === 'aa' ? 'text-primary' : 'text-foreground'}`}>
                      AA
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">Account Abstraction</p>
                </motion.button>
              </div>
            </div>

            {/* Amount Preview Card */}
            {amount && parseFloat(amount) > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 rounded-lg border border-primary/30 bg-primary/5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-muted-foreground uppercase">Preview</span>
                  <span className="text-lg font-bold font-mono text-primary">{amount}</span>
                </div>
              </motion.div>
            )}

            {/* Execute Onchain Checkbox - Enhanced */}
            <motion.div 
              whileHover={{ x: 4 }}
              className="flex items-center gap-3 p-3 rounded border border-border/50 bg-muted/20 cursor-pointer transition-all"
              onClick={() => setExecuteOnchain(!executeOnchain)}
            >
              <input
                type="checkbox"
                id="execute"
                checked={executeOnchain}
                onChange={(e) => setExecuteOnchain(e.target.checked)}
                className="accent-primary w-4 h-4"
              />
              <label htmlFor="execute" className="text-sm font-mono text-foreground cursor-pointer flex-1">
                {t('pay.executeOnchain')} (executeOnchain)
              </label>
            </motion.div>

            <NeonButton type="submit" disabled={loading} className="w-full" pulse={!loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {loading ? ` ${t('pay.submitting')}` : ` ${t('pay.submit')}`}
            </NeonButton>
          </form>
        </motion.div>

        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`mt-4 control-panel ${result.ok ? 'border-success/50 bg-success/5' : 'border-destructive/50 bg-destructive/5'}`}
            >
              <div className="flex items-center gap-3 mb-3">
                {result.ok ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="w-10 h-10 rounded-full gradient-emerald flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-5 h-5 text-background" />
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="w-10 h-10 rounded-full gradient-danger flex items-center justify-center"
                  >
                    <XCircle className="w-5 h-5 text-background" />
                  </motion.div>
                )}
                <div className="panel-title font-mono text-sm flex-1">
                  {result.ok ? t('pay.success') : result.code}
                </div>
              </div>
              {result.ok ? (
                <div className="space-y-3 font-mono text-sm">
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-3 rounded border border-success/30 bg-success/10"
                  >
                    <div className="text-xs text-muted-foreground mb-1">{t('pay.txHash')}</div>
                    <a
                      href={getExplorerUrl('tx', result.txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-success hover:underline inline-flex items-center gap-2 font-bold break-all"
                    >
                      {result.txHash.slice(0, 10)}...{result.txHash.slice(-8)}
                      <ExternalLink className="w-4 h-4 flex-shrink-0" />
                    </a>
                  </motion.div>
                  {result.userOpHash && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="p-3 rounded border border-primary/30 bg-primary/10"
                    >
                      <div className="text-xs text-muted-foreground mb-1">{t('pay.userOpHash')}</div>
                      <div className="text-primary font-bold break-all">{result.userOpHash}</div>
                    </motion.div>
                  )}
                </div>
              ) : (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-destructive font-mono p-3 rounded border border-destructive/30 bg-destructive/10"
                >
                  {result.message}
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </Layout>
  );
}
