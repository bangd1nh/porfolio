"use client"

import { useEffect, useRef } from "react"

import { HOME_SECTIONS } from "@/data/site"
import { useMediaQuery } from "@/hooks/use-media-query"
import {
  SECTION_PAGER_LOCK_EVENT,
  SECTION_SCROLL_LOCK_MS,
  scrollToHashSection,
} from "@/lib/scroll-to-section"

const LOCK_MS = SECTION_SCROLL_LOCK_MS
/** Pixel intent before paging — deltaY is already in pixels on all browsers. */
const PAGE_ACCUM_PX = 72
const SWIPE_THRESHOLD = 48
const EDGE_TOLERANCE_PX = 8

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
function sectionHasMore(
  section: HTMLElement,
  direction: 1 | -1,
  tolerance = EDGE_TOLERANCE_PX
): boolean {
  const scrollY = window.scrollY
  const viewportBottom = scrollY + window.innerHeight
  const sectionTop = section.offsetTop
  const sectionBottom = sectionTop + section.offsetHeight

  if (direction > 0) {
    return sectionBottom - viewportBottom > tolerance
  }
  return scrollY - sectionTop > tolerance
}

/**
 * Use deltaY only — do not read deltaMode.
 * Firefox auto-converts LINE deltas to pixels when deltaMode is untouched.
 */
function normalizeWheelDeltaY(event: WheelEvent): number {
  return event.deltaY
}

/**
 * Homepage wheel/trackpad pager — desktop (lg+) only.
 * Tall sections use native scroll; fixed-height sections page on wheel intent.
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
      scrollToHashSection(`#${target.id}`, !reducedMotion)
      return true
    }

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return

      // Ignore wheel while a programmatic scroll runs — do not preventDefault
      // or Firefox/Chrome cancel the in-flight smooth scroll animation.
      if (lockedRef.current) return

      const dy = normalizeWheelDeltaY(event)
      if (dy === 0) return

      const direction: 1 | -1 = dy > 0 ? 1 : -1
      const sections = getSectionElements()
      const index = getActiveIndex(sections)
      const section = sections[index]
      if (!section) return

      if (sectionHasMore(section, direction)) {
        accumRef.current = 0
        return
      }

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
      scrollToHashSection(`#${id}`, !reducedMotion)
    }

    const onPagerLock = () => {
      lock()
    }

    if (window.location.hash) {
      requestAnimationFrame(onHashChange)
    }

    window.addEventListener("wheel", onWheel, { passive: false })
    window.addEventListener("touchstart", onTouchStart, { passive: true })
    window.addEventListener("touchend", onTouchEnd, { passive: true })
    window.addEventListener("hashchange", onHashChange)
    window.addEventListener(SECTION_PAGER_LOCK_EVENT, onPagerLock)

    return () => {
      window.removeEventListener("wheel", onWheel)
      window.removeEventListener("touchstart", onTouchStart)
      window.removeEventListener("touchend", onTouchEnd)
      window.removeEventListener("hashchange", onHashChange)
      window.removeEventListener(SECTION_PAGER_LOCK_EVENT, onPagerLock)
      if (unlockTimerRef.current) clearTimeout(unlockTimerRef.current)
    }
  }, [isDesktop, reducedMotion])

  return <>{children}</>
}
