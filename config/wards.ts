export interface WardInfo {
  id: string;
  name: string;
  city: "Ahmedabad" | "Gandhinagar" | "Surat" | "Vadodara";
  pincode: string;
  discom: "UGVCL" | "DGVCL" | "MGVCL" | "PGVCL" | "TORRENT_POWER";
  lat: number;
  lng: number;
  households: number;
}

export const GUJARAT_WARDS: WardInfo[] = [
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

export function getDeterministicWardsLeaderboard(cityFilter?: string | null, rangeDays = 30) {
  const filtered = cityFilter && cityFilter !== "All"
    ? GUJARAT_WARDS.filter((w) => w.city.toLowerCase() === cityFilter.toLowerCase())
    : GUJARAT_WARDS;

  const multiplier = rangeDays / 30;

  const scored = filtered.map((w, index) => {
    // Deterministic pseudo-metric based on hash/index
    const baseActive = Math.round(180 + ((index * 37) % 240));
    const activeUsers = Math.round(baseActive * Math.min(1.5, Math.max(0.6, multiplier)));
    const totalKgCo2 = Math.round(activeUsers * (12.4 + ((index * 7) % 8)) * multiplier * 10) / 10;
    const totalGreenKm = Math.round(activeUsers * (22 + ((index * 13) % 18)) * multiplier);
    const solarPolygons = Math.round(8 + ((index * 5) % 25));
    const solarLeads = Math.round(solarPolygons * 0.4);
    const lifeScore = Math.round((72 + ((index * 11) % 26) + (activeUsers / 30)) * 10) / 10;

    return {
      wardId: w.id,
      wardName: w.name,
      city: w.city,
      pincode: w.pincode,
      discom: w.discom,
      centroid: { lat: w.lat, lng: w.lng },
      households: w.households,
      activeUsers,
      totalKgCo2,
      totalTonnesCo2: Math.round((totalKgCo2 / 1000) * 10) / 10,
      totalGreenKm,
      solarPolygons,
      solarLeads,
      lifeScore,
    };
  });

  scored.sort((a, b) => b.lifeScore - a.lifeScore);

  return scored.map((w, idx) => ({
    rank: idx + 1,
    ...w,
  }));
}
