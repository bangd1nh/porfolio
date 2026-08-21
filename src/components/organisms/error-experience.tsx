"use client"

import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ArrowLeft, House, RefreshCw } from "lucide-react"
import { useEffect, useRef, useSyncExternalStore } from "react"

import { DotSpotlightBackground } from "@/components/atoms/dot-spotlight-background"
import { PageGrid } from "@/components/atoms/page-grid"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  errorPageCopy,
  type ErrorPageCode,
} from "@/data/error-pages"
import type { Locale } from "@/i18n/routing"

gsap.registerPlugin(useGSAP)

type ErrorExperienceProps = {
  code: ErrorPageCode
  locale?: Locale
  digest?: string
  onRetry?: () => void
  syncDocument?: boolean
}

function localeFromPathname(): Locale {
  if (typeof window === "undefined") return "vi"
  return /^\/en(?:\/|$)/.test(window.location.pathname) ? "en" : "vi"
}

function subscribeToPathname(onStoreChange: () => void) {
  window.addEventListener("popstate", onStoreChange)
  return () => window.removeEventListener("popstate", onStoreChange)
}

function syncGlobalTheme() {
  const storedTheme = window.localStorage.getItem("theme")
  const dark =
    storedTheme === "dark" ||
    (storedTheme !== "light" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)

  document.documentElement.classList.toggle("dark", dark)
}

export function ErrorExperience({
  code,
  locale,
  digest,
  onRetry,
  syncDocument = false,
}: ErrorExperienceProps) {
  const rootRef = useRef<HTMLElement>(null)
  const pathLocale = useSyncExternalStore<Locale>(
    subscribeToPathname,
    localeFromPathname,
    () => "vi"
  )
  const activeLocale = locale ?? pathLocale
  const copy = errorPageCopy[activeLocale][code]
  const homeHref = `/${activeLocale}`

  useEffect(() => {
    if (!syncDocument) return

    document.documentElement.lang = activeLocale
    syncGlobalTheme()
  }, [activeLocale, syncDocument])

  useGSAP(
    () => {
      const root = rootRef.current
      if (!root) return

      const modules = root.querySelectorAll<HTMLElement>("[data-error-module]")
      const terminalRows =
        root.querySelectorAll<HTMLElement>("[data-terminal-row]")
      const introItems = root.querySelectorAll<HTMLElement>("[data-error-intro]")
      const track = root.querySelector<HTMLElement>("[data-route-track]")
      const marker = root.querySelector<HTMLElement>("[data-route-marker]")
      const signal = root.querySelector<HTMLElement>("[data-error-signal]")
      const floaters = root.querySelectorAll<HTMLElement>("[data-error-float]")
      const media = gsap.matchMedia()

      media.add(
        { reduceMotion: "(prefers-reduced-motion: reduce)" },
        (context) => {
          if (context.conditions?.reduceMotion) {
            gsap.set(
              [modules, terminalRows, introItems, track, marker, signal],
              { clearProps: "all" }
            )
            return
          }

          const timeline = gsap.timeline({
            defaults: { duration: 0.58, ease: "power3.out" },
          })

          timeline
            .addLabel("boot")
            .from(introItems, {
              autoAlpha: 0,
              y: 18,
              stagger: 0.08,
            }, "boot")
            .from(modules, {
              autoAlpha: 0,
              yPercent: code === "404" ? -120 : 95,
              rotation: (index) => (index - 1) * (code === "404" ? 5 : -4),
              stagger: 0.1,
              duration: 0.78,
              ease: "back.out(1.25)",
            }, "boot+=0.08")
            .from(track, {
              scaleX: 0,
              transformOrigin: "left center",
              duration: 0.72,
            }, "boot+=0.32")
            .from(marker, {
              autoAlpha: 0,
              xPercent: -360,
              duration: 0.72,
              ease: "power2.inOut",
            }, "boot+=0.34")
            .from(terminalRows, {
              autoAlpha: 0,
              x: -12,
              stagger: 0.1,
              duration: 0.36,
            }, "boot+=0.58")
            .from(signal, {
              autoAlpha: 0,
              scaleX: 0,
              transformOrigin: "left center",
              duration: 0.4,
            }, "boot+=0.72")

          if (code === "404") {
            timeline
              .to(modules[1], {
                autoAlpha: 0.24,
                y: 10,
                duration: 0.1,
                repeat: 3,
                yoyo: true,
              }, "boot+=0.84")
              .to(modules[1], {
                autoAlpha: 1,
                y: 0,
                duration: 0.24,
              })
          } else {
            timeline
              .to(modules, {
                x: (index) => (index % 2 === 0 ? 7 : -7),
                duration: 0.055,
                repeat: 5,
                yoyo: true,
                stagger: 0.018,
              }, "boot+=0.82")
              .to(modules, { x: 0, duration: 0.18 })
          }

          gsap.to(floaters, {
            y: (index) => (index % 2 === 0 ? -7 : 7),
            rotation: (index) => (index % 2 === 0 ? 2 : -2),
            duration: 2.6,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            stagger: 0.28,
          })
        },
        root
      )

      return () => media.revert()
    },
    { dependencies: [code], revertOnUpdate: true, scope: rootRef }
  )

  const goBack = () => {
    if (window.history.length > 1) {
      window.history.back()
      return
    }

    window.location.assign(homeHref)
  }

  return (
    <section
      ref={rootRef}
      className="relative isolate min-h-svh overflow-hidden bg-background text-foreground"
      aria-labelledby="error-title"
    >
      <DotSpotlightBackground />

      <PageGrid className="relative z-10 min-h-svh content-between gap-y-8 py-5 sm:py-8 lg:py-10">
        <header
          data-error-intro
          className="col-span-10 flex items-center justify-between gap-4 border-b border-border pb-4 font-mono text-[0.65rem] font-semibold tracking-[0.16em] uppercase"
        >
          <a href={homeHref} className="transition-colors hover:text-primary">
            N.D.Bang / portfolio
          </a>
          <span className="flex items-center gap-2 text-muted-foreground">
            <span className="size-2 bg-primary" aria-hidden />
            {code === "404" ? "route_offline" : "runtime_guard"}
          </span>
        </header>

        <main className="col-span-10 grid grid-cols-10 items-center gap-x-[inherit] gap-y-8 py-4 lg:py-8">
          <div className="col-span-10 grid gap-6 lg:col-span-4 lg:pr-6">
            <div className="grid gap-3">
              <p
                data-error-intro
                className="font-mono text-xs font-bold tracking-[0.18em] text-primary uppercase"
              >
                {copy.eyebrow} / {code}
              </p>
              <h1
                id="error-title"
                data-error-intro
                className="max-w-xl font-heading text-4xl leading-[0.98] tracking-[-0.045em] text-balance sm:text-5xl lg:text-6xl"
              >
                {copy.title}
              </h1>
              <p
                data-error-intro
                className="max-w-lg text-sm leading-6 text-muted-foreground sm:text-base"
              >
                {copy.description}
              </p>
            </div>

            <div data-error-intro className="flex flex-wrap gap-2.5">
              {onRetry ? (
                <Button type="button" size="lg" onClick={onRetry}>
                  <RefreshCw data-icon="inline-start" />
                  {copy.retry}
                </Button>
              ) : null}
              <a
                href={homeHref}
                className={buttonVariants({ size: "lg" })}
              >
                <House data-icon="inline-start" />
                {copy.home}
              </a>
              <Button type="button" size="lg" variant="outline" onClick={goBack}>
                <ArrowLeft data-icon="inline-start" />
                {copy.back}
              </Button>
            </div>

            {digest ? (
              <p
                data-error-intro
                className="font-mono text-[0.65rem] tracking-[0.12em] text-muted-foreground uppercase"
              >
                {copy.reference}: {digest}
              </p>
            ) : null}
          </div>

          <div
            data-error-float
            className="relative col-span-10 min-w-0 border border-border bg-card p-3 shadow-[8px_8px_0_color-mix(in_oklch,var(--foreground)_8%,transparent)] sm:p-5 lg:col-span-6 lg:p-6"
          >
            <span
              className="absolute -top-px -left-px size-3 border-t-2 border-l-2 border-primary"
              aria-hidden
            />
            <span
              className="absolute -right-px -bottom-px size-3 border-r-2 border-b-2 border-primary"
              aria-hidden
            />

            <div className="mb-3 flex items-center justify-between gap-3 border-b border-border pb-3 font-mono text-[0.6rem] font-bold tracking-[0.14em] uppercase sm:text-[0.68rem]">
              <span>diagnostic://{code}</span>
              <span className="text-primary">{copy.status}</span>
            </div>

            <div
              className="grid grid-cols-3 gap-2 sm:gap-3"
              aria-hidden
            >
              {code.split("").map((digit, index) => (
                <div
                  key={`${digit}-${index}`}
                  data-error-module
                  className="relative grid aspect-[0.78] min-w-0 place-items-center overflow-hidden border border-border bg-muted"
                >
                  <span className="font-heading text-[clamp(4.5rem,21vw,10.5rem)] leading-none tracking-[-0.1em]">
                    {digit}
                  </span>
                  <span className="absolute top-2 left-2 font-mono text-[0.5rem] font-bold text-muted-foreground sm:text-[0.6rem]">
                    0{index + 1}
                  </span>
                  <span className="absolute right-2 bottom-2 size-1.5 bg-primary" />
                </div>
              ))}
            </div>

            <div className="relative my-4 h-px bg-border" aria-hidden>
              <span
                data-route-track
                className="absolute inset-0 origin-left bg-primary"
              />
              <span
                data-route-marker
                className="absolute top-1/2 right-0 size-2 -translate-y-1/2 bg-primary"
              />
            </div>

            <div className="grid gap-2 font-mono text-[0.62rem] leading-5 text-muted-foreground sm:text-xs">
              {copy.terminal.map((line, index) => (
                <p
                  key={line}
                  data-terminal-row
                  className="grid grid-cols-[1.8rem_1fr] gap-2"
                >
                  <span className="text-primary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{line}</span>
                </p>
              ))}
            </div>

            <div
              data-error-signal
              className="mt-4 h-1 origin-left bg-primary"
              aria-hidden
            />
          </div>
        </main>

        <footer
          data-error-intro
          className="col-span-10 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 font-mono text-[0.6rem] tracking-[0.12em] text-muted-foreground uppercase"
        >
          <span>boundary active</span>
          <span>{new Date().getFullYear()} / recovery interface</span>
        </footer>
      </PageGrid>

      <span
        data-error-float
        className="pointer-events-none absolute top-[18%] right-[4%] size-5 border border-primary opacity-70"
        aria-hidden
      />
      <span
        data-error-float
        className="pointer-events-none absolute bottom-[15%] left-[3%] size-3 bg-primary opacity-80"
        aria-hidden
      />
    </section>
  )
}
