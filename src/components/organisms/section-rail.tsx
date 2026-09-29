"use client"

import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"

import { HOME_SECTIONS, NAV_ITEMS } from "@/data/site"
import { prefersReducedMotion, scrollToHashSection } from "@/lib/scroll-to-section"
import { cn } from "@/lib/utils"

/** Desktop screen index — one tick per full-height section, active tick grows. */
export function SectionRail() {
  const t = useTranslations("site")
  const [active, setActive] = useState(0)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const probe = window.innerHeight * 0.5
      let index = 0
      HOME_SECTIONS.forEach((id, i) => {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= probe) index = i
      })
      setActive(index)
    }
    const request = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener("scroll", request, { passive: true })
    window.addEventListener("resize", request)
    return () => {
      window.removeEventListener("scroll", request)
      window.removeEventListener("resize", request)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <nav aria-label={t("mainNavigation")} className="section-rail print:hidden">
      <p className="section-rail-count" aria-hidden>
        <span key={active} className="section-rail-current">
          {String(active + 1).padStart(2, "0")}
        </span>
        <span className="text-muted-foreground">
          /{String(HOME_SECTIONS.length).padStart(2, "0")}
        </span>
      </p>
      <ol className="grid gap-1">
        {NAV_ITEMS.map((item, index) => (
          <li key={item.href}>
            <a
              href={item.href}
              aria-current={index === active ? "location" : undefined}
              className={cn("section-rail-link", index === active && "is-active")}
              onClick={(event) => {
                event.preventDefault()
                scrollToHashSection(item.href, !prefersReducedMotion())
              }}
            >
              <span className="section-rail-label">{t(`nav.${item.labelKey}`)}</span>
              <span className="section-rail-tick" aria-hidden />
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
