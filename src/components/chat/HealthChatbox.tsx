'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, Bot, User, ShieldCheck } from 'lucide-react';
import { useHealthStore } from '@/store/useHealthStore';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: string[];
}

const MEDICAL_CITATIONS: Record<string, { label: string; url: string }> = {
  blood_pressure: { label: 'AHA Blood Pressure Guidelines', url: 'https://www.heart.org/en/health-topics/high-blood-pressure' },
  bmi: { label: 'WHO BMI Classification', url: 'https://www.who.int/news-room/fact-sheets/detail/obesity-and-overweight' },
  sleep: { label: 'National Sleep Foundation', url: 'https://www.sleepfoundation.org/how-sleep-works/how-much-sleep-do-we-really-need' },
  exercise: { label: 'CDC Physical Activity Guidelines', url: 'https://www.cdc.gov/physicalactivity/basics/adults/index.htm' },
  diabetes: { label: 'ADA Diabetes Standards', url: 'https://www.diabetes.org/diabetes/a1c' },
  heart: { label: 'Framingham Heart Study', url: 'https://www.framinghamheartstudy.org/' },
  stress: { label: 'APA Stress Research', url: 'https://www.apa.org/topics/stress' },
};

function detectCitations(text: string): string[] {
  const keys = [];
  if (text.match(/blood.?pressure|systolic|diastolic|bp/i)) keys.push('blood_pressure');
  if (text.match(/bmi|weight|obese|overweight/i)) keys.push('bmi');
  if (text.match(/sleep|rest|insomnia/i)) keys.push('sleep');
  if (text.match(/exercise|workout|activity/i)) keys.push('exercise');
  if (text.match(/diabetes|glucose|insulin/i)) keys.push('diabetes');
  if (text.match(/heart|cardiovascular|cardiac/i)) keys.push('heart');
  if (text.match(/stress|anxiety|cortisol/i)) keys.push('stress');
  return keys;
}

export default function HealthChatbox() {
  const { profile, bioAge, healthScore, risks, user } = useHealthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Build the user context for the AI (anonymized)
  const buildUserContext = () => {
    if (!profile) return 'No health profile available yet.';
    const bmi = profile.weight && profile.height
      ? (profile.weight / ((profile.height / 100) ** 2)).toFixed(1)
      : 'N/A';
    return `User health context (anonymized):
- Age bracket: ${profile.age < 30 ? '18-29' : profile.age < 40 ? '30-39' : profile.age < 50 ? '40-49' : '50+'}
- Gender: ${profile.gender}
- BMI: ${bmi} (${parseFloat(bmi) < 18.5 ? 'Underweight' : parseFloat(bmi) < 25 ? 'Healthy' : parseFloat(bmi) < 30 ? 'Overweight' : 'Obese'})
- Biological age delta: ${bioAge ? `${bioAge.delta > 0 ? '+' : ''}${bioAge.delta.toFixed(1)} years` : 'Not calculated'}
- Health score: ${healthScore?.overall ?? 'N/A'}/100
- Sleep: ${profile.sleepHours} hrs/night
- Exercise: ${profile.exerciseDaysPerWeek} days/week
- Diet quality: ${profile.dietQuality}/10
- Stress: ${profile.stressLevel}/10
- Smoking: ${profile.smokingStatus}
- Top risk: ${risks[0] ? `${risks[0].condition} (${risks[0].tenYearRisk}% 10-yr)` : 'N/A'}`;
  };

  const initializeChat = () => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: `Hi! I'm your VitalArc Health Assistant 🧬\n\nI can answer questions about your health profile, explain your bio-age results, help you understand your risk scores, or give general preventive health guidance.\n\n${profile ? `I can see your health profile is loaded. Ask me anything!` : 'Complete a health scan first for personalized answers.'}`
    }]);
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (messages.length === 0) initializeChat();
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput('');

    const newUserMsg: Message = { id: Date.now().toString(), role: 'user', content: userMessage };
    setMessages(prev => [...prev, newUserMsg]);
    setLoading(true);

    try {
      const conversationHistory = messages.slice(-6).map(m =>
        `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`
      ).join('\n');

      const systemPrompt = `You are a knowledgeable and empathetic preventive health assistant for VitalArc.

${buildUserContext()}

RULES:
- Answer based on the user's health context above
- Be warm, clear, concise (2-4 sentences max per point)
- Never diagnose — say "consult a healthcare provider" for serious concerns
- Use ranges/categories, not exact raw numbers
- Focus on education and prevention

Previous conversation:
${conversationHistory}

User question: ${userMessage}

Respond in plain text, 2-4 sentences. Be helpful and specific to their profile.`;

      // Always use server-side route — API key never in browser
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: systemPrompt,
          userId: user?.uid || 'anon-chat',
          mode: 'chat',
        }),
      });

      let responseText = '';
      if (res.ok) {
        const data = await res.json();
        responseText = data.text;
      } else {
        responseText = generateFallbackResponse(userMessage, profile, bioAge, healthScore);
      }

      const citations = detectCitations(responseText);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        citations,
      }]);
    } catch (err) {
      console.error('Chat error:', err);
      const fallback = generateFallbackResponse(userMessage, profile, bioAge, healthScore);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fallback,
      }]);
    }
    setLoading(false);
  };

  return (
    <>
      {/* Chat bubble button */}
      <motion.button
        onClick={handleOpen}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 shadow-2xl shadow-primary-500/30 flex items-center justify-center print:hidden"
      >
        <MessageCircle className="w-6 h-6 text-white" />
        {profile && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[520px] flex flex-col glass-card shadow-2xl border dark:border-white/10 border-gray-200 overflow-hidden print:hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b dark:border-white/10 border-gray-200 bg-gradient-to-r from-primary-500/10 to-transparent">
              <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold dark:text-white text-gray-800">VitalArc Assistant</div>
                <div className="flex items-center gap-1 text-[10px] text-green-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  {profile ? 'Context-aware · Your profile loaded' : 'General mode'}
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(msg => (
                <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-primary-500/20' : 'bg-gray-500/20'}`}>
                    {msg.role === 'user' ? <User className="w-3 h-3 text-primary-400" /> : <Bot className="w-3 h-3 text-gray-400" />}
                  </div>
                  <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                    <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-primary-500 text-white rounded-tr-sm'
                        : 'dark:bg-white/5 bg-gray-100 dark:text-gray-200 text-gray-700 rounded-tl-sm'
                    }`}>
                      {msg.content}
                    </div>
                    {/* Citations */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {msg.citations.slice(0, 2).map(key => {
                          const cite = MEDICAL_CITATIONS[key];
                          if (!cite) return null;
                          return (
                            <a
                              key={key}
                              href={cite.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-colors"
                            >
                              <ShieldCheck className="w-2.5 h-2.5" />
                              {cite.label}
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-500/20 flex items-center justify-center">
                    <Bot className="w-3 h-3 text-gray-400" />
                  </div>
                  <div className="px-3 py-2 rounded-2xl dark:bg-white/5 bg-gray-100 flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin text-primary-400" />
                    <span className="text-xs dark:text-gray-400 text-gray-500">Analyzing...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t dark:border-white/10 border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Ask about your health..."
                  className="flex-1 px-3 py-2 rounded-xl text-sm dark:bg-white/5 bg-gray-100 dark:text-white text-gray-800 border dark:border-white/10 border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary-500/50"
                  disabled={loading}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center disabled:opacity-40"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
              <p className="text-[9px] dark:text-gray-600 text-gray-400 mt-1.5 text-center">
                Not medical advice · Responses grounded in your health data
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Rule-based fallback responses
function generateFallbackResponse(question: string, profile: any, bioAge: any, healthScore: any): string {
  const q = question.toLowerCase();
  if (q.match(/bio.?age|biological/)) {
    return bioAge
      ? `Your biological age is ${bioAge.biologicalAge.toFixed(1)} years, which is ${bioAge.delta > 0 ? `${bioAge.delta.toFixed(1)} years older` : `${Math.abs(bioAge.delta).toFixed(1)} years younger`} than your chronological age of ${bioAge.chronologicalAge}. This is calculated using a weighted phenotypic model based on your lifestyle and vitals.`
      : 'Complete a health scan to see your biological age calculation.';
  }
  if (q.match(/health.?score|score/)) {
    return healthScore
      ? `Your overall health score is ${healthScore.overall}/100. This composite score reflects your cardiovascular health, metabolic markers, lifestyle habits, and mental wellness. A score above 70 is considered good.`
      : 'Complete a health scan to get your health score.';
  }
  if (q.match(/sleep/)) return 'Adults need 7-9 hours of sleep per night (National Sleep Foundation). Poor sleep accelerates biological aging by disrupting cellular repair and raising cortisol levels.';
  if (q.match(/exercise|workout/)) return 'The CDC recommends 150+ minutes of moderate aerobic activity per week. Regular exercise can reduce cardiovascular risk by up to 35% and improve insulin sensitivity.';
  if (q.match(/diet|food|nutrition/)) return 'A high-quality diet rich in vegetables, whole grains, and lean protein is one of the most impactful longevity interventions. Aim for a diet quality score of 8+/10.';
  if (q.match(/stress/)) return 'Chronic stress raises cortisol, which increases blood pressure, disrupts sleep, and accelerates brain aging. Aim to keep stress below 4/10 through mindfulness, exercise, or social connection.';
  return `I understand you're asking about "${question}". For personalized answers based on your health data, please add your Gemini API key. In the meantime, I recommend consulting a healthcare professional for specific health concerns.`;
}
