'use client';

import AppLayout from '@/components/layout/AppLayout';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto py-12 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-500 to-blue-500" />
          
          <div className="flex items-center gap-4 mb-8 border-b dark:border-white/10 border-gray-200 pb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/20 to-blue-500/20 flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary-500" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold dark:text-white text-gray-800">Privacy Policy</h1>
              <p className="dark:text-gray-400 text-gray-500 mt-1">Last updated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div className="space-y-8 dark:text-gray-300 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold dark:text-white text-gray-800 mb-3">1. Data Collection and Storage</h2>
              <p>
                <strong>VitalArc is a demonstration application built for a hackathon.</strong> All health data, biometric inputs, and generated simulations are stored <em>locally on your device</em> using standard browser storage mechanisms (LocalStorage/SessionStorage). We do not transmit your personal physical health metrics to any external persistent database or remote server for storage.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold dark:text-white text-gray-800 mb-3">2. Third-Party Integrations & AI</h2>
              <p>
                To provide predictive insights, the application may securely transmit transient, anonymized data payloads to external APIs (such as Google Gemini or other NLP parsing services) purely for natural language processing and algorithmic assessment. These payloads are NOT persistently stored or tied to your identity by VitalArc.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold dark:text-white text-gray-800 mb-3">3. Cookie Policy & Tracking</h2>
              <p>
                We do not use tracking cookies or third-party analytics pixels. The only cookies or local storage artifacts utilized are essential for maintaining your active session state and remembering your theme preferences (e.g., Light/Dark mode).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold dark:text-white text-gray-800 mb-3">4. Security</h2>
              <p>
                Because your core profile data remains strictly client-side, the security of your data relies heavily on the physical security of your device. We encourage you not to use this demo application on shared or public computers.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
