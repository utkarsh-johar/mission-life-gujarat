import { PrismaClient } from "@prisma/client";
import { TARIFF_PLANS } from "../config/tariffs";

const prisma = new PrismaClient();

// Deterministic Pseudo-Random Generator (Linear Congruential Generator)
function createSeededRandom(seed = 123456789) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

const random = createSeededRandom(42);

interface WardSeed {
  id: string;
  name: string;
  city: "Ahmedabad" | "Gandhinagar" | "Surat" | "Vadodara";
  pincode: string;
  discom: "UGVCL" | "DGVCL" | "MGVCL" | "PGVCL" | "TORRENT_POWER";
  lat: number;
  lng: number;
  households: number;
}

const SEED_WARDS: WardSeed[] = [
  // Ahmedabad (Torrent Power & UGVCL)
  { id: "AMD-NAV", name: "Navrangpura", city: "Ahmedabad", pincode: "380009", discom: "TORRENT_POWER", lat: 23.0365, lng: 72.5611, households: 42000 },
  { id: "AMD-VAS", name: "Vastrapur", city: "Ahmedabad", pincode: "380015", discom: "TORRENT_POWER", lat: 23.0353, lng: 72.5283, households: 48000 },
  { id: "AMD-BOD", name: "Bodakdev", city: "Ahmedabad", pincode: "380054", discom: "TORRENT_POWER", lat: 23.0428, lng: 72.5098, households: 39000 },
  { id: "AMD-MAN", name: "Maninagar", city: "Ahmedabad", pincode: "380008", discom: "TORRENT_POWER", lat: 22.9968, lng: 72.6018, households: 55000 },
  { id: "AMD-SAB", name: "Sabarmati", city: "Ahmedabad", pincode: "380005", discom: "TORRENT_POWER", lat: 23.0827, lng: 72.5855, households: 36000 },
  { id: "AMD-PAL", name: "Paldi", city: "Ahmedabad", pincode: "380007", discom: "TORRENT_POWER", lat: 23.0134, lng: 72.5627, households: 41000 },
  { id: "AMD-NAR", name: "Naroda", city: "Ahmedabad", pincode: "382330", discom: "UGVCL", lat: 23.0694, lng: 72.6565, households: 52000 },
  { id: "AMD-GHA", name: "Ghatlodiya", city: "Ahmedabad", pincode: "380061", discom: "TORRENT_POWER", lat: 23.0652, lng: 72.5412, households: 47000 },
  { id: "AMD-JOD", name: "Jodhpur", city: "Ahmedabad", pincode: "380015", discom: "TORRENT_POWER", lat: 23.0195, lng: 72.5187, households: 44000 },
  { id: "AMD-CHA", name: "Chandkheda", city: "Ahmedabad", pincode: "382424", discom: "UGVCL", lat: 23.1118, lng: 72.5834, households: 46000 },
  { id: "AMD-BAP", name: "Bapunagar", city: "Ahmedabad", pincode: "380024", discom: "TORRENT_POWER", lat: 23.0375, lng: 72.6253, households: 58000 },
  { id: "AMD-THA", name: "Thaltej", city: "Ahmedabad", pincode: "380059", discom: "TORRENT_POWER", lat: 23.0531, lng: 72.5056, households: 43000 },

  // Gandhinagar (Torrent Power & UGVCL)
  { id: "GND-SEC10", name: "Sector 10 (Vidhan Sabha)", city: "Gandhinagar", pincode: "382010", discom: "TORRENT_POWER", lat: 23.2167, lng: 72.65, households: 18000 },
  { id: "GND-SEC21", name: "Sector 21", city: "Gandhinagar", pincode: "382021", discom: "TORRENT_POWER", lat: 23.235, lng: 72.639, households: 22000 },
  { id: "GND-SEC07", name: "Sector 7", city: "Gandhinagar", pincode: "382007", discom: "TORRENT_POWER", lat: 23.221, lng: 72.662, households: 21000 },
  { id: "GND-SEC28", name: "Sector 28 GIDC", city: "Gandhinagar", pincode: "382028", discom: "UGVCL", lat: 23.255, lng: 72.652, households: 15000 },
  { id: "GND-INF", name: "Infocity / GIFT Corridor", city: "Gandhinagar", pincode: "382009", discom: "UGVCL", lat: 23.191, lng: 72.628, households: 27000 },
  { id: "GND-KUD", name: "Kudasan", city: "Gandhinagar", pincode: "382421", discom: "UGVCL", lat: 23.178, lng: 72.638, households: 31000 },
  { id: "GND-SAR", name: "Sargasan", city: "Gandhinagar", pincode: "382421", discom: "UGVCL", lat: 23.189, lng: 72.618, households: 29000 },
  { id: "GND-VAV", name: "Vavol", city: "Gandhinagar", pincode: "382016", discom: "UGVCL", lat: 23.218, lng: 72.615, households: 24000 },
  { id: "GND-SEC16", name: "Sector 16", city: "Gandhinagar", pincode: "382016", discom: "TORRENT_POWER", lat: 23.238, lng: 72.648, households: 20000 },
  { id: "GND-SEC24", name: "Sector 24", city: "Gandhinagar", pincode: "382024", discom: "UGVCL", lat: 23.251, lng: 72.637, households: 19000 },

  // Surat (Torrent Power & DGVCL)
  { id: "SRT-ATH", name: "Athwa Lines", city: "Surat", pincode: "395007", discom: "TORRENT_POWER", lat: 21.1715, lng: 72.7958, households: 38000 },
  { id: "SRT-ADA", name: "Adajan", city: "Surat", pincode: "395009", discom: "TORRENT_POWER", lat: 21.1982, lng: 72.7932, households: 54000 },
  { id: "SRT-VES", name: "Vesu", city: "Surat", pincode: "395007", discom: "TORRENT_POWER", lat: 21.1442, lng: 72.7725, households: 45000 },
  { id: "SRT-VAR", name: "Varachha", city: "Surat", pincode: "395006", discom: "TORRENT_POWER", lat: 21.2186, lng: 72.8594, households: 62000 },
  { id: "SRT-KAT", name: "Katargam", city: "Surat", pincode: "395004", discom: "TORRENT_POWER", lat: 21.2285, lng: 72.8242, households: 59000 },
  { id: "SRT-RND", name: "Rander", city: "Surat", pincode: "395005", discom: "TORRENT_POWER", lat: 21.2162, lng: 72.7928, households: 41000 },
  { id: "SRT-PAL", name: "Pal / Gaurav Path", city: "Surat", pincode: "395009", discom: "TORRENT_POWER", lat: 21.1895, lng: 72.7681, households: 43000 },
  { id: "SRT-UDH", name: "Udhna", city: "Surat", pincode: "394210", discom: "DGVCL", lat: 21.1518, lng: 72.8464, households: 57000 },
  { id: "SRT-PND", name: "Pandesara", city: "Surat", pincode: "394221", discom: "DGVCL", lat: 21.1352, lng: 72.8315, households: 51000 },
  { id: "SRT-ALT", name: "Althan", city: "Surat", pincode: "395017", discom: "TORRENT_POWER", lat: 21.1565, lng: 72.8021, households: 42000 },

  // Vadodara (MGVCL)
  { id: "BRD-ALK", name: "Alkapuri", city: "Vadodara", pincode: "390007", discom: "MGVCL", lat: 22.3108, lng: 73.1706, households: 34000 },
  { id: "BRD-FAT", name: "Fatehgunj", city: "Vadodara", pincode: "390002", discom: "MGVCL", lat: 22.3218, lng: 73.1884, households: 39000 },
  { id: "BRD-GOT", name: "Gotri", city: "Vadodara", pincode: "390021", discom: "MGVCL", lat: 22.3164, lng: 73.1422, households: 44000 },
  { id: "BRD-MAN", name: "Manjalpur", city: "Vadodara", pincode: "390011", discom: "MGVCL", lat: 22.2685, lng: 73.1952, households: 53000 },
  { id: "BRD-KAP", name: "Karelibaug", city: "Vadodara", pincode: "390018", discom: "MGVCL", lat: 22.3275, lng: 73.2014, households: 46000 },
  { id: "BRD-AKO", name: "Akota", city: "Vadodara", pincode: "390020", discom: "MGVCL", lat: 22.2965, lng: 73.1678, households: 40000 },
  { id: "BRD-VAS", name: "Vasna-Bhayli", city: "Vadodara", pincode: "391410", discom: "MGVCL", lat: 22.2982, lng: 73.1215, households: 37000 },
  { id: "BRD-SAY", name: "Sayajigunj", city: "Vadodara", pincode: "390005", discom: "MGVCL", lat: 22.3082, lng: 73.1876, households: 33000 },
  { id: "BRD-WAG", name: "Waghodia Road", city: "Vadodara", pincode: "390019", discom: "MGVCL", lat: 22.2954, lng: 73.2382, households: 48000 },
  { id: "BRD-MAJ", name: "Makarpura", city: "Vadodara", pincode: "390014", discom: "MGVCL", lat: 22.2458, lng: 73.1945, households: 49000 },
];

const SEED_VENDORS = [
  { id: "VEN-01", name: "Gujarat SunPower Tech LLP", city: "Ahmedabad", districts: "Ahmedabad, Gandhinagar, Kheda", minKw: 1.0, maxKw: 25.0, phone: "+91 79 2658 1122", website: "https://sunpowergujarat.example.com", empanelmentRef: "GEDA/SOL/2024/089" },
  { id: "VEN-02", name: "Sabarmati Green Energy Solutions", city: "Ahmedabad", districts: "Ahmedabad, Mehsana, Gandhinagar", minKw: 2.0, maxKw: 50.0, phone: "+91 79 2744 3300", website: "https://sabarmatisolar.example.com", empanelmentRef: "GEDA/SOL/2024/112" },
  { id: "VEN-03", name: "Tapi Rooftop Solar Corp", city: "Surat", districts: "Surat, Navsari, Valsad", minKw: 1.0, maxKw: 30.0, phone: "+91 261 245 8899", website: "https://tapisolar.example.com", empanelmentRef: "GEDA/SOL/2024/204" },
  { id: "VEN-04", name: "Diamond City Renewable Engineering", city: "Surat", districts: "Surat, Bharuch", minKw: 3.0, maxKw: 100.0, phone: "+91 261 278 4411", website: "https://dcrenewables.example.com", empanelmentRef: "GEDA/SOL/2024/218" },
  { id: "VEN-05", name: "Baroda Solar Systems Pvt Ltd", city: "Vadodara", districts: "Vadodara, Anand, Panchmahal", minKw: 1.0, maxKw: 20.0, phone: "+91 265 233 7700", website: "https://barodasolar.example.com", empanelmentRef: "GEDA/SOL/2024/305" },
  { id: "VEN-06", name: "Sayaji Clean Power Ltd", city: "Vadodara", districts: "Vadodara, Chhota Udaipur, Bharuch", minKw: 2.0, maxKw: 40.0, phone: "+91 265 248 9922", website: "https://sayajipower.example.com", empanelmentRef: "GEDA/SOL/2024/319" },
  { id: "VEN-07", name: "Gandhinagar Eco-Surya Dynamics", city: "Gandhinagar", districts: "Gandhinagar, Sabarkantha, Ahmedabad", minKw: 1.0, maxKw: 15.0, phone: "+91 79 2322 6677", website: "https://ecosurya.example.com", empanelmentRef: "GEDA/SOL/2024/401" },
  { id: "VEN-08", name: "Saurashtra Surya Urja Kendra", city: "Rajkot", districts: "Rajkot, Jamnagar, Junagadh", minKw: 1.0, maxKw: 50.0, phone: "+91 281 257 1144", website: "https://saurashtrasolar.example.com", empanelmentRef: "GEDA/SOL/2024/512" },
  { id: "VEN-09", name: "North Gujarat Helios Power", city: "Mehsana", districts: "Mehsana, Patan, Banaskantha", minKw: 1.0, maxKw: 25.0, phone: "+91 2762 254 321", website: "https://heliosng.example.com", empanelmentRef: "GEDA/SOL/2024/620" },
  { id: "VEN-10", name: "Kutch Urja Vikas Solar", city: "Bhuj", districts: "Kutch, Morbi", minKw: 2.0, maxKw: 75.0, phone: "+91 2832 230 900", website: "https://kutchsolar.example.com", empanelmentRef: "GEDA/SOL/2024/733" },
  { id: "VEN-11", name: "Zenith CleanTech Gujarat", city: "Ahmedabad", districts: "All Gujarat Districts", minKw: 3.0, maxKw: 250.0, phone: "+91 79 4000 8800", website: "https://zenithcleantech.example.com", empanelmentRef: "GEDA/SOL/2024/015" },
  { id: "VEN-12", name: "Adani Solar Empanelled Partner (Western)", city: "Ahmedabad", districts: "Ahmedabad, Surat, Vadodara, Rajkot", minKw: 1.0, maxKw: 100.0, phone: "+91 79 2555 9900", website: "https://adanisolarpartner.example.com", empanelmentRef: "GEDA/SOL/2024/002" },
];

async function main() {
  console.log("🌱 Starting LiFE Gujarat Seed Script...");

  // 1. Seed Wards & PincodeMap
  console.log(`📍 Seeding ${SEED_WARDS.length} Gujarat Wards & PIN mappings...`);
  for (const w of SEED_WARDS) {
    await prisma.ward.upsert({
      where: { id: w.id },
      update: {
        name: w.name,
        city: w.city,
        pincode: w.pincode,
        discom: w.discom,
        centroidLat: w.lat,
        centroidLng: w.lng,
        estimatedHouseholds: w.households,
      },
      create: {
        id: w.id,
        name: w.name,
        city: w.city,
        pincode: w.pincode,
        discom: w.discom,
        centroidLat: w.lat,
        centroidLng: w.lng,
        estimatedHouseholds: w.households,
      },
    });

    await prisma.pincodeMap.upsert({
      where: { pincode: w.pincode },
      update: {
        city: w.city,
        district: w.city,
        wardId: w.id,
        discom: w.discom,
        verified: true,
      },
      create: {
        pincode: w.pincode,
        city: w.city,
        district: w.city,
        wardId: w.id,
        discom: w.discom,
        verified: true,
      },
    });
  }

  // 2. Seed Tariff Plans
  console.log("⚡ Seeding GERC Residential Tariff Plans for all 5 DISCOMs...");
  for (const [discomKey, plan] of Object.entries(TARIFF_PLANS)) {
    await prisma.tariffPlanRecord.upsert({
      where: { id: `TARIFF-${discomKey}` },
      update: {
        discom: plan.discom,
        asOf: new Date(plan.asOf),
        source: plan.source,
        fixedCharge: plan.fixedChargePerMonth,
        fuelSurcharge: plan.fuelSurchargePerKwh,
        dutyPct: plan.electricityDutyPct,
        slabs: JSON.stringify(plan.slabs),
      },
      create: {
        id: `TARIFF-${discomKey}` as string,
        discom: plan.discom,
        asOf: new Date(plan.asOf),
        source: plan.source,
        fixedCharge: plan.fixedChargePerMonth,
        fuelSurcharge: plan.fuelSurchargePerKwh,
        dutyPct: plan.electricityDutyPct,
        slabs: JSON.stringify(plan.slabs),
      },
    });
  }

  // 3. Seed Vendors
  console.log(`☀️ Seeding ${SEED_VENDORS.length} GEDA-Empanelled Solar Vendors...`);
  for (const v of SEED_VENDORS) {
    await prisma.vendor.upsert({
      where: { id: v.id },
      update: { ...v, isSample: true },
      create: { ...v, isSample: true },
    });
  }

  // 4. Seed Demo Users
  console.log("👤 Creating Demo Users (Citizen Asha & GEDA Admin)...");
  const demoCitizen = await prisma.user.upsert({
    where: { email: "citizen@demo.life.gov.in" },
    update: {
      displayName: "Asha Patel",
      role: "CITIZEN",
      locale: "en",
      wardId: "AMD-NAV",
      isSeeded: false,
    },
    create: {
      id: "demo-citizen-id",
      email: "citizen@demo.life.gov.in",
      displayName: "Asha Patel",
      role: "CITIZEN",
      locale: "en",
      wardId: "AMD-NAV",
      isSeeded: false,
    },
  });

  const demoAdmin = await prisma.user.upsert({
    where: { email: "admin@demo.life.gov.in" },
    update: {
      displayName: "K. R. Solanki (State Programme Officer)",
      role: "GEDA_ADMIN",
      locale: "en",
      wardId: "GND-SEC10",
      isSeeded: false,
    },
    create: {
      id: "demo-admin-id",
      email: "admin@demo.life.gov.in",
      displayName: "K. R. Solanki (State Programme Officer)",
      role: "GEDA_ADMIN",
      locale: "en",
      wardId: "GND-SEC10",
      isSeeded: false,
    },
  });

  // Seed baseline audit for demo citizen
  await prisma.baselineAudit.upsert({
    where: { id: "audit-demo-asha" },
    update: {},
    create: {
      id: "audit-demo-asha",
      userId: demoCitizen.id,
      monthlyKwh: 220,
      cookingFuel: "PNG",
      pngScmPerMonth: 18,
      commuteMode: "TWO_WHEELER",
      dailyKm: 16,
      workingDays: 26,
      electricityKg: 180.4,
      cookingKg: 36.0,
      commuteKg: 19.14,
      totalKg: 235.54,
      source: "SAMPLE",
      factorsVersion: "v1.0-2024",
    },
  });

  // Seed streak and wallet for demo citizen
  await prisma.streak.upsert({
    where: { userId: demoCitizen.id },
    update: { current: 12, best: 14, lastActiveDay: "2026-11-02", freezes: 1 },
    create: { userId: demoCitizen.id, current: 12, best: 14, lastActiveDay: "2026-11-02", freezes: 1 },
  });

  await prisma.creditLedger.createMany({
    data: [
      { userId: demoCitizen.id, delta: 50, reason: "Completed Baseline Carbon Audit" },
      { userId: demoCitizen.id, delta: 30, reason: "Saved Rooftop Solar Polygon (7.0 kW)" },
      { userId: demoCitizen.id, delta: 35, reason: "AC-Off Night Ventilation Challenge Accepted" },
      { userId: demoCitizen.id, delta: 40, reason: "Verified Metro Green Transit (8.4 km)" },
      { userId: demoCitizen.id, delta: 10, reason: "7-Day Streak Milestone Reward" },
    ],
  });

  // 5. Seed Synthetic Population (600 Citizens) & 60 Days of Historical Ward Activity
  console.log("👥 Generating ~600 Synthetic Gujarat Citizens & 60-day Ward Aggregates...");
  const firstNames = ["Aarav", "Dhaval", "Bhavik", "Jignesh", "Mehul", "Hiral", "Pooja", "Kinjal", "Nidhi", "Bhakti", "Ketan", "Parth", "Sonal", "Mital", "Rinkal", "Darshan"];
  const lastNames = ["Shah", "Patel", "Mehta", "Desai", "Joshi", "Panchal", "Bhatt", "Vora", "Chauhan", "Trivedi", "Solanki", "Gohil", "Parmar", "Dave"];

  const createdUserIds: string[] = [];

  for (let i = 0; i < 600; i++) {
    const ward = SEED_WARDS[Math.floor(random() * SEED_WARDS.length)];
    const fn = firstNames[Math.floor(random() * firstNames.length)];
    const ln = lastNames[Math.floor(random() * lastNames.length)];
    const user = await prisma.user.create({
      data: {
        id: `synth-user-${i}`,
        email: `citizen.${i}@sample.life.gujarat.in`,
        displayName: `${fn} ${ln}`,
        role: "CITIZEN",
        wardId: ward.id,
        isSeeded: true,
        createdAt: new Date(Date.now() - Math.floor(random() * 60) * 86400000),
      },
    });
    createdUserIds.push(user.id);
  }

  // 6. Generate 60 days of historical daily aggregates per ward
  console.log("📊 Building 60-day WardDailyAggregate table...");
  const today = new Date();
  const aggregateRows = [];

  for (const ward of SEED_WARDS) {
    for (let dayOffset = 59; dayOffset >= 0; dayOffset--) {
      const d = new Date(today);
      d.setDate(d.getDate() - dayOffset);
      const dayString = d.toISOString().slice(0, 10);

      // Realistic participation based on ward household size
      const activeUserBase = Math.floor(15 + random() * 45);
      const kgSaved = Math.round((activeUserBase * (1.2 + random() * 2.8)) * 100) / 100;
      const kwhShifted = Math.round((activeUserBase * (0.8 + random() * 1.5)) * 100) / 100;
      const greenKm = Math.round((activeUserBase * (3.5 + random() * 6.0)) * 100) / 100;
      const polygons = random() > 0.4 ? Math.floor(random() * 4) : 0;
      const leads = polygons > 0 && random() > 0.6 ? 1 : 0;

      aggregateRows.push({
        id: `AGG-${ward.id}-${dayString}`,
        wardId: ward.id,
        day: dayString,
        activeUsers: activeUserBase,
        kgCo2Saved: kgSaved,
        kwhShifted: kwhShifted,
        greenKm: greenKm,
        polygons: polygons,
        leads: leads,
      });
    }
  }

  // Batch insert aggregates
  for (let i = 0; i < aggregateRows.length; i += 200) {
    const chunk = aggregateRows.slice(i, i + 200);
    await prisma.wardDailyAggregate.createMany({
      data: chunk,
    });
  }

  // 7. Seed Active State-wide Campaign
  console.log("📢 Seeding Active Mission LiFE State Campaign...");
  await prisma.campaign.create({
    data: {
      id: "CAMP-2026-SUN",
      title: "Surya Gujarat Mega Week: 2x Credits on Rooftop Solar Feasibility",
      startsAt: new Date(Date.now() - 3 * 86400000),
      endsAt: new Date(Date.now() + 11 * 86400000),
      multiplier: 2.0,
      wardIds: JSON.stringify(SEED_WARDS.map((w) => w.id)),
    },
  });

  console.log("✅ LiFE Gujarat Database Seeding Completed Successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
