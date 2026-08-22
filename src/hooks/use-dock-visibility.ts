"use client"

import { useEffect, useRef, useState } from "react"

import { useMediaQuery } from "@/hooks/use-media-query"

const DOCK_HOTZONE_PX = 64
const SCROLL_DELTA_THRESHOLD = 8
const HIDE_DEBOUNCE_MS = 200

type UseDockVisibilityOptions = {
  /** Force visible while mobile menu is open. */
  menuOpen?: boolean
}

/**
 * macOS-style dock reveal — desktop only.
 * Shows on scroll down, bottom-edge hover, or dock focus; hides on scroll up.
 */
export function useDockVisibility({ menuOpen = false }: UseDockVisibilityOptions = {}) {
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)")
  const [visible, setVisible] = useState(true)
  const lastScrollY = useRef(0)
  const nearBottomRef = useRef(false)
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
        if (!nearBottomRef.current && !menuOpenRef.current) {
          setVisible(false)
        }
      }, HIDE_DEBOUNCE_MS)
    }

    const onScroll = () => {
      const scrollY = window.scrollY
      const delta = scrollY - lastScrollY.current

      if (Math.abs(delta) >= SCROLL_DELTA_THRESHOLD) {
        if (delta > 0) {
          setVisible(true)
          clearHideTimer()
        } else if (!nearBottomRef.current && !menuOpenRef.current) {
          scheduleHide()
        }
        lastScrollY.current = scrollY
      }
    }

    const onMouseMove = (event: MouseEvent) => {
      const isNear = event.clientY >= window.innerHeight - DOCK_HOTZONE_PX
      nearBottomRef.current = isNear
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
