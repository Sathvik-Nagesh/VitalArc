'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Microscope, Brain, Dna, Database, 
  ShieldCheck, Calculator, Activity, Heart, Zap
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

export default function MethodologyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen relative overflow-hidden bg-grid-pattern dark:bg-[#050505] bg-gray-50">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-24">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-primary-400 font-bold mb-12 hover:gap-3 transition-all"
        >
          <ArrowLeft className="w-5 h-5" /> Back to VitalArc
        </button>

        <motion.div {...fadeIn} className="mb-20">
          <h1 className="text-5xl md:text-7xl font-black dark:text-white text-gray-900 mb-6 tracking-tighter">
            The Science <br /> 
            <span className="gradient-text">Behind the Engine.</span>
          </h1>
          <p className="text-xl dark:text-gray-400 text-gray-600 leading-relaxed max-w-2xl">
            VitalArc isn't just a dashboard. It's a bio-computational engine that synthesizes medical research, 
            epigenetic patterns, and statistical risk modeling into a single, actionable health score.
          </p>
        </motion.div>

        {/* Pillars of Methodology */}
        <div className="space-y-24">
          
          {/* Pillar 1: Biological Age */}
          <motion.section {...fadeIn} className="relative">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center">
                <Dna className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-black dark:text-white text-gray-900">Biological Age Mapping</h2>
            </div>
            <div className="glass-card p-8 border-l-4 border-primary-500">
               <p className="dark:text-gray-300 text-gray-700 mb-6 leading-relaxed">
                 Our <strong>Biological Age Engine</strong> is inspired by the work of Dr. Morgan Levine and Steve Horvath. 
                 Instead of simple linear averaging, we use a <strong>weighted phenotypic aging model</strong>.
               </p>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-sm">
                  <div className="p-4 glass rounded-xl border border-white/5">
                    <h4 className="font-bold text-primary-400 mb-2">Exponential Decay</h4>
                    <p className="dark:text-gray-500 text-gray-600 italic">Severity is non-linear. A blood pressure of 145/90 is significantly more aging than 135/85.</p>
                  </div>
                  <div className="p-4 glass rounded-xl border border-white/5">
                    <h4 className="font-bold text-primary-400 mb-2">Heterogeneous Aging</h4>
                    <p className="dark:text-gray-500 text-gray-600 italic">We assess 4 organ systems independently, acknowledging that your brain might be aging slower than your heart.</p>
                  </div>
               </div>
               <p className="text-xs dark:text-gray-500 text-gray-600">Source markers: Albumin, Creatinine, Glucose, C-reactive protein (proxies derived from BMI/Age/Labs).</p>
            </div>
          </motion.section>

          {/* Pillar 2: Risk Prediction */}
          <motion.section {...fadeIn} className="relative">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <Microscope className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-black dark:text-white text-gray-900">Predictive Risk Models</h2>
            </div>
            <div className="glass-card p-8 border-l-4 border-orange-500">
               <p className="dark:text-gray-300 text-gray-700 mb-6 leading-relaxed">
                 VitalArc currently runs <strong>6 independent condition models</strong>. These are simplified versions of peer-reviewed clinical tools:
               </p>
               <ul className="space-y-4 mb-8">
                  <li className="flex gap-3">
                    <Activity className="w-5 h-5 text-orange-400 shrink-0" />
                    <span className="dark:text-gray-400 text-gray-600"><strong>CVD:</strong> Derived from Framingham Heart Study Pooled Cohort Equations.</span>
                  </li>
                  <li className="flex gap-3">
                    <Database className="w-5 h-5 text-orange-400 shrink-0" />
                    <span className="dark:text-gray-400 text-gray-600"><strong>Diabetes (T2D):</strong> Modeled after the FINDRISC (Finnish Diabetes Risk Score).</span>
                  </li>
                  <li className="flex gap-3">
                    <Brain className="w-5 h-5 text-orange-400 shrink-0" />
                    <span className="dark:text-gray-400 text-gray-600"><strong>Mental Health:</strong> Based on WHO-5 Wellbeing Index patterns and chronic stress correlations.</span>
                  </li>
               </ul>
               <div className="p-4 bg-orange-500/10 rounded-xl text-orange-400 text-sm font-bold flex items-center gap-2">
                 <ShieldCheck className="w-4 h-4" /> Validated against 2024 Clinical Guidelines
               </div>
            </div>
          </motion.section>

          {/* Pillar 3: Life Expectancy */}
          <motion.section {...fadeIn} className="relative">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-black dark:text-white text-gray-900">Longevity Projection</h2>
            </div>
            <div className="glass-card p-8 border-l-4 border-green-500">
               <p className="dark:text-gray-300 text-gray-700 mb-6 leading-relaxed">
                 The <strong>Longevity Score</strong> uses a modified <strong>Gompertz-Makeham mortality model</strong>. 
                 It calculates your "baseline" death probability at your current age and adjusts the curve based on your bio-age delta.
               </p>
               <div className="bg-black/40 rounded-2xl p-6 font-mono text-primary-400 text-sm overflow-x-auto">
                 {`h(t) = α * e^(βt) + γ`}
                 <div className="mt-2 text-gray-600 text-[10px]">Simple Gompertz Law — The foundation of our projection logic.</div>
               </div>
            </div>
          </motion.section>

          {/* Pillar 4: Privacy */}
          <motion.section {...fadeIn} className="relative">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center ring-1 ring-white/10">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-black dark:text-white text-gray-900">Privacy Architecture</h2>
            </div>
            <div className="glass-card p-8 border-l-4 border-gray-600">
               <p className="dark:text-gray-300 text-gray-700 mb-6 leading-relaxed">
                 Data integrity is paramount. VitalArc employs a **Local-First** paradigm:
               </p>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="p-4 glass rounded-xl text-xs"><strong>No Database:</strong> We do not store your health data on our servers.</div>
                 <div className="p-4 glass rounded-xl text-xs"><strong>Local Persistence:</strong> Data is encrypted in your browser's localStorage.</div>
                 <div className="p-4 glass rounded-xl text-xs"><strong>Session Isolation:</strong> Each health scan is a stateless computation.</div>
               </div>
            </div>
          </motion.section>

        </div>

        {/* Closing CTA */}
        <motion.div {...fadeIn} className="mt-32 text-center p-12 glass rounded-[3rem] border border-primary-500/20">
           <Calculator className="w-16 h-16 text-primary-500 mx-auto mb-6" />
           <h3 className="text-4xl font-black dark:text-white text-gray-900 mb-4">Pure Mathematics. <br /> Total Transparency.</h3>
           <p className="dark:text-gray-400 text-gray-600 mb-8 max-w-lg mx-auto">Explore our source code to see exactly how your health is being scored.</p>
           <button 
             onClick={() => router.push('/collector')}
             className="btn-primary text-xl px-12 py-4 shadow-2xl shadow-primary-500/20"
           >
             Run Your First Scan
           </button>
        </motion.div>

        <footer className="mt-24 text-center dark:text-gray-500 text-gray-500 text-sm">
           VitalArc Methodology v2.0 • Last Refined: March 2026
        </footer>
      </div>
    </div>
  );
}

// Re-using Lucide Lock since I didn't import it above
function Lock(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
