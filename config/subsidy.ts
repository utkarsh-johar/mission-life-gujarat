export interface SubsidyRuleConfig {
  schemeName: string;
  portalUrl: string;
  source: string;
  asOf: string;
  applicabilityNote: string;
  tier1MaxKw: number;
  tier1RatePerKw: number;
  tier2MaxKw: number;
  tier2BaseAmount: number;
  tier2RatePerAdditionalKw: number;
  maxSubsidyCap: number;
}

export const PM_SURYA_GHAR_CONFIG: SubsidyRuleConfig = {
  schemeName: "PM Surya Ghar: Muft Bijli Yojana",
  portalUrl: "https://pmsuryaghar.gov.in",
  source: "Ministry of New and Renewable Energy (MNRE), Govt. of India OM No. 318/17/2024-GCRT",
  asOf: "2024-02-15",
  applicabilityNote: "Central Government Financial Assistance (CFA) applies strictly to residential rooftop grid-connected solar installations.",
  tier1MaxKw: 2.0,
  tier1RatePerKw: 30000,
  tier2MaxKw: 3.0,
  tier2BaseAmount: 60000,
  tier2RatePerAdditionalKw: 18000,
  maxSubsidyCap: 78000,
};
