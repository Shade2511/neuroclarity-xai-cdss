import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  X,
  User,
  Activity,
  Calendar,
  Pill,
  Brain,
  FileText,
  ShieldCheck,
  Download,
  Edit3,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Save
} from 'lucide-react';
import { Patient, PatientFullRecord, ModelName } from '../../types';
import { getPatientDetails, updatePatient, predict, explain, downloadPatientCSV } from '../../services/api';
import { StatusBadge } from './StatusBadge';
import { useAppStore } from '../../store';
import toast from 'react-hot-toast';

interface PatientDetailsModalProps {
  patientId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onPatientUpdated?: () => void;
}

export const PatientDetailsModal: React.FC<PatientDetailsModalProps> = ({
  patientId,
  isOpen,
  onClose,
  onPatientUpdated,
}) => {
  const navigate = useNavigate();
  const { setSelectedPatient, setPrediction, setExplanation } = useAppStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'assessments' | 'predictions' | 'decisions' | 'audit'>('overview');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PatientFullRecord | null>(null);
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Patient>>({});
  const [editReason, setEditReason] = useState('Routine clinical update');
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    if (isOpen && patientId) {
      loadRecord(patientId);
      setIsEditing(false);
    }
  }, [isOpen, patientId]);

  const loadRecord = async (id: string) => {
    setLoading(true);
    try {
      const record = await getPatientDetails(id);
      setData(record);
      setEditFormData(record.patient);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load patient record from database.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !patientId) return null;

  const patient = data?.patient;

  const handleSaveEdit = async () => {
    if (!patientId) return;
    setSavingEdit(true);
    try {
      const res = await updatePatient(patientId, {
        ...editFormData,
        edit_reason: editReason,
      });
      toast.success('Patient record updated & audited successfully.');
      setIsEditing(false);
      await loadRecord(patientId);
      if (onPatientUpdated) onPatientUpdated();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save patient changes.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleRunInference = async () => {
    if (!patient) return;
    setSelectedPatient(patient);
    try {
      toast.loading('Computing inference on patient...', { id: 'pred-toast' });
      const pred = await predict(patient.study_id, 'random_forest');
      const exp = await explain(patient.study_id, 'random_forest');
      setPrediction(pred);
      setExplanation(exp);
      toast.success('Inference complete! Navigating to Dashboard...', { id: 'pred-toast' });
      onClose();
      navigate('/dashboard');
    } catch (err) {
      toast.error('Prediction failed.', { id: 'pred-toast' });
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white border border-[#CBD5E1] rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-[#0F172A]"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-[#CCFBF1] flex items-center justify-center text-[#0F766E]">
                <User className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2.5">
                  <h2 className="text-base font-bold text-[#0F172A]">
                    {patient?.study_id || patientId}
                  </h2>
                  <StatusBadge status={patient?.response_class || 'Responder'} size="sm" />
                  <span className="text-[10px] bg-slate-100 text-[#475569] font-mono px-2 py-0.5 rounded border border-slate-200">
                    {patient?.hospital_reg || 'HRN-RECORD'}
                  </span>
                </div>
                <p className="text-xs text-[#64748B] mt-0.5">
                  {patient?.age}y {patient?.sex} • BMI {patient?.bmi} • {patient?.ad_name} ({patient?.ad_class}) {patient?.ad_dose_mg}mg/day
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => downloadPatientCSV(patient?.study_id || patientId)}
                className="px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F1F5F9] text-xs font-semibold text-[#334155] flex items-center space-x-1.5 transition-colors cursor-pointer"
                title="Download structured CSV"
              >
                <Download className="w-3.5 h-3.5 text-[#0F766E]" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>

              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F1F5F9] text-xs font-semibold text-[#0F766E] flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Edit Record</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-100 text-xs font-semibold text-[#475569] transition-colors cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center space-x-1 px-4 sm:px-5 bg-white border-b border-[#E2E8F0] overflow-x-auto no-scrollbar">
            {[
              { id: 'overview', label: 'Clinical Profile', icon: User },
              { id: 'timeline', label: 'Longitudinal Timeline', icon: Calendar },
              { id: 'assessments', label: 'Assessments', icon: Activity },
              { id: 'predictions', label: 'AI Predictions', icon: Brain },
              { id: 'decisions', label: 'Clinical Decisions', icon: ShieldCheck },
              { id: 'audit', label: 'Audit Trail', icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-3 px-3.5 text-xs font-bold border-b-2 flex items-center space-x-1.5 whitespace-nowrap cursor-pointer transition-colors ${
                    isActive
                      ? 'border-[#0F766E] text-[#0F766E] bg-[#F0FDFA]/40'
                      : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-[#F8FAFC] space-y-5">
            {loading ? (
              <div className="py-20 text-center space-y-2">
                <div className="w-7 h-7 border-2 border-[#0F766E] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-[#64748B]">Querying clinical database records...</p>
              </div>
            ) : isEditing ? (
              /* ── EDIT PATIENT WORKFLOW ── */
              <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs space-y-4">
                <div className="flex items-center space-x-2 border-b border-[#E2E8F0] pb-3">
                  <Edit3 className="w-4 h-4 text-[#0F766E]" />
                  <h3 className="text-sm font-bold text-[#0F172A]">Edit Clinical Record for {patient?.study_id}</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-[#475569] font-semibold mb-1">Age</label>
                    <input
                      type="number"
                      value={editFormData.age || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, age: parseInt(e.target.value) || 0 })}
                      className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg px-3 py-2 text-xs focus:border-[#0F766E]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#475569] font-semibold mb-1">BMI</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editFormData.bmi || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, bmi: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg px-3 py-2 text-xs focus:border-[#0F766E]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#475569] font-semibold mb-1">Depression Duration (Months)</label>
                    <input
                      type="number"
                      value={editFormData.dep_duration_months || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, dep_duration_months: parseInt(e.target.value) || 0 })}
                      className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg px-3 py-2 text-xs focus:border-[#0F766E]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#475569] font-semibold mb-1">Antidepressant Name</label>
                    <input
                      type="text"
                      value={editFormData.ad_name || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, ad_name: e.target.value })}
                      className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg px-3 py-2 text-xs focus:border-[#0F766E]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#475569] font-semibold mb-1">Daily Dose (mg)</label>
                    <input
                      type="number"
                      value={editFormData.ad_dose_mg || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, ad_dose_mg: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg px-3 py-2 text-xs focus:border-[#0F766E]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#475569] font-semibold mb-1">MARS Adherence Score (0-10)</label>
                    <input
                      type="number"
                      max="10"
                      min="0"
                      value={editFormData.mars_score || ''}
                      onChange={(e) => setEditFormData({ ...editFormData, mars_score: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg px-3 py-2 text-xs focus:border-[#0F766E]"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[#475569] font-semibold mb-1">Reason for Clinical Record Edit (Required for Audit Trail)</label>
                    <input
                      type="text"
                      value={editReason}
                      onChange={(e) => setEditReason(e.target.value)}
                      placeholder="e.g. Dose titration adjustment or baseline MADRS re-scoring"
                      className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg px-3 py-2 text-xs focus:border-[#0F766E]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#E2E8F0]">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-[#475569] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={savingEdit || !editReason.trim()}
                    className="px-5 py-2 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{savingEdit ? 'Saving to Database...' : 'Save & Audit Changes'}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* ── TAB VIEWS ── */
              <>
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-2xs">
                        <span className="text-[10px] text-[#64748B] font-bold uppercase">Baseline MADRS</span>
                        <p className="text-xl font-bold text-[#0F172A] mt-0.5">{patient?.madrs_baseline} / 60</p>
                        <span className="text-[10px] text-[#D97706] font-medium">Moderate Severity</span>
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-2xs">
                        <span className="text-[10px] text-[#64748B] font-bold uppercase">Baseline GAD-7</span>
                        <p className="text-xl font-bold text-[#0F172A] mt-0.5">{patient?.gad7_baseline} / 21</p>
                        <span className="text-[10px] text-[#0F766E] font-medium">Anxiety Comorbidity</span>
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-2xs">
                        <span className="text-[10px] text-[#64748B] font-bold uppercase">MARS Adherence</span>
                        <p className="text-xl font-bold text-[#0F172A] mt-0.5">{patient?.mars_score} / 10</p>
                        <span className="text-[10px] text-[#059669] font-medium">{patient?.adherence_pct}% Pill Count</span>
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-2xs">
                        <span className="text-[10px] text-[#64748B] font-bold uppercase">Week 6 Outcome</span>
                        <p className="text-xl font-bold text-[#059669] mt-0.5">{patient?.madrs_reduction_pct}% Red.</p>
                        <span className="text-[10px] text-[#059669] font-bold uppercase">{patient?.response_class}</span>
                      </div>
                    </div>

                    {/* Pharmacotherapy & History Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs space-y-3">
                        <div className="flex items-center space-x-2 border-b border-[#F1F5F9] pb-2">
                          <Pill className="w-4 h-4 text-[#0F766E]" />
                          <h4 className="text-xs font-bold text-[#0F172A]">Prescribed Pharmacotherapy</h4>
                        </div>
                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between py-1 border-b border-[#F8FAFC]">
                            <span className="text-[#64748B]">Primary Antidepressant:</span>
                            <span className="font-bold text-[#0F172A]">{patient?.ad_name}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-[#F8FAFC]">
                            <span className="text-[#64748B]">Drug Class:</span>
                            <span className="font-semibold text-[#0F766E]">{patient?.ad_class}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-[#F8FAFC]">
                            <span className="text-[#64748B]">Daily Dosage:</span>
                            <span className="font-semibold text-[#0F172A]">{patient?.ad_dose_mg} mg / day</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-[#64748B]">Treatment Duration:</span>
                            <span className="font-semibold text-[#0F172A]">{patient?.ad_duration_weeks} weeks</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs space-y-3">
                        <div className="flex items-center space-x-2 border-b border-[#F1F5F9] pb-2">
                          <Activity className="w-4 h-4 text-[#0284C7]" />
                          <h4 className="text-xs font-bold text-[#0F172A]">Clinical History & Covariates</h4>
                        </div>
                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between py-1 border-b border-[#F8FAFC]">
                            <span className="text-[#64748B]">Depression Duration:</span>
                            <span className="font-semibold text-[#0F172A]">{patient?.dep_duration_months} months</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-[#F8FAFC]">
                            <span className="text-[#64748B]">Episode Type:</span>
                            <span className="font-semibold text-[#0F172A]">{patient?.episode_type} ({patient?.num_prev_episodes} prior)</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-[#F8FAFC]">
                            <span className="text-[#64748B]">Prior Treatment Response:</span>
                            <span className="font-semibold text-[#0F172A]">{patient?.prev_treatment_response}</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-[#64748B]">Comorbidities Count:</span>
                            <span className="font-semibold text-[#0F172A]">{patient?.comorbidity_count} documented</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'timeline' && (
                  <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-2xs space-y-4">
                    <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                      Longitudinal Study Visit Trajectory
                    </h3>

                    <div className="relative border-l-2 border-[#E2E8F0] ml-3 pl-5 space-y-6">
                      {data?.follow_ups.map((fu, i) => (
                        <div key={i} className="relative">
                          <span className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-[#0F766E] border-2 border-white ring-2 ring-[#CCFBF1]" />
                          <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0] space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-[#0F172A]">Week {fu.visit_week} Follow-up Visit</span>
                              <span className="text-[10px] text-[#64748B]">{fu.visit_date || `Week ${fu.visit_week}`}</span>
                            </div>
                            <div className="flex items-center gap-4 text-xs">
                              <span>MADRS: <strong className="text-[#0F172A]">{fu.madrs_score}</strong></span>
                              <span>GAD-7: <strong className="text-[#0F172A]">{fu.gad7_score}</strong></span>
                              <span>Adherence: <strong className="text-[#059669]">{fu.adherence_pct || patient?.adherence_pct}%</strong></span>
                            </div>
                            <p className="text-[11px] text-[#475569]">{fu.treatment_action || 'Clinical evaluation recorded'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'predictions' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-[#E2E8F0]">
                      <div>
                        <h4 className="text-xs font-bold text-[#0F172A]">AI Response Predictions</h4>
                        <p className="text-[11px] text-[#64748B]">Historical inference records stored in database for {patient?.study_id}</p>
                      </div>
                      <button
                        onClick={handleRunInference}
                        className="px-4 py-2 bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold rounded-lg shadow-xs flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Cpu className="w-3.5 h-3.5" />
                        <span>Run New Prediction</span>
                      </button>
                    </div>

                    {data?.predictions && data.predictions.length > 0 ? (
                      data.predictions.map((p, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Brain className="w-4 h-4 text-[#0F766E]" />
                              <span className="text-xs font-bold text-[#0F172A]">{p.model_name}</span>
                              <span className="text-[10px] text-[#64748B]">({p.model_version || 'v1.0'})</span>
                            </div>
                            <span className="text-xs font-bold text-[#059669]">{roundPct(p.probability_response)}% Response Prob.</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                            <div style={{ width: `${p.probability_response * 100}%` }} className="bg-[#059669]" />
                            <div style={{ width: `${p.probability_partial * 100}%` }} className="bg-[#D97706]" />
                            <div style={{ width: `${p.probability_nonresponse * 100}%` }} className="bg-[#DC2626]" />
                          </div>
                          <p className="text-[11px] text-[#475569]">{p.label}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center bg-white rounded-xl border border-[#E2E8F0] text-xs text-[#64748B]">
                        No historical prediction records found. Click "Run New Prediction" above to execute model inference.
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'assessments' && (
                  <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] space-y-4">
                    <h4 className="text-xs font-bold text-[#0F172A]">Clinical Rating Scales (Baseline & Follow-up)</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-3.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                        <span className="font-bold text-[#0F172A]">Montgomery-Åsberg Depression Rating Scale (MADRS)</span>
                        <p className="text-sm font-bold text-[#0F766E] mt-1">Baseline: {patient?.madrs_baseline} → Week 6: {patient?.madrs_week6}</p>
                        <p className="text-[11px] text-[#475569] mt-0.5">Absolute Reduction: {patient?.madrs_change} points ({patient?.madrs_reduction_pct}%)</p>
                      </div>
                      <div className="p-3.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                        <span className="font-bold text-[#0F172A]">Medication Adherence Rating Scale (MARS)</span>
                        <p className="text-sm font-bold text-[#059669] mt-1">Score: {patient?.mars_score} / 10 (High Adherence)</p>
                        <p className="text-[11px] text-[#475569] mt-0.5">Pill Count Adherence: {patient?.adherence_pct}%</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'decisions' && (
                  <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] space-y-4">
                    <h4 className="text-xs font-bold text-[#0F172A]">Treating Clinician Review & Attestation Logs</h4>
                    {data?.decisions && data.decisions.length > 0 ? (
                      data.decisions.map((dec, idx) => (
                        <div key={idx} className="p-3.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-1 text-xs">
                          <div className="flex justify-between font-semibold">
                            <span className="text-[#0F766E]">{dec.decision_type}</span>
                            <span className="text-[#64748B] text-[10px]">{dec.created_at || 'Recorded'}</span>
                          </div>
                          <p className="text-[#334155]">{dec.decision_notes || dec.action_taken}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-xs text-[#64748B]">No clinician decisions documented yet for this patient.</div>
                    )}
                  </div>
                )}

                {activeTab === 'audit' && (
                  <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] space-y-3">
                    <h4 className="text-xs font-bold text-[#0F172A] flex items-center space-x-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
                      <span>Security & Audit Trail Log</span>
                    </h4>
                    <div className="space-y-2">
                      {data?.audit_logs && data.audit_logs.length > 0 ? (
                        data.audit_logs.map((log, i) => (
                          <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-[#F1F5F9]">
                            <div>
                              <span className="font-bold text-[#0F172A]">{log.action}: </span>
                              <span className="text-[#475569]">{log.details || 'Access logged'}</span>
                            </div>
                            <span className="text-[10px] text-[#94A3B8] font-mono shrink-0 ml-3">{log.timestamp || 'Recorded'}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-[#64748B]">No audit events recorded.</p>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-3.5 sm:p-4 bg-white border-t border-[#E2E8F0] flex items-center justify-between text-xs">
            <span className="text-[11px] text-[#64748B]">
              Database Record ID: <strong className="font-mono text-[#0F172A]">{patient?.id}</strong>
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRunInference}
                className="px-4 py-2 bg-[#0F766E] hover:bg-[#115E59] text-white font-bold rounded-lg text-xs flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Open in Command Center</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

function roundPct(val: number) {
  return Math.round((val || 0) * 100);
}
