"""
NeuroClarity XAI-CDSS — Database Initialization & Seeding Script
Populates the relational database from synthetic clinical cohort data.
"""
import os
import sys
import uuid
import pandas as pd
from datetime import datetime
from .database import engine, Base, SessionLocal
from .models import (
    Patient, ClinicalAssessment, MedicationRecord,
    FollowUpRecord, Prediction, XAIExplanation,
    ClinicalDecision, AuditLog, ModelPerformanceRecord
)

def init_and_seed_db(data_csv_path: str, ml_results: dict = None):
    """Creates tables and populates with synthetic clinical cohort."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        existing_count = db.query(Patient).count()
        if existing_count > 0:
            print(f"Database already seeded with {existing_count} patients.")
            return

        if not os.path.exists(data_csv_path):
            print(f"Warning: CSV {data_csv_path} not found for seeding.")
            return

        df = pd.read_csv(data_csv_path).fillna({
            'prev_treatment_response': 'No prior treatment',
            'adr_severity': 'None',
            'naranjo_class': 'Doubtful',
            'education': 'Graduate',
            'employment': 'Employed',
            'residence': 'Urban',
            'substance_use': 'None',
            'notes': ''
        }).fillna(0)

        print(f"Seeding {len(df)} patients into relational database...")

        for idx, row in df.iterrows():
            pid = str(row['study_id'])
            
            # 1. Create Patient Record
            p = Patient(
                id=pid,
                study_id=pid,
                hospital_reg=f"HRN-{100000 + idx}",
                enrollment_date="2026-03-15",
                investigator="Dr. Lead Psychiatrist, MD",
                department="Psychiatry & Clinical Pharmacology",
                age=int(row['age']),
                sex=str(row['sex']),
                bmi=float(row['bmi']),
                education=str(row['education']),
                employment=str(row['employment']),
                residence=str(row['residence']),
                substance_use=str(row['substance_use']),
                dep_duration_months=int(row['dep_duration_months']),
                episode_type=str(row['episode_type']),
                num_prev_episodes=int(row['num_prev_episodes']),
                family_history=str(row['family_history']),
                prev_hospitalization=str(row['prev_hospitalization']),
                prev_suicide_attempt=str(row['prev_suicide_attempt']),
                prev_treatment_response=str(row['prev_treatment_response']),
                has_hypertension=int(row['has_hypertension']),
                has_diabetes=int(row['has_diabetes']),
                has_thyroid=int(row['has_thyroid']),
                has_cardiovascular=int(row['has_cardiovascular']),
                has_ckd=int(row['has_ckd']),
                has_liver=int(row['has_liver']),
                has_asthma_copd=int(row['has_asthma_copd']),
                has_epilepsy=int(row['has_epilepsy']),
                has_migraine=int(row['has_migraine']),
                comorbidity_count=int(row['comorbidity_count']),
                ad_name=str(row['ad_name']),
                ad_class=str(row['ad_class']),
                ad_dose_mg=float(row['ad_dose_mg']),
                ad_frequency="Once daily",
                ad_duration_weeks=int(row.get('ad_duration_weeks', 4)),
                madrs_baseline=float(row['madrs_baseline']),
                gad7_baseline=float(row['gad7_baseline']),
                mars_score=float(row['mars_score']),
                tabs_dispensed=int(row.get('tabs_dispensed', 60)),
                tabs_remaining=int(row.get('tabs_remaining', 5)),
                adherence_pct=float(row['adherence_pct']),
                adr_occurred=int(row['adr_occurred']),
                adr_severity=str(row['adr_severity']),
                naranjo_score=int(row['naranjo_score']),
                naranjo_class=str(row['naranjo_class']),
                madrs_week2=float(row.get('madrs_week2', round(row['madrs_baseline'] * 0.78))),
                madrs_week4=float(row.get('madrs_week4', round(row['madrs_baseline'] * 0.55))),
                madrs_week6=float(row['madrs_week6']),
                gad7_week6=float(row.get('gad7_week6', max(0, round(row['gad7_baseline'] * 0.45)))),
                madrs_change=float(row['madrs_change']),
                madrs_reduction_pct=float(row['madrs_reduction_pct']),
                response_binary=int(row['response_binary']),
                response_class=str(row['response_class']),
                is_demo=True,
                notes=str(row.get('notes', ''))
            )
            db.add(p)

            # 2. Add Medication Record
            med = MedicationRecord(
                patient_id=pid,
                drug_name=str(row['ad_name']),
                drug_class=str(row['ad_class']),
                dose_mg=float(row['ad_dose_mg']),
                frequency="Once daily",
                duration_weeks=int(row.get('ad_duration_weeks', 4)),
                is_primary_antidepressant=True,
                status="Active"
            )
            db.add(med)

            # 3. Add Longitudinal Follow-up Timeline Visits
            w0 = FollowUpRecord(
                patient_id=pid,
                visit_week=0,
                visit_date="2026-03-15",
                madrs_score=float(row['madrs_baseline']),
                gad7_score=float(row['gad7_baseline']),
                mars_score=float(row['mars_score']),
                adherence_pct=float(row['adherence_pct']),
                adr_status="None",
                treatment_action="Baseline Intake & Initiation"
            )
            w2 = FollowUpRecord(
                patient_id=pid,
                visit_week=2,
                visit_date="2026-03-29",
                madrs_score=float(row.get('madrs_week2', round(row['madrs_baseline'] * 0.78))),
                gad7_score=max(0.0, float(row['gad7_baseline']) * 0.8),
                mars_score=float(row['mars_score']),
                adherence_pct=float(row['adherence_pct']),
                adr_status=str(row['adr_severity']) if row['adr_occurred'] else "None",
                treatment_action="Tolerability & Dose Check"
            )
            w4 = FollowUpRecord(
                patient_id=pid,
                visit_week=4,
                visit_date="2026-04-12",
                madrs_score=float(row.get('madrs_week4', round(row['madrs_baseline'] * 0.55))),
                gad7_score=max(0.0, float(row['gad7_baseline']) * 0.6),
                mars_score=float(row['mars_score']),
                adherence_pct=float(row['adherence_pct']),
                adr_status="None",
                treatment_action="Dose Maintained"
            )
            w6 = FollowUpRecord(
                patient_id=pid,
                visit_week=6,
                visit_date="2026-04-26",
                madrs_score=float(row['madrs_week6']),
                gad7_score=float(row.get('gad7_week6', max(0, round(row['gad7_baseline'] * 0.45)))),
                mars_score=float(row['mars_score']),
                adherence_pct=float(row['adherence_pct']),
                adr_status="None",
                treatment_action=f"Outcome Evaluated: {row['response_class']}"
            )
            db.add_all([w0, w2, w4, w6])

            # 4. Add Audit Log
            audit = AuditLog(
                patient_id=pid,
                user_id="System Initializer",
                action="INITIAL_SEED",
                details=f"Patient {pid} enrolled in demonstration cohort."
            )
            db.add(audit)

        # 5. Populate Model Performance Table
        if ml_results:
            for m_name, res in ml_results.items():
                perf = res.get('performance', {})
                boot = res.get('bootstrap', {})
                m_rec = ModelPerformanceRecord(
                    model_name=m_name,
                    version="v1.0",
                    dataset_version="Synthetic Cohort N=320",
                    auc=float(perf.get('auc', 0.75)),
                    sensitivity=float(perf.get('sensitivity', 0.70)),
                    specificity=float(perf.get('specificity', 0.65)),
                    ppv=float(perf.get('ppv', 0.72)),
                    npv=float(perf.get('npv', 0.68)),
                    brier_score=float(perf.get('brier_score', 0.16)),
                    bootstrap_auc_mean=float(boot.get('bootstrap_auc_mean', 0.75)),
                    bootstrap_auc_ci_lower=float(boot.get('bootstrap_auc_ci_lower', 0.62)),
                    bootstrap_auc_ci_upper=float(boot.get('bootstrap_auc_ci_upper', 0.88))
                )
                db.add(m_rec)

        db.commit()
        print("Database populated successfully.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()
