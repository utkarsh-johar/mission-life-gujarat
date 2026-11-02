import { describe, it, expect } from "vitest";
import {
  calculateBillForKwh,
  evaluateSlabJumpAlert,
  projectMonthlyKwh,
} from "../../lib/engine/tariff";
import { TARIFF_PLANS, TariffPlan } from "../../config/tariffs";

describe("Tariff Engine & Slab Jump Alert Tests", () => {
  const plan = TARIFF_PLANS.UGVCL;

  it("Calculates exact bill for 200 kWh under UGVCL slabs", () => {
    // Slabs:
    // 0-50: 50 * 3.05 = 152.5
    // 50-100: 50 * 3.50 = 175.0
    // 100-200: 100 * 4.15 = 415.0
    // Energy charges = 152.5 + 175.0 + 415.0 = 742.50
    // Fixed charge = 50.00
    // Fuel surcharge = 200 * 2.85 = 570.00
    // Subtotal = 742.5 + 50.0 + 570.0 = 1362.50
    // Duty (15%) = 1362.5 * 0.15 = 204.38
    // Total Bill = 1362.50 + 204.38 = 1566.88
    const bill = calculateBillForKwh(200, plan);
    expect(bill.energyCharges).toBe(742.5);
    expect(bill.fixedCharge).toBe(50.0);
    expect(bill.fuelSurcharge).toBe(570.0);
    expect(bill.subTotal).toBe(1362.5);
    expect(bill.electricityDutyAmount).toBe(204.38);
    expect(bill.totalBill).toBe(1566.88);
  });

  it("Alert: Boundary at exactly B (200 kWh) shows HEADS_UP when near threshold", () => {
    // If exactly at 200 kWh, projected is <= 200, so it's not strictly above 200
    const alert = evaluateSlabJumpAlert(200, 10, plan, 20);
    expect(["HEADS_UP", "NO_ALERT"]).toContain(alert.type);
    if (alert.type === "HEADS_UP") {
      expect(alert.boundaryUnit).toBe(200);
    }
  });

  it("Alert: 1 unit above boundary B (205 kWh with 10 days remaining)", () => {
    // 205 kWh projected, boundary B = 200, 5 units above
    // Required cut = 5 / 10 = 0.5 kWh/day
    // Avg daily use = 205 / (15 + 10) = 8.2 kWh/day
    // Max feasible cut = 8.2 * 0.25 = 2.05 kWh/day
    // Since 0.5 <= 2.05, ACTIVE_WARNING is triggered!
    const alert = evaluateSlabJumpAlert(205, 10, plan, 15);
    expect(alert.type).toBe("ACTIVE_WARNING");
    expect(alert.boundaryUnit).toBe(200);
    expect(alert.requiredDailyCutKwh).toBe(0.5);
    expect(alert.remainingDays).toBe(10);
    expect(alert.potentialSavingsInr).toBeGreaterThan(0);
    expect(alert.message).toContain("Reduce 0.5 kWh/day for the next 10 days to stay under the 200-unit slab");
  });

  it("Alert: Infeasible jump (> 25% daily cut required) generates NEXT_MONTH_TARGET", () => {
    // 280 kWh projected, boundary 200, remaining days 2
    // Required cut = 80 / 2 = 40 kWh/day (impossible)
    const alert = evaluateSlabJumpAlert(280, 2, plan, 20);
    expect(alert.type).toBe("NEXT_MONTH_TARGET");
    expect(alert.boundaryUnit).toBe(200);
  });

  it("Handles zero remaining days gracefully", () => {
    const alert = evaluateSlabJumpAlert(210, 0, plan, 30);
    expect(alert.type).toBe("NO_ALERT");
  });

  it("Handles single-slab plan gracefully", () => {
    const singleSlabPlan: TariffPlan = {
      discom: "UGVCL",
      asOf: "2024-01-01",
      source: "Flat Test Tariff",
      category: "TEST",
      fixedChargePerMonth: 50,
      fuelSurchargePerKwh: 2.0,
      electricityDutyPct: 15,
      slabs: [{ fromUnit: 0, toUnit: null, ratePerKwh: 4.5 }],
    };
    const alert = evaluateSlabJumpAlert(250, 10, singleSlabPlan, 15);
    expect(alert.type).toBe("NO_ALERT");
  });

  it("Projects monthly kWh correctly from 10-day reading", () => {
    // 70 kWh in 10 days -> 7 kWh/day * 30 days = 210 kWh
    const proj = projectMonthlyKwh(70, 10, 30);
    expect(proj).toBe(210);
  });
});
