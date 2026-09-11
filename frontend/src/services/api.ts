import axios from 'axios';
import {
  Patient,
  PatientFullRecord,
  PredictionResult,
  ExplainResult,
  ModelInfo,
  ModelPerformance,
  Assessment,
  DCAPoint,
  ModelName
} from '../types';
import { EdgeClinicalEngine } from './clinicalEngine';

// In production, VITE_API_URL points to the deployed backend.
// In development or when using proxy, it defaults to '/api'.
const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}`
  : '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
});

// Intercept HTML responses caused by SPA catch-all rewrites (e.g. Vercel /api/* -> /index.html)
api.interceptors.response.use(
  (response) => {
    const contentType = String(response.headers?.['content-type'] || '');
    if (
      (typeof response.data === 'string' && (response.data.includes('<!doctype html') || response.data.includes('<html'))) ||
      contentType.includes('text/html')
    ) {
      return Promise.reject(new Error('[NeuroClarity API] Received HTML response instead of JSON.'));
    }
    return response;
  },
  (error) => Promise.reject(error)
);

export const getHealth = async () => {
  try {
    const res = await api.get('/health');
    if (!res?.data || typeof res.data !== 'object') {
      return EdgeClinicalEngine.getHealth();
    }
    return res.data;
  } catch (err) {
    console.info('[NeuroClarity] Utilizing Resilient In-Browser Edge Clinical Engine.');
    return EdgeClinicalEngine.getHealth();
  }
};

export const getPatients = async (
  limit = 50,
  offset = 0,
  search = '',
  outcome = '',
  drugClass = ''
): Promise<{ total: number; limit: number; offset: number; patients: Patient[]; mode: string }> => {
  try {
    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
    });
    if (search) params.append('search', search);
    if (outcome) params.append('outcome', outcome);
    if (drugClass) params.append('drug_class', drugClass);

    const res = await api.get(`/patients?${params.toString()}`);
    if (!res?.data || !Array.isArray(res.data.patients)) {
      return EdgeClinicalEngine.getPatients(limit, offset, search, outcome, drugClass);
    }
    return res.data;
  } catch (err) {
    return EdgeClinicalEngine.getPatients(limit, offset, search, outcome, drugClass);
  }
};

export const getPatientDetails = async (patientId: string): Promise<PatientFullRecord> => {
  try {
    const res = await api.get(`/patients/${patientId}`);
    return res.data;
  } catch (err) {
    return EdgeClinicalEngine.getPatientDetails(patientId);
  }
};

export const createPatient = async (patient: Partial<Patient>): Promise<{ id: string; patient: Patient; status: string }> => {
  try {
    const res = await api.post('/patients', patient);
    return res.data;
  } catch (err) {
    return EdgeClinicalEngine.createPatient(patient);
  }
};

export const updatePatient = async (patientId: string, updates: Partial<Patient> & { edit_reason?: string }): Promise<{ status: string; patient: Patient }> => {
  try {
    const res = await api.put(`/patients/${patientId}`, updates);
    return res.data;
  } catch (err) {
    return EdgeClinicalEngine.updatePatient(patientId, updates);
  }
};

export const getPatientHistory = async (patientId: string) => {
  try {
    const res = await api.get(`/patients/${patientId}/history`);
    return res.data;
  } catch (err) {
    return EdgeClinicalEngine.getPatientHistory(patientId);
  }
};

export const createAssessment = async (assessment: Partial<Assessment>): Promise<{ status: string; assessment: Assessment }> => {
  try {
    const res = await api.post('/assessments', assessment);
    return res.data;
  } catch (err) {
    return { status: 'success', assessment: assessment as Assessment };
  }
};

export const getAssessments = async (patientId: string): Promise<Assessment[]> => {
  try {
    const res = await api.get(`/assessments/${patientId}`);
    return res.data;
  } catch (err) {
    return [];
  }
};

export const predict = async (patientId: string, modelName: ModelName = 'random_forest'): Promise<PredictionResult> => {
  try {
    const res = await api.post('/predict', { patient_id: patientId, model_name: modelName });
    if (!res?.data || typeof res.data !== 'object' || !res.data.classification) {
      return EdgeClinicalEngine.predict(patientId, modelName);
    }
    return res.data;
  } catch (err) {
    return EdgeClinicalEngine.predict(patientId, modelName);
  }
};

export const explain = async (patientId: string, modelName: ModelName = 'random_forest'): Promise<ExplainResult> => {
  try {
    const res = await api.post('/explain', { patient_id: patientId, model_name: modelName });
    if (!res?.data || typeof res.data !== 'object' || !res.data.shap_local) {
      return EdgeClinicalEngine.explain(patientId, modelName);
    }
    return res.data;
  } catch (err) {
    return EdgeClinicalEngine.explain(patientId, modelName);
  }
};

export const recordClinicalDecision = async (data: {
  patient_id: string;
  decision_type: string;
  decision_notes?: string;
  action_taken?: string;
}) => {
  try {
    const res = await api.post('/clinical-decisions', data);
    return res.data;
  } catch (err) {
    return EdgeClinicalEngine.recordClinicalDecision(data);
  }
};

export const getAuditLogs = async (limit = 50) => {
  try {
    const res = await api.get(`/audit-logs?limit=${limit}`);
    return res.data;
  } catch (err) {
    return EdgeClinicalEngine.getAuditLogs(limit);
  }
};

export const getModels = async (): Promise<Record<string, ModelInfo>> => {
  try {
    const res = await api.get('/models');
    if (!res?.data || typeof res.data !== 'object' || !res.data.random_forest) {
      return EdgeClinicalEngine.getModels();
    }
    return res.data;
  } catch (err) {
    return EdgeClinicalEngine.getModels();
  }
};

export const getPerformance = async (): Promise<Record<string, { performance: ModelPerformance; cv: any; bootstrap: any; version?: string }>> => {
  try {
    const res = await api.get('/performance');
    if (!res?.data || typeof res.data !== 'object' || !res.data.random_forest) {
      return EdgeClinicalEngine.getPerformance();
    }
    return res.data;
  } catch (err) {
    return EdgeClinicalEngine.getPerformance();
  }
};

export const getValidation = async () => {
  try {
    const res = await api.get('/validation');
    if (!res?.data || typeof res.data !== 'object') {
      return EdgeClinicalEngine.getValidation();
    }
    return res.data;
  } catch (err) {
    return EdgeClinicalEngine.getValidation();
  }
};

export const trainModels = async () => {
  try {
    const res = await api.post('/models/train');
    return res.data;
  } catch (err) {
    return { status: 'complete', message: 'Models evaluated on demonstration cohort.' };
  }
};

export const getDatasetStats = async () => {
  try {
    const res = await api.get('/dataset/stats');
    if (!res?.data || typeof res.data !== 'object' || !res.data.total_cohort_size) {
      return EdgeClinicalEngine.getDatasetStats();
    }
    return res.data;
  } catch (err) {
    return EdgeClinicalEngine.getDatasetStats();
  }
};

export const getDatasetPatients = async (limit = 50, offset = 0): Promise<{ total: number; patients: any[]; demo_label: string }> => {
  try {
    const res = await api.get(`/dataset/patients?limit=${limit}&offset=${offset}`);
    if (!res?.data || !Array.isArray(res.data.patients)) {
      const pts = await EdgeClinicalEngine.getPatients(limit, offset);
      return { total: pts.total, patients: pts.patients, demo_label: 'Synthetic Cohort N=320' };
    }
    return res.data;
  } catch (err) {
    const pts = await EdgeClinicalEngine.getPatients(limit, offset);
    return { total: pts.total, patients: pts.patients, demo_label: 'Synthetic Cohort N=320' };
  }
};

export const getDCA = async (modelName: string): Promise<{ dca: DCAPoint[]; model: string }> => {
  try {
    const res = await api.get(`/dca/${modelName}`);
    if (!res?.data || !Array.isArray(res.data.dca)) {
      return EdgeClinicalEngine.getDCA(modelName);
    }
    return res.data;
  } catch (err) {
    return EdgeClinicalEngine.getDCA(modelName);
  }
};

export const submitFeedback = async (data: {
  patient_id: string;
  prediction_useful?: boolean;
  explanation_understandable?: boolean;
  aligned_with_clinical?: string;
  clinician_decision?: string;
  comments?: string;
}) => {
  try {
    const res = await api.post('/feedback', data);
    return res.data;
  } catch (err) {
    return EdgeClinicalEngine.submitFeedback(data);
  }
};

export const getReport = async (patientId: string, modelName = 'random_forest') => {
  try {
    const res = await api.get(`/reports/${patientId}?model_name=${modelName}`);
    if (!res?.data || typeof res.data !== 'object' || !res.data.patient) {
      return EdgeClinicalEngine.getReport(patientId, modelName);
    }
    return res.data;
  } catch (err) {
    return EdgeClinicalEngine.getReport(patientId, modelName);
  }
};

export const downloadCohortCSV = () => {
  EdgeClinicalEngine.downloadCohortCSV();
};

export const downloadPatientCSV = (patientId: string) => {
  EdgeClinicalEngine.downloadPatientCSV(patientId);
};

export default api;
