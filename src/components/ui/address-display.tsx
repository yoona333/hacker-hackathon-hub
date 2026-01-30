import { motion } from 'framer-motion';
import { Copy, ExternalLink, Check } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { shortenAddress, getExplorerUrl } from '@/lib/web3/config';
import { IconButton } from './neon-button';

interface AddressDisplayProps {
  address: string;
  short?: boolean;
  showCopy?: boolean;
  showExplorer?: boolean;
  className?: string;
}

export function AddressDisplay({ 
  address, 
  short = true, 
  showCopy = true, 
  showExplorer = true,
  className 
}: AddressDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayAddress = short ? shortenAddress(address) : address;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <motion.span 
        className="address-gradient font-mono text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {displayAddress}
      </motion.span>
      
      {showCopy && (
        <IconButton onClick={handleCopy} title="Copy address">
          {copied ? (
            <Check className="w-4 h-4 text-success" />
          ) : (
            <Copy className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          )}
        </IconButton>
      )}
      
      {showExplorer && (
        <IconButton 
          onClick={() => window.open(getExplorerUrl('address', address), '_blank')}
          title="View on explorer"
        >
          <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-foreground" />
        </IconButton>
      )}
    </div>
  );
}

interface AvatarProps {
  address: string;
  size?: 'sm' | 'md' | 'lg';
}

export function GradientAvatar({ address, size = 'md' }: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  // Generate a consistent color based on address
  const colorIndex = parseInt(address.slice(2, 4), 16) % 4;
  const gradients = [
    'from-neon-purple to-neon-blue',
    'from-neon-blue to-neon-cyan',
    'from-neon-cyan to-neon-pink',
    'from-neon-pink to-neon-purple',
  ];

  return (
    <div 
      className={cn(
        'rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold',
        sizes[size],
        gradients[colorIndex]
      )}
    >
      {address.slice(2, 4).toUpperCase()}
    </div>
  );
}

interface OwnerAvatarsProps {
  owners: string[];
  maxDisplay?: number;
}

export function OwnerAvatars({ owners, maxDisplay = 3 }: OwnerAvatarsProps) {
  const displayOwners = owners.slice(0, maxDisplay);
  const remaining = owners.length - maxDisplay;

  return (
    <div className="flex -space-x-2">
      {displayOwners.map((owner, index) => (
        <motion.div
          key={owner}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="ring-2 ring-background rounded-full"
        >
          <GradientAvatar address={owner} size="sm" />
        </motion.div>
      ))}
      {remaining > 0 && (
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium ring-2 ring-background">
          +{remaining}
        </div>
      )}
    </div>
  );
}
