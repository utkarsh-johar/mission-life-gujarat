"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as turf from "@turf/turf";
import {
  MapPin,
  Layers,
  Crosshair,
  RotateCcw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Search,
  Loader2,
  FileText,
  Sparkles,
} from "lucide-react";

interface SolarMapStudioProps {
  onPolygonComplete: (geoJsonPolygon: any, areaSqM: number, centroid: [number, number]) => void;
  initialLat?: number;
  initialLng?: number;
}

export const SolarMapStudio: React.FC<SolarMapStudioProps> = ({
  onPolygonComplete,
  initialLat = 23.0353, // Ahmedabad / Vastrapur
  initialLng = 72.5283,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const polygonLayerRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const streetLayerRef = useRef<any>(null);

  const [vertices, setVertices] = useState<[number, number][]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(17);
  const [showStreets, setShowStreets] = useState(false);
  const [liveAreaSqM, setLiveAreaSqM] = useState<number>(0);
  const [kinksWarning, setKinksWarning] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Manual Coordinates Modal / Input (A11y alternative)
  const [showCoordInput, setShowCoordInput] = useState(false);
  const [coordText, setCoordText] = useState("");

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    let isMounted = true;

    async function initLeaflet() {
      const L = (await import("leaflet")).default;

      if (!isMounted || !mapContainerRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 17,
        maxZoom: 19,
        zoomControl: false,
      });

      L.control.zoom({ position: "topright" }).addTo(map);

      // Esri World Imagery Base Tiles
      const esriTileLayer = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution:
            'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
          maxZoom: 19,
        }
      ).addTo(map);

      // Optional Street Labels Overlay (OSM)
      const streetLayer = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{y}.png",
        {
          attribution: '&copy; OpenStreetMap contributors',
          opacity: 0.5,
          maxZoom: 19,
        }
      );
      streetLayerRef.current = streetLayer;

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;

      mapInstanceRef.current = map;

      // Track zoom level
      map.on("zoomend", () => {
        setCurrentZoom(map.getZoom());
      });

      // Click to add vertices while drawing
      map.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        setVertices((prev) => {
          const next: [number, number][] = [...prev, [lat, lng]];
          return next;
        });
      });
    }

    initLeaflet();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [initialLat, initialLng]);

  // Update Polygon and Live Area on Vertices Change
  useEffect(() => {
    async function renderPolygon() {
      if (!mapInstanceRef.current) return;
      const L = (await import("leaflet")).default;

      // Clear previous markers
      if (markersLayerRef.current) {
        markersLayerRef.current.clearLayers();
      }

      if (vertices.length === 0) {
        if (polygonLayerRef.current) {
          mapInstanceRef.current.removeLayer(polygonLayerRef.current);
          polygonLayerRef.current = null;
        }
        setLiveAreaSqM(0);
        setKinksWarning(null);
        return;
      }

      // Draw vertex circles
      vertices.forEach(([lat, lng], idx) => {
        const marker = L.circleMarker([lat, lng], {
          radius: 5,
          color: idx === 0 ? "#10b981" : "#f59e0b",
          fillColor: "#ffffff",
          fillOpacity: 0.9,
          weight: 2,
        });
        marker.bindTooltip(`P${idx + 1}`, { permanent: false });
        markersLayerRef.current.addLayer(marker);
      });

      // Update Polygon layer if >= 3 points
      if (vertices.length >= 3) {
        const latLngs = vertices.map(([lat, lng]) => [lat, lng]);

        // Turf Area & Kinks validation
        const turfCoords = vertices.map(([lat, lng]) => [lng, lat]);
        turfCoords.push(turfCoords[0]); // close polygon loop

        let hasKinks = false;
        try {
          const turfPoly = turf.polygon([turfCoords]);
          const kinks = turf.kinks(turfPoly);

          if (kinks.features.length > 0) {
            hasKinks = true;
            setKinksWarning("Overlapping polygon edges! Click 'Auto-Fix Overlap' to untangle.");
            try {
              const unkinked = turf.unkinkPolygon(turfPoly);
              const totalArea = unkinked.features.reduce((sum, f) => sum + turf.area(f), 0);
              setLiveAreaSqM(Math.round(totalArea * 10) / 10);
            } catch {
              setLiveAreaSqM(0);
            }
          } else {
            setKinksWarning(null);
            const area = Math.round(turf.area(turfPoly) * 10) / 10;
            setLiveAreaSqM(area);
          }
        } catch (e) {
          // ignore transient geometry
        }

        const polyStyle = hasKinks
          ? {
              color: "#f59e0b",
              fillColor: "#fbbf24",
              fillOpacity: 0.35,
              weight: 2.5,
              dashArray: "6, 6",
            }
          : {
              color: "#0d9488",
              fillColor: "#14b8a6",
              fillOpacity: 0.45,
              weight: 2.5,
              dashArray: undefined,
            };

        if (polygonLayerRef.current) {
          polygonLayerRef.current.setLatLngs(latLngs);
          polygonLayerRef.current.setStyle(polyStyle);
        } else {
          const poly = L.polygon(latLngs as any, polyStyle).addTo(mapInstanceRef.current);
          polygonLayerRef.current = poly;
        }
      } else {
        if (polygonLayerRef.current) {
          mapInstanceRef.current.removeLayer(polygonLayerRef.current);
          polygonLayerRef.current = null;
        }
        setLiveAreaSqM(0);
      }
    }

    renderPolygon();
  }, [vertices]);

  // Toggle Street overlay
  const handleToggleStreets = () => {
    if (!mapInstanceRef.current || !streetLayerRef.current) return;
    if (showStreets) {
      mapInstanceRef.current.removeLayer(streetLayerRef.current);
      setShowStreets(false);
    } else {
      streetLayerRef.current.addTo(mapInstanceRef.current);
      setShowStreets(true);
    }
  };

  // GPS Locate me
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 18, { duration: 1.5 });
        }
      },
      (err) => {
        setIsLocating(false);
        alert("Location permission denied. Please search your locality in the search bar above.");
      },
      { timeout: 8000 }
    );
  };

  // Nominatim Search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const results = await res.json();
        setSearchResults(results);
      }
    } catch (err) {
      console.warn("Search failed:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const selectSearchResult = (item: any) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([item.lat, item.lng], 18, { duration: 1.5 });
    }
    setSearchResults([]);
    setSearchQuery(item.displayName.split(",")[0]);
  };

  // Auto-untangle overlapping edges
  const handleAutoFixOverlap = () => {
    if (vertices.length < 3) return;
    try {
      const centerLat = vertices.reduce((sum, v) => sum + v[0], 0) / vertices.length;
      const centerLng = vertices.reduce((sum, v) => sum + v[1], 0) / vertices.length;

      // Sort points radially around centroid
      const sorted = [...vertices].sort((a, b) => {
        const angleA = Math.atan2(a[0] - centerLat, a[1] - centerLng);
        const angleB = Math.atan2(b[0] - centerLat, b[1] - centerLng);
        return angleA - angleB;
      });

      const turfCoords = sorted.map(([lat, lng]) => [lng, lat]);
      turfCoords.push(turfCoords[0]);
      const testPoly = turf.polygon([turfCoords]);
      const kinks = turf.kinks(testPoly);

      if (kinks.features.length === 0) {
        setVertices(sorted);
        setKinksWarning(null);
        return;
      }

      // Convex hull fallback if simple angular sort still crossed
      const points = turf.featureCollection(
        vertices.map(([lat, lng]) => turf.point([lng, lat]))
      );
      const hull = turf.convex(points);
      if (hull && hull.geometry && hull.geometry.coordinates[0]) {
        const ring = hull.geometry.coordinates[0];
        const newVertices: [number, number][] = ring.slice(0, -1).map(([lng, lat]) => [lat, lng]);
        setVertices(newVertices);
        setKinksWarning(null);
      }
    } catch (e) {
      console.warn("Auto-fix overlap error:", e);
    }
  };

  // Finish Drawing Polygon
  const handleCompletePolygon = () => {
    if (vertices.length < 3) {
      alert("Please click at least 3 points on your rooftop.");
      return;
    }

    let finalVertices = [...vertices];

    // If edges cross, untangle automatically
    if (kinksWarning) {
      const centerLat = finalVertices.reduce((sum, v) => sum + v[0], 0) / finalVertices.length;
      const centerLng = finalVertices.reduce((sum, v) => sum + v[1], 0) / finalVertices.length;
      const sorted = [...finalVertices].sort((a, b) => {
        const angleA = Math.atan2(a[0] - centerLat, a[1] - centerLng);
        const angleB = Math.atan2(b[0] - centerLat, b[1] - centerLng);
        return angleA - angleB;
      });
      finalVertices = sorted;
      setVertices(sorted);
      setKinksWarning(null);
    }

    const turfCoords = finalVertices.map(([lat, lng]) => [lng, lat]);
    turfCoords.push(turfCoords[0]);
    const geoJsonPolygon = turf.polygon([turfCoords]);
    const area = Math.round(turf.area(geoJsonPolygon) * 10) / 10;

    if (area < 10) {
      alert("Rooftop area is under 10 m². Please draw a larger perimeter.");
      return;
    }

    const centroidFeature = turf.centroid(geoJsonPolygon);
    const [centroidLng, centroidLat] = centroidFeature.geometry.coordinates;

    onPolygonComplete(geoJsonPolygon.geometry, area, [centroidLat, centroidLng]);
  };

  const handleUndo = () => {
    setVertices((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setVertices([]);
  };

  // Quick 10m x 10m Square Roof Generator for Golden Tests & Instant Demo (AC-B1)
  const handleGenerateSample100SqM = () => {
    if (!mapInstanceRef.current) return;
    const center = mapInstanceRef.current.getCenter();
    const lat = center.lat;
    const lng = center.lng;

    // ~10 meters in degrees: 1 deg lat ≈ 111,000m -> 10m ≈ 0.00009 deg
    const dLat = 0.000090;
    const dLng = 0.000098; // accounting for cos(23 deg)

    const squareVertices: [number, number][] = [
      [lat, lng],
      [lat + dLat, lng],
      [lat + dLat, lng + dLng],
      [lat, lng + dLng],
    ];

    setVertices(squareVertices);
  };

  // Manual Coordinates Parser (A11y option)
  const handleApplyCoordinates = () => {
    try {
      // Split by newline or comma pairs: "23.035,72.528\n23.036,72.529..."
      const lines = coordText.trim().split(/[\n;]/);
      const parsed: [number, number][] = [];
      for (const line of lines) {
        const parts = line.split(",").map((s) => parseFloat(s.trim()));
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          parsed.push([parts[0], parts[1]]);
        }
      }
      if (parsed.length >= 3) {
        setVertices(parsed);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo(parsed[0], 18);
        }
        setShowCoordInput(false);
      } else {
        alert("Please provide at least 3 valid comma-separated lat,lng pairs.");
      }
    } catch (e) {
      alert("Failed to parse coordinates.");
    }
  };

  return (
    <div className="relative w-full h-[600px] rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-800 shadow-md">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0 bg-slate-900" />

      {/* Top Search & Toolbar */}
      <div className="absolute top-3 left-3 right-14 z-10 flex flex-col gap-2 max-w-lg">
        <form onSubmit={handleSearch} className="flex items-center gap-1.5 bg-white/95 dark:bg-slate-900/95 p-1.5 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
          <Search className="w-4 h-4 text-slate-400 ml-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search address, society, or PIN code in Gujarat..."
            className="w-full px-2 py-1 text-xs bg-transparent border-0 focus:ring-0 text-slate-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="px-3 py-1 bg-tealbrand-600 hover:bg-tealbrand-700 text-white rounded-lg text-xs font-semibold shrink-0"
          >
            {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Search"}
          </button>
        </form>

        {/* Autocomplete Dropdown */}
        {searchResults.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {searchResults.map((item) => (
              <button
                key={item.placeId}
                type="button"
                onClick={() => selectSearchResult(item)}
                className="w-full p-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800 flex items-start gap-2"
              >
                <MapPin className="w-3.5 h-3.5 text-tealbrand-600 shrink-0 mt-0.5" />
                <span className="truncate">{item.displayName}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map Control Buttons (Locate, Street Overlay, Sample 100m²) */}
      <div className="absolute top-14 right-3 z-10 flex flex-col gap-2">
        <button
          type="button"
          onClick={handleLocateMe}
          disabled={isLocating}
          title="Locate me via GPS"
          className="p-2.5 bg-white/95 dark:bg-slate-900/95 hover:bg-white text-slate-700 dark:text-slate-200 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 transition-colors"
        >
          {isLocating ? <Loader2 className="w-4 h-4 animate-spin text-tealbrand-600" /> : <Crosshair className="w-4 h-4" />}
        </button>

        <button
          type="button"
          onClick={handleToggleStreets}
          title={showStreets ? "Hide Street Overlay" : "Show Street Labels"}
          className={`p-2.5 rounded-xl shadow-md border transition-colors ${
            showStreets
              ? "bg-tealbrand-600 text-white border-tealbrand-700"
              : "bg-white/95 dark:bg-slate-900/95 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700"
          }`}
        >
          <Layers className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setShowCoordInput(!showCoordInput)}
          title="Accessible coordinate entry"
          className="p-2.5 bg-white/95 dark:bg-slate-900/95 text-slate-700 dark:text-slate-200 rounded-xl shadow-md border border-slate-200 dark:border-slate-700"
        >
          <FileText className="w-4 h-4" />
        </button>
      </div>

      {/* Zoom Warning Hint */}
      {currentZoom < 18 && (
        <div className="absolute top-16 left-3 z-10 px-3 py-1.5 rounded-xl bg-amber-500/90 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 backdrop-blur-xs">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>Zoom in closer (≥ 18) to trace your rooftop perimeter accurately</span>
        </div>
      )}

      {/* Accessible Coordinate Entry Drawer */}
      {showCoordInput && (
        <div className="absolute top-28 left-3 z-20 w-80 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-2xl border border-slate-300 dark:border-slate-700 text-xs">
          <h4 className="font-bold text-slate-900 dark:text-white mb-1">Enter Coordinates (Accessible)</h4>
          <p className="text-[11px] text-slate-500 mb-2">Paste comma-separated lat,lng pairs (one per line):</p>
          <textarea
            rows={4}
            value={coordText}
            onChange={(e) => setCoordText(e.target.value)}
            placeholder="23.0353, 72.5283&#10;23.0354, 72.5285&#10;23.0352, 72.5286"
            className="w-full p-2 font-mono text-xs border rounded-lg bg-slate-50 dark:bg-slate-800"
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={() => setShowCoordInput(false)}
              className="px-2 py-1 text-slate-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApplyCoordinates}
              className="px-3 py-1 bg-tealbrand-600 text-white font-semibold rounded-lg"
            >
              Apply Polygon
            </button>
          </div>
        </div>
      )}

      {/* Self-Intersection Warning Banner (Positioned safely above bottom toolbar) */}
      {kinksWarning && (
        <div className="absolute bottom-[92px] left-3 right-3 z-20 p-2.5 rounded-xl bg-amber-600/95 text-white text-xs font-semibold shadow-xl flex items-center justify-between gap-2 backdrop-blur-xs">
          <div className="flex items-center gap-1.5 min-w-0">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-200" />
            <span className="truncate">{kinksWarning}</span>
          </div>
          <button
            type="button"
            onClick={handleAutoFixOverlap}
            className="px-3 py-1 bg-white text-amber-900 hover:bg-amber-50 rounded-lg text-xs font-bold shrink-0 shadow-xs transition-colors flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Auto-Fix Overlap</span>
          </button>
        </div>
      )}

      {/* Bottom Live Area Badge & Drawing Controls (Clean Non-Overlapping Layout) */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-2.5 sm:p-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2.5">
          <div className="px-3 py-1 rounded-xl bg-tealbrand-50 dark:bg-tealbrand-950/50 border border-tealbrand-200 dark:border-tealbrand-800 shrink-0">
            <div className="text-[10px] text-tealbrand-700 dark:text-teal-400 uppercase font-bold tracking-wider">
              Roof Area
            </div>
            <div className="text-sm font-extrabold text-tealbrand-900 dark:text-white">
              {liveAreaSqM > 0 ? (
                <>
                  {liveAreaSqM} m² <span className="text-xs font-normal text-slate-400">({Math.round(liveAreaSqM * 10.7639)} sq ft)</span>
                </>
              ) : (
                <span className="text-slate-400 text-xs">Click vertices on roof</span>
              )}
            </div>
          </div>

          <div className="text-[11px] text-slate-500 hidden md:block">
            {vertices.length} vertices added
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap justify-end">
          {/* 100 m² Sample button (Golden Case AC-B1) */}
          <button
            type="button"
            onClick={handleGenerateSample100SqM}
            className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl"
            title="Generate standard 100 m² test roof"
          >
            Sample 100 m²
          </button>

          {vertices.length > 0 && (
            <>
              <button
                type="button"
                onClick={handleUndo}
                className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                title="Undo last point"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                title="Clear polygon"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}

          <button
            type="button"
            onClick={handleCompletePolygon}
            disabled={vertices.length < 3}
            className="px-4 py-2 bg-tealbrand-600 hover:bg-tealbrand-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            Calculate Solar Potential
          </button>
        </div>
      </div>
    </div>
  );
};
