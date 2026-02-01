/**
 * Single wallet button + modal: Connect or truncated address; modal shows only Disconnect.
 * Balances: real chain data — native (KITE on Kite testnet) + ERC20 (USDC/USDT etc.); only show balance > 0.
 */
import { useState, useEffect } from 'react';
import { Wallet, Power } from 'lucide-react';
import { useAccount, useConnect, useDisconnect, useChainId } from 'wagmi';
import { useLanguage } from '@/lib/i18n';
import { NeonButton } from '@/components/ui/neon-button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { kiteTestnet } from '@/lib/web3/config';
import { useWalletBalances } from '@/lib/web3/hooks';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

export function WalletButton() {
  const { t } = useLanguage();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const [settlementToken, setSettlementToken] = useState<`0x${string}` | null>(null);
  const balances = useWalletBalances(
    address,
    chainId,
    settlementToken ? [settlementToken] : []
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('open-wallet-modal', handler);
    return () => window.removeEventListener('open-wallet-modal', handler);
  }, []);

  useEffect(() => {
    if (!isConnected) return;
    fetch(`${API_BASE}/api/policy`)
      .then((r) => r.json())
      .then((d) => {
        const token = d.settlementToken;
        if (token && /^0x[a-fA-F0-9]{40}$/.test(token)) setSettlementToken(token as `0x${string}`);
      })
      .catch(() => {});
  }, [isConnected]);

  const displayText = isConnected && address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : t('header.connect');

  return (
    <>
      <NeonButton onClick={() => setOpen(true)} size="sm">
        <Wallet className="w-4 h-4" />
        {displayText}
      </NeonButton>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="terminal-card border-primary/30 sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-mono text-sm uppercase text-primary">
              {isConnected ? t('header.connected') : t('header.connect')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {!isConnected ? (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-mono">
                  {kiteTestnet.name}
                </p>
                <NeonButton
                  className="w-full"
                  disabled={isConnecting}
                  onClick={() => {
                    const c = connectors[0];
                    if (c) {
                      connect({ connector: c });
                      setOpen(false);
                    }
                  }}
                >
                  {isConnecting ? '…' : t('header.connect')}
                </NeonButton>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="font-mono text-sm">
                  <div className="text-muted-foreground text-xs">Address</div>
                  <div className="break-all text-foreground">{address}</div>
                </div>
                <div className="font-mono text-sm">
                  <div className="text-muted-foreground text-xs mb-1">Balance (Kite Testnet)</div>
                  {balances.length === 0 ? (
                    <div className="text-muted-foreground text-xs">Loading…</div>
                  ) : (
                    <ul className="space-y-1">
                      {balances.map((b, i) => (
                        <li key={i} className="text-foreground">
                          {b.formatted} {b.symbol}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <NeonButton
                  className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    disconnect();
                    setOpen(false);
                  }}
                >
                  <Power className="w-4 h-4" />
                  Disconnect
                </NeonButton>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
