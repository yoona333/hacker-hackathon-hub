import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Snowflake, Search, ArrowLeft, Terminal, 
  CheckCircle, XCircle, AlertTriangle, Lock, Unlock
} from 'lucide-react';
import { ParticleBackground } from '@/components/3d/ParticleBackground';
import { GlassCard, NeonBorderCard } from '@/components/ui/glass-card';
import { NeonButton } from '@/components/ui/neon-button';
import { AddressDisplay } from '@/components/ui/address-display';
import { StatusBadge } from '@/components/ui/status-badge';
import { NetworkBadge } from '@/components/ui/status-badge';
import { useWallet } from '@/lib/web3/hooks';
import { MOCK_DATA, kiteTestnet } from '@/lib/web3/config';
import { cn } from '@/lib/utils';

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
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const isFrozen = MOCK_DATA.frozenAddresses.some(
      addr => addr.toLowerCase() === searchAddress.toLowerCase()
    );
    
    setSearchResult({ address: searchAddress, isFrozen });
    setIsSearching(false);
  };

  const handleFreeze = async () => {
    setActionStatus('pending');
    await new Promise(resolve => setTimeout(resolve, 2000));
    setActionStatus('success');
    setTimeout(() => setActionStatus('idle'), 3000);
  };

  const handleUnfreeze = async () => {
    setActionStatus('pending');
    await new Promise(resolve => setTimeout(resolve, 2000));
    setActionStatus('success');
    setTimeout(() => setActionStatus('idle'), 3000);
  };

  return (
    <div className="relative min-h-screen">
      <ParticleBackground />
      
      {/* Header */}
      <header className="sticky top-0 z-50 terminal-card border-x-0 border-t-0" style={{ borderRadius: 0 }}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <motion.button 
                whileHover={{ scale: 1.1 }}
                className="p-2 hover:bg-muted/50 border border-transparent hover:border-primary/30"
                style={{ borderRadius: '2px' }}
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 hex-clip gradient-emerald flex items-center justify-center">
                <Snowflake className="w-5 h-5 text-background" />
              </div>
              <span className="text-xl font-bold font-mono terminal-text uppercase">Freeze Control</span>
            </div>
          </div>
          <NetworkBadge connected={isConnected} chainName={kiteTestnet.name} />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Search Section */}
          <NeonBorderCard className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 font-mono uppercase">
              <Search className="w-5 h-5 text-primary" />
              Address Status Check
            </h2>
            
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="0x... Enter address to scan"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                className="glow-input flex-1"
              />
              <NeonButton 
                onClick={handleSearch} 
                disabled={isSearching || !searchAddress}
              >
                {isSearching ? (
                  <div className="neon-spinner w-5 h-5" />
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
                  className="mt-6"
                >
                  <GlassCard 
                    glow={searchResult.isFrozen ? 'red' : 'emerald'}
                    className={cn(
                      'border',
                      searchResult.isFrozen ? 'border-destructive/50' : 'border-success/50'
                    )}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <AddressDisplay address={searchResult.address} />
                      <StatusBadge 
                        status={searchResult.isFrozen ? 'frozen' : 'active'}
                        pulse
                      >
                        {searchResult.isFrozen ? 'FROZEN' : 'ACTIVE'}
                      </StatusBadge>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-muted/30 border border-border/50 mb-4" style={{ borderRadius: '2px' }}>
                      {searchResult.isFrozen ? (
                        <>
                          <XCircle className="w-12 h-12 text-destructive" />
                          <div>
                            <h3 className="font-bold text-destructive font-mono uppercase">Address Frozen</h3>
                            <p className="text-sm text-muted-foreground font-mono">
                              All transactions from this address are blocked.
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-12 h-12 text-success" />
                          <div>
                            <h3 className="font-bold text-success font-mono uppercase">Address Active</h3>
                            <p className="text-sm text-muted-foreground font-mono">
                              This address can perform transactions normally.
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex gap-3">
                      {searchResult.isFrozen ? (
                        <NeonButton 
                          variant="success" 
                          onClick={handleUnfreeze}
                          disabled={actionStatus === 'pending'}
                          className="flex-1"
                        >
                          {actionStatus === 'pending' ? (
                            <div className="neon-spinner w-5 h-5" />
                          ) : (
                            <>
                              <Unlock className="w-4 h-4" />
                              SUBMIT UNFREEZE
                            </>
                          )}
                        </NeonButton>
                      ) : (
                        <NeonButton 
                          variant="danger" 
                          onClick={handleFreeze}
                          disabled={actionStatus === 'pending'}
                          className="flex-1"
                        >
                          {actionStatus === 'pending' ? (
                            <div className="neon-spinner w-5 h-5" />
                          ) : (
                            <>
                              <Lock className="w-4 h-4" />
                              SUBMIT FREEZE
                            </>
                          )}
                        </NeonButton>
                      )}
                    </div>

                    {actionStatus === 'success' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-3 bg-success/20 border border-success/30 flex items-center gap-2 text-success font-mono text-sm"
                        style={{ borderRadius: '2px' }}
                      >
                        <CheckCircle className="w-5 h-5" />
                        <span className="uppercase">Proposal submitted. Awaiting confirmations.</span>
                      </motion.div>
                    )}
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>
          </NeonBorderCard>

          {/* Frozen Addresses List */}
          <GlassCard>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2 font-mono uppercase">
                <Snowflake className="w-5 h-5 text-destructive" />
                Frozen Registry
              </h2>
              <StatusBadge status="frozen">
                {MOCK_DATA.frozenAddresses.length} BLOCKED
              </StatusBadge>
            </div>

            <div className="space-y-3">
              {MOCK_DATA.frozenAddresses.length === 0 ? (
                <div className="text-center py-12">
                  <Snowflake className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground font-mono uppercase">No frozen addresses</p>
                </div>
              ) : (
                MOCK_DATA.frozenAddresses.map((address, index) => (
                  <motion.div
                    key={address}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors"
                    style={{ borderRadius: '2px' }}
                  >
                    <AddressDisplay address={address} />
                    <div className="flex items-center gap-3">
                      <StatusBadge status="frozen">FROZEN</StatusBadge>
                      <NeonButton 
                        size="sm" 
                        variant="success"
                        onClick={() => {
                          setSearchAddress(address);
                          setSearchResult({ address, isFrozen: true });
                        }}
                      >
                        <Unlock className="w-4 h-4" />
                        UNFREEZE
                      </NeonButton>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </GlassCard>

          {/* Warning Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <GlassCard className="border border-primary/30">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-primary mb-1 font-mono uppercase">Multi-Signature Required</h3>
                  <p className="text-sm text-muted-foreground font-mono">
                    All freeze/unfreeze operations require{' '}
                    <span className="text-foreground font-medium">
                      {MOCK_DATA.threshold} of {MOCK_DATA.owners.length}
                    </span>{' '}
                    owner confirmations before execution.
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
