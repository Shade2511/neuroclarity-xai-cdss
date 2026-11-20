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
  X,
  ShieldAlert,
  AlertTriangle,
  HelpCircle,
  Info,
  RotateCcw,
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
    has_schizophrenia: 0,
    has_mania: 0,
    has_bipolar: 0,
    has_ocd: 0,
    has_other_psychiatric: 0,
    has_autoimmune: 0,

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

    // Step 6: Naranjo Adverse Drug Reaction Scale
    adr_occurred: 0,
    adr_severity: 'None',
    adr_reaction: 'None',
    naranjo_score: 0,
    naranjo_class: 'Doubtful',

    // Step 7: Baseline Assessment Scores
    madrs_baseline: 32,
    gad7_baseline: 11,
    notes: '',
  });

  const steps = [
    'Study & Site Info',
    'Demographics',
    'Psychiatric History',
    'Medical Comorbidities',
    'Antidepressant Regimen',
    'Adherence & Pill Count',
    'Naranjo ADR Scale',
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

  // Custom display-only comorbidities (UI only, no significance in prediction)
  const [customConditions, setCustomConditions] = useState<{ id: string; name: string; active: boolean }[]>([]);
  const [customConditionInput, setCustomConditionInput] = useState('');

  const handleAddCustomCondition = () => {
    const trimmed = customConditionInput.trim();
    if (!trimmed) return;
    if (customConditions.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      toast.error('This condition has already been added as a button.');
      return;
    }
    const newCondition = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: trimmed,
      active: true,
    };
    setCustomConditions((prev) => [...prev, newCondition]);
    setCustomConditionInput('');
    toast.success(`Added "${trimmed}" as button.`);
  };

  const handleToggleCustomCondition = (id: string) => {
    setCustomConditions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
  };

  const handleRemoveCustomCondition = (id: string) => {
    setCustomConditions((prev) => prev.filter((c) => c.id !== id));
  };

  // Additional / Concurrent Prescriptions (same schema as primary prescription)
  interface AdditionalPrescription {
    id: string;
    ad_name: string;
    ad_class: string;
    ad_dose_mg: number;
    ad_frequency: string;
    ad_duration_weeks: number;
  }

  const [additionalPrescriptions, setAdditionalPrescriptions] = useState<AdditionalPrescription[]>([]);

  const getDrugClass = (name: string): string => {
    if (['Venlafaxine', 'Duloxetine', 'Desvenlafaxine'].includes(name)) return 'SNRI';
    if (['Amitriptyline', 'Nortriptyline', 'Imipramine'].includes(name)) return 'TCA';
    if (['Mirtazapine'].includes(name)) return 'NaSSA';
    if (['Bupropion'].includes(name)) return 'NDRI';
    if (['Vortioxetine', 'Agomelatine', 'Aripiprazole', 'Quetiapine', 'Lithium'].includes(name)) return 'Atypical';
    return 'SSRI';
  };

  const handleAddPrescription = () => {
    const newRx: AdditionalPrescription = {
      id: `rx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ad_name: 'Bupropion',
      ad_class: 'NDRI',
      ad_dose_mg: 150,
      ad_frequency: 'Once daily',
      ad_duration_weeks: 4,
    };
    setAdditionalPrescriptions((prev) => [...prev, newRx]);
    toast.success('Added concurrent prescription.');
  };

  const handleRemovePrescription = (id: string) => {
    setAdditionalPrescriptions((prev) => prev.filter((rx) => rx.id !== id));
    toast.success('Removed prescription.');
  };

  const handleUpdatePrescription = (id: string, field: keyof AdditionalPrescription, val: any) => {
    setAdditionalPrescriptions((prev) =>
      prev.map((rx) => {
        if (rx.id !== id) return rx;
        const updated = { ...rx, [field]: val };
        if (field === 'ad_name') {
          updated.ad_class = getDrugClass(val);
        }
        return updated;
      })
    );
  };

  // Medications for other Psychiatric Conditions (past/concurrent medications, dose, indication)
  interface PsychiatricMedication {
    id: string;
    drug_name: string;
    dose_mg: number;
    indication: string;
  }

  const [otherPsychiatricMeds, setOtherPsychiatricMeds] = useState<PsychiatricMedication[]>([]);

  const handleAddOtherPsychMed = () => {
    const newMed: PsychiatricMedication = {
      id: `psych-med-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      drug_name: 'Quetiapine',
      dose_mg: 50,
      indication: 'Bipolar disorder',
    };
    setOtherPsychiatricMeds((prev) => [...prev, newMed]);
    toast.success('Added medication for other psychiatric conditions.');
  };

  const handleRemoveOtherPsychMed = (id: string) => {
    setOtherPsychiatricMeds((prev) => prev.filter((m) => m.id !== id));
    toast.success('Removed medication entry.');
  };

  const handleUpdateOtherPsychMed = (id: string, field: keyof PsychiatricMedication, val: any) => {
    setOtherPsychiatricMeds((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: val } : m))
    );
  };

  // -------------------------------------------------------------
  // Step 6: Naranjo Adverse Drug Reaction (ADR) Probability Scale
  // -------------------------------------------------------------
  interface NaranjoQuestion {
    id: number;
    question: string;
    detail: string;
    yesScore: number;
    noScore: number;
    unknownScore: number;
  }

  const NARANJO_QUESTIONS: NaranjoQuestion[] = [
    {
      id: 1,
      question: '1. Are there previous conclusive reports on this reaction?',
      detail: 'Documented in product package insert, clinical monographs, or published pharmacovigilance reports.',
      yesScore: 1,
      noScore: 0,
      unknownScore: 0,
    },
    {
      id: 2,
      question: '2. Did the adverse event appear after the suspected drug was administered?',
      detail: 'Clear temporal chronology following drug commencement, titration, or re-initiation.',
      yesScore: 2,
      noScore: -1,
      unknownScore: 0,
    },
    {
      id: 3,
      question: '3. Did the adverse reaction improve when the drug was discontinued or a specific antagonist was administered?',
      detail: 'Positive dechallenge: abatement or remission of symptoms following cessation or dose reduction.',
      yesScore: 1,
      noScore: 0,
      unknownScore: 0,
    },
    {
      id: 4,
      question: '4. Did the adverse reaction reappear when the drug was readministered?',
      detail: 'Positive rechallenge: identical symptoms recurred upon re-exposure (rarely done intentionally).',
      yesScore: 2,
      noScore: -1,
      unknownScore: 0,
    },
    {
      id: 5,
      question: '5. Are there alternative causes (other than the drug) that could on their own have caused the reaction?',
      detail: 'Underlying somatic disease, concurrent medications, infection, or psychiatric somatic manifestations.',
      yesScore: -1,
      noScore: 2,
      unknownScore: 0,
    },
    {
      id: 6,
      question: '6. Did the reaction appear when a placebo was given?',
      detail: 'Reaction occurred in presence of inactive dummy or placebo control in blinded protocols.',
      yesScore: -1,
      noScore: 1,
      unknownScore: 0,
    },
    {
      id: 7,
      question: '7. Was the drug detected in the blood (or other fluids) in concentrations known to be toxic?',
      detail: 'Therapeutic drug monitoring (TDM) levels above therapeutic threshold, or documented toxic concentration.',
      yesScore: 1,
      noScore: 0,
      unknownScore: 0,
    },
    {
      id: 8,
      question: '8. Was the reaction more severe when the dose was increased, or less severe when the dose was decreased?',
      detail: 'Biological plausibility / clear dose-dependent severity gradient observed.',
      yesScore: 1,
      noScore: 0,
      unknownScore: 0,
    },
    {
      id: 9,
      question: '9. Did the patient have a similar reaction to the same or similar drugs in any previous exposure?',
      detail: 'Past patient history of adverse reaction to same agent or same pharmacological class.',
      yesScore: 1,
      noScore: 0,
      unknownScore: 0,
    },
    {
      id: 10,
      question: '10. Was the adverse event confirmed by any objective evidence?',
      detail: 'Confirmed by physical exam findings, laboratory abnormalities, ECG alterations, or biomarker elevations.',
      yesScore: 1,
      noScore: 0,
      unknownScore: 0,
    },
  ];

  const getNaranjoInterpretation = (score: number) => {
    if (score >= 9) {
      return {
        category: 'Definite',
        label: 'Definite ADR (Score ≥ 9)',
        badgeClass: 'bg-red-50 text-red-700 border-red-200',
        borderClass: 'border-red-300',
        bgCard: 'bg-red-50/50',
        description: 'The reaction was definitely related to the drug. Reasonable temporal sequence, verified by dechallenge/rechallenge or toxic concentration without alternate cause.',
        action: 'Immediate action advised: Consider tapering or stopping the drug, report to institutional pharmacovigilance.',
      };
    }
    if (score >= 5) {
      return {
        category: 'Probable',
        label: 'Probable ADR (Score 5 - 8)',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
        borderClass: 'border-amber-300',
        bgCard: 'bg-amber-50/50',
        description: 'The reaction was likely related to the drug. Followed reasonable sequence, confirmed by dechallenge, and cannot be reasonably explained by patient disorder.',
        action: 'Recommended action: Monitor closely, consider dose reduction or alternative agent if intolerable.',
      };
    }
    if (score >= 1) {
      return {
        category: 'Possible',
        label: 'Possible ADR (Score 1 - 4)',
        badgeClass: 'bg-yellow-50 text-yellow-800 border-yellow-200',
        borderClass: 'border-yellow-300',
        bgCard: 'bg-yellow-50/40',
        description: 'The reaction might be related to the drug. Followed temporal sequence, but could also be explained by the clinical state or concomitant medications.',
        action: 'Recommended action: Routine clinical surveillance; evaluate potential drug-drug interactions or somatic comorbidities.',
      };
    }
    return {
      category: 'Doubtful',
      label: 'Doubtful ADR (Score ≤ 0)',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
      borderClass: 'border-slate-200',
      bgCard: 'bg-slate-50',
      description: 'The reaction is unlikely related to the drug. Most likely explained by non-drug etiologies or somatic manifestations of depression/anxiety.',
      action: 'Recommended action: No drug changes required based on this causality assessment.',
    };
  };

  const [naranjoAnswers, setNaranjoAnswers] = useState<Record<number, 'yes' | 'no' | 'unknown'>>({
    1: 'unknown',
    2: 'unknown',
    3: 'unknown',
    4: 'unknown',
    5: 'unknown',
    6: 'unknown',
    7: 'unknown',
    8: 'unknown',
    9: 'unknown',
    10: 'unknown',
  });
  const [adrCustomSymptom, setAdrCustomSymptom] = useState('');

  const handleNaranjoAnswerChange = (questionId: number, answer: 'yes' | 'no' | 'unknown') => {
    const updated = { ...naranjoAnswers, [questionId]: answer };
    setNaranjoAnswers(updated);
    let total = 0;
    NARANJO_QUESTIONS.forEach((q) => {
      const a = updated[q.id] || 'unknown';
      if (a === 'yes') total += q.yesScore;
      else if (a === 'no') total += q.noScore;
      else total += q.unknownScore;
    });
    const interp = getNaranjoInterpretation(total);
    setFormData((prev) => ({
      ...prev,
      naranjo_score: total,
      naranjo_class: interp.category,
      adr_occurred: total >= 1 ? 1 : prev.adr_occurred,
      adr_severity: total >= 5 && prev.adr_severity === 'None' ? 'Moderate' : prev.adr_severity,
    }));
  };

  const handleApplyNaranjoPreset = (preset: 'doubtful' | 'possible' | 'probable' | 'definite') => {
    let newAnswers: Record<number, 'yes' | 'no' | 'unknown'> = {
      1: 'unknown', 2: 'unknown', 3: 'unknown', 4: 'unknown', 5: 'unknown',
      6: 'unknown', 7: 'unknown', 8: 'unknown', 9: 'unknown', 10: 'unknown'
    };
    if (preset === 'doubtful') {
      newAnswers = { 1: 'unknown', 2: 'unknown', 3: 'unknown', 4: 'unknown', 5: 'unknown', 6: 'unknown', 7: 'unknown', 8: 'unknown', 9: 'unknown', 10: 'unknown' };
      setFormData((prev) => ({
        ...prev,
        adr_occurred: 0,
        adr_severity: 'None',
        adr_reaction: 'None',
        naranjo_score: 0,
        naranjo_class: 'Doubtful',
      }));
      toast.success('Preset applied: Doubtful ADR (Score: 0)');
    } else if (preset === 'possible') {
      newAnswers = { 1: 'yes', 2: 'yes', 3: 'unknown', 4: 'unknown', 5: 'unknown', 6: 'unknown', 7: 'unknown', 8: 'unknown', 9: 'unknown', 10: 'unknown' };
      setFormData((prev) => ({
        ...prev,
        adr_occurred: 1,
        adr_severity: prev.adr_severity === 'None' ? 'Mild' : prev.adr_severity,
        adr_reaction: prev.adr_reaction === 'None' ? 'Nausea / Gastrointestinal distress' : prev.adr_reaction,
        naranjo_score: 3,
        naranjo_class: 'Possible',
      }));
      toast.success('Preset applied: Possible ADR (Score: 3)');
    } else if (preset === 'probable') {
      newAnswers = { 1: 'yes', 2: 'yes', 3: 'yes', 4: 'unknown', 5: 'no', 6: 'unknown', 7: 'unknown', 8: 'unknown', 9: 'unknown', 10: 'unknown' };
      setFormData((prev) => ({
        ...prev,
        adr_occurred: 1,
        adr_severity: prev.adr_severity === 'None' ? 'Moderate' : prev.adr_severity,
        adr_reaction: prev.adr_reaction === 'None' ? 'Nausea / Gastrointestinal distress' : prev.adr_reaction,
        naranjo_score: 6,
        naranjo_class: 'Probable',
      }));
      toast.success('Preset applied: Probable ADR (Score: 6)');
    } else if (preset === 'definite') {
      newAnswers = { 1: 'yes', 2: 'yes', 3: 'yes', 4: 'yes', 5: 'no', 6: 'unknown', 7: 'unknown', 8: 'unknown', 9: 'unknown', 10: 'yes' };
      setFormData((prev) => ({
        ...prev,
        adr_occurred: 1,
        adr_severity: prev.adr_severity === 'None' ? 'Severe' : prev.adr_severity,
        adr_reaction: prev.adr_reaction === 'None' ? 'Serotonergic toxicity symptoms' : prev.adr_reaction,
        naranjo_score: 9,
        naranjo_class: 'Definite',
      }));
      toast.success('Preset applied: Definite ADR (Score: 9)');
    }
    setNaranjoAnswers(newAnswers);
  };

  const handleDirectScoreChange = (scoreVal: number) => {
    const clamped = Math.max(-4, Math.min(13, scoreVal));
    const interp = getNaranjoInterpretation(clamped);
    setFormData((prev) => ({
      ...prev,
      naranjo_score: clamped,
      naranjo_class: interp.category,
      adr_occurred: clamped >= 1 ? 1 : prev.adr_occurred,
      adr_severity: clamped >= 5 && prev.adr_severity === 'None' ? 'Moderate' : prev.adr_severity,
    }));
  };

  const handleSubmit = async () => {
    try {
      const submissionData = { ...formData };
      const comorbCount = (
        (submissionData.has_hypertension || 0) +
        (submissionData.has_diabetes || 0) +
        (submissionData.has_thyroid || 0) +
        (submissionData.has_cardiovascular || 0) +
        (submissionData.has_ckd || 0) +
        (submissionData.has_liver || 0) +
        (submissionData.has_asthma_copd || 0) +
        (submissionData.has_epilepsy || 0) +
        (submissionData.has_migraine || 0) +
        (submissionData.has_schizophrenia || 0) +
        (submissionData.has_mania || 0) +
        (submissionData.has_bipolar || 0) +
        (submissionData.has_ocd || 0) +
        (submissionData.has_other_psychiatric || (submissionData as any).has_other_psychoaffective || 0) +
        (submissionData.has_autoimmune || 0)
      );
      (submissionData as any).comorbidity_count = comorbCount;

      if (customConditions.length > 0) {
        const activeConditions = customConditions.filter((c) => c.active).map((c) => c.name);
        if (activeConditions.length > 0) {
          const customNote = `Additional Conditions: ${activeConditions.join(', ')}`;
          submissionData.notes = submissionData.notes
            ? `${submissionData.notes} | ${customNote}`
            : customNote;
        }
      }

      if (additionalPrescriptions.length > 0) {
        (submissionData as any).additional_prescriptions = additionalPrescriptions;
        const rxSummary = additionalPrescriptions
          .map((rx) => `${rx.ad_name} (${rx.ad_dose_mg}mg ${rx.ad_frequency}, ${rx.ad_duration_weeks}w)`)
          .join('; ');
        const rxNote = `Concurrent Prescriptions: ${rxSummary}`;
        submissionData.notes = submissionData.notes ? `${submissionData.notes} | ${rxNote}` : rxNote;
      }

      if (otherPsychiatricMeds.length > 0) {
        (submissionData as any).other_psychiatric_medications = otherPsychiatricMeds;
        const psychSummary = otherPsychiatricMeds
          .map((m) => `${m.drug_name} ${m.dose_mg}mg (Indication: ${m.indication})`)
          .join('; ');
        const psychNote = `Other Psych Meds: ${psychSummary}`;
        submissionData.notes = submissionData.notes ? `${submissionData.notes} | ${psychNote}` : psychNote;
      }

      if (submissionData.adr_occurred === 1 || (submissionData.naranjo_score || 0) > 0) {
        const adrLabel = submissionData.adr_reaction && submissionData.adr_reaction !== 'None'
          ? submissionData.adr_reaction
          : (adrCustomSymptom.trim() || 'Suspected reaction');
        const adrNote = `ADR Assessment: ${adrLabel} (Severity: ${submissionData.adr_severity || 'Mild'}, Naranjo: ${submissionData.naranjo_score || 0} - ${submissionData.naranjo_class || 'Possible'})`;
        submissionData.notes = submissionData.notes ? `${submissionData.notes} | ${adrNote}` : adrNote;
      }
      const created = await createPatient(submissionData as any);
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
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">Medical Co-morbidities Checklist</h3>
              <p className="text-xs text-[#64748B] mt-0.5">Select documented comorbid clinical conditions from the standard diagnostic panel.</p>
            </div>

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
                { id: 'has_schizophrenia', label: 'Schizophrenia' },
                { id: 'has_mania', label: 'Mania' },
                { id: 'has_bipolar', label: 'Bipolar Disorder' },
                { id: 'has_ocd', label: 'Obsessive Compulsive Disorder' },
                { id: 'has_other_psychiatric', label: 'Other Psychiatric Conditions' },
                { id: 'has_autoimmune', label: 'Autoimmune Conditions' },
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

            {/* Add Additional Condition */}
            <div className="pt-4 border-t border-[#E2E8F0] space-y-3">
              <div>
                <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                  Add Additional Condition
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customConditionInput}
                  onChange={(e) => setCustomConditionInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomCondition();
                    }
                  }}
                  placeholder="Enter condition name..."
                  className="flex-1 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg px-3 py-2 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:border-[#0F766E] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddCustomCondition}
                  className="px-3.5 py-2 bg-[#0F766E] hover:bg-[#0D9488] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Condition</span>
                </button>
              </div>

              {/* Rendered Condition Buttons */}
              {customConditions.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {customConditions.map((cond) => (
                    <button
                      key={cond.id}
                      type="button"
                      onClick={() => handleToggleCustomCondition(cond.id)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                        cond.active
                          ? 'bg-[#F0FDFA] border-[#0F766E] text-[#0F766E] font-semibold'
                          : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] hover:bg-white'
                      }`}
                      title="Click to toggle; click X to remove"
                    >
                      <span className={`w-2 h-2 rounded-full ${cond.active ? 'bg-[#0F766E]' : 'bg-[#CBD5E1]'}`} />
                      <span>{cond.name}</span>
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveCustomCondition(cond.id);
                        }}
                        className="ml-1 text-[#94A3B8] hover:text-red-500 rounded p-0.5 transition-colors"
                        title="Remove condition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 4: Antidepressant Regimen */}
        {step === 4 && (
          <div className="space-y-6">
            {/* Primary Prescription Card */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">Current Antidepressant Prescription (Primary Regimen)</h3>
                  <p className="text-xs text-[#64748B]">Primary index antidepressant prescribed for symptom remission and outcome estimation.</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F0FDFA] text-[#0F766E] border border-[#CCFBF1]">
                  Primary Agent
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
                <div>
                  <label className="text-[#334155] font-semibold block mb-1">Medication Name</label>
                  <select
                    value={formData.ad_name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const cls = getDrugClass(name);
                      updateField('ad_name', name);
                      updateField('ad_class', cls);
                    }}
                    className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2.5 text-[#0F172A] focus:border-[#0F766E] focus:outline-none"
                  >
                    <option value="Escitalopram">Escitalopram (SSRI)</option>
                    <option value="Sertraline">Sertraline (SSRI)</option>
                    <option value="Fluoxetine">Fluoxetine (SSRI)</option>
                    <option value="Paroxetine">Paroxetine (SSRI)</option>
                    <option value="Citalopram">Citalopram (SSRI)</option>
                    <option value="Venlafaxine">Venlafaxine (SNRI)</option>
                    <option value="Duloxetine">Duloxetine (SNRI)</option>
                    <option value="Desvenlafaxine">Desvenlafaxine (SNRI)</option>
                    <option value="Mirtazapine">Mirtazapine (NaSSA)</option>
                    <option value="Bupropion">Bupropion (NDRI)</option>
                    <option value="Amitriptyline">Amitriptyline (TCA)</option>
                    <option value="Nortriptyline">Nortriptyline (TCA)</option>
                    <option value="Vortioxetine">Vortioxetine (Atypical)</option>
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
                    min="1"
                    max="500"
                    value={formData.ad_dose_mg}
                    onChange={(e) => updateField('ad_dose_mg', Number(e.target.value))}
                    className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2.5 text-[#0F172A] focus:border-[#0F766E] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[#334155] font-semibold block mb-1">Dosing Frequency</label>
                  <select
                    value={formData.ad_frequency}
                    onChange={(e) => updateField('ad_frequency', e.target.value)}
                    className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2.5 text-[#0F172A] focus:border-[#0F766E] focus:outline-none"
                  >
                    <option value="Once daily">Once daily</option>
                    <option value="Twice daily">Twice daily</option>
                    <option value="Three times daily">Three times daily</option>
                    <option value="At bedtime">At bedtime</option>
                    <option value="As needed">As needed</option>
                  </select>
                </div>

                <div>
                  <label className="text-[#334155] font-semibold block mb-1">Treatment Duration (wks)</label>
                  <input
                    type="number"
                    min="1"
                    max="52"
                    value={formData.ad_duration_weeks}
                    onChange={(e) => updateField('ad_duration_weeks', Number(e.target.value))}
                    className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2.5 text-[#0F172A] focus:border-[#0F766E] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Additional / Concurrent Prescriptions Section */}
            <div className="pt-5 border-t border-[#E2E8F0] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Pill className="w-4 h-4 text-[#0F766E]" />
                    <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                      Additional Prescriptions (Concurrent Pharmacotherapy)
                    </h4>
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    Add or remove concurrent antidepressant, augmentation agent, or combination psychotropic prescriptions sharing the same clinical schema.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddPrescription}
                  className="px-3.5 py-2 bg-[#0F766E] hover:bg-[#0D9488] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer self-start sm:self-auto shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Prescription</span>
                </button>
              </div>

              {/* Empty State */}
              {additionalPrescriptions.length === 0 && (
                <div className="p-4 rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] flex flex-col items-center justify-center text-center space-y-2">
                  <Pill className="w-6 h-6 text-[#94A3B8]" />
                  <p className="text-xs text-[#64748B]">
                    No concurrent prescriptions documented. If the patient is on combination pharmacotherapy or augmentation (e.g. Bupropion, Mirtazapine, Atypical), click below to add.
                  </p>
                  <button
                    type="button"
                    onClick={handleAddPrescription}
                    className="px-3 py-1.5 bg-white border border-[#CBD5E1] hover:border-[#0F766E] text-[#0F766E] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Concurrent Prescription</span>
                  </button>
                </div>
              )}

              {/* Additional Prescription Cards */}
              {additionalPrescriptions.length > 0 && (
                <div className="space-y-3">
                  {additionalPrescriptions.map((rx, idx) => (
                    <div
                      key={rx.id}
                      className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#0F172A]">
                            Prescription #{idx + 2} (Concurrent / Augmentation)
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F0FDFA] text-[#0F766E] border border-[#CCFBF1]">
                            {rx.ad_class || 'Antidepressant'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemovePrescription(rx.id)}
                          className="text-xs text-[#94A3B8] hover:text-red-600 flex items-center gap-1 p-1 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                          title="Remove this prescription"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="font-semibold text-[11px]">Remove</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                        <div>
                          <label className="text-[#334155] font-semibold block mb-1">Medication Name</label>
                          <select
                            value={rx.ad_name}
                            onChange={(e) => handleUpdatePrescription(rx.id, 'ad_name', e.target.value)}
                            className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-2.5 text-[#0F172A] focus:border-[#0F766E] focus:outline-none"
                          >
                            <option value="Bupropion">Bupropion (NDRI)</option>
                            <option value="Mirtazapine">Mirtazapine (NaSSA)</option>
                            <option value="Aripiprazole">Aripiprazole (Augmentation Atypical)</option>
                            <option value="Quetiapine">Quetiapine (Augmentation Atypical)</option>
                            <option value="Lithium">Lithium (Mood Stabilizer)</option>
                            <option value="Escitalopram">Escitalopram (SSRI)</option>
                            <option value="Sertraline">Sertraline (SSRI)</option>
                            <option value="Fluoxetine">Fluoxetine (SSRI)</option>
                            <option value="Paroxetine">Paroxetine (SSRI)</option>
                            <option value="Citalopram">Citalopram (SSRI)</option>
                            <option value="Venlafaxine">Venlafaxine (SNRI)</option>
                            <option value="Duloxetine">Duloxetine (SNRI)</option>
                            <option value="Desvenlafaxine">Desvenlafaxine (SNRI)</option>
                            <option value="Amitriptyline">Amitriptyline (TCA)</option>
                            <option value="Nortriptyline">Nortriptyline (TCA)</option>
                            <option value="Vortioxetine">Vortioxetine (Atypical)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[#334155] font-semibold block mb-1">Drug Class</label>
                          <input
                            type="text"
                            readOnly
                            value={rx.ad_class}
                            className="w-full bg-[#F1F5F9] border border-[#CBD5E1] rounded-lg p-2.5 text-[#475569] font-medium"
                          />
                        </div>

                        <div>
                          <label className="text-[#334155] font-semibold block mb-1">Daily Dose (mg)</label>
                          <input
                            type="number"
                            min="1"
                            max="500"
                            value={rx.ad_dose_mg}
                            onChange={(e) => handleUpdatePrescription(rx.id, 'ad_dose_mg', Number(e.target.value))}
                            className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-2.5 text-[#0F172A] focus:border-[#0F766E] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[#334155] font-semibold block mb-1">Dosing Frequency</label>
                          <select
                            value={rx.ad_frequency}
                            onChange={(e) => handleUpdatePrescription(rx.id, 'ad_frequency', e.target.value)}
                            className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-2.5 text-[#0F172A] focus:border-[#0F766E] focus:outline-none"
                          >
                            <option value="Once daily">Once daily</option>
                            <option value="Twice daily">Twice daily</option>
                            <option value="Three times daily">Three times daily</option>
                            <option value="At bedtime">At bedtime</option>
                            <option value="As needed">As needed</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[#334155] font-semibold block mb-1">Treatment Duration (wks)</label>
                          <input
                            type="number"
                            min="1"
                            max="52"
                            value={rx.ad_duration_weeks}
                            onChange={(e) => handleUpdatePrescription(rx.id, 'ad_duration_weeks', Number(e.target.value))}
                            className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-2.5 text-[#0F172A] focus:border-[#0F766E] focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleAddPrescription}
                      className="px-3.5 py-2 bg-white hover:bg-[#F8FAFC] text-[#0F766E] border border-[#CBD5E1] hover:border-[#0F766E] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Another Prescription</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Section: Medications for other Psychiatric Conditions */}
            <div className="pt-5 border-t border-[#E2E8F0] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#0284C7]" />
                    <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                      Medications for other Psychiatric Conditions
                    </h4>
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    Record past or concurrent psychotropic medications, doses, and clinical indications (e.g. mood stabilizers, antipsychotics, anxiolytics).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddOtherPsychMed}
                  className="px-3.5 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer self-start sm:self-auto shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Medication</span>
                </button>
              </div>

              {/* Empty State */}
              {otherPsychiatricMeds.length === 0 && (
                <div className="p-4 rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] flex flex-col items-center justify-center text-center space-y-2">
                  <Activity className="w-6 h-6 text-[#94A3B8]" />
                  <p className="text-xs text-[#64748B]">
                    No medications for other psychiatric conditions documented. Click below to add past or concurrent psychiatric medications, dose, and indication.
                  </p>
                  <button
                    type="button"
                    onClick={handleAddOtherPsychMed}
                    className="px-3 py-1.5 bg-white border border-[#CBD5E1] hover:border-[#0284C7] text-[#0284C7] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Psychiatric Medication</span>
                  </button>
                </div>
              )}

              {/* Medication Cards List */}
              {otherPsychiatricMeds.length > 0 && (
                <div className="space-y-3">
                  {otherPsychiatricMeds.map((med, idx) => (
                    <div
                      key={med.id}
                      className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#0F172A]">
                            Medication #{idx + 1} (Other Psychiatric Condition)
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F0F9FF] text-[#0284C7] border border-[#BAE6FD]">
                            {med.indication || 'Psychiatric'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveOtherPsychMed(med.id)}
                          className="text-xs text-[#94A3B8] hover:text-red-600 flex items-center gap-1 p-1 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                          title="Remove this medication"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="font-semibold text-[11px]">Remove</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="text-[#334155] font-semibold block mb-1">Medication Name (Past / Concurrent)</label>
                          <input
                            type="text"
                            value={med.drug_name}
                            onChange={(e) => handleUpdateOtherPsychMed(med.id, 'drug_name', e.target.value)}
                            placeholder="e.g. Quetiapine, Lithium, Olanzapine"
                            className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-2.5 text-[#0F172A] focus:border-[#0284C7] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[#334155] font-semibold block mb-1">Dose (mg)</label>
                          <input
                            type="number"
                            min="0.25"
                            step="0.5"
                            value={med.dose_mg}
                            onChange={(e) => handleUpdateOtherPsychMed(med.id, 'dose_mg', Number(e.target.value))}
                            className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-2.5 text-[#0F172A] focus:border-[#0284C7] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[#334155] font-semibold block mb-1">Clinical Indication</label>
                          <input
                            type="text"
                            value={med.indication}
                            onChange={(e) => handleUpdateOtherPsychMed(med.id, 'indication', e.target.value)}
                            placeholder="e.g. Bipolar disorder, Schizophrenia, OCD, Insomnia"
                            className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg p-2.5 text-[#0F172A] focus:border-[#0284C7] focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleAddOtherPsychMed}
                      className="px-3.5 py-2 bg-white hover:bg-[#F8FAFC] text-[#0284C7] border border-[#CBD5E1] hover:border-[#0284C7] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Another Medication</span>
                    </button>
                  </div>
                </div>
              )}
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

        {/* STEP 6: Naranjo ADR Probability Scale */}
        {step === 6 && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-[#D97706]" />
                  <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">
                    6. Naranjo Adverse Drug Reaction (ADR) Probability Scale
                  </h3>
                </div>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Standardized 10-question causality assessment algorithm (Naranjo et al., 1981) to estimate the clinical probability that an adverse event is drug-induced.
                </p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <span className="text-xs text-[#64748B] font-semibold">Total Score:</span>
                <span className="text-lg font-black text-[#0F172A] px-2.5 py-0.5 bg-[#F1F5F9] rounded-lg border border-[#CBD5E1]">
                  {formData.naranjo_score}
                </span>
              </div>
            </div>

            {/* ADR Clinical Overview & Severity Box */}
            <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* ADR Occurred Toggle */}
                <div>
                  <label className="text-[#334155] font-semibold block mb-1.5">Adverse Reaction Documented?</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        updateField('adr_occurred', 0);
                        if (formData.adr_severity !== 'None') updateField('adr_severity', 'None');
                      }}
                      className={`py-2 px-3 rounded-lg font-semibold text-xs border transition-colors cursor-pointer ${
                        formData.adr_occurred === 0
                          ? 'bg-white border-[#0F766E] text-[#0F766E] shadow-2xs font-bold'
                          : 'bg-[#F1F5F9] border-transparent text-[#64748B] hover:bg-[#E2E8F0]'
                      }`}
                    >
                      No ADR (0)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        updateField('adr_occurred', 1);
                        if (formData.adr_severity === 'None') updateField('adr_severity', 'Mild');
                      }}
                      className={`py-2 px-3 rounded-lg font-semibold text-xs border transition-colors cursor-pointer ${
                        formData.adr_occurred === 1
                          ? 'bg-[#FEF3C7] border-[#D97706] text-[#92400E] shadow-2xs font-bold'
                          : 'bg-[#F1F5F9] border-transparent text-[#64748B] hover:bg-[#E2E8F0]'
                      }`}
                    >
                      Yes — ADR Suspected (1)
                    </button>
                  </div>
                </div>

                {/* ADR Severity */}
                <div>
                  <label className="text-[#334155] font-semibold block mb-1.5">ADR Severity Grade</label>
                  <select
                    value={formData.adr_severity}
                    onChange={(e) => updateField('adr_severity', e.target.value)}
                    className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 text-[#0F172A] focus:border-[#0F766E] focus:outline-none font-medium"
                  >
                    <option value="None">None (No adverse reaction)</option>
                    <option value="Mild">Mild (Well-tolerated, no intervention needed)</option>
                    <option value="Moderate">Moderate (Interferes with activity / dose adjusted)</option>
                    <option value="Severe">Severe (Disabling, hospitalization, or discontinued)</option>
                  </select>
                </div>

                {/* Suspected Reaction Symptom */}
                <div>
                  <label className="text-[#334155] font-semibold block mb-1.5">Suspected Adverse Reaction</label>
                  <select
                    value={formData.adr_reaction}
                    onChange={(e) => updateField('adr_reaction', e.target.value)}
                    className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2 text-[#0F172A] focus:border-[#0F766E] focus:outline-none font-medium"
                  >
                    <option value="None">None</option>
                    <option value="Nausea / Gastrointestinal distress">Nausea / Gastrointestinal distress</option>
                    <option value="Somnolence / Fatigue / Sedation">Somnolence / Fatigue / Sedation</option>
                    <option value="Insomnia / Agitation / Anxiety">Insomnia / Agitation / Anxiety</option>
                    <option value="Tremor / Restlessness / Akathisia">Tremor / Restlessness / Akathisia</option>
                    <option value="Sexual dysfunction (anorgasmia / libido)">Sexual dysfunction (anorgasmia / libido)</option>
                    <option value="Weight gain / Increased appetite">Weight gain / Increased appetite</option>
                    <option value="Dry mouth / Anticholinergic symptoms">Dry mouth / Anticholinergic symptoms</option>
                    <option value="Dizziness / Orthostatic lightheadedness">Dizziness / Orthostatic lightheadedness</option>
                    <option value="Headache">Headache</option>
                    <option value="Hyponatremia / SIADH">Hyponatremia / SIADH</option>
                    <option value="Serotonergic toxicity symptoms">Serotonergic toxicity symptoms</option>
                    <option value="Other">Other (Custom specification)</option>
                  </select>
                </div>
              </div>

              {formData.adr_reaction === 'Other' && (
                <div className="pt-2 text-xs">
                  <label className="text-[#334155] font-semibold block mb-1">Custom Adverse Reaction Description</label>
                  <input
                    type="text"
                    value={adrCustomSymptom}
                    onChange={(e) => setAdrCustomSymptom(e.target.value)}
                    placeholder="Describe specific symptoms, onset latency, and clinical manifestations..."
                    className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2.5 text-[#0F172A] focus:border-[#0F766E] focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Live Naranjo Probability Banner */}
            {(() => {
              const interp = getNaranjoInterpretation(formData.naranjo_score);
              return (
                <div className={`p-4 rounded-xl border ${interp.borderClass} ${interp.bgCard} space-y-2`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-[#D97706]" />
                      <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                        Probability Assessment:
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${interp.badgeClass}`}>
                        {interp.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-[#64748B]">Score Range: -4 to +13</span>
                      <div className="flex items-center gap-1.5">
                        <label className="text-[#475569] font-semibold">Direct Score:</label>
                        <input
                          type="number"
                          min="-4"
                          max="13"
                          value={formData.naranjo_score}
                          onChange={(e) => handleDirectScoreChange(Number(e.target.value))}
                          className="w-14 bg-white border border-[#CBD5E1] rounded p-1 text-center font-bold text-[#0F172A]"
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-[#334155] leading-relaxed">
                    {interp.description}
                  </p>
                  <p className="text-[11px] font-semibold text-[#0F766E]">
                    {interp.action}
                  </p>
                </div>
              );
            })()}

            {/* Quick 1-Click Presets */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 pb-1">
              <span className="text-xs font-bold text-[#475569]">Quick Algorithm Presets:</span>
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => handleApplyNaranjoPreset('doubtful')}
                  className="px-2.5 py-1 bg-white hover:bg-[#F8FAFC] text-[#475569] border border-[#CBD5E1] rounded-md font-medium text-[11px] transition-colors cursor-pointer"
                >
                  Doubtful (0)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyNaranjoPreset('possible')}
                  className="px-2.5 py-1 bg-white hover:bg-[#FEFCE8] text-[#854D0E] border border-[#FDE047] rounded-md font-medium text-[11px] transition-colors cursor-pointer"
                >
                  Possible (+3)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyNaranjoPreset('probable')}
                  className="px-2.5 py-1 bg-white hover:bg-[#FFFBEB] text-[#B45309] border border-[#FCD34D] rounded-md font-medium text-[11px] transition-colors cursor-pointer"
                >
                  Probable (+6)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyNaranjoPreset('definite')}
                  className="px-2.5 py-1 bg-white hover:bg-[#FEF2F2] text-[#B91C1C] border border-[#FCA5A5] rounded-md font-medium text-[11px] transition-colors cursor-pointer"
                >
                  Definite (+9)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyNaranjoPreset('doubtful')}
                  className="px-2 py-1 text-[#64748B] hover:text-[#0F172A] flex items-center gap-1 font-medium text-[11px] cursor-pointer"
                  title="Reset to 0"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Official 10 Naranjo Questions List */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-[#0F172A] uppercase tracking-wider pb-1 border-b border-[#F1F5F9] flex items-center justify-between">
                <span>The 10 Official Naranjo Algorithm Items</span>
                <span className="text-[11px] text-[#64748B] font-normal">Select response for each item to compute score</span>
              </div>

              {NARANJO_QUESTIONS.map((q) => {
                const currentAnswer = naranjoAnswers[q.id] || 'unknown';
                return (
                  <div
                    key={q.id}
                    className="p-3.5 rounded-xl border border-[#E2E8F0] bg-white hover:border-[#CBD5E1] transition-all space-y-2 shadow-2xs"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-[#0F172A]">{q.question}</p>
                        <p className="text-[11px] text-[#64748B] leading-tight">{q.detail}</p>
                      </div>

                      {/* 3 Inputable Segmented Buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* YES BUTTON */}
                        <button
                          type="button"
                          onClick={() => handleNaranjoAnswerChange(q.id, 'yes')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1 ${
                            currentAnswer === 'yes'
                              ? q.yesScore > 0
                                ? 'bg-[#0F766E] border-[#0F766E] text-white shadow-xs font-bold'
                                : 'bg-[#EF4444] border-[#EF4444] text-white shadow-xs font-bold'
                              : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#475569] hover:bg-[#F1F5F9]'
                          }`}
                        >
                          <span>Yes</span>
                          <span className={`text-[10px] ${currentAnswer === 'yes' ? 'text-white/90' : 'text-[#64748B]'}`}>
                            ({q.yesScore >= 0 ? `+${q.yesScore}` : q.yesScore})
                          </span>
                        </button>

                        {/* NO BUTTON */}
                        <button
                          type="button"
                          onClick={() => handleNaranjoAnswerChange(q.id, 'no')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1 ${
                            currentAnswer === 'no'
                              ? q.noScore > 0
                                ? 'bg-[#0F766E] border-[#0F766E] text-white shadow-xs font-bold'
                                : q.noScore < 0
                                ? 'bg-[#EF4444] border-[#EF4444] text-white shadow-xs font-bold'
                                : 'bg-[#334155] border-[#334155] text-white shadow-xs font-bold'
                              : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#475569] hover:bg-[#F1F5F9]'
                          }`}
                        >
                          <span>No</span>
                          <span className={`text-[10px] ${currentAnswer === 'no' ? 'text-white/90' : 'text-[#64748B]'}`}>
                            ({q.noScore >= 0 ? `+${q.noScore}` : q.noScore})
                          </span>
                        </button>

                        {/* DO NOT KNOW BUTTON */}
                        <button
                          type="button"
                          onClick={() => handleNaranjoAnswerChange(q.id, 'unknown')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1 ${
                            currentAnswer === 'unknown'
                              ? 'bg-[#64748B] border-[#64748B] text-white shadow-xs font-bold'
                              : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#475569] hover:bg-[#F1F5F9]'
                          }`}
                        >
                          <span>Do Not Know</span>
                          <span className={`text-[10px] ${currentAnswer === 'unknown' ? 'text-white/90' : 'text-[#64748B]'}`}>
                            (0)
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 7: MADRS & GAD-7 Scales */}
        {step === 7 && (
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
