import { describe, expect, it } from "vitest";
import { convexHull, groupBySeverity, approxDistanceM, centroid } from "./geometry";
import type { ZoneRecord } from "@/lib/types";

function makeRecord(
  lat: number,
  lon: number,
  severity: "lethal" | "danger" | "caution" | "safe" = "caution",
  distance_m = 100,
): ZoneRecord {
  return {
    lat,
    lon,
    severity,
    blast_pa: 50_000,
    thermal_kw_m2: 5,
    distance_m,
  };
}

describe("convexHull", () => {
  it("returns empty array for empty input", () => {
    expect(convexHull([])).toEqual([]);
  });

  it("returns input unchanged for < 3 points (no real hull)", () => {
    const pts: [number, number][] = [
      [0, 0],
      [1, 1],
    ];
    const hull = convexHull(pts);
    expect(hull.length).toBe(2);
    expect(hull[0]).toEqual([0, 0]);
    expect(hull[1]).toEqual([1, 1]);
  });

  it("returns a triangle for 3 points", () => {
    const hull = convexHull([
      [0, 0],
      [1, 0],
      [0.5, 1],
    ]);
    expect(hull.length).toBe(3);
    // All 3 input points should appear in the hull.
    const sortedHull = hull.slice().sort((a, b) => a[0] - b[0]);
    expect(sortedHull[0]).toEqual([0, 0]);
    expect(sortedHull[1]).toEqual([0.5, 1]);
    expect(sortedHull[2]).toEqual([1, 0]);
  });

  it("returns the convex hull (not just the bounding box) for a square", () => {
    // 5 points: 4 corners of a square + 1 interior point.
    const hull = convexHull([
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
      [0.5, 0.5],
    ]);
    // The interior point should NOT be in the hull — only the 4 corners.
    expect(hull.length).toBe(4);
    const sortedHull = hull.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    expect(sortedHull).toEqual([
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
    ]);
  });

  it("handles collinear points (degenerate hull)", () => {
    // Three collinear points — no triangle, no enclosed area. The
    // algorithm returns the two endpoints (the "hull" is a line
    // segment), not all three points. This is correct convex-hull
    // behaviour: hull of collinear points is the two extremes.
    const hull = convexHull([
      [0, 0],
      [1, 0],
      [2, 0],
    ]);
    // Hull is just the segment from (0,0) to (2,0).
    expect(hull.length).toBe(2);
    const sortedHull = hull.slice().sort((a, b) => a[0] - b[0]);
    expect(sortedHull[0]).toEqual([0, 0]);
    expect(sortedHull[1]).toEqual([2, 0]);
  });

  it("preserves the geographic orientation (lat, lon) in output", () => {
    // Real-world lat/lon values.
    const hull = convexHull([
      [12.84, 80.15],
      [12.85, 80.16],
      [12.86, 80.14],
    ]);
    // Each point should still look like a lat/lon (lat in [12,13]).
    for (const p of hull) {
      expect(p[0]).toBeGreaterThan(12);
      expect(p[0]).toBeLessThan(13);
      expect(p[1]).toBeGreaterThan(80);
      expect(p[1]).toBeLessThan(81);
    }
  });
});

describe("groupBySeverity", () => {
  it("groups records by their severity field", () => {
    const records = [
      makeRecord(0, 0, "lethal"),
      makeRecord(0.1, 0, "lethal"),
      makeRecord(0.2, 0, "danger"),
      makeRecord(0.3, 0, "caution"),
      makeRecord(0.4, 0, "safe"),
    ];
    const groups = groupBySeverity(records);
    expect(groups.lethal?.length).toBe(2);
    expect(groups.danger?.length).toBe(1);
    expect(groups.caution?.length).toBe(1);
    expect(groups.safe?.length).toBe(1);
  });

  it("returns an empty object for empty input", () => {
    const groups = groupBySeverity([]);
    expect(Object.keys(groups)).toHaveLength(0);
  });
});

describe("centroid", () => {
  it("returns [0, 0] for empty input", () => {
    expect(centroid([])).toEqual([0, 0]);
  });

  it("returns the mean lat/lon for a non-empty set", () => {
    const c = centroid([
      makeRecord(0, 0),
      makeRecord(2, 0),
      makeRecord(0, 2),
    ]);
    expect(c[0]).toBeCloseTo(2 / 3, 6);
    expect(c[1]).toBeCloseTo(2 / 3, 6);
  });
});

describe("approxDistanceM", () => {
  it("returns 0 for the same point", () => {
    expect(approxDistanceM([12.84, 80.15], [12.84, 80.15])).toBeCloseTo(0, 1);
  });

  it("approximates 111 km per degree of latitude", () => {
    // 1 degree of latitude ≈ 111 km = 111_000 m.
    const d = approxDistanceM([0, 0], [1, 0]);
    expect(d).toBeGreaterThan(110_000);
    expect(d).toBeLessThan(112_000);
  });

  it("approximates 111 km × cos(lat) per degree of longitude", () => {
    // At the equator, 1° lon ≈ 111 km.
    // At lat 60°, 1° lon ≈ 55.5 km.
    const dEq = approxDistanceM([0, 0], [0, 1]);
    const d60 = approxDistanceM([60, 0], [60, 1]);
    expect(dEq).toBeGreaterThan(110_000);
    expect(d60).toBeGreaterThan(54_000);
    expect(d60).toBeLessThan(57_000);
  });
});
