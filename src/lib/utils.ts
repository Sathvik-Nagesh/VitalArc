// ============================================================
// VitalArc — Utility Functions
// ============================================================

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
}

export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

export function getScoreColor(score: number): string {
  if (score >= 85) return '#10b981';
  if (score >= 70) return '#22d3ee';
  if (score >= 55) return '#f59e0b';
  if (score >= 40) return '#f97316';
  return '#ef4444';
}

export function getRiskColor(risk: number): string {
  if (risk < 10) return '#10b981';
  if (risk < 20) return '#f59e0b';
  if (risk < 35) return '#f97316';
  return '#ef4444';
}

export function getDeltaColor(delta: number): string {
  if (delta <= -3) return '#10b981';
  if (delta <= 0) return '#22d3ee';
  if (delta <= 3) return '#f59e0b';
  if (delta <= 6) return '#f97316';
  return '#ef4444';
}

export function formatDelta(delta: number): string {
  if (delta > 0) return `+${delta.toFixed(1)} years`;
  if (delta < 0) return `${delta.toFixed(1)} years`;
  return 'Same as chronological age';
}

export function getConfidenceFromData(profile: {
  fastingGlucose?: number;
  totalCholesterol?: number;
  hdlCholesterol?: number;
  ldlCholesterol?: number;
}): 'low' | 'medium' | 'high' {
  let dataPoints = 0;
  if (profile.fastingGlucose) dataPoints++;
  if (profile.totalCholesterol) dataPoints++;
  if (profile.hdlCholesterol) dataPoints++;
  if (profile.ldlCholesterol) dataPoints++;
  if (dataPoints >= 3) return 'high';
  if (dataPoints >= 1) return 'medium';
  return 'low';
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatAge(age: number): string {
  return age.toFixed(1);
}

export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
