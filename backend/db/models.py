"""
NeuroClarity XAI-CDSS — Relational Database Models (SQLAlchemy)
Normalized clinical schema with proper foreign keys, constraints, and timestamps.
"""
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey, Index, JSON
)
from sqlalchemy.orm import relationship
from .database import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(String(64), primary_key=True, index=True)
    study_id = Column(String(64), unique=True, index=True, nullable=False)
    hospital_reg = Column(String(64), index=True, nullable=True)
    enrollment_date = Column(String(32), nullable=True)
    investigator = Column(String(128), default="Dr. Clinical Lead, MD")
    department = Column(String(128), default="Department of Psychiatry")

    # Demographics
    age = Column(Integer, nullable=False)
    sex = Column(String(16), nullable=False)
    bmi = Column(Float, nullable=False)
    education = Column(String(32), default="Graduate")
    employment = Column(String(32), default="Employed")
    occupation = Column(String(64), nullable=True)
    residence = Column(String(32), default="Urban")
    substance_use = Column(String(32), default="None")

    # Psychiatric History
    dep_duration_months = Column(Integer, default=12)
    episode_type = Column(String(32), default="First")
    num_prev_episodes = Column(Integer, default=0)
    family_history = Column(String(16), default="No")
    prev_hospitalization = Column(String(16), default="No")
    prev_suicide_attempt = Column(String(16), default="No")
    prev_treatment_response = Column(String(64), default="No prior treatment")

    # Comorbidities (0 or 1)
    has_hypertension = Column(Integer, default=0)
    has_diabetes = Column(Integer, default=0)
    has_thyroid = Column(Integer, default=0)
    has_cardiovascular = Column(Integer, default=0)
    has_ckd = Column(Integer, default=0)
    has_liver = Column(Integer, default=0)
    has_asthma_copd = Column(Integer, default=0)
    has_epilepsy = Column(Integer, default=0)
    has_migraine = Column(Integer, default=0)
    comorbidity_count = Column(Integer, default=0)

    # Current Medication
    ad_name = Column(String(64), default="Escitalopram")
    ad_class = Column(String(32), default="SSRI")
    ad_dose_mg = Column(Float, default=10.0)
    ad_frequency = Column(String(32), default="Once daily")
    ad_duration_weeks = Column(Integer, default=4)

    # Baseline Assessments
    madrs_baseline = Column(Float, default=30.0)
    gad7_baseline = Column(Float, default=10.0)
    mars_score = Column(Float, default=7.0)
    tabs_dispensed = Column(Integer, default=60)
    tabs_remaining = Column(Integer, default=5)
    adherence_pct = Column(Float, default=91.7)

    # Adverse Drug Reactions
    adr_occurred = Column(Integer, default=0)
    adr_severity = Column(String(32), default="None")
    naranjo_score = Column(Integer, default=0)
    naranjo_class = Column(String(32), default="Doubtful")

    # Longitudinal Endpoint Results (from study record)
    madrs_week2 = Column(Float, nullable=True)
    madrs_week4 = Column(Float, nullable=True)
    madrs_week6 = Column(Float, nullable=True)
    gad7_week6 = Column(Float, nullable=True)
    madrs_change = Column(Float, nullable=True)
    madrs_reduction_pct = Column(Float, nullable=True)
    response_binary = Column(Integer, default=1)
    response_class = Column(String(32), default="Responder")

    # Metadata
    is_demo = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    assessments = relationship("ClinicalAssessment", back_populates="patient", cascade="all, delete-orphan")
    medications = relationship("MedicationRecord", back_populates="patient", cascade="all, delete-orphan")
    predictions = relationship("Prediction", back_populates="patient", cascade="all, delete-orphan")
    follow_ups = relationship("FollowUpRecord", back_populates="patient", cascade="all, delete-orphan")
    decisions = relationship("ClinicalDecision", back_populates="patient", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="patient", cascade="all, delete-orphan")


class ClinicalAssessment(Base):
    __tablename__ = "clinical_assessments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    patient_id = Column(String(64), ForeignKey("patients.id", ondelete="CASCADE"), index=True, nullable=False)
    week = Column(Integer, nullable=False) # 0, 2, 4, 6
    assessment_date = Column(String(32), nullable=True)

    madrs_total = Column(Float, nullable=True)
    gad7_total = Column(Float, nullable=True)
    mars_score = Column(Float, nullable=True)
    adherence_pct = Column(Float, nullable=True)

    adr_occurred = Column(Integer, default=0)
    adr_description = Column(String(256), nullable=True)
    adr_severity = Column(String(32), nullable=True)
    naranjo_score = Column(Integer, nullable=True)

    clinical_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    patient = relationship("Patient", back_populates="assessments")


class MedicationRecord(Base):
    __tablename__ = "medication_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    patient_id = Column(String(64), ForeignKey("patients.id", ondelete="CASCADE"), index=True, nullable=False)
    drug_name = Column(String(64), nullable=False)
    drug_class = Column(String(32), nullable=False)
    dose_mg = Column(Float, nullable=False)
    frequency = Column(String(32), default="Once daily")
    start_date = Column(String(32), nullable=True)
    duration_weeks = Column(Integer, default=4)
    is_primary_antidepressant = Column(Boolean, default=True)
    indication = Column(String(64), default="Major Depressive Disorder")
    status = Column(String(32), default="Active")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    patient = relationship("Patient", back_populates="medications")


class FollowUpRecord(Base):
    __tablename__ = "follow_up_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    patient_id = Column(String(64), ForeignKey("patients.id", ondelete="CASCADE"), index=True, nullable=False)
    visit_week = Column(Integer, nullable=False) # 0, 2, 4, 6
    visit_date = Column(String(32), nullable=True)
    madrs_score = Column(Float, nullable=False)
    gad7_score = Column(Float, nullable=False)
    mars_score = Column(Float, nullable=True)
    adherence_pct = Column(Float, nullable=True)
    adr_status = Column(String(64), default="None")
    treatment_action = Column(String(64), default="Dose Maintained")
    clinician_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    patient = relationship("Patient", back_populates="follow_ups")


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(String(64), primary_key=True, index=True)
    patient_id = Column(String(64), ForeignKey("patients.id", ondelete="CASCADE"), index=True, nullable=False)
    model_name = Column(String(64), nullable=False)
    model_version = Column(String(32), default="v1.0")

    probability_response = Column(Float, nullable=False)
    probability_partial = Column(Float, nullable=False)
    probability_nonresponse = Column(Float, nullable=False)
    classification = Column(String(32), nullable=False)
    label = Column(String(64), nullable=False)

    features_snapshot = Column(JSON, nullable=True)
    is_demo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    patient = relationship("Patient", back_populates="predictions")
    explanation = relationship("XAIExplanation", back_populates="prediction", uselist=False, cascade="all, delete-orphan")


class XAIExplanation(Base):
    __tablename__ = "xai_explanations"

    id = Column(String(64), primary_key=True, index=True)
    prediction_id = Column(String(64), ForeignKey("predictions.id", ondelete="CASCADE"), index=True, nullable=False)
    patient_id = Column(String(64), index=True, nullable=False)
    model_name = Column(String(64), nullable=False)

    shap_local = Column(JSON, nullable=True)
    lime_local = Column(JSON, nullable=True)
    clinical_explanations = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    prediction = relationship("Prediction", back_populates="explanation")


class ClinicalDecision(Base):
    __tablename__ = "clinical_decisions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    patient_id = Column(String(64), ForeignKey("patients.id", ondelete="CASCADE"), index=True, nullable=False)
    clinician_id = Column(String(64), default="Dr. Lead Psychiatrist, MD")
    decision_type = Column(String(64), nullable=False) # 'Agree', 'Partially Agree', 'Disagree', etc.
    decision_notes = Column(Text, nullable=True)
    action_taken = Column(String(128), default="Maintain current regimen with 2-week follow-up")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    patient = relationship("Patient", back_populates="decisions")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    patient_id = Column(String(64), ForeignKey("patients.id", ondelete="SET NULL"), index=True, nullable=True)
    user_id = Column(String(64), default="Dr. Clinical Lead (Psychiatrist)")
    action = Column(String(64), nullable=False) # 'VIEW_PATIENT', 'EDIT_PATIENT', 'GENERATE_PREDICTION', 'DOC_DECISION', etc.
    details = Column(Text, nullable=True)
    ip_address = Column(String(64), default="127.0.0.1")
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

    patient = relationship("Patient", back_populates="audit_logs")


class ModelPerformanceRecord(Base):
    __tablename__ = "model_performance_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    model_name = Column(String(64), unique=True, nullable=False)
    version = Column(String(32), default="v1.0")
    dataset_version = Column(String(32), default="Synthetic N=320 v1.0")
    auc = Column(Float, nullable=False)
    sensitivity = Column(Float, nullable=False)
    specificity = Column(Float, nullable=False)
    ppv = Column(Float, nullable=False)
    npv = Column(Float, nullable=False)
    brier_score = Column(Float, nullable=False)
    bootstrap_auc_mean = Column(Float, nullable=True)
    bootstrap_auc_ci_lower = Column(Float, nullable=True)
    bootstrap_auc_ci_upper = Column(Float, nullable=True)
    evaluation_date = Column(DateTime, default=datetime.utcnow, nullable=False)
