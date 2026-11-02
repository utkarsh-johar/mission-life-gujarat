export interface ReductionActionTemplate {
  id: string;
  category: "COOLING" | "MOBILITY" | "SOLAR" | "COOKING" | "LIGHTING";
  title: string;
  descriptionTemplate: string;
  savingPercentEstimated?: number; // e.g. 12% on cooling
  source: string;
  asOf: string;
}

export const REDUCTION_ACTION_TEMPLATES: ReductionActionTemplate[] = [
  {
    id: "AC_SETPOINT_24_TO_26",
    category: "COOLING",
    title: "Set Air Conditioner to 26°C with Ceiling Fan",
    descriptionTemplate: "Raising thermostat by 2°C (from 24°C to 26°C) reduces cooling compressor load by 12% (~{kwh} kWh/month saved).",
    savingPercentEstimated: 12,
    source: "BEE India 24°C Default Setting Standard",
    asOf: "2023-01-01",
  },
  {
    id: "SWITCH_TO_METRO_OR_BUS",
    category: "MOBILITY",
    title: "Switch {km} km/day Commute to Metro or Bus",
    descriptionTemplate: "Using electric metro or public bus saves approximately {savedKg} kg CO2 each month compared to single-occupancy driving.",
    source: "Mission LiFE Urban Mobility Guidance",
    asOf: "2023-06-01",
  },
  {
    id: "ROOFTOP_SOLAR_INSTALL",
    category: "SOLAR",
    title: "Install Rooftop Solar with PM Surya Ghar Subsidy",
    descriptionTemplate: "Generate clean power on your terrace to wipe out up to 90% of your electricity bill and avoid ~{savedTonnes} tonnes of CO2/year.",
    source: "PM Surya Ghar Scheme & GEDA",
    asOf: "2024-02-15",
  },
  {
    id: "ACTIVE_MOBILITY_SHORT_TRIPS",
    category: "MOBILITY",
    title: "Walk or Cycle for Short Neighborhood Errands (< 3 km)",
    descriptionTemplate: "Eliminates petrol motorcycle cold starts, saving ~{savedKg} kg CO2/month and keeping local air clean.",
    source: "CPCB Urban Air Quality Action Plan",
    asOf: "2023-01-01",
  },
  {
    id: "INDUCTION_PNG_OPTIMIZATION",
    category: "COOKING",
    title: "Optimize Cooking Fuel with High-Efficiency Induction",
    descriptionTemplate: "Induction cooktops operate at 85%+ thermal efficiency vs 40% for gas burners, saving emissions and money.",
    source: "BEE Clean Cooking Mission",
    asOf: "2023-09-01",
  },
];
