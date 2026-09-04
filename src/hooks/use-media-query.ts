"use client"

import { useSyncExternalStore } from "react"

function subscribe(query: string, onChange: () => void) {
  const media = window.matchMedia(query)
  media.addEventListener("change", onChange)
  return () => media.removeEventListener("change", onChange)
}

function getSnapshot(query: string) {
  return window.matchMedia(query).matches
}

/**
 * Subscribe to a CSS media query. SSR snapshot is always false.
 */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => subscribe(query, onChange),
    () => getSnapshot(query),
    () => false,
  )
}
