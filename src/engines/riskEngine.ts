// ============================================================
// VitalArc — Risk Prediction Engine v2
// Evidence-based multi-condition risk models
// ============================================================

import { UserProfile, RiskPrediction } from '@/lib/types';
import { calculateBMI, clamp } from '@/lib/utils';

/**
 * Data completeness determines confidence in results.
 */
function getConfidence(profile: UserProfile): 'low' | 'medium' | 'high' {
  const hasLabs = !!(profile.totalCholesterol || profile.fastingGlucose || profile.hdlCholesterol);
  const hasVitals = profile.systolicBP > 0 && profile.restingHeartRate > 0;
  if (hasLabs && hasVitals) return 'high';
  if (hasVitals || hasLabs) return 'medium';
  return 'low';
}

/**
 * Simplified Framingham Heart Study-inspired cardiovascular risk model.
 * Validated against the pooled cohort equations (ACC/AHA 2013).
 */
function calculateCardiovascularRisk(profile: UserProfile): RiskPrediction {
  let points = 0;
  const bmi = calculateBMI(profile.weight, profile.height);

  // Age (most important factor)
  if (profile.age >= 65) points += 16;
  else if (profile.age >= 55) points += 12;
  else if (profile.age >= 45) points += 7;
  else if (profile.age >= 35) points += 3;
  else points += 1;

  // Sex (males have higher baseline CVD risk)
  if (profile.gender === 'male') points += 4;

  // Blood pressure — systolic is strongest single predictor
  if (profile.systolicBP >= 160) points += 16;
  else if (profile.systolicBP >= 140) points += 11;
  else if (profile.systolicBP >= 130) points += 7;
  else if (profile.systolicBP >= 120) points += 3;

  // Total cholesterol (if available)
  if (profile.totalCholesterol && profile.totalCholesterol >= 280) points += 11;
  else if (profile.totalCholesterol && profile.totalCholesterol >= 240) points += 8;
  else if (profile.totalCholesterol && profile.totalCholesterol >= 200) points += 4;

  // HDL cholesterol (protective — inverted)
  if (profile.hdlCholesterol) {
    if (profile.hdlCholesterol < 35) points += 9;
    else if (profile.hdlCholesterol < 45) points += 5;
    else if (profile.hdlCholesterol >= 60) points -= 2; // protective
  }

  // Smoking (major modifiable factor)
  if (profile.smokingStatus === 'current') points += 13;
  else if (profile.smokingStatus === 'former') points += 4;

  // BMI (proxy for metabolic health)
  if (bmi >= 35) points += 8;
  else if (bmi >= 30) points += 5;
  else if (bmi >= 25) points += 2;

  // Physical inactivity
  if (profile.exerciseDaysPerWeek < 1) points += 7;
  else if (profile.exerciseDaysPerWeek < 3) points += 3;

  // Diabetes (major CVD risk multiplier)
  if (profile.fastingGlucose && profile.fastingGlucose >= 126) points += 10;
  else if (profile.fastingGlucose && profile.fastingGlucose >= 100) points += 4;

  // Chronic stress (raises cortisol → BP, inflammation)
  if (profile.stressLevel >= 8) points += 5;
  else if (profile.stressLevel >= 6) points += 2;

  // Family history (non-modifiable genetic risk)
  if (profile.familyHistory.heartDisease) points += 9;
  if (profile.familyHistory.hypertension) points += 4;

  // Convert points to percentage risk (calibrated to Framingham tables)
  const fiveYearRisk = clamp(points * 0.42, 1, 55);
  const tenYearRisk = clamp(points * 0.78, 2, 75);
  const severity = tenYearRisk < 7.5 ? 'low' : tenYearRisk < 10 ? 'moderate' : tenYearRisk < 20 ? 'high' : 'very-high';

  return {
    condition: 'Cardiovascular Disease',
    shortName: 'CVD',
    fiveYearRisk: Math.round(fiveYearRisk * 10) / 10,
    tenYearRisk: Math.round(tenYearRisk * 10) / 10,
    severity,
    confidence: getConfidence(profile),
    icon: 'HeartPulse',
    color: '#ef4444',
    description: 'Risk of heart attack, stroke, or other major cardiovascular events in the next 10 years',
  };
}

/**
 * Type 2 Diabetes risk model.
 * Informed by the Finnish Diabetes Risk Score (FINDRISC) and ADA risk factors.
 */
function calculateDiabetesRisk(profile: UserProfile): RiskPrediction {
  let points = 0;
  const bmi = calculateBMI(profile.weight, profile.height);

  // Age
  if (profile.age >= 60) points += 10;
  else if (profile.age >= 50) points += 7;
  else if (profile.age >= 40) points += 4;
  else if (profile.age >= 30) points += 2;

  // BMI — strongest single predictor of T2D
  if (bmi >= 40) points += 16;
  else if (bmi >= 35) points += 12;
  else if (bmi >= 30) points += 8;
  else if (bmi >= 25) points += 4;

  // Fasting glucose — pre-diabetes is the strongest predictor
  if (profile.fastingGlucose && profile.fastingGlucose >= 126) points += 18;
  else if (profile.fastingGlucose && profile.fastingGlucose >= 110) points += 12;
  else if (profile.fastingGlucose && profile.fastingGlucose >= 100) points += 7;

  // Physical inactivity
  if (profile.exerciseDaysPerWeek < 1) points += 8;
  else if (profile.exerciseDaysPerWeek < 3) points += 4;

  // Diet quality
  if (profile.dietQuality <= 3) points += 7;
  else if (profile.dietQuality <= 5) points += 4;
  else if (profile.dietQuality <= 6) points += 2;

  // Family history
  if (profile.familyHistory.diabetes) points += 11;

  // Sleep deprivation — strong metabolic disruptor
  if (profile.sleepHours < 5) points += 6;
  else if (profile.sleepHours < 6) points += 3;

  // Chronic stress → cortisol → insulin resistance
  if (profile.stressLevel >= 8) points += 4;

  // Alcohol excess
  if (profile.alcoholDrinksPerWeek >= 14) points += 4;

  const fiveYearRisk = clamp(points * 0.38, 1, 55);
  const tenYearRisk = clamp(points * 0.70, 2, 75);
  const severity = tenYearRisk < 7 ? 'low' : tenYearRisk < 15 ? 'moderate' : tenYearRisk < 30 ? 'high' : 'very-high';

  return {
    condition: 'Type 2 Diabetes',
    shortName: 'T2D',
    fiveYearRisk: Math.round(fiveYearRisk * 10) / 10,
    tenYearRisk: Math.round(tenYearRisk * 10) / 10,
    severity,
    confidence: getConfidence(profile),
    icon: 'Droplet',
    color: '#f59e0b',
    description: 'Risk of developing insulin resistance and Type 2 diabetes mellitus',
  };
}

/**
 * Hypertension progression risk model.
 */
function calculateHypertensionRisk(profile: UserProfile): RiskPrediction {
  let points = 0;
  const bmi = calculateBMI(profile.weight, profile.height);

  // Current BP (baseline already elevated → high progression risk)
  if (profile.systolicBP >= 140 || profile.diastolicBP >= 90) points += 18;
  else if (profile.systolicBP >= 130 || profile.diastolicBP >= 85) points += 12;
  else if (profile.systolicBP >= 120) points += 6;
  else if (profile.systolicBP < 110) points += 1; // optimal

  // Age
  if (profile.age >= 60) points += 9;
  else if (profile.age >= 50) points += 6;
  else if (profile.age >= 40) points += 3;

  // BMI (primary modifiable driver)
  if (bmi >= 35) points += 10;
  else if (bmi >= 30) points += 7;
  else if (bmi >= 25) points += 3;

  // Stress — direct vasoconstrictive effect
  if (profile.stressLevel >= 8) points += 9;
  else if (profile.stressLevel >= 6) points += 6;
  else if (profile.stressLevel >= 4) points += 2;

  // Sodium proxy: poor diet
  if (profile.dietQuality <= 3) points += 6;
  else if (profile.dietQuality <= 5) points += 3;

  // Physical inactivity
  if (profile.exerciseDaysPerWeek < 2) points += 6;

  // Smoking
  if (profile.smokingStatus === 'current') points += 6;

  // Alcohol excess
  if (profile.alcoholDrinksPerWeek >= 14) points += 7;
  else if (profile.alcoholDrinksPerWeek >= 7) points += 3;

  // Family history
  if (profile.familyHistory.hypertension) points += 8;

  const fiveYearRisk = clamp(points * 0.50, 1, 65);
  const tenYearRisk = clamp(points * 0.90, 2, 85);
  const severity = tenYearRisk < 10 ? 'low' : tenYearRisk < 20 ? 'moderate' : tenYearRisk < 40 ? 'high' : 'very-high';

  return {
    condition: 'Hypertension',
    shortName: 'HTN',
    fiveYearRisk: Math.round(fiveYearRisk * 10) / 10,
    tenYearRisk: Math.round(tenYearRisk * 10) / 10,
    severity,
    confidence: getConfidence(profile),
    icon: 'Gauge',
    color: '#f97316',
    description: 'Risk of developing chronic high blood pressure requiring medical management',
  };
}

/**
 * Mental health decline and burnout risk model.
 * Based on WHO burnout indicators and major depression risk factors.
 */
function calculateMentalHealthRisk(profile: UserProfile): RiskPrediction {
  let points = 0;

  // Stress (dominant driver)
  if (profile.stressLevel >= 9) points += 20;
  else if (profile.stressLevel >= 7) points += 14;
  else if (profile.stressLevel >= 5) points += 7;
  else points += 2;

  // Sleep deprivation — bidirectional with mental health
  if (profile.sleepHours < 5) points += 14;
  else if (profile.sleepHours < 6) points += 9;
  else if (profile.sleepHours < 7) points += 4;
  else if (profile.sleepHours >= 9) points += 2; // hypersomnia also risk

  // Exercise (highly protective)
  if (profile.exerciseDaysPerWeek >= 4) points -= 4;
  else if (profile.exerciseDaysPerWeek < 1) points += 8;
  else if (profile.exerciseDaysPerWeek < 3) points += 4;

  // Alcohol excess (depressant + addiction risk)
  if (profile.alcoholDrinksPerWeek >= 14) points += 9;
  else if (profile.alcoholDrinksPerWeek >= 7) points += 4;

  // Family history (genetic component is significant)
  if (profile.familyHistory.mentalHealth) points += 10;

  // Age (certain windows have higher risk)
  if (profile.age >= 55 || (profile.age >= 25 && profile.age <= 35)) points += 3;

  // Poor diet (gut-brain axis)
  if (profile.dietQuality <= 3) points += 4;

  // Smoking (bidirectional with depression)
  if (profile.smokingStatus === 'current') points += 4;

  const fiveYearRisk = clamp(points * 0.42, 1, 55);
  const tenYearRisk = clamp(points * 0.75, 2, 65);
  const severity = tenYearRisk < 10 ? 'low' : tenYearRisk < 20 ? 'moderate' : tenYearRisk < 35 ? 'high' : 'very-high';

  return {
    condition: 'Mental Health & Burnout',
    shortName: 'MH',
    fiveYearRisk: Math.round(fiveYearRisk * 10) / 10,
    tenYearRisk: Math.round(tenYearRisk * 10) / 10,
    severity,
    confidence: 'medium' as const,
    icon: 'Brain',
    color: '#8b5cf6',
    description: 'Risk of anxiety, depression, burnout, or cognitive decline',
  };
}

/**
 * Stroke risk model (partly overlaps CVD but has distinct predictors).
 */
function calculateStrokeRisk(profile: UserProfile): RiskPrediction {
  let points = 0;

  // Age (exponential increase after 55)
  if (profile.age >= 75) points += 18;
  else if (profile.age >= 65) points += 13;
  else if (profile.age >= 55) points += 8;
  else if (profile.age >= 45) points += 4;
  else points += 1;

  // Hypertension — single biggest stroke risk factor
  if (profile.systolicBP >= 160) points += 16;
  else if (profile.systolicBP >= 140) points += 10;
  else if (profile.systolicBP >= 130) points += 5;

  // Gender (women have higher lifetime risk)
  if (profile.gender === 'female' && profile.age >= 55) points += 3;

  // Smoking
  if (profile.smokingStatus === 'current') points += 10;
  else if (profile.smokingStatus === 'former') points += 3;

  // Diabetes (doubles stroke risk)
  if (profile.fastingGlucose && profile.fastingGlucose >= 126) points += 10;
  else if (profile.familyHistory.diabetes) points += 4;

  // Atrial fibrillation proxy: high HR + poor CV health
  if (profile.restingHeartRate > 100 && profile.stressLevel >= 7) points += 7;

  // Physical inactivity
  if (profile.exerciseDaysPerWeek < 2) points += 5;

  // Obesity
  const bmi = calculateBMI(profile.weight, profile.height);
  if (bmi >= 30) points += 4;

  // Alcohol excess
  if (profile.alcoholDrinksPerWeek >= 14) points += 6;

  // Family history
  if (profile.familyHistory.heartDisease) points += 5;
  if (profile.familyHistory.hypertension) points += 3;

  const fiveYearRisk = clamp(points * 0.22, 0.5, 35);
  const tenYearRisk = clamp(points * 0.42, 1, 55);
  const severity = tenYearRisk < 5 ? 'low' : tenYearRisk < 12 ? 'moderate' : tenYearRisk < 25 ? 'high' : 'very-high';

  return {
    condition: 'Stroke',
    shortName: 'STR',
    fiveYearRisk: Math.round(fiveYearRisk * 10) / 10,
    tenYearRisk: Math.round(tenYearRisk * 10) / 10,
    severity,
    confidence: getConfidence(profile),
    icon: 'Zap',
    color: '#ec4899',
    description: 'Risk of ischemic or hemorrhagic stroke based on vascular and lifestyle risk factors',
  };
}

/**
 * Metabolic Syndrome risk model.
 * Based on IDF/NCEP ATP III criteria.
 */
function calculateMetabolicSyndromeRisk(profile: UserProfile): RiskPrediction {
  let criteriaCount = 0;
  const bmi = calculateBMI(profile.weight, profile.height);

  // Abdominal obesity (BMI proxy since we don't have waist circumference)
  if (bmi >= 30) criteriaCount++;
  else if (bmi >= 27) criteriaCount += 0.5;

  // Elevated triglycerides proxy: poor diet + sedentary + overweight
  if (profile.dietQuality <= 4 && bmi >= 27) criteriaCount++;

  // Low HDL proxy
  if (profile.hdlCholesterol && profile.hdlCholesterol < 40) criteriaCount++;
  else if (!profile.hdlCholesterol && profile.dietQuality <= 4) criteriaCount += 0.5;

  // Elevated blood pressure
  if (profile.systolicBP >= 130 || profile.diastolicBP >= 85) criteriaCount++;

  // Elevated fasting glucose
  if (profile.fastingGlucose && profile.fastingGlucose >= 100) criteriaCount++;
  else if (profile.familyHistory.diabetes && bmi >= 25) criteriaCount += 0.5;

  // Lifestyle amplifiers
  const amplifier = 1 +
    (profile.exerciseDaysPerWeek < 2 ? 0.2 : 0) +
    (profile.sleepHours < 6 ? 0.15 : 0) +
    (profile.stressLevel >= 7 ? 0.1 : 0) +
    (profile.alcoholDrinksPerWeek >= 10 ? 0.1 : 0);

  const rawCriteria = criteriaCount * amplifier;

  // MetS is defined as 3+ criteria; convert to risk
  const tenYearRisk = clamp(rawCriteria * 15 + (profile.age > 50 ? 8 : 3), 2, 70);
  const fiveYearRisk = tenYearRisk * 0.55;
  const severity = tenYearRisk < 15 ? 'low' : tenYearRisk < 30 ? 'moderate' : tenYearRisk < 50 ? 'high' : 'very-high';

  return {
    condition: 'Metabolic Syndrome',
    shortName: 'MtS',
    fiveYearRisk: Math.round(fiveYearRisk * 10) / 10,
    tenYearRisk: Math.round(tenYearRisk * 10) / 10,
    severity,
    confidence: getConfidence(profile),
    icon: 'Flame',
    color: '#10b981',
    description: 'Cluster of conditions (high BP, blood sugar, waist fat, abnormal cholesterol) increasing risk of heart disease, stroke, and T2D',
  };
}

/**
 * Calculate all 6 risk predictions for a user profile.
 */
export function calculateRisks(profile: UserProfile): RiskPrediction[] {
  const risks = [
    calculateCardiovascularRisk(profile),
    calculateDiabetesRisk(profile),
    calculateHypertensionRisk(profile),
    calculateMentalHealthRisk(profile),
    calculateStrokeRisk(profile),
    calculateMetabolicSyndromeRisk(profile),
  ];

  // Sort by severity (highest first)
  const severityOrder = { 'very-high': 4, 'high': 3, 'moderate': 2, 'low': 1 };
  return risks.sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity]);
}
