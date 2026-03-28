'use client';

import { useEffect } from 'react';
import { useHealthStore } from '@/store/useHealthStore';

export function ThemeInitializer() {
  const theme = useHealthStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(theme);
  }, [theme]);

  return null;
}
