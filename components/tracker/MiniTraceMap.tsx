"use client";

import React, { useEffect, useRef } from "react";

interface MiniTraceMapProps {
  tracePoints: [number, number][];
}

export const MiniTraceMap: React.FC<MiniTraceMapProps> = ({ tracePoints }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const currentMarkerRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;
    let isMounted = true;

    async function initMap() {
      const L = (await import("leaflet")).default;
      if (!isMounted || !mapRef.current) return;

      const initialCenter: [number, number] =
        tracePoints.length > 0 ? tracePoints[0] : [23.0353, 72.5283];

      const map = L.map(mapRef.current, {
        center: initialCenter,
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 19 }
      ).addTo(map);

      const poly = L.polyline([], {
        color: "#14b8a6",
        weight: 4,
        opacity: 0.9,
      }).addTo(map);

      polylineRef.current = poly;
      leafletMapRef.current = map;
    }

    initMap();

    return () => {
      isMounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!leafletMapRef.current || !polylineRef.current || tracePoints.length === 0) return;

    polylineRef.current.setLatLngs(tracePoints);
    const lastPoint = tracePoints[tracePoints.length - 1];

    async function updateMarker() {
      const L = (await import("leaflet")).default;
      if (currentMarkerRef.current) {
        currentMarkerRef.current.setLatLng(lastPoint);
      } else {
        currentMarkerRef.current = L.circleMarker(lastPoint, {
          radius: 7,
          color: "#fff",
          fillColor: "#ef4444",
          fillOpacity: 1,
          weight: 2,
        }).addTo(leafletMapRef.current);
      }
      leafletMapRef.current.panTo(lastPoint);
    }

    updateMarker();
  }, [tracePoints]);

  return <div ref={mapRef} className="w-full h-48 bg-slate-950" />;
};
