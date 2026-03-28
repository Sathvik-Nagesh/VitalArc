'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, Check } from 'lucide-react';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('vitalarc_cookie_consent');
    if (!consent) {
      // Delay showing it slightly for better UX
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('vitalarc_cookie_consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('vitalarc_cookie_consent', 'declined');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 150, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 150, opacity: 0 }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-md z-[100] glass-card p-6 shadow-2xl border border-white/10 overflow-hidden"
        >
          {/* Subtle background glow */}
          <div className="absolute inset-x-0 -bottom-10 h-20 bg-primary-500/20 blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                <Cookie className="w-5 h-5 text-primary-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold dark:text-white text-gray-900 mb-1">
                  We value your privacy
                </h3>
                <p className="text-xs dark:text-gray-400 text-gray-600 leading-relaxed">
                  VitalArc uses functional cookies to securely store your clinical session data locally and sync with your private cloud. We do not track you across other sites.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleDecline}
                className="flex-1 px-4 py-2 text-xs font-semibold rounded-lg border border-white/10 hover:bg-white/5 transition-colors dark:text-gray-300 text-gray-700 flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" /> Decline
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 px-4 py-2 text-xs font-semibold rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors shadow-glow-sm flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" /> I Agree
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
