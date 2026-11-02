import { z } from "zod";

export const AuditInputSchema = z.object({
  pincode: z
    .string()
    .length(6, "PIN code must be exactly 6 digits")
    .regex(/^3[6-9]\d{4}$/, "PIN code must be in Gujarat (starts with 36-39)"),
  city: z.enum([
    "Ahmedabad",
    "Gandhinagar",
    "Surat",
    "Vadodara",
    "Rajkot",
    "Mehsana",
    "Other",
  ]),
  discom: z.enum(["UGVCL", "DGVCL", "MGVCL", "PGVCL", "TORRENT_POWER"]),
  wardId: z.string().optional(),
  monthlyKwh: z.number().min(0, "Consumption cannot be negative").max(5000, "Consumption must be ≤ 5000 kWh"),
  cookingFuel: z.enum(["LPG", "PNG", "ELECTRIC", "OTHER"]),
  lpgCylindersPerYear: z.number().min(0).max(60).optional(),
  pngScmPerMonth: z.number().min(0).max(200).optional(),
  commuteMode: z.enum([
    "WALK",
    "CYCLE",
    "TWO_WHEELER",
    "CAR_PETROL",
    "CAR_DIESEL",
    "CAR_CNG",
    "AUTO_RICKSHAW",
    "BUS",
    "METRO_TRAIN",
    "EV_TWO_WHEELER",
    "EV_CAR",
  ]),
  dailyKm: z.number().min(0, "Distance cannot be negative").max(300, "Daily commute capped at 300 km"),
  workingDaysPerMonth: z.number().min(1).max(31).default(26),
  householdSize: z.number().min(1).max(20).default(4),
  userId: z.string().optional(),
  source: z.enum(["MANUAL", "OCR", "SAMPLE"]).default("MANUAL"),
});

export type AuditInputDto = z.infer<typeof AuditInputSchema>;
