import { motion } from 'framer-motion';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityItem {
  id: string;
  type: 'success' | 'pending' | 'failed';
  title: string;
  time: string;
  hash?: string;
}

interface ActivityTimelineProps {
  items: ActivityItem[];
  maxItems?: number;
  className?: string;
}

export function ActivityTimeline({ items, maxItems = 5, className }: ActivityTimelineProps) {
  const displayItems = items.slice(0, maxItems);

  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-primary" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-destructive" />;
    }
  };

  const getColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'success':
        return 'border-success/30';
      case 'pending':
        return 'border-primary/30';
      case 'failed':
        return 'border-destructive/30';
    }
  };

  if (displayItems.length === 0) {
    return (
      <div className={cn('text-center py-8 text-muted-foreground text-sm font-mono', className)}>
        No recent activity
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {displayItems.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className={cn(
            'flex items-start gap-3 p-2 rounded border-l-2',
            getColor(item.type)
          )}
        >
          <div className="mt-0.5">{getIcon(item.type)}</div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-mono font-semibold truncate">{item.title}</div>
            <div className="text-xs text-muted-foreground font-mono">{item.time}</div>
            {item.hash && (
              <div className="text-xs text-muted-foreground font-mono mt-1 truncate">
                {item.hash.slice(0, 10)}...{item.hash.slice(-8)}
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
