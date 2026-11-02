"use client";

import React from "react";
import { motion } from "framer-motion";
import { CalculationExplainer } from "../ui/CalculationExplainer";
import { BENCHMARKS } from "../../config/emission";

interface FootprintGaugeProps {
  userMonthlyKg: number;
  perPersonMonthlyKg: number;
  householdSize: number;
  stateAvgMonthlyKg?: number;
  targetMonthlyKg?: number;
}

export const FootprintGauge: React.FC<FootprintGaugeProps> = ({
  userMonthlyKg,
  perPersonMonthlyKg,
  householdSize,
  stateAvgMonthlyKg = BENCHMARKS.gujaratPerCapitaMonthlyKg.value,
  targetMonthlyKg = BENCHMARKS.missionLifeTargetMonthlyKg.value,
}) => {
  // Max scale cap for visualization (e.g. 300 kg/capita/month)
  const maxScale = Math.max(260, stateAvgMonthlyKg * 1.6, perPersonMonthlyKg * 1.2);

  const userPct = Math.min(100, Math.max(0, (perPersonMonthlyKg / maxScale) * 100));
  const targetPct = Math.min(100, (targetMonthlyKg / maxScale) * 100);
  const statePct = Math.min(100, (stateAvgMonthlyKg / maxScale) * 100);

  const isBelowTarget = perPersonMonthlyKg <= targetMonthlyKg;
  const isBelowAverage = perPersonMonthlyKg <= stateAvgMonthlyKg;

  const barColor = isBelowTarget ? "bg-emerald-500" : isBelowAverage ? "bg-amber-500" : "bg-rose-500";
  const badgeText = isBelowTarget
    ? "Exceeding Mission LiFE Target!"
    : isBelowAverage
    ? "Below Gujarat State Average"
    : "Above State Average";

  const ariaSummary = `Your per-person footprint is ${perPersonMonthlyKg} kg CO2 per month, compared to Gujarat average of ${stateAvgMonthlyKg} kg and Mission LiFE target of ${targetMonthlyKg} kg. Status: ${badgeText}.`;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm" role="region" aria-label="Carbon Footprint Comparison Gauge">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">Per-Capita Carbon Comparison</h3>
            <CalculationExplainer
              details={{
                title: "Per-Capita Monthly Carbon Footprint",
                formula: "Per Person = Total Household Monthly CO2 (kg) / Household Size",
                constants: [
                  { name: "Grid Electricity", value: 0.82, unit: "kg CO2/kWh" },
                  { name: "LPG Gas Cylinder", value: 42.5, unit: "kg CO2/cylinder" },
                  { name: "Gujarat Benchmark", value: stateAvgMonthlyKg, unit: "kg/capita/month" },
                  { name: "Mission LiFE Target", value: targetMonthlyKg, unit: "kg/capita/month" },
                ],
                source: "Central Electricity Authority (CEA) v19 & Mission LiFE Guidelines",
                asOf: "2024-03-31",
              }}
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Measured against Gujarat per-capita baseline & Mission LiFE reduction targets
          </p>
        </div>

        <span
          className={`px-3 py-1 text-xs font-semibold rounded-full ${
            isBelowTarget
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
              : isBelowAverage
              ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
              : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
          }`}
        >
          {badgeText}
        </span>
      </div>

      {/* Main Metric Cards */}
      <div className="grid grid-cols-3 gap-3 my-4">
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">You (Per Person)</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {perPersonMonthlyKg} <span className="text-xs font-normal text-slate-500">kg/mo</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Household: {userMonthlyKg} kg</div>
        </div>

        <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/40 text-center">
          <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Mission LiFE Target</div>
          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">
            {targetMonthlyKg} <span className="text-xs font-normal text-emerald-600/70">kg/mo</span>
          </div>
          <div className="text-[11px] text-emerald-600/80 mt-0.5">-20% State Average</div>
        </div>

        <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-100 dark:border-amber-900/40 text-center">
          <div className="text-xs text-amber-700 dark:text-amber-400 font-medium">Gujarat Average</div>
          <div className="text-2xl font-bold text-amber-700 dark:text-amber-400 mt-1">
            {stateAvgMonthlyKg} <span className="text-xs font-normal text-amber-600/70">kg/mo</span>
          </div>
          <div className="text-[11px] text-amber-600/80 mt-0.5">State Benchmark</div>
        </div>
      </div>

      {/* Interactive Horizontal Track Gauge */}
      <div className="relative pt-6 pb-2" aria-hidden="true">
        {/* Track */}
        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
          {/* Target Zone shaded */}
          <div
            className="absolute top-0 bottom-0 left-0 bg-emerald-100/60 dark:bg-emerald-950/40 border-r border-emerald-400"
            style={{ width: `${targetPct}%` }}
          />

          {/* User Progress fill */}
          <motion.div
            className={`h-full ${barColor} rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${userPct}%` }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
        </div>

        {/* Marker 1: Mission LiFE Target */}
        <div
          className="absolute top-0 flex flex-col items-center -translate-x-1/2"
          style={{ left: `${targetPct}%` }}
        >
          <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900 px-1 rounded shadow-xs border border-emerald-200 dark:border-emerald-800">
            Target
          </span>
          <div className="w-0.5 h-6 bg-emerald-500 mt-0.5" />
        </div>

        {/* Marker 2: Gujarat State Average */}
        <div
          className="absolute top-0 flex flex-col items-center -translate-x-1/2"
          style={{ left: `${statePct}%` }}
        >
          <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-white dark:bg-slate-900 px-1 rounded shadow-xs border border-amber-200 dark:border-amber-800">
            Avg
          </span>
          <div className="w-0.5 h-6 bg-amber-500 mt-0.5" />
        </div>
      </div>

      {/* Screen-reader Accessible Table Fallback */}
      <div className="sr-only">
        <p>{ariaSummary}</p>
        <table>
          <caption>Monthly Per-Capita CO2 Emissions Comparison</caption>
          <thead>
            <tr>
              <th>Entity</th>
              <th>Emission (kg CO2e/month)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Your Footprint</td>
              <td>{perPersonMonthlyKg}</td>
            </tr>
            <tr>
              <td>Mission LiFE Target</td>
              <td>{targetMonthlyKg}</td>
            </tr>
            <tr>
              <td>Gujarat State Average</td>
              <td>{stateAvgMonthlyKg}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
