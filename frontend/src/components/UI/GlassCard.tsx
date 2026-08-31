import React from 'react';
import { motion } from 'framer-motion';

export type CardVariant = 'default' | 'teal' | 'blue' | 'emerald' | 'green' | 'amber' | 'rose' | 'red' | 'purple' | 'slate' | 'none';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  glow?: CardVariant;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  onClick,
  hover = false,
  glow = 'default',
}) => {
  // Enterprise clinical border & accent styling
  const variantStyles: Record<CardVariant, string> = {
    default: 'bg-white border-[#E2E8F0] shadow-sm',
    teal: 'bg-white border-[#CCFBF1] hover:border-[#0F766E]/40 shadow-sm',
    blue: 'bg-white border-[#BAE6FD] hover:border-[#0284C7]/40 shadow-sm',
    emerald: 'bg-white border-[#A7F3D0] hover:border-[#059669]/40 shadow-sm',
    green: 'bg-white border-[#A7F3D0] hover:border-[#059669]/40 shadow-sm',
    amber: 'bg-white border-[#FDE68A] hover:border-[#D97706]/40 shadow-sm',
    rose: 'bg-white border-[#FECACA] hover:border-[#DC2626]/40 shadow-sm',
    red: 'bg-white border-[#FECACA] hover:border-[#DC2626]/40 shadow-sm',
    purple: 'bg-white border-[#E2E8F0] hover:border-[#64748B]/40 shadow-sm',
    slate: 'bg-white border-[#E2E8F0] hover:border-[#94A3B8] shadow-sm',
    none: 'bg-white border-[#E2E8F0] shadow-sm',
  };

  const selectedVariant = variantStyles[glow] || variantStyles.default;

  return (
    <motion.div
      whileHover={hover ? { y: -2, transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] } } : undefined}
      onClick={onClick}
      className={`rounded-xl border p-5 transition-all duration-200 text-[#0F172A] ${selectedVariant} ${
        hover ? 'cursor-pointer hover:shadow-md' : ''
      } ${className}`}
    >
      {children}
    </motion.div>
  );
};
