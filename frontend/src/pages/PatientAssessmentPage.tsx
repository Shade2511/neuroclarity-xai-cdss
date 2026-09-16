import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Save,
  Pill,
  Activity,
  AlertCircle,
  Plus,
  Trash2,
} from 'lucide-react';
import { Layout } from '../components/Layout/Layout';
import { GlassCard } from '../components/UI/GlassCard';
import { StatusBadge } from '../components/UI/StatusBadge';
import { createPatient, createAssessment, getPatients } from '../services/api';
import { useAppStore } from '../store';
import toast, { Toaster } from 'react-hot-toast';

export const PatientAssessmentPage: React.FC = () => {
  const navigate = useNavigate();
  const { setSelectedPatient, setPatients, addNotification } = useAppStore();
  const [step, setStep] = useState(0);

  // Form State
  const [formData, setFormData] = useState({
    // Step 0: Study Info
    study_id: `NC-${Math.floor(1000 + Math.random() * 9000)}`,
    hospital_reg: `HR-${Math.floor(10000 + Math.random() * 90000)}`,
    enrollment_date: new Date().toISOString().split('T')[0],
    investigator: 'Dr. Clinical Lead, MD',
    department: 'Department of Psychiatry',

    // Step 1: Demographics
    age: 38,
    sex: 'Female',
    bmi: 24.2,
    education: 'Graduate',
    employment: 'Employed',
    residence: 'Urban',
    substance_use: 'None',

    // Step 2: Clinical History
    dep_duration_months: 18,
    episode_type: 'First',
    num_prev_episodes: 0,
    family_history: 'Yes',
    prev_hospitalization: 'No',
    prev_suicide_attempt: 'No',
    prev_treatment_response: 'Good',

    // Step 3: Medical Comorbidities
    has_hypertension: 0,
    has_diabetes: 0,
    has_thyroid: 0,
    has_cardiovascular: 0,
    has_ckd: 0,
    has_liver: 0,
    has_asthma_copd: 0,
    has_epilepsy: 0,
    has_migraine: 0,

    // Step 4: Antidepressant Regimen
    ad_name: 'Escitalopram',
    ad_class: 'SSRI',
    ad_dose_mg: 10,
    ad_frequency: 'Once daily',
    ad_duration_weeks: 4,

    // Step 5: Adherence & Pill Count
    mars_score: 8,
    tabs_dispensed: 60,
    tabs_remaining: 5,
    adherence_pct: 91.7,

    // Step 6: Baseline Assessment Scores
    madrs_baseline: 32,
    gad7_baseline: 11,
    adr_occurred: 0,
    adr_severity: 'None',
    naranjo_score: 0,
  });

  const steps = [
    'Study & Site Info',
    'Demographics',
    'Psychiatric History',
    'Medical Comorbidities',
    'Antidepressant Regimen',
    'Adherence & Pill Count',
    'MADRS & GAD-7 Scales',
  ];

  const updateField = (field: string, val: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: val };
      if (field === 'tabs_dispensed' || field === 'tabs_remaining') {
        const dispensed = field === 'tabs_dispensed' ? Number(val) : prev.tabs_dispensed;
        const remaining = field === 'tabs_remaining' ? Number(val) : prev.tabs_remaining;
        if (dispensed > 0) {
          updated.adherence_pct = Math.max(0, Math.min(100, Math.round(((dispensed - remaining) / dispensed) * 1000) / 10));
        }
      }
      return updated;
    });
  };

  const handleNext = () => {
    if (step < steps.length - 1) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async () => {
    try {
      const created = await createPatient(formData as any);
      setSelectedPatient(created.patient);
      const pts = await getPatients(50, 0);
      setPatients(pts.patients);
      addNotification(`New patient ${formData.study_id} enrolled successfully.`, 'success');
      toast.success('Patient record saved and enrolled in CDSS!');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      toast.error('Could not reach backend. Patient stored locally.');
      const pts = await getPatients(50, 0);
      setPatients(pts.patients);
      navigate('/dashboard');
    }
  };

  return (
    <Layout title="Structured Clinical Patient Intake (CRF Wizard)">
      <Toaster position="top-right" />

      {/* Progress Wizard Header */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs text-[#64748B]">
          <span>STEP {step + 1} OF {steps.length}: <strong className="text-[#0F766E] uppercase">{steps[step]}</strong></span>
          <span>Study ID: <strong className="text-[#0F172A] font-semibold">{formData.study_id}</strong></span>
        </div>
        {/* Progress bar */}
        <div className="h-2 w-full bg-[#F1F5F9] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#0F766E] transition-all duration-300"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content Container */}
      <GlassCard className="p-6 min-h-[420px] bg-white border-[#E2E8F0] shadow-xs">
        {/* STEP 0: Study Info */}
        {step === 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">Site & Study Enrollment Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-[#334155] font-semibold block mb-1">Study Participant ID</label>
                <input
                  type="text"
                  value={formData.study_id}
                  onChange={(e) => updateField('study_id', e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-2.5 text-[#0F172A] focus:border-[#0F766E] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[#334155] font-semibold block mb-1">Hospital Registration Number (HRN)</label>
                <input
                  type="text"
                  value={formData.hospital_reg}
                  onChange={(e) => updateField('hospital_reg', e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-2.5 text-[#0F172A] focus:border-[#0F766E] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[#334155] font-semibold block mb-1">Enrollment Date</label>
                <input
                  type="date"
                  value={formData.enrollment_date}
                  onChange={(e) => updateField('enrollment_date', e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-2.5 text-[#0F172A] focus:border-[#0F766E] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[#334155] font-semibold block mb-1">Investigator Name</label>
                <input
                  type="text"
                  value={formData.investigator}
                  onChange={(e) => updateField('investigator', e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-2.5 text-[#0F172A] focus:border-[#0F766E] focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 1: Demographics */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">Patient Demographics & Lifestyle</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="text-[#334155] font-semibold block mb-1">Age (Years ≥ 18)</label>
                <input
                  type="number"
                  min="18"
                  max="90"
                  value={formData.age}
                  onChange={(e) => updateField('age', Number(e.target.value))}
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-2.5 text-[#0F172A] focus:border-[#0F766E] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[#334155] font-semibold block mb-1">Biological Sex</label>
                <select
                  value={formData.sex}
                  onChange={(e) => updateField('sex', e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-2.5 text-[#0F172A] focus:border-[#0F766E] focus:outline-none"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </select>
              </div>
              <div>
                <label className="text-[#334155] font-semibold block mb-1">Body Mass Index (BMI)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.bmi}
                  onChange={(e) => updateField('bmi', Number(e.target.value))}
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-2.5 text-[#0F172A] focus:border-[#0F766E] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[#334155] font-semibold block mb-1">Education Level</label>
                <select
                  value={formData.education}
                  onChange={(e) => updateField('education', e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-2.5 text-[#0F172A] focus:border-[#0F766E] focus:outline-none"
                >
                  <option value="Primary">Primary</option>
                  <option value="Secondary">Secondary</option>
                  <option value="Graduate">Graduate</option>
                  <option value="Postgraduate">Postgraduate</option>
                </select>
              </div>
              <div>
                <label className="text-[#334155] font-semibold block mb-1">Employment Status</label>
                <select
                  value={formData.employment}
                  onChange={(e) => updateField('employment', e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-2.5 text-[#0F172A] focus:border-[#0F766E] focus:outline-none"
                >
                  <option value="Employed">Employed</option>
                  <option value="Unemployed">Unemployed</option>
                  <option value="Student">Student</option>
                  <option value="Homemaker">Homemaker</option>
                  <option value="Retired">Retired</option>
                </select>
              </div>
              <div>
                <label className="text-[#334155] font-semibold block mb-1">Residence Locality</label>
                <select
                  value={formData.residence}
                  onChange={(e) => updateField('residence', e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-2.5 text-[#0F172A] focus:border-[#0F766E] focus:outline-none"
                >
                  <option value="Urban">Urban</option>
                  <option value="Semi-Urban">Semi-Urban</option>
                  <option value="Rural">Rural</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Psychiatric Clinical History */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">Depression Duration & Episode History</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-[#334155] font-semibold block mb-1">Duration of Current Episode (Months)</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={formData.dep_duration_months}
                  onChange={(e) => updateField('dep_duration_months', Number(e.target.value))}
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-2.5 text-[#0F172A] focus:border-[#0F766E] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[#334155] font-semibold block mb-1">Episode Classification</label>
                <select
                  value={formData.episode_type}
                  onChange={(e) => updateField('episode_type', e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-2.5 text-[#0F172A] focus:border-[#0F766E] focus:outline-none"
                >
                  <option value="First">First Episode</option>
                  <option value="Recurrent">Recurrent Depressive Disorder</option>
                </select>
              </div>
              <div>
                <label className="text-[#334155] font-semibold block mb-1">Family History of Psychiatric Illness</label>
                <select
                  value={formData.family_history}
                  onChange={(e) => updateField('family_history', e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-2.5 text-[#0F172A] focus:border-[#0F766E] focus:outline-none"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div>
                <label className="text-[#334155] font-semibold block mb-1">Previous Treatment Response</label>
                <select
                  value={formData.prev_treatment_response}
                  onChange={(e) => updateField('prev_treatment_response', e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-2.5 text-[#0F172A] focus:border-[#0F766E] focus:outline-none"
                >
                  <option value="Good">Good Response</option>
                  <option value="Partial">Partial Response</option>
                  <option value="Poor">Poor / Non-Responsive</option>
                  <option value="Treatment-Naive">Treatment-Naive (First Episode)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Medical Comorbidities */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">Medical Co-morbidities Checklist</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              {[
                { id: 'has_hypertension', label: 'Hypertension' },
                { id: 'has_diabetes', label: 'Diabetes Mellitus' },
                { id: 'has_thyroid', label: 'Thyroid Disorder' },
                { id: 'has_cardiovascular', label: 'Cardiovascular Disease' },
                { id: 'has_ckd', label: 'Chronic Kidney Disease' },
                { id: 'has_liver', label: 'Liver Disease' },
                { id: 'has_asthma_copd', label: 'Asthma / COPD' },
                { id: 'has_epilepsy', label: 'Epilepsy' },
                { id: 'has_migraine', label: 'Migraine' },
              ].map((c) => (
                <label
                  key={c.id}
                  className={`p-3 rounded-lg border flex items-center space-x-2.5 cursor-pointer transition-all ${
                    (formData as any)[c.id] === 1
                      ? 'bg-[#F0FDFA] border-[#0F766E] text-[#0F766E] font-semibold'
                      : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#475569] hover:bg-white'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={(formData as any)[c.id] === 1}
                    onChange={(e) => updateField(c.id, e.target.checked ? 1 : 0)}
                    className="rounded text-[#0F766E]"
                  />
                  <span>{c.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: Antidepressant Regimen */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">Current Antidepressant Prescription</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="text-[#334155] font-semibold block mb-1">Medication Name</label>
                <select
                  value={formData.ad_name}
                  onChange={(e) => {
                    const name = e.target.value;
                    let cls = 'SSRI';
                    if (['Venlafaxine', 'Duloxetine'].includes(name)) cls = 'SNRI';
                    if (['Amitriptyline', 'Nortriptyline'].includes(name)) cls = 'TCA';
                    if (['Mirtazapine', 'Bupropion'].includes(name)) cls = 'Atypical';
                    updateField('ad_name', name);
                    updateField('ad_class', cls);
                  }}
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-2.5 text-[#0F172A] focus:border-[#0F766E] focus:outline-none"
                >
                  <option value="Escitalopram">Escitalopram (SSRI)</option>
                  <option value="Sertraline">Sertraline (SSRI)</option>
                  <option value="Fluoxetine">Fluoxetine (SSRI)</option>
                  <option value="Paroxetine">Paroxetine (SSRI)</option>
                  <option value="Venlafaxine">Venlafaxine (SNRI)</option>
                  <option value="Duloxetine">Duloxetine (SNRI)</option>
                  <option value="Mirtazapine">Mirtazapine (NaSSA)</option>
                  <option value="Amitriptyline">Amitriptyline (TCA)</option>
                </select>
              </div>
              <div>
                <label className="text-[#334155] font-semibold block mb-1">Drug Class</label>
                <input
                  type="text"
                  readOnly
                  value={formData.ad_class}
                  className="w-full bg-[#F1F5F9] border border-[#CBD5E1] rounded-lg p-2.5 text-[#475569] font-medium"
                />
              </div>
              <div>
                <label className="text-[#334155] font-semibold block mb-1">Daily Dose (mg)</label>
                <input
                  type="number"
                  min="2"
                  max="300"
                  value={formData.ad_dose_mg}
                  onChange={(e) => updateField('ad_dose_mg', Number(e.target.value))}
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-2.5 text-[#0F172A] focus:border-[#0F766E] focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Adherence & Pill Count */}
        {step === 5 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">Medication Adherence (MARS & Pill Count)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="text-[#334155] font-semibold block mb-1">MARS Adherence Score (0 - 10)</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={formData.mars_score}
                  onChange={(e) => updateField('mars_score', Number(e.target.value))}
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-2.5 text-[#0F172A] focus:border-[#0F766E] focus:outline-none"
                />
                <span className="text-[10px] text-[#64748B] mt-1 block">≥8: High adherence; 6-7: Moderate; &lt;6: Low</span>
              </div>
              <div>
                <label className="text-[#334155] font-semibold block mb-1">Tablets Dispensed</label>
                <input
                  type="number"
                  min="1"
                  value={formData.tabs_dispensed}
                  onChange={(e) => updateField('tabs_dispensed', Number(e.target.value))}
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-2.5 text-[#0F172A] focus:border-[#0F766E] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[#334155] font-semibold block mb-1">Tablets Remaining (Returned Count)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.tabs_remaining}
                  onChange={(e) => updateField('tabs_remaining', Number(e.target.value))}
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-2.5 text-[#0F172A] focus:border-[#0F766E] focus:outline-none"
                />
              </div>
            </div>

            {/* Calculated Pill Count Percentage */}
            <div className="p-4 rounded-xl bg-[#F0FDFA] border border-[#CCFBF1] flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#0F766E]">Calculated Pill-Count Adherence Rate</p>
                <p className="text-[11px] text-[#115E59]">Formula: ((Dispensed - Remaining) / Dispensed) * 100</p>
              </div>
              <span className="text-2xl font-black text-[#0F766E]">{formData.adherence_pct}%</span>
            </div>
          </div>
        )}

        {/* STEP 6: MADRS & GAD-7 Scales */}
        {step === 6 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">Baseline Depression & Anxiety Scales</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-[#334155] font-semibold block mb-1">Baseline MADRS Total Score (0 - 60)</label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={formData.madrs_baseline}
                  onChange={(e) => updateField('madrs_baseline', Number(e.target.value))}
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-2.5 text-[#0F172A] focus:border-[#0F766E] focus:outline-none text-base font-bold"
                />
                <span className="text-[10px] text-[#64748B] mt-1 block">7-19: Mild; 20-34: Moderate; 35-60: Severe</span>
              </div>
              <div>
                <label className="text-[#334155] font-semibold block mb-1">Baseline GAD-7 Anxiety Score (0 - 21)</label>
                <input
                  type="number"
                  min="0"
                  max="21"
                  value={formData.gad7_baseline}
                  onChange={(e) => updateField('gad7_baseline', Number(e.target.value))}
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-2.5 text-[#0F172A] focus:border-[#0F766E] focus:outline-none text-base font-bold"
                />
                <span className="text-[10px] text-[#64748B] mt-1 block">5-9: Mild; 10-14: Moderate; 15-21: Severe</span>
              </div>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={handlePrev}
          disabled={step === 0}
          className="px-4 py-2.5 bg-white hover:bg-[#F8FAFC] text-[#475569] border border-[#CBD5E1] rounded-lg text-xs font-semibold flex items-center space-x-1.5 disabled:opacity-40 cursor-pointer shadow-2xs"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous Step</span>
        </button>

        {step < steps.length - 1 ? (
          <button
            onClick={handleNext}
            className="px-5 py-2.5 bg-[#0F766E] hover:bg-[#115E59] text-white font-bold text-xs rounded-lg flex items-center space-x-1.5 shadow-xs cursor-pointer"
          >
            <span>Next Step</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs rounded-lg flex items-center space-x-1.5 shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Complete Intake & Enroll Patient</span>
          </button>
        )}
      </div>
    </Layout>
  );
};
