import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Terminal, ExternalLink, Loader2, Brain, Shield, CheckCircle2, XCircle } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { GlassCard } from '@/components/ui/glass-card';
import { NeonButton } from '@/components/ui/neon-button';
import { useWallet } from '@/lib/web3/hooks';
import { useLanguage } from '@/lib/i18n';
import { getExplorerUrl } from '@/lib/web3/config';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

interface PaymentIntent {
  recipient: string;
  amount: string;
  amountNumber: number;
  currency: string;
  purpose: string;
  riskLevel: 'low' | 'medium' | 'high';
  confidence: number;
  parsedSuccessfully: boolean;
  reasoning?: string;
}

interface RiskAssessment {
  score: number;
  level: 'low' | 'medium' | 'high';
  reasons: string[];
  recommendations: string[];
}

interface PolicyDecision {
  ok: boolean;
  code?: string;
  message?: string;
}

interface AIPayResponse {
  ok: boolean;
  intent?: PaymentIntent;
  risk?: RiskAssessment;
  policy?: PolicyDecision;
  txHash?: string;
  userOpHash?: string;
  error?: string;
  message?: string;
}

export default function AIPayPage() {
  const { isConnected, isCorrectNetwork } = useWallet();
  const { t } = useLanguage();
  const [request, setRequest] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIPayResponse | null>(null);
  const [executeOnchain, setExecuteOnchain] = useState(false);

  const handleParse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!request.trim()) return;
    
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/ai-pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request: request.trim(),
          executeOnchain,
        }),
      });
      const data = (await res.json()) as AIPayResponse;
      setResult(data);
    } catch (err) {
      setResult({
        ok: false,
        error: 'network',
        message: err instanceof Error ? err.message : t('aiPay.aiDisabled'),
      });
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-success';
      case 'medium': return 'text-primary';
      case 'high': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Layout
      title={t('aiPay.title')}
      icon={<Sparkles className="w-4 h-4 text-background" />}
      backTo="/"
    >
      <main className="container mx-auto px-4 py-4 sm:py-6 max-w-3xl">
        {!isConnected && (
          <GlassCard className="p-6 text-center mb-4">
            <p className="text-muted-foreground text-sm">{t('pay.walletNotice')}</p>
          </GlassCard>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="control-panel"
        >
          <div className="panel-title flex items-center gap-2">
            <Brain className="w-4 h-4" />
            {t('aiPay.subtitle')}
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            {t('aiPay.description')}
          </p>
          <div className="text-xs text-primary/80 mb-4 p-2 border border-primary/30 bg-primary/5" style={{ borderRadius: '2px' }}>
            💡 <strong>Confidence</strong>: AI's certainty in parsing (0-100%). Higher is better.
            <br />
            🔧 <strong>Payment Mode</strong>: Uses .env setting (EOA or AA)
          </div>

          <form onSubmit={handleParse} className="space-y-4">
            <div>
              <label className="block text-sm font-mono text-muted-foreground mb-2">
                Natural Language Request
              </label>
              <textarea
                value={request}
                onChange={(e) => setRequest(e.target.value)}
                placeholder={t('aiPay.placeholder')}
                className="w-full terminal-input font-mono text-sm min-h-[100px] resize-y bg-background text-foreground"
                disabled={loading}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="execute-ai"
                checked={executeOnchain}
                onChange={(e) => setExecuteOnchain(e.target.checked)}
                className="accent-primary"
                disabled={loading}
              />
              <label htmlFor="execute-ai" className="text-sm font-mono text-muted-foreground">
                {t('aiPay.executeOnchain')}
              </label>
            </div>
            <NeonButton type="submit" disabled={loading || !request.trim()} className="w-full">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {loading ? t('aiPay.parsing') : t('aiPay.submit')}
            </NeonButton>
          </form>
        </motion.div>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 space-y-4"
          >
            {/* Parsed Intent */}
            {result.intent && (
              <div className="control-panel">
                <div className="panel-title flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  {t('aiPay.parsed')}
                </div>
                <div className="space-y-2 font-mono text-sm">
                  <div className="inline-stat">
                    <span className="text-muted-foreground">{t('aiPay.recipient')}:</span>
                    <span className="text-foreground break-all">{result.intent.recipient}</span>
                  </div>
                  <div className="inline-stat">
                    <span className="text-muted-foreground">{t('aiPay.amount')}:</span>
                    <span className="text-foreground">{result.intent.amount}</span>
                  </div>
                  <div className="inline-stat">
                    <span className="text-muted-foreground">{t('aiPay.currency')}:</span>
                    <span className="text-foreground">{result.intent.currency}</span>
                  </div>
                  <div className="inline-stat">
                    <span className="text-muted-foreground">{t('aiPay.purpose')}:</span>
                    <span className="text-foreground">{result.intent.purpose}</span>
                  </div>
                  <div className="inline-stat">
                    <span className="text-muted-foreground">{t('aiPay.confidence')}:</span>
                    <span className="text-foreground">{(result.intent.confidence * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Risk Assessment */}
            {result.risk && (
              <div className="control-panel border-primary/30">
                <div className="panel-title flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  {t('aiPay.riskAssessment')}
                </div>
                <div className="space-y-2 font-mono text-sm">
                  <div className="inline-stat">
                    <span className="text-muted-foreground">{t('aiPay.riskScore')}:</span>
                    <span className={getRiskColor(result.risk.level)}>{result.risk.score}/100</span>
                  </div>
                  <div className="inline-stat">
                    <span className="text-muted-foreground">{t('aiPay.riskLevel')}:</span>
                    <span className={getRiskColor(result.risk.level)}>{result.risk.level.toUpperCase()}</span>
                  </div>
                  {result.risk.reasons.length > 0 && (
                    <div>
                      <span className="text-muted-foreground">{t('aiPay.riskReasons')}:</span>
                      <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                        {result.risk.reasons.map((reason, i) => (
                          <li key={i} className="text-foreground text-xs">{reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.risk.recommendations.length > 0 && (
                    <div>
                      <span className="text-muted-foreground">{t('aiPay.recommendations')}:</span>
                      <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                        {result.risk.recommendations.map((rec, i) => (
                          <li key={i} className="text-primary text-xs">{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Policy Decision */}
            {result.policy && (
              <div className={`control-panel ${result.policy.ok ? 'border-success/50' : 'border-destructive/50'}`}>
                <div className="panel-title flex items-center gap-2">
                  {result.policy.ok ? (
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  ) : (
                    <XCircle className="w-4 h-4 text-destructive" />
                  )}
                  {t('aiPay.policyCheck')}
                </div>
                <div className="font-mono text-sm">
                  <div className="inline-stat">
                    <span className="text-muted-foreground">Status:</span>
                    <span className={result.policy.ok ? 'text-success' : 'text-destructive'}>
                      {result.policy.ok ? t('aiPay.approved') : t('aiPay.rejected')}
                    </span>
                  </div>
                  {result.policy.message && (
                    <p className="text-xs text-muted-foreground mt-2">{result.policy.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Transaction Result */}
            {result.txHash && (
              <div className="control-panel border-success/50">
                <div className="panel-title text-success">✓ {t('pay.success')}</div>
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
              </div>
            )}

            {/* Error */}
            {result.error && (
              <div className="control-panel border-destructive/50">
                <div className="panel-title text-destructive">✗ {t('common.error')}</div>
                <p className="text-sm text-destructive font-mono">{result.message}</p>
              </div>
            )}
          </motion.div>
        )}
      </main>
    </Layout>
  );
}
