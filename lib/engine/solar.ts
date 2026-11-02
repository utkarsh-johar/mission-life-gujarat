import { SOLAR_ENGINE_CONFIG, SolarConfig } from "../../config/solar";
import { GRID_ELECTRICITY_FACTOR } from "../../config/emission";
import { TariffPlan } from "../../config/tariffs";
import { calculatePmSuryaGharSubsidy, SubsidyBreakdown } from "./subsidy";
import { calculateBillForKwh } from "./tariff";

export interface SolarEstimateInput {
  totalPolygonAreaSqM: number;
  peakSunHoursPerDay?: number;
  monthlyKwhConsumption?: number;
  tariffPlan?: TariffPlan;
  sensitivityCloudierYear?: boolean; // -10% irradiance
  sensitivityFlatTariff?: boolean; // 0% tariff escalation
  config?: SolarConfig;
}

export interface CashFlowYear {
  year: number;
  generationKwh: number;
  savingsInr: number;
  cumulativeSavingsInr: number;
  netGainInr: number; // cumulativeSavings - netCost
}

export interface SolarEstimateResult {
  areaSqM: number;
  areaSqFt: number;
  usableAreaSqM: number;
  systemSizeKwRaw: number;
  systemSizeKw: number; // rounded down to nearest 0.5 kW
  panelCount: number;
  peakSunHoursPerDay: number;
  annualKwh: number;
  annualCo2AvoidedKg: number;
  annualCo2AvoidedTonnes: number;
  grossCostInr: number;
  subsidy: SubsidyBreakdown;
  netCostInr: number;
  year1SavingsInr: number;
  paybackYears: number;
  tenYearNetGainInr: number;
  twentyFiveYearNetGainInr: number;
  cashFlow10Years: CashFlowYear[];
  breakEvenYear: number;
  pvWattsWarning?: string;
}

export function roundTwo(val: number): number {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

/**
 * Sizes rooftop solar and evaluates 25-year financial performance
 */
export function calculateSolarEstimate(input: SolarEstimateInput): SolarEstimateResult {
  const cfg = input.config ?? SOLAR_ENGINE_CONFIG;
  const areaSqM = Math.max(0, input.totalPolygonAreaSqM);
  const areaSqFt = roundTwo(areaSqM * 10.7639);

  // 70% usable roof area
  const usableAreaSqM = roundTwo(areaSqM * cfg.usableAreaRatio);

  // 10 m² per kW (540 Wp Mono-PERC panels)
  const systemSizeKwRaw = roundTwo(usableAreaSqM / cfg.sqMPerKw);

  // Round down to nearest 0.5 kW for installable capacity
  let systemSizeKw = Math.floor(systemSizeKwRaw * 2) / 2;
  if (systemSizeKw < 0.5 && systemSizeKwRaw >= 0.5) {
    systemSizeKw = 0.5;
  }

  // Panel count: ceil(kW * 1000 / 540)
  const panelCount = systemSizeKw > 0 ? Math.ceil((systemSizeKw * 1000) / cfg.panelWattageWp) : 0;

  // Peak Sun Hours (PSH) per day
  let psh = input.peakSunHoursPerDay ?? cfg.fallbackAnnualGhiKwhPerM2 / 365;
  if (input.sensitivityCloudierYear) {
    psh *= 0.9; // 10% lower solar yield
  }
  psh = roundTwo(psh);

  // Annual Generation in Year 1 = kW * PSH * 365 * Performance Ratio (0.78)
  const annualKwh = roundTwo(systemSizeKw * psh * 365 * cfg.performanceRatio);
  const annualCo2AvoidedKg = roundTwo(annualKwh * GRID_ELECTRICITY_FACTOR.value);
  const annualCo2AvoidedTonnes = roundTwo(annualCo2AvoidedKg / 1000);

  // Benchmarking check vs PVWatts
  const specificYield = systemSizeKw > 0 ? annualKwh / systemSizeKw : 0;
  let pvWattsWarning: string | undefined;
  if (systemSizeKw > 0) {
    if (specificYield < cfg.pvWattsBenchmarkMin) {
      pvWattsWarning = `Computed generation (${Math.round(specificYield)} kWh/kWp/yr) is lower than Gujarat standard range (1400–1650 kWh/kWp/yr).`;
    } else if (specificYield > cfg.pvWattsBenchmarkMax * 1.25) {
      pvWattsWarning = `Computed generation (${Math.round(specificYield)} kWh/kWp/yr) deviates >25% above Gujarat standard range.`;
    }
  }

  // Capital Cost Model
  const costPerKw = systemSizeKw <= 3 ? cfg.costPerKwSmallSystem : cfg.costPerKwLargeSystem;
  const grossCostInr = roundTwo(systemSizeKw * costPerKw);
  const subsidy = calculatePmSuryaGharSubsidy(systemSizeKw);
  const netCostInr = roundTwo(Math.max(0, grossCostInr - subsidy.subsidyAmountInr));

  // Savings in Year 1
  let year1SavingsInr = 0;
  if (input.monthlyKwhConsumption !== undefined && input.tariffPlan !== undefined && input.monthlyKwhConsumption > 0) {
    const annualConsumption = input.monthlyKwhConsumption * 12;
    const billBefore = calculateBillForKwh(input.monthlyKwhConsumption, input.tariffPlan).totalBill * 12;

    const netMonthlyConsumption = Math.max(0, input.monthlyKwhConsumption - annualKwh / 12);
    const billAfter = calculateBillForKwh(netMonthlyConsumption, input.tariffPlan).totalBill * 12;

    year1SavingsInr = roundTwo(Math.max(0, billBefore - billAfter));
  } else {
    // Blended tariff fallback (~₹6.50/kWh in Gujarat residential)
    const blendedTariff = 6.5;
    year1SavingsInr = roundTwo(annualKwh * blendedTariff);
  }

  // Multi-Year Financial Cash Flow (10 Years and 25 Years)
  const escalationRate = input.sensitivityFlatTariff ? 0 : cfg.tariffEscalationRatePct / 100;
  const degradationRate = cfg.annualDegradationPct / 100;

  const cashFlow10Years: CashFlowYear[] = [];
  let cumulativeSavings = 0;
  let breakEvenYear = 0;

  for (let year = 1; year <= 10; year++) {
    // Generation degraded by 0.5% each year after year 1
    const genDegradationFactor = Math.pow(1 - degradationRate, year - 1);
    const yearGen = roundTwo(annualKwh * genDegradationFactor);

    // Tariff escalated by 3% each year
    const tariffEscalationFactor = Math.pow(1 + escalationRate, year - 1);
    const yearSavings = roundTwo(year1SavingsInr * genDegradationFactor * tariffEscalationFactor);

    cumulativeSavings = roundTwo(cumulativeSavings + yearSavings);
    const netGain = roundTwo(cumulativeSavings - netCostInr);

    if (breakEvenYear === 0 && cumulativeSavings >= netCostInr) {
      breakEvenYear = year;
    }

    cashFlow10Years.push({
      year,
      generationKwh: yearGen,
      savingsInr: yearSavings,
      cumulativeSavingsInr: cumulativeSavings,
      netGainInr: netGain,
    });
  }

  // Calculate 25 year net gain
  let cumSavings25 = cumulativeSavings;
  for (let year = 11; year <= 25; year++) {
    const genFactor = Math.pow(1 - degradationRate, year - 1);
    const tariffFactor = Math.pow(1 + escalationRate, year - 1);
    const yearSavings = roundTwo(year1SavingsInr * genFactor * tariffFactor);
    cumSavings25 = roundTwo(cumSavings25 + yearSavings);
  }
  const twentyFiveYearNetGainInr = roundTwo(cumSavings25 - netCostInr);
  const tenYearNetGainInr = roundTwo(cumulativeSavings - netCostInr);

  // Simple payback period (years with 1 decimal)
  const paybackYears =
    year1SavingsInr > 0 ? roundTwo(netCostInr / year1SavingsInr) : breakEvenYear > 0 ? breakEvenYear : 25;

  return {
    areaSqM,
    areaSqFt,
    usableAreaSqM,
    systemSizeKwRaw,
    systemSizeKw,
    panelCount,
    peakSunHoursPerDay: psh,
    annualKwh,
    annualCo2AvoidedKg,
    annualCo2AvoidedTonnes,
    grossCostInr,
    subsidy,
    netCostInr,
    year1SavingsInr,
    paybackYears,
    tenYearNetGainInr,
    twentyFiveYearNetGainInr,
    cashFlow10Years,
    breakEvenYear: breakEvenYear || Math.ceil(paybackYears),
    pvWattsWarning,
  };
}
