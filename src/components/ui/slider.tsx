"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

export interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  id?: string;
  name?: string;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}

/** Lightweight range slider. shadcn API-compatible. */
export function Slider({
  value,
  onChange,
  min,
  max,
  step = 1,
  id,
  name,
  disabled = false,
  className,
  "aria-label": ariaLabel,
}: SliderProps) {
  return (
    <input
      id={id}
      name={name}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      disabled={disabled}
      aria-label={ariaLabel}
      onChange={(e) => onChange(Number(e.target.value))}
      className={cn(
        "h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-200 accent-red-700 dark:bg-zinc-800 dark:accent-red-500",
        "[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-700",
        "[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-red-700 [&::-moz-range-thumb]:border-0",
        className,
      )}
    />
  );
}
