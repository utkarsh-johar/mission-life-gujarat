"use client";

import React from "react";
import { AlertTriangle, TrendingDown, ArrowRight, CheckCircle2, ShieldAlert } from "lucide-react";
import { SlabAlert } from "../../lib/engine/tariff";
import { CalculationExplainer } from "./CalculationExplainer";
import Link from "next/link";

interface SlabAlertCardProps {
  alert: SlabAlert;
  discomName?: string;
}

export const SlabAlertCard: React.FC<SlabAlertCardProps> = ({ alert, discomName = "UGVCL" }) => {
  if (alert.type === "NO_ALERT") {
    return (
      <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl p-5 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-emerald-900 dark:text-emerald-200 text-sm">
            Optimal Tariff Slab
          </h4>
          <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
            Your monthly consumption projection ({alert.projectedKwh} kWh) is within your baseline slab. Keep up the energy conservation habits!
          </p>
        </div>
      </div>
    );
  }

  const isWarning = alert.type === "ACTIVE_WARNING";
  const isHeadsUp = alert.type === "HEADS_UP";

  return (
    <div
      className={`rounded-2xl p-5 border transition-all ${
        isWarning
          ? "bg-amber-50/80 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 shadow-sm"
          : isHeadsUp
          ? "bg-blue-50/80 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800"
          : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
      }`}
      role="alert"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-xl shrink-0 ${
              isWarning
                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300"
                : isHeadsUp
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
                : "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300"
            }`}
          >
            {isWarning ? <AlertTriangle className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
          </div>

          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                {isWarning ? "GERC Slab Jump Alert" : isHeadsUp ? "Tariff Slab Heads-Up" : "Next Month Target"}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">({discomName} Residential RGP)</span>
              <CalculationExplainer
                details={{
                  title: "GERC Tariff Slab-Jump Savings Alert",
                  formula: "Daily Cut = (Projected kWh − Boundary B) / Remaining Days; Savings = Bill(Projected) − Bill(B)",
                  constants: [
                    { name: "Slab Boundary (B)", value: alert.boundaryUnit, unit: "kWh" },
                    { name: "Remaining Billing Days", value: alert.remainingDays, unit: "days" },
                    { name: "Projected Consumption", value: alert.projectedKwh, unit: "kWh" },
                    { name: "Potential Monthly Savings", value: alert.potentialSavingsInr, unit: "₹" },
                  ],
                  source: `GERC Tariff Order for ${discomName} FY 2024-25`,
                  asOf: "2024-04-01",
                  note: "In Gujarat, energy charge steps up significantly once units exceed slab boundaries (e.g. from ₹4.15/kWh to ₹5.20/kWh for >200 units).",
                }}
              />
            </div>

            <p className="font-semibold text-slate-900 dark:text-white text-sm mt-1 leading-snug">
              {alert.message}
            </p>
          </div>
        </div>

        {alert.potentialSavingsInr > 0 && (
          <div className="text-right shrink-0 bg-white/80 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-amber-900/50">
            <div className="text-[10px] text-slate-500 font-medium">Potential Savings</div>
            <div className="text-base font-extrabold text-amber-700 dark:text-amber-400">
              ₹{alert.potentialSavingsInr}
            </div>
          </div>
        )}
      </div>

      {/* Action recommendation */}
      <div className="mt-4 pt-3 border-t border-amber-200/60 dark:border-amber-900/40 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
          <TrendingDown className="w-4 h-4 text-tealbrand-600" />
          <span>
            <strong>Recommended Action:</strong> Raise AC thermostat to 26°C with ceiling fan on low.
          </span>
        </div>

        <Link
          href="/solar"
          className="text-xs font-semibold text-tealbrand-700 dark:text-teal-400 hover:text-tealbrand-800 inline-flex items-center gap-1 transition-colors"
        >
          Explore Rooftop Solar Protection <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
