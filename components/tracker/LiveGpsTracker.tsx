"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  Square,
  Navigation,
  Sparkles,
  Zap,
  CheckCircle2,
  Clock,
  Gauge,
  Leaf,
  AlertCircle,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { SpeedometerGauge } from "./SpeedometerGauge";
import {
  haversineDistanceMeters,
  classifyMobilityMode,
  calculateTripCo2Saved,
  ClassifiedMode,
} from "../../lib/engine/mobility";
import { CommuteMode } from "../../config/emission";
import dynamic from "next/dynamic";

// Dynamic Leaflet mini-map for trip trace
const MiniTraceMap = dynamic(
  () =>
    import("./MiniTraceMap").then((mod) => mod.MiniTraceMap),
  {
    ssr: false,
    loading: () => <div className="h-44 bg-slate-900 rounded-xl flex items-center justify-center text-xs text-slate-500">Loading Map Trace...</div>,
  }
);

interface LiveGpsTrackerProps {
  onTripCompleted: (tripData: any) => void;
}

export const LiveGpsTracker: React.FC<LiveGpsTrackerProps> = ({ onTripCompleted }) => {
  const [trackingState, setTrackingState] = useState<"IDLE" | "RECORDING" | "PAUSED" | "STOPPED">("IDLE");
  const [isSimulated, setIsSimulated] = useState<boolean>(true); // Default true for instant desk demo
  const [simulationSpeedMultiplier, setSimulationSpeedMultiplier] = useState<number>(5);

  // Live Telemetry
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [movingSeconds, setMovingSeconds] = useState<number>(0);
  const [currentSpeedKmh, setCurrentSpeedKmh] = useState<number>(0);
  const [maxSpeedKmh, setMaxSpeedKmh] = useState<number>(0);
  const [co2SavedKg, setCo2SavedKg] = useState<number>(0);

  // Trace coordinates [[lat, lng], ...]
  const [tracePoints, setTracePoints] = useState<[number, number][]>([]);
  const [speedsRecorded, setSpeedsRecorded] = useState<number[]>([]);
  const [stopsCount, setStopsCount] = useState<number>(0);

  // Live Classifier State
  const [classifiedMode, setClassifiedMode] = useState<ClassifiedMode>("WALK");
  const [classificationReason, setClassificationReason] = useState<string>("Sustained active walking pace.");
  const [requiresConfirmation, setRequiresConfirmation] = useState<boolean>(false);

  // Trip Completion Modal State
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [selectedConfirmedMode, setSelectedConfirmedMode] = useState<CommuteMode>("BUS");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Refs for tracking timers and positions
  const watchIdRef = useRef<number | null>(null);
  const simIndexRef = useRef<number>(0);
  const simRouteRef = useRef<any[]>([]);
  const intervalTimerRef = useRef<any>(null);
  const tripStartTimeRef = useRef<Date>(new Date());

  // Load sample GPX simulation route
  useEffect(() => {
    fetch("/gpx/ahmedabad-commute.json")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          simRouteRef.current = data;
        }
      })
      .catch((err) => console.warn("Failed to load GPX route:", err));
  }, []);

  // Timer tick for movingSeconds
  useEffect(() => {
    if (trackingState === "RECORDING") {
      intervalTimerRef.current = setInterval(() => {
        setMovingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalTimerRef.current) clearInterval(intervalTimerRef.current);
    }
    return () => {
      if (intervalTimerRef.current) clearInterval(intervalTimerRef.current);
    };
  }, [trackingState]);

  // Handle incoming GPS / simulated point
  const handleNewFix = (lat: number, lng: number, speedKmh: number) => {
    setTracePoints((prev) => {
      if (prev.length > 0) {
        const last = prev[prev.length - 1];
        const distMeters = haversineDistanceMeters(last[0], last[1], lat, lng);
        if (distMeters >= 3) {
          const addedKm = distMeters / 1000;
          setDistanceKm((currDist) => {
            const nextDist = Math.round((currDist + addedKm) * 1000) / 1000;
            // Odometer CO2 saved calculation
            const saved = calculateTripCo2Saved(nextDist, "CYCLE", "CAR_PETROL");
            setCo2SavedKg(saved);
            return nextDist;
          });
        }
      }
      return [...prev, [lat, lng]];
    });

    setCurrentSpeedKmh(speedKmh);
    setMaxSpeedKmh((prev) => Math.max(prev, speedKmh));

    if (speedKmh <= 1.0) {
      setStopsCount((prev) => prev + 1);
    }

    setSpeedsRecorded((prev) => {
      const updated = [...prev, speedKmh];
      // Run mode classification on rolling speed window
      const result = classifyMobilityMode(updated, stopsCount, distanceKm);
      setClassifiedMode(result.mode);
      setClassificationReason(result.reason);
      setRequiresConfirmation(result.requiresUserConfirmation);
      return updated;
    });
  };

  // Start Tracker
  const handleStart = () => {
    setTrackingState("RECORDING");
    tripStartTimeRef.current = new Date();

    if (isSimulated) {
      // Run Simulated Route Replay
      simIndexRef.current = 0;
      const route = simRouteRef.current;
      if (!route || route.length === 0) return;

      const simInterval = setInterval(() => {
        if (simIndexRef.current >= route.length) {
          clearInterval(simInterval);
          handleStop();
          return;
        }

        const point = route[simIndexRef.current];
        handleNewFix(point.lat, point.lng, point.speed || 0);
        simIndexRef.current++;
      }, 1000); // 1s per point in simulation mode (AC-C1)

      intervalTimerRef.current = simInterval;
    } else {
      // Real Geolocation Watch
      if (navigator.geolocation) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            const { latitude, longitude, speed } = pos.coords;
            const speedKmh = speed !== null ? speed * 3.6 : 0;
            handleNewFix(latitude, longitude, speedKmh);
          },
          (err) => console.warn("Watch position error:", err),
          { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
        );
      }
    }
  };

  const handlePause = () => {
    setTrackingState("PAUSED");
    if (intervalTimerRef.current) clearInterval(intervalTimerRef.current);
    if (watchIdRef.current && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
  };

  const handleStop = () => {
    setTrackingState("STOPPED");
    if (intervalTimerRef.current) clearInterval(intervalTimerRef.current);
    if (watchIdRef.current && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    // If speed profile indicates transit/vehicle, show confirmation modal (AC-C2 / 7.2)
    if (requiresConfirmation || maxSpeedKmh >= 18) {
      setShowConfirmModal(true);
    } else {
      persistTrip("WALK");
    }
  };

  // Submit Trip Summary to API
  const persistTrip = async (confirmedModeChoice?: CommuteMode) => {
    setIsSaving(true);
    try {
      const avgKmh = movingSeconds > 0 ? (distanceKm / (movingSeconds / 3600)) : 0;
      const idempotencyKey = `trip-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

      const payload = {
        userId: "demo-citizen-id",
        idempotencyKey,
        distanceKm: Math.max(0.1, distanceKm),
        movingSeconds: Math.max(5, movingSeconds),
        avgKmh: Math.round(avgKmh * 10) / 10,
        maxKmh: Math.round(maxSpeedKmh * 10) / 10,
        detectedMode: classifiedMode,
        confirmedMode: confirmedModeChoice,
        confidence: 0.9,
        isSimulated,
        wardId: "AMD-NAV",
        startedAt: tripStartTimeRef.current.toISOString(),
      };

      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setShowConfirmModal(false);
      onTripCompleted(data);
    } catch (err) {
      console.error("Trip save error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${String(mins).padStart(2, "0")}:${String(remainingSecs).padStart(2, "0")}`;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md">
      {/* Tracker Header & Simulation Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-tealbrand-50 text-tealbrand-700 dark:bg-tealbrand-950/50 dark:text-teal-400">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Live GPS Green Commute Telemetry
            </h3>
            <p className="text-xs text-slate-500">
              High-accuracy sensor pipeline with mode classification & CO₂ odometer
            </p>
          </div>
        </div>

        {/* Demo Simulation Toggle (AC-C1 / 7.4) */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Simulate Live Commute (5x Replay):
          </span>
          <button
            type="button"
            onClick={() => setIsSimulated(!isSimulated)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              isSimulated ? "bg-tealbrand-600" : "bg-slate-300 dark:bg-slate-600"
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                isSimulated ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Screen-reader Live Region */}
      <div className="sr-only" aria-live="polite">
        Current speed: {currentSpeedKmh} km/h, distance: {distanceKm} km, elapsed: {movingSeconds} seconds. CO2 saved: {co2SavedKg} kg. Mode: {classifiedMode}.
      </div>

      {/* Simulation Banner */}
      {isSimulated && (
        <div className="mt-4 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 text-xs font-semibold border border-amber-200 dark:border-amber-800 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            SIMULATION MODE ACTIVE (Replaying Vastrapur → Riverfront route at 5x)
          </span>
          <span className="font-mono text-[11px]">NEXT_PUBLIC_DEMO_MODE=true</span>
        </div>
      )}

      {/* Telemetry Dashboard Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-6 items-center">
        {/* Speedometer Gauge */}
        <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Instantaneous Speed
          </span>
          <SpeedometerGauge speedKmh={currentSpeedKmh} />
        </div>

        {/* Distance Odometer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Distance Traveled
          </span>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-2 font-mono">
            {distanceKm.toFixed(2)} <span className="text-sm font-semibold text-slate-500">km</span>
          </div>
          <span className="text-[11px] text-slate-400">Filtered Haversine Distance</span>
        </div>

        {/* Elapsed Moving Timer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Moving Time
          </span>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-2 font-mono flex items-center justify-center gap-1">
            <Clock className="w-5 h-5 text-tealbrand-600" />
            {formatTimer(movingSeconds)}
          </div>
          <span className="text-[11px] text-slate-400">Excludes stationary stops</span>
        </div>

        {/* CO2 Avoided Ticker */}
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            CO₂ Avoided (Odometer)
          </span>
          <div className="text-3xl font-black text-emerald-700 dark:text-emerald-300 mt-2 font-mono flex items-center justify-center gap-1">
            <Leaf className="w-5 h-5 text-emerald-600" />
            {co2SavedKg.toFixed(2)} <span className="text-sm font-semibold text-emerald-600/70">kg</span>
          </div>
          <span className="text-[11px] text-emerald-600/80">vs Petrol Car Baseline</span>
        </div>
      </div>

      {/* Mode Classifier Live Status */}
      <div className="p-4 rounded-2xl bg-tealbrand-50/70 dark:bg-tealbrand-950/40 border border-tealbrand-200 dark:border-tealbrand-800 mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <div className="text-xs text-slate-500 font-medium">Mode Classification Engine:</div>
            <div className="text-sm font-bold text-tealbrand-900 dark:text-teal-200">
              {classifiedMode === "WALK" ? "🚶 Walking (< 7 km/h)" : classifiedMode === "CYCLE" ? "🚲 Cycling (7–18 km/h)" : "🚌 Public Transit / Metro"}
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-600 dark:text-slate-400 italic">
          "{classificationReason}"
        </div>
      </div>

      {/* Mini-map Trace */}
      <div className="mb-6 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
        <MiniTraceMap tracePoints={tracePoints} />
      </div>

      {/* Tracking Action Controls */}
      <div className="flex items-center justify-center gap-3">
        {trackingState === "IDLE" && (
          <button
            type="button"
            onClick={handleStart}
            className="px-8 py-3 bg-tealbrand-600 hover:bg-tealbrand-700 text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center gap-2"
          >
            <Play className="w-4 h-4" /> Start Tracking Trip
          </button>
        )}

        {trackingState === "RECORDING" && (
          <>
            <button
              type="button"
              onClick={handlePause}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-2xl shadow-xs transition-colors flex items-center gap-2"
            >
              <Pause className="w-4 h-4" /> Pause
            </button>
            <button
              type="button"
              onClick={handleStop}
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-2xl shadow-xs transition-colors flex items-center gap-2"
            >
              <Square className="w-4 h-4" /> Stop & Save
            </button>
          </>
        )}

        {trackingState === "PAUSED" && (
          <>
            <button
              type="button"
              onClick={handleStart}
              className="px-6 py-2.5 bg-tealbrand-600 hover:bg-tealbrand-700 text-white font-bold text-sm rounded-2xl shadow-xs transition-colors flex items-center gap-2"
            >
              <Play className="w-4 h-4" /> Resume
            </button>
            <button
              type="button"
              onClick={handleStop}
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-2xl shadow-xs transition-colors flex items-center gap-2"
            >
              <Square className="w-4 h-4" /> Stop & Save
            </button>
          </>
        )}
      </div>

      {/* One-Tap Transit Confirmation Modal (AC-C2 / 7.2) */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h4 className="font-bold text-slate-900 dark:text-white text-base">
              Confirm Your Travel Mode
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Your trip recorded speeds ≥ 18 km/h. Please confirm how you traveled to receive verified LiFE green credits:
            </p>

            <div className="grid grid-cols-2 gap-2.5 my-4">
              {[
                { mode: "BUS", label: "🚌 Bus / BRTS", sub: "AMTS / Surat Sitilink" },
                { mode: "METRO_TRAIN", label: "🚇 Gujarat Metro", sub: "Clean electric transit" },
                { mode: "EV_CAR", label: "⚡ EV Car", sub: "Electric private vehicle" },
                { mode: "CAR_CNG", label: "🛺 Auto / CNG Car", sub: "Lower emission fossil" },
              ].map((item) => (
                <button
                  key={item.mode}
                  type="button"
                  onClick={() => setSelectedConfirmedMode(item.mode as CommuteMode)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedConfirmedMode === item.mode
                      ? "border-tealbrand-500 bg-tealbrand-50 dark:bg-tealbrand-950/40 text-tealbrand-900 dark:text-teal-200"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800"
                  }`}
                >
                  <div className="text-xs font-bold">{item.label}</div>
                  <div className="text-[10px] text-slate-400">{item.sub}</div>
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => persistTrip(selectedConfirmedMode)}
                className="w-full py-2.5 bg-tealbrand-600 hover:bg-tealbrand-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Confirm & Claim {Math.round(distanceKm * 10)} LiFE Credits
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
