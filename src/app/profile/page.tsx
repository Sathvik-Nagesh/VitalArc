'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useHealthStore } from '@/store/useHealthStore';
import AppLayout from '@/components/layout/AppLayout';
import { User, Save, Settings, AlertTriangle } from 'lucide-react';
import { UserProfile } from '@/lib/types';

export default function ProfilePage() {
  const router = useRouter();
  const { profile, setProfile } = useHealthStore();
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (!profile) {
      router.push('/collector');
    } else {
      setFormData(profile);
    }
  }, [profile, router]);

  if (!profile) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const parsedValue = name === 'gender' ? value : name === 'name' ? value : Number(value);
    setFormData((prev) => ({ ...prev, [name]: parsedValue }));
    setIsSaved(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(formData as UserProfile);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
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
          className="glass-card p-6 md:p-8 space-y-6"
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
            <div>
              <label className={labelClass}>Full Name</label>
              <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className={inputClass} placeholder="John Doe" />
            </div>
            <div>
              <label className={labelClass}>Age</label>
              <input type="number" name="age" value={formData.age || ''} onChange={handleChange} className={inputClass} min="18" max="120" />
            </div>
            <div>
              <label className={labelClass}>Gender</label>
              <select name="gender" value={formData.gender || 'male'} onChange={handleChange} className={inputClass}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Height (cm)</label>
              <input type="number" name="height" value={formData.height || ''} onChange={handleChange} className={inputClass} min="100" max="250" />
            </div>
            <div>
              <label className={labelClass}>Weight (kg)</label>
              <input type="number" name="weight" value={formData.weight || ''} onChange={handleChange} className={inputClass} min="30" max="300" />
            </div>
          </div>

          <div className="mt-8 pt-6 border-t dark:border-white/5 border-gray-200 bg-yellow-500/5 p-4 rounded-xl border-l-4 border-yellow-500">
            <div className="flex items-center gap-2 text-yellow-500 font-bold mb-1">
              <AlertTriangle className="w-4 h-4" /> Recalculation Notice
            </div>
            <p className="text-xs dark:text-gray-400 text-gray-600">
              Modifying fundamental attributes like Age and Gender will cause the AI Engine to immediately recalculate your biological age, timeline risks, and AI Coach protocols upon saving.
            </p>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t dark:border-white/5 border-gray-200">
            <button type="submit" className="btn-primary flex items-center gap-2 px-8">
              <Save className="w-5 h-5" /> Save Changes
            </button>
            {isSaved && (
              <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-green-500 font-medium text-sm flex items-center gap-1">
                Successfully updated!
              </motion.span>
            )}
          </div>
        </motion.form>
      </div>
    </AppLayout>
  );
}
