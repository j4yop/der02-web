import type {
  Fuel,
  MultiTankRequest,
  SeverityBands,
  StrengthClass,
  ZoneRecord,
  ZoneRequest,
  ZoneResponse,
} from "./types";

const API_BASE =
  process.env.NEXT_PUBLIC_DER02_API_URL ?? "https://der02.vercel.app";

/** The FastAPI serialises the strength-class field as the JSON key
 *  `class` (a Python keyword). Rename to `strengthClass` so the rest
 *  of the frontend can use a normal TS identifier. */
type RawStrengthClass = Omit<StrengthClass, "strengthClass"> & {
  class: number;
};
function normalizeStrengthClass(r: RawStrengthClass): StrengthClass {
  const { class: c, ...rest } = r;
  return { strengthClass: c, ...rest };
}

class Der02ApiError extends Error {
  status: number;
  body: string;
  constructor(message: string, status: number, body: string) {
    super(message);
    this.name = "Der02ApiError";
    this.status = status;
    this.body = body;
  }
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
  if (!res.ok) {
    const body = await res.text();
    throw new Der02ApiError(
      `GET ${path} failed: ${res.status} ${res.statusText}`,
      res.status,
      body,
    );
  }
  return res.json() as Promise<T>;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Der02ApiError(
      `POST ${path} failed: ${res.status} ${res.statusText}`,
      res.status,
      text,
    );
  }
  return res.json() as Promise<T>;
}

export const api = {
  base: API_BASE,
  listFuels: () => get<Fuel[]>("/api/fuels"),
  listStrengthClasses: async () => {
    const raw = await get<RawStrengthClass[]>("/api/strength-classes");
    return raw.map(normalizeStrengthClass);
  },
  getSeverityBands: () => get<SeverityBands>("/api/severity-bands"),
  computeZones: (req: ZoneRequest) =>
    post<ZoneResponse>("/api/zones", req),
  computeZonesMulti: (req: MultiTankRequest) =>
    post<ZoneResponse>("/api/zones-multi", req),
};

export type { ZoneRecord };
export { Der02ApiError };
