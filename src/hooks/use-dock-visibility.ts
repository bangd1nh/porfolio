"use client"

import { useEffect, useRef, useState } from "react"

import { useMediaQuery } from "@/hooks/use-media-query"

const HEADER_HOTZONE_PX = 64
const SCROLL_DELTA_THRESHOLD = 8
const HIDE_DEBOUNCE_MS = 200

type UseDockVisibilityOptions = {
  /** Force visible while mobile menu is open. */
  menuOpen?: boolean
}

/**
 * Compact sticky-header reveal — desktop only.
 * Shows on scroll up or top-edge hover; hides after deliberate downward scroll.
 */
export function useDockVisibility({ menuOpen = false }: UseDockVisibilityOptions = {}) {
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)")
  const [visible, setVisible] = useState(true)
  const lastScrollY = useRef(0)
  const nearTopRef = useRef(false)
  const menuOpenRef = useRef(menuOpen)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    menuOpenRef.current = menuOpen
  }, [menuOpen])

  useEffect(() => {
    if (!isDesktop || reducedMotion) {
      return
    }

    const clearHideTimer = () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current)
        hideTimerRef.current = null
      }
    }

    const scheduleHide = () => {
      clearHideTimer()
      hideTimerRef.current = setTimeout(() => {
        if (!nearTopRef.current && !menuOpenRef.current) {
          setVisible(false)
        }
      }, HIDE_DEBOUNCE_MS)
    }

    const onScroll = () => {
      const scrollY = window.scrollY
      const delta = scrollY - lastScrollY.current

      if (Math.abs(delta) >= SCROLL_DELTA_THRESHOLD) {
        if (scrollY <= 1 || delta < 0) {
          setVisible(true)
          clearHideTimer()
        } else if (!nearTopRef.current && !menuOpenRef.current) {
          scheduleHide()
        }
        lastScrollY.current = scrollY
      }
    }

    const onMouseMove = (event: MouseEvent) => {
      const isNear = event.clientY <= HEADER_HOTZONE_PX
      nearTopRef.current = isNear
      if (isNear) {
        setVisible(true)
        clearHideTimer()
      } else if (!menuOpenRef.current) {
        scheduleHide()
      }
    }

    lastScrollY.current = window.scrollY
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("mousemove", onMouseMove, { passive: true })

    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("mousemove", onMouseMove)
      clearHideTimer()
    }
  }, [isDesktop, reducedMotion])

  const alwaysVisible = !isDesktop || reducedMotion

  return {
    visible: alwaysVisible || visible || menuOpen,
    alwaysVisible,
  }
}
