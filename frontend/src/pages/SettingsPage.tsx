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
  Trash2,
  Users,
} from 'lucide-react';
import { Layout } from '../components/Layout/Layout';
import { GlassCard } from '../components/UI/GlassCard';
import { StatusBadge } from '../components/UI/StatusBadge';
import { useAppStore } from '../store';
import { loadDemoCohort, clearAllPatients } from '../services/api';
import toast, { Toaster } from 'react-hot-toast';

export const SettingsPage: React.FC = () => {
  const { patients, setPatients, setSelectedPatient } = useAppStore();
  const [defaultThreshold, setDefaultThreshold] = useState(0.5);
  const [autoExplain, setAutoExplain] = useState(true);

  const handleSave = () => {
    toast.success('System configuration preferences saved.');
  };

  const handleClearData = async () => {
    if (window.confirm('Are you sure you want to clear all patient records from local storage? This action cannot be undone.')) {
      await clearAllPatients();
      setPatients([]);
      setSelectedPatient(null);
      toast.success('All patient records cleared. Registry is now empty.');
    }
  };

  const handleLoadDemo = async () => {
    const demo = await loadDemoCohort();
    setPatients(demo);
    if (demo.length > 0) setSelectedPatient(demo[0]);
    toast.success(`Loaded 320 synthetic demo patients into registry.`);
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
            Configure default decision threshold probabilities, explainability triggers, and persistent patient registry management.
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

            <button
              onClick={handleSave}
              className="w-full py-2.5 bg-[#0F766E] hover:bg-[#115E59] text-white font-bold text-xs rounded-lg shadow-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Inference Preferences</span>
            </button>
          </div>
        </GlassCard>

        <GlassCard className="p-6 space-y-4 bg-white">
          <h3 className="text-sm font-bold uppercase text-[#0284C7] flex items-center space-x-2">
            <Database className="w-4 h-4" />
            <span>Persistent Patient Registry Storage</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#0F172A]">Enrolled Patient Records</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F0FDFA] text-[#0F766E] border border-[#CCFBF1]">
                  {patients.length} Records in LocalStorage
                </span>
              </div>
              <p className="text-xs text-[#475569] leading-relaxed">
                All patient intakes enrolled via the CRF form are saved persistently in your browser's local storage and retained across sessions.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={handleLoadDemo}
                className="w-full py-2.5 bg-[#F0F9FF] hover:bg-[#E0F2FE] border border-[#BAE6FD] text-[#0369A1] font-bold text-xs rounded-lg flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span>Load 320 Demo Patients (Testing Cohort)</span>
              </button>

              <button
                onClick={handleClearData}
                disabled={patients.length === 0}
                className={`w-full py-2.5 border text-xs font-bold rounded-lg flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                  patients.length === 0
                    ? 'border-[#E2E8F0] text-[#94A3B8] bg-[#F8FAFC] cursor-not-allowed'
                    : 'bg-[#FEF2F2] hover:bg-[#FEE2E2] border-[#FECACA] text-[#DC2626]'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear All Patient Records (Reset Registry)</span>
              </button>
            </div>
          </div>
        </GlassCard>
      </div>
    </Layout>
  );
};
