import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Cpu, Sparkles, CheckCircle2, ShieldCheck, Activity } from 'lucide-react';

interface PredictionSequenceOverlayProps {
  isVisible: boolean;
  onComplete?: () => void;
  patientId?: string;
  modelName?: string;
}

export const PredictionSequenceOverlay: React.FC<PredictionSequenceOverlayProps> = ({
  isVisible,
  onComplete,
  patientId = 'NC-0001',
  modelName = 'Random Forest',
}) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      id: 1,
      title: 'Clinical Data Ingestion & Normalization',
      desc: `Ingesting baseline MADRS, GAD-7, MARS adherence & clinical covariates for ${patientId}...`,
      icon: Activity,
      color: 'text-[#0F766E]',
      bg: 'bg-[#F0FDFA]',
      border: 'border-[#CCFBF1]',
    },
    {
      id: 2,
      title: 'Multi-Modal Feature Vector Projection',
      desc: 'Executing scikit-learn preprocessing pipeline & continuous feature scaling...',
      icon: Cpu,
      color: 'text-[#0284C7]',
      bg: 'bg-[#F0F9FF]',
      border: 'border-[#BAE6FD]',
    },
    {
      id: 3,
      title: 'Algorithmic Inference Execution',
      desc: `Computing response probability distribution via ${modelName} classifier...`,
      icon: Brain,
      color: 'text-[#0F766E]',
      bg: 'bg-[#F0FDFA]',
      border: 'border-[#CCFBF1]',
    },
    {
      id: 4,
      title: 'TreeSHAP & LIME Feature Attribution',
      desc: 'Calculating exact Shapley game-theoretic attributions & local decision boundaries...',
      icon: Sparkles,
      color: 'text-[#D97706]',
      bg: 'bg-[#FFFBEB]',
      border: 'border-[#FDE68A]',
    },
    {
      id: 5,
      title: 'Clinical Decision Support Synthesis Ready',
      desc: 'Estimated outcome calibrated and ready for Clinician Human-in-the-Loop review.',
      icon: CheckCircle2,
      color: 'text-[#059669]',
      bg: 'bg-[#ECFDF5]',
      border: 'border-[#A7F3D0]',
    },
  ];

  useEffect(() => {
    if (!isVisible) {
      setStep(0);
      return;
    }

    setStep(0);
    const stepInterval = setInterval(() => {
      setStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(stepInterval);
          return prev;
        }
      });
    }, 380);

    return () => clearInterval(stepInterval);
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 backdrop-blur-xs p-4"
        >
          <motion.div
            initial={{ scale: 0.95, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 10, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl p-6 max-w-lg w-full space-y-5 text-[#0F172A]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#F0FDFA] border border-[#CCFBF1] flex items-center justify-center">
                  <Brain className="w-4 h-4 text-[#0F766E]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#0F172A]">Clinical AI Inference Pipeline</h3>
                  <p className="text-[11px] text-[#64748B]">Multi-Tiered Algorithmic Computation</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-[#0F766E] bg-[#F0FDFA] px-2.5 py-0.5 rounded-full border border-[#CCFBF1]">
                STEP {step + 1} OF {steps.length}
              </span>
            </div>

            {/* Visual Step Timeline */}
            <div className="space-y-2.5">
              {steps.map((s, idx) => {
                const Icon = s.icon;
                const isCurrent = idx === step;
                const isCompleted = idx < step;

                return (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0.4 }}
                    animate={{
                      opacity: isCurrent || isCompleted ? 1 : 0.4,
                      scale: isCurrent ? 1.01 : 1,
                    }}
                    className={`p-3 rounded-xl border flex items-start space-x-3 transition-all ${
                      isCurrent
                        ? `${s.bg} ${s.border} ring-1 ring-[#0F766E]/30`
                        : isCompleted
                        ? 'bg-[#F8FAFC] border-[#E2E8F0]'
                        : 'bg-white border-[#F1F5F9]'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                        isCompleted
                          ? 'bg-[#ECFDF5] text-[#059669]'
                          : isCurrent
                          ? `${s.color}`
                          : 'text-[#94A3B8]'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#0F172A]">{s.title}</p>
                      <p className="text-[11px] text-[#64748B] leading-relaxed truncate">{s.desc}</p>
                    </div>
                    {isCurrent && (
                      <div className="w-2 h-2 rounded-full bg-[#0F766E] animate-ping shrink-0 mt-2 mr-1" />
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Progress Track */}
            <div className="space-y-1.5 pt-1">
              <div className="h-1.5 w-full bg-[#F1F5F9] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#0F766E] to-[#0284C7]"
                  initial={{ width: '0%' }}
                  animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-[10px] text-center text-[#64748B]">
                Calibrated XAI computation • Human-in-the-Loop decision support
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
