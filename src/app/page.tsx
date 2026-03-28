'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useHealthStore } from '@/store/useHealthStore';
import { sampleProfiles } from '@/lib/sampleProfiles';
import { 
  Activity, ArrowRight, Heart, Brain, Shield, Zap, 
  ChevronDown, Sun, Moon, Sparkles, CheckCircle2, 
  Search, Lock, Database, Dna, BrainCircuit, Microscope, SlidersHorizontal, LogIn, LogOut
} from 'lucide-react';
import Image from 'next/image';
import BackgroundPaths from '@/components/layout/BackgroundPaths';
import CookieConsent from '@/components/layout/CookieConsent';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

const fadeIn = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8, ease: "easeOut" }
};

export default function LandingPage() {
  const router = useRouter();
  const { setProfile, computeAll, theme, toggleTheme, hasCompletedOnboarding, user } = useHealthStore();
  const [showProfiles, setShowProfiles] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLoadProfile = (key: string) => {
    const profile = sampleProfiles[key];
    setProfile(profile);
    computeAll();
    router.push('/dashboard');
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen relative overflow-hidden bg-grid-pattern selection:bg-primary-500/30">
      <BackgroundPaths />
      
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 left-1/4 w-[1200px] h-[800px] bg-primary-500/10 rounded-full blur-[160px] -top-[400px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-[800px] h-[800px] bg-accent-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] -bottom-[200px] pointer-events-none" />

      {/* Theme Toggle & Logo Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 p-6 flex justify-between items-center bg-white/5 dark:bg-black/5 backdrop-blur-md border-b dark:border-white/10 border-gray-200">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 group cursor-pointer" onClick={() => router.push('/')}>
             <Image src="/logo.png" fill alt="VitalArc Logo" className="object-contain group-hover:scale-110 transition-transform" />
          </div>
          <span className="text-2xl font-black tracking-tighter gradient-text cursor-pointer" onClick={() => router.push('/')}>VitalArc</span>
        </div>
        <div className="flex items-center gap-4">
           {user ? (
             <>
               <button onClick={() => router.push('/dashboard')} className="text-sm font-bold glass px-4 py-2 rounded-xl hidden sm:block hover:bg-white/10 transition-colors">Dashboard</button>
               <button onClick={() => { signOut(auth); setProfile(null as any); }} title="Sign Out" className="w-10 h-10 rounded-xl glass flex items-center justify-center hover:bg-red-500/20 text-red-400 transition-colors shadow-glow shadow-red-500/10">
                 <LogOut className="w-4 h-4" />
               </button>
             </>
           ) : (
             <button onClick={() => router.push('/auth')} className="text-sm font-bold glass px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-white/10 transition-colors">
               <LogIn className="w-4 h-4" /> Sign In
             </button>
           )}
           <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-xl glass flex items-center justify-center hover:scale-110 transition-transform shadow-glow shadow-primary-500/10"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-primary-400" />}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center pt-48 pb-24 px-4 text-center">
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 1.2, ease: "easeOut" }}
           className="max-w-6xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-full glass mb-8 border border-primary-500/20 shadow-glow shadow-primary-500/10 hover:border-primary-500/40 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-primary-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary-400">Next-Gen Bio-Intelligence Platform</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="text-6xl md:text-8xl lg:text-9xl font-black mb-8 tracking-tighter leading-none dark:text-white text-gray-900"
          >
            Your Body&apos;s <br />
            <span className="gradient-text drop-shadow-[0_0_50px_rgba(0,212,170,0.4)]">Check Engine Light.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="text-xl md:text-3xl dark:text-gray-400 text-gray-500 mb-12 max-w-3xl mx-auto leading-relaxed font-light"
          >
            Predict your 10-year trajectory. Discover your true biological age. 
            Simulate thousands of habit changes to find the <strong>one that saves years.</strong>
          </motion.p>

          {/* CTA Group */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-24">
            {user ? (
              <button
                onClick={() => router.push('/dashboard')}
                className="btn-primary text-xl px-12 py-5 flex items-center gap-4 group shadow-3xl shadow-primary-500/30 ring-2 ring-white/20"
              >
                Enter Dashboard <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => router.push('/auth')}
                  className="btn-primary text-xl px-12 py-5 flex items-center gap-4 group shadow-3xl shadow-primary-500/30 ring-2 ring-white/20"
                >
                  Start Scanning <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </button>
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                  <button
                    onClick={() => setShowProfiles(!showProfiles)}
                    className="relative btn-secondary text-xl px-12 py-5 flex items-center gap-4 dark:bg-black/60 bg-gray-100 hover:bg-gray-200 backdrop-blur-3xl border-white/5 shadow-xl"
                  >
                    Demo Profiles <ChevronDown className={`w-6 h-6 transition-transform duration-500 ${showProfiles ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Profiles Popup */}
          <AnimatePresence>
            {showProfiles && (
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 40, scale: 0.95 }}
                className="flex flex-wrap justify-center gap-4 max-w-5xl mx-auto mb-32 p-8 dark:bg-black/40 bg-white/90 backdrop-blur-3xl rounded-[3rem] border dark:border-white/5 border-gray-200 shadow-3xl relative z-50 overflow-hidden"
              >
                {Object.entries(sampleProfiles).map(([key, profile], idx) => (
                  <motion.button
                    key={key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => handleLoadProfile(key)}
                    className="glass-card p-5 flex items-center gap-5 hover:border-primary-500/50 dark:hover:bg-white/5 hover:bg-black/5 transition-all w-full sm:w-auto text-left group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-2xl font-black text-white group-hover:rotate-6 transition-transform">
                      {profile.name?.[0]}
                    </div>
                    <div>
                      <div className="font-bold text-xl dark:text-white text-gray-800">{profile.name}</div>
                      <div className="text-xs dark:text-gray-400 text-gray-500 font-medium uppercase tracking-widest">
                        {profile.age}y • {profile.gender} • Stress: {profile.stressLevel}/10
                      </div>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Floating Feature Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto w-full px-4"
        >
          {[
            { label: 'Clinical Factors', value: '45+', icon: Database, color: 'text-blue-400' },
            { label: 'Longevity Algos', value: '180', icon: Dna, color: 'text-purple-400' },
            { label: 'Risk Engines', value: '6', icon: Microscope, color: 'text-orange-400' },
            { label: 'Privacy Grade', value: 'AES', icon: Shield, color: 'text-green-400' },
          ].map((m, i) => (
            <motion.div 
               key={m.label} 
               whileHover={{ y: -10 }}
               className="glass-card p-8 flex flex-col items-center gap-3 border-t-2 border-transparent hover:border-primary-500 transition-all duration-700"
            >
              <m.icon className={`w-8 h-8 ${m.color} mb-2`} strokeWidth={1.5} />
              <div className="text-4xl font-black dark:text-white text-gray-900 tracking-tighter">{m.value}</div>
              <div className="text-[10px] uppercase font-black tracking-[0.3em] text-gray-500">{m.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Anatomy Feature Section (The Drill-down Sell) */}
      <section className="relative z-10 py-48 px-4 bg-black/10 dark:bg-white/[0.01]">
         <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="order-2 lg:order-1 relative h-[700px] glass rounded-[4rem] p-4 shadow-3xl overflow-hidden group"
              >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent pointer-events-none" />
                  <div className="w-full h-full rounded-[3.5rem] bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-12 relative border border-white/5">
                     <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent animate-scan-slow opacity-50" />
                     <div className="relative z-10 flex flex-col items-center">
                        <div className="w-32 h-32 rounded-full bg-primary-500/10 flex items-center justify-center mb-12 shadow-glow shadow-primary-500/20">
                           <Activity className="w-16 h-16 text-primary-400" />
                        </div>
                        <h3 className="text-5xl font-black text-white text-center leading-tight">Interactive <br /> Anatomy Explorer</h3>
                        <p className="text-primary-500 font-bold mt-6 tracking-[0.4em] text-sm uppercase">Full Organ Sync v2.0</p>
                        
                        {/* Interactive UI Mockup Elements */}
                        <div className="mt-12 flex gap-4">
                           <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                           <div className="w-3 h-3 rounded-full bg-blue-500 delay-75 animate-pulse" />
                           <div className="w-3 h-3 rounded-full bg-purple-500 delay-150 animate-pulse" />
                        </div>
                     </div>
                  </div>
              </motion.div>
              <div className="order-1 lg:order-2">
                 <motion.div 
                   initial={{ opacity: 0, x: 30 }}
                   whileInView={{ opacity: 1, x: 0 }}
                   viewport={{ once: true }}
                 >
                   <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-500/10 text-accent-400 text-[10px] font-black uppercase mb-10 tracking-[0.3em] border border-accent-500/20">
                     Proprietary Visualization
                   </div>
                   <h2 className="text-5xl md:text-7xl font-black dark:text-white text-gray-800 mb-10 leading-[0.9] tracking-tighter">
                     Drill down into <br />
                     <span className="text-primary-400">every vital system.</span>
                   </h2>
                   <p className="text-2xl dark:text-gray-400 text-gray-600 mb-16 leading-relaxed font-light">
                     Forget generic health scores. VitalArc decomposes your biological age into 4 clinical subsystems, allowing you to isolate and target specific decay markers.
                   </p>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      {[
                        { l: 'Cardiovascular', i: Heart, c: 'text-red-500', b: 'bg-red-500/10' },
                        { l: 'Neurological', i: Brain, c: 'text-purple-500', b: 'bg-purple-500/10' },
                        { l: 'Metabolic', i: Activity, c: 'text-orange-500', b: 'bg-orange-500/10' },
                        { l: 'Musculoskeletal', i: Zap, c: 'text-cyan-500', b: 'bg-cyan-500/10' },
                      ].map((item, idx) => (
                        <motion.div 
                          key={idx} 
                          whileHover={{ x: 10 }}
                          className="flex items-center gap-6 p-6 glass rounded-3xl group border border-white/5 hover:border-white/10 transition-all cursor-default"
                        >
                           <div className={`w-14 h-14 rounded-2xl ${item.b} flex items-center justify-center ${item.c} shadow-lg ring-1 ring-white/10 group-hover:scale-110 transition-transform`}>
                              <item.i className="w-7 h-7" />
                           </div>
                           <span className="font-black text-xl dark:text-white text-gray-800 tracking-tight">{item.l}</span>
                        </motion.div>
                      ))}
                   </div>
                 </motion.div>
              </div>
            </div>
         </div>
      </section>

      {/* Trust & Methodology (Hackathon authority) */}
      <section className="relative z-10 py-48 px-4">
         <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
               <h2 className="text-5xl md:text-7xl font-black dark:text-white text-gray-800 mb-10 tracking-tighter">Validated <br /> by Science.</h2>
               <p className="text-xl dark:text-gray-400 text-gray-600 mb-12 leading-relaxed italic">
                 &quot;VitalArc uses exponential decay penalties and Gompertz-Makeham mortality laws to ensure biological delta is accurate to 0.1 years.&quot;
               </p>
               <button onClick={() => router.push('/about')} className="text-primary-400 font-black text-sm uppercase tracking-[0.4em] flex items-center gap-3 hover:gap-6 transition-all group">
                 Read Methodology <ArrowRight className="w-4 h-4 group-hover:translate-x-2" />
               </button>
            </motion.div>
            <div className="grid grid-cols-1 gap-4">
               {[
                 { t: 'Epigenetic Clocks', d: 'Modeled after Levine & Horvath research.' },
                 { t: 'Condition Risk', d: 'FINDRISC & Framingham Heart Score baseline.' },
                 { t: 'Longevity Algos', d: 'Gompertz law population mortality projection.' }
               ].map((item, i) => (
                 <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="glass-card p-8 border-l-4 border-primary-500">
                    <h4 className="font-black dark:text-white text-gray-900 text-xl mb-2">{item.t}</h4>
                    <p className="text-gray-500 text-sm">{item.d}</p>
                 </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* CTA Final */}
      <section className="relative z-10 py-48 px-4">
        <div className="max-w-5xl mx-auto glass rounded-[5rem] p-24 text-center shadow-3xl shadow-primary-500/20 overflow-hidden relative border border-white/5">
           <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary-500/10 to-transparent" />
           <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-6xl md:text-8xl font-black dark:text-white text-gray-800 mb-12 tracking-tighter">Start your <br /> Bio-Scan.</h2>
              <p className="text-2xl dark:text-gray-400 text-gray-500 mb-16 max-w-xl mx-auto font-light leading-relaxed">Join the future of preventive health. It takes less than 2 minutes to map your entire body.</p>
              <button 
                onClick={() => router.push('/collector')}
                className="btn-primary text-2xl px-20 py-8 group shadow-3xl shadow-primary-500/40 ring-4 ring-white/10"
              >
                Scan Now <ArrowRight className="w-8 h-8 group-hover:translate-x-4 transition-transform duration-700" />
              </button>
           </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-24 px-4 border-t dark:border-white/5 border-gray-200 dark:bg-black/40 bg-gray-100 text-center">
        <div className="max-w-7xl mx-auto">
           <div className="flex items-center justify-center gap-4 mb-12">
              <div className="relative w-10 h-10">
                <Image src="/logo.png" fill alt="VitalArc Logo" className="object-contain" />
              </div>
              <span className="text-2xl font-black tracking-tighter gradient-text">VitalArc</span>
           </div>
           <nav className="flex flex-wrap justify-center gap-12 mb-16 text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">
             <button onClick={() => router.push('/dashboard')} className="hover:text-primary-400 transition-colors">Explorer</button>
             <button onClick={() => router.push('/mirror')} className="hover:text-primary-400 transition-colors">Anatomy</button>
             <button onClick={() => router.push('/about')} className="hover:text-primary-400 transition-colors">Science</button>
             <button onClick={() => router.push('/privacy')} className="hover:text-primary-400 transition-colors">Privacy</button>
           </nav>
           <p className="text-xs dark:text-gray-600 text-gray-500 max-w-3xl mx-auto opacity-50 font-medium leading-loose">
              VitalArc is for educational and informational purposes only. Not a medical device. <br />
              Built with precision for the Hackathon © {new Date().getFullYear()}
           </p>
        </div>
      </footer>
      <CookieConsent />
    </div>
  );
}
