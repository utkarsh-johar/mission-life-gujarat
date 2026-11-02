"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Building,
  Users,
  Sun,
  Leaf,
  Zap,
  Download,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Flame,
  FileSpreadsheet,
  AlertCircle,
  Loader2,
  Layers,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { CalculationExplainer } from "../../components/ui/CalculationExplainer";

export default function WarRoomPage() {
  const [metrics, setMetrics] = useState<any | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>("All");
  const [selectedRange, setSelectedRange] = useState<string>("30");
  const [isLoading, setIsLoading] = useState(true);

  // Campaign Creator State
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [campaignTitle, setCampaignTitle] = useState("");
  const [campaignMultiplier, setCampaignMultiplier] = useState("2.0");
  const [campaignDuration, setCampaignDuration] = useState("7");
  const [campaignSuccess, setCampaignSuccess] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [metricsRes, lbRes] = await Promise.all([
        fetch("/api/admin/metrics"),
        fetch(`/api/leaderboard?city=${selectedCity}&range=${selectedRange}`),
      ]);

      if (metricsRes.ok) {
        const m = await metricsRes.json();
        setMetrics(m);
      }
      if (lbRes.ok) {
        const lb = await lbRes.json();
        setLeaderboard(lb.leaderboard || []);
      }
    } catch (e) {
      console.warn("War-room fetch error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCity, selectedRange]);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignTitle.trim()) return;

    try {
      const res = await fetch("/api/admin/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: campaignTitle,
          multiplier: parseFloat(campaignMultiplier) || 2.0,
          durationDays: parseInt(campaignDuration) || 7,
        }),
      });

      if (res.ok) {
        setCampaignSuccess(`Campaign "${campaignTitle}" published state-wide with ${campaignMultiplier}x Credit Multiplier!`);
        setShowCampaignModal(false);
        setCampaignTitle("");
        setTimeout(() => setCampaignSuccess(null), 6000);
      }
    } catch (err) {
      alert("Failed to launch campaign");
    }
  };

  const handleExportCsv = (type = "leaderboard") => {
    window.open(`/api/admin/export?type=${type}`, "_blank");
  };

  const COLORS = ["#0d9488", "#f59e0b", "#3b82f6", "#10b981", "#8b5cf6"];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Top Banner: GEDA Command Center */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-teal-300 dark:bg-teal-950/40 text-xs font-semibold border border-slate-700">
            <Building className="w-3.5 h-3.5 text-teal-400" />
            GEDA State Command Center · Gujarat Energy Development Agency
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            Mission LiFE State Administrator War-Room
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Ward-level telemetry, aggregated carbon avoided, solar rooftop conversion pipeline, and campaign levers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* CSV Export Button (AC-D5) */}
          <button
            type="button"
            onClick={() => handleExportCsv("leaderboard")}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export Ward CSV
          </button>

          <button
            type="button"
            onClick={() => handleExportCsv("leads")}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-tealbrand-600" /> Export Solar Leads
          </button>

          <button
            type="button"
            onClick={() => setShowCampaignModal(true)}
            className="px-4 py-2 bg-tealbrand-600 hover:bg-tealbrand-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Launch State Campaign
          </button>
        </div>
      </div>

      {/* Demo Data Disclaimer Banner (Section 9.1 & AC-D1) */}
      <div className="mb-6 px-4 py-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300 text-xs border border-amber-200 dark:border-amber-800 flex items-center justify-between">
        <span className="flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Demo Environment Active:</strong> Populated with 42 official Gujarat wards across Ahmedabad, Gandhinagar, Surat, Vadodara, and synthetic citizen activity.
          </span>
        </span>
        <span className="text-[11px] font-mono opacity-80">GEDA-PROD-READY</span>
      </div>

      {campaignSuccess && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 text-xs font-semibold border border-emerald-300 dark:border-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{campaignSuccess}</span>
        </div>
      )}

      {/* KPI Cards Row (Section 8.2) */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Total Registered Citizens
              </span>
              <Users className="w-4 h-4 text-tealbrand-600" />
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              {metrics.kpis.totalCitizens.toLocaleString("en-IN")}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>{metrics.kpis.weeklyActiveCitizens} active this week</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Verified CO₂ Avoided
              </span>
              <Leaf className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {metrics.kpis.totalTonnesCo2} <span className="text-sm font-semibold">Tonnes</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {metrics.kpis.totalGreenKm.toLocaleString("en-IN")} verified green km
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Solar Rooftop Pipeline
              </span>
              <Sun className="w-4 h-4 text-solar-500" />
            </div>
            <div className="text-3xl font-black text-solar-600 dark:text-amber-400 mt-1">
              {metrics.kpis.totalPotentialKw.toLocaleString("en-IN")} <span className="text-sm font-semibold">kW</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {metrics.kpis.totalRoofsDrawn} terraces mapped · ₹{metrics.kpis.totalSubsidyCr} Cr Subsidy
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Solar Quote Leads
              </span>
              <Zap className="w-4 h-4 text-tealbrand-600" />
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              {metrics.kpis.totalLeads.toLocaleString("en-IN")}
            </div>
            <div className="text-[11px] text-tealbrand-600 font-semibold mt-1">
              Dispatched to empanelled vendors
            </div>
          </div>
        </div>
      )}

      {/* 7-Day Trend Chart & DISCOM Split Row */}
      {metrics && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Trend Line Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
              Statewide LiFE CO₂ Avoidance & Daily Active Citizens (Past 7 Days)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Real-time daily aggregates synthesized across municipal wards
            </p>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics.trendDays}>
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="#94a3b8" unit=" kg" />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "11px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "5px" }} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="kgSaved"
                    name="CO₂ Avoided (kg)"
                    stroke="#10b981"
                    strokeWidth={2.5}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="activeUsers"
                    name="Active Citizens"
                    stroke="#0d9488"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* DISCOM Split Distribution */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                DISCOM Citizen Participation
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                Distribution of baseline audits & solar pipeline
              </p>

              <div className="space-y-3 mt-4">
                {metrics.discomSplit.map((item: any, i: number) => (
                  <div key={item.discom} className="text-xs">
                    <div className="flex justify-between font-medium mb-1">
                      <span className="text-slate-700 dark:text-slate-300">{item.discom}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{item.audits} Audits</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: COLORS[i % COLORS.length],
                          width: `${Math.min(100, (item.audits / 300) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
              Torrent Power (Ahmedabad/Surat) represents largest urban rooftop cluster.
            </div>
          </div>
        </div>
      )}

      {/* Ward Leaderboard Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                Gujarat Municipal Ward LiFE Leaderboard
              </h3>
              <CalculationExplainer
                details={{
                  title: "Ward LiFE Score Algorithm",
                  formula: "LiFE Score = 0.45 × Norm(CO2/Active) + 0.35 × Norm(Participation Rate) + 0.20 × Streak Health",
                  constants: [
                    { name: "CO2 Weight", value: "45%" },
                    { name: "Participation Rate Weight", value: "35%" },
                    { name: "Streak Health Weight", value: "20%" },
                    { name: "k-Anonymity Threshold", value: "≥ 10 active citizens" },
                  ],
                  source: "Mission LiFE State Evaluation Matrix",
                  asOf: "2024-01-01",
                }}
              />
            </div>
            <p className="text-xs text-slate-500">
              Aggregated from WardDailyAggregate records. Ranked by composite sustainability score.
            </p>
          </div>

          {/* Filters: City & Range */}
          <div className="flex items-center gap-3">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
            >
              <option value="All">All Cities</option>
              <option value="Ahmedabad">Ahmedabad</option>
              <option value="Gandhinagar">Gandhinagar</option>
              <option value="Surat">Surat</option>
              <option value="Vadodara">Vadodara</option>
            </select>

            <select
              value={selectedRange}
              onChange={(e) => setSelectedRange(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
            </select>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="pb-3 pl-2">Rank</th>
                <th className="pb-3">Ward Name & City</th>
                <th className="pb-3">DISCOM</th>
                <th className="pb-3 text-right">Active Citizens</th>
                <th className="pb-3 text-right">CO₂ Avoided</th>
                <th className="pb-3 text-right">Green Commute</th>
                <th className="pb-3 text-right">Solar Terraces</th>
                <th className="pb-3 text-right pr-2">LiFE Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {leaderboard.map((ward) => (
                <tr key={ward.wardId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 pl-2 font-bold text-slate-500 font-mono">
                    #{ward.rank}
                  </td>
                  <td className="py-3">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {ward.wardName}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {ward.city} · PIN {ward.pincode}
                    </div>
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {ward.discom}
                    </span>
                  </td>
                  <td className="py-3 text-right font-medium text-slate-700 dark:text-slate-300">
                    {ward.activeUsers}
                  </td>
                  <td className="py-3 text-right font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {ward.totalKgCo2.toLocaleString("en-IN")} kg
                  </td>
                  <td className="py-3 text-right text-slate-600 dark:text-slate-400 font-mono">
                    {ward.totalGreenKm.toLocaleString("en-IN")} km
                  </td>
                  <td className="py-3 text-right text-solar-600 font-bold font-mono">
                    {ward.solarPolygons}
                  </td>
                  <td className="py-3 text-right pr-2 font-mono">
                    <span className="px-2.5 py-1 rounded-lg bg-tealbrand-50 dark:bg-tealbrand-950/60 text-tealbrand-800 dark:text-teal-300 font-bold border border-tealbrand-200 dark:border-tealbrand-800">
                      {ward.lifeScore}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Campaign Modal */}
      {showCampaignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <form
            onSubmit={handleCreateCampaign}
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl"
          >
            <h4 className="font-bold text-slate-900 dark:text-white text-base">
              Publish State-Wide LiFE Campaign Challenge
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Time-boxed challenge pushed to citizen feeds with credit multiplier bonus.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Campaign Title
                </label>
                <input
                  type="text"
                  required
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                  placeholder="e.g. Diwali Power-Down Hour or Surya Mega Week"
                  className="w-full px-3 py-2 text-xs border rounded-xl bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Credit Multiplier
                  </label>
                  <select
                    value={campaignMultiplier}
                    onChange={(e) => setCampaignMultiplier(e.target.value)}
                    className="w-full px-3 py-2 text-xs border rounded-xl bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="1.5">1.5x Credits</option>
                    <option value="2.0">2.0x Credits (Double)</option>
                    <option value="3.0">3.0x Credits (Triple)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={campaignDuration}
                    onChange={(e) => setCampaignDuration(e.target.value)}
                    className="w-full px-3 py-2 text-xs border rounded-xl bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                type="button"
                onClick={() => setShowCampaignModal(false)}
                className="px-3 py-1.5 border rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-tealbrand-600 hover:bg-tealbrand-700 text-white rounded-xl text-xs font-bold"
              >
                Publish State Campaign
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
