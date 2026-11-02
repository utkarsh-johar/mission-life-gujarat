import {
  GRID_ELECTRICITY_FACTOR,
  LPG_CYLINDER_FACTOR,
  PNG_SCM_FACTOR,
  COMMUTE_EMISSION_FACTORS,
  BENCHMARKS,
  CommuteMode,
} from "../../config/emission";
import { REDUCTION_ACTION_TEMPLATES } from "../../config/actions";

export interface CarbonAuditInput {
  monthlyKwh: number;
  cookingFuel: "LPG" | "PNG" | "ELECTRIC" | "OTHER";
  lpgCylindersPerYear?: number;
  pngScmPerMonth?: number;
  commuteMode: CommuteMode;
  dailyKm: number;
  workingDaysPerMonth?: number;
  householdSize?: number;
}

export interface ComputedAction {
  id: string;
  title: string;
  description: string;
  category: "COOLING" | "MOBILITY" | "SOLAR" | "COOKING" | "LIGHTING";
  kgCo2SavedPerMonth: number;
  moneySavedPerMonthInr?: number;
  source: string;
}

export interface Footprint {
  monthly: {
    electricity: number;
    cooking: number;
    commute: number;
    total: number;
  };
  annualTotalTonnes: number;
  perCapita: {
    household: number;
    perPerson: number;
  };
  benchmark: {
    gujaratPerCapita: number;
    missionLifeTarget: number;
  };
  percentileLabel: "BELOW_TARGET" | "BELOW_AVERAGE" | "ABOVE_AVERAGE";
  topReductionActions: ComputedAction[];
}

export function roundTwo(val: number): number {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

export function calculateElectricityCarbon(monthlyKwh: number): number {
  if (monthlyKwh < 0) return 0;
  return roundTwo(monthlyKwh * GRID_ELECTRICITY_FACTOR.value);
}

export function calculateCookingCarbon(
  fuel: "LPG" | "PNG" | "ELECTRIC" | "OTHER",
  lpgCylindersPerYear = 0,
  pngScmPerMonth = 0
): number {
  if (fuel === "LPG") {
    const monthlyCylinders = Math.max(0, lpgCylindersPerYear) / 12;
    return roundTwo(monthlyCylinders * LPG_CYLINDER_FACTOR.value);
  }
  if (fuel === "PNG") {
    return roundTwo(Math.max(0, pngScmPerMonth) * PNG_SCM_FACTOR.value);
  }
  // Electric cooking emissions are already counted inside electricity if metered together
  return 0;
}

export function calculateCommuteCarbon(
  mode: CommuteMode,
  dailyKm: number,
  workingDays = 26
): number {
  if (dailyKm <= 0 || workingDays <= 0) return 0;
  const factor = COMMUTE_EMISSION_FACTORS[mode]?.value ?? 0;
  return roundTwo(dailyKm * workingDays * factor);
}

export function calculateFootprint(input: CarbonAuditInput): Footprint {
  const electricity = calculateElectricityCarbon(input.monthlyKwh);
  const cooking = calculateCookingCarbon(
    input.cookingFuel,
    input.lpgCylindersPerYear ?? 0,
    input.pngScmPerMonth ?? 0
  );
  const workingDays = input.workingDaysPerMonth ?? 26;
  const commute = calculateCommuteCarbon(input.commuteMode, input.dailyKm, workingDays);

  const total = roundTwo(electricity + cooking + commute);
  const annualTotalTonnes = roundTwo((total * 12) / 1000);

  const householdSize = Math.max(1, input.householdSize ?? BENCHMARKS.defaultHouseholdSize);
  const perPerson = roundTwo(total / householdSize);

  const gujaratPerCapita = BENCHMARKS.gujaratPerCapitaMonthlyKg.value;
  const missionLifeTarget = BENCHMARKS.missionLifeTargetMonthlyKg.value;

  let percentileLabel: "BELOW_TARGET" | "BELOW_AVERAGE" | "ABOVE_AVERAGE";
  if (perPerson <= missionLifeTarget) {
    percentileLabel = "BELOW_TARGET";
  } else if (perPerson <= gujaratPerCapita) {
    percentileLabel = "BELOW_AVERAGE";
  } else {
    percentileLabel = "ABOVE_AVERAGE";
  }

  // Derive top ranked reduction actions dynamically
  const potentialActions: ComputedAction[] = [];

  // Action 1: Commute shift to Bus or Metro (if not already walking/cycling/transit)
  if (!["WALK", "CYCLE", "BUS", "METRO_TRAIN"].includes(input.commuteMode) && input.dailyKm > 0) {
    const transitFactor = COMMUTE_EMISSION_FACTORS.METRO_TRAIN.value;
    const currentCommuteMonthly = commute;
    const altCommuteMonthly = calculateCommuteCarbon("METRO_TRAIN", input.dailyKm, workingDays);
    const saved = roundTwo(Math.max(0, currentCommuteMonthly - altCommuteMonthly));
    if (saved > 0) {
      potentialActions.push({
        id: "SWITCH_TO_METRO_OR_BUS",
        title: `Switch ${input.dailyKm} km/day commute to Metro / BRTS`,
        description: `Taking the metro or bus instead of ${input.commuteMode.toLowerCase().replace("_", " ")} saves ${saved} kg CO2/month.`,
        category: "MOBILITY",
        kgCo2SavedPerMonth: saved,
        source: "Mission LiFE Urban Mobility Guidance",
      });
    }
  }

  // Action 2: Solar Rooftop adoption (saves ~80% of electricity footprint)
  if (input.monthlyKwh > 50) {
    const solarSavedKg = roundTwo(electricity * 0.85);
    const annualTonnes = roundTwo((solarSavedKg * 12) / 1000);
    potentialActions.push({
      id: "ROOFTOP_SOLAR_INSTALL",
      title: "Install Rooftop Solar with PM Surya Ghar Subsidy",
      description: `Generating clean solar power saves approx ${solarSavedKg} kg CO2/month (~${annualTonnes} tonnes/year) and up to 90% of your bill.`,
      category: "SOLAR",
      kgCo2SavedPerMonth: solarSavedKg,
      source: "PM Surya Ghar & GEDA",
    });
  }

  // Action 3: Air Conditioner set-point +2°C (assumes ~40% of electricity is cooling in Gujarat climates)
  if (input.monthlyKwh > 100) {
    const coolingKwh = input.monthlyKwh * 0.4;
    const savedKwh = coolingKwh * 0.12;
    const savedKg = roundTwo(savedKwh * GRID_ELECTRICITY_FACTOR.value);
    potentialActions.push({
      id: "AC_SETPOINT_24_TO_26",
      title: "Set Air Conditioner to 26°C with Ceiling Fan",
      description: `Raising AC thermostat by 2°C reduces compressor load by 12%, saving ~${Math.round(savedKwh)} kWh/month and ${savedKg} kg CO2.`,
      category: "COOLING",
      kgCo2SavedPerMonth: savedKg,
      source: "BEE India Standard",
    });
  }

  // Action 4: Active mobility for short trips
  if (input.dailyKm > 2 && !["WALK", "CYCLE"].includes(input.commuteMode)) {
    const activeSavedKg = roundTwo(2 * workingDays * (COMMUTE_EMISSION_FACTORS[input.commuteMode]?.value ?? 0.05));
    if (activeSavedKg > 0) {
      potentialActions.push({
        id: "ACTIVE_MOBILITY_SHORT_TRIPS",
        title: "Walk or Cycle for Short Errands (< 2 km)",
        description: `Replacing short vehicle starts with walking/cycling saves ~${activeSavedKg} kg CO2/month and promotes health.`,
        category: "MOBILITY",
        kgCo2SavedPerMonth: activeSavedKg,
        source: "CPCB Urban Air Quality Action Plan",
      });
    }
  }

  // Rank by highest kg CO2 saved per month, take top 3
  potentialActions.sort((a, b) => b.kgCo2SavedPerMonth - a.kgCo2SavedPerMonth);
  const topReductionActions = potentialActions.slice(0, 3);

  return {
    monthly: {
      electricity,
      cooking,
      commute,
      total,
    },
    annualTotalTonnes,
    perCapita: {
      household: total,
      perPerson,
    },
    benchmark: {
      gujaratPerCapita,
      missionLifeTarget,
    },
    percentileLabel,
    topReductionActions,
  };
}
