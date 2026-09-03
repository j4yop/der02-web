"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import {
  AttributionControl,
  LayerGroup,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
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

const SEVERITY_OPACITY = 0.25; // polygons are large; lower opacity keeps the basemap readable.
const BBOX_PADDING = 0.001; // degrees

/** Compute map center as the centroid of the bbox. */
function bboxCenter(bbox: ZoneMapProps["bbox"]): [number, number] {
  return [
    (bbox.min_lat + bbox.max_lat) / 2,
    (bbox.min_lon + bbox.max_lon) / 2,
  ];
}

/** A child of <MapContainer> that draws the current zone records into
 *  a <LayerGroup>. Drawing happens in a useLayoutEffect so the polygons
 *  appear before the browser paints. */
function ZoneLayer({ records }: { records: ZoneRecord[] }) {
  const [group, setGroup] = useState<L.LayerGroup | null>(null);

  // Capture the Leaflet LayerGroup instance once the LayerGroup
  // component mounts. <LayerGroup> from react-leaflet creates and
  // attaches the L.LayerGroup for us — we just need to grab the ref.
  return (
    <LayerGroup
      ref={(g) => {
        if (g && g !== group) setGroup(g);
      }}
    >
      {group && <ZonePolygons group={group} records={records} />}
    </LayerGroup>
  );
}

/** Draws zones into the given layer group. Mounted as a child of
 *  ZoneLayer only after the layer group is ready, so group is
 *  guaranteed non-null inside the drawing effect. */
function ZonePolygons({
  group,
  records,
}: {
  group: L.LayerGroup;
  records: ZoneRecord[];
}) {
  // Re-draw zones on every change. The layer group is mutated in
  // place; we just clear and re-add. useLayoutEffect ensures the
  // browser doesn't paint a flash of the previous zones.
  useLayoutEffect(() => {
    group.clearLayers();
    const groups = groupBySeverity(records);
    for (const [sev, pts] of Object.entries(groups)) {
      if (pts.length === 0) continue;
      const color = SEVERITY_COLOURS[sev] ?? "#999";
      if (pts.length < 3) {
        // Lethal band typically has 1-2 points — render as a circle.
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
          .addTo(group);
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
          .addTo(group);
      }
    }
  }, [group, records]);

  return null;
}

/** Fit the map view to the current bbox. Called on every bbox change
 *  via a dedicated effect inside <MapContainer>. */
function FitToBbox({ bbox }: { bbox: ZoneMapProps["bbox"] }) {
  const map = useMap();
  useEffect(() => {
    map.fitBounds([
      [bbox.min_lat - BBOX_PADDING, bbox.min_lon - BBOX_PADDING],
      [bbox.max_lat + BBOX_PADDING, bbox.max_lon + BBOX_PADDING],
    ]);
  }, [map, bbox.min_lat, bbox.min_lon, bbox.max_lat, bbox.max_lon]);
  return null;
}

export function ZoneMap(props: ZoneMapProps) {
  return (
    <MapContainer
      center={bboxCenter(props.bbox)}
      zoom={14}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <AttributionControl
        position="bottomright"
        prefix='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <FitToBbox bbox={props.bbox} />
      <ZoneLayer records={props.records} />
      <Marker position={bboxCenter(props.bbox)} icon={TANK_ICON}>
        <Popup>
          <b>{props.sourceLabel}</b>
          <br />
          Strength class {props.strengthClass}
        </Popup>
      </Marker>
    </MapContainer>
  );
}
