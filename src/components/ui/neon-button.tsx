import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
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
    primary: 'gradient-purple-blue hover:shadow-neon-purple',
    secondary: 'gradient-blue-cyan hover:shadow-neon-cyan',
    success: 'bg-success hover:shadow-[0_0_30px_hsl(142_76%_45%/0.5)]',
    danger: 'gradient-pink-purple hover:shadow-[0_0_30px_hsl(330_91%_60%/0.5)]',
    outline: 'bg-transparent border-2 border-primary hover:bg-primary/20',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      whileHover={disabled ? undefined : { scale: 1.05 }}
      whileTap={disabled ? undefined : { scale: 0.95 }}
      className={cn(
        'relative font-bold text-white rounded-xl overflow-hidden transition-all duration-300',
        'shadow-lg hover:shadow-xl',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        pulse && 'animate-pulse-glow',
        className
      )}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
      <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity" />
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
    ghost: 'bg-transparent hover:bg-muted/50',
    solid: 'gradient-purple-blue',
  };

  return (
    <motion.button
      type="button"
      onClick={onClick}
      title={title}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={cn(
        'p-2 rounded-lg transition-all duration-300',
        variants[variant],
        className
      )}
    >
      {children}
    </motion.button>
  );
}
