const PORTFOLIO_BOOT_SESSION_KEY = "portfolio:boot-complete"

try {
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches
  const hasBooted = window.sessionStorage.getItem(
    PORTFOLIO_BOOT_SESSION_KEY
  )

  if (hasBooted === "1") {
    document.documentElement.dataset.portfolioBoot = "seen"
  } else if (reducedMotion) {
    window.sessionStorage.setItem(PORTFOLIO_BOOT_SESSION_KEY, "1")
    document.documentElement.dataset.portfolioBoot = "reduced"
  }
} catch {
  // Storage can be unavailable in restricted browser contexts.
}
