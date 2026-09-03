"use client";

import { useEffect, useRef } from "react";
import {
  AttributionControl,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import {
  SEVERITY_COLOURS,
  approxDistanceM,
  centroid,
  convexHull,
  groupBySeverity,
} from "./geometry";
import type { ZoneRecord } from "@/lib/types";

/** Fix Leaflet's default marker icon paths to a CDN that ships the
 *  four PNGs Leaflet expects. Without this, Webpack/Turbopack mangles
 *  the image URLs and the browser shows a broken-image glyph. */
const TANK_ICON = L.icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export interface ZoneMapProps {
  records: ZoneRecord[];
  bbox: { min_lat: number; min_lon: number; max_lat: number; max_lon: number };
  sourceLabel: string;
  strengthClass: number;
}

const SEVERITY_OPACITY = 0.35;
const BBOX_PADDING = 0.001; // degrees

/** Compute map center as the centroid of the bbox. */
function bboxCenter(bbox: ZoneMapProps["bbox"]): [number, number] {
  return [
    (bbox.min_lat + bbox.max_lat) / 2,
    (bbox.min_lon + bbox.max_lon) / 2,
  ];
}

export function ZoneMap({ records, bbox, sourceLabel, strengthClass }: ZoneMapProps) {
  // Use refs to access the Leaflet map instance imperatively.
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Fit map to bbox whenever it changes.
  useEffect(() => {
    if (!mapRef.current) return;
    const m = mapRef.current;
    m.fitBounds([
      [bbox.min_lat - BBOX_PADDING, bbox.min_lon - BBOX_PADDING],
      [bbox.max_lat + BBOX_PADDING, bbox.max_lon + BBOX_PADDING],
    ]);
  }, [bbox.min_lat, bbox.min_lon, bbox.max_lat, bbox.max_lon]);

  // Clear & re-render zones whenever the records change.
  useEffect(() => {
    const lg = layerGroupRef.current;
    if (!lg) return;
    lg.clearLayers();

    const groups = groupBySeverity(records);
    for (const [sev, pts] of Object.entries(groups)) {
      if (pts.length === 0) continue;
      const color = SEVERITY_COLOURS[sev] ?? "#999";
      if (pts.length < 3) {
        // Render as a circle marker (lethal band typically has 1-2 points).
        const [cLat, cLon] = centroid(pts);
        let maxR = 20;
        for (const p of pts) {
          const r = approxDistanceM([cLat, cLon], [p.lat, p.lon]);
          if (r > maxR) maxR = r;
        }
        L.circle([cLat, cLon], {
          color,
          fillColor: color,
          fillOpacity: SEVERITY_OPACITY,
          weight: 2,
          radius: Math.max(maxR, 20),
        })
          .bindPopup(
            `<b>${sev[0]!.toUpperCase()}${sev.slice(1)}</b> band (${pts.length} grid node${pts.length === 1 ? "" : "s"})`,
          )
          .addTo(lg);
      } else {
        const hull = convexHull(pts.map((p) => [p.lat, p.lon] as [number, number]));
        if (hull.length < 3) continue;
        L.polygon(hull as L.LatLngExpression[], {
          color,
          fillColor: color,
          fillOpacity: SEVERITY_OPACITY,
          weight: 2,
        })
          .bindPopup(
            `<b>${sev[0]!.toUpperCase()}${sev.slice(1)}</b> band (${pts.length} grid nodes)`,
          )
          .addTo(lg);
      }
    }
  }, [records]);

  return (
    <MapContainer
      center={bboxCenter(bbox)}
      zoom={14}
      style={{ height: "100%", width: "100%" }}
      ref={(m) => {
        mapRef.current = m;
      }}
      whenReady={() => {
        // Once the map is created, attach the layer group used for zones.
        if (mapRef.current && !layerGroupRef.current) {
          layerGroupRef.current = L.layerGroup().addTo(mapRef.current);
        }
      }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <AttributionControl
        position="bottomright"
        prefix='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={bboxCenter(bbox)} icon={TANK_ICON}>
        <Popup>
          <b>{sourceLabel}</b>
          <br />
          Strength class {strengthClass}
        </Popup>
      </Marker>
    </MapContainer>
  );
}
