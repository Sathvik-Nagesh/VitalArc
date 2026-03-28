// ============================================================
// VitalArc — Core Type Definitions
// ============================================================

export interface UserProfile {
  // Demographics
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number; // cm
  weight: number; // kg

  // Vitals
  sleepHours: number;
  restingHeartRate: number; // bpm
  systolicBP: number;
  diastolicBP: number;

  // Lifestyle
  exerciseDaysPerWeek: number; // 0-7
  dietQuality: number; // 1-10
  smokingStatus: 'never' | 'former' | 'current';
  alcoholDrinksPerWeek: number;

  // Mental
  stressLevel: number; // 1-10

  // Optional Labs
  fastingGlucose?: number; // mg/dL
  totalCholesterol?: number; // mg/dL
  hdlCholesterol?: number; // mg/dL
  ldlCholesterol?: number; // mg/dL

  // Family History
  familyHistory: {
    heartDisease: boolean;
    diabetes: boolean;
    hypertension: boolean;
    cancer: boolean;
    mentalHealth: boolean;
  };

  // Meta
  name?: string;
}

export interface OrganAge {
  organ: 'cardiovascular' | 'brain' | 'metabolic' | 'musculoskeletal';
  label: string;
  age: number;
  delta: number; // positive = older than chronological
  icon: string;
  color: string;
}

export interface BiologicalAgeResult {
  chronologicalAge: number;
  biologicalAge: number;
  delta: number;
  organAges: OrganAge[];
  factors: {
    name: string;
    impact: number; // years added by this factor being non-optimal
    status: 'good' | 'moderate' | 'poor';
    score?: number; // 0-1 metric score
    weight?: number; // factor weight in model
  }[];
  lifespan?: number; // estimated life expectancy
  dataConfidence?: 'low' | 'medium' | 'high';
}

export interface HealthScore {
  overall: number; // 0-100
  grade: string; // A+, A, B+, B, C+, C, D, F
  breakdown: {
    bioAgeScore: number;
    riskScore: number;
    lifestyleScore: number;
  };
  improvedScore?: number;
}

export interface RiskPrediction {
  condition: string;
  shortName: string;
  fiveYearRisk: number; // 0-100%
  tenYearRisk: number; // 0-100%
  severity: 'low' | 'moderate' | 'high' | 'very-high';
  confidence: 'low' | 'medium' | 'high';
  icon: string;
  color: string;
  description: string;
}

export interface TimelineEvent {
  age: number;
  year: number;
  event: string;
  severity: 'safe' | 'warning' | 'danger';
  riskType: string;
  probability: number;
}

export interface SimulationResult {
  originalBioAge: number;
  newBioAge: number;
  bioAgeDelta: number;
  originalScore: number;
  newScore: number;
  scoreDelta: number;
  originalRisks: RiskPrediction[];
  newRisks: RiskPrediction[];
  timelineEvents: TimelineEvent[];
}

export interface HabitChange {
  habit: string;
  label: string;
  bioAgeImpact: number;
  scoreImpact: number;
  riskReduction: number;
  rank: number;
  icon: string;
  condition?: string; // context on why this habit matters for this user
}

export interface Recommendation {
  rank: number;
  action: string;
  rationale: string;
  estimatedImpact: string;
  howToStart: string;
  isMostImportant: boolean;
  icon: string;
  category: string;
}

export interface CoachOutput {
  recommendations: Recommendation[];
  futureStory: string;
  mostImportantChange: string;
}

export interface DailyLog {
  date: string; // ISO date
  sleepHours: number;
  steps: number;
  mood: number; // 1-5
  notes?: string;
}

export interface WeeklyTrend {
  dates: string[];
  sleepData: number[];
  stepsData: number[];
  streakDays: number;
}

export type Theme = 'dark' | 'light';

export interface SimulatorValues {
  sleepHours: number;
  exerciseDaysPerWeek: number;
  dietQuality: number;
  stressLevel: number;
  smokingStatus: 'never' | 'former' | 'current';
}
