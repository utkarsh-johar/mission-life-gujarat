import { describe, it, expect } from "vitest";
import {
  haversineDistanceMeters,
  classifyMobilityMode,
  calculateTripCo2Saved,
  validateTripPlausibility,
} from "../../lib/engine/mobility";

describe("Mobility Engine Unit Tests", () => {
  it("Calculates exact Haversine distance", () => {
    // Vastrapur Lake (23.0353, 72.5283) to Sabarmati Riverfront (23.0305, 72.5701)
    const dist = haversineDistanceMeters(23.0353, 72.5283, 23.0305, 72.5701);
    expect(dist).toBeGreaterThan(4000);
    expect(dist).toBeLessThan(4500);
  });

  it("Classifies walking pace (< 7 km/h 95th percentile)", () => {
    const walkingSpeeds = [4.2, 4.8, 5.1, 5.4, 4.9, 5.0, 5.3, 4.5];
    const res = classifyMobilityMode(walkingSpeeds, 1, 1.2);
    expect(res.mode).toBe("WALK");
    expect(res.requiresUserConfirmation).toBe(false);
  });

  it("Classifies cycling pace (7 to 18 km/h median speed)", () => {
    const cyclingSpeeds = [12.0, 14.5, 13.2, 15.0, 11.8, 14.0];
    const res = classifyMobilityMode(cyclingSpeeds, 2, 4.5);
    expect(res.mode).toBe("CYCLE");
    expect(res.requiresUserConfirmation).toBe(false);
  });

  it("Classifies public transit with stops (18-60 km/h and frequent stops)", () => {
    const transitSpeeds = [25.0, 32.0, 0.0, 28.0, 35.0, 0.0, 26.0];
    const res = classifyMobilityMode(transitSpeeds, 10, 5.0); // 2 stops/km
    expect(res.mode).toBe("PUBLIC_TRANSIT_OR_EV");
    expect(res.requiresUserConfirmation).toBe(true);
  });

  it("Calculates CO2 saved: 5 km cycling vs petrol car baseline (0.171 kg/km)", () => {
    const saved = calculateTripCo2Saved(5, "CYCLE", "CAR_PETROL");
    // 5 * 0.171 = 0.855 -> rounded to 0.86 kg
    expect(saved).toBe(0.86);
  });

  it("Flags unrealistic speeds as SUSPECT", () => {
    const check = validateTripPlausibility(50, 300, 250, "FOSSIL_OR_PRIVATE");
    expect(check.status).toBe("SUSPECT");
    expect(check.issues.length).toBeGreaterThan(0);
  });
});
