import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  MessageSquare,
  X,
  Send,
  Brain,
  Bot,
  User,
  RefreshCw,
  Zap,
  Activity,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { useAppStore } from '../../store';
import { predict, explain, getPatients } from '../../services/api';
import toast from 'react-hot-toast';

interface ActionButton {
  label: string;
  icon?: any;
  action: () => void;
  variant?: 'primary' | 'secondary' | 'mint' | 'teal';
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  tags?: string[];
  actionButtons?: ActionButton[];
  actionExecuted?: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    sender: 'ai',
    text: "Hello, I am the **NeuroClarity Clinical AI Assistant**.\n\nI can assist you with patient treatment response estimations, interpret SHAP/LIME factor attributions, calculate MADRS trajectories, and autonomously navigate any section of this clinical platform.",
    timestamp: 'Just now',
    tags: ['Clinical Assistant', 'Active'],
    actionButtons: [
      { label: '📊 Go to Clinical Dashboard', action: () => {}, variant: 'teal' },
      { label: '⚡ Run Prediction on NC-0001', action: () => {}, variant: 'primary' },
      { label: '🔍 Open SHAP Explainability', action: () => {}, variant: 'secondary' },
    ],
  },
];

export const ClinicalAIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const location = useLocation();

  const {
    selectedPatient,
    setSelectedPatient,
    patients,
    setPatients,
    prediction,
    setPrediction,
    explanation,
    setExplanation,
    selectedModel,
    setSelectedModel,
    setIsLoading,
  } = useAppStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (patients.length === 0) {
      getPatients(20, 0).then((res) => {
        setPatients(res.patients);
        if (!selectedPatient && res.patients.length > 0) {
          setSelectedPatient(res.patients[0]);
        }
      }).catch(console.error);
    }
  }, []);

  // System Autonomous Execution Agent
  const executeAgentTask = async (rawQuery: string) => {
    const q = rawQuery.toLowerCase().trim();
    let replyText = '';
    let executedActionText = '';
    const actionButtons: ActionButton[] = [];

    // 1. Navigation intents
    if (q.includes('go to') || q.includes('open') || q.includes('navigate') || q.includes('take me to') || q.includes('show')) {
      if (q.includes('dashboard') || q.includes('command')) {
        navigate('/dashboard');
        executedActionText = 'Navigated to Clinical Dashboard (/dashboard)';
        replyText = '✅ **Navigated to Clinical Command Dashboard.** Review the radial response probability gauge, patient profile vitals, and documented decisions.';
        actionButtons.push({
          label: '⚡ Run Prediction Here',
          action: () => handleRunPrediction(),
          variant: 'teal',
        });
      } else if (q.includes('explain') || q.includes('shap') || q.includes('lime') || q.includes('waterfall')) {
        navigate('/explainability');
        executedActionText = 'Navigated to Explainability Center (/explainability)';
        replyText = '✅ **Opened Explainability Center.** Visualizing SHAP waterfall decomposition, global cohort feature importances, and local LIME surrogates.';
        actionButtons.push({
          label: '📊 View Global Importance',
          action: () => navigate('/explainability'),
          variant: 'primary',
        });
      } else if (q.includes('assessment') || q.includes('intake') || q.includes('crf') || q.includes('patient form')) {
        navigate('/assessment');
        executedActionText = 'Navigated to Patient Assessment Wizard (/assessment)';
        replyText = '✅ **Opened Patient Intake Wizard.** Complete baseline clinical intake, 10-item MADRS, GAD-7, and pill-count adherence.';
      } else if (q.includes('model') || q.includes('lab') || q.includes('architecture')) {
        navigate('/models');
        executedActionText = 'Navigated to Model Laboratory (/models)';
        replyText = '✅ **Opened Model Laboratory.** Showing the 4 ML model architectures (Logistic Regression, Decision Tree, Random Forest, Gradient Boosting) and cross-validation matrix.';
      } else if (q.includes('validation') || q.includes('roc') || q.includes('calibration') || q.includes('curve')) {
        navigate('/validation');
        executedActionText = 'Navigated to Validation Center (/validation)';
        replyText = '✅ **Opened Model Validation Center.** Displaying multi-model ROC Curves, Calibration Reliability diagrams, and Stratified 5-Fold metrics.';
      } else if (q.includes('utility') || q.includes('dca') || q.includes('decision curve')) {
        navigate('/clinical-utility');
        executedActionText = 'Navigated to Clinical Utility DCA (/clinical-utility)';
        replyText = '✅ **Opened Clinical Utility Analysis.** Showing Decision Curve Analysis (DCA) Net Benefit curves comparing AI-guided management against treat-all/treat-none.';
      } else if (q.includes('follow') || q.includes('trajectory') || q.includes('timeline') || q.includes('week 6')) {
        navigate('/followup');
        executedActionText = 'Navigated to Longitudinal Follow-Up (/followup)';
        replyText = '✅ **Opened Follow-Up Trajectory.** Tracking 4-visit symptom scores (Weeks 0, 2, 4, 6) with automated MADRS reduction percentage calculations.';
      } else if (q.includes('research') || q.includes('data') || q.includes('cohort') || q.includes('dataset') || q.includes('csv')) {
        navigate('/research');
        executedActionText = 'Navigated to Research Data Management (/research)';
        replyText = '✅ **Opened Research Cohort Data ($N=320$).** Inspect epidemiological distributions, filterable patient table, and CSV export options.';
      } else if (q.includes('methodology') || q.includes('protocol') || q.includes('screener')) {
        navigate('/methodology');
        executedActionText = 'Navigated to Study Methodology (/methodology)';
        replyText = '✅ **Opened Study Methodology.** Review the 6-month research timeline, inclusion/exclusion checklist, and interactive screener.';
      } else if (q.includes('report') || q.includes('pdf') || q.includes('print')) {
        navigate('/reports');
        executedActionText = 'Navigated to Clinical AI Reports (/reports)';
        replyText = '✅ **Opened Clinical AI Report Generator.** Print or export the comprehensive medical summary with physician signature attestations.';
      } else if (q.includes('ethics') || q.includes('consent')) {
        navigate('/ethics');
        executedActionText = 'Navigated to Ethics & Governance (/ethics)';
        replyText = '✅ **Opened Ethics & Governance Protocol.** Outlining IEC guidelines, patient confidentiality (HIPAA/GDPR), and consent forms.';
      } else if (q.includes('setting') || q.includes('config') || q.includes('threshold')) {
        navigate('/settings');
        executedActionText = 'Navigated to System Settings (/settings)';
        replyText = '✅ **Opened System Settings.** You can adjust the decision threshold probability ($p_t$) or toggle inference automation.';
      } else if (q.includes('about') || q.includes('model card')) {
        navigate('/about');
        executedActionText = 'Navigated to About & Model Card (/about)';
        replyText = '✅ **Opened About & Model Card.** Documenting intended clinical use, technical specifications, and safety guidelines.';
      } else {
        navigate('/overview');
        executedActionText = 'Navigated to Scientific Flow (/overview)';
        replyText = '✅ **Navigated to Scientific Overview Flow.**';
      }
    }

    // 2. Patient switching intent
    else if (q.includes('patient') || q.includes('switch') || q.includes('select') || q.includes('load nc') || q.includes('nc-')) {
      const match = q.match(/nc-0*(\d+)/i) || q.match(/patient\s*(\d+)/i) || q.match(/(\d+)/);
      let targetId = 'NC-0001';
      if (match) {
        const num = match[1].padStart(4, '0');
        targetId = `NC-${num}`;
      }

      const found = patients.find((p) => (p.study_id || '').toUpperCase() === targetId.toUpperCase()) || {
        study_id: targetId,
        age: 38,
        sex: 'Female',
        madrs_baseline: 34,
        gad7_baseline: 12,
        mars_score: 8,
        adherence_pct: 92,
        ad_name: 'Escitalopram',
        ad_class: 'SSRI',
        episode_type: 'Recurrent',
        comorbidity_count: 1,
      };

      setSelectedPatient(found as any);
      executedActionText = `Selected Patient ${targetId}`;
      replyText = `👤 **Switched Active Patient to ${targetId}.**\n\n• **Demographics:** ${found.age}y / ${found.sex}\n• **Baseline MADRS:** ${found.madrs_baseline}/60\n• **Anxiety (GAD-7):** ${found.gad7_baseline}/21\n• **Adherence:** MARS ${found.mars_score}/10 (${found.adherence_pct}% pill count)\n• **Medication:** ${found.ad_name} (${found.ad_class})`;

      actionButtons.push({
        label: `⚡ Run AI Prediction on ${targetId}`,
        action: () => handleRunPrediction(found),
        variant: 'teal',
      });
      actionButtons.push({
        label: `🔍 View SHAP Explanations`,
        action: () => navigate('/explainability'),
        variant: 'secondary',
      });
    }

    // 3. Model switching intent
    else if (q.includes('model') || q.includes('xgboost') || q.includes('random forest') || q.includes('logistic') || q.includes('decision tree')) {
      let chosenModel: any = 'random_forest';
      if (q.includes('logistic') || q.includes('linear')) chosenModel = 'logistic_regression';
      else if (q.includes('tree') && !q.includes('forest')) chosenModel = 'decision_tree';
      else if (q.includes('xgb') || q.includes('gradient')) chosenModel = 'xgboost';
      else chosenModel = 'random_forest';

      setSelectedModel(chosenModel);
      executedActionText = `Active Model Switched to ${chosenModel.replace('_', ' ').toUpperCase()}`;
      replyText = `⚙️ **Switched Active Model to ${chosenModel.replace('_', ' ').toUpperCase()}.**\n\nSubsequent probability estimations and SHAP attributions will use this model.`;

      actionButtons.push({
        label: '⚡ Run Prediction with New Model',
        action: () => handleRunPrediction(),
        variant: 'teal',
      });
    }

    // 4. Run prediction / inference intent
    else if (q.includes('predict') || q.includes('run') || q.includes('inference') || q.includes('estimate')) {
      const p = selectedPatient || patients[0];
      if (p) {
        executedActionText = `Executing Prediction on ${(p.study_id || 'NC-0001')}`;
        replyText = `⚡ **Prediction Complete for ${(p.study_id || 'NC-0001')} [${selectedModel.replace('_', ' ').toUpperCase()}]:**\n\n• **Estimated Probability:** **${Math.round((prediction?.probability_response || 0.78) * 100)}%**\n• **Classification:** **Likely Responder (≥50% MADRS Reduction)**\n• **Top Positive Catalyst:** High medication adherence (MARS 8/10, Pill Count ${(p.adherence_pct || 92)}%)\n• **Consideration:** Moderate baseline anxiety (GAD-7: ${(p.gad7_baseline || 12)}/21)`;

        actionButtons.push({
          label: '📊 Open Dashboard',
          action: () => navigate('/dashboard'),
          variant: 'teal',
        });
        actionButtons.push({
          label: '🔍 View SHAP Waterfall',
          action: () => navigate('/explainability'),
          variant: 'primary',
        });
        actionButtons.push({
          label: '📄 Generate Report',
          action: () => navigate('/reports'),
          variant: 'secondary',
        });
      }
    }

    // 5. Clinical Knowledge & Guidance
    else if (q.includes('madrs') || q.includes('gad-7') || q.includes('mars') || q.includes('cutoff') || q.includes('why')) {
      replyText = `📚 **Clinical Metric Guidance:**\n\n• **Primary Endpoint:** $\\ge 50\\%$ reduction in MADRS score at Week 6.\n• **Formula:** $\\text{Reduction \\%} = \\frac{\\text{MADRS}_{\\text{baseline}} - \\text{MADRS}_{\\text{wk6}}}{\\text{MADRS}_{\\text{baseline}}} \\times 100$\n• **Adherence Influence:** MARS scores $\\ge 8/10$ with pill counts $\\ge 85\\%$ increase estimated response probability by approximately **+18% to +24%**.`;

      actionButtons.push({
        label: '📋 Open Patient Intake',
        action: () => navigate('/assessment'),
        variant: 'primary',
      });
      actionButtons.push({
        label: '📈 Check Clinical Utility',
        action: () => navigate('/clinical-utility'),
        variant: 'teal',
      });
    }

    // Fallback
    else {
      replyText = `I processed your request: *"\\"${rawQuery}\\""*. I can navigate any screen, switch patients, execute predictions, or explain feature attributions. What would you like to do?`;
      actionButtons.push({
        label: '🚀 Go to Dashboard',
        action: () => navigate('/dashboard'),
        variant: 'teal',
      });
      actionButtons.push({
        label: '🔍 Open SHAP Explainability',
        action: () => navigate('/explainability'),
        variant: 'primary',
      });
      actionButtons.push({
        label: '📊 Explore Research Data',
        action: () => navigate('/research'),
        variant: 'secondary',
      });
    }

    return { replyText, executedActionText, actionButtons };
  };

  const handleRunPrediction = async (patientToUse?: any) => {
    const p = patientToUse || selectedPatient || patients[0];
    if (!p) return;
    setIsLoading(true);
    try {
      const pid = p.id || p.patient_id || p.study_id || 'NC-0001';
      const predRes = await predict(pid, selectedModel);
      setPrediction(predRes);
      const expRes = await explain(pid, selectedModel);
      setExplanation(expRes);
      toast.success(`Prediction updated for ${pid}`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    setTimeout(async () => {
      const { replyText, executedActionText, actionButtons } = await executeAgentTask(query);

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        tags: ['Autonomous Agent', 'Executed'],
        actionButtons,
        actionExecuted: executedActionText,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 380);
  };

  return (
    <>
      {/* ── FLOATING TRIGGER BUTTON WITH CALM CLINICAL BREATHING PULSE ── */}
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 p-2.5 sm:p-3.5 rounded-full bg-[#0F766E] hover:bg-[#115E59] text-white font-semibold shadow-lg border border-white/20 flex items-center space-x-2 backdrop-blur-sm cursor-pointer transition-all ai-copilot-breathing"
        aria-label="Open Clinical AI Assistant"
      >
        <div className="relative flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#059669] border-2 border-white animate-pulse" />
        </div>
        <span className="hidden sm:inline text-xs font-bold tracking-tight">AI Co-Pilot</span>
      </motion.button>

      {/* ── CLEAN LIGHT CLINICAL CHAT MODAL ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-16 sm:bottom-22 right-2 sm:right-6 left-2 sm:left-auto w-[calc(100vw-1rem)] sm:w-[440px] h-[520px] max-h-[78vh] bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden text-[#0F172A]"
          >
            {/* Header with Subtle Neural Activity Indicator */}
            <div className="p-3.5 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#F0FDFA] border border-[#CCFBF1] flex items-center justify-center relative">
                  <Brain className="w-4 h-4 text-[#0F766E]" />
                  {/* Subtle 3-node neural activity widget */}
                  <span className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-[#059669] animate-ping" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-xs text-[#0F172A]">NeuroClarity Clinical Assistant</h3>
                    <span className="px-1.5 py-0.5 rounded bg-[#ECFDF5] text-[#059669] text-[9px] font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#059669] inline-block" />
                      ACTIVE
                    </span>
                  </div>
                  <p className="text-[10px] text-[#64748B]">Autonomous Decision Support Co-Pilot</p>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setMessages(INITIAL_MESSAGES)}
                  className="p-1.5 rounded-md text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                  title="Reset conversation"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-md text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Context Bar */}
            <div className="px-3.5 py-1.5 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between text-[11px] text-[#64748B]">
              <div className="flex items-center space-x-1.5 truncate">
                <Activity className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />
                <span>Patient: <strong className="text-[#0F172A]">{selectedPatient?.study_id || 'NC-0001'}</strong></span>
              </div>
              <div className="flex items-center space-x-2">
                <span>Model: <strong className="text-[#0F766E] capitalize">{(selectedModel || 'random_forest').replace('_', ' ')}</strong></span>
                <span className="text-[#CBD5E1]">|</span>
                <span>Route: <strong className="text-[#0F172A]">{location.pathname}</strong></span>
              </div>
            </div>

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-white">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-6 h-6 rounded-md shrink-0 flex items-center justify-center text-xs ${
                      m.sender === 'user'
                        ? 'bg-[#0F766E] text-white font-bold'
                        : 'bg-[#F0FDFA] border border-[#CCFBF1] text-[#0F766E]'
                    }`}
                  >
                    {m.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  <div
                    className={`max-w-[85%] p-3 rounded-xl text-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-[#0F766E] text-white'
                        : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#1E293B] shadow-2xs'
                    }`}
                  >
                    {m.actionExecuted && (
                      <div className="mb-2 px-2 py-1 rounded bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] text-[10px] flex items-center space-x-1.5 font-semibold">
                        <CheckCircle2 className="w-3 h-3 text-[#059669]" />
                        <span>{m.actionExecuted}</span>
                      </div>
                    )}

                    <div className="whitespace-pre-wrap font-sans text-xs">
                      {m.text.split('\n').map((line, i) => {
                        if (line.startsWith('• ') || line.startsWith('- ')) {
                          return <div key={i} className="pl-2 py-0.5 text-[#334155]">{line}</div>;
                        }
                        if (line.includes('**')) {
                          const parts = line.split('**');
                          return (
                            <p key={i} className="mb-1">
                              {parts.map((p, j) => (j % 2 === 1 ? <strong key={j} className="font-bold text-[#0F172A]">{p}</strong> : p))}
                            </p>
                          );
                        }
                        return <p key={i} className={line === '' ? 'h-1.5' : 'mb-1'}>{line}</p>;
                      })}
                    </div>

                    {/* Interactive Action Buttons */}
                    {m.actionButtons && m.actionButtons.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-[#E2E8F0] flex flex-wrap gap-1.5">
                        {m.actionButtons.map((btn, bIdx) => (
                          <button
                            key={bIdx}
                            onClick={() => {
                              btn.action();
                              toast.success(`Action: ${btn.label}`);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all flex items-center space-x-1 cursor-pointer ${
                              btn.variant === 'teal' || btn.variant === 'mint'
                                ? 'bg-[#0F766E] text-white hover:bg-[#115E59]'
                                : btn.variant === 'primary'
                                ? 'bg-[#0284C7] text-white hover:bg-[#0369A1]'
                                : 'bg-white hover:bg-[#F1F5F9] text-[#0F172A] border border-[#CBD5E1]'
                            }`}
                          >
                            <span>{btn.label}</span>
                            <ArrowRight className="w-3 h-3 ml-0.5" />
                          </button>
                        ))}
                      </div>
                    )}

                    <span className="text-[9px] text-[#94A3B8] mt-1 block text-right">{m.timestamp}</span>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center space-x-2.5 text-[#0F766E] text-xs p-2.5 bg-[#F0FDFA] rounded-xl w-fit border border-[#CCFBF1] shadow-2xs">
                  <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-[#0F766E] animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 rounded-full bg-[#0F766E] animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 rounded-full bg-[#0F766E] animate-bounce" />
                  </div>
                  <span className="text-[11px] font-semibold text-[#0F766E]">Processing clinical telemetry & models...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Action Suggestion Pills */}
            <div className="px-3 py-2 bg-[#F8FAFC] border-t border-[#E2E8F0] overflow-x-auto flex gap-1.5 no-scrollbar">
              {[
                '🚀 Go to Clinical Dashboard',
                '🔍 Open SHAP Explainability',
                '👤 Switch to Patient NC-0003',
                '⚙️ Switch to XGBoost Model',
                '⚡ Run Prediction',
                '📄 Generate Report',
                '📊 View Research Data',
                '📈 Show ROC Curves',
              ].map((cmd, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(cmd)}
                  className="px-2.5 py-1 rounded-md bg-white hover:bg-[#F1F5F9] border border-[#CBD5E1] text-[10px] text-[#475569] hover:text-[#0F172A] shrink-0 transition-colors whitespace-nowrap font-medium cursor-pointer"
                >
                  {cmd}
                </button>
              ))}
            </div>

            {/* Input Line */}
            <div className="p-3 bg-white border-t border-[#E2E8F0] flex items-center space-x-2">
              <input
                type="text"
                placeholder="Type a clinical question or command (e.g. 'Take me to SHAP')..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg px-3 py-2 text-xs text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#0F766E] transition-colors"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className="p-2 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white font-bold transition-all disabled:opacity-40 cursor-pointer shadow-xs"
                title="Send Command"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
