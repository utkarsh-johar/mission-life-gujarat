import { describe, it, expect } from "vitest";
import { parseBillOcrText, SAMPLE_BILLS, maskConsumerNumber } from "../../lib/services/ocr";

describe("OCR Bill Parser Tests", () => {
  it("Parses UGVCL sample bill accurately to 214 kWh and detects UGVCL", () => {
    const parsed = parseBillOcrText(SAMPLE_BILLS.ugvcl.ocrText);
    expect(parsed.kwh).toBe(214);
    expect(parsed.days).toBe(30);
    expect(parsed.monthlyKwh).toBe(214);
    expect(parsed.discom).toBe("UGVCL");
    expect(parsed.confidence).toBeGreaterThanOrEqual(0.8);
  });

  it("Parses Torrent Power sample bill accurately to 260 kWh", () => {
    const parsed = parseBillOcrText(SAMPLE_BILLS.torrent.ocrText);
    expect(parsed.kwh).toBe(260);
    expect(parsed.monthlyKwh).toBe(260);
    expect(parsed.discom).toBe("TORRENT_POWER");
  });

  it("Parses DGVCL sample bill accurately to 185 kWh", () => {
    const parsed = parseBillOcrText(SAMPLE_BILLS.dgvcl.ocrText);
    expect(parsed.kwh).toBe(185);
    expect(parsed.discom).toBe("DGVCL");
  });

  it("Normalises 60-day billing cycle to 30 days", () => {
    const bimonthlyText = `
      UGVCL BI-MONTHLY BILL
      Billing Days: 60
      Total Units Consumed: 400 kWh
    `;
    const parsed = parseBillOcrText(bimonthlyText);
    expect(parsed.kwh).toBe(400);
    expect(parsed.days).toBe(60);
    expect(parsed.monthlyKwh).toBe(200); // 400 * 30 / 60
  });

  it("Parses Gujarat UGVCL Naroda bi-monthly bill format (Difference 246)", () => {
    const ugvclBillText = `
      Uttar Gujarat Vij Company Limited
      UGVCL
      E-ELECTRICITY BILL : OCT-NOV,24
      Consumer No: 75103143097
      Readings KWH
      Present 2870
      Past 2624
      Difference 246
      Total (1 to 9): 1813.55
    `;
    const parsed = parseBillOcrText(ugvclBillText);
    expect(parsed.discom).toBe("UGVCL");
    expect(parsed.kwh).toBe(246);
    expect(parsed.days).toBe(60); // OCT-NOV bi-monthly
    expect(parsed.monthlyKwh).toBe(123); // 246 / 2
    expect(parsed.confidence).toBeGreaterThanOrEqual(0.8);
  });

  it("Masks consumer numbers correctly", () => {
    expect(maskConsumerNumber("123456789012")).toBe("XXXX-XXXX-9012");
    expect(maskConsumerNumber("1234")).toBe("1234");
  });
});
