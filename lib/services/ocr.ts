import { Discom } from "../../config/tariffs";

export interface ParsedBillData {
  kwh: number;
  days: number;
  monthlyKwh: number;
  billAmountInr?: number;
  discom: Discom;
  consumerNoMasked?: string;
  confidence: number;
  rawMatchedSnippet?: string;
}

export function maskConsumerNumber(numStr: string): string {
  const digits = numStr.replace(/\D/g, "");
  if (digits.length <= 4) return digits;
  return `XXXX-XXXX-${digits.slice(-4)}`;
}

/**
 * Pure regex extractor for electricity bill text (OCR text)
 * Supports English and Gujarati billing keywords across Gujarat DISCOMs
 */
export function parseBillOcrText(text: string): ParsedBillData {
  const cleanText = text.replace(/\r\n/g, "\n");

  // 1. Detect DISCOM
  let discom: Discom = "UGVCL"; // Default fallback
  if (/TORRENT\s*POWER/i.test(cleanText) || /TORRENT/i.test(cleanText)) {
    discom = "TORRENT_POWER";
  } else if (/DGVCL/i.test(cleanText) || /DAKSHIN\s*GUJARAT/i.test(cleanText)) {
    discom = "DGVCL";
  } else if (/MGVCL/i.test(cleanText) || /MADHYA\s*GUJARAT/i.test(cleanText)) {
    discom = "MGVCL";
  } else if (/PGVCL/i.test(cleanText) || /PASCHIM\s*GUJARAT/i.test(cleanText)) {
    discom = "PGVCL";
  } else if (/UGVCL/i.test(cleanText) || /UTTAR\s*GUJARAT/i.test(cleanText)) {
    discom = "UGVCL";
  }

  // 2. Units Consumed / Consumption
  let kwh = 0;
  let confidence = 0.5;
  let rawSnippet = "";

  const unitsPatterns = [
    /(?:Units\s*Consumed|Consumption|Total\s*Units|Billed\s*Units|વપરાશ|કુલ\s*યુનિટ)\s*[:=-]?\s*(\d+(?:\.\d+)?)/i,
    /(?:kWh|Units)\s*[:=-]?\s*(\d+(?:\.\d+)?)/i,
    /(\d+(?:\.\d+)?)\s*(?:kWh|Units|યુનિટ)/i,
  ];

  for (const pat of unitsPatterns) {
    const match = cleanText.match(pat);
    if (match && match[1]) {
      const val = parseFloat(match[1]);
      if (val > 0 && val < 10000) {
        kwh = val;
        confidence += 0.3;
        rawSnippet = match[0];
        break;
      }
    }
  }

  // 3. Billing Period / Days
  let days = 30;
  const daysMatch = cleanText.match(/(?:Billing\s*Days|Period\s*Days|Days|દિવસો)\s*[:=-]?\s*(\d{1,3})/i);
  if (daysMatch && daysMatch[1]) {
    const parsedDays = parseInt(daysMatch[1], 10);
    if (parsedDays >= 10 && parsedDays <= 90) {
      days = parsedDays;
      confidence += 0.1;
    }
  }

  // 4. Bill Amount
  let billAmountInr: number | undefined;
  const amountMatch = cleanText.match(/(?:Total\s*Amount|Net\s*Payable|Bill\s*Amount|રકમ)\s*[:=-]?\s*(?:₹|Rs\.?)?\s*(\d+(?:,\d+)*(?:\.\d+)?)/i);
  if (amountMatch && amountMatch[1]) {
    const num = parseFloat(amountMatch[1].replace(/,/g, ""));
    if (num > 0) {
      billAmountInr = num;
      confidence += 0.1;
    }
  }

  // 5. Consumer Number (masked)
  let consumerNoMasked: string | undefined;
  const consumerMatch = cleanText.match(/(?:Consumer\s*No|Account\s*No|Service\s*No|ગ્રાહક\s*નંબર)\s*[:=-]?\s*([0-9A-Z\-\/]+)/i);
  if (consumerMatch && consumerMatch[1]) {
    consumerNoMasked = maskConsumerNumber(consumerMatch[1]);
  }

  // Normalise to 30-day month: monthlyKwh = kwh * 30 / days
  const monthlyKwh = Math.round(((kwh * 30) / days) * 100) / 100;

  return {
    kwh,
    days,
    monthlyKwh,
    billAmountInr,
    discom,
    consumerNoMasked,
    confidence: Math.min(1.0, confidence),
    rawMatchedSnippet: rawSnippet,
  };
}

/**
 * Seeded Demo Sample Bills
 */
export const SAMPLE_BILLS: Record<string, { name: string; discom: Discom; ocrText: string; expectedKwh: number }> = {
  ugvcl: {
    name: "UGVCL Residential Bill (North Gujarat)",
    discom: "UGVCL",
    expectedKwh: 214,
    ocrText: `
UTTAR GUJARAT VIJ COMPANY LIMITED (UGVCL)
ELECTRICITY BILL - RESIDENTIAL RGP
Consumer No: 08342/19823/4
Billing Period: 01/10/2026 to 31/10/2026
Billing Days: 30
Meter No: MTR-98214
Previous Reading: 12450
Current Reading: 12664
Total Units Consumed: 214 kWh
Energy Charges: ₹ 815.30
Fixed Charges: ₹ 50.00
FPPPA / Fuel Surcharge @ 2.85: ₹ 609.90
Electricity Duty (15%): ₹ 221.28
Total Amount Payable: ₹ 1696.48
    `.trim(),
  },
  torrent: {
    name: "Torrent Power Bill (Ahmedabad)",
    discom: "TORRENT_POWER",
    expectedKwh: 260,
    ocrText: `
TORRENT POWER LIMITED - AHMEDABAD
POWER SUPPLY BILL - DOMESTIC
Service No: 401928374
Bill Date: 15/10/2026
Billing Days: 30
Consumption: 260 kWh
Energy Charges: ₹ 1040.50
Fixed Charges: ₹ 55.00
Fuel Surcharge: ₹ 767.00
Govt Duty: ₹ 279.38
Total Amount: ₹ 2141.88
    `.trim(),
  },
  dgvcl: {
    name: "DGVCL Residential Bill (Surat)",
    discom: "DGVCL",
    expectedKwh: 185,
    ocrText: `
DAKSHIN GUJARAT VIJ COMPANY LTD (DGVCL)
ELECTRICITY CONSUMPTION INVOICE
Consumer No: 1928374650
Bill Period Days: 30
Units Consumed: 185
Billed Units: 185 kWh
Net Payable: ₹ 1420.00
    `.trim(),
  },
};
