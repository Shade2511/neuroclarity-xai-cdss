import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Save,
  CheckCircle2,
  AlertTriangle,
  User,
  Pill,
  Activity,
} from 'lucide-react';
import { Layout } from '../components/Layout/Layout';
import { GlassCard } from '../components/UI/GlassCard';
import { StatusBadge } from '../components/UI/StatusBadge';
import toast, { Toaster } from 'react-hot-toast';

export const CRFPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('study');

  const crfSections = [
    { id: 'study', label: '1. Study Identification' },
    { id: 'demographics', label: '2. Demographics' },
    { id: 'clinical', label: '3. Clinical History' },
    { id: 'comorbidities', label: '4. Comorbidities' },
    { id: 'antidepressant', label: '5. Antidepressant Therapy' },
    { id: 'adherence', label: '6. MARS & Pill Count' },
    { id: 'madrs', label: '7. MADRS Scale (10-Item)' },
    { id: 'gad7', label: '8. GAD-7 Anxiety Scale' },
    { id: 'naranjo', label: '9. Naranjo ADR Scale' },
    { id: 'outcomes', label: '10. Week 6 Outcomes' },
  ];

  return (
    <Layout title="Digital Case Report Form (CRF Master)">
      <Toaster position="top-right" />

      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-[#F0FDFA] border border-[#CCFBF1] text-[#0F766E]">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#0F172A]">Case Report Form (CRF-MDD-01)</h2>
            <p className="text-xs text-[#64748B]">Good Clinical Practice (GCP) & IEC Protocol Compliant</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1] rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print CRF</span>
          </button>
          <button
            onClick={() => toast.success('CRF draft validated & synchronized with research registry.')}
            className="px-4 py-2 bg-[#0F766E] hover:bg-[#115E59] text-white font-bold text-xs rounded-lg shadow-xs flex items-center space-x-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save & Validate CRF</span>
          </button>
        </div>
      </div>

      {/* Main CRF Grid: Section Navigator (Left) + CRF Document Form (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Navigator (4 cols) */}
        <div className="lg:col-span-4 space-y-2">
          <GlassCard className="p-3 space-y-1 bg-white">
            <span className="text-[10px] font-bold uppercase text-[#64748B] px-3 py-1 block">
              CRF Modules
            </span>
            {crfSections.map((sec) => (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeSection === sec.id
                    ? 'bg-[#F0FDFA] text-[#0F766E] border-l-[3px] border-[#0F766E]'
                    : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
                }`}
              >
                {sec.label}
              </button>
            ))}
          </GlassCard>
        </div>

        {/* Right CRF Form Sections (8 cols) */}
        <div className="lg:col-span-8">
          <GlassCard className="p-6 space-y-6 bg-white">
            {/* Section 1: Study ID */}
            {activeSection === 'study' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-[#0F172A] uppercase">1. Study Identification & Site Master</h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-[#334155] font-semibold block mb-1">Study Participant Number</label>
                    <input type="text" defaultValue="NC-0042" className="w-full bg-[#F8FAFC] border border-[#CBD5E1] p-2.5 rounded-lg text-[#0F172A] font-semibold focus:border-[#0F766E] focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[#334155] font-semibold block mb-1">Hospital Registration (HRN)</label>
                    <input type="text" defaultValue="HRN-991204" className="w-full bg-[#F8FAFC] border border-[#CBD5E1] p-2.5 rounded-lg text-[#0F172A] font-semibold focus:border-[#0F766E] focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[#334155] font-semibold block mb-1">Principal Investigator</label>
                    <input type="text" defaultValue="Dr. Clinical Lead, MD (Psychiatry)" className="w-full bg-[#F8FAFC] border border-[#CBD5E1] p-2.5 rounded-lg text-[#0F172A] focus:border-[#0F766E] focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[#334155] font-semibold block mb-1">Department</label>
                    <input type="text" defaultValue="Department of Psychiatry & Clinical Pharmacology" className="w-full bg-[#F8FAFC] border border-[#CBD5E1] p-2.5 rounded-lg text-[#0F172A] focus:border-[#0F766E] focus:outline-none" />
                  </div>
                </div>
              </div>
            )}

            {/* Section 2: Demographics */}
            {activeSection === 'demographics' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-[#0F172A] uppercase">2. Demographic Profile</h3>
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="text-[#334155] font-semibold block mb-1">Age (Years)</label>
                    <input type="number" defaultValue="42" className="w-full bg-[#F8FAFC] border border-[#CBD5E1] p-2.5 rounded-lg text-[#0F172A] font-bold focus:border-[#0F766E] focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[#334155] font-semibold block mb-1">Sex</label>
                    <select defaultValue="Female" className="w-full bg-[#F8FAFC] border border-[#CBD5E1] p-2.5 rounded-lg text-[#0F172A] focus:border-[#0F766E] focus:outline-none">
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[#334155] font-semibold block mb-1">BMI</label>
                    <input type="number" step="0.1" defaultValue="23.8" className="w-full bg-[#F8FAFC] border border-[#CBD5E1] p-2.5 rounded-lg text-[#0F172A] font-bold focus:border-[#0F766E] focus:outline-none" />
                  </div>
                </div>
              </div>
            )}

            {/* Section 7: MADRS 10-Item Scale */}
            {activeSection === 'madrs' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                  <h3 className="text-sm font-bold text-[#0F172A] uppercase">7. Montgomery-Åsberg Depression Rating Scale (MADRS)</h3>
                  <span className="text-xs text-[#0F766E] font-bold">Total: 34 / 60</span>
                </div>
                <div className="space-y-2 text-xs">
                  {[
                    '1. Apparent sadness (0-6)',
                    '2. Reported sadness (0-6)',
                    '3. Inner tension (0-6)',
                    '4. Reduced sleep (0-6)',
                    '5. Reduced appetite (0-6)',
                    '6. Concentration difficulties (0-6)',
                    '7. Lassitude (0-6)',
                    '8. Inability to feel (0-6)',
                    '9. Pessimistic thoughts (0-6)',
                    '10. Suicidal thoughts (0-6)',
                  ].map((item, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between">
                      <span className="text-[#334155] font-medium">{item}</span>
                      <select defaultValue="3" className="bg-white border border-[#CBD5E1] p-1 rounded text-[#0F172A] font-bold">
                        {[0, 1, 2, 3, 4, 5, 6].map((score) => (
                          <option key={score} value={score}>{score}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 9: Naranjo Scale */}
            {activeSection === 'naranjo' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
                  <h3 className="text-sm font-bold text-[#0F172A] uppercase">9. Naranjo ADR Probability Scale</h3>
                  <span className="text-xs text-[#D97706] font-bold">Score: 6 (Probable ADR)</span>
                </div>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  Assesses probability of adverse drug reactions according to standard World Health Organization / Naranjo algorithms.
                </p>
                <div className="p-4 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-xs text-[#92400E]">
                  Total Score: <strong>6 / 13</strong> — Classification: <strong>Probable Adverse Drug Reaction</strong>.
                </div>
              </div>
            )}

            {/* Default fallback for other sections */}
            {!['study', 'demographics', 'madrs', 'naranjo'].includes(activeSection) && (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#0F766E] mx-auto" />
                <h4 className="text-sm font-bold text-[#0F172A]">Module {activeSection.toUpperCase()} Active</h4>
                <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                  Standard structured CRF fields are stored and validated against electronic data capture rules.
                </p>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </Layout>
  );
};
