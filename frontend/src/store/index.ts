import { create } from 'zustand';
import { Patient, PredictionResult, ExplainResult, ModelName, NotificationItem } from '../types';

interface AppState {
  selectedPatient: Patient | null;
  patients: Patient[];
  prediction: PredictionResult | null;
  explanation: ExplainResult | null;
  selectedModel: ModelName;
  isLoading: boolean;
  mobileMenuOpen: boolean;
  systemStatus: {
    modelsReady: boolean;
    dataReady: boolean;
    backendOnline: boolean;
  };
  notifications: NotificationItem[];

  setSelectedPatient: (patient: Patient | null) => void;
  setPatients: (patients: Patient[]) => void;
  setPrediction: (prediction: PredictionResult | null) => void;
  setExplanation: (explanation: ExplainResult | null) => void;
  setSelectedModel: (model: ModelName) => void;
  setIsLoading: (loading: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  setSystemStatus: (status: Partial<AppState['systemStatus']>) => void;
  addNotification: (message: string, type: NotificationItem['type']) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedPatient: null,
  patients: [],
  prediction: null,
  explanation: null,
  selectedModel: 'random_forest',
  isLoading: false,
  mobileMenuOpen: false,
  systemStatus: {
    modelsReady: true,
    dataReady: true,
    backendOnline: true,
  },
  notifications: [
    {
      id: '1',
      message: 'Clinical Registry initialized. Ready for patient intake and inference.',
      type: 'info',
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      id: '2',
      message: 'All 4 Machine Learning models initialized and ready for inference.',
      type: 'success',
      timestamp: new Date().toLocaleTimeString(),
    }
  ],

  setSelectedPatient: (patient) => set({ selectedPatient: patient }),
  setPatients: (patients) => set({ patients: Array.isArray(patients) ? patients : [] }),
  setPrediction: (prediction) => set({ prediction }),
  setExplanation: (explanation) => set({ explanation }),
  setSelectedModel: (selectedModel) => set({ selectedModel }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),
  setSystemStatus: (status) =>
    set((state) => ({ systemStatus: { ...state.systemStatus, ...status } })),
  addNotification: (message, type) =>
    set((state) => ({
      notifications: [
        {
          id: Math.random().toString(36).substring(2, 9),
          message,
          type,
          timestamp: new Date().toLocaleTimeString(),
        },
        ...state.notifications,
      ].slice(0, 10),
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  clearAll: () =>
    set({
      selectedPatient: null,
      prediction: null,
      explanation: null,
    }),
}));
