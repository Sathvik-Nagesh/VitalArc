'use client';

import { motion } from 'framer-motion';

interface OrganSpot {
  id: string;
  label: string;
  cx: number;
  cy: number;
  r: number;
  color: string;
  glowColor: string;
}

const ORGAN_SPOTS: OrganSpot[] = [
  { id: 'brain', label: 'Brain', cx: 195, cy: 68, r: 22, color: '#8b5cf6', glowColor: '#8b5cf640' },
  { id: 'cardiovascular', label: 'Heart', cx: 178, cy: 160, r: 16, color: '#ef4444', glowColor: '#ef444440' },
  { id: 'metabolic', label: 'Metabolic', cx: 195, cy: 210, r: 18, color: '#f59e0b', glowColor: '#f59e0b40' },
  { id: 'musculoskeletal', label: 'Muscle & Bone', cx: 195, cy: 310, r: 14, color: '#06b6d4', glowColor: '#06b6d440' },
];

export default function BodyModel({ selectedOrgan = null }: { selectedOrgan?: string | null }) {
  return (
    <div className="relative w-full flex items-center justify-center select-none" style={{ minHeight: 440 }}>
      {/* Glow backdrop */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-48 h-[420px] rounded-full bg-primary-500/5 blur-3xl" />
      </div>

      <svg viewBox="0 0 390 480" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[280px] drop-shadow-2xl">
        <defs>
          {/* Body gradient */}
          <linearGradient id="bodyGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1e3a5f" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0a1628" stopOpacity="0.95" />
          </linearGradient>
          {/* Rim light left */}
          <linearGradient id="rimLeft" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#00d4aa" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#00d4aa" stopOpacity="0" />
          </linearGradient>
          {/* Rim light right */}
          <linearGradient id="rimRight" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
          {/* Grid pattern inside body */}
          <pattern id="bodyGrid" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
            <path d="M14 0L0 0L0 14" fill="none" stroke="#00d4aa" strokeOpacity="0.07" strokeWidth="0.5" />
          </pattern>
          <clipPath id="bodyClip">
            <path d="
              M195 18 
              C210 18 225 28 225 48 C225 68 210 78 195 78 C180 78 165 68 165 48 C165 28 180 18 195 18Z
              M175 82 C165 86 158 95 155 108 L150 142 L145 155 L135 175 L125 200 L128 210
              L142 205 L150 190 L155 160 L158 145 L160 130 
              L160 270 L158 310 L152 350 L148 390 L148 420 L165 420 L168 380 L172 340 L175 300
              L195 300 
              L215 300 L218 340 L222 380 L225 420 L242 420 L242 390 L238 350 L232 310 L230 270
              L230 130 L232 145 L235 160 L240 190 L248 205 L262 210 L265 200 L255 175 L245 155 L240 142
              L235 108 C232 95 225 86 215 82 Z
            " />
          </clipPath>
        </defs>

        {/* ── BODY SILHOUETTE ── */}

        {/* Head */}
        <ellipse cx="195" cy="48" rx="30" ry="32" fill="url(#bodyGrad)" />
        <ellipse cx="195" cy="48" rx="30" ry="32" fill="url(#bodyGrid)" />
        <ellipse cx="195" cy="48" rx="29.5" ry="31.5" stroke="#00d4aa" strokeOpacity="0.25" strokeWidth="0.8" fill="none" />
        {/* Head rim lights */}
        <ellipse cx="181" cy="44" rx="8" ry="16" fill="url(#rimLeft)" />
        <ellipse cx="209" cy="44" rx="8" ry="16" fill="url(#rimRight)" />

        {/* Neck */}
        <rect x="184" y="78" width="22" height="20" rx="4" fill="url(#bodyGrad)" />
        <rect x="184" y="78" width="22" height="20" rx="4" fill="url(#bodyGrid)" />
        <rect x="184.5" y="78.5" width="21" height="19" rx="3.5" stroke="#00d4aa" strokeOpacity="0.2" strokeWidth="0.8" fill="none" />

        {/* Torso */}
        <path d="M158 98 C160 94 170 88 184 86 L206 86 C220 88 230 94 232 98 L238 200 L238 280 L152 280 L152 200 Z" fill="url(#bodyGrad)" />
        <path d="M158 98 C160 94 170 88 184 86 L206 86 C220 88 230 94 232 98 L238 200 L238 280 L152 280 L152 200 Z" fill="url(#bodyGrid)" />
        <path d="M158 98 C160 94 170 88 184 86 L206 86 C220 88 230 94 232 98 L238 200 L238 280 L152 280 L152 200 Z" stroke="#00d4aa" strokeOpacity="0.2" strokeWidth="0.8" fill="none" />
        {/* Torso rim */}
        <path d="M159 98 L158 280" stroke="url(#rimLeft)" strokeWidth="6" />
        <path d="M231 98 L232 280" stroke="url(#rimRight)" strokeWidth="6" />

        {/* Left Upper Arm */}
        <path d="M152 100 C142 105 132 115 128 135 L120 190 L128 195 L140 150 L150 125 L156 106 Z" fill="url(#bodyGrad)" />
        <path d="M152 100 C142 105 132 115 128 135 L120 190 L128 195 L140 150 L150 125 L156 106 Z" fill="url(#bodyGrid)" />
        <path d="M152 100 C142 105 132 115 128 135 L120 190 L128 195 L140 150 L150 125 L156 106 Z" stroke="#00d4aa" strokeOpacity="0.2" strokeWidth="0.8" fill="none" />
        {/* Left Forearm */}
        <path d="M120 192 L112 240 L118 255 L128 210 L130 195 Z" fill="url(#bodyGrad)" />
        <path d="M120 192 L112 240 L118 255 L128 210 L130 195 Z" fill="url(#bodyGrid)" />
        <path d="M120 192 L112 240 L118 255 L128 210 L130 195 Z" stroke="#00d4aa" strokeOpacity="0.18" strokeWidth="0.8" fill="none" />

        {/* Right Upper Arm */}
        <path d="M238 100 C248 105 258 115 262 135 L270 190 L262 195 L250 150 L240 125 L234 106 Z" fill="url(#bodyGrad)" />
        <path d="M238 100 C248 105 258 115 262 135 L270 190 L262 195 L250 150 L240 125 L234 106 Z" fill="url(#bodyGrid)" />
        <path d="M238 100 C248 105 258 115 262 135 L270 190 L262 195 L250 150 L240 125 L234 106 Z" stroke="#00d4aa" strokeOpacity="0.2" strokeWidth="0.8" fill="none" />
        {/* Right Forearm */}
        <path d="M270 192 L278 240 L272 255 L262 210 L260 195 Z" fill="url(#bodyGrad)" />
        <path d="M270 192 L278 240 L272 255 L262 210 L260 195 Z" fill="url(#bodyGrid)" />
        <path d="M270 192 L278 240 L272 255 L262 210 L260 195 Z" stroke="#00d4aa" strokeOpacity="0.18" strokeWidth="0.8" fill="none" />

        {/* Pelvis */}
        <path d="M155 278 L165 298 L225 298 L235 278 Z" fill="url(#bodyGrad)" />
        <path d="M155 278 L165 298 L225 298 L235 278 Z" fill="url(#bodyGrid)" />
        <path d="M155 278 L165 298 L225 298 L235 278 Z" stroke="#00d4aa" strokeOpacity="0.2" strokeWidth="0.8" fill="none" />

        {/* Left Thigh */}
        <path d="M165 298 L160 360 L175 360 L180 300 Z" fill="url(#bodyGrad)" />
        <path d="M165 298 L160 360 L175 360 L180 300 Z" fill="url(#bodyGrid)" />
        <path d="M165 298 L160 360 L175 360 L180 300 Z" stroke="#00d4aa" strokeOpacity="0.18" strokeWidth="0.8" fill="none" />
        {/* Left Shin */}
        <path d="M160 361 L155 420 L174 420 L175 361 Z" fill="url(#bodyGrad)" />
        <path d="M160 361 L155 420 L174 420 L175 361 Z" fill="url(#bodyGrid)" />
        <path d="M160 361 L155 420 L174 420 L175 361 Z" stroke="#00d4aa" strokeOpacity="0.18" strokeWidth="0.8" fill="none" />

        {/* Right Thigh */}
        <path d="M225 298 L220 300 L225 360 L240 360 L235 298 Z" fill="url(#bodyGrad)" />
        <path d="M225 298 L220 300 L225 360 L240 360 L235 298 Z" fill="url(#bodyGrid)" />
        <path d="M225 298 L220 300 L225 360 L240 360 L235 298 Z" stroke="#00d4aa" strokeOpacity="0.18" strokeWidth="0.8" fill="none" />
        {/* Right Shin */}
        <path d="M215 361 L216 420 L235 420 L235 361 Z" fill="url(#bodyGrad)" />
        <path d="M215 361 L216 420 L235 420 L235 361 Z" fill="url(#bodyGrid)" />
        <path d="M215 361 L216 420 L235 420 L235 361 Z" stroke="#00d4aa" strokeOpacity="0.18" strokeWidth="0.8" fill="none" />

        {/* ── STITCHING / CIRCUIT LINES ── */}
        {/* Center vertical line */}
        <line x1="195" y1="88" x2="195" y2="278" stroke="#00d4aa" strokeOpacity="0.15" strokeWidth="0.6" strokeDasharray="4 6" />
        {/* Chest rib lines */}
        <path d="M195 130 Q175 140 168 155" stroke="#00d4aa" strokeOpacity="0.12" strokeWidth="0.8" fill="none" />
        <path d="M195 130 Q215 140 222 155" stroke="#00d4aa" strokeOpacity="0.12" strokeWidth="0.8" fill="none" />
        <path d="M195 155 Q172 165 165 178" stroke="#00d4aa" strokeOpacity="0.10" strokeWidth="0.8" fill="none" />
        <path d="M195 155 Q218 165 225 178" stroke="#00d4aa" strokeOpacity="0.10" strokeWidth="0.8" fill="none" />

        {/* ── ORGAN NODES ── */}
        {ORGAN_SPOTS.map((organ) => {
          const isSelected = selectedOrgan === organ.id;
          return (
            <g key={organ.id}>
              {/* Outer glow ring */}
              <motion.circle
                cx={organ.cx} cy={organ.cy} r={organ.r + 10}
                fill={organ.glowColor}
                animate={{ r: isSelected ? [organ.r + 10, organ.r + 18, organ.r + 10] : organ.r + 12, opacity: isSelected ? [0.6, 1, 0.6] : 0.4 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              />
              {/* Main circle */}
              <motion.circle
                cx={organ.cx} cy={organ.cy} r={organ.r}
                fill={organ.color}
                fillOpacity={isSelected ? 0.95 : 0.6}
                animate={isSelected ? { r: [organ.r, organ.r * 1.15, organ.r] } : { r: organ.r }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
              />
              {/* Inner bright dot */}
              <circle cx={organ.cx - organ.r * 0.3} cy={organ.cy - organ.r * 0.3} r={organ.r * 0.25} fill="white" fillOpacity={isSelected ? 0.6 : 0.3} />
              {/* Connector line to edge when selected */}
              {isSelected && (
                <motion.line
                  x1={organ.cx + organ.r} y1={organ.cy}
                  x2={organ.cx + organ.r + 28} y2={organ.cy}
                  stroke={organ.color} strokeWidth="1.5"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                  transition={{ duration: 0.4 }}
                />
              )}
            </g>
          );
        })}

        {/* ── SCAN LINE ── */}
        <motion.rect
          x="148" width="94" height="2" rx="1"
          fill="url(#rimLeft)"
          fillOpacity="0.6"
          animate={{ y: [20, 440, 20] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />
      </svg>

      {/* Floating organ labels */}
      {ORGAN_SPOTS.map((organ) => {
        const isSelected = selectedOrgan === organ.id;
        if (!isSelected) return null;
        return (
          <motion.div
            key={organ.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute right-2 text-xs font-bold px-2 py-1 rounded-lg"
            style={{
              top: `${(organ.cy / 480) * 100}%`,
              backgroundColor: organ.color + '22',
              border: `1px solid ${organ.color}66`,
              color: organ.color,
            }}
          >
            {organ.label}
          </motion.div>
        );
      })}
    </div>
  );
}
