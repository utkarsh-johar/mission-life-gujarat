"use client";

import React, { useState, useEffect } from "react";
import {
  Navigation,
  CloudSun,
  Flame,
  Award,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { LiveGpsTracker } from "../../components/tracker/LiveGpsTracker";
import { ProofOfHabitModal } from "../../components/gamification/ProofOfHabitModal";
import { EvaluatedNudge } from "../../lib/engine/nudges";
import { CalculationExplainer } from "../../components/ui/CalculationExplainer";
import Link from "next/link";

export default function MobilityPage() {
  const [nudges, setNudges] = useState<EvaluatedNudge[]>([]);
  const [weatherInfo, setWeatherInfo] = useState<any>(null);
  const [isOfflineWeather, setIsOfflineWeather] = useState(false);
  const [weatherSource, setWeatherSource] = useState("");

  // Habit Proof Modal State
  const [activeNudgeForProof, setActiveNudgeForProof] = useState<EvaluatedNudge | null>(null);
  const [proofSuccessNotice, setProofSuccessNotice] = useState<string | null>(null);

  // Completed trip notification
  const [recentTripData, setRecentTripData] = useState<any | null>(null);

  // Load weather and evaluated nudges
  const fetchNudges = async () => {
    try {
      const res = await fetch("/api/weather/nudges?lat=23.0353&lng=72.5283&slabAlert=true");
      if (res.ok) {
        const data = await res.json();
        setNudges(data.nudges || []);
        setWeatherInfo(data.weather);
        setIsOfflineWeather(data.isOfflineFallback);
        setWeatherSource(data.source);
      }
    } catch (err) {
      console.warn("Failed to load weather nudges:", err);
    }
  };

  useEffect(() => {
    fetchNudges();
  }, []);

  const handleTripCompleted = (tripResult: any) => {
    setRecentTripData(tripResult);
  };

  const handleProofSuccess = (credits: number) => {
    setProofSuccessNotice(`Verification approved! +${credits} LiFE Credits added to your state climate wallet.`);
    setTimeout(() => setProofSuccessNotice(null), 6000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tealbrand-50 text-tealbrand-700 dark:bg-tealbrand-950/40 dark:text-teal-400 text-xs font-semibold border border-tealbrand-200 dark:border-tealbrand-800">
            <Navigation className="w-3.5 h-3.5" />
            Module C · Green Mobility & Weather Nudges
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            Live GPS Green Mobility Tracker
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Track walks, cycling, and public transit with zero manual input, speedometer gauges, and dynamic weather nudges.
          </p>
        </div>

        {weatherInfo && (
          <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
            <CloudSun className="w-6 h-6 text-amber-500" />
            <div className="text-right">
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                {weatherInfo.temperature}°C · {weatherInfo.humidity}% Humid
              </div>
              <div className="text-[10px] text-slate-400">
                {weatherInfo.solarRadiationWp} W/m² · {weatherInfo.hourIst}:00 IST
              </div>
            </div>
          </div>
        )}
      </div>

      {proofSuccessNotice && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 text-xs font-semibold border border-emerald-300 dark:border-emerald-800 flex items-center justify-between animate-in fade-in">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {proofSuccessNotice}
          </span>
          <Link href="/rewards" className="underline font-bold">
            View Ledger
          </Link>
        </div>
      )}

      {recentTripData && (
        <div className="mb-6 p-5 rounded-2xl bg-tealbrand-50 dark:bg-tealbrand-950/40 border border-tealbrand-300 dark:border-tealbrand-800 text-xs">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-tealbrand-900 dark:text-teal-200 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-tealbrand-600" />
              Green Trip Successfully Verified & Recorded!
            </h4>
            <span className="font-mono text-[11px] text-tealbrand-700 bg-white/80 dark:bg-slate-800 px-2 py-0.5 rounded">
              Status: {recentTripData.trip?.status}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 py-2 border-t border-tealbrand-200 dark:border-tealbrand-800/60">
            <div>
              <span className="text-slate-500">Distance:</span>{" "}
              <strong>{recentTripData.trip?.distanceKm} km</strong>
            </div>
            <div>
              <span className="text-slate-500">CO₂ Avoided:</span>{" "}
              <strong className="text-emerald-600">{recentTripData.kgCo2Saved} kg</strong>
            </div>
            <div>
              <span className="text-slate-500">Credits Earned:</span>{" "}
              <strong className="text-amber-600">+{recentTripData.creditsAwarded}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Main GPS Tracker Component */}
      <div className="mb-8">
        <LiveGpsTracker onTripCompleted={handleTripCompleted} />
      </div>

      {/* Live Weather-Driven Nudges Section (Section 7.5) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <CloudSun className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Live Weather-Triggered LiFE Challenges
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Targeted behavioral nudges fired automatically based on local IMD/Open-Meteo microclimate readings
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500">
              Source: {weatherSource || "Open-Meteo Grid API"}
            </span>
            <CalculationExplainer
              details={{
                title: "Live Weather Nudge Rule Engine",
                formula: "Rules evaluated deterministically in priority order using local IST timestamp and ambient weather",
                constants: [
                  { name: "AC-Off Trigger", value: "< 26.0°C between 20:00–05:00 IST" },
                  { name: "Solar Peak Shift", value: "> 750.0 W/m² between 12:00–15:00 IST" },
                  { name: "Active Cycling", value: "18°C–28°C with 0mm precipitation" },
                  { name: "High UV Warning", value: "UV Index ≥ 8.0" },
                ],
                source: "GEDA Demand Side Management & BEE India Guidelines",
                asOf: "2024-01-01",
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {nudges.map((nudge) => (
            <div
              key={nudge.id}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-tealbrand-100 text-tealbrand-800 dark:bg-tealbrand-950/60 dark:text-teal-300">
                    +{nudge.creditsReward} Credits
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {nudge.source}
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  {nudge.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  {nudge.body}
                </p>

                {/* "Why you're seeing this" Section (AC-C3 / 7.5) */}
                <div className="mt-3 p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Why you're seeing this:
                  </span>{" "}
                  {nudge.whyText}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveNudgeForProof(nudge)}
                  className="px-4 py-2 bg-tealbrand-600 hover:bg-tealbrand-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {nudge.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Proof of Habit Verification Modal */}
      {activeNudgeForProof && (
        <ProofOfHabitModal
          ruleId={activeNudgeForProof.id}
          ruleTitle={activeNudgeForProof.title}
          creditsReward={activeNudgeForProof.creditsReward}
          isOpen={Boolean(activeNudgeForProof)}
          onClose={() => setActiveNudgeForProof(null)}
          onSuccess={handleProofSuccess}
        />
      )}
    </div>
  );
}
