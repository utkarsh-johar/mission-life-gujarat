export type LivingSituation = "HOSTEL" | "APARTMENT" | "HOMEOWNER" | "SHARED_RENTAL";
export type EnergyControlLevel = "NONE" | "PARTIAL" | "FULL";

export interface PersonaProfile {
  id: LivingSituation;
  label: string;
  energyControl: EnergyControlLevel;
  description: string;
  recommendedCategory: string[];
}

export const LIVING_PERSONAS: Record<LivingSituation, PersonaProfile> = {
  HOSTEL: {
    id: "HOSTEL",
    label: "Hostel / Dormitory Student",
    energyControl: "NONE",
    description: "Personal device control only. Focuses on phantom drain, reusable essentials, and communal daylight spaces.",
    recommendedCategory: ["ELECTRONICS", "WATER", "COMMUTE", "AWARENESS"],
  },
  APARTMENT: {
    id: "APARTMENT",
    label: "Rented Apartment Resident",
    energyControl: "PARTIAL",
    description: "Controls internal appliances (AC, washing, fridge), but no roof control for private solar installation.",
    recommendedCategory: ["AC_COOLING", "APPLIANCE_EFFICIENCY", "WASTE_SEGREGATION", "MOBILITY"],
  },
  HOMEOWNER: {
    id: "HOMEOWNER",
    label: "Independent House Owner",
    energyControl: "FULL",
    description: "Full control over rooftop terrace, electrical connections, and high-load heating/cooling appliances.",
    recommendedCategory: ["ROOFTOP_SOLAR", "GRID_SHIFTING", "THERMAL_INSULATION", "RAINWATER"],
  },
  SHARED_RENTAL: {
    id: "SHARED_RENTAL",
    label: "Shared Flat / Tenant",
    energyControl: "PARTIAL",
    description: "Shared utility bills with roommates. Focuses on collective habits and shared conservation.",
    recommendedCategory: ["SHARED_APPLIANCES", "COMMUTE", "FOOD_WASTE"],
  },
};

export interface EcoTask {
  id: string;
  title: string;
  description: string;
  category: "ENERGY" | "MOBILITY" | "WASTE" | "SOLAR" | "HABIT";
  credits: number;
  co2SavedKg: number;
  suitablePersonas: LivingSituation[];
  rationale: string;
}

export const ECO_TASK_CATALOGUE: EcoTask[] = [
  // Hostel Student Friendly
  {
    id: "task-kill-phantom",
    title: "Unplug Idle Laptop & Phone Chargers",
    description: "Disconnect adapters from wall sockets when devices reach 100% to stop phantom vampire draw.",
    category: "ENERGY",
    credits: 15,
    co2SavedKg: 0.35,
    suitablePersonas: ["HOSTEL", "APARTMENT", "SHARED_RENTAL", "HOMEOWNER"],
    rationale: "Requires zero building control; saves continuous baseline phantom drain.",
  },
  {
    id: "task-byob-bottle",
    title: "Carry Reusable Water Flask Today",
    description: "Refill your own metal or glass water bottle today and decline disposable PET plastic bottles.",
    category: "WASTE",
    credits: 10,
    co2SavedKg: 0.18,
    suitablePersonas: ["HOSTEL", "APARTMENT", "SHARED_RENTAL", "HOMEOWNER"],
    rationale: "Prevents high-footprint single-use packaging.",
  },
  {
    id: "task-daylight-study",
    title: "Study or Work near Natural Daylight",
    description: "Sit beside a sunny window or library glass atrium for 2 hours with electric overhead lights off.",
    category: "ENERGY",
    credits: 15,
    co2SavedKg: 0.4,
    suitablePersonas: ["HOSTEL", "APARTMENT", "SHARED_RENTAL", "HOMEOWNER"],
    rationale: "Displaces artificial lighting using Gujarat's abundant solar illuminance.",
  },
  {
    id: "task-stairs-climb",
    title: "Take Stairs Instead of Lift for 3 Floors",
    description: "Climb up and down campus or residential stairs instead of taking the motorized elevator.",
    category: "HABIT",
    credits: 10,
    co2SavedKg: 0.25,
    suitablePersonas: ["HOSTEL", "APARTMENT", "SHARED_RENTAL", "HOMEOWNER"],
    rationale: "Eliminates elevator motor draw and promotes cardiovascular fitness.",
  },

  // Apartment Resident Friendly
  {
    id: "task-ac-setpoint-25",
    title: "Keep AC Setpoint at 24°C–26°C",
    description: "Run air conditioning at 25°C accompanied by a ceiling fan instead of chilling down to 18°C.",
    category: "ENERGY",
    credits: 20,
    co2SavedKg: 1.2,
    suitablePersonas: ["APARTMENT", "HOMEOWNER", "SHARED_RENTAL"],
    rationale: "Each 1°C increase in AC thermostat saves ~6% electricity on Gujarat grids.",
  },
  {
    id: "task-washing-full-load",
    title: "Run Washing Machine on Full Cold Load",
    description: "Wash laundry with a full drum capacity and use cold water cycle to save heating element draw.",
    category: "ENERGY",
    credits: 15,
    co2SavedKg: 0.8,
    suitablePersonas: ["APARTMENT", "HOMEOWNER", "SHARED_RENTAL"],
    rationale: "Reduces run frequency and cuts high-wattage water heating elements.",
  },
  {
    id: "task-wet-waste-compost",
    title: "Separate Kitchen Vegetable Peels for Composting",
    description: "Keep wet organic waste separate from dry recyclable packaging in your kitchen.",
    category: "WASTE",
    credits: 15,
    co2SavedKg: 0.6,
    suitablePersonas: ["APARTMENT", "HOMEOWNER", "SHARED_RENTAL"],
    rationale: "Prevents methane emissions from anaerobic landfill decomposition in municipal sites.",
  },

  // Homeowner Friendly
  {
    id: "task-solar-clean",
    title: "Inspect or Wipe Dust off Rooftop Panels",
    description: "Gently wipe airborne particulate matter and dust off solar PV glass to recover up to 12% lost yield.",
    category: "SOLAR",
    credits: 25,
    co2SavedKg: 2.1,
    suitablePersonas: ["HOMEOWNER"],
    rationale: "Dust and soiling in Gujarat dry seasons significantly degrade daily photovoltaic generation.",
  },
  {
    id: "task-peak-grid-shift",
    title: "Shift Water Pump / Heavy Ironing to Morning",
    description: "Run overhead water pump or electric iron between 9 AM and 3 PM during peak solar generation hours.",
    category: "ENERGY",
    credits: 25,
    co2SavedKg: 1.8,
    suitablePersonas: ["HOMEOWNER", "APARTMENT"],
    rationale: "Relieves evening fossil-fuel peaking plants across Gujarat DISCOMs.",
  },
  {
    id: "task-explore-solar-quote",
    title: "Simulate Rooftop Solar on Roof-to-Rupee Studio",
    description: "Draw your terrace polygon on the GEDA satellite map to estimate PM Surya Ghar ₹78,000 CFA.",
    category: "SOLAR",
    credits: 30,
    co2SavedKg: 3.5,
    suitablePersonas: ["HOMEOWNER", "SHARED_RENTAL"],
    rationale: "Accelerates Gujarat's residential clean energy transition with empanelled vendors.",
  },

  // Mobility
  {
    id: "task-green-commute-share",
    title: "Use BRTS, Metro, or Bicycle for 1 Trip",
    description: "Swap an individual petrol ride with Ahmedabad Janmarg BRTS, Gandhinagar Metro, or a bicycle.",
    category: "MOBILITY",
    credits: 25,
    co2SavedKg: 1.5,
    suitablePersonas: ["HOSTEL", "APARTMENT", "SHARED_RENTAL", "HOMEOWNER"],
    rationale: "Directly displaces fossil tailpipe emissions (132g CO2/km avoided).",
  },
];

export interface EcoTwinStage {
  level: number;
  name: string;
  title: string;
  minPoints: number;
  description: string;
  visualBadges: string[];
  featuresUnlocked: string[];
}

export const ECO_TWIN_STAGES: EcoTwinStage[] = [
  {
    level: 1,
    name: "Barren Atoll",
    title: "Stage 1: The Raw Canvas",
    minPoints: 0,
    description: "A dry, parched island surrounded by haze. Your initial climate awareness begins here.",
    visualBadges: ["Dry soil", "Sparse bush", "Overcast skies"],
    featuresUnlocked: ["Baseline Footprint Audit", "Daily EcoQuests"],
  },
  {
    level: 2,
    name: "Sprouting Haven",
    title: "Stage 2: Green Awakening",
    minPoints: 100,
    description: "Clear skies break through. Fresh saplings sprout and fresh water springs from the rocks.",
    visualBadges: ["Neem & Banyan saplings", "Clear blue sky", "Solar lantern on cottage"],
    featuresUnlocked: ["Streak Heat-Strip", "Discom Slab Alert"],
  },
  {
    level: 3,
    name: "Solar Oasis",
    title: "Stage 3: Solar Sanctuary",
    minPoints: 300,
    description: "Glistening rooftop solar panels power the island. Birdsong returns as clean energy abounds.",
    visualBadges: ["Rooftop solar PV arrays", "Clean freshwater pond", "Flocks of birds"],
    featuresUnlocked: ["Roof-to-Rupee Solar Studio", "Empanelled Vendor Directory"],
  },
  {
    level: 4,
    name: "Clean Mobility City",
    title: "Stage 4: Renewable Microgrid",
    minPoints: 600,
    description: "A spinning wind turbine powers electric trams and bicycles. Zero fossil emissions in sight.",
    visualBadges: ["Spinning Wind Turbine", "Electric BRTS transit", "Lush fruit groves"],
    featuresUnlocked: ["GPS Commute Tracker", "Statewide Ward Scorecard"],
  },
  {
    level: 5,
    name: "Utopian EcoVerse",
    title: "Stage 5: Gujarat LiFE Metropolis",
    minPoints: 1000,
    description: "A thriving, self-sustaining green sanctuary with 100% renewable energy and carbon-negative balance.",
    visualBadges: ["Full microgrid", "Wildlife sanctuary", "Rainbow & solar glow"],
    featuresUnlocked: ["GEDA Official Commendation Certificate", "State Climate Vanguard Rank"],
  },
];

export interface CommunityCircle {
  id: string;
  code: string;
  name: string;
  category: "COLLEGE" | "RESIDENTIAL" | "COMMUNITY";
  location: string;
  membersCount: number;
  totalCo2SavedKg: number;
  topMetricTitle: string;
  topMetricValue: string;
  mostImprovedUser: string;
  streakChamp: string;
}

export const SEEDED_COMMUNITY_CIRCLES: CommunityCircle[] = [
  {
    id: "circ-iitgn",
    code: "IITGN-HOSTEL-4",
    name: "IIT Gandhinagar — Hostel Block 4",
    category: "COLLEGE",
    location: "Palaj, Gandhinagar",
    membersCount: 48,
    totalCo2SavedKg: 840,
    topMetricTitle: "Streak Masters",
    topMetricValue: "18-Day Avg",
    mostImprovedUser: "Pooja V. (+42% Efficiency)",
    streakChamp: "Devendra S. (24 Days)",
  },
  {
    id: "circ-vastrapur",
    code: "VASTRAPUR-GREENS",
    name: "Vastrapur Green Heights Society",
    category: "RESIDENTIAL",
    location: "West Zone, Ahmedabad",
    membersCount: 72,
    totalCo2SavedKg: 1450,
    topMetricTitle: "Peak Shifting Rate",
    topMetricValue: "88% Shifted",
    mostImprovedUser: "Manish Shah (+38% Savings)",
    streakChamp: "Bhavna Patel (31 Days)",
  },
  {
    id: "circ-surat-youth",
    code: "SURAT-ECO-CORPS",
    name: "Surat Tapi River Youth Volunteers",
    category: "COMMUNITY",
    location: "Athwa, Surat",
    membersCount: 35,
    totalCo2SavedKg: 620,
    topMetricTitle: "Plastic-Free Commits",
    topMetricValue: "1,200 Avoided",
    mostImprovedUser: "Karan Desai (+50% Habit Rate)",
    streakChamp: "Sneha Mehta (19 Days)",
  },
];
