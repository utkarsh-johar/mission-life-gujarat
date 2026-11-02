"use client";

import React, { useState } from "react";
import {
  CommunityCircle,
  SEEDED_COMMUNITY_CIRCLES,
} from "../../config/ecoverse";
import {
  Users,
  Award,
  Flame,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  PlusCircle,
  KeyRound,
} from "lucide-react";

export const CommunityCircles: React.FC = () => {
  const [circles, setCircles] = useState<CommunityCircle[]>(SEEDED_COMMUNITY_CIRCLES);
  const [activeCircleId, setActiveCircleId] = useState<string>(SEEDED_COMMUNITY_CIRCLES[0].id);
  const [inviteInput, setInviteInput] = useState<string>("");
  const [joinSuccessMsg, setJoinSuccessMsg] = useState<string | null>(null);
  const [activeTrack, setActiveTrack] = useState<"MOST_IMPROVED" | "STREAK" | "COLLECTIVE">(
    "MOST_IMPROVED"
  );

  const activeCircle = circles.find((c) => c.id === activeCircleId) || circles[0];

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inviteInput.trim().toUpperCase();
    if (!trimmed) return;

    // Check if circle exists
    const found = circles.find((c) => c.code.toUpperCase() === trimmed);
    if (found) {
      setActiveCircleId(found.id);
      setJoinSuccessMsg(`Successfully joined ${found.name}!`);
      setInviteInput("");
    } else {
      // Create new dynamic circle for demo
      const newCircle: CommunityCircle = {
        id: `circ-${Date.now()}`,
        code: trimmed,
        name: `${trimmed} Green Circle`,
        category: "COMMUNITY",
        location: "Gujarat Active Node",
        membersCount: 1,
        totalCo2SavedKg: 15,
        topMetricTitle: "New Challenge",
        topMetricValue: "Level 1",
        mostImprovedUser: "You (+100%)",
        streakChamp: "You (Active)",
      };
      setCircles((prev) => [newCircle, ...prev]);
      setActiveCircleId(newCircle.id);
      setJoinSuccessMsg(`Circle "${trimmed}" initialized! You are Member #1.`);
      setInviteInput("");
    }

    setTimeout(() => {
      setJoinSuccessMsg(null);
    }, 4000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-tealbrand-50 dark:bg-tealbrand-950/40 text-tealbrand-700 dark:text-teal-400 text-xs font-bold">
            <Users className="w-3.5 h-3.5" />
            Fair Play Community Circles
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            Group Challenges & Cohorts
          </h3>
          <p className="text-xs text-slate-500">
            Connect with your hostel, college, or housing society. Ranked on improvement, not raw roof size.
          </p>
        </div>

        {/* Join by Invite Code Form */}
        <form onSubmit={handleJoinByCode} className="flex items-center gap-2">
          <div className="relative">
            <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={inviteInput}
              onChange={(e) => setInviteInput(e.target.value)}
              placeholder="Enter Code (e.g. IITGN-HOSTEL-4)"
              className="pl-8 pr-3 py-1.5 text-xs font-mono font-semibold uppercase bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-tealbrand-500 text-slate-900 dark:text-white w-48 sm:w-56"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl shadow-xs hover:opacity-90 transition-opacity"
          >
            Join
          </button>
        </form>
      </div>

      {/* Success Notification */}
      {joinSuccessMsg && (
        <div className="mb-4 p-3 rounded-2xl bg-tealbrand-50 text-tealbrand-900 dark:bg-tealbrand-950/40 dark:text-teal-300 text-xs font-semibold border border-tealbrand-200 dark:border-tealbrand-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-tealbrand-600" />
          <span>{joinSuccessMsg}</span>
        </div>
      )}

      {/* Active Circles Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
        {circles.map((c) => {
          const isSelected = c.id === activeCircleId;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveCircleId(c.id)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all text-left flex flex-col shrink-0 border ${
                isSelected
                  ? "bg-tealbrand-50 dark:bg-tealbrand-950/60 text-tealbrand-800 dark:text-teal-300 border-tealbrand-400 dark:border-tealbrand-700 shadow-xs"
                  : "bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50"
              }`}
            >
              <span className="text-[10px] uppercase font-mono text-slate-400">{c.code}</span>
              <span className="truncate max-w-[180px]">{c.name}</span>
            </button>
          );
        })}
      </div>

      {/* Circle Overview Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-50 to-tealbrand-50/30 dark:from-slate-850 dark:to-slate-800 border border-slate-200 dark:border-slate-800 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono font-bold px-2 py-0.5 rounded-md bg-tealbrand-100 dark:bg-tealbrand-900/50 text-tealbrand-800 dark:text-teal-300">
                Code: {activeCircle.code}
              </span>
              <span className="text-xs text-slate-500 font-medium">📍 {activeCircle.location}</span>
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
              {activeCircle.name}
            </h4>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center sm:text-right">
              <div className="text-[11px] font-semibold text-slate-400 uppercase">Members</div>
              <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
                {activeCircle.membersCount}
              </div>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
            <div className="text-center sm:text-right">
              <div className="text-[11px] font-semibold text-slate-400 uppercase">
                Collective CO₂
              </div>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {activeCircle.totalCo2SavedKg} <span className="text-xs">kg</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fair Competition Tracks (Most Improved / Streak / Collective) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Fair Competition Standings
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTrack("MOST_IMPROVED")}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                activeTrack === "MOST_IMPROVED"
                  ? "bg-white dark:bg-slate-900 text-tealbrand-700 dark:text-teal-300 font-bold shadow-xs"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              🌱 Most Improved
            </button>
            <button
              type="button"
              onClick={() => setActiveTrack("STREAK")}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                activeTrack === "STREAK"
                  ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 font-bold shadow-xs"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              🔥 Streak Champions
            </button>
          </div>
        </div>

        {/* Track Content */}
        {activeTrack === "MOST_IMPROVED" ? (
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-tealbrand-700 dark:text-teal-400">
              <TrendingUp className="w-4 h-4" />
              <span>Equity-First Track: Evaluates percentage reduction from baseline</span>
            </div>
            <div className="space-y-2 mt-3">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-white flex items-center justify-center text-[10px]">
                    1
                  </span>
                  <span>{activeCircle.mostImprovedUser}</span>
                </div>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  +42% Efficiency
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs">
                <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center text-[10px]">
                    2
                  </span>
                  <span>Harsh Vardhan (+28% Efficiency)</span>
                </div>
                <span className="font-mono font-bold text-slate-500">+28%</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs">
                <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center text-[10px]">
                    3
                  </span>
                  <span>You (Current Citizen)</span>
                </div>
                <span className="font-mono font-bold text-tealbrand-600 dark:text-teal-400">
                  +22% (Active)
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
              <Flame className="w-4 h-4" />
              <span>Habit Consistency Track: Consecutive days of completed EcoQuests</span>
            </div>
            <div className="space-y-2 mt-3">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-white flex items-center justify-center text-[10px]">
                    1
                  </span>
                  <span>{activeCircle.streakChamp}</span>
                </div>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                  24-Day Streak
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs">
                <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center text-[10px]">
                    2
                  </span>
                  <span>Asha Patel (Demo Citizen)</span>
                </div>
                <span className="font-mono font-bold text-slate-500">12-Day Streak</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
