import React, { useEffect, useState } from 'react';
import {
  Brain,
  Layers,
  Sparkles,
  ArrowRight,
  HelpCircle,
  BarChart3,
  TrendingUp,
  Activity,
  CheckCircle2,
  Info,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import { Layout } from '../components/Layout/Layout';
import { GlassCard } from '../components/UI/GlassCard';
import { StatusBadge } from '../components/UI/StatusBadge';
import { useAppStore } from '../store';
import { explain, getPatients } from '../services/api';

export const ExplainabilityPage: React.FC = () => {
  const { selectedPatient, setSelectedPatient, patients, setPatients, explanation, setExplanation, selectedModel } =
    useAppStore();

  const [activeTab, setActiveTab] = useState<'waterfall' | 'global' | 'lime' | 'education'>('waterfall');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (patients.length === 0) {
      getPatients(20, 0).then((res) => {
        setPatients(res.patients);
        if (!selectedPatient && res.patients.length > 0) {
          setSelectedPatient(res.patients[0]);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      setLoading(true);
      explain(selectedPatient.id, selectedModel)
        .then((res) => setExplanation(res))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [selectedPatient, selectedModel]);

  // Transform SHAP local contributions for waterfall
  const contributions = explanation?.shap_local?.contributions || [
    { label: 'Medication Adherence (MARS)', shap_value: 0.14, direction: 'positive', value: 8 },
    { label: 'Baseline MADRS Severity', shap_value: 0.12, direction: 'positive', value: 34 },
    { label: 'Prior Good Treatment Response', shap_value: 0.08, direction: 'positive', value: 3 },
    { label: 'Pill Count Adherence %', shap_value: 0.07, direction: 'positive', value: 92 },
    { label: 'Depression Duration (months)', shap_value: -0.04, direction: 'negative', value: 24 },
    { label: 'High Baseline Anxiety (GAD-7)', shap_value: -0.09, direction: 'negative', value: 14 },
    { label: 'Medical Comorbidities Count', shap_value: -0.06, direction: 'negative', value: 2 },
    { label: 'Adverse Drug Reaction Occurred', shap_value: -0.05, direction: 'negative', value: 1 },
  ];

  const globalFeatures = explanation?.shap_global || [
    { label: 'Baseline MADRS Score', importance: 0.19 },
    { label: 'Medication Adherence (MARS)', importance: 0.16 },
    { label: 'Pill Count Adherence %', importance: 0.14 },
    { label: 'Prior Treatment Response', importance: 0.12 },
    { label: 'Baseline Anxiety (GAD-7)', importance: 0.10 },
    { label: 'Comorbidity Count', importance: 0.08 },
    { label: 'Depression Duration', importance: 0.07 },
    { label: 'ADR Occurrence', importance: 0.06 },
    { label: 'Age', importance: 0.04 },
    { label: 'Previous Episodes', importance: 0.04 },
  ];

  const limeContributions = explanation?.lime_local?.contributions || [
    { feature_desc: 'MARS Score > 7', weight: 0.13, direction: 'positive' },
    { feature_desc: 'MADRS Baseline > 28', weight: 0.11, direction: 'positive' },
    { feature_desc: 'Previous Response = Good', weight: 0.09, direction: 'positive' },
    { feature_desc: 'Adherence % > 85%', weight: 0.08, direction: 'positive' },
    { feature_desc: 'GAD-7 Score > 10', weight: -0.08, direction: 'negative' },
    { feature_desc: 'Comorbidities >= 2', weight: -0.06, direction: 'negative' },
  ];

  return (
    <Layout title="Explainability Center (XAI Intelligence)">
      {/* Top Selector and Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div className="flex items-center space-x-3">
          <span className="text-xs font-bold text-[#475569] uppercase tracking-wider">PATIENT:</span>
          <select
            value={selectedPatient?.id || ''}
            onChange={(e) => {
              const p = patients.find((pt) => pt.id === e.target.value);
              if (p) setSelectedPatient(p);
            }}
            className="bg-[#F8FAFC] border border-[#CBD5E1] text-xs text-[#0F172A] font-semibold rounded-lg px-3 py-2 focus:outline-none focus:border-[#0F766E]"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.study_id || p.id} ({p.age}y {p.sex})
              </option>
            ))}
          </select>
          <StatusBadge status="SHAP & LIME ENABLED" size="sm" />
        </div>

        {/* Tab switcher */}
        <div className="flex items-center space-x-1 bg-[#F1F5F9] p-1 rounded-lg border border-[#E2E8F0] overflow-x-auto">
          {[
            { id: 'waterfall', label: 'SHAP Waterfall (Patient)' },
            { id: 'global', label: 'Global Feature Importance' },
            { id: 'lime', label: 'LIME Local Surrogate' },
            { id: 'education', label: 'XAI Clinical Guide' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#0F766E] text-white shadow-xs'
                  : 'text-[#475569] hover:text-[#0F172A] hover:bg-white/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: SHAP Waterfall */}
      {activeTab === 'waterfall' && (
        <div className="space-y-5">
          <GlassCard className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#0F172A] flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-[#0F766E]" />
                  <span>SHAP Waterfall Feature Attribution (Individual Patient)</span>
                </h3>
                <p className="text-xs text-[#64748B]">
                  Visualizes how each clinical variable shifts the patient's estimated response probability from the baseline model expectation.
                </p>
              </div>
              <div className="flex items-center space-x-3 text-xs">
                <span className="flex items-center text-[#059669] font-medium">
                  <span className="w-2.5 h-2.5 bg-[#059669] rounded-sm mr-1.5" /> Increases Response Likelihood
                </span>
                <span className="flex items-center text-[#DC2626] font-medium">
                  <span className="w-2.5 h-2.5 bg-[#DC2626] rounded-sm mr-1.5" /> Decreases Response Likelihood
                </span>
              </div>
            </div>

            {/* Recharts Horizontal Waterfall Bar */}
            <div className="h-96 w-full pt-4 bg-white">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={contributions}
                  margin={{ top: 10, right: 30, left: 180, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis
                    type="number"
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                  />
                  <YAxis
                    type="category"
                    dataKey="label"
                    tick={{ fill: '#334155', fontSize: 11, fontWeight: 600 }}
                    width={170}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-white border border-[#CBD5E1] p-3 rounded-lg text-xs shadow-md space-y-1 text-[#0F172A]">
                            <p className="font-bold text-[#0F172A]">{d.label}</p>
                            <p className="text-[#475569]">Measured Value: <span className="font-semibold text-[#0F766E]">{d.value}</span></p>
                            <p className={`font-bold ${d.shap_value > 0 ? 'text-[#059669]' : 'text-[#DC2626]'}`}>
                              SHAP Impact: {d.shap_value > 0 ? '+' : ''}{(d.shap_value * 100).toFixed(1)}%
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine x={0} stroke="#94A3B8" strokeWidth={1.5} />
                  <Bar dataKey="shap_value" radius={[4, 4, 4, 4]}>
                    {contributions.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.shap_value >= 0 ? '#059669' : '#DC2626'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Plain Clinical Language Translation Layer */}
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F766E] flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Automated Clinician Language Translation Layer</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-3 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0]">
                  <p className="font-bold text-[#065F46] mb-1">Top Positive Catalysts</p>
                  <p className="text-[#047857] leading-relaxed">
                    High medication adherence (MARS score: {selectedPatient?.mars_score || 8}/10) and favorable baseline depression severity are the strongest contributors moving this patient toward a predicted treatment response.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA]">
                  <p className="font-bold text-[#991B1B] mb-1">Dampening / Risk Factors</p>
                  <p className="text-[#B91C1C] leading-relaxed">
                    Comorbid anxiety severity (GAD-7 score: {selectedPatient?.gad7_baseline || 11}/21) and chronic episode duration slightly moderate the probability of complete symptomatic response.
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* TAB 2: Global Feature Importance */}
      {activeTab === 'global' && (
        <GlassCard className="p-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-[#0F172A] flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-[#0F766E]" />
              <span>Global SHAP Feature Importance (Cohort-Level N=320)</span>
            </h3>
            <p className="text-xs text-[#64748B]">
              Aggregated mean absolute SHAP value across the synthetic validation cohort, ranking overall predictive power.
            </p>
          </div>

          <div className="h-96 w-full pt-4 bg-white">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={globalFeatures}
                margin={{ top: 10, right: 30, left: 180, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis type="number" tick={{ fill: '#64748B', fontSize: 11 }} />
                <YAxis type="category" dataKey="label" tick={{ fill: '#334155', fontSize: 11, fontWeight: 600 }} width={170} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-white border border-[#CBD5E1] p-2.5 rounded-lg text-xs shadow-md text-[#0F172A]">
                          <p className="font-bold">{d.label}</p>
                          <p className="font-semibold text-[#0F766E]">Mean |SHAP|: {d.importance}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="importance" fill="#0F766E" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      )}

      {/* TAB 3: LIME Local Surrogate */}
      {activeTab === 'lime' && (
        <GlassCard className="p-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-[#0F172A] flex items-center space-x-2">
              <Layers className="w-5 h-5 text-[#0F766E]" />
              <span>LIME (Local Interpretable Model-agnostic Explanations)</span>
            </h3>
            <p className="text-xs text-[#64748B]">
              Surrogate interpretable linear model fitted in the immediate local perturbation neighborhood of this specific patient.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#0F766E] uppercase">Local Decision Boundaries</h4>
              {limeContributions.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
                    item.direction === 'positive'
                      ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]'
                      : 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]'
                  }`}
                >
                  <span className="font-medium">{item.feature_desc}</span>
                  <span className="font-bold">{item.weight > 0 ? '+' : ''}{item.weight}</span>
                </div>
              ))}
            </div>

            <div className="p-5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3 text-xs text-[#475569]">
              <h4 className="font-bold text-[#0F172A] text-sm">SHAP vs LIME Comparison in NeuroClarity</h4>
              <p className="leading-relaxed">
                <strong>SHAP (Shapley Additive exPlanations)</strong> provides mathematically consistent Shapley game-theoretic allocations satisfying local accuracy and missingness properties.
              </p>
              <p className="leading-relaxed">
                <strong>LIME</strong> builds an interpretable linear surrogate around the patient's perturbation space, offering a secondary verification of local feature influence.
              </p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* TAB 4: Educational Clinical Guide */}
      {activeTab === 'education' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <GlassCard className="p-5 space-y-3">
            <h4 className="text-sm font-bold text-[#0F766E] flex items-center space-x-2">
              <HelpCircle className="w-4 h-4" />
              <span>What is Explainable AI (XAI)?</span>
            </h4>
            <p className="text-xs text-[#475569] leading-relaxed">
              In clinical medicine, black-box AI algorithms that output risk probabilities without interpretable justifications cannot be safely integrated into clinical workflows. Explainable AI provides transparent, auditable feature attributions so psychiatrists understand why an outcome is predicted.
            </p>
          </GlassCard>

          <GlassCard className="p-5 space-y-3">
            <h4 className="text-sm font-bold text-[#0284C7] flex items-center space-x-2">
              <Info className="w-4 h-4" />
              <span>Interpreting Positive vs Negative Contributions</span>
            </h4>
            <p className="text-xs text-[#475569] leading-relaxed">
              A <strong>positive SHAP contribution</strong> (green) increases the probability of treatment response (≥50% MADRS reduction), while a <strong>negative contribution</strong> (red) lowers the estimated likelihood, highlighting clinical areas that may require optimization.
            </p>
          </GlassCard>
        </div>
      )}
    </Layout>
  );
};
