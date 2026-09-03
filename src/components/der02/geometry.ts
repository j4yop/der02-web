"use client";

import type { ZoneRecord } from "@/lib/types";

/** Computes the convex hull of a set of [lat, lon] points (Graham scan).
 *  Returns the hull as an array of [lat, lon] points in CCW order.
 *  Returns at most 2 points (line) or 0 (empty) when fewer than 3. */
export function convexHull(points: Array<[number, number]>): Array<[number, number]> {
  if (points.length < 3) return points.slice();
  const pts = points.map(([lat, lon]) => [lon, lat]); // [x, y]
  pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: number[], a: number[], b: number[]) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower: number[][] = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2]!, lower[lower.length - 1]!, p) <= 0)
      lower.pop();
    lower.push(p);
  }
  const upper: number[][] = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i]!;
    while (upper.length >= 2 && cross(upper[upper.length - 2]!, upper[upper.length - 1]!, p) <= 0)
      upper.pop();
    upper.push(p);
  }
  lower.pop();
  upper.pop();
  return lower.concat(upper).map(([x, y]) => [y as number, x as number]) as Array<
    [number, number]
  >;
}

/** Group records by severity, with at most 2 points fallback to a 20 m circle. */
export function groupBySeverity(
  records: ZoneRecord[],
): Record<string, ZoneRecord[]> {
  const groups: Record<string, ZoneRecord[]> = {};
  for (const r of records) {
    if (!groups[r.severity]) groups[r.severity] = [];
    groups[r.severity]!.push(r);
  }
  return groups;
}

/** Severity → colour mapping (matches the FastAPI/Streamlit visuals). */
export const SEVERITY_COLOURS: Record<string, string> = {
  lethal: "#8B0000",
  danger: "#FF4500",
  caution: "#FFA500",
  safe: "#6b7280",
};

/** Compute centroid of a list of records. */
export function centroid(points: ZoneRecord[]): [number, number] {
  if (points.length === 0) return [0, 0];
  const sum = points.reduce(
    (acc, p) => [acc[0] + p.lat, acc[1] + p.lon] as [number, number],
    [0, 0] as [number, number],
  );
  return [sum[0] / points.length, sum[1] / points.length];
}

/** Approximate distance (m) between two lat/lon points via equirectangular projection. */
export function approxDistanceM(
  a: [number, number],
  b: [number, number],
): number {
  const mPerDegLat = 111_320;
  const cosLat = Math.cos((a[0] + b[0]) / 2 * (Math.PI / 180));
  const dLat = (a[0] - b[0]) * mPerDegLat;
  const dLon = (a[1] - b[1]) * mPerDegLat * cosLat;
  return Math.sqrt(dLat * dLat + dLon * dLon);
}
