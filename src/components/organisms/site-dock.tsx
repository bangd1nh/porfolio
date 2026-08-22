"use client"

import { Menu, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useId, useRef, useState } from "react"

import { LocaleSwitcher } from "@/components/molecules/locale-switcher"
import { NavLink } from "@/components/molecules/nav-link"
import { ThemeToggle } from "@/components/molecules/theme-toggle"
import { TransitionLink } from "@/components/molecules/transition-link"
import { Button } from "@/components/ui/button"
import { HOME_SECTIONS, NAV_ITEMS } from "@/data/site"
import { useDockVisibility } from "@/hooks/use-dock-visibility"
import { cn } from "@/lib/utils"

export function SiteDock() {
  const t = useTranslations("site")
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeHref, setActiveHref] = useState("#about")
  const menuId = useId()
  const progressRef = useRef<HTMLSpanElement>(null)
  const { visible } = useDockVisibility({ menuOpen })

  useEffect(() => {
    if (!menuOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false)
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [menuOpen])

  useEffect(() => {
    const sections = HOME_SECTIONS.map((id) => document.getElementById(id)).filter(
      (section): section is HTMLElement => section !== null
    )
    const visibility = new Map<string, number>()

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visibility.set(entry.target.id, entry.intersectionRatio)
        })
        const active = [...visibility.entries()].sort((a, b) => b[1] - a[1])[0]
        if (active?.[1]) setActiveHref(`#${active[0]}`)
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0, 0.05, 0.2, 0.5] }
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    let frame = 0
    const updateProgress = () => {
      frame = 0
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      const progress = maxScroll > 0 ? Math.min(1, window.scrollY / maxScroll) : 0
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${progress})`
      }
      if (progress >= 0.995) setActiveHref("#contact")
      else if (window.scrollY <= 1) setActiveHref("#about")
    }
    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateProgress)
    }

    updateProgress()
    window.addEventListener("scroll", requestUpdate, { passive: true })
    window.addEventListener("resize", requestUpdate)
    return () => {
      window.removeEventListener("scroll", requestUpdate)
      window.removeEventListener("resize", requestUpdate)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <header
      className={cn(
        "site-dock",
        visible && "site-dock-visible"
      )}
    >
      <span className="page-progress" aria-hidden>
        <span ref={progressRef} />
      </span>
      {menuOpen ? (
        <nav
          id={menuId}
          aria-label="Mobile navigation"
          className="mb-2 grid gap-1 border border-border bg-card p-2 lg:hidden"
        >
          {NAV_ITEMS.map((item, index) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={t(`nav.${item.labelKey}`)}
              index={index}
              isActive={activeHref === item.href}
              className="px-4 py-3 text-foreground"
              onNavigate={() => setMenuOpen(false)}
            />
          ))}
        </nav>
      ) : null}

      <div className="grid grid-flow-col items-center gap-2 border border-border bg-card px-3 py-2 sm:gap-3 sm:px-4">
        <TransitionLink
          href="/"
          className="font-heading shrink-0 text-sm tracking-tight transition-opacity hover:opacity-80 sm:text-base"
          onClick={() => setMenuOpen(false)}
        >
          {t("name")}
        </TransitionLink>

        <span
          className="hidden h-4 w-px bg-border lg:block"
          aria-hidden
        />

        <nav
          aria-label="Main navigation"
          className="hidden grid-flow-col items-center gap-0.5 lg:grid"
        >
          {NAV_ITEMS.map((item, index) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={t(`nav.${item.labelKey}`)}
              index={index}
              isActive={activeHref === item.href}
            />
          ))}
        </nav>

        <div className="grid grid-flow-col items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="min-h-9 min-w-9 rounded-none lg:hidden"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-label={menuOpen ? t("menuClose") : t("menuOpen")}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? (
              <X className="size-4" aria-hidden />
            ) : (
              <Menu className="size-4" aria-hidden />
            )}
          </Button>

          <div className="grid grid-flow-col items-center gap-1.5 border border-border p-1">
            <ThemeToggle />
            <LocaleSwitcher />
          </div>
        </div>
      </div>
    </header>
  )
}
