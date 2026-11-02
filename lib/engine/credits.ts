import {
  GAMIFICATION_CONFIG,
  TIER_BADGES,
  TierBadge,
} from "../../config/gamification";

export interface LedgerEntry {
  id: string;
  userId: string;
  delta: number;
  reason: string;
  refId?: string;
  createdAt: string | Date;
}

export interface StreakState {
  current: number;
  best: number;
  lastActiveDay: string; // YYYY-MM-DD in IST
  freezesRemaining: number;
}

export interface StreakUpdateResult {
  streak: StreakState;
  streakIncremented: boolean;
  bonusCreditsAwarded: number;
  bonusReason?: string;
}

/**
 * Calculates total balance from ledger entries
 */
export function calculateWalletBalance(entries: { delta: number }[]): number {
  return entries.reduce((acc, curr) => acc + curr.delta, 0);
}

/**
 * Calculates credits earned from a green commute trip respecting daily caps
 */
export function calculateTripCredits(
  kgCo2Saved: number,
  todayExistingTripCredits = 0,
  dailyCap = GAMIFICATION_CONFIG.credits.maxDailyTripCredits
): number {
  if (kgCo2Saved <= 0) return 0;
  const rawCredits = Math.round(kgCo2Saved * GAMIFICATION_CONFIG.credits.tripPerKgCo2Multiplier);
  const remainingCap = Math.max(0, dailyCap - todayExistingTripCredits);
  return Math.min(rawCredits, remainingCap);
}

/**
 * Helper to get IST date string "YYYY-MM-DD"
 */
export function getIstDateString(date: Date = new Date()): string {
  // Convert UTC to IST (+5:30)
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(date.getTime() + istOffsetMs);
  return istDate.toISOString().slice(0, 10);
}

/**
 * Updates citizen streak based on activity date in IST
 */
export function evaluateStreakUpdate(
  currentStreak: StreakState,
  activityDateIst: string
): StreakUpdateResult {
  const { current, best, lastActiveDay, freezesRemaining } = currentStreak;

  if (activityDateIst === lastActiveDay) {
    // Activity already recorded for today, streak holds
    return {
      streak: currentStreak,
      streakIncremented: false,
      bonusCreditsAwarded: 0,
    };
  }

  // Calculate day difference
  const prevDate = new Date(lastActiveDay + "T00:00:00Z");
  const currDate = new Date(activityDateIst + "T00:00:00Z");
  const diffTimeMs = currDate.getTime() - prevDate.getTime();
  const diffDays = Math.round(diffTimeMs / (1000 * 60 * 60 * 24));

  let newCurrent = current;
  let newFreezes = freezesRemaining;
  let bonusCredits = 0;
  let bonusReason: string | undefined;

  if (diffDays === 1) {
    // Consecutive day!
    newCurrent += 1;
  } else if (diffDays === 2 && freezesRemaining > 0) {
    // Streak saved by freeze
    newFreezes -= 1;
    newCurrent += 1;
  } else {
    // Missed streak, reset
    newCurrent = 1;
  }

  // Milestone bonuses
  if (newCurrent === 7 && current < 7) {
    bonusCredits = GAMIFICATION_CONFIG.credits.streakBonus7Days;
    bonusReason = "7-day streak milestone bonus";
  } else if (newCurrent === 30 && current < 30) {
    bonusCredits = GAMIFICATION_CONFIG.credits.streakBonus30Days;
    bonusReason = "30-day streak milestone bonus";
  }

  const newBest = Math.max(best, newCurrent);

  return {
    streak: {
      current: newCurrent,
      best: newBest,
      lastActiveDay: activityDateIst,
      freezesRemaining: newFreezes,
    },
    streakIncremented: newCurrent > current,
    bonusCreditsAwarded: bonusCredits,
    bonusReason,
  };
}

/**
 * Determines current citizen tier badge based on total verified CO2 saved and streak
 */
export function determineUserTier(totalCo2SavedKg: number, streakDays: number): TierBadge {
  // Sorted descending by minCo2SavedKg
  const reverseTiers = [...TIER_BADGES].reverse();
  for (const tier of reverseTiers) {
    if (totalCo2SavedKg >= tier.minCo2SavedKg && streakDays >= tier.minStreakDays) {
      return tier;
    }
  }
  return TIER_BADGES[0];
}

/**
 * Calculates perceptual difference hash (dHash) from an 8x9 grayscale 2D array
 * 8 rows, 9 columns -> 8x8 = 64 bits comparison
 */
export function computeDHashFromGrayscale(pixels8x9: number[][]): string {
  let hashBinary = "";
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const leftPixel = pixels8x9[row]?.[col] ?? 0;
      const rightPixel = pixels8x9[row]?.[col + 1] ?? 0;
      hashBinary += leftPixel < rightPixel ? "1" : "0";
    }
  }
  // Convert 64-bit binary to 16 hex characters
  let hex = "";
  for (let i = 0; i < 64; i += 4) {
    const chunk = hashBinary.substring(i, i + 4);
    hex += parseInt(chunk, 2).toString(16);
  }
  return hex;
}

/**
 * Computes Hamming distance between two hex hashes of equal length
 */
export function computeHammingDistance(hex1: string, hex2: string): number {
  if (hex1.length !== hex2.length) return 64;
  let dist = 0;
  for (let i = 0; i < hex1.length; i++) {
    const val1 = parseInt(hex1[i], 16);
    const val2 = parseInt(hex2[i], 16);
    let xor = val1 ^ val2;
    while (xor > 0) {
      dist += xor & 1;
      xor >>= 1;
    }
  }
  return dist;
}

/**
 * Checks whether an image is considered a duplicate (Hamming distance <= 5)
 */
export function isDuplicateProofImage(newHash: string, existingHashes: string[]): boolean {
  for (const h of existingHashes) {
    if (computeHammingDistance(newHash, h) <= 5) {
      return true;
    }
  }
  return false;
}
