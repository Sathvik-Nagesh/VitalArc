import { UserProfile } from '@/lib/types';
import { getDefaultProfile } from '@/lib/sampleProfiles';

interface ParsedField {
  field: string;
  value: number | string | boolean;
  confidence: number;
}

export function parseNaturalLanguage(input: string): Partial<UserProfile> {
  const text = input.toLowerCase().trim();
  const profile: Partial<UserProfile> = {};
  const parsed: ParsedField[] = [];

  // Age
  const ageMatch = text.match(/(?:i'm|i am|age|aged?)\s*(\d{1,3})/);
  if (ageMatch) {
    const age = parseInt(ageMatch[1]);
    if (age >= 10 && age <= 120) { profile.age = age; parsed.push({ field: 'age', value: age, confidence: 0.9 }); }
  }

  // Gender
  if (text.match(/\b(male|man|guy)\b/)) { profile.gender = 'male'; }
  else if (text.match(/\b(female|woman|girl)\b/)) { profile.gender = 'female'; }

  // Sleep
  const sleepMatch = text.match(/(?:sleep|sleeping)\s*(?:about|around|only)?\s*(\d{1,2})\s*(?:hours?|hrs?)?/);
  if (sleepMatch) { profile.sleepHours = parseInt(sleepMatch[1]); }

  // Exercise
  if (text.match(/(?:don'?t|never|no|rarely)\s*(?:exercise|work\s*out)/)) { profile.exerciseDaysPerWeek = 0; }
  else if (text.match(/(?:not much|little|barely)\s*(?:exercise|activity)/)) { profile.exerciseDaysPerWeek = 1; }
  else {
    const exMatch = text.match(/(?:exercise|work\s*out|gym)\s*(?:about)?\s*(\d)\s*(?:times?|days?)/);
    if (exMatch) { profile.exerciseDaysPerWeek = parseInt(exMatch[1]); }
  }

  // Smoking
  if (text.match(/(?:i |do )?smoke|smoking/)) {
    profile.smokingStatus = text.match(/(?:don'?t|quit|stopped|former)/) ? 'former' : 'current';
  } else if (text.match(/non.?smoker|never smoke/)) { profile.smokingStatus = 'never'; }

  // Stress
  const stressMatch = text.match(/stress(?:ed)?\s*(?:level)?\s*(?:about)?\s*(\d{1,2})/);
  if (stressMatch) { profile.stressLevel = Math.min(parseInt(stressMatch[1]), 10); }
  else if (text.match(/very\s*stress|high\s*stress/)) { profile.stressLevel = 9; }

  // BP
  const bpMatch = text.match(/(?:bp|blood\s*pressure)\s*(?:is)?\s*(\d{2,3})\s*[/\\]\s*(\d{2,3})/);
  if (bpMatch) { profile.systolicBP = parseInt(bpMatch[1]); profile.diastolicBP = parseInt(bpMatch[2]); }

  // Heart rate
  const hrMatch = text.match(/(?:heart\s*rate|pulse)\s*(?:is)?\s*(\d{2,3})/);
  if (hrMatch) { profile.restingHeartRate = parseInt(hrMatch[1]); }

  // Diet
  if (text.match(/(?:eat|diet)\s*(?:bad|poor|junk)/)) { profile.dietQuality = 3; }
  else if (text.match(/(?:eat|diet)\s*(?:good|healthy)/)) { profile.dietQuality = 8; }

  // Weight/Height
  const wKg = text.match(/(\d{2,3})\s*(?:kg|kilos?)/);
  if (wKg) { profile.weight = parseInt(wKg[1]); }
  const hCm = text.match(/(\d{2,3})\s*(?:cm|centimeters?)/);
  if (hCm) { profile.height = parseInt(hCm[1]); }

  // Family
  if (text.match(/family.*(?:heart|cardiac)/)) {
    profile.familyHistory = { heartDisease: true, diabetes: false, hypertension: false, cancer: false, mentalHealth: false };
  }
  if (text.match(/family.*(?:diabetes|sugar)/)) {
    profile.familyHistory = { ...profile.familyHistory, heartDisease: false, diabetes: true, hypertension: false, cancer: false, mentalHealth: false };
  }

  void parsed;
  return profile;
}

export function mergeWithDefaults(parsed: Partial<UserProfile>): UserProfile {
  const defaults = getDefaultProfile();
  return { ...defaults, ...parsed, familyHistory: { ...defaults.familyHistory, ...parsed.familyHistory } };
}
