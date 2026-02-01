import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Sparkles, Terminal, Shield, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import { Layout } from '@/components/Layout';
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
}

type ChatMessage =
  | { id: string; role: 'user'; text: string }
  | { id: string; role: 'assistant'; data: AIChatResponse };

/* ─── Payment result cards (reused from old AssistantBlock) ────── */

function PaymentCards({ pr, t }: { pr: AIPayResponse; t: (k: string) => string }) {
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
          {pr.userOpHash && <p className="text-xs text-muted-foreground mt-1">UserOp: {pr.userOpHash.slice(0, 18)}...</p>}
        </div>
      )}
    </div>
  );
}

/* ─── Assistant message block ──────────────────────────────────── */

function AssistantBlock({ data, t, onConfirm, loading }: {
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

      {/* Payment structured cards */}
      {data.paymentResult && <PaymentCards pr={data.paymentResult} t={t} />}

      {/* Confirm payment button */}
      {data.pendingConfirmation && data.pendingPayment && onConfirm && (
        <div className="mt-2 space-y-1">
          <p className="text-xs text-muted-foreground">{t('aiChat.paymentPending')}</p>
          <button
            onClick={() => onConfirm(data.pendingPayment!)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded border border-green-500 bg-green-500/10 text-green-500 font-mono text-sm hover:bg-green-500/20 disabled:opacity-50 disabled:pointer-events-none"
          >
            <CheckCircle2 className="w-4 h-4" />
            {t('aiChat.confirmPayment')}
          </button>
        </div>
      )}

      {/* Error without payment result */}
      {data.error && !data.paymentResult && (
        <div className="rounded border border-red-500/50 bg-red-500/5 p-3 font-mono text-sm text-red-400">
          {data.error}
        </div>
      )}
    </div>
  );
}

/* ─── Main page ────────────────────────────────────────────────── */

export default function AIChatPage() {
  const { t } = useLanguage();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  /** Build history for the backend (text summaries only, last 10) */
  const buildHistory = () =>
    messages.slice(-10).map(msg => ({
      role: msg.role,
      content: msg.role === 'user' ? msg.text : (msg.data.text || ''),
    }));

  /** Send a chat message */
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setMessages(prev => [...prev, { id: `u-${Date.now()}`, role: 'user', text }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/ai-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: buildHistory() }),
      });
      const data = (await res.json()) as AIChatResponse;
      setMessages(prev => [...prev, { id: `a-${Date.now()}`, role: 'assistant', data }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: `a-${Date.now()}`,
        role: 'assistant',
        data: { text: err instanceof Error ? err.message : t('aiChat.networkError'), action: 'conversation' },
      }]);
    } finally {
      setLoading(false);
    }
  };

  /** Confirm a pending payment */
  const confirmPayment = async (pending: PendingPayment) => {
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
  };

  /** Handle Enter key (send on Enter, newline on Shift+Enter) */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e as unknown as React.FormEvent);
    }
  };

  return (
    <Layout
      title={t('aiChat.title')}
      icon={<MessageCircle className="w-4 h-4 text-background" />}
      backTo="/"
    >
      <main className="container mx-auto px-4 py-4 max-w-2xl relative z-10 min-h-[70vh] flex flex-col bg-background/90">
        {/* Message list */}
        <div ref={listRef} className="flex-1 overflow-y-auto space-y-4 min-h-[200px] max-h-[55vh] pr-2">
          {messages.length === 0 && !loading && (
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
              <div key={msg.id} className="flex justify-end">
                <div className="max-w-[85%] rounded-lg px-4 py-2 bg-primary/20 border border-primary/40 text-foreground font-mono text-sm">
                  {msg.text}
                </div>
              </div>
            ) : (
              <div key={msg.id} className="flex justify-start">
                <div className="max-w-[95%] rounded-lg px-4 py-3 bg-card border border-border text-foreground">
                  <AssistantBlock data={msg.data} t={t} onConfirm={confirmPayment} loading={loading} />
                </div>
              </div>
            )
          )}

          {loading && (
            <div className="flex justify-start">
              <div className="rounded-lg px-4 py-3 bg-card border border-primary/30 text-muted-foreground text-sm flex items-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                {t('aiChat.thinking')}...
              </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <form onSubmit={sendMessage} className="mt-4 flex gap-2 sticky bottom-0 bg-background/95 py-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('aiChat.placeholder')}
            className="flex-1 min-h-[44px] max-h-[120px] resize-none rounded border border-border bg-input px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            disabled={loading}
            rows={1}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="self-end inline-flex items-center gap-2 px-4 py-2 rounded border border-primary bg-primary/10 text-primary font-mono text-sm hover:bg-primary/20 disabled:opacity-50 disabled:pointer-events-none"
          >
            <Send className="w-4 h-4" />
            {t('aiChat.send')}
          </button>
        </form>
      </main>
    </Layout>
  );
}
