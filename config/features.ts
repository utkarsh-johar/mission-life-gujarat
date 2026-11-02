export const FEATURES = {
  demoMode: process.env.NEXT_PUBLIC_DEMO_MODE === "true" || true,
  demoRoleToggle: process.env.NEXT_PUBLIC_DEMO_ROLE_TOGGLE === "true" || true,
  simulationSpeedMultiplier: 5,
  weatherCacheMinutes: 30,
  maxDailyCommuteCredits: 50,
  kAnonymityThreshold: 10, // Ward privacy threshold
};
