import React from 'react';
import { AlertCircle, ShieldAlert } from 'lucide-react';

interface DisclaimerBannerProps {
  className?: string;
  variant?: 'subtle' | 'prominent';
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({
  className = '',
  variant = 'subtle',
}) => {
  if (variant === 'prominent') {
    return (
      <div
        className={`bg-[#FFFBEB] border border-[#FDE68A] rounded-xl p-4 flex items-start space-x-3 text-[#92400E] shadow-sm ${className}`}
      >
        <ShieldAlert className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <p className="font-bold text-[#B45309] uppercase tracking-wider mb-0.5 text-[11px]">
            Clinical Decision Support System — Research & Educational Prototype
          </p>
          <p className="text-[#92400E]">
            This clinical decision support system provides probabilistic treatment outcome estimations. It is designed strictly for investigational decision support and does not replace the autonomous medical judgment of a licensed psychiatrist or physician.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white border-t border-[#E2E8F0] py-2.5 px-4 flex items-center justify-center space-x-2 text-[11px] text-[#64748B] font-medium ${className}`}
    >
      <AlertCircle className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
      <span>
        <strong className="text-[#334155]">CLINICAL DECISION SUPPORT:</strong> AI probabilistic output only — licensed psychiatrist evaluation and verification required.
      </span>
    </div>
  );
};
