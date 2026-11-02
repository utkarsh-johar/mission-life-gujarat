# 5-Minute Evaluator & Judge Demo Script — LiFE Gujarat

**Target Audience:** Hackathon Judges / GEDA Technical Evaluators  
**Demo Duration:** ≤ 5 Minutes  
**Goal:** Showcase real-time deterministic calculations, zero fake sliders, satellite polygon solar studio, live simulated GPS commute, and GEDA administrative telemetry.

---

## Pre-Flight Check (Zero-Config)
```bash
# App runs with zero environment variables out of the box
npm run dev
# Open http://localhost:3000 in your browser
```

---

## ⏱️ Minute 0:00–1:00 — Landing & Instant Carbon Audit (Module A)

1. **Landing Page (`/`)**:
   - Point out the headline metrics: 142.5 Tonnes CO₂ avoided across 42 Gujarat wards.
   - Click the orange button: **"Try with Sample Bill (Instant ≤ 10s)"**.
2. **Instant Bill OCR (`/audit`)**:
   - In Step 2 (Energy), click **"UGVCL (214 kWh Sample)"**.
   - Watch the OCR extractor parse the text in 700ms and display:
     `"We read 214 kWh — correct?"` with 90% confidence.
   - Click **"Confirm & Calculate Baseline"**.
3. **Audit Results Screen**:
   - **Footprint Gauge**: Note the animated 3-marker gauge comparing You vs. Gujarat Average (165 kg) vs. Mission LiFE Target (132 kg).
   - **GERC Slab-Jump Alert**: Highlight the top card:
     `"Reduce 1.4 kWh/day for the next 10 days to stay under the 200-unit slab and save ₹142 this month."`
   - Click any **"ⓘ" icon** on a number to demonstrate full provenance (formula, CEA v19 constant, and GERC tariff source).

---

## ⏱️ Minute 1:00–2:30 — "Roof-to-Rupee" Solar Studio (Module B Flagship)

1. **Navigate to `/solar`**:
   - High-resolution Esri satellite imagery loads with zoom controls and search.
2. **Draw or Load a Standard Rooftop**:
   - Click **"Sample 100 m²"** (or click 4 vertices on any rooftop in Ahmedabad).
   - Watch the live area badge update: `100 m² (1,076 sq ft)`.
   - Click **"Calculate Solar Potential"**.
3. **Instant Sizing & Financial Model**:
   - Usable Area: **70 m²** (70% ratio).
   - Sizing: **7.0 kW** (13 panels @ 540 Wp).
   - **PM Surya Ghar Subsidy**: **₹78,000** (Max CFA cap applied).
   - Capital Outlay: Gross ₹3,85,000 → Net **₹3,07,000**.
4. **Interactive Break-Even Chart**:
   - Show the 10-year cumulative savings curve crossing the net cost line.
   - Note the **golden ReferenceDot** marking the exact Break-Even year (~4.2 years).
5. **Sensitivity Toggle**:
   - Toggle **"Cloudier Year (-10% Irradiance)"** or **"Flat Tariff"** — watch all financial numbers and charts recompute in real time.
6. **PDF Download & Vendor Quote Dispatch**:
   - Click **"Summary PDF"** to demonstrate instant client-side PDF feasibility export.
   - Click **"Request Quote"** on "Gujarat SunPower Tech LLP", check the consent box, and submit. Lead is immediately queued for GEDA admin.

---

## ⏱️ Minute 2:30–3:45 — Live GPS Mobility Tracker & Weather Nudges (Module C)

1. **Navigate to `/mobility`**:
   - Point out the active microclimate indicator (`32°C, 50% Humid, 800 W/m²`).
2. **5x Commute Simulation (Judge Demo Path)**:
   - Notice the toggle **"Simulate Live Commute (5x Replay)"** is active.
   - Click **"Start Tracking Trip"**.
   - Watch the **Speedometer Gauge** sweep realistically (0 → 14 km/h → 34 km/h).
   - Watch the **CO₂ Odometer Ticker** roll up in real time (AC-C1).
   - Watch the **Mode Classifier** transition from Walking (<7 km/h) → Cycling (12 km/h) → Transit (>18 km/h).
3. **Stop & Save Trip**:
   - Click **"Stop & Save"**.
   - Because speeds exceeded 18 km/h, the one-tap confirmation modal appears: select **"🚌 Bus / BRTS"**.
   - Instant verification awards +40 credits to the wallet and increments the streak counter.
4. **Live Weather Challenge**:
   - Point to the active challenge card:
     `"AC-Off Natural Ventilation Challenge"` or `"Peak Solar Load-Shift Challenge"`.
   - Show the **"Why you're seeing this"** telemetry rationale.

---

## ⏱️ Minute 3:45–4:30 — Climate Wallet & Anti-Gaming Proof (Module D)

1. **Navigate to `/rewards`**:
   - Show the append-only ledger history with date and delta.
   - Note the **Daily Habit Streak** and citizen tier badge (**Silver Conserver**).
2. **Redeem Reward**:
   - Click **"Redeem Reward"** on the **Official GEDA Certificate**.
   - Balance is atomically deducted on the ledger and a unique certificate voucher code is issued.
   - Click **"Download PDF"** to view the official state certificate.

---

## ⏱️ Minute 4:30–5:00 — GEDA Command War-Room (Admin View)

1. **Toggle Role**:
   - In the top header, click **"Role: Citizen"** to switch to **"GEDA Admin"** (routes to `/war-room`).
2. **Statewide Telemetry & KPIs**:
   - 142.5 Tonnes avoided across 42 wards.
   - Solar rooftop pipeline: 1,850 kW mapped, ₹4.07 Cr subsidy value.
   - 7-day trend line and DISCOM distribution.
3. **Ward LiFE Leaderboard**:
   - Sort and filter by City (Ahmedabad, Surat, Vadodara, Gandhinagar) and Range (7/30/90 days).
   - Explain the composite LiFE Score formula (45% CO₂ + 35% participation + 20% streak).
   - Click **"Export Ward CSV"** or **"Export Solar Leads"** to show instant operational readiness.
