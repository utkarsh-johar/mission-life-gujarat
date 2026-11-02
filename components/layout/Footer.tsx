import React from "react";
import Link from "next/link";
import { Sun, ExternalLink, ShieldCheck } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 mt-20 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-2 font-bold text-slate-900 dark:text-white text-base">
              <Sun className="w-5 h-5 text-solar-500" />
              <span>Mission LiFE Gujarat · GEDA</span>
            </div>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              Gujarat Energy Development Agency (GEDA) citizen climate action platform. Empowering Gujarat households with pure data, verified green mobility tracking, and solar rooftop conversion.
            </p>
            <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-400">
              <span>Govt. of Gujarat Initiative</span>
              <span>•</span>
              <a
                href="https://geda.gujarat.gov.in"
                target="_blank"
                rel="noreferrer"
                className="hover:text-tealbrand-600 inline-flex items-center gap-0.5"
              >
                geda.gujarat.gov.in <ExternalLink className="w-3 h-3" />
              </a>
              <span>•</span>
              <a
                href="https://pmsuryaghar.gov.in"
                target="_blank"
                rel="noreferrer"
                className="hover:text-solar-600 inline-flex items-center gap-0.5"
              >
                pmsuryaghar.gov.in <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div>
            <h5 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-3">
              Core Modules
            </h5>
            <ul className="space-y-2">
              <li>
                <Link href="/audit" className="hover:text-tealbrand-600">
                  30-Second Carbon Audit
                </Link>
              </li>
              <li>
                <Link href="/solar" className="hover:text-tealbrand-600">
                  Roof-to-Rupee Solar Studio
                </Link>
              </li>
              <li>
                <Link href="/mobility" className="hover:text-tealbrand-600">
                  Live GPS Mobility Tracker
                </Link>
              </li>
              <li>
                <Link href="/rewards" className="hover:text-tealbrand-600">
                  Climate Wallet & Badges
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-3">
              Transparency & Governance
            </h5>
            <ul className="space-y-2">
              <li>
                <Link href="/war-room" className="hover:text-tealbrand-600 font-semibold text-tealbrand-700 dark:text-teal-400">
                  GEDA State War-Room
                </Link>
              </li>
              <li className="text-slate-400">CEA Grid Factor: 0.82 kg/kWh</li>
              <li className="text-slate-400">GERC Residential RGP Slabs</li>
              <li className="text-slate-400">Open-Meteo & IMD Telemetry</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-[11px] text-slate-400">
          <div>
            © 2026 Gujarat Energy Development Agency (GEDA). Designed for Mission LiFE Hackathon.
          </div>
          <div className="flex items-center gap-4">
            <span>Deterministic Engine (Pure TypeScript)</span>
            <span>Zero Synthetic Fakes</span>
            <span>WCAG 2.1 AA Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
