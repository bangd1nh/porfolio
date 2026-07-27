export type RevealOrigin = {
  x: number
  y: number
}

export type ResolvedThemeName = "light" | "dark"

/** Destination surfaces — mirrors `:root` / `.dark` `--background` in globals.css. */
export const THEME_BACKGROUNDS: Record<ResolvedThemeName, string> = {
  light: "oklch(1 0 0)",
  dark: "oklch(0.145 0.004 260)",
}

export const THEME_REVEAL_MS = 600
/** Ease-out — avoids the end stall of ease-in-out on Chrome VT. */
export const THEME_REVEAL_EASING = "cubic-bezier(0.22, 1, 0.36, 1)"
/** Cover the viewport before easing flattens. */
export const THEME_REVEAL_RADIUS_PAD = 1.08

/** Center of an element in viewport coordinates. */
export function getRevealOrigin(element: HTMLElement): RevealOrigin {
  const rect = element.getBoundingClientRect()
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  }
}

/** Radius that reaches every viewport corner from `(x, y)`. */
export function getRevealRadius(x: number, y: number): number {
  const vw = window.innerWidth
  const vh = window.innerHeight
  return Math.max(
    Math.hypot(x, y),
    Math.hypot(vw - x, y),
    Math.hypot(x, vh - y),
    Math.hypot(vw - x, vh - y)
  )
}

export function supportsViewTransition(): boolean {
  return (
    typeof document !== "undefined" &&
    typeof document.startViewTransition === "function"
  )
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

/** Viewport-px vars for the circular clip-path reveal. */
export function applyRevealCssVars(origin: RevealOrigin, radius: number) {
  const root = document.documentElement
  root.style.setProperty("--theme-reveal-x", `${origin.x}px`)
  root.style.setProperty("--theme-reveal-y", `${origin.y}px`)
  root.style.setProperty("--theme-reveal-r", `${radius}px`)
}

export function clearRevealCssVars() {
  const root = document.documentElement
  root.style.removeProperty("--theme-reveal-x")
  root.style.removeProperty("--theme-reveal-y")
  root.style.removeProperty("--theme-reveal-r")
}
