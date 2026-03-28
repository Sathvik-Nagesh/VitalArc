import React from 'react';
import {
  HeartPulse, BrainCircuit, Activity, Bone,
  Heart, Flame, Dumbbell, Moon, Utensils,
  Wind, Ban, Smile, Frown, Meh, Gauge, Shield, ShieldAlert,
  Medal, Star, CheckCircle
} from 'lucide-react';

export type IconName = 
  | 'HeartPulse' | 'BrainCircuit' | 'Activity' | 'Bone' | 'Heart' 
  | 'Flame' | 'Dumbbell' | 'Moon' | 'Utensils' | 'Wind' 
  | 'Ban' | 'Smile' | 'Frown' | 'Meh' | 'Gauge' | 'Shield' 
  | 'ShieldAlert' | 'Medal' | 'Star' | 'CheckCircle' | 'Brain' | 'TrendingDown' | 'TrendingUp';

const iconComponents: Record<string, React.ElementType<any>> = {
  HeartPulse, BrainCircuit, Activity, Bone, Heart, Flame, Dumbbell, Moon, Utensils,
  Wind, Ban, Smile, Frown, Meh, Gauge, Shield, ShieldAlert, Medal, Star, CheckCircle, Brain: BrainCircuit,
};

export function renderIcon(name: string, props?: any) {
  const IconComponent = iconComponents[name] || Activity;
  return React.createElement(IconComponent, props);
}
