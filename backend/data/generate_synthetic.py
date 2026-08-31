"""
NeuroClarity XAI-CDSS — Synthetic Data Generator
SYNTHETIC DEMONSTRATION DATA — NOT REAL PATIENT DATA
Uses deterministic seed for reproducibility.
"""

import numpy as np
import pandas as pd
import os

SEED = 42
N = 320

np.random.seed(SEED)

def generate_dataset():
    rng = np.random.default_rng(SEED)

    ages = rng.integers(18, 75, N)
    sexes = rng.choice(['Male', 'Female'], N, p=[0.42, 0.58])
    bmis = rng.normal(24.5, 4.2, N).clip(15, 45).round(1)
    educations = rng.choice(['Primary', 'Secondary', 'Graduate', 'Postgraduate'], N, p=[0.1, 0.25, 0.45, 0.20])
    employments = rng.choice(['Employed', 'Unemployed', 'Student', 'Retired', 'Homemaker'], N, p=[0.42, 0.18, 0.12, 0.10, 0.18])
    residences = rng.choice(['Urban', 'Semi-urban', 'Rural'], N, p=[0.55, 0.25, 0.20])
    substances = rng.choice(['None', 'Tobacco', 'Alcohol', 'Both'], N, p=[0.60, 0.20, 0.12, 0.08])

    dep_duration_months = rng.integers(1, 120, N)
    episode_type = rng.choice(['First', 'Recurrent'], N, p=[0.38, 0.62])
    num_prev_episodes = np.where(episode_type == 'First', 0, rng.integers(1, 8, N))
    family_history = rng.choice(['Yes', 'No'], N, p=[0.40, 0.60])
    prev_hospitalization = rng.choice(['Yes', 'No'], N, p=[0.25, 0.75])
    prev_suicide_attempt = rng.choice(['Yes', 'No'], N, p=[0.15, 0.85])
    prev_treatment_response = rng.choice(['Good', 'Partial', 'None', 'No prior treatment'], N, p=[0.22, 0.18, 0.25, 0.35])

    # Comorbidities
    has_hypertension = rng.choice([0, 1], N, p=[0.70, 0.30])
    has_diabetes = rng.choice([0, 1], N, p=[0.78, 0.22])
    has_thyroid = rng.choice([0, 1], N, p=[0.85, 0.15])
    has_cardiovascular = rng.choice([0, 1], N, p=[0.88, 0.12])
    has_ckd = rng.choice([0, 1], N, p=[0.92, 0.08])
    has_liver = rng.choice([0, 1], N, p=[0.93, 0.07])
    has_asthma_copd = rng.choice([0, 1], N, p=[0.90, 0.10])
    has_epilepsy = rng.choice([0, 1], N, p=[0.94, 0.06])
    has_migraine = rng.choice([0, 1], N, p=[0.88, 0.12])
    comorbidity_count = (has_hypertension + has_diabetes + has_thyroid + has_cardiovascular +
                          has_ckd + has_liver + has_asthma_copd + has_epilepsy + has_migraine)

    # Antidepressant
    ad_classes = rng.choice(['SSRI', 'SNRI', 'TCA', 'Other'], N, p=[0.50, 0.25, 0.15, 0.10])
    ad_names_map = {
        'SSRI': ['Escitalopram', 'Sertraline', 'Fluoxetine', 'Paroxetine'],
        'SNRI': ['Venlafaxine', 'Duloxetine', 'Desvenlafaxine'],
        'TCA': ['Amitriptyline', 'Imipramine', 'Nortriptyline'],
        'Other': ['Mirtazapine', 'Bupropion', 'Agomelatine']
    }
    ad_names = [rng.choice(ad_names_map[c]) for c in ad_classes]
    ad_doses = rng.choice([10, 20, 25, 50, 75, 100, 150, 200], N)
    ad_freq = rng.choice(['Once daily', 'Twice daily', 'Three times daily'], N, p=[0.65, 0.25, 0.10])
    ad_duration_weeks = rng.integers(4, 24, N)

    # Baseline scores
    madrs_baseline = rng.integers(20, 55, N)
    gad7_baseline = rng.integers(5, 21, N)
    mars_scores = rng.integers(0, 11, N)

    # Adherence
    tabs_dispensed = rng.integers(40, 90, N)
    tabs_remaining = rng.integers(0, 25, N)
    tabs_remaining = np.minimum(tabs_remaining, tabs_dispensed)
    adherence_pct = ((tabs_dispensed - tabs_remaining) / tabs_dispensed * 100).round(1)

    # ADR
    adr_occurred = rng.choice([0, 1], N, p=[0.65, 0.35])
    adr_severity = np.where(adr_occurred == 0, 'None',
                   rng.choice(['Mild', 'Moderate', 'Severe'], N, p=[0.55, 0.35, 0.10]))
    naranjo_score = np.where(adr_occurred == 0,
                             rng.integers(0, 2, N),
                             rng.integers(2, 10, N))
    naranjo_class = np.where(naranjo_score >= 9, 'Definite',
                    np.where(naranjo_score >= 5, 'Probable',
                    np.where(naranjo_score >= 1, 'Possible', 'Doubtful')))

    # Follow-up MADRS (generate based on realistic factors)
    # Improvement probability influenced by: adherence, MARS, baseline, prior response, comorbidities
    def calc_followup_madrs(i):
        base = madrs_baseline[i]
        adherence_factor = adherence_pct[i] / 100.0
        mars_factor = mars_scores[i] / 10.0
        prior_factor = 0.2 if prev_treatment_response[i] == 'Good' else (0.0 if prev_treatment_response[i] == 'Partial' else -0.1)
        comorbidity_factor = -0.05 * comorbidity_count[i]
        adr_factor = -0.1 if adr_severity[i] in ['Moderate', 'Severe'] else 0
        improvement_prob = 0.3 + 0.3 * adherence_factor + 0.2 * mars_factor + prior_factor + comorbidity_factor + adr_factor
        improvement_prob = np.clip(improvement_prob, 0.05, 0.90)
        reduction_pct = rng.normal(improvement_prob * 60, 12)
        reduction_pct = np.clip(reduction_pct, -10, 90)
        followup = base * (1 - reduction_pct / 100)
        noise = rng.normal(0, 2)
        return int(np.clip(followup + noise, 0, 60))

    madrs_week2 = np.array([calc_followup_madrs(i) for i in range(N)])
    madrs_week4 = np.array([int(np.clip(madrs_week2[i] * rng.uniform(0.75, 1.0), 0, 60)) for i in range(N)])
    madrs_week6 = np.array([int(np.clip(madrs_week4[i] * rng.uniform(0.75, 1.0), 0, 60)) for i in range(N)])

    gad7_week6 = np.array([int(np.clip(gad7_baseline[i] * rng.uniform(0.4, 1.1), 0, 21)) for i in range(N)])
    mars_week6 = np.array([int(np.clip(mars_scores[i] + rng.integers(-2, 3), 0, 10)) for i in range(N)])

    # Response classification
    madrs_change = madrs_baseline - madrs_week6
    madrs_reduction_pct = np.where(madrs_baseline > 0, madrs_change / madrs_baseline * 100, 0)

    response_class = np.where(madrs_reduction_pct >= 50, 'Responder',
                     np.where(madrs_reduction_pct >= 25, 'Partial Responder', 'Non-Responder'))
    response_binary = (response_class == 'Responder').astype(int)

    df = pd.DataFrame({
        'study_id': [f'NC-{str(i+1).zfill(4)}' for i in range(N)],
        'age': ages,
        'sex': sexes,
        'bmi': bmis,
        'education': educations,
        'employment': employments,
        'residence': residences,
        'substance_use': substances,
        'dep_duration_months': dep_duration_months,
        'episode_type': episode_type,
        'num_prev_episodes': num_prev_episodes,
        'family_history': family_history,
        'prev_hospitalization': prev_hospitalization,
        'prev_suicide_attempt': prev_suicide_attempt,
        'prev_treatment_response': prev_treatment_response,
        'has_hypertension': has_hypertension,
        'has_diabetes': has_diabetes,
        'has_thyroid': has_thyroid,
        'has_cardiovascular': has_cardiovascular,
        'has_ckd': has_ckd,
        'has_liver': has_liver,
        'has_asthma_copd': has_asthma_copd,
        'has_epilepsy': has_epilepsy,
        'has_migraine': has_migraine,
        'comorbidity_count': comorbidity_count,
        'ad_class': ad_classes,
        'ad_name': ad_names,
        'ad_dose_mg': ad_doses,
        'ad_frequency': ad_freq,
        'ad_duration_weeks': ad_duration_weeks,
        'madrs_baseline': madrs_baseline,
        'gad7_baseline': gad7_baseline,
        'mars_score': mars_scores,
        'tabs_dispensed': tabs_dispensed,
        'tabs_remaining': tabs_remaining,
        'adherence_pct': adherence_pct,
        'adr_occurred': adr_occurred,
        'adr_severity': adr_severity,
        'naranjo_score': naranjo_score,
        'naranjo_class': naranjo_class,
        'madrs_week2': madrs_week2,
        'madrs_week4': madrs_week4,
        'madrs_week6': madrs_week6,
        'gad7_week6': gad7_week6,
        'mars_week6': mars_week6,
        'madrs_change': madrs_change,
        'madrs_reduction_pct': madrs_reduction_pct.round(1),
        'response_class': response_class,
        'response_binary': response_binary,
    })

    return df


if __name__ == '__main__':
    df = generate_dataset()
    out_path = os.path.join(os.path.dirname(__file__), 'synthetic_patients.csv')
    df.to_csv(out_path, index=False)
    print(f"Generated {len(df)} synthetic patients -> {out_path}")
    print("\nResponse distribution:")
    print(df['response_class'].value_counts())
    print(f"\nResponse rate: {df['response_binary'].mean():.1%}")
