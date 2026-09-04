import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, MapPin, Wind, CodeXml, ExternalLink, FileText, BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "der02 — Consequence-modelling for industrial hazards",
  description:
    "TNO Multi-Energy blast + solid-flame thermal radiation with wind distortion. Open-source consequence-modelling for industrial fire and explosion response.",
};

const FEATURES = [
  {
    icon: AlertTriangle,
    title: "TNO Multi-Energy blast model",
    body: "Ten strength classes (1–10), per the TNO Green Book / CCPS / ICheme GAME convention. Class 7 (heavily congested module) is the standard siting default; class 10 is detonative.",
  },
  {
    icon: Wind,
    title: "Solid-flame thermal with wind distortion",
    body: "Nusselt-analog view-factor integration for the flame, with a wind heuristic that elongates downwind and compresses upwind — the CCPS qualitative behaviour without the rTME/NJB dispersion overhead.",
  },
  {
    icon: MapPin,
    title: "Nine fuels, NIST-sourced",
    body: "Propane, gasoline, methane, ethanol, hydrogen, ammonia, diesel (n-dodecane surrogate), kerosene (Jet A, n-dodecane surrogate), methanol. Each with LHV, flame temperature, emissivity, and density derived from NIST WebBook.",
  },
  {
    icon: FileText,
    title: "Honest disclosure baked in",
    body: "TNO curve values and per-fuel emissivities are flagged as not primary-verified in CITATIONS.md. We re-verify against the TNO Green Book, SFPE Handbook, and CCPS Guidelines for CPQRA before any operational use.",
  },
];

const STACK = [
  { name: "Next.js 16", role: "App Router + React 19" },
  { name: "FastAPI", role: "Backend on Vercel Python runtime" },
  { name: "TNO Multi-Energy", role: "Class 1–10 strength curves" },
  { name: "Nusselt view-factor", role: "Solid-flame radiation" },
  { name: "OpenStreetMap", role: "Basemap (no API key)" },
  { name: "leaflet / react-leaflet 5", role: "Map rendering" },
  { name: "NIST WebBook", role: "Fuel-property data" },
  { name: "Tailwind v4", role: "Styling" },
];

const DISCLOSURE =
  "TNO curve values and per-fuel emissivities are flagged as not primary-verified in CITATIONS.md — re-verify against the TNO Green Book (CPR 14E, 3rd ed.), SFPE Handbook of Fire Protection Engineering (5th ed.), and CCPS Guidelines for Chemical Process Quantitative Risk Analysis (2nd ed.) before any operational use. der02 is a consequence-modelling tool, not a substitute for engineering judgement or regulatory review.";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      {/* Top nav */}
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <Link
            href="/landing"
            className="font-mono text-sm font-semibold tracking-tight"
          >
            der02
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/"
              className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              Open tool
            </Link>
            <a
              href="https://github.com/j4yop/der02"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              <CodeXml className="h-3.5 w-3.5" /> Source
            </a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-5xl px-6 py-20 sm:py-28">
          <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">
            Consequence-modelling for industrial hazards
          </p>
          <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            TNO blast + solid-flame thermal, in your browser.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
            der02 is an open-source consequence-modelling tool for industrial fire and explosion response. Set a fuel, a tank volume, a wind, and a TNO strength class &mdash; see the lethal, danger, and caution zones on a map of your site. Honest about what is modelled and what isn&apos;t.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Open the tool
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
            <a
              href="https://github.com/j4yop/der02/blob/main/CITATIONS.md"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              <BookOpen className="h-3.5 w-3.5" /> Read CITATIONS.md
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="text-2xl font-bold tracking-tight">What it does</h2>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
            The frontend talks to a FastAPI backend (deployed on Vercel&apos;s Python runtime). The backend runs the same physics as the parent Python package &mdash; no duplicated logic.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <f.icon className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
                <h3 className="mt-3 text-sm font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stack */}
      <section className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="text-2xl font-bold tracking-tight">Stack</h2>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
            Open-source, no vendor lock-in, no API keys, no SaaS subscription.
          </p>
          <dl className="mt-8 grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {STACK.map((s) => (
              <div
                key={s.name}
                className="flex items-baseline justify-between border-b border-zinc-100 py-2 text-sm last:border-0 dark:border-zinc-900"
              >
                <dt className="font-medium">{s.name}</dt>
                <dd className="text-zinc-500 dark:text-zinc-400">{s.role}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Disclosure */}
      <section className="border-b border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-400" />
            <div>
              <h2 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                Disclosure
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-amber-900 dark:text-amber-300">
                {DISCLOSURE}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-50 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-3 px-6 py-8 sm:flex-row sm:items-center">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            der02 — MIT licensed. No tracking, no analytics, no cookies.
          </p>
          <div className="flex items-center gap-4 text-sm">
            <Link
              href="/"
              className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              Open tool
            </Link>
            <a
              href="https://github.com/j4yop/der02"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              <CodeXml className="h-3.5 w-3.5" /> GitHub
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
