# Data Sources & Assumptions Register — LiFE Gujarat

Every number and factor presented in LiFE Gujarat traces directly to authoritative government bodies, regulatory tariff orders, or clearly flagged assumptions.

---

## 1. Emissions Factors & Benchmarks (`config/emission.ts`)

| Parameter | Value | Unit | Source | Effective As Of |
|-----------|-------|------|--------|-----------------|
| Grid Electricity | **0.82** | kg CO₂/kWh | Central Electricity Authority (CEA) India CO₂ Baseline Database v19 | 2024-03-31 |
| Domestic LPG | **42.5** | kg CO₂ per 14.2 kg cylinder | Mission LiFE Technical Guidance / MoPNG Carbon Footprint Parameters | 2023-11-01 |
| Piped Natural Gas (PNG) | **2.0** | kg CO₂/SCM | `[ASSUMPTION]` Gujarat Gas / Petroleum Planning & Analysis Cell (PPAC) | 2024-01-01 |
| Walking / Cycling | **0.000** | kg CO₂/pax-km | Mission LiFE Zero-Emission Active Mobility Benchmark | 2023-01-01 |
| Petrol 2-Wheeler | **0.046** | kg CO₂/pax-km | `[ASSUMPTION]` ARAI / BEE Fuel Economy Guide (110-125cc motorcycle/scooter) | 2023-06-01 |
| Petrol Passenger Car | **0.171** | kg CO₂/pax-km | `[ASSUMPTION]` India GHG Program / BEE (Average compact petrol car, 1.3 occupancy) | 2023-06-01 |
| Diesel Passenger Car | **0.171** | kg CO₂/pax-km | `[ASSUMPTION]` India GHG Program (Average diesel passenger vehicle) | 2023-06-01 |
| CNG Auto / Car | **0.120** | kg CO₂/pax-km | `[ASSUMPTION]` PPAC / ARAI CNG vehicle operational emissions | 2023-06-01 |
| Electric 2-Wheeler | **0.012** | kg CO₂/pax-km | `[ASSUMPTION]` Grid-charged footprint (0.82 kg/kWh @ 28 Wh/km) | 2024-01-01 |
| Electric 4-Wheeler | **0.082** | kg CO₂/pax-km | `[ASSUMPTION]` Grid-charged footprint (0.82 kg/kWh @ 135 Wh/km with 1.35 pax) | 2024-01-01 |
| Gujarat Per-Capita Baseline | **165.0** | kg CO₂/person/month | `[ASSUMPTION]` Gujarat State Climate Change Action Plan & NITI Aayog India Climate Dashboard | 2023-12-31 |
| Mission LiFE Reduction Target | **132.0** | kg CO₂/person/month | `[ASSUMPTION]` Mission LiFE National 20% Intensity Reduction Target (0.8 × State Avg) | 2023-12-31 |

---

## 2. Solar Rooftop Parameters & Subsidy (`config/subsidy.ts` & `config/solar.ts`)

| Parameter | Value | Source | Notes |
|-----------|-------|--------|-------|
| Scheme Name | **PM Surya Ghar: Muft Bijli Yojana** | MNRE OM No. 318/17/2024-GCRT | Official central rooftop CFA scheme |
| Subsidy ≤ 2 kW | **₹30,000 / kW** | MNRE Operational Guidelines | E.g. 1 kW = ₹30k; 2 kW = ₹60k |
| Subsidy 2–3 kW | **₹60,000 + ₹18,000 × (kW − 2)** | MNRE Operational Guidelines | E.g. 2.5 kW = ₹69,000 |
| Subsidy ≥ 3 kW Cap | **₹78,000 (Maximum Cap)** | MNRE Operational Guidelines | Fixed cap for residential systems |
| Usable Roof Area Ratio | **70% (0.70)** | GEDA Rooftop Guidelines | Accounts for parapets, walkways, shadow casting |
| Specific Solar Area | **10.0 m² / kW** | MNRE Technical Benchmark | Mono-PERC high-efficiency modules (~540 Wp) |
| Performance Ratio (PR) | **0.78 (78%)** | `[ASSUMPTION]` NREL / PVWatts Western India | Default derate factor |
| System Capital Cost | **₹55,000–60,000 / kW** | `[ASSUMPTION]` GEDA Benchmark Band | Small systems (≤3 kW) ₹60k/kW; larger ₹55k/kW |
| Annual Degradation | **0.5% per year** | `[ASSUMPTION]` Standard Tier-1 Module Warranty | Evaluated over 25 years |
| Annual Tariff Escalation | **3.0% per year** | `[ASSUMPTION]` GERC Historical Tariff Trend | Long-term inflation rate |

---

## 3. Electricity Tariffs (`config/tariffs.ts`)

Configured for all 5 Gujarat Distribution Companies (UGVCL, DGVCL, MGVCL, PGVCL, Torrent Power):
- Category: Residential RGP (Domestic)
- Slabs:
  - 0 – 50 units: ₹3.05–₹3.20 / kWh
  - 50 – 100 units: ₹3.50–₹3.65 / kWh
  - 100 – 200 units: ₹4.15–₹4.25 / kWh
  - Above 200 units: ₹5.20–₹5.30 / kWh
- Fixed Charge: ₹50.00–₹55.00 / month
- Fuel Surcharge (FPPPA): ₹2.85–₹2.95 / kWh
- Electricity Duty: 15.0%

---

## 4. External APIs & Terms of Use

1. **Esri World Imagery**:
   - URL: `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`
   - Attribution: Required attribution displayed in map control.
2. **Open-Meteo**:
   - URL: `https://api.open-meteo.com/v1/forecast`
   - Terms: Non-commercial open access. Proxied and cached at 30-minute intervals.
3. **OpenStreetMap Nominatim**:
   - URL: `https://nominatim.openstreetmap.org/search`
   - Policy: Rate-limited, cached, and identified with valid user-agent header.

---

## 5. Verify Before Production Checklist
- [ ] Cross-verify latest GERC Tariff Order for FY 2025-26 for updated FPPPA and fixed charges.
- [ ] Update vendor empanelment directory once GEDA publishes the FY 2025-26 empanelment list.
- [ ] Confirm DISCOM boundary shapefiles for franchise areas on GIS server.
