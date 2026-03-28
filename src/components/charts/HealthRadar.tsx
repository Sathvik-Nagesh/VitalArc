'use client';

import { motion } from 'framer-motion';

interface RadarData {
  label: string;
  value: number; // 0 to 100 (100 is perfect age match or better, 0 is high delta)
}

export default function HealthRadar({ data }: { data: RadarData[] }) {
  const size = 200;
  const center = size / 2;
  const radius = size * 0.4;

  const points = data.map((d, i) => {
    const angle = (i * 2 * Math.PI) / data.length - Math.PI / 2;
    const r = radius * (d.value / 100);
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
      labelX: center + (radius + 25) * Math.cos(angle),
      labelY: center + (radius + 15) * Math.sin(angle),
      label: d.label
    };
  });

  const polygonPath = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="relative flex items-center justify-center py-4">
      <svg width={size + 60} height={size + 40} viewBox={`0 0 ${size + 60} ${size + 40}`} className="overflow-visible">
        {/* Background Rings */}
        {[0.2, 0.4, 0.6, 0.8, 1].map((r, i) => (
          <circle
            key={i}
            cx={center + 30}
            cy={center + 20}
            r={radius * r}
            fill="none"
            stroke="currentColor"
            className="dark:text-white/5 text-black/5"
            strokeWidth="1"
          />
        ))}

        {/* Axis Lines */}
        {points.map((p, i) => (
          <line
            key={i}
            x1={center + 30}
            y1={center + 20}
            x2={center + 30 + (p.labelX - center) * 0.85}
            y2={center + 20 + (p.labelY - center) * 0.85}
            stroke="currentColor"
            className="dark:text-white/10 text-black/10"
            strokeWidth="1"
          />
        ))}

        {/* Data Shape */}
        <motion.polygon
          key={JSON.stringify(data)}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          points={points.map(p => `${p.x + 30},${p.y + 20}`).join(' ')}
          fill="rgba(0, 212, 170, 0.2)"
          stroke="#00d4aa"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Labels */}
        {points.map((p, i) => (
          <text
            key={i}
            x={p.labelX + 30}
            y={p.labelY + 20}
            textAnchor="middle"
            className="text-[9px] font-black uppercase tracking-tighter dark:fill-gray-400 fill-gray-500"
          >
            {p.label}
          </text>
        ))}
      </svg>
    </div>
  );
}
