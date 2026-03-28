'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Database, Binary, ShieldCheck, Activity, Brain, Microscope } from 'lucide-react';
import { useState, useEffect } from 'react';

const LOGS = [
  "INITIALIZING GOMPERTZ DECAY MATRIX...",
  "LOADING FRAMINGHAM HEART STUDY MODELS (v2.1)...",
  "SYNCING FINDRISC DIABETES PROJECTION...",
  "CALCULATING EPIGENETIC BIOLOGICAL OFFSET...",
  "MAPPING VITAL DRIFT PENALTIES...",
  "NORMALIZING PHENOTYPIC AGE CLOCK...",
  "RUNNING MONTE CARLO HABIT SIMULATIONS...",
  "ENCRYPTING HEALTH PROFILE (AES-256)...",
  "GENERATING ACTIONABLE STRATEGY...",
  "FINALIZING CLINICAL AUDIT..."
];

export default function AnalysisOverlay({ isVisible }: { isVisible: boolean }) {
  const [logIndex, setLogIndex] = useState(0);

  useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        setLogIndex(prev => (prev + 1) % LOGS.length);
      }, 200);
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center"
        >
          {/* Holographic background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary-500/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent-500/20 rounded-full blur-[120px] animate-pulse delay-700" />
            <div className="grid grid-cols-10 gap-px w-full h-full opacity-10">
               {Array.from({ length: 100 }).map((_, i) => <div key={i} className="border-[0.5px] border-white/10" />)}
            </div>
          </div>

          <div className="relative z-10 max-w-lg w-full">
            {/* Pulsing Icon */}
            <motion.div 
               animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
               transition={{ duration: 4, repeat: Infinity }}
               className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mb-12 mx-auto shadow-glow shadow-primary-500/40 border border-white/20"
            >
               <Microscope className="w-12 h-12 text-white" />
            </motion.div>

            <h2 className="text-3xl font-black text-white mb-4 tracking-tighter">Clinical Analysis in Progress</h2>
            <p className="text-primary-400 font-mono text-sm mb-12 tracking-widest uppercase animate-pulse">Running Bio-Intelligence Engine v2.2</p>

            {/* Progress Bar Container */}
            <div className="w-full h-2 dark:bg-white/10 bg-white/5 rounded-full overflow-hidden mb-12 relative border border-white/5">
               <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.2, ease: "easeInOut" }}
                  className="h-full bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500"
               />
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-scan-fast" />
            </div>

            {/* Scrolling Logs */}
            <div className="h-24 flex flex-col items-center justify-center overflow-hidden">
               <AnimatePresence mode="wait">
                  <motion.div
                    key={logIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-[10px] font-mono dark:text-gray-400 text-gray-500 tracking-widest uppercase"
                  >
                    {LOGS[logIndex]}
                  </motion.div>
               </AnimatePresence>
               <div className="mt-4 flex gap-4">
                  <Database className="w-4 h-4 text-primary-500/40" />
                  <Binary className="w-4 h-4 text-accent-500/40" />
                  <ShieldCheck className="w-4 h-4 text-green-500/40" />
                  <Activity className="w-4 h-4 text-red-500/40" />
                  <Brain className="w-4 h-4 text-purple-500/40" />
               </div>
            </div>
          </div>
          
          <div className="fixed bottom-12 text-white/20 text-[8px] font-black uppercase tracking-[1em]">Secure Local-First Processing</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
