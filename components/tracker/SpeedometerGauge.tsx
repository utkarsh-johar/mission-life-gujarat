"use client";

import React from "react";
import { motion } from "framer-motion";

interface SpeedometerGaugeProps {
  speedKmh: number;
  maxSpeedDisplay?: number;
}

export const SpeedometerGauge: React.FC<SpeedometerGaugeProps> = ({
  speedKmh,
  maxSpeedDisplay = 60,
}) => {
  // Clamp speed for gauge
  const clampedSpeed = Math.min(maxSpeedDisplay, Math.max(0, speedKmh));
  // Needle angle: -90 degrees (at 0) to +90 degrees (at maxSpeed)
  const angle = -90 + (clampedSpeed / maxSpeedDisplay) * 180;

  return (
    <div className="relative w-44 h-28 flex flex-col items-center justify-end overflow-hidden">
      {/* Semicircular SVG dial */}
      <svg className="w-44 h-28" viewBox="0 0 160 90">
        {/* Background track */}
        <path
          d="M 15 85 A 65 65 0 0 1 145 85"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="12"
          strokeLinecap="round"
          className="dark:stroke-slate-800"
        />

        {/* Speed Zones: Green (0-18 km/h Active), Blue (18-40 Transit), Amber (40+) */}
        <path
          d="M 15 85 A 65 65 0 0 1 54 39"
          fill="none"
          stroke="#10b981"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d="M 54 39 A 65 65 0 0 1 106 39"
          fill="none"
          stroke="#06b6d4"
          strokeWidth="12"
        />
        <path
          d="M 106 39 A 65 65 0 0 1 145 85"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="12"
          strokeLinecap="round"
        />

        {/* Needle pivot circle */}
        <circle cx="80" cy="85" r="5" fill="#0f172a" className="dark:fill-white" />

        {/* Animated Needle */}
        <g transform={`rotate(${angle} 80 85)`}>
          <line
            x1="80"
            y1="85"
            x2="80"
            y2="28"
            stroke="#ef4444"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </g>
      </svg>

      {/* Numerical Speed Readout */}
      <div className="absolute bottom-0 text-center">
        <div className="text-2xl font-black text-slate-900 dark:text-white leading-none">
          {Math.round(speedKmh * 10) / 10}
        </div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          km/h
        </div>
      </div>
    </div>
  );
};
