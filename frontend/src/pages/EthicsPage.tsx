import React from 'react';
import {
  Scale,
  ShieldCheck,
  FileCheck,
  Lock,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import { Layout } from '../components/Layout/Layout';
import { GlassCard } from '../components/UI/GlassCard';
import { StatusBadge } from '../components/UI/StatusBadge';

export const EthicsPage: React.FC = () => {
  return (
    <Layout title="Ethics, Governance & Consent Framework">
      {/* Header */}
      <GlassCard className="p-6 bg-white border-[#E2E8F0] shadow-xs">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <StatusBadge status="ETHICS PROTOCOL" size="sm" />
            <span className="text-xs text-[#64748B] font-semibold">Institutional Ethics Committee (IEC) Guidelines</span>
          </div>
          <h2 className="text-2xl font-bold text-[#0F172A]">Ethical Governance & Informed Consent</h2>
          <p className="text-xs text-[#475569] max-w-2xl leading-relaxed">
            Ethical standards guiding clinical AI development, patient privacy protections, voluntary informed consent, and transparent AI governance.
          </p>
        </div>
      </GlassCard>

      {/* 4 Pillars of Medical AI Ethics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-4 space-y-2 bg-white">
          <div className="p-2 rounded-lg bg-[#F0FDFA] border border-[#CCFBF1] text-[#0F766E] w-fit">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-[#0F172A] text-xs">Beneficence & Non-Maleficence</h3>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Ensures the AI acts strictly as an advisory support tool to optimize treatment choices without introducing patient harm.
          </p>
        </GlassCard>

        <GlassCard className="p-4 space-y-2 bg-white">
          <div className="p-2 rounded-lg bg-[#F0F9FF] border border-[#BAE6FD] text-[#0284C7] w-fit">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-[#0F172A] text-xs">Data Confidentiality (HIPAA/GDPR)</h3>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Strict pseudonymization with unique study identifiers. Zero unprotected patient identifiers stored client-side.
          </p>
        </GlassCard>

        <GlassCard className="p-4 space-y-2 bg-white">
          <div className="p-2 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] w-fit">
            <FileCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-[#0F172A] text-xs">Written Informed Consent</h3>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Explicit participant consent prior to enrollment, detailing data utilization for research predictive modeling.
          </p>
        </GlassCard>

        <GlassCard className="p-4 space-y-2 bg-white">
          <div className="p-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[#334155] w-fit">
            <Eye className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-[#0F172A] text-xs">AI Algorithmic Transparency</h3>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Total rejection of uninterpretable black-box models in favor of SHAP/LIME explainability and clinician oversight.
          </p>
        </GlassCard>
      </div>

      {/* Informed Consent Template Viewer */}
      <GlassCard className="p-6 space-y-4 bg-white">
        <h3 className="text-sm font-bold text-[#0F172A] uppercase">
          Participant Information Sheet & Consent Form Template
        </h3>
        <div className="p-5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3 text-xs text-[#334155] leading-relaxed">
          <p className="text-[#0F172A] font-bold">RESEARCH STUDY TITLE: Explainable AI Based Prediction of Antidepressant Treatment Outcomes</p>
          <p>
            1. <strong>Purpose:</strong> You are invited to participate in a research study evaluating an AI model that assists doctors in understanding clinical factors associated with antidepressant treatment response.
          </p>
          <p>
            2. <strong>Voluntary Participation:</strong> Your participation is completely voluntary. You may withdraw at any time without affecting your standard clinical care.
          </p>
          <p>
            3. <strong>Data Privacy:</strong> All information collected is stored under a secure research code (e.g. NC-XXXX) and used strictly for research and academic validation.
          </p>
        </div>
      </GlassCard>
    </Layout>
  );
};
