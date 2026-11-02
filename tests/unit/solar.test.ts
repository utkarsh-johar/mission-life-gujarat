import { describe, it, expect } from "vitest";
import { calculateSolarEstimate } from "../../lib/engine/solar";
import { TARIFF_PLANS } from "../../config/tariffs";

describe("Solar Engine - Golden Test Cases (Appendix A)", () => {
  it("100 m² roof -> usable 70 m², 7.0 kW, 13 panels, subsidy ₹78,000", () => {
    const res = calculateSolarEstimate({
      totalPolygonAreaSqM: 100,
      peakSunHoursPerDay: 5.2,
      monthlyKwhConsumption: 250,
      tariffPlan: TARIFF_PLANS.UGVCL,
    });

    expect(res.areaSqM).toBe(100);
    expect(res.usableAreaSqM).toBe(70.0);
    expect(res.systemSizeKw).toBe(7.0);
    // 7000 W / 540 Wp = 12.96 -> ceil is 13
    expect(res.panelCount).toBe(13);
    expect(res.subsidy.subsidyAmountInr).toBe(78000);
    expect(res.subsidy.isCapped).toBe(true);

    // Capital cost: 7.0 * 55000 = 385000; netCost = 385000 - 78000 = 307000
    expect(res.grossCostInr).toBe(385000);
    expect(res.netCostInr).toBe(307000);

    // Generation: 7.0 * 5.2 * 365 * 0.78 = 10363.08 kWh
    expect(res.annualKwh).toBeCloseTo(10363.08, 1);
    expect(res.paybackYears).toBeGreaterThan(0);
    expect(res.cashFlow10Years.length).toBe(10);
    expect(res.breakEvenYear).toBeGreaterThan(0);
  });

  it("Handles small 20 m² roof (1.4 kW capacity, small system cost tier)", () => {
    const res = calculateSolarEstimate({
      totalPolygonAreaSqM: 20,
      peakSunHoursPerDay: 5.0,
    });
    // 20 * 0.70 = 14 m² -> 1.4 kW -> rounded down to 1.0 kW
    expect(res.usableAreaSqM).toBe(14);
    expect(res.systemSizeKw).toBe(1.0);
    expect(res.panelCount).toBe(2);
    expect(res.subsidy.subsidyAmountInr).toBe(30000);
    expect(res.grossCostInr).toBe(60000); // 1.0 * 60,000
    expect(res.netCostInr).toBe(30000);
  });

  it("Cloudier year sensitivity reduces generation by ~10%", () => {
    const standard = calculateSolarEstimate({
      totalPolygonAreaSqM: 100,
      peakSunHoursPerDay: 5.0,
      sensitivityCloudierYear: false,
    });
    const cloudy = calculateSolarEstimate({
      totalPolygonAreaSqM: 100,
      peakSunHoursPerDay: 5.0,
      sensitivityCloudierYear: true,
    });

    expect(cloudy.annualKwh).toBeLessThan(standard.annualKwh);
    expect(cloudy.annualKwh / standard.annualKwh).toBeCloseTo(0.9, 2);
  });
});
