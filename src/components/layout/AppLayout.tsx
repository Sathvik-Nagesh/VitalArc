'use client';

import Sidebar from '@/components/layout/Sidebar';
import CookieConsent from '@/components/layout/CookieConsent';
import { DISCLAIMER_TEXT } from '@/lib/constants';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import BackgroundPaths from '@/components/layout/BackgroundPaths';
import { useHealthStore } from '@/store/useHealthStore';
import { useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { fetchProfileFromCloud } from '@/lib/sync';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile, computeAll, setUser, setProfile } = useHealthStore();

  useEffect(() => {
    // Listen to Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const cloudProfile = await fetchProfileFromCloud(firebaseUser.uid);
        if (cloudProfile) {
          setProfile(cloudProfile);
        }
      }
    });
    return () => unsubscribe();
  }, [setUser, setProfile]);

  useEffect(() => {
    // Rehydrate health calculations if a profile exists in storage on first load
    if (profile) {
      computeAll();
    }
  }, [profile, computeAll]);

  return (
    <div className="flex min-h-screen bg-grid-pattern overflow-x-hidden relative">
      <BackgroundPaths />
      <Sidebar />
      <main className="flex-1 ml-[72px] lg:ml-[240px] min-h-screen flex flex-col">
        <div className="flex-1 p-4 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="w-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Subtle Disclaimer Footer */}
        <div className="text-[10px] text-center dark:text-gray-700 text-gray-400 px-8 pb-4 leading-relaxed hover:opacity-60 opacity-40 transition-opacity">
          ⚠️ {DISCLAIMER_TEXT}
        </div>
      </main>
      <CookieConsent />
    </div>
  );
}
