"use client";

import React, { useState } from "react";
import { Info, X, ExternalLink } from "lucide-react";

export interface CalculationDetails {
  title: string;
  formula: string;
  constants: { name: string; value: string | number; unit?: string }[];
  source: string;
  asOf: string;
  officialLink?: string;
  note?: string;
}

export const CalculationExplainer: React.FC<{ details: CalculationDetails }> = ({ details }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <span className="inline-flex items-center ml-1 align-baseline relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="text-tealbrand-700 hover:text-tealbrand-800 dark:text-teal-400 p-0.5 rounded focus:outline-none focus:ring-1 focus:ring-tealbrand-500 transition-colors"
        title="How is this calculated?"
        aria-label={`Calculation details for ${details.title}`}
      >
        <Info className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl max-w-md w-full p-5 text-left text-sm text-slate-800 dark:text-slate-100 relative"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-tealbrand-50 dark:bg-tealbrand-800/20 text-tealbrand-700 dark:text-teal-400">
                  <Info className="w-4 h-4" />
                </span>
                <h4 className="font-semibold text-slate-900 dark:text-white">{details.title}</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3 space-y-3">
              <div>
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Formula</span>
                <div className="mt-1 font-mono text-xs p-2 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-tealbrand-700 dark:text-teal-300 overflow-x-auto">
                  {details.formula}
                </div>
              </div>

              {details.constants.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Parameters & Constants</span>
                  <div className="mt-1 space-y-1 bg-slate-50 dark:bg-slate-800/50 p-2 rounded border border-slate-200 dark:border-slate-700">
                    {details.constants.map((c, i) => (
                      <div key={i} className="flex justify-between text-xs py-0.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                        <span className="text-slate-600 dark:text-slate-400">{c.name}:</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-200">
                          {c.value} {c.unit || ""}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                <div className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                  <span>Authoritative Source:</span>
                  {details.officialLink && (
                    <a
                      href={details.officialLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-tealbrand-600 hover:underline inline-flex items-center gap-0.5"
                    >
                      Verify <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <div className="mt-0.5 italic">{details.source}</div>
                <div className="mt-0.5 text-[11px] text-slate-400">Effective as of: {details.asOf}</div>
                {details.note && <div className="mt-1.5 p-2 rounded bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 text-[11px] border border-amber-200 dark:border-amber-800">{details.note}</div>}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-xs font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </span>
  );
};
