import React, { useState } from 'react';
import {
  Settings,
  Cpu,
  Database,
  Sliders,
  Shield,
  RefreshCw,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { Layout } from '../components/Layout/Layout';
import { GlassCard } from '../components/UI/GlassCard';
import { StatusBadge } from '../components/UI/StatusBadge';
import toast, { Toaster } from 'react-hot-toast';

export const SettingsPage: React.FC = () => {
  const [demoMode, setDemoMode] = useState(true);
  const [defaultThreshold, setDefaultThreshold] = useState(0.5);
  const [autoExplain, setAutoExplain] = useState(true);

  const handleSave = () => {
    toast.success('System configuration preferences saved.');
  };

  return (
    <Layout title="Platform Configuration & Settings">
      <Toaster position="top-right" />

      {/* Header */}
      <GlassCard className="p-6 bg-white border-[#E2E8F0] shadow-xs">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <StatusBadge status="SYSTEM CONFIG" size="sm" />
            <span className="text-xs text-[#64748B] font-semibold">Platform Environment Preferences</span>
          </div>
          <h2 className="text-2xl font-bold text-[#0F172A]">System Settings & Inference Controls</h2>
          <p className="text-xs text-[#475569] max-w-2xl leading-relaxed">
            Configure default decision threshold probabilities, explainability triggers, and research cohort parameters.
          </p>
        </div>
      </GlassCard>

      {/* Settings Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-6 space-y-4 bg-white">
          <h3 className="text-sm font-bold uppercase text-[#0F766E] flex items-center space-x-2">
            <Sliders className="w-4 h-4" />
            <span>Inference & Threshold Settings</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between text-[#334155] mb-1">
                <span className="font-semibold">Default Responder Decision Threshold (pt):</span>
                <span className="font-bold text-[#0F766E]">{(defaultThreshold * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="0.8"
                step="0.05"
                value={defaultThreshold}
                onChange={(e) => setDefaultThreshold(Number(e.target.value))}
                className="w-full accent-[#0F766E]"
              />
              <span className="text-[10px] text-[#64748B]">Standard clinical trial threshold: 50% MADRS reduction.</span>
            </div>

            <label className="flex items-center justify-between p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] cursor-pointer">
              <div>
                <p className="font-bold text-[#0F172A]">Auto-Compute SHAP on Patient Selection</p>
                <p className="text-[11px] text-[#64748B]">Instantly generate feature attribution vectors upon loading patient.</p>
              </div>
              <input
                type="checkbox"
                checked={autoExplain}
                onChange={(e) => setAutoExplain(e.target.checked)}
                className="rounded text-[#0F766E]"
              />
            </label>
          </div>
        </GlassCard>

        <GlassCard className="p-6 space-y-4 bg-white">
          <h3 className="text-sm font-bold uppercase text-[#0284C7] flex items-center space-x-2">
            <Database className="w-4 h-4" />
            <span>Data Environment & Safety</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-lg bg-[#F0FDFA] border border-[#CCFBF1] space-y-1">
              <span className="font-bold text-[#0F766E]">DEMONSTRATION MODE ACTIVE</span>
              <p className="text-xs text-[#334155] leading-relaxed">
                Operating in synthetic mode (N=320 patients). All predictions are generated for educational and research prototype demonstration.
              </p>
            </div>

            <button
              onClick={handleSave}
              className="w-full py-2.5 bg-[#0F766E] hover:bg-[#115E59] text-white font-bold text-xs rounded-lg shadow-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </div>
        </GlassCard>
      </div>
    </Layout>
  );
};
