import { describe, it, expect } from "vitest";
import {
  calculateElectricityCarbon,
  calculateCookingCarbon,
  calculateCommuteCarbon,
  calculateFootprint,
} from "../../lib/engine/carbon";

describe("Carbon Engine - Golden Test Cases (Appendix A)", () => {
  it("Electricity: 200 kWh -> 164.00 kg CO2", () => {
    const result = calculateElectricityCarbon(200);
    expect(result).toBe(164.0);
  });

  it("LPG: 6 cylinders/yr -> (6/12) * 42.5 = 21.25 kg/month", () => {
    const result = calculateCookingCarbon("LPG", 6, 0);
    expect(result).toBe(21.25);
  });

  it("PNG: 15 SCM/month -> 30.00 kg CO2", () => {
    const result = calculateCookingCarbon("PNG", 0, 15);
    expect(result).toBe(30.0);
  });

  it("Commute: 20 km/day * 26 days, petrol car (0.171) -> 88.92 kg/month", () => {
    const result = calculateCommuteCarbon("CAR_PETROL", 20, 26);
    expect(result).toBe(88.92);
  });

  it("Active commute: Walk & Cycle produce 0 emissions", () => {
    expect(calculateCommuteCarbon("WALK", 10, 26)).toBe(0);
    expect(calculateCommuteCarbon("CYCLE", 15, 26)).toBe(0);
  });

  it("Combined footprint calculation with benchmarks and actions", () => {
    const footprint = calculateFootprint({
      monthlyKwh: 200,
      cookingFuel: "LPG",
      lpgCylindersPerYear: 6,
      commuteMode: "CAR_PETROL",
      dailyKm: 20,
      workingDaysPerMonth: 26,
      householdSize: 4,
    });

    // 164.00 + 21.25 + 88.92 = 274.17
    expect(footprint.monthly.electricity).toBe(164.0);
    expect(footprint.monthly.cooking).toBe(21.25);
    expect(footprint.monthly.commute).toBe(88.92);
    expect(footprint.monthly.total).toBe(274.17);
    expect(footprint.perCapita.perPerson).toBe(68.54); // 274.17 / 4
    expect(footprint.percentileLabel).toBe("BELOW_TARGET"); // 68.54 < 132.0 target
    expect(footprint.topReductionActions.length).toBeGreaterThanOrEqual(2);
  });
});
