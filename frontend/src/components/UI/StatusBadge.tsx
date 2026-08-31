import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className = '',
}) => {
  const getStyle = () => {
    const s = status.toLowerCase();
    
    // Positive / Responder / Active
    if (s.includes('responder') && !s.includes('non') && !s.includes('partial')) {
      return {
        bg: 'bg-[#ECFDF5] border-[#A7F3D0] text-[#059669]',
        dot: 'bg-[#059669]',
      };
    }
    if (s.includes('partial')) {
      return {
        bg: 'bg-[#FFFBEB] border-[#FDE68A] text-[#D97706]',
        dot: 'bg-[#D97706]',
      };
    }
    if (s.includes('non') || s.includes('error') || s.includes('severe') || s.includes('fail') || s.includes('excluded') || s.includes('high risk')) {
      return {
        bg: 'bg-[#FEF2F2] border-[#FECACA] text-[#DC2626]',
        dot: 'bg-[#DC2626]',
      };
    }
    if (s.includes('demo') || s.includes('synthetic') || s.includes('prototype')) {
      return {
        bg: 'bg-[#F0F9FF] border-[#BAE6FD] text-[#0284C7]',
        dot: 'bg-[#0284C7]',
      };
    }
    if (s.includes('ready') || s.includes('active') || s.includes('good') || s.includes('high') || s.includes('eligible') || s.includes('live') || s.includes('validated')) {
      return {
        bg: 'bg-[#F0FDFA] border-[#CCFBF1] text-[#0F766E]',
        dot: 'bg-[#0F766E]',
      };
    }
    
    // Default neutral slate
    return {
      bg: 'bg-[#F8FAFC] border-[#E2E8F0] text-[#475569]',
      dot: 'bg-[#64748B]',
    };
  };

  const { bg, dot } = getStyle();
  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 space-x-1.5 font-semibold tracking-wide',
    md: 'text-xs px-2.5 py-1 space-x-1.5 font-semibold tracking-wide',
    lg: 'text-xs px-3.5 py-1.5 space-x-2 font-bold tracking-wide',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border ${bg} ${sizeStyles[size]} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      <span>{status}</span>
    </span>
  );
};
