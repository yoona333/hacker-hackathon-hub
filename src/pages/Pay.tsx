import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Send, ArrowLeft, Terminal, ExternalLink, Loader2 } from 'lucide-react';
import { ParticleBackground } from '@/components/3d/ParticleBackground';
import { GlassCard } from '@/components/ui/glass-card';
import { NeonButton } from '@/components/ui/neon-button';
import { NetworkBadge } from '@/components/ui/status-badge';
import { useWallet } from '@/lib/web3/hooks';
import { kiteTestnet, getExplorerUrl } from '@/lib/web3/config';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

type PayResult = { ok: true; txHash: string; userOpHash?: string } | { ok: false; code: string; message: string };

export default function PayPage() {
  const { isConnected, isCorrectNetwork } = useWallet();
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
        message: err instanceof Error ? err.message : '请求失败，请确认后端已启动（pnpm server）',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <ParticleBackground />
      <header className="sticky top-0 z-50 terminal-card border-x-0 border-t-0" style={{ borderRadius: 0 }}>
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/">
              <motion.button
                whileHover={{ scale: 1.1 }}
                className="p-2 hover:bg-muted/50 border border-transparent hover:border-primary/30"
                style={{ borderRadius: '2px' }}
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 hex-clip gradient-amber flex items-center justify-center">
                <Send className="w-4 h-4 text-background" />
              </div>
              <span className="text-sm sm:text-lg font-bold font-mono terminal-text uppercase">Pay</span>
            </div>
          </div>
          <NetworkBadge connected={isCorrectNetwork} chainName={kiteTestnet.name} />
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 sm:py-6 max-w-2xl">
        {!isConnected && (
          <GlassCard className="p-6 text-center">
            <p className="text-muted-foreground mb-4">本页发起支付由后端 API 执行（使用 .env 私钥），连接钱包仅用于展示网络状态。</p>
          </GlassCard>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="control-panel"
        >
          <div className="panel-title flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            发起支付（AgentPayGuard API）
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            请求主仓后端 <code className="bg-muted px-1">pnpm server</code>，不填则使用 .env 默认 RECIPIENT / AMOUNT。
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-mono text-muted-foreground mb-1">收款地址 (recipient)</label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x..."
                className="w-full terminal-input font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-mono text-muted-foreground mb-1">金额 (amount)</label>
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.001"
                className="w-full terminal-input font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-mono text-muted-foreground mb-2">支付模式 (paymentMode)</label>
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
                真实发链上交易 (executeOnchain)
              </label>
            </div>
            <NeonButton type="submit" disabled={loading} className="w-full">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {loading ? ' 请求中...' : ' 发起支付'}
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
              {result.ok ? '✓ 成功' : `✗ ${result.code}`}
            </div>
            {result.ok ? (
              <div className="space-y-2 font-mono text-sm">
                <p>
                  <span className="text-muted-foreground">txHash:</span>{' '}
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
                    <span className="text-muted-foreground">userOpHash:</span> {result.userOpHash.slice(0, 18)}...
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-destructive font-mono">{result.message}</p>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}
