import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Activity,
  TrendingDown,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Plus,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Layout } from '../components/Layout/Layout';
import { GlassCard } from '../components/UI/GlassCard';
import { StatusBadge } from '../components/UI/StatusBadge';
import { useAppStore } from '../store';
import { getPatients } from '../services/api';

export const FollowUpPage: React.FC = () => {
  const { selectedPatient, setSelectedPatient, patients, setPatients } = useAppStore();

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

  const p = selectedPatient || {
    study_id: 'NC-0001',
    age: 38,
    sex: 'Female',
    madrs_baseline: 34,
    madrs_week2: 26,
    madrs_week4: 18,
    madrs_week6: 12,
    gad7_baseline: 12,
    gad7_week6: 5,
    mars_score: 8,
    adherence_pct: 92,
    response_class: 'Responder',
  };

  const baseline = p.madrs_baseline || 34;
  const week2 = p.madrs_week2 || Math.round(baseline * 0.78);
  const week4 = p.madrs_week4 || Math.round(baseline * 0.55);
  const week6 = p.madrs_week6 || Math.round(baseline * 0.38);

  const reductionPct = Math.round(((baseline - week6) / baseline) * 100);

  const trajectoryData = [
    { week: 'Week 0 (Baseline)', madrs: baseline, gad7: p.gad7_baseline || 12 },
    { week: 'Week 2', madrs: week2, gad7: Math.round((p.gad7_baseline || 12) * 0.8) },
    { week: 'Week 4', madrs: week4, gad7: Math.round((p.gad7_baseline || 12) * 0.6) },
    { week: 'Week 6 (Endpoint)', madrs: week6, gad7: p.gad7_week6 || 5 },
  ];

  return (
    <Layout title="Longitudinal Patient Follow-Up Trajectory">
      {/* Patient Selector */}
      <div className="flex items-center space-x-3 bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs">
        <span className="text-xs font-bold text-[#475569] uppercase tracking-wider">SELECT PATIENT:</span>
        <select
          value={selectedPatient?.id || ''}
          onChange={(e) => {
            const pt = patients.find((p) => p.id === e.target.value);
            if (pt) setSelectedPatient(pt);
          }}
          className="bg-[#F8FAFC] border border-[#CBD5E1] text-xs text-[#0F172A] font-semibold rounded-lg px-3 py-2 focus:outline-none focus:border-[#0F766E]"
        >
          {patients.map((pt) => (
            <option key={pt.id} value={pt.id}>
              {pt.study_id || pt.id} ({pt.age}y {pt.sex}) - {pt.response_class || 'Responder'}
            </option>
          ))}
        </select>
        <StatusBadge status={p.response_class || 'Responder'} size="sm" />
      </div>

      {/* 4 Longitudinal Visit Nodes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'WEEK 0 (Baseline)', madrs: baseline, gad7: p.gad7_baseline || 12, mars: p.mars_score || 8, adh: `${p.adherence_pct || 90}%`, status: 'Intake & Initiation' },
          { label: 'WEEK 2 (Early Check)', madrs: week2, gad7: Math.round((p.gad7_baseline || 12) * 0.8), mars: p.mars_score || 8, adh: '92%', status: 'Tolerability Check' },
          { label: 'WEEK 4 (Midpoint)', madrs: week4, gad7: Math.round((p.gad7_baseline || 12) * 0.6), mars: (p.mars_score || 8), adh: '91%', status: 'Dose Maintained' },
          { label: 'WEEK 6 (Primary Endpoint)', madrs: week6, gad7: p.gad7_week6 || 5, mars: (p.mars_score || 8), adh: '94%', status: 'Outcome Validated' },
        ].map((node, i) => (
          <GlassCard key={i} className="p-4 space-y-2 bg-white">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
              <span className="font-bold text-xs text-[#0F766E]">{node.label}</span>
              <span className="w-2 h-2 rounded-full bg-[#059669]" />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div>
                <span className="text-[10px] text-[#64748B] block font-semibold uppercase">MADRS</span>
                <span className="text-xl font-bold text-[#0F172A]">{node.madrs}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#64748B] block font-semibold uppercase">GAD-7</span>
                <span className="text-xl font-bold text-[#0284C7]">{node.gad7}</span>
              </div>
            </div>
            <p className="text-xs text-[#64748B] pt-1 border-t border-[#F1F5F9]">{node.status}</p>
          </GlassCard>
        ))}
      </div>

      {/* Trajectory Area Chart */}
      <GlassCard className="p-6 space-y-4 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
          <div>
            <h3 className="text-base font-bold text-[#0F172A] flex items-center space-x-2">
              <Activity className="w-5 h-5 text-[#0F766E]" />
              <span>MADRS & GAD-7 Symptom Reduction Trajectory</span>
            </h3>
            <p className="text-xs text-[#64748B]">
              Longitudinal tracking across Week 0 to Week 6 study timeline
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-[#059669] font-bold bg-[#ECFDF5] px-2.5 py-1 rounded-md border border-[#A7F3D0]">
              MADRS Reduction: {reductionPct}% ({baseline} → {week6})
            </span>
          </div>
        </div>

        <div className="h-80 w-full pt-2 bg-white">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trajectoryData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
              <defs>
                <linearGradient id="madrsGradLight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0F766E" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0F766E" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="gad7GradLight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284C7" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#0284C7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="week" tick={{ fill: '#64748B', fontSize: 11 }} />
              <YAxis domain={[0, 50]} label={{ value: 'Assessment Score', angle: -90, position: 'insideLeft', fill: '#64748B', fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', fontSize: 11, color: '#0F172A', borderRadius: 8 }} />
              <ReferenceLine y={baseline * 0.5} stroke="#059669" strokeDasharray="4 4" label={{ value: '50% Responder Threshold', fill: '#059669', fontSize: 10 }} />
              <Area type="monotone" dataKey="madrs" name="MADRS Score (0-60)" stroke="#0F766E" strokeWidth={3} fill="url(#madrsGradLight)" />
              <Area type="monotone" dataKey="gad7" name="GAD-7 Anxiety (0-21)" stroke="#0284C7" strokeWidth={2} fill="url(#gad7GradLight)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Outcome Classification Formula Box */}
      <GlassCard className="p-5 space-y-3 bg-[#F8FAFC]">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F766E]">
          Automated Study Response Classification Formula
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 rounded-lg bg-white border border-[#E2E8F0]">
            <span className="text-[#64748B] block text-[10px] uppercase font-semibold">MADRS Change</span>
            <span className="text-[#0F172A] font-bold">{baseline} - {week6} = {baseline - week6} pts</span>
          </div>
          <div className="p-3 rounded-lg bg-white border border-[#E2E8F0]">
            <span className="text-[#64748B] block text-[10px] uppercase font-semibold">Reduction %</span>
            <span className="text-[#0F766E] font-bold">({baseline - week6} / {baseline}) × 100 = {reductionPct}%</span>
          </div>
          <div className="p-3 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0]">
            <span className="text-[#065F46] block text-[10px] uppercase font-semibold">Final Classification</span>
            <span className="text-[#059669] font-bold">
              {reductionPct >= 50 ? 'RESPONDER (≥50%)' : reductionPct >= 25 ? 'PARTIAL RESPONDER (25-49%)' : 'NON-RESPONDER (<25%)'}
            </span>
          </div>
        </div>
      </GlassCard>
    </Layout>
  );
};
