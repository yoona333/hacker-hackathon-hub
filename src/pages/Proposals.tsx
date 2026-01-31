import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FileText, ArrowLeft, Plus, Check, Play, 
  Clock, CheckCircle, X
} from 'lucide-react';
import { ParticleBackground } from '@/components/3d/ParticleBackground';
import { NeonButton } from '@/components/ui/neon-button';
import { ThresholdProgress } from '@/components/ui/neon-progress';
import { StatusBadge, TypeBadge, NetworkBadge } from '@/components/ui/status-badge';
import { useWallet } from '@/lib/web3/hooks';
import { MOCK_DATA, kiteTestnet, shortenAddress } from '@/lib/web3/config';
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
    
    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    return 'now';
  };

  const pendingCount = MOCK_DATA.proposals.filter(p => !p.executed).length;
  const executedCount = MOCK_DATA.proposals.filter(p => p.executed).length;

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
              <div className="w-6 h-6 sm:w-8 sm:h-8 hex-clip gradient-amber flex items-center justify-center">
                <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-background" />
              </div>
              <span className="text-sm sm:text-lg font-bold font-mono terminal-text uppercase">Proposals</span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:block">
              <NetworkBadge connected={isConnected} chainName={kiteTestnet.name} />
            </div>
            <NeonButton onClick={() => setShowNewProposal(true)} size="sm">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">NEW</span>
            </NeonButton>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 sm:py-6">
        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="control-panel mb-4"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-between sm:justify-start">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold terminal-text font-mono">{MOCK_DATA.proposals.length}</div>
                <div className="text-[10px] text-muted-foreground font-mono uppercase">Total</div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-primary font-mono">{pendingCount}</div>
                <div className="text-[10px] text-muted-foreground font-mono uppercase">Pending</div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-success font-mono">{executedCount}</div>
                <div className="text-[10px] text-muted-foreground font-mono uppercase">Executed</div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              Threshold: {MOCK_DATA.threshold}/{MOCK_DATA.owners.length}
            </div>
          </div>
        </motion.div>

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
                className="w-full max-w-md mx-4 control-panel"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="panel-title border-0 pb-0 mb-0 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Create Proposal
                  </div>
                  <button onClick={() => setShowNewProposal(false)} className="p-1 hover:bg-muted/50">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="data-label mb-2">Type</div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setProposalType('freeze')}
                        className={cn(
                          'p-3 border transition-all text-left',
                          proposalType === 'freeze'
                            ? 'border-destructive bg-destructive/10'
                            : 'border-border hover:border-muted-foreground'
                        )}
                        style={{ borderRadius: '2px' }}
                      >
                        <div className="font-bold text-destructive font-mono uppercase text-xs">❄️ Freeze</div>
                      </button>
                      <button
                        onClick={() => setProposalType('unfreeze')}
                        className={cn(
                          'p-3 border transition-all text-left',
                          proposalType === 'unfreeze'
                            ? 'border-success bg-success/10'
                            : 'border-border hover:border-muted-foreground'
                        )}
                        style={{ borderRadius: '2px' }}
                      >
                        <div className="font-bold text-success font-mono uppercase text-xs">🔓 Unfreeze</div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="data-label mb-2">Target Address</div>
                    <input
                      type="text"
                      placeholder="0x..."
                      value={targetAddress}
                      onChange={(e) => setTargetAddress(e.target.value)}
                      className="glow-input w-full text-sm"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <NeonButton 
                      variant="secondary" 
                      size="sm"
                      className="flex-1"
                      onClick={() => setShowNewProposal(false)}
                    >
                      CANCEL
                    </NeonButton>
                    <NeonButton 
                      variant={proposalType === 'freeze' ? 'danger' : 'success'}
                      size="sm"
                      className="flex-1"
                      disabled={!targetAddress}
                    >
                      SUBMIT
                    </NeonButton>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Proposals List */}
        <div className="space-y-2">
          {MOCK_DATA.proposals.length === 0 ? (
            <div className="control-panel text-center py-12">
              <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <div className="font-mono uppercase text-sm mb-3">No Proposals</div>
              <NeonButton onClick={() => setShowNewProposal(true)} size="sm">
                <Plus className="w-4 h-4" />
                CREATE FIRST
              </NeonButton>
            </div>
          ) : (
            MOCK_DATA.proposals.map((proposal, index) => (
              <motion.div
                key={proposal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="control-panel"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* ID Badge */}
                  <div className="w-8 h-8 sm:w-10 sm:h-10 hex-clip gradient-amber flex items-center justify-center text-xs sm:text-sm font-bold font-mono text-background flex-shrink-0">
                    #{proposal.id}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <TypeBadge type={proposal.type as 'freeze' | 'unfreeze'} />
                      {proposal.executed ? (
                        <StatusBadge status="success">EXECUTED</StatusBadge>
                      ) : (
                        <StatusBadge status="pending" pulse>PENDING</StatusBadge>
                      )}
                      <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(proposal.timestamp)}
                      </span>
                    </div>

                    <div className="data-row py-1 border-0">
                      <span className="data-label">Target</span>
                      <span className="font-mono text-xs text-primary">{shortenAddress(proposal.target)}</span>
                    </div>

                    <ThresholdProgress
                      current={proposal.confirmations}
                      threshold={MOCK_DATA.threshold}
                      total={MOCK_DATA.owners.length}
                      className="mt-2"
                    />

                    {!proposal.executed && (
                      <div className="flex flex-col sm:flex-row gap-2 mt-3">
                        <NeonButton 
                          variant="secondary" 
                          size="sm"
                          className="flex-1"
                          disabled={proposal.confirmations >= MOCK_DATA.threshold}
                        >
                          <Check className="w-3 h-3" />
                          CONFIRM
                        </NeonButton>
                        <NeonButton 
                          variant="success"
                          size="sm"
                          className="flex-1"
                          disabled={proposal.confirmations < MOCK_DATA.threshold}
                        >
                          <Play className="w-3 h-3" />
                          EXECUTE
                        </NeonButton>
                      </div>
                    )}

                    {proposal.executed && (
                      <div className="mt-2 flex items-center gap-1 text-success font-mono text-[10px] uppercase">
                        <CheckCircle className="w-3 h-3" />
                        Executed successfully
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
