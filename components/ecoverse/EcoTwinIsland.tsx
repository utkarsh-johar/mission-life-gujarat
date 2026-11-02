"use client";

import React, { useState } from "react";
import { ECO_TWIN_STAGES, EcoTwinStage } from "../../config/ecoverse";
import { Sparkles, Sun, Wind, Trees, Zap, Info, ShieldCheck } from "lucide-react";

interface EcoTwinIslandProps {
  points: number;
  streak: number;
  currentStageLevel?: number;
  onExploreLevel?: (lvl: number) => void;
}

export const EcoTwinIsland: React.FC<EcoTwinIslandProps> = ({
  points,
  streak,
  currentStageLevel,
}) => {
  // Compute default level based on points
  const autoLevel =
    ECO_TWIN_STAGES.slice()
      .reverse()
      .find((s) => points >= s.minPoints)?.level || 1;

  const [activeLevel, setActiveLevel] = useState<number>(currentStageLevel || autoLevel);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const stage = ECO_TWIN_STAGES.find((s) => s.level === activeLevel) || ECO_TWIN_STAGES[0];

  return (
    <div className="bg-gradient-to-b from-sky-100 via-sky-50 to-emerald-50 dark:from-slate-900 dark:via-slate-850 dark:to-emerald-950/40 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md relative overflow-hidden">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-solar-500" />
            EcoTwin · Your Living Virtual Gujarat Island
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            {stage.title}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl">
            {stage.description}
          </p>
        </div>

        {/* Level Controls & Stats */}
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-[11px] uppercase font-bold text-slate-400">Total EcoScore</div>
            <div className="text-xl font-black text-tealbrand-600 dark:text-teal-400 font-mono">
              {points} <span className="text-xs font-semibold text-slate-400">pts</span>
            </div>
          </div>
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
          <div className="text-right">
            <div className="text-[11px] uppercase font-bold text-slate-400">Active Streak</div>
            <div className="text-xl font-black text-amber-500 font-mono">
              {streak} <span className="text-xs font-semibold text-slate-400">days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stage Selector Pills (Enables demo exploration of all 5 tiers) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none">
        {ECO_TWIN_STAGES.map((s) => {
          const isCurrentEarned = autoLevel >= s.level;
          const isSelected = activeLevel === s.level;
          return (
            <button
              key={s.level}
              type="button"
              onClick={() => {
                setActiveLevel(s.level);
                setActiveTooltip(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                isSelected
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                  : isCurrentEarned
                  ? "bg-emerald-100/80 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
              }`}
            >
              <span>Lv.{s.level}</span>
              <span>{s.name}</span>
              {isCurrentEarned && !isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* SVG Living Island Canvas */}
      <div className="relative w-full aspect-[16/9] max-h-[420px] bg-sky-200/50 dark:bg-slate-950/60 rounded-2xl border border-sky-200/60 dark:border-slate-800 overflow-hidden flex items-center justify-center">
        <svg
          viewBox="0 0 800 450"
          className="w-full h-full select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Sky Gradient */}
            <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              {activeLevel === 1 ? (
                <>
                  <stop offset="0%" stopColor="#94a3b8" />
                  <stop offset="100%" stopColor="#cbd5e1" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="60%" stopColor="#bae6fd" />
                  <stop offset="100%" stopColor="#e0f2fe" />
                </>
              )}
            </linearGradient>

            {/* Ocean Gradient */}
            <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>

            {/* Island Grass Gradient */}
            <linearGradient id="islandGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              {activeLevel === 1 ? (
                <>
                  <stop offset="0%" stopColor="#d97706" />
                  <stop offset="100%" stopColor="#78350f" />
                </>
              ) : activeLevel === 2 ? (
                <>
                  <stop offset="0%" stopColor="#84cc16" />
                  <stop offset="100%" stopColor="#4d7c0f" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="100%" stopColor="#15803d" />
                </>
              )}
            </linearGradient>

            {/* Solar Panel Gradient */}
            <linearGradient id="solarGlass" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e3a8a" />
              <stop offset="50%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>

            {/* Rainbow Filter for Stage 5 */}
            <linearGradient id="rainbowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(239, 68, 68, 0.4)" />
              <stop offset="20%" stopColor="rgba(249, 115, 22, 0.4)" />
              <stop offset="40%" stopColor="rgba(234, 179, 8, 0.4)" />
              <stop offset="60%" stopColor="rgba(34, 197, 94, 0.4)" />
              <stop offset="80%" stopColor="rgba(59, 130, 246, 0.4)" />
              <stop offset="100%" stopColor="rgba(168, 85, 247, 0.4)" />
            </linearGradient>
          </defs>

          {/* Sky Backdrop */}
          <rect x="0" y="0" width="800" height="300" fill="url(#skyGrad)" />

          {/* Ocean Water */}
          <rect x="0" y="270" width="800" height="180" fill="url(#oceanGrad)" />

          {/* Ocean Ripples */}
          <path
            d="M 50 300 Q 150 295 250 300 T 450 300 T 650 300 T 780 300"
            fill="none"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="2"
          />
          <path
            d="M 80 330 Q 200 325 320 330 T 560 330 T 750 330"
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="1.5"
          />

          {/* Rainbow Arc (Stage 5) */}
          {activeLevel === 5 && (
            <path
              d="M 120 280 A 280 200 0 0 1 680 280"
              fill="none"
              stroke="url(#rainbowGrad)"
              strokeWidth="18"
              strokeLinecap="round"
            />
          )}

          {/* Golden Sun & Rays */}
          <g
            className="cursor-pointer transition-transform hover:scale-105"
            onClick={() => setActiveTooltip("Gujarat Solar Irradiance: 5.2 kWh/m²/day (Tier 1 GHI)")}
          >
            <circle cx="700" cy="80" r="42" fill="#f59e0b" filter="drop-shadow(0 0 12px #fbbf24)" />
            <circle cx="700" cy="80" r="34" fill="#fbbf24" />
            {activeLevel >= 3 && (
              <>
                <line x1="700" y1="20" x2="700" y2="10" stroke="#f59e0b" strokeWidth="3" />
                <line x1="700" y1="140" x2="700" y2="150" stroke="#f59e0b" strokeWidth="3" />
                <line x1="640" y1="80" x2="630" y2="80" stroke="#f59e0b" strokeWidth="3" />
                <line x1="760" y1="80" x2="770" y2="80" stroke="#f59e0b" strokeWidth="3" />
              </>
            )}
          </g>

          {/* Floating Clouds */}
          {activeLevel >= 2 && (
            <g opacity="0.85">
              <path
                d="M 100 80 Q 120 60 145 75 Q 170 55 195 75 Q 215 70 220 85 L 90 85 Z"
                fill="white"
              />
              <path
                d="M 380 60 Q 400 45 420 55 Q 440 40 460 55 Q 475 50 480 65 L 370 65 Z"
                fill="white"
              />
            </g>
          )}

          {/* Birds in flight (Stage 3+) */}
          {activeLevel >= 3 && (
            <g stroke="#334155" strokeWidth="2" fill="none" strokeLinecap="round">
              <path d="M 280 90 Q 290 80 300 90 Q 310 80 320 90" />
              <path d="M 330 110 Q 338 102 346 110 Q 354 102 362 110" />
              <path d="M 250 115 Q 256 108 262 115 Q 268 108 274 115" />
            </g>
          )}

          {/* Main Floating Island Base (3D polygon / rounded hill) */}
          {/* Island Underbelly / Cliff */}
          <path
            d="M 140 280 Q 220 370 400 370 Q 580 370 660 280 Q 400 295 140 280 Z"
            fill={activeLevel === 1 ? "#522607" : "#3e2723"}
          />

          {/* Island Surface Top Grass */}
          <path
            d="M 140 280 Q 220 220 400 220 Q 580 220 660 280 Q 560 305 400 305 Q 240 305 140 280 Z"
            fill="url(#islandGrad)"
            stroke={activeLevel >= 3 ? "#166534" : "#713f12"}
            strokeWidth="3"
          />

          {/* Freshwater Stream / Pond (Stage 3+) */}
          {activeLevel >= 3 && (
            <path
              d="M 380 250 Q 400 270 410 295 Q 395 300 380 290 Q 370 270 380 250 Z"
              fill="#38bdf8"
              stroke="#0284c7"
              strokeWidth="1.5"
              className="cursor-pointer"
              onClick={() => setActiveTooltip("Rainwater Conservation: 100% Groundwater Recharged")}
            />
          )}

          {/* Trees & Vegetation */}
          {activeLevel === 1 && (
            /* Barren dead bush */
            <g stroke="#78350f" strokeWidth="2" fill="none">
              <path d="M 240 275 L 240 255 L 230 245" />
              <path d="M 240 260 L 250 250" />
            </g>
          )}

          {activeLevel >= 2 && (
            /* Sprouting neem & banyan saplings */
            <g
              className="cursor-pointer"
              onClick={() => setActiveTooltip("Forest Canopy: 42 kg CO₂ sequestered per year")}
            >
              {/* Tree 1 Left */}
              <rect x="225" y="245" width="8" height="25" fill="#78350f" rx="2" />
              <circle cx="229" cy="235" r="22" fill="#22c55e" />
              <circle cx="218" cy="230" r="14" fill="#16a34a" />

              {/* Tree 2 Left Middle */}
              <rect x="275" y="250" width="7" height="20" fill="#78350f" rx="2" />
              <circle cx="278" cy="242" r="16" fill="#15803d" />

              {/* Tree 3 Right */}
              <rect x="560" y="245" width="8" height="25" fill="#78350f" rx="2" />
              <circle cx="564" cy="235" r="20" fill="#22c55e" />
              <circle cx="576" cy="230" r="15" fill="#16a34a" />
            </g>
          )}

          {/* Eco-House with Solar Roof (Stage 3+) */}
          {activeLevel >= 3 && (
            <g
              className="cursor-pointer transition-transform hover:scale-105"
              onClick={() =>
                setActiveTooltip("Rooftop Solar PV: 3.2 kW array generating ₹2,800/mo savings")
              }
            >
              {/* House Base */}
              <rect
                x="320"
                y="225"
                width="65"
                height="45"
                fill="#f8fafc"
                stroke="#64748b"
                strokeWidth="2"
                rx="4"
              />
              {/* Door */}
              <rect x="345" y="245" width="14" height="25" fill="#0f766e" rx="2" />
              {/* Window */}
              <rect x="328" y="235" width="12" height="12" fill="#bae6fd" stroke="#0284c7" />

              {/* Slanted Roof with Solar PV Array */}
              <polygon
                points="310,225 352,190 395,225"
                fill="url(#solarGlass)"
                stroke="#1e3a8a"
                strokeWidth="2"
              />
              {/* Solar Panel Grid Lines */}
              <line x1="330" y1="210" x2="375" y2="210" stroke="#93c5fd" strokeWidth="1" />
              <line x1="352" y1="192" x2="352" y2="225" stroke="#93c5fd" strokeWidth="1" />
              <line x1="335" y1="225" x2="345" y2="198" stroke="#93c5fd" strokeWidth="0.8" />
              <line x1="370" y1="225" x2="360" y2="198" stroke="#93c5fd" strokeWidth="0.8" />
            </g>
          )}

          {/* Wind Turbine (Stage 4+) */}
          {activeLevel >= 4 && (
            <g
              className="cursor-pointer"
              onClick={() => setActiveTooltip("Wind Turbine: Clean breeze generating 24/7 kinetic power")}
            >
              {/* Turbine Tower */}
              <polygon points="488,275 492,160 496,160 500,275" fill="#e2e8f0" stroke="#94a3b8" />
              <circle cx="494" cy="160" r="5" fill="#475569" />

              {/* Rotating Blades (Animated CSS) */}
              <g className="origin-[494px_160px] animate-spin" style={{ animationDuration: "6s" }}>
                <path d="M 494 160 L 492 105 Q 494 95 496 105 Z" fill="#ffffff" stroke="#cbd5e1" />
                <path d="M 494 160 L 542 188 Q 548 196 539 198 Z" fill="#ffffff" stroke="#cbd5e1" />
                <path d="M 494 160 L 446 188 Q 440 196 449 198 Z" fill="#ffffff" stroke="#cbd5e1" />
              </g>
            </g>
          )}

          {/* Electric BRTS Transit Bus / Bicycle Path (Stage 4+) */}
          {activeLevel >= 4 && (
            <g
              className="cursor-pointer"
              onClick={() => setActiveTooltip("Zero-Emission Transit: Electric BRTS Bus")}
            >
              <rect x="420" y="278" width="46" height="18" fill="#14b8a6" rx="4" />
              <rect x="424" y="281" width="10" height="7" fill="#f0fdfa" rx="1" />
              <rect x="437" y="281" width="10" height="7" fill="#f0fdfa" rx="1" />
              <rect x="450" y="281" width="10" height="7" fill="#f0fdfa" rx="1" />
              {/* Wheels */}
              <circle cx="429" cy="296" r="4" fill="#1e293b" />
              <circle cx="457" cy="296" r="4" fill="#1e293b" />
            </g>
          )}

          {/* Stage 5 Mega Microgrid & Flora */}
          {activeLevel === 5 && (
            <g>
              {/* Second solar array on right */}
              <polygon
                points="505,255 535,235 565,255"
                fill="url(#solarGlass)"
                stroke="#1e3a8a"
                strokeWidth="1.5"
              />
              {/* Butterflies */}
              <circle cx="280" cy="210" r="3" fill="#f43f5e" />
              <circle cx="284" cy="212" r="2" fill="#fb923c" />
              <circle cx="360" cy="180" r="3" fill="#a855f7" />
            </g>
          )}
        </svg>

        {/* Dynamic Interactive Hotspot Card / Tooltip */}
        {activeTooltip && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-xs bg-slate-900/90 text-white backdrop-blur-md p-3 rounded-2xl border border-slate-700 shadow-xl flex items-start justify-between gap-2 text-xs">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-solar-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-solar-300 block">EcoLandmark Detail</span>
                <p className="mt-0.5 text-slate-200">{activeTooltip}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTooltip(null)}
              className="text-slate-400 hover:text-white font-bold p-1"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Unlocked Capabilities Strip */}
      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-bold uppercase text-[10px]">Active Unlocks:</span>
          {stage.featuresUnlocked.map((feat) => (
            <span
              key={feat}
              className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700 shadow-xs"
            >
              ✓ {feat}
            </span>
          ))}
        </div>

        <div className="text-[11px] text-slate-400 italic">
          💡 Click landmarks on the island (Sun, Solar Roof, Windmill, River) to inspect live impacts.
        </div>
      </div>
    </div>
  );
};
