import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "der02 — Threat-Zone Estimator",
  description:
    "TNO Multi-Energy blast + solid-flame thermal radiation with wind distortion. Consequence modelling for industrial fire and explosion response.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="h-full bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
        {children}
      </body>
    </html>
  );
}
