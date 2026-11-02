export interface SolarConfig {
  usableAreaRatio: number;
  sqMPerKw: number;
  panelWattageWp: number;
  performanceRatio: number;
  annualDegradationPct: number;
  costPerKwSmallSystem: number; // <= 3 kW
  costPerKwLargeSystem: number; // > 3 kW
  tariffEscalationRatePct: number;
  fallbackAnnualGhiKwhPerM2: number;
  pvWattsBenchmarkMin: number;
  pvWattsBenchmarkMax: number;
  source: string;
  asOf: string;
}

export const SOLAR_ENGINE_CONFIG: SolarConfig = {
  usableAreaRatio: 0.7,
  sqMPerKw: 10.0,
  panelWattageWp: 540,
  performanceRatio: 0.78,
  annualDegradationPct: 0.5,
  costPerKwSmallSystem: 60000,
  costPerKwLargeSystem: 55000,
  tariffEscalationRatePct: 3.0,
  fallbackAnnualGhiKwhPerM2: 1900.0, // approx 5.2 Peak Sun Hours (PSH) in Gujarat
  pvWattsBenchmarkMin: 1400,
  pvWattsBenchmarkMax: 1650,
  source: "GEDA Rooftop Guidelines & MNRE Technical Benchmark Specifications",
  asOf: "2024-03-01",
};

// Seeded average GHI values per city in Gujarat for fallback (kWh/m²/year)
export const GUJARAT_CITY_GHI: Record<string, number> = {
  Ahmedabad: 1940,
  Gandhinagar: 1935,
  Surat: 1880,
  Vadodara: 1910,
  Rajkot: 1990,
  Mehsana: 1950,
  Default: 1920,
};
