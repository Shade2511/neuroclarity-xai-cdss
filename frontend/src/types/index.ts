export interface Patient {
  id: string;
  patient_id: string;
  study_id: string;
  hospital_reg?: string;
  enrollment_date?: string;
  investigator?: string;
  department?: string;
  age: number;
  sex: string;
  bmi: number;
  education?: string;
  employment?: string;
  residence?: string;
  substance_use?: string;
  dep_duration_months?: number;
  episode_type?: string;
  num_prev_episodes?: number;
  family_history?: string;
  prev_hospitalization?: string;
  prev_suicide_attempt?: string;
  prev_treatment_response?: string;
  has_hypertension?: number;
  has_diabetes?: number;
  has_thyroid?: number;
  has_cardiovascular?: number;
  has_ckd?: number;
  has_liver?: number;
  has_asthma_copd?: number;
  has_epilepsy?: number;
  has_migraine?: number;
  comorbidity_count?: number;
  ad_name?: string;
  ad_class?: string;
  ad_dose_mg?: number;
  ad_frequency?: string;
  ad_duration_weeks?: number;
  madrs_baseline?: number;
  gad7_baseline?: number;
  mars_score?: number;
  tabs_dispensed?: number;
  tabs_remaining?: number;
  adherence_pct?: number;
  adr_occurred?: number;
  adr_severity?: string;
  naranjo_score?: number;
  naranjo_class?: string;
  notes?: string;
  is_demo?: boolean;
  demo?: boolean;
  created_at?: string;
  updated_at?: string;
  // Follow-up longitudinal outcomes
  madrs_week2?: number;
  madrs_week4?: number;
  madrs_week6?: number;
  gad7_week6?: number;
  mars_week6?: number;
  madrs_change?: number;
  madrs_reduction_pct?: number;
  response_class?: string;
  response_binary?: number;
}

export interface MedicationItem {
  id?: number;
  drug_name: string;
  drug_class: string;
  dose_mg: number;
  frequency?: string;
  duration_weeks?: number;
  is_primary_antidepressant?: boolean;
  status?: string;
}

export interface FollowUpItem {
  id?: number;
  visit_week: number;
  visit_date?: string;
  madrs_score: number;
  gad7_score: number;
  mars_score?: number;
  adherence_pct?: number;
  adr_status?: string;
  treatment_action?: string;
  clinician_notes?: string;
}

export interface ClinicalDecisionItem {
  id?: number;
  decision_type: string;
  decision_notes?: string;
  action_taken?: string;
  created_at?: string;
}

export interface AuditLogItem {
  id: number;
  user_id: string;
  action: string;
  details?: string;
  timestamp: string;
}

export interface PatientFullRecord {
  patient: Patient;
  medications: MedicationItem[];
  assessments: Assessment[];
  follow_ups: FollowUpItem[];
  predictions: any[];
  decisions: ClinicalDecisionItem[];
  audit_logs: AuditLogItem[];
}

export interface PredictionResult {
  id?: string;
  patient_id: string;
  model: string;
  model_version?: string;
  probability_response: number;
  probability_partial: number;
  probability_nonresponse: number;
  classification: string;
  label: string;
  demo_mode?: boolean;
  disclaimer: string;
  timestamp: string;
  explanation_available?: boolean;
}

export interface ShapContribution {
  feature: string;
  label: string;
  value: number;
  shap_value: number;
  direction: 'positive' | 'negative';
}

export interface ShapLocal {
  base_value: number;
  contributions: ShapContribution[];
  total_shap: number;
}

export interface LimeContribution {
  feature_desc: string;
  weight: number;
  direction: 'positive' | 'negative';
}

export interface LimeLocal {
  contributions: LimeContribution[];
  local_prediction: number[];
}

export interface ClinicalExplanation {
  label: string;
  direction: 'positive' | 'negative';
  clinical_text: string;
  shap_value: number;
}

export interface ExplainResult {
  patient_id: string;
  model: string;
  shap_local: ShapLocal | null;
  lime_local: LimeLocal | null;
  clinical_explanations: ClinicalExplanation[];
  shap_global: Array<{ feature: string; label: string; importance: number }> | null;
  demo_mode?: boolean;
  timestamp: string;
}

export interface ModelPerformance {
  auc: number;
  sensitivity: number;
  specificity: number;
  ppv: number;
  npv: number;
  brier_score: number;
  fpr?: number[];
  tpr?: number[];
  calibration_frac_pos?: number[];
  calibration_mean_pred?: number[];
}

export interface ModelInfo {
  name: string;
  version?: string;
  type: string;
  purpose: string;
  strengths: string[];
  limitations: string[];
  explainability: string;
  library: string;
  available: boolean;
}

export interface Assessment {
  id?: number;
  patient_id: string;
  week: number;
  assessment_date?: string;
  madrs_total?: number;
  gad7_total?: number;
  mars_score?: number;
  adherence_pct?: number;
  adr_occurred?: number;
  adr_description?: string;
  adr_severity?: string;
  naranjo_score?: number;
  clinical_notes?: string;
  created_at?: string;
}

export interface DCAPoint {
  threshold: number;
  model: number;
  treat_all: number;
  treat_none: number;
}

export interface NotificationItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  timestamp: string;
}

export type ModelName = 'logistic_regression' | 'decision_tree' | 'random_forest' | 'xgboost';
export type ResponseClass = 'Responder' | 'Partial Responder' | 'Non-Responder';
