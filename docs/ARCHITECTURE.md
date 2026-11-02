# System Architecture — LiFE Gujarat

**Problem Statement ID:** HC26-GEDA01 · Gujarat Energy Development Agency (GEDA)  
**Application Name:** LiFE Gujarat (Lifestyle for Environment)

---

## 1. Architectural Overview & Layered Design

The application follows a strict layered separation of concerns to ensure testability, auditability, and horizontal scalability:

```
┌────────────────────────────────────────────────────────────┐
│                    UI Presentation Layer                   │
│        (Next.js App Router, Tailwind CSS, Framer Motion)    │
│    app/audit  |  app/solar  |  app/mobility  |  app/war-room  │
└─────────────────────────────┬──────────────────────────────┘
                              │ calls (fetch / server actions)
┌─────────────────────────────▼──────────────────────────────┐
│                      API Route Layer                       │
│           (Next.js Route Handlers + Zod Validation)        │
│    /api/audit, /api/solar/estimate, /api/trips, /api/habits  │
└──────────────┬──────────────────────────────┬──────────────┘
               │ calls                        │ calls
┌──────────────▼─────────────┐ ┌──────────────▼──────────────┐
│    Service Layer (I/O)     │ │   Pure Engine Layer (No I/O) │
│ - lib/services/openMeteo   │ │ - lib/engine/carbon.ts       │
│ - lib/services/ocr.ts      │ │ - lib/engine/tariff.ts       │
│ - lib/services/geocode.ts  │ │ - lib/engine/subsidy.ts      │
│ - lib/services/cache.ts    │ │ - lib/engine/solar.ts        │
│                            │ │ - lib/engine/mobility.ts     │
│                            │ │ - lib/engine/nudges.ts       │
│                            │ │ - lib/engine/credits.ts      │
└──────────────┬─────────────┘ └─────────────────────────────┘
               │ queries
┌──────────────▼─────────────────────────────────────────────┐
│                     Persistence Layer                      │
│            Prisma ORM (SQLite local / PostgreSQL env)      │
│   Wards, Audits, Roofs, Vendors, Leads, Trips, Ledgers,    │
│   and Pre-aggregated WardDailyAggregate table              │
└────────────────────────────────────────────────────────────┘
```

### Core Architecture Rules
1. **Engine Purity**: Files in `/lib/engine/*` are pure, deterministic functions. They never import React, Next.js, Prisma, or `fetch()`. They are covered by 100% unit tests against golden fixtures.
2. **Configuration Single Source of Truth**: All constants (emission factors, tariffs, subsidy rules, per-capita baselines) reside in `/config/*.ts` or the DB `ConfigConstant` table, annotated with `source` and `asOf` timestamps.
3. **External API Resilience**: External calls (Open-Meteo, Nominatim) are isolated in `lib/services/*` and wrapped with caching, timeouts, and deterministic fallback data tagged with an "offline data" badge.

---

## 2. Scalability & Performance Design Points

### 2.1 Microclimate Grid Caching
- **Cache Key**: `irradiance:round(lat,2):round(lng,2):hourBucket` (approx 1 km² grid).
- **TTL**: 30 minutes for forecast/current, 24 hours for historical radiation.
- **Benefit**: Eliminates redundant upstream API requests across dense neighborhoods (e.g. Navrangpura or Vastrapur).

### 2.2 Pre-Aggregated Ward Metrics (`WardDailyAggregate`)
- Admin queries do **not** scan millions of individual trip or audit events at request time.
- Queries read directly from `WardDailyAggregate` (indexed on `[wardId, day]`).
- Writes update aggregates incrementally using atomic database operations.

### 2.3 Idempotency & Anti-Gaming
- `POST /api/trips` enforces unique `idempotencyKey` to prevent double-credit issuance during flaky network reconnects.
- `POST /api/habits/log` computes a 64-bit perceptual gradient difference hash (`dHash`) to reject duplicate photo submissions across users.
- Daily commute credits are capped at 50 credits/day.

### 2.4 Database Portability (Zero-Config Local -> Cloud PostgreSQL)
- **Local/Demo**: Default `DATABASE_URL="file:./dev.db"` (SQLite file database created instantly on boot).
- **Production**: Switch `DATABASE_URL="postgresql://user:pass@host:5432/dbname"` and `provider = "postgresql"` in `prisma/schema.prisma`.

---

## 3. Security, Privacy & Compliance

- **Zero-Storage of Client Bills**: Electricity bill images are parsed client-side in the browser using WebAssembly workers (`tesseract.js`). No private electricity bill images or consumer numbers are persisted on the server.
- **GPS Privacy**: Raw GPS trajectories stay strictly on the client. Only distilled trip metrics (distance, elapsed time, classified speed profile, ward) are submitted to the server upon trip completion.
- **k-Anonymity Guard**: Public ward leaderboards suppress any ward reporting fewer than 10 active citizens to protect individual citizen identity.
