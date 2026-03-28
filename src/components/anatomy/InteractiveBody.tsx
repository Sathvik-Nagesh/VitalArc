'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';

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

export default function InteractiveBody({ organs, onSelect, selectedId }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse tilt effect for 3D feel
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useSpring(useTransform(y, [-100, 100], [10, -10]), { stiffness: 100, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-10, 10]), { stiffness: 100, damping: 30 });

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      x.set(event.clientX - centerX);
      y.set(event.clientY - centerY);
    }
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
    setHovered(null);
  }

  const handleClick = (id: string) => {
    const organ = organs.find(o => o.id === id);
    onSelect(selectedId === id ? null : (organ ?? null));
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex flex-col items-center w-full select-none perspective-1000"
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="w-full relative"
      >
        <svg
          viewBox="0 0 300 620"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full max-w-[280px] mx-auto drop-shadow-[0_0_50px_rgba(0,212,170,0.1)]"
        >
          <defs>
            <linearGradient id="bodySkin" x1="0" y1="0" x2="1" y2="1">
               <stop offset="0%" stopColor="#1a3b5c" stopOpacity="0.8" />
               <stop offset="100%" stopColor="#0a1a2b" stopOpacity="0.9" />
            </linearGradient>
            <filter id="organGlow">
              <feGaussianBlur stdDeviation="3" result="bloom"/>
              <feMerge>
                <feMergeNode in="bloom"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <pattern id="bodyMesh" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.5" fill="#00d4aa" fillOpacity="0.1" />
            </pattern>
          </defs>

          {/* Silhouette Base */}
          <g style={{ opacity: 0.8 }}>
             {/* Legs */}
             <path d="M115 420 Q105 500 110 600 Q125 605 130 600 Q125 500 130 420" fill="url(#bodySkin)" stroke="#00d4aa33" />
             <path d="M185 420 Q195 500 190 600 Q175 605 170 600 Q175 500 170 420" fill="url(#bodySkin)" stroke="#00d4aa33" />
             {/* Torso */}
             <path d="M100 200 C100 150 110 130 150 130 C190 130 200 150 200 200 L200 350 C200 400 180 420 150 420 C120 420 100 400 100 350 Z" fill="url(#bodySkin)" stroke="#00d4aa44" strokeWidth="2" />
             <path d="M100 200 C100 150 110 130 150 130 C190 130 200 150 200 200 L200 350 C200 400 180 420 150 420 C120 420 100 400 100 350 Z" fill="url(#bodyMesh)" />
             {/* Head */}
             <ellipse cx="150" cy="80" rx="35" ry="45" fill="url(#bodySkin)" stroke="#00d4aa33" />
          </g>

          {/* INTERNAL ORGANS - INTERACTIVE */}
          
          {/* Cardiovascular */}
          {(() => {
            const o = organs.find(x => x.id === 'cardiovascular');
            const isActive = hovered === 'cardiovascular' || selectedId === 'cardiovascular';
            const clr = o?.color ?? '#ef4444';
            return (
              <g onClick={() => handleClick('cardiovascular')} onMouseEnter={() => setHovered('cardiovascular')} style={{ cursor: 'pointer' }}>
                <motion.path
                  d="M140 200 C130 190 120 182 122 172 C124 163 132 161 136 166 C138 168 139 170 140 172 C141 170 142 168 144 166 C150 161 158 163 160 172 C162 182 150 190 140 200 Z"
                  fill={clr}
                  fillOpacity={isActive ? 0.8 : 0.3}
                  stroke={clr}
                  strokeWidth="2"
                  filter="url(#organGlow)"
                  animate={isActive ? { scale: [1, 1.1, 1], opacity: [0.3, 0.8, 0.3] } : { scale: 1 }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  style={{ transformOrigin: '140px 185px' }}
                />
              </g>
            );
          })()}

          {/* Brain */}
          {(() => {
            const o = organs.find(x => x.id === 'brain');
            const isActive = hovered === 'brain' || selectedId === 'brain';
            const clr = o?.color ?? '#8b5cf6';
            return (
              <g onClick={() => handleClick('brain')} onMouseEnter={() => setHovered('brain')} style={{ cursor: 'pointer' }}>
                <motion.ellipse
                  cx="150" cy="75" rx="25" ry="20"
                  fill={clr}
                  fillOpacity={isActive ? 0.8 : 0.3}
                  stroke={clr}
                  strokeWidth="2"
                  filter="url(#organGlow)"
                  animate={isActive ? { rx: [25, 28, 25], ry: [20, 22, 20] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </g>
            );
          })()}

          {/* Lungs */}
          {(() => {
            const o = organs.find(x => x.id === 'lungs');
            const isActive = hovered === 'lungs' || selectedId === 'lungs';
            const clr = o?.color ?? '#60a5fa';
            return (
              <g onClick={() => handleClick('lungs')} onMouseEnter={() => setHovered('lungs')} style={{ cursor: 'pointer' }}>
                <motion.ellipse cx="125" cy="205" rx="18" ry="28" fill={clr} fillOpacity={isActive ? 0.7 : 0.2} stroke={clr} animate={isActive ? { ry: [28, 32, 28] } : {}} transition={{ duration: 3, repeat: Infinity }} />
                <motion.ellipse cx="175" cy="205" rx="18" ry="28" fill={clr} fillOpacity={isActive ? 0.7 : 0.2} stroke={clr} animate={isActive ? { ry: [28, 32, 28] } : {}} transition={{ duration: 3, repeat: Infinity }} />
              </g>
            );
          })()}

          {/* Metabolic */}
          {(() => {
            const o = organs.find(x => x.id === 'metabolic');
            const isActive = hovered === 'metabolic' || selectedId === 'metabolic';
            const clr = o?.color ?? '#f59e0b';
            return (
              <g onClick={() => handleClick('metabolic')} onMouseEnter={() => setHovered('metabolic')} style={{ cursor: 'pointer' }}>
                <motion.path
                  d="M130 260 Q150 240 175 260 Q170 285 150 295 Q130 285 130 260"
                  fill={clr}
                  fillOpacity={isActive ? 0.8 : 0.3}
                  stroke={clr}
                  animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 4, repeat: Infinity }}
                  style={{ transformOrigin: '150px 260px' }}
                />
              </g>
            );
          })()}

          {/* Musculoskeletal */}
          {(() => {
            const o = organs.find(x => x.id === 'musculoskeletal');
            const isActive = hovered === 'musculoskeletal' || selectedId === 'musculoskeletal';
            const clr = o?.color ?? '#06b6d4';
            return (
              <g onClick={() => handleClick('musculoskeletal')} onMouseEnter={() => setHovered('musculoskeletal')} style={{ cursor: 'pointer' }}>
                <motion.path
                  d="M125 350 L175 350 M135 340 L165 340"
                  stroke={clr}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeOpacity={isActive ? 0.9 : 0.4}
                  animate={isActive ? { strokeWidth: [6, 8, 6], opacity: [0.4, 1, 0.4] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </g>
            );
          })()}

          {/* HOLOGRAPHIC SCAN LINE */}
          <motion.rect
            x="80" width="140" height="2"
            fill="url(#scanGrad)"
            className="drop-shadow-[0_0_10px_#00d4aa]"
            animate={{ y: [130, 420, 130] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          />
          <defs>
             <linearGradient id="scanGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#00d4aa" stopOpacity="0" />
                <stop offset="50%" stopColor="#00d4aa" stopOpacity="1" />
                <stop offset="100%" stopColor="#00d4aa" stopOpacity="0" />
             </linearGradient>
          </defs>
        </svg>

        {/* Hover Labels floating in 3D space */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, x: -20, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute pointer-events-none px-3 py-1 glass rounded-lg border border-primary-500/30 text-primary-400 font-bold text-xs uppercase tracking-widest"
              style={{
                top: hovered === 'brain' ? '10%' : hovered === 'cardiovascular' ? '30%' : hovered === 'metabolic' ? '45%' : '60%',
                right: '-20%'
              }}
            >
              {organs.find(o => o.id === hovered)?.label}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// Framer hook helper
import { useMotionValue } from 'framer-motion';
