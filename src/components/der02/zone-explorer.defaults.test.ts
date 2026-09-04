/** Verifies that the public default values exported from
 * `zone-explorer.tsx` (which drive the initial UI state and the Reset
 * button) match the documented defaults. If a developer changes a
 * default without updating this test, the test fails and the change
 * is caught. */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const SRC_PATH = resolve(
  process.cwd(),
  "src/components/der02/zone-explorer.tsx",
);

describe("ZoneExplorer defaults (source-of-truth check)", () => {
  const source = readFileSync(SRC_PATH, "utf-8");

  function expectConstant(name: string, value: string | number) {
    // Match `const NAME = <value>` declarations.
    const re = new RegExp(`^const ${name}\\s*=\\s*([^;]+);`, "m");
    const m = source.match(re);
    expect(m, `expected const ${name} to be declared`).not.toBeNull();
    expect(String(m![1]).trim()).toBe(String(value));
  }

  it("uses the documented default lat/lon (12.8419815, 80.1549340)", () => {
    expectConstant("DEFAULT_LAT", "12.8419815");
    expectConstant("DEFAULT_LON", "80.1549340");
  });

  it("uses the documented default volume (1000 m³)", () => {
    expectConstant("DEFAULT_VOLUME", "1000");
  });

  it("uses the documented default wind (5 m/s from 180°)", () => {
    expectConstant("DEFAULT_WIND_SPEED", "5");
    expectConstant("DEFAULT_WIND_FROM", "180");
  });

  it("uses the documented default TNO strength class (7)", () => {
    expectConstant("DEFAULT_STRENGTH_CLASS", "7");
  });

  it("uses the documented default resolution and bbox half-extent", () => {
    expectConstant("DEFAULT_RESOLUTION", "100");
    expectConstant("DEFAULT_BBOX_HALF_EXTENT", "0.02");
  });

  it("uses the documented default combustion efficiency and transmissivity", () => {
    expectConstant("DEFAULT_COMB_EFF", "0.4");
    expectConstant("DEFAULT_TRANSMISSIVITY", "1.0");
  });

  it("uses the documented default tank diameter", () => {
    expectConstant("DEFAULT_TANK_DIAMETER", "10");
  });
});
