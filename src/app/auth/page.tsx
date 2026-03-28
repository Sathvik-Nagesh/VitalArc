'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { Shield, Lock, Mail, ArrowRight, Loader2, HeartPulse } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getErrorMessage = (code: string): string => {
    const errorMap: Record<string, string> = {
      'auth/configuration-not-found': '🔧 Firebase Auth is not enabled. Go to Firebase Console → Authentication → Sign-in method → Enable Email/Password.',
      'auth/invalid-credential': 'Invalid email or password. Please try again.',
      'auth/user-not-found': 'No account found with this email. Please sign up.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/email-already-in-use': 'This email is already registered. Please sign in instead.',
      'auth/weak-password': 'Password must be at least 6 characters.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/too-many-requests': 'Too many attempts. Please wait a few minutes and try again.',
      'auth/network-request-failed': 'Network error. Check your internet connection.',
    };
    return errorMap[code] || `Authentication error: ${code}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      router.push('/collector');
    } catch (err: any) {
      const code = err?.code || '';
      setError(getErrorMessage(code));
      console.error('[Auth Error]', code, err?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center min-h-[75vh] p-4">
        <motion.div
           initial={{ opacity: 0, y: 30, scale: 0.95 }}
           animate={{ opacity: 1, y: 0, scale: 1 }}
           transition={{ duration: 0.6, ease: "easeOut" }}
           className="w-full max-w-md"
        >
          {/* Brand & Badge */}
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow shadow-primary-500/30 mb-6">
              <HeartPulse className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-black dark:text-white text-gray-900 tracking-tight mb-2">
              {isLogin ? 'Welcome Back.' : 'Create Account.'}
            </h1>
            <p className="dark:text-gray-400 text-gray-500 font-light text-sm max-w-xs leading-relaxed">
              Securely access your clinical longevity data and health simulations.
            </p>
          </div>

          <div className="glass-card p-8 border dark:border-white/5 border-gray-200 shadow-3xl relative overflow-hidden">
            {/* Glossy overlay effect */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px] pointer-events-none" />
            
            <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
              
              <AnimatePresence mode="wait">
                 {error && (
                    <motion.div 
                       initial={{ opacity: 0, height: 0 }} 
                       animate={{ opacity: 1, height: 'auto' }} 
                       exit={{ opacity: 0, height: 0 }}
                       className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold"
                    >
                       ⚠️ {error}
                    </motion.div>
                 )}
              </AnimatePresence>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest dark:text-gray-500 text-gray-400 mb-2">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 dark:text-gray-600 text-gray-400" />
                    </div>
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl dark:bg-black/40 bg-gray-50/50 border dark:border-white/10 border-gray-200 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-sm"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest dark:text-gray-500 text-gray-400 mb-2">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 dark:text-gray-600 text-gray-400" />
                    </div>
                    <input 
                      type="password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl dark:bg-black/40 bg-gray-50/50 border dark:border-white/10 border-gray-200 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-sm"
                      placeholder="••••••••"
                      minLength={6}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full btn-primary py-4 flex items-center justify-center gap-2 group shadow-lg shadow-primary-500/20"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {isLogin ? 'Sign In' : 'Create Account'} 
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-8 text-center flex flex-col items-center gap-4">
            <button 
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs font-semibold dark:text-gray-400 text-gray-500 hover:text-primary-500 transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
            <div className="flex items-center gap-2 text-[10px] dark:text-gray-600 text-gray-400 uppercase tracking-widest font-black">
              <Shield className="w-3 h-3" />
              <span>AES-256 Encrypted Profile</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
