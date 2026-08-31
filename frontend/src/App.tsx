import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { OverviewPage } from './pages/OverviewPage';
import { ClinicalDashboardPage } from './pages/ClinicalDashboardPage';
import { PatientAssessmentPage } from './pages/PatientAssessmentPage';
import { PredictionEnginePage } from './pages/PredictionEnginePage';
import { ExplainabilityPage } from './pages/ExplainabilityPage';
import { ModelLabPage } from './pages/ModelLabPage';
import { ValidationPage } from './pages/ValidationPage';
import { ClinicalUtilityPage } from './pages/ClinicalUtilityPage';
import { FollowUpPage } from './pages/FollowUpPage';
import { ResearchDataPage } from './pages/ResearchDataPage';
import { MethodologyPage } from './pages/MethodologyPage';
import { CRFPage } from './pages/CRFPage';
import { ReportsPage } from './pages/ReportsPage';
import { EthicsPage } from './pages/EthicsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AboutPage } from './pages/AboutPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ErrorBoundary } from './components/UI/ErrorBoundary';

export function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/overview" element={<OverviewPage />} />
        <Route path="/dashboard" element={<ClinicalDashboardPage />} />
        <Route path="/assessment" element={<PatientAssessmentPage />} />
        <Route path="/prediction" element={<PredictionEnginePage />} />
        <Route path="/explainability" element={<ExplainabilityPage />} />
        <Route path="/models" element={<ModelLabPage />} />
        <Route path="/validation" element={<ValidationPage />} />
        <Route path="/clinical-utility" element={<ClinicalUtilityPage />} />
        <Route path="/followup" element={<FollowUpPage />} />
        <Route path="/research" element={<ResearchDataPage />} />
        <Route path="/methodology" element={<MethodologyPage />} />
        <Route path="/crf" element={<CRFPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/ethics" element={<EthicsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
