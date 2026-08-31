import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <GlassCard className={`text-center py-12 px-6 flex flex-col items-center justify-center ${className}`}>
      <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] mb-3.5">
        <Icon className="w-7 h-7 text-[#0F766E]" />
      </div>
      <h3 className="text-sm font-bold text-[#0F172A] mb-1">{title}</h3>
      <p className="text-xs text-[#64748B] max-w-sm mb-5 leading-relaxed">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-[#0F766E] hover:bg-[#115E59] text-white font-semibold text-xs rounded-lg transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          {action.label}
        </button>
      )}
    </GlassCard>
  );
};
