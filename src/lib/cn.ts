import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** shadcn-style `cn` helper: merge Tailwind class names with later-wins semantics. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
