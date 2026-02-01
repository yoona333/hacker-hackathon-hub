import { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Send, Sparkles, Terminal, Shield, CheckCircle2, XCircle, ExternalLink, Settings, Loader2 } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { ErrorAlert } from '@/components/ui/error-alert';
import { useLanguage } from '@/lib/i18n';
import { getExplorerUrl } from '@/lib/web3/config';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

/* ─── Types ─────────────────────────────────────────────────────── */

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
  hint?: string;
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
  agentWallet?: string;
}

interface PendingPayment {
  recipient: string;
  amount: string;
  currency: string;
  purpose: string;
  originalRequest: string;
}

interface AIChatResponse {
  text: string;
  action: string;
  paymentResult?: AIPayResponse;
  pendingConfirmation?: boolean;
  pendingPayment?: PendingPayment;
  queryResult?: Record<string, unknown>;
  error?: string;
  dryRun?: boolean;
  autoExecuted?: boolean;
  paymentMode?: 'eoa' | 'aa';
  progress?: {
    stage: 'parsing' | 'risk_assessment' | 'policy_check' | 'execution' | 'complete';
    message: string;
    percentage: number;
  };
}

type ChatMessage =
  | { id: string; role: 'user'; text: string }
  | { id: string; role: 'assistant'; data: AIChatResponse };

/* ─── Payment result cards (reused from old AssistantBlock) ────── */

const PaymentCards = memo(function PaymentCards({ pr, t }: { pr: AIPayResponse; t: (k: string) => string }) {
  const riskColor = (l: string) => l === 'low' ? 'text-green-500' : l === 'medium' ? 'text-amber-500' : l === 'high' ? 'text-red-500' : 'text-muted-foreground';

  return (
    <div className="space-y-2 mt-2">
      {pr.intent && (
        <div className="rounded border border-primary/30 bg-primary/5 p-3 font-mono text-sm">
          <div className="flex items-center gap-2 text-primary mb-2">
            <Terminal className="w-4 h-4 shrink-0" />
            <span className="font-semibold">{t('aiPay.parsed')}</span>
          </div>
          <div className="grid gap-1 text-foreground/90">
            <p><span className="text-muted-foreground">{t('aiPay.recipient')}:</span> <span className="break-all">{pr.intent.recipient}</span></p>
            <p><span className="text-muted-foreground">{t('aiPay.amount')}:</span> {pr.intent.amount} {pr.intent.currency}</p>
            <p><span className="text-muted-foreground">{t('aiPay.purpose')}:</span> {pr.intent.purpose}</p>
            <p><span className="text-muted-foreground">{t('aiPay.confidence')}:</span> {(pr.intent.confidence * 100).toFixed(1)}%</p>
          </div>
        </div>
      )}
      {pr.risk && (
        <div className="rounded border border-amber-500/30 bg-amber-500/5 p-3 font-mono text-sm">
          <div className="flex items-center gap-2 text-amber-500 mb-2">
            <Shield className="w-4 h-4 shrink-0" />
            <span className="font-semibold">{t('aiPay.riskAssessment')}</span>
            <span className={riskColor(pr.risk.level)}>({pr.risk.level}, {pr.risk.score}/100)</span>
          </div>
          {pr.risk.reasons.length > 0 && (
            <ul className="list-disc list-inside text-foreground/90 text-xs space-y-0.5">
              {pr.risk.reasons.slice(0, 3).map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          )}
        </div>
      )}
      {pr.policy && (
        <div className={`rounded border p-3 font-mono text-sm ${pr.policy.ok ? 'border-green-500/50 bg-green-500/5' : 'border-red-500/50 bg-red-500/5'}`}>
          <div className="flex items-center gap-2 mb-1">
            {pr.policy.ok
              ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
              : <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
            <span className={pr.policy.ok ? 'text-green-500' : 'text-red-500'}>
              {pr.policy.ok ? t('aiPay.approved') : t('aiPay.rejected')}
            </span>
          </div>
          {pr.policy.message && <p className="text-muted-foreground text-xs">{pr.policy.message}</p>}
          {pr.policy.hint && <p className="text-primary/90 text-xs mt-1 p-2 rounded bg-primary/10">{pr.policy.hint}</p>}
          {pr.agentWallet && <p className="text-xs text-muted-foreground mt-2 break-all">Agent: {pr.agentWallet}</p>}
        </div>
      )}
      {pr.txHash && (
        <div className="rounded border border-green-500/50 bg-green-500/5 p-3 font-mono text-sm">
          <div className="flex items-center gap-2 text-green-500 mb-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>{t('pay.success')}</span>
          </div>
          <a href={getExplorerUrl('tx', pr.txHash)} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline text-xs">
            {pr.txHash.slice(0, 10)}...{pr.txHash.slice(-8)}
            <ExternalLink className="w-3 h-3" />
          </a>
          {pr.userOpHash && <p className="text-xs text-muted-foreground mt-1 break-all font-mono">UserOp: {pr.userOpHash}</p>}
        </div>
      )}
    </div>
  );
});

/* ─── Assistant message block ──────────────────────────────────── */

const AssistantBlock = memo(function AssistantBlock({ data, t, onConfirm, loading }: {
  data: AIChatResponse;
  t: (k: string) => string;
  onConfirm?: (p: PendingPayment) => void;
  loading?: boolean;
}) {
  return (
    <div className="space-y-2 text-left">
      {/* Natural language text */}
      {data.text && (
        <p className="text-sm text-foreground whitespace-pre-wrap">{data.text}</p>
      )}

      {/* Dry-run indicator */}
      {data.dryRun && (
        <div className="rounded border border-amber-500/50 bg-amber-500/5 p-2 font-mono text-xs text-amber-500">
          {t('aiChat.dryRunMode')}
        </div>
      )}

      {/* Payment structured cards */}
      {data.paymentResult && <PaymentCards pr={data.paymentResult} t={t} />}

      {/* Success + Transaction Evidence (merged) */}
      {data.autoExecuted && data.paymentResult?.txHash && (
        <div className="mt-2 rounded border border-green-500/50 bg-green-500/5 p-3 font-mono text-sm">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span className="font-semibold text-green-500">{t('aiChat.autoExecuted')} via {data.paymentMode === 'aa' ? 'Account Abstraction' : 'EOA'}</span>
          </div>
          <div className="space-y-1.5 text-xs border-t border-green-500/20 pt-2 mt-2">
            <div className="flex items-start gap-2">
              <span className="text-muted-foreground min-w-[80px]">Tx Hash:</span>
              <a
                href={getExplorerUrl('tx', data.paymentResult.txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1 break-all"
              >
                {data.paymentResult.txHash.slice(0, 10)}...{data.paymentResult.txHash.slice(-8)}
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
              </a>
            </div>
            {data.paymentResult.userOpHash && (
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground min-w-[80px]">UserOp Hash:</span>
                <span className="text-foreground break-all font-mono">{data.paymentResult.userOpHash}</span>
              </div>
            )}
            <div className="flex items-start gap-2">
              <span className="text-muted-foreground min-w-[80px]">Mode:</span>
              <span className="text-foreground">{data.paymentMode === 'aa' ? 'Account Abstraction (AA)' : 'EOA'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Confirm payment button (only if not auto-executed and pending confirmation) */}
      {data.pendingConfirmation && data.pendingPayment && onConfirm && !data.autoExecuted && (
        <div className="mt-2 space-y-1">
          <p className="text-xs text-muted-foreground">{t('aiChat.paymentPending')}</p>
          <motion.button
            onClick={() => onConfirm(data.pendingPayment!)}
            disabled={loading}
            whileHover={!loading ? { scale: 1.05, backgroundColor: 'hsl(var(--success) / 0.2)' } : {}}
            whileTap={!loading ? { scale: 0.95 } : {}}
            className="inline-flex items-center gap-2 px-4 py-2 rounded border border-green-500 bg-green-500/10 text-green-500 font-mono text-sm transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            <CheckCircle2 className="w-4 h-4" />
            {t('aiChat.confirmPayment')}
          </motion.button>
        </div>
      )}

      {/* Error without payment result */}
      {data.error && !data.paymentResult && (
        <ErrorAlert
          message={data.error}
          variant="error"
          className="mt-2"
        />
      )}
    </div>
  );
});

/* ─── Main page ────────────────────────────────────────────────── */

export default function AIChatPage() {
  const { t } = useLanguage();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<{ stage: string; message: string; percentage: number } | null>(null);
  const [dryRun, setDryRun] = useState(false);
  const [paymentMode, setPaymentMode] = useState<'eoa' | 'aa'>('eoa');
  const [autoExecute, setAutoExecute] = useState(true);
  const [showSettings, setShowSettings] = useState(true); // Default to show sidebar
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  /** Build history for the backend (text summaries only, last 10) */
  const buildHistory = useCallback(() =>
    messages.slice(-10).map(msg => ({
      role: msg.role,
      content: msg.role === 'user' ? msg.text : (msg.data.text || ''),
    })), [messages]);

  /** Send a chat message */
  const sendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setMessages(prev => [...prev, { id: `u-${Date.now()}`, role: 'user', text }]);
    setInput('');
    setLoading(true);
    
    // 模拟进度更新（实际应该从服务器端 SSE 或 WebSocket 获取）
    const progressStages = [
      { stage: 'parsing', message: t('aiChat.progress.parsing'), percentage: 20 },
      { stage: 'risk_assessment', message: t('aiChat.progress.riskAssessment'), percentage: 50 },
      { stage: 'policy_check', message: t('aiChat.progress.policyCheck'), percentage: 80 },
      { stage: 'execution', message: t('aiChat.progress.execution'), percentage: 95 },
    ];
    
    let currentStage = 0;
    const progressInterval = setInterval(() => {
      if (currentStage < progressStages.length) {
        setProgress(progressStages[currentStage]);
        currentStage++;
      }
    }, 500);

    try {
      const res = await fetch(`${API_BASE}/api/ai-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: buildHistory(),
          dryRun,
          paymentMode: dryRun ? undefined : paymentMode,
          autoExecute: dryRun ? false : autoExecute,
        }),
      });
      const data = (await res.json()) as AIChatResponse;
      
      // 如果响应包含进度信息，使用它
      if (data.progress) {
        setProgress(data.progress);
      } else {
        setProgress({ stage: 'complete', message: t('aiChat.progress.complete'), percentage: 100 });
      }
      
      setTimeout(() => {
        setProgress(null);
        setMessages(prev => [...prev, { id: `a-${Date.now()}`, role: 'assistant', data }]);
      }, 300);
    } catch (err) {
      setProgress(null);
      setMessages(prev => [...prev, {
        id: `a-${Date.now()}`,
        role: 'assistant',
        data: { text: err instanceof Error ? err.message : t('aiChat.networkError'), action: 'conversation' },
      }]);
    } finally {
      clearInterval(progressInterval);
      setLoading(false);
      setTimeout(() => setProgress(null), 500);
    }
  }, [input, loading, dryRun, paymentMode, autoExecute, buildHistory, t]);

  /** Confirm a pending payment */
  const confirmPayment = useCallback(async (pending: PendingPayment) => {
    setMessages(prev => [...prev, { id: `u-${Date.now()}`, role: 'user', text: t('aiChat.confirmPayment') }]);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/ai-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'confirm',
          history: buildHistory(),
          confirmPayment: true,
          pendingPayment: pending,
        }),
      });
      const data = (await res.json()) as AIChatResponse;
      setMessages(prev => [...prev, { id: `a-${Date.now()}`, role: 'assistant', data }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: `a-${Date.now()}`,
        role: 'assistant',
        data: { text: err instanceof Error ? err.message : t('aiChat.paymentFailed'), action: 'payment' },
      }]);
    } finally {
      setLoading(false);
    }
  }, [buildHistory, t]);

  /** Handle Enter key (send on Enter, newline on Shift+Enter) */
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e as unknown as React.FormEvent);
    }
  }, [sendMessage]);

  return (
    <Layout
      title={t('aiChat.title')}
      icon={<MessageCircle className="w-4 h-4 text-background" />}
      backTo="/"
    >
      <main className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 relative z-10 min-h-[70vh] flex flex-col bg-background/90 max-w-5xl">
        {/* Progress indicator */}
        {progress && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 p-4 rounded-lg border border-primary/30 bg-primary/5"
          >
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{progress.message}</p>
                <div className="mt-2 w-full bg-muted rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress.percentage}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{progress.percentage}%</span>
            </div>
          </motion.div>
        )}

        {/* Message list */}
        <div ref={listRef} className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 min-h-[200px] max-h-[50vh] sm:max-h-[60vh] pr-1 sm:pr-2 mb-3 sm:mb-4">
          {messages.length === 0 && !loading && !progress && (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Sparkles className="w-10 h-10 mb-3 opacity-60" />
              <p className="text-sm">{t('aiChat.emptyHint')}</p>
              <div className="text-xs mt-2 space-y-1 opacity-80">
                <p>{t('aiChat.examplePayment')}</p>
                <p>{t('aiChat.exampleBalance')}</p>
                <p>{t('aiChat.examplePolicy')}</p>
              </div>
            </div>
          )}

          {messages.map(msg =>
            msg.role === 'user' ? (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: 20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                className="flex justify-end"
              >
                <div className="max-w-[85%] rounded-lg px-4 py-2.5 bg-primary/20 border border-primary/40 text-foreground font-mono text-sm shadow-glow-primary">
                  {msg.text}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                className="flex justify-start"
              >
                <div className="max-w-[95%] rounded-lg px-4 py-3 bg-card border border-border/50 text-foreground shadow-card">
                  <AssistantBlock data={msg.data} t={t} onConfirm={confirmPayment} loading={loading} />
                </div>
              </motion.div>
            )
          )}

          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="rounded-lg px-4 py-3 bg-card border border-primary/30 text-muted-foreground text-sm flex items-center gap-3 shadow-glow-primary">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full"
                />
                <span className="font-mono">{t('aiChat.thinking')}...</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Bottom bar: Settings + Input */}
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 sticky bottom-0 bg-background/95 backdrop-blur-sm py-2 border-t border-border/50 items-end">
          {/* Settings Panel - Enhanced */}
          <aside className="w-full lg:w-64 flex-shrink-0 order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.01 }}
              className="p-3 rounded-lg border border-border/50 bg-card shadow-card font-mono text-xs sm:text-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-primary text-xs">{t('aiChat.settings')}</span>
                <motion.button
                  onClick={() => setShowSettings(!showSettings)}
                  whileHover={{ scale: 1.1, color: 'hsl(var(--foreground))' }}
                  whileTap={{ scale: 0.9 }}
                  className="text-muted-foreground transition-colors"
                  title={showSettings ? 'Hide settings' : 'Show settings'}
                >
                  <Settings className="w-3 h-3" />
                </motion.button>
              </div>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 pt-2 border-t border-border/50"
                >
                  <motion.label
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-2 cursor-pointer p-2 rounded border border-border/50 bg-muted/20 transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={dryRun}
                      onChange={(e) => setDryRun(e.target.checked)}
                      className="accent-primary w-4 h-4"
                    />
                    <span className="text-xs">{t('aiChat.dryRunLabel')}</span>
                  </motion.label>
                  {!dryRun && (
                    <>
                      <motion.label
                        whileHover={{ x: 4 }}
                        className="flex items-center gap-2 cursor-pointer p-2 rounded border border-border/50 bg-muted/20 transition-all"
                      >
                        <input
                          type="checkbox"
                          checked={autoExecute}
                          onChange={(e) => setAutoExecute(e.target.checked)}
                          className="accent-primary w-4 h-4"
                        />
                        <span className="text-xs">{t('aiChat.autoExecuteLabel')}</span>
                      </motion.label>
                      <div>
                        <span className="text-muted-foreground text-xs mb-2 block">{t('aiChat.paymentMode')}:</span>
                        <div className="grid grid-cols-2 gap-2">
                          <motion.button
                            onClick={() => setPaymentMode('eoa')}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            className={`px-3 py-2 rounded-lg border-2 text-xs font-mono font-bold transition-all ${
                              paymentMode === 'eoa'
                                ? 'border-primary bg-primary/10 text-primary shadow-glow-primary'
                                : 'border-border hover:border-primary/50 hover:bg-primary/5'
                            }`}
                          >
                            EOA
                          </motion.button>
                          <motion.button
                            onClick={() => setPaymentMode('aa')}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            className={`px-3 py-2 rounded-lg border-2 text-xs font-mono font-bold transition-all ${
                              paymentMode === 'aa'
                                ? 'border-primary bg-primary/10 text-primary shadow-glow-primary'
                                : 'border-border hover:border-primary/50 hover:bg-primary/5'
                            }`}
                          >
                            AA
                          </motion.button>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </motion.div>
          </aside>

          {/* Input area */}
          <form onSubmit={sendMessage} className="flex-1 flex gap-2 order-1 lg:order-2 items-end">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('aiChat.placeholder')}
              className="flex-1 min-h-[44px] max-h-[120px] resize-none rounded border border-border bg-input px-3 py-2.5 font-mono text-base sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 touch-target"
              disabled={loading}
              rows={1}
            />
            <motion.button
              type="submit"
              disabled={loading || !input.trim()}
              whileHover={!loading && input.trim() ? { scale: 1.05, backgroundColor: 'hsl(var(--primary) / 0.2)' } : {}}
              whileTap={!loading && input.trim() ? { scale: 0.95 } : {}}
              className="self-end inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 rounded border border-primary bg-primary/10 text-primary font-mono text-sm transition-all disabled:opacity-50 disabled:pointer-events-none touch-target min-w-[44px]"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">{t('aiChat.send')}</span>
            </motion.button>
          </form>
        </div>
      </main>
    </Layout>
  );
}
