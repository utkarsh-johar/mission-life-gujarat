# LiFE Gujarat — Mission LiFE Citizen Engagement & Rooftop Solar Platform

**Problem Statement ID:** HC26-GEDA01 · Gujarat Energy Development Agency (GEDA)  
**Live Target:** Web / Responsive PWA (Mobile-first, WCAG 2.1 AA)  
**Status:** v1.0 Production-Ready

Turn India's **Mission LiFE** (Lifestyle for Environment) from a pledge into a measurable daily habit. A Gujarat citizen can measure their baseline footprint in 30 seconds, see what their own rooftop could earn them under PM Surya Ghar, get live nudges based on local weather, and track verified green commutes. GEDA administrators get a real-time war-room of municipal ward rankings and solar demand pipeline.

---

## ⚡ Quick Start (Zero-Config, Single Command)

The app boots with an embedded SQLite database and pre-seeded Gujarat wards, tariffs, and synthetic activity. No external API keys are required.

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚀 Key Features by Module

### Module A — 30-Second Baseline & Tariff Slab Alert
- **Ultra-fast Onboarding**: Produces baseline footprint in ≤ 30s (or ≤ 10s via sample bills).
- **Client-side OCR Reader**: Lazy-loaded Tesseract.js scans DISCOM bills (UGVCL, DGVCL, Torrent Power) on the client with zero storage of private consumer numbers.
- **GERC Slab-Jump Alert Engine**: Dynamically calculates whether projected consumption crosses a slab boundary (e.g. 200 kWh) and prescribes the exact daily cut needed to save money.
- **Zero Fake Sliders**: Every calculation is derived purely from CEA India v19 grid emission factors (0.82 kg/kWh) and documented formulas.

### Module B — "Roof-to-Rupee" Solar Polygon Studio (Flagship)
- **High-Resolution Satellite Maps**: Esri World Imagery tiles with turf.js geospatial geometry calculation.
- **PM Surya Ghar: Muft Bijli Yojana**: Pure subsidy engine calculating central CFA (₹30k/kW up to 2 kW, ₹18k/kW up to 3 kW, ₹78k max cap).
- **10-Year Break-Even Curve**: Recharts ComposedChart featuring a golden `ReferenceDot` at the exact capital break-even intersection.
- **GEDA-Empanelled Vendor Directory**: Filter vendors by capacity and district, dispatch quote requests with explicit consent, and download feasibility PDFs.

### Module C — Live GPS Mobility Tracker & Weather Nudges
- **Sensor Telemetry Pipeline**: Real-time Haversine distance, animated speedometer gauge, and odometer rolling CO₂ saved ticker.
- **5x Commute Simulation Mode**: Deterministic replay of realistic Ahmedabad routes for instant desk judging.
- **Microclimate Weather Nudges**: Open-Meteo integration evaluates nighttime AC-off challenges (<26°C) and peak solar load-shifting (>750 W/m²).

### Module D — Gamification, Proof-of-Habit & GEDA War-Room
- **State Climate Wallet**: Append-only ledger tracking credits, daily streaks with freeze protection, and citizen tier badges.
- **Proof-of-Habit Deduplication**: Computes 64-bit perceptual image hashes (`dHash`) to reject duplicate photos.
- **GEDA State Command War-Room (`/war-room`)**: 42 municipal ward scorecards across Ahmedabad, Gandhinagar, Surat, and Vadodara ranked by composite LiFE score, with 1-click CSV exports.

---

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Starts local Next.js development server on port 3000 |
| `npm run build` | Compiles production build and optimizes all 27 routes |
| `npm run start` | Starts Next.js production server |
| `npm run check` | Runs TypeScript static type checking (`tsc --noEmit`) |
| `npm run test` | Runs all Vitest unit tests with coverage reporting |
| `npm run seed` | Re-seeds database with 42 wards, tariffs, vendors, and demo users |
| `npm run db:reset` | Resets SQLite database and runs seed script |

---

## 🏛️ Architecture & Verification

- For system architecture, layered diagrams, and horizontal scalability design, see [ARCHITECTURE.md](docs/ARCHITECTURE.md).
- For complete constants, sources, and regulatory references, see [DATA_SOURCES.md](docs/DATA_SOURCES.md).
- For the step-by-step 5-minute judge walkthrough, see [DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md).
