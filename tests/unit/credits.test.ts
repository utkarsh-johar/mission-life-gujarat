import { describe, it, expect } from "vitest";
import {
  calculateWalletBalance,
  calculateTripCredits,
  evaluateStreakUpdate,
  determineUserTier,
  computeDHashFromGrayscale,
  computeHammingDistance,
  isDuplicateProofImage,
} from "../../lib/engine/credits";

describe("Credits & Gamification Engine Unit Tests", () => {
  it("Calculates append-only wallet balance correctly", () => {
    const entries = [
      { delta: 50 }, // baseline audit
      { delta: 25 }, // habit log
      { delta: -100 }, // redemption
      { delta: 40 }, // challenge
    ];
    expect(calculateWalletBalance(entries)).toBe(15);
  });

  it("Applies daily cap to commute credits", () => {
    // 6.0 kg saved * 10 = 60 raw credits; existing 20; cap 50 -> should award 30
    const credits = calculateTripCredits(6.0, 20, 50);
    expect(credits).toBe(30);

    // If already at 50, award 0
    expect(calculateTripCredits(2.0, 50, 50)).toBe(0);
  });

  it("Updates streak correctly on consecutive day and awards 7-day bonus", () => {
    const initialStreak = {
      current: 6,
      best: 6,
      lastActiveDay: "2026-11-01",
      freezesRemaining: 1,
    };

    const res = evaluateStreakUpdate(initialStreak, "2026-11-02");
    expect(res.streak.current).toBe(7);
    expect(res.streak.best).toBe(7);
    expect(res.streakIncremented).toBe(true);
    expect(res.bonusCreditsAwarded).toBe(10); // 7-day bonus
  });

  it("Uses streak freeze when 1 day is missed", () => {
    const streak = {
      current: 12,
      best: 15,
      lastActiveDay: "2026-10-30",
      freezesRemaining: 1,
    };
    // 2 days later: 2026-11-01
    const res = evaluateStreakUpdate(streak, "2026-11-01");
    expect(res.streak.current).toBe(13); // Preserved by freeze
    expect(res.streak.freezesRemaining).toBe(0);
  });

  it("Resets streak when gap > 2 days or no freezes left", () => {
    const streak = {
      current: 12,
      best: 15,
      lastActiveDay: "2026-10-25",
      freezesRemaining: 0,
    };
    const res = evaluateStreakUpdate(streak, "2026-11-01");
    expect(res.streak.current).toBe(1);
  });

  it("Determines citizen tier badge accurately", () => {
    expect(determineUserTier(10, 2).id).toBe("BRONZE_SAVER");
    expect(determineUserTier(60, 8).id).toBe("SILVER_CONSERVER");
    expect(determineUserTier(180, 16).id).toBe("GOLD_GUARDIAN");
    expect(determineUserTier(400, 35).id).toBe("PLATINUM_PIONEER");
    expect(determineUserTier(800, 65).id).toBe("SURYA_CHAMPION");
  });

  it("Computes dHash and detects duplicate proof image", () => {
    // Generate sample 8x9 gradient
    const samplePixels1 = Array.from({ length: 8 }, (_, r) =>
      Array.from({ length: 9 }, (_, c) => r * 10 + c * 20)
    );
    const hash1 = computeDHashFromGrayscale(samplePixels1);
    expect(hash1.length).toBe(16);

    // Identical image has distance 0
    expect(computeHammingDistance(hash1, hash1)).toBe(0);

    // Duplicate detection finds it
    expect(isDuplicateProofImage(hash1, [hash1])).toBe(true);

    // Completely inverted image
    const invertedPixels = Array.from({ length: 8 }, (_, r) =>
      Array.from({ length: 9 }, (_, c) => 255 - (r * 10 + c * 20))
    );
    const hash2 = computeDHashFromGrayscale(invertedPixels);
    expect(computeHammingDistance(hash1, hash2)).toBeGreaterThan(20);
    expect(isDuplicateProofImage(hash2, [hash1])).toBe(false);
  });
});
