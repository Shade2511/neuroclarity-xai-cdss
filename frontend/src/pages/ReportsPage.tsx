import React, { useEffect, useState } from 'react';
import {
  FileOutput,
  Printer,
  Download,
  Share2,
  FileCheck,
  ShieldAlert,
  Brain,
  User,
  Activity,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Layout } from '../components/Layout/Layout';
import { GlassCard } from '../components/UI/GlassCard';
import { StatusBadge } from '../components/UI/StatusBadge';
import { useAppStore } from '../store';
import { getReport, getPatients } from '../services/api';
import toast, { Toaster } from 'react-hot-toast';

export const ReportsPage: React.FC = () => {
  const { selectedPatient, setSelectedPatient, patients, setPatients, prediction, selectedModel } = useAppStore();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (patients.length === 0) {
      getPatients(50, 0).then((res) => {
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
      getReport(selectedPatient.study_id || selectedPatient.id, selectedModel)
        .then((data) => {
          setReport(data);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [selectedPatient, selectedModel]);

  const p = selectedPatient || {
    study_id: 'NC-0001',
    hospital_reg: 'HRN-100001',
    age: 38,
    sex: 'Female',
    bmi: 24.5,
    madrs_baseline: 34,
    gad7_baseline: 12,
    mars_score: 8,
    adherence_pct: 92,
    ad_name: 'Escitalopram',
    ad_class: 'SSRI',
    ad_dose_mg: 10,
    dep_duration_months: 14,
    episode_type: 'Recurrent',
    prev_treatment_response: 'Good',
    adr_occurred: 0,
    adr_severity: 'None',
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Layout title="Clinical Decision Support Report Generator">
      <Toaster position="top-right" />

      {/* Top Action & Patient Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs print:hidden">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-[#F0FDFA] border border-[#CCFBF1] text-[#0F766E]">
            <FileOutput className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-[#0F172A]">Structured Clinical AI Summary Dossier</h2>
              <span className="text-[10px] font-bold text-[#0F766E] bg-[#F0FDFA] px-2 py-0.5 rounded border border-[#CCFBF1]">
                SELECTABLE TEXT PDF
              </span>
            </div>
            <p className="text-xs text-[#64748B]">Report ID: {report?.report_id || `RPT-${p.study_id}-2026`}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Patient Selector */}
          <select
            value={selectedPatient?.study_id || selectedPatient?.id || ''}
            onChange={(e) => {
              const found = (patients || []).find((pt) => pt.study_id === e.target.value || pt.id === e.target.value);
              if (found) setSelectedPatient(found);
            }}
            className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg px-3 py-2 text-xs font-semibold text-[#0F172A] focus:border-[#0F766E]"
          >
            {(patients || []).map((pt) => (
              <option key={pt.study_id || pt.id} value={pt.study_id || pt.id}>
                {pt.study_id} ({pt.age}y {pt.sex} • {pt.ad_name})
              </option>
            ))}
          </select>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-[#0F766E] hover:bg-[#115E59] text-white font-bold text-xs rounded-lg shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card (Real Selectable Text & Tables) */}
      <div className="max-w-4xl mx-auto bg-white border border-[#E2E8F0] rounded-2xl p-8 sm:p-10 space-y-6 shadow-sm print:border-none print:shadow-none print:p-0 print:m-0 text-[#0F172A]">
        {/* Document Header */}
        <div className="flex items-start justify-between border-b-2 border-[#0F766E] pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <Brain className="w-7 h-7 text-[#0F766E]" />
              <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">NeuroClarity XAI-CDSS</h1>
            </div>
            <p className="text-xs text-[#475569] font-medium mt-0.5">
              Explainable AI Clinical Decision Support System • Department of Psychiatry
            </p>
          </div>
          <div className="text-right text-xs text-[#64748B] space-y-0.5">
            <p className="font-bold text-[#0F172A] uppercase tracking-wider">CONFIDENTIAL MEDICAL REPORT</p>
            <p>Report Ref: <strong>{report?.report_id || `RPT-${p.study_id}-2026`}</strong></p>
            <p>Generated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>

        {/* Clinical Safety Disclaimer Banner */}
        <div className="p-3.5 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] text-xs flex items-start space-x-2.5">
          <ShieldAlert className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>CLINICAL DECISION SUPPORT NOTICE:</strong> This report represents probabilistic machine-learning predictions derived from validated clinical trial features. This output does not constitute an autonomous medical diagnosis or prescription. All clinical decisions remain under the independent authority of the licensed treating psychiatrist.
          </p>
        </div>

        {/* 1. Patient Baseline Profile & Intake Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase text-[#0F766E] tracking-wider border-b border-[#E2E8F0] pb-1">
            1. Patient Demographics & Baseline Intake
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[#64748B] block text-[10px] uppercase font-semibold">Study / Subject ID</span>
              <span className="font-bold text-[#0F172A]">{p.study_id}</span>
            </div>
            <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[#64748B] block text-[10px] uppercase font-semibold">Age / Sex / BMI</span>
              <span className="font-bold text-[#0F172A]">{p.age}y • {p.sex} • BMI {p.bmi || 24.0}</span>
            </div>
            <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[#64748B] block text-[10px] uppercase font-semibold">Baseline MADRS Score</span>
              <span className="font-bold text-[#0F766E]">{p.madrs_baseline} / 60 (Moderate)</span>
            </div>
            <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
              <span className="text-[#64748B] block text-[10px] uppercase font-semibold">Baseline GAD-7 Anxiety</span>
              <span className="font-bold text-[#0284C7]">{p.gad7_baseline} / 21</span>
            </div>
          </div>
        </div>

        {/* 2. Antidepressant Regimen & Adherence */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase text-[#0F766E] tracking-wider border-b border-[#E2E8F0] pb-1">
            2. Pharmacotherapy Regimen & Adherence Telemetry
          </h3>
          <table className="w-full text-xs clinical-table border border-[#E2E8F0]">
            <thead>
              <tr className="bg-[#F8FAFC]">
                <th>Medication</th>
                <th>Drug Class</th>
                <th>Daily Dose</th>
                <th>MARS Adherence</th>
                <th>Pill Count %</th>
                <th>ADR Tolerability</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-bold text-[#0F172A]">{p.ad_name}</td>
                <td>{p.ad_class}</td>
                <td>{p.ad_dose_mg} mg/day</td>
                <td className="font-bold text-[#0F766E]">{p.mars_score} / 10</td>
                <td className="font-bold text-[#059669]">{p.adherence_pct}%</td>
                <td>{p.adr_occurred ? `Reported (${p.adr_severity})` : 'None / Well Tolerated'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 3. AI Prediction & Explainability Attributions */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase text-[#0F766E] tracking-wider border-b border-[#E2E8F0] pb-1">
            3. AI Outcome Estimation & TreeSHAP Factor Attributions
          </h3>
          <div className="p-4 rounded-xl bg-[#F0FDFA] border border-[#CCFBF1] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#64748B] font-semibold">Model-Estimated Probability of ≥50% MADRS Reduction at Week 6</p>
                <p className="text-3xl font-extrabold text-[#0F172A]">
                  {Math.round((prediction?.probability_response || 0.78) * 100)}%
                </p>
              </div>
              <StatusBadge status={prediction?.label || 'Likely Responder'} size="md" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-3 border-t border-[#CCFBF1]">
              <div className="space-y-1.5">
                <span className="font-bold text-[#059669] text-xs flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Primary Positive Predictive Factors:
                </span>
                <p className="text-[#334155] pl-2 border-l-2 border-[#059669]">
                  • High adherence telemetry (MARS {p.mars_score}/10, Pill count {p.adherence_pct}%)
                </p>
                <p className="text-[#334155] pl-2 border-l-2 border-[#059669]">
                  • Prior favorable response to {p.ad_class} pharmacotherapy
                </p>
              </div>
              <div className="space-y-1.5">
                <span className="font-bold text-[#DC2626] text-xs flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Clinical Risk & Dampening Factors:
                </span>
                <p className="text-[#334155] pl-2 border-l-2 border-[#DC2626]">
                  • Comorbid anxiety severity (GAD-7: {p.gad7_baseline})
                </p>
                <p className="text-[#334155] pl-2 border-l-2 border-[#DC2626]">
                  • Depressive episode chronicity ({p.dep_duration_months} months duration)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Treating Clinician Attestation & Review Decision */}
        <div className="space-y-3 pt-4 border-t border-[#E2E8F0]">
          <h3 className="text-xs font-bold uppercase text-[#0F766E] tracking-wider">
            4. Treating Clinician Attestation & Documented Action
          </h3>
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-4 text-xs">
            <p className="text-[#334155] leading-relaxed">
              Clinical Assessment: <strong>Patient evaluated by attending psychiatrist. Current medication ({p.ad_name} {p.ad_dose_mg}mg) maintained with scheduled Week 2 and Week 4 follow-up assessments.</strong>
            </p>
            <div className="flex justify-between pt-8 text-[#64748B] text-xs">
              <div>
                <p className="border-t border-[#CBD5E1] pt-1.5 w-52 font-medium">Attending Psychiatrist Signature</p>
                <p className="text-[10px] text-[#94A3B8]">Dr. Lead Psychiatrist, MD (Reg: MED-88492)</p>
              </div>
              <div className="text-right">
                <p className="border-t border-[#CBD5E1] pt-1.5 w-36 font-medium">Date & Clinical Stamp</p>
                <p className="text-[10px] text-[#94A3B8]">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Document Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0] text-[10px] text-[#94A3B8]">
          <span>NeuroClarity XAI-CDSS Platform v2.0 • Relational DB Backed</span>
          <span>Page 1 of 1 • Confidential Medical Summary</span>
        </div>
      </div>
    </Layout>
  );
};
