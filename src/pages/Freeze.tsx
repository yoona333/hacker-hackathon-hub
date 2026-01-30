import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Snowflake, Search, ArrowLeft, Zap, 
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
    // Simulate API call
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
      <header className="sticky top-0 z-50 glass-card rounded-none border-x-0 border-t-0">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <motion.button 
                whileHover={{ scale: 1.1 }}
                className="p-2 rounded-lg hover:bg-muted/50"
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-blue-cyan flex items-center justify-center">
                <Snowflake className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold neon-text">Freeze Control</span>
            </div>
          </div>
          <NetworkBadge connected={isConnected} chainName={kiteTestnet.name} />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Search Section */}
          <NeonBorderCard className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              Check Address Status
            </h2>
            
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Enter address to check (0x...)"
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
                    Check
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
                    glow={searchResult.isFrozen ? 'pink' : 'green'}
                    className={cn(
                      'border-2',
                      searchResult.isFrozen ? 'border-destructive/50' : 'border-success/50'
                    )}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <AddressDisplay address={searchResult.address} />
                      <StatusBadge 
                        status={searchResult.isFrozen ? 'frozen' : 'active'}
                        pulse
                      >
                        {searchResult.isFrozen ? 'Frozen' : 'Not Frozen'}
                      </StatusBadge>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg mb-4">
                      {searchResult.isFrozen ? (
                        <>
                          <XCircle className="w-12 h-12 text-destructive" />
                          <div>
                            <h3 className="font-bold text-destructive">Address is Frozen</h3>
                            <p className="text-sm text-muted-foreground">
                              This address cannot perform any transactions until unfrozen.
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-12 h-12 text-success" />
                          <div>
                            <h3 className="font-bold text-success">Address is Active</h3>
                            <p className="text-sm text-muted-foreground">
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
                              Submit Unfreeze Proposal
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
                              Submit Freeze Proposal
                            </>
                          )}
                        </NeonButton>
                      )}
                    </div>

                    {actionStatus === 'success' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-3 bg-success/20 rounded-lg flex items-center gap-2 text-success"
                      >
                        <CheckCircle className="w-5 h-5" />
                        <span>Proposal submitted successfully! Awaiting confirmations.</span>
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
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Snowflake className="w-5 h-5 text-destructive" />
                Frozen Addresses
              </h2>
              <StatusBadge status="frozen">
                {MOCK_DATA.frozenAddresses.length} frozen
              </StatusBadge>
            </div>

            <div className="space-y-3">
              {MOCK_DATA.frozenAddresses.length === 0 ? (
                <div className="text-center py-12">
                  <Snowflake className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No frozen addresses</p>
                </div>
              ) : (
                MOCK_DATA.frozenAddresses.map((address, index) => (
                  <motion.div
                    key={address}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <AddressDisplay address={address} />
                    <div className="flex items-center gap-3">
                      <StatusBadge status="frozen">Frozen</StatusBadge>
                      <NeonButton 
                        size="sm" 
                        variant="success"
                        onClick={() => {
                          setSearchAddress(address);
                          setSearchResult({ address, isFrozen: true });
                        }}
                      >
                        <Unlock className="w-4 h-4" />
                        Unfreeze
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
                  <h3 className="font-bold text-primary mb-1">Multi-Signature Required</h3>
                  <p className="text-sm text-muted-foreground">
                    All freeze and unfreeze operations require{' '}
                    <span className="text-foreground font-medium">
                      {MOCK_DATA.threshold} of {MOCK_DATA.owners.length}
                    </span>{' '}
                    owner confirmations. Your proposal will be submitted and other owners will need to confirm before execution.
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
