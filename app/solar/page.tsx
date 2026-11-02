"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Sun,
  ShieldCheck,
  Zap,
  Download,
  Send,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Phone,
  Building2,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { SolarBreakEvenChart } from "../../components/charts/SolarBreakEvenChart";
import { IrradianceCurveChart } from "../../components/charts/IrradianceCurveChart";
import { CalculationExplainer } from "../../components/ui/CalculationExplainer";
import { SolarEstimateResult } from "../../lib/engine/solar";
import { SolarIrradianceResponse } from "../../lib/services/openMeteo";
import jsPDF from "jspdf";

// Dynamic import of Leaflet Map Studio with ssr: false
const SolarMapStudio = dynamic(
  () => import("../../components/map/SolarMapStudio").then((mod) => mod.SolarMapStudio),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[600px] bg-slate-900 rounded-2xl flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-tealbrand-500 mb-2" />
        <span className="text-sm">Loading High-Resolution Satellite Map...</span>
      </div>
    ),
  }
);

export default function SolarStudioPage() {
  const [estimateResult, setEstimateResult] = useState<SolarEstimateResult | null>(null);
  const [irradianceData, setIrradianceData] = useState<SolarIrradianceResponse | null>(null);
  const [polygonArea, setPolygonArea] = useState<number>(0);
  const [polygonGeoJson, setPolygonGeoJson] = useState<any>(null);
  const [roofId, setRoofId] = useState<string | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sensitivity Toggles
  const [cloudierYear, setCloudierYear] = useState(false);
  const [flatTariff, setFlatTariff] = useState(false);

  // Vendor Directory & Leads
  const [vendors, setVendors] = useState<any[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<any | null>(null);
  const [consentChecked, setConsentChecked] = useState(false);
  const [leadSuccessMsg, setLeadSuccessMsg] = useState<string | null>(null);
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);

  // Load empanelled vendors
  useEffect(() => {
    fetch("/api/vendors")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setVendors(data);
      })
      .catch((err) => console.warn("Failed to load vendors:", err));
  }, []);

  // When a polygon is finished on the map
  const handlePolygonComplete = async (
    geoJsonPolygon: any,
    areaSqM: number,
    centroid: [number, number]
  ) => {
    setIsEstimating(true);
    setErrorMsg(null);
    setPolygonArea(areaSqM);
    setPolygonGeoJson(geoJsonPolygon);
    setLeadSuccessMsg(null);

    try {
      const res = await fetch("/api/solar/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          polygon: geoJsonPolygon,
          lat: centroid[0],
          lng: centroid[1],
          monthlyKwh: 240, // typical consumption baseline
          discom: "UGVCL",
          sensitivityCloudierYear: cloudierYear,
          sensitivityFlatTariff: flatTariff,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to estimate solar potential");
      }

      setEstimateResult(data.estimate);
      setIrradianceData(data.irradianceSnapshot);

      // Save roof project to DB & claim credits
      const saveRes = await fetch("/api/solar/roofs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "demo-citizen-id",
          geojson: geoJsonPolygon,
          areaSqM: data.estimate.areaSqM,
          usableSqM: data.estimate.usableSqM,
          systemKw: data.estimate.systemKw,
          annualKwh: data.estimate.annualKwh,
          grossCost: data.estimate.grossCostInr,
          subsidy: data.estimate.subsidy.subsidyAmountInr,
          netCost: data.estimate.netCostInr,
          paybackYears: data.estimate.paybackYears,
          lat: centroid[0],
          lng: centroid[1],
          irradianceSnapshot: data.irradianceSnapshot,
        }),
      });

      if (saveRes.ok) {
        const savedData = await saveRes.json();
        setRoofId(savedData.project?.id || null);
      }
    } catch (err: any) {
      console.error("Estimation failed:", err);
      setErrorMsg(err.message || "Geometry error. Please re-draw perimeter.");
    } finally {
      setIsEstimating(false);
    }
  };

  // Re-estimate on Sensitivity Toggle Change
  const triggerReEstimate = async (newCloudier: boolean, newFlat: boolean) => {
    if (!polygonGeoJson) return;
    setIsEstimating(true);
    try {
      const res = await fetch("/api/solar/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          polygon: polygonGeoJson,
          lat: 23.0353,
          lng: 72.5283,
          monthlyKwh: 240,
          discom: "UGVCL",
          sensitivityCloudierYear: newCloudier,
          sensitivityFlatTariff: newFlat,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setEstimateResult(data.estimate);
      }
    } catch (e) {
      console.warn("Re-estimation error:", e);
    } finally {
      setIsEstimating(false);
    }
  };

  // Quote Request Submission (Lead)
  const handleQuoteRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor || !roofId || !consentChecked) return;

    setIsSubmittingLead(true);
    try {
      const res = await fetch("/api/solar/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "demo-citizen-id",
          vendorId: selectedVendor.id,
          roofId: roofId,
          consent: true,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setLeadSuccessMsg(data.message);
        setSelectedVendor(null);
      } else {
        alert(data.error?.message || "Failed to submit lead");
      }
    } catch (e) {
      alert("Submission error");
    } finally {
      setIsSubmittingLead(false);
    }
  };

  // Download Feasibility PDF via jsPDF
  const handleDownloadPdf = () => {
    if (!estimateResult) return;
    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Gujarat Energy Development Agency (GEDA)", 14, 20);

    doc.setFontSize(14);
    doc.setTextColor(13, 148, 136);
    doc.text("Roof-to-Rupee Solar Feasibility Report", 14, 28);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleDateString("en-IN")}`, 14, 35);
    doc.text(`Scheme: PM Surya Ghar: Muft Bijli Yojana (Central CFA)`, 14, 40);

    doc.setDrawColor(200, 200, 200);
    doc.line(14, 44, 196, 44);

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Measured Roof Area: ${estimateResult.areaSqM} m² (${estimateResult.areaSqFt} sq ft)`, 14, 52);
    doc.text(`Usable Solar Area (70%): ${estimateResult.usableAreaSqM} m²`, 14, 59);
    doc.text(`Installable Solar Capacity: ${estimateResult.systemSizeKw} kW (${estimateResult.panelCount} panels @ 540 Wp)`, 14, 66);
    doc.text(`Estimated Annual Generation: ${estimateResult.annualKwh.toLocaleString("en-IN")} kWh / year`, 14, 73);
    doc.text(`Annual CO2 Avoided: ${estimateResult.annualCo2AvoidedTonnes} tonnes / year`, 14, 80);

    doc.line(14, 86, 196, 86);
    doc.setFont("helvetica", "bold");
    doc.text("Financial Model & PM Surya Ghar Subsidy Breakdown", 14, 94);
    doc.setFont("helvetica", "normal");
    doc.text(`Gross Capital Cost: Rs. ${estimateResult.grossCostInr.toLocaleString("en-IN")}`, 14, 102);
    doc.text(`PM Surya Ghar Central Subsidy: Rs. ${estimateResult.subsidy.subsidyAmountInr.toLocaleString("en-IN")}`, 14, 109);
    doc.text(`Net Out-of-Pocket Investment: Rs. ${estimateResult.netCostInr.toLocaleString("en-IN")}`, 14, 116);
    doc.text(`Year 1 Estimated Savings: Rs. ${estimateResult.year1SavingsInr.toLocaleString("en-IN")}`, 14, 123);
    doc.text(`Simple Payback Period: ~${estimateResult.paybackYears} years`, 14, 130);
    doc.text(`25-Year Cumulative Net Gain: Rs. ${estimateResult.twentyFiveYearNetGainInr.toLocaleString("en-IN")}`, 14, 137);

    doc.line(14, 144, 196, 144);
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text("Verification Notice: Central financial assistance applies to residential rooftop systems. Empanelled", 14, 152);
    doc.text("vendors must be verified on the official GEDA and PM Surya Ghar portals (pmsuryaghar.gov.in) before signing.", 14, 157);

    doc.save(`GEDA-Solar-Feasibility-${estimateResult.systemSizeKw}kW.pdf`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-solar-100 text-solar-700 dark:bg-amber-950/40 dark:text-amber-300 text-xs font-semibold border border-solar-200 dark:border-amber-800">
            <Sun className="w-3.5 h-3.5 text-solar-600" />
            Flagship Module B · PM Surya Ghar Yojana
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            "Roof-to-Rupee" Solar Polygon Studio
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Outline your terrace perimeter on satellite imagery to calculate installable capacity, central subsidy, and 10-year break-even.
          </p>
        </div>

        {/* Offline Badge if falling back */}
        {irradianceData && (
          <div className="flex items-center gap-2">
            {irradianceData.isOfflineFallback ? (
              <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 text-xs font-semibold border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Offline Solar Benchmark (Seeded)
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 text-xs font-semibold border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Live Open-Meteo Irradiance ({irradianceData.gridKey})
              </span>
            )}
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 rounded-xl text-xs flex items-center gap-2 border border-rose-200 dark:border-rose-900">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Map Drawing Canvas */}
      <div className="mb-8">
        <SolarMapStudio onPolygonComplete={handlePolygonComplete} />
      </div>

      {/* Loading state indicator */}
      {isEstimating && (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6">
          <Loader2 className="w-8 h-8 animate-spin text-tealbrand-600 mx-auto mb-2" />
          <h3 className="font-semibold text-slate-800 dark:text-white text-sm">
            Evaluating Rooftop Solar Geometry & Financial Yield...
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Running Turf geospatial engine, Open-Meteo GHI curves, and PM Surya Ghar subsidy algorithm
          </p>
        </div>
      )}

      {/* Solar Estimation Results Section */}
      {estimateResult && !isEstimating && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Main Key Figures Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  System Size
                </span>
                <CalculationExplainer
                  details={{
                    title: "Rooftop Sizing Calculation",
                    formula: "Usable = Area × 0.70; System kW = Usable / 10 m²/kW (540 Wp Mono-PERC)",
                    constants: [
                      { name: "Usable Area Ratio", value: 0.7 },
                      { name: "Specific Area", value: 10, unit: "m²/kW" },
                      { name: "Panel Rating", value: 540, unit: "Wp" },
                    ],
                    source: "GEDA Rooftop Sizing & MNRE Benchmark Guidelines",
                    asOf: "2024-03-01",
                  }}
                />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {estimateResult.systemSizeKw} <span className="text-sm font-semibold text-slate-500">kW</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {estimateResult.panelCount} Panels ({estimateResult.usableAreaSqM} m² usable)
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  PM Surya Ghar Subsidy
                </span>
                <CalculationExplainer
                  details={{
                    title: "PM Surya Ghar: Muft Bijli Yojana Central Subsidy",
                    formula: "≤2 kW: ₹30k/kW; 2-3 kW: ₹60k + ₹18k×(kW-2); ≥3 kW: ₹78k cap",
                    constants: [
                      { name: "Tier 1 Rate", value: "₹30,000/kW (up to 2 kW)" },
                      { name: "Tier 2 Rate", value: "₹18,000/kW (2-3 kW)" },
                      { name: "Max Subsidy Cap", value: "₹78,000 (≥3 kW)" },
                    ],
                    source: "MNRE OM No. 318/17/2024-GCRT",
                    asOf: "2024-02-15",
                    officialLink: "https://pmsuryaghar.gov.in",
                  }}
                />
              </div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                ₹{estimateResult.subsidy.subsidyAmountInr.toLocaleString("en-IN")}
              </div>
              <div className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 mt-1">
                {estimateResult.subsidy.isCapped ? "Central CFA Max Cap Reached" : "Direct DBT Subsidy"}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Net Investment
                </span>
                <CalculationExplainer
                  details={{
                    title: "Net Capital Outlay",
                    formula: "Net Cost = Gross Cost (₹55k-60k/kW) − PM Surya Ghar Subsidy",
                    constants: [
                      { name: "Gross Cost", value: estimateResult.grossCostInr, unit: "₹" },
                      { name: "Central Subsidy", value: estimateResult.subsidy.subsidyAmountInr, unit: "₹" },
                    ],
                    source: "GEDA Benchmark System Cost Band",
                    asOf: "2024-01-01",
                  }}
                />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                ₹{estimateResult.netCostInr.toLocaleString("en-IN")}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Gross: ₹{estimateResult.grossCostInr.toLocaleString("en-IN")}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Payback Period
                </span>
                <CalculationExplainer
                  details={{
                    title: "Solar Payback Period",
                    formula: "Payback (Years) = Net Capital Cost / Year 1 Electricity Bill Savings",
                    constants: [
                      { name: "Year 1 Savings", value: estimateResult.year1SavingsInr, unit: "₹/year" },
                      { name: "Degradation Rate", value: "0.5%/year" },
                      { name: "Tariff Escalation", value: "3.0%/year" },
                    ],
                    source: "GERC Net Metering Regulation & Financial Model",
                    asOf: "2024-01-01",
                  }}
                />
              </div>
              <div className="text-2xl font-black text-solar-600 dark:text-amber-400 mt-1">
                ~{estimateResult.paybackYears} <span className="text-sm font-semibold text-slate-500">Yrs</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                ₹{estimateResult.year1SavingsInr.toLocaleString("en-IN")} saved in Year 1
              </div>
            </div>
          </div>

          {/* Sensitivity Toggles Bar */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
              <SlidersHorizontal className="w-4 h-4 text-tealbrand-600" />
              <span>Sensitivity Analysis (Instant Recompute):</span>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cloudierYear}
                  onChange={(e) => {
                    setCloudierYear(e.target.checked);
                    triggerReEstimate(e.target.checked, flatTariff);
                  }}
                  className="rounded text-tealbrand-600 focus:ring-tealbrand-500"
                />
                <span className="text-slate-700 dark:text-slate-300">Cloudier Year (-10% Irradiance)</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={flatTariff}
                  onChange={(e) => {
                    setFlatTariff(e.target.checked);
                    triggerReEstimate(cloudierYear, e.target.checked);
                  }}
                  className="rounded text-tealbrand-600 focus:ring-tealbrand-500"
                />
                <span className="text-slate-700 dark:text-slate-300">Flat Tariff (0% Escalation)</span>
              </label>

              <button
                type="button"
                onClick={handleDownloadPdf}
                className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-xl font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Summary PDF
              </button>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 10-Year Break-Even Curve with ReferenceDot */}
            <SolarBreakEvenChart
              cashFlow={estimateResult.cashFlow10Years}
              netCost={estimateResult.netCostInr}
              breakEvenYear={estimateResult.breakEvenYear}
            />

            {/* Today's Diurnal Solar Curve */}
            {irradianceData && (
              <IrradianceCurveChart
                hourly={irradianceData.hourlyToday}
                currentSolarWp={irradianceData.current.shortwaveRadiation}
              />
            )}
          </div>

          {/* GEDA Empanelled Vendor Directory & Quote Request Modal */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-tealbrand-600" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    GEDA-Empanelled Solar Vendors & Quotation Dispatch
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select a certified Gujarat vendor matching your {estimateResult.systemSizeKw} kW capacity
                </p>
              </div>

              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 text-xs border border-amber-200 dark:border-amber-800">
                Notice: Always verify empanelment ID on the official GEDA portal before contract signing.
              </div>
            </div>

            {leadSuccessMsg && (
              <div className="mb-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs border border-emerald-300 dark:border-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{leadSuccessMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {vendors.slice(0, 6).map((vendor) => (
                <div
                  key={vendor.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-tealbrand-700 dark:text-teal-400 bg-tealbrand-50 dark:bg-tealbrand-950/60 px-2 py-0.5 rounded-full">
                        {vendor.city}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {vendor.empanelmentRef || "GEDA Certified"}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-2">
                      {vendor.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Districts: {vendor.districts}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Capacity: {vendor.minKw} kW – {vendor.maxKw} kW
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                    <span className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {vendor.phone}
                    </span>

                    <button
                      type="button"
                      onClick={() => setSelectedVendor(vendor)}
                      className="px-3 py-1.5 bg-tealbrand-600 hover:bg-tealbrand-700 text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      Request Quote
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Quotation Consent Modal */}
            {selectedVendor && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
                <form
                  onSubmit={handleQuoteRequest}
                  className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl"
                >
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">
                    Request Solar Quote from {selectedVendor.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Your {estimateResult.systemSizeKw} kW feasibility polygon summary will be securely dispatched to this empanelled vendor.
                  </p>

                  <div className="my-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs space-y-1.5 border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-500">System Capacity:</span>
                      <span className="font-bold">{estimateResult.systemSizeKw} kW</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Eligible PM Surya Ghar Subsidy:</span>
                      <span className="font-bold text-emerald-600">₹{estimateResult.subsidy.subsidyAmountInr.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Estimated Net Cost:</span>
                      <span className="font-bold">₹{estimateResult.netCostInr.toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  <label className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentChecked}
                      onChange={(e) => setConsentChecked(e.target.checked)}
                      required
                      className="mt-0.5 rounded text-tealbrand-600 focus:ring-tealbrand-500"
                    />
                    <span>
                      I hereby consent to sharing my rooftop solar polygon feasibility report with this empanelled partner for the purpose of receiving an official site survey & quote.
                    </span>
                  </label>

                  <div className="flex justify-end gap-2 mt-5">
                    <button
                      type="button"
                      onClick={() => setSelectedVendor(null)}
                      className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!consentChecked || isSubmittingLead}
                      className="px-4 py-1.5 bg-tealbrand-600 hover:bg-tealbrand-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                    >
                      {isSubmittingLead ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      Confirm & Dispatch Quote Request
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
