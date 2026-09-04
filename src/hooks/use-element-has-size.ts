"use client"

import { useEffect, useState, type RefObject } from "react"

/**
 * True when the element's content box meets a minimum width (ResizeObserver).
 */
export function useElementHasSize(
  ref: RefObject<HTMLElement | null>,
  minWidth = 1,
) {
  const [hasSize, setHasSize] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const update = () => {
      setHasSize(element.clientWidth >= minWidth)
    }

    update()

    const observer = new ResizeObserver(update)
    observer.observe(element)

    return () => observer.disconnect()
  }, [ref, minWidth])

  return hasSize
}
