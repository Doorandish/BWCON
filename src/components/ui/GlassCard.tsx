'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { type ReactNode } from 'react';

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  variant?: 'default' | 'strong' | 'subtle';
  hover?: boolean;
  className?: string;
}

const variantStyles = {
  default: 'glass-panel',
  strong: 'glass-panel-strong',
  subtle: 'bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl',
};

export default function GlassCard({
  children,
  variant = 'default',
  hover = true,
  className = '',
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`${variantStyles[variant]} p-6 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
