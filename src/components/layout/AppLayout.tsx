'use client';

import Sidebar from '@/components/layout/Sidebar';
import { DISCLAIMER_TEXT } from '@/lib/constants';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import BackgroundPaths from '@/components/layout/BackgroundPaths';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-grid-pattern overflow-hidden relative">
      <BackgroundPaths />
      <Sidebar />
      <main className="flex-1 ml-[72px] lg:ml-[240px] p-4 lg:p-8 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-full flex-1 flex flex-col"
          >
            {children}
          </motion.div>
        </AnimatePresence>

        {/* Subtle Disclaimer Footer */}
        <div className="mt-12 text-[10px] md:text-xs text-center text-gray-400 dark:text-gray-600 max-w-4xl mx-auto pb-4 opacity-60 hover:opacity-100 transition-opacity">
          ⚠️ {DISCLAIMER_TEXT}
        </div>
      </main>
    </div>
  );
}
