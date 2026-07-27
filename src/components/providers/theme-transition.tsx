"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react"
import { createPortal, flushSync } from "react-dom"
import { useTheme } from "@teispace/next-themes"

import {
  THEME_BACKGROUNDS,
  THEME_REVEAL_EASING,
  THEME_REVEAL_MS,
  THEME_REVEAL_RADIUS_PAD,
  applyRevealCssVars,
  clearRevealCssVars,
  getRevealOrigin,
  getRevealRadius,
  prefersReducedMotion,
  supportsViewTransition,
  type ResolvedThemeName,
} from "@/lib/theme-reveal"

type StartThemeTransitionOptions = {
  originElement: HTMLElement | null
  nextTheme?: ResolvedThemeName
}

type ThemeTransitionContextValue = {
  startThemeTransition: (
    options: StartThemeTransitionOptions
  ) => Promise<void>
  isTransitioning: boolean
}

const ThemeTransitionContext =
  createContext<ThemeTransitionContextValue | null>(null)

type FallbackOverlay = {
  x: number
  y: number
  radius: number
  background: string
}

type ThemeTransitionProps = {
  children: React.ReactNode
}

function waitNextPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve())
    })
  })
}

/**
 * Circular theme reveal (Ant Design–style) via View Transition + clip-path.
 * Must sit inside ThemeProvider.
 */
export function ThemeTransition({ children }: ThemeTransitionProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [overlay, setOverlay] = useState<FallbackOverlay | null>(null)
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const busyRef = useRef(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const resolveNextTheme = useCallback(
    (explicit?: ResolvedThemeName): ResolvedThemeName => {
      if (explicit) return explicit
      return resolvedTheme === "dark" ? "light" : "dark"
    },
    [resolvedTheme]
  )

  const runFallbackReveal = useCallback(
    (next: ResolvedThemeName, x: number, y: number, radius: number) =>
      new Promise<void>((resolve) => {
        const background = THEME_BACKGROUNDS[next]
        setOverlay({ x, y, radius, background })

        requestAnimationFrame(() => {
          const node = overlayRef.current
          if (!node) {
            setTheme(next)
            setOverlay(null)
            resolve()
            return
          }

          const animation = node.animate(
            [
              {
                clipPath: `circle(0px at ${x}px ${y}px)`,
              },
              {
                clipPath: `circle(${radius}px at ${x}px ${y}px)`,
              },
            ],
            {
              duration: THEME_REVEAL_MS,
              easing: THEME_REVEAL_EASING,
              fill: "forwards",
            }
          )

          const midId = window.setTimeout(() => {
            setTheme(next)
          }, THEME_REVEAL_MS / 2)

          animation.finished
            .catch(() => undefined)
            .finally(() => {
              window.clearTimeout(midId)
              setTheme(next)
              setOverlay(null)
              resolve()
            })
        })
      }),
    [setTheme]
  )

  const startThemeTransition = useCallback(
    async ({ originElement, nextTheme }: StartThemeTransitionOptions) => {
      if (busyRef.current) return

      const next = resolveNextTheme(nextTheme)
      const current: ResolvedThemeName =
        resolvedTheme === "dark" ? "dark" : "light"
      if (next === current) return

      if (!originElement || prefersReducedMotion()) {
        setTheme(next)
        return
      }

      const origin = getRevealOrigin(originElement)
      const radius =
        getRevealRadius(origin.x, origin.y) * THEME_REVEAL_RADIUS_PAD

      busyRef.current = true
      setIsTransitioning(true)

      try {
        if (supportsViewTransition()) {
          applyRevealCssVars(origin, radius)

          const transition = document.startViewTransition(() => {
            flushSync(() => {
              setTheme(next)
            })
          })

          await transition.finished.catch(() => undefined)
        } else {
          await runFallbackReveal(next, origin.x, origin.y, radius)
        }
      } finally {
        await waitNextPaint()
        clearRevealCssVars()
        busyRef.current = false
        setIsTransitioning(false)
      }
    },
    [resolveNextTheme, resolvedTheme, runFallbackReveal, setTheme]
  )

  const value = useMemo(
    () => ({ startThemeTransition, isTransitioning }),
    [startThemeTransition, isTransitioning]
  )

  return (
    <ThemeTransitionContext.Provider value={value}>
      {children}
      {overlay
        ? createPortal(
            <div
              ref={overlayRef}
              aria-hidden
              className="theme-reveal-overlay pointer-events-none fixed inset-0 z-9999"
              style={{
                background: overlay.background,
                clipPath: `circle(0px at ${overlay.x}px ${overlay.y}px)`,
                willChange: "clip-path",
              }}
            />,
            document.body
          )
        : null}
    </ThemeTransitionContext.Provider>
  )
}

export function useThemeTransitionContext(): ThemeTransitionContextValue {
  const ctx = useContext(ThemeTransitionContext)
  if (!ctx) {
    throw new Error(
      "useThemeTransition must be used within ThemeTransition"
    )
  }
  return ctx
}
