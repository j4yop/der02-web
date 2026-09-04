"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Flame, Wind, MapPin, Settings2, Loader2, BookOpen } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { api, Der02ApiError } from "@/lib/api";
import type {
  Fuel,
  StrengthClass,
  ZoneRequest,
  ZoneResponse,
} from "@/lib/types";

const ZoneMap = dynamic(
  () => import("@/components/der02/zone-map").then((m) => m.ZoneMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-zinc-100 text-sm text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading map…
      </div>
    ),
  },
);

const DEFAULT_LAT = 12.8419815;
const DEFAULT_LON = 80.1549340;
const DEFAULT_BBOX_HALF_EXTENT = 0.02;
const DEFAULT_RESOLUTION = 100;
const DEFAULT_COMB_EFF = 0.4;
const DEFAULT_TRANSMISSIVITY = 1.0;
const DEFAULT_WIND_SPEED = 5;
const DEFAULT_WIND_FROM = 180;
const DEFAULT_STRENGTH_CLASS = 7;
const DEFAULT_VOLUME = 1000;
const DEFAULT_TANK_DIAMETER = 10;

/** Default form values for the Reset button. Keep in sync with the
 *  initial-state hooks below. */
const DEFAULTS = {
  fuel: "propane",
  volume: DEFAULT_VOLUME,
  windSpeed: DEFAULT_WIND_SPEED,
  windFrom: DEFAULT_WIND_FROM,
  lat: DEFAULT_LAT,
  lon: DEFAULT_LON,
  resolution: DEFAULT_RESOLUTION,
  strengthClass: DEFAULT_STRENGTH_CLASS,
  combEff: DEFAULT_COMB_EFF,
  transmissivity: DEFAULT_TRANSMISSIVITY,
  tankDiameter: DEFAULT_TANK_DIAMETER,
  tankHeight: DEFAULT_TANK_DIAMETER,
  overrideTank: false,
} as const;

interface NumericBand {
  severity: "lethal" | "danger" | "caution";
  value: number | null;
  color: string;
  label: string;
}

const BAND_META: Array<{ severity: NumericBand["severity"]; color: string; label: string }> = [
  { severity: "lethal", color: "text-[#8B0000] dark:text-[#FF6060]", label: "Lethal" },
  { severity: "danger", color: "text-[#FF4500] dark:text-[#FF7A3D]", label: "Danger" },
  { severity: "caution", color: "text-[#FFA500] dark:text-[#FFC966]", label: "Caution" },
];

const DISCLAIMER =
  "Not for life-safety decisions. Consequence-modeling output is for planning and risk assessment only. TNO curve values and per-fuel emissivities are flagged as not primary-verified in CITATIONS.md — re-verify against the TNO Green Book, SFPE Handbook, and CCPS Guidelines for CPQRA before any operational use.";

export function ZoneExplorer() {
  const [fuels, setFuels] = useState<Fuel[] | null>(null);
  const [classes, setClasses] = useState<StrengthClass[] | null>(null);
  const [, setBands] = useState<unknown>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [fuel, setFuel] = useState<string>("propane");
  const [volume, setVolume] = useState<number>(DEFAULT_VOLUME);
  const [windSpeed, setWindSpeed] = useState<number>(DEFAULT_WIND_SPEED);
  const [windFrom, setWindFrom] = useState<number>(DEFAULT_WIND_FROM);
  const [lat, setLat] = useState<number>(DEFAULT_LAT);
  const [lon, setLon] = useState<number>(DEFAULT_LON);
  const [resolution, setResolution] = useState<number>(DEFAULT_RESOLUTION);
  const [strengthClass, setStrengthClass] = useState<number>(DEFAULT_STRENGTH_CLASS);
  const [combEff, setCombEff] = useState<number>(DEFAULT_COMB_EFF);
  const [transmissivity, setTransmissivity] = useState<number>(DEFAULT_TRANSMISSIVITY);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [tankDiameter, setTankDiameter] = useState<number>(DEFAULT_TANK_DIAMETER);
  const [tankHeight, setTankHeight] = useState<number>(DEFAULT_TANK_DIAMETER);
  const [overrideTank, setOverrideTank] = useState<boolean>(false);

  function resetToDefaults() {
    setFuel(DEFAULTS.fuel);
    setVolume(DEFAULTS.volume);
    setWindSpeed(DEFAULTS.windSpeed);
    setWindFrom(DEFAULTS.windFrom);
    setLat(DEFAULTS.lat);
    setLon(DEFAULTS.lon);
    setResolution(DEFAULTS.resolution);
    setStrengthClass(DEFAULTS.strengthClass);
    setCombEff(DEFAULTS.combEff);
    setTransmissivity(DEFAULTS.transmissivity);
    setTankDiameter(DEFAULTS.tankDiameter);
    setTankHeight(DEFAULTS.tankHeight);
    setOverrideTank(DEFAULTS.overrideTank);
  }

  const [result, setResult] = useState<ZoneResponse | null>(null);
  const [computing, setComputing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load static metadata once.
  useEffect(() => {
    let cancelled = false;
    Promise.all([api.listFuels(), api.listStrengthClasses(), api.getSeverityBands()])
      .then(([f, c, b]) => {
        if (cancelled) return;
        setFuels(f);
        setClasses(c);
        setBands(b);
      })
      .catch((e) => {
        if (cancelled) return;
        setLoadError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function recompute() {
    setError(null);
    setComputing(true);
    const req: ZoneRequest = {
      fuel,
      volume_m3: volume,
      source_lat: lat,
      source_lon: lon,
      bbox_half_extent_deg: DEFAULT_BBOX_HALF_EXTENT,
      wind_speed_m_s: windSpeed,
      wind_from_direction_deg: windFrom,
      resolution_m: resolution,
      combustion_efficiency: combEff,
      transmissivity,
      strength_class: strengthClass,
    };
    if (overrideTank) {
      req.tank_diameter_m = tankDiameter;
      req.tank_height_m = tankHeight;
    }
    try {
      const r = await api.computeZones(req);
      setResult(r);
    } catch (e) {
      const msg =
        e instanceof Der02ApiError
          ? `${e.message}: ${e.body.slice(0, 200)}`
          : e instanceof Error
            ? e.message
            : String(e);
      setError(msg);
    } finally {
      setComputing(false);
    }
  }

  // Debounced recompute on any input change.
  useEffect(() => {
    if (fuels === null) return; // wait for metadata
    const timer = setTimeout(() => {
      void recompute();
    }, 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    fuel,
    volume,
    windSpeed,
    windFrom,
    lat,
    lon,
    resolution,
    strengthClass,
    combEff,
    transmissivity,
    tankDiameter,
    tankHeight,
    overrideTank,
    fuels,
  ]);

  const fuelOptions = useMemo(
    () =>
      (fuels ?? []).map((f) => ({
        value: f.name,
        label: `${f.name[0]!.toUpperCase()}${f.name.slice(1)} (${f.formula})`,
      })),
    [fuels],
  );

  const bandDistances: NumericBand[] = BAND_META.map((meta) => {
    const d = result?.band_distances[meta.severity];
    return {
      severity: meta.severity,
      label: meta.label,
      color: meta.color,
      value: d === undefined || d === 0 ? null : d,
    };
  });

  return (
    <div className="grid h-[calc(100dvh-3.5rem)] grid-cols-[320px_1fr]">
      {/* Sidebar */}
      <aside className="flex flex-col gap-4 overflow-y-auto border-r border-zinc-200 bg-zinc-50 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900">
        <header>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-base font-semibold tracking-tight">der02</h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Threat-zone estimation · TNO Multi-Energy + solid-flame
              </p>
            </div>
            <Link
              href="/landing"
              aria-label="About this tool"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900"
            >
              <BookOpen className="h-3.5 w-3.5" />
            </Link>
          </div>
        </header>

        {loadError && (
          <div className="rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            Failed to load metadata: {loadError}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5 text-sm">
              <Flame className="h-4 w-4" /> Fuel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Field label="Fuel">
              <Select
                value={fuel}
                onChange={setFuel}
                options={fuelOptions}
                disabled={fuels === null}
                aria-label="Fuel"
              />
            </Field>
            <Field
              label={
                <span className="flex items-center justify-between">
                  <span>Tank volume</span>
                  <span className="text-xs text-zinc-500">{volume} m³</span>
                </span>
              }
            >
              <Slider
                value={volume}
                onChange={setVolume}
                min={10}
                max={10000}
                step={10}
                aria-label="Tank volume"
              />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5 text-sm">
              <Wind className="h-4 w-4" /> Wind
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Field
              label={
                <span className="flex items-center justify-between">
                  <span>Speed</span>
                  <span className="text-xs text-zinc-500">
                    {windSpeed.toFixed(1)} m/s
                  </span>
                </span>
              }
            >
              <Slider
                value={windSpeed}
                onChange={setWindSpeed}
                min={0}
                max={20}
                step={0.5}
                aria-label="Wind speed"
              />
            </Field>
            <Field
              label={
                <span className="flex items-center justify-between">
                  <span>From direction</span>
                  <span className="text-xs text-zinc-500">{windFrom}°</span>
                </span>
              }
            >
              <Slider
                value={windFrom}
                onChange={setWindFrom}
                min={0}
                max={359}
                step={1}
                aria-label="Wind from direction"
              />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5 text-sm">
              <MapPin className="h-4 w-4" /> Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Field label="Latitude (°)">
              <NumberInput value={lat} onChange={setLat} min={-90} max={90} step={0.01} />
            </Field>
            <Field label="Longitude (°)">
              <NumberInput value={lon} onChange={setLon} min={-180} max={180} step={0.01} />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5 text-sm">
              <Settings2 className="h-4 w-4" /> Blast &amp; grid
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Field
              label={
                <span className="flex items-center justify-between">
                  <span>TNO strength class</span>
                  <span className="text-xs text-zinc-500">{strengthClass}</span>
                </span>
              }
            >
              <Slider
                value={strengthClass}
                onChange={(v) => setStrengthClass(v)}
                min={1}
                max={10}
                step={1}
                aria-label="TNO strength class"
              />
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {classes?.find((c) => c.strengthClass === strengthClass)?.description ??
                  "Class 7: heavily congested module (default)"}
              </p>
            </Field>
            <Field
              label={
                <span className="flex items-center justify-between">
                  <span>Resolution</span>
                  <span className="text-xs text-zinc-500">{resolution} m</span>
                </span>
              }
            >
              <Slider
                value={resolution}
                onChange={setResolution}
                min={50}
                max={500}
                step={50}
                aria-label="Grid resolution"
              />
            </Field>
          </CardContent>
        </Card>

        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="text-left text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          {showAdvanced ? "▾ Advanced thermal" : "▸ Advanced thermal"}
        </button>
        {showAdvanced && (
          <Card>
            <CardContent className="space-y-3 pt-6">
              <Field
                label={
                  <span className="flex items-center justify-between">
                    <span>Combustion efficiency</span>
                    <span className="text-xs text-zinc-500">
                      {combEff.toFixed(2)}
                    </span>
                  </span>
                }
              >
                <Slider
                  value={combEff * 100}
                  onChange={(v) => setCombEff(v / 100)}
                  min={5}
                  max={100}
                  step={1}
                  aria-label="Combustion efficiency"
                />
              </Field>
              <Field
                label={
                  <span className="flex items-center justify-between">
                    <span>Atmospheric transmissivity</span>
                    <span className="text-xs text-zinc-500">
                      {transmissivity.toFixed(2)}
                    </span>
                  </span>
                }
              >
                <Slider
                  value={transmissivity * 100}
                  onChange={(v) => setTransmissivity(v / 100)}
                  min={0}
                  max={100}
                  step={1}
                  aria-label="Atmospheric transmissivity"
                />
              </Field>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={overrideTank}
                  onChange={(e) => setOverrideTank(e.target.checked)}
                  className="h-3.5 w-3.5"
                />
                Override tank dimensions
              </label>
              {overrideTank && (
                <>
                  <Field
                    label={
                      <span className="flex items-center justify-between">
                        <span>Tank diameter (m)</span>
                        <span className="text-xs text-zinc-500">
                          {tankDiameter}
                        </span>
                      </span>
                    }
                  >
                    <Slider
                      value={tankDiameter}
                      onChange={setTankDiameter}
                      min={1}
                      max={100}
                      step={1}
                      aria-label="Tank diameter"
                    />
                  </Field>
                  <Field
                    label={
                      <span className="flex items-center justify-between">
                        <span>Tank height (m)</span>
                        <span className="text-xs text-zinc-500">
                          {tankHeight}
                        </span>
                      </span>
                    }
                  >
                    <Slider
                      value={tankHeight}
                      onChange={setTankHeight}
                      min={1}
                      max={100}
                      step={1}
                      aria-label="Tank height"
                    />
                  </Field>
                </>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            Live results
          </span>
          <button
            type="button"
            onClick={resetToDefaults}
            className="rounded-md border border-zinc-200 bg-white px-2 py-0.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            Reset
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {bandDistances.map((b) => (
            <div
              key={b.severity}
              className="rounded-md border border-zinc-200 bg-white px-2 py-2 text-center dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                {b.label}
              </div>
              <div className={`text-lg font-semibold ${b.color}`}>
                {b.value == null
                  ? "—"
                  : b.value >= 1000
                    ? `${(b.value / 1000).toFixed(1)} km`
                    : `${Math.round(b.value)} m`}
              </div>
            </div>
          ))}
        </div>

        <div className="text-[11px] leading-snug text-zinc-500 dark:text-zinc-400">
          {computing ? (
            <span className="flex items-center gap-1.5">
              <Loader2 className="h-3 w-3 animate-spin" /> Computing zones…
            </span>
          ) : result ? (
            <span>
              {result.n_records.toLocaleString()} grid points · {result.source_label}
            </span>
          ) : (
            <span>Loading…</span>
          )}
          {error && (
            <div className="mt-1 text-red-600 dark:text-red-400">{error}</div>
          )}
        </div>

        <div className="mt-auto pt-2 text-[10px] leading-snug italic text-zinc-500 dark:text-zinc-400">
          {DISCLAIMER}
        </div>
      </aside>

      {/* Map — always rendered so users see the basemap immediately, with
          zones overlaid once the API responds. */}
      <div className="relative h-full w-full">
        {result ? (
          <ZoneMap
            records={result.records}
            bbox={result.bbox}
            sourceLabel={result.source_label}
            strengthClass={result.strength_class}
          />
        ) : (
          <MapPlaceholder lat={lat} lon={lon} />
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="block text-xs">{label}</Label>
      {children}
    </div>
  );
}

function NumberInput({
  value,
  onChange,
  min,
  max,
  step,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
}) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(e) => {
        const v = Number(e.target.value);
        if (Number.isFinite(v)) onChange(v);
      }}
      className="h-9 w-full rounded-md border border-zinc-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-950"
    />
  );
}

/** A static Leaflet map showing only the selected lat/lon (a single
 *  marker) and the OSM basemap. Used as a placeholder while zone
 *  data is loading or unavailable. */
const PlaceholderMap = dynamic(
  () => import("@/components/der02/zone-map").then((m) => m.ZoneMap),
  { ssr: false },
);
function MapPlaceholder({ lat, lon }: { lat: number; lon: number }) {
  // Build a synthetic ZoneResponse with no records, so ZoneMap renders
  // the basemap + a tank marker but no zones. The bbox is the same
  // ±0.02° box the API uses.
  return (
    <PlaceholderMap
      records={[]}
      bbox={{
        min_lat: lat - DEFAULT_BBOX_HALF_EXTENT,
        min_lon: lon - DEFAULT_BBOX_HALF_EXTENT,
        max_lat: lat + DEFAULT_BBOX_HALF_EXTENT,
        max_lon: lon + DEFAULT_BBOX_HALF_EXTENT,
      }}
      sourceLabel={`Source: ${lat.toFixed(3)}, ${lon.toFixed(3)}`}
      strengthClass={0}
    />
  );
}
