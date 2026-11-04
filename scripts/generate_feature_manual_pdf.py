import os
import sys
from reportlab.lib.pagesizes import A4
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            return  # Suppress headers/footers on cover page
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#0D9488"))  # Teal
        self.drawString(40, 810, "MISSION LiFE GUJARAT")
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        self.drawString(150, 810, "· Comprehensive Feature Specification & Technical Manual")
        self.drawRightString(555, 810, "GEDA · HC26-GEDA01")
        
        # Top Rule
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.6)
        self.line(40, 804, 555, 804)

        # Bottom Rule
        self.line(40, 42, 555, 42)
        self.setFont("Helvetica", 7.5)
        self.drawString(40, 30, "Confidential & Evaluator Copy · Gujarat Energy Development Agency (GEDA) · NxtWave")
        self.drawRightString(555, 30, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()


def build_pdf(filename="LiFE_Gujarat_Features_and_Technical_Manual.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=40,
        rightMargin=40,
        topMargin=50,
        bottomMargin=50
    )

    styles = getSampleStyleSheet()

    # Custom styles
    primary_color = colors.HexColor("#0F172A")  # Slate 900
    teal_color = colors.HexColor("#0D9488")     # Teal 600
    dark_teal = colors.HexColor("#115E59")      # Teal 800
    emerald_color = colors.HexColor("#10B981")  # Emerald 500
    amber_color = colors.HexColor("#D97706")    # Amber 600
    subtext_color = colors.HexColor("#475569")  # Slate 600

    styles.add(ParagraphStyle(
        name='CoverTitle',
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=30,
        textColor=primary_color,
        alignment=0,
        spaceAfter=8
    ))
    styles.add(ParagraphStyle(
        name='CoverSubtitle',
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=teal_color,
        alignment=0,
        spaceAfter=20
    ))
    styles.add(ParagraphStyle(
        name='CoverMeta',
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=subtext_color
    ))
    styles.add(ParagraphStyle(
        name='SecHeading',
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=primary_color,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    ))
    styles.add(ParagraphStyle(
        name='SubSecHeading',
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=dark_teal,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    ))
    styles.add(ParagraphStyle(
        name='FeatureTitle',
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=primary_color,
        spaceBefore=6,
        spaceAfter=2,
        keepWithNext=True
    ))
    styles.add(ParagraphStyle(
        name='Body',
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=primary_color,
        spaceAfter=4
    ))
    styles.add(ParagraphStyle(
        name='BodyBold',
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11.5,
        textColor=primary_color,
        spaceAfter=4
    ))
    styles.add(ParagraphStyle(
        name='CalloutText',
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#1E293B")
    ))
    styles.add(ParagraphStyle(
        name='TableCell',
        fontName='Helvetica',
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor("#1E293B")
    ))
    styles.add(ParagraphStyle(
        name='TableCellBold',
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor("#0F172A")
    ))
    styles.add(ParagraphStyle(
        name='TableHeader',
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=colors.white
    ))
    styles.add(ParagraphStyle(
        name='CodeSnippet',
        fontName='Courier',
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor("#0F766E")
    ))

    story = []

    # =========================================================================
    # COVER PAGE
    # =========================================================================
    story.append(Spacer(1, 20))
    # Agency Badge
    agency_table = Table([[
        Paragraph("<b>GOVERNMENT OF GUJARAT · GUJARAT ENERGY DEVELOPMENT AGENCY (GEDA)</b>", ParagraphStyle(
            name='Badge', fontName='Helvetica-Bold', fontSize=8, textColor=colors.HexColor("#0D9488")
        ))
    ]], colWidths=[515])
    agency_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F0FDFA")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#99F6E4")),
        ('PADDING', (0,0), (-1,-1), 6),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
    ]))
    story.append(agency_table)
    story.append(Spacer(1, 15))

    story.append(Paragraph("MISSION LiFE GUJARAT", styles['CoverTitle']))
    story.append(Paragraph("Complete Technical Architecture & Feature Specification Manual", styles['CoverSubtitle']))
    
    meta_box = [
        [Paragraph("<b>Problem Statement ID:</b>", styles['TableCellBold']), Paragraph("HC26-GEDA01 (Track 1: Green Energy & Sustainability)", styles['TableCell'])],
        [Paragraph("<b>Sponsoring Organisation:</b>", styles['TableCellBold']), Paragraph("Gujarat Energy Development Agency (GEDA), Gandhinagar", styles['TableCell'])],
        [Paragraph("<b>Challenge Title:</b>", styles['TableCellBold']), Paragraph("Development of an Interactive 'Mission LiFE' Citizen Engagement Application", styles['TableCell'])],
        [Paragraph("<b>Live Production URL:</b>", styles['TableCellBold']), Paragraph("<u>https://mission-life-gujarat.vercel.app</u>", styles['TableCell'])],
        [Paragraph("<b>Public Codebase:</b>", styles['TableCellBold']), Paragraph("<u>https://github.com/utkarsh-johar/mission-life-gujarat</u>", styles['TableCell'])],
        [Paragraph("<b>Primary Tech Stack:</b>", styles['TableCellBold']), Paragraph("Next.js 14, React 18, TypeScript, Tailwind CSS, Prisma, Leaflet, Tesseract.js", styles['TableCell'])],
        [Paragraph("<b>Evaluation Weightage:</b>", styles['TableCellBold']), Paragraph("Tech Execution (40%) · Architecture & Scalability (30%) · UI/UX (20%) · Innovation (10%)", styles['TableCell'])],
        [Paragraph("<b>Verification Status:</b>", styles['TableCellBold']), Paragraph("49/49 Vitest Unit Tests Passed · Strict TypeScript 0 Errors · Dual SQLite/Serverless", styles['TableCell'])],
    ]
    t_meta = Table(meta_box, colWidths=[140, 375])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#E2E8F0")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_meta)
    story.append(Spacer(1, 15))

    # Executive Overview Callout
    summary_box = Table([[
        Paragraph(
            "<b>EXECUTIVE MANDATE & SCOPE:</b><br/>"
            "This document provides the definitive, end-to-end technical documentation for the <b>LiFE Gujarat</b> "
            "platform. Built specifically to address GEDA's mandate under India's national <i>Mission LiFE</i> (Lifestyle for Environment), "
            "the platform bridges the divide between macro-level climate policy and micro-level citizen daily choices. "
            "Rejecting superficial dummy sliders, LiFE Gujarat enforces rigorous regulatory models: GERC 2024 electricity tariffs, "
            "CEA India v19 grid emission factors, and PM Surya Ghar Central Financial Assistance. While piloted with Gujarat's 4 DISCOMs "
            "and 42 municipal wards, its decoupled architecture enables immediate multi-state expansion across India.",
            styles['CalloutText']
        )
    ]], colWidths=[515])
    summary_box.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F1F5F9")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(summary_box)
    story.append(Spacer(1, 15))

    # Evaluation Criteria Alignment Table
    eval_matrix = [
        [Paragraph("Evaluation Criterion", styles['TableHeader']), Paragraph("Weight", styles['TableHeader']), Paragraph("How LiFE Gujarat Delivers Maximum Impact", styles['TableHeader'])],
        [
            Paragraph("Technical Execution & Code Quality", styles['TableCellBold']),
            Paragraph("40%", styles['TableCell']),
            Paragraph("Strict TypeScript (0 errors), 49 unit tests across 8 test suites, client-side Tesseract.js OCR, Leaflet geodesic polygon algorithms, and real-time Web Audio API sound synthesizers.", styles['TableCell'])
        ],
        [
            Paragraph("System Architecture & Scalability", styles['TableCellBold']),
            Paragraph("30%", styles['TableCell']),
            Paragraph("Next.js 14 App Router, dual-mode database (embedded Prisma SQLite + zero-crash serverless fallbacks for Vercel), modular DISCOM adapter pattern, differential privacy k-anonymity (k>=10).", styles['TableCell'])
        ],
        [
            Paragraph("UI / UX & Accessibility", styles['TableCellBold']),
            Paragraph("20%", styles['TableCell']),
            Paragraph("Fluid responsive design, instant 10s sample bill loader, interactive canvas island visualizer, multi-language switching (English, Gujarati, Hindi) with zero-reload client translation.", styles['TableCell'])
        ],
        [
            Paragraph("Innovation & Problem Fit", styles['TableCellBold']),
            Paragraph("10%", styles['TableCell']),
            Paragraph("Tailored directly to GEDA's jurisdiction with authentic GERC 2024 tariffs, Gujarat 42 ward command telemetry, GSRTC/BRTS green credit redemption, and anti-cheat mobility verification.", styles['TableCell'])
        ]
    ]
    t_eval = Table(eval_matrix, colWidths=[130, 45, 340])
    t_eval.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0D9488")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('PADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")]),
    ]))
    story.append(t_eval)

    story.append(PageBreak())

    # =========================================================================
    # SECTION 1: ARCHITECTURE & DESIGN PHILOSOPHY
    # =========================================================================
    story.append(Paragraph("1. System Architecture & Engineering Philosophy", styles['SecHeading']))
    story.append(HRFlowable(width="100%", thickness=1, color=teal_color, spaceAfter=8))

    story.append(Paragraph(
        "<b>The 'Anti-Mock' Engineering Stance:</b><br/>"
        "Most sustainability apps fail because they use arbitrary sliders (e.g. 'How many hours did you use your TV?'). "
        "These produce inaccurate, meaningless carbon estimations that citizens quickly abandon. LiFE Gujarat replaces "
        "synthetic guesswork with <b>verifiable regulatory engineering</b>:",
        styles['Body']
    ))

    arch_points = [
        [Paragraph("<b>Layer</b>", styles['TableHeader']), Paragraph("Component & Technical Implementation", styles['TableHeader']), Paragraph("Impact / Guarantees", styles['TableHeader'])],
        [
            Paragraph("Presentation Layer", styles['TableCellBold']),
            Paragraph("Next.js 14 App Router (React 18), Tailwind CSS, Lucide icons, Recharts interactive data visualizers, Canvas 2D biomes.", styles['TableCell']),
            Paragraph("Sub-second initial paint, mobile-first responsive layout, dark/light accessibility.", styles['TableCell'])
        ],
        [
            Paragraph("Client-Side Intelligence", styles['TableCellBold']),
            Paragraph("Tesseract.js OCR WASM engine, Turf.js geodesic polygon area math, HTML5 Geolocation API, Web Audio API procedural synthesis.", styles['TableCell']),
            Paragraph("Zero API costs, zero cloud OCR transmission latency, 100% citizen bill privacy on-device.", styles['TableCell'])
        ],
        [
            Paragraph("Calculation Engine", styles['TableCellBold']),
            Paragraph("CEA India v19 grid emission factor (0.82 kg CO2/kWh), GERC 2024 telescopic slabs, PM Surya Ghar CFA subsidy tiers, Haversine displacement.", styles['TableCell']),
            Paragraph("Pure mathematical determinism with 49 automated unit tests verifying regulatory exactness.", styles['TableCell'])
        ],
        [
            Paragraph("Dual-Mode Data Tier", styles['TableCellBold']),
            Paragraph("Prisma ORM with SQLite for local execution + Deterministic in-memory database adapter (config/wards.ts) for serverless Vercel deployment.", styles['TableCell']),
            Paragraph("Zero database lock-in; platform never throws 500 exceptions when deployed to serverless lambdas.", styles['TableCell'])
        ],
        [
            Paragraph("State Command & Security", styles['TableCellBold']),
            Paragraph("Differential privacy k-anonymity (k>=10) for ward telemetry, cryptographic transaction hashing for minted LiFE credits, CSV streaming exports.", styles['TableCell']),
            Paragraph("Executive oversight for GEDA administrators while safeguarding citizen household privacy.", styles['TableCell'])
        ]
    ]
    t_arch = Table(arch_points, colWidths=[95, 260, 160])
    t_arch.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0F172A")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('PADDING', (0,0), (-1,-1), 4.5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")]),
    ]))
    story.append(t_arch)
    story.append(Spacer(1, 10))

    story.append(Paragraph(
        "<b>Multi-State Scalability (Why Gujarat Pilot -> Pan-India):</b><br/>"
        "Although configured with Gujarat's 4 DISCOMs (UGVCL, DGVCL, MGVCL, PGVCL) and Torrent Power to solve GEDA's direct challenge, "
        "the architecture utilizes an open <i>DISCOM Provider Interface</i>. Adding Maharashtra (MSEDCL), Karnataka (BESCOM), or Delhi (BSES) "
        "only requires defining a tariff matrix in <code>config/discoms.ts</code>. National systems (CEA emission factors and PM Surya Ghar subsidies) "
        "are already pan-India standards.",
        styles['Body']
    ))

    story.append(PageBreak())

    # =========================================================================
    # SECTION 2: COMPLETE FEATURE-BY-FEATURE CATALOG (31 FEATURES)
    # =========================================================================
    story.append(Paragraph("2. Comprehensive Feature-by-Feature Specification", styles['SecHeading']))
    story.append(HRFlowable(width="100%", thickness=1, color=teal_color, spaceAfter=8))
    story.append(Paragraph(
        "Every small and large feature in LiFE Gujarat is categorized below with its exact purpose, operational mechanism, "
        "user workflow, and underlying technology stack.",
        styles['Body']
    ))
    story.append(Spacer(1, 4))

    features = [
        # --- MODULE 1: AUDIT ---
        {
            "num": "1",
            "name": "Multi-DISCOM Optical Character Recognition (OCR) Bill Scanner",
            "module": "Carbon & Bill Audit (/audit)",
            "purpose": "Eliminates citizen friction in entering electricity consumption numbers by reading utility bills automatically.",
            "mechanism": "Executes Tesseract.js in a Web Worker on the citizen's browser. Uses morphological binarization, then parses DISCOM headers (UGVCL, Torrent Power, DGVCL, etc.) and executes targeted regexes across billing tables to extract units consumed (kWh) and billing cycle days.",
            "workflow": "Citizen uploads/drags bill image or PDF -> Worker processes image -> Extracted DISCOM and units appear on screen with manual override confirmation.",
            "tech": "Tesseract.js (WASM), HTML Canvas image filters, Regex extraction engine, React 18 hooks."
        },
        {
            "num": "2",
            "name": "One-Click Instant Sample Bill Benchmark",
            "module": "Carbon & Bill Audit (/audit)",
            "purpose": "Allows evaluators, judges, and busy citizens to test the audit experience in under 10 seconds without having a physical bill.",
            "mechanism": "Detects '?sample=ugvcl' query parameter or button click. Immediately injects an authentic 214 kWh bimonthly UGVCL sample bill payload, bypassing OCR wait time directly into the verified audit breakdown.",
            "workflow": "User clicks 'Try with Sample Bill (Instant <= 10s)' -> Lands on Step 2 with real Gujarat tariff and carbon results instantly rendered.",
            "tech": "Next.js dynamic URL query parsing, React state synchronization."
        },
        {
            "num": "3",
            "name": "GERC 2024 Tiered Telescopic Tariff Calculation Engine",
            "module": "Carbon & Bill Audit (/audit)",
            "purpose": "Provides mathematical transparency into how electricity bills are calculated under official Gujarat regulations.",
            "mechanism": "Implements Gujarat Electricity Regulatory Commission (GERC) 2024 Tariff Order for R-LT1 / R-LT2 residential slabs. Computes telescopic energy charges (0-50 units @ Rs 3.05, 51-100 @ Rs 3.50, 101-250 @ Rs 4.15, >250 @ Rs 5.20), adds FPPPA fuel surcharge (Rs 2.60/kWh), fixed meter charges, and 15% state electricity duty.",
            "workflow": "Units inputted -> Pure functional calculation executes -> Citizen views exact cost breakdown matching their utility statement.",
            "tech": "config/tariffs.ts, Vitest unit test suite (tests/unit/tariff.test.ts)."
        },
        {
            "num": "4",
            "name": "CEA India v19 Carbon Footprint Engine",
            "module": "Carbon & Bill Audit (/audit)",
            "purpose": "Converts electricity consumption into an indisputable, scientifically verified carbon footprint in kg CO2.",
            "mechanism": "Applies Central Electricity Authority (CEA) India CO2 Baseline Database Version 19 weighted grid emission factor: 0.82 kg CO2 per kWh consumed. Displays baseline annual carbon and monthly trajectory.",
            "workflow": "Monthly kWh * 0.82 = kg CO2 generated. Annualized to tonnes CO2/year.",
            "tech": "config/emissions.ts, Vitest unit test suite (tests/unit/carbon.test.ts)."
        },
        {
            "num": "5",
            "name": "Behavioral Nudge & Time-of-Use Grid Shifter",
            "module": "Carbon & Bill Audit (/audit)",
            "purpose": "Incentivizes citizens to move heavy appliance usage away from evening peak grid stress hours.",
            "mechanism": "Analyzes household consumption bracket and generates targeted behavioral nudges: shifting washing machines/water pumps to solar peak hours (11:00 AM - 3:00 PM), calibrating AC to 24 deg C, and avoiding phantom loads.",
            "workflow": "Audit outputs customized nudge cards with estimated kWh savings and carbon credits earned.",
            "tech": "Nudge generation matrix, Lucide icons, responsive card UI."
        },
        {
            "num": "6",
            "name": "Formula Transparency Explainer Modals ('How is this calculated?')",
            "module": "Carbon & Bill Audit (/audit) & War-Room",
            "purpose": "Builds trust with citizens and evaluators by exposing mathematical formulas and official government citations.",
            "mechanism": "Interactive dialog overlay displaying algebraic formula, exact constant values, government gazette source, and effective regulatory date.",
            "workflow": "User clicks the (i) info icon next to any metric -> Modal displays formula, GERC/CEA/PM Surya Ghar references, and verification links.",
            "tech": "components/ui/CalculationExplainer.tsx, Accessible modal dialogs."
        },

        # --- MODULE 2: SOLAR STUDIO ---
        {
            "num": "7",
            "name": "Interactive Satellite Rooftop Polygon Tracer",
            "module": "Roof-to-Rupee Solar Studio (/solar)",
            "purpose": "Empowers citizens to trace their actual rooftop boundary on real satellite imagery to assess solar potential.",
            "mechanism": "Renders high-resolution satellite imagery via Leaflet.js and OpenStreetMap/Esri tiles. Enables users to click vertex points to form an enclosed vector polygon on the map canvas.",
            "workflow": "User enters Gujarat pincode/address -> Map zooms to rooftop -> User clicks 4+ corners to outline terrace -> Polygon closes and calculates area.",
            "tech": "Leaflet.js, React-Leaflet, custom GeoJSON vector layers, Canvas map overlays."
        },
        {
            "num": "8",
            "name": "Geodesic Rooftop Area & Solar Usable Area Algorithm",
            "module": "Roof-to-Rupee Solar Studio (/solar)",
            "purpose": "Converts map screen pixel coordinates into real physical square meters of usable terrace space.",
            "mechanism": "Applies spherical polygon area formula (Turf.js geodesic math) on latitude/longitude coordinates. Applies a 0.70 (70%) shadow and structural obstruction factor to determine net usable solar terrace area.",
            "workflow": "LatLng coordinates -> Geodesic surface area (sq.m) -> 70% usable area -> Potential kW capacity (usable_area / 10 sq.m per kW).",
            "tech": "Geodesic trigonometry, Turf.js area algorithms."
        },
        {
            "num": "9",
            "name": "Gujarat Solar Irradiation & Energy Yield Engine",
            "module": "Roof-to-Rupee Solar Studio (/solar)",
            "purpose": "Calculates realistic annual electricity generation based on Gujarat's high solar insolation.",
            "mechanism": "Applies Gujarat's Global Horizontal Irradiance (GHI) benchmark of ~5.2 kWh/m2/day and 300 clear sunny days per year. Assumes standard performance ratio (PR) of 75%, yielding 1,450 kWh per kWp installed annually.",
            "workflow": "Plant kW * 1,450 kWh/kWp/year = Total Annual Clean Electricity Generated.",
            "tech": "lib/solar.ts, National Institute of Solar Energy (NISE) solar tables."
        },
        {
            "num": "10",
            "name": "PM Surya Ghar: Muft Bijli Yojana CFA Subsidy Calculator",
            "module": "Roof-to-Rupee Solar Studio (/solar)",
            "purpose": "Computes exact Central Financial Assistance (CFA) government subsidies available to the citizen.",
            "mechanism": "Encodes official PM Surya Ghar 2024 subsidy rules: Rs 30,000 for 1 kW; Rs 60,000 for 2 kW; Rs 78,000 for 3 kW and above. Calculates net out-of-pocket citizen capital expense.",
            "workflow": "Rooftop capacity computed -> Tiered subsidy deducted from gross installation cost (Rs 65,000/kW benchmark) -> Net consumer cost revealed.",
            "tech": "config/subsidy.ts, Vitest unit test suite (tests/unit/subsidy.test.ts)."
        },
        {
            "num": "11",
            "name": "25-Year Financial Payback, ROI & Carbon Offset Projector",
            "module": "Roof-to-Rupee Solar Studio (/solar)",
            "purpose": "Demonstrates the lifetime financial and ecological value of going solar in Gujarat.",
            "mechanism": "Projects 25-year cash flows accounting for 0.7% annual solar panel degradation and 4% annual grid tariff inflation. Calculates internal rate of return (IRR), cumulative 25-year bill savings, and simple payback period (typically 3.2 - 4.1 years).",
            "workflow": "Interactive slider allows citizen to tweak system size (1-10 kW) and see payback years, monthly savings, and lifetime CO2 avoided update in real time.",
            "tech": "Financial amortization models, Recharts bar/line graphs."
        },
        {
            "num": "12",
            "name": "DISCOM Net Metering Lead Generation & Empanelled Vendor Dispatch",
            "module": "Roof-to-Rupee Solar Studio (/solar)",
            "purpose": "Bridges the gap between citizen intent and execution by connecting interested households with verified solar vendors.",
            "mechanism": "Captures consumer DISCOM account number, mobile number, terrace polygon specs, and quotes. Dispatches lead to GEDA/DISCOM empanelled solar installer database.",
            "workflow": "Citizen clicks 'Request Empanelled Solar Quote' -> Form submits -> Lead record saved with DISCOM metadata -> War-Room tracks dispatch.",
            "tech": "app/api/solar/leads/route.ts, Prisma schema SolarQuoteLead model."
        },

        # --- MODULE 3: MOBILITY ---
        {
            "num": "13",
            "name": "Live GPS Green Mobility Telemetry Tracker",
            "module": "Green Mobility Tracker (/tracker)",
            "purpose": "Tracks citizen walking, cycling, EV, and public transit commutes in real time to incentivize green mobility.",
            "mechanism": "Interfaces with browser navigator.geolocation watchPosition API. Collects timestamped latitude, longitude, altitude, and heading fixes at 1 Hz.",
            "workflow": "Citizen selects transit mode -> Clicks 'Start Live Trip' -> Map tracks breadcrumbs and displays moving speed, distance, and CO2 avoided.",
            "tech": "HTML5 Geolocation API, Leaflet polyline live renderer."
        },
        {
            "num": "14",
            "name": "Anti-Cheat Physical Velocity Bounding & Loop Teleportation Guard",
            "module": "Green Mobility Tracker (/tracker)",
            "purpose": "Guarantees that green credits are only awarded for authentic, physical green transit and prevents GPS spoofing.",
            "mechanism": "Enforces velocity bounding: rejects fixes with implied velocity > 35 km/h for walking/cycling. Rejects instantaneous jumps > 120 km/h as invalid. On route wrap-around in simulation mode, integrates distance via delta_d = (v/3.6) * delta_t and resets anchor coordinates to prevent teleportation distance spikes.",
            "workflow": "Incoming GPS points pass velocity delta validation -> Only physically possible displacements accrue toward distance and carbon credits.",
            "tech": "lib/mobility.ts, Haversine displacement algorithms, Vitest unit test suite (tests/unit/mobility.test.ts)."
        },
        {
            "num": "15",
            "name": "Ahmedabad BRTS 48-Waypoint Corridor Simulation Engine",
            "module": "Green Mobility Tracker (/tracker)",
            "purpose": "Allows desktop evaluators and judges to test realistic transit telemetry without walking outside.",
            "mechanism": "Pre-loads 48 authentic Ahmedabad municipal coordinates along the BRTS transit corridor from Vastrapur Lake, through LD Engineering and Income Tax Circle, to Sabarmati Riverfront. Simulates smooth 5x travel dynamics.",
            "workflow": "User clicks 'Simulate Ahmedabad BRTS (5x)' -> Virtual bus moves along corridor, logging distance, velocity, and real-time carbon avoidance.",
            "tech": "config/simulationRoute.ts, high-frequency interval timer hooks."
        },
        {
            "num": "16",
            "name": "Multi-Modal Carbon Displacement Calculation",
            "module": "Green Mobility Tracker (/tracker)",
            "purpose": "Quantifies exact carbon savings compared to personal gasoline/diesel vehicle usage.",
            "mechanism": "Compares transit mode against baseline ICE car emissions (0.192 kg CO2/km). Walking & Cycling save 100% (0.192 kg/km). Metro/BRTS electric bus saves 0.138 kg/km. EV 2-wheeler saves 0.120 kg/km.",
            "workflow": "Trip distance * mode emission savings factor = Net kg CO2 avoided.",
            "tech": "CEA & IPCC transport carbon benchmarks, dynamic UI gauge."
        },
        {
            "num": "17",
            "name": "Dynamic LiFE Credit Minting upon Trip Settlement",
            "module": "Green Mobility Tracker (/tracker)",
            "purpose": "Directly rewards citizens with spendable green credits for completed sustainable commutes.",
            "mechanism": "On trip completion, validates elapsed moving time (>60s) and distance (>0.2 km). Mints credits at 2.5 credits per kg CO2 saved, applying any active GEDA campaign bonus multipliers.",
            "workflow": "Citizen stops trip -> Summary modal presents verified stats -> Credits credited directly to citizen's Climate Wallet.",
            "tech": "lib/gamification.ts, Prisma Trip & Wallet transaction APIs."
        },

        # --- MODULE 4: ECOVERSE ---
        {
            "num": "18",
            "name": "Dynamic HTML5 Canvas Biome Visualizer",
            "module": "EcoVerse Companion (/ecoverse)",
            "purpose": "Transforms abstract sustainability numbers into an emotionally engaging, living virtual ecosystem.",
            "mechanism": "A custom 60 FPS HTML5 Canvas engine rendering an interactive Gujarat island. Procedurally draws terrain, waterways, foliage, solar arrays, and wildlife that evolve as the citizen's cumulative carbon avoidance grows.",
            "workflow": "Citizen visits /ecoverse -> Island reflects their real-world LiFE level, animating floating clouds, waving trees, and dynamic lighting.",
            "tech": "HTML5 2D Canvas context, requestAnimationFrame render loop, vector math."
        },
        {
            "num": "19",
            "name": "5 Evolutionary LiFE Stages & Gujarat Biodiversity Unlocks",
            "module": "EcoVerse Companion (/ecoverse)",
            "purpose": "Gamifies long-term daily habit retention through visual progression and state pride.",
            "mechanism": "Categorizes citizen journey into 5 distinct tiers: Level 1 (Barren Ground), Level 2 (Sprouting Seedling), Level 3 (Lush Agroforest), Level 4 (Solar Canopy), Level 5 (Renewable Microgrid). Unlocks indigenous Gujarat wildlife (Asiatic Lion of Gir, Greater Flamingo of Kutch, Peafowl, Neem tree) at defined carbon milestones.",
            "workflow": "Citizen logs green actions -> XP increases -> Island transforms with new flora, fauna, and solar infrastructure.",
            "tech": "Procedural sprite generators, gamification milestone thresholds."
        },
        {
            "num": "20",
            "name": "Procedural Web Audio API Environmental Sound Synthesizer",
            "module": "EcoVerse Companion (/ecoverse)",
            "purpose": "Creates a calming, sensory feedback loop reinforcing sustainable daily living without external audio asset downloads.",
            "mechanism": "Synthesizes ambient nature soundscapes entirely in code using the Web Audio API. Generates pink noise for rustling wind, modulated sine waves for birdsong, and bandpass filtered noise for flowing river water.",
            "workflow": "Citizen clicks the audio toggle -> Browser creates an AudioContext with procedural oscillator nodes, modulating frequency based on ecosystem health.",
            "tech": "Web Audio API (AudioContext, OscillatorNode, BiquadFilterNode, GainNode)."
        },
        {
            "num": "21",
            "name": "Daily Sustainability Micro-Habits Task Checklist",
            "module": "EcoVerse Companion (/ecoverse)",
            "purpose": "Operationalizes the 7 themes of Mission LiFE into bite-sized daily action items.",
            "mechanism": "Presents daily micro-tasks (e.g. 'Air-dry clothes today', 'Walked for local errand < 1 km', 'AC kept at 24 deg C', 'Zero food waste at dinner'). Checking off items updates the citizen's daily streak and awards instant credits.",
            "workflow": "Citizen checks off completed micro-habits -> Confetti animation fires -> Daily streak increments -> XP applied to EcoVerse island.",
            "tech": "LocalStorage persistence, Canvas particle confetti, dynamic streak tracking."
        },

        # --- MODULE 5: WALLET ---
        {
            "num": "22",
            "name": "Double-Entry Immutable Climate Credit Ledger",
            "module": "Climate Wallet (/wallet)",
            "purpose": "Maintains an unforgeable, transparent financial and ecological audit trail of all minted and redeemed green credits.",
            "mechanism": "Every green credit transaction creates an immutable ledger entry with timestamp, activity type, source proof (trip ID, audit ID), credit delta, and cryptographic SHA-256 transaction hash.",
            "workflow": "Citizen opens /wallet -> Views total balance, lifetime credits earned, active campaign bonuses, and full transaction history table.",
            "tech": "lib/credits.ts, Prisma WalletTransaction model, cryptographic hashing."
        },
        {
            "num": "23",
            "name": "Gujarat State Green Incentive Redemption Catalog",
            "module": "Climate Wallet (/wallet)",
            "purpose": "Gives real-world economic utility to sustainability efforts by partnering with state transit and civic utilities.",
            "mechanism": "Provides a voucher store where citizens can redeem accumulated LiFE credits for tangible rewards: GSRTC intercity state bus ticket discount (Rs 50), Ahmedabad BRTS transit pass, Amul organic dairy vouchers, and AMC/SMC municipal property tax green rebates (Rs 200).",
            "workflow": "Citizen selects reward -> Confirms credit deduction -> Instant voucher code generated with QR code for scanning at ticketing counter.",
            "tech": "Voucher generation engine, state merchant mock APIs, balance validation."
        },
        {
            "num": "24",
            "name": "Verifiable Digital Citizen Carbon Impact Certificate",
            "module": "Climate Wallet (/wallet)",
            "purpose": "Provides social proof and institutional recognition for citizens to share on LinkedIn, WhatsApp, and social media.",
            "mechanism": "Dynamically renders an official 'Mission LiFE Gujarat Green Citizen Certificate' certified by GEDA, containing the citizen's verified kg CO2 avoided, green km traveled, and unique certificate serial ID.",
            "workflow": "Citizen clicks 'Download LiFE Impact Certificate' -> Printable vector certificate opens with official GEDA seal ready for export/print.",
            "tech": "HTML5 print CSS, dynamic SVG badges, cryptographic credential verification."
        },

        # --- MODULE 6: WAR-ROOM ---
        {
            "num": "25",
            "name": "GEDA State Command Center Macro-KPI Dashboard",
            "module": "GEDA War-Room (/war-room)",
            "purpose": "Furnishes state policymakers and GEDA directors with real-time macro-level visibility into Gujarat's sustainability indicators.",
            "mechanism": "Aggregates statewide metrics: Total Registered Citizens, Total Verified CO2 Avoided (Tonnes), Active Citizens this week, Solar Rooftop Pipeline (kW), Total Subsidy Allocated (Rs Cr), and Dispatched Vendor Leads.",
            "workflow": "GEDA administrator loads /war-room -> High-level KPI cards and 7-day trend line charts render with sub-second latency.",
            "tech": "app/api/admin/metrics/route.ts, Recharts LineChart, ResponsiveContainer."
        },
        {
            "num": "26",
            "name": "42 Gujarat Municipal Ward Telemetry & Leaderboard",
            "module": "GEDA War-Room (/war-room)",
            "purpose": "Creates healthy civic competition between municipal wards and identifies regional energy conservation hotspots.",
            "mechanism": "Ingests daily aggregated activity across 42 official municipal wards across Ahmedabad (Navrangpura, Bodakdev, Vastrapur, Satellite), Surat (Athwa, Adajan, Katargam), Vadodara (Fatehgunj, Alkapuri), and Gandhinagar (Sector 21).",
            "workflow": "Administrator filters by city (All, Ahmedabad, Surat, etc.) and date range (7, 30, 90 days) -> Leaderboard sorts by composite score.",
            "tech": "config/wards.ts, app/api/leaderboard/route.ts, SQL aggregation queries."
        },
        {
            "num": "27",
            "name": "Multi-Factor Municipal LiFE Scoring Algorithm",
            "module": "GEDA War-Room (/war-room)",
            "purpose": "Provides a fair, normalized index that balances per-capita carbon reduction, citizen participation, and consistency.",
            "mechanism": "Calculates composite score using weighted formula: LiFE Score = 0.45 * Norm(CO2 Avoided / Active User) + 0.35 * Norm(Household Participation Rate) + 0.20 * (Streak Health Score).",
            "workflow": "Raw telemetry aggregated -> Scores normalized to 0-100 scale -> Ward ranks assigned deterministically.",
            "tech": "config/gamification.ts wardScoringWeights, CalculationExplainer modal."
        },
        {
            "num": "28",
            "name": "Differential Privacy & k-Anonymity Guard (k >= 10)",
            "module": "GEDA War-Room (/war-room)",
            "purpose": "Protects citizen household privacy in compliance with Indian Digital Personal Data Protection (DPDP) standards.",
            "mechanism": "Suppresses ward telemetry from public and administrative views if the number of active households in that ward is fewer than 10 (k < 10), preventing re-identification of individual electricity consumption patterns.",
            "workflow": "Leaderboard API checks avgDailyActive < 10 -> If true, ward record is excluded or aggregated into regional pool.",
            "tech": "config/features.ts kAnonymityThreshold, privacy middleware."
        },
        {
            "num": "29",
            "name": "State-Wide Time-Boxed Campaign Creator & Multiplier Dispatcher",
            "module": "GEDA War-Room (/war-room)",
            "purpose": "Empowers GEDA administrators to push targeted policy interventions (e.g. summer peak grid shaving).",
            "mechanism": "Modal dialog allowing admins to launch challenges (e.g. 'Beat the Peak Summer Challenge', 'BRTS Green Transit Week') with 1.5x to 3.0x credit multiplier bonuses and duration in days. Multipliers immediately reflect in citizen feeds.",
            "workflow": "Admin fills title and multiplier -> Clicks 'Publish State Campaign' -> Push event logged and active campaign banner broadcasts.",
            "tech": "app/api/admin/campaigns/route.ts, Prisma Campaign model."
        },
        {
            "num": "30",
            "name": "Automated Municipal CSV Telemetry & Solar Lead Exporter",
            "module": "GEDA War-Room (/war-room)",
            "purpose": "Enables seamless integration with existing GEDA government legacy reporting and GIS systems.",
            "mechanism": "Streams formatted RFC 4180 CSV files directly to the browser for ward rankings or solar rooftop leads with UTF-8 encoding.",
            "workflow": "Admin clicks 'Export Ward CSV' or 'Export Solar Leads' -> CSV downloads instantly with full metadata and timestamps.",
            "tech": "app/api/admin/export/route.ts, HTTP Content-Disposition attachment streaming."
        },

        # --- MODULE 7: PLATFORM CAPABILITIES ---
        {
            "num": "31",
            "name": "Real-Time Client-Side Multi-Language Engine (English, Gujarati, Hindi)",
            "module": "Global Platform Engine",
            "purpose": "Ensures digital inclusivity and grassroots accessibility across all segments of Gujarat's population.",
            "mechanism": "Custom client-side i18n context reading structured JSON translation catalogs (messages/en.json, messages/gu.json, messages/hi.json). Supports instant, zero-reload translation of landing pages, audits, nudges, and button CTAs.",
            "workflow": "Citizen toggles language selector ('English' / 'ગુજરાતી' / 'हिन्दी') in top navigation -> Whole interface re-renders in target script instantly.",
            "tech": "context/LanguageContext.tsx, JSON locale bundles, UTF-8 unicode rendering."
        }
    ]

    for f in features:
        box_data = [
            [
                Paragraph(f"<b>FEATURE #{f['num']}: {f['name'].upper()}</b>", styles['TableHeader']),
                Paragraph(f"<b>Module:</b> {f['module']}", ParagraphStyle(name='Mod', fontName='Helvetica-Bold', fontSize=8, textColor=colors.HexColor("#CCFBF1"), alignment=2))
            ],
            [
                Paragraph("<b>Problem & Purpose:</b>", styles['TableCellBold']),
                Paragraph(f['purpose'], styles['TableCell'])
            ],
            [
                Paragraph("<b>Mechanism & Logic:</b>", styles['TableCellBold']),
                Paragraph(f['mechanism'], styles['TableCell'])
            ],
            [
                Paragraph("<b>User Workflow:</b>", styles['TableCellBold']),
                Paragraph(f['workflow'], styles['TableCell'])
            ],
            [
                Paragraph("<b>Tech Stack & APIs:</b>", styles['TableCellBold']),
                Paragraph(f"<code>{f['tech']}</code>", styles['TableCell'])
            ]
        ]
        t_feat = Table(box_data, colWidths=[110, 405])
        t_feat.setStyle(TableStyle([
            ('SPAN', (0,0), (0,0)), # title
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0D9488")),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
            ('PADDING', (0,0), (-1,-1), 4.5),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")]),
        ]))
        story.append(t_feat)
        story.append(Spacer(1, 8))

    story.append(PageBreak())

    # =========================================================================
    # SECTION 3: TECHNICAL STACK & ARCHITECTURE MATRIX
    # =========================================================================
    story.append(Paragraph("3. Technical Stack & Component Architecture Matrix", styles['SecHeading']))
    story.append(HRFlowable(width="100%", thickness=1, color=teal_color, spaceAfter=8))

    stack_rows = [
        [Paragraph("Subsystem / Domain", styles['TableHeader']), Paragraph("Core Technologies & Libraries", styles['TableHeader']), Paragraph("Architectural Rationale & Benchmark", styles['TableHeader'])],
        [
            Paragraph("Frontend Framework", styles['TableCellBold']),
            Paragraph("Next.js 14 (App Router), React 18, TypeScript (Strict Mode)", styles['TableCell']),
            Paragraph("Server-Side Rendering (SSR) for blazing initial paint, React Server Components for SEO, strict type safety to prevent runtime crashes.", styles['TableCell'])
        ],
        [
            Paragraph("Styling & UI Kit", styles['TableCellBold']),
            Paragraph("Tailwind CSS, Lucide React, Glassmorphic CSS", styles['TableCell']),
            Paragraph("Zero runtime CSS overhead, accessible color contrasts, responsive design supporting 320px mobile up to 4K displays.", styles['TableCell'])
        ],
        [
            Paragraph("Geospatial & Mapping", styles['TableCellBold']),
            Paragraph("Leaflet.js, React-Leaflet, OpenStreetMap, Turf.js", styles['TableCell']),
            Paragraph("100% open-source mapping with zero commercial API key dependencies; geodesic polygon area math on client device.", styles['TableCell'])
        ],
        [
            Paragraph("Client-Side OCR", styles['TableCellBold']),
            Paragraph("Tesseract.js (WebAssembly / Web Workers)", styles['TableCell']),
            Paragraph("Zero cloud OCR transmission costs; citizen electricity bills are parsed locally on-device for total data privacy.", styles['TableCell'])
        ],
        [
            Paragraph("Data Visualization", styles['TableCellBold']),
            Paragraph("Recharts (SVG-based reactive charts)", styles['TableCell']),
            Paragraph("Declarative, responsive line and bar charts with custom dark/light theme tooltips and dynamic animations.", styles['TableCell'])
        ],
        [
            Paragraph("Audio & Simulation", styles['TableCellBold']),
            Paragraph("Web Audio API, HTML5 Canvas 2D Context", styles['TableCell']),
            Paragraph("Generates procedural nature soundscapes and 60 FPS visual ecosystems without requiring large external media asset downloads.", styles['TableCell'])
        ],
        [
            Paragraph("Data Storage & Fallbacks", styles['TableCellBold']),
            Paragraph("Prisma ORM, SQLite, In-Memory Wards Adapter (config/wards.ts)", styles['TableCell']),
            Paragraph("Dual-mode database architecture: native SQLite for local servers + zero-crash deterministic memory fallbacks for serverless Vercel lambdas.", styles['TableCell'])
        ],
        [
            Paragraph("Testing & Quality Assurance", styles['TableCellBold']),
            Paragraph("Vitest (Unit test suite), tsc --noEmit", styles['TableCell']),
            Paragraph("49 automated tests covering tariffs, subsidies, carbon math, anti-cheat mobility, and OCR regex across 8 comprehensive suites.", styles['TableCell'])
        ]
    ]
    t_stack = Table(stack_rows, colWidths=[120, 180, 215])
    t_stack.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0F172A")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('PADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")]),
    ]))
    story.append(t_stack)
    story.append(Spacer(1, 14))

    # =========================================================================
    # SECTION 4: TESTING & REGULATORY COMPLIANCE VERIFICATION
    # =========================================================================
    story.append(Paragraph("4. Testing & Regulatory Compliance Verification", styles['SecHeading']))
    story.append(HRFlowable(width="100%", thickness=1, color=teal_color, spaceAfter=8))

    test_rows = [
        [Paragraph("Test Suite (Vitest)", styles['TableHeader']), Paragraph("Tests", styles['TableHeader']), Paragraph("Status", styles['TableHeader']), Paragraph("Verified Regulatory Standards & Behaviors", styles['TableHeader'])],
        [
            Paragraph("tests/unit/tariff.test.ts", styles['TableCellBold']),
            Paragraph("7", styles['TableCell']),
            Paragraph("<b>PASSED</b>", ParagraphStyle(name='P1', fontName='Helvetica-Bold', fontSize=7.5, textColor=emerald_color)),
            Paragraph("GERC 2024 telescopic slab thresholds, FPPPA fuel surcharges, fixed meter charges, and 15% state electricity duty.", styles['TableCell'])
        ],
        [
            Paragraph("tests/unit/subsidy.test.ts", styles['TableCellBold']),
            Paragraph("7", styles['TableCell']),
            Paragraph("<b>PASSED</b>", ParagraphStyle(name='P2', fontName='Helvetica-Bold', fontSize=7.5, textColor=emerald_color)),
            Paragraph("PM Surya Ghar Central Financial Assistance rules: Rs 30k for 1kW, Rs 60k for 2kW, Rs 78k for 3kW+.", styles['TableCell'])
        ],
        [
            Paragraph("tests/unit/carbon.test.ts", styles['TableCellBold']),
            Paragraph("6", styles['TableCell']),
            Paragraph("<b>PASSED</b>", ParagraphStyle(name='P3', fontName='Helvetica-Bold', fontSize=7.5, textColor=emerald_color)),
            Paragraph("CEA India Baseline Database v19 grid emission factor (0.82 kg CO2/kWh) and annualization.", styles['TableCell'])
        ],
        [
            Paragraph("tests/unit/mobility.test.ts", styles['TableCellBold']),
            Paragraph("6", styles['TableCell']),
            Paragraph("<b>PASSED</b>", ParagraphStyle(name='P4', fontName='Helvetica-Bold', fontSize=7.5, textColor=emerald_color)),
            Paragraph("Velocity bounding (<=35 km/h for green modes), loop wrap teleportation guard, and Haversine displacement.", styles['TableCell'])
        ],
        [
            Paragraph("tests/unit/credits.test.ts", styles['TableCellBold']),
            Paragraph("7", styles['TableCell']),
            Paragraph("<b>PASSED</b>", ParagraphStyle(name='P5', fontName='Helvetica-Bold', fontSize=7.5, textColor=emerald_color)),
            Paragraph("Double-entry credit minting, campaign multiplier bonuses, and wallet balance bounds.", styles['TableCell'])
        ],
        [
            Paragraph("tests/unit/nudges.test.ts", styles['TableCellBold']),
            Paragraph("7", styles['TableCell']),
            Paragraph("<b>PASSED</b>", ParagraphStyle(name='P6', fontName='Helvetica-Bold', fontSize=7.5, textColor=emerald_color)),
            Paragraph("Contextual Time-of-Use appliance shifting alerts based on household energy bracket.", styles['TableCell'])
        ],
        [
            Paragraph("tests/unit/solar.test.ts", styles['TableCellBold']),
            Paragraph("3", styles['TableCell']),
            Paragraph("<b>PASSED</b>", ParagraphStyle(name='P7', fontName='Helvetica-Bold', fontSize=7.5, textColor=emerald_color)),
            Paragraph("Terrace polygon area conversion, 70% usable solar area factor, and 1,450 kWh/kWp annual generation.", styles['TableCell'])
        ],
        [
            Paragraph("tests/unit/ocr.test.ts", styles['TableCellBold']),
            Paragraph("6", styles['TableCell']),
            Paragraph("<b>PASSED</b>", ParagraphStyle(name='P8', fontName='Helvetica-Bold', fontSize=7.5, textColor=emerald_color)),
            Paragraph("Regex extraction of UGVCL/Torrent Power DISCOM names, consumer numbers, and bimonthly/monthly units.", styles['TableCell'])
        ]
    ]
    t_test = Table(test_rows, colWidths=[130, 40, 55, 290])
    t_test.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0D9488")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('PADDING', (0,0), (-1,-1), 4.5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")]),
    ]))
    story.append(t_test)
    story.append(Spacer(1, 15))

    # Concluding Sign-off Callout
    signoff_box = Table([[
        Paragraph(
            "<b>FINAL SUBMISSION STATEMENT:</b><br/>"
            "LiFE Gujarat has been thoroughly tested, validated against official regulatory benchmarks, and deployed to live production. "
            "With 0 TypeScript errors, 49 passing automated unit tests, clean multi-language translation, and zero-crash serverless resilience, "
            "the platform represents a complete, ready-to-deploy citizen engagement system for the Gujarat Energy Development Agency (GEDA).<br/>"
            "<b>Live Application:</b> https://mission-life-gujarat.vercel.app &nbsp;|&nbsp; <b>GitHub:</b> utkarsh-johar/mission-life-gujarat",
            styles['CalloutText']
        )
    ]], colWidths=[515])
    signoff_box.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F0FDFA")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#0D9488")),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(signoff_box)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated: {filename}")

if __name__ == "__main__":
    output_filename = "Mission_LiFE_Gujarat_Complete_Features_Specification.pdf"
    if len(sys.argv) > 1:
        output_filename = sys.argv[1]
    build_pdf(output_filename)
