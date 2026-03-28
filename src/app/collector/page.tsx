'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useHealthStore } from '@/store/useHealthStore';
import { getDefaultProfile, sampleProfiles } from '@/lib/sampleProfiles';
import { parseNaturalLanguage, mergeWithDefaults } from '@/lib/nlpParser';
import { UserProfile } from '@/lib/types';
import AppLayout from '@/components/layout/AppLayout';
import { ArrowRight, ArrowLeft, Mic, MicOff, Sparkles, User, Heart as HeartIcon, Dumbbell, Brain, FlaskConical, Users } from 'lucide-react';
import { renderIcon } from '@/lib/iconMap';
import AnalysisOverlay from '@/components/analysis/AnalysisOverlay';

const STEPS = [
  { id: 'demographics', label: 'Demographics', icon: User, color: 'from-blue-500 to-cyan-500' },
  { id: 'vitals', label: 'Vitals', icon: HeartIcon, color: 'from-red-500 to-pink-500' },
  { id: 'lifestyle', label: 'Lifestyle', icon: Dumbbell, color: 'from-green-500 to-emerald-500' },
  { id: 'mental', label: 'Mental Health', icon: Brain, color: 'from-purple-500 to-indigo-500' },
  { id: 'labs', label: 'Lab Results', icon: FlaskConical, color: 'from-amber-500 to-orange-500' },
  { id: 'family', label: 'Family History', icon: Users, color: 'from-teal-500 to-cyan-500' },
];

export default function CollectorPage() {
  const router = useRouter();
  const { setProfile, setHasCompletedOnboarding, isAnalyzing, setIsAnalyzing } = useHealthStore();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<UserProfile>(getDefaultProfile());
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');

  const update = (field: string, value: unknown) => {
    setFormData(prev => {
      if (field.startsWith('familyHistory.')) {
        const key = field.split('.')[1];
        return { ...prev, familyHistory: { ...prev.familyHistory, [key]: value } };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleVoice = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SpeechRecognitionClass = w.webkitSpeechRecognition || w.SpeechRecognition;
    if (!SpeechRecognitionClass) {
      alert('Speech recognition not supported in this browser. Try Chrome.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let finalTranscript = '';

    recognition.onstart = () => setIsListening(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      
      const currentText = finalTranscript + interimTranscript;
      setVoiceText(currentText);
      
      const parsed = parseNaturalLanguage(currentText);
      const merged = mergeWithDefaults(parsed);
      setFormData(merged);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const loadSample = (key: string) => {
    setFormData(sampleProfiles[key]);
  };

  const handleSubmit = async () => {
    setIsAnalyzing(true);
    setProfile(formData);
    setHasCompletedOnboarding(true);
    // Artificial delay for high-tech effect
    await new Promise(r => setTimeout(r, 2200));
    setIsAnalyzing(false);
    router.push('/dashboard');
  };

  const canProceed = step < STEPS.length - 1;
  const StepIcon = STEPS[step].icon;

  // Removed auto-scroll to top on step change for better UX

  const inputClass = "w-full px-4 py-3 rounded-xl dark:bg-white/5 bg-gray-100 dark:text-white text-gray-800 border dark:border-white/10 border-gray-200 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/30 transition-all";
  const labelClass = "block text-sm font-medium dark:text-gray-300 text-gray-600 mb-1.5";

  return (
    <AppLayout>
      <AnalysisOverlay isVisible={isAnalyzing} />
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold dark:text-white text-gray-800">Health Profile</h1>
          <p className="dark:text-gray-400 text-gray-500 mt-1">Tell us about yourself to get personalized health insights</p>
        </motion.div>

        {/* Advanced Autofill Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {/* Voice Tool */}
          <div className="glass-card p-5 border-t-4 border-primary-500 bg-primary-500/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Mic className="w-16 h-16" />
            </div>
            <h3 className="text-sm font-bold dark:text-white text-gray-800 mb-2 flex items-center gap-2">
              <Mic className="w-4 h-4 text-primary-500" /> Voice Autofill
            </h3>
            <p className="text-xs dark:text-gray-400 text-gray-600 mb-4 leading-relaxed">
              Speak your vitals and habits. "I'm 45, male, 5'10, 80kg, BP is 130 over 85."
            </p>
            <button 
              onClick={handleVoice} 
              className={`w-full btn-primary flex items-center justify-center gap-2 text-sm py-2.5 shadow-lg relative overflow-hidden ${isListening ? 'bg-red-500 ring-4 ring-red-500/20' : ''}`}
            >
              {isListening && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="absolute inset-0 flex items-center justify-center gap-0.5"
                >
                  {[1, 2, 3, 4, 3, 2, 1].map((h, i) => (
                    <motion.div 
                      key={i}
                      animate={{ height: [8, 20, 8] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                      className="w-1 bg-white/40 rounded-full"
                    />
                  ))}
                </motion.div>
              )}
              <span className={isListening ? 'opacity-0' : ''}>
                <Mic className="w-4 h-4 inline mr-2" /> Start Speaking
              </span>
              {isListening && <span className="relative z-10 text-white font-bold ml-6">STOP & PARSE</span>}
            </button>
            {voiceText && (
              <div className="mt-2 p-2 rounded-lg bg-black/20 text-[10px] italic dark:text-gray-400 text-gray-500 animate-pulse">
                "{voiceText.slice(-60)}{voiceText.length > 60 ? '...' : ''}"
              </div>
            )}
          </div>

          {/* Paste Tool */}
          <div className="glass-card p-5 border-t-4 border-accent-500 bg-accent-500/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Sparkles className="w-16 h-16" />
            </div>
            <h3 className="text-sm font-bold dark:text-white text-gray-800 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent-500" /> Smart Paste (OCR)
            </h3>
            <textarea 
              className="w-full h-10 px-3 py-2 text-xs dark:bg-black/20 bg-white/40 border border-white/10 rounded-lg focus:h-24 transition-all focus:outline-none resize-none mb-2"
              placeholder="Paste lab results or a health summary here..."
              onChange={(e) => {
                const transcript = e.target.value;
                if (transcript.length > 10) {
                  const parsed = parseNaturalLanguage(transcript);
                  setFormData(prev => ({ 
                    ...prev, 
                    ...parsed,
                    familyHistory: { ...prev.familyHistory, ...parsed.familyHistory }
                  }));
                }
              }}
            />
            <p className="text-[10px] dark:text-gray-500 text-gray-400 italic">Form fields will update live as you paste.</p>
          </div>
        </div>

        {/* Global Progress */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <button key={s.id} onClick={() => setStep(i)} className="flex-1 group" id={`step-${s.id}`}>
                <div className={`h-1.5 rounded-full mb-2 transition-all ${i <= step ? 'bg-gradient-to-r ' + s.color : 'dark:bg-white/10 bg-gray-200'}`} />
                <div className="flex items-center gap-1 justify-center">
                  <Icon className={`w-3 h-3 ${i <= step ? 'text-primary-400' : 'dark:text-gray-600 text-gray-400'}`} />
                  <span className={`text-xs hidden md:block ${i <= step ? 'dark:text-gray-300 text-gray-600' : 'dark:text-gray-600 text-gray-400'}`}>{s.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="glass-card p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${STEPS[step].color} flex items-center justify-center`}>
                <StepIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold dark:text-white text-gray-800">{STEPS[step].label}</h2>
                <p className="text-xs dark:text-gray-400 text-gray-500">Step {step + 1} of {STEPS.length}</p>
              </div>
            </div>

            {/* Step 0: Demographics */}
            {step === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className={labelClass}>Name</label><input type="text" value={formData.name || ''} onChange={e => update('name', e.target.value)} className={inputClass} placeholder="Your name" /></div>
                <div><label className={labelClass}>Age</label><input type="number" value={formData.age} onChange={e => update('age', parseInt(e.target.value) || 0)} className={inputClass} min={10} max={120} /></div>
                <div>
                  <label className={labelClass}>Gender</label>
                  <select value={formData.gender} onChange={e => update('gender', e.target.value)} className={inputClass}>
                    <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option>
                  </select>
                </div>
                <div><label className={labelClass}>Height (cm)</label><input type="number" value={formData.height} onChange={e => update('height', parseInt(e.target.value) || 0)} className={inputClass} /></div>
                <div><label className={labelClass}>Weight (kg)</label><input type="number" value={formData.weight} onChange={e => update('weight', parseInt(e.target.value) || 0)} className={inputClass} /></div>
              </div>
            )}

            {/* Step 1: Vitals */}
            {step === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Sleep Hours / Night</label>
                  <input type="range" min={3} max={12} step={0.5} value={formData.sleepHours} onChange={e => update('sleepHours', parseFloat(e.target.value))} />
                  <div className="text-center text-sm font-semibold dark:text-primary-400 text-primary-600 mt-1">{formData.sleepHours} hours</div>
                </div>
                <div><label className={labelClass}>Resting Heart Rate (bpm)</label><input type="number" value={formData.restingHeartRate} onChange={e => update('restingHeartRate', parseInt(e.target.value) || 0)} className={inputClass} /></div>
                <div><label className={labelClass}>Systolic BP (mmHg)</label><input type="number" value={formData.systolicBP} onChange={e => update('systolicBP', parseInt(e.target.value) || 0)} className={inputClass} /></div>
                <div><label className={labelClass}>Diastolic BP (mmHg)</label><input type="number" value={formData.diastolicBP} onChange={e => update('diastolicBP', parseInt(e.target.value) || 0)} className={inputClass} /></div>
              </div>
            )}

            {/* Step 2: Lifestyle */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <label className={labelClass}>Exercise (days per week): {formData.exerciseDaysPerWeek}</label>
                  <input type="range" min={0} max={7} value={formData.exerciseDaysPerWeek} onChange={e => update('exerciseDaysPerWeek', parseInt(e.target.value))} />
                </div>
                <div>
                  <label className={labelClass}>Diet Quality: {formData.dietQuality}/10</label>
                  <input type="range" min={1} max={10} value={formData.dietQuality} onChange={e => update('dietQuality', parseInt(e.target.value))} />
                  <div className="flex justify-between text-xs dark:text-gray-500 text-gray-400 mt-1"><span>Poor</span><span>Excellent</span></div>
                </div>
                <div>
                  <label className={labelClass}>Smoking Status</label>
                  <div className="flex gap-3">
                    {['never', 'former', 'current'].map(s => (
                      <button key={s} onClick={() => update('smokingStatus', s)} className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${formData.smokingStatus === s ? 'bg-primary-500/20 text-primary-400 ring-1 ring-primary-500/30' : 'dark:bg-white/5 bg-gray-100 dark:text-gray-400 text-gray-500'}`}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div><label className={labelClass}>Alcohol (drinks per week)</label><input type="number" value={formData.alcoholDrinksPerWeek} onChange={e => update('alcoholDrinksPerWeek', parseInt(e.target.value) || 0)} className={inputClass} min={0} max={30} /></div>
              </div>
            )}

            {/* Step 3: Mental Health */}
            {step === 3 && (
              <div>
                <label className={labelClass}>Stress Level: {formData.stressLevel}/10</label>
                <input type="range" min={1} max={10} value={formData.stressLevel} onChange={e => update('stressLevel', parseInt(e.target.value))} />
                <div className="flex justify-between text-xs dark:text-gray-500 text-gray-400 mt-1"><span>😌 Relaxed</span><span>😰 Extremely Stressed</span></div>
                <div className="mt-6 grid grid-cols-5 gap-2">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                    <button key={n} onClick={() => update('stressLevel', n)} className={`py-3 rounded-xl text-sm font-semibold transition-all ${formData.stressLevel === n ? 'bg-primary-500/20 text-primary-400 ring-1 ring-primary-500/30' : 'dark:bg-white/5 bg-gray-100 dark:text-gray-400 text-gray-500 hover:bg-white/10'}`}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Labs */}
            {step === 4 && (
              <div className="space-y-4">
                <p className="text-xs dark:text-gray-400 text-gray-500 mb-2">Optional — improves prediction confidence</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className={labelClass}>Fasting Glucose (mg/dL)</label><input type="number" value={formData.fastingGlucose || ''} onChange={e => update('fastingGlucose', parseInt(e.target.value) || undefined)} className={inputClass} placeholder="e.g. 95" /></div>
                  <div><label className={labelClass}>Total Cholesterol (mg/dL)</label><input type="number" value={formData.totalCholesterol || ''} onChange={e => update('totalCholesterol', parseInt(e.target.value) || undefined)} className={inputClass} placeholder="e.g. 200" /></div>
                  <div><label className={labelClass}>HDL Cholesterol (mg/dL)</label><input type="number" value={formData.hdlCholesterol || ''} onChange={e => update('hdlCholesterol', parseInt(e.target.value) || undefined)} className={inputClass} placeholder="e.g. 55" /></div>
                  <div><label className={labelClass}>LDL Cholesterol (mg/dL)</label><input type="number" value={formData.ldlCholesterol || ''} onChange={e => update('ldlCholesterol', parseInt(e.target.value) || undefined)} className={inputClass} placeholder="e.g. 120" /></div>
                </div>
              </div>
            )}

            {/* Step 5: Family History */}
            {step === 5 && (
              <div className="space-y-3">
                {[
                  { key: 'heartDisease', label: 'Heart Disease', icon: 'HeartPulse' },
                  { key: 'diabetes', label: 'Diabetes', icon: 'Activity' },
                  { key: 'hypertension', label: 'Hypertension', icon: 'Gauge' },
                  { key: 'cancer', label: 'Cancer', icon: 'ShieldAlert' },
                  { key: 'mentalHealth', label: 'Mental Health Conditions', icon: 'Brain' },
                ].map(item => (
                  <button
                    key={item.key}
                    onClick={() => update(`familyHistory.${item.key}`, !formData.familyHistory[item.key as keyof typeof formData.familyHistory])}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${
                      formData.familyHistory[item.key as keyof typeof formData.familyHistory]
                        ? 'bg-primary-500/10 ring-1 ring-primary-500/30'
                        : 'dark:bg-white/5 bg-gray-100 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-primary-400">{renderIcon(item.icon, { className: "w-6 h-6" })}</span>
                    <span className="text-sm font-medium dark:text-white text-gray-800">{item.label}</span>
                    <div className={`ml-auto w-5 h-5 rounded-md border-2 flex items-center justify-center ${
                      formData.familyHistory[item.key as keyof typeof formData.familyHistory]
                        ? 'bg-primary-500 border-primary-500 text-white'
                        : 'dark:border-gray-600 border-gray-300'
                    }`}>
                      {formData.familyHistory[item.key as keyof typeof formData.familyHistory] && <span className="text-xs">✓</span>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="sticky bottom-0 lg:static w-full p-4 lg:p-0 z-20 mt-6 -mx-4 lg:mx-0 lg:w-auto bg-[var(--color-surface-dark)]/90 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none border-t border-white/10 lg:border-none">
          <div className="flex justify-between max-w-3xl mx-auto px-4 lg:px-0">
            <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="btn-secondary flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed bg-[var(--color-surface-dark)] lg:bg-transparent">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            {canProceed ? (
              <button onClick={() => setStep(step + 1)} className="btn-primary flex items-center gap-2 shadow-lg shadow-primary-500/20">
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleSubmit} className="btn-primary flex items-center gap-2 text-base md:text-lg px-6 md:px-8 shadow-lg shadow-primary-500/30" id="submit-profile-btn">
                <Sparkles className="w-5 h-5" /> Analyze Health
              </button>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
