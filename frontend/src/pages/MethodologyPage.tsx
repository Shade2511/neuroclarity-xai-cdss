import React, { useState } from 'react';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  XCircle,
  Layers,
  ArrowRight,
  Brain,
  Cpu,
  Database,
  Sparkles,
} from 'lucide-react';
import { Layout } from '../components/Layout/Layout';
import { GlassCard } from '../components/UI/GlassCard';
import { StatusBadge } from '../components/UI/StatusBadge';

export const MethodologyPage: React.FC = () => {
  const [screener, setScreener] = useState({
    age: 32,
    hasMDD: true,
    hasAntidepressant: true,
    hasBipolar: false,
    hasPsychosis: false,
    pregnant: false,
  });

  const isEligible =
    screener.age >= 18 &&
    screener.hasMDD &&
    screener.hasAntidepressant &&
    !screener.hasBipolar &&
    !screener.hasPsychosis &&
    !screener.pregnant;

  return (
    <Layout title="Study Methodology & Scientific Protocol">
      {/* Header */}
      <GlassCard className="p-6 bg-white border-[#E2E8F0] shadow-xs">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <StatusBadge status="RESEARCH PROTOCOL" size="sm" />
            <span className="text-xs text-[#64748B] font-semibold">Prospective Observational Cohort Study</span>
          </div>
          <h2 className="text-2xl font-bold text-[#0F172A]">Study Protocol & Methodology Framework</h2>
          <p className="text-xs text-[#475569] max-w-2xl leading-relaxed">
            Standardized methodology for participant screening, ethical approvals, multi-modal feature preprocessing, ML model training, and prospective XAI deployment.
          </p>
        </div>
      </GlassCard>

      {/* 6-Month Project Timeline */}
      <GlassCard className="p-6 space-y-4 bg-white">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#0F766E] flex items-center space-x-2">
          <Calendar className="w-4 h-4" />
          <span>6-Month Longitudinal Study Timeline</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 pt-2">
          {[
            { month: 'Month 1', title: 'Literature & Protocol', desc: 'CRF design, scale approvals, literature review' },
            { month: 'Month 2', title: 'Ethics & Site Prep', desc: 'IEC approvals, clinician training, CRF digitization' },
            { month: 'Month 3', title: 'Cohort Enrollment', desc: 'Consecutive sampling, baseline MADRS & GAD-7' },
            { month: 'Month 4', title: 'Follow-Up Visits', desc: 'Week 2, 4, 6 assessments, pill count tracking' },
            { month: 'Month 5', title: 'ML & XAI Pipelines', desc: 'Model training, CV, bootstrap, SHAP/LIME fitting' },
            { month: 'Month 6', title: 'Synthesis & Thesis', desc: 'DCA evaluation, statistical writeup, reporting' },
          ].map((m, idx) => (
            <div key={idx} className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
              <span className="text-[10px] font-bold text-[#0F766E] uppercase">{m.month}</span>
              <h4 className="text-xs font-bold text-[#0F172A]">{m.title}</h4>
              <p className="text-[11px] text-[#64748B] leading-tight">{m.desc}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Inclusion & Exclusion Criteria + Interactive Screener */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Criteria Checklist (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <GlassCard className="p-5 space-y-4 bg-white">
            <h3 className="text-sm font-bold text-[#0F172A] uppercase">
              Study Eligibility Criteria
            </h3>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#0F766E] uppercase">Inclusion Criteria</h4>
              <ul className="space-y-1.5 text-xs text-[#334155]">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                  <span>Adult patients aged ≥ 18 years diagnosed with Major Depressive Disorder (MDD).</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                  <span>Prescribed at least one therapeutic antidepressant regimen (SSRI, SNRI, TCA, etc.).</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                  <span>Documented baseline clinical evaluation and medication details.</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                  <span>Available for scheduled longitudinal follow-up at Week 2, 4, and 6.</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2 pt-2 border-t border-[#F1F5F9]">
              <h4 className="text-xs font-bold text-[#DC2626] uppercase">Exclusion Criteria</h4>
              <ul className="space-y-1.5 text-xs text-[#334155]">
                <li className="flex items-center space-x-2">
                  <XCircle className="w-3.5 h-3.5 text-[#DC2626] shrink-0" />
                  <span>Primary diagnosis of Bipolar Affective Disorder or Schizophrenia / Psychosis.</span>
                </li>
                <li className="flex items-center space-x-2">
                  <XCircle className="w-3.5 h-3.5 text-[#DC2626] shrink-0" />
                  <span>Antidepressants prescribed exclusively for non-psychiatric indications (e.g. neuropathic pain).</span>
                </li>
                <li className="flex items-center space-x-2">
                  <XCircle className="w-3.5 h-3.5 text-[#DC2626] shrink-0" />
                  <span>Concurrent ECT (Electroconvulsive Therapy) or neuromodulation during the evaluation window.</span>
                </li>
                <li className="flex items-center space-x-2">
                  <XCircle className="w-3.5 h-3.5 text-[#DC2626] shrink-0" />
                  <span>Pregnant or postpartum participants per safety protocol.</span>
                </li>
              </ul>
            </div>
          </GlassCard>
        </div>

        {/* Interactive Eligibility Screener (5 cols) */}
        <div className="lg:col-span-5">
          <GlassCard className="p-5 space-y-4 bg-white">
            <h3 className="text-sm font-bold text-[#0F172A] uppercase">
              Interactive Eligibility Screener
            </h3>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                <span className="font-medium text-[#334155]">Patient Age ≥ 18:</span>
                <input
                  type="number"
                  value={screener.age}
                  onChange={(e) => setScreener({ ...screener, age: Number(e.target.value) })}
                  className="w-16 bg-white border border-[#CBD5E1] p-1 text-center text-[#0F172A] rounded font-bold"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] cursor-pointer">
                <span className="font-medium text-[#334155]">MDD Diagnostic Criteria Met:</span>
                <input
                  type="checkbox"
                  checked={screener.hasMDD}
                  onChange={(e) => setScreener({ ...screener, hasMDD: e.target.checked })}
                  className="rounded text-[#0F766E]"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] cursor-pointer">
                <span className="font-medium text-[#334155]">Antidepressant Prescribed:</span>
                <input
                  type="checkbox"
                  checked={screener.hasAntidepressant}
                  onChange={(e) => setScreener({ ...screener, hasAntidepressant: e.target.checked })}
                  className="rounded text-[#0F766E]"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] cursor-pointer">
                <span className="font-medium text-[#334155]">History of Bipolar / Psychosis:</span>
                <input
                  type="checkbox"
                  checked={screener.hasBipolar}
                  onChange={(e) => setScreener({ ...screener, hasBipolar: e.target.checked })}
                  className="rounded text-[#DC2626]"
                />
              </label>
            </div>

            <div className={`p-3 rounded-lg border text-center text-xs font-bold ${
              isEligible ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#059669]' : 'bg-[#FEF2F2] border-[#FECACA] text-[#DC2626]'
            }`}>
              {isEligible ? '✓ PARTICIPANT ELIGIBLE FOR INTAKE' : '✗ PARTICIPANT EXCLUDED BY PROTOCOL'}
            </div>
          </GlassCard>
        </div>
      </div>
    </Layout>
  );
};
