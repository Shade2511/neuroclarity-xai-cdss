import React from 'react';
import {
  Brain,
  Info,
  Layers,
  Cpu,
  ShieldAlert,
  Sparkles,
  GitBranch,
  Code2,
} from 'lucide-react';
import { Layout } from '../components/Layout/Layout';
import { GlassCard } from '../components/UI/GlassCard';
import { StatusBadge } from '../components/UI/StatusBadge';

export const AboutPage: React.FC = () => {
  return (
    <Layout title="About NeuroClarity & Model Card">
      {/* Header */}
      <GlassCard className="p-6 bg-white border-[#E2E8F0] shadow-xs">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <StatusBadge status="MODEL CARD SPECIFICATION" size="sm" />
            <span className="text-xs text-[#64748B] font-semibold">v1.0.0 Production Prototype</span>
          </div>
          <h2 className="text-2xl font-bold text-[#0F172A]">NeuroClarity XAI-CDSS Model Card & Architecture</h2>
          <p className="text-xs text-[#475569] max-w-2xl leading-relaxed">
            Standardized Model Card documenting model intentions, input feature domains, training constraints, known limitations, and multi-agent development workflow.
          </p>
        </div>
      </GlassCard>

      {/* Model Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Model Details */}
        <GlassCard className="p-5 space-y-3 bg-white">
          <h3 className="text-sm font-bold uppercase text-[#0F766E]">1. Model Details & Purpose</h3>
          <ul className="space-y-2 text-xs text-[#334155]">
            <li><strong>Model Name:</strong> NeuroClarity Multi-Algorithm Ensemble (RF, LR, DT, XGB)</li>
            <li><strong>Intended Task:</strong> Binary & probabilistic prediction of ≥50% MADRS score reduction at Week 6 in adult MDD patients.</li>
            <li><strong>Primary Inputs:</strong> 22 structured clinical features (demographics, psychiatric history, MADRS baseline, GAD-7, MARS adherence, ADRs, comorbidities).</li>
            <li><strong>Explainability Layer:</strong> Exact TreeSHAP and Linear SHAP feature attribution + LIME local linear perturbation models.</li>
          </ul>
        </GlassCard>

        {/* Clinical Limitations */}
        <GlassCard className="p-5 space-y-3 bg-[#FFFBEB] border-[#FDE68A]">
          <h3 className="text-sm font-bold text-[#92400E] uppercase flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-[#D97706]" />
            <span>2. Known Limitations & Safe Use</span>
          </h3>
          <ul className="space-y-2 text-xs text-[#92400E] leading-relaxed">
            <li>• Prototype built on synthetic demonstration dataset (N=320). External prospective clinical validation is required prior to hospital deployment.</li>
            <li>• Does NOT replace psychiatrist judgment; designed solely as a human-in-the-loop decision-support system.</li>
            <li>• Does not provide autonomous automated prescribing or dosing alterations.</li>
          </ul>
        </GlassCard>
      </div>

      {/* Antigravity Collaborative AI Workflow Card */}
      <GlassCard className="p-6 space-y-4 bg-white">
        <h3 className="text-sm font-bold uppercase text-[#0F766E] flex items-center space-x-2">
          <Sparkles className="w-4 h-4" />
          <span>Antigravity Multi-Agent Collaborative Architecture</span>
        </h3>
        <p className="text-xs text-[#475569] leading-relaxed">
          The NeuroClarity XAI-CDSS was architected using specialized AI engineering agents operating collaboratively:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center text-xs pt-2">
          {[
            { role: 'IDE Orchestrator', desc: 'Task breakdown & planning' },
            { role: 'Coding Agent', desc: 'Pipelines & full-stack React' },
            { role: 'Data Agent', desc: 'Synthetic cohort & MICE' },
            { role: 'ML Agent', desc: 'Scikit & XGBoost models' },
            { role: 'XAI Agent', desc: 'SHAP & LIME attributions' },
            { role: 'Deployment Agent', desc: 'CDSS Web UI & Verification' },
          ].map((agent, i) => (
            <div key={i} className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
              <span className="text-xs text-[#0F766E] font-bold block">{agent.role}</span>
              <span className="text-[11px] text-[#64748B] block">{agent.desc}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </Layout>
  );
};
