import { describe, it, expect } from "vitest";
import { calculatePmSuryaGharSubsidy } from "../../lib/engine/subsidy";

describe("Subsidy Engine - Golden Test Cases (Appendix A)", () => {
  it("0 kW -> ₹0", () => {
    expect(calculatePmSuryaGharSubsidy(0).subsidyAmountInr).toBe(0);
  });

  it("1 kW -> ₹30,000", () => {
    const res = calculatePmSuryaGharSubsidy(1.0);
    expect(res.subsidyAmountInr).toBe(30000);
    expect(res.isCapped).toBe(false);
  });

  it("2 kW -> ₹60,000", () => {
    const res = calculatePmSuryaGharSubsidy(2.0);
    expect(res.subsidyAmountInr).toBe(60000);
    expect(res.isCapped).toBe(false);
  });

  it("2.5 kW -> ₹69,000", () => {
    const res = calculatePmSuryaGharSubsidy(2.5);
    // 60,000 + 0.5 * 18,000 = 69,000
    expect(res.subsidyAmountInr).toBe(69000);
    expect(res.isCapped).toBe(false);
  });

  it("3 kW -> ₹78,000", () => {
    const res = calculatePmSuryaGharSubsidy(3.0);
    expect(res.subsidyAmountInr).toBe(78000);
    expect(res.isCapped).toBe(false);
  });

  it("7 kW -> ₹78,000 (capped)", () => {
    const res = calculatePmSuryaGharSubsidy(7.0);
    expect(res.subsidyAmountInr).toBe(78000);
    expect(res.isCapped).toBe(true);
  });

  it("10 kW -> ₹78,000 (capped)", () => {
    const res = calculatePmSuryaGharSubsidy(10.0);
    expect(res.subsidyAmountInr).toBe(78000);
    expect(res.isCapped).toBe(true);
  });
});
