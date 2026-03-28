'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useHealthStore } from '@/store/useHealthStore';
import AppLayout from '@/components/layout/AppLayout';
import { User, Save, Settings, AlertTriangle, Link2, Copy, RefreshCw, CheckCircle, Send } from 'lucide-react';
import { UserProfile } from '@/lib/types';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

function generateSyncToken(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let token = '';
  for (let i = 0; i < 8; i++) {
    if (i === 4) token += '-';
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export default function ProfilePage() {
  const router = useRouter();
  const { profile, setProfile, user } = useHealthStore();
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [isSaved, setIsSaved] = useState(false);
  const [syncToken, setSyncToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!profile) { router.push('/collector'); }
    else { setFormData(profile); }
  }, [profile, router]);

  if (!profile) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const parsedValue = name === 'gender' || name === 'name' ? value : Number(value);
    setFormData((prev) => ({ ...prev, [name]: parsedValue }));
    setIsSaved(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(formData as UserProfile);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleGenerateSyncToken = async () => {
    if (!user?.uid) {
      alert('You must be signed in to generate a sync token.');
      return;
    }
    setGenerating(true);
    const token = generateSyncToken();
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { syncToken: token });
      setSyncToken(token);
    } catch (err) {
      // If doc doesn't exist yet, just show token locally
      setSyncToken(token);
      console.warn('Could not save token to Firestore:', err);
    }
    setGenerating(false);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputClass = "w-full px-4 py-3 rounded-xl dark:bg-white/5 bg-gray-100 dark:text-white text-gray-800 border dark:border-white/10 border-gray-200 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/30 transition-all";
  const labelClass = "block text-sm font-medium dark:text-gray-300 text-gray-600 mb-1.5";

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto pb-24">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold dark:text-white text-gray-800 flex items-center gap-3">
              <Settings className="w-8 h-8 text-primary-500" /> Account & Profile
            </h1>
            <p className="dark:text-gray-400 text-gray-500 mt-1">Manage your basic details and preferences</p>
          </div>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          onSubmit={handleSave}
          className="glass-card p-6 md:p-8 space-y-6 mb-6"
        >
          <div className="flex items-center gap-4 mb-4 border-b dark:border-white/5 border-gray-200 pb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-blue-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {formData.name ? formData.name.charAt(0).toUpperCase() : <User />}
            </div>
            <div>
              <h2 className="text-xl font-bold dark:text-white text-gray-800">Basic Information</h2>
              <p className="text-xs dark:text-gray-400 text-gray-500">Update your core identity attributes.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div><label className={labelClass}>Full Name</label><input type="text" name="name" value={formData.name || ''} onChange={handleChange} className={inputClass} placeholder="John Doe" /></div>
            <div><label className={labelClass}>Age</label><input type="number" name="age" value={formData.age || ''} onChange={handleChange} className={inputClass} min="18" max="120" /></div>
            <div>
              <label className={labelClass}>Gender</label>
              <select name="gender" value={formData.gender || 'male'} onChange={handleChange} className={inputClass}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div><label className={labelClass}>Height (cm)</label><input type="number" name="height" value={formData.height || ''} onChange={handleChange} className={inputClass} min="100" max="250" /></div>
            <div><label className={labelClass}>Weight (kg)</label><input type="number" name="weight" value={formData.weight || ''} onChange={handleChange} className={inputClass} min="30" max="300" /></div>
          </div>

          <div className="mt-4 pt-4 border-t dark:border-white/5 border-gray-200 bg-yellow-500/5 p-4 rounded-xl border-l-4 border-yellow-500">
            <div className="flex items-center gap-2 text-yellow-500 font-bold mb-1">
              <AlertTriangle className="w-4 h-4" /> Recalculation Notice
            </div>
            <p className="text-xs dark:text-gray-400 text-gray-600">
              Modifying fundamental attributes like Age and Gender will cause the Clinical Engine to immediately recalculate your biological age, risk predictions, and AI Coach protocols upon saving.
            </p>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t dark:border-white/5 border-gray-200">
            <button type="submit" className="btn-primary flex items-center gap-2 px-8">
              <Save className="w-5 h-5" /> Save Changes
            </button>
            {isSaved && (
              <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-green-500 font-medium text-sm flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Successfully updated!
              </motion.span>
            )}
          </div>
        </motion.form>

        {/* ── Telegram Sync Section ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 md:p-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Send className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold dark:text-white text-gray-800">Telegram Health Sync</h2>
              <p className="text-xs dark:text-gray-400 text-gray-500">Update your health data by texting our bot — changes sync instantly to your dashboard</p>
            </div>
          </div>

          <div className="p-4 rounded-xl dark:bg-white/5 bg-gray-50 border dark:border-white/10 border-gray-200 mb-4">
            <ol className="space-y-2 text-sm dark:text-gray-300 text-gray-600">
              <li className="flex items-start gap-2">
                <span className="font-black text-primary-400 text-xs mt-0.5">1</span>
                Search <strong>@VitalArcSyncBot</strong> on Telegram and send <code className="bg-primary-500/10 text-primary-400 px-1 rounded">/start</code>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-black text-primary-400 text-xs mt-0.5">2</span>
                Generate your one-time Sync Token below
              </li>
              <li className="flex items-start gap-2">
                <span className="font-black text-primary-400 text-xs mt-0.5">3</span>
                Send <code className="bg-primary-500/10 text-primary-400 px-1 rounded">/sync YOUR-TOKEN</code> to the bot
              </li>
              <li className="flex items-start gap-2">
                <span className="font-black text-primary-400 text-xs mt-0.5">4</span>
                Text updates like <code className="bg-primary-500/10 text-primary-400 px-1 rounded">My weight is 75kg</code> or <code className="bg-primary-500/10 text-primary-400 px-1 rounded">I slept 8 hours</code>
              </li>
            </ol>
          </div>

          {!syncToken ? (
            <button
              onClick={handleGenerateSyncToken}
              disabled={generating || !user}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
              {generating ? 'Generating...' : user ? 'Generate Sync Token' : 'Sign in to Generate Token'}
            </button>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-1 px-4 py-3 rounded-xl dark:bg-white/5 bg-gray-100 border dark:border-white/10 border-gray-200 font-mono text-primary-400 text-xl font-black tracking-[0.3em] text-center">
                  {syncToken}
                </div>
                <button
                  onClick={() => handleCopy(`/sync ${syncToken}`)}
                  className="btn-secondary flex items-center gap-2 flex-shrink-0"
                >
                  {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-[10px] dark:text-yellow-400/70 text-yellow-600 font-semibold">
                ⚠ This token is one-time use and expires after linking. Generate a new one if needed.
              </p>
              <button onClick={() => setSyncToken(null)} className="text-xs dark:text-gray-500 text-gray-400 hover:text-primary-400 transition-colors">
                Generate different token
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
}
