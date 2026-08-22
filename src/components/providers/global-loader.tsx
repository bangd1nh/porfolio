"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { useLocale, useTranslations } from "next-intl"

import { PortfolioBootLoader } from "@/components/molecules/portfolio-boot-loader"
import { usePathname } from "@/i18n/navigation"
import {
  beginRouteLoaderTransition,
  clearRouteLoaderTransition,
  getSessionValue,
  PORTFOLIO_BOOT_SESSION_KEY,
  PORTFOLIO_ROUTE_TRANSITION_KEY,
  setSessionValue,
} from "@/lib/portfolio-loader-state"

const BOOT_DURATION_MS = 650
const EXIT_DURATION_MS = 180
const SAFETY_TIMEOUT_MS = 6_000

type LoaderPhase = "boot" | "exit"

type GlobalLoaderContextValue = {
  startLoader: () => void
  introReady: boolean
}

const GlobalLoaderContext = createContext<GlobalLoaderContextValue | null>(null)

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

/** Coordinates the first-session boot and subsequent full-route transitions. */
export function GlobalLoaderProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const locale = useLocale()
  const tLoader = useTranslations("loader")
  const navigationKey = `${locale}:${pathname}`
  const [visible, setVisible] = useState(true)
  const [phase, setPhase] = useState<LoaderPhase>("boot")
  const [introReady, setIntroReady] = useState(false)
  const navigationKeyRef = useRef<string | null>(null)
  const browserPathRef = useRef<string | null>(null)
  const transitionActiveRef = useRef(false)
  const startedAtRef = useRef(0)
  const finishTimerRef = useRef<number | null>(null)
  const exitTimerRef = useRef<number | null>(null)
  const safetyTimerRef = useRef<number | null>(null)
  const readyFrameRef = useRef<number | null>(null)

  const clearTimers = useCallback(() => {
    if (finishTimerRef.current) window.clearTimeout(finishTimerRef.current)
    if (exitTimerRef.current) window.clearTimeout(exitTimerRef.current)
    if (safetyTimerRef.current) window.clearTimeout(safetyTimerRef.current)
    if (readyFrameRef.current) window.cancelAnimationFrame(readyFrameRef.current)
    finishTimerRef.current = null
    exitTimerRef.current = null
    safetyTimerRef.current = null
    readyFrameRef.current = null
  }, [])

  const completeLoader = useCallback(() => {
    transitionActiveRef.current = false
    clearRouteLoaderTransition()
    setSessionValue(PORTFOLIO_BOOT_SESSION_KEY, "1")
    document.documentElement.dataset.portfolioBoot = "complete"
    setVisible(false)
    setIntroReady(true)
  }, [])

  const revealSeenSession = useCallback((reducedMotion: boolean) => {
    document.documentElement.dataset.portfolioBoot = reducedMotion
      ? "reduced"
      : "seen"

    if (readyFrameRef.current) {
      window.cancelAnimationFrame(readyFrameRef.current)
    }

    readyFrameRef.current = window.requestAnimationFrame(() => {
      readyFrameRef.current = null
      setVisible(false)
      setIntroReady(true)
    })
  }, [])

  const finishLoader = useCallback(() => {
    if (!transitionActiveRef.current) return

    if (safetyTimerRef.current) window.clearTimeout(safetyTimerRef.current)
    if (finishTimerRef.current) window.clearTimeout(finishTimerRef.current)
    if (exitTimerRef.current) window.clearTimeout(exitTimerRef.current)
    safetyTimerRef.current = null

    const reducedMotion = prefersReducedMotion()
    const remaining = reducedMotion
      ? 0
      : Math.max(0, BOOT_DURATION_MS - (Date.now() - startedAtRef.current))

    finishTimerRef.current = window.setTimeout(() => {
      setPhase("exit")
      exitTimerRef.current = window.setTimeout(
        completeLoader,
        reducedMotion ? 0 : EXIT_DURATION_MS
      )
    }, remaining)
  }, [completeLoader])

  const startLoader = useCallback(() => {
    clearTimers()

    if (prefersReducedMotion()) {
      transitionActiveRef.current = false
      clearRouteLoaderTransition()
      document.documentElement.dataset.portfolioBoot = "reduced"
      setVisible(false)
      setIntroReady(true)
      return
    }

    transitionActiveRef.current = true
    startedAtRef.current = Date.now()
    beginRouteLoaderTransition(startedAtRef.current, {
      label: tLoader("label"),
      eyebrow: tLoader("eyebrow"),
      steps: [
        tLoader("steps.initialize"),
        tLoader("steps.work"),
        tLoader("steps.github"),
        tLoader("steps.ready"),
      ],
    })
    document.documentElement.dataset.portfolioBoot = "route"
    setPhase("boot")
    setVisible(true)
    safetyTimerRef.current = window.setTimeout(finishLoader, SAFETY_TIMEOUT_MS)
  }, [clearTimers, finishLoader, tLoader])

  useEffect(() => {
    browserPathRef.current = window.location.pathname

    if (navigationKeyRef.current === null) {
      navigationKeyRef.current = navigationKey

      const pendingStartedAt = Number(
        getSessionValue(PORTFOLIO_ROUTE_TRANSITION_KEY)
      )
      const hasPendingRoute =
        Number.isFinite(pendingStartedAt) &&
        pendingStartedAt > 0 &&
        Date.now() - pendingStartedAt < SAFETY_TIMEOUT_MS

      if (hasPendingRoute && !prefersReducedMotion()) {
        transitionActiveRef.current = true
        startedAtRef.current = pendingStartedAt
        document.documentElement.dataset.portfolioBoot = "route"
        finishLoader()
        return
      }

      clearRouteLoaderTransition()

      if (
        getSessionValue(PORTFOLIO_BOOT_SESSION_KEY) === "1" ||
        prefersReducedMotion()
      ) {
        const reducedMotion = prefersReducedMotion()
        setSessionValue(PORTFOLIO_BOOT_SESSION_KEY, "1")
        revealSeenSession(reducedMotion)
        return
      }

      transitionActiveRef.current = true
      startedAtRef.current = Date.now()
      finishLoader()
      return
    }

    if (navigationKeyRef.current === navigationKey) {
      // React Strict Mode runs effect cleanup/setup twice in development.
      // Re-arm whichever completion callback the cleanup just cancelled.
      if (transitionActiveRef.current) {
        finishLoader()
      } else if (
        getSessionValue(PORTFOLIO_BOOT_SESSION_KEY) === "1" ||
        prefersReducedMotion()
      ) {
        revealSeenSession(prefersReducedMotion())
      }
      return
    }

    navigationKeyRef.current = navigationKey
    if (!transitionActiveRef.current) startLoader()
    finishLoader()
  }, [finishLoader, navigationKey, revealSeenSession, startLoader])

  useEffect(() => {
    const onPopState = () => {
      const nextPath = window.location.pathname

      // Hash-only history updates are in-page navigation, not route changes.
      if (browserPathRef.current === nextPath) return

      browserPathRef.current = nextPath
      if (!transitionActiveRef.current) startLoader()
    }

    window.addEventListener("popstate", onPopState)
    return () => window.removeEventListener("popstate", onPopState)
  }, [startLoader])

  useEffect(() => clearTimers, [clearTimers])

  const value = useMemo(
    () => ({ startLoader, introReady }),
    [introReady, startLoader]
  )

  return (
    <GlobalLoaderContext.Provider value={value}>
      {children}
      {visible ? <PortfolioBootLoader phase={phase} /> : null}
    </GlobalLoaderContext.Provider>
  )
}

export function useGlobalLoader() {
  const context = useContext(GlobalLoaderContext)
  if (!context) {
    throw new Error("useGlobalLoader must be used within GlobalLoaderProvider")
  }
  return context
}
