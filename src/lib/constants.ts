// ============================================================
// VitalArc — Constants & Scoring Weights
// ============================================================

// Bio Age Engine Weights
export const BIO_AGE_WEIGHTS = {
  bmi: 0.12,
  sleep: 0.15,
  exercise: 0.15,
  diet: 0.10,
  smoking: 0.15,
  alcohol: 0.05,
  stress: 0.10,
  heartRate: 0.05,
  bloodPressure: 0.08,
  cholesterol: 0.05,
};

// Organ-specific weight distributions
export const ORGAN_WEIGHTS = {
  cardiovascular: {
    heartRate: 0.25,
    bloodPressure: 0.25,
    exercise: 0.15,
    smoking: 0.15,
    cholesterol: 0.10,
    stress: 0.05,
    diet: 0.05,
  },
  brain: {
    sleep: 0.25,
    stress: 0.25,
    exercise: 0.15,
    alcohol: 0.15,
    diet: 0.10,
    smoking: 0.10,
  },
  metabolic: {
    bmi: 0.25,
    diet: 0.25,
    exercise: 0.20,
    sleep: 0.10,
    stress: 0.10,
    alcohol: 0.10,
  },
  musculoskeletal: {
    exercise: 0.35,
    bmi: 0.20,
    diet: 0.15,
    smoking: 0.15,
    sleep: 0.10,
    stress: 0.05,
  },
};

// Health Score Weights
export const HEALTH_SCORE_WEIGHTS = {
  bioAge: 0.40,
  riskLevel: 0.30,
  lifestyle: 0.30,
};

// Optimal ranges
export const OPTIMAL_RANGES = {
  bmi: { min: 18.5, max: 24.9 },
  sleepHours: { min: 7, max: 9 },
  restingHeartRate: { min: 50, max: 70 },
  systolicBP: { min: 90, max: 120 },
  diastolicBP: { min: 60, max: 80 },
  exerciseDaysPerWeek: { min: 4, max: 7 },
  dietQuality: { min: 7, max: 10 },
  stressLevel: { min: 1, max: 3 },
  alcoholDrinksPerWeek: { min: 0, max: 3 },
  fastingGlucose: { min: 70, max: 100 },
  totalCholesterol: { min: 125, max: 200 },
  hdlCholesterol: { min: 40, max: 60 },
  ldlCholesterol: { min: 0, max: 100 },
};

// Grade thresholds
export const GRADE_THRESHOLDS: [number, string][] = [
  [95, 'A+'],
  [90, 'A'],
  [85, 'B+'],
  [80, 'B'],
  [70, 'C+'],
  [60, 'C'],
  [50, 'D'],
  [0, 'F'],
];

// Risk severity thresholds
export const RISK_SEVERITY = {
  low: { max: 10, color: '#10b981', label: 'Low' },
  moderate: { max: 20, color: '#f59e0b', label: 'Moderate' },
  high: { max: 35, color: '#f97316', label: 'High' },
  'very-high': { max: 100, color: '#ef4444', label: 'Very High' },
};

// Timeline zones
export const TIMELINE_ZONES = {
  safe: { color: '#10b981', label: 'Safe Zone' },
  warning: { color: '#f59e0b', label: 'Warning Zone' },
  danger: { color: '#ef4444', label: 'Danger Zone' },
};

// Organ metadata
export const ORGAN_META = {
  cardiovascular: {
    label: 'Heart & Cardiovascular',
    icon: '❤️',
    color: '#ef4444',
  },
  brain: {
    label: 'Brain & Cognitive',
    icon: '🧠',
    color: '#8b5cf6',
  },
  metabolic: {
    label: 'Metabolic System',
    icon: '🔥',
    color: '#f59e0b',
  },
  musculoskeletal: {
    label: 'Muscles & Bones',
    icon: '💪',
    color: '#06b6d4',
  },
};

// Form step labels
export const FORM_STEPS = [
  { id: 'demographics', label: 'Demographics', icon: '👤' },
  { id: 'vitals', label: 'Vitals', icon: '💓' },
  { id: 'lifestyle', label: 'Lifestyle', icon: '🏃' },
  { id: 'mental', label: 'Mental Health', icon: '🧘' },
  { id: 'labs', label: 'Lab Results', icon: '🧪' },
  { id: 'family', label: 'Family History', icon: '👨‍👩‍👧‍👦' },
];

// Disclaimer
export const DISCLAIMER_TEXT = `⚠️ VitalArc is an educational and informational tool designed for hackathon demonstration purposes only. It is NOT a substitute for professional medical advice, diagnosis, or treatment. Never disregard professional medical advice or delay seeking it because of information provided by this application. Always consult with a qualified healthcare provider for any health concerns. The risk predictions and biological age calculations use simplified models and should not be used for actual medical decision-making.`;
