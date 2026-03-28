// ============================================================
// VitalArc — Risk Prediction Engine
// ============================================================

import { UserProfile, RiskPrediction } from '@/lib/types';
import { calculateBMI, getConfidenceFromData, clamp } from '@/lib/utils';

/**
 * Simplified Framingham-inspired cardiovascular risk model.
 */
function calculateCardiovascularRisk(profile: UserProfile): RiskPrediction {
  let riskScore = 0;
  const bmi = calculateBMI(profile.weight, profile.height);

  // Age factor
  riskScore += profile.age > 55 ? 15 : profile.age > 45 ? 10 : profile.age > 35 ? 5 : 2;

  // Gender
  if (profile.gender === 'male') riskScore += 3;

  // Blood pressure
  if (profile.systolicBP > 140) riskScore += 12;
  else if (profile.systolicBP > 130) riskScore += 8;
  else if (profile.systolicBP > 120) riskScore += 4;

  // Cholesterol
  if (profile.totalCholesterol && profile.totalCholesterol > 240) riskScore += 10;
  else if (profile.totalCholesterol && profile.totalCholesterol > 200) riskScore += 5;

  if (profile.hdlCholesterol && profile.hdlCholesterol < 40) riskScore += 6;

  // Smoking
  if (profile.smokingStatus === 'current') riskScore += 12;
  else if (profile.smokingStatus === 'former') riskScore += 4;

  // BMI
  if (bmi > 30) riskScore += 6;
  else if (bmi > 25) riskScore += 3;

  // Exercise
  if (profile.exerciseDaysPerWeek < 2) riskScore += 5;

  // Family history
  if (profile.familyHistory.heartDisease) riskScore += 8;

  // Stress
  if (profile.stressLevel > 7) riskScore += 4;

  const fiveYearRisk = clamp(riskScore * 0.6, 1, 60);
  const tenYearRisk = clamp(riskScore * 1.1, 2, 80);

  const severity = tenYearRisk < 10 ? 'low' : tenYearRisk < 20 ? 'moderate' : tenYearRisk < 35 ? 'high' : 'very-high';

  return {
    condition: 'Cardiovascular Disease',
    shortName: 'CVD',
    fiveYearRisk: Math.round(fiveYearRisk * 10) / 10,
    tenYearRisk: Math.round(tenYearRisk * 10) / 10,
    severity,
    confidence: getConfidenceFromData(profile),
    icon: '❤️',
    color: '#ef4444',
    description: 'Risk of heart attack, stroke, or other cardiovascular events',
  };
}

/**
 * Type 2 Diabetes risk model.
 */
function calculateDiabetesRisk(profile: UserProfile): RiskPrediction {
  let riskScore = 0;
  const bmi = calculateBMI(profile.weight, profile.height);

  // Age
  riskScore += profile.age > 50 ? 10 : profile.age > 40 ? 6 : profile.age > 30 ? 3 : 1;

  // BMI (strongest predictor)
  if (bmi > 35) riskScore += 15;
  else if (bmi > 30) riskScore += 10;
  else if (bmi > 25) riskScore += 5;

  // Fasting glucose
  if (profile.fastingGlucose && profile.fastingGlucose > 125) riskScore += 15;
  else if (profile.fastingGlucose && profile.fastingGlucose > 100) riskScore += 8;

  // Exercise
  if (profile.exerciseDaysPerWeek < 2) riskScore += 6;
  else if (profile.exerciseDaysPerWeek < 4) riskScore += 3;

  // Diet
  if (profile.dietQuality < 4) riskScore += 6;
  else if (profile.dietQuality < 6) riskScore += 3;

  // Family history
  if (profile.familyHistory.diabetes) riskScore += 10;

  // Sleep
  if (profile.sleepHours < 6) riskScore += 4;

  // Stress
  if (profile.stressLevel > 7) riskScore += 3;

  const fiveYearRisk = clamp(riskScore * 0.55, 1, 55);
  const tenYearRisk = clamp(riskScore * 1.0, 2, 75);

  const severity = tenYearRisk < 10 ? 'low' : tenYearRisk < 20 ? 'moderate' : tenYearRisk < 35 ? 'high' : 'very-high';

  return {
    condition: 'Type 2 Diabetes',
    shortName: 'T2D',
    fiveYearRisk: Math.round(fiveYearRisk * 10) / 10,
    tenYearRisk: Math.round(tenYearRisk * 10) / 10,
    severity,
    confidence: getConfidenceFromData(profile),
    icon: '🩸',
    color: '#f59e0b',
    description: 'Risk of developing insulin resistance and Type 2 diabetes',
  };
}

/**
 * Hypertension risk model.
 */
function calculateHypertensionRisk(profile: UserProfile): RiskPrediction {
  let riskScore = 0;
  const bmi = calculateBMI(profile.weight, profile.height);

  // Current BP (if already elevated, risk of progression is high)
  if (profile.systolicBP > 140 || profile.diastolicBP > 90) riskScore += 15;
  else if (profile.systolicBP > 130 || profile.diastolicBP > 85) riskScore += 10;
  else if (profile.systolicBP > 120 || profile.diastolicBP > 80) riskScore += 5;

  // Age
  riskScore += profile.age > 50 ? 8 : profile.age > 40 ? 5 : profile.age > 30 ? 3 : 1;

  // BMI
  if (bmi > 30) riskScore += 8;
  else if (bmi > 25) riskScore += 4;

  // Stress (major factor)
  if (profile.stressLevel > 8) riskScore += 8;
  else if (profile.stressLevel > 6) riskScore += 5;
  else if (profile.stressLevel > 4) riskScore += 2;

  // Diet (sodium proxy)
  if (profile.dietQuality < 4) riskScore += 5;

  // Exercise
  if (profile.exerciseDaysPerWeek < 2) riskScore += 5;

  // Smoking
  if (profile.smokingStatus === 'current') riskScore += 5;

  // Alcohol
  if (profile.alcoholDrinksPerWeek > 7) riskScore += 5;

  // Family history
  if (profile.familyHistory.hypertension) riskScore += 7;

  const fiveYearRisk = clamp(riskScore * 0.65, 1, 60);
  const tenYearRisk = clamp(riskScore * 1.2, 2, 80);

  const severity = tenYearRisk < 10 ? 'low' : tenYearRisk < 20 ? 'moderate' : tenYearRisk < 35 ? 'high' : 'very-high';

  return {
    condition: 'Hypertension',
    shortName: 'HTN',
    fiveYearRisk: Math.round(fiveYearRisk * 10) / 10,
    tenYearRisk: Math.round(tenYearRisk * 10) / 10,
    severity,
    confidence: getConfidenceFromData(profile),
    icon: '📊',
    color: '#f97316',
    description: 'Risk of developing high blood pressure requiring treatment',
  };
}

/**
 * Mental health decline risk model.
 */
function calculateMentalHealthRisk(profile: UserProfile): RiskPrediction {
  let riskScore = 0;

  // Stress (strongest predictor)
  if (profile.stressLevel > 8) riskScore += 15;
  else if (profile.stressLevel > 6) riskScore += 10;
  else if (profile.stressLevel > 4) riskScore += 5;

  // Sleep
  if (profile.sleepHours < 5) riskScore += 12;
  else if (profile.sleepHours < 6) riskScore += 8;
  else if (profile.sleepHours < 7) riskScore += 4;

  // Exercise (protective)
  if (profile.exerciseDaysPerWeek < 1) riskScore += 8;
  else if (profile.exerciseDaysPerWeek < 3) riskScore += 4;

  // Alcohol
  if (profile.alcoholDrinksPerWeek > 10) riskScore += 6;
  else if (profile.alcoholDrinksPerWeek > 5) riskScore += 3;

  // Family history
  if (profile.familyHistory.mentalHealth) riskScore += 8;

  // Age factor (decline risk increases)
  riskScore += profile.age > 50 ? 5 : profile.age > 40 ? 3 : 1;

  // Diet
  if (profile.dietQuality < 4) riskScore += 3;

  const fiveYearRisk = clamp(riskScore * 0.55, 1, 50);
  const tenYearRisk = clamp(riskScore * 1.0, 2, 70);

  const severity = tenYearRisk < 10 ? 'low' : tenYearRisk < 20 ? 'moderate' : tenYearRisk < 35 ? 'high' : 'very-high';

  return {
    condition: 'Mental Health Decline',
    shortName: 'MHD',
    fiveYearRisk: Math.round(fiveYearRisk * 10) / 10,
    tenYearRisk: Math.round(tenYearRisk * 10) / 10,
    severity,
    confidence: 'medium' as const,
    icon: '🧠',
    color: '#8b5cf6',
    description: 'Risk of anxiety, depression, or cognitive decline',
  };
}

/**
 * Calculate all risk predictions for a user profile.
 */
export function calculateRisks(profile: UserProfile): RiskPrediction[] {
  return [
    calculateCardiovascularRisk(profile),
    calculateDiabetesRisk(profile),
    calculateHypertensionRisk(profile),
    calculateMentalHealthRisk(profile),
  ];
}
