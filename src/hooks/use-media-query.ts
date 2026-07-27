"use client"

import { useEffect, useState } from "react"

/**
 * Subscribe to a CSS media query. Returns false until mounted (SSR-safe).
 */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    const update = () => setMatches(media.matches)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [query])

  return matches
}
