export interface EmissionConstant {
  value: number;
  unit: string;
  source: string;
  asOf: string;
}

export const GRID_ELECTRICITY_FACTOR: EmissionConstant = {
  value: 0.82,
  unit: "kg CO2/kWh",
  source: "CEA (Central Electricity Authority) India CO2 Baseline Database v19",
  asOf: "2024-03-31",
};

export const LPG_CYLINDER_FACTOR: EmissionConstant = {
  value: 42.5,
  unit: "kg CO2 per 14.2 kg cylinder",
  source: "Mission LiFE Technical Guidance / MoPNG Carbon Footprint Parameters",
  asOf: "2023-11-01",
};

export const PNG_SCM_FACTOR: EmissionConstant = {
  value: 2.0,
  unit: "kg CO2/SCM",
  source: "[ASSUMPTION] Gujarat Gas / Petroleum Planning & Analysis Cell (PPAC)",
  asOf: "2024-01-01",
};

export type CommuteMode =
  | "WALK"
  | "CYCLE"
  | "TWO_WHEELER"
  | "CAR_PETROL"
  | "CAR_DIESEL"
  | "CAR_CNG"
  | "AUTO_RICKSHAW"
  | "BUS"
  | "METRO_TRAIN"
  | "EV_TWO_WHEELER"
  | "EV_CAR";

export const COMMUTE_EMISSION_FACTORS: Record<CommuteMode, EmissionConstant> = {
  WALK: {
    value: 0,
    unit: "kg CO2/passenger-km",
    source: "Mission LiFE Zero-Emission Active Mobility Benchmark",
    asOf: "2023-01-01",
  },
  CYCLE: {
    value: 0,
    unit: "kg CO2/passenger-km",
    source: "Mission LiFE Zero-Emission Active Mobility Benchmark",
    asOf: "2023-01-01",
  },
  TWO_WHEELER: {
    value: 0.046,
    unit: "kg CO2/passenger-km",
    source: "[ASSUMPTION] ARAI / BEE Fuel Economy Guide (Average 110-125cc scooter/motorcycle, 1.2 pax)",
    asOf: "2023-06-01",
  },
  CAR_PETROL: {
    value: 0.171,
    unit: "kg CO2/passenger-km",
    source: "[ASSUMPTION] India GHG Program / BEE (Average compact petrol hatchback, 1.3 pax occupancy)",
    asOf: "2023-06-01",
  },
  CAR_DIESEL: {
    value: 0.171,
    unit: "kg CO2/passenger-km",
    source: "[ASSUMPTION] India GHG Program (Average diesel passenger vehicle)",
    asOf: "2023-06-01",
  },
  CAR_CNG: {
    value: 0.12,
    unit: "kg CO2/passenger-km",
    source: "[ASSUMPTION] PPAC / ARAI CNG vehicle operational emissions",
    asOf: "2023-06-01",
  },
  AUTO_RICKSHAW: {
    value: 0.09,
    unit: "kg CO2/passenger-km",
    source: "[ASSUMPTION] TERI Urban Mobility Study (CNG Auto-rickshaw with 1.8 average passengers)",
    asOf: "2023-06-01",
  },
  BUS: {
    value: 0.027,
    unit: "kg CO2/passenger-km",
    source: "[ASSUMPTION] AMTS/BRTS Ahmedabad transit efficiency report (standard urban bus occupancy)",
    asOf: "2023-06-01",
  },
  METRO_TRAIN: {
    value: 0.03,
    unit: "kg CO2/passenger-km",
    source: "[ASSUMPTION] Gujarat Metro Rail Corporation (GMRC) operational carbon intensity",
    asOf: "2023-06-01",
  },
  EV_TWO_WHEELER: {
    value: 0.012,
    unit: "kg CO2/passenger-km",
    source: "[ASSUMPTION] Electric 2W grid-charged footprint (0.82 kg/kWh @ 28 Wh/km)",
    asOf: "2024-01-01",
  },
  EV_CAR: {
    value: 0.082,
    unit: "kg CO2/passenger-km",
    source: "[ASSUMPTION] Electric 4W grid-charged footprint (0.82 kg/kWh @ 135 Wh/km with 1.35 pax)",
    asOf: "2024-01-01",
  },
};

export const BENCHMARKS = {
  gujaratPerCapitaMonthlyKg: {
    value: 165.0,
    unit: "kg CO2/capita/month",
    source: "[ASSUMPTION] Gujarat State Climate Change Action Plan & NITI Aayog India Climate Dashboard",
    asOf: "2023-12-31",
  },
  missionLifeTargetMonthlyKg: {
    value: 132.0, // 0.8x benchmark
    unit: "kg CO2/capita/month",
    source: "[ASSUMPTION] Mission LiFE National 20% Intensity Reduction Target",
    asOf: "2023-12-31",
  },
  defaultHouseholdSize: 4,
};
