export interface SimWaypoint {
  lat: number;
  lng: number;
  speed: number; // km/h
  mode: "WALK" | "CYCLE" | "BUS" | "STOP";
}

// 45 realistic waypoints along Ahmedabad BRTS Janmarg (Vastrapur -> Panjrapole -> University -> Riverfront)
export const AHMEDABAD_BRTS_SIMULATION_ROUTE: SimWaypoint[] = [
  // Phase 1: Walking from home to Vastrapur Lake bus stop (0 - 8s)
  { lat: 23.0353, lng: 72.5283, speed: 4.2, mode: "WALK" },
  { lat: 23.0358, lng: 72.5295, speed: 4.8, mode: "WALK" },
  { lat: 23.0363, lng: 72.5312, speed: 5.2, mode: "WALK" },
  { lat: 23.0369, lng: 72.5328, speed: 4.9, mode: "WALK" },
  { lat: 23.0375, lng: 72.5345, speed: 5.0, mode: "WALK" },
  { lat: 23.0381, lng: 72.5362, speed: 4.6, mode: "WALK" },
  { lat: 23.0386, lng: 72.5378, speed: 3.8, mode: "WALK" },
  
  // Phase 2: Boarding stop at Vastrapur BRTS Station (9 - 11s)
  { lat: 23.0388, lng: 72.5385, speed: 0.0, mode: "STOP" },
  { lat: 23.0388, lng: 72.5385, speed: 0.0, mode: "STOP" },

  // Phase 3: Electric BRTS bus accelerates towards Panjrapole (12 - 20s)
  { lat: 23.0392, lng: 72.5410, speed: 18.5, mode: "BUS" },
  { lat: 23.0398, lng: 72.5442, speed: 28.0, mode: "BUS" },
  { lat: 23.0405, lng: 72.5480, speed: 35.4, mode: "BUS" },
  { lat: 23.0412, lng: 72.5520, speed: 41.2, mode: "BUS" },
  { lat: 23.0418, lng: 72.5560, speed: 44.0, mode: "BUS" },
  { lat: 23.0415, lng: 72.5595, speed: 38.6, mode: "BUS" },
  { lat: 23.0408, lng: 72.5628, speed: 24.0, mode: "BUS" },

  // Phase 4: Panjrapole Traffic Signal Stop (21 - 23s)
  { lat: 23.0402, lng: 72.5645, speed: 0.0, mode: "STOP" },
  { lat: 23.0402, lng: 72.5645, speed: 0.0, mode: "STOP" },

  // Phase 5: Cruising towards Gujarat University & Navrangpura (24 - 34s)
  { lat: 23.0395, lng: 72.5670, speed: 22.0, mode: "BUS" },
  { lat: 23.0386, lng: 72.5710, speed: 32.5, mode: "BUS" },
  { lat: 23.0375, lng: 72.5755, speed: 39.0, mode: "BUS" },
  { lat: 23.0362, lng: 72.5800, speed: 43.5, mode: "BUS" },
  { lat: 23.0348, lng: 72.5845, speed: 42.0, mode: "BUS" },
  { lat: 23.0335, lng: 72.5888, speed: 38.0, mode: "BUS" },
  { lat: 23.0322, lng: 72.5925, speed: 31.0, mode: "BUS" },
  { lat: 23.0310, lng: 72.5955, speed: 20.0, mode: "BUS" },

  // Phase 6: Navrangpura Station Stop (35 - 37s)
  { lat: 23.0305, lng: 72.5970, speed: 0.0, mode: "STOP" },
  { lat: 23.0305, lng: 72.5970, speed: 0.0, mode: "STOP" },

  // Phase 7: Final stretch across Ashram Road to Sabarmati Riverfront (38 - 48s)
  { lat: 23.0298, lng: 72.6005, speed: 26.0, mode: "BUS" },
  { lat: 23.0290, lng: 72.6045, speed: 36.0, mode: "BUS" },
  { lat: 23.0282, lng: 72.6085, speed: 42.0, mode: "BUS" },
  { lat: 23.0275, lng: 72.6125, speed: 39.0, mode: "BUS" },
  { lat: 23.0268, lng: 72.6160, speed: 28.5, mode: "BUS" },
  { lat: 23.0262, lng: 72.6185, speed: 14.0, mode: "BUS" },

  // Phase 8: Alighting at Sabarmati Riverfront Promenade & Walking (49 - 55s)
  { lat: 23.0258, lng: 72.6198, speed: 0.0, mode: "STOP" },
  { lat: 23.0255, lng: 72.6208, speed: 4.5, mode: "WALK" },
  { lat: 23.0252, lng: 72.6218, speed: 4.8, mode: "WALK" },
  { lat: 23.0248, lng: 72.6228, speed: 4.2, mode: "WALK" },
  { lat: 23.0245, lng: 72.6238, speed: 3.9, mode: "WALK" },
];
