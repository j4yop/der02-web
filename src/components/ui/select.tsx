"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  id?: string;
  name?: string;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}

export function Select({
  value,
  onChange,
  options,
  id,
  name,
  disabled = false,
  className,
  "aria-label": ariaLabel,
}: SelectProps) {
  return (
    <select
      id={id}
      name={name}
      disabled={disabled}
      aria-label={ariaLabel}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "h-9 w-full rounded-md border border-zinc-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950",
        className,
      )}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
