import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Brain,
  Activity,
  ArrowRight,
  Sparkles,
  Stethoscope,
  Sliders,
  CheckCircle2,
  Zap,
  Layers,
  ChevronRight,
  ShieldCheck,
  FileCheck,
  BarChart3,
  Bot,
} from 'lucide-react';
import { ClinicalBackground3D } from '../components/Motion/ClinicalBackground3D';
import { GlassCard } from '../components/UI/GlassCard';
import { StatusBadge } from '../components/UI/StatusBadge';
import { ClinicalAIChatbot } from '../components/AI/ClinicalAIChatbot';
import { useAppStore } from '../store';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { setSelectedPatient } = useAppStore();

  // Interactive Live Trial Outcome Estimator state
  const [marsScore, setMarsScore] = useState(8);
  const [madrsScore, setMadrsScore] = useState(32);
  const [gad7Score, setGad7Score] = useState(10);

  // Dynamic estimated probability formula
  const estimatedProb = Math.min(
    95,
    Math.max(20, Math.round(45 + (marsScore - 5) * 6 - (gad7Score - 8) * 2 + (madrsScore > 28 ? 10 : -5)))
  );

  const handleQuickDemo = (patientId: string) => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-[100dvh] bg-[#F6F8FB] text-[#0F172A] overflow-x-hidden bg-clinical-grid selection:bg-[#0F766E]/15 relative">
      {/* Central Reusable Clinical 3D Background Engine */}
      <ClinicalBackground3D />

      {/* ── TOP ENTERPRISE HEADER ── */}
      <header className="sticky top-0 left-0 right-0 h-14 sm:h-16 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] z-40 px-3 sm:px-8 flex items-center justify-between shadow-2xs">
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          <div className="w-7 h-7 sm:w-8 h-8 rounded-lg bg-[#F0FDFA] border border-[#CCFBF1] flex items-center justify-center shrink-0">
            <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-[#0F766E]" />
          </div>
          <div className="leading-tight">
            <h1 className="font-bold text-xs sm:text-sm tracking-tight text-[#0F172A] flex items-center gap-1">
              NeuroClarity <span className="hidden sm:inline text-[#0F766E] text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 rounded bg-[#F0FDFA] border border-[#CCFBF1]">XAI-CDSS</span>
            </h1>
            <p className="hidden sm:block text-[10px] text-[#64748B] font-medium uppercase tracking-wider">Clinical Decision Support Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden sm:block">
            <StatusBadge status="DEMO COHORT N=320" size="sm" />
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-3 sm:px-4 py-2 bg-[#0F766E] hover:bg-[#115E59] text-white font-bold text-xs rounded-lg shadow-sm transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <span>Launch Clinical CDSS</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ── HERO SECTION ── */}
      <section className="relative px-3.5 sm:px-6 pt-6 sm:pt-10 pb-12 sm:pb-16 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-12 min-h-[calc(100dvh-6rem)]">
          {/* Left Hero Column */}
          <div className="lg:w-7/12 space-y-4 sm:space-y-6 text-center lg:text-left w-full">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-[#F0FDFA] border border-[#CCFBF1] text-[#0F766E] text-[11px] sm:text-xs font-semibold max-w-full text-center"
            >
              <Activity className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />
              <span className="truncate sm:whitespace-normal">MDD · Antidepressant Outcome Intelligence</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 }}
              className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] text-[#0F172A]"
            >
              Predict Treatment Response.{' '}
              <span className="text-[#0F766E] block sm:inline">Explain Every Factor.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="text-xs sm:text-sm md:text-base text-[#475569] max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              A clinical decision support platform for psychiatrists and clinical researchers. Estimate 6-week treatment response (≥50% MADRS reduction) using 4 validated machine learning models with transparent SHAP and LIME explainability.
            </motion.p>

            {/* Core Clinical Principle Banner */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.16 }}
              className="flex flex-col sm:flex-row items-center justify-between gap-2 p-3 sm:p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-sm text-center sm:text-left"
            >
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#059669] telemetry-pulse shrink-0" />
                <p className="text-[11px] sm:text-xs font-bold text-[#0F172A]">
                  <span>AI Predicts.</span>{' '}
                  <span className="text-[#0F766E]">XAI Explains.</span>{' '}
                  <span className="text-[#0284C7]">Clinician Decides.</span>
                </p>
              </div>
              <span className="text-[10px] sm:text-[11px] font-semibold text-[#0F766E] px-2 py-0.5 rounded bg-[#F0FDFA] border border-[#CCFBF1]">
                Human-in-the-Loop Architecture
              </span>
            </motion.div>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-2.5 pt-1 w-full">
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto px-5 py-3 bg-[#0F766E] hover:bg-[#115E59] text-white font-bold text-xs rounded-lg shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Activity className="w-4 h-4" />
                <span>Open Clinical Command Center</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate('/explainability')}
                className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-[#F8FAFC] border border-[#CBD5E1] text-[#334155] hover:text-[#0F172A] font-semibold text-xs rounded-lg transition-all cursor-pointer shadow-2xs"
              >
                Inspect SHAP Waterfalls
              </button>

              <button
                onClick={() => navigate('/assessment')}
                className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-[#F8FAFC] border border-[#CBD5E1] text-[#475569] hover:text-[#0F172A] font-semibold text-xs rounded-lg transition-all cursor-pointer shadow-2xs"
              >
                Patient Intake CRF
              </button>
            </div>

            {/* Live Indicator Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-[#64748B] pt-1">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-[#059669]" />
                <span className="font-semibold text-[#334155]">4 ML Models (RF, LR, DT, XGB)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-[#0F766E]" />
                <span className="font-semibold text-[#334155]">TreeSHAP & Linear SHAP</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-[#0284C7]" />
                <span className="font-semibold text-[#334155]">Decision Curve Analysis</span>
              </div>
            </div>
          </div>

          {/* Right Hero Column: Bright Clinical Decision Support & Model Telemetry Card */}
          <div className="lg:w-5/12 w-full space-y-4">
            <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#059669] telemetry-pulse" />
                  <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                    Clinical AI Inference Pipeline
                  </h3>
                </div>
                <span className="text-[10px] font-semibold text-[#0F766E] bg-[#F0FDFA] px-2 py-0.5 rounded border border-[#CCFBF1]">
                  Live System Architecture
                </span>
              </div>

              {/* Step 1: Ingested Patient Profile */}
              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#64748B] font-semibold">Demo Patient NC-0001 Profile</span>
                  <span className="font-bold text-[#0F172A]">MADRS 32 • GAD-7 10</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[#475569]">
                  <span className="px-2 py-0.5 rounded bg-white border border-[#CBD5E1] font-medium">Escitalopram 10mg</span>
                  <span className="px-2 py-0.5 rounded bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] font-semibold">91.7% Adherence</span>
                </div>
              </div>

              {/* Step 2: 4-Model Probabilistic Output */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between font-semibold">
                  <span className="text-[#475569]">Random Forest Calibrated Response Prob.:</span>
                  <span className="text-[#059669] font-bold">78.4% (Likely Responder)</span>
                </div>
                <div className="w-full bg-[#F1F5F9] rounded-full h-2 overflow-hidden flex">
                  <div className="bg-[#059669] h-full" style={{ width: '78.4%' }} />
                  <div className="bg-[#D97706] h-full" style={{ width: '13.2%' }} />
                  <div className="bg-[#DC2626] h-full" style={{ width: '8.4%' }} />
                </div>
                <div className="flex justify-between text-[10px] text-[#64748B]">
                  <span>Responder: 78.4%</span>
                  <span>Partial: 13.2%</span>
                  <span>Non-Responder: 8.4%</span>
                </div>
              </div>

              {/* Step 3: SHAP Feature Attribution Factors */}
              <div className="p-3 bg-[#F0FDFA] rounded-xl border border-[#CCFBF1] space-y-2">
                <span className="text-[10px] text-[#0F766E] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Top TreeSHAP Contributing Factors
                </span>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between items-center">
                    <span className="text-[#334155]">+ High MARS Adherence (Score 8/10)</span>
                    <span className="font-bold text-[#059669]">+0.15 SHAP</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#334155]">+ Previous Positive SSRI Response</span>
                    <span className="font-bold text-[#059669]">+0.12 SHAP</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#334155]">- Baseline Anxiety (GAD-7 10)</span>
                    <span className="font-bold text-[#DC2626]">-0.09 SHAP</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full py-2.5 bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <span>Evaluate Full Patient Record in CDSS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE LIVE TRIAL OUTCOME ESTIMATOR ── */}
      <section className="py-10 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-[#0F766E]" />
                <h2 className="text-xs font-bold text-[#0F766E] uppercase tracking-wider">
                  Interactive Clinical Outcome Simulator
                </h2>
              </div>
              <p className="text-xl font-bold text-[#0F172A] mt-1">
                Real-Time Factor Impact Simulation
              </p>
            </div>
            <span className="text-xs text-[#64748B]">Adjust variables to observe probability adjustments</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            {/* Sliders Area */}
            <div className="lg:col-span-2 space-y-5 bg-[#F8FAFC] p-5 rounded-xl border border-[#E2E8F0]">
              {/* MARS Adherence */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#334155] font-semibold">MARS Medication Adherence Score (0-10):</span>
                  <span className="text-[#0F766E] font-bold">{marsScore} / 10 (High Adherence)</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={marsScore}
                  onChange={(e) => setMarsScore(Number(e.target.value))}
                  className="w-full accent-[#0F766E] h-2 bg-[#E2E8F0] rounded-lg cursor-pointer"
                />
              </div>

              {/* Baseline MADRS */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#334155] font-semibold">Baseline MADRS Depression Score (0-60):</span>
                  <span className="text-[#0284C7] font-bold">{madrsScore} / 60 (Moderate-Severe)</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="55"
                  value={madrsScore}
                  onChange={(e) => setMadrsScore(Number(e.target.value))}
                  className="w-full accent-[#0284C7] h-2 bg-[#E2E8F0] rounded-lg cursor-pointer"
                />
              </div>

              {/* GAD-7 Anxiety */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#334155] font-semibold">Comorbid Anxiety Score (GAD-7 0-21):</span>
                  <span className="text-[#D97706] font-bold">{gad7Score} / 21 (Moderate)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="21"
                  value={gad7Score}
                  onChange={(e) => setGad7Score(Number(e.target.value))}
                  className="w-full accent-[#D97706] h-2 bg-[#E2E8F0] rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Estimated Probability Radial Card */}
            <div className="p-6 rounded-xl bg-[#F0FDFA] border border-[#CCFBF1] text-center space-y-3 shadow-2xs">
              <span className="text-[11px] uppercase text-[#64748B] font-bold tracking-wider block">Estimated 6-Wk Response</span>
              <div className="text-5xl font-black text-[#0F172A] tracking-tight">
                {estimatedProb}%
              </div>
              <StatusBadge
                status={estimatedProb >= 60 ? 'Likely Responder' : estimatedProb >= 40 ? 'Partial Responder' : 'Non-Responder'}
                size="md"
              />
              <p className="text-xs text-[#475569] leading-snug pt-1">
                {estimatedProb >= 60
                  ? 'Strong adherence & moderate baseline drive high probability of ≥50% MADRS reduction.'
                  : 'Elevated comorbid anxiety or sub-optimal adherence dampens estimated response probability.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── QUICK DEMO COHORT SELECTOR ── */}
      <section className="py-8 px-4 sm:px-6 max-w-7xl mx-auto space-y-4">
        <h3 className="text-xs font-bold uppercase text-[#64748B] tracking-wider">
          Quick Demo Cohort ($N=320$ Dataset Sample)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {[
            { id: 'NC-0001', age: '38F', drug: 'Escitalopram', madrs: '34', adherence: '92%', prob: '78%', status: 'Responder' },
            { id: 'NC-0002', age: '45M', drug: 'Sertraline', madrs: '28', adherence: '88%', prob: '71%', status: 'Responder' },
            { id: 'NC-0003', age: '52F', drug: 'Venlafaxine', madrs: '41', adherence: '62%', prob: '42%', status: 'Partial' },
            { id: 'NC-0004', age: '29M', drug: 'Fluoxetine', madrs: '36', adherence: '45%', prob: '29%', status: 'Non-Responder' },
          ].map((patient) => (
            <div
              key={patient.id}
              onClick={() => handleQuickDemo(patient.id)}
              className="p-4 rounded-xl bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#0F766E]/40 transition-all cursor-pointer shadow-xs space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#0F172A] text-xs">{patient.id} ({patient.age})</span>
                <StatusBadge status={patient.status} size="sm" />
              </div>
              <div className="text-xs text-[#475569] space-y-0.5">
                <p>Medication: <strong className="text-[#0F172A]">{patient.drug}</strong></p>
                <p>MADRS: <strong className="text-[#0284C7]">{patient.madrs}</strong> · Adh: <strong className="text-[#059669]">{patient.adherence}</strong></p>
              </div>
              <div className="pt-2 flex items-center justify-between border-t border-[#F1F5F9] text-xs text-[#0F766E] font-bold group-hover:translate-x-0.5 transition-transform">
                <span>View in CDSS</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SCIENTIFIC PIPELINE STRIP ── */}
      <section className="py-8 bg-white border-y border-[#E2E8F0]">
        <div className="px-4 sm:px-8 max-w-7xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase text-[#64748B] tracking-wider">6-Stage Scientific Workflow</h3>
            <span className="text-xs text-[#0F766E] font-semibold cursor-pointer hover:underline" onClick={() => navigate('/overview')}>View Interactive Pipeline →</span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto py-1">
            {[
              { n: '01', label: 'Clinical Intake & CRF', sub: 'Demographics, Scales', route: '/crf' },
              { n: '02', label: 'Feature Engineering', sub: 'MICE Imputation', route: '/research' },
              { n: '03', label: 'ML Models (4)', sub: 'LR · DT · RF · GB', route: '/models' },
              { n: '04', label: 'Response Probability', sub: '≥50% MADRS Reduction', route: '/prediction' },
              { n: '05', label: 'SHAP & LIME XAI', sub: 'Feature Attribution', route: '/explainability' },
              { n: '06', label: 'Clinician Review', sub: 'Human-in-the-Loop', route: '/dashboard' },
            ].map((step, idx) => (
              <div key={idx} className="flex items-center gap-3 shrink-0">
                <div
                  onClick={() => navigate(step.route)}
                  className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#0F766E]/40 cursor-pointer w-44 transition-all hover:bg-white shadow-2xs"
                >
                  <span className="text-[10px] text-[#0F766E] font-bold block mb-0.5">{step.n}</span>
                  <p className="font-bold text-[#0F172A] text-xs leading-tight">{step.label}</p>
                  <p className="text-[11px] text-[#64748B] mt-0.5">{step.sub}</p>
                </div>
                {idx < 5 && <ArrowRight className="w-4 h-4 text-[#CBD5E1] shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-12 px-4 text-center max-w-2xl mx-auto space-y-3">
        <div className="flex items-center justify-center space-x-2 text-xs font-semibold text-[#64748B]">
          <Brain className="w-4 h-4 text-[#0F766E]" />
          <span>NeuroClarity XAI-CDSS · Explainable Clinical Intelligence</span>
        </div>
        <p className="text-xs text-[#94A3B8] leading-relaxed">
          RESEARCH DEMONSTRATION PROTOTYPE ($N=320$ SYNTHETIC DATASET) · Designed for physician decision support. Treats psychiatric clinical judgment as final authority.
        </p>
      </footer>

      {/* Global Clinical AI Assistant Co-Pilot */}
      <ClinicalAIChatbot />
    </div>
  );
};
