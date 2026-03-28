// ============================================================
// VitalArc — AI Coach Engine v3
// Routes all Gemini calls through /api/ai (server-side key)
// Privacy: Only anonymized data sent to AI
// ============================================================

import { UserProfile, BiologicalAgeResult, RiskPrediction, HealthScore, CoachOutput, HabitChange, Recommendation } from '@/lib/types';

// In-memory rate limit (client side backup)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const LIMIT = 10;
const WINDOW = 60 * 60 * 1000;

function checkClientRateLimit(id: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(id);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(id, { count: 1, resetAt: now + WINDOW });
    return { allowed: true, remaining: LIMIT - 1 };
  }
  if (entry.count >= LIMIT) return { allowed: false, remaining: 0 };
  entry.count++;
  return { allowed: true, remaining: LIMIT - entry.count };
}

function sanitize(s: unknown): string {
  if (typeof s !== 'string') return '';
  return s.replace(/[<>{}"'`\\;()]/g, '').trim().slice(0, 200);
}

function clampNum(v: unknown, min: number, max: number): number {
  const n = Number(v);
  return isNaN(n) ? min : Math.max(min, Math.min(max, Math.round(n)));
}

/**
 * Build privacy-safe prompt — no PII, only anonymized brackets
 */
function buildPrompt(
  profile: UserProfile,
  bioAge: BiologicalAgeResult,
  risks: RiskPrediction[],
  healthScore: HealthScore,
  impacts: HabitChange[]
): string {
  const age = clampNum(profile.age, 10, 120);
  const ageBracket = age < 30 ? '18-29' : age < 40 ? '30-39' : age < 50 ? '40-49' : age < 60 ? '50-59' : '60+';
  const bmi = parseFloat((profile.weight / ((profile.height / 100) ** 2)).toFixed(1));
  const bmiCategory = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Healthy' : bmi < 30 ? 'Overweight' : 'Obese';
  const gender = ['male', 'female', 'other'].includes(profile.gender) ? profile.gender : 'unspecified';
  const sleep = clampNum(profile.sleepHours, 3, 12);
  const exercise = clampNum(profile.exerciseDaysPerWeek, 0, 7);
  const diet = clampNum(profile.dietQuality, 1, 10);
  const stress = clampNum(profile.stressLevel, 1, 10);
  const smoking = ['never', 'former', 'current'].includes(profile.smokingStatus) ? profile.smokingStatus : 'unspecified';
  const alcohol = clampNum(profile.alcoholDrinksPerWeek, 0, 50);
  // Injuries / conditions
  const conditions = profile.healthConditions?.length
    ? profile.healthConditions.join(', ')
    : 'None reported';

  const topRisk = risks.reduce((p, c) => c.tenYearRisk > p.tenYearRisk ? c : p, risks[0]);

  return `You are a clinical preventive health coach AI. Generate personalized coaching recommendations.

ANONYMIZED HEALTH PROFILE:
- Age bracket: ${ageBracket}
- Gender: ${gender}
- BMI category: ${bmiCategory} (${bmi} kg/m²)
- Sleep: ${sleep} hours/night
- Exercise: ${exercise} days/week
- Diet quality: ${diet}/10
- Stress: ${stress}/10
- Smoking: ${smoking}
- Alcohol: ${alcohol} drinks/week
- Biological age delta: ${bioAge.delta > 0 ? '+' : ''}${bioAge.delta.toFixed(1)} years
- Health score: ${healthScore.overall}/100
- Highest risk: ${sanitize(topRisk?.condition || 'N/A')} at ${Math.round(topRisk?.tenYearRisk || 0)}% (10-year)
- KNOWN INJURIES / CONDITIONS: ${conditions}

IMPORTANT: If the user has injuries or conditions (e.g., knee pain, sprain, back injury), you MUST adjust every recommendation to be safe and achievable for them. Never recommend high-impact exercise for injured individuals. Suggest physio-approved alternatives like swimming, seated exercise, or water aerobics.

Top impact opportunities:
${impacts.slice(0, 4).map((i, n) => `${n + 1}. ${sanitize(i.label)} → -${i.bioAgeImpact}y bio age, +${i.scoreImpact} score`).join('\n')}

MEDICAL EDUCATION DISCLAIMER: These are informational insights only, not medical advice.

Respond ONLY with valid JSON matching this schema exactly:
{
  "recommendations": [
    {
      "rank": 1,
      "action": "Specific action title",
      "rationale": "Why this matters based on their profile (2-3 sentences). Reference clinical guidelines.",
      "estimatedImpact": "Quantified expected improvement",
      "howToStart": "Concrete first steps today, adapted for any conditions/injuries",
      "isMostImportant": true,
      "icon": "🏃",
      "category": "Category name",
      "citation": "Source: AHA/WHO/ACSM Guidelines (year)",
      "citationUrl": "https://specific-guideline-url.org"
    }
  ],
  "futureStory": "Motivational 2-3 sentence trajectory narrative. No personal names. Mention age milestone.",
  "mostImportantChange": "Single sentence summary of top priority"
}

Return exactly 3 recommendations. No markdown. Pure JSON only.`;
}

/**
 * Rule-based fallback engine (works without AI)
 */
function ruleBasedFallback(
  profile: UserProfile,
  _bioAge: BiologicalAgeResult,
  risks: RiskPrediction[],
  _healthScore: HealthScore,
  impacts: HabitChange[]
): CoachOutput {
  const conditions = profile.healthConditions || [];
  const hasInjury = conditions.some(c => /pain|sprain|injury|fracture|arthritis|surgery/i.test(c));

  const categoryMap: Record<string, string> = {
    sleep: 'Sleep', exercise: 'Exercise', diet: 'Nutrition',
    stress: 'Mental Wellness', smoking: 'Smoking Cessation', alcohol: 'Alcohol',
  };

  const actionMap: Record<string, { action: string; howToStart: string; citation: string; citationUrl: string }> = {
    sleep: {
      action: 'Increase sleep to 7-8 hours per night',
      howToStart: 'Set a consistent bedtime alarm. Avoid screens 1 hour before bed. Keep the room cool (18-20°C).',
      citation: 'National Sleep Foundation Guidelines (2023)',
      citationUrl: 'https://www.sleepfoundation.org/how-sleep-works/how-much-sleep-do-we-really-need',
    },
    exercise: hasInjury ? {
      action: 'Start with low-impact activity adapted to your condition',
      howToStart: 'Consult your physiotherapist first. Consider swimming, water aerobics, or seated chair exercises — all joint-friendly.',
      citation: 'ACSM Exercise Guidelines for Special Populations (2022)',
      citationUrl: 'https://www.acsm.org/education-resources/books/guidelines-exercise-testing-prescription',
    } : {
      action: 'Increase physical activity to 5 days per week',
      howToStart: 'Start with 20-min brisk walks. Build up by 10 min per week. Try morning bodyweight exercises.',
      citation: 'WHO Physical Activity Guidelines (2020)',
      citationUrl: 'https://www.who.int/news-room/fact-sheets/detail/physical-activity',
    },
    diet: {
      action: 'Improve diet quality to at least 8/10',
      howToStart: 'Add one vegetable serving per meal. Replace processed snacks with fruits/nuts. Reduce sodium intake.',
      citation: 'AHA Dietary Guidelines (2021)',
      citationUrl: 'https://www.heart.org/en/healthy-living/healthy-eating/eat-smart/nutrition-basics',
    },
    stress: {
      action: 'Reduce stress level to below 4/10',
      howToStart: '10 minutes of deep breathing daily. 90-min work blocks with breaks. Progressive muscle relaxation at bedtime.',
      citation: 'WHO Mental Health Guidelines (2022)',
      citationUrl: 'https://www.who.int/news-room/fact-sheets/detail/mental-health-strengthening-our-response',
    },
  };

  const highestRisk = risks.reduce((p, c) => c.tenYearRisk > p.tenYearRisk ? c : p, risks[0]);
  const recs: Recommendation[] = impacts.slice(0, 3).map((impact, i) => {
    const actions = actionMap[impact.habit] || {
      action: impact.label,
      howToStart: 'Start with small daily improvements.',
      citation: 'VitalArc Clinical Engine',
      citationUrl: 'https://vitalarc.vercel.app/about',
    };
    const cat = categoryMap[impact.habit] || impact.habit;
    return {
      rank: i + 1,
      action: actions.action,
      rationale: `Improving ${cat.toLowerCase()} could reduce your ${highestRisk?.condition || 'health'} risk. Clinical evidence shows this is among the highest-return lifestyle interventions for your profile.`,
      estimatedImpact: `Biological age ↓ ${impact.bioAgeImpact}y, health score ↑ ${impact.scoreImpact}pts`,
      howToStart: actions.howToStart,
      isMostImportant: i === 0,
      icon: impact.icon || '⭐',
      category: cat,
      citation: actions.citation,
      citationUrl: actions.citationUrl,
    };
  });

  return {
    recommendations: recs,
    futureStory: `Based on your current health trajectory, focused improvements in ${impacts[0]?.label.toLowerCase() || 'lifestyle'} could meaningfully shift your biological age over the next 2-5 years. The clinical evidence is clear: consistent small changes compound powerfully. Your data shows real room for improvement — and that's actually great news.`,
    mostImportantChange: recs[0]?.action || 'Improve your top lifestyle factor',
  };
}

/**
 * Main export — calls server-side /api/ai route
 */
export async function generateCoachRecommendations(
  profile: UserProfile,
  bioAge: BiologicalAgeResult,
  risks: RiskPrediction[],
  healthScore: HealthScore,
  impacts: HabitChange[],
  _legacyApiKey?: string, // ignored — key is now server-side only
  userId?: string
): Promise<CoachOutput & { rateLimited?: boolean; remaining?: number; isAI?: boolean }> {

  const sessionKey = userId || 'anonymous';
  const { allowed, remaining } = checkClientRateLimit(sessionKey);
  if (!allowed) {
    return { ...ruleBasedFallback(profile, bioAge, risks, healthScore, impacts), rateLimited: true, remaining: 0, isAI: false };
  }

  try {
    const prompt = buildPrompt(profile, bioAge, risks, healthScore, impacts);

    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, userId: sessionKey, mode: 'coach' }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('[Coach API error]', res.status, err);
      // If 503 = no API key, fall back silently
      return { ...ruleBasedFallback(profile, bioAge, risks, healthScore, impacts), remaining, isAI: false };
    }

    const { text } = await res.json();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');

    const parsed = JSON.parse(jsonMatch[0]) as CoachOutput;
    return { ...parsed, remaining, isAI: true };
  } catch (err) {
    console.error('[Coach fallback to rule-based]', err);
    return { ...ruleBasedFallback(profile, bioAge, risks, healthScore, impacts), remaining, isAI: false };
  }
}
