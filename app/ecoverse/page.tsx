"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Sun,
  Zap,
  Navigation,
  Wallet,
  Users,
  Award,
  Trees,
  Flame,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { EcoTwinIsland } from "../../components/ecoverse/EcoTwinIsland";
import { EcoQuestBoard } from "../../components/ecoverse/EcoQuestBoard";
import { CommunityCircles } from "../../components/ecoverse/CommunityCircles";
import {
  LivingSituation,
  LIVING_PERSONAS,
  EcoTask,
} from "../../config/ecoverse";

export default function EcoVersePage() {
  const [persona, setPersona] = useState<LivingSituation>("HOSTEL");
  const [points, setPoints] = useState<number>(345);
  const [streak, setStreak] = useState<number>(12);
  const [co2SavedTotal, setCo2SavedTotal] = useState<number>(48.5);

  // Sync with localStorage if previous audit was completed
  useEffect(() => {
    try {
      const savedPersona = localStorage.getItem("life_user_persona") as LivingSituation | null;
      if (savedPersona && LIVING_PERSONAS[savedPersona]) {
        setPersona(savedPersona);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handlePersonaChange = (newPersona: LivingSituation) => {
    setPersona(newPersona);
    try {
      localStorage.setItem("life_user_persona", newPersona);
    } catch (e) {}
  };

  const handleTaskCompleted = (task: EcoTask) => {
    setPoints((prev) => prev + task.credits);
    setCo2SavedTotal((prev) => Number((prev + task.co2SavedKg).toFixed(2)));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner & Vision */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
            <Sparkles className="w-3.5 h-3.5 text-solar-500" />
            Mission LiFE · EcoVerse Companion
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-2">
            Your Lifestyle. Your Missions. Your Greener World.
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl mt-1">
            EcoVerse adapts daily sustainability tasks to your actual living situation—whether you live in a college hostel, rented apartment, or your own independent home.
          </p>
        </div>

        {/* Quick Audit / Solar Links */}
        <div className="flex items-center gap-2">
          <Link
            href="/audit"
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-tealbrand-500 transition-colors flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-tealbrand-600" />
            <span>Update Footprint</span>
          </Link>
          <Link
            href="/solar"
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-solar-500 hover:bg-solar-600 text-white transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Solar Studio</span>
          </Link>
        </div>
      </div>

      {/* Living Situation Profile Tailoring Selector */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          1. Select Your Living Circumstance (Personalised Friction-Free Logic)
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.values(LIVING_PERSONAS).map((p) => {
            const isSelected = persona === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePersonaChange(p.id)}
                className={`p-4 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                  isSelected
                    ? "bg-tealbrand-50 dark:bg-tealbrand-950/60 border-tealbrand-500 dark:border-tealbrand-600 ring-2 ring-tealbrand-400/30"
                    : "bg-slate-50/50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {p.label}
                    </span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-tealbrand-600" />}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{p.description}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px] font-semibold text-slate-400">
                  Control: <strong className="text-slate-700 dark:text-slate-300">{p.energyControl}</strong>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Flagship Feature: EcoTwin Virtual Living Island */}
      <EcoTwinIsland points={points} streak={streak} />

      {/* Understandable Impact Translation Cards (No abstract numbers) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
            <Trees className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              ~{(co2SavedTotal / 8).toFixed(1)} Trees
            </div>
            <div className="text-xs text-slate-500">
              Equivalent Neem trees planted in Gandhinagar
            </div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-solar-50 dark:bg-amber-950/60 text-solar-600 flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {Math.round(co2SavedTotal * 6)} Hours
            </div>
            <div className="text-xs text-slate-500">
              Power saved to run an educational classroom ceiling fan
            </div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-tealbrand-50 dark:bg-tealbrand-950/60 text-tealbrand-600 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {Math.round(co2SavedTotal * 0.65)} kg
            </div>
            <div className="text-xs text-slate-500">
              Gujarat thermal grid coal combustion displaced
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Section: Personalised Quests & Community Circles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily EcoQuest Board with Skip/Replace */}
        <EcoQuestBoard
          currentPersona={persona}
          onTaskCompleted={handleTaskCompleted}
          onPersonaChange={handlePersonaChange}
        />

        {/* Community Circles (Invite Codes & Fair Play Track) */}
        <CommunityCircles />
      </div>

      {/* Call to Action Footer */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-tealbrand-700 to-tealbrand-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold">Ready to redeem your {points} LiFE Credits?</h3>
          <p className="text-xs text-teal-100 mt-0.5">
            Visit the State Climate Wallet to claim BRTS bus transit passes, solar discounts, or official GEDA certificates.
          </p>
        </div>
        <Link
          href="/rewards"
          className="px-5 py-2.5 rounded-xl bg-white text-tealbrand-900 hover:bg-teal-50 text-xs font-bold shrink-0 transition-colors flex items-center gap-1.5"
        >
          <Wallet className="w-4 h-4 text-tealbrand-700" />
          <span>Open Climate Wallet</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
