"use client"

import { useEffect, useRef } from "react"

import { HOME_SECTIONS } from "@/data/site"
import { useMediaQuery } from "@/hooks/use-media-query"

const LOCK_MS = 550
/** Pixel-equivalent intent before paging (after deltaMode normalize). */
const PAGE_ACCUM_PX = 72
const SWIPE_THRESHOLD = 48
const LINE_HEIGHT_PX = 18

function getSectionElements(): HTMLElement[] {
  return HOME_SECTIONS.map((id) => document.getElementById(id)).filter(
    (el): el is HTMLElement => el !== null
  )
}

function getActiveIndex(sections: HTMLElement[]): number {
  const mid = window.innerHeight * 0.35
  let best = 0
  let bestDist = Number.POSITIVE_INFINITY

  sections.forEach((el, index) => {
    const dist = Math.abs(el.getBoundingClientRect().top - mid)
    if (dist < bestDist) {
      bestDist = dist
      best = index
    }
  })

  return best
}

/** True when the active section still has room to scroll in `direction`. */
function sectionHasMore(section: HTMLElement, direction: 1 | -1): boolean {
  const rect = section.getBoundingClientRect()
  if (direction > 0) {
    return rect.bottom > window.innerHeight + 4
  }
  return rect.top < -4
}

/** Firefox often uses DOM_DELTA_LINE — normalize everything to pixels. */
function normalizeWheelDeltaY(event: WheelEvent): number {
  const { deltaY, deltaMode } = event
  if (deltaMode === WheelEvent.DOM_DELTA_LINE) {
    return deltaY * LINE_HEIGHT_PX
  }
  if (deltaMode === WheelEvent.DOM_DELTA_PAGE) {
    return deltaY * window.innerHeight
  }
  return deltaY
}

function scrollToSection(el: HTMLElement, smooth: boolean) {
  const top = el.getBoundingClientRect().top + window.scrollY
  window.scrollTo({
    top,
    behavior: smooth ? "smooth" : "auto",
  })
}

/**
 * Homepage wheel/trackpad pager — desktop (lg+) only.
 * Normalizes Firefox line-based wheel deltas; tall sections use native scroll.
 */
export function SectionPager({ children }: { children: React.ReactNode }) {
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)")
  const lockedRef = useRef(false)
  const accumRef = useRef(0)
  const touchYRef = useRef<number | null>(null)
  const unlockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!isDesktop || reducedMotion) return

    const lock = () => {
      lockedRef.current = true
      accumRef.current = 0
      if (unlockTimerRef.current) clearTimeout(unlockTimerRef.current)
      unlockTimerRef.current = setTimeout(() => {
        lockedRef.current = false
      }, LOCK_MS)
    }

    const pageTo = (direction: 1 | -1): boolean => {
      const sections = getSectionElements()
      if (sections.length === 0) return false

      const index = getActiveIndex(sections)
      const target = sections[index + direction]
      if (!target) return false

      lock()
      scrollToSection(target, !reducedMotion)
      history.replaceState(null, "", `#${target.id}`)
      return true
    }

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return

      if (lockedRef.current) {
        event.preventDefault()
        return
      }

      const dy = normalizeWheelDeltaY(event)
      if (dy === 0) return

      const direction: 1 | -1 = dy > 0 ? 1 : -1
      const sections = getSectionElements()
      const index = getActiveIndex(sections)
      const section = sections[index]
      if (!section) return

      // Tall section: never hijack — Firefox needs native wheel here.
      if (sectionHasMore(section, direction)) {
        accumRef.current = 0
        return
      }

      // At section edge: accumulate intent, then page once.
      // Ignore opposite-direction noise from trackpads.
      if (Math.sign(accumRef.current) === -direction) {
        accumRef.current = 0
      }
      accumRef.current += dy

      if (Math.abs(accumRef.current) < PAGE_ACCUM_PX) {
        event.preventDefault()
        return
      }

      accumRef.current = 0
      if (pageTo(direction)) {
        event.preventDefault()
      }
    }

    const onTouchStart = (event: TouchEvent) => {
      touchYRef.current = event.touches[0]?.clientY ?? null
    }

    const onTouchEnd = (event: TouchEvent) => {
      if (touchYRef.current === null || lockedRef.current) {
        touchYRef.current = null
        return
      }

      const endY = event.changedTouches[0]?.clientY
      if (endY === undefined) {
        touchYRef.current = null
        return
      }

      const delta = touchYRef.current - endY
      touchYRef.current = null

      if (Math.abs(delta) < SWIPE_THRESHOLD) return

      const direction: 1 | -1 = delta > 0 ? 1 : -1
      const sections = getSectionElements()
      const index = getActiveIndex(sections)
      const section = sections[index]
      if (section && sectionHasMore(section, direction)) return

      pageTo(direction)
    }

    const onHashChange = () => {
      const id = window.location.hash.replace(/^#/, "")
      if (!HOME_SECTIONS.includes(id as (typeof HOME_SECTIONS)[number])) return
      const el = document.getElementById(id)
      if (!el) return
      lock()
      scrollToSection(el, !reducedMotion)
    }

    if (window.location.hash) {
      requestAnimationFrame(onHashChange)
    }

    window.addEventListener("wheel", onWheel, { passive: false })
    window.addEventListener("touchstart", onTouchStart, { passive: true })
    window.addEventListener("touchend", onTouchEnd, { passive: true })
    window.addEventListener("hashchange", onHashChange)

    return () => {
      window.removeEventListener("wheel", onWheel)
      window.removeEventListener("touchstart", onTouchStart)
      window.removeEventListener("touchend", onTouchEnd)
      window.removeEventListener("hashchange", onHashChange)
      if (unlockTimerRef.current) clearTimeout(unlockTimerRef.current)
    }
  }, [isDesktop, reducedMotion])

  return <>{children}</>
}
