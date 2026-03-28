'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface OrganData {
  id: string;
  label: string;
  age: number;
  delta: number;
  color: string;
  description: string;
}

interface Props {
  organs: OrganData[];
  onSelect: (organ: OrganData | null) => void;
  selectedId?: string | null;
}

// Organ SVG paths/positions on a 300x600 coordinate body
const ORGAN_DEFS = [
  {
    id: 'brain',
    cx: 150, cy: 56, rx: 30, ry: 26,
    labelCx: 150, labelCy: 56,
    shape: 'ellipse',
    pulseSpeed: 3,
  },
  {
    id: 'cardiovascular',
    cx: 138, cy: 190, rx: 18, ry: 16,
    labelCx: 138, labelCy: 190,
    shape: 'heart',
    pulseSpeed: 0.8,
  },
  {
    id: 'lungs',
    cx: 150, cy: 195, rx: 42, ry: 24,
    labelCx: 150, labelCy: 195,
    shape: 'lungs',
    pulseSpeed: 3.5,
  },
  {
    id: 'metabolic',
    cx: 150, cy: 250, rx: 24, ry: 20,
    labelCx: 150, labelCy: 250,
    shape: 'ellipse',
    pulseSpeed: 4,
  },
  {
    id: 'musculoskeletal',
    cx: 150, cy: 340, rx: 20, ry: 16,
    labelCx: 150, labelCy: 340,
    shape: 'ellipse',
    pulseSpeed: 5,
  },
] as const;

function getOrganColor(organs: OrganData[], id: string): { color: string; delta: number } {
  const o = organs.find(o => o.id === id);
  if (!o) return { color: '#00d4aa', delta: 0 };
  return { color: o.color, delta: o.delta };
}

export default function InteractiveBody({ organs, onSelect, selectedId }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  const handleClick = (id: string) => {
    const organ = organs.find(o => o.id === id);
    if (selectedId === id) {
      onSelect(null);
    } else {
      onSelect(organ ?? null);
    }
  };

  return (
    <div className="relative flex flex-col items-center w-full select-none">
      <svg
        viewBox="0 0 300 620"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-[260px] mx-auto"
        style={{ filter: 'drop-shadow(0 20px 60px rgba(0,212,170,0.15))' }}
      >
        <defs>
          {/* Body skin gradient */}
          <linearGradient id="skinGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1a3a5c" stopOpacity="0.92" />
            <stop offset="100%" stopColor="#0d1f35" stopOpacity="0.97" />
          </linearGradient>
          {/* Vascular interior */}
          <linearGradient id="innerGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0f2744" stopOpacity="1" />
            <stop offset="100%" stopColor="#081428" stopOpacity="1" />
          </linearGradient>
          {/* Teal rim light */}
          <linearGradient id="rimTeal" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#00d4aa" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#00d4aa" stopOpacity="0" />
          </linearGradient>
          {/* Purple rim light */}
          <linearGradient id="rimPurple" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
          {/* Scan gradient */}
          <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00d4aa" stopOpacity="0" />
            <stop offset="50%" stopColor="#00d4aa" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#00d4aa" stopOpacity="0" />
          </linearGradient>
          {/* Glow filters per organ */}
          {organs.map(o => (
            <filter key={o.id} id={`glow-${o.id}`}>
              <feGaussianBlur stdDeviation="5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
          <filter id="bodyGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="scanBlur">
            <feGaussianBlur stdDeviation="8" />
          </filter>
          <pattern id="hexGrid" x="0" y="0" width="20" height="17.3" patternUnits="userSpaceOnUse">
            <polygon points="10,1 19,5.5 19,12.8 10,17.3 1,12.8 1,5.5" fill="none" stroke="#00d4aa" strokeOpacity="0.05" strokeWidth="0.5" />
          </pattern>
        </defs>

        {/* ───── BODY SILHOUETTE ───── */}

        {/* Shadow beneath feet */}
        <ellipse cx="150" cy="615" rx="60" ry="6" fill="#00d4aa" fillOpacity="0.06" />

        {/* Legs */}
        {/* Left thigh */}
        <path d="M120 430 C110 435 105 460 107 490 C108 510 112 530 115 550 C117 562 120 570 124 578 L136 578 C133 570 130 562 129 550 C127 530 124 510 124 490 C124 468 126 448 130 432 Z" fill="url(#skinGrad)" stroke="#00d4aa" strokeOpacity="0.2" strokeWidth="0.7" />
        {/* Right thigh */}
        <path d="M180 430 C190 435 195 460 193 490 C192 510 188 530 185 550 C183 562 180 570 176 578 L164 578 C167 570 170 562 171 550 C173 530 176 510 176 490 C176 468 174 448 170 432 Z" fill="url(#skinGrad)" stroke="#8b5cf6" strokeOpacity="0.15" strokeWidth="0.7" />
        {/* Left shin */}
        <path d="M115 550 L113 580 L115 600 C116 606 120 609 124 608 C128 607 130 603 130 598 L130 578 L129 550 Z" fill="url(#skinGrad)" stroke="#00d4aa" strokeOpacity="0.15" strokeWidth="0.6" />
        {/* Right shin */}
        <path d="M185 550 L187 580 L185 600 C184 606 180 609 176 608 C172 607 170 603 170 598 L170 578 L171 550 Z" fill="url(#skinGrad)" stroke="#8b5cf6" strokeOpacity="0.12" strokeWidth="0.6" />

        {/* Pelvis area */}
        <path d="M120 405 C112 415 110 425 110 435 L120 432 L150 434 L180 432 L190 435 C190 425 188 415 180 405 Z" fill="url(#innerGrad)" stroke="#00d4aa" strokeOpacity="0.2" strokeWidth="0.7" />

        {/* Torso */}
        <path d="
          M107 160 C102 175 100 200 100 220 L100 280 C100 310 102 340 105 365 L108 400 L150 408 L192 400 L195 365 C198 340 200 310 200 280 L200 220 C200 200 198 175 193 160 C185 148 170 140 150 138 C130 140 115 148 107 160 Z
        " fill="url(#innerGrad)" stroke="#00d4aa" strokeOpacity="0.22" strokeWidth="0.8" />
        {/* Torso rim left */}
        <path d="M107 165 L105 395" stroke="url(#rimTeal)" strokeWidth="8" fill="none" />
        {/* Torso rim right */}
        <path d="M193 165 L195 395" stroke="url(#rimPurple)" strokeWidth="8" fill="none" />
        {/* Torso hex grid overlay */}
        <path d="M107 160 C102 175 100 200 100 220 L100 280 C100 310 102 340 105 365 L108 400 L150 408 L192 400 L195 365 C198 340 200 310 200 280 L200 220 C200 200 198 175 193 160 C185 148 170 140 150 138 C130 140 115 148 107 160 Z" fill="url(#hexGrid)" />

        {/* Torso outer skin */}
        <path d="
          M107 160 C102 175 100 200 100 220 L100 280 C100 310 102 340 105 365 L108 400 L150 408 L192 400 L195 365 C198 340 200 310 200 280 L200 220 C200 200 198 175 193 160 C185 148 170 140 150 138 C130 140 115 148 107 160 Z
        " fill="none" stroke="#00d4aa" strokeOpacity="0.25" strokeWidth="1" />

        {/* Left arm */}
        <path d="M107 165 C98 172 88 185 82 205 L72 250 L68 280 C68 290 70 296 75 298 L80 280 L88 245 L98 210 L107 185 Z" fill="url(#skinGrad)" stroke="#00d4aa" strokeOpacity="0.18" strokeWidth="0.7" />
        {/* Left forearm */}
        <path d="M68 285 C65 295 64 310 64 325 L64 355 C64 362 67 366 72 366 C77 366 80 362 80 355 L80 325 C80 310 78 296 75 285 Z" fill="url(#skinGrad)" stroke="#00d4aa" strokeOpacity="0.14" strokeWidth="0.6" />
        {/* Right arm */}
        <path d="M193 165 C202 172 212 185 218 205 L228 250 L232 280 C232 290 230 296 225 298 L220 280 L212 245 L202 210 L193 185 Z" fill="url(#skinGrad)" stroke="#8b5cf6" strokeOpacity="0.15" strokeWidth="0.7" />
        {/* Right forearm */}
        <path d="M232 285 C235 295 236 310 236 325 L236 355 C236 362 233 366 228 366 C223 366 220 362 220 355 L220 325 C220 310 222 296 225 285 Z" fill="url(#skinGrad)" stroke="#8b5cf6" strokeOpacity="0.12" strokeWidth="0.6" />

        {/* Neck */}
        <rect x="135" y="108" width="30" height="36" rx="8" fill="url(#skinGrad)" stroke="#00d4aa" strokeOpacity="0.2" strokeWidth="0.7" />

        {/* Head */}
        <ellipse cx="150" cy="82" rx="40" ry="46" fill="url(#skinGrad)" stroke="#00d4aa" strokeOpacity="0.3" strokeWidth="0.8" />
        <ellipse cx="150" cy="82" rx="40" ry="46" fill="url(#hexGrid)" />
        {/* Head rim */}
        <ellipse cx="136" cy="78" rx="12" ry="22" fill="url(#rimTeal)" />
        <ellipse cx="164" cy="78" rx="12" ry="22" fill="url(#rimPurple)" />

        {/* ── INTERNAL ANATOMY LINES ── */}
        {/* Spine */}
        <line x1="150" y1="138" x2="150" y2="405" stroke="#00d4aa" strokeOpacity="0.12" strokeWidth="1" strokeDasharray="4 6" />
        {/* Rib lines */}
        {[170, 190, 210, 230].map((y, i) => (
          <g key={i}>
            <path d={`M150 ${y} Q132 ${y + 6} 118 ${y + 2}`} stroke="#00d4aa" strokeOpacity="0.09" strokeWidth="0.8" fill="none" />
            <path d={`M150 ${y} Q168 ${y + 6} 182 ${y + 2}`} stroke="#00d4aa" strokeOpacity="0.09" strokeWidth="0.8" fill="none" />
          </g>
        ))}
        {/* Collarbone */}
        <path d="M120 152 Q150 148 180 152" stroke="#00d4aa" strokeOpacity="0.18" strokeWidth="1" fill="none" />

        {/* ── ORGAN SHAPES ── */}

        {/* LUNGS */}
        {(() => {
          const o = organs.find(x => x.id === 'lungs') ?? organs.find(x => x.id === 'cardiovascular');
          const clr = '#60a5fa';
          const isHov = hovered === 'lungs';
          const isSel = selectedId === 'lungs';
          return (
            <g onClick={() => handleClick('lungs')} onMouseEnter={() => setHovered('lungs')} onMouseLeave={() => setHovered(null)} style={{ cursor: 'pointer' }}>
              {(isHov || isSel) && <ellipse cx="122" cy="198" rx="24" ry="30" fill={clr} fillOpacity="0.12" filter="url(#scanBlur)" />}
              {(isHov || isSel) && <ellipse cx="178" cy="198" rx="24" ry="30" fill={clr} fillOpacity="0.12" filter="url(#scanBlur)" />}
              {/* Left lung */}
              <motion.ellipse cx="122" cy="200" rx="20" ry="28" fill={clr} fillOpacity={isSel ? 0.55 : isHov ? 0.4 : 0.2}
                stroke={clr} strokeWidth={isSel ? 1.5 : 0.8} strokeOpacity={isSel ? 0.9 : 0.5}
                animate={isSel ? { ry: [28, 31, 28] } : {}} transition={{ duration: 2, repeat: Infinity }} />
              {/* Right lung */}
              <motion.ellipse cx="178" cy="200" rx="20" ry="28" fill={clr} fillOpacity={isSel ? 0.55 : isHov ? 0.4 : 0.2}
                stroke={clr} strokeWidth={isSel ? 1.5 : 0.8} strokeOpacity={isSel ? 0.9 : 0.5}
                animate={isSel ? { ry: [28, 31, 28] } : {}} transition={{ duration: 2, repeat: Infinity }} />
              {/* Hotspot dots */}
              <motion.circle cx="122" cy="198" r={isSel ? 5 : isHov ? 4 : 3} fill={clr}
                animate={{ r: [3, 5, 3] }} transition={{ duration: 2, repeat: Infinity }} />
              <motion.circle cx="178" cy="198" r={isSel ? 5 : isHov ? 4 : 3} fill={clr}
                animate={{ r: [3, 5, 3] }} transition={{ duration: 2, repeat: Infinity, delay: 0.2 }} />
            </g>
          );
        })()}

        {/* HEART */}
        {(() => {
          const o = organs.find(x => x.id === 'cardiovascular');
          const clr = o?.color ?? '#ef4444';
          const isHov = hovered === 'cardiovascular';
          const isSel = selectedId === 'cardiovascular';
          return (
            <g onClick={() => handleClick('cardiovascular')} onMouseEnter={() => setHovered('cardiovascular')} onMouseLeave={() => setHovered(null)} style={{ cursor: 'pointer' }}>
              {(isHov || isSel) && <ellipse cx="138" cy="192" rx="22" ry="22" fill={clr} fillOpacity="0.18" filter="url(#scanBlur)" />}
              {/* Heart shape */}
              <motion.path
                d="M138 206 C128 196 114 188 116 176 C118 165 128 163 134 168 C136 170 137 172 138 174 C139 172 140 170 142 168 C148 163 158 165 160 176 C162 188 148 196 138 206 Z"
                fill={clr} fillOpacity={isSel ? 0.85 : isHov ? 0.65 : 0.45}
                stroke={clr} strokeWidth={isSel ? 2 : 1} strokeOpacity="0.9"
                filter={isSel ? `url(#glow-cardiovascular)` : undefined}
                animate={isSel ? { scale: [1, 1.12, 1, 1.08, 1] } : { scale: [1, 1.06, 1, 1.04, 1] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformOrigin: '138px 192px' }}
              />
              {/* Pulse ring */}
              {isSel && (
                <motion.circle cx="138" cy="190" r={12} fill="none" stroke={clr} strokeOpacity="0.6"
                  animate={{ r: [12, 24], opacity: [0.6, 0] }} transition={{ duration: 0.8, repeat: Infinity }} />
              )}
            </g>
          );
        })()}

        {/* BRAIN */}
        {(() => {
          const o = organs.find(x => x.id === 'brain');
          const clr = o?.color ?? '#8b5cf6';
          const isHov = hovered === 'brain';
          const isSel = selectedId === 'brain';
          return (
            <g onClick={() => handleClick('brain')} onMouseEnter={() => setHovered('brain')} onMouseLeave={() => setHovered(null)} style={{ cursor: 'pointer' }}>
              {(isHov || isSel) && <ellipse cx="150" cy="72" rx="36" ry="34" fill={clr} fillOpacity="0.15" filter="url(#scanBlur)" />}
              {/* Brain folds */}
              <motion.ellipse cx="150" cy="70" rx="26" ry="22" fill={clr} fillOpacity={isSel ? 0.7 : isHov ? 0.5 : 0.3}
                stroke={clr} strokeWidth={isSel ? 1.5 : 0.8} strokeOpacity="0.8"
                filter={isSel ? `url(#glow-brain)` : undefined}
                animate={isSel ? { rx: [26, 28, 26] } : {}} transition={{ duration: 3, repeat: Infinity }} />
              <path d="M136 65 Q143 58 150 65 Q157 58 164 65" stroke={clr} strokeOpacity={isSel ? 0.6 : 0.3} strokeWidth="1.2" fill="none" />
              <path d="M133 74 Q141 68 150 74 Q159 68 167 74" stroke={clr} strokeOpacity={isSel ? 0.6 : 0.3} strokeWidth="1.2" fill="none" />
              <motion.circle cx="150" cy="70" r={isSel ? 5 : isHov ? 4 : 3} fill={clr}
                animate={{ r: [3, 5, 3] }} transition={{ duration: 3, repeat: Infinity }} />
            </g>
          );
        })()}

        {/* METABOLIC (Liver/Stomach/Gut) */}
        {(() => {
          const o = organs.find(x => x.id === 'metabolic');
          const clr = o?.color ?? '#f59e0b';
          const isHov = hovered === 'metabolic';
          const isSel = selectedId === 'metabolic';
          return (
            <g onClick={() => handleClick('metabolic')} onMouseEnter={() => setHovered('metabolic')} onMouseLeave={() => setHovered(null)} style={{ cursor: 'pointer' }}>
              {(isHov || isSel) && <ellipse cx="150" cy="258" rx="32" ry="26" fill={clr} fillOpacity="0.15" filter="url(#scanBlur)" />}
              {/* Liver right */}
              <motion.ellipse cx="162" cy="255" rx="20" ry="14" fill={clr} fillOpacity={isSel ? 0.7 : isHov ? 0.5 : 0.3}
                stroke={clr} strokeWidth={isSel ? 1.5 : 0.8} strokeOpacity="0.8"
                filter={isSel ? `url(#glow-metabolic)` : undefined}
                animate={isSel ? { rx: [20, 22, 20] } : {}} transition={{ duration: 4, repeat: Infinity }} />
              {/* Stomach left */}
              <motion.path d="M140 248 C130 248 125 255 126 264 C127 272 134 278 142 276 C148 274 150 268 148 260 C146 252 144 248 140 248 Z"
                fill={clr} fillOpacity={isSel ? 0.55 : isHov ? 0.35 : 0.2} stroke={clr} strokeWidth="0.7" strokeOpacity="0.6" />
              <motion.circle cx="150" cy="258" r={isSel ? 5 : isHov ? 4 : 3} fill={clr}
                animate={{ r: [3, 5, 3] }} transition={{ duration: 4, repeat: Infinity }} />
            </g>
          );
        })()}

        {/* MUSCULOSKELETAL */}
        {(() => {
          const o = organs.find(x => x.id === 'musculoskeletal');
          const clr = o?.color ?? '#06b6d4';
          const isHov = hovered === 'musculoskeletal';
          const isSel = selectedId === 'musculoskeletal';
          return (
            <g onClick={() => handleClick('musculoskeletal')} onMouseEnter={() => setHovered('musculoskeletal')} onMouseLeave={() => setHovered(null)} style={{ cursor: 'pointer' }}>
              {(isHov || isSel) && <ellipse cx="150" cy="345" rx="32" ry="22" fill={clr} fillOpacity="0.12" filter="url(#scanBlur)" />}
              {/* Pelvis/hip markers */}
              <motion.ellipse cx="130" cy="348" rx="14" ry="10" fill={clr} fillOpacity={isSel ? 0.6 : isHov ? 0.4 : 0.22}
                stroke={clr} strokeWidth={(isSel ? 1.5 : 0.8)} strokeOpacity="0.8"
                filter={isSel ? `url(#glow-musculoskeletal)` : undefined} />
              <motion.ellipse cx="170" cy="348" rx="14" ry="10" fill={clr} fillOpacity={isSel ? 0.6 : isHov ? 0.4 : 0.22}
                stroke={clr} strokeWidth={(isSel ? 1.5 : 0.8)} strokeOpacity="0.8" />
              {/* Knee joints when selected */}
              {(isSel || isHov) && <>
                <motion.circle cx="122" cy="490" r={isSel ? 9 : 6} fill={clr} fillOpacity="0.3" stroke={clr} strokeWidth="1" strokeOpacity="0.7"
                  animate={{ r: [6, 10, 6] }} transition={{ duration: 2, repeat: Infinity }} />
                <motion.circle cx="178" cy="490" r={isSel ? 9 : 6} fill={clr} fillOpacity="0.3" stroke={clr} strokeWidth="1" strokeOpacity="0.7"
                  animate={{ r: [6, 10, 6] }} transition={{ duration: 2, repeat: Infinity, delay: 0.2 }} />
              </>}
              <motion.circle cx="150" cy="345" r={isSel ? 5 : isHov ? 4 : 3} fill={clr}
                animate={{ r: [3, 5, 3] }} transition={{ duration: 5, repeat: Infinity }} />
            </g>
          );
        })()}

        {/* ── SCAN LINE ── */}
        <motion.rect
          x="92" width="116" height="40" rx="4"
          fill="url(#scanGrad)"
          animate={{ y: [60, 590, 60] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
        />

        {/* ── CONNECTOR LINES TO HOTSPOTS ── */}
        <AnimatePresence>
          {selectedId === 'cardiovascular' && (
            <motion.line x1="138" y1="192" x2="75" y2="192" stroke="#ef4444" strokeWidth="1" strokeOpacity="0.7" strokeDasharray="3 3"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} exit={{ pathLength: 0 }} transition={{ duration: 0.4 }} />
          )}
          {selectedId === 'brain' && (
            <motion.line x1="150" y1="50" x2="215" y2="50" stroke="#8b5cf6" strokeWidth="1" strokeOpacity="0.7" strokeDasharray="3 3"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} exit={{ pathLength: 0 }} transition={{ duration: 0.4 }} />
          )}
          {selectedId === 'metabolic' && (
            <motion.line x1="180" y1="258" x2="225" y2="258" stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.7" strokeDasharray="3 3"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} exit={{ pathLength: 0 }} transition={{ duration: 0.4 }} />
          )}
          {selectedId === 'musculoskeletal' && (
            <motion.line x1="170" y1="348" x2="225" y2="348" stroke="#06b6d4" strokeWidth="1" strokeOpacity="0.7" strokeDasharray="3 3"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} exit={{ pathLength: 0 }} transition={{ duration: 0.4 }} />
          )}
          {selectedId === 'lungs' && (
            <motion.line x1="178" y1="198" x2="225" y2="198" stroke="#60a5fa" strokeWidth="1" strokeOpacity="0.7" strokeDasharray="3 3"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} exit={{ pathLength: 0 }} transition={{ duration: 0.4 }} />
          )}
        </AnimatePresence>
      </svg>

      {/* Organ labels that float beside the body */}
      <div className="absolute inset-0 pointer-events-none">
        {organs.map(organ => {
          const isHov = hovered === organ.id || selectedId === organ.id;
          return (
            <AnimatePresence key={organ.id}>
              {isHov && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                  className="absolute right-0 text-[10px] font-bold rounded-lg px-2 py-1"
                  style={{
                    top: `${organ.id === 'brain' ? 8 : organ.id === 'cardiovascular' ? 29 : organ.id === 'lungs' ? 31 : organ.id === 'metabolic' ? 39 : 53}%`,
                    backgroundColor: organ.color + '22',
                    border: `1px solid ${organ.color}55`,
                    color: organ.color,
                  }}
                >
                  {organ.label}
                </motion.div>
              )}
            </AnimatePresence>
          );
        })}
      </div>

      {/* Tap hint */}
      <p className="text-[10px] dark:text-gray-600 text-gray-400 mt-2 text-center font-medium uppercase tracking-widest">
        Click an organ to inspect
      </p>
    </div>
  );
}
