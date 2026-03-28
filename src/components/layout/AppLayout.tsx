import Sidebar from '@/components/layout/Sidebar';
import { DISCLAIMER_TEXT } from '@/lib/constants';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-grid-pattern">
      <Sidebar />
      <main className="flex-1 ml-[72px] lg:ml-[240px] p-4 lg:p-8">
        {/* Disclaimer banner */}
        <div className="mb-6 p-3 rounded-xl glass-card text-xs text-gray-400 dark:text-gray-500 flex items-start gap-2" id="disclaimer-banner">
          <span className="text-yellow-500 mt-0.5">⚠️</span>
          <p>{DISCLAIMER_TEXT}</p>
        </div>
        {children}
      </main>
    </div>
  );
}
