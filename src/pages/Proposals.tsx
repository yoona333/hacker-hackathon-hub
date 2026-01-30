import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FileText, ArrowLeft, Plus, Check, Play, 
  Clock, CheckCircle, Terminal
} from 'lucide-react';
import { ParticleBackground } from '@/components/3d/ParticleBackground';
import { GlassCard, NeonBorderCard } from '@/components/ui/glass-card';
import { NeonButton } from '@/components/ui/neon-button';
import { AddressDisplay, OwnerAvatars } from '@/components/ui/address-display';
import { ThresholdProgress } from '@/components/ui/neon-progress';
import { StatusBadge, TypeBadge, NetworkBadge } from '@/components/ui/status-badge';
import { useWallet } from '@/lib/web3/hooks';
import { MOCK_DATA, kiteTestnet } from '@/lib/web3/config';
import { cn } from '@/lib/utils';

export default function ProposalsPage() {
  const { isConnected } = useWallet();
  const [showNewProposal, setShowNewProposal] = useState(false);
  const [proposalType, setProposalType] = useState<'freeze' | 'unfreeze'>('freeze');
  const [targetAddress, setTargetAddress] = useState('');

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
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
              <div className="w-10 h-10 hex-clip gradient-amber flex items-center justify-center">
                <FileText className="w-5 h-5 text-background" />
              </div>
              <span className="text-xl font-bold font-mono terminal-text uppercase">Proposals</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <NetworkBadge connected={isConnected} chainName={kiteTestnet.name} />
            <NeonButton onClick={() => setShowNewProposal(true)}>
              <Plus className="w-4 h-4" />
              NEW PROPOSAL
            </NeonButton>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <GlassCard glow="amber" className="text-center">
              <div className="text-3xl font-bold terminal-text font-mono">
                {MOCK_DATA.proposals.length}
              </div>
              <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Total</div>
            </GlassCard>
            <GlassCard glow="amber" className="text-center">
              <div className="text-3xl font-bold terminal-text font-mono">
                {MOCK_DATA.proposals.filter(p => !p.executed).length}
              </div>
              <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Pending</div>
            </GlassCard>
            <GlassCard glow="emerald" className="text-center">
              <div className="text-3xl font-bold terminal-text font-mono">
                {MOCK_DATA.proposals.filter(p => p.executed).length}
              </div>
              <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Executed</div>
            </GlassCard>
          </div>

          {/* New Proposal Modal */}
          <AnimatePresence>
            {showNewProposal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
                onClick={() => setShowNewProposal(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-lg mx-4"
                >
                  <NeonBorderCard>
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 font-mono uppercase">
                      <Plus className="w-5 h-5 text-primary" />
                      Create Proposal
                    </h2>

                    <div className="space-y-6">
                      <div>
                        <label className="text-xs text-muted-foreground mb-2 block font-mono uppercase tracking-wider">
                          Proposal Type
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            onClick={() => setProposalType('freeze')}
                            className={cn(
                              'p-4 border transition-all text-left',
                              proposalType === 'freeze'
                                ? 'border-destructive bg-destructive/10'
                                : 'border-border hover:border-muted-foreground'
                            )}
                            style={{ borderRadius: '2px' }}
                          >
                            <div className="font-bold text-destructive mb-1 font-mono uppercase">❄️ Freeze</div>
                            <p className="text-xs text-muted-foreground font-mono">
                              Block address transactions
                            </p>
                          </button>
                          <button
                            onClick={() => setProposalType('unfreeze')}
                            className={cn(
                              'p-4 border transition-all text-left',
                              proposalType === 'unfreeze'
                                ? 'border-success bg-success/10'
                                : 'border-border hover:border-muted-foreground'
                            )}
                            style={{ borderRadius: '2px' }}
                          >
                            <div className="font-bold text-success mb-1 font-mono uppercase">🔓 Unfreeze</div>
                            <p className="text-xs text-muted-foreground font-mono">
                              Restore address access
                            </p>
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-muted-foreground mb-2 block font-mono uppercase tracking-wider">
                          Target Address
                        </label>
                        <input
                          type="text"
                          placeholder="0x..."
                          value={targetAddress}
                          onChange={(e) => setTargetAddress(e.target.value)}
                          className="glow-input w-full"
                        />
                      </div>

                      <div className="flex gap-3">
                        <NeonButton 
                          variant="secondary" 
                          className="flex-1"
                          onClick={() => setShowNewProposal(false)}
                        >
                          CANCEL
                        </NeonButton>
                        <NeonButton 
                          variant={proposalType === 'freeze' ? 'danger' : 'success'}
                          className="flex-1"
                          disabled={!targetAddress}
                        >
                          <FileText className="w-4 h-4" />
                          SUBMIT
                        </NeonButton>
                      </div>
                    </div>
                  </NeonBorderCard>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Proposals List */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2 font-mono uppercase tracking-wider">
              <FileText className="w-5 h-5 text-muted-foreground" />
              All Proposals
            </h2>

            {MOCK_DATA.proposals.length === 0 ? (
              <GlassCard className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-bold mb-2 font-mono uppercase">No Proposals</h3>
                <p className="text-muted-foreground mb-4 font-mono text-sm">
                  Create your first proposal to get started
                </p>
                <NeonButton onClick={() => setShowNewProposal(true)}>
                  <Plus className="w-4 h-4" />
                  CREATE PROPOSAL
                </NeonButton>
              </GlassCard>
            ) : (
              MOCK_DATA.proposals.map((proposal, index) => (
                <motion.div
                  key={proposal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GlassCard 
                    glow={proposal.executed ? 'emerald' : 'amber'}
                    className="hover:border-primary/50"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 hex-clip gradient-amber flex items-center justify-center text-lg font-bold font-mono text-background">
                          #{proposal.id}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <TypeBadge type={proposal.type as 'freeze' | 'unfreeze'} />
                            {proposal.executed ? (
                              <StatusBadge status="success">EXECUTED</StatusBadge>
                            ) : (
                              <StatusBadge status="pending" pulse>PENDING</StatusBadge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                            <Clock className="w-3 h-3" />
                            {formatTime(proposal.timestamp)}
                          </div>
                        </div>
                      </div>
                      <OwnerAvatars owners={MOCK_DATA.owners.slice(0, proposal.confirmations)} />
                    </div>

                    <div className="mb-4">
                      <label className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Target</label>
                      <AddressDisplay address={proposal.target} className="mt-1" />
                    </div>

                    <ThresholdProgress
                      current={proposal.confirmations}
                      threshold={MOCK_DATA.threshold}
                      total={MOCK_DATA.owners.length}
                    />

                    {!proposal.executed && (
                      <div className="flex gap-3 mt-4">
                        <NeonButton 
                          variant="secondary" 
                          className="flex-1"
                          disabled={proposal.confirmations >= MOCK_DATA.threshold}
                        >
                          <Check className="w-4 h-4" />
                          CONFIRM
                        </NeonButton>
                        <NeonButton 
                          variant="success"
                          className="flex-1"
                          disabled={proposal.confirmations < MOCK_DATA.threshold}
                        >
                          <Play className="w-4 h-4" />
                          EXECUTE
                        </NeonButton>
                      </div>
                    )}

                    {proposal.executed && (
                      <div className="mt-4 p-3 bg-success/10 border border-success/30 flex items-center gap-2 text-success font-mono text-sm" style={{ borderRadius: '2px' }}>
                        <CheckCircle className="w-5 h-5" />
                        <span className="uppercase">Proposal executed successfully</span>
                      </div>
                    )}
                  </GlassCard>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
