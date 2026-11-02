export interface NudgeRuleDefinition {
  id: string;
  title: string;
  body: string;
  actionCta: string;
  creditsReward: number;
  source: string;
  asOf: string;
}

export const NUDGE_RULES: Record<string, NudgeRuleDefinition> = {
  AC_OFF_VENT: {
    id: "AC_OFF_VENT",
    title: "AC-Off Natural Ventilation Challenge",
    body: "Outdoor temperature is mild (< 26°C). Switch off air conditioning, open windows for natural airflow, and lower grid demand tonight.",
    actionCta: "Accept AC-Off Challenge",
    creditsReward: 35,
    source: "BEE Energy Efficiency Home Cooling Guidelines",
    asOf: "2024-01-01",
  },
  PEAK_SOLAR_SHIFT: {
    id: "PEAK_SOLAR_SHIFT",
    title: "Peak Solar Load-Shift Challenge",
    body: "Solar irradiance is currently at peak (> 750 W/m²). Run your washing machine, water pump, or EV charging right now to utilize clean solar power.",
    actionCta: "Log Solar Load Shift",
    creditsReward: 40,
    source: "Gujarat Energy Development Agency (GEDA) Demand Side Management",
    asOf: "2024-01-01",
  },
  HIGH_UV_WALK_SHADE: {
    id: "HIGH_UV_WALK_SHADE",
    title: "Sun-Safe & Hydrated Commute",
    body: "UV index is extreme (≥ 8). If walking or cycling, use tree-shaded walkways, carry water, and plan outdoor trips for early morning or dusk.",
    actionCta: "Noted & Hydrated",
    creditsReward: 15,
    source: "IMD (India Meteorological Department) Heat & UV Advisory",
    asOf: "2024-01-01",
  },
  COOL_MORNING_CYCLE: {
    id: "COOL_MORNING_CYCLE",
    title: "Pleasant Morning Active Commute",
    body: "Clear skies and comfortable temperatures (18°C–28°C). A perfect morning to cycle or walk to work or the local market.",
    actionCta: "Start Active Commute",
    creditsReward: 30,
    source: "Mission LiFE Sustainable Mobility Track",
    asOf: "2024-01-01",
  },
  HUMID_FAN_SET: {
    id: "HUMID_FAN_SET",
    title: "Fan + 26°C Optimal Setting",
    body: "Humidity is elevated (> 70%). Set AC to 26°C with ceiling fan on low instead of blasting 20°C. Each 1°C increase saves 6% power.",
    actionCta: "Set AC to 26°C",
    creditsReward: 25,
    source: "Bureau of Energy Efficiency (BEE) 24-26°C Default Campaign",
    asOf: "2024-01-01",
  },
  RAIN_TRANSIT: {
    id: "RAIN_TRANSIT",
    title: "Monsoon Green Transit Challenge",
    body: "High probability of rain (> 60%). Leave the private car at home and choose the BRTS or Metro to ease congestion and reduce emissions.",
    actionCta: "Pledge Public Transit",
    creditsReward: 30,
    source: "GEDA Urban Transit Integration Initiative",
    asOf: "2024-01-01",
  },
  SLAB_ALERT_LINK: {
    id: "SLAB_ALERT_LINK",
    title: "Slab Saver: Immediate Energy Action",
    body: "Your projected consumption is nearing a higher tariff slab. Implement today's energy-saving tips to protect your electricity bill.",
    actionCta: "View Saving Actions",
    creditsReward: 25,
    source: "GERC Domestic Tariff Incentive Structure",
    asOf: "2024-01-01",
  },
};
