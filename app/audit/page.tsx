"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Zap,
  MapPin,
  Flame,
  Car,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  TrendingDown,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { BillUploadOcr } from "../../components/audit/BillUploadOcr";
import { FootprintGauge } from "../../components/charts/FootprintGauge";
import { SlabAlertCard } from "../../components/ui/SlabAlertCard";
import { CalculationExplainer } from "../../components/ui/CalculationExplainer";
import { CommuteMode, COMMUTE_EMISSION_FACTORS } from "../../config/emission";
import { Discom, TARIFF_PLANS } from "../../config/tariffs";
import { Footprint, calculateFootprint } from "../../lib/engine/carbon";
import { SlabAlert, evaluateSlabJumpAlert } from "../../lib/engine/tariff";
import { LivingSituation, LIVING_PERSONAS } from "../../config/ecoverse";
import Link from "next/link";

export default function CarbonAuditPage() {
  const router = useRouter();

  // Step state (1: Location, 2: Energy, 3: Travel, 4: Result)
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [pincode, setPincode] = useState("380001");
  const [city, setCity] = useState("Ahmedabad");
  const [discom, setDiscom] = useState<Discom>("TORRENT_POWER");
  const [wardName, setWardName] = useState<string>("Navrangpura (Central)");
  const [wardId, setWardId] = useState<string>("AMD-NAV");
  const [pincodeNote, setPincodeNote] = useState<string>("");

  const [monthlyKwh, setMonthlyKwh] = useState<number>(220);
  const [cookingFuel, setCookingFuel] = useState<"LPG" | "PNG" | "ELECTRIC" | "OTHER">("PNG");
  const [lpgCylindersPerYear, setLpgCylindersPerYear] = useState<number>(6);
  const [pngScmPerMonth, setPngScmPerMonth] = useState<number>(18);

  const [commuteMode, setCommuteMode] = useState<CommuteMode>("TWO_WHEELER");
  const [dailyKm, setDailyKm] = useState<number>(16);
  const [workingDays, setWorkingDays] = useState<number>(26);
  const [householdSize, setHouseholdSize] = useState<number>(4);
  const [livingSituation, setLivingSituation] = useState<LivingSituation>("APARTMENT");

  // Results State
  const [resultFootprint, setResultFootprint] = useState<Footprint | null>(null);
  const [resultSlabAlert, setResultSlabAlert] = useState<SlabAlert | null>(null);
  const [creditsEarned, setCreditsEarned] = useState<number>(0);

  // Auto-resolve PIN code (AC-A1)
  const handlePincodeChange = async (val: string) => {
    setPincode(val);
    if (val.length === 6 && /^3[6-9]\d{4}$/.test(val)) {
      try {
        const res = await fetch(`/api/pincode/${val}`);
        if (res.ok) {
          const data = await res.json();
          setCity(data.city);
          setDiscom(data.discom);
          if (data.wardName) setWardName(data.wardName);
          if (data.wardId) setWardId(data.wardId);
          setPincodeNote(data.note || "Auto-resolved DISCOM service franchise");
        }
      } catch (err) {
        console.warn("Pincode resolve error:", err);
      }
    }
  };

  // Submit Baseline Audit to API
  const handleCalculate = async () => {
    setIsSubmitting(true);
    let fp: Footprint | null = null;
    let alert: SlabAlert | null = null;
    let credits = 50;

    try {
      const payload = {
        pincode,
        city,
        discom,
        wardId,
        monthlyKwh: Number(monthlyKwh),
        cookingFuel,
        lpgCylindersPerYear: cookingFuel === "LPG" ? Number(lpgCylindersPerYear) : undefined,
        pngScmPerMonth: cookingFuel === "PNG" ? Number(pngScmPerMonth) : undefined,
        commuteMode,
        dailyKm: Number(dailyKm),
        workingDaysPerMonth: Number(workingDays),
        householdSize: Number(householdSize),
        userId: "demo-citizen-id",
        source: "MANUAL",
      };

      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        fp = data.footprint;
        alert = data.slabAlert;
        credits = data.creditsAwarded ?? 50;
      }
    } catch (err) {
      console.warn("API network or serverless error, using deterministic client engine fallback:", err);
    }

    // Deterministic fallback (if serverless API / SQLite unavailable on Vercel)
    if (!fp) {
      fp = calculateFootprint({
        monthlyKwh: Number(monthlyKwh),
        cookingFuel,
        lpgCylindersPerYear: cookingFuel === "LPG" ? Number(lpgCylindersPerYear) : undefined,
        pngScmPerMonth: cookingFuel === "PNG" ? Number(pngScmPerMonth) : undefined,
        commuteMode,
        dailyKm: Number(dailyKm),
        workingDaysPerMonth: Number(workingDays),
        householdSize: Number(householdSize),
      });
      const tariffPlan = TARIFF_PLANS[discom] ?? TARIFF_PLANS.UGVCL;
      alert = evaluateSlabJumpAlert(Number(monthlyKwh), 15, tariffPlan, 15);
    }

    setResultFootprint(fp);
    setResultSlabAlert(alert);
    setCreditsEarned(credits);
    setStep(4); // Move to Results view
    setIsSubmitting(false);

    // Save baseline in local storage
    try {
      localStorage.setItem("life_audit_footprint", JSON.stringify(fp));
      localStorage.setItem("life_audit_discom", discom);
      localStorage.setItem("life_audit_kwh", monthlyKwh.toString());
      localStorage.setItem("life_user_persona", livingSituation);
    } catch (storageErr) {
      console.warn("Storage error:", storageErr);
    }
  };

  // Handle OCR Confirmation directly
  const handleOcrBillConfirmed = (data: { kwh: number; discom: string }) => {
    setMonthlyKwh(data.kwh);
    setDiscom(data.discom as Discom);
    setStep(3); // Proceed to Commute step
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tealbrand-50 dark:bg-tealbrand-950/40 text-tealbrand-700 dark:text-teal-400 text-xs font-semibold border border-tealbrand-200 dark:border-tealbrand-800">
          <Zap className="w-3.5 h-3.5" />
          Mission LiFE Gujarat · Module A
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
          30-Second Baseline Carbon & Bill Audit
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Trace your household energy and commute footprint against official Gujarat benchmarks. Zero appliance sliders.
        </p>
      </div>

      {/* Progress Bar (Steps 1–3) */}
      {step < 4 && (
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span className={step >= 1 ? "text-tealbrand-700 dark:text-teal-400" : ""}>
              1. Location & DISCOM
            </span>
            <span className={step >= 2 ? "text-tealbrand-700 dark:text-teal-400" : ""}>
              2. Energy & Fuel
            </span>
            <span className={step >= 3 ? "text-tealbrand-700 dark:text-teal-400" : ""}>
              3. Daily Travel
            </span>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-tealbrand-600 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* STEP 1: Where do you live? */}
      {step === 1 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-tealbrand-50 text-tealbrand-700 dark:bg-tealbrand-950/50 dark:text-teal-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-lg">Where do you live?</h2>
              <p className="text-xs text-slate-500">Resolves DISCOM tariff structure and local municipal ward</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Gujarat PIN Code (starts with 36–39)
              </label>
              <input
                type="text"
                maxLength={6}
                value={pincode}
                onChange={(e) => handlePincodeChange(e.target.value)}
                placeholder="e.g. 380001 (Ahmedabad)"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-base font-medium focus:ring-2 focus:ring-tealbrand-500"
              />
              {pincodeNote && (
                <p className="text-xs text-tealbrand-600 dark:text-teal-400 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {pincodeNote}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  City / Urban Area
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium"
                >
                  <option value="Ahmedabad">Ahmedabad</option>
                  <option value="Gandhinagar">Gandhinagar</option>
                  <option value="Surat">Surat</option>
                  <option value="Vadodara">Vadodara</option>
                  <option value="Rajkot">Rajkot</option>
                  <option value="Mehsana">Mehsana</option>
                  <option value="Other">Other Gujarat District</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Electricity DISCOM
                </label>
                <select
                  value={discom}
                  onChange={(e) => setDiscom(e.target.value as Discom)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium font-semibold text-tealbrand-700 dark:text-teal-300"
                >
                  <option value="TORRENT_POWER">Torrent Power (Ahmedabad / Surat)</option>
                  <option value="UGVCL">UGVCL (Uttar Gujarat Vij)</option>
                  <option value="DGVCL">DGVCL (Dakshin Gujarat Vij)</option>
                  <option value="MGVCL">MGVCL (Madhya Gujarat Vij)</option>
                  <option value="PGVCL">PGVCL (Paschim Gujarat Vij)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Household Members
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    min={1}
                    max={15}
                    value={householdSize}
                    onChange={(e) => setHouseholdSize(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-24 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium"
                  />
                  <span className="text-xs text-slate-400 ml-2">persons (per-capita ranking)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Living Situation (Personalised Nudges)
                </label>
                <select
                  value={livingSituation}
                  onChange={(e) => setLivingSituation(e.target.value as LivingSituation)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium"
                >
                  {Object.values(LIVING_PERSONAS).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label} ({p.energyControl === "NONE" ? "Device control" : p.energyControl === "PARTIAL" ? "Appliance control" : "Full control"})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-5 py-2.5 bg-tealbrand-600 hover:bg-tealbrand-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-xs transition-colors"
            >
              Continue to Energy <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Energy & Fuel */}
      {step === 2 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-lg">Household Energy & Cooking</h2>
              <p className="text-xs text-slate-500">Scan your DISCOM bill or enter your average monthly electricity units</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Bill OCR Component with instant samples */}
            <BillUploadOcr onBillConfirmed={handleOcrBillConfirmed} />

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              <span className="flex-shrink mx-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Or Enter Monthly Average Units
              </span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Monthly Electricity (kWh / Units)
                </label>
                <CalculationExplainer
                  details={{
                    title: "Grid Electricity Carbon Intensity",
                    formula: "Emissions (kg CO2) = Monthly kWh × 0.82",
                    constants: [{ name: "India Grid Factor", value: 0.82, unit: "kg CO2/kWh" }],
                    source: "CEA India CO2 Baseline Database v19",
                    asOf: "2024-03-31",
                  }}
                />
              </div>
              <input
                type="number"
                min={0}
                max={5000}
                value={monthlyKwh}
                onChange={(e) => setMonthlyKwh(Math.max(0, parseFloat(e.target.value) || 0))}
                className="mt-1 w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-base font-bold text-slate-900 dark:text-white"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Typical urban Gujarat household: ~200–260 kWh/month
              </p>
            </div>

            {/* Cooking Fuel */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Primary Cooking Fuel
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { id: "PNG", label: "Piped Natural Gas (PNG)", sub: "Gujarat Gas / Adani" },
                  { id: "LPG", label: "LPG Cylinder", sub: "14.2 kg domestic" },
                  { id: "ELECTRIC", label: "Induction / Electric", sub: "Clean cooking" },
                  { id: "OTHER", label: "Other / Biogas", sub: "Traditional" },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setCookingFuel(f.id as any)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      cookingFuel === f.id
                        ? "border-tealbrand-500 bg-tealbrand-50/50 dark:bg-tealbrand-950/30 text-tealbrand-900 dark:text-teal-200"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div className="text-xs font-bold">{f.label}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{f.sub}</div>
                  </button>
                ))}
              </div>

              {cookingFuel === "LPG" && (
                <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <span className="text-xs text-slate-700 dark:text-slate-300">
                    LPG Cylinders used per year:
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={36}
                    value={lpgCylindersPerYear}
                    onChange={(e) => setLpgCylindersPerYear(parseInt(e.target.value) || 1)}
                    className="w-20 px-2 py-1 text-xs text-center border rounded font-semibold bg-white dark:bg-slate-900"
                  />
                </div>
              )}

              {cookingFuel === "PNG" && (
                <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <span className="text-xs text-slate-700 dark:text-slate-300">
                    PNG SCM consumed per month:
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={pngScmPerMonth}
                    onChange={(e) => setPngScmPerMonth(parseInt(e.target.value) || 1)}
                    className="w-20 px-2 py-1 text-xs text-center border rounded font-semibold bg-white dark:bg-slate-900"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-5 py-2.5 bg-tealbrand-600 hover:bg-tealbrand-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-xs transition-colors"
            >
              Continue to Travel <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Daily Travel */}
      {step === 3 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-lg">Daily Commute & Travel</h2>
              <p className="text-xs text-slate-500">Your primary mode of transport to work, university, or daily errands</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Primary Commute Vehicle / Mode
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                {[
                  { mode: "TWO_WHEELER", label: "2-Wheeler (Petrol)", sub: "0.046 kg/km" },
                  { mode: "CAR_PETROL", label: "Car (Petrol)", sub: "0.171 kg/km" },
                  { mode: "CAR_CNG", label: "Car / Auto (CNG)", sub: "0.120 kg/km" },
                  { mode: "BUS", label: "AMTS / BRTS Bus", sub: "0.027 kg/km" },
                  { mode: "METRO_TRAIN", label: "Gujarat Metro", sub: "0.030 kg/km" },
                  { mode: "EV_TWO_WHEELER", label: "Electric 2W", sub: "0.012 kg/km" },
                  { mode: "CYCLE", label: "Bicycle", sub: "0.000 kg/km" },
                  { mode: "WALK", label: "Walking", sub: "0.000 kg/km" },
                ].map((item) => (
                  <button
                    key={item.mode}
                    type="button"
                    onClick={() => setCommuteMode(item.mode as CommuteMode)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      commuteMode === item.mode
                        ? "border-tealbrand-500 bg-tealbrand-50/60 dark:bg-tealbrand-950/30 text-tealbrand-900 dark:text-teal-200"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div className="text-xs font-bold">{item.label}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{item.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Daily Round-Trip Distance (km)
                </label>
                <input
                  type="number"
                  min={1}
                  max={300}
                  value={dailyKm}
                  onChange={(e) => setDailyKm(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-base font-bold text-slate-900 dark:text-white"
                />
                <span className="text-[11px] text-slate-400">Total kilometers traveled on a typical working day</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Working Days per Month
                </label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={workingDays}
                  onChange={(e) => setWorkingDays(Math.max(1, parseInt(e.target.value) || 26))}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-base font-medium text-slate-900 dark:text-white"
                />
                <span className="text-[11px] text-slate-400">Default: 26 working days</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleCalculate}
              className="px-6 py-2.5 bg-tealbrand-600 hover:bg-tealbrand-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-md transition-colors"
            >
              {isSubmitting ? "Calculating..." : "Calculate My Footprint & Savings"} <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Results Dashboard */}
      {step === 4 && resultFootprint && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Credits Bonus Banner */}
          {creditsEarned > 0 && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🌱</span>
                <div>
                  <h4 className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">
                    +{creditsEarned} Mission LiFE Credits Unlocked!
                  </h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">
                    Your baseline footprint is recorded on the state climate ledger.
                  </p>
                </div>
              </div>
              <Link
                href="/rewards"
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs"
              >
                View Wallet
              </Link>
            </div>
          )}

          {/* Tariff Slab Alert Card (Top) */}
          {resultSlabAlert && <SlabAlertCard alert={resultSlabAlert} discomName={discom} />}

          {/* Visual Footprint Gauge */}
          <FootprintGauge
            userMonthlyKg={resultFootprint.monthly.total}
            perPersonMonthlyKg={resultFootprint.perCapita.perPerson}
            householdSize={householdSize}
          />

          {/* Detailed Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Electricity
                </span>
                <CalculationExplainer
                  details={{
                    title: "Electricity Emissions",
                    formula: `${monthlyKwh} kWh × 0.82 kg CO2/kWh`,
                    constants: [{ name: "Grid Factor", value: 0.82, unit: "kg/kWh" }],
                    source: "CEA India Database v19",
                    asOf: "2024-03-31",
                  }}
                />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {resultFootprint.monthly.electricity} <span className="text-xs font-normal text-slate-400">kg/mo</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {monthlyKwh} kWh billed under {discom}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Cooking Fuel
                </span>
                <CalculationExplainer
                  details={{
                    title: "Cooking Fuel Emissions",
                    formula: cookingFuel === "LPG" ? "Cylinders/12 × 42.5" : "SCM × 2.0 kg/SCM",
                    constants: [{ name: "Fuel Type", value: cookingFuel, unit: "" }],
                    source: "MoPNG / PPAC Emission Factors",
                    asOf: "2024-01-01",
                  }}
                />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {resultFootprint.monthly.cooking} <span className="text-xs font-normal text-slate-400">kg/mo</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {cookingFuel} ({cookingFuel === "PNG" ? `${pngScmPerMonth} SCM` : `${lpgCylindersPerYear} cyl/yr`})
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Daily Commute
                </span>
                <CalculationExplainer
                  details={{
                    title: "Commute Emissions",
                    formula: `${dailyKm} km/day × ${workingDays} days × factor(${commuteMode})`,
                    constants: [
                      {
                        name: commuteMode,
                        value: COMMUTE_EMISSION_FACTORS[commuteMode]?.value ?? 0,
                        unit: "kg/km",
                      },
                    ],
                    source: "BEE & Mission LiFE Urban Mobility Guidance",
                    asOf: "2023-06-01",
                  }}
                />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {resultFootprint.monthly.commute} <span className="text-xs font-normal text-slate-400">kg/mo</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {dailyKm} km/day via {commuteMode.toLowerCase().replace("_", " ")}
              </div>
            </div>
          </div>

          {/* Top Computed Reduction Actions */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Top Ranked Actions to Cut Your Emissions & Bill
                </h3>
                <p className="text-xs text-slate-500">
                  Computed dynamically by evaluating alternative energy & commute substitutions
                </p>
              </div>
              <span className="text-xs font-semibold text-tealbrand-600 bg-tealbrand-50 dark:bg-tealbrand-950/40 px-2.5 py-1 rounded-full border border-tealbrand-200 dark:border-tealbrand-800">
                Personalized
              </span>
            </div>

            <div className="space-y-3">
              {resultFootprint.topReductionActions.map((action, i) => (
                <div
                  key={action.id}
                  className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-tealbrand-100 dark:bg-tealbrand-900/60 text-tealbrand-800 dark:text-teal-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                        {action.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">{action.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        -{action.kgCo2SavedPerMonth} kg/mo
                      </div>
                      <div className="text-[10px] text-slate-400">{action.source}</div>
                    </div>

                    {action.category === "SOLAR" ? (
                      <Link
                        href="/solar"
                        className="px-3 py-1.5 bg-solar-500 hover:bg-solar-600 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
                      >
                        Launch Solar Studio
                      </Link>
                    ) : action.category === "MOBILITY" ? (
                      <Link
                        href="/mobility"
                        className="px-3 py-1.5 bg-tealbrand-600 hover:bg-tealbrand-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
                      >
                        Start Green Trip
                      </Link>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Re-audit with Different Inputs
            </button>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/ecoverse"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-solar-400" />
                <span>Open Personalised EcoVerse</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/solar"
                className="px-5 py-2.5 bg-solar-500 hover:bg-solar-600 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2"
              >
                <span>Draw Roof Polygon on Map</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
