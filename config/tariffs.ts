export type Discom =
  | "UGVCL"
  | "DGVCL"
  | "MGVCL"
  | "PGVCL"
  | "TORRENT_POWER";

export interface TariffSlab {
  fromUnit: number;
  toUnit: number | null; // null means unbounded (e.g. >250)
  ratePerKwh: number;
}

export interface TariffPlan {
  discom: Discom;
  asOf: string;
  source: string;
  category: string;
  fixedChargePerMonth: number;
  fuelSurchargePerKwh: number; // FPPPA (Fuel and Power Purchase Price Adjustment)
  electricityDutyPct: number; // percentage, e.g. 15 for 15%
  slabs: TariffSlab[];
}

export const TARIFF_PLANS: Record<Discom, TariffPlan> = {
  UGVCL: {
    discom: "UGVCL",
    asOf: "2024-04-01",
    source: "[ASSUMPTION] GERC Tariff Order for UGVCL FY 2024-25, Category RGP (Residential)",
    category: "RGP_RESIDENTIAL",
    fixedChargePerMonth: 50.0,
    fuelSurchargePerKwh: 2.85,
    electricityDutyPct: 15.0,
    slabs: [
      { fromUnit: 0, toUnit: 50, ratePerKwh: 3.05 },
      { fromUnit: 50, toUnit: 100, ratePerKwh: 3.5 },
      { fromUnit: 100, toUnit: 200, ratePerKwh: 4.15 },
      { fromUnit: 200, toUnit: null, ratePerKwh: 5.2 },
    ],
  },
  DGVCL: {
    discom: "DGVCL",
    asOf: "2024-04-01",
    source: "[ASSUMPTION] GERC Tariff Order for DGVCL FY 2024-25, Category RGP (Residential)",
    category: "RGP_RESIDENTIAL",
    fixedChargePerMonth: 50.0,
    fuelSurchargePerKwh: 2.85,
    electricityDutyPct: 15.0,
    slabs: [
      { fromUnit: 0, toUnit: 50, ratePerKwh: 3.05 },
      { fromUnit: 50, toUnit: 100, ratePerKwh: 3.5 },
      { fromUnit: 100, toUnit: 200, ratePerKwh: 4.15 },
      { fromUnit: 200, toUnit: null, ratePerKwh: 5.2 },
    ],
  },
  MGVCL: {
    discom: "MGVCL",
    asOf: "2024-04-01",
    source: "[ASSUMPTION] GERC Tariff Order for MGVCL FY 2024-25, Category RGP (Residential)",
    category: "RGP_RESIDENTIAL",
    fixedChargePerMonth: 50.0,
    fuelSurchargePerKwh: 2.85,
    electricityDutyPct: 15.0,
    slabs: [
      { fromUnit: 0, toUnit: 50, ratePerKwh: 3.05 },
      { fromUnit: 50, toUnit: 100, ratePerKwh: 3.5 },
      { fromUnit: 100, toUnit: 200, ratePerKwh: 4.15 },
      { fromUnit: 200, toUnit: null, ratePerKwh: 5.2 },
    ],
  },
  PGVCL: {
    discom: "PGVCL",
    asOf: "2024-04-01",
    source: "[ASSUMPTION] GERC Tariff Order for PGVCL FY 2024-25, Category RGP (Residential)",
    category: "RGP_RESIDENTIAL",
    fixedChargePerMonth: 50.0,
    fuelSurchargePerKwh: 2.85,
    electricityDutyPct: 15.0,
    slabs: [
      { fromUnit: 0, toUnit: 50, ratePerKwh: 3.05 },
      { fromUnit: 50, toUnit: 100, ratePerKwh: 3.5 },
      { fromUnit: 100, toUnit: 200, ratePerKwh: 4.15 },
      { fromUnit: 200, toUnit: null, ratePerKwh: 5.2 },
    ],
  },
  TORRENT_POWER: {
    discom: "TORRENT_POWER",
    asOf: "2024-04-01",
    source: "[ASSUMPTION] GERC Tariff Order for Torrent Power (Ahmedabad/Gandhinagar/Surat) FY 2024-25",
    category: "RGP_RESIDENTIAL",
    fixedChargePerMonth: 55.0,
    fuelSurchargePerKwh: 2.95,
    electricityDutyPct: 15.0,
    slabs: [
      { fromUnit: 0, toUnit: 50, ratePerKwh: 3.2 },
      { fromUnit: 50, toUnit: 100, ratePerKwh: 3.65 },
      { fromUnit: 100, toUnit: 200, ratePerKwh: 4.25 },
      { fromUnit: 200, toUnit: null, ratePerKwh: 5.3 },
    ],
  },
};
