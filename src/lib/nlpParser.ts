// ============================================================
// VitalArc — NLP Health Profile Parser v2
// Covers ~85% of common health descriptions
// ============================================================

import { UserProfile } from '@/lib/types';
import { getDefaultProfile } from '@/lib/sampleProfiles';

export function parseNaturalLanguage(input: string): Partial<UserProfile> {
  const text = input.toLowerCase().trim();
  const profile: Partial<UserProfile> = {};

  // ── AGE ──────────────────────────────────────────────────
  const agePatterns = [
    /\b(?:i'?m|i am|i'?m|aged?|age:?)\s*(\d{1,3})\b/,
    /\b(\d{1,3})\s*years?\s*old\b/,
    /\b(\d{1,3})[\s-]year[\s-]old\b/,
  ];
  for (const p of agePatterns) {
    const m = text.match(p);
    if (m) {
      const age = parseInt(m[1]);
      if (age >= 10 && age <= 110) { profile.age = age; break; }
    }
  }

  // ── GENDER ───────────────────────────────────────────────
  if (text.match(/\b(male|man|guy|he|his|boy)\b/)) profile.gender = 'male';
  else if (text.match(/\b(female|woman|girl|she|her)\b/)) profile.gender = 'female';

  // ── HEIGHT ───────────────────────────────────────────────
  const hCm = text.match(/\b(\d{2,3})\s*(?:cm|centime?tre?s?|centimeters?)\b/);
  if (hCm) profile.height = parseInt(hCm[1]);
  // Feet & inches: e.g. "5'10" or "5 feet 10 inches" or "5ft 10in"
  const hFt = text.match(/(\d)\s*(?:feet?|ft|'|′)\s*(\d{1,2})\s*(?:inches?|in|"|″)?/);
  if (hFt && !hCm) profile.height = Math.round(parseInt(hFt[1]) * 30.48 + parseInt(hFt[2]) * 2.54);
  const hFtOnly = text.match(/(\d)\s*(?:feet?|ft)\b(?!\s*\d)/);
  if (hFtOnly && !hCm && !hFt) profile.height = Math.round(parseInt(hFtOnly[1]) * 30.48);

  // ── WEIGHT ───────────────────────────────────────────────
  const wKg = text.match(/\b(\d{2,3})\s*(?:kg|kilograms?|kilos?)\b/);
  if (wKg) profile.weight = parseInt(wKg[1]);
  const wLb = text.match(/\b(\d{2,3})\s*(?:lbs?|pounds?)\b/);
  if (wLb && !wKg) profile.weight = Math.round(parseInt(wLb[1]) * 0.453592);

  // ── SLEEP ─────────────────────────────────────────────────
  const sleepPatterns = [
    /\b(?:sleep|sleeping|slept|get)\s*(?:about|around|only|just|roughly|barely)?\s*(\d(?:\.\d)?)\s*(?:hours?|hrs?)\b/,
    /\b(\d(?:\.\d)?)\s*(?:hours?|hrs?)\s*(?:of\s*)?sleep\b/,
    /\bsleep\s*(?:duration|time)?\s*(?:is|:)?\s*(\d(?:\.\d)?)\b/,
  ];
  for (const p of sleepPatterns) {
    const m = text.match(p);
    if (m) { profile.sleepHours = parseFloat(m[1]); break; }
  }
  // Qualitative sleep
  if (!profile.sleepHours) {
    if (text.match(/\b(?:barely|hardly|almost no)\s*sleep\b/)) profile.sleepHours = 4;
    else if (text.match(/\b(?:poor|bad|little)\s*sleep\b/)) profile.sleepHours = 5;
    else if (text.match(/\b(?:great|good|plenty\s*of)\s*sleep\b/)) profile.sleepHours = 8;
  }

  // ── EXERCISE ─────────────────────────────────────────────
  const noExercise = text.match(/\b(?:don'?t|never|no|not|rarely|seldom)\s*(?:exercise|work\s*out|work\s*out|gym|run|jog)\b/);
  if (noExercise) profile.exerciseDaysPerWeek = 0;
  else {
    const exDays = text.match(/\b(?:exercise|work\s*out|gym|run|jog|train|workout)\s*(?:about|around|roughly)?\s*(\d)\s*(?:times?|days?)\s*(?:a|per)?\s*(?:week|wk)?\b/);
    if (exDays) profile.exerciseDaysPerWeek = parseInt(exDays[1]);
    else {
      const daysMentioned = text.match(/\b(\d)\s*(?:times?|days?)\s*(?:a|per)?\s*(?:week|wk)\b/);
      if (daysMentioned) profile.exerciseDaysPerWeek = parseInt(daysMentioned[1]);
    }
    // Qualitative
    if (profile.exerciseDaysPerWeek === undefined) {
      if (text.match(/\bdaily\s*(?:exercise|workout|run)\b/)) profile.exerciseDaysPerWeek = 6;
      else if (text.match(/\b(?:sedentary|inactive|not very active)\b/)) profile.exerciseDaysPerWeek = 1;
      else if (text.match(/\b(?:very\s*active|highly\s*active|athlete)\b/)) profile.exerciseDaysPerWeek = 6;
      else if (text.match(/\b(?:moderately\s*active|semi.?active)\b/)) profile.exerciseDaysPerWeek = 3;
    }
  }

  // ── SMOKING ───────────────────────────────────────────────
  if (text.match(/\b(?:i\s*)?(?:don'?t|never|not a|non.?)\s*(?:smoke|smoker)\b/)) {
    profile.smokingStatus = 'never';
  } else if (text.match(/\b(?:quit|stopped|used to|ex.?)\s*(?:smok|cigarette|tobacco)\b/) ||
             text.match(/\b(?:former|ex)\s*smoker\b/)) {
    profile.smokingStatus = 'former';
  } else if (text.match(/\b(?:i\s*)?(?:smoke|smoker|smoking|cigarettes|tobacco)\b/)) {
    profile.smokingStatus = 'current';
  }

  // ── ALCOHOL ───────────────────────────────────────────────
  const alcoholDrinksPerWeek = text.match(/\b(\d+)\s*(?:drinks?|beers?|glasses?|units?)\s*(?:a|per)?\s*(?:week|wk)\b/);
  if (alcoholDrinksPerWeek) profile.alcoholDrinksPerWeek = parseInt(alcoholDrinksPerWeek[1]);
  else if (text.match(/\b(?:don'?t|never|no|not)\s*(?:drink|alcohol|booze)\b/)) profile.alcoholDrinksPerWeek = 0;
  else if (text.match(/\b(?:heavy|lot of)\s*(?:drinker|drinking|alcohol)\b/)) profile.alcoholDrinksPerWeek = 14;
  else if (text.match(/\b(?:occasional|social|rarely|light)\s*(?:drinker|drinking|drink)\b/)) profile.alcoholDrinksPerWeek = 2;

  // ── STRESS ────────────────────────────────────────────────
  const stressNum = text.match(/\bstress(?:ed|ful|level)?\s*(?:level|rating|score)?\s*(?:is|of|:)?\s*(\d{1,2})(?:\s*\/\s*10)?\b/);
  if (stressNum) profile.stressLevel = Math.min(parseInt(stressNum[1]), 10);
  else if (text.match(/\b(?:extremely|very|super|incredibly)\s*stress(?:ed|ful)\b/)) profile.stressLevel = 9;
  else if (text.match(/\b(?:quite|pretty|fairly|very)\s*stress(?:ed|ful)\b/)) profile.stressLevel = 7;
  else if (text.match(/\b(?:moderately|somewhat|a bit)\s*stress(?:ed|ful)\b/)) profile.stressLevel = 5;
  else if (text.match(/\b(?:low|minimal|no|not much)\s*stress\b/)) profile.stressLevel = 2;
  else if (text.match(/\b(?:very\s*high|constant|chronic)\s*stress\b/)) profile.stressLevel = 9;

  // ── BLOOD PRESSURE ────────────────────────────────────────
  const bpSlash = text.match(/\b(?:bp|blood\s*pressure|b\.?p\.?)?\s*(1\d{2})\s*[\/\\over]\s*(\d{2,3})\b/);
  if (bpSlash) { profile.systolicBP = parseInt(bpSlash[1]); profile.diastolicBP = parseInt(bpSlash[2]); }
  else {
    const systOnly = text.match(/\bsystolic\s*(?:bp|pressure|is)?\s*(1\d{2})\b/);
    if (systOnly) profile.systolicBP = parseInt(systOnly[1]);
    if (text.match(/\b(?:high blood pressure|hypertension)\b/)) {
      profile.systolicBP = profile.systolicBP ?? 145;
      profile.diastolicBP = profile.diastolicBP ?? 90;
    } else if (text.match(/\b(?:normal blood pressure|good bp)\b/)) {
      profile.systolicBP = profile.systolicBP ?? 118;
      profile.diastolicBP = profile.diastolicBP ?? 76;
    }
  }

  // ── HEART RATE ────────────────────────────────────────────
  const hr = text.match(/\b(?:heart\s*rate|pulse|resting\s*hr|bpm)\s*(?:is|of|:)?\s*(\d{2,3})\b/);
  if (hr) profile.restingHeartRate = parseInt(hr[1]);
  else {
    const bpmSuffix = text.match(/\b(\d{2,3})\s*bpm\b/);
    if (bpmSuffix) profile.restingHeartRate = parseInt(bpmSuffix[1]);
  }

  // ── DIET QUALITY ─────────────────────────────────────────
  const dietScore = text.match(/\b(?:diet|eating|nutrition)\s*(?:quality|score|rating)?\s*(?:is|of|:)?\s*(\d{1,2})(?:\s*\/\s*10)?\b/);
  if (dietScore) profile.dietQuality = Math.min(parseInt(dietScore[1]), 10);
  else if (text.match(/\b(?:terrible|awful|junk|fast\s*food|very\s*bad|unhealthy)\s*(?:diet|eating|food)\b/)) profile.dietQuality = 2;
  else if (text.match(/\b(?:poor|bad|not\s*great)\s*(?:diet|eating|food)\b/)) profile.dietQuality = 4;
  else if (text.match(/\b(?:average|ok|decent|moderate)\s*(?:diet|eating|food)\b/)) profile.dietQuality = 6;
  else if (text.match(/\b(?:good|healthy|balanced)\s*(?:diet|eating|food)\b/)) profile.dietQuality = 8;
  else if (text.match(/\b(?:excellent|great|very\s*healthy|clean)\s*(?:diet|eating|food)\b/)) profile.dietQuality = 9;

  // ── LAB VALUES ────────────────────────────────────────────
  // Cholesterol
  const cholMatch = text.match(/\b(?:cholesterol|total\s*cholesterol)\s*(?:is|of|:)?\s*(\d{2,3})\b/);
  if (cholMatch) profile.totalCholesterol = parseInt(cholMatch[1]);
  const hdlMatch = text.match(/\bhdl\s*(?:cholesterol|is|:)?\s*(\d{2,3})\b/);
  if (hdlMatch) profile.hdlCholesterol = parseInt(hdlMatch[1]);
  const ldlMatch = text.match(/\bldl\s*(?:cholesterol|is|:)?\s*(\d{2,3})\b/);
  if (ldlMatch) profile.ldlCholesterol = parseInt(ldlMatch[1]);

  // Fasting glucose / blood sugar
  const glucoseMatch = text.match(/\b(?:blood\s*sugar|glucose|fasting\s*(?:glucose|sugar))\s*(?:is|of|:)?\s*(\d{2,3})\b/);
  if (glucoseMatch) profile.fastingGlucose = parseInt(glucoseMatch[1]);
  else if (text.match(/\b(?:diabetic|diabetes)\b/) && !profile.fastingGlucose) profile.fastingGlucose = 140;
  else if (text.match(/\b(?:pre.?diabetic|pre\s*diabetes)\b/) && !profile.fastingGlucose) profile.fastingGlucose = 112;

  // ── FAMILY HISTORY ────────────────────────────────────────
  const fh = { heartDisease: false, diabetes: false, hypertension: false, cancer: false, mentalHealth: false };
  if (text.match(/\bfamily\s*(?:history\s*of\s*)?(?:heart|cardiac|cvd|coronary)\b/)) fh.heartDisease = true;
  if (text.match(/\b(?:parent|mother|father|mom|dad|sibling)s?\s*(?:had|has|with)\s*(?:heart|cardiac)\b/)) fh.heartDisease = true;
  if (text.match(/\bfamily\s*(?:history\s*of\s*)?(?:diabetes|diabetic)\b/)) fh.diabetes = true;
  if (text.match(/\b(?:parent|mother|father|mom|dad|sibling)s?\s*(?:had|has|with)\s*(?:diabetes|diabetic)\b/)) fh.diabetes = true;
  if (text.match(/\bfamily\s*(?:history\s*of\s*)?(?:hypertension|high\s*blood\s*pressure|hbp)\b/)) fh.hypertension = true;
  if (text.match(/\bfamily\s*(?:history\s*of\s*)?(?:cancer|tumor)\b/)) fh.cancer = true;
  if (text.match(/\bfamily\s*(?:history\s*of\s*)?(?:depression|anxiety|mental\s*health|psychiatric)\b/)) fh.mentalHealth = true;

  if (Object.values(fh).some(Boolean)) {
    profile.familyHistory = { ...fh };
  }

  return profile;
}

export function mergeWithDefaults(parsed: Partial<UserProfile>): UserProfile {
  const defaults = getDefaultProfile();
  return {
    ...defaults,
    ...parsed,
    familyHistory: {
      ...defaults.familyHistory,
      ...parsed.familyHistory,
    },
  };
}
