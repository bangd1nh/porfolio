import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Compact display: 1200 → "1.2k" */
export function formatCompact(value: number): string {
  if (value < 1000) return String(value)
  const compact = value / 1000
  const rounded =
    compact >= 10
      ? Math.round(compact).toString()
      : compact.toFixed(1).replace(/\.0$/, "")
  return `${rounded}k`
}
