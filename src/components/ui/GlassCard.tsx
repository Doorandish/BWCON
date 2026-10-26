'use client';

import { type ReactNode, type HTMLAttributes } from 'react';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
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
  hover = false,
  className = '',
  ...props
}: GlassCardProps) {
  return (
    <div
      className={`${variantStyles[variant]} p-6 transition-all duration-200 ${
        hover ? 'hover:border-white/30 hover:bg-white/[0.09]' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
