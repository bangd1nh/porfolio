"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"

import { PortfolioBootLoader } from "@/components/molecules/portfolio-boot-loader"
import { usePathname } from "@/i18n/navigation"

const BOOT_DURATION_MS = 1_500
const REDUCED_BOOT_DURATION_MS = 120
const EXIT_DURATION_MS = 340
const SAFETY_TIMEOUT_MS = 6_000

type LoaderPhase = "boot" | "exit"

type GlobalLoaderContextValue = {
  startLoader: () => void
}

const GlobalLoaderContext = createContext<GlobalLoaderContextValue | null>(null)

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

/**
 * Coordinates the branded boot overlay during first paint and real route changes.
 */
export function GlobalLoaderProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [visible, setVisible] = useState(true)
  const [phase, setPhase] = useState<LoaderPhase>("boot")
  const initialPathRef = useRef<string | null>(null)
  const browserPathRef = useRef<string | null>(null)
  const startedAtRef = useRef(0)
  const finishTimerRef = useRef<number | null>(null)
  const exitTimerRef = useRef<number | null>(null)
  const safetyTimerRef = useRef<number | null>(null)

  const clearTimers = useCallback(() => {
    if (finishTimerRef.current) clearTimeout(finishTimerRef.current)
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current)
    if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current)
    finishTimerRef.current = null
    exitTimerRef.current = null
    safetyTimerRef.current = null
  }, [])

  const finishLoader = useCallback(() => {
    if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current)
    safetyTimerRef.current = null

    const minimumDuration = prefersReducedMotion()
      ? REDUCED_BOOT_DURATION_MS
      : BOOT_DURATION_MS
    const remaining = Math.max(
      0,
      minimumDuration - (Date.now() - startedAtRef.current)
    )

    if (finishTimerRef.current) clearTimeout(finishTimerRef.current)
    finishTimerRef.current = window.setTimeout(() => {
      setPhase("exit")
      exitTimerRef.current = window.setTimeout(() => {
        setVisible(false)
      }, prefersReducedMotion() ? 0 : EXIT_DURATION_MS)
    }, remaining)
  }, [])

  const startLoader = useCallback(() => {
    clearTimers()
    startedAtRef.current = Date.now()
    setVisible(true)
    setPhase("boot")
    safetyTimerRef.current = window.setTimeout(finishLoader, SAFETY_TIMEOUT_MS)
  }, [clearTimers, finishLoader])

  useEffect(() => {
    browserPathRef.current = window.location.pathname

    if (initialPathRef.current === null) {
      initialPathRef.current = pathname
      startedAtRef.current = Date.now()
      finishLoader()
      return
    }

    if (initialPathRef.current !== pathname) {
      initialPathRef.current = pathname
      finishLoader()
    }
  }, [finishLoader, pathname])

  useEffect(() => {
    browserPathRef.current = window.location.pathname

    const onPopState = () => {
      const nextPath = window.location.pathname

      // Next patches the History API, so hash-only replaceState calls may emit
      // popstate. Those are in-page scrolls, not route transitions.
      if (browserPathRef.current === nextPath) return

      browserPathRef.current = nextPath
      startLoader()
    }

    window.addEventListener("popstate", onPopState)
    return () => {
      window.removeEventListener("popstate", onPopState)
      clearTimers()
    }
  }, [clearTimers, startLoader])

  return (
    <GlobalLoaderContext.Provider value={{ startLoader }}>
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
