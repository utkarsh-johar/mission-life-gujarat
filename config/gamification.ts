export interface TierBadge {
  id: string;
  name: string;
  nameGu: string;
  nameHi: string;
  minCo2SavedKg: number;
  minStreakDays: number;
  description: string;
  color: string;
  icon: string;
}

export const TIER_BADGES: TierBadge[] = [
  {
    id: "BRONZE_SAVER",
    name: "Bronze Saver",
    nameGu: "કાંસ્ય સંરક્ષક",
    nameHi: "कांस्य सेवर",
    minCo2SavedKg: 0,
    minStreakDays: 0,
    description: "Welcome to Mission LiFE Gujarat. You have begun your climate journey.",
    color: "#cd7f32",
    icon: "Shield",
  },
  {
    id: "SILVER_CONSERVER",
    name: "Silver Conserver",
    nameGu: "રજત સંરક્ષક",
    nameHi: "रजत संरक्षक",
    minCo2SavedKg: 50,
    minStreakDays: 7,
    description: "Consistent sustainable choices across energy and daily commute.",
    color: "#94a3b8",
    icon: "Award",
  },
  {
    id: "GOLD_GUARDIAN",
    name: "Gold Guardian",
    nameGu: "સુવર્ણ રક્ષક",
    nameHi: "स्वर्ण अभिभावक",
    minCo2SavedKg: 150,
    minStreakDays: 14,
    description: "High impact citizen actively driving Gujarat's green transition.",
    color: "#f59e0b",
    icon: "Star",
  },
  {
    id: "PLATINUM_PIONEER",
    name: "Platinum Pioneer",
    nameGu: "પ્લેટિનમ અગ્રેસર",
    nameHi: "प्लैटिनम पायनियर",
    minCo2SavedKg: 350,
    minStreakDays: 30,
    description: "Outstanding role model leading neighbourhood climate action.",
    color: "#06b6d4",
    icon: "Zap",
  },
  {
    id: "SURYA_CHAMPION",
    name: "Surya Champion",
    nameGu: "સૂર્ય ચેમ્પિયન",
    nameHi: "सूर्य चैंपियन",
    minCo2SavedKg: 750,
    minStreakDays: 60,
    description: "Gujarat's vanguard of clean energy and sustainable lifestyles.",
    color: "#10b981",
    icon: "Sun",
  },
];

export const GAMIFICATION_CONFIG = {
  credits: {
    baselineAudit: 50,
    roofSaved: 30,
    dailyCheckIn: 5,
    tripPerKgCo2Multiplier: 10,
    maxDailyTripCredits: 50,
    streakBonus7Days: 10,
    streakBonus30Days: 30,
    streakFreezeIntervalDays: 14,
  },
  wardScoringWeights: {
    co2PerActiveUser: 0.45,
    participationRate: 0.35,
    streakHealth: 0.2,
  },
  source: "Mission LiFE Gujarat Citizen Engagement & Incentive Framework",
  asOf: "2024-01-01",
};

export interface RewardItem {
  id: string;
  title: string;
  description: string;
  creditsCost: number;
  category: "VOUCHER" | "MERCH" | "TREE" | "CERTIFICATE";
  partner: string;
  isAvailable: boolean;
}

export const REWARDS_CATALOGUE: RewardItem[] = [
  {
    id: "GEDA_CERTIFICATE",
    title: "Official GEDA Mission LiFE Certificate",
    description: "Personalized PDF state commendation signed by GEDA Director.",
    creditsCost: 100,
    category: "CERTIFICATE",
    partner: "Gujarat Energy Development Agency",
    isAvailable: true,
  },
  {
    id: "LED_BULB_VOUCHER",
    title: "9W UJALA Energy-Efficient LED Bulb (Pack of 2)",
    description: "Redeemable voucher at authorized DISCOM distribution centers.",
    creditsCost: 250,
    category: "VOUCHER",
    partner: "EESL / Gujarat DISCOMs",
    isAvailable: true,
  },
  {
    id: "TREE_PLANTATION",
    title: "Dedicated Neem Tree Planted in Gujarat",
    description: "Planted by Gujarat Forest Department with geo-tagged certificate.",
    creditsCost: 400,
    category: "TREE",
    partner: "Gujarat Forest Department & GEDA",
    isAvailable: true,
  },
  {
    id: "METRO_PASS_DISCOUNT",
    title: "₹100 Ahmedabad/Surat Metro Recharge Voucher",
    description: "Green transit credit towards daily metro commuting.",
    creditsCost: 500,
    category: "VOUCHER",
    partner: "Gujarat Metro Rail Corporation (GMRC)",
    isAvailable: true,
  },
  {
    id: "SOLAR_CONSULTATION",
    title: "Priority Rooftop Solar Feasibility Assessment",
    description: "Free in-person roof inspection by an empanelled solar engineer.",
    creditsCost: 150,
    category: "VOUCHER",
    partner: "Empanelled Solar Partners",
    isAvailable: true,
  },
];
