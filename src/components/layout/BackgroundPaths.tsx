'use client';

import { motion } from 'framer-motion';

export default function BackgroundPaths() {
  const paths = Array.from({ length: 15 });

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20 dark:opacity-30">
      <svg
        className="absolute w-[200vw] h-[200vh] -top-[50vh] -left-[50vw]"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
        style={{ perspective: '800px', transformStyle: 'preserve-3d' }}
      >
        <defs>
          <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00d4aa" stopOpacity="0" />
            <stop offset="50%" stopColor="#0047AB" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
        </defs>

        <motion.g
          animate={{
            rotateZ: [0, 5, -5, 0],
            rotateX: [60, 65, 55, 60],
            scale: [1, 1.05, 0.95, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ transformOrigin: 'center' }}
        >
          {paths.map((_, i) => (
            <motion.path
              key={i}
              d={`M-200,${200 + i * 40} Q500,${400 - i * 60 + Math.sin(i)*100} 1200,${200 + i * 40}`}
              fill="none"
              stroke="url(#line-gradient)"
              strokeWidth={i % 3 === 0 ? 3 : 1}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: [0, 1, 1, 0],
                opacity: [0, 1, 1, 0],
                pathOffset: [0, 0, 1, 1]
              }}
              transition={{
                duration: 8 + i,
                repeat: Infinity,
                ease: "linear",
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.g>
      </svg>
    </div>
  );
}