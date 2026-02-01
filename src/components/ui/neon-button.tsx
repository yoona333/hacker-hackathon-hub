import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NeonButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export function NeonButton({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  pulse = false, 
  children,
  disabled,
  onClick,
  type = 'button'
}: NeonButtonProps) {
  const variants = {
    primary: 'cyber-button',
    secondary: 'cyber-button cyber-button-secondary',
    success: 'cyber-button cyber-button-success',
    danger: 'cyber-button cyber-button-danger',
    outline: 'cyber-button cyber-button-secondary',
  };

  const sizes = {
    sm: 'px-4 py-2.5 text-xs min-h-[44px]',  // 44px minimum touch target
    md: 'px-6 py-3.5 text-sm min-h-[44px]',  // 44px minimum touch target
    lg: 'px-8 py-4 text-base min-h-[48px]',  // 48px for larger buttons
  };

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      whileHover={disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      className={cn(
        variants[variant],
        sizes[size],
        pulse && 'animate-pulse-amber',
        className
      )}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
}

interface IconButtonProps {
  variant?: 'ghost' | 'solid';
  children?: ReactNode;
  className?: string;
  onClick?: () => void;
  title?: string;
}

export function IconButton({ 
  className, 
  variant = 'ghost', 
  children,
  onClick,
  title
}: IconButtonProps) {
  const variants = {
    ghost: 'bg-transparent hover:bg-muted/50 border border-transparent hover:border-primary/30',
    solid: 'gradient-amber',
  };

  return (
    <motion.button
      type="button"
      onClick={onClick}
      title={title}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={cn(
        'p-2 transition-all duration-200',
        variants[variant],
        className
      )}
      style={{ borderRadius: '2px' }}
    >
      {children}
    </motion.button>
  );
}
