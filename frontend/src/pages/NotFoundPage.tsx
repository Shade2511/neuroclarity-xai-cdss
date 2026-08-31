import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, ArrowLeft, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F6F8FB] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Logo */}
        <div className="flex items-center justify-center space-x-2">
          <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-[#CCFBF1] flex items-center justify-center">
            <Brain className="w-5 h-5 text-[#0F766E]" />
          </div>
          <span className="text-lg font-extrabold text-[#0F172A]">NeuroClarity</span>
        </div>

        {/* 404 Error Display */}
        <div className="p-8 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm space-y-4">
          <div className="text-7xl font-extrabold text-[#E2E8F0] select-none">404</div>
          <div>
            <h1 className="text-xl font-bold text-[#0F172A]">Clinical Route Not Found</h1>
            <p className="text-sm text-[#64748B] mt-1 leading-relaxed">
              The page you're looking for doesn't exist in the NeuroClarity system. Please navigate back to the dashboard.
            </p>
          </div>

          {/* Clinical Disclaimer */}
          <div className="p-3 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] text-xs text-[#92400E] text-left">
            If you navigated here from a clinical workflow, please use the sidebar navigation to return to your session. No patient data has been lost.
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 py-2.5 px-4 bg-white hover:bg-[#F8FAFC] text-[#475569] border border-[#CBD5E1] rounded-lg text-sm font-semibold flex items-center justify-center space-x-2 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 py-2.5 px-4 bg-[#0F766E] hover:bg-[#115E59] text-white rounded-lg text-sm font-bold flex items-center justify-center space-x-2 cursor-pointer transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Return to NeuroClarity</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-[#94A3B8]">
          NeuroClarity XAI-CDSS • Explainable AI Clinical Decision Support
        </p>
      </div>
    </div>
  );
};
