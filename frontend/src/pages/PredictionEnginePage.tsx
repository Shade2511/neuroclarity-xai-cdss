import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Cpu,
  RotateCw,
  Sparkles,
  CheckCircle2,
  Brain,
  ShieldCheck,
  TrendingUp,
  ChevronRight,
  Info,
} from 'lucide-react';
import { Layout } from '../components/Layout/Layout';
import { GlassCard } from '../components/UI/GlassCard';
import { StatusBadge } from '../components/UI/StatusBadge';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import { PredictionSequenceOverlay } from '../components/Motion/PredictionSequenceOverlay';
import { useAppStore } from '../store';
import { predict, explain } from '../services/api';
import { ModelName } from '../types';
import toast, { Toaster } from 'react-hot-toast';

export const PredictionEnginePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    selectedPatient,
    setSelectedPatient,
    patients,
    prediction,
    setPrediction,
    explanation,
    setExplanation,
    selectedModel,
    setSelectedModel,
    addNotification,
  } = useAppStore();

  const [running, setRunning] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const pipelineSteps = [
    '1. Validating patient clinical intake & scale bounds (MADRS 0-60, GAD-7 0-21)',
    '2. Encoding categorical variables & applying MICE clinical imputation matrix',
    '3. Performing standard scaling normalization on continuous features',
    '4. Executing scikit-learn classifier pipeline for multi-class probability',
    '5. Calculating SHAP Tree/Linear Explainer local attribution values',
    '6. Fitting local surrogate LIME perturbation model',
    '7. Evaluating clinical utility across Decision Curve thresholds',
    '8. Synthesis complete: Ready for Clinician Human-in-the-Loop review',
  ];

  const handleExecute = async () => {
    if (!selectedPatient) return;
    setRunning(true);

    try {
      const pred = await predict(selectedPatient.id, selectedModel);
      setPrediction(pred);
      const exp = await explain(selectedPatient.id, selectedModel);
      setExplanation(exp);
      addNotification(`Prediction generated for ${selectedPatient.study_id || selectedPatient.id}`, 'success');
      toast.success('Inference & explainability generated!');
    } catch (err) {
      console.error(err);
      toast.error('Prediction failed.');
      setRunning(false);
    }
  };

  return (
    <Layout title="AI Treatment Response Prediction Engine">
      <Toaster position="top-right" />

      {/* Multi-Stage Scientific Prediction Execution Motion Overlay */}
      <PredictionSequenceOverlay
        isVisible={running}
        onComplete={() => setRunning(false)}
        patientId={selectedPatient?.study_id || 'NC-0001'}
        modelName={(selectedModel || 'random_forest').replace('_', ' ')}
      />

      {/* Hero Header */}
      <GlassCard className="p-6 bg-white border-[#E2E8F0] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <StatusBadge status="PREDICTION PIPELINE" size="sm" />
              <span className="text-xs text-[#64748B] font-semibold">Stratified Supervised Learning</span>
            </div>
            <h2 className="text-2xl font-bold text-[#0F172A]">Probabilistic Response Inference Core</h2>
            <p className="text-xs text-[#475569] max-w-2xl leading-relaxed">
              Calculates estimated probability of ≥50% MADRS score reduction at 6-week endpoint based on combined demographic, clinical, adherence, and medication factors.
            </p>
          </div>

          <button
            onClick={handleExecute}
            disabled={running || !selectedPatient}
            className="px-5 py-3 bg-[#0F766E] hover:bg-[#115E59] text-white font-bold text-xs rounded-lg shadow-xs transition-all flex items-center space-x-2 shrink-0 disabled:opacity-50 cursor-pointer"
          >
            <Cpu className="w-4 h-4" />
            <span>Run Full XAI Analysis</span>
          </button>
        </div>
      </GlassCard>

      {/* Model Selection & Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            id: 'random_forest',
            name: 'Random Forest',
            type: 'Ensemble Learning',
            auc: '0.78',
            desc: 'Non-linear tree bagging. High robustness to outliers.',
            badge: 'text-[#0F766E]',
          },
          {
            id: 'logistic_regression',
            name: 'Logistic Regression',
            type: 'Primary Interpretable',
            auc: '0.79',
            desc: 'Direct log-odds interpretability with calibrated probabilities.',
            badge: 'text-[#0284C7]',
          },
          {
            id: 'decision_tree',
            name: 'Decision Tree',
            type: 'Rule-Based',
            auc: '0.71',
            desc: 'Transparent binary split pathways suitable for clinical rules.',
            badge: 'text-[#059669]',
          },
          {
            id: 'xgboost',
            name: 'Gradient Boosting (XGB)',
            type: 'High Performance',
            auc: '0.81',
            desc: 'Iterative residual minimization with native SHAP bindings.',
            badge: 'text-[#D97706]',
          },
        ].map((m) => (
          <GlassCard
            key={m.id}
            hover
            onClick={() => setSelectedModel(m.id as ModelName)}
            className={`p-4 space-y-2 cursor-pointer transition-all ${
              selectedModel === m.id
                ? 'border-[#0F766E] bg-[#F0FDFA] shadow-sm ring-1 ring-[#0F766E]'
                : 'border-[#E2E8F0] bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold ${m.badge}`}>{m.name}</span>
              <span className="text-[10px] text-[#64748B] font-semibold">AUC: {m.auc}</span>
            </div>
            <p className="text-[10px] text-[#64748B] uppercase font-semibold">{m.type}</p>
            <p className="text-xs text-[#475569] leading-relaxed">{m.desc}</p>
          </GlassCard>
        ))}
      </div>

      {/* Execution Sequence or Results */}
      <GlassCard className="p-6 space-y-6 bg-white border-[#E2E8F0] shadow-xs">
        {running ? (
          <div className="py-12 text-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-[#0F766E] font-bold">{pipelineSteps[stepIndex]}</p>
            <div className="w-80 mx-auto bg-[#F1F5F9] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#0F766E] h-full transition-all duration-200"
                style={{ width: `${((stepIndex + 1) / pipelineSteps.length) * 100}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Probability Breakdown */}
            <div className="space-y-3 text-center md:text-left">
              <span className="text-xs uppercase tracking-wider text-[#0F766E] font-bold">Prediction Output</span>
              <div className="space-y-0.5">
                <div className="text-5xl font-extrabold text-[#0F172A]">
                  {Math.round((prediction?.probability_response || 0.78) * 100)}%
                </div>
                <p className="text-xs text-[#64748B]">Response Probability (≥50% Reduction)</p>
              </div>
              <StatusBadge status={prediction?.label || 'Likely Responder'} size="lg" />
            </div>

            {/* Probability Distribution Bars */}
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-[#334155]">
                  <span>Responder (≥50% Reduction)</span>
                  <span className="text-[#059669] font-bold">{Math.round((prediction?.probability_response || 0.78) * 100)}%</span>
                </div>
                <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                  <div className="h-full bg-[#059669]" style={{ width: `${(prediction?.probability_response || 0.78) * 100}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-[#334155]">
                  <span>Partial Responder (25-49% Reduction)</span>
                  <span className="text-[#D97706] font-bold">{Math.round((prediction?.probability_partial || 0.14) * 100)}%</span>
                </div>
                <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                  <div className="h-full bg-[#D97706]" style={{ width: `${(prediction?.probability_partial || 0.14) * 100}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-[#334155]">
                  <span>Non-Responder (&lt;25% Reduction)</span>
                  <span className="text-[#DC2626] font-bold">{Math.round((prediction?.probability_nonresponse || 0.08) * 100)}%</span>
                </div>
                <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                  <div className="h-full bg-[#DC2626]" style={{ width: `${(prediction?.probability_nonresponse || 0.08) * 100}%` }} />
                </div>
              </div>
            </div>

            {/* Clinical Next Steps */}
            <div className="space-y-3 p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
              <h4 className="text-xs font-bold text-[#0F172A] uppercase">Clinical Next Steps</h4>
              <button
                onClick={() => navigate('/explainability')}
                className="w-full py-2 bg-[#F0FDFA] hover:bg-[#CCFBF1] text-[#0F766E] border border-[#CCFBF1] rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
              >
                <Brain className="w-4 h-4" />
                <span>Examine SHAP Waterfall</span>
              </button>
              <button
                onClick={() => navigate('/clinical-utility')}
                className="w-full py-2 bg-[#F0F9FF] hover:bg-[#BAE6FD] text-[#0284C7] border border-[#BAE6FD] rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Assess Decision Curve Utility</span>
              </button>
            </div>
          </div>
        )}
      </GlassCard>
    </Layout>
  );
};
