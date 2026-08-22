export const PORTFOLIO_BOOT_SESSION_KEY = "portfolio:boot-complete"
export const PORTFOLIO_ROUTE_TRANSITION_KEY =
  "portfolio:route-transition-started-at"

const PORTFOLIO_ROUTE_APPEARANCE_KEY = "portfolio:route-loader-appearance"
const PORTFOLIO_ROUTE_COPY_KEY = "portfolio:route-loader-copy"
const LOADER_COLOR_TOKENS = [
  "--background",
  "--foreground",
  "--border",
  "--primary",
  "--muted-foreground",
] as const

type LoaderColorToken = (typeof LOADER_COLOR_TOKENS)[number]

export type LoaderPresentation = {
  startedAt: number
  elapsedMs: number
  appearance: Partial<Record<LoaderColorToken, string>>
  copy: LoaderCopy | null
}

export type LoaderCopy = {
  label: string
  eyebrow: string
  steps: readonly [string, string, string, string]
}

export function getSessionValue(key: string) {
  try {
    return window.sessionStorage.getItem(key)
  } catch {
    return null
  }
}

export function setSessionValue(key: string, value: string) {
  try {
    window.sessionStorage.setItem(key, value)
  } catch {
    // Storage can be unavailable in restricted browser contexts.
  }
}

export function removeSessionValue(key: string) {
  try {
    window.sessionStorage.removeItem(key)
  } catch {
    // Storage can be unavailable in restricted browser contexts.
  }
}

/** Persists enough visual state for a loader remount to remain seamless. */
export function beginRouteLoaderTransition(
  startedAt: number,
  copy: LoaderCopy
) {
  const computedStyle = window.getComputedStyle(document.documentElement)
  const appearance = Object.fromEntries(
    LOADER_COLOR_TOKENS.map((token) => [
      token,
      computedStyle.getPropertyValue(token),
    ])
  )

  setSessionValue(PORTFOLIO_ROUTE_TRANSITION_KEY, String(startedAt))
  setSessionValue(PORTFOLIO_ROUTE_APPEARANCE_KEY, JSON.stringify(appearance))
  setSessionValue(PORTFOLIO_ROUTE_COPY_KEY, JSON.stringify(copy))
}

export function clearRouteLoaderTransition() {
  removeSessionValue(PORTFOLIO_ROUTE_TRANSITION_KEY)
  removeSessionValue(PORTFOLIO_ROUTE_APPEARANCE_KEY)
  removeSessionValue(PORTFOLIO_ROUTE_COPY_KEY)
}

export function readLoaderPresentation(): LoaderPresentation {
  if (typeof window === "undefined") {
    return { startedAt: 0, elapsedMs: 0, appearance: {}, copy: null }
  }

  const startedAt = Number(getSessionValue(PORTFOLIO_ROUTE_TRANSITION_KEY))
  if (!Number.isFinite(startedAt) || startedAt <= 0) {
    return { startedAt: 0, elapsedMs: 0, appearance: {}, copy: null }
  }

  let appearance: LoaderPresentation["appearance"] = {}
  let copy: LoaderCopy | null = null

  try {
    const storedAppearance = getSessionValue(PORTFOLIO_ROUTE_APPEARANCE_KEY)
    if (storedAppearance) {
      const parsed = JSON.parse(storedAppearance) as Record<string, unknown>
      appearance = Object.fromEntries(
        LOADER_COLOR_TOKENS.flatMap((token) =>
          typeof parsed[token] === "string" ? [[token, parsed[token]]] : []
        )
      )
    }
  } catch {
    // Invalid transient state falls back to the current theme tokens.
  }

  try {
    const storedCopy = getSessionValue(PORTFOLIO_ROUTE_COPY_KEY)
    if (storedCopy) {
      const parsed = JSON.parse(storedCopy) as LoaderCopy
      if (
        typeof parsed.label === "string" &&
        typeof parsed.eyebrow === "string" &&
        Array.isArray(parsed.steps) &&
        parsed.steps.length === 4 &&
        parsed.steps.every((step) => typeof step === "string")
      ) {
        copy = parsed
      }
    }
  } catch {
    // Invalid transient copy falls back to the active locale messages.
  }

  return {
    startedAt,
    elapsedMs: Math.max(0, Date.now() - startedAt),
    appearance,
    copy,
  }
}
