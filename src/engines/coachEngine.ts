// ============================================================
// VitalArc — AI Coach Engine (Gemini-powered)
// ============================================================

import { UserProfile, BiologicalAgeResult, RiskPrediction, HealthScore, Recommendation, CoachOutput, HabitChange } from '@/lib/types';

/**
 * Rule-based recommendation fallback when Gemini API is unavailable.
 */
function generateRuleBasedRecommendations(
  profile: UserProfile,
  bioAge: BiologicalAgeResult,
  risks: RiskPrediction[],
  _healthScore: HealthScore,
  impacts: HabitChange[]
): CoachOutput {
  const recommendations: Recommendation[] = [];

  // Use impact rankings to determine recommendations
  const topImpacts = impacts.slice(0, 3);

  const categoryMap: Record<string, string> = {
    sleep: 'Sleep',
    exercise: 'Exercise',
    diet: 'Nutrition',
    stress: 'Mental Wellness',
    smoking: 'Smoking Cessation',
  };

  const actionMap: Record<string, { action: string; howToStart: string }> = {
    sleep: {
      action: `Increase your sleep from ${profile.sleepHours} hours to 7-8 hours per night`,
      howToStart: 'Set a bedtime alarm 8 hours before your wake time. Eliminate screens 1 hour before bed. Keep your bedroom cool and dark.',
    },
    exercise: {
      action: `Increase physical activity from ${profile.exerciseDaysPerWeek} to 5 days per week`,
      howToStart: 'Start with 20-minute brisk walks after dinner. Add one day per week gradually. Try a morning routine of bodyweight exercises.',
    },
    diet: {
      action: `Improve your diet quality from ${profile.dietQuality}/10 to at least 8/10`,
      howToStart: 'Add one serving of vegetables to each meal. Replace processed snacks with fruits and nuts. Cook at home at least 4 times per week.',
    },
    stress: {
      action: `Reduce your stress from ${profile.stressLevel}/10 to below 4/10`,
      howToStart: 'Practice 10 minutes of deep breathing or meditation daily. Take short breaks every 90 minutes during work. Try journaling before bed.',
    },
    smoking: {
      action: 'Quit smoking completely',
      howToStart: 'Consult your doctor about cessation aids. Set a quit date within 2 weeks. Identify your triggers and plan alternatives.',
    },
  };

  topImpacts.forEach((impact, index) => {
    const category = categoryMap[impact.habit] || impact.habit;
    const actions = actionMap[impact.habit] || { action: impact.label, howToStart: 'Start today with small changes.' };

    const highestRisk = risks.reduce((prev, curr) => 
      curr.tenYearRisk > prev.tenYearRisk ? curr : prev
    );

    let rationale = '';
    if (impact.habit === 'sleep') {
      rationale = `Your current sleep of ${profile.sleepHours} hours is below the optimal 7-9 hours. Poor sleep accelerates biological aging by disrupting cellular repair processes and increasing cortisol levels. With your ${highestRisk.condition} risk at ${highestRisk.tenYearRisk}%, improving sleep could reduce this significantly.`;
    } else if (impact.habit === 'exercise') {
      rationale = `At ${profile.exerciseDaysPerWeek} days of exercise per week, you're below the recommended minimum. Regular physical activity reduces cardiovascular risk by up to 30%, improves insulin sensitivity, and strengthens your musculoskeletal system. Your biological age is ${bioAge.delta > 0 ? bioAge.delta + ' years older' : Math.abs(bioAge.delta) + ' years younger'} than your actual age — exercise is one of the most powerful ways to reverse this.`;
    } else if (impact.habit === 'diet') {
      rationale = `Your diet quality score of ${profile.dietQuality}/10 suggests room for improvement. Nutrition directly impacts your metabolic age (currently ${bioAge.organAges.find(o => o.organ === 'metabolic')?.age || 'elevated'}) and plays a key role in diabetes and cardiovascular prevention.`;
    } else if (impact.habit === 'stress') {
      rationale = `Your stress level of ${profile.stressLevel}/10 is significantly elevated. Chronic stress increases cortisol, raises blood pressure, disrupts sleep, and accelerates brain aging. Your brain age is estimated at ${bioAge.organAges.find(o => o.organ === 'brain')?.age || 'elevated'}, and stress reduction could meaningfully lower it.`;
    } else if (impact.habit === 'smoking') {
      rationale = `Smoking is the single largest modifiable risk factor for cardiovascular disease and cancer. Quitting can reduce your cardiovascular risk by up to 50% within one year and normalize your lung function within 5-10 years.`;
    }

    recommendations.push({
      rank: index + 1,
      action: actions.action,
      rationale,
      estimatedImpact: `Bio age reduced by ${impact.bioAgeImpact} years, health score improved by +${impact.scoreImpact} points, average risk reduced by ${impact.riskReduction}%`,
      howToStart: actions.howToStart,
      isMostImportant: index === 0,
      icon: impact.icon,
      category,
    });
  });

  // Generate future story
  const highestRisk = risks.reduce((prev, curr) => 
    curr.tenYearRisk > prev.tenYearRisk ? curr : prev
  );
  const topAction = topImpacts[0];

  const futureAge = profile.age + 13;
  const futureStory = `At age ${futureAge}, based on your current trajectory, you may face ${highestRisk.condition.toLowerCase()} with a ${highestRisk.tenYearRisk}% probability — potentially requiring daily medication and regular doctor visits. However, the data shows something powerful: by ${topAction?.label.toLowerCase() || 'improving your habits'} starting today, you could reduce your biological age by ${topAction?.bioAgeImpact || 3} years and significantly delay or even prevent this outcome. Imagine yourself at ${futureAge} — active, energetic, and free from preventable health burdens. That future is within your reach, and it starts with one change today.`;

  return {
    recommendations,
    futureStory,
    mostImportantChange: topAction?.label || 'Improve your lifestyle habits',
  };
}

/**
 * Try to call Gemini API for AI-powered coaching, fall back to rule-based.
 */
export async function generateCoachRecommendations(
  profile: UserProfile,
  bioAge: BiologicalAgeResult,
  risks: RiskPrediction[],
  healthScore: HealthScore,
  impacts: HabitChange[],
  apiKey?: string
): Promise<CoachOutput> {
  // If no API key, use rule-based system
  if (!apiKey) {
    return generateRuleBasedRecommendations(profile, bioAge, risks, healthScore, impacts);
  }

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are an expert preventive health AI coach for the VitalArc platform.

Given this user's health data:
- Name: ${profile.name || 'User'}
- Age: ${profile.age}, Gender: ${profile.gender}
- BMI: ${(profile.weight / ((profile.height / 100) ** 2)).toFixed(1)}
- Sleep: ${profile.sleepHours} hours/night
- Exercise: ${profile.exerciseDaysPerWeek} days/week
- Diet quality: ${profile.dietQuality}/10
- Stress: ${profile.stressLevel}/10
- Smoking: ${profile.smokingStatus}
- Alcohol: ${profile.alcoholDrinksPerWeek} drinks/week

Their biological age: ${bioAge.biologicalAge} (chronological: ${bioAge.chronologicalAge}, delta: ${bioAge.delta > 0 ? '+' : ''}${bioAge.delta} years)
Organ ages: ${bioAge.organAges.map(o => `${o.label}: ${o.age}`).join(', ')}

Health Score: ${healthScore.overall}/100

Risk predictions (10-year):
${risks.map(r => `- ${r.condition}: ${r.tenYearRisk}% (${r.severity})`).join('\n')}

Top habit impacts ranked:
${impacts.slice(0, 3).map((i, idx) => `${idx + 1}. ${i.label} → Bio age -${i.bioAgeImpact}y, score +${i.scoreImpact}, risk -${i.riskReduction}%`).join('\n')}

Generate EXACTLY 3 recommendations in this JSON format:
{
  "recommendations": [
    {
      "rank": 1,
      "action": "specific action",
      "rationale": "why this matters for THIS user (2-3 sentences, use their specific numbers)",
      "estimatedImpact": "quantified impact",
      "howToStart": "concrete steps to start today",
      "isMostImportant": true/false,
      "icon": "emoji",
      "category": "category name"
    }
  ],
  "futureStory": "A short, personal, motivational narrative (3-4 sentences) about this user's health future. Include specific age milestones, potential risks, and how today's changes can transform their trajectory. Make it emotional and clear.",
  "mostImportantChange": "the single most important change"
}

IMPORTANT: 
- Make recommendations personal to THIS user's specific numbers
- First recommendation should be isMostImportant: true
- Future story must mention specific ages and conditions relevant to this user
- Keep the tone motivational, not scary
- This is NOT medical advice, it's educational insights

Return ONLY valid JSON, no markdown formatting.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Try to parse JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as CoachOutput;
      return parsed;
    }

    // Fallback if parsing fails
    return generateRuleBasedRecommendations(profile, bioAge, risks, healthScore, impacts);
  } catch (error) {
    console.error('Gemini API error, falling back to rule-based:', error);
    return generateRuleBasedRecommendations(profile, bioAge, risks, healthScore, impacts);
  }
}
