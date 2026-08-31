import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain,
  Cpu,
  Layers,
  Activity,
  ArrowRight,
  Sparkles,
  Database,
  BarChart3,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Users,
  AlertCircle,
} from 'lucide-react';
import { Layout } from '../components/Layout/Layout';
import { GlassCard } from '../components/UI/GlassCard';
import { MetricCard } from '../components/UI/MetricCard';
import { StatusBadge } from '../components/UI/StatusBadge';
import { getHealth, getDatasetStats, getPatients } from '../services/api';
import { useAppStore } from '../store';

export const OverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { setSelectedPatient } = useAppStore();
  const [stats, setStats] = useState<any>(null);
  const [demoPatients, setDemoPatients] = useState<any[]>([]);

  useEffect(() => {
    getDatasetStats().then(setStats).catch(console.error);
    getPatients(6, 0).then((res) => setDemoPatients(res.patients)).catch(console.error);
  }, []);

  return (
    <Layout title="System Overview & Workflow">
      {/* Top Banner */}
      <GlassCard className="p-6 bg-white border-[#E2E8F0] shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <StatusBadge status="DEMONSTRATION PROTOTYPE" size="sm" />
              <span className="text-xs text-[#64748B] font-semibold">Antigravity Multi-Agent Workflow</span>
            </div>
            <h2 className="text-2xl font-bold text-[#0F172A]">NeuroClarity Clinical Intelligence Hub</h2>
            <p className="text-xs text-[#475569] max-w-2xl leading-relaxed">
              Real-time explainable prediction of antidepressant response (≥50% MADRS score reduction). Built using hybrid scikit-learn ML models and SHAP / LIME explainability engines.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 bg-[#0F766E] hover:bg-[#115E59] text-white font-bold text-xs rounded-lg shadow-xs transition-all flex items-center space-x-2 cursor-pointer"
            >
              <span>Open Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Synthetic Cohort"
          value={stats?.total || '320'}
          unit="patients"
          color="blue"
          icon={Users}
          subtitle="Target N=320 records"
        />
        <MetricCard
          label="Response Rate"
          value={stats?.responder_rate_pct ? `${stats.responder_rate_pct}%` : '58.1%'}
          color="green"
          icon={Activity}
          subtitle="≥50% MADRS reduction"
        />
        <MetricCard
          label="ML Models Online"
          value="4"
          unit="algorithms"
          color="teal"
          icon={Cpu}
          subtitle="LR, DT, RF, XGBoost"
        />
        <MetricCard
          label="Explainability Methods"
          value="2"
          unit="frameworks"
          color="emerald"
          icon={Brain}
          subtitle="SHAP & LIME engines"
        />
      </div>

      {/* Interactive 6-Stage Research Storyboard */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#0F766E]">Scientific Pipeline</h3>
            <p className="text-xs text-[#64748B]">6-Stage End-to-End Clinical & AI Workflow</p>
          </div>
          <button
            onClick={() => navigate('/methodology')}
            className="text-xs text-[#0F766E] hover:underline font-semibold flex items-center space-x-1 cursor-pointer"
          >
            <span>Full Protocol Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              stage: '1',
              title: 'Data Collection & Goal',
              desc: 'Prospective observational cohort (320 participants, ~60 clinical variables). Goal: Predict ≥50% MADRS reduction.',
              route: '/crf',
              icon: Database,
              color: 'text-[#0284C7]',
            },
            {
              stage: '2',
              title: 'Descriptive & Preprocessing',
              desc: 'Continuous scaling, categorical encoding, handling missing data, and clinical feature mapping.',
              route: '/research',
              icon: Layers,
              color: 'text-[#0F766E]',
            },
            {
              stage: '3',
              title: 'Model Development & Training',
              desc: 'Logistic Regression, Decision Tree, Random Forest, and Gradient Boosting with 70/30 stratified train/test split.',
              route: '/models',
              icon: Cpu,
              color: 'text-[#059669]',
            },
            {
              stage: '4',
              title: 'Internal Validation',
              desc: 'Stratified 5-Fold Cross-Validation, Bootstrap Resampling (1000x / 100x demo), and held-out test evaluation.',
              route: '/validation',
              icon: ShieldCheck,
              color: 'text-[#0F766E]',
            },
            {
              stage: '5',
              title: 'Clinical Utility Analysis',
              desc: 'Decision Curve Analysis (DCA), Brier Score probabilistic accuracy, calibration slope, and net benefit analysis.',
              route: '/clinical-utility',
              icon: BarChart3,
              color: 'text-[#D97706]',
            },
            {
              stage: '6',
              title: 'Deployment & Explainability',
              desc: 'SHAP waterfall feature contributions, LIME local approximations, and human-in-the-loop clinician decision support.',
              route: '/explainability',
              icon: Brain,
              color: 'text-[#0284C7]',
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <GlassCard
                key={item.stage}
                hover
                onClick={() => navigate(item.route)}
                className="p-5 space-y-3 cursor-pointer group bg-white"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-[#F1F5F9] flex items-center justify-center text-xs font-bold text-[#0F172A]">
                      {item.stage}
                    </span>
                    <span className={`text-xs font-bold ${item.color}`}>{item.title}</span>
                  </div>
                  <Icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <p className="text-xs text-[#64748B] leading-relaxed">{item.desc}</p>
                <div className="flex items-center text-[11px] text-[#0F766E] font-bold group-hover:translate-x-0.5 transition-transform pt-1">
                  <span>Explore Module</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* Quick Access Demo Patients */}
      <div className="space-y-4 pt-2">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#0F766E]">Quick-Load Demo Cohort</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {demoPatients.map((p) => (
            <GlassCard key={p.id} hover className="p-4 flex items-center justify-between bg-white">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-xs text-[#0F172A]">{p.study_id || p.id}</span>
                  <StatusBadge status={p.response_class || 'Responder'} size="sm" />
                </div>
                <p className="text-xs text-[#64748B]">
                  {p.age}y {p.sex} • MADRS: {p.madrs_baseline} • {p.ad_name || 'SSRI'} ({p.ad_dose_mg || 20}mg)
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedPatient(p);
                  navigate('/dashboard');
                }}
                className="px-3 py-1.5 bg-[#F0FDFA] hover:bg-[#CCFBF1] text-[#0F766E] border border-[#CCFBF1] rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Inspect
              </button>
            </GlassCard>
          ))}
        </div>
      </div>
    </Layout>
  );
};
