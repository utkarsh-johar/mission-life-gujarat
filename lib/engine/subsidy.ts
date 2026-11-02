import { PM_SURYA_GHAR_CONFIG, SubsidyRuleConfig } from "../../config/subsidy";

export interface SubsidyBreakdown {
  systemKw: number;
  subsidyAmountInr: number;
  isCapped: boolean;
  tier1Amount: number;
  tier2Amount: number;
  schemeName: string;
  portalUrl: string;
}

export function roundTwo(val: number): number {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

/**
 * Calculates central CFA subsidy under PM Surya Ghar: Muft Bijli Yojana
 * Tier 1: Up to 2 kW @ ₹30,000/kW
 * Tier 2: Above 2 kW and up to 3 kW @ ₹18,000/kW (Base ₹60,000 + ₹18,000 * (kW - 2))
 * Tier 3: 3 kW and above: capped at ₹78,000
 */
export function calculatePmSuryaGharSubsidy(
  kw: number,
  config: SubsidyRuleConfig = PM_SURYA_GHAR_CONFIG
): SubsidyBreakdown {
  const capacity = Math.max(0, kw);

  if (capacity <= 0) {
    return {
      systemKw: 0,
      subsidyAmountInr: 0,
      isCapped: false,
      tier1Amount: 0,
      tier2Amount: 0,
      schemeName: config.schemeName,
      portalUrl: config.portalUrl,
    };
  }

  if (capacity <= config.tier1MaxKw) {
    const tier1Amount = roundTwo(capacity * config.tier1RatePerKw);
    return {
      systemKw: capacity,
      subsidyAmountInr: tier1Amount,
      isCapped: false,
      tier1Amount,
      tier2Amount: 0,
      schemeName: config.schemeName,
      portalUrl: config.portalUrl,
    };
  }

  if (capacity < config.tier2MaxKw) {
    const tier1Amount = config.tier1MaxKw * config.tier1RatePerKw; // 60,000
    const additionalKw = capacity - config.tier1MaxKw;
    const tier2Amount = roundTwo(additionalKw * config.tier2RatePerAdditionalKw);
    const total = roundTwo(tier1Amount + tier2Amount);
    return {
      systemKw: capacity,
      subsidyAmountInr: total,
      isCapped: false,
      tier1Amount,
      tier2Amount,
      schemeName: config.schemeName,
      portalUrl: config.portalUrl,
    };
  }

  // 3 kW or higher
  return {
    systemKw: capacity,
    subsidyAmountInr: config.maxSubsidyCap,
    isCapped: capacity > config.tier2MaxKw,
    tier1Amount: 60000,
    tier2Amount: 18000,
    schemeName: config.schemeName,
    portalUrl: config.portalUrl,
  };
}
