import { TariffPlan, TariffSlab } from "../../config/tariffs";

export interface SlabChargeBreakdown {
  slab: TariffSlab;
  unitsInSlab: number;
  ratePerKwh: number;
  charge: number;
}

export interface BillCalculationResult {
  kwh: number;
  energyCharges: number;
  slabBreakdown: SlabChargeBreakdown[];
  fixedCharge: number;
  fuelSurcharge: number;
  subTotal: number;
  electricityDutyPct: number;
  electricityDutyAmount: number;
  totalBill: number;
}

export interface SlabAlert {
  type: "ACTIVE_WARNING" | "HEADS_UP" | "NEXT_MONTH_TARGET" | "NO_ALERT";
  boundaryUnit: number;
  projectedKwh: number;
  remainingDays: number;
  requiredDailyCutKwh: number;
  potentialSavingsInr: number;
  message: string;
  recommendedActionId?: string;
}

export function roundTwo(val: number): number {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

/**
 * Calculates total electricity bill for a given kWh and tariff plan
 * Formula: (Energy Charges + Fixed Charges + kWh * Fuel Surcharge) * (1 + Electricity Duty %)
 */
export function calculateBillForKwh(kwh: number, plan: TariffPlan): BillCalculationResult {
  const units = Math.max(0, kwh);
  let remainingUnits = units;
  let energyCharges = 0;
  const slabBreakdown: SlabChargeBreakdown[] = [];

  for (const slab of plan.slabs) {
    if (remainingUnits <= 0) break;

    const slabCapacity = slab.toUnit !== null ? slab.toUnit - slab.fromUnit : Infinity;
    const unitsInThisSlab = Math.min(remainingUnits, slabCapacity);

    if (unitsInThisSlab > 0) {
      const charge = roundTwo(unitsInThisSlab * slab.ratePerKwh);
      energyCharges += charge;
      slabBreakdown.push({
        slab,
        unitsInSlab: unitsInThisSlab,
        ratePerKwh: slab.ratePerKwh,
        charge,
      });
      remainingUnits -= unitsInThisSlab;
    }
  }

  const fixedCharge = plan.fixedChargePerMonth;
  const fuelSurcharge = roundTwo(units * plan.fuelSurchargePerKwh);
  const subTotal = roundTwo(energyCharges + fixedCharge + fuelSurcharge);
  const dutyMultiplier = (plan.electricityDutyPct ?? 15) / 100;
  const electricityDutyAmount = roundTwo(subTotal * dutyMultiplier);
  const totalBill = roundTwo(subTotal + electricityDutyAmount);

  return {
    kwh: units,
    energyCharges: roundTwo(energyCharges),
    slabBreakdown,
    fixedCharge,
    fuelSurcharge,
    subTotal,
    electricityDutyPct: plan.electricityDutyPct,
    electricityDutyAmount,
    totalBill,
  };
}

/**
 * Projects monthly consumption from MTD readings or fallback
 */
export function projectMonthlyKwh(
  mtdKwh: number,
  daysElapsed: number,
  totalDaysInMonth = 30,
  fallbackMonthlyKwh?: number
): number {
  if (daysElapsed <= 0) {
    return fallbackMonthlyKwh ?? 200;
  }
  const avgDaily = mtdKwh / daysElapsed;
  const remainingDays = Math.max(0, totalDaysInMonth - daysElapsed);
  return roundTwo(mtdKwh + avgDaily * remainingDays);
}

/**
 * Evaluates slab jump conditions and generates actionable alert
 */
export function evaluateSlabJumpAlert(
  projectedKwh: number,
  remainingDays: number,
  plan: TariffPlan,
  daysElapsed = 15
): SlabAlert {
  if (remainingDays <= 0 || projectedKwh <= 0) {
    return {
      type: "NO_ALERT",
      boundaryUnit: 0,
      projectedKwh,
      remainingDays: 0,
      requiredDailyCutKwh: 0,
      potentialSavingsInr: 0,
      message: "Billing cycle complete or zero consumption.",
    };
  }

  // Extract all non-zero slab boundaries in ascending order: e.g. [50, 100, 200]
  const boundaries = plan.slabs
    .map((s) => s.fromUnit)
    .filter((b) => b > 0)
    .sort((a, b) => a - b);

  if (boundaries.length === 0) {
    return {
      type: "NO_ALERT",
      boundaryUnit: 0,
      projectedKwh,
      remainingDays,
      requiredDailyCutKwh: 0,
      potentialSavingsInr: 0,
      message: "Single slab tariff plan.",
    };
  }

  const avgDailyUse = projectedKwh / (daysElapsed + remainingDays);
  // Default max feasible daily reduction is 25% of average daily use
  const maxFeasibleCut = avgDailyUse * 0.25;

  // Check if projectedKwh is approaching or exactly at any boundary from below (within 10% below or exactly at B)
  const approachingBoundary = boundaries.find(
    (b) => projectedKwh <= b && projectedKwh >= b * 0.9
  );
  if (approachingBoundary !== undefined) {
    const bufferUnits = approachingBoundary - projectedKwh;
    return {
      type: "HEADS_UP",
      boundaryUnit: approachingBoundary,
      projectedKwh,
      remainingDays,
      requiredDailyCutKwh: 0,
      potentialSavingsInr: 0,
      message: `Heads-up: You are within ${roundTwo(bufferUnits)} kWh of the ${approachingBoundary}-unit threshold. Maintain your current consumption to avoid a higher slab.`,
      recommendedActionId: "AC_SETPOINT_24_TO_26",
    };
  }

  // Find the highest boundary B that projectedKwh exceeds
  const exceededBoundaries = boundaries.filter((b) => projectedKwh > b);
  const highestExceededBoundary = exceededBoundaries.length > 0 
    ? exceededBoundaries[exceededBoundaries.length - 1] 
    : undefined;

  if (highestExceededBoundary !== undefined) {
    const unitsAbove = projectedKwh - highestExceededBoundary;
    const requiredDailyCut = roundTwo(unitsAbove / remainingDays);
    const billAtProjected = calculateBillForKwh(projectedKwh, plan).totalBill;
    const billAtBoundary = calculateBillForKwh(highestExceededBoundary, plan).totalBill;
    const potentialSavings = roundTwo(Math.max(0, billAtProjected - billAtBoundary));

    if (requiredDailyCut <= maxFeasibleCut) {
      return {
        type: "ACTIVE_WARNING",
        boundaryUnit: highestExceededBoundary,
        projectedKwh,
        remainingDays,
        requiredDailyCutKwh: requiredDailyCut,
        potentialSavingsInr: potentialSavings,
        message: `Reduce ${requiredDailyCut} kWh/day for the next ${remainingDays} days to stay under the ${highestExceededBoundary}-unit slab and save ₹${potentialSavings} this month.`,
        recommendedActionId: "AC_SETPOINT_24_TO_26",
      };
    } else {
      // Infeasible to cut this month, suggest next-month target
      return {
        type: "NEXT_MONTH_TARGET",
        boundaryUnit: highestExceededBoundary,
        projectedKwh,
        remainingDays,
        requiredDailyCutKwh: requiredDailyCut,
        potentialSavingsInr: potentialSavings,
        message: `Projected at ${projectedKwh} kWh (exceeds ${highestExceededBoundary}-unit slab). Target a daily reduction next month to unlock ₹${potentialSavings} in recurring slab savings.`,
        recommendedActionId: "ROOFTOP_SOLAR_INSTALL",
      };
    }
  }

  return {
    type: "NO_ALERT",
    boundaryUnit: boundaries[0],
    projectedKwh,
    remainingDays,
    requiredDailyCutKwh: 0,
    potentialSavingsInr: 0,
    message: `Consumption safely within the lower tariff bracket.`,
  };
}
