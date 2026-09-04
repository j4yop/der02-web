import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api, Der02ApiError } from "./api";

describe("api client", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("listFuels returns 9 fuels", async () => {
    global.fetch = vi.fn(async () =>
      new Response(
        JSON.stringify([
          { name: "propane", formula: "C3H8" },
          { name: "gasoline", formula: "C7H16" },
        ]),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    ) as typeof fetch;
    const fuels = await api.listFuels();
    expect(fuels.length).toBe(2);
    expect(fuels[0].name).toBe("propane");
  });

  it("listStrengthClasses returns 10 classes", async () => {
    global.fetch = vi.fn(async () =>
      new Response(
        JSON.stringify(
          Array.from({ length: 10 }, (_, i) => ({
            class: i + 1,
            amplitude_factor: 1.0,
            description: `class ${i + 1}`,
          })),
        ),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    ) as typeof fetch;
    const classes = await api.listStrengthClasses();
    expect(classes.length).toBe(10);
    expect(classes[0].strengthClass).toBe(1);
  });

  it("computeZones POSTs the right payload and returns parsed response", async () => {
    let receivedBody: unknown = null;
    global.fetch = vi.fn(async (_url: unknown, init: RequestInit) => {
      receivedBody = init.body ? JSON.parse(String(init.body)) : null;
      return new Response(
        JSON.stringify({
          records: [],
          source_label: "Propane 1000 m³",
          bbox: { min_lat: -1, min_lon: -1, max_lat: 1, max_lon: 1 },
          wind: { speed_m_s: 5, from_direction_deg: 180 },
          fuel: "propane",
          volume_m3: 1000,
          strength_class: 7,
          n_records: 0,
          band_distances: {},
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    }) as typeof fetch;
    const r = await api.computeZones({
      fuel: "propane",
      volume_m3: 1000,
      source_lat: 0,
      source_lon: 0,
    });
    expect(r.fuel).toBe("propane");
    expect(receivedBody).toMatchObject({
      fuel: "propane",
      volume_m3: 1000,
      source_lat: 0,
      source_lon: 0,
    });
  });

  it("throws Der02ApiError on non-2xx response", async () => {
    global.fetch = vi.fn(
      async () =>
        new Response("not found", { status: 404, statusText: "Not Found" }),
    ) as typeof fetch;
    await expect(api.listFuels()).rejects.toBeInstanceOf(Der02ApiError);
  });

  it("Der02ApiError captures status and body", async () => {
    const e = new Der02ApiError("test", 422, '{"detail":"bad"}');
    expect(e.status).toBe(422);
    expect(e.body).toBe('{"detail":"bad"}');
    expect(e.message).toBe("test");
    expect(e).toBeInstanceOf(Error);
  });
});
