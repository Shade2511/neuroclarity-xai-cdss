import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { GlassCard, CardVariant } from './GlassCard';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  change?: number;
  changeType?: 'up' | 'down' | 'neutral';
  icon?: LucideIcon;
  color?: CardVariant;
  subtitle?: string;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  change,
  changeType,
  icon: Icon,
  color = 'default',
  subtitle,
  className = '',
}) => {
  const iconColors: Record<CardVariant, string> = {
    default: 'text-[#0F766E] bg-[#F0FDFA] border-[#CCFBF1]',
    teal: 'text-[#0F766E] bg-[#F0FDFA] border-[#CCFBF1]',
    blue: 'text-[#0284C7] bg-[#F0F9FF] border-[#BAE6FD]',
    emerald: 'text-[#059669] bg-[#ECFDF5] border-[#A7F3D0]',
    green: 'text-[#059669] bg-[#ECFDF5] border-[#A7F3D0]',
    amber: 'text-[#D97706] bg-[#FFFBEB] border-[#FDE68A]',
    rose: 'text-[#DC2626] bg-[#FEF2F2] border-[#FECACA]',
    red: 'text-[#DC2626] bg-[#FEF2F2] border-[#FECACA]',
    purple: 'text-[#475569] bg-[#F8FAFC] border-[#E2E8F0]',
    slate: 'text-[#475569] bg-[#F8FAFC] border-[#E2E8F0]',
    none: 'text-[#475569] bg-[#F8FAFC] border-[#E2E8F0]',
  };

  const selectedIconStyle = iconColors[color] || iconColors.default;

  return (
    <GlassCard glow={color} className={`relative ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-wider font-semibold text-[#64748B] mb-1.5 font-sans">
            {label}
          </p>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-3xl font-extrabold tracking-tight text-[#0F172A] font-sans">
              {value}
            </span>
            {unit && <span className="text-xs font-semibold text-[#64748B]">{unit}</span>}
          </div>
          {subtitle && <p className="text-[12px] text-[#64748B] mt-1.5">{subtitle}</p>}
        </div>

        {Icon && (
          <div className={`p-2.5 rounded-xl border ${selectedIconStyle}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {change !== undefined && (
        <div className="mt-3.5 pt-3 border-t border-[#F1F5F9] flex items-center text-xs space-x-2">
          {changeType === 'up' && (
            <span className="inline-flex items-center text-[#059669] font-semibold bg-[#ECFDF5] px-1.5 py-0.5 rounded text-[11px]">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              +{change}%
            </span>
          )}
          {changeType === 'down' && (
            <span className="inline-flex items-center text-[#DC2626] font-semibold bg-[#FEF2F2] px-1.5 py-0.5 rounded text-[11px]">
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              {change}%
            </span>
          )}
          {changeType === 'neutral' && (
            <span className="inline-flex items-center text-[#64748B] font-semibold bg-[#F8FAFC] px-1.5 py-0.5 rounded text-[11px]">
              <Minus className="w-3.5 h-3.5 mr-0.5" />
              {change}%
            </span>
          )}
          <span className="text-[#64748B] text-[11px]">vs population baseline</span>
        </div>
      )}
    </GlassCard>
  );
};
