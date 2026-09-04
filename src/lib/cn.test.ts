import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("concatenates string arguments", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("filters falsy values", () => {
    expect(cn("foo", false, null, undefined, "bar")).toBe("foo bar");
  });

  it("preserves Tailwind merge semantics (later wins on conflict)", () => {
    // `tw-merge` should resolve the conflict: p-2 should win over p-4
    // because p-2 appears later in the argument list.
    expect(cn("p-4", "p-2")).toBe("p-2");
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("handles a single argument", () => {
    expect(cn("only")).toBe("only");
  });

  it("returns an empty string for no arguments", () => {
    expect(cn()).toBe("");
  });

  it("accepts arrays and objects (clsx semantics)", () => {
    expect(cn("a", ["b", "c"], { d: true, e: false })).toBe("a b c d");
  });
});
