"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sun,
  Zap,
  Navigation,
  Wallet,
  Building2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  TrendingDown,
  FileText,
  Flame,
  Award,
} from "lucide-react";
import { useI18n } from "../lib/i18n";

export default function HomePage() {
  const { t } = useI18n();
  const [metrics, setMetrics] = useState<any | null>(null);

  useEffect(() => {
    fetch("/api/admin/metrics")
      .then((res) => res.json())
      .then((data) => setMetrics(data))
      .catch((e) => console.warn("Metrics fetch error:", e));
  }, []);

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full max-w-6xl mx-auto px-4 pt-12 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tealbrand-50 dark:bg-tealbrand-950/50 text-tealbrand-700 dark:text-teal-300 text-xs font-bold border border-tealbrand-200 dark:border-tealbrand-800 shadow-xs mb-6">
          <Sparkles className="w-4 h-4 text-solar-500" />
          <span>{t("landing.badge")}</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight max-w-4xl mx-auto leading-tight">
          {t("landing.title")}
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          {t("landing.description")}
        </p>

        {/* Hero CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/audit"
            className="px-6 py-3.5 bg-tealbrand-600 hover:bg-tealbrand-700 text-white rounded-2xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <span>{t("landing.ctaStart")}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/audit?sample=ugvcl"
            className="px-6 py-3.5 bg-solar-500 hover:bg-solar-600 text-white rounded-2xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>{t("landing.ctaSample")}</span>
          </Link>

          <Link
            href="/solar"
            className="px-5 py-3.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-2xl text-sm font-semibold transition-colors flex items-center gap-2"
          >
            <Sun className="w-4 h-4 text-solar-500" />
            <span>{t("nav.solar")}</span>
          </Link>

          <Link
            href="/ecoverse"
            className="px-5 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-solar-300" />
            <span>{t("nav.ecoverse")}</span>
          </Link>
        </div>

        {/* Live Gujarat Impact Metrics Strip */}
        <div className="mt-14 p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {metrics ? `${metrics.kpis?.totalTonnesCo2 || 140}` : "142.5"}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">
              {t("landing.stat1Label")}
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-black text-solar-600 dark:text-amber-400 font-mono">
              {metrics ? `${metrics.kpis?.totalPotentialKw || 1850}` : "1,850"} <span className="text-sm">kW</span>
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">
              {t("landing.stat3Label")}
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-black text-tealbrand-700 dark:text-teal-300 font-mono">
              42
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">
              {t("landing.stat2Label")}
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
              ₹78,000
            </div>
            <div className="text-xs text-slate-500 mt-1 font-medium">
              Max PM Surya Ghar Subsidy
            </div>
          </div>
        </div>
      </section>

      {/* Flagship Modules Section */}
      <section className="w-full max-w-6xl mx-auto px-4 py-12">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Built for Gujarat's Climate Vanguard
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Engineered with strict TypeScript, pure engineering formulas, and zero appliance sliders.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: 30-Second Carbon Audit */}
          <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-tealbrand-300 dark:hover:border-tealbrand-800 transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-tealbrand-50 dark:bg-tealbrand-950/60 text-tealbrand-600 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-tealbrand-600">
                Module A · Baseline & Tariff
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {t("landing.feature1Title")}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                {t("landing.feature1Desc")}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-500">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">0.82 kg CO₂/kWh (CEA)</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">Client-Side OCR</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">5 DISCOMs Supported</span>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Link
                href="/audit"
                className="text-xs font-bold text-tealbrand-600 dark:text-teal-400 inline-flex items-center gap-1 hover:underline"
              >
                Launch Carbon Audit <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2: Roof-to-Rupee Solar Studio */}
          <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-solar-300 dark:hover:border-amber-800 transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-solar-50 dark:bg-amber-950/60 text-solar-600 flex items-center justify-center mb-4">
                <Sun className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-solar-600">
                Module B · Flagship Studio
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {t("landing.feature2Title")}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                {t("landing.feature2Desc")}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-500">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">Esri Imagery</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">Break-Even Chart</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">Empanelled Vendors</span>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Link
                href="/solar"
                className="text-xs font-bold text-solar-600 dark:text-amber-400 inline-flex items-center gap-1 hover:underline"
              >
                Open Solar Map Studio <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 3: Live GPS Mobility Tracker */}
          <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-tealbrand-300 dark:hover:border-tealbrand-800 transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-tealbrand-50 dark:bg-tealbrand-950/60 text-tealbrand-600 flex items-center justify-center mb-4">
                <Navigation className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-tealbrand-600">
                Module C · Live Telemetry
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {t("landing.feature3Title")}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                {t("landing.feature3Desc")}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-500">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">Speedometer Gauge</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">5x Commute Simulation</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">Weather Triggers</span>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Link
                href="/mobility"
                className="text-xs font-bold text-tealbrand-600 dark:text-teal-400 inline-flex items-center gap-1 hover:underline"
              >
                Start Live Tracker <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 4: GEDA Command War-Room */}
          <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-slate-400 dark:hover:border-slate-700 transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Module D · State Administration
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {t("landing.feature4Title")}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                {t("landing.feature4Desc")}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-500">
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">42 Ward Scorecards</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">CSV Export</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">Campaign Levers</span>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Link
                href="/war-room"
                className="text-xs font-bold text-slate-700 dark:text-slate-300 inline-flex items-center gap-1 hover:underline"
              >
                Enter Command War-Room <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 5: EcoVerse Gamified Companion */}
          <div className="p-7 rounded-3xl bg-gradient-to-br from-emerald-50 to-tealbrand-50/50 dark:from-emerald-950/40 dark:to-slate-900 border border-emerald-200 dark:border-emerald-800 shadow-sm flex flex-col justify-between hover:border-emerald-400 transition-all md:col-span-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-solar-500" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Feature Innovation · EcoVerse Companion
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  Living EcoTwin Island & Friction-Free Quests
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed max-w-2xl">
                  Watch your virtual Gujarat island evolve with spinning wind turbines, solar roofs, and lush forests as you build streaks. Includes context-tailored micro-tasks for hostel students, renters, and homeowners, plus invite-code community circles with fair-play scoring.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-500">
                  <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">5-Stage Living SVG Island</span>
                  <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">Swap / Skip Daily Quests</span>
                  <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">Hostel & Society Circles</span>
                </div>
              </div>
              <div className="shrink-0">
                <Link
                  href="/ecoverse"
                  className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <span>Explore EcoVerse</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
