import { COMMUTE_EMISSION_FACTORS, CommuteMode } from "../../config/emission";

export interface GpsFix {
  lat: number;
  lng: number;
  timestamp: number; // epoch ms
  accuracy?: number; // meters
  speed?: number; // m/s
  altitude?: number;
}

export interface TripRollingStats {
  distanceKm: number;
  movingSeconds: number;
  totalSeconds: number;
  currentSpeedKmh: number;
  avgSpeedKmh: number;
  maxSpeedKmh: number;
  co2SavedKg: number;
}

export type ClassifiedMode =
  | "WALK"
  | "CYCLE"
  | "WALK_OR_CYCLE"
  | "PUBLIC_TRANSIT_OR_EV"
  | "FOSSIL_OR_PRIVATE";

export interface ModeClassificationResult {
  mode: ClassifiedMode;
  confidence: number;
  reason: string;
  requiresUserConfirmation: boolean;
  suggestedModes: CommuteMode[];
}

export interface PlausibilityCheckResult {
  isPlausible: boolean;
  status: "VERIFIED" | "SUSPECT";
  issues: string[];
}

export function roundTwo(val: number): number {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

/**
 * Calculates Haversine great-circle distance between two GPS coordinates in meters
 */
export function haversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Validates a single GPS fix against accuracy limits and timestamp monotonicity
 */
export function isValidFix(fix: GpsFix, previousFix?: GpsFix): boolean {
  if (fix.accuracy !== undefined && fix.accuracy > 50) {
    return false; // Discard high noise fixes > 50m
  }
  if (previousFix && fix.timestamp <= previousFix.timestamp) {
    return false; // Regression in timestamp
  }
  return true;
}

/**
 * Computes moving median for a list of numeric samples
 */
export function computeMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 !== 0) {
    return sorted[mid];
  }
  return (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Computes percentile (e.g. 95th)
 */
export function computePercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = (percentile / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

/**
 * Classifies trip mobility mode based on speed profile, variance and stops
 */
export function classifyMobilityMode(
  speedsKmh: number[],
  stopsCount: number,
  distanceKm: number
): ModeClassificationResult {
  if (speedsKmh.length === 0) {
    return {
      mode: "WALK_OR_CYCLE",
      confidence: 0.5,
      reason: "No motion telemetry recorded yet.",
      requiresUserConfirmation: false,
      suggestedModes: ["WALK", "CYCLE"],
    };
  }

  const vMedian = computeMedian(speedsKmh);
  const v95 = computePercentile(speedsKmh, 95);
  const stopsPerKm = distanceKm > 0 ? stopsCount / distanceKm : 0;

  // Case 1: Walking (< 7 km/h 95th percentile)
  if (v95 < 7) {
    return {
      mode: "WALK",
      confidence: 0.95,
      reason: `Sustained walking pace (95th percentile speed: ${roundTwo(v95)} km/h < 7 km/h).`,
      requiresUserConfirmation: false,
      suggestedModes: ["WALK"],
    };
  }

  // Case 2: Cycling (7 to 18 km/h median speed)
  if (vMedian >= 7 && vMedian < 18) {
    return {
      mode: "CYCLE",
      confidence: 0.88,
      reason: `Cycling pace profile (median speed: ${roundTwo(vMedian)} km/h).`,
      requiresUserConfirmation: false,
      suggestedModes: ["CYCLE"],
    };
  }

  // Case 3: Other sub-18 km/h mixed motion
  if (vMedian < 18) {
    return {
      mode: "WALK_OR_CYCLE",
      confidence: 0.82,
      reason: `Active mobility profile below 18 km/h.`,
      requiresUserConfirmation: false,
      suggestedModes: ["WALK", "CYCLE"],
    };
  }

  // Case 4: Transit candidate (18 - 60 km/h with frequent stops >= 2 stops/km)
  if (vMedian >= 18 && vMedian <= 60 && stopsPerKm >= 1.5) {
    return {
      mode: "PUBLIC_TRANSIT_OR_EV",
      confidence: 0.75,
      reason: `Transit speed profile (${roundTwo(vMedian)} km/h) with frequent urban station stops (${roundTwo(stopsPerKm)} stops/km).`,
      requiresUserConfirmation: true,
      suggestedModes: ["BUS", "METRO_TRAIN", "EV_CAR", "AUTO_RICKSHAW"],
    };
  }

  // Case 5: Higher speed vehicular motion
  return {
    mode: "FOSSIL_OR_PRIVATE",
    confidence: 0.7,
    reason: `Sustained vehicle speed (${roundTwo(vMedian)} km/h) with low urban stop frequency.`,
    requiresUserConfirmation: true,
    suggestedModes: ["EV_CAR", "CAR_PETROL", "CAR_DIESEL", "CAR_CNG"],
  };
}

/**
 * Calculates CO2 saved from a green trip
 * Formula: distanceKm * (baselineFactor - actualModeFactor)
 */
export function calculateTripCo2Saved(
  distanceKm: number,
  actualMode: CommuteMode,
  baselineMode: CommuteMode = "CAR_PETROL"
): number {
  if (distanceKm <= 0) return 0;
  const baselineFactor = COMMUTE_EMISSION_FACTORS[baselineMode]?.value ?? 0.171;
  const actualFactor = COMMUTE_EMISSION_FACTORS[actualMode]?.value ?? 0;
  const savingPerKm = Math.max(0, baselineFactor - actualFactor);
  return roundTwo(distanceKm * savingPerKm);
}

/**
 * Anti-cheat and plausibility validation
 */
export function validateTripPlausibility(
  distanceKm: number,
  movingSeconds: number,
  maxSpeedKmh: number,
  mode: ClassifiedMode
): PlausibilityCheckResult {
  const issues: string[] = [];

  // Implied overall speed
  const overallSpeedKmh = movingSeconds > 0 ? (distanceKm / (movingSeconds / 3600)) : 0;

  if (overallSpeedKmh > 200 || maxSpeedKmh > 200) {
    issues.push("Teleportation or aviation speed anomaly (> 200 km/h)");
  }

  if (mode === "WALK" && maxSpeedKmh > 15) {
    issues.push("Sustained speed exceeds human running/walking limits (> 15 km/h)");
  }

  if (distanceKm > 150 && movingSeconds < 1800) {
    issues.push("Unrealistic distance traveled in short duration");
  }

  const isPlausible = issues.length === 0;
  return {
    isPlausible,
    status: isPlausible ? "VERIFIED" : "SUSPECT",
    issues,
  };
}
