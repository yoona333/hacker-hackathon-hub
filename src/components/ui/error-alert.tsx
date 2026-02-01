import { AlertCircle, X, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ErrorAlertProps {
  title?: string;
  message: string;
  variant?: 'error' | 'warning' | 'info';
  onDismiss?: () => void;
  className?: string;
  showIcon?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function ErrorAlert({
  title,
  message,
  variant = 'error',
  onDismiss,
  className,
  showIcon = true,
  action,
}: ErrorAlertProps) {
  const variants = {
    error: {
      bg: 'bg-destructive/10',
      border: 'border-destructive/50',
      text: 'text-destructive',
      icon: AlertCircle,
    },
    warning: {
      bg: 'bg-primary/10',
      border: 'border-primary/50',
      text: 'text-primary',
      icon: AlertCircle,
    },
    info: {
      bg: 'bg-accent/10',
      border: 'border-accent/50',
      text: 'text-accent',
      icon: Info,
    },
  };

  const style = variants[variant];
  const Icon = style.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        'rounded-lg border p-4 font-mono text-sm',
        style.bg,
        style.border,
        className
      )}
    >
      <div className="flex items-start gap-3">
        {showIcon && (
          <Icon className={cn('w-5 h-5 shrink-0 mt-0.5', style.text)} />
        )}
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={cn('font-semibold mb-1', style.text)}>{title}</h4>
          )}
          <p className={cn('text-sm', style.text, !title && 'font-medium')}>
            {message}
          </p>
          {action && (
            <button
              onClick={action.onClick}
              className={cn(
                'mt-3 px-4 py-2 rounded border text-xs font-semibold transition-all',
                style.border,
                style.text,
                'hover:bg-background/50'
              )}
            >
              {action.label}
            </button>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={cn(
              'shrink-0 p-1 hover:bg-background/50 rounded transition-colors',
              style.text
            )}
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

interface ErrorBoundaryProps {
  error: Error | null;
  onRetry?: () => void;
  className?: string;
}

export function ErrorBoundary({ error, onRetry, className }: ErrorBoundaryProps) {
  if (!error) return null;

  return (
    <ErrorAlert
      title="Something went wrong"
      message={error.message || 'An unexpected error occurred'}
      variant="error"
      action={
        onRetry
          ? {
              label: 'Retry',
              onClick: onRetry,
            }
          : undefined
      }
      className={className}
    />
  );
}
