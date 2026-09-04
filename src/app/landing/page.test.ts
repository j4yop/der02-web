/** Smoke tests for the /landing page. We don't render the full
 * component (it pulls in Next's Link, lucide icons, etc.). Instead
 * we assert that the key copy and the disclosure are correct, and
 * that the page does not contain invented marketing claims. */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const SRC_PATH = resolve(process.cwd(), "src/app/landing/page.tsx");

describe("landing page (static check)", () => {
  const source = readFileSync(SRC_PATH, "utf-8");

  it("does not rename the project to a marketing alias", () => {
    // The page keeps the technical name "der02" — no fake product
    // name like "HazardX" or "Blastly". Marketing would obscure
    // CITATIONS.md's honest disclosures.
    expect(source).toContain("der02");
    // Negative checks: a small handful of marketing tropes we don't
    // want in this codebase.
    expect(source).not.toMatch(/\bgame[- ]?changing\b/i);
    expect(source).not.toMatch(/\brevolutionary\b/i);
    expect(source).not.toMatch(/\bworld[- ]?class\b/i);
    expect(source).not.toMatch(/\bunleash\b/i);
  });

  it("includes the honest disclosure in the page", () => {
    // The page must surface the CITATIONS.md note that TNO curve
    // values and per-fuel emissivities are not primary-verified.
    expect(source).toMatch(/not primary[- ]verified/i);
    expect(source).toMatch(/TNO Green Book/);
    expect(source).toMatch(/CCPS/);
  });

  it("links to the live tool and to the source repo", () => {
    // The landing page must route to the working tool at "/" and
    // to the source on GitHub.
    expect(source).toMatch(/href=["']\/["']/);
    expect(source).toMatch(/github\.com\/j4yop\/der02/);
  });

  it("does not include any third-party decrypt text or animated hero shader libraries", () => {
    // Sanity: this codebase does not install or reference any
    // externally-prompted component loader. If a future PR adds
    // one, this test fails as a guardrail.
    expect(source).not.toMatch(/21st\.dev|tristanobernardelli/i);
    expect(source).not.toMatch(/motiq\.dev|decrypt-text/i);
  });
});
