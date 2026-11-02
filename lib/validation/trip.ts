import { z } from "zod";

export const TripSaveSchema = z.object({
  userId: z.string().default("demo-citizen-id"),
  idempotencyKey: z.string().min(8),
  distanceKm: z.number().min(0).max(300),
  movingSeconds: z.number().min(0),
  avgKmh: z.number().min(0).max(200),
  maxKmh: z.number().min(0).max(200),
  detectedMode: z.string(),
  confirmedMode: z.string().optional(),
  confidence: z.number().min(0).max(1),
  isSimulated: z.boolean().default(false),
  wardId: z.string().optional(),
  startedAt: z.string().datetime().or(z.date()),
});

export const HabitLogSchema = z.object({
  userId: z.string().default("demo-citizen-id"),
  ruleId: z.string(),
  evidenceType: z.enum(["PHOTO", "TICKET", "AUTO_SENSOR"]).optional(),
  imageHash: z.string().optional(),
  status: z.enum(["PENDING", "AUTO_VERIFIED", "APPROVED", "REJECTED"]).default("PENDING"),
  creditsAwarded: z.number().min(0).default(0),
});
