// ============================================================
// VitalArc — Global State (Zustand)
// ============================================================
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  UserProfile, BiologicalAgeResult, HealthScore, RiskPrediction,
  SimulatorValues, HabitChange, CoachOutput, DailyLog, Theme
} from '@/lib/types';
import { calculateBiologicalAge } from '@/engines/bioAgeEngine';
import { calculateHealthScore } from '@/engines/healthScoreEngine';
import { calculateRisks } from '@/engines/riskEngine';
import { rankHabitImpacts, runSimulation } from '@/engines/simulationEngine';

interface HealthState {
  // User data
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;

  // Computed results
  bioAge: BiologicalAgeResult | null;
  healthScore: HealthScore | null;
  risks: RiskPrediction[];
  habitImpacts: HabitChange[];

  // Simulation
  simulatorValues: SimulatorValues | null;
  setSimulatorValues: (values: SimulatorValues) => void;
  simulatedBioAge: number | null;
  simulatedScore: number | null;
  simulatedRisks: RiskPrediction[];

  // Coach
  coachOutput: CoachOutput | null;
  setCoachOutput: (output: CoachOutput) => void;

  // Daily tracker
  dailyLogs: DailyLog[];
  addDailyLog: (log: DailyLog) => void;

  // Theme
  theme: Theme;
  toggleTheme: () => void;

  // Compute all results from profile
  computeAll: () => void;

  // API Key
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;

  // UI state
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (value: boolean) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (value: boolean) => void;
}

export const useHealthStore = create<HealthState>()(
  persist(
    (set, get) => ({
      profile: null,
      bioAge: null,
      healthScore: null,
      risks: [],
      habitImpacts: [],
      simulatorValues: null,
      simulatedBioAge: null,
      simulatedScore: null,
      simulatedRisks: [],
      coachOutput: null,
      dailyLogs: [],
      theme: 'dark',
      geminiApiKey: '',
      hasCompletedOnboarding: false,
      isAnalyzing: false,

      setProfile: (profile) => {
        set({ profile });
        // Auto-compute after setting profile
        setTimeout(() => get().computeAll(), 0);
      },

      computeAll: () => {
        const { profile } = get();
        if (!profile) return;

        const bioAge = calculateBiologicalAge(profile);
        const risks = calculateRisks(profile);
        const healthScore = calculateHealthScore(profile, bioAge, risks);
        const habitImpacts = rankHabitImpacts(profile);

        const simulatorValues: SimulatorValues = {
          sleepHours: profile.sleepHours,
          exerciseDaysPerWeek: profile.exerciseDaysPerWeek,
          dietQuality: profile.dietQuality,
          stressLevel: profile.stressLevel,
          smokingStatus: profile.smokingStatus,
        };

        set({
          bioAge,
          risks,
          healthScore,
          habitImpacts,
          simulatorValues,
          simulatedBioAge: bioAge.biologicalAge,
          simulatedScore: healthScore.overall,
          simulatedRisks: risks,
        });
      },

      setSimulatorValues: (values) => {
        const { profile } = get();
        if (!profile) return;

        const sim = runSimulation(profile, values);
        set({
          simulatorValues: values,
          simulatedBioAge: sim.newBioAge,
          simulatedScore: sim.newScore,
          simulatedRisks: sim.newRisks,
        });
      },

      setCoachOutput: (output) => set({ coachOutput: output }),

      addDailyLog: (log) => {
        const { dailyLogs } = get();
        const existing = dailyLogs.findIndex(l => l.date === log.date);
        if (existing >= 0) {
          const updated = [...dailyLogs];
          updated[existing] = log;
          set({ dailyLogs: updated });
        } else {
          set({ dailyLogs: [...dailyLogs, log] });
        }
      },

      toggleTheme: () => {
        const newTheme = get().theme === 'dark' ? 'light' : 'dark';
        set({ theme: newTheme });
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', newTheme === 'dark');
          document.documentElement.classList.toggle('light', newTheme === 'light');
        }
      },

      setGeminiApiKey: (key) => set({ geminiApiKey: key }),
      setHasCompletedOnboarding: (value) => set({ hasCompletedOnboarding: value }),
      setIsAnalyzing: (value) => set({ isAnalyzing: value }),
    }),
    {
      name: 'vitalarc-storage',
      partialize: (state) => ({
        profile: state.profile,
        dailyLogs: state.dailyLogs,
        theme: state.theme,
        geminiApiKey: state.geminiApiKey,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
      }),
    }
  )
);
