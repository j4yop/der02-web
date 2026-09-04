/** Optional integration tests that hit the live FastAPI backend.
 *
 * Skipped by default. Set `DER02_API_INTEGRATION=1` to enable.
 * The tests assert that the live deployment is consistent with
 * the test-suite expectations: 9 fuels, 10 strength classes, the
 * severity-band shapes, and the zone-bbox format.
 *
 * Run manually: `DER02_API_INTEGRATION=1 npx vitest run` */

import { describe, expect, it } from "vitest";
import { api } from "./api";

const ENABLED = process.env.DER02_API_INTEGRATION === "1";

describe.skipIf(!ENABLED)("live backend integration", () => {
  it("GET /api/fuels returns 9 fuels", async () => {
    const fuels = await api.listFuels();
    expect(fuels.length).toBe(9);
    const names = fuels.map((f) => f.name).sort();
    expect(names).toEqual([
      "ammonia", "diesel", "ethanol", "gasoline", "hydrogen",
      "kerosene", "methane", "methanol", "propane",
    ]);
  });

  it("GET /api/strength-classes returns 10 classes", async () => {
    const classes = await api.listStrengthClasses();
    expect(classes.length).toBe(10);
    expect(classes[0].strengthClass).toBe(1);
    expect(classes[9].strengthClass).toBe(10);
  });

  it("GET /api/severity-bands has the right thresholds", async () => {
    const bands = await api.getSeverityBands();
    // Three bands per family, labelled lethal > danger > caution in
    // threshold-descending order.
    const labels = bands.blast.map((b) => b.severity);
    expect(labels).toEqual(["lethal", "danger", "caution"]);
    expect(bands.blast[0].threshold).toBeGreaterThan(
      bands.blast[1].threshold,
    );
    expect(bands.blast[1].threshold).toBeGreaterThan(
      bands.blast[2].threshold,
    );
  });

  it("POST /api/zones returns the right shape for a default scenario", async () => {
    const r = await api.computeZones({
      fuel: "propane",
      volume_m3: 1000,
      source_lat: 12.8419815,
      source_lon: 80.1549340,
    });
    expect(r.fuel).toBe("propane");
    expect(r.volume_m3).toBe(1000);
    expect(r.records.length).toBeGreaterThan(100);
    // Band distances should be decreasing: lethal < danger < caution.
    const l = r.band_distances.lethal ?? 0;
    const d = r.band_distances.danger ?? 0;
    const c = r.band_distances.caution ?? 0;
    if (l > 0 && d > 0) expect(d).toBeGreaterThan(l);
    if (d > 0 && c > 0) expect(c).toBeGreaterThan(d);
  });
});
