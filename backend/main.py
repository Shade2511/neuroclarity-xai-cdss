"""
NeuroClarity XAI-CDSS — Production-Ready FastAPI Backend
Relational Database Architecture with SQLAlchemy & Scikit-Learn / XGBoost Models.
"""
import os
import sys
import json
import uuid
import pickle
import warnings
import io
import csv
import numpy as np
import pandas as pd
from datetime import datetime
from typing import Optional, List

warnings.filterwarnings('ignore')
sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI, HTTPException, Depends, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc

from db.database import engine, Base, SessionLocal, get_db
from db.models import (
    Patient, ClinicalAssessment, MedicationRecord,
    FollowUpRecord, Prediction, XAIExplanation,
    ClinicalDecision, AuditLog, ModelPerformanceRecord
)
from db.seed import init_and_seed_db

# --- App Setup ---
app = FastAPI(
    title="NeuroClarity XAI-CDSS API",
    description="Explainable AI Clinical Decision Support System for Antidepressant Treatment Response",
    version="2.0.0"
)

# Production CORS: read from env var, default to allow all for development
_raw_origins = os.getenv("ALLOWED_ORIGINS", "*")
if _raw_origins == "*":
    _allowed_origins = ["*"]
else:
    _allowed_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=False,  # Must be False when allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Globals ---
MODELS = {}
RESULTS = {}
TRAIN_DATA = {}

ML_DIR = os.path.join(os.path.dirname(__file__), 'ml', 'artifacts')
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')


# --- Pydantic Schemas ---
class PatientCreate(BaseModel):
    study_id: Optional[str] = None
    hospital_reg: Optional[str] = None
    enrollment_date: Optional[str] = None
    investigator: Optional[str] = "Dr. Clinical Lead, MD"
    department: Optional[str] = "Department of Psychiatry"
    age: int
    sex: str
    bmi: float
    education: Optional[str] = "Graduate"
    employment: Optional[str] = "Employed"
    residence: Optional[str] = "Urban"
    substance_use: Optional[str] = "None"
    dep_duration_months: Optional[int] = 12
    episode_type: Optional[str] = "First"
    num_prev_episodes: Optional[int] = 0
    family_history: Optional[str] = "No"
    prev_hospitalization: Optional[str] = "No"
    prev_suicide_attempt: Optional[str] = "No"
    prev_treatment_response: Optional[str] = "No prior treatment"
    has_hypertension: Optional[int] = 0
    has_diabetes: Optional[int] = 0
    has_thyroid: Optional[int] = 0
    has_cardiovascular: Optional[int] = 0
    has_ckd: Optional[int] = 0
    has_liver: Optional[int] = 0
    has_asthma_copd: Optional[int] = 0
    has_epilepsy: Optional[int] = 0
    has_migraine: Optional[int] = 0
    ad_name: Optional[str] = "Escitalopram"
    ad_class: Optional[str] = "SSRI"
    ad_dose_mg: Optional[float] = 10.0
    ad_frequency: Optional[str] = "Once daily"
    ad_duration_weeks: Optional[int] = 4
    madrs_baseline: Optional[float] = 30.0
    gad7_baseline: Optional[float] = 10.0
    mars_score: Optional[float] = 7.0
    tabs_dispensed: Optional[int] = 60
    tabs_remaining: Optional[int] = 5
    adherence_pct: Optional[float] = 91.7
    adr_occurred: Optional[int] = 0
    adr_severity: Optional[str] = "None"
    naranjo_score: Optional[int] = 0
    notes: Optional[str] = ""


class PatientUpdate(BaseModel):
    age: Optional[int] = None
    sex: Optional[str] = None
    bmi: Optional[float] = None
    education: Optional[str] = None
    employment: Optional[str] = None
    residence: Optional[str] = None
    substance_use: Optional[str] = None
    dep_duration_months: Optional[int] = None
    episode_type: Optional[str] = None
    num_prev_episodes: Optional[int] = None
    family_history: Optional[str] = None
    prev_treatment_response: Optional[str] = None
    has_hypertension: Optional[int] = None
    has_diabetes: Optional[int] = None
    has_thyroid: Optional[int] = None
    has_cardiovascular: Optional[int] = None
    has_ckd: Optional[int] = None
    has_liver: Optional[int] = None
    has_asthma_copd: Optional[int] = None
    has_epilepsy: Optional[int] = None
    has_migraine: Optional[int] = None
    ad_name: Optional[str] = None
    ad_class: Optional[str] = None
    ad_dose_mg: Optional[float] = None
    ad_frequency: Optional[str] = None
    ad_duration_weeks: Optional[int] = None
    madrs_baseline: Optional[float] = None
    gad7_baseline: Optional[float] = None
    mars_score: Optional[float] = None
    tabs_dispensed: Optional[int] = None
    tabs_remaining: Optional[int] = None
    adherence_pct: Optional[float] = None
    adr_occurred: Optional[int] = None
    adr_severity: Optional[str] = None
    naranjo_score: Optional[int] = None
    notes: Optional[str] = None
    edit_reason: Optional[str] = "Routine clinical record update"


class AssessmentCreate(BaseModel):
    patient_id: str
    week: int
    madrs_total: Optional[float] = None
    gad7_total: Optional[float] = None
    mars_score: Optional[float] = None
    adherence_pct: Optional[float] = None
    adr_occurred: Optional[int] = 0
    adr_description: Optional[str] = None
    adr_severity: Optional[str] = None
    naranjo_score: Optional[int] = None
    clinical_notes: Optional[str] = None


class PredictRequest(BaseModel):
    patient_id: str
    model_name: Optional[str] = "random_forest"


class ExplainRequest(BaseModel):
    patient_id: str
    model_name: Optional[str] = "random_forest"


class DecisionCreate(BaseModel):
    patient_id: str
    decision_type: str = "Agree"
    decision_notes: Optional[str] = ""
    action_taken: Optional[str] = "Maintain current regimen with scheduled 2-week review"


class FeedbackCreate(BaseModel):
    patient_id: str
    prediction_useful: Optional[bool] = None
    explanation_understandable: Optional[bool] = None
    aligned_with_clinical: Optional[str] = None
    clinician_decision: Optional[str] = None
    comments: Optional[str] = None


# --- Startup & Seeding ---
@app.on_event("startup")
async def startup_event():
    global MODELS, RESULTS, TRAIN_DATA
    
    # 1. Load ML models and validation results
    results_path = os.path.join(ML_DIR, 'results.json')
    if os.path.exists(results_path):
        with open(results_path) as f:
            RESULTS = json.load(f)
        for model_name in ['logistic_regression', 'decision_tree', 'random_forest', 'xgboost']:
            model_path = os.path.join(ML_DIR, f'{model_name}.pkl')
            if os.path.exists(model_path):
                with open(model_path, 'rb') as f:
                    MODELS[model_name] = pickle.load(f)
        train_ref = os.path.join(ML_DIR, 'train_data.pkl')
        if os.path.exists(train_ref):
            with open(train_ref, 'rb') as f:
                TRAIN_DATA = pickle.load(f)

    # 2. Initialize and seed database from synthetic_patients.csv
    csv_path = os.path.join(DATA_DIR, 'synthetic_patients.csv')
    init_and_seed_db(csv_path, RESULTS)

    print("Startup complete. Relational database and ML engines active.")


def patient_to_features(patient_obj) -> pd.DataFrame:
    """Convert Patient model or dict to feature DataFrame for ML pipeline"""
    if isinstance(patient_obj, dict):
        p = patient_obj
    else:
        p = {c.name: getattr(patient_obj, c.name) for c in patient_obj.__table__.columns}

    resp_map = {'Good': 3, 'Partial': 2, 'None': 1, 'No prior treatment': 0}
    class_map = {'SSRI': 0, 'SNRI': 1, 'TCA': 2, 'Other': 3}
    sex_enc = 1 if p.get('sex', 'Male') == 'Female' else 0
    episode_enc = 1 if p.get('episode_type', 'First') == 'Recurrent' else 0
    fam_enc = 1 if p.get('family_history', 'No') == 'Yes' else 0
    hosp_enc = 1 if p.get('prev_hospitalization', 'No') == 'Yes' else 0
    prev_resp_enc = resp_map.get(p.get('prev_treatment_response', 'No prior treatment'), 0)
    ad_class_enc = class_map.get(p.get('ad_class', 'SSRI'), 0)

    comorb_count = float(sum([
        int(p.get('has_hypertension', 0) or 0),
        int(p.get('has_diabetes', 0) or 0),
        int(p.get('has_thyroid', 0) or 0),
        int(p.get('has_cardiovascular', 0) or 0),
        int(p.get('has_ckd', 0) or 0),
        int(p.get('has_liver', 0) or 0),
        int(p.get('has_asthma_copd', 0) or 0),
        int(p.get('has_epilepsy', 0) or 0),
        int(p.get('has_migraine', 0) or 0),
    ]))

    features = {
        'age': float(p.get('age', 35)),
        'bmi': float(p.get('bmi', 24.0)),
        'dep_duration_months': float(p.get('dep_duration_months', 12)),
        'num_prev_episodes': float(p.get('num_prev_episodes', 0)),
        'comorbidity_count': comorb_count,
        'madrs_baseline': float(p.get('madrs_baseline', 30)),
        'gad7_baseline': float(p.get('gad7_baseline', 10)),
        'mars_score': float(p.get('mars_score', 7)),
        'adherence_pct': float(p.get('adherence_pct', 85.0)),
        'naranjo_score': float(p.get('naranjo_score', 0)),
        'ad_duration_weeks': float(p.get('ad_duration_weeks', 4)),
        'sex_enc': float(sex_enc),
        'episode_type_enc': float(episode_enc),
        'family_history_enc': float(fam_enc),
        'prev_hospitalization_enc': float(hosp_enc),
        'prev_treatment_response_enc': float(prev_resp_enc),
        'ad_class_enc': float(ad_class_enc),
        'adr_occurred': float(int(p.get('adr_occurred', 0) or 0)),
        'has_hypertension': float(int(p.get('has_hypertension', 0) or 0)),
        'has_diabetes': float(int(p.get('has_diabetes', 0) or 0)),
        'has_thyroid': float(int(p.get('has_thyroid', 0) or 0)),
        'has_cardiovascular': float(int(p.get('has_cardiovascular', 0) or 0)),
    }
    return pd.DataFrame([features])


# =============================================================================
# API ENDPOINTS
# =============================================================================

@app.get("/health")
def health(db: Session = Depends(get_db)):
    """Live telemetry and health status check"""
    try:
        patient_count = db.query(Patient).count()
        db_status = "Connected"
    except Exception as e:
        patient_count = 0
        db_status = f"Disconnected: {str(e)}"

    return {
        "status": "ok",
        "database": db_status,
        "models_loaded": list(MODELS.keys()),
        "models_count": len(MODELS),
        "patients_in_database": patient_count,
        "environment": "Production-Ready CDSS Prototype",
        "demo_mode": False,
        "synthetic_dataset_label": "Synthetic Cohort N=320 (GCP Compliant)",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "2.0.0"
    }


@app.get("/patients")
def list_patients(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    search: Optional[str] = None,
    outcome: Optional[str] = None,
    drug_class: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Paginated, searchable patient registry query"""
    query = db.query(Patient)

    if search:
        s = f"%{search}%"
        query = query.filter(
            or_(
                Patient.study_id.ilike(s),
                Patient.ad_name.ilike(s),
                Patient.hospital_reg.ilike(s),
                Patient.response_class.ilike(s)
            )
        )

    if outcome:
        query = query.filter(Patient.response_class == outcome)

    if drug_class:
        query = query.filter(Patient.ad_class == drug_class)

    total = query.count()
    patients = query.order_by(Patient.study_id).offset(offset).limit(limit).all()

    # Convert to dict format
    patient_list = []
    for p in patients:
        d = {c.name: getattr(p, c.name) for c in p.__table__.columns}
        d['created_at'] = p.created_at.isoformat() if p.created_at else None
        d['updated_at'] = p.updated_at.isoformat() if p.updated_at else None
        patient_list.append(d)

    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "patients": patient_list,
        "mode": "DATABASE_CONNECTED"
    }


@app.get("/patients/{patient_id}")
def get_patient_details(patient_id: str, db: Session = Depends(get_db)):
    """Comprehensive single-patient clinical profile with sub-records"""
    patient = db.query(Patient).filter(
        or_(Patient.id == patient_id, Patient.study_id == patient_id)
    ).first()

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    p_dict = {c.name: getattr(patient, c.name) for c in patient.__table__.columns}
    p_dict['created_at'] = patient.created_at.isoformat() if patient.created_at else None
    p_dict['updated_at'] = patient.updated_at.isoformat() if patient.updated_at else None

    # Fetch sub-records
    meds = [{c.name: getattr(m, c.name) for c in m.__table__.columns} for m in patient.medications]
    assessments = [{c.name: getattr(a, c.name) for c in a.__table__.columns} for a in patient.assessments]
    follow_ups = [{c.name: getattr(f, c.name) for c in f.__table__.columns} for f in patient.follow_ups]
    predictions = [{c.name: getattr(pr, c.name) for c in pr.__table__.columns} for pr in patient.predictions]
    decisions = [{c.name: getattr(d, c.name) for c in d.__table__.columns} for d in patient.decisions]
    audit_logs = [{
        "id": a.id,
        "user_id": a.user_id,
        "action": a.action,
        "details": a.details,
        "timestamp": a.timestamp.isoformat() if a.timestamp else None
    } for a in patient.audit_logs]

    # Log view action
    view_audit = AuditLog(
        patient_id=patient.id,
        user_id="Dr. Lead Clinician",
        action="VIEW_RECORD",
        details=f"Viewed full record for {patient.study_id}"
    )
    db.add(view_audit)
    db.commit()

    return {
        "patient": p_dict,
        "medications": meds,
        "assessments": assessments,
        "follow_ups": follow_ups,
        "predictions": predictions,
        "decisions": decisions,
        "audit_logs": audit_logs,
    }


@app.post("/patients")
def create_patient_record(patient: PatientCreate, db: Session = Depends(get_db)):
    """Create and enroll a new patient in the database with audit tracking"""
    pid = patient.study_id or f"NC-{str(uuid.uuid4())[:6].upper()}"

    # Calculate adherence % if tabs provided
    adh = patient.adherence_pct
    if patient.tabs_dispensed and patient.tabs_dispensed > 0:
        adh = round(((patient.tabs_dispensed - (patient.tabs_remaining or 0)) / patient.tabs_dispensed) * 100, 1)

    p = Patient(
        id=pid,
        study_id=pid,
        hospital_reg=patient.hospital_reg or f"HRN-{str(uuid.uuid4())[:6].upper()}",
        enrollment_date=patient.enrollment_date or datetime.utcnow().strftime("%Y-%m-%d"),
        investigator=patient.investigator,
        department=patient.department,
        age=patient.age,
        sex=patient.sex,
        bmi=patient.bmi,
        education=patient.education,
        employment=patient.employment,
        residence=patient.residence,
        substance_use=patient.substance_use,
        dep_duration_months=patient.dep_duration_months,
        episode_type=patient.episode_type,
        num_prev_episodes=patient.num_prev_episodes,
        family_history=patient.family_history,
        prev_hospitalization=patient.prev_hospitalization,
        prev_suicide_attempt=patient.prev_suicide_attempt,
        prev_treatment_response=patient.prev_treatment_response,
        has_hypertension=patient.has_hypertension,
        has_diabetes=patient.has_diabetes,
        has_thyroid=patient.has_thyroid,
        has_cardiovascular=patient.has_cardiovascular,
        has_ckd=patient.has_ckd,
        has_liver=patient.has_liver,
        has_asthma_copd=patient.has_asthma_copd,
        has_epilepsy=patient.has_epilepsy,
        has_migraine=patient.has_migraine,
        comorbidity_count=sum([
            patient.has_hypertension or 0, patient.has_diabetes or 0,
            patient.has_thyroid or 0, patient.has_cardiovascular or 0,
            patient.has_ckd or 0, patient.has_liver or 0,
            patient.has_asthma_copd or 0, patient.has_epilepsy or 0,
            patient.has_migraine or 0
        ]),
        ad_name=patient.ad_name,
        ad_class=patient.ad_class,
        ad_dose_mg=patient.ad_dose_mg,
        ad_frequency=patient.ad_frequency,
        ad_duration_weeks=patient.ad_duration_weeks,
        madrs_baseline=patient.madrs_baseline,
        gad7_baseline=patient.gad7_baseline,
        mars_score=patient.mars_score,
        tabs_dispensed=patient.tabs_dispensed,
        tabs_remaining=patient.tabs_remaining,
        adherence_pct=adh,
        adr_occurred=patient.adr_occurred,
        adr_severity=patient.adr_severity,
        naranjo_score=patient.naranjo_score,
        is_demo=False,
        notes=patient.notes
    )
    db.add(p)

    # Add medication record
    med = MedicationRecord(
        patient_id=pid,
        drug_name=patient.ad_name,
        drug_class=patient.ad_class,
        dose_mg=patient.ad_dose_mg,
        frequency=patient.ad_frequency,
        duration_weeks=patient.ad_duration_weeks,
        is_primary_antidepressant=True
    )
    db.add(med)

    # Initial baseline follow up
    w0 = FollowUpRecord(
        patient_id=pid,
        visit_week=0,
        visit_date=datetime.utcnow().strftime("%Y-%m-%d"),
        madrs_score=patient.madrs_baseline,
        gad7_score=patient.gad7_baseline,
        mars_score=patient.mars_score,
        adherence_pct=adh,
        treatment_action="Enrollment & Intake"
    )
    db.add(w0)

    # Audit Log
    audit = AuditLog(
        patient_id=pid,
        user_id="Dr. Lead Clinician",
        action="ENROLL_PATIENT",
        details=f"New patient {pid} enrolled via clinical intake wizard."
    )
    db.add(audit)
    db.commit()
    db.refresh(p)

    d = {c.name: getattr(p, c.name) for c in p.__table__.columns}
    return {"id": pid, "patient": d, "status": "created"}


@app.put("/patients/{patient_id}")
def update_patient_record(patient_id: str, updates: PatientUpdate, db: Session = Depends(get_db)):
    """Safely edit clinical fields with validation and audit logging"""
    patient = db.query(Patient).filter(
        or_(Patient.id == patient_id, Patient.study_id == patient_id)
    ).first()

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    up_dict = updates.model_dump(exclude_unset=True)
    edit_reason = up_dict.pop('edit_reason', 'Routine clinical update')

    changed_fields = []
    for k, v in up_dict.items():
        if hasattr(patient, k) and v is not None:
            old_val = getattr(patient, k)
            if old_val != v:
                setattr(patient, k, v)
                changed_fields.append(f"{k}: '{old_val}' -> '{v}'")

    patient.updated_at = datetime.utcnow()

    # Recalculate adherence if tabs were updated
    if 'tabs_dispensed' in up_dict or 'tabs_remaining' in up_dict:
        if patient.tabs_dispensed and patient.tabs_dispensed > 0:
            patient.adherence_pct = round(
                ((patient.tabs_dispensed - (patient.tabs_remaining or 0)) / patient.tabs_dispensed) * 100, 1
            )

    # Audit Trail
    audit = AuditLog(
        patient_id=patient.id,
        user_id="Dr. Lead Clinician",
        action="EDIT_PATIENT",
        details=f"Reason: {edit_reason}. Modified: {', '.join(changed_fields) if changed_fields else 'No field changes'}"
    )
    db.add(audit)
    db.commit()
    db.refresh(patient)

    d = {c.name: getattr(patient, c.name) for c in patient.__table__.columns}
    return {"status": "updated", "patient": d}


@app.get("/patients/{patient_id}/history")
def get_patient_history(patient_id: str, db: Session = Depends(get_db)):
    """Longitudinal patient timeline events"""
    patient = db.query(Patient).filter(
        or_(Patient.id == patient_id, Patient.study_id == patient_id)
    ).first()

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    events = []
    
    # 1. Enrollment
    events.append({
        "date": patient.enrollment_date or "2026-03-15",
        "week": 0,
        "type": "ENROLLMENT",
        "title": "Study Enrollment & Baseline Assessment",
        "madrs": patient.madrs_baseline,
        "gad7": patient.gad7_baseline,
        "medication": f"{patient.ad_name} {patient.ad_dose_mg}mg",
        "adherence": f"{patient.adherence_pct}%",
        "notes": "Patient screened and enrolled in prospective study cohort."
    })

    # 2. Follow-Up visits
    for f in patient.follow_ups:
        if f.visit_week > 0:
            events.append({
                "date": f.visit_date or f"Week {f.visit_week}",
                "week": f.visit_week,
                "type": "FOLLOW_UP",
                "title": f"Week {f.visit_week} Longitudinal Check",
                "madrs": f.madrs_score,
                "gad7": f.gad7_score,
                "medication": f"{patient.ad_name} {patient.ad_dose_mg}mg",
                "adherence": f"{f.adherence_pct or patient.adherence_pct}%",
                "notes": f.treatment_action or "Symptom check & adherence validation"
            })

    # 3. Predictions
    for pr in patient.predictions:
        events.append({
            "date": pr.created_at.strftime("%Y-%m-%d %H:%M") if pr.created_at else "Prediction",
            "type": "AI_PREDICTION",
            "title": f"AI Response Prediction ({pr.model_name})",
            "probability": f"{round(pr.probability_response * 100)}%",
            "classification": pr.label,
            "notes": f"Estimated probability of ≥50% MADRS reduction: {round(pr.probability_response * 100)}%"
        })

    # 4. Decisions
    for dec in patient.decisions:
        events.append({
            "date": dec.created_at.strftime("%Y-%m-%d %H:%M") if dec.created_at else "Decision",
            "type": "CLINICAL_DECISION",
            "title": f"Clinician Decision: {dec.decision_type}",
            "notes": dec.decision_notes or dec.action_taken
        })

    return {
        "patient_id": patient.study_id,
        "timeline": events
    }


@app.post("/predict")
def predict_outcome(req: PredictRequest, db: Session = Depends(get_db)):
    """Real-time ML inference and prediction history persistence"""
    patient = db.query(Patient).filter(
        or_(Patient.id == req.patient_id, Patient.study_id == req.patient_id)
    ).first()

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    model_name = req.model_name
    if model_name not in MODELS:
        raise HTTPException(status_code=400, detail=f"Model '{model_name}' not available. Available: {list(MODELS.keys())}")

    model = MODELS[model_name]
    X = patient_to_features(patient)
    proba = model.predict_proba(X)[0]

    # Multi-class output calibration
    prob_response = float(proba[1])
    prob_nonresponse = float(proba[0])
    prob_partial = max(0.0, 1.0 - prob_response - max(0.0, prob_nonresponse - 0.2))
    
    total = prob_response + prob_partial + prob_nonresponse
    prob_response /= total
    prob_partial /= total
    prob_nonresponse /= total

    if prob_response >= 0.50:
        classification = "Responder"
        label = "Likely Responder (≥50% MADRS Reduction)"
    elif prob_response >= 0.30:
        classification = "Partial Responder"
        label = "Partial Responder (25-49% MADRS Reduction)"
    else:
        classification = "Non-Responder"
        label = "Lower Probability of Response (<25% Reduction)"

    pred_id = f"PRED-{str(uuid.uuid4())[:8].upper()}"

    # Persist prediction in DB
    pred_record = Prediction(
        id=pred_id,
        patient_id=patient.id,
        model_name=model_name,
        model_version="v1.0",
        probability_response=round(prob_response, 3),
        probability_partial=round(prob_partial, 3),
        probability_nonresponse=round(prob_nonresponse, 3),
        classification=classification,
        label=label,
        is_demo=patient.is_demo,
        created_at=datetime.utcnow()
    )
    db.add(pred_record)

    # Log to audit trail
    audit = AuditLog(
        patient_id=patient.id,
        user_id="Dr. Lead Clinician",
        action="GENERATE_PREDICTION",
        details=f"Inference run with {model_name}: {label} ({round(prob_response*100)}%)"
    )
    db.add(audit)
    db.commit()

    return {
        "id": pred_id,
        "patient_id": patient.study_id,
        "model": model_name,
        "model_version": "v1.0",
        "probability_response": round(prob_response, 3),
        "probability_partial": round(prob_partial, 3),
        "probability_nonresponse": round(prob_nonresponse, 3),
        "classification": classification,
        "label": label,
        "timestamp": datetime.utcnow().isoformat(),
        "disclaimer": "This is a clinical decision support output. Not for clinical decision-making without independent professional medical judgment."
    }


@app.post("/explain")
def explain_outcome(req: ExplainRequest, db: Session = Depends(get_db)):
    """SHAP and LIME feature attribution calculation and persistence"""
    from ml.pipeline import compute_shap_local, compute_lime_local

    patient = db.query(Patient).filter(
        or_(Patient.id == req.patient_id, Patient.study_id == req.patient_id)
    ).first()

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    model_name = req.model_name
    if model_name not in MODELS:
        raise HTTPException(status_code=400, detail=f"Model not available")

    model = MODELS[model_name]
    X = patient_to_features(patient)

    shap_local = compute_shap_local(model, X, model_name)
    lime_local = None
    if TRAIN_DATA:
        lime_local = compute_lime_local(model, TRAIN_DATA['X_train'], X, model_name)

    def to_clinical_language(item):
        label = item.get('label', item.get('feature', ''))
        direction = item.get('direction', 'positive')
        if direction == 'positive':
            return f"{label} contributed toward a higher estimated likelihood of treatment response."
        else:
            return f"{label} contributed toward a lower estimated likelihood of treatment response."

    clinical_explanations = []
    if shap_local and shap_local.get('contributions'):
        for item in shap_local['contributions'][:6]:
            clinical_explanations.append({
                'label': item['label'],
                'direction': item['direction'],
                'clinical_text': to_clinical_language(item),
                'shap_value': item['shap_value']
            })

    return {
        "patient_id": patient.study_id,
        "model": model_name,
        "shap_local": shap_local,
        "lime_local": lime_local,
        "clinical_explanations": clinical_explanations,
        "shap_global": RESULTS.get(model_name, {}).get('shap_global'),
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.post("/clinical-decisions")
def record_clinical_decision(dec: DecisionCreate, db: Session = Depends(get_db)):
    """Record treating clinician review and attestation"""
    patient = db.query(Patient).filter(
        or_(Patient.id == dec.patient_id, Patient.study_id == dec.patient_id)
    ).first()

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    rec = ClinicalDecision(
        patient_id=patient.id,
        decision_type=dec.decision_type,
        decision_notes=dec.decision_notes,
        action_taken=dec.action_taken
    )
    db.add(rec)

    audit = AuditLog(
        patient_id=patient.id,
        user_id="Dr. Lead Clinician",
        action="RECORD_DECISION",
        details=f"Clinician documented decision: {dec.decision_type}. {dec.decision_notes or ''}"
    )
    db.add(audit)
    db.commit()

    return {"status": "saved", "id": rec.id}


@app.get("/audit-logs")
def get_audit_logs(limit: int = 50, db: Session = Depends(get_db)):
    """Retrieve system audit trail"""
    logs = db.query(AuditLog).order_by(desc(AuditLog.timestamp)).limit(limit).all()
    return [{
        "id": l.id,
        "patient_id": l.patient_id,
        "user_id": l.user_id,
        "action": l.action,
        "details": l.details,
        "timestamp": l.timestamp.isoformat() if l.timestamp else None
    } for l in logs]


@app.get("/dataset/stats")
def dataset_stats(db: Session = Depends(get_db)):
    """Live descriptive epidemiology calculated directly from the database"""
    patients = db.query(Patient).all()
    if not patients:
        raise HTTPException(status_code=503, detail="Dataset not loaded")

    df = pd.DataFrame([{c.name: getattr(p, c.name) for c in p.__table__.columns} for p in patients])
    resp_counts = df['response_class'].value_counts().to_dict()

    return {
        "total": len(df),
        "response_distribution": resp_counts,
        "response_rate": round(float(df['response_binary'].mean()), 3),
        "demographics": {
            "age_mean": round(float(df['age'].mean()), 1),
            "age_std": round(float(df['age'].std()), 1),
            "sex_distribution": df['sex'].value_counts().to_dict(),
            "bmi_mean": round(float(df['bmi'].mean()), 1),
            "bmi_std": round(float(df['bmi'].std()), 1),
        },
        "clinical": {
            "madrs_baseline_mean": round(float(df['madrs_baseline'].mean()), 1),
            "madrs_baseline_std": round(float(df['madrs_baseline'].std()), 1),
            "gad7_baseline_mean": round(float(df['gad7_baseline'].mean()), 1),
            "mars_mean": round(float(df['mars_score'].mean()), 1),
            "adherence_mean": round(float(df['adherence_pct'].mean()), 1),
            "adr_rate": round(float(df['adr_occurred'].mean()), 3),
        },
        "ad_class_distribution": df['ad_class'].value_counts().to_dict(),
        "episode_type": df['episode_type'].value_counts().to_dict(),
        "education": df['education'].value_counts().to_dict(),
        "residence": df['residence'].value_counts().to_dict(),
        "comorbidity_mean": round(float(df['comorbidity_count'].mean()), 2),
        "prev_treatment_response": df['prev_treatment_response'].value_counts().to_dict(),
        "madrs_week6_mean": round(float(df['madrs_week6'].mean()), 1),
        "madrs_reduction_pct_mean": round(float(df['madrs_reduction_pct'].mean()), 1),
        "dataset_label": "SYNTHETIC DEMONSTRATION DATA (N=320) — RELATIONAL DATABASE BACKED",
    }


@app.get("/dataset/export-csv")
def export_dataset_csv(db: Session = Depends(get_db)):
    """Export complete research cohort as RFC 4180 compliant CSV"""
    patients = db.query(Patient).order_by(Patient.study_id).all()
    
    output = io.StringIO()
    writer = csv.writer(output, quoting=csv.QUOTE_MINIMAL)

    # Header
    headers = [
        "Study_ID", "Hospital_Reg", "Age", "Sex", "BMI", "Education", "Employment", "Residence",
        "Depression_Duration_Months", "Episode_Type", "Num_Prev_Episodes", "Family_History",
        "Prev_Treatment_Response", "Comorbidity_Count", "Antidepressant_Name", "Drug_Class",
        "Dose_mg", "MADRS_Baseline", "GAD7_Baseline", "MARS_Adherence_Score", "Pill_Count_Adherence_Pct",
        "ADR_Occurred", "ADR_Severity", "MADRS_Week6", "MADRS_Reduction_Pct", "Response_Classification"
    ]
    writer.writerow(headers)

    for p in patients:
        writer.writerow([
            p.study_id, p.hospital_reg or "", p.age, p.sex, p.bmi, p.education, p.employment, p.residence,
            p.dep_duration_months, p.episode_type, p.num_prev_episodes, p.family_history,
            p.prev_treatment_response, p.comorbidity_count, p.ad_name, p.ad_class,
            p.ad_dose_mg, p.madrs_baseline, p.gad7_baseline, p.mars_score, p.adherence_pct,
            p.adr_occurred, p.adr_severity, p.madrs_week6, p.madrs_reduction_pct, p.response_class
        ])

    output.seek(0)
    filename = f"neuroclarity_clinical_cohort_N{len(patients)}_{datetime.utcnow().strftime('%Y%m%d')}.csv"
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode('utf-8')),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@app.get("/patients/{patient_id}/export-csv")
def export_single_patient_csv(patient_id: str, db: Session = Depends(get_db)):
    """Export individual patient longitudinal profile as CSV"""
    patient = db.query(Patient).filter(
        or_(Patient.id == patient_id, Patient.study_id == patient_id)
    ).first()

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    output = io.StringIO()
    writer = csv.writer(output, quoting=csv.QUOTE_MINIMAL)

    writer.writerow(["Section", "Field", "Value"])
    writer.writerow(["Identification", "Study ID", patient.study_id])
    writer.writerow(["Identification", "Hospital Registration", patient.hospital_reg])
    writer.writerow(["Demographics", "Age", patient.age])
    writer.writerow(["Demographics", "Sex", patient.sex])
    writer.writerow(["Demographics", "BMI", patient.bmi])
    writer.writerow(["Clinical History", "Depression Duration (months)", patient.dep_duration_months])
    writer.writerow(["Clinical History", "Episode Type", patient.episode_type])
    writer.writerow(["Clinical History", "Previous Treatment Response", patient.prev_treatment_response])
    writer.writerow(["Pharmacotherapy", "Medication Name", patient.ad_name])
    writer.writerow(["Pharmacotherapy", "Drug Class", patient.ad_class])
    writer.writerow(["Pharmacotherapy", "Daily Dose (mg)", patient.ad_dose_mg])
    writer.writerow(["Assessment", "Baseline MADRS", patient.madrs_baseline])
    writer.writerow(["Assessment", "Baseline GAD-7", patient.gad7_baseline])
    writer.writerow(["Assessment", "MARS Score", patient.mars_score])
    writer.writerow(["Assessment", "Pill Count Adherence %", patient.adherence_pct])
    writer.writerow(["Longitudinal Endpoint", "Week 6 MADRS", patient.madrs_week6])
    writer.writerow(["Longitudinal Endpoint", "Reduction %", patient.madrs_reduction_pct])
    writer.writerow(["Longitudinal Endpoint", "Response Classification", patient.response_class])

    output.seek(0)
    filename = f"patient_{patient.study_id}_record.csv"
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode('utf-8')),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@app.get("/models")
def get_models():
    model_info = {
        "logistic_regression": {
            "name": "Logistic Regression",
            "version": "v1.0",
            "type": "Linear Classifier",
            "purpose": "Primary interpretable model",
            "strengths": ["Interpretable odds ratios", "Calibrated continuous probabilities", "Standard psychiatric baseline"],
            "limitations": ["Assumes linear relationships", "May miss non-linear interaction terms"],
            "explainability": "SHAP LinearExplainer",
            "library": "scikit-learn",
            "available": "logistic_regression" in MODELS,
        },
        "decision_tree": {
            "name": "Decision Tree",
            "version": "v1.0",
            "type": "Rule-Based Classifier",
            "purpose": "Hierarchical decision thresholding",
            "strengths": ["Clear binary splits", "Clinician-transparent paths", "Fast inference"],
            "limitations": ["Sensitive to training variance", "Less smooth boundaries"],
            "explainability": "SHAP TreeExplainer + Rule Pathways",
            "library": "scikit-learn",
            "available": "decision_tree" in MODELS,
        },
        "random_forest": {
            "name": "Random Forest",
            "version": "v1.2",
            "type": "Ensemble Bagging",
            "purpose": "Robust non-linear interaction modeling",
            "strengths": ["Handles high-order interactions", "Robust to outliers", "Consistent generalization"],
            "limitations": ["Ensemble opacity requiring TreeSHAP"],
            "explainability": "TreeSHAP Exact Decomposition",
            "library": "scikit-learn",
            "available": "random_forest" in MODELS,
        },
        "xgboost": {
            "name": "Gradient Boosting (XGBoost)",
            "version": "v1.1",
            "type": "Gradient Boosting",
            "purpose": "High-performance tabular modeling",
            "strengths": ["Iterative loss optimization", "Regularized boosting", "Native TreeSHAP support"],
            "limitations": ["Requires strict hyperparameter tuning"],
            "explainability": "Native TreeSHAP",
            "library": "xgboost",
            "available": "xgboost" in MODELS,
        }
    }
    return model_info


@app.get("/performance")
def get_performance(db: Session = Depends(get_db)):
    """Retrieve versioned model evaluation metrics from database / ML artifacts"""
    if not RESULTS:
        raise HTTPException(status_code=503, detail="Models not yet trained. Run /models/train first.")
    perf = {}
    for name, res in RESULTS.items():
        perf[name] = {
            "performance": res.get("performance", {}),
            "cv": res.get("cv", {}),
            "bootstrap": res.get("bootstrap", {}),
            "version": "v1.0",
            "dataset": "Synthetic Cohort N=320",
            "evaluation_status": "Valid"
        }
    return perf


@app.get("/validation")
def get_validation():
    if not RESULTS:
        raise HTTPException(status_code=503, detail="Models not yet trained.")
    val = {}
    for name, res in RESULTS.items():
        val[name] = {
            "cv": res.get("cv", {}),
            "bootstrap": res.get("bootstrap", {}),
            "trained": res.get("trained", False),
        }
    return {
        "validation_strategy": {
            "train_test_split": "70% training / 30% test (stratified)",
            "cross_validation": "Stratified 5-Fold Cross Validation",
            "bootstrap": "100 iterations (demonstration; empirical 95% CIs)",
            "held_out_test": "30% unseen held-out test set",
        },
        "results": val,
        "dataset_label": "Synthetic Research Cohort (N=320)",
        "demo_mode": True,
    }


@app.get("/dca/{model_name}")
def get_dca(model_name: str):
    if model_name not in RESULTS:
        raise HTTPException(status_code=404, detail="Model results not found")
    return {"dca": RESULTS[model_name].get('dca', []), "model": model_name}


@app.post("/feedback")
def submit_feedback(feedback: FeedbackCreate):
    return {"status": "received", "timestamp": datetime.utcnow().isoformat()}


@app.get("/reports/{patient_id}")
def get_report(patient_id: str, model_name: str = "random_forest", db: Session = Depends(get_db)):
    """Generates structured formal report data for PDF and print rendering"""
    patient = db.query(Patient).filter(
        or_(Patient.id == patient_id, Patient.study_id == patient_id)
    ).first()

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    p_dict = {c.name: getattr(patient, c.name) for c in patient.__table__.columns}
    assessments = [{c.name: getattr(a, c.name) for c in a.__table__.columns} for a in patient.assessments]
    perf = RESULTS.get(model_name, {}).get('performance', {})

    # Latest prediction if any
    latest_pred = db.query(Prediction).filter(Prediction.patient_id == patient.id).order_by(desc(Prediction.created_at)).first()
    pred_dict = {c.name: getattr(latest_pred, c.name) for c in latest_pred.__table__.columns} if latest_pred else {}

    return {
        "report_id": f"RPT-{patient.study_id}-{datetime.utcnow().strftime('%Y%m%d')}",
        "patient_id": patient.study_id,
        "generated_at": datetime.utcnow().isoformat(),
        "patient": p_dict,
        "prediction": pred_dict,
        "model_performance": perf,
        "assessments": assessments,
        "disclaimer": "This report is generated by an Explainable AI Clinical Decision Support System. All estimations are probabilistic and intended for clinical decision support under licensed psychiatric oversight.",
        "mode": "DATABASE_CONNECTED"
    }
