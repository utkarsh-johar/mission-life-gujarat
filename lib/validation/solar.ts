import { z } from "zod";

export const GeoJsonPolygonSchema = z.object({
  type: z.literal("Polygon"),
  coordinates: z.array(z.array(z.tuple([z.number(), z.number()]))).min(1),
});

export const SolarEstimateRequestSchema = z.object({
  polygon: GeoJsonPolygonSchema,
  lat: z.number().min(20.0).max(25.0), // Gujarat latitudes approx
  lng: z.number().min(68.0).max(75.0), // Gujarat longitudes approx
  monthlyKwh: z.number().min(0).max(10000).optional(),
  discom: z.enum(["UGVCL", "DGVCL", "MGVCL", "PGVCL", "TORRENT_POWER"]).optional(),
  sensitivityCloudierYear: z.boolean().optional(),
  sensitivityFlatTariff: z.boolean().optional(),
});

export const SaveRoofProjectSchema = z.object({
  userId: z.string().default("demo-citizen-id"),
  geojson: z.any(),
  areaSqM: z.number().min(5),
  usableSqM: z.number().min(3),
  systemKw: z.number().min(0.5),
  annualKwh: z.number().min(0),
  grossCost: z.number().min(0),
  subsidy: z.number().min(0),
  netCost: z.number().min(0),
  paybackYears: z.number().min(0),
  lat: z.number(),
  lng: z.number(),
  irradianceSnapshot: z.any(),
});

export const SolarLeadRequestSchema = z.object({
  userId: z.string().default("demo-citizen-id"),
  vendorId: z.string(),
  roofId: z.string(),
  consent: z.literal(true, {
    errorMap: () => ({ message: "You must consent to sharing contact details with the empanelled vendor" }),
  }),
});
