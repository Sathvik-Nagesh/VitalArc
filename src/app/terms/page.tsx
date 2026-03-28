'use client';

import AppLayout from '@/components/layout/AppLayout';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto py-12 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-orange-500" />
          
          <div className="flex items-center gap-4 mb-8 border-b dark:border-white/10 border-gray-200 pb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center">
              <FileText className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold dark:text-white text-gray-800">Terms of Service</h1>
              <p className="dark:text-gray-400 text-gray-500 mt-1">Last updated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div className="space-y-8 dark:text-gray-300 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold dark:text-white text-gray-800 mb-3">1. Medical Disclaimer (NOT A DOCTOR)</h2>
              <p>
                <strong>VitalArc DOES NOT PROVIDE MEDICAL ADVICE.</strong> The content, insights, health timeline projections, biological age calculations, and all other materials provided by the application are strictly for educational and demonstration purposes as part of a hackathon prototype project. 
              </p>
              <p className="mt-2 text-red-400 font-medium">
                Do not use this software for self-diagnosis or to alter any existing medical treatment plans. Always consult with a licensed professional physician regarding your health concerns.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold dark:text-white text-gray-800 mb-3">2. Accuracy Limitations</h2>
              <p>
                The algorithms driving the health predictions are highly simplified approximations leveraging arbitrary coefficients, heuristic rules, and Large Language Models. Predictions inherently carry significant margins of error and might generate "hallucinated" or fundamentally incorrect medical warnings. We make no warranties regarding accuracy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold dark:text-white text-gray-800 mb-3">3. Usage Rights</h2>
              <p>
                As this is an open hackathon project, you are granted a non-exclusive license to use, reproduce, modify, and distribute the interface under standard open-source conventions without warranty. Use at your own risk.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
