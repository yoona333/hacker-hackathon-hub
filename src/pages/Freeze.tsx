import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Snowflake, Search, ArrowLeft, 
  CheckCircle, XCircle, AlertTriangle, Lock, Unlock
} from 'lucide-react';
import { ParticleBackground } from '@/components/3d/ParticleBackground';
import { NeonButton } from '@/components/ui/neon-button';
import { StatusBadge, NetworkBadge } from '@/components/ui/status-badge';
import { useWallet } from '@/lib/web3/hooks';
import { MOCK_DATA, kiteTestnet, shortenAddress } from '@/lib/web3/config';

export default function FreezePage() {
  const { isConnected } = useWallet();
  const [searchAddress, setSearchAddress] = useState('');
  const [searchResult, setSearchResult] = useState<{
    address: string;
    isFrozen: boolean;
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [actionStatus, setActionStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');

  const handleSearch = async () => {
    if (!searchAddress || searchAddress.length < 10) return;
    
    setIsSearching(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const isFrozen = MOCK_DATA.frozenAddresses.some(
      addr => addr.toLowerCase() === searchAddress.toLowerCase()
    );
    
    setSearchResult({ address: searchAddress, isFrozen });
    setIsSearching(false);
  };

  const handleAction = async () => {
    setActionStatus('pending');
    await new Promise(resolve => setTimeout(resolve, 1500));
    setActionStatus('success');
    setTimeout(() => setActionStatus('idle'), 2000);
  };

  return (
    <div className="relative min-h-screen">
      <ParticleBackground />
      
      {/* Header */}
      <header className="sticky top-0 z-50 terminal-card border-x-0 border-t-0" style={{ borderRadius: 0 }}>
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/dashboard">
              <motion.button 
                whileHover={{ scale: 1.1 }}
                className="p-2 hover:bg-muted/50 border border-transparent hover:border-primary/30"
                style={{ borderRadius: '2px' }}
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 hex-clip gradient-emerald flex items-center justify-center">
                <Snowflake className="w-4 h-4 text-background" />
              </div>
              <span className="text-sm sm:text-lg font-bold font-mono terminal-text uppercase">Freeze</span>
            </div>
          </div>
          <NetworkBadge connected={isConnected} chainName={kiteTestnet.name} />
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 sm:py-6">
        {/* Main Grid - Stacked on mobile, asymmetric on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
          
          {/* Left - Search & Result */}
          <div className="space-y-4">
            {/* Search Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="control-panel"
            >
              <div className="panel-title flex items-center gap-2">
                <Search className="w-4 h-4" />
                Address Status Check
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="0x... Enter address to scan"
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="glow-input flex-1 text-sm"
                />
                <NeonButton 
                  onClick={handleSearch} 
                  disabled={isSearching || !searchAddress}
                  size="sm"
                >
                  {isSearching ? (
                    <div className="neon-spinner w-4 h-4" />
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      SCAN
                    </>
                  )}
                </NeonButton>
              </div>

              {/* Search Result */}
              <AnimatePresence mode="wait">
                {searchResult && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-border"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-sm text-primary">{shortenAddress(searchResult.address, 8)}</span>
                      <StatusBadge 
                        status={searchResult.isFrozen ? 'frozen' : 'active'}
                        pulse
                      >
                        {searchResult.isFrozen ? 'FROZEN' : 'ACTIVE'}
                      </StatusBadge>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-muted/30 border border-border/50 mb-3" style={{ borderRadius: '2px' }}>
                      {searchResult.isFrozen ? (
                        <>
                          <XCircle className="w-8 h-8 text-destructive flex-shrink-0" />
                          <div>
                            <div className="font-bold text-destructive font-mono uppercase text-sm">Blocked</div>
                            <p className="text-xs text-muted-foreground font-mono">
                              All transactions blocked
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-8 h-8 text-success flex-shrink-0" />
                          <div>
                            <div className="font-bold text-success font-mono uppercase text-sm">Active</div>
                            <p className="text-xs text-muted-foreground font-mono">
                              Transactions allowed
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    <NeonButton 
                      variant={searchResult.isFrozen ? 'success' : 'danger'}
                      onClick={handleAction}
                      disabled={actionStatus === 'pending'}
                      className="w-full"
                      size="sm"
                    >
                      {actionStatus === 'pending' ? (
                        <div className="neon-spinner w-4 h-4" />
                      ) : searchResult.isFrozen ? (
                        <>
                          <Unlock className="w-4 h-4" />
                          SUBMIT UNFREEZE PROPOSAL
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          SUBMIT FREEZE PROPOSAL
                        </>
                      )}
                    </NeonButton>

                    {actionStatus === 'success' && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 p-2 bg-success/20 border border-success/30 flex items-center gap-2 text-success font-mono text-xs"
                        style={{ borderRadius: '2px' }}
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span className="uppercase">Proposal submitted</span>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Warning */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="control-panel border-primary/30"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-primary font-mono uppercase text-xs mb-1">Multi-Sig Required</div>
                  <p className="text-xs text-muted-foreground font-mono">
                    All operations require {MOCK_DATA.threshold}/{MOCK_DATA.owners.length} confirmations.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right - Frozen Registry */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="control-panel"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="panel-title flex items-center gap-2 border-0 pb-0 mb-0">
                <Snowflake className="w-4 h-4" />
                Frozen Registry
              </div>
              <StatusBadge status="frozen">
                {MOCK_DATA.frozenAddresses.length}
              </StatusBadge>
            </div>

            <div className="space-y-1 max-h-96 overflow-y-auto">
              {MOCK_DATA.frozenAddresses.length === 0 ? (
                <div className="text-center py-8">
                  <Snowflake className="w-10 h-10 mx-auto mb-2 text-muted-foreground opacity-50" />
                  <p className="text-xs text-muted-foreground font-mono uppercase">No frozen addresses</p>
                </div>
              ) : (
                MOCK_DATA.frozenAddresses.map((address, index) => (
                  <motion.div
                    key={address}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-2 bg-muted/20 border border-border/30 hover:border-primary/30 transition-colors cursor-pointer"
                    style={{ borderRadius: '2px' }}
                    onClick={() => {
                      setSearchAddress(address);
                      setSearchResult({ address, isFrozen: true });
                    }}
                  >
                    <span className="font-mono text-xs text-primary">{shortenAddress(address)}</span>
                    <span className="text-[10px] text-destructive font-mono uppercase">frozen</span>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
