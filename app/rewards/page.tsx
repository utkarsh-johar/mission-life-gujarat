"use client";

import React, { useState, useEffect } from "react";
import {
  Wallet,
  Flame,
  Award,
  Gift,
  CheckCircle2,
  AlertCircle,
  Download,
  Shield,
  Star,
  Zap,
  Sun,
  Loader2,
  Calendar,
  History,
} from "lucide-react";
import { TIER_BADGES, REWARDS_CATALOGUE, RewardItem, TierBadge } from "../../config/gamification";
import { CalculationExplainer } from "../../components/ui/CalculationExplainer";
import jsPDF from "jspdf";

export default function RewardsWalletPage() {
  const [walletData, setWalletData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReward, setSelectedReward] = useState<RewardItem | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redemptionSuccess, setRedemptionSuccess] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchWallet = async () => {
    try {
      const res = await fetch("/api/wallet?userId=demo-citizen-id");
      if (res.ok) {
        const data = await res.json();
        setWalletData(data);
      }
    } catch (e) {
      console.warn("Wallet fetch error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleRedeem = async (reward: RewardItem) => {
    setSelectedReward(reward);
    setErrorMsg(null);
    setRedemptionSuccess(null);
  };

  const confirmRedeem = async () => {
    if (!selectedReward) return;
    setIsRedeeming(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/rewards/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "demo-citizen-id",
          rewardId: selectedReward.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Redemption failed");
      }

      setRedemptionSuccess(data);
      setSelectedReward(null);
      fetchWallet(); // refresh balance
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to redeem reward.");
    } finally {
      setIsRedeeming(false);
    }
  };

  // Generate GEDA Commendation Certificate PDF
  const handleDownloadCertificate = () => {
    const doc = new jsPDF("landscape");
    doc.setFillColor(15, 23, 42); // dark navy
    doc.rect(0, 0, 297, 210, "F");

    doc.setDrawColor(245, 158, 11); // gold border
    doc.setLineWidth(3);
    doc.rect(10, 10, 277, 190);

    doc.setTextColor(245, 158, 11);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text("GUJARAT ENERGY DEVELOPMENT AGENCY (GEDA)", 148, 40, { align: "center" });

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text("Mission LiFE Gujarat — Certificate of Climate Commendation", 148, 55, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text("This official state commendation is proudly presented to", 148, 80, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(20, 184, 166);
    doc.text("Citizen Asha Patel", 148, 100, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(220, 220, 220);
    doc.text(
      "for verified lifestyle choices reducing household carbon emissions and advancing clean energy in Gujarat.",
      148,
      115,
      { align: "center" }
    );

    doc.text(
      `Lifetime Verified CO2 Avoided: ${walletData?.totalCo2SavedKg || 120} kg · Active Habit Streak: ${
        walletData?.streak?.current || 12
      } Days`,
      148,
      130,
      { align: "center" }
    );

    doc.text("Certified on: " + new Date().toLocaleDateString("en-IN"), 50, 175);
    doc.text("GEDA State Mission LiFE Directorate", 240, 175, { align: "right" });

    doc.save("GEDA-Mission-LiFE-Commendation-Certificate.pdf");
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-tealbrand-600 mx-auto mb-2" />
        <span className="text-sm text-slate-500">Loading State Climate Wallet...</span>
      </div>
    );
  }

  const balance = walletData?.balance ?? 165;
  const streak = walletData?.streak ?? { current: 12, best: 14, freezes: 1 };
  const currentTier: TierBadge = walletData?.tier ?? TIER_BADGES[1];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tealbrand-50 text-tealbrand-700 dark:bg-tealbrand-950/40 dark:text-teal-400 text-xs font-semibold border border-tealbrand-200 dark:border-tealbrand-800">
          <Wallet className="w-3.5 h-3.5" />
          Mission LiFE Gujarat · Citizen Climate Wallet
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
          LiFE Credits Wallet & Rewards Catalogue
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Every verified action earns state credits on an append-only ledger, unlocking citizen tier recognition and vouchers.
        </p>
      </div>

      {redemptionSuccess && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 text-xs border border-emerald-300 dark:border-emerald-800 flex items-center justify-between">
          <div>
            <h4 className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {redemptionSuccess.message}
            </h4>
            <div className="font-mono text-[11px] text-emerald-700 mt-1">
              Redemption Voucher Code: <strong>{redemptionSuccess.redemptionCode}</strong>
            </div>
          </div>
          {redemptionSuccess.reward?.category === "CERTIFICATE" && (
            <button
              type="button"
              onClick={handleDownloadCertificate}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" /> Download PDF
            </button>
          )}
        </div>
      )}

      {/* Main Status Row: Balance, Streak, Citizen Tier */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Wallet Balance */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-tealbrand-600 to-tealbrand-800 text-white shadow-lg relative overflow-hidden">
          <div className="text-xs uppercase font-bold tracking-wider text-teal-100 flex items-center justify-between">
            <span>Available Balance</span>
            <CalculationExplainer
              details={{
                title: "LiFE Credits Ledger Calculation",
                formula: "Balance = Σ (Append-Only Verified Credit Entries) − Σ (Redemptions)",
                constants: [
                  { name: "Baseline Audit", value: "+50 credits" },
                  { name: "Roof Polygon Saved", value: "+30 credits" },
                  { name: "Green Commute", value: "10 credits / kg CO2 avoided" },
                  { name: "Daily Streak Bonus", value: "+10 at 7d, +30 at 30d" },
                ],
                source: "GEDA Citizen Incentive Framework",
                asOf: "2024-01-01",
              }}
            />
          </div>

          <div className="text-4xl font-black mt-2 font-mono">
            {balance} <span className="text-base font-normal text-teal-200">Credits</span>
          </div>

          <p className="text-xs text-teal-100/90 mt-2">
            Append-only ledger backed by SQLite/PostgreSQL
          </p>
        </div>

        {/* Streak Counter & Heat Strip */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span className="flex items-center gap-1 text-amber-600">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
              Daily Habit Streak
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Freezes: {streak.freezes} left
            </span>
          </div>

          <div className="text-3xl font-black text-slate-900 dark:text-white mt-2 font-mono">
            {streak.current} <span className="text-sm font-semibold text-slate-500">Days</span>
          </div>

          {/* 7-day mini calendar heat strip */}
          <div className="flex items-center gap-1.5 mt-3">
            {[1, 2, 3, 4, 5, 6, 7].map((d) => (
              <div
                key={d}
                className={`flex-1 h-2 rounded-full ${
                  d <= Math.min(7, streak.current % 7 || 7)
                    ? "bg-amber-500"
                    : "bg-slate-200 dark:bg-slate-700"
                }`}
                title={`Day ${d}`}
              />
            ))}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {7 - (streak.current % 7)} days until next milestone bonus (+10 credits)
          </span>
        </div>

        {/* Citizen Tier Recognition */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Citizen Climate Tier
              </span>
              <Award className="w-4 h-4" style={{ color: currentTier.color }} />
            </div>

            <div
              className="text-2xl font-black mt-2"
              style={{ color: currentTier.color }}
            >
              {currentTier.name}
            </div>

            <p className="text-xs text-slate-500 mt-1">{currentTier.description}</p>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Lifetime Avoided:</span>
            <strong className="text-slate-700 dark:text-slate-300">
              {walletData?.totalCo2SavedKg || 120} kg CO₂
            </strong>
          </div>
        </div>
      </div>

      {/* Rewards Catalogue Grid */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
              <Gift className="w-5 h-5 text-tealbrand-600" />
              Seeded State Rewards Catalogue
            </h3>
            <p className="text-xs text-slate-500">
              Redeem earned credits for non-monetary sustainability incentives & official certificates
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {REWARDS_CATALOGUE.map((reward) => {
            const canAfford = balance >= reward.creditsCost;
            return (
              <div
                key={reward.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {reward.category}
                    </span>
                    <span className="font-bold text-xs text-tealbrand-600 dark:text-teal-400">
                      {reward.creditsCost} Credits
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    {reward.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {reward.description}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-2 font-medium">
                    Partner: {reward.partner}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleRedeem(reward)}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                      canAfford
                        ? "bg-tealbrand-600 hover:bg-tealbrand-700 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    {canAfford ? "Redeem Reward" : `Needs ${reward.creditsCost - balance} More Credits`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirmation Modal */}
      {selectedReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h4 className="font-bold text-slate-900 dark:text-white text-base">
              Confirm Reward Redemption
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Are you sure you want to redeem <strong>{selectedReward.title}</strong>?
            </p>

            <div className="my-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Credits Deducted:</span>
                <span className="font-bold text-rose-600">-{selectedReward.creditsCost}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Balance Remaining:</span>
                <span className="font-bold">{balance - selectedReward.creditsCost}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedReward(null)}
                className="px-3 py-1.5 border rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isRedeeming}
                onClick={confirmRedeem}
                className="px-4 py-1.5 bg-tealbrand-600 hover:bg-tealbrand-700 text-white rounded-xl text-xs font-bold"
              >
                {isRedeeming ? "Processing..." : "Confirm Redemption"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Append-only Ledger History Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-4 h-4 text-slate-500" />
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            Credit Ledger History (Audit Trail)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="pb-2">Date</th>
                <th className="pb-2">Activity Description</th>
                <th className="pb-2 text-right">Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {(walletData?.ledger || []).map((entry: any) => (
                <tr key={entry.id} className="py-2.5">
                  <td className="py-2.5 text-slate-400 font-mono text-[11px]">
                    {new Date(entry.createdAt).toLocaleDateString("en-IN")}
                  </td>
                  <td className="py-2.5 font-medium text-slate-800 dark:text-slate-200">
                    {entry.reason}
                  </td>
                  <td
                    className={`py-2.5 text-right font-bold font-mono ${
                      entry.delta > 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {entry.delta > 0 ? `+${entry.delta}` : entry.delta}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
